#!/usr/bin/env node
// Bake the page's own sentence from verified, already-cached bytes. Never fetch.
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { AutoTokenizer, env } from '@huggingface/transformers'
import { InferenceSession, Tensor } from 'onnxruntime-node'
import { PROMOTED_OUTPUTS, REAL_HIDDEN, displayToken, runPass, withAttentionOutputs } from '../src/lib/passCore.js'
import { feedFor, tensorData, KV_LAYER } from '../src/lib/passCore.js'
import { DEFAULT_SENTENCE } from '../src/lib/toyModel.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = resolve(ROOT, 'node_modules/@huggingface/transformers/.cache')
const MODEL_CACHE = resolve(CACHE, 'Xenova/distilgpt2')
const require = createRequire(import.meta.url)
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const EXPECTED_IDS = [464, 3113, 45615, 290, 340, 4423, 866, 13]
const M = 6
let step = 1
let phase = 'the published bytes'
const line = (result) => new Promise((done, reject) => {
  process.stdout.write(`${step} of ${M} · ${phase} · ${result}\n`, (error) => error ? reject(error) : done())
})
const heartbeat = setInterval(() => { void line('waiting') }, 30_000)

// feedFor uses transformers' constructor shape in the browser. Only ORT-node
// creates tensors here; transformers is used for the tokenizer alone.
class PassTensor {
  constructor(...args) { this.ort_tensor = new Tensor(...args) }
}

function base64(array) {
  const bytes = Buffer.allocUnsafe(array.length * 4)
  for (let i = 0; i < array.length; i++) bytes.writeFloatLE(array[i], i * 4)
  return bytes.toString('base64')
}

function normRange(run) {
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i < run.n; i++) {
    for (const stop of run.residuals) {
      let sum = 0
      for (let d = 0; d < REAL_HIDDEN; d++) {
        const v = stop[i * REAL_HIDDEN + d]
        sum += v * v
      }
      const norm = Math.sqrt(sum)
      lo = Math.min(lo, norm)
      hi = Math.max(hi, norm)
    }
  }
  return `${lo.toFixed(1)} → ${hi.toFixed(1)}`
}

