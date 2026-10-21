# BUILD BRIEF — the repo page (README, banner, icon, stills), branch `the-readme`

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; zero human steps where a machine can carry them; nothing superfluous. Principles served: make the interface truthful (every still is the page's own bytes; every number read first-hand), ship the whole product (a stranger lands on github.com and knows what this is and how to run it in one read), prove quality before declaring completion.

## What this is

The repository's GitHub page is the README. Today it opens as a developer's layout note with no picture, a stale status paragraph (it still names the `forward-pass` branch; instrument F shipped in August) and no install walk. Bill's ask, 2026-10-21: "clear instructions on how to install it; what Fixture and Part represents; a compelling icon, image, banner." There is NO lab module in this project — the interactive parts are the six live instruments A–F and the real-model mode; say that, not "lab".

You are an Opus builder. Work in your git worktree on branch `the-readme` off main fecb80b. Commit on this branch only. Do NOT merge, deploy, or edit STATUS.md, OPENER.md, anything under `src/` except nothing — the one shipping file you may touch is `public/favicon.svg` (and only to redraw the same motif crisper). Everything else you make lives in `README.md` and a new folder `docs/readme/`.

## Read first

- `README.md` as it stands — keep its Layout block and the three paragraphs after it (they are accurate), moved to the end under "Inside".
- `src/content/essay.js` — the header (`titleHtml`, `sub`, `legend`) and section 02's first two paragraphs. The words for "what it represents" are COPIED from there, never improved: the subtitle verbatim, and the fixture/part sentences verbatim ("Weights are the tooling. Activations are the workpiece." · "These are the weights: machined once during training, then bolted down. A model in use never modifies them." · "What moves is the activation: one vector per token …").
- `public/favicon.svg` — the house motif: two steel rails, the amber part between. `src/styles.css` lines 33–71 — the palette: paper `#F4F5F7`, ink `#14161A`, steel `#1E5AA8`, amber `#F2B705`, amber ink `#7A5900`, keys green `#2C7539`, hair `#DCDFE4`.
- `Start Fixture and Part.command` — the Mac double-click launcher.
- The memory note on the Dell: on Windows, build through PowerShell, never Git Bash — Git Bash mangles `VITE_BASE=/fixture-and-part/` into a Windows path and the deployed bundle ships broken links.
- STATUS.md ## Important, the harness bullets (CLS, reduced motion, one browser at a time).

## Deliverables, in order

### 1. README.md — for a stranger, top to bottom
1. The banner image first (`docs/readme/banner.svg`, relative path), then the title as an H1 and the subtitle verbatim as one italic line, then the live link on its own line: https://bill-viking.github.io/fixture-and-part/
2. "What it is" — four to six plain sentences: an interactive essay in the idiom of an engineering drawing; ten sections; six live instruments; a real GPT-2 (distilgpt2, ~83 MB, fetched from huggingface.co on request, WebGPU with a WASM fallback) running in the browser, nothing sent anywhere; with no model loaded every number outside instrument E is an illustrative heuristic and is labelled so. Then "What the name means" — the verbatim fixture/part sentences above with one framing sentence of yours, and the three-colour legend (steel, amber, green) exactly as the header's legend reads.
3. One still of the page (`docs/readme/page-1280.png`) and one of instrument F, the forward-pass drawing (`docs/readme/forward-pass-1280.png`), each with a one-line caption saying which section and that it is the page's own render.
4. "The instruments" — a six-row table: letter · name · section · what it shows (one clause each, from the README's existing Layout lines).
5. "Run it on your machine" — prerequisites first (Node 20 or newer and npm; the versions you built with, read from `node -v` / `npm -v`), then exactly:
   ```
   git clone https://github.com/Bill-Viking/fixture-and-part.git
   cd fixture-and-part
   npm install
   npm run dev
   ```
   then "open http://localhost:5173"; the Mac double-click launcher named in one line; the real model loads on the page's own button, ~83 MB once, cached by the browser after. `npm run build` / `npm run preview` in one line each.
6. "Deploy to GitHub Pages" — the existing VITE_BASE recipe, plus the gate (every path in `dist/index.html` must start with the base) and the Windows PowerShell rule in one line.
7. "Inside" — the existing Layout block and its three paragraphs, verbatim.
8. A last line: drafted August 2026, from a conversation between Bill (Seattle) and Claude (Anthropic) — the essay footer's own words.
House style: sentence case headings, plain verbs, no exclamation points, no marketing words ("powerful", "beautiful", "stunning" are out). Every relative link must resolve to a file in the branch; every URL must answer 200 (fetch each once and record the status in the report).

### 2. The banner — `docs/readme/banner.svg`
1280 × 320, paper ground, the motif at the left (two steel rails, the amber part between, as the favicon draws it, scaled with 2 px rails), the title in the display face stack with safe fallbacks (`'Space Grotesk','Helvetica Neue',Arial,sans-serif`) in ink, the subtitle in the body stack (`'IBM Plex Sans','Helvetica Neue',Arial,sans-serif`) in muted `#585F6A`, the three legend words at the foot in the mono stack (`'IBM Plex Mono',Menlo,Consolas,monospace`) each in its colour. NO external font or image reference of any kind (github.com blocks them); no `<script>`; no text outside the viewBox. Verify by rendering it in headless Chrome to a PNG (`--screenshot`) and looking at the PNG yourself (Read it): nothing cut, nothing overlapping. Also write `docs/readme/social-preview.png`, 1280 × 640, the same composition with more air (GitHub's social-preview slot; it cannot be set by API, so the lane will hand Bill the one upload move).

### 3. The icon
Redraw `public/favicon.svg` on a 64 viewBox, same motif and colours, rails 3 px, the part slightly taller, corners `rx` scaled; it must read at 16 px. Save the same drawing as `docs/readme/icon.svg` at 256 for the README's own use if you want it there (optional). Build must stay green and the built `dist/favicon.svg` must be your new file.

### 4. The stills
Serve the worktree with its own Vite on a free port (`npx vite --port 5181 --strictPort`, bash, backgrounded; kill it when done; the primary checkout's 5173 server is not yours). Headless Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. `page-1280.png`: `--headless --screenshot=<path> --window-size=1280,1400 --timeout=12000 http://localhost:5181/` — the header and section 01. `forward-pass-1280.png`: a CDP driver (Node's global WebSocket, a script in your scratchpad) with `Emulation.setEmulatedMedia` reduced motion on, scroll instrument F into view, `Page.captureScreenshot` with a clip of F's bounding box at 1280 wide — illustrative mode is fine (no model load), say so in the caption. Each PNG under 1.5 MB (downscale with `sips -Z` if over). Read each PNG yourself before you commit it.

### 5. Gauntlet and report
`npm run lint` (the one AttentionInspector warning is the baseline) and `npm run build` in the worktree, foreground, `pwd` in the output. Link check as above. `xmllint --noout` on both SVGs. Then `design/readme/REPORT.md`: every file with its byte size, the link table (path or URL · status), the versions, the still dimensions, and a short "suggested repo description and topics" block for the lane to set with `gh repo edit` on Bill's word — description under 160 characters, in the subtitle's own words; eight topics at most.

## Commits
Small commits on `the-readme`; force-add the two design files (`git add -f design/readme/BUILD-BRIEF.md design/readme/REPORT.md`); end every message with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
Report back: the branch head, the files touched with line counts, and anything you could not do, in plain words.
