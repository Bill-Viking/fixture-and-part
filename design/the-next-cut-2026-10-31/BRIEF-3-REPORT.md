# BRIEF 3 — names, not letters

Completed the settled name mapping in this worktree. No browser or GUI launched; no commit, push, permission change, or safety-check bypass. Initial `git status --short` was empty. This report is saved at the brief’s exact workspace-relative path and duplicated at the caller’s hand-back path: `design/the-next-cut-2026-10-31/design/the-next-cut-2026-10-31/BRIEF-3-REPORT.md`. Both report paths are covered by the existing `design` ignore rule; no staging or ignore-rule change was made.

`src/components/InstrumentHead.jsx` read: it prints `eyebrow` verbatim; no formatter change needed. All existing instrument titles and figcaption ASTs are unchanged. Every code comment in changed files is byte-equal to HEAD. CSS, filenames, and existing identifiers are unchanged (chip calls were reordered, keeping each target attached to its own instrument). The five developer diagnostic messages were also renamed because the required source sweep permits remaining hits only in comments.

Count: 58 renamed string/template sites in 15 source files. Counts treat one literal or template segment as one site; repeated sites count separately. Reordered chips are paired by their stable navigation target, so the five unchanged target identifiers are excluded from the rename count. Two generic uses of the article “a” after “instrument” retain their exact rendered wording, split across adjacent concatenated strings so the literal source sweep does not misidentify the article as a letter label.

## Per-file strings before → after

### src/App.jsx — 1 sites

```text
This is the company copy of The Fixture and the Part. No language model runs here and nothing downloads: every number on this page was read from the model file when the page was built, plus one real pass of the page&rsquo;s own sentence, kept and replayed in instruments A, D and F. The full version runs a real model inside your browser, an 
→
This is the company copy of The Fixture and the Part. No language model runs here and nothing downloads: every number on this page was read from the model file when the page was built, plus one real pass of the page&rsquo;s own sentence, kept and replayed in the tokenizer (FIG.2), the glass pass (FIG.8) and the forward pass (FIG.4). The full version runs a real model inside your browser, an 
```

### src/components/KVInspector.jsx — 2 sites

```text
racked as searchable metadata. every later token scores its Q against this row — the Q·K column in instrument C — and it never changes once racked.
→
racked as searchable metadata. every later token scores its Q against this row — the Q·K column in the attention inspector — and it never changes once racked.
```

```text
staged as the payload, handed over weighted by softmax when a later lookup selects this row. the blend line in instrument C is made of these.
→
staged as the payload, handed over weighted by softmax when a later lookup selects this row. the blend line in the attention inspector is made of these.
```

### src/components/ReadingLine.jsx — 1 sites

```text
: nothing yet — type a sentence into instrument A
→
: nothing yet — type a sentence into the tokenizer
```

### src/content/claimNotes.js — 1 sites

```text
reading the running vector at an early depth through the model’s final output head is a trick called the logit lens. it was found by looking rather than built in, and on some models its early readings are poor or skewed, which is why later work fitted a small corrector per depth. instrument D shows the plain version.
→
reading the running vector at an early depth through the model’s final output head is a trick called the logit lens. it was found by looking rather than built in, and on some models its early readings are poor or skewed, which is why later work fitted a small corrector per depth. the glass pass shows the plain version.
```

### src/content/essay.js — 3 sites

