# WORDS — the window for a novice (instrument E, section 01)

Every string the build puts on the page, verbatim. Bill approves these; the builder copies them character for character. A value in ⟨angle brackets⟩ is filled from real data at run time; the example beside it is the real value for the shipped window. Facts below were read from the file itself on 2026-09-23 (sha256 1d3ab4d7…8431, the same file the page ships facts about).

The facts the words rest on (word table `transformer.wte.weight_quantized`, 50,257 rows × 768 columns, u8, zero point 128, multiplier 0.012588760815560818):
- rows 0–23 are the pieces `! " # $ % & ' ( ) * + , - . / 0 1 2 3 4 5 6 7 8` (the vocabulary begins with the printable single bytes).
- per-column mean over all 50,257 rows: median |mean| 0.0218; mean of the 768 means 0.00016, spread (sd) 0.0730. Eight columns lie more than 4 sd from the mean of means; two of them are inside the window's columns 0–63: **slot 36** (mean −0.3161, sd 0.0039 — a typical column's sd is 0.124, so this one holds nearly the same number for every word) and **slot 6** (mean −0.3013, sd 0.0703). Next in the window is slot 55 at 3.2 sd — not marked.
- the table's largest value either sign is 1.5988 (its min −1.2337), so the key's last tick reads 1.6.

## 1. The eyebrow — the line above the window
- word table: `the word table (transformer.wte) · words ⟨0⟩–⟨23⟩ of 50,257 · slots 0–63 of 768 · one byte per number`
- position table: `the position table (transformer.wpe) · positions ⟨0⟩–⟨23⟩ of 1,024 · slots 0–63 of 768 · one byte per number`
- any other quantized matrix: `⟨block 0⟩ · ⟨h.0.attn.c_attn⟩ · rows ⟨0⟩–⟨23⟩ of ⟨768⟩ · slots 0–63 of ⟨2,304⟩ · one byte per number` (the group label is `groupOf()`'s, the short name is the tensor name minus `transformer.` and `.weight_quantized`)
- an f32 vector: unchanged — `⟨transformer.h.0.ln_1.weight⟩ · values ⟨0⟩–⟨63⟩ of ⟨768⟩ · wrapped at ⟨64⟩ · f32`

## 2. The row labels — left of each row, painted inside the window
- word table: the piece itself, as instrument B prints it (a leading space shown as `␣`); a piece longer than 6 characters is cut to its first 5 and `…`.
- position table: `p⟨0⟩` … `p⟨23⟩`
- any other matrix: the row number.
- an f32 vector: no row labels (the wrap is the panel's choice, not the file's — the eyebrow already says so).

## 3. The slot labels — above the window
- `0  8  16  24  32  40  48  56`, each over its column, in the eyebrow's colour; plus every standout slot's own number over its column — `6` and `36` for the word table — in the pick colour with a `▲` under it. No standout labels for any other tensor.

## 4. The key — under the window
- a strip painted by the same ramp function that paints the cells, ticks under it at `0 · 0.05 · 0.2 · 0.5 · ⟨1.6⟩` (the last is that tensor's largest value either sign, from its histogram), then the sentence: `shade = size of the number, either sign · dark is near zero`
- at 640 and under: the strip and the ticks `0` and `⟨1.6⟩` only.

## 5. The readout — under the key (two lines at 1280, three at 390)
- nothing picked, word table — line 1: `click a square, or use the arrow keys inside the window, to read one number` — line 2: `two slots stand out: 36 holds nearly the same number for every word · 6 runs low for nearly all of them`
- nothing picked, any other tensor — line 1 as above; line 2 empty.
- picked, word table — line 1: `the word "⟨2⟩" · slot ⟨44⟩ · stored as the byte ⟨141⟩ · means ⟨+0.16⟩` — line 2, quieter: `row ⟨17⟩ · col ⟨44⟩ · u8 ⟨141⟩ · (⟨141⟩ − 128) × 0.012589 = ⟨+0.1637⟩` (today's line, verbatim, without the token suffix)
- picked in a standout slot, word table — line 1 ends ` · nearly the same for every word` (slot 36) or ` · runs low for nearly every word` (slot 6). The rule that says which words: a standout column whose sd is under a twentieth of the median column sd "holds nearly the same number for every word"; otherwise "runs high" when its mean is positive, "runs low" when negative.
- picked, position table — line 1: `position ⟨5⟩ · slot ⟨44⟩ · stored as the byte ⟨141⟩ · means ⟨+0.16⟩`
- picked, any other matrix — line 1: `row ⟨12⟩ · slot ⟨44⟩ · stored as the byte ⟨213⟩ · means ⟨+1.07⟩`
- picked, f32 vector — unchanged: `index ⟨12⟩ · ⟨0.0312…⟩`
- a word piece longer than 24 characters is cut to its first 23 and `…` in the readout; the row label rule (5 + `…`) is separate.

## 6. The window's own "?" explainer (InfoTag `fileBlob` in `src/content/explainers.js`; the lane commits this, not the builder)
- title: `what the window shows`
- body: `each square is one byte of the file — one number of the table. in the word table a row is one word, its piece of text written at the left, and a column is one of the 768 slots every word has; the window shows 24 words and their first 64 slots. pick a square and the line under the window does the arithmetic: the byte, minus that table's zero point, times its multiplier, and the number that falls out is what the model multiplies with. a square is shaded by how large that number is, not by whether it is positive, and the key under the window is painted by the same rule. two slots are marked because they stand out across the whole table: slot 36 holds nearly the same number for every word, and slot 6 runs low for nearly all of them — nobody wrote them in by hand; they are what training left in the table. the small grids are stored as full decimals instead, so there each square is one of those and the line is simply the number. the lowest rows of the word table are the single raw bytes, and print as the character each one stands for. that same table is used backwards at the end of a pass to turn the answer into words, so the model does not store a second copy of it.`

## 7. The window's accessible name (the canvas `aria-label`)
- `the bytes — ⟨the eyebrow sentence⟩ — arrow keys move the reading` (as today, with the new eyebrow inside it)
