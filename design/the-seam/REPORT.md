# REPORT — the seam (arc 6), branch `the-seam`

Built 2026-09-22 on the Mac, in the worktree the lane made, against **main cb52d64** in a
second worktree of my own (`seam-main-control`; the sibling builder already held the
`main-control` path in the shared scratchpad, so I made my own and never wrote to theirs).
Dev servers: `npm run dev` from Bash in the background — **the preview tool would have
started the server from the primary working tree, not this worktree, so Bash it was**.
Port 5173 was held by the sibling builder, so the branch ran on **5180** and the control on
**5181**, read from Vite's own log. Both servers stopped at the end; both Chrome instances
and my control worktree removed.

---

## What was built

| file | what changed |
|---|---|
| `src/App.jsx` | `Callout`'s body is now a block: `<Html as="div" className="callout-body">` instead of `<Html as="span">`, plus the docstring saying why and what it was measured against. |
| `src/styles.css` | `.callout p{margin-bottom:14px}` and `.callout p:last-child{margin-bottom:0}` after the existing `.callout` rules, with the comment carrying the measurement. Nothing near the popover rules the sibling branch owns — my insertion is 15 lines at line 135 and shifts their region down by 15, which is a rebase, not a collision. |
| `interactive-guide-spec.md` | one new bullet under **Instrument B (Section 03)** describing the pair of callouts and the seam; `Eighteen of them: twelve EVIDENCE, four THEORY, two ANALOGY` → `Twenty-one of them: twelve EVIDENCE, six THEORY, three ANALOGY`; `one popover for all eighteen` → `all twenty-one`. Copy rules untouched. |
| `README.md` | `the essay's 18 claim marks` → `21`. |
| `design/the-seam/REPORT.md` | this file (force-added; `design/` is gitignored). |

Nothing else. `src/content/essay.js` and `src/content/claimNotes.js` are the lane's two
commits, unmodified by me; `STATUS.md`, `OPENER.md`, `fileFacts.json`, `realModel.js` and
all four files the sibling branch owns are untouched.

**The margin I chose: 14 px.** The prose's own 18 px gap is set for 17 px text with the
whole page around it. Inside a callout the walls are 20 px away (18 below 640 px), so an
18 px gap reads as wide as the padding and the two paragraphs stop being one block in one
box. 14 px keeps the hierarchy — 20 px to the wall, 14 px between the paragraphs,
26.390625 px from line to line inside one — and it is still plainly a paragraph break in
the 390 still. The `:last-child` rule is stated rather than left to the global
`p:last-child{margin-bottom:0}`: the two have equal specificity, mine comes later in the
file, and without it the box would carry a spare 14 px at its foot.

---

## Verification gauntlet

Control: **main cb52d64**, same harness, same run, same Chrome
(154.0.8037.58, headless, `prefers-reduced-motion: reduce` emulated), real mode on WebGPU
(`distilgpt2 · webgpu`) wherever the item calls for it.

### 1. Lint and build

`npm run lint` exit **0** on both trees, with the one pre-existing warning and nothing
new: `src/instruments/AttentionInspector.jsx:55:45 warning react-hooks(exhaustive-deps)`.
`npm run build` green on both.

| chunk | main cb52d64 | this branch | delta |
|---|---:|---:|---:|
| `assets/index-*.js` | 385,495 | **390,472** | **+4,977** |
| `assets/index-*.js` gzipped | 126,553 | 128,550 | +1,997 |
| `assets/index-*.css` | 48,924 | **48,992** | **+68** |
| `assets/index-*.css` gzipped | 9,473 | 9,483 | +10 |
| `assets/fileFacts-B7oxIHSA.js` | 220,989 | 220,989 | 0 |
| `assets/modelBytesWorker-bkRheZbJ.js` | 9,769 | 9,769 | 0 |
| `assets/ort-wasm-simd-threaded.asyncify-*.wasm` | 23,567,050 | 23,567,050 | 0 |
| `assets/transformers.web-*.js` | 550,533 | 550,533 | 0 bytes of size; 8 bytes of content |
| `index.html` | 1,120 | 1,120 | 0 |

