# Protocol Metrics Registry — Phase 1C Report

**Scope:** Architecture-only consolidation. **No redesign.** One canonical
Protocol Metrics Registry — *one metric → one id / definition / formula /
verification → many surfaces* — eliminating the duplicate-definition drift
between the value layer, the verification drawer, and the UI metric surfaces, and
enforcing the protocol's legal vocabulary (USDC is **routed**, never *raised*; no
ROI / yield / dividend language).

**Deliverable status:** Complete and verified. `tsc --noEmit` clean; full test
suite **570 passing** across all 43 files; app runs clean (HTTP 200, no console
errors); the `?verify` deep-link drawer resolves live.

---

## 1. The problem this closed

Two parallel "single source of truth" metric layers each defined the same metrics
independently and had begun to drift:

- `src/lib/protocol-truth.ts` — `useProtocolTruth()` returning `Fact<T>` objects
  (label, value, status, source, formula, verifyHref, hook), with the stated rule
  *"every surface MUST read facts from here."*
- `src/lib/data-verification-registry.ts` — `METRIC_REGISTRY` powering the
  "verify it yourself" drawer (description, hook, source, refresh, status, links).

On top of these, the metric **surfaces** (`ProtocolIntelligenceBar`,
`LivePulseStrip`, `SupplyTruthLine`, `LiveProofStrip`) carried their **own
hardcoded labels**, so the *same* metric could appear under three different names
(e.g. "Vault Routed" vs "Vault Wallet", "SYN Distributed" vs "SYN Sold"). The
founder's explicit fear — *"duplicate systems / drifting concepts"* — was already
materializing.

---

## 2. The architecture: one registry, projected everywhere

```
            ┌─────────────────────────────────────────────┐
            │   src/lib/protocol-metrics-registry.ts        │
            │   CANONICAL SOURCE (pure-data leaf)           │
            │   imports ONLY syndicate-config — no React/   │
            │   wagmi → safe for the pure-data verify layer │
            │   30 metrics · 31 aliases · dup guards        │
            └───────────────┬──────────────┬───────────────┘
                            │ bind()        │ fromMetric()
              ┌─────────────▼───┐    ┌──────▼──────────────────┐
              │ protocol-truth   │    │ data-verification-      │
              │ .ts  (Fact<T>)   │    │ registry.ts (drawer)    │
              └─────────┬────────┘    └──────────┬──────────────┘
                        │ metricLabel() / requireMetric()
        ┌───────────────┼───────────────┬────────────────┐
        ▼               ▼               ▼                ▼
 ProtocolIntelligence  LivePulseStrip  SupplyTruthLine  LiveProofStrip
        Bar
```

Every label and every piece of verification metadata now **descends from one
definition**. A surface may choose the full `label` or the compact `shortLabel`,
but it can no longer invent its own string.

---

## 3. The canonical registry

`src/lib/protocol-metrics-registry.ts` — **30 metrics, 31 aliases**, each a
`ProtocolMetric` with: `id`, `aliases[]` (covering every legacy truth prop **and**
verify key), `label`, `shortLabel`, `category`, `type` (RAW / DERIVED /
AGGREGATE), `status`, `unit`, `description`, `source`, `formula`,
`verification { primaryHref, links[], refresh }`, `legalSensitivity`,
`surfaces[]`, `dependencies[]`, `hook`, `emptyState`.

**Integrity guards (throw at module load):** duplicate `id` and duplicate `alias`
are impossible — the registry refuses to load if a definition collides.

**Helpers:** `getMetric` / `requireMetric` (alias-aware), `metricLabel(idOrAlias,
compact)`, `metricsByCategory`, `metricsForSurface`, `allMetrics`,
`PROTOCOL_METRICS`, `METRIC_IDS`.

### Inventory

| Status | Count |
|---|---|
| LIVE | 26 |
| PARTIAL | 3 |
| PENDING | 1 |
| **Total** | **30** |

