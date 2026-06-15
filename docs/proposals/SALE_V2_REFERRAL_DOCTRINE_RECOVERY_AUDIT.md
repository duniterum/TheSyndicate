# The Syndicate — Referral Doctrine Recovery Audit

> **⚠️ SUPERSEDED — HISTORICAL PLANNING (referral model). Retained for decision-history only.**
> This document predates the ratified decision that **Sale V2 referral is TIERED from day one**
> through the external `CommissionRouterV1` (tier axis = verified referred-member count). The old
> "flat 5%" is **fully superseded** — not a tier and not a fallback: with no router set the sale pays
> NO referral (the full Operations slice goes to Operations); the lowest tier (Signal) pays 30% of
> the Operations slice (3% of gross). Any
> statement below that Sale V2 referral is "flat 5% only," or that tiers are deferred to a later
> version (V3+), is **no longer current**. Current truth:
> `docs/proposals/SALE_V2_COMMISSION_ROUTER_V1_REVIEWER_PACKET.md`,
> `docs/proposals/SALE_V2_PROTOCOL_FREEZE_REVIEW.md` (item 1), and
> `docs/proposals/SALE_V2_TIERED_REFERRAL_FEASIBILITY_AND_MINIMAL_SAFE_ARCHITECTURE.md`.

**Purpose:** Recover protocol memory. This is a **decision-archaeology** pass, not a redesign. It
lists what has **already been decided** about referral / commission / attribution across the project,
reconstructs how those decisions evolved, and surfaces every contradiction — **without** proposing
any new model, rate, or recommendation.

**Strict scope:** READ-ONLY. No Solidity, no Sale V2 change, no frontend change, no new referral
model, no deployment. Nothing below is a recommendation; every line is a recovered fact with its
source.

**Sources inspected (verbatim quotes carried through):** the V2 draft contract, RAL doctrine,
Unified Doctrine Map, Builder Record + Reputation doctrines, Legal Disclosure doctrine, Protocol-in-
Public doctrine, Sprint 0 reconciliation, Sale V2 architecture doc, the Full Protocol View audit,
Master Completion Pass, Syndicate Operating System, NFT/Archive decision docs, and the live/reserved
referral code (`src/lib/referral-attribution.ts`, `src/lib/future-referral.ts`,
`src/lib/preview/referral.ts`).

> **One orienting fact before the detail:** the project contains **four** distinct referral
> artifacts, each at a different layer and a different status. They do not all say the same thing.
> 1. **Doctrine (RAL / CommissionRouter)** — a *tiered*, shared-contract attribution layer. Status:
>    *Doctrine, not implemented.*
> 2. **Reserved code model (`future-referral.ts`)** — *attribution-first*, reward **PENDING** until a
>    contract exists. Status: *Reserved, no contract.*
> 3. **Live off-chain capture (`referral-attribution.ts` + `/referral`)** — pure `?ref=` attribution,
>    **no reward/commission/payout**, UX commission estimator **SIMULATED**. Status: *Live (attribution
>    only) / Simulated (commission UX).*
> 4. **Sale V2 draft** — a *flat 5%* **live, in-transaction payout** carved from Operations. Status:
>    *Draft contract.*
>
> Artifact 4 (a live payout) is what the rest of the canon repeatedly deferred to "the future." That
> gap is the heart of this audit.

---

# Part 1 — What has already been decided

Each row: **source file · section · exact decision (quoted) · status**. Status uses each doc's own
`Status:` line where present (active = ratified/live, draft = proposed-not-live, superseded =
overridden by a later decision, unclear = stated but unreconciled).

### 1.A — Constitutional split rules (the parts everyone agrees on)

| # | Source · Section | Exact decision (quoted) | Status |
| - | --- | --- | --- |
| 1 | `REVENUE_ATTRIBUTION_LAYER.md` · Split rules (constitutional) | "70% Vault and 20% Liquidity are **untouched** by referrals." | **Active** (doctrine, constitutional) |
| 2 | `REVENUE_ATTRIBUTION_LAYER.md` · Split rules | "Referrer commission comes only from the 10% Operations slice." | **Active** (doctrine) |
| 3 | `REVENUE_ATTRIBUTION_LAYER.md` · Split rules | "If no referrer: Operations keeps the full 10%." | **Active** (doctrine) |
| 4 | `ERA_ENGINE_V2_RECONCILIATION_SPRINT0.md` · §B4 Referral version | "Example (100 USDC): **70 → Vault · 20 → Liquidity · 5 → Referrer · 5 → Operations.**" | **Active** (V2 standard) |

