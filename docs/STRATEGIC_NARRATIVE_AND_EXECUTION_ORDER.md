# The Syndicate Strategic Narrative And Execution Order

Status: OPERATIONAL DECISION / EXECUTION ORDER / NO TRANSACTION AUTHORIZED

Last updated: 2026-06-22

Starting source: full site / full protocol baseline audit at commit `0971dc8cc3969ad44066e3c56147ebd7594a5245`.

This document is not a new audit. It converts the current canon, the full-site
baseline audit, the pre-referral audit, the module standard, the organism graph,
and deferred-work ledgers into a practical execution spine.

It does not authorize:

- a mainnet transaction,
- a source record,
- referral/source activation,
- claim UI,
- non-zero source IDs in the public/default buy flow,
- contract deployment or contract changes,
- funding movement,
- V2b recovery,
- registry switch,
- Replit/production publish,
- wallet signing,
- SwapRail, SeatRecord721, ERC-721, Archive1155 V2, NFT sale wrapper, or
  ProductSaleRouter implementation.

## 1. Current Syndicate Truth

The Syndicate is a verifiable on-chain membership institution.

The current product truth is:

- SYN is the V1 seat.
- A wallet is seated when it holds SYN.
- The seat is binary; contribution is variable.
- Member count is not economic scale.
- MembershipSaleV3 is deployed, funded, owner accepted, and the repository
  direct-buy target.
- Public/default V3 buys use `ZERO_SOURCE_ID`.
- SourceRegistryV1 is deployed and owner accepted, but has zero source records.
- Referral/source attribution is infrastructure, not a live referral program.
- Claim UI is inactive.
- Archive1155 is live protocol memory.
- Archive1155 does not accept `sourceId`.
- SeatRecord721 is a future identity record, not live and not the seat.
- SwapRail and ProductSaleRouter are future/not implemented.
- Activity is the heartbeat.
- My Syndicate is member home.
- Institutional Register preserves durable truth.
- Chronicle turns only material events into history.
- Future modules must pass `docs/MODULE_INTEGRATION_STANDARD.md` before code.

The current product bottleneck is not contract design. It is public truth
coherence: active surfaces still contain old fixed-rate / V1-V2 language while
V3 uses deterministic era pricing.

## 2. Narrative Core

### One-Sentence Version

The Syndicate is a transparent on-chain membership institution where holding SYN
seats a wallet, every membership purchase creates a verifiable receipt, and the
institution's activity becomes public memory over time.

### 30-Second Version

The Syndicate lets a wallet take a seat by acquiring SYN. The purchase routes
USDC transparently, delivers SYN, and leaves a public on-chain receipt. Members
return to My Syndicate to see their seat, activity, chapter, receipts, Archive
memories, and the institution's progress. V3 direct buying is live in the
repository path; source attribution exists as deployed infrastructure but is not
activated yet.

### Two-Minute Version

The Syndicate is not a token sale page, NFT drop, or dashboard. It is a
membership institution built around verifiable public action.

A member takes a seat by holding SYN. The seat is binary: a wallet is seated or
not. Contribution depth is variable: a 5 USDC participant and a larger
participant both hold one seat, but their SYN acquired, routing impact, rank
progression, and historical footprint differ.

MembershipSaleV3 makes the purchase path richer and more transparent. Every V3
receipt can show gross USDC, source/acquisition cost when active, net routed
USDC, Vault/Liquidity/Operations routing, SYN delivered, era, chapter, buyer,
recipient, and receipt version.

The site should make the simple path obvious: take a seat, receive SYN, verify
routing, return to My Syndicate, and watch the institution become history.

### Ten-Minute Founder Narrative

Most crypto products ask users to trust a story and later verify fragments of it.
The Syndicate inverts that. It starts with public on-chain truth and builds the
story from what can be verified.

The first product is membership. SYN is the V1 seat. The seat is the identity
unit; contribution depth is not the same as member count. A member does not buy
multiple seats. A member takes a seat, contributes at whatever depth they choose,
and becomes part of the institution's recorded history.

