import { useId } from 'react'
import { hashTokenToVector, formatVector } from '../lib/toyModel.js'
import { formatRealVector, realEmbedding } from '../lib/realModel.js'
import InfoTag from '../components/InfoTag.jsx'
import TeachPair from '../components/TeachPair.jsx'
import InstrumentHead from '../components/InstrumentHead.jsx'

/** A BPE piece prints its leading-space marker dim, so the split reads. */
function TokenText({ token }) {
  if (!token.startsWith('␣')) return <span className="token-text">{token}</span>
  return (
    <span className="token-text">
      <span className="tok-space">␣</span>
      {token.slice(1)}
    </span>
  )
}

/**
 * Instrument A — tokenizer strip.
 * Splits whatever is typed into tokens and shows the deterministic
 * stand-in embedding for each one. It also carries the mode switch, which
 * governs all three instruments.
 */
export default function Tokenizer({
  text,
  tokens,
  real,
  realIds,
  onTextChange,
  control,
}) {
  const inputId = useId()

  // In real mode both halves of a pill are the model's own: the BPE id it
  // reads, and the first six numbers of the row that id selects out of its
  // embedding table.
  const vectorFor = (token, i) => {
    if (!real) return formatVector(hashTokenToVector(token, 6))
    const id = realIds?.[i]
    const row = id === undefined ? null : realEmbedding(id)
    return row ? formatRealVector(row) : '—'
  }

  return (
    <figure className="instrument" aria-labelledby={`${inputId}-cap`}>
      <InstrumentHead
        eyebrow="INSTRUMENT A"
        title="The tokenizer"
        purpose="How your sentence becomes token ids, and the vector each token starts with."
        note={
          <span className="inst-note">
            <TeachPair
              as="span"
              wrapAs="span"
              show={real ? 'b' : 'a'}
              a="illustrative embeddings"
              b="real bpe pieces, ids and embeddings"
            />
          </span>
        }
      />

      <div className="inst-body">
        {control}

        <label className="field-label" htmlFor={inputId}>
          input text
        </label>
        <input
          id={inputId}
          className="text-input"
          type="text"
          value={text}
          spellCheck="false"
          autoComplete="off"
          onChange={(e) => onTextChange(e.target.value)}
        />

        <div className="label-row">
          <span className="field-label">tokens</span>
          <InfoTag topic={real ? 'tokenReal' : 'token'} />
          <span className="label-gap" />
          <TeachPair
            as="span"
            className="field-label"
            show={real ? 'b' : 'a'}
            a="embedding preview"
            b="embedding — first 6 of 768 dims"
          />
          <InfoTag topic={real ? 'embeddingReal' : 'embedding'} />
        </div>

        <div className="token-strip" role="list">
          {tokens.length === 0 && (
            <p className="empty-note">no tokens — type something above.</p>
          )}
          {tokens.map((token, i) => (
            <div className="token-pill" role="listitem" key={`${token}-${i}`}>
              <span className="token-idx">
                {i}
                {real && realIds?.[i] !== undefined && (
                  <span className="token-id"> &middot; id {realIds[i]}</span>
                )}
              </span>
              <TokenText token={token} />
              <span className="token-vec">{vectorFor(token, i)}</span>
            </div>
          ))}
        </div>

        <p className="teach">one token &rarr; one vector.</p>
        <TeachPair
          className="teach dim"
          show={real ? 'b' : 'a'}
          a="first 6 of thousands of dimensions. values are a stable hash of the token string, not learned weights."
          b="real gpt-2 bpe pieces. ␣ marks a leading space, so a piece without one continues the word before it. the numbers are the first 6 of the 768 distilgpt2 keeps for that id."
        />
      </div>

      <figcaption id={`${inputId}-cap`}>
        FIG.2 — One forward pass begins here: text becomes vectors before any
        weight matrix touches it.
      </figcaption>
    </figure>
  )
}
