# V3 Non-Live Deployment Readback Log

Status: DEPLOYED / OWNER ACCEPTED / V2B PAUSED / V3 FUNDED / FRONTEND BUY TARGET / ONE PAUSED INTERNAL SOURCE

This log records the V3 deployment, ownership, V2b pause, V3 funding readbacks, frontend buy-target wiring, and first internal PAUSED source readback. It does not authorize source activation, referral UI, claim UI, recovery, additional funding, pause/unpause, public source-aware buys, or any private-key/broadcast action.

Precise status: MembershipSaleV3 is deployed, owner-accepted, funded with 7,000,000 SYN, and selected by the frontend buy flow as the active approval/quote/purchase target. `paused()` is false. Public buys use zero sourceId. SourceRegistryV1 has one internal PAUSED source record; referral UI, claim UI, public source-aware buys, and source activation remain inactive. V2b is paused on-chain and retained for history/recovery boundaries.

## Contracts

| Contract | Address | Deployment tx | Status |
| --- | --- | --- | --- |
| SourceRegistryV1 | `0x780013bB358be6be95b401901264FC7c22a595a6` | `0x29ae91db4b5868a5b572c315c250cce8b2ab8c438df97f6617a4a8b2bc435a67` | DEPLOYED / OWNER ACCEPTED / ONE PAUSED INTERNAL SOURCE / REFERRAL UI INACTIVE |
| MembershipSaleV3 | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` | `0x635770ef23a36e4db3d5855b94dc6d6c3b2d72192c59b663e36f312f78bbb42c` | DEPLOYED / OWNER ACCEPTED / FUNDED WITH 7,000,000 SYN / CURRENT FRONTEND BUY TARGET / ZERO SOURCE ID PUBLIC BUYS |
| Membership Sale V2b | `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` | Existing V2b deployment | PAUSED ON-CHAIN / HISTORICAL SOURCE / RECOVERY BOUNDARY |

## Ownership Ceremony

| Step | Transaction | Result |
| --- | --- | --- |
| MembershipSaleV3 transferOwnership | `0xe84ebf3a6adc76f432ce3825776083605bdbdd3c29e1425f59e80300c43f3f30` | Success |
| SourceRegistryV1 transferOwnership | `0x9f420c5edd17349109727a40bf4936d0387ac76f6a1eb00ee75b0d7ff35a23d8` | Success |
| MembershipSaleV3 acceptOwnership | `0x2b1e214e6b1e5a1f72bc2aee75cd1e3b7076dde8b3b3cf4df3739a5a0830cb1a` | Success |
| SourceRegistryV1 acceptOwnership | `0x555d27fe42502f3c25a36361271153df4e85d2c4cfe16611b5a53a0e56eddbf8` | Success |

| Role | Address |
| --- | --- |
| Final owner | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| Deployment wallet | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` |

## V2b Pause Readback

Readback block: `88511703`

| Check | Readback |
| --- | --- |
| Correct V2b pause tx | `0x74ccaa2fb80c266a54f57387021cc5ff634c0853f396b4a12d2654b64a05fede` |
| Correct V2b pause tx status | Success |
| Correct V2b pause block | `88511253` |
| Correct V2b pause timestamp | `1782053724` |
| Correct V2b pause from | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` |
| Correct V2b pause target | `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` |
| Correct V2b function selector | `0x8456cb59` (`pause()`) |
| Mistaken V2a pause tx | `0x3b7db7ab73c028feec4fb084defba393e7152d99da17dde291e0423acc302979` |
| Mistaken V2a pause tx result | Reverted; no effect on V2b |
| V2b `paused()` | `true` |
| V2b `pausedAt()` | `1782053724` |
| V2b `memberCount()` | `8` |
| V2b `currentEra()` | `1` |
| V2b SYN balance | `6,989,000 SYN` |
| V2b `availableSyn()` | `6,989,000 SYN` |
| V2b `sellableSynForNextSeat()` | `2,893,500 SYN` |
| V2b reserve floor | `4,096,000 SYN` |
| V2b `isConcluded()` | `false` |
| Post-freeze V2b purchase logs | `0` |
| Earliest `recoverUnsoldSyn()` timestamp | `1783263324` |
| Earliest `recoverUnsoldSyn()` UTC | `2026-07-05T14:55:24.000Z` |
| Earliest `recoverUnsoldSyn()` Istanbul | `5 Jul 2026, 17:55:24 GMT+3` |

Do not call `recoverUnsoldSyn()` until a separate recovery ceremony is approved.

## V3 Funding Readback

| Check | Readback |
| --- | --- |
| V3 funding tx | `0x04b3baf507d2908bff3b561207407cd12d8469a5785bcf90cd4dccaaea5cb7e2` |
| V3 funding tx status | Success |
| V3 funding block | `88510845` |
| V3 funding timestamp | `1782053226` |
| V3 funding source wallet | `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` |
| V3 funding token | SYN `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| V3 funding recipient | MembershipSaleV3 `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` |
| V3 funding amount | `7,000,000 SYN` |

