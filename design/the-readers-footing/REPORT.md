# REPORT — the reader's footing (the glossary strip, the harness readout), branch `the-readers-footing`

Built 2026-10-22 on the Mac by an Opus 5.5 builder in a worktree, off main 36ef69f (which carried the words — the lane's 9e8fcd7 and 36ef69f, Bill's go and his seventh line). Commits: `043bae8` the strip, the readout, the script and its JSON · `678269d` the docs · `d41437a` a layout-shift fix the builder found and closed · `6f28a62` the stills. The harness refused the builder this file; the lane (Fable, session "ACT — F&P: pick the next arc") wrote it from the hand-back and its own re-run, 2026-10-22 07:2x. Not merged, not deployed at the time of writing.

## 1. What was built (the lane's `git diff --stat 36ef69f..6f28a62`: 12 files, 606 insertions; essay.js, claimNotes.js, STATUS.md, OPENER.md unchanged — checked)

| file | lines | what |
|---|---|---|
| `scripts/read-harness.mjs` | 194 new | `npm run facts:harness`: reads the model bytes from fileFacts, STATUS.md (bytes, lines), OPENER.md (bytes), the memory folder (count, KB; from `HARNESS_MEMORY_DIR`, else the app's slug path for the working directory, else the main checkout's), the commit counts by local day; a reading it cannot take is `null` |
| `src/content/harnessFacts.json` | 21 new | readAt 2026-10-22 · model 83,502,375 · STATUS 193,849 B / 339 lines · OPENER 5,582 B · memory 12 files / 126 KB · commits 211 / 21 the day before / 35 on the day · carriedInsideModel 0 |
| `src/figures/HarnessReadout.jsx` | 133 new | the readout block from the JSON; a null reading prints `not read at build` and drops its note |
| `src/App.jsx` | +122 | the glossary strip under the legend (a definition list, nothing focusable); `readouts = { harness }`; `type: 'readout'` → `#readout-harness` |
| `src/styles.css` | +111 | the strip (two columns from 780 px, four and three rows; one column below) and the readout; row heights computed from the gloss strings, widths in whole characters at 0.6 em |
| `package.json` | +1 | `facts:harness` |
| `README.md`, `interactive-guide-spec.md` | +18, +6 | Layout lines for the two new files; a paragraph on reading the harness; §4 gains the strip and section 10's specimen and readout |
| `design/the-readers-footing/stills/` | 4 PNGs | header at 1280 (1280 × 620) and 390 (390 × 780), the specimen and readout at 1280 (1280 × 558), main's header at 1280 (1280 × 398) |

The script and the JSON carry no absolute path and no user name (the lane's grep: none).

## 2. The gauntlet — the builder's runs, and the lane's own re-run at 1280 (`g-lane-1280.json`, same harness, the worktree served on 5189 through the builder's config, one headless Chrome, reduced motion)
- Lint: the one AttentionInspector warning, branch and control; the lane's own run the same. Build green (the lane's 379 ms); bundle 423.20 kB (142.05 gzipped) against 419.52 (140.84) on the control; the bundle holds `THE HARNESS, READ ON`.
- Strings: the seven words, glosses, roles and caption; the readout's title, six labels and six rows — the builder's DOM read at 1280 and 390 against WORDS.md and essay.js, all exact; the lane's source check, 12 of 12 readout strings present.
- Zero layout shift (CLS / raw):

| action | builder, branch 1280 (4 runs) | builder, main 1280 (3) | builder, branch 390 (7) | builder, main 390 (4) | lane re-run, branch 1280 |
|---|---|---|---|---|---|
| load | 0.000721 | 0.000978 / 0.001432 / 0.000978 | 0.000377 | 0.000377 | 0.000721 |
| positive control | 0.031250 | 0.031250 | 0.047393 | 0.047393 | 0.031250 |
| scroll to the strip, to section 10 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| model load | 0 / 0, 0 of 24 boxes | 0 / 0, 0 of 23 | 0 / 0 | 0 / 0 | 0 / 0 |
| claim mark open, close | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| resize → 1024 | 0 / 0.851172 | 0 / 0.851172 | 0 / 0.880924 | 0 / 0.880924 | 0 / 0.851172 |
| resize back | 0 / 0.929174 | 0 / 0.929174 | 0 / 1.000000 | 0 / 1.000000 | 0 / 0.929174 |

  The load scores are the page's own title and prose settling as fonts arrive, on both trees; neither block is in them. The strip's box (712 × 200 at 1280; 354 × 384 at 390) and the readout's (712 × 174; 354 × 406) are identical at four readings — first in the DOM with fonts loading, after `document.fonts.ready`, before and after the model load — in the builder's runs and in the lane's.
- The shift the builder found and fixed (`d41437a`): gloss widths first set in `ch` read as 0.5 em for ~75 ms while the web font was pending, so BLOCK grew a line and the rows below jumped 18 px on three cold loads in seven at 390; widths are now whole characters at 0.6 em and each row's height is computed from its string. After the fix, 0 of 7 loads at 390 shifted.
- Contrast (computed, fill vs ground): FIXTURE and BLOCK 6.24; PART 5.91; the plain words 16.60; every gloss and the caption 5.91; the readout title 6.24, labels and notes 5.91, readings 16.60. Lowest 5.91.
- Type floor: smallest text 11.5 px at 1280, 1024, 768, 641, 390, and down to 320; at 15 widths each row's computed line count equals its reserved height and the lines drawn.
- Null test: the script run in a bare folder wrote every reading `null`; rendered, each row reads its label and `not read at build`.

## 3. Found, and ruled by the lane
1. "One line each" in WORDS against the brief's two columns: in two columns every gloss takes two lines and BLOCK five; the builder built the columns. Leave it — the strip reads at a glance and the phone's single column is 19 lines, legible.
2. BLOCK's third line at 1280 opens with `·`. The words stand; leave it.
3. The memory folder's size is 126 KB of file bytes, not the 144 KB of disk blocks the lane first read. The JSON is right.
4. `readAt` is the UTC day while commits are counted on the local calendar day; between 17:00 and midnight Pacific they differ and the script prints a note. Leave it; the page's fileFacts uses the UTC day too, and the lane builds in the morning.
5. From a worktree the working directory's slug names no memory folder; the script tries the main checkout's path second. Right.
6. Commit trailers name the model that did the work. Leave it.
7. At 390 the page's mini-legend sits over the readout's lower-right corner, as it does over FIG.7 — the page's own chrome.
8. The builder's first CDP harness used port 9333, which another session's headless Chrome also uses; two runs were lost to the collision and the builder's client may have driven one of that Chrome's pages for a few seconds around 06:30–06:38. After that it let Chrome pick a port. Surfaced to Bill; nothing in this repository was affected.
9. The builder's attempt to hold fonts back during load never engaged; the first measurement in every run was taken with fonts still loading, which is the honest case.

The harness (`cdp.mjs`, `gauntlet.mjs`, `look.mjs`, `stills.mjs`, `layout.mjs`, `nullrender.mjs`, `summary.mjs`, `vite.serve.mjs`) and its JSON (`g-branch-*`, `g-fbranch-*`, `g-main-*`, `g-lane-1280`) lived in the session scratchpad under `footing/`; the control export under `footing/control/`.
