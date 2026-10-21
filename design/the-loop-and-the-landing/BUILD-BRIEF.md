# BUILD BRIEF — the loop and the landing (section 10, FIG.7), branch `the-loop`

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; zero human steps where a machine can carry them; nothing superfluous. Principles served (design/SOFTWARE-DESIGN-PRINCIPLES in the hub): make the interface truthful (the drawing claims nothing it does not say is schematic; every number is the page's own), prove quality before declaring completion (the gauntlet below, with controls).

## What this is

The words are ON MAIN already (970c2cf, the lane's commit, Bill's go 2026-10-21): section 10 `THE LOOP` sits between 09 and the charioteer (now 11) in `src/content/essay.js` with four paragraphs, a cool callout and a block `{ type: 'figure', name: 'loop' }` that `App.jsx` renders as nothing; four claim notes (`monitor`, `dial`, `drift`, `population`) are in `src/content/claimNotes.js`. This build draws the figure, wires the block type, adds the figure's "?" explainer, updates the page's own counts (eleven sections, 25 claim marks), and proves zero layout shift and legible contrast. You write NO prose: every string you put on the page is in `WORDS.md` §4 (same folder), copied character for character. Do NOT edit essay.js's paragraphs, claimNotes.js, STATUS.md or OPENER.md.

You are an Opus builder. Work in your git worktree on branch `the-loop` off the main head you find (rename your worktree's branch if the harness named it otherwise). Commit on this branch only. Do NOT merge, do NOT deploy.

## Read first
- `WORDS.md` §4 (the figure's strings) and the "facts" block at its head; `SOURCES-DIGEST.md` only if a string puzzles you.
- `src/App.jsx` ~769–800 (the block switch; `Callout`, `Duo`), the `instruments` object and how an instrument gets its slot (`.instrument-slot`, `id="inst-<name>"`).
- `src/components/InstrumentHead.jsx` and `InfoTag.jsx` (`topic` → `explainers[topic]`); `src/content/explainers.js` (house style: sentence case, lowercase first letters as the entries read, no exclamation points).
- `src/instruments/GlassPass.jsx` — the smallest instrument: its head, its `FIG.6 —` caption line (~241), its InfoTag; copy its shape for the figure's chrome.
- `src/styles.css`: tokens 33–71; `.callout` 131–149; `.inst-head` 233–290; the instrument box and caption classes GlassPass uses (find them by its classNames); `body` ~81–95 (IBM Plex Sans 17px; `--display` Space Grotesk; `--mono` IBM Plex Mono). The spec's type floor is 10 px for labels in a drawing (E's 9 px canvas labels are the one written exception).
- `interactive-guide-spec.md` §3 (tokens, the colour law — yellow is a fill, never body-size text on the page ground; `--moving-ink` for amber text; `--frozen` for steel text) and §4 (page structure — add section 10 there).
- STATUS.md ## Important: "Zero layout shift", "Contrast holds in every state", and the harness traps; `design/the-lit-row/REPORT.md` §2 for the gauntlet's shape.

## Deliverables, in order

### 1. The figure — `src/figures/LoopFigure.jsx`, one inline SVG, house style
- Chrome like an instrument's: `InstrumentHead` with eyebrow `FIG.7 — THE LOOP`, title `One pass, and the harness around it`, purpose = the WORDS §4 reading line, no note; an `InfoTag topic="loop"` beside the title the way the instruments place theirs; under the drawing a caption line in the instruments' caption class beginning `FIG.7 — ` and continuing with the reading line's first sentence (`A drawing, not an instrument: nothing here runs.`).
- The drawing, in the page's own idiom (a drawing-sheet: thin hairline frame, mono labels, role colours, flat fills, no gradients, no shadows): THE FIXTURE as a steel-outlined box in the middle (`--frozen` stroke 2 px, `--frozen-tint` fill); THE PART as an amber band entering it from the left and THE LANDING as a short amber bar-chart glyph (eight bars, one standing clear) leaving it on the right (`--moving` fills, labels in `--moving-ink`); THE HARNESS as an ink loop (`--ink` stroke 1.5 px) running from the landing back around to the part's entry, with `append` on the return leg and `run again` where the part re-enters the fixture; THE NOTES as a small stack of three offset sheets (`--card` fill, `--rule` stroke) hanging off the harness, with `write` into the stack and `read` out of it into the part; a `tool` arrow from the harness into the part. Each of the five labels in the mono face at ≥ 11 px with its one-line note from WORDS §4 under it at ≥ 10 px in `--muted`; the arrow words in the mono face at ≥ 10 px. Arrowheads as small filled triangles, one `<marker>`, in the stroke's colour.
- Geometry: a fixed `viewBox` per breakpoint computed from the breakpoint ALONE (never from fonts or content), the SVG `width: 100%` with `height: auto`, and the slot's height reserved in CSS from the same ratio so the figure adds no layout shift at any width; at ≤ 640 the drawing stacks (fixture above, notes below) rather than shrinking its type below the floor — two layouts, both drawn from one data description of the five parts and seven arrows.
- Accessibility: `role="img"` with `aria-label` = the title plus the five labels; every label a real `<text>`; nothing focusable inside (a drawing, not an instrument), nothing animated. Respect `prefers-reduced-motion` trivially (there is no motion).
- Wire it: in `App.jsx`'s block switch, `block.type === 'figure'` renders `<div className="instrument-slot figure-slot" id={`fig-${block.name}`}>` holding a `figures[block.name]` map with `loop: <LoopFigure />`.

### 2. The explainer — `src/content/explainers.js`
Add `loop:` with WORDS §4's "?" text verbatim; the `InfoTag` above opens it. Keep the object's existing order and style.

### 3. The page's own counts and the docs
- `README.md`: "ten sections" → "eleven sections"; "21 claim marks" → "25 claim marks"; in Layout add `src/figures/LoopFigure.jsx   FIG.7 — the loop (section 10)` in page order after D's line; the instruments table is unchanged (a figure is not an instrument).
- `docs/readme/banner.svg`: `10 SECTIONS · 6 LIVE INSTRUMENTS` → `11 SECTIONS · 6 LIVE INSTRUMENTS`. Regenerate `docs/readme/social-preview.png` from `/private/tmp/claude-501/-Users-bill-Projects-fixture-and-part/ee66dd2a-1099-4d4f-b97a-20d2deed0e3b/scratchpad/social-preview.svg` with the same edit (copy that SVG into `docs/readme/social-preview.svg` so the source is in the repo), rendered by headless Chrome at 1280 × 640; if the file is gone, say so and leave the PNG.
- `interactive-guide-spec.md` §4: add section 10 (eyebrow, title, the figure) and renumber the charioteer to 11 where the spec names it.

### 4. The gauntlet (the control for every measure is main at the head you branched from — the section exists there with an empty figure slot — exported with `git archive` into your scratchpad and served on its own port; one headless Chrome at a time; reduced motion on in any CDP run with instrument F on screen)
1. `npm run lint` (baseline: the one AttentionInspector warning) and `npm run build`, foreground, `pwd` in the output; the built bundle contains `One pass, and the harness around it`.
2. Anchors: `#s10` is THE LOOP and `#s11` THE CHARIOTEER; `#fig-loop` exists; the five labels and seven arrow words are present as `<text>` with the exact WORDS strings (a DOM read, listed in the report).
3. The four new claim marks open their notes: click each (`[data-claim="monitor"|"dial"|"drift"|"population"]`), read the note's heading (`EVIDENCE — reading the trace, and training against the reader` etc.) and the count of its links (2, 1, 2, 0). Total claim marks on the page = 25.
4. Zero layout shift at 1280 and 390: the buffered-observer battery from the last two reports (drain the load flush; the top-of-body positive control at scroll 0 must read > 0): load, scroll to section 10, the model load, a claim-mark open and close, the "?" open and close, the window resize 1280 → 1024 → 1280 — CLS 0.000000 on every action, listed; the figure's box height is identical before and after the model load and before and after fonts settle (`document.fonts.ready`).
5. Contrast on the figure: the raster method of the "Contrast holds" bullet, or, if its harness is gone, a computed check — every `<text>` fill against the ground it sits on (card, tint, or page) ≥ 4.5:1 for ≥ 11 px mono and ≥ 3:1 for the ≥ 10 px notes, listed per label with the two colours and the ratio.
6. Type floor: no `<text>` under 10 px at any breakpoint (read `getComputedStyle`/`font-size` in the DOM at 1280, 1024, 768, 390).
7. Stills to `design/the-loop-and-the-landing/stills/`: `branch-1280-s10.png` (the whole section 10, head to callout, via a CDP clip), `branch-390-s10.png`, and `main-1280-s10.png` (the control: the section with its empty slot). Read each PNG yourself before committing.

### 5. The report — `design/the-loop-and-the-landing/REPORT.md`
Every number above, per measure, branch against control; the file table with line counts; what you chose where the brief left room (the exact geometry, the two layouts' viewBoxes, the arrow routing); anything you could not do, in plain words. If the harness refuses the report's filename, write the same content to `design/the-loop-and-the-landing/GAUNTLET.md` and say so.

## Environment traps (all measured on this project before)
- The dev server on 5173 serves the PRIMARY checkout, never a worktree — run your own `npx vite --port 5182 --strictPort` from the worktree (bash, backgrounded; the control on 5183) and kill both when done. HMR resets the page to illustrative mode on any source edit — reload and load the real model again (cached after the first ~83 MB fetch). The worktree's `node_modules` may be a symlink to the primary's; if Vite complains about its cache, pass a `--config` that sets `cacheDir` under your scratchpad.
- The build tool's background commands can lose their `cd`: run lint and build in the worktree in the foreground and read `pwd` in the output.
- Headless Chrome is at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; stills with `--headless --screenshot --timeout=12000`, never `--virtual-time-budget`; 390-wide needs a CDP driver with `Emulation.setDeviceMetricsOverride`; `captureBeyondViewport` DROPS imperatively transformed elements — use the viewport-clip pattern. Node here has a global `WebSocket`; a raw CDP client in a script under your scratchpad needs no package. ONE browser at a time when scoring CLS.
- CLS traps: the buffered observer's load flush arrives in a later task — drain it before scoring; Chrome scroll anchoring silently absorbs a positive control inserted above the anchor — use the top-of-body control at scroll 0; the observer's input exclusion hides shifts for 500 ms after any click and can outlast that under CDP.
- `sips -c` crops from the centre; cut a still's top with a Chrome render in a window of the wanted height.
- `git rev-parse --short a b c` fails on this git — use `--short=7` per ref.

## Commits and report
Small commits on `the-loop`, each message saying what was measured; force-add the report and the stills (`design/` is gitignored); end every message with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
Report back: the branch head, the files touched with line counts, the gauntlet's numbers, and anything you could not do, in plain words.
