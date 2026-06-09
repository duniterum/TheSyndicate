# Protocol-in-Public Doctrine

**Status:** Constitutional. Supersedes any prior cockpit / dashboard / wording
guidance where conflicts exist. Composes with: VISION.md,
UNIFIED_PROTOCOL_DOCTRINE_MAP.md, CORE_ASSET (seat) gate, Infinite Narrative
gate, Mythology gate, Treasury Ledger Doctrine, Revenue Attribution Layer,
Reputation Formula Doctrine, Builder Record Doctrine, Legal Disclosure.

No code is shipped from this document. It is the architecture and wording
contract that every subsequent implementation PR must pass.

---

## 1. The Real Product

The Syndicate is not a token, a treasury, a referral program, an NFT
collection, or a dashboard. Those are surfaces.

The **emotional product** is:

> **Watch a protocol operate in public.**

A member has front-row seats to a transparent organization. Retention comes
from **movement** — something happened, something changed, the protocol
acted — not from price, returns, or claims.

Reference DNA (in order of weight):
1. **Mercury / banking ledger** — receipt-grade transactions, full routing trace.
2. **Public-company transparency portal** — every movement explained, every
   number anchored.
3. **Blockchain explorer** — verifiable > impressive, live > estimated.
4. **Steam profile** — identity, badges, lifetime record around a permanent seat.
5. **Netflix "what's new since you left"** — every return visit shows a diff.

Anti-DNA (explicitly rejected):
- Robinhood / brokerage portfolio (creates investor mental model)
- Yield-farm dashboard (creates "my share / my APY" mental model)
- DAO governance console (creates claim/voting-power mental model)
- Affiliate-network leaderboard (creates wealth-ranking mental model)

---

## 2. Mental-Model Contract (Wording Sweep)

### 2.1 Forbidden frames (must be eradicated site-wide)

These words and phrases create shareholder / investor / claimant
mental models and are now **banned from member-facing copy**. They survive
only inside legal disclaimers that explicitly **deny** them.

| Banned term | Why it's banned |
|---|---|
| my contribution / your contribution / treasury contribution | Implies pooled equity stake. |
| my share / vault share / treasury share | Implies pro-rata claim on assets. |
| cumulative contribution | Implies accrued ownership over time. |
| my investment / investor / investors | Implies a security relationship. |
| capital raised / money raised / funds raised | Frames the protocol as a fundraising vehicle. |
| revenue share / dividend / payout / distribution | Implies a periodic claim. |
| passive income / yield / returns / ROI / appreciation | Implies financial expectation. |
| shareholder / equity / stake / ownership of vault | Implies legal claim. |
| funded by members / funded by holders | Frames members as financiers. |
| pool / pooled funds / your pool | Implies collective property. |
| earn / earnings (when describing routing or treasury) | Implies profit accrual. |

### 2.2 Required replacements

The member bought SYN. The contract routed the payment. The on-chain record
is a **receipt**. It is not a claim, a right, a dividend, ownership, or a
revenue share.

| Forbidden | Replacement |
|---|---|
| my contribution | my purchases · my routing record · my receipts |
| cumulative contribution | total purchased · USDC routed by my purchases |
| your share / vault share | (delete — no replacement; this concept does not exist) |
| treasury contribution | purchase routing · USDC routed to Vault/Liquidity/Operations |
| investor / investors | member · members · participant · holder |
| capital raised / money raised | membership sale volume · USDC routed through the sale |
| revenue share / dividend | (delete; protocol does not distribute) |
| earnings / payout | routed amount · movement · ledger entry |
| pooled funds | wallet balances · allocation balances |
| your share of the treasury | (delete) |
| my treasury | treasury movements I helped route · my routing receipts |
| earn a commission | be eligible for a referral routing (SIMULATED until V2) |

### 2.3 Verbs that pass the doctrine

Use, freely: **route, routed, record, recorded, append, seal, witness, verify,
observe, watch, derive, anchor, mint, hold, own (an artifact), buy, purchase,
move, allocate (by contract), sign, act, emit.**

