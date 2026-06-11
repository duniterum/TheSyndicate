# THE SYNDICATE — DATA VERIFICATION REGISTRY

Single source of truth for every metric exposed in the **hero** and
**Live Pulse heartbeat strip** on the homepage.

The runtime mirror lives at `src/lib/data-verification-registry.ts`.
If you change a row here, change it there in the same PR (and vice versa).
The `MetricVerificationDrawer` reads exclusively from the runtime file —
no metric may render in the heartbeat strip without an entry.

This registry exists so that future contributors can never "invent" a
source for a homepage number. If a number isn't in this table, it doesn't
belong on the homepage.

---

## Heartbeat metrics

| Key           | Metric          | Hook                                              | Source (on-chain)                                                                                | Status | Refresh |
|---------------|-----------------|---------------------------------------------------|--------------------------------------------------------------------------------------------------|--------|---------|
| `members`     | Members         | `useHolderIndex` (via `useProtocolPulse`)         | SYN ERC20 `Transfer` event scan, deduped recipients                                              | LIVE   | 60s     |
| `usdcRaised`  | USDC Raised     | `useSaleStats` (via `useProtocolPulse`)           | `SyndicateMembershipSale.totalRaised()`                                                          | LIVE   | 60s     |
| `vaultRouted` | Vault Routed    | `useReadContracts` (via `useProtocolPulse`)       | `USDC.balanceOf(VAULT_WALLET)`                                                                   | LIVE   | 60s     |
| `lpTvl`       | LP TVL          | `useLpStats` (via `useProtocolPulse`)             | Trader Joe v1 SYN/USDC pair `getReserves()`                                                      | LIVE   | 60s     |
| `synSold`     | SYN Sold        | `useSaleStats` (via `useProtocolPulse`)           | `SyndicateMembershipSale.totalSold()`                                                            | LIVE   | 60s     |
| `lastBuy`     | Last Buy        | `useLivePurchaseEvents` (via `useProtocolPulse`)  | `TokensPurchased(buyer, usdcIn, synOut)` event scan                                              | LIVE   | 60s     |
| `nextMember`  | Next Member     | derived (`members + 1`)                           | n/a — pure derivation of the Members count                                                       | LIVE   | 60s     |
| `synSupply`   | Total Supply    | `useSynSupply`                                    | SYN ERC20 `totalSupply()` — fixed 1,000,000,000, no mint function                                | LIVE   | 120s    |
| `circulating` | Circulating     | `useCirculatingSupply`                            | `totalSupply()` − Σ allocation-wallet `balanceOf()` (SYN in public hands)                        | LIVE   | 120s    |
| `synBurned`   | Burned          | `useSynSupply` (1,000,000,000 − `totalSupply()`)  | Derived from SYN ERC20 `totalSupply()`; reads 0 — no burn mechanism active                       | LIVE   | 120s    |

> `synSupply` / `circulating` / `synBurned` surface in the **SupplyTruthLine**
> (homepage pulse strip + `/tokenomics`). They are LIVE reads off the SYN
> contract; `synBurned` stays `0` until SYN is ever burned — the protocol runs
> no burn today.

### Status definitions

- **LIVE** — Reads directly from Avalanche C-Chain RPC against a deployed
  contract. No backend, no cache layer beyond the React Query refresh cycle.
- **PARTIAL** — Some inputs are live, some are derived or missing data.
  The drawer must explain exactly which input is partial.
- **PENDING** — The underlying primitive (contract / wallet / index) is not
  yet deployed. The metric MUST NOT render a fake or estimated number; it
  must render `—` or `0` with an honest empty state.

---

## Hero metrics

The hero today renders three callouts that share sources with the
heartbeat strip — they are **not separate metrics**:

| Hero callout          | Backed by              | Status |
|-----------------------|------------------------|--------|
| "You could be Member #N" | `nextMember` (above) | LIVE   |
| Verified Members count   | `members` (above)    | LIVE   |
| USDC Raised             | `usdcRaised` (above)  | LIVE   |

Any new hero number must either point to an existing key in this registry
or land here first.

---

## Adding a new metric

1. Pick a stable `key` (camelCase, descriptive).
2. Add a row to this table.
3. Add a typed entry to `METRIC_REGISTRY` in
   `src/lib/data-verification-registry.ts`.
4. Wire the cell in `LivePulseStrip.tsx` (or hero) with the matching key
   so `MetricVerificationDrawer` resolves it.
5. Confirm the status pill rendered next to the metric matches the
   registry status.

If steps 1–4 are not complete, the metric is not allowed in production.

---

## What NOT to expose

The registry intentionally **excludes** the following — none of them
represent verifiable on-chain state, so none of them may appear in the
heartbeat or hero:

- Compounder Score / score multiplier / reputation forecasts
- Wealth-ordered leaderboards
- Projected dates, projected member counts, projected revenue
- Episode counters, quest progress, NFT mint counts (until those contracts deploy)
- Estimated APR, yield, or "implied returns"

If a future contributor tries to add any of the above to the heartbeat,
this registry is the document they must read first.

---

## Cross-references

- `docs/VISION.md` — why "verify everything" is the central promise.
- `docs/CONSTITUTION_SUMMARY.md` — what is constitutional and what is not.
- `docs/HOLDER_INDEX_ARCHITECTURE.md` — the anti-rewrite contract that
  backs the `members` and `nextMember` rows.
- `docs/SITE_REDESIGN_EXECUTION_REPORT.md` — the 6-zone hierarchy that
  the heartbeat strip lives inside.
