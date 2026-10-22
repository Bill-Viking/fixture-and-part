lane: F&P
written: 2026-10-22T10:10-07:00
by: ACT — F&P: pick the next arc (Mac) · buttoned up at the usage pause; the F build merged, not deployed
on: MAC
head: b87fc0f
status_updated: 2026-10-22T10:10-07:00
where: the F build is on main (b87fc0f) and NOT yet live; deploy first, then the next pick
next: machine
depends_on: nothing
open_in: ~/Projects/fixture-and-part on the Mac, or D:\Projects\fixture-and-part on the Dell (folder name `fixture-and-part`, reuse) · fresh Claude session titled `ACT — F&P: ship the F build, then the next pick`
model: OPUS · HIGH for the first stretch (the deploy and its verification are mechanical: the recipe below, every number read first-hand); then the next pick with Bill is judgment — ASTRA while Fable sits over the pause line (91 percent at 2026-10-22 09:5x; the week resets Tue 2026-10-27 03:59 Pacific), FABLE after the reset.
judgment: none in the deploy; the next pick and any words after it (ASTRA or FABLE, never Opus).
remaining: 1 short sitting to deploy and record; then the next pick is its own
---
read the project status/memory first. You are the F&P lane (FIXTURE⊕PART). DEPENDS ON: nothing — this lane rides GitHub: `git pull` in the project folder first, and confirm main is at the head pinned above (or later, by docs commits only).

Ritual in one line of receipts: clock; `sync.py pull` from the orchestrator-sync folder (`python3` on the Mac, `python` on the Dell); `git pull` and `git log --oneline -3` in the project; one-writer check (`tools/who-is-live.py --pen --lane "F&P"` in the hub folder — quote the ampersand); stamp and claim the lane (`tools/i-am.py`, `tools/claim.py --claim "F&P"`); title yourself `ACT — F&P: ship the F build, then the next pick`. Read STATUS.md ## Now (the top block is the 2026-10-22 button-up) and ## Important ("F for a reader").

Deliver WHERE WE ARE first, plain words, Sal register:
- Arc goal, last time: F for a reader — six fixes to the forward-pass drawing from Bill's reading of the live page (one card at a time, the click rides the run, two clauses in the head, the stations label, the curves legend, the wall-cell card in instrument E's grammar). BUILT by an Opus builder, VERIFIED by the lane (its own card-test re-run), MERGED to main b87fc0f — and NOT DEPLOYED, because Bill said "button up" at the usage pause (Fable 91 percent).
- Already happened today: ✅ five ships live (the superposition sentence, the seam's credit line, the clerk-and-the-life callout, the reader's footing with the glossary strip and the harness readout, the README rewrite) · ✅ Bill read the whole live page and twenty-odd findings are filed in STATUS ## To do with his words · ✅ the F build merged.
- Right now: main is ahead of the live page by the F build. Nothing else in flight; tree clean; no worktree open.
- MACHINE'S FIRST MOVE, no ruling needed: DEPLOY main as it stands and verify it live. On the Mac: `VITE_BASE=/fixture-and-part/ npm run build`; gate every `src`/`href` in `dist/index.html` to `/fixture-and-part/` or `https://`; `git fetch origin gh-pages`, `git worktree add -B gh-pages <tmp> origin/gh-pages`, `git -C <tmp> rm -rq .`, copy `dist/.` in, commit "Deploy b87fc0f", push, `git worktree remove --force <tmp>`, prune; then a cache-busted fetch of the index every 30 s for up to ten minutes (Pages took nine on 2026-10-22) until it names the new bundle, fetch the bundle and grep `SIX STATIONS, TOP TO BOTTOM` and `is honoured and the tour keeps going`; write the bundle's name and bytes and the time into STATUS ## Now and the "F for a reader" bullet; commit, push. On the Dell, build only through PowerShell (## Important, the Git Bash trap).
- Bill's next move, after the deploy: pick what is next. Hand him the open candidates from STATUS ## To do in ONE list, plain words, ranked, the lane's recommendation first and one line of why each — the lane's read: "the contrast" (words already proposed in `design/the-contrast/WORDS.md`, waiting on his go or strike) · the E bundle ("E says what follows what" + "the pick on the curve") · "B says what it is doing" · the words fixes in 04/05/06/07/08 as one small sitting ("FIG.8" with the softmax gloss, "the hinge between 04 and 05", "the control sentence in 05", "06 says what the reshaping is for", "how the brain gets around it", "08 says which way feedback runs") · "the lineage of the seam" and "the brain's side of the shop" and "living like us" (each needs a Sonnet reader on its sources first) · "one multiplication, shown" then "the pass in 3D". Ask ONE question: which, or none.

Standing cautions: the words are Bill's — copy them, never improve them; price his side at his rate — one ruling per ask with the recommendation first, a still over a walk; the harness refuses a subagent a file named REPORT.md — the lane writes the report from the hand-back and its own re-run; the harness traps in ## Important (one browser at a time when scoring CLS; headless Chrome must pick its own debugging port, 9333 is another session's; reduced motion for a CDP harness with instrument F on screen except the tour's own timing tests; a branch's dev server from its own worktree with its own Vite config and cacheDir — the worktree's node_modules is a symlink to the primary's; the build tool's background commands can lose their `cd`; `sips -c` crops from the centre). The usage gate: under a USAGE PAUSE line Bill's two words are carried, never discussed.

Close per the ritual: STATUS ## Now updated, OPENER.md rewritten, commit + push, release the claim, stamp off, retitle ARCH.
