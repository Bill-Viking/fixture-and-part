# BRIEF 2 — builder handback

Built headlessly on the Mac, 2026-10-28, ASTRA · XHIGH. Worktree: `/Users/bill/Projects/fixture-and-part/.claude/worktrees/company-look`. Branch `the-company-copy`; base HEAD `e8e84632d8abc205e7c734b87a2a4edb1f7e929e`. The tree was clean at arrival. The lane’s explicit assignment supplied builder authority; the F&P claim remains the caller’s. No commit, stage, push, permission change, browser, GUI, STATUS or OPENER write was made.

## Result and scope

F0–F4 are implemented. Browser acceptance belongs to the caller and is **UNRUN** here.

- `scripts/bake-pass.mjs` gains an additive figure writer after the original packet write. The original packet construction and write are unchanged. It runs the full eight-position rack again, then the seven-position prefix, reads every layer-0 head from `[1,12,n,64]`, concatenates each position into its 768-wide row, and measures both K and V over all dimensions. The repeat’s head-0 previews are asserted equal to the original pass.
- New `src/content/figFacts.json`: **9,055 bytes**, statically imported by both figures in both copies. The requested fields are present. One extra field, `rack.headWidth`, comes from the actual output dimensions so the printed “64” is also data, not a typed model constant. No PNG was needed.
- New `LadderFigure.jsx` and `LedgerFigure.jsx` use one data description apiece and two always-mounted SVGs. `factDrawing.jsx` shares SVG primitives; `figFormat.js` holds pure text wrapping, number formatting and byte decoding. Neither reads the large pass. No effect, async load, animation, focus stop or model-state dependency is added.
- `App.jsx` adds both to its stateless figure map. `essay.js` places the ladder immediately between tokenizer and forward pass, and the ledger immediately between “Would it be worth letting them change?” and “On the rack below”. The exact TENSOR gloss is immediately after PART.
- `styles.css` reserves both layouts with their viewBox aspect ratios. `company.css` changes only its single original-palette selector, adding `.ladder-svg, .ledger-svg`.
- F becomes 4, B 6, C 7, D 8, loop 9; E remains 1 and A remains 2. README and the guide’s figure table / section-10 references agree. The unchanged A comment and changed C comment in `toyModel.js` are both accounted for below. No numbered references occur in the live essay prose or claim notes. The source `FIG` sweep found no additional company-only numbered wording.

The ladder draws **1,536 byte cells per window, 3,072 per layout**. Its full wall slab has the true rows-to-columns proportion. An SVG `use` paints the same window at the slab’s true top-left footprint and a leader joins it to the magnified inset; no second dataset or extra set of cell rects is introduced. The unsigned word-table window is shaded by stored byte value; the signed wall window uses absolute signed-byte magnitude and F’s middle-96% stretch. Row 340 is outlined in the real word-table window and marked at its relative position in the tall table schematic.

## Data bake and protected-byte gate

Command: `npm run facts:pass`, bounded to 120 seconds, exit 0. Output:

```text
1 of 6 · the published bytes · 83502375 bytes · sha256 1d3ab4d7e08ca9b8ea9a42dda13a05b7ff0f1b0c9bdc4f6eba27e7f0ceff8431
2 of 6 · the graph · 14 promoted outputs · logits · present.0.key · present.0.value · cpu
3 of 6 · the tokenizer · sha256 cda20b8ca044949aa07ac4078420c80d1a57139d5f9f33700e46fb2d891e7c66 · ids [464,3113,45615,290,340,4423,866,13]
4 of 6 · the pass · n 8 · ids [464,3113,45615,290,340,4423,866,13] · tokens ["The","␣engine","␣roared","␣and","␣it","␣shut","␣down","."] · ‖residual‖ 5.0 → 1816.7
5 of 6 · the names · top 8 "⏎" 0.3149584611434227 · "␣The" 0.14010734374860398 · "␣It" 0.07171751146390971 · "<|endoftext|>" 0.025581227725666345 · "␣He" 0.022054415764321125 · "␣A" 0.01885004238814804 · "␣But" 0.015258243264195672 · "␣Then" 0.013121804667761293 · nextToken "␣The" · decode greedy · all top 8 names present
6 of 6 · the file · src/content/passFacts.json · 527411 bytes · gzip 361727 bytes
6 of 6 · the figures · src/content/figFacts.json · 9055 bytes · hero 340 verified · largest rack move 0 · values up to 7.787245750427246
```

