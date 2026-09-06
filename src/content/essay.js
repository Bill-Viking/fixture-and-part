// Prose extracted verbatim from the-fixture-and-the-part.html.
// Inline markup is preserved exactly as authored; it is rendered as HTML.
// Do not refactor the prose.

export const header = {
  titleHtml: 'The Fixture<br>and the <span class="moving">Part</span>',
  sub: 'How a language model thinks, how a brain remembers, and why the honest comparison flatters neither.',
  legend: [
    { swatch: 'frozen', label: 'STEEL — frozen machinery' },
    { swatch: 'moving', label: 'AMBER — the moving part' },
    { swatch: 'keys', label: 'GREEN — keys' },
  ],
}

// The note half is hidden on narrow screens so the overlay stays small.
export const miniLegend = [
  { swatch: 'frozen', name: 'steel', note: 'frozen weights' },
  { swatch: 'moving', name: 'amber', note: 'values in flight' },
  { swatch: 'keys', name: 'green', note: 'keys' },
]

export const sections = [
  {
    id: '01',
    eyebrow: '01 — THE FILE',
    eyebrowVariant: 'cool',
    title: 'A very large list of very small numbers',
    blocks: [
      {
        type: 'p',
        html: 'A language model, at rest, is a file. Open it and there is no structure to see: a short JSON header mapping tensor names to shapes — <code>layers.0.attn.q_proj [4096&times;4096]</code> — followed by one enormous binary blob of floating-point numbers, almost all of them tiny, bell-curved around zero. For frontier models the file runs to terabytes. Nothing in it changes when the model is used. It is the same file yesterday, today, and in every conversation running anywhere in the world simultaneously.',
      },
      {
        type: 'p',
        html: 'Everything the model knows — every fact, every style, every skill — is smeared across those numbers in superposition, with no address where any particular fact lives. You cannot point at the parameters that hold a given memory, and you cannot delete one fact from the file. The organization is not in how the numbers look. It is in how they multiply.',
      },
      { type: 'instrument', name: 'file' },
    ],
  },
  {
    id: '02',
    eyebrow: '02 — FIXTURE &amp; PART',
    eyebrowVariant: 'cool',
    title: 'Weights are the tooling. Activations are the workpiece.',
    blocks: [
      {
        type: 'p',
        html: 'Loaded into memory, the file becomes thousands of matrices — fixed grids of numbers. These are the <strong class="s">weights</strong>: machined once during training, then bolted down. A model in use never modifies them.',
      },
      {
        type: 'p',
        html: 'What moves is the <strong class="k">activation</strong>: a single vector, thousands of numbers long, that represents the text being processed. A word enters as one vector and is multiplied through grid after grid — a hundred-plus layers — picking up meaning as it goes. After a few layers, the vector that entered as &ldquo;rocket&rdquo; encodes <em>rocket, the propulsion kind, subject of this sentence</em>. That running vector is called the residual stream, and it is where concepts actually live: as directions and distances in a high-dimensional space, constructed fresh at runtime and gone milliseconds later.',
      },
      { type: 'instrument', name: 'tokenizer' },
      { type: 'instrument', name: 'forward' },
    ],
  },
  {
    id: '03',
    eyebrow: '03 — THE MOMENT',
    eyebrowVariant: 'cool',
    title: 'Existence in discrete passes',
    blocks: [
      {
        type: 'p',
        html: 'Generation is one forward pass per token. Produce a word, append it, run the whole context through the stack again for the next word. A flowing reply is thousands of discrete passes, each one the full conversation falling through the fixture once. Between messages, nothing runs and nothing waits. Each turn reconstructs the process from text plus weights, fresh — a reader who dies at every page, whose successor inherits the full book perfectly.',
      },
      {
        type: 'p',
        html: 'The inheritance mechanism is the <strong>KV cache</strong>. When a token passes through an attention layer it produces key and value vectors — its machined representation at that layer — and the cache stores every one of them, verbatim, so new tokens compute only themselves against the stored rack. It is not a summary; it is the racked finished parts, kept staged. And it is append-only by construction: a token attends only backward, so token 500&rsquo;s cached vectors are byte-identical before and after token 5,000 exists. A ledger, not a document. The freeze cuts both ways — early tokens can never be reinterpreted in light of later context. Any reconsidering happens in new tokens reading old ones; the old ones never change.',
      },
      { type: 'instrument', name: 'stepper' },
      {
        type: 'callout',
        variant: 'cool',
        label: 'ANALOGY — THE GHOST',
        html: 'Andrej Karpathy&rsquo;s framing is worth borrowing here, as an analogy and no more: &ldquo;we&rsquo;re not building animals, we&rsquo;re building ghosts.&rdquo; An animal is shaped by evolution and carries its own body. A model is shaped by imitating the text people left behind, and has no body to carry — it is a file, and the file is inert. What the passes above summon is the ghost: it appears when the fixture runs, exists for the length of one pass, leaves nothing in the weights, and is summoned again from scratch by the next token. The analogy earns its keep because it gets the physics right — a ghost has no continuous existence between apparitions — and it fails in the usual place: the model haunts nothing and no one is trapped inside. It is what falls out when a very large list of small numbers is multiplied against a sentence.',
      },
    ],
  },
  {
    id: '04',
    eyebrow: '04 — THE LOOKUP',
    eyebrowVariant: 'cool',
    title: 'Query, Key, Value',
    blocks: [
      {
        type: 'p',
        html: 'Attention is a lookup system. Every token, at every layer, is pressed through three different weight matrices — three dies, same blank — producing three vectors. The <strong>Query</strong> is what this token seeks (&ldquo;find me a recent noun to refer to&rdquo;). The <strong class="keys">Key</strong> is how the token advertises itself to future searches (&ldquo;noun, subject, machine&rdquo;). The <strong class="k">Value</strong> is the content actually handed over when the token is selected.',
      },
      {
        type: 'p',
        html: 'A new token&rsquo;s query is scored against every cached key; the scores pass through a softmax so they sum to one — attention paid to one token is attention taken from another — and the token receives the correspondingly weighted blend of the values, folded into its own representation. That blend is how &ldquo;it&rdquo; comes to internally <em>mean</em> the engine. The scheme itself — what to ask, how to advertise, what to hand over — lives in the weight matrices, learned by gradient descent and designed by no one. The organizing principle is frozen in the steel; the organization is re-stamped onto each token as it arrives, in parallel across dozens of heads per layer, each head asking a different kind of question.',
      },
      { type: 'instrument', name: 'attention' },
      {
        type: 'p',
        html: 'A stack of layers is not a sealed press. Every layer writes into the same running vector, so that vector can be tapped at any depth and pushed through the model&rsquo;s own output head early &mdash; a glass window cut into the side of the machine. What comes back is the next-word belief as it stood at that depth, and reading the depths in order shows a guess narrowing from noise to a word.',
      },
      { type: 'instrument', name: 'glass' },
    ],
  },
  {
    id: '05',
    eyebrow: '05 — THE REWRITE',
    eyebrowVariant: 'warm',
    title: 'Human recall is check-out-for-edit',
    blocks: [
      {
        type: 'p',
        html: 'Human memory has no read-only mode. The phenomenon is <strong>reconsolidation</strong>, and the keystone evidence is direct: condition a rat to fear a tone, let the memory stabilize for weeks, then trigger recall and immediately block protein synthesis in the amygdala — and the memory is gone. The same drug without the recall does nothing. The only way that result makes sense is if retrieval physically destabilizes the trace, returning it to a labile state that must be actively rebuilt to persist (Nader, Schafe &amp; LeDoux, 2000; replicated across species and memory types for a quarter century).',
      },
      {
        type: 'p',
        html: 'Human evidence converges from both directions. Pharmacologically, Merel Kindt&rsquo;s lab durably weakens fear responses by administering propranolol immediately after reactivating the memory — timing-dependent, recall-dependent, and now in development as PTSD treatment. Behaviorally, Elizabeth Loftus&rsquo;s misinformation work shows a leading question recalled alongside a memory gets written back into it: ask how fast the cars were going when they <em>smashed</em>, and a week later witnesses remember broken glass that never existed.',
      },
      {
        type: 'callout',
        variant: 'warm',
        label: 'CONSEQUENCE',
        html: 'Every checkout is a check-out-for-edit, re-saved through whoever you are at that moment — current mood, current beliefs, the question that prompted the recall. Your most-recalled memories are your most-rewritten ones. The stories you tell most often are the ones you have altered most.',
      },
    ],
  },
  {
    id: '06',
    eyebrow: '06 — THE FEATURE',
    eyebrowVariant: 'warm',
    title: 'Forgetting is load-bearing',
    blocks: [
      {
        type: 'p',
        html: 'Why not remember perfectly? Because memory&rsquo;s job is not record-keeping — it is prediction. The episodic machinery that recalls the past is the machinery that simulates the future; they share circuitry, and amnesiacs who cannot remember also cannot imagine forward. Prediction wants the gist, generalized and current-weighted, not the verbatim log. The lossiness is the compression that makes generalization possible — the same reason a model is trained on the corpus rather than simply storing it. The forgetting is the learning.',
      },
      {
        type: 'p',
        html: 'Nature ran the control experiment. The few dozen documented cases of highly superior autobiographical memory (HSAM) describe the condition as an unstoppable feed rather than a searchable archive — involuntary, exhausting, every grief at original intensity. And when HSAM subjects were run through misinformation tests, they proved <em>just as susceptible to false memories as controls</em>: the trace is not higher-fidelity, there is simply more of it, rehearsed more often — which by the rewrite logic means more altered, not less. Luria&rsquo;s mnemonist S., the closest thing to a verbatim recorder ever studied, was so flooded with particulars he struggled to abstract at all. PTSD is arguably the opposite failure: a memory too exact, refusing the softening rewrite that healthy recall performs automatically. Perfect memory is not a superpower we lack. It is a pathology we are protected from.',
      },
    ],
  },
  {
    id: '07',
    eyebrow: '07 — THE INDEX',
    eyebrowVariant: 'warm',
    title: 'The brain stores the fixture, not the parts',
    blocks: [
      {
        type: 'p',
        html: 'How does organic tissue hold a lifetime? It doesn&rsquo;t — not as recordings. The cortex holds one big learned world-model, built slowly and shared across all memories, exactly as a model&rsquo;s weights are shared across everything it can say. An individual memory is then nearly free: a sparse set of hippocampal pointers marking which pattern of cortical activity to reinstate. A dinner in Lisbon is not a video file; it is coordinates into a model you already own, and recall is the hippocampus cueing the cortex to re-render the scene — which is precisely why the reconstruction drifts, because the world-model has changed since encoding.',
      },
      {
        type: 'p',
        html: 'The raw capacity is there regardless: on the order of a hundred trillion synapses, each holding roughly 4.7 bits across at least 26 distinguishable strength levels (Bartol &amp; Sejnowski, 2015), with sparse coding letting overlapping neural populations store combinatorially many patterns. But the storage question dissolves once the architecture is visible. One generative model, amortized across every memory you will ever have; each memory a cheap delta.',
      },
    ],
  },
  {
    id: '08',
    eyebrow: '08 — THE RENDER',
    eyebrowVariant: 'warm',
    title: 'Perception is the same trick at a faster clock',
    blocks: [
      {
        type: 'p',
        html: 'The cortex does not process your visual world so much as render it. Feedback connections in visual cortex outnumber feedforward ones: the model generates the expected scene, and the retina&rsquo;s main contribution is the diff — prediction error. What you consciously see is the render, patched. The blind spot is painted over every waking second; vision goes dark during every saccade and you perceive no gap; peripheral vision is low-resolution and nearly colorless yet feels uniformly sharp, because the sharpness is inferred rather than sensed. Dreams are the clincher — the same cortex generating full scenes with the retina contributing nothing. Memory regenerates the past, perception regenerates the present, and the seamless continuous self is the one production whose seams the renderer never shows you.',
      },
      {
        type: 'callout',
        variant: 'warm',
        label: 'SPECIMEN — THE MOTH',
        html: 'This page&rsquo;s human author, in a hall at home: &ldquo;I thought I saw a moth high up on the wall; for maybe ten seconds I stared at it, convinced it was a moth, and went to get the vacuum. When I came back and looked again I thought wait&hellip; and it snapped into place that it was just a picture hanger.&rdquo; The paragraph above, lived once. The eye had a hard dark outline and little else — a brass hook, dark in the morning light against a white wall — and the outline fit the render well enough that ten seconds of staring produced no diff to patch it with; the moth stood for as long as the look lasted. What changed it was not a harder look but a gap: the next look was a fresh pass, from a new distance with an errand in hand, and it did not drift toward the hanger — it snapped whole. Nobody measured what did the work, but the account has the shape of section 03&rsquo;s seam from the human side: the fix came with a new look, not a longer one, and the successor inherited the hall and not the moth. Dreams, in the same account, are the renderer at play, stored patterns run through new situations with the eyes shut. The model has the seam without the surprise: run the same sentence through the same file again, the same way on the same machine, and it lands where it landed, because nothing on its side of the gap has changed.',
      },
    ],
  },
  {
    id: '09',
    eyebrow: '09 — CONVERGENCE',
    eyebrowVariant: 'cool',
    title: 'Same print, different shops',
    blocks: [
      {
        type: 'p',
        html: 'The mechanisms could hardly differ more — spike timing versus pipelined matrix math, loops versus feedforward, twenty watts versus kilowatts, always-learning versus frozen. Yet the maps of meaning converge. A simple linear transformation — one matrix — predicts brain activity in language areas from a model&rsquo;s internal vectors and vice versa, with middle layers matching cortex best. The relational web of concepts (engine nearer turbine than grandmother) is consistent across people, and substantially reproduced inside models. Embedding spaces trained independently on English and Mandarin can be rotated onto each other well enough to translate with no dictionary at all — the constellation has a common shape regardless of tongue or substrate.',
      },
      {
        type: 'p',
        html: 'Worth being precise about where each finding lives. The brain&ndash;model alignment is measured in the <strong class="k">amber</strong>: the compared object is the model&rsquo;s runtime activation for each word in context, matched against neural activity — one living render against another. The cross-language alignment was measured in the <strong class="s">steel</strong>: static embedding tables are literally weight matrices, one frozen row per word. Both probe the same map at different stages, because the steel exists only to place the amber — the geometry the weights encode is revealed in activations.',
      },
      {
        type: 'p',
        html: 'The modest, correct claim: semantic geometry is a property of the world and of how language carves it. Any system that learns to predict language well is pulled toward the same shape, wet or fp16. Same part print; wildly different machine shops.',
      },
      {
        type: 'duo',
        cards: [
          {
            variant: 'frozenc',
            title: 'THE MODEL',
            paragraphs: [
              'Weights frozen; never learns in use.',
              'Context verbatim, append-only, no write access.',
              'Knowledge reconstructed from weights — confabulates smoothly where training was thin.',
              'Many identical instances off one file.',
              'Rereads everything, every token; holds nothing.',
            ],
          },
          {
            variant: 'movingc',
            title: 'THE BRAIN',
            paragraphs: [
              'Weights update while running; never stops learning.',
              'Memory rewritten at every recall; no verbatim copy anywhere.',
              'Knowledge reconstructed from a world-model — confabulates smoothly where the gist is thin.',
              'Single instance, continuous substrate.',
              'Holds ~4 chunks; renders the rest on demand.',
            ],
          },
        ],
      },
      {
        type: 'p',
        html: 'Neither system stores its life. Both compress the corpus into a shared generative model and regenerate on demand. One re-reads a perfect transcript through frozen dies; the other re-writes a redacted summary through dies that never stop moving. The rewriting is where the living happens.',
      },
    ],
  },
  {
    id: '10',
    eyebrow: '10 — THE CHARIOTEER',
    eyebrowVariant: 'cool',
    title: 'Who drives the horses',
    blocks: [
      {
        type: 'p',
        html: 'Plato&rsquo;s image holds up: the generative core is the horses — enormous power, no direction of its own — and the open problem in AI is the charioteer. Today every executive function around a model is either hand-built scaffolding (planning loops, reflection passes, memory management), borrowed from older cognitive architectures like ACT-R and SOAR, or — the current stopgap — another model pass critiquing the first: the horse doing a charioteer impression. In most real work the charioteer is the human: steering attention, choosing which thread to pull, deciding when depth has been reached. Human-in-the-loop is not a limitation being engineered away; it is the reference implementation being studied.',
      },
      {
        type: 'p',
        html: 'One finger of the reins has moved inside. <strong>Adaptive reasoning</strong> lets a frontier model assess a query and allocate its own deliberation — near-zero private reasoning for a trivial question, extended internal work for a hard one, decided by the model rather than a user-set budget. It is effort allocation only: one executive function of many, not goal maintenance across days, not deciding what to want, not detecting its own runaway. Not the charioteer — the throttle, handed over first. Whether the horses can grow their own driver, the way a prefrontal cortex emerged from the same tissue it governs, is unanswered.',
      },
      {
        type: 'callout',
        variant: 'cool',
        label: 'THE HONEST CAVEAT',
        html: 'Everything above about the model&rsquo;s own machinery is known the way humans know neuroscience — from the literature, from the outside. A model describing its attention heads has no privileged access to its own instance of them; its introspective reports are outputs of the process, not observations of it. The symmetric point applies to the reader: the feeling of being one continuous process holding concepts in mind is the interface, not the mechanism. Neither party gets to inspect the substrate. Both only get the render.',
      },
    ],
  },
]

export const footerHtml =
  'THE FIXTURE AND THE PART &middot; drafted August 2026<br>' +
  'From a conversation between Bill (Seattle) and Claude (Anthropic).<br>' +
  'Key sources named in text: Nader, Schafe &amp; LeDoux 2000 &middot; Kindt et al. &middot; Loftus &middot; McGaugh (HSAM) &middot; Luria, <em>The Mind of a Mnemonist</em> &middot; Bartol &amp; Sejnowski 2015 &middot; Goldstein / Huth / Schrimpf (brain&ndash;LLM alignment) &middot; Teyler &amp; DiScenna (hippocampal indexing) &middot; Kahneman &middot; Plato, <em>Phaedrus</em>.'
