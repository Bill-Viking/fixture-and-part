# SPEC — "The Fixture and the Part" Interactive Guide

Audience for this spec: a coding-agent session building in a fresh repo.
Companion file: `the-fixture-and-the-part.html` (the static essay — source of all prose and of the two reference figures). Reuse its prose verbatim unless noted. Its palette is superseded twice over: see §3.

## 1. Goal

Turn the static essay into an interactive explainer where the reader types real input and watches the machinery run: tokenization, the growing KV cache, and Q·K→V attention with live weights. The essay's prose stays; the figures become instruments.

One-line pitch: an engineering-drawing-styled walkthrough of transformer internals where every diagram is live.

## 2. Tech stack

- Vite + React, no UI framework, no Tailwind. Plain CSS in one file using the design tokens below.
- Deployable as a static site to GitHub Pages (`vite build`, base path configurable).
- Phase 2 only: `@huggingface/transformers` (transformers.js) running `distilgpt2` in-browser via WebGPU/WASM with `output_attentions: true` to drive visualizations with REAL attention weights. Lazy-load; the site must be fully functional without it.
- No backend. No API keys. Everything client-side.

## 3. Design tokens

### Superseded — the original dark table

The page first shipped on this palette, copied from the static essay:

```css
--bg:#10151C; --panel:#161D27; --panel2:#0D1218;
--steel:#5B7A99; --steel-dim:#3A4A5C;
--amber:#E8A33D; --amber-dim:#8A7A5A; --amber-bg:#241C10;
--green:#7FB069; --text:#D8E0E8; --muted:#6B7A8A; --hair:#2A3441;
```

It was retired because the page had become too dark to read as a document:
five instruments of dense data on a near-black ground read as one continuous
screen rather than as figures set into an essay.

### Superseded 2026-08-22 — the cream table

Its replacement was an operators'-manual cream, `--paper:#F5F0E4` with
`--card:#FDFBF4` and warm greys throughout. **Superseded 2026-08-22 — owner:
too beige; chose "Gallery white", Paul Rand on near-white.** The structure it
introduced is what survived and is described below: role-named tokens, a light
ground, and dense data on dark screens set into it.

### Current — Gallery white

Paul Rand on white: a near-white ground, near-black ink, light grey hairlines,
and the three role colours held at full strength. This block is the shipped
`:root` in `src/styles.css`, pasted verbatim — if the two ever differ, the
stylesheet is right and this table is wrong.

```css
:root{
  /* grounds: the page, a sheet laid on it, a box recessed into the sheet */
  --paper:#F4F5F7; --card:#FFFFFF; --sunk:#EBEDF0;
  /* Ink, and the two weights of drawn line the page uses.
     --rule is a boundary: it draws the edge of a control, a panel or a
     section, and is dark enough to pass 3:1 on both grounds. --hair is a
     decorative separator between rows of a list or a table, where the rows
     themselves are the content and the line is only a comb; it is deliberately
     lighter than 3:1 and must never be the only thing identifying a control. */
  --ink:#14161A; --muted:#585F6A; --hair:#DCDFE4; --rule:#7E8792;

  /* A dark panel set into the page, and what may be written on one.
     --screen-hair is the decorative comb between rows, like --hair. */
  --screen:#14161A; --screen-sunk:#1E2127;
  --screen-text:#F4F5F7; --screen-muted:#A3AAB5; --screen-hair:#333940;

  /* frozen machinery */
  /* --frozen-dim carries real information — the unselected segments of
     instrument E's byte bar and the fill under its bell curve — so it is dark
     enough to pass 3:1 on the ground it is drawn on rather than being a pale
     tint. */
  --frozen:#1E5AA8; --frozen-dim:#5588C4; --frozen-tint:#E8EFF8;
  /* --frozen-on-screen is the readable blue on a dark panel; --frozen-lit is
     the top of instrument E's byte ramp, where the largest weight in a tensor
     lands. Nothing on the page is brighter than the latter. */
  --frozen-on-screen:#7FB0E8; --frozen-lit:#D6E9FF;
  /* The moving part. --moving is a fill; --moving-ink is the readable form of
     the role on the page ground; --moving-on is what may be WRITTEN on a full
     --moving fill, which on a light ground is the ink and on a dark one would
     not be. It is a token rather than a hard-coded --ink so that repainting
     the page stays a swap of this table and nothing else. */
  --moving:#F2B705; --moving-ink:#7A5900; --moving-tint:#FCF3D8;
  --moving-on:#14161A;
  /* keys */
  --keys:#2C7539; --keys-tint:#E1ECE3;
  --keys-on-screen:#63B36F;
  /* the one loud thing */
  --alert:#E4432D; --alert-ink:#B32D19;

  --mono:'IBM Plex Mono',ui-monospace,monospace;
  --display:'Space Grotesk',sans-serif;
}
```

