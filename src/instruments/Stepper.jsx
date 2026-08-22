import { memo, useEffect, useRef, useState } from 'react'
import { LAYERS } from '../lib/toyModel.js'
import { DECODING } from '../lib/realModel.js'
import InfoTag from '../components/InfoTag.jsx'
import KVInspector from '../components/KVInspector.jsx'
import LoadNote from '../components/LoadNote.jsx'
import ReadingLine from '../components/ReadingLine.jsx'
import TeachPair from '../components/TeachPair.jsx'
import InstrumentHead from '../components/InstrumentHead.jsx'

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
 * The two decoding rules, as a segmented control the size of the mode switch
 * three sections up.
 *
 * Illustrative mode shows it locked. Sampling means drawing from a
 * distribution, and the illustrative distribution is four hand-tuned numbers
 * written to make a teaching point — drawing from those would be theatre
 * dressed as a mechanism, so that mode takes the top token and says so.
 */
function DecodeControl({ real, decode, onDecodeChange }) {
  const locked = !real
  const reason = 'the illustrative numbers are hand-tuned, so this mode takes the top token'
  const seg = (value, label) => (
    <button
      type="button"
      className={
        `mode-btn${decode === value ? ' is-on' : ''}` +
        (locked && decode !== value ? ' is-locked' : '')
      }
      aria-pressed={decode === value}
      aria-disabled={locked}
      title={locked ? reason : undefined}
      onClick={() => {
        if (!locked) onDecodeChange(value)
      }}
    >
      {label}
    </button>
  )
  return (
    <div className="mode-row decode-row">
      <span className="field-label">decoding</span>
      <div
        className={`mode-seg${locked ? ' is-fixed' : ''}`}
        role="group"
        aria-label="decoding rule"
      >
        {seg('sampled', 'sampled')}
        {seg('greedy', 'greedy')}
      </div>
      <InfoTag topic={real ? 'decodingReal' : 'decoding'} />
      <span className="mode-state">
        {real
          ? decode === 'sampled'
            ? `real distilgpt2 · sampled · temp ${DECODING.temperature} · ` +
              `top-k ${DECODING.topK} · seed ${DECODING.seed}`
            : 'real distilgpt2 · greedy'
          : 'illustrative · greedy on the toy numbers'}
      </span>
    </div>
  )
}

/**
 * What the coming STEP is about to do, in one reserved line: whether it took
 * the top token or drew a different one, and at what cost in probability.
 */
function choiceLine({ real, decode, pick, pending, hasRows }) {
  if (pending) return null
  if (!real) {
    return hasRows ? { text: 'takes the top token — illustrative', token: null } : null
  }
  if (!pick) return null
  if (decode !== 'sampled' || !pick.sampled) {
    return { text: `takes the top token — ${decode}`, token: null }
  }
  if (pick.top && pick.id !== pick.top.id) {
    return {
      text: null,
      token: pick.token,
      chose: pick.weight,
      over: pick.top.token,
      overWeight: pick.top.weight,
    }
  }
  return { text: 'takes the top token — sampled', token: null }
}

/**
 * The shortlist for the coming STEP. Fixed height whether it is full or empty,
 * so pressing STEP never moves anything below it.
 */
