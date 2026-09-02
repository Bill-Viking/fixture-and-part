// Instrument F — the numbers behind the drawing.
//
// The map has two halves and this file is both of them.
//
// The frozen half is the file itself: the shape, dtype and byte count each
// part actually occupies, and the windows of real weight bytes the six walls
// are cut from. None of that is written out by hand here — it is read out of
// `fileFacts.json`, the same reading instrument E draws, so a tensor whose
// shape is printed on the map is a tensor the file really holds at that size.
// If the file ever changed, the drawing would change with it or say it could
// not find the tensor.
//
// The moving half is four readings per pass, and each of them is a plain
// reduction of a tensor the forward pass already produced. Nothing is
// smoothed, rescaled or invented on the way to the screen:
//
//   the stop values   the L2 norm of one token's 768-wide running vector at
//                     each of the seven depths — how much vector there is at
//                     that stop, which is the honest thing a single number
//                     can say about a point in the residual stream;
//   the filaments     the mean |value| of each group of dimensions at that
//                     same depth — which dimensions are carrying it;
//   the transfers     one real attention weight out of the block's chosen
//                     head, at the hero's own row;
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

/** How many depths the map draws a node at. Seven, for six blocks. */
export const MAP_STOPS = RESIDUAL_STOPS

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

/**
 * The full readout under the screen, when something on it is clicked.
 *
 * Its idle wording used to say "click any steel box", which is the language of
 * two drawings ago — instrument F drew the machinery as textured steel boxes
 * before the memory room replaced them with walls, and a reader looking at
 * this page has never seen a steel box. It names what is actually on the
 * screen now, and what each of those things will say.
 */
