# BRIEF A — figures look pass — 2026-10-30

Implemented in the assigned company-look worktree. Local checks passed. Browser proofs belong to the caller and are **UNRUN**: visual judgment, real-font bounds, browser click/keyboard behavior, responsive screenshots, overflow, and measured CLS. No browser, GUI, network, staging, commit, push, permission change or safety-check bypass was used.

Initial git status was clean. The on-disk brief assigns this helper the figure/CSS files; the existing F&P caller claim was left alone. The narrower task excludes sync/stamp/STATUS/OPENER/close writes. Written: five authorized source files, this report, and the requested ignored dist/dist-co build outputs.

## Changes by part

- Part 1: src/figures/LadderFigure.jsx:5–30 derives both short labels and retains every original note. src/figures/LadderFigure.jsx:30–118 re-lays panels and byte windows. src/figures/LadderFigure.jsx:118–150 adds one title per panel and the caption list. The existing company TeachPair is unchanged.
- Name source: figFacts.wte has no name field. fileFacts.rowLabels has exactly one full-name key, transformer.wte.weight_quantized. The audit checks that its hero-row label equals figFacts.hero.token. Only this name is read from fileFacts; every numerical figure datum still comes from figFacts. Neither JSON was edited.
- src/figures/figFormat.js:16–21: pure helper strips transformer., drops .weight_quantized, then replaces the dot after h.<index> with a space. Verified outputs: `transformer.wte.weight_quantized → wte`; `transformer.h.0.attn.c_attn.weight_quantized → h.0 attn.c_attn`.
- Part 2: src/figures/LedgerFigure.jsx:13–20 computes both folds. src/figures/LedgerFigure.jsx:33–145 supplies four layouts, compact rack/comparison, wider brain, and the retained first notes. src/figures/LedgerFigure.jsx:145–179 supplies titles, accessible row count, state, and one button outside InstrumentHead.
- Shared caption list: src/figures/factDrawing.jsx:43–49; src/styles.css:504–511. Mono 12px/18px, muted descriptions, ink terms, 16px hanging indent. company.css:143 sets figcaption to muted mono; the list and terms set their own colours. company.css:283–285 restores the SVG palette/fonts and does not target the HTML list. company.css was not edited.
- Part 3: src/styles.css:979 arithmetic comment; heights at lines 986, 1025, 1029. Only the three requested heights and their arithmetic comment changed in the docent region. Phone 145px remains untouched.

## ViewBoxes and matching CSS reserves

| Drawing | Old viewBox size | New viewBox size | CSS aspect-ratio |
| --- | --- | --- | --- |
| .ladder-wide | 680 × 700 | 680 × 390 | 680/390 |
| .ladder-stacked | 300 × 1540 | 300 × 1370 | 300/1370 |
| .ledger-wide-3 | 680 × 1260 | 680 × 720 | 680/720 |
| .ledger-wide-all | 680 × 1260 | 680 × 1190 | 680/1190 |
| .ledger-stacked-3 | 300 × 1930 | 300 × 1135 | 300/1135 |
| .ledger-stacked-all | 300 × 1930 | 300 × 1695 | 300/1695 |

All viewBoxes start at 0 0. The six exact reserves are at src/styles.css:466–471. The ledger mounts all four drawings; data-rows and the 640px breakpoint select one. No effect, measurement, font readiness or model load selects a drawing. Every panel lies inside its viewBox. Exact reserve equality is verified statically; CLS 0 is not claimed measured.

Ladder wide tops are y=10; panel heights in order are 240, 310, 355, 370, 280. All four horizontal arrows share root y=120 (was 350). Stacked tops/heights: 10/145, 175/310, 505/195, 720/290, 1030/330. Stacked arrows retain x=150 and meet adjacent panel edges.

Ledger wide: 190 + 280 + 170 + two 10-unit gutters + two 10-unit margins = 680. Brain sheets are 120 units wide (was 80); stacked sheets 180 (was 105). The two arrow rails are at x=16 and 154 wide, x=21 and 219 stacked. The brain is identical between 3/all at each band. Rack pitch remains 100 wide / 48 stacked. Comparison wide pitch is 142, with the movement line below the numeric cells to avoid collisions in the narrower columns; stacked pitch remains 102.

## Text floor, wrapping and control reserve

| Band | Figure width | Smallest SVG text arithmetic | Result |
| --- | --- | --- | --- |
| ≥1200 | 678px | 12.4 × 678 / 680 | 12.364px |
| 800–1199 | 678px | 12.4 × 678 / 680 | 12.364px |
| 641–799, minimum at 641 | 559px | 12.4 × 559 / 680 | 10.194px |
| ≤640, specified check at 390 | 308px | 10.5 × 308 / 300 | 10.780px |
| Stacked at its cap | 360px | 10.5 × 360 / 300 | 12.600px |

