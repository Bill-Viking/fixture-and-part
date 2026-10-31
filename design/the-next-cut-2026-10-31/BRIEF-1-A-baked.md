to: sol
kind: mechanical
complexity: simple
reason: a settled words-and-wiring edit from the record (FIG-MAP §(d), the D precedent in GlassPass.jsx); no drawing
touches:
- vite.config.js
- src/App.jsx
- src/instruments/Tokenizer.jsx
- src/content/explainers.js
---
# BRIEF 1 — instrument A reads the one real pass in the company copy (2026-10-31)

Quality bar: the machine notices, the human never checks; nothing superfluous; the public bundle's behaviour byte-for-byte the same as before except where this brief says.

Report: `design/the-next-cut-2026-10-31/BRIEF-1-REPORT.md` — per file what changed (lines), the exact strings added, the two build results (public and company), the two lazy-chunk checks, `git status --short` last, final line `DONE — …` or `FAIL — …`. You cannot commit or push; the lane does. No browser here; the lane proves in its own pane.

## What this is

The page has two copies from one source: the PUBLIC copy (`npm run build`, a real model loads in the browser on demand) and the COMPANY copy (`VITE_COMPANY=1`, no model ever runs; `src/lib/company.js` exports `COMPANY`). In the company copy, one real forward pass of the page's own sentence («The engine roared and it shut down.») was baked at build time into `src/content/passFacts.json` (`scripts/bake-pass.mjs`), and instruments F and D already read it for that sentence (`App.jsx:444` — `const baked = COMPANY && bakedPass && text === DEFAULT_SENTENCE ? bakedPass : null`; D takes `bakedRun`, F takes `run`). Instrument A (`src/instruments/Tokenizer.jsx`) does NOT: in the company copy it always prints a stand-in (`formatVector(hashTokenToVector(token, 6))`) under the chip `stand-in` (`<NumberStatus source="standin" />`), although `passFacts.json` `run.embeddings` holds the real first six numbers of each of the 8 tokens (`run.ids`, `run.tokens`, `run.embeddings` — 8 × 6), for example for «␣it»: id 340, `[0.0252, -0.0504, 0.0126, 0.0755, -0.0378, -0.0126]`.

The job: in the company copy, for the page's own sentence, A prints the real pieces, ids and first-six numbers from the baked pass, under the chip `one real pass`; for any other sentence the stand-ins return under `stand-in`. Zero layout shift: the baked numbers must be in the first paint, not loaded after it.

## Part 1 — the baked slice ships as a build-time constant (`vite.config.js`)

`passFacts.json` is ~300 kB (its `lastLogits`) and is loaded lazily (`src/lib/bakedPass.js`, a dynamic import gated by `COMPANY`); A must not wait for it, and `passFacts.json` must NEVER be imported statically anywhere (the public bundle must not carry it). So A's slice rides as a `define` constant, the precedent being `__FILE_PARAMETERS__` at `vite.config.js:47-48`:

- In `vite.config.js`, when `process.env.VITE_COMPANY === '1'`, read `src/content/passFacts.json` at config time (fs + JSON.parse, beside how `manifest` is already read in that file) and define `__BAKED_A__` as `JSON.stringify({ sentence: facts.provenance.sentence, ids: facts.run.ids, tokens: facts.run.tokens, embeddings: facts.run.embeddings })`; otherwise define `__BAKED_A__: 'null'`.
- The slice is about 600 bytes. Round nothing: the numbers go through `formatRealVector` (2 dp) at render, like the real ones.

## Part 2 — `App.jsx` hands A the slice for the page's own sentence

Near `App.jsx:444`, add a synchronous gate that does not depend on the lazy `bakedPass` state:

```js
const bakedA = COMPANY && __BAKED_A__ && text === DEFAULT_SENTENCE ? __BAKED_A__ : null
```

(`COMPANY` is a build-time constant, so the public bundle tree-shakes the whole branch; keep the `COMPANY &&` first.) Pass it to A: `<Tokenizer … baked={bakedA} />`. Leave `tokens={baseTokens}` as it is — A decides what to print.

## Part 3 — `Tokenizer.jsx` renders the baked state

Add the prop `baked` (the slice or `null`). When `baked` is non-null:

- the pills print the baked pieces (`baked.tokens[i]`, with ␣ — `TokenText` already dims the marker), the id (`· id {baked.ids[i]}`, the real-mode form at lines 105-107) and `formatRealVector(baked.embeddings[i])`. Use `baked.tokens` as the list when baked, else `tokens` as now. (`baked.tokens.length` is 8 and equals the company toy split's 8; do not assume it — render from the baked list.)
- the chip (line 94): `{COMPANY && <NumberStatus source={baked ? 'pass' : 'standin'} changing />}` — `changing` reserves the wider word so typing another sentence does not move the row (the precedent: `GlassPass.jsx:225`).
- the TeachPairs show the `b` wording when `real || baked`; and the `b` strings in the COMPANY copy read, in this order (keep the public `b` strings exactly as they are — select with `COMPANY ? … : …` so the public bundle keeps only its own):
  - head note (line 60) company `b`: `real bpe pieces, ids and embeddings — one pass, made when the page was built`
  - label row (line 91) company `b`: `embedding — first 6 of 768 dims` (the same as the public one; no branch needed)
  - teach line (line 120) company `b`: `real gpt-2 bpe pieces. ␣ marks a leading space, so a piece without one continues the word before it. the numbers are the first 6 of the 768 distilgpt2 keeps for that id, read in one pass when the page was built. type another sentence and the stand-ins return.`
- the `?` explainers (lines 84 and 93): topics `tokenReal` and `embeddingReal` when `real || baked`. Read both in `src/content/explainers.js:55-62`: neither says a model is running here, so they serve the baked state as written; change nothing there. (If you find otherwise, add `tokenBaked`/`embeddingBaked` copies with «read in one pass when the page was built» and say so in the report.)
- the `a` strings and the whole public behaviour (`real` true/false, `realIds`) stay exactly as they are.

Keep the pill `key` unique (`${token}-${i}`). `formatRealVector` (`src/lib/realModel.js:397`) maps over its argument with `toFixed(2)` — a plain array is fine; confirm by reading it.

## Part 4 — the company intro says where the pass is replayed (`App.jsx:1049`)

In the company intro html, `kept and replayed in instrument F` → `kept and replayed in instruments A, D and F`. Nothing else in that paragraph changes.

## Checks (run all; print each result in the report)

1. `npm run build -- --configLoader native` (public) and `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-company --base /fixture-and-part/company/` (company) both succeed. (In this worktree `node_modules` is a symlink; `--configLoader native` is required.)
2. Lazy-chunk gate: in `dist/assets/` the public entry carries NO `passFacts` chunk and no `__BAKED_A__` data (grep the entry js for `45615` — the id of «␣roared» — expect 0 hits); in `dist-company/assets/` `passFacts-*.js` is still a separate chunk loaded by `import(` (grep the entry for `passFacts-` inside an `import(`), and `fileFacts-*.js` is still dynamic in both entries.
3. The company entry carries the slice: grep `dist-company/assets/index-*.js` for `45615` — expect ≥ 1 hit.
4. `npx eslint src/instruments/Tokenizer.jsx src/App.jsx` clean (or the repo's lint script if one exists in package.json).
5. `git status --short` — only the four touched files and the report.

## Done

`DONE — A reads the baked pass in the company copy; public bundle unchanged in behaviour; builds: public OK, company OK; lazy chunks intact` or `FAIL — <what and where>`.
