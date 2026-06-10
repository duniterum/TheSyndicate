---
name: Dual truth/verification registries can drift
description: Two parallel canonical metric registries exist (protocol-truth.ts TRUTH vs data-verification-registry.ts METRIC_REGISTRY); they overlap and their "members" definition has already drifted. Reconcile before surfacing metrics.
---

# Two parallel "single source of truth" registries — they overlap and drift

The app has TWO canonical metric layers that both claim authority:

1. `src/lib/protocol-truth.ts` — `useProtocolTruth()` returns `Fact<T>` objects
   (key, label, value, status LIVE/PARTIAL/PENDING, source, formula, verifyHref,
   hook). The stated rule: every surface MUST read facts from here.
2. `src/lib/data-verification-registry.ts` — `METRIC_REGISTRY` keyed records
   (description, hook, source, refresh, status, links) powering the "verify it
   yourself" drawer.

They overlap on members, usdcRaised, synSold, lpTvl, lastBuy, nextMember,
vault balances.

**The drift (real, already present):** the `members` metric is defined
DIFFERENTLY in each:
- `protocol-truth.ts`: "count(distinct buyer) over all TokensPurchased events"
  (i.e. **members** = bought via the Sale).
- `data-verification-registry.ts`: "every address that holds a non-zero SYN
  balance … scans Transfer events from the SYN ERC20 and de-duplicates
  recipients" (i.e. **holders**, which includes people who only received a
  transfer).

This violates the Member≠Holder doctrine (see syndicate-copy-canon): a holder is
not a member. The two registries can show different member counts and different
verification stories for the same pill.

**Why it matters:** the founder's explicit fear is "duplicate systems / drifting
concepts." This is a live example. Surfacing more metrics (e.g. circulating
supply) by adding to only one registry deepens the split.

**How to apply:** before surfacing or adding any protocol metric, pick ONE
registry as authoritative and make the other reference it (or generate one from
the other). Reconcile the `members` definition to the Sale-based
(TokensPurchased distinct buyer) meaning so Member≠Holder holds everywhere.
