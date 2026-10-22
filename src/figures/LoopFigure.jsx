import InstrumentHead from '../components/InstrumentHead.jsx'
import InfoTag from '../components/InfoTag.jsx'

/**
 * FIG.7 — the loop. A drawing, not an instrument: nothing in it runs, nothing
 * in it is focusable, nothing in it moves.
 *
 * One data description of the five parts and the arrows between them, and two
 * layouts drawn from it: WIDE, the fixture in the middle of one row with the
 * part entering from the left and the landing leaving on the right; and
 * STACKED (≤ 640 px), the fixture under the part and over the landing, the
 * notes below. Each layout has a fixed viewBox chosen from the breakpoint
 * alone — never from fonts or content — and the stylesheet gives each SVG the
 * same ratio as its viewBox, so the box is the right height before a glyph is
 * drawn and the figure adds no layout shift at any width. Both SVGs are in
 * the DOM; the stylesheet shows one and takes the other out of the box tree
 * (and with it out of the accessibility tree).
 *
 * Type is set in viewBox units so that the smallest rendering of each layout
 * still reads at the page's floor: the wide drawing is never narrower than
 * 559 px (a 641 px window), where 13.4 units is 11.0 px and 12.2 units is
 * 10.0 px; the stacked drawing is 308 px wide at 390, where 12 units is
 * 12.3 px and 10.5 units is 10.8 px, and it stops growing at 360 px.
 *
 * Every string is WORDS §4 of design/the-loop-and-the-landing, verbatim. A
 * note that does not fit on one line is broken across lines in the drawing
 * only: each line but the last keeps its trailing space, so the <text>'s
 * own text is the WORDS string character for character.
 */

const TITLE = 'One pass, and the harness around it'
const READING =
  'A drawing, not an instrument: nothing here runs. The fixture is the file of section 01; the part is the context of section 03; the landing is the foot of the drawing in section 02.'
const CAPTION = 'A drawing, not an instrument: nothing here runs.'

// The five parts. `tone` picks the label's colour: steel, amber or ink.
const PARTS = {
  fixture: { label: 'THE FIXTURE', note: 'the file · unchanged by every pass', tone: 'frozen' },
  part: { label: 'THE PART', note: 'the context · text, growing', tone: 'moving' },
  landing: { label: 'THE LANDING', note: 'one word out · one bar per candidate', tone: 'moving' },
  harness: {
    label: 'THE HARNESS',
    note: 'ordinary software · append · run a tool · write a note · read a note',
    tone: 'ink',
  },
  notes: { label: 'THE NOTES', note: 'files · the only thing that carries', tone: 'ink' },
}
const ORDER = ['fixture', 'part', 'landing', 'harness', 'notes']

// The arrows: what each one joins, and its word where WORDS gives it one.
// The pass's own output (fixture → landing) is drawn and carries no word.
const ARROWS = {
  append: { from: 'landing', to: 'part', word: 'append' }, // the harness loop itself
  again: { from: 'part', to: 'fixture', word: 'run again' },
  pass: { from: 'fixture', to: 'landing', word: null },
  tool: { from: 'harness', to: 'part', word: 'tool' },
  write: { from: 'harness', to: 'notes', word: 'write' },
  read: { from: 'notes', to: 'part', word: 'read' },
}

// The landing glyph: eight bars, the first standing clear of the rest.
const BARS = [40, 14, 11, 9, 7, 6, 5, 4]
const BAR_W = 10
const BAR_GAP = 4

/**
 * Where everything sits, per layout. `lines` says how many of a note's
 * " · "-separated pieces go on each line (a piece may also be split at a
 * space with `split`, for the one note that has to fit a narrow column).
 */
const LAYOUTS = {
  wide: {
    w: 680,
    h: 312,
    type: { label: 13.4, note: 12.2, word: 12.2, lead: 17 },
    labels: {
      part: { x: 40, y: 40, lines: [2] },
      fixture: { x: 298, y: 62, lines: [1, 1] },
      landing: { x: 514, y: 40, lines: [1, 1] },
      harness: { x: 18, y: 276, lines: [5] },
      notes: { x: 196, y: 166, lines: [1, 1] },
    },
    band: { x: 40, y: 72, w: 224, h: 24 },
    box: { x: 284, y: 36, w: 200, h: 96 },
    bars: { x: 518, base: 130 },
    sheets: { x: 120, y: 150, w: 50, h: 36, step: 5 },
    arrows: {
      append: { d: 'M572 132 V250 H18 V84 H38', word: { x: 452, y: 243 } },
      again: { d: 'M264 84 H282', word: { x: 278, y: 116, anchor: 'end' } },
      pass: { d: 'M486 116 H512' },
      tool: { d: 'M18 150 H60 V98', word: { x: 24, y: 168 } },
      write: { d: 'M134 250 V198', word: { x: 140, y: 230 } },
      read: { d: 'M166 148 V98', word: { x: 172, y: 126 } },
    },
  },
  stacked: {
    w: 300,
    h: 404,
    type: { label: 12, note: 10.5, word: 10.5, lead: 15 },
    labels: {
      part: { x: 40, y: 24, lines: [2] },
      fixture: { x: 134, y: 124, lines: [1, 1] },
      landing: { x: 146, y: 270, lines: [1, 1] },
      harness: { x: 14, y: 360, lines: [3, 2] },
      notes: { x: 20, y: 212, lines: [1, 1], split: [null, ['the only thing', 'that carries']] },
    },
    band: { x: 40, y: 50, w: 172, h: 20 },
    box: { x: 124, y: 100, w: 168, h: 84 },
    bars: { x: 150, base: 252 },
    sheets: { x: 56, y: 148, w: 44, h: 32, step: 5 },
    arrows: {
      append: { d: 'M264 252 H292 V336 H14 V60 H38', word: { x: 196, y: 330 } },
      again: { d: 'M200 70 V98', word: { x: 206, y: 88 } },
      pass: { d: 'M200 184 V206' },
      tool: { d: 'M14 110 H50 V72', word: { x: 18, y: 126 } },
      write: { d: 'M14 168 H54', word: { x: 18, y: 162 } },
      read: { d: 'M80 148 V72', word: { x: 86, y: 116 } },
    },
  },
}

