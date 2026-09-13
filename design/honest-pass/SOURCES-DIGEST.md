# SOURCES DIGEST — the honest pass, 2026-09-12

Every url behind a claim mark, fetched and read by a Sonnet reader on 2026-09-12
(Dell), judged against the claim the page makes beside it. Publisher pages
(Elsevier, PNAS, Nature, PubMed) block scripted fetches with 403s and cookie
walls; those were read through NCBI eutils abstracts or PMC full-text mirrors,
which is why several say DEAD at the given url and RESOLVES at the mirror. In a
browser every given url loads. Corrections folded into the notes and the essay
the same hour are listed at the end.

[rome] STATUS: RESOLVES
  TITLE: Locating and Editing Factual Associations in GPT
  AUTHORS/YEAR/VENUE: Kevin Meng, David Bau, Alex Andonian, Yonatan Belinkov; NeurIPS 2022 (arXiv:2202.05262)
  QUOTE: "we modify feed-forward weights to update specific factual associations using Rank-One Model Editing (ROME)"
  VERDICT: PARTLY — supports layer-tracing/rank-one-weight-edit/specificity mechanics, but not the specific example given.
  NOTE: The paper never mentions "Rome" anywhere. Its running example (Fig. 1, used throughout) is "The Space Needle is located in the city of ___ → Seattle." Eiffel Tower appears only once, paired with Paris (the correct answer) in the CounterFact-dataset-construction discussion, not as an edit target.

[lens1] STATUS: RESOLVES
  TITLE: interpreting GPT: the logit lens
  AUTHORS/YEAR/VENUE: nostalgebraist; LessWrong post; Aug 31, 2020
  QUOTE: "The general trend, as one moves from earlier to later layers, is 'nonsense / not interpretable' (sometimes, in very early layers)"
  VERDICT: SUPPORTS — confirms the mechanism (apply the final unembedding to intermediate activations), frames it as the author's own found observation, and states early layers are often uninterpretable.

[lens2] STATUS: RESOLVES
  TITLE: Eliciting Latent Predictions from Transformers with the Tuned Lens
  AUTHORS/YEAR/VENUE: Nora Belrose et al.; arXiv:2303.08112, 2023
  QUOTE: "the logit lens fails to elicit interpretable predictions before layer 21"
  VERDICT: PARTLY — strongly supports early-layer bias/unreliability with concrete cases (BLOOM, OPT-125M), but "doesn't always improve smoothly with depth" is a paraphrase; the documented fact is layer/model-specific failure.

[sevenster] STATUS: DEAD at pubmed for scripts (cookie wall); RESOLVES via NCBI eutils, PMID 23413355
  TITLE: Prediction error governs pharmacologically induced amnesia for learned fear
  AUTHORS/YEAR/VENUE: Sevenster D, Beckers T, Kindt M; Science; 2013
  QUOTE: "Reconsolidation may only take place when memory reactivation involves an experience that engages new learning (prediction error)."
  VERDICT: SUPPORTS — prediction error is a necessary boundary condition for reconsolidation.
  NOTE: The abstract says "pharmacologically induced amnesia" without naming propranolol; propranolol is corroborated by secondary summaries.

[nader] STATUS: DEAD at pubmed for scripts; RESOLVES via NCBI eutils, PMID 10963596
  TITLE: Fear memories require protein synthesis in the amygdala for reconsolidation after retrieval
  AUTHORS/YEAR/VENUE: Nader K, Schafe GE, Le Doux JE; Nature, 2000;406(6797):722-6
  QUOTE: "infusion of anisomycin shortly after memory reactivation produces amnesia on later tests, regardless of whether reactivation was performed 1 or 14 days after conditioning"
  VERDICT: SUPPORTS — reminder+anisomycin causes later amnesia; anisomycin alone "left memory intact."
  NOTE: Memory ages tested were 1 day AND 14 days. The abstract gives no explicit test delay (only "later tests"). → essay says "at a later test", not "the next day".

[kindt] STATUS: DEAD at pubmed for scripts; RESOLVES via NCBI eutils, PMID 25549103
  TITLE: Disrupting Reconsolidation of Fear Memory in Humans by a Noradrenergic β-Blocker
  AUTHORS/YEAR/VENUE: Kindt M, Soeter M, Sevenster D; Journal of Visualized Experiments; 2014
  QUOTE: "After the memory reactivation we administer an oral dose of 40 mg of propranolol HCl"
  VERDICT: PARTLY — a methods/protocol article from the lab, not a fresh results paper; the timing/recall-dependent results trace to Kindt, Soeter & Vervliet, Nat Neurosci 2009. → labelled "the lab's protocol" in the note.

