---
name: my-syndicate doctrine test is route-source string-matching
description: Why src/lib/__tests__/my-syndicate-doctrine.test.ts has standing failures and when to ignore vs fix them
---

`src/lib/__tests__/my-syndicate-doctrine.test.ts` does NOT render anything — it
`readFileSync`s `src/routes/my-syndicate.tsx` and string-scans for section
eyebrows (`label="My Seat"` …), `<SeatRecordPanel />`, `<MyArchivePreview />`, etc.

The route was refactored to delegate its seat/assets/artifacts sections into
`<MemberCockpit />` (and `MemberCockpit` encapsulates `MyArchivePreview` + the
seat hero + action rail). So those literal elements/eyebrows no longer appear in
the route source, and ~5 of these assertions fail as STALE — not as regressions.

**Why:** the test locks an older flat-route structure that predates the
MemberCockpit consolidation.
**How to apply:** if you see these specific failures after touching /my-syndicate,
do not "fix" the route to satisfy them. They are stale. The real fix is to rewrite
the test to validate rendered structure across component composition (render
MemberCockpit, not grep the route file). Treat as flag-only unless explicitly
asked to repair the test.
