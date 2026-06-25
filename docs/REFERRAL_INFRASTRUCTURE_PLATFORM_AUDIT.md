# Referral Infrastructure Platform Audit

Status: OPERATIONAL RESEARCH / INFRASTRUCTURE BLUEPRINT / NO ACTIVATION AUTHORITY

Last updated: 2026-06-23

Repository baseline: 8d4d5f9096401b74053ab10513359d7a0d2abe06

This document has no activation, deployment, source-record, claim-UI, public-source-link, or transaction authority. It is a research and architecture reference for source attribution only. It does not authorize referral activation, public source links, non-zero public buy paths, another source record, claims, wallet signing, contract changes, registry switches, Replit publishing, or production changes.

Current repository truth remains:

- V3 is the active membership sale path in the repository.
- SourceRegistryV1 is deployed and owner-accepted.
- MembershipSaleV3 is technically source-aware.
- One internal source record exists, completed one controlled source-attributed
  MembershipSaleV3 buy, and returned to PAUSED; zero ACTIVE sources exist.
- Public/default buys use ZERO_SOURCE_ID.
- Referral/source UI and claim UI remain inactive.
- SourceRegistryV1 is not a universal commerce router.
- MembershipSaleV3 is the only current source-aware payment path.
- Archive1155 is not source-aware.
- Product-wide attribution remains future-only.

## 1. Executive Summary

Mature referral platforms are workflow systems, not only links. The common pattern across PartnerStack, Impact.com, Everflow, Rewardful, FirstPromoter, ReferralCandy, Friendbuy, Tapfiliate, GrowSurf, Viral Loops, Mention Me, Extole, Affise, RedTrack, Tolt, Post Affiliate Pro, and InviteReferrals is not a single referral button. It is an operating layer that combines partner identity, terms, links or codes, attribution windows, fraud controls, dashboards, payout operations, resource centers, APIs, disclosures, and audit trails.

The Syndicate already has stronger trust primitives than most Web2 referral SaaS products at the money-flow layer: source policy records can be on-chain, purchase receipts can expose gross USDC, acquisition cost, net USDC routed, Vault, Liquidity, Operations, SYN delivered, buyer, source class, and source wallet. That is unusually transparent. The missing pieces are not another contract today. The missing pieces are operating maturity around source identity, source terms, legal/disclosure copy, source dashboards, source links, anti-abuse operations, privacy posture, payout/escrow explainers, and public activation discipline.

What should be built natively:

- On-chain source policy records for approved source terms.
- MembershipSaleV3 source-attributed receipts.
- Source lifecycle readbacks in Activity/Register/Transparency.
- Source Policy Observability as the non-live truth surface.
- Source packet/runbook discipline before any state change.
- Regression guards that prevent referral/source/claim drift.

What should stay off-chain or hybrid:

- Click tracking, landing-page attribution, UTM/session capture, creator communications, source onboarding, campaign copy, KYC/tax documents, legal agreements, dispute handling, fraud scoring, and source analytics aggregation.
- These can later feed a signed metadata hash or Register entry, but should not be forced into the core sale contract.

What should stay future-only:

- Public referral links.
- Public member referral.
- Claim UI.
- Source dashboards.
- Coupon/code attribution.
- Product-wide attribution.
- Archive/NFT attribution.
- SwapRail attribution.
- ProductSaleRouter attribution.
- Marketplace or premium pass attribution.

This audit does not change the current near-term recommendation. The controlled internal source-aware test path now exists as a boundary for the existing internal PAUSED MembershipSaleV3 source record, with localhost mode and a separately approved production-internal mode. The correct next real milestone is source activation readiness: current-authority preflight, source terms/window review, and separate founder approval before any ACTIVE ceremony or tiny controlled test. The SaaS research adds a stronger warning: do not create public source links before an active source record, and do not create source-facing dashboards before the legal, payout, fraud, disclosure, and read-model layers are ready.

