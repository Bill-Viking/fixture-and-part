# The Fixture and the Part — interactive guide

An engineering-drawing-styled walkthrough of transformer internals, built from
the static essay in `the-fixture-and-the-part.html`. The prose is reused
verbatim; three of the figures are live instruments.

Spec: `interactive-guide-spec.md`.

## Status

**Phase 1 complete.** No ML dependency — every number on the page is an
illustrative heuristic from `src/lib/toyModel.js` and is labelled as such.
Phase 2 (real `distilgpt2` attention via transformers.js) is a separate branch
and is not referenced anywhere in this build.

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
src/instruments/Tokenizer.jsx      A — tokenizer strip        (section 02)
src/instruments/Stepper.jsx        B — forward pass + KV rack (section 03)
src/instruments/AttentionInspector.jsx
                                   C — attention inspector    (section 04)
src/lib/toyModel.js                Phase 1 heuristics
src/styles.css                     design tokens + all styling
```

Instruments A, B and C share one sequence, lifted into `App.jsx`: text typed
into A is tokenized, B appends generated tokens to it, and C queries whatever
that sequence currently is.

## Colour law

Steel is frozen machinery (weights, dies). Amber is the moving part
(activations, tokens in flight, values). Green is keys and searchable
metadata. This mapping is the visual thesis — do not swap it.
