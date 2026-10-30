// Shared drawing primitives, with no model, effects, measurements or controls.
// Wrap at a fixed mono measure. Preserve every character in textContent,
// including spaces at a line break and long tensor names broken mid-name.
import { textLines } from './figFormat.js'

export function Text({ children, x = 10, y, width, size, lead, className = 'ff-note', ...props }) {
  const lines = textLines(children, width, size)
  return (
    <text x={x} y={y} fontSize={size} className={className} {...props}>
      {lines.map((line, i) => <tspan key={i} x={x} dy={i ? lead : 0}>{line}</tspan>)}
    </text>
  )
}

export function ByteWindow({ window, cells, x, y, width, heroRow, id }) {
  const cell = width / window.cols
  return (
    <g id={id} transform={`translate(${x} ${y})`} data-byte-window={heroRow === undefined ? 'wall' : 'wte'}>
      <rect className="ff-byte-ground" width={width} height={cell * window.rows} />
      {cells.map((light, i) => (
        <rect key={i} x={Number(((i % window.cols) * cell).toFixed(4))}
          y={Number((Math.floor(i / window.cols) * cell).toFixed(4))}
          width={cell} height={cell}
          fill={`color-mix(in srgb, var(--screen), var(--frozen-lit) ${(16 + 84 * light).toFixed(2)}%)`} />
      ))}
      {heroRow !== undefined && <rect className="ff-hero-row" data-hero-row={heroRow}
        x={0} y={(heroRow - window.row0) * cell} width={width} height={cell} />}
    </g>
  )
}

export function Arrowhead({ id }) {
  return <defs><marker id={id} viewBox="0 0 7 7" markerWidth="7" markerHeight="7"
    markerUnits="userSpaceOnUse" refX="7" refY="3.5" orient="auto">
    <path className="ff-head" d="M0 0 L7 3.5 L0 7 Z" />
  </marker></defs>
}

export function Arrow({ d, id, ...props }) {
  return <path className="ff-arrow" d={d} markerEnd={`url(#${id})`} {...props} />
}
// The same full notes accompany both geometry variants, once in the caption.
export function Detail({ panels }) {
  return <dl className="ff-detail">
    {panels.map((panel) => <div key={panel.key}>
      <dt>{panel.label}</dt>
      <dd>{panel.tensorName && `${panel.tensorName} · `}{(panel.notes || [panel.note]).join(' · ')}</dd>
    </div>)}
  </dl>
}
