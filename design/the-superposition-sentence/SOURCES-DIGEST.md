# SOURCES DIGEST — the superposition sentence (section 01)

Read 2026-10-22 by a Sonnet reader for the F&P lane (session "ACT — F&P: pick the next arc", Mac), from the primary pages fetched with curl; every quoted string of 36+ characters was checked against the raw text by script. The pasted search summary Bill brought was treated as a lead only. Pirate Wires was NOT FETCHED (bot wall) and is not cited. A claim on the page may be marked only where its sentence rests on a quote below.

The pasted search summary was treated as a LEAD ONLY. Nothing below comes from it.
Method key: [curl] = fetched with curl and converted to text; [WebFetch] = WebFetch tool (returns a model's summary, not the page, so NO quotes were taken from it).
Raw page copies: /private/tmp/claude-501/-Users-bill-Projects-fixture-and-part/ee66dd2a-1099-4d4f-b97a-20d2deed0e3b/scratchpad/raw/
Brackets [ ] inside a quote are my markers, not the source's. Footnote numbers glued to words by the HTML conversion were removed. Curly apostrophes/quotes in the sources are written as straight ones here; wording is unchanged.

---------------------------------------------------------------------
## 1. PRIMARY: Cammarata's own essay
---------------------------------------------------------------------
One line: the essay itself, quoted from the author's plain-text version.

URL (page): https://already-clean.goodfire.com/   [curl, HTTP 200]
URL (text version used for quotes): https://already-clean.goodfire.com/essay.md   [curl, HTTP 200]
Read: 2026-10-22.

### 1a. Title, author, date, venue
- Title: "Neural Networks Are Already Clean"
- Author: "Nick Cammarata · Goodfire" (page header). Contributions line: "With contributions from Curt Tigges (language neuron research) and Tarun Gogineni (editing)".
- Venue: Goodfire's own site (already-clean.goodfire.com); self-described "An informal research essay and working hypothesis about neural networks". Not a journal or arXiv paper. Page header: "A working hypothesis · 65-minute read".
- Date: page text shows no visible date. The page's metadata says citation_publication_date "2026/10/15" and its own citation block says "Cammarata, N., 2026. Neural Networks Are Already Clean. Goodfire." The LessWrong linkpost is stamped "15 Oct 2026 16:31 UTC".
- Subtitle (page): "The cause of polysemanticity in early model organisms wasn't superposition, but several ordinary, mostly fixable issues. We can now understand most neurons in models up to trillions of parameters, and think the outlook for mechanistic interpretability may be far better than we thought."
- A technical companion is NOT out: "A technical companion paper will offer a more detailed account of language model neuron experiments" (The Short Version, last paragraph).

### 1b. Central claim, in his words (section "The Short Version")
- "I think I have good news about the nature of neural networks."
- "The canonical evidence of polysemanticity and superposition that convinced much of the field, including me, that networks pack concepts arbitrarily was misread. What looked like arbitrary packing was mostly a motif I'll call recursive generalization, which is much less concerning. This means we can study networks directly, instead of first untangling them. Neural networks are already clean."
- "One main result is that superposition was the wrong explanation for InceptionV1. Architectural problems made later layers overflow. Weak interpretability tools amplified these problems, making the late layers seem incoherent."
- "So the problem wasn't the presence of a second learning principle, it was just an ordinary learning failure of the first one, and it's easy to fix."
- Four-step argument, step 4: "Highly speculative: this might be most of what we need, and interpretability might be far more tractable, possibly in the near term, than we've assumed."

### 1c. What it says about the cat/car neuron (sections "Cars and Animals", "The Short Version")
- "The most famous polysemantic neuron is 4e:55 of InceptionV1, which looked like an arbitrary mixture of cats and cars."
- "In Zoom In, which I co-authored, we said outright that it "isn't responding to some commonality of cars and cat faces"."
- "I opened up the cat and car image grid I'd seen hundreds of times before and did something I'd never done: I spent a few seconds wondering what one thing this might be. Almost instantly it was obvious: it's not a cat and car neuron, it's a V-shape neuron."
- "I looked at its circuit connections: V-shaped flames, V-shaped water jets from a fireboat, V-shaped fox faces. I looked at its negative pole: an O, round where the V is pointed."
- Figure caption: "pointed things drive it and round ones push it negative, whatever the label."
- Test items named: "(for the V: shinkansens, pool tables)".
- Footnote 2 (on why the old reading went wrong): "The shared feature was the V. I think the whiskers misled us because generalization happens inside high-level patterns."
- "To see the shared pattern, you have to visualize what the neuron's inputs have in common, not the neuron on its own."
- On the separate car-into-dogs circuit: "Cars and dogs were being brought together because of shared pose. InceptionV1 has more than a hundred of these generalized pose neurons".
- Reason the old tool misled: "feature visualization — ends up being reward hacked in deeper layers."
- Section "A City vs a Knot" (under "Zooming Out"): "Through our categories it was cats and cars, and it looked like a mess; it was a V the whole time. An SAE trained on the layer fractures it the same way, splitting the V into a car feature and a cat feature."
- Section "A City vs a Knot" (under "Zooming Out"): "The V in the car and cat neuron isn't hard to see – it took me about five seconds, and most people I've shown the image grid to and say "what's the shared pattern here" see it too".

### 1d. Scope: vision only, or language models too? (his own sentences)
- Claims both. Short Version: "Modern language models are also far more interpretable than generally believed."
- "In preliminary audits of Qwen3-32B, we estimate that roughly 90% of neuron poles have one main job, often with small related offshoots; another ~7% have two related jobs; and only ~2-4% are not yet understood."
- "We found similar results in models up to trillions of parameters, like Kimi K3, which the companion paper will cover in more detail."
- "When I ran this process on modern convolutional networks, it basically worked. [...] So far it has worked in language models too, up to trillions of parameters. Those aren't close to solved due to sheer size, but I'm optimistic about scaling the process."
- Language-model section opening: "Language models are so big that it's hard to validate claims about neural mechanisms precisely, but we can check whether the simple story holds there too."
- Where the work was done (residual-stream section): "Judging whether a whole map of text makes sense is much harder than glancing at a map of images, though, which is why we did most of this work in vision."
- Same section: "We've looked at language models' residual streams less, but what we've seen fits the same story."
- "Does Scale Help or Hurt Superposition?": "We're fairly confident the image models we studied don't have superposition. The natural next question is whether a trillion-parameter model might." Then: "We're not at all sure about this, and laying out even what we've found so far would take at least another paper."
- Older LM check ("Slouching Towards Monosemanticity"): on GPT-2 XL, "Now about 70% look like roughly one thing [...] The amount of pristine ones are still low, about 5%."
- Transformer-specific limit, section "Attention" (under "Exploring Language Models"): "We've made less progress on attention than on neurons, and it's mostly outside the scope of this essay. To be honest, I'm not sure anyone understands attention well enough to confidently say that illegibility is a superposition in the sense we care about."

### 1e. What "superposition" means to him; rejects the concept or only "arbitrary packing"?
- Section "Superposition": "With superposition, unrelated things are placed together because they don't interfere."
- "Depending on where you look, superposition then means either "more features than dimensions," which even a fully monosemantic network would satisfy, because its neurons compose, or a learning principle like the one above, applied sometimes to what neurons learn and sometimes to where features go."
- "When I say superposition in this essay, I'm referring to this version, and we'll address the question of "more features than dimensions", which I basically don't think is bad news, later."
- Appendix "A Note on "Superposition"": "So we keep the word and say exactly what we mean: neurons learning unrelated things together because they rarely interfere."
- Appendix "A Note on Features and Definitions": "We focus on one meaning of superposition, arbitrary packing, because it's the one that would be really bad news, and we think much of interpretability hangs on it. We mostly set aside the sense in Toy Models, more features than dimensions, and not because it's wrong."
- Same: "If a feature means any pattern that matters to a person, which is how frontier models usually use the word, then there are more features than dimensions in every world we could wish for, including the best one."
- Section "Toy Models": "The best-studied petri dish is Toy Models of Superposition. It's careful work, the kind our field should aspire to, and we found no problems with its experiments."
- Same: "That's the toy's world, and there it does pack, just as the paper found. So I don't think we disagree with the paper about the toy's world. The question is which world real networks are in".
- Where he stands on real networks: "To my knowledge, no one has found a superposition circuit in a real network since my original one, which was an error."
- "I now think superposition should be far down the list."
- "I now think I was making superposition the null hypothesis when it should have been the last hypothesis, since it's the most radical and the least testable."
- Residual stream (continuous form): "It's a continuous version of packing: manifolds woven through each other, accepting some interference in exchange for room to store more. Ruling that out entirely may not be possible. But in practice it hasn't been a bottleneck."

### 1f. Evidence he offers: which models, which tools
Models named in the essay: InceptionV1 (original architecture retrained, plus versions "across a 300× range in size": "I trained versions of it across a 300× range in size, and it's broadly legible at every scale"); "99-100% of neurons in that last layer are easily interpretable" after ordinary architecture changes with "no change to model size or training data"; ConvNeXt (medium/large, a 7M-parameter medium ConvNeXt retrained); DINOv2; GPT-2 XL; Qwen3-32B (preliminary audits; attribution-graph test on the Anthropic "Circuit Biology" medical-diagnosis graph); Kimi K3 (trillions of parameters, "the companion paper will cover in more detail"); a "frontier language model" (unnamed) for the "pr" neuron; a "dense Qwen model" for the Colorado neuron.
Tools named: feature visualization (and its "reward hacking"), looking at a neuron's circuit connections, negative pole, steering ("what the model writes when you turn the neuron up"), ablation, attribution graphs built from neurons only, retraining with changed architectures and watching neurons grow over training, and agents: "Agents can map out neurons and circuits, build explorable microscopes and explore them, test explanations thoroughly, and track hundreds of thousands of attribution graphs." (Short Version)

### 1g. Sentences where he qualifies or limits his claim
- Section "On the Title": "We haven't fully audited every neural network, and we don't know whether that's even possible in theory."
- Same: "We're not certain. We're maybe 85% sure, but that means 85% sure that nearly everything comes from the second kind of process, which is very different from thinking 85% of mechanisms do."
- Same: "It's plausible we've underestimated recursive generalization, and that a score like that should come down. [...] We think the score is probably quite high, but it might go lower."
- Same: "So the title is imperfect in both directions. It overstates the evidence, because we haven't audited everything."
- Same: "We don't know that this picture is true. It's our leading hypothesis."
- Short Version, footnote 1 on the 90% figure: "the share of neurons with one job varies depending on how you set the threshold for counting weak activations, depth, density of sub-circuits, and what you view as "one thing"." Also: "In the sets I've looked at more closely, considering strong activations, it's closer to 97% non-arbitrary mixtures, but these are relatively small samples."
- Section "Unresolved Responses": "We think this is better described as generalization with semantic residue than arbitrary packing, but I don't fully understand these exceptions yet."
- Section "Zooming Out": "The big feature list was always a means to an end. There may be other paths that don't require them."
- Acknowledgments: "I'm grateful for feedback from Sam Zimmerman, Joshua Batson, Jack Lindsey, and Jarred Sumner" and "I'm grateful to Chris Olah, for years of mentorship and for the many ideas this essay builds on, even where it disagrees."

---------------------------------------------------------------------
## 2. MIT Technology Review
---------------------------------------------------------------------
One line: the news interview and the main source of named reactions (Potts, Hilton, Nanda, Etzioni).
URL: https://www.technologyreview.com/2026/10/19/1147149/we-were-looking-at-it-wrong-the-explosive-claim-thats-upended-the-ai-world/   Read 2026-10-22.
Method: [WebFetch] returned only a summary (no quotes taken from it); text below is from [curl, HTTP 200].
Headline: "We were looking at it wrong": The explosive claim that's upended the AI world. Standfirst: "An exclusive interview with Nick Cammarata, the researcher whose 26,000-word viral blog post has AI safety folks celebrating." Byline: Will Douglas Heaven. Date: October 19, 2026.

### 2a. How it describes the claim
- "Cammarata's claim is that LLMs might in fact be far easier to understand—and thus to monitor and control—than people previously thought. If true (and we'll come back to that), it's a huge deal."
- "The phenomenon became known as superposition: Models folded unrelated concepts into single neurons. The upshot was clear: When you looked inside a model, what you saw was a vast, tangled knot."
- "It turns out that the image-recognition model was packing cars and cats into the same place because pictures of both those things often feature a prominent shape that looks like a V: the face of a cat; the front of a car seen from the side."
- Cammarata quoted: "I was looking at the same images; there was no technical change". Also: "It probably took me five seconds."
- "Cammarata is not saying that he yet fully gets how LLMs (or any models) work. Not even close. He is saying that he thinks full understanding is at least possible."
- On Olah (background only, no quote from him): "The work was led by Chris Olah, who went on to cofound Anthropic, where he now leads the firm's interpretability research."

### 2b. Quoted responses from other researchers
- Chris Potts, Stanford: "What Cammarata has shared is little more than a hunch, says Chris Potts at Stanford University [...] "As far as I can tell, nothing about this blog post makes the problems any easier," he says." Later: ""I appreciate that he looked at thousands of examples, but even a large number here is not a substitute for rigorous evaluation," says Stanford University's Potts."
- Jacob Hilton, Alignment Research Center: "In a series of posts on X, Hilton notes that researchers understand less than 0.01% of the inner workings of top-tier LLMs. "I always appreciate Nick [Cammarata]'s boundless optimism when we hang out, but unfortunately this is giving the public an unrealistic picture of the state of the field," he wrote. "For a full understanding, we need to go beyond neurons, and explain how they connect together to form circuits. How is this going? If we are aiming for a full understanding, things are not looking good!""
- Neel Nanda, Google DeepMind: ""This is interesting work, but I don't think it's a significant update to the big picture of interpretability," he wrote on X." And: ""I do not agree with some people's grander inferences like that this is substantial progress towards ambitious reverse engineering [or] solving interpretability," he wrote."
- Oren Etzioni: "(Oren Etzioni, a computer scientist and former technical director at the Allen Institute for AI, points out that Olah and Cammarata's initial work on Inception v1 rejected a description of neurons put forward by Geoffrey Hinton and others in 1986. Cammarata's new viewpoint takes us full circle, says Etzioni: "What's new in 2026 is that he now accepts it. That's a recapitulation acknowledging a 40-year-old theory."")
- Supportive, unnamed in text: ""I think this may be remembered as a major moment in scientific history," one AI researcher posted on X" and "Another called it "the most important AI paper of the year.""
- Chris Olah and Anthropic: NOT QUOTED anywhere in the article (I read the full text).

