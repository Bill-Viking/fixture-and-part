# REPORT — the contrast (section 07's two cards), branch `the-contrast`

Written by the F&P lane on 2026-10-23 from the Opus builder's hand-back (the harness refused the builder a file named REPORT.md, so its report came back as text and is kept here verbatim in §A) and the lane's own re-run (§B), which also made two changes on top of the builder's head 766066f.

## B. The lane's pass (2026-10-23 06:3x–06:5x, Mac, Fable)

Two changes on the branch after the builder's head:

1. **The kicker's tracking: 0.10em, not the callout label's 0.14em.** At 0.14em the file card's 37-character kicker ("demonstrated — read live on this page") is 315 px against a 304 px measure and wrapped to two lines at every side-by-side width, so the two cards' paragraphs started 16 px apart. At 0.10em it is one line at 1280, 1024, 768 and 390 (measured: both kickers 1 line; both cards' first paragraph 55 px below the card's top; both cards 484 px tall at 1280). Where it must wrap (641–759 px) `text-wrap:balance` stays, so both kickers are two lines of a length (measured at 630: 2 and 2).
2. **One stacking rule for the duo shape.** The builder's own `@media(max-width:640px){.duo.contrast{…}}` is removed; the contrast stacks where section 09's duo stacks, at ≤ 620 (`.duo` in the responsive block). Measured at 630: both duos `289px 289px`; at 390: both `354px`, the brain card first.

The lane's own re-run, on the branch's production build served by `vite preview` (port 5293) in the app's browser pane:

