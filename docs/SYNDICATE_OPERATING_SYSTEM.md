# THE SYNDICATE OPERATING SYSTEM

> Final connective-tissue pass. No implementation. No contracts. No wireframes.
> No React. No code. The goal is to define the operating system that turns
> The Syndicate from "a collection of protocol features" into "a living
> universe" — and to rank what must be built next.
>
> Composes with and supersedes none of: VISION.md, INFINITE_NARRATIVE_AUDIT.md,
> SCARCITY_STATUS_PERMANENCE_AUDIT.md, MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md,
> NFT_ARCHIVE_PRODUCT_RECALIBRATION.md, NFT_DESIRE_ARCHITECTURE_PASS.md,
> PROTOCOL_STORY_ENGINE_PASS.md. This is the meta-layer above them.

---

## 0. Why this document exists

The protocol now has strong rooms and no hallway.

- Contracts work. ID 1 and ID 3 mint. Registry, health, verification, sale,
  treasury, liquidity, transparency — all stable.
- Doctrine is locked: Vision, Infinite Narrative, Core Asset, Mythology,
  Desire Architecture, Story Engine.
- Yet every page still answers a *local* question. None answers the
  *protocol-wide* questions: **Who am I? What do I own? What changed?
  Why return? Why care?**

Story Engine alone is not enough. If we only ship "Previously / Now / Next /
Far Horizon" we will rediscover, three months later, that identity, wallet,
collector and investor surfaces are still page-local. So the next pass is not
Story Engine. It is the **Operating System** that hosts Story Engine and nine
sibling engines on equal footing.

---

## 1. The Ten Engines (permanent layers)

Five engines are **permanent core**. Five are **deferred core** — permanent,
but staged. Order is doctrine, not preference.

| # | Engine | Status | Question it answers |
|---|---|---|---|
| 1 | **Story Engine** | Permanent — NOW | What is happening here? |
| 2 | **Identity Engine** | Permanent — NOW | Who am I in this protocol? |
| 3 | **Wallet Engine** | Permanent — NOW | What can I do right now? |
| 4 | **Collector Engine** | Permanent — NOW | What do I own and why is it rare? |
| 5 | **Investor Engine** | Permanent — NOW | Can I trust this with capital? |
| 6 | **Community Engine** | Permanent — NEXT | Who am I here with? |
| 7 | **Referral / Growth Engine** | Permanent — NEXT | Who brought whom? |
| 8 | **Progression Engine** | Permanent — NEXT | What is my next earned step? |
| 9 | **Reputation Engine** | Permanent — LATER | Who contributed, by action? |
| 10 | **Governance Engine** | Permanent — LATER | How does the protocol decide? |

**No optional layers.** Every layer is permanent — the only variable is the
wave in which it is activated. Anything not on this list is a *feature*, not
an engine, and must be hosted inside one of these ten.

---

## 2. Per-engine specification (Part B)

Each engine answers five questions: **Q · Need · Data · Surfaces · Depends-on**.

### 1. Story Engine — NOW
- **Q:** What is happening here?
- **Emotional need:** orientation, anticipation, FOMO-without-manipulation.
- **Data:** on-chain events (mints, sales, seals), chapter thresholds,
  registry append-events, treasury inflows.
- **Surfaces:** every page top-band (Previously · Now · Next · Far),
  hero, /activity, /chapters, /archive, /nft, /transparency.
- **Depends on:** Identity (for "since you last visited"), Wallet (for
  "your last action"), Collector (for sealed artifacts in Far Horizon).

### 2. Identity Engine — NOW
- **Q:** Who am I in this protocol?
- **Need:** belonging, permanence, "I was here."
- **Data:** wallet address → Member # · chapter-of-joining · founders flag ·
  block-height anchor · co-witness set (the 5 Core-Asset facts).
- **Surfaces:** persistent **Identity Ribbon** on every page; /my-syndicate;
  every artifact card; every share intent; every OG image.
- **Depends on:** Wallet (connection), Collector (artifacts witnessed),
  Story (chapter context).

### 3. Wallet Engine — NOW
- **Q:** What can I do right now?
- **Need:** agency, reversibility, "I am in control."
- **Data:** connection state, network, USDC balance, SYN balance, NFT
  inventory (per ID), pending allowances, last tx, eligibility flags.
- **Surfaces:** header pill, every CTA, /my-syndicate, /nft mint, /join,
  every transaction confirmation, every error recovery.
- **Depends on:** none (it is the bridge). Everything else depends on it.

