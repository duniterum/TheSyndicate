# The Syndicate Full Site / Full Protocol Baseline Audit

Date: 2026-06-22

Starting commit: f966120dff97847d93995b96df6a1f55001cedff

Audit mode: report-first baseline audit, no implementation, no activation, no transaction.

## Executive Summary

The Syndicate is no longer mainly a pre-referral product. It is a live V3 membership sale frontend and a funded, deployed, unpaused V3 sale contract, with referral/source attribution still intentionally inactive. The foundation is strong: contract topology is coherent, the default public buy path uses V3 with `ZERO_SOURCE_ID`, historical-member protection exists, SourceRegistryV1 has zero source records, and the read model now preserves V3 purchase events after cache reload.

The biggest remaining risk is not contract architecture. It is public truth coherence. The product still contains meaningful fixed-rate / old-era / CommissionRouter language in active surfaces while the canonical V3 doctrine now uses deterministic era pricing and SourceRegistry-based acquisition attribution. This can confuse first-time buyers, crypto-native verifiers, and future reviewers.

The second major risk is activation discipline. V3 is funded and directly callable on-chain, but referral/source attribution is not live, claim UI is not live, and production publish/live wallet QA status must be verified separately. The product should not create a PAUSED source record or activate referral until the exact source packet, legal/product copy, on-chain readbacks, and local/live QA gates are complete.

No P0 blocker was found in the current repository state. Several P1 product-truth and release-readiness blockers remain before public referral/source activation.

Foundation solidity score: 82/100.

## Scope

This audit expands the previous pre-referral audit into a full site / full protocol / full product organism baseline.

It includes:

- public routes
- labs and quarantined routes
- API routes
- canonical doctrine and source-of-truth docs
- current V3 sale and SourceRegistry boundaries
- Archive1155 / NFT memory surfaces
- My Syndicate and return-home surfaces
- Activity / Chronicle / Register read model
- purchase-event cache and indexing model
- referral/source attribution readiness
- AI, SwapRail, SeatRecord721, ProductSaleRouter, and future module boundaries
- SEO / sitemap / noindex boundaries
- public copy and doctrine drift
- tests and guard coverage

It excludes:

- blockchain transactions
- contract changes
- registry switches
- source record creation
- referral activation
- claim UI activation
- Replit production publish
- wallet signing
- SwapRail, SeatRecord721, Archive1155 V2, NFT sale wrapper, or ProductSaleRouter implementation

## Expansion Beyond The Pre-Referral Audit

The previous audit primarily answered whether referral/source attribution could safely move toward a first internal source record. This audit asks a larger question: whether the whole product organism is coherent enough to continue activation work.

Expanded areas:

1. Full route inventory, including public, API, infra, and labs route classes.
2. Active V3 buy flow review, not only source attribution.
3. Read-model and cache preservation review across Activity, My Syndicate, Register, and Chronicle.
4. Public copy review for V3 era-pricing doctrine drift.
5. Active/future module boundary review across Archive1155, SeatRecord721, SwapRail, ProductSaleRouter, AI, and notifications.
6. SEO/noindex/quarantine review.
7. Go/no-go classification for Replit publish, PAUSED source record, referral activation, NFT/ERC721 design, and SwapRail design.

## Baseline State

Git branch: main

Git status at audit start: clean

Latest commit at audit start: f966120dff97847d93995b96df6a1f55001cedff - Audit full system before referral activation

Known protocol state from canonical docs and recent readbacks:

- V2b sale: paused, historical scan source, public frontend should no longer target it.
- V3 MembershipSaleV3: deployed, owner accepted, funded, unpaused, directly callable on-chain.
- V3 SourceRegistryV1: deployed, owner accepted, zero source records.
- Frontend active buy path: V3.
- Public/default source ID: `ZERO_SOURCE_ID`.
- Referral/source attribution: not live.
- Claim UI: not live.
- Archive1155: live protocol memory surface, not source-aware.
- SeatRecord721: future identity record, not implemented.
- SwapRail: not implemented.
- ProductSaleRouter: not implemented.

## Inventory Summary

Route files audited: 64

Route grouping:

| Group | Count | Notes |
| --- | ---: | --- |
| Public routes | 36 | Includes homepage, join, My Syndicate, Activity, Chronicle, Register, Archive/NFT, Registry, Transparency, Referral, V3 preview, AI, member/wallet pages |
| API routes | 7 | Includes chat/API and chain-backed data endpoints |
| Labs routes | 19 | Noindex/quarantined design and preview surfaces |
| Infra routes | 2 | Sitemap and route infrastructure |

