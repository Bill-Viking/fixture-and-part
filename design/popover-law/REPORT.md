# REPORT — the popover law, branch `popover-law`

Built from `design/popover-law/BUILD-BRIEF.md`. Branch base: main **cb52d64** (the
brief's own commit). The brief names 4b2259c; cb52d64 adds only the brief file
(`git diff 4b2259c cb52d64 --stat` = `design/popover-law/BUILD-BRIEF.md`, 1 file), so
`src/` is byte-identical between the two and the control is the same control.

The control for every measurement is a second worktree at **cb52d64**, in the session
scratchpad, never written to. Main has since moved to **73a94b5** — one STATUS line by
the lane about the two builds in flight. STATUS.md is not this build's file and was
not touched.

Commits on this branch: `421caa8` (the hook, the two callers, the styles), `343ba1d`
(the spec), and this report.

---

## 1. What was built

| file | what changed |
| --- | --- |
| `src/components/usePopoverPlacement.js` | The `follow` option, the capture scroll listener and the two-mode header comment are **gone, not switched off**. One law: decide against the viewport at open, write the answer down in page coordinates. The vertical half now has three answers — below when it fits below, above when only above fits, and **below again, unclamped, when it fits neither**. `hold`, the `resize` listener, the `ResizeObserver` on body and the `openKey` hold-forget all stay. Header comment rewritten to the law as it now is, carrying the two measured reasons. |
| `src/components/InfoTag.jsx` | Comment says portalled and anchored to the page, and why. The hook call is unchanged text (it had relied on the default). `role="tooltip"`, `aria-describedby`, Escape and outside-press untouched. |
| `src/components/ClaimNotes.jsx` | `{ follow: false }` and its three-line comment dropped; the long comment trimmed to say once that the note is anchored in the page, which is now true of every popover. |
| `src/styles.css` | `.info-pop` is `position:absolute` with a rewritten comment; `.claim-pop` no longer sets `position` and its comment is cut to what is still specific to the note. No colour, size or type change. |
| `interactive-guide-spec.md` | The "Claim marks" entry under §4 no longer says the badge is fixed and follows the viewport, states the three vertical answers including below-and-scroll, and keeps both measured reasons on the record. |

`README.md` unchanged: it says nothing about `fixed` — its only popover line is the
file map naming `usePopoverPlacement` as the shared law.

**Nothing else imports the hook or its helpers.**
`grep -rn "usePopoverPlacement\|placePopover\|rePlacePopoverInPage\|\bGAP\b\|\bEDGE\b" src/`
returns `InfoTag.jsx` (import + call), `ClaimNotes.jsx` (import + call) and the hook's
own file. No helper was renamed.

---

## 2. The gauntlet

Harness: a CDP driver written for this pass, in the session scratchpad — nothing
installed, nothing in the repo. Both trees measured with the same scripts in the same
sitting, each behind its own dev server started with an explicit root (see **Found,
not fixed (2)**).

### 1 — lint, build, diff

* `npm run lint`: **one warning, no errors, on both trees** — `src/instruments/AttentionInspector.jsx:55:45 react-hooks(exhaustive-deps)`, pre-existing and identical.
* `npm run build`: green on both trees.

| chunk | branch (bytes) | main cb52d64 (bytes) | delta | gzip -9 |
| --- | --- | --- | --- | --- |
| `assets/index-*.js` | 385,308 | 385,495 | **-187** | 126,462 vs 126,553 → **-91** |
| `assets/index-*.css` | 48,909 | 48,924 | **-15** | 9,467 vs 9,473 → **-6** |
| `assets/fileFacts-*.js` | 220,989 | 220,989 | 0, sha256 identical | |
| `assets/modelBytesWorker-*.js` | 9,769 | 9,769 | 0, sha256 identical | |
| `assets/ort-wasm-...wasm` | 23,567,050 | 23,567,050 | 0, sha256 identical | |
| `index.html` | 1,120 | 1,120 | 0 bytes; sha256 differs only in the chunk name it points at | |
| `assets/transformers.web-*.js` | 550,533 | 550,533 | 0; `cmp -l` reports **exactly 8 differing bytes**, offsets 42-49 — the hash of the index chunk it imports | |

`git diff cb52d64 --stat` (the base this branch was cut from) lists exactly five files:
`interactive-guide-spec.md`, `src/components/ClaimNotes.jsx`,
`src/components/InfoTag.jsx`, `src/components/usePopoverPlacement.js`,
`src/styles.css` — 84 insertions, 93 deletions. Against main's current tip 73a94b5 it
additionally shows `STATUS.md | 2 -`, which is main's own two added lines, not this
branch's.

### 2 — zero CLS, real mode, 1280x900 and 390x844

Method: a buffered `PerformanceObserver` on `layout-shift`, installed before any page
script via `Page.addScriptToEvaluateOnNewDocument` and drained after load; every action
scored from a mark set at least 700 ms after the last click, clear of the 500 ms
input-exclusion window; plus the structural-box geometry diff over
`header, .wrap > section, .instrument-slot, .foot` in page coordinates. The scroll is
real input (`Input.dispatchMouseEvent type:mouseWheel`), 100 px a tick. Both `cls`
(input-excluded, the standard figure) and `raw` (every entry) are reported, with
`entries` = how many layout-shift records the observer produced at all.

**Badge open + 300 px wheel, every badge topic reachable at that width in real mode.**
Fifteen at both widths: `file fileHeader fileBlob fileCurve tokenReal embeddingReal
mapReal decodingReal candidatesReal key value cache mask budget lensReal`. (The brief's
sixteenth mount site is `dies` in `KVInspector`, not mounted unless the inspector is
open; 22 topics exist, 15 are reachable in real mode.)

| | branch | main |
| --- | --- | --- |
| 1280, all 15 | **0.000000 each, 0 shift entries in total** | 42 entries, 0.360852 summed; per badge 0.012551 - 0.035531 |
| 390, all 15 | **0.000000 each, 0 shift entries in total** | 40 entries, 1.823121 summed; per badge 0.045832 - 0.166434 |

**Note open + 400 px wheel, all 18 marks** (`rome lens reopen rat simulation imagine
hsam trauma fixture index synapse predictive saccade converge align charioteer planning
introspect`): **0.000000, 0 entries, on both trees at both widths** — the note was
already page-anchored on main, and still is.

**The other actions — Escape on a note, Escape on a badge, outside mousedown on a note,
outside mousedown on a badge, opening a second note while one is open: 0.000000, 0
entries, no structural box moved, on both trees at both widths.**

**Structural-box geometry diff:** across all 33 open-and-scroll actions at each width on
the branch, **zero structural boxes moved** (0 of 8 tracked boxes, both widths).

**Resize 1280 -> 700 with a note open (the reflow carry):** identical on both trees —
note `introspect` stays open and the hold under its own mark is **8.000 px before and
8.000 px after**, the mark settling at page top 17,857.266. The score for that action is
1.115072 raw on **both** trees, character for character: narrowing the window reflows
the whole page, which moves every structural box by design. It is not this change's, and
it is not a popover shift.

**The unanchorable positive control** — 40 px inserted at the top of `<body>` at scroll
0, measured on its own with one browser running, 2.5 s clear of any input:

| | branch | main |
| --- | --- | --- |
| 1280 | **0.031250** (1 entry, not input-flagged) | **0.031250** |
| 390 | **0.047393** (1 entry, not input-flagged) | **0.047393** |

Both match STATUS's recorded 0.031250 / 0.047393 exactly. The observer is live on both
trees in the same run.

**The fault reproduced on main, measured serially so nothing is input-flagged** (badge
`file`: open, wait, 300 px of wheel):

| | motion allowed | reduced motion |
| --- | --- | --- |
| main 1280 | **0.018029** (2 x 0.009014) | 0.027043 (3 x 0.009014) |
| main 390 | **0.089761** (2 x 0.044881) | 0.134642 (3 x 0.044881) |
| branch 1280 | **0.000000**, no entries | 0.000000, no entries |
| branch 390 | **0.000000**, no entries | 0.000000, no entries |

The motion-allowed figures are the brief's own numbers to three decimal places (it
records 0.017986 at 1280 and 0.092163 at 390). The per-tick value is identical either
way; only how many of the three ticks land inside the scored window differs.

