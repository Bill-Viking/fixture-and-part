import { useId } from 'react'
import { hashTokenToVector, formatVector } from '../lib/toyModel.js'
import InfoTag from '../components/InfoTag.jsx'

/**
 * Instrument A — tokenizer strip.
 * Splits whatever is typed into tokens and shows the deterministic
 * stand-in embedding for each one.
 */
export default function Tokenizer({ text, tokens, onTextChange }) {
  const inputId = useId()

  return (
    <figure className="instrument" aria-labelledby={`${inputId}-cap`}>
      <div className="inst-head">
        <span className="inst-title">INSTRUMENT A — TOKENIZER</span>
        <span className="inst-note">illustrative embeddings</span>
      </div>

      <div className="inst-body">
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
          <InfoTag topic="token" />
          <span className="label-gap" />
          <span className="field-label">embedding preview</span>
          <InfoTag topic="embedding" />
        </div>

        <div className="token-strip" role="list">
          {tokens.length === 0 && (
            <p className="empty-note">no tokens — type something above.</p>
          )}
          {tokens.map((token, i) => (
            <div className="token-pill" role="listitem" key={`${token}-${i}`}>
              <span className="token-idx">{i}</span>
              <span className="token-text">{token}</span>
              <span className="token-vec">
                {formatVector(hashTokenToVector(token, 6))}
              </span>
            </div>
          ))}
        </div>

        <p className="teach">one token &rarr; one vector.</p>
        <p className="teach dim">
          first 6 of thousands of dimensions. values are a stable hash of the
          token string, not learned weights.
        </p>
      </div>

      <figcaption id={`${inputId}-cap`}>
        FIG.1 — One forward pass begins here: text becomes vectors before any
        weight matrix touches it.
      </figcaption>
    </figure>
  )
}
