# The Syndicate Release Handoff

This repository is the canonical implementation workspace for The Syndicate.

Before synchronization, Replit publish, patch handoff, or production release
work, read `docs/OPERATIONAL_MEMORY_LEDGER.md`. That ledger records GitHub,
Replit, sandbox, credential, desktop-export, and patch-file lessons that must
not be rediscovered.

Local validation is not delivery. A release handoff must say separately whether
the batch is local-only, pushed to GitHub main, pulled by Replit, and verified
on production. Patch-file handoff is a failure mode until authenticated sync
paths such as the GitHub Desktop clone, GitHub connector/API, GitHub CLI,
SSH/token Git, and Replit/GitHub import path have been exhausted.

Current authority beats remembered authority. Before any production publish,
registry update, activation claim, or ceremony-adjacent public copy change,
rebuild current truth from GitHub, Replit, production, and any relevant
on-chain readbacks. Previous reports explain lineage; they are not proof that
the live site or contract state is still current.

## Package Manager

Use npm for validation and deployment commands:

```bash
npm install
npm run check-release
```

The Replit run button still uses Bun for the dev server (`bun run dev -- --port 5000 --host 0.0.0.0`), and `bun.lock` is retained for Replit parity. Production deployment uses `npm run build`.

## Required Local Checks

Run the canonical release gate:

```bash
npm run check-release
```

That command runs:

- `npm run typecheck`
- `npm test`
- `npm run build`
- execution gates
- explorer URL shape/reachability guard
- explorer canonical guard
- protocol health
- visitor vocabulary guard
- live-state truth guard

Useful additional checks:

```bash
npm run check-preview-labels
npm run check-ownership-wording
npm run check-archive-abi
```

On Windows machines with custom certificate stores, set this before network-backed checks if needed:

```powershell
$env:NODE_OPTIONS='--use-system-ca'
```

`npm run check-release` sets this automatically for its child checks.

## Packaging A Source ZIP

Create a source handoff ZIP from the repository root. Include source, docs, contracts, public assets, config, scripts, and lockfiles.

Exclude generated or local-only folders:

- `node_modules`
- `.output`
- `.git`
- `.npm-cache`
- `reports`
- existing `*.zip` files

Recommended PowerShell packaging command:

```powershell
$dest = "artifacts\the-syndicate-source-release.zip"
if (Test-Path $dest) { Remove-Item $dest }
$exclude = @('\node_modules\','\.output\','\.git\','\.npm-cache\','\reports\')
$files = Get-ChildItem -Force -Recurse |
  Where-Object {
    $p = $_.FullName.Substring((Get-Location).Path.Length)
    -not $_.PSIsContainer -and
    $_.Extension -ne '.zip' -and
    -not ($exclude | Where-Object { $p -like "*$_*" })
  }
Compress-Archive -Path $files.FullName -DestinationPath $dest -Force
```

## Replit Upload / Import

Preferred path:

1. Push the validated repository state to GitHub.
2. In Replit, import or reconnect the GitHub repository.
3. Keep `.replit`, `replit.nix`, `bun.lock`, `package.json`, `vite.config.ts`, and `tsconfig.json`.
4. Install dependencies if Replit does not do it automatically.
5. Use the Replit run button for dev preview.
6. For deployment, use the configured Replit deployment command: `npm run build`, then `node .output/server/index.mjs`.

ZIP path:

1. Upload the source ZIP.
2. Extract it so `package.json`, `.replit`, `src`, `public`, `docs`, `contracts`, and `scripts` are at the project root.
3. Do not upload `node_modules`; let Replit install dependencies.
4. Run `npm install` if needed.
5. Run `npm run check-release`.
6. Deploy with the existing Replit deployment settings.

## Current Known Warnings

- Vite reports a large client bundle for the main app chunk.
- Vite/Rollup logs dependency-level `"use client"` directive warnings from packages such as `wagmi`, Radix, and TanStack Query.
- TanStack Start dependencies may emit `createServerFn().inputValidator()` deprecation warnings.
- Explorer CDNs may return `403` to automated probes; this is treated as reachable-but-protected, not a broken URL.
- `check-protocol-health` currently reports non-blocking warnings for the pending/mock indexer probe, historical docs notes, and intentional manual explorer URLs in repair/lab surfaces.

## Release Doctrine

- SYN is the V1 membership seat.
- Archive1155 artifacts are collectible protocol memories, not seats.
- Future systems stay `PENDING`, `RESERVED`, or `REQUIRES CONTRACT` until live contracts and reads exist.
- Do not fake balances, claims, commissions, contract addresses, receipts, or success states.
- Membership receipts must show seat/SYN/USDC/routing/proof truth.
- Artifact receipts must stay collectible-only and must not imply membership or financial rights.
