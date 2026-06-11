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

**The `members` drift — RESOLVED.** Both registries now read ONE shared
constant, `MEMBER_DEFINITION` in `src/lib/syndicate-config.ts` (leaf module — do
NOT move it into protocol-truth.ts, which pulls React/wagmi hooks and would drag
them into the pure-data verification registry / risk a cycle). Canonical meaning:
**Member = distinct TokensPurchased buyer**, de-duplicated via the holder index.
IMPORTANT: the *runtime value* was already the buyer-count on both surfaces (the
holder index is built from PurchaseEvent[] = TokensPurchased); only the
verification registry's *prose* was wrong — it said "non-zero SYN balance /
Transfer-event recipients" (a Holder). So correcting it changed no displayed
number, only the description a verifier would follow.

This had violated the Member≠Holder doctrine (see syndicate-copy-canon) at the
description level: a holder is not a member.

**Why it matters:** the founder's explicit fear is "duplicate systems / drifting
concepts." This is a live example. Surfacing more metrics (e.g. circulating
supply) by adding to only one registry deepens the split.

**How to apply:** the OTHER overlapping metrics (usdcRaised, synSold, lpTvl,
lastBuy, vault balances) are still defined independently in each registry. Before
surfacing or adding any protocol metric, follow the `members` template: define it
ONCE in a leaf module and have BOTH registries read it, so Member≠Holder (and
every other definition) holds everywhere. Don't add a metric to only one side.
