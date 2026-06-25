# Referral / Source Attribution Strategic Research

Status: STRATEGIC RESEARCH / ARCHITECTURE REFERENCE / NO ACTIVATION AUTHORITY

Last updated: 2026-06-23

Repository baseline reviewed: `1b1d8da17924cf7998220ca8b2645d451a03d49f`

This document records the strategic research and architecture judgment for
Referral / Source Attribution V1. It is an operational research reference. It
does not override on-chain truth, canonical registries, constitutional doctrine,
the module integration standard, the protocol organism graph, or the source
creation ceremony runbook.

This document does not authorize another source record, source activation,
claim UI, public source link, non-zero public source path, registry switch,
deployment, transaction, funding action, V2b recovery, SwapRail, SeatRecord721,
ProductSaleRouter, Archive1155 V2, or any public activation.

## 1. Executive Summary

The current V3 source-attribution architecture remains directionally correct
for The Syndicate, but only if it is kept in its proper place:

- Source attribution is one acquisition layer, not the business model.
- SourceRegistryV1 is policy infrastructure, not a universal commerce router.
- MembershipSaleV3 is the only current source-aware payment path.
- Public/default V3 buys must continue to use `ZERO_SOURCE_ID`.
- One internal PAUSED source record exists; zero ACTIVE sources exist.
- Referral/source UI and claim UI remain inactive.
- Archive1155, SwapRail, future product sales, and SeatRecord721 are not
  source-aware today.

In short: Archive1155, SwapRail, future product sales, and SeatRecord721 are not source-aware today.

The next irreversible action should not be public referral activation. The
highest-leverage path is:

1. Keep current public V3 direct buys stable and source-neutral.
2. Keep the first internal PAUSED source readback as policy truth only.
3. Do not activate it without a separate ceremony.
4. Keep the readback recorded in Register/Activity truth surfaces.
5. Build source-aware quote, receipt, and My Syndicate read models after the
   paused-record proof exists.
6. Activate a source only in a separate ceremony after legal/product copy,
   wallet policy, and failure-state UX are ready.

The first controlled source should be an internal MembershipSaleV3-only source,
likely `BUILDER_SOURCE`, with conservative terms, explicit caps, and initial
status `PAUSED`. It should not create a public source program, claim dashboard,
Archive commission, product-wide attribution, or member ownership language.

## 2. Current Syndicate Truth

### 2.1 Live / deployed state

| System | Current truth |
| --- | --- |
| SYN | Live V1 seat token. |
| MembershipSaleV3 | Deployed, funded, direct-buy target for V3 membership purchases. |
| SourceRegistryV1 | Deployed, owner accepted, one internal PAUSED source record. |
| Public/default buy path | Uses `ZERO_SOURCE_ID`. |
| Referral/source UI | Pending, read-only/inactive. |
| Claim UI | Inactive. |
| V2b | Paused/historical boundary. |
| Archive1155 | Live protocol memory, not source-aware. |
| SeatRecord721 | Future identity record, not deployed. |
| SwapRail | Future design, not implemented. |
| ProductSaleRouter | Future design, not implemented. |

### 2.2 Relevant canonical docs

The current source-attribution work must be read through:

- `docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md`
- `docs/IDENTITY_ATTRIBUTION_CONSTITUTION.md`
- `docs/MODULE_INTEGRATION_STANDARD.md`
- `docs/PROTOCOL_ORGANISM_GRAPH.md`
- `docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md`
- `docs/SOURCE_CREATION_CEREMONY_RUNBOOK.md`
- `docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_DRAFT.md`
- `docs/PROTOCOL_ECONOMY_OBSERVATORY_DESIGN.md`
- `docs/OPERATIONAL_MEMORY_LEDGER.md`

### 2.3 Contract facts that matter

`SourceRegistryV1`:

- stores source terms and status;
- starts newly created sources as `PAUSED`;
- supports statuses `ACTIVE`, `PAUSED`, and `REVOKED`;
- supports classes `MEMBER_INTRODUCTION`, `BUILDER_SOURCE`, `AFFILIATE`,
  `BD_NETWORK`, `WHITELABEL`, `SPONSORSHIP`, and `TREASURY_DEAL`;
