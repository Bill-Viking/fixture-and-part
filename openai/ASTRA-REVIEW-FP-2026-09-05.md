# ASTRA REVIEW — The Fixture and the Part · 2026-09-05

DEPENDS ON: nothing. This is a READ-ONLY review of one project. You change no source, no STATUS, no design file; you write ONE findings file and report.

WHERE: a fresh Astra / Codex session on the Mac, working folder `~/Projects/fixture-and-part` (your own model, standard effort).

WHAT THE PROJECT IS: "The Fixture and the Part" — a public web page (React/Vite, GitHub Pages) that teaches transformer internals in the style of an engineering drawing: a ten-section essay with six live instruments that run the real `distilgpt2` in the browser. Live at https://bill-viking.github.io/fixture-and-part/ . The essay text is load-bearing and permanent once shipped; that is why a second reader is being asked before the next words bake in.

## Ritual first
1. Run the clock (`date`).
2. Say you are up: `python3 ~/Claude\ Orchestrator/tools/i-am.py GPT STANDARD "Astra review F&P 2026-09-05"` — lights your root on the pick-up tree. If your sandbox refuses a write outside this folder, skip it and say so in the findings.
3. `git status --short` and `git log -1 --format='%h %s'`. Expected: a clean tree on `main`, HEAD at or after `1ad465f`. If the tree is dirty, STOP and say what is dirty.
4. STOP if any file named below is missing — say which, then wait.

## Read, in this order
- `~/Claude Orchestrator/openai/ONBOARD.md` — your wake-up file, once (skip if outside your sandbox).
- `README.md`, then `STATUS.md`: the `## To do` list in full (the parked candidates), and the first and last paragraphs of `## Now`. The middle of `## Now` is history; skim it.
- `src/content/essay.js` — the whole essay, sections 01–10 in order, as a first-time reader would, including the `callout` and `duo` blocks.
- `src/lib/tour.js` — the sentences the drawing speaks during the narrated pass.
- The live page, https://bill-viking.github.io/fixture-and-part/ — if your surface can open a browser, read it top to bottom once as a reader who has never seen it. Say in the findings whether you could.
- The callout draft below — the words about to be added to the end of section 08. Approved by Bill today; not yet built.

### The callout draft (label SPECIMEN — THE MOTH; goes after the render paragraph of section 08)
> This page’s human author, in a hall at home: “I thought I saw a moth high up on the wall; for maybe ten seconds I stared at it, convinced it was a moth, and went to get the vacuum. When I came back and looked again I thought wait… and it snapped into place that it was just a picture hanger.” The paragraph above, lived once. The eye had a hard dark outline and little else — a brass hook, dark in the morning light against a white wall — and the outline fit the render well enough that ten seconds of staring produced no diff to patch it with; the moth stood for as long as the look lasted. What changed it was not a harder look but a gap: the next look was a fresh pass, from a new distance with an errand in hand, and it did not drift toward the hanger — it snapped whole. The correction got in between passes, not inside one, which is section 03’s seam from the human side: the successor inherited the hall and not the moth. Dreams, in the same account, are the renderer at play, stored patterns run through new situations with the retina silent. The model has the seam without the surprise: run the same sentence through the same file again and it lands where it landed, because nothing on its side of the gap has changed.

## Answer these five, bounded
1. COLD READ: where does a first-time reader get lost? Up to FIVE places. Each: section number · the sentence quoted · what the reader lacks at that moment · the smallest fix, in words. Real confusions only, not style preferences. Two known ones (the byte window in 01 is unlabeled; the drawing in 02 needs an "explain" mode) are already parked — do not repeat them.
2. FACT-CHECK: every checkable scientific or technical claim in the essay text (01–10, the two `duo` cards, the callout draft). For each claim you DOUBT: section · the claim quoted verbatim · what you believe is true · your confidence (high/medium/low) · a source if you have one. Then list, briefly, the claims you checked and found sound, so we know what was covered. Do not rewrite the prose.
3. THE MOTH CALLOUT: does the draft say anything false or overreaching about perception (predictive processing, feedback vs feedforward, the render standing through a fixed gaze) or about the model (determinism of a re-run, "nothing on its side of the gap has changed")? Does the reading hold — the render stood; the correction came from a gap, not a harder look; a fresh pass; a flip, not a drift? Name any sentence you would cut. At most ten lines.
4. THE CODE: read `src/` for what an outside reviewer would flag — correctness bugs, performance traps in the SVG drawing (`src/` instrument F and the tour), accessibility (keyboard, reduced motion, contrast), and anything that could make the live page WRONG about the model (quantization scale arithmetic in the wall-cell readout, tokenizer edge cases, the sampler's seed). Up to FIVE findings, each `file:line` · what · why it matters · smallest fix. Run `npm run build` only if a finding needs it to be verified; install nothing.
5. THREE IDEAS: at most three things this page could do that it does not, one line each, judged against the parked candidates in `STATUS.md ## To do`. Do not repeat a parked candidate. If you would rank a parked one first, say which and why in one line.

## Output, exactly
- Write `openai/ASTRA-FINDINGS-FP-2026-09-05.md` in this folder: at most two pages; the five answers under five headings, in the order above; plain words first; `file:line` where you point at code; every doubted claim quoted verbatim; a last line `END OF FINDINGS`.
- Do NOT commit, do NOT push, do NOT edit any other file in this repo (not STATUS, not src, not design, not README). The lane's Claude session on the Mac reads your file, acts on it, and commits it.
- Drop ONE line in `~/Claude Orchestrator/INBOX.md` in the file's own format, addressed `fixture-and-part ← Astra review (Mac, <time>)`, saying the findings file exists and how many findings it holds; then `python3 ~/orchestrator-sync/sync.py push`. If your sandbox refuses either, skip both and say so in the findings.
- Retitle yourself `ARCH — Astra: F&P review 2026-09-05` and run `python3 ~/Claude\ Orchestrator/tools/i-am.py --off GPT`.
- If you believe a claim on the page is wrong, say so in the findings; the ruling, and the words, are Bill's.
