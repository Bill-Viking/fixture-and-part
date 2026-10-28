import { COMPANY, loadTransformers } from './company.js'
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

import { MAX_GENERATED } from './toyModel.js'
import {
  REAL_LAYERS, REAL_HEADS, REAL_HIDDEN, RESIDUAL_STOPS, PROMOTED_OUTPUTS,
  withAttentionOutputs, displayToken, isSkippedToken, feedFor, tensorData, runPass,
} from './passCore.js'
export {
  REAL_LAYERS, REAL_HEADS, REAL_HIDDEN, RESIDUAL_STOPS, PREVIEW_DIMS, KV_LAYER,
} from './passCore.js'

export const MODEL_ID = 'Xenova/distilgpt2'

/**
 * The two decoding rules instrument B offers in real mode, and the numbers
 * behind the sampled one.
 *
 * Greedy takes the top token every time. On a six-block model that is how you
 * get "the tree of the tree of the tree": the top token after "of the" is
 * "tree" again, and nothing in greedy decoding can break the cycle. The
 * sampled rule is the standard three-part answer to that — a temperature that
 * flattens the distribution slightly, a top-k that throws away the long tail
 * before drawing, and a penalty on tokens the sequence has already used.
 *
 * The seed is fixed and the draw is a pure function of it and of the step
 * number, so the same prompt gives the same continuation every time and RESET
 * replays it exactly. Nothing here is random between reloads.
 */
export const DECODING = {
  temperature: 0.8,
  topK: 40,
  repetitionPenalty: 1.3,
  seed: 7,
}

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
  if (COMPANY) return undefined
  const transformers = await loadTransformers()
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
  if (COMPANY) return Promise.resolve(null)
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

const embeddingCache = new Map()

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
    const run = await runPass({ Tensor, run: (feeds) => session.run(feeds) }, tokenizer, ids)
    if (run.n === 0) return run
    const { n, embeddings } = run

    // The embedding table is a lookup, so a piece's vector is the same
    // wherever it lands. Remembering it keeps instrument A populated while a
    // later pass is still running.
    for (let i = 0; i < n; i++) embeddingCache.set(ids[i], embeddings[i])

    lastRun = run
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

// ---------------------------------------------------------------------------
// Decoding — how the next token is picked out of the distribution
// ---------------------------------------------------------------------------

/**
 * mulberry32. Thirty-two bits of state, one multiply-xor round, and a
 * distribution good enough for one draw per token — which is all this page
 * ever asks of it.
 */
function mulberry32(seed) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * The draw for one step, as a pure function of the seed and the step number
 * rather than of a running generator state.
 *
 * That is deliberate. A generator carried across steps would have to be
 * rewound by RESET, and rewound to exactly the right place, or the second run
 * of a sequence would not reproduce the first. Deriving the draw instead
 * makes replay free: step 3 of seed 7 is the same number whether it is the
 * third token of this run or of the run before it.
 */
function drawFor(seed, step) {
  const rng = mulberry32((Math.imul(seed, 0x9e3779b1) + Math.imul(step, 0x85ebca6b)) | 0)
  rng()
  return rng()
}

/** The probability the shortlist would print for one id, out of a finished pass. */
export function rawProbability(run, id) {
  if (!run?.lastLogits || !run.lastNorm) return 0
  return Math.exp(run.lastLogits[id] - run.lastNorm.max - run.lastNorm.logSum)
}

/**
 * The `topK` best-scoring tokens after the repetition penalty and the
 * temperature, with whitespace-only pieces and <|endoftext|> dropped.
 *
 * Extra are gathered before the drop, for the same reason the shortlist
 * gathers extra: a newline ranking second must not cost the draw one of its
 * forty real options.
 */
