---
name: check-live-content production gate
description: A FAMILY of check-*.mjs scripts fetch the DEPLOYED site over HTTP, not local code — a lone red there is usually production staleness, not a local regression.
---

# Some check-*.mjs scripts run against production, not local

These scripts `fetch()` a **published deployment**, NOT the local dev server / source:
- `scripts/check-live-content.mjs` (invoked by `check-release`) → https://thesyndicate.money
- `scripts/check-homepage-content.mjs` (NOT in `check-release`; run manually) → TARGETS = thesyndicate.money + two lovable preview URLs. Asserts homepage parity phrases ("Flywheel", "Protocol Economy", "70% Vault", "70 / 20 / 10", "seat is the anchor", "Programmatic Vault") + stale-leak bans ("Live Protocol Pulse", "EP #", "Compounder", etc.). Its output groups = one per deployed TARGET.

A failure (missing required phrase, or a stale-leak phrase still present) can mean the **deployed origin is stale / not yet republished**, NOT that the local diff regressed.

**Why:** these assert public claims are actually live on the deployed origin — "don't trust, verify" applied to prod. The real local gate is `check-release.mjs` = tsc + full vitest + execution/explorer/health/visitor-vocabulary/live-state checks. `check-homepage-content`, `check-attention-hierarchy`, `check-loop-ownership`, `check-ownership-wording` are NOT in that gate (homepage pins are enforced by vitest instead).

**How to apply:** if one of these prod-fetch scripts is red while `tsc` + the full vitest batches are green locally, do not hunt for a local regression. Confirm the failing phrases are ones your local diff actually serves (grep your component), then the fix is Publish → Update the deployment and re-run. tsc + vitest (3 OOM-safe batches) + visitor-vocabulary + ownership-wording remain the trustworthy local signals.
