// The model file, off the main thread.
//
// One worker, two readers, and one copy of an 83 MB file between them.
//
// Instrument E reads the file as a file: the manifest of its tensors, a
// window of raw bytes out of one of them, the distribution of a whole one.
// Instrument D reads it as a model: the quantized embedding table and the
// final LayerNorm, which together are the logit lens. Both want the same
// bytes, and a second worker would mean a second 83 MB, so they share this
// one and take their turns in one queue.
//
// One copy, and the order they ask in does not change that. Whichever client
// gets here first pulls the file in and it is kept; everything either of them
// holds afterwards is a view into those same bytes, not a second copy of part
// of them. That costs a lens-only reader the difference between holding the
// 38.6 MB table and holding the whole file — and saves a reader who uses both
// instruments, which on this page is the ordinary case, from holding 121 MB.
//
// The worker never downloads anything if it can help it: the model file is
// already in the cache bucket the page wrote when it loaded distilgpt2, so it
// opens that bucket, finds the request whose URL ends in the ONNX file name,
// and reads the bytes back. Only if that fails does it fall back to the
// network.
//
// ---------------------------------------------------------------------------
// The lens
// ---------------------------------------------------------------------------
//
// A lens reading is the residual stream at one depth pushed through the two
// pieces of machinery that sit at the very end of the stack: the final
// LayerNorm, and the unembedding — which in GPT-2 is the token embedding
// table used backwards, one dot product per row. That is 50,257 dot products
// of 768 numbers per depth, seven depths per reading. Roughly 270 million
// multiply-adds, which is a third of a second of arithmetic and would be a
// third of a second of frozen page if it ran on the main thread.
//
// ONNX Runtime will not hand out an initializer, so the four tensors this
// needs — the quantized embedding table and its two dequantization constants,
// plus the final LayerNorm's gain and bias — are pulled straight out of the
// protobuf by walking its fields and matching initializers by name. By name,
// never by offset: an offset is only true of the file as it was uploaded on
// one particular day.
//
// The table is quantized to bytes, so a lens logit is not a plain dot
// product. With w[r][d] = scale * (q[r][d] - zeroPoint), a row's logit for a
// normalized hidden vector h is
//
//   logit_r = scale * ( sum_d h[d]*q[r][d]  -  zeroPoint * sum_d h[d] )
//
// which is one pass over the bytes plus a single correction computed once per
// depth. That is exactly the arithmetic the graph's own lm_head performs, so
// the last stop reproduces the model's own logits row for the position — the
// identity instrument D is built to show.

import {
  findInitializers,
  histogramOf,
  scalarFloat,
  scalarInt,
  scanManifest,
  vectorFloats,
  windowOf,
} from './onnxScan.js'

const HIDDEN = 768
// GPT-2's layer_norm_epsilon. It sits inside the square root, as PyTorch and
// ONNX both put it.
const LN_EPS = 1e-5

const WANTED = {
  table: 'transformer.wte.weight_quantized',
  scale: 'transformer.wte.weight_scale',
  zeroPoint: 'transformer.wte.weight_zero_point',
  gain: 'transformer.ln_f.weight',
  bias: 'transformer.ln_f.bias',
}

/** @type {{table:Uint8Array,scale:number,zeroPoint:number,gain:Float32Array,bias:Float32Array,vocab:number}|null} */
let parts = null

// The whole file, kept from the first request that needs it, whichever
// instrument that request came from.
/** @type {Uint8Array|null} */
let held = null
/** @type {ReturnType<typeof scanManifest>|null} */
let manifest = null
/** @type {string|null} */
let sha = null

// ---------------------------------------------------------------------------
// Getting the file
// ---------------------------------------------------------------------------

async function modelBytes({ cacheKey, onnxFile, fallbackUrl }) {
  try {
    const cache = await caches.open(cacheKey)
    for (const request of await cache.keys()) {
      if (!request.url.endsWith(onnxFile)) continue
      const cached = await cache.match(request)
      if (cached) return new Uint8Array(await cached.arrayBuffer())
    }
  } catch {
    // No Cache API, or the bucket has been evicted. The network still has it.
  }
  const response = await fetch(fallbackUrl)
  if (!response.ok) {
    throw new Error(`the model file could not be read (${response.status})`)
  }
  return new Uint8Array(await response.arrayBuffer())
}

