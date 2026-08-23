// Turning bytes into something a steel box can wear.
//
// Two rasters live here and they answer two different questions.
//
//   the tensor thumbnail   what a whole weight looks like. The grid comes out
//                          of fileFacts.json, where it was read from the real
//                          file at build time, so a box wears its own tensor
//                          in both modes and before anything is downloaded.
//   the residual strip     what one token's running vector looks like at one
//                          depth. 768 values, one pixel each, no downsampling
//                          — the raster is exactly as wide as the vector is
//                          long, so nothing is averaged away on the way to the
//                          screen.
//
// Both are drawn as a flat alpha ramp in one colour, and the colour is read
// out of the page's own custom properties rather than written here. The colour
// law is the visual thesis; a module that hard-coded a blue would be a second
// place to change it. If a property cannot be resolved this returns null and
// the caller draws no texture at all, because a texture in the wrong colour
// would say something false.

const CACHE_LIMIT = 48
/** @type {Map<string, string|null>} */
const cache = new Map()
/** @type {HTMLCanvasElement|null} */
let scratch = null

function canvasOf(width, height) {
  if (typeof document === 'undefined') return null
  if (!scratch) scratch = document.createElement('canvas')
  scratch.width = width
  scratch.height = height
  return scratch
}

function remember(key, url) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next()
    if (!oldest.done) cache.delete(oldest.value)
  }
  cache.set(key, url)
  return url
}

/**
 * One CSS custom property as three 0–255 channels.
 *
 * getComputedStyle hands back whatever the stylesheet wrote, and the page is
 * free to write any of these, so all four spellings are read: hex, short hex,
 * `rgb()` and the `color(srgb …)` form a browser produces when a colour has
 * been through a colour-space conversion.
 */
function channelsOf(property) {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') {
    return null
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(property)
    .trim()
  if (!raw) return null
  let match = /^#([0-9a-f]{3})$/i.exec(raw)
  if (match) {
    const [r, g, b] = match[1].split('')
    return [
      parseInt(r + r, 16),
      parseInt(g + g, 16),
      parseInt(b + b, 16),
    ]
  }
  match = /^#([0-9a-f]{6})$/i.exec(raw)
  if (match) {
    const n = parseInt(match[1], 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  match = /^rgba?\(([^)]+)\)$/i.exec(raw)
  if (match) {
    const parts = match[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3)
    if (parts.length === 3) return parts.map((p) => Math.round(Number(p)))
  }
  match = /^color\(srgb\s+([^)]+)\)$/i.exec(raw)
  if (match) {
    const parts = match[1].split(/[\s/]+/).filter(Boolean).slice(0, 3)
    if (parts.length === 3) {
      return parts.map((p) => Math.round(Math.min(1, Math.max(0, Number(p))) * 255))
    }
  }
  return null
}

function decode(base64) {
  const binary = atob(base64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}

/**
 * A thumbnail as a data URL in one role colour.
 *
 * The cells are contrast-stretched across the tensor's own range before they
 * are drawn, and that is a drawing decision rather than a reading: a block
 * average over thirty-eight million weights lands in a band eight bytes wide
 * out of 256, so a straight 0–255 ramp would paint every weight in the file
 * the same flat grey. The stretch is per tensor and it is stated on the page.
 * The bytes themselves are untouched — `lo` and `hi` in the shipped reading
 * still say what a cell is worth.
 *
 * @param {{base64:string,rows:number,cols:number}} thumb
 * @param {string} property the custom property naming the colour
 * @param {string} key cache key — the tensor name and the role
 */
export function thumbnailUrl(thumb, property, key) {
  if (!thumb) return null
  const hit = cache.get(key)
  if (hit !== undefined) return hit
  const rgb = channelsOf(property)
  if (!rgb) return remember(key, null)
  const cells = decode(thumb.base64)
  let lo = 255
  let hi = 0
  for (const c of cells) {
    if (c < lo) lo = c
    if (c > hi) hi = c
  }
  const span = hi - lo || 1
  const canvas = canvasOf(thumb.cols, thumb.rows)
  if (!canvas) return remember(key, null)
  const ctx = canvas.getContext('2d')
  if (!ctx) return remember(key, null)
  const image = ctx.createImageData(thumb.cols, thumb.rows)
  for (let i = 0; i < cells.length; i++) {
    const at = i * 4
    image.data[at] = rgb[0]
    image.data[at + 1] = rgb[1]
    image.data[at + 2] = rgb[2]
    image.data[at + 3] = Math.round(((cells[i] - lo) / span) * 255)
  }
  ctx.putImageData(image, 0, 0)
  return remember(key, canvas.toDataURL('image/png'))
}

/**
 * One token's running vector at one depth, as a data URL one pixel wide per
 * value. 768 values, 768 pixels — the strip is not a summary of the vector,
 * it is the vector, and the browser is the only thing that ever resamples it.
 *
 * A cell's alpha is |value| against the largest magnitude at this depth, so
 * the shape of the vector is legible at every depth; how much vector there is
 * — the thing that grows by two and a half orders of magnitude down the stack
 * — is carried by the brightness of the strip as a whole, which the caller
 * sets and the legend states.
 *
 * @param {Float32Array|number[]} values
 * @param {string} property
 * @param {string} key
 */
export function stripUrl(values, property, key) {
  const hit = cache.get(key)
  if (hit !== undefined) return hit
  const rgb = channelsOf(property)
  if (!rgb || !values || values.length === 0) return remember(key, null)
  let peak = 0
  for (let i = 0; i < values.length; i++) {
    const v = Math.abs(values[i])
    if (v > peak) peak = v
  }
  if (!(peak > 0)) peak = 1
  const canvas = canvasOf(values.length, 1)
  if (!canvas) return remember(key, null)
  const ctx = canvas.getContext('2d')
  if (!ctx) return remember(key, null)
  const image = ctx.createImageData(values.length, 1)
  for (let i = 0; i < values.length; i++) {
    const at = i * 4
    image.data[at] = rgb[0]
    image.data[at + 1] = rgb[1]
    image.data[at + 2] = rgb[2]
    image.data[at + 3] = Math.round((Math.abs(values[i]) / peak) * 255)
  }
  ctx.putImageData(image, 0, 0)
  return remember(key, canvas.toDataURL('image/png'))
}

/** Drops every raster. Only the dev checks need this. */
export function clearTextureCache() {
  cache.clear()
}
