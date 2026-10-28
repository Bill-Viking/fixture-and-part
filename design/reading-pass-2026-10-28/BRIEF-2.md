# BRIEF 2 — two drawn figures from the file's own bytes (2026-10-28)

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; nothing superfluous. Principles served: make the interface truthful · prove quality before declaring completion · design for interruption (reserved boxes, no shift).

WHY ASTRA: two new drawn figures with their own data pipeline, built under the page's zero-shift rule and its figure pattern, with a renumbering of every figure below them. Settled by this brief; the lane rules the result.

You are a headless builder in THIS folder, a git worktree on branch `the-company-copy` (level with main). Rules, all binding:
- NEVER commit, stage or push. NEVER open a browser or GUI. Vite here needs `-- --configLoader native` on every build. `npm run lint` keeps its one existing warning.
- READ FIRST: `design/reading-pass-2026-10-28/FIG-MAP.md` (the map of the figure pattern and the data), `src/figures/LoopFigure.jsx` (the pattern to follow), `design/the-loop-and-the-landing/REPORT.md` §2–3 (how the loop proved zero shift and its type floor), `interactive-guide-spec.md:228-240` (figures are numbered in reading order).
- WORDS are verbatim as given below; never improve them. Numbers are never typed: every number a figure prints comes from `src/content/figFacts.json`, which `scripts/bake-pass.mjs` writes.
- PROTECTED, with two deliberate lifts: `src/content/passFacts.json` must stay BYTE-IDENTICAL (sha256 before = after; the gate); `src/lib/bakedPass.js` and `src/lib/passCore.js` untouched. LIFTED: `scripts/bake-pass.mjs` may gain the figFacts writer (additive; the packet it already writes is unchanged); `src/company.css` may gain the new SVG classes in the ONE `:is(...)` list at ~283–287 that keeps drawings in the original palette (no other change there). STATUS.md, OPENER.md and `design/` (except your report) untouched.
- `passFacts.json` is NEVER imported outside `loadBakedPass` (527 KB would land in the consumer bundle). `figFacts.json` is small (under 16 KB) and both copies import it statically.
- Anything unclear: stop that item, report it, continue with the rest. Report: `design/reading-pass-2026-10-28/BRIEF-2-REPORT.md`, last line `DONE — …` or `FAIL — …`.

## F0 — the data: `src/content/figFacts.json`, written by `scripts/bake-pass.mjs`

Extend `bake-pass.mjs` (it already runs the 8-token pass of the page's sentence through the real model on this Mac with onnxruntime-node and writes `passFacts.json`). After its existing writes, and WITHOUT changing them, compute and write `src/content/figFacts.json`:

```
readAt, sentence, tokens[8], ids[8],
hero: { index: 4, token: "␣it", id: 340 },
wte: { rows: 50257, cols: 768, dtype: "u8", scale, zeroPoint, bytes: 38597376,
       window: { row0: 336, col0: 0, rows: 24, cols: 64, base64 },    // copied from fileFacts.json's wte window
       heroRowFirst6Bytes: [6 u8], heroRowFirst6: [6 floats = (q − zp) × scale] },
rim:  { heroFirst6: [6], heroLength: ‖residuals[0][hero]‖ },
stream: { heroLengths: [7 floats: ‖residual at each depth‖ for the hero] },
wall: { name: "transformer.h.0.attn.c_attn.weight_quantized", rows: 768, cols: 2304, dtype: "i8", bytes: 1769472, scale, zeroPoint,
        window: { row0: 0, col0: 0, rows: 24, cols: 64, base64 } },   // copied from fileFacts.json
rack: { layer: 0, head: 0,
        k: [8][6], v: [8][6],                                         // the 8-token pass, head 0, first 6 of 64 (what passFacts already has)
        before: { k: [7][6], v: [7][6] },                             // a SECOND pass on the 7-token prefix ids.slice(0,7)
        moved: { k: [7], v: [7], max: float, maxAbsValue: float } }   // per row 0..6: the largest |after − before| over ALL 768 numbers of that row's layer-0 key (and value); max = the largest of the 14; maxAbsValue = the largest |value| among those rows, for scale
```

The full-width layer-0 keys and values are `present.0.key` / `present.0.value` (`[1,12,n,64]`, the 12 heads concatenated per position make the 768-wide row); `passCore.js` exports `feedFor`, `tensorData`, `withAttentionOutputs` — call `session.run` with them in `bake-pass.mjs`; do not change `passCore.js`. Assert `heroRowFirst6` equals `passFacts`'s `embeddings[4]` to 1e-6 (the map found they agree) and that `hero.id === 340`. Put an `// ASSUMES:` line on the drift computation (what it assumes about causal masking and this export's quantization) and test the opposite case in a node check: feed the comparison two identical rows and expect 0; two rows differing in one number and expect that difference.

