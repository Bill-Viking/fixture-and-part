import { COMPANY } from './lib/company.js'
import { loadBakedPass } from './lib/bakedPass.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { header, sections, footerHtml, footerHtmlCompany, miniLegend } from './content/essay.js'
import Tokenizer from './instruments/Tokenizer.jsx'
import Stepper from './instruments/Stepper.jsx'
import AttentionInspector from './instruments/AttentionInspector.jsx'
import GlassPass from './instruments/GlassPass.jsx'
import ForwardMap from './instruments/ForwardMap.jsx'
import FileView from './instruments/FileView.jsx'
import LoopFigure from './figures/LoopFigure.jsx'
import HarnessReadout from './figures/HarnessReadout.jsx'
import ModeControl from './components/ModeControl.jsx'
import ClaimNotes from './components/ClaimNotes.jsx'
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
  CACHE_KEY,
  attentionRows,
  cacheHasModel,
  chooseNext,
  loadModel,
  realForward,
  realTokenize,
  residualStops,
  tokenText,
} from './lib/realModel.js'
import { readLens } from './lib/logitLens.js'
import { mb, shortSha } from './lib/fileFormat.js'

/**
 * A block of the essay's prose, which is written as HTML and rendered as
 * HTML.
 *
 * The `__html` object is memoised, and that is load-bearing rather than
 * tidiness. React compares this prop by identity, not by the string inside
 * it, so a fresh object literal on every render means every paragraph on the
 * page has its innerHTML written again on every state change — measured:
 * 155 childList records under one scroll, with the claim marks (eighteen at the time)
 * among the nodes thrown away and rebuilt, losing the accessible names they
 * had been given. Memoised on the string, React skips all of it and the
 * prose is written once.
 */
function Html({ as: Tag = 'p', html, className }) {
  const inner = useMemo(() => ({ __html: html }), [html])
  return <Tag className={className} dangerouslySetInnerHTML={inner} />
}

/**
 * A box set into the prose, labelled with the kind of claim it makes.
 *
 * The body is a BLOCK, not a span. Four of the five callouts on the page are
 * one run of inline html and rendered the same either way; the fifth — the
 * author's own, in section 03 — is two paragraphs, and a <p> inside a <span>
 * is not html a page may write. The element that holds blocks says so, and
 * `.callout p` in the stylesheet gives them their rhythm. Measured: with the
 * span swapped for the div, each of the four callouts that were here before
 * renders pixel-identical to main at 1280 and at 390 — max channel delta 0,
 * no tolerance allowed, with the new callout taken out of flow so that the
 * page below it sits at main's own coordinates and the glyphs are rasterised
 * at the same sub-pixel phase.
 */