- caps general commission at 30%;
- caps `MEMBER_INTRODUCTION` at 12%;
- emits source policy events;
- does not move funds, mint SYN, sell products, create a seat, or activate UI.

`MembershipSaleV3`:

- reads SourceRegistryV1 only when a non-zero sourceId is supplied;
- keeps zero-source buys source-neutral;
- applies acquisition-first routing for valid active sources;
- routes net USDC into Vault / Liquidity / Operations;
- emits `MembershipPurchasedV3`;
- supports direct source payout with escrow fallback;
- status-gates source escrow claims;
- blocks self-referral and source hijacking cases;
- requires member-introduction referrers to remain seated.

## 3. Referral / Source Model Taxonomy

| Model | What it means | Good fit for The Syndicate? | Main risk | Current support |
| --- | --- | --- | --- | --- |
| Friend referral | One person introduces another through a simple link/code. | Later, once public member-introduction policy is ready. | Can feel casual, spammy, or under-disclosed. | Not active. |
| Seated member introduction | A seated wallet introduces a buyer. | Yes, but after anti-abuse and UX are ready. | Must not become downline/MLM or member ownership. | Contract supports member-introduction class, but no records. |
| Affiliate | External content/source sends traffic under terms. | Possible for approved sources. | Must avoid official-representative implication. | Source class exists. |
| Builder source | Builder/operator contributes useful acquisition or infrastructure. | Best first internal source class. | Must separate money terms from trust-capital recognition. | Source class exists. |
| BD network | Business-development channel. | Possible after legal/product approval. | Needs clear agreement and disclosure. | Source class exists. |
| Whitelabel | Embedded or partner-branded source channel. | Later. | Product/agency confusion. | Source class exists. |
| Sponsorship | Paid campaign or sponsored channel. | Later. | Disclosure and marketing compliance. | Source class exists. |
| Treasury deal | Strategic institutional arrangement. | Later, high-control only. | Could look opaque if not registered carefully. | Source class exists. |
| Product-wide attribution | Source applies to all future products. | Not now. | False because only MembershipSaleV3 is source-aware. | Not supported. |
| Archive attribution | Source commission on Archive/NFT activity. | Not now. | Archive is memory, not affiliate-commerce. | Not supported by Archive1155. |
| SwapRail attribution | Source commission on swap/bridge/trade activity. | Not now. | Provider/fee/compliance complexity. | Not implemented. |
| Claim dashboard | Source sees/claims escrowed commission. | Later only. | Premature money-dashboard psychology. | Contract has claim path; UI inactive. |

## 4. World-Class Pattern Analysis

The external benchmark is not "copy a referral program." It is "learn the
control surfaces mature acquisition systems use."

### 4.1 Coinbase-style crypto referral controls

Coinbase's public help content shows several useful crypto-specific patterns:

- unique invite links/codes;
- qualifying purchase or trading requirements;
- time windows;
- country restrictions;
- fraud/risk review;
- paid-search and brand-keyword restrictions;
- consent expectations for referral messages;
- terms that can be modified or revoked.

Lesson for The Syndicate: crypto acquisition needs eligibility windows, risk
review, jurisdiction awareness, and promotional conduct rules. The Syndicate
should not expose public referral links before source status, source terms,
receipt copy, and legal restrictions are explicit.

Source: https://help.coinbase.com/en/coinbase/getting-started/getting-started-with-coinbase/new-customer-incentive

### 4.2 Binance-style separation of referral and affiliate surfaces

Binance separates referral and affiliate concepts at the product/navigation
level and keeps legal, risk, terms, and product documents close to acquisition
surfaces.

Lesson for The Syndicate: do not collapse public member introductions, approved
builders, BD channels, institutional sources, and product partnerships into one
undifferentiated "referral" page. The source class and status must be visible
and precise.

Source: https://www.binance.com/en/activity/referral

### 4.3 Amazon Associates-style customer ownership boundary

Amazon Associates is useful because it makes a hard distinction between an
associate relationship and customer ownership. The associate sends qualified
traffic through tagged links, but the customer relationship is not transferred
to the associate. Amazon also reserves monitoring and enforcement rights.

