# The Syndicate — Referral System Doctrine Report (Complete Inventory)

**Mode:** READ-ONLY inventory. No code, no Solidity, no frontend, no deploy, no doctrine changes.
**Purpose:** Before any architecture decision, enumerate **everything** that already exists across
referral / commission / reputation / builder-record / attribution — so no prior protocol decision is
silently overwritten by a simplified referral-count model.

**Reading note (so you can trust this):** every CODE item below was read directly this session. Every
DOCTRINE item was read directly. Where a prior async search summary disagreed with the source, the
**source wins** and I flag it. Two such corrections up front:
1. **The V2 flat-5% commission is DRAFT / PENDING, not LIVE.** It exists only in
   `docs/proposals/drafts/SyndicateSaleV2.draft.sol`, which is not deployed. The **only live**
   referral-related code is the off-chain `?ref` attribution capture (recognition, no reward).
2. There is **no** `docs/RANK_DISTRIBUTION_SPEC.md`. The real rank file is
   `docs/RANK_CONSTITUTIONAL_RULING.md`. Wealth-leaderboard bans are real but live in that file +
   `docs/SYNDICATE_OPERATING_SYSTEM.md`.

**Status legend:** LIVE (deployed/shipped & active) · PREVIEW/SIMULATED (visible, labeled, fake data) ·
PENDING (designed, honest "not yet" shell shown) · FUTURE (doctrine/reserved, no UI) · DEFERRED
(explicitly postponed) · DRAFT (Solidity draft, not deployed) · REJECTED (anti-doctrine, never).

> **Scope honesty:** the project has ~80 audit/report `.md` files that *mention* these words in
> passing. This report itemizes every **defining** surface (code, draft, doctrine, preview, dev,
> reserved) — not every passing mention in an audit. The defining set is complete.

---

## PART 1 — MASTER INVENTORY (every defining item, fields 1–8)

For each item: **(1) file · (2) status · (3) behavior · (4) variables · (5) dependencies · (6)
implemented? · (7) planned-only? · (8) conflicts with count-based CommissionRouter?**

### 1.1 — LIVE (shipped & active today)

| # | File | Status | Exact behavior | Variables | Implemented? | Planned-only? | Conflicts w/ count router? |
|---|---|---|---|---|---|---|---|
| 1 | `src/lib/referral-attribution.ts` | **LIVE** | Captures `?ref=<memberNumber>` first-touch into `localStorage`; parses/validates a positive integer member number; builds share URLs. **Attribution only — no reward, no contract, no on-chain write.** | `REF_PARAM="ref"`, `REF_STORAGE_KEY="syn:ref-attribution"`, `StoredReferral{memberNumber, capturedAt}` | Yes | No | **No** — this is the capture layer that *feeds* a count; it never pays or tiers. |
| 2 | `src/components/syndicate/ReferralCapture.tsx` | **LIVE** | Mounts once at root; records first-touch attribution; renders nothing. | — (calls `captureReferralFromLocation`) | Yes | No | No |
| 3 | `src/components/syndicate/ReferralAttributionNote.tsx` | **LIVE** | Shows "Brought by Member #N" **only** when the stored ref resolves to a real member in the holder index; suppresses self-referral. | `refNumber`, `idx.ordered`, `ownNumber` | Yes | No | No |
| 4 | `src/components/syndicate/cockpit/CockpitIntroducedBy.tsx` | **LIVE** | Cockpit "Introduced by Member #N · Attribution only · recognition"; resolves via holder index; client-only read. | `refNum`, `referrer.founderNumber`, `referrer.wallet` | Yes | No | No |

**Live truth:** the entire live referral system is **recognition-only attribution** (who brought whom),
stored in the browser, displayed only after on-chain resolution. **Zero money. Zero tiers. Zero
reputation.** It depends on **referral attribution only** — not SYN, rank, reputation, builder, NFTs,
achievements, retention, durability, age, activity, campaign, or source.

### 1.2 — PENDING (honest "not yet" shells shown to members)

