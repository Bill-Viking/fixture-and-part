# BUILD BRIEF — the reader's footing (the glossary strip, the harness readout), branch `the-readers-footing`

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; zero human steps where a machine can carry them; nothing superfluous. Principles served: make the interface truthful (every readout number read by a script at build time, never typed; a row the script cannot read says so), ship the whole product, prove quality before declaring completion.

## What this is

The words are ON MAIN (9e8fcd7, the lane's commit, Bill's go 2026-10-22): `header.glossary` (six entries) and `header.glossaryCaption` in `src/content/essay.js`; the moth gloss in section 08; in section 10 a cool callout `SPECIMEN — THE HARNESS` followed by a block `{ type: 'readout', name: 'harness' }` that `App.jsx` renders as nothing. This build draws the glossary strip under the header's legend, wires the readout block to a build-time script, and proves zero layout shift, contrast and the type floor. You write NO prose: every string is in `WORDS.md` §1 and §3 (same folder) or already in essay.js. Do NOT edit essay.js's words, claimNotes.js, STATUS.md or OPENER.md.

You are an Opus builder. Work in your git worktree on branch `the-readers-footing` off the main head you find (rename your worktree's branch if the harness named it otherwise). Commit on this branch only. Do NOT merge, do NOT deploy.

## Read first
- `WORDS.md` §1 (the strip) and §3 (the readout's rows and their exact labels); the facts block at its head.
- `src/content/essay.js`: `header` (legend, glossary, glossaryCaption); section 10's blocks.
- `src/App.jsx`: the header render (~750–768: `.legend` and its swatches), the block switch (~777–800), `figures`, the `instrument-slot`/`figure-slot` pattern from the loop build.
- `src/figures/LoopFigure.jsx` and `design/the-loop-and-the-landing/REPORT.md` — the last build's shape, gauntlet and traps.
- `scripts/read-model-file.mjs` and `src/content/fileFacts.json` (`provenance`) — the pattern for a build-time script that writes facts with a `readAt`.
- `src/styles.css`: `.legend` (~96), the instruments' readout classes (find `file-readout` ~2218–2240 and the `.mr-readout` family), tokens 33–71, `--mono`.
- STATUS.md ## Important: the "Zero layout shift" and "Contrast holds" bullets, and the harness traps below.

## Deliverables, in order

### 1. The glossary strip — in the header, under the legend
- A `<dl class="glossary">` (or an equivalent list) rendered by `App.jsx` from `header.glossary`: six rows, each `<dt>` the word in the mono face at the legend's size (12.5 px, tracked like `.legend`), coloured by `role` (`frozen` → `--frozen`, `moving` → `--moving-ink`, null → `--ink`), and `<dd>` the gloss in the mono face in `--muted`; the caption under the rows in `--muted`, smaller. Two columns at ≥ 780 px (three rows each), one column below; the strip's height reserved by CSS so it adds no shift when fonts settle (measure the box before and after `document.fonts.ready`).
- Nothing clickable in the strip (it is a definition list, not navigation); each word's accessible text is the word plus its gloss.

### 2. The readout block — `scripts/read-harness.mjs` → `src/content/harnessFacts.json` → `src/figures/HarnessReadout.jsx`
- The script (Node, run from the project root; `npm run facts:harness` added to package.json) writes `src/content/harnessFacts.json`:
  ```
  { readAt: 'YYYY-MM-DD' (UTC day, like fileFacts), 
    modelBytes: <from src/content/fileFacts.json provenance.bytes>,
    status: { bytes, lines },            // STATUS.md
    opener: { bytes },                   // OPENER.md
    memory: { files, kb } | null,        // see below
    commits: { total, dayBefore, day },  // git rev-list --count HEAD; git log --since/--until on the read day and the day before, LOCAL time of the machine
    carriedInsideModel: 0 }
  ```
  The memory folder is OUTSIDE the repository: read it from the env var `HARNESS_MEMORY_DIR` if set, else from `~/.claude/projects/<slug>/memory` where `<slug>` is the project path with `/` → `-` (the app's own rule; compute it from `process.cwd()`), counting `*.md` files and their total size in KB; if absent, write `null`. The JSON and the script carry NO absolute path and NO user name — the page is public; the lane will read the file to check.
- `HarnessReadout.jsx` renders WORDS §3's readout from the JSON, in the instruments' mono readout style on the page ground (a bordered block like `.file-readout`), rows exactly as the words file lays them out, numbers with thousands separators; the `memory` row reads `not read at build` when the JSON holds `null`; the title line `THE HARNESS, READ ON ⟨readAt⟩ FROM THIS REPOSITORY`. Wire `type: 'readout'` in `App.jsx`'s block switch to a `readouts = { harness: <HarnessReadout /> }` map, in a `<div class="instrument-slot readout-slot" id="readout-harness">`.
- The block reserves its height (seven lines of mono, fixed) so it adds no shift.

### 3. The docs
- `README.md`: Layout gains `src/figures/HarnessReadout.jsx  the harness, read at build (section 10)` and `scripts/read-harness.mjs  writes src/content/harnessFacts.json`; the "Reading the model file" section gains one paragraph saying the harness readout is read the same way (the command, what it reads, the memory folder rule).
- `interactive-guide-spec.md` §4: the glossary strip under the header; the specimen and readout in section 10.

### 4. The gauntlet (control = main at the head you branched from, exported with `git archive` into your scratchpad and served on its own port; one headless Chrome at a time; reduced motion on with instrument F on screen)
1. `npm run lint` (baseline: the one AttentionInspector warning) and `npm run build`, foreground, `pwd` read; `npm run facts:harness` run once and its JSON committed; the built bundle contains `the page's words, defined once` and `THE HARNESS, READ ON`.
2. Strings: the six words and glosses, the caption, the readout's six row labels and title — read from the DOM at 1280 and 390 and compared with WORDS and essay.js, all exact.
3. Zero layout shift at 1280 and 390: the battery from the loop build (load with the flush drained, the top-of-body positive control, scroll to the header strip, scroll to section 10, the model load, a claim mark open/close, resize 1280→1024→1280), CLS 0 on every action; the strip's box and the readout's box identical before and after `document.fonts.ready` and the model load.
4. Contrast: every strip word and gloss and every readout line against its ground, computed (fill vs ground), ≥ 4.5:1 for the words, ≥ 3:1 for the glosses at ≥ 11 px; listed.
5. Type floor: no text under 11 px in the strip or the readout at 1280, 1024, 768, 641, 390.
6. Stills to `design/the-readers-footing/stills/`: `branch-1280-header.png` (the header through the strip), `branch-390-header.png`, `branch-1280-s10-specimen.png` (the specimen callout and the readout), and `main-1280-header.png` (the control). Read each PNG before committing.

### 5. The report
`design/the-readers-footing/REPORT.md` with every number above, the file table, the choices; if the harness refuses the filename, return the whole report as text in your hand-back and say so.

## Environment traps (all measured on this project before)
- The dev server on 5173 serves the PRIMARY checkout, never a worktree — run your own `npx vite --port 5184 --strictPort` from the worktree (bash, backgrounded; the control on 5185) with a `--config` whose `cacheDir` is under your scratchpad (the worktree's `node_modules` is a symlink to the primary's), and kill both when done.
- The build tool's background commands can lose their `cd`: run lint and build in the worktree in the foreground and read `pwd` in the output.
- Headless Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; stills with `--headless --screenshot --timeout=12000`, never `--virtual-time-budget`; 390-wide needs a CDP driver with `Emulation.setDeviceMetricsOverride`; `captureBeyondViewport` DROPS imperatively transformed elements — use the viewport-clip pattern; Node's global `WebSocket` serves a raw CDP client in your scratchpad.
- CLS traps: drain the buffered observer's load flush before scoring; use the top-of-body positive control at scroll 0; the input exclusion hides shifts for 500 ms after a click.
- `sips -c` crops from the centre; cut a still's top with a Chrome render in a window of the wanted height.
- `git rev-parse --short a b c` fails on this git — `--short=7` per ref.

## Commits and report
Small commits on `the-readers-footing`, each message saying what was measured; force-add the report and the stills (`design/` is gitignored); end every message with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
Report back: the branch head, the files touched with line counts, the JSON's values, the gauntlet's numbers per measure, and anything you could not do, in plain words.
