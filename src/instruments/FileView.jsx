import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import InfoTag from '../components/InfoTag.jsx'
import LoadNote from '../components/LoadNote.jsx'
import {
  decodeWindow,
  readHistogram,
  readManifest,
  readSha,
  readWindow,
} from '../lib/fileBytes.js'
import { WINDOW_COLS, WINDOW_ROWS, rawValue } from '../lib/onnxScan.js'
import { tokenText } from '../lib/realModel.js'

/**
 * Instrument E — the file.
 *
 * Section 01 says a model at rest is a file: a short header of tensor names
 * and shapes, then one enormous blob of numbers, almost all of them tiny and
 * bell-curved around zero. This instrument is that paragraph, read out of the
 * actual file the rest of the page runs —
 * distilgpt2's decoder_model_quantized.onnx, 83,502,375 bytes of it.
 *
 * Three panels, in the order the sentence puts them. The header: every tensor
 * in file order, and the whole file drawn to scale so the 38.6 MB embedding
 * table can be seen taking nearly half of it. The blob: a window of raw bytes
 * out of whichever tensor is selected, with the arithmetic that turns one of
 * them into a weight written out. The curve: the distribution of every value
 * in that tensor, in bins of one byte each, which is also the quiet
 * demonstration that a weight in this file is not a real number but one of
 * 256 of them.
 *
 * The instrument ignores the illustrative/real toggle, because it has no
 * illustrative mode to offer. Before the model is loaded it shows a reading
 * taken from the file ahead of time and says so; once the bytes are in the
 * browser it re-reads all of it from the cached copy and says whether the two
 * agree, hash included. Nothing here is a stand-in for anything.
 */

const WTE = 'transformer.wte.weight_quantized'
/** Below this share of the file a segment is thinner than a pixel: no lies. */
const CLICKABLE_PCT = 0.5
/** And below this a bracket cannot hold its own label. */
const LABELLED_PCT = 3

// --- formatting -------------------------------------------------------------

const NBSP_MINUS = '−'

const count = (n) => n.toLocaleString('en-US')
const mb = (n) => `${(n / 1e6).toFixed(1)} MB`
const signed = (v, dp) => `${v < 0 ? NBSP_MINUS : '+'}${Math.abs(v).toFixed(dp)}`
const plain = (v) => String(v).replace('-', NBSP_MINUS)
const short = (name) => name.replace(/^transformer\./, '')
const sig = (v, digits) => {
  const text = Number(v.toPrecision(digits)).toString()
  return text.replace('-', NBSP_MINUS)
}

/** 1d3ab4d7…8431 — enough of a hash to compare by eye. */
const shortSha = (sha) => (sha ? `${sha.slice(0, 8)}…${sha.slice(-4)}` : '—')

// --- the ramp ---------------------------------------------------------------

function rgbOf(hex) {
  const value = hex.trim().replace('#', '')
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ]
}

/**
 * Weights at rest, so the window is painted in one colour and its magnitude.
 *
 * The panel is a dark screen set into the page, and the ramp runs across it:
 * near-ink where a weight is zero, through the frozen blue, to a luminous
 * pale blue at the largest magnitude in the tensor. One colour family the
 * whole way, because everything in this instrument is frozen machinery.
 *
 * The tokens are read off the document rather than copied, so the ramp cannot
 * drift away from the palette. There is deliberately no second copy of those
 * three colours in this file: a hard-coded fallback would go stale the next
 * time the page is repainted, and it would go stale silently, which is the
 * one thing an instrument that claims to show real bytes cannot do. If the
 * palette cannot be read the window is not painted at all.
 *
 * Read on every draw rather than once at mount, for the same reason — three
 * getPropertyValue calls per repaint is nothing, and a ramp memoised at mount
 * would keep painting the old palette after a token changed under it.
 */
const RAMP_FLOOR = 0.16
const RAMP_TOKENS = ['--screen', '--frozen', '--frozen-lit']

function readRamp() {
  const style = getComputedStyle(document.documentElement)
  const stops = []
  for (const token of RAMP_TOKENS) {
    const value = style.getPropertyValue(token).trim()
    if (!value) {
      if (import.meta.env.DEV) {
        console.error(`instrument E: ${token} is not defined; the byte window cannot be painted`)
      }
      return null
    }
    stops.push(rgbOf(value))
  }
  const [screen, frozen, lit] = stops
  // The bottom of the ramp is a hair off the screen's own ground rather than
  // on it. A weight of zero should read as the darkest thing in the window,
  // not as a hole in it — with the floor at the ground exactly, the cells
  // holding almost nothing dissolved into the panel and took the grid with
  // them. The mapping of magnitude to lightness is unchanged.
  const floor = screen.map((c, i) => Math.round(c + (frozen[i] - c) * RAMP_FLOOR))
  return [floor, frozen, lit]
}