## 2. SaaS Platform Matrix

| Platform | Customer segment | Referral or partner model | Infrastructure signals | Strongest idea to borrow | Do not copy blindly | Relevance |
|---|---|---|---|---|---|---|
| PartnerStack | B2B SaaS partner ecosystems | Affiliate, reseller, influencer, co-sell partner programs | Partner recruitment, onboarding, reporting, marketplace, commissions, payouts | Partner program as a managed ecosystem, not a link generator | Marketplace-like public partner recruitment before legal/source maturity | High |
| Impact.com | Enterprise partnership management | Affiliates, creators, commerce partners, strategic partnerships | Partnership lifecycle, contract/terms management, analytics, integrations, payouts | Treat source terms as structured business relationships | Complex enterprise partnership language that implies agency or representation | High |
| Everflow | Performance marketing, affiliates, partner tracking | Source/campaign attribution across clicks, offers, commerce and media | API-first tracking, reporting, targeting rules, fraud controls, integrations | Strong event and source analytics layer around each attributed conversion | Ad-network style optimization that could make membership feel like ad arbitrage | High |
| Rewardful | SaaS affiliate programs | Stripe-centered referral and affiliate programs | Links, campaigns, coupons, recurring or fixed commissions, partner portal, API | Simple campaign/source setup with transparent commission terms | Recurring SaaS commission assumptions applied to SYN seat purchases | High |
| FirstPromoter | SaaS and subscription companies | Affiliate, referral, partner tracking | Subscription lifecycle tracking, tiered rates, coupons, payouts, tax documents, fraud flags | Clear source portal plus fraud and tax workflow boundaries | Lifetime recurring language that can look like passive income if copied | High |
| ReferralCandy | Ecommerce brands | Customer referral and affiliate rewards | Referral links, coupon codes, store credit/cash/custom rewards, suspicious activity flags | Clear give/get style UX and self-referral defenses | Cashback-game framing, coupon leakage, and consumer promo tone | Medium |
| Friendbuy | Ecommerce and lifecycle marketing | Referral, loyalty, influencer, affiliate | Attribution, fraud controls, A/B testing, first-party data, payouts, widgets | Program experiments and analytics without changing core payment path | Growth gimmicks, contests, and reward psychology that weaken institution tone | Medium |
| Tapfiliate | SaaS, ecommerce, affiliate programs | Affiliate/partner programs | Links, tracking, white label portal, automation, flexible commissions, marketplace | White-label source portal and simple commission management | Multi-level marketing features; The Syndicate must not support downlines | Medium |
| GrowSurf | Tech startups and SaaS | Referral and affiliate automation | REST API, JS SDK, webhooks, embeds, CRM/payment integrations, dynamic rewards | API/webhook-driven growth events feeding product surfaces | Over-automated rewards before legal/source maturity | Medium |
| Viral Loops | Startups, newsletters, ecommerce | Referral waitlists, milestone campaigns, giveaways | Campaign templates, waitlists, leaderboards, invite widgets, dashboards | Milestone mechanics as non-financial progression inspiration | Leaderboards/giveaways that feel casino-like or fake-urgent | Low/Medium |
| Mention Me | Consumer brands and advocacy programs | Customer advocacy and referral | Advocacy signals, referral journey optimization, customer data integrations | Distinguish advocates and trust signals from money terms | Brand-advocacy scoring that could become opaque if not disclosed | Medium |
| Extole | Enterprise referral, loyalty, influencer | Refer-a-friend, influencer, employee, loyalty programs | Flow builder, reward bank, API, mobile app, security/compliance, integrations | Program controls, reward bank, and compliance posture | Employee/influencer programs that imply official representation | Medium |
| Affise | Performance marketing and partnership management | Affiliate networks, partner marketing, tracking | Campaign management, analytics, fraud tools, payment workflows, APIs | Performance analytics and partner payment operations | Network-style traffic sourcing that risks low-quality acquisition | Medium |
| RedTrack | Ad tracking, affiliate/ecommerce analytics | Conversion tracking and attribution | Conversion API, analytics, automation, data/API stack, integrations | Clean source/campaign data pipeline and reporting discipline | Paid traffic optimization without clear disclosure and quality controls | Medium |
| Tolt | SaaS affiliate programs | Affiliate and referral program management | SaaS-oriented affiliate tracking and portals | Lightweight source management for SaaS-like products | SaaS subscription assumptions that do not map directly to SYN seat doctrine | Medium |
| Post Affiliate Pro | Affiliate program management | Affiliate tracking and automation | S2S tracking, tracking tools, global partner support, fraud-oriented education | Server-to-server tracking and fraud-focused operations | Traditional affiliate-program tone that could feel generic or promotional | Low/Medium |
| InviteReferrals | Website, social, mobile referrals | Referral campaigns across channels | Shares, clicks, conversions, JS snippet, email notices, coupons, fraud prevention | Multi-channel event tracking and manual review controls | Social campaign mechanics before source policy and privacy disclosures are ready | Low/Medium |

