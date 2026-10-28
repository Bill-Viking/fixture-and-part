import { CANDIDATE_COUNT } from './toyModel.js'

export const REAL_LAYERS = 6
export const REAL_HEADS = 12
export const REAL_HIDDEN = 768
const ATTENTION_OUTPUTS = Array.from(
  { length: REAL_LAYERS },
  (_, layer) => `/transformer/h.${layer}/attn/Softmax_output_0`,
)
/** distilgpt2's token embedding table, the Gather that reads one row per id. */
const EMBED_OUTPUT = '/transformer/wte/Gather_output_0'
// The residual stream at every depth, which is what instrument D reads: the
// sum of the token and position embeddings that enters block 0, then the
// stream as it leaves each block. Seven stops for six layers. A block writes
// its result back into the same running vector, so these are seven readings
// of one thing rather than seven different things.
const RESIDUAL_OUTPUTS = [
  '/transformer/Add_output_0',
  ...Array.from(
    { length: REAL_LAYERS },
    (_, layer) => `/transformer/h.${layer}/Add_1_output_0`,
  ),
]
const PROMOTED_OUTPUTS = [
  ...ATTENTION_OUTPUTS,
  EMBED_OUTPUT,
  ...RESIDUAL_OUTPUTS,
]

/** How many depths the glass pass reads. */
export const RESIDUAL_STOPS = RESIDUAL_OUTPUTS.length

/** How many dimensions of a 768-wide vector the instruments print. */
export const PREVIEW_DIMS = 6
/** The layer whose cached K and V the K/V inspector reads. */
export const KV_LAYER = 0

// ---------------------------------------------------------------------------
// Promoting the softmax nodes to graph outputs
// ---------------------------------------------------------------------------

function varint(value) {
  const bytes = []
  let n = value
  while (n > 127) {
    bytes.push((n & 127) | 128)
    n = Math.floor(n / 128)
  }
  bytes.push(n)
  return bytes
}

/** ValueInfoProto { name, type: { tensor_type: { elem_type: FLOAT } } }. */
function valueInfo(name) {
  const encoded = new TextEncoder().encode(name)
  return [
    0x0a, ...varint(encoded.length), ...encoded,
    0x12, 0x04, 0x0a, 0x02, 0x08, 0x01,
  ]
}

/** ModelProto { graph: { output: [...] } } — merges into the real graph. */
function graphOutputFragment(names) {
  const inner = []
  for (const name of names) {
    const info = valueInfo(name)
    inner.push(0x62, ...varint(info.length), ...info)
  }
  return new Uint8Array([0x3a, ...varint(inner.length), ...inner])
}

const FRAGMENT = graphOutputFragment(PROMOTED_OUTPUTS)

function endsWithFragment(bytes) {
  if (bytes.length < FRAGMENT.length) return false
  const offset = bytes.length - FRAGMENT.length
  for (let i = 0; i < FRAGMENT.length; i++) {
    if (bytes[offset + i] !== FRAGMENT[i]) return false
  }
  return true
}

function withAttentionOutputs(bytes) {
  if (endsWithFragment(bytes)) return bytes
  const out = new Uint8Array(bytes.length + FRAGMENT.length)
  out.set(bytes, 0)
  out.set(FRAGMENT, bytes.length)
  return out
}

const displayCache = new Map()

/**
 * How one BPE piece is printed. GPT-2 marks a word boundary by carrying the
 * space into the token, so a piece that starts with one gets a visible ␣ and
 * a piece without one is a continuation of the word before it — which is the
 * whole teaching point of showing real tokens.
 */
function displayToken(tokenizer, id) {
  const cached = displayCache.get(id)
  if (cached !== undefined) return cached
  const raw = tokenizer.decode([id])
  const shown = (raw.startsWith(' ') ? `␣${raw.slice(1)}` : raw)
    .replace(/\n/g, '⏎')
    .replace(/\t/g, '⇥')
  displayCache.set(id, shown)
  return shown
}

function softmaxInPlace(row) {
  let max = -Infinity
  for (let i = 0; i < row.length; i++) if (row[i] > max) max = row[i]
  let total = 0
  const out = new Float64Array(row.length)
  for (let i = 0; i < row.length; i++) {
    const e = Math.exp(row[i] - max)
    out[i] = e
    total += e
  }
  for (let i = 0; i < row.length; i++) out[i] /= total
  return out
}

/**
 * The two constants that turn a raw logit back into the probability the
 * shortlist prints, without keeping the whole 50,257-wide softmax around:
 * p(id) = exp(logit − max − logSum).
 */
function normalizerOf(row) {
  let max = -Infinity
  for (let i = 0; i < row.length; i++) if (row[i] > max) max = row[i]
  let total = 0
  for (let i = 0; i < row.length; i++) total += Math.exp(row[i] - max)
  return { max, logSum: Math.log(total) }
}

// Greedy distilgpt2 on a short prompt often collapses into predicting "\n"
// forever — real behavior, but it reads as a broken instrument. Tokens whose
// text is nothing but whitespace are skipped, along with <|endoftext|>, and
// the UI's sampling label says so.
const END_OF_TEXT_ID = 50256

function isSkippedToken(tokenizer, id) {
  if (id === END_OF_TEXT_ID) return true
  return /^\s*$/.test(tokenizer.decode([id]))
}