Major modules audited: 18

Module list:

1. SYN seat and membership sale
2. MembershipSaleV3 frontend buy path
3. SourceRegistryV1 and source attribution
4. Referral / acquisition preview and pending surfaces
5. Archive1155 and NFT memory
6. SeatRecord721 future identity
7. Holder Index
8. Activity heartbeat
9. Chronicle
10. Institutional Register
11. My Syndicate / Member OS
12. Chapters and ranks
13. Transparency / Registry / Contract dossiers
14. Liquidity / DEX access
15. Vault / Operations routing explanation
16. AI pending surface and chat API
17. SwapRail / future commerce modules
18. Documentation, guards, and release gates

## User Journey Audit

### Visitor

Strengths:

- Homepage quick facts and navigation now give faster proof access than earlier versions.
- Join entry exists and points into the sale ceremony.
- Registry, Transparency, Token, Liquidity, and Archive paths are visible.

Gaps:

- A first-time visitor may still encounter old fixed-rate language in active Join and FAQ surfaces, while V3 actually uses deterministic era pricing.
- The sitemap includes `/ai`, but the AI page is pending while an API route exists behind it if configured.

### Curious Visitor

Strengths:

- Docs, FAQ, Registry, Transparency, and V3 Preview expose deep proof.
- Referral route is noindex and clearly pending.

Gaps:

- Deep proof surfaces are stronger than the simple public explanation of V3-era pricing.
- Some old V1/V2 contract labels can blur what is live, historical, and candidate.

### Buyer

Strengths:

- Active write path uses V3.
- Approval spender and buy target are aligned to the active sale.
- Direct public buys use `ZERO_SOURCE_ID`.
- Historical member direct-buy guard exists.
- Receipt/event model supports V3 reconstruction.

Gaps:

- Live wallet QA and Replit publish status must be verified separately.
- Fixed-rate copy drift can make the buy ceremony less trustworthy.
- If the public site has not pulled the latest GitHub main, live `/join` may still be stale.

### Member

Strengths:

- My Syndicate has moved toward a Member OS rather than a long static page.
- Member pages and wallet pages expose purchase history, rank, and event context.
- V3 purchase-event cache preservation is guarded.

Gaps:

- My Syndicate pending referral card still contains older CommissionRouter / Operations-slice framing.
- Source-attributed history and source terms are not yet first-class member return objects.

### Returning Member

Strengths:

- Activity, Chronicle, Register, Archive, and My Syndicate now create a return loop.

Gaps:

- There is not yet a concise "what changed since you were away" briefing.
- Notifications are future-only.
- Chapter progress and institutional trust capital are not yet summarized as a return-home narrative.

### Collector

Strengths:

- Archive1155 is consistently framed as protocol memory, not a speculative NFT shop.
- Archive/NFT surfaces distinguish live memory artifacts from future identity systems.

Gaps:

- Future Archive IDs and SeatRecord721 remain correctly pending, but need continued guardrails so they do not become fake-live.

### Long-Term Member

Strengths:

- Institutional Register and Chronicle are positioned as durable truth/history.
- V3 receipt fields can support long-term reconstruction.

Gaps:

- Institutional Trust Capital is canonical in docs but not yet a practical read model.
- Builder Records, recognition, and source-attribution history are still future/pending.

## Smart Contract And Money Flow Audit

### Live / Historical / Candidate Status

| Contract/System | Status | Audit Notes |
| --- | --- | --- |
| SYN ERC-20 | Live | V1 seat. Seat is binary; contribution is variable. |
| V1 sale | Historical proof source | Should not be described as active sale. |
| V2a sale | Historical | Mistaken pause tx had no effect on V2b; keep historical. |
| V2b sale | Paused/historical scan source | Recovery timelock exists; do not recover without separate ceremony. |
| SourceRegistryV1 | Deployed, zero records | Not a live referral program. |
| MembershipSaleV3 | Deployed, funded, unpaused, directly callable | Active frontend target in repo; source attribution still inactive. |
| Archive1155 | Live memory | Not source-aware; not an NFT speculation surface. |
| CommissionRouterV1 | Paused/superseded candidate | Not V3 live path. |
| SeatRecord721 | Future | Not Solidity-live; must not replace SYN as the seat. |
| SwapRail | Future/not implemented | Should not inherit source attribution automatically. |
| ProductSaleRouter | Future/not implemented | Needed only if multiple non-membership products require source-aware payment routing. |

### Money Flow

Current V3 default public buy:

USDC paid -> no source commission because `ZERO_SOURCE_ID` -> net routed through V3 -> Vault / Liquidity / Operations -> SYN delivered -> V3 receipt event.

