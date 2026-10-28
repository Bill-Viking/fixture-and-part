# The company copy — report

The company copy is the same essay and the same six instruments, built a second way. Bill's definition, from the head of `WORDS.md` (2026-10-24): "the same page, one codebase, one build flag — no LOAD THE REAL MODEL door anywhere, every shipped number kept, the illustrative instruments kept, the model's runtime left out of the build, published at its own path." The dress brief adds the look: the same page and graphics in the type, colours and page furniture the office's readers see every day, with no mark of theirs. Per STATUS it will be published at `/fixture-and-part/company/` on the public Pages site, and cut as a scrubbed source tree for the office GitLab. At writing: branch `the-company-copy`, head `05d8bb5`, worktree clean, not merged, not deployed. A source is named beside each table; every number is copied from it.

## How it is built

Eleven commits sit on main's `c64deba` (`git log --oneline -12`):

- `b03e71b` the look sketch: section 02 and the masthead, gated by a query string
- `7ba7333` the dress, whole page; the gate moves from the query to the build flag
- `f0420db` Part A, the no-download build, from the approved WORDS §1–§7
- `1a1cdb3` gitignore `dist-*/`, so the company build folder stays out of the linter and git
- `767f03e` Part B: ten company stills and two controls from main
- `97c7a12` A2: the tour's no-pass stop, E's window line, the page-font link out of the company index
- `1217f26` STATUS: the 2026-10-27 ruling, bake one real pass; `b81a40f` WORDS §8 and STATUS
- `26ae68c` the baked pass; `9ae63d1` the words for the baked pass; `05d8bb5` STATUS

**The flag.** `VITE_COMPANY=1`, read once in `src/lib/company.js`: `export const COMPANY = import.meta.env.VITE_COMPANY === '1'`. Vite folds it at build time, so each branch is dead code in the other build. The same file holds two import factories beside it, `loadTransformers` (undefined in the company build) and `loadCompanyStyle` (undefined in the consumer build), so Vite drops the inactive chunks before it discovers them. `src/lib/bakedPass.js` repeats the one-line comparison locally for the same reason.

**The dress.** `src/company.css` is scoped under `html[data-look="company"]`: Barlow 300 for prose, mono kept on every readout, square corners, hairline rows, paper tokens scoped to `body` so instrument E's canvas ramp (read from the root) is untouched, and the dark screens and data drawings keep their paints. `src/main.jsx`, under the flag, sets `document.documentElement.dataset.look = 'company'`, awaits `loadCompanyStyle()`, injects the Barlow stylesheet and the page's own font stylesheet (both `display=swap`), and races both stylesheets and eight faces against one 2,500 ms timer, so a silent font host cannot hold the page blank (A2). `vite.config.js` registers a build-only plugin, `company-nonblocking-fonts` (`transformIndexHtml`, only when `VITE_COMPANY === '1'`), that removes the one Google Fonts stylesheet link for Space Grotesk, IBM Plex Sans and IBM Plex Mono from the company `index.html`, keeps the two preconnects, and fails the build unless it finds exactly one. The source `index.html` is byte-identical to main's.

**The no-download build.** In the company build `loadTransformers` is undefined, `realModel.js` returns early from `doLoad` and `loadModel`, `workerHost.js` never creates the byte worker, and the file proof stays `unloaded`. Section 01's mode bar is plain text (`mode` · `illustrative` · `no model in this copy`) with the approved lines and the public link; `LoadNote` always renders its plain label; E's proof and window lines, F's notes, the tour stops, section 07's live line (`unloadedCompany`) and the footer (`footerHtmlCompany`) take the WORDS forms.

**The baked pass.** `scripts/bake-pass.mjs` (npm `facts:pass`) runs the page's own sentence once on onnxruntime-node, in six flushed steps: the published bytes sha-checked against `fileFacts.json`, the graph with the 14-output fragment appended, the tokenizer sha-checked, the pass, the token names, the file. It writes `src/content/passFacts.json` (provenance; `run` as base64 raw Float32 arrays; `tokenNames`; `nextToken`; `decode`). `src/lib/passCore.js` is the pass core moved verbatim out of `realModel.js`, which now imports from it, re-exports every name it exported before, and keeps the cache and memo around a call to `runPass(session, tokenizer, ids)`. `bakedPass.js` exports only `loadBakedPass`, a lazy import in the company build only, decoding base64 to `Float32Array` and adding `tokenNames` and `baked: true`. The App seam is `const baked = COMPANY && bakedPass && text === DEFAULT_SENTENCE ? bakedPass : null` (`src/App.jsx:432`); it changes only F's `armed`, `real`, `run`, `sequence` and `nextToken`, and `isReal` stays false, so A–E, the mode bar and FileView keep their company strings. The tokenText seam: `src/lib/forwardMap.js` :197 and :246 read `run.tokenNames?.[id] ?? tokenText(id)`.

