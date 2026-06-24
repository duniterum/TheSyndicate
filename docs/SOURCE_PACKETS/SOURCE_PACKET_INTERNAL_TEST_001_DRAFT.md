# Source Packet: Internal Test 001

Status: READY FOR PAUSED SOURCE CEREMONY / NO TRANSACTION AUTHORIZED / SOURCE MUST START PAUSED

This packet freezes the founder-approved values for the first possible internal
source record. It does not authorize a mainnet transaction, source activation, public
source-aware buy path, claim UI, registry switch, or public referral launch.

## Scope Boundary

This packet applies only to MembershipSaleV3 source attribution.

It does not apply to Archive1155 NFT mints, future ERC-721 / SeatRecord
systems, SwapRail, premium product sales, marketplace flows, or product-wide
source attribution. SourceRegistryV1 can store source policy, but each payment
path must explicitly support source-aware receipts before it can use those
terms.

Future NFT, ERC-721, SwapRail, or product-commerce attribution must pass
`docs/MODULE_INTEGRATION_STANDARD.md` first. This packet does not authorize an
Archive wrapper, Archive1155 V2, ProductSaleRouter, SeatRecord721, or any
generic commerce router.

## Internal Protocol Test Source vs Future Public Referrer

This packet is for an internal protocol rehearsal source. It is not a public
referrer, not a user referral link, and not the future member referral UX.

The first source exists only to test:

- source policy creation,
- `PAUSED` status,
- readback,
- source lifecycle truth,
- future receipt mechanics.

Future public referrers need a separate onboarding model, public source-link
rules, aliases, dashboards, source profiles, reporting/claim rules, disclosure
copy, and member-referral UX. None of those are created by this packet.

Anti-drift rule: do not use the first internal test source as a template for
public referrer UX without a separate member-referral design sprint.

## Direct On-Chain Acquisition Commission Reality

Most referral SaaS systems operate as: track -> approve -> calculate -> pay
later. The Syndicate's V3 source path is different.

For a valid ACTIVE source, MembershipSaleV3 operates as:

```text
purchase occurs
-> contract computes acquisition commission
-> commission is pushed directly on-chain during the purchase transaction
-> receipt records gross USDC, acquisition commission, Net USDC Routed, and route amounts
-> escrow is used only as fallback if the direct payout transfer fails
```

Therefore this packet is not about delayed rewards, off-chain balances, or
manual payout promises. It is about on-chain acquisition attribution. The
source record defines policy; the purchase receipt proves whether policy was
used; escrow exists only as a failed-payout fallback; claim UI remains inactive.

Source attribution is acquisition attribution, not reward accounting.

## Packet Identity

| Field | Frozen Value |
| --- | --- |
| Packet ID | `SOURCE_PACKET_INTERNAL_TEST_001` |
| Source label | `INTERNAL_PROTOCOL_TEST_SOURCE_001` |
| Source purpose | Internal controlled protocol rehearsal of source-policy creation, PAUSED status, readback, lifecycle truth, and future MembershipSaleV3 source-attributed receipt mechanics |
| Source class | `BUILDER_SOURCE` |
| Source wallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| Payout wallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| Source ID derivation method | `keccak256(utf8("INTERNAL_PROTOCOL_TEST_SOURCE_001:0x244531C571966f90f4849e03a507543d90f9C721:2026-07-01T12:00:00Z"))` |
| Source ID | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| Commission bps | `500` bps |
| Attribution scope | `WINDOWED` |
| Start timestamp | `1782907200` (`2026-07-01T12:00:00Z`) |
| End timestamp | `1784116800` (`2026-07-15T12:00:00Z`) |
| Gross cap | `25_000_000` USDC units (25 USDC) |
| Per-buyer cap | `5_000_000` USDC units (5 USDC) |
| Applies to repeat purchases | `false` |
| Metadata artifact | `docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_FROZEN_METADATA.json` |
| Metadata hash | `0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d` |
| Public display posture | Hidden / internal only |
| Legal copy posture | Needs founder/legal/product review |
| Privacy/tracking posture | No public link, no cookie/session tracking, no campaign tracking for this packet |
| Source dashboard status | Not live |
| Claim UI status | Not live |
| Payout model | Direct on-chain acquisition commission during eligible ACTIVE purchases; escrow fallback only if payout transfer fails |
| Tax/accounting note | Reporting/export utility may be useful later; this packet gives no tax or accounting advice |
| Risk classification | Medium until the PAUSED ceremony is separately approved and read back |
| Initial status | `PAUSED` |

## Required Ethical / Trust Acknowledgments

