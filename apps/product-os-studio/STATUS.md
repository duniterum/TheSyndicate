# STATUS — Product OS Studio

**Kind:** Standalone frontend prototype (Vite + React + TypeScript).
**Purpose:** A safe, isolated home for The Syndicate *Product OS Studio* prototype.
**Posture:** `SIMULATED` · `PROTOTYPE ONLY` · `NOT PRODUCTION` · `NOT PRODUCTION AUTH` · `NOT CHAIN TRUTH`.

---

## Safety truths (do not weaken)

- This is **Product OS Studio**. **This is not the live site.**
- **This is not production auth.** Roles are `localStorage` flags, not security.
- **This is not chain truth.** No chain is read; no transaction is sent.
- **This is not smart-contract authority.** No contract is deployed or called.
- **Mock data is not live data.** **Simulated addresses are not live addresses.**
- **Referral / source / claim flows are not active.** Default source stays `ZERO_SOURCE_ID`.
- **DEX / LP links are not wired** and are not verified unless sourced from an official channel.
- **Burn / fire values are simulated** — supply is *retired, never minted*; never yield; never a price promise.

## What is real vs simulated

- **Canonical (accurate) truths** encoded in the prototype: the `70% / 20% / 10%`
  routing split, the `ZERO_SOURCE_ID` default source, the doctrine line
  ("The Syndicate recognizes capital without reducing identity to capital"), and the
  module `LIVE NOW / IN REVIEW / V1 CANDIDATE / FUTURE` status vocabulary.
- **Everything else is SIMULATED prototype data**: balances, addresses, hashes,
  receipts, activity, recognition standing, burns, chronicle entries, member identity.

See `docs/STUDIO_KNOWN_SIMULATIONS.md` for the definitive line-by-line list.

## Isolation status

- This folder is **fully self-contained**: standalone `package.json` (concrete versions,
  no `catalog:` / `workspace:*` references), standalone `vite.config.ts` (no `@replit/*`
  plugins), standalone `tsconfig.json` (no workspace project references).
- It does **not** import from, or get imported by, any production code.
- It can be lifted as-is into another repository's `apps/product-os-studio/`.

## Verification run (in the staging environment)

| Check | Result |
|-------|--------|
| `tsc -p tsconfig.json --noEmit` (typecheck) | ✅ Passed |
| `vite build` (production build) | ✅ Passed (built to `dist/`) |
| Backend / chain reads / API calls | ✅ None present |
| Real wallet writes / real auth | ✅ None present |
| Secrets added | ✅ None |

> Network note: the app makes no API/backend/chain calls. The only outbound requests are
> the Google Fonts stylesheet (`fonts.googleapis.com` / `fonts.gstatic.com`) referenced in
> `index.html`, and external share/social links a user explicitly clicks. Self-host the
> font if a fully offline build is required.

> Build note: the build prints benign Rollup "Can't resolve original location of error"
> sourcemap notices for a few Radix UI files that carry a `"use client"` directive. These
> are warnings, not errors; the build completes successfully.

## Allowed in the Studio (kept, and labeled)

Mock data · `localStorage` role simulation · simulated founder mode · simulated wallet
connection · future modules · prototype-only UI · simulated burn/fire ledger · simulated
toolkit/actions · simulated DEX/LP/import-token previews · simulated referral / Verified
Introduction · simulated SeatRecord · public proof previews · member app · Founder Console
prototype.

## Not allowed (without a separate, founder-approved effort)

Wiring real auth, real wallet writes, real chain reads, real referral/source/claim
activation, real DEX/LP/import execution, real burns, or any live contract — and removing
or softening any truth label to make a surface look production-ready.
# Product OS Studio Import Status

Status: ISOLATED PROTOTYPE IMPORTED LANDING ZONE

Current state:
- Standalone Replit Product OS Studio prototype imported into the existing isolated GitHub subfolder.
- Not connected to production build.
- Not connected to live routes.
- Not connected to contracts.
- Not connected to production auth.
- Not connected to backend.
- Not connected to chain reads.

Allowed now:
- store Replit 2 prototype source
- store screenshots
- store product/design docs
- store mock adapters
- store future production interface contracts
- store migration notes

Not allowed now:
- production deployment
- homepage replacement
- route activation
- real wallet write actions
- real founder/admin controls
- public referral/source activation
- claim UI activation

---
