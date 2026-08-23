// Instrument F — the numbers behind the drawing.
//
// The map has two halves and this file is both of them.
//
// The machinery half is static: distilgpt2's architecture, named part by part
// with the shape, dtype and byte count each part actually occupies in the
// file. None of that is written out by hand here — it is read out of
// `fileFacts.json`, the same reading instrument E draws, so a part whose shape
// is printed on the map is a part the file really holds at that size. If the
// file ever changed, the drawing would change with it or say it could not find
// the tensor.
//
// The moving half is three scalars per pass, and each of them is a plain
// reduction of a tensor the forward pass already produced. Nothing is
// smoothed, rescaled or invented on the way to the screen:
//
//   the stop values   the L2 norm of one token's 768-wide running vector at
//                     each of the seven depths — how much vector there is at
//                     that stop, which is the honest thing a single number
//                     can say about a point in the residual stream;
//   the arc weights   the selected token's attention row at the selected
//                     layer, averaged across the twelve heads;
//   the head values   the share of that token's attention, in each head, that
//                     lands on a token other than itself — one minus the
//                     diagonal. A head that only reads itself scores zero; a
//                     head that spends everything looking backwards scores
//                     one. It is the cheapest scalar that separates the heads
//                     doing lookup work from the heads passing the token
//                     through, and it costs one array read per head.
//
// The last of those is a choice among several defensible ones, so the legend
// on the screen names it rather than leaving the reader to guess what a lit
// square means.

import {
  REAL_HEADS,
  REAL_HIDDEN,
  REAL_LAYERS,
  RESIDUAL_STOPS,
  tokenText,
} from './realModel.js'
import { LENS_STOPS, residualVector } from './toyModel.js'

/** How many depths the map draws a node at. Seven, for six blocks. */
export const MAP_STOPS = RESIDUAL_STOPS

// ---------------------------------------------------------------------------
// The machinery, band by band
// ---------------------------------------------------------------------------

const block = (layer) => ({
  key: `block${layer}`,
  layer,
  label: `block ${layer}`,
  short: `b${layer}`,
  // The stop this band's node row reads: the stream as it leaves this block.
  stop: layer + 1,
  parts: [
    {
      id: 'ln_1',
      label: 'ln_1',
      tensor: `transformer.h.${layer}.ln_1.weight`,
      width: 1,
      cwidth: 1.4,
    },
    {
      id: 'attn',
      label: `attention · ${REAL_HEADS} heads`,
      short: 'attn',
      tensor: `transformer.h.${layer}.attn.c_attn.weight_quantized`,
      width: 4,
      cwidth: 3.7,
      heads: true,
      window: 'attention',
    },
    {
      id: 'ln_2',
      label: 'ln_2',
      tensor: `transformer.h.${layer}.ln_2.weight`,
      width: 1,
      cwidth: 1.4,
    },
    {
      id: 'mlp',
      label: `MLP ${REAL_HIDDEN}→${REAL_HIDDEN * 4}→${REAL_HIDDEN}`,
      short: 'mlp',
      tensor: `transformer.h.${layer}.mlp.c_fc.weight_quantized`,
      width: 4,
      cwidth: 3.5,
    },
  ],
})

/**
 * The bands of the drawing, top to bottom: what the sentence passes through,
 * in the order it passes through it.
 */
