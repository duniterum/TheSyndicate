# 05 — FOUNDATION FREEZE (The Architecture Constitution)

Status: **binding · constitutional.** This is the frozen conceptual architecture of
The Syndicate. Its purpose is singular: **stop drift.** The protocol is now complex
enough that the primary risk is no longer missing features — it is future systems
quietly creating *parallel* architectures. Everything built from here (Signal layer,
Recognition, Referral, Reporting, Patron evolution, SeatRecord721, Governance,
Marketplace, AI) must plug into the model below. If a feature cannot be placed in
exactly one layer, it is misplaced.

> **The freeze rule:** *Every future feature occupies exactly one layer and consumes
> only the layer directly above it.* New economics, new modules, and new surfaces do
> not get new architectures — they get a layer.

This document is doctrine. It does **not** outrank code: the precedence law in
`00_AUTHORITY_MAP.md` still holds — **on-chain truth → code registries → execution
gates → canon → operational**. This freeze is authoritative-by-convention; it is not
yet machine-enforced (registering it with the doctrine guard is a future **code**
task — see `04_DOC_SYNC_CHECKLIST.md`).

**Status legend:** LIVE (on-chain verifiable) · PARTIAL (live but incomplete) ·
PENDING (not deployed) · FUTURE (not built) · MOCK (placeholder).

---

## 1. The five-layer architecture (canonical)

```
TRUTH      what is provably real
  ↓
EVENTS     what happened, typed and classified
  ↓
SIGNALS    why anyone should care (priority + meaning)
  ↓
MEMORY     what is worth keeping
  ↓
STORY      what it means to a human
```

Every concept in the protocol belongs to exactly one of these layers.

### TRUTH

| | |
|---|---|
| **Purpose** | The only source of fact. The base reality everything else derives from. |
| **Inputs** | Live chain reads (Avalanche 43114), deployed contracts, ABIs. |
| **Outputs** | Verified values + their verify links; metric *definitions*. |
| **Responsibilities** | Read chain, define metrics, label known addresses, expose verifiability. |
| **Belongs** | Balances, total/circulating/burned supply, raw logs, addresses, ABIs, metric definitions. |
| **Does NOT belong** | Opinion, curation, narrative, status labels, significance, synthesized/MOCK numbers presented as real. |
| **Codebase examples** | `protocol-truth.ts`, `protocol-metrics-registry.ts`, `known-addresses.ts`, `chain-registry.ts`, `contract-registry.ts`, `data-verification-registry.ts`, `syndicate-config.ts`. |
| **Drift risks** | MOCK data (`VAULT_ASSETS`, `VAULT_INFLOWS`) leaking upward as truth; duplicate metric definitions; a second "members" definition reappearing. |

### EVENTS

| | |
|---|---|
| **Purpose** | Turn raw logs into typed, classified facts-with-shape. |
| **Inputs** | TRUTH (logs, scans). |
| **Outputs** | `CanonicalProtocolEvent` — `kind`, category, metric effects, eligibility flags, verify link. |
| **Responsibilities** | Classification, enrichment, address labeling. One canonical pipeline. |
| **Belongs** | Event kinds, `CATEGORY_FOR_KIND`, `EVENT_METRIC_EFFECTS`, `chronicleEligibleForKind`. |
| **Does NOT belong** | Significance judgment (that is SIGNALS), curation (that is MEMORY), narrative. |
| **Codebase examples** | `protocol-event-registry.ts`, `onchain-events.ts`, `holder-index.ts` (purchase-events scan). *(The persisted Activity feed/surface, `protocol-events.ts`, is the MEMORY layer — see §9.)* |
| **Drift risks** | Adding a `kind` without lockstep map edits; a second event pipeline; treating `chronicleEligible` as significance. |

### SIGNALS *(the missing scaling layer — FUTURE)*

| | |
|---|---|
| **Purpose** | Prioritization + meaning. Answers **"why should anyone care?"** Not every event matters equally. |
| **Inputs** | EVENTS. |
| **Outputs** | A `Signal = Type × Tier` annotation per event (advisory; grants nothing). |
| **Responsibilities** | Assign tier (S0–S5) and type; enforce the scarcity law (size never raises tier). |
| **Belongs** | Tiering, typing, scarcity rules. |
| **Does NOT belong** | Human curation (MEMORY), money facts (Ledger, in MEMORY), rewards, rights, identity. |
| **Codebase examples** | **None yet (FUTURE).** Precursors: `chronicleEligibleForKind` (subject gate), `EVENT_METRIC_EFFECTS` (metric axis). Proposed home: a pure-data `signal-registry.ts` leaf beside the event registry. |
| **Drift risks** | Signals becoming rewards/rights; tier inflation; money buying tier; a parallel "scoring" system. |