function penalizedTop(tokenizer, logits, seen, topK) {
  const { temperature, repetitionPenalty } = DECODING
  const gather = topK + 16
  const best = []
  let floor = -Infinity
  for (let id = 0; id < logits.length; id++) {
    let logit = logits[id]
    if (seen.has(id)) {
      logit = logit > 0 ? logit / repetitionPenalty : logit * repetitionPenalty
    }
    const adjusted = logit / temperature
    if (best.length < gather) {
      best.push({ id, adjusted })
      if (best.length === gather) {
        best.sort((a, b) => b.adjusted - a.adjusted)
        floor = best[gather - 1].adjusted
      }
    } else if (adjusted > floor) {
      best[gather - 1] = { id, adjusted }
      best.sort((a, b) => b.adjusted - a.adjusted)
      floor = best[gather - 1].adjusted
    }
  }
  best.sort((a, b) => b.adjusted - a.adjusted)
  return best.filter((entry) => !isSkippedToken(tokenizer, entry.id)).slice(0, topK)
}

/**
 * The token a real STEP commits, under whichever decoding rule is selected.
 *
 * `greedy` is exactly what instrument B did before this control existed: the
 * top row of the shortlist, unchanged. `sampled` works from the model's own
 * logits — repetition penalty over everything already in the sequence, then
 * temperature, then top-k, then one seeded draw.
 *
 * The result carries both the token chosen and the token that would have won
 * on probability alone, so the instrument can say which of the two happened
 * without recomputing anything.
 *
 * @param {object} run       a finished forward pass
 * @param {number[]} context the ids the sequence already holds
 * @param {'sampled'|'greedy'} mode
 * @param {number} step      how many tokens have been generated so far
 */
export function chooseNext(run, context, mode, step) {
  if (!run || !run.candidates || run.candidates.length === 0) return null
  const top = run.candidates[0]
  if (mode !== 'sampled' || !run.lastLogits) {
    return { ...top, sampled: false, top }
  }
  const { tokenizer } = requireReady()
  const shortlist = penalizedTop(
    tokenizer,
    run.lastLogits,
    new Set(context),
    DECODING.topK,
  )
  if (shortlist.length === 0) return { ...top, sampled: false, top }

  let total = 0
  const weights = shortlist.map((entry) => {
    const w = Math.exp(entry.adjusted - shortlist[0].adjusted)
    total += w
    return w
  })
  let draw = drawFor(DECODING.seed, step) * total
  let chosen = shortlist[shortlist.length - 1]
  for (let i = 0; i < shortlist.length; i++) {
    draw -= weights[i]
    if (draw <= 0) {
      chosen = shortlist[i]
      break
    }
  }
  return {
    id: chosen.id,
    token: displayToken(tokenizer, chosen.id),
    score: run.lastLogits[chosen.id],
    weight: rawProbability(run, chosen.id),
    wins: true,
    sampled: true,
    top,
  }
}

/**
 * What one repeated token's logit looks like before and after the penalty —
 * the check that the penalty is applied rather than merely configured. Dev
 * console only; nothing on the page calls it.
 */
export function penaltyTrace(run, context, id) {
  if (!run?.lastLogits) return null
  const raw = run.lastLogits[id]
  const repeated = context.includes(id)
  const penalized = repeated
    ? raw > 0
      ? raw / DECODING.repetitionPenalty
      : raw * DECODING.repetitionPenalty
    : raw
  return { id, token: tokenText(id), repeated, raw, penalized }
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
 * Continuation of `text` under one of the two decoding rules, capped by the
 * same MAX_GENERATED ceiling instrument B uses. Returns the appended pieces
 * and their ids.
 *
 * Steps through the same `chooseNext` the instrument does, so a continuation
 * taken here and one taken by pressing RUN are the same tokens.
 */
export async function realGenerate(text, count = MAX_GENERATED, mode = 'greedy') {
  const { ids } = await realTokenize(text)
  const limit = Math.min(count, MAX_GENERATED)
  const sequence = ids.slice()
  const tokens = []
  for (let i = 0; i < limit; i++) {
    const run = await realForward(sequence)
    const next = chooseNext(run, sequence, mode, i)
    if (!next) break
    sequence.push(next.id)
    tokens.push(next.token)
  }
  return { ids: sequence.slice(ids.length), tokens, text: tokens.join('') }
}