Lesson for The Syndicate: source attribution must never imply that a source
owns, controls, represents, or manages a member relationship. A source can be
credited for a verified introduction; the member remains seated in the
institution, not in the source's private network.

Source: https://affiliate-program.amazon.com/help/operating/agreement

### 4.4 Uber-style progress and condition tracking

Uber's driver referral flow emphasizes invite codes, visible progress, local
conditions, and completion thresholds before rewards are earned.

Lesson for The Syndicate: if public member introductions become live later, the
member/source experience should show state transitions, not vague promises:
source status, attribution window, qualifying event, commission routed or
escrowed, receipt available, and claim status if claim UI ever exists.

Source: https://www.uber.com/us/en/drive/how-referrals-work/

### 4.5 Shopify and Stripe partner ecosystems

Shopify Partners and Stripe Partners are useful because they are not only
"invite links." They frame growth as an ecosystem of builders, apps, services,
integrations, education, and partner channels.

Lesson for The Syndicate: the strongest long-term model is not a casino-like
referral leaderboard. It is a source and builder ecosystem where verified
introductions are one kind of contribution among documentation, infrastructure,
legal, operational, and product work.

Sources:

- https://www.shopify.com/partners
- https://stripe.com/partners

### 4.6 FTC disclosure standards for social promotion

FTC guidance for social endorsements stresses clear, hard-to-miss disclosures
placed with the endorsement, and warns against vague shorthand or unsupported
claims.

Lesson for The Syndicate: future source links or creator/partner campaigns must
have clear relationship disclosure near the promotion. The site should avoid
vague public terms like "ambassador" unless the legal meaning is controlled.

Source: https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers

### 4.7 Historical viral loops: useful, but not canonical

Dropbox, PayPal, and Airbnb-style loops are useful as growth history, but they
should not drive The Syndicate architecture. The Syndicate is a transparent
on-chain membership institution with USDC routing, seat identity, receipts, and
public proof. Its acquisition layer must be more controlled than a simple
consumer app referral bonus.

## 5. Legal / Disclosure / User Agreement Issue Spotting

This is not legal advice. It is an issue map for counsel/product review.

### 5.1 Required disclosure themes

Before public activation, the source program needs a clear policy surface for:

- who can be a source;
- what a source is and is not;
- what commission is paid from;
- whether commission applies to first purchase, windowed repeat purchases, or
  custom terms;
- source status: `PAUSED`, `ACTIVE`, or `REVOKED`;
- payout wallet and recovery policy;
- escrow fallback and claim limitations;
- source revocation and modification rights;
- promotional conduct rules;
- jurisdiction or eligibility limits;
- fraud, wash activity, self-referral, and abuse handling;
- tax responsibility;
- data/privacy boundaries;
- no employment, agency, or official representation by default.

### 5.2 Prohibited public framing

Never frame source attribution as:

- passive income;
- yield;
- staking reward;
- investment return;
- guaranteed reward;
- downline;
- MLM;
- member ownership;
- official representative status;
- governance right;
- equity right;
- claim on treasury;
- Archive/NFT speculation;
- automatic commission across every product.

### 5.3 Sharia / ethics posture

The safest framing is service-based acquisition cost for a verified
introduction, not yield on capital. Commission should be tied to a real
acquisition event and shown in the receipt. Avoid interest, passive-return,
uncertain entitlement, and speculative reward language.

### 5.4 User agreement impact

A future source agreement or source terms page should cover:

- source eligibility;
- status and termination;
- prohibited promotion;
- consent obligations;
- no source ownership of buyers/members;
- no official agency unless separately appointed;
- payout mechanics;
- escrow/claim rules;
- abuse review;
- jurisdiction restrictions;
- right to pause/revoke;
- metadata hash and Register truth.

## 6. Technical Architecture Mapping

### 6.1 Current source-aware path

```text
source packet -> SourceRegistryV1 source policy -> source status ACTIVE
-> MembershipSaleV3.buy(... sourceId ...)
-> acquisitionCost
-> net USDC routed 70 / 20 / 10
-> MembershipPurchasedV3 receipt
-> Activity / My Syndicate / Transparency / Register
```

