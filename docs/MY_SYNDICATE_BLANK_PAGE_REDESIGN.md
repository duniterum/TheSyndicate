# My Syndicate — Blank-Page Redesign

**Mode:** Product Designer · Creative Director · UX Lead · Information Architect.
**Status:** Design doctrine. No code. No implementation. Current `/my-syndicate` is treated as if it does not exist.
**Audience:** A connected member returning to the protocol.

This is not a dashboard. It is **a member profile inside a living story**.
The seat is the center. Everything else orbits.

---

## 0. North star

> "SYN is the seat. Artifacts are the memory. The Syndicate is the story."

A member opening `/my-syndicate` should feel three things in this order:

1. **This is mine.** (Identity)
2. **I was here.** (Memory)
3. **Something is coming.** (Anticipation)

Mechanics, metrics, and modules are evidence — never the subject.

---

## 1. First screen (above the fold, no scroll)

A single composition. No tiles. No grid. No nav tabs. No "dashboard."

```
┌──────────────────────────────────────────────────────────────┐
│  CHAPTER I · GENESIS                              ◐ live      │
│                                                              │
│                                                              │
│                  M E M B E R   №  0 0 4 2                    │
│                                                              │
│              sealed at block 18,294,113 · 14 Mar 2026        │
│                       co-witnessed by 12                     │
│                                                              │
│                                                              │
│  ───────  CHAPTER I  ──┼─────────  CHAPTER II  ─────────     │
│   you entered here                                           │
│                                                              │
│                                                              │
│  Next sealing in 47 seats · Chapter I closes at №333         │
└──────────────────────────────────────────────────────────────┘
```

What is on this screen, and nothing else:

- **Chapter eyebrow** — the act of the story the member is currently inside.
- **Member number, set in display serif at the largest type on the entire site.** This is the hero. Not a metric. Not a CTA. A name.
- **The sealing line** — block height, date, co-witness count. Three on-chain facts that make the seat real.
- **A single horizontal chapter rail** — past chapters sealed, current chapter filling, future chapters as ghosted segments. The member's entry point is marked with a single tick.
- **One sentence of anticipation** anchored to a real on-chain threshold (next sealing event), never a countdown clock, never marketing scarcity.

No wallet address. No connect button (member is connected). No copy explaining what The Syndicate is. No "Welcome back." No avatar. No level. No XP. No streak. No SYN balance. No USDC routed. No buttons.

The first screen's job is **recognition, not action**.

---

## 2. Visual hierarchy

One typographic hero per page. Everything else is a whisper.

| Tier | Role | Treatment |
|---|---|---|
| 1 | Member № | Instrument Serif, 96–160px, generous tracking, single line |
| 2 | Chapter name | Work Sans uppercase, 11–13px, gold, letter-spaced |
| 3 | Sealing facts | JetBrains Mono, 12px, muted-foreground |
| 4 | Section eyebrows | Work Sans, 10–11px, uppercase, muted |
| 5 | Body / evidence | Work Sans, 14–16px |
| 6 | Addresses, hashes, ids | JetBrains Mono, 11–12px |

Color is doctrinal, not decorative: **gold = seat / sealing / membership**, **cyan = verification / live**, neutrals carry everything else. No gradients. No glass. No glow. No tile borders fighting each other.

Whitespace is the primary design element. The page should feel **archival**, not productive — Museum Plus, not Linear.

---

## 3. Information hierarchy

A member only ever asks five questions in this order. The page answers them in this order, top to bottom, one screen per question. No tabs. No accordions for the spine.

```
1. Who am I here?            →  SEAT          (identity)
2. Where did I enter?        →  CHAPTER       (context)
3. What did I do?            →  MEMORY        (timeline)
4. What do I hold?           →  ARTIFACTS     (collection)
5. What is coming?           →  HORIZON       (anticipation)
```

That is the entire page. Five sections. Vertical. Linear. Narrative.

