---
name: my-syndicate doctrine test is route-source string-matching
description: What my-syndicate-doctrine.test.ts scans (now the NARRATIVE ARC order) and the comment-strip gotcha that can inflate tag counts
---

`src/lib/__tests__/my-syndicate-doctrine.test.ts` does NOT render — it
`readFileSync`s `src/routes/my-syndicate.tsx` AND
`src/components/syndicate/cockpit/MemberCockpit.tsx` and string-scans them. It
now pins the NARRATIVE ARC, not the old section stack.

**What it locks (current):**
- Cockpit arc ORDER (indexOf-in-sequence, in MemberCockpit): `id="my-seat"` →
  CockpitHeader → WakeBehindYou → SeatsAroundYou → CockpitPortfolio →
  CockpitCollector → CockpitProgression → CockpitSealingNext → ProtocolHeartbeat
  → LivePulseStrip → CockpitActionRail. (Identity→Place→Ownership→Momentum→Action.)
- Route arc-tail ORDER: `id="memory"` → `id="proof"` → `id="parked"`, all below
  the single `<MemberCockpit/>`.
- Memory zone owns exactly one `<CockpitMemory/>` + one `<MyPurchaseRouting/>`
  (between #memory and #proof). Proof = one `<CockpitProof/>` promoted ABOVE
  #parked. Referral/Reputation parked inside a `<details>` in #parked, status
  PENDING ("What's Building").
- ONE action dock: CockpitActionRail once; the CockpitHeader function body must
  NOT contain a gradient-gold CTA linking to Buy/Join.
- Proof anchor: cockpit has `href="#proof"` + "live on-chain read" copy near identity.
- Banlist (financial in route) + gamification (route AND cockpit). Retired v2
  layout absent; no legacy Genesis #10/#100/#500; PageShell hideHeader + title.

**Comment-strip gotcha (cost a red):** the structural assertions count/scan
COMMENT-STRIPPED source. Both ROUTE and COCKPIT are passed through `stripComments`
at the TOP now, because a code comment mentioning a self-closing tag (e.g.
`<MemberCockpit/>` in the file header) inflates the `.match(/<Tag\s*\/>/g)` count
and breaks the "rendered once" checks. Any NEW structural assertion must scan
stripped source; mentioning a tag in a comment is then safe.

**Durable trap:** still source-string-matching across TWO files — moving a
surface between `my-syndicate.tsx` and `MemberCockpit.tsx`, renaming a component,
or changing a section `id=`/eyebrow can break the scan even when the rendered
page is correct. Fix the token in the test, not the move.
