# REPORT — the loop and the landing (section 10, FIG.7), branch `the-loop`

Built 2026-10-21 on the Mac by an Opus 5.5 builder in a worktree, off main e0bc675 (which already carried the section's words, the lane's 970c2cf). Commits: `72dd45d` the figure, the wiring, the explainer · `bb5dcac` the counts and the docs · `8f8f177` the stills. The harness refused the builder this file ("Subagents should return findings as text, not write report files"); the lane (Fable, session "ACT — F&P: pick the next arc") wrote it from the builder's hand-back and its own re-run, 2026-10-21 17:5x. Not merged, not deployed at the time of writing.

## 1. What was built (the lane's `git diff --stat e0bc675..8f8f177`: 13 files, 414 insertions, 8 deletions; essay.js, claimNotes.js, STATUS.md, OPENER.md unchanged — checked)

| file | lines | what |
|---|---|---|
| `src/figures/LoopFigure.jsx` | 291 new | FIG.7: one data description (five parts, six arrows, eight bars) and two layouts drawn from it — wide `viewBox 0 0 680 312` above 640 px, stacked `0 0 300 404` at 640 and below (max-width 360, centred); both SVGs in the DOM, CSS shows one, `display:none` takes the other out of layout and the accessibility tree; `role="img"`, aria-label the title plus the five labels; 0 focusable elements, 0 animations; one `<marker>`, every stroke and arrowhead ink |
| `src/App.jsx` | +20 | `figures = { loop: <LoopFigure /> }`; `type: 'figure'` renders `<div class="instrument-slot figure-slot" id="fig-<name>">` |
| `src/components/InstrumentHead.jsx` | +17 | optional `info` prop: the "?" badge after the title's last word in a nowrap span; the six instruments pass nothing and render as before; the title line stays 24 px at 1280 (48 at 390) with the badge at `vertical-align:-1px` |
| `src/content/explainers.js` | +4 | `loop`, title `the loop`, body = WORDS §4 verbatim (the lane checked the string) |
| `src/styles.css` | +39 | `.inst-title-tail`; the FIG.7 block with an `aspect-ratio` per layout |
| `README.md` | ±5 | "eleven sections", "25 claim marks", the figure's Layout line after D's |
| `docs/readme/banner.svg`, `social-preview.svg` (new, 27 lines), `social-preview.png` (1280 × 640, 42,702 B) | | `11 SECTIONS · 6 LIVE INSTRUMENTS`; the preview's source now in the repo and the PNG re-rendered from it |
| `interactive-guide-spec.md` | ±15 | §4: FIG.7 in the figure table, "sections 01–11", the section-10 entry, claim-mark counts 25 (14 EVIDENCE, 7 THEORY, 4 ANALOGY) |