Fonts are unchanged: Space Grotesk (display), IBM Plex Sans (body), IBM Plex
Mono (labels/data). Google Fonts.

**Semantic color law, enforced everywhere and unchanged by either repaint.**
The tokens are named for the roles rather than for the colours filling them:
`--frozen` = frozen machinery (weights, dies, anything that never changes);
`--moving` = the moving part (activations, tokens in flight, values); `--keys` =
keys and searchable metadata. Never violate this mapping; it is the visual
thesis. `--alert` is not a data role — it is errors and warnings, used sparingly.

The page's own legend and the essay's prose name these colours the steel, the
amber and the green. The token names are the roles; those words are the page's
vocabulary for them, and the two must not drift apart.

**Light-ground rules.** Two things follow from the ground being light rather
than dark, and both are load-bearing:

1. Yellow is a fill, never body-size text on the page ground — `#F2B705` on
   `#F4F5F7` is 1.7:1. Bars, token grounds, highlights and the one filled
   button take `--moving`; anything that has to be READ in the moving-part role
   takes `--moving-ink`, a dark amber that passes AA on the page ground.
2. `--moving-on` is the one colour that may be WRITTEN on a full `--moving`
   fill — the filled load button and instrument D's selected token. It exists
   as a token rather than as a hard-coded `--ink` so that a future repaint onto
   a dark ground stays a swap of this table and nothing else.
3. A role colour on a screen is not the same swatch as on the page ground.
   Yellow carries at 10:1 on ink and needs no variant; blue and green do not,
   so `--frozen-on-screen` and `--keys-on-screen` exist and are the only forms
   of those two allowed on a dark panel. `--frozen-lit` is the top of
   instrument E's byte ramp and is the brightest thing on the page.

**Card and page are one twentieth of a stop apart** (`#FFFFFF` on `#F4F5F7`,
1.05:1), so no box on this page may be identified by its fill. Every card,
callout, chip, frame and floating panel carries a drawn edge: `--rule` for a
frame or a control, `--hair` only for a comb between rows of a list whose rows
are themselves the content.

**Screen rules.** A graphic that is a dense field of values sits on a dark
panel (`.screen`) set into the light page, the way an operators' manual sets a
code block into a page: instrument B's KV rack, instrument C's lookup table,
instrument D's lens rows, and instrument E's byte window. A graphic that is a
labelled chart, or a handful of words, stays on card in ink and blue:
instrument E's tensor list, byte bar and bell curve, instrument B's shortlist
and its sequence pane, instrument C's budget bar. Every screen gets a
full-strength ink hairline border and carries a mono field label immediately
above it.

**Focus** is an ink ring on the page ground and the screen's own text colour
inside a screen. It is never a role colour — an amber ring on the amber button
was invisible, and on a light ground it would be a smudge.

**Contrast**: every text/ground pair on the page is measured, not assumed, by
walking every rendered text node in a headless browser and compositing its
effective background. Body and label text is ≥ 4.5:1; large text and UI edges
are ≥ 3:1. The floor for text size anywhere in instrument E is 10px.

**Layout shift is zero** and is a standing invariant, not an aspiration: every
reserved box holds the tallest and widest state it can ever show, right-aligned
text that changes length is given a fixed box, and anything that moves is moved
by `transform` rather than by `top` or `left`. Two known exceptions are
documented in `STATUS.md`.

