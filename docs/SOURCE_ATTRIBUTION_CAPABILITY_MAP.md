# Source Attribution Capability Map

Status: DECISION MAP / ONE VALIDATED INTERNAL SOURCE TEST / SOURCE PAUSED / NO PUBLIC ACTIVATION AUTHORIZED

This document maps what the deployed SourceRegistryV1 and MembershipSaleV3
source-attribution system can do across The Syndicate product organism after
the first internal source record was created, used for one controlled $5
source-attributed MembershipSaleV3 purchase, and returned to PAUSED.

It does not authorize another mainnet transaction, source record, source link,
commission claim surface, registry switch, production publish, funding action,
V2b recovery, SwapRail implementation, SeatRecord721 implementation, or any
change to deployed smart contracts.

## Current Boundary

Repository and chain truth at this map:

| Surface | Current truth |
| --- | --- |
| SourceRegistryV1 | Deployed at `0x780013bB358be6be95b401901264FC7c22a595a6`; owner accepted; one internal source record exists and is PAUSED after a completed controlled test. |
| MembershipSaleV3 | Deployed at `0x2A6cFc76906e758B934209AFf5A163c9bC20132E`; funded; active frontend buy target for direct SYN membership purchases. |
| Public/default buy path | Uses `ZERO_SOURCE_ID`; no source-linked public buy path is active. |
| Source attribution rehearsal | Deployed-address fork passed, and a real mainnet controlled $5 source-attributed MembershipSaleV3 buy succeeded. |
| Referral/source UI | Pending and inactive. |
| Claim UI | Inactive. |
| Archive1155 | Live protocol-memory mint contract; it does not accept a `sourceId`. |
| Future products | Not automatically source-aware. Each payment path must either read SourceRegistryV1 or use a future source-aware router/wrapper. |

## Core Finding

SourceRegistryV1 is reusable policy infrastructure, not a universal payment
router.

MembershipSaleV3 is source-aware. Archive1155 and future products are not
source-aware merely because SourceRegistryV1 exists.

Archive1155 does not accept a `sourceId`. Future NFT or product commission requires a source-aware sale wrapper/router or new product contract.

The current deployed system has proven a first controlled source-attributed
MembershipSaleV3 path. It cannot automatically attribute every product sold on
the site, route Archive1155 commissions, or pay source commissions for external
swap/product flows without additional sale-path design.

## Capability Matrix

| Product / sale surface | Current contract handling payment? | Can current SourceRegistryV1 attribute it? | Can current receipt track acquisition cost? | Can Activity / My Syndicate show it? | Can commission be paid automatically? | Needs frontend only? | Needs read-model only? | Needs new contract later? | Risk level |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V3 SYN membership sale | Yes: MembershipSaleV3 | Proven for one controlled internal buy when a non-zero sourceId was supplied and source record was ACTIVE | Yes: MembershipPurchasedV3 event includes acquisition cost, net routed amount, source class, source wallet, commission bps, caps, and receipt version | Yes, event parser and cache preserve V3 source fields; UI still needs careful product copy before public source activation | Proven by direct payout; escrow fallback remains untested | Yes, for source-aware link/preview UX later | Yes, for clearer receipt/member views | No for first controlled V3 membership source path | Medium |
| Archive1155 NFT mints | Yes: Archive1155 | No. Archive1155 does not read SourceRegistryV1 and does not accept sourceId | No. Mint events do not include acquisition cost/source fields | Only as normal artifact mint events; no source attribution truth exists on-chain today | No | No, not for real commission | Possible analytics-only attribution if clearly labeled as non-payment/off-chain memory | Yes, for true on-chain NFT source commission: source-aware Archive wrapper/router or Archive sale V2 | High if presented as live source commission |
| Future SeatRecord721-related sale | No live sale contract | No current source-aware sale path | No | No | No | No | Planning only | Likely yes if any paid identity-record surface exists later | High |
| Future premium/pass sale | No generic paid-product contract | SourceRegistryV1 can be reused as policy if a sale contract reads it | Not today | Not today | Not today | No, except static preview/docs | Possible non-payment analytics only | Likely yes: ProductSaleRouterV1 or product-specific sale contract | Medium-high |
| Future marketplace item sale | No marketplace contract | Not today | Not today | Not today | Not today | No | Possible analytics only | Yes, marketplace/router must be source-aware by design | High |
| Future sponsorship / affiliate campaign | SourceRegistryV1 can represent policy identity; MembershipSaleV3 can attribute SYN buys only | Yes for membership buys if source record is active and sourceId supplied | Yes for membership receipts only | Yes for membership events only | Yes for membership events only | Later, for campaign landing/preview | Later, for reporting | Not for membership; yes for non-membership products | Medium |
| Future SwapRail / 0x / Jumper route | External route; not a Syndicate sale contract | No current source payment integration | No current Syndicate receipt schema | Only if a future read model records non-payment attribution separately | No | No | Possible click/source analytics, not commission truth | Possibly, but external swap attribution has high complexity and should stay out of scope now | High |
| Off-chain or manual product sale | No on-chain sale contract | SourceRegistryV1 can be a reference only | No on-chain receipt unless separately recorded | Only if Register/Chronicle records a verified milestone | No on-chain automatic commission | Docs/process only | Yes, if clearly marked off-chain/company-level | Only if the sale must become on-chain | Medium |
| B2B / whitelabel source deal | MembershipSaleV3 can use a source record for SYN buys | Yes for membership buys; source class can be WHITELABEL, BD_NETWORK, SPONSORSHIP, or TREASURY_DEAL | Yes for membership buys | Yes for membership events | Yes for membership buys | Later | Later | Per-product terms may need SourceRegistryV2 or product router | Medium |

