# Source Packet Internal Test 001 - Founder Inputs

Status: READY FOR PAUSED SOURCE CEREMONY / NO TRANSACTION AUTHORIZED / SOURCE RECORD NOT CREATED

This document records the founder-approved values for the first possible
internal MembershipSaleV3 source record. It does not create a source record,
activate referral, create a public source link, create a claim UI, or authorize
any transaction.

Current boundary:

- SourceRegistryV1 is deployed and currently has zero source records.
- MembershipSaleV3 is the only current source-aware payment path.
- Public/default V3 buys continue to use `ZERO_SOURCE_ID`.
- Referral/source UI remains inactive.
- Claim UI remains inactive.
- Archive1155, SwapRail, product commerce, and future NFT/ERC721 systems are not
  source-aware.

Acceleration rule:

Move fast by removing ambiguity, not by skipping proof. This packet can prepare
one precise, founder-approved, `PAUSED` source-policy record. It cannot make
referral public-live, activate a source, generate a claim UI, or authorize a
source-attributed purchase.

## Internal Test Source vs Future Public Referrer

The first source must be understood as an internal protocol rehearsal source,
not a public referrer.

Internal protocol test source:

- tests source policy creation,
- starts `PAUSED`,
- proves readback,
- proves source lifecycle truth,
- prepares future receipt mechanics,
- remains hidden/internal,
- does not expose a public source link.

Future public referrer/member source:

- requires a separate member-referral design sprint,
- requires source onboarding UX,
- may require aliases, source links, dashboards, profiles, and reporting tools,
- requires public disclosure and legal/product copy,
- must not be inferred from this internal test source.

Anti-drift rule: do not use the first internal test source as a template for
public referrer UX without a separate member-referral design sprint.

Use this form only after reading:

- `docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_DRAFT.md`
- `docs/SOURCE_CREATION_CEREMONY_RUNBOOK.md`
- `docs/SOURCE_RECORD_PACKET_TEMPLATE.md`
- `docs/REFERRAL_INFRASTRUCTURE_PLATFORM_AUDIT.md`
- `docs/REFERRAL_SOURCE_ATTRIBUTION_STRATEGIC_RESEARCH.md`
- `docs/OPERATIONAL_MEMORY_LEDGER.md`

## 1. Frozen Final Values

Founder final values are frozen for review. They still do not authorize a
transaction.