| File | SHA-256 before | SHA-256 after |
|---|---|---|
| passFacts.json | `1b7a5be47dd726ba5010389a838afec8469bca6806cf6b884c511520762c2059` | `1b7a5be47dd726ba5010389a838afec8469bca6806cf6b884c511520762c2059` |
| bakedPass.js | `3767c4ea8f7822516db723c7506b27617b31b558b9e21f668fcc81dcf1f28a29` | `3767c4ea8f7822516db723c7506b27617b31b558b9e21f668fcc81dcf1f28a29` |
| passCore.js | `6c5e3593a469c827cfc5f17e26091e080f59bedd321106bc4655676b79f628d1` | `6c5e3593a469c827cfc5f17e26091e080f59bedd321106bc4655676b79f628d1` |

The pass hash was read before the first edit and checked again after baking and at handback. STATUS.md and OPENER.md are byte-identical to HEAD. A string-equality check proves company.css is exactly HEAD with the two new selectors inserted, with no other alteration.

The actual measured row moves are `k = [0,0,0,0,0,0,0]`, `v = [0,0,0,0,0,0,0]`. The figure prints seven **same** readings, `0.0000` largest move and `7.8` maximum absolute value. Zero is this real prefix pair’s measurement, not an assertion about every sentence or deeper layer. The code’s `// ASSUMES:` comment names causal masking and whole-sequence dynamic quantization.

The actual `compareRows` function was extracted from the bake script and imported as a Node data module for its opposite-case check: two identical 768-wide rows → **0**; change only dimension 767 by 0.125 → **0.125**. Mismatched widths and non-finite values also throw. A separate in-memory React render supplied counterfactual move summaries: 0.0001 → **moved 0.0001**, a V-only 0.125 → **moved 0.1250**, and 0.000099 → **same**, in both layouts. The JSON on disk was not changed for that check.

Independent Node checks also verified both windows byte-for-byte against fileFacts, all K/V previews against the original pass, hero id 340, all six dequantized embedding values within 1e-6, the rim’s first six values, and every full-width hero norm decoded independently from the existing pass’s float bytes.

## Lint, builds and bundles

- `npm run lint`: exit 0; only the existing `AttentionInspector.jsx:55` exhaustive-deps warning. No new lint warning and no suppression added.
- `npm run build -- --configLoader native`: exit 0, 374 ms on the final run.
- `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co`: exit 0, 111 ms on the final run.
- Both retain Vite’s existing large-chunk advisory. No threshold or safety check was disabled.
- `git diff --check`: pass. Staged diff empty.

| Copy | Main bundle | passFacts chunk | grep -c of FIG.1 through FIG.9 followed by “ —” |
|---|---|---|---|
| dist | `index-BTvpTQFK.js` (459,938 B) | none | 1 1 1 1 1 1 1 1 1 |
| dist-co | `index--Sn4O79F.js` (448,058 B) | `passFacts-B2tslikF.js` | 1 1 1 1 1 1 1 1 1 |

Each full new caption and the full TENSOR gloss occurs exactly once in each bundle. Every numbered caption’s `grep -c` is 1 as requested. **Counting detail:** `grep -c` counts matching lines, not occurrences. The ladder, ledger and loop prefix each occurs twice literally, once in its required eyebrow and once in its required caption; each is still one figure with one caption. The loop’s pre-existing “A drawing…” sentence also remains in both its purpose and caption. No old number remains attached to the wrong live figure. `passFacts.json` has exactly one source import, inside `loadBakedPass`.

## Node rendering, fixed geometry and text floor

ReactDOMServer rendered each component for consumer and company flags, using the installed Rolldown transformer entirely in memory. Python’s XML parser inspected each SVG. Assertions passed for:

- Both SVGs present, distinct ids, `role="img"`, accessible labels, `focusable="false"`, and no interactive elements.
- Exact prescribed text, with wrapped tspan text rejoined character-for-character; each full figure caption once; the extra TeachPair `a` line present only in the company copy.
- All six bytes and dequantized numbers; all seven formatted stream lengths; every K/V value in the rack and both sides of the comparison; row 340; eight rack rows (seven stamped, one arriving); seven arrows from the arriving row toward earlier rows only; the seven move readings.
- Fixed mono text bounds and pairwise text rectangles: no panel overflow or text collision in either layout. This is a mathematical geometry check, not a browser font/paint proof.

