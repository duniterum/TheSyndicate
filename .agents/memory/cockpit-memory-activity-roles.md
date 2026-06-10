---
name: /my-syndicate memory vs activity vs chronicle roles
description: The three wallet-history surfaces on /my-syndicate, their distinct roles, and where they now live (one route Memory zone).
---

/my-syndicate deliberately separates THREE wallet-history surfaces by role — do
not collapse them into one, and do not let any second surface grow back into a
parallel "your history" report. The ROLE doctrine is the durable rule; the
LOCATION changed in the narrative-arc restructure (all three now live in the
route's Memory zone, `<Section id="memory">`, grouped under one "Memory" eyebrow):

- **CockpitMemory** ("Since You Were Away") = the SINGLE personal memory SPINE.
  Owns join → latest purchase → total → artifacts (each proof-linked) +
  what-changed-since-last-visit. **Now rendered in the ROUTE Memory zone**
  (moved OUT of MemberCockpit), wrapped in its own `CockpitEmbedProvider` so it
  renders bare. Build member history here, nowhere else.
- **ActivityStrip** (route, was ActivitySection) = DEMOTED compact "recent live
  movement" POINTER, not a report. Max ~3 recent wallet events, single-line
  empty/loading/disconnected states, lighter `surface elevated` (not GlassCard),
  no per-row block number, no own ConnectCTA. Bare div under a `SubEyebrow`
  ("Recent movement"); copy defers history to the spine and full feed to
  /activity. If it regrows into a full event report it re-creates the stacked-
  duplicate-history problem this consolidation removed.
- **ChronicleBlock** (route, was ChronicleSection, "Chronicle") = CANON: the
  permanent block-anchored record + MyPurchaseRouting (unique 70/20/10 receipt).
  Kept separate from the live spine ON PURPOSE — it is canon, not activity. Its
  First/Latest/count rows overlap the spine's data; that overlap is an accepted
  doctrine choice, not a bug to "fix" by folding it in.

(ProtocolHeartbeat is protocol-scope, not wallet history — it lives in the
cockpit Momentum band, distinct from all three above.)

**Binding constraint (my-syndicate-doctrine.test.ts):** the test now pins the
ARC, not the old eyebrow stack — it requires exactly one `<CockpitMemory/>` and
one `<MyPurchaseRouting/>` inside the Memory zone (between `id="memory"` and
`id="proof"`). So the legal consolidation is still demoting the competing
surface (compacting ActivityStrip in place), never rebuilding the spine.