Future source-attributed buy:

USDC paid -> source commission only if valid source terms exist -> net routed -> Vault / Liquidity / Operations -> SYN delivered -> receipt event. This is not public-live yet.

### Guardrails

Strong:

- No public/default non-zero source ID.
- SourceRegistry has zero records.
- Claim UI is absent.
- V3 cache preserves V3 event source after reload.
- Historical members are guarded from direct V3 buy unless proof flow exists.

Needs work:

- Source packet approval must be finalized before a PAUSED source record.
- Source-aware public buy path and receipt UI must be explicit before any public referral activation.
- Activity/Register/Chronicle need first-class source lifecycle/event language before source activation.

## Frontend Write-Path Audit

Inspected write surfaces:

- `LivePurchase.tsx`
- `sale-hooks.ts`
- source/referral routes and components
- global search for write hooks and source/claim functions

Current state:

- Active sale is V3.
- Approval spender is active V3 sale.
- Buy call uses V3 `buy(usdcRaw, recipient, ZERO_SOURCE_ID, minSynOut, [])`.
- Historical member direct-buy guard is present.
- No public claim UI found.
- No public source creation UI found.
- No registry switch performed in this audit.

P1 release-readiness risk:

- This must be verified in the actual published environment after Replit pulls the latest GitHub main.

## Read Model / Cache / Event Audit

Strengths:

- `purchase-events-cache.ts` now preserves `v1`, `v2`, and `v3` source labels.
- Unknown future source labels are rejected instead of silently relabeled as V1.
- `activity-hooks.ts` parses `MembershipPurchasedV3`.
- V3 event fields include receipt and routing data needed for later Activity/Register/Chronicle surfaces.

Risks:

- Some UI labels still use `TokensPurchased` as the human-facing purchase category. For V3 this should evolve to "membership purchase events" except where quoting historical event names.
- `activity-hooks.ts` still maps acquisition cost into a compatibility `referralAmount` field. This is acceptable internally, but future source UI should not use legacy reward/referral language.

## Public Copy / Doctrine Audit

The largest product-truth drift is pricing language.

Repository truth:

- V3 uses deterministic era pricing.
- The old fixed "same rate for everyone" doctrine is retired for V3.
- Seat is binary; contribution is variable.
- Ranks are recognition, not financial entitlement.
- Referral/source attribution is acquisition attribution, not yield or passive income.

Active drift found:

- `/join` metadata still says fixed rate.
- Join sections still say `1 SYN = $0.01 USDC`, fixed V1 rate, same fixed rate, and single fixed rate.
- FAQ still says token price is fixed for everyone and frames eras as future/proposed.
- Mobile join bar says "same rate for everyone."
- Tokenomics and whitepaper still contain fixed-rate sale language.
- `eras.ts` still says the multi-era model requires a future sale contract.
- Some registry/docs labels still make old V1/V2 sale status look more live than it is.

This is a P1/P2 product coherence risk before further public promotion.

## Legal / Sharia / Trust-Language Audit

No active public surface was found promising:

- yield
- passive income
- downline
- MLM
- equity
- dividends
- governance rights
- guaranteed appreciation
- NFT financial rights

Risks:

- Old referral preview language still exists in labs/design archive.
- My Syndicate pending referral card still references CommissionRouter / Operations-slice commission, which is no longer the V3 source-attribution path.
- Future source attribution must continue to use source commission, acquisition attribution, and source terms, not reward/passive-income language.

## Product / UX / Conversion Audit

Strong:

- Homepage and navigation have improved proof access.
- Join ceremony has wallet/purchase clarity.
- My Syndicate is becoming the member home.
- Archive is framed as memory.
- Registry/Transparency are credible proof surfaces.

Weak:

- Active Join/FAQ copy is now less reliable than the contracts.
- Important V3 truth is split across docs, previews, and guards, while public copy still has V1 fixed-rate leftovers.
- Activity/Chronicle/Register are structurally coherent but still rely on older purchase-event naming.
- AI page/API boundary needs tightening before it is public-promoted.

## SEO / Labs / Quarantine Audit

Good:

- `/referral` is noindex and excluded from sitemap.
- `/v3-preview` is noindex/nofollow.
- `/labs` routes are noindex and blocked by robots.

Risk:

- `/ai` is included in sitemap while the AI page says the module is future/pending and the API route can be active if configured. This should be resolved before public AI positioning.

## Findings

### P0 - Critical

Count: 0

No P0 was found. No contract code change, transaction, registry switch, source record, funding, recovery, or activation is required from this audit.

