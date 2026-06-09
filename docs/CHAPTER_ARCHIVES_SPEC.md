> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# Chapter Archives — Spec

**Status:** Spec only. No implementation yet.
**Pillars served:** Memory · Identity · Transparency · Shareability.
**Vision anchor:** Chapters are **protocol memory**, not scarcity
mechanics.

## Purpose

Chapter Archives turn the existing `HolderChapter` derivation into a
browsable record of formation. Each chapter is a window of founder
numbers (Genesis, First 100, First 500, First 1000, Open) with a clear
beginning, end, and — once full — a permanent seal.

Chapters exist to make protocol **memory** visible: a visitor can read
when the first 10 members joined, when First 100 sealed, who is in
First 500 right now. They do NOT exist to:

- Sell urgency.
- Run countdowns.
- Create FOMO.
- Imply that later chapters are worth less.
- Promise chapter-specific rewards beyond what's already in
  `HolderEligibility`.

## Chapters (already derived in code)

From `chapterForFounderNumber()`:

| Chapter        | Founder numbers | State logic |
| -------------- | --------------- | ----------- |
| Genesis        | #1–#10          | Sealed when 10 members joined |
| First 100      | #11–#100        | Sealed when 100 members joined |
| First 500      | #101–#500       | Sealed when 500 members joined |
| First 1000     | #501–#1000      | Sealed when 1000 members joined |
| Open           | #1001+          | Never seals — the ongoing chapter |

Sealed = the last member-number in the range has joined. Seal block,
seal date, and seal tx are all derivable from the indexed events.

## What each chapter page shows

- **Header:** chapter name, founder-number range, status pill
  (`forming` / `sealed`), seal date if sealed.
- **Progress bar:** for forming chapters, members joined / target.
  Honest progress, never animated faster than real.
- **Member grid:** the actual members in this chapter, archive-ordered,
  same tile shape as the Member Wall.
- **Window stats** (no wealth comparison): chapter start block, current
  / final block, days-to-seal once sealed.
- **Verify strip:** "Verify this chapter on Avascan" links to the
  block-range filter for TokensPurchased on the Sale contract.

## What chapter pages MUST NOT have

- Countdown timer to chapter close.
- "Last N slots!" urgency banners.
- Inflated progress bars or animations that exceed real progress.
- Wealth ranking of members within a chapter.
- Promises of chapter-specific airdrops, rewards, or future benefits
  that don't already exist in `HolderEligibility`.
- Differentiation language that implies later chapters are inferior.
  (Genesis members joined earlier — that's recognition, not
  superiority.)

## What creates memory

- A permanently dated seal. Once Genesis seals at block X on date Y,
  that fact never changes and is verifiable forever.
- A complete list of members in each chapter — not a sample, not a
  highlight, the whole chapter.
- Cross-links between adjacent chapters ("← First 100" / "First 1000 →")
  so a visitor can read formation as a continuous story.

## What creates trust

- Every chapter page is a pure read of `useHolderIndex` filtered by
  `chapterForFounderNumber()`. No editorial selection.
- Seal events are derived from indexed TokensPurchased data, not
  written by us.
- Each page carries the live `asOfBlock` and a "Verify on Avascan"
  link.
- If indexing is partial, the page shows PARTIAL and the count is what
  has actually been indexed.

## What creates curiosity

- The first time a visitor sees "Genesis · sealed at block 12,345,678
  on 2026-XX-XX (3 days, 4 hours after first member)" — that is a
  protocol artifact they can't get anywhere else.
- Cross-references: every wallet page shows which chapter the member
  belongs to and links here.
- The "Open" chapter shows live progress and the next milestone
  founder number — the visitor can see exactly where they would land.

## Connection points

- **Member Wall** — chapter tabs on the Wall link to the corresponding
  archive page. Wall is the flat index; archives are the chapter view.
- **/wallet/$address** — wallet pages already show chapter badge; that
  badge links here.
- **Founders Hall** — Genesis and First 100 archive pages embed a
  Founders Hall preview at the top.
- **Milestones** — `members-100`, `members-1000` milestone pages link
  here ("verify this milestone in the chapter archive").
- **Sharing** — each chapter page gets full OG metadata. Dynamic SVG
  cards are deferred (Wave 4) — root PNG fallback is acceptable for
  MVP since chapter content changes are slow.

## Routes

- `GET /chapters` — overview of all five chapters with status pills.
- `GET /chapters/genesis`
- `GET /chapters/first-100`
- `GET /chapters/first-500`
- `GET /chapters/first-1000`
- `GET /chapters/open`

Each route is server-rendered, indexable, and has its own `head()`
metadata. All routes added to `/api/og/health`.

## Data source

- `useHolderIndex`. No new contract reads.
- Seal block / date derivation: when `chapter.members === chapter.target`,
  read `lastPurchaseBlock` of the last member in the chapter — that is
  the seal block.

## Acceptance criteria

A visitor lands on `/chapters/genesis` and within 5 seconds understands:
1. What "Genesis" means as a protocol artifact.
2. Whether it is sealed or still forming.
3. Who the members are, with verifiable links.
4. That this chapter is a permanent record, not a marketing window.

A visitor must NOT come away thinking:
- They have to hurry or they'll "miss out" on a chapter.
- Earlier chapters got rewards that later chapters won't.
- Chapter pages are an investor-pitch device.
