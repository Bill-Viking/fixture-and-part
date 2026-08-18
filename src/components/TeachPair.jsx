/**
 * Two wordings of the same teaching line, stacked in one grid cell: the one
 * for the current mode is visible, the other is laid out and hidden.
 *
 * The box is therefore always as tall as the taller of the two, at every
 * width and whatever the font does, so switching mode swaps the words without
 * moving anything on the page — and no magic pixel height has to be kept in
 * step with the copy.
 */
export default function TeachPair({ as: Tag = 'p', className = '', a, b, show }) {
  const first = show !== 'b'
  return (
    <div className="teach-pair">
      <Tag className={`${className}${first ? '' : ' is-ghost'}`} aria-hidden={!first}>
        {a}
      </Tag>
      <Tag className={`${className}${first ? ' is-ghost' : ''}`} aria-hidden={first}>
        {b}
      </Tag>
    </div>
  )
}
