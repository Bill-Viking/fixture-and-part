
# FIG.7 — THE THREE DIES · build report

Renumber applied in fixed order 9 → 10, 8 → 9, 7 → 8, before adding the new FIG.7. Lines below refer to the clean pre-edit tree; final-line mappings follow at handback.

| File and original line | Before | After |
| --- | --- | --- |
| `src/styles.css:444` | `FIG.9` | `FIG.10` |
| `src/styles.css:452` | `FIG.9` | `FIG.10` |
| `src/styles.css:466` | `FIG.7` | `FIG.8` |
| `src/styles.css:466` | `FIG.9` | `FIG.10` |
| `src/content/essay.js:60` | `FIG.8` | `FIG.9` |
| `src/content/essay.js:61` | `FIG.8` | `FIG.9` |
| `src/App.jsx:1067` | `FIG.8` | `FIG.9` |
| `src/instruments/AttentionInspector.jsx:67` | `FIG.7` | `FIG.8` |
| `src/instruments/AttentionInspector.jsx:298` | `FIG.7` | `FIG.8` |
| `src/instruments/GlassPass.jsx:181` | `FIG.8` | `FIG.9` |
| `src/instruments/GlassPass.jsx:301` | `FIG.8` | `FIG.9` |
| `src/figures/LoopFigure.jsx:5` | `FIG.9` | `FIG.10` |
| `src/figures/LoopFigure.jsx:277` | `FIG.9` | `FIG.10` |
| `src/figures/LoopFigure.jsx:288` | `FIG.9` | `FIG.10` |
| `src/lib/tour.js:362` | `FIG.8` | `FIG.9` |
| `README.md:47` | `FIG.7` | `FIG.8` |
| `README.md:48` | `FIG.8` | `FIG.9` |
| `README.md:165` | `FIG.7` | `FIG.8` |
| `README.md:166` | `FIG.8` | `FIG.9` |
| `README.md:167` | `FIG.9` | `FIG.10` |

## Lint

Command: `npm run lint`; timeout 120 seconds; offline package resolution. Exit 0.

```text

> fixture-and-part-interactive@0.0.0 lint
> oxlint

src/instruments/AttentionInspector.jsx:57:45: warning react-hooks(exhaustive-deps): React hook useMemo depends on `rows`, which changes every render help: Try memoizing this variable with `useRef` or `useCallback`.
```

## Public build

Command: `npx vite build --configLoader native`; timeout 120 seconds; offline package resolution. Exit 0.

```text
vite v8.2.1 building client environment for production...
[2K
transforming...✓ 82 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                                 1.20 kB │ gzip:     0.61 kB
dist/assets/modelBytesWorker-DmcLa0tD.js                       10.63 kB
dist/assets/ort-wasm-simd-threaded.asyncify-DMmc6YqF.wasm  23,567.05 kB │ gzip: 5,824.05 kB
dist/assets/index-CRJxvl6n.css                                 60.51 kB │ gzip:    11.91 kB
dist/assets/preload-helper-CXLjVLnu.js                          1.81 kB │ gzip:     0.98 kB
dist/assets/fileFacts-DKLLE9gH.js                             232.50 kB │ gzip:    96.13 kB
dist/assets/index-DI87uZWP.js                                 483.86 kB │ gzip:   164.64 kB
dist/assets/transformers.web-Bn-x9T4f.js                      550.54 kB │ gzip:   156.46 kB

✓ built in 654ms
[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
```

## Company build

Command: `VITE_COMPANY=1 npx vite build --configLoader native --outDir dist-co`; timeout 120 seconds; offline package resolution. Exit 0.

