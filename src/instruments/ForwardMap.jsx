import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  MAP_STOPS,
  TRANSFER_FLOOR,
  architectureNote,
  blockHead,
  blockTransfers,
  filamentField,
  filamentPlan,
  finalSplash,
  headOutwardShares,
  partReadout,
  residualField,
  residualRow,
  tensorFacts,
  topOfFinalLogits,
  wallTensor,
  wallWindow,
} from '../lib/forwardMap.js'
import {
  DECODING,
  REAL_HEADS,
  REAL_HIDDEN,
  REAL_LAYERS,
} from '../lib/realModel.js'
import { residualVector } from '../lib/toyModel.js'
import InfoTag from '../components/InfoTag.jsx'
import LoadNote from '../components/LoadNote.jsx'
import ReadingLine from '../components/ReadingLine.jsx'
import TeachPair from '../components/TeachPair.jsx'
import InstrumentHead from '../components/InstrumentHead.jsx'

/**
 * Instrument F — the forward pass, live. The memory room.
 *
 * Six full-width walls, one per block, every cell of them one real byte of
 * that block's own attention weights as the file stores them. The reader's
 * sentence falls through all six as granular streams of light, one per token,
 * and inside a stream the 768 dimensions are drawn as filaments so the texture
 * says which dimensions are carrying the vector at each depth. One token is
 * the hero — the last by default, any of them on a click — and the hero
 * gathers the pass's real attention transfers: a green key at the source, an
 * amber carrier whose width is the weight, and a brighter stream below the
 * absorption. It ends at the landing, where the last position's vector meets
 * all 50,257 words.
 *
 * The frame around all of that is unchanged from the drawing this replaces:
 * the numbers are the ones instruments B, C, D and E already read, the shapes
 * and bytes come from the file's own manifest, the lettered windows open the
 * instrument each reading came from, and a pass in flight draws no numbers at
 * all rather than falling back to the stand-ins.
 *
 * Nothing in the picture is a stand-in. The only marks carrying no number are
 * the aperture outline and the bloom around the light.
 */

/** The drawing is this many units wide at every screen width. */
const SW = 1166

/** The cadence of a replay: how long the light takes to reach the next depth. */
const PASS_STEP_MS = 150
/** The pause before the first depth, so a replay is visibly a beginning. */
const PASS_LEAD_MS = 80

/** Deterministic pseudo-random in [0,1) — the comp's generator, unchanged. */
function h01(...args) {
  let n = 0
  for (const a of args) n = (n * 131 + Math.trunc(a * 97)) >>> 0
  n ^= n >>> 13
  n = Math.imul(n, 1274126177) >>> 0
  return ((n >>> 8) & 0xffff) / 65535
}

const f2 = (x) => Math.round(x * 100) / 100

/**
 * Where everything sits, in drawing units.
 *
 * One law, two settings of it. The drawing is 1,166 units wide at both
 * breakpoints, so a unit is about 0.58 px at 1280 and 0.26 px at 390 — which
 * is why the compact type sizes are roughly twice the wide ones, and why the
 * grain of the walls and the streams is coarser there. The height is a
 * function of the setting and of nothing else: not of how many tokens are in
 * the sequence, not of which block is open, not of whether a model has
 * loaded. That is what lets the sentence change without moving the page.
 */
function geometryFor(compact) {
  const fs = compact
    ? {
        note: 29, reg: 27, tensor: 24, chip: 30, callout: 29, fine: 24,
        quiet: 27, land: 28, aperture: 24, prob: 29, probp: 25, key: 25,
        legKey: 27, leg: 29, legFine: 25,
      }
    : {
        note: 16, reg: 15, tensor: 14, chip: 19, callout: 17, fine: 13.5,
        quiet: 16, land: 16, aperture: 13.5, prob: 17, probp: 15, key: 15,
        legKey: 16, leg: 16.5, legFine: 14.5,
      }

  const bandX = 62
  const bandW = SW - 2 * bandX
  const cols = 64
  const rows = 24
  const pitchX = bandW / cols
  const cellW = 9.4
  const pitchY = compact ? 9 : 5.5
  const cellH = compact ? 6.2 : 3.5
  const bandH = rows * pitchY - (pitchY - cellH)
  // The dark air above each wall, where the carriers sweep and the callouts
  // sit. It is set by the type: two lines of callout plus room to breathe.
  const air = compact ? 150 : 94
  const blockPitch = bandH + air

  const chipY = compact ? 46 : 38
  const chipH = compact ? 46 : 30
  const fallTop = chipY + chipH + 6
  const rimY = fallTop + (compact ? 74 : 46)
  const bandTop = Array.from(
    { length: REAL_LAYERS },
    (_, i) => rimY + air + i * blockPitch,
  )
  const bandMid = bandTop.map((t) => t + bandH / 2)
  const bandBot = bandTop.map((t) => t + bandH)
  const stopY = [rimY, ...bandMid]
  const lastBot = bandBot[REAL_LAYERS - 1]

  const mistY = lastBot + (compact ? 52 : 34)
  const apertureY0 = lastBot + (compact ? 76 : 50)
  const apertureH = compact ? 44 : 32
  const landTitleY = apertureY0 + (compact ? 60 : 42)
  const splashN = compact ? 6 : 8
  const barBase = apertureY0 + (compact ? 340 : 240)
  const barMaxH = compact ? 170 : 132
  const barPitch = (SW - 160) / splashN
  const barX0 = 80 + barPitch / 2
  const barW = barPitch * 0.46
  const dotCols = 6
  const dotPitchX = barW / dotCols
  const dotW = dotPitchX * 0.78
  const dotPitchY = compact ? 12 : 9.4
  const dotH = dotPitchY * 0.62

  const keyY = barBase + (compact ? 112 : 78)
  const keyY2 = keyY + (compact ? 34 : 0)
  const legRuleY = keyY2 + (compact ? 40 : 26)
  const legTop = legRuleY + (compact ? 44 : 28)
  const legLine = fs.leg * 1.4
  const legX = compact ? 8 : 196
  const legGap = compact ? 14 : 10
  const legCols = Math.floor((SW - legX - 10) / (fs.leg * 0.6))
  // Reserved, not measured: the legend prints live numbers, so its wording
  // changes with the sentence. A block whose height followed its own text
  // would move everything below the figure on every keystroke.
  const legLines = compact ? [8, 9, 14, 7] : [9, 10, 13, 8]
  const legKeyLine = compact ? fs.legKey * 1.5 : 0
  const legHeight =
    legLines.reduce((sum, l) => sum + l * legLine + legKeyLine + legGap, 0)
  const fineTop = legTop + legHeight + (compact ? 6 : 4)
  const fineLines = compact ? 4 : 3
  const H = fineTop + fineLines * (fs.legFine * 1.35) + (compact ? 20 : 14)

  return {
    compact, fs,
    bandX, bandW, cols, rows, pitchX, cellW, cellH, pitchY, bandH,
    bandTop, bandMid, bandBot, stopY, lastBot, air,
    chipY, chipH, fallTop, rimY, mistY, apertureY0, apertureH, landTitleY,
    splashN, barBase, barMaxH, barPitch, barX0, barW,
    dotCols, dotPitchX, dotW, dotPitchY, dotH,
    keyY, keyY2, legRuleY, legTop, legLine, legX, legGap, legCols, legLines,
    legKeyLine, fineTop, fineLines,
    // Where the streams live: inside the walls, with the right-hand end left
    // clear for the tensor each wall is cut from.
    trackX: 70,
    trackW: 936,
    // The grain. A dash on a 1,166-unit drawing has to be sized in units, and
    // the two breakpoints put very different numbers of pixels under a unit.
    grain: compact ? 2.4 : 1.1,
    grainWidth: compact ? 3.6 : 1.75,
    H,
  }
}

/** As much of a token as a chip can hold; the rest lives in its tooltip. */
function clip(text, size, width) {
  const room = Math.max(1, Math.floor(width / (size * 0.6)))
  return text.length <= room ? text : text.slice(0, room)
}

/** Greedy wrap into at most `max` lines; the last one is clipped if it must be. */
function wrapText(text, cols, max) {
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  for (const word of words) {
    if (current && current.length + 1 + word.length > cols) {
      lines.push(current)
      current = word
    } else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current) lines.push(current)
  if (lines.length <= max) return lines
  const kept = lines.slice(0, max)
  kept[max - 1] = `${kept[max - 1].slice(0, Math.max(0, cols - 1))}…`
  return kept
}