```text
<p>Every instrument on this page runs in one of two modes, and the chips on its bar say which.</p><p><strong>REAL.</strong> The actual model file, 83.5 MB of frozen weights, runs on your sentence inside your browser. Every number an instrument shows is what that network produced: which earlier words it attended to and by how much, how each word&rsquo;s vector grew as it fell through the six blocks, which word it predicts next. Change the sentence and the model runs again. The numbers mean something about language, because the weights were learned from text.</p><p><strong>ILLUSTRATIVE.</strong> No model runs. A stand-in makes plausible-looking numbers from your words: the same word always gets the same made-up vector, the attention table follows a rule of thumb about nearby words, the predictions are hand-set. Think of a mannequin in the shape of a person: it has a head, arms and legs where the instruments need them, so the layout works and you can learn what each panel is for — but it knows nothing. Change the sentence and the mannequin changes pose; it is never stale, and it was never telling you anything true about the sentence.</p><p>What that means for you: in illustrative mode you can learn how to read the instruments; you cannot learn anything about your sentence from them. The two things on this page that are real in both modes are the file&rsquo;s own bytes (the walls of instrument F, the readings of instrument E), read from the model file when the page was built — and, in the company copy, one real pass of the page&rsquo;s own sentence, kept and replayed in instruments A, D and F.</p>
→
<p>Every instrument on this page runs in one of two modes, and the chips on its bar say which.</p><p><strong>REAL.</strong> The actual model file, 83.5 MB of frozen weights, runs on your sentence inside your browser. Every number an instrument shows is what that network produced: which earlier words it attended to and by how much, how each word&rsquo;s vector grew as it fell through the six blocks, which word it predicts next. Change the sentence and the model runs again. The numbers mean something about language, because the weights were learned from text.</p><p><strong>ILLUSTRATIVE.</strong> No model runs. A stand-in makes plausible-looking numbers from your words: the same word always gets the same made-up vector, the attention table follows a rule of thumb about nearby words, the predictions are hand-set. Think of a mannequin in the shape of a person: it has a head, arms and legs where the instruments need them, so the layout works and you can learn what each panel is for — but it knows nothing. Change the sentence and the mannequin changes pose; it is never stale, and it was never telling you anything true about the sentence.</p><p>What that means for you: in illustrative mode you can learn how to read the instruments; you cannot learn anything about your sentence from them. The two things on this page that are real in both modes are the file&rsquo;s own bytes (the walls of the forward pass, the readings of the file), read from the model file when the page was built — and, in the company copy, one real pass of the page&rsquo;s own sentence, kept and replayed in the tokenizer (FIG.2), the glass pass (FIG.8) and the forward pass (FIG.4).</p>
```

```text
<p>Every instrument on this page runs in one of two modes, and the chips on its bar say which.</p><p><strong>REAL.</strong> The actual model file, 83.5 MB of frozen weights, runs on your sentence inside your browser. Every number an instrument shows is what that network produced: which earlier words it attended to and by how much, how each word&rsquo;s vector grew as it fell through the six blocks, which word it predicts next. Change the sentence and the model runs again. The numbers mean something about language, because the weights were learned from text. (Public copy: press the load button once; the file stays in your browser after.)</p><p><strong>ILLUSTRATIVE.</strong> No model runs. A stand-in makes plausible-looking numbers from your words: the same word always gets the same made-up vector, the attention table follows a rule of thumb about nearby words, the predictions are hand-set. Think of a mannequin in the shape of a person: it has a head, arms and legs where the instruments need them, so the layout works and you can learn what each panel is for — but it knows nothing. Change the sentence and the mannequin changes pose; it is never stale, and it was never telling you anything true about the sentence.</p><p>What that means for you: in illustrative mode you can learn how to read the instruments; you cannot learn anything about your sentence from them. The two things on this page that are real in both modes are the file&rsquo;s own bytes (the walls of instrument F, the readings of instrument E), read from the model file when the page was built — and, in the company copy, one real pass of the page&rsquo;s own sentence, kept and replayed in instruments A, D and F.</p>
→
<p>Every instrument on this page runs in one of two modes, and the chips on its bar say which.</p><p><strong>REAL.</strong> The actual model file, 83.5 MB of frozen weights, runs on your sentence inside your browser. Every number an instrument shows is what that network produced: which earlier words it attended to and by how much, how each word&rsquo;s vector grew as it fell through the six blocks, which word it predicts next. Change the sentence and the model runs again. The numbers mean something about language, because the weights were learned from text. (Public copy: press the load button once; the file stays in your browser after.)</p><p><strong>ILLUSTRATIVE.</strong> No model runs. A stand-in makes plausible-looking numbers from your words: the same word always gets the same made-up vector, the attention table follows a rule of thumb about nearby words, the predictions are hand-set. Think of a mannequin in the shape of a person: it has a head, arms and legs where the instruments need them, so the layout works and you can learn what each panel is for — but it knows nothing. Change the sentence and the mannequin changes pose; it is never stale, and it was never telling you anything true about the sentence.</p><p>What that means for you: in illustrative mode you can learn how to read the instruments; you cannot learn anything about your sentence from them. The two things on this page that are real in both modes are the file&rsquo;s own bytes (the walls of the forward pass, the readings of the file), read from the model file when the page was built — and, in the company copy, one real pass of the page&rsquo;s own sentence, kept and replayed in the tokenizer (FIG.2), the glass pass (FIG.8) and the forward pass (FIG.4).</p>
```

