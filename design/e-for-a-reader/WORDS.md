# WORDS — E for a reader (instrument E: what follows what, and the pick on the curve)

PROPOSED 2026-10-24 by the F&P lane on the Mac (Fable) for Bill's go or strike. Every string the build puts on the page, verbatim; Bill approves these and the builder copies them character for character. A value in ⟨angle brackets⟩ is filled from real data at run time; the example beside it is a real value.

The two findings this answers (Bill, 2026-10-22, reading the live page): "confusing layout, where is the 'different tensor on the bar above it'" — four panels follow one chosen tensor and nothing on the surface says so; and "the bell curve doesn't update when I click on panes" / "there's numerous tiles with the same value… is this how it works" — the curve is the whole tensor by design and ignores the picked square.

The facts the words rest on:
- Instrument E has four panels under one choice: the list (every tensor; each row a button), the bar (the file to scale; each piece wide enough a button), the window (one tensor's bytes; the eyebrow over it names the tensor: `the word table (transformer.wte) · words 0–63 of 50,257 · …`, or `block 2 · h.2.mlp.c_fc · rows … · slots …`), and the curve (every value of that tensor; for the byte tensors one bin per possible byte — 256 bins — so a bin's share is exact; for the f32 vectors 64 bins).
- The picked square's numbers are already on the page in the window's readout (`row 18 · slot 38 · stored as the byte 14 · means +0.2136`); the curve's histogram holds the count of every byte; the window's own data holds every square shown. No new read.

## 1. The head — the purpose sentence says the chain
`The model file itself — every tensor it holds. Choose one, in the list or on the bar, and the window shows its raw bytes, the curve the spread of all its values.`
(replaces: "The model file itself — every tensor it holds, one window of its raw bytes, and the spread of one tensor’s values.")

## 2. The bar's label names the bar
`the bar — the whole file, drawn to scale`
(replaces the field label "the file, drawn to scale"; the invite line under the bar, "click a piece of the bar to choose that tensor", stays as it is)

## 3. The curve gets an eyebrow that names whose values these are
A new one-line eyebrow between the curve's label row and the curve, in the window eyebrow's own face and size (`.file-eyebrow`), one reserved line at every width:
`every value of ⟨the word table (transformer.wte)⟩ — the whole tensor, not only the window`
- ⟨…⟩ is the tensor exactly as the window's eyebrow names it: `the word table (transformer.wte)` · `the position table (transformer.wpe)` · `block 2 · h.2.mlp.c_fc` · an f32 vector's full name
- before the file's facts have loaded: `—`
- the label row above it stays "the bell curve — every value"

## 4. The pick on the curve
- An amber mark on the curve at the picked square's value: a bar one bin wide, the curve's full height, in the amber of values in flight (`--moving`); the blue zero mark stays. No pick, no mark.
- Under the curve's stat line (`n = … · μ … · σ … · …% within ±0.1`), a new reserved line in the stat line's face; amber ink (`--moving-ink`) while a pick is on, the muted ink when idle:
  - idle: `click a square in the window and its value is marked here, on the curve`
  - a square picked in a byte tensor: `the picked square: ⟨+0.2136⟩ · byte ⟨14⟩ · ⟨3.1⟩% of every value in this tensor is this byte · ⟨7⟩ of the ⟨4,096⟩ squares in this window hold it`
  - a square picked in an f32 vector: `the picked square: ⟨+0.0755⟩ · in a bin that holds ⟨2.4⟩% of every value in this tensor · ⟨1⟩ of the ⟨768⟩ squares in this window hold this number`
  - the value as the readout prints it (signed, four significant figures); the share to one decimal, or `under 0.1%` below that; the counts with thousands separators
- The mark and the line follow the same pick the window's readout follows (a click, or the arrow keys inside the window); Escape, or a pick outside the window, clears both. Switching tensors clears the pick as it does today.

## 5. Unchanged
The list and its label, the window and its eyebrow and readout, the bar's pieces and readout and key, the stat line's own words, every explainer, every other word of instrument E.
