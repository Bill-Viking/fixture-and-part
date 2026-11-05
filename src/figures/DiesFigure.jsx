import InstrumentHead from '../components/InstrumentHead.jsx'
import { Arrow, Arrowhead, Text } from './factDrawing.jsx'
import { integer } from './figFormat.js'

// FIG.7: one build-time description, two always-mounted static layouts.
// No JSON import, model state, effect, measurement, control or animation.
// CSS reserves exactly these viewBox ratios and switches at 640 px alone.
const { tokens, layer, head, position, weights, dims } = __DIES_FACTS__
const [rows, columns] = dims
const token = tokens[position]
const third = columns / 3
const TITLE = 'One token, three dies, one lookup'
const READING = 'A drawing, not an instrument: nothing here runs. One token of the page’s own sentence, pressed through the three dies of one block and looked up against the words before it, with the weights one head really gave them.'
const CAPTION = `FIG.7 — A drawing, not an instrument: nothing here runs. The weights are real: layer ${integer(layer)}, head ${integer(head)}, the page’s own sentence.`
const DIES = [
  { label: 'q die', part: 'Q · what I am looking for', tone: 'moving' },
  { label: 'k die', part: 'K · what I answer to', tone: 'keys' },
  { label: 'v die', part: 'V · what I hand over', tone: 'moving' },
].map((die, i) => ({ ...die, range: `cols ${i * third}–${(i + 1) * third - 1}` }))
const BOOKS = tokens.slice(0, position + 1).map((name, i) => ({
  token: name, weight: weights[i], printed: weights[i].toFixed(2).replace(/^0/, ''),
}))
const WALL = `h.${integer(layer)} attn.c_attn · ${integer(rows)} × ${integer(columns)} · one wall, three dies`
const DIES_TITLE = `the three dies: one wall of frozen weights, h.${integer(layer)} attn.c_attn, cut into its query, key and value thirds`
const LOOKUP_TITLE = `the lookup: one head’s softmax weights for ${token} over the words before it, layer ${integer(layer)} head ${integer(head)}`
const LAYOUTS = {
  wide: { w: 680, h: 414, label: 13.4, note: 12.2, lead: 17, lookup: { x: 330, y: 0, w: 350 } },
  stacked: { w: 300, h: 848, label: 12, note: 10.5, lead: 15, lookup: { x: 0, y: 434, w: 300 } },
}

function Dies({ layout: L, id }) {
  return <g>
    <title>{DIES_TITLE}</title>
    <rect className="ff-moving" x="10" y="18" width="280" height="24" />
    <text className="ff-token" x="20" y="35" fontSize={L.label}>{token}</text>
    <text className="ff-note" x="10" y="66" fontSize={L.note}>{`one row · ${integer(rows)} numbers`}</text>
    {DIES.map((die, i) => {
      const x = 10 + i * 98
      // Entry arrows leave the strip to the right of its note; the three
      // channels split in the clear space immediately above the slabs.
      const center = x + 37
      return <g key={die.label}>
        <Arrow className="ff-arrow dies-flow dies-tone-moving"
          d={`M${center} 42 V48 H284 V78 H${center} V94`} id={`${id}-moving`} />
        <rect className="ff-frozen" x={x} y="96" width="74" height="84" />
        <rect x={x} y="96" width="74" height="84" fill={`url(#${id}-steel-grid)`} />
        <Text x={x} y={202} width={88} size={L.label} lead={L.lead} className="ff-label">{die.label}</Text>
        <Text x={x} y={224} width={88} size={L.note} lead={L.lead}>{die.range}</Text>
        <Arrow className={`ff-arrow dies-flow dies-tone-${die.tone}`}
          d={`M${x} 166 H${x - 5} V266 H${x + 4}`} id={`${id}-${die.tone}`} />
        <rect className={die.tone === 'keys' ? 'dies-key-part' : 'ff-moving'}
          x={x + 4} y="260" width="70" height="12" />
        <Text x={x} y={297} width={88} size={L.label} lead={L.lead}
          className={`ff-label dies-part-label dies-tone-${die.tone}`}>{die.part}</Text>
      </g>
    })}
    <Text x={10} y={377} width={280} size={L.note} lead={L.lead}>{WALL}</Text>
  </g>
}