function Candidates({
  candidates,
  scripted,
  stepTick,
  hasInput,
  real,
  pending,
  decode,
  pick,
}) {
  const choice = choiceLine({
    real,
    decode,
    pick,
    pending,
    hasRows: candidates.length > 0,
  })
  return (
    <div className="candidates" role="group" aria-label="candidate next tokens">
      <div className="cand-head">
        <span className="field-label">considering next</span>
        <InfoTag topic={real ? 'candidatesReal' : 'candidates'} />
        <span className="cand-note">
          {real
            ? `distilgpt2 · ${decode} · whitespace skipped`
            : scripted
              ? 'scripted · illustrative'
              : 'illustrative'}
        </span>
      </div>
      <div className="cand-list" key={stepTick}>
        {pending && <p className="empty-note">running distilgpt2&hellip;</p>}
        {!pending && candidates.length === 0 && (
          <p className="empty-note">
            {hasInput
              ? 'generation cap reached — RESET to run it again.'
              : 'no input — type something into instrument A.'}
          </p>
        )}
        {!pending &&
          candidates.map((c) => (
            <div
              className={`cand${c.wins ? ' is-winner' : ''}`}
              key={`${c.id ?? ''}-${c.token}`}
              title={
                real
                  ? `logit ${c.score.toFixed(2)} · probability ${c.weight.toFixed(4)}`
                  : `illustrative score ${c.score.toFixed(2)}`
              }
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
      <p className="cand-choice">
        {choice == null ? (
          ''
        ) : choice.text ? (
          choice.text
        ) : (
          <>
            chose <b>{choice.token}</b> ({choice.chose.toFixed(2)}) over{' '}
            <b>{choice.over}</b> ({choice.overWeight.toFixed(2)}) &mdash; sampled
          </>
        )}
      </p>
    </div>
  )
}

/**
 * Instrument B — forward-pass stepper and KV rack.
 */
export default function Stepper({
  text,
  baseTokens,
  sequence,
  stepTick,
  canStep,
  candidates,
  scriptedNext,
  decode,
  onDecodeChange,
  pick,
  kvSelection,
  real,
  vectors,
  pending,
  modelStatus,
  progress,
  onLoad,
  onKvSelect,
  onStep,
  onReset,
}) {
  const [running, setRunning] = useState(false)
  const rackRef = useRef(null)
  // When the last token was committed, so the loop can hold the cadence
  // steady regardless of how long the model took to answer.
  const lastCommitRef = useRef(0)

  // Keep the newest row in view. The rack scrolls inside its own fixed box,
  // so this never moves anything else on the page.
  useEffect(() => {
    const node = rackRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [sequence.length])

  /**
   * RUN, in both modes.
   *
   * A plain interval works when a step is instant, but in real mode each step
   * waits on a forward pass, and firing on a fixed beat would either overlap
   * runs or stall the loop the moment a step was not ready. So the loop is a
   * chain instead: while a pass is in flight it schedules nothing and simply
   * waits to be re-run when `pending` clears, then it times the next commit
   * from the previous one. Inference that takes 300 ms is followed by 500 ms
   * of pause; inference that takes longer than the target commits as soon as
   * it lands. The reader gets one token roughly every RUN_INTERVAL_MS either
   * way.
   *
   * Pausing clears the pending timeout, and the commit only ever happens
   * inside that timeout, so a pass that resolves after PAUSE cannot append a
   * token behind the reader's back. RESET does the same by way of
   * `handleReset`.
   */
  useEffect(() => {
    if (!running) return undefined
    if (pending) return undefined
    if (!canStep) {
      setRunning(false)
      return undefined
    }
    const wait = Math.max(0, RUN_INTERVAL_MS - (Date.now() - lastCommitRef.current))
    const id = setTimeout(() => {
      lastCommitRef.current = Date.now()
      onStep()
    }, wait)
    return () => clearTimeout(id)
  }, [running, pending, canStep, onStep, stepTick])

  const handleRun = () => {
    setRunning((wasRunning) => {
      // Starting: hold the first token back by one full beat, the way the
      // interval used to, rather than firing it on the click.
      if (!wasRunning) lastCommitRef.current = Date.now()
      return !wasRunning
    })
  }

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
      <InstrumentHead
        eyebrow="INSTRUMENT B"
        title="The forward pass and the KV rack"
        purpose="One step at a time: the shortlist for the next token, the sequence so far, and the K/V rack it reads from."
        note={
          <LoadNote
            label={
              real ? (
                // The note's right edge is pinned by the head, so a wording
                // that changes length here walks every glyph in the line
                // sideways. Both wordings share one grid cell — the same
                // trick instrument A's note uses — so the cell is always as
                // wide as the wider of the two.
                <TeachPair
                  as="span"
                  wrapAs="span"
                  show={decode === 'sampled' ? 'a' : 'b'}
                  a="real distilgpt2 continuation · sampled, whitespace skipped"
                  b="real distilgpt2 continuation · greedy, whitespace skipped"
                />
              ) : (
                'illustrative continuation'
              )
            }
            status={modelStatus}
            progress={progress}
            onLoad={onLoad}
          />
        }
      />

      <div className="inst-body">
        <ReadingLine text={text} />

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
            onClick={handleRun}
            disabled={!canStep && !running && !pending}
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

        <DecodeControl
          real={real}
          decode={decode}
          onDecodeChange={onDecodeChange}
        />

        <Candidates
          candidates={candidates}
          scripted={scriptedNext}
          stepTick={stepTick}
          hasInput={baseTokens.length > 0}
          real={real}
          pending={pending}
          decode={decode}
          pick={pick}
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
            <div className="pane-box rack-box screen">
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
          cache entries: <span className="counter-n">{sequence.length}</span>{' '}
          &times; {LAYERS} layers
          <InfoTag topic="cache" />
        </p>

        <KVInspector selection={selection} real={real} vectors={vectors} />

        <TeachPair
          className="teach dim"
          show={real ? 'b' : 'a'}
          a="every new token scans the whole rack. racked rows are byte-identical before and after — nothing above the newest row ever changes."
          b="every new token scans the whole rack, and racked rows never change. greedy STEP takes the top token every time, which is how a six-block model talks itself into a loop; sampled STEP draws instead, and charges the tokens it has already used."
        />
      </div>

      <figcaption>
        FIG.4 — Each STEP appends exactly one row. The sweep is the new
        token&rsquo;s query reading every entry already staged.
      </figcaption>
    </figure>
  )
}
