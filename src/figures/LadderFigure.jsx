import InstrumentHead from '../components/InstrumentHead.jsx'
import TeachPair from '../components/TeachPair.jsx'
import { COMPANY } from '../lib/company.js'
import facts from '../content/figFacts.json'
import { Arrow, Arrowhead, ByteWindow, Detail, Text } from './factDrawing.jsx'
import { integer, lengthLabel, shortTensorName, windowCells } from './figFormat.js'

// FIG.3: one data description, two always-mounted drawings. CSS alone chooses
// the geometry and reserves the entire viewBox before fonts or model loading.
// Wide: 12.4 units × 559/680 = 10.19 px at 641. Stacked: 10.5 × 308/300
// = 10.78 px at 390, capped at 360 px, exactly the loop's width contract.
const TITLE = 'One piece, followed into the file'
const CAPTION = 'One piece, followed into the file: the id picks a row of the word table; the row is the piece’s starting vector; the vector is the stream that falls through the walls; each wall is one weight tensor. Every number here is the file’s own, read when this page was built.'
const { hero, wte, rim, stream, wall } = facts
// figFacts carries the row's numbers but not the word table's name; it is
// spelled here once, as the panel label spelled it before. (Reading it from
// fileFacts.json would make that 232 kB lazy chunk an eager one.)
const wteName = 'transformer.wte.weight_quantized'
const wteCells = windowCells(wte.window)
const wallCells = windowCells(wall.window, true)
const start = lengthLabel(rim.heroLength)
const finish = lengthLabel(stream.heroLengths.at(-1))
const PANELS = [
  { key: 'piece', label: 'the piece', note: `id ${hero.id} · piece ${integer(hero.id + 1)} of ${integer(wte.rows)} in the word table` },
  { key: 'table', label: `the table · ${shortTensorName(wteName)}`, tensorName: wteName, note: `${integer(wte.rows)} rows × ${integer(wte.cols)} numbers · stored as one byte each, ${wte.dtype}, scale ${wte.scale.toFixed(4)}, zero point ${wte.zeroPoint} · ${integer(wte.bytes)} bytes` },
  { key: 'vector', label: 'the row is the vector', note: `${integer(wte.cols)} numbers; these are the first six · (byte − ${wte.zeroPoint}) × ${wte.scale.toFixed(4)} · the same six instrument A prints when the model is loaded` },
  { key: 'stream', label: 'the stream', note: `its first stop: wte + wpe, ${start} long · every block adds to the same running vector · ${start} → ${finish} by the last wall` },
  { key: 'tensor', label: `one wall is one tensor · ${shortTensorName(wall.name)}`, tensorName: wall.name, note: `${integer(wall.rows)} rows × ${integer(wall.cols)} columns · stored as one signed byte each, ${wall.dtype}, scale ${wall.scale.toFixed(4)}, zero point ${wall.zeroPoint} · ${integer(wall.bytes)} bytes · frozen: no pass changes one` },
]
const LAYOUTS = {
  wide: { w: 680, h: 390, size: 12.4, lead: 17, panelW: 124, arrowY: 120,
    panels: [240, 310, 355, 370, 280].map((h, i) => ({ x: 10 + i * 134, y: 10, h })) },
  stacked: { w: 300, h: 1370, size: 10.5, lead: 15, panelW: 280, panels: [
    { x: 10, y: 10, h: 145 }, { x: 10, y: 175, h: 310 }, { x: 10, y: 505, h: 195 },
    { x: 10, y: 720, h: 290 }, { x: 10, y: 1030, h: 330 },
  ] },
}

