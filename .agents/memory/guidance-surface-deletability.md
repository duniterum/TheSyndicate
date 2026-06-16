---
name: Guidance-surface deletability map
description: Which member-guidance components are dead vs. load-bearing, so a future "duplicate cleanup" doesn't delete a test/labs-anchored surface.
---

# Guidance-surface deletability (don't re-delete the live ones)

The protocol has several member-guidance components that LOOK like duplicates of
`CockpitNextMove`. They are NOT interchangeable — deletability differs:

- **`YourNextAction.tsx` — KEEP, do NOT delete.** It looks like a dead `CockpitNextMove`
  duplicate, but it is (a) imported/rendered by the labs ARCHIVE piece
  `src/labs/components/MemberCockpitCandidate.tsx`, and (b) pinned by **source-asserting
  tests** that `read()` its file as a string: `protocol-awareness.test.ts` ("Your Next Action"
  describe) + `proof-drawer-and-timeline.test.ts` (VerifiedUpToBadge mount + indexer-guard
  fallback). Deleting it breaks the labs import **and ~7 test assertions**.
  **Why:** these tests don't import the component, they grep its text — a grep for `<YourNextAction`
  finds only the labs render and misses the test coupling. Always check `read("…YourNextAction.tsx")`.
- **`MemberCockpitCandidate.tsx` — KEEP (labs ARCHIVE).** v1 cockpit pattern preserved as a
  museum piece (registered in `labs/registry.ts` + `museum-inventory.ts`), rendered by no route.
  This is the canonical home of the "salvaged" v1 cockpit, so the production shells could be removed.
- **v1 cockpit shells were REMOVED** (orphan, not rendered, no active tests): `CommandStrip.tsx`
  and `MemberWalletDashboard.tsx`. Note `SinceLastVisitStory` was the only live-relevant child of
  the dashboard and it is independently rendered by `cockpit/CockpitMemory.tsx` — so its removal
  orphaned nothing. Don't go looking for these shells again.
- **`scripts/check-attention-hierarchy.mjs` is a stale, un-CI-wired decoy** (also noted in
  homepage-gate-pins.md). It asserted `/my-syndicate` renders `<MemberWalletDashboard>` — already
  false. It is NOT in check-release/package.json/.replit. Its dead refs were pruned; the real CTA
  guard is `protocol-actions-guard.test.ts`, the real wording guard is `check-ownership-wording.mjs`.
