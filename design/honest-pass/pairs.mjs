// The honest pass — every change to the essay's live text, as exact
// before/after pairs. Applied by apply-pairs.mjs; each `old` must occur
// exactly once in src/content/essay.js. Ruled by Bill 2026-09-12 ("go") on the
// shape "keep the voice, add evidence/theory/analogy marks with sources, and
// make the few hard corrections in the sentence". Astra's findings:
// openai/ASTRA-FINDINGS-FP-2026-09-05.md.
const M = (id, kind) => `<button type="button" class="claim-mark" data-claim="${id}">${kind}</button>`

export const pairs = [
  { id: 'P0-header', old: `// Do not refactor the prose.`,
    new: `// Do not refactor the prose.
// The honest pass (2026-09-12, on Bill's ruling) changed the sentences listed in
// design/honest-pass/pairs.mjs and added the <button class="claim-mark"> marks
// that open the notes in claimNotes.js; the root html stays as the founding draft.` },

  { id: 'P1-01-specimen',
    old: `For frontier models the file runs to terabytes. Nothing in it changes when the model is used.`,
    new: `For frontier models the file runs to terabytes. The small specimen this page reads is packed differently — an ONNX file, most of its grids stored as single bytes with one multiplier each — but it is the same idea: names, shapes, and one long run of numbers. Nothing in it changes when the model is used.` },

  { id: 'P2-01-rome',
    old: `You cannot point at the parameters that hold a given memory, and you cannot delete one fact from the file. The organization is not in how the numbers look.`,
    new: `Researchers can find where a fact&rsquo;s strongest traces sit and edit them, one fact at a time, with side effects; nobody can open the file and delete one cleanly. ${M('rome', 'EVIDENCE')} The organization is not in how the numbers look.` },

  { id: 'P3-02-per-token',
    old: `a single vector, thousands of numbers long, that represents the text being processed. A word enters as one vector and is multiplied through grid after grid — a hundred-plus layers — picking up meaning as it goes.`,
    new: `one vector per token, thousands of numbers long, that represents that token in the text so far. A word enters as one vector and is multiplied through grid after grid — a hundred-plus layers in a frontier model, six blocks in the small specimen drawn below — picking up meaning as it goes.` },

  { id: 'P4-03-cache',
    old: `Produce a word, append it, run the whole context through the stack again for the next word.`,
    new: `Produce a word, append it, run the context through the stack again for the next word — every token again in the small model on this page, only the new token in a production model, which keeps the old tokens&rsquo; finished work in the cache described next.` },

  { id: 'P5-04-lens',
    old: `What comes back is the next-word belief as it stood at that depth, and reading the depths in order shows a guess narrowing from noise to a word.`,
    new: `What comes back is a probe&rsquo;s reading &mdash; the guess the output head would make if handed the vector at that depth &mdash; and reading the depths in order usually, not always, shows a guess narrowing from noise to a word. ${M('lens', 'EVIDENCE')}` },

  { id: 'P6-05-reliable',
    old: `Human memory has no read-only mode.`,
    new: `Human memory has no reliable read-only mode.` },

  { id: 'P7-05-rat',
    old: `block protein synthesis in the amygdala — and the memory is gone. The same drug without the recall does nothing. The only way that result makes sense is if retrieval physically destabilizes the trace, returning it to a labile state that must be actively rebuilt to persist (Nader, Schafe &amp; LeDoux, 2000; replicated across species and memory types for a quarter century).`,
    new: `block protein synthesis in the amygdala — and at a later test the fear is gone; the rat no longer freezes to the tone. The same drug without the recall does nothing. The reading the field has mostly settled on is that retrieval physically destabilizes the trace, returning it to a labile state that must be actively rebuilt to persist (Nader, Schafe &amp; LeDoux, 2000; replicated across species and memory types for a quarter century). Not every recall opens the file — the trace comes loose when the recall carries a surprise, and old, strong memories resist — but there is no way to read one that guarantees it stays shut. ${M('reopen', 'EVIDENCE')}` },

  { id: 'P8-05-loftus',
    old: `shows a leading question recalled alongside a memory gets written back into it: ask how fast the cars were going when they <em>smashed</em>, and a week later witnesses remember broken glass that never existed.`,
    new: `shows a leading question asked while a memory is being recalled turns up in the next telling of it: ask how fast the cars were going when they <em>smashed</em>, and a week later witnesses report broken glass that never existed. ${M('rat', 'EVIDENCE')}` },

  { id: 'P9-05-consequence',
    old: `Your most-recalled memories are your most-rewritten ones. The stories you tell most often are the ones you have altered most.`,
    new: `Your most-recalled memories are your most-reopened ones, and every reopening is a chance to rewrite. The stories you tell most often are the ones you have had the most chances to alter.` },

  { id: 'P10-06-imagine',
    old: `Because memory&rsquo;s job is not record-keeping — it is prediction. The episodic machinery that recalls the past is the machinery that simulates the future; they share circuitry, and amnesiacs who cannot remember also cannot imagine forward. Prediction wants the gist`,
    new: `Because memory&rsquo;s job is not record-keeping — it is prediction. ${M('simulation', 'THEORY')} The episodic machinery that recalls the past is the machinery that simulates the future; they share circuitry, and most amnesiacs who cannot remember also struggle to imagine forward — not all, and the exceptions are still being argued over. ${M('imagine', 'EVIDENCE')} Prediction wants the gist` },

  { id: 'P11-06-hsam',
    old: `— involuntary, exhausting, every grief at original intensity. And when HSAM subjects were run through misinformation tests, they proved <em>just as susceptible to false memories as controls</em>: the trace is not higher-fidelity, there is simply more of it, rehearsed more often — which by the rewrite logic means more altered, not less. Luria&rsquo;s mnemonist S.`,
    new: `— involuntary, exhausting, old griefs arriving nearly as sharp as new ones, by their own accounts, and not all of them unhappy about it. And when HSAM subjects were run through misinformation tests, they proved <em>as susceptible to false memories as controls</em> — on one of three tests, more so: the trace is not immune to editing; there is more of it, kept far longer than most of us manage, and just as open to rewriting — which by the rewrite logic means more chances to be altered, not fewer. ${M('hsam', 'EVIDENCE')} Luria&rsquo;s mnemonist S.` },

  { id: 'P12-06-ptsd',
    old: `PTSD is arguably the opposite failure: a memory too exact, refusing the softening rewrite that healthy recall performs automatically. Perfect memory is not a superpower we lack. It is a pathology we are protected from.`,
    new: `PTSD looks like the opposite failure: a memory too vivid and too easily set off, refusing the softening that ordinary recall performs — though vivid is not the same as accurate, and trauma memories drift like any other. ${M('trauma', 'EVIDENCE')} Perfect memory is not a superpower we lack. In the few people who come close to it, it looks more like a cost than a gift.` },

  { id: 'P13-07-index',
    old: `exactly as a model&rsquo;s weights are shared across everything it can say. An individual memory is then nearly free: a sparse set of hippocampal pointers marking which pattern of cortical activity to reinstate. A dinner in Lisbon`,
    new: `exactly as a model&rsquo;s weights are shared across everything it can say. ${M('fixture', 'ANALOGY')} An individual memory is then nearly free: a sparse set of hippocampal pointers marking which pattern of cortical activity to reinstate. ${M('index', 'THEORY')} A dinner in Lisbon` },

  { id: 'P14-07-bartol',
    old: `on the order of a hundred trillion synapses, each holding roughly 4.7 bits across at least 26 distinguishable strength levels (Bartol &amp; Sejnowski, 2015), with sparse coding letting overlapping neural populations store combinatorially many patterns. But the storage question`,
    new: `on the order of a hundred trillion synapses, with sparse coding letting overlapping neural populations store combinatorially many patterns. The synapses measured most closely — a small sample from a rat&rsquo;s hippocampus — came in at about 26 distinguishable strengths, roughly 4.7 bits each (Bartol et al., 2015). ${M('synapse', 'EVIDENCE')} But the storage question` },

  { id: 'P15-08-predictive',
    old: `Feedback connections in visual cortex outnumber feedforward ones: the model generates the expected scene, and the retina&rsquo;s main contribution is the diff — prediction error. What you consciously see`,
    new: `Feedback connections in visual cortex outnumber feedforward ones, and one influential account, predictive coding, reads that wiring this way: the model generates the expected scene, and the retina&rsquo;s main contribution is the diff, the prediction error. ${M('predictive', 'THEORY')} What you consciously see` },

  { id: 'P16-08-saccade',
    old: `vision goes dark during every saccade and you perceive no gap; peripheral vision is low-resolution and nearly colorless yet feels uniformly sharp, because the sharpness is inferred rather than sensed. Dreams are the clincher — the same cortex generating full scenes with the retina contributing nothing. Memory regenerates`,
    new: `vision is partly switched off during every saccade — the eye&rsquo;s fast jumps — and you perceive no gap; peripheral vision is low in detail and weak on color yet feels uniformly sharp, because the sharpness is inferred rather than sensed. Dreams are the strongest hint — the same cortex generating full scenes with the retina contributing nothing. ${M('saccade', 'EVIDENCE')} Memory regenerates` },

  { id: 'P17-09-converge',
    old: `twenty watts versus kilowatts, always-learning versus frozen. Yet the maps of meaning converge. A simple linear transformation — one matrix — predicts brain activity in language areas from a model&rsquo;s internal vectors and vice versa, with middle layers matching cortex best.`,
    new: `twenty watts for a brain versus kilowatts for the machines a big model runs on, always-learning versus frozen. Yet the maps of meaning converge. ${M('converge', 'THEORY')} A simple linear transformation — one matrix — predicts a good part of the brain activity in language areas from a model&rsquo;s internal vectors, and less well the reverse, with middle layers matching cortex best.` },

  { id: 'P18-09-align',
    old: `the constellation has a common shape regardless of tongue or substrate.`,
    new: `the constellation has a common shape regardless of tongue or substrate. ${M('align', 'EVIDENCE')}` },

  { id: 'P19-09-modest',
    old: `The modest, correct claim: semantic geometry is a property of the world and of how language carves it. Any system that learns to predict language well is pulled toward the same shape, wet or fp16.`,
    new: `The modest claim, as far as the evidence goes: semantic geometry is a property of the world and of how language carves it, and a system that learns to predict language well is pulled some way toward the same shape, wet or fp16 — how far, and on which tasks, is still being measured.` },

  { id: 'P20-09-card-context',
    old: `'Context verbatim, append-only, no write access.',`,
    new: `'Context verbatim, append-only; only the harness outside it can trim or edit.',` },

  { id: 'P21-09-card-rereads',
    old: `'Rereads everything, every token; holds nothing.',`,
    new: `'Holds nothing between conversations — only a cache of finished parts within one.',` },

  { id: 'P22-09-card-rewritten',
    old: `'Memory rewritten at every recall; no verbatim copy anywhere.',`,
    new: `'Memory reopened at recall and rewritable; no verbatim copy anywhere.',` },

  { id: 'P23-10-planning',
    old: `and the open problem in AI is the charioteer. Today every executive function around a model is either hand-built scaffolding (planning loops, reflection passes, memory management), borrowed from older cognitive architectures like ACT-R and SOAR, or — the current stopgap — another model pass critiquing the first: the horse doing a charioteer impression. In most real work`,
    new: `and the open problem in AI is the charioteer. ${M('charioteer', 'ANALOGY')} Today nearly every executive function around a model is either hand-built scaffolding (planning loops, reflection passes, memory management), borrowed from older cognitive architectures like ACT-R and SOAR, or — the current stopgap — another model pass critiquing the first: the horse doing a charioteer impression. The models themselves show traces of planning a few words ahead — a rhyme chosen before the line that lands on it is written — but that is planning inside one pass, not steering across a task. ${M('planning', 'EVIDENCE')} In most real work` },

  { id: 'P24-10-budget',
    old: `decided by the model rather than a user-set budget.`,
    new: `decided by the model, though the user can still set a ceiling or ask for more.` },

  { id: 'P25-10-introspect',
    old: `its introspective reports are outputs of the process, not observations of it. The symmetric point`,
    new: `its introspective reports are outputs of the process far more than observations of it — experiments find a narrow, unreliable channel of real self-report, and nothing like a view of the substrate. ${M('introspect', 'EVIDENCE')} The symmetric point` },
]