**Commands.** `npm run facts:pass` · `npm run lint` · company: `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co` · consumer: `npm run build -- --configLoader native`. In a worktree the build needs `-- --configLoader native` (Vite's temp config write hits EPERM through the shared `node_modules` link). The ship recipe in STATUS builds both copies: the consumer with `VITE_BASE=/fixture-and-part/` at the root, and `VITE_COMPANY=1 VITE_BASE=/fixture-and-part/company/ npm run build -- --outDir dist-company` into `company/` of the same gh-pages commit.

## What was proven

Node-side checks are the builders'; browser proofs are the prover's (2026-10-26) and the lane's own in the app's pane (2026-10-27).

### The dress — source `DRESS-BRIEF-REPORT.md` (node-side only)

| Check | Result |
|---|---|
| Lint | exit 0, exactly the baseline warning `AttentionInspector.jsx:55:45` |
| Company build | exit 0; `company-BY9j7odD.css` 9.02 kB; `index-ZrpbwQ64.js` 428.06 kB; 72 modules |
| Consumer build | exit 0; `index-Com714Ic.js` 429.14 kB; 71 modules |
| `data-look` / `Barlow` in CSS | company 1 / 1; consumer 0 / 0; consumer `index.html` Barlow 0 |
| Static scan | 77 scoped rules, none on `#s02`; 37 declarations on reserved elements, none changing box, size, spacing or line-height; 16 drawing palette overrides equal the base palette |
| Protected files | 39 tracked files byte-same as HEAD |
| CSS sizes | base CSS identical in both builds, 53,513 bytes; company CSS 9,023 bytes |
| Phrase gate `the bar — the whole file, drawn to scale` (expected 2) | 0 in both: the branch then predated the E merge; 2 in both builds after the rebase (`BUILD-BRIEF-REPORT.md`) |

| Ink (computed) | On white | On panel `#F4F7FB` |
|---|---:|---:|
| prose `#1D1D1B` | 16.884 | 15.713 |
| muted `#54606E` | 6.412 | 5.967 |
| amber `#9A6400` / amber ink `#855600` | 5.004 / 6.309 | 4.657 / 5.872 |
| small blue `#005FB0` / keys `#23653D` | 6.434 / 6.999 | 5.988 / 6.514 |

White on selected blue 6.434; amber ink on its tint 5.767; blue on its tint 5.733; green on its tint 6.180. Paint roles, paper then `.screen`: frozen `#005FB0` (fill `#0072CE`) then `#7FB0E8`; moving `#9A6400` (ink `#855600`) then `#F2B705`; keys `#23653D` then `#63B36F`.

### The no-download build — source `BUILD-BRIEF-REPORT.md`

| String in the entry bundles | Company | Consumer |
|---|---:|---:|
| `LOAD THE REAL MODEL` | 0 | 1 |
| `load the model to read it live` | not in record | 1 |
| `huggingface.co` | 2 (provenance URLs in the `fileFacts` chunk) | 7 |
| `the bar — the whole file, drawn to scale` | 2 | 2 |
| §1 line 1, `this copy does not download the model — …` | 1 | 0 |
| `Barlow` | not in record | 0 |

Company assets (bytes): `fileFacts` 232,504; `company-Cz90Q5Rf.css` 9,593; `modelBytesWorker` 10,637 (emitted, entry references 0); `index` CSS 53,922; `index` JS 416,522; no transformers or ONNX Runtime chunk. Consumer adds `transformers.web-Bn-x9T4f.js` 550,542 and `ort-wasm-simd-threaded.asyncify-DMmc6YqF.wasm` 23,567,050. Node render of the whole app, consumer, equals the starting HEAD byte for byte (647,205 bytes, sha256 `0d8519c0cfb3e6f02c4003e531945a98e59bcaa8a01ce4d028691ad134990c25`); `inst-note` buttons 5 consumer, 0 company. The report's open findings (two download invitations without words; `load the model` matching inside "download the model"; the provenance URLs) were closed by WORDS §4's added lines and A2, below.

### A2 — source `BRIEF-A2-REPORT.md`

| Entry-bundle string | Company | Consumer |
|---|---:|---:|
| `Load it above` | 0 | 1 |
| `With a model in hand this same tour would speak` | 1 | not in record |
| `fixed in this copy` | 1 | 0 |
| `this copy holds this window only` | 0 | not in record |
| `fonts.googleapis.com/css2` | 1 | not in record |
| `Barlow` | 2 | 0 |

Company `index.html`: 0 Google Fonts stylesheet links, 2 preconnects; consumer: 1 and 2. Mocked-DOM font checks 6 of 6, one timer at 2500 ms. Source `index.html` is byte-identical to main's (sha256 `d199befde2b93bff4364e3829a9810821b7fc772ad9ae9adf8b64980d80bdd58`). The built consumer index differs from main's by one line, `<link rel="modulepreload" crossorigin href="/assets/preload-helper-CXLjVLnu.js">`: built sha256 `0c3af077…` against main's `00a54798…`; the pre-A2 build has the same sha as A2's, so A2 changed nothing there. STATUS rules it LEAVE IT.

### The prover's run, 2026-10-26 — source STATUS (hand-back in the transcript)

| Check | Result |
|---|---|
| DOM strings, company page | 52 of 54 exact; the two misses were a straight apostrophe the source itself uses, ruled keep |
| Network | no request to huggingface.co across a full scroll and sixteen actions; hosts: the page, fonts.googleapis.com, fonts.gstatic.com |
| Consumer page from the branch against main | identical in innerText (50,540 chars) and every head |
| First paint | `data-look` at DOMContentLoaded 543 ms; Barlow at load and at 2 s |
| Layout shift | CLS 0 on all sixteen actions, at 1280 and 390 |
| Contrast | every ink at least 5.87:1 on its ground; the link 9.4 (browser default blue; a candidate to restyle in company blue) |
| Tab stops | 223 = 230 − 8 + 1 |
| Load row reserve | 68 px (641–1280), 116 (390–640), 148 (≤ 360) |

A2's browser re-proof (the silent-drop font case, E's fit at 390 and 360, the tour's stop 5) was unrun at that record and is not in the record as run since.

### The baked pass — source `BUILD-BRIEF-PASS-REPORT.md`

The bake exited 0 twice; the second file is byte-identical, `bakedAt` included. Its six lines:

```text
1 of 6 · the published bytes · 83502375 bytes · sha256 1d3ab4d7e08ca9b8ea9a42dda13a05b7ff0f1b0c9bdc4f6eba27e7f0ceff8431
2 of 6 · the graph · 14 promoted outputs · logits · present.0.key · present.0.value · cpu
3 of 6 · the tokenizer · sha256 cda20b8ca044949aa07ac4078420c80d1a57139d5f9f33700e46fb2d891e7c66 · ids [464,3113,45615,290,340,4423,866,13]
4 of 6 · the pass · n 8 · ids [464,3113,45615,290,340,4423,866,13] · tokens ["The","␣engine","␣roared","␣and","␣it","␣shut","␣down","."] · ‖residual‖ 5.0 → 1816.7
5 of 6 · the names · top 8 "⏎" 0.3149584611434227 · "␣The" 0.14010734374860398 · "␣It" 0.07171751146390971 · "<|endoftext|>" 0.025581227725666345 · "␣He" 0.022054415764321125 · "␣A" 0.01885004238814804 · "␣But" 0.015258243264195672 · "␣Then" 0.013121804667761293 · nextToken "␣The" · decode greedy · all top 8 names present
6 of 6 · the file · src/content/passFacts.json · 527411 bytes · gzip 361727 bytes
```

The node reference for the caller, hero index 7 (the last token), from the existing drawing helpers:

| Block | Rule head | KEY token · weight |
|---|---:|---|
| 0 | 7 | ␣shut · 0.1662; ␣down · 0.1653 |
| 1 | 9 | ␣down · 0.2908; ␣shut · 0.2485 |
| 2 | 3 | ␣engine · 0.2362; ␣roared · 0.2206 |
| 3 | 8 | The · 0.6652 |
| 4 | 7 | The · 0.4788 |
| 5 | 8 | no transfer; self 0.5937; best other 0.1287 |

The lane matched these to the live page's own labels to four decimals in the app's browser pane on 2026-10-27 (commit `26ae68c`, STATUS): the KEY labels, rule heads, residual line `5.0 → 1816.7` and the landing (top 8 led by ⏎ 0.315, ␣The 0.140; greedy takes ␣The); CLS 0 at 1280 and 390; no request to huggingface; no console error; another sentence keeps the straight sheet and the three other-sentence notes of WORDS §8 E; the tour's last stop prints the §8 B line.

| Entry-bundle string | Company `index-aADI0xir.js` | Consumer `index-CdkDlCqv.js` |
|---|---:|---:|
| `Load it above` | 0 | 1 |
| `fixed in this copy` | 1 | 0 |
| `fonts.googleapis.com/css2` | 1 | 0 |
| `Barlow` | 2 | 0 |
| `bakedAt` | 0 | 0 |
| `LOAD THE REAL MODEL` | 0 | 1 |

Company entry 417,598 bytes; consumer entry 429,407. The pass lives in the company chunk `passFacts-B2tslikF.js`, 527,373 bytes; the consumer has no `passFacts` chunk (`grep -l bakedAt dist/assets/*` prints nothing). Lint exit 0 with the one baseline warning; both builds exit 0; `git diff --check` exit 0. The move: `git diff --color-moved=zebra` shows moved blocks, and the only non-moved lines are the import and re-export lines and the `runPass` wrapper seam. Original `realForward` and the new wrapper give `deepStrictEqual` results on the same CPU session; the decoded bake round-trips byte for byte. Opposite cases: the cached 6-name graph fed as-is stops with `the model graph is missing outputs: /transformer/wte/Gather_output_0, /transformer/Add_output_0, …` (eight names); with `text = 'The engine roared and it shut off.'` the App expression yields `null`.

### The words for the baked pass — source `BRIEF-WORDS-REPORT.md`

| Phrase in the entry bundle | Company | Consumer |
|---|---:|---:|
| `run once when this copy was built` | 1 | 0 |
| `run in this browser` | 0 | 1 |
| `It ran once, when this copy was built` | 1 | not in record |
| `never a company one` | 1 | 0 |
| `this copy runs none` / `which this copy does not run` | 0 / 0 | not in record |
| `for the page’s own sentence` | 2 | not in record |
| `for any sentence but the page’s own` | 1 | not in record |
| `one pass of the page’s own sentence was run then and kept` | 1 | not in record |
| `Load it above` | 0 | not in record |
| `fixed in this copy` | 1 | not in record |

The consumer entry `index-CdkDlCqv.js` is 429,407 bytes before and after, sha256 `b67a3d67a64585bea9cb662c195ad5496d99dcf61e436a9e7affb59046ab2aee` both times, byte-identical. Lint exit 0 with the one baseline warning; both builds exit 0; the diff is four files, 18 insertions, 14 deletions. The mode bar's reserved row was estimated by the builder at 136 / 200 / 248 px (arithmetic, not measured); re-measured in the pane with Barlow loaded it is 120 / 184 / 232 px, the exact line counts at 641, 390 and 320 (commit `9ae63d1`); CLS 0 at 1280, no clipping at 1280, 641, 390 and 320, and the fallback faces take fewer lines.

## Known seams

- Instrument A's chips show the toy split (`The engine roared …`) while F's show the real pieces (`The ␣engine ␣roared …`); B's STEP stays illustrative while F's amber token is the real pass's greedy choice (`BUILD-BRIEF-PASS-REPORT.md`).
- The consumer load button hardcodes `83.5 MB` (`ModeControl.jsx:115`, hint at `:122`); the company disclaimer formats the size from provenance with `mb(__FILE_PROVENANCE__.bytes)`, so the two agree today and nothing forces them to (`BRIEF-WORDS-REPORT.md`).
- The consumer index carries one extra `modulepreload` line against main; the page's DOM is identical; ruled LEAVE IT (`BRIEF-A2-REPORT.md`, STATUS).
- The remote branch still holds `7f5ab1d`: the force push of the rebase was refused by auto mode; the ship merges into main and pushes main, which needs no force (STATUS).
- The baked numbers are the CPU runtime's; a browser pass may differ in low digits, though the lane saw four-decimal equality on this sentence (`BUILD-BRIEF-PASS-REPORT.md`, STATUS).
- The manifest line `everything here is illustrative — deterministic stand-ins, no model running.` is unchanged, and the pass report flags it as under-describing F; WORDS §8 C changed only the mode bar's first line.

## The words

All approved strings live in `WORDS.md` (proposed 2026-10-25, approved the same day; §8 approved 2026-10-27, «1 · go on all»). Sections: §1 The mode bar (section 01, instrument A's bar) · §2 The instrument heads' notes (B, C, D) · §3 Instrument E — the file · §4 Instrument F — the forward pass · §5 Section 07 — the contrast's file card, its live line · §6 The footer credit — one ruling, approved form `From a conversation between Bill and a language model.` · §7 Unchanged · §8 The baked pass.

## Not yet done

- Bill's go or strike on the look is open; his «I don't like it» was the empty waterfall, not the dress (STATUS).
- Not merged and not deployed. The ship: restore or commit the primary checkout's modified launch config first; fast-forward the branch into main; build both copies per the recipe above; `rm` then `cp` into the gh-pages worktree, never rsync; a live cache-busted check of both.
- The work package is not cut: the scrubbed zip and the one-paste landing, with the README's own words.
- A words ruling is open on the terms a coworker meets cold: UNEMBED · WTEᵀ, the wall label ATTN.C_ATTN.WEIGHT 24 × 64, «hero», «the fall a schematic» (STATUS) — and, with it, the manifest line `everything here is illustrative — deterministic stand-ins, no model running.`, which under-describes F for the page's own sentence.
- A2's browser re-proof (the silent-drop font case, E's fit at 390 and 360, the tour's stop 5) is not in the record as run.

Drafted by a reader from the reports named above and revised by the lane, 2026-10-27.
