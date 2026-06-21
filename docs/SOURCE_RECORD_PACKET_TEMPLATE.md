# Source Record Packet Template

Status: TEMPLATE ONLY / NON-TRANSACTIONAL / NO SOURCE CREATION AUTHORIZED

This packet is the required pre-approval artifact before any `SourceRegistryV1`
source record is created on Avalanche mainnet. It is not a transaction packet,
does not contain private keys, and does not authorize referral/source activation.

## Non-Negotiable Boundaries

- No source record is created without explicit founder approval.
- No source-linked public buy path is enabled by this packet.
- No claim UI is enabled by this packet.
- No source may be described as an investment return, recurring-income program,
  network-tree payout, or multi-level acquisition scheme.
- Public V3 buys remain `ZERO_SOURCE_ID` until a separate frontend activation gate.
- Source attribution is acquisition truth, not member ownership.

## Source Identity

| Field | Value |
| --- | --- |
| Packet ID | `SOURCE_PACKET_<YYYYMMDD>_<SHORT_NAME>` |
| Source ID | `0x...` |
| Source label | TBD |
| Source wallet | `0x...` |
| Payout wallet | `0x...` |
| Source class | `MEMBER_INTRODUCTION` / `BUILDER_SOURCE` / `AFFILIATE` / `BD_NETWORK` / `WHITELABEL` / `SPONSORSHIP` / `TREASURY_DEAL` |
| Commission bps | TBD |
| Attribution scope | `FIRST_PURCHASE` / `WINDOWED` / `CAPPED` / `LIFETIME` / `CUSTOM` |
| Start timestamp | TBD |
| End timestamp | TBD |
| Gross cap | TBD |
| Per-buyer cap | TBD |
| Applies to repeat purchases | `true` / `false` |
| Metadata hash | `0x...` |
| Public display posture | Hidden / read-only / named source / institutional source |
| Legal copy posture | Approved / needs review |
| Risk classification | Low / Medium / High |

## Required SourceRegistry Readback

Expected after `createSource` and before activation:

- `sourceExists(sourceId) = true`
- `sourceConfig(sourceId).sourceWallet = <source wallet>`
- `sourceConfig(sourceId).payoutWallet = <payout wallet>`
- `sourceConfig(sourceId).sourceClass = <source class>`
- `sourceConfig(sourceId).commissionBps = <bps>`
- `sourceConfig(sourceId).status = PAUSED`
- `sourceConfig(sourceId).scope = <scope>`
- `sourceConfig(sourceId).startTime = <start>`
- `sourceConfig(sourceId).endTime = <end>`
- `sourceConfig(sourceId).grossCap = <gross cap>`
- `sourceConfig(sourceId).perBuyerCap = <per-buyer cap>`
- `sourceConfig(sourceId).appliesToRepeatPurchases = <bool>`
- `sourceConfig(sourceId).metadataHash = <metadata hash>`

Expected event:

- `SourceCreated(sourceId, sourceWallet, sourceClass, commissionBps, PAUSED, scope, payoutWallet, metadataHash)`

## Expected MembershipSaleV3 Behavior

Before source activation:

- Public/default buy path remains `ZERO_SOURCE_ID`.
- Explicit use of this source while `PAUSED` must not be presented as live.
- Source-linked purchase tests must remain fork-only until activation approval.

After separate source activation approval:

- `buy(grossUsdc, recipient, sourceId, minSynOut, [])` may apply source terms if eligible.
- Receipt must disclose `grossUsdc`, `acquisitionCost`, `protocolContribution`, `vaultAmount`, `liquidityAmount`, `operationsAmount`, `synOut`, `sourceId`, `sourceClass`, `sourceWallet`, `commissionBps`, `attributionScope`, and remaining cap fields.
- `grossUsdc = acquisitionCost + vaultAmount + liquidityAmount + operationsAmount`.
- `protocolContribution = grossUsdc - acquisitionCost`.
- Source payout failure must escrow without blocking the purchase.

## Expected Frontend Behavior

- `/join` default path remains `ZERO_SOURCE_ID` unless a separate source-link activation is approved.
- `/referral` remains inactive until a source UI activation pass is approved.
- No claim button appears unless escrow-read and claim policy are approved.
- Activity and My Syndicate may display source-attributed receipt fields only as verified receipt truth.
- CommissionRouterV1 must not be described as the live V3 source engine.

## Expected Activity / My Syndicate Behavior

- Source-attributed V3 receipts preserve `source: "v3"` after cache reload.
- Source fields are displayed as receipt facts, not as referral activation claims.
- No source balance, network-tree payout, recurring-income, or claimable balance language appears.

## Stop Conditions

Stop before any transaction if:

- Source wallet or payout wallet is wrong.
- Source class or commission bps is not founder-approved.
- Commission bps exceeds the class cap.
- Metadata hash is missing when required.
- Scope/window/cap terms are unclear.
- Legal/product copy is not approved.
- Source packet has not been signed off.
- Contract owner/signer is not the approved owner hardware wallet.
- Chain ID is not Avalanche C-Chain `43114`.
- Frontend activation is being mixed with source creation.

## Founder Approval Checklist

- [ ] Source identity reviewed.
- [ ] Source wallet reviewed.
- [ ] Payout wallet reviewed.
- [ ] Commission bps reviewed.
- [ ] Attribution scope/window/caps reviewed.
- [ ] Public display posture reviewed.
- [ ] Legal/product copy reviewed.
- [ ] Risk classification reviewed.
- [ ] Fork rehearsal completed.
- [ ] Post-transaction readback plan ready.
- [ ] Founder explicitly approves source creation.

## Post-Transaction Readback Checklist

- [ ] Transaction hash recorded.
- [ ] Chain ID verified as `43114`.
- [ ] Target contract is `SourceRegistryV1`.
- [ ] `SourceCreated` event matches packet.
- [ ] `sourceConfig(sourceId)` matches packet.
- [ ] Initial status is `PAUSED`.
- [ ] No source-linked public UI is live.
- [ ] No claim UI is live.
- [ ] Docs/readback log updated.
- [ ] Separate activation ceremony scheduled if needed.
