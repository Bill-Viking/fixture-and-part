to: fable
kind: review
reason: the verdict on a drawn figure that ships on the public page and the company copy — a design call (the lane's opener: judgment goes to Fable, headless)
---
# REVIEW — FIG.7 THE THREE DIES (2026-11-05)

Write your verdict to `design/the-three-dies-2026-11-05/REVIEW-DIES-VERDICT.md`, last line `VERDICT — CLEAN`, `VERDICT — FIXES` (each fix one line: the mark, cut or move, why) or `VERDICT — QUESTION` (a ruling only Bill can make: one plain sentence, two or three numbered choices, your pick marked).

THE QUESTION: does FIG.7 read as the page's own drawing (the same hand as FIG.3 the ladder and FIG.10 the loop, formerly FIG.9) and does a high-schooler get the three dies and the lookup from it in one look? Name any mark to cut or move.

## Row

F&P · FIG.7 — THE THREE DIES, section 04 of the essay page; briefed by the lane on Fable 2026-11-05 (`design/the-three-dies-2026-11-05/BRIEF-DIES.md`), built by Astra headless (run 20261105-0932-astra-bef9), proved by the lane on Opus.

## Commits

Uncommitted, by design: the build sits in the worktree `/Users/bill/Projects/fixture-and-part/.claude/worktrees/company-look` (branch the-company-copy, base 49fb652) and is committed only on a clean verdict. Changed: README.md, src/App.jsx, src/company.css, src/content/essay.js, src/figures/DiesFigure.jsx (new), src/figures/LoopFigure.jsx, src/figures/figFormat.js, src/instruments/AttentionInspector.jsx, src/instruments/GlassPass.jsx, src/lib/tour.js, src/lib/toyModel.js (one comment), src/styles.css, vite.config.js.

## Gate output

Both builds pass; lint at its one standing warning; layout shift on load 0 in both copies at 1280 and 375; no console errors; the words on the figure byte-equal to the WORDS below. The builder's report ends FAIL only on a brief conflict the lane settled: dated records (STATUS, design reports) keep their old FIG numbers as history; every page source is renumbered.

## Real-case numbers

- Placement: right after the paragraph "Attention is a lookup system…", before "A new token's query is scored…".
- Badges in reading order: FIG.7 THE THREE DIES · FIG.8 THE ATTENTION INSPECTOR · FIG.9 THE GLASS PASS · FIG.10 THE LOOP; the essay's callout reads "the glass pass (FIG.9)".
- Weights printed .29 .26 .13 .11 .07 .09 .05 (The, ␣engine, ␣roared, ␣and, ␣it, ␣shut, ␣down) — identical to the attention inspector's real-model row, layer 0 head 0, query ␣down; sum 1.00.
- Smallest text 10.03 px at a 641 px window (wide, viewBox 680 × 414, drawn 559 wide); 11.2 px at 390 (stacked, viewBox 300 × 848, drawn 320 wide and 904 tall — taller than one phone screen).

## Files to read

- `design/the-three-dies-2026-11-05/stills/fig7-1280.png` — the wide layout on a 1280 px window
- `design/the-three-dies-2026-11-05/stills/fig7-390.png` — the stacked layout on a 390 px phone
- In the worktree above, read (do not run): `src/figures/DiesFigure.jsx` (the new one), `src/figures/LoopFigure.jsx` and `src/figures/LadderFigure.jsx` (the sister drawings, for the same hand)
- `design/the-three-dies-2026-11-05/BRIEF-DIES-REPORT.md` — the first 60 lines only

The words the figure was briefed to carry follow; a change to any of them is Bill's ruling, so name it as a QUESTION, not a fix.

## WORDS — every string on the figure, verbatim

- BADGE: `FIG.7 — THE THREE DIES`
- TITLE (InstrumentHead title): `One token, three dies, one lookup`
- READING (the reading line, as FIG.9 has one): `A drawing, not an instrument: nothing here runs. One token of the page’s own sentence, pressed through the three dies of one block and looked up against the words before it, with the weights one head really gave them.`
- CAPTION: `FIG.7 — A drawing, not an instrument: nothing here runs. The weights are real: layer 0, head 0, the page’s own sentence.` (the layer and head numbers formatted from the define, not typed)
- Frame 1: `one row · 768 numbers` · `q die` · `k die` · `v die` · `cols 0–767` · `cols 768–1535` · `cols 1536–2303` · `h.0 attn.c_attn · 768 × 2,304 · one wall, three dies` · `Q · what I am looking for` · `K · what I answer to` · `V · what I hand over` (the numbers from the define, `integer` formatting)
- Frame 2: `Q of ␣down, held against every spine` · the seven token strings as they are · the seven weights as `.NN` · `shares of one budget · they add to 1.00` · `␣down, after the lookup`
- `<title>` elements for hover: frame 1 `the three dies: one wall of frozen weights, h.0 attn.c_attn, cut into its query, key and value thirds`; frame 2 `the lookup: one head’s softmax weights for ␣down over the words before it, layer 0 head 0`

