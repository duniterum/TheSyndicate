---
name: Rank Constitutional Ruling
description: Canonical meaning of "Rank" in The Syndicate, the rank meanings that are retired, and how the ruling was enforced in code.
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
drop the multiplier, and avoid identity/chapter vocabulary in tier names.

## Enforcement status (code) — DONE
The ruling is now enforced in code (separately-authorized code follow-up):
- `scoreMultiplier` removed from the `RankTier` type and every `RANKS_V2` entry; leaderboard `compounderScore` → `archiveWeight` (no rank weighting in the formula). "Compounder" framing retired entirely.
- Rank tier renames: `$100` **Founder → Vanguard**; `$10,000` **Genesis Circle → Cornerstone**. "Steward" REJECTED (collides with a `referral.ts` tier). Rank is derived live via `rankForUsdc`/`rankForSyn`, never persisted by name — renames need no migration.
- **No spend-ladder copy.** Banned UI: "$X to next rank", "Next rank gap", "Needs N SYN for <rank>", "Rank unlocked", rank progress bars. Use "Rank reflected" / "Recognition only — no payout, no entitlement" / plain "Next: <name>".
- `founderNumber` / "Founder #" / the Founder token-allocation wallet are identity/allocation, NOT rank — intentionally left untouched. Full identity-hierarchy rework ("Wake Behind You", Member≠Founder≠Holder) is DEFERRED, not part of the ruling.

## Guard + quarantine
- `doctrine-guard.test.ts` source BANNED regexes block re-introduction in SCAN_ROOTS: `/scoreMultiplier/`, `/[Cc]ompounder/`, `/Genesis Circle/`. These are *source* bans (not DOC_BANNED) so the ruling doc can still quote the retired terms.
- `scripts/live-content-rules.json` separately bans "Compounder Score"/"score multiplier" on the live site (`npm run check-live`).
- `src/labs/**` is OUTSIDE SCAN_ROOTS. Labs preview components (RankSimulator, HomeJoinPreview, SmartContractFlow) may still contain "Rank unlocked"/"Next rank gap" copy — acceptable, not shipped. Don't chase them unless labs is promoted.