Sizes remain 12.4 wide and 10.5 stacked in every state. The width contract below 390px is unchanged; this report does not claim a 10px floor at smaller windows.

“One line” is implemented as one retained note/clause per panel, wrapped by the existing textLines helper at the required type floor. **The whole piece note wraps to 5 lines wide and 2 stacked, not the brief’s two-line wide estimate.** At 104 units and 12.4-unit mono, the helper allows floor(104/(12.4×0.6)) = 13 characters per line. The 44-character whole note cannot fit two lines. Words, panel width and text floor were preserved; the requested two-line wide estimate was not forced.

| Ladder retained note | Wide physical lines | Stacked physical lines |
| --- | --- | --- |
| piece | 5 | 2 |
| table | 2 | 1 |
| vector | 3 | 1 |
| stream | 3 | 1 |
| tensor | 2 | 1 |

Ledger panels retain their first note only; these full clauses also wrap. Fold lines occupy their own row. Remaining notes are in the captions and titles. Numeric text, token labels, raw bytes, vector values, stream lengths and comparison cells were compared against the baseline render and remain byte-equal.

Button: SHOW ALL ROWS has 13 characters. 13 × (9.5 × .6 + 9.5 × .06) + 10px horizontal padding + 2px borders = 93.51px; min-width is 94px. The .ff-toolrow .mr-chip rule explicitly keeps 9.5px mono, .06em tracking, 22px height and 5px horizontal padding at every band; it wins over the phone chip rule. The toolrow reserves 24px. The click changes the drawing reserve only; the head/toolrow geometry is constant by construction. Handler exercise with an in-memory useState stub passed 3 → all → 3, including data-rows, label and aria-pressed. This is not a browser interaction proof. Reload uses the specified default state 3; no persistence was requested or added.

## String table

Baseline: git HEAD from the initially clean worktree. Exact JavaScript strings and rendered title/caption text were compared as UTF-8. Each original note occurs once in its caption description and once in its panel title per mounted SVG (two titles across ladder layouts; four across ledger layouts). Tensor titles/descriptions begin with the full tensor name plus ` · `. Both original captions remain first and byte-identical. The caption lists use the same descriptions in both copies.

| String | Verbatim text | Old → new location | Byte-equal |
| --- | --- | --- | --- |
| Ladder caption | One piece, followed into the file: the id picks a row of the word table; the row is the piece’s starting vector; the vector is the stream that falls through the walls; each wall is one weight tensor. Every number here is the file’s own, read when this page was built. | figcaption first content → unchanged | yes |
| Ladder/piece note 1 | id 340 · piece 341 of 50,257 in the word table | panel ff-note → caption dd + panel title; first clause retained (piece whole) | yes |
| Ladder/piece label | the piece | panel label → same label + caption dt | yes |
| Ladder/table note 1 | 50,257 rows × 768 numbers · stored as one byte each, u8, scale 0.0126, zero point 128 · 38,597,376 bytes | panel ff-note → caption dd + panel title; first clause retained (piece whole) | yes |
| Ladder/table full name | transformer.wte.weight_quantized | long panel label → title prefix + caption dd prefix | yes |
| Ladder/vector note 1 | 768 numbers; these are the first six · (byte − 128) × 0.0126 · the same six instrument A prints when the model is loaded | panel ff-note → caption dd + panel title; first clause retained (piece whole) | yes |
| Ladder/vector label | the row is the vector | panel label → same label + caption dt | yes |
| Ladder/stream note 1 | its first stop: wte + wpe, 5.2 long · every block adds to the same running vector · 5.2 → 367 by the last wall | panel ff-note → caption dd + panel title; first clause retained (piece whole) | yes |
| Ladder/stream label | the stream | panel label → same label + caption dt | yes |
| Ladder/tensor note 1 | 768 rows × 2,304 columns · stored as one signed byte each, i8, scale 0.0188, zero point 0 · 1,769,472 bytes · frozen: no pass changes one | panel ff-note → caption dd + panel title; first clause retained (piece whole) | yes |
| Ladder/tensor full name | transformer.h.0.attn.c_attn.weight_quantized | long panel label → title prefix + caption dd prefix | yes |
| Ledger caption | The rack as a ledger: each token’s finished parts stamped once when it arrives, read upward by every later token, never rewritten. Rows 1–7 drawn before and after token 8 arrives, with the measured move of each; the brain’s move beside it for contrast. | figcaption first content → unchanged | yes |
| Ledger/rack note 1 | token 8 arrives: it writes its own row and reads the seven above · layer 0, head 0, the first six of 64 · nothing points down | panel ff-note → caption dd + panel title; retained in drawing | yes |
| Ledger/rack label | the rack is a ledger | panel label → same label + caption dt | yes |
| Ledger/comparison note 1 | in a deployment these rows are stored once and reused: byte for byte the same | panel ff-note → caption dd + panel title; retained in drawing | yes |
| Ledger/comparison note 2 | this page’s model re-runs the whole sentence each step and its rounding can nudge a row — the largest move measured here: 0.0000 against values up to 7.8 | panel ff-note → caption dd + panel title; removed from drawing | yes |
| Ledger/comparison label | before and after | panel label → same label + caption dt | yes |
| Ledger/brain note 1 | sections 05 and 06: check the memory out, edit it, write it back, forget most of the rest | panel ff-note → caption dd + panel title; retained in drawing | yes |
| Ledger/brain note 2 | the one thing the rack never does | panel ff-note → caption dd + panel title; removed from drawing | yes |
| Ledger/brain label | the brain’s move | panel label → same label + caption dt | yes |

