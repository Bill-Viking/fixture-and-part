const SOURCES = {
  standin: 'stand-in',
  file: 'the file’s own',
  pass: 'one real pass',
}

/** Callers gate this company-only mark so the public drawing stays identical. */
export default function NumberStatus({ source, changing = false, reserve = 'pass' }) {
  return (
    <span className={`number-status${source === 'standin' ? ' is-standin' : ''}`}>
      {changing && <span className="number-status-measure" aria-hidden="true">{SOURCES[reserve]}</span>}
      <span>{SOURCES[source]}</span>
    </span>
  )
}

const WATERMARK = 'ILLUSTRATIVE'

export function IllustrativeWatermark() {
  return <span className="illustrative-watermark" aria-hidden="true">{WATERMARK}</span>
}
