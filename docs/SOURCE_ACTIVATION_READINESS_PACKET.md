# Source Activation Readiness Packet

Status: READINESS PACKET / NO TRANSACTION AUTHORIZED / NO ACTIVATION AUTHORIZED

Last updated: 2026-06-25

This packet defines the conditions that must be satisfied before the existing
internal PAUSED source record can ever be considered for a controlled ACTIVE
status ceremony.

It does not authorize:

- source activation,
- referral activation,
- public referral links,
- public source-aware buy paths,
- claim UI,
- source dashboards,
- registry switches,
- contract changes,
- wallet signing,
- transactions,
- production publish.

## Why This Exists

The next irreversible source-attribution boundary is not another source record.
It is the first possible movement from `PAUSED` policy state to `ACTIVE` source
state.

That movement must be prepared before it is executable.

The institution needs one place that answers:

- what is already proven,
- what must be freshly read back,
- what founder decisions are still missing,
- what code is still missing,
- what must stay blocked,
- what exact action would be reviewed later if activation is approved.

## Current Target

| Field | Value |
| --- | --- |
| Source label | `INTERNAL_PROTOCOL_TEST_SOURCE_001` |
| SourceRegistryV1 | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| MembershipSaleV3 | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` |
| sourceId | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| sourceWallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| payoutWallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| sourceClass | `BUILDER_SOURCE` |
| current status | `PAUSED` |
| commissionBps | `500` |
| scope | `WINDOWED` |
| startTime | `1782907200` |
| endTime | `1784116800` |
| grossCap | `25000000` |
| perBuyerCap | `5000000` |
| appliesToRepeatPurchases | `false` |
| metadataHash | `0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d` |
| SourceCreated tx | `0xf72d3c0ad6445f407382508985fc01c8d458186a410701ae40308a9d5f7a5280` |
| SourceCreated block | `88705814` |

## Current Verdict

`NOT READY FOR ACTIVE CEREMONY`

The source policy fact exists and was read back as `PAUSED`.

The current-authority preflight packet now exists at
`docs/SOURCE_ACTIVE_CEREMONY_PREFLIGHT.md`, but this Codex environment did not
have `AVAX_RPC` or `VITE_AVALANCHE_RPC_URL` set during the preflight sprint.
Fresh live readbacks are still required before any founder approval or signing.

The protocol is ready for:

- readiness review,
- current-authority readback planning,
- internal source-aware test path design.

The protocol is not ready for:

- `setSourceStatus(..., ACTIVE)`,
- public source links,
- public source-aware buys,
- claim UI,
- source dashboard,
- public referral activation.

## Readiness Gates

| Gate | Current status | What must happen before ACTIVE |
| --- | --- | --- |
| Target source policy record | SATISFIED | Re-read `sourceExists(sourceId)` and `sourceConfig(sourceId)` immediately before any future status transaction. |
| No active source exists today | SATISFIED | If any ACTIVE source already exists before the controlled test, stop and reconcile source state before another activation action. |
| SourceRegistry owner and network | READBACK REQUIRED | Re-read chain ID `43114`, bytecode, `owner()`, and `pendingOwner()` immediately before signing. |
| Source terms and window | READBACK REQUIRED | Confirm the planned test can happen inside the approved window. If not, update terms with a new approved packet and metadata hash before activation. |
| Internal source-aware test path | SATISFIED AS BOUNDARY | `/labs/source-attribution-test` exists under a noindex internal route and hard-fails unless localhost development or explicit production-internal mode is enabled, `sourceTest=INTERNAL_PROTOCOL_TEST_SOURCE_001` is present, and production-internal mode uses an allowlisted fresh buyer wallet. It remains non-executable while the source is PAUSED or live SourceRegistry terms do not match the approved packet. |
| Buyer disclosure / clear-source UX | SATISFIED AS INTERNAL BOUNDARY | The internal harness previews sourceId, status, class, source wallet, payout wallet, commission bps, caps, $5 test amount, and Net USDC Routed/acquisition commission fields before any future wallet controls can appear. |
| Founder ACTIVE ceremony approval | FOUNDER APPROVAL REQUIRED | Founder must approve the exact transaction after fresh readbacks. |
| Legal/product copy | FOUNDER APPROVAL REQUIRED | Approve acquisition-first wording with no source ownership, no agency/employment implication, no MLM/downline framing, and no yield/passive-income/ROI framing. |
| Public/default ZERO_SOURCE_ID boundary | SATISFIED | Public/default production buys must continue to pass `ZERO_SOURCE_ID`. |
| Claim UI / source dashboard / public link | BLOCKED BY DESIGN | Keep these absent unless a separate future approval clears escrow, legal, UX, and read-model gates. |

## Time Window Rule

Current frozen terms use:

- `startTime = 1782907200`
- `endTime = 1784116800`

Before any future activation attempt:

1. Compare the intended controlled test time against the approved window.
2. If the window has not started and the test will occur inside it, no terms
   update is needed for timing.
3. If the window is open and the test can finish inside it, no timing update is
   needed.
4. If the window has expired or the controlled test cannot fit cleanly inside
   it, stop. Do not activate. Prepare an updated source packet, new metadata
   hash, `updateSourceTerms` readback, and then reconsider activation.

## Future Transaction Under Review Only

If all gates clear later, the activation transaction to review would be:

| Field | Value |
| --- | --- |
| Contract | `SourceRegistryV1` |
| Address | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| Network | Avalanche C-Chain, chain ID `43114` |
| Function | `setSourceStatus(bytes32 sourceId, SourceStatus status)` |
| sourceId | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| status | `ACTIVE` / enum value `1` |
| Expected signer | Current SourceRegistryV1 owner after fresh readback |

This table is for future review only. It is not an instruction to sign.

## Internal Source-Aware Test Path

The local boundary now exists at:

`/labs/source-attribution-test?sourceTest=INTERNAL_PROTOCOL_TEST_SOURCE_001`

Required constraints:

- local development or founder-approved production-internal mode only,
- explicit environment gate,
- `VITE_ENABLE_SOURCE_TEST_MODE=true`,
- `VITE_ENABLE_PRODUCTION_SOURCE_TEST_MODE=true` and `VITE_SOURCE_TEST_ALLOWED_BUYERS=<fresh buyer wallet>` when production-internal mode is used,
- loud internal-test banner,
- exact sourceId supplied intentionally,
- live SourceRegistry terms readback before wallet controls unlock,
- fresh buyer wallet,
- small controlled test amount,
- no production public source attribution,
- public/default production buys remain `ZERO_SOURCE_ID`,
- no public referral link,
- no source dashboard,
- no claim UI.

Current result: the route can render the internal boundary on localhost, but it
does not expose wallet controls while the frozen source remains `PAUSED`.

## Immediate Next Sprint

Run the `AVAX_RPC` readback commands in
`docs/SOURCE_ACTIVE_CEREMONY_PREFLIGHT.md` and decide whether the July 1-15,
2026 UTC test window still fits. If it does not fit, stop and update source
terms before any activation decision.

## Stop Conditions

Stop before any future activation if any of these are true:

- SourceRegistry owner is not the expected owner.
- Chain ID is not `43114`.
- SourceRegistry bytecode is missing or changed unexpectedly.
- `sourceExists(sourceId)` is false.
- `sourceConfig(sourceId).status` is not `PAUSED`.
- Terms differ from the approved packet.
- The planned test cannot occur inside the approved window.
- The internal source-aware path fails its localhost or production-internal flag/query/sourceId/allowlist gate.
- Public/default buy path does not use `ZERO_SOURCE_ID`.
- `/referral` shows a public source link, claim UI, or source dashboard.
- Any UI implies source ownership, public referral activation, passive income,
  yield, ROI, MLM/downline, governance, or financial leaderboard framing.

## Post-Activation Readback If Separately Approved Later

If a future founder-approved activation ceremony occurs, read back:

- transaction status,
- block number,
- `SourceStatusChanged` event,
- `sourceConfig(sourceId).status = ACTIVE`,
- `isActive(sourceId)`,
- SourceRegistry owner and pending owner,
- public/default buys still `ZERO_SOURCE_ID`,
- no claim UI,
- no public source-aware buy path unless separately approved.

Only after that may a controlled internal source-attributed buy test be
considered.
