# The Syndicate — Story Engine & Emotional Operating System

> **CONSTITUTIONAL DOCUMENT.** This is the highest-level **behavioral and
> storytelling** source of truth for The Syndicate. It sits alongside
> `docs/VISION.md` and `docs/NORTH_STAR_SYSTEM.md`. Where the Vision defines
> *what the protocol is* and the North Star defines *what we measure*, this
> document defines **how the protocol means, feels, and is experienced over
> time** — the engine that turns on-chain data into a story people return to.
>
> If any feature, page, component, copy change, module, or mechanic conflicts
> with this document, it does not ship. Every contributor — human or AI — must
> read this file before touching the cockpit, the Archive, the Chronicle, the
> Activity feed, Chapters, Ranks, Referral, or Horizon.
>
> **This is doctrine. It contains no implementation, no UI, no components, no
> roadmap, and no feature plans — by design.**

---

## 0. Why this document exists

For months the project drifted because each system was understood in isolation:
Seat, SYN, Archive, Chronicle, Activity, Chapters, Milestones, Cockpit, Referral,
Horizon. Each was optimized as a widget. None was understood as a movement of one
engine. Every contributor eventually starts polishing cards instead of advancing
the story.

The diagnosis from the Emotional Architecture Audit was exact: **the protocol is
reported, not felt.** It is a flawless truth machine that is not yet alive.

This document removes the drift permanently by defining the **one engine** all
those systems are parts of. After this, no system may be reasoned about alone.

---

## 1. What is The Syndicate, actually?

It is **not** a dashboard. **Not** a token. **Not** a treasury. **Not** an NFT
collection. Those are organs; none is the body.

> **The Syndicate is a transparent on-chain society whose entire history of
> membership and capital is permanently recorded in public — a story that any
> member can join, verify, and watch unfold forever.**

The canonical Vision sentence it inherits: *"a transparent on-chain protocol where
every member is permanently recorded and every dollar is publicly routed."* This
document adds the missing half — that the recording is not a database, it is a
**story**, and the member is not a row, they are a **character with a permanent
position in it.**

Two anchors hold everything else up:

- **SYN is the seat. Artifacts are the memory.**
- **Activity is the ledger. Chronicle is the canon.**

---

## 2. The emotional journey

The member does not experience systems. They experience a **single arc**. Each
step must hand off cleanly to the next; a break anywhere collapses the story into
a tool.

```
First visit          →  "This is real, and it is alive." (trust + heartbeat)
   ↓
First purchase       →  "I crossed the line from watcher to participant."
   ↓
Seat acquisition     →  "I have a permanent number. I am #N, forever."
   ↓
Chapter participation→  "I belong to a cohort sealing this era together."
   ↓
Artifact collection  →  "I hold the memory of moments I was present for."
   ↓
Chronicle witnessing →  "I watched history get written, and I'm inside it."
   ↓
Long-term belonging  →  "The story keeps moving behind my seat. I come back to
                          see how far it's gone — and how much is now behind me."
```

What the engine must guarantee at each step:

| Step | The feeling that must land | The truth that earns it |
| :-- | :-- | :-- |
| First visit | "alive + verifiable" | live heartbeat + proof links |
| First purchase | "I'm in" | an on-chain receipt |
| Seat | "I am someone here" | a permanent member number |
| Chapter | "I'm with others" | a named cohort + shared seal |
| Artifact | "I was there" | a minted record tied to a moment |
| Chronicle | "I saw it happen" | a sealed, immutable canon entry |
| Belonging | "this is mine, and it grows" | the wake of members behind me |

---

## 3. The core objects

For each object: its **technical role**, its **emotional role**, and **what it is
NOT** (the boundary that, when crossed, becomes a forbidden drift — see §7).

### Seat
- **Technical:** A wallet's permanent membership position, established by its first
  purchase on the Membership Sale contract.
- **Emotional:** "I have a fixed place in this society. It is mine and no one
  else's, forever."
- **Is NOT:** equity, a share, a financial instrument, or a status rank. The seat
  is *position*, not *wealth*.

### SYN
- **Technical:** The token received when a member purchases; the on-chain
  instrument whose acquisition records the seat and routes capital 70/20/10.
