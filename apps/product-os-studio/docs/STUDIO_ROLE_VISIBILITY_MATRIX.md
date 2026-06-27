# STUDIO_ROLE_VISIBILITY_MATRIX

> `PROTOTYPE ONLY` · **NOT PRODUCTION AUTH.** Roles are simulated `localStorage` flags
> (`syn-connected`, `syn-seated`, `syn-founder`) — **UI gating only, not security.** Real
> access control must be enforced server-side (`components/production-auth-note.tsx`).

## Roles (simulated)

| Role | Set by | Meaning |
|------|--------|---------|
| **public** | no flags | No wallet. Sees the public proof + resource layer only. |
| **connected** | `syn-connected = true` | Simulated wallet connected. |
| **seated** | `syn-connected` + `syn-seated` | Simulated seat held. |
| **founder** | `syn-connected` + `syn-founder` | Simulated operator/founder mode. |

`canAccessAction()` requires `isConnected` **and** the specific flag, i.e. `seated` and
`founder` both imply connected. Defaults: `connected=false`, `seated=true`, `founder=false`.

## Surface visibility

| Surface | public | connected | seated | founder |
|---------|:------:|:---------:|:------:|:-------:|
| Public home, learn, press, share, public toolkit | ✅ | ✅ | ✅ | ✅ |
| Public proof (`/activity … /fire`) | ✅ | ✅ | ✅ | ✅ |
| `/member` (Home) | — | ✅ | ✅ | ✅ |
| `/member/join` | — | ✅ | ✅ | ✅ |
| `/member/toolkit` | — | ✅ | ✅ | ✅ |
| `/member/wallet` | — | ✅ | ✅ | ✅ |
| `/member/settings` | — | ✅ | ✅ | ✅ |
| `/member/my-syndicate` | — | gate¹ | ✅ | ✅ |
| `/member/activity, transparency, registry` | — | gate¹ | ✅ | ✅ |
| `/member/evolution, chronicle, archive, recognition, fire` | — | gate¹ | ✅ | ✅ |
| `/member/workbench, referral, seat-record, graph, architecture` | — | gate¹ | ✅ | ✅ |
| `/member/founder-review` (Founder Console) | hidden² | hidden² | hidden² | ✅ |

¹ **gate** = surface is reached but renders `SeatLockedGate` (preview + "take your seat"),
not the real content. No silent redirect.
² **hidden** = the Operator nav group and the founder route/category are **removed** from
nav for non-founders; navigating directly renders `FounderGate` (explains the gate, no
silent redirect).

## Gating rules (from `role-gate.tsx` + `navigation.ts`)

- `Protected` decides authority at **render time** (not import time).
- **Founder UI is hidden, not just blocked** — the Operator nav group and operator action
  category disappear for non-founders (`getVisibleCategories` drops `operator`).
- **No silent redirects** — every gate renders an explanatory surface.
- The same `RouteRequirement` vocabulary (`connected | seated | founder`) drives **nav**
  (`MEMBER_NAV`), **routes** (`ROUTE_REQUIREMENTS`), and **actions** (`ActionVisibility`),
  so a surface cannot be exposed in one place and gated in another.

## Demo controls

Settings → "Prototype / Demo State" toggles the three role flags (and `resetDemo()`
restores defaults) purely so the prototype can be demonstrated. These switches grant
**no real permission** — they only change local UI state in the current browser.
