lane: F&P
written: 2026-10-28T15:15:00-07:00
by: ACT — F&P: the company copy, ship
on: MAC
head: d0f6e38
status_updated: 2026-10-28T15:15:00-07:00
where: both copies live; office copy landed and its README visitor-first; look pass next
next: bill
depends_on: nothing
open_in: fixture-and-part (reuse) · fresh Claude session · ACT — F&P: the figures' look pass
model: FABLE · EXTRA for the ruling of what Bill says about the office landing and the figures' look; ASTRA headless for the look pass itself (an aesthetic pass from references, per the Look-passes law); SONNET for any reader
judgment: rule Bill's words on the office landing («landed» closes the loop; «another name» = a rebuild and FP-TX-003) and on the figures' look; brief the look pass; every words candidate in STATUS ## To do is Bill's to approve
remaining: 2 sittings
---
read the project status/memory first. Pick up F&P on the Mac: the day's cut of 2026-10-28 is live (main d0f6e38 · gh-pages 171b04a) with the public copy at https://bill-viking.github.io/fixture-and-part/ and the company copy at /company/; the office package FP-TX-002 is in ~/ferry-staging/2026-10-28/ with its landing beside it. First: read STATUS ## Now and the ## To do items dated 2026-10-28. Then (1) the office copy is LANDED and confirmed (STATUS ## Now has the whole evening: push-to-create, the unique-domain checkbox, the visitor-first README; the icon and description fields still need a one-time GitLab token — a command with the token between quotes for Bill to fill, never a settings walk); every future office package ships icon.png + DESCRIPTION.txt and a README whose first line is the thing to open (the Icon-and-description law, both books); (2) the figures' look pass: write the brief for Astra from the STATUS candidate «the figures' look pass» and references Bill supplies (Mobbin first, per the Connected-tool-first law), run it headless with tools/offload.py, prove in the app's pane (CLS 0 at 1280/390, ratios, the text floor), deploy both copies with the amended two-copy gh-pages recipe in STATUS (never rsync), re-cut the office package only if the company copy changed. Work in the worktree `.claude/worktrees/company-look` on branch `the-company-copy` (level with main; a build there needs `-- --configLoader native`); the helper never commits — the lane commits its edits, then launches the next helper on a clean tree. The words are Bill's: copy them, never improve them; one ruling per ask.
