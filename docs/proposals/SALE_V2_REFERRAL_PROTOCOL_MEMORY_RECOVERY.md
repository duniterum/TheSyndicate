# The Syndicate — Referral Protocol-Memory Recovery

**Purpose:** Recover **every referral / commission / attribution / reputation / builder-record /
CommissionRouter decision ever recorded** in the project, and classify each. This is **protocol
archaeology, not architecture.** No new ideas, no recommendations, no redesign.

**Strict scope:** READ-ONLY. No Solidity, no Sale V2 change, no frontend change, no deployment.

**Status vocabulary (as requested):**
`EXISTS` · `SUPERSEDED` · `PARTIALLY SUPERSEDED` · `ACTIVE` · `PENDING` · `FUTURE` · `ABANDONED` ·
`UNKNOWN`.

**Corpora swept:** `.agents/memory/` (all topic files), `docs/canon/`, `docs/audits/`
(incl. `FULL_PROTOCOL_VIEW_CANON_FOUNDER_INTENT_MAP.md`, `TODAY_BASELINE_STATE_SNAPSHOT.md`),
`docs/REVENUE_ATTRIBUTION_LAYER.md`, `docs/UNIFIED_PROTOCOL_DOCTRINE_MAP.md`,
`docs/BUILDER_RECORD_DOCTRINE.md`, `docs/REPUTATION_FORMULA_DOCTRINE.md`,
`docs/LEGAL_DISCLOSURE_REFERRAL.md`, `docs/PROTOCOL_IN_PUBLIC_DOCTRINE.md`,
`docs/STORY_ENGINE_AND_EMOTIONAL_OPERATING_SYSTEM.md`, `docs/RETURN_LOOP_ARCHITECTURE.md`,
`docs/MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md`, `docs/LIVE_SITE_PARITY_AND_TRUTH_CLEANUP_REPORT.md`,
`docs/NFT_ARCHIVE_*`, the four prior `docs/proposals/SALE_V2_REFERRAL_*` reports, and the live/reserved
code (`src/routes/referral.tsx`, `src/lib/preview/referral.ts`, `src/lib/referral-attribution.ts`,
`src/lib/future-referral.ts`).

> **Two clarifications carried into the classifications below (recovered facts, not opinions):**
> - **The "tiered vision" is not just doctrine — it is running code as a SIMULATED preview.**
>   `src/lib/preview/referral.ts` ships a concrete tier ladder and a durability-ranked leaderboard
>   (see §A item 5/15). So several concepts are `EXISTS` (as simulated preview) **and** `FUTURE`
>   (deferred to CommissionRouter) at once.
> - **Anti-pattern mentions are decisions too.** Where a concept appears only as a "forbidden drift"
>   (MLM, streaks, recruitment rewards, wealth-ranking leaderboards), that is a recovered
>   **rejection**, classified `ABANDONED`.

---

# A — Referral memory map (the 20 concepts)

Columns: **Status · Source (verbatim) · V2 assumes? · CommissionRouter assumes? · Conflicts with current V2?**
("Current V2" = flat 5%, inline, Operations-only, last-verified, lean events.)

### 1. SYN balance boosts
- **Status:** `ABANDONED` (never adopted; forbidden by the "never wealth" rule).
- **Source:** `REPUTATION_FORMULA_DOCTRINE.md` — "Reputation reflects durability and retention.
  **Never wealth.**" `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §4.2 — "Any formula that includes gross
  dollars as a primary term violates the constitution. Gross may be a tiebreaker, never a driver."
- **V2:** No · **Router:** No · **Conflicts with V2:** No (absent from both; would violate doctrine if added).

### 2. Rank-based boosts
- **Status:** `PARTIALLY SUPERSEDED` (considered, flagged high-risk, superseded by durability-based
  tiers; the rank/wealth-revenue flavor is rejected).