## 3. Infrastructure Feature Taxonomy

| Feature | Syndicate timing | Correct layer | Current support | Missing support | Legal/UX/abuse risk | Priority |
|---|---|---|---|---|---|---|
| Source records | Now, controlled only | On-chain | SourceRegistryV1 | First approved record exists PAUSED; no ACTIVE source exists | Terms can imply agency if poorly named | High |
| Source lifecycle | Now | On-chain plus Register | create/pause/revoke/update events | Public readback surface is not complete | Hidden changes reduce trust | High |
| Referral/source links | Later | Off-chain plus sourceId | None live | Link generator, session handling, disclosures | Link hijacking, fake official sources | High later |
| Coupon/code attribution | Later, maybe | Off-chain/hybrid | None | Code registry and collision rules | Coupon leakage and consumer promo drift | Medium |
| Wallet/source identifiers | Now | On-chain | sourceId and wallets | Source identity metadata policy | Wallet compromise or impersonation | High |
| First-touch attribution | Later | Off-chain/hybrid | Not public | Session/cookie model and consent | Privacy and stale attribution | Medium |
| Last-touch attribution | Later, cautious | Off-chain/hybrid | Not public | Clear policy | Hijacking, creator conflict | Low/Medium |
| Windowed attribution | Contract-supported | On-chain | Source scope/window fields | Live policy/readback | Confusing repeat purchase expectations | High |
| Lifetime attribution | Restricted | On-chain/hybrid | Scope supports policy design | Not activated | Can look like passive income | Medium |
| Capped attribution | Contract-supported | On-chain | Caps and bps limits | Policy packet per source | Cap confusion | High |
| Recurring commissions | Future only | Contract/product-specific | Not live | Needs product path support | Passive-income drift | Block until justified |
| One-time commissions | Candidate | On-chain sale path | MembershipSaleV3 | Source record and legal terms | Misread as reward | High |
| Direct payouts | Contract-supported | On-chain | Direct payout with escrow fallback | User/source explainers | Payout failure confusion | High |
| Delayed payouts | Future | Hybrid | Escrow primitives | Claim UI/legal/tax readiness | Claim UI before maturity | Medium later |
| Escrow/claim paths | Future UI only | On-chain plus UI | Contract-level escrow fallback | Public claim UI inactive | Accounting and legal confusion | Block for now |
| Fraud detection | Needed before public | Off-chain plus on-chain guards | Self-referral and seating guards | Sybil/link/traffic scoring | Abuse at scale | High before public |
| Self-referral controls | Now | On-chain | MembershipSaleV3 guards | Public copy/readback | Direct abuse if bypassed | High |
| Partner/source portals | Later | Off-chain/UI | None | Source dashboard and terms | Fake-live partner status | Later |
| Source dashboards | Later | UI/read-model | Observability only | Source-specific analytics | Leaderboard/casino drift | Later |
| Onboarding flows | Before public source | Docs/UI | Source packet/runbook | Source agreement and founder review | Incomplete consent/terms | High before source use |
| Campaign pages | Later | UI/marketing | None | Campaign identity, status, terms | Fake urgency or overhype | Later |
| Invite widgets | Later | UI | None | Widget plus sourceId handling | Public source path drift | Later |
| Waitlists | Maybe later | UI/off-chain | None | Eligibility and disclosure | Fake scarcity | Low |
| Leaderboards | Avoid or recognition-only | UI/read-model | None | Trust-capital design | Casino/MLM feeling | Avoid money leaderboard |
| Milestone campaigns | Later, careful | Register/Chronicle/UI | Doctrine exists | Non-financial source recognition | Gamification drift | Medium later |
| Marketplace discovery | Much later | UI/off-chain | None | Vetting and public source directory | Official-rep confusion | Low now |
| Content/resource center | Before public source | Docs/UI | Docs exist | Source rules, disclosure, prohibited claims | Bad promotion | High before public |
| Email automation | Later | Off-chain | None | Notification consent | Privacy and spam | Later |
| APIs/webhooks | Later | Off-chain/indexer | Not public | Events/indexing/API keys | Data exposure | Medium later |
| CRM/payment integrations | Later | Off-chain | None | CRM, analytics, accounting exports | Private data | Medium |
| Privacy/cookie controls | Before links | Legal/UI/off-chain | No public tracking | Consent and retention policy | Regulatory/privacy risk | High before links |
| Disclosure/compliance logs | Before public source | Docs/Register | Legal docs partial | Source agreement, disclosure logs | FTC-like disclosure risk | High |
| Audit trails | Now | On-chain/Register/docs | Events and runbooks | Public source-change readback | Hidden policy mutation | High |

