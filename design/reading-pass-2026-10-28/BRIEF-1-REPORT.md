# BRIEF 1 — reading-pass report

2026-10-28 · Mac · headless Codex builder · branch `the-company-copy` · HEAD `5317f90`.
Initial `git status --short` was empty. No files were staged, committed, pushed, reverted, or discarded. No browser or GUI was launched. The caller retains browser acceptance. STATUS, OPENER, sync state, start commands, company.css, and the baked-pass producers/data were not edited.

## Result and stopped items

This is a partial build, not an acceptance. Lint and both builds pass. Three sub-items were stopped under the brief’s “Anything unclear” instruction:

- **R2(b): glossary attachment mismatch.** `aa9ea4e` actually changes only `src/content/harnessFacts.json`; it is not the glossary commit described in the brief. The current glossary is `header.glossary` in `src/content/essay.js:19` and `Glossary` in `src/App.jsx:173–266`: a non-interactive definition list under the header. There is no first-essay-use attachment mechanism. Its count is dynamic (`Math.ceil(entries.length / 2)`), and its heights are string-counted, so a fixed entry count is not the blocker. Attaching definitions at first essay use would require inventing a mechanism/placement that the brief says to copy. EMBED and UNEMBED definitions were therefore not added. F’s `UNEMBED · WTEᵀ` label remains unchanged.
- **R6: idle-source mismatch.** `ForwardMap.jsx` initializes `part` to null and `inspect` to null. At `src/instruments/ForwardMap.jsx:2265`, the idle branch calls `partReadout(partFacts)`. At `src/lib/forwardMap.js:95`, the null branch returns `nothing chosen yet — click a wall, a cell, a carrier, a landing bar or a plate and this line says what it is`. It does not print a tensor line. The requested “exactly the tensor line the idle readout prints today” therefore has no unchosen-state source. No default tensor or replacement words were invented. R6 was left unchanged; this causes the required `standing by on` bundle count to fail. Both F button widths, titles, labels, and enablement are unchanged.
- **R8(e): two-line phone reservation conflicts with the supplied sentence.** On the existing default illustrative data at position 7, the exact requested output is 145 characters. At a 320px viewport D has 250px of body width. Its existing 10.5px mono note style with 0.03em tracking fits 37 characters per line, so even a space-free lower bound requires 4 lines, before word wrapping. At 390px the capacity is 48 characters, still at least 4 lines. No smaller type, omitted words, clipping, horizontal scroller, or taller reservation was substituted. The generated reading paragraph was not added. The caller must settle the reservation requirement.

The R8(e) data-derived sentence used to establish the conflict:

> at the start it says and (0.05) · by the middle The (0.19) · at the end it chooses The (0.57) — the final word first passes a tenth after block 3

## Per-item changes