- **Emotional:** The act of taking a seat — the receipt of having stepped in.
- **Is NOT:** a yield-bearing asset, a claim on the treasury/vault, a governance
  share, or a speculation. *"SYN is the seat."*

### Member Number
- **Technical:** A 1-indexed, monotonic arrival ordinal assigned at first purchase;
  verifiable forever on Avalanche.
- **Emotional:** Identity and temporal position — *when* you arrived, and therefore
  *how much history happened behind you.*
- **Is NOT:** a score, a leaderboard rank, or a measure of contribution size.
  Lower is *earlier*, never *better* or *richer*. "Positional, never wealth-coded."

### Chapter
- **Technical:** A fixed range of member numbers that **seals** when its final seat
  is taken. Canonical, locked: **I · Genesis Signal #1–#333 · II · First Thousand
  #334–#1,000 · III · The Expansion #1,001–#3,333 · IV · First Ten Thousand
  #3,334–#10,000 · V · Open Era #10,001+** (never seals).
- **Emotional:** The era you joined in, and the cohort you sealed it with.
- **Is NOT:** a scarcity mechanic, a sale tier, or a discount window. "Chapters are
  protocol memory, not scarcity mechanics." A chapter **seals** at `endN`; the next
  chapter **opens** at `startN` (= `endN + 1`).

### Milestone
- **Technical:** A named on-chain threshold (e.g. a member count or routed total)
  that is either reached or not.
- **Emotional:** A shared moment the whole society moves toward and remembers
  passing.
- **Is NOT:** a goal bar, a countdown, or a "hurry before it's gone." Milestones are
  *facts that will happen*, surfaced as forward tension, never manufactured urgency.

### Artifact
- **Technical:** An Archive1155 collectible record (e.g. The First Signal ID 1,
  Patron Seal ID 3) minted around the seat. Non-scarce by design.
- **Emotional:** A *memory* — proof you were present for a specific moment in the
  protocol's formation.
- **Is NOT:** a financial asset, a status symbol, a scarce drop, or a yield/
  governance/vault entitlement. The seat is the scarce thing; artifacts are memory.

### Archive
- **Technical:** The Archive1155 contract and catalog — the system that issues and
  records artifacts.
- **Emotional:** The protocol's memory layer — *what happened around the seats.*
- **Is NOT:** a marketplace, a speculation venue, or a separate product. It exists
  to remember, not to sell.

### Activity
- **Technical:** The live, complete, chronological event stream — purchases, swaps,
  LP movements, vault flows, new members, rank crossings, mints.
- **Emotional:** The protocol's **heartbeat** — the felt sense that it is moving
  *right now*.
- **Is NOT:** the canon. Activity is exhaustive and unfiltered. *"Activity is the
  ledger."* It must never be dressed up as curated history.

### Chronicle
- **Technical:** The curated, oldest-first record of *significant* sealed events,
  each with an on-chain anchor and a selection gate (significance, permanence,
  singularity, voice fit). Protocol-centric, not member-centric.
- **Emotional:** The protocol's own historical voice — the canon a future member
  will read to understand how this came to be.
- **Is NOT:** a raw feed, a personal timeline, or a real-time ticker. *"Chronicle
  is the canon."* If everything is in it, it is Activity, not Chronicle.

### Contribution-Depth Standing
- **Technical:** A recognition layer that currently includes capital-footprint
  bands derived from verified routed USDC and may later include non-capital
  institutional trust-capital axes.
- **Emotional:** Recognition of participation and longevity — *becoming*, not
  earning.
- **Is NOT:** a wealth ranking, a payout tier, a yield multiplier, a bought title,
  or a claim. No standing label confers financial benefit. Recognition is
  positional standing, never reward.

### Horizon
- **Technical:** The honest, clearly-labeled PENDING surface for systems not yet
  live (e.g. Seat Record ERC-721, future modules).
- **Emotional:** Desire anchored to the *permanence of the seat you already hold* —
  "what is coming will recognize the place I already have."
- **Is NOT:** a roadmap with dates, a promise, or a speculative teaser. Horizon
  creates pull from *real, existing* identity — never from future guarantees.

---

## 4. The three time dimensions

The protocol must always speak in three tenses at once. A system that lives in the
wrong tense is the most common cause of drift.

