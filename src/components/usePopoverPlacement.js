import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * One placement law for every popover on the page.
 *
 * There are two of them now — the "?" badge's explanation and the claim
 * mark's note — and both are portalled to <body> and measured the same way,
 * for the same two reasons: a portalled box cannot be clipped by an
 * instrument's overflow box, and it cannot move anything on the page when it
 * opens or closes.
 *
 * The law decides against the VIEWPORT, always: measured before paint,
 * centred under the anchor, clamped to the viewport with EDGE to spare,
 * flipped above when there is no room below.
 *
 * What differs is what the box does afterwards, and that is the `follow`
 * option:
 *
 * - `follow: true` (the default, and what the "?" badge does) — the box is
 *   `position:fixed` and stays put in the viewport while the page scrolls
 *   under it, so it is re-placed on every scroll (capture, so an
 *   instrument's own scroller counts) and on resize.
 *
 * - `follow: false` (the claim note) — the box is `position:absolute` in
 *   DOCUMENT coordinates, so it scrolls away with the sentence it belongs
 *   to, like any other content. The law decides once, at open, and the
 *   answer is converted to page coordinates; there is no scroll listener at
 *   all. A reader who opens a note and then scrolls is not followed by a
 *   box, and a box that does not move cannot be scored as a layout shift —
 *   the chase was worth 0.528663 at 390 and 0.105526 at 1280 on a long
 *   programmatic jump, measured with a note open.
 *
 *   The one thing that may move it afterwards is the page moving under it:
 *   a resize, and the reflow the resize starts. Then it is not re-decided,
 *   only carried — the same distance from its own anchor, wherever the
 *   anchor went.
 */
export const GAP = 8
export const EDGE = 8

/**
 * Where a popover of this width goes IN THE VIEWPORT, given the anchor it
 * hangs from and the box itself (already rendered, so its height is a
 * measurement rather than a guess).
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
 * The same decision, written down where the document can keep it: the
 * viewport placement above, plus the scroll offset at the moment it was
 * made. An absolutely positioned box in <body> hangs off the initial
 * containing block — body is static and untransformed — so page coordinates
 * are exactly viewport coordinates plus the scroll.
 *
 * It also returns `hold`: how far the law put the box below the anchor's
 * bottom edge. That number is the ANCHORING, and it is what a re-place uses
 * (see below), so the box keeps the relationship it was given rather than
 * being re-decided against a viewport the reader has since left.
 */
export function placePopoverInPage(anchor, pop, maxWidth) {
  const at = placePopover(anchor, pop, maxWidth)
  return {
    top: at.top + window.scrollY,
    left: at.left + window.scrollX,
    width: at.width,
    hold: at.top - anchor.getBoundingClientRect().bottom,
  }
}

/**
 * A re-place, for when the page reflows under an open box: the same distance
 * from the anchor it was given at open, wherever the anchor has gone, and the
 * horizontal half of the law re-run because the viewport's width is the one
 * thing that genuinely changed.
 *
 * Running the WHOLE law here would be wrong, and measurably so: a narrower
 * window reflows the prose, the mark moves hundreds of pixels down the page,
 * and the law — which asks where the anchor is IN THE VIEWPORT — would clamp
 * the box to the viewport's edge, leaving it floating over a paragraph it has
 * nothing to do with. The box belongs to its sentence, not to the window.
 */
export function rePlacePopoverInPage(anchor, pop, maxWidth, hold) {
  const at = placePopover(anchor, pop, maxWidth)
  const r = anchor.getBoundingClientRect()
  return {
    top: r.bottom + hold + window.scrollY,
    left: at.left + window.scrollX,
    width: at.width,
    hold,
  }
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
export function usePopoverPlacement(
  openKey,
  anchorRef,
  popRef,
  maxWidth,
  { follow = true } = {},
) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: maxWidth })
  // Page mode only: how far below the anchor the law put the box when it
  // opened. Null until it has opened once.
  const holdRef = useRef(null)

  const place = useCallback(
    (again) => {
      const anchor = anchorRef.current
      const pop = popRef.current
      if (!anchor || !pop) return
      if (follow) {
        setPos(placePopover(anchor, pop, maxWidth))
        return
      }
      const at =
        again && holdRef.current !== null
          ? rePlacePopoverInPage(anchor, pop, maxWidth, holdRef.current)
          : placePopoverInPage(anchor, pop, maxWidth)
      holdRef.current = at.hold
      setPos({ top: at.top, left: at.left, width: at.width })
    },
    [anchorRef, popRef, maxWidth, follow],
  )

  // Measured and placed before paint, so the popover never appears misplaced.
  // A new anchor is a new decision, so the hold is forgotten here.
  useLayoutEffect(() => {
    if (!openKey) return
    holdRef.current = null
    place(false)
  }, [openKey, place])

  useEffect(() => {
    if (!openKey) return undefined
    const reposition = () => place(true)
    // Only a box that lives in the viewport has anything to say about a
    // scroll. The page-anchored one is already where it belongs.
    if (follow) window.addEventListener('scroll', reposition, true)
    // Both care about a resize: the width, the clamp and the flip are all
    // decided against a viewport that just changed size.
    window.addEventListener('resize', reposition)
    // And the page-anchored one cares about the reflow the resize STARTS,
    // which is not the same event. Measured on this page: narrowing the
    // window to 700 px fires resize while the prose is still moving — the
    // mark is at 16,655 px then and settles at 17,111 px, with no second
    // resize event to say so. The observer sees the body finish changing
    // size and the note goes back under its own sentence.
    let ro = null
    if (!follow && typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(() => place(true))
      ro.observe(document.body)
    }
    return () => {
      if (follow) window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
      ro?.disconnect()
    }
  }, [openKey, place, follow])

  return pos
}
