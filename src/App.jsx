import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { header, sections, footerHtml, miniLegend } from './content/essay.js'
import Tokenizer from './instruments/Tokenizer.jsx'
import Stepper from './instruments/Stepper.jsx'
import AttentionInspector from './instruments/AttentionInspector.jsx'
import {
  DEFAULT_SENTENCE,
  MAX_GENERATED,
  defaultQueryIndex,
  isScriptedStep,
  nextCandidates,
  nextToken,
  tokenize,
} from './lib/toyModel.js'

function Html({ as: Tag = 'p', html, className }) {
  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
  )
}

function Callout({ label, html, variant }) {
  return (
    <div className={`callout${variant === 'cool' ? ' cool' : ''}`}>
      <span className="lbl">{label}</span>
      <Html as="span" html={html} />
    </div>
  )
}

function Duo({ cards }) {
  return (
    <div className="duo">
      {cards.map((card) => (
        <div className={`card ${card.variant}`} key={card.title}>
          <h3>{card.title}</h3>
          {card.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      ))}
    </div>
  )
}

function MiniLegend({ visible }) {
  return (
    <div
      className={`mini-legend${visible ? ' show' : ''}`}
      aria-hidden={!visible}
    >
      {miniLegend.map((item) => (
        <span key={item.swatch}>
          <i className={`sw ${item.swatch}`} />
          {item.name}
          <em className="ml-note">&mdash; {item.note}</em>
        </span>
      ))}
    </div>
  )
}

export default function App() {
  const [text, setText] = useState(DEFAULT_SENTENCE)
  const [generated, setGenerated] = useState([])
  const [stepTick, setStepTick] = useState(0)
  const [queryIndex, setQueryIndex] = useState(() =>
    defaultQueryIndex(tokenize(DEFAULT_SENTENCE)),
  )
  // Which rack chip instrument B's K/V inspector is showing: {index, role}
  // where role is 'k' or 'v', or null for nothing selected.
  const [kvSelection, setKvSelection] = useState(null)
  const [legendVisible, setLegendVisible] = useState(false)
  const sentinelRef = useRef(null)

  const baseTokens = useMemo(() => tokenize(text), [text])
  const sequence = useMemo(
    () => [...baseTokens, ...generated],
    [baseTokens, generated],
  )

  // Typing in Instrument A rebuilds the shared sequence from scratch.
  const handleTextChange = useCallback((value) => {
    setText(value)
    setGenerated([])
    setStepTick(0)
    setQueryIndex(defaultQueryIndex(tokenize(value)))
    setKvSelection(null)
  }, [])

  // Clicking the selected chip again clears the panel; any other chip
  // switches it.
  const handleKvSelect = useCallback((index, role) => {
    setKvSelection((prev) =>
      prev && prev.index === index && prev.role === role
        ? null
        : { index, role },
    )
  }, [])

  const canStep = baseTokens.length > 0 && generated.length < MAX_GENERATED

  // The shortlist STEP will pick from. Same inputs as nextToken, so the
  // highlighted winner is exactly the token the next STEP appends.
  const candidates = useMemo(
    () => nextCandidates(baseTokens, generated),
    [baseTokens, generated],
  )
  const scriptedNext = useMemo(
    () => isScriptedStep(baseTokens, generated),
    [baseTokens, generated],
  )

  const handleStep = useCallback(() => {
    setGenerated((prev) => {
      const token = nextToken(baseTokens, prev)
      return token === null ? prev : [...prev, token]
    })
    setStepTick((t) => t + 1)
  }, [baseTokens])

  const handleReset = useCallback(() => {
    setGenerated([])
    setStepTick(0)
    setQueryIndex(defaultQueryIndex(baseTokens))
    // The rack RESET rebuilds is the rack the selection pointed into, so the
    // selection goes with it rather than silently re-pointing at another row.
    setKvSelection(null)
  }, [baseTokens])

  // Keep the query inside the sequence if it ever shrinks.
  useEffect(() => {
    if (queryIndex > sequence.length - 1) {
      setQueryIndex(Math.max(0, sequence.length - 1))
    }
  }, [queryIndex, sequence.length])

  // Same for a selected chip whose row no longer exists.
  useEffect(() => {
    if (kvSelection && kvSelection.index > sequence.length - 1) {
      setKvSelection(null)
    }
  }, [kvSelection, sequence.length])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => setLegendVisible(!entry.isIntersecting),
      { rootMargin: '0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const instruments = {
    tokenizer: (
      <Tokenizer
        text={text}
        tokens={baseTokens}
        onTextChange={handleTextChange}
      />
    ),
    stepper: (
      <Stepper
        baseTokens={baseTokens}
        sequence={sequence}
        stepTick={stepTick}
        canStep={canStep}
        candidates={candidates}
        scriptedNext={scriptedNext}
        kvSelection={kvSelection}
        onKvSelect={handleKvSelect}
        onStep={handleStep}
        onReset={handleReset}
      />
    ),
    attention: (
      <AttentionInspector
        sequence={sequence}
        queryIndex={Math.min(queryIndex, Math.max(0, sequence.length - 1))}
        onQueryChange={setQueryIndex}
      />
    ),
  }

  return (
    <>
      <MiniLegend visible={legendVisible} />
      <div className="wrap">
        <header>
          <Html as="h1" html={header.titleHtml} />
          <p className="sub">{header.sub}</p>
          <div className="legend">
            {header.legend.map((item) => (
              <span key={item.swatch}>
                <i className={`sw ${item.swatch}`} />
                {item.label}
              </span>
            ))}
          </div>
        </header>
        <div ref={sentinelRef} className="sentinel" aria-hidden="true" />

        {sections.map((section) => (
          <section key={section.id} id={`s${section.id}`}>
            <Html
              as="div"
              className={`eyebrow${section.eyebrowVariant === 'warm' ? ' warm' : ''}`}
              html={section.eyebrow}
            />
            <h2>{section.title}</h2>
            {section.blocks.map((block, i) => {
              const key = `${section.id}-${i}`
              if (block.type === 'p') return <Html key={key} html={block.html} />
              if (block.type === 'callout') return <Callout key={key} {...block} />
              if (block.type === 'duo') return <Duo key={key} cards={block.cards} />
              if (block.type === 'instrument') {
                return (
                  <div key={key} className="instrument-slot">
                    {instruments[block.name]}
                  </div>
                )
              }
              return null
            })}
          </section>
        ))}

        <Html as="div" className="foot" html={footerHtml} />
      </div>
    </>
  )
}