Verbs that fail and must be replaced: *earn, accrue, distribute, share,
yield, return, gain, profit, dividend out, pay out, deserve, claim.*

### 2.4 Audit verdicts on current copy (selected high-impact hits)

These are the wording fixes required before the next implementation pass.
They are also the canonical examples for the lint guard described in §10.

| File / surface | Current | Replacement |
|---|---|---|
| `src/lib/protocol-memory.ts` — fact id `contribution`, label "Your total contribution" | "Your total contribution" | **"USDC routed by your purchases"** (id stays `purchases-routed`) |
| `src/components/syndicate/MemberCard.tsx` comment + label "cumulative contribution" | cumulative contribution | **total purchased · USDC routed** |
| `src/components/syndicate/CanonicalSpec.tsx` "Every USDC contribution is split 70/20/10" | USDC contribution | **every USDC purchase routes 70/20/10 on-chain** |
| `src/components/syndicate/VaultPolicyCore.tsx` "Every USDC contribution splits…" | USDC contribution splits | **every USDC purchase is routed 70/20/10 by the sale contract** |
| `src/components/syndicate/Sections.tsx` (multiple) "bigger contributions unlock…" | bigger contributions | **bigger purchases unlock higher ranks (status only — never bonus tokens)** |
| `src/components/syndicate/Sections.tsx` "Custom contribution" tile | Custom contribution | **Custom purchase** |
| `src/components/syndicate/ActivityHeartbeat.tsx` "cumulative-contribution threshold" / "Your contribution history" | contribution threshold / history | **purchase-routing threshold · Your purchase history** |
| `src/components/syndicate/FaqRebuilt.tsx` "Larger contributions unlock higher ranks…" | larger contributions | **larger purchases** |
| `src/routes/wallet.$address.tsx` meta "cumulative contribution" | cumulative contribution | **total USDC routed by purchases** |
| `src/routes/roadmap.tsx` "Larger contributions never receive a better SYN price" | larger contributions | **larger purchases** |
| `src/lib/syndicate-config.ts` rank fact `detail: "Your contribution maps to a public rank."` | contribution | **purchases** |
| `src/lib/syndicate-config.ts` distribution copy "custom member contributions" | contributions | **custom member purchases** |
| `src/labs/components/MemberJourney.tsx` "verification, participation, contribution, and longevity" | contribution | **participation · purchases · durability** (also in REPUTATION_FORMULA_DOCTRINE) |
| `src/components/syndicate/WhyJoinSimple.tsx` line referencing "your contribution" in derived helpers | contribution | **purchases** |
| `src/lib/preview/referral.ts` field `contributionAgeDays` + leaderboard column | contributionAgeDays | **referrerAgeDays** (rename field + column header to "Active days") |
| `src/lib/quest-hooks.ts` "≈ $100 contribution" | contribution | **purchase of ≈ $100 USDC** |
| `src/routes/members.tsx` "There is no sort-by-contribution" | contribution | **no sort-by-purchase-size** (intent identical) |
| Legal disclaimers in `vault.tsx`, `whitepaper.tsx`, `archive-config.ts`, `WhyJoinSimple.tsx` | KEEP — these explicitly **deny** equity / dividend / share / ownership and must stay verbatim. |

> **Rule of thumb for reviewers:** if the word "contribution" appears outside
> a sentence that **denies** a claim, it's wrong. Replace it.

---

## 3. The Member Cockpit — Final Architecture

`/my-syndicate` is the **member operating system**. It is not a portfolio,
not a balance screen, not an investor dashboard. It answers one question:

> **"What is my relationship with the protocol, and what changed since I
> last looked?"**

### 3.1 Canonical section order (locked)