### P1 - High

Count: 9

1. Active Join/FAQ/mobile copy still says fixed/same-rate while V3 uses deterministic era pricing.
2. Public production/Replit state is not proven current from this audit. Replit publish/live route QA remains a separate gate.
3. Wallet-connected V3 live QA must verify approval spender, buy target, `ZERO_SOURCE_ID`, quote, historical guard, and receipt state.
4. First source packet is not yet founder-final. No PAUSED source record should be created yet.
5. Source-attribution activation lacks public receipt/source UI and source-aware buy flow.
6. Claim UI is absent and must remain absent until source escrow/claim policy is approved.
7. AI route/API boundary can confuse public truth if `/api/chat` is enabled while `/ai` says no AI module is live.
8. Registry/docs contain old V1/V2 live-status ambiguity that can confuse contract truth.
9. Member OS pending referral card still references older CommissionRouter / Operations-slice framing.

### P2 - Medium

Count: 19

1. `TokensPurchased` remains a human-facing label in several route/component descriptions despite V3 `MembershipPurchasedV3`.
2. Some global config and metrics still expose fixed-rate sale assumptions.
3. `eras.ts` still describes era pricing as a future sale-contract model.
4. Tokenomics and whitepaper need V3-era pricing updates.
5. Source events are not yet first-class Activity/Register/Chronicle objects.
6. SourceRegistry is not enumerable from-chain, so source readback requires known IDs/logs.
7. Labs contain stale referral preview language and old "where used" descriptions.
8. V3 source attribution fork/readback is not rerun inside this audit immediately before a source ceremony.
9. No second static analyzer/Slither disposition was rerun in this audit.
10. No visual/mobile browser QA was run in this audit.
11. No source packet validator exists for founder source-record ceremonies.
12. Historical docs remain searchable and may conflict with current canon if read without the authority map.
13. `/ai` sitemap inclusion needs a deliberate decision.
14. V3 preview remains candidate/noindex and may not match active public Join truth.
15. My Syndicate lacks a compact return briefing.
16. Institutional Trust Capital is canonical but not yet a read model.
17. Notifications remain future-only.
18. Source/payout-wallet compromise policy is documented but not surfaced to users.
19. Archive future ID boundaries require ongoing guard coverage.

### P3 - Low

Count: 11

1. Labs and design archive contain old simulated components but are quarantined.
2. Some code comments use historical V1/V2 naming.
3. Some route descriptions could better distinguish public/candidate/future status.
4. Sitemap route list should be periodically regenerated/reviewed after route changes.
5. Protocol event language can be tightened around "membership purchase" instead of "token purchase."
6. Documentation is now broad enough that future contributors need the authority map first.
7. Some pending/future modules would benefit from a standard module status badge.
8. Localhost and production QA checklists should be kept together after Replit publishes.
9. Future AI documentation should define "AI cockpit" without fake-live claims.
10. Source attribution docs should archive CommissionRouter-era wording as historical.
11. Member/wallet pages can eventually expose V3 receipt version more explicitly.

## Go / No-Go Table

| Decision | Status | Reason |
| --- | --- | --- |
| Replit publish | CONDITIONAL GO | Only after pulling latest GitHub main, running `npm run check-release`, building, and live QA verifying V3 target and no referral/claim/source activation. |
| PAUSED source record | NO-GO NOW / CONDITIONAL LATER | Wait for founder-final source packet, legal/product approval, fresh fork/source readback, and exact ceremony approval. |
| Referral/source activation | NO-GO | Source-aware public buy path, receipt UI, Activity/Register read model, and legal copy are not ready. |
| Claim UI | NO-GO | No public claim surface until source escrow/claim policy is approved and tested. |
| NFT/ERC721 design | GO DESIGN-ONLY | SeatRecord721/Archive future design can continue, but no Solidity/live UI yet. |
| SwapRail design | GO DESIGN-ONLY | Architecture planning can continue, but no implementation or source attribution inheritance. |
| ProductSaleRouter | NO-GO IMPLEMENTATION | Need at least two concrete non-membership product payment flows before building. |
| AI public activation | NO-GO | Define doctrine, rate limits, safety, and public copy first. |

## Recommended Sprint Order