The essay's chunk grows by **4,977 bytes** — the callout's html string and the three notes.
The stylesheet grows by **68 bytes** (comments are stripped; that is the two rules). The
transformers chunk is the same length and differs in exactly 8 bytes, which are the hash of
the index chunk it imports: `from"./index-DhF1imG6.js"` against `from"./index-Btr9NUZd.js"`,
at character 41. Rebuilding after I edited only comments produced byte-identical output
(`index-DhF1imG6.js`, `index-XOHLVtOA.css`, same hashes), which is itself the proof that
those edits were comments.

### 2. Prose proof

`git diff cb52d64 -- src/content/essay.js` — **exactly one hunk**, `@@ -79,6 +79,12 @@`,
**+6 lines, −0**, inside section `'03'`, immediately after the `ANALOGY — THE GHOST`
callout and before the section's closing bracket.

`git diff cb52d64 -- src/content/claimNotes.js` — **exactly one hunk**, `@@ -163,6 +163,35 @@`,
**+29 lines, −0**, three entries appended at the end of the object.

`git diff --name-only cb52d64 -- src` returns exactly four paths: `src/App.jsx`,
`src/content/claimNotes.js`, `src/content/essay.js`, `src/styles.css`. **Nothing else under
`src/content`; nothing at all under `src/instruments`, `src/lib` or `src/components`.**

One note on the word "main": the local `main` ref has moved one commit past the branch's
base, to `73a94b5`, and that commit changes `STATUS.md` and nothing else. Every diff above
is quoted against **cb52d64**, which is the branch base and the control.

**And the words are the approved words.** Rendering the callout's html to text and
comparing it with `design/the-seam/WORDS.md`, with the typographic quotes normalised
(`essay.js` writes the entities, the markdown writes plain ones) and the
`[THEORY · parade]` markers replaced by the mark's own word:

- paragraph 1 — page **1,644** characters, approved **1,644**, identical
- paragraph 2 — page **492** characters, approved **492**, identical

### 3. Mapping

`window.__claimCheck()` in a dev build, real mode, at 1280 and at 390:

```
{ marks: 21, notes: 21, missing: [], orphan: [], unnamed: [] }
```

**And it can fail.** With the `scrapbook` entry cut out of `src/content/claimNotes.js` in
this worktree (490 characters removed) and the page reloaded:

```
{ marks: 21, notes: 20, missing: ["scrapbook"], orphan: [], unnamed: [] }
```

Restored from the copy taken first; `shasum -a 256 src/content/claimNotes.js` reads
`42fbd6f5bb7cb5ab28b359650197c348c1b18b42b56e663d33546ea6d16fd857` before and after,
`git status` clean for that path, and the check reads 21/21 again.

### 4. Links — all five open, all five carry the right paper or text

| url | what loaded |
|---|---|
| `https://davidhume.org/texts/t/1/4/6` | **"SECT. VI. Of personal identity."**, Treatise 1.4.6, paragraph numbering T 1.4.6.1 on. OK |
| `https://www.accesstoinsight.org/tipitaka/sn/sn22/sn22.059.than.html` | **"Pañcavaggi Sutta: Five Brethren (aka: Anatta-lakkhana Sutta: The Discourse on the Not-self Characteristic)"**, SN 22.59, translated by Thanissaro Bhikkhu. OK |
| `https://pubmed.ncbi.nlm.nih.gov/12757822/` | **"Is perception discrete or continuous?"** — h1, authors Rufin VanRullen and Christof Koch, *Trends Cogn Sci* 2003 May;7(5):207-213, PMID 12757822, DOI 10.1016/s1364-6613(03)00095-0, abstract rendered. OK |
| `https://evanthompson.me/wp-content/uploads/2012/11/1-s2-0-s1364661316301528-main.pdf` | HTTP **200**, `application/pdf`, 2,081,027 bytes; the document's own metadata reads `/Title(Does Consciousness Disappear in Dreamless Sleep?)`, `/Author(Jennifer M. Windt)`, `/Subject(Trends in Cognitive Sciences, 20 (2016) 871-882. doi:10.1016/j.tics.2016.09.006)`. OK — see the note under it. |
| `https://www.cdc.gov/sleep/about/index.html` | **About Sleep** (the tab reads "About Sleep · Sleep · CDC"), with the table the note quotes: Adult, 18–60 years, **"7 or more hours"**. OK |