- `npm run lint`: the one AttentionInspector warning (the baseline). `npm run build`: green; `index-Com714Ic.js` 429,145 bytes (main's `index-DpeL6PR0.js` is 425,365). In the bundle, each once: `cited — it cannot be shown here`, `demonstrated — read live on this page`, `A dinner in Lisbon, recalled tonight.`, `read again just now: not the file these numbers came from`; `__FILE_PROVENANCE__` zero times.
- Strings read from the DOM at 1280 against WORDS §2–§3, exact: both titles, both kickers, the brain card's three paragraphs (the mark's text stripped from the second), the file card's two paragraphs with `1d3ab4d7…8431` / `83.5 MB` / `2026-10-21` filled, the unloaded line — 8 of 8 PASS. The block sits between "…has changed since encoding." and "The raw capacity is there regardless…".
- The mark: `data-claim="reopen"`, text `EVIDENCE`; 28 `.claim-mark` buttons on the page.
- The live wiring, real model, loaded in the pane (the 83.5 MB fetch, then E's re-read): the line went `unloaded` → `same`, reading "read again just now in this browser: the same file, byte for byte · sha256 1d3ab4d7…8431", not alert, while E's own line read "this page just read the whole model file again (83.5 MB) — byte for byte the same file that was read on 2026-10-21. fingerprint sha256 1d3ab4d7…8431." The live box 58 px before and after.
- Type: kicker 11.5 px, live line 12 px at 1280, 630 and 390. The live box 58 px at 1280 and 390, 76 px at 630 (the builder's table).
- Not re-run by the lane (the builder's numbers stand): the alert branches, CLS, contrast, the after-run states.

## A. The builder's report, verbatim

Built 2026-10-23, 05:19–06:21, on the Mac by an Opus 5.5 builder in a worktree, off main b50261e.

Commits:
- `0738eef` E hands its finding up
- `a9a209f` the block
- `9592062` the kickers balanced
- `8fa19db` README and spec counts
- `bd9d3f7` App keeps an equal finding
- `766066f` the stills

### 1. What was built (`git diff b50261e --numstat`)

| file | +/− | what |
|---|---|---|
| `src/instruments/FileView.jsx` | +56 −5 | New prop `onProof`. `findingOf()` sits beside `proof()` with the same branches in the same order, and returns a state instead of a sentence. It is handed up from a layout effect. `mb` and `shortSha` are now imported. `proof()` and E's own line are unchanged. |
| `src/lib/fileFormat.js` | +10 (new) | `mb` and `shortSha`, moved out of FileView verbatim. E and the card share this one helper. |
| `src/content/essay.js` | +39 −0 | The `{ type: 'contrast', cards }` block, between section 07's two paragraphs. Titles, kickers, paragraphs as HTML (`&rsquo;` twice; the `reopen` mark exactly as section 05 writes it). The file card's `live` map holds the six strings with `{sha}`. Paragraph 1 has `{sha}`, `{mb}` and `{readAt}`. |
| `src/App.jsx` | +95 −0 | `Contrast` and `LiveLine` beside `Duo`. App holds `fileProof` in state; `handleProof` keeps the held object when E reports an equal finding. `onProof={handleProof}` on FileView, and a `contrast` branch in the block renderer. |
| `src/styles.css` | +32 −0 | `.duo.contrast`: each card is a flex column and the live box has `margin-top:auto`, so both cards end together. `.card-kicker`: mono 11.5 px, 0.14em, line-height 1.5, the card's own ink, `text-wrap:balance`. `.contrast-live-box`: one grid cell holding the shown line plus six hidden sizers. `.contrast-live`: mono 12/18 px, `--muted`; `.is-alert` uses `--alert-ink`, the colour `.file-proof.is-alert` uses. The block stacks at ≤ 640. |
| `vite.config.js` | +21 −0 | `define: { __FILE_PROVENANCE__ }`, which reads sha256, bytes and readAt from `src/content/fileFacts.json` → `provenance` when the config loads (choice 1). |
| `README.md` | +1 −1 | "28 claim marks (26 notes; two reused)". |
| `interactive-guide-spec.md` | +2 −2 | "Twenty-eight of them: sixteen EVIDENCE, eight THEORY, four ANALOGY, over twenty-six notes (… and section 07's contrast reuses section 05's `reopen`)", and "all twenty-eight". |
| `design/the-contrast/stills/*.png` | 5 new | Listed in §2.7. |

**Bundle size:**
- Index chunk: 425.33 → 429.14 kB (+3.81 kB raw; gzip 143.04 → 144.29, +1.25 kB).
- CSS: 52.88 → 53.57 kB (gzip 10.44 → 10.57).
- `fileFacts-DKLLE9gH.js` and `modelBytesWorker-DI-YefZs.js` are byte-identical to main.
- `transformers.web` is 550,533 bytes on both and identical to main once the index file name it imports is normalised. Only its hash moved.

#### Choices for the lane to rule on

1. **The three values come from a build-time `define` in `vite.config.js`, a file the brief did not name.**
   - **Why not the JSON at run time:** `fileFacts.json` is a 232 kB lazy chunk that E fetches after the first paint. Read from there, the paragraph first prints "…sha256 , , read when this page was built on ." and then reflows.
   - **Measured cost of the lazy variant** (put in, then reverted): a reload with the block on screen scored 0.001006 at 1280 and 0.000220 at 390, source `p`.
   - **With the define:** the same reload scores 0 / 0, and the paragraph's first appearance carries all three values.
   - **Why not a static import:** it would put 232 kB in the index chunk.
   - The values are still fileFacts.json's own, printed through E's `shortSha` and `mb`. A dev server picks up a regenerated JSON on restart; the config's comment says so.
2. **The live line's height is reserved by six hidden sizers, not by per-breakpoint `min-height` constants.**
   - All six lines are laid in the same grid cell, hidden. The card's width is fluid (242–302 px at 641–759; 238–558 px stacked), so fixed constants would clip at some widths or leave blank lines at others.
   - The box takes the tallest line's height at whatever width it is. The sizers are `aria-hidden` and `visibility:hidden`.
   - Each line's own height in lines (unloaded / same / same-after-run / differs / error / reading):

     | width | lines | box |
     |---|---|---|
     | 1280, 1024, 768 | 3/3/3/3/2/1 | 58 px |
     | 641 | 4/3/4/4/2/2 | 76 px |
     | 640–620 | 2/2/2/2/1/1 | 40 px |
     | 390 | 3/3/3/3/2/1 | 58 px |
     | 360 | 3/3/4/4/2/1 | 76 px |
     | 320 | 4/3/4/4/2/2 | 76 px |

   - `no-fingerprint` prints nothing into the reserved box; the box stays, empty. That is how "no live line" moves nothing.
3. **The finding is handed up from a layout effect.** From a passive effect, the card's line trailed E's line by 80–110 ms on every change. From a layout effect, the two change in the same paint in every record. `handleProof` returns the held object for an equal finding, so the report at mount does not render the page again.
4. **What `sha` holds in the finding:**
   - `same` and `differs`: the live sha.
   - `same-after-run` and an after-run `differs`: `afterRun.sha`.
   - `unloaded`, `reading`, `error` and `no-fingerprint`: null.
   - One edge was not driven: a mismatch `differs` with no SubtleCrypto has `live.sha` null and would print "sha256 —".
5. **The mismatch route of `differs` prints the build's own sha.** When the fingerprint matches but a reading disagrees (the lane's ruling), the line says "not the file these numbers came from · sha256 1d3ab4d7…8431". That is the same sha paragraph 1 prints two lines above. E explains it as "same fingerprint but reads differently". Built as ruled; worth Bill's eye.
6. **The file card's kicker is two lines at every side-by-side width.**
   - At the label's tracking it is 315 px wide (computed: 37 characters × 8.51 px) against a 302 px measure.
   - `text-wrap:balance` gives "demonstrated — read" / "live on this page" instead of a full line with "page" alone.
   - A tracking of 0.08em would fit one line at ≥ 760. I did not use it because the brief names the label's tracking.
7. **The block stacks at ≤ 640, as the brief's widths ask; section 09's duo still stacks at ≤ 620.** The 09 duo is identical to main: same markup hash (`ffc2780ac9962dab`), same columns, same height at 1280 (348/348, 381.56), 630 (289/289, 455.95) and 390 (354, 754.33).
8. **The live line sits at the foot of its card**, so the two cards end together whichever is taller.
9. **Left for the lane:**
   - STATUS.md line 12 still says "27 marks (15 EVIDENCE, 8 THEORY, 4 ANALOGY) over 26 notes".
   - The comments in `src/components/ClaimNotes.jsx` say "twenty-one"; they were already stale on main.
   - README's Layout list does not name `src/lib/fileFormat.js` (nor `pieceLabel.js` before it).
   - The spec carries the new count but has no paragraph on the block.

### 2. The gauntlet

**Setup:**
- One headless Chrome at a time, on `--remote-debugging-port=0`, with reduced motion on.
- The branch was served on port 5291 by a scratchpad Vite config that loads the project's own `vite.config.js`, with a scratchpad cacheDir.
- The control (main b50261e) was exported with `git archive` and served on port 5292.
- Both servers are killed and no headless Chrome is left. `node_modules` is a gitignored symlink to the primary checkout's.
- I checked the served sources before measuring: the branch's essay.js contains THE BRAIN twice, main's once.

#### 2.1 Lint, build, bundle
- **Lint** (foreground, `pwd` was the worktree): the one AttentionInspector warning, same as main.
- **Build:** green in 0.40 s.
- **Strings in the bundle:** `cited — it cannot be shown here`, `demonstrated — read live on this page`, `A dinner in Lisbon, recalled tonight.` and `read again just now: not the file these numbers came from` are each in it once. The define's `` readAt:`2026-10-21` `` is in it once, and `__FILE_PROVENANCE__` appears zero times.
- **Production build** (`vite preview`): renders paragraph 1 with all three values and no console errors.

#### 2.2 Strings: 90 of 90 PASS
The harness parses WORDS.md §2–§3 directly and fills ⟨the live fingerprint⟩ with what each run saw.

- **At 1280 and at 390, 21 checks each:**
  - Brain card: title, kicker, p1, p2 (mark removed, its separating space trimmed), the mark's claim `reopen`, the mark's text `EVIDENCE`, p3, paragraph count 3.
  - File card: title, kicker, p1 with `1d3ab4d7…8431` / `83.5 MB` / `2026-10-21`, p2, paragraph count 2.
  - The shown unloaded line; the six hidden sizers, each against WORDS with the build's sha; sizer count 6.
- **48 checks on the lines actually shown in the §2.3 runs, at 1280 and 390:**
  - normal: unloaded, reading, same, same-after-run.
  - differs: unloaded, reading, differs (`669cf47b…26a4`).
  - error: unloaded, reading, error.
  - no-fingerprint: unloaded, reading, and no line.
  - mismatch: unloaded, reading, differs (`1d3ab4d7…8431`).
  - after-run differs: unloaded, reading, same, differs (`1c3ab4d7…8431`).
  - after-run error: unloaded, reading, same, error.

#### 2.3 The live line's states
Real model, driven over CDP. In every record, the block's line and E's `.file-proof` line were read in the same mutation callback.

| state | how it was driven | the block's line | class | E's own line beside it |
|---|---|---|---|---|
| unloaded | page loaded, model not | load the model in section 01 and this page reads the whole file again, here, and says whether it is still the same. | normal | these numbers were read from the model file on 2026-10-21, when this page was built. load the model and the page reads the same file again, right here. |
| reading | model load; caught in every run, about 300 ms | reading the whole model file again… | normal | reading the whole model file again… |
| same | model load from the cached copy | read again just now in this browser: the same file, byte for byte · sha256 1d3ab4d7…8431 | normal | this page just read the whole model file again (83.5 MB) — byte for byte the same file that was read on 2026-10-21. fingerprint sha256 1d3ab4d7…8431. |
| same-after-run | RUN THE PASS (F's STEP THROUGH under reduced motion), then the text changed through the input's value setter plus an `input` event, to "The engine roared and it shut down. Then quiet."; the model ran and E read again | the text changed and the model ran; the file did not · read again just now, still the same file · sha256 1d3ab4d7…8431 | normal | you changed the text and the model ran. the file did not change — read again just now, still the same file (sha256 1d3ab4d7…8431). |
| differs | before the load, one byte of the model file in the Cache API (`fixture-and-part-distilgpt2-v3`) changed in place: byte 64,541,348, inside `h.3.mlp.c_fc.weight_quantized`, 237 → 236. The page then loads, runs and reads a different file. The changed copy was dropped afterwards. | read again just now: not the file these numbers came from · sha256 669cf47b…26a4 · section 01 says what it found | **alert**, rgb(179,45,25) | the file in this browser is not the file read on 2026-10-21 (fingerprint sha256 669cf47b…26a4) — still reading this tensor out of it → … the numbers shown are read from it (alert, same colour) |
| differs (mismatch) | CDP `Fetch` rewrote the facts module's response: `litRow` id 340 → 341 | …not the file these numbers came from · sha256 1d3ab4d7…8431 · section 01 says what it found | **alert** | the file in this browser has the same fingerprint but reads differently — wte.weight_quantized lit row — the numbers shown are read from it (alert) |
| error | the worker E reads in was held at its first line (`Target.setAutoAttach`) and given a cache that is gone and a `fetch` that fails with "Failed to fetch". The page's own model load is untouched. | the file could not be read again just now · section 01 says why | **alert** | the file in this browser could not be read — Failed to fetch. the numbers shown are the ones read on 2026-10-21. (alert) |
| no-fingerprint | `crypto.subtle` removed before the load, in the page and in the worker (the hash is taken in the worker) | no line (empty, box kept) | normal | this page is reading the model file again here · no fingerprint can be taken in this browser · still comparing… → …the tensor list and this tensor's bytes match the file read on 2026-10-21 |
| reading after a run | the worker's second digest held for 1.5 s | reading the whole model file again… | normal | you changed the text and the model ran. reading the file again… |
| differs after a run | the second digest came back with one bit of the hash flipped | …not the file these numbers came from · sha256 1c3ab4d7…8431 · section 01 says what it found | **alert** | you changed the text and the model ran, and the file read differently just now (sha256 1c3ab4d7…8431) — that is not the file these numbers came from. (alert) |
| error after a run | the second digest rejected | the file could not be read again just now · section 01 says why | **alert** | you changed the text and the model ran. the file could not be read again just now — the read stopped before it finished (alert) |

Every state was driven at both 1280 and 390, with identical strings. The block and E said the same thing in every record, and changed in the same paint. Without the hold, the after-run `reading` state never rendered, and E's own line skipped it too.

#### 2.4 The mark
- The brain card's EVIDENCE mark and section 05's `reopen` mark behave identically, tested by a real CDP click and by Enter, at 1280 and 390:
  - Same accessible name: `evidence: when a memory comes loose`.
  - Same note: `EVIDENCE — when a memory comes loose`, 628 characters, same text and links.
  - Focus moves into the note and `aria-expanded` is true.
  - Escape closes it and returns focus to the mark that opened it.
- **Mark count from the DOM:** 28 marks (16 EVIDENCE, 8 THEORY, 4 ANALOGY) over 26 notes. `reopen` and `hsam` are each used twice; none is unnamed. `__claimCheck()` returns `{marks: 28, notes: 26, missing: [], orphan: [], unnamed: []}`.
- **Main as the control:** 27 marks (15 / 8 / 4) over 26 notes.

#### 2.5 Zero layout shift (cls / raw)
The block was scrolled so its live line sat at 45% of the viewport; at 390 that puts the file card and what follows the block on screen.

- **Load** (the observer's load flush drained and reported): 0, 0.000377, 0.000721 or 0.000866, varying run to run. The source is the header's font swap (`h1`, `span.moving`, `p`) at scroll 0. Main reads 0.000866 at 1280 and 0.000377 at 390, from the same sources.
- **Positive control** (40 px at the top of the body, scroll 0, no input before it): 0.031250 / 0.031250 at 1280 and 0.047393 / 0.047393 at 390, on both trees in every run.
- **Every action scored 0.000000 / 0.000000** with no shift entries, at both 1280 and 390:
  - model load → same
  - RUN THE PASS
  - changed text → same-after-run
  - model load → differs; → differs (mismatch); → error; → no-fingerprint
  - changed text → reading → differs after a run
  - changed text → reading → error after a run
- **Nothing moved:** the page-coordinate geometry of section 07's children, every card element, and sections 08–11 was unchanged across every action. The live box was 58 px before and after each one.
- **Main:** the same three normal actions also score 0 / 0.
- No scored action used synthetic input: clicks were `element.click()` and the text went through the value setter.
- **Reload with the block on screen** (150 px under the viewport top; restored scrollY 15107 at 1280, 20603 at 390): 0 / 0 at both widths. The lazy-JSON variant scored 0.001006 and 0.000220 (choice 1).

#### 2.6 Layout and type
- **Layout:** side by side at 1280, 1024 and 768 (cards 348 px wide, 484 px tall) and at 641 (288.5 px, 575.6 tall). Stacked, brain card first, at 640, 621, 620, 390, 360 and 320.
- **Type:** the kicker renders at 11.5 px and the live line at 12 px at every width listed. No transform sits above either, so rendered size equals computed size.
- **Contrast** against the amber tint rgb(252,243,216) / the steel tint rgb(232,239,248):

  | text | on amber | on steel |
  |---|---|---|
  | brain kicker and title (moving-ink) | 5.82 | 5.57 |
  | file kicker and title (frozen) | 6.15 | 5.88 |
  | paragraphs (ink) | 16.35 | 15.64 |
  | live line, normal (muted) | 5.81 | 5.56 |
  | live line, alert | 5.73 | 5.48 |
  | claim mark (keys), on its own amber card | 5.11 | — |

  The alert colour is identical to `.file-proof.is-alert`'s, rgb(179,45,25).

#### 2.7 Stills
In `design/the-contrast/stills/`; I looked at each before committing.
- `branch-1280-block-unloaded.png` (1280×760)
- `branch-1280-block-same.png` (1280×760), the sha showing
- `branch-1280-block-alert.png` (1280×760), the `differs` state in red with `669cf47b…26a4`
- `branch-390-block.png` (390×1100), stacked, unloaded
- `main-1280-section-07.png` (1280×760), the control: the two paragraphs with nothing between them

### 3. Not driven, or not done
- The `differs`-with-no-SubtleCrypto edge (choice 4) was not driven.
- The after-run `reading` state was seen only with the 1.5 s hold.
- The lane's items in choice 9 were left alone.
