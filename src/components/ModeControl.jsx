import { MODEL_ID } from '../lib/realModel.js'
import TeachPair from './TeachPair.jsx'

/**
 * The mode switch that governs all three instruments.
 *
 * Illustrative is the default and needs nothing; real needs an 83 MB download
 * first, so the "real" segment stays inert with its reason printed underneath
 * until the model is in hand. It is not a `disabled` button: it keeps its
 * place in the tab order so a keyboard reader can find it and read why it is
 * not available yet.
 *
 * Every row here has a fixed height. Loading, finishing, failing and toggling
 * all swap text inside boxes that were already reserved, so nothing on the
 * page moves.
 */

const PHASE_TEXT = {
  files: 'fetching the tokenizer',
  model: 'downloading distilgpt2',
  session: 'preparing distilgpt2',
}

export default function ModeControl({
  mode,
  onModeChange,
  status,
  progress,
  backend,
  error,
  onLoad,
}) {
  const loaded = status === 'ready'
  const loading = status === 'loading'
  const percent = Math.max(0, Math.min(100, Math.round(progress.percent || 0)))

  return (
    <div className="mode-bar">
      <div className="mode-row">
        <span className="field-label">mode</span>
        <div className="mode-seg" role="group" aria-label="weights mode">
          <button
            type="button"
            className={`mode-btn${mode === 'illustrative' ? ' is-on' : ''}`}
            aria-pressed={mode === 'illustrative'}
            onClick={() => onModeChange('illustrative')}
          >
            illustrative
          </button>
          <button
            type="button"
            className={`mode-btn${mode === 'real' ? ' is-on' : ''}${loaded ? '' : ' is-locked'}`}
            aria-pressed={mode === 'real'}
            aria-disabled={!loaded}
            title={loaded ? undefined : 'load the real model first'}
            onClick={() => {
              if (loaded) onModeChange('real')
            }}
          >
            real
          </button>
        </div>
        <span className="mode-state">
          {loaded ? `distilgpt2 · ${backend}` : 'no model loaded'}
        </span>
      </div>

      <div className="mode-row mode-load">
        {loading ? (
          <>
            <span className="mode-track" aria-hidden="true">
              <span className="mode-fill" style={{ width: `${percent}%` }} />
            </span>
            <span
              className="mode-progress"
              role="status"
              aria-live="polite"
            >
              {PHASE_TEXT[progress.phase] ?? PHASE_TEXT.model}
              {progress.phase === 'model' && percent > 0 ? ` — ${percent}%` : ''}
            </span>
          </>
        ) : (
          <>
            {!loaded && (
              <button type="button" className="btn" onClick={onLoad}>
                LOAD REAL MODEL (~90 MB)
              </button>
            )}
            <span className={`mode-hint${error ? ' is-error' : ''}`}>
              {error
                ? 'real model unavailable — showing illustrative weights'
                : loaded
                  ? `${MODEL_ID} is in the browser cache — switch freely`
                  : 'real mode needs the download; the browser caches it afterwards'}
            </span>
          </>
        )}
      </div>

      {/* The one place the real/fake seam is declared. It must never claim
          more than the page actually reads out of the model. */}
      <TeachPair
        className="mode-manifest"
        show={mode === 'real' ? 'b' : 'a'}
        a="everything here is illustrative — deterministic stand-ins, no model running."
        b="read from distilgpt2: bpe pieces and ids, embeddings, keys and values, next-token probabilities, generation, and attention for every layer and head. the rack drawing and its sweep are diagrams of the mechanism, not measurements."
      />

      <p className="mode-note">
        switching mode resets the sequence — bpe pieces and word tokens do not
        line up.
      </p>
    </div>
  )
}
