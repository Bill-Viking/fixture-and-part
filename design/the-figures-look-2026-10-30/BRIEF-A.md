to: astra
kind: mechanical
complexity: complex
reason: two SVG drawings re-laid from references — a look pass per the Look-passes law; the geometry of eight viewBoxes and their CSS reserves is drawn work, not a words edit
touches:
- src/figures/LadderFigure.jsx
- src/figures/LedgerFigure.jsx
- src/figures/factDrawing.jsx
- src/figures/figFormat.js
- src/styles.css
- src/company.css
---
# BRIEF A — the figures' look pass: FIG.3 the ladder, FIG.5 the ledger; plus the docent reserve (2026-10-30)

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; nothing superfluous. Principles served: make the interface truthful · ship the whole product · prove quality before declaring completion.

Rules, the same as every brief in `design/reading-pass-2026-10-28/`: never commit, stage or push; no browser, no GUI, no network; build the public copy with `npm run build -- --configLoader native` (→ `dist`) and the company copy with `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co`; `npm run lint` stays at its one existing warning; every string that reaches the page is VERBATIM — moved, never reworded, the file's own character encoding only (the page uses `’`, `—`, `·`, `×`, `␣`); protected files untouched (`src/content/*.json`, `src/lib/*`, `scripts/*`, `src/App.jsx`, `src/instruments/*`, `src/components/*`, `src/content/essay.js`, the start `.command` files, STATUS.md, OPENER.md, everything under `design/` except your report); CLS 0 — every drawing keeps a reserved size in the stylesheet that equals its viewBox's proportion, so nothing moves after load at any band; anything unclear: stop that item, say so in the report, continue with the rest.

Report: `design/the-figures-look-2026-10-30/BRIEF-A-REPORT.md` — per part what changed (file, lines), every viewBox old → new with its CSS reserve, the text floor arithmetic per band, the string table (every moved string, where it was, where it is now, byte-equal yes/no), the byte-window cell counts, the computed fold lines, the lint line, the two build results, `git status --short` last, final line `DONE — …` or `FAIL — …`.

## What these figures are

Two static SVG drawings, each with two always-mounted layouts (`wide`, `stacked`) that CSS chooses by band (`src/styles.css` lines 465–473: `.ladder-wide{aspect-ratio:680/700}` and so on; stacked below 641 px, capped at 360 px wide). Every number in them is read at build time from `src/content/figFacts.json` (do not edit it). The paint roles never change: steel `--frozen` = frozen weights, amber `--moving` = values in flight, green `--keys` = keys. The company copy dresses the page differently (`src/company.css`) but these drawings keep their palette and geometry there (company.css line 283, "Drawings retain the original palette, fonts and geometry"); whatever you build renders in both copies from the same component — there is no company-only branch in these two files except the existing `COMPANY && <TeachPair …>` note under FIG.3, which stays.

Text floor, the page's standing law: the smallest text in the wide layout must render at 10 px or more at a 641 px window, where the figure is 559 px wide (so 12.4 units × 559/680 = 10.19 px today); the stacked layout at 390 px renders 308 px wide (10.5 × 308/300 = 10.78 px). Keep `size` 12.4 (wide) and 10.5 (stacked) unless you widen the viewBox, in which case redo the arithmetic and show it.

The look to reach — read first

Nine real screens, read by the lane on Mobbin this morning (the sandbox has no network; what to take from each is written here):