The final approved packet should include explicit source acknowledgment of these
boundaries before any source record exists:

| Acknowledgment | Required posture |
| --- | --- |
| no-agency | The source is not an agent, employee, broker, advisor, or official representative unless a separate written agreement says otherwise. |
| no-employment | Source attribution does not create employment, payroll, benefits, or worker status. |
| no-official-representative | The source may not present itself as speaking for The Syndicate unless separately approved. |
| no-member-ownership | The source never owns, controls, or captures a member relationship. |
| no-passive-income | Acquisition commission is tied to a verified purchase receipt, not passive return. |
| no-guaranteed-income | No payout is guaranteed; source status, caps, windows, eligibility, and receipts control outcomes. |
| no-MLM/downline | There is no downline, network tree, multi-level payout, or recruitment chain. |
| no-yield/no-ROI | Source attribution is not yield, investment return, equity, governance, or revenue share. |
| disclosure-required | Any future public source promotion needs approved disclosure copy before use. |
| pause/revoke-aware | Source terms can be paused, revoked, or updated through visible policy action. |

## Recommended First Source Class

Recommendation: use `BUILDER_SOURCE` for the first internal test packet.

Why:

- It is better suited to a controlled founder/operator-assigned source test.
- It does not depend on autonomous public member-introduction behavior.
- It keeps the first ceremony focused on source-policy readback, PAUSED status,
  and receipt mechanics rather than public referral UX.
- It avoids requiring the source wallet to hold SYN solely to satisfy
  `MEMBER_INTRODUCTION` semantics.

This recommendation is now frozen for founder ceremony review. It still does
not authorize a transaction.

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

Recommended for `INTERNAL_PROTOCOL_TEST_SOURCE_001`.

## Readiness Status

Status after founder value freeze: READY FOR PAUSED SOURCE CEREMONY REVIEW /
NO SOURCE CREATION AUTHORIZED.

Founder-provided public addresses, timestamps, caps, sourceId, and metadataHash
are now frozen. This packet still does not authorize a transaction; a separate
PAUSED source ceremony approval remains required.

The packet remains constrained by `docs/PROTOCOL_ORGANISM_GRAPH.md`:

- MembershipSaleV3 only.
- SourceRegistryV1 policy only.
- Initial source status must be `PAUSED`.
- Public/default V3 buys continue to use `ZERO_SOURCE_ID`.
- No Archive1155, SwapRail, ProductSaleRouter, claim UI, or public source-link
  activation follows from this packet.
- This internal protocol test source must not be treated as the future public
  referrer/member-source onboarding model.
- Direct on-chain acquisition commission is possible only after a separate
  ACTIVE source decision and an eligible source-attributed purchase.
- Escrow is a fallback if direct payout fails; it is not a default delayed
  reward balance.

## Founder Input Readiness Matrix

Each input must be approved before a source creation ceremony. Safe defaults are
recommendations only; the founder can change them before approval.

### Final source wallet

- Why it matters: identifies the source policy actor and is emitted in
  `SourceCreated`.
- Safe default recommendation: founder-provided public wallet controlled for
  the internal test; do not use a compromised, exchange, vendor, or placeholder
  address.
- Risk if wrong: attribution points to the wrong actor; source can become
  legally or operationally ambiguous.
- SourceRegistry readback: `sourceConfig(sourceId).sourceWallet`.
- MembershipSaleV3 effect: used for self-referral checks and receipt
  `sourceWallet`.
- Activity: source policy action can be shown only as paused policy truth.
- My Syndicate: no member-facing action while paused; future receipts may show
  the source wallet as a receipt fact.
- Register: should record the source wallet only after on-chain readback.
- Chronicle: only a candidate if the first source policy is historically
  material.
- Archive/NFT: no effect; Archive1155 does not accept `sourceId`.
- Referral route: remains inactive while paused.
- Claim UI: no effect; claim UI remains hidden.
- Future modules: no automatic product-wide source rights.

### Final payout wallet

- Why it matters: receives acquisition commission if a future active source
  pays directly or receives escrow claims later.
- Safe default recommendation: founder-approved payout wallet separate from the
  buyer/recipient wallet and suitable for USDC receipt.
- Risk if wrong: funds could route to the wrong wallet after activation;
  recovery requires visible owner action.
- SourceRegistry readback: `sourceConfig(sourceId).payoutWallet`.
- MembershipSaleV3 effect: used for payout, escrow fallback, and self-referral
  checks.