Two things about how those were judged, because the brief asked for the Browser pane:

- **PubMed** does answer with a cookie-required shell first — a document whose body is
  `visibility:hidden` with a "cookies required" style block, which is what a page-text read
  a second after navigation returns. It then resolves on its own, and the real page is
  there: title, authors, PMID, DOI and abstract, confirmed in the pane and in a screenshot.
- **The Thompson PDF could not be opened in the Browser pane at all**: the pane reported
  "responded with a file download instead of a page; the user was shown a save dialog and
  the Browser pane did not navigate. Do not retry this URL." I did not retry it there and I
  did not download it. I confirmed it from the bytes the url serves — the headers above, and
  the PDF's own document-info title, author, journal and DOI, read out of a ranged read of
  the trailer. That is first-hand and it matches the note's label exactly. **If the lane
  wants a rendered page rather than a served file, the url would have to change, and that is
  a ruling, not a build step.**

No 404s. Nothing unrelated. Nothing removed or replaced.

### 5. Zero CLS, real mode, 1280 and 390

Method as the page has it: the buffered `layout-shift` observer installed before any page
script, drained after the load flush (a `requestAnimationFrame` then a `setTimeout`), scored
600 ms or more clear of the action; plus the structural-box geometry diff over `header`,
every `.wrap > section`, every `.instrument-slot` and `.foot`, in page coordinates.
Both figures are reported — `cls` is the input-excluded one, `raw` counts every entry.

Every row below, at **both** 1280x900 and 390x844: **cls 0.000000, raw 0.000000, 0 shift
entries recorded at all, 0 structural boxes moved.**

| action | 1280 | 390 |
|---|---|---|
| open `parade` / `sleep` / `scrapbook` | 0.000000 x3 | 0.000000 x3 |
| Escape on each of the three | 0.000000 x3 | 0.000000 x3 |
| outside mousedown on each of the three | 0.000000 x3 | 0.000000 x3 |
| open a second while one is open (`parade`→`scrapbook`, `sleep`→`parade`) | 0.000000 x2 | 0.000000 x2 |
| 400 px of real wheel scroll with each of the three open | 0.000000 x3 | 0.000000 x3 |
| spot-check `rat`, `hsam`, `saccade` — open, Escape, outside mousedown | 0.000000 x9 | 0.000000 x9 |

Total: 23 scored actions per width, 46 in all, every one 0.000000 on both figures with zero
entries and zero boxes moved.

**Across the model load**, at both widths: the geometry diff moves **nothing at all** — not
one of the structural boxes, section 03 included. Section 03 reads
`[284, 7025.61, 712, 2802.02]` before the load and `[284, 7025.61, 712, 2802.02]` after at
1280, and `[18, 7551.25, 354, 4726.47]` before and after at 390.

**The unanchorable positive control** — a 40 px div inserted at the top of the body at
scroll 0 — in the same run, same observer, on the same page:

| tree | 1280 | 390 |
|---|---|---|
| this branch | **cls 0.031250**, raw 0.031250, 1 entry, `hadRecentInput: false`, **18 boxes moved** | **cls 0.047393**, raw 0.047393, 1 entry, `hadRecentInput: false`, **18 boxes moved** |
| main cb52d64 | cls 0.031250 | cls 0.047393 |

