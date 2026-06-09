---
name: Rank Constitutional Ruling
description: Canonical meaning of "Rank" in The Syndicate and the rank meanings that are retired.
---

# Rank doctrine (ruled & registered 2026-06-09)

Canonical doc: `docs/RANK_CONSTITUTIONAL_RULING.md` (constitutional, rank tier).

**Rank IS:** a mutable, on-chain-derived **structural recognition** label
reflecting depth of participation. Standing, not status. Confers nothing.
Permanently subordinate to the seat (identity) and cohort/chapter (belonging).
Model D of the A–E evaluation.

**Rank IS NOT:** identity · wealth-coded · a reward/multiplier · a scarce
positional rung · chapter/founder-derived · hero content · private-cockpit
content.

**Where it lives:** `/ranks` + public member page (secondary line, below
member # / chapter / founders flag). Never hero, never the member's own private
cockpit.

**Retired meanings (do not reintroduce):** rank as USDC entry-size public
status; `scoreMultiplier` / "Compounder Score" tied to rank; "Founder" as a
rank name (it's a cohort identity fact); "Genesis Circle" as a rank name
("Genesis" = Chapter I); rank as primary identity; rank as a leaderboard.

**Why:** resolves the §D contradiction — VISION says rank ≠ wealth, but the
`RANKS_V2` impl keyed rank purely on USDC with a `scoreMultiplier`. The
SCARCITY "non-positional" vs STORY_ENGINE "positional standing" tension is only
verbal: both mean rank ≠ wealth, ≠ reward, ≠ scarce rung, ≠ identity.

**How to apply:** any future rank UI/code must keep rank below cohort+seat,
drop the multiplier, and avoid identity/chapter vocabulary in tier names. The
code retirement of `scoreMultiplier` and the "Founder"/"Genesis Circle" tier
names in `src/lib/syndicate-config.ts` is a deferred, separately-authorized
**code** follow-up (the ruling is doctrine only).