### 3 — the below-and-scroll case at 390

Each anchor brought to mid-screen (`scrollIntoView({block:'center'})`), then opened.
Viewport rects in px; page coordinates as the law wrote them down.

**Branch:**

| anchor | mark viewport top / bottom | note page top / left | note height | `note.top - mark.bottom` | past viewport bottom | covers its own line box | covers its anchor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `hsam` | 416.063 / 427.563 | 17188.563 / 82 | 428.578 | **8.000** | 20.141 | **false** | false |
| `saccade` | 415.781 / 427.281 | 19029.281 / 82 | 481.125 | **8.000** | 72.406 | **false** | false |
| `rat` | 416.031 / 427.531 | 15915.531 / 82 | 462.984 | **8.000** | 54.516 | **false** | false |
| `mapReal` (badge) | 414.141 / 429.141 | 5074.141 / 92.828 | 644.313 | **8.000** | 237.453 | n/a | **false** |

`overlapsOwnLine` is measured against the mark's own line box, taken from a Range over
the containing `<p>`: for `hsam` that box is top 410.063 / bottom 430.063 and the note's
top is 435.563, below it. The number of lines of that paragraph *above* the mark that
the note overlaps is **0** for all three marks.

**Then scrolled 400 px with the box open:** the note's viewport top moved by **exactly
400.000** for all four — `hsam` 435.563 -> 35.563, `saccade` 435.281 -> 35.281, `rat`
435.531 -> 35.531, `mapReal` 437.141 -> 37.141 — against a measured scroll delta of 400.
It is content.

