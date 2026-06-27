# STUDIO_ROUTE_MAP

> `PROTOTYPE ONLY` · `SIMULATED`. Routing is **path-first** and client-side (wouter).
> Role gates here are **UI-only**, **not** production auth.

## Routing model (`src/App.tsx`)

- The router base is `import.meta.env.BASE_URL` (so the app works at `/` or under a sub-path via `BASE_PATH`).
- `AppShell` decides the shell by **path + simulated connection**:
  - `/member*` **and** `isConnected` → **`MemberShell`** (sidebar + member pages).
  - `/member*` **and not** connected → **`ConnectGate`** (points to the public proof equivalent; **no silent redirect**).
  - everything else → **`PublicShell`** (the public proof layer + resource pages).
- Member routes are **generated from `MEMBER_NAV`** (`lib/navigation.ts`) and public proof
  routes from **`PROOF_SURFACES`** (`lib/surfaces.ts`) — so a surface can never be exposed
  in one place and gated in another. A `DEV`-only guard logs if a nav/surface entry has no
  page component (drift guard).

## Public routes (no wallet — `PublicShell`)

| Path | Page component | Notes |
|------|----------------|-------|
| `/` | `pages/public-home` | Flagship landing / hero. |
| `/learn` | `pages/learn` | FAQ, protocol paper, risk disclaimers. |
| `/press` | `pages/press` | Press & brand kit. |
| `/share` | `pages/share` | Proof & Share center (prototype share cards). |
| `/toolkit` | `pages/public-toolkit` | Public, role-aware action toolkit. |
| `/activity` | `pages/public-activity` | Protocol heartbeat (anonymized). |
| `/economy` | `pages/public-economy` | 70/20/10 routing + economy summary. |
| `/registry` | `pages/public-registry` | Contract/protocol proof summary (addresses mocked). |
| `/recognition` | `pages/public-recognition` | Anonymized contribution board. |
| `/referral-status` | `pages/public-referral-status` | Verified Introduction status (V1 candidate, not live). |
| `/evolution` | `pages/public-evolution` | Protocol series / episodes. |
| `/chronicle` | `pages/public-chronicle` | Curated public canon. |
| `/archive` | `pages/public-archive` | Memory/milestone preview. |
| `/fire` | `pages/public-fire` | Proof of Fire (simulated burn totals). |
| *(any other)* | `PublicNotFound` | Friendly 404 → public proof / home. |

*The 9 proof surfaces (`/activity … /fire`) are generated from `PROOF_SURFACES`. The 5
static public routes (`/`, `/learn`, `/press`, `/share`, `/toolkit`) are declared directly.*

## Member routes (simulated connection — `MemberShell`)

Generated from `MEMBER_NAV`. Each is wrapped in `<Protected requirement=…>`.

| Path | Page component | Requirement |
|------|----------------|-------------|
| `/member` | `pages/member-home` | `connected` |
| `/member/join` | `pages/join` | `connected` |
| `/member/my-syndicate` | `pages/my-syndicate` | `seated` |
| `/member/toolkit` | `pages/toolkit` | `connected` |
| `/member/wallet` | `pages/wallet` | `connected` |
| `/member/activity` | `pages/activity` | `seated` |
| `/member/transparency` | `pages/transparency` | `seated` |
| `/member/registry` | `pages/registry` | `seated` |
| `/member/evolution` | `pages/evolution` | `seated` |
| `/member/chronicle` | `pages/chronicle` | `seated` |
| `/member/archive` | `pages/archive` | `seated` |
| `/member/recognition` | `pages/recognition` | `seated` |
| `/member/fire` | `pages/fire` | `seated` |
| `/member/workbench` | `pages/workbench` | `seated` |
| `/member/referral` | `pages/referral` | `seated` |
| `/member/seat-record` | `pages/seat-record` | `seated` |
| `/member/graph` | `pages/protocol-graph` | `seated` |
| `/member/architecture` | `pages/architecture` | `seated` |
| `/member/settings` | `pages/settings` | `connected` |
| `/member/founder-review` | `pages/founder-review` | **`founder`** |

## Gating behavior (`components/role-gate.tsx`)

- `Protected` is a **render-time** guard (authority decided at render, not import).
- `requirement: "founder"` + not founder → **`FounderGate`** (explains the gate, links to
  legitimate destinations, states that real access needs a signature + server verification).
- `requirement: "seated"` + not seated → **`SeatLockedGate`** (previews the locked surface,
  routes to "take your seat").
- **Founder nav + founder-only categories are hidden** for non-founders (not just blocked).
- **No silent redirects** — gates render an explanatory surface instead.

> Reminder: these requirements drive **UI** only. Real access control must be enforced
> server-side. See `components/production-auth-note.tsx`.