| Drawing | ViewBox / CSS ratio | SVG markup per copy | Text elements | Smallest type, viewBox units |
|---|---|---:|---:|---:|
| Ladder wide | 680 / 700 | 385,581 B | 32 | 12.4 |
| Ladder stacked | 300 / 1540 | 361,356 B | 32 | 10.5 |
| Ledger wide | 680 / 1260 | 32,042 B | 347 | 12.4 |
| Ledger stacked | 300 / 1930 | 31,732 B | 347 | 10.5 |

The two copies render byte-identical SVG markup. No raster fallback was needed: even the larger ladder layout is under 400,000 B. Wide is displayed only above 640 px; stacked only at or below 640 px, capped at 360 px exactly like the loop.

| Window | Displayed layout | Available SVG width from CSS | Smallest visible text |
|---|---|---:|---:|
| 390 px | stacked | 390 − 36 wrap padding − 2 frame − 32 body padding = 320 px | 10.5 × 320 / 300 = **11.20 px** |
| 641 px | wide | 641 − 48 wrap padding − 2 frame − 32 body padding = 559 px | 12.4 × 559 / 680 = **10.1935 px** |

The source comments and first Node check use the loop’s more conservative 308 px narrow-width allowance: **10.78 px**, also passing. The inactive layouts are `display:none`, so have no rendered text floor at those widths. For completeness, their hypothetical scales if shown would be 5.8353 px for wide at 390 and 12.60 px for the capped stacked SVG at 641; CSS never shows those combinations. These calculations apply to both figures and both copies. Every `text` declares its size; tspans inherit it.

The glossary now has ten entries. `Glossary` uses `entries.length`, `Math.ceil(entries.length / 2)` and per-string line counts. Source and Node checks found no nine-entry assumption. Its new entry’s wrapping participates in the existing count-driven reservation.

### Checks that did not supply proof

The first Vite SSR approach failed on an EPERM unlink in the shared `node_modules/.vite/deps` cache. It was abandoned without widening permissions; the final Node render uses in-memory bundling and does not open a server or browser. An initial direct Rolldown test used the wrong location for its define option, and an initial counterfactual loader returned JavaScript to a JSON loader; both harness issues were corrected before the successful checks above. They are not counted as passes.

**UNRUN — caller’s browser proofs:** CLS (load, fonts, model load, interaction), box heights in all four readings, viewport paint/overflow, rendered contrast, and visible appearance in both copies. No browser or GUI application was launched. Aspect-ratio reservations and Node geometry are implemented and checked; browser zero shift is not claimed.

## Figure-reference audit

The search used `rg --hidden --no-ignore -n -o 'FIG\.[A-Za-z0-9]+'` across this worktree, including ignored design records and builder logs. Only git internals, node_modules, generated dist directories and this self-referential report were excluded. Generated bundles were checked separately above. The `FIG` sweep of src was also run; incidental `FIG` substrings in base64 JSON are encoded data, not figure references, and were left byte-for-byte intact.

Every matching source/reference line at the audit snapshot is listed below, with repeated occurrences counted. Historical design logs are immutable, including the caller-owned log of this run; their line counts can grow after this snapshot. Protected history is left as written. The guide’s numeric table (which has no literal FIG dot in its rows) was separately updated to **E 1 · A 2 · ladder 3 · F 4 · ledger 5 · B 6 · C 7 · D 8 · loop 9**.

