# NFT Desire Architecture — Final Product-Thinking Pass

**Status:** THINKING PASS · NOT IMPLEMENTATION · NOT WIREFRAMES · NOT CODE
**Companion to:** `docs/NFT_ARCHIVE_PRODUCT_RECALIBRATION.md`
**Doctrine:** SYN is the seat. NFT Artifacts are the memory.
**Hat recalibration:** Founder · CTO · Product · Growth · Investor · Community · Legal · QA — all in scope below.

---

## 0. Why this pass exists

The previous recalibration was an **Information Architecture** document.
It explained, organized, verified, structured. That work is correct and
should not be thrown away.

What it did **not** do:

- Optimize for **desire**.
- Optimize for **identity** ("I was here early").
- Optimize for **collector psychology**.
- Treat the **artifact as the hero**, not as supporting content.
- Treat future artifacts as **sealed mysteries**, not empty placeholders.
- Position **Protocol Chronicle** as a Season Finale, not an annual report.

This pass closes those gaps before a single wireframe is drawn.

Cross-checked against the five pillars (Transparency · Identity · Memory ·
Momentum · Shareability), the constitutional gates (Infinite Narrative · Core
Asset · Mythology), and the Founder Multi-Hat Five-Value Test
(Engineering · User · Emotional · Story · Retention).

---

## 1. The First 15 Seconds

A cold visitor lands on `/nft`. Nothing else. No context.

### 3 seconds — **WOW**
What they see: **a wall of artifacts**. Premium, dense, museum-grade. No
explanation header. No hero copy. No "what is The Syndicate." Just the
collection itself — like opening Netflix on a Friday night.

What they feel: *"This is a real thing. There is more than one."*

What they notice:
- One artifact is **alive** (subtle motion, gold seal, "live" pulse).
- Most are **sealed** (cold, embossed, mystery — not greyed-out).
- The whole wall has the same anatomy — clearly **one universe**.

Forbidden in this 3-second frame: explanation, FAQ, glossary, supply numbers,
contract addresses, status pills like `NOT_CONFIGURED`, the word
"placeholder," the word "coming soon."

### 10 seconds — **WANT**
Eye lands on the live artifact (First Signal). It is the **largest** card on
the wall by design. The visitor reads, without scrolling:

- **The First Signal** (the name carries weight on its own)
- **Chapter I · Genesis**
- **Mint #00417** (or whatever the next serial is — *real number, live*)
- One CTA: **Take your place** or **Mint the opening signal**

What they feel: *"I want to own one of these — and I want the one that says I was first."*

### 15 seconds — **CURIOSITY**
Their eye drifts to the **sealed** artifacts around it. They see:

- *Sealed until Chapter II*
- *Sealed until 5,000 First Signals are minted*
- *Sealed until the first season closes*
- *Sealed until discovered*

What they feel: *"There is more coming. I need to be here when it opens."*

That is the loop. Three feelings, in order: **WOW → WANT → COME BACK**.

---

## 2. Artifact-First Design

Hero is the **artifact**, not the explanation. Categories are read **off
the wall**, not announced before it.

Mental model: walk into a museum. You see the Rosetta Stone first. The
plaque is small, beside it. You do not enter through a room called
"About Egyptian Linguistics."

Translated to The Syndicate:

| Family            | How it should present itself                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------- |
| First Signal      | Hero of the wall. Live SVG, gold seal, real serial counter, single CTA.                       |
| Patron Seal       | Second focal point. Different visual family (supporter mark), same anatomy. "Stand with us." |
| Protocol Chronicle| Sealed, large, ceremonial frame. *"Sealed until the season closes."* No price, no date.       |
| Seat Record       | Sealed, soulbound mark. *"Sealed until claimed by your wallet."* Identity, not commerce.       |
| Secret Artifacts  | Mystery silhouette. *"Sealed until discovered."* No category name revealed.                   |
| Future categories | Sealed, themed by chapter, never labeled "coming soon."                                       |

Anatomy is constant across the wall (the seven-field contract from
`NFT_ARCHIVE_DESIGN_REFERENCES.md`). The visual **family** changes
(certificate, seal, pixel, ceremonial), but the **grammar** of every card is
the same. That is what makes it feel like *one* collectible universe.

Categories appear as small badges *on* the cards. They are not section
headers. The wall teaches itself.

---

## 3. Sealed vs Missing — Vocabulary Contract

This is a constitutional rule for the NFT layer.

### Forbidden vocabulary (visitor-facing)

These words leak operator/engineering vocabulary onto the museum wall and
collapse desire instantly:

- `placeholder`
- `coming soon`
- `preview`
- `roadmap card`
- `not yet available`
- `TBD`
- `NOT_CONFIGURED`
- `OWNER_ONLY`
- `inactive`
- `disabled`
- `pending mint`
- `under construction`

