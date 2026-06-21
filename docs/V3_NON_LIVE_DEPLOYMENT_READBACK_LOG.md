# V3 Non-Live Deployment Readback Log

Status: DEPLOYED / OWNER ACCEPTED / FUNDED DIRECT ON-CHAIN V3 SALE CANDIDATE / NOT REGISTRY-WIRED / NOT PUBLIC FRONTEND LIVE

This log records the V3 deployment, ownership, V2b pause, and V3 funding readbacks. It does not authorize source records, registry switch, public V3 UI, recovery, additional funding, pause/unpause, activation, or any private-key/broadcast action.

Precise status: MembershipSaleV3 is deployed, owner-accepted, funded with 7,000,000 SYN, not registry-wired, not publicly activated, and not public frontend live. `paused()` is false. Because V3 is funded and unpaused, it is a directly callable on-chain V3 sale candidate / internal working sale path. The public frontend still points to V2b, which is now paused on-chain, so the public buy flow may fail until a separate registry/frontend activation ceremony is approved.

## Contracts

| Contract | Address | Deployment tx | Status |
| --- | --- | --- | --- |
| SourceRegistryV1 | `0x780013bB358be6be95b401901264FC7c22a595a6` | `0x29ae91db4b5868a5b572c315c250cce8b2ab8c438df97f6617a4a8b2bc435a67` | DEPLOYED / NON-LIVE / OWNER ACCEPTED / NO SOURCE RECORDS |
| MembershipSaleV3 | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` | `0x635770ef23a36e4db3d5855b94dc6d6c3b2d72192c59b663e36f312f78bbb42c` | DEPLOYED / OWNER ACCEPTED / FUNDED WITH 7,000,000 SYN / DIRECT ON-CHAIN CANDIDATE / NOT REGISTRY-WIRED / NOT PUBLIC FRONTEND LIVE |
| Membership Sale V2b | `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` | Existing V2b deployment | PAUSED ON-CHAIN / FRONTEND STILL POINTS HERE UNTIL REGISTRY SWITCH |

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
| SourceRegistryV1 `SourceCreated` logs since deploy | `0` |
| MembershipSaleV3 `owner()` | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| MembershipSaleV3 `pendingOwner()` | `0x0000000000000000000000000000000000000000` |
| MembershipSaleV3 `paused()` | `false` |
| MembershipSaleV3 `availableSyn()` | `7,000,000 SYN` |
| MembershipSaleV3 `sellableSynForNextSeat()` | `2,904,500 SYN` |
| MembershipSaleV3 SYN balance | `7,000,000 SYN` |
| MembershipSaleV3 `memberCount()` | `8` |
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

V3 is not public frontend live because:

- The frontend registry still points to Membership Sale V2b.
- The new V3 addresses are not live in frontend registry/config.
- `/v3-preview` remains candidate/read-only/not-live.
- No public V3 buy UI exists.
- No registry switch happened.
- No source records exist.
- No SourceCreated event has been emitted.
- No public activation happened.

V3 is now funded and unpaused, so the old zero-funding safety boundary no longer applies. The current boundary is no registry switch, no public V3 UI, no source records, and no activation.

## Current Truth Classification

- V2b: paused, recovery timelock started, still the public frontend target for now, but public buy flow may fail while frontend remains unchanged.
- V3: deployed, verified, owner accepted, funded with 7,000,000 SYN, unpaused, directly callable on-chain, not public frontend-wired, no source records, not publicly activated.

Canonical wording: V3 is a funded direct on-chain V3 sale candidate / internal working sale path. Do not call it public frontend live.