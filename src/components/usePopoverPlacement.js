import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

/**
 * One placement law for every popover on the page.
 *
 * There are two of them now — the "?" badge's explanation and the claim
 * mark's note — and they are placed the same way for the same two reasons:
 * a fixed, portalled box cannot be clipped by an instrument's overflow box,
 * and it cannot move anything on the page when it opens or closes.
 *
 * The law: measured before paint, centred under the anchor, clamped to the
 * viewport with EDGE to spare, flipped above when there is no room below,
 * and re-placed on scroll (capture, so an instrument's own scroller counts)
 * and on resize.
 */
export const GAP = 8
export const EDGE = 8

/**
 * Where a popover of this width goes, given the anchor it hangs from and the
 * box itself (already rendered, so its height is a measurement rather than a
 * guess).
 */
export function placePopover(anchor, pop, maxWidth) {
  const r = anchor.getBoundingClientRect()
  const width = Math.min(maxWidth, window.innerWidth - EDGE * 2)
  const left = Math.max(
    EDGE,
    Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - EDGE),
  )
  const height = pop.offsetHeight
  let top = r.bottom + GAP
  if (top + height > window.innerHeight - EDGE) {
    const above = r.top - GAP - height
    top = above >= EDGE ? above : Math.max(EDGE, window.innerHeight - height - EDGE)
  }
  return { top, left, width }
}

/**
 * `openKey` is falsy when nothing is open and changes when the anchor
 * changes, which is what re-places the box when one mark is opened while
 * another is: the note's contents are new, so its height is new too.
 *
 * `anchorRef.current` may be a React-owned node (the badge) or a static one
 * in the prose (a claim mark). The hook only ever reads it, so it does not
 * care which.
 */
export function usePopoverPlacement(openKey, anchorRef, popRef, maxWidth) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: maxWidth })

  const place = useCallback(() => {
    const anchor = anchorRef.current
    const pop = popRef.current
    if (!anchor || !pop) return
    setPos(placePopover(anchor, pop, maxWidth))
  }, [anchorRef, popRef, maxWidth])

  // Measured and placed before paint, so the popover never appears misplaced.
  useLayoutEffect(() => {
    if (openKey) place()
  }, [openKey, place])

  useEffect(() => {
    if (!openKey) return undefined
    const reposition = () => place()
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [openKey, place])

  return pos
}
