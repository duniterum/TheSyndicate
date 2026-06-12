---
name: check-live-content production gate
description: check-live-content.mjs validates the DEPLOYED site, not local code — a lone red there is usually production staleness, not a local regression.
---

# check-live-content runs against production, not local

`scripts/check-live-content.mjs` (invoked by `check-release`) fetches the **published deployment** (https://thesyndicate.money), not the local dev server. A failure here (e.g. `/transparency` missing expected live content) can mean the **production site is stale**, NOT that the local diff regressed.

**Why:** the script asserts public claims are actually live on the deployed origin — "don't trust, verify" applied to prod.

**How to apply:** if `check-release` fails ONLY on check-live-content while `tsc` + the full vitest batches are green locally, do not hunt for a local regression. Confirm the failing path is one your diff never touched, then the fix is Publish → Update the deployment and re-run. tsc + vitest (3 OOM-safe batches) remain the trustworthy local signal.
