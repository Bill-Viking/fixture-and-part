# BRIEF 1b — ruled reading-pass report

2026-10-28 · Mac · headless Codex builder · branch `the-company-copy` · HEAD `f174ce1`.

All three stopped items are built on the caller’s committed BRIEF-1 tree. Initial `git status --short` was empty. No staging, commit, push, permission change, browser, GUI, or start command was performed. Writes are the five source files below, this report, prescribed ignored build outputs, and temporary shell harnesses/logs under `/private/tmp/brief1b-20261028/`. The caller retains browser acceptance.

## Per-item changes

| Item | Files / lines | Result |
|---|---|---|
| R2(b) — EMBED / UNEMBED | `src/content/essay.js:23,27`; `src/App.jsx:180` | Two exact `role: null` glossary entries, after TOKEN and LANDING respectively, without trailing periods. Both gloss texts and both glossary word properties occur once per entry bundle. Removed the stale “four of seven” example from the Glossary comment; runtime behavior already uses `Math.ceil(entries.length / 2)` and string-driven heights at every band. No layout algorithm change was necessary. |
| R6 — both idle states | `src/lib/forwardMap.js:95–106` | Null returns the exact ruled 157-character instruction. Non-null retains the old tensor text and appends the exact suffix. All seven F plate/header tensor readings were compared to HEAD plus that suffix. `ForwardMap.jsx`, its readout row, both buttons’ widths/titles, and all existing readout reservations are unchanged. |
| R8(e) — generated reading | `src/instruments/GlassPass.jsx:45–63,277–279`; `src/styles.css:2011–2018` | Added a data-derived mono sentence directly below the existing reading-position note. Top pieces/shares come from the table’s stops 1 / 4 / 6 (after blocks 0 / 3 / 5), formatted with the table’s `toFixed(2)`. The final winner’s full trace supplies the first ≥0.10 depth. All three verbatim tails are installed. The 30px / 75px box stays mounted and empty when the reading cannot be computed, and uses `overflow: hidden`. |

D’s company table remains illustrative while its vector measurements use the baked run. The new sentence follows those displayed table shares. No real logit-lens probabilities were inferred from baked vectors. Real-mode token strings are used unchanged, including ␣ and ⏎. No extra quotation glyphs are inserted around pieces.

## Checks run

| Check | Result |
|---|---|
| `npm run lint` | Exit 0; exactly one existing `AttentionInspector.jsx:55:45` exhaustive-deps warning, no errors. |
| `npm run build -- --configLoader native` | Exit 0; Vite 8.2.1; 74 modules; 1.44s. |
| `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co` | Exit 0; 55 modules; 415ms. |
| Build bounds / warning | Each command bounded to 180 seconds. Both builds retain the existing large-chunk advisory; no safety check or warning threshold was changed. |
| `git diff --check` | Exit 0. |
| Exact glossary / rendered count | Both exact entries and the nine-entry order pass. Actual Glossary source server-rendered with nine entries: nine rows, second-column break at index 5, each word once, all four height properties correct. Opposite count: three entries render three rows with the break at index 2. No fixed seven-entry grid, height, index, or selector exists in Glossary or its CSS. |
| R6 source / measurements | Exact null sentence; each of seven real manifest tensor readings equals its previous output plus the exact suffix. Both idle states fit every tested band using node mono-wrap estimates (table below). |
| Reading tails / formatting | Rim ≥0.10, first block, last earlier block, final-row-only, and no-earlier-threshold cases pass. Tested the unrounded threshold at 0.0999 versus 0.10. ␣/⏎ pieces and two-decimal shares preserved. |
| Missing-share opposite cases | Seven helper cases pass: null reading, absent trace, partial trace, partial stops, missing required row, error, and invalid share all return an empty string. |
| D actual component server rendering | Both consumer and company module branches pass for default illustrative data, company baked vectors, complete real data, and five blank-box states (no reading, pending shares, stale reading, error, empty sequence). Exact placement after the existing note and default 145-character text verified. Seven existing metric placeholders / seven baked metrics remain present. This is markup proof, not a browser layout proof. |
| Full F sample rerun | Existing shell enumerator rerun with the new null and embedding-plate readouts included: 9,992 leads / 10,000 readouts, all 9,216 wall cells, all baked head/hero positions, ray/decoding role branches, carriers, silent plates, unembed, idle, and wall/embedding plates. Existing reserves still exceed estimated maxima: 5/6 lines at 1200, 6/7 at 800–1199, 7/8 at 641, 12/14 at 390, 13/14 at 381, 16/17 at 320. |
| R9 cache-presence regression | Required ONNX-only false, tokenizer-only false, both true all pass; empty and wrong-suffix false also pass. No model download or real inference executed. |
| Full-vector regression | 56/56 baked depth/position readings agree with independent full-vector `Math.hypot` calculations; maximum norm delta 1.8189894035458565e-12. Baked/illustrative eight positions align. |
| Bundle counts | All 44 per-copy expectations pass, plus EMBED and UNEMBED glossary word-property counts (one each in each bundle). All previously passing BRIEF-1 rows remain passing. `standing by on` is retired and checked absent. |
| Protected-file / staging check | Required and extended protected diff-stats empty; all 11 fingerprints below match HEAD. `git diff --cached --name-only` empty. |
| Browser proofs | **UNRUN**: `__readoutLines()` DOM line boxes; actual font and glossary fit; D’s reserved-box fit with changing/long real tokens; browser interactions; CLS at every band in both copies. These belong to the caller. No browser measurement or CLS value is claimed. |

