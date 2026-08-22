/**
 * The sentence the instrument is reading, said out loud.
 *
 * Instruments A, B, C and D all run on one piece of text — the one typed into
 * A — but A and its input box are two or three sections above B, C and D by
 * the time those are on screen, and nothing on the page said so. A reader who
 * types a new sentence and scrolls down has no way to know that what he is
 * looking at moved with him.
 *
 * One line, one fixed height, drawn whether or not there is anything in it,
 * so it can never move a pixel of what follows. Long text is truncated rather
 * than wrapped, for the same reason.
 */
export default function ReadingLine({ text }) {
  const trimmed = text.trim()
  return (
    <p className="inst-reading">
      {trimmed === '' ? (
        'reading: nothing yet — type a sentence into instrument A'
      ) : (
        <>
          reading: <b>&ldquo;{trimmed}&rdquo;</b>
        </>
      )}
    </p>
  )
}