| Item | State | Files and lines | Change / verification |
|---|---|---|---|
| R1(a–b) | Built | `src/content/essay.js:68,72,76` | Exact vector-width replacement and two sibling paragraph objects, in order. No new marks in 02 (count 0). |
| R2(a) | Built | `src/content/explainers.js:59–62` | `embeddingReal` body replaced verbatim; illustrative explainer left alone. |
| R2(b) | Stopped | Current mechanism at `essay.js:19`, `App.jsx:173–266` | See mismatch above. No glossary entries or layout changes. |
| R3(a) | Built | `src/instruments/ForwardMap.jsx:2715` | Exact purpose sentence prepended with one space. The purpose is static, auto-height prose (`styles.css:350–358`), not a state-dependent reserved head. The head note’s reservation is unchanged. |
| R3(b) | Built; browser measurement pending | `src/lib/tour.js:153–174`; `ForwardMap.jsx:330`; `src/styles.css:1332–1368,2383–2387,2575–2576` | Exact ray lead/detail. Greedy/sample role branch source is byte-identical to HEAD. Cards enlarged using the existing character wrapper. HTML readout reservations enlarged using mono-wrap estimates; required DOM line-box proof remains unrun. Tour captions do not call `rayLead` and remain unchanged. |
| R4 | Built | `src/content/essay.js:102`; `src/content/claimNotes.js:12–24` | Paragraph inserted between KV-cache and rack paragraphs. One `reinterpret` evidence mark immediately after “Machines that can exist.” Six supplied source labels and URLs copied exactly. No fresh URL/browser verification claimed. |
| R5 | Built | `src/content/essay.js:119` | Six `<br>`-separated lines in the callout’s existing mono `.lbl` element, after quote and before coda. The quoted paragraph is byte-identical to HEAD. No claim mark added. Static content needs no state reservation. |
| R6 | Stopped | `ForwardMap.jsx:2265`; `src/lib/forwardMap.js:95` | See mismatch above. Idle wording unchanged. |
| R7(a–c) | Built; font/visual proof pending | `src/instruments/AttentionInspector.jsx:157,169,182,214,250`; `src/styles.css:1593–1594,1807,1858–1860,2397` | `value` header; C-only plain V marks with existing lit/dim states; exact legend below label row. V column 26→34px, taken from the flexible column to retain total row width. B/Stepper is byte-identical to HEAD. C’s label row is auto-height, and the new note is static. |
| R8(a–b) | Built | `src/content/explainers.js:79–82`; `src/instruments/GlassPass.jsx:269` | Both real-lens strings replaced exactly. All illustrative `a` strings are byte-identical to HEAD. TeachPair continues to lay both variants in the same grid cell and reserve the taller automatically. |
| R8(c) | Built; font proof pending | `GlassPass.jsx:201–206`; `src/styles.css:1903–1920` | Exact three headings. Final-share column widened; header reserved for two lines at its narrow visible band. Phone headers are already hidden at ≤640px, so no phone variant was introduced. |
| R8(d) | Built; browser fit proof pending | `GlassPass.jsx:21–43,129–137,212,246–248`; `src/App.jsx:999`; `src/styles.css:1927–1936,2427–2442` | L2 norm over all 768 values and L2 norm of the full-vector difference. Rim moved value is a dash. Seven placeholders when full vectors absent. Company D uses the existing baked pass’s full vectors for its preview/metrics only on the shipped sentence and before generation. Its shortlist remains explicitly illustrative; no baked lens probabilities were invented. The eight baked positions match all eight illustrative word/punctuation positions. Rows reserved in both modes. |
| R8(e) | Stopped | No product change | See measured character-capacity conflict above. |
| R9(a–c) | Built; browser return-visit proof pending | `src/App.jsx:381–384,522–562,893`; `src/lib/realModel.js:81–90`; `src/components/ModeControl.jsx:31,106–126`; `src/styles.css:737–746,2528–2530` | Consumer-only once-per-mount cache-key probe; both required URLs must be present. Same load handler as click. Synchronous in-flight and attempted-load guards block races and prevent a late probe retrying a failed click. Explicit click retry stays possible. Missing/partial/refused cache does not invoke the loader. Exact cache hint and visible non-interactive LOADED span; original load text reserves its identical width in a hidden grid cell. Company branch has neither hint nor LOADED in the bundle. |

### Necessary repair found by the checks

`src/lib/realModel.js:34`: added the existing `PREVIEW_DIMS` constant to the local imports from passCore. Before this repair, rendering D with real/baked vectors threw `ReferenceError: PREVIEW_DIMS is not defined` inside `residualPreview()`. It had been re-exported but not imported into the module’s own scope. The node server-render check reproduced the failure and passed after the import. `src/lib/passCore.js` itself is untouched.

## Checks actually run

| Check | Result |
|---|---|
| `npm run lint` | Exit 0; exactly 1 warning, the existing `AttentionInspector.jsx:55:45` exhaustive-deps warning; no errors. |
| `npm run build -- --configLoader native` | Exit 0; Vite 8.2.1; 74 modules; final build 383ms. Consumer index 436,025 bytes (146.47 kB gzip as Vite prints it). |
| `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co` | Exit 0; 55 modules; final build 109ms. Company index 423,999 bytes (142.19 kB gzip). |
| Build warning | Both builds retain the large-chunk advisory. No warning limit or safety check was changed. Each build was bounded by a 180-second subprocess timeout. |
| `git diff --check` | Exit 0; no whitespace errors. |
| Supplied-copy node assertions | **14/14 pass**: P1/P2, R4 paragraph, embedding explainer, real lens explainer, claim body and all six source records, six seam key lines, D teaching text, F purpose prefix+original, ray template/detail, unchanged role branches, C legend. |
| Additional verbatim guards | Seam quote byte-identical; 0 claim marks in 02; six reinterpret sources; all D illustrative `a` strings unchanged. |
| Full-vector node checks | **56/56 depth/position readings pass** against independent `Math.hypot` calculations; maximum norm delta **1.8189894035458565e-12**. Full 768-number differences also checked independently. Null input, invalid position, and six-number-only input return no metric. Formatting checks include 99.94→99.9 and 1816.7→1,817. |
| D node server rendering | Seven `length — · moved —` placeholders without vectors; seven metric rows with baked vectors; rim dash and last row’s metrics verified. Both consumer and company module branches rendered without a browser. |
| Load-road node simulation | **10/10 scenarios pass**: caches absent, ONNX-only, tokenizer-only, both→load→ready, click-before-probe, probe-before-click, effect replay, cache refusal, failed click/late probe/manual retry, and company gate. No download or real model execution was performed by these simulations. |
| ModeControl node server rendering | Consumer: six checks pass for LOADED span, non-button status, exact loaded/cache hints, click hint, and common width holder. Company: no consumer loading/loaded control. These prove generated markup, not pixels. |
| Cache pure function | Required three cases pass; two extra cases (empty and wrong suffix) also pass. Output below. |
| Baked pass protection | Required `git diff --stat -- src/content/passFacts.json src/lib/bakedPass.js src/lib/passCore.js` is empty. All three files also byte-compare equal to HEAD. |
| Browser proofs | **UNRUN**: `__readoutLines()`, browser `__cardLines()` placement, header/font metrics, load/status geometry, real CacheStorage return visit, network trace, interactions, both-copy fit, and CLS at all required bands. No CLS value is claimed. |