function rampColour(ramp, t) {
  const [low, mid, high] = ramp
  const [from, to, f] = t < 0.5 ? [low, mid, t * 2] : [mid, high, (t - 0.5) * 2]
  const c = (i) => Math.round(from[i] + (to[i] - from[i]) * f)
  return `rgb(${c(0)},${c(1)},${c(2)})`
}

// --- reading the manifest ---------------------------------------------------

/** Which region of the file a tensor belongs to, for the brackets. */
function groupOf(name) {
  const block = /^transformer\.h\.(\d+)\./.exec(name)
  if (block) return { key: `block ${block[1]}`, badge: block[1], label: `block ${block[1]}` }
  if (name.startsWith('transformer.wte')) return { key: 'wte', badge: 'wte', label: 'wte' }
  if (name.startsWith('transformer.wpe')) return { key: 'wpe', badge: 'wpe', label: 'wpe' }
  return { key: 'ln_f', badge: 'ln_f', label: 'ln_f' }
}

/**
 * Everything the header panel draws, derived from the manifest and from
 * nothing else — the rows, the segments of the byte bar, and the brackets
 * under it. If the file changed shape this would change with it rather than
 * describe a file that no longer exists.
 */
function readHeader(manifest) {
  if (!manifest) return null
  const byName = new Map(manifest.tensors.map((t) => [t.name, t]))
  const quantOf = (name) => {
    if (!name.endsWith('_quantized')) return null
    const stem = name.slice(0, -'_quantized'.length)
    const scale = byName.get(`${stem}_scale`)
    const zero = byName.get(`${stem}_zero_point`)
    return scale && zero ? { scale: scale.value, zeroPoint: zero.value } : null
  }

  const total = manifest.bytes
  const rows = manifest.tensors
    .filter((t) => t.byteLength > 0)
    .map((t) => {
      const quant = quantOf(t.name)
      return {
        ...t,
        quant,
        rows: quant ? t.dims[0] : Math.ceil(t.elements / WINDOW_COLS),
        pct: (t.byteLength / total) * 100,
        left: (t.offset / total) * 100,
      }
    })

  const segments = [
    {
      key: '#graph',
      label: `graph · ${count(manifest.nodeCount)} nodes`,
      offset: manifest.graph.offset,
      byteLength: manifest.graph.byteLength,
      meta: true,
    },
    ...rows.map((t) => ({
      key: t.name,
      label: short(t.name),
      offset: t.offset,
      byteLength: t.byteLength,
      meta: false,
    })),
    {
      key: '#trailer',
      label: 'trailer · outputs and value shapes',
      offset: manifest.trailer.offset,
      byteLength: manifest.trailer.byteLength,
      meta: true,
    },
  ].map((s) => ({
    ...s,
    pct: (s.byteLength / total) * 100,
    left: (s.offset / total) * 100,
  }))

  // Brackets are runs, not categories: the f32 norms and biases of all six
  // blocks sit together at the front of the file, a long way from the
  // quantized weights of the blocks they belong to.
  const spans = new Map()
  const extend = (key, badge, label, t) => {
    const held = spans.get(key)
    const from = t.offset
    const to = t.offset + t.byteLength
    if (!held) spans.set(key, { key, badge, label, from, to })
    else {
      held.from = Math.min(held.from, from)
      held.to = Math.max(held.to, to)
    }
  }
  extend('graph', 'graph', 'graph metadata', {
    offset: manifest.graph.offset,
    byteLength: manifest.graph.byteLength,
  })
  for (const t of rows) {
    if (t.quant) {
      const group = groupOf(t.name)
      extend(group.key, group.badge, group.label, t)
    } else {
      extend('f32', 'f32', 'f32 norms and biases', t)
    }
  }
  extend('trailer', 'end', 'the trailer', {
    offset: manifest.trailer.offset,
    byteLength: manifest.trailer.byteLength,
  })
  const brackets = [...spans.values()]
    .sort((a, b) => a.from - b.from)
    .map((s) => ({
      ...s,
      pct: ((s.to - s.from) / total) * 100,
      left: (s.from / total) * 100,
    }))

  const blocks = brackets.filter((b) => b.key.startsWith('block ')).length
  const key =
    `left to right: graph metadata · f32 norms and biases · wte · wpe · ` +
    `${blocks} blocks of weights · the trailer`

  const quantized = rows.filter((t) => t.quant)
  const perTensor = quantized.every((t) => {
    const stem = t.name.slice(0, -'_quantized'.length)
    return byName.get(`${stem}_scale`)?.elements === 1
  })
  const stat =
    `${count(manifest.tensorCount)} tensors · ${mb(manifest.weightBytes)} of weights ` +
    `in an ${mb(manifest.bytes)} file · ≈${(manifest.parameters / 1e6).toFixed(1)}M parameters` +
    (perTensor && quantized.length > 0
      ? ' · 8-bit integers, one scale per tensor'
      : '')

  return { rows, segments, brackets, key, stat, byName }
}

/**
 * Whether a live manifest is the shipped one, field by field.
 *
 * It exists for the case where there is no hash to lean on: on a non-secure
 * origin SubtleCrypto is absent, and without it the panel can only claim what
 * it has actually compared. 128 entries, compared once.
 */
