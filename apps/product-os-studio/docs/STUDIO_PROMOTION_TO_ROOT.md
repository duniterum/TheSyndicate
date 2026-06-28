# Studio → Root (`/`) Promotion Runbook

> Topology / promotion-readiness reference. **No cutover has been executed.** Do
> not change `/` until the founder explicitly approves. This documents the exact
> safe path so the finished Studio can become the primary app at `/`.
>
> **No-action boundary.** This runbook performs no cutover and involves no contracts, wallet writes, referral/source activation, claims, minting, burn execution, founder/admin execution, production auth, or smart contract changes.

## Verified current topology (deploy = the Replit workspace, not GitHub)

| URL | Artifact (router) | Real source built | artifact.toml key fields |
| --- | --- | --- | --- |
| `/` | `artifacts/syndicate` (`@workspace/syndicate`) | its own `src/` (first-class workspace pkg) | `previewPath="/"`, `paths=["/"]`, `BASE_PATH="/"`, `build=pnpm --filter @workspace/syndicate run build`, `publicDir=artifacts/syndicate/dist/public`, `serve=static`, SPA rewrite `/*→/index.html` |
| `/studio/` | `artifacts/product-os-studio` (`@workspace/product-os-studio`) — **launcher only, no app code** | `apps/product-os-studio` (standalone Vite app, **not** a pnpm workspace package) | `previewPath="/studio/"`, `paths=["/studio","/studio/"]`, `BASE_PATH="/studio/"`, `build=pnpm --filter @workspace/product-os-studio run build` (→ `cd ../../apps/product-os-studio && npm ci && npm run build`), `publicDir=apps/product-os-studio/dist`, `serve=static` |

There is **no proxy or file copy**: the launcher's `publicDir` points straight at
`apps/product-os-studio/dist`. Routing is driven purely by each artifact's
`previewPath` + `paths` + the build's Vite `base` (`BASE_PATH`). Publishing
rebuilds **all** artifacts and serves each at its mapped path — it never makes
one path replace another. That is why Studio changes appear at `/studio/` but
never at `/`.

## The cutover mechanism (when approved)

Promotion is a **routing swap**, not a code merge. Recommended = **Option A/D
hybrid**: promote the Studio launcher to `/`, demote the current Syndicate app to
`/classic` (preserved, no deletion, no data loss). Reversible by swapping back.

Apply via the **artifacts skill (`updateArtifact`)** — `artifact.toml` is not
hand-edited:

1. `artifacts/product-os-studio`: `previewPath /studio/ → /`, `paths → ["/"]`, `BASE_PATH /studio/ → /`.
2. `artifacts/syndicate`: `previewPath / → /classic/`, `paths → ["/classic","/classic/"]`, `BASE_PATH / → /classic/`.
3. **Rebuild both** (changing `BASE_PATH` rewrites every asset URL, so both bundles must be rebuilt) and **republish** (autoscale).
4. Verify live with a cache-bust (`?v=`) on `/`, `/classic`, and key sub-routes; cross-check the served `/assets/index-*.js`.

### Options considered
- **A — Route promotion (RECOMMENDED):** swap previewPaths as above. Fast, reversible, no merge, old app safe at `/classic`. Risk: two separate SPAs; deep links to current `/` routes now resolve to Studio.
- **B — Gradual integration:** port Studio modules into `artifacts/syndicate` until `/` is finished. Single codebase, but slow and risks regressions in the live `/` during the port. High drift risk.
- **C — Dual-surface (STATUS QUO / now):** keep `/` = Syndicate, `/studio/` = Studio until approval. Zero risk; founder's concern is the finished work stays "hidden" at `/studio/`.
- **D — Root launcher switch:** repoint the root artifact to serve `apps/product-os-studio/dist`. Mechanically equivalent to A; keep it clean by letting the Studio launcher own `/`.

## Files involved in a future cutover
- `artifacts/product-os-studio/.replit-artifact/artifact.toml` (via `updateArtifact`)
- `artifacts/syndicate/.replit-artifact/artifact.toml` (via `updateArtifact`)
- `apps/product-os-studio/vite.config.ts` — `base` already reads `BASE_PATH`; verify only.
- `apps/product-os-studio/src/App.tsx` — routes via `import.meta.env.BASE_URL`; base-portable. Verify.
- `apps/product-os-studio/src/components/studio-preview-banner.tsx` — remove/replace (the only place that hardcodes `/studio/` framing).
- Brand de-prototyping (preview framing only — **keep** the honest "simulated"/"LIVE READ"/"Prototype total" data-truth labels): artifact `title` "Product OS Studio (Prototype Preview)", the header **STUDIO** badge.

## Pre-cutover gates (founder must approve)
- Final visual **and** functional acceptance of `/studio/`.
- Agreement that `/` becomes the Studio app and the current Syndicate app moves to `/classic`.
- De-prototype the preview framing at root (drop "Prototype Preview" title + STUDIO badge + preview banner).
- Accept that deep links to current `/` routes will change behavior (add redirects if any must be preserved).
- Read-only posture, `syn-*` role-gating, and the live-read wallet layer confirmed production-safe under root exposure. **No** contract/wallet-write/referral-activation changes are part of cutover.

## Risks
- `BASE_PATH` change ⇒ full rebuild of both apps; any non-`BASE_URL`-relative absolute path would 404.
- Shipping "Prototype Preview" framing at `/` would mislead users — de-prototype first.
- Two independent SPAs at `/` and `/classic` (no shared session); current `/` deep links now hit Studio.
- Autoscale republish + edge-cache propagation — always cache-bust when verifying.

## Rollback
Swap the two `previewPath`/`paths`/`BASE_PATH` sets back via `updateArtifact`, rebuild, republish. The `/classic` app is the untouched current root build.
