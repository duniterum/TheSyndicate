# Unified Protocol Doctrine Map

**Status:** Architecture audit. No code. No implementation. This document collapses every proposed system (Revenue Attribution Layer, Treasury Ledger, Activity, Builder Records, Reputation, Artifacts, Chronicle, Governance) into the simplest defensible architecture before any V1 contract or UI work begins.

**Trigger.** The previous audit added power but also surface area: 7+ new registries, oracles, and schemas. The risk has flipped — we no longer lack pieces, we risk shipping 8 overlapping systems. This map exists to simplify, not to add.

**Constitutional sentence (proposed addition):**

> Money creates attribution.
> Time creates reputation.
> History creates memory.
> Constitution creates governance.

Every system below collapses to exactly one of those four verbs. If a proposed system fits two, it is two systems pretending to be one — split it. If it fits none, it does not belong in the protocol.

---

## 1. The Eight Systems — One-Line Purpose

| System | One-line purpose | Verb |
|---|---|---|
| **Revenue Attribution Layer (RAL)** | Record who caused a sale and split the gross deterministically | Money |
| **Treasury Ledger** | Record where every dollar moved after it landed in an allocation wallet | Money |
| **Activity** | Stream of raw on-chain events in chronological order | Money (display) |
| **Builder Records** | Aggregate of an address's verified contribution over time | Time |
| **Reputation** | Derived score from Builder Records, gated by durability and retention | Time |
| **Artifacts** | Sealed on-chain collectibles tied to protocol events or seats | Memory |
| **Chronicle** | Curated, protocol-centric history of constitutional moments | Memory |
| **Governance** | The rules for changing the rules | Constitution |

Public name vs internal name:

| Public | Internal |
|---|---|
| Referral | Revenue Attribution Layer |
| Transparency / Treasury | Treasury Ledger |
| Activity | Activity Stream |
| Builders | Builder Records |
| Reputation | Reputation (same) |
| Artifacts | Archive1155 + sealing rules |
| Chronicle | Chronicle (same) |
| Governance | Governance (same) |

---

## 2. Per-System Specification

For each: purpose · writer · mutator · class · permanence · neighbors.

### 2.1 Revenue Attribution Layer (RAL)
- **Purpose.** At every sale, record `{source, token, gross, buyer, referrer, tier, splits, paymentMode, attribution, refTag}` and route splits.
- **Who writes.** `CommissionRouter` smart contract, called by `MembershipSaleV2` / `ArchiveSaleV2` / future B2B sale wrappers. No human writes here.
- **Who can change.** Nobody changes a past attribution event. The router's *parameters* (tier table, allowed sources) are upgrade-gated; events themselves are immutable.
- **Class.** Financial.
- **Permanence.** Permanent on-chain. Append-only.
- **Neighbors.** Feeds Treasury Ledger (downstream movement), Activity (display), Builder Records (signal source).

### 2.2 Treasury Ledger
- **Purpose.** Record every directional movement out of an allocation wallet with a canonical tag (`VAULT_TO_INVESTMENT`, `OPERATIONS_TO_REFERRER`, `LIQUIDITY_LP_ADD`, …) so "where did the money go?" has a single answer.
- **Who writes.** The existing `src/lib/transaction-tags.ts` registry, manually appended by the operator at the moment of movement; extended by automatic entries when `CommissionRouter` emits splits.
- **Who can change.** Founder/operator may add entries; entries are not edited or deleted — corrections are new entries that reference the prior one.
- **Class.** Financial.
- **Permanence.** Append-only ledger; tags themselves are a narrow allow-list (constitutional change to add a tag).
- **Neighbors.** Consumes RAL output (router emits → ledger ingests). Surfaced on `/transparency`.

### 2.3 Activity
- **Purpose.** Chronological raw stream of on-chain events — sales, mints, transfers, router payouts, treasury movements.
- **Who writes.** Chain itself. The site only reads.
- **Who can change.** Nobody.
- **Class.** Display layer over financial data.
- **Permanence.** Permanent (it is the chain).
- **Neighbors.** Read-only window into RAL + Treasury Ledger + Archive1155.