### 1.B — The commission RATE (this is where the layers diverge)

| # | Source · Section | Exact decision (quoted) | Status |
| - | --- | --- | --- |
| 5 | `REVENUE_ATTRIBUTION_LAYER.md` · Split rules | "If referrer present: `referrer = OperationsSlice × tierTable[tier]`, `operations = OperationsSlice − referrer`." | **Superseded for V2** (tiered model; V2 is flat — see #6/#7) · doctrine still on the books |
| 6 | `ERA_ENGINE_V2_RECONCILIATION_SPRINT0.md` · §B4 | "**V2 = fixed 5%**, paid **atomically in the same transaction**, sourced **only from the 10% Operations tranche**." | **Active** (ratified V2 design) |
| 7 | `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` · §D | "**Referral = fixed 5%, carved only from the 10% Operations slice.** … This matches existing canon exactly (RAL doctrine + Sprint 0)." | **Active** (draft contract) |
| 8 | `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` · §D | "**Tiered/reputation boosts = V3/future**, after legal + contract review. Reframe the current tiered preview accordingly." | **Active deferral** (tiers → V3) |

### 1.C — Ownership / architecture (who runs attribution)

| # | Source · Section | Exact decision (quoted) | Status |
| - | --- | --- | --- |
| 9 | `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` · §2.1 | "`CommissionRouter` smart contract, called by `MembershipSaleV2` / `ArchiveSaleV2` / future B2B sale wrappers. No human writes here." | **Draft** (doctrine; not implemented) |
| 10 | `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` · §2.1 | "The router's *parameters* (tier table, allowed sources) are upgrade-gated; events themselves are immutable." | **Draft** (doctrine) |
| 11 | `REVENUE_ATTRIBUTION_LAYER.md` · Attribution event | "the `source` field is `bytes32` and the allow-list is governance-gated — this is the only V3 commitment made today." | **Active** (doctrine) |
| 12 | `REVENUE_ATTRIBUTION_LAYER.md` · Canonical Attribution event (locked for V1) | `Attribution{ source, campaign, token, gross, buyer, referrer, tier, splits[5], paymentMode, attribution, refTag }` | **Unclear** (labeled "locked for V1" but **not** emitted by V2 — see #18, Part 3) |

### 1.D — Attribution model & payout mechanics

| # | Source · Section | Exact decision (quoted) | Status |
| - | --- | --- | --- |
| 13 | `REVENUE_ATTRIBUTION_LAYER.md` · Attribution model | "**Last-verified-referrer wins** at point of sale (no retroactive attribution)." | **Active** (matches V2) |
| 14 | `REVENUE_ATTRIBUTION_LAYER.md` · Attribution model | "A buyer may **override** at the point of sale with an explicit confirmation." | **Unclear** (doctrine; **omitted** from V2 draft — see Part 3) |
| 15 | `REVENUE_ATTRIBUTION_LAYER.md` · Payout pattern | "Default: **push payout** to referrer in the same tx." / "Fallback: **escrowed** if push fails." | **Active** (matches V2) |
| 16 | `SyndicateSaleV2.draft.sol` · `buy()` | `bool referralValid = referrer != address(0) && referrer != msg.sender && knownMember[referrer];` / `refAmt = opsSlice / 2;` | **Draft** (contract code) |
| 17 | `SyndicateSaleV2.draft.sol` · `buy()` / `claimReferral()` | `try USDC.transfer(referrer, refAmt) … catch { referralOwed[referrer] += refAmt; escrowed = true; }` + pull `claimReferral()` | **Draft** (contract code) |
| 18 | `SyndicateSaleV2.draft.sol` · events | `Routed(memberNumber, vault, liquidity, operations, referral)` · `ReferralAttributed(referrer, buyer, memberNumber, amount, escrowed)` · `ReferralClaimed(referrer, amount)` | **Draft** (lean events, **not** the §1.C #12 struct) |
| 19 | `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` · J6 | Whether to emit the full RAL `Attribution` struct on-chain in V2 vs lean events + off-chain projection | **Undecided** (open review item) |

### 1.E — Live & reserved CODE (code outranks docs in this protocol)

| # | Source · Section | Exact decision (quoted) | Status |
| - | --- | --- | --- |
| 20 | `src/lib/referral-attribution.ts` · header | "This is ATTRIBUTION ONLY: • No reward. No commission. No payout. No contract. • Stored locally in the browser only (first-touch). Never written on-chain." | **Active** (live off-chain) |
| 21 | `src/lib/future-referral.ts` · header | "Reward status is **ALWAYS PENDING** until an on-chain referral contract is deployed. No live commission is implied now." | **Reserved** (no contract) |
| 22 | `src/lib/future-referral.ts` · doctrine note | "Referral is ATTRIBUTION FIRST, payout later. … This namespace is intentionally kept OUT of `ProtocolEventKind`." | **Reserved** |
| 23 | `REVENUE_ATTRIBUTION_LAYER.md` · Status | "The `/referral` route is a SIMULATED visual prototype only — no contract is deployed." | **Active** (simulated UX) |

### 1.F — Legal & public-vocabulary doctrine

| # | Source · Section | Exact decision (quoted) | Status |
| - | --- | --- | --- |
| 24 | `LEGAL_DISCLOSURE_REFERRAL.md` · Required public language | "Referral rewards are commissions on protocol membership sales." + "Commissions are paid from the **Operations slice only**." + "does not constitute a security, investment contract, or promise of profit." | **Active** (doctrine) |
| 25 | `LEGAL_DISCLOSURE_REFERRAL.md` · Banned copy | "'Passive income', 'yield', 'ROI', 'guaranteed', 'earnings projection'." + "Tier names that imply rank-based revenue ownership." | **Active** (doctrine) |
| 26 | `LEGAL_DISCLOSURE_REFERRAL.md` · Jurisdictional carve-outs (V1) | "Pending legal review before contract deployment. Until reviewed, the page is **noindex** and labeled SIMULATED." | **Active** (gating) |
| 27 | `PROTOCOL_IN_PUBLIC_DOCTRINE.md` | "**never** 'earn a commission'. Always **'be eligible for a routing when CommissionRouter ships'**." | **Active** (vocab doctrine) |
| 28 | `PROTOCOL_IN_PUBLIC_DOCTRINE.md` · §7 | Referral card = "**SIMULATED** (whole card stamped)". | **Active** |

### 1.G — Reputation & Builder Records (the future eligibility inputs)

| # | Source · Section | Exact decision (quoted) | Status |
| - | --- | --- | --- |
| 29 | `BUILDER_RECORD_DOCTRINE.md` · two-tier rule | "**Event** = one referral. Never enters Chronicle. Lives in Activity." + "**Record** = the aggregate for an address over time." | **Draft** (off-chain derived; no V1 contract) |
| 30 | `REPUTATION_FORMULA_DOCTRINE.md` | "Reputation reflects durability and retention. Never wealth." + `score = retention×0.40 + durability×0.30 + ageFactor×0.20 + reachFactor×0.10` (gross = tiebreaker only, never ≥10% weight) | **Draft** (doctrine) |
| 31 | `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` | Builder Records = "Derived view, computed off-chain from RAL events + holder index. No on-chain writes in V1." | **Draft** |

### 1.H — Roadmap status of referral payouts

| # | Source · Section | Exact decision (quoted) | Status |
| - | --- | --- | --- |
| 32 | `FULL_PROTOCOL_VIEW_CANON_FOUNDER_INTENT_MAP.md` · §12 | "**Status: PENDING / FUTURE** (all)" · "**Contracts:** CommissionRouter … all future" | **Future** |
| 33 | `MASTER_COMPLETION_PASS_REMAINING_WORK_MAP.md` · G3 | "Referral rewards / commission" = **FUTURE**, action "**Do NOT build**", "Priority P4". | **Deferred** |
| 34 | `SYNDICATE_OPERATING_SYSTEM.md` · §2.7 Referral / Growth Engine — NEXT | "**Legal gate:** recognition only — never payouts, never yield, never tiered rebates." | **Active** (doctrine, NEXT) |

### 1.I — NFT royalty (adjacent "5%" — NOT referral)

| # | Source · Section | Exact decision (quoted) | Status |
| - | --- | --- | --- |
| 35 | `SMART_CONTRACT_DECISIONS_PENDING.md` · C1 | "Royalty % (ERC-2981): **TBD (0% or 2.5–5%)**." | **Open** (Archive1155, founder) |
| 36 | `NFT_ARCHIVE_SMART_CONTRACT_ARCHITECTURE_V1.md` | "Default **5% to operations wallet**, single setter. **Never marketed as revenue.**" | **Active** (Archive1155 default; secondary royalty) |
| 37 | `TODAY_BASELINE_STATE_SNAPSHOT.md` · §8.1 | "NFT mint proceeds accrue to the Archive owner wallet (**NOT** the 70/20/10 split)." | **Active** |

---

# Part 2 — Referral evolution timeline

**Phase A — Tiered Revenue Attribution Layer (original idea).**
A shared `CommissionRouter` contract owns attribution for *every* sale (`MembershipSaleV2` /
`ArchiveSaleV2` / future B2B). Commission is **tiered**: `referrer = OperationsSlice × tierTable[tier]`,
tier read from the holder index at tx time. A full `Attribution{ source, campaign, tier, splits[5],
paymentMode, attribution, refTag }` event is "locked for V1." Buyer-override supported. Builder
Records + Reputation are the future inputs that would shape tiers. The `/referral` page shows a
**tiered** commission estimator. *(Sources: `REVENUE_ATTRIBUTION_LAYER.md`, `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §2.1.)*

**Phase B — Pull-back to attribution-only / recognition-only (revised idea).**
The protocol then *defers all payout*. Code reserves only the **shape** (`future-referral.ts`: reward
status "ALWAYS PENDING until an on-chain referral contract is deployed"); the live surface becomes
pure off-chain `?ref=` capture (`referral-attribution.ts`: "No reward. No commission. No payout. No
contract."); the public vocabulary doctrine bans "earn a commission" in favor of "be eligible for a
routing when CommissionRouter ships"; the Operating System §2.7 sets the legal gate to "recognition
only — never payouts, never tiered rebates"; Master Completion Pass marks commission "FUTURE / Do NOT
build / P4"; the Full Protocol View marks the whole module "PENDING / FUTURE"; the Legal Disclosure
keeps `/referral` **noindex + SIMULATED** pending legal review.

**Phase C — Sale V2 draft re-introduces a live payout, simplified (current idea).**
Sprint 0 §B4 and the Sale V2 architecture doc ratify a **flat 5%**, **paid atomically in the same
transaction**, sourced **only from the 10% Operations tranche**, inlined into `buy()` (no
CommissionRouter), with **lean events** (`Routed` + `ReferralAttributed`, not the full `Attribution`
struct), **no tier table**, **no buyer-override**. Wording fixed to "direct sales commission." Tiered
/ reputation-weighted commission explicitly punted to **V3**.

### Is the current 5% model "final / simplification / placeholder / V2-only"?

Recovered answer (stated as what the docs say, not a recommendation):

- It is **not the final long-term model.** The long-term model is the *tiered* RAL/CommissionRouter
  (Phase A), and `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` §D explicitly defers tiers to V3.
- It is a **simplification** of the tiered model: `tierTable[tier]` collapsed to a single fixed rate
  (`opsSlice / 2` = 5% of gross).
- It is **V2-only / a V2 compromise**: ratified specifically for V2 in Sprint 0 §B4 ("V2 = fixed 5%")
  and the V2 architecture doc, with the richer model reserved for the shared router later.
- It is **more than a placeholder** in the V2-contract sense (it is a ratified V2 design that the
  draft implements) — **but** it sits against a still-standing parallel track (Phase B docs) that
  treats *any* referral payout as future / attribution-only / "Do NOT build." **That cross-track
  reconciliation has not been recorded anywhere.** (See Part 3 #1.)

---

# Part 3 — Current contradictions

Every mismatch found, with both sides quoted. (Recovery only — not adjudicated here.)

**C1 — Live payout (V2) vs payout-is-future (everything else). [most material]**
- V2 side: "V2 = fixed 5%, paid **atomically in the same transaction**" (`SPRINT0` §B4); draft
  `buy()` pushes USDC to the referrer in-tx.
- Doctrine side: "recognition only — **never payouts**" (`SYNDICATE_OPERATING_SYSTEM` §2.7); "Reward
  status is **ALWAYS PENDING** until an on-chain referral contract is deployed" (`future-referral.ts`);
  "Referral rewards / commission … **Do NOT build** … P4" (`MASTER_COMPLETION_PASS` G3); "Status:
  PENDING / FUTURE (all)" (`FULL_PROTOCOL_VIEW` §12); `/referral` "noindex + SIMULATED" pending legal
  (`LEGAL_DISCLOSURE_REFERRAL`).
- **Mismatch:** the four "future/attribution-only" layers were never updated to say "V2 is the moment
  the payout goes live." As written, V2 contradicts them.

**C2 — Tiered commission vs flat 5% vs "never tiered rebates."**
- RAL: "`referrer = OperationsSlice × tierTable[tier]`" (tiered).
- V2: `refAmt = opsSlice / 2` (flat, no tier).
- Operating System §2.7: "never tiered rebates."
- Architecture §D: "Tiered/reputation boosts = V3/future."
- **Mismatch:** four documents describe four different stances (tiered now / flat now / never tiered /
  tiered later). The reconciliation ("flat in V2, tiered in V3, never as a *rank-revenue* rebate") is
  implied but not stated in one place.

**C3 — Event schema: canonical Attribution vs lean events.**
- RAL: full `Attribution{ source, campaign, token, gross, buyer, referrer, tier, splits[5],
  paymentMode, attribution, refTag }` "locked for V1."
- V2: `Routed` + `ReferralAttributed` only (no `source`, `campaign`, `tier`, `refTag`,
  `paymentMode`-as-field, or override flag).
- **Mismatch:** a schema labeled "locked for V1" is not the schema V2 emits. J6 (whether to emit the
  full struct on-chain) is still open.

**C4 — Buyer-override: present in doctrine, absent in V2.**
- RAL: "A buyer may **override** at the point of sale with an explicit confirmation" (`attribution`
  field: 0 = last-verified, 1 = buyer-confirmed override).
- V2: only last-verified (the `referrer` arg); no override field or flag.
- **Mismatch:** the override capability in the locked doctrine is silently dropped by V2.

**C5 — Vocabulary: "commission" allowed vs banned.**
- Legal Disclosure: "Referral rewards **are commissions** on protocol membership sales"; Sprint 0:
  wording "**direct sales commission**."
- Protocol-in-Public: "**never** 'earn a commission'. Always 'be eligible for a routing when
  CommissionRouter ships'."
- **Mismatch:** one track licenses the word "commission"; another bans it. (Both agree on banning
  yield / ROI / passive income / revenue share.)

**C6 — Reputation feeds tiers (doctrine) vs reputation excluded (V2/legal).**
- RAL/Reputation: tier could be reputation/holder-index-derived; Builder Records feed Reputation.
- V2: no tier, no reputation input. Legal bans "tier names that imply rank-based revenue ownership";
  Reputation doctrine forbids `gross` as a primary driver (never ≥10% weight).
- **Mismatch (latent):** if/when tiers return, the tier source must satisfy "never wealth" — not yet
  reconciled with the holder-index/`gross`-adjacent tiering the RAL split implies.

**C7 — "5%" collision: referral vs ERC-2981 royalty.** *(Not a true contradiction — a naming
collision to keep distinct.)*
- Referral 5% = primary membership sale, carved from the **Operations** slice, paid to the referrer.
- ERC-2981 5% (Archive1155 default) = **secondary** NFT royalty, paid to the **operations wallet**,
  "Never marketed as revenue"; NFT proceeds accrue to the Archive owner, **not** the 70/20/10 split.
- **Risk:** two unrelated "5%"s in the same protocol; conflating them would corrupt the routing story.

---

# Part 4 — What Sale V2 currently assumes (no change made)

Read straight from `docs/proposals/drafts/SyndicateSaleV2.draft.sol` (and the Sprint 0 / architecture
doc that ratified it):

- **Referral percentage:** flat **5% of gross** = `opsSlice / 2` (exactly half of the ~10% Operations
  slice). Vault (70%) and Liquidity (20%) are arithmetically untouched. No tier table.
- **Referral eligibility:** `referrer != address(0) && referrer != msg.sender && knownMember[referrer]`.
  `knownMember` = a prior V2 buyer **or** a V1 member who registered via `claimV1Membership(proof)` (a
  gasless-to-buyer Merkle self-registration that grants no seat and does not advance the seat counter).
  If invalid → `refAmt = 0` and Operations keeps the full 10%.
- **Referral payout source:** the **10% Operations slice only** (`opsAmt = opsSlice − refAmt`). Never
  Vault, never Liquidity.
- **Referral settlement:** **push in the same tx** (`USDC.transfer(referrer, refAmt)`), paid **by the
  contract** in the order Vault → Liquidity → Referrer → Operations; on push failure (`try/catch`,
  e.g. USDC blacklist) the amount is **escrowed** to `referralOwed[referrer]` and the buy proceeds;
  the referrer later withdraws via `claimReferral()` (`nonReentrant`).
- **Referral events:** `ReferralAttributed(referrer, buyer, memberNumber, amount, escrowed)` (only
  when `refAmt > 0`), `Routed(memberNumber, vault, liquidity, operations, referral)`,
  `ReferralClaimed(referrer, amount)`. **Not** the full RAL `Attribution` struct.
- **Future extensibility:** **none on-chain** — V2 is immutable; no `source`, `campaign`, `tier`,
  `refTag`, or buyer-override fields. Forward-compatibility is assumed to come from **off-chain
  projection** of the lean events onto the RAL `Attribution` shape; tiered/reputation boosts are
  assumed to arrive in **V3 via CommissionRouter**, not in V2. (J6 — emit the full struct on-chain —
  remains open.)

---

# Part 5 — Founder decision checklist (referral only)

Sorted into the four buckets requested. **No recommendations** — this is the state of the record.

### ✅ Already decided (ratified / active in the record)
- 5% referral is carved **only from the 10% Operations slice**; Vault/Liquidity never diluted.
- The V2 referral rate is **fixed 5%**, paid **atomically in the same tx** (Sprint 0 §B4; Arch §D).
- **Push-then-escrow** settlement + `claimReferral()` pull fallback.
- Eligibility = recognized member, not self, not zero (`knownMember && != buyer && != address(0)`).
- **Last-verified-referrer**, no retroactive attribution.
- **Tiered / reputation boosts are deferred to V3** (not in V2).
- The long-term owner of attribution is the shared **CommissionRouter** (called by all sale wrappers).
- The `Attribution.source` allow-list is **governance-gated** (the only V3 commitment made today).
- Banned vocabulary: yield / ROI / passive income / revenue share / dividend / earnings projection.
- NFT **ERC-2981 royalty (5%)** is a **separate** mechanism from referral, with separate treasury.

### ❓ Undecided (open in the record)
- **J6:** does V2 emit the full RAL `Attribution` struct on-chain, or lean events + off-chain
  projection? (Open review item.)
- Whether V2 carries any `source` / `campaign` / `refTag` at all (currently it carries none).
- **C1:** ERC-2981 royalty % for Archive1155 (0% or 2.5–5%) — adjacent, affects the "5%" collision.
- The actual **ship timing** of CommissionRouter (recorded only as "future," no milestone).

### ⚠️ Conflicting (needs founder reconciliation before Solidity review proceeds on economics)
- **C1 (Part 3):** Is V2 the moment referral **payouts go live**, or does the "recognition only / Do
  NOT build / PENDING / reward PENDING / noindex+SIMULATED" track still hold? The draft says payouts
  go live; four other layers say they don't.
- **C2:** flat-5% (V2) vs tierTable (RAL) vs "never tiered rebates" (OS §2.7) vs "tiers = V3" (Arch).
- **C3:** "Attribution event locked for V1" (RAL) vs V2's lean events.
- **C4:** buyer-override (RAL) vs no override (V2).
- **C5:** "commission" is licensed (Legal/Sprint 0) vs banned (Protocol-in-Public).

### ❌ Missing (no decision found anywhere in the record)
- No recorded decision on **whether `/referral` flips from SIMULATED → LIVE** when V2 ships (legal
  carve-outs are "pending legal review before contract deployment").
- No recorded decision **reconciling `future-referral.ts` "reward PENDING"** with a live V2 payout
  (the reserved code model would be contradicted the moment V2 pays a referrer).
- No recorded **jurisdictional legal sign-off** (Legal Disclosure: "Pending legal review before
  contract deployment").
- No recorded decision on the **off-chain V2 → RAL event adapter** that the lean-events approach
  assumes will exist.
- No recorded decision addressing **same-human multi-wallet self-referral** (eligibility only blocks
  `referrer == msg.sender`; a person controlling two known wallets is not addressed). *(Stated as a
  gap in the record, not a proposed fix.)*

---

*Recovery complete. This document modifies no protocol code, configuration, canon, or contract, and
makes no recommendation. The decision of how to reconcile the conflicts in Part 3 — especially C1 —
is the founder's, and must be made before Sale V2 economics or Solidity are touched.*
