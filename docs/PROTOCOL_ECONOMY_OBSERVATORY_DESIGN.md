# Protocol Economy Observatory Design

Status: DESIGN / NO TRANSACTION AUTHORIZED / NO PUBLIC ACTIVATION

This document defines how The Syndicate should eventually show protocol-level
economic truth and member-level economic footprint without turning the product
into an investment dashboard, a treasury claim surface, or a fake-live module.

It does not authorize a deployment, funding movement, V2b recovery, source
record, referral activation, claim UI, registry switch, new contract, Replit
publish, or public launch claim.

## 1. Executive Summary

The Syndicate needs two related surfaces:

1. Protocol Economy Observatory: public, institution-level truth.
2. My Economy: private/member-context view inside My Syndicate.

The Observatory answers:

- What entered the institution?
- Where did USDC route?
- What liquidity and reserves exist?
- What source records or source-attributed receipts exist?
- What economic events became Activity, Register, Chronicle, or Archive memory?
- What is live, pending, future, or explicitly not implemented?

My Economy answers:

- What did my wallet do?
- What SYN did I receive or hold?
- What receipts prove my actions?
- How did my contribution route?
- What Archive memories, ranks, chapter context, and future source attribution
  relate to my seat?

Neither surface should imply financial rights, treasury ownership, guaranteed
financial outcome, source ownership of members, or company equity. They are
proof, context, and memory surfaces.

## 2. Repository Truth Baseline

Current active truth at design time:

- SYN is the V1 seat.
- A seat is binary; contribution is variable.
- Member count is not economic scale.
- MembershipSaleV3 is the current direct-buy target.
- Public/default V3 buys use `ZERO_SOURCE_ID`.
- SourceRegistryV1 is deployed but has zero source records.
- Referral/source attribution remains inactive.
- No claim UI is live.
- Archive1155 is protocol memory and is not source-aware.
- SeatRecord721, SwapRail, ProductSaleRouter, Archive1155 V2, source-aware NFT
  wrappers, premium commerce, and marketplace modules are future/pending.
- Module expansion must follow `docs/MODULE_INTEGRATION_STANDARD.md`.
- System relationships must follow `docs/PROTOCOL_ORGANISM_GRAPH.md`.

## 3. External Benchmark Synthesis

The benchmark lesson is not "copy a dashboard." It is "make terms, sources, and
state transitions clear enough that serious readers can verify them."

| Reference | Useful pattern | Syndicate adaptation |
| --- | --- | --- |
| DeFiLlama Fees / Revenue / Volume / Treasuries | Separate metric families and make category boundaries obvious. | Keep membership volume, routed USDC, liquidity, Archive proceeds, and future product revenue as separate metric families. |
| Token Terminal | Standardized financial-style statements from raw on-chain data. | Use statement-like grouping only when inputs are proved and labels are conservative. |
| CryptoFees | Simple question-led ranking: which protocols are people paying to use? | A Syndicate public economy surface should answer one question per band, not bury visitors in every possible metric. |
| OpenOrgs | Treasury balance sheets and continuously updated balances. | Show allocation wallets and balances as proof, with clear caveats on what each wallet means. |
| CryptoFlows | Flow map from origin to destination. | Use flow visualization for USDC paid -> acquisition commission if any -> net USDC routed -> Vault / Liquidity / Operations. |
| Zerion | Personal wallet context across assets, positions, and transaction history. | My Economy should feel like a wallet-native member footprint, but only for Syndicate-specific actions and proofs. |

## 4. Public Language Rule

Public copy should use neutral professional trust language:

- "transparent routing"
- "verified receipt"
- "member contribution"
- "economic footprint"
- "allocation wallet"
- "approved reserve allocation"
- "source attribution"
- "acquisition commission"
- "net USDC routed"
- "institutional trust capital"
- "protocol memory"

Public copy should avoid religious-compliance positioning and avoid presenting
private founder principles as marketing claims. If a formal compliance position
is ever pursued, it belongs in a qualified legal/review process, not in product
copy by default.

## 5. Forbidden Drift

The Observatory and My Economy must not become:

- a member entitlement surface,
- a treasury claim surface,
- a company equity surface,
- a source/referral promise surface,
- a claimable commission UI before activation,
- a public source leaderboard before source policy is live,
- a fake product marketplace,
- a speculative NFT trading page,
- an all-expenses accounting dashboard,
- or a private-founder-principle marketing page.

## 6. Metric Taxonomy

### A. Institutional Scale Metrics

