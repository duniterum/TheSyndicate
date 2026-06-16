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
- **Not rendered yet.** Nothing imports it → rollback = delete the 2 files, zero runtime impact.

## Next sprint (wiring) gotcha
Build ONE adapter that maps cockpit hooks → `NextActionContext` (`isConnected`, `identityLoading`,
`isMember`, `cumulativeUsdc`, `ownsArtifacts`) so each surface doesn't re-interpret member/collector/
loading state. Then refactor `CockpitNextMove` (and later Header/RouteFinalCTA) to consume the plan.
