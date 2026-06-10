---
name: /my-syndicate narrative arc structure
description: The arc the /my-syndicate page reads as, and which file owns which stage
---

/my-syndicate is ONE narrative arc, split across two files (not a stack of
report sections):

- **MemberCockpit.tsx** — one bordered control surface; `ArcBand` helper renders
  each chapter eyebrow: Identity (CockpitHeader) → Place (WakeBehindYou +
  SeatsAroundYou, 2-col) → Ownership (CockpitPortfolio + CockpitCollector) →
  Momentum (CockpitProgression + CockpitSealingNext + ProtocolHeartbeat +
  LivePulseStrip) → Action (CockpitActionRail, the ONE dock).
- **my-syndicate.tsx route** (below the cockpit): Memory (`id="memory"`:
  CockpitMemory spine + ActivityStrip pointer + ChronicleBlock canon +
  MyPurchaseRouting) → Proof (`id="proof"`: CockpitProof + links, promoted above
  pending) → Building (`id="parked"`: Growth + Horizon merged into one collapsed
  PENDING `<details>`).

**Why:** restructured from a 3-column "flight deck" into a single read so the
page tells one story instead of stacking reports. Action collapses to ONE dock
(the header's duplicate gradient Join CTA was removed). Proof sits beside the
values it backs (identity `href="#proof"` anchor) and above the parked tail.

**How to apply:** embed-aware children (Wake/Seats/Progression/Heartbeat/
LivePulse in the cockpit; CockpitMemory in the route) MUST stay inside a
`CockpitEmbedProvider` to render bare. Keep anchors `id="my-assets"` /
`id="my-artifacts"` (nav targets). `CockpitSealingNext` lives in the cockpit
Momentum band (moved out of the route); `CockpitMemory` lives in the route
Memory zone (moved out of the cockpit). Arc order is enforced by
my-syndicate-doctrine.test.ts.