```text
vite v8.2.1 building client environment for production...
[2K
transforming...✓ 63 modules transformed.
rendering chunks...
computing gzip size...
dist-co/index.html                             0.90 kB │ gzip:   0.48 kB
dist-co/assets/modelBytesWorker-DmcLa0tD.js   10.63 kB
dist-co/assets/company-BW7JYhxl.css           14.30 kB │ gzip:   3.20 kB
dist-co/assets/index-CRJxvl6n.css             60.51 kB │ gzip:  11.91 kB
dist-co/assets/fileFacts-DKLLE9gH.js         232.50 kB │ gzip:  96.13 kB
dist-co/assets/index-C-P35jPA.js             474.21 kB │ gzip: 161.03 kB
dist-co/assets/passFacts-B2tslikF.js         527.37 kB │ gzip: 360.66 kB

✓ built in 119ms
[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
```

## Headless proof

Both copies were server-rendered from Vite-built in-memory modules using their actual config defines. No browser or GUI was launched. This checks built component markup, not a browser DOM or screenshot. All 34 WORDS entries match UTF-8 bytes in both renders, including each token and printed weight. SVG text contains no unlisted strings. Each copy has two fixed SVGs, fourteen book groups, unique IDs, resolved marker/pattern references, and no focusable controls or animation elements. The shipped client bundles contain the drawing. The mount is after section 04’s first paragraph and before its second. The first check attempt incorrectly treated the brief’s helper-name code span, “integer”, as a page string; the extraction was corrected to exclude instruction-only code spans and the check rerun successfully.

### Every WORDS string

| String | Where | Public byte-equal | Company byte-equal |
| --- | --- | --- | --- |
| `FIG.7 — THE THREE DIES` | InstrumentHead badge | yes | yes |
| `One token, three dies, one lookup` | InstrumentHead title | yes | yes |
| `A drawing, not an instrument: nothing here runs. One token of the page’s own sentence, pressed through the three dies of one block and looked up against the words before it, with the weights one head really gave them.` | InstrumentHead reading | yes | yes |
| `FIG.7 — A drawing, not an instrument: nothing here runs. The weights are real: layer 0, head 0, the page’s own sentence.` | figcaption | yes | yes |
| `one row · 768 numbers` | Frame 1 · both layouts | yes | yes |
| `q die` | Frame 1 · both layouts | yes | yes |
| `k die` | Frame 1 · both layouts | yes | yes |
| `v die` | Frame 1 · both layouts | yes | yes |
| `cols 0–767` | Frame 1 · both layouts | yes | yes |
| `cols 768–1535` | Frame 1 · both layouts | yes | yes |
| `cols 1536–2303` | Frame 1 · both layouts | yes | yes |
| `h.0 attn.c_attn · 768 × 2,304 · one wall, three dies` | Frame 1 · both layouts | yes | yes |
| `Q · what I am looking for` | Frame 1 · both layouts | yes | yes |
| `K · what I answer to` | Frame 1 · both layouts | yes | yes |
| `V · what I hand over` | Frame 1 · both layouts | yes | yes |
| `Q of ␣down, held against every spine` | Frame 2 · both layouts | yes | yes |
| `shares of one budget · they add to 1.00` | Frame 2 · both layouts | yes | yes |
| `␣down, after the lookup` | Frame 2 · both layouts | yes | yes |
| `the three dies: one wall of frozen weights, h.0 attn.c_attn, cut into its query, key and value thirds` | Frame 1 hover title · both layouts | yes | yes |
| `the lookup: one head’s softmax weights for ␣down over the words before it, layer 0 head 0` | Frame 2 hover title · both layouts | yes | yes |
| `The` | Frame 2 spine; ␣down also Frame 1 strip · both layouts | yes | yes |
| `␣engine` | Frame 2 spine; ␣down also Frame 1 strip · both layouts | yes | yes |
| `␣roared` | Frame 2 spine; ␣down also Frame 1 strip · both layouts | yes | yes |
| `␣and` | Frame 2 spine; ␣down also Frame 1 strip · both layouts | yes | yes |
| `␣it` | Frame 2 spine; ␣down also Frame 1 strip · both layouts | yes | yes |
| `␣shut` | Frame 2 spine; ␣down also Frame 1 strip · both layouts | yes | yes |
| `␣down` | Frame 2 spine; ␣down also Frame 1 strip · both layouts | yes | yes |
| `.29` | Frame 2 weight · both layouts | yes | yes |
| `.26` | Frame 2 weight · both layouts | yes | yes |
| `.13` | Frame 2 weight · both layouts | yes | yes |
| `.11` | Frame 2 weight · both layouts | yes | yes |
| `.07` | Frame 2 weight · both layouts | yes | yes |
| `.09` | Frame 2 weight · both layouts | yes | yes |
| `.05` | Frame 2 weight · both layouts | yes | yes |

