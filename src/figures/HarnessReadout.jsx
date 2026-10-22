import harnessFacts from '../content/harnessFacts.json'

/**
 * SPECIMEN — THE HARNESS, measured: the readout under section 10's specimen
 * callout. A readout, not an instrument: nothing in it runs, nothing in it is
 * focusable, nothing in it moves.
 *
 * Every number is read at build time by scripts/read-harness.mjs and written
 * to src/content/harnessFacts.json; nothing here is typed. A row the script
 * could not read is null there and prints "not read at build" here, with the
 * row's own label and nothing after it, rather than a guess.
 *
 * Every word is WORDS §3 of design/the-readers-footing, verbatim. Each row's
 * text is the WORDS line character for character, the label padded to the
 * same 24-character column with the same spaces and three spaces before a
 * note, and the stylesheet keeps those spaces where the row is one line
 * (760 px and up). Narrower, the same elements fold: the spaces are hidden,
 * the label, the value and the note each take a line, and the breaks inside a
 * value fall only where a " · " does and the stylesheet says so — so the
 * readout's height is a count of lines fixed by the breakpoint, never by a
 * font or a number's width.
 */

const LABEL_COLUMN = 24
const GAP = '   '
const NOT_READ = 'not read at build'

const number = new Intl.NumberFormat('en-US')
const n = (value) => number.format(value)

/**
 * The six rows. `value` returns the reading as its " · "-separated pieces, or
 * null when the script could not read it; `fold` is the piece that starts a
 * line of its own where the readout is narrower than 760 px, and `foldNarrow`
 * one more that does so under 350 px.
 */
const ROWS = [
  {
    label: 'the model file',
    value: (f) => (f.modelBytes == null ? null : [`${n(f.modelBytes)} bytes`]),
    note: 'changed by use: 0',
  },
  {
    label: 'the status file',
    value: (f) => f.status && [`${n(f.status.bytes)} bytes`, `${n(f.status.lines)} lines`],
    note: 'read at every wake, written all day',
  },
  {
    label: 'the opener',
    value: (f) => f.opener && [`${n(f.opener.bytes)} bytes`],
    note: 'written at every close, read once',
  },
  {
    label: 'the memory folder',
    value: (f) => f.memory && [`${n(f.memory.files)} files`, `${n(f.memory.kb)} KB`],
    note: 'read at every wake',
  },
  {
    label: 'commits on this page',
    value: (f) =>
      f.commits && [
        n(f.commits.total),
        `${n(f.commits.dayBefore)} the day before this reading`,
        `${n(f.commits.day)} on the day`,
      ],
    note: null,
    fold: 2,
    foldNarrow: 1,
  },
  {
    label: 'carried inside the model between sittings',
    value: (f) => [`${n(f.carriedInsideModel)} bytes`],
    note: null,
  },
]

/** The spaces after a label: to the 24th column, or three when it runs past. */
const padAfter = (label) =>
  label.length < LABEL_COLUMN ? ' '.repeat(LABEL_COLUMN - label.length) : GAP

/**
 * A reading's pieces, each held together, the " ·" that follows a piece kept
 * with it so that a fold never starts a line on a dot.
 */
function Pieces({ pieces, fold, foldNarrow }) {
  const classOf = (i) =>
    i === fold ? 'hr-piece is-fold' : i === foldNarrow ? 'hr-piece is-fold-narrow' : 'hr-piece'
  return pieces.map((piece, i) => (
    <span className={classOf(i)} key={i}>
      {i < pieces.length - 1 ? `${piece} ·` : piece}
      {i < pieces.length - 1 ? ' ' : null}
    </span>
  ))
}

export default function HarnessReadout({ facts = harnessFacts }) {
  return (
    <div className="harness-readout">
      <p className="hr-title">
        <span className="hr-title-head">THE HARNESS, READ ON {facts.readAt}</span>{' '}
        <span className="hr-title-tail">FROM THIS REPOSITORY</span>
      </p>
      <dl className="hr-rows">
        {ROWS.map((row) => {
          const pieces = row.value(facts)
          return (
            <div className="hr-row" key={row.label}>
              <dt>
                <span className="hr-label">{row.label}</span>
                <span className="hr-pad">{padAfter(row.label)}</span>
              </dt>
              <dd>
                {pieces ? (
                  <span className="hr-value">
                    <Pieces pieces={pieces} fold={row.fold} foldNarrow={row.foldNarrow} />
                  </span>
                ) : (
                  <span className="hr-value is-unread">{NOT_READ}</span>
                )}
                {pieces && row.note ? (
                  <>
                    <span className="hr-pad">{GAP}</span>
                    <span className="hr-note">{row.note}</span>
                  </>
                ) : null}
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