**Main, the same opens at the same scroll positions — the clamp:**

| anchor | `note.top - mark.bottom` | covers its own line box | covers its anchor | position | moved by, on a 400 px scroll |
| --- | --- | --- | --- | --- | --- |
| `hsam` | **-20.562** | **true** | true | absolute | 400 |
| `saccade` | **-72.281** | **true** | true | absolute | 400 |
| `rat` | **-54.531** | **true** | true | absolute | 400 |
| `mapReal` (badge) | **-237.141** | n/a | true | **fixed** | **154.859** |

The badge's box on main both covers its anchor and fails to travel with the page.

### 4 — placement regression, every badge and every note, both widths

66 rows per tree per width: 33 anchors x two positions — `center` (anchor mid-screen,
which exercises below and the neither-fits case) and `end` (anchor at the foot of the
window, which exercises the flip above).

| | branch 1280 | branch 390 | main 1280 | main 390 |
| --- | --- | --- | --- | --- |
| rows | 66 | 66 | 66 | 66 |
| law satisfied (right side of the flip; left/right clamped to EDGE; width <= `innerWidth - 2*EDGE`) | **66** | **66** | 60 | 60 |
| computed `position` of the box | **absolute x 66** | **absolute x 66** | fixed x 30, absolute x 36 | fixed x 30, absolute x 36 |
| where it landed | below x 33 (center), above x 33 (end) | same | below x 27, **other x 6**, above x 33 | below x 27, **other x 6**, above x 33 |
| boxes covering their own anchor | **0** | **0** | 5 | 6 |
| rows that fit neither way | 6 | 6 | 6 | 6 |

The six neither-fits rows are the same six on every tree and width: `badge:fileBlob`,
`badge:mapReal`, `mark:rat`, `mark:hsam`, `mark:saccade`, `mark:align`. On the branch
each opens **below at gap 8.000**, running past the bottom (at 390: 237.453, 20.141,
54.516, 72.406, 37.906, 34.922 px past). On main each is clamped — gaps at 1280 of
-10.953, -209.562, -27.219, +7.078, -45.219, -7.078; at 390 of -38.141, -237.141,
-54.531, -20.562, -72.281, -34.953. Every row on every tree passes `leftOk`, `rightOk`
and `widthOk` (the horizontal half is untouched), and no box ever opens off the top
(`offTop` 0 in all 264 rows).

Tallest boxes at 390 on the branch, all landing below at gap 8.000: `mapReal` 644.313,
`saccade` 481.125, `rat` 462.984, `fileBlob` 444.766, `align` 442.969, `hsam` 428.578.

### 4b — the one inner scroller

Measured in the rendered DOM in real mode, not read from the source: every element whose
computed `overflow-x/y` is `auto|scroll` **and** which actually overflows, then
`scroller.contains(anchor)` for all 33 anchors (15 badges + 18 marks).

