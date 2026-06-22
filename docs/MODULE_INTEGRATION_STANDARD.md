# Module Integration Standard

Status: CANONICAL ARCHITECTURE STANDARD / NO TRANSACTION AUTHORIZED

This document defines how new Syndicate modules must be classified, designed,
tested, disclosed, and activated before implementation. It exists to prevent
page-by-page product patches from creating fragmented payment paths, unclear
source attribution, stale receipts, or fake-live public states.

It does not authorize a mainnet transaction, source record, source-aware public
buy path, claim UI, smart-contract deployment, funding movement, V2b recovery,
registry switch, production publish, SwapRail implementation, SeatRecord721
implementation, NFT sale wrapper implementation, or any live activation.

## Why This Exists

The current source-attribution capability map established the boundary:

- SourceRegistryV1 is reusable policy infrastructure, not a universal payment
  router.
- MembershipSaleV3 is source-aware.
- Archive1155 is not source-aware.
- Future products are not source-aware unless their payment path reads
  SourceRegistryV1 or uses a future source-aware wrapper/router.

Therefore every future module must declare:

- what it is,
- what payment path it uses,
- whether it is source-aware,
- which receipt schema proves it,
- how it appears in Activity and My Syndicate,
- whether it can enter the Register, Chronicle, or Archive,
- what legal/disclosure posture applies,
- what tests and activation gates are required.

## Architecture Rule

No future module may be implemented as an isolated page patch.

Every new module must pass through this intake order before code:

1. Classify module type.
2. Identify payment path.
3. Identify contract dependencies.
4. Identify source-attribution posture.
5. Identify receipt/event schema.
6. Identify read-model consumers.
7. Identify UI routes/components.
8. Identify legal/disclosure status.
9. Identify SEO/content needs.
10. Identify conversion path and CTA hierarchy.
11. Identify tests and release gates.
12. Identify ceremony/activation boundaries.
13. Only then implement.

If a module cannot answer these questions, it stays planned or preview-only.

## Module Taxonomy

