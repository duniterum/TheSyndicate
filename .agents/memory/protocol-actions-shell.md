---
name: protocol-actions shell + guard
description: protocol-actions.ts is a non-rendering metadata SHELL that drifts from live CTAs; why it must not be wired, and how the guard test locks today's truth.
---

# protocol-actions.ts is a SHELL, not the live CTA source

`src/lib/protocol-actions.ts` is a typed metadata registry of every protocol
action (live + planned). It is imported by **zero** rendering surfaces and must
stay that way until reconciled.

**Why not wire it:** its labels/targets DRIFT from the live CTAs.
- registry `openMySyndicate` label = "Open My Syndicate" vs rendered "My Syndicate".
- registry `tradeSyn`→`/token`, `addLiquidity`→`/liquidity` (valid internal pages),
  but the live "Trade SYN"/"Add liquidity" buttons go to the EXTERNAL Trader Joe
  URL (`LP_POOL.traderJoeUrl` / `addLiquidityUrl`), rendered in
  `LiquidityActionRail.tsx` (+ LpStatus/MemberCockpit/Hero).
Wiring the registry into CTAs would therefore CHANGE visible behavior. Founder
decision: keep it non-rendering until labels+targets are reconciled against
production; lock that with a guard test, do not wire.

**How to apply:** the lock lives in `src/lib/__tests__/protocol-actions-guard.test.ts`
(non-rendering, app imports nothing). It asserts: live route targets resolve to a
real `src/routes/*.tsx`; the 5 future placeholders
(claimEscrowedCommission/claimCampaignReward/claimMerchEligibility/mintSeatRecord721/marketplaceAction)
stay `pending` + target null + excluded from live; the registry is NOT imported by
any `src/components`/`src/routes` file (the freeze gate — update it deliberately
when you finally wire, never delete); external Trader Joe URLs stay external and
`LiquidityActionRail.tsx` keeps BOTH; joinMembership = Sale V2 `live-unaudited`
(only membership action → V1 absent = sealed history); claimEscrowedCommission note
keeps CommissionRouter unset/referral pending.

**Pending-label scan gotcha:** you CANNOT scan rendered surfaces for the pending
*concept words* — "Seat Record" (~20 files) and "Marketplace" (~10 files) are
pervasive legitimate descriptive copy (whitepaper/FAQ/glossary/PendingModuleNotice
honestly describing planned modules). Only the distinctive full labels — "Claim
escrowed commission", "Claim campaign reward", "Check merch eligibility" — have
zero current matches and are safely scannable for leak detection. Seat-Record /
Marketplace leak protection relies on the registry-level guards + the no-import
tripwire, not a string scan.

**Residual gap (accepted):** a hand-coded interactive CTA for a pending concept
that bypasses the registry AND uses non-distinctive wording is not statically
distinguishable from descriptive copy, so it is not caught. Out of scope without a
real SSR/DOM harness.
