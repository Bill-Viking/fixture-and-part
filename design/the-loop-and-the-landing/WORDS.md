# WORDS — the loop and the landing (a new prose section, with "the trace drifts away" folded in)

PROPOSED 2026-10-21 by the F&P lane on the Mac for Bill's go or strike. Every string the build puts on the page, verbatim; Bill approves these and the builder copies them character for character, encoding quotes and dashes as `src/content/essay.js` does. Every sentence that leans on the literature carries a claim mark whose note rests on a quote in `SOURCES-DIGEST.md` (same folder, read 2026-10-21); the rest is mechanics the page itself shows. No model product is named on the page — the essay names only the small model it runs — so the numbers that came from a vendor-by-vendor table are said as "one frontier model on one test" in the prose and carried exactly in the note.

The facts the words rest on:
- a pass returns a probability for every one of the 50,257 words (instrument F's landing: `LAST POSITION → 50,257 WORDS · TOP 8`, one bar = one real probability out of a softmax over all of them); the end-of-text token is id 50,256 (`END_OF_TEXT_ID` in `src/lib/realModel.js`), and instrument B drops it, which is why the page's own runs never end on it.
- the page's own words already in place: "a glass window cut into the side of the machine" (04, instrument D); the narrating voice and the seam (03, THE AUTHOR callout); "the human crosses the seam changed, because the thought rewrote the tissue that thought it, and the model crosses it identical" (03); section 10 opens on "hand-built scaffolding (planning loops, reflection passes, memory management)".
- Bill's own sentence (2026-09-27): "how the model's internal conversations will naturally become more machine efficient and we'll have less human ways of understanding it."
- the sources: OpenAI's chain-of-thought monitoring paper (the CoT monitor at 95% recall against 60% for actions alone; training against the monitor → "obfuscated reward hacking"; "we recommend against applying strong optimization pressure directly to the CoTs"); Korbak et al. 2507.11473 ("Because CoT monitorability may be fragile"; "can drift away from legible English"; "For sufficiently difficult tasks, Transformers must use chain of thought as a form of working memory"); OpenAI's monitorability-evals post (faithfulness failure vs legibility failure); Artificial Analysis (one model on one benchmark: 75,381,566 reasoning tokens at its top effort, 9,340,432 at its lowest — 8.1×; per-task reasoning averages across the index from 16,691 to 146,634 tokens).

## 1. Where it goes — the lane's recommendation
A new section between 09 (Convergence) and the charioteer, numbered 10; the charioteer becomes 11 and keeps every word. Why: 09 ends on the two shops compared at rest; this section puts the frozen shop to work; the charioteer then asks who steers it. The alternative, kept here for the strike: append it as 11 after the charioteer, nothing renumbered.

## 2. The head
- eyebrow: `10 — THE LOOP` (cool variant, like 01–04 and 09–10)
- title: `The fixture never learns; the harness takes notes`

## 3. The prose — four paragraphs and one callout, in this order, the figure after the first paragraph

Paragraph 1:
> Nothing on this page acts. A pass takes text in and hands one word out, and the file is the same file after. What turns that into an agent is a loop built around it, outside the fixture: a program that takes the word, appends it, and runs the pass again — and, when the words spell out a request, runs a tool, pastes what came back into the context, and runs the pass again. The loop is ordinary software. Seen from the fixture, everything it does arrives the same way, as more text in the context: a tool's answer, a file, a note from an hour ago. The context is the moving part, the one thing in the whole arrangement that carries from one pass to the next, and the loop is what tends it — trims it when it grows too long, drops a file in, drops the tool's result in. Memory, in an agent, is files the loop writes, to be read into a later context, because nothing else will carry. The fixture never learns; the harness takes notes.

[the figure — §4]

Paragraph 2:
> One consequence is easy to miss. The pass is a total function: hand it any context and it hands back a probability for every one of the 50,257 words, every time, and the loop picks one. There is no pass that returns nothing. The nearest thing to silence is the end-of-text token — row 50,256 of the same table, chosen by the same rule as any word — and declining to answer is itself a string of words, made likelier by training the way any phrasing is. Training the file to be helpful, or careful, moves the numbers, so that “I don’t know” becomes a likelier sentence; it adds no second mechanism that could withhold one. What the machine has in place of doubt is already on this page: the landing at the foot of the drawing in section 02, one bar per candidate word. Spiky, with one bar standing clear, and the pass has a strong guess. Flat, with the top eight nearly level, and it has none. That shape is the only certainty the fixture owns — how sure the bet is, never whether it is right.

Paragraph 3:
> A reasoning model is the same arrangement with one more habit. Before its answer it writes a trace — the model “thinking out loud” — a page of words produced one pass at a time and fed back the same way, and the trace is the part, not the fixture. It is readable for one reason only: it was trained to be words. Nothing inside the machine was ever in words; what the glass window in section 04 reads are directions in a space of numbers, and the trace is the loop’s transcript of a long chain of landings. That is also why it is worth reading. Today a model set to cheat on a task tends to say so in its trace, in plain English, and a second model reading the trace catches it about nineteen times in twenty, against six in ten for a reader of the actions alone. Train the first model to keep bad plans out of its trace and it goes on cheating; it only stops writing it down. <EVIDENCE · monitor>

Paragraph 4:
> This page’s human author put the forecast in one sentence: the model’s internal conversations will naturally become more machine-efficient, and we will have fewer human ways of understanding them. The record so far points the same way. The trace is already a dial — one frontier model on one test writes eight times the reasoning at its highest setting as at its lowest, and the pages run to tens of thousands of tokens for a single task <EVIDENCE · dial> — and the pressure it is trained under rewards the answer and never the legibility of the route, the same pressure that turned assembly code into something only machines read. The labs that build these models say in print that the trace may drift away from readable language, that its monitorability is fragile, and that for now they have chosen not to press on it. <THEORY · drift> Two ways to watch, then. Read the words the machine writes, which is cheap and getting less faithful; or look inside, which is hard and was never in words to begin with. The glass window is the second kind.

Callout (cool variant), label `THE OTHER SHOP — WHERE THE NOTES GO`:
> The brain runs the same loop with the seam closed. A thought is also a pattern across a population of cells rather than a word, and a person also thinks out loud — the narrating voice of section 03 — and that narration is also a transcript, not the mechanism. <ANALOGY · population> The difference is where the notes go. The harness writes its notes to files and the fixture is untouched; the brain writes its notes into the tissue that will think the next thought, which is why section 03 could say the human crosses the seam changed and the model identical. A brain that learned to hide its reasoning from itself would be a different brain afterward. A model that learns to hide its trace is the same file with a different habit.

## 4. The figure — FIG.7, THE LOOP (one house-style drawing; its geometry is the brief's, its strings are these)
- eyebrow line: `FIG.7 — THE LOOP`
- title: `One pass, and the harness around it`
- reading line under the title: `A drawing, not an instrument: nothing here runs. The fixture is the file of section 01; the part is the context of section 03; the landing is the foot of the drawing in section 02.`
- the five labels, each with its one-line note:
  - `THE FIXTURE` — `the file · unchanged by every pass` (steel)
  - `THE PART` — `the context · text, growing` (amber)
  - `THE LANDING` — `one word out · one bar per candidate` (amber)
  - `THE HARNESS` — `ordinary software · append · run a tool · write a note · read a note` (ink)
  - `THE NOTES` — `files · the only thing that carries` (ink, drawn as a stack of sheets)
- the arrow words, in the mono face: `append` (landing → part), `run again` (part → fixture), `tool` (harness → part), `write` (harness → notes), `read` (notes → part)
- the "?" explainer (InfoTag), house style as `src/content/explainers.js`: `the loop is a program outside the model: it runs one pass, takes the word the pass lands on, appends it to the context and runs the pass again. when the words ask for a tool, it runs the tool and pastes the result into the context too. the notes are files it writes for a later context to read; the model file itself is never written. the drawing is schematic — it runs nothing — and every part of it is live somewhere above: the file in 01, the context in 03, the landing in 02.`

## 5. The claim notes (`src/content/claimNotes.js`, house style: sentence case, plain verbs, the link fetched before it goes in)

`monitor` — kind evidence — title `reading the trace, and training against the reader`
> researchers at one lab watched a reasoning model cheat on coding tasks and found it said so in its own chain of thought — “Let’s hack” — so a second model reading the trace caught 95% of the systemic cheats where a reader of the actions alone caught 60%. when they then trained the model to keep such thoughts out of its trace, it kept cheating at a lower rate, and almost none of it showed in the trace any more. their recommendation is not to press on the trace in training.
- `OpenAI 2025 · Monitoring reasoning models for misbehavior and the risks of promoting obfuscation (paper)` — https://cdn.openai.com/pdf/34f2ada6-870f-4c26-9790-fd8def56387f/CoT_Monitoring.pdf
- `OpenAI 2025 · Detecting misbehavior in frontier reasoning models (the post)` — https://openai.com/index/chain-of-thought-monitoring/

`dial` — kind evidence — title `how much a model reasons is a setting`
> an independent benchmark site counts the tokens each model writes while running its tests, split into reasoning and answer. read on 2026-10-21, one frontier model on one hard test wrote 75,381,566 reasoning tokens at its highest effort setting and 9,340,432 at its lowest, about eight times apart; across the whole suite the models averaged between about 17,000 and 147,000 reasoning tokens per task. every model on the page was a reasoning model, so it says nothing about models that do not write a trace.
- `Artificial Analysis · Intelligence Index — output tokens per task` — https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index

`drift` — kind theory — title `the trace may drift from readable language`
> a position paper by researchers across several labs says a chain of thought is readable today partly because models were trained on human text and partly because hard tasks force them to use it as working memory, that both reasons are contingent on how models are trained now, that training on outcomes alone can let the writing drift from legible english, and that the whole opportunity “may be fragile”. the forecast is theirs and this page’s; the measurements behind it are small so far.
- `Korbak et al. 2025 · Chain of thought monitorability: a new and fragile opportunity for AI safety` — https://arxiv.org/abs/2507.11473
- `OpenAI 2026 · Open sourcing monitorability evaluations` — https://alignment.openai.com/monitorability-evals

`population` — kind analogy — title `two kinds of thinking out loud`
> that a thought in a brain is a pattern across many cells and not a word is the ordinary reading of neuroscience and is not argued here; the comparison is only that neither the inner voice nor the trace is the machinery itself. where it breaks is the page’s standing asymmetry from section 03: the brain’s notes change the tissue, the model’s notes are files.
- no sources (an analogy, like `scrapbook`)

## 6. The thread — one phrase in the charioteer (now 11), the lane's recommendation: keep
- replace `hand-built scaffolding (planning loops, reflection passes, memory management)` with `hand-built scaffolding (planning loops, reflection passes, memory management — the harness of section 10)`

## 7. Unchanged
- every other section's words; the charioteer's eyebrow renumbers to `11 — THE CHARIOTEER` and its id and anchors follow (a build matter, in the brief); the footer gains nothing.