The default sentence’s last position (7), from the baked full vectors:

| Depth | Printed length / moved |
|---|---|
| rim | `length 5.0 · moved —` |
| after block 0 | `length 43.1 · moved 42.6` |
| after block 1 | `length 54.4 · moved 21.9` |
| after block 2 | `length 61.0 · moved 18.4` |
| after block 3 | `length 87.5 · moved 40.8` |
| after block 4 | `length 165 · moved 91.4` |
| after block 5 | `length 394 · moved 289` |

## Reservations — source changes and proof limits

All HTML geometry below remains provisional until the caller runs the documented browser method. Character-width calculations use the stylesheet’s mono advance and tracking; they are **not** browser line-box measurements. The new generated reading line was not installed, so there is no unproved two-line clipping box for R8(e).

### F cards (existing wrapper, exact node character counts)

The node harness ran the existing `geometryFor()` and `wrapText()` functions unchanged, on the shipped baked sentence, all 9,216 wall cells, all heads/hero positions for carriers/silent rows, unembed, both decoding rules, and all ray role branches. It enumerated 9,992 leads and 9,998 full readout strings. It did not run the 21-token live-model/browser battery; this sample is not an all-vocabulary fit claim.

| Band | Existing card columns | Measured worst on this sample, old→new | Reserved lines, old→new |
|---|---:|---:|---:|
| Sheet ≥1200px | 70 | 3→5 | 6→6 |
| Column 641–1199px | 45 | 5→9 | 8→10 |
| Phone ≤640px | 53 | 4→7 | 7→8 |

The longest new column lead is 344 characters (greedy ray/pick branch). The new reservations keep one spare line above this sample’s maximum. Browser card placement with the taller cards is UNRUN.

### F HTML readout (node estimates only; required `__readoutLines()` UNRUN)

| Band / edge | Estimated text width | New estimated worst lines | Readout lines, old→new | Readout height, old→new | Whole row height, old→new |
|---|---:|---:|---:|---:|---:|
| Sheet, 1200px | 808px | 5 | 5→6 | 75→90px | 89→104px |
| Column, 800 and 1199px | 678px | 6 | 5→7 | 75→105px | 112→142px |
| Narrow, 641px (799px) | 559px (678px) | 7 (6) | 6→8 | 90→120px | 127→157px |
| Phone, 390px / 381px | 320px / 311px | 12 / 13 | 9→14 | 135→210px | 172→247px |
| Tiny, 320px | 250px | 16 | 12→17 | 180→255px | 217→292px |

These enlarged boxes address R3’s longer ray answer. R6 is stopped, so there is no new idle wording to claim fitted. The original F button widths and titles are untouched. No actual `__readoutLines()` number is claimed.

### C, D, and the mode bar