### 4. Collector Engine — NOW
- **Q:** What do I own and why is it rare?
- **Need:** pride, scarcity that is real, desire for the next artifact.
- **Data:** Archive1155 per-ID supply / cap / minted, on-chain SVG, sealing
  rule, witness count, owner's position in mint order.
- **Surfaces:** /nft, /archive, /my-syndicate, artifact deep-link,
  Sealed-Mystery cards, share intents.
- **Depends on:** Wallet, Identity, Story (Far Horizon for sealed IDs).

### 5. Investor Engine — NOW
- **Q:** Can I trust this with capital?
- **Need:** verifiability, conviction, absence of speculation language.
- **Data:** treasury balances, USDC routing split, LP TVL, SYN spot,
  classified transactions, sale cumulative, health registry, audit links.
- **Surfaces:** /transparency, /vault, /liquidity, /tokenomics, /token,
  /protocol-health, homepage proof strip.
- **Depends on:** Story (for "what changed this week"), Wallet (eligibility),
  Identity (member-only verification deltas, optional).

### 6. Community Engine — NEXT
- **Q:** Who am I here with?
- **Need:** cohort belonging, "we were there together," shared memory.
- **Data:** co-witness sets (members present at the same sealed event),
  cohort bands (Genesis / First Thousand / etc.), chapter-of-joining sets.
- **Surfaces:** /members (cohort view, not leaderboard), /chapters/:slug
  (witness wall), artifact card co-witness count, member-to-member proofs.
- **Depends on:** Identity, Collector, Story.

### 7. Referral / Growth Engine — NEXT
- **Q:** Who brought whom?
- **Need:** recognition (not reward), protocol growth memory, "I built this."
- **Data:** referrer attribution per buy/mint (on-chain or signed off-chain),
  invite-graph, first-degree witness set.
- **Surfaces:** share intents (with attribution), /my-syndicate referral
  panel, "brought by" line on member cards (consensual), growth charts on
  /transparency.
- **Depends on:** Wallet, Identity, Community. **Legal gate:** recognition
  only — never payouts, never yield, never tiered rebates. Banned-copy list
  applies.

### 8. Progression Engine — NEXT
- **Q:** What is my next earned step?
- **Need:** forward motion without fake gamification, completion pride.
- **Data:** action ledger per wallet (joined, minted ID 1, minted ID 3,
  added liquidity, verified, witnessed sealing X). All actions are on-chain
  facts. No XP. No streaks. No daily-login bait.
- **Surfaces:** /my-syndicate progression band, artifact card "next step,"
  homepage personalised CTA.
- **Depends on:** Identity, Wallet, Collector, Story.

### 9. Reputation Engine — LATER
- **Q:** Who contributed, by action?
- **Need:** status earned by participation, never by wealth.
- **Data:** aggregate of Progression facts + Community co-witness density
  + Referral graph (with consent).
- **Surfaces:** /members (sorted by participation, never by holdings),
  cohort bands on artifact cards, governance weight inputs (later).
- **Depends on:** Progression, Community, Referral.

### 10. Governance Engine — LATER
- **Q:** How does the protocol decide?
- **Need:** continuity, legitimacy, transparent decision trail.
- **Data:** proposal ledger, vote ledger, seat-weighted voting (one seat =
  one voice; weights derived from Reputation + tenure, NOT SYN holdings).
- **Surfaces:** /governance (future), Chronicle as decision archive,
  /registry decision rows.
- **Depends on:** Reputation, Identity, Collector (Chronicle).

---

## 3. Permanence vs staging

- **Permanent / NOW (5):** Story, Identity, Wallet, Collector, Investor.
  Without these the protocol is not a living universe regardless of how
  many features ship.
- **Permanent / NEXT (3):** Community, Referral, Progression. Compound the
  NOW layers; ship after NOW is unified.
- **Permanent / LATER (2):** Reputation, Governance. Require months of
  on-chain action history. Activating them early would invent fake data.

There are **no optional engines**. A protocol with a missing engine is a
protocol with a missing organ.

---

## 4. The Visitor Journey × Engines (Part C)

How each engine evolves through the lifecycle. Cell content = what that
engine *says* to that stage.