### 2.4 Builder Records
- **Purpose.** Per-address aggregate: total attributed sales, count of buyers brought, retention rate of those buyers, age of the oldest still-active buyer. Two-tier per the Builder Record Doctrine: **Event** (single referral) vs **Record** (durable aggregate).
- **Who writes.** Derived view, computed off-chain from RAL events + holder index. No on-chain writes in V1.
- **Who can change.** Nobody directly; the inputs (RAL events) are immutable, so the aggregate is deterministic.
- **Class.** Social / time-based.
- **Permanence.** Mutable in the sense that the *current value* updates as time passes, but the *history* is permanent because inputs are.
- **Neighbors.** Reads RAL. Feeds Reputation. Eligible Builder Records may be promoted to Artifacts or Chronicle entries via the Mythology Gate after 1/3/5-year thresholds.

### 2.5 Reputation
- **Purpose.** A single derived score per address that ranks builders by **durability and retention**, never by gross commission. Formula gate: a wallet that brought $1M then watched all buyers leave ranks below a wallet that brought $50k whose buyers are still here in year 3.
- **Who writes.** Derived from Builder Records by a pure function. No contract.
- **Who can change.** Formula is constitutional — changing it requires Governance.
- **Class.** Social.
- **Permanence.** Score is current-value; the *history of scores* is reproducible from RAL inputs.
- **Neighbors.** Reads Builder Records. Gates promotion to Artifact / Chronicle.

### 2.6 Artifacts
- **Purpose.** Sealed on-chain collectibles tied to seats and protocol events (Chapter Artifacts, Seat Records, First Signal, Patron Seal, etc.).
- **Who writes.** `Archive1155` contract via the operator at sealing events.
- **Who can change.** Sealed artifacts are immutable. New artifacts require passing the Mythology Gate.
- **Class.** Memory (cultural).
- **Permanence.** Permanent.
- **Neighbors.** May be granted to Builder Records that earn them through Reputation; never minted by RAL directly.

### 2.7 Chronicle
- **Purpose.** Curated, protocol-centric history. Constitutional moments only — Chapter openings, artifact sealings, treasury thresholds crossed.
- **Who writes.** Operator, gated by the Chronicle Doctrine (protocol-centric, not member-centric).
- **Who can change.** Append-only. Past entries are not edited.
- **Class.** Historical.
- **Permanence.** Permanent.
- **Neighbors.** May reference Artifacts, Builder Records, Treasury Ledger entries — never duplicates them. A Chronicle entry is a *pointer with prose*, not a re-record.

