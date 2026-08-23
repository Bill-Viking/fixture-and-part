import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BANDS,
  HEAD_LEGEND,
  HEAD_LEGEND_SHORT,
  MAP_STOPS,
  architectureNote,
  headAverageRow,
  headOutwardShares,
  illustrativeField,
  partReadout,
  residualField,
  tensorFacts,
  finalSplash,
  topOfFinalLogits,
} from '../lib/forwardMap.js'
import { REAL_HEADS, REAL_HIDDEN, REAL_LAYERS } from '../lib/realModel.js'
import { residualVector } from '../lib/toyModel.js'
import { STRIP_CAP, stripUrl, thumbnailUrl } from '../lib/tensorTexture.js'
import InfoTag from '../components/InfoTag.jsx'
import LoadNote from '../components/LoadNote.jsx'
import ReadingLine from '../components/ReadingLine.jsx'
import TeachPair from '../components/TeachPair.jsx'
import InstrumentHead from '../components/InstrumentHead.jsx'

/**
 * Instrument F — the forward pass, live.
 *
 * The complaint this answers was one sentence long: "the neural net is
 * static". Everything on the page was true and nothing on it moved. A reader
 * could step the model, read one head's lookup, and read one position's stack,
 * but there was no drawing of the machine as a whole with his own sentence
 * visibly inside it.
 *
 * So: the whole of distilgpt2 on one screen, drawn once — the embedding
 * tables, six blocks of ln → attention → ln → MLP with their real shapes and
 * byte counts, the final norm, and the embedding table used backwards at the
 * end. Down the right of every band runs the sentence itself, one amber column
 * per token, and each column carries a node at each of the seven depths whose
 * brightness is the size of that token's running vector there. In the selected
 * layer the selected token's attention is drawn as threads back to the tokens
 * it reads, and the twelve head squares in that block light by how much of the
 * token's attention each head spends looking anywhere but at itself.
 *
 * Nothing here is a second implementation of anything. The columns are norms
 * of the residual stream instrument D reads; the threads are the attention
 * matrix instrument C tabulates; the shapes and byte counts are the manifest
 * instrument E lists; the last row is the token instrument B is about to
 * append. The map's job is to put those five readings in one frame, and the
 * lettered markers on it open the instrument each one came from.
 */

const CHIP_GAP = 2
const CHAR = 0.6

/**
 * The cadence of a replay: how long the water takes to fall from one stop to
 * the next. Everything that happens on a replay is timed off this — the strip
 * travelling down the drawing, and the glint a steel box gives as the strip
 * crosses it — so the two cannot drift apart.
 */
const PASS_STEP_MS = 150
/** The pause before the first stop, so a replay is visibly a beginning. */
const PASS_LEAD_MS = 60
/** How far ahead of a stop the box under it starts to glint. */
const GLINT_LEAD_MS = 90

/**
 * Two sets of geometry, one per breakpoint. The viewBox and the box's aspect
 * ratio come from the same constants, so the drawing scales uniformly and the
 * screen's height is a function of its width and of nothing else — never of
 * how many tokens are in the sequence.
 */
function geometryFor(compact) {
  const g = compact
    ? {
        W: 320, MX: 6, RIGHT: 314, TRACK: 38,
        chipY: 10, chipH: 17, chipMax: 34,
        annY: 36, headerY: 50, tieY: 56, bandTop: 62, bandH: 46, bandGap: 4,
        boxTop: 3, boxH: 22, nodeDY: 32, stripDY: 41, stripH: 6,
        outH: 44, splashH: 10, splashW: 5, splashGap: 1.5, splashN: 6, legendH: 48,
        gap: 4, pad: 4, tick: 3, tickGap: 1, mark: 12,
        fs: { label: 9, part: 8.5, spec: 7, chip: 8, out: 9, legend: 8, key: 8.5, annot: 8, header: 8, whisper: 10 },
      }
    : {
        W: 684, MX: 20, RIGHT: 664, TRACK: 84,
        chipY: 12, chipH: 20, chipMax: 54,
        annY: 44, headerY: 58, tieY: 66, bandTop: 74, bandH: 48, bandGap: 4,
        boxTop: 3, boxH: 24, nodeDY: 33, stripDY: 43, stripH: 7,
        outH: 49, splashH: 13, splashW: 7, splashGap: 2, splashN: 8, legendH: 42,
        gap: 6, pad: 6, tick: 6, tickGap: 1.5, mark: 13,
        fs: { label: 9.5, part: 9, spec: 7.5, chip: 9, out: 10, legend: 9, key: 10, annot: 9, header: 8.5, whisper: 10 },
      }
  const bandY = (i) => g.bandTop + i * (g.bandH + g.bandGap)
  const lastBottom = bandY(BANDS.length - 1) + g.bandH
  const outY = lastBottom + 8
  // The whisper's line is reserved whatever mode the instrument is in, so the
  // drawing is the same height before a pass, during one and after it. It is
  // the one thing on the map whose text changes seven times a second, and a
  // line that had to appear for it would move everything below the figure
  // every time the water fell.
  // The splash sits inside the output row, under the words, so the row that
  // says what the machine settles on also shows how sure it was.
  const splashTop = outY + g.fs.out + 9
  const splashBase = splashTop + g.splashH
  const whisperY = outY + g.outH + 4 + g.fs.whisper
  const legendY = whisperY + 8
  return {
    ...g,
    compact,
    bandY,
    whisperY,
    nodeY: (i) => bandY(i) + g.nodeDY,
    // The lane the falling strip parks in: under the node row, inside the
    // band, clear of both the boxes above it and the next band below.
    stripY: (i) => bandY(i) + g.stripDY,
    outY,
    splashTop,
    splashBase,
    legendY,
    H: legendY + g.legendH + 8,
    trackW: g.RIGHT - g.TRACK,
    tie: g.W - 6,
  }
}

const fits = (text, size, width) => text.length * size * CHAR <= width

/** A depth of the stack, in plain words. */
function stopName(stop) {
  return stop === 0 ? 'at the embedding' : `after block ${stop - 1}`
}