* 1280: the elements that actually overflow are `div.file-list` and `div.attn-table.screen`.
* 390: `div.file-list`, `div.token-strip`, `ul.rack-list`, `div.attn-table.screen`.
* **Anchors inside a scroller: 0 of 33, at both widths, on both trees.**

No listener was built. See **Found, not fixed (1)**.

### 5 — no scroll listener

`EventTarget.prototype.addEventListener` is wrapped in the prelude, before any page
script runs, and every call recorded with its target and capture flag.

Listeners registered by **one** open:

| | branch | main |
| --- | --- | --- |
| badge | `resize@window`, `keydown@document`, `mousedown@document`, `touchstart@document` | the same **plus `scroll@window (capture)`** |
| note | `resize@window`, `keydown@document`, `mousedown@document`, `touchstart@document` | identical to branch |

Across a whole session: **branch — 0 scroll listeners on window or document, ever**;
main — 33 at 1280 and 34 at 390, all `scroll@window (capture)`, one per badge open. Two
scroll listeners exist on both trees and are not the hook's: one on a `div` (capture) and
one on `body` (capture).

### 6 — keyboard

A real Tab walk: dispatched `Tab` key events, reading `document.activeElement` at every
stop. In headless the walk wraps rather than falling through to `<body>`, so it ends on
the first stop coming round again. **Branch and main are identical, line for line:**

| | branch | main |
| --- | --- | --- |
| tab stops, illustrative (before any load) | 219 total, **38 inside instrument F** | 219 total, **38** |
| tab stops, real | 233 total, **54 inside instrument F** | 233 total, **54** |

Badge, on the branch: Enter opens it; the box is `role="tooltip"`; the badge's
`aria-describedby` equals the box's id (`_r_1_`); `aria-expanded="true"`; Escape closes
it and **focus returns to the badge**. Note: Enter opens it; `role="dialog"` with
`aria-label` "EVIDENCE — finding a fact in the file"; **focus lands in the dialog**; one
source link and **Tab reaches it**; Escape closes it, **focus returns to the mark**,
`aria-expanded="false"`. Every one of these is identical on main.

### 7 — instrument F untouched

`git diff main -- src/instruments src/lib` is **empty**. The viewBox attribute, read from
the live `#inst-forward svg` at three widths, on both trees:

| width | attribute | STATUS |
| --- | --- | --- |
| 1280 | `0 0 1166 2351.6499999999996` | matches |
| 800 | `0 0 1166 3210.4` | matches |
| 390 | `0 0 1166 5487.599999999999` | matches |

### 8 — reduced motion

The rule still matches after the edit, read back from the live CSSOM: media
`(prefers-reduced-motion: reduce)`, selector `.cand, .cand.is-winner, .info-pop,
.kv-stack`, declaration `animation: ... none`. Identical on both trees. `.info-pop` is
still in the selector list, so the pop-in animation is still off under reduced motion.

### 9 — scrub

`grep -rn "/Users/\|Fable\|Opus\|Sonnet\|Haiku" src interactive-guide-spec.md README.md`
returns **no hits on the branch, and no hits on main** — nothing added, and nothing that
existed before.

### 10 — stills

All six under `design/popover-law/stills/` (gitignored; the directory is not committed).
Viewport captures (`captureBeyondViewport: false`), both trees under the same emulated
reduced motion.

* `/Users/bill/Projects/fixture-and-part/.claude/worktrees/agent-ab0fc66472c37fd0f/design/popover-law/stills/1280-s06-hsam-after-300px-wheel.png` — section 06, `hsam` open, after 300 px of wheel. The note travelled with the page: viewport top 463.92 -> 163.92 (exactly 300), gap to its mark still 8.000.
* `.../design/popover-law/stills/1280-instB-cache-after-300px-wheel.png` — instrument B, the `cache` badge open, after 300 px of wheel: 465.28 -> 165.28 (exactly 300), sitting 8 px under the "?" it belongs to. On main it would have stayed put while the control scrolled away.
* `.../design/popover-law/stills/390-hsam-mid-screen-branch.png` — the mark mid-screen, the EVIDENCE mark visible at the end of "not fewer.", the note opening under it and running off the bottom.
* `.../design/popover-law/stills/390-mapReal-branch.png` — `mapReal` at 390, instrument F, real mode.
* `.../design/popover-law/stills/390-hsam-mid-screen-main.png` — the before: the note starts at viewport top 407, above the mark's own top of 416.06, hiding the sentence it explains.
* `.../design/popover-law/stills/390-mapReal-main.png` — the before: `position:fixed`, box top 192 against an anchor bottom of 429.14.

