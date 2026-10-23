lane: F&P
written: 2026-10-23T04:48-07:00
by: ACT — F&P: ship the F build, then the next pick (Mac) · the F build deployed and verified live
on: MAC
head: 8832c45
status_updated: 2026-10-23T04:47-07:00
where: the F build is live (index-DpeL6PR0.js); Bill picks what is next
next: bill
depends_on: nothing
open_in: ~/Projects/fixture-and-part on the Mac, or D:\Projects\fixture-and-part on the Dell (folder name `fixture-and-part`, reuse) · fresh Claude session titled `ACT — F&P: pick the next arc`
model: FABLE · EXTRA — the pick and any words after it are judgment; live meter 2026-10-23 04:46: Fable 7 percent of the week (resets Wed 2026-10-28). Never Opus for this stretch.
judgment: the next pick with Bill, and any words or design after it
remaining: the pick is one short exchange; the arc it starts is its own
---
read the project status/memory first. You are the F&P lane (FIXTURE⊕PART). DEPENDS ON: nothing — this lane rides GitHub: `git pull` in the project folder first, and confirm main is at the head pinned above (or later, by docs commits only).

Ritual in one line of receipts: clock; `sync.py pull` from the orchestrator-sync folder (`python3` on the Mac, `python` on the Dell); `git pull` and `git log --oneline -3` in the project; one-writer check (`tools/who-is-live.py --pen --lane "F&P"` in the hub folder — quote the ampersand); stamp and claim the lane (`tools/i-am.py`, `tools/claim.py --claim "F&P"`); title yourself `ACT — F&P: pick the next arc`. Read STATUS.md ## Now (the top block is the 2026-10-23 deploy) and ## To do.

Deliver WHERE WE ARE first, plain words, Sal register:
- Arc goal, last time: ship "F for a reader" — the six fixes to the forward-pass drawing from Bill's reading of the live page.
- Already happened: ✅ built, verified and merged 2026-10-22 (main b87fc0f) · ✅ deployed 2026-10-23 04:47 — gh-pages a5e0a44, live bundle `index-DpeL6PR0.js`, 425,365 bytes, the two new strings checked in the served file.
- Right now: the live page matches main. Nothing in flight; tree clean; no worktree open.
- Bill's next move: pick what is next. Hand him the open candidates from STATUS ## To do in ONE list, plain words, ranked, the lane's recommendation first and one line of why each — the lane's read: "the contrast" (words already proposed in `design/the-contrast/WORDS.md`, waiting on his go or strike) · the E bundle ("E says what follows what" + "the pick on the curve") · "B says what it is doing" · the words fixes in 04/05/06/07/08 as one small sitting ("FIG.8" with the softmax gloss, "the hinge between 04 and 05", "the control sentence in 05", "06 says what the reshaping is for", "how the brain gets around it", "08 says which way feedback runs") · "the lineage of the seam" and "the brain's side of the shop" and "living like us" (each needs a Sonnet reader on its sources first) · "one multiplication, shown" then "the pass in 3D". Small filed candidate from the F build: the stations label under 360 px and the legend at exactly 1200. Ask ONE question: which, or none.

Deploy recipe, for whatever ships next (Mac): `VITE_BASE=/fixture-and-part/ npm run build`; gate every `src`/`href` in `dist/index.html` to `/fixture-and-part/` or `https://`; `git fetch origin gh-pages`, `git worktree add -B gh-pages <tmp> origin/gh-pages`, `git -C <tmp> rm -rq .`, copy `dist/.` in, commit "Deploy <sha>", push, `git worktree remove --force <tmp>`, prune; cache-busted fetch of https://bill-viking.github.io/fixture-and-part/ every 30 s until it names the new bundle (2 min on 2026-10-23, 9 on 10-22). On the Dell, build only through PowerShell (## Important, the Git Bash trap).

Standing cautions: the words are Bill's — copy them, never improve them; price his side at his rate — one ruling per ask with the recommendation first, a still over a walk; the harness refuses a subagent a file named REPORT.md — the lane writes the report from the hand-back and its own re-run; the harness traps in ## Important (one browser at a time when scoring CLS; headless Chrome must pick its own debugging port, 9333 is another session's; reduced motion for a CDP harness with instrument F on screen except the tour's own timing tests; a branch's dev server from its own worktree with its own Vite config and cacheDir — the worktree's node_modules is a symlink to the primary's; the build tool's background commands can lose their `cd`; `sips -c` crops from the centre). The usage gate: under a USAGE PAUSE line Bill's two words are carried, never discussed.

Close per the ritual: STATUS ## Now updated, OPENER.md rewritten, commit + push, release the claim, stamp off, retitle ARCH.