function Lookup({ layout: L, id }) {
  const { x, y, w } = L.lookup
  const slot = (w - 20) / BOOKS.length
  const bookW = slot - 8
  const shareScale = bookW / Math.max(...weights)
  const landing = { x: 18, y: 364, w: w - 36, h: 28 }
  return <g transform={`translate(${x} ${y})`}>
    <title>{LOOKUP_TITLE}</title>
    <Text x={10} y={24} width={w - 20} size={L.label} lead={L.lead} className="ff-label dies-part-label dies-tone-moving">
      {`Q of ${token}, held against every spine`}
    </Text>
    <rect className="ff-moving" x="10" y="44" width={w - 20} height="12" />
    <path className="ff-guide" d={`M8 216 H${w - 8}`} />
    <path className="ff-guide" d={`M8 281 H${w - 8}`} />
    {BOOKS.map((book, i) => {
      const bx = 10 + i * slot
      const share = book.weight * shareScale
      const spineX = bx + 14
      return <g key={i} data-dies-token={i} data-weight={book.weight}>
        <rect className="dies-book" x={bx} y="94" width={bookW} height="121" />
        <rect x={bx} y="94" width={bookW} height="121" fill={`url(#${id}-value-hatch)`} />
        <rect className="dies-spine" x={bx} y="94" width="20" height="121" />
        <text className="dies-spine-text" x={spineX} y="205" fontSize={L.note}
          transform={`rotate(-90 ${spineX} 205)`}>{book.token}</text>
        <text className="ff-value" x={bx + bookW / 2} y="239" fontSize={L.note} textAnchor="middle">{book.printed}</text>
        <rect className="ff-moving" x={bx} y="273" width={share} height="8" />
        <Arrow className="ff-arrow dies-flow dies-tone-moving"
          d={`M${bx + share / 2} 282 L${landing.x + (i + 0.5) * landing.w / BOOKS.length} ${landing.y}`}
          id={`${id}-moving`} style={{ strokeWidth: Math.max(0.6, book.weight * 6) }} />
      </g>
    })}
    <Text x={10} y={260} width={w - 20} size={L.note} lead={L.lead}>
      {'shares of one budget · they add to 1.00'}
    </Text>
    <rect className="dies-landing" x={landing.x} y={landing.y} width={landing.w} height={landing.h} />
    <text className="ff-label dies-part-label dies-tone-moving" x={w / 2} y={landing.y + 19}
      fontSize={L.label} textAnchor="middle">{`${token}, after the lookup`}</text>
  </g>
}

function Drawing({ name }) {
  const L = LAYOUTS[name]
  const id = `dies-${name}`
  return <svg className={`dies-svg dies-${name}`} viewBox={`0 0 ${L.w} ${L.h}`}
    role="img" aria-label={TITLE} focusable="false">
    {['moving', 'keys'].map((tone) => <g className={`dies-tone-${tone}`} key={tone}>
      <Arrowhead id={`${id}-${tone}`} />
    </g>)}
    <defs>
      <pattern id={`${id}-steel-grid`} width="8" height="8" patternUnits="userSpaceOnUse">
        <path className="dies-steel-grid" d="M8 0 H0 V8" />
      </pattern>
      <pattern id={`${id}-value-hatch`} width="6" height="6" patternUnits="userSpaceOnUse">
        <path className="dies-value-hatch" d="M-1 1 L1 -1 M0 6 L6 0 M5 7 L7 5" />
      </pattern>
    </defs>
    <rect className="ff-frame" x="0.5" y="0.5" width={L.w - 1} height={L.h - 1} />
    <path className="ff-guide" d={name === 'wide' ? 'M315 10 V404' : 'M10 424 H290'} />
    <Dies layout={L} id={id} />
    <Lookup layout={L} id={id} />
  </svg>
}

export default function DiesFigure() {
  return <figure className="instrument dies-figure">
    <InstrumentHead eyebrow="FIG.7 — THE THREE DIES" title={TITLE} purpose={READING} />
    <div className="inst-body">
      <Drawing name="wide" />
      <Drawing name="stacked" />
    </div>
    <figcaption>{CAPTION}</figcaption>
  </figure>
}
