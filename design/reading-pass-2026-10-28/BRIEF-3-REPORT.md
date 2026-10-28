# BRIEF 3 — headless builder handback

Worktree: `/Users/bill/Projects/fixture-and-part/.claude/worktrees/company-look`.
Branch: `the-company-copy`. Arrival HEAD: `008e64d` (BRIEF 2 committed); arrival working tree and index were clean. The caller’s closed-input assignment supplies builder authority. This run made no stage, commit, push, discard, permission change, browser launch or GUI launch. No sync, stamp, STATUS, OPENER or other out-of-scope write was made.

## Result and the one failed requirement

Both parts are implemented and both builds pass. One exact global bundle-count requirement fails: the company entry contains **1**, rather than the required **0**, occurrence of `this copy does not download the model`. It is the existing section 07 file-card line at `src/content/essay.js:232`:

```text
this copy does not download the model, so the file is not read again here.
```

That sentence is the approved company wording in `design/the-company-copy/WORDS.md` §5, outside the section 10 insertion and Part B bar/notice replacements. The old mode-bar occurrence is removed. No replacement wording was supplied for section 07. Under BRIEF 1’s “Anything unclear: stop that item … Never guess a word,” this builder leaves that sentence verbatim and reports the conflict. Every other requested bundle count passes. This report ends FAIL because the brief defines DONE as every check passing.

## Part A — section 10 and its five notes

- `src/content/essay.js:360`: inserted P1, then P2, then the cool callout `THE CONVERSATION — THE RATE`, immediately after `THE CONVERSATION — THE CLERK AND THE LIFE` and before section 10 ends. The original section 10 blocks and all other essay text remain byte-identical after removing these additions.
- `src/content/claimNotes.js:12`: added `scaling` / evidence, `horizon` / evidence, `mirage` / theory, `middle` / theory and `count` / theory. Each mark follows the exact phrase named in WORDS-LONG-HORIZON.md. Titles, bodies, kinds, labels and six URLs match that file exactly; `count.sources` is `[]`. Existing notes remain byte-identical after removing these five entries.
- Curly apostrophes and quotation marks in HTML use the surrounding `&rsquo;`, `&ldquo;`, `&rdquo;` conventions; em dashes keep the surrounding literal glyph. A Node/Python comparison decoded entities, removed only the five inserted marks, and compared both paragraphs and the complete callout with the supplied words: PASS in both copies.
- The actual rendered App has 34 marks and 32 notes in each copy, 0 missing note keys and 0 orphan notes. Existing repeated marks account for the difference in totals. All five new keys occur once on their specified phrase.
- House-name grep `Fable|Opus|Sonnet|Haiku|Claude|GPT|Astra|Sol`: **0** over the added source lines, and **0** over the new rendered prose, note fields/URLs, notice and company bar.

## Part B — notice and company bar

- `src/App.jsx:1030`: a COMPANY-only existing `Callout`, label `THE COMPANY COPY`, directly after `</header>` and before the sentinel and first section. The body is the exact approved §9 A text. The address is an anchor to `https://bill-viking.github.io/fixture-and-part/`. Size is interpolated with `mb(__FILE_PROVENANCE__.bytes)`, which renders `83.5 MB`; it is not typed into the notice.
- `src/components/ModeControl.jsx:36`: the company row now has `company copy` and `no model · nothing downloads`. Three hints and the company TeachPair are replaced with the one approved §9 B hint. The now-unused `mb` import was removed. The consumer TeachPair (originally near line 141) remains, and the entire consumer branch from `const loaded` to EOF plus LOAD_LABEL is byte-identical to arrival HEAD.
- `src/company.css`: only the three authorized height values changed. A whole-file equality assertion against the base with those three substitutions passes. The pre-existing comment still describes the retired three-line arrangement because this brief explicitly allows only height-value edits; the new measurement record is below.

## Reservation measurements — command-line estimate, browser proof UNRUN

Used the existing comment’s conservative **6.4 px per character** method, with greedy word wrapping (Python `textwrap.wrap`, no hyphen breaks). The approved hint is **106 characters**. CSS supplies 16 px line-height. Available width is `min(viewport,760) − outerPadding − 2 − 32`, from wrap padding, instrument borders and inst-body padding. One spare 16 px line is reserved in every band. There is one hint and therefore no inter-hint gap to add.