| # | File | Status | Exact behavior | Variables / concepts named | Implemented? | Planned-only? | Conflicts? |
|---|---|---|---|---|---|---|---|
| 5 | `src/lib/future-referral.ts` | **PENDING (reserved model)** | Reserves the SHAPE of a future referral event. `rewardStatus` is **forced to `"PENDING"`** and cannot be overridden. Kept OUT of `ProtocolEventKind`. | `FutureReferralAttribution{referrerMember, newMember, saleUsdc?, usdcRouted?, synSold?, rewardStatus, legalNote}`, `FUTURE_REFERRAL_NOTE` | Shape only (no contract) | Yes | No — forward-compatible with any model |
| 6a | `MyReferralCard` in `src/components/syndicate/MyReferralCard.tsx` | **PENDING** | Cockpit shell: "Referral · Pending — Recognition, not payout." States commission will come **only from the 10% Operations slice**, Vault/Liquidity never touched, nothing tracked/owed today. | StatusPill=PENDING | Shell only | Yes | No |
| 6b | `MyReputationConceptCard` (same file) | **PENDING** | Cockpit shell listing the **intended reputation inputs**: Retention, Durability, Referrer age, Active reach; **Gross USDC = tiebreaker only**; "Not a top-earners board." No formula locked. | retention, durability, referrer age, active reach, gross(tiebreaker) | Shell only | Yes | No (reputation is a separate off-chain layer) |
| — | `src/lib/protocol-event-registry.ts` | **FUTURE (reserved namespaces)** | Declares `FUTURE_EVENT_NAMESPACES` `"referral-attribution"` / `"referral-reward"`, deliberately excluded from the live event pipeline so no consumer must handle them yet. | namespace strings | Reserved | Yes | No |

### 1.3 — PREVIEW / SIMULATED (visible at `/referral`, noindex, fake data)

| # | File | Status | Exact behavior | Key variables | Implemented (as preview)? | Planned-only (as product)? | Conflicts? |
|---|---|---|---|---|---|---|---|
| 7 | `src/routes/referral.tsx` | **SIMULATED** (noindex,nofollow) | Public explainer page. Renders split visualizer, **tier ladder**, commission-by-tier chart, simulated activity, **reputation leaderboard + builder-score + retention** charts, disclosure. Connected users are pointed to `/my-syndicate#my-referral`. | section ids: `split, tiers, commission-chart, activity, reputation, disclosure` | Yes (preview) | Yes (product) | No (it *is* the tiered+reputation vision on display) |
| 8 | `src/lib/preview/referral.ts` | **SIMULATED** (quarantined A/B/C/D) | The data + math behind the preview. **`REFERRAL_TIERS` is count-based** (`threshold` = verified referred members) **plus a `retentionRequiredPct` gate**. `tierForCount()` is pure count. `builderScore()` = `retention×.4 + durability×.3 + age×.2 + reach×.1`. Also sim leaderboard, sim activity, sim treasury rows (RAL-shaped). | `REFERRAL_TIERS`, `PROTOCOL_SPLIT{70,20,10}`, `tierForCount`, `referrerShareOfGross`, `builderScore`, `SIM_REFERRERS`, `SIM_TREASURY_ROWS` | Yes (preview) | Yes (product) | **Partial** — tier *thresholds* are count-based (aligned); the `retentionRequiredPct` gate + builderScore are **above** a count-only router (see §E) |
| 9 | `src/components/preview/ReferralPreview.tsx` | **SIMULATED** | Renderers: `TierLadderPreview`, `SimReferralActivity`, `CommissionByTierChart`, `ReferralDisclosure`, `SplitVisualizerSection`. Display only. | inherits #8 | Yes | — | No |
| 10 | `src/components/preview/ReputationLeaderboardPreview.tsx` | **SIMULATED** | Renderers: `ReputationLeaderboard`, `BuilderScoreComparisonChart`, `RetentionOverTimeChart`. Display only. | inherits #8 | Yes | — | No |
| 11 | `src/components/preview/SplitVisualizer.tsx` | **SIMULATED** | Visualizes 70/20/10 with referral drawn from Operations only. | `PROTOCOL_SPLIT` | Yes | — | No |
| 12 | `src/components/preview/TreasuryLedgerPreview.tsx` | **SIMULATED** | Ledger rows whose schema **mirrors the canonical RAL Attribution event** (forward-compatible). Includes an `OPERATIONS_TO_REFERRER` row. | `SIM_TREASURY_ROWS`, `TREASURY_CATEGORIES` | Yes | — | No |

