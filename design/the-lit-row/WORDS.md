# WORDS — the lit row (instrument E, section 01), with the raw-byte spellings folded in

PROPOSED 2026-10-20 by the F&P lane on the Mac for Bill's go. Every string the build puts on the page, verbatim. Bill approves these; the builder copies them character for character. A value in ⟨angle brackets⟩ is filled from real data at run time; the example beside it is the real value, read from the file on 2026-10-20 (model sha256 1d3ab4d7…8431, tokenizer sha256 cda20b8c…7c66 — the same two files the page ships facts about). Sections 1–3 are the draft of 2026-09-23 (Mac session 4382560f…), word for word where it had words; 4–6 are the spellings ruling folded in; 7 is the draft's thread through the essay.

The facts the words rest on:
- the page's own sentence is `The engine roared and it shut down.`; its fifth token is ` it`, which is row 340 of the word table (the vocabulary spells it `Ġit`; the page prints it `␣it`). Section 04's inspector opens on that token, and section 04's prose says it comes to mean the engine.
- the window is 24 rows, so the page that holds row 340 is rows 336–359 — window 15 of 2,095. Its 24 pieces, in order: `␣st ␣M 's ␣he ␣it ation ith ir ce ␣you il ␣B ␣wh ol ␣P ␣with ␣1 ter ch ␣as ␣we ␣( nd ill` — none longer than six characters, so no label is cut.
- rows 0–255 of the word table are the 256 single raw bytes. 97 of them print as instrument B prints them: rows 0–93 are `!` through `~`, row 220 is the space (`␣`), rows 197 and 198 are tab and newline (`⇥`, `⏎`). The other 159 are bytes with no character of their own — rows 94–187 and 222–255 decode to the replacement glyph `�`; rows 188–219 (less 197 and 198) and 221 are control bytes that print as nothing — and the vocabulary spells each of them with one letter of its own: `¡` … `ÿ` for rows 94–187, `Ā` … `ġ` for 188–221, `Ģ` … `Ń` for 222–255 (rows 240–255 are `Ĵ ĵ Ķ ķ ĸ Ĺ ĺ Ļ ļ Ľ ľ Ŀ ŀ Ł ł Ń`). Some longer pieces are halves of a multi-byte character and decode to `�` as well; the same rule covers them.
- real bytes for the examples: row 340 slot 44 is the byte 123 (−0.0629); row 340 slot 36 is 103 (−0.3147, the standout slot); row 240 slot 44 is 108 (−0.2518).

## 1. The sign — a new line above the window, in plain type (the body face), above the eyebrow
- word table only: `every word the model knows is a row of numbers like these · the lit row is "it", the word this page follows`
- any other tensor: the line is empty and keeps its height (nothing below it moves).

## 2. The window opens on the page that holds "it"
- the eyebrow, as the shipped line now reads: `the word table (transformer.wte) · words 336–359 of 50,257 · slots 0–63 of 768 · one byte per number`
- the pager: `window 15 of 2,095` — and before the model loads, `window 15 of 2,095 — load the model to move it`, both paging buttons disabled (today only the forward one is).
- every other tensor still opens on its first rows; `← ROWS` from page 15 of the word table walks back to page 1 once the model is loaded, as the forward button walks on.

## 3. The lit row — row 340, wherever it is on screen
- its label: `▶ ␣it` in the pick colour, lit at all times (the standout slots' `▲` marks a column the same way; `▶` marks the row). Hover and pick still brighten the other labels as today.
- picked, line 1 of the readout: `the word "␣it" · the lit row · slot ⟨44⟩ · stored as the byte ⟨123⟩ · means ⟨−0.06⟩`; with a standout slot it ends as today, e.g. slot 36: `the word "␣it" · the lit row · slot 36 · stored as the byte 103 · means −0.31 · nearly the same for every word`. Line 2 unchanged: `row 340 · col 44 · u8 123 · (123 − 128) × 0.012589 = −0.0629`.
- the lit row is the page's own and never moves: a reader who types another sentence still sees row 340 lit, because the essay's words (sections 02–04) still follow "it".

## 4. The row labels for the raw bytes — the rule (the spellings ruling)
- a word-table row prints as instrument B prints it, EXCEPT where that print holds the replacement glyph `�` or a control character: there the label prints the vocabulary's own spelling of the piece, read from the loaded tokenizer's vocabulary (never a table typed in). Applied to rows 0–255 this changes exactly 159 rows and leaves 97 as they are. Examples, the model loaded: rows 94–100 read `¡ ¢ £ ¤ ¥ ¦ §`; rows 188–200 read `Ā ā Ă ă Ą ą Ć ć Ĉ ⇥ ⏎ ċ Č`; rows 240–255 read `Ĵ ĵ Ķ ķ ĸ Ĺ ĺ Ļ ļ Ľ ľ Ŀ ŀ Ł ł Ń`.
- the six-character cut (5 + `…`) and the `␣` for a leading space stay as they are.

## 5. The readout for such a row
- line 1: `the raw byte "⟨Ĵ⟩" · slot ⟨44⟩ · stored as the byte ⟨108⟩ · means ⟨−0.25⟩` when the piece is one byte (rows 0–255 that the rule touches); `the raw bytes "⟨âĢ⟩" · …` when it is longer. Rows the rule leaves alone keep `the word "…"` as today.
- line 2 unchanged.

## 6. The window's own "?" explainer (InfoTag `fileBlob` in `src/content/explainers.js`; the lane commits this, not the builder) — two edits to the approved text, the rest verbatim
- after `… the window shows 24 words and their first 64 slots.` insert: `the lit row is "it", the word the rest of the page follows.`
- replace `the lowest rows of the word table are the single raw bytes, and print as the character each one stands for.` with: `the first 256 rows of the word table are the single raw bytes: one that is a character on its own prints as that character, and one that is not prints the letter the vocabulary spells it with.`

## 7. The thread through the essay — three sentences, one each, the draft's (the lane commits these in `src/content/essay.js`, not the builder). Lane's recommendation: keep — without them the lit row is a highlight; with them it is the one word the page follows.
- section 02, after the paragraph that ends `… picking up meaning as it goes.` (the one before the sentence box): `Take "it" from the sentence below. Its starting vector is the lit row from section 01, and this page follows that one word from here.`
- section 03, before the stepper: `On the rack below, "it" is the fifth entry staged, and the entries above it are all it can read.`
- section 04, before the inspector: `The inspector below opens on "it": the row from section 01, now reading the words before it.`

## 8. Unchanged
- the eyebrow's shape for every tensor, the slot labels and the two standout marks, the key, the idle readout and its standout sentence, the accessible name (`the bytes — ⟨the eyebrow sentence⟩ — arrow keys move the reading`), and every other string on the instrument.
