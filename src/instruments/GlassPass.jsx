import NumberStatus from '../components/NumberStatus.jsx'
import { COMPANY } from '../lib/company.js'
import { useMemo } from 'react'
import {
  CANDIDATE_COUNT,
  LENS_STOPS,
  STOP_LABELS,
  formatVector,
  illustrativeLens,
  residualVector,
} from '../lib/toyModel.js'
import { REAL_HIDDEN, formatRealVector, residualPreview } from '../lib/realModel.js'
import InfoTag from '../components/InfoTag.jsx'
import LoadNote from '../components/LoadNote.jsx'
import ReadingLine from '../components/ReadingLine.jsx'
import TeachPair from '../components/TeachPair.jsx'
import InstrumentHead from '../components/InstrumentHead.jsx'

const SLOTS = Array.from({ length: CANDIDATE_COUNT }, (_, i) => i)
const LAST_STOP = LENS_STOPS - 1

/** Full-vector norms, never the six-number preview's length. */
function vectorMotion(run, stop, index) {
  const current = run?.residuals?.[stop]
  const previous = stop > 0 ? run?.residuals?.[stop - 1] : null
  if (!current || index < 0 || index >= run.n ||
      current.length !== run.n * REAL_HIDDEN ||
      (stop > 0 && previous?.length !== current.length)) return null
  const base = index * REAL_HIDDEN
  let length2 = 0
  let moved2 = 0
  for (let d = 0; d < REAL_HIDDEN; d++) {
    const value = current[base + d]
    length2 += value * value
    if (previous) moved2 += (value - previous[base + d]) ** 2
  }
  return { length: Math.sqrt(length2), moved: previous ? Math.sqrt(moved2) : null }
}

function motionNumber(value) {
  return value == null ? '—' : value.toLocaleString('en-US', {
    minimumFractionDigits: value < 100 ? 1 : 0,
    maximumFractionDigits: value < 100 ? 1 : 0,
  })
}

/** Read the same pieces and shares the table prints, including illustrative data. */
function readingSummary(live) {
  // ASSUMES: stops are rim, then blocks 0–5; trace prices the last row's winner.
  // A missing/partial reading supplies no sentence; its reserved box stays put.
  if (!live || live.status === 'error' || live.stops?.length !== LENS_STOPS ||
      live.trace?.length !== LENS_STOPS ||
      !live.trace.every((share) => Number.isFinite(share) && share >= 0 && share <= 1)) return ''
  const tops = [1, 4, LAST_STOP].map((stop) => live.stops[stop]?.[0])
  if (tops.some((row) => typeof row?.token !== 'string' ||
      !Number.isFinite(row.weight) || row.weight < 0 || row.weight > 1)) return ''
  const [start, middle, end] = tops.map((row) => `${row.token} (${row.weight.toFixed(2)})`)
  const firstTenth = live.trace.findIndex((share) => share >= 0.10)
  const tail = firstTenth === 0
    ? 'the final word is above a tenth from the start'
    : firstTenth > 0 && firstTenth < LAST_STOP
      ? `the final word first passes a tenth after block ${firstTenth - 1}`
      : 'the final word passes a tenth only in the last row'
  return `at the start it says ${start} · by the middle ${middle} · at the end it chooses ${end} — ${tail}`
}

/**
 * The winner's share, painted the frozen blue where it is still a rumour and
 * the moving yellow where it has become the answer. The colour is doing the
 * same job the bars do — showing a value move — so it comes off the same two
 * tokens. These rows are a screen, so it is the on-screen blue.
 *
 * The ramp saturates before the top of the range rather than at it, so the
 * bottom row of a real reading arrives at the unmistakable moving-part yellow
 * instead of at a near miss, and it starts a little off the floor so the
 * faintest share still reads as carried-but-barely rather than as nothing at
 * all.
 */
