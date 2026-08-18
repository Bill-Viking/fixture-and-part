import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { header, sections, footerHtml, miniLegend } from './content/essay.js'
import Tokenizer from './instruments/Tokenizer.jsx'
import Stepper from './instruments/Stepper.jsx'
import AttentionInspector from './instruments/AttentionInspector.jsx'
import ModeControl from './components/ModeControl.jsx'
import {
  DEFAULT_SENTENCE,
  MAX_GENERATED,
  defaultQueryIndex,
  isScriptedStep,
  nextCandidates,
  nextToken,
  tokenize,
} from './lib/toyModel.js'
import {
  attentionRows,
  loadModel,
  realForward,
  realTokenize,
} from './lib/realModel.js'

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

/** Where instrument C points when a real tokenization is first built. */
function realQueryIndex(text, tokens) {
  if (tokens.length === 0) return 0
  // The default sentence lands on "it" in BPE too, so the two modes can be
  // read side by side on the same word.
  if (text === DEFAULT_SENTENCE) return Math.min(4, tokens.length - 1)
  return tokens.length - 1
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

  // --- Phase 2 -----------------------------------------------------------
  // 'illustrative' is exactly the Phase 1 page. 'real' swaps every number
  // for one distilgpt2 produced, and is unreachable until the model loads.
  const [mode, setMode] = useState('illustrative')
  const [modelStatus, setModelStatus] = useState('idle')
  const [progress, setProgress] = useState({ phase: 'files', percent: 0 })
  const [backend, setBackend] = useState(null)
  const [generatedIds, setGeneratedIds] = useState([])
  const [realBase, setRealBase] = useState(null)
  const [realRun, setRealRun] = useState(null)
  const [layer, setLayer] = useState(0)
  const [head, setHead] = useState(0)
  const realBaseKey = useRef(null)
  // Read from the forward-pass effect, which must not re-subscribe on typing.
  const textRef = useRef(text)
  textRef.current = text

  const isReal = mode === 'real' && modelStatus === 'ready'

  const wordTokens = useMemo(() => tokenize(text), [text])
  const baseTokens = isReal ? (realBase?.tokens ?? []) : wordTokens
  const sequence = useMemo(
    () => [...baseTokens, ...generated],
    [baseTokens, generated],
  )
  const sequenceIds = useMemo(
    () => (isReal ? [...(realBase?.ids ?? []), ...generatedIds] : []),
    [isReal, realBase, generatedIds],
  )
  const runKey = sequenceIds.join(',')
  const runReady = Boolean(realRun) && realRun.key === runKey
  const realPending = isReal && sequenceIds.length > 0 && !runReady

  const resetSequence = useCallback(() => {
    setGenerated([])
    setGeneratedIds([])
    setStepTick(0)
    setKvSelection(null)
  }, [])

  // Typing in Instrument A rebuilds the shared sequence from scratch.
  const handleTextChange = useCallback(
    (value) => {
      setText(value)
      resetSequence()
      if (mode === 'illustrative') {
        setQueryIndex(defaultQueryIndex(tokenize(value)))
      }
    },
    [mode, resetSequence],
  )

  // Switching mode re-derives everything: the two tokenizers disagree about
  // where the boundaries are, so a half-generated sequence cannot carry over.
  const handleModeChange = useCallback(
    (next) => {
      if (next === mode) return
      setMode(next)
      resetSequence()
      realBaseKey.current = null
      if (next === 'illustrative') {
        setQueryIndex(defaultQueryIndex(tokenize(text)))
      }
    },
    [mode, resetSequence, text],
  )

  const handleLoad = useCallback(() => {
    setModelStatus('loading')
    setProgress({ phase: 'files', percent: 0 })
    loadModel((p) => setProgress(p))
      .then((built) => {
        setBackend(built.backend)
        setModelStatus('ready')
        setMode('real')
        resetSequence()
        realBaseKey.current = null
      })
      .catch((err) => {
        // Everything below stays on the illustrative numbers; the notice in
        // the mode bar is the only thing the reader sees.
        console.error('[fixture-and-part] real model unavailable:', err)
        setModelStatus('error')
      })
  }, [resetSequence])

  // Real BPE for whatever is typed. Debounced so a fast typist does not queue
  // one tokenizer call per keystroke.
  useEffect(() => {
    if (!isReal) return undefined
    let cancelled = false
    const timer = setTimeout(() => {
      realTokenize(text)
        .then((result) => {
          if (!cancelled) setRealBase(result)
        })
        .catch((err) => console.error('[fixture-and-part] tokenize failed:', err))
    }, 120)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [isReal, text])

  // One forward pass per sequence state feeds both instrument B's shortlist
  // and instrument C's attention, so a step costs exactly one run.
  //
  // If a pass ever fails the page drops back to illustrative and says so,
  // rather than sitting on a shortlist that will never arrive.
  useEffect(() => {
    if (!isReal || sequenceIds.length === 0) return undefined
    let cancelled = false
    realForward(sequenceIds)
      .then((run) => {
        if (!cancelled) setRealRun(run)
      })
      .catch((err) => {
        console.error('[fixture-and-part] forward pass failed:', err)
        if (cancelled) return
        setModelStatus('error')
        setMode('illustrative')
        resetSequence()
        setQueryIndex(defaultQueryIndex(tokenize(textRef.current)))
      })
    return () => {
      cancelled = true
    }
  }, [isReal, sequenceIds, resetSequence])

  // A fresh real tokenization moves the query to its default position, the
  // same way typing does in illustrative mode.
  useEffect(() => {
    if (!isReal || !realBase) return
    const key = realBase.ids.join(',')
    if (realBaseKey.current === key) return
    realBaseKey.current = key
    setQueryIndex(realQueryIndex(text, realBase.tokens))
  }, [isReal, realBase, text])

  // Clicking the selected chip again clears the panel; any other chip
  // switches it.
  const handleKvSelect = useCallback((index, role) => {
    setKvSelection((prev) =>
      prev && prev.index === index && prev.role === role
        ? null
        : { index, role },
    )
  }, [])

  const underCap = generated.length < MAX_GENERATED
  const canStep = isReal
    ? runReady && realRun.candidates.length > 0 && underCap
    : baseTokens.length > 0 && underCap

  // The shortlist STEP will pick from. Same inputs as the step itself, so the
  // highlighted winner is exactly the token the next STEP appends.
  const toyCandidates = useMemo(
    () => nextCandidates(wordTokens, generated),
    [wordTokens, generated],
  )
  const candidates = isReal
    ? runReady && underCap
      ? realRun.candidates
      : []
    : toyCandidates
  const scriptedNext = useMemo(
    () => !isReal && isScriptedStep(wordTokens, generated),
    [isReal, wordTokens, generated],
  )

  const handleStep = useCallback(() => {
    if (isReal) {
      if (!runReady || realRun.candidates.length === 0) return
      const next = realRun.candidates[0]
      setGenerated((prev) =>
        prev.length >= MAX_GENERATED ? prev : [...prev, next.token],
      )
      setGeneratedIds((prev) =>
        prev.length >= MAX_GENERATED ? prev : [...prev, next.id],
      )
      setStepTick((t) => t + 1)
      return
    }
    setGenerated((prev) => {
      const token = nextToken(wordTokens, prev)
      return token === null ? prev : [...prev, token]
    })
    setStepTick((t) => t + 1)
  }, [isReal, runReady, realRun, wordTokens])

  const handleReset = useCallback(() => {
    setGenerated([])
    setGeneratedIds([])
    setStepTick(0)
    setQueryIndex(
      isReal
        ? realQueryIndex(text, realBase?.tokens ?? [])
        : defaultQueryIndex(wordTokens),
    )
    // The rack RESET rebuilds is the rack the selection pointed into, so the
    // selection goes with it rather than silently re-pointing at another row.
    setKvSelection(null)
  }, [isReal, realBase, text, wordTokens])

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

  const safeQuery = Math.min(queryIndex, Math.max(0, sequence.length - 1))
  const realRows = useMemo(
    () => (isReal && runReady ? attentionRows(realRun, layer, head, safeQuery) : null),
    [isReal, runReady, realRun, layer, head, safeQuery],
  )

  const instruments = {
    tokenizer: (
      <Tokenizer
        text={text}
        tokens={baseTokens}
        mode={mode}
        real={isReal}
        realIds={isReal ? realBase?.ids : null}
        onTextChange={handleTextChange}
        control={
          <ModeControl
            mode={mode}
            onModeChange={handleModeChange}
            status={modelStatus}
            progress={progress}
            backend={backend}
            error={modelStatus === 'error'}
            onLoad={handleLoad}
          />
        }
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
        real={isReal}
        vectors={isReal && runReady ? realRun : null}
        pending={realPending}
        onKvSelect={handleKvSelect}
        onStep={handleStep}
        onReset={handleReset}
      />
    ),
    attention: (
      <AttentionInspector
        sequence={sequence}
        queryIndex={safeQuery}
        onQueryChange={setQueryIndex}
        real={isReal}
        realRows={realRows}
        realIds={isReal && runReady ? realRun.ids : null}
        pending={realPending}
        layer={layer}
        head={head}
        onLayerChange={setLayer}
        onHeadChange={setHead}
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
