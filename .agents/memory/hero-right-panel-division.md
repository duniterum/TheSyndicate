---
name: Hero right-panel division of labor
description: What the homepage hero's right-column panels may and may not show, and why
---

# Hero right-panel division of labor

The homepage hero (`src/components/syndicate/ProtocolHero.tsx`) has TWO sources of
truth on the right, and they must not overlap:

- **Radial diagram (center, `HeroEngine`)** = the ONLY home for the treasury/routing
  money stats: Next seat, USDC routed (center), 70% Vault, 20% Liquidity,
  10% Operations.
- **Protocol Overview panel (`HeroRight`)** = TWO proof headlines ONLY:
  Members (gold) + Burned Supply (flame, Proof of Burn). Generous breathing room,
  big clamp-sized values, no sub-grids.

**Why:** Those 5 money stats were deliberately removed from the overview panel
because they already live in the radial — re-listing them is duplication, not new
info. If asked to "add stats to the overview," do NOT re-add radial stats.

## Hero = trailer, not dashboard (founder ruling)
The panel previously also carried "Token & valuation" (SYN price / Ref. market /
Ref. FDV) and "Supply" (Initial / Effective) sub-grids = 5 small competing values,
several literal duplicates ($10M==$10M, 1B==1B). Founder ruling: the homepage hero
is a TRAILER, the panel is hero-SUPPORT, not a mini-dashboard. Trimmed to the two
proof headlines; the demoted token/valuation/supply metrics were NOT deleted from
the site — they live on `/tokenomics`, in `HomeKpiGrid` (below fold) and the
`ProtocolIntelligenceBar` ticker. **How to apply:** keep the hero panel to ≤2-3
headline proof numbers; demote/move, never duplicate; never delete a metric off the
site. Removing the grids also orphaned local `Stat`/`GroupLabel`/`fmtCompact*` —
deleted them (lint hygiene; `noUnusedLocals` is OFF so tsc won't catch dead code).

## Latest Activity rail status honesty
- `HeroActivityRail` derives its StatusPill from `useProtocolEvents().sources`:
  LIVE only when rows exist AND no source `isError`; degrades to PARTIAL when any
  source errors (rows may be stale persisted cache). This is INTENTIONALLY stricter
  than the canonical `ProtocolEventsFeed`, which hardcodes its `LIVE` pill. Don't
  "fix" the rail to match the feed's hardcoded LIVE — honest > optimistic per
  Syndicate status doctrine.

**How to apply:** In dev the rail shows PARTIAL / "Reading recent blocks" because
the RPC has no CORS (cold scan) — expected, not a bug; it populates LIVE in prod
from the seeded persisted cache.
