import {
  formatVector,
  hashTokenToVector,
  kVector,
  vVector,
} from '../lib/toyModel.js'
import { KV_LAYER, formatRealVector } from '../lib/realModel.js'
import InfoTag from './InfoTag.jsx'

/**
 * The K/V inspector — the detail panel under instrument B's rack.
 *
 * It answers "where do these numbers come from" for one racked chip: the
 * token's embedding x, the frozen die it is pressed through, the vector that
 * falls out, and what the rack then does with it. Its height is fixed at
 * every breakpoint whether it is empty or populated, so selecting, switching
 * and deselecting a chip never moves anything on the page.
 */

const DIES = [
  { role: 'q', label: 'W_q' },
  { role: 'k', label: 'W_k' },
  { role: 'v', label: 'W_v' },
]

const ROLES = {
  k: {
    die: 'W_k',
    outLabel: 'K vector — how this token advertises itself',
    outClass: 'kv-vec-k',
    vector: kVector,
    goes: 'racked as searchable metadata. every later token scores its Q against this row — the Q·K column in instrument C — and it never changes once racked.',
  },
  v: {
    die: 'W_v',
    outLabel: 'V vector — the payload this token hands over',
    outClass: 'kv-vec-v',
    vector: vVector,
    goes: 'staged as the payload, handed over weighted by softmax when a later lookup selects this row. the blend line in instrument C is made of these.',
  },
}

export default function KVInspector({ selection, real, vectors }) {
  const role = selection ? ROLES[selection.role] : null

  // In real mode the three stages are all distilgpt2's own numbers: the row
  // its embedding table holds for this id, and the key or value its layer-0
  // cache holds for this position. Six of 768 either way.
  const index = selection ? selection.index : -1
  const realEmbed = real ? (vectors?.embeddings?.[index] ?? null) : null
  const realOut = real ? (vectors?.[selection?.role]?.[index] ?? null) : null
  const showReal = real && realEmbed !== null && realOut !== null

  return (
    <section className="kv-inspector" aria-label="K/V inspector">
      <div className="kv-head">
        <span className="field-label">K/V inspector</span>
        <span className="kv-note">
          {!selection
            ? 'nothing selected'
            : showReal
              ? `real vectors · layer ${KV_LAYER} · first 6 of 768`
              : 'illustrative vectors'}
        </span>
      </div>

      <div className="kv-body" aria-live="polite">
        {!role && (
          <div className="kv-empty">
            <p className="empty-note">
              click a K or V chip in the rack to see where its numbers come
              from.
            </p>
          </div>
        )}

        {role && (
          <div className="kv-stack" key={`${selection.index}-${selection.role}`}>
            <div className="kv-pipe">
              <div className="kv-stage">
                <span className="kv-stage-label">
                  embedding &mdash; the token&rsquo;s vector, x
                </span>
                <span className="token-pill kv-pill">
                  <span className="token-idx">
                    {selection.index}
                    {showReal && vectors.ids[index] !== undefined && (
                      <span className="token-id"> &middot; id {vectors.ids[index]}</span>
                    )}
                  </span>
                  <span className="token-text">{selection.token}</span>
                  <span
                    className="token-vec"
                    title={showReal ? 'first 6 of 768 real dims' : 'illustrative vector'}
                  >
                    {showReal
                      ? formatRealVector(realEmbed)
                      : formatVector(hashTokenToVector(selection.token, 6))}
                  </span>
                </span>
              </div>

              <span className="kv-arrow" aria-hidden="true">
                &rarr;
              </span>

              <div className="kv-stage">
                <span className="kv-stage-label">
                  the die &mdash; frozen
                  <InfoTag topic="dies" />
                </span>
                <span className="kv-dies">
                  {DIES.map((die) => (
                    <span
                      className={`kv-die${die.role === selection.role ? ' is-on' : ' is-off'}`}
                      key={die.role}
                    >
                      {die.label}
                    </span>
                  ))}
                </span>
                <span className="kv-die-note">
                  {role.die} [frozen] &middot; same x, three dies
                </span>
              </div>

              <span className="kv-arrow" aria-hidden="true">
                &rarr;
              </span>

              <div className="kv-stage">
                <span className="kv-stage-label">{role.outLabel}</span>
                <span
                  className={`kv-vec ${role.outClass}`}
                  title={showReal ? 'first 6 of 768 real dims' : 'illustrative vector'}
                >
                  {showReal
                    ? formatRealVector(realOut)
                    : formatVector(role.vector(selection.token))}
                </span>
              </div>
            </div>

            <p className="kv-goes">{role.goes}</p>
            <p className="kv-prov">
              the dies W_q, W_k and W_v were machined once by gradient descent
              over the training corpus, and are bolted down &mdash; nothing here
              changes them.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
