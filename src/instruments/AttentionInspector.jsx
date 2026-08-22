import { useMemo } from 'react'
import {
  attention,
  isHandTuned,
  kDescriptor,
  topRow,
} from '../lib/toyModel.js'
import { REAL_HEADS, REAL_LAYERS } from '../lib/realModel.js'
import InfoTag from '../components/InfoTag.jsx'
import LoadNote from '../components/LoadNote.jsx'
import ReadingLine from '../components/ReadingLine.jsx'
import TeachPair from '../components/TeachPair.jsx'

const LAYER_OPTIONS = Array.from({ length: REAL_LAYERS }, (_, i) => i)
const HEAD_OPTIONS = Array.from({ length: REAL_HEADS }, (_, i) => i)

function score(value) {
  return Number.isFinite(value) ? value.toFixed(2) : '—'
}

/**
 * Instrument C — attention inspector.
 * Reads the live sequence from Instrument B, enforces the causal mask, and
 * spends one fixed 1.0 budget of softmax weight across the prior tokens.
 *
 * In real mode the rows come straight out of distilgpt2's own softmax for the
 * chosen layer and head, which differs from the illustrative table in two
 * honest ways: the query attends to itself, so its row carries a weight, and
 * the Q·K column is relative to the strongest row, because softmax discards
 * the constant that would pin the raw scores down.
 */
