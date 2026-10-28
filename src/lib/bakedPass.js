// Keep this build-time gate local so Vite discards the JSON before chunk discovery.
const COMPANY = import.meta.env.VITE_COMPANY === '1'

function floats(base64) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
  const view = new DataView(bytes.buffer)
  const values = new Float32Array(bytes.length / 4)
  for (let i = 0; i < values.length; i++) values[i] = view.getFloat32(i * 4, true)
  return values
}

function decode({ default: facts }) {
  const { run, tokenNames, nextToken, decode: rule } = facts
  return {
    run: {
      ...run,
      attention: run.attention.map(floats),
      residuals: run.residuals.map(floats),
      lastLogits: floats(run.lastLogits),
      tokenNames,
      baked: true,
    },
    nextToken,
    decode: rule,
  }
}

export const loadBakedPass = COMPANY ? () => import('../content/passFacts.json').then(decode) : undefined
