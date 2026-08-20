// Phase 2 — the real machine.
//
// Wraps transformers.js around `Xenova/distilgpt2` so instruments A, B and C
// can be driven by real numbers instead of the illustrative ones in
// toyModel.js. Nothing here is imported at module load: `loadModel()` is the
// only entry point that pulls the library in, and it does so with a dynamic
// import so the page ships and runs with zero ML code fetched.
//
// One wrinkle is worth explaining, because it is the reason this file is
// longer than a thin wrapper would be.
//
// The published ONNX export of distilgpt2 declares only `logits` and the
// `present.*` KV tensors as graph outputs. The attention probabilities and the
// embedding lookup exist inside the graph — one `Softmax` node per layer, one
// `Gather` on the token embedding table — but ONNX Runtime will only hand back
// tensors that the graph names as outputs, so `output_attentions` has nothing
// to read. Rather than fake those numbers we promote the nodes to graph
// outputs before the session is created: protobuf messages merge when
// concatenated, so appending a tiny fragment that declares `graph.output`
// entries to the end of the model bytes adds them without re-encoding the
// 83 MB file.
//
// What that buys, and it is worth being exact about it, is that in real mode
// the page shows the model's own numbers rather than stand-ins: the embedding
// out of its lookup table, the keys and values out of its layer-0 cache, the
// next-token probabilities out of its logits, and the attention matrix out of
// whichever layer and head is selected. The only illustrative things left are
// the rack drawing and the sweep, which are diagrams of a mechanism rather
// than readings from it.

import { CANDIDATE_COUNT, MAX_GENERATED } from './toyModel.js'

export const MODEL_ID = 'Xenova/distilgpt2'
export const REAL_LAYERS = 6
export const REAL_HEADS = 12
export const REAL_HIDDEN = 768
/** The sampling rule instrument B uses in real mode, named in the UI. */
export const SAMPLING = 'greedy · whitespace skipped'

// The no-cache decoder graph: input_ids + attention_mask in, logits out. We
// re-run the whole sequence on every step rather than carrying a KV cache,
// which costs nothing at these lengths and gives instrument C the full
// [query x key] attention matrix instead of only the newest row.
const MODEL_FILE = 'decoder_model'
const MODEL_DTYPE = 'q8'
/**
 * The one file the fetch patch rewrites — and the one the lens worker reads
 * back out of the cache instead of downloading a second copy.
 */
export const ONNX_FILE = 'decoder_model_quantized.onnx'

// Our own cache bucket, so a patched model can never be confused with an
// unpatched one left behind by some other page on the same origin. Bump the
// version whenever PROMOTED_OUTPUTS changes: the cached copy carries the
// fragment that was current when it was written.
export const CACHE_KEY = 'fixture-and-part-distilgpt2-v3'
// Buckets an earlier fragment wrote. Nothing will ever read them again, and
// each one holds 83 MB, so the load drops them on its way past.
const STALE_CACHE_KEYS = ['fixture-and-part-distilgpt2-v2']

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

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/** @type {{tokenizer:any, session:any, Tensor:any, backend:string}|null} */
let ready = null
/** @type {Promise<any>|null} */
let inFlight = null
let progressSink = () => {}

export function isReady() {
  return ready !== null
}

export function backendName() {
  return ready ? ready.backend : null
}

async function pickDevice() {
  try {
    if (typeof navigator !== 'undefined' && navigator.gpu) {
      const adapter = await navigator.gpu.requestAdapter()
      if (adapter) return 'webgpu'
    }
  } catch {
    // No adapter, or the call threw. WASM handles it.
  }
  return 'wasm'
}

function isRangeRequest(init) {
  const headers = init?.headers
  if (!headers) return false
  if (typeof headers.get === 'function') return Boolean(headers.get('Range'))
  return Boolean(headers.Range || headers.range)
}