| Surface / band | Old→new reservation | Shell evidence; browser limit |
|---|---|---|
| C value column, >640px | 26→34px | `value` at 9.5px mono and 0.08em tracking computes to 32.3px. Flexible K column gives up 8px; total reserved row width unchanged. Actual font measurement UNRUN. |
| C value column, ≤640px | 26→34px | Header is hidden; flexible token column gives up 8px. Same total width, V remains 26px and plain. |
| D final-share column, >640px | 54→110px | `final word’s share` computes to 106.02px at 9.5px / 0.02em. Other fixed columns stay 96px and 156px; shortlist remains flexible. |
| D header height, >640px | 18→30px | Two 12px lines fit 24px. At 641px, computed middle-column width is 147px, needing two lines; ≥760px has more room. Browser fit UNRUN. |
| D header, ≤640px | hidden→hidden | Existing rule preserved; no phone wording variant. |
| D depth row, >640px | 72→90px | Existing row plus a 14px metric line and 4px gap. Metric spans columns 2–4; max baked label on all 56 readings is 26 characters / 148.2px: `length 1,671 · moved 1,591`. |
| D depth row, ≤640px | 142→162px | Fixed bands: 14px stop, 36px preview, 14px metric, 65px shortlist; three 5px gaps; 16px padding and border, totaling 161px inside 162px. Available metric width at 320px is 230px. Browser fit UNRUN. |
| D previews, all bands | 36px / three lines unchanged | Preview comes from the same full vector as the new metric when available; no norm is computed from only six values. |
| R9 load row, >640px | 38→38px | Progress hint now owns 30px / two 15px lines. At the narrowest band, 409px remains beside 140px track+10px gap. Exact 78-character hint computes to two wrapped lines. |
| R9 load row, ≤640px | 60→78px | Progress hint owns 45px / three 15px lines, below track. At 320px body width 250px, word wrapping needs three lines. Track 10px + gap 10px + hint 45px =65px, below 78px. Company’s own load rows and company.css are unchanged. |
| R9 loaded status box, all bands | Original label width→same label-derived width | Both button and LOADED use a common grid cell sized by hidden `LOAD THE REAL MODEL (83.5 MB)`. At 11.5px/0.14em plus original padding/border the 29-character label computes to 276.79px in both states. No numerical width was guessed into CSS. At 320px the original command is wider than its 250px parent; that pre-existing clipping is not claimed fixed. Actual before/after pixels UNRUN. |
| F purpose, added essay paragraphs, seam key, C legend | No state-dependent reservation | Static page content, with auto-height wrapping. No live content is added after load in these blocks. |
| D real/illustrative teaching pair | Automatic taller-content reservation unchanged | Both texts remain laid out in the existing TeachPair cell. New string is included from first render; no magic height introduced. |

## R9 required pure-function check

`src/lib/realModel.js:83` declares the assumption: keys belong to the current `CACHE_KEY` and its cached responses are the current patched model/tokenizer. A filename check does not validate response bytes. Presence requires an ONNX suffix **and** a tokenizer.json suffix; the first alone cannot authorize loading.

The required node check was run directly against the source function (extracted to avoid browser-only module imports), exit 0:

```text
ONNX only: false — PASS
tokenizer only: false — PASS
both: true — PASS
cache presence: 3/3 PASS
```

Additional pure-function output:

```text
cache presence: empty => false PASS
cache presence: wrong suffix => false PASS
```

The ten load-road scenarios use the actual App handler/effect source in a node VM with fake cache and loader promises. The consumer/company render checks use ReactDOMServer and Vite’s installed JSX transform. No browser API, GUI, real download, or real inference was invoked. Temporary harnesses and result files were written under `/tmp`; no test harness was added to the product repository.

## Bundle string counts

Counts are in the entry JS only, after decoding JS Unicode escapes to the same glyphs. Each output has exactly one matching `index-*.js` entry. The R6 failure is retained, not forced into a bundle.

- Consumer: `dist/assets/index-BOqcpvt-.js` — 436,025 bytes.
- Company: `dist-co/assets/index-D_dwaPrp.js` — 423,999 bytes.

| String | Consumer | Company | Gate |
|---|---:|---:|---|
| `guessing the next word` | 1 | 1 | 1 each; PASS |
| `One candidate for the next word` | 1 | 1 | 1 each; PASS |
| `the vector so far` | 1 | 1 | 1 each; PASS |
| `if it stopped here it would say` | 1 | 1 | 1 each; PASS |
| `final word’s share` | 1 | 1 | 1 each; PASS |
| `the key a row advertises` | 1 | 1 | 1 each; PASS |
| `standing by on` | 0 | 0 | 1 each; FAIL — R6 stopped |
| `the shop words, in a person` | 1 | 1 | 1 each; PASS |
| `Machines that can exist` | 1 | 1 | 1 each; PASS |
| `A concept is not stored at an address` | 1 | 1 | 1 each; PASS |
| `over ten thousand in a frontier model` | 1 | 1 | 1 each; PASS |
| `held up to the word table` | 2 | 2 | ≥2 each; PASS |
| `LOADED` | 1 | 0 | 1 / 0; PASS |
| `the model is already on this machine` | 1 | 0 | 1 / 0; PASS |