| Module type | Purpose | User job | Payment path | Contract dependency | Source attribution posture | Receipt/event requirement | Activity behavior | My Syndicate behavior | Register / Chronicle / Archive behavior | SEO/content need | Legal/disclosure need | Conversion role | Activation gate | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Membership sale | Seat a wallet with SYN and route USDC transparently | Take a seat; receive SYN; verify receipt | MembershipSaleV3 | SYN, USDC, SourceRegistryV1, MembershipSaleV3 | Source-aware contract, but public/default uses ZERO_SOURCE_ID until approved | MembershipPurchasedV3 rich receipt | Membership purchase heartbeat | Seat, wallet, receipt, contribution depth | Register all contract truth; Chronicle only material milestones | Join, docs, transparency | No equity, no guaranteed return, no source ownership | Primary conversion | Contract live, funded, registry active, guards green | Medium |
| Archive/NFT memory | Preserve protocol memory as artifacts | Mint or hold a memory object | Archive1155 today | Archive1155 | None today; future wrapper needed for source-aware commission | ERC-1155 mint event today; future Archive purchase receipt if source-aware | Artifact mint heartbeat | Artifact shelf and memory path | Archive is protocol memory; Chronicle only meaningful artifacts/milestones | Archive/NFT pages | NFT memory, not speculation or seat identity | Secondary belonging | Artifact configured, readback green, copy approved | Medium-high |
| Source/referral attribution | Attribute verified introductions and acquisition cost | See source policy and future source-linked receipts | No payment by registry alone | SourceRegistryV1 + a source-aware sale contract | Policy layer only unless product sale reads it | Source policy events plus product receipt events | Source policy actions and source-attributed purchases | Source contribution context only after approval | Register source policy; Chronicle only material source milestones | Referral/source pending docs | No member ownership, no investment-return framing, no official agency implication | Growth trust layer | Source packet, paused creation, readback, separate activation | High |
| Identity/SeatRecord | Durable identity record beyond V1 SYN seat | Preserve historical identity and chapter context | None until approved | Future SeatRecord721 | None until future design | Identity event schema TBD | Identity lifecycle when live | Identity record, migration/recovery posture | Register identity contract; Archive only memory-worthy events | Docs/identity | SYN remains V1 seat; no governance/equity/financial rights | Retention/trust | Constitution, contract, audit, recovery policy | High |
| SwapRail / bridge / trade | Help users move/swap assets around the ecosystem | Swap or bridge assets safely | External provider/API initially | Provider contracts/routes, not Syndicate sale by default | Read-model-only at first; do not use SourceRegistryV1 for commissions until separate design | SwapRail receipt or external tx proof, no membership receipt | Utility action if user opts in | Utility history, not seat contribution unless policy says so | Register provider dependency if material; Chronicle only major infrastructure milestones | Swap/bridge route, docs, risk page | Provider fees, slippage, bridge risk, jurisdiction, no membership purchase confusion | Utility + revenue candidate | Provider review, fee disclosure, QA, no hidden routing | High |
| Premium/pass/module sale | Sell future member tools or passes | Buy access to a tool/service | None today | Future product sale contract/router or off-chain checkout | Needs product-specific source posture | ProductPurchased receipt with productType/productId | Product purchase heartbeat | Access/pass panel | Register product contract if on-chain; Chronicle only material launch | Product route, docs | Access terms, no future-value claim | Expansion revenue | Product spec, receipt schema, legal copy | Medium-high |
| Marketplace/product sale | Sell approved products/items | Buy a listed item | None today | Future marketplace/router | Needs explicit product source terms | Marketplace/ProductPurchased receipt | Product sale and fulfillment events | Ownership/order history if member-relevant | Register marketplace contract; Archive only historical items | Marketplace route | Marketplace risk, seller terms, refunds, no speculation claims | Expansion revenue | Marketplace policy, audit, dispute model | High |
| B2B/whitelabel/partner | Institutional source/channel/service layer | Partner or channel contributes acquisition or services | MembershipSaleV3 for SYN buys today; future product contracts later | SourceRegistryV1 for membership terms; future product terms may need V2 | Source-aware for membership only unless expanded | Source policy plus product receipts | Partner/source actions after approval | Contribution context, not public authority by default | Register approved source policy; Chronicle material partnerships only | Partner docs may be private/public | Agency/representation/disclosure boundaries | Growth/institutional | Packet, legal approval, status readback | Medium-high |
| Off-chain/manual institutional event | Record important company/protocol milestone | Understand what institution became | Off-chain/company-level | None unless later recorded on-chain | No automatic source commission | Register/Chronicle evidence packet, not purchase receipt | Milestone heartbeat if verified | Return briefing/context | Register, Chronicle, Archive only if materially meaningful | Docs/register | Protocol/company distinction | Trust capital | Evidence and founder approval | Medium |
| Chronicle/Register/Archive memory | Preserve institutional truth and meaning | See what mattered | No direct sale path | Existing read models and Archive1155 | Not payment attribution | Memory candidate/admission events or evidence | Curated heartbeat | Member memory path | Register/Chronicle/Archive core | Knowledge/docs | Historical truth, not marketing hype | Retention/trust | Admission rules and evidence | Medium |
| Treasury/liquidity/accounting | Show routed funds, balances, liquidity, operations | Verify money movement | Contract/wallet reads | USDC, SYN, LP, sale contracts, wallets | Source attribution only if receipt provides it | Routing/LP/treasury events and readbacks | Economic heartbeat | Receipt/routing proof | Register economic truth; Chronicle material thresholds only | Transparency/liquidity | No entitlement to treasury/assets | Trust/conversion | Live reads and proof links | Medium |
| Analytics/dashboard | Help operators and members understand activity | Read patterns, health, returns | None by default | Read models/indexers | Can report source-attributed receipts only after on-chain proof | Derived analytics, not source of truth | Optional summaries | Member OS insights | Not Register truth unless evidence-backed | Internal or public dashboards | Privacy, no wallet-as-private-profile drift | Retention/operator | Privacy review and data source map | Medium |

## Module Manifest Standard

Each new module must be described with this manifest before implementation.
The manifest may live in a doc first. A TypeScript registry may be added later
when at least two new modules need runtime discovery.