- Activity: payout/escrow events are future receipt facts only after activation.
- My Syndicate: no claim/balance display while paused.
- Register: record after sourceConfig readback.
- Chronicle: not Chronicle-worthy unless institutionally material.
- Archive/NFT: no effect.
- Referral route: no displayed balance or claim while paused.
- Claim UI: blocked until escrow/status/legal gates pass.
- Future modules: no automatic payout for non-membership products.

### Final source label

- Why it matters: human label for docs, metadata, and future operator review.
- Safe default recommendation: `INTERNAL_PROTOCOL_TEST_SOURCE_001`.
- Risk if wrong: public copy may imply official representation, agency,
  employment, public referrer activation, user referral UX, or a public partner
  launch.
- SourceRegistry readback: not stored directly; label must live in the final
  packet metadata and `metadataHash`.
- MembershipSaleV3 effect: none directly; receipts store numeric/source fields,
  not the label.
- Activity: can use label only after matching metadata/readback.
- My Syndicate: hidden/internal while paused.
- Register: may reference the label as metadata context after readback.
- Chronicle: only material if founder admits the source policy as a milestone.
- Archive/NFT: no effect.
- Referral route: no public display while paused.
- Claim UI: no effect.
- Future modules: label does not grant product-wide attribution.

### Final source class approval

- Why it matters: controls class semantics and commission caps.
- Safe default recommendation: `BUILDER_SOURCE`.
- Risk if wrong: `MEMBER_INTRODUCTION` requires seated-referrer semantics;
  institutional classes can imply public representation if used loosely.
- SourceRegistry readback: `sourceConfig(sourceId).sourceClass`.
- MembershipSaleV3 effect: `MEMBER_INTRODUCTION` enforces seated-referrer
  status; class is emitted in V3 receipt fields.
- Activity: source policy class can be shown only as paused policy truth.
- My Syndicate: future receipt facts only; not identity.
- Register: source class belongs in source policy readback.
- Chronicle: source class alone is not history.
- Archive/NFT: no effect.
- Referral route: still pending/inactive while paused.
- Claim UI: no effect while paused.
- Future modules: class does not automatically apply outside MembershipSaleV3.

### Final sourceId derivation method

- Why it matters: sourceId is the permanent on-chain key for the source record.
- Safe default recommendation:
  `keccak256("INTERNAL_PROTOCOL_TEST_SOURCE_001:<approved-source-wallet>:<approved-date>")`
  unless founder approves a stricter metadata-hash-derived method.
- Risk if wrong: collisions, unreadable provenance, or mismatch between packet
  and on-chain record.
- SourceRegistry readback: `sourceExists(sourceId)` and
  `sourceConfig(sourceId)`.
- MembershipSaleV3 effect: source-aware buys use this exact bytes32 value.
- Activity: future source-attributed receipts carry this sourceId.
- My Syndicate: future receipt context depends on exact sourceId.
- Register: should store sourceId and derivation note.
- Chronicle: only if material.
- Archive/NFT: no effect.
- Referral route: no public source link while paused.
- Claim UI: future escrow lookup uses sourceId.
- Future modules: no automatic reuse without module approval.

### Final sourceId

- Why it matters: exact bytes32 value used in `createSource` and future
  `buy(..., sourceId, ...)`.
- Frozen value: `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620`.
- Risk if wrong: wrong or duplicate source record; future attribution can fail
  or point to the wrong policy.
- SourceRegistry readback: `sourceExists(sourceId) = true` after creation.
- MembershipSaleV3 effect: only active non-zero sourceId can produce acquisition
  commission.
- Activity: future receipts index by sourceId.
- My Syndicate: future source receipt facts index by sourceId.
- Register: primary durable source policy key.
- Chronicle: only material source milestones.
- Archive/NFT: no effect.
- Referral route: not exposed while paused.
- Claim UI: hidden; future escrow reads use sourceId.
- Future modules: no automatic scope.

### Final commission bps

- Why it matters: determines acquisition cost if the source later becomes active
  and eligible.
- Safe default recommendation: `500` bps for the first internal test.
- Risk if wrong: economics can be too generous, too weak, or legally confusing;
  too-high terms can violate caps.
- SourceRegistry readback: `sourceConfig(sourceId).commissionBps`.
- MembershipSaleV3 effect: computes `acquisitionCost` and net routed USDC after
  activation.
- Activity: future receipts can show acquisition cost only from events.
- My Syndicate: future receipt facts only; no balance while paused.
- Register: source terms readback.
- Chronicle: not history by itself.
- Archive/NFT: no effect.
- Referral route: no commission copy while paused.
- Claim UI: no claim while paused.
- Future modules: no product-wide commission.