| # | Card | Frame | Status type |
|---|---|---|---|
| 1 | **Identity** — seat #, chapter, founder flag, block-height anchor, co-witness count | "Who am I in this protocol?" | LIVE (derived from indexed `TokensPurchased`) |
| 2 | **What changed since your last visit** — diff card: new chapter movement, new artifact eligibility, new treasury movement, new rank threshold crossed | "What did I miss?" — **most important card on the page** | LIVE (LOCAL-time anchored) |
| 3 | **Purchases & Receipts** — every purchase, USDC amount, SYN received, 70/20/10 routing proof per tx, explorer links | "What did I buy and where did the contract route it?" | LIVE per tx |
| 4 | **Protocol Watch** — wallet-personalized feed of protocol actions that touched my seat (chapter sealings I witnessed, milestones I crossed, artifacts that just became mintable for me) | "What did the protocol do that involves me?" | LIVE (derived) |
| 5 | **Treasury Movements** — protocol-wide ledger filtered to "movements anchored to purchases I helped route" + link to global ledger | "What did the protocol move?" — never "what do I own" | LIVE rows when present · SIMULATED rows clearly tagged |
| 6 | **Artifacts** — owned (LIVE), mintable now (LIVE), pending eligibility (PENDING), locked (LOCKED) | "What memory seals are around my seat?" | mixed, single-status per row |
| 7 | **Referral** — my link, my tier, simulated commission estimator, my simulated activity | "What routing record could my link create?" | **SIMULATED** (whole card stamped) |
| 8 | **Reputation / Builder** — concept card, formula sentence, no per-wallet score | "How will durability be measured?" | **SIMULATED concept** |
| 9 | **Future modules** — Governance · AI · B2B · Marketplace, one line each | "What's next, honestly labeled?" | **PENDING** |

### 3.2 Removed from the cockpit (doctrine deletes)