| Band / narrow edge checked | Hint width | Character capacity | Estimated used lines | Used height | Old → new reserve |
| --- | ---: | ---: | ---: | ---: | ---: |
| >640 / 641 px | 559 px | 87 | 2 | 32 px | 120 → 48 px |
| ≤640, ≥390 / 390 px | 320 px | 50 | 3 | 48 px | 184 → 64 px |
| ≤389, down to 320 / 320 px | 250 px | 39 | 3 | 48 px | 232 → 64 px |

Estimated lines at 641:
```text
company copy · no model here · the numbers are stand-ins except where a label says they
are the file’s own
```
Estimated lines at 390:
```text
company copy · no model here · the numbers are
stand-ins except where a label says they are the
file’s own
```
Estimated lines at 320:
```text
company copy · no model here · the
numbers are stand-ins except where a
label says they are the file’s own
```

These are shell geometry estimates, not observed browser layout or font measurements. Widths below 320 are unmeasured. The notice and new essay blocks are static first-paint content, so no changing-content reservation is needed for them.

## Checks run

All subprocess checks were bounded: lint 60 seconds, each build 120 seconds, and the in-memory Node render 60 seconds. All completed in under a second per command as reported by the command runner.

| Check | Result |
| --- | --- |
| `npm run lint` | Exit 0; exactly 1 existing warning, AttentionInspector.jsx:55:45 exhaustive-deps on `rows`; no errors |
| `npm run build -- --configLoader native` | Exit 0; 79 modules; Vite build 377 ms |
| `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co` | Exit 0; 60 modules; Vite build 115 ms |
| Both builds’ size advisory | Both report the existing >500 kB chunk advisory; no safety setting changed |
| Node App render, company and consumer | PASS; full App compiled in memory with installed Rolldown, rendered through React `renderToStaticMarkup`; no server, browser or DOM emulator launched |
| Company rendered header | 1 notice in the full App; directly after header; approved body matches after stripping markup; correct link and provenance-derived size |
| Consumer rendered header | 0 notices |
| Company rendered bar | 2 approved chips; 1 mode-hint; no mode-manifest / TeachPair |
| Consumer bar source comparison | PASS, byte-identical branch and LOAD_LABEL |
| Verbatim content and note/source comparison | PASS, both copies, five notes, six URLs, `count` with zero sources; no network/source-title re-verification attempted |
| Marks → notes / notes → marks | PASS: 0 missing, 0 orphan, both copies |
| Added-source and rendered-new-text house-name grep | 0 hits |
| `git diff --check` | Exit 0, no output |
| Staged index | Empty |

The Node render imported the actual App, essay and ModeControl after in-memory compilation with COMPANY false/true and fileFacts provenance supplied as the real build does. It checked the complete rendered notice count and header adjacency, then compared the approved notice text and the five note objects/mark phrases with the two supplied WORDS files. This proves server-rendered markup and source wiring, not browser behavior.

## Entry-bundle string counts

Consumer: `dist/assets/index-xDm0UYaF.js` — 464.71 kB raw / 158.23 kB gzip (Vite report).
Company: `dist-co/assets/index-C2nN8eym.js` — 452.34 kB raw / 154.00 kB gzip (Vite report).

Counts normalize JavaScript `\uXXXX` escapes and decode HTML entities, so the page glyph `’` also counts where HTML stores `&rsquo;`. The entire entry is counted, including note definitions; no lazy chunks were substituted for the entry. The sole failed expectation is identified below.

