// Reading an ONNX file as a file.
//
// This module is the arithmetic and the parsing, and nothing else: no DOM, no
// Cache API, no fetch. It runs unchanged in the browser worker
// (modelBytesWorker.js) and in Node (scripts/read-model-file.mjs), which is
// the whole point — the numbers instrument E ships were produced by the same
// code that re-derives them live, so a disagreement between them is a real
// disagreement about the bytes rather than about two implementations.
//
// What it knows about protobuf is only what an ONNX file forces it to know.
// Every field carries its own wire type, so a payload can be skipped by its
// length without a schema; the field numbers below come from onnx.proto:
//
//   ModelProto   graph = 7
//   GraphProto   node = 1, name = 2, initializer = 5, input = 11,
//                output = 12, value_info = 13
//   TensorProto  dims = 1, data_type = 2, float_data = 4, int32_data = 5,
//                name = 8, raw_data = 9
//
// Offsets are read, never assumed. An offset is only ever true of one
// particular upload of one particular file, which is exactly why the
// instrument prints them and re-checks them.

/** ONNX TensorProto.DataType, for the three this export actually uses. */
export const DTYPES = { 1: 'f32', 2: 'u8', 3: 'i8', 6: 'i32', 7: 'i64' }

/** Bytes per element, by our short dtype name. */
export const DTYPE_WIDTH = { f32: 4, u8: 1, i8: 1, i32: 4, i64: 8 }

export function readVarint(bytes, pos) {
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
 * Calls `visit(field, wire, value, from, to, tagStart)` once per field between
 * `start` and `end`, skipping every payload by its length rather than
 * decoding it. Nothing but the fields asked for is ever materialized, which
 * is what keeps a walk of an 83 MB file cheap.
 *
 * `tagStart` is where the field's tag byte sat, which is what a caller needs
 * when it cares about the boundary between one top-level field and the next
 * rather than about the payload.
 */
export function walkFields(bytes, start, end, visit) {
  let p = start
  while (p < end) {
    const tagStart = p
    let tag
    ;[tag, p] = readVarint(bytes, p)
    const field = Number(tag >> 3n)
    const wire = Number(tag & 7n)
    if (wire === 0) {
      let value
      ;[value, p] = readVarint(bytes, p)
      visit(field, wire, value, p, p, tagStart)
    } else if (wire === 2) {
      let len
      ;[len, p] = readVarint(bytes, p)
      const from = p
      p += Number(len)
      visit(field, wire, null, from, p, tagStart)
    } else if (wire === 5) {
      visit(field, wire, null, p, p + 4, tagStart)
      p += 4
    } else if (wire === 1) {
      visit(field, wire, null, p, p + 8, tagStart)
      p += 8
    } else {
      throw new Error(`unreadable protobuf wire type ${wire} at ${p}`)
    }
  }
}

const decoder = new TextDecoder()

/**
 * One TensorProto's spans, decoded no further than it has to be. Bulk
 * payloads are almost always raw_data; the two single-value quantization
 * constants are the exception and can land in either of the typed lists,
 * packed or not, so all three encodings are read.
 *
 * `names`, when given, is a filter: a tensor not in it comes back as null
 * before anything is copied out of it.
 */
export function readTensor(bytes, start, end, names) {
  let name = null
  let dataType = 0
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
    } else if (field === 2 && wire === 0) dataType = Number(value)
    else if (field === 4 && wire === 2) floats = [from, to]
    else if (field === 4 && wire === 5) looseFloats.push(from)
    else if (field === 5 && wire === 2) ints = [from, to]
    else if (field === 5 && wire === 0) looseInts.push(Number(value))
    else if (field === 8 && wire === 2) name = decoder.decode(bytes.subarray(from, to))
    else if (field === 9 && wire === 2) raw = [from, to]
  })
  if (name === null) return null
  if (names && !names.has(name)) return null
  return { name, dataType, dims, raw, floats, ints, looseFloats, looseInts }
}

/**
 * Every top-level `graph` field, as `{tagStart, from, to}`.
 *
 * There are two in the copy this page caches, and the difference matters. The
 * published file declares one. Our own patch appends a second, tiny one to
 * promote some interior nodes to graph outputs — protobuf merges repeated
 * messages, which is how that works at all — so anything that wants the file
 * *as published* has to stop at the second one's tag byte.
 */
export function graphSpans(bytes) {
  const spans = []
  walkFields(bytes, 0, bytes.length, (field, wire, value, from, to, tagStart) => {
    if (field === 7 && wire === 2) spans.push({ tagStart, from, to })
  })
  return spans
}

/** Where the file ends if the promoted-outputs fragment is not counted. */
export function publishedLength(bytes) {
  const spans = graphSpans(bytes)
  return spans.length > 1 ? spans[1].tagStart : bytes.length
}