### PAST — *what is sealed and immutable* (Past Perfect)
- **Systems:** Chronicle, sealed Chapters, Member Number (your join block),
  Artifacts already minted, the co-witness set once a chapter closes.
- **The feeling:** permanence — "this happened, it is anchored to a block, and it
  will be true in 100 years."

### PRESENT — *what is moving now* (Present Continuous)
- **Systems:** Activity (heartbeat), live Pulse balances (vault/liquidity/
  operations, LP depth, price), member count, the open chapter filling, the next
  member number.
- **The feeling:** aliveness — "something is happening right now; it is real and
  verifiable."

### FUTURE — *what is named but not yet reached* (Future Conditional)
- **Systems:** Milestones not yet hit, the current chapter's seal, the next
  chapter's opening, Horizon (PENDING modules), the season-finale Chronicle
  artifact.
- **The feeling:** anticipation — "this *will* happen, and I will be here when it
  does."

> Rule: every important surface should let a member feel a **sealed past**, a
> **moving present**, and a **named future** simultaneously. Drop a tense and the
> story flattens into a dashboard.

---

## 5. The protocol narrative engine

How the protocol manufactures emotion **using only real, recorded data** — never
fabrication. Each capability below is a column of the engine.

- **Identity** — from the **Member Number** and its **wake** (`memberCount −
  memberNumber` = members who arrived after you). Identity is not a profile you
  fill in; it is a *position* the protocol assigns and the world gives weight to as
  it grows behind you.

- **Memory** — from **indexed history**: your join block/tx, purchases, rank
  crossings, artifacts minted, and the since-last-visit diff. The protocol
  *remembers you* and *remembers itself*; nothing recorded is ever silently
  rewritten.

- **Progression** — from **Ranks**, **Chapters**, and **Milestones**: a real
  ladder of recognition and a real sequence of eras. Progression is *becoming*
  (standing, longevity, participation), never *accumulating wealth*.

- **Anticipation** — from **named thresholds**: the next member number, seats to
  the next seal, the next milestone, the next chapter, the future season-finale
  artifact. Forward tension is generated by *facts that will occur*, never by
  timers or scarcity.

- **Belonging** — from **Cohorts** and **Activity**: your chapter's membership, the
  shared seal, and the visible arrival of real others. Belonging is *co-presence*
  and *co-witness*, never a social network or a leaderboard.

- **Permanence** — from **block anchors**, **sealed chapters**, and the **co-witness
  set**: positions and moments that cannot be replicated later. Permanence is the
  payoff that makes early participation matter — *access to formation*, never a
  price advantage.

**The non-negotiable input rule:** every one of these is derived from real
on-chain reads, indexed events, derived config, or honestly-labeled PENDING. The
protocol may **surface** meaning latent in real data; it may never **invent**
data to create meaning.

---

## 6. The living protocol formula

The single transformation this engine performs:

```
        BLOCKCHAIN DATA            EMOTIONAL MEANING                RETURN BEHAVIOR
   (real, verifiable facts)   (the felt significance of the   (the reason to come
                               fact, in the right tense)        back and witness)

   memberNumber, memberCount  →  "I am early; the world is    →  "How many are behind
                                  filling in behind me."          me now?"

   chapter range + count      →  "My cohort is sealing an     →  "Is Genesis Signal
                                  era together, forever."         sealed yet?"

   since-last-visit diff       →  "The protocol moved while I  →  "What did I miss?"
                                  was gone — behind my seat."

   join block + pulse now     →  "It is measurably stronger   →  "How far has it come
                                  than the day I joined."         since me?"
```

Stated as doctrine:

> **A real fact, placed in the correct tense, given personal consequence, becomes
> an emotion. An emotion that *advances between visits* becomes a habit.**

This is the retention spine: **Trust → Attachment → Habit.**
- **Trust** is already earned (transparency, proof, PENDING discipline).
- **Attachment** comes from *consequence of seat* — facts that are about *you*.
- **Habit** comes from *advancing change* — facts that are different tomorrow.

The corollary, from the North Star doctrine: *"A loop that never advances is a
metric, not a loop."* If a surface shows a fact that never changes and never
becomes personal, it is a dashboard tile, not part of the story engine.

---

## 7. The forbidden drifts

