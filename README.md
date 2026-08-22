# The Fixture and the Part — interactive guide

An engineering-drawing-styled walkthrough of transformer internals, built from
the static essay in `the-fixture-and-the-part.html`. The prose is reused
verbatim; three of the figures are live instruments.

Spec: `interactive-guide-spec.md`.

## Status

Phases 1, 2 and 3A are merged and deployed: the illustrative build, real
`distilgpt2` running in the browser behind a load button, and the glass pass
(instrument D). Instrument E — the file itself — is on the `the-file` branch.

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
                                   KVInspector
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
it. E shares none of that. It reads the file the other four run on, and the
only thing it takes from the page is whether the model bytes have arrived in
the browser yet.

There is one worker, not two. D's lens and E's reads both want the same 83 MB
of model file, and a second worker would mean a second copy of it.

## Reading the model file

Instrument E shows the real `decoder_model_quantized.onnx` — the same file the
page downloads for real mode — and nothing on it is illustrative. So that it
can show it to a reader who has not downloaded anything,
`scripts/read-model-file.mjs` reads the file ahead of time and writes
`src/content/fileFacts.json`: every initializer with its dtype, shape, byte
length and absolute offset; a byte-exact distribution of each of them; and a
window of raw values out of every one — 32 rows by 96 columns for each of the
26 quantized weights, and the first 96 values of each of the 50 f32 norms and
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
the worker re-reads all of it out of the browser's cached copy, and the panel
says whether the two agree — hash included.

## Colour law

Steel is frozen machinery (weights, dies). Amber is the moving part
(activations, tokens in flight, values). Green is keys and searchable
metadata. This mapping is the visual thesis — do not swap it.