| Stage | Story | Identity | Wallet | Collector | Investor | Community | Referral | Progression | Reputation | Governance |
|---|---|---|---|---|---|---|---|---|---|---|
| **Cold visitor** | "Chapter I is airing." | "You could be Member # N." | "Connect to see your seat." | "The First Signal is open." | "Treasury is here, verified." | "X members joined this week." | (silent) | "First step: connect." | (silent) | (silent) |
| **Interested visitor** | "Coming next: 500th Signal." | "Your seat # is reserved until purchase." | "1-click join, 0.50 USDC." | "Sealed artifacts wait at thresholds." | "Routing split, on-chain proof." | "Genesis cohort still open." | (silent) | "Next: join Chapter I." | (silent) | (silent) |
| **Member** | "Since you joined: 47 new signals." | "Member #00417 · Chapter I · Genesis." | "Mint The First Signal next." | "ID 1 available · ID 3 available." | "Your share of the proof, not the profit." | "5 members joined the same block." | "Share your seat link." | "Next: mint The First Signal." | (forming) | (silent) |
| **Collector** | "Far Horizon: Chronicle seals at Chapter II." | "Witness to 3 sealings." | "Add USDC to mint Patron Seal." | "You own ID 1 #00041 + ID 3 #00012." | "Treasury grew 12% since you joined." | "12 co-witnesses to your sealings." | "3 invited, 1 joined." | "Next: witness 5,000th Signal." | (forming) | (silent) |
| **Witness** | "You witnessed the 1000th Signal." | "Witness band visible on your seat." | "Position pinned." | "Sealed event recorded on your card." | (familiar) | "Your cohort is sealing soon." | (familiar) | "Next: Chapter I seal." | "Witness count: 14." | (silent) |
| **Chapter member** | "Chapter I sealed. Chapter II open." | "Chapter-of-joining: I · Genesis cohort." | (familiar) | "Chapter I artifact eligible." | "Chapter I revenue closed at $X." | "Your chapter cohort is permanent." | "You brought 4 of Chapter I." | "Next: Chapter II first action." | "Top 5% Chapter I contributor." | "Chapter I decisions archived." |
| **Protocol veteran** | "You have been here through 3 chapters." | "Founder-era seat, sealed history." | (familiar) | "Multiple sealed artifacts." | "Multi-year transparency record." | "Cross-chapter co-witnesses." | "Growth attributable to you." | "Veteran band earned." | "Reputation: top contributor." | "Eligible to propose." |
| **Future governor** | "You author the next chapter." | "Seat is voting seat." | (familiar) | "Chronicle co-author." | "Treasury steward." | "Cohort leader." | "Onboarded N future members." | (mastered) | "Reputation gates proposals." | "Active proposer / voter." |

Two rules from this matrix:
1. **No engine is silent forever.** Each one activates at a real on-chain
   threshold for that wallet — never on a fake timer.
2. **Identity Engine never resets.** Once a wallet has a seat, every other
   engine references it on every page.

---

## 5. The Protocol Heartbeat (Part D)

A returning member visits once per week. In the first 5 seconds they must
learn — from verifiable facts only:

1. **What changed since you last visited.**
   Diff against a wallet-local timestamp (last seen block) validated against
   on-chain facts: new members, new mints, treasury delta, new sealings,
   chapter progress delta. Never invented.
2. **What you missed.**
   Specifically actions where *they* could have participated but didn't:
   sealings they could have witnessed, mint windows still open, liquidity
   events.
3. **What is next.**
   The nearest *named* on-chain threshold. Never a countdown. Always a
   condition ("at the 500th Signal," "when Chapter I seals").
4. **Why you should care.**
   The personalised answer: their seat #, their cohort, their next
   progression step. The Identity Engine answers this — not copy.

**The heartbeat is the union of Story + Identity + Wallet, surfaced as a
single band on every page entry.** It is the protocol's pulse. Without it
the universe feels dead between visits.

Implementation note (for the later wave, not now): persisted in
`localStorage` as `syndicate.lastSeenBlock` and `syndicate.lastSeenAt`,
*always* reconciled against on-chain facts before render. Never shows a
delta that cannot be linked to an explorer URL.

---

## 6. The Unified Object Model (Part E)

The protocol modules currently feel like siblings. They are not — they are
projections of a single object: **the Seat**.

```
                          ┌─────────────────────────┐
                          │       THE SEAT          │
                          │  (5 Core-Asset facts)   │
                          └────────────┬────────────┘
                                       │
        ┌──────────┬──────────┬────────┼────────┬──────────┬──────────┐
        │          │          │        │        │          │          │
      SYN     Membership  Chapters   NFTs   Seat Record  Chronicle  Treasury
   (balance) (purchase)  (cohort)  (artifacts) (permanent) (memory) (proof)
        │          │          │        │        │          │          │
        └──────────┴──────────┴────────┼────────┴──────────┴──────────┘
                                       │
                                  Liquidity
                                       │
                                  Governance
```