- Anything called "My contribution" / "Your contribution" → renamed §3.
- Anything called "My share" / "Vault share" / "Treasury share" → **deleted entirely**, no replacement.
- `ProtocolStorySoFar` inside the cockpit → demote to a single link out (it's a protocol-level surface, belongs on `/`, `/chronicle`, `/transparency`).
- Any chart without a wallet-scoped truth source → removed.
- Any leaderboard ranking by purchase size → removed (rank by status tier is OK; that is positional, not wealth).
- Builder Score per wallet → not built. Concept card only.

### 3.3 Single-status rule (non-negotiable)

Every cockpit card carries exactly **one** status pill — LIVE, SIMULATED,
PENDING, or LOCKED. Mixed cards are forbidden. If a card has both live and
simulated content, split it into two cards. This is the load-bearing trust
guarantee of the cockpit.

---

## 4. Public Routes vs Member Cockpit — Final IA

The split is now mechanical, not aesthetic.

| Surface | Owns | Excludes |
|---|---|---|
| `/` (Home) | Protocol pitch · five pillars · live protocol heartbeat · single CTA into `/join` | Wallet-scoped data · personal numbers |
| `/join` | Live purchase flow · generic 70/20/10 split visualizer · canonical receipts explainer | Personal estimator · personal tier |
| `/transparency` | Protocol-wide Treasury Ledger (LIVE + SIMULATED rows, tagged) · allocation policy · disclaimers | Wallet-scoped routing |
| `/activity` | Protocol-wide heartbeat (every TokensPurchased + future router events) | Wallet-filtered feed |
| `/chapters` · `/chronicle` | Long-arc canon · chapter sealings | Personal "my chapter" framing |
| `/archive` | Every artifact + status (LIVE/PENDING/LOCKED/SECRET) | Personal balances |
| `/vault` · `/liquidity` | Wallet addresses + balances + policy + explorer links | Personal share/contribution language |
| `/referral` | **Public explainer only** — split visualizer (Operations sub-split), tier ladder, sample activity, full disclosure | Personal link · personal tier · personal estimator · personal activity (all moved to cockpit §7) |
| `/ranks` · `/members` | Status tiers · public member wall (no wealth sort) | Wealth ranking |
| `/my-syndicate` | Everything wallet-scoped per §3.1 | Anything protocol-wide that has no personal hook |

### 4.1 Cross-cutting metric audit

For every metric on every public page, the test is:

1. **Protocol-centric or member-centric?** Member-centric metrics belong in
   the cockpit, not on public routes.
2. **Implies ownership or entitlement?** If yes, rephrase as routing /
   movement / receipt language or delete.
3. **Can it be expressed as routing, receipts, protocol actions, or
   verification?** Prefer the more verifiable framing every time.

Decisions applied:

| Metric (current) | Verdict | Action |
|---|---|---|
| "Total raised" on Home/Transparency | Implies fundraising | Rename → **"USDC routed through the sale"** with link to ledger |
| "Treasury balance" | OK if framed as wallet balance | Keep, label **"Vault wallet balance · live"** |
| "Member contributions to date" | Implies pooled equity | Rename → **"Total USDC routed by member purchases"** |
| "Your treasury share = X%" | Forbidden | **Delete** (no replacement; concept does not exist) |
| "Members funded $X" | Implies financiers | Rename → **"Members routed $X through the sale"** |
| "Capital deployed" | Implies investor capital | Rename → **"Protocol movements: $X moved by contract"** |
| Per-wallet "cumulative contribution" line on `/wallet/$address` | Forbidden frame | Rename → **"Total USDC routed by this wallet's purchases"** |
| Rank thresholds described in $ contribution | Wording only | Rephrase → **"unlocked by purchases of ≥ $X USDC"** |

---

## 5. Treasury — "Look what happened", never "look what you own"

The Treasury surface (public on `/transparency`, personal slice in cockpit §5)
is a **public-company transparency report**, not a portfolio.

Every row is a **movement**, with five fields:
1. Source wallet (Vault / Liquidity / Operations / Sale)
2. Destination (named, address-linked)
3. Amount + asset
4. Reason tag (from the canonical allow-list in TREASURY_LEDGER_DOCTRINE)
5. Anchor (tx hash for LIVE rows; explicit `SIMULATED` pill otherwise)

Mental model the rows must produce:

> "I can see exactly what the protocol did, and I can verify it."

Forbidden in this surface:
- "My share", "your stake", "ownership %", any pro-rata implication.
- Any aggregate that pretends to be a member's "balance" inside the treasury.
- Any chart that visualizes treasury as a pie the member owns a slice of.

Allowed:
- Wallet balances (these are facts).
- Allocation policy (70/20/10 — this is the contract rule, not a claim).
- Movement timeline (this is the story).
- Filters: by source, by reason, by date.

---

## 6. The Return Loop (why people come back)

The doctrine of retention. The cockpit must, on every return visit, be able
to answer **"what changed?"** with at least one of these triggers:

1. A new purchase routed (yours or protocol-wide milestone-crossing).
2. A new chapter sealed.
3. A new treasury movement appended.
4. A new artifact became mintable for this wallet.
5. A new member rank crossed (yours or a notable threshold).
6. A new referral routing recorded (post-V2).
7. A new protocol action emitted (audit, infra, deployment).

If none of these fire, the "What changed since your last visit" card honestly
says **"No new movement since {timestamp}."** That honesty is part of the
product. Never fabricate change.

---

## 7. Referral — Final Scope

`/referral` becomes a **pure public explainer**:
- Split visualizer with Operations sub-split (commission source).
- Tier ladder (indicative — final tiers locked at contract deploy).
- Sample SIMULATED activity (clearly tagged).
- Full legal disclosure (LEGAL_DISCLOSURE_REFERRAL).
- Removed: personal estimator, "your tier", personal activity (all → cockpit §7).

Wording: **never** "earn a commission". Always **"be eligible for a routing
when CommissionRouter ships"**. The referrer does not earn; the contract
routes a portion of the Operations slice to them.

---

## 8. Reputation — Final Scope

`/referral` reputation block + cockpit §8 show:
- One sentence: *"Reputation derives from durability, retention, age, and
  reach — never from purchase size or wealth."* (REPUTATION_FORMULA_DOCTRINE)
- The formula, displayed as a constant.
- No per-wallet score. No leaderboard ranking by wealth. The SIMULATED
  leaderboard on `/referral` shows referrer **durability**, not wealth.

`contributionAgeDays` field must be renamed `referrerAgeDays` everywhere; the
column header on the leaderboard becomes **"Active days"**.

---

## 9. Identity Layer — Composes With Mythology Gate

Per the Mythology gate and Core Asset gate, identity always collapses to the
5 on-chain facts of the seat: member# · chapter-of-joining · founders-flag ·
block-height anchor · co-witness set. The cockpit Identity card surfaces
≥2 of these 5 always; the others are revealed as they accrue. Status is
positional, never wealth-coded.

---

## 10. Enforcement (no code today; this is the contract for next PR)

The next implementation pass MUST add to `scripts/check-preview-labels.mjs`
(or a sibling `check-ownership-wording.mjs`) the following lint rules,
scoped to `src/` excluding the explicit denial sentences in legal disclaimers:

1. Fail on `\bcontribution(s)?\b` outside files allow-listed as legal disclaimer.
2. Fail on `\b(my|your)\s+(share|stake|treasury share|vault share)\b`.
3. Fail on `\binvestor(s)?\b`, `\bdividend(s)?\b`, `\bcapital raised\b`,
   `\bmoney raised\b`, `\brevenue share\b`, `\bpassive income\b`, `\byield\b`,
   `\breturns\b`, `\bROI\b` outside legal-denial allow-list.
4. Fail on the literal "earn a commission" / "earn commissions".
5. Fail on `contributionAgeDays` (forces the rename).
6. Cockpit cards must each carry a single status pill — fail on cards that
   render two pills.

Allow-list (legal disclaimers that DENY the concept and must keep the words):
- `src/lib/archive-config.ts` (ARCHIVE_DISCLAIMER)
- `src/routes/vault.tsx` (no-yield/no-dividends/no-claim paragraph)
- `src/routes/whitepaper.tsx` (artifact denial paragraph)
- `src/routes/transparency.tsx` (artifact denial paragraph)
- `src/components/syndicate/WhyJoinSimple.tsx` (utility-token disclaimer)
- `src/labs/components/WhyJoinNow.tsx` (labs only — not shipped)

---

## 11. Decision Lens Verdicts

| Lens | Verdict | Note |
|---|---|---|
| Founder | ✓ | Locks the emotional product ("watch a protocol operate in public") above every surface. |
| Investor | ✓ | Eliminates every shareholder/investor frame; only routing/receipt language survives. Reduces securities risk. |
| Growth | ✓ | Return loop is now mechanical: 7 named triggers feed "what changed". |
| Behavioral | ✓ | Single-status rule + "what changed since last visit" answers the diff question on every return. |
| UX | ✓ | Cockpit § order locked. Public/personal split is mechanical, not aesthetic. |
| Product | ✓ | Removes scope creep (no per-wallet Builder Score, no governance now). |
| Staff Eng | ✓ | No code yet; lint rules specified so the next PR can enforce mechanically. |
| QA | ✓ | Allow-list named explicitly so legal denials don't trip the guard. |
| A11y | ✓ | Single-pill-per-card rule reduces screen-reader ambiguity. |
| SEO | ✓ | Public routes keep protocol-centric metrics; personal noise removed. |

All ten lenses pass. No ✗. No ⚠ pairs. Doctrine ratified.

---

## 12. What is explicitly NOT in this doctrine (and not built next)

- CommissionRouter contract (deferred).
- Per-wallet Builder Score (deferred — concept card only).
- Governance / AI / B2B / Marketplace modules (PENDING line items only).
- Any new chart, leaderboard, or analytics surface.
- Any new visual system. Design system v2 stands.

---

## 13. Cross-references

- `docs/VISION.md` — north star.
- `docs/UNIFIED_PROTOCOL_DOCTRINE_MAP.md` — neighbor graph.
- `docs/TREASURY_LEDGER_DOCTRINE.md` — movement schema and tag allow-list.
- `docs/REVENUE_ATTRIBUTION_LAYER.md` — canonical `Attribution` event.
- `docs/REPUTATION_FORMULA_DOCTRINE.md` — durability formula.
- `docs/BUILDER_RECORD_DOCTRINE.md` — Event vs Record tiering.
- `docs/LEGAL_DISCLOSURE_REFERRAL.md` — required denial language.
- `docs/SCARCITY_STATUS_PERMANENCE_AUDIT.md` — Core Asset (seat) gate.
- `docs/MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md` — naming gate.
- `docs/INFINITE_NARRATIVE_AUDIT.md` — narrative arc gate.