| Location | All matched references on that line | Action / reason |
|---|---|---|
| `README.md:158` | FIG.1 | LEFT — E stays 1; A stays 2 |
| `README.md:159` | FIG.2 | LEFT — E stays 1; A stays 2 |
| `README.md:160` | FIG.3 | NEW — ladder / ledger layout entry |
| `README.md:162` | FIG.4 | CHANGED — reading-order renumbering |
| `README.md:163` | FIG.5 | NEW — ladder / ledger layout entry |
| `README.md:165` | FIG.6 | CHANGED — reading-order renumbering |
| `README.md:167` | FIG.7 | CHANGED — reading-order renumbering |
| `README.md:169` | FIG.8 | CHANGED — reading-order renumbering |
| `README.md:170` | FIG.9 | CHANGED — reading-order renumbering |
| `STATUS.md:153` | FIG.8 | LEFT — explicitly protected state / history |
| `STATUS.md:157` | FIG.8 | LEFT — explicitly protected state / history |
| `STATUS.md:165` | FIG.7 ×2 | LEFT — explicitly protected state / history |
| `STATUS.md:370` | FIG.8, FIG.7 | LEFT — explicitly protected state / history |
| `STATUS.md:383` | FIG.7 | LEFT — explicitly protected state / history |
| `STATUS.md:384` | FIG.7 | LEFT — explicitly protected state / history |
| `STATUS.md:386` | FIG.7 | LEFT — explicitly protected state / history |
| `STATUS.md:401` | FIG.3 | LEFT — explicitly protected state / history |
| `STATUS.md:441` | FIG.8 | LEFT — explicitly protected state / history |
| `STATUS.md:457` | FIG.7 | LEFT — explicitly protected state / history |
| `design/f-for-a-reader/REPORT.md:31` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/BRIEF-1-RUN-20261028-1152-sol-42e9.log:16` | FIG.8 ×4, FIG.7 ×7, FIG.3 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-1-RUN-20261028-1152-sol-42e9.log:37` | FIG.6 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-1-RUN-20261028-1152-sol-42e9.log:43` | FIG.6 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-1-RUN-20261028-1152-sol-42e9.log:85` | FIG.6 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-1b-RUN-20261028-1215-sol-1136.log:42` | FIG.8 ×4, FIG.7 ×7, FIG.3 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-1b-RUN-20261028-1215-sol-1136.log:48` | FIG.6 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-1b-RUN-20261028-1215-sol-1136.log:52` | FIG.2 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-1b-RUN-20261028-1215-sol-1136.log:54` | FIG.7 ×2 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-1b-RUN-20261028-1215-sol-1136.log:60` | FIG.7 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:12` | FIG.8 ×2, FIG.1, FIG.2, FIG.3, FIG.4, FIG.5, FIG.6, FIG.7 ×17, FIG.N | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:37` | FIG.8 ×4, FIG.7 ×7, FIG.3 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:41` | FIG.7 ×13, FIG.1 ×2, FIG.2 ×3, FIG.3 ×2, FIG.4 ×2, FIG.5 ×3, FIG.6 ×2 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:43` | FIG.7 ×3, FIG.1, FIG.2, FIG.3, FIG.4, FIG.5, FIG.6 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:52` | FIG.2 ×6, FIG.5 ×5, FIG.7 ×16, FIG.1 ×4, FIG.3 ×3, FIG.4 ×3, FIG.6 ×3 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:58` | FIG.3 ×2, FIG.5 ×2 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:59` | FIG.3 ×2, FIG.5 ×2 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:67` | FIG.9 ×11, FIG.1 ×2, FIG.2 ×3, FIG.3 ×5, FIG.4 ×2, FIG.5 ×5, FIG.6 ×2, FIG.7 ×3, FIG.8 ×2 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:76` | FIG.1 ×3, FIG.2 ×4, FIG.3 ×6, FIG.4 ×3, FIG.5 ×6, FIG.6 ×3, FIG.7 ×4, FIG.8 ×3, FIG.9 ×7 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:78` | FIG.9 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:86` | FIG.1 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:87` | FIG.1 ×3 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2-RUN-20261028-1243-astra-bab6.log:97` | FIG.2 ×2, FIG.1 ×2, FIG.3 ×2, FIG.5 ×2, FIG.9 | LEFT — protected historical build log; snapshot only |
| `design/reading-pass-2026-10-28/BRIEF-2.md:51` | FIG.N ×2 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/BRIEF-2.md:63` | FIG.M ×2 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/BRIEF-2.md:67` | FIG.1, FIG.2, FIG.3, FIG.4, FIG.5, FIG.6, FIG.7, FIG.8, FIG.9, FIG.N | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/BRIEF-2.md:79` | FIG.9, FIG.3, FIG.5, FIG.N | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/FIG-MAP.md:7` | FIG.8 ×2 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/FIG-MAP.md:11` | FIG.1 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/FIG-MAP.md:12` | FIG.2 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/FIG-MAP.md:13` | FIG.3 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/FIG-MAP.md:14` | FIG.4 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/FIG-MAP.md:15` | FIG.5 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/FIG-MAP.md:16` | FIG.6 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/FIG-MAP.md:17` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/FIG-MAP.md:19` | FIG.N, FIG.7 ×4 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/FIG-MAP.md:23` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/reading-pass-2026-10-28/FIG-MAP.md:38` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-company-copy/BRIEF-A2-RUN-20261025-1255-astra-2ba4.log:39` | FIG.8 ×3, FIG.7 ×7, FIG.3 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BRIEF-A2-RUN-20261025-1255-astra-2ba4.log:45` | FIG.8 ×2, FIG.7 ×2 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BRIEF-A2-RUN-20261025-1255-astra-2ba4.log:49` | FIG.8, FIG.7 ×4, FIG.3 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BRIEF-A2-RUN-20261025-1255-astra-2ba4.log:51` | FIG.7 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BRIEF-A2-RUN-20261025-1255-astra-2ba4.log:55` | FIG.7 ×4 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BRIEF-A2-RUN-20261025-1255-astra-2ba4.log:67` | FIG.7 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BRIEF-WORDS-RUN-20261027-2207-sol-4a74.log:35` | FIG.8 ×3, FIG.7 ×7, FIG.3 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BRIEF-WORDS-RUN-20261027-2207-sol-4a74.log:41` | FIG.7 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BRIEF-WORDS-RUN-20261027-2207-sol-4a74.log:43` | FIG.7 ×2 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BUILD-BRIEF-PASS-RUN-20261027-2151-sol-0f26.log:39` | FIG.8 ×3, FIG.7 ×7, FIG.3 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BUILD-BRIEF-PASS-RUN-20261027-2151-sol-0f26.log:82` | FIG.3 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BUILD-BRIEF-RUN-20261025-1202-astra-915f.log:35` | FIG.8 ×3, FIG.7 ×7, FIG.3 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/BUILD-BRIEF-RUN-20261025-1202-astra-915f.log:42` | FIG.7 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/DRESS-BRIEF-RUN-20261025-0955-astra-8f91.log:29` | FIG.8 ×3, FIG.7 ×6, FIG.3 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/DRESS-BRIEF-RUN-20261025-0955-astra-8f91.log:33` | FIG.7 ×2 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/DRESS-BRIEF-RUN-20261025-0955-astra-8f91.log:46` | FIG.7 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/DRESS-BRIEF-RUN-20261025-0955-astra-8f91.log:50` | FIG.1 ×3, FIG.2 | LEFT — protected historical build log; snapshot only |
| `design/the-company-copy/WORDS-CONSUMER-BEFORE-index-CdkDlCqv.js:10` | FIG.2, FIG.4, FIG.5, FIG.6, FIG.3, FIG.1, FIG.7 ×2 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/BUILD-BRIEF.md:1` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/BUILD-BRIEF.md:15` | FIG.6 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/BUILD-BRIEF.md:23` | FIG.7 ×2 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/BUILD-BRIEF.md:33` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/REPORT.md:1` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/REPORT.md:9` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/REPORT.md:13` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/REPORT.md:16` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/REPORT.md:23` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/REPORT.md:33` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/REPORT.md:37` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/WORDS.md:37` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-loop-and-the-landing/WORDS.md:38` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-readers-footing/REPORT.md:48` | FIG.7 | LEFT — protected design record / historical artifact |
| `design/the-seam/REPORT.md:354` | FIG.4 | LEFT — protected design record / historical artifact |
| `interactive-guide-spec.md:632` | FIG.9 | CHANGED — reading-order renumbering |
| `interactive-guide-spec.md:634` | FIG.9 | CHANGED — reading-order renumbering |
| `interactive-guide-spec.md:638` | FIG.9 ×3 | CHANGED — reading-order renumbering |
| `src/figures/LadderFigure.jsx:8` | FIG.3 | NEW — current drawing |
| `src/figures/LadderFigure.jsx:135` | FIG.3 | NEW — current drawing |
| `src/figures/LadderFigure.jsx:137` | FIG.3 | NEW — current drawing |
| `src/figures/LedgerFigure.jsx:5` | FIG.5 | NEW — current drawing |
| `src/figures/LedgerFigure.jsx:148` | FIG.5 | NEW — current drawing |
| `src/figures/LedgerFigure.jsx:150` | FIG.5 | NEW — current drawing |
| `src/figures/LoopFigure.jsx:5` | FIG.9 | CHANGED — reading-order renumbering |
| `src/figures/LoopFigure.jsx:277` | FIG.9 | CHANGED — reading-order renumbering |
| `src/figures/LoopFigure.jsx:288` | FIG.9 | CHANGED — reading-order renumbering |
| `src/instruments/AttentionInspector.jsx:292` | FIG.7 | CHANGED — reading-order renumbering |
| `src/instruments/FileView.jsx:1770` | FIG.1 | LEFT — E stays 1; A stays 2 |
| `src/instruments/ForwardMap.jsx:3816` | FIG.4 | CHANGED — reading-order renumbering |
| `src/instruments/GlassPass.jsx:297` | FIG.8 | CHANGED — reading-order renumbering |
| `src/instruments/Stepper.jsx:450` | FIG.6 | CHANGED — reading-order renumbering |
| `src/instruments/Tokenizer.jsx:122` | FIG.2 | LEFT — E stays 1; A stays 2 |
| `src/lib/toyModel.js:120` | FIG.2 | LEFT — E stays 1; A stays 2 |
| `src/lib/toyModel.js:377` | FIG.7 | CHANGED — reading-order renumbering |
| `src/styles.css:425` | FIG.9 | CHANGED — reading-order renumbering |
| `src/styles.css:433` | FIG.9 | CHANGED — reading-order renumbering |
| `src/styles.css:464` | FIG.3, FIG.5 | NEW — fixed-layout styles |
| `the-fixture-and-the-part.html:104` | FIG.1 | LEFT — founding static draft; live essay is src/content/essay.js |
| `the-fixture-and-the-part.html:143` | FIG.2 | LEFT — founding static draft; live essay is src/content/essay.js |

## Handoff state

New source files: `src/content/figFacts.json`, `src/figures/LadderFigure.jsx`, `src/figures/LedgerFigure.jsx`, `src/figures/factDrawing.jsx`, `src/figures/figFormat.js`. All modified and new source remains unstaged. This report is under the repository’s ignored design directory, as requested; it is written, not staged. The caller owns browser acceptance and any subsequent commit or publish.

Status snapshot before the final report write (the exact `git status --short` command is run again last):

```text
 M README.md
 M interactive-guide-spec.md
 M scripts/bake-pass.mjs
 M src/App.jsx
 M src/company.css
 M src/content/essay.js
 M src/figures/LoopFigure.jsx
 M src/instruments/AttentionInspector.jsx
 M src/instruments/ForwardMap.jsx
 M src/instruments/GlassPass.jsx
 M src/instruments/Stepper.jsx
 M src/lib/toyModel.js
 M src/styles.css
