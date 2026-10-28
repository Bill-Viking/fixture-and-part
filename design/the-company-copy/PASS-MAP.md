# PASS-MAP: how the live forward pass is produced and consumed
Read-only map. Worktree `company-look`, branch `the-company-copy`, read 2026-10-27. Paths are relative to the worktree; every `file:line` is from `grep -n`/`sed` on this checkout. "Not found" means grepped and absent. Two facts were measured outside the page and are marked MEASURED.

## A. PRODUCER (src/lib/realModel.js, workerHost.js, modelBytesWorker.js, onnxScan.js, fileBytes.js)

### A1. Runtime, backend, fetch
- Runtime: `@huggingface/transformers` (4.2.0 installed) is only the loader and tokenizer. The pass itself is a raw ONNX Runtime session run directly, on the main thread (App.jsx calls `realForward`; no page-owned Worker is involved in a pass; whether ORT-web uses internal threads was not examined).
```js
// src/lib/realModel.js:257-265
const { AutoTokenizer, AutoModelForCausalLM, Tensor } = transformers
const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID)
const model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
  dtype: MODEL_DTYPE, model_file_name: MODEL_FILE, device,
})
const session = model.sessions?.model
```
```js
// realModel.js:34 / 65 / 66 / 71 / 77
export const MODEL_ID = 'Xenova/distilgpt2'
const MODEL_FILE = 'decoder_model'
const MODEL_DTYPE = 'q8'
export const ONNX_FILE = 'decoder_model_quantized.onnx'
export const CACHE_KEY = 'fixture-and-part-distilgpt2-v3'
```
- Backend: WebGPU if an adapter exists, else WASM; a failed WebGPU build retries on WASM (realModel.js:185-198, 296-304).
```js
// realModel.js:187-190
if (typeof navigator !== 'undefined' && navigator.gpu) {
  const adapter = await navigator.gpu.requestAdapter()
  if (adapter) return 'webgpu'
```
- Loaded lazily: `export const loadTransformers = COMPANY ? undefined : () => import('@huggingface/transformers')` (company.js:5). In the company build `doLoad` is `if (COMPANY) return undefined` (realModel.js:287) and `loadModel` is `if (COMPANY) return Promise.resolve(null)` (realModel.js:316).
- Fetch: transformers.js asks the Hugging Face hub; the page patches `env.fetch` so the one file ending `ONNX_FILE` is streamed, then rewritten (realModel.js:210-254, `env.allowLocalModels = false` :290, `env.cacheKey = CACHE_KEY` :291). Rewrite = append a protobuf fragment declaring extra graph outputs (`withAttentionOutputs`, :159-164, `const FRAGMENT = graphOutputFragment(PROMOTED_OUTPUTS)` :148). The worker's fallback URL: workerHost.js:13-17 ``fallbackUrl: `https://huggingface.co/${MODEL_ID}/resolve/main/onnx/${ONNX_FILE}` ``.
```json
// src/content/fileFacts.json provenance (keys: provenance, manifest, histograms, windows, thumbnails, columnStats, rowLabels, litRow)
"url":"https://huggingface.co/Xenova/distilgpt2/resolve/main/onnx/decoder_model_quantized.onnx",
"sha256":"1d3ab4d7e08ca9b8ea9a42dda13a05b7ff0f1b0c9bdc4f6eba27e7f0ceff8431","bytes":83502375,"readAt":"2026-10-21",
"tokenizer":{"url":".../Xenova/distilgpt2/resolve/main/tokenizer.json","sha256":"cda20b8ca044949aa07ac4078420c80d1a57139d5f9f33700e46fb2d891e7c66","bytes":2107653}
```

### A2. What is gathered per pass
No `output_attentions` / `output_hidden_states` flag exists anywhere (not found; only the comment at realModel.js:17 says `output_attentions` has nothing to read). Instead the graph's own nodes are promoted to outputs:
```js
// realModel.js:82-104
const ATTENTION_OUTPUTS = Array.from({ length: REAL_LAYERS }, (_, layer) => `/transformer/h.${layer}/attn/Softmax_output_0`)
const EMBED_OUTPUT = '/transformer/wte/Gather_output_0'
const RESIDUAL_OUTPUTS = ['/transformer/Add_output_0', ...Array.from({ length: REAL_LAYERS }, (_, layer) => `/transformer/h.${layer}/Add_1_output_0`)]
const PROMOTED_OUTPUTS = [...ATTENTION_OUTPUTS, EMBED_OUTPUT, ...RESIDUAL_OUTPUTS]
```
Also read: `outputs.logits` (:533), ``outputs[`present.${KV_LAYER}.key`]`` / `.value` with `export const KV_LAYER = 0` (:112). Constants: `REAL_LAYERS = 6`, `REAL_HEADS = 12`, `REAL_HIDDEN = 768` (:35-37); `RESIDUAL_STOPS = RESIDUAL_OUTPUTS.length` = 7 (:107); `PREVIEW_DIMS = 6` (:110).
Inputs: `feedFor` (:488-503) builds `input_ids` and `attention_mask`, both int64 `[1, n]`; no position_ids, no past.
Attention layout is fixed by the indexing, `[1, 12, n, n]` row-major, read as `data[(h * n + q) * n + k]` (forwardMap.js:171, :496; realModel.js:854). Entries with k > q are never read by anything.

