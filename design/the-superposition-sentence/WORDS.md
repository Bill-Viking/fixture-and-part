# WORDS — the superposition sentence (section 01, one sentence changed, one sentence added, one claim note)

PROPOSED 2026-10-22 by the F&P lane on the Mac for Bill's go or strike, on his word that the page must take account of Nick Cammarata's essay "Neural Networks Are Already Clean" (Goodfire, 2026-10-15). Every string verbatim; the builder — here the lane itself, it is prose and a note — copies character for character. Sources: `SOURCES-DIGEST.md` in this folder.

What the sources say, in one breath: the essay argues the famous "cat and car" cell of an early vision model was a V-shape detector all along, that the mess in early networks had ordinary, fixable causes, and that in a modern language model roughly nine cells in ten have one main job; it calls itself "a working hypothesis", says "We don't know that this picture is true. It's our leading hypothesis", and promises a technical paper. It does NOT dispute that a network holds more concepts than it has cells ("more features than dimensions … I basically don't think is bad news"); it disputes arbitrary packing. Named researchers answered within days that superposition in the first sense still stands, that facts outnumber cells, and that the evidence shown is thin so far; no statement from Anthropic or Chris Olah was found. The page's own sentence used "superposition" in the loose sense — knowledge spread across the numbers with no address — which nobody in the argument disputes; the fact-editing evidence it cites still stands. So the honest change is small: drop the technical word from the plain sentence, and add one marked sentence that says the tidiness of the packing is argued.

## 1. Section 01, second paragraph — the sentence as it stands
> Everything the model knows — every fact, every style, every skill — is smeared across those numbers in superposition, with no address where any particular fact lives.

## 2. The sentence as proposed
> Everything the model knows — every fact, every style, every skill — is spread across those numbers, with no address where any particular fact lives.

## 3. One sentence added, after the fact-editing sentence and its EVIDENCE mark, before "The organization is not in how the numbers look."
> How tidily that spread is organized is argued as this page is read: for years the working picture, called superposition, was that a network packs unrelated things into the same cells because they rarely collide, and in October 2026 one of the researchers who built that picture argued that the famous evidence was misread and that most cells in a network do one job. <THEORY · clean>

## 4. The claim note (`src/content/claimNotes.js`), house style
`clean` — kind theory — title `is the file tidy?`
> the picture called superposition — a network holding more concepts than it has cells by packing them into shared directions — came from a careful 2022 toy-model study that itself said it was "very unclear what to generalize to real networks". in october 2026 nick cammarata, a co-author of the early evidence, argued in an informal essay that the famous cat-and-car cell was a V-shape detector, that early networks' mess had ordinary fixable causes, and that about nine in ten cells of a modern language model have one main job — by its own words "a working hypothesis", with a technical paper promised. he does not dispute that concepts outnumber cells. others in the field answered within days that superposition in that sense still stands, that facts outnumber cells, and that the evidence shown is thin so far. the argument is open; this page's own claim — spread across the numbers, no address — is the part nobody disputes.
- `Elhage et al. 2022 · Toy models of superposition` — https://transformer-circuits.pub/2022/toy_model/index.html
- `Cammarata 2026 · Neural networks are already clean (Goodfire)` — https://already-clean.goodfire.com/
- `Nanda 2026 · a response, crossposted to LessWrong` — https://www.lesswrong.com/posts/x4kvabkF2Jk8GLZp8/linkpost-neural-networks-are-already-clean
- `Heaven, MIT Technology Review, 2026-10-19 · "We were looking at it wrong"` — https://www.technologyreview.com/2026/10/19/1147149/we-were-looking-at-it-wrong-the-explosive-claim-thats-upended-the-ai-world/

## 5. Unchanged
- the fact-editing sentence and its `rome` mark; "The organization is not in how the numbers look. It is in how they multiply."; every other word on the page. The README's "25 claim marks" becomes 26 (14 EVIDENCE, 8 THEORY, 4 ANALOGY) — the lane updates README and the spec with the commit.

## 6. A note for the "the veins" candidate (STATUS)
That candidate rests on sparse-autoencoder features; the essay argues the SAE road was untangling a tangle that was not there, and its critics argue the opposite. Any brief for the veins reads this digest first and says which road it takes and why.
