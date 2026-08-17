import { memo, useEffect, useRef, useState } from 'react'
import { LAYERS } from '../lib/toyModel.js'
import InfoTag from '../components/InfoTag.jsx'
import KVInspector from '../components/KVInspector.jsx'

const RUN_INTERVAL_MS = 800

/**
 * One racked token. Memoised and keyed by position: a mounted row re-renders
 * only when the reader selects one of its own chips, never when a later row
 * is appended, which is the append-only lesson made literal.
 */
const RackRow = memo(function RackRow({ index, token, selectedRole, onSelect }) {
  return (
    <li className="rack-row">
      <span className="rack-idx">{String(index).padStart(2, '0')}</span>
      <span className="rack-bolt" aria-hidden="true">
        &#9679;
      </span>
      <span className="rack-token">{token}</span>
      <button
        type="button"
        className={`chip chip-k chip-btn${selectedRole === 'k' ? ' is-sel' : ''}`}
        aria-pressed={selectedRole === 'k'}
        aria-label={`inspect the key of token ${index}, ${token}`}
        onClick={() => onSelect(index, 'k')}
      >
        K
      </button>
      <button
        type="button"
        className={`chip chip-v chip-btn${selectedRole === 'v' ? ' is-sel' : ''}`}
        aria-pressed={selectedRole === 'v'}
        aria-label={`inspect the value of token ${index}, ${token}`}
        onClick={() => onSelect(index, 'v')}
      >
        V
      </button>
    </li>
  )
})

/**
 * The shortlist for the coming STEP. Fixed height whether it is full or empty,
 * so pressing STEP never moves anything below it.
 */
function Candidates({ candidates, scripted, stepTick, hasInput }) {
  return (
    <div className="candidates" role="group" aria-label="candidate next tokens">
      <div className="cand-head">
        <span className="field-label">considering next</span>
        <InfoTag topic="candidates" />
        <span className="cand-note">
          {scripted ? 'scripted · illustrative' : 'illustrative'}
        </span>
      </div>
      <div className="cand-list" key={stepTick}>
        {candidates.length === 0 && (
          <p className="empty-note">
            {hasInput
              ? 'generation cap reached — RESET to run it again.'
              : 'no input — type something into instrument A.'}
          </p>
        )}
        {candidates.map((c) => (
          <div
            className={`cand${c.wins ? ' is-winner' : ''}`}
            key={c.token}
            title={`illustrative score ${c.score.toFixed(2)}`}
          >
            <span className="cand-word">{c.token}</span>
            <span className="cand-track">
              <span
                className="cand-fill"
                style={{ width: `${c.weight * 100}%` }}
              />
            </span>
            <span className="cand-wt">{c.weight.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Instrument B — forward-pass stepper and KV rack.
 */
export default function Stepper({
  baseTokens,
  sequence,
  stepTick,
  canStep,
  candidates,
  scriptedNext,
  kvSelection,
  onKvSelect,
  onStep,
  onReset,
}) {
  const [running, setRunning] = useState(false)
  const rackRef = useRef(null)

  // Keep the newest row in view. The rack scrolls inside its own fixed box,
  // so this never moves anything else on the page.
  useEffect(() => {
    const node = rackRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [sequence.length])

  useEffect(() => {
    if (!running) return undefined
    if (!canStep) {
      setRunning(false)
      return undefined
    }
    const id = setInterval(onStep, RUN_INTERVAL_MS)
    return () => clearInterval(id)
  }, [running, canStep, onStep])

  const handleReset = () => {
    setRunning(false)
    onReset()
  }

  const generatedCount = sequence.length - baseTokens.length

  // The selected chip carries its own token, so the inspector never has to
  // reach back into the sequence. A selection pointing past the end of the
  // sequence reads as nothing selected.
  const selectedToken =
    kvSelection == null ? undefined : sequence[kvSelection.index]
  const selection =
    selectedToken === undefined
      ? null
      : { ...kvSelection, token: selectedToken }

  return (
    <figure className="instrument">
      <div className="inst-head">
        <span className="inst-title">INSTRUMENT B — FORWARD PASS &amp; KV RACK</span>
        <span className="inst-note">illustrative continuation</span>
      </div>

      <div className="inst-body">
        <div className="controls">
          <button
            type="button"
            className="btn"
            onClick={onStep}
            disabled={!canStep}
          >
            STEP
          </button>
          <button
            type="button"
            className={`btn${running ? ' btn-on' : ''}`}
            onClick={() => setRunning((r) => !r)}
            disabled={!canStep && !running}
            aria-pressed={running}
          >
            {running ? 'PAUSE' : 'RUN'}
          </button>
          <button type="button" className="btn" onClick={handleReset}>
            RESET
          </button>
          <span className="controls-note">
            {generatedCount === 0
              ? 'no tokens generated yet'
              : `${generatedCount} token${generatedCount === 1 ? '' : 's'} generated`}
          </span>
        </div>

        <Candidates
          candidates={candidates}
          scripted={scriptedNext}
          stepTick={stepTick}
          hasInput={baseTokens.length > 0}
        />

        <div className="stepper-panes">
          <div className="pane">
            <div className="pane-head">
              <span>SEQUENCE SO FAR</span>
            </div>
            <div className="pane-box seq-box">
              {sequence.map((token, i) => (
                <span
                  className={`seq-token${i === sequence.length - 1 ? ' newest' : ''}`}
                  key={`${i}-${token}`}
                >
                  {token}
                </span>
              ))}
            </div>
          </div>

          <div className="pane">
            <div className="pane-head">
              <span>KV RACK</span>
              <span className="chip-legend">
                <span className="chip chip-k">K</span>
                <InfoTag topic="key" />
                <span className="chip chip-v">V</span>
                <InfoTag topic="value" />
              </span>
            </div>
            <div className="pane-box rack-box">
              {stepTick > 0 && <span className="sweep" key={stepTick} />}
              <ul className="rack-list" ref={rackRef}>
                {sequence.map((token, i) => (
                  <RackRow
                    key={i}
                    index={i}
                    token={token}
                    selectedRole={
                      kvSelection && kvSelection.index === i
                        ? kvSelection.role
                        : null
                    }
                    onSelect={onKvSelect}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="counter">
          cache entries: {sequence.length} &times; {LAYERS} layers
          <InfoTag topic="cache" />
        </p>

        <KVInspector selection={selection} />

        <p className="teach dim">
          every new token scans the whole rack. racked rows are byte-identical
          before and after — nothing above the newest row ever changes.
        </p>
      </div>

      <figcaption>
        FIG.2 — Each STEP appends exactly one row. The sweep is the new
        token&rsquo;s query reading every entry already staged.
      </figcaption>
    </figure>
  )
}
