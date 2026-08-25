import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  IDLE_MS,
  MOTION_PRESETS,
  buildTour,
  carrierWhy,
  cellWhy,
  motionPresetId,
  rayWhy,
  silentWhy,
  unembedWhy,
} from '../lib/tour.js'
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
 * the aperture outline, the bloom around the light, and — while the sheet is
 * running itself — the sweep of light that travels down it.
 *
 * Two things drive that picture over time, and both of them are timing rather
 * than data. The narrated run walks one pass at reading speed, a stop at a
 * time, with a line of plain words under the controls that speaks the pass's
 * own numbers; its stops, its dwells and every sentence it says come out of
 * `lib/tour.js`. And when the sheet is left alone — in view, tab visible,
 * reduced motion off — it starts running itself: a slow sweep down the fall,
 * a glint where the light crosses a wall, the carriers re-firing in turn. All
 * of that is CSS on a handful of overlay elements. Not one of the 9,216 wall
 * cells is re-rendered by any of it, which is the rule that keeps the whole
 * thing cheap enough to leave running.
 */

/** The drawing is this many units wide at every screen width. */
const SW = 1166

/**
 * Where the drawing changes setting.
 *
 * These two are the stylesheet's as well: `.instrument.is-fullbleed` breaks
 * the figure out of the essay's column at exactly FULL_MQ, which is what puts
 * a pixel under a unit and lets the type go back to its designed size. Change
 * one of these and the other has to change with it.
 */
const COMPACT_MQ = '(max-width: 640px)'
const FULL_MQ = '(min-width: 1200px)'

/** Whether a query holds right now, or false where there is no window. */
const mqMatches = (query) =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(query).matches

/** Whether the reader has asked for no animation. Checked, not assumed. */
const MOTION_MQ = '(prefers-reduced-motion: reduce)'

/** The speeds the tour offers. One of these multiplies every dwell. */
const SPEEDS = [1, 2, 4]

/**
 * How the drawing is revealed when no tour is running: all of it.
 *
 * The reveal is a set of numbers the stylesheet compares against each mark's
 * own index, so "everything" is simply a number larger than any index. The
 * frontier is a fraction of the drawing's height, and 1 is the bottom of it.
 */
const FULL_REVEAL = {
  front: 1, carriers: 999, bars: 999, aperture: 1, pick: 1, cue: null,
}

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
 * One law, three settings of it. The drawing is 1,166 units wide at every
 * width the page has, so what a setting really chooses is how many pixels sit
 * under a unit — and therefore how large a word set in units actually reads:
 *
 *   compact   ≤ 640 px    the screen is the phone's column, about 342 px of
 *                         it: a unit is 0.29 px, so the type is set roughly
 *                         twice the size of the column setting's and the
 *                         grain of the streams is coarser.
 *   column    641–1199 px  the screen is the essay's own column, 678 px: a
 *                         unit is 0.58 px, and the type is enlarged to suit.
 *   full      ≥ 1200 px    the figure breaks out of the column and takes the
 *                         sheet, 1,166 px of it: a unit is a pixel, so the
 *                         type and the grain go back to the sizes the drawing
 *                         was designed at.
 *
 * The stylesheet breaks the figure out at exactly the width FULL_MQ names, so
 * the two can never disagree about how many pixels are under a unit.
 *
 * The height is a function of the setting and of nothing else: not of how
 * many tokens are in the sequence, not of which block is open, not of whether
 * a model has loaded. That is what lets the sentence change without moving
 * the page.
 */
function geometryFor(compact, full) {
  /** One constant, one value per setting: the phone, the column, the sheet. */
  const per = (compactValue, columnValue, fullValue) =>
    compact ? compactValue : full ? fullValue : columnValue

  const fs = compact
    ? {
        note: 29, reg: 27, tensor: 24, chip: 30, callout: 29, fine: 24,
        quiet: 27, land: 28, aperture: 24, prob: 29, probp: 25, key: 25,
        legKey: 27, leg: 29, legFine: 25,
      }
    : full
      ? {
          note: 9.5, reg: 9, tensor: 8.5, chip: 11, callout: 10, fine: 8,
          quiet: 9.5, land: 9.5, aperture: 8, prob: 10, probp: 9, key: 9,
          legKey: 9.5, leg: 10.5, legFine: 9,
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
  const air = per(150, 94, 66)
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
  // How many characters of legend fit on a line. The advance of a legend
  // character includes its tracking, and at a pixel a unit leaving that out
  // puts the longest line three units past the screen's own edge. The two
  // narrower settings were wrapped and measured without it and land well
  // inside the edge anyway, so they keep the count they were verified with.
  const legAdvance = per(0.6, 0.6, MONO_ADVANCE + TRACK.leg)
  const legCols = Math.floor((SW - legX - 10) / (fs.leg * legAdvance))
  const fineCols = Math.floor((SW - 18) / (fs.legFine * legAdvance))
  // Reserved, not measured: the legend prints live numbers, so its wording
  // changes with the sentence. A block whose height followed its own text
  // would move everything below the figure on every keystroke. The fifth
  // entry is the tour and the ambient loop, which are rules of the drawing
  // like any other and are stated here rather than left to be discovered.
  const legLines = per([8, 9, 14, 7, 6], [9, 10, 13, 8, 8], [7, 7, 9, 6, 6])
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
    legKeyLine, fineTop, fineLines, fineCols,
    // Where the streams live: inside the walls, with the right-hand end left
    // clear for the tensor each wall is cut from.
    trackX: 70,
    trackW: 936,
    // The grain. A dash on a 1,166-unit drawing has to be sized in units, and
    // the three settings put very different numbers of pixels under a unit.
    // The stroke of a grain is published to the stylesheet rather than set
    // there, for the same reason: at one pixel a unit the mark the column
    // setting needs is a third too heavy.
    grain: per(2.4, 1.1, 0.6),
    grainWidth: per(1.75, 1.75, 1.05),
    grainWidthHero: per(2, 2, 1.2),
    H,
  }
}

/**
 * How wide a line of the drawing's type actually is, in drawing units.
 *
 * Every word on this screen is set in the page's mono face, so a line's width
 * is not an estimate: it is the number of characters times the advance, and
 * the advance of a monospaced glyph is a constant. IBM Plex Mono — and every
 * fallback under it — advances 0.6 em. What a `length × size × 0.6` guess
 * leaves out is the tracking: these labels are letter-spaced between 0.02 and
 * 0.13 em, which on a name of twenty characters is a fifth of its width, and
 * a scrim sized without it is a fifth too narrow at the end of the line. So
 * the tracking is a parameter here and every caller passes its own class's.
 */
const MONO_ADVANCE = 0.6
function textWidth(text, size, tracking) {
  return String(text).length * size * (MONO_ADVANCE + tracking)
}

/** The tracking each class of type on the screen is set with, in em. */
const TRACK = {
  label: 0.11, tensor: 0.1, callout: 0.02, key: 0.1, quiet: 0.06,
  note: 0.13, aperture: 0.11, leg: 0.01,
}

/**
 * How far the picture stands back behind something drawn on top of it.
 *
 * Two settings, both stated in the legend and both painted as a scrim in the
 * screen's own ground rather than as a per-cell alpha — which is what keeps
 * all 9,216 wall cells out of every re-render.
 */