function topCandidates(tokenizer, logitsRow, probs, count) {
  // Gather extra, then drop the skipped ones, so the shortlist stays full
  // even when a whitespace token would have ranked in it.
  const gather = count + 8
  const best = []
  for (let id = 0; id < probs.length; id++) {
    const p = probs[id]
    if (best.length < gather) {
      best.push({ id, p })
      if (best.length === gather) best.sort((a, b) => b.p - a.p)
    } else if (p > best[best.length - 1].p) {
      best[best.length - 1] = { id, p }
      best.sort((a, b) => b.p - a.p)
    }
  }
  best.sort((a, b) => b.p - a.p)
  return best
    .filter((entry) => !isSkippedToken(tokenizer, entry.id))
    .slice(0, count)
    .map((entry, i) => ({
      id: entry.id,
      token: displayToken(tokenizer, entry.id),
      score: logitsRow[entry.id],
      weight: entry.p,
      wins: i === 0,
    }))
}

/**
 * The numbers behind an output tensor, wherever the runtime put them.
 *
 * On the WASM backend every output lands in CPU memory and `.data` is right
 * there. On WebGPU some of them — the `present.*` cache tensors in
 * particular — stay in GPU buffers and have to be downloaded first, so
 * reading `.data` throws. We only read each output once per pass, so the GPU
 * copy is released on the way out.
 */
async function tensorData(tensor) {
  const location = tensor.location
  if (location && location !== 'cpu' && location !== 'cpu-pinned') {
    return tensor.getData(true)
  }
  return tensor.data
}

/** Reads `PREVIEW_DIMS` numbers per token out of a [1, n, width] block. */
function previewRows(data, width, n) {
  const rows = []
  for (let i = 0; i < n; i++) {
    const row = []
    for (let d = 0; d < PREVIEW_DIMS; d++) row.push(data[i * width + d])
    rows.push(row)
  }
  return rows
}

/** The two int64 tensors the no-cache decoder graph takes. */
function feedFor(Tensor, ids) {
  const n = ids.length
  return {
    input_ids: new Tensor(
      'int64',
      BigInt64Array.from(ids, (v) => BigInt(v)),
      [1, n],
    ).ort_tensor,
    attention_mask: new Tensor(
      'int64',
      new BigInt64Array(n).fill(1n),
      [1, n],
    ).ort_tensor,
  }
}

export {
  ATTENTION_OUTPUTS, EMBED_OUTPUT, RESIDUAL_OUTPUTS, PROMOTED_OUTPUTS, FRAGMENT,
  graphOutputFragment, withAttentionOutputs, feedFor, tensorData, previewRows,
  normalizerOf, isSkippedToken, topCandidates, displayToken,
}

// The session adapter supplies its runtime’s Tensor constructor; feedFor stays shared.
export async function runPass(session, tokenizer, ids) {
  const key = ids.join(',')
  const { Tensor } = session
    const n = ids.length
    if (n === 0) {
      return {
        key: '', ids: [], tokens: [], n: 0,
        candidates: [], attention: [], embeddings: [], k: [], v: [],
        residuals: [], lastLogits: null, lastNorm: null,
      }
    }
    const outputs = await session.run(feedFor(Tensor, ids))

    const logits = outputs.logits
    const vocab = logits.dims[2]
    const logitData = await tensorData(logits)
    const lastRow = logitData.subarray((n - 1) * vocab, n * vocab)
    const probs = softmaxInPlace(lastRow)
    const candidates = topCandidates(tokenizer, lastRow, probs, CANDIDATE_COUNT)

    // Copied out of the runtime's own buffers, which it is free to reuse.
    const attention = []
    for (const name of ATTENTION_OUTPUTS) {
      attention.push(new Float32Array(await tensorData(outputs[name])))
    }

    const embedTensor = outputs[EMBED_OUTPUT]
    const embeddings = previewRows(
      await tensorData(embedTensor),
      embedTensor.dims[embedTensor.dims.length - 1],
      n,
    )
    // A cached K or V is [1, heads, n, head_dim]. The heads partition the
    // 768-wide vector, so head 0's first numbers are the vector's first
    // numbers.
    const keyTensor = outputs[`present.${KV_LAYER}.key`]
    const valueTensor = outputs[`present.${KV_LAYER}.value`]
    const k = previewRows(await tensorData(keyTensor), keyTensor.dims[3], n)
    const v = previewRows(await tensorData(valueTensor), valueTensor.dims[3], n)

    // The whole stream, all seven depths, full width — n x 768 per stop, so
    // under a megabyte at the lengths this page runs. The glass pass prints
    // six of those numbers and sends all 768 to the lens, and neither can be
    // reconstructed from a preview, so the rows are kept whole.
    const residuals = []
    for (const name of RESIDUAL_OUTPUTS) {
      residuals.push(new Float32Array(await tensorData(outputs[name])))
    }

    return {
      key,
      ids: ids.slice(),
      tokens: ids.map((id) => displayToken(tokenizer, id)),
      n,
      vocab,
      candidates,
      attention,
      embeddings,
      k,
      v,
      residuals,
      // The last position's logits, kept whole so the sampler can work from
      // the model's own scores rather than from the four the shortlist
      // prints. 50,257 floats — 200 KB, against the megabyte of residual
      // stream already held here.
      lastLogits: new Float32Array(lastRow),
      lastNorm: normalizerOf(lastRow),
    }
}