function traceColour(share) {
  if (share == null) return undefined
  const mix = Math.round((0.08 + 0.92 * Math.min(1, share / 0.45)) * 100)
  return `color-mix(in srgb, var(--moving) ${mix}%, var(--frozen-on-screen))`
}

/** One candidate of one depth. An empty slot keeps the row's geometry. */
function LensBar({ token, weight, wins }) {
  const filled = token !== undefined && token !== null
  return (
    <span className={`lens-bar${wins ? ' is-top' : ''}`}>
      <span className="lens-word">{filled ? token : ''}</span>
      <span className="lens-track">
        {filled && (
          <span
            className="lens-fill"
            style={{ width: `${Math.min(100, weight * 100)}%` }}
          />
        )}
      </span>
      <span className="lens-wt">{filled ? weight.toFixed(2) : ''}</span>
    </span>
  )
}

/**
 * Instrument D — the glass pass.
 *
 * A transformer's layers all write into the same running vector, so that
 * vector can be read at any depth. Read it, push it through the model's own
 * final LayerNorm and unembedding, and what comes back is the next-word
 * belief as it stood at that depth. Seven depths, top to bottom, and the
 * belief narrowing between them is the whole instrument.
 *
 * The last row is not an approximation of anything: it is the same LayerNorm
 * and the same unembedding the graph runs at the end of a pass, so it
 * reproduces the model's own output distribution for the position. That
 * identity is why the panel can claim the row belongs to the machine rather
 * than to the drawing.
 *
 * In illustrative mode the shortlists come from toyModel, hand-tuned on the
 * default sentence and deterministic otherwise, and the last row is pinned to
 * whatever instrument B is about to commit — the two must never disagree.
 */
