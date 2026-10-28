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

export const integer = (n) => n.toLocaleString('en-US')
export const lengthLabel = (n) => n.toFixed(n < 100 ? 1 : 0)

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

