# The Syndicate — Final Sale V2 Referral Launch Execution Plan

**This is the action plan, not archaeology and not new architecture.** It tells us exactly what to do
next, in order, to launch Sale V2's referral **without losing the long-term tiered / reputation /
builder-record vision.**

**Strict scope:** READ-ONLY. No code, no Solidity, no frontend, no deploy, no new economics.

**Grounding:** the Sale V2 architecture review, parameter simulation, founder decision report, and the
three referral reports (recovery audit, reconciliation, protocol-memory recovery). Nothing new is
invented here.

---

# 1 — Final referral launch decision

## ✅ **A — Sale V2 launches flat referral live; tiered remains visible as the future CommissionRouter.**

Not B, not C, not D. One decision, committed.

- **Not B** (tiered live): the tier table needs reputation + builder-record inputs that don't exist
  on-chain yet; shipping them inside an immutable membership sale is the dangerous-complexity path the
  founder explicitly wants to avoid.
- **Not C** (router first): blocks a live, ready, low-risk launch on a large unbuilt contract.
- **Not D** (delay payout): throws away the fact that the draft already pays safely in-tx; pure
  schedule loss for no safety gain.

**A is literally the founder's own rule encoded:** *flat V2 is the launch layer; tiered is preserved
as the future router.* Flat V2 **never overwrites** the tiered vision — it sits beneath it.

---

# 2 — Why this choice is safest

| Lens | Why A is safest |
| --- | --- |
| **Founder** | Honors both halves of the position: launch now with the simplest safe logic **and** keep the tiered/reputation/builder vision fully alive (docs + previews + reserved schema). Nothing built is wasted. |
| **CTO** | Smallest immutable surface that can't lock out V3. Tiers/reputation/campaign live in an **upgradeable** router later; the immutable sale stays trivial (one address, one rate, one split). |
| **Security** | Flat 5% from Operations only = bounded blast radius (Vault/Liquidity untouched). No tier oracle, no external reputation read, no override path = fewer attack surfaces in the contract that can never be patched. |
| **Growth** | Referral goes **live now** — the growth loop starts immediately. The richer tiered/leaderboard/B2B upside is preserved for the router, so nothing is forfeited; it's sequenced. |
| **Legal** | "Direct sales commission, flat %, from the operational slice" is the cleanest disclosure. No rank/wealth-revenue tiers (the high-sensitivity item) enter the live contract; they stay labeled "future." |
| **Product UX** | The public 30-second model is unchanged ("referral gets part of Operations"). The tiered preview keeps teaching the future without claiming it's live. |

---

# 3 — What becomes live with Sale V2

| Surface / capability | Status | Today → with V2 |
| --- | --- | --- |
| **Referral link** (`?ref=memberN`) | **LIVE WITH V2** | Already captured off-chain; with V2 it now drives a real payout. |
| **Referral capture** | **UNCHANGED** | Already live (first-touch, browser-local); keeps feeding the `referrer` arg, no change. |
| **Referral attribution** | **LIVE WITH V2** | Off-chain "introduced by #N" already live; **on-chain** attribution (lean events) goes live with V2. |
| **Referrer payout** | **LIVE WITH V2** *(legal-gated)* | The new capability: flat 5% of gross from the Operations slice, paid in-tx (push-then-escrow). |
| **/referral page** | **SIMULATED** | Stays simulated + noindex until legal sign-off; then the **flat-payout explainer** flips live, tiered/reputation sections stay "future." |
| **My Syndicate referral card** | **SIMULATED → LIVE WITH V2** (after frontend wiring) | Link/attribution/payout become real once the frontend is wired (post-deploy); tier estimator stays SIMULATED. |
| **Cockpit introduced-by card** | **UNCHANGED** | Honest attribution display, no economics; keeps working as-is. |
| **Tier ladder preview** | **VISIBLE FUTURE** (SIMULATED) | Remains a clearly-labeled future-CommissionRouter preview. Not live. |
| **Reputation leaderboard** | **VISIBLE FUTURE** (SIMULATED) | Durability-ranked preview stays "future." Wealth-ranking flavor stays rejected. |
| **Builder records** | **VISIBLE FUTURE** | Doctrine + preview formula only; no production surface ships with V2. |
| **Future CommissionRouter preview** | **VISIBLE FUTURE** | Explicitly labeled the future layer that inherits tiers/reputation/campaign/multi-source. |

