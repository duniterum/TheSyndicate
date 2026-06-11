# Rank Distribution Hub — Spec

**Status:** Spec only. No implementation yet.
**Pillars served:** Transparency · Identity · Memory.
**Vision anchor:** Ranks explain **protocol structure**. They are not a
status competition.

## Purpose

The Rank Distribution Hub is a single page that shows how the member
base is distributed across the 12 ranks defined in `RANKS_V2`. It exists
to make the protocol's structure legible — a visitor can see at a glance
that most members are in the Open Entry group, that Active Members is
forming, and that Deep Supporters / High-Conviction tiers are intentionally
rare.

It is NOT:
- A status leaderboard.
- A "who is the biggest contributor" page.
- A surface that pressures members to climb ranks.
- A marketing device for "rank up your USDC".
- A wealth visualization in disguise.

It IS:
- An honest distribution view of an existing primitive.
- An explanation of what each rank means.
- A bridge from "I'm Builder" on a wallet page to "what does Builder
  mean and who else is here?"

## What is shown

### Distribution view

- **One row per rank**, in order from Citizen → Cornerstone.
- For each rank: name, group (Open Entry / Active Members / Deep
  Supporters / High-Conviction), member count, and a horizontal bar
  showing share of total members.
- Bar widths are normalized to a sensible max so the rare tiers are
  still legible (logarithmic option allowed, clearly labeled).
- Group dividers between the four groups — visual structure, not
  marketing.

### Rank meaning panel

- For each rank: the **canonical benefits** from `RANKS_V2[*].benefits`.
- No additional copy beyond what's already defined in
  `syndicate-config.ts`. Single source of truth.
- Threshold shown as USDC amount (since that's the definitional
  threshold, not a target).

### Group summary

- Four group cards (Open Entry / Active Members / Deep Supporters /
  High-Conviction) with total members in each group and a short,
  non-promotional description of what the group represents.

## What is hidden

- Individual member identities, addresses, founder numbers.
- USDC amounts per member.
- Any "top N" listing within a rank.
- Any sort affordance that surfaces "who is the highest Builder", etc.
- Score multiplier numbers prominently (they exist in the data but are
  not the headline metric — that would re-introduce wealth competition).

If a visitor wants to see who is in a rank, they go to the Member Wall
and filter — but the Wall does not sort by rank either. The Hub is
**aggregate-only**.

## What it MUST NOT become

- A leaderboard.
- A "rank progress tracker" that pressures climbing.
- A profile page directory.
- An animated growth race between ranks.
- A surface that ranks members by score, contribution, or multiplier.

If anyone proposes "show top contributors per rank", reject. The point
of this page is that ranks are **structural**, not competitive.

## What creates trust

- Counts are pure derivations of `useHolderIndex.totals.rankDistribution`
  — already wired.
- Header carries the standard LIVE / PARTIAL / PENDING pill with
  `asOfBlock`.
- "Verify on Avascan" links to the Sale contract event log.
- Benefits text comes verbatim from `RANKS_V2` — no editorial spin.

## What creates meaning

- The shape of the distribution tells a story without numbers needing
  to be sensational. A protocol where most members are Citizens and
  Scouts is a healthy formation pattern.
- Group framing (Open Entry / Active Members / Deep Supporters /
  High-Conviction) lets a visitor read the protocol's social structure
  in one glance.

## What creates curiosity

- "What does Builder mean?" — wallet pages already show the badge; this
  is the page that explains it.
- The rarity of higher tiers is visible without being sold. A visitor
  sees only N members in Keystone and understands why that matters,
  without anyone telling them to "rank up".

## Connection points

- **/wallet/$address** — rank badge on a wallet page links here,
  anchor-scrolled to that rank's row.
- **Member Wall** — Wall tiles show rank names (no amounts); clicking
  a rank name links here.
- **Membership Sale** — the Hub explains thresholds; the Sale is where
  the visitor acts. The Hub does not embed a buy widget — it stays
  informational.
- **Sharing** — `/ranks` gets a branded static PNG OG card with the
  group-level summary. Dynamic SVG card is deferred to Wave 4 if ever.

## Routes

- `GET /ranks` — the Hub page. Server-rendered, full OG metadata,
  indexable.
- No per-rank routes for v1 — the page is one scrollable view with
  anchor links per rank (`/ranks#builder`).

## Data source

- `useHolderIndex.totals.rankDistribution` (already populated).
- `RANKS_V2` from `syndicate-config.ts` for labels, groups, benefits.
- Zero new contract reads.

## Acceptance criteria

A visitor lands on `/ranks` and within 5 seconds understands:
1. The Syndicate has a structured rank system, not a flat membership.
2. The distribution is honest and verifiable.
3. Each rank means something specific (benefits panel).
4. Higher ranks are rare by design, not by gatekeeping.

A visitor must NOT come away thinking:
- They are losing if they're a Citizen.
- They need to "rank up" to belong.
- Ranks are a status game.
- The protocol pressures larger contributions.