/**
 * What the lens hears at one depth, in one line.
 *
 * This is instrument D's reading, not a second implementation of it: the same
 * worker, the same final LayerNorm and the same unembedding, asked at an
 * intermediate depth. So the honest word is "leaning" rather than "predicts" —
 * the model does not make a prediction after block 2; the lens is what it
 * *would* say if the stack stopped there, and the tooltip says so in full.
 *
 * Illustrative mode gets no reading at all rather than a stand-in one. Every
 * other number on this drawing has a labelled illustrative twin, but the lens
 * does not: it is the unembedding matrix applied to a real residual, and there
 * is nothing to apply it to until the model is in hand.
 */
function whisperText(stop, reading, { real, lensIndex, compact }) {
  if (!real) {
    return compact
      ? 'the lens — load the real model'
      : 'the lens reads the real model only — load it to hear each depth'
  }
  if (reading && reading.index === lensIndex && reading.status === 'error') {
    return `${stopName(stop)} — the lens could not be read`
  }
  const fresh = reading && reading.index === lensIndex ? reading : null
  const token = fresh?.stops?.[stop]?.[0]?.token
  if (token == null) return `${stopName(stop)} — reading…`
  return compact
    ? `${stopName(stop)} — ${token}`
    : `the lens, ${stopName(stop)} — leaning ${token}`
}

/** As much of a token as the chip can hold; the rest lives in its tooltip. */
function clip(text, size, width) {
  const room = Math.max(1, Math.floor(width / (size * CHAR)))
  if (text.length <= room) return text
  return text.slice(0, room)
}

/** The spec line inside a steel box, shortened until it fits the box. */
function specFor(facts, size, width) {
  if (!facts) return ''
  const full = `${facts.shape} ${facts.dtype} · ${facts.size}`
  if (fits(full, size, width)) return full
  const short = `${facts.shape} ${facts.dtype}`
  if (fits(short, size, width)) return short
  return fits(facts.shape, size, width) ? facts.shape : ''
}

/** Where each part of a band sits, from the parts' relative widths. */
function layoutParts(band, g) {
  const widthOf = (p) => (g.compact ? (p.cwidth ?? p.width) : p.width)
  const total = band.parts.reduce((sum, p) => sum + widthOf(p), 0)
  const free = g.trackW - g.gap * (band.parts.length - 1)
  let x = g.TRACK
  return band.parts.map((part) => {
    const w = (free * widthOf(part)) / total
    const box = { ...part, x, w }
    x += w + g.gap
    return box
  })
}

/** A lettered marker that scrolls to the instrument it names. */
function Window({ letter, x, y, size, label, onOpen }) {
  return (
    <g
      className="map-window"
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
    >
      <title>{label}</title>
      <rect x={x} y={y} width={size} height={size} rx="2" />
      <text x={x + size / 2} y={y + size / 2 + size * 0.34} textAnchor="middle">
        {letter}
      </text>
    </g>
  )
}

