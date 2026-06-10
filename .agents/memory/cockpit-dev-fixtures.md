---
name: Cockpit DEV preview fixtures
description: How to safely preview/screenshot connected /my-syndicate member states that need a real wallet, without faking live data.
---

Connected cockpit states (member identity, wake behind you, seats around you, lit/dim artifact memories, rank) are unreachable in the Replit preview because they need a real Avalanche wallet with an indexed purchase history. The safe mechanism to preview/screenshot them:

- Thin wrapper hooks in `src/lib/dev/cockpit-fixtures.ts` (`useCockpitAccount`, `useCockpitHolderIndex`, `useCockpitUserBalances`, `useCockpitArchiveBalances`). Each calls the REAL hook unconditionally, then returns synthetic data ONLY when `import.meta.env.DEV && a recognized ?cockpit=<preset>` URL flag is present. Cockpit components import these instead of the raw hooks.
- Fixture flag is read via `useRouterState(s => s.location.search.cockpit)` — resolves identically on server + client, so no hydration mismatch. The route has no `validateSearch`, so unknown params survive.
- The fixture holder index is built by synthesizing `PurchaseEvent[]` (incl. required `purchaseId`) and feeding them through the REAL `buildHolderIndex`, so shape/ordering/rank/totals derive exactly like production. `seatWallet(i)` must emit lowercase hex (matches `byWallet` `toLowerCase()` keying).

**Why it's production-safe:** deploy runs `vite build` (not the dev server), so `import.meta.env.DEV` is statically `false` → every fixture branch is dead-code-eliminated, presets tree-shaken, `?cockpit` ignored. Off-state wrappers are pure pass-throughs; live data paths untouched.

**Why it lives in `src/lib/dev/` and NOT `src/lib/preview/`:** the CI guard `scripts/check-preview-labels.mjs` scans only `src/lib/preview` + `src/components/preview` and forbids `<StatusPill status="LIVE">` / explorer links there. The dev fixtures intentionally render the cockpit's REAL connected look (LIVE pills, explorer link for the synthetic address), so they must stay outside the guard's roots.

**Truth boundary:** only synthesize the VIEWER'S OWN identity/balances. Never fixture artifact supply/mint status — `useArchiveArtifactReads` stays on the real hook. Never share a fixture screenshot as proof of live state.

**How to apply:** to add a new previewable connected state, add a preset to `PRESETS` (and a `CockpitPreset` value) — do not introduce a second activation path or persist the flag. Sections still on real hooks (CockpitProgression, CockpitMemory, MyArchivePreview) show visitor/loading state under a preset; don't screenshot those alongside the member header.
