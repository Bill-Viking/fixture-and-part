import InstrumentHead from '../components/InstrumentHead.jsx'
import facts from '../content/figFacts.json'
import { Arrow, Arrowhead, Text } from './factDrawing.jsx'

// FIG.5: one measured ledger, two fixed layouts, no runtime pass or focus stops.
// As in the loop: 12.4 × 559/680 = 10.19 px at 641; 10.5 × 308/300 =
// 10.78 px at 390. CSS reserves each viewBox, and caps stacked width at 360.
const TITLE = 'The rack, before and after'
const CAPTION = 'The rack as a ledger: each token’s finished parts stamped once when it arrives, read upward by every later token, never rewritten. Rows 1–7 drawn before and after token 8 arrives, with the measured move of each; the brain’s move beside it for contrast.'
const { tokens, rack } = facts
const last = tokens.length - 1
const PANELS = [
  { key: 'rack', label: 'the rack is a ledger', notes: [
    `token ${tokens.length} arrives: it writes its own row and reads the seven above · layer ${rack.layer}, head ${rack.head}, the first six of ${rack.headWidth} · nothing points down`,
  ] },
  { key: 'comparison', label: 'before and after', notes: [
    'in a deployment these rows are stored once and reused: byte for byte the same',
    `this page’s model re-runs the whole sentence each step and its rounding can nudge a row — the largest move measured here: ${rack.moved.max.toFixed(4)} against values up to ${rack.moved.maxAbsValue.toFixed(1)}`,
  ] },
  { key: 'brain', label: 'the brain’s move', notes: [
    'sections 05 and 06: check the memory out, edit it, write it back, forget most of the rest',
    'the one thing the rack never does',
  ] },
]
const LAYOUTS = {
  wide: { w: 680, h: 1260, size: 12.4, lead: 17, panels: [
    { x: 10, y: 10, w: 212, h: 1240 }, { x: 232, y: 10, w: 300, h: 1240 }, { x: 542, y: 10, w: 128, h: 1240 },
  ] },
  stacked: { w: 300, h: 1930, size: 10.5, lead: 15, panels: [
    { x: 10, y: 10, w: 280, h: 520 }, { x: 10, y: 550, w: 280, h: 1030 }, { x: 10, y: 1600, w: 280, h: 320 },
  ] },
}

function Values({ values, x, y, cols, step, size, lead, role, source, row }) {
  return <g data-values={`${source}-${role}-${row}`}>
    <text className={`ff-role is-${role}`} x={x} y={y} fontSize={size}>{role.toUpperCase()}</text>
    {values.map((value, i) => <text className="ff-value" key={i} x={x + 16 + (i % cols) * step}
      y={y + Math.floor(i / cols) * lead} fontSize={size}>{value.toFixed(2)}</text>)}
  </g>
}

function Rack({ at, L, stacked, id }) {
  const pitch = stacked ? 48 : 100
  const top = stacked ? 64 : 78
  const lead = stacked ? 14 : 17
  const incoming = top + last * pitch
  return <>
    {tokens.map((token, i) => {
      const y = top + i * pitch
      return <g key={i} data-rack-row={i} data-state={i === last ? 'arriving' : 'stamped'}>
        {i === last && <rect className="ff-arrival" x="5" y={y - 14} width={at.w - 10} height={pitch - 2} />}
        <text className="ff-token" x="10" y={y} fontSize={L.size}>{token}</text>
        <Values values={rack.k[i]} x={10} y={y + lead} cols={stacked ? rack.k[i].length : 3}
          step={stacked ? 39 : 58} size={L.size} lead={lead} role="k" source="rack" row={i} />
        <Values values={rack.v[i]} x={10} y={y + lead * (stacked ? 2 : 3)} cols={stacked ? rack.v[i].length : 3}
          step={stacked ? 39 : 58} size={L.size} lead={lead} role="v" source="rack" row={i} />
        {i < last && <line className="ff-stamp" x1="10" x2={at.w - 30} y1={y + pitch - 13} y2={y + pitch - 13} />}
      </g>
    })}
    {tokens.slice(0, last).map((_, i) => {
      const x = at.w - 18 + i * 1.5
      return <Arrow key={i} id={id} data-reads-row={i}
        d={`M${at.w - 22} ${incoming - 4} L${x} ${incoming - 14} V${top + i * pitch + 3}`} />
    })}
    <Text x={10} y={incoming + pitch + (stacked ? 7 : 18)} width={at.w - 20} size={L.size} lead={L.lead}>{PANELS[0].notes[0]}</Text>
  </>
}

