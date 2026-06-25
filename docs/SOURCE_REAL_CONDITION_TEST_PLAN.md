# Source Real-Condition Test Plan

Status: EXCEPTIONAL FOUNDER PREP / NO TRANSACTION AUTHORIZED / NO ACTIVATION AUTHORIZED

Last updated: 2026-06-25

This plan prepares the fastest safe path to one real-condition
source-attributed MembershipSaleV3 purchase before the original July 1 source
window.

It does not authorize wallet signing, `updateSourceTerms`, source activation,
the $5 purchase, re-pause, referral activation, public source links, claim UI,
source dashboards, registry switches, contract changes, or production publish.

## Executive Verdict

The protocol can test before July 1 only if the existing PAUSED source terms
are updated first.

Best path:

1. prepare and publish a production-internal gated operator console,
2. update source terms to a new 14-day window,
3. read back the updated terms while the source remains PAUSED,
4. set the source ACTIVE,
5. run exactly one $5 source-attributed test buy through the internal route,
6. read back the V3 receipt and payout,
7. re-pause the source,
8. read back that the source is no longer active.

This is not public referral. Public/default `/join` remains `ZERO_SOURCE_ID`.

## Why Not Wait Until July 1

Waiting avoids one owner transaction (`updateSourceTerms`) but delays the only
proof that source attribution works in real production conditions.

The before-July path adds one visible policy action and one new metadata hash,
but keeps a cleaner audit trail than silently using an out-of-window source or
trying to test through private calldata only.

## Why Not Direct Contract Call First

A direct contract call is private and technically valid, but it increases human
calldata and min-output mistake risk. The production-internal route proves the
real wallet UX, approval spender, live quote, exact non-zero sourceId, receipt
fields, and cache/read-model behavior without exposing a public source path.

## Proposed Updated Window

| Field | Value |
| --- | --- |
| Previous start | `1782907200` / `2026-07-01T12:00:00Z` |
| Previous end | `1784116800` / `2026-07-15T12:00:00Z` |
| Proposed start | `1782388800` / `2026-06-25T12:00:00Z` |
| Proposed end | `1783598400` / `2026-07-09T12:00:00Z` |
| Window length | 14 days |
| Reason | Allows immediate controlled testing while preserving a short bounded audit window. |

## New Metadata Hash

The sourceId remains unchanged. The terms change, so the metadata hash must
change.

| Field | Value |
| --- | --- |
| Metadata artifact | `docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_TERMS_UPDATE_2026_06_25_METADATA.json` |
| New metadataHash | `0x797dedbf845edc5954012c46a6c42e121f19f142d76fe34c8f59bf8e8c7bd681` |
| Previous metadataHash | `0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d` |

The hash is `keccak256` over the UTF-8 canonical JSON form of the metadata
artifact with lexicographically sorted object keys. The artifact does not
include a `metadataHash` field.

## Production-Internal Operator Console Boundary

The route remains:

```text
/labs/source-attribution-test?sourceTest=INTERNAL_PROTOCOL_TEST_SOURCE_001
```

It must stay:

- absent from public navigation,
- absent from the sitemap,
- `noindex,nofollow`,
- locked unless explicitly enabled,
- locked unless the connected buyer wallet is allowlisted,
- locked unless live SourceRegistry readback matches this packet,
- locked unless `isActive(sourceId) = true`,
- fixed to exactly 5 USDC,
- clear that it is `INTERNAL SOURCE TEST MODE / NOT PUBLIC REFERRAL`,
- explicit about the current ceremony step, approval status, buy status, next
  action, and stop condition so the operator never has to leave the page or
  guess whether approval is the buy.

Required Replit env for a future published internal test:

```text
VITE_ENABLE_PRODUCTION_SOURCE_TEST_MODE=true
VITE_SOURCE_TEST_ALLOWED_BUYERS=<fresh buyer wallet address>
```

`VITE_` values are public bundle values, not secrets. They are gates, not
credentials. Do not put RPC secrets or private keys in them.

## Transaction 1 - updateSourceTerms

Founder review only. Not an instruction to sign.