?? src/content/figFacts.json
?? src/figures/LadderFigure.jsx
?? src/figures/LedgerFigure.jsx
?? src/figures/factDrawing.jsx
?? src/figures/figFormat.js
```

The final render check also compared both copies’ SVG markup byte-for-byte, verified all SVG ids are unique, proved each ledger read arrow ends above its source, and resolved the wall window’s SVG reuse transform: its top-left coordinate and both axis ratios match the tensor’s actual window footprint to 1e-8.

## Reproduce the Node render proof

This command uses the installed bundler in memory, opens no server or browser, and bounds the Node subprocess to 60 seconds. It writes no files.

```sh
python3 - <<'PY'
import subprocess,json,re,xml.etree.ElementTree as ET
node=r'''
import {rolldown} from 'rolldown';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url);
const result={};
for(const company of [false,true]){
 result[company?'company':'consumer']={};
 for(const figure of ['Ladder','Ledger']) {
  const b=await rolldown({input:`src/figures/${figure}Figure.jsx`,platform:'node',transform:{define:{'import.meta.env.VITE_COMPANY':JSON.stringify(company?'1':'0')},jsx:'react-jsx'},external:(s)=>s.endsWith('.css')||s==='@huggingface/transformers',plugins:[{name:'node-react',resolveId(s){if(s==='react'||s.startsWith('react/'))return{id:pathToFileURL(require.resolve(s)).href,external:true}}}]});
  const {output}=await b.generate({format:'esm'});await b.close();
  if(output.length!==1)throw Error('expected one in-memory SSR chunk');
  const {default:Component}=await import('data:text/javascript;base64,'+Buffer.from(output[0].code).toString('base64'));
  result[company?'company':'consumer'][figure]=renderToStaticMarkup(React.createElement(Component));
 }
}
console.log(JSON.stringify(result));
'''
p=subprocess.run(['node','--input-type=module','-e',node],capture_output=True,text=True,timeout=60)
if p.returncode: print(p.stderr[:3000]);raise SystemExit(p.returncode)
renders=json.loads(p.stdout)
f=json.load(open('src/content/figFacts.json'))
problems=[]
for figure in ['Ladder','Ledger']:
 a=re.findall(r'<svg\b.*?</svg>',renders['consumer'][figure],re.S)
 b=re.findall(r'<svg\b.*?</svg>',renders['company'][figure],re.S)
 assert a==b