### Real weights

The helper is the brief’s explicitly permitted pure Node-side port of little-endian float32 decoding in src/lib/bakedPass.js:4–10 and row indexing in src/lib/realModel.js:590–614. Both browser modules depend on import.meta.env; neither protected module changed. This proof executes those original functions directly from their source, independently of the helper, and supplies their row to the actual AttentionInspector component in real mode. All 576 rows (6 layers × 12 heads × 8 positions) agree exactly. Invalid layer/head/position and malformed-matrix opposite cases throw.

| Position | Token | Drawing | Inspector real-mode markup | Equal at 2 decimals |
| --- | --- | --- | --- | --- |
| 0 | `The` | `.29` | `0.29` | yes |
| 1 | `␣engine` | `.26` | `0.26` | yes |
| 2 | `␣roared` | `.13` | `0.13` | yes |
| 3 | `␣and` | `.11` | `0.11` | yes |
| 4 | `␣it` | `.07` | `0.07` | yes |
| 5 | `␣shut` | `.09` | `0.09` | yes |
| 6 | `␣down` | `.05` | `0.05` | yes |

Raw sum: **1.0000000223517418**. Printed sum: **1.00**. Layer 0, head 0, position 6; eight source tokens retained in the define, seven drawn, final period excluded. Tensor dimensions read from the named manifest entry: **768 × 2304**. Widths and strokes use raw weights; only labels round.

## Scope and reserves

Initial worktree clean, branch `the-company-copy`. The scope check passed: only twelve authorized files changed; 159 protected tracked files are byte-equal to HEAD. App/essay equal exactly their authorized insertion/import/map plus number edits. Inspector, glass, loop and tour differ only in figure numbers. `git diff --check` passed. No staging, commits, pushes, fetches, discard, network, browser or GUI. General sync/stamp/close writes omitted under the task’s narrower scope.

| Layout | SVG viewBox | CSS reserve | Reserved size at stated band | Labels | Notes/weights |
| --- | --- | --- | --- | --- | --- |
| Wide, >640 px | `0 0 680 414` | `.dies-wide{aspect-ratio:680/414;}` | 559 × 340.332 px at 641 px window | 13.4 × 559/680 = 11.016 px | 12.2 × 559/680 = 10.029 px |
| Stacked, ≤640 px | `0 0 300 848` | `.dies-stacked{aspect-ratio:300/848;max-width:360px;margin:0 auto;}` | 308 × 870.613 px at 390 px window | 12 × 308/300 = 12.320 px | 10.5 × 308/300 = 10.780 px |
| Stacked at cap | same | same | 360 × 1017.600 px | 12 × 360/300 = 14.400 px | 10.5 × 360/300 = 12.600 px |

Both SVGs remain mounted; CSS alone switches display at 640 px. Their reserved ratios need no data fetch or font measurement. At narrower widths the requested scaling continues (375 px window → 293 px drawing → 10.255 px notes). These are source/arithmetic proofs, not a browser measurement. **Browser proofs UNRUN (caller-owned): visual layout/clipping, actual font bounds, contrast, keyboard/accessibility tree, and load/resize CLS in both copies at each band. CLS 0 is not claimed measured here.**