One caveat worth having on the record: run inside the action battery, a few seconds after
the last synthetic click, the same control scored `cls 0.000000` with `raw 0.031250` and the
entry flagged `hadRecentInput: true` — the observer's input exclusion reaching further than
the 500 ms the method assumes, in a headless page driven by CDP input. The figures in the
table above are from a run whose control fires with **no synthetic input at all** before it,
where the input-excluded channel scores it properly. Both channels are therefore proven
live, and every action under test reads zero on both.

**The note moves with its sentence**, not with the reader: after 400 px of wheel scroll the
note is still `position: absolute` and still **8.000 px** under its mark (`sleep`,
`scrapbook`, both widths). `parade` at 390 reads −80.375 px, because that note is placed
*above* its mark at that width — the existing placement law flipping when there is no room
below. That is the sibling branch's subject, not this one's, and it costs 0.000000 either way.

### 6. The callouts that were already here

**The brief says five existing callouts. There are four.** On main cb52d64 the page carries
`ANALOGY — THE GHOST` (03), `CONSEQUENCE` (05), `SPECIMEN — THE MOTH` (08) and
`THE HONEST CAVEAT` (10) — `grep -c "type: 'callout'"` is 4 on main and 5 on this branch,
and the fifth is the seam. Everything below is all four.

Each callout scrolled so its own top sits 100 px down the viewport, clipped to its own box,
branch against main, at 1280 and at 390:

| callout | 1280 box | 390 box | max channel delta | pixels differing |
|---|---|---|---|---|
| `ANALOGY — THE GHOST` | 712 x 306.484375 | 354 x 592.78125 | **0** | **0** |
| `CONSEQUENCE` | 712 x 174.53125 | 354 x 302.484375 | **0** | **0** |
| `SPECIMEN — THE MOTH` | 712 x 464.828125 | 354 x 909.46875 | **0** | **0** |
| `THE HONEST CAVEAT` | 712 x 280.09375 | 354 x 487.21875 | **0** | **0** |

**No anti-aliasing tolerance was allowed and none was needed** — the comparison is exact,
0 of 217,872 / 124,600 / 331,080 / 199,360 pixels differing at 1280 and the same at 390.
Every box is identical to main to the last 1/64 px in left, width and height.

What it took to make that comparison honest is worth saying, because a first pass did not
read 0. The new callout adds **770.734375 px** at 1280 and **1,505.671875 px** at 390 to the
page, and those are not whole pixels: everything below the insertion therefore sits at a
different sub-pixel phase and its glyphs rasterise differently, which showed up as max
delta 235 on the three callouts below the seam while their boxes were already identical.
`ANALOGY — THE GHOST`, which sits *above* the insertion, read 0 in that same pass. So the
measurement above is taken with the seam callout `display:none` in the branch page: the four
then sit at **exactly** main's own page coordinates —
8750.40625 / 12424.765625 / 14515.859375 / 17057.15625 at 1280,
10179.265625 / 15941.421875 / 19160.734375 / 23369.828125 at 390, each equal to main's to
the last 1/64 px — the glyphs rasterise at the same phase, and what is left in the picture
is the span-to-div change and the `.callout p` rules, which is the thing under test. It is 0.

### 7. The marks inside a callout

Line pitch inside the seam callout, rects clustered into lines on half a line's tolerance,
at 1280 and at 390, both paragraphs:

| | 1280 | 390 |
|---|---|---|
| computed `line-height` | 26.4px | 26.4px |
| **every** pitch measured, whole callout | **26.390625** | **26.390625** |
| paragraph 1 | 19 lines, height 501.421875 = 19 x 26.390625 | 41 lines, height 1082.015625 = 41 x 26.390625 |
| paragraph 2 | 6 lines, height 158.34375 = 6 x 26.390625 | 12 lines, height 316.6875 = 12 x 26.390625 |
| line to line across the paragraph gap | 40.390625 (26.390625 + 14) | 40.390625 |
| the three lines carrying a mark | `parade` line 6, `sleep` line 8, `scrapbook` line 16 — pitch before and after each: **26.390625** | lines 15, 17, 36 — pitch before and after each: **26.390625** |