/** The initializers named in `names`, out of a whole ModelProto. */
export function findInitializers(bytes, names) {
  const spans = graphSpans(bytes)
  if (spans.length === 0) throw new Error('the model file declares no graph')
  const graph = spans[0]

  const found = new Map()
  walkFields(bytes, graph.from, graph.to, (field, wire, value, from, to) => {
    if (field !== 5 || wire !== 2) return
    if (found.size === names.size) return
    const tensor = readTensor(bytes, from, to, names)
    if (tensor) found.set(tensor.name, tensor)
  })
  return found
}

// ---------------------------------------------------------------------------
// Values out of a tensor
// ---------------------------------------------------------------------------

function floatsFrom(bytes, span) {
  const count = (span[1] - span[0]) / 4
  const view = new DataView(bytes.buffer, bytes.byteOffset + span[0], count * 4)
  const out = new Float32Array(count)
  for (let i = 0; i < count; i++) out[i] = view.getFloat32(i * 4, true)
  return out
}

/** A whole f32 initializer, from raw bytes or from the typed list. */
export function vectorFloats(bytes, tensor) {
  if (tensor.raw) return floatsFrom(bytes, tensor.raw)
  if (tensor.floats) return floatsFrom(bytes, tensor.floats)
  throw new Error(`${tensor.name} holds no values`)
}

/** The single f32 in a scalar initializer, wherever the exporter put it. */
export function scalarFloat(bytes, tensor) {
  if (tensor.raw) return floatsFrom(bytes, tensor.raw)[0]
  if (tensor.floats) return floatsFrom(bytes, tensor.floats)[0]
  if (tensor.looseFloats.length > 0) {
    const at = tensor.looseFloats[0]
    return floatsFrom(bytes, [at, at + 4])[0]
  }
  throw new Error(`${tensor.name} holds no value`)
}

/** The single integer in a scalar initializer, likewise. */
export function scalarInt(bytes, tensor) {
  if (tensor.ints) return Number(readVarint(bytes, tensor.ints[0])[0])
  if (tensor.looseInts.length > 0) return tensor.looseInts[0]
  if (tensor.raw) return bytes[tensor.raw[0]]
  throw new Error(`${tensor.name} holds no value`)
}

// ---------------------------------------------------------------------------
// The manifest
// ---------------------------------------------------------------------------

/**
 * Every initializer in the file, in the order the file stores them, with the
 * absolute offset and length of its bytes.
 *
 * Also the two spans that are not tensors: everything before the first
 * raw_data — the graph itself, 1703 nodes of it — and everything after the
 * last, which is the declaration of the outputs and the shapes of every
 * intermediate value.
 *
 * @param {Uint8Array} bytes
 */
export function scanManifest(bytes) {
  const limit = publishedLength(bytes)
  const spans = graphSpans(bytes)
  if (spans.length === 0) throw new Error('the model file declares no graph')
  const graph = spans[0]

  let nodeCount = 0
  const tensors = []
  walkFields(bytes, graph.from, graph.to, (field, wire, value, from, to) => {
    if (wire !== 2) return
    if (field === 1) {
      nodeCount++
      return
    }
    if (field !== 5) return
    const t = readTensor(bytes, from, to)
    if (!t) return
    const dtype = DTYPES[t.dataType] ?? `type${t.dataType}`
    const elements = t.dims.reduce((n, d) => n * d, 1)
    const entry = {
      name: t.name,
      dims: t.dims,
      dtype,
      elements,
      byteLength: t.raw ? t.raw[1] - t.raw[0] : 0,
      offset: t.raw ? t.raw[0] : null,
    }
    // A scalar carries its one number inline, in the tensor's own header,
    // rather than in the blob — which is why a scale and a zero point take no
    // width at all on the byte bar.
    if (!t.raw && elements === 1) {
      entry.value = dtype === 'f32' ? scalarFloat(bytes, t) : scalarInt(bytes, t)
    }
    tensors.push(entry)
  })

  const withBytes = tensors.filter((t) => t.offset !== null)
  const first = withBytes.length > 0 ? withBytes[0].offset : limit
  const last = withBytes.reduce((end, t) => Math.max(end, t.offset + t.byteLength), first)

  return {
    bytes: limit,
    nodeCount,
    tensorCount: tensors.length,
    graph: { offset: 0, byteLength: first },
    trailer: { offset: last, byteLength: Math.max(0, limit - last) },
    weightBytes: tensors.reduce((n, t) => n + t.byteLength, 0),
    parameters: tensors.reduce((n, t) => n + (t.byteLength > 0 ? t.elements : 0), 0),
    tensors,
  }
}

