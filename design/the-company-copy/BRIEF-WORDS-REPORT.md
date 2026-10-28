BRIEF WORDS — company copy hand-back

The approved company copy and height estimates are applied. All requested node gates pass, including consumer byte identity. One requirement remains unmet: the consumer button hardcodes its size, so the requested guarantee that both builds share the size's formatter and source cannot be made within the authorized edits.

Workspace: `/Users/bill/Projects/fixture-and-part/.claude/worktrees/company-look`.
Branch: `the-company-copy`; HEAD: `26ae68c560d804529b8bb01c297e003cd1d6c691`.
The starting tracked worktree was clean. Only the four authorized source files changed. No commit, push, branch change, network, browser, GUI, permission change, STATUS or OPENER edit was performed.

| Edit | Final location | Result |
| --- | --- | --- |
| A | `src/instruments/ForwardMap.jsx:2662` | Only the LIVE fine-print fragment gains `COMPANY ? 'run once when this copy was built' : 'run in this browser'`. |
| B | `src/lib/tour.js:561` | The LIVE done detail uses the approved company sentence; its consumer text and the lead stay unchanged. COMPANY was already imported. |
| C | `src/components/ModeControl.jsx:43` | First company hint uses the approved baked-pass sentence. |
| D | `src/components/ModeControl.jsx:45` | Third company hint follows the unchanged public-link hint; size uses `mb(__FILE_PROVENANCE__.bytes)`. Shared-source limitation below. |
| E1 | `src/instruments/ForwardMap.jsx:2719` | Company LoadNote names the schematic for any sentence but the page’s own. |
| E2 | `src/instruments/ForwardMap.jsx:3612` | Company landing note says this copy carries one pass for the page’s own sentence. |
| E3 | `src/instruments/ForwardMap.jsx:2603` | Compact company landing card uses the approved semicolon sentence. Wide company form unchanged. |
| Height | `src/company.css:356`, `:366`, `:369` | Reserves are 136 / 200 / 248 px; overflow behavior, 16 px line-height and 4 px gaps retained. |

Apostrophes: used typographic `’` in ForwardMap's new possessives and ModeControl C's `page’s`, matching the page's UI convention and the requested bundle-count spelling. ModeControl's neighboring hint text contains no apostrophe to copy. B and D contain none. A source comparison against tracked WORDS §8 passed, allowing only the instructed apostrophe normalization and D's data expression; no wording or punctuation was otherwise changed.

D's source discrepancy: `src/components/ModeControl.jsx:115` still literally contains `LOAD THE REAL MODEL (83.5 MB)`, and its consumer hint at `:122` also hardcodes the size. There was no consumer formatter expression to reuse. The company expression reuses `mb` from `src/lib/fileFormat.js:7` and the build's existing `__FILE_PROVENANCE__.bytes` value. This is equivalent to section 07's `mb(BUILT.bytes)` in `src/App.jsx:104`, with `BUILT = __FILE_PROVENANCE__`. The existing Vite define reads `src/content/fileFacts.json` provenance; no new JSON import or data change was needed. Node read 83,502,375 bytes and formatted them as `83.5 MB`. No size literal was added to source. Both labels agree now; guaranteeing future agreement would require an authorized consumer change and a revised byte-identity contract. That work was not performed.

Height estimate: rendered hints have 189 / 161 / 128 characters (C / existing link / D, including spaces and punctuation, excluding markup). Assume approximately 6.4 px per character; capacity is `floor(rowWidth / 6.4)` and lines are `ceil(characters / capacity)`. Global border-box sizing, `.wrap`'s 760 px maximum, its 24 px side padding (18 px at ≤640), the instrument's two 1 px borders, and `.inst-body`'s two 16 px paddings give `rowWidth = min(viewport, 760) − outerPadding − 2 − 32`. The mode bar adds no horizontal padding.

| Width sample | Row px | Characters/line | C lines | Link lines | D lines |
| --- | ---: | ---: | ---: | ---: | ---: |
| Full maximum: 760 | 678 | 105 | 2 | 2 | 2 |
| Full narrow edge: 641 | 559 | 87 | 3 | 2 | 2 |
| First max-width: 640 | 570 | 89 | 3 | 2 | 2 |
| Middle narrow edge: 390 | 320 | 50 | 4 | 4 | 3 |
| Second max-width: 389 | 319 | 49 | 4 | 4 | 3 |
| Narrow sample: 320 | 250 | 39 | 5 | 5 | 4 |

Max-width samples alone would under-reserve their ranges' narrower widths. The selected reserves use each range's narrow sample, then add one spare line for wrapping uncertainty:

