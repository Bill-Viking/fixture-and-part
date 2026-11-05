# REVIEW — FIG.7 THE THREE DIES · verdict (2026-11-05, Fable, review run on the lane's page)

CHANGES REQUIRED — one mark to move, nothing to cut from the words, no ruling for Bill.

## The two questions

**Same hand as FIG.3 and FIG.10: yes.** `DiesFigure.jsx` is built from the ladder's own primitives (`ff-frame`, `ff-frozen`, `ff-moving`, `ff-guide`, `ff-label`, `ff-value`, `ff-token`, `Arrow`/`Arrowhead`, `Text`, a `<title>` on each group, `data-*` hooks) and the loop's own measures (viewBox widths 680 and 300; type 13.4/12.2/17 wide and 12/10.5/15 stacked, `DiesFigure.jsx:27-28` against `LoopFigure.jsx:75,99`); two always-mounted layouts with fixed viewBoxes, a reading line, a `FIG.N —` caption. In both stills the mono type, the thin frame, the steel grid slabs, the amber strips and the green bars sit in the same register as the ladder and the loop. The one departure is that the flow arrows carry a tone (amber for the row, Q, V and the pours; green for K) where the loop's arrows are all ink. That follows the page's palette legend (amber = values in flight, green = keys) rather than breaking it, so it reads as the page's own.

**A high-schooler gets it in one look: yes, both frames.** Frame 1 reads top to bottom as token → "one row · 768 numbers" → three slabs → three bars with a plain-words gloss each. Frame 2 reads as a shelf of seven books, one spine per earlier word, seven numbers under them, seven bars on one baseline, and seven pours into the box named "␣down, after the lookup". The words "they add to 1.00" and the printed .29 .26 .13 .11 .07 .09 .05 (sum 1.00) carry the budget idea without the reader needing the essay. The colour code links the frames: the book's green spine is K, the amber hatched body is V, the amber bar above the shelf is Q.

## Findings

1. **`src/figures/DiesFigure.jsx:87-96` — the seven pours vanish behind the budget note.** Each pour starts at the bar's baseline (y 257) and the paper ground `dies-note-ground` (y 268–293) is painted over it, so in both stills the arrows show as a 9 px tick under each bar, then a gap, then an arrow that appears to leave the note's underside rather than the bar. The ticks read as axis ticks. Move: put "shares of one budget · they add to 1.00" between the weights row (y 239) and the share bars, shift the bars and their baseline down by about 25 units, and cut the paper ground. The pours then run unbroken from each bar into the landing, and the note still names the numbers it sits under. No word changes.

2. **`src/figures/DiesFigure.jsx:19,48,53` — uneven wraps of the column ranges and part labels (note, not a fix).** Wide: "cols 0–767" sits on one line while the other two ranges break after "cols", and "Q · what I am looking for" breaks into four lines ("Q · what / I am / looking / for"). Stacked: only "cols 1536–2303" breaks. Legible at both bands, and the shared `Text` primitive decides the breaks from a measure I could not read, so I name it without prescribing a width.

3. **`src/figures/DiesFigure.jsx:97-99` — the landing box is a pale tint, the input strip solid amber (note, no change).** The two "␣down" marks do not look like the same object, but a solid amber landing would swallow the amber arrowheads that end on it. The pale ground is the right choice; left as is.

Everything else checked clean against the page's WORDS: BADGE, TITLE, READING, CAPTION (layer and head from the define through `integer`), the eleven frame-1 strings (768 and 2,304 from `dims`, never typed; ranges computed as thirds, `DiesFigure.jsx:9-11,19,23`), the frame-2 strings, both `<title>` texts (`DiesFigure.jsx:24-25`). Weights print as `.NN` with the leading zero stripped (`DiesFigure.jsx:21`); seven books from `tokens.slice(0, position + 1)` (`DiesFigure.jsx:20`), so the row includes its own position. Marker and pattern ids are unique per layout (`dies-wide-*`, `dies-stacked-*`). Text floor arithmetic holds: 12.2 × 559/680 = 10.03 px wide; 10.5 × 320/300 = 11.2 px stacked. Pour stroke is `max(0.6, weight × 6)` as briefed. Geometry fits its frames: lookup right edge 680 in wide, landing bottom 826 of 848 in stacked.

## Not verified, and why

- The stylesheet (`src/styles.css`, `src/company.css`): the `.dies-wide`/`.dies-stacked` aspect reserves, the 640 px switch, the hidden copy leaving the accessibility tree, and the colours behind `dies-*` classes. Not in the files the page authorises; judged from the stills only.
- The stacked drawing is 320 px wide at 390 while the brief's loop contract says 308; if FIG.10 still renders 308 at 390, the two frames do not align on a phone by 12 px. Needs the stylesheet to confirm; not a finding.
- `factDrawing.jsx` (`Text` wrap measure, `Arrow` marker binding) and `figFormat.js` (`integer`): not authorised; read through their use only.
- Placement in `essay.js`, the `figures` map in `App.jsx`, the define in `vite.config.js`, the README rows and the full renumber sweep: not authorised; the report's renumber table (lines 6–27) is complete for the files it lists, and the lane's gate output stands for the badge order and the callout text.
- Equality of the seven printed weights with the attention inspector's row, and byte equality of WORDS in the built markup: the lane's gate; I checked the source strings against WORDS by eye.
- No browser proof was run here; the two stills are the only rendering seen.

VERDICT — FIXES
- `DiesFigure.jsx:87-96`: move the budget note above the share bars and cut `dies-note-ground`, so the seven pours run unbroken from bar to landing instead of disappearing behind the note.

DONE REVIEW — FIG.7 THE — same hand, one-look yes; VERDICT — FIXES: move the budget note above the share bars so the pours run unbroken