**26.390625 px is 26.4 px.** Chrome lays out on a 1/64 px grid and 26.4 x 64 = 1689.6, so
26.4 px is stored as 1689/64 = 26.390625. The CSS value is 26.4; the measured value is the
grid's own version of it; there is no third number. The same measurement over the four older
callouts returns 26.390625 everywhere too — 9, 4, 15 and 8 lines at 1280, each height exactly
its line count times the pitch — so the new callout's rhythm is the page's existing one.

**No mark changes the callout's height.** With `.claim-mark{visibility:hidden}` injected the
callout is **742.734375 px** at 1280 and **1,477.671875 px** at 390 — identical to the figure
with the marks visible, to the last 1/64 px, at both widths. With `.claim-mark{display:none}`
it is *also* identical at 1280 (742.734375); at 390 it comes out one line shorter
(−26.390625), which is the paragraph rewrapping around 24 fewer characters of text, not a
line getting shorter — the pitch table above is where that question is actually answered.
And the test can see a change: `.claim-mark{line-height:3;font-size:26px}` moves the same box
by **+154.828125 px** at 1280 and **+181.21875 px** at 390.

**Does 11.5 px read too large against 16 px text?** No — see
`1280-section-03-whole.png` and `390-seam-top-sleep-open.png`. The mark is fixed at 11.5 px
and the callout's text is 16 px against the prose's 17, so it is a hair larger in proportion
(0.72 of the text against 0.68), and at that difference it still reads as a label set into
the sentence rather than as a word of it — which is what the rule is for. The rule was not
touched.

### 8. Keyboard

A real Tab walk in real mode, focus recorded by a `focusin` listener inside the page:

| | tab stops before the cycle repeats | marks reached | distinct accessible names |
|---|---:|---:|---:|
| main cb52d64 at 1280 | 210 | 18 | 18 |
| **this branch at 1280** | **213** | **21** | **21** |
| main cb52d64 at 390 | 209 | 18 | 18 |
| **this branch at 390** | **212** | **21** | **21** |

**Exactly +3 at both widths, and all 21 marks are reached with 21 distinct names** — the ids
in walk order at 1280: `rome, parade, sleep, scrapbook, lens, reopen, rat, simulation,
imagine, hsam, trauma, fixture, index, synapse, predictive, saccade, converge, align,
charioteer, planning, introspect`. The three new names are
`theory: the self as a sequence`, `theory: what a night is made of`,
`analogy: what persists, and how faithfully`.

On each new mark, at both widths: **Enter opens** the note (`role="dialog"`, labelled
`THEORY — the self as a sequence` / `THEORY — what a night is made of` /
`ANALOGY — what persists, and how faithfully`), **focus lands on the dialog itself**, **Tab
reaches the first link** of the note — `https://davidhume.org/texts/t/1/4/6` for `parade`,
the Thompson PDF for `sleep` — and **Escape closes it and hands focus back to the mark**
with `aria-expanded="false"`. `scrapbook` has no sources by design, so Tab out of its note
lands on the next mark in the prose rather than a link; main already ships one source-less
note (`fixture`, ANALOGY — one model, many memories) that behaves the same way, so this is
the existing behaviour and not something the seam introduced.

Focusable controls in instrument F: unchanged, and identical to main at every width — see
item 10.

### 9. Contrast, computed on the flat card ground

