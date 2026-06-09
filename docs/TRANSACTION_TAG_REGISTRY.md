# Transaction Tag Registry — Wave P3c

**Problem.** The Transparency `/transparency` page showed `Other / Untagged · $2`
on the Liquidity Wallet row. The amount was correct (Allocated $5 − Current $3),
but the label asked the viewer to trust that "untagged" was honest absence
rather than evidence of missing money. The protocol's promise is the opposite:
every dollar that has left an allocation wallet must carry a canonical
classification linked to its transaction, and the same classification must
appear consistently everywhere the value is shown.

**Fix.** Introduced `src/lib/transaction-tags.ts` — a typed registry of
classified outgoing transactions. The registry is the single source of truth
for spend categorization; the Transparency page, Liquidity context, and any
future Activity / Protocol Moments surface must derive from it.

## Schema

```ts
type TaggedTransaction = {
  txHash: string;          // Avalanche C-Chain tx hash
  wallet: string;          // source allocation wallet
  asset: "USDC" | "SYN" | "AVAX";
  amount: number;          // human units
  timestamp: string;       // ISO
  tag: TransactionTag;     // canonical classification
  description: string;     // human-readable purpose
  contextPath?: string;    // optional cross-link (e.g. "/liquidity")
};
```

Allowed tags (narrow on purpose):

`LP_SEED · LP_ADD · LP_REMOVE · DEV · INFRASTRUCTURE · LEGAL · MARKETING · OPERATIONS · TREASURY_TRANSFER · REFUND · OTHER`

## First entry (today)

| Field        | Value |
| ------------ | ----- |
| `txHash`     | `LP_POOL.creationTx` (`0x60f04521…be05`) |
| `wallet`     | Liquidity Wallet (`0xa9b072…2e25`) |
| `asset`      | USDC |
| `amount`     | `LP_POOL.initialUsdc` = 2 |
| `tag`        | `LP_SEED` |
| `description`| Initial LP seed — funded the SYN/USDC pair on Trader Joe v1 with 200 SYN + 2 USDC. |
| `contextPath`| `/liquidity` |

Sourced directly from `LP_POOL` in `src/lib/syndicate-config.ts` — no
duplicated constants.

## Derivation helpers

- `tagsForWallet(wallet)` — all tagged tx for a wallet.
- `classifiedUsdcSpend(wallet)` — sum of tagged USDC out of that wallet.
- `classifiedUsdcByTag(wallet?)` — grouped by tag, with tx list.
- `splitSpend(wallet, observedSpentUsdc)` →
  `{ classifiedUsdc, untaggedUsdc, classifiedBreakdown }`.

`splitSpend` is what the Transparency Use of Funds table consumes.
`classifiedUsdc` is clamped to `observedSpentUsdc` so rounding noise cannot
produce a negative residual; `untaggedUsdc` is the explicit, surfaced
residual.

## What changed on `/transparency` → Use of Funds

1. The header KPI row now reads **Generated · Allocated · Classified spend · Untagged residual** (was Generated · Allocated · Spent (untagged) · Remaining).
2. The per-bucket table now has two spend columns: **Spent · classified** (emerald) and **Spent · untagged** (amber). The Liquidity Wallet row carries an inline `LP Seed · $2` pill.
3. A new **Classified Spending — by tag** card lists every tagged transaction with a direct Avascan link and the on-chain description.
4. The old "Spending Categories" card (Development / Infrastructure / Marketing / Other / Untagged · $2) is **replaced** by the registry-derived block — categories are never invented, only surfaced when they exist on-chain.
5. **Untagged Residual** is now its own explicit block with a PENDING badge, not a row inside an invented category list. Any non-zero amount here is a flag for the operator to add a registry entry, not noise to be hidden.

## Cross-page consistency rule (going forward)

When any of these surfaces is added or modified, it MUST read from
`transaction-tags.ts` (or a derived view of it), never from a local constant:

- Treasury page (Vault / Liquidity / Operations breakdowns)
- Liquidity page (LP seed funding context)
- Activity feed (per-tx tag column)
- Protocol Moments (e.g. "First LP Seed")
- Wallet pages (when surfacing protocol-originated outflows)

Adding a new classified outflow is a single-source change: append to
`TAGGED_TRANSACTIONS` and every dependent surface reflects it automatically.

## Tag stays narrow

Do not add new tag values speculatively. A new tag is allowed only when a
real, recurring on-chain spend category exists. Until then, residual spend
shows as **Untagged Residual · PENDING** — exactly as the user demanded:
nothing absorbed, nothing invented, nothing hidden.

## Build stamp

`src/lib/build-stamp.ts` → `wave-P3c.tx-tag-registry`.
