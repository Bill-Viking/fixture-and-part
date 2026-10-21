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
// has been downloaded. The word table's shipped window is not its first 24
// rows but the 24 that hold the one word the rest of the page follows — "it"
// — and that row is written down as the lit row.
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
import { labelOf } from '../src/lib/pieceLabel.js'

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
/**
 * The one word the page follows, as the vocabulary spells it. The page's own
 * sentence is DEFAULT_SENTENCE in src/lib/toyModel.js, "The engine roared and
 * it shut down.", and its fifth token — index 4, where App.jsx's
 * `realQueryIndex` points instrument C — is " it". The word table's shipped
 * window is the one that holds this row, and the row is lit on it.
 */
const FOLLOWED_PIECE = 'Ġit'
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

/** The tokenizer's vocabulary, both ways: piece → id as the file has it, and id → piece. */
function vocabularyOf(tokenizerBytes) {
  const vocab = JSON.parse(new TextDecoder().decode(tokenizerBytes)).model.vocab
  const byId = new Map()
  for (const [piece, id] of Object.entries(vocab)) byId.set(id, piece)
  return { vocab, byId }
}

/**
 * Byte-level BPE writes every byte as one printable letter: the 188 bytes
 * that are printable already stand for themselves, and the other 68 — the
 * controls, the space, DEL, the high controls and the soft hyphen — are moved
 * up to U+0100 onward, in byte order. This is that mapping, computed, read
 * backwards: a letter of the spelling to the byte it stands for.
 */
const BYTE_OF = (() => {
  const bytes = []
  for (let b = 33; b <= 126; b++) bytes.push(b)
  for (let b = 161; b <= 172; b++) bytes.push(b)
  for (let b = 174; b <= 255; b++) bytes.push(b)
  const letters = [...bytes]
  let moved = 0
  for (let b = 0; b < 256; b++) {
    if (!bytes.includes(b)) {
      bytes.push(b)
      letters.push(256 + moved)
      moved++
    }
  }
  return new Map(letters.map((c, i) => [String.fromCodePoint(c), bytes[i]]))
})()

/**
 * The tokenizer's decode tidies the spaces a word piece carries before
 * punctuation and a few contractions (transformers.js `clean_up_tokenization`,
 * on by default for this tokenizer): the piece `Ġ.` decodes to "." and prints
 * as `.` on the page, not `␣.`. The same replacements, in the same order, so
 * a label read here is the label the page prints for the same row — 23 rows
 * of the table differ without it.
 */
const cleanUp = (text) =>
  text
    .replace(/ \./g, '.')
    .replace(/ \?/g, '?')
    .replace(/ !/g, '!')
    .replace(/ ,/g, ',')
    .replace(/ ' /g, "'")
    .replace(/ n't/g, "n't")
    .replace(/ 'm/g, "'m")
    .replace(/ 's/g, "'s")
    .replace(/ 've/g, "'ve")
    .replace(/ 're/g, "'re")

/**
 * A piece decoded and printed the way the page prints a token: its bytes read
 * as UTF-8 (a byte that is not a character on its own becomes �) and tidied
 * as the tokenizer's decode tidies them, then a leading space as ␣, a newline
 * as ⏎ and a tab as ⇥ — realModel.js `displayToken`, which the browser runs
 * on the loaded tokenizer's own decode.
 */
function printedOf(spelling) {
  const bytes = Uint8Array.from(Array.from(spelling, (ch) => {
    const b = BYTE_OF.get(ch)
    if (b === undefined) throw new Error(`the piece ${spelling} holds a letter no byte maps to`)
    return b
  }))
  const raw = cleanUp(new TextDecoder('utf-8').decode(bytes))
  return (raw.startsWith(' ') ? `␣${raw.slice(1)}` : raw)
    .replace(/\n/g, '⏎')
    .replace(/\t/g, '⇥')
}

/**
 * The label each of `ids` prints, by the one rule the live page uses
 * (src/lib/pieceLabel.js `labelOf`): the printed piece, or — where that print
 * holds � or a control character — the vocabulary's own spelling, its `Ġ`
 * shown as ␣.
 */
function piecesOf({ byId }, ids) {
  return ids.map((id) => {
    const piece = byId.get(id)
    if (piece === undefined) throw new Error(`the tokenizer has no piece for id ${id}`)
    return labelOf(printedOf(piece), piece)
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

    // The row the page follows. If the vocabulary does not have it the page's
    // own sentence no longer tokenizes the way every word below it says, and
    // that is a stop, not a fallback.
    const vocabulary = vocabularyOf(tokenizer)
    const litId = vocabulary.vocab[FOLLOWED_PIECE]
    if (!Number.isInteger(litId)) {
      throw new Error(`the tokenizer has no piece ${FOLLOWED_PIECE}; the lit row cannot be found`)
    }
    const litRow0 = litId - (litId % WINDOW_ROWS)
    process.stderr.write(`lit row ${FOLLOWED_PIECE} = id ${litId}, window from row ${litRow0}\n`)

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
      // Every tensor ships its first rows except the word table, which ships
      // the window holding the lit row.
      const view = windowOf(
        bytes,
        manifest,
        tensor.name,
        tensor.name === WTE ? litRow0 : 0,
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
        vocabulary,
        Array.from({ length: windows[WTE].rows }, (_, r) => windows[WTE].row0 + r),
      ),
    }
    const litRow = {
      [WTE]: { id: litId, piece: piecesOf(vocabulary, [litId])[0], row0: windows[WTE].row0 },
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
      litRow,
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