### 1.4 — LABS (separate system that reuses the word "Reputation" — terminology collision)

| # | File | Status | Exact behavior | Variables | Implemented? | Conflicts? |
|---|---|---|---|---|---|---|
| 13 | `src/labs/components/MembersLeaderboard.tsx` | **LABS (LIVE/DEMO from purchase events)** | "Ranked by Reputation" — but this "reputation" = **purchase-weighted**: `score = √(usdcTotal) × (1 + log₂(1 + purchaseCount))`, blending rank + total USDC + buy count. **Not referral-based.** | `usdcTotal`, `purchaseCount`, `rank`, `archiveWeight` | Yes (labs) | **Collision risk** — this is money-weighted, which the *referral* Reputation doctrine forbids (gross may never be a primary driver). Quarantined in labs. |

### 1.5 — DRAFT (Solidity, not deployed)

| # | File | Status | Exact behavior | Variables | Implemented? | Planned-only? | Conflicts? |
|---|---|---|---|---|---|---|---|
| 14 | `docs/proposals/drafts/SyndicateSaleV2.draft.sol` | **DRAFT** | Inline **flat** referral: `refAmt = opsSlice / 2` = **5% of gross = half of Operations**. Vault 70% / Liquidity 20% paid first, never touched. `knownMember` is on-chain (V1 via immutable Merkle `V1_MEMBER_ROOT` / `claimV1Membership`; V2 set on buy). Push-then-escrow (`referralOwed` + `claimReferral`). `referralValid = referrer != 0 && referrer != buyer && knownMember[referrer]`. | `usdcContributed`, `memberNumberOf`, `knownMember`, `referralOwed`, `opsSlice`, `refAmt` | No (draft) | Yes | **It is FLAT, not tiered.** A count router is a *superset*; but referral logic is **inline**, so adopting a router is a design change (extract). Tracks no `referredCount` yet (trivially addable on-chain). |

### 1.6 — DOCTRINE / CANON (the design of record — what the founder fears overwriting)

