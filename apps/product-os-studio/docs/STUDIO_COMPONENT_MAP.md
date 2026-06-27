# STUDIO_COMPONENT_MAP

> `PROTOTYPE ONLY` · `SIMULATED`. Frontend-only. No component performs a real network,
> wallet, or chain operation.

## `src/lib/` — single sources of truth

| Module | Role |
|--------|------|
| `navigation.ts` | **`MEMBER_NAV`** — the single source for member nav, route generation, and route requirements. Defines `RouteRequirement = "connected" \| "seated" \| "founder"`. |
| `surfaces.ts` | **`PROOF_SURFACES`** + `RESOURCE_SURFACES` — the public proof layer IA; maps each public surface to its member counterpart (`memberPath`). |
| `actions.ts` | **`ACTION_REGISTRY`** + `ACTION_CATEGORIES` — every protocol action, role-aware and truth-labeled, with `canAccessAction` / `getVisibleCategories` selectors. |
| `mock-data.ts` | **`MOCK_DATA`** + `ROUTING_SPLIT` + `routeUsdc()` — all simulated values; canonical routing math. |
| `protocol-graph.ts` | The "nervous system": `PIPELINE`, `CLASSIFICATIONS`, `PROTOCOL_EVENTS`, `CHRONICLE`, `RECOGNITION_BOARD`, public-safe projections, and the **Truth-Drift Detector**. |
| `fire-ledger.ts` | **`FIRE_LEDGER`** — Proof of Fire projection over `fire`-classified events; burn summary selectors. Aggregate simulated; the one verified record (`PROOF_OF_FIRE_001`) is READ-ONLY PRODUCTION PROOF with a real tx hash + read-only explorer link; candidate entries stay simulated (no hashes). |
| `brand.ts` | **`BRAND`** — press/brand SoT: palette, typography, channels, facts, approved/banned language, OG concepts. |
| `store.tsx` | **`AppProvider` / `useApp`** — simulated session + preferences in React context, persisted to `localStorage`. |
| `utils.ts` | `cn()` class-merge helper. |

## `src/components/` — app components

| Component | Role |
|-----------|------|
| `public-header.tsx` | Public top nav; "Proof" menu derived from `surfaces.ts`. |
| `public-footer.tsx` | Public footer; links derived from surfaces. |
| `protocol-hero.tsx` | Flagship hero used on the public home. |
| `proof-card.tsx` | Reusable proof/stat card. |
| `action-card.tsx` | Renders a single `ProtocolAction` (status + safety labels + lock state). |
| `connect-cta.tsx` | "Connect to view your personal view" CTA (simulated connect). |
| `member-sigil.tsx` | Deterministic identity sigil from a seed (no PII). |
| `notification-center.tsx` | Member notification dropdown (simulated `MOCK_DATA.notifications`). |
| `contract-copy-row.tsx` | Copy-to-clipboard row for (mocked) addresses; explorer links inert. |
| `external-link-warning.tsx` | Confirmation/warning before opening any external tool. |
| `production-auth-note.tsx` | The **"NOT PRODUCTION AUTH"** explainer reused across gates/settings. |
| `role-gate.tsx` | `Protected`, `FounderGate`, `SeatLockedGate` render-time gates. |
| `share-dialog.tsx` | Prototype share-card dialog (`SharePayload`); opens public intents, generates no image. |

## `src/components/ui/` — design primitives

shadcn/ui ("new-york" style) primitives over Radix UI + Tailwind v4, including:
`button`, `card`, `dialog`, `dropdown-menu`, `select`, `tabs`, `table`, `tooltip`,
`badge`, `accordion`, `sheet`, `sidebar`, `chart`, `sonner`/`toast`/`toaster`,
`status-badge` (the **single status-label vocabulary**: `LIVE NOW`, `READ-ONLY`,
`IN REVIEW`, `V1 CANDIDATE`, `FUTURE`, `SIMULATED PROTOTYPE`, etc.) and the full set of
form / layout primitives. These are presentational only.

## `src/pages/`

- **Public:** `public-home`, `public-activity`, `public-economy`, `public-registry`,
  `public-recognition`, `public-referral-status`, `public-evolution`, `public-chronicle`,
  `public-archive`, `public-fire`, `public-toolkit`, `learn`, `press`, `share`.
- **Member:** `member-home`, `join`, `my-syndicate`, `toolkit`, `wallet`, `activity`,
  `transparency`, `registry`, `evolution`, `chronicle`, `archive`, `recognition`, `fire`,
  `workbench`, `referral`, `seat-record`, `protocol-graph`, `architecture`, `settings`.
- **Founder (operator-only):** `founder-review` (the Founder Console — candidate review,
  Proof-of-Fire review, Truth-Drift — **simulated**, approves nothing real).
- **Fallback:** `not-found`.

## `src/hooks/`

| Hook | Role |
|------|------|
| `use-mobile.tsx` | Responsive breakpoint helper. |
| `use-toast.ts` | Toast state for the `toaster`/`sonner` primitives. |

## Entry / config

- `src/main.tsx` — mounts `<App/>`.
- `src/App.tsx` — providers (`AppProvider`, `MotionConfig` via `MotionGate`), router, shells.
- `src/index.css` — Tailwind v4 (CSS-first) + theme tokens (dark-first).
- `index.html`, `vite.config.ts`, `tsconfig.json`, `components.json` — standalone config.
