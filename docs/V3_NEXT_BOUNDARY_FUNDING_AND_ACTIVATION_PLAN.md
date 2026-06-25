# V3 Next Boundary: Direct Buy and Source Activation Are Separate

Status: POST-FUNDING CONSOLIDATION / V2B PAUSED / V3 FRONTEND BUY TARGET / ONE PAUSED INTERNAL SOURCE

This document records the boundary after the V2b pause, V3 funding, frontend buy-target wiring, and first internal PAUSED source record. It does not authorize source activation, referral UI, claim UI, recovery, additional funding, pause/unpause, public source-aware buys, or any private-key/broadcast action.

## Current State

| Surface | Status |
| --- | --- |
| V2b | Paused on-chain; recovery timelock started; retained as historical proof and recovery boundary |
| SourceRegistryV1 | Deployed, owner accepted, one internal PAUSED source record |
| MembershipSaleV3 | Deployed, owner accepted, funded, unpaused, current frontend approval/quote/buy target |
| Public frontend | Direct buy flow points to V3 with zero sourceId; `/v3-preview` remains read-only source/acquisition preview |
| Source activation | Not approved and not performed |
| Referral / claim UI | Not approved and not performed |

Owner wallet: `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73`.

Deployment wallet: `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`.

## Source Verification Status

| Surface | SourceRegistryV1 | MembershipSaleV3 | Compiler Settings |
| --- | --- | --- | --- |
| Snowtrace API | VERIFIED | VERIFIED | `v0.8.24+commit.e11b9ed9`, optimizer enabled, 200 runs, EVM `paris`, non-proxy |
| Routescan API | VERIFIED | VERIFIED | `v0.8.24+commit.e11b9ed9`, optimizer enabled, 200 runs, EVM `paris`, non-proxy |
| Sourcify | PERFECT MATCH | PERFECT MATCH | Solidity `0.8.24+commit.e11b9ed9`, optimizer enabled, 200 runs, `viaIR: true`, EVM `paris` |

## Recorded Transactions

| Event | Transaction | Result |
| --- | --- | --- |
| Correct V2b pause | `0x74ccaa2fb80c266a54f57387021cc5ff634c0853f396b4a12d2654b64a05fede` | Success; target was correct V2b `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` |
| Mistaken V2a pause attempt | `0x3b7db7ab73c028feec4fb084defba393e7152d99da17dde291e0423acc302979` | Reverted; no effect on V2b |
| V3 funding | `0x04b3baf507d2908bff3b561207407cd12d8469a5785bcf90cd4dccaaea5cb7e2` | Success; 7,000,000 SYN sent to MembershipSaleV3 |
| First internal SourceCreated | `0xf72d3c0ad6445f407382508985fc01c8d458186a410701ae40308a9d5f7a5280` | Success; source `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` created as PAUSED |

## V2b Recovery Boundary

| Field | Value |
| --- | --- |
| V2b `pausedAt()` | `1782053724` |
| Recovery timelock | 14 days |
| Earliest `recoverUnsoldSyn()` timestamp | `1783263324` |
| Earliest recovery UTC | `2026-07-05T14:55:24.000Z` |
| Earliest recovery Istanbul | `5 Jul 2026, 17:55:24 GMT+3` |

Do not call `recoverUnsoldSyn()` until a separate recovery ceremony is approved.

## Current V3 Funding Readback

| Field | Value |
| --- | --- |
| Funding source wallet | `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` |
| Funding amount | `7,000,000 SYN` |
| MembershipSaleV3 SYN balance | `6,999,000 SYN` |
| MembershipSaleV3 `availableSyn()` | `6,999,000 SYN` |
| MembershipSaleV3 `sellableSynForNextSeat()` | `2,904,000 SYN` |
| MembershipSaleV3 `paused()` | `false` |
| MembershipSaleV3 `memberCount()` | `9` |
| MembershipSaleV3 `currentEra()` | `1` |
| SourceRegistryV1 first internal source status | `PAUSED` |

## Already Done

- SourceRegistryV1 deployed/readback green.
- SourceRegistryV1 ownership transferred and accepted by owner hardware wallet.
- MembershipSaleV3 deployed/readback green.
- MembershipSaleV3 ownership transferred and accepted by owner hardware wallet.
- SourceRegistryV1 first internal PAUSED source record read back.
- Correct V2b pause transaction verified.
- Mistaken V2a pause attempt recorded as reverted/no effect.
- V3 funding transaction verified.
- Frontend direct-buy flow is wired to MembershipSaleV3.

## Still Not Allowed

- No recovery of V2b unsold SYN.
- No additional SYN funding.
- No USDC funding.
- No additional source records.
- No source activation.
- No referral/source UI.
- No claim UI.
- No public claim/referral UI.
- No pause/unpause transaction unless separately approved in a transaction ceremony.

## Next Approval Ceremonies

These must remain separate. Completion of one does not authorize the next.

1. V2b recovery decision after timelock eligibility.
2. Internal source-aware buy path decision.
3. Source activation decision.
4. Referral/source UI activation.
5. Post-activation monitoring.

## Guardrail

V3 deployed addresses may appear in the live direct-buy frontend config only for zero-source public purchases. SourceRegistryV1 has one PAUSED internal source record, but it must remain unusable until a separate activation ceremony approves source terms, source-aware path, disclosures, and readbacks.

Canonical wording: V3 is the current direct-buy Membership Sale target. Source/referral remains inactive.
