---
name: my-syndicate stale route tests
description: Pre-existing /my-syndicate test failures that assert the route mounts modules it no longer has — not caused by cockpit work.
---

There are pre-existing FAILING tests for `/my-syndicate` that assert the **route**
(`src/routes/my-syndicate.tsx`) mounts a set of "protocol memory / awareness"
modules that the route no longer contains after it was slimmed to delegate
identity/holdings to `<MemberCockpit/>`:

- `activity-intelligence.test.ts` — "my-syndicate route mounts SinceYourLastVisit"
- `protocol-awareness.test.ts` — Story So Far mount + canonical order
  (Story So Far → Since Last Visit → What Changed For You → Next Action → Cockpit)
- `protocol-memory.test.ts` — "/my-syndicate mounts WhatChangedForYou"
- `verify-href-coverage.test.ts` — MemoryFact derivation (rank/contribution verifyHref)

**Why:** the route was refactored to a thin composition shell that renders only
`<MemberCockpit/>` + the secondary route-level sections (Activity, What's Sealing
Next, My Chronicle, My Growth, My Horizon, Protocol Context). The older module
suite (ProtocolStorySoFar, SinceYourLastVisit, WhatChangedForYou, YourNextAction)
was dropped from the route but these guard tests were never updated.

**How to apply:** if you edit the cockpit (`MemberCockpit.tsx`, `WakeBehindYou.tsx`,
etc.) and the suite shows ~5 failures, check whether they read `src/routes/my-syndicate.tsx`
or those dropped components — none of them read the cockpit files. Confirm with
`git diff --stat -- src/routes/my-syndicate.tsx` (route should be untouched). These
are NOT your regression. The canonical, cockpit-relevant guards are
`my-syndicate-doctrine`, `cockpit-progression-gating`, `cockpit-proof-gating`,
`cockpit-collector-gating`, `doctrine-guard` — those must stay green.