Required R9 pure-function output, rerun here:

```text
cache presence: ONNX only => false PASS
cache presence: tokenizer only => false PASS
cache presence: both => true PASS
cache presence: empty => false PASS
cache presence: wrong suffix => false PASS
```

Temporary verification files: `ruled-check.mjs`, `glossary-render.mjs`, `full-check.mjs`, `count-check.py`, JSON results and command logs under `/private/tmp/brief1b-20261028/`. The existing BRIEF-1 node loader was reused without modifying it. Consumer and company ruled checks each had a 60-second subprocess bound; actual Glossary rendering also had a 60-second bound. No test harness was added to the product tree.

## Reservations — node estimates, not browser line boxes

The `.map-readout` comment’s source enumeration was followed on the shipped data. Its browser clone-and-Range line-box method `__readoutLines()` is **UNRUN**. As BRIEF-1b permits, shell estimates use mono advance 0.6em plus the CSS tracking (F 0.02em, D 0.03em), greedy word/hyphen wrapping, and the current CSS content widths. Both copies share this geometry; company.css has no override of these text boxes.

### Glossary — count-driven rows

Rows remain sized by `linesAt(gloss, measure) × 18px`, not by entry count or a fixed strip height. Seven entries become nine; the column break moves from index 4 to 5 automatically. The two new rows reserve the following heights from first render:

| Word | Characters | ≥780px, measure 36 | 600–779px, measure 64 | 390–599px, measure 38 | ≤389px, measure 28 |
|---|---:|---|---|---|---|
| EMBED | 117 | 4 lines / absent→72px | 2 lines / absent→36px | 4 lines / absent→72px | 5 lines / absent→90px |
| UNEMBED | 160 | 5 lines / absent→90px | 3 lines / absent→54px | 5 lines / absent→90px | 6 lines / absent→108px |

No existing row’s height rule changed. The strip’s extra initial height comes from its added definition rows; nothing is inserted after load.

### F — both idle states fit the unchanged boxes

Null instruction: 157 characters. Longest appended tensor reading among the seven plate/header choices: 127 characters. Heights are unchanged from the committed BRIEF-1 reservations; the whole-row heights likewise remain 104 / 142 / 157 / 247 / 292px across the five bands.

| Viewport px | Estimated text width | Null lines used | Max tensor lines used | Lines reserved | Readout height old→new |
|---|---:|---:|---:|---:|---:|
| 1280 | 856px | 2 | 1 | 6 | 90→90px |
| 1200 | 808px | 2 | 2 | 6 | 90→90px |
| 1199 | 678px | 2 | 2 | 7 | 105→105px |
| 800 | 678px | 2 | 2 | 7 | 105→105px |
| 799 | 678px | 2 | 2 | 8 | 120→120px |
| 641 | 559px | 2 | 2 | 8 | 120→120px |
| 640 | 570px | 2 | 2 | 14 | 210→210px |
| 480 | 410px | 3 | 3 | 14 | 210→210px |
| 390 | 320px | 4 | 3 | 14 | 210→210px |
| 381 | 311px | 4 | 3 | 14 | 210→210px |
| 380 | 310px | 4 | 3 | 17 | 255→255px |
| 360 | 290px | 4 | 3 | 17 | 255→255px |
| 320 | 250px | 5 | 4 | 17 | 255→255px |