/** Index a manifest's tensors by name. */
export function byName(manifest) {
  const map = new Map()
  for (const t of manifest.tensors) map.set(t.name, t)
  return map
}

/**
 * The dequantization constants for a quantized weight, or null if it has
 * none — which is how this export marks a tensor as plain f32.
 */
export function quantOf(manifest, name) {
  if (!name.endsWith('_quantized')) return null
  const stem = name.slice(0, -'_quantized'.length)
  const map = byName(manifest)
  const scale = map.get(`${stem}_scale`)
  const zero = map.get(`${stem}_zero_point`)
  if (!scale || !zero) return null
  return { scale: scale.value, zeroPoint: zero.value }
}

/** Every tensor a reader can select: the 76 that actually hold bytes. */
export function readableTensors(manifest) {
  return manifest.tensors.filter((t) => t.byteLength > 0)
}

// ---------------------------------------------------------------------------
// Histograms
// ---------------------------------------------------------------------------

/** Signed reading of one byte, by dtype. */
function signedOf(dtype) {
  return dtype === 'i8'
    ? (b) => (b < 128 ? b : b - 256)
    : (b) => b
}

/**
 * The bin a quantized byte falls in. Bins run in ascending *value* order for
 * both dtypes — index 0 is the most negative representable weight — so the
 * curve reads left to right the way a curve should, and an i8 tensor does not
 * come out cut in half at zero.
 */
export function binOfByte(dtype, byte) {
  return dtype === 'i8' ? (byte < 128 ? byte + 128 : byte - 128) : byte
}

/** The dequantized value a bin index stands for. */
export function valueOfBin(dtype, bin, scale, zeroPoint) {
  const q = dtype === 'i8' ? bin - 128 : bin
  return scale * (q - zeroPoint)
}

/**
 * The distribution of a whole quantized tensor, one bin per byte value that
 * the dtype can hold. Not a sample and not a summary: 256 bins is every value
 * this weight is able to take, which is the other half of what the panel is
 * showing — a weight in this file is not a real number, it is one of 256.
 *
 * The counts are exact integers, so everything else is derived from them
 * exactly rather than accumulated over tens of millions of floats.
 */
export function quantizedHistogram(bytes, tensor, scale, zeroPoint) {
  const counts = new Float64Array(256)
  const from = tensor.offset
  const to = from + tensor.byteLength
  for (let p = from; p < to; p++) counts[binOfByte(tensor.dtype, bytes[p])]++

  let n = 0
  let sumQ = 0
  let sumQ2 = 0
  let minBin = -1
  let maxBin = -1
  let within05 = 0
  let within10 = 0
  for (let bin = 0; bin < 256; bin++) {
    const c = counts[bin]
    if (c === 0) continue
    if (minBin < 0) minBin = bin
    maxBin = bin
    const q = (tensor.dtype === 'i8' ? bin - 128 : bin) - zeroPoint
    n += c
    sumQ += c * q
    sumQ2 += c * q * q
    const magnitude = Math.abs(scale * q)
    if (magnitude <= 0.05) within05 += c
    if (magnitude <= 0.1) within10 += c
  }
  const mean = (scale * sumQ) / n
  const meanSquare = (scale * scale * sumQ2) / n
  return {
    kind: 'byte',
    dtype: tensor.dtype,
    bins: 256,
    counts: Array.from(counts, (c) => c),
    scale,
    zeroPoint,
    lo: valueOfBin(tensor.dtype, 0, scale, zeroPoint),
    hi: valueOfBin(tensor.dtype, 255, scale, zeroPoint),
    stats: {
      n,
      min: valueOfBin(tensor.dtype, minBin, scale, zeroPoint),
      max: valueOfBin(tensor.dtype, maxBin, scale, zeroPoint),
      mean,
      std: Math.sqrt(Math.max(0, meanSquare - mean * mean)),
      within05: within05 / n,
      within10: within10 / n,
    },
  }
}

/** How many bins an f32 vector's curve gets. */
export const FLOAT_BINS = 64

/**
 * The distribution of an f32 vector, over a range symmetric about zero so the
 * shape can be compared with a weight's without the eye having to correct for
 * an offset axis. These vectors are short — 768 to 3072 numbers — so this is
 * a plain two-pass over the values.
 */