[loftus] STATUS: DEAD for scripts (doi → Elsevier 403); content confirmed via secondary source (simplypsychology.org)
  TITLE: Reconstruction of automobile destruction: An example of the interaction between language and memory
  AUTHORS/YEAR/VENUE: Loftus, E.F., & Palmer, J.C. (1974); Journal of Verbal Learning and Verbal Behavior, 13(5), 585–589
  QUOTE (secondary): "Participants who heard the cars had 'smashed' into each other were more likely to report seeing broken glass a week later than those who heard 'hit.'" (32% vs 14%)
  VERDICT: SUPPORTS — via a reliable secondary source; the primary is behind Elsevier's wall.

[hassabis] STATUS: DEAD at pnas.org for scripts (403); RESOLVES at PMC1773058
  TITLE: Patients with hippocampal amnesia cannot imagine new experiences
  AUTHORS/YEAR/VENUE: Hassabis D, Kumaran D, Vann SD, Maguire EA; PNAS; 2007;104(5):1726–1731
  QUOTE: "The patients' imagined experiences were strikingly deficient in spatial coherence, resulting in their constructions being fragmented and lacking in richness."
  VERDICT: SUPPORTS — n = 5 amnesic patients with bilateral hippocampal damage. → the note links the PMC full text.

[squire → maguire] STATUS: DEAD at pubmed for scripts; RESOLVES via NCBI eutils, PMID 20603137
  TITLE: Imagining fictitious and future experiences: evidence from developmental amnesia
  AUTHORS/YEAR/VENUE: Maguire EA, Vargha-Khadem F, Hassabis D; Neuropsychologia; 2010
  QUOTE: "Jon was able to richly imagine both fictitious and future experiences in a comparable manner to control participants."
  VERDICT: PARTLY — supports the claim, but this PMID is NOT a Squire paper; one patient (Jon, developmental amnesia). → the note and label now name Maguire, Vargha-Khadem & Hassabis 2010 and say "a patient".

[schacter] STATUS: DEAD for scripts (doi → Royal Society 403); RESOLVES via NCBI eutils, PMID 17395575
  TITLE: The cognitive neuroscience of constructive memory: remembering the past and imagining the future
  AUTHORS/YEAR/VENUE: Schacter DL, Addis DR; Phil Trans R Soc B; 2007;362(1481):773-786
  QUOTE: "Consistent with this constructive episodic simulation hypothesis, we consider ... evidence showing that there is considerable overlap in the psychological and neural processes involved in remembering the past and imagining the future."
  VERDICT: SUPPORTS.

[parker] STATUS: DEAD for scripts (doi → Taylor & Francis 403); RESOLVES via NCBI eutils, PMID 16517514
  TITLE: A case of unusual autobiographical remembering
  AUTHORS/YEAR/VENUE: Parker ES, Cahill L, McGaugh JL; Neurocase; 2006
  QUOTE: "Her memory is 'nonstop, uncontrollable, and automatic.'"
  VERDICT: SUPPORTS — the paper's own term is "hyperthymestic syndrome"; "burden" is not verbatim, "dominates her life" is. → the note says "dominates her life".

[leport] STATUS: RESOLVES
  TITLE: Highly Superior Autobiographical Memory: Quality and Quantity of Retention Over Time
  AUTHORS/YEAR/VENUE: LePort AKR, Stark SM, McGaugh JL, Stark CEL; Frontiers in Psychology; 2016
  QUOTE: "HSAM recall performance was superior at more remote delays, with remarkable consistency following a 1-month delay."
  VERDICT: SUPPORTS.

[patihis] STATUS: DEAD at pubmed for scripts; RESOLVES via NCBI eutils, PMID 24248358
  TITLE: False memories in highly superior autobiographical memory individuals
  AUTHORS/YEAR/VENUE: Patihis L, Frenda SJ, LePort AK, Petersen N, Nichols RM, Stark CE, McGaugh JL, Loftus EF; PNAS; 2013
  QUOTE: "In a misinformation task, HSAM participants showed higher overall false memory compared with that of controls for details in a photographic slideshow."
  VERDICT: PARTLY — equal to controls on the DRM word-list task and the plane-crash-footage task, MORE susceptible on the misinformation/slideshow task. → essay now says "as susceptible … — on one of three tests, more so".

[southwick] STATUS: DEAD at pubmed for scripts; RESOLVES via NCBI eutils, PMID 9016264
  TITLE: Consistency of memory for combat-related traumatic events in veterans of Operation Desert Storm
  AUTHORS/YEAR/VENUE: Southwick SM, Morgan CA 3rd, Nicolaou AL, Charney DS; American Journal of Psychiatry; 1997
  QUOTE: "There was a significant positive correlation between score on the Mississippi Scale for Combat-Related PTSD at 2 years and the number of responses ... changed from no at 1 month to yes at 2 years."
  VERDICT: SUPPORTS.