| Category | Count |
|---|---|
| sale | 5 |
| supply | 5 |
| membership | 4 |
| protocol-wallets | 4 |
| artifacts | 3 |
| market-reference | 3 |
| activity | 2 |
| burn | 2 |
| liquidity | 2 |

| Legal sensitivity | Count |
|---|---|
| high | 4 |
| medium | 10 |
| low | 16 |

The 4 `high`-sensitivity metrics are the market-reference family (reference
price, FDV, market cap) — each description carries explicit non-promissory
framing.

---

## 4. Projection layer 1 — the value layer (`protocol-truth.ts`)

Every `Fact` is now built through a single helper:

```ts
bind(key, value, opts?)   // key is a registry alias → pulls label, source,
                          // formula, verifyHref, hook, status from the registry
```

Consumers still read `t.<prop>` unchanged (the legacy prop name *is* a registry
alias), so nothing downstream had to change. Dynamic facts
(`lastBuyBuyer`, `transactions`, `classifiedUsdcOut`) pass per-call
`verifyHref` / `status` overrides; everything else inherits from the registry.

**Status clamp (correctness hardening).** `bind()` now clamps the value-derived
status to the registry's *documented* ceiling:

```
PENDING < PARTIAL < LIVE
status = opts.status ?? clamp(valueDerivedStatus, registryStatus)
```

A fact can therefore **downgrade** at runtime (read returns `undefined` → PENDING)
but can **never silently upgrade** past what the registry declares — honoring the
registry's own contract (*"runtime may downgrade this, never upgrade"*). No
displayed status changes today (all bound metrics are registry-LIVE); this is a
guardrail against future PARTIAL metrics leaking as LIVE.

---

## 5. Projection layer 2 — the verification drawer (`data-verification-registry.ts`)

`METRIC_REGISTRY` is now **projected** from the canonical registry via
`fromMetric()` over the 10 deep-linkable verify keys:

```
members · usdcRaised · vaultRouted · lpTvl · synSold ·
lastBuy · nextMember · synSupply · circulating · synBurned
```

All type exports are preserved. `getMetricVerification()` now **alias-resolves**,
so any alias of a surfaced metric opens the correct drawer:

> `?verify=lpTvlUsd` **and** `?verify=lpTvl` both open the **LP TVL** drawer
> (verified live — see §8).

---

## 6. Projection layer 3 — the surfaces

All metric labels now descend from the registry via `metricLabel(key, compact)`
(or `requireMetric`), never hardcoded:

| Surface | Wiring |
|---|---|
| `ProtocolIntelligenceBar` | `barLabel` helper + 14 cells; BurnedCell via `requireMetric("burnedSupply").label` |
| `LivePulseStrip` | `pulseLabel` helper, 7 cells |
| `SupplyTruthLine` | `segLabel` helper, 3 segments |
| `LiveProofStrip` | `metricLabel("synSold", true)` for the previously-divergent cell |

**Net visible normalizations (the only intended display changes — all are
drift fixes that make surfaces *agree* per metric):**

- LivePulseStrip: **"Vault Routed" → "Vault Wallet"**
- SupplyTruthLine: **"Total" → "Total Supply"**
- ProtocolIntelligenceBar: **"Circulating Supply" → "Circulating"**
- LiveProofStrip: **"SYN Distributed" → "SYN Sold"**

> Note on `metricLabel`: it returns `string | undefined` (a metric may omit a
> `shortLabel`), so every call uses the `metricLabel(k, true) ?? fallback`
> pattern. This is now the project convention for all four surfaces.

---

## 7. Legal vocabulary enforcement

The registry's labels, shortLabels, and descriptions use **"routed"** throughout.
The only occurrences of "raised" are:

1. the real ABI function name `totalUsdcRaised()` (no space → wording-guard safe;
   it is the on-chain function, not display copy), and
2. a comment documenting the ban.

No ROI / yield / dividend / "return" language appears anywhere in the registry.
The market-reference metrics carry explicit non-promissory descriptions and
`legalSensitivity: "high"`.

