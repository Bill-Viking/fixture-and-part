// Phase 1 heuristics. No ML, no network, no dependencies.
// Every number produced here is illustrative — hand-tuned or heuristic —
// and the UI labels it as such. Phase 2 replaces this module with realModel.js.

export const DEFAULT_SENTENCE = 'The engine roared and it shut down.'

// Number of layers quoted by the KV rack counter. Illustrative, fixed.
export const LAYERS = 6

// The depths the glass pass reads: the stream as it enters the stack, then
// once more after every layer. One more stop than there are layers, because
// the stream exists before the first one touches it.
export const STOP_LABELS = [
  'wte + wpe',
  ...Array.from({ length: LAYERS }, (_, layer) => `after layer ${layer}`),
]
export const LENS_STOPS = STOP_LABELS.length

// Hard ceiling on generated tokens so RUN cannot grow without bound.
export const MAX_GENERATED = 12

// ---------------------------------------------------------------------------
// Tokenizer (Phase 1: word / punctuation split, not a real BPE)
// ---------------------------------------------------------------------------

const TOKEN_RE = /[A-Za-z0-9]+(?:['’][A-Za-z]+)?|[^\sA-Za-z0-9]/g

export function tokenize(text) {
  if (!text) return []
  return text.match(TOKEN_RE) ?? []
}

export const DEFAULT_TOKENS = tokenize(DEFAULT_SENTENCE)

export function isDefaultSequence(tokens) {
  if (tokens.length !== DEFAULT_TOKENS.length) return false
  return tokens.every((t, i) => t === DEFAULT_TOKENS[i])
}

// ---------------------------------------------------------------------------
// Deterministic fake embedding: same string always yields the same vector.
// FNV-1a per dimension, avalanche-mixed, mapped into [-2, 2].
// ---------------------------------------------------------------------------

/** FNV-1a over the string, salted, then avalanche-mixed. Unsigned 32-bit. */
export function hashString(str, salt = 0) {
  let h = (2166136261 ^ Math.imul(salt + 1, 0x9e3779b1)) >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  h ^= h >>> 15
  h = Math.imul(h, 2246822507) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 3266489909) >>> 0
  h ^= h >>> 16
  return h >>> 0
}

// Salt bases keep the three views of one token apart. The embedding starts at
// 0, so instrument A's numbers are unchanged; K and V start far enough away
// that no dimension is ever shared between the three vectors. Still a hash,
// still illustrative — the point is only that pressing one x through three
// different dies gives three different, stable results.
export const EMBED_SALT = 0
export const K_SALT = 64
export const V_SALT = 128
// One base per depth of the glass pass, so the running vector reads as
// something that keeps being rewritten rather than the same six numbers
// carried down the stack. Depth 0 is the embedding itself, which is what the
// stream is before any layer has touched it.
export const RESIDUAL_SALT = 192

export function hashTokenToVector(token, dims = 6, saltBase = EMBED_SALT) {
  const out = []
  for (let d = 0; d < dims; d++) {
    const unit = hashString(token, saltBase + d) / 4294967295
    out.push(Math.round((unit * 4 - 2) * 10) / 10)
  }
  return out
}

/** The token's key vector: x pressed through the frozen W_k die. Illustrative. */
export function kVector(token, dims = 6) {
  return hashTokenToVector(token, dims, K_SALT)
}

/** The token's value vector: the same x through W_v instead. Illustrative. */
export function vVector(token, dims = 6) {
  return hashTokenToVector(token, dims, V_SALT)
}

/** The token's running vector at one depth of the stack. Illustrative. */
export function residualVector(token, stop, dims = 6) {
  const salt = stop === 0 ? EMBED_SALT : RESIDUAL_SALT + (stop - 1) * 8
  return hashTokenToVector(token, dims, salt)
}

export function formatVector(vec) {
  return '[' + vec.map((v) => v.toFixed(1)).join(', ') + ']'
}

// ---------------------------------------------------------------------------
// Key descriptors — short plausible advertising tags, green in the UI.
// ---------------------------------------------------------------------------

const DETERMINERS = new Set(['the', 'a', 'an', 'this', 'that', 'these', 'those'])
const PRONOUNS = new Set(['it', 'he', 'she', 'they', 'we', 'i', 'you', 'him', 'her', 'them', 'us', 'me'])
const CONJUNCTIONS = new Set(['and', 'or', 'but', 'nor', 'so', 'yet'])
const PREPOSITIONS = new Set(['of', 'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'into', 'over', 'under', 'about'])
const AUXILIARIES = new Set(['is', 'are', 'was', 'were', 'be', 'been', 'am', 'do', 'does', 'did', 'has', 'have', 'had', 'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must'])
const PARTICLES = new Set(['down', 'up', 'off', 'out', 'back', 'away', 'through'])
const COMMON_VERBS = new Set(['shut', 'run', 'ran', 'cut', 'set', 'put', 'go', 'went', 'made', 'make', 'took', 'take', 'said', 'say', 'got', 'get', 'held', 'hold'])

const STOPWORDS = new Set([
  ...DETERMINERS, ...PRONOUNS, ...CONJUNCTIONS, ...PREPOSITIONS, ...AUXILIARIES,
  'as', 'if', 'then', 'than', 'there', 'here', 'not', 'no', 'its', 'his', 'their', 'our', 'your', 'my',
])

// A tiny lexicon so the default sentence reads exactly like FIG.2 in the essay.
const LEXICON = {
  engine: 'noun · subject · machine',
  roared: 'verb · past · sound',
  it: 'pron · unresolved · seeks noun',
  the: 'det · pointer',
  and: 'conj · joiner',
  shut: 'verb · past · state change',
  down: 'particle · completes verb',
  crew: 'noun · subject · people',
  fault: 'noun · object · condition',
}

function isPunct(token) {
  return /^[^A-Za-z0-9]$/.test(token)
}

export function kDescriptor(token) {
  const lower = token.toLowerCase()
  if (LEXICON[lower]) return LEXICON[lower]
  if (isPunct(token)) return 'punct · boundary'
  if (/^\d+$/.test(token)) return 'num · quantity'
  if (DETERMINERS.has(lower)) return 'det · pointer'
  if (PRONOUNS.has(lower)) return 'pron · unresolved'
  if (CONJUNCTIONS.has(lower)) return 'conj · joiner'
  if (PREPOSITIONS.has(lower)) return 'prep · relation'
  if (AUXILIARIES.has(lower)) return 'aux · tense carrier'
  if (PARTICLES.has(lower)) return 'particle · completes verb'
  if (COMMON_VERBS.has(lower) || /(?:ing|ed)$/.test(lower)) return 'verb · action'
  if (/^[A-Z]/.test(token)) return 'noun · proper · named'
  if (lower.length >= 6) return 'noun · topic · thing'
  return 'token · generic'
}

// ---------------------------------------------------------------------------
// Generation (Phase 1)
//
// The default sentence walks a canned continuation, tuned to the essay. Any
// other input gets a deterministic illustrative continuation instead, and
// that continuation follows a tiny grammar: each word is drawn from the
// category (determiner, noun, verb, ...) that plausibly follows the category
// of the word before it, not picked independently of it — the earlier,
// category-blind version could follow "am" with "do" and "fault" with
// "would", which reads as pure noise rather than an illustrative sentence.
// Same input + same step index always yields the same word — the seed is a
// hash of the sequence, never Math.random. No model runs here.
// ---------------------------------------------------------------------------

const CANNED_CONTINUATION = [
  'The', 'crew', 'logged', 'the', 'fault', 'and', 'restarted', 'it', '.',
]

const PERIOD = '.'

/** How many next-word candidates the stepper shows per step. */
export const CANDIDATE_COUNT = 4

const CONNECTOR_POOL = [...CONJUNCTIONS, 'then', 'while', 'after', 'before']
const VERB_POOL = [...COMMON_VERBS, 'logged', 'restarted', 'settled', 'reported', 'cleared']
const NOUN_POOL = ['crew', 'fault', 'signal', 'panel', 'record', 'value', 'state', 'line']
const FLAT_POOL = [...new Set([
  ...CONNECTOR_POOL, ...DETERMINERS, ...AUXILIARIES, ...VERB_POOL, ...NOUN_POOL,
])]

// Pronouns need subject/object case to match their slot — "took he" is as
// wrong as picking a verb after "the." Object position is after a verb or
// preposition; everywhere else (clause-initial) is subject position.
const SUBJ_PRONOUNS = ['it', 'he', 'she', 'they', 'we', 'i', 'you']
const OBJ_PRONOUNS = ['it', 'him', 'her', 'them', 'us', 'me', 'you']

// A coarse part-of-speech tag per category, and which categories can
// plausibly open the next slot after each one — "tie into the previous."
// START/PUNCT_END are the same case (sentence boundary) under two names.
// PRON has no fixed pool here — its case depends on the slot (see below).
const CATEGORY_POOLS = {
  DET: [...DETERMINERS],
  CONJ: CONNECTOR_POOL,
  PREP: [...PREPOSITIONS],
  AUX: [...AUXILIARIES],
  VERB: VERB_POOL,
  NOUN: NOUN_POOL,
}
const TRANSITIONS = {
  START: ['DET', 'PRON', 'NOUN', 'CONJ'],
  DET: ['NOUN'],
  PRON: ['AUX', 'VERB'],
  NOUN: ['VERB', 'AUX', 'PREP', 'CONJ'],
  VERB: ['DET', 'PRON', 'NOUN', 'PREP'],
  AUX: ['VERB', 'DET', 'NOUN'],
  PREP: ['DET', 'NOUN', 'PRON'],
  CONJ: ['DET', 'PRON', 'NOUN'],
  PART: ['CONJ', 'PREP', 'NOUN'],
  PUNCT_MID: ['DET', 'PRON', 'NOUN', 'CONJ'],
  PUNCT_END: ['DET', 'PRON', 'NOUN', 'CONJ'],
}

function isSentenceEnd(token) {
  return token === PERIOD || token === '!' || token === '?'
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/** Which of the categories above a token belongs to, for transition lookup. */
function categoryOf(token) {
  const lower = token.toLowerCase()
  if (isSentenceEnd(token)) return 'PUNCT_END'
  if (isPunct(token)) return 'PUNCT_MID'
  if (DETERMINERS.has(lower)) return 'DET'
  if (PRONOUNS.has(lower)) return 'PRON'
  if (CONJUNCTIONS.has(lower) || ['then', 'while', 'after', 'before'].includes(lower)) return 'CONJ'
  if (PREPOSITIONS.has(lower)) return 'PREP'
  if (AUXILIARIES.has(lower)) return 'AUX'
  if (PARTICLES.has(lower)) return 'PART'
  if (COMMON_VERBS.has(lower) || /(?:ing|ed)$/.test(lower)) return 'VERB'
  return 'NOUN' // unknown content words default to noun-ish — a safe object/subject slot
}

/** Tokens the reader supplied that are worth echoing back, as nouns. */
function echoPool(sequence) {
  return sequence.filter(
    (t) => !isPunct(t) && t.length >= 3 && !STOPWORDS.has(t.toLowerCase()),
  )
}

function tokensSinceSentenceEnd(generated) {
  let n = 0
  for (let i = generated.length - 1; i >= 0; i--) {
    if (isSentenceEnd(generated[i])) break
    n++
  }
  return n
}

/** True once the running illustrative sentence has gone long enough to close. */
function periodDue(baseTokens, generated) {
  const closed = generated.filter(isSentenceEnd).length
  const target = 6 + (hashString(`${baseTokens.join(' ')}#${closed}`, 3) % 4)
  return tokensSinceSentenceEnd(generated) >= target
}

/**
 * CANDIDATE_COUNT distinct plausible words for this position, each drawn
 * from a category that's a grammatical fit after the previous token —
 * "the" is followed only by noun candidates, "it" only by auxiliary/verb
 * candidates, and so on. Nothing here claims to be a real grammar; it's
 * just enough structure that the illustrative continuation reads as a
 * sentence instead of a word bag.
 */
function illustrativeWords(sequence, stepIndex) {
  const context = `${sequence.join(' ')}#${stepIndex}`
  // Do not offer a word the sequence just used — repeats read as a stuck loop.
  const recent = new Set(sequence.slice(-3).map((t) => t.toLowerCase()))
  const prevToken = sequence[sequence.length - 1]
  const prevCategory = prevToken === undefined ? 'START' : categoryOf(prevToken)
  const capital = prevToken === undefined || isSentenceEnd(prevToken)
  const allowedCats = TRANSITIONS[prevCategory] ?? TRANSITIONS.START

  // A pronoun slot right after a verb or preposition is an object; every
  // other pronoun slot is clause-initial, i.e. a subject.
  const pronounPool = ['VERB', 'PREP'].includes(prevCategory) ? OBJ_PRONOUNS : SUBJ_PRONOUNS

  const picks = []
  for (let s = 0; s < CANDIDATE_COUNT; s++) {
    const cat = allowedCats[hashString(context, 5 + s) % allowedCats.length]
    const pool = cat === 'PRON' ? pronounPool : (CATEGORY_POOLS[cat] ?? NOUN_POOL)
    picks.push(pool[hashString(context, 11 + s) % pool.length])
  }
  // Only echo the reader's own words into a slot where a noun fits.
  if (allowedCats.includes('NOUN')) {
    const echoes = echoPool(sequence)
    if (echoes.length > 0) {
      picks.push(echoes[hashString(context, 41) % echoes.length].toLowerCase())
    }
  }

  const seen = new Set()
  const out = []
  const take = (word) => {
    if (seen.has(word) || recent.has(word.toLowerCase())) return
    seen.add(word)
    out.push(word)
  }
  picks.forEach(take)
  // Backfill from the grammatical pool first, so a fallback still ties in.
  for (let i = 0; out.length < CANDIDATE_COUNT && i < NOUN_POOL.length; i++) {
    take(NOUN_POOL[(hashString(context, 61) + i) % NOUN_POOL.length])
  }
  for (let i = 0; out.length < CANDIDATE_COUNT && i < FLAT_POOL.length; i++) {
    take(FLAT_POOL[(hashString(context, 71) + i) % FLAT_POOL.length])
  }

  return capital ? out.map(capitalize) : out
}

function illustrativeScore(context, word) {
  return Math.round((0.4 + (hashString(`${context}|${word}`, 90) % 380) / 100) * 100) / 100
}

/** True when this step's winner comes from the canned continuation. */
export function isScriptedStep(baseTokens, generated) {
  return Boolean(
    isDefaultSequence(baseTokens) && CANNED_CONTINUATION[generated.length],
  )
}

/**
 * The next-word candidates for the coming STEP, highest score first.
 * Deterministic in (baseTokens, generated). Empty when nothing more will be
 * generated. Scores are illustrative; weights are the same softmax the
 * attention inspector uses, so the budget-of-1.0 reading carries over.
 */
export function nextCandidates(baseTokens, generated) {
  if (baseTokens.length === 0 || generated.length >= MAX_GENERATED) return []

  const sequence = [...baseTokens, ...generated]
  const stepIndex = generated.length
  const context = `${sequence.join(' ')}#${stepIndex}`

  const scripted = isScriptedStep(baseTokens, generated)
    ? CANNED_CONTINUATION[stepIndex]
    : null
  const forced = scripted ?? (periodDue(baseTokens, generated) ? PERIOD : null)

  let words = illustrativeWords(sequence, stepIndex)
  if (forced !== null) {
    words = [forced, ...words.filter((w) => w !== forced)].slice(0, CANDIDATE_COUNT)
  }

  const scores = words.map((word) => illustrativeScore(context, word))
  if (forced !== null) {
    const margin = 0.3 + (hashString(context, 77) % 60) / 100
    scores[0] = Math.round((Math.max(...scores) + margin) * 100) / 100
  }

  const weights = softmax(scores)
  return words
    .map((token, i) => ({ token, score: scores[i], weight: weights[i] }))
    .sort((a, b) => b.score - a.score)
    .map((row, i) => ({ ...row, wins: i === 0 }))
}

/** The token this STEP commits: the top-scoring candidate. */
export function nextToken(baseTokens, generated) {
  if (generated.length >= MAX_GENERATED) return null
  const candidates = nextCandidates(baseTokens, generated)
  return candidates.length > 0 ? candidates[0].token : null
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

// Hand-tuned raw Q-dot-K scores for the default sentence.
// Index = querying token position; array = one score per prior token.
// Row 4 ("it") is tuned so softmax gives engine 0.85, roared 0.10,
// and 0.03, The 0.02 — the numbers instrument C prints, FIG.5 on the page.
const DEFAULT_SCORE_TABLE = {
  1: [1.00],
  2: [0.40, 3.20],
  3: [0.20, 1.40, 2.60],
  4: [0.29, 4.04, 1.90, 0.69],
  5: [0.20, 2.90, 1.20, 0.60, 3.40],
  6: [0.10, 1.60, 0.90, 0.40, 1.90, 3.60],
  7: [0.10, 1.20, 0.80, 0.30, 1.10, 2.20, 2.80],
}

function nounishBonus(token, index) {
  if (isPunct(token)) return -1.2
  const lower = token.toLowerCase()
  let bonus = 0
  if (STOPWORDS.has(lower)) bonus -= 0.6
  else bonus += 0.9
  if (lower.length >= 6) bonus += 0.7
  else if (lower.length >= 4) bonus += 0.3
  if (index > 0 && /^[A-Z]/.test(token)) bonus += 0.8
  if (/(?:ing|ed)$/.test(lower)) bonus -= 0.3
  return bonus
}

function heuristicScores(tokens, queryIndex) {
  const scores = []
  for (let i = 0; i < queryIndex; i++) {
    const distance = queryIndex - i
    const recency = 2.2 / (1 + 0.55 * (distance - 1))
    scores.push(Math.round((recency + nounishBonus(tokens[i], i)) * 100) / 100)
  }
  return scores
}

export function rawScores(tokens, queryIndex) {
  if (queryIndex <= 0) return []
  const base = tokens.slice(0, DEFAULT_TOKENS.length)
  const onDefault = isDefaultSequence(base) && DEFAULT_SCORE_TABLE[queryIndex]
  if (onDefault) return DEFAULT_SCORE_TABLE[queryIndex].slice()
  return heuristicScores(tokens, queryIndex)
}

export function isHandTuned(tokens, queryIndex) {
  const base = tokens.slice(0, DEFAULT_TOKENS.length)
  return Boolean(isDefaultSequence(base) && DEFAULT_SCORE_TABLE[queryIndex])
}

export function softmax(scores) {
  if (scores.length === 0) return []
  const max = Math.max(...scores)
  const exps = scores.map((s) => Math.exp(s - max))
  const total = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / total)
}

/**
 * One head's view of one lookup. Returns a row per prior token, causal-masked
 * rows excluded (the UI renders those separately from `tokens`).
 */
export function attention(tokens, queryIndex) {
  const scores = rawScores(tokens, queryIndex)
  const weights = softmax(scores)
  return scores.map((score, i) => ({
    index: i,
    token: tokens[i],
    k: kDescriptor(tokens[i]),
    score,
    weight: weights[i],
  }))
}

export function topRow(rows) {
  if (rows.length === 0) return null
  return rows.reduce((best, r) => (r.weight > best.weight ? r : best), rows[0])
}

/** Where Instrument C should point when the sequence is first built. */
export function defaultQueryIndex(tokens) {
  if (isDefaultSequence(tokens)) return 4 // "it"
  return Math.max(0, tokens.length - 1)
}

// ---------------------------------------------------------------------------
// The glass pass (Instrument D)
//
// The lens asks, at each depth, what word the machine would commit to if the
// stack stopped there. Nothing here has a stack to stop, so the reading is
// built from its own answer backwards: the word the sequence actually commits
// to is the one the last row settles on, and the rows above walk that word up
// out of the noise while a handful of plausible neighbours fall away.
//
// Two rules hold it together. The last row must agree with instrument B —
// they are the same claim about the same position, and a page that disagrees
// with itself teaches nothing. And the trace, which is one word priced at
// every depth, must be the same number as that word's bar wherever the word
// appears in a row, so the reader can check the story against itself.
// ---------------------------------------------------------------------------

// How the winner's share climbs, depth by depth, and how high the crowd it
// climbs past sits. Early on the winner is nowhere near the shortlist; by the
// fourth stop it is in it; by the last it owns half the budget on show.
const LENS_RAMP = [0.005, 0.012, 0.028, 0.058, 0.17, 0.34, 0.55]
const LENS_CROWD = [0.052, 0.05, 0.049, 0.062, 0.058, 0.05, 0.044]

// What an early depth is full of: the words that are common everywhere and
// therefore mean nothing in particular here.
const LENS_FUNCTION_WORDS = [
  'the', 'and', 'of', 'to', 'in', 'a', 'that', 'is',
  'it', 'for', 'was', 'with', 'as', 'on',
]

// Hand-tuned readings for the two positions of the default sentence a reader
// is most likely to open: the pronoun instrument C is already pointed at, and
// the full stop the panel opens on. Keyed by position, with the word each one
// resolves to, so a table can never be shown against a sequence that would
// resolve to something else.
const LENS_TUNED = {
  4: {
    target: 'shut',
    trace: [0.005, 0.009, 0.024, 0.061, 0.17, 0.35, 0.52],
    rows: [
      [['is', 0.049], ['was', 0.041], ['has', 0.033], ['and', 0.027]],
      [['was', 0.052], ['is', 0.043], ['had', 0.031], ['would', 0.026]],
      [['was', 0.058], ['had', 0.04], ['started', 0.03], ['would', 0.025]],
      [['was', 0.066], ['shut', 0.061], ['started', 0.038], ['had', 0.029]],
      [['shut', 0.17], ['was', 0.062], ['started', 0.041], ['died', 0.03]],
      [['shut', 0.35], ['was', 0.05], ['started', 0.037], ['died', 0.028]],
      [['shut', 0.52], ['was', 0.043], ['started', 0.031], ['stopped', 0.024]],
    ],
  },
  7: {
    target: 'The',
    trace: [0.006, 0.011, 0.028, 0.071, 0.19, 0.38, 0.57],
    rows: [
      [[',', 0.05], ['and', 0.041], ['of', 0.032], ['in', 0.027]],
      [['and', 0.048], ['in', 0.039], ['a', 0.031], ['of', 0.026]],
      [['and', 0.052], ['a', 0.041], ['it', 0.033], ['in', 0.028]],
      [['a', 0.082], ['The', 0.071], ['and', 0.044], ['it', 0.03]],
      [['The', 0.19], ['a', 0.07], ['and', 0.05], ['It', 0.036]],
      [['The', 0.38], ['a', 0.06], ['It', 0.044], ['and', 0.033]],
      [['The', 0.57], ['a', 0.05], ['It', 0.038], ['They', 0.026]],
    ],
  },
}

/** The word this position resolves to — what the last row has to agree with. */
function lensTarget(baseTokens, generated, index) {
  const sequence = [...baseTokens, ...generated]
  if (index < sequence.length - 1) return sequence[index + 1]
  // The last position is the one instrument B is about to fill, so its answer
  // is instrument B's answer. Past the generation cap B has no answer to
  // agree with, and the shortlist it would have offered stands in.
  const committed = nextToken(baseTokens, generated)
  return committed ?? illustrativeWords(sequence, generated.length)[0]
}

/** True when this reading comes from the hand-tuned table rather than a hash. */
export function isHandTunedLens(baseTokens, generated, index) {
  const entry = LENS_TUNED[index]
  if (!entry || !isDefaultSequence(baseTokens)) return false
  return lensTarget(baseTokens, generated, index) === entry.target
}

function lensJitter(context, salt) {
  return 0.85 + (hashString(context, salt) % 30) / 100
}

/** The crowd one depth's winner has to climb past. Never repeats the winner. */
function lensCrowd(sequence, index, stop, target, context) {
  // Deep enough in, the crowd is words that would actually fit the slot;
  // early on it is whatever is common in the language.
  const pool =
    stop >= 3
      ? illustrativeWords(sequence.slice(0, index + 1), index)
      : LENS_FUNCTION_WORDS
  const seen = new Set([target.toLowerCase()])
  const out = []
  const draw = (from, salt) => {
    const offset = hashString(context, salt + stop)
    for (let i = 0; out.length < CANDIDATE_COUNT && i < from.length; i++) {
      const word = from[(offset + i) % from.length]
      if (seen.has(word.toLowerCase())) continue
      seen.add(word.toLowerCase())
      out.push(word)
    }
  }
  draw(pool, 130)
  draw(LENS_FUNCTION_WORDS, 150)
  draw(NOUN_POOL, 170)
  return out
}

/**
 * The whole reading for one position: seven shortlists, and the winner's
 * share at each of the seven depths. Deterministic in the sequence and the
 * position. Every number is illustrative and the panel says so.
 *
 * @param {string[]} baseTokens
 * @param {string[]} generated
 * @param {number} index
 */
export function illustrativeLens(baseTokens, generated, index) {
  const sequence = [...baseTokens, ...generated]
  if (sequence.length === 0 || index < 0 || index >= sequence.length) return null

  const target = lensTarget(baseTokens, generated, index)
  const tuned = isHandTunedLens(baseTokens, generated, index)
  if (tuned) {
    const entry = LENS_TUNED[index]
    return {
      target,
      tuned: true,
      trace: entry.trace.slice(),
      stops: entry.rows.map((row) =>
        row.map(([token, weight], rank) => ({ token, weight, wins: rank === 0 })),
      ),
    }
  }

  const context = `${sequence.slice(0, index + 1).join(' ')}#${index}`
  const trace = LENS_RAMP.map((share, stop) =>
    Math.round(share * lensJitter(context, 210 + stop) * 1000) / 1000,
  )
  const stops = trace.map((share, stop) => {
    const top = LENS_CROWD[stop] * lensJitter(context, 190 + stop)
    const rows = lensCrowd(sequence, index, stop, target, context).map(
      (token, rank) => ({
        token,
        weight: Math.round(top * (1 - 0.14 * rank) * 1000) / 1000,
      }),
    )
    rows.push({ token: target, weight: share })
    rows.sort((a, b) => b.weight - a.weight)
    return rows
      .slice(0, CANDIDATE_COUNT)
      .map((row, rank) => ({ ...row, wins: rank === 0 }))
  })
  return { target, tuned: false, trace, stops }
}