Run `npm run facts:pass` to write both files. Gate: `shasum -a 256 src/content/passFacts.json` is unchanged (record both hashes); `figFacts.json` under 16 KB.

## F1 — the ladder figure: token · id · row · vector · stream · tensor

Component `src/figures/LadderFigure.jsx`, mounted as `{ type: 'figure', name: 'ladder' }` in `src/content/essay.js` directly AFTER the tokenizer block (`{ type:'instrument', name:'tokenizer' }`, section 02) and before the forward-pass block, through the stateless `figures` map in `App.jsx` (the loop's road). It imports `figFacts.json` statically and nothing else from the pass.

Follow LoopFigure's pattern exactly: one data description, two SVG layouts always in the DOM (wide 680-wide viewBox, stacked shown at ≤ 640 px), heights reserved by CSS `aspect-ratio` per layout, type in viewBox units with the same floors the loop documents (never under 10 px at 390), nothing focusable, nothing animated, `role="img"` with an aria-label, a hairline frame. Five frames left to right (wide) / top to bottom (stacked), each a labelled panel in E's grammar (the thing · where · stored as · means), joined by arrows:

1. the piece — label `the piece`; the token `␣it` large; the line `id 340 · piece 341 of 50,257 in the word table` (the id from figFacts, the ordinal = id + 1 — compute, do not type).
2. the table — label `the table · transformer.wte.weight_quantized`; a tall thin schematic of 50,257 rows with row 340's position marked; beside it the REAL window (24 rows × 64 columns of bytes from `wte.window`, drawn as cells shaded by byte value the way F shades a wall) with row 340 (window row 4) outlined; lines `50,257 rows × 768 numbers · stored as one byte each, u8, scale 0.0126, zero point 128 · 38,597,376 bytes` (numbers from figFacts, formatted as the page formats them).
3. the vector — label `the row is the vector`; the six bytes of row 340 (`heroRowFirst6Bytes`) above an arrow to the six numbers they mean (`heroRowFirst6`, two decimals), line `768 numbers; these are the first six · (byte − 128) × 0.0126 · the same six instrument A prints when the model is loaded`.
4. the stream — label `the stream`; the vector enters at the rim with its position mark (`+ wpe[4]`), then a column of six wall slabs with the hero's length at the seven depths beside it as a thin rising bar (`stream.heroLengths`, one decimal below 100, whole above), lines `its first stop: wte + wpe, 5.2 long · every block adds to the same running vector · 5.2 → 367 by the last wall`.
5. the tensor — label `one wall is one tensor · transformer.h.0.attn.c_attn.weight_quantized`; a wide slab 768 × 2,304 in proportion with the REAL 24 × 64 window drawn as cells at its top-left corner (from `wall.window`, i8 → brightness by |value|), lines `768 rows × 2,304 columns · stored as one signed byte each, i8, scale 0.0188, zero point 0 · 1,769,472 bytes · frozen: no pass changes one`.

Eyebrow `FIG.N — THE LADDER` (N per the renumbering below), title `One piece, followed into the file`, caption (verbatim): `FIG.N — One piece, followed into the file: the id picks a row of the word table; the row is the piece’s starting vector; the vector is the stream that falls through the walls; each wall is one weight tensor. Every number here is the file’s own, read when this page was built.` In the company copy only, one more mono line under the caption (TeachPair-style, the company `a` variant): `instrument A above prints stand-ins in this copy; this drawing prints the real row.`

Glossary (`header.glossary`, `src/content/essay.js`): add after PART: `{ word: 'TENSOR', role: null, gloss: 'a grid of numbers in any number of dimensions: one row is a vector, rows × columns a matrix; the file\'s weights are tensors, frozen, and the stream\'s vectors are tensors too, moving' }`. Count-driven rows (BRIEF-1b) — confirm nothing assumes nine.

## F2 — the ledger figure: the rack, before and after

Component `src/figures/LedgerFigure.jsx`, mounted as `{ type: 'figure', name: 'ledger' }` in section 03 directly AFTER the paragraph that begins `Would it be worth letting them change?` and BEFORE the paragraph that begins `On the rack below`. Same pattern as F1 (two layouts, aspect-ratio reserved, nothing runs). Three panels:

1. `the rack is a ledger` — eight rows, one per token (`rack` data), each row: the token, then its K six numbers and its V six numbers (two decimals) from `rack.k`/`rack.v`; rows 1–7 drawn as stamped (a solid row rule), row 8 (`.`) drawn arriving below with arrows from it UP to rows 1–7 only (nothing points down). Line: `token 8 arrives: it writes its own row and reads the seven above · layer 0, head 0, the first six of 64 · nothing points down`.
2. `before and after` — rows 1–7 twice: the left column from `rack.before` (the 7-token pass), the right from the 8-token pass, with one reading per row between them: `same` when `moved.k[i]` and `moved.v[i]` are both below 1e-4, else `moved ‹the larger of the two, 4 decimals›`. Lines: `in a deployment these rows are stored once and reused: byte for byte the same` · `this page’s model re-runs the whole sentence each step and its rounding can nudge a row — the largest move measured here: ‹moved.max, 4 decimals› against values up to ‹maxAbsValue, 1 decimal›` (numbers from figFacts, never typed).
3. `the brain’s move` — a schematic beside the ledger: one row lifted out of a stack, a mark on it, put back changed; lines `sections 05 and 06: check the memory out, edit it, write it back, forget most of the rest` · `the one thing the rack never does`. Drawn in the page’s neutral tone, no byte cells (it is a drawing of a claim the essay makes with its own marks; add none here).

Eyebrow `FIG.M — THE LEDGER`, title `The rack, before and after`, caption (verbatim): `FIG.M — The rack as a ledger: each token’s finished parts stamped once when it arrives, read upward by every later token, never rewritten. Rows 1–7 drawn before and after token 8 arrives, with the measured move of each; the brain’s move beside it for contrast.`

## F3 — renumbering

Figures are numbered in reading order. With the ladder after A and the ledger before B the order becomes: E=FIG.1 · A=FIG.2 · ladder=FIG.3 · F=FIG.4 · ledger=FIG.5 · B=FIG.6 · C=FIG.7 · D=FIG.8 · loop=FIG.9. Change every numbered string the map lists in its §1 (captions, `LoopFigure.jsx:5,277,288`, `README.md:157-168`, `interactive-guide-spec.md:232-240`, the two `toyModel.js` comments, `styles.css:425,433`, and any `FIG.N` the essay prose or claim notes mention — grep `FIG\.` across the repo and list every hit you changed and every hit you left, with why). The company copy’s WORDS or fine print that name a figure number must change too (grep `FIG` in `src/`).

## F4 — palette, bands, reservations

- Add the two new SVG classes to the `:is(...)` list in `src/company.css` so the drawings keep the original palette like the loop. Nothing else in that file.
- Wide layout shown > 640 px, stacked ≤ 640 px; `aspect-ratio` per layout in `styles.css`; stacked max-width as the loop's; every `<text>` ≥ 10 px at a 390 px window (compute from viewBox units as the loop's comment does) — report the smallest.
- Byte cells: draw the 24 × 64 windows as `<rect>` cells (1,536 per window, two windows in F1) — keep the SVG under ~400 KB of markup per layout; if that is too heavy, render the windows as a tiny `<image>` from a data-URL PNG built at BUILD time into figFacts (base64, < 8 KB) and say so.

## Checks to run and report

1. `npm run facts:pass` output; `passFacts.json` sha256 before = after; `figFacts.json` size; the node check of the drift function (opposite cases).
2. `npm run lint`; both builds with the flag; the consumer `dist/assets/` has NO `passFacts-*.js` chunk; the company `dist-co/assets/` has one.
3. Both bundles: each caption string once; `TENSOR` gloss once; `FIG.9 —` once (the loop), `FIG.3 —` once, `FIG.5 —` once; no stray old number (`grep -c` of each `FIG.N —` in each bundle, N = 1..9, each exactly 1).
4. Node render of both figures (ReactDOMServer): the numbers printed equal figFacts to the stated precision; row 340 marked; eight rack rows; the move readings as the rule says.
5. The SVG text-size floor per layout at 390 and 641 px, computed.
6. `git status --short` last; nothing staged. Browser proofs (CLS, box heights in four readings, both copies) are the lane's and UNRUN by you — say so.