| Field | Recommended default | Founder final value | Notes |
| --- | --- | --- | --- |
| Source label | `INTERNAL_PROTOCOL_TEST_SOURCE_001` | `INTERNAL_PROTOCOL_TEST_SOURCE_001` | Must not imply a public referrer, public referral link, agency, employment, official representation, or public partnership. |
| Source purpose | Internal controlled protocol rehearsal of source-policy creation, PAUSED status, readback, lifecycle truth, and future MembershipSaleV3 source-attributed receipt mechanics | Internal controlled protocol rehearsal of source-policy creation, PAUSED status, readback, lifecycle truth, and future MembershipSaleV3 source-attributed receipt mechanics | Purpose stays internal, readback-first, and MembershipSaleV3-only. |
| Source wallet | Founder-provided controlled protocol-test public wallet address | `0x244531C571966f90f4849e03a507543d90f9C721` | This is the source identity wallet recorded in SourceRegistryV1; it is not the future public referrer model. |
| Payout wallet | Same founder-provided controlled protocol-test wallet | `0x244531C571966f90f4849e03a507543d90f9C721` | Direct payout targets this wallet only after a future ACTIVE eligible purchase; it is not the future public referrer payout model. |
| Source class | `BUILDER_SOURCE` | `BUILDER_SOURCE` | Recommended first class because it avoids public seated-member referral semantics. |
| Commission bps | `500` bps | `500` bps | 500 bps = 5%. Conservative for the first internal PAUSED record. |
| Attribution scope | `WINDOWED` | `WINDOWED` | Bounded time window for the first internal record. |
| Start timestamp | Founder-supplied Unix timestamp | `1782907200` (`2026-07-01T12:00:00Z`) | Planned activation-test window start. |
| End timestamp | Founder-supplied Unix timestamp | `1784116800` (`2026-07-15T12:00:00Z`) | Fourteen days after start. |
| Gross cap | `25_000_000` USDC units | `25_000_000` | 25 USDC on 6-decimal USDC. |
| Per-buyer cap | `5_000_000` USDC units | `5_000_000` | 5 USDC on 6-decimal USDC. |
| Repeat purchases | `false` | `false` | First source record does not test repeat attribution. |
| SourceId derivation method | Hash the final approved packet identity and source terms | `keccak256(utf8("INTERNAL_PROTOCOL_TEST_SOURCE_001:0x244531C571966f90f4849e03a507543d90f9C721:2026-07-01T12:00:00Z"))` | Frozen for this packet. |
| Final sourceId | Generated after final inputs freeze | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` | Must match the final source packet and readback. |
| Metadata artifact | Frozen metadata JSON | `docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_FROZEN_METADATA.json` | Canonical artifact used for metadata hash. |
| Metadata hash | Generated after final packet text freeze | `0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d` | Hash describes the approved packet artifact, not a draft. |
| Public display posture | Hidden / internal only | Hidden / internal only | No public source link, no named public source display. |
| Privacy/tracking posture | Internal source-policy readback only | No public link, no cookies, no session tracking | No off-chain tracking expansion without separate approval. |
| Source dashboard status | Not live | Not live | No source dashboard before separate product/legal/read-model gate. |
| Claim UI status | Not live | Not live | No claim UI before escrow/status/legal gates. |
| Tax/accounting note | Not tax or accounting advice | Not tax or accounting advice | Future statements/exports require separate approval. |
| Direct payout / escrow fallback acknowledgment | Direct on-chain acquisition commission only after a future ACTIVE source-attributed purchase; escrow fallback only if direct payout fails | Acknowledged in packet boundaries | A PAUSED source does not accrue commission. |

## 2. Wallet Model

Do not confuse source wallets with protocol routing wallets.

Protocol routing wallets:

- Vault wallet: receives the Vault share of Net USDC Routed.
- Liquidity wallet: receives the Liquidity share of Net USDC Routed.
- Operations wallet: receives the Operations share of Net USDC Routed.

Source attribution wallets:

- Source wallet: the identity/source actor wallet recorded in SourceRegistryV1.
- Payout wallet: the wallet that receives acquisition commission after a future
  ACTIVE, eligible, source-attributed MembershipSaleV3 purchase.

Rules for this first internal test:

- The source wallet and payout wallet may be the same controlled wallet if the
  founder approves.
- The source wallet and payout wallet do not have to be the same in future.
- Do not use Vault, Liquidity, or Operations as the source wallet or payout wallet
  unless the founder explicitly approves that exceptional choice.
- Future public referrers will need their own source/payout wallet model.
- Future public referrers will need their own onboarding flow, source links,
  aliases, dashboards, profiles, and reporting/claim rules if those are ever
  approved.
- A source wallet does not own a member, seat, receipt, chapter, Archive item, or
  future SeatRecord.

## 3. Test Cap Clarification

The first internal test caps are deliberately small.

- The suggested 25 USDC gross cap (`25_000_000`) is only a first internal test
  recommendation.
- The suggested 5 USDC per-buyer cap (`5_000_000`) is only a first internal test
  recommendation.
- These values are not final public referral limits.
- These values are not the final public acquisition economy.
- The purpose is to test source-policy creation, readback, and later
  source-attributed receipt mechanics safely.
- Future public referral caps, source rates, source classes, and activation rules
  require a separate founder-approved design.

## 4. Timing / Window Strategy

`WINDOWED` source terms require both `startTime` and `endTime`.

Important timing truth:

- A `PAUSED` source can expire if its window is too short.
- Source creation and source activation are separate ceremonies.
- This first ceremony must create the source as `PAUSED` only.
- If activation testing happens later, the source terms may need a visible
  `updateSourceTerms` action before activation.

Recommended founder choice:

- If activation testing is expected soon, use a short future activation-testing
  window that will not expire before the separate activation test can occur.
- If activation timing is uncertain, create the PAUSED source first and plan to
  update terms before any later activation.

Do not invent final timestamps. The founder must supply or approve the final
Unix timestamps before sourceId and metadata hash generation.

## 5. Recommended Defaults

Use these unless the founder explicitly chooses otherwise:

- Source class: `BUILDER_SOURCE`
- Source label: `INTERNAL_PROTOCOL_TEST_SOURCE_001`
- Commission: `500` bps
- Attribution scope: `WINDOWED`
- Repeat purchases: `false`
- Public display: hidden/internal only
- Source dashboard: not live
- Claim UI: not live
- Privacy/tracking: no public link, no cookies, no session tracking
- Source wallet: founder-provided controlled protocol-test wallet
- Payout wallet: same founder-provided controlled protocol-test wallet unless
  founder chooses otherwise
- Gross cap: 25 to 100 USDC, suggested first value 25 USDC (`25_000_000`)
- Per-buyer cap: 5 to 10 USDC, suggested first value 5 USDC (`5_000_000`)
- Window: short internal test window, but long enough that it cannot expire before
  activation testing if activation is later approved
- Initial status: `PAUSED`
- Public/default buy path: remains `ZERO_SOURCE_ID`

## 6. Exact Founder Questions

Only these founder decisions are needed for the next gate:

A. Which controlled protocol-test public wallet should be the internal source wallet?

B. Should the payout wallet be the same wallet as the source wallet?

C. Confirm source class: `BUILDER_SOURCE`?

D. Confirm commission: `500` bps?

E. Confirm gross cap: 25 USDC (`25_000_000`)?

F. Confirm per-buyer cap: 5 USDC (`5_000_000`)?

G. Confirm repeat purchases: `false`?

H. Choose timing strategy:

- future activation-testing window, or
- create PAUSED now and update terms before activation

I. Confirm public display: hidden/internal only?

J. Confirm no public referral, no claim UI, no source dashboard, and no
product-wide attribution?

K. Confirm direct on-chain payout / escrow fallback doctrine?

L. Confirm readiness to generate sourceId and metadata hash after all final
values are filled?

## 7. Founder Acknowledgments

The founder must check every item before sourceId and metadata hash generation.

- [ ] No public referral activation is authorized.
- [ ] No source-aware public buy path is authorized.
- [ ] No public source link is authorized.
- [ ] No claim UI is authorized.
- [ ] No source dashboard is authorized.
- [ ] No Archive/NFT attribution is authorized.
- [ ] No SwapRail attribution is authorized.
- [ ] No product-wide attribution is authorized.
- [ ] This internal protocol test source is not a public referrer.
- [ ] This internal protocol test source is not a user referral link.
- [ ] This internal protocol test source is not the future member referral UX.
- [ ] No agency, employment, or official-representative status is created.
- [ ] No member ownership is created.
- [ ] No passive-income, guaranteed-income, MLM, or downline framing is allowed.
- [ ] Direct on-chain acquisition commission can happen only after a future ACTIVE source-attributed purchase.
- [ ] Escrow fallback exists only if direct payout fails.
- [ ] Source starts `PAUSED`.
- [ ] No activation occurs in the same ceremony.
- [ ] Public/default buys continue to use `ZERO_SOURCE_ID`.
- [ ] This source applies only to MembershipSaleV3 unless a future module passes a separate review.
- [ ] Vault, Liquidity, and Operations wallets are protocol routing wallets, not default source/payout wallets.
- [ ] 25 USDC gross cap and 5 USDC per-buyer cap are first-internal-test values only, not public referral economics.
- [ ] Do not use the first internal test source as a template for public referrer UX without a separate member-referral design sprint.

## 8. SourceId And Metadata Hash Gate

Do not regenerate `sourceId` or `metadataHash` unless a founder value changes.

Generation is allowed only after:

1. All required values above are final.
2. The founder acknowledgments are complete.
3. The final source packet text is frozen.
4. The intended creation ceremony still starts the source as `PAUSED`.
5. The no-activation boundary is still confirmed.

Decision after this gate:

- Ready for PAUSED source ceremony review

Current decision: ready for PAUSED source ceremony review.

Future deterministic generation instructions:

- Use only the final approved values.
- Compute `sourceId` from the approved packet identity, approved source wallet,
  and approved date/source label `INTERNAL_PROTOCOL_TEST_SOURCE_001` exactly as
  recorded in the final source packet.
- Compute `metadataHash` from the final frozen packet text or final approved
  metadata artifact.
- Do not recompute either value unless a frozen founder value changes.
- Do not broadcast, sign, deploy, activate, or call `createSource` during
  generation.
- Record both generated values for founder review before any ceremony.

No transaction is authorized by this document. The generated sourceId and
metadata hash are for founder review and future readback only.

## 9. Post-Readback Update Plan

Immediately after any future `SourceCreated` event, update truth surfaces before
any later activation discussion.

Required updates after readback:

- Source observability snapshot / docs: update the source record count and status
  truth, including the fact that the new record is `PAUSED`.
- `src/lib/source-policy-observability.ts`: update `CURRENT_SOURCE_POLICY_RECORDS`
  only after on-chain readback proves the record exists.
- Register wording: record the source policy as paused policy truth, not a public
  referral launch.
- Activity wording: record the source policy creation as a paused readback event,
  not commission accrual.
- `/referral` pending copy if needed: explain that a source policy record exists
  but referral/source attribution is not public-live.
- Source packet readback note: record `sourceConfig(sourceId)` and
  `SourceCreated` event values.
- No public activation copy: do not say referral is live, source links are live,
  commissions are accruing, or claims are available.

Validation after readback:

- Run relevant source observability and production coherence guards.
- Run `npm run check-release`.
- Commit readback docs/guards to GitHub before Replit pulls or production copy
  changes.

## 10. Stop Conditions

Stop before source creation if any of these are true:

- Source wallet or payout wallet is missing.
- The final sourceId or metadata hash is still draft.
- Commission bps, caps, timestamps, or repeat setting are not approved.
- The source would imply public referral activation.
- The source would imply agency, employment, official representation, member
  ownership, passive income, guaranteed income, MLM, or downline.
- The ceremony would activate the source in the same transaction window.
- The intended source applies to Archive1155, SwapRail, ProductSaleRouter,
  SeatRecord721, NFT/ERC721, or product commerce without separate review.
- The post-readback update plan is not accepted.

## 11. Decision Output

Current output:

Ready for PAUSED source ceremony review.

This state still does not authorize source creation. It only means the sourceId,
metadata hash, and future `createSource` arguments are frozen for founder review.
