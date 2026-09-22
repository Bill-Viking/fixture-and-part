# BUILD BRIEF — the popover law (the honest pass's two loose ends), branch `popover-law`

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; zero human steps where a machine can carry them; nothing superfluous. Principles served (design/SOFTWARE-DESIGN-PRINCIPLES in the hub): make the interface truthful; prove quality before declaring completion.

## What this is

The page has two popovers — the "?" badge's explanation (`InfoTag.jsx`, 16 mount sites over 22 topics in `explainers.js`) and the claim note (`ClaimNotes.jsx`, 18 marks) — placed by one hook, `src/components/usePopoverPlacement.js`. The honest pass (2026-09-12) left two loose ends in that law, both ruled now:

**(a) Every popover is anchored to the page.** Today the badge's box is `position:fixed` and re-placed on every scroll (`follow: true`); with a badge open, 300 px of wheel scroll scores 0.017986 CLS at 1280 and 0.092163 at 390 (measured on main 2026-09-12). The claim note lost the same fault by being anchored to the page (`follow: false`). Ruling: the viewport-following mode goes away, not just off. The hook loses its `follow` option, its scroll listener and its two-mode comment; `.info-pop` becomes `position:absolute`; `.claim-pop` stops overriding position. One law, no dead branch. The badge's box scrolls away with the control it explains, exactly as the note scrolls away with its sentence.

**(b) A box that fits neither below nor above opens below and runs off the bottom.** Today the law clamps such a box to the viewport, so at 390 a tall note on a mark mid-screen (`hsam`, 428 px) sits over its own sentence. Ruling: in the page law, when the box fits neither below nor above, it opens BELOW the anchor at the normal GAP and runs past the bottom of the viewport; the reader scrolls to the rest. It never covers its own sentence and never opens above off the top. The `hold` is still recorded so a reflow carries it. Why this is safe to read: the case only arises when the box is taller than the room on both sides, so the anchor is mid-screen and at least the top ~half of the box is visible under the sentence; a mark near the bottom has room above and flips there as before. The badge's longest body (`mapReal`, 1062 characters at 264 px) can hit the same case on a phone and gets the same answer.

