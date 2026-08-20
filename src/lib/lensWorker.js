// The logit lens, computed off the main thread.
//
// A lens reading is the residual stream at one depth pushed through the two
// pieces of machinery that sit at the very end of the stack: the final
// LayerNorm, and the unembedding — which in GPT-2 is the token embedding
// table used backwards, one dot product per row. That is 50,257 dot products
// of 768 numbers per depth, seven depths per reading. Roughly 270 million
// multiply-adds, which is a third of a second of arithmetic and would be a
// third of a second of frozen page if it ran on the main thread.
//
// Two things about it are worth explaining.
//
// The first is where the numbers come from. The worker never downloads
// anything: the model file is already in the cache bucket the page wrote when
// it loaded distilgpt2, so it opens that bucket, finds the request whose URL
// ends in the ONNX file name, and reads the bytes back. Only if that fails
// does it fall back to the network.
//
// The second is how it reads them. ONNX Runtime will not hand out an
// initializer, so the four tensors this needs — the quantized embedding table
// and its two dequantization constants, plus the final LayerNorm's gain and
// bias — are pulled straight out of the protobuf by walking its fields and
// matching initializers by name. By name, never by offset: an offset is only
// true of the file as it was uploaded on one particular day.
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
// identity the instrument is built to show.

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

// ---------------------------------------------------------------------------
// Just enough protobuf to find five initializers
// ---------------------------------------------------------------------------

function readVarint(bytes, pos) {
  let result = 0n
  let shift = 0n
  for (;;) {
    const byte = bytes[pos++]
    result |= BigInt(byte & 127) << shift
    if ((byte & 128) === 0) break
    shift += 7n
  }
  return [result, pos]
}

/**
 * Calls `visit(field, wire, value, start, end)` once per field between
 * `start` and `end`, skipping every payload by its length rather than
 * decoding it. Nothing but the fields asked for is ever materialized, which
 * is what keeps a walk of an 83 MB file cheap.
 */
function walkFields(bytes, start, end, visit) {
  let p = start
  while (p < end) {
    let tag
    ;[tag, p] = readVarint(bytes, p)
    const field = Number(tag >> 3n)
    const wire = Number(tag & 7n)
    if (wire === 0) {
      let value
      ;[value, p] = readVarint(bytes, p)
      visit(field, wire, value, p, p)
    } else if (wire === 2) {
      let len
      ;[len, p] = readVarint(bytes, p)
      const from = p
      p += Number(len)
      visit(field, wire, null, from, p)
    } else if (wire === 5) {
      visit(field, wire, null, p, p + 4)
      p += 4
    } else if (wire === 1) {
      visit(field, wire, null, p, p + 8)
      p += 8
    } else {
      throw new Error(`unreadable protobuf wire type ${wire} at ${p}`)
    }
  }
}

const decoder = new TextDecoder()

/**
 * One TensorProto's spans, decoded no further than it has to be. Field
 * numbers: dims 1, data_type 2, float_data 4, int32_data 5, name 8,
 * raw_data 9. Bulk payloads are almost always raw_data; the two single-value
 * quantization constants are the exception and can land in either of the
 * typed lists, packed or not, so all three encodings are read.
 */
function readTensor(bytes, start, end, names) {
  let name = null
  let raw = null
  let floats = null
  let ints = null
  const dims = []
  const looseFloats = []
  const looseInts = []
  walkFields(bytes, start, end, (field, wire, value, from, to) => {
    if (field === 1 && wire === 0) dims.push(Number(value))
    else if (field === 1 && wire === 2) {
      let p = from
      while (p < to) {
        let v
        ;[v, p] = readVarint(bytes, p)
        dims.push(Number(v))
      }
    } else if (field === 4 && wire === 2) floats = [from, to]
    else if (field === 4 && wire === 5) looseFloats.push(from)
    else if (field === 5 && wire === 2) ints = [from, to]
    else if (field === 5 && wire === 0) looseInts.push(Number(value))
    else if (field === 8 && wire === 2) name = decoder.decode(bytes.subarray(from, to))
    else if (field === 9 && wire === 2) raw = [from, to]
  })
  if (name === null || !names.has(name)) return null
  return { name, dims, raw, floats, ints, looseFloats, looseInts }
}