## A. SYN Membership Sale

What works now:

- `SourceRegistryV1` stores source policy: source wallet, source class,
  commission bps, status, scope, time window, gross caps, per-buyer caps,
  payout wallet, metadata hash, and visible owner actions.
- `MembershipSaleV3.buy(grossUsdc, recipient, sourceId, minSynOut, v1Proof)`
  accepts a sourceId.
- Public/default frontend buys pass `ZERO_SOURCE_ID`.
- If a valid active sourceId is supplied, MembershipSaleV3 asks
  SourceRegistryV1 for attribution terms.
- The sale computes `acquisitionCost`, then routes the remaining net USDC as:
  70 percent Vault, 20 percent Liquidity, 10 percent Operations.
- The source payout is pushed directly when possible.
- If source payout fails, the source amount is escrowed instead of blocking the
  membership buy.
- `claimSourceEscrow(sourceId)` exists in the contract, but no claim UI is live.
- `MembershipPurchasedV3` emits a rich receipt that can reconstruct the
  transaction.
- Activity reads V3 events and preserves source fields.
- The purchase cache preserves `source: "v3"` and V3 source metadata after
  reload.

What remains inactive:

- No ACTIVE source record exists on mainnet after the completed test; the source was re-paused.
- No public source link exists.
- No source-aware public buy path exists.
- No claim UI exists.
- No source dashboard exists.
- No source record should be created without source packet approval and the
  ceremony runbook.

## B. Archive1155 NFT Mints

Archive1155 is live protocol memory, but it is not source-aware today.

Current Archive mint truth:

- `MintFirstSignal` approves the Archive1155 contract and calls `mint(1, 1)`.
- `MintPatronSeal` approves the Archive1155 contract and calls `mint(3, 1)`.
- The Archive ABI exposes `mint(uint256 id, uint64 quantity)`.
- The Archive mint path does not pass sourceId.
- Archive mint events are ERC-1155 `TransferSingle` mints from the zero address.
- The mint event read model captures token id, quantity, wallet, transaction
  hash, block number, and log index.
- It does not capture sourceId, acquisition cost, commission bps, source class,
  source wallet, or net routed amount.

Safe V1 NFT attribution path:

- Internal/read-model analytics may remember that a wallet arrived through a
  source link, but that must not be presented as on-chain commission truth.
- Archive mint surfaces should stay product-memory first: First Signal, Patron
  Seal, and future Archive IDs are memories, not a speculative source engine.
- True on-chain NFT source commission requires a future source-aware sale path.

Options for true NFT source commission later:

1. Archive1155 V2 with source-aware mint.
2. A source-aware Archive sale wrapper/router that accepts USDC, reads
   SourceRegistryV1, pays commission or escrow, calls/mints/transfers the
   artifact, and emits a product-specific receipt.
3. A generic ProductSaleRouterV1 that can sell approved products and emit
   productType/productId receipt fields.

Recommendation: do not modify Archive1155 for source attribution now. If Archive
source attribution becomes necessary, prefer a wrapper/router or purpose-built
Archive sale V2 after the membership source path has proven stable.

## C. Any Product Sold On The Site

Current SourceRegistryV1 can act as a shared source identity and policy
registry, but each sale path must explicitly read it.

