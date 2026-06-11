---
name: my-syndicate moved-surface test breakage
description: When a surface moves OUT of src/routes/my-syndicate.tsx into the cockpit, route-file-reading guard tests break even though the page is correct. Retarget at the new home; don't re-add to the route.
---

# /my-syndicate route-mount guard tests break when surfaces move into the cockpit

`/my-syndicate` was refactored from a §1–§8 module stack into a **Member Cockpit
narrative arc**: `<MemberCockpit/>` → Memory zone → Proof zone → Building tail.
Several guard tests still `readFileSync("src/routes/my-syndicate.tsx")` and grep
for old surfaces, so they fail even though the surface is still on the page —
it just **moved into a child component**, not deleted.

**Key insight (the trap):** these are NOT "removed module" failures. The
components are alive; they relocated. Map the surface to its NEW home before you
delete or re-add anything:

- `WhatChangedForYou` → rendered inside `cockpit/CockpitMemory.tsx` (the route
  mounts `<CockpitMemory/>` in the Memory zone). Test the child, not the route.
- standalone `SinceYourLastVisit` → its role on my-syndicate was absorbed into
  CockpitMemory's "Since You Were Away" spine. The standalone component is still
  LIVE on Home + `/activity` (keep those assertions).
- `ProtocolStorySoFar` → protocol-wide; mounted `<ProtocolStorySoFar/>` on
  index.tsx + activity.tsx, intentionally NOT on my-syndicate.
- `MemberWalletDashboard` → replaced by `<MemberCockpit/>`; now referenced only
  by its own file (dead-component candidate).
- `/nft` is code-split: `src/routes/nft.tsx` only exports `Route`; the page body
  (incl. `<PatronSealReadiness/>`) lives in `components/syndicate/NftPage.tsx`.
  Route-file greps for page content will miss it — read NftPage.tsx.

**Member-fact id gotcha:** the wallet-contribution MemoryFact in
`protocol-memory.ts` is emitted with **id `"usdc-paid"`** ("USDC routed by your
wallet"), NOT `"contribution"`. It carries the wallet-explorer verifyHref. A test
finding `f.id === "contribution"` silently gets `undefined` and fails.

**The arc order is pinned ELSEWHERE — don't re-create it.** The new
cockpit→Memory→Proof→Building order (and the internal cockpit
Identity→Place→Ownership→Momentum→Action order, CockpitMemory/CockpitProof
placement, parked-tail gating) is comprehensively asserted by
`my-syndicate-doctrine.test.ts`. The old "canonical order" describe in
`protocol-awareness.test.ts` was REMOVED as duplicative + stale.

**Status:** the 6 Phase-0B failures are RESOLVED (4 retargeted at new homes, 2
obsolete `it`s removed). Suite: 557 pass / 0 fail; doctrine-guard 137/137.

**Remaining test-debt (deferred, NOT in 0C scope):** `YourNextAction` is not
mounted on any live route (survives only in `labs/MemberCockpitCandidate.tsx`)
yet `proof-drawer-and-timeline.test.ts` + `protocol-awareness.test.ts` still
assert its internals; `MemberWalletDashboard` is a dead-component candidate.
Decide remount-vs-retire in a later phase, then update those guards.

**How to apply:** if the suite shows route-file failures after cockpit work,
confirm `git diff --stat -- src/routes/my-syndicate.tsx` (route untouched) and
retarget the test at the surface's new component home — never re-add the surface
to the route to satisfy a stale grep.