export function floatHistogram(values) {
  const n = values.length
  let sum = 0
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < n; i++) {
    const v = values[i]
    sum += v
    if (v < min) min = v
    if (v > max) max = v
  }
  const mean = sum / n
  let square = 0
  let within05 = 0
  let within10 = 0
  for (let i = 0; i < n; i++) {
    const d = values[i] - mean
    square += d * d
    const magnitude = Math.abs(values[i])
    if (magnitude <= 0.05) within05++
    if (magnitude <= 0.1) within10++
  }

  const extent = Math.max(Math.abs(min), Math.abs(max)) || 1
  const counts = new Array(FLOAT_BINS).fill(0)
  const width = (2 * extent) / FLOAT_BINS
  for (let i = 0; i < n; i++) {
    let bin = Math.floor((values[i] + extent) / width)
    if (bin < 0) bin = 0
    if (bin >= FLOAT_BINS) bin = FLOAT_BINS - 1
    counts[bin]++
  }

  return {
    kind: 'linear',
    dtype: 'f32',
    bins: FLOAT_BINS,
    counts,
    lo: -extent,
    hi: extent,
    stats: {
      n,
      min,
      max,
      mean,
      std: Math.sqrt(square / n),
      within05: within05 / n,
      within10: within10 / n,
    },
  }
}

/** Whichever curve this tensor has. */
export function histogramOf(bytes, manifest, name) {
  const tensor = byName(manifest).get(name)
  if (!tensor || tensor.byteLength === 0) throw new Error(`${name} holds no bytes`)
  const quant = quantOf(manifest, name)
  if (quant) {
    return quantizedHistogram(bytes, tensor, quant.scale, quant.zeroPoint)
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset + tensor.offset, tensor.byteLength)
  const values = new Float32Array(tensor.byteLength / 4)
  for (let i = 0; i < values.length; i++) values[i] = view.getFloat32(i * 4, true)
  return floatHistogram(values)
}

// ---------------------------------------------------------------------------
// Windows
// ---------------------------------------------------------------------------

/** How much of a tensor the blob panel shows at once. */
// The blob panel's window. 64 by 24 rather than the 96 by 32 it was: at the
// page's 760px measure that is a cell of about 10.6 x 10.5 px on screen with
// a hairline of ground between cells, which is the difference between a grid
// of numbers and a smear. The honest raw bytes either way — this only changes
// how many of them one window holds.
export const WINDOW_ROWS = 24
export const WINDOW_COLS = 64

/**
 * A rectangle of raw bytes out of a quantized matrix, or a run of values out
 * of an f32 vector. Raw in both cases: the panel dequantizes for the readout
 * and the ramp, and says the arithmetic out loud while it does it.
 */
export function windowOf(bytes, manifest, name, row0 = 0, col0 = 0, maxRows = WINDOW_ROWS) {
  const tensor = byName(manifest).get(name)
  if (!tensor || tensor.byteLength === 0) throw new Error(`${name} holds no bytes`)
  const quant = quantOf(manifest, name)
  if (quant) {
    const rows = tensor.dims[0]
    const cols = tensor.dims.length > 1 ? tensor.dims[1] : 1
    const r0 = Math.max(0, Math.min(row0, Math.max(0, rows - maxRows)))
    const c0 = Math.max(0, Math.min(col0, Math.max(0, cols - WINDOW_COLS)))
    const takeRows = Math.min(maxRows, rows - r0)
    const takeCols = Math.min(WINDOW_COLS, cols - c0)
    const out = new Uint8Array(takeRows * takeCols)
    for (let r = 0; r < takeRows; r++) {
      const src = tensor.offset + (r0 + r) * cols + c0
      out.set(bytes.subarray(src, src + takeCols), r * takeCols)
    }
    return {
      kind: 'bytes',
      name,
      dtype: tensor.dtype,
      rows: takeRows,
      cols: takeCols,
      row0: r0,
      col0: c0,
      totalRows: rows,
      totalCols: cols,
      data: out,
      scale: quant.scale,
      zeroPoint: quant.zeroPoint,
    }
  }
  // An f32 vector has no rows of its own, so the panel gives it some: it is
  // wrapped at the same 96 columns a matrix uses, and a "row" here is a
  // stride of 96 numbers rather than anything the file believes in.
  const total = tensor.byteLength / 4
  const totalRows = Math.ceil(total / WINDOW_COLS)
  const r0 = Math.max(0, Math.min(row0, Math.max(0, totalRows - maxRows)))
  const start = r0 * WINDOW_COLS
  const take = Math.min(maxRows * WINDOW_COLS, total - start)
  const view = new DataView(bytes.buffer, bytes.byteOffset + tensor.offset + start * 4, take * 4)
  const out = new Float32Array(take)
  for (let i = 0; i < take; i++) out[i] = view.getFloat32(i * 4, true)
  return {
    kind: 'floats',
    name,
    dtype: 'f32',
    rows: Math.ceil(take / WINDOW_COLS),
    cols: WINDOW_COLS,
    row0: r0,
    col0: 0,
    totalRows,
    totalCols: total,
    data: out,
  }
}

/** The signed integer a raw byte stands for, for the readout line. */
export function rawValue(dtype, byte) {
  return signedOf(dtype)(byte)
}