### Final attribution scope

- Why it matters: controls whether the source is first-purchase, windowed,
  capped, lifetime, or custom.
- Safe default recommendation: `WINDOWED`.
- Risk if wrong: source can over-attribute, under-attribute, or create
  expectations beyond the first internal test.
- SourceRegistry readback: `sourceConfig(sourceId).scope`.
- MembershipSaleV3 effect: used in eligibility and receipt `attributionScope`.
- Activity: future source events can display scope only as receipt/policy fact.
- My Syndicate: future source context only after activation.
- Register: record scope after readback.
- Chronicle: only material if source policy itself is important.
- Archive/NFT: no effect.
- Referral route: remains inactive while paused.
- Claim UI: no effect while paused.
- Future modules: no automatic product scope.

### Start timestamp

- Why it matters: a future ACTIVE source is ineligible before `startTime`.
- Safe default recommendation: founder-approved Unix timestamp at or after
  source creation approval; if activation may be delayed, set a conservative
  later start or be prepared to update terms before activation.
- Risk if wrong: source may be eligible too early or may expire before intended
  test use.
- SourceRegistry readback: `sourceConfig(sourceId).startTime`.
- MembershipSaleV3 effect: SourceRegistry `attributionTerms` returns ineligible
  before start.
- Activity: source policy timeline only.
- My Syndicate: no direct member effect while paused.
- Register: include timestamp readback.
- Chronicle: only if material.
- Archive/NFT: no effect.
- Referral route: no source link while paused.
- Claim UI: no effect.
- Future modules: no automatic effect.

### End timestamp

- Why it matters: required for `WINDOWED` scope and closes eligibility after the
  window.
- Safe default recommendation: short internal window, 7 to 14 days after
  intended activation; use a timestamp far enough to avoid accidental expiry
  before activation.
- Risk if wrong: source may remain eligible too long or expire before testing.
- SourceRegistry readback: `sourceConfig(sourceId).endTime`.
- MembershipSaleV3 effect: source becomes ineligible after end time; receipt
  `attributionWindowEndsAt` uses this value.
- Activity: future receipt fact only.
- My Syndicate: future receipt context only.
- Register: include timestamp readback.
- Chronicle: not material by itself.
- Archive/NFT: no effect.
- Referral route: no public countdown while paused.
- Claim UI: no effect.
- Future modules: no automatic effect.

### Gross cap

- Why it matters: caps total attributed gross USDC for this source.
- Safe default recommendation: 25 to 100 USDC for the first internal test;
  recommended starting candidate: 25 USDC (`25_000_000` USDC units).
- Risk if wrong: source can over-attribute too much gross or fail during a
  planned small test.
- SourceRegistry readback: `sourceConfig(sourceId).grossCap`.
- MembershipSaleV3 effect: projected source gross above cap becomes ineligible.
- Activity: future receipt can show remaining source cap.
- My Syndicate: no public source dashboard while paused.
- Register: include cap readback.
- Chronicle: not material by itself.
- Archive/NFT: no effect.
- Referral route: no cap display while paused.
- Claim UI: no effect while paused.
- Future modules: cap applies only to this MembershipSaleV3 sourceId.

### Per-buyer cap

- Why it matters: caps attributed gross USDC per buyer for this source.
- Safe default recommendation: 5 to 10 USDC for the first internal test;
  recommended starting candidate: 5 USDC (`5_000_000` USDC units).
- Risk if wrong: one buyer can consume the whole source cap, or test purchase
  can fail unexpectedly.
- SourceRegistry readback: `sourceConfig(sourceId).perBuyerCap`.
- MembershipSaleV3 effect: projected buyer gross above cap becomes ineligible.
- Activity: future receipt can show remaining buyer cap.
- My Syndicate: future receipt facts only.
- Register: include cap readback.
- Chronicle: not material by itself.
- Archive/NFT: no effect.
- Referral route: no public cap display while paused.
- Claim UI: no effect.
- Future modules: no automatic effect.

### Applies to repeat purchases

- Why it matters: determines whether the source may apply after the recipient's
  first seat purchase.
- Safe default recommendation: `false` for the first internal test.
- Risk if wrong: repeat attribution can create broader economics than intended
  or fail to test a desired repeat path.
- SourceRegistry readback:
  `sourceConfig(sourceId).appliesToRepeatPurchases`.