The institution has multiple layers. Membership entry is the door. Activity is
the heartbeat. My Syndicate is home. The Register preserves durable truth.
Chronicle gives meaning to material turning points. Archive1155 preserves
protocol memory as artifacts. Source attribution is an acquisition layer, not the
business model. Future modules like SeatRecord721, SwapRail, AI, product
commerce, or premium tools must earn their way in through the module standard.

The company and protocol are distinct but narratively connected. Legal reviews,
audits, infrastructure milestones, source policies, and future company formation
can become institutional memory only when they materially increase trust,
capability, resilience, or history. The goal is not radical accounting theater.
The goal is meaningful institutional memory.

The next execution step is simple: make the public product tell V3 truth. Old
fixed-rate copy must be replaced with deterministic era-pricing language. Only
then should the latest frontend be published and live-wallet QA performed. Only
after that should the first internal source packet move toward a PAUSED source
record ceremony.

### CTO Technical Narrative

The current architecture has a clear live path and a clear inactive source
boundary.

MembershipSaleV3 is deployed and funded. The frontend direct-buy path resolves
to V3, quotes V3 with `ZERO_SOURCE_ID`, approves the same sale target it buys
from, and guards historical wallets from direct V3 buy unless the historical
proof flow exists.

SourceRegistryV1 is deployed but has zero records. A non-zero source path is
technically possible only after a founder-approved source packet, a PAUSED-first
source record ceremony, readback, and a separate activation decision. No current
public/default buy uses non-zero source ID.

The read model preserves V3 events. `MembershipPurchasedV3` events are parsed,
V3 source labels survive cache restore, and unknown future source labels are
rejected instead of silently relabeled.

The remaining engineering risk is mostly release/product coherence: stale fixed
pricing copy, source-policy read-model gaps before activation, and production
publish/live wallet QA.

### Average-User Explanation

The Syndicate is a membership you can verify on-chain. You connect a wallet,
take a seat by acquiring SYN, and receive a public receipt. The site shows what
happened, where the money routed, and how your seat fits into the growing
institution.

No special crypto promise is needed. The point is: you can join, verify the
action, and return later to see what changed.

### Crypto-Native Explanation

The Syndicate is an Avalanche C-Chain membership protocol. SYN is the live seat
token. MembershipSaleV3 is the current direct-buy sale engine. USDC routing and
SYN delivery are receipt-backed. V2b is paused/historical. SourceRegistryV1 is
deployed with zero source records; referral/source attribution is not public
live. Archive1155 is live for protocol-memory artifacts and is not source-aware.

The product is strongest when every claim maps to contract, event, registry,
read model, or PENDING state.

### Non-Crypto User Explanation

Think of The Syndicate as a public membership register that runs on blockchain
rails. Joining creates a permanent public receipt. The site helps you understand
your seat, what happened when you joined, and how the institution is developing.

You do not need to understand every contract to understand the core action:
take a seat, receive SYN, verify the receipt, and return to your member home.

### Investor / Fundraising-Style Narrative With Legal Caution

The Syndicate is building a transparent membership institution where acquisition,
routing, identity, activity, and institutional memory can be verified publicly.
The initial product is low-friction membership, but the long-term business model
is layered: membership entry, premium member tools, source/partner channels,
institutional services, AI/product modules, and future product commerce.

This must not be presented as equity, revenue share, yield, governance rights,
or a promise of financial return. The investable-looking part of the story is
operational discipline: public receipts, transparent routing, modular product
gates, activation ceremonies, and a culture of verified truth before scale.

### Press Release Style Summary

The Syndicate is developing a transparent on-chain membership institution on
Avalanche. Members take a seat by holding SYN, verify purchase receipts and
routing, and return through My Syndicate to follow activity, chapters, Archive
memory, and institutional milestones. Its V3 membership engine is designed to
make purchases, routing, and future acquisition attribution reconstructable from
on-chain events while keeping inactive systems clearly labeled.

### Podcast Intro

The Syndicate is a crypto membership project trying to make the institution
itself verifiable. Instead of asking people to trust a founder story, it records
membership, routing, activity, and eventually institutional milestones in public.
The core idea is simple: SYN is the seat, Activity is the heartbeat, Archive is
memory, and My Syndicate is where a member returns to see what the institution
has become.

