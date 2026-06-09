> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# Founders Hall — Spec

**Status:** Spec only. No implementation yet.
**Pillars served:** Identity · Memory · Shareability.
**Vision anchor:** Founder numbers are **protocol history**, not
financial privilege.

## Purpose

Founders Hall is a small, curated, permanent surface that recognizes
the earliest members of The Syndicate. It exists because the protocol
needs a place where its **origin story is visible** — not because
founders need rewards, exclusives, or promises.

It is NOT:
- A perk / privilege page.
- A "VIP members" list with extra access.
- A pre-sale brag wall.
- A scarcity marketing device.
- A second wallet detail page.

It IS:
- A historical record of the first 100 founder numbers.
- A statement that the archive is real, dated, and verifiable.
- A protocol memory artifact.

## Scope

Founders Hall is intentionally narrow:

- **Featured tier:** Genesis (#1–#10). One row per founder, with extra
  spatial weight (larger tiles, more whitespace).
- **First 100 grid:** founder numbers #11–#100 as a clean grid.
- **First-purchase moment** for each: relative date + block number +
  tx link to Avascan.
- **Chapter seal banners:** when Genesis or First 100 fills, a sealed-on
  date appears with the block range.

That's it. No additional cohorts ("First 500", "First 1000") here —
those live on the Member Wall and in Chapter Archives.

## What is shown per founder

- Founder number.
- Short address (links to `/wallet/$address`).
- First-purchase date (relative + absolute on hover).
- First-purchase tx → Avascan.
- Rank name (no amounts).
- Chapter pill (Genesis / First 100).

## What is hidden

- USDC contributed.
- SYN balance.
- Any wealth-derived ordering.
- Any privilege language ("exclusive", "VIP", "elite").

## What it MUST NOT promise

Founder numbers are **historical**, not contractual. Founders Hall must
not state or imply:

- Future rewards.
- Future yield or revenue share.
- Future governance weight beyond what's documented elsewhere.
- Future NFT airdrops, allocations, or distributions.
- Any benefit not already in `RANKS_V2` and `HolderEligibility`.

Copy is observational and historical: *"#1 — first member, joined on
2026-XX-XX, block X, tx 0xabcd."* No marketing modifiers.

## Banned framing

- "Become a founder before it's too late."
- "Founders get the best deal."
- "Limited founder spots remaining."
- Any countdown timer.
- Any FOMO mechanic.

If a contributor proposes scarcity copy, point them here. The whole
point of Founders Hall is that the archive is permanent and verifiable
— urgency would cheapen it.

## What creates trust

- Every entry links to a real on-chain tx.
- Block numbers and dates are derived, not editorial.
- The page header carries the same LIVE / PARTIAL / PENDING pill as
  every other live surface.
- If fewer than 10 founders have actually joined, Genesis shows the
  filled rows + remaining slots as honest empty placeholders ("slot
  open — next purchase claims #N"), not fake names.

## What creates meaning

- Permanence. A sealed-chapter banner with a block range cannot be
  edited and is verifiable forever.
- Density. 100 real founders on one page tells a story; 100 fake names
  would not.
- Proximity. Every founder is one click from their full wallet history.

## Connection points

- **Member Wall** — Founders Hall is a curated view of the first 100
  rows on the Wall. Wall is breadth; Hall is depth on the earliest
  cohort. Each links to the other.
- **/wallet/$address** — every Hall entry deep-links to the member's
  wallet page.
- **Chapter Archives** — Genesis and First 100 chapter pages (separate
  spec) embed a compact Hall preview at the top.
- **Sharing** — `/founders` gets a dedicated branded PNG OG card.
  Individual founder entries share via their wallet URL.

## Routes

- `GET /founders` — the Hall page. Server-rendered, full OG metadata.
- Single page, no per-founder route (those are wallet pages).

## Data source

- `useHolderIndex` → `ordered.slice(0, 100)`. Zero new contract reads.
- Server-rendered for share previews; client hydrates with live data.

## Acceptance criteria

A visitor lands on `/founders` and within 5 seconds understands:
1. The Syndicate has named, dated, verifiable origin members.
2. Founder status is historical recognition, not a privilege package.
3. Joining now still gets them a founder number — but they will be
   `#N`, not `#1`.
4. Every founder is real and verifiable in one click.

A visitor must NOT come away thinking:
- They should rush to "get a founder spot before they sell out".
- Founders are getting paid more or earlier than later members.
- There's a closed VIP layer above them.
