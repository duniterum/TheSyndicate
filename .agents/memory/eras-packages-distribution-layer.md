---
name: Eras + packages distribution layer
description: The infinite-game journey is an additive frontend/config layer; eras are a 2nd coordinate system over untouched chapters; packages project 1:1 from RANKS_V2.
---

# Eras + Seat Packages — additive distribution layer

The "infinite game" journey (Join→Seat→Rank→Package→Artifact→Referral→Chronicle
→Marketplace→Signal Chamber) is implemented as **frontend + pure-data config +
docs only** — never contracts. The live Membership Sale is unchanged: ONE fixed
Genesis access rate (1 SYN = $0.01 USDC) for every member, no on-chain era stepping.

## Two coordinate systems (do not merge)
- **Chapters** (`src/lib/chapters.ts`) = the STORY layer. Left untouched.
- **Eras** (`src/lib/eras.ts`) = the DISTRIBUTION layer (proposed access-rate
  schedule). 9 eras, capacities sum to exactly 1,000,000. Eras I–IV reuse the
  Chapter I–IV member-number boundaries exactly; Eras V–IX sit inside Chapter V.

**Why:** keeping them separate lets the schedule evolve without re-numbering or
re-bounding the canonical chapters (which other surfaces depend on).

## Binding rules
- **Only Era I (Genesis) is LIVE.** Eras II–IX are PROPOSED FUTURE — every
  surface showing them MUST label PENDING/FUTURE; each would need a future sale
  contract before taking effect. Never imply a future era's rate is live.
- `synForUsdcInEra` uses the **live** `ACCESS_RATE_USDC_PER_SYN` for Genesis and
  proposed preview rates only for future eras — keep that split.
- **Packages are NOT a new naming system.** `package-catalog.ts` projects 1:1
  from `RANKS_V2` (same names/thresholds/SYN). Add or rename a tier in `RANKS_V2`
  only; the catalog follows. Recognition only — no payout/rate-change/rights.
- **One featured strip, two surfaces.** `featuredPackages()` is the single source
  for BOTH the homepage "Featured Paths" teaser (`HomeProgressionTeaser`) AND the
  `/join` package grid (`JoinPackages`), rendered through the shared
  `SeatPackageCard`. Curated set = 6 (`FEATURED_NAMES`: Citizen, Operator,
  Vanguard, Steward, Keystone, Cornerstone). `recommended` ("Start here") and
  `highConviction` flags live on the projected `SeatPackage` (Citizen / Cornerstone
  respectively). Change the featured set / badges in `package-catalog.ts` only —
  editing one surface and not the other is impossible by design, but the curated
  list and uniqueness of the two flags are pinned by `eras-and-packages.test.ts`.

## Cockpit orchestrator gotcha
`CockpitNextMove` opens the Momentum band (before `CockpitProgression`); the
pre-existing Action band eyebrow was renamed "Your next move"→"Action dock" so
only the orchestrator owns that heading. CTA must read "Reading seat…" while a
connected member's holder index loads — NEVER flash "Join The Syndicate" at a
real member (record is briefly undefined during `idx.isLoading`).

**How to apply:** when extending the journey, add presentational/PENDING surfaces;
push any contract-bound feature (era stepping, on-chain referral, Seat Record 721,
marketplace, binding signals) to a future contract and label it PENDING.
