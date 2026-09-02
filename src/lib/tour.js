// Instrument F — the narrated run, and the words the drawing says about itself.
//
// The drawing this belongs to used to replay itself in about a second: seven
// opacity delays, one per depth, and it was over before a reader had found
// where to look. This file is the other half of the answer to that. It turns
// one pass into a staged tour at reading speed — thirty-odd stops, each with
// a line of plain words and the pass’s own numbers in it — and it is also the
// single source of the sentences the sheet says when a reader clicks a
// carrier, a wall cell, a landing ray or one of the two plates. The tour and
// the click-readouts say the same things because they are written here once.
// Each of those sentences comes in two lengths — a LEAD and a detail — and
// what a card on the drawing prints is always the lead of what the readout
// row under it prints in full, so the two can never drift apart.
//
// The honesty law does not bend for any of it. Every number a caption speaks
// is read out of the objects instrument F already has on screen — the same
// arrays it publishes to `__mapState` — or out of the file’s own manifest.
// Where a mode genuinely has no number, the caption says so and says what to
// do about it. Motion may dramatise the timing of a pass. It may not invent a
// single value.
//
// Nothing here renders. It returns data; ForwardMap.jsx draws it.

import { REAL_HEADS, REAL_LAYERS } from './realModel.js'
import { MAP_STOPS, TRANSFER_FLOOR, headOutwardShares } from './forwardMap.js'

/** How long the sheet has to be left alone before it starts running itself. */
export const IDLE_MS = 20000

const w4 = (v) => v.toFixed(4)
const n2 = (v) => v.toFixed(2)
const pc = (v) => `${(v * 100).toFixed(1)}%`
const q = (t) => `“${t}”`

/**
 * The tempo of the drawing.
 *
 * Motion cannot be judged from a still, so arc 5 built three studies of it and
 * put them behind `?motion=a|b|c` for Bill to pick from — how long a stop
 * dwells, how much is said at each one, how much the sheet moves when it is
 * left alone. He ruled on 2026-09-01: the measured docent wins. Every transfer
 * and every landing bar gets its own stop, and the ambient loop is slow and
 * sparse. These are that study's own numbers, now the drawing's only ones —
 * the two losers and the switch that chose between them are gone.
 */
export const MOTION = {
  // A reveal cross-fade, and the share of a fall stop spent travelling.
  fadeMs: 620,
  travel: 0.72,
  ambient: {
    sweepMs: 11000,
    sweepOpacity: 0.06,
    glintOpacity: 0.1,
    carrierMs: 9000,
    breatheMs: 8000,
    heroMs: 6500,
  },
}

// ---------------------------------------------------------------------------
// The sentences the sheet says about itself
// ---------------------------------------------------------------------------

/**
 * Why a block drew nothing.
 *
 * The plate on the drawing says `no transfer · self 0.59` and has never said
 * what that means. This is what it means, in the legend’s own voice, and the
 * tour’s caption for that block is the same string — the two cannot
 * contradict each other because there is only one of them.
 */
export function silentLead(reg) {
  if (!reg) return ''
  return (
    `Block ${reg.layer} draws no transfer: in its chosen head the hero sent ${w4(reg.selfWeight)} of its ` +
    `attention straight back to itself.`
  )
}

export function silentDetail(reg, sequence) {
  if (!reg) return ''
  const best = reg.best
    ? `Its best other source, ${q(sequence[reg.best.src])} at ${w4(reg.best.w)}, is under the floor of ${TRANSFER_FLOOR}`
    : 'It has no other source to draw: the hero is the first piece, and the first piece can only read itself'
  return (
    `Self-attention is not a transfer — it is the stream continuing, and the stream is already drawn. ` +
    `${best}. Nothing was lowered to manufacture a carrier.`
  )
}

export function silentWhy(reg, sequence) {
  if (!reg) return ''
  return `${silentLead(reg)} ${silentDetail(reg, sequence)}`
}

/** What the aperture plate means. Shared by its click readout and the tour. */
export function unembedLead() {
  return 'UNEMBED · WTEᵀ — the word table, turned on its side.'
}