| CSS range | Estimated lines C + link + D | With one spare line | Height: Σlines × 16 + 8 |
| --- | --- | ---: | ---: |
| >640 px | 3 + 2 + 2 | 8 | 136 px |
| 390–640 px | 4 + 4 + 3 | 12 | 200 px |
| ≤389 px, estimated down to 320 | 5 + 5 + 4 | 15 | 248 px |

These are arithmetic estimates, not measured line counts. The caller's browser proof must measure actual fonts, word wrapping, clipping, spare space and CLS, and correct the three numbers. Widths below 320 were not estimated.

Every requested subprocess ran in the foreground with `pwd` printed and a 120 s bound. No timeout occurred.

| Check | Exit | Result |
| --- | ---: | --- |
| `npm run lint` | 0 | Exactly one baseline warning: `AttentionInspector.jsx:55:45`, react-hooks exhaustive-deps on `rows`. |
| `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co` | 0 | Entry `dist-co/assets/index-BG1_mLu6.js`; existing large-chunk advisory. |
| `npm run build -- --configLoader native` | 0 | Entry `dist/assets/index-CdkDlCqv.js`; existing large-chunk advisory. |
| Bundle counts and consumer byte comparison | 0 | Every required count and byte gate passed. |
| Approved source forms and changed-file scope | 0 | Approved forms match; changed tracked files are exactly the authorized four. |
| Provenance formatter read | 0 | 83,502,375 bytes → `83.5 MB`. |
| `git diff --check` | 0 | No whitespace errors. |
| `git status --short` | 0 | Four modified source files, listed below. |
| `git diff --stat` | 0 | Four files; 18 insertions, 14 deletions. |

Company entry counts (literal UTF-8 spelling; expected = actual):

| Phrase | Expected | Actual |
| --- | ---: | ---: |
| `run once when this copy was built` | 1 | 1 |
| `run in this browser` | 0 | 0 |
| `It ran once, when this copy was built` | 1 | 1 |
| `never a company one` | 1 | 1 |
| `this copy runs none` | 0 | 0 |
| `which this copy does not run` | 0 | 0 |
| `for the page’s own sentence` | 2 | 2 |
| `for any sentence but the page’s own` | 1 | 1 |
| `one pass of the page’s own sentence was run then and kept` | 1 | 1 |
| `Load it above` | 0 | 0 |
| `fixed in this copy` | 1 | 1 |

Consumer entry counts:

| Phrase | Expected | Actual |
| --- | ---: | ---: |
| `run in this browser` | 1 | 1 |
| `never a company one` | 0 | 0 |
| `run once when this copy was built` | 0 | 0 |

Consumer snapshot was saved before source edits as `design/the-company-copy/WORDS-CONSUMER-BEFORE-index-CdkDlCqv.js`. Before and after entries are each 429,407 bytes. Direct byte comparison passed.

| Entry | SHA-256 |
| --- | --- |
| Before: `dist/assets/index-CdkDlCqv.js`, preserved in the snapshot | `b67a3d67a64585bea9cb662c195ad5496d99dcf61e436a9e7affb59046ab2aee` |
| After: `dist/assets/index-CdkDlCqv.js` | `b67a3d67a64585bea9cb662c195ad5496d99dcf61e436a9e7affb59046ab2aee` |

Final tracked status and fingerprints:

| Status / file | SHA-256 |
| --- | --- |
| ` M src/company.css` | `dadfabcfd36166788c4f2d2e522afa6f5ba8ed733d21dd762ec9baa4fb3b0a17` |
| ` M src/components/ModeControl.jsx` | `dd00a53ba4d5c5ad773ee73e753bc0c18cb0de49b9760b1d010f34c2073db008` |
| ` M src/instruments/ForwardMap.jsx` | `56db1292afd39d9660a95b2d9e3c77074259e11ce7f88c710b7666fd1a1761b1` |
| ` M src/lib/tour.js` | `7f1caf97c0a42845002b8cf16e51c75f0fa29518bd595c5794af2e8e9086b7be` |

```text
 src/company.css                | 12 ++++++------
 src/components/ModeControl.jsx |  4 +++-
 src/instruments/ForwardMap.jsx |  8 ++++----
 src/lib/tour.js                |  8 +++++---
 4 files changed, 18 insertions(+), 14 deletions(-)
```

The report and preserved consumer snapshot live in the gitignored design folder. Browser proofs are UNRUN here and belong to the caller: mode-bar line counts and clipping at all three ranges, loaded/fallback font fit and CLS, rendered copy and tour behavior, baked drawing parity, and no model request. No browser or GUI was launched.

FAIL WORDS — The consumer’s hardcoded size blocks the shared-source guarantee; approved copy is applied and all requested node gates pass.