- MembershipSaleV3 effect: repeat source purchases fail closed if false.
- Activity: future receipt facts only.
- My Syndicate: no recurring/source-loop copy while paused.
- Register: include readback.
- Chronicle: not material by itself.
- Archive/NFT: no effect.
- Referral route: no repeat-purchase promise while paused.
- Claim UI: no effect.
- Future modules: no automatic repeat attribution.

### Metadata hash

- Why it matters: binds the on-chain source record to the approved packet.
- Safe default recommendation: `keccak256` hash of the final approved packet
  text or canonical JSON packet; must be nonzero for `BUILDER_SOURCE`.
- Risk if wrong: on-chain policy cannot be tied cleanly to the approved
  off-chain record.
- SourceRegistry readback: `sourceConfig(sourceId).metadataHash`.
- MembershipSaleV3 effect: none directly; receipt emits source terms, not
  metadata.
- Activity: source policy event can reference metadata after readback.
- My Syndicate: no direct effect while paused.
- Register: should store metadata hash and packet reference.
- Chronicle: only material if admitted.
- Archive/NFT: no effect.
- Referral route: no public source profile while paused.
- Claim UI: no effect.
- Future modules: metadata does not grant broader scope.

### Public display posture

- Why it matters: controls whether this source appears publicly or remains
  internal.
- Safe default recommendation: Hidden / internal only.
- Risk if wrong: public users may infer source activation, representation, or
  available payout rights.
- SourceRegistry readback: not stored directly; belongs in metadata hash and
  docs.
- MembershipSaleV3 effect: none directly.
- Activity: internal/read-only policy wording only.
- My Syndicate: no public module while paused.
- Register: can record source policy without promoting it.
- Chronicle: only material.
- Archive/NFT: no effect.
- Referral route: remains inactive.
- Claim UI: hidden.
- Future modules: no public product scope.

### Legal/product copy posture

- Why it matters: prevents prohibited financial-return, member-ownership,
  official-agency, or chain-payout drift.
- Safe default recommendation: Needs founder/legal/product review before any
  public source copy.
- Risk if wrong: regulatory, trust, and brand harm.
- SourceRegistry readback: not stored except through metadata hash.
- MembershipSaleV3 effect: none directly.
- Activity: copy must say paused policy, not live commission.
- My Syndicate: no source earnings copy while paused.
- Register: factual readback only.
- Chronicle: no routine accounting-as-history.
- Archive/NFT: no source commission implication.
- Referral route: pending/inactive copy only.
- Claim UI: blocked.
- Future modules: each module needs its own copy approval.

### Risk classification

- Why it matters: frames operational/legal/security review before transaction.
- Frozen value: Medium until the PAUSED ceremony is separately approved and
  read back; Low only after readback and no public activation.
- Risk if wrong: founder may underestimate source/payout/legal risk.
- SourceRegistry readback: not stored directly.
- MembershipSaleV3 effect: none directly.
- Activity: no risk label unless an internal operator surface is later built.
- My Syndicate: hidden/internal while paused.
- Register: may note operational risk posture in source policy log.
- Chronicle: not history unless material.
- Archive/NFT: no effect.
- Referral route: no effect beyond pending posture.
- Claim UI: no effect; still blocked.
- Future modules: risk must be reassessed per module.

### Privacy/tracking posture

- Why it matters: the first packet must not import SaaS-style cookies,
  campaign tracking, source links, or lead capture before those systems have
  privacy and disclosure approval.
- Safe default recommendation: no public source link, no cookies, no session
  attribution, no campaign tracking, and no source-aware public path. The first
  packet is on-chain policy/readback only.
- Risk if wrong: users may be tracked or attributed without a clear policy;
  source disputes can arise before the program is public.
- SourceRegistry readback: not stored directly; belongs in the packet metadata
  and future source-link policy.
- MembershipSaleV3 effect: none while paused; future active use still requires
  an explicit non-zero sourceId.
- Activity: no click/session analytics as protocol truth.
- My Syndicate: no source-link attribution shown while paused.
- Register: may record privacy posture as packet metadata context.
- Chronicle: not history by itself.
- Archive/NFT: no effect.
- Referral route: no public source link.
- Claim UI: no effect.
- Future modules: any source-link/cookie/session layer must pass separate
  privacy and disclosure review.

### Payout model

- Why it matters: The Syndicate is not a delayed reward platform by default.
  MembershipSaleV3 attempts direct on-chain payout during an eligible ACTIVE
  source-attributed purchase.
- Safe default recommendation: packet copy must say direct on-chain acquisition
  commission when active, with escrow fallback only if the direct payout fails.
- Risk if wrong: source UX may imply hidden balances, off-chain IOUs, platform
  debt, or a reward dashboard.
