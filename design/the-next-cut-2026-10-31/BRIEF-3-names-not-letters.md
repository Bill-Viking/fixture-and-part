to: sol
kind: mechanical
complexity: simple
reason: a settled rename across the page's reader-facing strings; no drawing, no new layout
touches:
- src/App.jsx
- src/components/*.jsx
- src/content/essay.js
- src/content/explainers.js
- src/content/claimNotes.js
- src/instruments/*.jsx
- src/figures/LadderFigure.jsx
- src/lib/tour.js
- src/lib/forwardMap.js
- src/styles.css
---
# BRIEF 3 — the instruments are named, not lettered (2026-10-31)

Quality bar: nothing superfluous; zero layout shift; every reader-facing string changed exactly as below, no wording of your own. Report: `design/the-next-cut-2026-10-31/BRIEF-3-REPORT.md` (exactly this path from the workspace root): per file the strings before → after, the two builds, lint, `git status --short` last, final `DONE — …` / `FAIL — …`. No commit, no push, no browser; the lane proves in its pane.

## Why

The six live instruments are labelled INSTRUMENT A–F in the order they were built, and the page reads them E, A, F, B, C, D. The owner, reading the office copy: «why aren't they in alphabetical order? I'm confused» and «why even label them that way». Ruled: drop the letters. Each instrument is pointed at by its NAME, and its eyebrow carries its figure number in the shape the three drawings already use (`FIG.3 — THE LADDER`).

## The mapping (final)

| old | eyebrow (InstrumentHead `eyebrow=`) | name in prose | file |
|---|---|---|---|
| INSTRUMENT E | `FIG.1 — THE FILE` | the file | src/instruments/FileView.jsx |
| INSTRUMENT A | `FIG.2 — THE TOKENIZER` | the tokenizer | src/instruments/Tokenizer.jsx |
| INSTRUMENT F | `FIG.4 — THE FORWARD PASS` | the forward pass | src/instruments/ForwardMap.jsx |
| INSTRUMENT B | `FIG.6 — THE STEPPER` | the stepper | src/instruments/Stepper.jsx |
| INSTRUMENT C | `FIG.7 — THE ATTENTION INSPECTOR` | the attention inspector | src/instruments/AttentionInspector.jsx |
| INSTRUMENT D | `FIG.8 — THE GLASS PASS` | the glass pass | src/instruments/GlassPass.jsx |

The titles under the eyebrows stay as they are. The figcaptions (`FIG.2 — One forward pass begins here…` etc.) stay as they are.

## The rule for every mention

`grep -rn -i "instrument [A-F]\b" src` lists every occurrence (about 170; most are code comments). Change ONLY what a reader sees or a screen reader speaks: JSX text, string literals rendered to the page, `aria-label`s, the essay (`src/content/essay.js`), the explainers, the claim notes, the tour (`src/lib/tour.js`), the readouts composed in `src/lib/forwardMap.js`. Leave code comments, identifiers, CSS class names and file names untouched.

- "instrument A" → "the tokenizer"; "instrument B" → "the stepper"; "instrument C" → "the attention inspector"; "instrument D" → "the glass pass"; "instrument E" → "the file"; "instrument F" → "the forward pass". Capitalise as the sentence needs ("Instrument B keeps" → "The stepper keeps"). Where the old text already says the name beside the letter ("instrument D, the glass pass"), keep the name once. Where a pointer needs the figure number to be findable (a tour caption that sends the reader elsewhere, the company intro's "instruments A, D and F"), add it once in parentheses: "the tokenizer (FIG.2), the glass pass (FIG.8) and the forward pass (FIG.4)".
- Possessives follow: "instrument A's" → "the tokenizer's".
- The row in the forward pass that opens other instruments by letter chips (`OPEN` at ForwardMap.jsx ~2817 with chips A–E): the chips become short names in the same caps style — `FILE` `TOKENIZER` `STEPPER` `ATTENTION` `GLASS` — and their aria-labels say "open the file" etc. Measure: at a 390 px window the row must still fit on its lines without clipping; if it wraps to one more line, reserve that line (the row's height) so nothing shifts, and say so.
- The word "instrument" stays wherever it names the kind ("the six instruments", "the instrument below", "OPEN THE INSTRUMENT").
- `src/components/InstrumentHead.jsx`: read it; if it formats the eyebrow, keep the shape the figures use.

## Checks

1. `grep -rn -i "instrument [A-F]\b" src --include='*.jsx' --include='*.js'` — every remaining hit is a code comment (print the list in the report; a hit inside a string or JSX is a FAIL).
2. `npm run build -- --configLoader native` and `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co` succeed; `npm run lint` clean except the known AttentionInspector warning.
3. `grep -c "INSTRUMENT [A-F]" dist/assets/index-*.js dist-co/assets/index-*.js` — 0.
4. `git status --short` — only touched files and the report.

## Done

`DONE — <n> strings renamed in <m> files; 0 reader-facing letters left; builds OK; lint OK` or `FAIL — …`.