**Pre-existing, out-of-scope finding:** `node scripts/check-ownership-wording.mjs`
flags one violation — `src/lib/syndicate-config.ts:605`, the *rank* copy
*"Your contribution maps to a public rank…"*. This line predates this work
(confirmed via `git diff HEAD`) and is unrelated to the metrics registry. It is
left untouched to respect scope; recommended fix below.

---

## 8. Doc change — Source-of-Truth Table

`docs/canon/02_SOURCE_OF_TRUTH_TABLE.md`:

- **Row 22 "Burned supply": FUTURE → LIVE.** Grounded in the registry
  `burnedSupply` metric (`balanceOf` the standard dead address) and one verified
  Founder Burn (Proof of Fire #001, 1,000 SYN). The metric was already rendered
  live in the UI; the table was stale, and the canon explicitly states *"code
  outranks this table — fix it when stale."*
- **Row 40 "Burn mechanism (automated)": stays FUTURE.** Clarified so the *live
  metric* (burned balance) is cleanly separated from the *non-existent automated
  mechanism*. There is still no burn mechanism (the LP "Burn" is liquidity
  removal, not token burn).

---

## 9. Verification performed

| Check | Result |
|---|---|
| `bunx tsc --noEmit` | **clean (exit 0)** |
| Full test suite (43 files) | **570 passing** (188 + 222 + 160; re-confirmed 394 + 176 after the two follow-up fixes) |
| `doctrine-guard.test.ts` (scans `src/lib`, incl. the new file) | pass |
| `verify-href-coverage.test.ts` | pass |
| `my-syndicate-doctrine.test.ts` | pass |
| `protocol-health.test.ts` | pass |
| App workflow | HTTP 200, no console errors |
| SSR HTML | registry labels render; **0 occurrences of "Vault Routed" / "SYN Distributed"** on live surfaces |
| `?verify=lpTvlUsd` deep-link | resolves to the LP TVL drawer (alias resolution proven end-to-end) |

---

## 10. Architect review

Independent review verdict: **PASS.** Confirmed the single-source design is
correct and well-layered, the legal vocabulary is clean, the burned-supply doc
flip is defensible (not scope creep), and the `bind()` / alias / override approach
is sound. Two items it raised were fixed in this pass:

1. `LiveProofStrip` no longer hardcodes "SYN Distributed" (now registry-sourced
   "SYN Sold").
2. `bind()` now clamps status so a metric can never silently upgrade past its
   registry-documented status.

---

## 11. Remaining drift & recommendations

1. **`Sections.tsx` still hardcodes "SYN Distributed".** Low priority — that
   surface is fed by the *quarantined mock* `useLiveData`, not real protocol
   truth. Wire it to the registry (or retire the mock) if that surface is ever
   revived.
2. **`syndicate-config.ts:605` ownership-wording violation** (pre-existing, rank
   copy). Recommend rewording with approved vocabulary, e.g. *"Your purchases map
   to a public rank — recognition only."* Verify no test asserts the old string
   first.
3. **Future metrics must be added to the registry only.** Never add a metric to a
   single layer or hardcode a label in a surface — that re-opens the split this
   phase closed. Follow the `bind()` / `fromMetric()` / `metricLabel()` projection
   pattern.

---

## 12. Files changed

**New**
- `src/lib/protocol-metrics-registry.ts` — canonical registry (pure-data leaf).

**Refactored to project from the registry**
- `src/lib/protocol-truth.ts` — `bind()` + status clamp.
- `src/lib/data-verification-registry.ts` — `METRIC_REGISTRY` via `fromMetric()`,
  alias-resolving `getMetricVerification()`.
- `src/components/syndicate/ProtocolIntelligenceBar.tsx`
- `src/components/syndicate/LivePulseStrip.tsx`
- `src/components/syndicate/SupplyTruthLine.tsx`
- `src/components/syndicate/LiveProofStrip.tsx`

**Docs**
- `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md` — burned-supply rows reconciled.
