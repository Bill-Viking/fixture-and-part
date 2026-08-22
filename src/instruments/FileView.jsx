import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InfoTag from '../components/InfoTag.jsx'
import LoadNote from '../components/LoadNote.jsx'
import {
  decodeWindow,
  readHistogram,
  readManifest,
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
 * Weights at rest, so the blob is painted in one colour and its magnitude:
 * the panel's own background through steel to the page's text colour. The
 * tokens are read off the document rather than copied, so the ramp cannot
 * drift away from the palette.
 */
function readRamp() {
  const fallback = ['#0D1218', '#5B7A99', '#D8E0E8']
  if (typeof document === 'undefined') return fallback.map(rgbOf)
  const style = getComputedStyle(document.documentElement)
  return ['--panel2', '--steel', '--text'].map((token, i) =>
    rgbOf(style.getPropertyValue(token) || fallback[i]),
  )
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
          <span key={tick.i} style={{ left: `${tick.left}%` }}>
            {tick.i === 0 ? '0' : sig(tick.value, 2)}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function FileView({ modelStatus, progress, onLoad }) {
  const [facts, setFacts] = useState(null)
  const [live, setLive] = useState(null)
  const [liveError, setLiveError] = useState(null)
  const [histograms, setHistograms] = useState(() => new Map())
  const [windows, setWindows] = useState(() => new Map())
  const [mismatches, setMismatches] = useState([])
  const [selected, setSelected] = useState(WTE)
  const [page, setPage] = useState(0)
  const [cell, setCell] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [reading, setReading] = useState(false)

  const listRef = useRef(null)
  const canvasRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const ramp = useMemo(readRamp, [])

  const ready = modelStatus === 'ready'

  // The shipped reading is its own chunk: a reader who never reaches section
  // 01 never downloads 200 KB of tensor manifest.
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

  const manifest = live?.manifest ?? facts?.manifest ?? null
  const header = useMemo(() => readHeader(manifest), [manifest])
  const entry = header?.rows.find((t) => t.name === selected) ?? null

  const noteMismatch = useCallback((text) => {
    setMismatches((prev) => (prev.includes(text) ? prev : [...prev, text]))
  }, [])

  // One histogram per tensor, taken over every value in it. The worker yields
  // between requests, so instrument D is never waiting on more than one of
  // these.
  useEffect(() => {
    if (!live || !facts) return undefined
    if (histograms.has(selected)) return undefined
    let cancelled = false
    setReading(true)
    readHistogram(selected)
      .then((result) => {
        if (cancelled) return
        const shipped = facts.histograms[selected]
        if (shipped) {
          const same =
            shipped.counts.length === result.counts.length &&
            shipped.counts.every((c, i) => c === result.counts[i])
          if (!same) noteMismatch(`${selected}: distribution`)
        }
        setHistograms((prev) => new Map(prev).set(selected, result))
        setReading(false)
      })
      .catch((error) => {
        if (cancelled) return
        setLiveError(error.message)
        setReading(false)
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
          if (!same) noteMismatch(`${selected}: bytes`)
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

  const histogram = histograms.get(selected) ?? facts?.histograms[selected] ?? null
  const view = useMemo(() => {
    const held = windows.get(windowKey)
    if (held) return held
    if (page === 0 && facts?.windows[selected]) return decodeWindow(facts.windows[selected])
    return null
  }, [windows, windowKey, page, facts, selected])

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
    if (row.offsetTop < box.scrollTop) box.scrollTop = row.offsetTop
    else if (row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight
    }
  }, [selected, header])

  // --- the canvas -----------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([box]) => {
      const rect = box.contentRect
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

    const cellW = width / WINDOW_COLS
    const cellH = height / WINDOW_ROWS
    if (!view) return

    const quant = entry?.quant
    for (let r = 0; r < view.rows; r++) {
      for (let c = 0; c < view.cols; c++) {
        const i = r * view.cols + c
        if (i >= view.data.length) break
        const value = quant
          ? quant.scale * (rawValue(view.dtype, view.data[i]) - quant.zeroPoint)
          : view.data[i]
        // A square root rather than a straight line: almost every weight in
        // this file is tiny, and a linear ramp against the largest one would
        // paint the whole window the background colour and call it a reading.
        const t = Math.min(1, Math.sqrt(Math.abs(value) / maxAbs))
        ctx.fillStyle = rampColour(ramp, t)
        ctx.fillRect(c * cellW, r * cellH, Math.ceil(cellW), Math.ceil(cellH))
      }
    }

    if (cell && cell.row < view.rows && cell.col < view.cols) {
      ctx.strokeStyle = rampColour(ramp, 1)
      ctx.lineWidth = 1
      ctx.strokeRect(
        cell.col * cellW - 0.5,
        cell.row * cellH - 0.5,
        cellW + 1,
        cellH + 1,
      )
    }
  }, [canvasSize, view, entry, maxAbs, ramp, cell])

  const pickCell = useCallback(
    (event) => {
      if (!view) return
      const rect = event.currentTarget.getBoundingClientRect()
      const col = Math.floor(((event.clientX - rect.left) / rect.width) * WINDOW_COLS)
      const row = Math.floor(((event.clientY - rect.top) / rect.height) * WINDOW_ROWS)
      if (row < 0 || col < 0 || row >= view.rows || col >= view.cols) return
      setCell({ row, col })
    },
    [view],
  )

  const onCanvasKey = useCallback(
    (event) => {
      if (!view) return
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
        return {
          row: Math.max(0, Math.min(view.rows - 1, from.row + delta[0])),
          col: Math.max(0, Math.min(view.cols - 1, from.col + delta[1])),
        }
      })
    },
    [view],
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
      `of ${count(entry.elements)} · wrapped at ${WINDOW_COLS} · ${entry.dtype}`
    )
  }

  const readout = () => {
    if (!entry || !view) return 'no tensor selected'
    if (!cell || cell.row >= view.rows || cell.col >= view.cols) {
      return 'click a byte, or press the arrow keys inside the blob, for one value'
    }
    const i = cell.row * view.cols + cell.col
    if (i >= view.data.length) {
      return 'click a byte, or press the arrow keys inside the blob, for one value'
    }
    if (!entry.quant) {
      const index = (view.row0 + cell.row) * WINDOW_COLS + cell.col
      return `index ${count(index)} · ${sig(view.data[i], 6)}`
    }
    const q = rawValue(view.dtype, view.data[i])
    const zp = entry.quant.zeroPoint
    const value = entry.quant.scale * (q - zp)
    const row = view.row0 + cell.row
    const piece = entry.name === WTE ? tokenOf(row) : null
    return (
      `row ${count(row)} · col ${count(view.col0 + cell.col)} · byte ${plain(q)} · ` +
      `(${plain(q)} ${NBSP_MINUS} ${plain(zp)}) × ${sig(entry.quant.scale, 5)} = ${signed(value, 4)}` +
      (piece ? ` · token ${piece}` : '')
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

  const source = () => {
    if (!ready) return 'ahead of time'
    if (liveError) return 'shipped copy'
    if (reading || !histograms.has(selected)) return 're-reading…'
    return 're-read here'
  }

  const proof = () => {
    const p = facts?.provenance
    if (!p) return 'reading the file…'
    if (!ready) {
      return (
        `read from the file ahead of time on ${p.readAt} · sha256 ${shortSha(p.sha256)} ` +
        `· load the real model to re-read it here`
      )
    }
    if (liveError) {
      return (
        `this browser's copy could not be read — ${liveError}. ` +
        `the numbers shown are the ones read on ${p.readAt}.`
      )
    }
    if (!live) return `re-reading this browser's cached copy…`
    if (live.sha && live.sha !== p.sha256) {
      return (
        `this browser's copy differs from the one read on ${p.readAt} ` +
        `(sha256 ${shortSha(live.sha)}) — the file on huggingface has changed; ` +
        `numbers shown are the live ones`
      )
    }
    if (mismatches.length > 0) {
      return (
        `this browser's copy hashes the same but reads differently ` +
        `(${mismatches.join(', ')}) — numbers shown are the live ones`
      )
    }
    const hash = live.sha ? `sha256 ${shortSha(live.sha)}` : 'byte for byte'
    return (
      `re-read from this browser's cached copy just now · ${hash} — ` +
      `identical to the copy read on ${p.readAt}`
    )
  }

  const label = ready
    ? `re-read from this browser's cached copy · ${mb(facts?.provenance.bytes ?? 0)}`
    : `from the file, read ahead of time · ${mb(facts?.provenance.bytes ?? 0)}`

  return (
    <figure className="instrument">
      <div className="inst-head">
        <span className="inst-title">INSTRUMENT E &mdash; THE FILE</span>
        <LoadNote
          label={label}
          status={modelStatus}
          progress={progress}
          onLoad={onLoad}
        />
      </div>

      <div className="inst-body">
        <div className="label-row tight">
          <span className="field-label">the header &mdash; every tensor, in file order</span>
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
          <span className="field-label">the blob &mdash; raw bytes</span>
          <InfoTag topic="fileBlob" />
          <span className="file-source">{source()}</span>
        </div>
        <p className="file-eyebrow">{blobEyebrow()}</p>
        <div className="file-canvas-box">
          <canvas
            ref={canvasRef}
            className="file-canvas"
            tabIndex={0}
            role="img"
            aria-label={blobEyebrow()}
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
              ? `window ${page + 1} of ${count(pages)} — load the real model to move it`
              : `window ${page + 1} of ${count(pages)}`}
          </span>
        </div>
        <p className="file-readout" aria-live="polite">
          {readout()}
        </p>

        <div className="label-row">
          <span className="field-label">the bell curve &mdash; every value in the tensor</span>
          <InfoTag topic="fileCurve" />
        </div>
        <Curve histogram={histogram} />
        <p className="file-curve-stat">{curveStat()}</p>

        <p className="file-proof" aria-live="polite">
          {proof()}
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
