/**
 * The head of an instrument: four lines, in descending order of loudness.
 *
 * A reader arriving at instrument C used to meet its name in the same small
 * tracked mono the page uses for every field label in every body, and nothing
 * in the head told him what he was looking at. The head now carries a real
 * heading hierarchy:
 *
 *   eyebrow   which instrument this is — a tag, not a sentence
 *   note      where these numbers came from — subordinate metadata, and in
 *             B, C, D and E also the command that fetches the real ones
 *   title     the instrument's name, in the display face, in ink
 *   purpose   one plain sentence saying what the reader is about to see
 *
 * The eyebrow and the note share the top row, the way a drawing's title block
 * puts the sheet number opposite its revision. Everything the reader is meant
 * to read sits below them at full strength.
 *
 * The DOM order is eyebrow, title, purpose, note — the order a screen reader
 * should hear them. Grid areas lift the note back up to the top row. Nothing
 * else in the head is focusable, so tab order is unaffected.
 *
 * `stacked` gives the note a row of its own at every width. Instrument E's
 * note names the file, its size and its command in one sentence and has never
 * fitted beside anything; below 780px every instrument stacks anyway.
 */
export default function InstrumentHead({
  eyebrow,
  title,
  purpose,
  note,
  stacked = false,
}) {
  return (
    <div className={stacked ? 'inst-head is-stacked' : 'inst-head'}>
      <span className="inst-eyebrow">{eyebrow}</span>
      <h3 className="inst-title">{title}</h3>
      <p className="inst-purpose">{purpose}</p>
      {note}
    </div>
  )
}