// Instrument F's own overstatement (STATUS ## To do, found live 2026-09-06):
// the sheet's words, not the essay's. Applied by the builder by hand, then the
// caption and plate reservations are re-measured per the arc-5 rules.
export const instrumentF = [
  { file: 'src/lib/tour.js',
    old: ` It is what greedy decoding took — the top word every time — and it carries the amber mark.`,
    new: ` It is what greedy decoding took — the top word every time, whitespace skipped — and it carries the amber mark.` },
  { file: 'src/lib/tour.js',
    old: `— the top word every time.\``,
    new: `— the top word every time, whitespace skipped.\`` },
  { file: 'src/instruments/ForwardMap.jsx',
    old: `'is what greedy decoding took (the top word every time — no temperature, no draw)'`,
    new: `'is what greedy decoding took (the top word every time once whitespace-only pieces and the end mark are set aside — instrument B&rsquo;s own skip — no temperature, no draw)'` },
  { file: 'src/instruments/ForwardMap.jsx',
    old: `'is what greedy decoding took (the top word every time — no temperature, no top-k, no draw)'`,
    new: `'is what greedy decoding took (the top word every time once whitespace-only pieces and the end mark are set aside — instrument B&rsquo;s own skip — no temperature, no top-k, no draw)'` },
  { file: 'src/instruments/ForwardMap.jsx',
    old: `'GREEDY — THE TOP WORD, EVERY TIME'`,
    new: `'GREEDY — THE TOP WORD, WHITESPACE SKIPPED'` },
]
