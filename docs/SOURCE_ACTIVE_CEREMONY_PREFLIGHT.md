# Source ACTIVE Ceremony Preflight

Status: CURRENT-AUTHORITY PREFLIGHT / NO TRANSACTION AUTHORIZED / NO ACTIVATION AUTHORIZED

Last updated: 2026-06-25

Starting GitHub commit: `867647975d79e85b1bb463fad93fc2e54b79664e`

This document prepares the non-transactional preflight for a possible future
`ACTIVE` status ceremony for the existing internal PAUSED source record.

It does not authorize source activation, referral activation, wallet signing,
transactions, public referral links, public source-aware buy paths, claim UI,
source dashboards, registry switches, contract changes, deployment, production
publish, or any public activation claim.

## Executive Verdict

`NO-GO FOR SIGNING OR BROADCAST`

Reason: this Codex environment does not have `AVAX_RPC` or
`VITE_AVALANCHE_RPC_URL` set, so fresh Avalanche C-Chain current-authority
readbacks were not performed here.

The code and packet state are otherwise positioned for the next preflight step:

- the internal PAUSED source record is represented in the repository read model,
- public/default buys still use `ZERO_SOURCE_ID`,
- the localhost-only source-aware harness exists and remains locked while the
  source is `PAUSED`,
- the source window has not started as of 2026-06-25 and can still be used if
  the controlled test occurs between July 1 and July 15, 2026 UTC.

The next action is not activation. The next action is to run the exact live
readback commands with `AVAX_RPC`, then ask the founder for the exact approval
sentence only if every readback is green.

## Frozen Target

| Field | Expected value |
| --- | --- |
| Network | Avalanche C-Chain |
| Chain ID | `43114` |
| SourceRegistryV1 | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| MembershipSaleV3 | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` |
| Expected owner signer | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| Source label | `INTERNAL_PROTOCOL_TEST_SOURCE_001` |
| sourceId | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| sourceWallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| payoutWallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| sourceClass | `BUILDER_SOURCE` / enum value `1` |
| current required status before activation | `PAUSED` / enum value `2` |
| proposed future status | `ACTIVE` / enum value `1` |
| commissionBps | `500` |
| scope | `WINDOWED` / enum value `1` |
| startTime | `1782907200` / `2026-07-01T12:00:00Z` |
| endTime | `1784116800` / `2026-07-15T12:00:00Z` |
| grossCap | `25000000` USDC units / `25` USDC |
| perBuyerCap | `5000000` USDC units / `5` USDC |
| appliesToRepeatPurchases | `false` |
| metadataHash | `0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d` |

## Current-Authority Readback Table

| Check | Expected | Current result |
| --- | --- | --- |
| RPC availability | `AVAX_RPC` or `VITE_AVALANCHE_RPC_URL` available privately | NOT RUN - both missing in this Codex shell |
| Chain ID | `43114` | UNCONFIRMED |
| SourceRegistryV1 bytecode | Non-empty | UNCONFIRMED |
| SourceRegistryV1 `owner()` | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` | UNCONFIRMED |
| SourceRegistryV1 `pendingOwner()` | `0x0000000000000000000000000000000000000000` | UNCONFIRMED |
| `sourceExists(sourceId)` | `true` | UNCONFIRMED |
| `sourceConfig(sourceId).sourceWallet` | `0x244531C571966f90f4849e03a507543d90f9C721` | UNCONFIRMED |
| `sourceConfig(sourceId).payoutWallet` | `0x244531C571966f90f4849e03a507543d90f9C721` | UNCONFIRMED |
| `sourceConfig(sourceId).sourceClass` | `1` | UNCONFIRMED |
| `sourceConfig(sourceId).commissionBps` | `500` | UNCONFIRMED |
| `sourceConfig(sourceId).status` | `2` / `PAUSED` | UNCONFIRMED |
| `sourceConfig(sourceId).scope` | `1` / `WINDOWED` | UNCONFIRMED |
| `sourceConfig(sourceId).startTime` | `1782907200` | UNCONFIRMED |
| `sourceConfig(sourceId).endTime` | `1784116800` | UNCONFIRMED |
| `sourceConfig(sourceId).grossCap` | `25000000` | UNCONFIRMED |
| `sourceConfig(sourceId).perBuyerCap` | `5000000` | UNCONFIRMED |
| `sourceConfig(sourceId).appliesToRepeatPurchases` | `false` | UNCONFIRMED |
| `sourceConfig(sourceId).metadataHash` | `0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d` | UNCONFIRMED |
| `isActive(sourceId)` | `false` | UNCONFIRMED |
| MembershipSaleV3 bytecode | Non-empty | UNCONFIRMED |
| MembershipSaleV3 `SOURCE_REGISTRY()` | `0x780013bB358be6be95b401901264FC7c22a595a6` | UNCONFIRMED |
| MembershipSaleV3 `paused()` | `false` unless a later owner action changed it | UNCONFIRMED |
| Public/default buy path | `ZERO_SOURCE_ID` | CODE CHECK GREEN: `LivePurchase` still passes `ZERO_SOURCE_ID` |
| Localhost test route gates | localhost + dev + flag + exact query + ACTIVE source status required | CODE CHECK GREEN |
| Production sync before ceremony | Not required for signing; current production may lag this internal GitHub route batch | CAN WAIT |

