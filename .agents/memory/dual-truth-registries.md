---
name: Protocol metric definitions — one registry, projected everywhere
description: protocol-metrics-registry.ts is the canonical single source; protocol-truth.ts and data-verification-registry.ts now PROJECT from it (no longer independent). How to add/label a metric without re-introducing drift.
---

# One canonical metric registry — truth layer + verify drawer + surfaces all project from it

The historical problem was TWO parallel "single source of truth" metric layers
(`protocol-truth.ts` facts and `data-verification-registry.ts` METRIC_REGISTRY)
defining the same metrics (members, usdcRaised, synSold, lpTvl, lastBuy,
nextMember, vault balances) independently — and drifting (the `members` *prose*
once described a Holder, not a Member).

**Resolved (Phase 1C).** `src/lib/protocol-metrics-registry.ts` is now the
canonical leaf (imports ONLY `syndicate-config`; no React/wagmi → safe for the
pure-data verify registry, no cycle). ~30 metrics, each: id, **aliases** (every
legacy truth prop + verify key resolves here), label, shortLabel, status, source,
formula, verification{primaryHref, links, refresh}, hook, etc. Dup-id/dup-alias
guards throw at module load. Helpers: `getMetric`/`requireMetric` (alias-aware),
`metricLabel(idOrAlias, compact)`, `metricsForSurface`, etc.

Both downstream layers now **project** from it:
- `protocol-truth.ts` builds every `Fact` via `bind(key, value, opts)` — `key` is a
  registry alias; label/source/formula/verifyHref/hook/status come from the registry.
- `data-verification-registry.ts` builds `METRIC_REGISTRY` via `fromMetric()` over
  the legacy verify keys; `getMetricVerification()` alias-resolves (so
  `?verify=lpTvlUsd` and `?verify=lpTvl` both open the LP TVL drawer).

**Rules to keep it from re-drifting (how to apply):**
- Add/change a metric in `protocol-metrics-registry.ts` ONLY. Never re-hardcode a
  metric label in a surface — wire it through `metricLabel(...)`/`requireMetric(...)`
  (ProtocolIntelligenceBar, LivePulseStrip, SupplyTruthLine, LiveProofStrip already do).
- `metricLabel` returns `string | undefined` (compact can miss a shortLabel) — always
  `metricLabel(k, true) ?? fallback`.
- `bind()` clamps the value-derived status to the registry's documented status
  (PENDING<PARTIAL<LIVE) so a fact can downgrade but **never silently upgrade** past
  what the registry says. Honor that: don't bypass bind() with a raw LIVE.
- **Known residual drift:** `Sections.tsx` still hardcodes `"SYN Distributed"` (canonical
  is `"SYN Sold"`), but it's fed by the QUARANTINED mock `useLiveData`, not real truth —
  low priority, fix only if that mock surface is revived.
- Unrelated pre-existing gate failure: `check-ownership-wording.mjs` flags
  `syndicate-config.ts` rank copy `"your contribution"` — predates this work, not the registry.

**Why it matters:** the founder's explicit fear is "duplicate systems / drifting
concepts." Adding a metric to only one layer re-opens the split this phase closed.