[teyler] STATUS: DEAD at pubmed for scripts; RESOLVES via NCBI eutils, PMID 3008780
  TITLE: The hippocampal memory indexing theory
  AUTHORS/YEAR/VENUE: Teyler TJ, DiScenna P; Behavioral Neuroscience; 1986
  QUOTE: "the role of the hippocampus is to form and retain an index of neocortical areas activated by experiential events"
  VERDICT: SUPPORTS.

[bartol] STATUS: RESOLVES
  TITLE: Nanoconnectomic upper bound on the variability of synaptic plasticity
  AUTHORS/YEAR/VENUE: Bartol TM Jr, Bromer C, Kinney J, Chirillo MA, Bourne JN, Harris KM, Sejnowski TJ; eLife; 2015
  QUOTE: "We found that there is a minimum of 26 distinguishable synaptic strengths, corresponding to storing 4.7 bits of information at each synapse."
  VERDICT: SUPPORTS — rat hippocampal area CA1 (stratum radiatum), 3 adult male rats; 449 synapses / 287 fully-contained spines reconstructed, 17 axon-coupled spine pairs used for the size-matching analysis. → the note says "seventeen such pairs, from three rats".

[rao] STATUS: DEAD at nature.com for scripts (login wall); RESOLVES via NCBI eutils, PMID 10195184
  TITLE: Predictive coding in the visual cortex: a functional interpretation of some extra-classical receptive-field effects
  AUTHORS/YEAR/VENUE: Rao RPN, Ballard DH; Nature Neuroscience; 1999;2(1):79-87
  QUOTE: "feedback connections from a higher- to a lower-order visual cortical area carry predictions of lower-level neural activities, whereas the feedforward connections carry the residual errors"
  VERDICT: SUPPORTS.

[burr] STATUS: DEAD at nature.com for scripts (login wall); RESOLVES via NCBI eutils, PMID 7935763
  TITLE: Selective suppression of the magnocellular visual pathway during saccadic eye movements
  AUTHORS/YEAR/VENUE: Burr DC, Morrone MC, Ross J; Nature; 1994;371(6497):511-3
  QUOTE: "Patterns of higher spatial frequency, and equiluminant patterns (modulated only in colour) at all spatial frequencies were not suppressed during saccades, but actually enhanced."
  VERDICT: SUPPORTS — selective, not total; colour/fine-detail patterns enhanced rather than merely spared. → the note says "not at all".

[pericolor] STATUS: RESOLVES
  TITLE: The limits of color awareness during active, real-world vision
  AUTHORS/YEAR/VENUE: Cohen MA, Botch TL, Robertson CE; PNAS; 2020
  QUOTE: "In the most extreme case, almost a third of observers failed to notice when less than 5% of the visual display was presented in color."
  VERDICT: CONTRADICTS the claim it was first cited for ("colour persists, degraded not absent") — its finding is failed AWARENESS of large peripheral desaturation. → re-cited for what it shows: the felt fullness of peripheral colour is filled in, which is the essay's own point.

[dream] STATUS: DEAD at nature.com for scripts (login wall); RESOLVES at PMC6098118
  TITLE: Smooth tracking of visual targets distinguishes lucid REM sleep dreaming and waking perception from imagination
  AUTHORS/YEAR/VENUE: LaBerge S, Baird B, Zimbardo PG; Nature Communications; 2018
  QUOTE: "the neural circuitry of smooth pursuit can be driven by a visual percept in the absence of retinal stimulation"
  VERDICT: PARTLY — an eye-tracking study of lucid dreamers, not cortical imaging. → the note describes it as eye tracking; link goes to the PMC full text.

[schrimpf] STATUS: DEAD at pnas.org for scripts (403); RESOLVES at PMC8694052
  TITLE: The neural architecture of language: Integrative modeling converges on predictive processing
  AUTHORS/YEAR/VENUE: Schrimpf M, Blank IA, Tuckute G, Kauf C, Hosseini EA, Kanwisher N, Tenenbaum JB, Fedorenko E; PNAS; 2021;118(45)
  QUOTE: "the most powerful 'transformer' models predict nearly 100% of explainable variance in neural responses to sentences"
  VERDICT: SUPPORTS — also: "Intermediate layer representations in the models are most predictive, significantly outperforming representations at the first and output layers".

