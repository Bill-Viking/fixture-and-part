import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import InfoTag from '../components/InfoTag.jsx'
import LoadNote from '../components/LoadNote.jsx'
import {
  decodeWindow,
  readColumnStats,
  readHistogram,
  readManifest,
  readSha,
  readWindow,
} from '../lib/fileBytes.js'
import { mb, shortSha } from '../lib/fileFormat.js'
import { WINDOW_COLS, WINDOW_ROWS, rawValue, standoutColumns } from '../lib/onnxScan.js'
import { labelOf, needsSpelling } from '../lib/pieceLabel.js'
import { loadModel, realTokenize, tokenText } from '../lib/realModel.js'
import { DEFAULT_SENTENCE } from '../lib/toyModel.js'
import InstrumentHead from '../components/InstrumentHead.jsx'

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
const WPE = 'transformer.wpe.weight_quantized'
/**
 * How close a live column number has to sit to the shipped one to agree. The
 * shipped numbers are written to four decimals, so a true agreement is never
 * further apart than half of the last place.
 */
const COLUMN_TOLERANCE = 1e-4
/**
 * Where the page's own sentence puts the one word the page follows: its fifth
 * token, " it" — the index App.jsx's `realQueryIndex` points instrument C at,
 * and the row the build lit (`litRow` in fileFacts.json). Once the model is
 * loaded the instrument tokenizes the sentence again and checks the two agree.
 */
const FOLLOWED_INDEX = 4
/** The plain line above the window, for the word table; every other tensor keeps the line empty. */
const SIGN =
  'every word the model knows is a row of numbers like these · the lit row is "it", the word this page follows'
/** Below this share of the file a segment is thinner than a pixel: no lies. */
const CLICKABLE_PCT = 0.5
/** And below this a bracket cannot hold its own label. */
const LABELLED_PCT = 3

// --- formatting -------------------------------------------------------------

const NBSP_MINUS = '−'

const count = (n) => n.toLocaleString('en-US')
const signed = (v, dp) => `${v < 0 ? NBSP_MINUS : '+'}${Math.abs(v).toFixed(dp)}`
const plain = (v) => String(v).replace('-', NBSP_MINUS)
const short = (name) => name.replace(/^transformer\./, '')
const sig = (v, digits) => {
  const text = Number(v.toPrecision(digits)).toString()
  return text.replace('-', NBSP_MINUS)
}

/** The text cut to `keep` characters and an ellipsis once it runs past `longest`. */
const cut = (text, keep, longest) => {
  const chars = Array.from(text)
  return chars.length > longest ? `${chars.slice(0, keep).join('')}…` : text
}
/** A row label holds six characters; a word piece in the readout, twenty-four. */
const rowLabelText = (piece) => cut(piece, 5, 6)
const readoutPiece = (piece) => cut(piece, 23, 24)

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
/** The plain words for how a standout slot stands out, in either position. */
const STANDOUT_WORDS = {
  same: { first: 'holds nearly the same number for every word', later: 'holds nearly the same number for every word', pick: 'nearly the same for every word' },
  low: { first: 'runs low for nearly every word', later: 'runs low for nearly all of them', pick: 'runs low for nearly every word' },
  high: { first: 'runs high for nearly every word', later: 'runs high for nearly all of them', pick: 'runs high for nearly every word' },
}

/**
 * The page a tensor's window opens on: the one the build shipped. Every tensor
 * ships its first rows except the word table, which ships the 24 rows holding
 * the lit row (rows 336–359), so it opens at page 14 and the reading taken in
 * the browser at that page is the one compared with the shipped bytes.
 */
const shippedPageOf = (facts, name) => {
  const shipped = facts?.windows[name]
  return shipped ? Math.floor(shipped.row0 / WINDOW_ROWS) : 0
}

/**
 * What the proof line has found, as a state rather than a sentence — the
 * finding this instrument hands up to the page, so that section 07's file
 * card can say the same thing in its own words without taking a reading of
 * its own.
 *
 * The branches are `proof()`'s, in `proof()`'s own order, and nothing else:
 * whatever the line below the curve says, this says the same of it. `sha` is
 * the fingerprint the state rests on — the live one for `same` and for a file
 * that reads differently, the one taken after the run for `same-after-run` —
 * and null where the state rests on none.
 *
 * A file whose fingerprint matches but whose numbers read differently is
 * `differs` too: the bytes read differently, so the numbers on the page did
 * not come from what was read, and that is what the card's line says.
 */
