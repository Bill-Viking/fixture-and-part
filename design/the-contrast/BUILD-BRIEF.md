# BUILD BRIEF — the contrast (a two-card block in section 07), branch `the-contrast`

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; zero human steps where a machine can carry them; nothing superfluous. Principles served: make the interface truthful (the file card says only what instrument E actually found, in the state E is actually in), make intelligence accountable (the brain card is marked cited, the file card demonstrated), prove quality before declaring completion.

## What this is

One new block in section 07 of the essay, approved as `WORDS.md` in this folder (Bill's go 2026-10-23, no strikes): two cards side by side in the shape of section 09's duo — THE BRAIN (amber, cited) and THE FILE (steel, demonstrated) — under the paragraph that ends "… the world-model has changed since encoding." and before "The raw capacity is there regardless …". The file card's last line is LIVE: it prints instrument E's own finding about the model file, in one of six states, and never takes a reading of its own. Every string you put on the page is in `WORDS.md` §2–§3, copied character for character, encoded as `src/content/essay.js` encodes (`&rsquo;` for the curly apostrophe, `&ldquo;`/`&rdquo;` for quotes, the em dash as the file writes it); the three ⟨values⟩ are filled from `src/content/fileFacts.json` → `provenance` at render time, printed exactly as instrument E prints them (`shortSha`: first 8 … last 4; `mb()`: `83.5 MB`; `readAt` as stored).

You are an Opus builder. Work in your git worktree on branch `the-contrast` off the main head you find (rename your worktree's branch if the harness named it otherwise). Commit on this branch only, in small commits with plain subjects. Do NOT merge, do NOT deploy. Do NOT edit STATUS.md, OPENER.md, or `WORDS.md`.

## Read first
- `WORDS.md` (this folder), all five sections — the facts block at its head says where every number comes from.
- `src/content/essay.js`: section `id: '07'` (~175–190: the two paragraphs the block goes between); section `id: '09'` (~209–260: the existing `type: 'duo'` block — its shape, its two `variant`s `frozenc` / `movingc`); section `id: '05'` (~137–160: the `reopen` claim mark as the page writes it: `<button type="button" class="claim-mark" data-claim="reopen">EVIDENCE</button>`).
- `src/App.jsx`: `Duo` (~75–89: cards' paragraphs render as PLAIN TEXT — your block needs HTML paragraphs for the mark, so use the `Html` component the way `Callout` does); the block renderer (~898–935: `p` / `callout` / `duo` / `figure` / `readout` / `instrument`); the `readouts` map (~268) and `HarnessReadout` for how a block takes live state from App; the state block (~273–320) and where `FileView` is mounted (~731–739) with its props.
- `src/instruments/FileView.jsx`: `proof()` (~1339–1440) — the branches that are the six states; the state it reads (`facts`, `ready`, `live`, `liveError`, `mismatches`, `afterRun`, `manifestMatch`); `shortSha` (~98) and `mb`; the rendered `.file-proof` line (~1654–1659) with its `is-alert` class.
- `src/components/ClaimNotes.jsx` and `src/content/claimNotes.js` (`reopen`, ~29): how a mark opens its note, so the mark in the new card behaves exactly like 05's.
- `src/styles.css`: `.duo` / `.card` (~215–222, the phone rule ~2214), `.callout .lbl` (~197: the mono small-line pattern), `.file-proof` and `.is-alert` (grep), the variables `--frozen`, `--frozen-tint`, `--moving-ink`, `--moving-tint`, `--mono`, `--muted`.
- `README.md` line ~152: "the essay's 27 claim marks (26 notes; one reused)" — the count changes.
- STATUS.md ## Important: the "Zero layout shift" bullets and the harness traps (below).

## Deliverables, in order

### 1. E's finding, handed up
`FileView` gets one new prop, `onProof`, and reports its finding whenever it changes (an effect over the same inputs `proof()` reads): an object `{ state, sha }` where `state` is one of `unloaded` · `reading` · `same` · `same-after-run` · `differs` · `error` · `no-fingerprint`, and `sha` is the live fingerprint where one exists (the full sha; the block shortens it). The mapping from `proof()`'s branches, in `proof()`'s own order:
- no `facts` yet, or `!ready` → `unloaded`
- `liveError` → `error`
- `!live` → `reading`
- `live.sha` present and `≠ p.sha256` → `differs`, sha = `live.sha`
- `mismatches.length > 0` → `differs`, sha = `live.sha` (the lane's ruling: the bytes read differently, so the numbers on the page did not come from what was read — that is what the line says; "section 01 says what it found" carries the reader to E's precise sentence)
- `afterRun.status === 'reading'` → `reading`; `afterRun.status === 'error'` → `error`; `afterRun.sha ≠ p.sha256` → `differs`, sha = `afterRun.sha`; `afterRun.sha` equal → `same-after-run`, sha = `afterRun.sha`
- `live.sha` equal → `same`, sha = `live.sha`
- no `live.sha` (no SubtleCrypto) → `no-fingerprint`
`proof()` itself and E's own line are unchanged. App holds the finding in state and passes it down to the new block.

### 2. The block
- `src/content/essay.js`: a new block `{ type: 'contrast', … }` in section 07 between the two paragraphs, carrying every string from WORDS §2–§3 as data: each card's `title`, `kicker` (the small mono line), `paragraphs` (HTML strings; the brain card's second paragraph ends with the `reopen` mark exactly as 05 writes it), and the file card's `live` map of the six state strings keyed `unloaded` / `same` / `same-after-run` / `differs` / `error` / `reading`, with `{sha}`, `{mb}`, `{readAt}` as the placeholders the component fills. The `no-fingerprint` state prints NO live line (WORDS has no sentence for it, and the only honest line is E's own in section 01).
- A `Contrast` component (in `src/App.jsx` beside `Duo`, or `src/components/Contrast.jsx`): the `.duo` grid with the two `.card`s (`movingc` then `frozenc`, brain on the left), each card: `h3` title · the kicker in a new `.card-kicker` (mono, 11.5 px, letter-spaced like `.callout .lbl`, in the card's own ink colour, under the title) · the paragraphs through `Html` (so the mark is a real button and opens its note) · on the file card, the live line last in a `.contrast-live` (mono, 12 px, `--muted`; `is-alert` in exactly the colour `.file-proof.is-alert` uses, for the `differs` and `error` states). No `aria-live` on the block: E's own line already announces the same change and two polite regions would read it twice — say so in a comment.
- The ⟨values⟩: the sha through the same 8…4 shortening as E, `83.5 MB` through the same `mb`, `readAt` as stored; shared from one helper, not re-implemented.
- The live line must not move what is below it when its text changes: reserve its height (min-height from the longest state string's line count at each breakpoint, measured), so CLS stays 0 on every state change with the block in view.
- Section 09's duo stays exactly as it is. No other essay word changes.

### 3. The counts
`README.md`: "28 claim marks (26 notes; two reused)"; grep the repo (`grep -rn "27 claim\|27 marks\|15 EVIDENCE" --exclude-dir=node_modules .`) and update every other place that states the count (STATUS.md is NOT yours — list it in the report instead).

## The gauntlet (one headless Chrome at a time; reduced motion ON for every CDP run)
1. `npm run lint` (baseline: one AttentionInspector warning) and `npm run build`, foreground, `pwd` read; the bundle holds `cited — it cannot be shown here`, `demonstrated — read live on this page`, and `A dinner in Lisbon, recalled tonight.`
2. Strings: every string of WORDS §2–§3 read from the DOM at 1280 and 390 against WORDS, exact, the placeholders filled (`1d3ab4d7…8431`, `83.5 MB`, `2026-10-21`); list each with PASS.
3. The live line's states (CDP, 1280, real model): before the load → the `unloaded` line; after the load → the `same` line with the sha (catch the `reading` line if it shows; report what was seen); change the text, RUN THE PASS → the `same-after-run` line. Then the alert branches, each driven and reported with HOW: `differs` (intercept the model file's fetch with CDP `Fetch` and serve a body with one byte changed, or drive `afterRun` the same way); `error` (fail the fetch); `no-fingerprint` (delete `crypto.subtle` on the page before the load → NO live line rendered, E's own sentence still in section 01). For each: the block's line text, its class (alert or not), and E's own `.file-proof` text beside it — they must agree in substance every time.
4. The mark: the EVIDENCE mark in the brain card opens the `reopen` note exactly as 05's does (same note text, same focus return); the page's mark count 28 (16 EVIDENCE, 8 THEORY, 4 ANALOGY) and 26 notes — counted from the DOM, with main's 27 as the control.
5. Zero layout shift at 1280 and 390 with the block scrolled into view: the battery (load with the flush drained; the top-of-body positive control at scroll 0; model load; RUN THE PASS; the state changes of step 3) — CLS 0 on every action; report `cls` and `raw` both.
6. Layout and type: both cards side by side at ≥ 641, stacked at ≤ 640 (the brain card first); the kicker and the live line ≥ 11 px rendered at 1280, 1024, 768, 641, 390; contrast of the kicker, the paragraphs and the live line (normal and alert) against both tints ≥ 4.5, computed and listed.
7. Stills to `design/the-contrast/stills/`: `branch-1280-block-unloaded.png`, `branch-1280-block-same.png` (model loaded, the sha showing), `branch-1280-block-alert.png` (the `differs` state), `branch-390-block.png`, and `main-1280-section-07.png` (the control: the two paragraphs with no block between). Read each PNG before committing.

## The report
`design/the-contrast/REPORT.md` with every number, the file table (+/− per file), the choices and anything you could not drive; if the harness refuses the filename, return the whole report as text in your hand-back and say so.

## Environment traps (all measured on this project before)
- The dev server on 5173 serves the PRIMARY checkout, never a worktree — serve the worktree with your own Vite on a free port (a config that sets `root`, a `cacheDir` under your scratchpad, and the react plugin loaded from the project's node_modules; the worktree's `node_modules` may be missing — symlink it to the primary's, gitignored) and the control (main, exported with `git archive` into your scratchpad) on another; kill both when done. HMR resets the page to illustrative mode on any source edit — reload and load the real model again (cached after the first ~83 MB fetch).
- Headless Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. LET CHROME PICK ITS OWN DEBUGGING PORT (`--remote-debugging-port=0` and read the port from DevToolsActivePort): port 9333 belongs to another session's Chrome on this machine. Stills with `--headless --screenshot --timeout=12000`, never `--virtual-time-budget`; 390-wide needs `Emulation.setDeviceMetricsOverride`; `captureBeyondViewport` DROPS imperatively transformed elements — use the viewport-clip pattern; Node's global `WebSocket` serves a raw CDP client.
- CLS traps: drain the buffered observer's load flush before scoring; the top-of-body positive control at scroll 0; the input exclusion hides shifts for 500 ms after a click and can outlast that under CDP — report `cls` and `raw` both.
- The build tool's background commands can lose their `cd`: run lint and build in the worktree in the foreground and read `pwd` in the output.
