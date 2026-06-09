# P6 Implementation + Archive Safety Net Report — Wave P7b

_Date: 2026-06-05 · Tag: `wave-P7b.archive-safety-net`_

## Why this report exists

Wave P7 deleted 30 orphaned components in the name of "code health." The
correct move at AAA scale is **demote → archive → delete**, not
delete-on-sight. This wave undoes the destruction and replaces it with a
durable quarantine layer so future demotions can never lose institutional
memory by mistake.

## The Archive Safety Net rule (now binding)

Every component removed from a production surface must be classified as
one of:

| Class       | Meaning                                                                  | Action                                       |
| ----------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| PUBLIC      | Active production surface                                                | Lives under `src/components/syndicate/`      |
| LABS        | Not public, potentially useful later, may be re-promoted                 | `src/labs/components/` + listed in `/labs`   |
| ARCHIVE     | Historical reference, preserved as institutional memory                  | `src/labs/components/` + listed in `/labs`   |
| DEPRECATED  | Safe to remove permanently (violates VISION guardrails)                  | Kept in `src/labs/components/` for audit; eligible for permanent deletion after a 1-wave cool-down |

A component may not be permanently deleted unless it is classified
DEPRECATED. The DEPRECATED tier exists only so that vision-violating
patterns (wealth leaderboards, speculative projections, empty
gamification) are removed publicly without being silently erased.

## What was done this wave

1. Restored all 30 previously-deleted components from git into
   `src/labs/components/`. None are imported by any production route.
2. Rewrote their relative `./Primitives` / `./EmptyState` /
   `./ShareActions` imports to absolute paths (`@/components/syndicate/...`)
   so they continue to type-check from the new location without polluting
   `src/components/syndicate/` exports.
3. Created `src/labs/registry.ts` — the canonical classification table
   (single source of truth, used by `/labs`).
4. Created `src/routes/labs.tsx` — a hidden index page that lists every
   quarantined component grouped by class, with origin and reason. The
   route ships `<meta name="robots" content="noindex, nofollow">`.
5. Updated `public/robots.txt` with `Disallow: /labs` and `Disallow: /labs/`.
6. Verified `src/routes/sitemap[.]xml.ts` uses an explicit allow-list of
   ENTRIES — `/labs` is naturally excluded.
7. Updated `src/lib/build-stamp.ts` to `wave-P7b.archive-safety-net`.

## Classification of the 30 quarantined components

### LABS (11) — eligible to come back

`HomeMetricsStrip`, `HomeRankLadder`, `MarketDashboard`, `MilestoneTracker`,
`LiveRecencyStrip`, `RankIntelligence`, `ShareableCards`, `HomeShareCTA`,
`ProtocolFlywheel`, `ProtocolRevenueEngine`, `SmartContractFlow`.

These represent real prior investment we may want again (a dedicated
`/metrics` page, a self-hosted chart, share-card generator when share
intents ship, etc.).

### ARCHIVE (16) — historical reference only

`HomeJourney`, `HomeJoinPreview`, `HomeAllocationPreview`, `HowItWorks30s`,
`MemberJourney`, `OpportunitySection`, `ProtocolOverview`,
`ProtocolStatusGrid`, `StartHereCard`, `WhatSynDoes`, `WhyBecomeMember`,
`WhyDifferent`, `WhyEarlyMatters`, `WhyJoinNow`, `WhyTheSyndicateExists`,
`CapitalAllocation`.

Earlier iterations that were superseded by the canonical production
components. Kept so future contributors can see what we tried.

### DEPRECATED (3) — never re-promote

`MembersLeaderboard` (wealth-ranked list — VISION forbids wealth ranking),
`RankSimulator` (speculative wealth projection — VISION forbids),
`QuestProgress` (empty gamification — VISION forbids).

These are preserved in `src/labs/components/` only so the deletion is
auditable. They are eligible for permanent removal after one wave of
cool-down.

## P6 implementation status

P6 (loop ownership wiring + homepage simplification) is **still
unshipped**. This wave deliberately did not ship the homepage rewire
because the user's feedback was to fix the deletion problem first.

The Archive Safety Net now exists, so P6 can proceed safely — when P6
demotes a component, the new home is `src/labs/components/` + an entry
in `src/labs/registry.ts`, never `rm`.

## Homepage Weight Audit (deferred to P6 wave)

Will be performed as part of P6 implementation, not this wave. Will
measure:

- component count
- viewport depth on mobile (574px CSS, current preview)
- scroll depth
- question-coverage map (each section answers one of: What is this? · Why now? · What happens next? · What changed since I was here? · Why should I trust this? · How do I join?)

Multiple sections answering the same question must consolidate.

## Automated guards (to add in P6)

- Loop-uniqueness check (exactly one component owns Loop A / B / C / D)
- Archive guard: fail CI if any file in `src/labs/components/` is imported
  from `src/routes/` or from a non-labs file in `src/components/`
- Robots/sitemap guard: fail CI if `/labs` ever appears in
  `sitemap[.]xml.ts` ENTRIES

These are scoped to the P6 wave to keep this safety-net wave minimal.

## AAA Founder Readiness Review

Re-runs after P6 implementation lands. Not before — per the user's
explicit instruction.

## Risk ranking

- **Critical**: none.
- **High**: P6 implementation gap is unchanged (homepage still has
  duplicate loop renderers per `LOOP_OWNERSHIP_DECISION.md`).
- **Medium**: Truth Layer Tier-1 migration backlog (unchanged).
- **Low**: 3 DEPRECATED components carry vision-violating patterns;
  eligible for permanent deletion after a cool-down wave.

---

_No vision, truth-layer, transaction-registry, or return-loop document
was altered. No new framework or registry was introduced beyond the
classification table. Build stamp: `wave-P7b.archive-safety-net`._