## 4. Syndicate Translation Layer

| SaaS concept | Syndicate primitive | Current state | Correct translation |
|---|---|---|---|
| Partner profile | SourceRegistryV1 source record | One internal PAUSED record | A source is a policy object, not a member relationship owner |
| Affiliate link | Future source link | Not live | A link may prefill sourceId later, but public/default buys must remain ZERO_SOURCE_ID until activated |
| Coupon/code | Future code registry | Not live | Only add if code collision, disclosure, and attribution rules are frozen |
| Commission terms | Source terms | Contract-supported | commissionBps, scope, caps, window, payout wallet, status |
| Partner portal | Future source dashboard | Not live | My Syndicate can later show source readbacks, but no claim UI today |
| Campaign dashboard | Future source analytics | Not live | Aggregate attributed receipts without turning referral into leaderboard casino |
| Conversion event | MembershipPurchasedV3 | Supported | Receipt should remain reconstructable from chain data and Activity read-models |
| Reward bank | Escrow/payout read-model | Contract fallback exists | Public claim UI remains blocked until legal/readback maturity |
| Fraud flags | Source observability plus off-chain review | Partial | Add source health, manual review, and suspicious source event notes later |
| Disclosure center | Docs/Register/Transparency | Partial | Required before public source links or source-facing recruitment |

Module boundaries:

- SourceRegistryV1 is source policy infrastructure, not a universal commerce router.
- MembershipSaleV3 is the only current source-aware payment path.
- Source Policy Observability is the current non-live public truth surface.
- ZERO_SOURCE_ID is the public/default buy boundary.
- Activity and Register may later read source policy events, but this does not activate referral.
- Protocol Economy and Transparency can explain source attribution only as pending/inactive until a source is ACTIVE and receipt proof exists.
- My Syndicate may later show source status, attributed receipts, and claim state, but not before activation gates are met.
- Archive1155 is memory, not referral infrastructure.
- Future Archive wrapper / Archive1155 V2 must have explicit attribution support before any Archive attribution claim.
- SeatRecord721 is future identity record, not source ownership.
- ProductSaleRouter, SwapRail, marketplace, premium pass, and product modules need their own attribution design before source attribution can extend beyond MembershipSaleV3.

