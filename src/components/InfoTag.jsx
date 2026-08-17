import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { explainers } from '../content/explainers.js'

const GAP = 8
const EDGE = 8
const POP_WIDTH = 264

/**
 * A small "?" badge that opens a one-paragraph explanation of the thing it
 * sits next to. Click or keyboard (it is a real button, so Enter and Space
 * both fire); dismissed by the badge again, a click outside, or Escape.
 *
 * The popover is portalled to <body> and positioned fixed, for two reasons:
 * it cannot be clipped by the instruments' overflow boxes, and it cannot move
 * anything on the page when it opens or closes.
 */
export default function InfoTag({ topic }) {
  const entry = explainers[topic]
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: POP_WIDTH })
  const btnRef = useRef(null)
  const popRef = useRef(null)
  const popId = useId()

  const place = useCallback(() => {
    const btn = btnRef.current
    const pop = popRef.current
    if (!btn || !pop) return
    const r = btn.getBoundingClientRect()
    const width = Math.min(POP_WIDTH, window.innerWidth - EDGE * 2)
    const left = Math.max(
      EDGE,
      Math.min(
        r.left + r.width / 2 - width / 2,
        window.innerWidth - width - EDGE,
      ),
    )
    const height = pop.offsetHeight
    let top = r.bottom + GAP
    if (top + height > window.innerHeight - EDGE) {
      const above = r.top - GAP - height
      top = above >= EDGE ? above : Math.max(EDGE, window.innerHeight - height - EDGE)
    }
    setPos({ top, left, width })
  }, [])

  // Measured and placed before paint, so the popover never appears misplaced.
  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])

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
    const reposition = () => place()
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, place])

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
