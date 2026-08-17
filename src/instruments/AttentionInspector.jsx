import { useMemo } from 'react'
import {
  attention,
  isHandTuned,
  kDescriptor,
  topRow,
} from '../lib/toyModel.js'
import InfoTag from '../components/InfoTag.jsx'

/**
 * Instrument C — attention inspector.
 * Reads the live sequence from Instrument B, enforces the causal mask, and
 * spends one fixed 1.0 budget of softmax weight across the prior tokens.
 */
export default function AttentionInspector({ sequence, queryIndex, onQueryChange }) {
  const rows = useMemo(
    () => attention(sequence, queryIndex),
    [sequence, queryIndex],
  )
  const best = useMemo(() => topRow(rows), [rows])
  const tuned = isHandTuned(sequence, queryIndex)
  const queryToken = sequence[queryIndex]

  return (
    <figure className="instrument">
      <div className="inst-head">
        <span className="inst-title">INSTRUMENT C — ATTENTION INSPECTOR</span>
        <span className="inst-note">
          {tuned ? 'illustrative weights — hand-tuned' : 'illustrative weights — heuristic'}
        </span>
      </div>

      <div className="inst-body">
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
          <span className="field-label">
            lookup — rows from the query on are locked
          </span>
          <InfoTag topic="mask" />
        </div>

        <div className="attn-table" role="table" aria-label="attention lookup">
          <div className="attn-row attn-head" role="row">
            <span className="c-tok" role="columnheader">token</span>
            <span className="c-k" role="columnheader">K descriptor</span>
            <span className="c-score" role="columnheader">Q&middot;K</span>
            <span className="c-bar" role="columnheader">softmax weight</span>
            <span className="c-v" role="columnheader">V</span>
          </div>

          {sequence.map((token, i) => {
            if (i < queryIndex) {
              const row = rows[i]
              return (
                <div className="attn-row" role="row" key={`${i}-${token}`}>
                  <span className="c-tok" role="cell">{token}</span>
                  <span className="c-k" role="cell">{row.k}</span>
                  <span className="c-score" role="cell">
                    {row.score.toFixed(2)}
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
                  {isSelf ? 'querying token' : kDescriptor(token)}
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
        <p className="teach dim">
          illustrative weights. Phase 1 scores come from a hand-tuned table for
          the default sentence and a recency-plus-noun heuristic otherwise; no
          model is running.
        </p>
      </div>

      <figcaption>
        FIG.3 — One head&rsquo;s view of one lookup. Softmax forces the weights
        to a budget of 1.0.
      </figcaption>
    </figure>
  )
}