The company palette exception includes .dies-svg. Both copies use the same component and geometry. No InfoTag, control, effect or focus target was added. Die ranges derive from manifest dimensions; books/shares/pours derive from the saved row; share widths use a common scale and baseline. The complete baked pass is not imported into this figure at runtime.

## Per-part changes — final file lines

| File and lines | Change |
| --- | --- |
| `README.md:47–49, 165, 167–169` | Requested new table row/file-list line and renumber. |
| `src/App.jsx:12, 347, 1069` | Import/map mount; company glass reference renumber. |
| `src/company.css:285` | Add .dies-svg to palette exception only. |
| `src/content/essay.js:60–61, 145` | Insert after section 04 first paragraph; two glass callouts renumber. |
| `src/figures/LoopFigure.jsx:5, 277, 288` | FIG.9 → FIG.10 only. |
| `src/figures/figFormat.js:24–44` | Permitted pure Node-side decoder/indexing port with source references and guards. |
| `src/instruments/AttentionInspector.jsx:67, 298` | FIG.7 → FIG.8 only. |
| `src/instruments/GlassPass.jsx:181, 301` | FIG.8 → FIG.9 only. |
| `src/lib/tour.js:362` | FIG.8 → FIG.9 only. |
| `src/styles.css:444, 452, 466, 470–489` | Fixed reserves, breakpoint, palette/hatches/spines/pours; number comments. |
| `vite.config.js:4, 28–46, 69–70` | Read facts in both copies, derive __DIES_FACTS__, guard contract, keep __BAKED_A__ company-only. |
| `src/figures/DiesFigure.jsx:1–135` | New shared description, two frames/layouts, InstrumentHead and caption. |

## Complete changed-number mapping — original → final lines

Every original FIG.7/8/9 occurrence in authorized files, including comments, follows. FIG.1–6 strings are unchanged.

| File | Before | After |
| --- | --- | --- |
| `README.md` | 47: `FIG.7` | 48: `FIG.8` |
| `README.md` | 48: `FIG.8` | 49: `FIG.9` |
| `README.md` | 165: `FIG.7` | 167: `FIG.8` |
| `README.md` | 166: `FIG.8` | 168: `FIG.9` |
| `README.md` | 167: `FIG.9` | 169: `FIG.10` |
| `src/App.jsx` | 1067: `FIG.8` | 1069: `FIG.9` |
| `src/content/essay.js` | 60: `FIG.8` | 60: `FIG.9` |
| `src/content/essay.js` | 61: `FIG.8` | 61: `FIG.9` |
| `src/figures/LoopFigure.jsx` | 5: `FIG.9` | 5: `FIG.10` |
| `src/figures/LoopFigure.jsx` | 277: `FIG.9` | 277: `FIG.10` |
| `src/figures/LoopFigure.jsx` | 288: `FIG.9` | 288: `FIG.10` |
| `src/instruments/AttentionInspector.jsx` | 67: `FIG.7` | 67: `FIG.8` |
| `src/instruments/AttentionInspector.jsx` | 298: `FIG.7` | 298: `FIG.8` |
| `src/instruments/GlassPass.jsx` | 181: `FIG.8` | 181: `FIG.9` |
| `src/instruments/GlassPass.jsx` | 301: `FIG.8` | 301: `FIG.9` |
| `src/lib/tour.js` | 362: `FIG.8` | 362: `FIG.9` |
| `src/styles.css` | 444: `FIG.9` | 444: `FIG.10` |
| `src/styles.css` | 452: `FIG.9` | 452: `FIG.10` |
| `src/styles.css` | 466: `FIG.7` | 466: `FIG.8` |
| `src/styles.css` | 466: `FIG.9` | 466: `FIG.10` |

No old FIG.7/8/9 matches existed in src/content/explainers.js or src/lib/forwardMap.js; both untouched. factDrawing.jsx primitives were sufficient; unchanged.

