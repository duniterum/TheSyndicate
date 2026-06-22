# Source Packet: Internal Test 001

Status: DRAFT ONLY / NOT APPROVED / NO TRANSACTION AUTHORIZED / SOURCE MUST START PAUSED

This packet is a working draft for the first possible internal source record.
It does not authorize a mainnet transaction, source activation, public
source-aware buy path, claim UI, registry switch, or public referral launch.

## Packet Identity

| Field | Draft Value |
| --- | --- |
| Packet ID | `SOURCE_PACKET_INTERNAL_TEST_001` |
| Source label | Internal Test Source 001 |
| Recommended source class | `BUILDER_SOURCE` |
| Candidate source wallet | TBD - founder-provided public wallet address |
| Candidate payout wallet | TBD - founder-provided public wallet address |
| Source ID derivation method | `keccak256("SOURCE_PACKET_INTERNAL_TEST_001:<approved-source-wallet>:<approved-date>")`, finalized only after founder approval |
| Source ID | TBD until packet approval |
| Commission bps | Draft recommendation: `500` bps |
| Attribution scope | `WINDOWED` |
| Start timestamp | TBD - no earlier than source creation approval time |
| End timestamp | TBD - draft recommendation: short internal window |
| Gross cap | TBD - draft recommendation: small internal cap |
| Per-buyer cap | TBD - draft recommendation: small internal per-buyer cap |
| Applies to repeat purchases | Draft recommendation: `false` for first source ceremony, unless founder approves repeat attribution explicitly |
| Metadata hash | TBD - hash of final approved source packet |
| Public display posture | Hidden / internal only |
| Legal copy posture | Needs founder/legal/product review |
| Risk classification | Medium until wallets, caps, and copy are approved |
| Initial status | `PAUSED` |

## Recommended First Source Class

Recommendation: use `BUILDER_SOURCE` for the first internal test packet.

Why:

- It is better suited to a controlled founder/operator-assigned source test.
- It does not depend on autonomous public member-introduction behavior.
- It keeps the first ceremony focused on source-policy readback, PAUSED status,
  and receipt mechanics rather than public referral UX.
- It avoids requiring the source wallet to hold SYN solely to satisfy
  `MEMBER_INTRODUCTION` semantics.

This recommendation is not final. Founder approval is still required.

## Source-Class Option Comparison

### A. `MEMBER_INTRODUCTION` Internal Test Source

Pros:

- Closest to the future seated-member introduction path.
- Exercises the `ReferrerNotSeated()` guard and public-source semantics.
- Useful later when public member referral UX is ready.

Cons:

- Requires the source wallet to be seated / hold SYN.
- Easier to confuse with public referral activation if used too early.
- Not ideal for the first controlled source-policy ceremony.

Use only if founder explicitly wants the first internal source to model a
seated-member introduction.

### B. `BUILDER_SOURCE` Internal Test Source

Pros:

- Best fit for a controlled internal/operator-assigned source test.
- Does not require autonomous public member seating semantics.
- Matches the fork rehearsal's successful source-attributed buy path.
- Keeps money terms clearly tied to explicit founder/operator policy.

Cons:

- Less representative of future public member referral.
- Requires careful copy so it is not mistaken for a public partner launch.
- Still requires an approved source packet, PAUSED-first source creation, and
  post-transaction readback.

Recommended for `SOURCE_PACKET_INTERNAL_TEST_001`.

## Non-Live Boundaries

- No public source link.
- No claim UI.
- No source-aware public buy path.
- No public referral activation.
- No source record until founder approval.
- No `setSourceStatus(..., ACTIVE)` in the source creation ceremony unless a
  separate activation approval exists.

## Expected SourceRegistry Readback

After a future approved `createSource` transaction:

