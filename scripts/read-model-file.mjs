#!/usr/bin/env node
// Reads the model file, and writes down what is in it.
//
// Instrument E claims that nothing it shows is illustrative. That claim has
// to survive a reader who has not pressed "load the real model" yet, so the
// facts are read out of the file ahead of time by this script and shipped as
// src/content/fileFacts.json — the manifest of every tensor, the distribution
// of every one of them, a window of raw bytes out of each weight, and a
// whole-tensor thumbnail of each one, which instrument F draws as the texture
// inside the box that names it. For the word table it also writes the mean and
// sd of every one of its 768 columns over all 50,257 rows — two of the
// window's slots stand out across the whole table and the window marks them —
// and the piece of text each of the shipped window's 24 rows stands for, read
// from the tokenizer file, so the window can label its rows before anything
// has been downloaded.
//
// The point of doing it here rather than by hand is that the browser re-reads
// exactly the same things from its own cached copy the moment the model
// loads, using the same module (src/lib/onnxScan.js), and the instrument says
// out loud whether the two agree. So this file is not a source of numbers; it
// is a dated reading, and the page is able to re-take it.
//
// Usage:
//
//   node scripts/read-model-file.mjs                    # downloads the file
//   node scripts/read-model-file.mjs --file model.onnx  # reads a local copy
//   node scripts/read-model-file.mjs --out other.json
//   node scripts/read-model-file.mjs --allow-new-sha    # the upload changed
//   node scripts/read-model-file.mjs --tokenizer tokenizer.json  # local copy
//
// The sha256 is checked, not trusted: a file that hashes to something else is
// a different file, and the script stops rather than quietly re-dating facts
// about it. The tokenizer file is checked the same way, against its own hash.

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  THUMB_COLS,
  THUMB_ROWS,
  WINDOW_COLS,
  WINDOW_ROWS,
  columnStatsOf,
  histogramOf,
  quantOf,
  readableTensors,
  scanManifest,
  thumbnailOf,
  windowOf,
} from '../src/lib/onnxScan.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

const MODEL_ID = 'Xenova/distilgpt2'
const ONNX_FILE = 'decoder_model_quantized.onnx'
const URL = `https://huggingface.co/${MODEL_ID}/resolve/main/onnx/${ONNX_FILE}`
const EXPECTED_SHA =
  '1d3ab4d7e08ca9b8ea9a42dda13a05b7ff0f1b0c9bdc4f6eba27e7f0ceff8431'
const TOKENIZER_URL = `https://huggingface.co/${MODEL_ID}/resolve/main/tokenizer.json`
const EXPECTED_TOKENIZER_SHA =
  'cda20b8ca044949aa07ac4078420c80d1a57139d5f9f33700e46fb2d891e7c66'
/** The one table whose columns and rows the window labels. */
const WTE = 'transformer.wte.weight_quantized'
/** Four decimals: the precision the window's words are written to and checked at. */
const round4 = (v) => Math.round(v * 1e4) / 1e4

/** How many values of an f32 vector are shipped: one row of the blob panel. */
const FLOAT_WINDOW_ROWS = 1

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name)
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : fallback
}

const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')))

async function getBytes() {
  const local = arg('--file')
  if (local) {
    process.stderr.write(`reading ${local}\n`)
    return new Uint8Array(await readFile(resolve(process.cwd(), local)))
  }
  process.stderr.write(`downloading ${URL}\n`)
  const response = await fetch(URL)
  if (!response.ok) throw new Error(`download failed (${response.status})`)
  return new Uint8Array(await response.arrayBuffer())
}

async function getTokenizer() {
  const local = arg('--tokenizer')
  if (local) {
    process.stderr.write(`reading ${local}\n`)
    return new Uint8Array(await readFile(resolve(process.cwd(), local)))
  }
  process.stderr.write(`downloading ${TOKENIZER_URL}\n`)
  const response = await fetch(TOKENIZER_URL)
  if (!response.ok) throw new Error(`tokenizer download failed (${response.status})`)
  return new Uint8Array(await response.arrayBuffer())
}

/**
 * The piece of text each of `ids` stands for, printed the way the page prints
 * a token: byte-level BPE writes a leading space as `Ġ`, and the page writes
 * it as `␣` (realModel.js `displayToken`).
 */
