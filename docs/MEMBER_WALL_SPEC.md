> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# Member Wall — Spec

**Status:** Spec only. No implementation yet.
**Pillars served:** Identity · Memory · Momentum · Shareability · Community.
**Vision anchor:** "People are joining." Visitors must feel formation
happening — not browse a leaderboard.

## Purpose

The Member Wall is the first surface where The Syndicate stops feeling
like a token site and starts feeling like a society being formed in
public. It is **archive-ordered, not wealth-ordered.** A visitor scrolls
a wall of real, verifiable members and feels: people are showing up,
they are real, and joining is open.

It is NOT:
- A wealth leaderboard.
- A "top buyers" list.
- A ranking by contribution.
- A social feed.
- A profile directory with bios, avatars, or links.

## Data shown (per member tile)

Each tile is a pure derivation of on-chain state — nothing self-reported.

- **Founder number** (e.g. `#127`) — primary identity.
- **Short address** (`0x1234…ab56`) — links to `/wallet/$address`.
- **Chapter badge** — Genesis / First 100 / First 500 / First 1000 / Open.
- **Rank name only** (e.g. "Builder") — no USDC, no SYN amounts.
- **Joined-at** — relative time of `firstPurchaseBlock` (e.g. "3d ago").
- **LIVE status pill** on the page header (data source: TokensPurchased
  scan, asOfBlock).

## Data hidden (deliberately)

- USDC contributed.
- SYN balance.
- Cumulative routed totals.
- Largest single purchase.
- Score multiplier number.
- ENS / handles / avatars (Wave 4+ if ever).
- Any sort affordance that ranks by wealth.

Per-wallet detail (`/wallet/$address`) does show financial footprint —
that page is the member's own verifiable trail. The Wall is the
**collective view** and must stay non-comparative on wealth.

## Sort and view modes

Default and only sort: **founder number ascending** (archive order).
Newest members appear at the end, not the top — this reinforces "the
archive is being written" rather than "look at the latest whale".

Two secondary views (toggle, not sort):
- **Latest joins** — last 50 members by `firstPurchaseBlock` DESC.
  Specifically scoped, not a global re-sort. Pure recency.
- **By chapter** — five tabs (Genesis, First 100, First 500, First 1000,
  Open). Each tab is still archive-ordered within.

No "by rank", "by contribution", "by activity" toggles. Ever.

## What creates social proof

- **Volume of real tiles** — a wall full of distinct, verifiable
  addresses says more than any copy.
- **Chapter pills** that visibly fill (Genesis 10/10 sealed, First 100
  87/100, etc.) — formation in progress, not a marketing countdown.
- **"Joined 14m ago" timestamps** — recency feels alive.
- **Wallet links that actually work** — every tile is verifiable.

## What creates trust

- Every tile links to `/wallet/$address` which links to the
  TokensPurchased tx on Avascan. Click-depth-2 to on-chain truth.
- Page-level LIVE pill with `asOfBlock` and "Verify on Avascan" link.
- No estimation. If TokensPurchased indexing is mid-scan, the page
  shows a PARTIAL pill and the count is what's been indexed so far,
  not a projection.
- Empty / pre-launch state shows PENDING — never fabricated rows.

## What creates curiosity

- Founder numbers are scarce and ordered — `#7` matters because
  there will only ever be one `#7`.
- Chapter seals — once Genesis (#1–#10) is full it is permanently
  sealed; the Wall shows that seal date.
- "Where am I?" CTA in the page header — if the visitor's connected
  wallet is a member, jump-scroll to their tile and highlight it.
  If not, the same slot becomes "Join to claim founder #N" (N = next
  member number) — a soft, truthful join nudge.

## What it MUST NOT become

- A wealth leaderboard.
- A "top contributors" board sortable by USDC.
- A whale-watching surface.
- A handle / bio / avatar directory.
- A real-time social feed.
- A gamified streak / engagement tracker.
- A referral attribution surface.

If any future contributor proposes adding sort-by-contribution, link the
proposal here and reject. The Wall is the one surface in the protocol
that is deliberately non-comparative on wealth — that is the entire
point.

## Connection points

- **/wallet/$address** — every tile links here. The Wall is the index,
  the wallet page is the detail.
- **Chapters** — chapter tabs and chapter-seal indicators link to
  `/chapters/$id` (Chapter Archives, separate spec). The Wall is a
  flat view; chapter archives are the curated view.
- **Founder numbers** — every tile carries the founder number, which is
  the protocol's primary identity primitive. Founder Hall (separate
  spec) is the deep-history view of the earliest numbers.
- **Sharing** — every tile is a deep-link to a `/wallet/$address` that
  already has dynamic SVG + static PNG OG cards (Wave 3B.1). Sharing
  the Wall itself uses the standard root OG (PNG).

## Routes

- `GET /members` — the Wall page. Default founder-asc, paginated 100 per
  page, server-rendered for SEO + share previews.
- Per-tab routes: `/members/chapter/genesis`, `/members/chapter/first-100`,
  etc. — each indexable, each gets its own `head()` metadata.
- `/members/latest` — last-50 view.

All routes carry full OG/twitter metadata (root PNG fallback) and are
included in the next `/api/og/health` sweep.

## Performance / data shape

- Reuses `useHolderIndex` — no new contract calls. The Wall is a pure
  consumer of the existing on-chain scan.
- Virtualized scroll for >500 tiles (lazy import only when needed).
- No additional RPC traffic beyond what `useHolderIndex` already does.
- Server-rendered first page (top 100 by founder number) so crawlers
  and share previews always see real content, not a skeleton.

## Acceptance criteria

A visitor lands on `/members` and within 3 seconds can tell:
1. Real people are joining (visible tiles).
2. The protocol has a structure (chapter seals).
3. They can verify any member (click → wallet → tx).
4. They can join (footer CTA → Membership Sale).

If the Wall shows zero real members, the page shows a PENDING state
explaining that the index will populate as the first TokensPurchased
events confirm — and links to the live Sale. No fake rows. Ever.