Long-term clean architecture:

- SourceRegistryV1 or a future SourceRegistryV2 stores source policy.
- Each product sale path either reads the registry directly or delegates to a
  common source-aware product router.
- Each receipt event includes:
  - product type,
  - product id,
  - buyer,
  - recipient,
  - gross USDC,
  - acquisition cost,
  - net routed amount,
  - destination amounts,
  - source id,
  - source class,
  - source wallet,
  - commission bps,
  - attribution scope,
  - receipt version.
- Activity distinguishes membership purchases, Archive mints, product sales,
  source policy actions, source payouts, and institutional milestones.
- My Syndicate shows source attribution as contribution context, not identity,
  rank entitlement, or company representation.

Current limitation:

If a future product has a different commission rate, cap, scope, or payout rule
than membership sales, current SourceRegistryV1 can support it only by using a
separate sourceId and metadata policy, or by adding a later per-product terms
layer. It does not store product-specific terms natively.

## Connection To The Product Organism

| Layer | What can be shown now | After PAUSED source record | After ACTIVE source record | Must never be shown |
| --- | --- | --- | --- | --- |
| Activity heartbeat | SourceRegistry and V3 are deployed; source records inactive | Source policy action occurred; source remains paused | Source-attributed membership purchases, acquisition cost, payout/escrow state from events | Fake source earnings, fake member ownership, fake public activation |
| My Syndicate | Direct V3 membership and seat status | Source readiness notice for approved internal test only if hidden/internal | Introductions, receipts, source-linked purchases, escrow status if legally approved | Source as identity, source as seat, source as representative authority |
| Chronicle | Major deployment/fork/readiness milestones | Creation of a historically meaningful source policy may become a candidate | Major acquisition milestones can be candidates when materially meaningful | Routine source accounting as history |
| Institutional Register | Contract addresses, source record count, status truth | SourceCreated readback, metadata hash, status PAUSED | Source status and source-policy changes | Private off-chain promises as register truth |
| Builder Records | Not live | A source packet can inform future builder recognition | Source performance may be one input to trust capital | Money terms as automatic reputation |
| Archive | No source-attribution claim | None, unless a source action becomes a major institutional memory | Major source milestone could become Archive memory later | Archive NFT commission claims without source-aware mint/router |
| Treasury/accounting | V3 direct buys route zero-source purchases | No payment flow while paused | Membership receipts prove gross, acquisition cost, net USDC routed, Vault, Liquidity, Operations | Hidden manual payouts presented as protocol-routed |
| Source packet/runbook | Template and ceremony only | Packet can be filled and source created paused | Activation requires separate approval | Unreviewed source terms |
| Legal/disclosure | Pending/non-live language | Paused source policy only | Source commission copy only after legal/product signoff | Investment-return, employment, agency, or representation implication |
| Member behavior loops | Direct seat purchase and return home | Internal operator confidence | Referral/source return loops after activation | Casino-style gamification or public ranking by money |
| SEO/content | Explain source attribution as pending infrastructure | No public promotion | Carefully explain verified introductions only after live | Public claims before live source activation |
| Analytics/dashboard | Track direct V3 events | Track source policy state internally | Track source-attributed receipts | Wallet tracking beyond approved privacy posture |

## Limitations And Late-Surprise Risks

| Limitation | Severity | Blocks first internal source record? | Blocks public source activation? | Blocks NFT attribution? | Required response |
| --- | --- | --- | --- | --- | --- |
| Current attribution works only for MembershipSaleV3 payments | High | No | No, if public activation is membership-only | Yes | Document clearly; do not claim product-wide source commission |
| Archive1155 does not accept sourceId | High | No | No | Yes | Future wrapper/router or Archive sale V2 |
| Archive mint events lack source/acquisition fields | High | No | No | Yes | Future product receipt event |
| SourceRegistryV1 has no per-product terms | Medium | No | Maybe, for complex campaigns | Maybe | Use separate source IDs or future SourceRegistryV2/product router |
| SourceRegistryV1 is not enumerable on-chain | Low-medium | No | No | No | Index SourceCreated logs and known source IDs |
| Claim escrow exists but claim UI is inactive | Medium | No | Yes, if public source payouts can escrow | No | Build only after legal/readback/UX approval |
| Paused or revoked source blocks new commission and claim status-gates escrow | Medium | No | Requires clear source-operator UX | No | Keep runbook/recovery path explicit |
| V3 normalized read model uses legacy `referralAmount` naming for acquisition cost compatibility | Medium | No | Should be cleaned before public source dashboards | No | Rename/copy carefully in future UI/read model |
| Source-aware public buy path is not built | Medium | No | Yes | No | Build after source record ceremony and activation approval |
| Referral route can drift back into historical Operations-slice-only framing | Medium | No | Yes | No | Guard with production coherence tests; public copy must use acquisition-first, Net USDC Routed V3 language |
| Solidity header comments still say candidate/not deployed in some files | Low-medium | No | No | No | Future comment-only cleanup, no contract behavior change |
| V3 receipt UI for default buys uses gross 70/20/10 assumptions | Medium | No because ZERO_SOURCE_ID has no acquisition cost | Yes for non-zero source UX | No | Future source receipt UI must use event/readback amounts |
| SwapRail/external swap routes cannot be commissioned by current contracts | High | No | No | Not applicable | Keep out of scope until dedicated design |
| Off-chain/company product sales have no on-chain commission proof | Medium | No | No | Not applicable | Use company-level agreements only; do not present as protocol-paid |