These values concern both R6 idle states. The full readout enumeration also remains within the larger existing reservations as reported above.

### D — new reserved reading box

D retains the existing note’s 10.5px mono / 15px line height / 0.03em tracking. The existing position-note reserve stays 30px. The **new** box adds 30px (>640px, two lines) or 75px (≤640px, five lines). It is always rendered, even when empty; `overflow: hidden` prevents longer pieces moving the content below it.

| Viewport px | Estimated text width | Characters per line | Default lines used | Lines reserved | New box old→new |
|---|---:|---:|---:|---:|---:|
| 1280 | 678px | 102 | 2 | 2 | 0→30px |
| 780 | 678px | 102 | 2 | 2 | 0→30px |
| 760 | 678px | 102 | 2 | 2 | 0→30px |
| 641 | 559px | 84 | 2 | 2 | 0→30px |
| 640 | 570px | 86 | 2 | 5 | 0→75px |
| 599 | 529px | 79 | 2 | 5 | 0→75px |
| 480 | 410px | 61 | 3 | 5 | 0→75px |
| 390 | 320px | 48 | 4 | 5 | 0→75px |
| 389 | 319px | 48 | 4 | 5 | 0→75px |
| 381 | 311px | 47 | 4 | 5 | 0→75px |
| 380 | 310px | 46 | 4 | 5 | 0→75px |
| 360 | 290px | 43 | 4 | 5 | 0→75px |
| 320 | 250px | 37 | 4 | 5 | 0→75px |

The required measured sentences:

| Mode / position | Characters | Data used |
|---|---:|---|
| Default illustrative, position 7 (`.`) | 145 | Actual table stops / trace from `illustrativeLens(DEFAULT_TOKENS, [], 7)`. |
| Company copy, baked pass’s last position 7 (`.`; eight positions total) | 145 | Actual company D server render with baked vectors and its existing illustrative table stops / trace. |

Both print exactly:

```text
at the start it says and (0.05) · by the middle The (0.19) · at the end it chooses The (0.57) — the final word first passes a tenth after block 3
```

The other two tails were exercised with complete table readings and threshold-varied traces; incomplete-share states render an empty reserved paragraph. The two-lines-above / five-lines-below rule is fixed by the brief, with clipping for longer tokens, not an all-vocabulary no-clipping claim.

## Bundle string counts — full BRIEF-1 table plus BRIEF-1b

Entry JS only, decoding JavaScript Unicode escapes to the same glyphs. One `index-*.js` entry per output:

| Bundle | Bytes | SHA-256 |
|---|---:|---|
| `dist/assets/index-t-5Ep2u3.js` | 437,213 | `be8ac2172764415aedea162278dbab292fe0f19f9c7f07a458e2b2fc59fb602b` |
| `dist-co/assets/index-C_1cGi9K.js` | 425,190 | `9ad477e1d9a97159d9bb741a5c72a5f4af83a4ba3aab071c57ba7bce2a0194cd` |

| String | Consumer | Company | Expected | Result |
|---|---:|---:|---|---|
| `guessing the next word` | 1 | 1 | 1 / 1 | PASS |
| `One candidate for the next word` | 1 | 1 | 1 / 1 | PASS |
| `the vector so far` | 1 | 1 | 1 / 1 | PASS |
| `if it stopped here it would say` | 1 | 1 | 1 / 1 | PASS |
| `final word’s share` | 1 | 1 | 1 / 1 | PASS |
| `the key a row advertises` | 1 | 1 | 1 / 1 | PASS |
| `the shop words, in a person` | 1 | 1 | 1 / 1 | PASS |
| `Machines that can exist` | 1 | 1 | 1 / 1 | PASS |
| `A concept is not stored at an address` | 1 | 1 | 1 / 1 | PASS |
| `over ten thousand in a frontier model` | 1 | 1 | 1 / 1 | PASS |
| `held up to the word table` | 2 | 2 | ≥2 each | PASS |
| `LOADED` | 1 | 0 | 1 / 0 | PASS |
| `the model is already on this machine` | 1 | 0 | 1 / 0 | PASS |
| `to embed a piece is` | 1 | 1 | 1 / 1 | PASS |
| `to unembed a vector is` | 1 | 1 | 1 / 1 | PASS |
| `nothing chosen yet — click a ray` | 1 | 1 | 1 / 1 | PASS |
| `open it in the file to read it at length` | 1 | 1 | 1 / 1 | PASS |
| `at the start it says` | 1 | 1 | 1 / 1 | PASS |
| `passes a tenth after block` | 1 | 1 | 1 / 1 | PASS |
| `above a tenth from the start` | 1 | 1 | 1 / 1 | PASS |
| `only in the last row` | 1 | 1 | 1 / 1 | PASS |
| `standing by on` | 0 | 0 | 0 each; retired | PASS |

