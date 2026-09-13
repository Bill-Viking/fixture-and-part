// The notes behind the claim marks in the essay (the honest pass, 2026-09-12).
// A mark is a small green word in the prose — EVIDENCE, THEORY or ANALOGY —
// that says what kind of claim the sentence before it makes; tapping it opens
// the note here: one to three plain sentences on what the source actually
// showed, and the link. House style as explainers.js: sentence case, plain
// verbs, no exclamation points. Every url was fetched and read before it
// went in (design/honest-pass/SOURCES-DIGEST.md); keep that true when editing.
// Where a free full text exists (PMC) the link goes there rather than to the
// publisher's wall.

export const claimNotes = {
  rome: {
    kind: 'evidence',
    title: 'finding a fact in the file',
    body: 'researchers traced which layers of a GPT-2 model carry a fact — where the Space Needle stands, in their running example — and rewrote facts in place with a single edit to one layer’s weights, so the model afterwards stated the new fact as if it had always known it. the edits work one fact at a time, can bleed into neighbouring facts, and are a research tool, not a delete key.',
    sources: [
      { label: 'Meng, Bau, Andonian & Belinkov 2022 · Locating and editing factual associations in GPT', url: 'https://arxiv.org/abs/2202.05262' },
    ],
  },
  lens: {
    kind: 'evidence',
    title: 'the glass window is a probe',
    body: 'reading the running vector at an early depth through the model’s final output head is a trick called the logit lens. it was found by looking rather than built in, and on some models its early readings are poor or skewed, which is why later work fitted a small corrector per depth. instrument D shows the plain version.',
    sources: [
      { label: 'nostalgebraist 2020 · Interpreting GPT: the logit lens', url: 'https://www.lesswrong.com/posts/AcKRB8wDpdaN6v6ru/interpreting-gpt-the-logit-lens' },
      { label: 'Belrose et al. 2023 · Eliciting latent predictions from transformers with the tuned lens', url: 'https://arxiv.org/abs/2303.08112' },
    ],
  },
  reopen: {
    kind: 'evidence',
    title: 'when a memory comes loose',
    body: 'people were taught to fear a picture, then given a reminder and the drug propranolol. the fear was erased only when the reminder carried a surprise — a shock expected and not delivered — and was untouched when the reminder matched what they already knew. recall alone does not always reopen a memory, and old, strong memories resist.',
    sources: [
      { label: 'Sevenster, Beckers & Kindt 2013 · Prediction error governs pharmacologically induced amnesia for learned fear', url: 'https://pubmed.ncbi.nlm.nih.gov/23413355/' },
    ],
  },
  rat: {
    kind: 'evidence',
    title: 'what the rat study measured',
    body: 'rats trained to freeze at a tone were reminded of it — a day later or two weeks later, both were tried — and given a protein-synthesis blocker in the amygdala; tested afterwards, they no longer froze, while rats given the drug with no reminder froze as before. what was measured is behaviour at the later test, not the trace itself. Kindt’s lab runs the matching procedure in people with propranolol, and Loftus showed that a leading question changes what witnesses later report.',
    sources: [
      { label: 'Nader, Schafe & LeDoux 2000 · Fear memories require protein synthesis in the amygdala for reconsolidation after retrieval', url: 'https://pubmed.ncbi.nlm.nih.gov/10963596/' },
      { label: 'Kindt, Soeter & Sevenster 2014 · Disrupting reconsolidation of fear memory in humans by a noradrenergic β-blocker (the lab’s protocol)', url: 'https://pubmed.ncbi.nlm.nih.gov/25549103/' },
      { label: 'Loftus & Palmer 1974 · Reconstruction of automobile destruction', url: 'https://doi.org/10.1016/S0022-5371(74)80011-3' },
    ],
  },
  simulation: {
    kind: 'theory',
    title: 'memory as a simulator',
    body: 'the idea that remembering and imagining share machinery because memory’s job is to simulate what comes next has a name — the constructive episodic simulation hypothesis — and brain imaging behind it showing the same regions at work for both. it is a theory, still argued in its details.',
    sources: [
      { label: 'Schacter & Addis 2007 · The cognitive neuroscience of constructive memory: remembering the past and imagining the future', url: 'https://doi.org/10.1098/rstb.2007.2087' },
    ],
  },
  imagine: {
    kind: 'evidence',
    title: 'amnesia and imagining forward',
    body: 'five patients with hippocampal damage, asked to imagine new scenes, produced fragments with little spatial coherence; that is the finding this sentence leans on. a later study found a patient whose hippocampal damage dates from early childhood imagining fictitious and future experiences as richly as controls did, so the link is real but not universal.',
    sources: [
      { label: 'Hassabis, Kumaran, Vann & Maguire 2007 · Patients with hippocampal amnesia cannot imagine new experiences', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1773058/' },
      { label: 'Maguire, Vargha-Khadem & Hassabis 2010 · Imagining fictitious and future experiences: evidence from developmental amnesia', url: 'https://pubmed.ncbi.nlm.nih.gov/20603137/' },
    ],
  },
  hsam: {
    kind: 'evidence',
    title: 'the people who forget least',
    body: 'the first documented case described her remembering as nonstop, uncontrollable and automatic, and as something that dominates her life. a later group study found HSAM subjects keep autobiographical detail far longer than controls, and another found them as prone to false memories in the laboratory as controls on two tests and more prone on a third. both are true at once: more is kept, and what is kept is no safer from editing.',
    sources: [
      { label: 'Parker, Cahill & McGaugh 2006 · A case of unusual autobiographical remembering', url: 'https://doi.org/10.1080/13554790500473680' },
      { label: 'LePort, Stark, McGaugh & Stark 2016 · Highly superior autobiographical memory: quality and quantity of retention over time', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4720782/' },
      { label: 'Patihis et al. 2013 · False memories in highly superior autobiographical memory individuals', url: 'https://pubmed.ncbi.nlm.nih.gov/24248358/' },
    ],
  },
  trauma: {
    kind: 'evidence',
    title: 'vivid is not the same as exact',
    body: 'veterans of the 1991 Gulf war were asked about specific traumatic events one month and two years after coming home. answers changed between the two dates, and those with worse PTSD symptoms at two years had more events that they had denied at one month and recalled at two. a trauma memory can be vivid and intrusive and still drift.',
    sources: [
      { label: 'Southwick, Morgan, Nicolaou & Charney 1997 · Consistency of memory for combat-related traumatic events in veterans of Operation Desert Storm', url: 'https://pubmed.ncbi.nlm.nih.gov/9016264/' },
    ],
  },
  fixture: {
    kind: 'analogy',
    title: 'one model, many memories',
    body: 'this is the comparison the page is built on: a cortex holding one slowly learned model that every memory reuses, as a language model’s weights are reused by everything it says. it is an analogy between two theories, not a measured identity.',
    sources: [],
  },
  index: {
    kind: 'theory',
    title: 'the hippocampus as an index',
    body: 'the picture of a memory as a sparse pointer into the cortex’s slow-built model is a theory from 1986. it is still the working frame for much of the field and fits many results, but it is not a measured account of what one memory costs to store.',
    sources: [
      { label: 'Teyler & DiScenna 1986 · The hippocampal memory indexing theory', url: 'https://pubmed.ncbi.nlm.nih.gov/3008780/' },
    ],
  },
  synapse: {
    kind: 'evidence',
    title: 'where 4.7 bits comes from',
    body: 'the number comes from reconstructing a small piece of rat hippocampus in three dimensions and measuring pairs of synapses made by the same axon on the same dendrite — seventeen such pairs, from three rats. their sizes fell into about 26 distinguishable steps, which is 4.7 bits. it is a measurement of one tissue in one species, carried here to a whole human brain.',
    sources: [
      { label: 'Bartol et al. 2015 · Nanoconnectomic upper bound on the variability of synaptic plasticity', url: 'https://elifesciences.org/articles/10778' },
    ],
  },
  predictive: {
    kind: 'theory',
    title: 'predictive coding',
    body: 'the account in which higher visual areas predict what lower ones will report and only the mismatch is passed up was set out as a model in 1999 and explains a number of odd cell responses well. it remains one theory of the cortex among several, and the count of feedback wires does not by itself prove it.',
    sources: [
      { label: 'Rao & Ballard 1999 · Predictive coding in the visual cortex', url: 'https://www.nature.com/articles/nn0199_79' },
    ],
  },
  saccade: {
    kind: 'evidence',
    title: 'what a saccade switches off',
    body: 'during a saccade, sensitivity drops sharply for the coarse, fast-motion pathway and not at all for the fine, color-carrying one, so the eye is muted in flight, not dark. in a study of people looking around real scenes, most failed to notice when nearly all the color outside the centre of their gaze was drained away — the periphery’s color is thin, and its fullness is filled in. and in lucid dreamers the eyes tracked a dreamed target as smoothly as a seen one, with no image on the retina to follow.',
    sources: [
      { label: 'Burr, Morrone & Ross 1994 · Selective suppression of the magnocellular visual pathway during saccadic eye movements', url: 'https://www.nature.com/articles/371511a0' },
      { label: 'Cohen, Botch & Robertson 2020 · The limits of color awareness during active, real-world vision', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7306755/' },
      { label: 'LaBerge, Baird & Zimbardo 2018 · Smooth tracking of visual targets distinguishes lucid REM sleep dreaming and waking perception from imagination', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6098118/' },
    ],
  },
  converge: {
    kind: 'theory',
    title: 'the convergence claim',
    body: 'that systems trained on enough of the world are pulled toward one shared shape of representation is a hypothesis with a name and a paper behind it, and evidence that models grow more alike as they scale. how far it reaches, and on which tasks, is open.',
    sources: [
      { label: 'Huh, Cheung, Wang & Isola 2024 · The platonic representation hypothesis', url: 'https://arxiv.org/abs/2405.07987' },
    ],
  },
  align: {
    kind: 'evidence',
    title: 'how much the maps agree',
    body: 'a linear map from a language model’s activations predicts the recorded activity in language areas up to the ceiling the recordings’ own noise allows, on the sentences tested, with middle layers fitting best; a map the other way, from brain to model space, also works, less well. the English–Chinese rotation is a separate result on static word tables, not on a running model.',
    sources: [
      { label: 'Schrimpf et al. 2021 · The neural architecture of language: integrative modeling converges on predictive processing', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8694052/' },
      { label: 'Goldstein et al. 2022 · Shared computational principles for language processing in humans and deep language models', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8904253/' },
      { label: 'Conneau, Lample, Ranzato, Denoyer & Jégou 2018 · Word translation without parallel data', url: 'https://arxiv.org/abs/1710.04087' },
    ],
  },
  charioteer: {
    kind: 'analogy',
    title: 'Plato’s charioteer',
    body: 'the image is from Plato’s Phaedrus — reason as a driver, appetite and spirit as the horses — borrowed here for its shape and nothing more.',
    sources: [
      { label: 'Plato · Phaedrus (Jowett translation, Project Gutenberg)', url: 'https://www.gutenberg.org/files/1636/1636-h/1636-h.htm' },
    ],
  },
  planning: {
    kind: 'evidence',
    title: 'a model planning ahead',
    body: 'tracing the internals of a model writing rhyming verse found it choosing the rhyme word before writing the line that ends on it — planning inside one pass. the same lab’s adaptive thinking lets a model choose how long to reason, inside an effort level the user can still set.',
    sources: [
      { label: 'Anthropic 2025 · Tracing the thoughts of a large language model', url: 'https://www.anthropic.com/research/tracing-thoughts-language-model' },
      { label: 'Anthropic · Steering thinking (developer documentation)', url: 'https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost' },
    ],
  },
  introspect: {
    kind: 'evidence',
    title: 'what a model can notice about itself',
    body: 'when a concept was injected straight into a model’s activations, it sometimes noticed and named it before that concept showed in its output — a narrow, unreliable window of genuine self-report, about one time in five even in the most capable models tested. it is nothing like reading its own weights.',
    sources: [
      { label: 'Anthropic 2025 · Signs of introspection in large language models', url: 'https://www.anthropic.com/research/introspection' },
    ],
  },
}

export const CLAIM_KINDS = {
  evidence: 'EVIDENCE',
  theory: 'THEORY',
  analogy: 'ANALOGY',
}