### Community / Member Explanation

You joined by taking a seat. That seat has a number, a chapter, receipts, and
history behind it. The member home should show what changed since you joined,
what the protocol did recently, which memories exist, and what is still pending.
Source attribution, SeatRecord721, SwapRail, and future modules remain pending
until they pass their gates.

### Partner / B2B Explanation

The Syndicate can eventually support verified source or partner attribution for
membership purchases, but not as a hidden affiliate layer. A source policy must
be explicit, read back, visible, and limited to the payment path that actually
supports it. SourceRegistryV1 can store source policy for MembershipSaleV3, but
it does not automatically make Archive, SwapRail, or future products
source-aware.

### Sharia-Conscious Explanation

The Syndicate should be explained as transparent membership and verifiable
participation, not yield, lending, passive income, interest, revenue share, or
financial entitlement. SYN is the membership seat. Archive artifacts are memory.
Source attribution, if later activated, is an acquisition cost disclosed in a
purchase receipt, not passive income. Any formal Sharia position would require
qualified review; the product copy should stay conservative until then.

## 3. What To Say / What Not To Say

### Say

- "Take a seat."
- "SYN is the V1 seat."
- "Holding SYN seats the wallet."
- "The seat is binary; contribution is variable."
- "Every purchase creates a receipt."
- "V3 direct buys use zero source ID unless an approved source path exists."
- "Source attribution is infrastructure, not live referral."
- "Archive artifacts are protocol memory."
- "My Syndicate is member home."
- "Register and Chronicle preserve institutional truth."
- "Future modules must pass the module standard."

### Do Not Say

- "Referral is live."
- "Claim your commission."
- "Earn passive income."
- "A source owns a member."
- "Archive/NFT source commission is live."
- "SwapRail is live."
- "SeatRecord721 is live."
- "SeatRecord721 replaces SYN."
- "NFTs carry financial rights."
- "Rank is a wealth leaderboard."
- "One member equals one fixed economic value."
- "SourceRegistry makes every product source-aware."
- "V3 is fully activated with referral."

## 4. Scenario Presentation Pack

### 1. CEO / Founder Presenting To A Serious Investor

What to say:

- The Syndicate is building verifiable membership infrastructure and a layered
  institution, not relying on one entry-price model.
- The moat is transparency plus discipline: every meaningful step must map to
  contract, event, receipt, register, or clear PENDING state.
- The current bottleneck is public truth cleanup and live QA, not new contract
  invention.

What not to say:

- Do not pitch SYN as equity, yield, governance, revenue share, or return.
- Do not imply source/referral revenue is live.
- Do not imply Swiss/company formation milestones are guaranteed.

Proof points:

- V3 sale deployed/funded.
- SourceRegistry deployed with zero records.
- Archive1155 live memory layer.
- 70/20/10 routing doctrine.
- Audit found P0 = 0 and next sprint is truth cleanup.

Likely objection:

- "Is this just a token sale?"

Best answer:

- The token is the seat, not the whole business. The institution is the system
  around the seat: receipts, routing, Activity, Register, Archive, source policy,
  and future member/product layers.

CTA:

- Review the public product after V3 truth cleanup and live wallet QA.

### 2. CTO Presenting To A Technical Reviewer

What to say:

- V3 has a specific direct-buy path and a separate inactive source boundary.
- Public/default buy passes `ZERO_SOURCE_ID`.
- SourceRegistryV1 has no records; source activation is ceremony-gated.
- Event/cache/read models preserve V3 source family.

What not to say:

- Do not say the source system is activated.
- Do not call V2b the active buy target.
- Do not claim generic product attribution.

Proof points:

- MembershipSaleV3 and SourceRegistryV1 deployment/readback docs.
- Foundry and production guard tests.
- Purchase-event cache V3 preservation.
- Module Integration Standard.

Likely objection:

- "Why not activate referral now if the contracts can do it?"

Best answer:

- Because source policy is not just a contract capability. It needs packet,
  readback, Activity/Register visibility, source-aware receipt UX, and legal copy.

CTA:

- Review V3 truth cleanup and source-packet gates before any source ceremony.

