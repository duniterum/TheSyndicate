---
name: Protocol event pipeline
description: The one canonical event path, where enrichment happens, and the full lockstep surface you must edit to add a ProtocolEventKind.
---

# Canonical Protocol Event Pipeline

One path, additive: raw on-chain log → `enrichEvent()` → `CanonicalProtocolEvent`
→ metric effects → Activity → Chronicle **candidate** → recommended surfaces.

- `protocol-event-registry.ts` is the **pure data leaf** (imports only syndicate-config + metric ids): `ProtocolEventKind`, `ProtocolEventCategory`, `CATEGORY_FOR_KIND`, `EVENT_METRIC_EFFECTS`, `chronicleEligibleForKind`, `RECOMMENDED_SURFACES_FOR_CATEGORY`, `FUTURE_EVENT_NAMESPACES`.
- `enrichEvent(base, ctx?)` in `protocol-events.ts` is the **ONE** place a base event becomes canonical. `CanonicalProtocolEvent` is assignable to `ProtocolEvent`, so consumers are untouched. Burns: `amountUsd`/`amount` UNDEFINED (SYN, no USD), `status` forced `PARTIAL` until the burn scan is gapless. `verificationLink` is `""` when the tx hash fails `isValidTxHash`.
- `chronicleEligibleForKind` is **advisory only** — never auto-feeds Chronicle. Person-subject kinds (`purchase`/`new-member`/`rank-reached`) are NEVER eligible (Chronicle clause 6 forbids wallet/member subjects).
- Reserved `FUTURE_EVENT_NAMESPACES` are deliberately kept OUT of `ProtocolEventKind` so no consumer must handle them; all PENDING, none scanned.
- Internal QA surface: `/labs/protocol-events` (noindex) renders every kind + future namespaces + known-address table + live `useProtocolEvents()` sample. Sibling of `/labs/protocol-intelligence` (metric workbench).

## Adding a new ProtocolEventKind = lockstep across MANY files
**Why:** tsc only flags the exhaustive `Record<ProtocolEventKind, …>` maps; the
rest are runtime test arrays/snapshots that fail only when you run vitest. Miss
one and the build looks green locally but a test or a surface silently breaks.

**How to apply — touch ALL of these when adding a kind:**
- Exhaustive `Record<ProtocolEventKind|ProtocolEvent["kind"], …>` maps (tsc catches): `CATEGORY_FOR_KIND` + `EVENT_METRIC_EFFECTS` (registry); `KIND_ICON` + `KIND_LABEL` (ProtocolEventsFeed); `WHY_IT_MATTERS` (ActivityHeartbeat); `CATEGORY` (NotificationBell). There are FOUR component/registry files, not one.
- `activity-filters.ts`: `ActivityFilterKey` + group mapping + `ActivitySummary` field + `summarizeActivity` branch.
- Test arrays/snapshots (vitest catches, NOT tsc): `ALL_KINDS` (activity-verify-pill), `KINDS` (activity-proof-links), the **inline snapshot** in activity-verify-pill-matrix (update with `vitest -u`), and activity-filters key array.

## getLogs typing gotcha (scanner template)
Annotating a scan helper's return as `Awaited<ReturnType<typeof publicClient.getLogs>>`
**loses the decoded `.args`** (resolves to the non-event overload). Make the helper
generic with a typed fetch callback instead — `scan<T>(client, from, tip, fetchChunk: (s,e)=>Promise<T[]>)`
calling `getLogs({event, args, …})` inside the callback. Mirror `onchain-events.ts`.