### MEMORY

| | |
|---|---|
| **Purpose** | Decide and persist what is worth keeping. |
| **Inputs** | EVENTS + SIGNALS. |
| **Outputs** | Activity feed, Chronicle entries, Recognition labels, Ledger, Reports. |
| **Responsibilities** | Persistence + curation + the `CANDIDATE → APPROVED → PUBLISHED / REJECTED` lifecycle. |
| **Belongs** | The five stores (§4). |
| **Does NOT belong** | Raw chain reads (TRUTH); narrative voice beyond protocol copy (STORY). |
| **Codebase examples** | `chronicle-entries.ts`, `chronicle-candidates.ts`, `recognition-candidates.ts`, `protocol-ledger.ts`, `report-registry.ts`, `protocol-memory.ts` (WhatChangedForYou). |
| **Drift risks** | Five stores read as competing systems; Chronicle becoming a feed; Recognition becoming identity; manual-tag overload. |

### STORY

| | |
|---|---|
| **Purpose** | The human/emotional frame that makes the rest *mean* something. |
| **Inputs** | MEMORY (especially Chronicle + a member's own protocol-memory). |
| **Outputs** | The second-person journey ("you are Member #N; you left a trace"), the public narrative arc, the emotional line. |
| **Responsibilities** | Framing, sequencing, voice — never new facts. |
| **Belongs** | The Observe→Remembered arc, copy, the cockpit narrative order. |
| **Does NOT belong** | New facts, hidden claims, anything not traceable to TRUTH. |
| **Codebase examples** | `WhatChangedForYou`, `/chronicle`, the my-syndicate cockpit arc, home copy, `STORY_ENGINE_AND_EMOTIONAL_OPERATING_SYSTEM.md`. |
| **Drift risks** | Story asserting beyond TRUTH (violates "don't trust, verify"); narrative inflation; centering the buyable (rank) over the earned. |

---

## 2. The Adjacency Law (constitutional)

> **A layer may consume only the layer directly above it — with one sanctioned
> exception: MEMORY ingests EVENTS directly (raw Activity) in addition to SIGNALS.
> No layer may reach further up than this.**

- EVENTS consume TRUTH.
- SIGNALS consume EVENTS.
- MEMORY consumes SIGNALS, and EVENTS directly (the one carve-out — raw Activity ingestion).
- STORY consumes MEMORY.

**Hard invariants (never violated):** only EVENTS read the chain (TRUTH); STORY reads
only MEMORY (never the chain); SIGNALS only classify EVENTS (never curate); EVENTS
never narrate. **If a feature needs to reach past these bounds, it is misplaced** —
re-home it before building. This is the single most important anti-drift rule in the
protocol; it is the test every future module must pass first.

---

## 3. Signal doctrine (frozen)

### 3.1 Definition

> **A Signal is a classified protocol event annotated with a significance Tier and a
> Type, used to prioritize what reaches Memory, Recognition, and Reports.**

A Signal **is** a meaning/prioritization layer. A Signal **is not** a token, a reward,
governance, identity, yield, or a right. It grants nothing; it only ranks attention.

### 3.2 Signal = Type × Tier (two axes, frozen)

A single scalar cannot power recognition labels or report sections at scale; two axes can.

- **Tier (S0–S5)** = *how much it should surface* → the **scaling throttle**.
- **Type** = *in what way it matters* → the **meaning facet** queried by Memory/Reports/Referrals.

**Tier ladder:**

| Tier | Meaning | Examples |
|---|---|---|
| **S0** | Noise — ingested, never elevated | swaps, untagged wallet movements |
| **S1** | Standard activity | normal purchase, normal NFT mint, routine LP add |
| **S2** | Recognized action | rank milestone, Patron Seal mint, community burn |
| **S3** | Protocol milestone | member #100/#333/#1,000, first Patron Seal, major LP/Vault threshold |
| **S4** | Historical event | chapter sealed, Proof of Fire #001, member #10,000, major liquidity milestone |
| **S5** | Constitutional event | contract migration, governance activation, SeatRecord721 deployment, doctrine change |

**Final Signal Type list (frozen — seven types):**

| Type | Meaning | Earned via | Recognition label |
|---|---|---|---|
| **Timing** | when you arrived | Member Number | `Early` / `Founder-era` |
| **Conviction** | what you gave up | Proof of Fire (burn) | `Proof of Fire participant` |
| **Support** | what you backed | Patron Seal | `Patron Seal holder` |
| **Growth** | who you brought | referral (FUTURE) | `Growth builder` |
| **Participation** | what you do | purchases, mints, rank | (depth, aggregate) |
| **Structural** | protocol thresholds | chapter, milestones | (protocol-subject) |
| **Historic** | named in memory | Chronicle | `Historic member` |

*"Memory" is a layer, not a type. "Building" folds into Growth/Participation.*

### 3.3 Subject is a third dimension of routing

Tier decides *priority*; **subject decides *destination***: protocol-subject signals
route to Chronicle, person-subject signals route to Recognition. The codebase already
encodes the subject axis as `chronicleEligibleForKind` — the Signal layer adds Tier
and Type on top. It is **additive, not a rewrite.**

---

## 4. Signal scarcity law (frozen)

> **Prestige must remain scarce. Money buys entry and depth — never primacy.**

1. **Earned, not issued.** Equal recognition for all = no recognition.
2. **Actions, time, and history create prestige.** Money creates *participation depth*, never historic standing.
3. **Monetary size never raises a Signal tier.** A large purchase is S1 activity (at most S2 "depth") — *never* S3+. Only ordinal/temporal/structural facts (first-ever, milestone number, chapter sealed, burn) earn S3+. **This is the rule that keeps "no pay-to-appear" true.**
4. **Self-preserving scarcity.** Recognition becomes *harder* to earn as the protocol grows: the S3+ threshold rises with membership, so prestige stays scarce automatically.

**The unbuyability ladder (frozen ordering, most → least unbuyable):**
`Member Number (immutable)` › `Being First (time-locked)` › `Chronicle inclusion (curated)` › `Proof of Fire (sacrifice)` › `Recognition labels (earned)` › **`Rank (purchasable → least prestigious axis)`**.

---

## 5. Permanent vs Temporary signals (frozen)

Signals divide into two classes. This split is the spine of the scarcity law.

| Class | Nature | Examples | Role |
|---|---|---|---|
| **Permanent** | Immutable / time-locked — true forever once earned | Member Number · Chronicle inclusion · Historical Firsts · Proof of Fire · chapter membership | The **spine** of prestige; unbuyable after the fact |
| **Temporary** | Present-state — can rise and fall | Rank · current holdings · current chapter *progress* · current LP participation | **Texture**; reflects now, never primacy |

**Ruling:** prestige is anchored in Permanent signals. Temporary signals are honest
present-state and must never be presented as permanent standing.

---

## 6. Chronicle constitution (frozen)

> **Activity = what happened. Chronicle = what mattered. Automation discovers;
> humans narrate. Chronicle is never a feed.**

| | |
|---|---|
| **Strengths** | Prevents spam + legal drift; keeps meaning scarce; one point of editorial integrity. |
| **Weaknesses** | Human bottleneck; subjectivity; **bus-factor** (one curator); latency. |
| **Scaling** | The Chronicle review threshold **rises with scale** (small: review all → medium: S3+ → large: S4+). The human queue stays bounded as raw volume explodes. |
| **Founder risk** | Single curator. Mitigation: define a succession / multi-curator process before scale demands it. |

**Lifecycle (frozen):** `CANDIDATE → APPROVED → PUBLISHED`, with `REJECTED` as a
terminal branch. **PUBLISHED entries are append-only and immutable** — never silently
edited. No auto-publication, ever. *(Today `REJECTED` is not yet a formal state — a
future code follow-up.)*

---

## 7. Recognition constitution (frozen)

> **Recognition is The Syndicate's durable, pseudonymous acknowledgement of the
> meaningful signals a member has emitted — the sum of a member's S2+ person-signals,
> displayed at the member's chosen disclosure tier. It answers: "what meaningful
> traces has this member left?"**

It **is**: action-based, signal-based, member-controlled in disclosure
(Member #N → alias → self-declared name → avatar, all opt-in, all FUTURE beyond #N).

It is **NOT**, and never becomes: KYC, identity verification, governance, financial
rights, or yield. These negations are permanent.

---

## 8. Story constitution (frozen)

The true narrative — verified against what is actually built:

> Most people **watch from the outside.**
> Members **take a seat.**
> They **participate.**
> They **leave a trace.**
> They **become remembered.**

This is the real arc, and it is already encoded (the my-syndicate cockpit:
Identity → Place → Ownership → Momentum → Action → Memory → Proof → Building).

**Constitutional correction:** the spine centers the *unbuyable* beats. **Rank is
texture, not spine** — "rise through the ranks" must never be the central story beat,
because rank is the one purchasable axis. The emotional truth is **belonging +
permanence**, not climbing.

> **The Syndicate's story is "verifiable belonging" — a narrative where every
> emotional beat maps to an on-chain fact. The story is moving *because* it is true.**
> STORY may never assert what TRUTH cannot prove ("don't trust, verify").

Compatible by construction with crypto-natives, collectors, long-term members,
supporters, and future growth systems — because it promises *membership and memory*,
not return.

---

## 9. Memory system — five complementary stores (frozen)

Not competing systems. Each answers a different question; together they are MEMORY.

| Store | Question it answers | Nature | Code home |
|---|---|---|---|
| **Activity** | *What happened?* | Raw, complete, public, automatic | `protocol-events.ts` |
| **Chronicle** | *What mattered?* | Curated, gated, human-approved, append-only | `chronicle-entries.ts` |
| **Recognition** | *Who left a trace?* | Action-based, pseudonymous, per-member | `recognition-candidates.ts` |
| **Ledger** | *What moved (the money)?* | Factual; purpose only via manual tags | `protocol-ledger.ts` |
| **Reports** | *What is the periodic rollup?* | Summaries over the above | `report-registry.ts` |

**Activity's single layer home is MEMORY** (the persisted, public feed/surface,
`protocol-events.ts`); the EVENTS layer merely *produces* the typed stream it stores.
This satisfies the one-concept-one-layer rule.

**Spine sentence:** *Activity = what happened · Chronicle = what mattered ·
Recognition = who left a trace · Ledger = the money underneath · Reports = the
periodic rollup.*

---

## 10. Report cadence (recommended doctrine)

| Cadence | Signal gate | Job |
|---|---|---|
| **Daily** | none — Activity feed only | Live heartbeat, no document |
| **Weekly Chronicle** | S3+ reviewed; S4/S5 prioritized | Curation ritual |
| **Monthly Report** | S2+ summaries + metrics + ledger + recognition | Protocol progress |
| **Quarterly Report** | S3+ milestones + chapter progress | Strategic narrative |
| **Annual — State of The Syndicate** | S4/S5 historical record + full protocol memory | The keepsake |

**Half-Year report: DROP** — redundant between Quarterly and Annual.

---

## 11. Referral philosophy (frozen)

> **Referral = growth attribution first. Reward = secondary and FUTURE.**

This is the only referral model consistent with the no-financial-return doctrine; it
avoids commission/recruitment framing entirely. The attribution memory —
*"Member #27 brought Member #456 into The Syndicate"* — **is itself the primary
value** (a Signal of Type *Growth*). Reward, if ever introduced, is a separate,
contract-gated, later concern, framed as recognition, not yield. No
reward/earn/commission/passive-income language until a contract exists;
`rewardStatus` stays PENDING. (Mirrors `03_GLOSSARY.md` ruling #6.)

---

## 12. Naming collisions — ruling

The collision rulings are binding in `03_GLOSSARY.md` (rulings #1–#2). This freeze
records the **long-term recommendation**:

| Collision | End-state | Resolution | Status |
|---|---|---|---|
| **Patron rank** ($500) vs **Patron Seal** (artifact) | "Patron" → support family (the Seal) | Rank renamed **Steward** | **RESOLVED** (Sprint A.7) — "Patron" reserved for Patron Seal / Support / Actions / Recognition |
| **Council rank** (≥$2,500) vs future **Governance Council** | "Council" → governance only | Rank renamed **Keystone**; "Council Candidate" ($1,000) renamed **Custodian** | **RESOLVED** (Sprint A.7) — "Council" reserved for future governance |

The renames keep all thresholds, prices, SYN amounts, and economics unchanged —
only the labels moved. Enforcement: `doctrine-guard.test.ts` bans the retired rank
vocabulary ("Council Candidate", "Patron badge", "Council badge") from rendered
source; "Patron Seal" and a future "Governance Council" remain valid. See
`06_FINANCIAL_TRACE_AND_GUARDRAILS.md` §5.

---

## 13. Anti-drift check — top 20 risks + rulings

The constitutional rulings each risk must obey.

| # | Drift risk | Constitutional ruling |
|---|---|---|
| 1 | Rank becoming prestige | Rank is Temporary texture; Permanent signals are the spine (§5). |
| 2 | Money becoming prestige | Size never raises tier; money buys entry/depth, never primacy (§4). |
| 3 | Story diverging from truth | STORY consumes MEMORY only; every beat maps to TRUTH (§2, §8). |
| 4 | Patron ambiguity | RESOLVED — rank renamed **Steward**; "Patron" reserved for the Seal / support family (§12). |
| 5 | Governance ambiguity | RESOLVED — rank renamed **Keystone** / **Custodian**; "Council" reserved for future governance (§12). |
| 6 | Signal inflation | Tier threshold rises with scale; S0–S5 fixed; tiers are advisory (§3, §4). |
| 7 | Chronicle inflation | Chronicle ≠ feed; human-approved; append-only; threshold rises with scale (§6). |
| 8 | Duplicated metrics | One metrics registry in TRUTH; one shared `MEMBER_DEFINITION` (§1). |
| 9 | Duplicated event logic | One EVENTS pipeline; new kinds edit the canonical maps in lockstep (§1). |
| 10 | Recognition becoming identity | Recognition is pseudonymous signal-sum; never KYC/identity (§7). |
| 11 | Reward language creeping in | Referral = attribution; reward FUTURE/PENDING; no earn language (§11). |
| 12 | MOCK data leaking into TRUTH | MOCK stays quarantined + labeled; never presented as real (§1). |
| 13 | A layer skipping a layer | Adjacency law: consume only the layer directly above (§2). |
| 14 | Parallel architecture for a new module | Every feature plugs into one layer; no new architectures (freeze rule). |
| 15 | Burn ambiguity (token vs LP) | Token burn = SYN → dead address; LP "burn" = liquidity removal — distinct (glossary). |
| 16 | Chronicle bus-factor | Define succession / multi-curator before scale demands it (§6). |
| 17 | Permanent vs Temporary blurred | Temporary signals never displayed as permanent standing (§5). |
| 18 | Report bloat / cadence creep | Fixed cadence; Half-Year dropped; gated by tier (§10). |
| 19 | Vault Wallet / Vault Reserve conflation | Disclose the shared address; never two separate balances (glossary, SoT table). |
| 20 | Doctrine guard decoupling forgotten | Canon is convention-authoritative until registered with the guard (code follow-up). |

---

## 14. Open founder decisions

1. Approve the five-layer architecture + Adjacency Law as constitutional.
2. Approve `Signal = Type × Tier` and the seven-type list.
3. ~~Rank renames (Patron, Council) — rename now vs disambiguate-forever?~~ **DONE (Sprint A.7):** Patron→Steward, Council Candidate→Custodian, Council→Keystone.
4. Add `REJECTED` as a formal Chronicle state; confirm append-only PUBLISHED.
5. Chronicle succession / multi-curator process.
6. Recognition: enable the **alias** disclosure tier next, or stay anonymous-only?
7. Machine-enforce `reward` / `buyback` / `financial freedom` (yes); **not** bare `contribution`.
8. Confirm Half-Year report is dropped.

---

## 15. Recommended next sprint (after this freeze)

1. **Register this freeze** — done here (canon). Optionally couple it to the doctrine guard (code follow-up).
2. **Signal classifier leaf** — advisory `signalType()` + `signalTier()` beside `chronicleEligibleForKind`; pure-data, internal-only. *This is the first implementation the freeze unblocks.*
3. **Labs wiring** — surface Type × Tier on `/labs/protocol-memory`; add `REJECTED`; enforce append-only Chronicle.
4. **(Gated) public** — Recognition labels and/or a Weekly Chronicle surface, only after 1–3.
5. **Postpone** — report generation, referral signals, paid identity/profile until contracts/inputs exist.

---

*This file is canon. When the architecture changes, update this file first, then the
downstream canon (`00`–`04`) and the sync checklist (`04_DOC_SYNC_CHECKLIST.md`).
Code still outranks every word here.*
