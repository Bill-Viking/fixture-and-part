# BUILD BRIEF — the honest pass (arc 6), branch `honest-pass`

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; zero human steps where a machine can carry them; nothing superfluous. Principles served (design/SOFTWARE-DESIGN-PRINCIPLES in the hub): make the interface truthful; prove quality before declaring completion.

## What this is

The essay on this page makes claims about brains and models that say more than the evidence behind them. Bill ruled the fix: keep the voice, add a small **mark** beside each such claim saying whether it is EVIDENCE, THEORY or ANALOGY, with the source behind it, and correct the few sentences that were simply wrong. The words are already written and committed on this branch. Your job is the page work that makes the marks live, the words on instrument F, and the measured proof.

You are an Opus builder. Work in `D:\Projects\fixture-and-part` on branch `honest-pass` (already checked out; base main bf6ad97). Commit on this branch only. Do NOT merge, do NOT deploy, do NOT edit STATUS.md, OPENER.md, `src/content/essay.js` or `src/content/claimNotes.js` (the lane owns those; if a note's text must change, say so in your report). Do not touch `src/content/fileFacts.json` or `src/lib/realModel.js`.

## Already on the branch (read these first)

- `src/content/essay.js` — the changed sentences and 18 inline marks of the form
  `<button type="button" class="claim-mark" data-claim="rome">EVIDENCE</button>`
  (12 EVIDENCE, 4 THEORY, 2 ANALOGY). They sit inside HTML strings rendered through `dangerouslySetInnerHTML` (`Html` in App.jsx), so React does not own them.
- `src/content/claimNotes.js` — one entry per `data-claim` id: `kind`, `title`, `body`, `sources[{label,url}]`, plus `CLAIM_KINDS`.
- `design/honest-pass/pairs.mjs` — every essay change as before/after pairs (`pairs`), and the five instrument-F string changes (`instrumentF`). `apply-pairs.mjs` re-applies `pairs` to a file; you will use it to PROVE essay.js is exactly main + pairs.
- `src/components/InfoTag.jsx` + `.info-tag` / `.info-pop` in `src/styles.css` — the existing "?" badge and its portalled, fixed-position popover. The claim note reuses this pattern; refactor its placement logic into a shared hook if that keeps both honest, or mirror it — your call, but one placement law on the page.

## Deliverables, in order

### 1. The claim note (one component, mounted once)

A `ClaimNotes` component mounted once in App (near the essay), driving a single popover for all 18 marks.

- **Wiring.** The marks are static DOM inside the prose. Attach ONE delegated click listener on the essay's container (or `document`) that matches `button.claim-mark` and toggles the note for `data-claim`. At mount, walk every `.claim-mark` once and set `aria-label` = `${kind}: ${title}` from claimNotes (e.g. `evidence: what the rat study measured`), `aria-haspopup="dialog"`, `aria-expanded="false"`. A mark whose id has no note logs a dev-only warning and stays inert.
- **Popover.** Portalled to `<body>`, `position:fixed`, class `info-pop claim-pop`, placed like InfoTag: measured before paint, centred under the mark, clamped to the viewport with the same EDGE, flipped above when there is no room below, repositioned on scroll (capture) and resize. Width 300 px max (the notes are longer than the "?" bodies). Contents, top to bottom: title line in `.info-pop-title` style reading `KIND — title` (kind in caps); the body; then the sources as a list of links, each `<a href target="_blank" rel="noopener noreferrer">label</a>`. No source list when `sources` is empty (the two ANALOGY notes may have none).
- **Roles and keys.** The popover is `role="dialog"` with `aria-label` = the same `KIND — title`, `tabIndex={-1}`; on open, focus moves INTO it (the dialog element), so Tab walks its links and Shift+Tab walks back; Escape closes and returns focus to the mark; a click or touch outside closes; opening a second mark closes the first (one note at a time); the open mark gets `aria-expanded="true"` and `aria-controls` pointing at the dialog id; closing clears both. Enter and Space work because the mark is a real button.
- **No layout shift by construction.** The popover is fixed and portalled; the marks are inline text that never changes size on hover, focus or open. Prove it, don't assume it (gauntlet below).

### 2. Styles

- `.claim-mark`: inline, `font-family:var(--mono)`, `font-size:11.5px` (the callout label size), `letter-spacing:0.14em`, `line-height:1`, `vertical-align:baseline` (or the value that keeps the prose line box height unchanged — measure), `color:var(--keys)`, no background, no border, padding 0, `cursor:pointer`, a 1px underline in the keys colour offset 3px (`text-decoration` or a bottom border that adds no height). Hover/focus-visible: colour to `var(--ink)`, underline stays; open (`[aria-expanded="true"]`): `background:var(--keys-tint)`, colour `var(--keys)`; the focus ring as the page's other buttons draw it. Green because the colour law makes green the key you search with, and a source is that.
- `.claim-pop`: inherits `.info-pop`; `max-width:300px`; links `color:var(--keys)`, underlined, focus-visible ring; the source list `margin-top:8px`, one link per line, wrapped, mono 10.5–11px.
- The marks' text at 11.5px mono on the page ground must measure ≥ 4.5:1 (stylesheet sweep is valid here — paper ground, no texture). `--keys` #2C7539 on white computes about 5.7:1; measure on the real ground and say the number.
- Reduced motion: the `.info-pop` pop-in animation must be off under `prefers-reduced-motion: reduce` (check the existing block at styles.css ~2217; add the rule if it is missing).

### 3. Instrument F's own words

Apply the five `instrumentF` changes from `design/honest-pass/pairs.mjs` by hand (they are in template literals and JSX; apply-pairs does not cover them). Then re-measure what the arc-5 rules require (STATUS ## Important, "The caption's reservation is measured"): walk every stop of a real tour at 1280, 1199, 800, 641 and 390 on the default sentence and the 20-token sentence `The engine roared and it shut down the the the the the the the the the the the the the`, count caption LINE BOXES used against the reservation per band, and report used/reserved per band — every band must keep its spare line; if one does not, raise that band's reservation and re-quote the viewBox attribute (one per breakpoint) in the report. Check the landing plate `GREEDY — THE TOP WORD, WHITESPACE SKIPPED` fits its box at every width by `getComputedTextLength` against the plate's reserved width; if it does not fit at 390, use `GREEDY — THE TOP WORD, BLANKS SKIPPED` at every width and say so. The landing sentence at 390 (the phone-width landing sentence checked 2026-09-06) must not overflow the viewBox.

### 4. Docs (yours)

- `interactive-guide-spec.md`: add a short "Claim marks" entry under §4 (after "Static sections") — what a mark is, the three kinds, the style, the behaviour, and under §6 Copy rules the note's copy rule (sentence case, plain verbs, what the source showed and no more, every url fetched before it goes in).
- `README.md` §Layout: one line naming `claimNotes.js` and the ClaimNotes component.
- The essay's header comment is already updated. STATUS.md is not yours.

## Verification gauntlet — measure everything, report numbers

1. `npm run lint` and `npm run build` green; report every chunk size against main (`git stash`/worktree of main for the control). Build on this Windows machine through PowerShell if you set VITE_BASE; a dev build needs no base.
2. **Prose proof.** `git show main:src/content/essay.js > <tmp>/base.js && node design/honest-pass/apply-pairs.mjs --file <tmp>/base.js && cmp <tmp>/base.js src/content/essay.js` prints nothing (byte-identical). `git diff main -- src/content/fileFacts.json src/lib/realModel.js` is empty.
3. **Mapping proof.** Every `data-claim` id in essay.js has an entry in claimNotes.js and every entry has a mark: 18 = 18. Add a dev-only `window.__claimCheck()` that returns `{marks, notes, missing:[], orphan:[]}` and can fail (temporarily remove one entry to show it does).
4. **Links.** Every source was already fetched and read on 2026-09-12 (`design/honest-pass/SOURCES-DIGEST.md`). Publisher pages (Elsevier, PNAS, Nature, PubMed) answer scripts with 403s and cookie walls, so do NOT judge them by curl. Open each of the 28 urls once in the Browser pane and confirm the page that loads carries the paper's title (or the documentation page's); report the list with a tick each. A url that lands on a 404 or an unrelated page is a STOP — do not remove or replace a source; report it.
5. **Zero CLS**, real mode, at 1280 and 390, the page's standing method (buffered PerformanceObserver drained after load, plus the structural-box geometry diff): open each of the 18 marks, close by Escape, close by outside click, Tab through a note's links, open a second while one is open, scroll 400 px with one open — every action 0.000000 and no structural box moved; the unanchorable positive control (40 px at the top of the body at scroll 0) reads non-zero in the same run. The geometry diff across the model load moves nothing new (compare to main in a worktree).
6. **Keyboard.** A real Tab walk: all 18 marks reached, each with a distinct accessible name; Enter opens, focus lands in the dialog, Tab reaches the first link, Escape returns focus to the mark. Count focusable controls in instrument F before and after (must be unchanged: 57 real / 41 illustrative).
7. **Contrast.** `.claim-mark` text and `.claim-pop` text and links on their real grounds, ≥ 4.5:1, numbers stated.
8. **Instrument F invariants after the word changes:** tour stop counts unchanged (35 above 640 px, 33 at or below, 19 illustrative); caption used/reserved per band (item 3 above); one viewBox per breakpoint, quoted as the attribute; walls digest identical to main in the same harness; 12 DOM records for a whole tour; `__mapCheck()` passes; decoding parity byte-identical to main (greedy `383,3113,373,991,319,262,2323,13,383,3113`, sampled `383,1306,530,714,307,262,845,717,284,651`).
9. **Copy and scrub.** Notes and spec text: sentence case, no exclamation points. `grep -rn "/Users/\|Fable\|Opus\|Sonnet\|Haiku" src` — hits only where they existed on main.
10. **Stills** to the scratchpad, listed by path in the report: 1280 — section 05 with the `rat` note open; section 08 with `saccade` open; section 10 with `charioteer` open; instrument F's landing in greedy real mode showing the new plate; 390 — section 06 with `hsam` open, and F's landing in greedy real mode.

## Environment traps (all measured on this project before)

- Dev server: `.claude/launch.json` config `fixture-and-part-dev` on 5173; kill it when done. HMR resets the page to illustrative mode on any source edit — reload and load the real model again (cached).
- Headless Chrome captures: `--headless --screenshot --timeout=12000`, never `--virtual-time-budget` (hangs on Vite's HMR socket); 390-wide needs a CDP driver with `Emulation.setDeviceMetricsOverride`; `captureBeyondViewport` DROPS imperatively transformed elements — use the viewport-clip pattern.
- CLS traps: the buffered observer's load flush arrives in a later task — drain it before scoring; Chrome scroll anchoring silently absorbs a positive control inserted above the anchor — use the top-of-body control at scroll 0.
- `git rev-parse --short a b c` fails on this git — use `--short=7` per ref.

## Commits and report

Small commits on `honest-pass`, each message saying what was measured; end every message with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
Final report: what was built (files), every gauntlet number, the stills' paths, anything found and NOT fixed, and any note text you believe is wrong (quote it; do not edit it). Leave the tree clean.
