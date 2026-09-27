lane: F&P
written: 2026-09-27T09:26-07:00
by: ACT — F&P: the window for a novice (Dell) · words approved, build held
on: DELL
head: b0a75bc
status_updated: 2026-09-27T09:26-07:00
where: words approved 09-27; explainer on main; build held for a building day
next: bill
depends_on: nothing
open_in: D:\Projects\fixture-and-part on the Dell, or ~/Projects/fixture-and-part on the Mac (folder name `fixture-and-part`, reuse) · fresh Claude session titled `ACT — F&P: the window for a novice — build`
model: FABLE · EXTRA for verifying the build, the one still, and the deploy call (judgment); the build itself is an OPUS · HIGH subagent in its own worktree, named in the Agent call.
judgment: verifying the builder's numbers, code and stills against the brief; the one still Bill judges; the deploy call. The build between is mechanical.
remaining: 1 sitting
---
read the project status/memory first. You are the F&P lane (FIXTURE⊕PART). DEPENDS ON: nothing — this lane rides GitHub: `git pull` in the project folder first, and confirm main is at the head pinned above (or later, by docs commits only).

Ritual in one line of receipts: clock; `sync.py pull` from the orchestrator-sync folder (`python3` on the Mac, `python` on the Dell); `git pull` and `git log --oneline -3` in the project; one-writer check (`tools/who-is-live.py --pen --lane "F&P"` in the hub folder, and no other ACT — F&P session anywhere); stamp and claim the lane (`tools/i-am.py`, `tools/claim.py --claim "F&P"`); title yourself `ACT — F&P: the window for a novice — build`. Read STATUS.md ## Now (the top block is this pause), then `design/window-for-a-novice/BUILD-BRIEF.md` and `WORDS.md` in full — they are the arc; the brief's last section carries the Dell facts.

Deliver WHERE WE ARE first, plain words, Sal register:
- Arc goal: the window for a novice — instrument E's byte window in section 01 gets its labels and its plain words, every one read from the real file.
- Already happened: ✅ the pick (09-23) · ✅ the model file read and every column measured — slot 36 holds nearly the same number for every word, slot 6 runs low for nearly all of them · ✅ the brief and the words on main · ✅ Bill's go on the words (09-27, no strikes) · ✅ the explainer words written into the code on main · ✅ the Dell facts in the brief.
- Right now: nothing is built. Tree clean; the live page is 189ed44; main is ahead of it by one src commit (the explainer) plus docs, none deployed. Held 2026-09-27 for a building day on Bill's word.
- Bill's next move: ONE word — "build" (this is the building day) — or a different pick. Ask it first, one line, no preamble. On "build", say the sitting's cost in one line (a builder of an hour or two, then the lane's verification, one still for him, deploy on his word) and go.
- Machine's next move, after "build": (1) the model file — on the Dell `ls` the scratchpad path in the brief's last section; if it is gone, the builder re-downloads (83 MB, the script checks the sha) — say which in the Agent call; (2) start an OPUS · HIGH builder with the Agent tool, `isolation: "worktree"`, the model named in the call, prompt = "read design/window-for-a-novice/BUILD-BRIEF.md and WORDS.md and do what they say; branch `window-for-a-novice` off main <head>; the brief's last section has this machine's facts"; (3) when it returns, verify first-hand — lint, build, `git diff main --stat` scope, the fileFacts SAME/NEW table, the standout rule's output (36 same, 6 low, eight table-wide), the CLS zeros and the declared static height change, the viewBox trio, the stills — then show Bill ONE still of section 01 at 1280 and ask "ship it?"; (4) merge fast-forward, deploy (Dell: through PowerShell, ## Important first bullet; Mac: the project-state memory's Phase 3A recipe), verify live with a cache-busted fetch, record every number in STATUS ## Important — on his word only.

Three standing cautions: the words are Bill's — copy them, never improve them (the explainer is already in the code; the builder must not touch `src/content/explainers.js`); price his side at his rate — one ruling per ask with the recommendation first, a still over a walk; and the harness traps in ## Important (one browser at a time when scoring CLS; reduced motion for a CDP harness with instrument F on screen; a branch's dev server from its own worktree, never the preview tool's primary checkout).

On the list, not this sitting: "the trace drifts away" (Bill's 2026-09-27 idea; a words sitting next week — To do) and "the lit row" (the Mac's evening draft, not ruled — To do).

Close per the ritual: STATUS ## Now updated, OPENER.md rewritten, commit + push, release the claim, stamp off, retitle ARCH.
