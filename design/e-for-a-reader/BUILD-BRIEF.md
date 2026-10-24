# BUILD BRIEF — E for a reader (instrument E), branch `e-for-a-reader`

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; zero human steps where a machine can carry them; nothing superfluous. Principles served: make the interface truthful (four panels follow one choice, and the surface says so; the curve answers the click it used to ignore), prove quality before declaring completion.

Two helpers work this brief in turn, in ONE worktree on ONE branch:
- **PART A — the build** (a headless Astra job, or an Opus builder): the code and the words, committed on the branch, lint and build green. NO BROWSER in Part A — no Chrome, no Playwright, no dev server screenshots; node-side checks only.
- **PART B — the proof** (an Opus helper with Chrome): the gauntlet and the stills, on Part A's committed head, its numbers in the hand-back.

Both: every string you put on the page is in `WORDS.md` (this folder), copied character for character, encoded as the file encodes (the page's curly apostrophe, the em dash as written). Do NOT edit STATUS.md, OPENER.md, WORDS.md, essay.js, claimNotes.js or explainers.js. Commit on branch `e-for-a-reader` only; do NOT merge, deploy or push.

## Read first
- `WORDS.md` (this folder), all five sections.
- `src/instruments/FileView.jsx`: the head (`InstrumentHead` ~1512–1526, its `purpose` prop); the bar's label row (~1557–1560: `the file, drawn to scale`); `blobEyebrow` (~1234–1255: how the window names the tensor — the word table / the position table / `block N · h.N.x` / the full name); the curve's label row and `Curve` mount (~1697–1703); `Curve` (~416–480: the path, the zero mark as a `rect` a bin wide, the ticks); `curveStat` (~1331–1354); `readout` (~1282–1320: the picked cell → `q`, `value`, `entry.quant`); the pick state `cell` (set at ~1180 by click, ~1214 by the arrow keys, cleared at ~856 on a tensor switch and ~1671/1682 on Escape and the controls); `histogram` (~792: the live or the shipped one).
- `src/lib/onnxScan.js` ~320–378: `quantizedHistogram` — 256 bins, `counts[bin]` with `binOfByte(dtype, byte)` (i8 → bin = byte + 128), `lo`/`hi`, `stats.n`; `FLOAT_BINS = 64` and the f32 histogram (~380–430: bin width `(2·extent)/64`, the clamp).
- `src/styles.css`: `.file-eyebrow` (~2144), `.file-curve*` (~2191–2222: the fill, the zero mark `--frozen`, the axis, the ticks, the stat line `height:30px`), the tokens `--moving` (amber), `--moving-ink`, `--muted`.
- STATUS.md ## Important: instrument E's bullets ("Zero layout shift", "Everything is answered by the mark the pointer is on"), and the harness traps at the end of this brief.

## PART A — the build

### A1. The head's purpose sentence — WORDS §1, verbatim (the `purpose` prop). It grows from one line to two at 1280: static, declare the height change.

### A2. The bar's label — WORDS §2, verbatim, in the `field-label` span. Static.

### A3. The curve's eyebrow — WORDS §3
- A `<p className="file-eyebrow file-curve-eyebrow">` between the curve's label row and `<Curve>`, one reserved line (the same `height:15px` rule), the text `every value of ⟨noun⟩ — the whole tensor, not only the window`, `—` before the facts load.
- ⟨noun⟩ is EXACTLY the tensor noun `blobEyebrow` prints before its first ` · `: factor that noun out into one helper (`tensorNoun(entry)`) used by both, so the two lines can never name the tensor differently.

### A4. The pick on the curve — WORDS §4
- `Curve` takes a new prop `pick` (`null`, or `{ bin }`): when set, draws a `rect` a bin wide, `y=0`, `height=104`, `className="file-curve-pick"` (fill `--moving`), AFTER the fill path (on top of it) and after the zero mark. The bin: byte tensors `binOfByte(dtype, rawByte)` (export it from onnxScan.js if it is not); f32 vectors the same bin arithmetic the f32 histogram uses (clamped), factored into one exported function so the mark and the histogram agree.
- A new reserved line under the stat line: `<p className="file-curve-pick-line">` in the stat line's face (mono 10 px, `line-height:15px`), `height:30px` (two lines reserved — the picked line wraps to two at 390), `color: var(--muted)` idle and `var(--moving-ink)` with `is-on` when a pick is on. Its strings per WORDS §4: idle; byte tensor; f32 vector. The value exactly as the readout's arith line prints it (`signed(value, 4)`); the share `(counts[bin] / stats.n * 100)` to one decimal, or the string `under 0.1%` below 0.1; the window count = the number of entries of `view.data` equal to the picked raw value (byte tensors: the stored byte; f32: the same number) and the window's cell count `view.data.length`, both with thousands separators (`count()`).
- The pick follows `cell` exactly as the readout does (the same `i` into `view.data`; the same out-of-range → idle). It clears when `cell` clears (Escape, the controls, a tensor switch): no new state.

### A5. Node-side checks (Part A's own, before the hand-back)
- `npm run lint` (baseline: one AttentionInspector warning) and `npm run build`, foreground, `pwd` read; the bundle holds `the bar — the whole file, drawn to scale`, `the whole tensor, not only the window`, `click a square in the window and its value is marked here, on the curve`, `squares in this window hold it`.
- A small node script against `src/content/fileFacts.json`: for `transformer.wte.weight_quantized` and one block tensor, print `counts[bin]/n` for three bytes and the bin of byte 0 / byte 255, so Part B can check the page's numbers against them.
- Commit in small plain commits; the hand-back names the head sha and the file table (+/−).

## PART B — the proof (Chrome, outside any sandbox)
Control = main at the head the branch left, exported with `git archive` into your scratchpad and served on its own port; one headless Chrome at a time; reduced motion ON.
1. Lint and build again on the head you were given; the bundle strings above.
2. Strings from the DOM at 1280 and 390 against WORDS, exact: the purpose sentence; the bar's label; the curve eyebrow for the word table, the position table, a block tensor (`block 2 · h.2.mlp.c_fc`) and an f32 vector (switch tensors through the list); the idle pick line; the picked line for a byte tensor and for an f32 vector.
3. The numbers: for the picked byte tensor cell, recompute the share from the shipped `fileFacts.json` histogram (`counts[bin]/n`) and the window count from the window's own bytes (read them from the page's state or re-derive from the file bytes at the window's offset), and compare with the line, exact; the same for the f32 pick.
4. The mark: the `.file-curve-pick` rect's x equals the bin's x (`bin · 680/bins` ± a bin's width) at both widths; it sits above the fill; it is gone when nothing is picked; the arrow keys move it; Escape clears it; a tensor switch clears it.
5. Zero layout shift at 1280 and 390 with instrument E in view: the battery (load, the top-of-body positive control, model load, a click in the window, four arrow keys, Escape, a tensor switch from the list, a tensor switch from the bar) — CLS 0 on every action; report `cls` and `raw` both. The static changes (the purpose sentence's second line at 1280, the two new reserved lines) declared with their pixel heights.
6. Type and contrast: the eyebrow and the pick line ≥ 10 px rendered at 1280, 1024, 768, 641, 390; the pick line's amber ink on the card ground ≥ 4.5; the amber mark against the curve's fill and against the ground, computed.
7. Focus and names: the Tab walk through E — the count of focusable controls and that every one has a name, on main and on the branch.
8. Stills to `design/e-for-a-reader/stills/`: `branch-1280-e-idle.png` (the head through the bar, idle), `branch-1280-curve-byte-pick.png` (the window, the readout, the curve with the amber mark and the picked line, a byte tensor), `branch-1280-curve-f32-pick.png`, `branch-390-curve-byte-pick.png`, `main-1280-e-idle.png` and `main-1280-curve.png` (the controls). Read each PNG before committing.
9. The hand-back: every number, the strings PASS list, the file table, anything you could not drive. The harness refuses a subagent a file named REPORT.md — return the report as text; the lane writes the file.

## Environment traps (all measured on this project before)
- The dev server on 5173 serves the PRIMARY checkout, never a worktree — serve the worktree with your own Vite on a free port (a config that sets `root`, a `cacheDir` under your scratchpad, the react plugin from the project's node_modules; the worktree's `node_modules` is a symlink to the primary's) and the control on another; kill both when done. HMR resets the page to illustrative mode on any source edit — reload and load the real model again (cached after the first ~83 MB fetch).
- Headless Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. LET CHROME PICK ITS OWN DEBUGGING PORT (`--remote-debugging-port=0`, read DevToolsActivePort): port 9333 belongs to another session. Stills with `--headless --screenshot --timeout=12000`, never `--virtual-time-budget`; 390-wide needs `Emulation.setDeviceMetricsOverride`; `captureBeyondViewport` DROPS imperatively transformed elements — use the viewport-clip pattern; Node's global `WebSocket` serves a raw CDP client.
- CLS traps: drain the buffered observer's load flush before scoring; the top-of-body positive control at scroll 0; the input exclusion hides shifts for 500 ms after a click and can outlast that under CDP — report `cls` and `raw` both.
- Background commands can lose their `cd`: run lint and build in the worktree in the foreground and read `pwd` in the output.
