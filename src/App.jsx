import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { header, sections, footerHtml, miniLegend } from './content/essay.js'
import Tokenizer from './instruments/Tokenizer.jsx'
import Stepper from './instruments/Stepper.jsx'
import AttentionInspector from './instruments/AttentionInspector.jsx'
import GlassPass from './instruments/GlassPass.jsx'
import ForwardMap from './instruments/ForwardMap.jsx'
import FileView from './instruments/FileView.jsx'
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
  RESIDUAL_STOPS,
  attentionRows,
  chooseNext,
  loadModel,
  realForward,
  realTokenize,
  residualStops,
  tokenText,
} from './lib/realModel.js'
import { readLens } from './lib/logitLens.js'

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

/**
 * The row instrument E opens on. It lives up here because instrument F's
 * steel boxes select rows in E, so the selection has to be one thing owned by
 * one component; E's own default is unchanged.
 */
const FILE_DEFAULT_TENSOR = 'transformer.wte.weight_quantized'

/**
 * Scrolls one instrument into view. The lettered markers on instrument F's
 * drawing are windows onto the instrument each part belongs to, and this is
 * what opening one does.
 */
function scrollToInstrument(name) {
  const node = document.getElementById(`inst-${name}`)
  if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  // Where instrument D's window sits, and the reading taken through it. The
  // reading is only ever taken on a click: in real mode it is a third of a
  // second of arithmetic per position, so nothing here recomputes on its own.
  const [lensIndex, setLensIndex] = useState(
    () => Math.max(0, tokenize(DEFAULT_SENTENCE).length - 1),
  )
  const [lensReading, setLensReading] = useState(null)
  const lensCancel = useRef(null)
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
  // How instrument B picks the next token in real mode. Sampled is the
  // default: greedy on a six-block model loops, which is a true fact about
  // greedy decoding and a poor advertisement for the machine. Illustrative
  // mode is pinned to greedy — the toy numbers are hand-tuned, and drawing
  // from a hand-tuned distribution would be theatre.
  const [decode, setDecode] = useState('sampled')
  // Which tensor instrument E is showing. It lives here rather than in E
  // because instrument F's steel boxes open it: a click on the map's c_attn
  // box has to select that row in the file, and two components cannot own one
  // selection. E's default is unchanged.
  const [fileTensor, setFileTensor] = useState(FILE_DEFAULT_TENSOR)
  const realBaseKey = useRef(null)
  // Read from the forward-pass effect, which must not re-subscribe on typing.
  const textRef = useRef(text)
  textRef.current = text

  const isReal = mode === 'real' && modelStatus === 'ready'

  const wordTokens = useMemo(() => tokenize(text), [text])
  // Memoised because instrument D keys a reset off it: a fresh array every
  // render would throw the glass pass back to its default position on every
  // render rather than on every retokenization.
  const baseTokens = useMemo(
    () => (isReal ? (realBase?.tokens ?? []) : wordTokens),
    [isReal, realBase, wordTokens],
  )
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
  // The key of a finished pass over the text that is in the box NOW. The
  // tokenizer is debounced, so for a moment after a keystroke there is a
  // finished run belonging to the previous sentence; instruments that claim
  // to be reading the reader's own sentence — E and F — gate on this rather
  // than on runReady alone.
  const ranKey =
    isReal && runReady && realBase?.text === text ? runKey : null

  const clearLens = useCallback(() => {
    lensCancel.current?.()
    lensCancel.current = null
    setLensReading(null)
  }, [])

  const resetSequence = useCallback(() => {
    setGenerated([])
    setGeneratedIds([])
    setStepTick(0)
    setKvSelection(null)
    clearLens()
  }, [clearLens])

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
          // Tagged with the text it came from. Instrument E asks whether the
          // model has run on what is in the box now, and without this it
          // could be told yes while the answer on screen still belonged to
          // the previous sentence — the tokenizer is debounced, so for a
          // moment after a keystroke the finished run is the old one.
          if (!cancelled) setRealBase({ ...result, text })
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

  // A reading belongs to the exact sequence it was taken from, and appending
  // a token invalidates it even though attention only looks backwards.
  //
  // That is worth stating plainly, because the obvious optimisation — compare
  // only the prefix up to the position being read, since a causal model
  // cannot let later tokens change an earlier one — is wrong here, and was
  // measured to be wrong rather than assumed. This export is dynamically
  // quantized: twenty-four DynamicQuantizeLinear nodes take their scale from
  // the min and max of a whole [1, n, 768] activation, so a token appended at
  // the end moves the scale and with it, slightly, every position's numbers.
  // The wte + wpe stop is untouched, being a plain lookup; by the last stop
  // the drift measured about 2% of the vector's largest component. Small, but
  // not nothing, and the panel does not print numbers the machine has stopped
  // agreeing with.
  const lensStale =
    isReal &&
    Boolean(lensReading) &&
    (lensReading.index !== lensIndex || lensReading.key !== runKey)

  /**
   * Moves the window, and in real mode reads through it. The seven depths
   * come back one at a time, so the panel fills from the top instead of
   * appearing at once; a click during a reading cancels the one in flight
   * rather than queueing behind it.
   */
  const handleLensSelect = useCallback(
    (index) => {
      setLensIndex(index)
      if (!isReal || !runReady) return
      const stops = residualStops(realRun, index)
      if (!stops) return
      lensCancel.current?.()
      const key = realRun.key
      setLensReading({
        index,
        key,
        status: 'pending',
        stops: Array(RESIDUAL_STOPS).fill(null),
        trace: null,
        winner: null,
        message: null,
      })
      const patch = (change) =>
        setLensReading((prev) =>
          prev && prev.index === index && prev.key === key
            ? { ...prev, ...change(prev) }
            : prev,
        )
      lensCancel.current = readLens(stops, {
        onStop: (stop, candidates) =>
          patch((prev) => ({
            stops: prev.stops.map((row, i) =>
              i === stop
                ? candidates.map((candidate, rank) => ({
                    token: tokenText(candidate.id),
                    weight: candidate.probability,
                    wins: rank === 0,
                  }))
                : row,
            ),
          })),
        onTrace: (winnerId, probabilities) =>
          patch(() => ({ winner: tokenText(winnerId), trace: probabilities })),
        onDone: () => patch(() => ({ status: 'done' })),
        onError: (message) => patch(() => ({ status: 'error', message })),
      })
    },
    [isReal, runReady, realRun],
  )

  const openInstrument = useCallback((name) => scrollToInstrument(name), [])

  // A steel box on instrument F's map, opened in instrument E: select the row
  // and scroll to it. E scrolls its own list to the selected row without
  // moving the page, so this is the only scroll that happens.
  const openTensor = useCallback((name) => {
    setFileTensor(name)
    scrollToInstrument('file')
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
  // The token the next STEP will commit, worked out before it is pressed.
  // The draw is a pure function of the seed and of how many tokens have been
  // generated, so naming the winner up front cannot disagree with the step
  // that follows — the shortlist marks exactly the row STEP appends.
  const pick = useMemo(
    () =>
      isReal && runReady && underCap
        ? chooseNext(realRun, sequenceIds, decode, generated.length)
        : null,
    [isReal, runReady, realRun, sequenceIds, decode, generated.length, underCap],
  )
  const realCandidates = useMemo(() => {
    if (!isReal || !runReady || !underCap) return []
    if (!pick) return realRun.candidates
    return realRun.candidates.map((c) => ({ ...c, wins: c.id === pick.id }))
  }, [isReal, runReady, underCap, realRun, pick])
  const candidates = isReal ? realCandidates : toyCandidates
  const scriptedNext = useMemo(
    () => !isReal && isScriptedStep(wordTokens, generated),
    [isReal, wordTokens, generated],
  )

  const handleStep = useCallback(() => {
    if (isReal) {
      if (!runReady || !pick) return
      const next = pick
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
  }, [isReal, runReady, pick, wordTokens])

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
    setLensIndex(Math.max(0, baseTokens.length - 1))
    clearLens()
  }, [isReal, realBase, text, wordTokens, baseTokens.length, clearLens])

  // A rebuilt base sequence — typing, a mode switch, a fresh tokenization —
  // puts the glass pass back on its last token and drops the reading, which
  // was taken through a window that no longer exists.
  useEffect(() => {
    setLensIndex(Math.max(0, baseTokens.length - 1))
    clearLens()
  }, [baseTokens, clearLens])

  // Keep the query inside the sequence if it ever shrinks.
  useEffect(() => {
    if (queryIndex > sequence.length - 1) {
      setQueryIndex(Math.max(0, sequence.length - 1))
    }
  }, [queryIndex, sequence.length])

  // Same for the glass pass's window.
  useEffect(() => {
    if (lensIndex > sequence.length - 1) {
      setLensIndex(Math.max(0, sequence.length - 1))
    }
  }, [lensIndex, sequence.length])

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
  const safeLens = Math.min(lensIndex, Math.max(0, sequence.length - 1))
  const realRows = useMemo(
    () => (isReal && runReady ? attentionRows(realRun, layer, head, safeQuery) : null),
    [isReal, runReady, realRun, layer, head, safeQuery],
  )

  const instruments = {
    // Instrument E has no illustrative mode to switch away from, so it takes
    // no part of the shared sequence state. What it does take is the two
    // things it needs to answer the reader who changed the text and expected
    // the file to change with it: the text itself, and the key of the run the
    // model has completed over it. It reads the file again and says so.
    file: (
      <FileView
        text={text}
        ranKey={ranKey}
        selected={fileTensor}
        onSelectTensor={setFileTensor}
        modelStatus={modelStatus}
        progress={progress}
        onLoad={handleLoad}
      />
    ),
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
        text={text}
        baseTokens={baseTokens}
        sequence={sequence}
        stepTick={stepTick}
        canStep={canStep}
        candidates={candidates}
        scriptedNext={scriptedNext}
        decode={isReal ? decode : 'greedy'}
        onDecodeChange={setDecode}
        pick={pick}
        kvSelection={kvSelection}
        real={isReal}
        vectors={isReal && runReady ? realRun : null}
        pending={realPending}
        modelStatus={modelStatus}
        progress={progress}
        onLoad={handleLoad}
        onKvSelect={handleKvSelect}
        onStep={handleStep}
        onReset={handleReset}
      />
    ),
    attention: (
      <AttentionInspector
        text={text}
        sequence={sequence}
        queryIndex={safeQuery}
        onQueryChange={setQueryIndex}
        real={isReal}
        realRows={realRows}
        realIds={isReal && runReady ? realRun.ids : null}
        pending={realPending}
        modelStatus={modelStatus}
        progress={progress}
        onLoad={handleLoad}
        layer={layer}
        head={head}
        onLayerChange={setLayer}
        onHeadChange={setHead}
      />
    ),
    forward: (
      <ForwardMap
        text={text}
        sequence={sequence}
        lensIndex={safeLens}
        onSelect={handleLensSelect}
        layer={layer}
        onLayerChange={setLayer}
        // Two different questions, and instrument F asks both.
        //
        // `armed` is "the real model is in hand and this instrument is in
        // real mode". It is what the controls, the head note and the
        // teaching line answer to, and it does not flicker: appending a
        // token does not un-load the model.
        //
        // `real` is "a finished pass over the text in the box now, and this
        // is it". It is what every NUMBER on the drawing answers to, and it
        // goes false for the third of a second a pass takes — during which
        // the map draws its stream flat and says the pass is running,
        // rather than claiming numbers it does not yet have.
        armed={isReal}
        real={isReal && Boolean(ranKey)}
        run={isReal && runReady ? realRun : null}
        reading={lensStale ? null : lensReading}
        nextToken={
          // The token B will append. In real mode that is the sampler's own
          // pick, which is not always in the printed shortlist — the draw
          // reaches forty deep and the list shows four.
          pick?.token ?? candidates.find((c) => c.wins)?.token ?? null
        }
        pending={realPending}
        stepTick={stepTick}
        modelStatus={modelStatus}
        progress={progress}
        onLoad={handleLoad}
        onOpenInstrument={openInstrument}
        onOpenTensor={openTensor}
      />
    ),
    glass: (
      <GlassPass
        text={text}
        sequence={sequence}
        baseTokens={baseTokens}
        lensIndex={safeLens}
        onSelect={handleLensSelect}
        real={isReal}
        run={isReal && runReady ? realRun : null}
        reading={lensReading}
        stale={lensStale}
        pending={realPending}
        modelStatus={modelStatus}
        progress={progress}
        onLoad={handleLoad}
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
                  <div
                    key={key}
                    className="instrument-slot"
                    id={`inst-${block.name}`}
                  >
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
