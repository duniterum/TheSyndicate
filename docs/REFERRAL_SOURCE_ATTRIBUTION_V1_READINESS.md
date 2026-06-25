# Referral / Source Attribution V1 Readiness

Status: NON-LIVE READINESS SPEC / ONE PAUSED INTERNAL SOURCE / NO CLAIM UI

This document records the current referral/source-attribution boundary after
the V3 direct-buy cutover and first internal PAUSED source record. It does not
authorize source activation, referral link, claim UI, registry switch, funding
action, public source-aware buy path, or public activation.

## Current On-Chain Truth

| Surface | Current truth |
| --- | --- |
| SourceRegistryV1 | Deployed at `0x780013bB358be6be95b401901264FC7c22a595a6`; owner accepted; one PAUSED internal source record |
| MembershipSaleV3 | Deployed at `0x2A6cFc76906e758B934209AFf5A163c9bC20132E`; funded; current direct-buy target |
| Public V3 buy path | Uses `ZERO_SOURCE_ID`; no source-linked public buy path is active |
| Referral/source UI | Inactive; no public referral/source link, source dashboard, balance, or claim action |
| Source records | `INTERNAL_PROTOCOL_TEST_SOURCE_001` exists as PAUSED policy state only; no ACTIVE source exists |

## Doctrine

- Referral/source attribution is one acquisition layer, not the business model.
- Source attribution never means source ownership of a member.
- No downline, passive income, yield, reward dashboard, or MLM framing.
- Recognition and money terms are separate.
- A source record is policy state, not a public promise.
- Commission exists only when a source record is active and a purchase receipt
  proves an acquisition cost.
- Claim UI requires escrow/readback truth, source status truth, and legal copy
  approval. It is not part of this readiness sprint.

## Existing Implementation Map

| Layer | Repository truth |
| --- | --- |
| Contract source policy | `contracts/src/SourceRegistryV1.sol` |
| Contract sale receipt | `contracts/src/MembershipSaleV3.sol` |
| Direct buy call | `src/components/syndicate/LivePurchase.tsx` calls V3 `buy(..., ZERO_SOURCE_ID, ...)` |
| V3 quote/read path | `src/lib/sale-hooks.ts` quotes with `ZERO_SOURCE_ID` |
| Event read model | `src/lib/activity-hooks.ts` scans `MembershipPurchasedV3` |
| Cache read model | `src/lib/purchase-events-cache.ts` preserves `source: "v3"` and V3 receipt/source metadata |
| Public pending route | `src/routes/referral.tsx` remains pending/inactive |
| Local first-touch memory | `src/lib/referral-attribution.ts` stores `?ref=<memberNumber>` as recognition-only browser memory |

## V1 Architecture Recommendation

No new smart contract is required for the first source-attribution readiness
phase. V1 should use the existing `SourceRegistryV1` and `MembershipSaleV3`
contracts.

The future activation path should be:

1. Create a source-policy packet off-chain.
2. Founder/operator approves one source record.
3. Create the source record on-chain. The first internal record is now created
   and remains PAUSED.
4. Read back `SourceCreated`, source terms, status, payout wallet, caps, and
   metadata hash.
5. Keep UI pending until readback, legal copy, and Replit/public QA are green.
6. Only then enable a source-aware preview or limited source link.

Public buys must continue to use `ZERO_SOURCE_ID` until the activation ceremony
explicitly approves a non-zero source path.

## Source Metadata Packet

Every future source record should have a public policy packet before creation:

| Field | Required |
| --- | --- |
| sourceId | yes |
| source wallet | yes |
| payout wallet | yes |
| source class | yes |
| commission bps | yes |
| scope | yes |
| attribution window | yes, unless scope makes it irrelevant |
| gross cap | yes for capped terms |
| per-buyer cap | yes for capped terms |
| metadata hash | yes |
| legal copy posture | yes |
| public display posture | yes |
| pause/revoke procedure | yes |

## Phased Plan

### Phase A - Non-Live Read/Model/Docs

- Preserve V3 source fields in the purchase-event read model and cache.
- Keep public buy path at `ZERO_SOURCE_ID`.
- Keep source records count at zero in docs until readback changes.
- Keep `/referral` pending and noindex.

### Phase B - Preview UI

- Show source attribution as candidate/pending only.
- No source links, balances, claim button, claimable copy, or live source terms.
- Explain `Introduction Progression`, `Source Terms`, `Acquisition Attribution`,
  `Acquisition Commission`, and `Net USDC Routed` as separate concepts.

### Phase C - Source Metadata/Admin Packet

- Prepare exactly one source record packet for founder approval.
- Include caps, window, source class, payout wallet, metadata hash, legal copy,
  and rollback/disable path.

### Phase D - Founder Source-Creation Ceremony

- Manual transaction only after approval.
- Create the source record.
- Read back event/state.
- Record the transaction in docs.

### Phase E - Public Activation

- Only after source readback, check-release, Replit publish, and wallet QA.
- Source-aware buy must display source terms before wallet signature.
- Buyer must be able to clear a source before signing.

### Phase F - Claim UI

- Separate future sprint only.
- Requires escrow state reads, source status reads, legal copy approval, failure
  states, and no-yield/no-passive-income framing.

## Non-Negotiable Copy Guards

Public copy must not say:

- passive income
- yield
- downline
- MLM
- claimable commission
- earned commission now
- source owns a member
- referral is the business model
- guaranteed reward

Acceptable wording:

- source attribution
- verified introduction
- acquisition attribution
- acquisition commission when live
- Operations/source policy when proven by receipt
- source records inactive
- no claim UI

## Current Activation Gates

Before any source/referral activation:

- Replit/public site must be synced to the V3 direct-buy commit and QA'd.
- `SourceRegistryV1` source count/readback must be known.
- Legal/product copy must be approved.
- A source metadata packet must be approved.
- A source creation transaction must be separately approved and performed.
- Source record readback must be recorded.
- Frontend tests must prove invalid/missing/paused source IDs fail closed.
- `npm run check-release` must pass.

## Explicit Non-Authorization

This document does not authorize:

- contract deployment,
- source-record creation,
- source-aware public buy links,
- claim UI,
- referral activation,
- source payouts,
- registry switch,
- V2b recovery,
- funding,
- public claim that referral/source is live.
