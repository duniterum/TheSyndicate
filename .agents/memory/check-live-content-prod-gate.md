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

## Two recurring traps in post-publish verification

**1. `/transparency` "PREVIEW" FAIL is a FALSE POSITIVE.** `check-live-content.mjs` does a case-insensitive substring match, and `/transparency` imports `PreviewBanner` from `PreviewPrimitives`, so the built page emits a `<link rel="modulepreload" href="/assets/PreviewPrimitives-*.js">` — "preview" lives only in that **code-split chunk filename**, not in any visible copy. Case-sensitive `rg -a -o "PREVIEW"` over the live HTML returns zero. Don't chase it; the labeled simulated treasury ledger is intentional and doctrine-legal.

**2. "Stale homepage" usually means the publish is behind the code, not a deploy bug.** `src/lib/build-stamp.ts` is a **manual constant** — it is NOT auto-bumped per commit/deploy, and a feature commit can land *without* bumping it. So a June-9 stamp + a homepage missing this-session's content does not prove a broken deploy. Diagnose with `git --no-optional-locks log --oneline`: find the last `Published your App` commit and check whether the feature commits sit *after* it. If they do, the work is committed but unpublished → fix is **Publish → Update** (and bump `build-stamp.ts` so the next stamp is meaningful). Confirm with the local-dev-SSR vs prod-SSR diff: `curl -s --compressed <local> | rg -a -i <marker>` vs the same against prod. NOTE: dehydrated SSR HTML contains a null byte → always pass `rg -a` or rg silently bails to "binary file matches".