If a visitor sees any of these on an artifact card, the wall stops being a
museum and becomes a Trello board.

### Permitted vocabulary (visitor-facing)

These words preserve mystery, intent, and protocol logic:

- **Sealed until Chapter II.**
- **Sealed until 5,000 First Signals are minted.**
- **Sealed until the season closes.**
- **Sealed until the protocol writes its next chapter.**
- **Sealed until discovered.**
- **Sealed by the protocol.**
- **Archived — Chapter I.** (for past-only artifacts after their window closes)
- **Witnessed by Chapter I members.** (for sealed-via-event artifacts)

Operator vocabulary (`NOT_CONFIGURED`, `OWNER_ONLY`, contract states) lives
only under `/protocol-health`, `/registry`, and `/labs`. Never on `/nft`,
never on `/archive`, never on a card a visitor can land on cold.

### The Sealed Card model

A sealed card is **never** a placeholder. It is a *deliberate object*:

- Same card shape and frame as a live artifact.
- Embossed seal motif (wax, gold foil, ceremonial mark).
- One line of sealed copy (from the permitted list).
- One on-chain anchor: *"Sealing rule: 5,000th First Signal minted (current: 417)."*
- No CTA. No price. No supply. No timer.

Result: a sealed card creates **curiosity**, not absence.

---

## 4. Collector Psychology

How to manufacture desire **without** fake scarcity, fake urgency, fake
countdowns, or any financial promise.

| Lever                     | How The Syndicate uses it                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Earned serial number**  | Every artifact shows a real serial. `#00417` of an open window beats `1,000 supply` of a closed one.                |
| **Chapter belonging**     | Every artifact is tagged with the chapter it was minted in. Chapters close — the tag becomes permanent provenance.   |
| **Witness identity**      | "Minted while Chapter I was open." A *fact*, not a claim. Once Chapter II opens, no new mints can earn that fact.   |
| **Co-witness accretion**  | Your mint is anchored next to the mints that happened around it. The cohort is the moat.                            |
| **Sealed siblings**       | Owning one live artifact makes the sealed ones in the same wall feel like *your* upcoming collection.               |
| **On-chain SVG provenance** | The image is generated from on-chain data. Re-rendering proves it. No off-chain image can be lost.                  |
| **No leaderboards by wealth** | Status comes from *position*, *cohort*, *witness set* — never wallet size, never PnL.                            |
| **No countdowns**         | Sealing rules are *event-based*, not *time-based*. Real protocol thresholds only.                                   |

Constitutional cross-check (Core Asset gate): every desire lever above is
anchored to one of the 5 seat facts (member# · chapter · founders ·
block-height · co-witness set). No lever invents new scarcity.

---

## 5. Identity Layer — translating the doctrine

> "SYN is the seat. NFTs are the memory."

Translated into experiences on the wall:

### "I was here early."
- Member number is displayed **first-class** on every artifact card the
  visitor owns. Not in a tooltip. Not in metadata. On the card.
- Cohort band shown: *First 100 · First 1,000 · Genesis · Chapter I*.
- Block height of the mint is shown as a discreet plaque line — verifiable,
  permanent, impossible to fake.

### "I witnessed something."
- Every artifact lists the **event it sealed**. *"Witnessed: Chapter I open
  mint window · blocks 12,400,000 – 12,9XX,XXX."*
- When a chapter closes, every artifact minted in it gets a permanent
  *"Witnessed Chapter I closing"* line. The protocol writes this, not the UI.

### "I belong to a chapter."
- Chapter is shown as a **tag**, not a status. It does not say "current."
  It says "Chapter I." Forever.
- Members of the same chapter share the same chapter mark — visual cohesion
  across thousands of wallets.

### What members should *never* see attached to identity

- "Holder rank by USDC contributed."
- "Top wallet of the week."
- "Reward tier."
- "Yield earned."
- Anything that ranks by money instead of by position, cohort, or witness set.

(Legal hat: this also keeps the entire identity layer outside the
entitlement / reward / yield framing.)

---

## 6. Infinite Narrative — the return loop

Built only from real on-chain events. No fake timers.

### Previously On
Real, named, sealed events from the protocol's past:
- *"Chapter I opened on block 12,400,000. First Signal mint went live at 0.50 USDC, wallet limit 5."*
- *"The 100th First Signal was minted by 0x… on block 12,4XX,XXX."*
- *"Patron Seal opened on block 12,5XX,XXX."*

### Currently Airing
What's live right now, anchored to real counters:
- *"First Signal — Chapter I · 417 of an open window minted."*
- *"Patron Seal — 12 minted."*
- *"Next sealing event: 500th First Signal."*

### Coming Next
The nearest sealing event, named, with its rule:
- *"Sealing event: 500th First Signal. When the 500th mint is sealed, the
  first co-witness cohort closes."*
