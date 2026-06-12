---
name: Homepage gate pins & stale guards
description: What the real release gate actually enforces on the homepage, and which guard scripts are decoys.
---

The real gate is `scripts/check-release.mjs` → `tsc` + full `vitest run` + vocabulary/state/execution/explorer/health checks.

GATED homepage structural pins (removing them from `src/routes/index.tsx` FAILS the gate):
- `<ProtocolStorySoFar>` — pinned by `protocol-awareness.test.ts`.
- `<StoryTimeline>` — pinned by `proof-drawer-and-timeline.test.ts` (also pinned on `activity.tsx`).

Doctrine/vocabulary: `doctrine-guard.test.ts` + `protocol-language.test.ts` scan rendered route/component source for banned financial-return terms (yield/dividend/ROI/equity/"return"/governance-rights). All homepage copy must stay clean. Avoid trading-flavored words too ("positions" → use "seats").

Required live-content phrases ("seat is the anchor", "Protocol Economy", "Programmatic Vault", "70 / 20 / 10") are all emitted by `Flywheel.tsx`. Keep Flywheel mounted on index.tsx or the post-deploy `check-homepage-content.mjs` (live-URL fetch, NOT in the release gate) breaks.

DECOY guards — DO NOT treat as authoritative: `scripts/check-attention-hierarchy.mjs` and `scripts/check-loop-ownership.mjs` are stale, already failing on main, and NOT part of check-release. Don't expand scope to satisfy them.

**Why:** during the consolidation pass these pins were non-obvious — an architect plan suggested cutting StoryTimeline, which would have failed the gate; and `check-loop-ownership` "requires" the standalone SinceYourLastVisit but is ungated, so the duplicate (IdentityZone already mounts it) was safely removed.
**How to apply:** before restructuring the homepage, keep ProtocolStorySoFar + StoryTimeline + Flywheel mounted; freely reorder/cut other non-gated surfaces (LiveProofStrip, StorySoFar, ProtocolMoments, HomeArchiveTeaser, LP card, duplicate SinceYourLastVisit) — but if you cut HomeArchiveTeaser, restore a text link to `/archive` somewhere (it was the homepage's only route into the memory layer). Full `vitest run` OOMs — run the ~73 files in ~3 separate-process batches.
