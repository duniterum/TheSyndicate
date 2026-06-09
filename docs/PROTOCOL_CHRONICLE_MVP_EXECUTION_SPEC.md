# Protocol Chronicle — MVP Execution Specification

Bridge between doctrine and execution. No code. No components. No styling. No new doctrine.
This document translates the locked Chronicle / Sealing / Continuity doctrine into the **smallest correct Chronicle that can ship now** with the protocol's current on-chain state (2 members, Chapter I open, First Signal + Patron Seal live).

All prior doctrine treated as fixed. This pass picks what to build, what to reuse, what to wait on, and in what order.

---

## A. Chronicle MVP — the minimum that already feels correct

### Current on-chain state (the only allowed source of entries)
- Chapter I is open and unsealed.
- Members: 2 (Member #1, Member #2).
- Artifacts: First Signal (ID 1) live; Patron Seal (ID 3) live.
- Treasury/liquidity/vault: live but small.
- No chapter has sealed. No artifact mint window has closed.

### What absolutely must exist on day one
1. **One canonical route** — `/chronicle` — single page, single voice, top-to-bottom chronological reading order.
2. **A Chapter I header block** — chapter name, status (`Open`), opening block, current member count. Sourced live; no editorial copy.
3. **Two to four sealed Chronicle entries**, each anchored to an on-chain fact that already exists:
   - Chapter I opened.
   - Member #1 joined (the founding seat — the *only* per-member entry that is constitutionally justified today).
   - First Signal became mintable.
   - Patron Seal became mintable.
4. **Per entry**, exactly: title, one-paragraph protocol-voice body (past/present-perfect only), the on-chain anchor (block + tx), and a "what changed" line.
5. **A footer line** stating that further entries appear only when on-chain predicates fire (no editorial cadence).
6. **`head()` metadata** — distinct title and description; canonical, no `og:image` unless we have a real one.

### What can wait
- Per-chapter pagination (only one chapter exists).
- Cross-linking to per-wallet timelines (My Chronicle is its own surface).
- Sealing entries (cannot exist until predicate fires).
- Witness sets (cannot exist until SeatRecord721 exists).
- OG images for entries (only after entry phrasing stabilises in production for ≥ one chapter).
- Share intents per entry.
- Chronicle RSS / archive feed (only after Chapter II opens).
- Search, filters, tags — Chronicle is never filtered. Chronological only.

### The MVP rule
> If an entry cannot point to a verifiable on-chain fact that already exists, it does not exist on day one. Empty space is allowed. Padding is not.

---

## B. Existing Surface Reuse Audit

| Surface | Verdict | Why |
|---|---|---|
| **Story So Far** | **Leave unchanged** | Already answers "current posture". Adding a link to `/chronicle` in its footer row is the only delta. |
| **Activity (`/activity`)** | **Leave unchanged** | Already answers "what happened, with proof". Chronicle does not replace it. |
| **Activity Heartbeat** (homepage strip) | **Leave unchanged** | Pulse surface; not in the Chronicle pipeline. |
| **Notification Bell** | **Adapt minimally** | Add `/chronicle` to its "see more" routing options *only if* a sealed Chronicle entry is newer than `lastSeenBlock`. Otherwise unchanged. Bell remains a count, not a router. |
| **Protocol Memory (`WhatChangedForYou`)** | **Leave unchanged** | Wallet-scoped present-state card. Continuity-distinct from Chronicle. |
| **My Chronicle (per-wallet timeline)** | **Adapt** | Add a single footer link: "Read the protocol's own Chronicle →". No data sharing, no shared rendering. |
| **Story Timeline** (legacy if present) | **Move to `/labs`** | Superseded by the combination of Story So Far + Chronicle. Demote per Archive Safety Net; do not delete. |
| **Milestones** (`activity-milestones`) | **Reuse as input** | Chronicle entry-selection rules consume the same milestone definitions. No duplication of evaluation logic. |
| **Proof Drawer** | **Reuse** | The "verify" link on each Chronicle entry should open the same proof drawer Activity already uses. One proof component, two consumers. |

No surface is removed in this pass. Story Timeline is the only candidate for demotion, and only because Story So Far already owns its question better.

---

## C. Chronicle Route — Reading Journey (sections only)

```
/chronicle
├── 1. Page header
│     └── Title · one-sentence purpose · last-updated block
├── 2. Current chapter block
│     └── Chapter I · status · opening anchor · live member count
├── 3. Entries (chronological, oldest → newest, no pagination)
│     ├── Entry · Chapter I opened
│     ├── Entry · Member #1 joined
│     ├── Entry · First Signal became mintable
│     └── Entry · Patron Seal became mintable
├── 4. "What comes next" line
│     └── Single sentence stating that the next entry will appear when
│         a canonical on-chain predicate fires. No countdown. No date.
└── 5. Footer
      ├── Link to /activity ("raw ledger ↗")
      ├── Link to /my-syndicate ("your own record ↗")
      └── One-line voice statement
            (e.g. "This page is the protocol's own record of what has
             happened. Entries are written only after their on-chain
             anchor exists. Nothing here is editorial.")
```

Reading direction is **oldest first**. A chronicle reads forward in time, not back. This is the inversion of every feed on the internet, and it is the point.

---

## D. Entry Selection Rules (the gate)

An event becomes a Chronicle entry **only if** it satisfies all five:

1. **On-chain anchor.** The event has a concrete block + tx (or block range) that any reader can verify.
2. **Significance.** The event changes the protocol's state in a way that future members will need to know to understand the protocol. ("A purchase happened" is not significant. "The protocol's first purchase happened" is.)
3. **Permanence.** The fact described will still be true in ten years. (Treasury balance on a specific day is not permanent. *The treasury crossed $X for the first time* is.)
4. **Singularity.** The event is of a kind that only happens once, or once per chapter. First-of-kind events qualify; recurring events do not.
5. **Voice fit.** The event can be described in the protocol's first-person, past-tense voice without editorial framing.

### Applied to today's available events

| Event | Eligible? | Reason |
|---|---|---|
| Chapter I opened | **Yes** | Anchor, significance, permanence, singular, voice fits. |
| Member #1 joined (founding seat) | **Yes** | Only per-member entry that survives the gate. "The first seat was claimed." |
| Member #2 joined | **No** | Not singular at the protocol level. Belongs in Activity and in Member #2's My Chronicle, not in the protocol's Chronicle. |
| First Signal became mintable | **Yes** | Singular artifact unlock. Permanent state transition. |
| Patron Seal became mintable | **Yes** | Same reasoning. |
| Individual First Signal mints | **No** | Recurring. Belongs in Activity. |
| Individual Patron Seal mints | **No** | Recurring. Belongs in Activity. |
| Treasury growth (continuous) | **No** | Not singular, not permanent at any specific value. |
| "Treasury crossed $X for the first time" (canonical milestone) | **Yes**, when it fires | Singular by definition; permanent. |
| Liquidity pool created | **Yes** (if not already entered) | Singular, anchored, permanent. |
| Early purchases (general) | **No** | Belongs in Activity. |
| Chapter I sealed | **Mandatory** when predicate fires | Constitutional. Until then: does not exist. |

> Selection rule, restated: **Activity is the ledger. Chronicle is the canon.** Most events are ledger. Few are canon. That ratio is correct.

---

## E. Living History Test

A visitor comes **today**:
- Reads the current chapter header. Sees Chapter I is open.
- Reads four sealed entries in chronological order. Understands how the protocol came to exist.
- Sees the "what comes next" line. Understands no further entry exists *yet*, and why.

Same visitor returns in **one week**:
- Chapter header member count has changed (if anyone joined).
- Entries section is **likely identical**. If a canonical milestone fired (e.g. first treasury threshold, or liquidity creation if not already entered), one new entry exists at the bottom.
- The honest answer "nothing canonical happened" is allowed and dignified.

Same visitor returns in **one month**:
- Chapter header may show meaningfully more members.
- One or two new entries at the bottom, if canonical milestones fired.
- Story So Far (separate surface) has shifted posture; Chronicle has accrued only what survived the gate.

Same visitor returns in **one year**:
- Either Chapter I has sealed → header reads `Sealed at block N`, a closure entry exists, and Chapter II opens above it with its own (small) entry set.
- Or Chapter I is still open → header reads `Open` with a much larger member count, and the entry set has grown only by canonical milestones (likely 5–15 entries total).
- In both cases the page reads like a credible historical document, not a blog. A reader who has never visited before can read it in five minutes and understand the protocol.

> Living history rule: **the page grows at the speed of significance, not the speed of activity.**

---

## F. Continuity Integration (no overlap, no duplication, no contradiction)

| Surface | Question | Chronicle relationship |
|---|---|---|
| **Activity** | What happened, in order, with proof? | Chronicle reads a strict subset (events that pass the gate). No shared rendering. |
| **Bell** | Are there events since `lastSeenBlock`? | Counts all Activity events. If a sealed Chronicle entry is among them, the bell's "see more" routing surfaces both options. No separate Chronicle-bell. |
| **Memory (`WhatChangedForYou`)** | For this wallet, what facts + milestones-since-join? | Reads canonical milestones from the same registry Chronicle uses, but presents them per-wallet. Chronicle is global. No data overlap; same source of truth. |
| **My Chronicle** | This wallet's verified chronological record. | Personal. Footer-linked to `/chronicle` for context. No shared entries; My Chronicle never quotes the protocol's voice and vice versa. |
| **Story So Far** | Current posture: past · present · next, in three cards. | Footer-links to `/chronicle` for the long form. Story So Far is synthesis; Chronicle is canon. |
| **Chronicle** | In the protocol's own voice, what happened and what changed? | The single canonical archive of meaning. All other surfaces are upstream (Activity, Memory) or sibling (Story So Far). |

No surface answers Chronicle's question. Chronicle answers no other surface's question. If a future change blurs any row, restore.

---

## G. Failure Audit — 25 ways Chronicle drifts, and how to prevent it

### Drift into a dashboard
1. **Numbers in headers** (totals, percentages, "X% to next milestone"). *Prevent:* Chronicle header carries only chapter status + opening anchor + member count. No progress bars on this page.
2. **Charts.** *Prevent:* zero chart primitives allowed in `/chronicle`. Charts live on Protocol Health.
3. **KPI cards above entries.** *Prevent:* no card grid. Page is one column, entries only.
4. **"Live" tickers.** *Prevent:* Chronicle does not animate values. Values render on read.
5. **Real-time mint counters embedded in artifact entries.** *Prevent:* artifact entries describe the *unlock*, not the running mint count.

### Drift into a feed
6. **Reverse-chronological order.** *Prevent:* oldest first, always. Tested by a content lint that asserts entry ordering.
7. **Infinite scroll / pagination.** *Prevent:* single page, full archive, no pagination until Chapter II opens.
8. **Reactions / likes / comments.** *Prevent:* zero social primitives — ever.
9. **"Trending" or "popular" sections.** *Prevent:* there is no engagement signal on Chronicle. Order is by block.
10. **Per-entry view counts.** *Prevent:* not tracked, not displayed.

### Drift into a changelog
11. **Version numbers in titles** ("v1.2 shipped"). *Prevent:* Chronicle entries describe protocol facts, not deployments. Deployment notes belong elsewhere.
12. **Bullet-list "what's new" entries.** *Prevent:* every entry is one paragraph of prose + one "what changed" line. No bullets.
13. **Per-PR / per-commit granularity.** *Prevent:* entries describe on-chain state transitions, not code.
14. **"Improvements" / "fixes" / "tweaks" entries.** *Prevent:* selection gate rejects anything non-canonical.

### Drift into marketing
15. **Hype adjectives** ("milestone", "huge", "exciting", "incredible"). *Prevent:* banned vocabulary list applied to Chronicle copy review.
16. **CTAs inside entries** ("Join now", "Mint today"). *Prevent:* no CTAs in the entry body. The footer links to `/activity` and `/my-syndicate` only.
17. **Founder quotes.** *Prevent:* Chronicle voice is the protocol's, first-person plural at most. No human attributions.
18. **"As featured in" press badges.** *Prevent:* press belongs on a press page, not in Chronicle.
19. **Imagery used to evoke emotion** (renders, lifestyle shots, mood photography). *Prevent:* if an entry has an image, it is a deterministic on-chain-derived asset (artifact thumbnail). Otherwise: text.
20. **Price / valuation references** ("treasury now worth $X at current market"). *Prevent:* banned vocabulary; values stated in USDC routed, never in market terms.

### Drift into documentation
21. **"How it works" explanations inside entries.** *Prevent:* Chronicle records *what happened*, not how the protocol works. Mechanics live in `/docs`.
22. **Definitions, glossaries, footnotes.** *Prevent:* glossary belongs on `/docs/terminology`. Chronicle entries assume the reader can click out.
23. **FAQ-style entries.** *Prevent:* no question-form entries.
24. **Per-contract architecture diagrams.** *Prevent:* architecture lives on `/transparency`.
25. **"Last updated" timestamps inside every entry as if they were docs pages.** *Prevent:* entries carry their on-chain anchor (block + tx). They are not "updated"; they are sealed by their block.

> Failure-audit rule: **every drift above is a category error.** Chronicle is neither a UI surface for data, a feed of social events, a list of code changes, a marketing channel, nor a reference manual. It is the protocol's first-person memory. Treat any drift as a constitutional violation and reject in review.

---

## H. Final Execution Plan

### Phase 1 — Launch (the smallest correct Chronicle)
Highest value. Ships first. Nothing else gates on doctrine.

1. Create `/chronicle` route with `head()` metadata.
2. Render Chapter I header from existing live reads (chapter status, opening anchor, member count from `useHolderIndex`).
3. Define a small entry registry (typed records) for the four day-one entries (Chapter opened · Member #1 joined · First Signal mintable · Patron Seal mintable). Each carries title, body, on-chain anchor, "what changed" line.
4. Render entries chronologically (oldest first), single column.
5. Wire entry "verify" link to the existing Proof Drawer.
6. Add footer with links to `/activity` and `/my-syndicate` and the voice statement.
7. Add a Story So Far footer link to `/chronicle`. Add a My Chronicle footer link to `/chronicle`.
8. Update bell "see more" routing to include `/chronicle` *only when* a sealed entry is newer than `lastSeenBlock`.
9. Add `/chronicle` to the sitemap. Confirm it is indexable.

### Phase 2 — Activate (only after Chapter I sees real milestones)
Medium value. Adds to Chronicle as the chain actually fires events.

10. Implement the milestone → Chronicle entry pipeline: when a canonical milestone (treasury thresholds, liquidity creation, first artifact mint of a kind, etc.) fires, an entry becomes eligible. Eligibility is a gate; sealing the entry is a deliberate write to the registry.
11. Add `og:image` per Chronicle entry (deterministic, server-rendered) — only once the entry phrasing has stabilised in production for ≥ one chapter.
12. Add per-chapter stacking when Chapter II opens (Chapter II's header above Chapter I's, with Chapter I's entries collapsed by default).

### Phase 3 — Seal (only when the predicate fires)
Highest constitutional weight. Cannot be pre-built.

13. Sealing entry template (closure paragraph + sealed-at-block + co-witness set). Wired but inactive until the predicate fires.
14. ID 9 (or whichever ID is reserved) activation runbook per `PROTOCOL_CHRONICLE_READINESS.md §G` upon Chapter I seal.
15. Witness-set cross-links once `SeatRecord721` exists.
16. Optional per-entry share intents — only after a sealed chapter exists and the protocol has at least one entry that has been read at scale.

> Execution rule: **Phase 1 is the only thing that must ship to call Chronicle live.** Phases 2 and 3 are reactive, gated on the chain. They are not a roadmap; they are a *readiness posture*.

---

## Decision Lens Verdicts

| # | Lens | Verdict | Note |
|---|---|---|---|
| 1 | Founder | ✓ | Smallest correct Chronicle; defers everything that cannot pass the selection gate today. |
| 2 | Investor | ✓ | Page reads as a credible long-horizon archive; no price, no hype. |
| 3 | Growth | ✓ | Indexable, shareable, single canonical URL; SEO-positive without manipulation. |
| 4 | Behavioral | ✓ | No engagement primitives; oldest-first ordering inverts feed psychology. |
| 5 | UX | ✓ | One column, one voice, one direction; legible in five minutes. |
| 6 | Product | ✓ | Reuses existing surfaces (Proof Drawer, milestone registry, holder index); no parallel infra. |
| 7 | Staff Eng | ✓ | Entry registry is typed and small; bell routing change is minimal; no new servers. |
| 8 | QA | ✓ | Entry-ordering lint + selection-gate checklist + 25-failure prevention list = mechanical review. |
| 9 | A11y | ✓ | Static text, no motion, no sound, semantic headings; accessibility-positive by construction. |
| 10 | SEO | ✓ | Distinct title/description, single canonical URL, oldest-first ordering preserves stable anchors over time. |

Bridge locked. Ready to implement Phase 1 on your word.
