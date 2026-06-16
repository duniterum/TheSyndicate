---
name: Next Best Action selector
description: The pure journey backbone (Identity State → Next Best Action → Protocol Actions → CTA) and the non-obvious rulings frozen into next-best-action.ts.
---

# Next Best Action selector (`src/lib/next-best-action.ts`)

The protocol's journey decision logic, extracted out of `CockpitNextMove`'s hardcoded
ternaries into ONE pure, non-rendering selector. Backbone:
**Identity State → Next Best Action → Protocol Actions → CTA/UI** (state and ordering
decided here; labels/destinations come from `protocol-actions.ts` at render time).

## Frozen rulings (the non-obvious parts)

- **Emittable status is STRICTER than the registry's `isLiveProtocolAction`.** The selector's
  `EMITTABLE_STATUSES = ["live","live-unaudited"]` deliberately **excludes `preview`** (so
  `mintPatronSeal` is never recommended), per the sprint rule "LIVE or LIVE-UNAUDITED only".
  `isLiveProtocolAction()` admits `preview` — do NOT reuse it as the emit gate.
  **Why:** preview = on-chain-gated, not a safe blind recommendation.
- **Connect is the IDENTITY/wallet layer, NOT a `ProtocolActionId`.** A disconnected visitor
  surfaces `requiresConnect: true` alongside `joinMembership`; never add an `enterSyndicate`
  action to `protocol-actions.ts`.
- **`joinMembership` is one id with two copy faces.** Non-member → "Join The Syndicate",
  member → "Buy More SYN". The selector carries this as `joinIntent` ("join"|"buy-more"|"none");
  it never changes the emitted id. This is the extraction of CockpitNextMove's `record ? … : …`.
- **Collector & higher-rank are OVERLAYS, not exclusive states.** `IdentityState` is a 4-value
  membership axis (visitor / identity-loading / connected-non-member / member); `isCollector`
  (owns Archive1155) and `atTopRank` (`rankForUsdc(usdc).next === null`) are flags. They co-occur
  (a member can collect and sit at top tier), so flattening them into states creates false precedence.
- **Membership spine orders the journey; the collector overlay only GUARANTEES PRESENCE.**
  For a non-member collector, `mintFirstSignal` is appended after the join-first spine — so tests
  assert collector-action *presence*, not their standalone relative order.
- **`identity-loading` emits `[]`** (neutral), never join/buy-more — never flash a CTA at a member
  whose holder-index record is still resolving.

## Safety / placement
- Lives in `src/lib/` → **outside** the `protocol-actions-guard.test.ts` no-import scan (which only
  covers `src/components` + `src/routes`). So importing `PROTOCOL_ACTIONS`/`rankForUsdc` here is SAFE.
- Pure: no React/hooks/chain reads/JSX/side-effects. Final output is `dedupe(...).filter(isEmittableAction)`
  so a mis-authored journey constant can never leak a non-emittable id.
- **NOW LIVE / rendered.** `CockpitNextMove` consumes it via `useNextActionContext()` + `selectNextActions()` (see Adapter section) — it is the live journey engine behind the cockpit "Your next move". (Superseded the earlier "not rendered yet" note.) Rollback = revert CockpitNextMove + delete the lib/adapter files.

## Adapter (DONE — Foundation V2) + next-consumer gotchas
The canonical adapter now exists and `CockpitNextMove` is its FIRST and ONLY consumer:
- **Pure builder** `buildNextActionContext(inputs)` in `src/lib/next-action-context.ts` (no React) is THE single
  place that interprets the dimensions: `isMember = record != null`, `cumulativeUsdc = record?.cumulativeUsdc ?? 0`.
  Hook `useNextActionContext({includeCollector?})` in `src/lib/use-next-action-context.ts` gathers reads and delegates.
- **Collector is OPT-IN.** Default `includeCollector:false` passes an EMPTY id list to `useCockpitArchiveBalances`,
  which keeps `useArchiveBalances` disabled (`enabled = address && ids.length>0`) → **NO new chain read**. A future
  consumer that needs the collector overlay MUST pass `includeCollector:true` (and ideally already do an archive read).
- **Adapter reads through the DEV cockpit fixture wrappers** (`useCockpitAccount/HolderIndex/ArchiveBalances`), so it
  inherits the SSR mounted-gate + `?cockpit=` preview. **Why:** byte-identical behavior for the cockpit consumer.
  Gap: a non-cockpit consumer (Header/RouteFinalCTA) may want raw hooks instead — split only when a 2nd consumer proves it.
- **Equivalence map (frozen):** primary step `if(plan.state==="identity-loading") / else if(plan.state!=="member") /
  else if(next) / else` == old `isConnected&&loading / !record / next / else`; `ctaLabel` from `plan.joinIntent`
  (none→"Reading seat…", buy-more→"Buy More SYN", join→"Join The Syndicate"); Chronicle card uses `ctx.isMember`.
- **CockpitNextMove's onward-move grids are editorial nav cards (NOT selector-driven)** — they have no matching
  `ProtocolActionId` (Recognition→/ranks, Package→/join, Artifacts→#my-artifacts, Chronicle→#memory). Tier-name/delta
  copy stays render-coupled (selector emits state, not labels). The consumer never renders `plan.actions`/`isCollector`.
- Rollback = revert CockpitNextMove + delete the 2 lib files + the adapter test; selector untouched.
