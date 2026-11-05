# FIG.7 fix 1 — budget note above the share bars

Implemented in the shared `Lookup()` in `src/figures/DiesFigure.jsx`; both layouts receive the same move. Removed the `dies-note-ground` rectangle, its comment, and its sole rule in `src/styles.css`.

All coordinates below are local to `Lookup()`. The wide layout has no y offset; the stacked layout adds 434.

| Element | Old y | New y |
| --- | ---: | ---: |
| Budget note text baseline | 285 | 260 |
| Share bars, top–bottom | 248–256 | 273–281 |
| Baseline guide | 256 | 281 |
| Seven pour starts | 257 | 282 |
| Landing top | 364 | 364 |

The weights remain at y 239. The shared `textLines` helper confirms the unchanged budget sentence occupies one line in both layouts. Its baseline at 260 is above the bars at 273. Each pour now spans at least 82 units vertically (364 − 282), exceeding the 60-unit minimum. No note ground remains to mask the paths.

The viewBoxes remain **680 × 414** and **300 × 848**. Their matching CSS aspect-ratio reserves are unchanged. Every figure word is unchanged: reversing only the four y-coordinate edits and the deleted rectangle/comment reproduces the original figure fingerprint exactly. Restoring only the deleted CSS rule reproduces the original stylesheet fingerprint exactly.

Checks actually run:

- `npm run lint`: exit 0, one standing warning: `src/instruments/AttentionInspector.jsx:57:45: warning react-hooks(exhaustive-deps): React hook useMemo depends on \`rows\`, which changes every render help: Try memoizing this variable with \`useRef\` or \`useCallback\`.`
- `npx vite build --configLoader native`: exit 0; 82 modules; built in 397 ms. Public bundle: `dist/assets/index-Ce6MgAre.js`.
- `VITE_COMPANY=1 npx vite build --configLoader native --outDir dist-co`: exit 0; 63 modules; built in 144 ms. Company bundle: `dist-co/assets/index-Dejvy8Tc.js`.
- Both builds printed the chunk-size advisory for chunks above 500 kB. No build error. Commands used installed local tools with npm offline mode, closed stdin, and a 120-second limit per check.
- `git diff --check`: exit 0.
- Before/after SHA-256 comparison of 193 tracked and untracked worktree files: only `src/figures/DiesFigure.jsx` and `src/styles.css` changed. Other builders' existing changes were preserved.

Browser/GUI proofs **UNRUN**, including visual continuity, responsive rendering and measured CLS. Those belong to the caller. The fixed viewBoxes and CSS reserves were verified in source; measured CLS 0 is not claimed here. No browser, GUI, network request, staging, commit, or push was performed.

`git status --short` in the worktree after the fix (all listed paths were already dirty or untracked on entry; this report is at the separately authorized parent-project path):

```text
 M README.md
 M src/App.jsx
 M src/company.css
 M src/content/essay.js
 M src/figures/LoopFigure.jsx
 M src/figures/figFormat.js
 M src/instruments/AttentionInspector.jsx
 M src/instruments/GlassPass.jsx
 M src/lib/tour.js
 M src/lib/toyModel.js
 M src/styles.css
 M vite.config.js
?? src/figures/DiesFigure.jsx
```

DONE BRIEF — FIG.7 fix — note above bars; mask removed; lint and both builds pass; browser proofs unrun.