/** The note's lines, each but the last keeping its trailing space. */
function noteLines(note, lines, split) {
  const pieces = note.split(' · ')
  const out = []
  let at = 0
  lines.forEach((count, i) => {
    const chunk = pieces.slice(at, at + count)
    at += count
    const last = at >= pieces.length
    const text = chunk.join(' · ') + (last ? '' : ' · ')
    const parts = split?.[i]
    if (parts) {
      parts.forEach((p, j) => out.push(j < parts.length - 1 ? `${p} ` : p))
    } else {
      out.push(text)
    }
  })
  return out
}

function Drawing({ name }) {
  const L = LAYOUTS[name]
  const t = L.type
  const markerId = `loop-head-${name}`
  const labelText = ORDER.map((key) => PARTS[key].label).join(', ')
  return (
    <svg
      className={`loop-svg loop-${name}`}
      viewBox={`0 0 ${L.w} ${L.h}`}
      role="img"
      aria-label={`${TITLE}: ${labelText}`}
      focusable="false"
    >
      <defs>
        <marker
          id={markerId}
          className="lf-head"
          viewBox="0 0 7 7"
          markerWidth="7"
          markerHeight="7"
          markerUnits="userSpaceOnUse"
          refX="7"
          refY="3.5"
          orient="auto"
        >
          <path d="M0 0 L7 3.5 L0 7 Z" />
        </marker>
      </defs>

      <rect className="lf-frame" x="0.5" y="0.5" width={L.w - 1} height={L.h - 1} />

      {/* the fixture: the file, a steel box */}
      <rect
        className="lf-box"
        x={L.box.x}
        y={L.box.y}
        width={L.box.w}
        height={L.box.h}
      />

      {/* the part: the context, an amber band */}
      <rect
        className="lf-band"
        x={L.band.x}
        y={L.band.y}
        width={L.band.w}
        height={L.band.h}
      />

      {/* the landing: eight bars on a baseline, one standing clear */}
      <line
        className="lf-base"
        x1={L.bars.x - 4}
        x2={L.bars.x + BARS.length * BAR_W + (BARS.length - 1) * BAR_GAP + 4}
        y1={L.bars.base + 0.5}
        y2={L.bars.base + 0.5}
      />
      {BARS.map((hgt, i) => (
        <rect
          key={i}
          className="lf-bar"
          x={L.bars.x + i * (BAR_W + BAR_GAP)}
          y={L.bars.base - hgt}
          width={BAR_W}
          height={hgt}
        />
      ))}

      {/* the notes: three sheets, the back one first */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          className="lf-sheet"
          x={L.sheets.x + i * L.sheets.step}
          y={L.sheets.y + i * L.sheets.step}
          width={L.sheets.w}
          height={L.sheets.h}
        />
      ))}

      {/* the harness and its arrows, all ink, one arrowhead */}
      {Object.keys(ARROWS).map((key) => (
        <path
          key={key}
          className={key === 'append' ? 'lf-loop' : 'lf-arrow'}
          d={L.arrows[key].d}
          markerEnd={`url(#${markerId})`}
        />
      ))}
      {Object.keys(ARROWS).map((key) => {
        const word = ARROWS[key].word
        const at = L.arrows[key].word
        if (!word || !at) return null
        return (
          <text
            key={key}
            className="lf-word"
            x={at.x}
            y={at.y}
            fontSize={t.word}
            textAnchor={at.anchor ?? 'start'}
          >
            {word}
          </text>
        )
      })}

      {/* the five labels, each with its note under it */}
      {ORDER.map((key) => {
        const part = PARTS[key]
        const at = L.labels[key]
        const lines = noteLines(part.note, at.lines, at.split)
        return (
          <g key={key}>
            <text className={`lf-label is-${part.tone}`} x={at.x} y={at.y} fontSize={t.label}>
              {part.label}
            </text>
            <text className="lf-note" x={at.x} y={at.y + t.lead} fontSize={t.note}>
              {lines.map((line, i) => (
                <tspan key={i} x={at.x} dy={i === 0 ? 0 : t.lead - 2}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function LoopFigure() {
  return (
    <figure className="instrument loop-figure">
      <InstrumentHead
        eyebrow="FIG.7 — THE LOOP"
        title={TITLE}
        purpose={READING}
        info={<InfoTag topic="loop" />}
      />
      <div className="inst-body">
        <div className="loop-drawing">
          <Drawing name="wide" />
          <Drawing name="stacked" />
        </div>
      </div>
      <figcaption>FIG.7 — {CAPTION}</figcaption>
    </figure>
  )
}