- **Source:** `TODAY_BASELINE_STATE_SNAPSHOT.md` — "**Rank-based referral boosts** — custom; high
  legal sensitivity (must stay 'recognition,' never reward/return)." `LEGAL_DISCLOSURE_REFERRAL.md`
  Banned copy — "Tier names that imply **rank-based revenue ownership**." `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md`
  §D — "Tiered/reputation boosts = V3/future."
- **V2:** No · **Router:** Only as **durability-based** tiers, never rank/wealth · **Conflicts with V2:** No (V2 is flat).

### 3. NFT ownership boosts
- **Status:** `UNKNOWN` (no referral/commission boost tied to NFT ownership appears anywhere).
- **Source:** — (not found). The only NFT economics recovered are ERC-2981 royalties, which are a
  **separate** mechanism (see item 12 / §C note).
- **V2:** No · **Router:** Not specified · **Conflicts with V2:** No.

### 4. Builder Record boosts
- **Status:** `FUTURE` (also `EXISTS` as a SIMULATED preview formula).
- **Source:** `BUILDER_RECORD_DOCTRINE.md` — "**Event** = one referral … **Record** = the aggregate
  for an address over time." `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §2.4 — "Derived view, computed
  off-chain from RAL events + holder index. **No on-chain writes in V1.**" Preview formula lives in
  `src/lib/preview/referral.ts` (`builderScore()`), labeled "**NOT FINAL**."
- **V2:** No · **Router:** Yes (Builder-Record-weighted eligibility) · **Conflicts with V2:** No (deferred).

### 5. Reputation boosts
- **Status:** `FUTURE` (also `EXISTS` as a SIMULATED preview).
- **Source:** `REPUTATION_FORMULA_DOCTRINE.md` — `score = retention×0.40 + durability×0.30 +
  ageFactor×0.20 + reachFactor×0.10`; gross is a tiebreaker only. `src/lib/preview/referral.ts`
  ships `REFERRAL_TIERS` (Signal/Advocate/Connector/Catalyst/Ambassador, commission % **of the
  Operations slice**, gated by referred-count **and** `retentionRequiredPct`) — "**Final tiers locked
  at contract deployment.**" Rendered on `/referral` (`<TierLadderPreview/>`, `<ReputationLeaderboard/>`).
- **V2:** No · **Router:** Yes · **Conflicts with V2:** No (deferred; V2 has no tier table).

### 6. Campaign-based attribution
- **Status:** `PARTIALLY SUPERSEDED` (CampaignRegistry **rejected**; campaign survives only as a
  `refTag` reserved for the future router).
- **Source:** `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §3 — "`CampaignRegistry` as a standalone system.
  **Rejected.** A campaign is a `bytes32 refTag` on RAL events." §8 — "`CampaignRegistry` contract |
  **Cut from V1.** JSON config + `refTag` filter."
- **V2:** No (no `refTag` in lean events) · **Router:** Yes (`refTag` field) · **Conflicts with V2:** No.

### 7. Referral streaks
- **Status:** `ABANDONED` (explicit anti-pattern).
- **Source:** `RETURN_LOOP_ARCHITECTURE.md` §9 — "A loop may not be added if its next state depends
  on price, yield, airdrop, governance, referral, badge, **streak**, or any reward."
  `MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md` — "Does not introduce gamification, badges, tiers, points,
  **streaks**."
- **V2:** No · **Router:** No · **Conflicts with V2:** Yes (would violate anti-gamification doctrine).

### 8. Referral achievements
- **Status:** `ABANDONED` (subsumed under the anti-gamification rejection).
- **Source:** `STORY_ENGINE_AND_EMOTIONAL_OPERATING_SYSTEM.md` §7 (forbidden drifts) — "Sharing must
  be proof made shareable, **never compensated recruitment**." `MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md`
  — "Does not introduce **gamification, badges, tiers, points, streaks**."
- **V2:** No · **Router:** No · **Conflicts with V2:** Yes (if introduced).

### 9. Multi-level / MLM / downline attribution
- **Status:** `ABANDONED` (explicit anti-pattern; the system is single-referrer, last-verified).
- **Source:** `STORY_ENGINE_AND_EMOTIONAL_OPERATING_SYSTEM.md` §7 — "Referral becoming **MLM behavior
  — downlines, recruitment rewards, earnings for bringing people** … never compensated recruitment."
  `REVENUE_ATTRIBUTION_LAYER.md` — "**Last-verified-referrer wins** … no retroactive attribution"
  (one referrer per sale; no downline).
- **V2:** No (single `referrer` arg) · **Router:** No · **Conflicts with V2:** Yes (V2 is single-level by construction).

### 10. Revenue-source attribution (`source` field)
- **Status:** `ACTIVE` as doctrine · `FUTURE` as implementation.
- **Source:** `REVENUE_ATTRIBUTION_LAYER.md` / `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §7 — "the `source`
  field is `bytes32` and the allow-list is **governance-gated** — this is the only V3 commitment we
  make today." Values: `MEMBERSHIP_SALE` (V1), `ARCHIVE_SALE` (V1/V2), `SPONSORSHIP`/`AFFILIATE` (V2),
  `BD_NETWORK`/`WHITELABEL`/`TREASURY_DEAL` (V3).