### A3. The pass object (the whole return of `realForward(ids)`, realModel.js:517-598)
```js
// realModel.js:574-592  (n = ids.length, vocab = logits.dims[2] = 50257)
lastRun = {
  key,                      // ids.join(',')
  ids: ids.slice(),
  tokens: ids.map((id) => displayToken(tokenizer, id)),
  n,
  vocab,
  candidates,               // topCandidates(tokenizer, lastRow, probs, CANDIDATE_COUNT)
  attention,                // 6 x Float32Array
  embeddings,               // previewRows(...)
  k,                        // previewRows(...) layer 0
  v,
  residuals,                // 7 x Float32Array
  lastLogits: new Float32Array(lastRow),
  lastNorm: normalizerOf(lastRow),
}
// n === 0 early return (realModel.js:524-529) has the same keys minus `vocab`, with lastLogits: null, lastNorm: null
```
| field | type / shape for N tokens |
|---|---|
| `key` | string, `ids.join(',')` |
| `ids` | plain `number[N]` |
| `tokens` | plain `string[N]`, printable pieces (`␣` = leading space, `⏎`, `⇥`; realModel.js:351-361) |
| `n`, `vocab` | numbers; `vocab` 50257 |
| `candidates` | plain array of `CANDIDATE_COUNT = 4` (toyModel.js:175) objects `{ id, token, score, weight, wins }` (realModel.js:431-458): `score` = raw logit, `weight` = softmax prob, whitespace-only pieces and 50256 skipped (`isSkippedToken` :426-429) |
| `attention` | plain array of 6 `Float32Array`, each length `12*N*N` (`new Float32Array(await tensorData(outputs[name]))`, :541-543) |
| `embeddings`, `k`, `v` | plain arrays of N arrays of 6 plain numbers (first 6 of 768; `previewRows`, :477-486). `k`,`v` = layer 0 cache |
| `residuals` | plain array of 7 `Float32Array`, each length `N*768` (full width), index 0 = `/transformer/Add_output_0` (wte+wpe), 1..6 = after block 0..5 |
| `lastLogits` | `Float32Array(50257)`, last position only; the other N-1 rows are not kept (comment :600-602: "does not keep the full [n x 50257] block") |
| `lastNorm` | `{ max, logSum }` (`normalizerOf`, :412-420); `p(id) = exp(logit - max - logSum)` |