Explicitly authorized new strings: `the table · wte`; `one wall is one tensor · h.0 attn.c_attn`; `SHOW ALL ROWS`; `SHOW 3 ROWS`; the computed folds below; ` — 3 of 7 rows`. Existing `24 × 64`, `+ wpe[4]`, `before`, `after`, K, V, same, tokens and numbers remain unchanged. No encoding substitutions.

## Byte windows

| Layout | Window | Painted cell rects | All direct rects | Width |
| --- | --- | --- | --- | --- |
| wide | wte | 1536 | 1538 | 104 |
| wide | wall | 1536 | 1537 | 104 |
| stacked | wte | 1536 | 1538 | 260 |
| stacked | wall | 1536 | 1537 | 260 |

Counted actual server-rendered markup from the production components in both copies: 24 × 64 = 1,536 painted rects per window. Wte totals 1,538 direct rects including ground and hero overlay; wall totals 1,537 including ground. Cells still use color-mix; ff-byte-ground stays underneath. The tiny wall corner is a use reference and adds no rects.

Widths: wte 80 → 104 wide / 192 → 260 stacked; wall inset 96 → 104 wide / 128 → 260 stacked. Both now use panelW − 20 at x=10; heights are 39 / 97.5. The wte guide ends at the hero row’s right edge: local (114,172.3125) wide and (270,153.28125) stacked. Hero offset is (340 − 336 + .5) × width/64. The 24 × 64 line remains below the window. Slab proportions remain 768/2304: 104 × 34.6667 wide, 260 × 86.6667 stacked. Use scale is 1/36 in both layouts; true corner sizes are 2.8889 × 1.0833 and 7.2222 × 2.7083. The window mark and leader remain.

## Fold arithmetic and counts

last = tokens.length − 1 = 8 − 1 = 7; hidden = last − 3 = 4. Hidden zero-based indices are 3,4,5,6; all eight hidden K/V moved magnitudes are zero.

- Rack: `and 4 more, stamped the same way`.
- Comparison: `and 4 more, all the same`.
- Opposite case, altered only in memory: visible K[0] = 9, hidden K[3] = .0001 and hidden V[6] = .12345 produce `and 4 more — the largest move 0.1235`. The visible move does not enter the maximum; the hidden threshold uses strict < 1e-4. Protected data was not changed.

| Layout | Rack rows | reads-row arrows | reads-fold arrows | Comparison rows |
| --- | --- | --- | --- | --- |
| wide-3 | 4 | 3 | 1 | 3 |
| wide-all | 8 | 7 | 0 | 7 |
| stacked-3 | 4 | 3 | 1 | 3 |
| stacked-all | 8 | 7 | 0 | 7 |

Folded rack indices: 0,1,2,7. reads-row: 0,1,2. reads-fold: 3-6. Arriving row keeps ff-arrival. Each SVG has unique marker/window IDs. Folded aria-label ends ` — 3 of 7 rows`: N counts the seven stored rows compared; arriving token 8 is separate.

## Static geometry check

The audit rendered all six layouts in both copies (12 SVGs), parsed them with Python XML, and checked panel bounds, text bounds, and text/text overlap using the existing 0.6em mono measure with .8em ascent / .2em descent. All passed. Bounds below include .25em below each baseline. These are arithmetic checks; real-font visual proof remains unrun.