## Exact Readback Commands

Run these only in a private terminal where the QuickNode HTTPS endpoint is
available. Do not commit or paste the RPC URL.

PowerShell:

```powershell
cd "C:\Users\kemal\Desktop\The Syndicate  Project\Full version from Replit\.codex-github-sync"
$env:AVAX_RPC="<QuickNode Avalanche C-Chain HTTPS endpoint>"
$SOURCE_REGISTRY="0x780013bB358be6be95b401901264FC7c22a595a6"
$SALE_V3="0x2A6cFc76906e758B934209AFf5A163c9bC20132E"
$SOURCE_ID="0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620"

cast chain-id --rpc-url $env:AVAX_RPC
cast code $SOURCE_REGISTRY --rpc-url $env:AVAX_RPC
cast call $SOURCE_REGISTRY "owner()(address)" --rpc-url $env:AVAX_RPC
cast call $SOURCE_REGISTRY "pendingOwner()(address)" --rpc-url $env:AVAX_RPC
cast call $SOURCE_REGISTRY "sourceExists(bytes32)(bool)" $SOURCE_ID --rpc-url $env:AVAX_RPC
cast call $SOURCE_REGISTRY "sourceConfig(bytes32)((address,uint8,uint16,uint8,uint8,uint64,uint64,uint256,uint256,bool,address,bytes32,address,uint64))" $SOURCE_ID --rpc-url $env:AVAX_RPC
cast call $SOURCE_REGISTRY "isActive(bytes32)(bool)" $SOURCE_ID --rpc-url $env:AVAX_RPC

cast code $SALE_V3 --rpc-url $env:AVAX_RPC
cast call $SALE_V3 "owner()(address)" --rpc-url $env:AVAX_RPC
cast call $SALE_V3 "pendingOwner()(address)" --rpc-url $env:AVAX_RPC
cast call $SALE_V3 "SOURCE_REGISTRY()(address)" --rpc-url $env:AVAX_RPC
cast call $SALE_V3 "paused()(bool)" --rpc-url $env:AVAX_RPC
```

Optional fork rehearsal after readback:

```powershell
cd "C:\Users\kemal\Desktop\The Syndicate  Project\Full version from Replit\.codex-github-sync\contracts"
$env:AVAX_RPC="<QuickNode Avalanche C-Chain HTTPS endpoint>"
forge test --match-contract SourceAttributionForkV3Test --evm-version cancun -vv
```

## Source Terms And Window Review

The approved source window is:

- start: `2026-07-01T12:00:00Z`
- end: `2026-07-15T12:00:00Z`

As of 2026-06-25, the window has not started. Activation can use the existing
terms only if the ACTIVE ceremony, localhost-only $5 test, and re-pause
readback can realistically occur inside this window.

If the test cannot occur inside this window, do not activate. Prepare:

1. an updated founder-approved source packet,
2. a new `metadataHash`,
3. an `updateSourceTerms(sourceId, terms)` review using the same `sourceWallet`
   and `payoutWallet`,
4. post-update readback proving terms match the new packet,
5. then a new ACTIVE preflight.

## Go / No-Go Recommendation

| Decision | Verdict | Reason |
| --- | --- | --- |
| Ask founder to sign now | NO-GO | Fresh chain readbacks were not performed in this environment. |
| Ask founder to approve after green readback | CONDITIONAL GO | Existing terms are time-viable if the controlled test will occur inside July 1-15, 2026 UTC. |
| Activate public referral | NO-GO | Public referral remains inactive. |
| Run public source-aware buy path | NO-GO | No public source-aware buy path exists or is authorized. |
| Run localhost-only test while source is PAUSED | NO-GO | PAUSED sources cannot route commission; harness stays locked. |
| Prepare Replit publish now | CAN WAIT | This is an internal preflight/docs boundary, not a public-truth emergency. |

