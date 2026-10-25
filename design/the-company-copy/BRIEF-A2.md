# BRIEF A2 — the company copy: three fixes from the proof (Astra, headless, no browser)

Quality bar: the machine notices, the human never checks; one plain sentence at the moment it is needed; the state visible on the surface; zero human steps where a machine can carry them; nothing superfluous. Principle served: make the interface truthful; design for the reader behind an office firewall.

Worktree `/Users/bill/Projects/fixture-and-part/.claude/worktrees/company-look`, branch `the-company-copy` (Part A `3ffc6cf`, the stills `ad931af`, rebased on main). Read `WORDS.md` §3 and §4 (both amended 2026-10-25 13:0x) and the Part A code you wrote (`src/lib/company.js`, `src/main.jsx`, `src/instruments/FileView.jsx`, `src/lib/tour.js`). Do not edit STATUS, OPENER, WORDS or the briefs. Commit if the road lets you; otherwise leave the edits and name them. No browser.

## 1. The third invitation — `src/lib/tour.js` ~423 (stop 5 of 19, the no-pass stop)
Today: `… the amber carriers and the landing all wait on the model. Load it above and this same tour speaks this sentence’s own weights.` In the company build (`COMPANY`), WORDS §4's added form: `… the amber carriers and the landing all wait on the model. With a model in hand this same tour would speak this sentence’s own weights.` (the curly apostrophe as the source has it). The consumer text unchanged.

## 2. E's window line — `src/instruments/FileView.jsx` ~1733–1737
The company form becomes `window ⟨n⟩ of ⟨m⟩ — fixed in this copy` (WORDS §3, amended): 39 characters, shorter than today's consumer line, so it fits at 390 and 360 where the first form was cut off.

## 3. The page's own font link never holds the company page blank
`index.html` carries a render-blocking Google Fonts stylesheet link (Space Grotesk, IBM Plex Sans, IBM Plex Mono, line 14–16) plus two preconnects. Behind a firewall that drops the host silently, the browser waits on that link before the first paint — the proof measured a blank page for 12 s and more on both copies. In the COMPANY build only:
- a small Vite plugin in `vite.config.js` (`transformIndexHtml`, applied only when `process.env.VITE_COMPANY === '1'`) removes that `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk…">` element from the built `index.html` (keep the two preconnects); the consumer build's `index.html` stays byte-identical to main's — prove it with `git diff --stat main -- index.html` (the source) AND a byte compare of `dist/index.html` from a consumer build against one built from `git archive main` (or against the live page's index at https://bill-viking.github.io/fixture-and-part/, whose only differences are the hashed asset names);
- `src/main.jsx`, in the existing COMPANY road: inject that same page-font stylesheet link the way the Barlow link is injected, and fold it into the SAME single 2.5 s race (one `Promise.race` over: the page-font stylesheet's load/error, the Barlow stylesheet's load/error, the five Barlow faces, and the page's own faces `400 16px "IBM Plex Sans"`, `400 14px "IBM Plex Mono"`, `600 24px "Space Grotesk"`) so the company page paints within 2.5 s at the latest with whatever faces have arrived, `display=swap` on both links. Keep `data-look` set and the local css awaited first, as now.
- Say in the hand-back which element the plugin removed (quote it) and that the consumer index is byte-identical.

## Checks (node-side, foreground, `pwd` printed; the worktree's build needs `-- --configLoader native`)
- `npm run lint`: exit 0, one baseline warning.
- `VITE_COMPANY=1 npm run build -- --configLoader native --outDir dist-co`: exit 0; `dist-co/index.html` has NO `fonts.googleapis.com/css2` link and still has the two preconnects; the company entry bundle: `Load it above` 0, `load it above` 0, `With a model in hand this same tour would speak` 1, `fixed in this copy` 1, `this copy holds this window only` 0, `fonts.googleapis.com/css2` 1 (the injected link's URL lives in the bundle now), `Barlow` ≥ 1.
- `npm run build -- --configLoader native`: exit 0; `dist/index.html` keeps the stylesheet link; the consumer entry: `Load it above` 1, `fixed in this copy` 0, `Barlow` 0, `LOAD THE REAL MODEL` 1.
- `git diff --stat main...HEAD -- src vite.config.js index.html`: index.html absent from the list (unchanged in source).
- Hand-back as text: the head sha (or the uncommitted file list with fingerprints), the counts, the removed element quoted, one line per decision; last line `DONE A2 — <one sentence>`.