function Comparison({ at, L, stacked }) {
  const pitch = stacked ? 102 : 124
  const top = stacked ? 80 : 100
  const colW = stacked ? 106 : 116
  const right = at.w - 10 - colW
  const lead = stacked ? 14 : 17
  // Labels sit on their own line so all six numbers remain legible at the
  // exact floor. Two rows of three numbers per role, on both sides.
  const side = (data, source, i, x, y) => <g data-comparison={`${source}-${i}`}>
    <text className="ff-token" x={x} y={y} fontSize={L.size}>{tokens[i]}</text>
    {['k', 'v'].map((role, r) => <g key={role} data-values={`${source}-${role}-${i}`}>
      <text className={`ff-role is-${role}`} x={x} y={y + (1 + r * 3) * lead} fontSize={L.size}>{role.toUpperCase()}</text>
      {data[role][i].map((value, d) => <text key={d} className="ff-value"
        x={x + (d % 3) * (colW / 3)} y={y + (2 + r * 3 + Math.floor(d / 3)) * lead}
        fontSize={L.size}>{value.toFixed(2)}</text>)}
    </g>)}
  </g>
  // K/V tags share the gutter above their number rows; the position label
  // stays in the same header at both sequence lengths.
  return <>
    <text className="ff-label" x="10" y={stacked ? 53 : 64} fontSize={L.size}>before</text>
    <text className="ff-label" x={right} y={stacked ? 53 : 64} fontSize={L.size}>after</text>
    {rack.before.k.map((_, i) => {
      const y = top + i * pitch
      const same = rack.moved.k[i] < 1e-4 && rack.moved.v[i] < 1e-4
      const move = Math.max(rack.moved.k[i], rack.moved.v[i])
      return <g key={i}>
        {side(rack.before, 'before', i, 10, y)}
        {side(rack, 'after', i, right, y)}
        <text className="ff-move" x={at.w / 2} y={y + 3 * lead} textAnchor="middle" fontSize={L.size} data-move-row={i}>
          {same ? 'same' : <><tspan x={at.w / 2}>moved </tspan><tspan x={at.w / 2} dy={lead}>{move.toFixed(4)}</tspan></>}
        </text>
        <line className="ff-stamp" x1="10" x2={at.w - 10} y1={y + pitch - 8} y2={y + pitch - 8} />
      </g>
    })}
    <Text x={10} y={top + rack.before.k.length * pitch + 22} width={at.w - 20} size={L.size} lead={L.lead}>{PANELS[1].notes[0]}</Text>
    <Text x={10} y={top + rack.before.k.length * pitch + 90} width={at.w - 20} size={L.size} lead={L.lead}>{PANELS[1].notes[1]}</Text>
  </>
}

function Brain({ at, L, stacked, id }) {
  const x = stacked ? 30 : 18
  const y = stacked ? 125 : 200
  const width = stacked ? 105 : 80
  return <>
    {[0, 1, 2, 3].map((i) => <rect key={i} className="ff-sheet" x={x} y={y + i * 15} width={width} height="12" />)}
    <rect className="ff-sheet" x={x} y={y - 70} width={width} height="12" />
    <path className="ff-edit" d={`M${x + 16} ${y - 66} l6 5 l9 -8 M${x + 33} ${y - 64} h24`} />
    <Arrow id={id} d={`M${x} ${y + 20} H${x - 9} V${y - 64} H${x}`} />
    <Arrow id={id} d={`M${x + width} ${y - 64} H${x + width + 9} V${y + 20} H${x + width}`} />
    <path className="ff-edit" d={`M${x + 16} ${y + 19} l6 5 l9 -8`} />
    <Text x={10} y={stacked ? 208 : 300} width={at.w - 20} size={L.size} lead={L.lead}>{PANELS[2].notes[0]}</Text>
    <Text x={10} y={stacked ? 275 : 490} width={at.w - 20} size={L.size} lead={L.lead}>{PANELS[2].notes[1]}</Text>
  </>
}

function Drawing({ name }) {
  const L = LAYOUTS[name]
  const stacked = name === 'stacked'
  const id = `ledger-head-${name}`
  return <svg className={`ledger-svg ledger-${name}`} viewBox={`0 0 ${L.w} ${L.h}`}
    role="img" aria-label={`${TITLE}: ${PANELS.map((p) => p.label).join('; ')}`} focusable="false">
    <Arrowhead id={id} />
    <rect className="ff-frame" x="0.5" y="0.5" width={L.w - 1} height={L.h - 1} />
    {PANELS.map((panel, i) => {
      const at = L.panels[i]
      return <g key={panel.key} transform={`translate(${at.x} ${at.y})`} data-panel={panel.key}>
        <rect className="ff-panel" width={at.w} height={at.h} />
        <Text x={10} y={23} width={at.w - 20} size={L.size} lead={L.lead} className="ff-label">{panel.label}</Text>
        {i === 0 ? <Rack at={at} L={L} stacked={stacked} id={id} />
          : i === 1 ? <Comparison at={at} L={L} stacked={stacked} />
            : <Brain at={at} L={L} stacked={stacked} id={id} />}
      </g>
    })}
  </svg>
}

export default function LedgerFigure() {
  return <figure className="instrument ledger-figure">
    <InstrumentHead eyebrow="FIG.5 — THE LEDGER" title={TITLE} />
    <div className="inst-body"><Drawing name="wide" /><Drawing name="stacked" /></div>
    <figcaption>FIG.5 — {CAPTION}</figcaption>
  </figure>
}
