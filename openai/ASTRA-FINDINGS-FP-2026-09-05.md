## 1. COLD READ

Reviewed clean `main`, `99609af`, Mac, 2026-09-05. Read the live page top-to-bottom through its browser accessibility text; real mode loaded. Three reader confusions, fourteen fact-check groups, five code findings. Both stamps and the INBOX write were sandbox-blocked; INBOX and brain push skipped as instructed. No build or install needed.

- **02** · “A word enters as one vector and is multiplied through grid after grid — a hundred-plus layers — picking up meaning as it goes.” Missing: why the instrument has six blocks and splits words. Smallest fix: identify the large-model example and this six-block, token-based specimen.
- **03** · “Produce a word, append it, run the whole context through the stack again for the next word.” Missing: how that agrees with the next paragraph’s cache. Smallest fix: distinguish full recomputation here from cached decoding elsewhere.
- **04** · “What comes back is the next-word belief as it stood at that depth, and reading the depths in order shows a guess narrowing from noise to a word.” Missing: the lens is an experimental early readout. Smallest fix: call it a probe, whose guesses need not improve steadily.

## 2. FACT-CHECK

Quoted fragments below are verbatim. Confidence concerns the correction, not the analogy’s literary value.

1. **01 — high:** “a short JSON header”; “floating-point numbers”; “in every conversation running anywhere in the world simultaneously”. These describe one format/version, not all models. This page uses structured ONNX and predominantly integer weights. [Safetensors specification](https://github.com/huggingface/safetensors).
2. **01 — high:** “You cannot point at the parameters that hold a given memory, and you cannot delete one fact from the file.” Too absolute: localized causal interventions can change factual associations; reliable, complete erasure is a harder claim. [ROME](https://arxiv.org/abs/2202.05262).
3. **02–03/09 model card — high:** “a single vector”; “Rereads everything, every token; holds nothing.” There is a vector per position; cached decoding retains K/V. “Context verbatim, append-only, no write access.” describes an idealized supplied context, not harness trimming/editing. Scope frozen weights to ordinary inference, and pass counts to ordinary autoregressive decoding. [Transformer](https://arxiv.org/abs/1706.03762); `src/lib/realModel.js:61`.
4. **04 — high:** “the next-word belief as it stood at that depth”. An untrained intermediate unembedding is a diagnostic, not a calibrated belief or guaranteed progression. [Tuned lens](https://arxiv.org/abs/2303.08112).
5. **05/09 brain card — high:** “Human memory has no read-only mode.”; “Your most-recalled memories are your most-rewritten ones.”; “Memory rewritten at every recall; no verbatim copy anywhere.” Reconsolidation has boundary conditions; recall does not necessarily destabilize or distort. Repetition does not establish increasing error. [Sevenster–Kindt](https://pubmed.ncbi.nlm.nih.gov/23413355/).
6. **05 — high:** “the memory is gone”; “gets written back into it”. Nader measured later amnesia, not directly erased storage; Loftus measured changed reports, not a physical overwrite. The rat protocol itself is accurately described, including 14-day memories and the no-recall control. [Nader](https://pubmed.ncbi.nlm.nih.gov/10963596/).
7. **06 — high:** “amnesiacs who cannot remember also cannot imagine forward.” Not universal; preserved imagination occurs with dense amnesia. “The forgetting is the learning.” is interpretation, not an established identity. [Counterexample](https://pubmed.ncbi.nlm.nih.gov/20603137/).
8. **06 — high:** “every grief at original intensity”; “the trace is not higher-fidelity”; “more altered, not less”. HSAM susceptibility to experimental false memories does not negate superior autobiographical retention or establish universal suffering. “PTSD is arguably the opposite failure: a memory too exact” confuses vividness with accuracy. [HSAM](https://pmc.ncbi.nlm.nih.gov/articles/PMC4720782/), [trauma recall](https://pubmed.ncbi.nlm.nih.gov/9016264/). “It is a pathology we are protected from.” is an unsupported general verdict.
9. **07 — high:** “one big learned world-model”; “An individual memory is then nearly free”; “each holding roughly 4.7 bits”. Indexing is a theory, not a measured storage-price model. Bartol estimated capacity in sampled rat hippocampal synapses, not every human synapse. [Indexing](https://pubmed.ncbi.nlm.nih.gov/3008780/), [Bartol](https://elifesciences.org/articles/10778).
10. **08 — high:** “the retina’s main contribution is the diff — prediction error.” Predictive coding is a theoretical account; feedback abundance alone proves neither that computation nor a universal feedback/feedforward ratio. [Rao–Ballard](https://www.nature.com/articles/nn0199_79).
11. **08 — high:** “vision goes dark during every saccade”; “nearly colorless”. Suppression is selective, not blackout; peripheral color sensitivity remains. “Dreams are the clincher” overstates evidence for this particular theory. [Saccades](https://www.nature.com/articles/371511a0), [color](https://pmc.ncbi.nlm.nih.gov/articles/PMC7306755/).
12. **09 — medium:** “and vice versa”; “Any system that learns to predict language well is pulled toward the same shape”. Predictive alignment is partial and task-dependent, not an invertible equivalence or universal law. “twenty watts versus kilowatts” needs a specified model/system boundary. [Alignment](https://doi.org/10.1073/pnas.2105646118).
13. **10 — high:** “Today every executive function around a model is either hand-built scaffolding”. Internal planning has experimental support. “rather than a user-set budget” omits user effort controls that influence adaptive thinking. [Planning](https://www.anthropic.com/research/tracing-thoughts-language-model), [adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking).
14. **10 — medium:** “its introspective reports are outputs of the process, not observations of it.” Correct as a warning against trusting self-report, too categorical as a denial of internal-state information: limited, unreliable introspective access has experimental evidence. It is not a tensor debugger. [Experiments](https://www.anthropic.com/research/introspection).

**Checked and sound within those limits:** 01–04 fixed inference weights, distributed representations, token embeddings/residual additions, causal attention, learned Q/K/V projections and normalized weighted values; 03 Karpathy’s [ghost/animal framing](https://karpathy.bearblog.dev/year-in-review-2025/) (the quotation’s exact wording remains unverified); 05 [post-reactivation propranolol](https://pubmed.ncbi.nlm.nih.gov/25549103/) and Loftus’s broken-glass result; 06 [HSAM false-memory susceptibility](https://pubmed.ncbi.nlm.nih.gov/24248358/), Luria’s reported abstraction difficulty; 07 synapse-count order, sparse distributed coding and 26-level estimate; 08 blind-spot filling and [dream imagery without retinal stimulation](https://www.nature.com/articles/s41467-018-05547-0); 09 activation/embedding distinction, [English–Chinese dictionary-free alignment](https://arxiv.org/abs/1710.04087), reconstructive recall/confabulation, shared model instances, continuous brain tissue and [approximately four attended chunks](https://memory.psych.missouri.edu/cowan.html); 10 scaffolding, adaptive effort and Plato as analogy. These do not establish the essay’s stronger philosophical conclusions.

## 3. THE MOTH CALLOUT

The reported persistence, second look and abrupt flip hold as Bill’s experience; they do not identify its neural cause.
“ten seconds of staring produced no diff to patch it with” assumes an unmeasured absence of prediction error.
Cut: “The correction got in between passes, not inside one, which is section 03’s seam from the human side: the successor inherited the hall and not the moth.”
The correction was noticed during the second look; the gap’s causal role, changed distance and discarded prior are not established.
“Dreams, in the same account, are the renderer at play, stored patterns run through new situations with the retina silent.” works as an account, not settled mechanism or literal retinal silence.
“run the same sentence through the same file again and it lands where it landed” holds for fixed token IDs, backend, decoding settings and RNG position; this sampler also uses the generation-step count.
“nothing on its side of the gap has changed” must include those conditions, not weights alone. Confidence: high on these limits.

## 4. THE CODE

- **`src/instruments/Stepper.jsx:445`** · Says racked rows never change, but `realModel.js:533` recomputes them; whole-sequence dynamic quantization can move old values (`App.jsx:307`). Misstates what B demonstrates. Smallest fix: label the rack schematic and disclose recomputation/drift.
- **`src/instruments/ForwardMap.jsx:1597`** · Always narrates `DECODING`, even after selecting greedy; reproduced live. Pass the actual decoding mode and generation-step count into F and its tour. Seed alone does not specify the draw.
- **`src/lib/realModel.js:351`** · Single-token decoding turns 😀 into IDs 47249/222 displayed as two “�” marks; reproduced live. F also identifies picks by display text (`ForwardMap.jsx:1310`). Show incomplete byte pieces explicitly, decode sequences jointly, and match picks by ID.
- **`src/App.jsx:403`** · STEP/pick trust `runReady` during the tokenizer’s 120-ms debounce, while the textbox already contains new text. A pending RUN can append an old-prompt choice to the replacement prompt. Gate pending state, pick and commit on `realBase.text === text`, as F/E already do.
- **`src/App.jsx:92`** · Instrument jumps explicitly request smooth scrolling, bypassing the reduced-motion CSS’s `auto`. Choose `auto` in JavaScript when reduced motion is requested.

**Checks:** all 9,216 wall values matched independent signed-byte decoding; block 1 [3,7] = −24 × 0.0144834239 = −0.34760217. Scale/zero-point arithmetic is sound. SVG walls are memoized/grouped; the tour uses CSS properties, not per-frame rebuilding. Keyboard handlers and reduced-motion tour stepping exist. No new contrast defect established; this was not a full raster/frame-rate audit.

## 5. THREE IDEAS

- Rank the parked novice byte-window first: the first instrument should explain what its numbers mean.
- Add source links with evidence/theory/analogy labels beside the brain comparisons.
- Add a predict-before-STEP exercise: choose a continuation, then compare it with the model’s distribution.

END OF FINDINGS