### 3. Founder Explaining To An Average Non-Crypto User

What to say:

- You take a seat by acquiring SYN.
- The receipt is public.
- The member home shows your place and what changed.

What not to say:

- Do not lead with contract names, wallets, era caps, or acquisition routing.

Proof points:

- Public receipt.
- Explorer link.
- My Syndicate member home.

Likely objection:

- "Why would I come back?"

Best answer:

- Because the institution keeps moving behind your seat: new members, activity,
  memories, chapters, and milestones.

CTA:

- Visit Join, then My Syndicate after connecting.

### 4. Founder Explaining To A Crypto-Native User

What to say:

- Avalanche C-Chain.
- SYN ERC-20 is the seat.
- MembershipSaleV3 is the current direct-buy target.
- SourceRegistryV1 exists but has zero source records.
- V2b is paused/historical.
- Archive1155 is live memory.

What not to say:

- Do not blur live V3 direct buy with live referral/source attribution.

Proof points:

- Contract addresses in Registry.
- V3 receipt event.
- Avascan links.
- 70/20/10 routing.

Likely objection:

- "Why should I trust the site?"

Best answer:

- You should not rely on the site alone. Use the registry and explorer links to
  verify contract addresses, purchase receipts, and routing.

CTA:

- Verify Registry, Transparency, and the active sale target.

### 5. Press Release / Media Article

What to say:

- The Syndicate is building a transparent membership institution with on-chain
  receipts, public routing, and a member home.
- V3 infrastructure improves receipt clarity and future acquisition attribution
  readiness.

What not to say:

- Do not frame it as an investment launch, NFT drop, or referral program.

Proof points:

- V3 sale and SourceRegistry deployment.
- Archive1155 memory layer.
- Public Register/Transparency.

Likely objection:

- "Is this just another crypto community?"

Best answer:

- The difference is verifiability: membership, routing, and institutional memory
  are designed to be public and reconstructable.

CTA:

- Explore the public Registry and Join page after V3 truth cleanup is published.

### 6. Podcast Intro And Interview Talking Points

What to say:

- Start with "SYN is the seat; artifacts are memory."
- Explain why public receipts matter.
- Explain why the product is a living institution, not a dashboard.

What not to say:

- Avoid price speculation and source/referral income.

Proof points:

- Member number, chapter, receipt, Activity, Register, Archive.

Likely objection:

- "Is this too complex for normal users?"

Best answer:

- The user path is simple: take a seat, receive SYN, verify, return home. The
  deeper proof is available for people who want it.

CTA:

- Tell listeners to start at Join and Registry.

### 7. Community / Member Update

What to say:

- V3 direct-buy infrastructure is in place.
- Source attribution is still inactive.
- The next sprint cleans public V3 truth before broader publishing.

What not to say:

- Do not promise referral activation dates or source commissions.

Proof points:

- Current GitHub main.
- Audit P0 = 0.
- SourceRegistry zero records.

Likely objection:

- "When referral?"

Best answer:

- After V3 public truth cleanup, live QA, source packet approval, PAUSED source
  ceremony, source read model, receipt UX, legal copy, and activation ceremony.

CTA:

- Help test the published V3 Join path when it is ready.

### 8. Strategic Partner / B2B / Whitelabel Conversation

What to say:

- The system can support approved source policy for MembershipSaleV3, but only
  after explicit terms, metadata, status, caps, and readbacks.
- Partner/source policy does not automatically apply to every product.

What not to say:

- Do not imply official representation, agency, or product-wide attribution.

Proof points:

- SourceRegistryV1 source classes.
- Source packet template.
- Module Integration Standard.

Likely objection:

- "Can we get custom terms?"

Best answer:

- Custom source terms are possible in principle, but only through a visible
  source policy record and approved packet. No hidden manual payouts.

CTA:

- Draft a source packet, not a public campaign.

### 9. NFT Collector / Archive Explanation

What to say:

- Archive artifacts are memory objects.
- ID 1 and ID 3 are live public mints.
- Other IDs are sealed, owner-only, reserved, or future.
- SeatRecord721 is separate future identity.

What not to say:

