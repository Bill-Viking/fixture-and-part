to: astra
kind: mechanical
complexity: simple
reason: one geometry move in one figure file from a reviewer's named fix; Astra because it is a drawn figure (the Offload-reasoning law)
touches:
- src/figures/DiesFigure.jsx
- src/styles.css (ONLY: remove the one `.dies-note-ground` rule)
---
# BRIEF — FIG.7 fix 1: the budget note above the share bars (2026-11-05)

Quality bar: the machine notices, the human never checks; nothing superfluous. Principle served: make the interface truthful.

Rules: the same as `design/the-three-dies-2026-11-05/BRIEF-DIES.md` (never commit, stage or push; no browser, no GUI, no network; both builds `npx vite build --configLoader native` and `VITE_COMPANY=1 npx vite build --configLoader native --outDir dist-co`; `npm run lint` at its one standing warning; no word on the figure changes; CLS 0 — the viewBoxes stay 680 × 414 and 300 × 848 unless the move cannot fit, in which case widen nothing, stop, and say so).

THE FIX (the reviewer's words, `REVIEW-DIES-VERDICT.md` finding 1): in `Lookup()` of `src/figures/DiesFigure.jsx`, the seven pours start at the share bars' baseline (y 257) and the paper ground `dies-note-ground` (y 268–293) is painted over them, so each pour shows as a tick, a gap, then an arrow leaving the note. Move «shares of one budget · they add to 1.00» to sit between the weights row (y 239) and the share bars; shift the share bars, their baseline guide (`M8 256 H…`) and the pours' start point down by about 25 units, so the pours run unbroken from each bar to the landing (`landing.y` 364 stays unless the pours would be shorter than 60 units — then say so); delete the `dies-note-ground` rect and its comment, and its rule in `src/styles.css`. Both layouts share `Lookup()`, so both move together.

Report: `design/the-three-dies-2026-11-05/BRIEF-DIES-FIX1-REPORT.md` — the old and new y of the note, bars, baseline and pour start; the lint line; the two build results; `git status --short`; final line `DONE — …` or `FAIL — …`.
