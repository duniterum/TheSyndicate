# Revenue Attribution Layer (RAL) — Doctrine

**Status:** Doctrine + production-candidate Solidity. `CommissionRouterV1` exists
under `contracts/src`, but no router is deployed or wired live. The `/referral`
route remains reserved/read-only until a verified router address exists.

Public name: **Referral**. Internal name: **Revenue Attribution Layer**.

## Purpose

Record who caused every protocol sale and split the gross deterministically, in a single immutable event that downstream surfaces (Treasury Ledger, Activity, Builder Records) can read without re-deriving anything.

## Canonical Attribution event (locked for V1)

```
Attribution {
  source       bytes32   // "MEMBERSHIP_SALE" | "ARCHIVE_SALE" | future B2B sources
  campaign     bytes32   // optional refTag, "" for none
  token        address   // payment token (V1: USDC)
  gross        uint256   // payment amount in token units
  buyer        address
  referrer     address   // address(0) if none
  tier         uint16    // referrer tier at tx time (snapshot)
  splits       uint256[5] // [vault, liquidity, referrer, operations, protocol]
  paymentMode  uint8     // 0 = push, 1 = escrowed
  attribution  uint8     // 0 = last-verified-referrer, 1 = buyer-confirmed override
  refTag       bytes32   // raw tag for campaign analytics
}
```

The `source` field is `bytes32` and the allow-list is governance-gated — this is the only V3 commitment made today. All B2B and white-label expansion is a config change, not a contract migration.

## Split rules (constitutional)

- 70% Vault and 20% Liquidity are **untouched** by referrals.
- Referrer commission, if activated, comes only from the 10% Operations slice.
- If no referrer: Operations keeps the full 10%.
- If a verified router is deployed and a valid referrer is present: `referrer = OperationsSlice × tierTable[tier]`, `operations = OperationsSlice − referrer`.

## Attribution model

- **Last-verified-referrer wins** at point of sale (no retroactive attribution).
- A buyer may **override** at the point of sale with an explicit confirmation. The choice is recorded in the `attribution` field.

## Payout pattern

- Default, once live: **push payout** to referrer in the same tx.
- Fallback, once live: **escrowed** if push fails (smart-contract referrer that reverts, gas griefing). Funds become claimable.
- This is the mandatory pattern for supporting contract referrers (smart wallets / DAOs).

## What V1 does NOT include

- No CampaignRegistry contract (use repo config + `refTag` filter).
- No AcceptedTokenRegistry contract (inline allow-list).
- No TierOracle. The production-candidate router uses verified referred-member
  count only.
- No on-chain Reputation. No Builder Score contract. No automatic Chronicle entries.
- No flat 5% default commission. The current production-candidate router is tiered and count-based.

## Forward-compatibility

The schema reserves namespace for: `SPONSORSHIP`, `AFFILIATE`, `BD_NETWORK`, `WHITELABEL`, `TREASURY_DEAL`. Adding any of these requires no contract change — only a governance vote on the source allow-list.

## Cross-references

- `docs/UNIFIED_PROTOCOL_DOCTRINE_MAP.md` — neighbor graph.
- `docs/TREASURY_LEDGER_DOCTRINE.md` — downstream consumer of RAL emissions.
- `docs/BUILDER_RECORD_DOCTRINE.md` — derived view over RAL events.
- `docs/REPUTATION_FORMULA_DOCTRINE.md` — score function over Builder Records.
- `docs/LEGAL_DISCLOSURE_REFERRAL.md` — public disclosure rules for the Referral page.
