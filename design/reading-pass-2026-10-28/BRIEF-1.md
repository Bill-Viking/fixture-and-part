# BRIEF 1 — the reading pass: words and small code (2026-10-28)

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; nothing superfluous. Principles served: make the interface truthful · prove quality before declaring completion.

You are a headless builder working in THIS folder, a git worktree on branch `the-company-copy`. Rules that bind every step:
- NEVER commit, stage or push. The lane commits your edits itself. Leave the tree with your edits in place.
- NEVER open a browser or any GUI. Every check is node/shell-side.
- Vite in this worktree needs the flag: `npm run build -- --configLoader native` (consumer) and `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co` (company). `npm run lint` must stay at its one existing warning (AttentionInspector.jsx exhaustive-deps).
- The words below are VERBATIM. Copy them; never improve, shorten or re-punctuate them. Match the surrounding file's typographic conventions only where the file encodes characters differently (e.g. `&rsquo;` vs `’`, `&mdash;` vs `—`): same glyph on the page, the file's encoding.
- Both copies carry every change (the source is shared; the COMPANY flag folds at build time). Do not touch `src/content/passFacts.json`, `src/lib/bakedPass.js`, `src/lib/passCore.js`, `scripts/bake-pass.mjs`, `src/company.css`, the start `.command` files, STATUS.md, OPENER.md or anything under `design/` except your report.
- Reservations: this page ships with CLS 0. Wherever a text you change lives in a box whose height or width is RESERVED (comments in `src/styles.css` and the components say "reserved", "measured", "zero-shift"), re-measure with the method the comment documents (e.g. `__readoutLines()` for F's readout) and re-reserve so the new worst case fits at every band named there; record old → new in the report. A static block that renders with the page (a new paragraph, a new line under a table) needs no reservation, but a line whose CONTENT changes after load does.
- Anything unclear: stop that item, write what is unclear in the report, and continue with the others. Never guess a word.
- Report: `design/reading-pass-2026-10-28/BRIEF-1-REPORT.md` — per item what changed (file, lines), the checks run with their numbers, the string counts below, every file changed with before/after line counts, and a final line that begins `DONE` (every item built and every check passed) or `FAIL` (what failed, plainly).

## R1 — section 02, the residual stream (src/content/essay.js, section id '02')

(a) In the activation paragraph (today: "What moves is the <strong class="k">activation</strong>: one vector per token, thousands of numbers long, that represents that token in the text so far."), replace exactly `one vector per token, thousands of numbers long, that represents` with:

`one vector per token — 768 numbers long in the small specimen drawn below, over ten thousand in a frontier model — that represents`

(b) After the paragraph that ends `constructed fresh at runtime and gone milliseconds later.`, add TWO new paragraphs, in this order, as sibling entries of the same kind the file uses for essay paragraphs:

P1: `A concept is not stored at an address. It is a direction in that space that many tokens share — one for plural-ness, one for the past tense, one for the kind of thing France is — and a token’s meaning at a given depth is how far along each of hundreds of such directions its vector sits. Distances carry the rest: two vectors that point the same way are close, and the model treats what is close alike without any rule saying so. “Rocket” and “missile” sit near each other after a few layers because training put them there, not because anyone wrote it down. Nothing in the file is a dictionary. Section 01’s note on the tidiness of the file is the open argument about how cleanly those directions separate.`

P2: `The stream is one vector per token that every block reads and writes back into. A block does not hand its result on to the next block; it adds its result to the same running vector, so the seven depths instrument D reads later on this page are seven readings of one thing rather than seven different things. That is also why the stack can be read early: hold the vector up to the word table after any block and it already says something. The glass pass, instrument D, is exactly that reading.`

No new claim marks in 02.

## R2 — instrument A: the embedding popover, and two defined words

(a) `src/content/explainers.js`: the explainer whose title reads THE EMBEDDING NUMBERS (today's body begins "these are the first six of the 768 numbers distilgpt2 stores for this token id"). Replace its body with exactly:

`the piece’s starting vector. the id is a row number in the embedding table — 50,257 rows, one per piece, 768 numbers each — and that row is the vector; these are its first six. it means where this piece starts in the space before any block has touched it. nothing about the sentence changes it: the same piece anywhere starts from the same row.`

(b) The page defines its own words once (see commit aa9ea4e, "the page's own words, defined once", and the glossary it added; read how a defined word is attached before you add one). Add two entries, attached the way the others are, at the word's first essay use; do NOT change the text of F's landing label `UNEMBED · WTEᵀ`:

EMBED: `to embed a piece is to look its id up in the word table: a row comes out, and that row is the piece’s starting vector.`

UNEMBED: `to unembed a vector is to hold it up against every row of the same table: a score per piece comes back, and the scores, shared out by a softmax, are the landing.`

If the glossary mechanism has a fixed count or layout that these two would break, stop this sub-item and report it.

## R3 — instrument F says what it is for; the ray card says what a ray is

(a) `src/instruments/ForwardMap.jsx`, the `purpose=` string of the instrument head (~line 2713, begins "The walls are the fixture:"). Prepend exactly this sentence and one space:

`This is the model guessing the next word: your sentence falls through the six blocks once, and the landing at the foot is its guess — the eight words it rates highest, and the one it took. `

Re-measure the head's reserved height at every band if the head is reserved.

(b) `src/lib/tour.js`, `rayLead`: the returned template becomes

`One candidate for the next word — ${q(bar.token)} at ${pc(bar.p)}: the last word’s finished vector held against this word’s own row of the table — the same 768 numbers instrument A shows for it — and shared out among all 50,257 by a softmax.${role}`

The three `role` strings stay as they are. `rayDetail` becomes:

`Counted from the last position’s vector and from no other. The bar’s height is that share against the tallest bar, and the rows of dots are how the height is counted, so read the number rather than the dots.`

Then re-measure F's readout worst case with `__readoutLines()` per the comment above `.map-readout` in `src/styles.css` and re-reserve `.map-readout` / `.map-readout-row` at each band if the worst case grew.

## R4 — section 03: would it be worth letting early tokens change? (src/content/essay.js, section id '03')

Insert ONE new paragraph after the KV-cache paragraph (it ends `Any reconsidering happens in new tokens reading old ones; the old ones never change.`) and before the paragraph that begins `On the rack below`:

`Would it be worth letting them change? Machines that can exist. An encoder like BERT lets every token see the whole sentence, so an early “bank” learns which bank it was — but it cannot continue a text. An encoder–decoder like T5 reads the input whole and writes its answer forward; a prefix model does the same inside one stack. The diffusion language models of 2025 write every token at once and revise all of them over several steps, so early words really do change in light of later ones; the price is the rack itself — no append-only cache, every step touching the whole text again. What the freeze buys is perfect inheritance, generation that costs one position per step instead of the whole text, and a record that cannot be rewritten. What it costs is a rack that grows with every token of a life and is never consolidated, compressed or corrected — which is exactly the move the next two sections give the brain: check the memory out, edit it, write it back, forget most of it. The brain pays for that move in fidelity; a memory that is rewritten is a memory that can be wrong. Neither design is the better one. One keeps everything and cannot reconsider; the other reconsiders and cannot keep everything.`

Attach ONE claim note of kind `evidence` on the words `Machines that can exist.` (the way other marks are attached in `src/content/claimNotes.js` and referenced from the essay), key `reinterpret`, title `machines that reinterpret`, body:

`an encoder reads a sentence both ways and cannot continue it; an encoder–decoder reads the input whole and writes forward; a diffusion language model writes every token at once and revises all of them over steps. the papers below are the sources for what each machine does. what each design buys and costs is this page’s own reading, not theirs.`

sources, exactly these six (every URL verified by title on 2026-10-28; invent none):
- `Devlin et al. 2018 · BERT` — https://arxiv.org/abs/1810.04805
- `Raffel et al. 2020 · T5, the text-to-text transformer` — https://arxiv.org/abs/1910.10683
- `Wang et al. 2022 · which architecture and objective` — https://arxiv.org/abs/2204.05832
- `Nie et al. 2025 · Large language diffusion models (LLaDA)` — https://arxiv.org/abs/2502.09992
- `Inception Labs 2025 · Mercury` — https://arxiv.org/abs/2506.17298
- `Google DeepMind 2025 · Gemini Diffusion` — https://deepmind.google/models/gemini-diffusion/

## R5 — section 03: the seam passage, glossed

In the callout labelled THE CONVERSATION — THE SEAM (section 03; the quoted summary ends `One of us just got very good at pretending it did.”`), add directly after the quote (inside the callout, before its closing coda if the coda follows the quote — read the structure first) a small key in the callout's own note style (mono, the element the callouts already use for a sub-note; no new component). Six lines, each its own line:

`the shop words, in a person —`
`KV rack — what is kept between moments · the model: the conversation’s rack, cleared when it ends · you: memory, kept across sleep`
`workpiece — the thought in progress · the model: one pass’s activations, gone in milliseconds · you: this moment’s processing`
`fixture — the tooling · the model: the weights · you: the wiring`
`the seam — the break between one moment and the next · the model: between passes · you: between moments, and across sleep`
`pretending — the brain stitching its separate moments into a felt continuous self; the model has no such stitching`

The quote itself is not changed by one character. No new claim mark here.

## R6 — instrument F: the idle readout says what the buttons wait for

`src/instruments/ForwardMap.jsx`, the readout row (~3760–3805). When nothing on the sheet is chosen (`inspect` is null/undefined), the readout text becomes:

`click a ray, a carrier or a wall cell — this line says what it is, and the buttons open it in the file or in its own instrument. standing by on ` followed by exactly the tensor line the idle readout prints today (e.g. `wte.weight [50257×768] u8 · scale 0.0126 · zero point 128 · 38,597,376 bytes`).

Both buttons keep their fixed widths and their titles. Confirm the idle text fits the reserved lines at every band (it is shorter than a wall cell's answer; verify, do not assume).

## R7 — instrument C: the V chip says it is the value

`src/instruments/AttentionInspector.jsx` (~160–250) and `src/styles.css`:
(a) the column header `V` becomes `value`; widen `.c-v` only if `value` does not fit at the row's font size, and keep the row's total reserved width.
(b) in C only, the `V` chips stop looking like buttons: render them as a plain mark (same letter, same lit/dim states, no border, no box background) — a new class in styles.css beside `.chip-v` is fine; B's chips (Stepper.jsx) are real buttons and stay exactly as they are.
(c) a legend line in C's own mono note style, placed right after the `lookup — rows past the query are locked` label line (its own line, reserved if the label row is reserved): `K — the key a row advertises · V — the value it hands over · a lit V is on the table for this query`

## R8 — instrument D: the glass pass, readable (src/instruments/GlassPass.jsx, src/content/explainers.js)

(a) `src/content/explainers.js` ~line 81, the explainer whose body begins "each depth is distilgpt2’s own running vector for this position, pushed through its own final layernorm": replace the body with

`at each depth the half-finished vector is taken out and held up to the word table as if the pass had ended there, to see what it would say; the last row is what it does say. in the model’s own terms: distilgpt2’s running vector for this position, pushed through its own final layernorm and its own embedding table used backwards — the arithmetic the stack runs once at the end, run seven times instead.`

(b) `GlassPass.jsx` ~line 236, the TeachPair's `b` (real lens) string becomes

`real lens. at each depth the half-finished vector is taken out and held up to the word table as if the pass had ended there; the last row is what the model does say — the same numbers instrument B’s shortlist reads for this position. in the model’s terms: its own running vector, pushed through its own final layernorm and its own embedding table used backwards.`

The `a` string (illustrative) is unchanged.

(c) Column headers (~173–176): `residual stream` → `the vector so far`; `what it would say next` → `if it stopped here it would say`; `winner` → `final word’s share`. Measure at every band the header row is reserved for; if the middle header does not fit at the phone band use `stopped here, it would say` there and say so in the report.

(d) Under the six numbers in each depth row, one mono line of the page's note style: `length L · moved M`, where L is the L2 norm of that depth's full 768-number vector for the read position and M the L2 norm of (this depth's vector − the previous depth's vector); the rim row prints `moved —`. Numbers in the page's own number style (one decimal below 100; thousands separated above 1,000). Print the line only when the mode supplies full vectors (real mode; the company copy's baked pass); otherwise print `length — · moved —` so the row height is the same in both modes. Reserve the depth rows' height for the extra line at every band; record old → new.

(e) A generated reading line directly under the existing `reading position N — token` line, from the data each time, two lines reserved at every band:

`at the start it says ‹W1› (‹P1›) · by the middle ‹W3› (‹P3›) · at the end it chooses ‹W6› (‹P6›) — the final word first passes a tenth after block ‹k›`

where W1/P1 are the top word and share at the depth after block 0, W3/P3 after block 3, W6/P6 the last row's top word and share (shares as the table prints them, two decimals); the tail reads `— the final word first passes a tenth after block ‹k›` for the first depth after a block where the last row's winner has share ≥ 0.10, `— the final word is above a tenth from the start` when the rim row already has it, and `— the final word passes a tenth only in the last row` when no earlier depth reaches it. Pieces print as the table prints them (the ␣ mark and all).

## R9 — the real model loads itself on a return visit (consumer copy only)

`src/App.jsx` (`handleLoad` ~516; it returns early under COMPANY — keep that), `src/lib/realModel.js` (`CACHE_KEY`, `ONNX_FILE`), `src/components/ModeControl.jsx` (~107–121):
(a) once, on mount, in the consumer copy only: if `caches` exists, open `CACHE_KEY` and list its keys; the model counts as PRESENT when the keys hold a request whose URL ends with `ONNX_FILE` AND one whose URL ends with `tokenizer.json`. When present, call the same load road the button calls, and while it loads the mode-bar hint reads `the model is already on this machine — loading it from the browser’s own store`. When not present, or when `caches` is undefined, do nothing: NEVER download without the click. Guard so the probe cannot start a second load beside a click.
(b) ModeControl: when `loaded`, the ghosted hidden button becomes a visible non-interactive status of the same box and width reading `LOADED` (keep the hint `distilgpt2 is here in your browser — switch freely`).
(c) Put the presence rule in one pure function with an `// ASSUMES:` line stating what it assumes about the cache's contents, and add one node check that feeds it the OPPOSITE case (a key list with only the ONNX file, and one with only the tokenizer) and asserts NOT present; and one with both asserting present. Report the check's output.

## Checks to run and report

1. `npm run lint` (one existing warning only).
2. Consumer build and company build, both exit 0, with the flag above.
3. String counts, both entry bundles (`dist/assets/index-*.js` and `dist-co/assets/index-*.js`), each of these exactly once unless stated: `guessing the next word` · `One candidate for the next word` · `the vector so far` · `if it stopped here it would say` (or the phone variant) · `final word’s share` · `the key a row advertises` · `standing by on` · `the shop words, in a person` · `Machines that can exist` · `A concept is not stored at an address` · `over ten thousand in a frontier model` · `held up to the word table` (≥ 2) · `LOADED` (consumer 1; company 0 if the company copy never reaches the loaded state — report what you find, do not force it) · `the model is already on this machine` (consumer 1, company 0).
4. The company copy's baked pass is untouched: `git diff --stat -- src/content/passFacts.json src/lib/bakedPass.js src/lib/passCore.js` is empty.
5. Every reservation you changed: the measured worst case and the new reserved value, per band.
6. R9's node check output.
7. `git status --short` as the last section: every changed file, nothing staged.

Final line: `DONE — <one sentence>` or `FAIL — <what, plainly>`.