export function unembedDetail(vocab = 50257) {
  return (
    `The last position’s 768 numbers are scored against all ${vocab.toLocaleString('en-US')} words at once, and ` +
    `the table doing the scoring is the same wte that turned words into vectors at the rim, transposed. This file ` +
    `has no separate output matrix: the two ends of the pass share one table, which is why this plate opens the ` +
    `same tensor the rim uses.`
  )
}

export function unembedWhy(vocab = 50257) {
  return `${unembedLead()} ${unembedDetail(vocab)}`
}

/**
 * What one carrier is, in plain words, with its own weight in it.
 *
 * Split the way every other answer on this sheet is split: a lead that names
 * the thing and gives its number, and a detail that says what the number
 * means. The card that opens beside a click shows the lead; the readout row
 * under the drawing shows both. Two lengths of one sentence, written once, so
 * the card, the row and the tour cannot drift apart.
 */
export function carrierLead(tr, sequence, heroToken) {
  return (
    `Carrier — block ${tr.layer}, head ${tr.head}. Reading the sentence up to here, this head matched the ` +
    `hero’s question against ${q(sequence[tr.src])}’s key and carried ${w4(tr.w)} of that piece’s value into ` +
    `${q(heroToken)}’s own stream.`
  )
}

export function carrierDetail() {
  return (
    `The weight is one number out of the block’s attention softmax at the hero’s row; the carrier’s width and ` +
    `light are that number, and the hero runs brighter below where it lands.`
  )
}

export function carrierWhy(tr, sequence, heroToken) {
  return `${carrierLead(tr, sequence, heroToken)} ${carrierDetail()}`
}

/** What one landing ray is. */
export function rayLead(bar, argmaxToken, pickToken) {
  const role = bar.argmax
    ? ' It is the machine’s own top — the largest of all 50,257 — and is drawn blue.'
    : bar.pick
      ? ' It is what the sampler took, and it carries the amber mark.'
      : argmaxToken
        ? ` The machine’s own top is ${q(argmaxToken)}; the sampler took ${q(pickToken ?? '—')}.`
        : ''
  return `Landing ray — ${q(bar.token)} at ${pc(bar.p)}.${role}`
}

export function rayDetail() {
  return (
    `The ray is one word’s share of a softmax over the whole vocabulary, counted from the last position’s ` +
    `vector and from no other. The bar’s height is that share against the tallest bar, and the rows of dots ` +
    `are how the height is counted, so read the number rather than the dots.`
  )
}

export function rayWhy(bar, argmaxToken, pickToken) {
  return `${rayLead(bar, argmaxToken, pickToken)} ${rayDetail()}`
}

/** What one wall cell is: this byte, this weight, this position in the tensor. */
export function cellLead(cell) {
  const { value, weight, row, col, tensor, scale, zeroPoint, totalRows, totalCols } = cell
  // The 2,304 columns of c_attn are the query, the key and the value
  // projections laid side by side, in that order — so a column number says
  // which of the three a weight belongs to. That is the file’s own layout.
  const third = col < totalCols / 3 ? 'query' : col < (2 * totalCols) / 3 ? 'key' : 'value'
  // The byte on disk and the number it stands for are two different things,
  // and the page says so everywhere else: this tensor is i8 at zero point 0,
  // so the stored byte 236 is the quantised value −20. A readout that called
  // −20 "the byte" would contradict the legend two inches above it.
  const byte = value < 0 ? value + 256 : value
  const asStored = byte === value ? '' : `, which the file stores as the byte ${byte}`
  return (
    `Wall cell — [${row}, ${col}] of ${tensor} [${totalRows}×${totalCols}], quantised value ${value}${asStored}. ` +
    `The file holds this tensor as i8 at zero point ${zeroPoint}, so the weight is scale · (q − zp) = ` +
    `${scale.toPrecision(3)} · (${value} − ${zeroPoint}) = ${weight.toPrecision(4)}. Column ${col} of ${totalCols} ` +
    `falls in the ${third} projection.`
  )
}

export function cellDetail() {
  return 'Brightness is the size of the weight, not its sign, and no pass changes it.'
}

export function cellWhy(cell) {
  return `${cellLead(cell)} ${cellDetail()}`
}