- **V2:** No — V2 does **not** carry `source` on-chain; the indexer supplies `"MEMBERSHIP_SALE"` ·
  **Router:** Yes · **Conflicts with V2:** No.

### 11. Marketplace attribution
- **Status:** `FUTURE` (secondary-sale attribution belongs to the router + a future marketplace).
- **Source:** `SALE_V2_REFERRAL_ARCHITECTURE_REVIEW.md` Part 3 (router serves primary + future
  secondary); `FULL_PROTOCOL_VIEW_CANON_FOUNDER_INTENT_MAP.md` (Marketplace = FUTURE module).
  Distinct from ERC-2981 royalty (a payout, not attribution).
- **V2:** No · **Router:** Yes · **Conflicts with V2:** No.

### 12. Archive / NFT attribution
- **Status:** `FUTURE` (reserved `source = "ARCHIVE_SALE"` + a future `ArchiveSaleV2` wrapper).
- **Source:** `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §2.1 — "called by `MembershipSaleV2` /
  `ArchiveSaleV2` / future B2B sale wrappers." §7 — "`source = "ARCHIVE_SALE"` — V1/V2."
- **V2 (membership):** No · **Router:** Yes · **Conflicts with V2:** No.

### 13. B2B attribution
- **Status:** `FUTURE` ("strategy, not V1 scope"; namespace reserved).
- **Source:** `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §7 — "The five B2B models (sponsorship, affiliate,
  BD network, white-label, treasury allocation) all reduce to: *a different `source` value on the same
  Attribution event*. V1 must **reserve namespace** for them, **not build** for them."
- **V2:** No · **Router:** Yes · **Conflicts with V2:** No.

### 14. Partner attribution
- **Status:** `FUTURE` via the B2B namespace; **no standalone "partner" decision** (`UNKNOWN` as a
  distinct term).