`word: EMBED` and `word: UNEMBED` are each present exactly once as glossary properties in each entry bundle. The gloss phrases are counted separately above so F’s unchanged `UNEMBED · WTEᵀ` label cannot inflate the glossary check. That landing label and all of ForwardMap.jsx are byte-identical to HEAD.

## Protected files

Required command, exit 0, empty output:

```text
git diff --stat -- src/content/passFacts.json src/lib/bakedPass.js src/lib/passCore.js
(no output)
```

Extended diff-stat also empty for the bake script, company.css, STATUS.md, OPENER.md, both start commands, ForwardMap.jsx, and Stepper.jsx. Fingerprints are SHA-256 of the working file and its HEAD version, equal in each case:

| File | State | SHA-256 |
|---|---|---|
| `src/content/passFacts.json` | SAME | `1b7a5be47dd726ba5010389a838afec8469bca6806cf6b884c511520762c2059` |
| `src/lib/bakedPass.js` | SAME | `3767c4ea8f7822516db723c7506b27617b31b558b9e21f668fcc81dcf1f28a29` |
| `src/lib/passCore.js` | SAME | `6c5e3593a469c827cfc5f17e26091e080f59bedd321106bc4655676b79f628d1` |
| `scripts/bake-pass.mjs` | SAME | `11d7d954ebc92cd9f006a566c657f2f5570a8893d2d5d094233ae4597584e56c` |
| `src/company.css` | SAME | `45c02c539e519c29efe10b8148ece41db5090263122034f7960a2a4bb089c3c3` |
| `STATUS.md` | SAME | `cedfd3c3afdbe6bff24a60960cc83f630a79732681d4e3965802f2551edbbc7e` |
| `OPENER.md` | SAME | `15ee29ab57bc356fb284684280f9e9c3209b214c8c87c391ce67fd0a83a0058a` |
| `src/instruments/ForwardMap.jsx` | SAME | `2d615da84dcc5de6a76767f4a12a9c74fa8bd46aa0dd2c496b0dfbeaf8557b43` |
| `src/instruments/Stepper.jsx` | SAME | `293d460c618930a673cb6424d2a776acd92fcc0c0a4eed5b6f272c458357797c` |
| `Start Fixture and Part — company copy.command` | SAME | `8a25d4538fbf8ed3a3721247153e07e433be86559a00150b42801e35ddfe3221` |
| `Start Fixture and Part — public copy.command` | SAME | `0c79eb382011d5d32e46ac789d5ee7d106108708337a7306741566db0690ae60` |

No other design file was edited. No report or caller log was staged. Only the prescribed ignored `dist/` and `dist-co/` outputs were regenerated.

## Changed files — before / after physical line counts

Before is HEAD f174ce1; after is the delivered working file. This report is new and ignored by the existing design rule.

| File | Before | After |
|---|---:|---:|
| `src/App.jsx` | 1093 | 1093 |
| `src/content/essay.js` | 389 | 391 |
| `src/instruments/GlassPass.jsx` | 279 | 302 |
| `src/lib/forwardMap.js` | 652 | 649 |
| `src/styles.css` | 2623 | 2631 |
| `design/reading-pass-2026-10-28/BRIEF-1b-REPORT.md` | 0 | 210 |

## git status --short (last section)

```text
 M src/App.jsx
 M src/content/essay.js
 M src/instruments/GlassPass.jsx
 M src/lib/forwardMap.js
 M src/styles.css
```

Nothing staged. This report is ignored by the existing design rule and is present at the requested path. HEAD remains f174ce1; all five source edits remain for the caller to review and commit.

DONE — R2(b), R6, and R8(e) built in both copies; all required shell checks pass; browser proofs unrun for the caller.