### 2c. How contested
- "Not everyone is convinced, however."
- "Cammarata and his colleagues have started looking at modern LLMs and plan to publish the technical results of that work soon. A lot of researchers are looking forward to seeing those details."
- Cammarata himself: ""It's not infinitely good news; it's not everything solved," he says. "There's a bunch of open questions around, like how much the combinations of neurons matter versus just one at a time.""
- "Cammarata admits that a lot of people have taken what he said too far".

---------------------------------------------------------------------
## 3. Pirate Wires
---------------------------------------------------------------------
NOT FETCHED.
URL: https://www.piratewires.com/p/did-this-ai-research-breakthrough
Tried 2026-10-22: WebFetch -> HTTP 429 (twice); curl with two different browser user-agents -> HTTP 429, body is a "Vercel Security Checkpoint" page ("We're verifying your browser"), i.e. a bot-detection wall. I did not try to get past it. Wayback copy (web.archive.org) -> 404. A web search for the headline did not surface the piece. No quote from Pirate Wires is given anywhere in this file.

---------------------------------------------------------------------
## 4. Toy Models of Superposition (Elhage et al., 2022)
---------------------------------------------------------------------
One line: the original definition of superposition and the stated reason a model would do it.
URL: https://transformer-circuits.pub/2022/toy_model/index.html   [curl, HTTP 200]   Read 2026-10-22.
Authors line on page: "Nelson Elhage∗, Tristan Hume∗, Catherine Olsson∗, Nicholas Schiefer∗, Tom Henighan, Shauna Kravec, Zac Hatfield-Dodds, Robert Lasenby, Dawn Drain, Carol Chen, Roger Grosse, Sam McCandlish, Jared Kaplan, Dario Amodei, Martin Wattenberg∗,Christopher Olah‡". Affiliations: "Anthropic, Harvard". "Published Sept 14, 2022".

