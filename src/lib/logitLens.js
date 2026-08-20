// The main-thread half of the logit lens: it owns the worker, and it owns
// nothing else. The 38.6 MB embedding table lives on the worker side and
// never crosses back, so this page holds one Worker handle and a map of
// requests in flight.
//
// Nothing here runs until instrument D asks for its first real reading. The
// worker is created on that call, and it reads the model out of the cache
// bucket the page already filled — no second download.

import { CANDIDATE_COUNT } from './toyModel.js'
import { CACHE_KEY, MODEL_ID, ONNX_FILE, RESIDUAL_STOPS } from './realModel.js'

const FALLBACK_URL =
  `https://huggingface.co/${MODEL_ID}/resolve/main/onnx/${ONNX_FILE}`

const CONFIG = {
  cacheKey: CACHE_KEY,
  onnxFile: ONNX_FILE,
  fallbackUrl: FALLBACK_URL,
}

/** @type {Worker|null} */
let worker = null
let nextRequestId = 1
/** @type {Map<number, {onStop:Function,onTrace:Function,onDone:Function,onError:Function}>} */
const open = new Map()

function handle(event) {
  const message = event.data
  const handlers = open.get(message.requestId)
  if (!handlers) return
  if (message.type === 'stop') {
    handlers.onStop(message.stop, message.candidates)
  } else if (message.type === 'trace') {
    handlers.onTrace(message.winnerId, message.probabilities)
  } else if (message.type === 'done') {
    open.delete(message.requestId)
    handlers.onDone()
  } else if (message.type === 'error') {
    open.delete(message.requestId)
    handlers.onError(message.message)
  }
}

function ensureWorker() {
  if (worker) return worker
  worker = new Worker(new URL('./lensWorker.js', import.meta.url), {
    type: 'module',
  })
  worker.onmessage = handle
  worker.onerror = (event) => {
    const message = event.message || 'the lens worker stopped'
    for (const [requestId, handlers] of open) {
      open.delete(requestId)
      handlers.onError(message)
    }
  }
  return worker
}

/**
 * Reads the lens for one position.
 *
 * `stops` is the packed [RESIDUAL_STOPS x 768] block from realModel's
 * `residualStops`; its buffer is transferred, so the caller must not keep it.
 * Depths land one at a time through `onStop` as they finish, which is what
 * lets the panel fill from the top rather than appearing all at once.
 *
 * Returns a function that cancels the reading; a cancelled one stops at the
 * next depth instead of finishing the remaining arithmetic.
 *
 * @param {Float32Array} stops
 * @param {{onStop:Function,onTrace:Function,onDone:Function,onError:Function}} handlers
 * @param {number} [count] how many rows of each depth's shortlist to return
 */
export function readLens(stops, handlers, count = CANDIDATE_COUNT) {
  const requestId = nextRequestId++
  open.set(requestId, handlers)
  const target = ensureWorker()
  target.postMessage(
    {
      type: 'lens',
      requestId,
      config: CONFIG,
      stops: stops.buffer,
      count,
      depths: RESIDUAL_STOPS,
    },
    [stops.buffer],
  )
  return () => {
    if (!open.delete(requestId)) return
    target.postMessage({ type: 'cancel', requestId })
  }
}

// The instrument's central claim is an identity: the last stop's lens is the
// model's own output distribution, because it is the same final LayerNorm and
// the same unembedding the graph itself runs. A claim like that is worth
// being able to re-check rather than remember, so a dev build puts the check
// on the console — `__glassCheck(ids, index)` runs the lens for one position
// and prints its top rows beside the graph's own logits row for the same
// position. Production drops the whole block.
if (import.meta.env.DEV) {
  globalThis.__glassCheck = async (ids, index, depth = 10) => {
    const model = await import('./realModel.js')
    const run = await model.realForward(ids)
    const stops = model.residualStops(run, index)
    const last = RESIDUAL_STOPS - 1
    const lens = await new Promise((resolve, reject) => {
      let rows = []
      readLens(
        stops,
        {
          onStop: (stop, candidates) => {
            if (stop === last) rows = candidates
          },
          onTrace: () => {},
          onDone: () => resolve(rows),
          onError: reject,
        },
        depth,
      )
    })
    const graph = Array.from(
      await model.graphLogitsRow(ids, index),
      (logit, id) => ({ id, logit }),
    )
      .sort((a, b) => b.logit - a.logit)
      .slice(0, depth)
    const rows = graph.map((row, rank) => ({
      rank,
      token: model.tokenText(row.id),
      graphId: row.id,
      lensId: lens[rank].id,
      graphLogit: row.logit,
      lensLogit: lens[rank].logit,
      delta: lens[rank].logit - row.logit,
    }))
    return {
      position: index,
      rankingMatches: rows.every((row) => row.graphId === row.lensId),
      worstDelta: rows.reduce((worst, row) => Math.max(worst, Math.abs(row.delta)), 0),
      rows,
    }
  }
}