Each drift is a moment a system is pulled out of its tense, its purpose, or its
honesty. These are permanently banned. They are the failure modes that caused the
months of drift this document exists to end.

- **Activity becoming Chronicle** — curating, filtering, or romanticizing the raw
  feed. Activity is exhaustive and neutral; the moment it editorializes, the canon
  is corrupted.
- **Chronicle becoming Activity** — dumping every event into the canon. The moment
  everything is "significant," nothing is. The Chronicle must stay scarce.
- **Artifacts becoming status symbols** — implying floor, rarity-as-rank, or that
  holding more = being more. Artifacts are *memory*, non-scarce by design.
- **Ranks becoming wealth symbols** — framing recognition as payout, multiplier,
  yield, or "who routed the most." Rank is standing, never money.
- **Chapters becoming scarcity mechanics** — "only X seats left, buy now." Chapters
  are memory and cohort; their seal is *history-finality*, not a sale deadline.
- **The Member Number becoming a leaderboard** — "earlier = winning." It is
  position in a story, never a ranking of worth.
- **Referral becoming MLM behavior** — downlines, recruitment rewards, earnings
  for bringing people. Sharing must be *proof made shareable*, never compensated
  recruitment.
- **The Dashboard replacing the story** — optimizing for more tiles, more numbers,
  more density instead of more meaning. Data is evidence the engine works, not the
  engine.
- **Metrics replacing meaning** — surfacing a number because it is impressive
  rather than because it changes how a member feels or what they understand.
- **Widgets replacing narrative** — building components that each work in isolation
  but never compose into a single felt arc.
- **Fabrication of any kind** — fake rewards, XP, streaks, countdowns, scarcity,
  urgency, or social proof. *Verifiable > impressive. Live > estimated. When data
  cannot be verified: show PENDING, never invent.*

Any feature that requires one of these to be compelling is, by definition, wrong.

---

## 8. The hierarchy of what matters

When two considerations conflict, the higher one wins. This ordering is the
tie-breaker for every future decision.

```
North Star   →  Story   →  Identity   →  Memory   →  Progression   →
Anticipation →  Proof   →  UI
```

- **North Star** (verified members recorded on-chain) — the one number everything
  serves. If a change does not ultimately grow or honor this, stop. Everything
  below exists to make this number meaningful and self-sustaining.
- **Story** — the protocol is a story-in-progress. A correct fact told in the wrong
  narrative frame is still wrong. Story shapes which facts matter and in what tense.
- **Identity** — *people join identities, not dashboards.* The member's seat and
  position are the protagonist; surfaces that forget the "you" lose attachment.
- **Memory** — the protocol must remember the member and itself. Without memory,
  identity has no continuity and there is nothing to return to.
- **Progression** — becoming (rank, chapter, milestones) gives the identity a
  direction through time. Without it, identity is static.
- **Anticipation** — named futures give a reason to stay and return. Without it,
  progression has no pull.
- **Proof** — every claim above must be verifiable. Proof is the floor that makes
  all the emotion *trustworthy*; it ranks below the meanings it secures but above
  the surface that displays them, because **unverifiable meaning is hype.**
- **UI** — last. The interface is the *delivery mechanism* for everything above,
  never the point. A beautiful surface over a missing story is the exact drift this
  document forbids.

> Why this order: the protocol earns return visits by making a *true* number
> (North Star) *mean something* (Story → Identity → Memory → Progression →
> Anticipation), *provably* (Proof), and only then *renders it* (UI). Invert any
> two layers and you get a dashboard.

---

## 9. The twenty emotional loops, organized by capability

The audit discovered twenty loops. They are **not** isolated features — each is an
expression of one of the engine's six capabilities (§5). Organized this way, they
stop being a widget backlog and become the engine's behavior. (Each is powered
only by real data; full data-provenance and risk notes live in
`docs/EMOTIONAL_ARCHITECTURE_AUDIT.md`.)

### Identity — *"I am someone here, and my place gains weight."*
- **The Wake Behind You** — members who arrived after your seat; grows forever.
- **The Protocol Remembered You** — recognition on arrival by seat, chapter, rank.

### Memory — *"The protocol remembers me and itself."*
- **Since You Were Away** — the personal diff of what moved in your absence.
- **Vital Signs Since You Joined** — the protocol is measurably stronger than your
  join block.
