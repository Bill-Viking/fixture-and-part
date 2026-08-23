import { useCallback, useEffect, useMemo, useState } from 'react'
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
  topOfFinalLogits,
} from '../lib/forwardMap.js'
import { REAL_HEADS, REAL_LAYERS } from '../lib/realModel.js'
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
        headerY: 40, tieY: 46, bandTop: 52, bandH: 40, bandGap: 4,
        boxTop: 3, boxH: 22, nodeDY: 32, outH: 30, legendH: 26,
        gap: 4, pad: 4, tick: 3, tickGap: 1, mark: 12,
        fs: { label: 9, part: 8.5, spec: 7, chip: 8, out: 9, legend: 8, header: 8 },
      }
    : {
        W: 684, MX: 20, RIGHT: 664, TRACK: 84,
        chipY: 12, chipH: 20, chipMax: 54,
        headerY: 46, tieY: 54, bandTop: 62, bandH: 40, bandGap: 4,
        boxTop: 3, boxH: 24, nodeDY: 33, outH: 32, legendH: 18,
        gap: 6, pad: 6, tick: 6, tickGap: 1.5, mark: 13,
        fs: { label: 9.5, part: 9, spec: 7.5, chip: 9, out: 10, legend: 9, header: 8.5 },
      }
  const bandY = (i) => g.bandTop + i * (g.bandH + g.bandGap)
  const lastBottom = bandY(BANDS.length - 1) + g.bandH
  const outY = lastBottom + 8
  const legendY = outY + g.outH + 6
  return {
    ...g,
    compact,
    bandY,
    nodeY: (i) => bandY(i) + g.nodeDY,
    outY,
    legendY,
    H: legendY + g.legendH + 8,
    trackW: g.RIGHT - g.TRACK,
    tie: g.W - 6,
  }
}

const fits = (text, size, width) => text.length * size * CHAR <= width

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
  const [part, setPart] = useState(null)
  const [replay, setReplay] = useState(0)

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
        if (!cancelled) setManifest(module.default.manifest)
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

  // A new pass, or a new token appended, replays the drawing.
  useEffect(() => {
    setReplay((r) => r + 1)
  }, [runKey, stepTick, n])

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
          }
        : { real: false }
  }, [real, run, field, heads, lensIndex, layer])

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

  const nodeBands = bands
    .map(({ band }, i) => ({ band, i }))
    .filter(({ band }) => band.stop !== null)

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

  return (
    <figure className="instrument" id="inst-forward-figure">
      <InstrumentHead
        eyebrow="INSTRUMENT F"
        title="The forward pass, live"
        purpose="The whole machine, drawn once — and your sentence moving through it, token by token, layer by layer."
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
            onClick={() => setReplay((r) => r + 1)}
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
                    {nodeBands.map(({ band, i }, s) => {
                      const t = value(col.i, s)
                      if (t == null) return null
                      const prev = s > 0 ? value(col.i, s - 1) : null
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

            {/* --- legend: what the two lit things mean --- */}
            <text className="map-legend" x={g.MX} y={g.legendY + g.fs.legend + 2}>
              {real
                ? `node = ‖residual‖ ${
                    field ? field.lo.toFixed(1) : '—'
                  } → ${field ? field.hi.toFixed(1) : '—'}, log scale`
                : waiting
                  ? 'node = ‖residual‖ — waiting on this pass'
                  : 'node brightness — illustrative stand-in, not a measurement'}
            </text>
            <text
              className="map-legend"
              x={compact ? g.MX : g.RIGHT}
              y={
                compact
                  ? g.legendY + g.fs.legend * 2 + 6
                  : g.legendY + g.fs.legend + 2
              }
              textAnchor={compact ? 'start' : 'end'}
            >
              {real || waiting
                ? compact
                  ? HEAD_LEGEND_SHORT
                  : HEAD_LEGEND
                : 'no heads to light — load the real model'}
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
          a="the machinery is drawn from the file's own manifest, so every shape and byte count here is real. the columns are not: no model is running, so they are the same deterministic stand-ins instrument D prints, and they are labelled as such."
          b="one drawing, five readings. the shapes and byte counts come from the file, the columns are the norm of this token's running vector at each depth, the threads are the selected layer's attention averaged over its twelve heads, and the line at the bottom is the token instrument B appends next."
        />
      </div>

      <figcaption>
        FIG.3 — distilgpt2, drawn once, with the sentence in it. Depth runs
        down; the sequence runs across; a node is one token&rsquo;s running
        vector at one depth.
      </figcaption>
    </figure>
  )
}
