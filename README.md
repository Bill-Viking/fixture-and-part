# The Fixture and the Part — interactive guide

An engineering-drawing-styled walkthrough of transformer internals, built from
the static essay in `the-fixture-and-the-part.html`. The prose is reused
verbatim; three of the figures are live instruments.

Spec: `interactive-guide-spec.md`.

## Status

Phases 1, 2, 3A and instrument E are merged and deployed: the illustrative
build, real `distilgpt2` running in the browser behind a load button, the glass
pass (instrument D), and the file itself (instrument E). The light-theme pass —
the white page ground, the role-named tokens and the plain-words rewrite — is
on the `paper` branch.

The page works with no model loaded; in that state every number outside
instrument E is an illustrative heuristic from `src/lib/toyModel.js` and is
labelled as such. Instrument E has no illustrative mode: its numbers are read
from the real model file either way, ahead of time or live.

## Run

```
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
npm run preview
```

## Deploying to GitHub Pages

`vite.config.js` reads the base path from `VITE_BASE`:

```
VITE_BASE=/<repo-name>/ npm run build
```

Leading and trailing slashes are both required. For a user/org Pages site the
default base of `/` is correct and no env var is needed.

## Layout

```
index.html
src/main.jsx
src/App.jsx                        section shell + shared instrument state
src/content/essay.js               all prose, per section, verbatim
src/content/explainers.js          the copy behind the "?" badges
src/content/fileFacts.json         the model file, read ahead of time
src/instruments/FileView.jsx       E — the file                     (section 01)
src/instruments/Tokenizer.jsx      A — tokenizer strip              (section 02)
src/instruments/Stepper.jsx        B — forward pass + KV rack       (section 03)
src/instruments/AttentionInspector.jsx
                                   C — attention inspector          (section 04)
src/instruments/GlassPass.jsx      D — residual stream + logit lens (section 04)
src/components/                    LoadNote, ModeControl, InfoTag, TeachPair,
                                   KVInspector, ReadingLine
src/lib/toyModel.js                Phase 1 heuristics
src/lib/realModel.js               transformers.js and distilgpt2, imported
                                   only when the reader asks for the real model
src/lib/onnxScan.js                the ONNX file, parsed — no DOM and no cache
                                   in it, so the same code runs in Node and in
                                   the worker
src/lib/modelBytesWorker.js        the one worker: the logit lens for D, and
                                   the manifest, windows and histograms for E
src/lib/workerHost.js              owns the worker handle, routes its replies
src/lib/logitLens.js               D's main-thread client
src/lib/fileBytes.js               E's main-thread client
src/lib/loadProgress.js            one wording for the download's progress
scripts/read-model-file.mjs        writes src/content/fileFacts.json
src/styles.css                     design tokens + all styling
```

Instruments A, B, C and D share one sequence, lifted into `App.jsx`: text
typed into A is tokenized, B appends generated tokens to it, C queries
whatever that sequence currently is, and D reads the stack at one position of
it. B, C and D each say which sentence they are reading, in one reserved line
at the top of the instrument, because A's input box is two or three sections
above them by the time they are on screen.

E shares none of that sequence. It reads the file the other four run on. What
it takes from the page is whether the model has arrived in the browser yet, and
— so that it can answer the reader who changed the text and expected the file
to change with it — the text itself and the key of the run the model has
completed over it.

There is one worker, not two. D's lens and E's reads both want the same 83 MB
of model file, and a second worker would mean a second copy of it.

## Reading the model file

Instrument E shows the real `decoder_model_quantized.onnx` — the same file the
page downloads for real mode — and nothing on it is illustrative. So that it
can show it to a reader who has not downloaded anything,
`scripts/read-model-file.mjs` reads the file ahead of time and writes
`src/content/fileFacts.json`: every initializer with its dtype, shape, byte
length and absolute offset; a byte-exact distribution of each of them; and a
window of raw values out of every one — 24 rows by 64 columns for each of the
26 quantized weights, and the first 64 values of each of the 50 f32 norms and
biases. Provenance is recorded with it
— the URL, the sha256 and the date — and the script refuses to write facts
about a file that hashes to something else.

```
node scripts/read-model-file.mjs                     # downloads the file
node scripts/read-model-file.mjs --file model.onnx   # reads a local copy
node scripts/read-model-file.mjs --allow-new-sha     # the upload has changed
```

The JSON is committed, and imported dynamically so that it is its own chunk
rather than part of the initial bundle. Once the reader loads the real model
the worker re-reads all of it out of the copy in the browser, and the panel
says whether the two agree — fingerprint included.

It goes back a second time. When the reader changes the sentence in instrument
A and the model runs on the new one, instrument E hashes the whole file again
and says what it found: the reader has just watched every other instrument
change and is entitled to know, at that moment, that this one did not. The
claim is a reading rather than a memory, which is why `readSha` in
`src/lib/fileBytes.js` is the one call in that module that is not cached.

## Design

The page is a white page ground with ink drawn on it. Dense fields of data —
instrument B's KV rack, instrument C's lookup table, instrument D's lens rows,
instrument E's byte window — are set into it on dark panels, the way a manual
sets a code block into a page. Everything else is ink and role colour on card.

The card is one twentieth of a stop off the page (`#FFFFFF` on `#F4F5F7`), so
nothing on this page may be identified by its fill: every card, callout, chip
and frame carries a drawn edge. Full token table and the rules that go with it:
`interactive-guide-spec.md` §3.

## Colour law

Three roles, and the tokens are named for the roles rather than for the colours
filling them, because the colours have now been repainted twice and the roles
have not:

- `--frozen` (the steel) is frozen machinery — weights, dies, anything that
  never changes.
- `--moving` (the amber) is the moving part — activations, tokens in flight,
  values.
- `--keys` (the green) is keys and searchable metadata.

This mapping is the visual thesis — do not swap it. `--alert` (red) is not one
of the roles; it is errors and warnings, used sparingly. The page's legend and
the essay's prose both call them the steel, the amber and the green; keep the
two in step.

Three rules follow from the ground being light. Yellow is a fill and never
body-size text on the page ground, so anything that has to be read in the
moving-part role takes `--moving-ink`. What is written on top of a full yellow
fill takes `--moving-on`, which is a token so that a future repaint stays a
swap of the table. And a role colour on a dark panel is not the same swatch as
on the page ground: `--frozen-on-screen` and `--keys-on-screen` are the only
forms of those two allowed there.