export default function AttentionInspector({
  text,
  sequence,
  queryIndex,
  onQueryChange,
  real,
  realRows,
  realIds,
  pending,
  modelStatus,
  progress,
  onLoad,
  layer,
  head,
  onLayerChange,
  onHeadChange,
}) {
  const toyRows = useMemo(
    () => attention(sequence, queryIndex),
    [sequence, queryIndex],
  )
  const rows = real ? (realRows ?? []) : toyRows
  const best = useMemo(() => topRow(rows), [rows])
  const tuned = isHandTuned(sequence, queryIndex)
  const queryToken = sequence[queryIndex]
  // Real attention includes the query's own row; the illustrative table stops
  // one short of it.
  const lastDataRow = real ? queryIndex : queryIndex - 1

  return (
    <figure className="instrument">
      <div className="inst-head">
        <span className="inst-title">INSTRUMENT C — ATTENTION INSPECTOR</span>
        <LoadNote
          label={
            real
              ? `real distilgpt2 attention · layer ${layer} · head ${head}`
              : tuned
                ? 'illustrative weights — hand-tuned'
                : 'illustrative weights — heuristic'
          }
          status={modelStatus}
          progress={progress}
          onLoad={onLoad}
        />
      </div>

      <div className="inst-body">
        <ReadingLine text={text} />

        <div className="attn-controls">
          {real ? (
            <>
              <label className="attn-sel">
                <span>layer</span>
                <select
                  value={layer}
                  onChange={(e) => onLayerChange(Number(e.target.value))}
                >
                  {LAYER_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="attn-sel">
                <span>head</span>
                <select
                  value={head}
                  onChange={(e) => onHeadChange(Number(e.target.value))}
                >
                  {HEAD_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
              <span className="attn-ctl-note">
                {REAL_LAYERS} layers &times; {REAL_HEADS} heads &middot; Q&middot;K
                is printed relative to the top row
              </span>
            </>
          ) : (
            <span className="attn-ctl-note">
              one head, one layer — layer and head selectors come with the real
              model.
            </span>
          )}
        </div>

        <p className="field-label">
          querying token — click any token to move the query
        </p>
        <div className="query-strip">
          {sequence.map((token, i) => (
            <button
              type="button"
              key={`${i}-${token}`}
              className={`query-token${i === queryIndex ? ' is-query' : ''}`}
              aria-pressed={i === queryIndex}
              onClick={() => onQueryChange(i)}
            >
              {token}
            </button>
          ))}
        </div>

        <div className="label-row">
          <TeachPair
            as="span"
            className="field-label"
            show={real ? 'b' : 'a'}
            a="lookup — rows from the query on are locked"
            b="lookup — rows past the query are locked"
          />
          <InfoTag topic="mask" />
        </div>

        <div className="attn-table screen" role="table" aria-label="attention lookup">
          <div className="attn-row attn-head" role="row">
            <span className="c-tok" role="columnheader">token</span>
            <span className="c-k" role="columnheader">
              {real ? 'token id' : 'K descriptor'}
            </span>
            <span className="c-score" role="columnheader">
              {real ? 'Q·K rel' : 'Q·K'}
            </span>
            <span className="c-bar" role="columnheader">softmax weight</span>
            <span className="c-v" role="columnheader">V</span>
          </div>

          {pending && (
            <div className="attn-row" role="row">
              <span className="c-tok" role="cell">&mdash;</span>
              <span className="c-k" role="cell">running distilgpt2…</span>
              <span className="c-score" role="cell">&mdash;</span>
              <span className="c-bar" role="cell">
                <span className="track" />
                <span className="wt">&mdash;</span>
              </span>
              <span className="c-v" role="cell">
                <span className="chip chip-v off">V</span>
              </span>
            </div>
          )}

          {!pending &&
            sequence.map((token, i) => {
              const row = rows[i]
              if (i <= lastDataRow && row) {
                const isSelf = i === queryIndex
                return (
                  <div
                    className={`attn-row${isSelf ? ' self' : ''}`}
                    role="row"
                    key={`${i}-${token}`}
                    title={isSelf ? 'the query reading its own row' : undefined}
                  >
                    <span className="c-tok" role="cell">{token}</span>
                    <span className="c-k" role="cell">{row.k}</span>
                    <span className="c-score" role="cell">
                      {score(row.score)}
                    </span>
                    <span className="c-bar" role="cell">
                      <span className="track">
                        <span
                          className="fill"
                          style={{ width: `${row.weight * 100}%` }}
                        />
                      </span>
                      <span className="wt">{row.weight.toFixed(2)}</span>
                    </span>
                    <span className="c-v" role="cell">
                      <span className="chip chip-v">V</span>
                    </span>
                  </div>
                )
              }

              const isSelf = i === queryIndex
              return (
                <div
                  className={`attn-row locked${isSelf ? ' self' : ''}`}
                  role="row"
                  key={`${i}-${token}`}
                  title={
                    isSelf
                      ? 'querying token'
                      : 'causal mask: not yet visible'
                  }
                >
                  <span className="c-tok" role="cell">{token}</span>
                  <span className="c-k" role="cell">
                    {real
                      ? realIds && realIds[i] !== undefined
                        ? `id ${realIds[i]}`
                        : '—'
                      : isSelf
                        ? 'querying token'
                        : kDescriptor(token)}
                  </span>
                  <span className="c-score" role="cell">&mdash;</span>
                  <span className="c-bar" role="cell">
                    <span className="track" />
                    <span className="wt">
                      {isSelf ? 'Q' : 'masked'}
                    </span>
                  </span>
                  <span className="c-v" role="cell">
                    <span className="chip chip-v off">V</span>
                  </span>
                </div>
              )
            })}
        </div>

        <div className="budget">
          <span className="field-label">budget of 1.0</span>
          <InfoTag topic="budget" />
          <span className="budget-track">
            {rows.map((row) => (
              <span
                className="budget-seg"
                key={row.index}
                style={{ width: `${row.weight * 100}%` }}
                title={`${row.token} — ${row.weight.toFixed(2)}`}
              />
            ))}
          </span>
        </div>

        <p className="blend">
          &Sigma; weightᵢ &times; Vᵢ &rarr; folded into{' '}
          <span className="blend-target">
            {queryToken ? `“${queryToken}”` : '—'}
          </span>
        </p>
        <p className="blend-plain">
          {best
            ? `“${queryToken}” now points at “${best.token}” (${best.weight.toFixed(2)} of the budget).`
            : 'first token in the sequence — nothing cached behind it to read.'}
        </p>
        <TeachPair
          className="teach dim"
          show={real ? 'b' : 'a'}
          a="illustrative weights. Phase 1 scores come from a hand-tuned table for the default sentence and a recency-plus-noun heuristic otherwise; no model is running."
          b={`real weights, straight out of layer ${layer} head ${head} of distilgpt2’s own softmax. a real query reads its own row too, so that row is included and the weights still sum to 1.`}
        />
      </div>

      <figcaption>
        FIG.4 — One head&rsquo;s view of one lookup. Softmax forces the weights
        to a budget of 1.0.
      </figcaption>
    </figure>
  )
}