function Callout({ label, html, variant }) {
  return (
    <div className={`callout${variant === 'cool' ? ' cool' : ''}`}>
      <span className="lbl">{label}</span>
      <Html as="div" className="callout-body" html={html} />
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

/**
 * The model file's fingerprint, size and reading date as the build read them
 * — fileFacts.json's `provenance`, put into the bundle by vite.config.js so
 * the file card has them in its first paint (the JSON itself is a lazy chunk;
 * see the config).
 */
const BUILT = __FILE_PROVENANCE__

/** The card's values, spelled exactly as instrument E spells them. */
const builtValues = {
  sha: shortSha(BUILT.sha256),
  mb: mb(BUILT.bytes),
  readAt: BUILT.readAt,
}

/** `{sha}`, `{mb}` and `{readAt}` in a card's string, filled. */
const fillValues = (text, values) =>
  text.replace(/\{(sha|mb|readAt)\}/g, (_, key) => values[key])

/** The two states the file card's line prints in the alert colour, as E does. */
const ALERT_STATES = new Set(['differs', 'error'])

/**
 * The file card's last line: instrument E's finding about the model file,
 * handed up to the page — never a reading of its own.
 *
 * Its height is the tallest of the lines it can print, at whatever width the
 * card is: every one of them is laid in the same grid cell, hidden, beside
 * the one that shows. A line changing therefore never changes the box, and
 * nothing below it moves — including `no-fingerprint`, which prints nothing
 * into the space the others reserve. The hidden ones are out of the
 * accessibility tree; the sha they are sized with is the build's, and any
 * other fingerprint takes the same thirteen characters of a mono face.
 *
 * No aria-live here. E's own proof line in section 01 is a polite live region
 * and announces the same change; two of them would read it twice.
 */
function LiveLine({ lines, proof }) {
  const line = lines[COMPANY && proof.state === 'unloaded' ? 'unloadedCompany' : proof.state]
  const text = line ? fillValues(line, { ...builtValues, sha: shortSha(proof.sha) }) : ''
  return (
    <div className="contrast-live-box" data-state={proof.state}>
      <p className={`contrast-live${ALERT_STATES.has(proof.state) ? ' is-alert' : ''}`}>
        {text}
      </p>
      {Object.values(lines).map((each) => (
        <span className="contrast-live-ghost" aria-hidden="true" key={each}>
          {fillValues(each, builtValues)}
        </span>
      ))}
    </div>
  )
}

/**
 * Section 07's contrast: one memory recalled on each side, in the shape of
 * section 09's duo — the brain card cited, the file card demonstrated. The
 * paragraphs are HTML, so the brain card's claim mark is a real button that
 * opens its note like every other mark on the page.
 */
function Contrast({ cards, proof }) {
  return (
    <div className="duo contrast">
      {cards.map((card) => (
        <div className={`card ${card.variant}`} key={card.title}>
          <h3>{card.title}</h3>
          <p className="card-kicker">{card.kicker}</p>
          {card.paragraphs.map((html) => (
            <Html key={html} html={fillValues(html, builtValues)} />
          ))}
          {card.live ? <LiveLine lines={card.live} proof={proof} /> : null}
        </div>
      ))}
    </div>
  )
}

/**
 * The page's words, defined once: a definition list under the header's
 * legend, in the legend's own mono face and size. Nothing in it is clickable
 * — it is a list of definitions, not navigation — and each row is the word
 * and its gloss as plain text, so that is what is read out. The role colours
 * the word and never the gloss.
 *
 * Where the strip is two columns the first holds the first half of the
 * words, rounded up (four of seven), and the row that opens the second column
 * says so.
 *
 * The strip's height is decided here, from the strings, and never by a font.
 * Each gloss is set to a measure of whole characters — GLOSS_MEASURE, one per
 * breakpoint — and each row is given the height of the lines its gloss takes
 * at that measure, counted below the way the browser breaks a line. The
 * stylesheet reads both as custom properties (see `.glossary` there), so the
 * row is the same box in the fallback face, in Plex Mono, and in the moment
 * between them when the browser has neither.
 */
const GLOSS_MEASURE = { two: 36, one: 64, narrow: 38, phone: 28 }
const CAPTION_MEASURE = 40

/**
 * The pieces a line may break between: after a run of spaces, or after a
 * hyphen that a letter follows ("feed-" | "forward").
 */
function breakPieces(text) {
  const pieces = []
  let piece = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]
    piece += ch
    if ((ch === ' ' && next !== ' ') || (ch === '-' && next !== undefined && next !== ' ')) {
      pieces.push(piece)
      piece = ''
    }
  }
  if (piece) pieces.push(piece)
  return pieces
}

/**
 * How many lines a string takes at a measure of whole characters: greedily,
 * a line's trailing spaces not counted against it — which in a mono face is
 * how the browser fills a line.
 */
function linesAt(text, measure) {
  let lines = 1
  let used = 0
  for (const piece of breakPieces(text)) {
    if (used > 0 && used + piece.trimEnd().length > measure) {
      lines++
      used = piece.length
    } else {
      used += piece.length
    }
  }
  return lines
}

function Glossary({ entries, caption }) {
  const secondColumn = Math.ceil(entries.length / 2)
  const measures = {
    '--measure-two': GLOSS_MEASURE.two,
    '--measure-one': GLOSS_MEASURE.one,
    '--measure-narrow': GLOSS_MEASURE.narrow,
    '--measure-phone': GLOSS_MEASURE.phone,
  }
  return (
    <div className="glossary-strip">
      <dl className="glossary" style={measures}>
        {entries.map((entry, i) => (
          <div
            className={i === secondColumn ? 'glossary-row is-col-break' : 'glossary-row'}
            key={entry.word}
            style={{
              '--lines-two': linesAt(entry.gloss, GLOSS_MEASURE.two),
              '--lines-one': linesAt(entry.gloss, GLOSS_MEASURE.one),
              '--lines-narrow': linesAt(entry.gloss, GLOSS_MEASURE.narrow),
              '--lines-phone': linesAt(entry.gloss, GLOSS_MEASURE.phone),
            }}
          >
            <dt className={entry.role ? `is-${entry.role}` : undefined}>{entry.word}</dt>
            <dd>{entry.gloss}</dd>
          </div>
        ))}
      </dl>
      <p
        className="glossary-caption"
        style={{
          '--measure-caption': CAPTION_MEASURE,
          '--lines-caption': linesAt(caption, CAPTION_MEASURE),
        }}
      >
        {caption}
      </p>
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
 * Whether the reader has asked for no animation. Asked, not assumed — and
 * guarded, because a test environment or an old browser may have no
 * matchMedia at all, in which case the honest answer is "not asked for".
 */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Scrolls one instrument into view. The lettered markers on instrument F's
 * drawing are windows onto the instrument each part belongs to, and this is
 * what opening one does.
 *
 * The stylesheet already forces `scroll-behavior:auto` under reduced motion,
 * but an explicit `behavior` in the options object beats the stylesheet — so
 * the jump has to ask for itself. Instrument F asks the same question about
 * its own tour and its ambient loop.
 */
function scrollToInstrument(name) {
  const node = document.getElementById(`inst-${name}`)
  if (!node) return
  node.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  })
}