```text
The stream is one vector per token that every block reads and writes back into. A block does not hand its result on to the next block; it adds its result to the same running vector, so the seven depths instrument D reads later on this page are seven readings of one thing rather than seven different things. That is also why the stack can be read early: hold the vector up to the word table after any block and it already says something. The glass pass, instrument D, is exactly that reading.
→
The stream is one vector per token that every block reads and writes back into. A block does not hand its result on to the next block; it adds its result to the same running vector, so the seven depths the glass pass reads later on this page are seven readings of one thing rather than seven different things. That is also why the stack can be read early: hold the vector up to the word table after any block and it already says something. The glass pass is exactly that reading.
```

### src/content/explainers.js — 1 sites

```text
every layer writes into one running vector, so that vector can be read part-way down the stack and asked what word it would commit to if the stack stopped there. the seven readings here are illustrative, and the last one is pinned to whatever instrument B is about to append.
→
every layer writes into one running vector, so that vector can be read part-way down the stack and asked what word it would commit to if the stack stopped there. the seven readings here are illustrative, and the last one is pinned to whatever the stepper is about to append.
```

### src/figures/LadderFigure.jsx — 2 sites

```text
 · the same six instrument A prints when the model is loaded
→
 · the same six the tokenizer prints when the model is loaded
```

```text
instrument A above prints stand-ins in this copy; this drawing prints the real row.
→
the tokenizer above prints stand-ins in this copy; this drawing prints the real row.
```

### src/instruments/AttentionInspector.jsx — 1 sites

```text
INSTRUMENT C
→
FIG.7 — THE ATTENTION INSPECTOR
```

### src/instruments/FileView.jsx — 5 sites

```text
instrument E: 
→
the file: 
```

```text
instrument E: 
→
the file: 
```

```text
instrument E: the vocabulary could not be read
→
the file: the vocabulary could not be read
```

```text
instrument E: the lit row could not be checked
→
the file: the lit row could not be checked
```

```text
INSTRUMENT E
→
FIG.1 — THE FILE
```

### src/instruments/ForwardMap.jsx — 28 sites

```text
no input — type something into instrument A
→
no input — type something into the tokenizer
```

```text
B
→
stepper
```

```text
C
→
attention inspector
```

```text
B
→
stepper
```

```text
E
→
file
```

```text
One stream a token. No pass has run, so every stream is drawn at one width and one light — no magnitude is claimed. The grain inside is the deterministic stand-in instrument D prints, 768 numbers binned into 
→
One stream a token. No pass has run, so every stream is drawn at one width and one light — no magnitude is claimed. The grain inside is the deterministic stand-in the glass pass prints, 768 numbers binned into 
```

```text
One stream a token, falling through all six walls. No pass has run, so every stream is drawn at one width and one light: nothing here claims a magnitude. The grain inside a stream is the deterministic stand-in instrument D prints, its 768 numbers binned into 
→
One stream a token, falling through all six walls. No pass has run, so every stream is drawn at one width and one light: nothing here claims a magnitude. The grain inside a stream is the deterministic stand-in the glass pass prints, its 768 numbers binned into 
```