Where the brief left room: the harness loop carries `append` (landing → down → along the bottom → up the left → into the part's left end); `tool` branches off the left leg into the part from below; `write` from the harness into the stack, `read` from the stack up into the part; `run again` from the part into the fixture; the pass's own fixture → landing arrow carries no word. Type in viewBox units sized to keep the floor at each layout's smallest rendering (wide 13.4 / 12.2 units; stacked 12 / 10.5). A note that does not fit breaks at its own ` · `, every line but the last keeping its trailing space, so each `<text>`'s textContent is the WORDS string exactly.

## 2. The gauntlet — the builder's run, and the lane's own re-run of the branch at 1280 (`g-lane-1280.json`, same harness, the worktree served on 5182 with the builder's cacheDir config, one headless Chrome, reduced motion on)
- Lint (foreground, `pwd` read): the one `AttentionInspector.jsx:55` warning, branch and control; the lane's own run the same. Build green; the lane's build 370 ms; the bundle holds `One pass, and the harness around it` (1 file). Bundle 413,190 B vs 407,460 on the control (+5,730; gzip 138.62 vs 136.36 kB); CSS 50.63 vs 49.61 kB.
- Anchors: `#s10` = `10 — THE LOOP` / `The fixture never learns; the harness takes notes`; `#s11` = `11 — THE CHARIOTEER` / `Who drives the horses`; `#fig-loop` present on the branch, absent on the control (main renders the block as nothing). Visible SVG `loop-wide 0 0 680 312` at 1280, `loop-stacked 0 0 300 404` at 390.
- The 15 `<text>` strings, the head (eyebrow, title, purpose = the reading line), the caption `FIG.7 — A drawing, not an instrument: nothing here runs.` and the "?" body: all equal to WORDS §4 character for character — the builder's DOM read at both widths, the lane's source check (18 of 18 strings in LoopFigure.jsx; the explainer body verbatim) and the lane's DOM re-run at 1280 (`textCount 15`, every label, note and arrow word present).
- The four claim marks open their notes with the right heading and link count: monitor 2, dial 1, drift 2, population 0; 25 marks on the page, branch and control; the lane's re-run the same.
- Zero layout shift (CLS / raw), the buffered observer's load flush drained, the positive control at scroll 0 reading 0.0625 at 1280 and 0.094787 at 390 on every run:

| action | builder, branch 1280 | builder, main 1280 | builder, branch 390 | builder, main 390 | lane re-run, branch 1280 |
|---|---|---|---|---|---|
| load | 0 / 0 | 0.001432 / 0.001432 | 0 / 0 | 0 / 0.000377 | 0 / 0 |
| scroll to section 10 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0, 0 of 21 boxes moved |
| model load (real distilgpt2) | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 (1.03 s, cached) |
| four claim marks, open then close | 0 / 0 ×8 | 0 / 0 ×8 | 0 / 0 ×8 | 0 / 0 ×8 | 0 / 0 ×8 |
| FIG.7 "?" open, close | 0 / 0 ×2 | — | 0 / 0 ×2 | — | 0 / 0 ×2 |
| resize → 1024 | 0 / 0.382580 | 0 / 0.382580 | 0 / 0.880924 | 0 / 0.880924 | 0 / 0.382580 |
| resize back | 0 / 0.299117 | 0 / 0.299117 | 0 / 0.910475 | 0 / 0.910475 | 0 / 0.299117 |

  The resizes are the page's own reflow (Chrome flags the emulated resize as input), identical to the control to six places; at 390 the battery's resize swaps FIG.7's layout and the numbers still match. The control's first-load 0.001432 is a 1–3 px font settle of the h1 and one line in section 01, seen on both trees on a cold first load only. The figure's box: 499.671875 px at 1280 and 700.109375 at 390 in four readings (first in the DOM with fonts `loading`, after `document.fonts.ready`, before and after the model load); the lane's re-run read 499.671875 at all three of its readings.
- Contrast (computed: each `<text>`'s fill against the ground under three points of its box, since the raster harness is not in this scratchpad): THE FIXTURE `#1E5AA8` on `#E8EFF8` 5.88; its note `#585F6A` on `#E8EFF8` 5.56; THE PART and THE LANDING `#7A5900` on `#FFFFFF` 6.45; the notes on card 6.44; THE HARNESS, THE NOTES and the five arrow words `#14161A` on card 18.11. Same pairs at 390; the lane's re-run the same 15 rows. Lowest 5.56; no text on the amber fill.
- Type floor, rendered px (font units × the SVG's scale): 1280 / 1024 / 768 wide at scale 0.997 → labels 13.36, notes and words 12.16; 641 (the narrowest wide case) at 0.822 → 11.02 / 10.03; 390 stacked at 1.067 → 12.80 / 11.20. The lane's re-run read the same five rows.
- Stills (viewport-clip pattern; read by the builder and by the lane): `stills/branch-1280-s10.png` 1280 × 2232, `branch-390-s10.png` 390 × 3681, `main-1280-s10.png` 1280 × 1682. Section 10 is 549.67 px taller on the branch at 1280 — the figure's 499.67 plus margins — the one declared static change.

## 3. Found, and ruled by the lane
1. Arrow words: the brief said seven, WORDS gave five; the drawing carries the five on six arrows (the pass's own arrow unlabelled). The brief miscounted; the words stand. Leave it.
2. Below a 359 px window the stacked notes fall under the 10 px floor (about 8.3 px at 320). Every width the page is measured at (390 up) passes. Filed as a small candidate; leave it.
3. The build commits' trailer names Opus 5.5, the model that did the work. Leave it.
4. At 390 the page's fixed mini-legend sits over the callout's lower-right corner — the page's own chrome, the same on main. Leave it.
5. The explainer's title `the loop` is the builder's (WORDS gave only the body). Keep.

The harness (`cdp.mjs`, `gauntlet.mjs`, `look.mjs`, `evalx.mjs`, `loadonly.mjs`, `svgshot.mjs`, `summary.mjs`) and its JSON (`g-branch-1280/390`, `g-main-1280/390`, `g-lane-1280`) lived in the session scratchpad under `loop/`; the control export under `loop/control/`.