---

## 3. Found, and not fixed

1. **The brief's premise about the inner scroller is not what the DOM says.** It calls
   `.token-strip` "the page's only inner scroller". Measured in real mode, the elements
   that actually overflow are `div.file-list` and `div.attn-table.screen` at 1280, and
   those two plus `div.token-strip` and `ul.rack-list` at 390. The brief's **conclusion
   holds** — 0 of 33 anchors sits inside any of them, at either width, on either tree —
   so no listener was built, as instructed. The check is over the DOM as it stood in real
   mode with no instrument in an unusual state (K/V inspector closed, no register
   opened); an anchor that only exists inside a scroller in some other state would not
   have been seen. Worth a line in STATUS if the lane wants the claim corrected.

2. **The preview tool starts the dev server in the primary checkout, not in this
   worktree.** `preview_start` with `fixture-and-part-dev` came up on 5173 with its
   working directory `/Users/bill/Projects/fixture-and-part`, which is on `main`. A probe
   against it read `position: fixed` and scored 0.019461 for a badge scroll — those are
   **main's** numbers, from a server I had taken to be the branch's. I stopped it and ran
   both trees' servers with explicit roots instead (the branch from this worktree on
   5173, the control worktree on 5174), verifying each by fetching
   `/src/components/usePopoverPlacement.js` and counting the word `follow` (0 on the
   branch, 11 on main) before measuring anything. Pointing the launch config at the
   worktree would mean editing `.claude/launch.json`, which is tracked and would dirty
   the tree, so it was left alone. Both servers are stopped.

3. **Instrument F runs itself, and it makes a CDP harness unusable at full motion.** With
   motion allowed and F on screen, each `Runtime.evaluate` queues behind F's redraw:
   measured at **40-85 seconds per action**, growing as the run went on, against **~1 ms**
   with the ambient loop off. The gauntlet was therefore run under emulated
   `prefers-reduced-motion: reduce`, which is the flag F's own code reads
   (`ForwardMap.jsx` ~1770: `if (reduced)` — the ambient loop never starts). The fault
   under test is not motion-driven, and the motion-on spot check in section 2 gives the
   same per-tick shift value either way. A harness trap worth recording for the next
   pass, not a fault in the page.

4. **Chrome flags wheel-driven shifts as `hadRecentInput` when two harnesses run at
   once.** In the concurrent runs, main's badge-scroll shifts came back with
   `hadRecentInput: true` and a standard CLS of 0.000000 while `raw` was 0.012-0.166. Run
   one browser at a time, the identical shifts (same per-entry values) read
   `hadRecentInput: false` and score as true CLS. Every number above reports both
   figures, and the headline comparison in section 2 was re-measured serially. This is a
   second face of the input-exclusion trap STATUS already records, and it deserves a line
   there: **score CLS with one browser on the machine, or the trap hides the fault
   again.**

5. **My Tab-walk counts for instrument F are 38 illustrative / 54 real, where STATUS
   records 41 / 57.** They are identical on branch and main, and
   `git diff main -- src/instruments src/lib` is empty, so instrument F is byte-identical
   and nothing regressed. The difference is method — a real Tab walk that ends where the
   focus ring wraps, against STATUS's own counting procedure — not a change in the page.
   Not chased, because the gauntlet's requirement is "unchanged", and it is.

6. **Main moved during the build**, to 73a94b5, adding two STATUS lines about the two
   builds in flight. This branch is off cb52d64 and does not carry them; that alone is
   why `git diff main` shows `STATUS.md | 2 -`. STATUS.md is the lane's and was not
   touched.

Nothing else was found. Not merged, not deployed. The tree is clean; every harness
script, the control worktree and the browser profiles live in the session scratchpad.