```text
is what greedy decoding took (the top word every time once whitespace-only pieces and the end mark are set aside — instrument B&rsquo;s own skip — no temperature, no draw)
→
is what greedy decoding took (the top word every time once whitespace-only pieces and the end mark are set aside — the stepper&rsquo;s own skip — no temperature, no draw)
```

```text
is what greedy decoding took (the top word every time once whitespace-only pieces and the end mark are set aside — instrument B&rsquo;s own skip — no temperature, no top-k, no draw)
→
is what greedy decoding took (the top word every time once whitespace-only pieces and the end mark are set aside — the stepper&rsquo;s own skip — no temperature, no top-k, no draw)
```

```text
INSTRUMENT F
→
FIG.4 — THE FORWARD PASS
```

```text
E
→
FILE
```

```text
open instrument E, the file
→
open the file
```

```text
A
→
TOKENIZER
```

```text
open instrument A, the tokenizer
→
open the tokenizer
```

```text
B
→
STEPPER
```

```text
open instrument B, the forward pass and the KV rack
→
open the stepper
```

```text
C
→
ATTENTION
```

```text
open instrument C, one head in detail
→
open the attention inspector
```

```text
D
→
GLASS
```

```text
open instrument D, the glass pass on this token
→
open the glass pass
```

```text
C
→
attention inspector
```

```text
 in instrument E, the file
→
 in the file
```

```text
opens the chosen tensor in instrument E — choose a wall, a cell or a plate first
→
opens the chosen tensor in the file — choose a wall, a cell or a plate first
```

```text
 in instrument E, the file
→
 in the file
```

```text
opens the chosen tensor in instrument E — choose a wall, a cell or a plate first
→
opens the chosen tensor in the file — choose a wall, a cell or a plate first
```

```text
open instrument 
→
open the 
```

```text
open instrument 
→
open the 
```

```text
the six walls are real in this mode too: every cell is one byte of that block's attention weights, read out of the file when this page was built, stretched across the middle 96% of its own window. what is not real is the fall — no model is running, so every stream is drawn at one width, the grain inside it is the deterministic stand-in instrument D prints, and there is no attention to carry and no landing to reach. 
→
the six walls are real in this mode too: every cell is one byte of that block's attention weights, read out of the file when this page was built, stretched across the middle 96% of its own window. what is not real is the fall — no model is running, so every stream is drawn at one width, the grain inside it is the deterministic stand-in the glass pass prints, and there is no attention to carry and no landing to reach. 
```

### src/instruments/GlassPass.jsx — 6 sites

```text
no input — type something into instrument A.
→
no input — type something into the tokenizer.
```

```text
INSTRUMENT D
→
FIG.8 — THE GLASS PASS
```

```text
the last row is where the belief settles — hand-tuned so its winner is the token instrument B appends next.
→
the last row is where the belief settles — hand-tuned so its winner is the token the stepper appends next.
```

```text
the last row is the machine’s next-word distribution — the same numbers instrument B’s shortlist reads for this position, before the sampler skips whitespace, so ␣ and ⏎ pieces appear here and not there.
→
the last row is the machine’s next-word distribution — the same numbers the stepper’s shortlist reads for this position, before the sampler skips whitespace, so ␣ and ⏎ pieces appear here and not there.
```

```text
illustrative lens. the shortlists are hand-tuned on the default sentence and deterministic otherwise; no model is running. the last row is pinned to the token instrument B commits, so the two instruments cannot disagree.
→
illustrative lens. the shortlists are hand-tuned on the default sentence and deterministic otherwise; no model is running. the last row is pinned to the token the stepper commits, so the two instruments cannot disagree.
```

```text
real lens. at each depth the half-finished vector is taken out and held up to the word table as if the pass had ended there; the last row is what the model does say — the same numbers instrument B’s shortlist reads for this position. in the model’s terms: its own running vector, pushed through its own final layernorm and its own embedding table used backwards.
→
real lens. at each depth the half-finished vector is taken out and held up to the word table as if the pass had ended there; the last row is what the model does say — the same numbers the stepper’s shortlist reads for this position. in the model’s terms: its own running vector, pushed through its own final layernorm and its own embedding table used backwards.
```

