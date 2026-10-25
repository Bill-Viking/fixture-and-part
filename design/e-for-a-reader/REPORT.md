# REPORT — E for a reader (instrument E: what follows what, and the pick on the curve)

Written 2026-10-25 by the F&P lane on the Mac from three hand-backs and the lane's own re-run. SHIPPED: main `e920502`, gh-pages `9655b3d` "Deploy e920502", live bundle `index-ngwa3KU6.js` (430,688 bytes) verified by the lane's cache-busted fetch at 07:34:23.

## What it is
Bill's two findings from reading the live page 2026-10-22 ("confusing layout, where is the 'different tensor on the bar above it'"; "the bell curve doesn't update when I click on panes"), answered with the words in `WORDS.md` (Bill's go 2026-10-24), built from `BUILD-BRIEF.md` in two parts:
- the head's purpose sentence says the chain (choose in the list or on the bar → the window shows its bytes, the curve the spread of all its values);
- the bar's label names the bar (`the bar — the whole file, drawn to scale`); the bar's "?" tag carries the same words (the lane's own line, 2026-10-25);
- the curve gets a one-line eyebrow naming whose values it holds, from one `tensorNoun` helper shared with the window's eyebrow, so the two can never name the tensor differently;
- the picked square is marked on the curve (an amber bar one bin wide, the curve's full height, over the fill) and named in a reserved line under the stat line with its share of the whole tensor and its count in the window; `binOfFloat` shared with the histogram so the mark and the curve agree.

## The commits (branch `e-for-a-reader`, rebased onto main `eeec3cd`, fast-forwarded into main)
- `abebadd` Part A, the build — Astra, headless (`codex exec`), about 6 minutes, neither meter: `FileView.jsx` +69/−17, `onnxScan.js` +7/−5, `styles.css` +8.
- `718230e` Part B's fit fix — the pick line reserves three lines at 640 and below (45 px, was 30) and four at 389 and below (60 px); no word or type size changed.
- `ebc56cc` Part B's six stills (`stills/`).
- `e920502` the lane's line: the explainer title of the bar's "?" tag → `the bar — the whole file, drawn to scale`.
Before the force-push rewrite of 2026-10-24 these were `f87d09f` · `64f8a72` · `48e5012` · `17f6875`.

## Part A's own checks (Astra, 2026-10-24)
Lint: exit 0, the one baseline AttentionInspector warning. Build: exit 0 with `npm run build -- --configLoader native` (the plain build hits EPERM writing its temp config through the worktree's shared `node_modules` symlink). The four brief strings in the bundle. The float-bin helper matches the prior histogram code over all 50 shipped float windows. Part A's own flag: the 30 px pick line may not fit the long wording at 390 — true, fixed in Part B.

## Part B, the proof (an Opus 5.5 helper with Chrome, 2026-10-24)
Control = `git archive main` at the fork, served on its own port; one headless Chrome at a time (`--remote-debugging-port=0`); reduced motion on; the real model loaded ("read live").
1. Lint and build again on the head: exit 0 both; the bundle strings present.
2. Strings from the DOM at 1280 and 390, shipped and live readings: 16 of 16 picks matched WORDS character for character, 0 differed — the purpose sentence; the bar label; the curve eyebrow for the word table, the position table, `block 2 · h.2.mlp.c_fc`, and two f32 vectors (each eyebrow's noun equal to the window eyebrow's noun); the idle line (grey, no mark drawn); the picked byte line; the picked f32 line; both `under 0.1%` forms.
3. Numbers, recomputed independently from the shipped `fileFacts.json` histogram and the window's own bytes, every one exact to the line:

   | tensor | pick | bin | counts[bin]/n | window | line |
   |---|---|---|---|---|---|
   | wte | byte 148 | 148/256 | 260,880/38,597,376 → 0.7% | 7 of 1,536 | exact |
   | wpe | byte 127 | 127 | 668,885/786,432 → 85.1% | 1,233 of 1,536 | exact |
   | block 2 c_fc | byte 16 | 144 | 11,330/2,359,296 → 0.5% | 9 of 1,536 | exact |
   | h.2.ln_1.weight (f32) | +0.3444 | 48/64 | 211/768 → 27.5% | 1 of 64 shipped · 1 of 768 live | exact |
   | h.2.mlp.c_fc.bias (f32) | −0.1780 | 24 | 188/3,072 → 6.1% | 1 of 64 shipped · 1 of 1,536 live | exact |

   Every arrow-key pick matched too. Bin endpoints agree with Part A's table (u8 byte 0 → bin 0, 255 → 255; i8 byte 0 → bin 128, 255 → bin 127). Note: before the model loads an f32 window is the 64 shipped values; live it is the whole vector — WORDS' "of the 768" is the live case.
4. The mark: `x = bin·680/bins` exactly, width 680/bins, y 0, height 104, after the zero mark and the fill (a hit test at its centre returns the pick rect); the four arrow keys move it; Escape, a click in the canvas gutter, a tensor switch from the list or the bar, and ROWS →/← each clear the mark and the line.
5. Fit: the longest real lines over every window page of all 76 tensors (245,250 distinct lines) are 142 characters (byte) and 146 (f32). Lines needed at 1280/1024/768/641/640: 2; at 390: 3; at 360/349/320: 4. Before the fix the third line was clipped at 390 and two lines at 360 and 320; thresholds from a 1 px scan: three lines from 534 px down, four from 386 down. After the fix nothing clips down to 320. The curve eyebrow ellipsizes by design: never at 1280/1024/768; at 641 only the position table; at 390 every tensor after the noun; at 360 and 320 inside the noun.
6. Layout shift: every action 0 on both measures (`cls` and `raw`, no shift entries), branch and main, 1280 and 390, E fully in view — model load, a click in the window, ArrowRight/Down/Left/Up, Escape, re-pick, a tensor switch from the list, the under-0.1% cell, a tensor switch from the bar, a switch to an f32 vector. Load 0.002287 (1280) / 0.002172 (390), the positive control 0.02, both trees alike. Static height changes, branch minus main: +70 at 1280 (purpose 1→2 lines +19, eyebrow 15 + 6 margin, pick line +30) · +51 at 641 · +89 at 390 (eyebrow +21, pick line +45, the bar's label row +23) · +140.31 at 360.
7. Type and contrast: the curve eyebrow, the window eyebrow and the pick line render at 10 px at 1280, 1024, 768, 641, 390. Pick-line ink #7A5900 on the white card 6.45:1; idle ink #585F6A 6.44:1; eyebrow ink #1E5AA8 6.81:1. The amber mark #F2B705 against the curve fill #5588C4 is 2.02:1 and against the ground #EBEDF0 1.55:1 — it relies on hue (finding 1 below).
8. Focus and names: the Tab walk through E counts the same on main and the branch, none unnamed — 108 stops before the model loads (76 list rows, 26 bar pieces, 4 info tags, the canvas, the load note), 109 after (the load note leaves, the two ROWS buttons join).
9. Stills, read before committing: `branch-1280-e-idle.png`, `branch-1280-curve-byte-pick.png` (word table, byte 148), `branch-1280-curve-f32-pick.png` (h.2.ln_1.weight), `branch-390-curve-byte-pick.png` (block 2 c_fc, the under-0.1% line on three lines, unclipped), `main-1280-e-idle.png`, `main-1280-curve.png`.
Caveats: the model copy under `node_modules/@huggingface/transformers/.cache` has a different sha from the shipped file (83,502,666 bytes), though all 76 histograms and shipped windows match it exactly; every in-browser number came from the served file, whose sha matches. Height changes at 1024 and 768 were measured but not run through the shift battery.

## The ship (an Opus 5.5 helper from the lane's ship brief, 2026-10-25 07:3x; 175 s)
1. Rebase onto main: four of four replayed, no conflict.
2. Lint on the rebased head: exit 0, the one baseline warning. Build (`--configLoader native` in the worktree): exit 0, 434 ms; worktree bundle `index-CYOLT046.js`.
3. Bundle counts: `the bar — the whole file, drawn to scale` 2 · `the whole tensor, not only the window` 1 · `click a square in the window and its value is marked here, on the curve` 1 · `squares in this window hold it` 1 · `Choose one, in the list or on the bar` 1 · `in a bin that holds` 1 · the old label `the file, drawn to scale` 0.
4. `merge --ff-only` into main: eeec3cd → e920502; pushed; the branch pushed with lease (17f6875 → e920502).
5. Pages build in the primary checkout (`VITE_BASE=/fixture-and-part/`, plain, no EPERM): 388 ms; path gate, six values, every one `/fixture-and-part/…` or `https://…` (the favicon, the fonts, `index-ngwa3KU6.js`, `index-GvOHarGU.css`); the built bundle 430,688 bytes.
6. Deploy by the gh-pages worktree recipe: `9655b3d` "Deploy e920502" over 5730f65, pushed; the scratch worktree removed and pruned.
7. Live: tries 1 and 2 (07:32:38, 07:33:08) still served `index-5X6Dlb5_.js`; try 3 at 07:33:39 served `index-ngwa3KU6.js`, 430,688 bytes, the six counts as in step 3, the old label 0.

## The lane's own re-run (Fable, 2026-10-25 07:34)
`git log main`: e920502 · ebc56cc · 718230e · abebadd · eeec3cd; origin/main = e920502; origin/gh-pages = 9655b3d "Deploy e920502"; tree clean. A cache-busted fetch of the index at 07:34:23 named `index-ngwa3KU6.js`; the served bundle 430,688 bytes; counts 2 · 1 · 1 · 1 · 1 · 1, the old label 0, `file-curve-pick` 2, the old purpose sentence absent. The two 1280 stills read by the lane before "ship it?" (the head through the bar; the byte pick with its mark and line) and shown to Bill; his "ship it" 2026-10-25 07:2x. The E worktree removed after the ship; the branch kept.

## Findings ruled with the ship
1. The amber mark's contrast (2.02:1 on the fill, 1.55:1 on the ground; about 1.2 px wide at 390): LEAVE IT — the line under the curve names the same value in amber ink at 6.45:1, so the mark is never the only carrier; filed as a candidate (a thin dark edge on the mark, one CSS rule).
2. The longer bar label wraps at phone widths (the "?" tag to its own line at 390, +23 px; two lines and the tag a third at 360 and 320, +40 px): LEAVE IT — static, nothing clipped, no shift; filed with the phone paint items.
3. The site's fixed colour key can cover the pick line's right end on a phone (seen in the first 390 still): filed with the phone paint items.
4. The bar's "?" tag was still named by the old label after Part B (explainers.js was outside the builder's remit): the lane renamed it before the ship (`e920502`).
