import { progressLabel } from '../lib/loadProgress.js'

/**
 * The right-hand side of an instrument head, in instruments B, C and D.
 *
 * The head has always reserved a line here to say which numbers are on
 * screen. While the model is still absent that same line is also the command
 * that fetches it, because a reader looking at illustrative numbers here is
 * exactly the reader who wants the real ones, and the one load button lives
 * three sections up where they cannot see it.
 *
 * Three states, one box: the button, the download's progress, and the plain
 * label once the model is in hand. They share the note's padding, border box
 * and line box, and the box's right edge is pinned by the head's
 * space-between, so moving between them moves nothing on the page.
 *
 * On failure this reverts to the plain label — the mode bar in instrument A
 * is the one place that says the download did not work.
 *
 * `action` is the wording of the command itself. Instruments B, C and D are
 * asking for real numbers instead of illustrative ones; instrument E already
 * has real numbers and is asking to read them again, live, so it says so.
 */
export default function LoadNote({
  label,
  status,
  progress,
  onLoad,
  action = 'load the real model',
}) {
  if (status === 'loading') {
    return <span className="inst-note is-loading">{progressLabel(progress)}</span>
  }
  if (status === 'idle') {
    return (
      <button type="button" className="inst-note" onClick={onLoad}>
        {label} &mdash; {action}
      </button>
    )
  }
  return <span className="inst-note">{label}</span>
}