function PanelDrawing({ panel, layout, stacked, id }) {
  const { size, lead, panelW: w } = layout
  const text = { size, lead, width: w - 20 }
  const top = stacked ? 70 : 100
  const note = panel.key === 'piece' ? panel.note : panel.note.split(' · ')[0]
  if (panel.key === 'piece') return <>
    <text className="ff-token" x="10" y={stacked ? 75 : 90} fontSize={stacked ? 36 : 32}>{hero.token}</text>
    <Text {...text} y={stacked ? 110 : 130}>{note}</Text>
  </>
  if (panel.key === 'table') {
    const stripY = stacked ? 60 : 70
    const tableH = stacked ? 50 : 70
    const windowW = w - 20
    const windowX = 10
    const windowY = stripY + tableH + 25
    const windowBottom = windowY + windowW * wte.window.rows / wte.window.cols
    const mark = stripY + tableH * hero.id / wte.rows
    const heroY = windowY + (hero.id - wte.window.row0 + 0.5) * windowW / wte.window.cols
    return <>
      <rect className="ff-frozen" x="10" y={stripY} width="14" height={tableH} />
      <path className="ff-hero-row" d={`M8 ${mark} H26`} data-table-row={hero.id} />
      <path className="ff-guide" d={`M26 ${mark} H${w - 5} V${heroY} H${windowX + windowW}`} />
      <ByteWindow window={wte.window} cells={wteCells} x={windowX} y={windowY} width={windowW} heroRow={hero.id} />
      <Text {...text} y={windowBottom + 24}>{`${wte.window.rows} × ${wte.window.cols}`}</Text>
      <Text {...text} y={windowBottom + 49}>{note}</Text>
    </>
  }
  if (panel.key === 'vector') {
    const per = stacked ? wte.heroRowFirst6.length : 2
    const spacing = stacked ? 42 : 50
    const rows = Math.ceil(wte.heroRowFirst6.length / per)
    const rawY = stacked ? 60 : 90
    const floatY = rawY + rows * 23 + 38
    return <>
      {wte.heroRowFirst6Bytes.map((q, i) => <text className="ff-value" key={i} data-byte={i}
        x={10 + (i % per) * spacing} y={rawY + Math.floor(i / per) * 23} fontSize={size}>{q}</text>)}
      <Arrow id={id} d={`M${w / 2} ${rawY + rows * 23 - 8} V${floatY - 20}`} />
      {wte.heroRowFirst6.map((v, i) => <text className="ff-value" key={i} data-embedding={i}
        x={10 + (i % per) * spacing} y={floatY + Math.floor(i / per) * 23} fontSize={size}>{v.toFixed(2)}</text>)}
      <Text {...text} y={floatY + rows * 23 + 22}>{note}</Text>
    </>
  }
  if (panel.key === 'stream') {
    const y = stacked ? 75 : 100
    const gap = stacked ? 23 : 27
    const peak = Math.max(...stream.heroLengths)
    const barX = stacked ? 90 : 45
    const barW = stacked ? 115 : 27
    return <>
      <Text {...text} y={y - 20}>{`+ wpe[${hero.index}]`}</Text>
      <Arrow id={id} d={`M24 ${y - 10} V${y + (stream.heroLengths.length - 1) * gap + 10}`} />
      {stream.heroLengths.map((value, i) => <g key={i} data-stream-depth={i}>
        {i > 0 && <rect className="ff-frozen" x="10" y={y + (i - 0.5) * gap} width="28" height="6" />}
        <rect className="ff-moving" x={barX} y={y + i * gap - 5} width={barW * value / peak} height="4" />
        <text className="ff-value" x={w - 10} y={y + i * gap} textAnchor="end" fontSize={size}>{lengthLabel(value)}</text>
      </g>)}
      <Text {...text} y={y + stream.heroLengths.length * gap + 22}>{note}</Text>
    </>
  }
  const slabW = w - 20
  const slabH = slabW * wall.rows / wall.cols
  // The complete slab keeps the tensor's proportion. A use of the very same
  // cells paints its tiny window at top left at the true scale; a leader joins
  // it to the legible inset. Reuse adds no extra byte rects or second dataset.
  const insetY = top + slabH + 25
  const winW = w - 20
  const windowId = `${id}-wall-window`
  const scale = slabW * wall.window.cols / wall.cols / winW
  return <>
    <rect className="ff-frozen" x="10" y={top} width={slabW} height={slabH} />
    <use href={`#${windowId}`} data-wall-corner="true"
      transform={`translate(${10 - 10 * scale} ${top - insetY * scale}) scale(${scale})`} />
    <rect className="ff-window-mark" x="10" y={top} width={slabW * wall.window.cols / wall.cols} height={slabH * wall.window.rows / wall.rows} />
    <path className="ff-guide" d={`M10 ${top} L10 ${insetY}`} />
    <ByteWindow id={windowId} window={wall.window} cells={wallCells} x="10" y={insetY} width={winW} />
    <Text {...text} y={insetY + winW * wall.window.rows / wall.window.cols + 24}>{note}</Text>
  </>
}

function Drawing({ name }) {
  const L = LAYOUTS[name]
  const stacked = name === 'stacked'
  const id = `ladder-head-${name}`
  return <svg className={`ladder-svg ladder-${name}`} viewBox={`0 0 ${L.w} ${L.h}`}
    role="img" aria-label={`${TITLE}: ${PANELS.map((p) => p.label).join('; ')}`} focusable="false">
    <Arrowhead id={id} />
    <rect className="ff-frame" x="0.5" y="0.5" width={L.w - 1} height={L.h - 1} />
    {PANELS.map((panel, i) => {
      const at = L.panels[i]
      const next = L.panels[i + 1]
      return <g key={panel.key}>
        <g transform={`translate(${at.x} ${at.y})`} data-panel={panel.key}>
          <title>{`${panel.tensorName ? `${panel.tensorName} · ` : ''}${panel.note}`}</title>
          <rect className="ff-panel" width={L.panelW} height={at.h} />
          <Text x={10} y={23} width={L.panelW - 20} size={L.size} lead={L.lead} className="ff-label">{panel.label}</Text>
          <PanelDrawing panel={panel} layout={L} stacked={stacked} id={id} />
        </g>
        {next && <Arrow id={id} d={stacked
          ? `M150 ${at.y + at.h} V${next.y}`
          : `M${at.x + L.panelW} ${L.arrowY} H${next.x}`} />}
      </g>
    })}
  </svg>
}

export default function LadderFigure() {
  return <figure className="instrument ladder-figure">
    <InstrumentHead eyebrow="FIG.3 — THE LADDER" title={TITLE} />
    <div className="inst-body"><Drawing name="wide" /><Drawing name="stacked" /></div>
    <figcaption>FIG.3 — {CAPTION}<Detail panels={PANELS} /></figcaption>
    {COMPANY && <TeachPair className="fact-company-note" show="a"
      a="instrument A above prints stand-ins in this copy; this drawing prints the real row." b="" />}
  </figure>
}
