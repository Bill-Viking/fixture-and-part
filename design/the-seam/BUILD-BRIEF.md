# BUILD BRIEF — the seam (arc 6), branch `the-seam`

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; zero human steps where a machine can carry them; nothing superfluous. Principles served (design/SOFTWARE-DESIGN-PRINCIPLES in the hub): make the interface truthful; prove quality before declaring completion.

## What this is

Section 03 ("Existence in discrete passes") gains one WARM callout, `THE AUTHOR — THE SEAM`, placed right after the cool `ANALOGY — THE GHOST` callout: the page's author on the seam between one moment and the next, in his own words, with a short coda in the essay's voice. The moth callout in section 08 already points at "section 03's seam"; this is what it points at. The words are approved and COMMITTED on this branch, with three claim marks inside the callout (`parade` THEORY, `sleep` THEORY, `scrapbook` ANALOGY) and their three notes. Your job is the page work that renders it honestly, the docs, and the measured proof.

You are an Opus builder. Work in the existing worktree at the path you were given, on branch `the-seam` (based on main cb52d64; `git log --oneline -3` shows the two lane commits above it). Commit on this branch only. Do NOT merge, do NOT deploy, do NOT edit STATUS.md, OPENER.md, `src/content/essay.js`, `src/content/claimNotes.js`, `src/content/fileFacts.json` or `src/lib/realModel.js`. If a note's text or a url must change, say so in your report. No new dependencies. A sibling branch `popover-law` is being built in parallel and changes `src/components/usePopoverPlacement.js`, `src/components/ClaimNotes.jsx`, `src/components/InfoTag.jsx` and the popover rules in `src/styles.css` (~lines 377–470): touch none of those files or lines; the lane rebases.

## Already on the branch (read these first)

- `design/the-seam/WORDS.md` — the approved text, the marks and their ids, the proof shape.
- `src/content/essay.js` section '03' — the new block: `type: 'callout'`, `variant: 'warm'`, whose `html` is TWO paragraphs (`<p>…</p><p>…</p>`) carrying three `<button type="button" class="claim-mark" data-claim="…">` marks.
- `src/content/claimNotes.js` — the three new entries at the end; `design/the-seam/SOURCES-DIGEST.md` is what they were written from.
- `src/App.jsx` `Callout` (~line 51): renders the label as `span.lbl` and the html through `<Html as="span">`. The other five callouts on the page are one paragraph of bare inline html each; this one is two `<p>` blocks, and a `<p>` inside a `<span>` is not valid html.
- `src/styles.css` `.callout` rules (~131–134) and the global `p{margin-bottom:18px}` / `p:last-child{margin-bottom:0}` (~112–113).

## Deliverables, in order

### 1. A callout that can hold paragraphs

Change `Callout` so its body is a block, not a span (`<Html as="div" className="callout-body">` or the like), and give `.callout p` its rhythm: the global paragraph margin (18 px) or a tighter one that reads right inside a 16 px callout — measure and say what you chose. The label stays above, `display:block` as now. The five EXISTING callouts must render pixel-identical to main after this change — that is a gauntlet item, not an assumption. If a `<p>` inside the old span already rendered identically in every browser that matters, still make the change: the page says what it does, and a block that holds blocks is honest markup.

### 2. The marks inside a callout