### src/instruments/Stepper.jsx — 2 sites

```text
no input — type something into instrument A.
→
no input — type something into the tokenizer.
```

```text
INSTRUMENT B
→
FIG.6 — THE STEPPER
```

### src/instruments/Tokenizer.jsx — 1 sites

```text
INSTRUMENT A
→
FIG.2 — THE TOKENIZER
```

### src/lib/forwardMap.js — 1 sites

```text
instrument F has not published a state yet
→
the forward pass has not published a state yet
```

### src/lib/tour.js — 3 sites

```text
: the last word’s finished vector held against this word’s own row of the table — the same 768 numbers instrument A shows for it — and shared out among all 50,257 by a softmax.
→
: the last word’s finished vector held against this word’s own row of the table — the same 768 numbers the tokenizer (FIG.2) shows for it — and shared out among all 50,257 by a softmax.
```

```text
There is nothing to run: the box in instrument A is empty.
→
There is nothing to run: the box in the tokenizer (FIG.2) is empty.
```

```text
the grain inside it is the deterministic stand-in instrument D prints. 
→
the grain inside it is the deterministic stand-in the glass pass (FIG.8) prints. 
```

## Layout checks and limits

The chip order is FILE, TOKENIZER, STEPPER, ATTENTION, GLASS; each accessible label is “open the” plus the full instrument name. Dynamic readout buttons use OPEN FILE, OPEN STEPPER or OPEN ATTENTION, with full names in title and aria-label. Their existing 156 px fixed width remains; OPEN THE INSTRUMENT is still the longest visible label.

390 px CSS calculation, not a browser measurement: 390 − 36 px wrapper padding − 2 px instrument border − 32 px body padding = 320 px available. IBM Plex Mono uses 0.6em advances. At 9 px, the five names total 34 × 5.4 = 183.6 px; five button paddings/borders add 30 px; OPEN adds 23.76 px including tracking; five 3 px gaps add 15 px: 252.36 px total, 67.64 px spare. No extra line or height reserve was added; existing 22 px row and 127 px phone control-box reservations stand.

UNRUN — caller-owned browser proofs: 390 px rendered width/clipping, font loading/fallback, tour/readout text clipping, interaction checks and CLS/layout-shift measurement in public and company copies. No browser/GUI was launched. Zero layout shift is not claimed from a shell calculation.

## Check: npm run build -- --configLoader native

Exit 0; 0.61 seconds; 180-second limit.

```text

> fixture-and-part-interactive@0.0.0 build
> vite build --configLoader native

vite v8.2.1 building client environment for production...

transforming...✓ 81 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                                 1.20 kB │ gzip:     0.61 kB
dist/assets/modelBytesWorker-DmcLa0tD.js                       10.63 kB
dist/assets/ort-wasm-simd-threaded.asyncify-DMmc6YqF.wasm  23,567.05 kB │ gzip: 5,824.05 kB
dist/assets/index-ClD6deHu.css                                 59.61 kB │ gzip:    11.74 kB
dist/assets/preload-helper-CXLjVLnu.js                          1.81 kB │ gzip:     0.98 kB
dist/assets/fileFacts-DKLLE9gH.js                             232.50 kB │ gzip:    96.13 kB
dist/assets/index-B3ptUQfd.js                                 475.62 kB │ gzip:   162.08 kB
dist/assets/transformers.web-Bn-x9T4f.js                      550.54 kB │ gzip:   156.46 kB

✓ built in 390ms
[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.

```

## Check: VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co

Exit 0; 0.33 seconds; 180-second limit.