/** Where instrument C points when a real tokenization is first built. */
function realQueryIndex(text, tokens) {
  if (tokens.length === 0) return 0
  // The default sentence lands on "it" in BPE too, so the two modes can be
  // read side by side on the same word.
  if (text === DEFAULT_SENTENCE) return Math.min(4, tokens.length - 1)
  return tokens.length - 1
}

/**
 * The drawings set into the prose. Unlike the instruments they take no
 * state and run nothing, so they are made once, here, outside the app.
 */
const figures = {
  loop: <LoopFigure />,
}

/**
 * The readouts set into the prose: build-time readings of the repository,
 * drawn once like the figures. Section 10's harness is the one.
 */
const readouts = {
  harness: <HarnessReadout />,
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
  const [selectedMode, setMode] = useState('illustrative')
  const mode = COMPANY ? 'illustrative' : selectedMode
  const [modelStatus, setModelStatus] = useState('idle')
  const [loadingFromCache, setLoadingFromCache] = useState(false)
  const modelLoadStarted = useRef(false)
  const modelLoadAttempted = useRef(false)
  const cacheProbe = useRef(null)
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
  // What instrument E has found about the model file, handed up from it:
  // section 07's file card prints this and takes no reading of its own.
  const [fileProof, setFileProof] = useState({ state: 'unloaded', sha: null })
  // E hands its finding up from a layout effect, the first time at mount; a
  // finding equal to the one held keeps the held object, so the page is not
  // rendered again for news it already has.
  const handleProof = useCallback(
    (next) =>
      !COMPANY && setFileProof((prev) =>
        prev.state === next.state && prev.sha === next.sha ? prev : next,
      ),
    [],
  )
  const realBaseKey = useRef(null)
  // Read from the forward-pass effect, which must not re-subscribe on typing.
  const textRef = useRef(text)
  textRef.current = text

  const isReal = !COMPANY && mode === 'real' && modelStatus === 'ready'

  const wordTokens = useMemo(() => tokenize(text), [text])
  const [bakedPass, setBakedPass] = useState(null)
  const bakedLoad = useRef(null)
  useEffect(() => {
    if (!COMPANY || !loadBakedPass) return
    // One load and one error report, including React's development effect replay.
    bakedLoad.current ??= loadBakedPass().catch((error) => {
      console.error(error)
      return null
    })
    let active = true
    bakedLoad.current.then((pass) => { if (active) setBakedPass(pass) })
    return () => { active = false }
  }, [])
  // ASSUMES: only the page's exact sentence owns these numbers, never another eight-token text.
  const baked = COMPANY && bakedPass && text === DEFAULT_SENTENCE ? bakedPass : null
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
  // And so does instrument B, for a stronger reason than what it prints.
  //
  // In that debounce window `runReady` is true — the run matches the ids the
  // OLD tokenization produced, and typing has already cleared the generated
  // tail — so a STEP pressed there passed every gate and committed a token
  // chosen for the sentence that is no longer in the box. A moment later the
  // new tokenization landed underneath it and the pick was sitting on the end
  // of a sentence it was never scored against. It was reachable by hand: type
  // and hit STEP inside a tenth of a second.
  //
  // So B waits for the run that belongs to the current text — the shortlist,
  // the pick worked out from it, and the commit itself, which re-checks this
  // rather than trusting the button it was reached from. The window is short
  // enough that the honest thing to show in it is the note the instrument
  // already has for "the machine has not caught up with the box".
  const stepPending = isReal && sequenceIds.length > 0 && !ranKey

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
      if (COMPANY || next === mode) return
      setMode(next)
      resetSequence()
      realBaseKey.current = null
      if (next === 'illustrative') {
        setQueryIndex(defaultQueryIndex(tokenize(text)))
      }
    },
    [mode, resetSequence, text],
  )

  const handleLoad = useCallback((source) => {
    if (COMPANY || modelLoadStarted.current ||
        (source === 'cache' && modelLoadAttempted.current)) return
    // Shared by the click and the probe; set synchronously before either
    // road can start another load, including React's effect replay.
    modelLoadStarted.current = true
    modelLoadAttempted.current = true
    setLoadingFromCache(source === 'cache')
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
        modelLoadStarted.current = false
      })
  }, [resetSequence])

  useEffect(() => {
    if (COMPANY || typeof caches === 'undefined') return
    // One read-only presence probe per mount, shared across effect replay.
    // An unavailable/partial cache is not permission to fetch a model.
    cacheProbe.current ??= caches.open(CACHE_KEY)
      .then((cache) => cache.keys())
      .then(cacheHasModel)
      .catch(() => false)
    let active = true
    cacheProbe.current.then((present) => {
      if (active && present) handleLoad('cache')
    })
    return () => { active = false }
  }, [handleLoad])

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
  const readLensAt = useCallback(
    (index) => {
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

  /**
   * Moves the window, and in real mode reads through it.
   */
  const handleLensSelect = useCallback(
    (index) => {
      setLensIndex(index)
      readLensAt(index)
    },
    [readLensAt],
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
    ? Boolean(ranKey) && realRun.candidates.length > 0 && underCap
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
  //
  // Read from `ranKey` rather than `runReady`: a pick worked out from the
  // previous sentence's run is not this sentence's pick, however finished
  // that run is.
  const pick = useMemo(
    () =>
      isReal && ranKey && underCap
        ? chooseNext(realRun, sequenceIds, decode, generated.length)
        : null,
    [isReal, ranKey, realRun, sequenceIds, decode, generated.length, underCap],
  )
  const realCandidates = useMemo(() => {
    if (!isReal || !ranKey || !underCap) return []
    if (!pick) return realRun.candidates
    return realRun.candidates.map((c) => ({ ...c, wins: c.id === pick.id }))
  }, [isReal, ranKey, underCap, realRun, pick])
  const candidates = isReal ? realCandidates : toyCandidates
  const scriptedNext = useMemo(
    () => !isReal && isScriptedStep(wordTokens, generated),
    [isReal, wordTokens, generated],
  )

  const handleStep = useCallback(() => {
    if (isReal) {
      // Checked again here rather than trusting the disabled button: the
      // keyboard, the auto-run loop and a click landing in the same frame as
      // a keystroke all reach this without passing through `canStep`.
      if (!ranKey || !pick) return
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
  }, [isReal, ranKey, pick, wordTokens])

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

  // Instrument D presents the lens at all seven depths, and it should have
  // something to present the moment a pass lands rather than waiting for
  // someone to click a token. A finished pass therefore reads the lens at
  // whatever position is selected.
  //
  // Keyed on the run alone, deliberately. Selecting a token calls
  // `handleLensSelect`, which reads it; if the selected index were a
  // dependency here as well, every click would start the same reading twice
  // and the second would cancel the first at its next depth.
  const lensLatest = useRef(null)
  lensLatest.current = { readLensAt, index: safeLens }
  useEffect(() => {
    if (!isReal || !runReady) return
    lensLatest.current.readLensAt(lensLatest.current.index)
  }, [isReal, runReady, runKey])
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
        onProof={handleProof}
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
            loadingFromCache={loadingFromCache}
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
        // `stepPending`, not `realPending`: B's shortlist is now empty for the
        // debounce window as well, and without this the empty list would print
        // "generation cap reached" — the one message that is false there.
        pending={stepPending}
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
        sequence={baked ? baked.run.tokens : sequence}
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
        armed={isReal || Boolean(baked)}
        real={(isReal && Boolean(ranKey)) || Boolean(baked)}
        run={isReal && runReady ? realRun : (baked ? baked.run : null)}
        nextToken={
          // The token B will append. In real mode that is the sampler's own
          // pick, which is not always in the printed shortlist — the draw
          // reaches forty deep and the list shows four.
          baked ? baked.nextToken : (pick?.token ?? candidates.find((c) => c.wins)?.token ?? null)
        }
        // The same value instrument B is given, so the drawing narrates the
        // rule the reader actually selected rather than the shipped default.
        // Illustrative mode is pinned to greedy for the same reason B is.
        decode={isReal ? decode : 'greedy'}
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
        bakedRun={baked && generated.length === 0 ? baked.run : null}
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
          <Glossary entries={header.glossary} caption={header.glossaryCaption} />
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
              if (block.type === 'contrast') {
                return <Contrast key={key} cards={block.cards} proof={fileProof} />
              }
              if (block.type === 'figure') {
                return (
                  <div
                    key={key}
                    className="instrument-slot figure-slot"
                    id={`fig-${block.name}`}
                  >
                    {figures[block.name]}
                  </div>
                )
              }
              if (block.type === 'readout') {
                return (
                  <div
                    key={key}
                    className="instrument-slot readout-slot"
                    id={`readout-${block.name}`}
                  >
                    {readouts[block.name]}
                  </div>
                )
              }
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

        <Html as="div" className="foot" html={COMPANY ? footerHtmlCompany : footerHtml} />

        {/* The claim marks are written into the prose above and rendered as
            raw HTML, so they have no component of their own. This is the one
            that answers all of them: one delegated listener, one note open at
            a time. It draws nothing here — the note is portalled to <body>. */}
        <ClaimNotes />
      </div>
    </>
  )
}
