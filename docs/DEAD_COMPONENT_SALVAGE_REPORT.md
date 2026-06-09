# Dead Component Product Salvage Report

**Date:** 2026-06-09
**Scope:** Audit only — NO deletions, NO rewrites performed. This is product archaeology.
**Subject:** 12 exported components in `src/components/syndicate/Sections.tsx` that are not
imported by any route and not rendered internally (confirmed dead/unrendered), plus one
live-but-imprecise data block (`VERIFY_ENTITIES`).

## Protocol-fact baseline used for the audit
- **LIVE:** Archive1155 contract; The First Signal (ID 1, 0.50 USDC, wallet-limit 5, **uncapped** supply); Patron Seal (ID 3, 5.00 USDC, **10,000** supply); SYN token; Membership Sale; LP Pool; USDC Routing (70% Vault / 20% Liquidity / 10% Operations).
- **PENDING:** Seat Record (future ERC-721 `SeatRecord721`, ID 2 reserved/disabled); Vault Contract; Governance; AI Layer.
- **Chapters:** Genesis Signal (seals at Member #333) · First Thousand · The Expansion · First Ten Thousand · Open Era.
- **Status vocab:** strictly LIVE / PARTIAL / PENDING. "Mock", "Coming Soon", "Planned", hardcoded supply/member/$ values = factual violations.
- **Distinct entities — never conflate:** The First Signal · Genesis NFT · Seat Record · Patron Seal · Archive1155 · future SeatRecord721.

## Classification key
- **DELETE** — obsolete, duplicated, false, no salvageable product idea.
- **REWRITE & REUSE** — strong concept, stale terms / wrong facts; wire to live data.
- **BACKLOG** — valuable idea, not ready to ship; preserve as future loop.
- **MERGE** — overlaps a live surface; fold the unique value in.

---

## Summary table

| # | Component | Line | Verdict | Reuse home |
|---|-----------|------|---------|-----------|
| 1 | IdeaSection | 49 | MERGE | Chronicle / editorial intro |
| 2 | ActivityFeed | 182 | DELETE | (live: `/activity` LiveActivityFeed) |
| 3 | JoinSection | 211 | DELETE (salvage 1 idea → BACKLOG) | (live: `/join`) |
| 4 | EpisodeEngine / EPISODES | 1032/1040 | **BACKLOG** | future "Episodes" retention loop |
| 5 | WhitepaperPreview | 1131 | DELETE (optional BACKLOG) | `/whitepaper` status meter |
| 6 | Constitution | 1194 | **REWRITE & REUSE** | `/docs` or `/constitution` |
| 7 | MeasuredFomo | 1229 | REWRITE & REUSE | `/join` or `/chapters` |
| 8 | DistributionIntel | 1465 | MERGE + REWRITE | `/registry` or `/transparency` |
| 9 | GenesisNFTProgress | 1625 | **REWRITE & REUSE** | `/archive` or `/nft` (live reads) |
| 10 | DayOneArchive | 1667 | MERGE | `/chronicle` (Entry 1) |
| 11 | WhyComeBackTomorrow | 1714 | **BACKLOG** | `/my-syndicate` return-loop |
| 12 | SyndicateIndex | 1748 | BACKLOG | `/protocol-health` composite score |

**Headline:** Only **2 outright deletes** (ActivityFeed, JoinSection) have zero salvageable
product memory. **3 components carry important future loops** that must NOT be lost
(EpisodeEngine, WhyComeBackTomorrow, GenesisNFTProgress). Everything else either merges
into a live surface or is an accurate concept worth surfacing.

---

## Per-component detail

### 1. IdeaSection — `Sections.tsx:49`
- **Status:** Dead/unrendered.
- **Factually wrong:** Nothing — mission/“compounding experiment” copy is still accurate.
- **Product idea:** The core Syndicate philosophy opener (mission + “mission question”).
- **Verdict:** **MERGE.** Concept already lives in `EditorialHero` / `ProtocolOverview` / `/chronicle`.
- **Reuse home:** Chronicle or an About/editorial intro, if any phrasing here is stronger than what ships.
- **Risk of keeping:** Low — dead code drift; copy could fall out of sync with live mission statement.
- **Risk of deleting:** Low — concept is already surfaced live. Salvage only unique wording first.

### 2. ActivityFeed — `Sections.tsx:182`
- **Status:** Dead/unrendered. Uses hardcoded `LIVE_ACTIVITY` const (~line 131).
- **Factually wrong:** Static table of 10 “genesis” transactions; lists a **stale/incorrect Sale contract address** (`0x0020…842d`). Hardcoded ledger = violates live-data discipline.
- **Product idea:** A verifiable “protocol origins / genesis ledger” feed.
- **Verdict:** **DELETE.** Fully superseded by the live `/activity` `LiveActivityFeed` + `ProtocolTimeline`.
- **Reuse home:** n/a (live equivalent exists).
- **Risk of keeping:** **High if ever rendered** — shows a wrong contract address (trust violation).
- **Risk of deleting:** Negligible — no unique concept lost.

### 3. JoinSection — `Sections.tsx:211`
- **Status:** Dead/unrendered.
- **Factually wrong:** **Fabricated founder number** `founderNo = 428 + Math.floor(...)` (~line 219); conflates “Founding Member” with “permanent archive ID”.
- **Product idea:** A large interactive membership simulator (USDC input + slider → rank cards + 70/20/10 split).
- **Verdict:** **DELETE** the component (superseded by live `/join`: `MintFirstSignal`, `HowToJoinSteps`, `MembershipCalculator`). **BACKLOG one idea:** a *live* founder-number preview wired to the real registry (not a fabricated `428`).
- **Reuse home:** `/join` (calculator already live); the live-founder-preview idea → member cockpit.
- **Risk of keeping:** Medium — fabricated `428` founder count is a truth violation if rendered.
- **Risk of deleting:** Low — simulator concept is already live; only the (false) preview number is unique.

### 4. EpisodeEngine + EPISODES — `Sections.tsx:1032 / 1040`
- **Status:** Dead/unrendered.
- **Factually wrong:** Stale status (Ep. 002 “Founding Members” shown as “Up next” though sale is live); **fabricated `$100` Vault and `1` member**; “episode” status words aren’t LIVE/PARTIAL/PENDING.
- **Product idea:** **“The protocol as a TV series.”** Episodic milestone cards driving a return/addiction loop. This is a *core vision concept*, not just a widget.
- **Verdict:** **BACKLOG — do NOT delete.** Strong retention/serialization concept; only the data is wrong.
- **Reuse home:** A future “Episodes” feature; closely related to `/chronicle` (canonical entries) and `/chapters`. Could become the narrative spine that ties chapters + chronicle + activity into episodic “drops”.
- **Risk of keeping (as dead code):** Low-medium — fabricated `$100`/`1` could mislead if accidentally rendered; wording will drift.
- **Risk of deleting:** **High (product memory loss)** — this is one of the best dormant retention loops.

### 5. WhitepaperPreview — `Sections.tsx:1131`
- **Status:** Dead/unrendered.
- **Factually wrong:** Stale “Vault Policy: In Progress” (it’s live on `/transparency`); “NFT Layer: Planned” (Archive1155 + First Signal are live); `pct` derived from a hardcoded status array.
- **Product idea:** A documentation-completeness progress meter for the 10 whitepaper chapters.
- **Verdict:** **DELETE** (low concept value; `/whitepaper` + `/docs` are the authoritative live surfaces). *Optional* BACKLOG if a “docs status” meter is ever desired — but it must read real doc status, not a hardcoded array.
- **Reuse home:** `/whitepaper` header (only if rebuilt against real status).
- **Risk of keeping:** Medium — repeats the stale “NFT Layer: Planned” falsehood.
- **Risk of deleting:** Low.

### 6. Constitution — `Sections.tsx:1194`
- **Status:** Dead/unrendered.
- **Factually wrong:** Nothing material — the 9 core rules read as doctrinally sound.
- **Product idea:** An on-page “protocol constitution / immutable rules” grid.
- **Verdict:** **REWRITE & REUSE** (light touch — verify each rule against current doctrine, then surface). Accurate, valuable, and currently *invisible* to users.
- **Reuse home:** `/docs` or a dedicated `/constitution` section; pairs with `docs/CONSTITUTION_SUMMARY.md`.
- **Risk of keeping (dead):** Low, but it’s a wasted asset sitting unrendered.
- **Risk of deleting:** Medium — you’d lose a clean, accurate constitution UI that isn’t duplicated elsewhere in-app.

### 7. MeasuredFomo — `Sections.tsx:1229`
- **Status:** Dead/unrendered.
- **Factually wrong:** “Join before **Episode 010**” (arbitrary/fabricated milestone); “Vault starts small” paired with hardcoded `$100` elsewhere.
- **Product idea:** Honest-scarcity / urgency framing for the founding phase.
- **Verdict:** **REWRITE & REUSE** — anchor urgency to the **real** Genesis Signal seal (Member #333) and real chapter thresholds instead of a made-up “Episode 010”.
- **Reuse home:** `/join` or `/chapters`.
- **Risk of keeping (as-is):** Medium — fabricated FOMO milestone violates truth discipline.
- **Risk of deleting:** Low — urgency can be re-expressed via real chapter seals.

### 8. DistributionIntel — `Sections.tsx:1465`
- **Status:** Dead/unrendered (empty-state placeholder).
- **Factually wrong:** “Awaiting Indexer” status is now stale — indexers exist (PARTIAL/LIVE).
- **Product idea:** Holder-distribution analytics (top-N wallet share, holder counts, per-holder averages).
- **Verdict:** **MERGE + REWRITE** — the analytics concept is valuable; wire it to the now-available indexer and label PARTIAL/LIVE honestly.
- **Reuse home:** `/registry` or `/transparency`; coordinate with `IndexerFreshnessBadge`.
- **Risk of keeping (dead):** Low-medium — stale “awaiting indexer” copy.
- **Risk of deleting:** Medium — holder analytics is a genuine gap in the live product.

### 9. GenesisNFTProgress — `Sections.tsx:1625`
- **Status:** Dead/unrendered.
- **Factually wrong:** **MAJOR — entity conflation + false supply.** Treats a “Genesis NFT” as a **1,000-supply** mint. Baseline: First Signal is **uncapped**, Patron Seal is **10,000**, Seat Record is a **future** ERC-721. Also hardcodes `minted = 0` and uses non-canonical “Pending Contract” wording.
- **Product idea:** A mint-progress / supply-tracker artifact module (progress bar toward a milestone). **Explicitly called out as valuable** despite wrong data.
- **Verdict:** **REWRITE & REUSE** (do NOT delete the idea). Rebuild against **live Archive1155 reads** for a real artifact (First Signal count, or Patron Seal toward 10,000). If `MintProgressTracker` already covers this, MERGE into it.
- **Reuse home:** `/archive` or `/nft`, reading live supply; or merge into `MintProgressTracker`.
- **Risk of keeping (as-is):** **High** — propagates the false “1,000 supply” and conflates distinct NFT entities.
- **Risk of deleting:** Medium-high — loses a wanted progress/artifact module concept.

### 10. DayOneArchive — `Sections.tsx:1667`
- **Status:** Dead/unrendered.
- **Factually wrong:** Hardcoded “7 wallets” for allocations; static contract-address string.
- **Product idea:** A “sealed Day One” canonical launch-proof artifact card.
- **Verdict:** **MERGE.** The genesis-seal concept already lives as Chronicle Entry 1.
- **Reuse home:** `/chronicle` (fold any unique “sealed Day One” framing in).
- **Risk of keeping (dead):** Low — static numbers could drift from truth.
- **Risk of deleting:** Low-medium — preserve the “sealed” framing in Chronicle before removing.

### 11. WhyComeBackTomorrow — `Sections.tsx:1714`
- **Status:** Dead/unrendered.
- **Factually wrong:** “Scarcity drops as the **1,000 supply** gets claimed” — repeats the Genesis/supply conflation; also includes the stale “NFT Adoption · Mint not yet opened” composite line.
- **Product idea:** **Retention / return-loop module** — 8 reasons to come back tomorrow. Core to the “addiction loop / return loops” pillar of the product.
- **Verdict:** **BACKLOG — do NOT delete the idea.** Rebuild reasons against *real* loops (new members, chapter progress, activity, vault inflows); drop the 1,000-supply error.
- **Reuse home:** `/my-syndicate` or a home return-loop strip; overlaps `SinceYourLastVisit` / `WhatChangedForYou` (live) — coordinate so it complements rather than duplicates.
- **Risk of keeping (as-is):** Medium — false scarcity claim.
- **Risk of deleting:** **High (product memory loss)** — retention is a stated core pillar.

### 12. SyndicateIndex — `Sections.tsx:1748`
- **Status:** Dead/unrendered.
- **Factually wrong:** **Every factor is a hardcoded integer** (e.g. `Vault Growth: 4`); labeled “v0 — scoring engine” but there is no engine.
- **Product idea:** A single composite **protocol-health score (0–100)** from 6 factors.
- **Verdict:** **BACKLOG.** Compelling “one number” concept, but it must be powered by a real scoring engine over live data before it can render.
- **Reuse home:** `/protocol-health` (live) or `/transparency`; likely extends what `/protocol-health` already shows.
- **Risk of keeping (as-is):** Medium-high — a fabricated health score is the most misleading thing to ship accidentally.
- **Risk of deleting:** Medium — concept is valuable; capture the 6-factor model in backlog before removing code.

---

## Not dead — flagged separately

### VERIFY_ENTITIES / VaultPolicy — `Sections.tsx:621` (data) inside `VaultPolicy` (633, **LIVE/rendered**)
- **Status:** LIVE — `VaultPolicy` is rendered. Not a salvage candidate.
- **Imprecision (not a fabrication):** the registry row `{ label: "NFT Contract", addr: …NFT_CONTRACT_ADDRESS }` labels the **live Archive1155** generically as “NFT Contract”. Per the naming canon, clearer would be **“Archive Contract (Archive1155)”** to avoid implying the pending Seat Record ERC-721.
- **Action:** Minor live-copy precision fix (separate from this dead-code audit) — not done here.

---

## Recommended next steps (when you're ready to act)
1. **Preserve product memory first:** capture EpisodeEngine, WhyComeBackTomorrow, SyndicateIndex, and the GenesisNFTProgress module as backlog specs before any code removal.
2. **Safe deletes (no concept loss):** ActivityFeed, JoinSection (after noting the live-founder-preview idea).
3. **Surface accurate dormant assets:** Constitution (rewrite-light → `/docs`), DistributionIntel (wire to indexer → `/registry`).
4. **Rewrite against live data:** GenesisNFTProgress (Archive1155 reads), MeasuredFomo (real #333 seal).
5. **Merge into Chronicle:** IdeaSection, DayOneArchive.
6. Each rewrite/merge must respect the entity-distinction and LIVE/PARTIAL/PENDING rules in the baseline above.