- Do not imply artifacts are seats, financial rights, or source-aware purchases.

Proof points:

- Archive1155 canonical architecture.
- On-chain reads for artifact states.

Likely objection:

- "Are these NFTs investments?"

Best answer:

- They are collectible protocol memories with no financial rights.

CTA:

- View Archive/NFT pages and verify artifact state.

### 10. Future SwapRail / Utility-Module Explanation

What to say:

- SwapRail is design-only until provider, fees, risk, receipt, source posture,
  and Activity/My Syndicate behavior are defined.

What not to say:

- Do not say SwapRail is live or that swapping creates membership.

Proof points:

- Module Integration Standard.
- Protocol Organism Graph non-edges.

Likely objection:

- "Why not add it quickly?"

Best answer:

- Utility modules can create user-fund risk and hidden-fee risk. They must pass
  the module standard before code.

CTA:

- Run a design-only module intake when V3 public truth and source gates are
  stable.

### 11. Sharia / Legal Cautious Explanation

What to say:

- The public framing is membership, receipt, transparency, and memory.
- No yield, interest, passive-income, equity, or revenue-rights framing.
- Source attribution is acquisition cost only when contract terms and receipts
  prove it.

What not to say:

- Do not claim formal compliance without qualified review.

Proof points:

- Banned-copy doctrine.
- Legal disclosure docs.
- No claim UI/source activation.

Likely objection:

- "Is commission problematic?"

Best answer:

- It must be reviewed. Product copy should describe it only as a disclosed
  acquisition cost/source commission when live and proven by receipt.

CTA:

- Freeze legal/product copy before source activation.

### 12. Replit / Public Launch Explanation After V3 Truth Cleanup

What to say:

- The public site now explains the V3 sale truth and has passed release gates.
- Live QA verified V3 target, approval spender, buy target, historical guard, and
  no live source/claim UI.

What not to say:

- Do not say referral is live.

Proof points:

- `npm run check-release`.
- Live `/join` wallet QA.
- Activity/My Syndicate V3 cache preservation.

Likely objection:

- "Is it safe to buy?"

Best answer:

- Users should verify the contract addresses, active sale target, and wallet
  prompts before signing. The site explains what approval and buy do.

CTA:

- Publish only after checklist green.

### 13. Referral / Source Explanation Before Activation

What to say:

- Source attribution infrastructure exists, but no source records are active.
- Public/default buys use zero source ID.
- No commission accrues and no claim UI exists.

What not to say:

- Do not use referral earnings, claim, reward, or source-link language as live.

Proof points:

- SourceRegistry zero records.
- Referral route pending/noindex.
- V3 direct-buy code uses `ZERO_SOURCE_ID`.

Likely objection:

- "Can I refer someone?"

Best answer:

- Not as a live commission system yet. Sharing can happen socially, but source
  attribution requires a future approved source path.

CTA:

- Wait for source activation; do not use non-official source links.

### 14. Referral / Source Explanation After A Future PAUSED Source Record

What to say:

- A source policy record exists but is PAUSED.
- It proves policy creation and readback, not public activation.
- No source-linked purchase path or claim is live.

What not to say:

- Do not say referral is live or commission is accruing.

Proof points:

- `SourceCreated` event.
- `sourceConfig(sourceId).status = PAUSED`.
- Register/Activity readback.

Likely objection:

- "Why create it paused?"

Best answer:

- PAUSED-first creation proves policy state safely before any source can affect
  purchases.

CTA:

- Complete readback, copy, UI, and separate activation ceremony.

## 5. Deferred Work Triage

