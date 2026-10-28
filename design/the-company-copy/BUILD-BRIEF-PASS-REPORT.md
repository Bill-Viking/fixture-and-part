# BUILD BRIEF PASS — the company copy

Result: the company default sentence now supplies F with a real CPU pass through the existing drawing code. Other sentences retain the straight sheet. The consumer carries no passFacts chunk. All edits are uncommitted.

Worktree: `/Users/bill/Projects/fixture-and-part/.claude/worktrees/company-look`  
Branch: `the-company-copy` · HEAD: `1217f26b6da779a87b855c3c37d061ae5e24049b`  
Builder: Sol, headless · recorded UTC day: 2026-10-28 · Node v26.7.0.

## Decisions

- PASS-MAP A1: “The pass itself is a raw ONNX Runtime session run directly”; the baker uses onnxruntime-node 1.24.3 on CPU and transformers only for tokenization.
- PASS-MAP A5: “published 83,502,375 + 291”; hash the published prefix and append the current 14-name fragment without writing the cache.
- PASS-MAP B2: “stream width and light per token per stop” come from residuals, and “the landing bars” come from lastLogits; ship whole Float32 arrays so F performs its existing reductions.
- PASS-MAP D: “Displayed pieces: `The`, `␣engine`, `␣roared`, `␣and`, `␣it`, `␣shut`, `␣down`, `.`”; those pieces are F's sequence labels.
- PASS-MAP G.7: “the substitution must test the text”; the gate is the exact DEFAULT_SENTENCE, not token count.
- PASS-MAP B4/G.11 identifies “run in this browser”; all existing wording is preserved and inventoried below for the lane's words ruling.
- `passCore.js` moves the producer verbatim; a `{ Tensor, run }` session adapter keeps `feedFor` unchanged across runtimes.
- `realModel.js` keeps serialization, the one-entry memo and embedding-cache writes, and re-exports every former export.
- `bakedPass.js` exports only `loadBakedPass`; its COMPANY constant repeats company.js's exact compile-time expression locally. With an imported flag Vite removed the consumer reference but emitted an orphan JSON chunk. The local gate removes that chunk before discovery; both final builds verify this.
- App loads once into state, catches/logs one rejection, and ignores completion after effect cleanup; the promise ref also handles development effect replay.
- Only F's five specified props change; `isReal`, `decode`, lens initialization, A–E and the mode bar keep their existing behavior.
- `chooseNext`'s greedy branch takes `run.candidates[0]` unchanged, not a new penalty or sampling rule. Shared `topCandidates` already skips whitespace-only pieces and id 50256.
- The top-eight name-coverage assertion runs after the pass in the names step, before writing; the names do not exist during graph creation (the brief's “step 2.5”).
- No user-visible string was edited. No browser, GUI, network, commit, push, branch change, permission change, STATUS, OPENER, WORDS, brief, index.html, company.css, main.jsx or vite.config.js write occurred.

## Real-case bake

`node scripts/bake-pass.mjs` exited 0 twice; each subprocess had a 600 s limit. Each bake runs one pass. The second file is byte-identical, including bakedAt (same UTC day).

```text
1 of 6 · the published bytes · 83502375 bytes · sha256 1d3ab4d7e08ca9b8ea9a42dda13a05b7ff0f1b0c9bdc4f6eba27e7f0ceff8431
2 of 6 · the graph · 14 promoted outputs · logits · present.0.key · present.0.value · cpu
3 of 6 · the tokenizer · sha256 cda20b8ca044949aa07ac4078420c80d1a57139d5f9f33700e46fb2d891e7c66 · ids [464,3113,45615,290,340,4423,866,13]
4 of 6 · the pass · n 8 · ids [464,3113,45615,290,340,4423,866,13] · tokens ["The","␣engine","␣roared","␣and","␣it","␣shut","␣down","."] · ‖residual‖ 5.0 → 1816.7
5 of 6 · the names · top 8 "⏎" 0.3149584611434227 · "␣The" 0.14010734374860398 · "␣It" 0.07171751146390971 · "<|endoftext|>" 0.025581227725666345 · "␣He" 0.022054415764321125 · "␣A" 0.01885004238814804 · "␣But" 0.015258243264195672 · "␣Then" 0.013121804667761293 · nextToken "␣The" · decode greedy · all top 8 names present
6 of 6 · the file · src/content/passFacts.json · 527411 bytes · gzip 361727 bytes
```

`gzip -c < src/content/passFacts.json | wc -c`: **361727**, exit 0. A separate file-argument invocation (`gzip -c src/content/passFacts.json`) measured 361742 because it adds the filename header; the stdin form and baker agree.

Provenance carries only the UTC date, sentence, ids, tokens, the model/tokenizer URL/hash/length copied from fileFacts, runtime and Node version; no local path or user name. The model prefix still hashes correctly; the cached file remains 83502666 bytes with its old 291-byte tail.

The actual decoder was evaluated headlessly, with its JSON module supplied from disk: six Float32Array(768) attention fields, seven Float32Array(6144) residual fields and Float32Array(50257) logits round-trip byte-for-byte. Run keys equal the original run keys plus `tokenNames` and `baked`. Only `loadBakedPass` is exported.

The actual forwardMap helpers read the decoded run: top eight and argmax make zero calls to a throwing tokenizer fallback, and residualField prints `5.0 → 1816.7`. An independent evaluation of HEAD's original realForward and the new wrapper on the same real CPU session gives deepStrictEqual results, also equal to the decoded bake with its two extra fields removed. Former exports, memo identity, embedding-cache rows and the empty pass match. This is a Node/CPU equivalence proof, not a browser/backend comparison.

Node reference for the caller, hero index 7 (last token), from the existing drawing helpers:

| Block | Rule head | KEY token · weight |
|---|---:|---|
| 0 | 7 | ␣shut · 0.1662; ␣down · 0.1653 |
| 1 | 9 | ␣down · 0.2908; ␣shut · 0.2485 |
| 2 | 3 | ␣engine · 0.2362; ␣roared · 0.2206 |
| 3 | 8 | The · 0.6652 |
| 4 | 7 | The · 0.4788 |
| 5 | 8 | no transfer; self 0.5937; best other 0.1287 |

## Builds and counts

Every check printed the worktree's pwd, ran in the foreground, and had a 120 s subprocess limit except each bake (600 s). No check timed out.

| Check | Exit | Result |
|---|---:|---|
| Bake, first run | 0 | File written; numbers above |
| Bake, second run + idempotence assertion | 0 | Byte-identical |
| `npm run lint`, final | 0 | Only baseline `AttentionInspector.jsx:55:45` exhaustive-deps warning |
| `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co`, final | 0 | Company assets emitted |
| `npm run build -- --configLoader native`, final | 0 | Consumer assets emitted; no passFacts |
| Decode, drawing helpers, original/new realForward comparison, text-gate assertions | 0 | All assertions pass; Node emits its experimental VM-module warning |
| Required passCore import | 0 | Exports below; no browser/env read |
| Requested color-moved diff | 0 | Tracked side only; untracked-file limitation below |
| Supplemental combined-files color-moved diff | 1 | Expected diff-present status; moved blocks colored |
| Verbatim extraction assertions | 0 | Constants/helpers/pass body match HEAD |
| Old cached graph as-is | 1 | Expected missing-outputs STOP; wrapper assertion exit 0 |
| Entry counts, chunk absence, HTML link, scope and hashes | 0 | All required values pass |
| `grep -l bakedAt dist/assets/*` | 1 | Expected no matches; empty output |
| `git diff --check` | 0 | No whitespace errors |
| `git status --short` | 0 | Eight authorized files below |

Both builds report the normal >500 kB chunk-size warning; the mandated whole-array pass chunk is 527373 bytes. No warning limit was changed. The first consumer build exited 0 but failed the pass-chunk absence check; the local gate corrected it, and the final rebuild has no passFacts chunk.

| Entry substring | Company `index-aADI0xir.js` | Consumer `index-CdkDlCqv.js` |
|---|---:|---:|
| `Load it above` | 0 | 1 |
| `fixed in this copy` | 1 | 0 |
| `fonts.googleapis.com/css2` | 1 | 0 |
| `Barlow` | 2 | 0 |
| `bakedAt` | 0 | 0 |
| `LOAD THE REAL MODEL` | 0 | 1 |

Company entry: 417598 bytes. Consumer entry: 429407 bytes.

Company pass chunk: `dist-co/assets/passFacts-B2tslikF.js`, **527373 bytes**; it is the only company asset containing bakedAt. Consumer passFacts chunks: **none**; consumer assets containing bakedAt: **none**. `dist/index.html` retains exactly one Google Fonts stylesheet link; company HTML has none (its entry has the specified loader). The first HTML probe assumed rel appeared before href and printed false; direct inspection and an attribute-order-independent probe confirm the consumer link is present.

## Move proof

The requested command ran:

```sh
git diff --color-moved=zebra -- src/lib/realModel.js src/lib/passCore.js
```

Exit 0, 343 lines. Since passCore is new and intentionally untracked, ordinary git diff omits its additions. No index or git metadata was changed to make that output look staged. Supplemental headless comparison includes both destinations and visibly colors the moves:

```sh
git diff --no-index --color=always --color-moved=zebra \
  <(git show HEAD:src/lib/realModel.js) \
  <(cat src/lib/realModel.js src/lib/passCore.js)
```

Exit 1 means differences exist. Output contains the zebra moved-line ANSI styles 1;35, 1;36, 1;34 and 1;33. Byte-for-byte assertions separately checked the REAL constants, graph-output constants/builders, displayToken with displayCache, softmax/normalizer/skip/shortlist/tensor/preview/feed helpers, and pass body. The only body transformation is removal of the unchanged cache-write block into the wrapper and `lastRun = {` becoming `return {`. No arithmetic was rewritten.

All non-moved seam/import/export lines follow (blank separators omitted; function/export closing braces included):

`src/lib/realModel.js:32`

```js
import { MAX_GENERATED } from './toyModel.js'
import {
  REAL_LAYERS, REAL_HEADS, REAL_HIDDEN, RESIDUAL_STOPS, PROMOTED_OUTPUTS,
  withAttentionOutputs, displayToken, isSkippedToken, feedFor, tensorData, runPass,
} from './passCore.js'
export {
  REAL_LAYERS, REAL_HEADS, REAL_HIDDEN, RESIDUAL_STOPS, PREVIEW_DIMS, KV_LAYER,
} from './passCore.js'
```

`src/lib/realModel.js:313`

```js
    const run = await runPass({ Tensor, run: (feeds) => session.run(feeds) }, tokenizer, ids)
    if (run.n === 0) return run
    const { n, embeddings } = run
```

`src/lib/realModel.js:322`

```js
    lastRun = run
```

`src/lib/passCore.js:1`

```js
import { CANDIDATE_COUNT } from './toyModel.js'
```

`src/lib/passCore.js:221`

```js
export {
  ATTENTION_OUTPUTS, EMBED_OUTPUT, RESIDUAL_OUTPUTS, PROMOTED_OUTPUTS, FRAGMENT,
  graphOutputFragment, withAttentionOutputs, feedFor, tensorData, previewRows,
  normalizerOf, isSkippedToken, topCandidates, displayToken,
}
```

`src/lib/passCore.js:227`

```js
// The session adapter supplies its runtime’s Tensor constructor; feedFor stays shared.
export async function runPass(session, tokenizer, ids) {
  const key = ids.join(',')
  const { Tensor } = session
```

`src/lib/passCore.js:277`

```js
    return {
```

`src/lib/passCore.js:296`

```js
}
```

The replaced HEAD-only lines were `src/lib/realModel.js:32` (`import { CANDIDATE_COUNT, MAX_GENERATED } from './toyModel.js'`) and `src/lib/realModel.js:574` (`    lastRun = {`). The key declaration is duplicated at the wrapper seam; all other retained wrapper lines and cache comments are unchanged.

```sh
node --input-type=module -e "import('./src/lib/passCore.js').then(m => console.log(Object.keys(m).sort().join(' ')))"
```

Exit 0:

```text
ATTENTION_OUTPUTS EMBED_OUTPUT FRAGMENT KV_LAYER PREVIEW_DIMS PROMOTED_OUTPUTS REAL_HEADS REAL_HIDDEN REAL_LAYERS RESIDUAL_OUTPUTS RESIDUAL_STOPS displayToken feedFor graphOutputFragment isSkippedToken normalizerOf previewRows runPass tensorData topCandidates withAttentionOutputs
```

passCore contains no `import.meta.env`, `navigator`, `caches`, `Response`, `fetch`, `performance` or `window` read.

## Opposite cases

The full cached file was fed AS-IS to a CPU session, without appending anything. Its six old attention outputs are insufficient; the node subprocess exited 1 and printed exactly:

```text
the model graph is missing outputs: /transformer/wte/Gather_output_0, /transformer/Add_output_0, /transformer/h.0/Add_1_output_0, /transformer/h.1/Add_1_output_0, /transformer/h.2/Add_1_output_0, /transformer/h.3/Add_1_output_0, /transformer/h.4/Add_1_output_0, /transformer/h.5/Add_1_output_0
```

The actual App expression was extracted and evaluated in Node:

```js
const baked = COMPANY && bakedPass && text === DEFAULT_SENTENCE ? bakedPass : null
// COMPANY = true; bakedPass = the decoded pass;
// text = 'The engine roared and it shut off.'
// result: null
```

Default text returns the pass; COMPANY false and an unloaded pass each return null. Assertions exited 0.

## Unchanged wording for the lane's ruling

These are source quotations, not proposed replacements. F's live branch now means a recorded real pass for the baked sentence. The explicit in-browser claim and tour replay/run claims remain exactly as instructed:

`src/instruments/ForwardMap.jsx:2660`

```js
    ? `real distilgpt2 · ${REAL_LAYERS} blocks · ${REAL_HEADS} heads · d ${REAL_HIDDEN}${
        manifest ? ` · ${(manifest.parameters / 1e6).toFixed(1)}M parameters` : ''
      } · one pass on the sentence above, run in this browser · nothing in the picture is a stand-in: the only marks that carry no number are the aperture outline, the bloom around the light, and the sweep that travels down the sheet while it runs itself.`
```

`src/lib/tour.js:557`

```js
        ? `That is one pass: the file frozen, one sentence moving through it, one next word.`
```

`src/lib/tour.js:560`

```js
        ? `Nothing above ran twice and nothing was smoothed on the way to the screen. Press play to run it again, ` +
          `step back through it, or click anything on the sheet — a carrier, a ray, a wall cell — and it will say ` +
          `what it is.`
```

The greedy tour also claims a step/pick relationship to B, which remains illustrative; these strings and F's instrument-B skip references are unchanged:

`src/lib/tour.js:536`

```js
          ? `Greedy decoding took ${q(nextToken ?? '—')}${at_} — the top word every time, whitespace skipped.`
```

`src/lib/tour.js:539`

```js
          ? `No temperature, no top-k, no penalty, no draw: the rule is take the highest and nothing else. Blue ` +
            `is what the machinery scored highest; amber is what STEP will append. Same sentence, same word, ` +
            `every time — which on a six-block model is also how it talks itself into a loop.`
```

`src/instruments/ForwardMap.jsx:2591`

```js
    const tookCompact = greedy
      ? 'is what greedy decoding took (the top word every time once whitespace-only pieces and the end mark are set aside — instrument B&rsquo;s own skip — no temperature, no draw)'
      : `is what the sampler took ${samplerSettings}`
    const tookWide = greedy
      ? 'is what greedy decoding took (the top word every time once whitespace-only pieces and the end mark are set aside — instrument B&rsquo;s own skip — no temperature, no top-k, no draw)'
      : `is what the shipped sampler took ${samplerSettings}`
```

The baked armed branch selects TeachPair b and InfoTag mapReal. They describe real readings/replay rather than a fresh browser execution; quoted in full for the requested wording review:

`src/instruments/ForwardMap.jsx:3809`

```js
          b="one drawing, five readings, all of them real. the walls are the file's own weight bytes; a stream's width and light are the length of that token's 768-number vector at each depth; the filaments inside it are those 768 numbers grouped and averaged; a carrier is one attention weight out of the block's chosen head, read at the hero's own row; and the landing is the softmax over all 50,257 words at the last position. the head rule, the floor under a transfer and both normalisations are stated in the legend, because a drawing that does not say what it is doing is a picture rather than an instrument."
```

`src/content/explainers.js:87`

```js
  mapReal: {
    title: 'the forward pass',
    body: 'the boxes are distilgpt2\u2019s own tensors at their own sizes, read out of the file, and the texture inside each one is a block average of that tensor\u2019s own bytes. that half is cut rock: training carved it and a pass does not touch it. the water is everything amber. one column per token, falling in parallel, with a node at each of the seven depths \u2014 the node is bright in proportion to the length of that token\u2019s running vector there. the strip is the same vector without the reduction: 768 cells, one per number, morphing at each depth as the reader\u2019s token picks up meaning on the way down. click any node to stop it there. in the selected block, the threads are that token\u2019s attention averaged over the twelve heads \u2014 the channels where a later stream drinks from an earlier one \u2014 and the twelve squares are lit by how much of its attention each head spends on tokens other than itself. the fall is a replay: onnx hands back the intermediate tensors only once the pass has finished, and the seven stops are one per block rather than one per operation inside it.',
  },
```

The following company wording remains for OTHER sentences. Its statements about no current pass or a schematic remain local truth for those sentences; universal claims about “this copy” are now only partly true because the default sentence has a baked pass. The adjacent company conditionals are quoted verbatim, including their source expression where needed:

`src/instruments/ForwardMap.jsx:2561`

```js
        ? (COMPANY ? `There is no attention to draw without a pass, so no carriers are drawn. With a model in hand each block would read the hero’s own row: green tick = the key that matched, amber carrier = the weight.` : `There is no attention to draw without a pass, so no carriers are drawn. Load the real model and each block reads the hero’s own row: green tick = the key that matched, amber carrier = the weight.`)
        : `There is no attention until a pass has run, so no carrier is drawn here. With the real model in hand, each block takes the head that sends the most attention away from the first token and away from itself, and draws the hero’s own sources at or above ${TRANSFER_FLOOR}, at most 2: a green tick at the key that matched, an amber carrier whose width and light are that weight, and a brighter hero below the absorption.`
```

`src/instruments/ForwardMap.jsx:2603`

```js
        ? (COMPANY ? `The last position’s vector against all 50,257 words. It needs a pass, which this copy does not run.` : `The last position’s vector against all 50,257 words. It needs a pass — load the real model and the bars are this sentence’s own softmax.`)
        : (COMPANY ? `Where the last position’s vector meets all 50,257 words. There is no distribution without a pass, so no bar is drawn; with a model in hand the bars would be this sentence’s own softmax, top ${g.splashN}.` : `Where the last position’s vector meets all 50,257 words. There is no distribution without a pass, so no bar is drawn: load the real model and the bars become this sentence’s own softmax, top ${g.splashN}.`)
```

`src/instruments/ForwardMap.jsx:2719`

```js
                : (COMPANY ? 'the walls are real — the fall is a schematic in this copy' : 'the walls are real in both modes — the fall needs the model')
```

`src/instruments/ForwardMap.jsx:3612`

```js
                  : (COMPANY ? 'the landing needs a pass — this copy runs none' : 'the landing needs the real model — load it above')}
```

`src/instruments/ForwardMap.jsx:3808`

```js
          a={`the six walls are real in this mode too: every cell is one byte of that block's attention weights, read out of the file when this page was built, stretched across the middle 96% of its own window. what is not real is the fall — no model is running, so every stream is drawn at one width, the grain inside it is the deterministic stand-in instrument D prints, and there is no attention to carry and no landing to reach. ${COMPANY ? "with a model in hand the same drawing would fill with this sentence's own numbers." : "load the real model and the same drawing fills with this sentence's own numbers."}`}
```

`src/lib/tour.js:365`

```js
        : `No pass has run, so the drawing has no length to draw: every stream is at one width and one light, and ` +
            `the grain inside it is the deterministic stand-in instrument D prints. ` +
            (COMPANY
              ? `With a model in hand these would be this sentence’s own numbers.`
              : `Load the real model above and these become this sentence’s own numbers.`),
```

`src/lib/tour.js:421`

```js
            `There is no attention to draw without a pass, so no carrier is drawn anywhere on this sheet.`,
            `The walls below are still the file’s own bytes — they are real in both modes — but the green keys, ` +
              `the amber carriers and the landing all wait on the model. ` +
              (COMPANY
                ? `With a model in hand this same tour would speak this sentence’s own weights.`
                : `Load it above and this same tour speaks this sentence’s own weights.`),
```

`src/lib/tour.js:558`

```js
        : `That is the shape of one pass, with the walls real and the fall a schematic.`,
```

`src/lib/tour.js:563`

```js
        : (COMPANY
            ? `With a model in hand the same tour would speak this sentence’s own numbers at every stop.`
            : `Load the real model above and the same tour speaks this sentence’s own numbers at every stop.`),
```

The mode bar is unchanged for every sentence and now broadly under-describes the baked F. Its universal illustrative/no-model wording is also for the lane:

`src/components/ModeControl.jsx:38`

```js
          <span className="mode-illustrative">illustrative</span>
          <span className="mode-state">no model in this copy</span>
        </div>
        <div className="mode-row mode-load is-company">
          <span className="mode-hint">this copy does not download the model — what it shows of the file was read when this page was built, and the rest is illustrative.</span>
```

`src/components/ModeControl.jsx:48`

```js
          a="everything here is illustrative — deterministic stand-ins, no model running."
```

The no-download statement remains true: the company page receives pass data, not an ONNX model. No strings in FileView or the essay were edited.

A–D stay on stand-ins: A's chips display `The engine roared …` using the toy split; baked F's chips display `The ␣engine ␣roared …` using the real pieces. B's STEP remains illustrative even while F's amber token is the real pass's greedy choice. This seam exists by the brief's ruling.

## Working-tree receipt

`git status --short` (exit 0):

```text
 M package.json
 M src/App.jsx
 M src/lib/forwardMap.js
 M src/lib/realModel.js
?? scripts/bake-pass.mjs
?? src/content/passFacts.json
?? src/lib/bakedPass.js
?? src/lib/passCore.js
```

SHA256 per changed/new file listed by git (the report is gitignored):

```text
26ba222a8b7142256b51ad9d03fa6a30f8b259bb84f6bde90f7437a423229188  package.json
9daa71c0ac67b053548d21d4306075dd3d5adc0b0614bc3320d6979766ab8a46  src/App.jsx
613e35e46344e71d3364b1f47d056f2f9b1903721aac861ee3f55c831666d904  src/lib/forwardMap.js
29e12ff4fb7286a90fd46e49e0532ce5631b4d68a3e365bc01b9bf3af142b74c  src/lib/realModel.js
11d7d954ebc92cd9f006a566c657f2f5570a8893d2d5d094233ae4597584e56c  scripts/bake-pass.mjs
1b7a5be47dd726ba5010389a838afec8469bca6806cf6b884c511520762c2059  src/content/passFacts.json
3767c4ea8f7822516db723c7506b27617b31b558b9e21f668fcc81dcf1f28a29  src/lib/bakedPass.js
6c5e3593a469c827cfc5f17e26091e080f59bedd321106bc4655676b79f628d1  src/lib/passCore.js
```

`git diff --check`: exit 0. The eight source/data/script/package files exactly match the authorized set; no protected tracked file changed. The report is `design/the-company-copy/BUILD-BRIEF-PASS-REPORT.md`, local/gitignored. Generated build outputs are also ignored. No work was staged or committed.

## Not run

Browser proofs belong to the caller and are **unrun here**: rendered KEY labels and residual line compared against the live consumer page's numbers; CLS; no Hugging Face request; a different sentence's straight sheet. No browser/GUI was launched and no network was used. CPU numbers may differ in low digits from browser WASM/WebGPU; no cross-backend equality is claimed.

DONE PASS — Baked the default sentence's real CPU pass into company F, preserved existing words, and passed all headless checks; browser proofs remain with the caller.