## Phased Architecture

### Phase 1 - Controlled internal source attribution for V3 membership sale only

Already possible:

- SourceRegistryV1 deployed and owner accepted.
- MembershipSaleV3 deployed, funded, and source-aware.
- Deployed-address fork rehearsal passed.
- Source packet template and ceremony runbook exist.

Must be done:

- Founder fills source wallet, payout wallet, commission bps, caps, scope,
  window, metadata hash, and reason.
- Legal/product copy posture is confirmed.
- Source record is created PAUSED only.
- Readback confirms SourceCreated and zero live usage.

Allowed copy:

- "Internal source policy created and paused."
- "No public source path is active."

Must remain hidden:

- Public source link.
- Public source dashboard.
- Claim UI.

### Phase 2 - Source-aware UI/read-model after activation

Must be built:

- Source-aware preview/quote using non-zero sourceId only for approved source
  links.
- Receipt UI that uses V3 event/readback amounts.
- Activity labels for acquisition cost, net routed amount, and source class.
- My Syndicate source contribution module with careful legal language.

Must be tested:

- Direct zero-source buys still work.
- Historical member guard still works.
- Existing linked attribution cannot be silently overwritten.
- Paused/revoked sources fail closed.
- Escrow fallback does not block membership purchase.

### Phase 3 - NFT attribution strategy

Recommendation:

- Do not source-attribute Archive1155 mints on-chain with the current Archive
  contract.
- Decide later between Archive sale wrapper, Archive1155 V2, or generic product
  router.
- Keep Archive as protocol memory first.

### Phase 4 - Generic product attribution layer

Need later:

- ProductSaleRouterV1 or product-specific sale contracts.
- Product receipt events with productType and productId.
- Per-product terms strategy if the same source has different economics by
  product.
- Register/Activity product taxonomy.

### Phase 5 - Public member introduction / autonomous progression

Need later:

- Public source creation policy.
- Seated-member eligibility proof.
- Anti-abuse checks.
- Recognition progression separate from source money terms.
- UI that never presents source attribution as member ownership or official
  representation.

### Phase 6 - Claims/escrow UI only if needed

Need later:

- Escrow readback.
- Claim eligibility copy.
- Status-gated claim warnings.
- Payout wallet recovery language.
- Legal/product signoff.

### Phase 7 - B2B / partner / whitelabel attribution

Need later:

- Approved source packet per deal.
- Metadata hash and legal disclosure.
- Public/non-public display posture.
- Per-product terms policy if products expand beyond MembershipSaleV3.

## First Internal Source Record And Test Result

Result: the first internal BUILDER_SOURCE source record was created PAUSED,
terms were updated, the source was activated for one controlled $5
MembershipSaleV3 test buy, the receipt was read back, direct payout succeeded,
and the source was re-paused. This result does not authorize public source
links, claim UI, source dashboard, or a public source-aware buy path.

Why this remains the right boundary:

- The deployed-address fork proved the core source-attributed membership path.
- SourceRegistryV1 and MembershipSaleV3 are sufficient for a first controlled
  MembershipSaleV3 source path.
- A PAUSED source record tests governance/readback/registry discipline without
  activating public source behavior.

What it enables:

- Readback of a real source policy record.
- Register/Activity truth for a paused source policy and one internal source-attributed receipt.
- Operational rehearsal before public source links.

What it does not enable:

