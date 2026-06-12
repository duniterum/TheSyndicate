---
name: Controlled Public Chronicle Integration
description: How the institutional-memory engine surfaces on the public /chronicle without duplicating or publishing.
---

# Controlled Public Chronicle Integration

The first public bridge from the institutional-memory pipeline to the public
`/chronicle`. Implemented as a pure presentation/integration leaf
(`src/lib/chronicle-public-integration.ts`) that attaches an optional restrained
"Institutional record" backing line to each LOCKED Chronicle entry.

## Backing data source ruling (the load-bearing decision)
Backing is sourced from `deriveGenesisRegisterEntries()` — the **active/verified
GENESIS SEED** register entries — **NOT** from the draft `InstitutionalChronicleEntry`
pipeline terminal.

**Why:** the locked Chronicle entries overlap the genesis SEED facts
(`entryStatus: "active"`, verification `locked`/`verified`), not the draft
chronicle entries. `resolvePublication` never emits `published`; backing public
canon with drafts that are *awaiting a human/governance publish act* would invert
the publication seam (drafts would de-facto publish via /chronicle). The seed is
also pure config → SSR-safe, zero runtime chain reads. Running the full
event→…→admission pipeline on a canonical public SSR page is wrong (needs client
RPC scans on a bounded window).

**How to apply:** any future "surface derived memory on a public canon page" work
must back from the layer whose status is genuinely final/active, never from a
draft that a human still has to ratify.

## Dedup / no-second-feed rule
- Overlaps are declared by an **explicit curated map**
  `CHRONICLE_INSTITUTIONAL_BACKING` (lockedChronicleId → genesis FACT id[]) — human
  curation is the "controlled" in the name; never a title/contract heuristic.
- An overlapping fact appears ONLY as a backing line on the locked entry, never as
  a second entry.
- Non-overlapping derived/register facts are **deliberately NOT re-listed** on
  `/chronicle` — they live on `/institutional-register`. Re-listing them would make
  `/chronicle` a second register feed (doctrine §7) and de-facto publish drafts.

## Invariants (pinned by chronicle-public-integration.test.ts; SEPARATE from chronicle-doctrine.test.ts)
- ACTIVE-only gate: `entryStatus === "active"` — held coverage-limited ordinals
  (earliest-member/artifact/milestone) are unreachable.
- Pure & deterministic: returns exactly `{entry, backing?}[]` (NO standalone derived
  list), one item per locked entry, input order, mutates neither input.
- Multi-fact value list backs from the **first ACTIVE fact only** (intended).
- Map keys ⊆ locked ids; values ⊆ genesis fact ids; every mapped fact must resolve
  to an active genesis register entry (drift guard — `GENESIS_ENTRY_ID_PREFIX` is a
  duplicated literal, acceptable only because this test pins it).
- Leaving `chronicle-doctrine.test.ts` UNTOUCHED and green is itself the evidence the
  locked entries were not altered — do not fold these tests together.
- Tx-locked facts get a `txExplorerUrl` "Verified source transaction" link;
  contract-verified facts (no `sourceTxHash`) correctly get none. Lineage link lands
  on `/institutional-register` (route has no per-entry anchors yet).
- Knowledge-map: institutional-register layer `publicSurfaces += "/chronicle"`; code
  registry wins, no canon-doc edit needed.

## Route-discipline landmines (chronicle-doctrine.test.ts reads chronicle.tsx source)
Keep: `data-chronicle-order="oldest-first"`, `CHRONICLE_ENTRIES` reference,
`.sort(a.order - b.order)`, footer `to="/activity"` + `to="/my-syndicate"`. Never add
feed/social tokens (ProtocolEventsFeed, LiveActivityFeed, Heart, Reaction, Comment,
Trending, NotificationBell) or pagination (`<Pagination`, InfiniteScroll, loadMore,
nextPage) — even the backing copy must avoid those substrings.
