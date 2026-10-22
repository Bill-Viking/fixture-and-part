# BUILD BRIEF — F for a reader (instrument F), branch `f-for-a-reader`

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; zero human steps where a machine can carry them; nothing superfluous. Principles served: make the interface truthful (the drawing says on its face what its shapes are; a card never hides another), design for interruption (a click mid-tour is honoured without stopping the tour), prove quality before declaring completion.

## What this is

Six changes to instrument F, all from Bill's reading of the live page on 2026-10-22, approved as `WORDS.md` in this folder (Bill's go, no strikes). Two are behaviour: ONE CARD AT A TIME (a live bug: the pinned card and the pointer's card overlap) and THE CLICK RIDES THE RUN (a click during the tour no longer pauses it). Four are strings: two clauses in the head's purpose sentence, a stations label on the drawing, a curves legend under it, and the wall-cell card rewritten in instrument E's grammar. Every string you put on the page is in `WORDS.md`, copied character for character; the tour's two rule sentences change as §2 says. Do NOT edit essay.js, claimNotes.js, explainers.js, STATUS.md or OPENER.md.

You are an Opus builder. Work in your git worktree on branch `f-for-a-reader` off the main head you find (rename your worktree's branch if the harness named it otherwise). Commit on this branch only. Do NOT merge, do NOT deploy.

## Read first
- `WORDS.md` (this folder), all seven sections.
- `src/instruments/ForwardMap.jsx`: the two cards — `pinCard` (~2141), `paintHoverCard` / `hideHoverCard` (~2159–2195), `inspect` and `clearReadout` (~1860), the wall pointer handlers (~2020–2130); `onSheetPointerDown` (~1819–1832) where the tour is paused on a click; the tour state and `openTour`/`stepTo` (~1001, ~1660–1710); the head (`InstrumentHead` ~2590); `tourLine` (~2497–2505); the rows under the drawing (~2520); the landing legend (~3484–3493); the BLOCK/HEAD labels and the wall bands' geometry; `placeCard` and its avoid list.
- `src/lib/tour.js`: `wallLead` (~185–198), `carrierLead`/`carrierDetail` (~123–140) — the card and the readout row print these; the `q`/`w4` helpers.
- `src/lib/forwardMap.js`: `TRANSFER_FLOOR`, `MAP_STOPS`.
- STATUS.md ## Important: the instrument-F bullets — "Zero layout shift" (instrument F adds no third one; the twelve-records-per-tour MutationObserver measure; the walls digest FNV-1a 2776442851 at 1280 / 923787317 at 390; the viewBox heights per breakpoint; 57 focusable controls, all labelled; "Everything on the sheet is answered by the mark the pointer is actually on"; "Contrast holds in every state, raster method"), and the harness traps below.
- `design/the-loop-and-the-landing/REPORT.md` and `design/the-readers-footing/REPORT.md` for the gauntlet's shape.

## Deliverables, in order

### 1. One card at a time
- Rule (WORDS §1): while the pointer's card is painted the pinned card is hidden (`display:none` on the pinned card's group, or the pinned card not rendered while a hover card is live); when the pointer leaves the walls (`hideHoverCard`) the pinned card returns; a click on another cell re-pins there (and the hover card for that cell hides, as today); Escape clears both. Keyboard: the roving cursor's card is the pointer's card for this rule.
- The pinned card's `placeCard` avoid list and the hover card's stay as they are.

### 2. The click rides the run
- `onSheetPointerDown`: remove the `setTour(... playing: false ...)`; everything else it does stays (the readout clears on empty air; buttons answer for themselves). Rewrite the comment above it to say the rule.
- The card a click pins during a playing tour stays until the next stop's reveal replaces it (a stop that opens its own card replaces the pinned one; a stop that opens none leaves it) or Escape; find where a stop's reveal writes `inspect`/the readout and make that the replacement point. The tour's own controls (`.mr-docent`) unchanged.
- `tourLine`: the two sentences per WORDS §2, the rest of each line verbatim.

### 3. The head's purpose sentence — WORDS §3, verbatim.

### 4. The stations label — WORDS §4
- On the drawing, along the left edge of the stack of walls, in the walls' label face and colour (the BLOCK/HEAD labels' `--frozen-on-screen`), ≥ 10 px rendered at every breakpoint: rotated −90° reading top to bottom beside the BLOCK labels at ≥ 641 (if the rotated run would fall under the floor at a breakpoint, stack it in short lines instead); at ≤ 640 one horizontal line above BLOCK 0. The label must not cross a wall, a stream or a carrier; it lives in the left gutter. If the gutter is too narrow at a breakpoint, widen the gutter by a declared amount and state the viewBox change.

### 5. The curves legend — WORDS §5
- One line under the drawing, above the landing legend, in the landing legend's mono caps and size; `0.15` from `TRANSFER_FLOOR`; at ≤ 640 two lines. It adds height under the drawing: declare it (it is static, a function of the breakpoint alone).

### 6. The wall-cell card — WORDS §6
- `wallLead` in tour.js returns the lead; a new `wallDetail` returns the detail; the card prints the lead, the readout row prints lead + detail (the carrier card already works this way: `carrierLead`/`carrierDetail`/`carrierWhy`). Positive and negative bytes per WORDS. Thousands separators; scale to 3 s.f.; weight to 4 s.f., as today.