Aesthetic: a technical drawing on a white page. Hairline rules, mono eyebrows,
no gradients, no glassmorphism, minimal border-radius. Motion: only where it
shows mechanism (a vector moving through a layer, a bar animating to its
softmax weight). Respect `prefers-reduced-motion`.

## 4. Page structure

### Instrument head hierarchy

Every instrument head (A–F) carries the same four lines, in descending order
of loudness, so a first-time reader is told what he is looking at before he is
told where its numbers came from:

| line | content | style |
|---|---|---|
| eyebrow | `INSTRUMENT C` — the identifier alone, no long name | mono 10.5px, `0.18em`, `--frozen`, matching the section eyebrows one level up |
| status note | where these numbers came from, e.g. `real distilgpt2 attention · layer 0 · head 0` | mono 11px `--muted`, right of the eyebrow on wide screens, its own line below 780px. In B, C, D and E this same box is also the load command (`LoadNote`), and its three states share one box |
| title | the instrument's name in sentence case — "The attention inspector" | Space Grotesk 600, 18px, `--ink` |
| purpose | one plain sentence saying what the reader is about to see | IBM Plex Sans 13.5px, `--ink` — not muted; this is the line that orients |

The eyebrow and the note share the top row the way a drawing's title block puts
the sheet number opposite its revision; the title and the purpose have the full
width under them. DOM order is eyebrow, title, purpose, note — the order to
hear them in — and the note is lifted back to the top row by its grid area.

The reading line under the head (B, C, D) follows the same rule: the label
`reading` stays a small muted mono label, and the sentence itself is set at
14px `--ink` in the body face, because the sentence is what the reader has to
recognise as his own.

### Figure numbers

The figures are numbered in reading order down the page, not in the order the
instruments were built. Adding an instrument renumbers the ones below it.

| FIG | instrument | section |
|---|---|---|
| 1 | E — the file | 01 |
| 2 | A — tokenizer strip | 02 |
| 3 | F — the forward pass, live | 02 |
| 4 | B — forward-pass stepper + KV rack | 03 |
| 5 | C — attention inspector | 04 |
| 6 | D — the glass pass | 04 |

Single scrolling page, sections 01–10 mirroring the essay. Prose imported from the HTML. Three sections get live instruments replacing their static figures:

### Instrument A — Tokenizer strip (Section 02)
- Text input, default: "The engine roared and it shut down."
- On input: split into tokens (Phase 1: simple word/punct split; Phase 2: real GPT-2 BPE from transformers.js). Render as moving-part pills with token index and a fake-but-stable embedding preview (first 6 dims, deterministic hash of token string → values in [-2,2], monospace).
- Teaching point label: "one token → one vector."

### Instrument F — The forward pass, live (Section 02, after A)

The answer to "the neural net is static — I thought we'd see the weight
activations as we ran it". Everything else on the page is one reading through
one window; F is the whole machine drawn once with the reader's own sentence
visibly inside it.

- One fixed-viewBox SVG on a full-width dark screen. Its height is a function
  of its width and of nothing else — never of how many tokens are in the
  sequence — so the drawing can never move the page.
- Depth runs down: an embed band (wte, wpe), six block bands (ln_1 ·
  attention with twelve head squares · ln_2 · MLP 768→3072→768), then ln_f and
  the embedding table used backwards, with a drawn tie back to wte because
  there is no second copy of it in the file.
- Every steel box is a button carrying that tensor's real shape, dtype and
  byte count, read out of `fileFacts.json` — the same reading instrument E
  draws, not a second copy typed out by hand. Clicking one prints the full
  readout (`h.3.attn.c_attn.weight [768×2304] i8 · scale … · zero point 0 ·
  1,769,472 bytes`) and offers to open that row in instrument E.
- The sequence runs across the top as amber chips; the selected chip is the
  shared `lensIndex`, so F and D always read the same position. Each token is
  an amber column down the drawing with a node at each of the seven residual
  stops, sized and brightened by the real ‖residual‖ at that stop, normalised
  across the run on a log scale that the legend states.