// ---------------------------------------------------------------------------
// The tour
// ---------------------------------------------------------------------------

/**
 * One stop of the tour.
 *
 * `reveal` is the whole state of the drawing at that stop rather than a change
 * to it, so stepping backwards is the same operation as stepping forwards and
 * the reduced-motion stepper is the same code as the played tour:
 *
 *   segs      how many of the fall’s segments have arrived (0 = none)
 *   carriers  how many transfers have fired, in the drawing’s own order
 *   bars      how many landing bars have been counted
 *   cue       the block to look at, lit at its frame, or null
 *   aperture  whether the unembedding plate is drawn
 *   pick      whether the sampler’s mark is drawn
 */
function stage(kind, ms, lead, detail, reveal) {
  // Two lengths of the same sentence, never two different sentences. The lead
  // is what a phone's caption has room for, and it is also what the docent's
  // card on the drawing prints; the wider settings' caption gets the lead and
  // the detail together. Splitting rather than rewriting is what keeps the
  // short form from quietly saying something the long one does not — the same
  // rule the click readouts follow, where a card prints the lead and the row
  // under the drawing prints both.
  return { kind, ms, lead, caption: detail ? `${lead} ${detail}` : lead, reveal }
}

/**
 * Build the whole tour for what is on screen now.
 *
 * Everything it says comes in through this one argument: the norms field, the
 * per-block registers, the splash, the file’s own wall reading. Nothing is
 * fetched and nothing is recomputed from the model — if instrument F cannot
 * see a number, the tour cannot speak it.
 *
 * How many stops that comes to is a fact about the screen as well as about the
 * sentence, because the landing is counted one bar at a time and the phone
 * draws six bars where the wider settings draw eight: 35 stops in real mode on
 * the default sentence above 640 px and 33 at or below it, 19 in either
 * setting with no pass to speak of. Nothing may state that count as a
 * constant — every place the drawing says it reads `stages.length`, and the
 * one caption that names how many bars are coming is handed `splashN`.
 */
