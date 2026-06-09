---
name: cockpit progression single surface
description: On /my-syndicate, chapter/progress must render once; CockpitProgression is the test-pinned canonical surface.
---

On `/my-syndicate`, chapter + protocol-progress storytelling must appear **exactly
once**, and `CockpitProgression.tsx` is the canonical surface that owns it.

**Why:** `cockpit-progression-gating.test.ts` hard-pins CockpitProgression's
internals *in source* — the `<ProgressBar>` render, the "Reading the live member
count" pending note ordered before the bar, the explicit `uncapped` guard before
the bar, the `next ? next.startN` boundary math, and the "Earlier is earlier /
historical coordinate" story copy. It cannot be slimmed without editing that
doctrine test.

**How to apply:** if a second chapter/progress surface ever shows up (e.g. a
compact strip inside the One Seat panel), de-duplicate by **removing the other,
unpinned surface** — never by gutting CockpitProgression. Keep the
`<CockpitProgression />` propless tag in MemberCockpit (also pinned by
`my-syndicate-doctrine.test.ts`).

**Co-witnessing / "seats around you" note:** the data IS available — `useHolderIndex()`
returns `ordered: HolderRecord[]` sorted by founder/member number ASC, so neighbours
around a member number are derivable with no new index API. Skipping such a feature
is a scope/doctrine call (new component, leaderboard/privacy-adjacent), not a data
limitation — don't claim the data layer makes it impossible.
