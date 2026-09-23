# BUILD BRIEF — the window for a novice (instrument E, section 01), branch `window-for-a-novice`

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; zero human steps where a machine can carry them; nothing superfluous. Principles served (design/SOFTWARE-DESIGN-PRINCIPLES in the hub): make the interface truthful; make intelligence accountable (every label is read from the file); prove quality before declaring completion.

## What this is

Instrument E's byte window (`src/instruments/FileView.jsx`, the 24 × 64 canvas of raw bytes cut from `transformer.wte.weight_quantized`) is honest but unlabeled. Bill, on the live page: "I had a hard time understanding what I was looking at." This build gives the window its labels and its plain words, every one of them read from the real file, and adds one true thing the window can now say: two of its 64 columns stand out across the whole word table. The exact strings are in `design/window-for-a-novice/WORDS.md` — copy them character for character; the words are Bill's ruling, not yours to improve. The explainer text (WORDS §6) is already committed on this branch's base by the lane; do not touch `src/content/explainers.js`.

Facts, read from the file on 2026-09-23 with `scripts/read-model-file.mjs`'s own scanner (the numbers your precompute must reproduce): word table 50,257 × 768 u8, zero point 128, multiplier 0.012588760815560818; rows 0–23 are the pieces `! " # $ % & ' ( ) * + , - . / 0 1 2 3 4 5 6 7 8`; per-column mean over all rows — mean of means 0.00016, sd of means 0.0730, median |mean| 0.0218, median column sd 0.1242; eight columns lie beyond 4 sd of the mean of means, two of them in columns 0–63: slot 36 (mean −0.3161, sd 0.0039) and slot 6 (mean −0.3013, sd 0.0703); slot 55 is next at 3.2 sd and is not a standout. Largest value either sign 1.5988.

You are an Opus builder. Work in your git worktree on branch `window-for-a-novice` off the main head the lane names when it starts you (rename your worktree's branch if the harness named it otherwise). Commit on this branch only. Do NOT merge, do NOT deploy, do NOT edit STATUS.md, OPENER.md, `src/content/essay.js`, `src/content/claimNotes.js`, `src/content/explainers.js`, `src/lib/tour.js`, `src/lib/realModel.js`, or any instrument but FileView. No new dependencies, nothing installed into the project. This is the Mac: no VITE_BASE trap in bash; a dev build needs no base. The model file is already on this machine, sha-checked: `/private/tmp/claude-501/-Users-bill-Projects-fixture-and-part/a4845300-c7a8-43b2-8175-21865fe200e4/scratchpad/decoder_model_quantized.onnx` (83,502,375 bytes; copy it into your own scratch space if you cannot read that path; the script checks the sha either way, and `--file` reads a local copy).

## Read first

- `src/instruments/FileView.jsx` in full — the window's draw (`~640–685`), `pickCell` and `onCanvasKey` (`~687–722`), `blobEyebrow`, `NOTHING_PICKED` and `readout` (`~724–775`), `tokenOf` (`~1146`), the shipped-vs-live cross-check (`~479–500`), and the file's header comment about having no illustrative mode.
- `src/lib/onnxScan.js` (`windowOf`, `histogramOf`, `quantOf`, `rawValue`), `src/lib/fileBytes.js` (`readWindow`, `decodeWindow`, `wteRowCheck`), `src/lib/modelBytesWorker.js` (`sendWindow`), `scripts/read-model-file.mjs` — the one scanner used at build time and live, so the page can say whether the two readings agree.
- `src/styles.css` `~1937–1966` and `~2202–2209` — `.file-eyebrow`, `.file-canvas-box`, `.file-blob-controls`, `.file-page`, `.file-readout`, `.file-source`, each with its reservation comment.
- `src/content/explainers.js` `fileBlob` (already rewritten on your base) and `src/lib/realModel.js` `displayToken` (how a piece is printed: a leading space becomes `␣`).
- STATUS.md ## Important — the "Zero layout shift" bullet and the harness traps.

## Deliverables, in order

### 1. The precompute — column facts and row labels, from the file

- In `src/lib/onnxScan.js`, one new exported function `columnStatsOf(bytes, manifest, name)` for a quantized 2-D tensor: the dequantized mean and sd of every column over every row (Float64 accumulation, one pass over the bytes), returned as `{ cols, mean: Float32Array|number[], sd: … }`. It is the ONE implementation; the script and the worker both call it.
- In `scripts/read-model-file.mjs`: for `transformer.wte.weight_quantized` only, write `columnStats: { mean: [768 numbers, 4 decimals], sd: [768, 4 decimals] }` into the tensor's `windows` entry (or a sibling top-level key `columnStats` — your call, say which), and `rowLabels: [24 strings]` for the shipped window's rows, read from the tokenizer file `https://huggingface.co/Xenova/distilgpt2/resolve/main/tokenizer.json` (`model.vocab`, id → piece, printed by the same rule as `displayToken`: the `Ġ` prefix becomes `␣`; add the tokenizer's sha256 to `provenance` the way the model's is, and check it the same way). Regenerate `src/content/fileFacts.json` with `--file`. PROVE the regeneration changed nothing else: a JSON diff that lists every top-level and per-tensor key as SAME or NEW; every pre-existing value byte-identical; only the additions are new. Report the two arrays' values for slots 6, 36 and 55 and the mean-of-means / sd-of-means / median sd you compute — they must match the facts above to the printed precision.
- The standout rule, in one small pure function used by the instrument (and by your report): a column stands out when |mean − mean of means| > 4 × sd of means; its phrase is "holds nearly the same number for every word" when its sd < median sd / 20, else "runs high" / "runs low" by the sign of its mean. Applied to the shipped facts this must yield exactly {36: same, 6: low} inside columns 0–63 and eight standouts table-wide.