26 of 28 per-copy count expectations pass. Both failures are `standing by on`, intentionally absent because R6 is stopped. The required new glossary entries and R8(e) output are also absent, as recorded above; they are not hidden by the string-count result.

## Protected files

Required diff-stat command is empty, exit 0:

```text
git diff --stat -- src/content/passFacts.json src/lib/bakedPass.js src/lib/passCore.js
(no output)
```

All protected source bytes were also compared to HEAD and are SAME:

| File | SHA-256 (same before / after) |
|---|---|
| `src/content/passFacts.json` | `1b7a5be47dd726ba5010389a838afec8469bca6806cf6b884c511520762c2059` |
| `src/lib/bakedPass.js` | `3767c4ea8f7822516db723c7506b27617b31b558b9e21f668fcc81dcf1f28a29` |
| `src/lib/passCore.js` | `6c5e3593a469c827cfc5f17e26091e080f59bedd321106bc4655676b79f628d1` |
| `scripts/bake-pass.mjs` | `11d7d954ebc92cd9f006a566c657f2f5570a8893d2d5d094233ae4597584e56c` |
| `src/company.css` | `45c02c539e519c29efe10b8148ece41db5090263122034f7960a2a4bb089c3c3` |
| `STATUS.md` | `cedfd3c3afdbe6bff24a60960cc83f630a79732681d4e3965802f2551edbbc7e` |
| `OPENER.md` | `15ee29ab57bc356fb284684280f9e9c3209b214c8c87c391ce67fd0a83a0058a` |
| `src/instruments/Stepper.jsx` | `293d460c618930a673cb6424d2a776acd92fcc0c0a4eed5b6f272c458357797c` |
| `Start Fixture and Part — company copy.command` | `8a25d4538fbf8ed3a3721247153e07e433be86559a00150b42801e35ddfe3221` |
| `Start Fixture and Part — public copy.command` | `0c79eb382011d5d32e46ac789d5ee7d106108708337a7306741566db0690ae60` |

No other file under design was edited by this builder. The caller’s brief/run log were left alone. Build outputs were regenerated only in the prescribed ignored `dist/` and `dist-co/` folders. No start command was run.

## Changed source files — before / after line counts

These are physical source lines, counted before edits and after the final passing builds. The report is new and ignored by the existing design rule; it has not been force-added.

| File | Before | After |
|---|---:|---:|
| `src/App.jsx` | 1063 | 1093 |
| `src/components/ModeControl.jsx` | 143 | 151 |
| `src/content/claimNotes.js` | 244 | 257 |
| `src/content/essay.js` | 377 | 389 |
| `src/content/explainers.js` | 103 | 103 |
| `src/instruments/AttentionInspector.jsx` | 295 | 297 |
| `src/instruments/ForwardMap.jsx` | 3821 | 3823 |
| `src/instruments/GlassPass.jsx` | 246 | 279 |
| `src/lib/realModel.js` | 643 | 651 |
| `src/lib/tour.js` | 574 | 570 |
| `src/styles.css` | 2593 | 2623 |
| `design/reading-pass-2026-10-28/BRIEF-1-REPORT.md` | 0 | 235 |

The source inventory is 11 modified tracked files plus this new report. Binary/generated build output is accounted for in the build receipts and bundle byte counts, not treated as edited source. All product edits remain in the working tree for the caller.

## git status --short (last section)

```text
 M src/App.jsx
 M src/components/ModeControl.jsx
 M src/content/claimNotes.js
 M src/content/essay.js
 M src/content/explainers.js
 M src/instruments/AttentionInspector.jsx
 M src/instruments/ForwardMap.jsx
 M src/instruments/GlassPass.jsx
 M src/lib/realModel.js
 M src/lib/tour.js
 M src/styles.css
```

No staged paths (`git diff --cached --name-only`: empty). The report is ignored by the existing design rule; the explicit ignored-path check reads:

```text
!! design/reading-pass-2026-10-28/BRIEF-1-REPORT.md
```

FAIL — R2(b), R6, and R8(e) need the caller’s ruling; browser reservation and CLS proofs are unrun.