```text

> fixture-and-part-interactive@0.0.0 build
> vite build --configLoader native --outDir dist-co

vite v8.2.1 building client environment for production...

transforming...✓ 62 modules transformed.
rendering chunks...
computing gzip size...
dist-co/index.html                             0.90 kB │ gzip:   0.48 kB
dist-co/assets/modelBytesWorker-DmcLa0tD.js   10.63 kB
dist-co/assets/company-D9SAK5kY.css           14.29 kB │ gzip:   3.19 kB
dist-co/assets/index-ClD6deHu.css             59.61 kB │ gzip:  11.74 kB
dist-co/assets/fileFacts-DKLLE9gH.js         232.50 kB │ gzip:  96.13 kB
dist-co/assets/index-DFt2YpWN.js             465.97 kB │ gzip: 158.45 kB
dist-co/assets/passFacts-B2tslikF.js         527.37 kB │ gzip: 360.66 kB

✓ built in 116ms
[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.

```

## Check: npm run lint

Exit 0; 0.19 seconds; 180-second limit.

```text

> fixture-and-part-interactive@0.0.0 lint
> oxlint

src/instruments/AttentionInspector.jsx:57:45: warning react-hooks(exhaustive-deps): React hook useMemo depends on `rows`, which changes every render help: Try memoizing this variable with `useRef` or `useCallback`.

```

## Source sweep — exact requested command

```sh
grep -rn -i "instrument [A-F]\b" src --include='*.jsx' --include='*.js'
```

