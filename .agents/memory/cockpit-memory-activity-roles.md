---
name: /my-syndicate memory vs activity vs chronicle roles
description: The three wallet-history surfaces on /my-syndicate, their distinct roles, and why ActivitySection can only be compacted-in-place (not removed/moved).
---

/my-syndicate deliberately separates THREE wallet-history surfaces by role —
do not collapse them into one, and do not let any second surface grow back into
a parallel "your history" report:

- **CockpitMemory** (in MemberCockpit, "Since You Were Away" section) = the
  SINGLE personal memory SPINE. PersonalMemoryTimeline owns join → latest
  purchase → total purchases → artifacts, each proof-linked; SinceLastVisitStory
  + WhatChangedForYou own "what changed since last visit". This is the one home
  for member history. Keep it; build history here, nowhere else.
- **ProtocolHeartbeat** = protocol-alive headline (latest PROTOCOL event, any
  member). Protocol scope, not wallet history. Distinct from the spine.
- **ActivitySection** (route) = DEMOTED compact "recent live movement" strip —
  a POINTER, not a report. Max ~3 recent wallet events, single-line
  empty/loading/disconnected states, lighter `surface elevated` (not GlassCard),
  no per-row block number, no own ConnectCTA (the cockpit header owns connect).
  Its copy must defer history to the spine ("…in Since You Were Away above") and
  the full feed to /activity. If it ever regrows into a full event report it
  re-creates the stacked-duplicate-history problem this consolidation removed.
- **ChronicleSection** (route, "My Chronicle") = CANON: the permanent
  block-anchored record + MyPurchaseRouting (unique 70/20/10 receipt). Kept
  separate from the live spine ON PURPOSE — it is canon, not activity. Its
  First/Latest/count rows overlap the spine's data, but that overlap is an
  accepted doctrine choice, not a bug to "fix" by folding it in.

**Binding constraint (my-syndicate-doctrine.test.ts scans route + MemberCockpit):**
the route MUST keep `label="Activity"` and the canonical eyebrow order
(Activity → What's Sealing Next → My Chronicle → My Growth → My Horizon →
Protocol Context), all below `<MemberCockpit/>`; MyPurchaseRouting exactly once
inside My Chronicle. So ActivitySection cannot be removed, renamed, or moved —
the only legal consolidation is compacting its BODY in place. The spine itself
needs no edits to satisfy "one memory spine"; consolidation = demoting the
competing surface, not rebuilding CockpitMemory.