### 2. The live reading agrees with the shipped one

- The worker computes `columnStatsOf` for wte from the live file once the model is loaded (one message, `file-column-stats`), and the instrument compares every mean and sd to the shipped ones at 1e-4 — through the existing `noteMismatch` path, exactly as the window bytes are compared today — and compares the live `tokenText(row)` for rows 0–23 to the shipped `rowLabels`. The page's existing "agree / differ" surface says so; nothing new is invented for it.
- Row labels come from the shipped list at page 0 before the model loads, and from `tokenText` once it is loaded (every page). Nothing about the labels waits for a download at page 0.

### 3. The paint — gutters, labels, marks, hover, key

- Everything new inside the window is painted on the SAME canvas in the same draw call — no new DOM nodes inside `.file-canvas-box`, so the zero-shift story stays a canvas story. Three gutters inside the box: left (row labels), top (slot labels), bottom (the key). The cells keep today's size: grow `.file-canvas-box` by exactly the top + bottom gutter heights at every breakpoint (state the pixels: e.g. 252 → 278 at ≥ 640; at ≤ 640 only the bottom gutter for the key strip, 126 → ~138, no row or slot labels — say why in the CSS comment). `pickCell` and `onCanvasKey` map through the gutter offsets; a click in a gutter picks nothing.
- Row labels (WORDS §2) right-aligned in the left gutter in the page's mono at a size that fits one cell's height with air (measure; ~9 px at 1280), the eyebrow's colour; a row label brightens to the pick colour while its cell is picked. Slot labels (WORDS §3) over their columns; the two standout numbers in the pick colour with `▲`. The key (WORDS §4) painted by the SAME `rampColour` and the same square-root law as the cells, ticks at the values named (the last tick is `maxAbs` for the selected tensor, printed to one decimal), the sentence to its right; at ≤ 640 only the strip and the two end ticks.
- Hover: a `mousemove` on the canvas brightens the row label and slot label of the cell under the pointer (repaint only; no state that reaches the readout or the live region), `mouseleave` clears it. The readout stays click- and keyboard-driven, as today.
- Every colour from the existing tokens (`--screen`, `--frozen`, `--frozen-lit`, the eyebrow's and the pick's); no new colour, no new font, no size change to anything outside the box.

### 4. The words — eyebrow, readout, accessible name

- `blobEyebrow` returns WORDS §1 per tensor kind. `NOTHING_PICKED` and `readout` return WORDS §5: two strings (line 1 words, line 2 the arithmetic), rendered as two spans in the same `.file-readout` `<p>`, the second in a quieter class (`.file-readout-arith`, the source colour the eyebrow uses — no new colour). The idle line 2 for the word table is the standout sentence, from the rule, not a literal; for any other tensor it is empty. `aria-label` per WORDS §7.
- Reservation, the standing method: the readout box is sized per breakpoint from the LONGEST sentence a pick can print — the word-table line 1 with a 24-character piece and the standout suffix — measured in the harness at 1280, 800 and 390; two lines at ≥ 640, three at 390 unless the measurement says otherwise; state the measured widths in the report. The eyebrow keeps its ellipsis at ≥ 640 and its two wrapped lines at ≤ 640; the longest eyebrow (a block matrix) must fit two lines at 390.

### 5. Docs (yours)

- `interactive-guide-spec.md` and `README.md` wherever they describe the byte window: the labels, the key, the standout rule in one sentence each. STATUS.md is not yours; the lane records the numbers.

## Verification gauntlet — measure everything, report numbers

The control for every measurement is main (the head you branched from) in a second worktree, same harness, same run.