You are an Opus builder. Work in your git worktree on branch `popover-law` off main 4b2259c (rename your worktree's branch to `popover-law` if the harness named it otherwise). Commit on this branch only. Do NOT merge, do NOT deploy, do NOT edit STATUS.md, OPENER.md, `src/content/essay.js`, `src/content/claimNotes.js`, `src/content/explainers.js`, `src/content/fileFacts.json` or `src/lib/realModel.js`. No new dependencies, nothing installed into the project. This is the Mac: no VITE_BASE trap in bash; a dev build needs no base.

## Read first

- `src/components/usePopoverPlacement.js` — the hook; its header comment states the two modes you are collapsing into one.
- `src/components/InfoTag.jsx` and `src/components/ClaimNotes.jsx` — the two callers. Nothing else imports the hook or its helpers (verify with grep and say so).
- `src/styles.css` lines ~377–470 — `.info-pop` (fixed, with the comment explaining why) and `.claim-pop` (absolute override, with its comment).
- STATUS.md ## Important, the "claim marks" bullet and the "Zero layout shift" bullet — the standing method and the traps.

## Deliverables, in order

### 1. The hook — one law

- Remove the `follow` option, the scroll listener (capture) and everything only it used. Keep: measured-before-paint placement on open; page coordinates written down at open; `hold`; the `resize` listener and the `ResizeObserver` on body that carries an open box through a reflow; a new `openKey` forgetting the hold.
- The vertical half of the law, in page mode: below the anchor when it fits (`r.bottom + GAP`); above when only above fits (`r.top − GAP − height ≥ EDGE`); otherwise BELOW at `r.bottom + GAP`, unclamped. The horizontal half is unchanged: centred under the anchor, clamped to the viewport with EDGE, never wider than `innerWidth − 2·EDGE`.
- Rewrite the header comment so it states the law as it now is, in the file's own voice, including the measured reason the following mode was removed (the two CLS numbers above) and the reason for the below-and-scroll rule. Delete every sentence that described the fixed mode. Keep the exported helpers' names if nothing forces a change; if you rename, grep proves nothing else imported them.

### 2. The callers

- `InfoTag.jsx`: the hook call loses nothing but its default; the component's comment says "portalled and anchored to the page" instead of "positioned fixed", and says why. `role="tooltip"`, `aria-describedby`, the Escape and outside-press handling stay as they are.
- `ClaimNotes.jsx`: drop the `{ follow: false }` argument and the three-line comment above it that explains it; the component's long comment still says the note is anchored in the page, which is now simply true of every popover — trim it to say so once.

### 3. Styles

- `.info-pop`: `position:absolute`. Rewrite the comment above it: portalled so no overflow box clips it and opening cannot move the page; absolute in document coordinates so it scrolls away with the thing it explains.
- `.claim-pop`: remove `position:absolute` (inherited now) and cut its comment to what is still specific to the note (the reading decision and the two old numbers may stay as history in one sentence, or go — your call, but say nothing that is no longer true).
- No colour, size or type changes anywhere.

### 4. The one inner scroller

`.token-strip` (Tokenizer, `height:312px; overflow-y:auto`) is the page's only inner scroller. A page-anchored box whose anchor scrolled inside an inner box would drift from it. Both of Tokenizer's badges mount at lines ~82 and ~91, before the strip opens at ~94, so no badge and no mark sits inside it — verify (grep every `<InfoTag` site and every `.claim-mark` against every `overflow-y:auto|scroll` element in the rendered DOM: `el.closest(...)` of each anchor against the scroller list) and state the result in the report. If any anchor were inside one, STOP and report; do not build a listener.

### 5. Docs (yours)

- `interactive-guide-spec.md`: wherever it says the badge's popover is fixed or follows the viewport, say it is anchored to the page; add the below-and-scroll rule in one sentence where the placement law is described (the "Claim marks" entry under §4 describes it today). `README.md` only if it says "fixed".
- STATUS.md is not yours; the lane records the numbers.

## Verification gauntlet — measure everything, report numbers

The control for every measurement is main 4b2259c in a second worktree, same harness, same run.

1. `npm run lint` and `npm run build` green; every chunk size against main. `git diff main --stat` lists only the two components, the hook, styles.css and the docs.
2. **Zero CLS**, real mode, at 1280 and 390, the page's standing method (buffered PerformanceObserver drained after load, plus the structural-box geometry diff). Actions, each scored ≥ 600 ms clear of any input, with the observer's `hadRecentInput` exclusion in mind (it hides scroll-driven shifts of a fixed element for 500 ms after a click — that is how the badge's chase was missed before): open a badge and wheel-scroll 300 px — for EVERY badge topic reachable at that width and mode (list them); open a claim note and wheel-scroll 400 px — for all 18; Escape; outside mousedown; open a second note while one is open; resize 1280→700 with a note open (the reflow carry). Every branch action 0.000000 and no structural box moved. On main in the same run, the badge-plus-scroll case must reproduce the fault (roughly 0.018 at 1280 and 0.092 at 390; report which badge and the exact numbers), and the unanchorable positive control — 40 px inserted at the top of the body at scroll 0 — reads non-zero at both widths on both trees.
3. **The below-and-scroll case**, at 390: scroll so the mark is mid-screen, open `hsam`, `saccade` (511 characters, the longest) and `rat`; report the mark's viewport rect, the note's page top/left/height, and prove `note.top ≥ mark.bottom + GAP` in page coordinates and that no pixel of the note lies over the mark's own line box. Same for the badge `mapReal` at 390 (instrument F, real mode). On main, the same opens show the clamp (`note.top < mark.bottom`) — the control. Then, for each, scroll 400 px down and prove the note's viewport rect moved by exactly the scroll delta (it is content now).
4. **Placement regression** at 1280 and 390, every badge and every note: below when below fits, above when only above fits, horizontal clamp to EDGE, never wider than `innerWidth − 2·EDGE`, never past the left or right edge. Report as a table with one row per anchor and a tick, and any row that differs from main with the two positions side by side.
5. **No scroll listener.** Instrument `EventTarget.prototype.addEventListener` in the harness before load and prove that opening a badge or a note registers no `scroll` listener on window or document (main registers one for the badge — show it).
6. **Keyboard.** A real Tab walk: focusable-control count in instrument F unchanged (57 real / 41 illustrative); a badge: Enter opens, Escape closes and returns focus to the badge; a note: Enter opens, focus lands in the dialog, Tab reaches the first link, Escape returns focus to the mark.
7. **Instrument F untouched.** `git diff main -- src/instruments src/lib` is empty; quote the three viewBox attributes at 1280, 800 and 390 and they equal STATUS's (`0 0 1166 2351.6499999999996`, `0 0 1166 3210.4`, `0 0 1166 5487.599999999999`).
8. **Reduced motion.** Under `prefers-reduced-motion: reduce` the `.info-pop` pop-in animation is off (the existing rule at styles.css ~2312 covers it — confirm it still matches after your edit).
9. **Scrub.** `grep -rn "/Users/\|Fable\|Opus\|Sonnet\|Haiku" src interactive-guide-spec.md README.md` — hits only where they existed on main.
10. **Stills** to `design/popover-law/stills/` (gitignored; list every path in the report): 1280 — section 06 with `hsam` open after 300 px of wheel scroll (the note has moved with the page); instrument B with the `cache` badge open after 300 px of wheel scroll; 390 — `hsam` open with the mark mid-screen, the note under its sentence running off the bottom; `mapReal` open at 390; and the same two 390 stills on main for the before.

## Environment traps (all measured on this project before)

- Dev server: `.claude/launch.json` config `fixture-and-part-dev` on 5173; use the preview tool, never Bash, to start it; kill it when done. HMR resets the page to illustrative mode on any source edit — reload and load the real model again (cached after the first ~83 MB fetch).
- Headless Chrome is at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; stills with `--headless --screenshot --timeout=12000`, never `--virtual-time-budget` (hangs on Vite's HMR socket); 390-wide needs a CDP driver with `Emulation.setDeviceMetricsOverride`; `captureBeyondViewport` DROPS imperatively transformed elements — use the viewport-clip pattern. Node here has a global `WebSocket`; a raw CDP client in a script under your scratchpad needs no package.
- CLS traps: the buffered observer's load flush arrives in a later task — drain it before scoring; Chrome scroll anchoring silently absorbs a positive control inserted above the anchor — use the top-of-body control at scroll 0.
- `git rev-parse --short a b c` fails on this git — use `--short=7` per ref.

## Commits and report

Small commits on `popover-law`, each message saying what was measured; end every message with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
Write the report to `design/popover-law/REPORT.md` and force-add it (`git add -f`; design/ is gitignored) as the last commit: what was built (files), every gauntlet number, the stills' paths, anything found and NOT fixed. Your final message is the same report. Leave the tree clean; leave the branch for the lane to verify, merge and deploy.
