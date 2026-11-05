// Pure formatting and byte-window decoding for the two static drawings.
export function textLines(text, width, size) {
  const limit = Math.floor(width / (size * 0.6))
  const lines = []
  let rest = text
  while (rest.length > limit) {
    const space = rest.lastIndexOf(' ', limit - 1)
    const end = space > 0 ? space + 1 : limit
    lines.push(rest.slice(0, end))
    rest = rest.slice(end)
  }
  lines.push(rest)
  return lines
}

export const shortTensorName = (name) => name
  .replace(/^transformer\./, '')
  .replace(/\.weight_quantized$/, '')
  .replace(/^(h\.\d+)\./, '$1 ')

export const integer = (n) => n.toLocaleString('en-US')
export const lengthLabel = (n) => n.toFixed(n < 100 ? 1 : 0)

// Node-side port of bakedPass.js floats() and realModel.js attentionRows():
// those modules depend on import.meta.env. Keep the same little-endian f32
// reading and [head, query, key] indexing; no re-softmax or normalization.
// ASSUMES: the baked run stores one square attention matrix per head.
export function bakedAttentionWeights(run, layer, head, position) {
  if (!Number.isInteger(run.n) || run.n < 1 ||
      !Number.isInteger(layer) || layer < 0 || layer >= run.attention.length ||
      !Number.isInteger(head) || head < 0 ||
      !Number.isInteger(position) || position < 0 || position >= run.n) {
    throw new Error('Invalid baked attention selection')
  }
  const bytes = Uint8Array.from(atob(run.attention[layer]), (char) => char.charCodeAt(0))
  const view = new DataView(bytes.buffer)
  const matrixBytes = run.n * run.n * 4
  if (bytes.length % matrixBytes || (head + 1) * matrixBytes > bytes.length) {
    throw new Error('Invalid baked attention dimensions')
  }
  const base = (head * run.n + position) * run.n
  return Array.from({ length: position + 1 }, (_, i) => view.getFloat32((base + i) * 4, true))
}

// Same signed-magnitude reading and middle-96% stretch as F's wall. u8
// uses its stored byte value; i8 uses |signed byte|, never unsigned wraparound.
export function windowCells(window, signed = false) {
  const values = Array.from(atob(window.base64), (char) => {
    const q = char.charCodeAt(0)
    return signed ? Math.abs(q > 127 ? q - 256 : q) : q
  })
  const ordered = [...values].sort((a, b) => a - b)
  const lo = signed ? ordered[Math.floor(0.02 * (ordered.length - 1))] : 0
  const hi = signed ? ordered[Math.floor(0.98 * (ordered.length - 1))] : 255
  return values.map((value) => Math.max(0, Math.min(1, (value - lo) / Math.max(1, hi - lo))))
}