### 4a. Abstract (definition)
"In this paper, we use toy models — small ReLU networks trained on synthetic data with sparse input features — to investigate how and when models represent more features than they have dimensions. We call this phenomenon superposition. When features are sparse, superposition allows compression beyond what a linear model would do, at the cost of "interference" that requires nonlinear filtering." [the page's HTML puts a stray space before the period after "superposition"; removed here]
The paragraph before it: "Empirically, in models we have studied, some of the neurons do cleanly map to features. But it isn't always the case that features correspond so cleanly to neurons, especially in large language models where it actually seems rare for neurons to correspond to clean features."

### 4b. Why a model would do it (section "Definitions and Motivation: Features, Directions, and Superposition")
"Concretely, in the superposition hypothesis, features are represented as almost-orthogonal directions in the vector space of neuron outputs. Since the features are only almost-orthogonal, one feature activating looks like other features slightly activating. Tolerating this "noise" or "interference" comes at a cost. But for neural networks with highly sparse features, this cost may be outweighed by the benefit of being able to represent more features!"

### 4c. The paper's own caution on real networks (section "Key Results From Our Toy Models")
"Our toy models are simple ReLU networks, so it seems fair to say that neural networks exhibit these properties in at least some regimes, but it's very unclear what to generalize to real networks."

---------------------------------------------------------------------
## 5. Published responses (searched 2026-10-22)
---------------------------------------------------------------------
Result: no statement from Anthropic, from Chris Olah, or from OpenAI as a company was found. Details at 5e. Named individual researchers did respond; quotes follow. Items marked "via Zvi" are second-hand: the original X posts were NOT FETCHED.

### 5a. Neel Nanda (his own crosspost, first-hand text)
URL: https://www.lesswrong.com/posts/x4kvabkF2Jk8GLZp8/linkpost-neural-networks-are-already-clean   (read via the mirror https://www.greaterwrong.com/posts/x4kvabkF2Jk8GLZp8/linkpost-neural-networks-are-already-clean [curl, HTTP 200]). Comment stamped "Neel Nanda 16 Oct 2026 0:54 UTC", opens "Crossposting from my Twitter". The original tweet was NOT FETCHED.
Concedes:
- "I'm on board with the broad idea of doing exploratory interpretability with neurons, e.g. neuron-based attribution graphs, for pragmatic problems like why did a model do a sketchy thing? I think this work provides some reasonable evidence, in addition to good earlier work from Transluce, that this might actually work for practical purposes, and has some advantages over the standard alternatives like SAEs/transcoders."
- "It's also plausible that the most important concepts are likely to correspond to a neuron (or a handful), which would be great, and may suffice for practical purposes!"
- "And kudos to Nick for updating a bunch of his historical vision work! Revisiting old results with modern tools and more rigour seems great."
- "Most importantly, it seems highly likely to be true that the model can represent more concepts in the residual stream than it has dimensions, ie representational superposition, which I think the authors agree with me on."
Disputes:
- "This is interesting work, but I don't think it's a significant update to the big picture of interpretability."
- "I do not agree with some people's grander inferences like that this is substantial progress towards ambitious reverse engineering, solving interpretability etc."
- "I still think superposition is real and this work doesn't really affect my cruxes."
- "For neuron/computational superposition, it seems to me like language models have far more facts and memorized things in them than they have neurons. And that superposition is an efficient way to pack in more facts than you have neurons by representing them as linear combinations of neurons, especially for arbitrary unstructured values. Facts/memorized content is largely an unstructured database of key-value pairs IMO and I don't see how this is compatible with a monosemantic view of neurons."
- "I expect that weak neuron activations contain lots of semantic superposition-y info, which, if ablated, would meaningfully damage network performance. As I understand the work, it does not properly address what's going on with weak neuron activations in LLMs (I am skeptical of how much vision results will transfer, eg I expect small image models memorise far less)."
- "(though IMO the post defines monosemantic too loosely, I think I'd call a fair few of those polysemantic)".

### 5b. StefanHex (LessWrong comment on the same linkpost)
Same URL as 5a. Stamped "StefanHex 18 Oct 2026 13:51 UTC", opens "Crossposting from my Shortform". Affiliation is not stated on the page; none is claimed here.
Concedes:
- "Neurons that we previously thought were polysemantic (multiple meanings, e.g. cars and dogs) are actually monosemantic (single meaning, e.g. V shaped pictures)."
- "I like the essay's "recursive generalization" hypothesis (albeit I find the name confusing)."
Disputes:
- "I don't believe the optimistic version that I'd term "neurons is all we need". I expect the neuron basis to be not good enough for understanding LLMs, e.g. I expect that LLM computation will be distributed across neurons, and I still think the superposition* hypothesis is true more likely that not."
- "LLMs still seem to perform more independent computations (incl. fact lookups) than they have neurons; I don't think there's a way to implement this with only monosemantic neurons."
- "I find the evidence against superposition less convincing because many experiments are doing extreme compressions (retraining a layer down to 10 neurons), and take the absence of superposition as evidence against superposition in realistic settings."
- Footnote: "Representation in Superposition (a la Elhage et al. 2022 [...]) and Computation in Superposition (a la Hänni et al. 2024 [...]) are different things".

### 5c. The Decoder (reporter's summary of the Nanda/Cammarata definitional split)
URL: https://the-decoder.com/is-ai-interpretability-close-to-a-breakthrough-a-new-essay-has-researchers-divided/   [curl, HTTP 200]   Oct 16, 2026, Maximilian Schreiner. One line: secondary report; the passage below is the reporter's gloss, not a researcher's quote.
"Part of the dispute comes down to definitions: Cammarata has no problem with models representing more concepts than they have dimensions, and Nanda sees him as agreeing on that point. What Cammarata disputes is that networks arbitrarily pack completely unrelated things together."

### 5d. Zvi Mowshowitz, "I Can See Everything" (aggregates reactions; all quotes below are via Zvi)
URL: https://thezvi.substack.com/p/i-can-see-everything   [curl, HTTP 200]   Oct 19, 2026. One line: secondary roundup quoting X posts; originals NOT FETCHED.
- Jake Mendel (affiliation not given in the post): "there are v few empirical results. Unfortunately interp has a long history of significantly overclaiming how interpretable their findings are (SAEs, early circuits having poor causal scrubbing scores etc) so I'm not updating much at all on the evidence he's already shown." And: "I think it's not that big news for me even if true because superposition in something like the average case wasn't my main crux to thinking interpretability is tractable."
- Leo Gao (labelled OpenAI in the post): "this is cool work, but i think people are overupdating on how optimistic to be about interp. in particular, we need to more rigorously evaluate explanations, rather than just going off vibes. imo if you can't simulate a neuron you haven't really explained it."
- Samuel Albanie (labelled Google DeepMind): "on base rates, I'm a little skeptical of big positive updates on mech interp."
- Joshua Achiam (appears under Zvi's "Anti-Hype" heading; no affiliation given in the quote): "A lot of people on the timeline today seem to be updating a lot over this - my own personal update is very small."
- Liv Gorton: Zvi's PARAPHRASE only, not a quote: "Liv Gorton argues that Nick misunderstands superposition. Superposition is, to Liv, a long-standing, well-defined claim that there are more features in a layer than dimension, via almost orthogonal directions, which is still true." Cammarata's reply as quoted by Zvi: "i found myself in situations where i feel like i understood the network pretty well, what was happening was generally simple in a given region, and most of the struggle was trying to convert it to a hypothetical feature ontology with no way to measure it."
- Informal counter-test (Brangus, not a named lab researcher; unverified): "Tornado's Python HTTP client code, just as hard." for the essay's Qwen3 Colorado neuron. roon (labelled OpenAI): "this is definitely "polysemantic"" and "that is still a much better interp world than we lived in last week".

### 5e. Searched and NOT found
- No post by Chris Olah and no Anthropic statement on the essay were found in four searches (queries on Olah, Anthropic, "already clean" response, Nanda).
- https://transformer-circuits.pub/ (Anthropic's interpretability index) [curl, HTTP 200] read 2026-10-22: most recent dated entries on the index are "August 2026"; nothing dated October 2026.
- Google DeepMind and OpenAI have no company statement found; only individual posts above.
- A Goodfire statement exists second-hand: "For years, neural networks looked inscrutable, like tangled knots that needed to be unwound. We no longer think that's the case." (via Zvi, 5d).

---------------------------------------------------------------------
## 6. Meng et al. 2022, ROME
---------------------------------------------------------------------
One line: the abstract carrying the "mid-layer feed-forward modules" finding.
URL: https://arxiv.org/abs/2202.05262   [curl, HTTP 200]   Read 2026-10-22.
Title: "Locating and Editing Factual Associations in GPT". Authors: Kevin Meng, David Bau, Alex Andonian, Yonatan Belinkov. "Submitted on 10 Feb 2022 (v1), last revised 13 Jan 2023 (this version, v5)". Comments: "NeurIPS 2022."
Abstract sentences:
- "We analyze the storage and recall of factual associations in autoregressive transformer language models, finding evidence that these associations correspond to localized, directly-editable computations."
- "This reveals a distinct set of steps in middle-layer feed-forward modules that mediate factual predictions while processing subject tokens."
- "Our results confirm an important role for mid-layer feed-forward modules in storing factual associations and suggest that direct manipulation of computational mechanisms may be a feasible approach for model editing."
Check on the essay: a text search of essay.md for "ROME", "Meng", "Locating and Editing" and "2202.05262" returned 0 hits. The essay's prior-work list does cite Geva et al., "Transformer Feed-Forward Layers Are Key-Value Memories" (arXiv 2012.14913) and Dai et al., "Knowledge Neurons in Pretrained Transformers" (arXiv 2104.08696).

---------------------------------------------------------------------
## 7. Not fetched / not verified (summary)
---------------------------------------------------------------------
- Pirate Wires article: NOT FETCHED (bot-check wall, HTTP 429).
- Original X posts by Nanda, Hilton, Mendel, Gao, Albanie, Achiam, Gorton, Roon, Cammarata's replies: NOT FETCHED. Nanda's text is first-hand via his own LessWrong crosspost; the others are via Zvi or the TR article.
- Goodfire technical companion paper: not published as of the read; not fetched.
- Toy Models on arXiv (2209.10652): not fetched; quotes are from the transformer-circuits.pub page.
- Hilton's statement in TR is the reporter's paraphrase ("researchers understand less than 0.01%"); the quoted part is the sentence beginning "I always appreciate".