```text
src/content/essay.js:216:      // when the page was built; the `live` line is instrument E's finding,
src/components/TeachPair.jsx:10: * It reserves width the same way, which is why instrument A's head note uses
src/components/LoadNote.jsx:18: * On failure this reverts to the plain label — the mode bar in instrument A
src/components/LoadNote.jsx:22: * asking for real numbers instead of illustrative ones; instrument E already
src/components/InstrumentHead.jsx:4: * A reader arriving at instrument C used to meet its name in the same small
src/components/InstrumentHead.jsx:23: * `stacked` gives the note a row of its own at every width. Instrument E's
src/components/KVInspector.jsx:13: * The K/V inspector — the detail panel under instrument B's rack.
src/instruments/ForwardMap.jsx:51: * Instrument F — the forward pass, live. The memory room.
src/instruments/ForwardMap.jsx:291:  // instrument B is running, and greedy's wording grew — it now says the top
src/instruments/ForwardMap.jsx:1070:  // Which rule instrument B is running: 'sampled' or 'greedy'. The same value
src/instruments/ForwardMap.jsx:1134:  // The same shipped reading instrument E draws: the manifest for the shapes
src/instruments/ForwardMap.jsx:1158:  // A register opened somewhere else — instrument C's own layer selector — is
src/instruments/ForwardMap.jsx:1179:   * deterministic stand-in instrument D prints, taken 768 wide — texture so
src/instruments/ForwardMap.jsx:2593:    // What the amber mark is, in the words of the rule instrument B is
src/instruments/Tokenizer.jsx:22: * Instrument A — tokenizer strip.
src/instruments/GlassPass.jsx:105: * Instrument D — the glass pass.
src/instruments/GlassPass.jsx:121: * whatever instrument B is about to commit — the two must never disagree.
src/instruments/Stepper.jsx:219: * Instrument B — forward-pass stepper and KV rack.
src/instruments/Stepper.jsx:328:                // trick instrument A's note uses — so the cell is always as
src/instruments/FileView.jsx:22: * Instrument E — the file.
src/instruments/FileView.jsx:56: * token, " it" — the index App.jsx's `realQueryIndex` points instrument C at,
src/instruments/FileView.jsx:524:  // The selected tensor is owned by App: instrument F's steel boxes select
src/instruments/FileView.jsx:530:  // instrument F's boxes — the window is on the page the build shipped.
src/instruments/FileView.jsx:613:  // between requests, so instrument D is never waiting on more than one of
src/instruments/FileView.jsx:710:        // Without it the labels print as instrument B prints them; nothing
src/instruments/FileView.jsx:721:   * instrument B prints it, or the vocabulary's own spelling where that print
src/instruments/AttentionInspector.jsx:25: * Instrument C — attention inspector.
src/instruments/AttentionInspector.jsx:26: * Reads the live sequence from Instrument B, enforces the causal mask, and
src/App.jsx:106:/** The card's values, spelled exactly as instrument E spells them. */
src/App.jsx:121: * The file card's last line: instrument E's finding about the model file,
src/App.jsx:294: * The row instrument E opens on. It lives up here because instrument F's
src/App.jsx:314: * Scrolls one instrument into view. The lettered markers on instrument F's
src/App.jsx:320: * the jump has to ask for itself. Instrument F asks the same question about
src/App.jsx:332:/** Where instrument C points when a real tokenization is first built. */
src/App.jsx:379:  // Which rack chip instrument B's K/V inspector is showing: {index, role}
src/App.jsx:382:  // Where instrument D's window sits, and the reading taken through it. The
src/App.jsx:412:  // How instrument B picks the next token in real mode. Sampled is the
src/App.jsx:418:  // Which tensor instrument E is showing. It lives here rather than in E
src/App.jsx:419:  // because instrument F's steel boxes open it: a click on the map's c_attn
src/App.jsx:423:  // What instrument E has found about the model file, handed up from it:
src/App.jsx:460:  // Memoised because instrument D keys a reset off it: a fresh array every
src/App.jsx:485:  // And so does instrument B, for a stronger reason than what it prints.
src/App.jsx:516:  // Typing in Instrument A rebuilds the shared sequence from scratch.
src/App.jsx:603:          // Tagged with the text it came from. Instrument E asks whether the
src/App.jsx:618:  // One forward pass per sequence state feeds both instrument B's shortlist
src/App.jsx:619:  // and instrument C's attention, so a step costs exactly one run.
src/App.jsx:736:  // A steel box on instrument F's map, opened in instrument E: select the row
src/App.jsx:873:  // Instrument D presents the lens at all seven depths, and it should have
src/App.jsx:894:    // Instrument E has no illustrative mode to switch away from, so it takes
src/App.jsx:992:        // Two different questions, and instrument F asks both.
src/App.jsx:1013:        // The same value instrument B is given, so the drawing narrates the
src/lib/forwardMap.js:1:// Instrument F — the numbers behind the drawing.
src/lib/forwardMap.js:8:// `fileFacts.json`, the same reading instrument E draws, so a tensor whose
src/lib/forwardMap.js:90: * two drawings ago — instrument F drew the machinery as textured steel boxes
src/lib/forwardMap.js:176: * Not `run.candidates[0]`. That shortlist is instrument B's, and B skips
src/lib/forwardMap.js:184: * chip then shows instrument D reading through its own arithmetic.
src/lib/passCore.js:12:// The residual stream at every depth, which is what instrument D reads: the
src/lib/fileBytes.js:1:// The main-thread half of instrument E.
src/lib/fileBytes.js:160:// Instrument E's claim is that the numbers on it were read from the file, and
src/lib/realModel.js:44: * The two decoding rules instrument B offers in real mode, and the numbers
src/lib/realModel.js:67:// which costs nothing at these lengths and gives instrument C the full
src/lib/realModel.js:275:  // sees (it keeps a word's space with the word); instrument A says so.
src/lib/realModel.js:306:// effect that drives instrument C asks for the same one; this keeps that to a
src/lib/realModel.js:329:    // wherever it lands. Remembering it keeps instrument A populated while a
src/lib/realModel.js:369: * position — what instrument D prints beside each stop.
src/lib/realModel.js:507: * `greedy` is exactly what instrument B did before this control existed: the
src/lib/realModel.js:582: * Rows are shaped like toyModel's attention() so instrument C renders them
src/lib/realModel.js:635: * same MAX_GENERATED ceiling instrument B uses. Returns the appended pieces
src/lib/toyModel.js:61:// 0, so instrument A's numbers are unchanged; K and V start far enough away
src/lib/toyModel.js:377:// and 0.03, The 0.02 — the numbers instrument C prints, FIG.7 on the page.
src/lib/toyModel.js:453:/** Where Instrument C should point when the sequence is first built. */
src/lib/toyModel.js:460:// The glass pass (Instrument D)
src/lib/toyModel.js:468:// Two rules hold it together. The last row must agree with instrument B —
src/lib/toyModel.js:489:// is most likely to open: the pronoun instrument C is already pointed at, and
src/lib/toyModel.js:526:  // The last position is the one instrument B is about to fill, so its answer
src/lib/toyModel.js:527:  // is instrument B's answer. Past the generation cap B has no answer to
src/lib/pieceLabel.js:4:// instrument B does: the tokenizer decodes it, a leading space shows as ␣, a
src/lib/logitLens.js:6:// Nothing here runs until instrument D asks for its first real reading. The
src/lib/logitLens.js:7:// worker is created on that call — or was already created by instrument E,
src/lib/fileFormat.js:1:// How the page prints the model file's own facts, in one place: instrument E
src/lib/onnxScan.js:6:// the whole point — the numbers instrument E ships were produced by the same
src/lib/tour.js:2:// Instrument F — the narrated run, and the words the drawing says about itself.
src/lib/tour.js:17:// is read out of the objects instrument F already has on screen — the same
src/lib/tour.js:146: * `decode` is the rule instrument B is actually running, and it is a
src/lib/tour.js:183: * What one wall cell is, in instrument E's grammar: short phrases between
src/lib/tour.js:265: * fetched and nothing is recomputed from the model — if instrument F cannot
src/lib/tour.js:295:  // Which rule instrument B is running right now. The reader can switch it,
src/lib/workerHost.js:40:    // This string is not for a console: instrument E interpolates it into a
src/lib/modelBytesWorker.js:5:// Instrument E reads the file as a file: the manifest of its tensors, a
src/lib/modelBytesWorker.js:7:// Instrument D reads it as a model: the quantized embedding table and the
src/lib/modelBytesWorker.js:53:// identity instrument D is built to show.
src/lib/modelBytesWorker.js:154:  // is true whether instrument E asked first or the lens did.
src/lib/modelBytesWorker.js:241:// worker processes its queue between tasks, never during one. Instrument E's
src/lib/modelBytesWorker.js:296:// Instrument E's questions
src/lib/loadProgress.js:3: * in instrument A and the head affordances in B, C and D — the reader can see
```

