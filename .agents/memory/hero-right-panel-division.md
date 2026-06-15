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
- **Protocol Overview panel (`HeroRight`)** = identity/token/supply only: featured
  Members headline, then "Token & valuation" (SYN price / Ref. market / Ref. FDV)
  and "Supply" (Initial / Effective / Burned–Proof of Burn).

**Why:** Those 5 money stats were deliberately removed from the overview panel
because they already live in the radial — re-listing them is duplication, not new
info. If asked to "add stats to the overview," do NOT re-add radial stats.

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