```ts
type SyndicateModuleManifest = {
  moduleId: string;
  moduleName: string;
  moduleType:
    | "membership-sale"
    | "archive-memory"
    | "source-attribution"
    | "identity-seat-record"
    | "swaprail-bridge-trade"
    | "premium-pass-sale"
    | "marketplace-product-sale"
    | "b2b-whitelabel-partner"
    | "offchain-institutional-event"
    | "chronicle-register-archive-memory"
    | "treasury-liquidity-accounting"
    | "analytics-dashboard";
  lifecycleStatus:
    | "planned"
    | "preview"
    | "local-only"
    | "deployed"
    | "funded"
    | "active"
    | "paused"
    | "inactive"
    | "deprecated";
  publicStatus:
    | "hidden"
    | "preview"
    | "public-read-only"
    | "public-actionable";
  routePaths: string[];
  primaryCTA: string | null;
  secondaryCTA: string | null;
  paymentRequired: boolean;
  paymentAsset: "USDC" | "SYN" | "AVAX" | "external-provider" | "none";
  paymentContract: string | null;
  sourceAttributionSupport:
    | "none"
    | "read-model-only"
    | "source-aware-contract"
    | "future-wrapper-needed";
  receiptSchema:
    | "MembershipPurchasedV3"
    | "ArchiveMint"
    | "ProductPurchased"
    | "SwapRailReceipt"
    | "RegisterEvidence"
    | "none";
  eventSources: string[];
  readModelConsumers: Array<"Activity" | "MySyndicate" | "Register" | "Chronicle" | "Archive" | "Dashboard">;
  activityBehavior: string;
  mySyndicateBehavior: string;
  registerBehavior: string;
  chronicleBehavior: string;
  archiveBehavior: string;
  legalCopyStatus: "not-required" | "draft" | "approved" | "blocked";
  shariaRiskStatus: "none" | "low" | "medium" | "high" | "blocked";
  seoStatus: "none" | "draft" | "indexable" | "noindex";
  analyticsStatus: "none" | "local-only" | "privacy-reviewed" | "public";
  conversionRole: "primary" | "secondary" | "retention" | "trust" | "utility" | "internal";
  testRequirements: string[];
  releaseGates: string[];
  activationCeremonyRequired: boolean;
  rollbackOrPausePath: string;
  ownerActions: string[];
  prohibitedClaims: string[];
};
```

### Manifest Invariants

- `publicStatus: "public-actionable"` requires explicit payment path,
  receipt schema, release gates, legal status, and rollback/pause path.
- `sourceAttributionSupport: "source-aware-contract"` requires a contract or
  router that actually reads SourceRegistryV1 or a successor registry.
- `sourceAttributionSupport: "read-model-only"` must not imply automatic payment.
- `paymentRequired: true` requires a receipt/event schema.
- Planned, preview, local-only, inactive, paused, or deprecated modules must not
  render as active public systems.
- Archive1155 mints must remain `sourceAttributionSupport: "none"` unless a
  source-aware Archive wrapper/router or new Archive sale contract exists.
- SwapRail must remain utility/external-provider scoped until provider, fee,
  risk, receipt, and disclosure review are complete.

## Commerce And Attribution Layers

### A. Policy Layer

Current: SourceRegistryV1.

Role:

- stores source identity,
- stores source terms,
- stores source status,
- stores payout wallet,
- stores metadata hash,
- emits visible source-policy events.

It does not:

- move sale funds by itself,
- mint SYN or Archive artifacts,
- create member identity,
- make every product source-aware,
- create a public source link,
- authorize claim UI.

Future: SourceRegistryV2 may be justified if source terms must vary by product,
campaign, geography, or legal entity.

### B. Product Sale Layer

Current:

- MembershipSaleV3 is the only source-aware product sale contract.
- Archive1155 handles artifact mints but does not read source policy.
- Trader Joe/liquidity surfaces are external/read-only utility/proof surfaces.

Future:

- Archive sale wrapper or Archive1155 V2 for source-aware artifact purchases.
- ProductSaleRouterV1 for premium/pass/product/marketplace sales.
- External provider flow for SwapRail/bridge, likely frontend-only at first.

### C. Receipt Layer

Current:

- `MembershipPurchasedV3` proves gross USDC, acquisition cost, net routed amount,
  Vault/Liquidity/Operations amounts, SYN delivered, era, chapter, buyer,
  recipient, sourceId, source class, source wallet, commission bps, attribution
  scope, remaining caps, first-seat state, and receipt version.
- Archive mint receipts prove artifact mint transaction and artifact identity,
  but not source attribution or acquisition cost.

Future receipt families:

- `ProductPurchased` for premium/pass/product sales.
- `ArchiveMintPurchased` for source-aware Archive sale wrapper/V2 if built.
- `SwapRailReceipt` for external swap/bridge proof, provider, fee, slippage, and
  route metadata.
- `RegisterEvidence` for off-chain institutional events.

### D. Read-Model Layer

Activity, My Syndicate, Register, Chronicle, Archive, and dashboards must read
from receipts/events and known source-of-truth docs. They must not invent live
state.

Rules:

