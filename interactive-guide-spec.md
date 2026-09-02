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
  /* --moving-lit is the top of the moving ramp on a dark screen, the way
     --frozen-lit is the top of the frozen one: it marks the hero stream,
     the carriers and the bar the sampler took. It is a lit amber, not a
     white — nothing on a screen in this page is allowed to be white but
     the words. */
  --moving:#F2B705; --moving-ink:#7A5900; --moving-tint:#FCF3D8;
  --moving-on:#14161A; --moving-lit:#FFD13A;
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
activations as we ran it", drawn as a memory room: six frozen walls of the
file's own weight bytes, with the reader's sentence falling through all six as
granular light. Redrawn in arc 4 from comp-a3; the data layer is unchanged.

- One fixed-viewBox SVG on a full-width dark screen, 1166 units wide at both
  breakpoints. Its height is a function of the breakpoint and of nothing else —
  never of how many tokens are in the sequence, never of which register is
  open, never of whether the model has loaded — so the drawing can never move
  the page. The two breakpoints differ in type size, in the coarseness of the
  grain and in how much the legend says, not in the law.
- **The walls.** Six full-width fields, one per block. Every cell is one real
  i8 byte of that block's `attn.c_attn.weight` as the file stores it — the
  24 × 64 window `fileFacts.json` keeps, 1,536 cells a wall, drawn in the
  window's own shape because reshaping it would put bytes side by side that
  are not side by side in the tensor. The bytes are read as what the manifest
  says they are: i8 at zero point 0, so a byte above 127 is a negative weight
  and 255 is −1. A cell's brightness is the weight's own magnitude — its size
  and not its sign, because both signs are the machinery working — stretched
  across the middle 96% of that window's own magnitudes, so a handful of large
  weights cannot flatten the rest; on the real windows that runs 0 → 33 of a
  largest 47 on block 0 and 0 → 13 of 19 on block 5. A window whose weights
  are all but identical in size gets arc 3's even wash instead of a black
  panel. The walls are real in both modes, because they were read out of the
  file rather than out of a pass. Cells are grouped by magnitude and drawn one
  path per magnitude — nothing is quantised on the way to the screen, and a
  wall costs tens of elements rather than fifteen hundred.
- **The fall.** One stream per token. Width, light and grain density are all
  the real L2 length of that token's 768-number running vector at each of the
  seven depths, on one log law shared by every stream, which the legend states
  along with the range it spans. Inside a stream the 768 dimensions are drawn
  as filaments — 64 of 12 dimensions up to twelve tokens, 32 of 24 up to
  twenty-four, 16 of 48 beyond — and a filament's grain is the mean |value| of
  its own dimensions at that depth, scaled against the brightest filament in
  that same stream at that same depth. Two normalisations answering two
  questions, both named on screen. The grains are dashed paths, so one element
  carries a whole column of particles and the ink density per unit of area
  stays even whatever the stream's width.
- **The hero.** The last token by default; clicking any token makes it the
  hero. Its stream is the lit one and every transfer is aimed at it. What the
  hero does not do is move the landing: below the last wall every stream fades
  into the mist but the last position's, which is the one the landing is
  counted from and the one drawn down to the aperture — dimmed, when an
  earlier token is the hero, because it is still the stream that feeds it.
  The hero's own fall then ends in the mist with the rest.
- **The transfers.** Per block, from the head that sends the most attention
  away from the first token and away from itself — averaged over the queries
  that have somewhere else to look — the hero's own sources at or above 0.15,
  at most two. Self-attention is never a transfer: it is the stream
  continuing, and it is already drawn as the stream. Each transfer is a green
  key tick at the source (green = the key that matched), a `source · weight`
  callout beside it in the dark air, an amber carrier whose width and light
  are that real weight, and a bloom where the hero absorbs it — below which
  the hero runs brighter, and that brightness is the weight too. A block that
  draws nothing says so in place, with the weight it sent to itself, and the
  legend gives the best other source that fell under the floor. Carriers keep
  to the dark air above the walls, drop into the hero down one dimmed lane,
  and are masked out of every other stream they cross, so no line ever crosses
  the water.