function hex(buffer) {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * The file's hash — of the file as published, not as cached.
 *
 * The copy in the browser's cache has our own promoted-outputs fragment
 * appended to it, so hashing all of it would answer a question nobody asked.
 * `manifest.bytes` is where the published file ends, which is where this
 * stops.
 */
async function digest(bytes, length) {
  if (typeof crypto === 'undefined' || !crypto.subtle) return null
  const buffer = await crypto.subtle.digest('SHA-256', bytes.subarray(0, length))
  return hex(buffer)
}

/** The file, fetched once and then kept. */
async function bytesOf(config) {
  if (!held) held = await modelBytes(config)
  return held
}

/** The file, the walk of it, and its hash — each done once. */
async function fileState(config) {
  const bytes = await bytesOf(config)
  if (!manifest) {
    manifest = scanManifest(bytes)
    sha = await digest(bytes, manifest.bytes)
  }
  return { bytes, manifest, sha }
}

// ---------------------------------------------------------------------------
// The lens's four tensors
// ---------------------------------------------------------------------------

async function init(config) {
  if (parts) return
  // The table is a view into the retained file, never a copy of it, and that
  // is true whether instrument E asked first or the lens did.
  const bytes = await bytesOf(config)
  const names = new Set(Object.values(WANTED))
  const found = findInitializers(bytes, names)
  for (const name of names) {
    if (!found.has(name)) throw new Error(`the model file has no ${name}`)
  }
  const table = found.get(WANTED.table)
  if (!table.raw) throw new Error(`${WANTED.table} is not stored as raw bytes`)
  const quantized = bytes.subarray(table.raw[0], table.raw[1])
  const vocab = table.dims[0] || quantized.length / HIDDEN
  if (quantized.length !== vocab * HIDDEN) {
    throw new Error(
      `the embedding table is ${quantized.length} bytes, not ${vocab * HIDDEN}`,
    )
  }
  parts = {
    table: quantized,
    scale: scalarFloat(bytes, found.get(WANTED.scale)),
    zeroPoint: scalarInt(bytes, found.get(WANTED.zeroPoint)),
    gain: vectorFloats(bytes, found.get(WANTED.gain)),
    bias: vectorFloats(bytes, found.get(WANTED.bias)),
    vocab,
  }
}

// ---------------------------------------------------------------------------
// The lens reading itself
// ---------------------------------------------------------------------------

function layerNorm(source, offset, out) {
  const { gain, bias } = parts
  let mean = 0
  for (let d = 0; d < HIDDEN; d++) mean += source[offset + d]
  mean /= HIDDEN
  let variance = 0
  for (let d = 0; d < HIDDEN; d++) {
    const centred = source[offset + d] - mean
    variance += centred * centred
  }
  variance /= HIDDEN
  const inverse = 1 / Math.sqrt(variance + LN_EPS)
  for (let d = 0; d < HIDDEN; d++) {
    out[d] = (source[offset + d] - mean) * inverse * gain[d] + bias[d]
  }
}

function lensLogits(hidden, out) {
  const { table, scale, zeroPoint, vocab } = parts
  let total = 0
  for (let d = 0; d < HIDDEN; d++) total += hidden[d]
  const correction = zeroPoint * total
  for (let row = 0; row < vocab; row++) {
    const base = row * HIDDEN
    let sum = 0
    for (let d = 0; d < HIDDEN; d++) sum += hidden[d] * table[base + d]
    out[row] = scale * (sum - correction)
  }
}

/** max and the softmax denominator, which together price any single row. */
function softmaxStats(logits) {
  let max = -Infinity
  for (let i = 0; i < logits.length; i++) if (logits[i] > max) max = logits[i]
  let denominator = 0
  for (let i = 0; i < logits.length; i++) denominator += Math.exp(logits[i] - max)
  return { max, denominator }
}

function topRows(logits, count) {
  const best = []
  for (let id = 0; id < logits.length; id++) {
    const value = logits[id]
    if (best.length < count) {
      best.push({ id, logit: value })
      if (best.length === count) best.sort((a, b) => b.logit - a.logit)
    } else if (value > best[count - 1].logit) {
      best[count - 1] = { id, logit: value }
      best.sort((a, b) => b.logit - a.logit)
    }
  }
  best.sort((a, b) => b.logit - a.logit)
  return best
}

// Requests run one at a time, and a cancelled one stops at the next depth.
// The yield between depths is what lets a cancel message arrive at all: a
// worker processes its queue between tasks, never during one. Instrument E's
// reads yield on the same terms, so a lens request queued behind them waits
// for at most one of them rather than for a whole panel's worth.
const cancelled = new Set()
let queue = Promise.resolve()

function yieldToQueue() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

async function read({ requestId, stops, count, depths }) {
  const logitsByStop = []
  const stats = []
  const hidden = new Float32Array(HIDDEN)
  for (let stop = 0; stop < depths; stop++) {
    if (cancelled.has(requestId)) break
    layerNorm(stops, stop * HIDDEN, hidden)
    const logits = new Float32Array(parts.vocab)
    lensLogits(hidden, logits)
    const stat = softmaxStats(logits)
    logitsByStop.push(logits)
    stats.push(stat)
    postMessage({
      type: 'stop',
      requestId,
      stop,
      candidates: topRows(logits, count).map((row) => ({
        id: row.id,
        logit: row.logit,
        probability: Math.exp(row.logit - stat.max) / stat.denominator,
      })),
    })
    await yieldToQueue()
  }

  if (cancelled.has(requestId)) return

  // The crystallizing trace: one token — whichever one the last stop settles
  // on — priced at every depth, so the reader can watch the belief that won
  // arrive rather than only see where it landed.
  const last = logitsByStop.length - 1
  const winner = topRows(logitsByStop[last], 1)[0]
  postMessage({
    type: 'trace',
    requestId,
    winnerId: winner.id,
    probabilities: logitsByStop.map(
      (logits, stop) =>
        Math.exp(logits[winner.id] - stats[stop].max) / stats[stop].denominator,
    ),
  })
  postMessage({ type: 'done', requestId })
}

// ---------------------------------------------------------------------------
// Instrument E's three questions
// ---------------------------------------------------------------------------

async function sendManifest({ requestId, config }) {
  const state = await fileState(config)
  postMessage({
    type: 'file-manifest',
    requestId,
    manifest: state.manifest,
    sha: state.sha,
    cachedBytes: state.bytes.length,
  })
}

async function sendWindow({ requestId, config, name, row0, col0 }) {
  const state = await fileState(config)
  const view = windowOf(state.bytes, state.manifest, name, row0, col0)
  // A fresh copy: the window is a slice of a retained 83 MB buffer, and a
  // transferable view into it would take the whole thing with it.
  const data = view.data.slice()
  postMessage({ type: 'file-window', requestId, window: { ...view, data } }, [data.buffer])
}

async function sendHistogram({ requestId, config, name }) {
  const state = await fileState(config)
  postMessage({
    type: 'file-histogram',
    requestId,
    name,
    histogram: histogramOf(state.bytes, state.manifest, name),
  })
}

// ---------------------------------------------------------------------------
// The queue
// ---------------------------------------------------------------------------

const FILE_TASKS = {
  'file-manifest': sendManifest,
  'file-window': sendWindow,
  'file-histogram': sendHistogram,
}

self.onmessage = (event) => {
  const message = event.data
  if (message.type === 'cancel') {
    cancelled.add(message.requestId)
    return
  }
  const fileTask = FILE_TASKS[message.type]
  if (fileTask) {
    queue = queue.then(() => run(message, () => fileTask(message)))
    return
  }
  if (message.type !== 'lens') return
  queue = queue.then(() =>
    run(message, async () => {
      await init(message.config)
      await read({
        requestId: message.requestId,
        stops: new Float32Array(message.stops),
        count: message.count,
        depths: message.depths,
      })
    }),
  )
}

/**
 * One queued task, however it ends.
 *
 * The `finally` is the point: a request id is only in `cancelled` so that a
 * task already in flight can notice and stop. Once the task is over — done,
 * cancelled, thrown, or never started because a cancel beat it to the queue —
 * the id means nothing, and leaving it there would grow the set for the life
 * of the page.
 */
async function run(message, task) {
  try {
    await task()
  } catch (error) {
    postMessage({
      type: 'error',
      requestId: message.requestId,
      message: error instanceof Error ? error.message : String(error),
    })
  } finally {
    cancelled.delete(message.requestId)
    await yieldToQueue()
  }
}
