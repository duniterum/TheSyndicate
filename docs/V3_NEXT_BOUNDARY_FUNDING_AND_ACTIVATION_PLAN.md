# V3 Next Boundary: Registry and Public Activation Are Separate

Status: POST-FUNDING CONSOLIDATION / V2B PAUSED / V3 FUNDED DIRECT ON-CHAIN CANDIDATE / NOT PUBLIC FRONTEND LIVE

This document records the boundary after the V2b pause and V3 funding ceremonies. It does not authorize source records, registry switch, public V3 UI, recovery, additional funding, pause/unpause, activation, or any private-key/broadcast action.

## Current State

| Surface | Status |
| --- | --- |
| V2b | Paused on-chain; recovery timelock started; frontend still points to V2b until a separate registry/frontend switch is approved |
| SourceRegistryV1 | Deployed, owner accepted, no source records |
| MembershipSaleV3 | Deployed, owner accepted, funded with 7,000,000 SYN, unpaused, directly callable on-chain, not public frontend-wired |
| Public frontend | Still points to V2b; no public V3 buy UI; `/v3-preview` remains read-only candidate |
| Registry switch | Not approved and not performed |
| Activation | Not approved and not performed |

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
| MembershipSaleV3 SYN balance | `7,000,000 SYN` |
| MembershipSaleV3 `availableSyn()` | `7,000,000 SYN` |
| MembershipSaleV3 `sellableSynForNextSeat()` | `2,904,500 SYN` |
| MembershipSaleV3 `paused()` | `false` |
| MembershipSaleV3 `memberCount()` | `8` |
| MembershipSaleV3 `currentEra()` | `1` |
| SourceRegistryV1 `SourceCreated` logs since deploy | `0` |

## Already Done

- SourceRegistryV1 deployed/readback green.
- SourceRegistryV1 ownership transferred and accepted by owner hardware wallet.
- MembershipSaleV3 deployed/readback green.
- MembershipSaleV3 ownership transferred and accepted by owner hardware wallet.
- SourceRegistryV1 source-record count recorded as zero.
- Correct V2b pause transaction verified.
- Mistaken V2a pause attempt recorded as reverted/no effect.
- V3 funding transaction verified.
- Frontend remains pointed at V2b.

## Still Not Allowed

- No recovery of V2b unsold SYN.
- No additional SYN funding.
- No USDC funding.
- No source records.
- No registry switch.
- No public V3 buy UI.
- No V3 activation.
- No public claim/referral UI.
- No pause/unpause transaction unless separately approved in a transaction ceremony.

## Next Approval Ceremonies

These must remain separate. Completion of one does not authorize the next.

1. V2b recovery decision after timelock eligibility.
2. Source-record policy decision.
3. Frontend registry switch plan.
4. Public UI activation.
5. Post-activation monitoring.

## Guardrail

V3 deployed addresses may appear in docs as deployed/funded candidate addresses. They must not appear in the live frontend registry/config until a separate activation ceremony approves registry switch and public UI.

Canonical wording: V3 is a funded direct on-chain V3 sale candidate / internal working sale path. It is not public frontend live.