| Phrase | Consumer | Company |
| --- | ---: | ---: |
| `The dial that does move is how far a rule carries` | 1 | 1 |
| `One morning’s count` | 1 | 1 |
| `THE CONVERSATION — THE RATE` | 1 | 1 |
| `the task horizon` | 1 | 1 |
| `lost in the middle` | 1 | 1 |
| `one count is not a measurement` | 1 | 1 |
| `steps or a curve?` | 1 | 1 |
| `the scaling curves` | 1 | 1 |
| `THE COMPANY COPY` | 0 | 1 |
| `This is the company copy of The Fixture and the Part` | 0 | 1 |
| `no model · nothing downloads` | 0 | 1 |
| `the numbers are stand-ins except where a label says` | 0 | 1 |
| `no model in this copy` | 0 | 0 |
| `this copy does not download the model` | 0 | 1 |
| `the full version downloads` | 0 | 0 |
| `everything here is illustrative — deterministic stand-ins` | 1 | 0 |
| `LOAD THE REAL MODEL (83.5 MB)` | 1 | 0 |
| `real mode needs an 83.5 MB download, once` | 1 | 0 |

The consumer’s illustrative TeachPair string remains once as required by the consumer exception. Company `this copy does not download the model` = **1 (FAIL; required 0)**, solely in the original section 07 card. The removed company bar text contributes 0. All eight section 10 counts equal 1 in each entry. Consumer notice/chip counts are 0; consumer load-label and load-hint counts are both 1.

## Protected files and external activity

No protected file was written by this builder. Byte comparison with arrival commit `008e64d` confirms passFacts, bakedPass, passCore, the baker, OPENER and both start commands unchanged:

| File | Current SHA-256, identical to arrival |
| --- | --- |
| `src/content/passFacts.json` | `1b7a5be47dd726ba5010389a838afec8469bca6806cf6b884c511520762c2059` |
| `src/lib/bakedPass.js` | `3767c4ea8f7822516db723c7506b27617b31b558b9e21f668fcc81dcf1f28a29` |
| `src/lib/passCore.js` | `6c5e3593a469c827cfc5f17e26091e080f59bedd321106bc4655676b79f628d1` |
| `scripts/bake-pass.mjs` | `f6fcaca332078919bdc94d2e948ea76b3243db03083a2748bbec0f3be3101762` |
| `OPENER.md` | `15ee29ab57bc356fb284684280f9e9c3209b214c8c87c391ce67fd0a83a0058a` |
| `Start Fixture and Part — company copy.command` | `8a25d4538fbf8ed3a3721247153e07e433be86559a00150b42801e35ddfe3221` |
| `Start Fixture and Part — public copy.command` | `0c79eb382011d5d32e46ac789d5ee7d106108708337a7306741566db0690ae60` |

While this run was active, the caller/lane advanced HEAD to `000e6d7` in a commit changing **only STATUS.md** (510 → 511 lines). A fixed-HEAD verification initially stopped on that move; the commit was inspected and checks were rerun against arrival base `008e64d`. STATUS matches the new committed HEAD and was not edited here. A separate external writer corrected BRIEF-2-REPORT.md (385 → 385 lines), documenting its own prior handback after the lane’s commit. That edit remains unstaged and was not altered here. Neither external change touches this builder’s five source files. Other tracked protected/design files have no working-tree diff.

## Files written by this builder

| File | Before lines | After lines |
| --- | ---: | ---: |
| `src/content/essay.js` | 394 | 408 |
| `src/content/claimNotes.js` | 257 | 297 |
| `src/App.jsx` | 1097 | 1103 |
| `src/components/ModeControl.jsx` | 151 | 141 |
| `src/company.css` | 370 | 370 |
| `design/reading-pass-2026-10-28/BRIEF-3-REPORT.md` | absent | 157 |

This new report is ignored by the repository, as `git check-ignore` confirms. It exists on disk and is not staged. Build outputs are under the existing ignored dist/ and dist-co/ directories. No tracked build output was changed.

## Browser proofs — UNRUN, caller-owned

No browser or GUI application was launched. Actual fonts, the notice’s visual layout, the shorter bar’s fit/spare space at all three bands, clipping/scroll, dynamic interactions, claim-note placement and CLS are **UNRUN** here. No CLS value is claimed. The caller must perform the browser acceptance proofs; the reservation estimates above do not substitute for them.

## git status --short — final section

```text
 M design/reading-pass-2026-10-28/BRIEF-2-REPORT.md
 M src/App.jsx
 M src/company.css
 M src/components/ModeControl.jsx
 M src/content/claimNotes.js
 M src/content/essay.js
```

FAIL — Company bundle retains one existing section 07 “this copy does not download the model” occurrence; the brief requires zero.
