import { useEffect, useRef, useState } from 'react'

function PhoneSections({ sections, pageName }) {
  const [current, setCurrent] = useState(null)
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    const nodes = sections.map((section) => document.getElementById(`s${section.id}`))
    let frame = null
    const read = () => {
      frame = null
      let next = null
      nodes.forEach((node, i) => {
        // One pixel of tolerance: a section scrolled to its margin sits at 36.125.
        if (node && node.getBoundingClientRect().top <= 37) next = sections[i]
      })
      setCurrent((previous) => previous?.id === next?.id ? previous : next)
    }
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(read)
    }
    // Observe section arrivals and layout changes. Scroll also reads the top
    // boundary, including a gap between sections or a restored deep position.
    const observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(schedule, { rootMargin: '-36px 0px 0px 0px' })
      : null
    nodes.forEach((node) => { if (node) observer?.observe(node) })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    read()
    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [sections])

  useEffect(() => {
    if (!open) return undefined
    listRef.current?.querySelector('a')?.focus()
    const escape = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [open])

  return (
    <div className="section-bar">
      <button
        type="button"
        ref={buttonRef}
        className="section-bar-button"
        aria-expanded={open}
        aria-controls="section-bar-list"
        aria-haspopup="dialog"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {current ? `${current.id} · ${current.title}` : pageName}
      </button>
      {open && (
        <div
          id="section-bar-list"
          className="section-bar-list"
          ref={listRef}
          role="dialog"
          aria-label="Sections"
        >
          <ol>
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#s${section.id}`}
                  aria-current={current?.id === section.id ? 'location' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {section.id} · {section.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default function SectionBar({ phone, ...props }) {
  // Desktop mounts no DOM and takes no section measurements.
  return phone ? <PhoneSections {...props} /> : null
}