- **SYN** is the *asset projection* of the seat (fungible utility share).
- **Membership** is the *event projection* (the moment the seat was sealed).
- **Chapters** are the *temporal projection* (when the seat was born).
- **NFTs** are the *artifact projection* (what the seat collected).
- **Seat Record** is the *permanence projection* (the seat as a sovereign
  on-chain object — later wave).
- **Chronicle** is the *narrative projection* (what the cohort lived through).
- **Treasury / Liquidity** are the *trust projection* (proof the seat is
  backed).
- **Governance** is the *voice projection* (the seat speaks — later wave).

Every engine reads from this single object. Every page is a *view* of the
seat, never a standalone module. This is the single most important
architectural commitment in this document.

---

## 7. Leverage Ranking — what to build next (Part F)

Strict order. Each "wait" is justified by a dependency on an earlier item.

| Rank | Initiative | Wave | Why it ranks here |
|---|---|---|---|
| 1 | **Identity Ribbon** | NOW | Cheapest, highest emotional ROI. Every page instantly answers "who am I?" Unlocks the heartbeat. Depends only on Wallet (already built). |
| 2 | **Verifiable Spine** (Story Engine band) | NOW | The hallway. Once present on every page, the rooms feel like a building. Depends on existing on-chain facts only. |
| 3 | **NFT Visual Upgrade** | NOW | Closes the largest desire gap. Presentation Layer (frames, sealed-mystery cards, honesty labels). On-chain SVG remains sovereign truth. |
| 4 | **Homepage Universe Hub** | NOW→NEXT | Becomes trivial once 1–3 exist. Mostly composition, not new systems. |
| 5 | **Cohort / Witness System** | NEXT | Activates Community Engine. Requires Identity Ribbon to render meaningfully. |
| 6 | **Protocol Chronicle (ID 9)** | NEXT→LATER | Wait. Chronicle is the *Far Horizon* anchor of the Story Engine. Configuring it before the Story Engine band exists wastes the artifact's narrative weight. Also depends on cohort/witness data being live. |
| 7 | **SeatRecord721** | LATER | Wait. SeatRecord is the *permanence projection* of the seat. Until Identity Ribbon, Cohort/Witness, and Chronicle are live, SeatRecord has no surface to inhabit. |
| — | **Story Engine "implementation" as a separate item** | — | Removed. Story Engine is delivered through #1 + #2; treating it as a standalone wave invites another theory document. |

**Most value first:** Identity Ribbon. One change unlocks heartbeat,
personalised CTAs, share-intent OG, and member retention.

**Should wait:** Chronicle and SeatRecord. Both are correct artifacts but
both depend on connective tissue that does not yet exist. Building them
first would repeat the original mistake — strong rooms, no hallway.

---

## 8. Anti-doctrine (what this OS forbids)

To keep this document from becoming yet another theory layer, the following
are explicitly out of scope and will be rejected if proposed:

- Any engine outside the 10 listed.
- Any "optional" engine.
- Any feature that does not declare which engine hosts it.
- Any countdown, timer, streak, or daily-login mechanic.
- Any referral mechanic that pays out, tiers, or rebates.
- Any reputation or governance weight derived from SYN holdings.
- Any "since you last visited" delta that cannot be linked to an explorer URL.
- Any new page that does not render the Identity Ribbon and the Story band.
- Any further "thinking pass" before #1 (Identity Ribbon) is implemented.

---

## 9. Decision Lens Verdicts

| Lens | Verdict | Note |
|---|---|---|
| Founder | ✓ | Defines the OS without inventing new doctrine. |
| Investor | ✓ | Strengthens Investor Engine; bans speculation copy. |
| Growth | ✓ | Referral Engine declared, scoped, gated by legal. |
| Behavioral | ✓ | Heartbeat replaces fake retention with real deltas. |
| UX | ✓ | Single object model collapses module sprawl. |
| Product | ✓ | Ranks leverage; defers Chronicle/SeatRecord with reason. |
| Staff Eng | ✓ | Identity Ribbon is the cheapest unlock; no contract work. |
| QA | ✓ | Every fact links to an explorer URL or is not shown. |
| A11y | ✓ | Identity Ribbon adds one persistent landmark, not a layer of chrome. |
| SEO | ✓ | OG images become wallet-personalised via Identity Engine. |

**10 / 10 · 0 ✗ · 0 ⚠ — proceed.**

---

## 10. Recommended next action

**Implement the Identity Ribbon.** Nothing else. One persistent component
sourced from the Wallet Engine, rendering the 5 Core-Asset facts on every
page, with a fallback "Member # N reserved" state for cold visitors.

Everything in this document compounds from that single change.