| Metric | Meaning | Source | Public posture |
| --- | --- | --- | --- |
| Seated wallets | Count of wallets seated by SYN / valid member-number path | Holder Index + sale history | Public |
| Gross USDC paid | Total USDC paid into membership purchases | MembershipSale events | Public when proved |
| Net USDC routed | Gross minus acquisition commission, then routed | MembershipPurchasedV3 receipts | Public when proved |
| Vault amount | 70% of net routed USDC | Receipt/event + wallet reads | Public |
| Liquidity amount | 20% of net routed USDC | Receipt/event + wallet reads | Public |
| Operations amount | 10% of net routed USDC | Receipt/event + wallet reads | Public |
| Acquisition commission | Commission paid or escrowed to valid source | Receipt/event + SourceRegistry | Public only after source activation |
| Archive memory mints | Artifact mints and holders | Archive1155 events | Public |
| Liquidity state | LP pool, pair, protocol-held LP, trade link | Trader Joe / wallet reads | Public with caveats |
| Source records | Source policy records and status | SourceRegistryV1 | Public only after records exist |
| Institutional milestones | Audits, legal milestones, deployments, partnerships | Register evidence | Public when material and verified |

Volume is not revenue. Gross paid is not operations capacity. Operations capacity
is not company profit. Wallet balances are not member entitlements.

### B. Member-Level Metrics

| Metric | Meaning | Surface |
| --- | --- | --- |
| Seat status | Wallet is seated by SYN / member-number path | My Syndicate summary |
| SYN held / received | Current and historical SYN context | Seat Passport / My Economy |
| Contribution depth | USDC routed through the member's receipts | My Economy |
| Routing footprint | Member's Vault / Liquidity / Operations routing | Receipt panel |
| Receipt history | Transaction proof for membership actions | My Syndicate / Activity |
| Rank | Recognition of contribution depth, not a right | Seat Passport |
| Chapter context | Historical belonging / era context | Chapter panel |
| Archive memory | Artifacts owned or relevant to the member | Memory Path |
| Source attribution | Future introduction/source context if activated | My Referral / My Economy |
| Trust capital | Future recognition of meaningful contribution beyond money | Register / Chronicle / future Builder Records |

## 7. Evidence Classes

Every metric should state its evidence class:

| Evidence class | Meaning | Example |
| --- | --- | --- |
| Contract event | Direct event emitted by a known contract | `MembershipPurchasedV3` |
| Contract read | Current state read from a known contract | `memberCount()` |
| Wallet balance | Token/native balance of a known address | USDC in Vault Wallet |
| Explorer proof | Transaction, address, code, or event page | Routescan/Avascan link |
| Derived index | Deterministic read model from events | Holder Index |
| Register evidence | Manually admitted institutional proof | Legal/audit milestone |
| Manual pending | Claimed but not yet on-chain proved | Must render PENDING |
| Future reserved | Not implemented yet | SeatRecord721 |

## 8. Protocol Economy Observatory Shape

Recommended route posture:

- Public route: `/transparency` or future `/economy`.
- Navigation label: "Economy" only after the surface is useful enough; until
  then, integrate under Transparency.
- Primary CTA: "Verify routing."
- Secondary CTA: "Open Registry."
- Deep CTA: "Read economic model."

Recommended page bands:

1. Status banner: current buy target, source status, source records count,
   V3 direct-buy status, no claim UI.
2. Quick facts: seated wallets, total gross USDC paid, total net USDC routed,
   Vault / Liquidity / Operations totals.
3. Flow map: USDC paid -> acquisition commission if any -> net USDC routed ->
   Vault / Liquidity / Operations.
4. Allocation wallet table: address, role, current balance, latest movement,
   proof link.
5. Revenue stream table: membership sale, Archive mints, future product lines,
   source status, amount status, proof status.
6. Source attribution panel: zero source records today; future source terms
   only after SourceRegistry readback and activation.
7. Institutional milestones: only material events admitted to Register /
   Chronicle / Archive.
8. Caveats: company/protocol distinction, no member financial rights, future
   modules pending until contract and legal gates pass.

## 9. My Economy Shape

Recommended home: `/my-syndicate`, not a new top-level finance page at first.

Recommended sections:

1. Member summary: seat, wallet, member number, chapter, rank.
2. My receipts: membership purchases, transaction proof, SYN delivered.
3. My routing footprint: total gross paid, net USDC routed, Vault / Liquidity /
   Operations split from the member's receipts.
4. My seat context: SYN held, historical member recognition if applicable,
   direct-buy guard status.
5. My memory: Archive1155 artifacts and protocol memories.
6. My source context: inactive today; later, introductions, source records,
   source-attributed receipts, escrow/claim status only if live.
7. My return briefing: what changed since last visit.

My Economy should be member-context, not wealth ranking. It should show proof
and continuity, not promise financial outcome.

## 10. Route Integration

| Route | Role in economy system | Needed posture |
| --- | --- | --- |
| `/` | First explanation | Keep simple; do not overload with economy analytics |
| `/join` | Action | Show wallet asks, V3 target, sourceId zero, receipt trust |
| `/my-syndicate` | Member home | Add My Economy as one cockpit section when ready |
| `/activity` | Heartbeat | Show events; do not become analysis dashboard |
| `/registry` | Durable truth | Contract/source/wallet status and proof |
| `/transparency` | Public proof center | Best initial home for Observatory bands |
| `/vault` | Allocation context | Wallet proof, not entitlement |
| `/liquidity` | LP/trade proof | Pair, liquidity context, trade link |
| `/referral` | Source truth | Pending/inactive until source records and activation |
| `/archive` and `/nft` | Memory | Not source-aware today; not a shop |
| `/docs`, `/faq`, `/whitepaper` | Explanation | Deep doctrine and caveats |

