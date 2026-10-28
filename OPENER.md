lane: F&P
written: 2026-10-28T15:15:00-07:00
by: ACT — F&P: the company copy, ship
on: MAC
head: d0f6e38
status_updated: 2026-10-28T15:15:00-07:00
where: both copies live with the day's cut; office package FP-TX-002 cut; look pass next
next: bill
depends_on: nothing
open_in: fixture-and-part (reuse) · fresh Claude session · ACT — F&P: the figures' look pass
model: FABLE · EXTRA for the ruling of what Bill says about the office landing and the figures' look; ASTRA headless for the look pass itself (an aesthetic pass from references, per the Look-passes law); SONNET for any reader
judgment: rule Bill's words on the office landing («landed» closes the loop; «another name» = a rebuild and FP-TX-003) and on the figures' look; brief the look pass; every words candidate in STATUS ## To do is Bill's to approve
remaining: 2 sittings
---
read the project status/memory first. Pick up F&P on the Mac: the day's cut of 2026-10-28 is live (main d0f6e38 · gh-pages 171b04a) with the public copy at https://bill-viking.github.io/fixture-and-part/ and the company copy at /company/; the office package FP-TX-002 is in ~/ferry-staging/2026-10-28/ with its landing beside it. First: read STATUS ## Now and the ## To do items dated 2026-10-28. Then (1) if Bill has said «landed», file the Pages address in STATUS and close the office item; if he said another project name, rebuild the company copy for that path (`VITE_COMPANY=1 VITE_BASE=/<name>/ npm run build -- --outDir <pkg>/public`), re-cut FP-TX-003 the way FP-TX-002 was cut (manifest, zip, sha, landing, release/scrub.py, the lane's own word sweep) and attach it; (2) the figures' look pass: write the brief for Astra from the STATUS candidate «the figures' look pass» and references Bill supplies (Mobbin first, per the Connected-tool-first law), run it headless with tools/offload.py, prove in the app's pane (CLS 0 at 1280/390, ratios, the text floor), deploy both copies with the amended two-copy gh-pages recipe in STATUS (never rsync), re-cut the office package only if the company copy changed. Work in the worktree `.claude/worktrees/company-look` on branch `the-company-copy` (level with main; a build there needs `-- --configLoader native`); the helper never commits — the lane commits its edits, then launches the next helper on a clean tree. The words are Bill's: copy them, never improve them; one ruling per ask.