Everything that does not answer one of those five questions is **removed from this route** and lives where it belongs (referral on `/referral`, governance on its own route, treasury on `/transparency`, etc.).

---

## 4. The five sections in detail

### § 1 — SEAT (identity)

Already described as the first screen. One object. No competition.

Below the hero, a single thin strip of three on-chain facts, rendered as quiet text — not pills, not cards:

```
member №0042   ·   chapter I   ·   sealed block 18,294,113
```

That strip is the only thing between the hero and the chapter rail. It is the seat's "deed."

**No metrics here.** SYN balance and USDC routed do not belong in identity. They belong in memory.

---

### § 2 — CHAPTER (context)

A horizontal, full-bleed rail showing all chapters of the protocol:

```
  ████████████  ████░░░░░░░░  ░░░░░░░░░░░░  ░░░░░░░░░░░░  ░░░░░░░░░░
   Chapter I    Chapter II     Chapter III    Chapter IV    Open Era
   sealed         current         sealed at     sealed at     ongoing
   333 seats      286 / 1000      3,333         10,000
                  ▲ you
```

- The member's own seat is the only tick on the rail.
- Past chapters are solid gold. Current chapter fills in real time. Future chapters are bone-white outlines — **visible-as-sealed**, never absent (Infinite Narrative gate: FAR layer must always be visible).
- One sentence below: "You entered when 47 seats were taken. 239 have joined since."

That sentence is the **"what changed since last visit"** answer for identity-in-time.

No CTA. No "share your chapter" button. The chapter is context, not content to promote.

---

### § 3 — MEMORY (timeline)

A **single vertical timeline**, not a grid of cards. Newest at top, oldest at bottom, anchored to block heights.

```
┌─ today ──────────────────────────────────────
│
│  ◆  +12 SYN routed to your seat            block 18,341,002
│     from sale tx 0x9a…fe ↗
│
│  ◆  Patron Seal #2 minted                   block 18,338,711
│     tx 0x4b…02 ↗
│
├─ last week ──────────────────────────────────
│
│  ◇  Chapter I crossed 250 seats             block 18,310,440
│     a protocol moment you witnessed
│
├─ your beginning ─────────────────────────────
│
│  ★  You sealed seat №0042                   block 18,294,113
│     14 Mar 2026 · co-witnessed by 12
│
└──────────────────────────────────────────────
```

Three event classes, three glyphs:

- **◆ Personal events** — your purchases, your routings, your mints. Linked to tx hashes.
- **◇ Protocol events you witnessed** — chapter sealings, milestones crossed while your seat existed. These are the co-witness accretion the Core Asset gate demands.
- **★ Origin event** — always pinned at the bottom. The sealing of your own seat. The story starts here.

This replaces every existing "purchases card," "activity feed," "what changed for you," and "chronicle preview." One spine. One reading.

Aggregates (SYN received, USDC routed, purchase count) appear as a **single muted summary line at the top of the timeline**, not as hero stats:

> 12 events · 142 SYN received · $480 routed since your seal

Numbers are evidence the timeline is real. They are not the point.

---

### § 4 — ARTIFACTS (collection)

The collectible memory layer. Visual-first.

