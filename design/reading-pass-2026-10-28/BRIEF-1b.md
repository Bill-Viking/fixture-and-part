# BRIEF 1b — the three stopped items of BRIEF 1, ruled (2026-10-28)

Same rules as `BRIEF-1.md` in this folder (read it first: never commit or stage; no browser; the `--configLoader native` flag; the words verbatim; both copies; the protected files; the reservation method; the report shape). The lane has read and committed your BRIEF-1 edits as f174ce1; build on that tree. Report to `design/reading-pass-2026-10-28/BRIEF-1b-REPORT.md`, last line `DONE — …` or `FAIL — …`.

## R2(b), ruled — two glossary entries

The glossary is `header.glossary` in `src/content/essay.js` (drawn by `Glossary` in `src/App.jsx`). Add two entries in the same shape, `role: null`, no trailing period inside the gloss (the strip's own grammar):

- after TOKEN: `{ word: 'EMBED', role: null, gloss: 'to embed a piece is to look its id up in the word table: a row comes out, and that row is the piece\'s starting vector' }`
- after LANDING (before BLOCK): `{ word: 'UNEMBED', role: null, gloss: 'to unembed a vector is to hold it up against every row of the same table: a score per piece comes back, and the scores, shared out by a softmax, are the landing' }`

The strip's row count is computed from the entry count; confirm nothing in `Glossary` or its CSS assumes seven entries (a fixed grid, a fixed height, a hard-coded index). If something does, make the count-driven form the rule and report the change. Check both bundles carry both words exactly once in the glossary (`'EMBED'` as a glossary word; note `UNEMBED` also appears in F's landing label — count the gloss text instead: `to embed a piece is` 1 each, `to unembed a vector is` 1 each).

## R6, ruled — the readout says what it waits for, in both idle states

`src/lib/forwardMap.js`, `partReadout(facts)`:
- the null branch returns exactly: `nothing chosen yet — click a ray, a carrier or a wall cell: this line says what it is, and the buttons beside it open it in the file or in its own instrument`
- the non-null branch (the tensor line, shown after a plate or wall header is chosen while no instrument reading is open) keeps its text and appends exactly: ` · open it in the file to read it at length`

`ForwardMap.jsx`'s readout row is unchanged. Confirm both strings fit the readout's reserved lines at every band with the method the `.map-readout` comment documents (node estimate is acceptable here as in your BRIEF-1 report; say so). Counts: `nothing chosen yet — click a ray` 1 each, `open it in the file to read it at length` 1 each.

## R8(e), ruled — the generated reading line, one wording, reserved by band

Install the line exactly as BRIEF-1 R8(e) specifies (wording, the three tail variants, pieces printed as the table prints them), directly under the `reading position N — token` line, in D's 10.5px mono note style. Reservations: at > 640px two lines; at ≤ 640px FIVE lines (the 145-character case you measured wraps to four at 320px; five keeps one spare). The box is `overflow: hidden` so a longer token can never move anything below it. Record the reserved heights per band and the measured character counts of the line on the default illustrative data at position 7 and on the baked pass's last position in the company copy. The line prints only when the mode supplies the table's shares (illustrative data counts); when it cannot be computed print nothing but keep the reserved box.

Counts in both bundles: `at the start it says` 1 each; `passes a tenth after block` 1 each; `above a tenth from the start` 1 each; `only in the last row` 1 each.

## Checks

Lint (one existing warning), both builds, the counts above plus BRIEF-1's full count table re-run (every PASS must stay PASS and `standing by on` is retired — it is no longer expected), the protected-files diff-stat empty, `git status --short` last.