export function partReadout(facts) {
  if (!facts) {
    return (
      'nothing chosen yet — click a wall, a cell, a carrier, a landing bar or a plate ' +
      'and this line says what it is'
    )
  }
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

// ---------------------------------------------------------------------------
// The memory room: the walls, the filaments and the transfers
// ---------------------------------------------------------------------------

/**
 * The wall of a block: the 24 × 64 window of that block's own c_attn weight
 * bytes, exactly as `fileFacts.json` read them out of the file.
 *
 * Three things are decided here and all three are said on the drawing.
 *
 * The bytes are read as what the manifest says they are. `attn.c_attn.weight`
 * is stored i8 at zero point 0, so a byte is a signed number from −128 to 127
 * and 255 is the weight −1, not the weight 255. Reading the same bytes
 * unsigned wraps every negative weight to the top of the range, which is what
 * this drawing did until it was measured: the byte histogram of every window
 * was bimodal at the two extremes and the stretch below had nothing left to
 * do, because a window that holds weights from −43 to +47 looked like a window
 * that holds 0 and 255.
 *
 * A cell's brightness is the size of the weight, not its sign. Both signs are
 * the machinery working; a wall drawn on the signed value would read as a
 * gradient from "black" at −128 to "white" at +127, which is a picture of the
 * sign bit rather than of the weights. So brightness is |weight|, stretched
 * across the middle 96 % of that window's own magnitudes rather than across
 * its extremes — which on the real windows clips the top 2 % of magnitudes at
 * full light and stretches the rest over the range that actually has cells in
 * it (block 0 runs 0 → 33 out of a largest magnitude of 47; block 5, 0 → 13
 * out of 19).
 *
 * The window is never reshaped — a squarer field would put bytes next to each
 * other that are not next to each other in the tensor, which is a lie about
 * adjacency.
 *
 * The cells are grouped by magnitude rather than drawn one element each: a
 * window holds 1,536 bytes but only a few dozen distinct magnitudes, so one
 * path per magnitude draws every cell of that magnitude at exactly that
 * magnitude's brightness. Nothing is quantised — the byte is already the
 * quantisation — and a wall costs the drawing tens of elements instead of
 * fifteen hundred.
 */
const wallCache = new Map()

export function wallWindow(windows, name) {
  const cached = wallCache.get(name)
  if (cached) return cached
  const meta = windows?.[name]
  if (!meta?.base64) return null
  const binary = atob(meta.base64)
  // i8, zero point 0: the high half of the byte range is the negative weights.
  const mag = new Uint8Array(binary.length)
  // The signed values themselves are kept as well as their magnitudes, because
  // a reader who clicks a cell is owed the weight and not its size: the byte
  // 236 is the weight −20 × the tensor's scale, and only the signed reading
  // can say so.
  const signed = new Int8Array(binary.length)
  let peak = 0
  let least = 127
  for (let i = 0; i < binary.length; i++) {
    const b = binary.charCodeAt(i)
    const raw = b > 127 ? b - 256 : b
    signed[i] = raw
    const value = Math.abs(raw)
    mag[i] = value
    if (value > peak) peak = value
    if (value < least) least = value
  }
  const ordered = Uint8Array.from(mag)
  ordered.sort()
  const lo = ordered[Math.floor(0.02 * (ordered.length - 1))]
  const hi = ordered[Math.floor(0.98 * (ordered.length - 1))]
  const span = Math.max(1, hi - lo)
  const byValue = new Map()
  for (let i = 0; i < mag.length; i++) {
    const value = mag[i]
    let cells = byValue.get(value)
    if (!cells) {
      cells = []
      byValue.set(value, cells)
    }
    cells.push(i)
  }
  const groups = [...byValue.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([value, cells]) => ({
      value,
      // The weight's own magnitude on the middle-96 % stretch, 0 to 1.
      v: Math.max(0, Math.min(1, (value - lo) / span)),
      cells,
    }))
  const wall = {
    name,
    rows: meta.rows,
    cols: meta.cols,
    // Where the window sits in the whole tensor, so a cell can name its own
    // [row, col] there rather than in the 24 × 64 crop.
    row0: meta.row0 ?? 0,
    col0: meta.col0 ?? 0,
    totalRows: meta.totalRows,
    totalCols: meta.totalCols,
    count: mag.length,
    values: signed,
    lo,
    hi,
    // The window's own full magnitude range, which is what the stretch is
    // being measured against when the legend prints it.
    min: least,
    max: peak,
    // A window whose weights are all but identical in size gets Arc 3's wash
    // rather than a black panel: the stretch has nothing to stretch, and
    // saying nothing would be the one dishonest option.
    flat: hi - lo <= 1,
    groups,
  }
  wallCache.set(name, wall)
  return wall
}

/** The c_attn window a block's wall is drawn from. */
export const wallTensor = (layer) =>
  `transformer.h.${layer}.attn.c_attn.weight_quantized`

/**
 * How the 768 dimensions are grouped into filaments, given how many streams
 * have to share the width.
 *
 * 768 = 64 × 12 = 32 × 24 = 16 × 48, so the grouping is exact at every step
 * and the drawing never has a filament standing for a different number of
 * dimensions than its neighbour. Long sentences get fewer, fatter filaments
 * because thirty streams cannot each carry sixty-four legible ones — the
 * drawing states the grouping it is using.
 */
export function filamentPlan(n) {
  const group = n <= 12 ? 12 : n <= 24 ? 24 : 48
  return { group, count: REAL_HIDDEN / group }
}

/**
 * Every token's vector at every depth, binned into filaments: the mean of the
 * absolute values of each group of dimensions.
 *
 * This is the texture inside a stream. It answers a different question from
 * the stream's width — the width is how much vector there is, the filaments
 * are which dimensions are carrying it — so it is normalised differently and
 * both normalisations are named on screen: a filament's brightness is its own
 * bin against the brightest filament in that same stream at that same depth.
 *
 * @param {(index: number, stop: number) => ArrayLike<number>|null} vectorAt
 * @param {number} n how many streams
 * @param {number} group dimensions per filament
 */
export function filamentField(vectorAt, n, group) {
  const count = REAL_HIDDEN / group
  const bins = []
  const rel = []
  for (let i = 0; i < n; i++) {
    const rows = []
    const relRows = []
    for (let s = 0; s < MAP_STOPS; s++) {
      const vector = vectorAt(i, s)
      const row = new Float64Array(count)
      if (vector) {
        for (let fbin = 0; fbin < count; fbin++) {
          let sum = 0
          const base = fbin * group
          for (let d = 0; d < group; d++) sum += Math.abs(vector[base + d])
          row[fbin] = sum / group
        }
      }
      let max = 0
      for (let fbin = 0; fbin < count; fbin++) if (row[fbin] > max) max = row[fbin]
      const scale = max > 0 ? 1 / max : 0
      const relRow = new Float64Array(count)
      for (let fbin = 0; fbin < count; fbin++) relRow[fbin] = row[fbin] * scale
      rows.push(row)
      relRows.push(relRow)
    }
    bins.push(rows)
    rel.push(relRows)
  }
  return { group, count, bins, rel }
}

/** One position's 768 numbers at one depth, straight out of the pass. */
export function residualRow(run, index, stop) {
  const data = run?.residuals?.[stop]
  if (!data || index < 0 || index >= run.n) return null
  const base = index * REAL_HIDDEN
  return data.subarray(base, base + REAL_HIDDEN)
}

/**
 * The head a block's transfers are read from, when the reader has not picked
 * one: the head that sends the most attention away from the first token and
 * away from itself, averaged over the queries that have somewhere else to
 * look.
 *
 * Why not the average over all twelve. Averaged, distilgpt2's attention is
 * dominated by the first-token sink: every query sends 0.4 to 0.8 of its
 * weight to the first piece at every depth, so the average draws the same
 * picture six times and hides the mechanism. This rule picks the head doing
 * lookup work instead. Both readings are honest; this one is stated on the
 * drawing rather than assumed, and the HEAD chips let the reader overrule it.
 */
export function blockHead(run, layer) {
  if (!run?.attention?.length || run.n === 0) return 0
  const n = run.n
  const data = run.attention[Math.min(Math.max(layer, 0), REAL_LAYERS - 1)]
  const first = Math.min(2, Math.max(1, n - 1))
  const denominator = Math.max(1, n - first)
  let best = -1
  let bestHead = 0
  for (let h = 0; h < REAL_HEADS; h++) {
    let total = 0
    for (let q = first; q < n; q++) {
      const base = (h * n + q) * n
      for (let k = 1; k < q; k++) total += data[base + k]
    }
    total /= denominator
    if (total > best) {
      best = total
      bestHead = h
    }
  }
  return bestHead
}

/** The weight below which a source is not drawn as a transfer. */
export const TRANSFER_FLOOR = 0.15
/** How many transfers one block may draw into the hero. */
const TRANSFER_MAX = 2

/**
 * One block's transfers into the hero: that position's own strongest sources
 * in the block's head, at or above the floor, at most two.
 *
 * Self-attention is never a transfer. It is the stream continuing, and the
 * stream is already drawn — so a block whose hero mostly reads itself draws
 * nothing, and says so in place with the two numbers that made it a near miss.
 */
export function blockTransfers(run, layer, hero, head) {
  if (!run?.attention?.length || run.n === 0) return null
  const n = run.n
  const q = Math.min(Math.max(hero, 0), n - 1)
  const data = run.attention[Math.min(Math.max(layer, 0), REAL_LAYERS - 1)]
  const h = Math.min(Math.max(head, 0), REAL_HEADS - 1)
  const base = (h * n + q) * n
  const ranked = []
  for (let k = 0; k < q; k++) ranked.push({ src: k, w: data[base + k] })
  ranked.sort((a, b) => b.w - a.w)
  const kept = ranked.filter((x) => x.w >= TRANSFER_FLOOR).slice(0, TRANSFER_MAX)
  return {
    layer,
    head: h,
    kept,
    selfWeight: data[base + q],
    best: ranked[0] ?? null,
  }
}

// ---------------------------------------------------------------------------
// The check
// ---------------------------------------------------------------------------

// The drawing makes four claims about numbers, and a dev build can re-run all
// four from the console rather than being taken on trust:
//
//   the streams    a stream's width and light are the L2 length of that
//                  token's 768-number running vector at that depth;
//   the filaments  a filament's grain is the mean |value| of its own group of
//                  dimensions there — 64 × 12 of them per stream per depth;
//   the transfers  a carrier's width and light are one real attention weight,
//                  read from the block's chosen head at the hero's own row;
//   the landing    a bar's height is one real probability out of a softmax
//                  over all 50,257 words of the last position's logits.
//
// `__mapCheck()` takes what the instrument currently has on screen — it
// publishes it to `__mapState` on every render — and recomputes every one of
// those from a pass it runs itself, by a different route: the norms and the
// filament bins against `residualStops()`, which packs the seven depths for
// one position through code the glass pass uses and this file does not; the
// transfers and the head shares against `run.attention` read directly; the
// landing against a softmax written out here rather than the one the drawing
// called. It returns the largest disagreement it found. Production drops the
// whole block.
if (import.meta.env.DEV) {
  globalThis.__mapCheck = async () => {
    const state = globalThis.__mapState
    if (!state) return { error: 'instrument F has not published a state yet' }
    if (!state.real) return { error: 'the map is drawing the schematic, not a pass' }
    const model = await import('./realModel.js')

    // The pass is memoised one deep, so asking for the sequence that is
    // already on screen hands back the very object the instrument is drawing,
    // and every check below would compare a buffer against itself — a check
    // that cannot fail is not a check. Running one token first evicts that
    // memo, so the second call runs the model again and the numbers on screen
    // are compared against a pass they had no part in. Whether that worked is
    // reported rather than assumed: `freshPass` is false if any depth still
    // shares a buffer with what the instrument published.
    await model.realForward(
      state.ids.length === 1 ? [state.ids[0], state.ids[0]] : [state.ids[0]],
    )
    const run = await model.realForward(state.ids)
    if (run.key !== state.key) {
      return { error: `the run moved: ${run.key} vs ${state.key}` }
    }
    let freshPass = true
    for (let s = 0; s < MAP_STOPS; s++) {
      if (state.buffers?.[s] === run.residuals[s].buffer) freshPass = false
    }

    // --- the streams and their filaments ---------------------------------
    let worstNorm = 0
    let worstBin = 0
    let bins = 0
    const group = state.group
    for (let i = 0; i < state.norms.length; i++) {
      const packed = model.residualStops(run, i)
      for (let s = 0; s < MAP_STOPS; s++) {
        let sum = 0
        for (let d = 0; d < REAL_HIDDEN; d++) {
          const v = packed[s * REAL_HIDDEN + d]
          sum += v * v
        }
        const delta = Math.abs(Math.sqrt(sum) - state.norms[i][s])
        if (delta > worstNorm) worstNorm = delta
        const onScreen = state.filaments[i][s]
        for (let fbin = 0; fbin < onScreen.length; fbin++) {
          let acc = 0
          for (let d = 0; d < group; d++) {
            acc += Math.abs(packed[s * REAL_HIDDEN + fbin * group + d])
          }
          const binDelta = Math.abs(acc / group - onScreen[fbin])
          if (binDelta > worstBin) worstBin = binDelta
          bins++
        }
      }
    }

    // --- the transfers ----------------------------------------------------
    const n = run.n
    let worstTransfer = 0
    const transfers = []
    for (const t of state.transfers) {
      const data = run.attention[t.layer]
      const truth = data[(t.head * n + state.hero) * n + t.src]
      const delta = Math.abs(truth - t.w)
      if (delta > worstTransfer) worstTransfer = delta
      transfers.push({ ...t, truth, delta })
    }
    // The head each block chose, recomputed here rather than read back.
    const heads = []
    for (let layer = 0; layer < REAL_LAYERS; layer++) {
      heads.push(blockHead(run, layer))
    }
    const headsMatch =
      state.autoHeads.length === heads.length &&
      state.autoHeads.every((h, i) => h === heads[i])

    // --- the lit head squares, when a block is open -----------------------
    let worstHead = null
    if (state.heads) {
      worstHead = 0
      const data = run.attention[state.block]
      for (let h = 0; h < REAL_HEADS; h++) {
        const truth = 1 - data[(h * n + state.hero) * n + state.hero]
        const delta = Math.abs(truth - state.heads[h])
        if (delta > worstHead) worstHead = delta
      }
    }

    // --- the landing ------------------------------------------------------
    let worstLanding = 0
    const row = run.lastLogits
    let max = -Infinity
    for (let id = 0; id < row.length; id++) if (row[id] > max) max = row[id]
    let total = 0
    for (let id = 0; id < row.length; id++) total += Math.exp(row[id] - max)
    for (const bar of state.landing) {
      const truth = Math.exp(row[bar.id] - max) / total
      const delta = Math.abs(truth - bar.p)
      if (delta > worstLanding) worstLanding = delta
    }

    return {
      key: state.key,
      hero: state.hero,
      block: state.block,
      freshPass,
      worstNormDelta: worstNorm,
      worstFilamentDelta: worstBin,
      filamentBins: bins,
      worstTransferDelta: worstTransfer,
      transfers,
      autoHeadsMatch: headsMatch,
      autoHeads: heads,
      worstHeadShareDelta: worstHead,
      worstLandingDelta: worstLanding,
      landingBars: state.landing.length,
    }
  }
}