## 11. Visual System

The visual system should feel like a premium observatory, not a spreadsheet:

- Use flow diagrams for money movement.
- Use compact fact cards for top metrics.
- Use tables only where proof links matter.
- Use timeline rows for institutional milestones.
- Use source-status badges for LIVE / PENDING / FUTURE / NOT IMPLEMENTED.
- Use wallet chips with copy and explorer actions.
- Use member-specific panels inside My Syndicate, not public leaderboards.
- Avoid giant walls of explanatory text; each band should answer one question.

## 12. Treasury Wording Standard

Use:

- Vault Wallet
- Liquidity Wallet
- Operations Wallet
- approved reserve allocation
- infrastructure spend
- audit/legal spend
- source acquisition commission
- LP add/remove
- verified movement

Avoid:

- old reserve-position wording that implies financial-product mechanics
- member-owned treasury
- profit distribution

If the Vault ever moves assets to another verified allocation, the row should
name the action as an approved allocation with its own proof, risk note, and
return path. It must not imply member entitlement.

## 13. Source Attribution Integration

Source attribution belongs in the Observatory only after it has real source
records and activation status. Until then:

- SourceRegistryV1: deployed, zero records.
- Public V3 buys: `ZERO_SOURCE_ID`.
- No source-linked purchase path.
- No claim UI.
- No source leaderboard.

After activation, the Observatory can show:

- source count,
- active / paused / revoked counts,
- source-attributed gross,
- acquisition commission paid or escrowed,
- net USDC routed,
- receipt examples,
- Register entries for source policy actions.

My Economy can later show:

- purchases introduced by my source, if applicable,
- commission routed or escrowed, if live,
- source status changes,
- attribution window and caps,
- and receipt proof.

## 14. Future Module Boundaries

Future modules must not enter the Observatory as live income streams until they
have:

- approved module manifest,
- payment path,
- receipt/event schema,
- source-attribution posture,
- proof/read model,
- legal/disclosure review,
- tests and release gates,
- activation ceremony.

Examples:

- SwapRail: utility first, provider risk, no membership confusion.
- ProductSaleRouter: only after concrete paid products exist.
- Archive wrapper/V2: only if source-aware artifact purchases become necessary.
- SeatRecord721: identity record, not the V1 seat and not an economy module.

## 15. First Implementation Recommendation

Do not build a new public `/economy` route first.

Recommended sequence:

1. Keep this design doc canonical.
2. Add public-trust language guards.
3. Fold a small Protocol Economy panel into `/transparency`.
4. Fold a small My Economy panel into `/my-syndicate`.
5. Add proof links and cache tests for V3 receipt metrics.
6. Only then consider a dedicated `/economy` route if the surface becomes too
   large for Transparency.

This keeps the public product understandable while preserving a path to a
serious institutional economy surface.

## 16. Open Decisions

- Whether the future top-level route should be `/economy`, `/observatory`, or
  remain inside `/transparency`.
- Which institution-level milestones deserve Register/Chronicle/Archive
  admission.
- Whether My Economy should show current token value, or only receipt/routing
  history. The safer default is receipt/routing history only.
- Whether source-attribution metrics remain private/member-context until source
  activation is proven in public.
- Whether company-level expenses ever appear publicly beyond material
  institutional milestones.

## 17. Guardrails For Future Codex Work

Before implementing Observatory or My Economy surfaces, confirm:

- no source records are created,
- no claim UI is activated,
- public V3 buys still use `ZERO_SOURCE_ID` unless a separate source ceremony
  approves otherwise,
- Archive1155 remains protocol memory and not source-aware,
- SeatRecord721 remains future identity infrastructure,
- treasury wording uses neutral allocation language,
- religious-compliance vocabulary does not appear in public/canonical product
  copy,
- and every metric has an evidence class.

## 18. First Read-Only Implementation

The first product implementation is intentionally small:

- `/transparency` renders `ProtocolEconomyBand`, a compact read-only band for
  seated wallets, net USDC routed, receipt routing totals, verified receipts,
  inactive source attribution, and future disabled modules.
- `/my-syndicate` renders `MyEconomy`, a wallet-level read-only section for
  receipts, USDC placed, net USDC routed, SYN received, routing impact, Archive
  memories, and inactive/pending economy systems.
- `MyPurchaseRouting` reads per-wallet Vault, Liquidity, and Operations from
  indexed receipt fields instead of re-splitting gross USDC. This keeps future
  source-attributed V3 receipts reconstructable.

These surfaces do not create source records, do not activate claim UI, do not
route non-zero source IDs, do not switch registries, and do not describe future
modules as live.