function piecesOf(tokenizerBytes, ids) {
  const vocab = JSON.parse(new TextDecoder().decode(tokenizerBytes)).model.vocab
  const byId = new Map()
  for (const [piece, id] of Object.entries(vocab)) byId.set(id, piece)
  return ids.map((id) => {
    const piece = byId.get(id)
    if (piece === undefined) throw new Error(`the tokenizer has no piece for id ${id}`)
    return piece.replace(/^Ġ/, '␣')
  })
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function main() {
  return getBytes().then(async (bytes) => {
    const started = Date.now()
    const sha = sha256(bytes)
    process.stderr.write(`sha256 ${sha}\nbytes  ${bytes.length}\n`)
    if (sha !== EXPECTED_SHA && !flags.has('--allow-new-sha')) {
      throw new Error(
        `this is not the file the page expects\n` +
          `  expected ${EXPECTED_SHA}\n` +
          `  read     ${sha}\n` +
          `pass --allow-new-sha if the upload has genuinely changed`,
      )
    }

    const tokenizer = await getTokenizer()
    const tokenizerSha = sha256(tokenizer)
    process.stderr.write(`tokenizer sha256 ${tokenizerSha}\ntokenizer bytes  ${tokenizer.length}\n`)
    if (tokenizerSha !== EXPECTED_TOKENIZER_SHA && !flags.has('--allow-new-sha')) {
      throw new Error(
        `this is not the tokenizer the page expects\n` +
          `  expected ${EXPECTED_TOKENIZER_SHA}\n` +
          `  read     ${tokenizerSha}\n` +
          `pass --allow-new-sha if the upload has genuinely changed`,
      )
    }

    const manifest = scanManifest(bytes)
    process.stderr.write(
      `graph  ${manifest.nodeCount} nodes, ${manifest.graph.byteLength} bytes\n` +
        `tensors ${manifest.tensorCount}, ${manifest.weightBytes} bytes, ` +
        `${manifest.parameters} parameters\n` +
        `trailer ${manifest.trailer.byteLength} bytes\n`,
    )

    const histograms = {}
    const windows = {}
    // The whole of each tensor at a size a steel box can hold. Instrument F
    // draws these as the texture inside the box that names the tensor, so a
    // reader who has not downloaded anything is still looking at the file's
    // own bytes rather than at a hatch pattern somebody chose.
    const thumbnails = {}
    for (const tensor of readableTensors(manifest)) {
      histograms[tensor.name] = histogramOf(bytes, manifest, tensor.name)
      const thumb = thumbnailOf(bytes, manifest, tensor.name)
      thumbnails[tensor.name] = {
        dtype: thumb.dtype,
        rows: thumb.rows,
        cols: thumb.cols,
        totalRows: thumb.totalRows,
        totalCols: thumb.totalCols,
        lo: thumb.lo,
        hi: thumb.hi,
        base64: Buffer.from(
          thumb.data.buffer,
          thumb.data.byteOffset,
          thumb.data.byteLength,
        ).toString('base64'),
      }
      const quantized = Boolean(quantOf(manifest, tensor.name))
      const view = windowOf(
        bytes,
        manifest,
        tensor.name,
        0,
        0,
        quantized ? undefined : FLOAT_WINDOW_ROWS,
      )
      const shipped = {
        kind: view.kind,
        dtype: view.dtype,
        rows: view.rows,
        cols: view.cols,
        row0: view.row0,
        col0: view.col0,
        totalRows: view.totalRows,
        totalCols: view.totalCols,
      }
      // Both kinds ship as base64 of their own raw bytes — u8/i8 as stored,
      // f32 as little-endian IEEE. Printing the floats as decimals cost
      // twice the characters and would have made the shipped copy a rounding
      // of the file rather than the file, which is the one thing this
      // instrument is not allowed to be.
      shipped.base64 = Buffer.from(
        view.data.buffer,
        view.data.byteOffset,
        view.data.byteLength,
      ).toString('base64')
      windows[tensor.name] = shipped
    }

    // The word table's columns over every one of its rows, and the pieces its
    // shipped window's rows stand for. Four decimals: the words on the page
    // are written to that precision and the live reading is compared at it.
    const stats = columnStatsOf(bytes, manifest, WTE)
    const columnStats = {
      [WTE]: {
        rows: stats.rows,
        cols: stats.cols,
        mean: Array.from(stats.mean, round4),
        sd: Array.from(stats.sd, round4),
      },
    }
    const rowLabels = {
      [WTE]: piecesOf(
        tokenizer,
        Array.from({ length: windows[WTE].rows }, (_, r) => windows[WTE].row0 + r),
      ),
    }

    const facts = {
      provenance: {
        url: URL,
        sha256: sha,
        bytes: bytes.length,
        readAt: new Date().toISOString().slice(0, 10),
        script: 'scripts/read-model-file.mjs',
        windowRows: WINDOW_ROWS,
        windowCols: WINDOW_COLS,
        floatWindowValues: FLOAT_WINDOW_ROWS * WINDOW_COLS,
        thumbRows: THUMB_ROWS,
        thumbCols: THUMB_COLS,
        tokenizer: { url: TOKENIZER_URL, sha256: tokenizerSha, bytes: tokenizer.length },
      },
      manifest,
      histograms,
      windows,
      thumbnails,
      columnStats,
      rowLabels,
    }

    const out = resolve(ROOT, arg('--out', 'src/content/fileFacts.json'))
    await mkdir(dirname(out), { recursive: true })
    const json = JSON.stringify(facts)
    await writeFile(out, `${json}\n`)
    process.stderr.write(
      `wrote ${out}\n` +
        `  ${json.length} bytes, ${Object.keys(histograms).length} histograms, ` +
        `${Object.keys(windows).length} windows, ` +
        `${Object.keys(thumbnails).length} thumbnails\n` +
        `  ${Date.now() - started} ms\n`,
    )
  })
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
})