| Figure | Layout | Panel | Lowest text bound | Panel height |
| --- | --- | --- | --- | --- |
| Ladder | wide | piece | 201.1 | 240 |
| Ladder | wide | table | 273.1 | 310 |
| Ladder | wide | vector | 325.1 | 355 |
| Ladder | wide | stream | 348.1 | 370 |
| Ladder | wide | tensor | 242.77 | 280 |
| Ladder | stacked | piece | 127.62 | 145 |
| Ladder | stacked | table | 284.12 | 310 |
| Ladder | stacked | vector | 168.62 | 195 |
| Ladder | stacked | stream | 260.62 | 290 |
| Ladder | stacked | tensor | 305.79 | 330 |
| Ledger | wide-3 | rack | 649.1 | 700 |
| Ledger | wide-3 | comparison | 589.1 | 625 |
| Ledger | wide-3 | brain | 301.1 | 320 |
| Ledger | wide-all | rack | 1001.1 | 1050 |
| Ledger | wide-all | comparison | 1133.1 | 1170 |
| Ledger | wide-all | brain | 301.1 | 320 |
| Ledger | stacked-3 | rack | 342.62 | 360 |
| Ledger | stacked-3 | comparison | 449.62 | 455 |
| Ledger | stacked-3 | brain | 240.62 | 260 |
| Ledger | stacked-all | rack | 502.62 | 520 |
| Ledger | stacked-all | comparison | 833.62 | 855 |
| Ledger | stacked-all | brain | 240.62 | 260 |

## Docent arithmetic

Border-box: ≥1200: 24 + 4 + 64 + 13 + 2 = 107 (was 98); 800–1199: 24 + 4 + 80 + 13 + 2 = 123 (was 114); 641–799: 24 + 4 + 96 + 13 + 2 = 139 (was 130). Phone: 44 + 2 + 80 + 13 + 2 = 141; existing 145 retained, 4px spare. Shared stylesheet applies in both copies; company.css changes docent paint only.

## Local checks and limits

- `npm run lint`: exit 0, exactly one existing warning: `src/instruments/AttentionInspector.jsx:57:45: warning react-hooks(exhaustive-deps): React hook useMemo depends on rows, which changes every render`.
- Final `npm run build -- --configLoader native`: exit 0; 80 modules; 1.88s; `dist/assets/index-BwLpZOTv.js`, `index-C1dVtSms.css`.
- Final `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co`: exit 0; 61 modules; 658ms; `dist-co/assets/index-ywOIV1Rw.js`, `index-C1dVtSms.css`, `company-D9SAK5kY.css`.
- Each build had a 120-second timeout. Both retain the >500kB chunk advisory; no threshold or safety check was disabled.
- Name-source consequence: the static fileFacts.rowLabels import makes the shared 232.58kB fileFacts chunk an eager dependency. Verified in both final bundle import lists; the dataset is shared, not copied. An attempted query-isolated JSON import failed in both builds with a JSON parse error; that attempt was removed and both final builds re-run successfully. No configuration or protected fact file was changed to hide the consequence.
- `git diff --check`: pass. Changes are confined to the five authorized sources. Protected tracked files, company.css, the existing company note, STATUS and OPENER are untouched.
- Browser proofs: **UNRUN**, caller-owned. No measured CLS claim and no browser acceptance claim.

Source fingerprints at hand-back:

| File | SHA-256 |
| --- | --- |
| src/figures/LadderFigure.jsx | c76137c5a9dbafaab92021326140c88a1c49928f2262af98ae1ba89aeda89976 |
| src/figures/LedgerFigure.jsx | 071247da324a5556a1676d8d2650e756468f2baec5d17cc2d74cac1e1b7c0702 |
| src/figures/factDrawing.jsx | 47dd0cbed54ea95f7247c0db1e766950f4a37644ee331f4fba5e71d8f0c61958 |
| src/figures/figFormat.js | d0f05e3f86a3bf702e80c6673dc305531301041a349770e52d45615332764290 |
| src/styles.css | a00e83e71b543940d81563ceeda1b1f05591b50d8879de5481b54b097c1a5cca |

The repository ignores design/. This report exists on disk but plain git status does not list ignored files. No ignore rule or index was changed to force it into status. Confirmed with `git check-ignore`: design/the-figures-look-2026-10-30/BRIEF-A-REPORT.md.

## git status --short (last receipt)

```text
 M src/figures/LadderFigure.jsx
 M src/figures/LedgerFigure.jsx
 M src/figures/factDrawing.jsx
 M src/figures/figFormat.js
 M src/styles.css
```

DONE — FIG.3 and FIG.5 restyled, ledger fold and docent reserves built; local checks pass, browser proofs unrun.