## The gauntlet (control = main at the head you branched from, exported with `git archive` into your scratchpad and served on its own port; one headless Chrome at a time; reduced motion ON for every CDP run that has instrument F on screen, except the two tour tests below, which need the timer and are run with reduced motion OFF)
1. `npm run lint` (baseline: one AttentionInspector warning) and `npm run build`, foreground, `pwd` read; the bundle holds `the solid curves, the only thing that crosses` and `SIX STATIONS, TOP TO BOTTOM`.
2. Strings: the head's purpose, the stations label, the curves legend (with the printed floor), the two tour rule sentences, a wall-cell lead and detail for a positive byte and for a negative byte (find a negative cell in the window first) — read from the DOM at 1280 and 390 against WORDS, exact.
3. THE CARD TEST (CDP, 1280, real model loaded): click cell A → one card visible (pinned at A); move the pointer to cell B (not A) → exactly one card visible (the pointer's, at B), the pinned hidden; move the pointer off the walls → exactly one card (the pinned, at A); click B → one card, pinned at B; Escape → none. Count cards with `display !== 'none'` each step; list.
4. THE CLICK TEST (CDP, 1280, reduced motion OFF): play the tour; at stop ~10, click a stream token and a wall cell; assert the tour keeps playing (the stop index advances within the next stop's `ms`; `tour.playing` stays true — read it from the DOM: the PAUSE button still reads PAUSE); the clicked cell's card is pinned; it is replaced at the next stop that opens a card; Escape clears it. Then the control: on main the same click reads RESUME (paused) — list both.
5. Zero layout shift at 1280 and 390: the battery (load with the flush drained, the top-of-body positive control, model load, RUN THE PASS, STEP×2, the tour played through, a wall click, Escape) — CLS 0 on every action; the twelve-records-per-tour MutationObserver count re-measured (the cards are overlays; the count may change — report the number and what the records are).
6. The walls digest (FNV-1a over every wall cell's `d` + opacity, document order) unchanged: 2776442851 at 1280 and 923787317 at 390.
7. Geometry: the drawing's viewBox per breakpoint on main and on the branch; any change declared and explained (the gutter, the legend line).
8. Focus and names: the Tab walk — the count of focusable controls in F and that every one has an accessible name (57 on main; report the branch's).
9. Contrast: the stations label and the curves legend against their grounds (computed; or the raster method if its harness is in the scratchpad), listed; the type floor at 1280, 1024, 768, 641, 390 for the label and the legend (≥ 10 px in the drawing, ≥ 11 under it).
10. Stills to `design/f-for-a-reader/stills/`: `branch-1280-head-and-top.png` (the head through BLOCK 1 with the stations label), `branch-1280-legend.png` (the drawing's foot with both legends), `branch-1280-card-midtour.png` (a pinned card while the tour plays, PAUSE still showing), `branch-390-top.png`, and `main-1280-head-and-top.png`. Read each PNG before committing.

## The report
`design/f-for-a-reader/REPORT.md` with every number, the file table, the choices; if the harness refuses the filename, return the whole report as text in your hand-back and say so.

## Environment traps (all measured on this project before)
- The dev server on 5173 serves the PRIMARY checkout, never a worktree — serve the worktree with your own Vite on a free port (the footing builder's `vite.serve.mjs` pattern: a config that sets `root`, a `cacheDir` under your scratchpad, and the react plugin loaded from the project's node_modules; the worktree's `node_modules` may be missing — symlink it to the primary's, gitignored) and the control on another; kill both when done. HMR resets the page to illustrative mode on any source edit — reload and load the real model again (cached after the first ~83 MB fetch).
- Headless Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. LET CHROME PICK ITS OWN DEBUGGING PORT (`--remote-debugging-port=0` and read the port from its stderr/DevToolsActivePort): port 9333 belongs to another session's Chrome on this machine and a collision drove its page last time. Stills with `--headless --screenshot --timeout=12000`, never `--virtual-time-budget`; 390-wide needs `Emulation.setDeviceMetricsOverride`; `captureBeyondViewport` DROPS imperatively transformed elements — use the viewport-clip pattern; Node's global `WebSocket` serves a raw CDP client.
- CLS traps: drain the buffered observer's load flush before scoring; the top-of-body positive control at scroll 0; the input exclusion hides shifts for 500 ms after a click and can outlast that under CDP — report `cls` and `raw` both.
- The build tool's background commands can lose their `cd`: run lint and build in the worktree in the foreground and read `pwd` in the output.
- `sips -c` crops from the centre; cut a still's top with a Chrome render in a window of the wanted height. `git rev-parse --short a b c` fails on this git — `--short=7` per ref.

## Commits and report
Small commits on `f-for-a-reader`, each message saying what was measured; force-add the report and the stills (`design/` is gitignored); end every message with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
Report back: the branch head, the files touched with line counts, the gauntlet's numbers per measure (branch against control), the card test and the click test step by step, and anything you could not do, in plain words.