## 5. V1 / V2 / V3 / V4 Blueprint

### V1: Controlled source policy observability

Status target: internal only.

Allowed scope:

- Source policy observability.
- Source packet review.
- one internal, PAUSED, readback-first MembershipSaleV3 source record.
- SourceCreated event readback.
- Source lifecycle readback in docs/Register/Activity if implemented.
- No public source links.
- No default non-zero sourceId.
- No claim UI.

Exit criteria:

- Source packet approved.
- Terms/disclosure language approved.
- Readback shows source status PAUSED.
- No public buy path uses the source.

### V2: Controlled source-aware UX

Allowed only after V1:

- Controlled source links for test operators only.
- Source-aware quote and receipt preview.
- Internal source dashboard.
- Source terms, prohibited claims, tax responsibility, and disclosure copy.
- Fraud review checklist.
- Member-introduction test with explicit sourceId only.

Still blocked:

- Public referral program.
- Public dashboards.
- Claim UI.
- Product-wide attribution.

### V3: Public member/source program

Requires:

- Public source terms.
- Privacy/cookie/session disclosure.
- Source link/code system.
- Source dashboard.
- Source dispute and abuse process.
- Tax/payout policy.
- Legal/product signoff.
- No MLM/downline/passive-income framing.

Possible scope:

- Public member introduction.
- Builder source program.
- Approved partner/institutional source classes.
- Campaign analytics.
- Recognition separated from money terms.

### V4: Modular product attribution

Requires module-specific payment paths:

- ProductSaleRouter or equivalent.
- SwapRail attribution design.
- Archive wrapper or Archive1155 V2 attribution support.
- Premium/pass/marketplace source policy.
- Product-specific receipts, fee disclosures, refunds, taxes, and source rules.

Product-wide attribution remains future-only until each payment module supports it directly.

## 6. Legal / Sharia / Disclosure Translation

This section is issue-spotting only. It is not legal, tax, Sharia, or regulatory advice.

Before any public activation, The Syndicate likely needs:

- Source terms or affiliate/source agreement.
- Prohibited promotion rules.
- No agency, employment, broker, advisor, representative, or official-spokesperson implication unless separately approved.
- Clear commission disclosure.
- Tax responsibility language.
- Fraud and abuse rules.
- Privacy/tracking notice for links, cookies, sessions, analytics, or emails.
- Payout/escrow terms.
- Pause, revoke, modification, and recovery rights.
- No passive income, no yield, no MLM, no downline, no guaranteed income, no ROI, no appreciation, no revenue share, no equity, no governance promise.
- Sharia-safe framing as acquisition/service commission for a verified introduction, not return on capital.

Implementation implications:

- Public source links should not exist before source disclosures exist.
- Source dashboards should distinguish recognition from money terms.
- Commission should be shown as acquisition cost, not reward yield.
- Receipts should show acquisition commission and Net USDC Routed, not obscure economics.
- Builder/source recognition should ask what the participant helped the institution become, not only how much money was earned.

## 7. Abuse / Fraud Model