export function buildTour({
  live,
  n,
  sequence,
  hero,
  field,
  run,
  registers,
  autoHeads,
  splash,
  finalTop,
  nextToken,
  decoding,
  wall0,
  segmentCount,
  splashN,
}) {
  const stages = []
  const heroToken = sequence[hero] ?? '—'
  const lastSeg = segmentCount ?? MAP_STOPS + 1
  // Every reveal below is written out of this running state, so a stage can
  // never claim to show something an earlier stage had not reached.
  const at = (over) => ({
    segs: 0, carriers: 0, bars: 0, cue: null, aperture: false, pick: false, ...over,
  })

  if (n === 0) {
    const only = stage(
      'empty',
      4000,
      'There is nothing to run: the box in instrument A is empty.',
      'Type a sentence and the streams appear.',
      at({ segs: lastSeg, carriers: 99, bars: 99, aperture: true, pick: true }),
    )
    return { stages: [only], totalMs: only.ms }
  }

  // --- the sentence ---------------------------------------------------------
  // The opening stop says the analogy the essay's own section title makes —
  // weights are the tooling, activations are the workpiece — because the
  // drawing is that sentence drawn, and it used to name neither half.
  const shown = sequence.slice(0, 3).map(q).join(', ')
  const rest = n > 3 ? `, and ${n - 3} more` : ''
  stages.push(
    stage(
      'sentence',
      4000,
      `The walls are the fixture and your sentence is the part falling through it: ${n} ` +
        `piece${n === 1 ? '' : 's'}, one of them the hero — ${q(heroToken)} at position ${hero}.`,
      `The pieces are ${shown}${rest}, and each gets a stream of its own. Everything the tour draws from here ` +
        `is aimed at the hero's stream, and clicking a different chip re-aims the whole drawing.`,
      at({}),
    ),
  )

  // --- the rim --------------------------------------------------------------
  let widest = '—'
  let widestV = 0
  if (field) {
    for (let i = 0; i < n; i++) {
      if (field.rows[i][0] > widestV) {
        widestV = field.rows[i][0]
        widest = sequence[i]
      }
    }
  }
  stages.push(
    stage(
      'embed',
      4400,
      live
        ? `Each piece becomes 768 numbers — its row of the word table (WTE) plus its row of the position table ` +
            `(WPE) — and at the rim the hero’s are ${n2(field.rows[hero][0])} long.`
        : `Each piece becomes 768 numbers: its row of the word table (WTE) plus its row of the position table ` +
            `(WPE).`,
      live
        ? `That sum is the stream. The longest here is ${q(widest)} at ${n2(widestV)} — usually the first piece, ` +
            `which carries the attention sink. Width, light and grain are that length, on one log law shared by ` +
            `all ${n} streams.`
        : `No pass has run, so the drawing has no length to draw: every stream is at one width and one light, and ` +
            `the grain inside it is the deterministic stand-in instrument D prints. Load the real model above and ` +
            `these become this sentence’s own numbers.`,
      at({ segs: 1 }),
    ),
  )

  // --- the six blocks -------------------------------------------------------
  let carriers = 0
  for (let l = 0; l < REAL_LAYERS; l++) {
    const reg = registers?.[l] ?? null
    const head = autoHeads?.[l] ?? null
    const before = field ? field.rows[hero][l] : null
    const after = field ? field.rows[hero][l + 1] : null
    const dir = before != null && after != null ? (after >= before ? 'up from' : 'down from') : ''
    const wallLine = wall0
      ? `The wall is ${(wall0.rows * wall0.cols).toLocaleString('en-US')} real bytes of that block’s own attn.c_attn.weight, and the pass does not change one of them.`
      : ''
    const share = live && run ? headOutwardShares(run, l, hero)?.[head] ?? null : null

    const fallLead = live
      ? `The streams fall through block ${l}, and the hero’s vector leaves it ${n2(after)} long, ${dir} ${n2(before)}.`
      : `The streams fall through block ${l}.`
    const fallDetail = live
      ? `${wallLine} A block writes its result back into the same running vector, so the seven stops are seven ` +
        `readings of one thing rather than seven different things.`
      : `${wallLine} What the block does to the vector needs a pass: without one there is no length to read, so ` +
        `the stream leaves the wall exactly as wide as it entered.`

    const headLead =
      live && head != null
        ? `Block ${l} is read from head ${head} of ${REAL_HEADS}, where the hero spends ` +
          `${share != null ? pc(share) : '—'} of its attention on something other than itself.`
        : `Attention needs a pass, so no head is chosen here yet.`
    const headDetail =
      live && head != null
        ? `That is the head sending the most attention away from the first piece and away from itself — the rule ` +
          `the legend states, and the one the HEAD chips overrule.`
        : `With the real model in hand each block picks the head that sends the most attention away from the ` +
          `first piece and away from itself, and draws the hero’s own sources from it.`

    stages.push(
      stage('fall', 3000, fallLead, fallDetail, at({ segs: l + 2, carriers, cue: l })),
    )
    stages.push(
      stage('head', 3000, headLead, headDetail, at({ segs: l + 2, carriers, cue: l })),
    )

    if (!live) {
      if (l === 0) {
        stages.push(
          stage(
            'nopass',
            4200,
            `There is no attention to draw without a pass, so no carrier is drawn anywhere on this sheet.`,
            `The walls below are still the file’s own bytes — they are real in both modes — but the green keys, ` +
              `the amber carriers and the landing all wait on the model. Load it above and this same tour speaks ` +
              `this sentence’s own weights.`,
            at({ segs: l + 2, cue: l }),
          ),
        )
      }
      continue
    }

    const kept = reg?.kept ?? []
    if (kept.length === 0) {
      stages.push(
        stage(
          'silent',
          4200,
          silentLead(reg),
          silentDetail(reg, sequence),
          at({ segs: l + 2, carriers, cue: l }),
        ),
      )
    } else {
      kept.forEach((source, i) => {
        carriers += 1
        const lead =
          i === 0
            ? `Block ${l}, head ${head} — ${q(sequence[source.src])} hands the hero ${w4(source.w)} of its value.`
            : `And ${q(sequence[source.src])} hands it ${w4(source.w)} as well.`
        const detail =
          i === 0
            ? `The green tick is the key that matched; the amber carrier’s width and light are that weight; the ` +
              `bloom is where the hero takes it in, and the hero runs brighter below it.`
            : `A block draws at most two, and only sources at or above ${TRANSFER_FLOOR} — everything under the ` +
              `floor is left out rather than drawn faint.`
        stages.push(stage('transfer', 3400, lead, detail, at({ segs: l + 2, carriers, cue: l })))
      })
    }
  }

  // --- the mist and ln_f ----------------------------------------------------
  stages.push(
    stage(
      'tail',
      3800,
      `Below the last wall every stream fades into the mist but one: the last position’s, because the landing is ` +
        `counted from that vector and from no other.`,
      `One thing happens to it that the drawing does not stop at — ln_f, the final normalisation, which rescales ` +
        `the vector before it meets the word table. The seven stops above are the stream entering block 0 and ` +
        `leaving each of the six.`,
      at({ segs: lastSeg, carriers, cue: null }),
    ),
  )

  // --- the unembedding ------------------------------------------------------
  stages.push(
    stage(
      'unembed',
      4400,
      unembedLead(),
      unembedDetail(),
      at({ segs: lastSeg, carriers, aperture: true }),
    ),
  )

  // --- the landing ----------------------------------------------------------
  if (!live || !splash) {
    stages.push(
      stage(
        'noland',
        4000,
        `There is no distribution without a pass, so no bar is drawn.`,
        `With the real model in hand these become this sentence’s own softmax over the whole vocabulary, the ` +
          `tallest ${splashN} of them, with the machine’s own top drawn blue and the sampler’s pick marked in ` +
          `amber.`,
        at({ segs: lastSeg, carriers, aperture: true }),
      ),
    )
  } else {
    splash.forEach((candidate, i) => {
      const isArgmax = finalTop && candidate.id === finalTop.id
      const lead =
        i === 0
          ? `The landing, counted one word at a time. The tallest of all 50,257 is ${q(candidate.token)} at ` +
            `${pc(candidate.p)}${isArgmax ? ', which is the machine’s own top and is drawn blue' : ''}.`
          : `${q(candidate.token)} at ${pc(candidate.p)}.`
      const detail =
        i === 0
          ? `A bar’s height is its probability; the rows of dots are how that height is counted.`
          : ''
      stages.push(
        stage('bar', i === 0 ? 3400 : 1600, lead, detail, at({
          segs: lastSeg, carriers, bars: i + 1, aperture: true,
        })),
      )
    })
  }

  // --- the sampler ----------------------------------------------------------
  if (live && splash) {
    const picked = splash.find((s) => s.token === nextToken)
    stages.push(
      stage(
        'pick',
        4200,
        `The sampler took ${q(nextToken ?? '—')}${picked ? ` at ${pc(picked.p)}` : ''}.`,
        `Temperature ${decoding.temperature}, top-k ${decoding.topK}, repetition penalty ` +
          `${decoding.repetitionPenalty}, seed ${decoding.seed}. Blue is what the machinery scored highest; amber ` +
          `is what the draw actually took. Same sentence, same seed, same word, every time.`,
        at({ segs: lastSeg, carriers, bars: splash.length, aperture: true, pick: true }),
      ),
    )
  }

  // --- the end --------------------------------------------------------------
  stages.push(
    stage(
      'done',
      5000,
      live
        ? `That is one pass: the file frozen, one sentence moving through it, one next word.`
        : `That is the shape of one pass, with the walls real and the fall a schematic.`,
      live
        ? `Nothing above ran twice and nothing was smoothed on the way to the screen. Press play to run it again, ` +
          `step back through it, or click anything on the sheet — a carrier, a ray, a wall cell — and it will say ` +
          `what it is.`
        : `Load the real model above and the same tour speaks this sentence’s own numbers at every stop.`,
      at({ segs: lastSeg, carriers, bars: splash ? splash.length : 0, aperture: true, pick: true }),
    ),
  )

  const totalMs = stages.reduce((sum, s) => sum + s.ms, 0)
  return { stages, totalMs }
}
