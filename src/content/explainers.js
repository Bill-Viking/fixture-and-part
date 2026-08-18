// Inline explainer copy for the InfoTag badges, kept here for the same reason
// the prose lives in essay.js: content separate from components.
// House style, per the spec: sentence case, plain verbs, no exclamation points,
// and any illustrative number said to be illustrative.

export const explainers = {
  token: {
    title: 'a token',
    body: 'a token is the unit the model actually reads — usually a word, a word fragment, or a single punctuation mark. the split is decided by the tokenizer before any weight matrix is touched.',
  },
  embedding: {
    title: 'the embedding numbers',
    body: 'each token becomes exactly one vector; these are its first six numbers out of thousands, and meaning lives in the direction they point. the values here are a stable hash of the token string, illustrative rather than learned.',
  },
  key: {
    title: 'the K chip',
    body: 'the key is how this token advertises itself to whatever comes later — “noun, subject, machine”. a new token scores its query against every cached key to decide what is worth reading.',
  },
  value: {
    title: 'the V chip',
    body: 'the value is the content handed over once this token is selected, and it is what gets folded into the token doing the looking. the key gets you found; the value is what you contribute.',
  },
  dies: {
    title: 'where the dies come from',
    body: 'W_q, W_k and W_v are matrices of learned numbers. gradient descent set them during training, nudging them a little for every prediction the model got wrong across the corpus, and at deployment they are frozen — identical for every token, every reader, every run. every K and every V in this rack came out of pressing a token vector through these same three matrices; the vectors move, the dies do not.',
  },
  cache: {
    title: 'cache entries',
    body: 'attention runs once per layer, so every token leaves one key and one value in each layer — the rack grows by tokens times layers, not by tokens. six layers here; a frontier model has a hundred or more.',
  },
  candidates: {
    title: 'considering next',
    body: 'a real model scores every word in its vocabulary for the next slot, then softmax turns those scores into shares of one budget: the top share is appended and the rest are discarded. the four shown here are illustrative, and on the default sentence the winning word is scripted to match the essay.',
  },
  // Real-mode variants. Same badges, same places; only the honest description
  // of where the numbers came from changes.
  tokenReal: {
    title: 'a token',
    body: 'these are real GPT-2 byte-pair pieces, the exact units distilgpt2 reads, each with the id it is known by in the model’s 50,257-entry vocabulary. ␣ marks a piece that carries a leading space, so a piece without one continues the word before it — which is why a long or unusual word arrives in several parts.',
  },
  embeddingReal: {
    title: 'the embedding numbers',
    body: 'these are the first six of the 768 numbers distilgpt2 stores for this token id, read out of its own embedding table. the id selects a row; the row is the vector. nothing about the sentence changes them — the same piece anywhere gives the same 768 numbers.',
  },
  candidatesReal: {
    title: 'considering next',
    body: 'distilgpt2 scores all 50,257 tokens in its vocabulary and softmax turns those scores into shares of one budget. these are the top four real probabilities, so they do not add up to 1 — the rest of the budget is spread across every other token. STEP appends the top one, which is greedy sampling.',
  },
  budget: {
    title: 'the budget of 1.0',
    body: 'softmax rescales the raw scores so the weights sum to exactly one. attention paid to one token is attention taken from another, which is why every bar shares one fixed track.',
  },
  mask: {
    title: 'the causal mask',
    body: 'a token can only attend backwards. text is written one token at a time, so anything at or after the querying token does not exist yet for this lookup and is locked.',
  },
}