- SourceRegistry readback: payout wallet and source status determine where a
  future direct payout or status-gated escrow claim can route.
- MembershipSaleV3 effect: `_payAcquisition` pushes USDC to payout wallet; if
  transfer fails, `sourceEscrowOwed(sourceId)` increases and
  `SourcePayoutEscrowed` emits.
- Activity: future receipt facts can show direct payout or escrow fallback from
  events.
- My Syndicate: no balance or claim copy while paused.
- Register: record payout model as source policy context after readback.
- Chronicle: only if source policy becomes institutionally material.
- Archive/NFT: no effect.
- Referral route: no claim UI while paused.
- Claim UI: blocked until escrow readback, source status, legal copy, and UX
  failure states are approved.
- Future modules: each payment path needs its own payout/escrow design.

### Tax/accounting responsibility note

- Why it matters: future source payouts may require records for source wallets,
  but this packet is not tax or accounting advice.
- Safe default recommendation: include a plain note that sources are responsible
  for their own tax/accounting obligations and that The Syndicate may later
  provide reporting exports as convenience tooling only.
- Risk if wrong: public copy can look like accounting advice, guaranteed payout,
  or an official earnings statement before records exist.
- SourceRegistry readback: none directly.
- MembershipSaleV3 effect: future purchase events can provide transaction
  hashes and amounts for reporting exports.
- Activity: events may supply source receipt data.
- My Syndicate: future reporting export only after active source receipts exist.
- Register: no routine tax records.
- Chronicle: not routine accounting history.
- Archive/NFT: no effect.
- Referral route: no reporting/export UI while inactive.
- Claim UI: no effect while inactive.
- Future modules: reporting export must be clearly labeled as not tax or
  accounting advice.

### PAUSED-first ceremony approval

- Why it matters: `createSource` writes mainnet policy state and must not
  activate money routing in the same step.
- Safe default recommendation: approve only PAUSED-first creation; no
  `setSourceStatus(ACTIVE)` in the same ceremony.
- Risk if wrong: source attribution could become usable before readback, copy,
  and UI guardrails are ready.
- SourceRegistry readback: `sourceConfig(sourceId).status = PAUSED` and
  `SourceCreated(..., PAUSED, ...)`.
- MembershipSaleV3 effect: source remains ineligible while paused.
- Activity: source policy created but not active.
- My Syndicate: no source action while paused.
- Register: record the paused policy truth after readback.
- Chronicle: candidate only if historically material.
- Archive/NFT: no effect.
- Referral route: remains inactive.
- Claim UI: remains hidden.
- Future modules: no activation.

## Frozen Internal Test Values For Founder Review

These values are frozen for founder review. They must not be pasted into a
transaction until the founder separately approves the PAUSED source ceremony.

| Field | Frozen value | Reason |
| --- | --- | --- |
| Source label | `INTERNAL_PROTOCOL_TEST_SOURCE_001` | Makes the first source unmistakably an internal protocol rehearsal, not a public referrer. |
| Source class | `BUILDER_SOURCE` | Best controlled internal test; avoids public seated-member referral semantics. |
| Source wallet | `0x244531C571966f90f4849e03a507543d90f9C721` | Dedicated source-test wallet; not a public referrer wallet. |
| Payout wallet | `0x244531C571966f90f4849e03a507543d90f9C721` | Same dedicated wallet for the first internal rehearsal. |
| Commission bps | `500` bps | Small, understandable, low-risk acquisition cost for first ceremony. |
| Scope | `WINDOWED` | Bounded in time and aligned with the contract's window guard. |
| Start timestamp | `1782907200` (`2026-07-01T12:00:00Z`) | Planned activation-test window start. |
| End timestamp | `1784116800` (`2026-07-15T12:00:00Z`) | Fourteen-day planned activation-test window. |
| Gross cap | 25 USDC (`25_000_000`) | Prevents broad attribution from a first internal source. |
| Per-buyer cap | 5 USDC (`5_000_000`) | Fits one minimum purchase and limits one buyer. |
| Repeat purchases | `false` | Keeps the first internal test first-purchase only. |
| Public display | Hidden / internal only | Avoids public referral activation implication. |
| Initial status | `PAUSED` | Required ceremony boundary. |

Tradeoff: `WINDOWED` terms can expire while the source remains paused. If the
founder wants a long gap between PAUSED creation and activation, either use a
future end timestamp with a short post-activation test window, or perform a
visible `updateSourceTerms` action before activation.

## Frozen SourceId / MetadataHash

The deterministic sourceId is:

```text
0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620
```

