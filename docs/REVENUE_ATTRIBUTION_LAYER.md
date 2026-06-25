# Revenue Attribution Layer (RAL) - Doctrine

Status: DOCTRINE + DEPLOYED V3 SOURCE INFRASTRUCTURE / VALIDATED INTERNAL SOURCE TEST / SOURCE PAUSED

Public name: **Referral**. Internal name: **Revenue Attribution Layer**.

`SourceRegistryV1` and `MembershipSaleV3` are deployed and verified. The first
internal source record completed one controlled source-attributed buy and is
now PAUSED. Public V3 buys use `ZERO_SOURCE_ID`. The `/referral` route remains
reserved/read-only until any future source activation, source-aware product
path, legal copy, and public QA are separately approved and read back.
Public V3 buys use `ZERO_SOURCE_ID`.
`CommissionRouterV1` remains a reviewed candidate/test reference, not the V3
acquisition-first engine.

Doctrine boundary: referral/source attribution is one acquisition layer, not the
business model and not the institution. It may record verified introductions and
future acquisition commission when live, but it must never be framed as yield,
passive income, a rank entitlement, a downline, or the primary measure of
institutional trust capital.

Referral is one acquisition layer, not the business model.
CommissionRouterV1 remains a reviewed candidate/test reference, not the V3 acquisition-first engine.

## Purpose

Record who caused a source-attributed protocol sale and split the gross
deterministically, in a single immutable event that downstream surfaces
(Activity, My Syndicate, Register, Builder Records) can read without
re-deriving anything. Until source records are active, direct public buys are
source-free and use `ZERO_SOURCE_ID`.

## Canonical V3 Receipt Event

```text
MembershipPurchasedV3 {
  receiptId
  buyer
  recipient
  memberNumber
  grossUsdc
  acquisitionCost
  protocolContribution
  vaultAmount
  liquidityAmount
  operationsAmount
  synOut
  synPerUsdc
  era
  chapter
  sourceId
  sourceClass
  sourceWallet
  commissionBps
  attributionScope
  attributionWindowEndsAt
  sourceGrossRemaining
  buyerGrossRemaining
  firstSeat
  receiptVersion
}
```

This receipt is the V3 source of truth. It reconstructs the paid gross,
acquisition cost, net routed USDC, Vault/Liquidity/Operations routing, SYN
delivered, price era, source terms, and member identity impact.

## Split Rules

- If no valid source: `acquisitionCost == 0` and `protocolContribution == grossUsdc`.
- If a valid source exists: `grossUsdc - acquisitionCost == protocolContribution`.
- `protocolContribution` splits 70% Vault, 20% Liquidity, 10% Operations.
- The acquisition cost is explicit in the receipt and does not create member
  ownership, yield, passive income, or a downline.
- Vault and Liquidity remain receipt-visible and never hidden.

## Attribution Model

- Attribution is source-record based, not browser-memory based.
- Existing members cannot be captured retroactively by a new source.
- A paused or revoked source receives no new attribution.
- Source terms do not rewrite historical receipts.
- Public buys remain zero-source until source records are approved and active.

## Payout Pattern

- Default, once live for an active source: direct payout to the source payout
  wallet during the purchase.
- Fallback, once live: escrowed if direct payout fails. Purchase must not be
  blocked by a hostile or incompatible payout wallet.
- Claim UI remains separate future work and must not appear before escrow state,
  source status, and legal copy are approved.

## What V1 Does Not Include Today

- No live source records.
- No public source-aware links.
- No claim UI.
- No CampaignRegistry contract.
- No AcceptedTokenRegistry contract.
- No TierOracle.
- No on-chain Reputation.
- No Builder Score contract.
- No automatic Chronicle entries.
- No flat 5% default commission.

## Forward Compatibility

The schema reserves namespace for `MEMBER_INTRODUCTION`, `BUILDER_SOURCE`,
`AFFILIATE`, `BD_NETWORK`, `WHITELABEL`, `SPONSORSHIP`, and `TREASURY_DEAL`.
Activating any source class requires a source metadata packet, an on-chain
source-record ceremony, and readback.

Builder Records, recognition, Chronicle, Register, and Archive may later read
source-attributed receipts as one signal among many. They must answer what a
participant helped the institution become, not only how much was paid or
attributed.

## Cross-References

- `docs/REFERRAL_SOURCE_ATTRIBUTION_V1_READINESS.md` - current non-live readiness boundary.
- `docs/IDENTITY_ATTRIBUTION_CONSTITUTION.md` - source attribution is not member ownership.
- `docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md` - V3 acquisition-first receipt doctrine.
- `docs/LEGAL_DISCLOSURE_REFERRAL.md` - public disclosure rules for the Referral page.