/** Under the water: the wall keeps 55 % of its light. */
const SCRIM_WATER = 0.45
/** Under a carrier, a label or a plate: the wall keeps 8 %. */
const SCRIM_MARK = 0.92
/** What a reader is told the wall keeps under a mark, in per cent. */
const SCRIM_MARK_PCT = Math.round((1 - SCRIM_MARK) * 100)

/** The box a line of type occupies above and below its own baseline. */
const INK_ABOVE = 0.85
const INK_BELOW = 0.45

/** As much of a token as a chip can hold; the rest lives in its tooltip. */
function clip(text, size, width) {
  const room = chipRoom(size, width)
  return text.length <= room ? text : text.slice(0, room)
}

/** How many characters of a token a chip of this width can hold. */
function chipRoom(size, width) {
  return Math.max(1, Math.floor(width / (size * MONO_ADVANCE)))
}

/**
 * Below this many characters of room a chip stops trying to hold a word.
 *
 * Two characters of a word is not the word — it is a different word, and a
 * drawing that says "click one to make it the hero" while showing "Th" for
 * three separate pieces is asking the reader to pick between things it has
 * not shown them. Under the threshold the chips carry their position instead,
 * which is a number that is completely true at any width, and the words come
 * back everywhere they still fit: the hero is named in the legend, every
 * transfer source is named at its own callout, and each chip carries its own
 * piece as a tooltip and in its accessible name.
 */
const CHIP_MIN_CHARS = 3

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
 *
 * Its props are the geometry and the pass, and nothing else. That is
 * deliberate: the tour reveals the fall by moving a clip the stylesheet
 * drives, and the ambient loop animates an overlay, so neither of them is a
 * prop here and neither can cost this component a re-render. Thousands of
 * grains are built when the sentence changes and at no other time.
 */