function findingOf({ p, ready, liveError, live, mismatches, afterRun }) {
  if (!p || !ready) return { state: 'unloaded', sha: null }
  if (liveError) return { state: 'error', sha: null }
  if (!live) return { state: 'reading', sha: null }
  if (live.sha && live.sha !== p.sha256) return { state: 'differs', sha: live.sha }
  if (mismatches.length > 0) return { state: 'differs', sha: live.sha ?? null }
  if (afterRun && live.sha) {
    if (afterRun.status === 'reading') return { state: 'reading', sha: null }
    if (afterRun.status === 'error') return { state: 'error', sha: null }
    if (afterRun.sha && afterRun.sha !== p.sha256) return { state: 'differs', sha: afterRun.sha }
    if (afterRun.sha) return { state: 'same-after-run', sha: afterRun.sha }
  }
  if (live.sha) return { state: 'same', sha: live.sha }
  // No SubtleCrypto: nothing to compare, and the card says nothing it did
  // not check. E's own line in section 01 says what was compared instead.
  return { state: 'no-fingerprint', sha: null }
}

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

/**
 * One colour token off the document, or null with the reason in the console —
 * the labels are not painted rather than painted in a guessed colour.
 *
 * The labels use --frozen-on-screen: they are the eyebrow's words, and the
 * eyebrow's role on a dark panel has exactly one allowed form (the colour
 * law at the head of styles.css). What is lit — a picked row, the hovered
 * slot, the two standout slots — uses the pick's own colour, the top of the
 * ramp, so the marks and the picked square are one colour.
 */
function readToken(token) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  if (!value) {
    if (import.meta.env.DEV) {
      console.error(`instrument E: ${token} is not defined; the window's labels cannot be painted`)
    }
    return null
  }
  return value
}

/**
 * The three bands inside the window that are not cells: the row labels at the
 * left, the slot labels at the top, the key at the bottom. Their sizes are
 * the stylesheet's (`--file-gutter-*` on .file-canvas-box), read here, so the
 * box's reserved height and the place the cells start are one number rather
 * than two copies of it.
 */
function readGutters(element) {
  const style = getComputedStyle(element)
  const px = (name) => parseFloat(style.getPropertyValue(name)) || 0
  return {
    left: px('--file-gutter-left'),
    top: px('--file-gutter-top'),
    bottom: px('--file-gutter-bottom'),
  }
}

/** Where the key's ticks sit, in values; the last is the tensor's own largest. */
const KEY_TICKS = [0, 0.05, 0.2, 0.5]
const KEY_SENTENCE = 'shade = size of the number, either sign · dark is near zero'
/** The canvas's own type: the page's mono, at a size a 10.5 px row holds with air. */
const LABEL_PX = 9
const MARK_PX = 7

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

