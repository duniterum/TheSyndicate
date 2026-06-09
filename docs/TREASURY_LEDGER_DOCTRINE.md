# Treasury Ledger — Doctrine

**Status:** Doctrine. The `/transparency` page currently renders a SIMULATED Treasury Ledger preview block. Real rows arrive when CommissionRouter ships.

## Purpose

Answer one question: **where did the money go?** Every directional movement out of an allocation wallet must surface in a single public table with a canonical tag and an on-chain anchor.

## Doctrine

> "Nothing hidden happened."

The Treasury Ledger is **founder-managed until DAO activation** and that fact is stated literally on the public surface. Do not soften.

## Append-only

- New entries are appended, never edited or deleted.
- Corrections are new entries that reference the prior one by id.

## Canonical movement tag allow-list (V1)

Adding a tag is a governance change.

| Tag | Meaning |
|---|---|
| `SALE_TO_VAULT` | 70% of a sale routed to Vault Reserve |
| `SALE_TO_LIQUIDITY` | 20% of a sale routed to Liquidity Wallet |
| `SALE_TO_OPERATIONS` | 10% of a sale routed to Operations Wallet |
| `OPERATIONS_TO_REFERRER` | Operations slice paid to a referrer wallet |
| `OPERATIONS_TO_INFRA` | Operations spend on infrastructure (RPC, hosting) |
| `OPERATIONS_TO_AUDIT` | Operations spend on audits / legal |
| `LIQUIDITY_LP_ADD` | Liquidity wallet deposited into Trader Joe pair |
| `LIQUIDITY_LP_REMOVE` | Liquidity wallet withdrew from pair |
| `VAULT_TO_INVESTMENT` | Vault funds allocated to a yield-bearing position |
| `VAULT_FROM_INVESTMENT` | Returning position closed back to Vault |

## Verifiable > Impressive

Every ledger entry must link to a tx hash. Operator-authored prose without an on-chain anchor surfaces as **PENDING**, never as a confirmed movement. The preview surface today shows `SIMULATED` rows — these are illustrative and must never be promoted to LIVE without a tx hash.

## Storage

Lives in the existing `src/lib/transaction-tags.ts` registry. There is no new file or new module. Router emissions are appended automatically once CommissionRouter is live.

## Cross-references

- `docs/REVENUE_ATTRIBUTION_LAYER.md` — upstream source of automatic ledger entries.
- `docs/UNIFIED_PROTOCOL_DOCTRINE_MAP.md` — neighbor graph.