/**
 * A wall: one block's 24 × 64 window of real weight bytes.
 *
 * Every cell of the same byte value is drawn by one path at that byte's own
 * brightness, so a wall is a few dozen elements rather than fifteen hundred
 * and nothing about the value is rounded on the way to the screen. The walls
 * never change — not on a keystroke, not on a pass — so this is memoised on
 * the geometry alone and a re-run does not rebuild a single cell.
 */
const Walls = memo(function Walls({ g, windows }) {
  if (!windows) return null
  return (
    <g className="mr-walls">
      {Array.from({ length: REAL_LAYERS }, (_, layer) => {
        const wall = wallWindow(windows, wallTensor(layer))
        if (!wall) return null
        const top = g.bandTop[layer]
        return (
          <g key={layer}>
            {wall.groups.map((group) => {
              let d = ''
              for (const index of group.cells) {
                const row = Math.floor(index / g.cols)
                const col = index % g.cols
                const x = f2(g.bandX + col * g.pitchX)
                const y = f2(top + row * g.pitchY)
                d += `M${x} ${y}h${f2(g.cellW)}v${f2(g.cellH)}h${f2(-g.cellW)}Z`
              }
              // Arc 3's rule for a window whose bytes are all but identical:
              // an even wash rather than a black panel.
              const alpha = wall.flat ? 0.2 : 0.1 + 0.62 * group.v
              return (
                <path
                  key={group.value}
                  className="mr-cell"
                  d={d}
                  opacity={f2(alpha)}
                />
              )
            })}
          </g>
        )
      })}
    </g>
  )
})

/**
 * The fall: one granular stream per token, its filaments drawn as dashed
 * paths so that one element carries a whole column of grains.
 *
 * Ink density is held roughly even per unit of area — the dash period comes
 * off the stream's own width — so a wide stream is not a solid bar and a thin
 * one is not a dotted line.
 */
const Streams = memo(function Streams({ g, draw }) {
  const { n, plan, segments } = draw
  return (
    <g className="mr-streams">
      {segments.map((seg, si) => (
        <g
          key={seg.key}
          className="mr-fall"
          style={{ '--d': `${PASS_LEAD_MS + si * PASS_STEP_MS}ms` }}
        >
          {Array.from({ length: n }, (_, i) => {
            const hero = i === draw.hero
            const a0 = draw.alpha[i][seg.s0]
            const a1 = draw.alpha[i][seg.s1]
            const w0 = draw.hw[i][seg.s0]
            const w1 = draw.hw[i][seg.s1]
            const tail = seg.tail && !hero
            const halo = []
            const layers = hero
              ? [[3.0, 0.038], [1.8, 0.055], [1.12, 0.068]]
              : [[2.4, 0.011], [1.35, 0.018]]
            for (const [mul, op] of layers) {
              let alpha = (op * (a0 + a1)) / 2 / 0.5
              if (tail) alpha *= 0.5
              const left = []
              const right = []
              for (let q = 0; q <= 6; q++) {
                const t = q / 6
                const y = seg.y0 + (seg.y1 - seg.y0) * t
                const cx = draw.centreX(i, y)
                let hw = (w0 + (w1 - w0) * t) * mul
                if (tail) hw *= 1 - 0.35 * t
                left.push(`${f2(cx - hw)} ${f2(y)}`)
                right.push(`${f2(cx + hw)} ${f2(y)}`)
              }
              halo.push(
                `M ${left.join(' L ')} L ${right.reverse().join(' L ')} Z|${f2(alpha)}`,
              )
            }
            const segAlpha = tail ? ((a0 + a1) / 2) * 0.42 : (a0 + a1) / 2
            const segWidth = w0 + w1
            let density = hero ? 0.30 + 0.18 * draw.t[i][seg.s0] : 0.24 + 0.20 * draw.t[i][seg.s0]
            if (tail) density *= 0.75
            const period = Math.max(
              g.grain * 7,
              (1.6 * plan.count * g.grain) / (density * Math.max(segWidth, 3)),
            )
            const grains = []
            for (let fi = 0; fi < plan.count; fi++) {
              const u = (fi + 0.5) / plan.count - 0.5
              const r0 = draw.rel[i][seg.s0][fi]
              const r1 = draw.rel[i][seg.s1][fi]
              const alpha = segAlpha * (0.26 + 0.74 * ((r0 + r1) / 2) ** 0.75)
              if (alpha < 0.035) continue
              let d
              if (hero) {
                const points = []
                for (let q = 0; q <= 4; q++) {
                  const t = q / 4
                  const y = seg.y0 + (seg.y1 - seg.y0) * t
                  const w = w0 + (w1 - w0) * t
                  points.push(`${f2(draw.centreX(i, y) + u * 2 * w)} ${f2(y)}`)
                }
                d = `M ${points.join(' L ')}`
              } else {
                d =
                  `M ${f2(draw.xs[i] + u * 2 * w0)} ${f2(seg.y0)}` +
                  ` L ${f2(draw.xs[i] + u * 2 * w1)} ${f2(seg.y1)}`
              }
              grains.push(
                <path
                  key={fi}
                  d={d}
                  strokeDasharray={`${f2(g.grain)} ${f2(period - g.grain)}`}
                  strokeDashoffset={f2(h01(i, fi, seg.y0) * period)}
                  opacity={f2(alpha)}
                />,
              )
            }
            return (
              <g key={i} className={hero ? 'mr-stream is-hero' : 'mr-stream'}>
                <g className="mr-halo">
                  {halo.map((piece, hi) => {
                    const [d, alpha] = piece.split('|')
                    return <path key={hi} d={d} opacity={alpha} />
                  })}
                </g>
                <g className="mr-grain">{grains}</g>
              </g>
            )
          })}
        </g>
      ))}
    </g>
  )
})

/**
 * The carriers: one amber sweep per transfer, grained the same way the
 * streams are, and masked out of every stream it crosses so that no line ever
 * crosses the water. The source's own stream and the hero's are not masked —
 * the carrier leaves one and lands in the other.
 */
const Carriers = memo(function Carriers({ g, draw }) {
  return (
    <g className="mr-carriers">
      <defs>
        {draw.transfers.map((tr) => (
          <mask
            key={tr.id}
            id={`mr-behind-${tr.id}`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={SW}
            height={g.H}
          >
            <rect x="0" y="0" width={SW} height={g.H} fill="#fff" />
            {draw.footprints.map((d, i) =>
              i === tr.src || i === draw.hero ? null : (
                <path key={i} d={d} fill="#000" />
              ),
            )}
          </mask>
        ))}
      </defs>
      {draw.transfers.map((tr) => {
        const filaments = 2 + Math.round(tr.w * 4)
        const width = (1.2 + 4.4 * tr.w) * (g.compact ? 1.6 : 1)
        const paths = []
        for (let k = 0; k < filaments; k++) {
          const v = ((k + 0.5) / filaments - 0.5) * 2 * width
          let d = ''
          for (const point of tr.points) {
            const x = point.x + point.nx * v
            const y = point.y + point.ny * v
            d += d ? ` L ${f2(x)} ${f2(y)}` : `M ${f2(x)} ${f2(y)}`
          }
          const centred = 0.55 + 0.45 * (1 - Math.abs((k + 0.5) / filaments - 0.5) * 2)
          paths.push(
            <path
              key={k}
              d={d}
              strokeDasharray={`${f2(g.grain)} ${f2(g.grain * 2.6)}`}
              strokeDashoffset={f2(h01(tr.layer, k, 3) * g.grain * 3.6)}
              opacity={f2((0.30 + 0.52 * tr.w) * centred * (tr.standBack ? 0.5 : 1))}
            />,
          )
        }
        return (
          <g
            key={tr.id}
            className="mr-carrier mr-fall"
            style={{ '--d': `${PASS_LEAD_MS + (tr.layer + 1) * PASS_STEP_MS}ms` }}
            mask={`url(#mr-behind-${tr.id})`}
          >
            {paths}
          </g>
        )
      })}
    </g>
  )
})

/** The landing bars: dot grids whose row count is the real probability. */
const Landing = memo(function Landing({ g, draw }) {
  const { landing } = draw
  if (!landing) return null
  return (
    <g className={draw.landingHere ? 'mr-landing' : 'mr-landing is-away'}>
      {landing.bars.map((bar, i) => {
        const rows = Math.max(2, Math.round(bar.h / g.dotPitchY))
        const groups = [[], [], [], []]
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < g.dotCols; c++) {
            const x = bar.x - g.barW / 2 + (g.dotPitchX - g.dotW) / 2 + c * g.dotPitchX
            const y = g.barBase - g.dotH - r * g.dotPitchY
            if (y < bar.top) continue
            // The scatter in a dot's light carries no number; the number is
            // how many rows there are.
            const jitter = Math.min(3, Math.floor(h01(i, r, c) * 3.999))
            groups[r === rows - 1 ? 3 : jitter].push(
              `M${f2(x)} ${f2(y)}h${f2(g.dotW)}v${f2(g.dotH)}h${f2(-g.dotW)}Z`,
            )
          }
        }
        const base = bar.argmax || bar.pick ? 0.8 : 0.42
        return (
          <g
            key={bar.id}
            className={
              bar.argmax ? 'mr-bar is-argmax' : bar.pick ? 'mr-bar is-pick' : 'mr-bar'
            }
          >
            <path
              className="mr-thread"
              d={`M ${f2(draw.apertureX)} ${f2(g.apertureY0 + g.apertureH)} Q ${f2(
                (draw.apertureX + bar.x) / 2,
              )} ${f2(g.apertureY0 + g.apertureH + 70)} ${f2(bar.x)} ${f2(bar.top - 8)}`}
            />
            {groups.map((d, gi) =>
              d.length === 0 ? null : (
                <path
                  key={gi}
                  d={d.join('')}
                  opacity={f2(
                    gi === 3
                      ? Math.min(0.95, base * 1.25)
                      : base * (0.8 + 0.067 * gi),
                  )}
                />
              ),
            )}
          </g>
        )
      })}
    </g>
  )
})