const Streams = memo(function Streams({ g, draw }) {
  const { n, plan, segments } = draw
  return (
    <g className="mr-streams">
      {segments.map((seg) => (
        <g key={seg.key} className="mr-fall">
          {Array.from({ length: n }, (_, i) => {
            const hero = i === draw.hero
            const a0 = draw.alpha[i][seg.s0]
            const a1 = draw.alpha[i][seg.s1]
            const w0 = draw.hw[i][seg.s0]
            const w1 = draw.hw[i][seg.s1]
            // Below the last wall every stream fades into the mist but one:
            // the last position's, which is the one the landing is counted
            // from. It carries on to the aperture whether or not it is the
            // hero — dimmed, when it is not, because it is still the stream
            // that feeds the landing.
            const tail = seg.tail && i !== draw.reaches
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
 *
 * Each one carries its own index as a custom property and is a button. The
 * index is what the tour counts against to decide whether this transfer has
 * fired yet; the button is what answers a reader who clicks the line and
 * wants to know what it is. A grained sweep is not a hit target, so the hit
 * target is a fat transparent stroke down the carrier's own centre line.
 */
const Carriers = memo(function Carriers({ g, draw, onInspect }) {
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
      {draw.transfers.map((tr, ci) => {
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
          <g key={tr.id} className="mr-carrier" style={{ '--ci': ci }}>
            <g className="mr-carrier-ink" mask={`url(#mr-behind-${tr.id})`}>
              {paths}
            </g>
            <path
              className="mr-carrier-hit"
              d={tr.centre}
              role="button"
              tabIndex={0}
              aria-label={tr.aria}
              onClick={() => onInspect(tr)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onInspect(tr)
                }
              }}
            >
              <title>{tr.aria}</title>
            </path>
          </g>
        )
      })}
    </g>
  )
})

/**
 * The landing bars: dot grids whose row count is the real probability.
 *
 * A bar and its ray are one button. The ray is a hairline and the dots have
 * gaps between them, so the hit target is neither: it is a transparent stroke
 * along the ray and a transparent rect over the bar's own column.
 */
const Landing = memo(function Landing({ g, draw, onInspect }) {
  const { landing } = draw
  if (!landing) return null
  return (
    <g className={draw.landingHere ? 'mr-landing' : 'mr-landing is-away'}>
      {landing.bars.map((bar, i) => {
        const thread = `M ${f2(draw.apertureX)} ${f2(g.apertureY0 + g.apertureH)} Q ${f2(
          (draw.apertureX + bar.x) / 2,
        )} ${f2(g.apertureY0 + g.apertureH + 70)} ${f2(bar.x)} ${f2(bar.top - 8)}`
        const aria = `what the landing ray for ${bar.token} at ${(bar.p * 100).toFixed(1)}% is`
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
            style={{ '--bi': i }}
            role="button"
            tabIndex={0}
            aria-label={aria}
            onClick={() => onInspect(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onInspect(i)
              }
            }}
          >
            <title>{aria}</title>
            <path className="mr-thread" d={thread} />
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
            <path className="mr-ray-hit" d={thread} />
            <rect
              className="mr-bar-hit"
              x={f2(bar.x - g.barW / 2 - 3)}
              y={f2(bar.top - 8)}
              width={f2(g.barW + 6)}
              height={f2(g.barBase - bar.top + 8)}
            />
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
  const [compact, setCompact] = useState(() => mqMatches(COMPACT_MQ))
  const [full, setFull] = useState(() => mqMatches(FULL_MQ))
  // Asked, not assumed: a reader who has turned animation off gets the tour as
  // a stepper — the same stops, the same words, the same buttons, no timer —
  // and the ambient loop never starts at all.
  const [reduced, setReduced] = useState(() => mqMatches(MOTION_MQ))
  const [facts, setFacts] = useState(null)
  const [part, setPart] = useState(null)
  /** What a click on the sheet asked about: a carrier, a ray, a cell, a plate. */
  const [inspect, setInspect] = useState(null)
  /**
   * The tour: whether it has been opened, where it is, whether it is running
   * and how fast. `index` is a stop in the list `lib/tour.js` builds, and it
   * is the only thing that moves — every mark on the sheet reads its own
   * visibility off that stop's reveal through the stylesheet.
   */
  const [tour, setTour] = useState({ active: false, index: 0, playing: false, speed: 1 })
  /** Whether the sheet is currently running itself. */
  const [ambient, setAmbient] = useState(false)
  /** The motion study in force. A dev switch; with no querystring, preset a. */
  const preset = useMemo(
    () => motionPresetId(typeof window === 'undefined' ? '' : window.location.search),
    [],
  )
  const motion = MOTION_PRESETS[preset]

  const figureRef = useRef(null)
  const svgRef = useRef(null)
  const hoverRef = useRef(null)
  const timerRef = useRef(null)
  // Whether a register is open — which one is the layer instruments C and F
  // share, so the two can never disagree about it — and which head that
  // register's transfers are read from, or null for the rule.
  const [blockOpen, setBlockOpen] = useState(false)
  const [headPick, setHeadPick] = useState(null)
  const block = blockOpen ? layer : null

  // Two media queries, read before the first paint and then only on a change
  // of breakpoint, so the drawing is never laid out at the wrong scale. The
  // stylesheet answers the second of them for itself, at the same width.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const offs = [
      [COMPACT_MQ, setCompact],
      [FULL_MQ, setFull],
      [MOTION_MQ, setReduced],
    ].map(([query, set]) => {
      const mq = window.matchMedia(query)
      const onChange = (e) => set(e.matches)
      mq.addEventListener('change', onChange)
      set(mq.matches)
      return () => mq.removeEventListener('change', onChange)
    })
    return () => offs.forEach((off) => off())
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

  const g = useMemo(() => geometryFor(compact, full), [compact, full])
  const n = sequence.length
  const hero = Math.min(Math.max(lensIndex, 0), Math.max(0, n - 1))
  const runKey = run?.key ?? null
  const manifest = facts?.manifest ?? null
  const windows = facts?.windows ?? null

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
      // The aperture hangs at the last position, so the last position's
      // stream is the one whose footprint runs down to it. An earlier hero
      // ends in the mist with the rest: it is the hero of the transfers, not
      // of the landing, and drawing it into an aperture it does not feed
      // would be a picture of a claim the legend does not make.
      const end = i === n - 1 ? g.apertureY0 : g.mistY
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
      // The carrier's own centre line, written once: the scrim under it, the
      // hit target over it and the ambient re-fire all follow this path.
      tr.centre = `M ${tr.points.map((p) => `${f2(p.x)} ${f2(p.y)}`).join(' L ')}`
      tr.srcToken = sequence[tr.src]
      tr.aria =
        `what block ${tr.layer} head ${tr.head} carried out of ${sequence[tr.src]} ` +
        `into ${sequence[hero]} — ${tr.w.toFixed(4)}`
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
      // The one stream that carries on past the mist to the aperture.
      reaches: n - 1,
      apertureX: xs[n - 1],
    }
  }, [
    n, filaments, field, g, hero, registers, splash, finalTop, nextToken, plan, block,
    sequence,
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
            hero,
            block,
            group: plan.group,
            // Copies, not the live arrays: the check compares what was on
            // screen at this render against a pass it runs itself, and an
            // array either of them can still reach into is not that.
            autoHeads: autoHeads ? Array.from(autoHeads) : [],
            ids: Array.from(run.ids),
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
  const chipW = Math.min(g.compact ? 150 : 96, (draw?.slot ?? 96) - 6)
  // A chip too narrow to hold a word carries its position instead. Which one
  // is happening is stated on the drawing and in the legend, because the
  // reader is being asked to click these.
  const numberedChips = chipRoom(g.fs.chip, chipW - 6) < CHIP_MIN_CHARS

  const APERTURE_NOTE = 'UNEMBED · WTEᵀ'
  // The plate is sized from its own words rather than from a number that was
  // right for the words it had when it was drawn: at 390 the note ran a third
  // of its length outside the box it was supposed to sit in.
  const apertureW = Math.max(
    compact ? 180 : 110,
    textWidth(APERTURE_NOTE, g.fs.aperture, TRACK.aperture) + 18,
  )

  const wall0 = windows ? wallWindow(windows, wallTensor(0)) : null
  const tensor0 = factsFor(wallTensor(0))
  const fileSize = facts?.provenance?.bytes
    ? `${(facts.provenance.bytes / 1e6).toFixed(1)} MB`
    : 'the'
  const count = (v) => v.toLocaleString('en-US')

  // --- the narrated run -----------------------------------------------------
  //
  // The tour is a list of stops, and a stop is a line of words plus the whole
  // state of the drawing at that moment. Playing it is a timer that moves an
  // index; stepping it is the same index moved by hand; the reduced-motion
  // path is that index with no timer at all. Nothing below re-renders a wall.

  const tourPlan = useMemo(
    () =>
      buildTour({
        preset,
        live,
        n,
        sequence,
        hero,
        field,
        run: live ? run : null,
        registers,
        autoHeads,
        splash,
        finalTop,
        nextToken,
        decoding: DECODING,
        wall0,
        segmentCount: draw?.segments?.length ?? MAP_STOPS + 1,
      }),
    [
      preset, live, n, sequence, hero, field, run, registers, autoHeads, splash,
      finalTop, nextToken, wall0, draw,
    ],
  )
  const stages = tourPlan.stages
  const stageIndex = Math.min(Math.max(tour.index, 0), stages.length - 1)
  const stop = stages[stageIndex]

  /**
   * What the stylesheet is told, once per stop.
   *
   * `front` is how far down the drawing the light has reached, as a fraction
   * of its height; the rest are counts a mark compares its own index against.
   * All of it is inherited into the SVG as custom properties, which is why a
   * stop can move the picture without any of the memoised layers re-rendering.
   */
  const reveal = useMemo(() => {
    if (!tour.active) return FULL_REVEAL
    const r = stop.reveal
    let y = g.fallTop
    if (r.segs === 1) y = g.rimY
    else if (r.segs > 1) {
      y = r.segs - 1 < MAP_STOPS ? g.stopY[r.segs - 1] : g.apertureY0
    }
    return {
      front: Math.min(1, y / g.H),
      carriers: r.carriers,
      bars: r.bars,
      aperture: r.aperture ? 1 : 0,
      pick: r.pick ? 1 : 0,
      cue: r.cue,
    }
  }, [tour.active, stop, g])

  // The timer. One stop at a time, at the speed the reader asked for, and
  // never at all with reduced motion on — there the step buttons are the tour.
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!tour.active || !tour.playing || reduced) return undefined
    if (stageIndex >= stages.length - 1) return undefined
    const ms = Math.max(350, stop.ms / tour.speed)
    timerRef.current = setTimeout(() => {
      setTour((t) => (t.playing ? { ...t, index: Math.min(t.index + 1, stages.length - 1) } : t))
    }, ms)
    return () => clearTimeout(timerRef.current)
  }, [tour.active, tour.playing, tour.speed, stageIndex, stages.length, stop, reduced])

  // The last stop is the end of the tour, not a stop that hangs on a timer.
  useEffect(() => {
    if (tour.playing && tour.active && stageIndex >= stages.length - 1) {
      const id = setTimeout(
        () => setTour((t) => ({ ...t, playing: false })),
        Math.max(350, stop.ms / tour.speed),
      )
      return () => clearTimeout(id)
    }
    return undefined
  }, [tour.playing, tour.active, stageIndex, stages.length, stop, tour.speed])

  // A different sentence, or a pass over a different sentence, is a different
  // tour: it closes rather than carrying an index into words it no longer
  // matches. Re-aiming at another token does not — the brief for that is that
  // the click is honoured and the tour waits where it was.
  useEffect(() => {
    setTour((t) => (t.active ? { ...t, active: false, playing: false, index: 0 } : t))
  }, [n, runKey, stepTick])

  const openTour = () => {
    setTour((t) => {
      if (!t.active) return { ...t, active: true, index: 0, playing: !reduced }
      if (t.index >= stages.length - 1 && !t.playing) {
        return { ...t, index: 0, playing: !reduced }
      }
      return { ...t, playing: !t.playing }
    })
  }
  const stepTo = (i) =>
    setTour((t) => ({
      ...t,
      active: true,
      playing: false,
      index: Math.min(Math.max(i, 0), stages.length - 1),
    }))

  const playLabel = reduced
    ? tour.active
      ? 'RESTART'
      : 'STEP THROUGH'
    : !tour.active
      ? 'PLAY THE PASS'
      : tour.playing
        ? 'PAUSE'
        : stageIndex >= stages.length - 1
          ? 'PLAY AGAIN'
          : 'RESUME'

  /**
   * How long the water takes to reach the next stop.
   *
   * Down the sheet it travels for most of the stop's dwell, which is what
   * makes the fall look like falling. Up it — opening the tour from the
   * finished drawing, or stepping back — it snaps, because light retracting
   * slowly up a page is a picture of nothing at all.
   */
  const frontWas = useRef(1)
  const travelMs =
    reveal.front < frontWas.current
      ? 260
      : Math.max(120, Math.round((stop.ms * motion.travel) / tour.speed))
  useEffect(() => {
    frontWas.current = reveal.front
  })

  const runLength = (ms) => {
    const s = Math.round(ms / 1000)
    return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`
  }

  // --- running itself -------------------------------------------------------
  //
  // Three conditions, all of them checked rather than assumed: the figure is
  // on screen, the tab is in front, and nobody has touched anything for a
  // while. Reduced motion removes the whole path.

  const idleAt = useRef(Date.now())
  const inView = useRef(false)
  // A tour that has been opened owns the drawing until it is finished with,
  // paused or not: a paused tour that started running itself would move marks
  // the reader had deliberately stopped.
  const touring = useRef(false)
  touring.current = tour.active

  useEffect(() => {
    const el = figureRef.current
    if (!el || typeof IntersectionObserver !== 'function') return undefined
    const io = new IntersectionObserver(
      (entries) => {
        inView.current = entries.some((e) => e.isIntersecting)
        if (!inView.current) setAmbient(false)
      },
      { threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduced) {
      setAmbient(false)
      return undefined
    }
    const el = figureRef.current
    const bump = () => {
      idleAt.current = Date.now()
      setAmbient(false)
    }
    const onHidden = () => {
      if (document.hidden) setAmbient(false)
    }
    window.addEventListener('pointerdown', bump, true)
    window.addEventListener('keydown', bump, true)
    el?.addEventListener('pointermove', bump)
    document.addEventListener('visibilitychange', onHidden)
    const id = setInterval(() => {
      if (document.hidden || !inView.current || touring.current) {
        setAmbient(false)
        return
      }
      setAmbient(Date.now() - idleAt.current >= IDLE_MS)
    }, 1000)
    return () => {
      clearInterval(id)
      window.removeEventListener('pointerdown', bump, true)
      window.removeEventListener('keydown', bump, true)
      el?.removeEventListener('pointermove', bump)
      document.removeEventListener('visibilitychange', onHidden)
    }
  }, [reduced])

  // A click anywhere on the sheet pauses the tour and is then honoured in the
  // ordinary way — the hero re-aims, the register opens, the readout answers.
  // The tour's own controls are the exception: they are how it is driven.
  const onSheetPointerDown = (e) => {
    if (typeof e.target?.closest === 'function' && e.target.closest('.mr-docent')) return
    setTour((t) => (t.playing ? { ...t, playing: false } : t))
  }

  // --- what a click on the sheet answers ------------------------------------

  const say = useCallback((next) => {
    setInspect(next)
    // Every readout also selects the tensor it is talking about, so OPEN IN
    // THE FILE always has somewhere to go.
    if (next?.tensor) setPart(next.tensor)
  }, [])

  const sayUnembed = useCallback(() => {
    say({
      kind: 'plate',
      text: unembedWhy(),
      tensor: 'transformer.wte.weight_quantized',
      instrument: 'stepper',
      letter: 'B',
    })
  }, [say])

  const inspectCarrier = useCallback(
    (tr) => {
      say({
        kind: 'carrier',
        text: carrierWhy(tr, sequence, sequence[hero]),
        tensor: wallTensor(tr.layer),
        instrument: 'attention',
        letter: 'C',
      })
    },
    [say, sequence, hero],
  )

  const inspectRay = useCallback(
    (i) => {
      const bar = draw?.landing?.bars?.[i]
      if (!bar) return
      say({
        kind: 'ray',
        text: rayWhy(bar, finalTop?.token ?? null, nextToken ?? null),
        tensor: 'transformer.wte.weight_quantized',
        instrument: 'stepper',
        letter: 'B',
      })
    },
    [say, draw, finalTop, nextToken],
  )

  /** Which cell of a wall a pointer is over, in the tensor's own coordinates. */
  const cellUnder = useCallback(
    (layer, clientX, clientY) => {
      const svg = svgRef.current
      const wall = windows ? wallWindow(windows, wallTensor(layer)) : null
      if (!svg || !wall) return null
      const box = svg.getBoundingClientRect()
      const ux = ((clientX - box.left) * SW) / box.width
      const uy = ((clientY - box.top) * g.H) / box.height
      const col = Math.min(
        wall.cols - 1,
        Math.max(0, Math.floor((ux - g.bandX) / g.pitchX)),
      )
      const row = Math.min(
        wall.rows - 1,
        Math.max(0, Math.floor((uy - g.bandTop[layer]) / g.pitchY)),
      )
      return { wall, row, col, index: row * wall.cols + col }
    },
    [windows, g],
  )

  const onWallMove = (layer) => (e) => {
    const rect = hoverRef.current
    const hit = cellUnder(layer, e.clientX, e.clientY)
    if (!rect || !hit) return
    // Written straight to the element rather than through state: a hover that
    // re-rendered the instrument would be a hover that rebuilt the fall.
    rect.setAttribute('x', f2(g.bandX + hit.col * g.pitchX - 1))
    rect.setAttribute('y', f2(g.bandTop[layer] + hit.row * g.pitchY - 1))
    rect.setAttribute('width', f2(g.cellW + 2))
    rect.setAttribute('height', f2(g.cellH + 2))
    rect.style.display = ''
  }
  const onWallLeave = () => {
    if (hoverRef.current) hoverRef.current.style.display = 'none'
  }
  const onWallClick = (layer) => (e) => {
    const hit = cellUnder(layer, e.clientX, e.clientY)
    const name = wallTensor(layer)
    const tensor = factsFor(name)
    if (!hit || !tensor || tensor.scale == null) return
    // The plate around this rect toggles the tensor on and off; a cell answers
    // for itself and always selects, because the next click is a different
    // byte and toggling one off to read another would be a nuisance.
    e.stopPropagation()
    const value = hit.wall.values[hit.index]
    say({
      kind: 'cell',
      text: cellWhy({
        value,
        weight: tensor.scale * (value - (tensor.zeroPoint ?? 0)),
        row: hit.wall.row0 + hit.row,
        col: hit.wall.col0 + hit.col,
        tensor: tensor.display,
        scale: tensor.scale,
        zeroPoint: tensor.zeroPoint ?? 0,
        totalRows: hit.wall.totalRows,
        totalCols: hit.wall.totalCols,
      }),
      tensor: name,
      instrument: 'file',
      letter: 'E',
    })
  }

  const readout = inspect ? inspect.text : partReadout(partFacts)

  // What the tour has on screen, for the same reason `__mapState` exists: a
  // claim about how long a run takes, or about which stop says what, can be
  // measured rather than taken. Dev only; production drops the branch.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    globalThis.__tourState = {
      preset,
      reduced,
      ambient,
      active: tour.active,
      playing: tour.playing,
      speed: tour.speed,
      index: stageIndex,
      count: stages.length,
      totalMs: tourPlan.totalMs,
      kind: stop?.kind ?? null,
      caption: stop?.caption ?? null,
      lead: stop?.lead ?? null,
      readout,
      reveal,
    }
  })

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
    // The stretch, on this page's own first window, so the reader can see the
    // safeguard doing something rather than take the wording for it.
    const stretch = wall0 ? `0 to ${wall0.hi} of a largest ${wall0.max}` : '—'
    const walls = compact
      ? `Six fields, one a block. Every cell is one real byte of that block’s attn.c_attn.weight — the ${rows} × ${cols} window this page read out of the ${fileSize} file, never reshaped. i8 at zero point 0, so a byte above 127 is a negative weight. Brightness is the weight’s magnitude, not its sign: ${stretch} here, over the middle 96%. Frozen — no pass changes one. Cells stand back to 55% under a stream, ${SCRIM_MARK_PCT}% under a carrier or a label.`
      : `Six full-width fields, one a block. Every cell is one real i8 byte of that block’s attn.c_attn.weight as the ${fileSize} file stores it — the ${rows} × ${cols} window this page’s own reading keeps of a ${count(wall0?.totalRows ?? 768)} × ${count(wall0?.totalCols ?? 2304)} tensor, ${count(tensor0?.byteLength ?? 0)} bytes whole. Never reshaped: that would put bytes side by side that are not side by side in the tensor. i8 at zero point 0, so a byte above 127 is a negative weight and 255 is −1. Brightness is the weight’s magnitude, not its sign: both signs are the machinery working. It is stretched over the middle 96% of that window’s own magnitudes — ${stretch} on block 0 — so a few large weights cannot flatten the rest. Frozen: no pass changes one. Cells stand back to 55% under the water and to ${SCRIM_MARK_PCT}% under a carrier or a label.`

    const spacing = compact
      ? `${n} across ${Math.round(g.trackW)} units, ${Math.round(draw?.slot ?? 0)} apart`
      : `${n} stream${n === 1 ? '' : 's'} across ${Math.round(g.trackW)} units, ${Math.round(draw?.slot ?? 0)} apart`
    // What happens below the last wall, said the way it is drawn: one stream
    // carries on to the landing, and it is the last word's, hero or not.
    const mist = compact
      ? draw?.landingHere
        ? 'Only the last word’s stream carries past the mist — the hero here.'
        : 'Only the last word’s stream carries past the mist, dimmed; the hero is earlier.'
      : draw?.landingHere
        ? 'Below the last wall every stream fades into the mist but the last word’s — the hero here — which carries on to the landing.'
        : 'Below the last wall every stream fades into the mist but the last word’s, which carries on to the landing dimmed: the hero is an earlier word.'
    // Two characters of a word is a different word, so under three characters
    // of room the chips stop pretending and the drawing says they have.
    const chipNote = numberedChips
      ? compact
        ? ' Narrow chips carry positions.'
        : ' Chips this narrow carry positions, not words; each names its own on hover.'
      : ''
    const fall = !live
      ? compact
        ? `One stream a token. No pass has run, so every stream is drawn at one width and one light — no magnitude is claimed. The grain inside is the deterministic stand-in instrument D prints, 768 numbers binned into ${plan.count} filaments of ${plan.group}, and it is a stand-in, not a measurement. Spacing: ${spacing}.${chipNote} The last word is the hero; click any token to make it one.`
        : `One stream a token, falling through all six walls. No pass has run, so every stream is drawn at one width and one light: nothing here claims a magnitude. The grain inside a stream is the deterministic stand-in instrument D prints, its 768 numbers binned into ${plan.count} filaments of ${plan.group} dimensions each — a stand-in, and not a measurement. Spacing scales with the sentence: ${spacing}, and the drawing’s height never changes with it.${chipNote} The last word is the hero, and clicking any token makes it the hero instead.`
      : compact
        ? `One stream a token. Width, light and grain are the real length (L2) of that token’s 768 numbers at each of the seven depths — ${field.lo.toFixed(2)} to ${count(Number(field.hi.toFixed(2)))} — on one log law shared by all ${n}; the widest is ${widest}. Inside, 768 dimensions become ${plan.count} filaments of ${plan.group}; a filament’s grain is the mean |value| of its own, against the brightest in that stream at that depth. Spacing: ${spacing}.${chipNote} Hero: ${heroToken ?? '—'} — click any token. ${mist}`
        : `One stream a token, ${n} of them, through all six walls. Width, light and grain are the real length (L2) of that token’s 768-number vector at each of the seven depths — ${field.lo.toFixed(2)} at the rim up to ${count(Number(field.hi.toFixed(2)))} — on one log law shared by all ${n}, and the widest is ${widest}: usually the first piece, which carries the attention sink. Inside, the 768 dimensions are ${plan.count} filaments of ${plan.group}: a filament’s grain is the mean |value| of its own ${plan.group} there, against the brightest filament in that stream at that depth. Spacing scales with the sentence — ${spacing} — the drawing’s height never does.${chipNote} The hero is ${heroToken ?? '—'}; click any token to change that. ${mist}`

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
        : `There is no attention until a pass has run, so no carrier is drawn here. With the real model in hand, each block takes the head that sends the most attention away from the first token and away from itself, and draws the hero’s own sources at or above ${TRANSFER_FLOOR}, at most 2: a green tick at the key that matched, an amber carrier whose width and light are that weight, and a brighter hero below the absorption.`
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
        ? `The last position’s alone, and the last position’s stream is the one that reaches it${draw?.landingHere ? ' — the hero here' : ', dimmed — the hero is earlier'}. The ${g.splashN} bars are this pass’s own softmax over all 50,257 words. ${argmaxLine} is the machine’s own top, drawn blue; ${pickBar ? `${pickBar.token} at ${(pickBar.p * 100).toFixed(1)}%` : (nextToken ?? '—')} is what the sampler took (temperature ${DECODING.temperature}, top-k ${DECODING.topK}, repetition penalty ${DECODING.repetitionPenalty}, seed ${DECODING.seed}) and carries the amber mark. Same input → same trace, every time.`
        : `It is the last position’s alone, and the last position’s own stream is the one that reaches it — ${
            draw?.landingHere
              ? 'which is where the hero is'
              : 'so an earlier hero leaves it standing back, its own fall ending in the mist with the rest'
          }. The ${g.splashN} bars are this pass’s own softmax over all 50,257 words, top ${g.splashN}, counted from the last position’s vector and from nothing else. ${argmaxLine} is the machine’s own top and is drawn blue; ${
            pickBar ? `${pickBar.token} at ${(pickBar.p * 100).toFixed(1)}%` : (nextToken ?? '—')
          } is what the shipped sampler took (temperature ${DECODING.temperature}, top-k ${DECODING.topK}, repetition penalty ${DECODING.repetitionPenalty}, seed ${DECODING.seed}) and carries the amber mark. A bar’s height is its probability and the rows of dots are how that height is counted. Chance appears nowhere above it: same input → same trace, every time.`

    // The tour and the ambient loop are rules of this drawing like any other,
    // so they are stated here rather than left to be found. What they change
    // is when a mark is drawn, never what it says.
    const tourLine = compact
      ? `Play walks one pass at reading speed, a stop at a time — ${stages.length} stops, about ${runLength(
          tourPlan.totalMs,
        )} at 1×. The line under the controls speaks this pass’s own numbers. Step moves one stop; a click anywhere pauses the tour and is then honoured. Reduced motion: no timer, step through it. Left alone for 20 seconds, in view, the sheet runs itself — the sweep of light carries no number and changes no value.`
      : `Press play and one pass is walked at reading speed rather than replayed in a second: ${
          stages.length
        } stops, about ${runLength(
          tourPlan.totalMs,
        )} at 1×, and the line under the controls says what is happening at each one in this pass’s own numbers. The steps move a stop either way, and clicking anything on the sheet pauses the tour and then honours the click. With reduced motion on there is no animation and no timer at all: play opens the tour at its first stop and the steps walk it. Left alone for twenty seconds — in view, tab in front, reduced motion off — the sheet runs itself: a sweep of light travels down the fall, the walls glint where it crosses them, and the carriers fire again in turn. That sweep is the one mark in the picture that carries no number; it redraws nothing and changes no value.`

    return [
      ['THE WALLS', walls],
      ['THE FALL', fall],
      ['THE TRANSFERS', transfers],
      ['THE LANDING', landing],
      ['THE TOUR', tourLine],
    ]
  }, [
    compact, wall0, tensor0, fileSize, n, g, draw, live, field, plan, heroToken,
    autoHeads, block, headPick, silent, sequence, splash, finalTop, nextToken,
    numberedChips, stages.length, tourPlan.totalMs,
  ])

  const legendLines = useMemo(
    () =>
      legend.map(([key, body], i) => [key, wrapText(body, g.legCols, g.legLines[i])]),
    [legend, g],
  )

  const fine = live
    ? `real distilgpt2 · ${REAL_LAYERS} blocks · ${REAL_HEADS} heads · d ${REAL_HIDDEN}${
        manifest ? ` · ${(manifest.parameters / 1e6).toFixed(1)}M parameters` : ''
      } · one pass on the sentence above, run in this browser · nothing in the picture is a stand-in: the only marks that carry no number are the aperture outline, the bloom around the light, and the sweep that travels down the sheet while it runs itself.`
    : `real distilgpt2 · ${REAL_LAYERS} blocks · ${REAL_HEADS} heads · d ${REAL_HIDDEN}${
        manifest ? ` · ${(manifest.parameters / 1e6).toFixed(1)}M parameters` : ''
      } · the walls are the real file in every mode; the fall, the transfers and the landing wait on a pass. The only marks that carry no number are the aperture outline, the bloom around the light, and the sweep that travels down the sheet while it runs itself.`
  const fineLines = useMemo(
    () => wrapText(fine, g.fineCols, g.fineLines),
    [fine, g],
  )

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
    <figure
      className="instrument is-fullbleed"
      id="inst-forward-figure"
      ref={figureRef}
      onPointerDownCapture={onSheetPointerDown}
    >
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

        {/* The docent. It rides at the top of the window while the drawing —
            which is two and a half thousand units tall — scrolls past it, so
            the words for a stop are readable at the part of the sheet that
            stop is about. Its height is fixed at every width and the caption
            clips rather than reflows, so nothing here can move the page. */}
        <div className="mr-docent">
          <div className="mr-tourrow">
            <button
              type="button"
              className="btn mr-play"
              onClick={openTour}
              aria-pressed={tour.playing}
            >
              {playLabel}
            </button>
            <button
              type="button"
              className="mr-chip mr-step"
              aria-label="back one stop of the tour"
              disabled={tour.active && stageIndex === 0}
              onClick={() => stepTo(stageIndex - 1)}
            >
              ◀
            </button>
            <button
              type="button"
              className="mr-chip mr-step"
              aria-label="forward one stop of the tour"
              disabled={tour.active && stageIndex >= stages.length - 1}
              onClick={() => stepTo(stageIndex + 1)}
            >
              ▶
            </button>
            <span className="mr-sel-label mr-speed-label">SPEED</span>
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                className={`mr-chip${tour.speed === s ? ' is-on' : ''}`}
                aria-pressed={tour.speed === s}
                aria-label={`play the tour at ${s} times speed`}
                disabled={reduced}
                onClick={() => setTour((t) => ({ ...t, speed: s }))}
              >
                {s}×
              </button>
            ))}
            <span className="mr-stopcount">
              {tour.active
                ? `STOP ${stageIndex + 1}/${stages.length} · ${stop.kind.toUpperCase()}`
                : `${stages.length} STOPS · ${runLength(tourPlan.totalMs / tour.speed)}`}
            </span>
          </div>
          <p className="mr-caption" aria-live={tour.active ? 'polite' : 'off'}>
            {tour.active
              ? compact
                ? stop.lead
                : stop.caption
              : ambient
                ? 'The sheet is running itself: a sweep of light down the fall, a glint where it crosses a wall, the carriers firing again in turn. Nothing is being recomputed and no number is changing — move the pointer over the drawing and it stops.'
                : reduced
                  ? `Step through one pass at your own pace: ${stages.length} stops, each with a line of plain words and this pass’s own numbers. Animation is off, so every stop is drawn at once.`
                  : `Press play and one pass is walked at reading speed — ${stages.length} stops, about ${runLength(
                      tourPlan.totalMs / tour.speed,
                    )} at ${tour.speed}×. Left alone for twenty seconds the sheet starts running itself.`}
          </p>
        </div>

        <div
          className={`map-screen screen is-motion-${preset}${ambient ? ' is-ambient' : ''}`}
          style={{
            aspectRatio: `${SW} / ${g.H}`,
            // The stroke of a grain, in the drawing's own units. It belongs to
            // the setting rather than to the stylesheet, because a stroke that
            // reads at 0.58 px a unit is a third too heavy at one.
            '--mr-grain-w': String(g.grainWidth),
            '--mr-grain-w-hero': String(g.grainWidthHero),
            // The whole of the tour's state, as five numbers the stylesheet
            // compares each mark against. Nothing below re-renders to reveal:
            // the marks read these and decide for themselves.
            '--mr-front': String(reveal.front),
            '--mr-carriers': String(reveal.carriers),
            '--mr-bars': String(reveal.bars),
            '--mr-aperture': String(reveal.aperture),
            '--mr-pick': String(reveal.pick),
            '--mr-fade': `${Math.round(motion.fadeMs / tour.speed)}ms`,
            '--mr-travel': `${travelMs}ms`,
            // The ambient loop's own tempo, one preset at a time.
            // How far the sweep travels: the whole drawing, plus its own
            // depth, so it enters from above the sheet and leaves below it.
            '--mr-sweep-to': `${f2(g.H + g.bandH * 2.4)}px`,
            '--mr-sweep-ms': `${motion.ambient.sweepMs}ms`,
            '--mr-sweep-op': String(motion.ambient.sweepOpacity),
            '--mr-glint-op': String(motion.ambient.glintOpacity),
            '--mr-carrier-ms': `${motion.ambient.carrierMs}ms`,
            '--mr-breathe-ms': `${motion.ambient.breatheMs}ms`,
            '--mr-hero-ms': `${motion.ambient.heroMs}ms`,
          }}
        >
          <svg
            ref={svgRef}
            className="map-svg"
            viewBox={`0 0 ${SW} ${g.H}`}
            role="img"
            aria-label={`one pass of distilgpt2 drawn as a memory room: six full-width walls of real weight bytes, ${n} granular token streams falling through them, the attention transfers into ${
              heroToken ?? 'the hero'
            }, and the landing on the last position’s top ${g.splashN} next words`}
          >
            <defs>
              {/* In the drawing's own units, not in each shape's box. A scrim
                  is a slice of the ground painted back over itself, so it has
                  to be the ground at that y — and a gradient left on the
                  default objectBoundingBox squeezes all three stops into
                  whatever rect asks for it, which paints a scrim near the
                  bottom of the drawing in the colour of the top of it. */}
              <linearGradient
                id="mr-fade"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={g.H}
              >
                <stop offset="0" stopColor="#070A0D" />
                <stop offset=".62" stopColor="#05070A" />
                <stop offset="1" stopColor="#030507" />
              </linearGradient>
              {/* How far down the sheet the light has reached.
                  The whole tour's fall is this one rectangle: it covers the
                  drawing and is scaled from its own top edge by a number the
                  stylesheet reads off `--mr-front`, so a stop advances the
                  water by transitioning a transform — one animated element
                  for the entire fall, and not a single React render inside
                  it. With no tour running it stands at 1 and clips nothing. */}
              <clipPath id="mr-front" clipPathUnits="userSpaceOnUse">
                <rect className="mr-front-rect" x="0" y="0" width={SW} height={g.H} />
              </clipPath>
              {/* The six walls, for the glint. The ambient sweep is painted
                  twice: once over everything at a low light, and once through
                  this, so that crossing a wall is brighter than crossing the
                  dark air — which is what "the walls glint where the light
                  crosses them" means. */}
              <clipPath id="mr-bands" clipPathUnits="userSpaceOnUse">
                {Array.from({ length: REAL_LAYERS }, (_, l) => (
                  <rect
                    key={l}
                    x={g.bandX}
                    y={g.bandTop[l]}
                    width={g.bandW}
                    height={g.bandH}
                  />
                ))}
              </clipPath>
              {/* The sweep itself: a soft band of the moving colour, in the
                  drawing's own units so it is the same shape at every width. */}
              <linearGradient
                id="mr-sweep"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={f2(g.bandH * 2.2)}
              >
                <stop offset="0" stopColor="var(--moving)" stopOpacity="0" />
                <stop offset=".5" stopColor="var(--moving-lit)" stopOpacity="1" />
                <stop offset="1" stopColor="var(--moving)" stopOpacity="0" />
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
                {/* Under the same clip as the water itself: a wall that
                    stands back where no stream has arrived yet would be a
                    shadow with nothing casting it. */}
                <g clipPath="url(#mr-front)">
                  {draw.footprints.map((d, i) => (
                    <path key={i} d={d} fill="url(#mr-fade)" opacity={SCRIM_WATER} />
                  ))}
                </g>
                {draw.transfers.map((tr, ci) => (
                  <path
                    key={tr.id}
                    className="mr-cscrim"
                    style={{ '--ci': ci }}
                    d={tr.centre}
                    fill="none"
                    stroke="url(#mr-fade)"
                    strokeWidth={f2((4 + 3 * tr.w) * 2 + 8)}
                    strokeLinecap="round"
                  />
                ))}
              </g>
            ) : null}

            {/* The frame around each register and its twelve head squares.
                The words that name the register are not here: they are drawn
                after the fall, because a label the water runs over is not a
                label. */}
            {Array.from({ length: REAL_LAYERS }, (_, l) => {
              const top = g.bandTop[l]
              // A register the tour is talking about is lifted the same way an
              // opened one is, and by nothing else: the cue changes where the
              // reader looks, never which head or which numbers are read.
              const cls = `mr-reg${block === l ? ' is-open' : ''}${
                reveal.cue === l ? ' is-cued' : ''
              }`
              return (
                <g key={l} className={cls}>
                  <rect
                    className="mr-reg-frame"
                    x={g.bandX - 4}
                    y={top - 4}
                    width={g.bandW + 8}
                    height={g.bandH + 8}
                    rx="2"
                  />
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

            {draw ? <Carriers g={g} draw={draw} onInspect={inspectCarrier} /> : null}
            {draw ? (
              <g clipPath="url(#mr-front)">
                <Streams g={g} draw={draw} />
              </g>
            ) : null}

            {/* The ambient loop, and nothing else, lives in these two. Both
                are inert — no animation, no light — until the sheet is left
                alone; the stylesheet is what starts them. */}
            <g className="mr-ambient" aria-hidden="true">
              <rect
                className="mr-sweep"
                x="0"
                y={f2(-g.bandH * 2.2)}
                width={SW}
                height={f2(g.bandH * 2.2)}
                fill="url(#mr-sweep)"
              />
              <g clipPath="url(#mr-bands)">
                <rect
                  className="mr-sweep is-glint"
                  x="0"
                  y={f2(-g.bandH * 2.2)}
                  width={SW}
                  height={f2(g.bandH * 2.2)}
                  fill="url(#mr-sweep)"
                />
              </g>
            </g>

            {/* Each wall says which register it is, which head its transfers
                came from, and which tensor it is cut out of — over the fall
                rather than under it, and over a scrim, so that neither a lit
                byte nor a stream running past can be read as part of a word.
                The plate is a button: it prints the readout under the drawing
                and opens that row of the file. */}
            {Array.from({ length: REAL_LAYERS }, (_, l) => {
              const top = g.bandTop[l]
              const name = wallTensor(l)
              const wall = windows ? wallWindow(windows, name) : null
              const tensor = factsFor(name)
              const on = part === name
              const short = tensor ? tensor.display.replace(`h.${l}.`, '') : 'attn.c_attn'
              const spec = `${wall?.rows ?? 24} × ${wall?.cols ?? 64} WINDOW · ${
                tensor?.dtype ?? 'i8'
              }`
              const nameY = top - (compact ? 34 : 24)
              const specY = top - (compact ? 16 : 10)
              const nameW = Math.max(
                textWidth(short, g.fs.tensor, TRACK.tensor),
                textWidth(spec, g.fs.tensor, TRACK.tensor),
              )
              const regLines = [`BLOCK ${l}`, `HEAD ${live ? headFor(l) : '—'}`]
              const regW = Math.max(
                ...regLines.map((line) => textWidth(line, g.fs.reg, TRACK.label)),
              )
              return (
                <g key={l} className={block === l ? 'mr-reg is-open' : 'mr-reg'}>
                  <g
                    className={on ? 'mr-plate is-on' : 'mr-plate'}
                    role="button"
                    tabIndex={0}
                    aria-label={`read ${
                      tensor ? tensor.display : name
                    } out of the file; click a cell of this wall for the weight that byte stands for`}
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
                    {/* One rect for fifteen hundred targets. A wall is drawn
                        as a few dozen paths grouped by magnitude, so no cell
                        is an element that could be hovered; the cell under
                        the pointer is worked out from the pointer instead,
                        which costs the drawing nothing and lets every byte
                        answer for itself. */}
                    <rect
                      className="mr-plate-hit"
                      x={g.bandX}
                      y={top}
                      width={g.bandW}
                      height={g.bandH}
                      onClick={onWallClick(l)}
                      onPointerMove={onWallMove(l)}
                      onPointerLeave={onWallLeave}
                    />
                    <rect
                      x={f2(SW - 8 - nameW - 5)}
                      y={f2(nameY - g.fs.tensor * INK_ABOVE)}
                      width={f2(nameW + 10)}
                      height={f2(specY - nameY + g.fs.tensor * (INK_ABOVE + INK_BELOW))}
                      fill="url(#mr-fade)"
                      opacity={SCRIM_MARK}
                    />
                    <text
                      className="mr-tensor"
                      x={SW - 8}
                      y={nameY}
                      textAnchor="end"
                      style={{ fontSize: g.fs.tensor }}
                    >
                      {short.toUpperCase()}
                    </text>
                    <text
                      className="mr-tensor is-fine"
                      x={SW - 8}
                      y={specY}
                      textAnchor="end"
                      style={{ fontSize: g.fs.tensor }}
                    >
                      {spec}
                    </text>
                  </g>
                  <rect
                    x="3"
                    y={f2(top + g.fs.reg * (1 - INK_ABOVE))}
                    width={f2(regW + 10)}
                    height={f2(g.fs.reg * (1.2 + INK_ABOVE + INK_BELOW))}
                    fill="url(#mr-fade)"
                    opacity={SCRIM_MARK}
                  />
                  <text
                    className="mr-label"
                    x="8"
                    y={top + g.fs.reg}
                    style={{ fontSize: g.fs.reg }}
                  >
                    {regLines[0]}
                  </text>
                  <text
                    className="mr-label is-dim"
                    x="8"
                    y={top + g.fs.reg * 2.2}
                    style={{ fontSize: g.fs.reg }}
                  >
                    {regLines[1]}
                  </text>
                </g>
              )
            })}

            {/* The transfers, said: a green key at the source, the weight
                beside it, and the bloom where the hero takes it in. */}
            {draw
              ? draw.transfers.map((tr, ci) => {
                  const x = draw.xs[tr.src]
                  const label = `${sequence[tr.src]} · ${tr.w.toFixed(4)}`
                  const key = `KEY · B${tr.layer} H${tr.head}`
                  const room = Math.max(
                    textWidth(label, g.fs.callout, TRACK.callout),
                    textWidth(key, g.fs.fine, TRACK.key),
                  )
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
                      style={{ '--ci': ci }}
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
                        x={f2(lx - room / 2 - 5)}
                        y={f2(ly - g.fs.callout * 1.05 - g.fs.fine * INK_ABOVE)}
                        width={f2(room + 10)}
                        height={f2(
                          g.fs.callout * (1.05 + INK_BELOW) + g.fs.fine * INK_ABOVE,
                        )}
                        fill="url(#mr-fade)"
                        opacity={SCRIM_MARK}
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
                  const room = textWidth(label, g.fs.quiet, TRACK.quiet)
                  // Beside the hero, on whichever side the words fit: with an
                  // early token as the hero there is no room to its left.
                  const left = draw.xs[hero] - draw.hw[hero][reg.layer + 1] - 14 - room > 8
                  const x = left
                    ? draw.xs[hero] - draw.hw[hero][reg.layer + 1] - 14
                    : draw.xs[hero] + draw.hw[hero][reg.layer + 1] + 14
                  const y = g.bandMid[reg.layer] + 3
                  const why = silentWhy(reg, sequence)
                  return (
                    // The plate says what it means when it is asked. A line
                    // reading `no transfer · self 0.59` is a fact with its
                    // explanation missing, and the explanation is the same
                    // sentence the tour speaks at this block.
                    <g
                      key={reg.layer}
                      className="mr-said"
                      role="button"
                      tabIndex={0}
                      aria-label={`why block ${reg.layer} draws no transfer`}
                      onClick={() =>
                        say({
                          kind: 'plate',
                          text: why,
                          tensor: wallTensor(reg.layer),
                          instrument: 'attention',
                          letter: 'C',
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          say({
                            kind: 'plate',
                            text: why,
                            tensor: wallTensor(reg.layer),
                            instrument: 'attention',
                            letter: 'C',
                          })
                        }
                      }}
                    >
                      <title>{why}</title>
                      {/* The wall stands back behind the line, as it does
                          behind a callout, so no byte is read as light and
                          the words stay words. */}
                      <rect
                        x={f2(left ? x - room - 5 : x - 5)}
                        y={f2(y - g.fs.quiet * INK_ABOVE)}
                        width={f2(room + 10)}
                        height={f2(g.fs.quiet * (INK_ABOVE + INK_BELOW))}
                        fill="url(#mr-fade)"
                        opacity={SCRIM_MARK}
                      />
                      <text
                        className="mr-quiet"
                        x={x}
                        y={y}
                        textAnchor={left ? 'end' : 'start'}
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
                ? numberedChips
                  ? 'THE SENTENCE — ONE STREAM EACH, BY POSITION'
                  : 'THE SENTENCE — ONE STREAM EACH'
                : numberedChips
                  ? 'THE SENTENCE — ONE STREAM EACH, NUMBERED BY POSITION; CLICK ONE TO MAKE IT THE HERO'
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
                        {numberedChips ? String(i) : clip(sequence[i], g.fs.chip, chipW - 6)}
                      </text>
                    </g>
                  )
                })
              : null}
            <rect
              x="3"
              y={f2(g.rimY - 4 - g.fs.reg * INK_ABOVE)}
              width={f2(textWidth('WTE+WPE', g.fs.reg, TRACK.label) + 10)}
              height={f2(g.fs.reg * (1 + INK_ABOVE + INK_BELOW) + 6)}
              fill="url(#mr-fade)"
              opacity={SCRIM_MARK}
            />
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
              <g className="mr-aperture-group">
                <g className="mr-absorb">
                  <circle cx={draw.apertureX} cy={g.apertureY0} r="15" opacity=".07" />
                  <circle cx={draw.apertureX} cy={g.apertureY0} r="7.5" opacity=".13" />
                  <circle cx={draw.apertureX} cy={g.apertureY0} r="2.6" opacity=".55" />
                </g>
                <g
                  className="mr-plate mr-aperture-plate mr-said"
                  role="button"
                  tabIndex={0}
                  aria-label="what UNEMBED · WTEᵀ means, and the word table it reads back out of the file"
                  aria-pressed={part === 'transformer.wte.weight_quantized'}
                  onClick={() => sayUnembed()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      sayUnembed()
                    }
                  }}
                >
                  <title>{unembedWhy()}</title>
                  <rect
                    x={f2(draw.apertureX - apertureW / 2)}
                    y={g.apertureY0}
                    width={f2(apertureW)}
                    height={g.apertureH}
                    rx="2"
                    fill="url(#mr-fade)"
                    opacity={SCRIM_MARK}
                  />
                  <rect
                    className="mr-aperture"
                    x={f2(draw.apertureX - apertureW / 2)}
                    y={g.apertureY0}
                    width={f2(apertureW)}
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
                    {APERTURE_NOTE}
                  </text>
                </g>
              </g>
            ) : null}
            {draw?.landing ? (
              <>
                <Landing g={g} draw={draw} onInspect={inspectRay} />
                {draw.landing.bars.map((bar, bi) => (
                  <g key={bar.id} className="mr-barwords" style={{ '--bi': bi }}>
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
            {/* The cell under the pointer, outlined. It is written straight
                to the DOM on a pointer move and is the one element on the
                sheet React does not own — a hover that went through state
                would rebuild the fall sixty times a second. */}
            <rect
              ref={hoverRef}
              className="mr-hover"
              style={{ display: 'none' }}
              x="0"
              y="0"
              width="0"
              height="0"
            />
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

        {/* One row answers every click on the sheet — a wall cell, a carrier,
            a landing ray, either plate — and the two buttons beside it take
            the reader to wherever that answer can be read at length. Both are
            fixed width and the box is two reserved lines, so no wording of
            any readout moves anything. */}
        <div className="map-readout-row">
          <p className="map-readout">{readout}</p>
          <button
            type="button"
            className="btn map-open-btn"
            disabled={!partFacts}
            onClick={() => partFacts && onOpenTensor(partFacts.name)}
          >
            OPEN IN THE FILE
          </button>
          <button
            type="button"
            className="btn map-inst-btn"
            disabled={!inspect?.instrument}
            aria-label={
              inspect?.instrument
                ? `open instrument ${inspect.letter}, where this reading can be read at length`
                : 'no instrument to open for this readout'
            }
            onClick={() => inspect?.instrument && onOpenInstrument(inspect.instrument)}
          >
            {`OPEN ${inspect?.letter ?? '—'}`}
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