let session
try {
  const args = process.argv.slice(2)
  if (args.length && (args.length !== 2 || args[0] !== '--file' || !args[1])) {
    throw new Error('usage: node scripts/bake-pass.mjs [--file <path>]')
  }
  const { provenance } = JSON.parse(await readFile(resolve(ROOT, 'src/content/fileFacts.json'), 'utf8'))
  const local = args[1]
  const cached = await readFile(local ? resolve(process.cwd(), local) : resolve(MODEL_CACHE, 'onnx/decoder_model_quantized.onnx'))
  // ASSUMES: the default cache starts with the published file and may have an old tail.
  // Always verify that prefix; an explicit --file must itself be the published bytes.
  const bytes = local ? cached : cached.subarray(0, provenance.bytes)
  const modelSha = sha256(bytes)
  if (modelSha !== provenance.sha256 || bytes.length !== provenance.bytes) {
    throw new Error(`model sha256 expected ${provenance.sha256}, got ${modelSha}; bytes expected ${provenance.bytes}, got ${bytes.length}`)
  }
  await line(`${bytes.length} bytes · sha256 ${modelSha}`)

  step = 2; phase = 'the graph'
  session = await InferenceSession.create(withAttentionOutputs(bytes), {
    executionProviders: ['cpu'], intraOpNumThreads: 1, interOpNumThreads: 1,
  })
  const required = [...PROMOTED_OUTPUTS, 'logits', 'present.0.key', 'present.0.value']
  const missing = required.filter((name) => !session.outputNames.includes(name))
  if (missing.length > 0) throw new Error(`the model graph is missing outputs: ${missing.join(', ')}`)
  await line(`${PROMOTED_OUTPUTS.length} promoted outputs · logits · present.0.key · present.0.value · cpu`)

  step = 3; phase = 'the tokenizer'
  env.allowRemoteModels = false
  env.cacheDir = CACHE
  const tokenizerBytes = await readFile(resolve(MODEL_CACHE, 'tokenizer.json'))
  const tokenizerSha = sha256(tokenizerBytes)
  if (tokenizerSha !== provenance.tokenizer.sha256 || tokenizerBytes.length !== provenance.tokenizer.bytes) {
    throw new Error(`tokenizer sha256 expected ${provenance.tokenizer.sha256}, got ${tokenizerSha}; bytes expected ${provenance.tokenizer.bytes}, got ${tokenizerBytes.length}`)
  }
  const tokenizer = await AutoTokenizer.from_pretrained('Xenova/distilgpt2', { local_files_only: true })
  const encoded = await tokenizer(DEFAULT_SENTENCE, { add_special_tokens: false })
  const ids = Array.from(encoded.input_ids.data, Number)
  if (JSON.stringify(ids) !== JSON.stringify(EXPECTED_IDS)) throw new Error(`unexpected sentence ids: ${JSON.stringify(ids)}`)
  await line(`sha256 ${tokenizerSha} · ids ${JSON.stringify(ids)}`)

  step = 4; phase = 'the pass'
  const run = await runPass({ Tensor: PassTensor, run: (feeds) => session.run(feeds) }, tokenizer, ids)
  await line(`n ${run.n} · ids ${JSON.stringify(run.ids)} · tokens ${JSON.stringify(run.tokens)} · ‖residual‖ ${normRange(run)}`)

  step = 5; phase = 'the names'
  const ranked = Array.from({ length: run.vocab }, (_, id) => id)
    .sort((a, b) => run.lastLogits[b] - run.lastLogits[a])
  const tokenNames = Object.fromEntries([...new Set([
    ...ranked.slice(0, 64), ...run.candidates.map((candidate) => candidate.id),
  ])].map((id) => [id, displayToken(tokenizer, id)]))
  // ASSUMES: F's largest landing (8 bars) and unfiltered argmax have baked names.
  // Validate after the pass, before writing; the company has no tokenizer fallback.
  if (ranked.slice(0, 8).some((id) => !Object.hasOwn(tokenNames, id))) throw new Error('the landing is missing token names')
  // chooseNext's greedy branch returns candidates[0] unchanged. topCandidates
  // has already skipped whitespace and the end mark; no penalty or draw applies.
  const top = run.candidates[0]
  const nextToken = top?.token ?? null
  const decode = 'greedy'
  let total = 0
  const max = run.lastNorm.max
  for (const value of run.lastLogits) total += Math.exp(value - max)
  const landing = ranked.slice(0, 8).map((id) => `${JSON.stringify(tokenNames[id])} ${Math.exp(run.lastLogits[id] - max) / total}`)
  await line(`top 8 ${landing.join(' · ')} · nextToken ${JSON.stringify(nextToken)} · decode ${decode} · all top 8 names present`)

  step = 6; phase = 'the file'
  const runtime = JSON.parse(await readFile(require.resolve('onnxruntime-node/package.json'), 'utf8')).version
  const { url, sha256: modelHash, bytes: modelLength, tokenizer: tokenizerProvenance } = provenance
  const packet = {
    provenance: {
      bakedAt: new Date().toISOString().slice(0, 10),
      sentence: DEFAULT_SENTENCE, ids: run.ids, tokens: run.tokens,
      model: { url, sha256: modelHash, bytes: modelLength },
      tokenizer: { url: tokenizerProvenance.url, sha256: tokenizerProvenance.sha256, bytes: tokenizerProvenance.bytes },
      runtime: `onnxruntime-node ${runtime} · cpu`, node: process.version,
    },
    run: {
      key: run.key, n: run.n, vocab: run.vocab, ids: run.ids, tokens: run.tokens,
      candidates: run.candidates, embeddings: run.embeddings, k: run.k, v: run.v,
      lastNorm: run.lastNorm, attention: run.attention.map(base64),
      residuals: run.residuals.map(base64), lastLogits: base64(run.lastLogits),
    },
    tokenNames, nextToken, decode,
  }
  const json = `${JSON.stringify(packet)}\n`
  await writeFile(resolve(ROOT, 'src/content/passFacts.json'), json)
  await line(`src/content/passFacts.json · ${Buffer.byteLength(json)} bytes · gzip ${gzipSync(json).length} bytes`)

  // A separate, small packet for the static figures. The pass packet above
  // and its writes are unchanged; neither figure imports that large packet.
  phase = 'the figures'
  const file = JSON.parse(await readFile(resolve(ROOT, 'src/content/fileFacts.json'), 'utf8'))
  const heroIndex = 4
  const hero = { index: heroIndex, token: run.tokens[heroIndex], id: run.ids[heroIndex] }
  if (hero.id !== 340) throw new Error(`unexpected hero id: ${hero.id}`)
  const tensorFacts = (name) => {
    const tensor = file.manifest.tensors.find((t) => t.name === name)
    const stem = name.replace(/_quantized$/, '')
    const scalar = (suffix) => file.manifest.tensors.find((t) => t.name === `${stem}_${suffix}`).value
    const { row0, col0, rows, cols, base64 } = file.windows[name]
    return {
      rows: tensor.dims[0], cols: tensor.dims[1], dtype: tensor.dtype,
      scale: scalar('scale'), zeroPoint: scalar('zero_point'), bytes: tensor.byteLength,
      window: { row0, col0, rows, cols, base64 },
    }
  }
  const wte = tensorFacts('transformer.wte.weight_quantized')
  const byteWindow = Buffer.from(wte.window.base64, 'base64')
  const rowOffset = (hero.id - wte.window.row0) * wte.window.cols
  wte.heroRowFirst6Bytes = Array.from(byteWindow.subarray(rowOffset, rowOffset + run.embeddings[heroIndex].length))
  wte.heroRowFirst6 = wte.heroRowFirst6Bytes.map((q) => (q - wte.zeroPoint) * wte.scale)
  if (wte.heroRowFirst6.some((v, i) => Math.abs(v - packet.run.embeddings[heroIndex][i]) > 1e-6)) {
    throw new Error('the word-table bytes do not agree with the pass embedding')
  }
  const heroRow = (stop) => stop.subarray(heroIndex * REAL_HIDDEN, (heroIndex + 1) * REAL_HIDDEN)
  const length = (row) => Math.sqrt(row.reduce((sum, v) => sum + v * v, 0))
  const wallName = 'transformer.h.0.attn.c_attn.weight_quantized'
  const readRack = async (input) => {
    const outputs = await session.run(feedFor(PassTensor, input))
    const rack = {}
    for (const [short, suffix] of [['k', 'key'], ['v', 'value']]) {
      const tensor = outputs[`present.${KV_LAYER}.${suffix}`]
      const [batch, heads, positions, width] = tensor.dims
      if (batch !== 1 || positions !== input.length || heads * width !== REAL_HIDDEN) {
        throw new Error(`unexpected rack shape: ${tensor.dims}`)
      }
      const data = await tensorData(tensor)
      // [batch, head, position, dimension] → one full-width row per position.
      rack[short] = Array.from({ length: positions }, (_, i) =>
        Array.from({ length: heads * width }, (_, d) =>
          data[(Math.floor(d / width) * positions + i) * width + d % width]))
      rack.headWidth = width
    }
    for (const tensor of Object.values(outputs)) tensor.dispose?.()
    return rack
  }
  const after = await readRack(ids)
  const before = await readRack(ids.slice(0, -1))
  const moved = { k: [], v: [], max: 0, maxAbsValue: 0 }
  // ASSUMES: causal masking prevents semantic reads of later tokens, but this
  // export dynamically quantizes whole-sequence activations. A longer prefix
  // may change rounding in old rows; measure all heads, never assume zero drift.
  for (const role of ['k', 'v']) {
    moved[role] = before[role].map((row, i) => compareRows(row, after[role][i]))
    moved.max = Math.max(moved.max, ...moved[role])
    for (let i = 0; i < before[role].length; i++) {
      for (const row of [before[role][i], after[role][i]]) {
        for (const v of row) moved.maxAbsValue = Math.max(moved.maxAbsValue, Math.abs(v))
      }
    }
    if (run[role].some((row, i) => row.some((v, d) => v !== after[role][i][d]))) {
      throw new Error('the repeated full-width pass differs from the baked preview')
    }
  }
  const figFacts = {
    readAt: new Date().toISOString(), sentence: DEFAULT_SENTENCE, tokens: run.tokens, ids: run.ids,
    hero, wte,
    rim: { heroFirst6: Array.from(heroRow(run.residuals[0]).subarray(0, run.embeddings[heroIndex].length)), heroLength: length(heroRow(run.residuals[0])) },
    stream: { heroLengths: run.residuals.map((stop) => length(heroRow(stop))) },
    wall: { name: wallName, ...tensorFacts(wallName) },
    rack: {
      layer: KV_LAYER, head: 0, headWidth: after.headWidth, k: run.k, v: run.v,
      before: Object.fromEntries(['k', 'v'].map((role) => [role, before[role].map((row) => row.slice(0, run[role][0].length))])),
      moved,
    },
  }
  const figJson = `${JSON.stringify(figFacts)}\n`
  if (Buffer.byteLength(figJson) >= 16 * 1024) throw new Error('figFacts exceeds its 16 KB budget')
  await writeFile(resolve(ROOT, 'src/content/figFacts.json'), figJson)
  await line(`src/content/figFacts.json · ${Buffer.byteLength(figJson)} bytes · hero ${hero.id} verified · largest rack move ${moved.max} · values up to ${moved.maxAbsValue}`)
} catch (error) {
  await line(`STOP · ${error.message}`)
  process.exitCode = 1
} finally {
  clearInterval(heartbeat)
  if (session) await session.release()
}

// Kept pure so the node proof can exercise the actual comparison in isolation.
function compareRows(before, after) {
  if (before.length !== after.length || before.length === 0) throw new Error('rack row widths differ or are empty')
  let max = 0
  for (let d = 0; d < before.length; d++) {
    if (!Number.isFinite(before[d]) || !Number.isFinite(after[d])) throw new Error('non-finite rack value')
    max = Math.max(max, Math.abs(after[d] - before[d]))
  }
  return max
}