export default function GlassPass({
  text,
  sequence,
  baseTokens,
  lensIndex,
  onSelect,
  real,
  run,
  bakedRun,
  reading,
  stale,
  pending,
  modelStatus,
  progress,
  onLoad,
}) {
  const generated = useMemo(
    () => sequence.slice(baseTokens.length),
    [sequence, baseTokens.length],
  )
  const toyReading = useMemo(
    () => (real ? null : illustrativeLens(baseTokens, generated, lensIndex)),
    [real, baseTokens, generated, lensIndex],
  )

  const token = sequence[lensIndex]
  const live = real ? reading : toyReading
  const hasReading = Boolean(live) && !stale
  const trace = hasReading ? live.trace : null
  // The baked pass is for the shipped sentence only. App withholds it as
  // soon as the sentence changes or generation appends another position.
  const vectorRun = real ? run : bakedRun

  const residual = (stop) => {
    if (real || bakedRun) {
      const row = residualPreview(vectorRun, stop, lensIndex)
      return row ? formatRealVector(row) : '—'
    }
    return token === undefined ? '—' : formatVector(residualVector(token, stop))
  }

  const shortlist = (stop) => (hasReading ? (live.stops[stop] ?? null) : null)

  const note = () => {
    if (token === undefined) return 'no input — type something into instrument A.'
    if (!real) return `reading position ${lensIndex} — illustrative`
    if (stale) return 'sequence has moved — click a token to read again'
    if (!reading) return 'click a token to read its stack'
    if (reading.status === 'error') return `lens unavailable — ${reading.message}`
    if (reading.status === 'pending') {
      return `reading position ${lensIndex} — pushing each depth through the unembedding…`
    }
    return `reading position ${lensIndex} — ${token}`
  }

  return (
    <figure className="instrument">
      <InstrumentHead
        eyebrow="INSTRUMENT D"
        title="The glass pass"
        purpose="One token’s running vector at each depth, and what the model would say next from there."
        note={
          <LoadNote
            label={
              real
                ? 'real distilgpt2 residual stream · real logit lens'
                : toyReading?.tuned
                  ? 'illustrative lens — hand-tuned'
                  : 'illustrative lens — heuristic'
            }
            status={modelStatus}
            progress={progress}
            onLoad={onLoad}
          />
        }
      />

      <div className="inst-body">
        <ReadingLine text={text} />

        <div className="label-row tight">
          <span className="field-label">
            read at — click any token to move the window
          </span>
          <InfoTag topic={real ? 'lensReal' : 'lens'} />
        </div>
        <div className="query-strip">
          {sequence.map((piece, i) => (
            <button
              type="button"
              key={`${i}-${piece}`}
              className={`query-token${i === lensIndex ? ' is-query' : ''}`}
              aria-pressed={i === lensIndex}
              onClick={() => onSelect(i)}
            >
              {piece}
            </button>
          ))}
        </div>

        <div className="lens-head">
          <span className="field-label">depth</span>
          <span className="lens-head-res">the vector so far{COMPANY && <NumberStatus source={bakedRun ? 'pass' : 'standin'} changing />}</span>
          <span className="lens-head-cand">if it stopped here it would say{COMPANY && <NumberStatus source="standin" />}</span>
          <span className="lens-head-trace">final word’s share{COMPANY && <NumberStatus source="standin" />}</span>
        </div>

        <div className="lens-rows screen">
          {STOP_LABELS.map((label, stop) => {
            const rows = shortlist(stop)
            const share = trace ? trace[stop] : null
            const motion = vectorMotion(vectorRun, stop, lensIndex)
            return (
              <div
                className={`lens-row${stop === LAST_STOP ? ' is-final' : ''}`}
                key={label}
              >
                <span className="lens-stop">{label}</span>
                <span className="lens-res" title={residual(stop)}>
                  {pending && real ? '—' : residual(stop)}
                </span>
                <div className="lens-cands">
                  {SLOTS.map((slot) => {
                    const row = rows ? rows[slot] : null
                    return (
                      <LensBar
                        key={slot}
                        token={row ? row.token : null}
                        weight={row ? row.weight : 0}
                        wins={Boolean(row && row.wins)}
                      />
                    )
                  })}
                </div>
                <span className="lens-trace" style={{ color: traceColour(share) }}>
                  <span className="lens-trace-val">
                    {share == null ? '—' : share.toFixed(3)}
                  </span>
                  <span className="lens-trace-track">
                    <span
                      className="lens-trace-fill"
                      style={{ width: `${Math.min(100, (share ?? 0) * 100)}%` }}
                    />
                  </span>
                </span>
                <span className="lens-motion">
                  {`length ${motionNumber(motion?.length)} · moved ${motionNumber(motion?.moved)}`}
                </span>
              </div>
            )
          })}
        </div>

        <p className="lens-note" aria-live="polite">
          {COMPANY && <NumberStatus source="standin" />}
          {note()}
        </p>
        <p className="lens-note lens-reading" aria-live="polite">
          {COMPANY && <NumberStatus source="standin" />}
          {readingSummary(hasReading ? live : null)}
        </p>

        <TeachPair
          className="lens-final"
          show={real ? 'b' : 'a'}
          a="the last row is where the belief settles — hand-tuned so its winner is the token instrument B appends next."
          b="the last row is the machine’s next-word distribution — the same numbers instrument B’s shortlist reads for this position, before the sampler skips whitespace, so ␣ and ⏎ pieces appear here and not there."
        />

        <TeachPair
          className="teach dim"
          show={real ? 'b' : 'a'}
          a="illustrative lens. the shortlists are hand-tuned on the default sentence and deterministic otherwise; no model is running. the last row is pinned to the token instrument B commits, so the two instruments cannot disagree."
          b="real lens. at each depth the half-finished vector is taken out and held up to the word table as if the pass had ended there; the last row is what the model does say — the same numbers instrument B’s shortlist reads for this position. in the model’s terms: its own running vector, pushed through its own final layernorm and its own embedding table used backwards."
        />
      </div>

      <figcaption>
        FIG.8 — One position, read at seven depths. The winner column prices
        the token the last row settles on, all the way back up the stack.
      </figcaption>
    </figure>
  )
}