- *"Sealing event: Chapter II opens when 5,000 First Signals are minted.
  Current: 417."*

### Far Horizon (visible-as-sealed, never absent)
- *"Sealed until the season closes — Protocol Chronicle."*
- *"Sealed until discovered — Secret Artifact."*
- *"Sealed until claimed by your wallet — Seat Record."*

This satisfies the Infinite Narrative gate: 4 arc layers (PAST · PRESENT ·
NEXT · FAR), 3 tenses (past perfect · present continuous · future
conditional), ≥3 of 5 eternal threads (Membership · Chapter · Treasury ·
Identity · Verification), a named on-chain-backed cliffhanger.

"What changed since last visit?" is answered by the *Currently Airing* and
*Coming Next* counters moving — the visitor sees movement, not stasis.

---

## 7. Protocol Chronicle — Re-evaluation

Comparing five framings against the five pillars:

| Framing                       | Memory | Mythology | Identity | Anticipation | DAO utility | Verdict |
| ----------------------------- | :----: | :-------: | :------: | :----------: | :---------: | :-----: |
| A. Annual Protocol Report NFT |   ✅   |     ❌    |    ⚠    |      ❌      |     ⚠      |   ✗    |
| B. Season Finale Artifact     |   ✅   |     ✅    |    ✅    |      ✅      |     ⚠      |   ✅    |
| C. DAO Memory Capsule         |   ✅   |     ⚠    |    ⚠    |      ⚠      |     ✅      |   ⚠    |
| D. Legacy Artifact            |   ✅   |     ✅    |    ⚠    |      ⚠      |     ⚠      |   ⚠    |
| E. Hybrid (Season Finale + Memory Capsule) | ✅ | ✅ | ✅ | ✅ | ✅ | **✅✅** |

**Recommendation: E.** Position Protocol Chronicle as the **Season Finale
Artifact** publicly, while quietly carrying **DAO Memory Capsule** function
in its metadata.

- Public framing: *"The Season Finale. Sealed when the chapter closes."*
- Verbatim banned framing: "annual report," "yearly snapshot," "governance
  receipt," "accounting NFT," "dividend record."
- Sealing rule (must be on-chain): chapter closure event — *not* a calendar
  date. The protocol writes the chapter, the chapter writes the Chronicle.
- Identity payoff: every member of the closing chapter has a verifiable
  link from their First Signal mint to that chapter's Chronicle. The
  Chronicle *names* the cohort that lived through it.

CTO hat: this also lets us avoid time-based on-chain triggers (cron, off-chain
keepers) and use a single event-based sealing call. Simpler, fewer moving
parts, fewer failure modes.

---

## 8. Above-the-Fold Hierarchy (desire-first)

Replacing the current explanation-first order on `/nft`.

### Above the fold (first viewport, no scroll)
1. **The Wall.** The artifact wall itself. First Signal is the largest card,
   sealed siblings around it. One CTA on the hero card. No section header,
   no prose paragraph, no FAQ link, no operator vocabulary.

### Second screen (one scroll)
2. **Currently Airing strip.** Three real numbers: First Signals minted,
   Patron Seals minted, next sealing event with its rule. Single
   one-liner — *"What's happening right now in the Archive."*
3. **The First Signal anatomy.** Now — and only now — we explain. The live
   on-chain SVG with the seven numbered callouts. The visitor already
   wants one; this teaches them what they're about to own.

### Third screen
4. **Identity layer.** "Why this matters if you mint today." Member
   number, chapter tag, cohort band, witness line. *Aspirational, factual,
   never financial.*
5. **The Universe overview.** Six artifact families, sealed siblings, the
   sealing rules behind each. This is where IA finally enters — *after*
   desire and identity are in place.

### Fourth screen and below
6. **Verification layer.** Contract, registry links, explorer links,
   on-chain SVG re-render proof.
7. **FAQ + Doctrine.** "SYN is the seat. NFTs are the memory." Long-form
   explanation, links to whitepaper, archive page.
8. **Final CTA.** *"Mint the opening signal."*

### What disappears from above the fold
- Status pills (`LIVE`, `PENDING`, `NOT_CONFIGURED`) at the page level.
- Long explanatory paragraphs before the first artifact appears.
- "How The Archive Works" infographic as a hero block.
- Contract address as a hero element.

### What disappears from the page entirely (visitor-facing)
- `OWNER_ONLY`, `NOT_CONFIGURED`, `inactive`, `roadmap`, `placeholder`,
  `preview`, `coming soon`. All moved to `/protocol-health` and `/labs`.

---

## 9. Final Verdict — the ideal experience

A premium collectible universe that **happens to be verifiable** — not a
verification dashboard that happens to sell NFTs.