---

# 4 — What must be updated **before** Solidity review

> Only items that, if left as-is, would make the reviewer misread the contract. **No frontend polish.**

1. **Founder ratifies Decision A** (Step 1 below). The reviewer needs the launch decision fixed.
2. **A one-page "frozen referral assumptions" sheet for the reviewer** (see §10) — the exact V2 scope:
   flat 5%, Operations-only, last-verified, lean events, no tiers/override/refTag/on-chain-source.
3. **Close J6 explicitly as "lean events"** — so the reviewer knows the expected event set
   (`Routed` / `ReferralAttributed` / `ReferralClaimed`) and won't flag a "missing" full Attribution struct.
4. **A reviewer-facing contradiction note** stating that V2 **intentionally** introduces live payout —
   so docs that still say "recognition only / reward PENDING / Do NOT build" don't confuse the review.
   (Full doc rewrites are **not** required before review; one acknowledgment line is.)
5. **The Sale V2 review checklist gets a referral section** naming what to verify (split math, escrow/
   claim fallback, self-referral `!= msg.sender` guard, reentrancy, Operations-only sourcing).

Everything else (canon rewrites, label changes) is a **deploy** blocker, not a **review** blocker.

---

# 5 — What must be updated **before** deployment

- **Legal wording** — finalize jurisdictional disclosure; flip the live referral disclosure on; lock
  the allowed/forbidden vocabulary (allow "direct sales commission"; forbid "earn a commission,"
  yield, ROI, revenue share, etc.).
- **/referral labels** — drop SIMULATED on the flat-payout reality; keep tiered/reputation labeled
  "future"; remove `noindex` only after legal sign-off.
- **My Syndicate labels** — referral card reflects flat-5%-from-Operations reality (no "earn" verbs);
  tier estimator stays SIMULATED.
- **Referral preview labels** — `src/lib/preview/referral.ts` estimator reframed flat (not tiered) for
  the live part; tier ladder stays clearly future.
- **noindex / simulated status** — flip on the live portions, retain on the future portions.
- **Docs that still say payout is PENDING** — Operating System §2.7, `future-referral.ts` header,
  Master Completion Pass G3, Full Protocol View §12.
- **Docs that still imply tiered is live** — reframe `/referral`-adjacent copy + the RAL "tierTable"
  framing as **CommissionRouter (V3+)**, not now.
- **Docs that still imply fixed 5% is forever** — state clearly: flat 5% is the **V2 launch layer**;
  the router may introduce durability-based tiers later.

---

# 6 — What can wait until after deployment

- CommissionRouter contract.
- Tiered referral (durability-based tier table).
- Reputation scoring live.
- Builder records live.
- Campaign / `refTag` attribution.
- Marketplace (secondary-sale) attribution.
- AI / B2B / partner attribution (`source` allow-list expansion).
- Richer analytics.
- Leaderboard productionization (durability-ranked).

None of these block V2; all are namespace-reserved or doctrine-preserved.

---

# 7 — What must not be lost (the preserved future vision)

Flat V2 is the floor, never the ceiling. **All of the following remain explicitly preserved** — in
docs/canon, in the SIMULATED `/referral` previews, and in the reserved RAL schema — and the V2 launch
must not delete or contradict any of them:

- **Tiered commission** (durability-based, never wealth/rank).
- **Reputation weighting** (`retention 0.40 / durability 0.30 / age 0.20 / reach 0.10`; gross = tiebreaker only).
- **Builder records** (Event vs Record, time thresholds).
- **Durability / retention logic.**
- **Campaign tags** (`refTag`).
- **Source attribution** (`bytes32`, governance-gated allow-list).
- **Buyer override** (RAL `attribution` flag).
- **Marketplace attribution** (secondary).
- **Archive / NFT attribution** (`source = ARCHIVE_SALE`, `ArchiveSaleV2`).
- **B2B attribution** (SPONSORSHIP / AFFILIATE / BD_NETWORK / WHITELABEL / TREASURY_DEAL).
- **CommissionRouter governance** (Governance owns upgrade keys; params upgrade-gated, events immutable).
- **Mythology Gate / future artifacts** (Builder Records → Artifact/Chronicle promotion after time thresholds).

**Preservation guarantee:** these live as future-labeled previews + reserved schema + canon. Shipping
flat V2 changes none of them.