export default function FileView({
  text,
  ranKey,
  selected,
  onSelectTensor,
  modelStatus,
  progress,
  onLoad,
  onProof,
}) {
  const [facts, setFacts] = useState(null)
  const [live, setLive] = useState(null)
  const [liveError, setLiveError] = useState(null)
  const [histograms, setHistograms] = useState(() => new Map())
  const [windows, setWindows] = useState(() => new Map())
  const [mismatches, setMismatches] = useState([])
  // The word table's columns over every one of its rows, read live — the
  // numbers the two standout marks rest on.
  const [liveColumns, setLiveColumns] = useState(null)
  const [manifestMatch, setManifestMatch] = useState(null)
  // The selected tensor is owned by App: instrument F's steel boxes select
  // rows here, and one selection cannot have two owners. WTE is still what it
  // opens on — that default now lives one level up.
  const setSelected = onSelectTensor
  // The page the reader has moved the window to, and for which tensor. Until
  // the reader moves it — and whenever the tensor changes, from here or from
  // instrument F's boxes — the window is on the page the build shipped.
  const [paged, setPaged] = useState(null)
  // The tokenizer's own vocabulary, id → piece as byte-level BPE spells it,
  // read from the loaded tokenizer once the model is in (its public
  // `get_vocab()`): the spelling a row prints where its decoded piece is a
  // replacement glyph or a control character.
  const [spellings, setSpellings] = useState(null)
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
  // The cell under the pointer. A ref, not state: hovering repaints the
  // labels and nothing else, so it must never reach the readout, the live
  // region or a render.
  const hoverRef = useRef(null)
  const paintRef = useRef(() => {})
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

  const shippedPage = shippedPageOf(facts, selected)
  const page = paged?.name === selected ? paged.page : shippedPage
  const atShipped = page === shippedPage
  const windowKey = `${selected}@${page}`
  useEffect(() => {
    if (!live || !facts) return undefined
    if (windows.has(windowKey)) return undefined
    let cancelled = false
    readWindow(selected, page * WINDOW_ROWS, 0)
      .then((result) => {
        if (cancelled) return
        const shipped = atShipped ? facts.windows[selected] : null
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
  }, [live, facts, selected, page, atShipped, windowKey, windows, noteMismatch])

  // The word table's 768 columns, read again over all 50,257 rows, and
  // compared number by number with the shipped reading — the marks on two of
  // the window's slots are a claim about the whole table, so they are
  // re-checked like the bytes are.
  useEffect(() => {
    if (!live || !facts) return undefined
    let cancelled = false
    readColumnStats(WTE)
      .then((stats) => {
        if (cancelled) return
        const shipped = facts.columnStats?.[WTE]
        if (shipped) {
          const agrees = (list, read) =>
            list.length === read.length &&
            list.every((v, i) => Math.abs(v - read[i]) <= COLUMN_TOLERANCE)
          if (!agrees(shipped.mean, stats.mean) || !agrees(shipped.sd, stats.sd)) {
            noteMismatch(`${short(WTE)} columns`)
          }
        }
        setLiveColumns(stats)
      })
      .catch((error) => {
        if (!cancelled) setLiveError(error.message)
      })
    return () => {
      cancelled = true
    }
  }, [live, facts, noteMismatch])

  // The vocabulary, from the tokenizer the model loaded with. `loadModel`
  // resolves at once with the handle it already holds when the model is
  // ready, so this never starts a load of its own.
  useEffect(() => {
    if (!ready) return undefined
    let cancelled = false
    loadModel()
      .then(({ tokenizer }) => {
        if (cancelled) return
        const byId = []
        for (const [piece, id] of tokenizer.get_vocab()) byId[id] = piece
        setSpellings(byId)
      })
      .catch((error) => {
        // Without it the labels print as instrument B prints them; nothing
        // claims a spelling it did not read.
        if (import.meta.env.DEV) console.error('instrument E: the vocabulary could not be read', error)
      })
    return () => {
      cancelled = true
    }
  }, [ready])

  /**
   * The label a word-table row prints once the model is loaded: the piece as
   * instrument B prints it, or the vocabulary's own spelling where that print
   * is a replacement glyph or a control character (pieceLabel.js — the rule
   * the build used for the shipped labels).
   */
  const liveLabelOf = useCallback(
    (row) => {
      const printed = tokenOf(row)
      if (printed === null) return null
      const spelling = spellings?.[row]
      return spelling === undefined ? printed : labelOf(printed, spelling)
    },
    [spellings],
  )

  // The shipped row labels were read from the tokenizer file; once the model's
  // own tokenizer is loaded, it is asked the same 24 questions — again once
  // the vocabulary is in hand, by the rule the labels are printed with.
  useEffect(() => {
    if (!ready || !facts) return
    const shipped = facts.rowLabels?.[WTE]
    const row0 = facts.windows[WTE]?.row0 ?? 0
    if (!shipped) return
    if (shipped.some((piece, r) => liveLabelOf(row0 + r) !== piece)) {
      noteMismatch(`${short(WTE)} row labels`)
    }
  }, [ready, facts, liveLabelOf, noteMismatch])

  // The lit row is a claim about the page's own sentence: that its fifth
  // token is this row. Once the model's tokenizer is loaded the sentence is
  // tokenized again and the claim is checked, id and piece.
  useEffect(() => {
    if (!ready || !facts) return undefined
    const shipped = facts.litRow?.[WTE]
    if (!shipped) return undefined
    let cancelled = false
    realTokenize(DEFAULT_SENTENCE)
      .then(({ ids }) => {
        if (cancelled) return
        if (ids[FOLLOWED_INDEX] !== shipped.id || tokenOf(shipped.id) !== shipped.piece) {
          noteMismatch(`${short(WTE)} lit row`)
        }
      })
      .catch((error) => {
        // A sentence that could not be tokenized is not a disagreement, and
        // the panel does not call it one.
        if (import.meta.env.DEV) console.error('instrument E: the lit row could not be checked', error)
      })
    return () => {
      cancelled = true
    }
  }, [ready, facts, noteMismatch])

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
    if (atShipped && facts?.windows[selected]) return decodeWindow(facts.windows[selected])
    return null
  }, [windows, windowKey, atShipped, facts, selected])

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
  /**
   * The canvas cut into its bands: the cells, and the three gutters that hold
   * the row labels, the slot labels and the key. Painted on the one canvas,
   * so nothing inside the box is a DOM node that could move.
   */
  const layout = useMemo(() => {
    const canvas = canvasRef.current
    const { width, height } = canvasSize
    if (!canvas || width <= 0 || height <= 0) return null
    const g = readGutters(canvas)
    return {
      width,
      height,
      ...g,
      areaW: Math.max(1, width - g.left),
      areaH: Math.max(1, height - g.top - g.bottom),
    }
  }, [canvasSize])

  const grid = useMemo(() => {
    if (!view) return null
    if (view.kind === 'bytes') {
      return { cols: WINDOW_COLS, rows: WINDOW_ROWS, drawCols: view.cols, drawRows: view.rows }
    }
    const total = view.data.length
    const aspect = layout ? layout.areaW / layout.areaH : WINDOW_COLS / WINDOW_ROWS
    const cols = Math.max(1, Math.min(total, Math.round(Math.sqrt(total * aspect))))
    const rows = Math.ceil(total / cols)
    return { cols, rows, drawCols: cols, drawRows: rows }
  }, [view, layout])

  const pages = entry ? Math.ceil(entry.rows / WINDOW_ROWS) : 1
  const maxAbs = histogram
    ? Math.max(Math.abs(histogram.stats.min), Math.abs(histogram.stats.max)) || 1
    : 1

  // --- selection ------------------------------------------------------------

  // A new tensor opens on the page the build shipped for it.
  const select = useCallback(
    (name) => {
      setSelected(name)
      setPaged(null)
      setCell(null)
    },
    [setSelected],
  )

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

  // --- what the window labels ----------------------------------------------

  // The columns are the live reading once it has landed, the shipped one
  // before; the rule that marks them is the same function either way.
  const columns = liveColumns ?? facts?.columnStats?.[WTE] ?? null
  const standout = useMemo(() => (columns ? standoutColumns(columns) : null), [columns])

  /** The standout slots inside the window, strongest first, as grid columns. */
  const marked = useMemo(() => {
    if (!standout || !view || view.kind !== 'bytes' || entry?.name !== WTE) return []
    return standout.columns
      .filter((c) => c.col >= view.col0 && c.col < view.col0 + view.cols)
      .sort((a, b) => Math.abs(b.away) - Math.abs(a.away))
      .map((c) => ({ ...c, at: c.col - view.col0 }))
  }, [standout, view, entry])

  /**
   * The piece of text a word-table row stands for: the model's own tokenizer
   * once it is loaded, at any page, by the label rule; before that, the 24
   * pieces the build read out of the tokenizer file for the window it
   * shipped, so nothing about the labels waits on a download.
   */
  const pieceOf = useCallback(
    (row) => {
      const piece = ready ? liveLabelOf(row) : null
      if (piece !== null) return piece
      const row0 = facts?.windows[WTE]?.row0 ?? 0
      return facts?.rowLabels?.[WTE]?.[row - row0] ?? null
    },
    [ready, facts, liveLabelOf],
  )

  /**
   * Which noun the readout gives a word-table row: a row whose print is a
   * replacement glyph or a control character prints the vocabulary's
   * spelling, and is called what it is — one raw byte, or several.
   */
  const nounOf = useCallback(
    (row) => {
      const spelling = ready ? spellings?.[row] : undefined
      const printed = spelling === undefined ? null : tokenOf(row)
      if (printed === null || !needsSpelling(printed)) return 'the word'
      return Array.from(spelling).length === 1 ? 'the raw byte' : 'the raw bytes'
    },
    [ready, spellings],
  )

  /** The row the page follows, and where it is in the window if it is in view. */
  const litId = facts?.litRow?.[WTE]?.id ?? null
  const litAt =
    entry?.name === WTE && view?.kind === 'bytes' && litId !== null && litId >= view.row0 && litId < view.row0 + view.rows
      ? litId - view.row0
      : null

  /** What is written left of a row, per kind of tensor; null where nothing is. */
  const rowLabelOf = useCallback(
    (r) => {
      if (!entry?.quant || !view || view.kind !== 'bytes') return null
      const row = view.row0 + r
      if (entry.name === WTE) {
        const piece = pieceOf(row)
        if (piece === null) return null
        // The lit row is marked the way the standout slots are: the ▶ marks
        // the row as the ▲ marks a column.
        return row === litId ? `▶ ${rowLabelText(piece)}` : rowLabelText(piece)
      }
      if (entry.name === WPE) return `p${row}`
      return String(row)
    },
    [entry, view, pieceOf, litId],
  )

  // --- the canvas -----------------------------------------------------------

  useEffect(() => {
    paintRef.current = () => {
      const canvas = canvasRef.current
      if (!canvas || !layout) return
      const { width, height } = layout
      const dpr = window.devicePixelRatio || 1
      const backingW = Math.round(width * dpr)
      const backingH = Math.round(height * dpr)
      if (canvas.width !== backingW) canvas.width = backingW
      if (canvas.height !== backingH) canvas.height = backingH
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      if (!view || !grid) return
      // Read on every draw, so the window follows the page's tokens rather than
      // a copy of them taken at mount.
      const ramp = readRamp()
      if (!ramp) return
      const x0 = layout.left
      const y0 = layout.top
      const cellW = layout.areaW / grid.cols
      const cellH = layout.areaH / grid.rows
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
            x0 + c * cellW,
            y0 + r * cellH,
            Math.max(1, Math.ceil(cellW) - gutter),
            Math.max(1, Math.ceil(cellH) - gutter),
          )
        }
      }

      const lit = rampColour(ramp, 1)
      if (cell && cell.row < grid.drawRows && cell.col < grid.drawCols) {
        ctx.strokeStyle = lit
        ctx.lineWidth = 1
        ctx.strokeRect(
          x0 + cell.col * cellW - 0.5,
          y0 + cell.row * cellH - 0.5,
          cellW + 1,
          cellH + 1,
        )
      }

      const words = readToken('--frozen-on-screen')
      const mono = readToken('--mono')
      if (!words || !mono) return
      const hover = hoverRef.current
      const font = (px) => `${px}px ${mono}`
      const bytes = view.kind === 'bytes'

      // Left: what each row is.
      if (layout.left > 0 && bytes) {
        ctx.font = font(LABEL_PX)
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        for (let r = 0; r < grid.drawRows; r++) {
          const text = rowLabelOf(r)
          if (text === null) continue
          // The lit row's label is in the pick colour at all times.
          const on = cell?.row === r || hover?.row === r || r === litAt
          ctx.fillStyle = on ? lit : words
          ctx.fillText(text, x0 - 4, y0 + (r + 0.5) * cellH)
        }
      }

      // Top: which slot each column is. Every eighth, the standouts in the
      // pick colour with a mark under them, and the slot under the pointer or
      // the pick lit — a lit number clears any label it would print over.
      if (layout.top > 0 && bytes) {
        ctx.font = font(LABEL_PX)
        ctx.textBaseline = 'alphabetic'
        ctx.textAlign = 'center'
        const centre = (c) => x0 + (c + 0.5) * cellW
        const active = new Set([cell?.col, hover?.col].filter((c) => c !== undefined))
        const items = new Map()
        for (let c = 0; c < grid.drawCols; c++) {
          if ((view.col0 + c) % 8 === 0) items.set(c, { c, rank: 0 })
        }
        for (const m of marked) items.set(m.at, { c: m.at, rank: 1 })
        for (const c of active) {
          if (c < grid.drawCols) items.set(c, { c, rank: 2 })
        }
        const placed = []
        const sorted = [...items.values()].sort((a, b) => b.rank - a.rank || a.c - b.c)
        for (const item of sorted) {
          const text = String(view.col0 + item.c)
          const half = ctx.measureText(text).width / 2 + 1
          const from = centre(item.c) - half
          const to = centre(item.c) + half
          if (placed.some((p) => from < p.to && to > p.from)) continue
          placed.push({ from, to })
          ctx.fillStyle = item.rank > 0 ? lit : words
          ctx.fillText(text, centre(item.c), LABEL_PX)
        }
        if (marked.length > 0) {
          ctx.font = font(MARK_PX)
          ctx.fillStyle = lit
          for (const m of marked) ctx.fillText('▲', centre(m.at), layout.top - 3)
        }
      }

      // Bottom: the key, painted by the ramp that paints the cells, along the
      // same square-root law, so a shade in the strip is a shade in the window.
      // On the phone the gutters carry no labels, and the key keeps only its
      // strip and its two end ticks.
      if (layout.bottom > 0) {
        const compact = layout.left === 0
        const top = y0 + layout.areaH
        ctx.font = font(LABEL_PX)
        const sentenceW = compact ? 0 : ctx.measureText(KEY_SENTENCE).width
        // Inset from the panel's edge on the phone, where nothing else sits
        // between the strip's ends and the border.
        const stripX = compact ? x0 + 3 : x0
        const stripW = Math.round(
          compact ? layout.areaW - 6 : Math.max(80, Math.min(220, layout.areaW - sentenceW - 14)),
        )
        const stripY = top + (compact ? 1 : 3)
        const stripH = compact ? 4 : 5
        for (let px = 0; px < stripW; px++) {
          ctx.fillStyle = rampColour(ramp, stripW > 1 ? px / (stripW - 1) : 1)
          ctx.fillRect(stripX + px, stripY, 1, stripH)
        }
        const last = maxAbs.toFixed(1)
        const ticks = compact
          ? [{ v: 0, text: '0' }, { v: maxAbs, text: last }]
          : [
              ...KEY_TICKS.filter((v) => v < maxAbs).map((v) => ({ v, text: String(v) })),
              { v: maxAbs, text: last },
            ]
        ctx.textBaseline = 'alphabetic'
        ctx.fillStyle = words
        const baseline = stripY + stripH + (compact ? 7 : 10)
        const placed = []
        // The ends are placed first, so a middle tick too close to one of
        // them is the one that gives way.
        const order = [0, ticks.length - 1, ...ticks.keys()].filter((i, k, a) => a.indexOf(i) === k)
        for (const i of order) {
          const tick = ticks[i]
          const x = stripX + Math.sqrt(Math.min(1, tick.v / maxAbs)) * (stripW - 1)
          const w = ctx.measureText(tick.text).width
          const align = i === 0 ? 'left' : i === ticks.length - 1 ? 'right' : 'center'
          const from = align === 'left' ? x : align === 'right' ? x + 1 - w : x - w / 2
          if (placed.some((p) => from < p.to + 4 && from + w > p.from - 4)) continue
          placed.push({ from, to: from + w })
          ctx.textAlign = 'left'
          ctx.fillText(tick.text, from, baseline)
          if (!compact) ctx.fillRect(Math.round(x), stripY + stripH, 1, 2)
        }
        if (!compact) {
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(KEY_SENTENCE, stripX + stripW + 14, top + layout.bottom / 2)
        }
      }
    }
    paintRef.current()
  }, [layout, view, grid, entry, maxAbs, cell, marked, rowLabelOf, litAt])

  // The canvas is painted in the page's mono, which may still be on its way
  // when the first paint runs; once it has landed, paint again.
  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) paintRef.current()
    })
    return () => {
      cancelled = true
    }
  }, [])

  /** The cell under a pointer, or null in a gutter or past a short last row. */
  const cellAt = useCallback(
    (event) => {
      if (!view || !grid || !layout) return null
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left - layout.left
      const y = event.clientY - rect.top - layout.top
      if (x < 0 || y < 0 || x >= layout.areaW || y >= layout.areaH) return null
      const col = Math.floor((x / layout.areaW) * grid.cols)
      const row = Math.floor((y / layout.areaH) * grid.rows)
      if (row < 0 || col < 0 || row >= grid.drawRows || col >= grid.drawCols) return null
      if (row * grid.drawCols + col >= view.data.length) return null
      return { row, col }
    },
    [view, grid, layout],
  )

  // A click in a gutter picks nothing, and leaves the reading where it was.
  const pickCell = useCallback(
    (event) => {
      const at = cellAt(event)
      if (at) setCell(at)
    },
    [cellAt],
  )

  const hoverCell = useCallback(
    (event) => {
      const at = cellAt(event)
      const held = hoverRef.current
      if (held?.row === at?.row && held?.col === at?.col) return
      hoverRef.current = at
      paintRef.current()
    },
    [cellAt],
  )

  const leaveCanvas = useCallback(() => {
    if (!hoverRef.current) return
    hoverRef.current = null
    paintRef.current()
  }, [])

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

  /**
   * The line above the window, in the words a reader new to all of this can
   * follow: which table, which rows of how many, which slots of how many, and
   * that each square is one byte. The f32 vectors keep their line; the wrap
   * is the panel's choice and the line already says so.
   */
  const blobEyebrow = () => {
    if (!entry || !view) return '—'
    const first = view.row0 * (entry.quant ? 1 : WINDOW_COLS)
    if (entry.quant) {
      const rows = `${count(view.row0)}–${count(view.row0 + view.rows - 1)} of ${count(entry.rows)}`
      const slots =
        `slots ${count(view.col0)}–${count(view.col0 + view.cols - 1)} ` +
        `of ${count(entry.dims[1] ?? 1)} · one byte per number`
      if (entry.name === WTE) return `the word table (transformer.wte) · words ${rows} · ${slots}`
      if (entry.name === WPE) {
        return `the position table (transformer.wpe) · positions ${rows} · ${slots}`
      }
      const name = entry.name.replace(/^transformer\./, '').replace(/\.weight_quantized$/, '')
      return `${groupOf(entry.name).label} · ${name} · rows ${rows} · ${slots}`
    }
    return (
      `${entry.name} · values ${count(first)}–${count(first + view.data.length - 1)} ` +
      `of ${count(entry.elements)} · wrapped at ${grid?.cols ?? WINDOW_COLS} · ${entry.dtype}`
    )
  }

  const NOTHING_PICKED =
    'click a square, or use the arrow keys inside the window, to read one number'

  /**
   * The idle second line for the word table: which of the window's slots
   * stand out across the whole table, said by the rule rather than written in
   * — so it says what the file says, and would say something else of a file
   * that held something else.
   */
  const standoutLine = () => {
    if (entry?.name !== WTE || marked.length === 0) return ''
    const n = marked.length
    const lead = n === 1 ? 'one slot stands out: ' : `${NUMBER_WORDS[n] ?? n} slots stand out: `
    return (
      lead +
      marked
        .map((m, i) => `${m.col} ${STANDOUT_WORDS[m.phrase][i === 0 ? 'first' : 'later']}`)
        .join(' · ')
    )
  }

  /**
   * The reading under the window, as two lines: what the picked square is in
   * words, then the arithmetic that turns its byte into a number — the line
   * this panel has always printed, without the token on its end, because the
   * first line now says which word it is.
   */
  const readout = () => {
    if (!entry || !view || !grid) return { words: 'no tensor selected', arith: '' }
    const idle = { words: NOTHING_PICKED, arith: standoutLine() }
    if (!cell || cell.row >= grid.drawRows || cell.col >= grid.drawCols) return idle
    const i = cell.row * grid.drawCols + cell.col
    if (i >= view.data.length) return idle
    if (!entry.quant) {
      const index = view.row0 * WINDOW_COLS + i
      return { words: `index ${count(index)} · ${sig(view.data[i], 6)}`, arith: '' }
    }
    // The stored byte and its reading are not the same number for i8 — 241 in
    // the file is −15 as an i8 — and it is the reading that goes into the
    // arithmetic, so the second line names the dtype rather than calling it a
    // byte. The first line says the byte, because that is what is stored.
    const q = rawValue(view.dtype, view.data[i])
    const zp = entry.quant.zeroPoint
    const value = entry.quant.scale * (q - zp)
    const row = view.row0 + cell.row
    const slot = view.col0 + cell.col
    const stored = `slot ${count(slot)} · stored as the byte ${view.data[i]} · means ${signed(value, 2)}`
    let words = `row ${count(row)} · ${stored}`
    if (entry.name === WTE) {
      // A wte row is a token id, so the row number names a piece of the
      // vocabulary. The low ids are single raw bytes: one that is a character
      // on its own prints as that character, one that is not prints the
      // letter the vocabulary spells it with, and is called a raw byte.
      const piece = pieceOf(row)
      const mark = marked.find((m) => m.at === cell.col)
      const lit = row === litId ? ' · the lit row' : ''
      if (piece !== null) words = `${nounOf(row)} "${readoutPiece(piece)}"${lit} · ${stored}`
      if (mark) words += ` · ${STANDOUT_WORDS[mark.phrase].pick}`
    } else if (entry.name === WPE) {
      words = `position ${count(row)} · ${stored}`
    }
    const arith =
      `row ${count(row)} · col ${count(slot)} · ${entry.dtype} ${plain(q)} · ` +
      `(${plain(q)} ${NBSP_MINUS} ${plain(zp)}) × ${sig(entry.quant.scale, 5)} = ${signed(value, 4)}`
    return { words, arith }
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
  const reading = readout()

  // The proof line's finding, handed up whenever it changes: the same inputs
  // `proof()` reads, the same branches, a state instead of a sentence.
  //
  // A layout effect, so the page's copy changes in the same paint as this
  // line. Handed up from a passive effect, section 07's line trailed this one
  // by one render — measured at 80 to 110 ms on each change, a moment in
  // which the two said different things.
  const finding = findingOf({
    p: facts?.provenance,
    ready,
    liveError,
    live,
    mismatches,
    afterRun,
  })
  useLayoutEffect(() => {
    onProof?.({ state: finding.state, sha: finding.sha })
  }, [onProof, finding.state, finding.sha])

  return (
    <figure className="instrument">
      <InstrumentHead
        stacked
        eyebrow="INSTRUMENT E"
        title="The file"
        purpose="The model file itself — every tensor it holds, one window of its raw bytes, and the spread of one tensor’s values."
        note={
          <LoadNote
            label={label}
            action="load the model to read it live"
            status={modelStatus}
            progress={progress}
            onLoad={onLoad}
          />
        }
      />

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
        {/* The one invitation this instrument has to make. Bill read the
            selected segment's box as a slider handle and tried to drag it: it
            is a map of the file, and every piece of it wide enough to hit is
            a button. It sits under the bar rather than in the label above it
            because at the phone's width the label row cannot hold both this
            sentence and its info tag without the tag dropping to a line of
            its own. The words never change, so this line is one line at every
            width and can move nothing. */}
        <p className="file-bar-invite">click a piece of the bar to choose that tensor</p>
        <p className="file-bar-readout">{barReadout()}</p>
        <p className="file-bar-key">{header?.key ?? '—'}</p>

        <div className="label-row file-label">
          <span className="field-label">the bytes &mdash; one small window</span>
          <InfoTag topic="fileBlob" />
          <span className="file-source">{source()}</span>
        </div>
        {/* One plain line for the word table; empty, at the same height, for
            any other tensor, so a tensor switch moves nothing. */}
        <p className="file-sign">{selected === WTE ? SIGN : ''}</p>
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
            onMouseMove={hoverCell}
            onMouseLeave={leaveCanvas}
          />
        </div>
        <div className="file-blob-controls">
          {/* Before the model loads there is only the shipped page to show,
              so both buttons wait — the word table's opens at window 15,
              and a back button live there would have had nothing to read. */}
          <button
            type="button"
            className="btn"
            disabled={page === 0 || (!live && pages > 1)}
            onClick={() => {
              setPaged({ name: selected, page: Math.max(0, page - 1) })
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
              setPaged({ name: selected, page: Math.min(pages - 1, page + 1) })
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
          <span className="file-readout-words">{reading.words}</span>
          <span className="file-readout-arith">{reading.arith}</span>
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