### 2.8 Governance
- **Purpose.** The rules for changing the rules. V1: founder-managed with public disclosure ("Nothing hidden happened"). V3+: DAO-activated.
- **Who writes.** Today: founder. Future: token-holder vote or council.
- **Who can change.** Itself, through itself (recursive — that's the point of a constitution).
- **Class.** Constitutional.
- **Permanence.** Mutable, but every mutation is itself a Chronicle entry.
- **Neighbors.** Owns the upgrade keys for `CommissionRouter`, the tag allow-list, the Reputation formula, the Mythology Gate.

---

## 3. Overlap & Duplication Audit

Direct overlaps found:

| Overlap | Resolution |
|---|---|
| RAL events vs Activity feed | RAL is the **source**, Activity is a **read view**. Activity must not maintain its own event log. |
| Treasury Ledger vs `transaction-tags.ts` | They are the same thing. The Ledger is just the public name for the existing registry, extended to ingest router outputs. Do not create a new file. |
| Builder Records vs Reputation | Builder Records = facts. Reputation = a function of facts. Two systems only because the function is constitutional. Do not merge — but do not allow Reputation to store anything Builder Records doesn't already imply. |
| Artifacts vs Chronicle | Artifacts are *things*. Chronicle is *prose about things*. A Chronicle entry that doesn't reference an Artifact, a Treasury movement, or a Builder Record is suspect. |
| Chronicle vs Activity | Chronicle is curated and constitutional. Activity is raw and complete. A raw event is never promoted to Chronicle without passing the Chronicle Doctrine. |
| "Builder Score" (proposed) vs Reputation | Same system. Use one name. **Recommendation: "Reputation"** publicly, with "Builder Score" as the internal computation name if needed. |

Duplications that the previous audit risked creating — explicitly rejected here:

- `CampaignRegistry` as a standalone system. **Rejected.** A campaign is a `bytes32 refTag` on RAL events. No registry needed in V1; a JSON config file in repo + RAL filter is enough until 20+ campaigns exist.
- `AcceptedTokenRegistry`. **Rejected for V1.** Hardcoded allow-list in `CommissionRouter` is enough. Promote to registry only when token count > 3.
- `TierOracle`. **Rejected.** Tier is computed from `useHolderIndex` at tx time. An oracle is overhead until SYN trades on multiple venues.
- `MovementPatternLibrary` as a standalone artifact. **Demoted.** It is documentation of the tag allow-list, not a runtime system. Lives in `docs/`, not in code.
- `AttributionRules` as a separate doctrine file. **Merged into RAL.** One doctrine file, not two.

Net effect: the previous "7 new systems" collapses to **3 new things** (RAL contract, Treasury Ledger surface, Builder Records view) + extensions to existing files.

---

## 4. Doctrine Conflicts

1. **Chronicle vs RAL events.** Earlier we banned individual member events from Chronicle. We must equally ban individual referral events. The Chronicle Doctrine wins; the Builder Record Doctrine codifies the carve-out (records, not events, are eligible — and only after time thresholds).

2. **Reputation vs "ranks reflect participation, not wealth" (Core rule).** Reputation must be defined purely on durability and retention. Any formula that includes gross dollars as a primary term violates the constitution. Gross may be a tiebreaker, never a driver.

3. **Treasury Ledger vs "Verifiable > Impressive" (Core rule).** Every Ledger entry must link to a tx hash. Operator-authored prose without an on-chain anchor is forbidden — surfaces as PENDING, never as a confirmed movement.

4. **Governance V1 vs "Do not trust. Verify."** Founder-managed treasury cannot pretend to be DAO. The Treasury Ledger banner must read literally: *"Founder-managed until DAO activation. Nothing hidden happened."* Do not soften.

---

## 5. Relationship Graph

```text
                       ┌────────────────────┐
                       │   GOVERNANCE       │ (constitutional)
                       │  changes rules of: │
                       └────────┬───────────┘
                                │ upgrades / formulas / allow-lists
              ┌─────────────────┼─────────────────────────────┐
              ▼                 ▼                             ▼
        ┌──────────┐     ┌─────────────┐              ┌──────────────┐
        │   RAL    │────▶│  TREASURY   │              │ MYTHOLOGY    │
        │ (money)  │     │  LEDGER     │              │ GATE         │
        └────┬─────┘     │  (money)    │              └──────┬───────┘
             │           └──────┬──────┘                     │
             │                  │                            │ promotes
             ▼                  ▼                            ▼
        ┌──────────┐     ┌─────────────┐              ┌──────────────┐
        │ ACTIVITY │◀────┤   (reads)   │              │  ARTIFACTS   │
        │ (display)│     └─────────────┘              │  (memory)    │
        └──────────┘                                  └──────┬───────┘
             ▲                                               │
             │                                               │
        ┌────┴─────┐     ┌─────────────┐              ┌──────▼───────┐
        │ BUILDER  │────▶│ REPUTATION  │─── eligible ▶│  CHRONICLE   │
        │ RECORDS  │     │   (time)    │              │  (history)   │
        │ (time)   │     └─────────────┘              └──────────────┘
        └──────────┘
```

Reading: financial events flow left-to-right. Time-based aggregates derive from those events. Promotion to memory or history is gated, not automatic. Governance sits above everything and is itself recorded by Chronicle.

---

## 6. Simplest Possible V1

The smallest correct implementation that does not lock out V3:

1. **One contract.** `CommissionRouter` with canonical Attribution event schema. Push-then-escrow payout pattern. Tier table inline.
2. **One sale wrapper.** `MembershipSaleV2` that calls the router. Live sale untouched.
3. **One file extension.** `transaction-tags.ts` ingests router emissions and exposes the Treasury Ledger surface.
4. **One new public route.** `/referral` — explains the public model, shows current tiers, links to verification.
5. **One extended public route.** `/transparency` gets the Treasury Ledger section with directional tags.
6. **Zero new systems for Builder Records / Reputation / Chronicle promotion in V1.** Those are *derived views* that can be computed at any time from RAL events. We design the event schema to support them, then defer the UI.

Everything else — CampaignRegistry, AcceptedTokenRegistry, TierOracle, Reputation UI, Builder Score leaderboard, B2B campaigns, white-label — is deferred to V2/V3 and explicitly **not blocked** by V1 because the Attribution event already carries `source`, `refTag`, `paymentMode`, and `attribution` fields.

---

## 7. B2B — Treated As Strategy, Not V1 Scope

The five B2B models (sponsorship, affiliate, BD network, white-label, treasury allocation) all reduce to: *a different `source` value on the same Attribution event*. V1 must reserve namespace for them, not build for them.

- `source = "MEMBERSHIP_SALE"` — V1.
- `source = "ARCHIVE_SALE"` — V1/V2.
- `source = "SPONSORSHIP"` — V2.
- `source = "AFFILIATE"` — V2.
- `source = "BD_NETWORK"` — V3.
- `source = "WHITELABEL"` — V3.
- `source = "TREASURY_DEAL"` — V3.

This is the only V3 commitment we make today: **the `source` field is `bytes32` and the allow-list is governance-gated.** Everything else is a config change later.

---

## 8. What Gets Cut From The Previous Audit

| Previously proposed | Decision |
|---|---|
| `CampaignRegistry` contract | Cut from V1. JSON config + `refTag` filter. |
| `AcceptedTokenRegistry` contract | Cut from V1. Inline allow-list. |
| `TierOracle` contract | Cut from V1. `useHolderIndex` at tx time. |
| `MovementPatternLibrary` as code module | Cut. Documentation only. |
| `ATTRIBUTION_RULES.md` separate file | Merged into `REVENUE_ATTRIBUTION_LAYER.md`. |
| Separate `BUILDER_RECORD_DOCTRINE.md` | Kept, but ships *before* any Builder UI exists. Doctrine first, view later. |
| Standalone "Builder Score" naming | Cut. Use "Reputation" publicly. |

Documents to draft (down from 7 to **5**):

1. `REVENUE_ATTRIBUTION_LAYER.md` (includes attribution rules + router architecture)
2. `TREASURY_LEDGER_DOCTRINE.md` (includes the movement tag allow-list)
3. `BUILDER_RECORD_DOCTRINE.md` (event vs record, time thresholds, promotion path)
4. `REPUTATION_FORMULA_DOCTRINE.md` (durability + retention formula, gross-as-tiebreaker rule)
5. `LEGAL_DISCLOSURE_REFERRAL.md` (jurisdictional disclosure for public Referral page)

---

## 9. The 30-Second Public Model (Unchanged)

The visitor still sees:

> Buy SYN → 70% Vault · 20% Liquidity · 10% Operations
> Referral gets part of Operations
> Verify everything on-chain

That sentence is the constitutional ceiling on public complexity. Anything that breaks it — multiple revenue lines on the homepage, tier tables in the hero, attribution debates above the fold — is a violation, regardless of how technically correct.

---

## 10. Decision Lens Verdicts

| Lens | Verdict | Note |
|---|---|---|
| Founder | ✓ | Cuts surface area, keeps V3 optionality. |
| Investor | ✓ | Treasury Ledger above Referral is the right priority. |
| Growth | ⚠ | B2B revenue is deferred; acceptable because V1 attribution schema reserves the namespace. |
| Behavioral | ✓ | "Reputation = durability" aligns incentives away from spam referrals. |
| UX | ✓ | 30-second public model preserved. |
| Product | ✓ | 8 systems collapsed to 4 verbs + clear neighbor graph. |
| Staff Eng | ✓ | 3 new artifacts + 2 file extensions; no premature registries. |
| QA | ✓ | Append-only ledgers + immutable RAL events are testable. |
| A11y | ✓ | No surface changes that affect a11y in this doc. |
| SEO | ✓ | `/referral` and extended `/transparency` are net-positive shareable surfaces. |

No ✗. One ⚠ on Growth, mitigated by the `source` namespace reservation.

---

## 11. Final Recommendation

**Ship V1 as the 6 items in §6.** Draft the 5 doctrine files in §8. Defer everything else with the explicit knowledge that the Attribution event schema does not block it.

The protocol now has enough architecture. The next failure mode is not under-design — it is over-design. This map exists to prevent that.