- `sourceExists(sourceId) = true`
- `sourceConfig(sourceId).sourceWallet = <approved source wallet>`
- `sourceConfig(sourceId).payoutWallet = <approved payout wallet>`
- `sourceConfig(sourceId).sourceClass = BUILDER_SOURCE`
- `sourceConfig(sourceId).commissionBps = 500`
- `sourceConfig(sourceId).status = PAUSED`
- `sourceConfig(sourceId).scope = WINDOWED`
- `sourceConfig(sourceId).startTime = <approved start timestamp>`
- `sourceConfig(sourceId).endTime = <approved end timestamp>`
- `sourceConfig(sourceId).grossCap = <approved gross cap>`
- `sourceConfig(sourceId).perBuyerCap = <approved per-buyer cap>`
- `sourceConfig(sourceId).appliesToRepeatPurchases = <approved bool>`
- `sourceConfig(sourceId).metadataHash = <approved metadata hash>`

Expected event:

- `SourceCreated(sourceId, sourceWallet, BUILDER_SOURCE, 500, PAUSED, WINDOWED, payoutWallet, metadataHash)`

## Expected MembershipSaleV3 Behavior While PAUSED

- Public/default buys continue to use `ZERO_SOURCE_ID`.
- Explicit source-attributed buy using this source should fail closed while the
  source is `PAUSED`.
- No acquisition cost is paid for this source while it remains `PAUSED`.
- No source dashboard, claim action, or source-aware public link becomes live.

## Expected MembershipSaleV3 Behavior Only After Separate Activation

If a separate activation ceremony later sets this source to `ACTIVE`:

- Eligible source-attributed buys may include this `sourceId`.
- Receipt fields must disclose source and routing truth.
- Source payout may be pushed directly or escrowed if token transfer fails.
- Activity and My Syndicate may display source-attributed receipt facts only
  after verified event/readback support.

## Expected Receipt Fields

Any future source-attributed receipt must preserve:

- `receiptId`
- `buyer`
- `recipient`
- `memberNumber`
- `grossUsdc`
- `acquisitionCost`
- `protocolContribution`
- `vaultAmount`
- `liquidityAmount`
- `operationsAmount`
- `synOut`
- `synPerUsdc`
- `era`
- `chapter`
- `sourceId`
- `sourceClass`
- `sourceWallet`
- `commissionBps`
- `attributionScope`
- `attributionWindowEndsAt`
- `sourceGrossRemaining`
- `buyerGrossRemaining`
- `firstSeat`
- `receiptVersion`

## Expected Activity / My Syndicate Behavior

- Source-attributed V3 receipts remain `source: "v3"` after cache reload.
- Source fields are displayed as receipt facts, not public referral launch copy.
- No balance/claim language appears without escrow readback and claim policy.
- Source attribution never grants member ownership.

## Stop Conditions

Stop before any transaction if:

- source wallet is not final,
- payout wallet is not final,
- source ID is not derived from the approved packet,
- metadata hash is not final,
- cap/window/repeat settings are not approved,
- source class is not approved,
- legal/product copy is not approved,
- founder approval is missing,
- selected signer is wrong,
- target contract is not `SourceRegistryV1`,
- chain ID is not `43114`,
- ceremony attempts to activate the source in the same step,
- frontend changes are bundled into source creation.

## Founder Approval Checklist

- [ ] Source class approved.
- [ ] Source wallet approved.
- [ ] Payout wallet approved.
- [ ] Source ID derivation approved.
- [ ] Commission bps approved.
- [ ] Attribution window approved.
- [ ] Gross cap approved.
- [ ] Per-buyer cap approved.
- [ ] Repeat-purchase setting approved.
- [ ] Metadata hash approved.
- [ ] Public display posture approved.
- [ ] Legal/product copy approved.
- [ ] Risk classification approved.
- [ ] PAUSED-first ceremony approved.

## Post-Transaction Readback Checklist

- [ ] Transaction hash recorded.
- [ ] SourceRegistry target address verified.
- [ ] `SourceCreated` event matches packet.
- [ ] `sourceConfig(sourceId)` matches packet.
- [ ] Initial status is `PAUSED`.
- [ ] SourceRegistry owner remains expected owner.
- [ ] Mainnet source record count/status truth is updated in docs.
- [ ] `/referral` remains inactive.
- [ ] Public/default buy remains `ZERO_SOURCE_ID`.
- [ ] No claim UI is live.
- [ ] Separate activation decision scheduled if needed.