- A flow diagram of four boxed steps joined by arrows, one short line in each box, nothing else in the box (Mintlify, https://mobbin.com/screens/8f10b839-4c9e-4ad4-8343-b66a386f3372). TAKE: a panel holds its drawing and one line; the arrow between panels is the only other mark.
- Three numbered steps beside one picture: a bold one-line head, a two-line body, a small grey "get tips" line under it (GoFundMe, https://mobbin.com/screens/3684e67d-86cb-4eae-977f-f03a02ada41c). TAKE: the head is short and bold; the detail is quieter and under it, never in the head.
- Import steps: a small picture at left, three short lines at right, per step (Fabric, https://mobbin.com/screens/c9782d99-60a3-4c17-984e-eacf4aefbac6). TAKE: the drawing leads, the words follow it at a smaller size.
- A migrations table: a row number column, a name column, a hash column in mono, a timestamp column; a line "Page 1 with up to 100 rows" and Previous / Next under the header (Cofounder, https://mobbin.com/screens/7ec3e7aa-dda3-4bbd-9573-44c0b5900669). TAKE: mono numbers align in columns with an even row pitch; the count of what is not shown is one quiet line.
- A deploy history list whose header row ends in a small right-aligned "Hide skipped" control, with chevrons that fold a row open (Railway, https://mobbin.com/screens/411620e7-9ff6-4062-934b-9d0d31784174). TAKE: the fold control lives at the right end of the head row, small, and says what it will do.
- A members table where a chevron on a row opens sub-rows under it; folded rows keep one line each (Toggl Track, https://mobbin.com/screens/513a1b9f-1489-4073-8970-fd8396dec0f8). TAKE: folded is the default; open costs one click.
- A pixel portrait: a grid of cells filling its panel's full width on a dark ground, a thin grid line, every cell readable as a cell (Variant, https://mobbin.com/screens/d3e99e7b-83de-4e76-8b61-6db441ff4ce1). TAKE: the byte window at the panel's width, cells as cells.
- A working canvas on a visible fine grid; the grid is quiet, the subject reads (Magnific, https://mobbin.com/screens/a85107f6-556f-41ec-ad02-f8abfddde48e). TAKE: the window's ground stays quiet (`--screen`), the hero row stays the one amber mark on it.
- A dataset table with inputs, reference outputs and outputs in three columns, each cell's long text folded under a chevron with the first line visible (LangChain, https://mobbin.com/screens/f0da0c26-1534-4525-938f-bb0a4dc105bb). TAKE: a long cell shows its first line; the rest is one click away.

And the page's own F (instrument F's walls, `src/instruments/ForwardMap.jsx`): the byte textures there fill their slabs; that is the look the two 24 × 64 windows are to match.

## Part 1 — FIG.3 THE LADDER (`src/figures/LadderFigure.jsx`): the four fixes

1a — short names in the panel labels. `PANELS[1].label` becomes `the table · wte` and `PANELS[4].label` becomes `one wall is one tensor · h.0 attn.c_attn`. Derive the short form from the facts, never hard-code: `wte` from `transformer.wte.weight_quantized` and `h.0 attn.c_attn` from `transformer.h.0.attn.c_attn.weight_quantized` (strip the leading `transformer.`, drop the trailing `.weight_quantized`, and replace the dot after the block index with a space — write a small pure helper in `figFormat.js` and show its two outputs in the report). The two full names stay on the page: (i) as a `<title>` element inside each of those two panel `<g data-panel=…>` groups (hover and screen readers), and (ii) in the caption list of 1c below.

1b — the two byte windows at the panel's width. In `PanelDrawing`: the table panel's `ByteWindow` takes `width = panelW − 20` (104 wide, 260 stacked) at `x = 10`; the leader `ff-guide` from the table strip's hero mark re-aims to the window's hero row; the `24 × 64` size line stays under it. The tensor panel's inset `ByteWindow` takes `winW = panelW − 20` too; the tiny true-scale `<use>` corner on the slab, the `ff-window-mark` and the leader stay, recomputed from the new inset width (the `scale` expression already derives from `winW`). Cells stay rectangles painted by `color-mix` as today; `ff-byte-ground` under them; the hero row `ff-hero-row` on the wte window. Cell counts stay 1,536 per window (prove in the report by counting `rect` with a parent `data-byte-window` in the built markup, or by the component's own arithmetic). Lay each panel out again so the window has its room: the five panels may take different heights; the arrows between them meet at one shared height (today y = 350 in wide), which you set.

1c — one line per panel; the long lines move to the caption. Each panel keeps its drawing and ONE short line in `ff-note`. These are the lines each panel keeps, verbatim as the code already composes them (the piece panel keeps its whole note; the other four keep their first clause):
   - piece: `id ${hero.id} · piece ${integer(hero.id + 1)} of ${integer(wte.rows)} in the word table` (whole; it may wrap to two lines in wide — allowed, say so)
   - table: `${integer(wte.rows)} rows × ${integer(wte.cols)} numbers`
   - vector: `${integer(wte.cols)} numbers; these are the first six`
   - stream: `its first stop: wte + wpe, ${start} long`
   - tensor: `${integer(wall.rows)} rows × ${integer(wall.cols)} columns`
   The rest of each note (everything after that clause) moves out of the panel into TWO places: (i) the panel's `<title>` (the whole original note, verbatim — one `<title>` per panel; for the two tensor panels the title is the full tensor name, then ` · `, then the note); (ii) a list under the figure's caption, inside the existing `<figcaption>` after Bill's sentence, which stays byte-identical: a `<dl class="ff-detail">` (or a `<ul>`, your choice, one rule) with one entry per panel — the panel's label as the term, the original full note as the description, and for the two tensor panels the full tensor name first. Every original note string must appear in the built page byte-equal, once in the caption list and once in a `<title>` (the report's string table proves it). Nothing is reworded; nothing is dropped.
   Style the caption list in `src/styles.css` next to `.fact-company-note` (line 494): mono, 12px/18px, `--muted`, the term in `--ink`, hanging so the lines read as a list; the company copy inherits it (check `company.css` line 285's rule leaves it alone; if a company rule recolours `figcaption` text, keep the list legible under it — say which in the report).

1d — the wide layout, re-laid. With the notes gone the panels are mostly drawing: set each panel's height to what its drawing needs (the piece panel is short; the table and tensor panels are tall because of their windows), align the five tops, and let the figure's viewBox height drop. Update `.ladder-wide{aspect-ratio:…}` and `.ladder-stacked{aspect-ratio:…}` to the new viewBoxes exactly. The stacked layout keeps one panel per row with the same one-line rule (the stacked arrows run down the middle as today).

## Part 2 — FIG.5 THE LEDGER (`src/figures/LedgerFigure.jsx`): three rows, the rest on a click, room for the brain

2a — two states. The figure gets a `rows` state: `'3'` (default) and `'all'`. Four drawings are always mounted — `wide-3`, `wide-all`, `stacked-3`, `stacked-all` — and CSS alone shows one, by a `data-rows` attribute on the `<figure>` plus the band, with an `aspect-ratio` reserve per drawing (`.ledger-wide-3`, `.ledger-wide-all`, `.ledger-stacked-3`, `.ledger-stacked-all`), so a reload in either state paints at its final size with no shift. The `all` drawings are today's drawings re-laid under 2c and 2d; the `3` drawings are the fold.

2b — the control. One HTML button, class `mr-chip` (the page's existing small chip; `src/styles.css` line 865; the company copy already dresses `.mr-chip`), placed at the right end of the figure's head row — inside `InstrumentHead`'s row is off limits (that component is protected), so put it in a small `div.ff-toolrow` between the head and `.inst-body`, right-aligned, 24 px tall, reserved at every band so toggling moves nothing above or beside it. Text: `SHOW ALL ROWS` in the `3` state, `SHOW 3 ROWS` in the `all` state; `aria-pressed` true in the `all` state; `type="button"`. Reserve the chip's width for the longer text (measure: the longer is `SHOW ALL ROWS`, 13 characters at the chip's 9.5 px mono tracking — compute and set a `min-width`). The click changes the figure's height (two different reserves) — that is a user-initiated shift and allowed; nothing else may move on that click.

2c — the fold, both panels. In the `3` drawings:
   - the rack (`Rack`): rows 1–3 (`The`, `␣engine`, `␣roared`) drawn exactly as today, then ONE fold line in `ff-note` at the next row position, then row 8 (`.`) arriving as today with its `ff-arrival` box; the `reads` arrows go to rows 1–3 and ONE arrow to the fold line (four arrows instead of seven; `data-reads-row` 0, 1, 2 and `data-reads-fold="3-6"`). The fold line is computed, never typed: `and ${hidden} more, stamped the same way` where `hidden = last − 3` (4 today). The rack note below stays (`PANELS[0].notes[0]`, verbatim).
   - the comparison (`Comparison`): rows 1–3 before/after as today, then ONE fold line at the next row position, computed: when every hidden row has `rack.moved.k[i] < 1e-4 && rack.moved.v[i] < 1e-4` → `and ${hidden} more, all the same`; otherwise → `and ${hidden} more — the largest move ${max.toFixed(4)}` with `max` over the hidden rows. Today's data gives `and 4 more, all the same` — the number is 4, not the five a note once guessed; the arithmetic is the authority. The two notes below stay verbatim.
   - the brain (`Brain`) is the same in both states.

2d — room for the brain's move. In the wide layouts the three panels keep their order (rack · comparison · brain) but the brain panel widens: aim for rack ≈ 200, comparison ≈ 280, brain ≈ 170 units (you set the exact numbers; total 680 with the 10-unit gutters). Redraw the brain schematic to use that width: the sheets wider, the two arrows (check out, write back) with room to read, its two notes under it unwrapped as far as the width allows. Apply the one-line rule here too: each ledger panel keeps ONE line in the drawing (rack: its single note; comparison: its first note `in a deployment these rows are stored once and reused: byte for byte the same`; brain: its first note), and the remaining notes (comparison's second, brain's second) move to the caption list and the panel `<title>`, exactly as in 1c (same `ff-detail` list under FIG.5's caption, Bill's caption sentence byte-identical first).

2e — the stacked layouts follow the same two states; the `stacked-3` is short, `stacked-all` is today's re-laid; all four reserves set.

2f — the `aria-label` of each `<svg>` stays `${TITLE}: ${labels}`; add ` — 3 of N rows` on the `3` drawings so a screen reader knows the fold.

## Part 3 — the docent reserve, F's tour box (`src/styles.css`), both copies

Settled arithmetic, no design: `.mr-docent` is `box-sizing: border-box` (line 79) with 7 + 6 px padding and 1 + 1 px borders; its content is `.mr-tourrow` (24 px + 4 px margin) over `.mr-caption` (64 / 80 / 96 px by band). So the box needs 24 + 4 + 64 + 13 + 2 = 107 px at ≥ 1200, 123 at ≤ 1199, 139 at ≤ 799; today it reserves 98 / 114 / 130, nine short at every band, and the caption's last line clips. Set `.mr-docent{height:107px}` (line ~962), `114px → 123px` (line ~1005), `130px → 139px` (line ~1009). The phone band (line ~2392, `145px`, tourrow 44 + 2, caption 80) needs 141 and keeps its 145 — leave it. Update the stylesheet's own comment above `.mr-docent` where it states the arithmetic, if it does. No other line changes.

## Done

Both builds succeed; lint at one warning; the report's string table shows every moved string byte-equal; the fold lines compute to `and 4 more, stamped the same way` and `and 4 more, all the same` on today's facts; every new viewBox has its matching `aspect-ratio`; `git status --short` lists only the touched files and your report. Final line `DONE — …` (or `FAIL — …` with the part that stopped).