`.claim-mark` was designed for the 17 px prose (line box 28.05 px). Inside the callout the text is 16 px at 1.65 (26.4 px lines). Measure that the callout's line pitch is 26.4 px on every line, the lines carrying a mark included, and that no mark changes the callout's height (hide the three marks with a temporary rule and compare the callout's height: identical). If the 11.5 px mark reads too large against 16 px text, say so with a still — do not change the rule; the lane decides.

### 3. Docs (yours)

- `interactive-guide-spec.md`: where section 03 is described, add the seam callout in one or two sentences; wherever the claim-mark count is stated (eighteen / 18), make it twenty-one / 21; the copy rules are unchanged.
- `README.md`: nothing unless it states the count.

## Verification gauntlet — measure everything, report numbers

The control is main cb52d64 in a second worktree under your scratchpad, same harness, same run.

1. `npm run lint` and `npm run build` green; every chunk size against main (the essay's chunk grows by the callout — say by how many bytes).
2. **Prose proof.** `git diff main -- src/content/essay.js` is exactly ONE hunk, an insertion, inside section '03' after the ghost callout; `git diff main -- src/content/claimNotes.js` is exactly ONE hunk appending three entries; `git diff main --stat` lists nothing else under `src/content`, and nothing under `src/instruments`, `src/lib` or `src/components`.
3. **Mapping proof.** `window.__claimCheck()` reads `{marks: 21, notes: 21, missing: [], orphan: [], unnamed: []}`; show it can fail (temporarily remove one entry in your worktree, run, restore).
4. **Links.** Open each of the five new urls once in the Browser pane and confirm the page that loads carries the paper's or text's title (davidhume.org: "Of personal identity"; accesstoinsight: the sutta page; PubMed 12757822: "Is perception discrete or continuous?" — the PubMed page answers scripts with a cookie shell, so judge it in the Browser pane, not by curl; the Thompson PDF: "Does consciousness disappear in dreamless sleep?"; CDC: "About Sleep"). A 404 or an unrelated page is a STOP — do not remove or replace a source; report it.
5. **Zero CLS**, real mode, at 1280 and 390, the page's standing method (buffered PerformanceObserver drained after load, plus the structural-box geometry diff over the header, every section, every instrument slot and the foot): open each of the three new marks; Escape; outside mousedown; open a second while one is open; scroll 400 px with one open; spot-check three old marks (`rat`, `hsam`, `saccade`) the same way. Every action 0.000000 and no structural box moved; the geometry diff across the model load moves nothing in section 03; the unanchorable positive control (40 px at the top of the body at scroll 0) reads non-zero in the same run.
6. **The existing callouts are untouched.** Render each of the five other callouts (ghost in 03, the moth in 08, and the three others — find them by their labels) at 1280 and 390 on main and on this branch, same scroll position, and pixel-diff the callout's box: max channel delta 0 (state any anti-aliasing tolerance you had to allow, and why).
7. **Keyboard.** A real Tab walk reaches all 21 marks, each with a distinct accessible name; on a new mark Enter opens, focus lands in the dialog, Tab reaches the first link, Escape returns focus to the mark. Focusable controls in instrument F unchanged (57 real / 41 illustrative).
8. **Contrast.** `.claim-mark` text on the callout's card ground, and the callout's own text, ≥ 4.5:1, numbers stated (stylesheet sweep is valid: flat ground, no texture).
9. **Instrument F untouched.** Quote the three viewBox attributes at 1280, 800 and 390; they equal STATUS's (`0 0 1166 2351.6499999999996`, `0 0 1166 3210.4`, `0 0 1166 5487.599999999999`). Tour stop counts unchanged (35/33/19).
10. **Copy and scrub.** `grep -rn "/Users/\|Fable\|Opus\|Sonnet\|Haiku" src interactive-guide-spec.md README.md` — hits only where they existed on main.
11. **Stills** to `design/the-seam/stills/` (gitignored; list every path in the report): 1280 — the WHOLE of section 03 in one tall capture (heading, both paragraphs, the stepper's head, the ghost, the seam) — this is the still the author judges; 1280 — the seam callout with `parade` open; 390 — the seam callout's top with `sleep` open; 390 — the seam callout's foot with `scrapbook` open.

## Environment traps (all measured on this project before)

- Dev server: start it from YOUR worktree (`npm run dev` via the preview tool if it can run from that folder; otherwise from Bash in the background, and say so). Port 5173 may be held by the sibling builder — Vite then picks the next free port and prints it; read it from the log. Kill your server when done. HMR resets the page to illustrative mode on any source edit — reload and load the real model again (cached after the first ~83 MB fetch).
- Headless Chrome is at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; stills with `--headless --screenshot --timeout=12000`, never `--virtual-time-budget` (hangs on Vite's HMR socket); 390-wide needs a CDP driver with `Emulation.setDeviceMetricsOverride`; `captureBeyondViewport` DROPS imperatively transformed elements — use the viewport-clip pattern. Node here has a global `WebSocket`; a raw CDP client under your scratchpad needs no package.
- CLS traps: the buffered observer's load flush arrives in a later task — drain it before scoring; the observer's input exclusion hides shifts for 500 ms after a click — score ≥ 600 ms clear; Chrome scroll anchoring silently absorbs a positive control inserted above the anchor — use the top-of-body control at scroll 0.
- `git rev-parse --short a b c` fails on this git — use `--short=7` per ref.

## Commits and report

Small commits on `the-seam`, each message saying what was measured; end every message with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
Write the report to `design/the-seam/REPORT.md` and force-add it (`git add -f`; design/ is gitignored) as the last commit: what was built (files), every gauntlet number, the stills' paths, anything found and NOT fixed, and any note text or url you believe is wrong (quote it; do not edit it). Your final message is the same report. Leave the tree clean; leave the branch for the lane to verify, rebase, merge and deploy.
