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
- **Mock data is not live data.** Real deployed constants appear only as
  `READ-ONLY PRODUCTION PROOF` (static, inert, with read-only explorer links); **nothing is wired.**
- **Referral / source / claim flows are not active.** Default source stays `ZERO_SOURCE_ID`.
- **DEX / LP links are not wired** and are not verified unless sourced from an official channel.
- **Burn / fire values are simulated** — supply is *retired, never minted*; never yield; never a price promise.

## What is real vs simulated

- **Canonical (accurate) truths** encoded in the prototype: the `70% / 20% / 10%`
  routing split, the `ZERO_SOURCE_ID` default source, the doctrine line
  ("The Syndicate recognizes capital without reducing identity to capital"), and the
  module `LIVE NOW / IN REVIEW / V1 CANDIDATE / FUTURE` status vocabulary.
- **Real deployed constants** from the porting map (token / sale / registry / archive /
  routing wallets / burn address + `PROOF_OF_FIRE_001`) are shown as `READ-ONLY PRODUCTION
  PROOF` — static and inert, with read-only explorer links. **Nothing is wired.**
- **Everything else is SIMULATED prototype data**: balances, prototype addresses, hashes,
  receipts, activity, recognition standing, the burn aggregate, chronicle entries, member identity.

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
