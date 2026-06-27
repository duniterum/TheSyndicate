# Product OS Studio — The Syndicate

> **PROTOTYPE ONLY. This is not the live site.**
> This is *Product OS Studio*: a standalone, isolated, **simulated** copy of The Syndicate
> Product OS prototype, staged for hand-off into a GitHub subfolder.
>
> - This is **NOT production**. **NOT production auth.** **NOT chain truth.** **NOT smart-contract authority.**
> - LocalStorage founder mode is **not security**.
> - Mock data is **not live data**. Simulated addresses are **not live addresses**.
> - Referral / source / claim flows are **not active**.
> - DEX / LP links are **not wired** and **not verified**.
> - Burn / fire values are **simulated** — supply is *retired, never minted*, and nothing is *a price promise*.

This Studio is a **frontend-only** Vite + React + TypeScript app. It has **no backend**,
reads **no chain**, sends **no transactions**, and makes **no API calls**. (The only
outbound network requests are the Google Fonts stylesheet referenced in `index.html` and
any external share / social links you explicitly click.) Every "connect wallet", "take
seat", "burn", "approve", "claim", and "operator" action is a **labeled simulation** driven
by local React state and `localStorage`.

---

## Run it

This folder is self-contained — concrete dependency versions, no workspace/catalog
references, no Replit-only plugins. Use **npm** or **pnpm** (npm shown):

```bash
cd apps/product-os-studio
npm install          # or: pnpm install
npm run dev          # start the dev server (default http://localhost:5173)
```

Other scripts:

```bash
npm run typecheck    # tsc --noEmit (type safety)
npm run build        # production build to ./dist
npm run preview      # serve the built ./dist locally
```

### Environment variables (optional)

| Var         | Default | Purpose                                                            |
|-------------|---------|-------------------------------------------------------------------|
| `PORT`      | `5173`  | Dev/preview server port.                                          |
| `BASE_PATH` | `/`     | Base path if the Studio is served from a sub-path (e.g. `/studio/`). |

No secrets, no API keys, no `.env` are required (or used). Do **not** add live secrets here.

---

## What's inside

```
apps/product-os-studio/
├─ README.md              ← you are here (run + safety)
├─ STATUS.md              ← isolation + truth status
├─ docs/                  ← STUDIO_* maps (route, component, data, role, proof, toolkit, ledger, simulations, handoff)
├─ index.html
├─ package.json           ← standalone deps (concrete versions)
├─ vite.config.ts         ← standalone (no Replit plugins)
├─ tsconfig.json          ← standalone (no workspace references)
├─ components.json        ← shadcn/ui config
├─ public/                ← static assets (favicon, og image, artifacts, robots)
└─ src/
   ├─ App.tsx             ← path-first routing + shells (public / member)
   ├─ main.tsx
   ├─ index.css           ← Tailwind v4 (CSS-first) + theme tokens
   ├─ pages/              ← public + member + founder pages
   ├─ components/         ← app components + ui/ (shadcn primitives)
   ├─ hooks/
   └─ lib/                ← single sources of truth (see docs/)
```

The `src/` tree is a **verbatim copy** of the Replit `syndicate` artifact. Only the
**config files** (`package.json`, `vite.config.ts`, `tsconfig.json`) were rewritten so the
app installs and builds **standalone** (outside the Replit pnpm monorepo).

---

## Documentation map (`docs/`)

| File | What it covers |
|------|----------------|
| `STUDIO_ROUTE_MAP.md` | Every public / member / founder route and its page component. |
| `STUDIO_COMPONENT_MAP.md` | Components, pages, hooks, and the `lib/` single-source modules. |
| `STUDIO_DATA_MODEL_MAP.md` | Mock data shapes, `localStorage` keys, and what is canonical vs simulated. |
| `STUDIO_ROLE_VISIBILITY_MATRIX.md` | public / connected / seated / founder gating per surface. |
| `STUDIO_PUBLIC_PROOF_MATRIX.md` | Public proof surfaces ↔ member counterparts, anonymization rules. |
| `STUDIO_ACTION_TOOLKIT_MAP.md` | The action registry — every action, status, and safety labels. |
| `STUDIO_LEDGER_REGISTER_ARCHITECTURE.md` | Protocol graph, Fire Ledger, Chronicle, Registry, Truth-Drift. |
| `STUDIO_KNOWN_SIMULATIONS.md` | The definitive list of what is simulated / future / not live. |
| `STUDIO_CODEX_HANDOFF.md` | What Codex should (and must not) do to take this toward production. |

---

## Boundaries (read `STATUS.md` for the full list)

- This Studio must **never** be wired to production, real auth, real wallets, real chain
  reads, or real smart contracts without an explicit, separate, founder-approved effort.
- Every simulated / future / not-live element **must stay labeled**. Do not remove the
  `SIMULATED`, `FUTURE`, `NOT LIVE`, `PROTOTYPE ONLY`, `BACKEND REQUIRED`, `CONCEPT ONLY`,
  `READ-ONLY`, `NOT PRODUCTION AUTH` labels to make a surface "look done".