function manifestDiffers(a, b) {
  if (!a || !b) return true
  for (const key of ['bytes', 'nodeCount', 'tensorCount', 'weightBytes', 'parameters']) {
    if (a[key] !== b[key]) return true
  }
  for (const key of ['graph', 'trailer']) {
    if (a[key].offset !== b[key].offset || a[key].byteLength !== b[key].byteLength) return true
  }
  if (a.tensors.length !== b.tensors.length) return true
  for (let i = 0; i < a.tensors.length; i++) {
    const x = a.tensors[i]
    const y = b.tensors[i]
    if (
      x.name !== y.name ||
      x.dtype !== y.dtype ||
      x.elements !== y.elements ||
      x.byteLength !== y.byteLength ||
      x.offset !== y.offset ||
      x.value !== y.value ||
      x.dims.length !== y.dims.length ||
      x.dims.some((d, j) => d !== y.dims[j])
    ) {
      return true
    }
  }
  return false
}

// --- the panels -------------------------------------------------------------

/** The bell curve, as one filled step path. */
function Curve({ histogram }) {
  const path = useMemo(() => {
    if (!histogram) return null
    const counts = histogram.counts
    const n = counts.length
    const peak = counts.reduce((m, c) => Math.max(m, c), 0) || 1
    const w = 680 / n
    const base = 104
    let d = `M 0 ${base}`
    for (let i = 0; i < n; i++) {
      const y = base - (counts[i] / peak) * 100
      d += ` L ${(i * w).toFixed(2)} ${y.toFixed(2)} L ${((i + 1) * w).toFixed(2)} ${y.toFixed(2)}`
    }
    return `${d} L 680 ${base} Z`
  }, [histogram])

  // Ticks in dequantized units, on round numbers, generated by index so the
  // one that lands on zero is exactly zero rather than a rounding of it.
  const ticks = useMemo(() => {
    if (!histogram) return []
    const { lo, hi } = histogram
    const span = hi - lo
    const power = Math.pow(10, Math.floor(Math.log10(span / 5)))
    const step =
      [1, 2, 5, 10].map((m) => m * power).find((s) => span / s <= 7) ?? power * 10
    const first = Math.ceil(lo / step)
    const out = []
    for (let i = first; i * step <= hi; i++) {
      const value = i * step
      out.push({ i, value, left: ((value - lo) / span) * 100 })
    }
    return out
  }, [histogram])

  // Vertical marks are drawn as rectangles a bin wide: the SVG stretches on
  // x only, and a hairline would stretch with it.
  const binWidth = histogram ? 680 / histogram.counts.length : 0
  const zeroX = histogram
    ? ((0 - histogram.lo) / (histogram.hi - histogram.lo)) * 680
    : null

  return (
    <div className="file-curve">
      <svg viewBox="0 0 680 108" preserveAspectRatio="none" aria-hidden="true">
        {zeroX !== null && zeroX >= 0 && zeroX <= 680 && (
          <rect
            x={zeroX - binWidth / 2}
            y="0"
            width={binWidth}
            height="104"
            className="file-curve-zero"
          />
        )}
        {path && <path d={path} className="file-curve-fill" />}
        <rect x="0" y="104" width="680" height="1" className="file-curve-axis" />
      </svg>
      <div className="file-curve-ticks">
        {ticks.map((tick) => (
          <span key={tick.i} style={{ transform: `translateX(${tick.left}%)` }}>
            <i>{tick.i === 0 ? '0' : sig(tick.value, 2)}</i>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function FileView({ text, ranKey, modelStatus, progress, onLoad }) {
  const [facts, setFacts] = useState(null)
  const [live, setLive] = useState(null)
  const [liveError, setLiveError] = useState(null)
  const [histograms, setHistograms] = useState(() => new Map())
  const [windows, setWindows] = useState(() => new Map())
  const [mismatches, setMismatches] = useState([])
  const [manifestMatch, setManifestMatch] = useState(null)
  const [selected, setSelected] = useState(WTE)
  const [page, setPage] = useState(0)
  const [cell, setCell] = useState(null)
  const [hovered, setHovered] = useState(null)
  // The reader changed the text and the model ran on it; this is what the
  // file hashed to when that happened. 'reading' while the hash is in flight,
  // then {sha} — or {error} if the read failed.
  const [afterRun, setAfterRun] = useState(null)
  // The text the panel's current statement is about. Set once the live read
  // has landed, so the first sentence typed after that is a change and the
  // sentence that was already there is not.
  const answeredFor = useRef(null)

  const listRef = useRef(null)
  const canvasRef = useRef(null)
  const readoutId = useId()
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const ready = modelStatus === 'ready'

  const noteMismatch = useCallback((text) => {
    setMismatches((prev) => (prev.includes(text) ? prev : [...prev, text]))
  }, [])

  // The shipped reading is its own chunk. Section 01 is the top of the page,
  // so it is fetched immediately — the win is not that it might be skipped,
  // it is that 200 KB of tensor manifest is off the initial bundle's download
  // and parse path and arrives in parallel with it.
  useEffect(() => {
    let cancelled = false
    import('../content/fileFacts.json')
      .then((module) => {
        if (!cancelled) setFacts(module.default)
      })
      .catch((error) => {
        console.error('[fixture-and-part] the shipped file reading is missing:', error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Once the bytes are in the browser, read them again from scratch.
  useEffect(() => {
    if (!ready) return undefined
    let cancelled = false
    readManifest()
      .then((result) => {
        if (!cancelled) setLive(result)
      })
      .catch((error) => {
        if (!cancelled) setLiveError(error.message)
      })
    return () => {
      cancelled = true
    }
  }, [ready])

  // The whole manifest, compared once when the live one lands. The hash makes
  // this redundant when there is a hash; when there is not, it is the only
  // thing the panel can honestly say it checked beyond one tensor.
  useEffect(() => {
    if (!live || !facts) return
    const differs = manifestDiffers(live.manifest, facts.manifest)
    setManifestMatch(!differs)
    if (differs) noteMismatch('the manifest')
  }, [live, facts, noteMismatch])

  const manifest = live?.manifest ?? facts?.manifest ?? null
  const header = useMemo(() => readHeader(manifest), [manifest])
  const entry = header?.rows.find((t) => t.name === selected) ?? null

  // One histogram per tensor, taken over every value in it. The worker yields
  // between requests, so instrument D is never waiting on more than one of
  // these.
  useEffect(() => {
    if (!live || !facts) return undefined
    if (histograms.has(selected)) return undefined
    let cancelled = false
    readHistogram(selected)
      .then((result) => {
        if (cancelled) return
        const shipped = facts.histograms[selected]
        if (shipped) {
          const same =
            shipped.counts.length === result.counts.length &&
            shipped.counts.every((c, i) => c === result.counts[i])
          if (!same) noteMismatch(`${short(selected)} distribution`)
        }
        setHistograms((prev) => new Map(prev).set(selected, result))
      })
      .catch((error) => {
        if (cancelled) return
        setLiveError(error.message)
      })
    return () => {
      cancelled = true
    }
  }, [live, facts, selected, histograms, noteMismatch])

  const windowKey = `${selected}@${page}`
  useEffect(() => {
    if (!live || !facts) return undefined
    if (windows.has(windowKey)) return undefined
    let cancelled = false
    readWindow(selected, page * WINDOW_ROWS, 0)
      .then((result) => {
        if (cancelled) return
        const shipped = page === 0 ? facts.windows[selected] : null
        if (shipped) {
          const expected = decodeWindow(shipped)
          const same = expected.data.every((v, i) => v === result.data[i])
          if (!same) noteMismatch(`${short(selected)} bytes`)
        }
        setWindows((prev) => new Map(prev).set(windowKey, result))
      })
      .catch((error) => {
        if (!cancelled) setLiveError(error.message)
      })
    return () => {
      cancelled = true
    }
  }, [live, facts, selected, page, windowKey, windows, noteMismatch])

  /**
   * The moment the whole instrument exists for.
   *
   * A reader types a new sentence, watches every instrument below change, and
   * reasonably expects this one to change too. It cannot: the file is the same
   * file. Saying nothing at that moment reads as the panel being broken, so
   * the panel goes and looks — it hashes all 83.5 MB again, in the worker,
   * and reports what it found.
   *
   * It waits for `ranKey`, which is the model's own run over the new text:
   * the claim is "you changed the text and the model ran, and the file still
   * did not change", and the second half of that has to have happened.
   *
   * Only with a hash in hand. Without SubtleCrypto there is nothing to
   * compare and the panel keeps its existing wording rather than inventing a
   * claim it did not check.
   */
  useEffect(() => {
    if (!ready || !live || !live.sha) return
    if (answeredFor.current === null) {
      answeredFor.current = text
      return
    }
    if (text === answeredFor.current) return
    if (!ranKey) return
    answeredFor.current = text
    let cancelled = false
    setAfterRun({ status: 'reading' })
    readSha()
      .then((sha) => {
        if (!cancelled) setAfterRun({ status: 'done', sha })
      })
      .catch((error) => {
        if (!cancelled) setAfterRun({ status: 'error', message: error.message })
      })
    return () => {
      cancelled = true
    }
  }, [ready, live, text, ranKey])

  const histogram = histograms.get(selected) ?? facts?.histograms[selected] ?? null
  const view = useMemo(() => {
    const held = windows.get(windowKey)
    if (held) return held
    if (page === 0 && facts?.windows[selected]) return decodeWindow(facts.windows[selected])
    return null
  }, [windows, windowKey, page, facts, selected])

  /**
   * How the values in view are laid out on the canvas.
   *
   * A quantized weight has rows of its own and keeps them: the window is 32
   * of the tensor's rows by 96 of its columns, and the grid is that, so a
   * cell is in the same place the number is in the file.
   *
   * An f32 vector has no rows at all — it is a run of 768 or 3072 numbers —
   * so the panel picks a wrap that fills the same fixed canvas with roughly
   * square cells rather than leaving three quarters of it empty. The eyebrow
   * prints the wrap it chose, because it is the panel's choice and not the
   * file's.
   */
  const grid = useMemo(() => {
    if (!view) return null
    if (view.kind === 'bytes') {
      return { cols: WINDOW_COLS, rows: WINDOW_ROWS, drawCols: view.cols, drawRows: view.rows }
    }
    const total = view.data.length
    const aspect =
      canvasSize.width > 0 && canvasSize.height > 0
        ? canvasSize.width / canvasSize.height
        : WINDOW_COLS / WINDOW_ROWS
    const cols = Math.max(1, Math.min(total, Math.round(Math.sqrt(total * aspect))))
    const rows = Math.ceil(total / cols)
    return { cols, rows, drawCols: cols, drawRows: rows }
  }, [view, canvasSize])

  const pages = entry ? Math.ceil(entry.rows / WINDOW_ROWS) : 1
  const maxAbs = histogram
    ? Math.max(Math.abs(histogram.stats.min), Math.abs(histogram.stats.max)) || 1
    : 1

  // --- selection ------------------------------------------------------------

  const select = useCallback((name) => {
    setSelected(name)
    setPage(0)
    setCell(null)
  }, [])

  // Keeps the selected row visible without ever scrolling the page: only the
  // list's own scrollTop moves, and only when the row is outside it.
  useEffect(() => {
    const box = listRef.current
    const row = box?.querySelector('[data-selected="1"]')
    if (!box || !row) return
    // Below the box — which is where the default selection sits, fifty rows
    // down — the row goes to the top, so what follows it is visible too. A
    // row the reader can already see is never moved.
    if (row.offsetTop < box.scrollTop) box.scrollTop = row.offsetTop
    else if (row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = row.offsetTop
    }
  }, [selected, header])

  // --- the canvas -----------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([box]) => {
      const rect = box.contentRect
      // A zero measurement is never a size the canvas is actually being drawn
      // at — it is the element mid-layout — and letting one through would
      // collapse the wrap the f32 grid is computed from and leave the eyebrow
      // saying "wrapped at 1" over a picture that is nothing of the sort.
      if (rect.width <= 0 || rect.height <= 0) return
      setCanvasSize({ width: rect.width, height: rect.height })
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { width, height } = canvasSize
    if (width <= 0 || height <= 0) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    if (!view || !grid) return
    // Read on every draw, so the window follows the page's tokens rather than
    // a copy of them taken at mount.
    const ramp = readRamp()
    if (!ramp) return
    const cellW = width / grid.cols
    const cellH = height / grid.rows
    // A hairline of the screen's own ground between cells, so the window
    // reads as a grid of separate numbers rather than as one wash. Dropped
    // below 7px, where a whole pixel of gutter would be a fifth of the cell
    // and the picture would go to lace.
    const gutter = Math.min(cellW, cellH) >= 7 ? 1 : 0

    const quant = entry?.quant
    for (let r = 0; r < grid.drawRows; r++) {
      for (let c = 0; c < grid.drawCols; c++) {
        const i = r * grid.drawCols + c
        if (i >= view.data.length) break
        const value = quant
          ? quant.scale * (rawValue(view.dtype, view.data[i]) - quant.zeroPoint)
          : view.data[i]
        // A square root rather than a straight line: almost every weight in
        // this file is tiny, and a linear ramp against the largest one would
        // paint the whole window the background colour and call it a reading.
        const t = Math.min(1, Math.sqrt(Math.abs(value) / maxAbs))
        ctx.fillStyle = rampColour(ramp, t)
        ctx.fillRect(
          c * cellW,
          r * cellH,
          Math.max(1, Math.ceil(cellW) - gutter),
          Math.max(1, Math.ceil(cellH) - gutter),
        )
      }
    }

    if (cell && cell.row < grid.drawRows && cell.col < grid.drawCols) {
      ctx.strokeStyle = rampColour(ramp, 1)
      ctx.lineWidth = 1
      ctx.strokeRect(
        cell.col * cellW - 0.5,
        cell.row * cellH - 0.5,
        cellW + 1,
        cellH + 1,
      )
    }
  }, [canvasSize, view, grid, entry, maxAbs, cell])

  const pickCell = useCallback(
    (event) => {
      if (!view || !grid) return
      const rect = event.currentTarget.getBoundingClientRect()
      const col = Math.floor(((event.clientX - rect.left) / rect.width) * grid.cols)
      const row = Math.floor(((event.clientY - rect.top) / rect.height) * grid.rows)
      if (row < 0 || col < 0 || row >= grid.drawRows || col >= grid.drawCols) return
      if (row * grid.drawCols + col >= view.data.length) return
      setCell({ row, col })
    },
    [view, grid],
  )

  const onCanvasKey = useCallback(
    (event) => {
      if (!view || !grid) return
      const deltas = {
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
      }
      const delta = deltas[event.key]
      if (!delta) return
      event.preventDefault()
      setCell((prev) => {
        const from = prev ?? { row: 0, col: 0 }
        const row = Math.max(0, Math.min(grid.drawRows - 1, from.row + delta[0]))
        const col = Math.max(0, Math.min(grid.drawCols - 1, from.col + delta[1]))
        // The last row of a wrapped vector is usually short; a move past its
        // end stays where it was rather than landing on nothing.
        return row * grid.drawCols + col >= view.data.length ? prev : { row, col }
      })
    },
    [view, grid],
  )

  // --- the lines that say what is on screen ---------------------------------

  const blobEyebrow = () => {
    if (!entry || !view) return '—'
    const first = view.row0 * (entry.quant ? 1 : WINDOW_COLS)
    if (entry.quant) {
      return (
        `${entry.name} · rows ${count(view.row0)}–${count(view.row0 + view.rows - 1)} ` +
        `of ${count(entry.rows)} · cols 0–${view.cols - 1} of ${count(entry.dims[1] ?? 1)} ` +
        `· raw bytes, ${entry.dtype}`
      )
    }
    return (
      `${entry.name} · values ${count(first)}–${count(first + view.data.length - 1)} ` +
      `of ${count(entry.elements)} · wrapped at ${grid?.cols ?? WINDOW_COLS} · ${entry.dtype}`
    )
  }

  const NOTHING_PICKED =
    'click a square, or press the arrow keys inside the window, for one value'

  const readout = () => {
    if (!entry || !view || !grid) return 'no tensor selected'
    if (!cell || cell.row >= grid.drawRows || cell.col >= grid.drawCols) {
      return NOTHING_PICKED
    }
    const i = cell.row * grid.drawCols + cell.col
    if (i >= view.data.length) return NOTHING_PICKED
    if (!entry.quant) {
      const index = view.row0 * WINDOW_COLS + i
      return `index ${count(index)} · ${sig(view.data[i], 6)}`
    }
    // The stored byte and its reading are not the same number for i8 — 241 in
    // the file is −15 as an i8 — and it is the reading that goes into the
    // arithmetic, so the line names the dtype rather than calling it a byte.
    const q = rawValue(view.dtype, view.data[i])
    const zp = entry.quant.zeroPoint
    const value = entry.quant.scale * (q - zp)
    const row = view.row0 + cell.row
    const piece = entry.name === WTE ? tokenOf(row) : null
    return (
      `row ${count(row)} · col ${count(view.col0 + cell.col)} · ${entry.dtype} ${plain(q)} · ` +
      `(${plain(q)} ${NBSP_MINUS} ${plain(zp)}) × ${sig(entry.quant.scale, 5)} = ${signed(value, 4)}` +
      // A wte row is a token id, so the row number names a piece of the
      // vocabulary. The low ids are single raw bytes and print as one
      // replacement character; that is what is in the table.
      (piece ? ` · token "${piece}"` : '')
    )
  }

  const barReadout = () => {
    const segment = header?.segments.find((s) => s.key === (hovered ?? selected))
    if (!segment) return '—'
    return (
      `${segment.label} · ${count(segment.byteLength)} bytes · ` +
      `offset ${count(segment.offset)} · ${segment.pct.toFixed(segment.pct < 1 ? 3 : 1)}% of the file`
    )
  }

  const curveStat = () => {
    if (!histogram) return '—'
    const s = histogram.stats
    const parts = [
      `n = ${count(s.n)}`,
      `μ ${signed(s.mean, 4)}`,
      `σ ${sig(s.std, 3)}`,
      `${Math.round(s.within10 * 100)}% within ±0.1`,
    ]
    if (entry?.quant) {
      parts.push(`scale ${sig(entry.quant.scale, 5)}`, `zero point ${entry.quant.zeroPoint}`)
    } else {
      parts.push('f32, stored as written')
    }
    return parts.join(' · ')
  }

  // Derived, never stored: a separate `reading` flag went stale whenever a
  // second selection arrived before the first read had landed, because the
  // effect for an already-cached tensor returns early and had nothing to
  // clear. What has landed is the only thing worth asking.
  //
  // Eighty pixels, so the words have to be short. Which reading is on screen
  // is spelled out in full underneath.
  const source = () => {
    if (!ready) return 'from the build'
    if (liveError) return 'from the build'
    if (!histograms.has(selected)) return 'reading…'
    return 'read live'
  }

  /**
   * Where the numbers came from, and whether the file they came from is still
   * the file sitting in this browser.
   *
   * Every branch says what was actually observed. The panel never claims a
   * check it did not run — which is why there is a branch for a browser with
   * no hashing at all, and why a file that reads differently is reported as
   * exactly that rather than explained away.
   */
  const proof = () => {
    const p = facts?.provenance
    if (!p) return { text: 'reading the file…' }
    if (!ready) {
      return {
        text:
          `these numbers were read from the model file on ${p.readAt}, when this ` +
          `page was built. load the model and the page reads the same file again, ` +
          `right here.`,
      }
    }
    if (liveError) {
      return {
        alert: true,
        text:
          `the file in this browser could not be read — ${liveError}. ` +
          `the numbers shown are the ones read on ${p.readAt}.`,
      }
    }
    if (!live) return { text: 'reading the whole model file again…' }

    // Whether what is on screen for the selected tensor is the live reading
    // or still the shipped one. Until both have landed the panel is showing
    // the shipped numbers, and must not say otherwise.
    const liveHere = histograms.has(selected) && windows.has(windowKey)

    if (live.sha && live.sha !== p.sha256) {
      // What the difference means is not knowable from here — a new upload, a
      // re-quantized variant and a damaged copy all read the same — so this
      // says what was observed and stops.
      return {
        alert: true,
        text:
          `the file in this browser is not the file read on ${p.readAt} ` +
          `(fingerprint sha256 ${shortSha(live.sha)}) — ` +
          (liveHere
            ? 'the numbers shown are read from it'
            : 'still reading this tensor out of it'),
      }
    }
    if (mismatches.length > 0) {
      const more = mismatches.length > 1 ? ` and ${mismatches.length - 1} more` : ''
      return {
        alert: true,
        text:
          `the file in this browser has the same fingerprint but reads ` +
          `differently — ${mismatches[0]}${more} — the numbers shown are read from it`,
      }
    }

    // The reader changed the text, the model ran, and the panel went back to
    // the file to see whether anything about it had moved.
    if (afterRun && live.sha) {
      if (afterRun.status === 'reading') {
        return { text: 'you changed the text and the model ran. reading the file again…' }
      }
      if (afterRun.status === 'error') {
        return {
          alert: true,
          text:
            `you changed the text and the model ran. the file could not be read ` +
            `again just now — ${afterRun.message}`,
        }
      }
      if (afterRun.sha && afterRun.sha !== p.sha256) {
        return {
          alert: true,
          text:
            `you changed the text and the model ran, and the file read ` +
            `differently just now (sha256 ${shortSha(afterRun.sha)}) — that is ` +
            `not the file these numbers came from.`,
        }
      }
      if (afterRun.sha) {
        return {
          text:
            `you changed the text and the model ran. the file did not change — ` +
            `read again just now, still the same file ` +
            `(sha256 ${shortSha(afterRun.sha)}).`,
        }
      }
    }

    if (live.sha) {
      return {
        text:
          `this page just read the whole model file again (${mb(p.bytes)}) — byte ` +
          `for byte the same file that was read on ${p.readAt}. fingerprint ` +
          `sha256 ${shortSha(live.sha)}.`,
      }
    }
    // No SubtleCrypto: a non-secure origin. Without a fingerprint of the whole
    // file the only honest claim is the one covering what was actually
    // compared.
    if (manifestMatch === null || !liveHere) {
      return {
        text:
          `this page is reading the model file again here · no fingerprint can ` +
          `be taken in this browser · still comparing it with the file read on ` +
          `${p.readAt}`,
      }
    }
    return {
      text:
        `this page just read the model file again here · no fingerprint can be ` +
        `taken in this browser · the tensor list and this tensor's bytes match ` +
        `the file read on ${p.readAt}`,
    }
  }

  // The note has a row of its own in this instrument's head at every width,
  // so the sentence can say what it means rather than fit beside a title.
  const size = mb(facts?.provenance.bytes ?? 0)
  const label = ready
    ? `read live from the model file, here in your browser · ${size}`
    : `read from the model file when this page was built · ${size}`

  const proofLine = proof()

  return (
    <figure className="instrument">
      <div className="inst-head is-stacked">
        <span className="inst-title">INSTRUMENT E &mdash; THE FILE</span>
        <LoadNote
          label={label}
          action="load the model to read it live"
          status={modelStatus}
          progress={progress}
          onLoad={onLoad}
        />
      </div>

      <div className="inst-body">
        <div className="label-row tight">
          <span className="field-label">the header &mdash; every tensor</span>
          <InfoTag topic="file" />
        </div>
        <p className="file-stat">{header?.stat ?? '—'}</p>

        <div className="file-list" ref={listRef}>
          {(header?.rows ?? []).map((t) => (
            <button
              type="button"
              key={t.name}
              className={`file-row${t.name === selected ? ' is-on' : ''}`}
              data-selected={t.name === selected ? '1' : '0'}
              aria-pressed={t.name === selected}
              title={t.name}
              onClick={() => select(t.name)}
            >
              <span className="file-row-name">{short(t.name)}</span>
              <span className="file-row-shape">[{t.dims.join('×')}]</span>
              <span className="file-row-type">{t.dtype}</span>
              <span className="file-row-bytes">{count(t.byteLength)}</span>
              <span className="file-row-note">
                {t.quant
                  ? `scale ${sig(t.quant.scale, 5)} · zero point ${t.quant.zeroPoint} · offset ${count(t.offset)}`
                  : `${count(t.elements)} values · offset ${count(t.offset)}`}
              </span>
            </button>
          ))}
        </div>

        <div className="label-row">
          <span className="field-label">the file, drawn to scale</span>
          <InfoTag topic="fileHeader" />
        </div>
        <div
          className="file-bar-wrap"
          onMouseLeave={() => setHovered(null)}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            const at = ((event.clientX - rect.left) / rect.width) * (manifest?.bytes ?? 1)
            const hit = header?.segments.find(
              (s) => at >= s.offset && at < s.offset + s.byteLength,
            )
            setHovered(hit ? hit.key : null)
          }}
        >
          <div className="file-ticks" aria-hidden="true">
            {(header?.rows ?? [])
              .filter((t) => t.pct < CLICKABLE_PCT || t.name === selected)
              .map((t) => (
                <i
                  key={t.name}
                  className={`file-tick${t.name === selected ? ' is-on' : ''}`}
                  style={{ left: `${t.left}%` }}
                />
              ))}
          </div>
          <div className="file-bar">
            {(header?.segments ?? []).map((s) =>
              !s.meta && s.pct >= CLICKABLE_PCT ? (
                <button
                  type="button"
                  key={s.key}
                  className={`file-seg${s.key === selected ? ' is-on' : ''}`}
                  style={{ left: `${s.left}%`, width: `${s.pct}%` }}
                  aria-pressed={s.key === selected}
                  aria-label={s.label}
                  title={s.label}
                  onClick={() => select(s.key)}
                />
              ) : (
                <span
                  key={s.key}
                  className={`file-seg is-flat${s.meta ? ' is-meta' : ''}`}
                  style={{ left: `${s.left}%`, width: `${s.pct}%` }}
                  aria-hidden="true"
                />
              ),
            )}
          </div>
          <div className="file-brackets" aria-hidden="true">
            {(header?.brackets ?? []).map((b) => (
              <span
                key={b.key}
                className="file-bracket"
                style={{ left: `${b.left}%`, width: `${b.pct}%` }}
              >
                {b.pct >= LABELLED_PCT ? b.badge : ''}
              </span>
            ))}
          </div>
        </div>
        <p className="file-bar-readout">{barReadout()}</p>
        <p className="file-bar-key">{header?.key ?? '—'}</p>

        <div className="label-row file-label">
          <span className="field-label">the bytes &mdash; one small window</span>
          <InfoTag topic="fileBlob" />
          <span className="file-source">{source()}</span>
        </div>
        <p className="file-eyebrow">{blobEyebrow()}</p>
        <div className="file-canvas-box screen">
          {/* Not an image: it takes focus and the arrow keys move a reading
              around inside it, and an image role would have it announced as
              something to look at rather than something to operate. The
              readout below is its description, and it is polite-live, so a
              move is spoken. */}
          <canvas
            ref={canvasRef}
            className="file-canvas"
            tabIndex={0}
            role="application"
            aria-label={`the bytes — ${blobEyebrow()} — arrow keys move the reading`}
            aria-describedby={readoutId}
            onClick={pickCell}
            onKeyDown={onCanvasKey}
          />
        </div>
        <div className="file-blob-controls">
          <button
            type="button"
            className="btn"
            disabled={page === 0}
            onClick={() => {
              setPage((p) => Math.max(0, p - 1))
              setCell(null)
            }}
          >
            &larr; ROWS
          </button>
          <button
            type="button"
            className="btn"
            disabled={page >= pages - 1 || (!live && pages > 1)}
            onClick={() => {
              setPage((p) => Math.min(pages - 1, p + 1))
              setCell(null)
            }}
          >
            ROWS &rarr;
          </button>
          <span className="file-page">
            {!live && pages > 1
              ? `window ${page + 1} of ${count(pages)} — load the model to move it`
              : `window ${page + 1} of ${count(pages)}`}
          </span>
        </div>
        <p className="file-readout" id={readoutId} aria-live="polite">
          {readout()}
        </p>

        <div className="label-row">
          <span className="field-label">the bell curve &mdash; every value</span>
          <InfoTag topic="fileCurve" />
        </div>
        <Curve histogram={histogram} />
        <p className="file-curve-stat">{curveStat()}</p>

        <p
          className={`file-proof${proofLine.alert ? ' is-alert' : ''}`}
          aria-live="polite"
        >
          {proofLine.text}
        </p>
      </div>

      <figcaption>
        FIG.1 &mdash; The file the model is: every tensor in
        decoder_model_quantized.onnx, one window of one tensor&rsquo;s bytes,
        and the distribution of a whole one. Read from the file &mdash; nothing
        here is illustrative.
      </figcaption>
    </figure>
  )
}

/** The piece of text a wte row belongs to, once the tokenizer is in hand. */
function tokenOf(id) {
  try {
    return tokenText(id)
  } catch {
    return null
  }
}