| Deferred / skipped idea | Current status | Still valuable? | Obsolete? | Blocked by | Module type | Risk | Next action | Priority | Sprint candidate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V3 public truth cleanup | Audit P1 | Yes | No | None | Product truth | High if delayed | Execute now | P1 | Immediate next sprint |
| Replit publish + live wallet QA | Conditional GO | Yes | No | Truth cleanup preferred first | Release | High if skipped | Execute after cleanup | P1 | Publish QA |
| Join/FAQ/mobile fixed-rate copy cleanup | Active drift | Yes | Old fixed-rate doctrine obsolete | None | Copy/doctrine | High | Execute now | P1 | V3 truth cleanup |
| Tokenomics/whitepaper/eras V3 pricing cleanup | Active drift | Yes | Old same-rate copy obsolete | None | Docs/education | Medium-high | Execute now or same batch | P1/P2 | V3 truth cleanup |
| Guard against old fixed-rate V3 drift | Missing guard | Yes | No | Copy cleanup target | Test/guard | Medium | Add with cleanup | P1 | V3 truth cleanup |
| MyReferralCard CommissionRouter language | Active pending drift | Yes | Operations-slice V3 framing superseded | V3 source doctrine | Member OS copy | Medium-high | Update after/with truth cleanup | P2 | Referral copy cleanup |
| First internal source packet | Draft | Yes | No | Founder inputs/legal/product approval | Source attribution | High | Complete after publish QA | P1 | Source packet finalization |
| Fresh QuickNode source fork/readback | Needed before ceremony | Yes | No | Source packet | Security/release | High | Run before any source tx | P1 | Source ceremony preflight |
| PAUSED source record | Conditional later | Yes | No | Packet, fork, readback, approval | Source policy | High | Ceremony only after gates | P1 | PAUSED source ceremony |
| Source policy Activity/Register read model | Not first-class | Yes | No | PAUSED source readback | Read model | Medium-high | Build after record or just before activation | P2 | Source lifecycle read model |
| Source-aware quote/receipt UI | Not built | Yes | No | PAUSED record, legal copy | Frontend UX | High | Build non-public first | P1 | Source receipt UX |
| Referral activation | No-go | Yes later | No | Source UI, legal, tests, activation ceremony | Growth | High | Defer | P1 later | Referral activation |
| Claim UI | No-go | Maybe later | No | Escrow readback, source status, legal copy | Source/escrow | High | Defer | P2 later | Claim readiness |
| AI boundary cleanup | Pending page + possible API | Yes | No | V3 truth cleanup and release priorities | AI module | Medium | Cleanup after publish path | P2 | AI boundary sprint |
| Member OS return briefing | Missing return loop | Yes | No | V3 truth/publish first | Member OS | Medium | Build after public truth stable | P2 | Return briefing |
| Notifications | Future | Yes | No | Event/read-model maturity | Member OS | Medium | Design later | P3 | Notifications design |
| Institutional Trust Capital read model | Canonical concept | Yes | No | Activity/Register/Chronicle model | Recognition/memory | Medium | Design after core loops stable | P3 | Trust capital design |
| SeatRecord721 design | Spec frozen | Yes | No | Founder decisions on transfer/recovery/secondary holders | Identity | High | Design-only later | P2 | SeatRecord design |
| SeatRecord721 Solidity | Future/no-go | Yes later | No | Design, tests, audit, approval | Contract | High | Defer | P1 later | Not now |
| Archive future IDs | Roadmap | Yes | Some old docs obsolete | On-chain artifact decisions | Archive memory | Medium | Design-only | P3 | Archive roadmap |
| Archive1155 source attribution | Current no-edge | Maybe later | Current-contract attribution obsolete | Wrapper/router design | Archive commerce | High | Defer | P3 | Future wrapper/product router |
| SwapRail | Future/not implemented | Yes later | No | Module intake, provider review, risk copy | Utility | High | Design-only later | P3 | SwapRail design |
| ProductSaleRouter | Future/not implemented | Yes only when needed | Premature now | At least two mature paid product lines | Commerce contract | High | Defer | P3 | Not now |
| Privy Phase 0 | Planned | Yes | No | Wallet/identity policy, product priority | Onboarding | Medium | Plan after V3 publish/source stability | P3 | Privy planning |
| Dedicated RPC/indexer | Approved direction | Yes | No | Traffic scale, schema, provider | Infrastructure | Medium | Defer until real read-scale pressure | P3 | Indexer design |
| Protocol Search | Approved direction | Yes | No | Indexer | UX/search | Low-medium | Defer | P3 | Later |
| Genesis Seat Certificates | Approved direction | Yes | No | Member profile/OG polish | Identity/share | Medium | Defer | P3 | Later |
| Protocol Timeline | Approved direction | Yes | No | Indexer/completeness flags | Memory | Medium | Defer | P3 | Later |
| Playwright / screenshot tests | Deferred | Yes | No | CI/browser runner | QA | Medium | After publish | P2 | Visual QA |
| Full wallet session migration | Deferred | Maybe | No | Active issues/user signals | Tech cleanup | Medium | Defer | P3 | Cleanup |
| Non-write explorer consolidation | Deferred | Yes | No | Truth cleanup priority | Proof UX | Low-medium | Defer | P3 | Cleanup |
| Build-output doctrine scanner | Deferred | Yes later | No | SSR/dynamic-copy risk | CI | Medium | Defer | P3 | CI hardening |
| V2b recovery ceremony | Future boundary | Yes eventually | No | Separate founder ceremony | Ops/contract | High | No action now | P2 later | Recovery packet |
| Contract comment/Remix JSON hygiene | Audit P2 | Yes | No | Not behavior blocking | Docs/contracts comments | Medium | Later docs/code hygiene | P2 | Hygiene |
| Historical docs quarantine | Ongoing | Yes | No | Large doc corpus | Docs | Low-medium | Later | P3 | Docs hygiene |