The sourceId preimage is:

```text
INTERNAL_PROTOCOL_TEST_SOURCE_001:0x244531C571966f90f4849e03a507543d90f9C721:2026-07-01T12:00:00Z
```

The sourceId derivation is:

```text
keccak256(utf8(sourceId preimage))
```

The metadata artifact is:

```text
docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_FROZEN_METADATA.json
```

The metadata hash is:

```text
0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d
```

The metadata hash is `keccak256` over the UTF-8 canonical JSON form of the
metadata artifact with lexicographically sorted object keys. The artifact does
not contain a `metadataHash` field, avoiding self-reference.

## Future createSource Argument Table

Founder review only. This table does not authorize a transaction.

| Argument | Value |
| --- | --- |
| `sourceId` | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| `terms.sourceWallet` | `0x244531C571966f90f4849e03a507543d90f9C721` |
| `terms.sourceClass` | `BUILDER_SOURCE` (`1`) |
| `terms.commissionBps` | `500` |
| `terms.scope` | `WINDOWED` (`1`) |
| `terms.startTime` | `1782907200` |
| `terms.endTime` | `1784116800` |
| `terms.grossCap` | `25000000` |
| `terms.perBuyerCap` | `5000000` |
| `terms.appliesToRepeatPurchases` | `false` |
| `terms.payoutWallet` | `0x244531C571966f90f4849e03a507543d90f9C721` |
| `terms.metadataHash` | `0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d` |

## Pre-Ceremony Readback Checklist

Before any future source-creation transaction, verify:

- SourceRegistryV1 owner is still the approved owner wallet.
- Avalanche C-Chain ID is `43114`.
- `sourceExists(0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620) = false`.
- SourceRegistryV1 still has zero source records / no `SourceCreated` logs unless a later readback says otherwise.
- V3 public/default buys still use `ZERO_SOURCE_ID`.
- `/referral` still says referral/source attribution is inactive.
- Claim UI remains absent.
- No public source link, source dashboard, or source-aware buy path exists.

## Future Source Commission Statement / Reporting Export

This packet does not build reporting tooling. It does, however, identify a
future utility that deserves deferred-work tracking once source-attributed
receipts exist.

Possible future module:

```text
Source Commission Statement / Reporting Export
```

Potential fields:

- source wallet,
- payout wallet,
- sourceId,
- source class,
- attributed purchase transaction hashes,
- gross USDC,
- acquisition commission,
- Net USDC Routed,
- direct payout events,
- escrow fallback events,
- claim events if a future claim UI is approved,
- yearly CSV export,
- PDF statement.

Boundaries:

- not tax advice,
- not accounting advice,
- not proof of passive income,
- not a claim UI,
- not an owed-balance dashboard,
- not available until active source-attributed receipts exist.

## Future Readback Command Plan

No command in this section should be run as a transaction. These are readback
checks for after a separately approved future `createSource` transaction.

Target contract:

```text
SourceRegistryV1 = 0x780013bB358be6be95b401901264FC7c22a595a6
Chain ID = 43114
```

Expected read functions:

```text
owner()
pendingOwner()
sourceExists(sourceId)
sourceConfig(sourceId)
isActive(sourceId)
```

Expected event:

```text
SourceCreated(sourceId, sourceWallet, BUILDER_SOURCE, 500, PAUSED, WINDOWED, payoutWallet, metadataHash)
```

Expected PAUSED readback:

```text
sourceExists(sourceId) = true
sourceConfig(sourceId).sourceWallet = 0x244531C571966f90f4849e03a507543d90f9C721
sourceConfig(sourceId).payoutWallet = 0x244531C571966f90f4849e03a507543d90f9C721
sourceConfig(sourceId).sourceClass = BUILDER_SOURCE
sourceConfig(sourceId).commissionBps = 500
sourceConfig(sourceId).status = PAUSED
sourceConfig(sourceId).scope = WINDOWED
sourceConfig(sourceId).startTime = 1782907200
sourceConfig(sourceId).endTime = 1784116800
sourceConfig(sourceId).grossCap = 25000000
sourceConfig(sourceId).perBuyerCap = 5000000
sourceConfig(sourceId).appliesToRepeatPurchases = false
sourceConfig(sourceId).metadataHash = 0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d
isActive(sourceId) = false
```

Expected non-effects:

- `/referral` remains inactive.
- Public/default buy remains `ZERO_SOURCE_ID`.
- No claim UI.
- No source-aware public buy path.
- No Archive/NFT attribution.
- No SwapRail attribution.
- No product attribution.
- No source commission accrues while status is `PAUSED`.

