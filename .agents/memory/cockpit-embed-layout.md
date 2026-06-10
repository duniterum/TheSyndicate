---
name: Cockpit embed layout doctrine
description: Rules for the /my-syndicate cockpit OS — single mobile bottom bar, embed-aware surfaces, and the ?cockpit fixture blind spot for real-wagmi surfaces.
---

# Cockpit embed / layout doctrine

## One mobile bottom bar, site-wide
The global `MobileJoinBar` (mounted once in `__root.tsx` after `<Outlet/>`) is the
ONLY `md:hidden fixed bottom-0 z-40` element. It self-adapts its CTA per route via
`configForRoute` and reserves space through PageShell's `pb-20`.
**Rule:** a route/cockpit must NOT add its own second fixed bottom bar — two elements
at the same slot + z-index collide; the later-painted one occludes the other (dead UI).
**Why:** the cockpit rebuild added a `MobileActionDock` that was fully hidden under the
global bar. Removed it; rely on the global bar (it's richer: theme toggle + Verify +
next-member context). To customize per route, prefer extending `configForRoute`, not a
new bar.

## Embed-aware surfaces use CockpitSection, not Section
Any surface composed into the cockpit flight-deck grid renders inside
`CockpitEmbedProvider`. It must read `useCockpitEmbed()` and render via `CockpitSection`
(bare `<div>` when embedded; full `<Section>` band standalone) so it lives in a grid
cell instead of stacking as a full-width report row. Pattern: `className={embedded ? "" : "<standalone-pad>"}`
and drop the big `SectionHeader` for a compact header when embedded.

## ?cockpit fixtures cannot see real-wagmi-only surfaces
`?cockpit=memberN` fixtures (DEV) inject cockpit context but do NOT connect a real
wallet. Surfaces that gate on real `useAccount()` (e.g. `WhatChangedForYou`, rendered
by `CockpitMemory`) return null in every fixture screenshot — so a non-embed-aware
Section band there is invisible to fixture verification.
**How to apply:** when auditing the cockpit, manually check every child that uses real
wagmi `useAccount`/`isConnected` for embed-awareness; don't trust fixture screenshots to
surface them. The architect (git-diff review) is the reliable catch for this class.