## 6. Obsolete Or Superseded Ideas

These ideas should not guide current execution:

1. Fixed same-rate V3 doctrine.
2. V2b as public active buy target.
3. CommissionRouterV1 as the V3 acquisition engine.
4. Operations-slice-only referral as the current V3 model.
5. SourceRegistry implying product-wide attribution.
6. Archive1155 mints as source-aware.
7. Archive1155 ID 2 as SeatRecord mint.
8. SeatRecord721 as live or as replacement for SYN.
9. First 100 / First 500 / First 1000 chapter doctrine.
10. Founder/Genesis Circle as rank names.
11. Referral preview simulations as public truth.
12. Claim UI before source records/escrow/legal/status readback.
13. SwapRail as live or as membership purchase.
14. ProductSaleRouter before concrete product demand.

## 7. Execution Sequence From Here

### Phase 1 - V3 Public Truth Cleanup

Scope:

- Join
- FAQ
- mobile join bar
- tokenomics
- whitepaper
- eras copy
- My Syndicate pending referral wording if in the same truth family
- production coherence guards against old fixed-rate V3 drift

Why first:

- The public product must explain the live sale truth before Replit publish,
  source packet ceremony, or referral work.

### Phase 2 - Replit Publish And Live Wallet QA

Scope:

- Pull GitHub main.
- Run `npm run check-release`.
- Build.
- Publish only if green.
- Verify live `/join` targets V3, not paused V2b.
- Verify approval spender equals V3.
- Verify buy call uses `ZERO_SOURCE_ID`.
- Verify historical wallet guard.
- Verify non-historical quote path.
- Verify no source/claim UI live.
- Verify V3 event/cache behavior after reload.

Why second:

- Source ceremony and public communication should not proceed while production
  truth is uncertain.

### Phase 3 - First Internal Source Packet Finalization

Scope:

- Source wallet.
- Payout wallet.
- Source ID.
- Metadata hash.
- Commission bps.
- Scope/window/caps/repeat setting.
- Legal/product copy posture.
- Founder approval.

Why third:

- SourceRegistry can support it, but a source record is policy state and must
  not be improvised.

### Phase 4 - Source Ceremony Preflight

Scope:

- Fresh QuickNode fork.
- Fresh SourceRegistry zero-record readback.
- Confirm owner, chain, function, args, stop conditions.
- No transaction unless founder explicitly approves after preflight.

### Phase 5 - PAUSED Source Record Ceremony

Scope:

- Create exactly one approved source record with initial PAUSED status.
- No activation in same ceremony.
- Read back event and `sourceConfig`.
- Update Register/Activity docs/state only after readback.

### Phase 6 - Source Policy Read Model

Scope:

- Activity/Register surface for source created/paused/active/revoked events.
- No public commission claims.
- My Syndicate remains careful and non-live until source activation.

### Phase 7 - Source-Aware Quote And Receipt UI

Scope:

