# STATUS — fixture-and-part
<!-- auto-drafted 2026-08-20 by Claude; edit freely — the board reads this file -->

## Now
"The Fixture and the Part" — an engineering-drawing-styled interactive guide to transformer internals (React/Vite), built from a static essay with three live instruments (tokenizer, forward-pass/KV stepper, attention inspector). Phase 1 is complete and working: every number is an illustrative heuristic (`src/lib/toyModel.js`), clearly labelled as such, no ML dependency. Phase 2 — swapping in real `distilgpt2` attention via transformers.js — was built on Aug 17 but its own commit says verification is incomplete.

## To do
- [x] finish verifying Phase 2's real-distilgpt2 mode — verified 2026-08-20 (build/chunking, real BPE ids, embeddings cross-checked against the published fp32 weights, real attention with working layer/head selectors, RUN pacing fix, mode toggle both ways, zero CLS, 390px, reduced-motion, failure path with muted fallback)
- [ ] decide whether Phase 2 merges into the main build or stays a separate branch/mode (Bill's call)
- [ ] deploy to GitHub Pages if it's ready to share (README documents the `VITE_BASE` env var needed); link from Confluence for Blue Origin teammates — their network must allow huggingface.co for real mode, otherwise the page stays illustrative with a muted notice

## Important
- Colour law is the visual thesis, not decoration: steel = frozen machinery (weights/dies), amber = the moving part (activations/tokens), green = keys/searchable metadata — don't swap this mapping.
- Phase 1's numbers are explicitly heuristic, not real model output — keep that labelling intact if Phase 2 stays unmerged, so the two modes are never confused.
