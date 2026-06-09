> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# MVP Ecosystem Roadmap (Post Wave 3B.1)

This roadmap defines the ordered set of community surfaces to build
**after** share infrastructure is complete. It is gated: each surface
must pass the post-Wave-3A product test (transparency · identity ·
memory · momentum · shareability · community) before it ships.

Status legend: ⬜ pending · 🟡 in design · ✅ shipped

Do NOT skip ahead. The order is intentional: every surface compounds
on the previous one.

---

## 1. Member Wall ⬜

Live community surface. Powered by `useHolderIndex`.

Shows, for each member (most recent first):
- founder number
- rank
- chapter
- short wallet address (link → `/wallet/$address`)
- per-row `ShareActions` (X / Telegram / copy link)

Purpose: **social proof**. NOT competition. NOT wealth ranking.

Guardrails:
- No USDC amounts displayed prominently (chapter and rank only).
- No "biggest buyer" framing. No leaderboard ordering by spend.
- Pagination by founder number, not by activity.

## 2. Founders Hall ⬜

Archive of the earliest members. Configurable range (default Founder
#1 → #100; expands as chapters fill).

Shows:
- founder number, wallet, rank, chapter
- first purchase block, first purchase tx (Snowtrace link)
- link to `MemberCard`

Purpose: **early archive recognition**. NOT financial advantage.

Guardrails:
- "Founder" is a static, on-chain-verifiable label — never a paid tier.
- No promises of future utility tied to Founders Hall presence.

## 3. Chapter Archives ⬜

Permalinks for `Genesis`, `First 100`, `First 500`, `First 1,000`.
Deferred from Wave 3B.1 to keep scope tight.

Each page:
- chapter definition
- current members in chapter
- seats remaining
- recent joins
- chapter member list (if data exists)
- `ShareActions`
- own OG preview (reuse SVG template + static PNG fallback)

Guardrails:
- No fake activity. No artificial scarcity.
- Pages with <10 members must show honest early state, not padded UI.

## 4. Rank Distribution Hub ⬜

Shows:
- distribution of members across ranks (chart + table)
- recent promotions
- members closest to next rank
- canonical rank definitions

Purpose: **community structure visualization**. NOT wealth leaderboard.

Guardrails:
- "Closest to next rank" is informational, not gamified.
- No urgency mechanics. No streaks. No fake competition.

## 5. NFT Recognition Layer ⬜ (PENDING)

Prepare as PENDING surface first. **No NFT contract deployment without
a separate explicit approval gate.**

NFT should represent (when approved):
- founder badge
- chapter badge
- milestone badge
- archive recognition

NFT must NOT imply:
- profit
- dividends
- revenue claim
- treasury claim
- guaranteed utility

## 6. Referral System ⬜ (ARCHITECTURE FIRST)

Architecture document required **before** any code: see
`docs/REFERRAL_SYSTEM_ARCHITECTURE.md` (to be created).

Open questions to resolve in that doc:
- Does commission come from the Operations bucket of 70/20/10?
- Does it modify the existing routing split, or is it an additive fee?
- Is referral capped per referrer / per period?
- Is self-referral blocked? Circular referral blocked?
- Is payout instant on purchase, or claimable from a balance?
- Is the referral relationship per-purchase or permanent?
- What happens when no referrer is specified?
- Can a referrer be a contract (e.g. a DAO multisig)?
- What legal / tax wording is required for referrers and buyers?

Implementation guardrails (when approved):
- simple
- onchain-verifiable where possible
- automated via the Sale contract if contract logic permits
- not spammy
- legally careful

## Out of scope for this roadmap

Do not build in this phase:
- referral contract (until architecture is approved)
- NFT contract (until separate approval)
- governance
- vault automation
- AI layer
- complex social network (comments, likes, follows, DMs)
- wealth-ranked leaderboards
- referral spam mechanics

---

## Gating principle

Before promoting any surface above from ⬜ → 🟡 → ✅, it must:
1. Pass the new product test (≥3 of the 6 pillars reinforced).
2. Have a documented truth contract (which numbers come from which
   on-chain source, and how PENDING is rendered).
3. Have an OG preview wired (SVG dynamic + static PNG fallback).
4. Have `ShareActions` integrated where shareable.

Surfaces that fail any of these gates are rejected, not shipped early.

---

## Stop Building Test

Before starting any major module — Chapter Archives, Rank Hub,
Referral, NFT, Governance, Vault Automation, AI, or any future
community surface — answer all eight:

1. Do we have enough real members to justify it?
2. Have we validated the previous feature with actual usage?
3. Is this solving a real observed problem?
4. Is it required for the next stage of growth?
5. Are we building because users need it, or because it sounds interesting?
6. Can we postpone this until the community is larger?
7. Can this be represented as `PENDING` instead of built now?
8. Does this create operational/legal complexity before revenue justifies it?

If the answers are weak: **DEFER**.

This test exists to prevent overengineering. It runs alongside the
Product Decision Framework (`docs/PRODUCT_DECISION_FRAMEWORK.md`) and
the Scalability Audit (`docs/SCALABILITY_AND_ARCHITECTURE_AUDIT.md`).

A module that survives all three gates is allowed to ship. Any one
gate failing sends it back to design or to `PENDING`.

---

## Current state (recalibration checkpoint — 2026-06-05)

Shipped:
- Member Wall ✅
- Founders Hall ✅
- Chapter Archives ✅
- Share infrastructure ✅
- Recency layer ✅
- **Rank Distribution Hub ✅** (aggregate-only, wallet-aware "Where do I fit?")

Next, validated against framework + audit + stop test:

1. **Referral Architecture** — DOC ONLY, no code, no contract
2. **NFT Recognition Layer** — PENDING page only, no contract
3. Governance / Vault Automation / AI — DEFER

## STOP CONDITION (active)

After Rank Hub the protocol has shipped every major community pillar:
Members, Founders, Chapters, Ranks, Activity, Transparency. **No new
feature work proceeds until real community growth and real protocol
usage justify the next module.** Reassess against the Stop Building Test
and Product Decision Framework when (a) member count crosses 500, (b)
the LP pool seeds, or (c) a referral/NFT/governance need is observed —
not assumed.

---

## OBSERVATION PHASE (June 5, 2026 — active)

The protocol is technically complete enough that further progress depends
on **real human behavior**, not new modules. We are now in the Observation
Phase.

**Rules:**

- No new major modules ship during this phase.
- No Referral, NFT, Governance, AI, Vault Automation, or new community
  pages — regardless of how compelling the idea feels.
- The only changes allowed are **wording, ordering, emphasis, and
  empty-state copy**, driven by real-user testing signals.

**Inputs that drive this phase:**

- `docs/REAL_USER_TEST_PLAN.md` — who to test with, what to ask, pass
  criteria.
- `docs/MVP_BEHAVIOR_METRICS.md` — the 16 metrics worth tracking.
- `docs/MVP_CONFUSION_SIGNALS.md` — how to read confusion as data.
- `docs/MVP_TESTING_SCRIPT.md` — invites, interview scripts, observation
  checklist.

**Exit criteria:**

The Observation Phase ends only when **two consecutive rounds** of real
testers (≥ 7 each) hit the one-minute pass criteria at ≥ 70%. At that
point, the next module is re-evaluated against the Stop Building Test,
the Product Decision Framework, and the six-question product test — in
that order. If any of the three fails, the module waits.