---

# 8 — Exact execution order from today

Your 12 steps, adjusted only where safety requires (adjustments flagged ⚠):

1. **Founder ratifies the referral launch decision (A).**
2. **Freeze the Sale V2 referral doctrine** — produce the one-page reviewer assumptions sheet (§10) and close J6 as lean events.
3. ⚠ **Add the referral section to the Sale V2 review checklist** (cheap, prevents review churn) — *new sub-step before review.*
4. **Run the line-by-line Solidity review.**
5. **Fix Solidity only if the review finds issues.**
6. **Prepare the legal + copy update** (wording, disclosure, labels) — draft only.
7. ⚠ **Legal sign-off gate** — payout copy cannot go live without it. *Explicit gate before deploy.*
8. **Update frontend labels** (SIMULATED→live on the flat part; future-label the tiered part).
9. **Local / forked-mainnet rehearsal if possible** (split math, escrow, claim fallback, self-referral guard) — **no Fuji/testnet**.
10. **Final audit / review** of any fixes.
11. **Deploy Sale V2.**
12. **Wire frontend to Sale V2.**
13. **Publish.**
14. **Visual verification.**

(Order change vs the draft: the only adjustments are inserting the review-checklist sub-step before
review, and making legal sign-off an explicit gate before deploy. The frontend label update is split —
draft before deploy, flip live after wiring.)

---

# 9 — Minimum actions to stop debating (shortest safe path)

**To start the Solidity review (today):**
1. Ratify **A** (flat V2 live + tiered preserved as future router).
2. Hand the reviewer the **frozen-assumptions sheet** (§10) with **J6 = lean events**.
3. **Run the Solidity review.**

**To deploy (after review passes):**
4. Update the **3 highest-priority doctrine lines** that currently say payout is impossible —
   Operating System §2.7, `future-referral.ts` header, Master Completion Pass G3 — plus legal sign-off
   and the `/referral` + My Syndicate labels.
5. **Local/forked-mainnet rehearsal → audit fixes → mainnet deploy (tiny/no funding first) → source verify → read/buy/referred-buy checks → larger funding → wire frontend → publish → verify.** (No Fuji/testnet.)

That's it. No new architecture, no router, no archaeology required to proceed.

---

# 10 — Explicit answer

## Can Sale V2 Solidity review proceed after this decision? **YES.**

There are **no code blockers.** The only prerequisites are decisions, not changes: founder ratifies A,
and the reviewer receives the frozen-assumptions sheet below. (No Solidity, frontend, or deploy action
is required to start the review.)

**Assumptions we are freezing for the reviewer:**

1. **Scope:** referral is **inline in `SyndicateSaleV2`** — no CommissionRouter in V2.
2. **Rate:** **flat 5% of gross**, taken **only from the 10% Operations slice**; Vault 70% / Liquidity
   20% are never touched.
3. **Attribution:** **last-verified-referrer only** — no retroactive, no override, no `refTag`, no
   on-chain `source` field.
4. **Eligibility:** `referrer != address(0) && referrer != buyer && knownMember[referrer]`.
5. **Settlement:** **push-then-escrow** with a `claimReferral()` pull fallback; the buy is never blocked.
6. **Events:** **lean** (`Routed`, `ReferralAttributed`, `ReferralClaimed`) — **J6 closed as lean**;
   no full Attribution struct on-chain (off-chain indexer projects onto the RAL shape).
7. **No tiers, no reputation input, no campaign, no multi-source** in V2 — all preserved for the future
   CommissionRouter (V3+).
8. **Known accepted V2 limitation:** same-human multi-wallet self-referral is bounded only by
   `referrer != msg.sender`; stronger anti-abuse is deferred to the router (do not add on-chain
   identity logic to V2).
9. **Immutability:** V2 has **no upgradeable parameters**; all future flexibility lives in the router.
10. **Legal gate:** live payout copy ships only after legal sign-off — a **deploy** gate, **not** a
    review blocker.

The reviewer should evaluate the draft **against these assumptions** and flag anything that deviates.

---

*This document writes no code, modifies no Solidity, changes no frontend, and deploys nothing. It is
the execution path from current state to Sale V2 launch, preserving the tiered / reputation /
builder-record vision as the future CommissionRouter layer. Decision A becomes binding on founder
ratification (Step 1).*