- Activity can show heartbeat events.
- My Syndicate can summarize member-relevant state.
- Register preserves durable truth.
- Chronicle narrates material history.
- Archive preserves memory objects or historically meaningful memories.
- Dashboards can aggregate only with source labels and caveats.

### E. UX / Navigation Layer

Core routes:

- `/join` for seat acquisition.
- `/archive` and `/nft` for protocol memory.
- `/referral` for pending source-attribution truth until activated.
- Future `/swap` or `/swaprail` only after provider/fee/disclosure review.
- `/my-syndicate` as member home.
- `/registry` and `/transparency` for proof.
- `/docs`, `/faq`, `/whitepaper`, and `/knowledge-map` for explanation.

Every route must declare whether it is informational, read-only proof, or
actionable.

### F. Legal / Disclosure Layer

Every module needs specific disclosure:

- Membership sale: no equity, no treasury claim, no guaranteed financial result.
- Source attribution: verified introduction/acquisition cost only; no source
  ownership of members; no official representation without separate appointment.
- SwapRail: provider dependency, fees, slippage, route risk, bridge risk,
  jurisdictional caution.
- Archive/NFT: protocol memory, not seat identity or financial-rights object.
- Premium/pass: access terms, expiry/refund/support posture if applicable.
- Off-chain institutional events: protocol/company distinction.

### G. SEO / Marketing Layer

Public pages should be indexable only when the module is public and truthful.

Rules:

- Planned/preview modules can be in docs or noindex previews.
- Public actionable modules need canonical route, sitemap posture, FAQ entry,
  glossary terms, proof/verify path, and clear CTA hierarchy.
- Growth copy must not outrun source records, payment paths, or receipts.

## SwapRail / Bridge / Trade Future Module

Classification: utility module first, possible revenue module later, not a
membership purchase and not a source-attributed product sale by default.

How it differs from SYN membership purchase:

- Membership purchase seats a wallet with SYN and emits a membership receipt.
- SwapRail helps a user swap/bridge/trade assets through an external provider.
- SwapRail should never imply that swapping is joining, ranking, or source
  attribution.

Recommended first posture:

- Frontend/provider integration only after provider review.
- No SourceRegistryV1 commission at first.
- Read-model-only attribution may record that a visitor used a source link, but
  it must not imply automatic source payment.
- Receipts should show provider, route, input asset, output asset, fee, slippage,
  chain, transaction hash, and warnings.
- Activity can show user-initiated utility action if connected wallet consents.
- My Syndicate can show utility history separately from seat/contribution.
- Swap activity should not affect member progression or institutional trust
  capital unless a future doctrine explicitly approves it.

Fee/accounting posture:

- Provider fees and any Syndicate fee must be disclosed before signing.
- If Syndicate earns a fee, the routing/accounting must be explicit and should
  not be described as MembershipSaleV3 70/20/10 unless the contract actually
  routes it that way.
- Any treasury/operations routing must have its own proof path.

Risks:

- Provider outage or quote manipulation.
- Slippage and bridge failure.
- User confusion between buying SYN and swapping tokens.
- Hidden fee perception.
- Compliance and jurisdictional concerns.
- Source attribution confusion if ref/source links are reused.

Requires new contract?

- Not necessarily for a provider-API swap UI.
- Yes if The Syndicate takes custody, routes fees on-chain, guarantees a path,
  or pays source commission from swap revenue.

Must never imply:

- Swapping equals membership.
- Swapping creates a seat.
- Bridge output is guaranteed.
- Provider quote is protocol-controlled.
- Source commission exists unless proven by contract/event.

## Archive / NFT Source Attribution Options

| Option | Pros | Cons | Contract risk | UX risk | Legal/copy risk | Accounting behavior | Activity / My Syndicate behavior | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A. Keep Archive mints not source-attributed | Safest; preserves Archive as memory | No NFT acquisition commission | None | Low | Low | Current Archive treasury/payment path unchanged | Show mints as memory only | Best default now |
| B. Read-model-only source analytics | No contract change; useful internal insight | Not payment truth; easy to overstate | None | Medium | Medium | No automatic source payment | Internal analytics only; no public commission claim | Allowed only with strict labels |
| C. Source-aware Archive sale wrapper | Preserves existing Archive1155; adds receipt/routing layer | Wrapper complexity; approval/mint flow risk | Medium-high | Medium | Medium | Wrapper can route acquisition cost and emit receipt | Activity can show source-aware artifact purchase | Preferred if NFT commission becomes necessary |
| D. Archive1155 V2 | Clean native design | New contract, migration/status complexity | High | High | Medium | Native source receipt possible | Must reconcile V1 memories vs V2 | Defer until strong need |
| E. Generic ProductSaleRouter | Reusable for Archive and products | More abstract; larger audit surface | High | Medium-high | Medium | Shared source-aware product accounting | Unified product receipt model | Good later if multiple product lines mature |

