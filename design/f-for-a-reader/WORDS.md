# WORDS — F for a reader (instrument F: the card bug, the click, the curves, the streams, the stations, the wall-cell card)

PROPOSED 2026-10-22 by the F&P lane on the Mac for Bill's go or strike, on his pick ("Do the F build first"). Every string verbatim; the builder copies character for character. Six changes from his reading of the live page on 2026-10-22, each with his words in STATUS ## To do. Two are behaviour with no words (1, 2); four are words (3–6).

## 1. One card at a time (the ! bug — no words)
Today the drawing keeps two cards: the one a click pins and the one that follows the pointer over a wall, and the pointer's card steps aside only on the exact pinned cell, so neighbouring cells overlap. Rule: while the pointer's card is painted the pinned card is hidden; when the pointer leaves the walls the pinned card returns; a click on another cell re-pins there; Escape clears both. The cards' words do not change (except §6).

## 2. The click rides the run (ruled by Bill — no words)
A click anywhere on the sheet during the tour does not pause it. The card the click opens stays until the next stop replaces it or Escape puts it away. The tour's own buttons (PLAY/PAUSE/RESUME, the arrows, the speed) are unchanged. Two sentences on the page say a click pauses the tour, in the tour's own rule line under the controls (`tourLine`, ForwardMap ~2497–2505); they change, the rest of each line verbatim:
- compact: `Step moves one stop; a click anywhere pauses the tour and is then honoured.` → `Step moves one stop; a click anywhere is honoured and the tour keeps going.`
- full: `The steps move a stop either way, and clicking anything on the sheet pauses the tour and then honours the click.` → `The steps move a stop either way, and clicking anything on the sheet is honoured while the tour keeps going.`
- the code comment at ForwardMap ~1819 is the builder's to rewrite.

## 3. The head's purpose sentence (InstrumentHead `purpose`, ForwardMap ~2592) — two clauses added, the rest verbatim
As it stands:
> The walls are the fixture: the file's own frozen tooling, one station for each of the six blocks. Your sentence is the part — one stream for each word, falling through the stations. A transfer is the tooling touching the part: attention picks a source in green and carries its value in amber. The hero is the piece finished at the last station, rich enough to say what comes next.

As proposed:
> The walls are the fixture: the file's own frozen tooling, one station for each of the six blocks. Your sentence is the part — one stream for each word, falling through the stations; every word passes through every station in order, and a stream never leaves its column. A transfer is the tooling touching the part — the solid curves, the only thing that crosses: attention picks a source in green and carries its value in amber. The hero is the piece finished at the last station, rich enough to say what comes next.

## 4. The stations label — on the drawing, along the left edge of the stack of walls
- `SIX STATIONS, TOP TO BOTTOM — EVERY WORD PASSES THROUGH ALL SIX` in the drawing's small mono caps, read top to bottom beside the BLOCK labels (rotated, or stacked in short lines where a rotated label would fail the type floor), in the walls' label colour; at ≤ 640 the same words as one horizontal line above BLOCK 0.

## 5. The curves legend — one line under the drawing, in the mono caps of the landing legend, above it
- `SOLID CURVE — ONE HEAD CARRYING A SOURCE WORD’S VALUE INTO THE HERO · WIDTH = ITS SHARE OF ATTENTION · AT MOST TWO PER BLOCK, UNDER 0.15 NOT DRAWN · STRAIGHT STREAM — ONE WORD’S OWN NUMBERS, NEVER LEAVING ITS COLUMN`
- at ≤ 640 the same words on two lines (the curve, then the stream).
- the `0.15` is `TRANSFER_FLOOR` printed, never typed, so a changed floor changes the legend.

## 6. The wall-cell card in instrument E's grammar (`wallLead` in src/lib/tour.js ~194; the card prints the lead, the readout row prints lead + detail)
As it stands (one dense sentence):
> Wall cell — [18, 38] of h.4.attn.c_attn.weight [768×2304], quantised value 14. The file holds this tensor as i8 at zero point 0, so the weight is scale · (q − zp) = 0.0153 · (14 − 0) = 0.2136. Column 38 of 2304 falls in the query projection.

As proposed — the lead:
> one weight of block ⟨4⟩’s attention grid · row ⟨18⟩, column ⟨38⟩ of 768 × 2,304 · stored as the byte ⟨14⟩ · means ⟨0.2136⟩ · in the ⟨query⟩ third
- for a negative weight the byte and the value differ, and the lead says both: `· stored as the byte ⟨236⟩, the value ⟨−20⟩ · means ⟨−0.3052⟩ (the file's own value; the lane's hand arithmetic said −0.3060) ·` (the byte on disk and the number it stands for are two things, and the legend above says so)

The detail (the readout row only):
> the file keeps it as one signed byte at zero point ⟨0⟩: ⟨0.0153⟩ × ⟨14⟩ = ⟨0.2136⟩ · this grid is h.⟨4⟩.attn.c_attn.weight · columns 0–767 are the query, 768–1535 the key, 1536–2303 the value
- numbers with thousands separators; the scale to three significant figures and the weight to four, as today.

## 7. Unchanged
- every other string on the instrument: the tour's stops, the carrier lead and detail, the landing legend, the rows under the drawing (THE FIXTURE · THE WALLS, THE PART · THE FALL, THE TOOLING · TOUCHES THE PART · THE TRANSFERS), the "?" explainer; the page's counts.
