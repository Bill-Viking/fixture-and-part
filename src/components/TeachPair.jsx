/**
 * Two wordings of the same teaching line, stacked in one grid cell: the one
 * for the current mode is visible, the other is laid out and hidden.
 *
 * The box is therefore always as tall as the taller of the two, at every
 * width and whatever the font does, so switching mode swaps the words without
 * moving anything on the page — and no magic pixel height has to be kept in
 * step with the copy.
 *
 * It reserves width the same way, which is why instrument A's head note uses
 * it: `wrapAs="span"` keeps the pair legal inside the note's own span.
 */
export default function TeachPair({
  as: Tag = 'p',
  wrapAs: Wrap = 'div',
  className = '',
  a,
  b,
  show,
}) {
  const first = show !== 'b'
  return (
    <Wrap className="teach-pair">
      <Tag className={`${className}${first ? '' : ' is-ghost'}`} aria-hidden={!first}>
        {a}
      </Tag>
      <Tag className={`${className}${first ? ' is-ghost' : ''}`} aria-hidden={first}>
        {b}
      </Tag>
    </Wrap>
  )
}