- In the selected layer — the same `layer` instrument C uses — the selected
  token's attention is drawn as threads back to the tokens it reads, opacity
  proportional to the head-averaged weight, and the twelve head squares light
  by the share of that token's attention each head spends anywhere but on
  itself. The legend names that scalar rather than leaving a lit square to be
  guessed at.
- Lettered markers A–E are windows: each scrolls to the instrument the part
  under it belongs to.
- Three states, not two. A finished pass draws its own norms. No model draws
  the deterministic stand-ins instrument D prints, labelled as such. A pass in
  flight draws the stream flat and says the pass is running — the illustrative
  numbers are never shown under a real-model heading.
- Every steel box also wears its own tensor: a whole-tensor thumbnail — 48×12
  block averages of the real bytes, contrast-stretched, read at build time into
  `fileFacts.json` — drawn faintly inside the box in the frozen blue. It is
  real in BOTH modes, because it was read out of the file rather than out of a
  pass, and it is the grain of the steel rather than a decoration. The stretch
  is per tensor and it is said on the page, because it is a drawing decision:
  a tensor with a narrow range shows the grain of its own rounding, and one
  whose 576 blocks all read alike to within a byte is drawn as an even wash at
  a low alpha — neither invisible, which is what a span of zero used to draw,
  nor bold, which is what one rounding step stretched to full contrast drew.
  As the water crosses a box the same bytes glint in the moving amber, by
  opacity alone.
- The water: the selected token's running vector as a 768-cell amber strip, one
  cell per number, nothing downsampled and nothing picked out — so what the
  reader sees is the vector and not a summary of it. On RUN THE PASS it appears
  at the embedding and travels down, its cells morphing at each of the seven
  stops to that stop's real values. Two normalisations, both named on screen: a
  cell's brightness is |value| against four times the middle magnitude at that
  depth — the largest was tried and rejected, because a GPT-2 stream carries a
  few outlier dimensions hundreds of times everything else and a ramp against
  the maximum paints 760 of the 768 cells black — and the strip's overall
  brightness is log ‖residual‖ across the run. Clicking any
  node parks the strip at that depth — the microscope — until the next pass.
  Reduced motion puts it at the bottom of the fall immediately.
- The columns are named on the drawing rather than under it: a line beside the
  sequence says what a column is, an arrowhead below each band of the selected
  column says which way depth runs, and every node answers to a hover and to a
  screen reader in plain words ("the ␣bird vector after block 2 — length 54.4").
  The legend's first line is set at readout size, not fine print: it is the
  sentence that turns the drawing into a reading.