This path exists technically but is not public-active because no source record
is ACTIVE and public/default buys use `ZERO_SOURCE_ID`.

### 6.2 Current non-edges

| Target | Current source edge? | Rule |
| --- | --- | --- |
| Archive1155 | No | Current Archive mints are memory, not source-attributed commerce. |
| SwapRail | No | Not implemented; external-provider risk requires separate design. |
| ProductSaleRouter | No | Router does not exist. |
| SeatRecord721 | No | Future identity record; source is not identity. |
| Claim UI | No public edge | Contract escrow path exists, UI inactive. |
| Member ownership | Never | Source attribution never means source owns a member. |

### 6.3 V3 source record lifecycle

1. Draft source packet.
2. Founder/legal/product approval.
3. `createSource` transaction.
4. Source starts `PAUSED`.
5. Read back `SourceCreated` and `sourceConfig`.
6. Register source policy truth.
7. Build/read source-aware UI surfaces if needed.
8. Separate activation approval.
9. `setSourceStatus(ACTIVE)` transaction.
10. Non-zero source paths may be tested/used only after activation.

### 6.4 Read-model requirements before public activation

Before a non-zero public source path exists, these should be ready:

- source packet and metadata hash display/readback;
- Activity event classification for source policy actions;
- Register row for source status and terms;
- My Syndicate source context that does not look like a money dashboard;
- V3 receipt UI that displays gross USDC, acquisition commission, net USDC
  routed, Vault/Liquidity/Operations split, source class, source status, and
  receipt proof;
- cache tests preserving V3 and source metadata after reload;
- error states for paused, revoked, unseated, self-referral, cap reached, and
  escrow fallback.

## 7. V1 / V2 / V3 Roadmap

### V1 - Current safe path: observation and paused source readiness

Status: first PAUSED record complete; next safe phase is read-model proof and
activation readiness, not public referral.

Scope:

- no public source links;
- no claim UI;
- no non-zero public/default source path;
- one internal source packet only;
- the existing internal source record remains `PAUSED`;
- MembershipSaleV3-only source attribution.

Recommended first source:

- class: `BUILDER_SOURCE`;
- status: `PAUSED`;
- scope: conservative and explicit;
- bps: conservative;
- caps: explicit;
- metadata hash: required;
- source wallet and payout wallet: founder-approved;
- public display: none until readback/copy/UX are approved.

### V2 - Controlled active source path

Status: after PAUSED readback and copy/UX approval.

Scope:

- controlled source link or internal path;
- source-aware quote preview;
- receipt display from event values;
- Activity/Register truth;
- no public claim UI unless escrow state and legal copy are ready.

### V3 - Public member introduction system

Status: later.

Scope:

- seated-member introduction policy;
- self-serve source eligibility;
- anti-abuse controls;
- clear progress and status;
- recognition separate from source money terms;
- no downline;
- no member ownership.

### V4 - Partner and institutional source layer

Status: later.

Scope:

- BD networks, whitelabel, sponsorship, treasury deal terms;
- per-source packet and metadata hash;
- legal/representation boundaries;
- public or private display posture by source class.

### V5 - Product-wide source attribution

Status: future architecture only.

Scope:

- Archive sale wrapper, Archive1155 V2, ProductSaleRouter, or product-specific
  contracts;
- product receipt events;
- per-product source terms or separate source IDs;
- product-specific legal copy.

## 8. Anti-Drift Rules

1. Do not call referral live merely because a source record exists or is PAUSED.
2. Do not call source attribution active while every public/default buy uses
   `ZERO_SOURCE_ID`.
3. Do not create public source links before a source record is active.
4. Do not show claim UI before escrow, status, payout, legal copy, and readback
   gates are complete.
5. Do not imply Archive1155 mints are source-attributed.
6. Do not imply SwapRail or future products inherit MembershipSaleV3 source
   logic.
7. Do not describe CommissionRouterV1 as the active V3 source engine.
8. Do not use source attribution as rank, identity, or member ownership.
9. Do not describe recognition levels as automatic money terms.
10. Do not display acquisition commission as passive income, yield, ROI, or
    guaranteed reward.