## Current V3 Readback

Readback block: `88511703`

| Check | Readback |
| --- | --- |
| SourceRegistryV1 `owner()` | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| SourceRegistryV1 `pendingOwner()` | `0x0000000000000000000000000000000000000000` |
| SourceRegistryV1 `SourceCreated` logs since prior zero-record readback | `1` |
| First SourceCreated tx | `0xf72d3c0ad6445f407382508985fc01c8d458186a410701ae40308a9d5f7a5280` |
| First SourceCreated block | `88705814` |
| First SourceCreated timestamp | `2026-06-24T09:11:50.000Z` |
| First SourceCreated `sourceId` | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| First SourceCreated status | `PAUSED` |
| First SourceCreated source/payout wallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| First SourceCreated metadata hash | `0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d` |
| MembershipSaleV3 `owner()` | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| MembershipSaleV3 `pendingOwner()` | `0x0000000000000000000000000000000000000000` |
| MembershipSaleV3 `paused()` | `false` |
| MembershipSaleV3 `availableSyn()` | `6,999,000 SYN` |
| MembershipSaleV3 `sellableSynForNextSeat()` | `2,904,000 SYN` |
| MembershipSaleV3 SYN balance | `6,999,000 SYN` |
| MembershipSaleV3 `memberCount()` | `9` |
| MembershipSaleV3 `currentEra()` | `1` |
| MembershipSaleV3 `SOURCE_REGISTRY()` | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| MembershipSaleV3 `USDC()` | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| MembershipSaleV3 `SYN()` | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| MembershipSaleV3 `VAULT()` | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` |
| MembershipSaleV3 `LIQUIDITY()` | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |
| MembershipSaleV3 `OPERATIONS()` | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |
| MembershipSaleV3 `GENESIS_OFFSET()` | `8` |
| MembershipSaleV3 `V1_MEMBER_ROOT()` | `0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329` |
| MembershipSaleV3 `MAX_USDC_PER_TX()` | `25000000000` |
| MembershipSaleV3 `RESERVE_THROUGH_SEAT()` | `10000` |

## Source Verification Status

Source verification was checked after the non-live deployment/readback ceremony:

- Snowtrace API: SourceRegistryV1 VERIFIED; MembershipSaleV3 VERIFIED.
- Routescan API: SourceRegistryV1 VERIFIED; MembershipSaleV3 VERIFIED.
- Sourcify: SourceRegistryV1 PERFECT MATCH; MembershipSaleV3 PERFECT MATCH.

Compiler/settings match the intended Remix Standard JSON profile: Solidity `0.8.24+commit.e11b9ed9`, optimizer enabled, 200 runs, `viaIR: true`, EVM `paris`.

## Current Safety Boundary

V3 is now the public frontend buy target, but source/referral activation remains blocked because:

- Public buys use zero sourceId.
- `/v3-preview` remains a candidate/read-only source preview, not a write surface.
- One internal PAUSED source record exists.
- No source record is ACTIVE.
- No referral UI exists.
- No claim UI exists.

V3 is funded and unpaused, so the old zero-funding safety boundary no longer applies. The current boundary is V3 direct-buy only, zero sourceId, one PAUSED internal source record, no referral/claim UI, no public source-aware buy path, and no source activation.

## Current Truth Classification

- V2b: paused, recovery timelock started, retained as historical proof and recovery boundary.
- V3: deployed, verified, owner accepted, funded with 7,000,000 SYN, unpaused, selected as the public frontend buy target, and constrained to zero sourceId public buys.
- SourceRegistryV1: deployed and owner accepted with one internal PAUSED source record. Referral/source/claim UI remains inactive.

Canonical wording: V3 is the current direct-buy Membership Sale target. Do not call source/referral live.
