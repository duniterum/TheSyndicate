# THE SYNDICATE — NORTH STAR SYSTEM

> **CONSTITUTIONAL DOCUMENT (2 of 3).** Paired with `docs/VISION.md`
> and `docs/INFORMATION_HIERARCHY.md`. Authoritative.
> See `docs/CONSTITUTION_SUMMARY.md` for the index.

This document defines the metrics and behavioral loops the protocol
optimizes for. If a feature does not strengthen at least one loop
defined here, it is rejected or deferred.

It supersedes any metric or loop definition that appears in audit or
plan documents (`STORY_ENGINE_AUDIT.md`,
`INFORMATION_HIERARCHY_MASTER_PLAN.md`,
`FINAL_INFORMATION_ARCHITECTURE_DECISION.md`,
`PRE_LAUNCH_TRUTH_CLEANUP_REPORT.md`). Those remain reference material
only.

---

## NORTH STAR METRIC

**Verified members recorded on-chain.**

One number, monotonically increasing, fully verifiable on Avalanche via
the Membership Sale contract. Every other surface, decision and module
is judged by whether it strengthens or weakens this number — honestly.

Not chosen: token price, market cap, holder count, treasury size,
Twitter followers, Discord size, page views. Each of those is either
manipulable, derivative, or off-mission.

---

## SECONDARY METRICS

Used to interpret and protect the north star — never to replace it.

1. **Cumulative USDC routed** (live, on-chain). Proof the engine works.
2. **Protocol-owned liquidity (POL)** in the LP. Proof of permanence.
3. **24h / 7d member delta**. Proof the protocol is alive, not stalled.
4. **Returning-visitor share with a connected wallet**. Proof of
   identity adoption.
5. **Share-intent clicks on member / milestone OG cards**. Proof that
   transparency travels.

Every metric must be live or labeled `PENDING`. No estimates.

---

## THE LOOPS

Six interlocking loops. A healthy feature touches at least two. A
feature that touches none is rejected.

### 1. Story Loop

The protocol must read like a story-in-progress, not a dashboard.

- **Past**: chapters, founders, milestone history, protocol timeline.
- **Present**: live heartbeat (members, USDC, vault, last join).
- **Future**: "Next milestone — N members remaining", "Coming next".

Rule: every homepage session must surface past, present, and future
within the first two screens.

### 2. Identity Loop

A visitor must be able to become someone, not just read about something.

- First-time visitor: "You could be Member #N" — concrete, current.
- Connected wallet: founder number, rank, chapter, profile route.
- Returning visitor: "Since your last visit: +X members, +Y USDC."

Rule: identity language is always second-person. The protocol speaks to
the visitor, never about them.

### 3. Memory Loop

The protocol remembers what happened and remembers the visitor.

- Protocol memory: founders hall, chapter archives, milestone history,
  timeline, wallet profiles.
- Visitor memory: `visitor-memory.ts` — last visit timestamp, last seen
  member count, last seen USDC, returning-visitor flag.

Rule: nothing the protocol records is ever silently rewritten.
Backfills are versioned and disclosed.

### 4. Anticipation Loop

What makes someone come back tomorrow.

A visitor must leave with at least one concrete, near-term thing to
return for:

- "Next member #N — Y remaining to next chapter."
- "Milestone X unlocks at Z USDC routed."
- "Chapter N closes when member #M joins."

Rule: anticipation lines must be derived from live data, never marketed.
No fake countdowns, no fake scarcity, no manufactured urgency.

### 5. Conversion Loop

Joining must be the easiest action on the site.

- Hero `Join` CTA in the first viewport.
- Persistent header `Join` button.
- Mobile sticky `Join` bar (the single approved sticky element).
- Every chapter / milestone / member surface ends with a single Join CTA.

Rule: only one primary CTA per surface. `Join` outranks every other
action. Secondary actions ("Verify", "Read docs", "View on-chain") may
appear once, never repeated.

### 6. Growth Loop

Transparency becomes distribution.

- Shareable OG cards: milestone, wallet, chapter.
- Twitter intents on every share surface.
- Truthful share artifacts only — real numbers, real verification status.

Rule: a share artifact that leaves the site must remain accurate without
the site to back it up.

---

## WHAT MAKES SOMEONE COME BACK TOMORROW

The protocol passes this test when a first-time visitor can name, in
their own words, at least one of:

- a number that will be different tomorrow (member count, USDC routed),
- a milestone they want to watch get hit,
- a chapter that is filling and will close,
- a member position (#N) they want to claim,
- a wallet / identity they want to inspect again.

If none of those is visible on the homepage within the first two screens,
the homepage has failed the north-star system regardless of how
beautiful it looks.

---

## DECISION TEST (supersedes prior six-question test for new features)

For every proposed feature, answer:

1. Does it strengthen the north star (verified members) directly or
   credibly indirectly?
2. Which loops does it touch? (must be ≥ 2)
3. Does it pass the Stop Building Test in `MVP_ECOSYSTEM_ROADMAP.md`
   (understanding, trust, participation, momentum, would-still-build-at-25)?
4. Does it pass the Product Decision Framework
   (`docs/PRODUCT_DECISION_FRAMEWORK.md`)?
5. Does it conflict with `VISION.md` or `INFORMATION_HIERARCHY.md`?

A "no" on 1, a "≤ 1" on 2, or a conflict on 5 = reject. Otherwise
defer or build per the framework matrix.

---

## NFT Archive — loop reinforcement

The NFT Archive (planned) reinforces the six loops as follows:

- **Identity** — Seat Record (future) is the permanent identity certificate.
- **Memory** — Chapter Artifacts, Genesis Sealed, Legacy Era I are named
  sealed events. Co-witness accretion is on-chain.
- **Anticipation** — the next chapter's artifact is the visible-but-sealed
  far layer; readers know it exists, not what it is.
- **Return behavior** — "what changed since last visit" surfaces new
  sealed artifacts since the visitor's last session.
- **Story** — artifacts crystallize the protocol's past perfect tense.
- **Growth** — share intents over wallet+milestone OG cards reference
  owned artifacts as social proof of being early.

See `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md` for the visual contract and
`docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md` for the catalog.