- The lens, whispered. As the strip passes each stop, a reserved line says what
  the logit lens hears at that depth ("the lens, after block 2 — leaning
  ␣wings"). It is instrument D's reading through the same worker, not a second
  implementation, and it is verified against D's own table depth by depth. The
  word is "leaning" because the model makes no prediction at block 2 — the lens
  is what it would say if the stack stopped there. Illustrative mode gets no
  reading at all rather than a stand-in one. Written to the DOM, not rendered,
  so seven updates a second cost no React renders; not announced live, because
  D presents the same seven readings as a table.
- The landing. The last stream reaches the unembedding and splashes across
  50,257 words; the tallest few are drawn under the last token's own column,
  heights proportional to the real probabilities, with the bar the sampler
  actually took in the moving amber and the rest in frozen blue. The sampler
  skips whitespace, so the amber bar is often not the tallest one, and the
  drawing shows that rather than marking the argmax.
- Both the whisper's line and the landing's row are reserved in the geometry
  whether or not there is anything to put in them, so the figure is the same
  height before a pass, during one and after it.
- RUN THE PASS replays the drawing token by token and stop by stop over about
  two seconds, in opacity alone; a STEP replays it too. Reduced motion draws
  the final state instantly.
- `__mapCheck()` in a dev build recomputes both moving claims by a second
  route and returns the largest disagreement.

### Instrument B — Forward-pass stepper + KV rack (Section 03)
- Controls: STEP (advance one generated token), RUN (auto-step ~800ms), RESET.
- Left: the sequence so far; the newest token in the moving-part colour, prior tokens in the frozen colour.
- Right: the KV rack — one row per processed token showing a K chip (keys) and V chip (moving part). On each step, exactly one new row appends with a brief settle animation; existing rows must visibly NOT change (this is the append-only lesson — consider a subtle "bolt" icon on rows once racked).
- Counter: "cache entries: N × L layers" and a note that new tokens scan the whole rack (render a quick sweep line over all rows on each step).
- Phase 1 generation: canned continuation for the default sentence; for arbitrary input, loop a placeholder ("…"). Phase 2: real distilgpt2 next-token sampling.
- Decoding control (real mode only): greedy or sampled, sampled by default. Greedy on a six-block model loops within a few tokens — a true fact about greedy decoding and a poor advertisement for the machine — so the reader gets a seeded top-k draw with a repetition penalty, and the control says which rule is picking. Illustrative mode is pinned to greedy: the toy numbers are hand-tuned, and drawing from a hand-tuned distribution would be theatre. The greedy path is unchanged from the build before the sampler and must stay byte-identical.

### Instrument C — Attention inspector (Section 04, the centerpiece)
- Uses the current sequence from Instrument B. Reader clicks any token → it becomes the querying token (moving-part ground, bold).
- Table: one row per prior token (causal mask enforced — future tokens rendered locked/grey with a tooltip "causal mask: not yet visible").
  Columns: token | K descriptor | raw Q·K score | softmax weight (animated horizontal bar, keys) | V chip.
- Below: the blend line — "Σ weightᵢ × Vᵢ → folded into ⟨token⟩" with the top-weighted token named in plain English (e.g., 'it' now points at 'engine').
- Softmax visual: bars always sum to a fixed track width (the budget-of-1.0 lesson).
- Phase 1 scores: hand-tuned lookup table for the default sentence (make "it"→"engine" ≈ 0.85) plus a heuristic for arbitrary text (recency + noun-ish bonus) — label it "illustrative weights."
- Phase 2: real attention matrices; add layer (0–5) and head (0–11) selectors; label switches to "real distilgpt2 attention, layer L head H."

### Static sections
01, 05–10 keep essay prose. The Section 09 duo cards and the two callouts port as-is. Add a fixed mini-legend naming the three roles and their colours, which appears once instruments are on screen.

## 5. Phasing & acceptance

**Phase 1 (must ship first, no ML dependency):**
1. All 10 sections render with essay prose and design tokens on mobile (390px) and desktop.
2. Instrument A tokenizes arbitrary input live.
3. Instrument B steps, runs, resets; rack rows append and never mutate; sweep animation on step.
4. Instrument C: clicking any token shows causal-masked rows, animated softmax bars summing to full track, blend line updates; default sentence reproduces the essay's 0.85 "engine" story.
5. Lighthouse: no layout shift on step/click; reduced-motion honored; keyboard focus visible.

**Phase 2 (separate branch `real-weights`):**
6. distilgpt2 loads lazily behind a "Load real model (~90 MB)" button with progress; failure falls back to Phase 1 silently except a muted notice.
7. Instrument C driven by real attention with layer/head selectors; Instrument B generates real tokens.

## 6. Copy rules

Sentence case. Plain verbs. Labels label ("STEP", "RESET", "cache entries"), never sell. Any illustrative (non-real) number is marked "illustrative." Keep the essay's voice: precise, engineer-to-engineer, no exclamation points.

## 7. Repo shape

```
/index.html  /src/main.jsx  /src/App.jsx
/src/instruments/{Tokenizer,Stepper,AttentionInspector,GlassPass,FileView,ForwardMap}.jsx
/src/content/essay.js   (prose extracted from the HTML, per section)
/src/lib/{toyModel.js,realModel.js}   (Phase1 heuristics / Phase2 transformers.js)
/src/styles.css
```

Commit Phase 1 complete before starting Phase 2. Do not refactor the prose.