for copy, figures in renders.items():
 ids=re.findall(r'\bid="([^"]+)"',''.join(figures.values()))
 assert len(ids)==len(set(ids))
for copy,figures in renders.items():
 for figure,html in figures.items():
  assert html.count('<figcaption>')==1
  assert not re.search(r'<(?:button|input|a)\b|tabindex=',html)
  for svgtext in re.findall(r'<svg\b.*?</svg>',html,re.S):
   svg=ET.fromstring(svgtext); layout=svg.get('class').split()[-1];vb=list(map(float,svg.get('viewBox').split()));texts=svg.findall('.//text');size=min(float(t.get('font-size')) for t in texts)
   assert all(t.get('font-size') for t in texts)
   active_scale=(308/300 if 'stacked' in layout else 559/680)
   print(copy,layout,'bytes',len(svgtext.encode()),'texts',len(texts),'smallest units',size,'floor px',round(size*active_scale,4))
   assert svg.get('role')=='img' and svg.get('focusable')=='false'
   if figure=='Ladder':
    windows=svg.findall('.//g[@data-byte-window]');assert len(windows)==2
    assert len(windows[0].findall('rect'))==1538 and len(windows[1].findall('rect'))==1537
    assert svg.find('.//rect[@data-hero-row]').get('data-hero-row')==str(f['hero']['id'])
    for t in svg.findall('.//text[@data-byte]'): assert t.text==str(f['wte']['heroRowFirst6Bytes'][int(t.get('data-byte'))])
    for t in svg.findall('.//text[@data-embedding]'): assert t.text==format(f['wte']['heroRowFirst6'][int(t.get('data-embedding'))],'.2f')
    for g in svg.findall('.//g[@data-stream-depth]'):
     v=f['stream']['heroLengths'][int(g.get('data-stream-depth'))];assert g.find('text').text==format(v,'.1f' if v<100 else '.0f')
    assert len(svgtext.encode())<400*1024
    panel=svg.find('.//g[@data-panel="tensor"]')
    use=panel.find('use')
    win=panel.find('.//g[@data-byte-window="wall"]')
    assert use.get('href')=='#'+win.get('id')
    vals=list(map(float,re.findall(r'-?[0-9]+(?:\.[0-9]+)?(?:e[-+]?[0-9]+)?',use.get('transform'))))
    tx,ty,scale=vals
    wx,wy=map(float,re.findall(r'-?[0-9]+(?:\.[0-9]+)?',win.get('transform')))
    slab=panel.findall('rect')[1]
    assert abs(tx+wx*scale-float(slab.get('x')))<1e-8
    assert abs(ty+wy*scale-float(slab.get('y')))<1e-8
    winrect=win.find('rect')
    assert abs(float(winrect.get('width'))*scale/float(slab.get('width'))-f['wall']['window']['cols']/f['wall']['cols'])<1e-8
    assert abs(float(winrect.get('height'))*scale/float(slab.get('height'))-f['wall']['window']['rows']/f['wall']['rows'])<1e-8
   else:
    assert len(svg.findall('.//g[@data-rack-row]'))==len(f['tokens'])
    assert len(svg.findall('.//g[@data-state="stamped"]'))==7
    assert len(svg.findall('.//g[@data-state="arriving"]'))==1
    assert len(svg.findall('.//path[@data-reads-row]'))==7
    for arrow in svg.findall('.//path[@data-reads-row]'):
     coords=list(map(float,re.findall(r'-?[0-9]+(?:\.[0-9]+)?',arrow.get('d'))))
     assert coords[-1]<coords[1] and int(arrow.get('data-reads-row'))<len(f['tokens'])-1
    for g in svg.findall('.//g[@data-values]'):
     source,role,row=g.get('data-values').split('-');row=int(row)
     data=f['rack']['before'] if source=='before' else f['rack']
     numbers=[t.text for t in g.findall('text')][1:]
     assert numbers==[format(v,'.2f') for v in data[role][row]],(source,role,row,numbers)
    for t in svg.findall('.//text[@data-move-row]'):
     i=int(t.get('data-move-row'));k=f['rack']['moved']['k'][i];v=f['rack']['moved']['v'][i]
     expected='same' if k<1e-4 and v<1e-4 else 'moved '+format(max(k,v),'.4f')
     assert ''.join(t.itertext())==expected

   strings=[''.join(t.itertext()) for t in texts]
   if figure=='Ladder':
    comma=lambda n: format(n,',')
    lens=lambda n: format(n,'.1f' if n<100 else '.0f')
    w=f['wte'];wall=f['wall'];hero=f['hero']
    expected=[
     f"id {hero['id']} · piece {comma(hero['id']+1)} of {comma(w['rows'])} in the word table",
     f"{comma(w['rows'])} rows × {comma(w['cols'])} numbers · stored as one byte each, {w['dtype']}, scale {w['scale']:.4f}, zero point {w['zeroPoint']} · {comma(w['bytes'])} bytes",
     f"{comma(w['cols'])} numbers; these are the first six · (byte − {w['zeroPoint']}) × {w['scale']:.4f} · the same six instrument A prints when the model is loaded",
     f"its first stop: wte + wpe, {lens(f['rim']['heroLength'])} long · every block adds to the same running vector · {lens(f['rim']['heroLength'])} → {lens(f['stream']['heroLengths'][-1])} by the last wall",
     f"{comma(wall['rows'])} rows × {comma(wall['cols'])} columns · stored as one signed byte each, {wall['dtype']}, scale {wall['scale']:.4f}, zero point {wall['zeroPoint']} · {comma(wall['bytes'])} bytes · frozen: no pass changes one",
     f"+ wpe[{hero['index']}]"
    ]
   else:
    r=f['rack']
    expected=[
     f"token {len(f['tokens'])} arrives: it writes its own row and reads the seven above · layer {r['layer']}, head {r['head']}, the first six of {r['headWidth']} · nothing points down",
     'in a deployment these rows are stored once and reused: byte for byte the same',
     f"this page’s model re-runs the whole sentence each step and its rounding can nudge a row — the largest move measured here: {r['moved']['max']:.4f} against values up to {r['moved']['maxAbsValue']:.1f}",
     'sections 05 and 06: check the memory out, edit it, write it back, forget most of the rest',
     'the one thing the rack never does'
    ]
   for s in expected: assert strings.count(s)==1,(layout,s,strings)

   # Mono line bounds in local panels. Geometry, not browser paint.
   for panel in svg.findall('.//g[@data-panel]'):
    rect=panel.find('rect');pw=float(rect.get('width'));ph=float(rect.get('height'));glyphs=[]
    for t in panel.findall('.//text'):
     fs=float(t.get('font-size'));x=float(t.get('x'));y=float(t.get('y'));anchor=t.get('text-anchor','start')
     spans=t.findall('tspan') or [t]
     for sp in spans:
      if sp is not t:
       x=float(sp.get('x',x));y+=float(sp.get('dy',0))
      content=''.join(sp.itertext());width=len(content)*fs*.6;left=x-width if anchor=='end' else x-width/2 if anchor=='middle' else x
      if left < 3 or left+width>pw-3 or y+fs*.25>ph-3:
       problems.append((layout,panel.get('data-panel'),'bounds',content,round(left,2),round(left+width,2),y,pw,ph))
      glyphs.append((left,y-fs*.8,width,fs,content))
    for i,a in enumerate(glyphs):
     for b in glyphs[i+1:]:
      if min(a[0]+a[2],b[0]+b[2])-max(a[0],b[0])>.8 and min(a[1]+a[3],b[1]+b[3])-max(a[1],b[1])>.8:
       problems.append((layout,panel.get('data-panel'),'text collision',a[4],b[4]))
 assert ('instrument A above prints stand-ins in this copy; this drawing prints the real row.' in figures['Ladder'])==(copy=='company')
 print(copy,'captions once; note gated; bytes, vectors, norms, K/V previews and move readings match; rack 8 rows, 7 upward arrows; no focusables')
for p in problems: print('GEOMETRY',p)
assert not problems
print('PASS: fixed mono geometry, no text collisions or panel overflow; browser paint not tested')
PY
```

DONE — Two file-backed figures built and renumbered; headless checks pass; browser proofs UNRUN.
