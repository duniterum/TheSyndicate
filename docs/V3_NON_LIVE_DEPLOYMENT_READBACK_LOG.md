# V3 Non-Live Deployment Readback Log

Status: DEPLOYED / NON-LIVE / OWNER ACCEPTED / ZERO-FUNDED / NOT REGISTRY-WIRED / NOT ACTIVATED

This log records the non-live V3 deployment/readback ceremony. It does not authorize funding, source records, registry switch, public V3 UI, unpause/activation, or any private-key/broadcast action.

Precise status: MembershipSaleV3 is deployed, owner-accepted, zero-funded, not registry-wired, not activated, and not live. paused() is false by deployment default; pause is deferred intentionally. No funding is authorized.

## Contracts

| Contract | Address | Deployment tx | Status |
| --- | --- | --- | --- |
| SourceRegistryV1 | `0x780013bB358be6be95b401901264FC7c22a595a6` | `0x29ae91db4b5868a5b572c315c250cce8b2ab8c438df97f6617a4a8b2bc435a67` | DEPLOYED / NON-LIVE / OWNER ACCEPTED / NO SOURCE RECORDS |
| MembershipSaleV3 | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` | `0x635770ef23a36e4db3d5855b94dc6d6c3b2d72192c59b663e36f312f78bbb42c` | DEPLOYED / NON-LIVE / OWNER ACCEPTED / ZERO-FUNDED / NOT REGISTRY-WIRED / NOT ACTIVATED |

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

## Final Readback

Final readback block: `88506731`

| Check | Readback |
| --- | --- |
| SourceRegistryV1 `owner()` | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| SourceRegistryV1 `pendingOwner()` | `0x0000000000000000000000000000000000000000` |
| SourceRegistryV1 `SourceCreated` logs since deploy | `0` |
| MembershipSaleV3 `owner()` | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| MembershipSaleV3 `pendingOwner()` | `0x0000000000000000000000000000000000000000` |
| MembershipSaleV3 `paused()` | `false` |
| MembershipSaleV3 `availableSyn()` | `0` |
| MembershipSaleV3 `sellableSynForNextSeat()` | `0` |
| MembershipSaleV3 SYN balance | `0` |
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
| MembershipSaleV3 `memberCount()` | `8` |
| MembershipSaleV3 `currentEra()` | `1` |

## Non-Live Safety Boundary

V3 is deployed but not practically live because:

- MembershipSaleV3 has zero SYN funding.
- `availableSyn()` is `0`.
- `sellableSynForNextSeat()` is `0`.
- No source records exist.
- No SourceCreated event has been emitted.
- The frontend registry still points to Membership Sale V2b.
- The new V3 addresses are not live in frontend registry/config.
- `/v3-preview` remains candidate/read-only/not-live.
- No public V3 buy UI exists.
- No registry switch happened.
- No activation happened.

Pause is intentionally deferred. The safety boundary is zero funding.

## Next Risk Boundary: Funding

Until SYN is funded into MembershipSaleV3, V3 cannot sell SYN.

Funding MembershipSaleV3 is a separate approval ceremony. If funding is approved later, pause/unpause/activation strategy must be decided before funding. Registry switch and public UI remain separate later approvals.

No SYN funding may happen until a separate funding/activation ceremony is explicitly approved.