/**
 * Streams the model file so the load button can show real bytes, and hands
 * back the patched bytes so the session is created with the attention
 * outputs declared. transformers.js caches whatever this returns, so the
 * patch survives into the browser cache and the second load is a cache read.
 */
function installFetchPatch(env) {
  if (env.__fixtureFetchPatched) return
  const base = env.fetch ?? globalThis.fetch.bind(globalThis)
  env.__fixtureFetchPatched = true
  env.fetch = async (input, init) => {
    const url = String(input?.url ?? input)
    if (!url.endsWith(ONNX_FILE) || isRangeRequest(init)) {
      return base(input, init)
    }
    const response = await base(input, init)
    if (!response.ok || !response.body) return response

    const total = Number(response.headers.get('content-length')) || 0
    const reader = response.body.getReader()
    const chunks = []
    let loaded = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      loaded += value.length
      progressSink({
        phase: 'model',
        loaded,
        total,
        percent: total ? Math.min(99, Math.round((loaded / total) * 100)) : 0,
      })
    }
    const bytes = new Uint8Array(loaded)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.length
    }
    const patched = withAttentionOutputs(bytes)
    progressSink({ phase: 'session', loaded, total, percent: 100 })
    return new Response(patched, {
      status: 200,
      headers: {
        'content-type': 'application/octet-stream',
        'content-length': String(patched.length),
      },
    })
  }
}

async function build(device, transformers) {
  const { AutoTokenizer, AutoModelForCausalLM, Tensor } = transformers
  const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID)
  progressSink({ phase: 'model', loaded: 0, total: 0, percent: 0 })
  const model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
    dtype: MODEL_DTYPE,
    model_file_name: MODEL_FILE,
    device,
  })
  const session = model.sessions?.model
  if (!session) throw new Error('no inference session was created')
  const missing = PROMOTED_OUTPUTS.filter(
    (name) => !session.outputNames.includes(name),
  )
  if (missing.length > 0) {
    throw new Error(`the model graph is missing outputs: ${missing.join(', ')}`)
  }
  return { tokenizer, session, Tensor, backend: device }
}

function dropStaleCaches() {
  if (typeof caches === 'undefined') return
  for (const key of STALE_CACHE_KEYS) {
    caches.delete(key).catch(() => {
      // The bucket was already gone, or storage said no. Either way the load
      // is not waiting on it.
    })
  }
}

async function doLoad() {
  const transformers = await import('@huggingface/transformers')
  const { env } = transformers
  env.allowLocalModels = false
  env.cacheKey = CACHE_KEY
  dropStaleCaches()
  installFetchPatch(env)

  progressSink({ phase: 'files', loaded: 0, total: 0, percent: 0 })
  const device = await pickDevice()
  try {
    return await build(device, transformers)
  } catch (err) {
    if (device === 'wasm') throw err
    // WebGPU refused the graph. The download is cached by now, so the
    // second attempt only rebuilds the session.
    progressSink({ phase: 'session', loaded: 0, total: 0, percent: 100 })
    return build('wasm', transformers)
  }
}

/**
 * Loads the tokenizer and distilgpt2. Idempotent: the second call resolves
 * immediately with the same handle. Never throws synchronously — every
 * failure comes back as a rejected promise.
 *
 * @param {(p:{phase:string,loaded:number,total:number,percent:number})=>void} [onProgress]
 */
export function loadModel(onProgress) {
  if (typeof onProgress === 'function') progressSink = onProgress
  if (ready) return Promise.resolve(ready)
  if (!inFlight) {
    inFlight = doLoad()
      .then((built) => {
        ready = built
        return built
      })
      .catch((err) => {
        inFlight = null
        throw err instanceof Error ? err : new Error(String(err))
      })
  }
  return inFlight
}

function requireReady() {
  if (!ready) throw new Error('the real model is not loaded')
  return ready
}

// ---------------------------------------------------------------------------
// Tokenizing
// ---------------------------------------------------------------------------

const displayCache = new Map()
const embeddingCache = new Map()

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

