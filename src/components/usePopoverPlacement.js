import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * One placement law for every popover on the page.
 *
 * There are two of them — the "?" badge's explanation and the claim mark's
 * note — and both are portalled to <body> and measured the same way, for the
 * same two reasons: a portalled box cannot be clipped by an instrument's
 * overflow box, and it cannot move anything on the page when it opens or
 * closes.
 *
 * EVERY POPOVER IS ANCHORED TO THE PAGE. The law is decided once, at open,
 * against the viewport — measured before paint, centred under the anchor,
 * clamped to the viewport with EDGE to spare — and the answer is then written
 * down in DOCUMENT coordinates. So the box is `position:absolute`, and it
 * scrolls away with the thing it explains, like any other content. There is
 * no scroll listener anywhere in this file.
 *
 * There used to be a second mode, and it is gone rather than switched off.
 * The badge's box was `position:fixed` and re-placed on every scroll event,
 * which means it chased the reader down the page; a box that moves is a
 * layout shift, and with a badge open, 300 px of wheel scroll scored 0.017986
 * at 1280 px and 0.092163 at 390 — measured on this page, in the same harness
 * that reads 0.000000 for a box anchored here. A branch nobody takes is a
 * branch nobody measures, so there is no branch.
 *
 * The vertical half of the law has THREE answers, not two:
 *
 * - below the anchor, at GAP, when the box fits below;
 * - above it when only above fits;
 * - and when it fits NEITHER — a box taller than the room on both sides —
 *   below again, at the same GAP, running past the bottom of the viewport.
 *   The reader scrolls to the rest.
 *
 * That last answer used to be a clamp to the viewport's bottom edge, which is
 * how a tall note at 390 came to sit on top of the very sentence it was
 * explaining. Opening below is safe to read for the same reason the case
 * arises at all: the box fits neither above nor below, so the anchor is
 * mid-screen, and the top of the box — its title and its first lines — lands
 * under the sentence the reader is already looking at. An anchor near the
 * bottom of the window has room above it and flips there, as it always did.
 * The box never opens above running off the top, and never covers its anchor.
 *
 * The one thing that may move a box after it opens is the page moving under
 * it: a resize, and the reflow the resize starts. Then it is not re-decided,
 * only carried — the same distance from its own anchor, wherever the anchor
 * went.
 */
export const GAP = 8
export const EDGE = 8

/**
 * Where a popover of this width goes IN THE VIEWPORT, given the anchor it
 * hangs from and the box itself (already rendered, so its height is a
 * measurement rather than a guess). The three vertical answers are the law as
 * stated above; the horizontal one is centred under the anchor, never wider
 * than the window less EDGE on both sides, and never past either edge.
 */
export function placePopover(anchor, pop, maxWidth) {
  const r = anchor.getBoundingClientRect()
  const width = Math.min(maxWidth, window.innerWidth - EDGE * 2)
  const left = Math.max(
    EDGE,
    Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - EDGE),
  )
  const height = pop.offsetHeight
  const below = r.bottom + GAP
  const above = r.top - GAP - height
  // Below when it fits; above when only above fits; otherwise below and off
  // the bottom, which is the one case that is not a fit at all.
  const fitsBelow = below + height <= window.innerHeight - EDGE
  const top = fitsBelow || above < EDGE ? below : above
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
 * and the law — which asks where the anchor is IN THE VIEWPORT — would answer
 * for a viewport the reader has long since left, leaving the box floating
 * over a paragraph it has nothing to do with. The box belongs to its
 * sentence, not to the window.
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
export function usePopoverPlacement(openKey, anchorRef, popRef, maxWidth) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: maxWidth })
  // How far below the anchor the law put the box when it opened. Null until
  // it has opened once.
  const holdRef = useRef(null)

  const place = useCallback(
    (again) => {
      const anchor = anchorRef.current
      const pop = popRef.current
      if (!anchor || !pop) return
      const at =
        again && holdRef.current !== null
          ? rePlacePopoverInPage(anchor, pop, maxWidth, holdRef.current)
          : placePopoverInPage(anchor, pop, maxWidth)
      holdRef.current = at.hold
      setPos({ top: at.top, left: at.left, width: at.width })
    },
    [anchorRef, popRef, maxWidth],
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
    // A scroll has nothing to say to a box that is already part of the page.
    // A resize does: the width, the clamp and the flip are all decided
    // against a viewport that just changed size.
    const reposition = () => place(true)
    window.addEventListener('resize', reposition)
    // And so does the reflow the resize STARTS, which is not the same event.
    // Measured on this page: narrowing the window to 700 px fires resize while
    // the prose is still moving — the mark is at 16,655 px then and settles at
    // 17,111 px, with no second resize event to say so. The observer sees the
    // body finish changing size and the box goes back under its own anchor.
    let ro = null
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(() => place(true))
      ro.observe(document.body)
    }
    return () => {
      window.removeEventListener('resize', reposition)
      ro?.disconnect()
    }
  }, [openKey, place])

  return pos
}