| what | on | ratio | AA 4.5 |
|---|---|---:|---|
| `.claim-mark` closed, `rgb(44,117,57)` | the callout's card, `rgb(255,255,255)` | **5.66** | pass |
| `.claim-mark` open, on `--keys-tint` `rgb(225,236,227)` | its own open ground | **4.66** | pass |
| the callout's body text, `rgb(20,22,26)` | the callout's card | **18.11** | pass |
| the callout's label, `rgb(122,89,0)` | the callout's card | **6.45** | pass |

Identical at 1280 and 390. A stylesheet sweep is valid here: the callout is a flat
`--card` fill with no texture and no image behind it.

### 10. Instrument F untouched

viewBox quoted as the attribute, measured on **both trees** at all three widths:

| width | viewBox | STATUS says | branch = main |
|---|---|---|---|
| 1280 | `0 0 1166 2351.6499999999996` | `0 0 1166 2351.6499999999996` | yes |
| 800 (the column setting) | `0 0 1166 3210.4` | `0 0 1166 3210.4` | yes |
| 390 | `0 0 1166 5487.599999999999` | `0 0 1166 5487.599999999999` | yes |

Tour stop counts (`__tourState.count`), identical on branch and main at every width:
**35** in real mode at 1280 and 800, **33** in real mode at 390, **19** in illustrative at
every width — STATUS's 35/../19 above 640 px and 33/../19 at 390.

Instrument F's focusable controls, same selector on both trees: **72** in real mode at 1280
and 800, **70** at 390, **56** illustrative before the model is in hand and **55** after —
every one of those identical between branch and main.

Two honest notes on this item. STATUS's middle tour number (33 above 640, 31 at 390) is the
greedy variant, and my harness could not reproduce it: clicking `greedy` in real mode flipped
the control's own state but left the count at 35 (1280/800) and 33 (390). It read the same on
both trees, so "unchanged" holds, but I did not reach that number. And the tab-stop totals
above (210/213) are not STATUS's "236 in real mode": my walk counts focus events until the
cycle repeats, which is a different count from whatever produced 236 on the Dell in
September. The number that answers the question is the **delta, +3, at both widths**, and the
21 distinct marks.

### 11. Copy and scrub

```
grep -rn "/Users/\|Fable\|Opus\|Sonnet\|Haiku" src interactive-guide-spec.md README.md
```

**0 hits on this branch. 0 hits on main cb52d64.** Nothing gained, nothing to clear.

---

## The stills

In `design/the-seam/stills/` (gitignored, as `design/` is):

```
design/the-seam/stills/1280-section-03-whole.png
design/the-seam/stills/1280-seam-parade-open.png
design/the-seam/stills/390-seam-top-sleep-open.png
design/the-seam/stills/390-seam-foot-scrapbook-open.png
```

1. **`1280-section-03-whole.png`** — 1280 x 2,863, the whole of section 03 in one capture:
   the eyebrow and heading, both prose paragraphs, all of instrument B down to FIG.4, then
   the cool ghost and the warm seam, the pair reading machine side then human side. Taken by
   making the viewport as tall as the section (the section is 2,803 px) and capturing the
   viewport, not `captureBeyondViewport`, which drops this page's transformed elements.
   **One artifact to know about before judging it:** the fixed mini-legend paints twice in
   this still, once near the top and once at the foot, because the viewport is three times
   its normal height. It paints once in every normal-viewport still, and once on the page.
2. **`1280-seam-parade-open.png`** — the seam callout with `parade` open; the note 8.000 px
   under its mark, 488.625 px tall, its three links readable.
3. **`390-seam-top-sleep-open.png`** — the callout's top at 390 with `sleep` open, 8.000 px
   under its mark.
4. **`390-seam-foot-scrapbook-open.png`** — the callout's foot at 390 with `scrapbook` open,
   both paragraphs and the 14 px gap between them visible.

---

## Found and not fixed

1. **The brief's "five existing callouts" is four.** Main cb52d64 has `ANALOGY — THE GHOST`,
   `CONSEQUENCE`, `SPECIMEN — THE MOTH` and `THE HONEST CAVEAT`. Five is the count with the
   seam. Item 6 above was run over the four.
