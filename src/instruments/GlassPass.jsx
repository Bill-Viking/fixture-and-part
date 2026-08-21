import { useMemo } from 'react'
import {
  CANDIDATE_COUNT,
  LENS_STOPS,
  STOP_LABELS,
  formatVector,
  illustrativeLens,
  residualVector,
} from '../lib/toyModel.js'
import { formatRealVector, residualPreview } from '../lib/realModel.js'
import InfoTag from '../components/InfoTag.jsx'
import LoadNote from '../components/LoadNote.jsx'
import TeachPair from '../components/TeachPair.jsx'

const SLOTS = Array.from({ length: CANDIDATE_COUNT }, (_, i) => i)
const LAST_STOP = LENS_STOPS - 1

/**
 * The winner's share, painted steel where it is still a rumour and amber
 * where it has become the answer. The colour is doing the same job the bars
 * do — showing a value move — so it comes off the same two tokens.
 *
 * The ramp saturates before the top of the range rather than at it, so the
 * bottom row of a real reading arrives at unmistakable amber instead of at a
 * near miss, and it starts a little off the floor so the faintest share still
 * reads as carried-but-barely rather than as nothing at all.
 */
function traceColour(share) {
  if (share == null) return undefined
  const mix = Math.round((0.08 + 0.92 * Math.min(1, share / 0.45)) * 100)
  return `color-mix(in srgb, var(--amber) ${mix}%, var(--steel-dim))`
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
  sequence,
  baseTokens,
  lensIndex,
  onSelect,
  real,
  run,
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

  const residual = (stop) => {
    if (real) {
      const row = residualPreview(run, stop, lensIndex)
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
      <div className="inst-head">
        <span className="inst-title">INSTRUMENT D — GLASS PASS</span>
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
      </div>

      <div className="inst-body">
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
          <span className="lens-head-res">residual stream</span>
          <span className="lens-head-cand">what it would say next</span>
          <span className="lens-head-trace">winner</span>
        </div>

        <div className="lens-rows">
          {STOP_LABELS.map((label, stop) => {
            const rows = shortlist(stop)
            const share = trace ? trace[stop] : null
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
              </div>
            )
          })}
        </div>

        <p className="lens-note" aria-live="polite">
          {note()}
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
          b="real lens. each depth is distilgpt2’s own running vector for this position, pushed through its own final layernorm and its own embedding table used backwards — the arithmetic the stack performs once at the end, performed seven times instead."
        />
      </div>

      <figcaption>
        FIG.4 — One position, read at seven depths. The winner column prices
        the token the last row settles on, all the way back up the stack.
      </figcaption>
    </figure>
  )
}