Recommendation: keep Archive1155 not source-attributed for now. If source-aware
Archive payments become necessary, design a wrapper or generic ProductSaleRouter
after the first MembershipSaleV3 source path is proven.

## Future ProductSaleRouter Considerations

A future ProductSaleRouterV1 is justified only when at least two non-membership
paid products need source-aware, USDC-denominated, receipt-rich payment flows.

Minimum requirements:

- product registry with productType/productId,
- allowed recipient/mint/fulfillment handler,
- SourceRegistry lookup,
- product-specific commission policy or sourceId separation,
- gross/acquisition/net accounting,
- escrow fallback if source payout fails,
- product receipt event,
- pause/rollback path,
- owner/multisig controls,
- source-of-truth docs and tests,
- frontend read-model integration before public action.

Do not build this router for a single speculative future module.

## Anti-Fragmentation Intake Process

When the founder says "add a new module/function/product," Codex must respond
with this intake before code:

1. Classify module type.
2. State whether this is product, utility, memory, identity, accounting, source,
   analytics, or off-chain/institutional.
3. State whether payment exists.
4. State payment asset and payment contract/provider.
5. State source-attribution posture.
6. State receipt/event schema.
7. State Activity, My Syndicate, Register, Chronicle, and Archive behavior.
8. State public route, SEO, docs, and FAQ posture.
9. State legal/disclosure/Sharia guardrails.
10. State conversion role and CTA priority.
11. State tests and release gates.
12. State owner action/activation ceremony.
13. State rollback/pause plan.
14. State what must remain hidden or pending.

Implementation begins only after this classification is accepted or obviously
safe and narrow.

## Should We Add A TypeScript Module Registry Now?

Decision: defer TypeScript registry for now.

Reasoning:

- The current need is architectural discipline, not runtime discovery.
- A read-only registry that no UI consumes can become stale ceremony.
- The product still has one live membership sale, one Archive1155 mint path, and
  pending future modules.
- The next real value is enforcing intake and docs coherence.

When to add `src/lib/protocol-modules.ts`:

- at least two future modules are being built in parallel,
- routes need a shared status/CTA source,
- Activity/My Syndicate need a module registry to classify events,
- tests can ensure inactive/planned modules never render as active.

Recommended eventual approach:

- docs + TypeScript manifest,
- no UI behavior change in first registry commit,
- tests proving public-actionable modules require release gates, payment path,
  receipt schema, legal status, and prohibited-claim guards.

## Testing Requirements

For every future module:

- Manifest/documentation guard: module status and source-attribution posture.
- Route test: planned/preview modules do not render as active.
- Payment test: approval/spender/call target are exact when payments exist.
- Receipt test: event/read model reconstructs payment and state change.
- Cache test: restored events preserve module type and receipt fields.
- Activity test: event classification is stable.
- My Syndicate test: member home does not mix pending and live states.
- Legal copy test: prohibited claims are absent from public surfaces.
- Registry test: deployed addresses require real tx/readback.
- Release gate: `npm run check-release`.
- Contract modules: Foundry tests, fork rehearsal, static analysis, external
  review, owner/funding/activation readbacks.

## Activation Gates

A module can become public-actionable only when all relevant gates are green:

- contract deployed/read back or provider reviewed,
- funding/allowance/inventory proof complete if applicable,
- source attribution status explicit,
- receipt schema implemented,
- Activity/My Syndicate behavior tested,
- Register/Transparency truth updated,
- legal/disclosure approved,
- route copy and CTA hierarchy reviewed,
- rollback/pause path documented,
- production build and release gates green,
- Replit/public publish verified if relevant.

## Next Recommended Implementation Step

Do not implement SwapRail, Archive sale wrapper, ProductSaleRouter, SeatRecord721,
or claim UI next.

The safest next step is a small source-attribution readiness cleanup:

1. Patch referral copy that still implies Operations-slice-only economics.
2. Finalize the first internal source packet with exact founder-approved values.
3. Keep source creation as a separate PAUSED-record ceremony.
4. After PAUSED source readback, design source-aware UI/read-model surfaces.

This preserves the current V3 momentum without pretending that future products
are source-aware before their payment paths exist.
