// Inline explainer copy for the InfoTag badges, kept here for the same reason
// the prose lives in essay.js: content separate from components.
// House style, per the spec: sentence case, plain verbs, no exclamation points,
// and any illustrative number said to be illustrative.

export const explainers = {
  file: {
    title: 'this file',
    body: 'the list below is every tensor in the model — a tensor being a named grid of numbers. the file is a header naming each grid and its shape, and then all the numbers, one after another. the big grids are stored as single bytes rather than as full decimals, with one multiplier per grid, so a weight is recovered as multiplier × (byte − zero point). 82 of the file’s 83.5 megabytes are the numbers.',
  },
  fileHeader: {
    title: 'the file, drawn to scale',
    body: 'the bar is the whole file left to right, byte for byte, in the order it stores things. the plan of the calculation comes first — 1703 steps saying what multiplies what — and everything after it is weights, with the 50,257-row word table taking nearly half of the file on its own. a piece too small to be a pixel wide is not widened to make it visible; it gets a tick above the bar instead.',
  },
  fileBlob: {
    title: 'what a byte becomes',
    body: 'in the big grids each square is one byte of the file, and the line underneath does the arithmetic: the byte, minus that grid’s zero point, times that grid’s multiplier, and the number that falls out is what the model multiplies with. the small grids are stored as full decimals instead, so there each square is one of those and the line is simply the number. either way a square is shaded by how large it is, not by whether it is positive. a row of the word table is one token, so the row number names the piece of text it holds — the lowest rows are single raw bytes and print as one replacement character. that same table is used backwards at the end of a pass to turn the answer into words, so the model does not store a second copy of it.',
  },
  fileCurve: {
    title: 'why it is bell-shaped',
    body: 'training nudges every weight a little at a time from a small random start, and what that leaves is a pile around zero with thin tails. for the big grids there is one bar per possible byte, so this curve is also the whole story of the shortcut: every weight in that grid is one of 256 values, and the bars are how often each one was used. the small grids are stored as full decimals and get a plain 64-bar curve instead — ln_f’s gain is the odd one, piled around 1.45 rather than around zero, because its job is to scale the running vector rather than to mix it.',
  },
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
    body: 'distilgpt2 scores all 50,257 tokens in its vocabulary and softmax turns those scores into shares of one budget. these are the top four real probabilities, so they do not add up to 1 — the rest of the budget is spread across every other token. which of them STEP appends depends on the decoding rule above: greedy always takes the top row, sampled draws from a wider shortlist and may take another.',
  },
  decoding: {
    title: 'decoding',
    body: 'picking a word out of the scores is a separate decision from producing the scores, and there is more than one rule for it. this mode is pinned to the simplest — take the top one — because the four numbers above it are hand-tuned to make a teaching point, and drawing at random from numbers written by hand would look like a mechanism without being one. load the real model and the choice opens up.',
  },
  decodingReal: {
    title: 'decoding',
    body: 'greedy takes the highest-scoring token every time. it is the honest default and on a six-block model it loops: once "of the" makes "tree" the top token, nothing in the rule can pick anything else, and you get the tree of the tree of the tree. sampled draws instead — the scores are flattened a little (temperature 0.8), everything outside the best 40 is thrown away, the tokens already in the sequence have their scores pushed down (a penalty of 1.3), and one draw is taken from what is left. the draw is seeded, so the same sentence gives the same continuation every time.',
  },
  lens: {
    title: 'the glass pass',
    body: 'every layer writes into one running vector, so that vector can be read part-way down the stack and asked what word it would commit to if the stack stopped there. the seven readings here are illustrative, and the last one is pinned to whatever instrument B is about to append.',
  },
  lensReal: {
    title: 'the glass pass',
    body: 'each depth is distilgpt2’s own running vector for this position, pushed through its own final layernorm and its own embedding table used backwards. that is the arithmetic the stack runs once at the end, run seven times instead — which is why the last row is not an estimate of the model’s output but literally is it.',
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
