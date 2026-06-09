# Product Memory & Future Loops

**Date:** 2026-06-09
**Purpose:** Permanent product-memory record. Before any dead code is deleted or rewritten,
this document preserves the valuable concepts discovered inside dormant/unrendered
components so the original Syndicate vision is never flattened into "only what currently
renders."

> Companion audit: `docs/DEAD_COMPONENT_SALVAGE_REPORT.md` (per-component classification).
> This file is the **memory of the vision**; that file is the **disposition of the code**.

---

## Doctrine reminders (the non-negotiable facts)
- **Archive1155 is LIVE.**
- **The First Signal is LIVE.** It is **NOT** "Genesis NFT". It is **uncapped**.
- **Patron Seal is LIVE.** Supply is **10,000**.
- **Seat Record is a FUTURE ERC-721 (PENDING).** It is **not** Archive1155.
- **SYN is the seat. Artifacts are the memory.**
- Status vocabulary is strictly **LIVE / PARTIAL / PENDING**.
- Never conflate: The First Signal · Genesis NFT · Seat Record · Patron Seal · Archive1155 · future SeatRecord721.
- **Never reuse the false "Genesis NFT — 1,000 supply" idea again.**

## The long-term vision these loops protect
- Episodic protocol · return loops · artifact progression · member cockpit · chapter urgency · protocol health · collector memory.

---

## Preserved concepts (backlog / future loops)

### 1. EpisodeEngine
- **Purpose:** The Syndicate as an **episodic protocol / TV-series loop** — milestones released as "episodes" that pull members back.
- **Future home:** Chronicle + Chapters + Activity (the narrative spine tying them together).
- **Status:** **Backlog.** Do NOT ship with fabricated data.
- **Original source:** `src/components/syndicate/Sections.tsx` → `EpisodeEngine` / `EPISODES`.
- **Known data faults to avoid on rebuild:** stale episode status (002 shown "up next" though the sale is live); fabricated `$100` vault and `1` member; non-canonical status words. Drive everything from live reads.

### 2. WhyComeBackTomorrow
- **Purpose:** **Retention loop / daily return engine** — concrete reasons to come back.
- **Future home:** My Syndicate cockpit.
- **Status:** **Backlog.** Rebuild ONLY with **live deltas**: new members, purchases, chapter progress, artifact mints, vault/liquidity movement, personal activity.
- **Original source:** `Sections.tsx` → `WhyComeBackTomorrow`.
- **Known data faults to avoid:** "scarcity drops as the 1,000 supply gets claimed" (false supply + entity conflation). Coordinate with live `SinceYourLastVisit` / `WhatChangedForYou` so it complements, not duplicates.

### 3. GenesisNFTProgress  →  rename concept: **Artifact Mint Progress / Archive Mint Progress**
- **Purpose:** Show **artifact mint progress using live Archive1155 reads**.
- **Future home:** Archive / NFT.
- **Status:** **Rewrite later.**
- **Original source:** `Sections.tsx` → `GenesisNFTProgress`.
- **CRITICAL:** Never use the false "Genesis NFT 1,000 supply" idea again. The First Signal is **uncapped**; Patron Seal is **10,000**; Seat Record is a **future** ERC-721. Wire to real Archive1155 supply; if `MintProgressTracker` already covers it, merge there.

### 4. Constitution
- **Purpose:** Protocol doctrine / immutable rules.
- **Future home:** Docs or a dedicated Constitution section.
- **Status:** **Rewrite lightly and reuse** (copy is already doctrinally sound; just verify against current doctrine and surface it).
- **Original source:** `Sections.tsx` → `Constitution`; pairs with `docs/CONSTITUTION_SUMMARY.md`.

### 5. MeasuredFomo  →  rename concept: **Chapter Urgency / Real Milestone Pressure**
- **Purpose:** Urgency based on **real thresholds**, especially **Genesis Signal sealing at Member #333**.
- **Future home:** Join / Chapters.
- **Status:** **Rewrite with real data only.**
- **Original source:** `Sections.tsx` → `MeasuredFomo`.
- **Known data faults to avoid:** "Join before Episode 010" (fabricated milestone) and hardcoded `$100`. Anchor to real chapter seals.

### 6. DistributionIntel
- **Purpose:** Holder / member **distribution analytics**.
- **Future home:** Registry / Transparency / Proof.
- **Status:** **Merge and wire to real indexer.**
- **Original source:** `Sections.tsx` → `DistributionIntel`; coordinate with `IndexerFreshnessBadge`.
- **Known data faults to avoid:** stale "Awaiting Indexer" status — indexers now exist (label PARTIAL/LIVE honestly).

### 7. SyndicateIndex
- **Purpose:** **Composite protocol health score** (single 0–100 number from multiple factors).
- **Future home:** Protocol Health / Transparency.
- **Status:** **Backlog only until a real scoring engine exists.**
- **Original source:** `Sections.tsx` → `SyndicateIndex`.
- **Known data faults to avoid:** every factor is currently a hardcoded integer; labeled "v0 scoring engine" but there is no engine. Do not render until powered by live data.

### 8. DayOneArchive
- **Purpose:** **Sealed Day One launch memory** — canonical proof of launch.
- **Future home:** Chronicle Entry 1.
- **Status:** **Merge into Chronicle.**
- **Original source:** `Sections.tsx` → `DayOneArchive`.
- **Known data faults to avoid:** hardcoded "7 wallets" and static address string — fold the "sealed Day One" framing into the live Chronicle entry.

### 9. IdeaSection
- **Purpose:** Core protocol philosophy / mission opener.
- **Future home:** Chronicle / About / editorial intro.
- **Status:** **Merge if wording is stronger** than what `EditorialHero` / `ProtocolOverview` already ship.
- **Original source:** `Sections.tsx` → `IdeaSection`.

---

## Idea salvaged from a deleted component

### Live founder / member-number preview (from `JoinSection`)
- **The component `JoinSection` is being deleted** (its membership simulator is already live on `/join` via `MintFirstSignal` / `HowToJoinSteps` / `MembershipCalculator`).
- **One idea worth keeping:** a **live founder/member-number preview** — show the member their real next sequence number on join.
- **CRITICAL:** the deleted version used a **fabricated** `founderNo = 428 + Math.floor(...)`. Any future implementation must read the **real** registry count — never a hardcoded or offset number.
- **Future home:** Join flow / member cockpit confirmation.

---

## Components deleted in cleanup (no salvageable product memory)
- **ActivityFeed** — static fake genesis ledger with a wrong/stale Sale contract address; fully superseded by the live `/activity` `LiveActivityFeed`. No concept lost.
- **JoinSection** — superseded by the live `/join` surface; its one unique idea (live founder-number preview) is preserved above.

## Live copy precision fix (not a dead component)
- `VERIFY_ENTITIES` inside the **live** `VaultPolicy`: label **"NFT Contract" → "Archive Contract (Archive1155)"**, because "NFT Contract" now risks confusion with the future Seat Record ERC-721.

---

## Rules for any future rebuild
1. No fabricated data — every number must come from a live read or be honestly marked PENDING.
2. Respect entity distinctions and the LIVE / PARTIAL / PENDING vocabulary.
3. Preserve product memory (this document) before removing or rewriting any dormant loop.
