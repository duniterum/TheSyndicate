---
name: my-syndicate doctrine test is route-source string-matching
description: What src/lib/__tests__/my-syndicate-doctrine.test.ts scans and why moving a /my-syndicate surface between files can break it
---

`src/lib/__tests__/my-syndicate-doctrine.test.ts` does NOT render anything — it
`readFileSync`s source files and string-scans them. It now reads BOTH
`src/routes/my-syndicate.tsx` AND
`src/components/syndicate/cockpit/MemberCockpit.tsx`, because the route delegates
its seat/assets/artifacts to `<MemberCockpit />`.

**What it locks (current):**
- Route renders exactly one `<MemberCockpit />`, above every route-level eyebrow.
- Route no longer inlines the retired v2 layout (`label="My Seat"`/`"My Assets"`,
  `<SeatRecordPanel />`, `<MyArchivePreview />`) — those are asserted ABSENT.
- Route-level eyebrows in order: Activity → What's Sealing Next → My Chronicle →
  My Growth → My Horizon → Protocol Context.
- MemberCockpit composes identity (`id="my-seat"` + `<CockpitHeader>`), wake
  (`<WakeBehindYou/>`), progression, memory, collector. Proof = one
  `<CockpitProof/>` in Protocol Context. My Growth stays PENDING (referral/rep
  collapsed in `<details>`).
- Banlist: financial words in route + gamification words (XP/score/leaderboard/
  spend-ladder/next rank) in route AND MemberCockpit. Both scans strip comments
  first so doctrine notes can name banned words.

**Why this matters:** because it is source-string-matching across TWO files, the
durable trap is that **moving a cockpit surface between `my-syndicate.tsx` and
`MemberCockpit.tsx` (or renaming a component/eyebrow) can break the scan even
when the rendered page is correct.** When that happens the fix is to update the
scanned source set / token in the test, not to revert the move.

**History:** the ~5 long-standing failures (old flat-route `label="My Seat"` /
`<SeatRecordPanel>` assertions) were the stale remnants of the pre-cockpit
layout; they have been rewritten to the composition checks above. They are no
longer "ignore me" failures — a failure here now means a real drift.