- **Source:** Subsumed under `SPONSORSHIP` / `AFFILIATE` / `BD_NETWORK` in
  `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §7 / `REVENUE_ATTRIBUTION_LAYER.md`. No document names a
  "partner" program separately.
- **V2:** No · **Router:** Yes (as a `source` value) · **Conflicts with V2:** No.

### 15. Referral leaderboards
- **Status:** `PARTIALLY SUPERSEDED` — a **durability-ranked** Reputation leaderboard `EXISTS` as a
  SIMULATED preview and is `FUTURE` for production; a **wealth-ranking** referral leaderboard is
  `ABANDONED`.
- **Source:** `src/routes/referral.tsx` mounts `<ReputationLeaderboard/>`; `src/lib/preview/referral.ts`
  computes it ("gross USDC is a **tiebreaker only**"). Rejected flavor: `PROTOCOL_IN_PUBLIC_DOCTRINE.md`
  — "**referral-network leaderboard** (creates wealth-ranking mental model)" (forbidden frame);
  `RETURN_LOOP_ARCHITECTURE.md` §9 — return-loops may not depend on "referral, badge, streak, or any
  reward."
- **V2:** No (off-chain view) · **Router:** Yes (durability view over RAL events) · **Conflicts with V2:** No.

### 16. Referral badges
- **Status:** `ABANDONED` as a **reward** mechanism. (A non-referral recognition "badge" exists for
  ranks; it is not a referral feature.)
- **Source:** `RETURN_LOOP_ARCHITECTURE.md` §9 — "… governance, referral, **badge**, streak, or any
  reward." `LIVE_SITE_PARITY_AND_TRUTH_CLEANUP_REPORT.md` — LP "**badges**/leaderboard" promises
  **removed** as untruthful; for ranks, "Kept: **badge**, archive recognition, public member number"
  (recognition only, non-referral).
- **V2:** No · **Router:** No · **Conflicts with V2:** Yes (as a reward).

### 17. Referral artifacts
- **Status:** `PENDING` (reserved promotion path; gated, not built).
- **Source:** `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §2.4/§2.6 — "Eligible Builder Records **may be
  promoted to Artifacts or Chronicle entries via the Mythology Gate after 1/3/5-year thresholds** …
  never minted by RAL directly." So a "builder/referral artifact" is reserved behind Reputation + the
  Mythology Gate.
- **V2:** No · **Router / Mythology Gate:** Yes · **Conflicts with V2:** No.

### 18. CommissionRouter governance controls
- **Status:** `ACTIVE` as doctrine (`FUTURE` as implementation).
- **Source:** `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §2.8 — "Governance … **Owns the upgrade keys for
  `CommissionRouter`**, the tag allow-list, the Reputation formula, the Mythology Gate." §7 — the
  `source` allow-list is "**governance-gated**."
- **V2:** No · **Router:** Yes · **Conflicts with V2:** No (V2 is a separate immutable contract).

### 19. CommissionRouter upgrade controls
- **Status:** `ACTIVE` as doctrine (`FUTURE` as implementation).
- **Source:** `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §2.1 — "The router's **parameters (tier table,
  allowed sources) are upgrade-gated; events themselves are immutable.**"
- **V2:** No (V2 has no upgradeable params; it is immutable) · **Router:** Yes · **Conflicts with V2:** No.

### 20. Attribution event schema evolution / versioning
- **Status:** `ACTIVE` (split path).
- **Source:** Full struct `Attribution{ source, campaign, token, gross, buyer, referrer, tier,
  splits[5], paymentMode, attribution, refTag }` (`REVENUE_ATTRIBUTION_LAYER.md`); "schema reserves
  namespace … adding any … requires no contract change — only a governance vote on the source
  allow-list." V2 path: lean `Routed` / `ReferralAttributed` / `ReferralClaimed` + off-chain
  projection onto the RAL shape (`SALE_V2_REFERRAL_FOUNDER_RECONCILIATION_DECISION_REPORT.md` §1.E —
  proposed, pending ratification). Preview ledger "**Schema mirrors the canonical Attribution event
  (forward-compatible).**"
- **V2:** Yes (lean) · **Router:** Yes (full) · **Conflicts with V2:** No.

---

# B — Referral evolution timeline

**Phase A — Tiered Revenue Attribution Layer (original).** A shared `CommissionRouter` owns
attribution for every sale; commission is **tiered** (`referrer = OperationsSlice × tierTable[tier]`);
full `Attribution` struct "locked for V1"; buyer-override + `refTag` campaigns; Builder Records +
Reputation (durability/retention, "never wealth") as the future inputs; promotion to Artifact/Chronicle
via the Mythology Gate. The `/referral` page renders this as a SIMULATED tier ladder + reputation
leaderboard. *(RAL, Unified Map, Builder/Reputation doctrines, preview code.)*

