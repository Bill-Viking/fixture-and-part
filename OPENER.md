lane: F&P
written: 2026-10-23T06:29-07:00
by: ACT — F&P: ship the F build, then the next pick (Mac) · the F build and the contrast both shipped
on: MAC
head: 7b3f21f
status_updated: 2026-10-23T06:28-07:00
where: the contrast is live (index-5X6Dlb5_.js); Bill picks what is next
next: bill
depends_on: nothing
open_in: ~/Projects/fixture-and-part on the Mac, or D:\Projects\fixture-and-part on the Dell (folder name `fixture-and-part`, reuse) · fresh Claude session titled `ACT — F&P: pick the next arc`
model: FABLE · EXTRA — the pick and any words after it are judgment; live meter 2026-10-23 04:46: Fable 7 percent of the week (resets Wed 2026-10-28). Never Opus for this stretch; the build itself goes to an Opus builder from a brief, as the F build and the contrast did.
judgment: the next pick with Bill, and any words or design after it
remaining: the pick is one short exchange; the arc it starts is its own
---
read the project status/memory first. You are the F&P lane (FIXTURE⊕PART). DEPENDS ON: nothing — this lane rides GitHub: `git pull` in the project folder first, and confirm main is at the head pinned above (or later, by docs commits only).

Ritual in one line of receipts: clock; `sync.py pull` from the orchestrator-sync folder (`python3` on the Mac, `python` on the Dell); `git pull` and `git log --oneline -3` in the project; one-writer check (`tools/who-is-live.py --pen --lane "F&P"` in the hub folder — quote the ampersand); stamp and claim the lane (`tools/i-am.py`, `tools/claim.py --claim "F&P"`); title yourself `ACT — F&P: pick the next arc`. Read STATUS.md ## Now (the top two blocks are the 2026-10-23 ships) and ## To do.

Deliver WHERE WE ARE first, plain words, Sal register:
- Last time, two ships in one sitting: ✅ the F build deployed 04:47 (the six fixes to the forward-pass drawing) · ✅ the contrast built, verified and deployed verified live 06:29 (third try, under two minutes) — the two cards in section 07, the brain cited and the file demonstrated, the file card's last line instrument E's own live finding.
- Right now: the live page matches main. Nothing in flight; tree clean; no worktree open; the branches `f-for-a-reader` and `the-contrast` kept, merged.
- One thing worth Bill's eye on the live page (filed from the build): when the file's fingerprint matches but a reading disagrees, the file card's red line prints the build's own sha; section 01's own sentence explains it. Rare; a words ruling if he wants one.
- Bill's next move: pick what is next. Hand him the open candidates from STATUS ## To do in ONE list, plain words, ranked, the lane's recommendation first and one line of why each — the lane's read: the E bundle ("E says what follows what" + "the pick on the curve"; he called E's layout confusing) · "B says what it is doing" · the words fixes in 04/05/06/07/08 as one small sitting ("FIG.8" with the softmax gloss, "the hinge between 04 and 05", "the control sentence in 05", "06 says what the reshaping is for", "how the brain gets around it", "08 says which way feedback runs") · "the lineage of the seam" and "the brain's side of the shop" and "living like us" (each needs a Sonnet reader on its sources first) · "one multiplication, shown" then "the pass in 3D" · the small paint items (the phone's lit row, FIG.7 under 359 px, F's label under 360 px). Ask ONE question: which, or none.

The build road that worked twice in a row (F, the contrast): WORDS proposed → Bill's go or strike → a BUILD-BRIEF.md in the design folder (anchors by file and line, the deliverables in order, the gauntlet, the harness traps) → an Opus builder in its own worktree on a named branch, launched in the background → the lane re-runs the key checks itself (lint, build, bundle strings, the DOM strings, the live wiring in the app's browser pane on `vite preview`) → REPORT.md written by the lane from the hand-back (the harness refuses a subagent that filename) → ff-merge, deploy, verify live, record.

Deploy recipe, for whatever ships next (Mac): `VITE_BASE=/fixture-and-part/ npm run build`; gate every `src`/`href` in `dist/index.html` to `/fixture-and-part/` or `https://`; `git fetch origin gh-pages`, `git worktree add -B gh-pages <tmp> origin/gh-pages`, `git -C <tmp> rm -rq .`, copy `dist/.` in, commit "Deploy <sha>", push, `git worktree remove --force <tmp>`, prune; cache-busted fetch of https://bill-viking.github.io/fixture-and-part/ every 30 s until it names the new bundle (2 min on 2026-10-23, 9 on 10-22). On the Dell, build only through PowerShell (## Important, the Git Bash trap).

Standing cautions: the words are Bill's — copy them, never improve them; price his side at his rate — one ruling per ask with the recommendation first, a still over a walk; the harness refuses a subagent a file named REPORT.md — the lane writes the report from the hand-back and its own re-run; the harness traps in ## Important (one browser at a time when scoring CLS; headless Chrome must pick its own debugging port, 9333 is another session's; reduced motion for a CDP harness with instrument F on screen except the tour's own timing tests; a branch's dev server from its own worktree with its own Vite config and cacheDir — the worktree's node_modules is a symlink to the primary's; the build tool's background commands can lose their `cd`; `sips -c` crops from the centre). The usage gate: under a USAGE PAUSE line Bill's two words are carried, never discussed.

Close per the ritual: STATUS ## Now updated, OPENER.md rewritten, commit + push, release the claim, stamp off, retitle ARCH.
