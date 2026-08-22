// The one worker, and who is allowed to talk to it.
//
// Instruments D and E both read the model file, and the file is 83 MB. Two
// workers would be two copies of it, so there is one — modelBytesWorker.js —
// and this module owns the handle, hands out request ids, and routes every
// reply back to whoever asked. Nothing is created until the first request:
// a reader who never scrolls to either instrument never spawns a thread.

import { CACHE_KEY, MODEL_ID, ONNX_FILE } from './realModel.js'

/** Where the file came from, and where to look for it again. */
export const MODEL_CONFIG = {
  cacheKey: CACHE_KEY,
  onnxFile: ONNX_FILE,
  fallbackUrl: `https://huggingface.co/${MODEL_ID}/resolve/main/onnx/${ONNX_FILE}`,
}

/** @type {Worker|null} */
let worker = null
let nextRequestId = 1
/** @type {Map<number, {onMessage:(m:any)=>void, onError:(m:string)=>void}>} */
const open = new Map()

function route(event) {
  const message = event.data
  const entry = open.get(message.requestId)
  if (!entry) return
  entry.onMessage(message)
}

function ensureWorker() {
  if (worker) return worker
  worker = new Worker(new URL('./modelBytesWorker.js', import.meta.url), {
    type: 'module',
  })
  worker.onmessage = route
  worker.onerror = (event) => {
    // This string is not for a console: instrument E interpolates it into a
    // sentence the reader sees, so it says what happened rather than which
    // piece of machinery it happened to.
    const message = event.message || 'the read stopped before it finished'
    for (const [requestId, entry] of open) {
      open.delete(requestId)
      entry.onError(message)
    }
  }
  return worker
}

/**
 * Registers a caller and returns its request id. Every reply carrying that id
 * goes to `onMessage`; the caller decides when it is finished and calls
 * `closeRequest`.
 */
export function openRequest(handlers) {
  const requestId = nextRequestId++
  open.set(requestId, handlers)
  return requestId
}

/** True if the request was still open, which is also "this cancel matters". */
export function closeRequest(requestId) {
  return open.delete(requestId)
}

export function postToWorker(message, transfer) {
  ensureWorker().postMessage(message, transfer ?? [])
}

/** Tells the worker to stop, if the caller had not already given up. */
export function cancelRequest(requestId) {
  if (!closeRequest(requestId)) return
  postToWorker({ type: 'cancel', requestId })
}