| Field | Value |
| --- | --- |
| Contract | `SourceRegistryV1` |
| Address | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| Network | Avalanche C-Chain / chain ID `43114` |
| Expected signer | SourceRegistry owner `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| Function | `updateSourceTerms(bytes32 sourceId, SourceTerms terms)` |
| ABI/cast signature | `updateSourceTerms(bytes32,(address,uint8,uint16,uint8,uint64,uint64,uint256,uint256,bool,address,bytes32))` |

Arguments:

| Argument | Value |
| --- | --- |
| `sourceId` | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| `terms.sourceWallet` | `0x244531C571966f90f4849e03a507543d90f9C721` |
| `terms.sourceClass` | `1` / `BUILDER_SOURCE` |
| `terms.commissionBps` | `500` |
| `terms.scope` | `1` / `WINDOWED` |
| `terms.startTime` | `1782388800` |
| `terms.endTime` | `1783598400` |
| `terms.grossCap` | `25000000` |
| `terms.perBuyerCap` | `5000000` |
| `terms.appliesToRepeatPurchases` | `false` |
| `terms.payoutWallet` | `0x244531C571966f90f4849e03a507543d90f9C721` |
| `terms.metadataHash` | `0x797dedbf845edc5954012c46a6c42e121f19f142d76fe34c8f59bf8e8c7bd681` |

Readback after update:

- transaction status success,
- `SourceTermsUpdated` event values match this table,
- `sourceConfig(sourceId).status` remains `PAUSED`,
- `isActive(sourceId) = false`,
- owner unchanged,
- pending owner zero,
- public/default buys remain `ZERO_SOURCE_ID`,
- no public source link,
- no claim UI.

## Transaction 2 - setSourceStatus ACTIVE

Founder review only. Not an instruction to sign.

| Field | Value |
| --- | --- |
| Contract | `SourceRegistryV1` |
| Address | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| Function | `setSourceStatus(bytes32,uint8)` |
| `sourceId` | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| `status` | `1` / `ACTIVE` |

Readback after ACTIVE:

- transaction status success,
- `SourceStatusChanged(sourceId, 2, 1)`,
- `sourceConfig(sourceId).status = ACTIVE`,
- `isActive(sourceId) = true`,
- all terms still match the updated metadata packet,
- public/default buys remain `ZERO_SOURCE_ID`,
- `/referral` remains inactive,
- no claim UI.

## Transaction 3 - One $5 Source-Attributed Test Buy

This purchase must use a fresh buyer wallet that:

- is not historical,
- is not already seated,
- is not the source wallet,
- is not the payout wallet,
- has enough AVAX for gas,
- has at least 5 USDC,
- is included in `VITE_SOURCE_TEST_ALLOWED_BUYERS`.

The internal route must compute a fresh quote immediately before buy.

Expected calls:

1. If needed, approve USDC:

```text
USDC.approve(MembershipSaleV3, 5000000)
```

2. Buy:

```text
MembershipSaleV3.buy(
  5000000,
  <fresh buyer wallet>,
  0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620,
  <fresh minSynOut from quote>,
  []
)
```

Readback after buy:

- transaction status success,
- `MembershipPurchasedV3` event,
- `sourceId` equals the frozen sourceId,
- `sourceClass = 1`,
- `sourceWallet = 0x244531C571966f90f4849e03a507543d90f9C721`,
- `commissionBps = 500`,
- `grossUsdc = 5000000`,
- `acquisitionCost = 250000`,
- `protocolContribution = 4750000`,
- Vault / Liquidity / Operations route from protocol contribution,
- payout wallet USDC increases by acquisition cost or escrow fallback is recorded,
- source gross and buyer gross remaining reflect caps,
- memberNumber and firstSeat are correct,
- Activity/My Syndicate cache and restore preserve V3/source facts.

## Transaction 4 - Re-Pause

Founder review only. Not an instruction to sign.

| Field | Value |
| --- | --- |
| Contract | `SourceRegistryV1` |
| Address | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| Function | `setSourceStatus(bytes32,uint8)` |
| `sourceId` | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| `status` | `2` / `PAUSED` |

Readback after re-pause:

- transaction status success,
- `SourceStatusChanged(sourceId, 1, 2)`,
- `sourceConfig(sourceId).status = PAUSED`,
- `isActive(sourceId) = false`,
- historical source-attributed receipt remains readable,
- public/default buys remain `ZERO_SOURCE_ID`,
- no public referral,
- no claim UI,
- no source dashboard.

## Replit Sync / Publish Prompt

Use only after the founder approves publishing the internal test boundary.

```text
REPLIT - SYNC PRODUCTION-INTERNAL SOURCE TEST PREP FROM GITHUB

GitHub main is the source of truth. Pull the latest GitHub commit provided by
Codex for the production-internal source test prep.

Before pulling:
- report current Replit commit, branch, and git status
- stop and list local changes if any
- preserve intentional local divergences only if already documented

After syncing:
- confirm file-content parity with GitHub
- confirm /labs/source-attribution-test is noindex/nofollow and absent from nav/sitemap
- confirm the page renders as the Source Attribution Operator Console and says to stay on the page
- confirm public /join still uses ZERO_SOURCE_ID
- confirm /referral remains inactive
- confirm no claim UI, no source dashboard, no public source link, and no public source-aware buy path
- run validation
- publish only if green and founder approves publish

Required production env for the internal test build:
VITE_ENABLE_PRODUCTION_SOURCE_TEST_MODE=true
VITE_SOURCE_TEST_ALLOWED_BUYERS=<fresh buyer wallet address>

Do not expose secrets or RPC URLs in logs.
Do not sign or broadcast.
Do not activate source.
Do not perform the $5 buy.
Do not switch registry.
Do not change contracts.

After publish, live QA:
- /join remains ZERO_SOURCE_ID direct-buy path
- /referral remains inactive
- /labs/source-attribution-test without exact query is locked
- /labs/source-attribution-test with exact query is locked unless allowlisted wallet and ACTIVE readback are present
- /labs/source-attribution-test separates approval from the controlled buy and tells the operator to stop for readback after the buy
- no public nav/sitemap source test link exists
- no claim UI appears
```

## Stop Conditions

Stop if:

- Replit is not synced to the expected GitHub commit,
- SourceRegistry owner readback differs,
- source terms do not match the proposed update packet,
- production-internal route leaks into navigation or sitemap,
- `/join` stops using `ZERO_SOURCE_ID`,
- any public page implies referral is live,
- any claim UI appears,
- the fresh buyer wallet is not allowlisted,
- the test cannot complete inside the updated window,
- founder approval is missing for any transaction.

## Public-Inactive Truth That Must Remain

- Public referral remains inactive.
- No public source link exists.
- No claim UI exists.
- No source dashboard exists.
- Public/default `/join` buys remain `ZERO_SOURCE_ID`.
- The internal source is not the public member-referral model.
- Archive1155, SeatRecord721, SwapRail, and product commerce remain outside
  this source test.