| # | File | Status | Exact behavior (what it mandates) | Dependencies it names | Conflicts w/ count router? |
|---|---|---|---|---|---|
| 15 | `docs/REVENUE_ATTRIBUTION_LAYER.md` (RAL) | **FUTURE doctrine** (not implemented) | THE canonical referral spec. **Commission is TIERED**: `referrer = OperationsSlice × tierTable[tier]`, `operations = OperationsSlice − referrer`. Locks an immutable **Attribution event**: `source, campaign, token, gross, buyer, referrer, tier, splits[5], paymentMode, attribution(0=last-verified / 1=buyer-override), refTag`. Last-verified-referrer wins + buyer override; push-then-escrow; **source allow-list is governance-gated** (B2B/affiliate/sponsorship/whitelabel/treasury-deal). **V1 explicitly excludes** CampaignRegistry, AcceptedTokenRegistry, TierOracle, on-chain Reputation, Builder-Score contract, auto-Chronicle. | referrer **tier** (count-derived), source, campaign, buyer-override | **Aligned** — doctrine is *already tiered*. The FLAT draft is the outlier vs doctrine, not the tiered router. A count router must emit this **full** event or it starves reputation/builder (see §E). |
| 16 | `docs/REPUTATION_FORMULA_DOCTRINE.md` | **FUTURE doctrine** (preview formula not final) | Constitutional rule: *"Reputation reflects durability and retention. Never wealth."* `score = retention×.4 + durability×.3 + ageFactor×.2 + reachFactor×.1`; **gross = tiebreaker only**. Forbidden: gross ≥10% weight; rewarding single bursts; non-governance edits. Derived **off-chain** from RAL events. | retention, durability, member age, activity (active reach), gross(tiebreaker) | **No** — reputation is a *separate off-chain recognition layer*, never an on-chain commission input. It reads RAL events; it does not gate payout. |
| 17 | `docs/BUILDER_RECORD_DOCTRINE.md` | **FUTURE doctrine** (no UI beyond preview) | Two-tier: **Event** (one referral → Activity) vs **Record** (aggregate per address). Dwell windows: 6mo Visible · 1y Reputation badge · 3y Artifact mint · 5y Chronicle entry — all via the **Mythology Gate**. Record holds: total attributed USDC, count of referred buyers, retention (90d/1y/3y), age of oldest active buyer, first/last referral block. **Off-chain derived, no contract in V1.** Forbidden: rank-by-gross-only, manual edits, promotion without the Gate. | referral count, retention, durability, member age, builder score | **No** — a history/recognition layer **above** the router; reads RAL events. |
| 18 | `docs/LEGAL_DISCLOSURE_REFERRAL.md` | **FUTURE doctrine** | Required public language (commission on sales; **Operations-only**; not a security/investment/profit promise; local-law notice; total-loss warning). **Banned copy:** "passive income / yield / ROI / guaranteed / earnings projection", implied SYN appreciation, **tier names implying rank-based revenue ownership**. Page stays **noindex + SIMULATED** until legal review. | — | No (constrains copy, not model) |
| 19 | `docs/TREASURY_LEDGER_DOCTRINE.md` | **FUTURE doctrine** | Downstream consumer of RAL emissions; ledger rows reconstruct the split (incl. `OPERATIONS_TO_REFERRER`). | reads RAL event | No |
| 20 | `docs/UNIFIED_PROTOCOL_DOCTRINE_MAP.md` | **Doctrine (neighbor graph)** | Places Referral (RAL) among its neighbors (Treasury Ledger, Builder Records, Reputation); 4-verb Money/Time/History/Constitution framing. | — | No |

### 1.7 — PROPOSALS (this review series — analysis, not doctrine)