11. Do not create or activate a source in the same ceremony.
12. Do not bundle source activation with public UI activation.
13. Do not treat a PAUSED source record as public referral activation.
14. Do not treat strategic research as deployment authority.

## 9. Recommended Immediate Next Steps

### 9.1 Finish this research/reference layer

This document should be committed to GitHub main and registered in the
documentation authority map as operational research/reference, not canonical
constitution.

### 9.2 Keep production sync disciplined

Because this is docs/tests only, Replit production does not need an emergency
publish. Replit can pull it in the next coherent GitHub sync. If Replit does
pull it, it should run `npm run check-release` before any publish.

### 9.3 Prepare, but do not execute, the first internal source packet

Complete the source packet with:

- source wallet;
- payout wallet;
- source class;
- commission bps;
- scope;
- attribution window;
- gross cap;
- per-buyer cap;
- metadata hash;
- initial status `PAUSED`;
- legal/product approval note.

### 9.4 Re-run pre-ceremony proof before any source transaction

Before creating another source record or activating the existing PAUSED source:

- read SourceRegistryV1 source count/logs;
- confirm source count, status, and sourceConfig from current readback;
- confirm V3 direct buy path remains healthy;
- run or cite the latest relevant fork rehearsal;
- confirm owner wallet and network;
- confirm no UI will expose non-zero sourceId.

### 9.5 After PAUSED source record, build read-model surfaces before activation

Only after PAUSED readback should the team build:

- source policy Register row;
- source policy Activity event;
- source-aware quote/read-only preview;
- source receipt UI;
- My Syndicate source context;
- activation ceremony checklist.

## 10. Founder Recommendation

The current path is still the best path if it stays narrow:

- Keep public V3 direct buys source-neutral.
- Do not activate public referral.
- Do not create claim UI.
- Do not make source attribution product-wide.
- Do not source-attribute Archive or SwapRail.
- Do not create ProductSaleRouter yet.
- Do not turn source attribution into the product.

The best next real-world move is not a public referral launch. It is activation
readiness and a controlled localhost-only source-aware test path for the
existing internal PAUSED MembershipSaleV3 source record.

Exact next step: source activation preflight plus local-only source-aware test
design, with no public source path.

This gives The Syndicate real operational proof without creating legal,
psychological, or product-story drift. It also preserves the larger institution:
Seat Identity, Contribution Depth, Economic Scale, Institutional Trust Capital,
Transparent Routing, Historical Memory, and Institutional Growth.

## 11. Source List

External references reviewed:

- Coinbase customer incentive and referral help:
  https://help.coinbase.com/en/coinbase/getting-started/getting-started-with-coinbase/new-customer-incentive
- Binance referral page:
  https://www.binance.com/en/activity/referral
- Amazon Associates Operating Agreement:
  https://affiliate-program.amazon.com/help/operating/agreement
- Uber driver referral help:
  https://www.uber.com/us/en/drive/how-referrals-work/
- Shopify Partners:
  https://www.shopify.com/partners
- Stripe Partners:
  https://stripe.com/partners
- FTC disclosures for social media influencers:
  https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers

Internal references reviewed:

- `docs/MODULE_INTEGRATION_STANDARD.md`
- `docs/PROTOCOL_ORGANISM_GRAPH.md`
- `docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md`
- `docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_DRAFT.md`
- `docs/SOURCE_CREATION_CEREMONY_RUNBOOK.md`
- `docs/STRATEGIC_NARRATIVE_AND_EXECUTION_ORDER.md`
- `docs/PROTOCOL_ECONOMY_OBSERVATORY_DESIGN.md`
- `docs/audits/2026-06-22_FULL_SITE_PROTOCOL_BASELINE_AUDIT.md`
- `docs/audits/2026-06-22_FULL_SYSTEM_PRE_REFERRAL_AUDIT.md`
- `src/lib/source-policy-observability.ts`
- `contracts/src/SourceRegistryV1.sol`
- `contracts/src/MembershipSaleV3.sol`