export default function ForwardMap({
  text,
  sequence,
  lensIndex,
  onSelect,
  layer,
  onLayerChange,
  armed,
  real,
  run,
  reading,
  nextToken,
  pending,
  stepTick,
  modelStatus,
  progress,
  onLoad,
  onOpenInstrument,
  onOpenTensor,
}) {
  const [compact, setCompact] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 640px)').matches,
  )
  const [manifest, setManifest] = useState(null)
  const [thumbs, setThumbs] = useState(null)
  const [part, setPart] = useState(null)
  const [replay, setReplay] = useState(0)
  // Where the reader has parked the falling strip, or null for "let it fall".
  // A click on any node is the microscope: it stops the water at that depth
  // and holds it there until the next pass.
  const [park, setPark] = useState(null)
  const [still, setStill] = useState(false)
  const stripRef = useRef(null)
  const stripImgRef = useRef(null)
  const whisperRef = useRef(null)
  // The whisper is written to the DOM rather than rendered, for the same
  // reason the strip's transform is: it changes seven times in a second as the
  // water passes each stop, and seven React renders of the whole map would be
  // seven chances to move the page. Its <text> is rendered with no children,
  // so React has nothing to reconcile there and never overwrites what the
  // timeline put in it.
  const whisperShown = useRef(MAP_STOPS - 1)
  const whisperData = useRef({ reading: null, real: false, lensIndex: 0, compact: false })

  // One media query, read before the first paint and then only on a change of
  // breakpoint, so the drawing is never laid out at the wrong scale and then
  // corrected.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = (e) => setCompact(e.matches)
    mq.addEventListener('change', onChange)
    setCompact(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // The same shipped reading instrument E draws, so the shapes and byte
  // counts on this map are the file's own rather than a second copy of them
  // written out here. It is its own chunk and E has already asked for it.
  useEffect(() => {
    let cancelled = false
    import('../content/fileFacts.json')
      .then((module) => {
        if (cancelled) return
        setManifest(module.default.manifest)
        // The whole of each tensor at twelve by forty-eight, read out of the
        // real file at build time. It is what every steel box is textured
        // with, in both modes, and before anything has been downloaded.
        setThumbs(module.default.thumbnails ?? null)
      })
      .catch((error) => {
        console.error('[fixture-and-part] the shipped file reading is missing:', error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const g = useMemo(() => geometryFor(compact), [compact])
  const n = sequence.length
  const runKey = run?.key ?? null

  // Reduced motion, read the same way the breakpoint is: once, before the
  // first paint, and then only when it changes.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setStill(e.matches)
    mq.addEventListener('change', onChange)
    setStill(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // A new pass, or a new token appended, replays the drawing — and lets the
  // water fall again from the top, because it is a new pass and the reader's
  // old parking place belonged to the previous one.
  useEffect(() => {
    setPark(null)
    setReplay((r) => r + 1)
  }, [runKey, stepTick, n])

  const runAgain = useCallback(() => {
    setPark(null)
    setReplay((r) => r + 1)
  }, [])

  // Three states, not two. With a finished pass the field is that pass's own
  // norms. With no model it is the deterministic stand-in instrument D
  // prints, labelled as such. In between — the model is loaded and a pass is
  // in flight — there is no field at all: the stream is drawn flat and the
  // legend says the pass is running. Falling back to the stand-ins here would
  // put illustrative numbers on screen under a real-model heading for the
  // third of a second a pass takes, which is the one thing this page does
  // not do.
  const field = useMemo(() => {
    if (real && run) return residualField(run)
    return armed ? null : illustrativeField(sequence)
  }, [real, run, armed, sequence])
  const arcs = useMemo(
    () => (real && run ? headAverageRow(run, layer, lensIndex) : null),
    [real, run, layer, lensIndex],
  )
  const heads = useMemo(
    () => (real && run ? headOutwardShares(run, layer, lensIndex) : null),
    [real, run, layer, lensIndex],
  )

  /**
   * The falling strip: one token's running vector at each of the seven
   * depths, 768 cells wide, one cell per number.
   *
   * Nothing is downsampled and nothing is picked out. The raster is exactly as
   * wide as the vector is long, so what the reader sees is the vector and not
   * a summary of it — which is the whole difference between this and the node
   * beside it, which is the same 768 numbers reduced to their length.
   *
   * A cell's brightness is |value| against the largest magnitude at that
   * depth, so the shape of the vector stays legible all the way down. How much
   * vector there is — the thing that runs from about 5 to about 1,800 over six
   * blocks — is carried by the brightness of the strip as a whole, which is the
   * same log scale the nodes use and the legend states. Two normalisations,
   * because they are answering two questions, and both are named on screen.
   *
   * The values are the pass's own residual stream, read at the same offsets
   * instrument D sends to the lens. In illustrative mode they are the same
   * deterministic stand-in D prints, taken 768 wide instead of six.
   */
  const strip = useMemo(() => {
    if (n === 0) return null
    if (real && run?.residuals?.length && lensIndex < run.n) {
      const values = []
      const urls = []
      for (let s = 0; s < MAP_STOPS; s++) {
        const base = lensIndex * REAL_HIDDEN
        const row = run.residuals[s].subarray(base, base + REAL_HIDDEN)
        values.push(row)
        urls.push(stripUrl(row, '--moving', `s|${run.key}|${lensIndex}|${s}`))
      }
      return { real: true, values, urls }
    }
    if (armed) return null
    const token = sequence[lensIndex]
    if (token === undefined) return null
    const values = []
    const urls = []
    for (let s = 0; s < MAP_STOPS; s++) {
      const row = Float32Array.from(residualVector(token, s, REAL_HIDDEN))
      values.push(row)
      urls.push(stripUrl(row, '--moving', `i|${token}|${s}`))
    }
    return { real: false, values, urls }
  }, [real, armed, run, lensIndex, sequence, n])

  // What the instrument has on screen, for the console check. Dev only; the
  // bundler drops the branch in a production build.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    globalThis.__mapState =
      real && run && field
        ? {
            real: true,
            key: run.key,
            ids: run.ids,
            index: lensIndex,
            layer,
            stops: Array.from(field.rows[lensIndex] ?? []),
            heads: Array.from(heads ?? []),
            // The strip's own cells, exactly as they were rastered.
            stripStops: strip?.real ? strip.values : null,
          }
        : { real: false }
  }, [real, run, field, heads, lensIndex, layer, strip])

  const columns = useMemo(() => {
    if (n === 0) return []
    const slot = g.trackW / n
    const w = Math.min(g.chipMax, slot - CHIP_GAP)
    return sequence.map((token, i) => {
      const x = g.TRACK + slot * i + (slot - w) / 2
      return { i, token, x, w, cx: x + w / 2 }
    })
  }, [sequence, n, g])

  const bands = useMemo(
    () => BANDS.map((band) => ({ band, boxes: layoutParts(band, g) })),
    [g],
  )

  const factsFor = useCallback(
    (name) => tensorFacts(manifest, name),
    [manifest],
  )

  /**
   * The two rasters a steel box wears: its own tensor's bytes in the frozen
   * blue, and the same bytes again in the moving amber for the moment the
   * water crosses it. One PNG each, cached by tensor and by role, so a replay
   * is an opacity change on an image that already exists rather than any
   * drawing work. Both are real in both modes — the grid was read out of the
   * file at build time, so it owes nothing to whether the model has loaded.
   */
  const textureFor = useCallback(
    (name) => {
      const thumb = thumbs?.[name]
      if (!thumb) return null
      const frozen = thumbnailUrl(thumb, '--frozen-on-screen', `${name}|frozen`)
      if (!frozen) return null
      return { frozen, moving: thumbnailUrl(thumb, '--moving', `${name}|moving`) }
    },
    [thumbs],
  )

  /**
   * When the box in band `bi` glints: a little before the water reaches the
   * stop below it, because the strip crosses the box on its way there rather
   * than at the moment it arrives.
   */
  const glintAt = useCallback(
    (bi) => Math.max(0, PASS_LEAD_MS + bi * PASS_STEP_MS - GLINT_LEAD_MS),
    [],
  )

  // Stable: it reads everything it needs out of refs, so the timeline effect
  // can depend on it without the fall restarting whenever a depth lands.
  whisperData.current = { reading, real, lensIndex, compact }
  const writeWhisper = useCallback((stop) => {
    whisperShown.current = stop
    const node = whisperRef.current
    if (!node) return
    node.textContent = whisperText(stop, whisperData.current.reading, whisperData.current)
  }, [])

  // The seven depths land one at a time, each about 155 ms of worker
  // arithmetic, and the water is usually past a stop before that stop's word
  // arrives. So whenever the reading changes, whatever depth is currently on
  // screen is written again — a stop that said "reading…" while the strip
  // crossed it fills in a moment later, in place.
  useEffect(() => {
    writeWhisper(whisperShown.current)
  }, [reading, real, lensIndex, compact, writeWhisper])

  const handlePart = useCallback((box) => {
    setPart((prev) => (prev && prev.tensor === box.tensor && prev.id === box.id ? null : box))
  }, [])

  const partFacts = part ? factsFor(part.tensor) : null
  const selectedToken = sequence[lensIndex]

  // The pass keeps its last position's logits whole, so the top of them is
  // one scan of an array the map already has — no second pass, no shortlist.
  const finalTop = useMemo(
    () => (real && run ? topOfFinalLogits(run) : null),
    [real, run],
  )

  /**
   * Where the water lands.
   *
   * The last stream reaches the unembedding and spreads across the whole
   * vocabulary; these are the tallest few of those 50,257 splashes, and their
   * heights are the probabilities the sampler is about to draw from. It is the
   * end of the fall, so it is drawn at the bottom of the drawing and nowhere
   * else — and only for the last position, because the next-word distribution
   * belongs to the end of the sentence and to no other point in it.
   */
  const splash = useMemo(
    () => (real && run ? finalSplash(run, g.splashN) : null),
    [real, run, g.splashN],
  )
  const splashIsHere = splash != null && lensIndex === n - 1

  /**
   * What the stack settles on at the selected position.
   *
   * At the last position that is free, and it is the machine's own answer:
   * the argmax of the logits this pass produced there. So the bottom row
   * prints a real prediction the moment the model has run, with nothing
   * clicked — and it agrees with what a click then shows, which the
   * shortlist beside it would not have (B skips whitespace tokens; the
   * machine does not).
   *
   * Earlier positions have no logits row of their own in this pass. Reading
   * one means pushing that position's last residual through ln_f and the
   * embedding table backwards, which is precisely the last row of instrument
   * D's reading — so a click on a chip takes that reading and this line
   * prints its winner when it lands, rather than the map computing a second
   * one of its own.
   */
  const settled = real
    ? (reading?.winner ?? (lensIndex === n - 1 ? (finalTop?.token ?? null) : null))
    : null

  /**
   * Where one stop's norm sits in the run's own range, 0 to 1.
   *
   * On a log scale, and the legend says so. Measured on the default sentence,
   * the residual norm runs from about 5 at the embedding to about 1,800 by
   * the last block — two and a half orders of magnitude, most of it spent in
   * the first token, which is the attention sink every GPT-2 has. Mapped
   * linearly, six of the seven stops on every column would be
   * indistinguishable from black and the drawing would say the stream is
   * empty until the very end, which is the opposite of true. The ratio is
   * what carries the information here, so the ratio is what is drawn.
   */
  const value = (i, s) => {
    const row = field?.rows?.[i]
    // A pass is in flight: every stop the same low value, so the stream is
    // visibly there and visibly carrying nothing anyone has measured yet.
    if (!row) return field == null && armed && n > 0 ? 0.16 : null
    const lo = Math.log(Math.max(field.lo, 1e-6))
    const hi = Math.log(Math.max(field.hi, 1e-6))
    const span = hi - lo
    if (!(span > 0)) return 1
    const t = (Math.log(Math.max(row[s], 1e-6)) - lo) / span
    return Math.min(1, Math.max(0, t))
  }

  const arcMax = arcs ? arcs.reduce((m, v) => Math.max(m, v), 0) : 0
  // The band the threads and the lit head squares belong to — only ever a
  // real one, because there is no attention to draw without a run.
  const arcBand = real ? layer + 1 : null
  // The band the C marker sits in. It is the same band, but it is drawn in
  // both modes: the window onto instrument C is part of the machinery, not
  // part of the reading, and a reader who has not loaded the model still
  // needs the door.
  const headBand = layer + 1

  const waiting = armed && !real

  const note = () => {
    if (n === 0) return 'no input — type something into instrument A'
    if (pending || waiting) return 'running distilgpt2…'
    if (!real) return 'illustrative — the shape of the pass'
    return `real residual stream · ‖residual‖ ${
      field ? field.lo.toFixed(1) : '—'
    } → ${field ? field.hi.toFixed(1) : '—'}`
  }

  // Memoised, not derived inline: the replay timeline below depends on it,
  // and a fresh array every render would restart the fall on every render.
  const nodeBands = useMemo(
    () =>
      bands
        .map(({ band }, i) => ({ band, i }))
        .filter(({ band }) => band.stop !== null),
    [bands],
  )

  /**
   * The fall, as a timeline rather than as a render.
   *
   * Seven updates of one element group, spaced one cadence apart: the href of
   * a single image, a translateY, and an opacity. Nothing here is laid out by
   * the animation and React is not asked to render a frame of it, so the
   * water can fall the whole way down without moving a pixel of the page.
   *
   * Three ways it can end. Parked, because the reader clicked a node: the
   * strip jumps to that depth and stays. Reduced motion: it is drawn at the
   * bottom of the fall immediately, which is where a replay would have left
   * it. Otherwise it falls.
   */
  useEffect(() => {
    const node = stripRef.current
    const image = stripImgRef.current
    if (!node || !image) return undefined
    if (!strip) {
      node.style.opacity = '0'
      return undefined
    }
    const last = MAP_STOPS - 1
    const put = (s, lit) => {
      image.setAttribute('href', strip.urls[s] ?? '')
      node.style.transform = `translateY(${g.stripY(nodeBands[s].i)}px)`
      const t = value(lensIndex, s)
      node.style.opacity = lit && t != null ? String(0.34 + 0.66 * t) : '0'
      // The whisper travels with the water: whatever depth the strip is at is
      // the depth the lens line is reading.
      if (lit) writeWhisper(s)
    }
    if (park != null || still) {
      node.style.transition = 'none'
      put(Math.min(park ?? last, last), true)
      // Read a geometry back so the jump is committed before transitions are
      // handed back; without it the next fall starts from the wrong place.
      void node.getBoundingClientRect()
      node.style.transition = ''
      return undefined
    }
    node.style.transition = 'none'
    put(0, false)
    void node.getBoundingClientRect()
    node.style.transition = ''
    const timers = []
    for (let s = 0; s <= last; s++) {
      timers.push(
        setTimeout(() => put(s, true), PASS_LEAD_MS + s * PASS_STEP_MS),
      )
    }
    return () => {
      for (const timer of timers) clearTimeout(timer)
    }
    // `value` is a closure over these; it is a plain function so that the
    // nodes and the strip cannot read the field through two different ramps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replay, park, still, strip, g, nodeBands, field, lensIndex, armed, n, writeWhisper])

  /**
   * The output row's two ends, which share one line.
   *
   * At 390 they met in the middle: "␣roared — the stack settles on ␣through"
   * against "next: ␣The" left forty characters of overlapping glyphs where
   * two readings should have been. The right-hand end is short and is what
   * instrument B is about to do, so it is measured first and the left end is
   * clipped to whatever room is left. Its full wording stays in the tooltip.
   */
  const outLeftX = g.MX + g.mark + 5
  const outRightX = g.RIGHT - g.mark - 5
  const nextText = waiting
    ? 'next — running…'
    : nextToken
      ? `next: ${nextToken}`
      : 'no next token'
  const outText = (() => {
    if (selectedToken === undefined) return 'nothing to read'
    if (waiting) return `${selectedToken} — running distilgpt2…`
    if (!real) return `${selectedToken} — illustrative`
    if (!settled) {
      return compact
        ? `${selectedToken} — click a chip`
        : `${selectedToken} — click a chip to read the stack here`
    }
    return compact
      ? `${selectedToken} → ${settled}`
      : `${selectedToken} — the stack settles on ${settled}`
  })()
  const outRoom =
    outRightX - nextText.length * g.fs.out * CHAR - g.gap - outLeftX

  // The legend baselines. The key line and the cell rule each take a line of
  // their own at both widths — they are the two that have to be read. Wide
  // then shares the third line: the replay note at the left end, the head
  // legend at the right, 201 and 357 units of the 644 the row has. Compact
  // has room for neither beside the other, so it stacks all four.
  const keyY = g.legendY + g.fs.key + 2
  const cellY = keyY + g.fs.legend + 4
  const tailY = cellY + g.fs.legend + 3
  const headY = tailY
  const replayY = compact ? tailY + g.fs.legend + 3 : tailY
  const lo = field ? field.lo.toFixed(1) : '—'
  const hi = field ? field.hi.toFixed(1) : '—'

  return (
    <figure className="instrument" id="inst-forward-figure">
      <InstrumentHead
        eyebrow="INSTRUMENT F"
        title="The forward pass, live"
        purpose="The whole machine, drawn once — cut rock the pass never touches, and your sentence falling through it like water, picking up meaning as it goes."
        note={
          <LoadNote
            label={
              armed
                ? architectureNote(manifest)
                : 'illustrative — the shape of the pass, not its numbers'
            }
            status={modelStatus}
            progress={progress}
            onLoad={onLoad}
          />
        }
        stacked
      />

      <div className="inst-body">
        <ReadingLine text={text} />

        <div className="map-controls">
          {/* One slot, one width, whichever of the two is in it. The selector
              answers to `armed` rather than to `real`, so a STEP — which
              takes a pass out of date for a third of a second — does not
              swap the control out and move the button beside it. */}
          <div className="map-sel-slot">
            {armed ? (
              <label className="attn-sel">
                <span>layer</span>
                <select
                  value={layer}
                  onChange={(e) => onLayerChange(Number(e.target.value))}
                >
                  {Array.from({ length: REAL_LAYERS }, (_, l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <span className="map-sel-ghost">layer — real only</span>
            )}
          </div>
          <button
            type="button"
            className="btn map-run-btn"
            onClick={runAgain}
          >
            RUN THE PASS
          </button>
          <InfoTag topic={armed ? 'mapReal' : 'map'} />
          <span className="map-ctl-note">{note()}</span>
        </div>

        <div
          className="map-screen screen"
          style={{ aspectRatio: `${g.W} / ${g.H}` }}
        >
          <svg
            className="map-svg"
            viewBox={`0 0 ${g.W} ${g.H}`}
            role="img"
            aria-label={`distilgpt2 drawn once: ${REAL_LAYERS} blocks of attention and MLP, with the current sequence of ${n} tokens running down through them`}
          >
            {/* --- the sequence, across the top --- */}
            <text className="map-label" x={g.MX} y={g.chipY + g.chipH * 0.7}>
              {compact ? 'seq' : 'sequence'}
            </text>
            {columns.map((col) => {
              const on = col.i === lensIndex
              const label = clip(col.token, g.fs.chip, col.w - 4)
              return (
                <g
                  key={col.i}
                  className={`map-chip${on ? ' is-on' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`read position ${col.i}, ${col.token}`}
                  aria-pressed={on}
                  onClick={() => onSelect(col.i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect(col.i)
                    }
                  }}
                >
                  <title>{`${col.i} · ${col.token}`}</title>
                  <rect x={col.x} y={g.chipY} width={col.w} height={g.chipH} rx="2" />
                  <text
                    x={col.cx}
                    y={g.chipY + g.chipH * 0.72}
                    textAnchor="middle"
                    style={{ fontSize: g.fs.chip }}
                  >
                    {label}
                  </text>
                </g>
              )
            })}

            {/* --- what the columns are, said on the drawing ---

                The complaint this answers is that the columns were the one
                thing on the map nobody could name. They are not decoration
                and they are not a chart of anything: each is one token's
                vector on its way down, and the bright one is the token being
                read. Said here, next to them, rather than in the legend. */}
            <text
              className="map-annot"
              x={g.TRACK}
              y={g.annY}
              style={{ fontSize: g.fs.annot }}
            >
              {clip(
                compact
                  ? '↓ one token’s vector, falling'
                  : `↓ each column is one token’s vector falling through the machine${
                      selectedToken === undefined
                        ? ''
                        : ` — the bright one is ${selectedToken}`
                    }`,
                g.fs.annot,
                g.RIGHT - g.TRACK,
              )}
            </text>

            {/* --- the two headings --- */}
            <text className="map-header" x={g.MX + g.mark + 5} y={g.headerY}>
              {compact ? 'the file' : 'the machinery — click any box'}
            </text>
            <Window
              letter="E"
              x={g.MX}
              y={g.headerY - g.mark + 2}
              size={g.mark}
              label="open instrument E, the file"
              onOpen={() => onOpenInstrument('file')}
            />
            <text className="map-header" x={g.RIGHT} y={g.headerY} textAnchor="end">
              {compact ? 'the stream' : `the stream — ${MAP_STOPS} stops`}
            </text>

            {/* --- the machinery --- */}
            {bands.map(({ band, boxes }, bi) => {
              const y = g.bandY(bi)
              const isArcBand = bi === arcBand
              return (
                <g key={band.key} className={`map-band${isArcBand ? ' is-on' : ''}`}>
                  <rect
                    className="map-band-bg"
                    x={g.MX}
                    y={y}
                    width={g.RIGHT - g.MX}
                    height={g.bandH}
                    rx="3"
                  />
                  <text
                    className="map-label"
                    x={g.TRACK - 8}
                    y={y + g.boxH * 0.62}
                    textAnchor="end"
                  >
                    {compact ? band.short : band.label}
                  </text>
                  {boxes.map((box) => {
                    const facts = factsFor(box.tensor)
                    const tex = textureFor(box.tensor)
                    const label = compact ? (box.short ?? box.label) : box.label
                    const spec = compact ? '' : specFor(facts, g.fs.spec, box.w - 12)
                    const on = part && part.id === box.id && part.tensor === box.tensor
                    return (
                      <g
                        key={box.id}
                        className={`map-part${on ? ' is-on' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`read ${facts ? facts.display : box.label} out of the file`}
                        aria-pressed={Boolean(on)}
                        onClick={() => handlePart(box)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handlePart(box)
                          }
                        }}
                      >
                        <title>{partReadout(facts)}</title>
                        <rect
                          x={box.x}
                          y={y + g.boxTop}
                          width={box.w}
                          height={g.boxH}
                          rx="2"
                        />
                        {/* The tensor itself, faintly, inside the box that
                            names it: twelve by forty-eight block averages of
                            its real bytes. Inset by a hair so the box's own
                            stroke stays the edge of the box. */}
                        {tex ? (
                          <image
                            className="map-tex"
                            href={tex.frozen}
                            x={box.x + 0.8}
                            y={y + g.boxTop + 0.8}
                            width={Math.max(0, box.w - 1.6)}
                            height={g.boxH - 1.6}
                            preserveAspectRatio="none"
                          />
                        ) : null}
                        {tex?.moving ? (
                          <image
                            // Keyed on the replay counter for the same reason
                            // the head squares are: the machinery is not
                            // remounted, so without this the glint would run
                            // once and never again.
                            key={`glint-${replay}`}
                            className="map-tex map-glint"
                            href={tex.moving}
                            style={{ '--d': `${glintAt(bi)}ms` }}
                            x={box.x + 0.8}
                            y={y + g.boxTop + 0.8}
                            width={Math.max(0, box.w - 1.6)}
                            height={g.boxH - 1.6}
                            preserveAspectRatio="none"
                          />
                        ) : null}
                        <text
                          className="map-part-name"
                          x={box.x + g.pad}
                          y={y + g.boxTop + (spec ? g.fs.part + 2 : g.boxH * 0.65)}
                          style={{ fontSize: g.fs.part }}
                        >
                          {clip(label, g.fs.part, box.w - g.pad * 2)}
                        </text>
                        {spec ? (
                          <text
                            className="map-part-spec"
                            x={box.x + g.pad}
                            y={y + g.boxTop + g.boxH - 5}
                            style={{ fontSize: g.fs.spec }}
                          >
                            {spec}
                          </text>
                        ) : null}
                        {box.heads
                          ? Array.from({ length: REAL_HEADS }, (_, h) => {
                              const share = isArcBand && heads ? heads[h] : null
                              const tw = g.tick
                              const total = REAL_HEADS * tw + (REAL_HEADS - 1) * g.tickGap
                              // Room at the right end for the C marker.
                              const hx =
                                box.x + box.w - 8 - g.mark - total + h * (tw + g.tickGap)
                              const hy = y + g.boxTop + g.boxH - tw - 4
                              return (
                                <rect
                                  // Keyed on the replay counter as well as on
                                  // the head, so RUN THE PASS remounts these
                                  // and their arrival animation runs again.
                                  // The columns and threads get this for free
                                  // from the keyed group they live in; the
                                  // head squares are drawn inside the
                                  // machinery, which is not remounted.
                                  key={`${h}-${replay}`}
                                  className={`map-head${share == null ? '' : ' is-lit map-lit'}`}
                                  style={
                                    share == null
                                      ? undefined
                                      : {
                                          fillOpacity: 0.12 + 0.88 * share,
                                          '--d': `${1220 + h * 24}ms`,
                                        }
                                  }
                                  x={hx}
                                  y={hy}
                                  width={tw}
                                  height={tw}
                                  rx="1"
                                />
                              )
                            })
                          : null}
                      </g>
                    )
                  })}
                </g>
              )
            })}

            {/* --- the tie: the embedding table, used backwards --- */}
            <path
              className="map-tie"
              d={`M ${g.RIGHT} ${g.bandY(BANDS.length - 1) + g.boxTop + g.boxH / 2}
                  L ${g.tie} ${g.bandY(BANDS.length - 1) + g.boxTop + g.boxH / 2}
                  L ${g.tie} ${g.tieY}
                  L ${g.TRACK + g.trackW / 4} ${g.tieY}
                  L ${g.TRACK + g.trackW / 4} ${g.bandY(0) + g.boxTop}`}
            />

            {/* --- the moving part --- */}
            <g key={replay} className="map-stream">
              {columns.map((col) => {
                const on = col.i === lensIndex
                return (
                  <g key={col.i} className={`map-col${on ? ' is-on' : ''}`}>
                    <line
                      className="map-col-line"
                      x1={col.cx}
                      y1={g.chipY + g.chipH}
                      x2={col.cx}
                      y2={g.outY}
                    />
                    {/* Which way it goes. A column of dots on a page has no
                        direction in it, and depth running downwards is the
                        one thing this drawing asks the reader to take on
                        trust. One arrowhead in the gap under every band of
                        the column being read. */}
                    {on
                      ? nodeBands.slice(0, -1).map(({ band, i }) => {
                          const y = g.bandY(i) + g.bandH + 0.5
                          return (
                            <path
                              key={`arrow-${band.key}`}
                              className="map-arrow"
                              d={`M ${col.cx - 2.4} ${y} L ${col.cx + 2.4} ${y} L ${col.cx} ${y + 3.4} Z`}
                            />
                          )
                        })
                      : null}
                    {nodeBands.map(({ band, i }, s) => {
                      const t = value(col.i, s)
                      if (t == null) return null
                      const prev = s > 0 ? value(col.i, s - 1) : null
                      const length = field?.rows?.[col.i]?.[s]
                      const readout =
                        `the ${col.token} vector ${stopName(s)}` +
                        (length == null
                          ? ''
                          : ` — length ${length.toFixed(1)}${
                              field?.real ? '' : ', illustrative'
                            }`)
                      return (
                        <g key={band.key}>
                          {prev == null ? null : (
                            <line
                              className="map-seg map-lit"
                              style={{ '--d': `${col.i * 34 + s * 108}ms`,
                                strokeOpacity: 0.14 + 0.5 * ((prev + t) / 2) }}
                              x1={col.cx}
                              y1={g.nodeY(nodeBands[s - 1].i)}
                              x2={col.cx}
                              y2={g.nodeY(i)}
                            />
                          )}
                          {/* Every node is a button: it parks the falling
                              strip at that depth, and on another token's
                              column it moves the reading there first. Only the
                              selected column's seven are in the tab order —
                              twenty tokens would otherwise put a hundred and
                              forty stops between this drawing and the next
                              control. The other columns are reached by their
                              chip, which is already a tab stop, and their
                              nodes then become these. */}
                          <g
                            className="map-dot"
                            role="button"
                            tabIndex={on ? 0 : -1}
                            aria-label={`park the strip on ${readout}`}
                            aria-pressed={on && park === s}
                            onClick={() => {
                              if (!on) onSelect(col.i)
                              setPark(s)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                if (!on) onSelect(col.i)
                                setPark(s)
                              }
                            }}
                          >
                            <title>{readout}</title>
                            <circle
                              className="map-node map-lit"
                              style={{
                                '--d': `${col.i * 34 + s * 108}ms`,
                                fillOpacity: 0.3 + 0.7 * t,
                              }}
                              cx={col.cx}
                              cy={g.nodeY(i)}
                              r={1.8 + 2.6 * t}
                            />
                            <circle
                              className="map-dot-hit"
                              cx={col.cx}
                              cy={g.nodeY(i)}
                              r={Math.max(6, 1.8 + 2.6 * t)}
                            />
                          </g>
                        </g>
                      )
                    })}
                  </g>
                )
              })}

              {/* attention, in the selected layer, for the selected token */}
              {arcBand != null && arcs && arcMax > 0
                ? columns.slice(0, lensIndex).map((col) => {
                    const w = arcs[col.i] / arcMax
                    if (!(w > 0.02)) return null
                    // A thread leaves the stream as it stood BEFORE this block
                    // and lands on the selected token as it stands after it,
                    // because that is the direction attention actually moves:
                    // layer L reads every position's incoming vector and folds
                    // the blend into one of them.
                    const q = columns[lensIndex]
                    const from = g.nodeY(arcBand - 1)
                    const to = g.nodeY(arcBand)
                    const mid = (from + to) / 2
                    return (
                      <path
                        key={col.i}
                        className="map-arc map-lit"
                        style={{ '--d': '1180ms', strokeOpacity: 0.16 + 0.84 * w }}
                        d={`M ${col.cx} ${from} C ${col.cx} ${mid} ${q.cx} ${mid} ${q.cx} ${to}`}
                      />
                    )
                  })
                : null}
            </g>

            {/* --- the water itself: one token's 768 numbers, falling ---

                A reserved lane in every band, one element, moved by transform
                and lit by opacity. It is a replay: ONNX hands back the
                intermediate tensors only once the pass has finished, so what
                falls here has already happened. The legend says so. */}
            <g
              ref={stripRef}
              className={`map-strip${park != null ? ' is-parked' : ''}`}
              style={{ '--travel': `${PASS_STEP_MS}ms`, opacity: 0 }}
              aria-hidden="true"
            >
              <rect
                className="map-strip-bed"
                x={g.TRACK}
                y={-g.stripH / 2 - 1}
                width={g.trackW}
                height={g.stripH + 2}
                rx="1"
              />
              <image
                ref={stripImgRef}
                className="map-strip-cells"
                x={g.TRACK}
                y={-g.stripH / 2}
                width={g.trackW}
                height={g.stripH}
                preserveAspectRatio="none"
              />
            </g>

            {/* --- what falls out --- */}
            <text className="map-out" x={outLeftX} y={g.outY + g.fs.out + 4}>
              <title>{outText}</title>
              {clip(outText, g.fs.out, outRoom)}
            </text>
            <text
              className="map-out is-next"
              x={outRightX}
              y={g.outY + g.fs.out + 4}
              textAnchor="end"
            >
              {nextText}
            </text>

            {/* --- the landing ---

                The water reaches the bottom and splashes across the whole
                vocabulary. One bar per candidate, its height that candidate's
                probability, drawn under the last token's own column because
                that is the stream this distribution belongs to. The bar the
                sampler actually took is in the moving amber; the rest stay
                frozen blue, because they are roads not taken.

                Heights are the probabilities themselves, scaled to the tallest
                one — so the picture is of how peaked this distribution is,
                which is the thing worth seeing, and the tooltip gives every
                bar its real percentage rather than making anyone read it off
                a height. */}
            {splashIsHere ? (
              <g className="map-splash">
                <title>
                  {`the last vector against the whole vocabulary — ${splash
                    .map((c) => `${c.token} ${(c.p * 100).toFixed(1)}%`)
                    .join(' · ')}. These are the machine's own probabilities, before instrument B skips whitespace pieces, so ␣ and ⏎ appear here and not there.`}
                </title>
                {splash.map((cand, i) => {
                  const total = g.splashN * (g.splashW + g.splashGap) - g.splashGap
                  const left = Math.min(
                    Math.max(g.TRACK, (columns[n - 1]?.cx ?? g.TRACK + total / 2) - total / 2),
                    g.RIGHT - total,
                  )
                  const h = Math.max(0.6, (cand.p / splash[0].p) * g.splashH)
                  const took = nextToken != null && cand.token === nextToken
                  return (
                    <rect
                      key={cand.id}
                      className={`map-splash-bar${took ? ' is-took' : ''}`}
                      x={left + i * (g.splashW + g.splashGap)}
                      y={g.splashBase - h}
                      width={g.splashW}
                      height={h}
                      rx="0.5"
                    />
                  )
                })}
              </g>
            ) : null}

            <Window
              letter="B"
              x={g.RIGHT - g.mark}
              y={g.outY + 1}
              size={g.mark}
              label="open instrument B, the forward pass and the KV rack"
              onOpen={() => onOpenInstrument('stepper')}
            />

            {/* --- windows onto the other instruments --- */}
            <Window
              letter="A"
              x={g.TRACK + g.trackW / 2 - g.gap - g.mark - 4}
              y={g.bandY(0) + g.boxTop + 3}
              size={g.mark}
              label="open instrument A, the tokenizer — your tokens become rows of wte"
              onOpen={() => onOpenInstrument('tokenizer')}
            />
            <Window
              letter="C"
              x={bands[headBand].boxes[1].x + bands[headBand].boxes[1].w - g.mark - 4}
              y={g.bandY(headBand) + g.boxTop + 2}
              size={g.mark}
              label="open instrument C, one head of this layer in detail"
              onOpen={() => onOpenInstrument('attention')}
            />
            <Window
              letter="D"
              x={g.MX}
              y={g.outY + 1}
              size={g.mark}
              label="open instrument D, the glass pass on this token"
              onOpen={() => onOpenInstrument('glass')}
            />

            {/* --- the lens, whispered as the water passes ---

                The words go in the tspan, which is rendered with no children
                so React has nothing to reconcile inside it and never
                overwrites what the timeline wrote. The title is a sibling of
                that tspan rather than the thing being written, for the same
                reason. The line is reserved in the geometry whether or not
                there is anything to say in it, so nothing below the figure
                moves when there is.

                Not announced live: it changes seven times in a second, and a
                screen reader reading every depth aloud as the water fell would
                be noise. Instrument D presents the same seven readings as a
                table, which is where they can actually be read. */}
            <text
              className="map-whisper"
              x={g.MX}
              y={g.whisperY}
              style={{ fontSize: g.fs.whisper }}
            >
              <title>
                the logit lens: this token’s running vector at that depth, put
                through the model’s own final LayerNorm and unembedding. It is
                what the machine would say if the stack stopped there — not a
                prediction it makes at that depth. The same reading instrument
                D prints, from the same worker.
              </title>
              <tspan ref={whisperRef} />
            </text>

            {/* --- legend: what the lit things mean ---

                The first line is not fine print. It is the one sentence that
                turns the drawing into a reading — what the strip is and what
                its brightness measures — so it is set at the size of the
                readouts and in the screen's own text colour, and the smaller
                second line carries the two honesty notes under it. */}
            <text className="map-legend is-key" x={g.MX} y={keyY}>
              {real
                ? compact
                  ? `strip = 768 numbers · ‖residual‖ ${lo} → ${hi}, log`
                  : `strip = this token’s 768 numbers · brightness = ‖residual‖ ${lo} → ${hi}, log scale`
                : waiting
                  ? compact
                    ? '‖residual‖ — waiting on this pass'
                    : 'strip and nodes = ‖residual‖ — waiting on this pass'
                  : compact
                    ? 'strip = 768 numbers — illustrative stand-in'
                    : 'strip = this token’s 768 numbers — illustrative stand-in, not a measurement'}
            </text>
            <text className="map-legend" x={g.MX} y={cellY}>
              {compact
                ? `cell = |value| vs ${STRIP_CAP}× the middle value there`
                : `cell = |value| against ${STRIP_CAP}× the middle value at that depth`}
            </text>
            <text
              className="map-legend"
              x={compact ? g.MX : g.RIGHT}
              y={headY}
              textAnchor={compact ? 'start' : 'end'}
            >
              {real || waiting
                ? compact
                  ? HEAD_LEGEND_SHORT
                  : HEAD_LEGEND
                : 'no heads to light — load the real model'}
            </text>
            <text className="map-legend" x={g.MX} y={replayY}>
              a replay — this pass has already run
            </text>
          </svg>
        </div>

        <div className="map-readout-row">
          <p className="map-readout">{partReadout(partFacts)}</p>
          <button
            type="button"
            className="btn map-open-btn"
            disabled={!partFacts}
            onClick={() => partFacts && onOpenTensor(partFacts.name)}
          >
            OPEN IN THE FILE
          </button>
        </div>

        <TeachPair
          className="teach dim"
          show={armed ? 'b' : 'a'}
          a="the machinery is drawn from the file's own manifest, so every shape and byte count here is real, and the texture inside each box is that tensor's own bytes read out of the file. the water is not: no model is running, so the strip and the columns are the same deterministic stand-ins instrument D prints, and they are labelled as such."
          b="one drawing, six readings. the shapes and byte counts come from the file and the texture in each box is that tensor's own bytes; the strip is this token's 768 numbers at one depth; the columns are the length of that vector at each depth; the threads are the selected layer's attention averaged over its twelve heads; and the line at the bottom is the token instrument B appends next."
        />
      </div>

      <figcaption>
        FIG.3 — distilgpt2, drawn once, with the sentence falling through it.
        Depth runs down; the sequence runs across. The boxes are cut rock:
        training shaped them and a pass does not touch them. The strip is the
        water — one token&rsquo;s vector, picking up meaning as it goes.
      </figcaption>
    </figure>
  )
}