/** Real GPT-2 BPE. Returns ids and their printable pieces. */
export async function realTokenize(text) {
  const { tokenizer } = requireReady()
  if (!text) return { ids: [], tokens: [] }
  const encoded = await tokenizer(text, { add_special_tokens: false })
  const ids = Array.from(encoded.input_ids.data, Number)
  return { ids, tokens: ids.map((id) => displayToken(tokenizer, id)) }
}

/** The printable piece for one id, for tokens appended by generation. */
export function tokenText(id) {
  const { tokenizer } = requireReady()
  return displayToken(tokenizer, id)
}

// ---------------------------------------------------------------------------
// One forward pass
// ---------------------------------------------------------------------------

// WASM sessions do not like overlapping runs, so every pass queues behind the
// one before it.
let chain = Promise.resolve()
function serialize(task) {
  const next = chain.then(task, task)
  chain = next.then(
    () => undefined,
    () => undefined,
  )
  return next
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

// One-entry memo. The stepper asks for the pass it is about to commit and the
// effect that drives instrument C asks for the same one; this keeps that to a
// single run of the model.
let lastRun = null

/**
 * Runs distilgpt2 over the whole sequence once. The result carries everything
 * the four instruments need: real embeddings for A, the next-token shortlist
 * and layer-0 K/V for B, the full attention matrix — all layers, all heads —
 * for C, and the residual stream at all seven depths for D.
 *
 * @param {number[]} ids
 */
export function realForward(ids) {
  const key = ids.join(',')
  if (lastRun && lastRun.key === key) return Promise.resolve(lastRun)
  return serialize(async () => {
    if (lastRun && lastRun.key === key) return lastRun
    const { session, Tensor, tokenizer } = requireReady()
    const n = ids.length
    if (n === 0) {
      return {
        key: '', ids: [], tokens: [], n: 0,
        candidates: [], attention: [], embeddings: [], k: [], v: [],
        residuals: [],
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

    // The embedding table is a lookup, so a piece's vector is the same
    // wherever it lands. Remembering it keeps instrument A populated while a
    // later pass is still running.
    for (let i = 0; i < n; i++) embeddingCache.set(ids[i], embeddings[i])

    lastRun = {
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
    }
    return lastRun
  })
}

/**
 * The graph's own logits row for one position.
 *
 * A pass does not keep the full [n x 50257] block — it is eight megabytes at
 * these lengths and nothing on the page reads it — so this runs the model
 * again and copies out the single row asked for. It exists to check the glass
 * pass against the machine it claims to be reading; see logitLens.js.
 *
 * @param {number[]} ids
 * @param {number} index
 */
export function graphLogitsRow(ids, index) {
  return serialize(async () => {
    const { session, Tensor } = requireReady()
    if (ids.length === 0) return null
    const i = Math.min(Math.max(index, 0), ids.length - 1)
    const outputs = await session.run(feedFor(Tensor, ids))
    const logits = outputs.logits
    const vocab = logits.dims[2]
    const data = await tensorData(logits)
    return new Float32Array(data.subarray(i * vocab, (i + 1) * vocab))
  })
}

/** The real embedding row for one id, once any pass has seen it. */
export function realEmbedding(id) {
  return embeddingCache.get(id) ?? null
}

/**
 * `PREVIEW_DIMS` numbers off the residual stream at one depth and one
 * position — what instrument D prints beside each stop.
 */
export function residualPreview(run, stop, index) {
  const data = run?.residuals?.[stop]
  if (!data || index < 0 || index >= run.n) return null
  const out = []
  const base = index * REAL_HIDDEN
  for (let d = 0; d < PREVIEW_DIMS; d++) out.push(data[base + d])
  return out
}

/**
 * All seven stops at one position, full width, packed end to end — the block
 * the lens worker consumes. Its buffer is handed straight to the worker, so
 * it is a fresh copy rather than a view into the pass.
 */
export function residualStops(run, index) {
  if (!run?.residuals?.length || index < 0 || index >= run.n) return null
  const out = new Float32Array(RESIDUAL_STOPS * REAL_HIDDEN)
  for (let s = 0; s < RESIDUAL_STOPS; s++) {
    const base = index * REAL_HIDDEN
    out.set(run.residuals[s].subarray(base, base + REAL_HIDDEN), s * REAL_HIDDEN)
  }
  return out
}

/**
 * Real vectors print to two places, not one. distilgpt2's embedding numbers
 * sit around a tenth, so one decimal would round most of a row to the same
 * ±0.1 and hide exactly the differences the preview is there to show.
 */
export function formatRealVector(vec) {
  return (
    '[' +
    vec
      .map((v) => {
        const s = v.toFixed(2)
        return s === '-0.00' ? '0.00' : s
      })
      .join(', ') +
    ']'
  )
}

// ---------------------------------------------------------------------------
// Reading a completed pass
// ---------------------------------------------------------------------------

/** The next-token shortlist, same shape as toyModel's nextCandidates. */
export function candidatesFrom(run) {
  return run ? run.candidates : []
}

/** The token a real STEP commits: the highest-probability one (greedy). */
export function nextTokenFrom(run, generatedCount) {
  if (!run || generatedCount >= MAX_GENERATED) return null
  return run.candidates.length > 0 ? run.candidates[0] : null
}

/**
 * One head's view of one lookup, straight from the model's softmax.
 *
 * Rows are shaped like toyModel's attention() so instrument C renders them
 * unchanged, with two honest differences. The query attends to itself in a
 * real transformer, so its own row is included and the weights across the
 * rows sum to 1. And the raw Q·K scores are not recoverable from the
 * probabilities on their own — softmax throws away the additive constant —
 * so `score` is the score relative to the strongest row, which is exactly
 * what the differences between the weights encode.
 */
export function attentionRows(run, layer, head, queryIndex) {
  if (!run || run.n === 0) return []
  const q = Math.min(Math.max(queryIndex, 0), run.n - 1)
  const data = run.attention[Math.min(Math.max(layer, 0), REAL_LAYERS - 1)]
  const h = Math.min(Math.max(head, 0), REAL_HEADS - 1)
  const base = (h * run.n + q) * run.n
  const rows = []
  let max = 0
  for (let i = 0; i <= q; i++) {
    const weight = data[base + i]
    if (weight > max) max = weight
    rows.push({
      index: i,
      token: run.tokens[i],
      k: `id ${run.ids[i]}`,
      weight,
      score: 0,
    })
  }
  for (const row of rows) {
    row.score = row.weight > 0 && max > 0 ? Math.log(row.weight / max) : -Infinity
  }
  return rows
}

// ---------------------------------------------------------------------------
// Convenience wrappers — one call, text in, numbers out
// ---------------------------------------------------------------------------

/** Top next-token candidates for `text`, with real softmax probabilities. */
export async function realNextCandidates(text) {
  const { ids } = await realTokenize(text)
  const run = await realForward(ids)
  return candidatesFrom(run)
}

/** Attention weights for one layer, head and query position. */
export async function realAttention(text, layer, head, queryIndex) {
  const { ids } = await realTokenize(text)
  const run = await realForward(ids)
  return attentionRows(run, layer, head, queryIndex)
}

/**
 * Greedy continuation of `text`, capped by the same MAX_GENERATED ceiling
 * instrument B uses. Returns the appended pieces and their ids.
 */
export async function realGenerate(text, count = MAX_GENERATED) {
  const { ids } = await realTokenize(text)
  const limit = Math.min(count, MAX_GENERATED)
  const sequence = ids.slice()
  const tokens = []
  for (let i = 0; i < limit; i++) {
    const run = await realForward(sequence)
    const next = nextTokenFrom(run, i)
    if (!next) break
    sequence.push(next.id)
    tokens.push(next.token)
  }
  return { ids: sequence.slice(ids.length), tokens, text: tokens.join('') }
}
