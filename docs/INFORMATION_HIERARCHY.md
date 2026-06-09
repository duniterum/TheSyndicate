# THE SYNDICATE — INFORMATION HIERARCHY

> **CONSTITUTIONAL DOCUMENT (3 of 3).** Paired with `docs/VISION.md`
> and `docs/NORTH_STAR_SYSTEM.md`. Authoritative.
> See `docs/CONSTITUTION_SUMMARY.md` for the index.

This document defines the canonical order of information on the
homepage, and the responsibilities of each zone across every public
route. It supersedes any ordering proposal in
`INFORMATION_HIERARCHY_MASTER_PLAN.md`,
`FINAL_INFORMATION_ARCHITECTURE_DECISION.md`, or
`STORY_ENGINE_AUDIT.md`. Those remain reference material; this is the
ratified rule.

---

## THE 10-SECOND CONTRACT

A first-time visitor must, within ten seconds, be able to answer:

1. **What is this?**          → Hero
2. **Is it alive and real?**  → Heartbeat
3. **Why now?**               → Story (past + anticipation)
4. **Who am I in it?**        → Identity
5. **What do I do?**          → Conversion
6. **Can I trust it?**        → Proof

If any of those cannot be answered without scrolling past the third
zone, the hierarchy has been violated.

---

## THE SIX ZONES

The homepage is organized into exactly six zones, in this order. No
new zone may be introduced without amending this document.

### Zone 1 — HERO  (WHAT IS THIS?)

**Responsibility:** state what The Syndicate is in one sentence and
offer exactly two actions.

- One sentence positioning line. Canonical:
  *"A transparent on-chain protocol where every member is permanently
  recorded and every dollar is publicly routed."*
- Primary CTA: **Join**.
- Secondary CTA: **Verify on-chain** (or equivalent single secondary).
- One status pill (LIVE / chain / contract count).

Banned: hero carousels, animated headlines, multi-paragraph mission
statements, more than two CTAs, hero-level video.

### Zone 2 — HEARTBEAT  (IS IT ALIVE?)

**Responsibility:** prove the protocol is live and moving, right now.

- A single unified strip with four cells: **Members**, **USDC routed**,
  **Vault**, **Last join**. Each cell carries a 24h delta and a
  LIVE/PARTIAL/PENDING pill.
- One anticipation line: *"Next member #N · Y remaining to Chapter Z"*.
- One 30-day sparkline (members or USDC). Single chart, not a dashboard.

Banned: duplicate live strips, scrolling tickers, casino-style toasts,
manufactured urgency, fake countdowns.

### Zone 3 — STORY  (WHY NOW?)

**Responsibility:** make the protocol feel like a story-in-progress —
past, present, future visible together.

- **The Story So Far** — milestone tracker + early chapters, condensed.
- **Coming Next** — next milestone, next chapter close, next member #N.

This zone must contain at least one past element and one future
element. Either alone is a failure.

### Zone 4 — IDENTITY  (WHO AM I IN IT?)

**Responsibility:** convert abstract membership into personal identity.

- First-time visitor variant: *"You could be Member #N."*
- Connected wallet variant: founder number, rank, chapter, profile link.
- Returning visitor variant: *"Since your last visit: +X / +Y USDC."*

One component, three states. Never three competing components.

### Zone 5 — CONVERSION  (WHAT DO I DO?)

**Responsibility:** make joining unmistakable and frictionless.

- A single, consolidated **Why join** block (one component — not five
  overlapping Why-* sections).
- **How to join** in three steps maximum.
- A primary **Join** CTA at the end of the zone.

Mobile: a sticky Join bar is mounted globally (the only approved
sticky element). Desktop is unaffected.

### Zone 6 — PROOF  (CAN I TRUST IT?)

**Responsibility:** let the visitor verify everything.

- Transparency snapshot (treasury, LP, routing).
- Contract dossiers / mini-explorer links.
- Link out to `/transparency`, `/whitepaper`, `/registry` for deep dives.

Long-form proof material lives on dedicated routes, not on the
homepage. The homepage shows the *summary*; the routes show the
*receipts*.

---

## ZONE RESPONSIBILITY MATRIX

| Zone | Owns | Forbidden in this zone |
|---|---|---|
| Hero | Positioning, primary CTA | Metrics, charts, FAQ |
| Heartbeat | Live numbers, deltas, anticipation | Explanations, narrative copy |
| Story | Past + future, milestones, chapters | Mechanism explainers, FAQ |
| Identity | Visitor-as-protagonist | Aggregate stats, ranks-as-wealth |
| Conversion | Why + How + Join | Proof material, deep mechanics |
| Proof | Verifiable summary + links out | Marketing copy, hype |

---

## CROSS-ROUTE RULES

- Every primary route must have a **unique** `head()` (title, description,
  og:title, og:description). Never reuse the homepage's metadata.
- Every primary route must end with a single **Join** CTA.
- Hash anchors (`#section`) are for in-page scroll only. They are never
  the primary navigation between sections.
- Dead-end pages are forbidden. Every leaf must offer one Join CTA and
  one related next step.
- Orphan routes (no inbound link from header, footer, or a related
  surface) are forbidden. Either link them or delete them.

---

## NAVIGATION

- Header: **Join** is always visible as a primary button — never buried
  in a menu.
- Mobile: a global sticky **Join** bar. This is the only sticky element.
- Footer: organized by audience (Members / Builders / Verify), not by
  internal taxonomy.

---

## AMENDMENT RULE

This hierarchy is amended only by editing this document and
`CONSTITUTION_SUMMARY.md` in the same change. Audit documents and
plan documents cannot override it. If a plan document and this
document disagree, this document wins and the plan document is updated
to match.

---

## NFT Archive — hierarchy placement

The NFT Archive does **not** belong before Join. It is not a separate
speculative product, and it does not appear in the homepage Hero,
Heartbeat, or Conversion zones.

Correct placement:

- **Identity zone (homepage):** lightweight teaser (e.g. `HomeArchiveTeaser`).
- **Post-purchase (`/join`):** Seat Record panel (future, PENDING ELIGIBILITY).
- **Dedicated `/archive` route:** full Archive surface.
- **Member dashboard (`/my-syndicate`):** per-wallet Archive inventory (future).
- **Docs / FAQ / Whitepaper / Registry / Transparency:** cross-links only.

Companion: `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md`,
`docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md`.
