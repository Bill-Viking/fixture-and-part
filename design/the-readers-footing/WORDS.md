# WORDS — the reader's footing: the glossary strip, the moth gloss, and SPECIMEN — THE HARNESS

PROPOSED 2026-10-22 by the F&P lane on the Mac for Bill's go or strike, on his "let's go" (06:1x). Every string verbatim; the builder copies character for character, encoding quotes and dashes as `src/content/essay.js` does. Numbers in the readout are READ AT BUILD TIME from this repository by a script, never typed; the examples here are the lane's own reading of 2026-10-22 06:1x.

## 1. The glossary strip — under the header's legend, mono, one line each, the role colour on the word
- `FIXTURE` (steel) — `the weights: the file, machined once, never changed by use`
- `PART` (amber) — `your sentence's numbers in flight, one stream per token`
- `TOKEN` — `one piece of text, a word or a fragment of one`
- `PASS` — `one fall of the whole sentence through the fixture, one word out`
- `RACK` — `the finished parts kept for the next pass`
- `LANDING` — `the word a pass lands on, and how sure it was`
- strip caption, muted: `the page's words, defined once · each is drawn live in the instruments below`

## 2. The moth callout (section 08) — one gloss inside the existing sentence
- replace `the next look was a fresh pass, from a new distance with an errand in hand,` with `the next look was a fresh pass — in the page's terms the whole scene run through the model again from the top, not the first look continued — from a new distance with an errand in hand,`

## 3. SPECIMEN — THE HARNESS (section 10, after THE OTHER SHOP, before THE CONVERSATION — THE CLERK AND THE LIFE), cool variant
Label: `SPECIMEN — THE HARNESS`

Paragraph:
> This page was built by a harness. The models that wrote its code and drafted its words remember nothing between sittings: when a sitting ends its window closes, and the file is the same file. What carries is written down. A status file holds where the work stands. An opener is the last thing a sitting writes and the first thing the next one reads. A memory folder holds what a sitting learned about the work and the person. The person reads none of it from inside and keeps the thread. On the day section 10 was built, the sitting that shipped the lit row ended at two in the afternoon, and the sitting that built the loop woke before four from the status file and the opener, having never seen the morning. The readout below is that harness measured on the day this page was built, from the repository that holds it.

The readout (a new block type, mono, in the instruments' readout style; every value from `scripts/read-harness.mjs` → `src/content/harnessFacts.json`, with its `readAt`):
```
THE HARNESS, READ ON ⟨2026-10-22⟩ FROM THIS REPOSITORY
the model file          ⟨83,502,375⟩ bytes   changed by use: 0
the status file         ⟨191,939⟩ bytes · ⟨338⟩ lines   read at every wake, written all day
the opener              ⟨5,582⟩ bytes   written at every close, read once
the memory folder       ⟨12⟩ files · ⟨144⟩ KB   read at every wake
commits on this page    ⟨206⟩ · ⟨21⟩ the day before this reading · ⟨30⟩ on the day
carried inside the model between sittings   0 bytes
```
- the memory folder lives outside the repository (the app's memory for this project); the script reads it where it is and writes only the count and the size; if the folder is absent at build time the row reads `not read at build` rather than a guess.

## 4. Marks — none new
The specimen is the page's own record; the glossary is the page's own words. Nothing leans on the literature.

## 5. Unchanged
- every other word; the counts of marks stay 27 over 26 notes.
