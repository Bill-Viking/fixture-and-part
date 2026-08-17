# SPEC — "The Fixture and the Part" Interactive Guide

Audience for this spec: a Claude Code session (Sonnet) building in a fresh repo.
Companion file: `the-fixture-and-the-part.html` (the static essay — source of all prose, palette, and the two reference figures). Reuse its content verbatim unless noted.

## 1. Goal

Turn the static essay into an interactive explainer where the reader types real input and watches the machinery run: tokenization, the growing KV cache, and Q·K→V attention with live weights. The essay's prose stays; the figures become instruments.

One-line pitch: an engineering-drawing-styled walkthrough of transformer internals where every diagram is live.

## 2. Tech stack

- Vite + React, no UI framework, no Tailwind. Plain CSS in one file using the design tokens below.
- Deployable as a static site to GitHub Pages (`vite build`, base path configurable).
- Phase 2 only: `@huggingface/transformers` (transformers.js) running `distilgpt2` in-browser via WebGPU/WASM with `output_attentions: true` to drive visualizations with REAL attention weights. Lazy-load; the site must be fully functional without it.
- No backend. No API keys. Everything client-side.

## 3. Design tokens (non-negotiable — matches the essay)

```css
--bg:#10151C; --panel:#161D27; --panel2:#0D1218;
--steel:#5B7A99; --steel-dim:#3A4A5C;
--amber:#E8A33D; --amber-dim:#8A7A5A; --amber-bg:#241C10;
--green:#7FB069; --text:#D8E0E8; --muted:#6B7A8A; --hair:#2A3441;
```

Fonts: Space Grotesk (display), IBM Plex Sans (body), IBM Plex Mono (labels/data). Google Fonts.

Semantic color law, enforced everywhere: STEEL = frozen machinery (weights, dies, anything that never changes). AMBER = the moving part (activations, tokens in flight, values). GREEN = keys/searchable metadata. Never violate this mapping; it is the visual thesis.

Aesthetic: dark technical schematic / engineering drawing. Hairline rules, mono eyebrows, no gradients, no glassmorphism, minimal border-radius. Motion: only where it shows mechanism (a vector moving through a layer, a bar animating to its softmax weight). Respect `prefers-reduced-motion`.

## 4. Page structure

Single scrolling page, sections 01–10 mirroring the essay. Prose imported from the HTML. Three sections get live instruments replacing their static figures:

### Instrument A — Tokenizer strip (Section 02)
- Text input, default: "The engine roared and it shut down."
- On input: split into tokens (Phase 1: simple word/punct split; Phase 2: real GPT-2 BPE from transformers.js). Render as amber pills with token index and a fake-but-stable embedding preview (first 6 dims, deterministic hash of token string → values in [-2,2], monospace).
- Teaching point label: "one token → one vector."

### Instrument B — Forward-pass stepper + KV rack (Section 03)
- Controls: STEP (advance one generated token), RUN (auto-step ~800ms), RESET.
- Left: the sequence so far; the newest token amber, prior tokens dimmed.
- Right: the KV rack — one row per processed token showing a K chip (green) and V chip (amber-dim). On each step, exactly one new row appends with a brief settle animation; existing rows must visibly NOT change (this is the append-only lesson — consider a subtle "bolt" icon on rows once racked).
- Counter: "cache entries: N × L layers" and a note that new tokens scan the whole rack (render a quick sweep line over all rows on each step).
- Phase 1 generation: canned continuation for the default sentence; for arbitrary input, loop a placeholder ("…"). Phase 2: real distilgpt2 next-token sampling.

### Instrument C — Attention inspector (Section 04, the centerpiece)
- Uses the current sequence from Instrument B. Reader clicks any token → it becomes the querying token (amber outline, bold).
- Table: one row per prior token (causal mask enforced — future tokens rendered locked/grey with a tooltip "causal mask: not yet visible").
  Columns: token | K descriptor | raw Q·K score | softmax weight (animated horizontal bar, green) | V chip.
- Below: the blend line — "Σ weightᵢ × Vᵢ → folded into ⟨token⟩" with the top-weighted token named in plain English (e.g., 'it' now points at 'engine').
- Softmax visual: bars always sum to a fixed track width (the budget-of-1.0 lesson).
- Phase 1 scores: hand-tuned lookup table for the default sentence (make "it"→"engine" ≈ 0.85) plus a heuristic for arbitrary text (recency + noun-ish bonus) — label it "illustrative weights."
- Phase 2: real attention matrices; add layer (0–5) and head (0–11) selectors; label switches to "real distilgpt2 attention, layer L head H."

### Static sections
01, 05–10 keep essay prose. The Section 09 duo cards and the two callouts port as-is. Add a fixed mini-legend (steel/amber/green) that appears once instruments are on screen.

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
/src/instruments/{Tokenizer,Stepper,AttentionInspector}.jsx
/src/content/essay.js   (prose extracted from the HTML, per section)
/src/lib/{toyModel.js,realModel.js}   (Phase1 heuristics / Phase2 transformers.js)
/src/styles.css
```

Commit Phase 1 complete before starting Phase 2. Do not refactor the prose.
