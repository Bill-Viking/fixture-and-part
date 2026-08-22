// The main-thread half of instrument E.
//
// Four questions, all answered by the shared worker out of the copy of the
// model file already in this browser: what tensors are in the file and where,
// what the raw bytes of one of them look like, how the values of a whole one
// are distributed, and — asked again whenever the reader changes the text —
// what the whole file hashes to now. The first three are cached here, so
// moving back to a tensor already read costs nothing and re-reads nothing;
// the fourth deliberately is not.
//
// Nothing in this module talks about the shipped fileFacts.json. The panel
// decides which of the two it is showing and says so; this side only ever
// reports what the bytes in this browser actually say.

import {
  MODEL_CONFIG,
  closeRequest,
  openRequest,
  postToWorker,
} from './workerHost.js'

/** One request, one reply, one promise. */
function ask(message, replyType) {
  return new Promise((resolve, reject) => {
    const requestId = openRequest({
      onMessage: (reply) => {
        if (reply.type === replyType) {
          closeRequest(requestId)
          resolve(reply)
        } else if (reply.type === 'error') {
          closeRequest(requestId)
          reject(new Error(reply.message))
        }
      },
      onError: (text) => reject(new Error(text)),
    })
    postToWorker({ ...message, requestId, config: MODEL_CONFIG })
  })
}

/** @type {Promise<any>|null} */
let manifestRequest = null
const histograms = new Map()
const windows = new Map()

/**
 * The walk of the whole file: every initializer with its dtype, shape, byte
 * length and absolute offset, plus the sha256 of the file as published — not
 * of the cached copy, which carries the page's own appended fragment.
 */
export function readManifest() {
  if (!manifestRequest) {
    manifestRequest = ask({ type: 'file-manifest' }, 'file-manifest').catch((error) => {
      manifestRequest = null
      throw error
    })
  }
  return manifestRequest
}

/** The distribution of one whole tensor. Byte-exact for the quantized ones. */
export function readHistogram(name) {
  const held = histograms.get(name)
  if (held) return held
  const request = ask({ type: 'file-histogram', name }, 'file-histogram')
    .then((reply) => reply.histogram)
    .catch((error) => {
      histograms.delete(name)
      throw error
    })
  histograms.set(name, request)
  return request
}

/** A rectangle of raw bytes, or a run of raw floats, out of one tensor. */
export function readWindow(name, row0 = 0, col0 = 0) {
  const key = `${name}@${row0},${col0}`
  const held = windows.get(key)
  if (held) return held
  const request = ask({ type: 'file-window', name, row0, col0 }, 'file-window')
    .then((reply) => reply.window)
    .catch((error) => {
      windows.delete(key)
      throw error
    })
  windows.set(key, request)
  return request
}

/**
 * The hash of the file in this browser, taken again right now.
 *
 * Deliberately not cached. Every other read in this module is memoised
 * because asking twice for the same bytes is waste; this one exists to be
 * asked twice. The panel calls it when the reader changes the text and the
 * model runs on it, so that the claim "the file did not change" is a reading
 * rather than a memory.
 *
 * Resolves to null where there is no SubtleCrypto — a non-secure origin —
 * and the panel says nothing about the file in that case rather than claiming
 * something it did not check.
 */
export function readSha() {
  return ask({ type: 'file-rehash' }, 'file-rehash').then((reply) => reply.sha)
}

/** True once the live manifest has been asked for and has landed. */
export function hasManifest() {
  return manifestRequest !== null
}

// ---------------------------------------------------------------------------
// The shipped copy, decoded
// ---------------------------------------------------------------------------

function base64Bytes(text) {
  const binary = atob(text)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}

/**
 * A window out of fileFacts.json in the same shape the worker returns, so the
 * panel can draw either without knowing which it has. Endianness is read
 * rather than assumed.
 */
export function decodeWindow(shipped) {
  const raw = base64Bytes(shipped.base64)
  if (shipped.kind === 'bytes') return { ...shipped, data: raw }
  const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength)
  const data = new Float32Array(raw.byteLength / 4)
  for (let i = 0; i < data.length; i++) data[i] = view.getFloat32(i * 4, true)
  return { ...shipped, data }
}

// ---------------------------------------------------------------------------
// The check
// ---------------------------------------------------------------------------