[goldstein] STATUS: DEAD at nature.com for scripts (login wall); RESOLVES at PMC8904253
  TITLE: Shared computational principles for language processing in humans and deep language models
  AUTHORS/YEAR/VENUE: Goldstein A et al.; Nature Neuroscience; 2022;25(3):369-380
  QUOTE: "The decoding analysis inverts this procedure to find a mapping from neural responses, across multiple electrodes and time points, to the embedding space."
  VERDICT: SUPPORTS — both directions: encoding (embeddings → ECoG) and decoding (ECoG → embedding space, AUC 0.74 with GPT-2 embeddings).

[conneau] STATUS: RESOLVES
  TITLE: Word Translation Without Parallel Data
  AUTHORS/YEAR/VENUE: Conneau A, Lample G, Ranzato M, Denoyer L, Jégou H; ICLR 2018 (arXiv:1710.04087)
  QUOTE: "our method works very well also for distant language pairs, like English-Russian or English-Chinese"
  VERDICT: SUPPORTS.

[huh] STATUS: RESOLVES
  TITLE: The Platonic Representation Hypothesis
  AUTHORS/YEAR/VENUE: Huh M, Cheung B, Wang T, Isola P; arXiv:2405.07987; 2024
  QUOTE: "We hypothesize that this convergence is driving toward a shared statistical model of reality, akin to Plato's concept of an ideal reality."
  VERDICT: SUPPORTS — also "as vision models and language models get larger, they measure distance between datapoints in a more and more alike way."

[tracing] STATUS: RESOLVES
  TITLE: Tracing the thoughts of a large language model
  AUTHORS/YEAR/VENUE: Anthropic research page; Mar 27, 2025
  QUOTE: "Before starting the second line, it began 'thinking' of potential on-topic words that would rhyme with 'grab it'. Then, with these plans in mind, it writes a line to end with the planned word."
  VERDICT: SUPPORTS.

[adaptive] STATUS: REDIRECTS → https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost
  TITLE: Steering thinking
  AUTHORS/YEAR/VENUE: Anthropic developer docs
  QUOTE: "Claude's thinking is adaptive: the model evaluates each request and decides for itself whether to think and how much. You set an intent, optionally specify the effort, and the model allocates reasoning where it judges reasoning will help."
  VERDICT: SUPPORTS — parameter `effort` at `output_config.effort`, levels max / xhigh / high (default) / medium / low. → the note links the final url.

[introspect] STATUS: RESOLVES
  TITLE: Signs of introspection in large language models
  AUTHORS/YEAR/VENUE: Anthropic research page; Oct 29, 2025
  QUOTE: "Even using our best injection protocol, Claude Opus 4.1 only demonstrated this kind of awareness about 20% of the time."
  VERDICT: SUPPORTS — "this introspective capability is still highly unreliable and limited in scope"; the most capable models tested performed best.

[safetensors] STATUS: RESOLVES (not linked from the page in the end; the added specimen sentence and instrument E carry section 01)
  TITLE: Safetensors (docs overview)
  QUOTE: "8 bytes: N ... N bytes: a JSON UTF-8 string representing the header ... Rest of the file: byte-buffer."
  VERDICT: SUPPORTS.

[phaedrus] STATUS: RESOLVES — https://www.gutenberg.org/files/1636/1636-h/1636-h.htm
  TITLE: Phaedrus, by Plato (trans. Benjamin Jowett); Project Gutenberg eBook #1636
  QUOTE: "Her form may be described in a figure as a composite nature made up of a charioteer and a pair of winged steeds."
  VERDICT: SUPPORTS.

END OF DIGEST — 13 resolved at the given url for scripts, 16 read through mirrors; every one read.

## Corrections folded in the same hour (2026-09-12, the lane)

1. rome — no "Eiffel Tower → Rome" anywhere; the note names the paper's own Space Needle example.
2. squire — PMID 20603137 is Maguire, Vargha-Khadem & Hassabis 2010 (one patient, Jon); relabelled, and the note says "a patient".
3. pericolor — Cohen et al. 2020 shows failed awareness of peripheral desaturation; re-cited for that, which is the essay's own "filled in" point.
4. patihis — HSAM were MORE susceptible on the misinformation task; the essay sentence now says "as susceptible … — on one of three tests, more so", and the note says so.
5. dream — LaBerge et al. 2018 is eye tracking during lucid dreaming, not cortical imaging; the note says so.
6. nader — test delay not in the abstract; the essay says "at a later test" rather than "the next day".
7. kindt — PMID 25549103 is the lab's 2014 protocol article; labelled as such.
8. burr — colour patterns were enhanced, not "barely" suppressed; the note says "not at all".
9. bartol — three rats, seventeen matched pairs; the note says so.
10. adaptive — the url now serves "Steering thinking"; the note links the final url.
11. Free full texts (PMC) linked where they exist: hassabis, schrimpf, goldstein, dream.
