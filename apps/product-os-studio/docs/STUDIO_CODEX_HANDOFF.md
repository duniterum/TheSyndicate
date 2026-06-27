# STUDIO_CODEX_HANDOFF

> For the next agent / engineer (Codex) taking Product OS Studio out of this Replit repo.
> **Read `STATUS.md` and `STUDIO_KNOWN_SIMULATIONS.md` first.** This is a `PROTOTYPE ONLY`,
> `SIMULATED`, frontend-only app. Keep it that way unless a separate, founder-approved
> effort explicitly changes scope.

## What this is

A self-contained Vite + React + TypeScript copy of The Syndicate Product OS prototype,
staged at `apps/product-os-studio/`. The `src/`, `public/`, `index.html`, and
`components.json` are verbatim from the Replit `syndicate` artifact. Only the config files
(`package.json`, `vite.config.ts`, `tsconfig.json`) were rewritten to be **standalone**:
concrete dependency versions (no `catalog:` / `workspace:*`), no `@replit/*` dev plugins,
no workspace project references, no `@assets` alias, `base` honoring `BASE_PATH`.

## Verified standalone

- `npm install` resolves cleanly in isolation.
- `npm run typecheck` (`tsc --noEmit`) passes.
- `npm run build` (vite) produces `dist/` successfully (only benign Radix `"use client"`
  sourcemap warnings).

## Take it to its own GitHub repo

This folder is portable as-is. From the repository root:

```bash
# Option A — copy the folder into a fresh repo
cp -R apps/product-os-studio /path/to/new-repo/      # or move it to repo root as you prefer
cd /path/to/new-repo/product-os-studio
git init && git add . && git commit -m "Import Product OS Studio (prototype, simulated)"
npm install && npm run dev

# Option B — use the portable zip produced with this hand-off
unzip product-os-studio.zip -d /path/to/new-repo/
cd /path/to/new-repo/product-os-studio
npm install && npm run dev
```

The provided zip **excludes** `node_modules/` and `dist/` (regenerate with `npm install`
and `npm run build`). A `.gitignore` is included.

## Architecture pointers (single sources of truth)

| Concern | File | Doc |
|---------|------|-----|
| Routing + shells + gating | `src/App.tsx`, `src/components/role-gate.tsx` | `STUDIO_ROUTE_MAP.md` |
| Member nav + requirements | `src/lib/navigation.ts` | `STUDIO_ROLE_VISIBILITY_MATRIX.md` |
| Public proof IA | `src/lib/surfaces.ts` | `STUDIO_PUBLIC_PROOF_MATRIX.md` |
| Action registry / toolkit | `src/lib/actions.ts` | `STUDIO_ACTION_TOOLKIT_MAP.md` |
| Data / mock values | `src/lib/mock-data.ts`, `src/lib/store.tsx` | `STUDIO_DATA_MODEL_MAP.md` |
| Graph / ledger / registry | `src/lib/protocol-graph.ts`, `src/lib/fire-ledger.ts` | `STUDIO_LEDGER_REGISTER_ARCHITECTURE.md` |
| Brand / press | `src/lib/brand.ts` | (press page) |
| Components / pages | `src/components/`, `src/pages/` | `STUDIO_COMPONENT_MAP.md` |
| What's simulated | — | `STUDIO_KNOWN_SIMULATIONS.md` |

Whenever you add a surface or action, add it to the relevant SoT module
(`navigation.ts` / `surfaces.ts` / `actions.ts`) — pages render *from* these, and a `DEV`
guard logs drift if a nav/surface entry has no page component.

## Hard boundaries — do NOT do these without a separate, founder-approved effort

- Do **not** wire real auth. Roles are `localStorage` flags (`syn-connected`, `syn-seated`,
  `syn-founder`) and are **not security**. Real access control belongs server-side.
- Do **not** add real wallet writes, chain reads, or contract calls. Real deployed addresses
  appear only as `READ-ONLY PRODUCTION PROOF` (static, with read-only explorer links); prototype
  addresses stay mocked with inert links. **Nothing is wired** — a live read is `ADAPTER REQUIRED`.
- Do **not** activate referral / source / claim / SeatRecord. Default source stays
  `ZERO_SOURCE_ID`; these are `V1 CANDIDATE` / `FUTURE`.
- Do **not** wire DEX / LP / market tools. They are `BACKEND REQUIRED` and unverified.
- Do **not** execute burns. Proof of Fire is `CONCEPT ONLY`; supply is retired (never
  minted), never yield, never a price promise.
- Do **not** remove or soften any truth label (`SIMULATED`, `FUTURE`, `NOT LIVE`,
  `PROTOTYPE ONLY`, `BACKEND REQUIRED`, `CONCEPT ONLY`, `READ-ONLY`, `NOT PRODUCTION AUTH`)
  to make a surface look production-ready.
- Respect the brand language guardrails in `brand.ts` (banned terms only allowed inside
  negation disclaimers like "No yield").

## Suggested path toward production (when scope is approved, separately)

1. Replace the simulated session (`store.tsx`) with a real auth provider + server-verified
   sessions; keep `production-auth-note.tsx`'s contract (UI gating ≠ access control).
2. Introduce a real data layer (API/indexer) behind the existing `lib/` selectors so pages
   keep rendering from a single source; swap mock arrays for fetched data surface-by-surface.
3. Wire chain reads/writes only behind verified, official contract addresses, with explicit
   user confirmation and real explorer links — replacing the mocked `contractLayers`.
4. Keep every not-yet-real surface labeled until it is genuinely live.