| Threat | Current protection | Missing protection | Future guard |
|---|---|---|---|
| Self-referral | MembershipSaleV3 blocks source buyer/referrer overlap | Public UX explanation | Test and source-link validation |
| Source wallet equals buyer | Contract guards for member introduction paths | Link/session guard | Reject and log attempt |
| Payout wallet equals buyer | Needs policy review per source | Source packet rule | Manual approval or disallow by class |
| Sybil buyers | Caps and member seat checks help but do not solve | Identity/quality signals | Risk scoring before public program |
| Wash buys | Costly but possible | Pattern review | Delayed payouts or manual review for source classes |
| Link hijacking | Not live | Attribution policy | First-touch/window rules, source lock, disclosure |
| Last-click stealing | Not live | Source conflict rules | Avoid last-click default unless policy-approved |
| Fake partner claims | No public sources | Verification surface | Public source status/readback page later |
| Fake official representative claims | No source program live | Source terms and enforcement | Explicit no-agency language |
| Public source impersonation | No links live | Verified source directory | Source page with status and wallet readback |
| Cap abuse | Contract caps | Analytics | Cap readbacks and alerts |
| Bot traffic | No public links | Tracking/fraud layer | Bot scoring, rate limits, manual review |
| Paid traffic disclosure | No public campaign | Policy | Required source disclosures |
| Jurisdiction risk | Not public | Legal review | Geography/source class rules |
| Claim abuse | Claim UI inactive | Claim policy | Status-gated claims, readback, logs |
| Escrow confusion | Contract fallback exists | UX/legal copy | Explain escrow as failed-payout fallback, not guaranteed passive income |

## 8. Anti-Drift Rules

- No fake referral activation.
- No public source links before active source record.
- Do not create public source links before an active source record.
- No claim UI before legal/escrow/readback maturity.
- No source ownership of members.
- No agency implication.
- No MLM/downline/passive-income framing.
- No product-wide attribution unless the payment path supports it.
- No Archive/NFT attribution without wrapper/router support.
- No SwapRail attribution without provider, fee, disclosure, and routing review.
- No ProductSaleRouter attribution until ProductSaleRouter exists and emits reconstructable receipts.
- No CommissionRouterV1 as V3 engine.
- No referral leaderboard that turns the protocol into a casino-like growth game.
- Recognition and money terms must stay separate.
- Public/default buys must continue to use ZERO_SOURCE_ID until activation is explicitly approved.
- Source records are policy objects; they do not grant identity, seat count, governance, yield, equity, or member ownership.

## 9. Recommendation

This audit strengthens the current path instead of replacing it.

Recommended next priority order:

1. Keep the first internal source packet as the next source-attribution milestone.
2. Keep the SaaS-derived source packet fields as the minimum standard before any future source record or source activation ceremony:
   - source purpose
   - source class
   - payout wallet
   - prohibited promotion rules
   - public/private visibility
   - commission disclosure copy
   - tax responsibility note
   - privacy/tracking note, even if no tracking is live
   - attribution scope/window/caps
   - pause/revoke/recovery process
   - no-agency/no-employment/no-yield/no-MLM acknowledgment
   - source dashboard status: not live
   - claim UI status: not live
3. Keep the existing internal, PAUSED, readback-first MembershipSaleV3 source record as policy truth only.
4. Keep readback recorded in Source Policy Observability, Register/Activity docs, and source packet files.
5. Do not activate the source in the same ceremony.
6. Defer public links, public referral, claim UI, dashboards, coupon/code attribution, product-wide attribution, and campaign mechanics.

The first PAUSED source path remains the recommendation because it tests the hardest truth boundary with the least public risk: can the protocol record a source policy transparently, keep it paused, read it back, and preserve public/default ZERO_SOURCE_ID buys? That is the right foundation before adding links, UX, or public acquisition psychology.

## Sources Used

- PartnerStack: https://partnerstack.com/
- Impact.com: https://impact.com/
- Everflow: https://www.everflow.io/
- Rewardful: https://www.rewardful.com/
- FirstPromoter: https://firstpromoter.com/
- ReferralCandy: https://www.referralcandy.com/
- Friendbuy: https://www.friendbuy.com/
- Tapfiliate: https://tapfiliate.com/
- GrowSurf: https://growsurf.com/
- Viral Loops: https://viral-loops.com/
- Mention Me: https://www.mention-me.com/
- Extole: https://www.extole.com/
- Affise: https://affise.com/
- RedTrack: https://www.redtrack.io/
- Tolt: https://tolt.com/
- Post Affiliate Pro: https://www.postaffiliatepro.com/
- InviteReferrals: https://www.invitereferrals.com/
