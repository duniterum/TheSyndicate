# Studio QA / Security / Truth — Bug Audit & Safe-Fix Pass

**Scope:** `apps/product-os-studio/` only. No production code, no contracts, no real
wiring (wallet / RPC / chain / contract / referral / claim / burn / mint / founder).
This was a senior QA + truth/security cleanup pass, not a feature sprint or redesign.

**Baseline:** the original prototype paper (coverage checklist),
`docs/STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md` (production truth),
`docs/STUDIO_COVERAGE_RECONCILIATION.md`, and the current Studio source.

---

## What was inspected

- **Routes & navigation** — `src/App.tsx` route maps (`PAGE_COMPONENTS`,
  `PUBLIC_PAGE_COMPONENTS`), `src/lib/navigation.ts`, `src/lib/surfaces.ts`
  (`PROOF_SURFACES` / `RESOURCE_SURFACES`), public header, More/Modules menu, member
  sidebar, account dropdown, footer, mobile nav, and the `Protected` / gate components.
- **Role visibility** — all four simulated roles (public visitor, connected/not-seated,
  seated member, founder/operator) and how `isConnected` / `isSeated` / `isFounder`
  are derived (`src/lib/store.tsx` persistent flags).
- **Production-truth alignment** — `PRODUCTION_PROOF` constants vs the porting map,
  wallet-gate vocab, MembershipSaleV3 / ZERO_SOURCE_ID, Net USDC Routed, routing split,
  Archive1155 boundaries, SourceRegistry paused state, Proof of Fire, type-only adapters.
- **Fire / Proof of Burn** — `src/lib/fire-ledger.ts`, `src/pages/fire.tsx`,
  `src/pages/public-fire.tsx`, founder review burn flow.
- **Referral / source attribution** — `src/pages/referral.tsx`,
  `src/pages/public-referral-status.tsx`.
- **Archive / NFT memory** — `src/pages/archive.tsx`, `src/pages/public-archive.tsx`.
- **Toolkit / Action Center** — `src/lib/actions.ts`, `src/components/action-card.tsx`,
  `src/pages/toolkit.tsx`, `src/pages/public-toolkit.tsx`.
- **Copy & voice** — visible strings across `src/pages/` and `src/components/`.
- **Security / legal disclosure** — financial-language scan, external-link wiring.
- **Code quality** — TypeScript, duplicated constants, dead/no-op buttons, stale docs.
- **Build hygiene** — tracked artifacts, `.gitignore`.

Scans run: stale "porting map absent" / "no real address" / "no real burn", routing
format consistency, prompt-like public copy, fake-live links, founder-tool visibility,
financial terms (affirmative vs negation), tracked zip/build/cache artifacts.

---

## Safe fixes executed

1. **Founder/operator action leak on the public Toolkit (role-visibility bug) — FIXED.**
   - **File:** `src/pages/public-toolkit.tsx`.
   - **Bug:** role flags persist independently in `localStorage` (`syn-connected`
     default `false`, `syn-seated` default `true`, `syn-founder` default `false`), so
     `isFounder` can be `true` while disconnected. The public `/toolkit` rendered
     categories via `getVisibleCategories(role)`, which reveals the **Operator** category
     whenever `isFounder` is truthy — meaning a disconnected visitor with a stale founder
     flag could see operator/founder actions on a public surface.
   - **Fix:** the public Toolkit now drops the `operator` category unconditionally
     (`.filter((g) => g.def.id !== "operator")`). Operator tools remain available only
     in the connect-gated member/founder console (`/member/toolkit`, `/member/founder-review`).
   - **Non-regression:** the member Toolkit (`src/pages/toolkit.tsx`) is unchanged and
     still uses full role logic; it sits behind the member connect gate, so a founder
     there is legitimately connected.

No other safe fixes were warranted — see deferrals below.

---

## Issues found but NOT a bug (verified clean, no change)

- **Dev "honesty check" false alarm.** `App.tsx` iterates `PROOF_SURFACES` (the 9 proof
  surfaces, all present in `PUBLIC_PAGE_COMPONENTS`). `/toolkit`, `/share`, `/press`,
  `/learn` live in `RESOURCE_SURFACES` and are rendered separately, so they do **not**
  trigger `console.error`. No missing-route bug.
- **External explorer links.** Snowtrace links are built only for `proof: true` layers
  using verbatim porting-map addresses (READ-ONLY PRODUCTION PROOF). Future/mocked layers
  use inert `#`. No fake-live links.
- **Financial language.** Every occurrence of yield / ROI / APY / passive income / MLM /
  downline / upline is a **negation disclaimer** ("no yield", "not an MLM", etc.). No
  affirmative financial promise anywhere.
- **Routing format.** Visible copy consistently uses canonical `70% / 20% / 10%`. The
  bare `70 / 20 / 10` form appears only in code comments and design docs (math notation),
  not user-facing copy.
- **Proof of Fire / burn.** `PROOF_OF_FIRE_001` and `SYN_BURN_ADDRESS` are read-only
  production proof; all burn controls ("Submit Proposal (Simulated)", founder "Approve")
  are toast-only and explicitly simulated. No live "Burn now" control.
- **Dead buttons.** SeatRecord claim, referral "Claim Escrowed Payouts", DEX/LP/swap
  actions, and wallet network-switch are all disabled or toast-only with clear reasons.
- **Referral example link.** `https://syndicate.money/join?source=0xABCD...1234` carries
  V1 CANDIDATE + SIMULATED PROTOTYPE badges and an explicit "Not Live Today / illustrative
  only" disclaimer, and uses an obvious placeholder source id. Adequately marked.
- **Prompt-like terms** ("organism", "return loop", "source truth") exist only in code
  comments and internal property docs — never in rendered/visible copy.

---

## Issues deferred

- **Bundle size.** The client bundle is ~1.43 MB (single chunk) and triggers Vite's
  500 kB warning. Code-splitting (route-level `dynamic import()` / `manualChunks`) would
  fix it but is a build-architecture change beyond a safe QA fix.
- **Radix sourcemap notices** at build time ("Can't resolve original location of error")
  originate inside Radix UI primitives; not actionable in app code.

## Founder decisions needed

- None surfaced by this pass. (Source activation, claim UI, and burn execution remain
  intentionally PAUSED / not-live per the porting map and are correctly represented.)

## Codex-later items (require real wiring — out of scope here)

- Wallet connect + network gating (replace simulated `useWalletGate` states).
- MembershipSaleV3 approve→buy via adapter; live receipt/event reads.
- SourceRegistry / referral activation and claim UI (only if founder un-pauses policy).
- Archive1155 collect/anchor and Proof-of-Fire live burn-event scan via adapters.

## Maintainer note (outside `apps/product-os-studio/`, not changed here)

- `product-os-studio.zip` is tracked at the **repo root**. It is a backup artifact and
  should not be version-controlled; removing it requires a root-level git change outside
  this task's scope. This PR does not add or modify it.

---

## Validation

- `npm run typecheck` → **exit 0**.
- `npm run build` → **exit 0** (only benign Radix `"use client"` sourcemap notices and
  the chunk-size warning above).
- Backup zip regenerated as a deliverable (not committed).