1. `npm run lint` and `npm run build` green; every chunk size against main. `git diff main --stat` lists only FileView.jsx, onnxScan.js, fileBytes.js, modelBytesWorker.js, the script, fileFacts.json, styles.css and the two docs.
2. **fileFacts.json** — the SAME/NEW key table from §1; the size delta in bytes; the standout rule's output.
3. **Zero CLS at runtime**, real mode, 1280 and 390, the page's standing method (buffered PerformanceObserver drained after load, plus the structural-box geometry diff), each action scored ≥ 600 ms clear of input: page load → model load (the labels switch from shipped to live) → click six cells including one in slot 36 and one in slot 6 → arrow keys across a row and down a column → a hover sweep across the window → page forward and back → tensor switch wte → wpe → h.0.attn.c_attn → h.0.ln_1.weight → wte. Every action 0.000000 on the branch. The positive control (40 px inserted at the top of the body at scroll 0) reads non-zero on both trees.
4. **The declared static change**: the geometry diff branch-vs-main shows section 01's box taller by exactly the gutter pixels and every box below it translated by exactly that amount, nothing else — report the number at each width. Instrument F untouched: `git diff main -- src/instruments/ForwardMap.jsx src/lib/forwardMap.js src/lib/tour.js` empty; quote the three viewBox attributes at 1280, 800 and 390 and they equal STATUS's (`0 0 1166 2351.6499999999996`, `0 0 1166 3210.4`, `0 0 1166 5487.599999999999`).
5. **The live cross-check**: with the model loaded, the instrument reports agreement for the window bytes, the 24 row labels and the 768 + 768 column numbers; force one disagreement in the harness (patch one shipped mean in memory) and show the existing mismatch surface fires.
6. **The words**: for the picked cell at row 17, slot 44 (word table, page 0) print both readout lines and prove line 2 equals main's readout string for the same cell minus its token suffix; print the idle lines; print the eyebrow for wte, wpe, a block matrix and an f32 vector; print the row labels for page 0 and prove they equal `! " # $ % & ' ( ) * + , - . / 0 1 2 3 4 5 6 7 8`; with the model loaded, page to rows 240–263 and show the labels `Ĵ … Ń ␣t ␣a he in re on ␣the er` cut per the rule.
7. **Reservation proof**: the longest readout sentence per band fits its reserved lines with no overflow (`scrollHeight ≤ clientHeight`) at 1280, 800, 640, 390.
8. **Keyboard**: Tab reaches the canvas; arrows move the reading and the live region updates; the focusable-control count on the page is unchanged from main.
9. **Reduced motion**: nothing here animates; confirm no new `transition`/`animation` in the diff.
10. **Scrub**: `grep -rn "/Users/\|Fable\|Opus\|Sonnet\|Haiku" src scripts interactive-guide-spec.md README.md` — hits only where they existed on main.
11. **Stills** to `design/window-for-a-novice/stills/` (gitignored; list every path in the report): 1280 — section 01 idle (labels, marks, key, the standout sentence); the cell at row 17 slot 36 picked; the same section on main for the before; 390 — the window idle and one pick.

## Environment traps (all measured on this project before)

- Dev server: `.claude/launch.json` config `fixture-and-part-dev` on 5173 serves the PRIMARY checkout, never a worktree — run your own `npx vite --port 5174` from the worktree (bash, backgrounded) for anything the harness loads, and kill it when done. HMR resets the page to illustrative mode on any source edit — reload and load the real model again (cached after the first ~83 MB fetch).
- Headless Chrome is at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; stills with `--headless --screenshot --timeout=12000`, never `--virtual-time-budget`; 390-wide needs a CDP driver with `Emulation.setDeviceMetricsOverride`; `captureBeyondViewport` DROPS imperatively transformed elements — use the viewport-clip pattern. Node here has a global `WebSocket`; a raw CDP client in a script under your scratchpad needs no package. ONE browser at a time when scoring CLS; a CDP harness with instrument F on screen sets reduced motion.
- CLS traps: the buffered observer's load flush arrives in a later task — drain it before scoring; Chrome scroll anchoring silently absorbs a positive control inserted above the anchor — use the top-of-body control at scroll 0; the observer's input exclusion hides shifts for 500 ms after any click and can outlast that under CDP.
- `git rev-parse --short a b c` fails on this git — use `--short=7` per ref.

## Commits and report

Small commits on `window-for-a-novice`, each message saying what was measured; end every message with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
Write the report to `design/window-for-a-novice/REPORT.md` and force-add it (`git add -f`; design/ is gitignored) as the last commit: what was built (files), every gauntlet number, the stills' paths, anything found and NOT fixed. Your final message is the same report. Leave the tree clean; leave the branch for the lane to verify, merge and deploy.
