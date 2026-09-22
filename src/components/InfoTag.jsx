import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { explainers } from '../content/explainers.js'
import { usePopoverPlacement } from './usePopoverPlacement.js'

const POP_WIDTH = 264

/**
 * A small "?" badge that opens a one-paragraph explanation of the thing it
 * sits next to. Click or keyboard (it is a real button, so Enter and Space
 * both fire); dismissed by the badge again, a click outside, or Escape.
 *
 * The popover is portalled to <body> and anchored to the page, for three
 * reasons: it cannot be clipped by the instruments' overflow boxes, it cannot
 * move anything on the page when it opens or closes, and — being part of the
 * page rather than pinned to the viewport — it scrolls away with the control
 * it explains instead of chasing the reader down the page. A box that follows
 * is a box that moves, and a box that moves is scored as a layout shift.
 */
export default function InfoTag({ topic }) {
  const entry = explainers[topic]
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const popRef = useRef(null)
  const popId = useId()
  const pos = usePopoverPlacement(open, btnRef, popRef, POP_WIDTH)

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    const onPointerDown = (e) => {
      if (btnRef.current?.contains(e.target)) return
      if (popRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open])

  if (!entry) return null

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        className="info-tag"
        aria-expanded={open}
        aria-describedby={open ? popId : undefined}
        aria-label={`what is ${entry.title}`}
        onClick={() => setOpen((o) => !o)}
      >
        ?
      </button>
      {open &&
        createPortal(
          <div
            id={popId}
            role="tooltip"
            ref={popRef}
            className="info-pop"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <span className="info-pop-title">{entry.title}</span>
            {entry.body}
          </div>,
          document.body,
        )}
    </>
  )
}