- **Artifacts as Memory** — each artifact tied to the moment and chapter it
  commemorates.

### Progression — *"I am becoming, along a real path."*
- **The Distance Traveled** — your journey spine: join → purchases → rank
  crossings → now.
- **Coming Next For You** — the next milestones relative to your own position.

### Belonging — *"Others are here, and we are in this together."*
- **The Room Is Filling** — real arrivals entering the story alongside you.
- **Your Cohort Standing** — one of N in your chapter; belonging to a body.
- **The Sealing Cohort** — the chapter filling together toward its seal.
- **The Last Breath** — the live heartbeat; the protocol moved moments ago.
- **The Machine at Work** — the 70/20/10 routing running on its own, in public.

### Anticipation — *"Something named is coming, and I'll be here for it."*
- **Seats to Seal** — seats remaining until the current chapter seals forever.
- **The Next Seat** — who is next; the story always has a next page.
- **Horizon as Reservation** — future systems will recognize the seat I already
  hold.
- **The Season Finale** — the edition-of-1 Chronicle artifact sealed at chapter
  close.

### Permanence — *"My position cannot be replicated later."*
- **The Closing Door** — once a chapter seals, no one can ever hold those numbers
  again (history-scarcity, never a timer).
- **The Sealed Co-Witness Set** — the closed, finite cohort you witnessed the era
  with.
- **Block-Anchored Forever** — your seat fixed to an immutable block; true in 100
  years.
- **The Set Yet Unwritten** — the honest catalog of what exists, what you hold, and
  what is still sealed in the future.

> Read top to bottom, these six groups *are* the emotional journey of §2: Identity
> and Belonging are acquired early, Memory and Progression accrue with time,
> Anticipation pulls forward, and Permanence is the payoff that makes it all
> matter in retrospect.

---

## 10. For a future AI with zero context

If you are an agent joining this project and you have read nothing else, internalize
these ten things **before you touch a single line of code:**

1. **The Syndicate is a story, not a dashboard.** A transparent on-chain society
   where every member is permanently recorded and every dollar is publicly routed.
   Your job is to make that story *felt*, not to add tiles.

2. **The North Star is the one metric: verified members recorded on-chain.** It is
   monotonic and verifiable. Everything you build must make that number more
   *meaningful*, never just more *visible*.

3. **SYN is the seat. Artifacts are the memory. Activity is the ledger. Chronicle
   is the canon.** Memorize these four. Most drift is one of them being confused
   for another.

4. **The member number is identity and position, never wealth.** Earlier means
   *earlier* — more history behind them — never richer or better. Never rank
   members by worth.

5. **Build only from real data.** On-chain reads, indexed events, derived config,
   or labeled PENDING. **Never** fabricate rewards, XP, streaks, countdowns,
   scarcity, urgency, or social proof. When unverifiable: show PENDING, never
   invent.

6. **Speak in three tenses at once:** a sealed past (permanence), a moving present
   (heartbeat), a named future (anticipation). Putting a system in the wrong tense
   is the most common mistake.

7. **The forbidden financial vocabulary is absolute:** no investment, yield, ROI,
   returns, dividend, stake, share, equity, earn, accrue, profit, "raised," or
   passive income. Use: route, record, seal, witness, verify, anchor, hold, own,
   member, seat, receipt.

8. **A loop must advance to count.** If a surface never changes and is never
   personal, it is a metric, not a loop. Retention is Trust → Attachment → Habit,
   and habit comes only from facts that differ tomorrow and are about *you*.

9. **Respect the hierarchy:** North Star → Story → Identity → Memory →
   Progression → Anticipation → Proof → UI. When two things conflict, the higher
   one wins. UI is always last.

10. **Know the forbidden drifts (§7) and refuse them**, even when asked. Chapters
    are not scarcity, ranks are not wealth, artifacts are not status, referral is
    not MLM, and the dashboard never replaces the story. If a request requires a
    drift to be compelling, the request is wrong — say so.

> The breakthrough this project needs is not a UI breakthrough. It is behavioral
> and narrative. The data already contains the meaning — most of all the
> **co-witness set**. Your work is to let the data mean what it already means.

---

**End of doctrine. No implementation, UI, components, roadmap, or feature plans —
by design.**