## Future PAUSED Source Wording

Use only after a source record exists on-chain and readback confirms it is
`PAUSED`.

Register wording:

> Source policy record `INTERNAL_PROTOCOL_TEST_SOURCE_001` was created on
> SourceRegistryV1 and remains PAUSED. No public source-linked purchase path is
> active.

Activity heartbeat wording:

> Source policy prepared: internal test source created in PAUSED status. No
> commission is accruing and public buys remain ZERO_SOURCE_ID.

My Syndicate internal wording:

> Source attribution is under internal review. No source-linked action or claim
> is available from this member home.

Chronicle candidate wording:

> The first internal source policy was created as a paused governance/readback
> milestone. Admit to Chronicle only if founder confirms it materially changed
> the institution's acquisition infrastructure.

`/referral` wording while paused:

> A source policy record exists but is paused. Referral/source attribution is
> not live; no public source link, claim action, or commission accrual is active.

Forbidden wording while paused:

- "Referral is live."
- "Commission is accruing."
- "Claim your commission."
- "Public source link is active."
- "Archive/NFT attribution is live."
- "Product-wide attribution is live."
- Any official-representative, agency, employment, member-ownership, or banned
  source-attribution finance/chain-payout wording listed in
  `docs/LEGAL_DISCLOSURE_REFERRAL.md`.

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
- `sourceConfig(sourceId).sourceWallet = 0x244531C571966f90f4849e03a507543d90f9C721`
- `sourceConfig(sourceId).payoutWallet = 0x244531C571966f90f4849e03a507543d90f9C721`
- `sourceConfig(sourceId).sourceClass = BUILDER_SOURCE`
- `sourceConfig(sourceId).commissionBps = 500`
- `sourceConfig(sourceId).status = PAUSED`
- `sourceConfig(sourceId).scope = WINDOWED`
- `sourceConfig(sourceId).startTime = 1782907200`
- `sourceConfig(sourceId).endTime = 1784116800`
- `sourceConfig(sourceId).grossCap = 25000000`
- `sourceConfig(sourceId).perBuyerCap = 5000000`
- `sourceConfig(sourceId).appliesToRepeatPurchases = false`
- `sourceConfig(sourceId).metadataHash = 0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d`

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
- direct on-chain payout and escrow fallback wording has not been acknowledged.
- source tax/accounting and privacy/tracking posture is not approved.

## Founder Approval Checklist

- [ ] Source class approved.
- [ ] Source purpose approved.
- [ ] Source label approved.
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
- [ ] Privacy/tracking posture approved.
- [ ] Direct payout / escrow fallback model acknowledged.
- [ ] Source dashboard status approved as not live.
- [ ] Claim UI status approved as not live.
- [ ] no-agency / no-employment / no-official-representative acknowledgments approved.
- [ ] no-member-ownership / no-passive-income / no-guaranteed-income / no-MLM/downline acknowledgments approved.
- [ ] Tax/accounting responsibility note approved.
- [ ] Legal/product copy approved.
- [ ] Risk classification approved.
- [ ] PAUSED-first ceremony approved.

## Founder Decision Readiness

### Mandatory before the first PAUSED source record can exist

- Final source label.
- Final source purpose.
- Final source class.
- Final source wallet.
- Final payout wallet.
- Final commission bps.
- Final attribution scope.
- Final start timestamp.
- Final end timestamp, if `WINDOWED`.
- Final gross cap.
- Final per-buyer cap.
- Final repeat-purchase setting.
- Final sourceId derivation method.
- Final sourceId.
- Final metadata hash.
- Explicit PAUSED-first creation approval.
- Direct on-chain payout / escrow fallback acknowledgment.
- Source visibility: hidden/internal unless founder approves otherwise.
- Privacy/tracking posture: no public link, no cookies, no session tracking for
  this packet unless separately approved.
- Ethical/trust acknowledgments listed above.
- Founder/legal/product copy approval.

### Recommended before the first PAUSED source record

- Keep `BUILDER_SOURCE`.
- Keep `500` bps.
- Keep `WINDOWED`.
- Use a short internal test window.
- Use a small gross cap.
- Use a small per-buyer cap.
- Keep repeat purchases disabled.
- Keep source dashboard and claim UI explicitly not live.
- Prepare a readback note for Register/Activity after the transaction.

### Optional before the first PAUSED source record

- Prepare a future reporting/export design note for source statements.
- Prepare internal-only source dashboard mock copy.
- Prepare a post-readback Chronicle candidate only if founder deems the first
  source policy historically material.

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
