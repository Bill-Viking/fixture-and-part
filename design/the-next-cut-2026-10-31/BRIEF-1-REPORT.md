# BRIEF 1 — instrument A baked pass report

Implementation complete; one literal acceptance assertion fails. The public entry has **1** occurrence of `45615`, not the requested 0. It belongs to the existing `src/content/figFacts.json` ids array, imported by `LadderFigure.jsx:4` and `LedgerFigure.jsx:3`. That JSON is byte-identical to HEAD. The company entry has **2** occurrences: the same existing figure data plus the new A slice. No check was disabled and no existing figure data was changed to force a zero.

Workspace: `/Users/bill/Projects/fixture-and-part/.claude/worktrees/company-look`, branch `the-company-copy`, starting HEAD `4e324ab`. Starting worktree was clean. This report uses the explicit, nested absolute hand-back destination in the caller's instructions; the embedded brief names a shorter report path.

## Files and lines

- `vite.config.js:27–30,53–58` (+11/−0): config-time company-only fs read and JSON parse of `passFacts.json`; `__BAKED_A__` contains only sentence, ids, tokens and embeddings. Public define is the string `null`. Company JSON slice is 1,158 UTF-8 bytes, with no rounding.
- `src/App.jsx:445,901,1051` (+3/−1): synchronous `COMPANY &&` gate independent of `bakedPass`; passes `baked={bakedA}` while preserving `tokens={baseTokens}`; intro has exactly the requested phrase replacement. D/F's existing lazy gate is unchanged.
- `src/instruments/Tokenizer.jsx:30,37–44,62–64,88–110,122–124` (+16/−12): accepts baked data; uses the baked list, ids and first-six arrays; calls `formatRealVector` before the stand-in path; switches all three TeachPairs and both explainer topics on `real || baked`; reserves the status width with `changing`. Pill key remains `${token}-${i}`. Original real-mode embedding lookup and all public a/b strings are preserved.
- `src/content/explainers.js:55–62`: read, unchanged (byte-identical to HEAD). Neither `tokenReal` nor `embeddingReal` claims a model is running here. No baked copies needed. The brief lists four possible implementation files; only three required changes.
- This report: created at the caller's exact hand-back path. `design/` is already ignored by `.gitignore:16`, so this report does not appear in ordinary `git status --short`. Nothing was staged or force-added.

## Exact visible strings

New company head note:

```text
real bpe pieces, ids and embeddings — one pass, made when the page was built
```

Label row (existing, reused unchanged):

```text
embedding — first 6 of 768 dims
```

New company teaching line:

```text
real gpt-2 bpe pieces. ␣ marks a leading space, so a piece without one continues the word before it. the numbers are the first 6 of the 768 distilgpt2 keeps for that id, read in one pass when the page was built. type another sentence and the stand-ins return.
```

Company intro replacement only:

```text
kept and replayed in instrument F
→ kept and replayed in instruments A, D and F
```

Status strings already existed in `NumberStatus.jsx` and are now selected by `source={baked ? 'pass' : 'standin'}` with `changing`: `one real pass` / `stand-in`. The id form remains `· id {id}`. The `␣` marker continues through `TokenText`.

## Build and lint results actually run

Both builds were bounded to 180 seconds per process group; both completed within the bound. Native config loading was used for the linked node_modules.

1. `npm run build -- --configLoader native` — **PASS**, exit 0, 80 modules, 2.32 s. Entry `dist/assets/index-Cd_ju1is.js`, 469.04 kB / gzip 159.96 kB. Vite emitted its >500 kB chunk warning (the transformers chunk is 550.54 kB); no warning threshold changed.
2. `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-company --base /fixture-and-part/company/` — **PASS**, exit 0, 61 modules, 478 ms. Entry `dist-company/assets/index-BRmaSH7y.js`, 459.38 kB / gzip 156.39 kB. Vite emitted its >500 kB chunk warning (the lazy passFacts chunk is 527.37 kB); no warning threshold changed.
3. `npm run lint` (the repository's configured oxlint script) — exit 0, with the known unrelated warning at `src/instruments/AttentionInspector.jsx:57:45`: `react-hooks(exhaustive-deps)` on `rows`. It was not changed.
4. `npm run lint -- src/instruments/Tokenizer.jsx src/App.jsx` — **PASS**, exit 0, no diagnostics. Used the installed repo lint script; did not install or run eslint.
5. `git diff --check` — **PASS**, exit 0.

## Lazy-chunk and slice checks actually run

Public:

- No `passFacts-*.js` file in `dist/assets/`; no `passFacts-` reference or dynamic import in the public entry — **PASS**.
- `fileFacts-DKLLE9gH.js` remains a separate 232.50 kB chunk. Public entry contains two `import(`./fileFacts-DKLLE9gH.js`)` expressions — **PASS**.
- Literal `45615` occurrence count: **1**, expected 0 — **FAIL**. The context is the unchanged figure facts: `tokens:[...],ids:[464,3113,45615,290,340,4423,866,13],hero:{index:4,token:...}`. This is not the A slice.
- Separate diagnostic, not a replacement for that failed assertion: A slice structure (`ids:[464,3113,45615,290,340,4423,866,13],tokens:[...],embeddings:`) occurs **0** times; both new company teaching strings are absent — **PASS**.

Company:

- `passFacts-B2tslikF.js` remains a separate lazy chunk; entry has `import(`./passFacts-B2tslikF.js`)` once — **PASS**.
- `fileFacts-DKLLE9gH.js` remains separate; entry has `import(`./fileFacts-DKLLE9gH.js`)` twice — **PASS**.
- Literal `45615` count **2** (expected at least 1); A slice structure count **1** — **PASS**.
- New company head note and intro wording present — **PASS**.
- No `huggingface` string in the company entry and no transformers asset in company assets — **PASS**.

Additional source/config checks — **PASS**:

- Public config `__BAKED_A__` equals `'null'`; company config JSON deep-equals the unrounded source slice, with 8 ids, 8 pieces and 8 × 6 numbers.
- `formatRealVector` read at `src/lib/realModel.js:397–409`: uses array `.map`, `toFixed(2)` and normalizes `-0.00`; plain baked arrays work without conversion.
- All original public TeachPair a/b strings match HEAD. Company intro differs only by the requested phrase.
- Source scan finds the sole passFacts runtime import in `src/lib/bakedPass.js`, still dynamic and company-gated; no static runtime import was added.

## Proof limits

No browser or GUI application was launched. Browser proofs are **UNRUN here; caller-owned**: first paint and measured CLS/geometry at desktop/phone widths; typing another sentence and restoring the default; chip-width stability; rendered explainer behavior; public real/illustrative runtime parity. The baked A path is synchronous by source/config inspection and has no dependency on the lazy `bakedPass` state. No claim of measured zero layout shift is made.

No commit, push, sync, permission expansion, safety-check suppression, STATUS/opener update or unrelated source edit was performed. Built assets remain under the existing ignored output directories. Implementation is handed back for the lane's review; the literal raw-zero gate remains unresolved.

## git status --short (last check)

```text
 M src/App.jsx
 M src/instruments/Tokenizer.jsx
 M vite.config.js
```

FAIL — A implemented; public 45615 zero-hit gate fails on 1 pre-existing figFacts hit; builds OK and lazy chunks intact