export const BANDS = [
  {
    key: 'embed',
    label: 'embed',
    short: 'emb',
    stop: 0,
    parts: [
      {
        id: 'wte',
        label: 'wte · one row per token',
        short: 'wte',
        tensor: 'transformer.wte.weight_quantized',
        width: 1,
        window: 'tokenizer',
      },
      {
        id: 'wpe',
        label: 'wpe · one row per position',
        short: 'wpe',
        tensor: 'transformer.wpe.weight_quantized',
        width: 1,
      },
    ],
  },
  ...Array.from({ length: REAL_LAYERS }, (_, layer) => block(layer)),
  {
    key: 'unembed',
    label: 'unembed',
    short: 'out',
    stop: null,
    parts: [
      { id: 'ln_f', label: 'ln_f', tensor: 'transformer.ln_f.weight', width: 2 },
      {
        id: 'unembed',
        label: 'unembed — wteᵀ, tied',
        short: 'unembed',
        tensor: 'transformer.wte.weight_quantized',
        width: 5,
        tie: true,
        window: 'glass',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Reading the file's own manifest
// ---------------------------------------------------------------------------

const count = (n) => n.toLocaleString('en-US')
const bytes = (n) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : n >= 1e3 ? `${Math.round(n / 1e3)} KB` : `${n} B`
const trim = (name) =>
  name.replace(/^transformer\./, '').replace(/_quantized$/, '')
const sig = (v, digits) => Number(v.toPrecision(digits)).toString()

/**
 * One tensor as the map needs it: its printable name, shape, dtype, size, and
 * — where the file stores it as bytes rather than as decimals — the two
 * numbers that turn a byte back into a weight.
 */
export function tensorFacts(manifest, name) {
  if (!manifest) return null
  const byName = manifest.__byName ?? new Map(manifest.tensors.map((t) => [t.name, t]))
  if (!manifest.__byName) manifest.__byName = byName
  const entry = byName.get(name)
  if (!entry) return null
  const stem = name.endsWith('_quantized') ? name.slice(0, -'_quantized'.length) : null
  const scale = stem ? byName.get(`${stem}_scale`) : null
  const zero = stem ? byName.get(`${stem}_zero_point`) : null
  return {
    name,
    display: trim(name),
    dims: entry.dims,
    shape: entry.dims.length > 0 ? `[${entry.dims.join('×')}]` : '[scalar]',
    dtype: entry.dtype,
    byteLength: entry.byteLength,
    size: bytes(entry.byteLength),
    scale: scale ? scale.value : null,
    zeroPoint: zero ? zero.value : null,
  }
}

/** The full readout under the screen, when a steel box is clicked. */
export function partReadout(facts) {
  if (!facts) return 'no tensor selected — click any steel box'
  const parts = [
    `${facts.display} ${facts.shape} ${facts.dtype}`,
  ]
  if (facts.scale != null && facts.zeroPoint != null) {
    parts.push(`scale ${sig(facts.scale, 3)}`, `zero point ${facts.zeroPoint}`)
  }
  parts.push(`${count(facts.byteLength)} bytes`)
  return parts.join(' · ')
}

/** The status note, derived from the file rather than typed out. */
export function architectureNote(manifest) {
  if (!manifest) return `real distilgpt2 · ${REAL_LAYERS} blocks · ${REAL_HEADS} heads · d ${REAL_HIDDEN}`
  return (
    `real distilgpt2 · ${REAL_LAYERS} blocks · ${REAL_HEADS} heads · ` +
    `d ${REAL_HIDDEN} · ${(manifest.parameters / 1e6).toFixed(1)}M parameters`
  )
}

// ---------------------------------------------------------------------------
// The moving half
// ---------------------------------------------------------------------------

/** The L2 norm of one row of a [1, n, width] block. */
function normAt(data, index, width) {
  let sum = 0
  const base = index * width
  for (let d = 0; d < width; d++) {
    const v = data[base + d]
    sum += v * v
  }
  return Math.sqrt(sum)
}

/**
 * Every token's running vector at every depth, as one number each: an
 * n × 7 matrix of norms, plus the range they span, which is what the legend
 * prints and what the brightness of a node is measured against.
 */
export function residualField(run) {
  if (!run?.residuals?.length || run.n === 0) return null
  const rows = []
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i < run.n; i++) {
    const row = new Float64Array(MAP_STOPS)
    for (let s = 0; s < MAP_STOPS; s++) {
      const value = normAt(run.residuals[s], i, REAL_HIDDEN)
      row[s] = value
      if (value < lo) lo = value
      if (value > hi) hi = value
    }
    rows.push(row)
  }
  return { rows, lo, hi, real: true }
}

/**
 * The same field, illustratively: the norm of the deterministic stand-in
 * vector instrument D already prints six numbers of, taken over enough
 * dimensions to give the number somewhere to move. No model is running, and
 * the legend says so.
 */
export function illustrativeField(sequence) {
  if (sequence.length === 0) return null
  const rows = []
  let lo = Infinity
  let hi = -Infinity
  for (const token of sequence) {
    const row = new Float64Array(LENS_STOPS)
    for (let s = 0; s < LENS_STOPS; s++) {
      const vec = residualVector(token, s, 24)
      let sum = 0
      for (const v of vec) sum += v * v
      const value = Math.sqrt(sum)
      row[s] = value
      if (value < lo) lo = value
      if (value > hi) hi = value
    }
    rows.push(row)
  }
  return { rows, lo, hi, real: false }
}

/**
 * The selected token's attention row at one layer, averaged over the twelve
 * heads — what the arcs are drawn from. Positions after the query are zero by
 * the causal mask and are not returned.
 */
export function headAverageRow(run, layer, index) {
  if (!run?.attention?.length || run.n === 0) return null
  const n = run.n
  const q = Math.min(Math.max(index, 0), n - 1)
  const data = run.attention[Math.min(Math.max(layer, 0), REAL_LAYERS - 1)]
  const out = new Float64Array(q + 1)
  for (let h = 0; h < REAL_HEADS; h++) {
    const base = (h * n + q) * n
    for (let i = 0; i <= q; i++) out[i] += data[base + i]
  }
  for (let i = 0; i <= q; i++) out[i] /= REAL_HEADS
  return out
}

/**
 * Per head, the share of the selected token's attention that goes anywhere
 * other than itself. The first token of a sequence can only read itself, so
 * every head scores exactly zero there — which is correct, and worth seeing.
 */
export function headOutwardShares(run, layer, index) {
  if (!run?.attention?.length || run.n === 0) return null
  const n = run.n
  const q = Math.min(Math.max(index, 0), n - 1)
  const data = run.attention[Math.min(Math.max(layer, 0), REAL_LAYERS - 1)]
  const out = new Float64Array(REAL_HEADS)
  for (let h = 0; h < REAL_HEADS; h++) {
    out[h] = 1 - data[(h * n + q) * n + q]
  }
  return out
}

/**
 * The top of the pass's own final logits, at the last position.
 *
 * Not `run.candidates[0]`. That shortlist is instrument B's, and B skips
 * tokens whose text is nothing but whitespace, along with <|endoftext|> —
 * deliberately, because greedy distilgpt2 on a short prompt collapses into
 * predicting a newline forever and that reads as a broken instrument. Useful
 * for a decoder; wrong for a map, which is claiming to print what the stack
 * settles on. On the default sentence the two disagree: B's shortlist tops
 * out at "␣The" and the machine's own argmax is a newline. So this is the
 * unfiltered argmax over the whole row, which is what a click on the last
 * chip then shows instrument D reading through its own arithmetic.
 *
 * The last position is the only one a pass keeps a logits row for; earlier
 * positions cost a second pass, and the map does not take one.
 */
export function topOfFinalLogits(run) {
  const row = run?.lastLogits
  if (!row || row.length === 0) return null
  let best = 0
  for (let id = 1; id < row.length; id++) if (row[id] > row[best]) best = id
  return { id: best, token: tokenText(best) }
}

/**
 * The splash: where the last stream lands.
 *
 * The final vector meets the unembedding and becomes one number per token in
 * the vocabulary — 50,257 of them. Softmaxed, those are the probabilities the
 * sampler actually draws from, and the top few of them are the whole of what
 * the machine has to say. This returns them, largest first.
 *
 * Read off `run.lastLogits`, which the pass already keeps whole for the
 * sampler, so this is a scan of an array the map is holding rather than any
 * second arithmetic. The softmax is max-shifted, because the raw logits reach
 * far enough for a plain exp to overflow.
 *
 * @param {object} run
 * @param {number} count how many of the top candidates to return
 */
export function finalSplash(run, count = 8) {
  const row = run?.lastLogits
  if (!row || row.length === 0) return null

  let max = -Infinity
  for (let id = 0; id < row.length; id++) if (row[id] > max) max = row[id]

  let total = 0
  for (let id = 0; id < row.length; id++) total += Math.exp(row[id] - max)

  // Top `count` by logit, which is the same order as by probability.
  const top = []
  for (let id = 0; id < row.length; id++) {
    const v = row[id]
    if (top.length < count) {
      top.push(id)
      if (top.length === count) top.sort((a, b) => row[b] - row[a])
    } else if (v > row[top[count - 1]]) {
      top[count - 1] = id
      let i = count - 1
      while (i > 0 && row[top[i]] > row[top[i - 1]]) {
        const t = top[i]
        top[i] = top[i - 1]
        top[i - 1] = t
        i--
      }
    }
  }
  return top.map((id) => ({
    id,
    token: tokenText(id),
    p: Math.exp(row[id] - max) / total,
  }))
}

/** The wording of the head row, so the drawing never has to be guessed at. */
export const HEAD_LEGEND =
  'head squares — share of this token’s attention that leaves itself'
/** The same sentence, at a width that has room for forty-odd characters. */
export const HEAD_LEGEND_SHORT = 'head squares — attention leaving this token'

// ---------------------------------------------------------------------------
// The check
// ---------------------------------------------------------------------------

// The map's three claims are that the brightness of a node is the norm of a
// real vector, that every cell of the falling strip is a real number out of
// the residual stream, and that a lit head square is a real share of a real
// attention row. All three are worth being able to re-run rather than
// remember, so a dev build puts the check on the console.
//
// `__mapCheck()` takes what the instrument currently has on screen — it
// publishes it to `__mapState` on every render — and recomputes all of it from
// the forward pass by a different route: the stop values and the strip's
// 5,376 cells against `residualStops()`, which packs the seven depths for one
// position through code the glass pass uses and this file does not, and the
// head values against `run.attention` read directly. It returns the largest
// disagreement it found. Production drops the whole block.
if (import.meta.env.DEV) {
  globalThis.__mapCheck = async () => {
    const state = globalThis.__mapState
    if (!state) return { error: 'instrument F has not published a state yet' }
    if (!state.real) return { error: 'the map is showing illustrative columns' }
    const model = await import('./realModel.js')

    // The pass is memoised one deep, so asking for the sequence that is
    // already on screen hands back the very object the instrument is drawing
    // and the strip check below compares a buffer against itself — a check
    // that cannot fail is not a check. Running one token first evicts that
    // memo, so the second call runs the model again and the numbers on screen
    // are compared against a pass they had no part in. Whether that worked is
    // reported rather than assumed: `freshPass` is false if any stop still
    // shares a buffer with the strip.
    await model.realForward(
      state.ids.length === 1 ? [state.ids[0], state.ids[0]] : [state.ids[0]],
    )
    const run = await model.realForward(state.ids)
    if (run.key !== state.key) {
      return { error: `the run moved: ${run.key} vs ${state.key}` }
    }
    let freshPass = true
    if (state.stripStops) {
      for (let s = 0; s < MAP_STOPS; s++) {
        if (state.stripStops[s].buffer === run.residuals[s].buffer) {
          freshPass = false
        }
      }
    }

    const packed = model.residualStops(run, state.index)
    let worstStop = 0
    const stops = []
    for (let s = 0; s < MAP_STOPS; s++) {
      let sum = 0
      for (let d = 0; d < REAL_HIDDEN; d++) {
        const v = packed[s * REAL_HIDDEN + d]
        sum += v * v
      }
      const truth = Math.sqrt(sum)
      const delta = Math.abs(truth - state.stops[s])
      if (delta > worstStop) worstStop = delta
      stops.push({ stop: s, onScreen: state.stops[s], truth, delta })
    }

    // The strip claims something stronger than the node above it: not that a
    // reduction of the vector is right, but that every one of the 768 numbers
    // on screen is the number the pass produced. So it is checked value by
    // value against the same packed block, not stop by stop.
    let worstStrip = null
    if (state.stripStops) {
      worstStrip = 0
      for (let s = 0; s < MAP_STOPS; s++) {
        const onScreen = state.stripStops[s]
        for (let d = 0; d < REAL_HIDDEN; d++) {
          const delta = Math.abs(packed[s * REAL_HIDDEN + d] - onScreen[d])
          if (delta > worstStrip) worstStrip = delta
        }
      }
    }

    const n = run.n
    const q = state.index
    const data = run.attention[state.layer]
    let worstHead = 0
    const heads = []
    for (let h = 0; h < REAL_HEADS; h++) {
      const truth = 1 - data[(h * n + q) * n + q]
      const delta = Math.abs(truth - state.heads[h])
      if (delta > worstHead) worstHead = delta
      heads.push({ head: h, onScreen: state.heads[h], truth, delta })
    }

    return {
      key: state.key,
      index: state.index,
      layer: state.layer,
      freshPass,
      worstStopDelta: worstStop,
      worstStripDelta: worstStrip,
      stripCells: state.stripStops ? MAP_STOPS * REAL_HIDDEN : 0,
      worstHeadDelta: worstHead,
      stops,
      heads,
    }
  }
}