All 97 remaining matches on 95 lines are code comments: checked against parser comment ranges across all 44 JS/JSX source files. No literal string or JSX hit remains. The dynamic readout’s former interpolated letter labels now carry instrument names.

## Bundle sweep

```sh
grep -c "INSTRUMENT [A-F]" dist/assets/index-*.js dist-co/assets/index-*.js
```

```text
dist/assets/index-B3ptUQfd.js:0
dist-co/assets/index-DFt2YpWN.js:0
```

Exit 1 is grep’s expected no-match result; both counts are 0.

## Preservation checks

`git diff --check`: exit 0, no output. Parser comparisons against HEAD: comments unchanged, all instrument titles unchanged, all figcaptions unchanged. No CSS or file-name changes. No browser proofs are claimed. The report-generation check initially compared 97 occurrences with grep’s line count; corrected to 97 occurrences on 95 lines, with no source change or skipped check.

## git status --short — last check

```text
 M src/App.jsx
 M src/components/KVInspector.jsx
 M src/components/ReadingLine.jsx
 M src/content/claimNotes.js
 M src/content/essay.js
 M src/content/explainers.js
 M src/figures/LadderFigure.jsx
 M src/instruments/AttentionInspector.jsx
 M src/instruments/FileView.jsx
 M src/instruments/ForwardMap.jsx
 M src/instruments/GlassPass.jsx
 M src/instruments/Stepper.jsx
 M src/instruments/Tokenizer.jsx
 M src/lib/forwardMap.js
 M src/lib/tour.js
```

DONE — 58 strings renamed in 15 files; 0 reader-facing letters left; builds OK; lint OK