export default function ForwardMap({
  text,
  sequence,
  lensIndex,
  onSelect,
  layer,
  onLayerChange,
  armed,
  real,
  run,
  nextToken,
  pending,
  stepTick,
  modelStatus,
  progress,
  onLoad,
  onOpenInstrument,
  onOpenTensor,
}) {
  const [compact, setCompact] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 640px)').matches,
  )
  const [facts, setFacts] = useState(null)
  const [part, setPart] = useState(null)
  const [replay, setReplay] = useState(0)
  // Whether a register is open — which one is the layer instruments C and F
  // share, so the two can never disagree about it — and which head that
  // register's transfers are read from, or null for the rule.
  const [blockOpen, setBlockOpen] = useState(false)
  const [headPick, setHeadPick] = useState(null)
  const block = blockOpen ? layer : null

  // One media query, read before the first paint and then only on a change of
  // breakpoint, so the drawing is never laid out at the wrong scale.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = (e) => setCompact(e.matches)
    mq.addEventListener('change', onChange)
    setCompact(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // The same shipped reading instrument E draws: the manifest for the shapes
  // and byte counts, and the byte windows the walls are cut from. Its own
  // chunk, and E has already asked for it.
  useEffect(() => {
    let cancelled = false
    import('../content/fileFacts.json')
      .then((module) => {
        if (!cancelled) setFacts(module.default)
      })
      .catch((error) => {
        console.error('[fixture-and-part] the shipped file reading is missing:', error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const g = useMemo(() => geometryFor(compact), [compact])
  const n = sequence.length
  const hero = Math.min(Math.max(lensIndex, 0), Math.max(0, n - 1))
  const runKey = run?.key ?? null
  const manifest = facts?.manifest ?? null
  const windows = facts?.windows ?? null

  // A new pass, or a new token appended, replays the fall.
  useEffect(() => {
    setReplay((r) => r + 1)
  }, [runKey, stepTick, n])

  const runAgain = useCallback(() => setReplay((r) => r + 1), [])

  // A register opened somewhere else — instrument C's own layer selector — is
  // a different register, so the head this one was pinned to goes with it.
  useEffect(() => {
    setHeadPick(null)
  }, [layer])

  // Three states, not two. A finished pass over the text in the box draws its
  // own numbers. With no model there are no numbers to draw and the streams
  // are the schematic, at one width, labelled. In between — the model is in
  // hand and a pass is in flight — it is the schematic too, and the note says
  // the pass is running, rather than showing stand-ins under a real heading.
  const live = Boolean(real && run && run.n === n && n > 0)
  const waiting = armed && !live && n > 0

  const field = useMemo(() => (live ? residualField(run) : null), [live, run])
  const plan = useMemo(() => filamentPlan(n), [n])

  /**
   * The filaments: 768 dimensions binned into groups, one bin per filament.
   *
   * Live, they are the pass's own residual stream. With no model they are the
   * deterministic stand-in instrument D prints, taken 768 wide — texture so
   * the drawing has something to be, labelled on screen as a stand-in and
   * never given a width or a light that claims a magnitude.
   */
  const filaments = useMemo(() => {
    if (n === 0) return null
    if (live) {
      return filamentField((i, s) => residualRow(run, i, s), n, plan.group)
    }
    return filamentField(
      (i, s) => residualVector(sequence[i], s, REAL_HIDDEN),
      n,
      plan.group,
    )
  }, [live, run, sequence, n, plan])

  const autoHeads = useMemo(
    () =>
      live
        ? Array.from({ length: REAL_LAYERS }, (_, l) => blockHead(run, l))
        : null,
    [live, run],
  )

  const headFor = useCallback(
    (l) => (block === l && headPick != null ? headPick : (autoHeads?.[l] ?? 0)),
    [block, headPick, autoHeads],
  )

  const registers = useMemo(() => {
    if (!live) return null
    return Array.from({ length: REAL_LAYERS }, (_, l) =>
      blockTransfers(run, l, hero, headFor(l)),
    )
  }, [live, run, hero, headFor])

  const heads = useMemo(
    () => (live && block != null ? headOutwardShares(run, block, hero) : null),
    [live, run, block, hero],
  )

  const splash = useMemo(
    () => (live ? finalSplash(run, g.splashN) : null),
    [live, run, g.splashN],
  )
  const finalTop = useMemo(() => (live ? topOfFinalLogits(run) : null), [live, run])

  /**
   * Everything the drawing needs in one object: where each stream is, how wide
   * and how bright it is at each depth, where the carriers run, and where the
   * landing bars stand. Built once per pass rather than per element, so the
   * memoised layers below can be handed one prop and skip their work when it
   * has not changed.
   */
  const draw = useMemo(() => {
    if (n === 0 || !filaments) return null
    const slot = g.trackW / n
    const xs = Array.from({ length: n }, (_, i) => g.trackX + slot * (i + 0.5))
    const hwMax = Math.min(14.2, slot * 0.3)
    const hwMin = Math.min(1.6, hwMax * 0.12)

    // Where a stop's norm sits in this pass's own range, on the log law the
    // legend states. Linearly, the first token's attention-sink norm would be
    // one white slab and the rest threads.
    const lo = field ? Math.log(Math.max(field.lo, 1e-6)) : 0
    const hi = field ? Math.log(Math.max(field.hi, 1e-6)) : 1
    const span = hi - lo
    const t = []
    for (let i = 0; i < n; i++) {
      const row = []
      for (let s = 0; s < MAP_STOPS; s++) {
        if (!field || !(span > 0)) row.push(0.42)
        else {
          const value = Math.log(Math.max(field.rows[i][s], 1e-6))
          row.push(Math.min(1, Math.max(0, (value - lo) / span)))
        }
      }
      t.push(row)
    }

    const hw = t.map((row) => row.map((v) => hwMin + (hwMax - hwMin) * v))
    const alpha = t.map((row, i) =>
      row.map((v) =>
        i === hero ? 0.54 + 0.36 * v : 0.26 + 0.32 * v,
      ),
    )

    // The transfers, and what they do to the hero: it runs brighter below
    // each absorption, and that brightness is the weight.
    const transfers = []
    const wobble = []
    if (registers) {
      for (const reg of registers) {
        if (!reg || reg.kept.length === 0) continue
        reg.kept.forEach((source, ki) => {
          transfers.push({
            id: `${reg.layer}-${ki}`,
            layer: reg.layer,
            head: reg.head,
            src: source.src,
            w: source.w,
            lane: ki,
            standBack: block != null && block !== reg.layer,
          })
        })
        const w = reg.kept[0].w
        const stop = reg.layer + 1
        alpha[hero][stop] = Math.min(0.93, alpha[hero][stop] + 0.05 + 0.2 * w)
        if (stop + 1 < MAP_STOPS) {
          alpha[hero][stop + 1] = Math.min(
            0.93,
            alpha[hero][stop + 1] + 0.02 + 0.07 * w,
          )
        }
        wobble.push([g.bandMid[reg.layer], 1.1 + 3.0 * w])
      }
    }

    // The hero's centre line: plumb until the first absorption, then a
    // decaying wobble below each one, so every disturbance has a cause.
    const centreX = (i, y) => {
      if (i !== hero) return xs[i]
      let x = xs[i]
      for (const [y0, amplitude] of wobble) {
        if (y > y0) {
          const d = y - y0
          x += amplitude * Math.sin(d / 26) * Math.exp(-d / 150)
        }
      }
      return x
    }

    const segments = [
      { key: 'rim', y0: g.fallTop, y1: g.rimY, s0: 0, s1: 0, tail: false },
    ]
    for (let s = 0; s < MAP_STOPS - 1; s++) {
      segments.push({
        key: `s${s}`, y0: g.stopY[s], y1: g.stopY[s + 1], s0: s, s1: s + 1, tail: false,
      })
    }
    segments.push({
      key: 'tail', y0: g.stopY[MAP_STOPS - 1], y1: g.apertureY0, s0: MAP_STOPS - 1,
      s1: MAP_STOPS - 1, tail: true,
    })

    // A stream's footprint, for the scrim that stands the wall bytes back
    // under the water and for the mask that keeps carriers behind it.
    const footprints = []
    for (let i = 0; i < n; i++) {
      const left = []
      const right = []
      const end = i === hero ? g.apertureY0 : g.mistY
      const steps = 26
      for (let q = 0; q <= steps; q++) {
        const y = g.fallTop + ((end - g.fallTop) * q) / steps
        let s = 0
        while (s < MAP_STOPS - 1 && y > g.stopY[s + 1]) s++
        const y0 = s === 0 && y < g.rimY ? g.fallTop : g.stopY[s]
        const y1 = g.stopY[Math.min(s + 1, MAP_STOPS - 1)]
        const k = y1 > y0 ? Math.min(1, Math.max(0, (y - y0) / (y1 - y0))) : 0
        const s1 = Math.min(s + 1, MAP_STOPS - 1)
        const w = (hw[i][s] + (hw[i][s1] - hw[i][s]) * k) * 2.6 + 2.6
        const cx = centreX(i, y)
        left.push(`${f2(cx - w)} ${f2(y)}`)
        right.push(`${f2(cx + w)} ${f2(y)}`)
      }
      footprints.push(`M ${left.join(' L ')} L ${right.reverse().join(' L ')} Z`)
    }

    // Each carrier: out of the source stream into the dark air above the
    // wall, across, then down one lane just outside the hero's own width and
    // into it at that block's depth.
    for (const tr of transfers) {
      const top = g.bandTop[tr.layer]
      const lift = top - (g.compact ? 32 : 20)
      const lane =
        xs[hero] - (hw[hero][tr.layer + 1] + (g.compact ? 18 : 11) + tr.lane * (g.compact ? 14 : 9))
      const stop = g.bandMid[tr.layer]
      const x0 = xs[tr.src]
      const dx = lane - x0
      const c1 = dx > 400
        ? { x: x0 + dx * 0.34, y: lift - 46 }
        : { x: x0 + dx * 0.45, y: lift - 13 }
      const c2 = dx > 400
        ? { x: lane - dx * 0.28, y: lift - 14 }
        : { x: lane - dx * 0.30, y: lift + 12 }
      const end = { x: lane, y: lift + 30 }
      const raw = []
      for (let k = 0; k <= 44; k++) {
        const u = k / 44
        const m = 1 - u
        raw.push({
          x: m * m * m * x0 + 3 * m * m * u * c1.x + 3 * m * u * u * c2.x + u * u * u * end.x,
          y: m * m * m * lift + 3 * m * m * u * c1.y + 3 * m * u * u * c2.y + u * u * u * end.y,
        })
      }
      for (let k = 1; k <= 10; k++) {
        raw.push({ x: lane, y: end.y + ((stop - 22 - end.y) * k) / 10 })
      }
      for (let k = 1; k <= 12; k++) {
        const u = k / 12
        const m = 1 - u
        raw.push({
          x: m * m * lane + 2 * m * u * lane + u * u * xs[hero],
          y: m * m * (stop - 22) + 2 * m * u * (stop - 3) + u * u * stop,
        })
      }
      // The normal at each sample, so the carrier's internal filaments run
      // alongside it rather than across it.
      tr.points = raw.map((point, k) => {
        const a = raw[Math.max(0, k - 1)]
        const b = raw[Math.min(raw.length - 1, k + 1)]
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
        return { x: point.x, y: point.y, nx: -(b.y - a.y) / len, ny: (b.x - a.x) / len }
      })
      tr.lift = lift
      tr.stopY = stop
      tr.laneX = lane
    }

    // The landing. It belongs to the last position and to no other, so it is
    // always drawn from the last position's logits — dimmed, and said, when
    // the reader has made an earlier token the hero.
    let landing = null
    if (splash) {
      const max = splash[0].p
      const bars = splash.map((candidate, i) => {
        const h = 16 + g.barMaxH * (candidate.p / max)
        return {
          id: candidate.id,
          token: candidate.token,
          p: candidate.p,
          x: g.barX0 + i * g.barPitch,
          h,
          top: g.barBase - h,
          argmax: finalTop != null && candidate.id === finalTop.id,
          pick: nextToken != null && candidate.token === nextToken,
        }
      })
      landing = { bars }
    }

    return {
      n, hero, xs, slot, hw, alpha, t, plan,
      rel: filaments.rel, bins: filaments.bins,
      centreX, segments, footprints, transfers, landing,
      landingHere: hero === n - 1,
      apertureX: xs[n - 1],
    }
  }, [
    n, filaments, field, g, hero, registers, splash, finalTop, nextToken, plan, block,
  ])

  // What the instrument has on screen, for the console check. Dev only; the
  // bundler drops the branch in a production build.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    globalThis.__mapState =
      live && draw && field
        ? {
            real: true,
            key: run.key,
            ids: run.ids,
            hero,
            block,
            group: plan.group,
            autoHeads,
            buffers: run.residuals.map((r) => r.buffer),
            norms: field.rows.map((row) => Array.from(row)),
            filaments: draw.bins.map((rows) => rows.map((row) => Array.from(row))),
            transfers: draw.transfers.map((tr) => ({
              layer: tr.layer, head: tr.head, src: tr.src, w: tr.w,
            })),
            heads: heads ? Array.from(heads) : null,
            landing: draw.landing ? draw.landing.bars.map((b) => ({ id: b.id, p: b.p })) : [],
          }
        : { real: false }
  }, [live, draw, field, run, hero, block, plan, autoHeads, heads])

  const factsFor = useCallback((name) => tensorFacts(manifest, name), [manifest])
  const partFacts = part ? factsFor(part) : null
  const handlePart = useCallback((name) => {
    setPart((prev) => (prev === name ? null : name))
  }, [])

  const heroToken = sequence[hero]
  const silent = registers ? registers.find((reg) => reg && reg.kept.length === 0) : null

  const note = () => {
    if (n === 0) return 'no input — type something into instrument A'
    if (pending || waiting) return 'running distilgpt2…'
    if (!armed) return 'illustrative — the walls are real, the fall is a schematic'
    if (!live) return 'the walls are real — the fall is waiting on a pass'
    return `real pass · ‖residual‖ ${field.lo.toFixed(1)} → ${field.hi.toFixed(1)} · ${
      plan.count
    } filaments × ${plan.group} dims`
  }

  // --- the legend: every rule in the drawing, stated ------------------------
  const wall0 = windows ? wallWindow(windows, wallTensor(0)) : null
  const tensor0 = factsFor(wallTensor(0))
  const fileSize = facts?.provenance?.bytes
    ? `${(facts.provenance.bytes / 1e6).toFixed(1)} MB`
    : 'the'
  const count = (v) => v.toLocaleString('en-US')

  const legend = useMemo(() => {
    // Which stream is the fat one is a fact about this sentence, so it is
    // read off the field rather than asserted.
    let widest = '—'
    if (field) {
      let best = -Infinity
      for (let i = 0; i < field.rows.length; i++) {
        for (let s = 0; s < MAP_STOPS; s++) {
          if (field.rows[i][s] > best) {
            best = field.rows[i][s]
            widest = sequence[i]
          }
        }
      }
    }
    const rows = wall0?.rows ?? 24
    const cols = wall0?.cols ?? 64
    const walls = compact
      ? `Six fields, one a block. Every cell is one real i8 byte of that block’s attn.c_attn.weight — the ${rows} × ${cols} window the ${fileSize} file’s own reading keeps, ${count(rows * cols)} cells a wall, never reshaped. Brightness is the byte on the middle 96% of that window, so a few extremes cannot black it out. Frozen: a pass changes none of them. Cells stand back to 55% under a stream and to 10% under a carrier or a label.`
      : `Six full-width fields, one for each block. Every cell is one real i8 byte of that block’s attn.c_attn.weight as the ${fileSize} file stores it — the ${rows} × ${cols} window this page’s own reading of the file keeps of a ${count(wall0?.totalRows ?? 768)} × ${count(wall0?.totalCols ?? 2304)} tensor, ${count(rows * cols)} cells a wall, ${count(tensor0?.byteLength ?? 0)} bytes in the file for the whole tensor. The window keeps its own shape: reshaping it would put bytes side by side that are not side by side in the tensor. Brightness is the byte’s own value stretched across the middle 96% of that window, so a handful of extremes cannot black the wall out. Frozen — the pass never changes one of them. Cells under the water stand back to 55%, and to 10% under a carrier or a label, so no byte is ever read as light.`

    const spacing = `${n} stream${n === 1 ? '' : 's'} across ${Math.round(g.trackW)} units, ${Math.round(draw?.slot ?? 0)} apart`
    const fall = !live
      ? compact
        ? `One stream a token. No pass has run, so every stream is drawn at one width and one light — no magnitude is claimed. The grain inside is the deterministic stand-in instrument D prints, 768 numbers binned into ${plan.count} filaments of ${plan.group}, and it is a stand-in, not a measurement. Spacing: ${spacing}. The last word is the hero; click any token to make it one.`
        : `One stream a token, falling through all six walls. No pass has run, so every stream is drawn at one width and one light: nothing here claims a magnitude. The grain inside a stream is the deterministic stand-in instrument D prints, its 768 numbers binned into ${plan.count} filaments of ${plan.group} dimensions each — a stand-in, and not a measurement. Spacing scales with the sentence: ${spacing}, and the drawing’s height never changes with it. The last word is the hero, and clicking any token makes it the hero instead.`
      : compact
        ? `One stream a token. Width, light and grain density are the real length (L2) of that token’s 768-number vector at each of the seven depths — ${field.lo.toFixed(2)} to ${count(Number(field.hi.toFixed(2)))} — on one log law shared by all ${n}; the widest stream is ${widest}. Inside, the 768 dimensions are ${plan.count} filaments of ${plan.group}: a filament’s grain is the mean |value| of its own dimensions there, against the brightest filament in that stream at that depth. Spacing: ${spacing}. Hero: ${heroToken ?? '—'} — click any token.`
        : `One stream a token, ${n} of them, falling through all six walls. Width, light and grain density are the real length (L2) of that token’s 768-number running vector at each of the seven depths — ${field.lo.toFixed(2)} at the rim up to ${count(Number(field.hi.toFixed(2)))} — on one log law shared by all ${n}, and the widest stream is ${widest}. GPT-2’s first piece carries the attention sink, which is usually what makes it the fat one. Inside a stream the 768 dimensions are drawn as ${plan.count} filaments of ${plan.group} dimensions each: a filament’s grain is the mean |value| of its own ${plan.group} dimensions at that depth, scaled against the brightest filament in that same stream at that same depth. Spacing scales with the sentence — ${spacing} — and the drawing’s height never changes with it. The hero is ${heroToken ?? '—'}, the only stream that reaches the landing; clicking any token makes it the hero. The others end as dim grains.`

    const heads = autoHeads
      ? autoHeads.map((h, l) => `b${l} h${block === l && headPick != null ? headPick : h}`).join(', ')
      : ''
    const nearMiss = silent
      ? ` Block ${silent.layer} draws nothing, and the number beside the hero is what it sent to itself: ${silent.selfWeight.toFixed(4)}${
          silent.best
            ? `, against its best other source ${sequence[silent.best.src]} at ${silent.best.w.toFixed(4)}`
            : ''
        }. Nothing was lowered to manufacture a transfer.`
      : ''
    const transfers = !live
      ? compact
        ? `There is no attention to draw without a pass, so no carriers are drawn. Load the real model and each block reads the hero’s own row: green tick = the key that matched, amber carrier = the weight.`
        : `There is no attention until a pass has run, so no carrier is drawn here. With the real model in hand, each block takes the head that sends the most attention away from the first token and away from itself, and draws the hero’s own sources at or above ${TRANSFER_FLOOR}, at most ${2}: a green tick at the key that matched, an amber carrier whose width and light are that weight, and a brighter hero below the absorption.`
      : compact
        ? `Per block, from the head that sends the most attention away from the first token and away from itself (${heads}), the hero’s own sources at or above ${TRANSFER_FLOOR}, at most 2. Self-attention is never a transfer — it is the stream continuing. Green tick = the key that matched; the carrier’s width and light are that weight; the hero runs brighter below each absorption.${nearMiss} Carriers keep to the dark air and pass behind every other stream. The twelve squares beside an open register are lit by the share of the hero’s attention that leaves itself in each head.`
        : `Per block, from the head that sends the most attention away from the first token and away from itself (${heads}) — the HEAD chips overrule that rule for an open block — the hero’s own sources at or above ${TRANSFER_FLOOR}, at most 2. Self-attention is never a transfer: it is the stream continuing, and it is drawn as the stream. Green tick = the key that matched; the amber carrier’s width and light are that real weight; the hero runs brighter below each absorption, and that brightness is the weight too.${nearMiss} Carriers keep to the dark air above the walls and drop into the hero down one dimmed lane; where a carrier meets another stream it passes behind it. With one register open the other five stand back, and the twelve squares beside it are lit by the share of the hero’s attention that leaves itself in each head — which is what a head chip lets you read a different one of.`

    const argmaxLine = finalTop && splash
      ? `${finalTop.token} at ${((splash.find((s) => s.id === finalTop.id)?.p ?? 0) * 100).toFixed(1)}%`
      : ''
    const pickBar = splash?.find((s) => s.token === nextToken)
    const landing = !live
      ? compact
        ? `The last position’s vector against all 50,257 words. It needs a pass — load the real model and the bars are this sentence’s own softmax.`
        : `Where the last position’s vector meets all 50,257 words. There is no distribution without a pass, so no bar is drawn: load the real model and the bars become this sentence’s own softmax, top ${g.splashN}.`
      : compact
        ? `Only the hero reaches it, and it is the last position’s alone. The ${g.splashN} bars are this pass’s own softmax over all 50,257 words. ${argmaxLine} is the machine’s own top, drawn blue; ${pickBar ? `${pickBar.token} at ${(pickBar.p * 100).toFixed(1)}%` : (nextToken ?? '—')} is what the sampler took (temperature ${DECODING.temperature}, top-k ${DECODING.topK}, repetition penalty ${DECODING.repetitionPenalty}, seed ${DECODING.seed}) and carries the amber mark. Same input → same trace, every time.`
        : `Only the hero reaches it, and it is the last position’s alone — ${
            draw?.landingHere
              ? 'which is where the hero is'
              : 'so with an earlier token as the hero it stays anchored there and stands back'
          }. The ${g.splashN} bars are this pass’s own softmax over all 50,257 words, top ${g.splashN}, counted from the last position’s vector and from nothing else. ${argmaxLine} is the machine’s own top and is drawn blue; ${
            pickBar ? `${pickBar.token} at ${(pickBar.p * 100).toFixed(1)}%` : (nextToken ?? '—')
          } is what the shipped sampler took (temperature ${DECODING.temperature}, top-k ${DECODING.topK}, repetition penalty ${DECODING.repetitionPenalty}, seed ${DECODING.seed}) and carries the amber mark. A bar’s height is its probability and the rows of dots are how that height is counted. Chance appears nowhere above it: same input → same trace, every time.`

    return [
      ['THE WALLS', walls],
      ['THE FALL', fall],
      ['THE TRANSFERS', transfers],
      ['THE LANDING', landing],
    ]
  }, [
    compact, wall0, tensor0, fileSize, n, g, draw, live, field, plan, heroToken,
    autoHeads, block, headPick, silent, sequence, splash, finalTop, nextToken,
  ])

  const legendLines = useMemo(
    () =>
      legend.map(([key, body], i) => [key, wrapText(body, g.legCols, g.legLines[i])]),
    [legend, g],
  )

  const fine = live
    ? `real distilgpt2 · ${REAL_LAYERS} blocks · ${REAL_HEADS} heads · d ${REAL_HIDDEN}${
        manifest ? ` · ${(manifest.parameters / 1e6).toFixed(1)}M parameters` : ''
      } · one pass on the sentence above, run in this browser · nothing in the picture is a stand-in: the only marks that carry no number are the aperture outline and the bloom around the light.`
    : `real distilgpt2 · ${REAL_LAYERS} blocks · ${REAL_HEADS} heads · d ${REAL_HIDDEN}${
        manifest ? ` · ${(manifest.parameters / 1e6).toFixed(1)}M parameters` : ''
      } · the walls are the real file in every mode; the fall, the transfers and the landing wait on a pass. The only marks that carry no number are the aperture outline and the bloom around the light.`
  const fineLines = useMemo(
    () => wrapText(fine, Math.floor((SW - 18) / (g.fs.legFine * 0.6)), g.fineLines),
    [fine, g],
  )

  const chipW = Math.min(g.compact ? 150 : 96, (draw?.slot ?? 96) - 6)

  const openWindow = (letter, target, label) => (
    <button
      key={letter}
      type="button"
      className="mr-open"
      aria-label={label}
      onClick={() => onOpenInstrument(target)}
    >
      {letter}
    </button>
  )

  return (
    <figure className="instrument" id="inst-forward-figure">
      <InstrumentHead
        eyebrow="INSTRUMENT F"
        title="The forward pass, live"
        purpose="Six frozen walls of the file’s own weight bytes, and your sentence falling through them as light. The sentence is the only moving thing in the picture: attention picks a source in green, carries its value in amber, and leaves the last word rich enough to say what comes next."
        note={
          <LoadNote
            label={
              armed
                ? architectureNote(manifest)
                : 'the walls are real in both modes — the fall needs the model'
            }
            status={modelStatus}
            progress={progress}
            onLoad={onLoad}
          />
        }
        stacked
      />

      <div className="inst-body">
        <ReadingLine text={text} />

        <div className="map-controls">
          <div className="mr-chiprow">
            <span className="mr-sel-label">BLOCK</span>
            <button
              type="button"
              className={`mr-chip${block == null ? ' is-on' : ''}`}
              aria-pressed={block == null}
              aria-label="show all six registers"
              onClick={() => {
                setBlockOpen(false)
                setHeadPick(null)
              }}
            >
              ALL
            </button>
            {Array.from({ length: REAL_LAYERS }, (_, l) => (
              <button
                key={l}
                type="button"
                className={`mr-chip${block === l ? ' is-on' : ''}`}
                aria-pressed={block === l}
                aria-label={`open register ${l}`}
                onClick={() => {
                  setBlockOpen(true)
                  setHeadPick(null)
                  onLayerChange(l)
                }}
              >
                {l}
              </button>
            ))}
            <button type="button" className="btn map-run-btn" onClick={runAgain}>
              RUN THE PASS
            </button>
            <InfoTag topic={armed ? 'mapReal' : 'map'} />
          </div>
          <div className="mr-chiprow">
            <span className="mr-sel-label">HEAD</span>
            <button
              type="button"
              className={`mr-chip${headPick == null ? ' is-on' : ''}`}
              aria-pressed={headPick == null}
              aria-label="read each block’s transfers from the head the rule picks"
              disabled={block == null}
              onClick={() => setHeadPick(null)}
            >
              RULE
            </button>
            {Array.from({ length: REAL_HEADS }, (_, h) => (
              <button
                key={h}
                type="button"
                className={`mr-chip${headPick === h ? ' is-on' : ''}`}
                aria-pressed={headPick === h}
                aria-label={`read the open register’s transfers from head ${h}`}
                disabled={block == null}
                onClick={() => setHeadPick(h)}
              >
                {h}
              </button>
            ))}
          </div>
          <div className="mr-chiprow mr-openrow">
            <span className="mr-opens">
              OPEN
              {openWindow('A', 'tokenizer', 'open instrument A, the tokenizer')}
              {openWindow('B', 'stepper', 'open instrument B, the forward pass and the KV rack')}
              {openWindow('C', 'attention', 'open instrument C, one head in detail')}
              {openWindow('D', 'glass', 'open instrument D, the glass pass on this token')}
              {openWindow('E', 'file', 'open instrument E, the file')}
            </span>
          </div>
          <span className="map-ctl-note">{note()}</span>
        </div>

        <div className="map-screen screen" style={{ aspectRatio: `${SW} / ${g.H}` }}>
          <svg
            className="map-svg"
            viewBox={`0 0 ${SW} ${g.H}`}
            role="img"
            aria-label={`one pass of distilgpt2 drawn as a memory room: six full-width walls of real weight bytes, ${n} granular token streams falling through them, the attention transfers into ${
              heroToken ?? 'the hero'
            }, and the landing on the last position’s top ${g.splashN} next words`}
          >
            <defs>
              <linearGradient id="mr-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#070A0D" />
                <stop offset=".62" stopColor="#05070A" />
                <stop offset="1" stopColor="#030507" />
              </linearGradient>
            </defs>
            <rect width={SW} height={g.H} fill="url(#mr-fade)" />

            <Walls g={g} windows={windows} />

            {/* Where a cell must stand back so that nothing on top of it is
                ambiguous. The scrim is painted in the screen's own ground, so
                a cell under it composites to exactly the fraction the legend
                names — and the walls themselves stay untouched, which is why
                a keystroke does not rebuild nine thousand cells. */}
            {draw ? (
              <g className="mr-scrims">
                {block != null
                  ? Array.from({ length: REAL_LAYERS }, (_, l) =>
                      l === block ? null : (
                        <rect
                          key={l}
                          x={g.bandX}
                          y={g.bandTop[l]}
                          width={g.bandW}
                          height={g.bandH}
                          fill="url(#mr-fade)"
                          opacity="0.42"
                        />
                      ),
                    )
                  : null}
                {draw.footprints.map((d, i) => (
                  <path key={i} d={d} fill="url(#mr-fade)" opacity="0.45" />
                ))}
                {draw.transfers.map((tr) => (
                  <path
                    key={tr.id}
                    d={`M ${tr.points.map((p) => `${f2(p.x)} ${f2(p.y)}`).join(' L ')}`}
                    fill="none"
                    stroke="url(#mr-fade)"
                    strokeWidth={f2((4 + 3 * tr.w) * 2 + 8)}
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                ))}
              </g>
            ) : null}

            {/* Each wall says which register it is, which head its transfers
                came from, and which tensor it is cut out of. The plate is a
                button: it prints the readout under the drawing and opens that
                row of the file. */}
            {Array.from({ length: REAL_LAYERS }, (_, l) => {
              const top = g.bandTop[l]
              const name = wallTensor(l)
              const wall = windows ? wallWindow(windows, name) : null
              const tensor = factsFor(name)
              const on = part === name
              const short = tensor ? tensor.display.replace(`h.${l}.`, '') : 'attn.c_attn'
              return (
                <g key={l} className={block === l ? 'mr-reg is-open' : 'mr-reg'}>
                  <rect
                    className="mr-reg-frame"
                    x={g.bandX - 4}
                    y={top - 4}
                    width={g.bandW + 8}
                    height={g.bandH + 8}
                    rx="2"
                  />
                  <g
                    className={on ? 'mr-plate is-on' : 'mr-plate'}
                    role="button"
                    tabIndex={0}
                    aria-label={`read ${tensor ? tensor.display : name} out of the file`}
                    aria-pressed={on}
                    onClick={() => handlePart(name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handlePart(name)
                      }
                    }}
                  >
                    <title>{partReadout(tensor)}</title>
                    <rect
                      className="mr-plate-hit"
                      x={g.bandX}
                      y={top}
                      width={g.bandW}
                      height={g.bandH}
                    />
                    <text
                      className="mr-tensor"
                      x={SW - 8}
                      y={top - (compact ? 34 : 24)}
                      textAnchor="end"
                      style={{ fontSize: g.fs.tensor }}
                    >
                      {short.toUpperCase()}
                    </text>
                    <text
                      className="mr-tensor is-fine"
                      x={SW - 8}
                      y={top - (compact ? 16 : 10)}
                      textAnchor="end"
                      style={{ fontSize: g.fs.tensor }}
                    >
                      {`${wall?.rows ?? 24} × ${wall?.cols ?? 64} WINDOW · ${
                        tensor?.dtype ?? 'i8'
                      }`}
                    </text>
                  </g>
                  <text
                    className="mr-label"
                    x="8"
                    y={top + g.fs.reg}
                    style={{ fontSize: g.fs.reg }}
                  >
                    {`BLOCK ${l}`}
                  </text>
                  <text
                    className="mr-label is-dim"
                    x="8"
                    y={top + g.fs.reg * 2.2}
                    style={{ fontSize: g.fs.reg }}
                  >
                    {`HEAD ${live ? headFor(l) : '—'}`}
                  </text>
                  {/* Twelve heads, outlined in every register and filled only
                      in the open one, by the share of the hero's attention
                      each head spends anywhere but on itself. */}
                  {Array.from({ length: REAL_HEADS }, (_, h) => {
                    const size = compact ? 12 : 7
                    const gap = compact ? 3 : 2
                    const share = block === l && heads ? heads[h] : null
                    return (
                      <rect
                        key={h}
                        className={share == null ? 'mr-head' : 'mr-head is-lit'}
                        style={share == null ? undefined : { fillOpacity: 0.12 + 0.88 * share }}
                        x={8 + h * (size + gap)}
                        y={top - size - (compact ? 12 : 8)}
                        width={size}
                        height={size}
                        rx="1"
                      />
                    )
                  })}
                </g>
              )
            })}

            {draw ? <Carriers g={g} draw={draw} /> : null}
            {draw ? <Streams key={replay} g={g} draw={draw} /> : null}

            {/* The transfers, said: a green key at the source, the weight
                beside it, and the bloom where the hero takes it in. */}
            {draw
              ? draw.transfers.map((tr) => {
                  const x = draw.xs[tr.src]
                  const label = `${sequence[tr.src]} · ${tr.w.toFixed(4)}`
                  const key = `KEY · B${tr.layer} H${tr.head}`
                  const room = Math.max(label.length, key.length) * g.fs.callout * 0.6
                  // Beside the source, in the dark gap between two streams —
                  // never over one where there is a gap to sit in. The gap to
                  // the right unless the source is the last stream.
                  // The right-hand gap unless the source is the last stream,
                  // or unless that gap would put the words in the margin the
                  // wall keeps for the name of the tensor it is cut from.
                  const nameMargin = compact ? 300 : 250
                  const right = tr.src < n - 1 && x + draw.slot / 2 + room / 2 < SW - nameMargin
                  const lx = Math.min(
                    SW - 10 - room / 2,
                    Math.max(10 + room / 2, x + ((right ? 1 : -1) * draw.slot) / 2),
                  )
                  const ly = tr.lift - (compact ? 24 : 16) - tr.lane * g.fs.callout * 2.4
                  return (
                    <g
                      key={tr.id}
                      className={tr.standBack ? 'mr-event is-back' : 'mr-event'}
                    >
                      <g className="mr-key">
                        <rect x={x - 8.5} y={tr.lift - 1.8} width="17" height="3.6" rx="1.2" />
                        {Array.from({ length: 4 }, (_, k) => (
                          <rect
                            key={k}
                            x={x - 12 + k * 8}
                            y={tr.lift - 6.4}
                            width="1.6"
                            height="1.6"
                            rx=".5"
                            opacity=".7"
                          />
                        ))}
                      </g>
                      {/* A scrim in the screen's own ground, so the two
                          lines stay legible over whatever they land on and
                          nothing behind them can be mistaken for light. */}
                      <rect
                        x={lx - room / 2 - 4}
                        y={ly - g.fs.callout * 2.1}
                        width={room + 8}
                        height={g.fs.callout * 2.5}
                        fill="url(#mr-fade)"
                        opacity="0.92"
                      />
                      <text
                        className="mr-callout"
                        x={lx}
                        y={ly}
                        textAnchor="middle"
                        style={{ fontSize: g.fs.callout }}
                      >
                        {label}
                      </text>
                      <text
                        className="mr-callout is-key"
                        x={lx}
                        y={ly - g.fs.callout * 1.05}
                        textAnchor="middle"
                        style={{ fontSize: g.fs.fine }}
                      >
                        {key}
                      </text>
                      <g className="mr-absorb">
                        <circle
                          cx={draw.xs[hero]}
                          cy={tr.stopY}
                          r={3 + 12 * tr.w}
                          opacity={f2(0.06 + 0.07 * tr.w)}
                        />
                        <circle
                          cx={draw.xs[hero]}
                          cy={tr.stopY}
                          r={2 + 6.5 * tr.w}
                          opacity={f2(0.1 + 0.13 * tr.w)}
                        />
                        <circle
                          cx={draw.xs[hero]}
                          cy={tr.stopY}
                          r={0.9 + 2.2 * tr.w}
                          opacity={f2(0.3 + 0.42 * tr.w)}
                        />
                      </g>
                    </g>
                  )
                })
              : null}

            {/* A register that draws nothing says so where it would have
                drawn, with the number that made it a near miss. */}
            {registers
              ? registers.map((reg) => {
                  if (!reg || reg.kept.length > 0 || !draw) return null
                  const label = `no transfer · self ${reg.selfWeight.toFixed(2)}`
                  const room = label.length * g.fs.quiet * 0.6
                  const x = draw.xs[hero] - draw.hw[hero][reg.layer + 1] - 14
                  const y = g.bandMid[reg.layer] + 3
                  return (
                    <g key={reg.layer}>
                      {/* The wall stands back behind the line, as it does
                          behind a callout, so no byte is read as light and
                          the words stay words. */}
                      <rect
                        x={x - room - 5}
                        y={y - g.fs.quiet}
                        width={room + 10}
                        height={g.fs.quiet * 1.45}
                        fill="url(#mr-fade)"
                        opacity="0.92"
                      />
                      <text
                        className="mr-quiet"
                        x={x}
                        y={y}
                        textAnchor="end"
                        style={{ fontSize: g.fs.quiet }}
                      >
                        {label}
                      </text>
                    </g>
                  )
                })
              : null}

            {/* --- the sentence, across the top --- */}
            <text className="mr-note" x="8" y={g.fs.note + 6} style={{ fontSize: g.fs.note }}>
              {compact
                ? 'THE SENTENCE — ONE STREAM EACH'
                : 'THE SENTENCE — ONE STREAM EACH; CLICK ONE TO MAKE IT THE HERO'}
            </text>
            {draw
              ? draw.xs.map((x, i) => {
                  const on = i === hero
                  return (
                    <g
                      key={i}
                      className={on ? 'mr-tok is-hero' : 'mr-tok'}
                      role="button"
                      tabIndex={0}
                      aria-label={`make position ${i}, ${sequence[i]}, the hero`}
                      aria-pressed={on}
                      onClick={() => onSelect(i)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onSelect(i)
                        }
                      }}
                    >
                      <title>{`${i} · ${sequence[i]}`}</title>
                      <rect
                        x={x - chipW / 2}
                        y={g.chipY}
                        width={chipW}
                        height={g.chipH}
                        rx="2"
                      />
                      <text
                        x={x}
                        y={g.chipY + g.chipH * 0.68}
                        textAnchor="middle"
                        style={{ fontSize: g.fs.chip }}
                      >
                        {clip(sequence[i], g.fs.chip, chipW - 6)}
                      </text>
                    </g>
                  )
                })
              : null}
            <text
              className="mr-label"
              x="8"
              y={g.rimY - 4}
              style={{ fontSize: g.fs.reg }}
            >
              RIM
            </text>
            <text
              className="mr-label is-dim"
              x="8"
              y={g.rimY + g.fs.reg + 2}
              style={{ fontSize: g.fs.reg }}
            >
              WTE+WPE
            </text>

            {/* --- the landing --- */}
            <text
              className="mr-note"
              x="8"
              y={g.landTitleY}
              style={{ fontSize: g.fs.land }}
            >
              {compact
                ? 'LAST POSITION → 50,257 WORDS'
                : `LAST POSITION → 50,257 WORDS · TOP ${g.splashN}`}
            </text>
            {draw ? (
              <>
                <g className="mr-absorb">
                  <circle cx={draw.apertureX} cy={g.apertureY0} r="15" opacity=".07" />
                  <circle cx={draw.apertureX} cy={g.apertureY0} r="7.5" opacity=".13" />
                  <circle cx={draw.apertureX} cy={g.apertureY0} r="2.6" opacity=".55" />
                </g>
                <g
                  className="mr-plate mr-aperture-plate"
                  role="button"
                  tabIndex={0}
                  aria-label="read the word table back out of the file — the same wte the embedding uses, tied, and turned on its side"
                  aria-pressed={part === 'transformer.wte.weight_quantized'}
                  onClick={() => handlePart('transformer.wte.weight_quantized')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handlePart('transformer.wte.weight_quantized')
                    }
                  }}
                >
                  <title>{partReadout(factsFor('transformer.wte.weight_quantized'))}</title>
                  <rect
                    x={draw.apertureX - (compact ? 90 : 55)}
                    y={g.apertureY0}
                    width={compact ? 180 : 110}
                    height={g.apertureH}
                    rx="2"
                    fill="url(#mr-fade)"
                    opacity="0.9"
                  />
                  <rect
                    className="mr-aperture"
                    x={draw.apertureX - (compact ? 90 : 55)}
                    y={g.apertureY0}
                    width={compact ? 180 : 110}
                    height={g.apertureH}
                    rx="2"
                  />
                  <text
                    className="mr-aperture-note"
                    x={draw.apertureX}
                    y={g.apertureY0 + g.apertureH * 0.68}
                    textAnchor="middle"
                    style={{ fontSize: g.fs.aperture }}
                  >
                    UNEMBED · WTEᵀ
                  </text>
                </g>
              </>
            ) : null}
            {draw?.landing ? (
              <>
                <Landing key={`landing-${replay}`} g={g} draw={draw} />
                {draw.landing.bars.map((bar) => (
                  <g key={bar.id}>
                    <text
                      className={
                        bar.argmax
                          ? 'mr-prob is-argmax'
                          : bar.pick
                            ? 'mr-prob is-pick'
                            : 'mr-prob'
                      }
                      x={bar.x}
                      y={g.barBase + g.fs.prob + 6}
                      textAnchor="middle"
                      style={{ fontSize: g.fs.prob }}
                    >
                      {clip(bar.token, g.fs.prob, g.barPitch - 8)}
                    </text>
                    <text
                      className="mr-prob is-p"
                      x={bar.x}
                      y={g.barBase + g.fs.prob + g.fs.probp + 10}
                      textAnchor="middle"
                      style={{ fontSize: g.fs.probp }}
                    >
                      {`${(bar.p * 100).toFixed(1)}%`}
                    </text>
                    {bar.pick ? (
                      <path
                        className="mr-pick-mark"
                        d={`M ${bar.x - 6} ${g.barBase + g.fs.prob + g.fs.probp + 24} L ${
                          bar.x + 6
                        } ${g.barBase + g.fs.prob + g.fs.probp + 24} L ${bar.x} ${
                          g.barBase + g.fs.prob + g.fs.probp + 14
                        } Z`}
                      />
                    ) : null}
                  </g>
                ))}
                <line
                  className="mr-base-line"
                  x1={g.barX0 - g.barPitch / 2}
                  y1={g.barBase + 1}
                  x2={g.barX0 + (g.splashN - 0.5) * g.barPitch}
                  y2={g.barBase + 1}
                />
              </>
            ) : (
              <text
                className="mr-quiet"
                x="8"
                y={g.landTitleY + g.fs.quiet * 1.45}
                style={{ fontSize: g.fs.quiet }}
              >
                {waiting
                  ? 'the landing is waiting on this pass'
                  : 'the landing needs the real model — load it above'}
              </text>
            )}
            {draw && !draw.landingHere ? (
              <text
                className="mr-quiet"
                x="8"
                y={g.landTitleY + g.fs.quiet * 1.45}
                style={{ fontSize: g.fs.quiet }}
              >
                {compact
                  ? `the landing is the last word’s alone — hero: ${heroToken}`
                  : `the landing is the last word’s alone; ${heroToken} is the hero, so it stands back`}
              </text>
            ) : null}
            <text className="mr-key-line" x="8" y={g.keyY} style={{ fontSize: g.fs.key }}>
              {live && finalTop ? (
                <>
                  <tspan className="k-blue">■</tspan>
                  {` ${finalTop.token} BLUE — THE MACHINE’S OWN TOP · `}
                  <tspan className="k-amber">▲</tspan>
                  {` AMBER MARK — THE SAMPLER TOOK ${nextToken ?? '—'}`}
                </>
              ) : (
                'BLUE — THE MACHINE’S OWN TOP · AMBER MARK — THE SAMPLER’S PICK'
              )}
            </text>
            {compact ? (
              <text
                className="mr-key-line"
                x="8"
                y={g.keyY2}
                style={{ fontSize: g.fs.key }}
              >
                {`TEMP ${DECODING.temperature} · TOP-K ${DECODING.topK} · REP-PEN ${DECODING.repetitionPenalty} · SEED ${DECODING.seed}`}
              </text>
            ) : null}

            {/* --- the legend: every rule in the drawing, stated --- */}
            <line
              className="mr-leg-rule"
              x1="8"
              y1={g.legRuleY}
              x2={SW - 8}
              y2={g.legRuleY}
            />
            {(() => {
              let y = g.legTop
              const out = []
              legendLines.forEach(([key, lines], i) => {
                out.push(
                  <text
                    key={`k${key}`}
                    className="mr-leg-key"
                    x="8"
                    y={y}
                    style={{ fontSize: g.fs.legKey }}
                  >
                    {key}
                  </text>,
                )
                if (compact) y += g.legKeyLine
                lines.forEach((line, li) => {
                  out.push(
                    <text
                      key={`${key}-${li}`}
                      className="mr-leg"
                      x={g.legX}
                      y={y}
                      style={{ fontSize: g.fs.leg }}
                    >
                      {line}
                    </text>,
                  )
                  y += g.legLine
                })
                y += (g.legLines[i] - lines.length) * g.legLine + g.legGap
              })
              return out
            })()}
            {fineLines.map((line, i) => (
              <text
                key={i}
                className="mr-leg-fine"
                x="8"
                y={g.fineTop + i * g.fs.legFine * 1.35}
                style={{ fontSize: g.fs.legFine }}
              >
                {line}
              </text>
            ))}
          </svg>
        </div>

        <div className="map-readout-row">
          <p className="map-readout">{partReadout(partFacts)}</p>
          <button
            type="button"
            className="btn map-open-btn"
            disabled={!partFacts}
            onClick={() => partFacts && onOpenTensor(partFacts.name)}
          >
            OPEN IN THE FILE
          </button>
        </div>

        <TeachPair
          className="teach dim"
          show={armed ? 'b' : 'a'}
          a="the six walls are real in this mode too: every cell is one byte of that block's attention weights, read out of the file when this page was built, stretched across the middle 96% of its own window. what is not real is the fall — no model is running, so every stream is drawn at one width, the grain inside it is the deterministic stand-in instrument D prints, and there is no attention to carry and no landing to reach. load the real model and the same drawing fills with this sentence's own numbers."
          b="one drawing, five readings, all of them real. the walls are the file's own weight bytes; a stream's width and light are the length of that token's 768-number vector at each depth; the filaments inside it are those 768 numbers grouped and averaged; a carrier is one attention weight out of the block's chosen head, read at the hero's own row; and the landing is the softmax over all 50,257 words at the last position. the head rule, the floor under a transfer and both normalisations are stated in the legend, because a drawing that does not say what it is doing is a picture rather than an instrument."
        />
      </div>

      <figcaption>
        FIG.3 — one pass through distilgpt2, drawn as a memory room. Six walls
        of the file&rsquo;s own weight bytes; the sentence falling through them
        as light; the transfers attention makes into the last word; and the
        landing, where that word&rsquo;s vector meets all 50,257 of them.
      </figcaption>
    </figure>
  )
}