### A4. Browser-only dependence a node script must replace
- `navigator.gpu` / backend pick (realModel.js:185-198); `caches.delete` (:279); `Response` + `env.fetch` patch (:210-254); `env.cacheKey` Cache-API bucket.
- Worker: workerHost.js:35 `new Worker(new URL('./modelBytesWorker.js', import.meta.url), { type: 'module' })`, `postMessage` (workerHost.js:69). It serves instrument E (file facts) and D (lens) only, never a pass; in company `ensureWorker` returns null (workerHost.js:33).
- `performance.now`: fileBytes.js:178, :282 (E's dev check only). `crypto.subtle` in modelBytesWorker.js digest (E only).
- `import.meta.env` is undefined in plain node. MEASURED (`node --input-type=module`): `import('./src/lib/company.js')` and `import('./src/lib/realModel.js')` both throw `TypeError Cannot read properties of undefined (reading 'VITE_COMPANY')`; `onnxScan.js` and `toyModel.js` import fine. `forwardMap.js` imports `realModel.js` and also has a top-level `if (import.meta.env.DEV)` (forwardMap.js:535), so it cannot be imported in plain node either. Only `onnxScan.js` + `pieceLabel.js` are already node-safe (scripts/read-model-file.mjs:42-55 imports exactly those).
- `PROMOTED_OUTPUTS`, `FRAGMENT`, `withAttentionOutputs`, `graphOutputFragment` are module-private (not exported); exports are MODEL_ID, ONNX_FILE, CACHE_KEY, DECODING, REAL_*, RESIDUAL_STOPS, PREVIEW_DIMS, KV_LAYER + functions.

### A5. package.json and node
- `@huggingface/transformers ^4.2.0` is a dependency (package.json:14). `"allowScripts": { "onnxruntime-node@1.24.3": true }` (package.json:25-27) is a top-level npm `allowScripts` field (install-script allowance), not `overrides` or `trustedDependencies`. `onnxruntime-node` 1.24.3 is a pinned dependency of transformers.js itself (its package.json: `"onnxruntime-node": "1.24.3"`), installed at node_modules/onnxruntime-node (darwin/arm64 `onnxruntime_binding.node` + `libonnxruntime.1.24.3.dylib` present).
- Same class in node: yes in principle. transformers.js `exports.node.import` -> `./dist/transformers.node.mjs`, whose default device list in node is `defaultDevices = ["cpu"]` (transformers.node.mjs:11570), i.e. onnxruntime-node CPU. `AutoModelForCausalLM.from_pretrained('Xenova/distilgpt2', { dtype:'q8', model_file_name:'decoder_model', device:'cpu' })` would use `env.cacheDir` (default node_modules/@huggingface/transformers/.cache).
- MEASURED: that cache already holds `Xenova/distilgpt2/onnx/decoder_model_quantized.onnx`, 83,502,666 bytes = published 83,502,375 + 291. `head -c 83502375` hashes to `1d3ab4d7...f8431` = fileFacts provenance sha. BUT its 291-byte tail names only the six `Softmax_output_0` outputs (the old fragment): it lacks `/transformer/wte/Gather_output_0` and the seven residual outputs, so the current `build()` check (realModel.js:267-272 "the model graph is missing outputs") would fail on it. A node baker must append the current 14-name fragment to the published bytes itself.
- MEASURED: node v26.7.0 here. Numerics are not guaranteed identical across backends: the graph is dynamically quantized and the page itself records scale drift with sequence length (App.jsx comment above `lensStale`, "about 2% of the vector's largest component"). Not measured: onnxruntime-node vs the browser's WASM/WebGPU values on the default sentence.

## B. CONSUMER: ForwardMap.jsx + src/lib/forwardMap.js + src/lib/tour.js

### B1. How F receives the pass
Held in App.jsx `const [realRun, setRealRun] = useState(null)` (:382), set by `realForward(sequenceIds).then((run) => setRealRun(run))` in an effect (:551-553). Handed to F as props (App.jsx:904-939):
```jsx
armed={isReal}
real={isReal && Boolean(ranKey)}
run={isReal && runReady ? realRun : null}
nextToken={ pick?.token ?? candidates.find((c) => c.wins)?.token ?? null }
decode={isReal ? decode : 'greedy'}
```
with `const isReal = !COMPANY && mode === 'real' && modelStatus === 'ready'` (:414) and `const mode = COMPANY ? 'illustrative' : selectedMode` (:376). F also takes `sequence` (:906, = `[...baseTokens, ...generated]`, :424-427; in company `baseTokens` = `tokenize(text)`, the toy word splitter, :416-423) and `lensIndex` (hero; initial `Math.max(0, tokenize(DEFAULT_SENTENCE).length - 1)` = 7, :364-366).
F's gate: `const live = Boolean(real && run && run.n === n && n > 0)` (ForwardMap.jsx:1163). It checks only `run.n === n`, not `run.key` or the text. `const waiting = armed && !live && n > 0` (:1164).

### B2. Every pass field F reads, and what it draws
| pass field | read by (file:line) | draws |
|---|---|---|
| `run.n` | ForwardMap.jsx:1163 | live gate |
| `run.key` | :1148 `const runKey = run?.key ?? null`; the effect keyed `[n, runKey, stepTick]` closes the tour (:1788-1789) | tour reset only |
| `run.residuals[0..6]` (N*768 each) | `residualField` forwardMap.js:141-156 -> `normAt` L2 over 768 (:126-134) | stream width and light per token per stop (log law in `draw`, ForwardMap.jsx:1237-1255: `hw = hwMin + (hwMax - hwMin) * v`), the residual line, tour embed/fall captions |
| `run.residuals[s]` | `residualRow` forwardMap.js:434 -> `filamentField` :401-428 with `plan.group` = 12 for n<=12 (:382-386) | the filaments: `bins[i][s][fbin]` = mean `abs(v)` of each group of 12 dims (64 filaments); `rel` = bins / row max |
| `run.attention[l]` (12*N*N) | `blockHead` forwardMap.js:454-476 (loop `for (let k = 1; k < q; k++) total += data[base + k]`, q from `first = min(2, max(1, n-1))`) | the RULE head per block, `autoHeads[6]`, the label `HEAD ${live ? headFor(l) : '—'}` (ForwardMap.jsx:3126) |
| `run.attention[l]` | `blockTransfers(run, layer, hero, head)` forwardMap.js:490-512: ranks `{src:k, w:data[base+k]}` for k < q, `kept = ranked.filter((x) => x.w >= TRANSFER_FLOOR).slice(0, TRANSFER_MAX)`, plus `selfWeight = data[base+q]`, `best` | the curves (carrier width `(1.2 + 4.4 * tr.w) * (compact ? 1.6 : 1)`, ForwardMap.jsx:824), KEY callouts, "no transfer · self" plates, hero brightening below each absorption |
| `run.attention[l]` | `headOutwardShares` forwardMap.js:164-174: `out[h] = 1 - data[(h * n + q) * n + q]` | the twelve lit head squares of an open block (ForwardMap.jsx:3049-3066) and the tour's head line |
| `run.lastLogits` (50257) | `finalSplash(run, count)` forwardMap.js:216-250 (max-shifted softmax, top `count`, each `{ id, token: tokenText(id), p }`); `topOfFinalLogits` :192-198 (unfiltered argmax, `{ id, token: tokenText(best) }`) | the landing bars (`g.splashN = compact ? 6 : 8`, ForwardMap.jsx:227), blue argmax, the key line, tour bar stops |
| `tokenText(id)` | forwardMap.js:197, :246 -> realModel.js:372 `requireReady()` | token strings for the landing; throws `'the real model is not loaded'` (realModel.js:334-336) without a tokenizer |
NOT read by F: `run.ids` (dev only, ForwardMap.jsx:1457), `run.tokens`, `run.candidates`, `run.embeddings`, `run.k/v`, `run.vocab`, `run.lastNorm`. Walls do NOT come from the pass: `wallWindow(windows, wallTensor(l))` (forwardMap.js:293, :369) reads `fileFacts.json` `windows` (24 x 64 i8 of `transformer.h.${layer}.attn.c_attn.weight_quantized`), loaded by `import('../content/fileFacts.json')` (ForwardMap.jsx:1133).

### B3. The named drawings, with the code that makes them
- Legend: `SOLID CURVE — ONE HEAD CARRYING A SOURCE WORD’S VALUE INTO THE HERO · WIDTH = ITS SHARE OF ATTENTION · AT MOST TWO PER BLOCK, UNDER ${TRANSFER_FLOOR} NOT DRAWN ·` (ForwardMap.jsx:433-435; `TRANSFER_FLOOR = 0.15` forwardMap.js:478, `TRANSFER_MAX = 2`).
- KEY label with per-head weight (ForwardMap.jsx:1540-1541), drawn as two lines:
```js
const label = `${sequence[tr.src]} · ${tr.w.toFixed(4)}`
const key = `KEY · B${tr.layer} H${tr.head}`
```
  The token text comes from the `sequence` prop, not from the pass. In company that is the toy word, e.g. `down`, not `␣down`.
- RULE head: `heads = autoHeads.map(...)`, label `BLOCK ${l}` / `HEAD ${live ? headFor(l) : '—'}` (:3126); `headFor` :1197 = open-block `headPick` else `autoHeads[l] ?? 0`.
- Residual line (ForwardMap.jsx:1501): `` `real pass · ‖residual‖ ${field.lo.toFixed(1)} → ${field.hi.toFixed(1)} · ${plan.count} filaments × ${plan.group} dims` `` (lo/hi = min/max of the N x 7 norms). Shown at :2801 `<span className="map-ctl-note">{note()}</span>`.
- Landing: title `` `LAST POSITION → 50,257 WORDS · TOP ${g.splashN}` `` (:3501); bars `h = 16 + g.barMaxH * (candidate.p / max)`, `argmax: finalTop != null && candidate.id === finalTop.id`, `pick: nextToken != null && candidate.token === nextToken` (:1410-1424); key line `` ` ${finalTop.token} BLUE — THE MACHINE’S OWN TOP · ` `` then `` ` AMBER MARK — GREEDY TOOK ${nextToken ?? '—'}` `` or `` ` AMBER MARK — THE SAMPLER TOOK ${nextToken ?? '—'}` `` (:3646-3650). The amber mark exists only on a bar inside the top N.
- Stepper: `` `STOP ${stageIndex + 1}/${stages.length} · ${stop.kind.toUpperCase()}` `` (:2855); idle `` `${stages.length} STOPS · ${runLength(...)}` `` (:2856). Stop counts (tour.js:270-277 comment): 35 live above 640 px, 33 at or below, 19 with no pass.
- `nextToken` and `decode` in company: `pick` is null when not real (App.jsx:698-703); `candidates` is then `toyCandidates` (:686, :710), so `nextToken` today = the first toy candidate with `wins`; `decode` is pinned `'greedy'` (:935). Live `decode` default is `useState('sampled')` (:390); `DECODING = { temperature: 0.8, topK: 40, repetitionPenalty: 1.3, seed: 7 }` (realModel.js:54-59).

### B4. Every place COMPANY or the absence of a pass changes a string or branch
ForwardMap.jsx (strings quoted exactly):
| line | string / branch |
|---|---|
| 1163 | `live` false without `real && run && run.n === n` -> filaments from the stand-in: `filamentField((i, s) => residualVector(sequence[i], s, REAL_HIDDEN), n, plan.group)` (:1177-1187), `field`/`registers`/`splash`/`finalTop`/`autoHeads`/`heads` all `null` (:1166-1218), every stream width/light t-value = `0.42` (:1244) |
| 1497-1501 | `'no input — type something into instrument A'` / `'running distilgpt2…'` / `'illustrative — the walls are real, the fall is a schematic'` (when `!armed`) / `'the walls are real — the fall is waiting on a pass'` / the `real pass · ‖residual‖` line |
| 2541-2544 | `fall` no-pass: `One stream a token, falling through all six walls. No pass has run, so every stream is drawn at one width and one light: nothing here claims a magnitude. The grain inside a stream is the deterministic stand-in instrument D prints, ...` |
| 2559-2562 | `transfers` no-pass: `There is no attention to draw without a pass, so no carriers are drawn. With a model in hand each block would read the hero’s own row: green tick = the key that matched, amber carrier = the weight.` (compact, COMPANY); wide form `There is no attention until a pass has run, so no carrier is drawn here. With the real model in hand, ...` (not COMPANY-gated) |
| 2601-2604 | `landing` no-pass: COMPANY compact `The last position’s vector against all 50,257 words. It needs a pass, which this copy does not run.`; COMPANY wide `Where the last position’s vector meets all 50,257 words. There is no distribution without a pass, so no bar is drawn; with a model in hand the bars would be this sentence’s own softmax, top ${g.splashN}.` |
| 2659-2665 | `fine` live: `... · one pass on the sentence above, run in this browser · nothing in the picture is a stand-in: ...`; no-pass: `... · the walls are the real file in every mode; the fall, the transfers and the landing wait on a pass. ...` |
| 2717-2719 | LoadNote label: `armed ? architectureNote(manifest) : (COMPANY ? 'the walls are real — the fall is a schematic in this copy' : 'the walls are real in both modes — the fall needs the model')` |
| 2763 | `<InfoTag topic={armed ? 'mapReal' : 'map'} />` |
| 3126 | `HEAD ${live ? headFor(l) : '—'}` |
| 3609-3612 | `waiting ? 'the landing is waiting on this pass' : (COMPANY ? 'the landing needs a pass — this copy runs none' : 'the landing needs the real model — load it above')` |
| 3647-3655 | key line live vs `'BLUE — THE MACHINE’S OWN TOP · AMBER MARK — WHAT GREEDY TAKES'` / `... THE SAMPLER’S PICK` |
| 3807-3808 | `TeachPair show={armed ? 'b' : 'a'}`; a: `the six walls are real in this mode too: ... what is not real is the fall — no model is running, ... ${COMPANY ? "with a model in hand the same drawing would fill with this sentence's own numbers." : ...}`; b: `one drawing, five readings, all of them real. ...` |

src/lib/tour.js (branches on `live`; `stages.push(stage(kind, ms, lead, detail, reveal))`):
| line | live branch | no-pass branch |
|---|---|---|
| 353-370 `embed` | `Each piece becomes 768 numbers — ... at the rim the hero’s are ${n2(field.rows[hero][0])} long.` | `... No pass has run, so the drawing has no length to draw: ... ` + `(COMPANY ? `With a model in hand these would be this sentence’s own numbers.` : ...)` (:367) |
| 385-405 `fall`/`head` | `The streams fall through block ${l}, and the hero’s vector leaves it ${n2(after)} long, ${dir} ${n2(before)}.` / `Block ${l} is read from head ${head} of ${REAL_HEADS}, where the hero spends ${share...} of its attention on something other than itself.` | `The streams fall through block ${l}.` / `Attention needs a pass, so no head is chosen here yet.` (:400) |
| 415-430 `nopass` (l === 0 only) | `silent` / `transfer` stops: `Block ${l}, head ${head} — ${q(sequence[source.src])} hands the hero ${w4(source.w)} of its value.` / `And ... hands it ${w4(source.w)} as well.` | `There is no attention to draw without a pass, so no carrier is drawn anywhere on this sheet.` + `(COMPANY ? `With a model in hand this same tour would speak this sentence’s own weights.` : ...)` (:424) |
| 489-500 `noland` / 502-522 `bar` | `The landing, counted one word at a time. The tallest of all 50,257 is ${q(candidate.token)} at ${pc(candidate.p)}...` then `${q(candidate.token)} at ${pc(candidate.p)}.` per bar | `There is no distribution without a pass, so no bar is drawn.` (:494) |
| 528-551 `pick` | only `if (live && splash)`: `Greedy decoding took ${q(nextToken ?? '—')}${at_} — the top word every time, whitespace skipped.` or `The sampler took ...`; `picked = splash.find((s) => s.token === nextToken)` | stop absent |
| 553-567 `done` | `That is one pass: the file frozen, one sentence moving through it, one next word.` / `Nothing above ran twice ... Press play to run it again, step back through it, or click anything ...` | `That is the shape of one pass, with the walls real and the fall a schematic.` / `(COMPANY ? `With a model in hand the same tour would speak this sentence’s own numbers at every stop.` : ...)` (:563) |
Live strings that would be untrue in a baked copy: ForwardMap.jsx `fine` ("run in this browser"), tour.js:560 ("Press play to run it again" is fine as a tour replay, but "Nothing above ran twice" and "run in this browser" are claims about a live run).
Other COMPANY sites (not F): ModeControl.jsx:33-45 (`no model in this copy`), LoadNote.jsx:30-32, App.jsx:130 (`unloadedCompany`), App.jsx:404, :489, :501 (guards), essay.js:214, explainers.js:69, FileView.jsx:556, :1423, :1568, :1737 (`window ${page + 1} of ${count(pages)} — fixed in this copy`), workerHost.js:13/33/69, realModel.js:287/316.

## C. OTHER CONSUMERS of the same pass object (App.jsx props; all gated by `isReal`, false in company)
| consumer | fed by | pass fields read | note for a baked pass |
|---|---|---|---|
| A `Tokenizer.jsx` | `realIds={isReal ? realBase?.ids : null}` (App.jsx:842); `realEmbedding(id)` -> `embeddingCache` filled in `realForward` (realModel.js:572) | ids; `embeddings[i]` (first 6 dims) | no tokenizer in company; could be fed from baked `ids` + `embeddings` |
| B `Stepper.jsx` + `KVInspector.jsx` | `candidates` (App.jsx:705-710), `pick = chooseNext(realRun, sequenceIds, decode, generated.length)` (:698-703), `vectors={isReal && runReady ? realRun : null}` (:871) | `candidates[{id,token,score,weight,wins}]`; `chooseNext` needs `lastLogits` + `lastNorm` + a tokenizer for sampled mode (realModel.js:780-824); KVInspector reads `vectors.embeddings[i]`, `vectors[role][i]` (role `k`/`v`), `vectors.ids` (KVInspector.jsx:50-51, 87) | STEP calls `realForward` on the longer sequence (App.jsx:551 effect): stays off |
| C `AttentionInspector.jsx` | `realRows = attentionRows(realRun, layer, head, safeQuery)` (App.jsx:813-815), `realIds={... realRun.ids}` (:892) | `attention[layer][(h*n+q)*n+i]`, `tokens`, `ids`, `n` (realModel.js:849-877) | could be fed from `attention` + `tokens` + `ids` |
| D `GlassPass.jsx` | `run` (App.jsx:953), `reading` from the lens worker | `residualPreview(run, stop, lensIndex)` = first 6 dims of `residuals[stop]` (realModel.js:630-642; GlassPass.jsx:105-108); lens rows from `readLens(residualStops(realRun, index), ...)` (App.jsx:603-640; logitLens.js:36), which needs the 83 MB file in the worker | residual column could be fed; the lens cannot (needs the file) |
| E `FileView.jsx` | `text`, `ranKey` (App.jsx:825-) | no pass fields; reads fileFacts.json | n/a |
| F `ForwardMap.jsx` | see B | see B | the target |
| `src/figures/*` | `HarnessReadout.jsx:1` imports `harnessFacts.json`; `LoopFigure.jsx` | none | none |
| `src/lib/logitLens.js` | `residualStops(run, index)` packs 7 x 768 floats (realModel.js:644-657) | full-width `residuals` | needs the file: off |

## D. THE SENTENCE
- Defined: `export const DEFAULT_SENTENCE = 'The engine roared and it shut down.'` (src/lib/toyModel.js:5); `DEFAULT_TOKENS = tokenize(DEFAULT_SENTENCE)` (:33). Imported at App.jsx:15.
- Typed sentence held: `const [text, setText] = useState(DEFAULT_SENTENCE)` (App.jsx:352); `textRef` mirrors it (:411).
- Real tokenization: transformers.js `AutoTokenizer.from_pretrained('Xenova/distilgpt2')` (realModel.js:258), called in `realTokenize` (:363-369): `tokenizer(text, { add_special_tokens: false })`, `ids = Array.from(encoded.input_ids.data, Number)`. Pieces: `displayToken(tokenizer, id)` = `tokenizer.decode([id])` with a leading space shown as `␣`, `\n` as `⏎`, `\t` as `⇥` (:351-361). App holds it as `realBase = { ids, tokens, text }`, debounced 120 ms (App.jsx:526-536).
- Company: no tokenizer (`doLoad` returns early, realModel.js:287). Pieces on the sheet come from the toy splitter `const TOKEN_RE = /[A-Za-z0-9]+(?:['’][A-Za-z]+)?|[^\sA-Za-z0-9]/g` (toyModel.js:26-31): `The, engine, roared, and, it, shut, down, .` (no `␣`).
- MEASURED (script outside the repo, `@huggingface/tokenizers` over the cached `tokenizer.json`, whose sha256 `cda20b8c...7c66` equals `fileFacts.provenance.tokenizer.sha256`): the sentence is 8 tokens, not 9:
```json
{"ids":[464,3113,45615,290,340,4423,866,13],"tokens":["The","Ġengine","Ġroared","Ġand","Ġit","Ġshut","Ġdown","."]}
```
  Displayed pieces: `The`, `␣engine`, `␣roared`, `␣and`, `␣it`, `␣shut`, `␣down`, `.` (`FOLLOWED_PIECE = 'Ġit'` at index 4, scripts/read-model-file.mjs:77, agrees).
- The pass object carries both: `ids` and `tokens` (A3). A baked pass must carry them too, because F gets its labels from the `sequence` prop and the landing/argmax tokens from `tokenText`, which needs a tokenizer.

## E. SIZE (N = 8; the brief's 9 would add ~6.8%: 104,635 floats)
Counts of what `realForward` keeps (98,017 floats):
```
attention   6 x 12 x 8 x 8     =   4,608
residuals   7 x 8 x 768        =  43,008
lastLogits  50,257             =  50,257
embeddings+k+v  3 x 8 x 6      =     144
```
Sizes (estimates, not measured on a produced file): raw float32 = 392,068 B (383 KB); base64 = ~523 KB; JSON text at shortest-float32 (~12 B/number incl. comma) = ~1.18 MB; naive `JSON.stringify` of Float32 values read as doubles (~19 B/number) = ~1.9 MB. The never-kept full logits would be 8 x 50,257 = 402,056 floats.
What F needs (and nothing more), N = 8:
```
residual norms          8 x 7            =     56   (F: field.rows -> stream width/light, lo/hi, tour)
filament bins           8 x 7 x 64       =  3,584   (mean|v| per 12 dims; `rel` is bins / row max, derived)
attention, all heads    lower triangle incl. diagonal, 6 x 12 x 36 = 2,592  (full 4,608 if kept as laid out)
landing                 top 8 x {id, token, p} + argmax {id, token}  ~ 30
picks                   greedy and sampled token (+p)  ~ 4
tokens + ids            8 + 8
```
= ~6.3K numbers lower-triangle (~8.3K with full attention): ~50-66 KB JSON at ~8 B/number (5-6 significant digits), against ~1.18 MB.
Which big fields can shrink without changing what F draws:
- `lastLogits` (51 % of all floats): F reads only the top `splashN` bars and the unfiltered argmax. Store `p` for the top 8 computed at bake time from the full softmax in float64 (`splash[0].id` is always the argmax: both are unfiltered, same order). Needed in full only by `chooseNext` sampled mode (Stepper B, off in company).
- `residuals` (44 %): F reads only L2 norms (stream width/light, residual line, tour numbers) and group means of `abs(v)` (filaments, `plan.group = 12` for n <= 12, i.e. 64 x 12). The wall windows are not pass data (`fileFacts.json` `windows`). The 64 x 12 filament plan holds only while n <= 12 (forwardMap.js:382-386); a different n would need other groupings, which is moot for a fixed 8-token sentence.
- Full 768-vectors are needed by: nothing in F at n = 8 beyond norms and the 64 bins; D's `residualPreview` (first 6 dims x 7 stops x N = 336 numbers) if D is ever fed; the lens (`residualStops`, 7 x 768 per position) which needs the model file; and dev-only `__mapState` (published at ForwardMap.jsx:1444) and `__mapCheck` (forwardMap.js:535), both dropped in production builds.
- `attention`: F reads k <= q only. For ANY hero click and ANY HEAD chip (`headPick`, ForwardMap.jsx:2766-2785) the full lower triangle of all 72 heads is needed (`blockHead` reads every head's rows; `blockTransfers` and `headOutwardShares` read the hero's row for the chosen head). If the lane freezes hero = last token and head = rule, it needs only `autoHeads[6]`, the hero row (<= 8 values) of that head per block, and the hero's diagonal for the 12 heads of each block = ~120 numbers.
- Precision: weights print with `toFixed(4)` and compare to 0.15 raw (`x.w >= TRANSFER_FLOOR`, forwardMap.js:500), so keep >= 6 decimals for attention; norms print with `toFixed(1/2)`; bins and `p` need ~5 significant digits.

## F. EXISTING PATHS
- Recorded-pass / replay path: not found. grep of `src/` and `scripts/` for `recorded`, `replay`, `precomput`, `passFacts`, `baked`, `snapshot` finds only comments (realModel.js:52, 713 "replay" of the seeded draw; tour.js:4 "replay itself"; ForwardMap.jsx:2622). No JSON holds a pass.
- JSON imports: `fileFacts.json` (232,457 B; lazy: ForwardMap.jsx:1133, FileView.jsx:568, fileBytes.js:179; its `provenance` is also read at config time, vite.config.js:23-25 -> `__FILE_PROVENANCE__`, App.jsx:98) and `harnessFacts.json` (static import, HarnessReadout.jsx:1).
- Build-time node precedents: `scripts/read-model-file.mjs` (reads the onnx bytes, sha-checked against `EXPECTED_SHA`, writes `src/content/fileFacts.json`; flags `--file`, `--out`, `--tokenizer`, `--allow-new-sha`; imports only `onnxScan.js` + `pieceLabel.js`; `getBytes()` :90-100 uses `fetch(URL)` or a local file) and `scripts/read-harness.mjs` (-> `src/content/harnessFacts.json`; npm script `facts:harness`).
- `toyModel.js` (615 lines; header: "Phase 1 heuristics. No ML, no network, no dependencies. Every number produced here is illustrative"): yes, it is the deterministic stand-in the company copy draws now as the straight sheet. For F's grain: `residualVector(token, stop, dims)` (toyModel.js:94-97) = `hashTokenToVector(token, dims, saltBase)` (:74-82), an FNV-1a `hashString(str, salt)` (:46-62) per dimension mapped into [-2, 2], one salt base per depth (`RESIDUAL_SALT = 192`, `+ (stop - 1) * 8`), keyed by the token STRING. F calls it with `dims = REAL_HIDDEN` (ForwardMap.jsx:1183, `residualVector(sequence[i], s, REAL_HIDDEN)`), then bins it like a real vector. Stream widths are one value (`row.push(0.42)`, ForwardMap.jsx:1244).
- Stand-in vs real branch, in code: App.jsx:414 `isReal` (false whenever `COMPANY`); F: `live = Boolean(real && run && run.n === n && n > 0)` (ForwardMap.jsx:1163) selects `filamentField(residualRow)` vs `filamentField(residualVector)` (:1177-1187). Instruments A-D use `mode`/`real` the same way: toy tokenizer, `toyCandidates`, `attention(tokens, queryIndex)` (toyModel.js:436), `illustrativeLens`.

## G. MINIMAL BAKED PASS
1. `key` `"464,3113,45615,290,340,4423,866,13"`, `n: 8`, `ids: number[8]`, `tokens: string[8]` (the `␣`-spelled pieces, from `displayToken`); F takes labels from the `sequence` prop, so pass `tokens` there too.
2. `norms: number[8][7]` (L2 of residual row i at stop s): replaces `residualField` (lo/hi derive); `bins: number[8][7][64]` (mean abs per 12 dims): replaces `filamentField`'s `bins`, `rel` = bins / row max.
3. `attention: number[6][12][8][8]` (or lower triangle): `data[(h*n+q)*n+k]`, >= 6 decimals; feeds `blockHead`, `blockTransfers`, `headOutwardShares` unchanged if given as 6 `Float32Array(12*8*8)`.
4. `splash: [{id, token, p} x 8]` (p from the full 50,257 softmax, descending) and `finalTop: {id, token}` (= `splash[0]`); `finalSplash` reads `tokenText`, which throws in company, so F's memos (ForwardMap.jsx:1214-1218) or forwardMap.js:197/:246 need a baked short-circuit.
5. `nextToken` for the decode F is given: greedy = first non-whitespace non-`<|endoftext|>` candidate (App.jsx passes `'greedy'` in company), sampled = `chooseNext(..., 'sampled', 0)` with `DECODING` seed 7 step 0. It draws only if that token is among the 8 bars.
6. Not needed for F: `residuals` full vectors, `lastLogits` full row, `candidates`, `embeddings`, `k`, `v`, `lastNorm` (needed only by B/A/D, which stay off).
7. Gate: F's live test is only `run.n === n` (ForwardMap.jsx:1163), and the toy splitter also yields 8 tokens for any 8-word text, so the substitution must test the text, as planned: `COMPANY && text === DEFAULT_SENTENCE`.
8. Cleanest entry: App.jsx:904-939, the `<ForwardMap>` props. Compute `const baked = COMPANY && text === DEFAULT_SENTENCE ? BAKED_PASS : null` beside `wordTokens` (App.jsx:416) and pass `armed={isReal || !!baked}`, `real={(isReal && Boolean(ranKey)) || !!baked}`, `run={isReal && runReady ? realRun : baked}`, `sequence={baked ? baked.tokens : sequence}`, `nextToken={baked ? baked.nextToken : (existing expression)}`. Why here: these four props (:923-931) are the only inputs `live`, `waiting`, the note, the tour and the landing branch on; `isReal` (:414) stays false, so A-E, the mode bar and FileView keep their company strings and no tokenizer/worker is touched.
9. Second seam (inside F's data, not App): `tokenText` (realModel.js:372-375, `requireReady()` at :334) must not be reached; read `run.splash` / `run.finalTop` in ForwardMap.jsx:1214-1218 when present.
10. Node baker: cannot import realModel.js/forwardMap.js/company.js (`import.meta.env`, measured); re-implement the reductions (norm, mean-abs, softmax top-8) or run under Vite; append the 14-name fragment to the published bytes (the cached node_modules copy has the old 6-name tail); keep `bytes: 83502375` / sha `1d3ab4d7...f8431` and the tokenizer sha in the baked file's own provenance block, as `fileFacts.json` does.
11. Strings that become untrue once F is live in company: ForwardMap.jsx:2659-2665 `fine` ("run in this browser"), the `armed`-gated LoadNote label, TeachPair `b` and InfoTag `mapReal` (:2717-2719, :2763, :3807), tour.js:557-563 ("Press play to run it again").
12. Numerics: a node/CPU pass may differ in low digits from a browser WASM/WebGPU pass (dynamic quantization, see A5); the baked values are "the real pass on onnxruntime-node", not byte-identical to a reader's live run.