/** The initializers named in `names`, out of a whole ModelProto. */
function findInitializers(bytes, names) {
  // ModelProto.graph is field 7. Our own patch appends a second, tiny graph
  // field at the end of the file — protobuf merges repeated messages, which
  // is how the promoted outputs get in — so the walk sees two. The first is
  // the real one, and it is the only one holding initializers.
  let graph = null
  walkFields(bytes, 0, bytes.length, (field, wire, value, from, to) => {
    if (field === 7 && wire === 2 && graph === null) graph = [from, to]
  })
  if (!graph) throw new Error('the model file declares no graph')

  const found = new Map()
  walkFields(bytes, graph[0], graph[1], (field, wire, value, from, to) => {
    if (field !== 5 || wire !== 2) return
    if (found.size === names.size) return
    const tensor = readTensor(bytes, from, to, names)
    if (tensor) found.set(tensor.name, tensor)
  })
  return found
}

function floatsFrom(bytes, span) {
  const count = (span[1] - span[0]) / 4
  const view = new DataView(bytes.buffer, bytes.byteOffset + span[0], count * 4)
  const out = new Float32Array(count)
  for (let i = 0; i < count; i++) out[i] = view.getFloat32(i * 4, true)
  return out
}

/** A whole f32 initializer, from raw bytes or from the typed list. */
function vectorFloats(bytes, tensor) {
  if (tensor.raw) return floatsFrom(bytes, tensor.raw)
  if (tensor.floats) return floatsFrom(bytes, tensor.floats)
  throw new Error(`${tensor.name} holds no values`)
}

/** The single f32 in a scalar initializer, wherever the exporter put it. */
function scalarFloat(bytes, tensor) {
  if (tensor.raw) return floatsFrom(bytes, tensor.raw)[0]
  if (tensor.floats) return floatsFrom(bytes, tensor.floats)[0]
  if (tensor.looseFloats.length > 0) {
    const at = tensor.looseFloats[0]
    return floatsFrom(bytes, [at, at + 4])[0]
  }
  throw new Error(`${tensor.name} holds no value`)
}

/** The single integer in a scalar initializer, likewise. */
function scalarInt(bytes, tensor) {
  if (tensor.ints) return Number(readVarint(bytes, tensor.ints[0])[0])
  if (tensor.looseInts.length > 0) return tensor.looseInts[0]
  if (tensor.raw) return bytes[tensor.raw[0]]
  throw new Error(`${tensor.name} holds no value`)
}

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

async function init(config) {
  if (parts) return
  // The 83 MB is held only for the length of this function. What the worker
  // keeps afterwards is the 38.6 MB table and three small vectors.
  const bytes = await modelBytes(config)
  const names = new Set(Object.values(WANTED))
  const found = findInitializers(bytes, names)
  for (const name of names) {
    if (!found.has(name)) throw new Error(`the model file has no ${name}`)
  }
  const table = found.get(WANTED.table)
  if (!table.raw) throw new Error(`${WANTED.table} is not stored as raw bytes`)
  const quantized = new Uint8Array(bytes.subarray(table.raw[0], table.raw[1]))
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
// The reading itself
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
// worker processes its queue between tasks, never during one.
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

  if (cancelled.has(requestId)) {
    cancelled.delete(requestId)
    return
  }

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

self.onmessage = (event) => {
  const message = event.data
  if (message.type === 'cancel') {
    cancelled.add(message.requestId)
    return
  }
  if (message.type !== 'lens') return
  queue = queue.then(async () => {
    try {
      await init(message.config)
      await read({
        requestId: message.requestId,
        stops: new Float32Array(message.stops),
        count: message.count,
        depths: message.depths,
      })
    } catch (error) {
      postMessage({
        type: 'error',
        requestId: message.requestId,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  })
}
