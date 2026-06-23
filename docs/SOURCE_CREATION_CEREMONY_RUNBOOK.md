# Source Creation Ceremony Runbook

Status: RUNBOOK ONLY / NO TRANSACTION AUTHORIZED / SOURCE RECORDS INACTIVE

This runbook defines the controlled ceremony for creating a `SourceRegistryV1`
source record. It is intentionally separate from public referral activation,
claim UI activation, and source-linked buy UI activation.

## Preconditions

- GitHub main is clean and current.
- `npm run check-release` passes.
- Source packet is complete: `docs/SOURCE_RECORD_PACKET_TEMPLATE.md`.
- Founder approval is explicit.
- Legal/product copy is approved.
- Direct on-chain acquisition commission and escrow-fallback wording is acknowledged in the approved packet.
- Source privacy/tracking posture, source dashboard status, claim UI status, and tax/accounting note are approved in the packet.
- Source creation has been rehearsed on an Avalanche fork.
- SourceRegistryV1 owner wallet is available and verified.
- Chain ID is Avalanche C-Chain `43114`.
- No private keys, seed phrases, Ledger recovery words, or signer exports are shared.

## Required Documents

- `docs/SOURCE_RECORD_PACKET_TEMPLATE.md`
- `docs/REFERRAL_SOURCE_ATTRIBUTION_V1_READINESS.md`
- `docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md`
- `docs/IDENTITY_ATTRIBUTION_CONSTITUTION.md`
- `docs/LEGAL_DISCLOSURE_REFERRAL.md`
- `docs/REVENUE_ATTRIBUTION_LAYER.md`

## Commission Reality

This ceremony creates source policy only. It does not pay anything.

If a separate future activation ceremony sets a source to `ACTIVE` and an
eligible MembershipSaleV3 purchase uses the sourceId, MembershipSaleV3 attempts
direct on-chain acquisition commission payout during that purchase transaction.
Escrow is fallback only if the payout transfer fails. Escrow does not activate
claim UI, does not create an off-chain balance display, and does not authorize
public source links.

## Target Contract

- Contract: `SourceRegistryV1`
- Address: `0x780013bB358be6be95b401901264FC7c22a595a6`
- Owner: approved owner hardware wallet
- Function: `createSource(bytes32 sourceId, SourceTerms terms)`

## Function Arguments

`SourceTerms` fields must be copied from the approved source packet:

1. `sourceWallet`
2. `sourceClass`
3. `commissionBps`
4. `scope`
5. `startTime`
6. `endTime`
7. `grossCap`
8. `perBuyerCap`
9. `appliesToRepeatPurchases`
10. `payoutWallet`
11. `metadataHash`

## Ceremony Steps

1. Confirm chain ID `43114`.
2. Confirm selected signer is the approved owner hardware wallet.
3. Confirm target address is `SourceRegistryV1`.
4. Confirm source packet is final and founder-approved.
5. Call `createSource(sourceId, terms)`.
6. Do not call `setSourceStatus(..., ACTIVE)` in the same ceremony unless separately approved.
7. Do not change frontend source paths.
8. Do not create claim UI.
9. Do not switch registry.
10. Record transaction hash and readbacks.

## Expected Event

`SourceCreated(sourceId, sourceWallet, sourceClass, commissionBps, PAUSED, scope, payoutWallet, metadataHash)`

The initial status must be `PAUSED`. A separate activation ceremony is required
before source terms can be used in live purchase flow.

## Expected State Readback

- `sourceExists(sourceId) = true`
- `sourceConfig(sourceId).status = PAUSED`
- `sourceConfig(sourceId)` matches the approved packet exactly.
- SourceRegistry owner remains the approved owner hardware wallet.

## Frontend Activation Gate

Source creation alone does not activate public referral/source UX.

Before any frontend activation:

- source status must be intentionally reviewed,
- source readbacks must be recorded,
- purchase-path tests must confirm no accidental non-zero source ID default,
- `/referral` must remain inactive unless separately approved,
- claim UI must remain absent unless escrow policy and read model are approved.

## Rollback / Pause / Revoke Path

- If a source is wrong before activation: leave it `PAUSED` or set `REVOKED`.
- If a source must be halted after activation: call `setSourceStatus(sourceId, PAUSED)`.
- If a source must be permanently stopped: call `setSourceStatus(sourceId, REVOKED)`.
- If payout wallet is compromised: call `updatePayoutWallet(sourceId, newPayoutWallet)` only after a visible recovery decision.
- Record every action in the readback log.

## Failure Cases

Stop and report if:

- transaction targets the wrong contract,
- chain ID is wrong,
- signer is wrong,
- `SourceCreated` does not match packet,
- initial status is not `PAUSED`,
- source wallet or payout wallet differs,
- metadata hash differs,
- commission bps differs,
- source class/scope/cap/window differs,
- packet does not acknowledge direct payout / escrow fallback,
- packet does not approve privacy/tracking, source dashboard, claim UI, and tax/accounting posture,
- any frontend path starts using non-zero source IDs unexpectedly.

## Explicit Rule

No source creation happens without founder approval.

No public source-linked buy path, claim UI, or referral activation follows from
source creation automatically.