| File | Status | Role |
|---|---|---|
| `SALE_V2_REFERRAL_PROTOCOL_MEMORY_RECOVERY.md` | Analysis | 20-concept classification (what's abandoned vs future). |
| `SALE_V2_REFERRAL_DOCTRINE_RECOVERY_AUDIT.md` | Analysis | Doctrine recovery audit. |
| `SALE_V2_REFERRAL_ARCHITECTURE_REVIEW.md` | Analysis | Architecture review. |
| `SALE_V2_REFERRAL_FOUNDER_RECONCILIATION_DECISION_REPORT.md` | Analysis | Reconciliation of flat vs tiered. |
| `SALE_V2_REFERRAL_LAUNCH_EXECUTION_PLAN.md` | Analysis | Earlier recommended Decision A (later overridden). |
| `SALE_V2_TIERED_REFERRAL_FEASIBILITY_AND_MINIMAL_SAFE_ARCHITECTURE.md` | Analysis | The count-based CommissionRouter proposal now under scrutiny. |

### 1.8 — REJECTED / ABANDONED (anti-doctrine — never build)

| Concept | Where ruled out | Status |
|---|---|---|
| MLM / multi-level downlines, pay-to-rank bonus tokens | `roadmap.tsx` NEVER bucket ("Pay-to-rank bonus tokens"), `RANK_CONSTITUTIONAL_RULING.md` | **REJECTED** |
| Wealth / top-earner leaderboards (referral) | `REPUTATION_FORMULA_DOCTRINE.md`, `RANK_CONSTITUTIONAL_RULING.md` | **REJECTED** |
| Streaks / countdowns / daily-login / badge gamification | `SYNDICATE_OPERATING_SYSTEM.md`, money/Signal guardrail | **REJECTED** |
| SYN-balance or rank-amount weighted commission | `06_FINANCIAL_TRACE_AND_GUARDRAILS.md`, rank ruling | **REJECTED (forbidden wealth signal)** |

> **Roadmap gap (observation, not a recommendation):** referral does **not** appear in the public
> `/roadmap` five buckets (Live/Next/Pending/Future/Never). It lives only on `/referral` (SIMULATED,
> noindex). If/when an axis is chosen, the roadmap is the honest place to bucket it.

---

## A — Current REFERRAL truth map

| Layer | Where | Status | What it actually is |
|---|---|---|---|
| **Attribution capture** | `referral-attribution.ts`, `ReferralCapture.tsx` | **LIVE** | `?ref=<memberNumber>` first-touch in localStorage. No reward. |
| **Attribution display** | `ReferralAttributionNote.tsx`, `CockpitIntroducedBy.tsx` | **LIVE** | "Brought by / Introduced by Member #N" after on-chain resolution; self-referral suppressed. |
| **Reserved event model** | `future-referral.ts`, `protocol-event-registry.ts` namespaces | **PENDING/FUTURE** | Forward-compatible shape; `rewardStatus` permanently `PENDING`; out of the live pipeline. |
| **Personal cockpit surface** | `MyReferralCard` | **PENDING** | Honest "no contract, nothing owed" shell; Operations-only promise. |
| **Public explainer + tiers** | `/referral`, `preview/referral.ts` | **SIMULATED** | Count-based tier ladder (+retention gate) shown as the *future* model, fake data. |
| **On-chain commission** | `SyndicateSaleV2.draft.sol` | **DRAFT** | Flat 5% (= ½ Operations), inline, not deployed. |
| **Canonical spec** | `REVENUE_ATTRIBUTION_LAYER.md` | **FUTURE doctrine** | **Tiered** commission + immutable Attribution event + buyer-override + campaign + governance-gated source allow-list. |

**Referral one-liner:** *Live = recognition-only attribution. Designed (doctrine) = tiered commission
from Operations with a rich, forward-compatible event. Draft = flat 5%. Preview = the tiered+reputation
vision, simulated.*

---

## B — Current REPUTATION truth map

| Item | Where | Status | Inputs | Money rule |
|---|---|---|---|---|
| **Reputation doctrine** | `REPUTATION_FORMULA_DOCTRINE.md` | **FUTURE doctrine** | retention .40, durability .30, age .20, reach .10; **gross = tiebreaker only** | "Never wealth." gross ≥10% weight = forbidden. |
| **Reputation preview** | `/referral`, `ReputationLeaderboardPreview.tsx`, `builderScore()` | **SIMULATED** | same formula, fake `SIM_REFERRERS` | money quarantined (A/B/C/D) |
| **Reputation concept (cockpit)** | `MyReputationConceptCard` | **PENDING** | retention, durability, referrer age, active reach; gross tiebreaker | "Not a top-earners board" |
| **Labs "Reputation" (DIFFERENT)** | `MembersLeaderboard.tsx` | **LABS** | `√(usdcTotal) × (1+log₂(1+buys))` — **purchase-weighted** | **Conflicts with referral reputation doctrine** (money is the primary driver). Quarantined in labs. |

**Reputation one-liner:** *Referral-Reputation is durability-first, money-as-tiebreaker, off-chain,
not yet implemented. A separate labs "Reputation" is purchase-weighted and would violate the referral
doctrine if ever merged — keep them apart.*

---

## C — Current BUILDER-RECORD truth map

| Item | Where | Status | What it holds |
|---|---|---|---|
| **Builder Record doctrine** | `BUILDER_RECORD_DOCTRINE.md` | **FUTURE doctrine / DEFERRED** | Event vs Record; dwell windows (6mo→5y) gated by the Mythology Gate; aggregate of attributed USDC, referred-buyer count, multi-window retention, oldest-active-buyer age, first/last block. Off-chain, no contract V1. |
| **Builder Score preview** | `builderScore()` in `preview/referral.ts`, `BuilderScoreComparisonChart` | **SIMULATED** | `retention×.4 + durability×.3 + age×.2 + reach×.1`; gross tiebreaker. Labeled NOT FINAL. |
| **Builder concept (cockpit)** | `MyReputationConceptCard` | **PENDING** | names the same inputs as a future concept |

**Builder one-liner:** *Builder Records are a future off-chain history/recognition layer that reads
referral events and gates long-horizon honors (Artifact/Chronicle). Nothing on-chain. Nothing depends
on a contract — only on referral events existing to read.*

---

## D — Current COMMISSION-MODEL truth map

| Model | Where | Status | Axis | Split |
|---|---|---|---|---|
| **Flat 5%** | `SyndicateSaleV2.draft.sol` | **DRAFT** | none (presence of a known-member referrer only) | `refAmt = opsSlice/2`; Vault/Liq untouched |
| **Count-based tiers** | `preview/referral.ts` `REFERRAL_TIERS` + `tierForCount()` | **SIMULATED** | **referred-member count** (+ a `retentionRequiredPct` gate) | 30/40/55/70/80% **of Operations** (= 3/4/5.5/7/8% of gross) |
| **Tiered (canonical)** | `REVENUE_ATTRIBUTION_LAYER.md` | **FUTURE doctrine** | `tierTable[tier]` (tier snapshot at tx) + buyer-override + campaign + source | `referrer = OperationsSlice × tierTable[tier]` |
| **Count-based CommissionRouter** | `SALE_V2_TIERED_REFERRAL_…ARCHITECTURE.md` | **PROPOSAL** | referred-member count (retention deferred) | Operations-only; ceiling 10% of gross |

**The locked invariants every model agrees on:** Vault **70%** + Liquidity **20%** are **never**
touched; referral is paid **only** from the **10% Operations** slice; **max ceiling = 10% of gross**;
`referralValid` requires `referrer ≠ 0 && ≠ buyer && knownMember[referrer]`; recognition, never yield.

**Designed tier ladder (single source: `preview/referral.ts`):**

| Tier | Name | Threshold (verified referred members) | % of Operations | = % of gross | Retention gate (design) |
|---|---|---|---|---|---|
| 0 | Signal | 0 | 30% | 3.0% | 0% |
| 1 | Advocate | 5 | 40% | 4.0% | 60% |
| 2 | Connector | 20 | 55% | 5.5% | 70% |
| 3 | Catalyst | 50 | 70% | 7.0% | 75% |
| 4 | Ambassador | 100 | 80% | 8.0% | 80% |

---

## E — CONFLICT MATRIX · Existing design vs proposed count-based CommissionRouter

The headline: **the count-based router does NOT contradict the doctrine — the doctrine is already
tiered.** The real risks are two specific *omissions*, not a clash.

| Existing design element | Status | Count-based router relationship | Verdict |
|---|---|---|---|
| RAL: commission = `OperationsSlice × tierTable[tier]` | Doctrine | Count router **is** a `tierTable`, indexed by count | ✅ **Aligned** |
| RAL: 70/20/10, Operations-only, 10% ceiling | Doctrine | Preserved exactly | ✅ Aligned |
| RAL: immutable Attribution event (`source, campaign, tier, gross, buyer, referrer, splits[5], paymentMode, attribution, refTag`) | Doctrine | **A minimal router that emits a THIN event (just referrer+amount) would starve reputation/builder/campaign/B2B forever** | ⚠️ **Risk #1 — must emit the FULL event** |
| RAL: buyer-override (`attribution=1`) + campaign/`refTag` + governance-gated source allow-list | Doctrine (V1 keeps source field; campaign via config) | Count-only minimal model omits override/campaign/source plumbing | ⚠️ **Subset** — fine to defer, but design the event to carry them |
| Designed tier ladder = **count + `retentionRequiredPct`** | Simulated | Count router launches **count-only** (retention is off-chain, can't gate on-chain) → tiers are **easier to reach** than designed | ⚠️ **Risk #2 — relaxation, not deletion.** Document it; gate retention later off-chain. |
| Reputation formula (durability-first, gross tiebreaker) | Doctrine | Reputation is **off-chain, separate from the commission axis** — never gated payout | ✅ No conflict (provided the event feeds it) |
| Builder Records (dwell windows, Mythology Gate) | Doctrine/Deferred | History layer **above** the router; reads events | ✅ No conflict (provided the event feeds it) |
| Flat 5% draft (`opsSlice/2`) | Draft | Becomes **tier-0 / fallback**; the flat draft is the part that **diverges from doctrine**, not the router | 🔁 Flat is the outlier |
| Labs "Reputation" = `√(usdc)×(1+log₂(1+buys))` | Labs | Money-weighted; **violates referral reputation doctrine** | ❌ Keep quarantined; never feed the router |
| Forbidden inputs: SYN balance, rank amount, streaks, MLM, wealth boards | Rejected | Count router uses none of these | ✅ Compatible |

**Bottom line of E:** nothing in months of design is *overwritten* by a count axis. Two things can be
*silently lost* if the router is built carelessly: **(1)** a thin event that can't reconstruct
reputation/builder later, and **(2)** dropping the retention gate without documenting that tiers are
temporarily count-only. Both are avoidable by **emitting the full RAL Attribution event** and **writing
down the retention deferral** — neither requires changing any existing doctrine.

---

## F — RECOMMENDATION · what axis should the CommissionRouter launch with?

> You asked me not to recommend code changes — only to say, from what already exists, which axis the
> design points to. This is that read, not a build directive.

**Launch axis: `referral count only`** for the on-chain commission tier — **with one non-negotiable
condition: emit the full RAL Attribution event so the off-chain durability/reputation/builder vision
remains 100% reachable later with no migration.**

Why each option, judged only against what already exists:

| Option | Verdict | Reason grounded in existing design |
|---|---|---|
| **Referral count only** | ✅ **Recommended** | The **only** input the contract can compute on-chain, deterministically, with no oracle (`knownMember` is already on-chain; a `referredCount` counter is trivial). It **is** the `tierTable[tier]` the RAL doctrine already specifies. |
| Count + **rank** | ❌ No | Rank derives from cumulative USDC → **wealth-weighting**, explicitly forbidden (`RANK_CONSTITUTIONAL_RULING.md`, financial-trace guardrails). |
| Count + **participation** (buyer's own purchase count/size) | ❌ No | Participation is a money proxy and drifts toward pay-to-rank; it's also the buyer's behavior, not the *referrer's* contribution. Not the referral axis. |
| Count + **reputation** | ❌ Not at launch | Reputation (retention/durability/age/reach) is, by doctrine, **off-chain and separate from the commission axis**. It cannot be computed safely on-chain at launch and was never meant to gate payout. It arrives as the off-chain recognition layer reading the event. |
| **Another already-designed model** (full RAL: tier + buyer-override + campaign + source) | 🔭 Future, not launch | This is the doctrine's full vision. Launch a **subset** (count tier) but **shape the event for all of it** so source/campaign/override/B2B are config/upgrade additions, never migrations. |

**So the existing design points to:** *count-based tiers on-chain now (the doctrine's `tierTable`),
flat 5% as tier-0/fallback, the rich Attribution event emitted in full, and
retention→reputation→builder kept exactly where doctrine already puts them: off-chain, above the
router, reading its events.* The retention **gate** on tiers is the one designed feature that must be
explicitly marked **deferred** at a count-only launch.

**What this protects:** every prior decision survives. The tier ladder survives (count axis is its
spine). Reputation survives (off-chain, unchanged). Builder Records survive (read the events). Legal
survives (Operations-only, banned-copy list intact). The only honest caveat to surface to members:
*"tiers are by verified introductions today; durability-gated tiers and reputation arrive with the
off-chain layer."*

---

*Read-only inventory. No protocol code, Solidity, frontend, doctrine, or config was modified. No axis
was implemented. This report tells you what exists so the next decision changes nothing by accident.*