- Non-public or limited source-linked quote.
- Buyer can see source terms before signing.
- Receipt shows acquisition cost, Net USDC Routed, 70/20/10 amounts, source ID,
  source class, rate, caps/window state.
- Direct zero-source path remains default.

### Phase 8 - Referral / Source Activation

Only after:

- source record exists,
- source status intentionally ACTIVE,
- source UI and receipt UX are tested,
- legal/product copy approved,
- claim UI remains hidden unless separately approved,
- production build/release gate/live QA green.

### Phase 9 - Member OS Return Briefing

Scope:

- what changed since last visit,
- V3 receipt state,
- Archive memories,
- Activity/Chapter progress,
- source/trust-capital notices only when proven.

### Phase 10 - AI Boundary Cleanup

Scope:

- decide sitemap/API/page posture,
- no fake AI product activation,
- define AI cockpit as pending unless enabled with doctrine, limits, and safety.

### Phase 11 - Design-Only Future Modules

Order:

1. SeatRecord721 design-only.
2. SwapRail design-only.
3. Archive future IDs / wrapper options.
4. ProductSaleRouter only when real product need exists.

## 8. Immediate Next Sprint Recommendation

Immediate next sprint: V3 public truth cleanup.

Definition of done:

- `/join` no longer teaches fixed same-rate V1/V2 doctrine as current V3 truth.
- FAQ explains V3 deterministic era pricing simply.
- Mobile join copy no longer says same rate for everyone.
- Tokenomics/whitepaper/eras copy no longer says V3 era pricing requires a
  future sale contract.
- My Syndicate pending referral text does not teach CommissionRouter/Ops-slice
  V3 framing.
- Tests guard against reintroducing old fixed-rate V3 copy.
- `npm run check-release` passes.

What not to include:

- source record,
- referral activation,
- claim UI,
- non-zero source path,
- contract changes,
- production publish.

## 9. Requires Founder Approval

- any source record, even PAUSED,
- any source activation,
- any claim UI,
- any source-aware public buy link,
- V2b recovery,
- Replit publish,
- AI public activation,
- SeatRecord721 implementation,
- SwapRail implementation,
- ProductSaleRouter implementation,
- any legal/fundraising public claims,
- any source packet values.

## 10. Requires Ceremony

- V2b recovery,
- source creation,
- source activation,
- source pause/revoke/update if source records exist,
- payout wallet update,
- ownership/admin action,
- registry switch,
- funding movement,
- deployment.

## 11. Requires Legal / Product Review

- source/referral public copy,
- source packet legal posture,
- claim UI,
- partner/B2B/whitelabel language,
- AI public positioning,
- Swiss/company formation public claims,
- premium products,
- marketplace/product sales,
- any NFT/Archive sale language beyond current memory framing,
- Sharia-conscious public positioning.

## 12. Requires Replit / Public Publish

- any claim that the public site now points to V3,
- any public launch/update messaging,
- any live wallet QA result,
- any public source route status change,
- any source-aware UI becoming public.

## 13. Requires Design-Only First

- SeatRecord721,
- SwapRail,
- Archive source attribution,
- Archive1155 V2,
- NFT sale wrapper,
- ProductSaleRouter,
- AI cockpit,
- institutional services,
- premium products,
- marketplace,
- source dashboard/claim UI.

## 14. Must Not Be Built Yet

- public referral/source activation,
- source claim UI,
- source-aware public buy path,
- SourceRegistry source record without packet approval,
- SeatRecord721 Solidity,
- SwapRail implementation,
- ERC-721 implementation,
- Archive1155 V2,
- NFT sale wrapper,
- ProductSaleRouter,
- product-wide attribution,
- source-aware Archive minting,
- public AI assistant positioning,
- governance,
- hidden manual payout tooling.

## 15. Founder/Operator Rule

When choosing between the next "interesting" system and the next "truthful"
system, choose the truthful one.

Current truthful next action:

```text
V3 public truth cleanup -> Replit publish/live QA -> source packet finalization
```

Do not skip to source records, referral activation, SwapRail, SeatRecord721, or
ProductSaleRouter while the public Join/FAQ layer still teaches old sale truth.