- Public referral/source activation.
- Claim UI.
- Archive1155 source commission.
- Product-wide attribution.
- Non-zero public/default source IDs.

Still needed:

- Review of the non-activating Verified Introduction buyer skeleton from
  `docs/VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.md`,
  `src/lib/verified-introduction-v1-buyer-experience.ts`, and
  `src/components/syndicate/VerifiedIntroductionBuyerExperience.tsx`.
- Legal/product copy posture for any public exposure.
- Anti-abuse, source eligibility, prohibited-promotion, and source onboarding
  rules before any member-introduction UX.
- Buyer disclosure, source preview, and clear-source UX before any wallet
  signature can carry a non-zero sourceId.
- Release and production QA for any future public source-aware path.

## Future Contract Candidates

No new contract is needed for the first controlled MembershipSaleV3 source
record.

Future candidates if product scope expands:

| Candidate | When needed | Why |
| --- | --- | --- |
| Archive sale wrapper or Archive1155 V2 | If Archive mints need on-chain source commission | Current Archive1155 does not accept sourceId or emit source receipt fields. |
| ProductSaleRouterV1 | If multiple future products need shared source-aware USDC payment routing | Avoid duplicating source logic across every product contract. |
| SourceRegistryV2 or ProductSourceTerms layer | If one source needs different terms by product, campaign, or jurisdiction | V1 source terms are global per sourceId. |
| Product receipt/event registry | If Activity/Register need product-level receipt reconciliation beyond events | Keep membership, Archive, and product receipts distinguishable. |
| Source dashboard/claim UI | Only after legal/readback approval | Existing contract has escrow claim capability, but no live UI should appear early. |

## Product Copy Rules

Allowed while inactive:

- "Source attribution infrastructure is deployed."
- "Source records are inactive."
- "Public/default buys use ZERO_SOURCE_ID."
- "A future source record can attribute a MembershipSaleV3 purchase if approved,
  active, and supplied to the buy call."

Allowed after PAUSED source record:

- "A source policy record exists but is paused."
- "No source-linked purchase path is active."

Allowed after ACTIVE source record and product signoff:

- "This receipt shows the acquisition cost and net USDC routed."
- "This source introduced the purchase."
- "Source attribution is visible in the receipt."

Never show:

- Source attribution as ownership of a member.
- Source attribution as seat identity.
- Source attribution as official representation unless a separate legal
  appointment exists.
- Public source commission before source record activation and receipt proof.
- Product-wide source commission for Archive or future products before a
  source-aware product sale path exists.

## Next Recommended Sprint

Before creating another source record, activating the existing PAUSED source
again, or building public source/referral UX:

1. Rebuild current-authority readbacks.
2. Confirm whether source terms/window remain suitable for any future controlled test.
3. Use `docs/SOURCE_REAL_CONDITION_CEREMONY_READBACK.md`,
   `docs/SOURCE_ACTIVATION_READINESS_PACKET.md`, and
   `src/lib/source-activation-readiness.ts` as the PAUSED-to-ACTIVE boundary
   model.
4. Use `docs/SOURCE_AWARE_LOCAL_TEST_PATH.md` and
   `src/lib/source-aware-test-mode.ts` as the internal source-aware test
   boundary for localhost and explicit production-internal mode.
5. Use `docs/SOURCE_PUBLIC_PRODUCT_DECISION_FRAMEWORK.md`,
   `docs/SOURCE_PUBLIC_PRODUCT_FOUNDER_REVIEW_PACKET.md`, and
   `src/lib/source-public-product-framework.ts` as the approved-direction
   framework for invite-only Verified Introduction V1. The framework is not
   launch approval.
6. Use `docs/VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.md`,
   `src/lib/verified-introduction-v1-execution.ts`,
   `src/lib/verified-introduction-v1-buyer-experience.ts`, and
   `src/components/syndicate/VerifiedIntroductionBuyerExperience.tsx` for the
   non-activating buyer preview, clear-source, and failure-state skeleton. It
   is not a launch surface.
7. Keep public referral/source copy aligned with acquisition-first,
   MembershipSaleV3-only source attribution.
8. Do not build public source links, aliases, claim UI, source dashboards,
   Archive source attribution, open self-serve member referral, or
   product-wide attribution until `docs/SOURCE_PUBLIC_PRODUCT_DECISION_GATE.md`
   and `src/lib/public-product-decision-gate.ts` are satisfied by separate
   founder-approved product, legal/disclosure, UX, security, release, and
   current-authority gates.