**Phase B — Pull-back to attribution-only / recognition-only.** Code reserves only the **shape**
(`future-referral.ts`: reward "ALWAYS PENDING"); live surface is pure off-chain `?ref=` capture
(`referral-attribution.ts`: "No reward. No commission. No payout."); Operating System §2.7
"recognition only — never payouts, never tiered rebates"; Master Completion Pass "Do NOT build / P4";
Full Protocol View "PENDING / FUTURE"; Legal keeps `/referral` **noindex + SIMULATED**. The protocol
also explicitly **rejects** MLM/downlines, recruitment rewards, streaks, achievements, and
wealth-ranking leaderboards (Story Engine §7, Return Loop §9, Mythology audit).

**Phase C — Sale V2 draft (current).** Re-introduces a **live, in-transaction** payout, **simplified
to flat 5%** from Operations, inlined (no router), **lean events**, no tiers/override/refTag. "direct
sales commission." Tiers/reputation/campaign/multi-source all punted to the future CommissionRouter
(V3+). *(Sprint 0 §B4, Sale V2 architecture §D, draft `.sol`.)*

**Net:** the **rich vision was never deleted** — it was **deferred** to CommissionRouter and **kept
alive as a SIMULATED preview**; V2 is a deliberately **minimal slice** of it; and a parallel band of
**hard rejections** (MLM/gamification/wealth-ranking) sits permanently outside both.

---

# C — What is already frozen

Recovered as settled across ≥2 independent sources (constitutional / ratified):

- **70% Vault + 20% Liquidity are never touched by referral.** Commission comes **only from the 10%
  Operations slice.**
- **V2 referral = fixed 5%, paid in the same transaction** (Sprint 0 §B4, Arch §D, draft).
- **Push-then-escrow** settlement + `claimReferral()` pull fallback.
- **Last-verified-referrer wins; no retroactive attribution.**
- **Eligibility = recognized member, not self, not zero** (`knownMember && != buyer && != address(0)`).
- **Tiers / reputation / campaigns are deferred to V3 / CommissionRouter** — not in V2.
- **`source` is a `bytes32`, governance-gated allow-list** — the single V3 commitment made today;
  source expansion is a config/governance change, **not** a contract migration.
- **Reputation is durability + retention, never wealth** (gross is a tiebreaker only).
- **Permanently rejected:** MLM/downlines, recruitment rewards, referral streaks, referral
  achievements, wealth-ranking referral leaderboards, SYN-balance boosts, referral-as-reward badges.
- **CampaignRegistry, AcceptedTokenRegistry, TierOracle are cut from V1** (refTag/inline allow-list/
  holder-index instead).
- **NFT ERC-2981 royalty is a separate mechanism** from referral (secondary royalty to the operations
  wallet; NFT mint proceeds accrue to the Archive owner, not the 70/20/10 split).
- **Vocabulary:** banned — yield, passive income, ROI, revenue share, guaranteed earnings, dividend;
  rank-revenue tier names.

---

# D — What is still undecided (recovered open items)

> These are recovered as **open in the record.** (Several have *proposed* answers in
> `SALE_V2_REFERRAL_FOUNDER_RECONCILIATION_DECISION_REPORT.md`, but that report is **advisory /
> pending founder ratification** — so they remain open until ratified. No answer is offered here.)

- Whether Sale V2 emits **lean events** vs the **full `Attribution` struct** on-chain (J6 —
  *proposed* lean, not ratified).
- Whether `/referral` flips from **SIMULATED → LIVE** when V2 ships, and what stays labeled "future."
- **Jurisdictional legal sign-off** before contract deployment (Legal: "Pending legal review").
- How to **reconcile the Phase-B "reward PENDING / Do NOT build / recognition only" docs** with a live
  V2 payout (which docs change, and to what).