A horizontal carousel of **artifact tiles rendered as objects**, not data cards. Each tile is a square plate with the artifact's visual seal, its name in serif, and a single status line beneath:

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  ◉◉◉◉◉  │   │   ✦     │   │  ░░░░   │   │  ░░░░   │
│  ◉ ◉ ◉  │   │  ✦✦✦    │   │  ░░░░   │   │  ░░░░   │
│  ◉◉◉◉◉  │   │   ✦     │   │  ░░░░   │   │  ░░░░   │
├─────────┤   ├─────────┤   ├─────────┤   ├─────────┤
│ Genesis │   │ Patron  │   │ Chapter │   │ Liquidity│
│ Sealed  │   │ Seal II │   │   II    │   │  Mark    │
│ HELD    │   │ HELD    │   │ ELIGIBLE│   │ LOCKED   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
```

Held artifacts come first, in color. Eligible artifacts come next, monochrome. Locked artifacts come last, ghosted to ~20% opacity — **visible-as-sealed**, never hidden, because the absence is the anticipation.

What is gone from this section:

- No price columns. (Price is a join-time concern, lives on `/archive`.)
- No status pills. The visual state of the tile IS the status.
- No category filters. Six tiles fit, the rest expands into `/archive`.
- No "future Seat Record" mixed in. SeatRecord721 is **identity**, not memory — it belongs in § 5.

Tapping an artifact opens its plate full-bleed, with provenance, mint tx, and the on-chain rule that sealed it. Quiet. Museum-like.

---

### § 5 — HORIZON (anticipation)

The future, but only the parts anchored to a real on-chain sealing event. Not a roadmap. Not "coming soon." A short list of **next sealings the member's seat will witness or unlock.**

```
SOON
  ◇  Chapter I closes at seat №333             47 seats away
     when this seals, your "Founder of Chapter I"
     status becomes permanent.

NEXT
  ◇  Patron Seal III unlocks at $3,000 routed   $487 away
     based on your current routing pace.

FAR
  ◇  Open Era opens after seat №10,000          9,672 away
     visible-as-sealed · not yours to claim,
     but yours to witness.

IDENTITY
  ◇  SeatRecord721 — your seat as an NFT        pending contract
     when minted, this page becomes claimable
     as a single token.
