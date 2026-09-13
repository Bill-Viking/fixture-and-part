import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { claimNotes, CLAIM_KINDS } from '../content/claimNotes.js'
import { usePopoverPlacement } from './usePopoverPlacement.js'

// The notes run longer than the "?" badge's one paragraph, and they carry a
// list of sources under them, so the box is a little wider than the badge's.
const POP_WIDTH = 300
const MARK = 'button.claim-mark'

/** `EVIDENCE — what the rat study measured`: the kind, then what it is about. */
function noteLabel(note) {
  return `${CLAIM_KINDS[note.kind]} — ${note.title}`
}

/**
 * The notes behind the essay's claim marks — one component, mounted once,
 * driving one popover for all eighteen of them.
 *
 * The marks themselves are static DOM: they are written into the prose in
 * `essay.js` and rendered through `dangerouslySetInnerHTML`, so React does
 * not own them and there is no per-mark component to hang state on. Hence
 * one delegated listener on the document, and one walk at mount to give each
 * mark the accessible name its note already contains. That walk runs once
 * because the prose never changes: the HTML strings are module constants, so
 * React never rewrites those subtrees.
 *
 * One note is open at a time. Opening a second closes the first, which is
 * the honest behaviour for a reader following a sentence: two open notes
 * would be two answers to one question.
 *
 * Nothing here can move the page. The popover is portalled to <body> and
 * fixed, placed by the page's one placement law; the mark is inline text
 * whose box does not change on hover, on focus or when its note is open —
 * the open state is a background, and a background has no size.
 */
export default function ClaimNotes() {
  // The id of the open note, or null. It doubles as the placement key: a
  // different mark means a different anchor and a different box height.
  const [openId, setOpenId] = useState(null)
  // The mark the open note belongs to. A ref rather than state because it is
  // a DOM node the page owns, not something React renders.
  const markRef = useRef(null)
  const popRef = useRef(null)
  const popId = useId()
  const pos = usePopoverPlacement(openId, markRef, popRef, POP_WIDTH)

  const clearMark = useCallback((mark) => {
    if (!mark) return
    mark.setAttribute('aria-expanded', 'false')
    mark.removeAttribute('aria-controls')
  }, [])

  const close = useCallback(
    (returnFocus) => {
      const mark = markRef.current
      clearMark(mark)
      // Focus first, unmount second. A dialog removed while it still holds
      // focus drops the reader on <body>; moving focus out of it first means
      // the mark keeps it and the next Tab carries on from the sentence.
      if (returnFocus) mark?.focus()
      markRef.current = null
      setOpenId(null)
    },
    [clearMark],
  )

  const open = useCallback(
    (id, mark) => {
      if (markRef.current !== mark) clearMark(markRef.current)
      mark.setAttribute('aria-expanded', 'true')
      mark.setAttribute('aria-controls', popId)
      markRef.current = mark
      setOpenId(id)
    },
    [clearMark, popId],
  )

  // The accessible name of every mark comes from its own note, so the two
  // cannot drift: a screen reader hears "evidence: what the rat study
  // measured" rather than the word EVIDENCE eighteen times.
  useEffect(() => {
    const marks = document.querySelectorAll(MARK)
    marks.forEach((mark) => {
      const note = claimNotes[mark.dataset.claim]
      if (!note) {
        // Inert rather than broken: it stays a word in the sentence and says
        // nothing it cannot back up.
        if (import.meta.env.DEV) {
          console.warn(
            `[fixture-and-part] claim mark "${mark.dataset.claim}" has no note`,
          )
        }
        return
      }
      mark.setAttribute('aria-label', `${note.kind}: ${note.title}`)
      mark.setAttribute('aria-haspopup', 'dialog')
      mark.setAttribute('aria-expanded', 'false')
    })
  }, [])

  // One listener for all eighteen marks. Enter and Space arrive here too:
  // the marks are real buttons, so the browser fires a click for both.
  useEffect(() => {
    const onClick = (e) => {
      const mark = e.target?.closest?.(MARK)
      if (!mark) return
      const id = mark.dataset.claim
      if (!claimNotes[id]) return
      if (markRef.current === mark) close(false)
      else open(id, mark)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [open, close])

  useEffect(() => {
    if (!openId) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close(true)
    }
    // A press on a mark is left to the click handler above, which toggles it
    // or switches to it; everything else outside the note closes it.
    const onPointerDown = (e) => {
      if (e.target?.closest?.(MARK)) return
      if (popRef.current?.contains(e.target)) return
      close(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [openId, close])

  // Focus moves into the dialog once it has been placed, so Tab walks its
  // sources and Escape comes back to the mark. `preventScroll`, because the
  // box is fixed and already in view: scrolling to it would move the page
  // under a reader who only asked what the sentence was standing on.
  useEffect(() => {
    if (!openId) return
    popRef.current?.focus({ preventScroll: true })
  }, [openId])

  // Dev only. Eighteen marks in the prose, eighteen notes in the file, and
  // this is what says so — including which way round a mismatch went.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    globalThis.__claimCheck = () => {
      const marks = [...document.querySelectorAll(MARK)]
      const ids = marks.map((m) => m.dataset.claim)
      const noteIds = Object.keys(claimNotes)
      return {
        marks: ids.length,
        notes: noteIds.length,
        missing: ids.filter((id) => !claimNotes[id]),
        orphan: noteIds.filter((id) => !ids.includes(id)),
        // The walk above happens once, at mount, which is only honest while
        // the prose is written once too. If a mark ever loses the name its
        // note gave it, this is what says so.
        unnamed: ids.filter(
          (id, i) => claimNotes[id] && !marks[i].getAttribute('aria-label'),
        ),
      }
    }
  }, [])

  const note = openId ? claimNotes[openId] : null
  if (!note) return null
  const label = noteLabel(note)

  return createPortal(
    // Keyed on the note, and that is a measurement rather than a habit.
    // Without the key React keeps one <div> and moves it from the first
    // mark's position to the second's, which is a fixed element changing
    // place: a real layout shift, and the observer scored it at 0.279807 at
    // 1280 px. Keyed, the first dialog is removed and the second inserted —
    // neither is a shift — and the same action reads 0.000000.
    <div
      key={openId}
      id={popId}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      ref={popRef}
      className="info-pop claim-pop"
      style={{ top: pos.top, left: pos.left, width: pos.width }}
    >
      <span className="info-pop-title">{label}</span>
      {note.body}
      {note.sources.length > 0 ? (
        <ul className="claim-sources">
          {note.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>,
    document.body,
  )
}