### Emotional progression
**WOW → WANT → CURIOSITY → IDENTITY → VERIFICATION → ACTION → RETURN.**

Verification moves *after* identity. Action moves *after* verification.
Return is the loop that closes everything: sealing events keep the wall
changing without fake timers.

### Loops the page must produce

- **Addictive loop** — every visit shows real movement in the
  *Currently Airing* counters. Coming back is rewarded with a real number
  change, not a manufactured streak.
- **Chapter loop** — minting in Chapter I creates a permanent on-chain tag
  ("Witnessed Chapter I"). Future chapters cannot retroactively grant that
  tag. Pure positional status.
- **Return loop** — sealed siblings name the event that will open them.
  Visitors come back to see the seal break — and to mint the artifact
  inside it.
- **Ownership loop** — owning one artifact reframes the rest of the wall
  as *your* upcoming collection, not the protocol's roadmap.
- **Verification loop** — every artifact card has a one-click path to its
  on-chain SVG re-render, registry entry, and explorer view. Trust is
  always one click away, but never the headline.

### The collectible universe in one sentence

A museum wall of sealed and live artifacts, each card identical in grammar
and different in family, anchored to real on-chain events, where the seat
(SYN) writes the identity and the artifacts (NFTs) write the memory — and
the only way to belong to a chapter is to be inside it while it is open.

---

## 10. Diff vs the previous Recalibration document

### Already correct (keep)
- "SYN is the seat. NFT Artifacts are the memory." doctrine.
- Audience lens diagnosis (5 personas).
- Honesty labels (`On-chain SVG` vs `Site presentation` vs `Concept preview`).
- Verification Layer block.
- Move operator vocabulary off visitor cards.
- Promote ID 3 to a paired live mint.
- Founder Multi-Hat / Decision Lens compliance.

### Still missing (must change before implementation)
- **Section 0 — The Wall.** A pure artifact-first hero block must precede
  the Universe / How It Works / Anatomy explanations.
- **Sealed vocabulary contract.** Forbidden words list above must become a
  lint rule for `/nft` and `/archive` copy (and ideally checked by an
  existing health-check script in `scripts/`).
- **Identity-first plaque on every artifact card.** Member #, chapter,
  cohort, block-height, witness line — surfaced, not buried.
- **Protocol Chronicle reframed** from "annual snapshot" to "Season
  Finale Artifact" (public framing) with DAO memory capsule semantics
  (metadata). Sealing rule = chapter closure event, never a calendar date.
- **Sealed Card model** standardized: same shape as live cards, embossed
  seal, on-chain sealing rule line, no CTA, no price, no timer.
- **Above-the-fold reorder**: desire → identity → curiosity → verification
  → action, instead of explanation → verification → action.
- **Currently Airing strip** as the second screen — real moving numbers, no
  prose.

### Must not change
- The seven-field artifact anatomy (`NFT_ARCHIVE_DESIGN_REFERENCES.md` §2).
- The on-chain SVG engine architecture and metadata philosophy.
- The Core Asset, Infinite Narrative, and Mythology constitutional gates.
- The constraint that every visible metric carries a verifiable on-chain
  source.

---

## 11. Decision Lens Verdicts

| Lens          | Verdict | Note |
| ------------- | :-----: | ---- |
| Founder       |   ✅    | Closes the "engineering correct but emotionally cold" gap. |
| Investor      |   ✅    | Identity and provenance beat speculation; trust stays first. |
| Growth        |   ✅    | Sealed siblings + return loop produce repeat visits without fake urgency. |
| Behavioral    |   ✅    | Real serials + cohort bands trigger early-adopter identity. |
| UX            |   ✅    | Hero is the artifact, not the explanation. |
| Product       |   ✅    | Completes the missing desire pillar without breaking IA work. |
| Staff Eng     |   ✅    | Event-based sealing rules avoid time-based on-chain triggers. |
| QA            |   ✅    | Vocabulary contract becomes a lintable rule; removes operator leakage. |
| A11y          |   ✅    | Sealed cards must still expose sealing rule as readable text, not image only. |
| SEO           |   ✅    | Per-artifact pages get named, dated, on-chain-anchored content. |

**0 ✗, 0 ⚠, 10 ✅.** Cleared for implementation planning. No code, no
wireframes, no components touched in this pass.

---

## 12. Recommended next step

A wireframe pass for `/nft` Section 0 (The Wall) + the Sealed Card model,
followed by a single PR that:

1. Adds the **vocabulary contract** check to `scripts/check-nft-archive-qa.mjs`.
2. Reframes the **Protocol Chronicle** spec docs from "annual report" to
   "Season Finale Artifact" before any contract work on ID 9 begins.
3. Drafts a **Sealed Card** component spec (no implementation yet) that
   every future artifact family will use.

No contract, ABI, deployment, or SeatRecord721 work is required for any of
the above.