// Instrument E's claim is that the numbers on it were read from the file, and
// that the copy in this browser is that file. Two things have to be true for
// that, and neither is worth remembering when it can be re-run:
//
//   the shipped reading matches a fresh reading of the cached bytes, tensor
//   by tensor, bin by bin, byte by byte;
//
//   and turning a raw byte into a weight the way the panel says — value =
//   scale * (byte - zero point) — produces the same number the model's own
//   graph produces for that weight, which is the only part of this the page
//   cannot check against itself.
//
// The second is the one that matters. `wteRowCheck` dequantizes a row of the
// embedding table straight out of the file's bytes and compares it with the
// same row as the graph's own Gather -> DequantizeLinear hands it back.
if (import.meta.env.DEV) {
  globalThis.__fileCheck = async (options = {}) => {
    const started = performance.now()
    const tokenId = options.tokenId ?? 262
    const facts = (await import('../content/fileFacts.json')).default
    const live = await readManifest()

    const shaMatches = live.sha === facts.provenance.sha256

    const manifestDiffs = []
    const shipped = facts.manifest
    for (const key of ['bytes', 'nodeCount', 'tensorCount', 'weightBytes', 'parameters']) {
      if (live.manifest[key] !== shipped[key]) {
        manifestDiffs.push(`${key}: ${live.manifest[key]} vs ${shipped[key]}`)
      }
    }
    for (const key of ['graph', 'trailer']) {
      const a = live.manifest[key]
      const b = shipped[key]
      if (a.offset !== b.offset || a.byteLength !== b.byteLength) {
        manifestDiffs.push(`${key}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`)
      }
    }
    for (let i = 0; i < Math.max(live.manifest.tensors.length, shipped.tensors.length); i++) {
      const a = live.manifest.tensors[i]
      const b = shipped.tensors[i]
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        manifestDiffs.push(`tensor ${i}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`)
      }
    }

    const names = options.names ?? Object.keys(facts.histograms)
    const histogramDiffs = []
    let worstStat = 0
    for (const name of names) {
      const a = await readHistogram(name)
      const b = facts.histograms[name]
      if (!b) {
        histogramDiffs.push(`${name}: nothing shipped`)
        continue
      }
      if (a.counts.length !== b.counts.length) {
        histogramDiffs.push(`${name}: ${a.counts.length} bins vs ${b.counts.length}`)
        continue
      }
      let binDiffs = 0
      for (let i = 0; i < a.counts.length; i++) if (a.counts[i] !== b.counts[i]) binDiffs++
      if (binDiffs > 0) histogramDiffs.push(`${name}: ${binDiffs} bins differ`)
      for (const key of Object.keys(b.stats)) {
        const delta = Math.abs(a.stats[key] - b.stats[key])
        if (delta > worstStat) worstStat = delta
        if (delta !== 0) histogramDiffs.push(`${name}.${key}: Δ ${delta}`)
      }
    }

    const windowDiffs = []
    for (const name of names) {
      const a = await readWindow(name, 0, 0)
      const b = decodeWindow(facts.windows[name])
      if (a.data.length < b.data.length) {
        windowDiffs.push(`${name}: ${a.data.length} values vs ${b.data.length} shipped`)
        continue
      }
      let bad = 0
      for (let i = 0; i < b.data.length; i++) if (a.data[i] !== b.data[i]) bad++
      if (bad > 0) windowDiffs.push(`${name}: ${bad} values differ`)
    }

    // The one check the page cannot make against itself.
    const model = await import('./realModel.js')
    await model.realForward([tokenId])
    const graphRow = model.realEmbedding(tokenId)
    const scale = live.manifest.tensors.find(
      (t) => t.name === 'transformer.wte.weight_scale',
    ).value
    const zeroPoint = live.manifest.tensors.find(
      (t) => t.name === 'transformer.wte.weight_zero_point',
    ).value
    const view = await readWindow('transformer.wte.weight_quantized', tokenId, 0)
    const row = tokenId - view.row0
    let maxDelta = 0
    const pairs = []
    for (let d = 0; d < (graphRow?.length ?? 0); d++) {
      const fromBytes = scale * (view.data[row * view.cols + d] - zeroPoint)
      const delta = Math.abs(fromBytes - graphRow[d])
      if (delta > maxDelta) maxDelta = delta
      pairs.push({ d, fromBytes, fromGraph: graphRow[d], delta })
    }

    return {
      shaMatches,
      sha: live.sha,
      manifestDiffs,
      histogramDiffs,
      windowDiffs,
      tensorsChecked: names.length,
      worstStatDelta: worstStat,
      wteRowCheck: {
        id: tokenId,
        token: model.tokenText(tokenId),
        dims: graphRow?.length ?? 0,
        maxDelta,
        pairs,
      },
      ms: Math.round(performance.now() - started),
    }
  }
}
