# Source Attribution Real-Condition Ceremony Readback

Status: COMPLETED / SOURCE RE-PAUSED / PUBLIC REFERRAL INACTIVE

Last updated: 2026-06-26

This document records the first completed end-to-end Source Attribution
protocol ceremony for The Syndicate.

It proves one internal source-attributed MembershipSaleV3 purchase under real
production conditions. It does not activate public referral, public source
links, claim UI, source dashboards, or a public source-aware buy path.

## Executive Result

The ceremony completed successfully.

Final current-authority readback at latest block `88808111` confirms:

- chain ID `43114`
- `SourceRegistryV1` exists at `0x780013bB358be6be95b401901264FC7c22a595a6`
- `MembershipSaleV3` exists at `0x2A6cFc76906e758B934209AFf5A163c9bC20132E`
- source exists: `true`
- final source status: `PAUSED` / status `2`
- `isActive(sourceId) = false`
- source terms match the updated real-condition packet
- one $5 source-attributed V3 purchase succeeded
- acquisition commission paid directly
- `sourceEscrowOwed(sourceId) = 0`
- public/default `/join` remains `ZERO_SOURCE_ID`
- referral, claim UI, source dashboard, and public source-aware buys remain inactive

## Source

| Field | Value |
| --- | --- |
| Source label | `INTERNAL_PROTOCOL_TEST_SOURCE_001` |
| SourceId | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| Source wallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| Payout wallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| Source class | `1` / `BUILDER_SOURCE` |
| Commission | `500` bps |
| Scope | `1` / `WINDOWED` |
| Start time | `1782388800` / `2026-06-25T12:00:00Z` |
| End time | `1783598400` / `2026-07-09T12:00:00Z` |
| Gross cap | `25000000` / 25 USDC |
| Per-buyer cap | `5000000` / 5 USDC |
| Repeat purchases | `false` |
| Metadata hash | `0x797dedbf845edc5954012c46a6c42e121f19f142d76fe34c8f59bf8e8c7bd681` |
| Created by / owner | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| Final updatedAt | `1782422641` / `2026-06-26T01:10:41Z` |

## Ceremony Transactions

| Step | Transaction | Block | Timestamp UTC | Result |
| --- | --- | ---: | --- | --- |
| Terms updated | `0x898b4f142ca388543701da8e483f764d1daef4c3256d28b449aac5cf08e2784d` | `88769017` | `2026-06-25T12:00:01Z` | `SourceTermsUpdated` matched the real-condition packet |
| Source activated for test | `0x7565d0fbe6389a7fc39da4ec0f9e69d2a82a99d42d3192e616d18fc35efc4df1` | `88794252` | `2026-06-25T20:41:55Z` | Source was ACTIVE for the controlled test |
| Source-attributed buy | `0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46` | `88806161` | `2026-06-26T00:46:00Z` | `MembershipPurchasedV3` emitted with the internal sourceId |
| Re-pause | `0x67f6498cd734b27032f0a10fe55bad57079f5b9cf38b38a85a1f95895aece71f` | `88807390` | `2026-06-26T01:10:41Z` | `SourceStatusChanged(sourceId, 1, 2)` |

## Buy Receipt

| Field | Value |
| --- | --- |
| ReceiptId | `0x7f961284a26ea0d3bb715934159e7cd758d0f8ef0a4da53c460f7c607ce39301` |
| Buyer | `0x620febd921E7B8d123c7DFB6731ed58fCfbcC75F` |
| Recipient | `0x620febd921E7B8d123c7DFB6731ed58fCfbcC75F` |
| Member number | `10` |
| Gross USDC | `5000000` / 5.00 USDC |
| Acquisition cost | `250000` / 0.25 USDC |
| Protocol contribution | `4750000` / 4.75 USDC |
| Vault amount | `3325000` / 3.325 USDC |
| Liquidity amount | `950000` / 0.95 USDC |
| Operations amount | `475000` / 0.475 USDC |
| SYN out | `500000000000000000000` / 500 SYN |
| Era | `1` |
| Chapter | `1` |
| SourceId | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| Source class | `1` |
| Source wallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| Commission bps | `500` |
| Attribution scope | `1` |
| Attribution window ends | `1783598400` |
| Source gross remaining | `20000000` / 20 USDC |
| Buyer gross remaining | `0` |
| First seat | `true` |
| Receipt version | `3` |

## Latest Sale State

| Read | Value |
| --- | --- |
| `SOURCE_REGISTRY()` | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| `sourceGrossAttributed(sourceId)` | `5000000` |
| `buyerGrossAttributedToSource(sourceId, buyer)` | `5000000` |
| `sourceEscrowOwed(sourceId)` | `0` |
| `memberCount()` | `10` |
| `currentEra()` | `1` |
| `paused()` | `false` |

## What This Proves

This ceremony proves:

- `SourceRegistryV1` terms can be updated and read back.
- A source can move through PAUSED, ACTIVE, and back to PAUSED.
- `MembershipSaleV3` can consume an ACTIVE sourceId.
- The V3 buy emits source-attributed receipt fields.
- The acquisition commission is deducted before 70/20/10 routing.
- Direct payout can succeed with zero escrow owed.
- Gross cap and per-buyer cap accounting update after the purchase.
- The internal operator console can guide a real production wallet through the test.
- The protocol can create a source-attributed proof without launching public referral.

## What Remains Unproven

This ceremony does not prove:

- public member referral UX,
- public source links,
- public source onboarding,
- source dashboards,
- claim UI,
- escrow-claim UX,
- multi-buyer or multi-source behavior,
- member-introduction source class behavior,
- anti-abuse rules for public referral,
- accounting exports,
- Archive, SeatRecord721, SwapRail, or ProductSaleRouter attribution.

## Current Public Boundary

The following remain true after the ceremony:

- public/default `/join` uses `ZERO_SOURCE_ID`,
- `/referral` remains inactive,
- no public source link exists,
- no claim UI exists,
- no source dashboard exists,
- no registry switch occurred,
- no contract code changed,
- no public referral activation occurred.

The first source-attributed receipt is a protocol capability proof, not a
public referral launch.

## Next Recommended Sprint

First pass completed: the validated source-attributed receipt now has a
readback-confirmed proof model and appears as non-activating proof on Activity
and Transparency. My Syndicate remains wallet-specific and guarded.

Second pass completed: Protocol Evolution now treats this as the first proven
protocol lifecycle: packet, terms, controlled ACTIVE, real action, PAUSED
closure, and safe-state readback.

Durable memory decision completed: the lifecycle proof now enters the
Institutional Register as active memory anchored to the re-pause closure
transaction. Chronicle remains a separate human curation decision, and any
public referral/source product remains a separate future approval path.
Public/default buying still uses `ZERO_SOURCE_ID`; public source links, claim
UI, source dashboards, and broad activation remain deferred until anti-abuse,
legal/accounting, and UX rules are approved.