## Exhaustive renumber — scope conflict

The required full-repository badge counts **FAIL**: old badge count 3, new badge count 2. The source-only counts are correctly 0 and 1. Two verification attempts stopped on the respective full-repository count assertions; the actual results follow. Report generation also encountered git’s quoted filenames; rerun using NUL-separated paths, including the protected start commands in the byte comparison.

```text
git grep -c 'FIG\.7 — THE ATTENTION'
STATUS.md:1
design/the-next-cut-2026-10-31/BRIEF-3-REPORT.md:1
design/the-next-cut-2026-10-31/BRIEF-3-names-not-letters.md:1
git grep -c 'FIG\.8 — THE ATTENTION'
design/the-three-dies-2026-11-05/BRIEF-DIES.md:1
src/instruments/AttentionInspector.jsx:1
```

The brief requires every repository FIG.7/8/9 reference to move while restricting touches and protecting STATUS, OPENER, design and unlisted lib files. Per “anything unclear: stop that item,” the following references remain untouched. The authorized page source is renumbered. This prevents claiming the exhaustive repository sweep complete.

| Untouched file | Existing line/string | Reason |
| --- | --- | --- |
| `OPENER.md` | 7: FIG.7, 10: FIG.7, 14: FIG.7, 14: FIG.8, 14: FIG.7, 22: FIG.7, 22: FIG.8, 22: FIG.9, 22: FIG.9, 23: FIG.7, 23: FIG.9 | Protected record |
| `STATUS.md` | 6: FIG.7, 6: FIG.8, 6: FIG.7, 6: FIG.9, 59: FIG.7, 59: FIG.8, 65: FIG.9, 116: FIG.7, 264: FIG.8, 276: FIG.8, 284: FIG.7, 284: FIG.7, 481: FIG.8, 502: FIG.8, 502: FIG.7, 515: FIG.7, 516: FIG.7, 518: FIG.7, 573: FIG.8, 589: FIG.7 | Protected record |
| `design/f-for-a-reader/REPORT.md` | 31: FIG.7 | Protected record |
| `design/reading-pass-2026-10-28/BRIEF-2-REPORT.md` | 54: FIG.9, 108: FIG.7, 109: FIG.8, 110: FIG.9, 111: FIG.8, 112: FIG.8, 113: FIG.7, 114: FIG.8, 114: FIG.7, 115: FIG.7, 116: FIG.7, 117: FIG.7, 119: FIG.8, 120: FIG.7, 121: FIG.7, 122: FIG.8, 122: FIG.7, 126: FIG.8, 126: FIG.7, 129: FIG.7, 130: FIG.7, 131: FIG.8, 131: FIG.7, 132: FIG.8, 132: FIG.7, 133: FIG.7, 134: FIG.7, 135: FIG.7, 138: FIG.9, 138: FIG.7, 138: FIG.8, 139: FIG.7, 139: FIG.8, 139: FIG.9, 140: FIG.9, 143: FIG.9, 146: FIG.7, 146: FIG.8, 146: FIG.9, 147: FIG.9, 148: FIG.8, 155: FIG.7, 156: FIG.7, 157: FIG.7, 158: FIG.7, 159: FIG.8, 159: FIG.7, 160: FIG.8, 160: FIG.7, 161: FIG.8, 161: FIG.7, 162: FIG.7, 163: FIG.7, 164: FIG.7, 165: FIG.8, 165: FIG.7, 166: FIG.7, 167: FIG.7, 168: FIG.8, 168: FIG.7, 170: FIG.8, 170: FIG.7, 171: FIG.7, 172: FIG.8, 172: FIG.7, 173: FIG.7, 174: FIG.7, 176: FIG.7, 177: FIG.7, 179: FIG.7, 180: FIG.7, 181: FIG.7, 182: FIG.7, 183: FIG.7, 184: FIG.7, 185: FIG.7, 186: FIG.7, 187: FIG.7, 188: FIG.7, 189: FIG.7, 190: FIG.7, 192: FIG.9, 193: FIG.9, 194: FIG.9, 201: FIG.9, 202: FIG.9, 203: FIG.9, 204: FIG.7, 207: FIG.8, 211: FIG.7, 212: FIG.9, 213: FIG.9 | Protected record |
| `design/reading-pass-2026-10-28/BRIEF-2.md` | 67: FIG.7, 67: FIG.8, 67: FIG.9, 79: FIG.9 | Protected record |
| `design/reading-pass-2026-10-28/FIG-MAP.md` | 7: FIG.8, 7: FIG.8, 17: FIG.7, 19: FIG.7, 19: FIG.7, 19: FIG.7, 19: FIG.7, 23: FIG.7, 38: FIG.7 | Protected record |
| `design/the-loop-and-the-landing/BUILD-BRIEF.md` | 1: FIG.7, 23: FIG.7, 23: FIG.7, 33: FIG.7 | Protected record |
| `design/the-loop-and-the-landing/REPORT.md` | 1: FIG.7, 9: FIG.7, 13: FIG.7, 16: FIG.7, 23: FIG.7, 33: FIG.7, 37: FIG.7 | Protected record |
| `design/the-loop-and-the-landing/WORDS.md` | 37: FIG.7, 38: FIG.7 | Protected record |
| `design/the-next-cut-2026-10-31/BRIEF-2-REPORT.md` | 7: FIG.9 | Protected record |
| `design/the-next-cut-2026-10-31/BRIEF-2-words-and-phone.md` | 44: FIG.7, 44: FIG.7 | Protected record |
| `design/the-next-cut-2026-10-31/BRIEF-3-REPORT.md` | 16: FIG.8, 54: FIG.8, 60: FIG.8, 96: FIG.7, 312: FIG.8, 386: FIG.8, 549: FIG.7 | Protected record |
| `design/the-next-cut-2026-10-31/BRIEF-3-names-not-letters.md` | 33: FIG.7, 34: FIG.8, 42: FIG.8 | Protected record |
| `design/the-readers-footing/REPORT.md` | 48: FIG.7 | Protected record |
| `design/the-three-dies-2026-11-05/BRIEF-DIES.md` | 16: FIG.7, 16: FIG.9, 26: FIG.7, 26: FIG.9, 26: FIG.7, 28: FIG.9, 40: FIG.9, 44: FIG.7, 46: FIG.9, 47: FIG.7, 54: FIG.7, 54: FIG.7, 54: FIG.8, 54: FIG.8, 54: FIG.9, 54: FIG.9, 54: FIG.7, 54: FIG.8, 54: FIG.9, 54: FIG.8, 54: FIG.7, 54: FIG.7, 54: FIG.7, 62: FIG.8 | Protected record |
| `interactive-guide-spec.md` | 632: FIG.9, 634: FIG.9, 638: FIG.9, 638: FIG.9, 638: FIG.9 | Outside touches |
| `src/lib/toyModel.js` | 377: FIG.7 | Outside touches; lib also protected |

The report lives at the authorized primary-checkout design path, outside this worktree, so it does not appear in this worktree’s git status. Both builds, lint and headless figure checks pass. The exhaustive renumber/count requirement remains unresolved.

## git status --short — final

```text
 M README.md
 M src/App.jsx
 M src/company.css
 M src/content/essay.js
 M src/figures/LoopFigure.jsx
 M src/figures/figFormat.js
 M src/instruments/AttentionInspector.jsx
 M src/instruments/GlassPass.jsx
 M src/lib/tour.js
 M src/styles.css
 M vite.config.js
?? src/figures/DiesFigure.jsx
```

FAIL — Full-repository renumber cannot be completed within the protected-file and touches limits; drawing, builds, lint and headless proofs are complete.