2. **`src/components/ClaimNotes.jsx` still says "eighteen" in four comments** — the component
   docstring ("one popover for all eighteen of them"), the accessible-name comment ("the word
   EVIDENCE eighteen times"), the delegated-listener comment ("One listener for all eighteen
   marks") and the line above `__claimCheck` ("Eighteen marks in the prose, eighteen notes in
   the file"). That file belongs to the sibling `popover-law` branch this week, so I did not
   touch it. It wants twenty-one after the merge.
3. **`src/App.jsx`'s `Html` docstring says "the eighteen claim marks"** — this one is mine,
   and I left it deliberately: the sentence records a measurement taken when there were
   eighteen ("155 childList records under one scroll, with the eighteen claim marks among the
   nodes thrown away"). Changing the number would misreport what was measured; rewriting the
   sentence is the lane's call.
4. **The spec's `__claimCheck()` line is one field short.** `interactive-guide-spec.md` says
   it "returns `{marks, notes, missing, orphan}`"; it has returned `unnamed` as well since
   the honest pass. Outside the two doc edits the brief scoped to me, so it is reported, not
   changed.
5. **At 390 the `sleep` note covers most of the sentence it answers, and `parade` flips above
   its mark.** Both are the placement law as it stands, both cost 0.000000, and both are
   exactly what the sibling `popover-law` branch is in flight to change. Visible in
   `390-seam-top-sleep-open.png`.
6. **The greedy tour count and the 236 tab stops** — see the two honest notes under item 10.
   Neither is a difference between this branch and main; both are numbers in STATUS I could
   not reproduce with this harness.

## Note text or url I believe is wrong

**None.** Every claim in the three notes was checked against the source that the note cites:

- `parade` — Hume's "bundle or collection of different perceptions, which succeed each other
  with an inconceivable rapidity" and "a kind of theatre" are verbatim at T 1.4.6.4; the
  sutta's "This is not mine. This is not my self. This is not what I am." is verbatim in
  Thanissaro's translation on the page cited; and the VanRullen & Koch sentence claims only
  what the abstract carries ("discrete processing epochs", argued from "a large body of
  psychophysical data"), with no ~10 Hz and no alpha figure — which is right, because the
  full text is behind a wall and the digest said so.
- `sleep` — "7 or more hours" for adults 18–60 is the CDC page's own row; "oversimplified"
  is the paper's own word for the assumption; "an open empirical question" is the paper's own
  phrase. "About a third of a day" for seven-plus hours is a fair rounding.
- `scrapbook` — "sections 05 and 09 say recall rebuilds" checks out: section 05 says
  retrieval returns the trace "to a labile state that must be actively rebuilt to persist"
  and "Every checkout is a check-out-for-edit, re-saved through whoever you are at that
  moment"; section 09's THE BRAIN card says "Memory reopened at recall and rewritable; no
  verbatim copy anywhere." Its empty `sources` matches the house shape — `fixture` on main
  has the same.
- The coda's two page-facts check out too: instrument B (the stepper) is the block directly
  above this callout in section 03, and instrument F's own docstring says the drawing "ends
  at the landing, where the last position's vector meets all 50,257 words" — which is the
  coda's "the landing belongs to the last stream alone".

The one thing I would put in front of the lane is the **Thompson PDF url**, not because it is
wrong — it is live, it is the right paper, and it is the only free full text anywhere — but
because a reader who clicks it in a browser gets a download rather than a page, which is what
happened to me in the Browser pane. That is a reading decision, not a correctness one.

---

## State at the end

Branch `the-seam`, four commits, tree clean. Not merged, not deployed, nothing outside this
worktree written. Both dev servers stopped, every Chrome instance the harness started killed,
and my `seam-main-control` worktree removed — the sibling's `main-control` was never touched.
Every harness script lives under the scratchpad, none in the repo.
