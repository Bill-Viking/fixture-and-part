to: sol
kind: mechanical
complexity: complex
reason: twenty-two ruled edits across the essay, three instruments, the figures' CSS and one new phone-only bar; every word below is the owner's ruling of 2026-10-31 — copy it exactly, improve nothing
touches:
- src/content/essay.js
- src/content/claimNotes.js
- src/content/explainers.js
- src/instruments/ForwardMap.jsx
- src/instruments/Stepper.jsx
- src/instruments/FileView.jsx
- src/instruments/GlassPass.jsx
- src/lib/tour.js
- src/lib/realModel.js
- src/lib/pieceLabel.js
- src/figures/*.jsx
- src/styles.css
- src/company.css
- src/components/ModeControl.jsx
- src/App.jsx
---
# BRIEF 2 — the five cold labels, the phone, and the reading notes (2026-10-31)

Quality bar: the machine notices, the human never checks; nothing superfluous; zero layout shift at every width in both copies. Every quoted string below is final: paste it, do not reword it. Where you cannot find an anchor or a ruling conflicts with the code, STOP that item, leave it unbuilt, and say so in the report — never improvise a wording.

Report: `design/the-next-cut-2026-10-31/BRIEF-2-REPORT.md` (write it at exactly this path, relative to the workspace root) — per item: built / stopped, file:lines, the exact string before and after; the two build results; the lint result; `git status --short` last; final line `DONE — …` or `FAIL — …`. You cannot commit, push, or open a browser; the lane does the proofs.

Read first: `design/the-next-cut-2026-10-31/SOURCES-05-KEEPS.md` (the Sonnet reader's digest of the two papers for item 19) and the notes at the head of `src/instruments/ForwardMap.jsx` and `src/components/TeachPair.jsx`.

The page has two copies from one source (public: `npm run build -- --configLoader native`; company: `VITE_COMPANY=1 … --outDir dist-company --base /fixture-and-part/company/`; `COMPANY` from `src/lib/company.js`). Unless an item says "company copy", an edit applies to both.

## Group 1 — the five cold labels (instrument F and the company bar)

1. `src/instruments/ForwardMap.jsx` `const APERTURE_NOTE = 'UNEMBED · WTEᵀ'` → `'UNEMBED · THE EMBEDDING TABLE, BACKWARDS'`. The plate is sized from its own words (see the comment under it); check the sizing still measures the new string and that the plate fits inside the sheet at 390 wide (the `g.compact` band) — if the one-line plate cannot fit at 390, let it take two lines there and say so.
2. Each wall's second label line reads `24 × 64 WINDOW · i8` (the width is measured from that literal at ~line 1593; the drawn string is composed near line 3131 with `tensor?.dtype ?? 'i8'`). New second line, literal: `24 × 64 OF 768 × 2304 BYTES`. Update the measuring literal to the same string. The first line (the file's own name, `ATTN.C_ATTN.WEIGHT`) stays.
3. «the hero» → «the followed word» in every string a reader can see in F: the legend (`… is the hero, so it stands back` → `… is the followed word, so it stands back`), the answers (`— the hero here` → `— the followed word here`; `the hero is earlier` → `the followed word is earlier`; `the hero is an earlier word` → `the followed word is an earlier word`; `an earlier hero leaves it standing back` → `an earlier followed word leaves it standing back`; `which is where the hero is` → `which is where the followed word is`; `read the hero's own row` → `read the followed word's own row`; `the hero's own sources` → `the followed word's own sources`), the ambient fallback (`heroToken ?? 'the hero'` → `'the followed word'`), any tour caption in `src/lib/tour.js` and any explainer in `src/content/explainers.js` that says "hero" to the reader. Grep `hero` across `src/` and list every user-visible occurrence in the report with what you did; code identifiers, comments and CSS class names stay as they are.
4. `ForwardMap.jsx` note: `'illustrative — the walls are real, the fall is a schematic'` → `'illustrative — the walls are the file’s own bytes; the fall is drawn, not computed'` (typographic apostrophe, as the file uses).
5. `src/components/ModeControl.jsx` company hint: `company copy · no model here · the numbers are stand-ins except where a label says they are the file’s own` → `company copy · no model here · the numbers are stand-ins, except where a label says the file’s own or one real pass`.

## Group 2 — the phone (paint; ≤ 640 px is the phone band, `@media(max-width:640px)` in `src/styles.css`)

6. Instrument E (`src/instruments/FileView.jsx`): at ≤ 640 the window draws no row labels, so the followed row (`FOLLOWED_INDEX`, the row the SIGN names as "it") is unmarked while the sign still names it. Add a thin amber band (2 px, `var(--moving-lit)` or the file's own amber token) down that row's left edge at ≤ 640 only — one element already positioned by the row grid, or one CSS rule on the row's existing element if it has one; nothing added to the wide layout. No new height anywhere.
7. Instrument E, the idle line under the window (`standoutLine()` ~line 1315): at ≤ 640 there is no slot band, so the column numbers it names cannot be seen. At ≤ 640 the line reads `two slots stand out; a wider window marks them` for two slots (`one slot stands out; a wider window marks it` for one; `<N> slots stand out; a wider window marks them` otherwise, N in the existing `NUMBER_WORDS`); the wide line stays as it is. Decide the band by the same media query the row labels use (read how the labels are hidden and reuse that signal — a `matchMedia` hook exists in `ForwardMap.jsx` ~line 1116; FileView may have its own). Both wordings must occupy the same reserved height (the line already reserves; confirm).
8. FIG.7 (`src/figures/` — the figure whose stacked notes fall to ~8.3 px under a 359 px window): under 360 px the notes are hidden (`display:none` on the notes' class inside a `@media(max-width:359px)` rule) and the labels kept. Find the figure by its viewBox/notes (the build note of 2026-10-21 names it FIG.7); say which file in the report.
9. Instrument F's stations label (the one that falls to 9.39 px at a 360 px window and 8.08 at 320): under 360 px it steps up one size — find where `g.fs` is chosen for the compact band and add one step for `innerWidth < 360` (or the matching media signal) for that label only. The curves legend at 1200 passes the floor; leave it alone.
10. Instrument E's pick mark on the curve (`.file-curve …` the amber mark, ~1.2 px wide at 390): add a thin dark edge — one CSS rule (`stroke: var(--ink)`/the page's ink token at 0.5–0.75 px, or a 1 px dark outline the way the page edges other amber marks; read `styles.css` for the house way). No size change.
11. Instrument E's pick line at phone width (`.file-curve-pick-line`): at ≤ 640 the fixed colour key moves BELOW the pick line (order change in the flex/grid, or the key's position rule under the media query), so nothing can cover the line's right end. The reserved heights (`:2548`, `:2628`) stay; if moving the key changes the needed height, update the reserve and say so.
12. Wayfinding bar, phone only (≤ 640): a thin bar fixed at the top of the viewport (height 36 px, fixed, present from first paint under the media query — nothing may shift when it appears; add the same 36 px to the page's top padding at ≤ 640 so the masthead is not covered), reading `<section number> · <section title>` for the section currently in view (IntersectionObserver over the essay's `<section>` elements or whatever carries the section titles; before the first section it reads the page's own name). A tap on the bar opens a list of all eleven sections (number · title, each an anchor link to the section); a second tap or Escape closes it; the open list is `position:fixed` under the bar and does not move content. Both copies. House style: the page's mono eyebrow face, ink on the paper tone, the one amber rule under it; keyboard reachable (`button` + `role="dialog"` or a `details` element); `prefers-reduced-motion` honoured (no animation). Put it in `src/components/SectionBar.jsx` and mount it once in `src/App.jsx`. Desktop: not rendered at all (CSS `display:none` is not enough if it costs a DOM node that measures; render only when the ≤ 640 media query matches, via the existing matchMedia hook pattern).

## Group 3 — the reading notes (words; each anchor is quoted from the file as it stands)

13. Instrument B (`src/instruments/Stepper.jsx`, the real road through `src/lib/realModel.js` `realTokenize`): trim trailing whitespace from the typed sentence before tokenizing in real mode; when something was trimmed, show one line under the input, same reserved height as the existing teach line: `the space at the end was dropped: GPT-2 keeps a word’s space with the word`. Illustrative mode unchanged.
14. Instrument B: a sampled piece that is a fragment of a multi-byte character (decodes to the replacement glyph) is labelled `raw byte` on the strip and the rack, by the same rule instrument E uses (`labelOf` in `src/lib/pieceLabel.js`), and the readout says `a fragment of a character the model is building across several tokens`.
15. Instrument B's eyebrow line `reading:` → `the sentence this pass reads:` (find the exact literal; if the eyebrow is composed, change its leading word). The head's purpose line (`Stepper.jsx:312`) becomes: `One step at a time: the shortlist for the next token, the sequence so far, and the K/V rack it reads from. The shortlist is the landing, the strip is the part so far, the rack is the model’s only memory within one conversation — one row per token per layer, written once, never rewritten.`
16. `src/content/essay.js` section 04 (line ~147): `the scores pass through a softmax so they sum to one` → `the scores pass through a softmax, a rule that turns any list of scores into shares of one budget, so they sum to one`.
17. Section 04, a new thread sentence at the end of the section, after the glass instrument (the last prose element of 04, before 05 begins): `Every reading above left what it read unchanged: the window takes nothing from the stack, and a lookup takes nothing from the rack. Hold that against the next section.`
18. Section 05: `The same drug without the recall does nothing.` → `Give the same drug to a rat that is not recalling the memory and the fear stays: the trace is only open while it is being recalled.` And directly after `broken glass that never existed` insert ` — the render of section 08 filling in what a smash ought to leave, then saved back as part of the memory` (keep whatever punctuation follows the anchor).
19. Section 05's CONSEQUENCE callout (the one containing `Every checkout is a check-out-for-edit`): append, as its last sentences: `Recalling a memory can sometimes make it open to change. Whether that happens depends on the memory and the conditions of recall. A change in a learned fear response does not mean the whole remembered experience has been erased. And recalling also keeps: a memory brought back is held longer than one only re-read.` Put one EVIDENCE mark on `recalling also keeps` with a new note `keeps` in `src/content/claimNotes.js` in the shape of the existing notes (read `rat` and `reopen` for the shape and the mark syntax in essay.js). The note's text, from the digest: `Roediger & Karpicke 2006 (Psychological Science 17(3), 249–255): students who took a free-recall test on a passage remembered more of it a week later than students who re-read it, though re-reading won at five minutes and raised confidence more. Sevenster, Beckers & Kindt 2014 (Learning & Memory 21(11), 580–584): a learned fear in people reopened for change only when the reminder carried a prediction error — an expected shock that did not come; with no surprise the memory stayed as it was, and after four unreinforced reminders new learning began instead.` with the two URLs `https://pubmed.ncbi.nlm.nih.gov/16507066/` and `https://pmc.ncbi.nlm.nih.gov/articles/PMC4201815/` in the notes' source field. Do NOT amend the existing omitted-shock example anywhere: the digest found only that one route tested.
20. Section 06, directly after `The forgetting is the learning.`: ` Re-saving a memory through the person you are today is how it stays useful: the dinner is refiled under what you have learned since about the people and the place, worse as a record of the night and better as a guide to the next one. And there is no first, perfect reading to protect: what was stored was never the night but a sparse set of cues into the model, so even the first recall is a render, the closest you will ever stand to it and already a reconstruction.`
21. Section 08: `Feedback connections in visual cortex outnumber feedforward ones` and the clause that follows up to the end of that sentence → `Feedback connections in visual cortex — wiring that runs from the higher visual areas back down to the lower ones, not to the eye — outnumber feedforward ones, and one influential account, predictive coding, reads that wiring this way: each level predicts what the level below will report, the model generates the expected scene, and the retina’s main contribution is the diff, the prediction error.` Keep the existing `predictive` evidence mark attached where it was (on "predictive coding" or the sentence end, as the file has it). Quote the whole old sentence in the report.
22. Section 02: `multiplied through grid after grid` → `multiplied by grid after grid`.

## Rules

- Typography as the file uses it (’ not ', — spaced as the file does). Essay html strings are JS strings: escape as the file does.
- Any reserved-height element whose text grows (the Stepper purpose line, the CONSEQUENCE callout, E's idle line, the stations label) is checked: TeachPair pairs stay in the same grid cell; a plain `<p>` may grow freely only if it is static (laid out before first paint) — say which in the report.
- No new dependency, no change to `passFacts.json`, `fileFacts.json`, `bakedPass.js`, `passCore.js`.

## Checks

1. Both builds succeed (see the two commands above; add `--outDir dist-co` company build too, no base, for the lane's pane).
2. `npm run lint` clean except the known AttentionInspector warning.
3. `grep -rn "the hero" src --include='*.jsx' --include='*.js'` lists only code comments; `grep -rn "WTEᵀ\|WINDOW · i8\|fall is a schematic\|except where a label says they are" src` returns nothing.
4. Every anchor string in Group 3 is found exactly once before the edit (print the counts).
5. `git status --short` — only the touched files and the report.

## Done

`DONE — <n> of 22 built, <list of stopped items if any>; builds OK; lint OK` or `FAIL — …`.