- **The landing.** The last position's alone, always: `LAST POSITION →
  50,257 WORDS · TOP 8`, the pass's own softmax over the whole vocabulary,
  drawn as dot-grid bars whose row count is the probability. The machine's own
  argmax is blue; the bar the shipped sampler took carries the amber mark, and
  the key line under the bars names both along with the decoding settings.
  With an earlier token as the hero the landing stays anchored to the last
  position, stands back, and says so — a landing is never drawn from a
  non-final position's vector.
- **Nothing is drawn over the picture without standing the picture back.**
  Cells dim to 55% under a stream and to 8% under a carrier, a label or a
  plate, by a scrim painted in the screen's own background gradient at that
  scrim's own depth in the drawing — which keeps all 9,216 wall cells out of
  every re-render. The words the drawing names its own parts with are painted
  after the fall rather than before it, each on a scrim sized from its own
  measured width: a label the water runs over is not a label, and the
  stylesheet cannot see that the water is there.
- **The drawing says fixture and part** (fix pass). The essay's section 02 is
  called "Weights are the tooling. Activations are the workpiece", and the
  drawing under it named neither half. Four places do now, with the water and
  the light left underneath as flavour: the instrument's purpose line (the
  walls are the fixture, the file's frozen tooling, one station per block; the
  sentence is the part, one stream a word, falling through the stations; a
  transfer is the tooling touching the part; the hero is the piece finished at
  the last station); the token strip's label, THE PART — YOUR SENTENCE, ONE
  STREAM EACH; CLICK ONE TO MAKE IT THE HERO; the tour's opening stop; and the
  five legend headings, which carry the analogy above the mark's own name —
  THE FIXTURE over THE WALLS, THE PART over THE FALL, THE TOOLING / TOUCHES
  THE PART over THE TRANSFERS — with the essay's word set back in the legend's
  grey so the pair reads as one heading. The headings are gutter LINES rather
  than one string because the gutter is 188 drawing units wide and holds
  sixteen characters of the column setting's type; measured with
  `getComputedTextLength`, the widest line (TOUCHES THE PART) is 184.28 units
  of 188 at 641, 184.24 at 800 and at 1199, and 109.41 at 1280, where the type
  is smaller. The phone has NO gutter — the legend body starts at x 8 there,
  not 196 — so the headings are not gutter lines at that width at all: they
  render as one joined line of the legend itself, THE TOOLING · TOUCHES THE
  PART · THE TRANSFERS, 893.92 units of 1,166. They cost no height at any
  width, because every entry's body already reserves more lines than its
  heading uses.
- The sentence runs across the top as one clickable chip per token, and a
  chip carries its word. Where the sentence is long enough that a chip has
  room for fewer than three characters — around seventeen tokens — two
  characters of a word would be a different word, so the chips carry their
  position number instead and the line above them says so. The word is still
  there: the hero is named in the legend, every transfer source is named at
  its own callout, and each chip keeps its own piece as a tooltip and in its
  accessible name.
- Controls: BLOCK chips (ALL, then 0–5) open one register — its wall lifts, the
  other five stand back, and its twelve head squares light by the share of the
  hero's attention each head spends anywhere but on itself. HEAD chips
  overrule the head rule for the open register and are unavailable until one is
  open. The open register is the same `layer` instrument C uses. OPEN A·B·C·D·E
  are real buttons that scroll to the instrument each reading came from.
- **The narrated run** (arc 5). One pass is walked at reading speed rather than
  replayed in a second: on the default sentence in real mode, 35 stops and
  1 min 48 s at 1× above 640 px and 33 stops and 1 min 45 s at or below it —
  the landing is counted one bar at a time and the phone draws six bars where
  the wider settings draw eight, so the length of the tour is a fact about the
  screen as well as about the sentence. Illustrative is 19 stops and 66 s at
  every width, because with no pass the landing is one caption rather than a
  stop per bar. No part of the drawing states that count as a constant: every
  place that speaks it reads `stages.length`, and the one caption that says
  how many bars are coming is handed the geometry's own `splashN`. Built by
  `lib/tour.js` out of the arrays instrument F already has on screen. Each stop is a line of plain words with this pass's own numbers in
  it — the rim, the fall through each block with the hero's own ‖residual‖
  either side of it, the chosen head and the share of attention it sends away
  from itself, each transfer with its weight, a silent block saying why in
  place, ln_f, the unembedding, the landing bar by bar, and the sampler's pick
  last. A stop is the whole state of the drawing rather than a change to it,
  which is what makes stepping backwards the same operation as stepping
  forwards. The docent bar over the drawing carries play/pause, step either
  way, 1×/2×/4× and the caption, and it sticks to the top of the window while
  the drawing scrolls past it, because the drawing is taller than any window
  it will be read in.
  - **The reveal costs no renders.** A stop sets five custom properties on the
    screen — how far down the light has reached, how many carriers have fired,
    how many bars are counted, whether the aperture is drawn, whether the pick
    is marked — and every mark compares its own index against them in the
    stylesheet. Measured with a MutationObserver taking EVERY record over the
    whole SVG — attributes, children and character data, with old values —
    walking all 35 stops at 1280 in real mode on the default sentence, and
    deterministic across two runs: 143 records in all. Twelve are the `class`
    attribute on the six register groups as the cue moves. The other 131 are
    the docent's ONE card moving from slot to slot: 48 `y`, 12 `x`, 9 `d` and
    10 ground/edge writes, 44 character-data writes inside its own `<text>`
    elements and 18 child changes as its line count changes. Nothing else in
    the SVG is written at all, and not one of the 9,216 wall cells is touched
    by any of it.
  - **The tour is 60 fps, and a stop costs at most one dropped frame.** Measured
    quiet, 60 s of rAF timestamps with the tour's own stop index sampled at
    every frame, real mode, 1×, two runs: 59.5 and 59.9 fps at 1280 (mean 16.80
    and 16.68 ms, p99 16.8, max 66.7 and 33.4 ms) and 59.4 and 59.9 at 390 (max
    50.1 and 33.4). Zero frames over 100 ms in any run at either width. Ambient
    as the control is 60.0 fps with zero frames over 50 ms.
  - **Clicking anything pauses the tour** and is then honoured in the ordinary
    way — the hero re-aims, the register opens, the readout answers. The tour
    waits where it was; the docent's own controls are the exception.
  - **Reduced motion is a first-class path**, not a shortened animation: no
    timer, no transitions, the same stops and the same words, walked by the
    buttons. Play opens the tour at its first stop and the steps move it.
  - The caption clips rather than reflows and its reservation is measured per
    band, one line over the worst stop on both the default sentence and a
    21-token one. Re-measured after the fix pass's wording changes, counting
    line boxes rather than scrollHeight — a clipped box's scrollHeight can
    never read below its own reservation, so scrollHeight cannot see a caption
    shorter than its box: 3 lines used of 4 at 1280, 4 of 5 at 1199 and 800,
    5 of 6 at 641, 4 of 5 at 390 (where the caption is the stop's lead alone
    rather than the whole sentence). The worst stop is `sentence` at every
    width but the phone, where it is `embed`. Every band has its spare line
    and nothing clips at any width — a fix pass had recorded 641 as using all
    six of its six, and that does not reproduce.
  - **The docent's line stands on the drawing too** (fix pass). While the tour
    plays or is stepped — reduced motion included — the current stop's LEAD
    also appears as a card beside the thing it describes, so the docent is
    pointing at what it is talking about rather than describing it from the
    top of the window. One fixed slot per kind of stop: the sentence and the
    rim beside the RIM label, a block's fall/head/transfer/silent stops on
    that block's own wall starting where its BLOCK/HEAD label's scrim ends,
    ln_f and the unembedding at the aperture, the landing at the FAR end of
    the bars (the tallest bar is the first, and a card beside it would stand
    on the one thing the stop is about). On the phone the top of the drawing
    has no clear strip — the chips, the rim label and the first block's
    callouts fill it — so the sentence and the rim take the head of the first
    wall there. The closing stop takes the landing's own slot as well — its
    first slot was the key line's own y at the left edge, which is words.
    Reserved per band by the same measurement as the caption: 3 lines used at
    the sheet, 4 in the column, 3 on the phone, so 4, 5 and 4 reserved.
    Measured over 268 stops — 35 and 33 at each of 1280, 800 and 641, and 33
    and 31 at 390, on the default sentence and on the 21-token one below —
    with a bbox sweep over EVERY `<text>` in the SVG rather than over the
    placement's own avoid list: none clipped, none outside the drawing, none
    overlapping any text at all.
    The list a card may not open over is the six KEY callouts, every
    BLOCK/HEAD label, every tensor name and window spec, the RIM label, the
    aperture plate, the landing title, the token strip, the top line that
    names the sentence, every silent register's `no transfer · self …` plate,
    the whole landing label strip (every bar's word, its percentage and the
    sampler's mark), the line saying the landing is the last word's alone, and
    the key line — plus, on the phone, its second line. Each of those boxes is
    the scrim its words stand on, and a scrim is 0.85 of the type size above
    the baseline where a glyph's bounding box reaches further, so the
    placement gives every box that much slack — 6 drawing units on the phone,
    4 elsewhere — and the near-miss ladder is a scan outward from the slot's
    own candidate in two-unit steps. The phone's card padding is 6 units
    rather than 9 to pay for the slack: the one window the phone has for the
    sentence and the rim is the head of the first wall, 190 units between the
    tensor spec above it and block 1's key callout below, and the card is 177.
- **Ambient — the sheet runs itself** (arc 5). Left alone for twenty seconds,
  with the figure intersecting the viewport, the tab in front and reduced
  motion off, a slow loop starts: a band of light sweeps down the fall, the
  walls glint where it crosses them, the carriers fire again in turn and the
  landing breathes. All of it is CSS animation on overlay elements that already
  exist. Any interaction stops it instantly and it resumes after idle again. It
  is the one thing in the picture that carries no number, and the drawing's
  closing line says so. Measured over 60 s on a quiet machine: 60.0 fps, mean
  frame 16.67 ms, p99 16.8 ms, zero frames over 50 ms at 1,280 and at 390, and
  two attribute writes inside the SVG over 54 s — both of them putting the
  pointer's own cell outline and card away, and neither of them from the loop.
  **Reading the page counts as touching it** (fix pass): the idle timer used to
  listen for a pointer press, a key and a pointer move over the figure, and a
  reader scrolling did none of the three — so the sheet could start running
  itself mid-scroll. A wheel, a scroll and a touch drag now reset the same
  clock, all three as passive listeners. Measured at 1280 in real mode with F
  in view: 30 s of continuous scrolling and ambient never starts, where the
  build before the fix had started it mid-scroll and was still running at the
  end; stop scrolling and it starts at the first poll past twenty seconds.
- **The tempo** (arc 5). Three motion studies were built for Bill to pick
  from and he ruled on 2026-09-01: the measured docent wins — every transfer and
  every landing bar gets its own stop, and the ambient loop is slow and sparse.
  Its numbers are now the drawing's only ones, in the `MOTION` block of
  `lib/tour.js`; the two losing studies and the switch that chose between them
  are gone, and there is no dev switch left on the sheet.
- **The answer appears where the click was** (fix pass). Hovering a wall cell —
  with the pointer or with the keyboard cursor — opens a small card inside the
  SVG beside it: the cell's quantised value and the byte the file stores, the
  weight it stands for as `scale · (q − zp)` with the file's own scale, its
  `[row, col]` in the whole tensor and which of the three projections that
  column falls in. Clicking a cell, a carrier, a landing ray, the no-transfer
  plate or the UNEMBED plate pins a card beside that mark with a short leader
  back to it, and the full sentence still goes to the readout row. One pin at
  a time, the next click replaces it, and Escape or a press on the screen's own
  empty air takes the card and the row down together. The wall plate's
  whole-tensor `<title>` is gone: a browser tooltip for the WHOLE tensor,
  appearing only after the pointer held still, on a wall whose every cell has
  its own answer, is what made the sheet look as though information showed up
  on some cells and not others.
  - The card prints a LEAD out of `lib/tour.js` — the first half of the same
    sentence the readout row prints in full — so the card, the row and the
    tour cannot say different things about the same mark. `cellWhy`,
    `carrierWhy` and `rayWhy` are each a lead plus a detail now, the shape
    `silentWhy` and `unembedWhy` already had.
  - Fixed box per band, words clipped into it, measured by `__cardLines()`,
    which wraps every lead the sheet can produce — all 9,216 wall cells, every
    carrier, every ray, both plates and every stop of the tour — into that
    band's own column count and takes the tallest. On the default sentence and
    on a 21-token one: 5 lines used at the sheet (70 columns), 7 in the column
    setting (45), 6 on the phone (52); reserved 6, 8 and 7. It stands on a
    scrim in the screen's own ground, is set at the legend's size in the
    legend's grey, is painted after the fall, stays inside the drawing, and
    never opens over a KEY callout or a plate's words.
  - The pointer's card is written straight to the DOM, like the cell outline
    beside it, because a hover that went through React would rebuild the fall
    sixty times a second.
- **The walls answer the keyboard** (fix pass). 184 magnitude-group paths, none
  of them focusable, and no cell element to focus even if they had been. A wall
  is one tab stop with a roving cursor inside it — six tab stops for six walls
  rather than 1,536 or 9,216. The arrows move the cursor a cell at a time, Home
  and End run to the ends of a row, Enter or Space reads the cell through the
  same `say()` the pointer's click uses, and Escape puts the cursor away. The
  cursor IS the pointer's outline — one `mr-hover` rect, written by both hands
  — so a cell reached by keyboard looks exactly like a cell under the pointer,
  and neither re-renders a wall cell.
- **Nothing on the sheet is dead** (arc 5). A carrier, a landing ray, a wall
  cell and both plates each answer a click — and Enter or Space — with plain
  words in the readout under the drawing, and the sentences come from
  `lib/tour.js`, which is also where the tour's captions come from, so the two
  cannot contradict each other. Each mark answers where the pointer actually
  is: SVG resolves a pointer by document order, and a carrier crosses every
  wall band between its source and the hero, so the carriers' hit paths are
  drawn in their own group AFTER the walls and their plates — the ink stays
  under the words, only the invisible targets moved. Before that, all 13 of 39
  sampled points along carrier 0 that fall inside a band had the wall's hit
  rect topmost and six of six clicks there answered for a wall cell. A carrier names its block, head, source, real
  weight and what the weight is; a ray names its word, its share and whether it
  is the machine's top or the sampler's pick; a wall cell turns its own byte
  back into a weight — `scale · (q − zp)` with the file's own scale — and names
  its `[row, col]` in the whole tensor and which of the three projections that
  column falls in; `no transfer · self 0.59` says what self-attention is and
  why nothing was lowered to manufacture a carrier; `UNEMBED · WTEᵀ` says the
  word table is the same one the rim uses, transposed, and that this file has
  no separate output matrix. A wall is a hit area with a crosshair cursor and
  the cell under the pointer is outlined — written straight to that one rect
  rather than through state, because a hover that went through React would
  rebuild the fall sixty times a second. An answer that names the hero comes
  down when the drawing is re-aimed.
- Every wall is a button carrying that tensor's real shape, dtype, scale, zero
  point and byte count out of `fileFacts.json`, and so is the unembedding
  aperture; clicking one prints the readout under the drawing and offers to
  open that row in instrument E. The readout row explains itself when nothing
  is chosen (fix pass): it used to say "no tensor selected — click any steel
  box", which is the language of two drawings ago, and it now names what is
  actually on this screen. Both buttons beside it say what they open and what
  would make them open, in their titles and their accessible names, and the
  second says OPEN THE INSTRUMENT rather than OPEN — : a dash is not a word,
  and a reader read the greyed pair as broken rather than as waiting. Both are
  fixed width. The row's own height is reserved per breakpoint band from the
  LONGEST sentence a click can print — a landing ray's is 380 characters, a
  carrier's 362, a wall cell's 359 — measured as line boxes by
  `__readoutLines()`, which walks every cell of all six walls, every carrier,
  every ray, both plates and the idle line and measures the longest of each
  kind against a clone of the row at the row's own width. Two lines held every
  tensor NAME, which is what the box used to be measured against, and clipped
  the answers: three lines needed at 1280, seven at 800, eleven at 641. Below
  the breakout the readout now takes the whole width and the buttons drop
  under it, the way the phone's row already worked. Used / reserved: 3-4 of 5
  at and above 1200, 4 of 5 from 800 to 1199, 5 of 6 from 641 to 799, 5-8 of 9
  from 381 to 640, 11 of 12 at 380 and below. Nothing clips at 1280, 1200,
  1199, 800, 799, 641, 640, 480, 390, 360 or 320. The plate's toggle is against what is on
  screen, so pressing it while some other answer is showing prints the plate's
  own reading rather than turning the tensor off underneath it.
- Three states, not two. A finished pass over the text in the box draws its own
  numbers. With no model the streams are the schematic — one width, one light,
  no transfers, no landing — with the grain inside them the deterministic
  stand-in instrument D prints, labelled as a stand-in and never given a width
  that claims a magnitude. A pass in flight is the same schematic with the note
  saying the pass is running; illustrative numbers are never shown under a
  real-model heading.
- The legend lives inside the screen and states every rule the drawing uses:
  the byte window and its stretch, the dimming, the filament binning, the log
  law, the chips' fallback to position numbers where a chip has room for fewer
  than three characters, the head-choice rule with the heads it picked, the
  floor under a transfer and the near-miss numbers when a block draws nothing,
  the landing's conventions, the tour and the ambient loop, and the closing
  line that nothing in the picture is a stand-in — the only marks carrying no
  number are the aperture outline, the bloom around the light, and the sweep
  that travels down the sheet while it is running itself. Its five entries have
  reserved line counts, because the numbers in it change with the sentence and
  a legend that reflowed would move the page. Each count is one line over the
  worst its own wording produces, measured by `__legendLines()` in both modes
  on the default sentence and on a 21-token one. THE TOUR used to be one line
  short below 1200 px and cut off its own last line; so did the fine print on
  the phone. The fifth entry (arc 5) and those reservations are what make the
  drawing taller than arc 4's at every breakpoint: the viewBox attribute reads
  `0 0 1166 2351.6499999999996` at the sheet against arc 4's 2,238.75,
  `0 0 1166 3187.3` in the column setting, and `0 0 1166 5406.4` at the phone
  against 4,919.
- The lens whisper of arc 3 is not part of this drawing. Instrument D presents
  the same seven depths as a table, which is where they can be read.
- `__mapCheck()` in a dev build re-runs the model and recomputes all four
  moving claims by another route — every stream's norms, every filament bin,
  every transfer weight against the attention matrix, and every landing
  probability against a softmax written out separately — and reports whether
  the pass it compared against was a fresh one. `__tourState` (arc 5, dev only)
  publishes the tour's own state the same way and for the same reason:
  whether reduced motion is on, whether the sheet is running itself,
  the stop, its kind, its caption, the reveal and the readout — so a claim
  about how long a run takes or about which stop says what can be measured
  rather than taken.

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