```

Three tenses. Three distances. Each one anchored to a verifiable on-chain threshold, never a clock.

The FAR row is non-negotiable. Infinite Narrative gate: FAR must always be visible-as-sealed, never absent.

SeatRecord721 lives here, as **the identity horizon** — the future shape of the seat — not as an artifact and not as a separate section. One row. Quiet.

---

## 5. User journey

Connected member opens `/my-syndicate`:

1. **0.0s — recognition.** Hero. They see their own member number set larger than any other type on the site. Emotional weight: *permanence*.
2. **0.5s — context.** Eye drops to the chapter rail. They see where they sit in the protocol's arc. Emotional weight: *belonging*.
3. **2.0s — scroll begins.** Memory timeline. They see what changed since last visit (events at top), then their own history, then their origin event pinned at the bottom. Emotional weight: *continuity*.
4. **6.0s — artifacts.** Visual carousel. The objects they hold are in color. The ones they could earn are monochrome. The ones they cannot are ghosted but visible. Emotional weight: *collection*.
5. **10.0s — horizon.** Three sealings ahead. One soon, one next, one far. SeatRecord721 sits quietly as the identity horizon. Emotional weight: *anticipation*.
6. **Leaves.** No CTA pushed them out. The page ended where the story ends — with what is coming.

There are no tabs. No "expand all." No nav rail. The page **is** the journey. Scroll is the only verb.

---

## 6. What deserves hero placement

Exactly one thing: **the member number, set as the largest type on the entire site, with the chapter eyebrow above and the sealing facts below.**

That is the hero. Nothing competes. Not a CTA, not a metric, not a wallet address, not a balance, not a rank.

---

## 7. What should be hidden

Hidden = present in code/state but not surfaced on this page. Available elsewhere via deliberate navigation.

- Wallet address (already implied by "you are connected"; revealed only inside event rows via tx links).
- SYN balance as a number with a dollar value. (Lives on `/transparency` and inside the memory summary line, never as a hero metric.)
- USDC routed total as a card. (Same — appears once, as muted evidence.)
- Rank / reputation badge. (Lives on `/ranks` and on the public member page. Not on the member's own private cockpit — vanity is for others to see.)
- All status pills (LIVE / PENDING / SIMULATED) on individual modules. Status is implied by visual state, not labeled.
- Detail accordions ("expand ↓ / collapse ↑"). The five-section spine is the disclosure. If something needs an accordion to fit, it does not belong on this route.

---

## 8. What should be removed entirely from this route

These exist in the product, but they do not belong on `/my-syndicate`. They are removed from the cockpit, not from the protocol.

- **Referral panel.** Referral is an outward act; the cockpit is an inward one. Lives on `/referral`. A single inline link from the horizon section, at most.
- **Governance preview, marketplace preview, treasury preview, vault policy.** None of these are *the member's seat*. They are the protocol's organs. Lives on their own routes.
- **"What changed for you" as a separate module.** The memory timeline already answers this — top of timeline = what changed.
- **"Your next action" as a separate module.** The horizon section is the next action, expressed as anticipation, not as a button.
- **Educational copy.** "What is a chapter? What is a seat? How does routing work?" The cockpit is for members who already know. Newcomers belong on `/`, `/join`, `/docs`.
- **Dashboard nav (Seat / Chronicle / Artifacts / Future tabs).** Replaced by scroll.
- **Long-view collapsible "details" repeat of every section.** Removed. The spine is the page.
- **Skeletons, fallbacks, empty-state copy for disconnected wallets.** This route is **for connected members only**. Unconnected visitors are routed to a separate `/seat` landing whose only job is "connect to see your seat." That keeps the cockpit free of empty states forever.

---

## 9. What should feel like *identity*

The **hero** — member number, chapter eyebrow, sealing line.
Treatment: serif at maximum size, gold accents, generous space, never reflowed, never animated, never decorated.
Feels like: **a name engraved in stone**.

---

## 10. What should feel like *memory*

The **timeline** — vertical, monospaced timestamps, block-anchored events, origin pinned at the bottom.
Treatment: quiet typography, monospace for chain facts, hairline dividers between time buckets, no cards.
Feels like: **a logbook**, or the credits sequence at the end of an episode.

---

## 11. What should feel like *progression*

The **chapter rail** + the **artifacts row**.
Treatment: rail fills in real time as seats seal; artifacts shift from ghosted → monochrome → color as the member earns them.
Feels like: **a season progress bar in a prestige TV series**, where each episode you watch lights up an arc you didn't know existed.

---

## 12. What should feel like *anticipation*

The **horizon** section — three sealings ahead, anchored to real on-chain thresholds.
Treatment: small type, declarative sentences, no buttons, no countdowns, FAR row always visible-as-sealed.
Feels like: **the "next episode" card at the end of a streaming episode** — not a CTA, a promise.

---

## 13. Why this is superior to the current architecture

The current `/my-syndicate` is a **collection of solved components stacked vertically**. It tries to answer every member question on one screen and ends up answering none of them with conviction. It optimizes inside each card and never asks whether the card should exist.

The blank-page design changes the unit of work from *card* to *story*.

| Dimension | Current cockpit | Blank-page cockpit |
|---|---|---|
| Subject | "Your dashboard" | "Your seat inside the story" |
| Above the fold | Metrics + actions + identity competing | One name. One chapter. One sealing line. |
| Spine | Tabs + sections + details + accordions | Five vertical sections, scroll-only |
| Memory | Cards (purchases, archive preview, activity feed, what-changed) | One timeline, three event classes, origin pinned |
| Artifacts | Two grids (categories + named) with pills, prices, status | One visual carousel of objects, state encoded in the image |
| Future | "Future Seat Record" hidden in accordion + "Coming Next" | Horizon section: SOON · NEXT · FAR · IDENTITY |
| Identity | Distributed across ribbon, member card, panels | Concentrated into a single hero typographic moment |
| Hierarchy intelligence | Component-level | Page-level (editorial) |
| Decision lens — Founder | "Did we ship the module?" | "Does the member feel their seat?" |
| Decision lens — Behavioral | Many small dopamine hits, no narrative | One emotional arc per visit |
| Decision lens — UX | Density without direction | Direction without density |
| Member sentence after visit | "I checked my stats." | "I am №0042. I was sealed in Chapter I. Something is coming at №333." |

### What this design predicts will happen to the existing cockpit

(Matching the user's prediction, with the design rationale.)

- **30–40% of the current page disappears.** Referral, governance preview, treasury preview, vault policy, educational copy, dashboard nav, status pills, accordions, empty-state copy.
- **Several sections merge.** Purchases + archive preview + activity feed + "what changed for you" → **one timeline**.
- **Identity becomes much larger.** Member number is the largest type on the entire site, not a small label on a card.
- **Artifacts become much more visual.** No data tables. Visual plates with three states (held / eligible / ghosted) encoded in the image, not pills.
- **Future modules become much smaller.** Three lines in the horizon section, not a panel.
- **Memory becomes a timeline.** Vertical, block-anchored, with the origin event pinned as the keel.
- **Referral becomes secondary.** Removed from the cockpit. Lives on `/referral`. At most one inline reference inside horizon.
- **Seat becomes the center.** The hero, the spine, the anchor of memory, the subject of anticipation.

### Why this is closer to the original vision

The original framing was **TV series, chapters, milestones, anticipation, identity, collectible memories** — "SYN is the seat, artifacts are the memory."

The current cockpit reads like a SaaS dashboard with story labels. The blank-page cockpit reads like a **member profile inside a living story**:

- Hero = the character's name card.
- Chapter rail = the season arc.
- Timeline = the episode log.
- Artifacts = the collectibles on the shelf.
- Horizon = the "next episode" promise.

That is the thing the protocol was always trying to be. The current page is a draft of it. This is the script.

---

## 14. Gate compliance (for the implementation pass that will follow this doctrine)

This design is doctrine-only. When implementation begins (a separate pass), it must pass:

- **Infinite Narrative gate** — 4 arc layers present (PAST sealed chapters · PRESENT current chapter & timeline top · NEXT horizon SOON/NEXT · FAR horizon FAR row visible-as-sealed); 3 tenses (past perfect "you were sealed" · present continuous "Chapter I is filling" · future conditional "when №333 seals, your status becomes permanent"); eternal threads: Membership, Chapter, Identity, Verification (4 of 5); on-chain cliffhanger = "Chapter I closes at №333"; "what changed since last visit" = top of timeline.
- **Core Asset gate** — 5 seat facts surfaced (member# ✓, chapter ✓, founders flag implied by chapter, block-height anchor ✓, co-witness set ✓ in the sealing line and timeline); positional dominance (member number as hero), co-witness accretion (◇ events in timeline), cohort belonging (chapter rail) — all three reinforced; anticipation anchored to real sealings; status is positional, never wealth.
- **Mythology & Cohort gate** — identity axes: Ordinal (member №) · Era (chapter) · Origin (block height) · Witness (co-witness count); naming layer: cohorts of origin (Chapter I, Chapter II) sealed at chapter close, never pre-named; seat is the first-class noun on the page.
- **Founder Multi-Hat Framework** — Five-Value Test: Engineering (less code, fewer states), User (one clear story), Emotional (identity + anticipation), Story (TV-series arc made literal), Retention (horizon row pulls return visits). Emotional questions answered: care · return · share-worthy · identity · anticipation · progress (6 of 7).
- **Decision Lenses** — to be re-scored against this design before implementation, in a separate audit document.

---

## 15. Out of scope for this document

- No React. No components. No file paths. No tokens. No animations beyond "this should feel still."
- No claims about the current implementation other than "treat as if it does not exist."
- No timeline. No estimate. No phasing. Implementation is a separate pass, gated by the audits in § 14.

---

**End of doctrine.** The cockpit is a member profile inside a living story. The seat is the center. Memory is a timeline. Artifacts are a shelf. Anticipation is a horizon. Everything else lives elsewhere.