## Exact Future Activation Transaction Under Review Only

This is for founder review after green readbacks only. It is not an instruction
to sign.

| Field | Value |
| --- | --- |
| Contract | `SourceRegistryV1` |
| Address | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| Network | Avalanche C-Chain / chain ID `43114` |
| Expected signer | Fresh-read `owner()` = `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| Function | `setSourceStatus(bytes32 sourceId, SourceStatus status)` |
| ABI/cast signature | `setSourceStatus(bytes32,uint8)` |
| sourceId | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| status | `ACTIVE` / enum value `1` |

## Founder Approval Sentence Required

Before any wallet signing, the founder must explicitly approve:

> I approve activating only sourceId
> `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620`
> by calling `setSourceStatus(sourceId, ACTIVE)` on SourceRegistryV1 for a
> controlled localhost-only $5 test inside the approved July 1-15, 2026 UTC
> window. I understand this does not activate public referral, public source
> links, source dashboard, claim UI, public source-aware buys, registry switch,
> or any other source.

## Post-Activation Readbacks Required

After a separately approved future ACTIVE transaction, read back:

1. transaction status and block,
2. `SourceStatusChanged(sourceId, previousStatus=2, newStatus=1)`,
3. `sourceConfig(sourceId).status = 1`,
4. `isActive(sourceId) = true`,
5. SourceRegistry `owner()` unchanged,
6. SourceRegistry `pendingOwner()` remains zero,
7. `sourceConfig(sourceId)` terms still match the packet,
8. `LivePurchase` public/default buy path still uses `ZERO_SOURCE_ID`,
9. `/referral` still has no public source link, claim UI, or source dashboard,
10. production has no public source-aware buy path.

## Exact $5 Localhost Test Sequence After Activation

Only after green ACTIVE readbacks:

1. Run local development with `VITE_ENABLE_SOURCE_TEST_MODE=true`.
2. Open `/labs/source-attribution-test?sourceTest=INTERNAL_PROTOCOL_TEST_SOURCE_001`.
3. Confirm the route is on localhost or loopback only.
4. Confirm the harness shows `READY_FOR_LOCAL_TEST`.
5. Use a fresh buyer wallet that has never bought SYN and is not historical.
6. Confirm test amount is exactly `5` USDC.
7. Confirm the sourceId is the frozen non-zero sourceId.
8. Confirm the quote shows acquisition commission and Net USDC Routed before
   any wallet control appears.
9. Approve USDC only for MembershipSaleV3 if needed.
10. Execute the controlled source-attributed buy.
11. Read back `MembershipPurchasedV3` receipt fields: sourceId, sourceClass,
    sourceWallet, commissionBps, acquisitionCost, Net USDC Routed, Vault /
    Liquidity / Operations routing, source payout or escrow, memberNumber,
    firstSeat, Activity, My Syndicate, and cache-after-reload behavior.

## Rollback / Re-Pause Plan

If the ACTIVE ceremony is approved later, activation must be temporary for the
controlled test. The safest post-test action is to re-pause the source:

| Field | Value |
| --- | --- |
| Contract | `SourceRegistryV1` |
| Function | `setSourceStatus(bytes32,uint8)` |
| sourceId | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| status | `PAUSED` / enum value `2` |

Post re-pause readback:

- `sourceConfig(sourceId).status = 2`,
- `isActive(sourceId) = false`,
- historical receipt remains readable,
- no public referral, claim UI, public source link, or source-aware public buy
  path appears.

## What Stays Publicly Inactive

- Public referral activation.
- Public source links.
- Public source-aware buy path.
- Claim UI.
- Source dashboard.
- Source aliases.
- Member referral onboarding.
- Archive1155 / NFT source attribution.
- SwapRail source attribution.
- ProductSaleRouter source attribution.
- Any MLM/downline/upline, passive-income, yield, ROI, or financial leaderboard
  framing.

## Exact Next Step

Run the readback commands with `AVAX_RPC` in a private terminal. If every
readback matches this document and the intended test can occur inside the
approved window, the founder may then review the approval sentence above.

Until then, this preflight remains `NO-GO FOR SIGNING OR BROADCAST`.
