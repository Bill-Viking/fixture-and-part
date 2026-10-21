# REPORT — the repo page (README, banner, icon, stills), branch `the-readme`

Built by an Opus 5.5 builder in a worktree on 2026-10-21 (commits 5637616 the icon · ddc3c77 the banner and the social preview · 552606c the stills · c57c1c3 the README), off main b6e7178. The builder was refused by the harness when it tried to write this file; the lane (Fable, session "ACT — F&P: pick the next arc", Mac) wrote it from the builder's hand-back and its own re-run, 2026-10-21 16:4x.

## Files (the lane's own `ls` and `git diff --stat`, after the lane's crop)

| file | lines / bytes |
|---|---|
| `README.md` | 265 lines, 14,459 bytes before the caption edit |
| `public/favicon.svg` | 6 lines, 394 bytes — the motif on a 64 grid, 3 px rails, its own dark-tab colours kept |
| `docs/readme/icon.svg` | 6 lines, 396 bytes |
| `docs/readme/banner.svg` | 29 lines, 2,087 bytes — one `http` string, the SVG namespace; no external font or image |
| `docs/readme/page-1280.png` | 1280 × 1400, 192,544 bytes |
| `docs/readme/forward-pass-1280.png` | 1280 × 1300, 596,896 bytes — the lane cut the builder's 1280 × 3119 (1,216,521 bytes) to the top of the drawing (a Chrome render of the full still in a 1280 × 1300 window; sips crops from the centre), caption amended |
| `docs/readme/social-preview.png` | 1280 × 640, 42,805 bytes — for the repo's Settings → Social preview slot, which no API sets |

## The lane's own gauntlet (worktree, foreground, `pwd` read)
- `npm run lint`: exit 0, one warning, the AttentionInspector baseline.
- `npm run build`: green, 67 modules, 375 ms; `dist/favicon.svg` byte-identical to `public/favicon.svg`.
- `xmllint --noout` clean on the three SVGs.
- The banner rendered by headless Chrome and read by eye: nothing cut, nothing overlapping; the page still and the cropped drawing read by eye.
- Links (the builder's run): the live site 200; the clone URL 301 → repo page 200, `git ls-remote` HEAD fecb80b; huggingface.co/Xenova/distilgpt2 200; the three relative image paths resolve.
- Versions: Node 26.7.0, npm 11.19.0, Vite 8.2.1.

## Choices
- The favicon keeps its own colours (dark ground, grey-blue rails, warm amber) — it reads on a dark tab bar; the banner uses the page palette.
- "Part" and the AMBER legend word are set in amber ink (#7A5900) beside an amber swatch, per the colour law (yellow is never text on the page ground).
- A small drawing-style block at the banner's lower right reads `10 SECTIONS · 6 LIVE INSTRUMENTS / GPT-2 RUNS IN THE BROWSER` — not in the brief; data-true; kept.
- "Inside" keeps the old README's Layout block and everything after it verbatim (the five paragraphs, Reading the model file, Design, Colour law), headings one level down; the stale Status, Run and Deploying sections are replaced by the new top half.
- The Mac launcher line says it expects the checkout at the recorded path, so a stranger edits its `cd` line.
- Commit trailers on the build commits name the model that did the work.

## Suggested repo description and topics (set only on Bill's word)
```
gh repo edit Bill-Viking/fixture-and-part --description "An interactive essay: how a language model thinks, how a brain remembers, and why the honest comparison flatters neither." --add-topic transformers,gpt-2,interactive-essay,explorable-explanation,webgpu,onnx,react,vite
```