- The **final tier table** values (preview tiers are "locked at contract deployment" — a V3 item).
- **ERC-2981 royalty %** for Archive1155 (`0%` or `2.5–5%`) — adjacent, affects the "5%" naming
  collision.
- The **ship timing** of CommissionRouter (recorded only as "future").
- How (or whether) to bound **same-human multi-wallet self-referral** beyond `referrer != msg.sender`.

---

# E — What V2 must ignore

Recovered: Sale V2 is a single, immutable, minimal slice. It **must not** assume or implement any of —

- Tier tables, reputation/builder-record-weighted commission (items 2, 4, 5).
- Campaign / `refTag` (item 6); the on-chain `source` field (item 10); multi-source / B2B / partner /
  marketplace / archive attribution (items 11–14).
- Buyer-override (RAL `attribution` flag).
- The full `Attribution` struct (item 20) — V2 stays on lean events.
- Leaderboards, badges, artifacts as **on-chain V2 features** (items 15–17).
- Everything `ABANDONED`: MLM/downlines, streaks, achievements, SYN-balance/rank/NFT-ownership boosts,
  reward-badges, wealth-ranking leaderboards (items 1, 2-flavor, 3, 7, 8, 9, 16).

**V2 carries exactly:** one referrer **address**, flat **5%**, **last-verified**, **Operations-only**,
**lean events**, push-then-escrow.

---

# F — What CommissionRouter inherits (the preserved vision)

Recovered as the home of everything deferred (V3+):

- The **full `Attribution` struct** (`source, campaign, token, gross, buyer, referrer, tier,
  splits[5], paymentMode, attribution, refTag`).
- A **tier table** — but only **durability/retention-weighted**, "never wealth."
- **Governance-gated `source` allow-list** → SPONSORSHIP / AFFILIATE / BD_NETWORK / WHITELABEL /
  TREASURY_DEAL / ARCHIVE_SALE (B2B, partner, archive, and — with a marketplace — secondary
  attribution).
- **Upgrade-gated parameters** (tier table, allowed sources) with **immutable events**; **Governance
  owns the upgrade keys.**
- **Buyer-override** and **`refTag` campaigns**.
- **Builder-Record / Reputation eligibility** inputs; **promotion to Artifact / Chronicle via the
  Mythology Gate** after time thresholds.
- **Stronger anti-abuse** (the appropriate home for self-referral / Sybil mitigation beyond the V2
  `!= msg.sender` check).
- **Does NOT inherit** the rejected set (MLM, streaks, achievements, wealth-ranking leaderboards,
  SYN-balance/rank/NFT-ownership boosts) — those are out of the protocol entirely.

---

# G — Founder decisions that still remain before Solidity review

Recovered open decisions (stated as questions, **no recommendation**):

1. **Ratify or amend** the reconciliation report's answers (A–H) — it is currently advisory.
2. **Confirm V2's event schema** is lean (close J6) — or require the full struct on-chain.
3. **Confirm the V2 referral rate** is final at flat 5% for V2.
4. **Obtain jurisdictional legal sign-off** before any deployment.
5. **Decide the `/referral` SIMULATED → LIVE** transition (what goes live, what stays "future").
6. **Authorize the doc updates** that reconcile the Phase-B "recognition only / reward PENDING / Do
   NOT build" lines with a live V2 payout.
7. **Decide the ERC-2981 royalty %** (adjacent NFT item) to keep the two "5%"s distinct.
8. **Decide the V2 stance on same-human multi-wallet self-referral** (accept as-is / bound further /
   defer to CommissionRouter).
9. **Confirm tiers / reputation / campaigns / multi-source remain V3-only** (out of V2).
10. **Confirm rank-based boosts stay out** of the model (recognition-only), per the high-legal-risk flag.

---

*Recovery complete. This document modifies no protocol code, configuration, canon, or contract, and
makes no recommendation. It records what the project has already decided about referral — what is
frozen, deferred, rejected, and still open — so the Sale V2 Solidity review can proceed against a
known, reconciled memory.*