1. V3 public truth cleanup: Join, FAQ, mobile join bar, eras/tokenomics/whitepaper copy, and guards against old fixed-rate drift.
2. Replit publish and live wallet QA: confirm production uses V3, V3 approval spender, V3 buy target, `ZERO_SOURCE_ID`, historical guard, and V3 cache persistence.
3. First internal source packet finalization: conservative terms, PAUSED status, exact founder approval, no public display.
4. Source event read-model prep: Activity/Register/Chronicle source lifecycle language before any source activation.
5. Member OS return briefing: what changed since last visit, V3 receipt state, Archive/Activity/Chapter summary.
6. AI boundary cleanup: either remove from sitemap until active or make pending/API boundary explicit and protected.
7. Future design-only pass: SeatRecord721, SwapRail, ProductSaleRouter, and Archive future IDs under module standard.

## Top Risks And Fixes

1. Pricing truth drift.
   - Fix: update active Join/FAQ/mobile/tokenomics/whitepaper/eras copy to V3 deterministic era pricing.
2. Production state uncertainty.
   - Fix: Replit pull, release gate, publish, live route and wallet QA.
3. Source activation too early.
   - Fix: require source packet approval, fork/readback, PAUSED creation ceremony, then separate activation ceremony.
4. Referral language drift.
   - Fix: replace old CommissionRouter/Ops-slice language in active member surfaces with SourceRegistry/V3 source terms.
5. AI pending/live ambiguity.
   - Fix: either remove `/ai` from sitemap or harden the API/page boundary.
6. V3 event naming drift.
   - Fix: shift user-facing labels from `TokensPurchased` to membership purchase events except in technical contexts.
7. Claim UI temptation.
   - Fix: keep no-claim guards until source escrow policy is intentionally activated.
8. Future module contamination.
   - Fix: apply module standard before any SwapRail, NFT, ERC721, or product payment source attribution.
9. Historical docs noise.
   - Fix: use authority map and mark old reports historical in future summaries.
10. Founder ceremony risk.
   - Fix: keep all source and recovery actions runbook-driven with readbacks and commits.

## Autonomous Actions Performed

- Read the new audit brief.
- Verified the starting Git commit and clean branch state.
- Audited canonical docs, source-of-truth tables, module standards, prior audit, and recent source attribution readiness docs.
- Inventoried route files and route classes.
- Inspected active V3 write path and purchase-event read model.
- Searched for prohibited or risky legal/referral language.
- Searched for public fixed-rate and old-era drift.
- Inspected sitemap/noindex/labs boundaries.
- Created this audit report.

## Actions Explicitly Not Performed

- No mainnet transaction.
- No source record.
- No referral activation.
- No claim UI activation.
- No non-zero source ID wired into public/default buy.
- No deployment.
- No contract change.
- No funding.
- No V2b recovery.
- No registry switch.
- No Replit or production publish.
- No wallet signing.
- No SwapRail implementation.
- No SeatRecord721 implementation.
- No ERC721 implementation.
- No Archive1155 V2 implementation.
- No NFT sale wrapper implementation.
- No ProductSaleRouter implementation.
- No public source links, claim buttons, or fake-live states.
- No secrets, private keys, or RPC URLs exposed.

## Founder Approval Needed

Founder approval is needed before:

1. Any source record creation, even PAUSED.
2. Any referral/source activation.
3. Any claim UI or source-aware public buy path.
4. Any V2b recovery.
5. Any registry switch.
6. Any Replit publish after confirming release gate and live QA checklist.
7. Any AI public activation.
8. Any SeatRecord721, SwapRail, ProductSaleRouter, Archive1155 V2, or NFT sale wrapper implementation.

## Replit Publish Checklist

Before Replit publish:

1. Pull latest GitHub main.
2. Confirm commit hash.
3. Confirm `VITE_AVALANCHE_RPC_URL` is configured if production reads require it.
4. Run `npm run check-release`.
5. Confirm production build passes.
6. Publish/update only if green.
7. Verify live `/join` targets V3, not paused V2b.
8. Verify approval spender equals V3 sale address.
9. Verify buy call targets V3 with `ZERO_SOURCE_ID`.
10. Verify historical wallet direct-buy guard.
11. Verify non-historical wallet quote/direct-buy path.
12. Verify no referral/source/claim UI appears live.
13. Verify Activity/My Syndicate preserve V3 source after reload.
14. Verify no fixed-rate public copy remains in the live V3 buy ceremony after the cleanup sprint.

## Final Baseline Judgment

The protocol foundation is strong enough to continue controlled V3 frontend QA and source-packet preparation work, but not strong enough to activate referral/source attribution publicly.

The next highest-leverage sprint is not a new contract. It is V3 public truth cleanup across active Join, FAQ, mobile buy affordances, and docs that still teach fixed-rate/V1-era language. That sprint should come before any public referral activation or source-record ceremony because buyers must understand the live V3 sale before acquisition attribution becomes visible.
