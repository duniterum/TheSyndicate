# STUDIO_REALITY_LAYER_VISIBILITY_REPORT

> **Purpose.** The founder is reviewing the prototype and still sees mostly simulated/demo
> data. This report explains *exactly* what is visible right now, where the new Reality Layer
> appears, what is truly live‑read, what is demo, what needs a Codex adapter, and what to wire
> next. **No new adapter, no new features, no writes were added** — this is a verification pass.

---

## 0. The headline finding (read this first)

**The site the founder is reviewing is not the app that PR #8 changed.**

There are two distinct front‑ends in this repository/workspace:

| App | What it is | Reality Layer / Avalanche badge / live wallet read? | Served / deployed? |
|-----|------------|------------------------------------------------------|--------------------|
| **`artifacts/syndicate`** (`@workspace/syndicate`, title "The Syndicate") | The registered web artifact — the running/published site, the one shown in the preview/canvas. | **No.** It contains none of the PR #8 code. | **Yes** — it is the workflow that runs and the app the deployment serves (`router = "application"` serves registered artifacts; `previewPath = "/"`). |
| **`apps/product-os-studio`** (`product-os-studio`, "Product OS Studio") | The standalone, isolated prototype that **PR #8** edits (the Live‑Read reality layer lives here). | **Yes** — `reality-layer-strip.tsx`, `chain-badge.tsx`, and the real read‑only EIP‑1193 wallet layer are all here. | **No** — it is **not** in `pnpm-workspace.yaml`, **not** a registered artifact, and **not** in any workflow. Nothing in this workspace serves or deploys it. |

**Evidence.**
- `rg` for `reality-layer-strip | RealityLayerStrip | chain-badge | ChainBadge` in
  `artifacts/syndicate/src` → **no matches**. The same names exist only under
  `apps/product-os-studio/src`.
- A screenshot of the running site (`http://localhost:80/`) shows **The Syndicate** home with
  the old hero stat band (`MEMBERS 10`, `USDC ROUTED $8,450`, `BURNED SYN 10,000`,
  `Genesis Signal · 10/333`), a **"Live capital routing"** label, and **no Reality Layer
  strip and no Avalanche C‑Chain badge**. PR #8 had already renamed that hero label to
  **"Capital routing preview"** in the Studio — proof the running site is the *other*,
  pre‑PR‑#8 app.
- `apps/product-os-studio` has its own `package.json` (concrete versions, no `workspace:` /
  `catalog:`), its own `vite.config.ts` (base `/`), and its own `dist/`. It is deliberately
  self‑contained and is not wired into the workspace router.

**Consequence.** No adapter and no Studio change will make the founder "see" the reality layer
on the deployed site, because the deployed site is a different app. Before any adapter work, a
**product decision** is required (out of scope for this PR — reported, not done):

1. **Register the Studio as the served artifact** (give `apps/product-os-studio` an
   `.replit-artifact` + workflow, or add it to the workspace), **or**
2. **Port the reality layer** (`reality-layer-strip`, `chain-badge`, the read‑only wallet
   layer) **into `artifacts/syndicate`**, the app that is actually deployed.

Either is a deliberate change outside this report's boundary (`apps/product-os-studio/` only).

---

## 1. Is the deployed prototype running the latest PR #8 code?

**No.** The deployed/running site is `artifacts/syndicate`, which does not contain the PR #8
reality‑layer code at all. The PR #8 code exists (in `apps/product-os-studio`, and on the PR
branch), it typechecks and builds, but it is **not** the app being served. This is not a
"deploy didn't refresh" cache problem — it is two different applications.

---

## 2. Where the Reality Layer appears (in the Studio app)

- **Home (`/`)** — a dedicated **"Reality layer — three states, never mixed"** section sits
  directly under the hero (`public-home.tsx` → `RealityLayerStrip`). Three cards:
  **Demo Persona** (`SIMULATED PROTOTYPE`), **Live Wallet Read** (`LIVE READ`, carries the
  Avalanche **ChainBadge**), **Adapter Required** (`ADAPTER REQUIRED`).
- **Avalanche C‑Chain badge** (`chain-badge.tsx`, text + glyph, no logo asset): on the Live
  Wallet Read card, and on the wallet chip / wallet panel network row (wrong‑network → manual
  guidance to switch in your own wallet; the Studio never requests a network change).
- **Live Wallet Read** (real, read‑only): the wallet chip (header) and `WalletStatePanel`
  (top of `/wallet`, and embedded on Join / My Syndicate). Best single page to demonstrate it:
  **`/wallet`** (the `WalletStatePanel` at the top is the real layer).

---

## 3–6. Data posture by surface

> **"Visible now"** = present in the **Studio app** (`apps/product-os-studio`). It is **not**
> visible on the currently deployed `artifacts/syndicate` site (see §0). **Live read** = a real
> value from the user's own wallet/chain *this session*. **Demo** = simulated prototype data
> (kept on purpose, labeled). **Adapter required** = real on‑chain data that needs a Codex
> adapter before it can read live. **Read‑only production proof** = a real deployed constant
> shown static/inert with a read‑only explorer link (never wired).

| Surface | Visible now | Live read | Demo | Adapter required | Notes |
|---------|-------------|-----------|------|------------------|-------|
| Home hero stats (members, USDC routed, protocol‑controlled, burned SYN, chapter) | ✅ Studio | — | ✅ | ✅ (for live totals) | `MOCK_DATA.protocolStats`, `mocked: true`. Labeled `SIMULATED PROTOTYPE` + "PROTOTYPE SNAPSHOT · SIMULATED VALUES". 70/20/10 math is canonical. |
| Reality Layer strip | ✅ Studio | — | — | — | Explanatory only — no data, no wiring. Reuses canonical `StatusBadge` taxonomy. |
| Wallet connect | ✅ Studio | ✅ | ✅ (separate demo) | — | **Real** read‑only connect (`eth_requestAccounts`) in `WalletStatePanel`. The `/wallet` "Simulate Wallet State" controls + connect‑flow banners are a separate, labeled demo. `isProductionAuth` is literally `false`. |
| SYN balance | ✅ Studio | ✅ | ✅ (separate card) | — | **Live read** in `WalletStatePanel` (`eth_call` `decimals()` + `balanceOf` of the user's own SYN). The lower dashboard "SYN Balance" card uses `MOCK_DATA.synBalance` (demo) — see §7 note. |
| Import SYN | ✅ Studio | ✅ (action) | ✅ (toolkit copy) | — | **Real** `wallet_watchAsset` (decimals read live first) — the only user‑initiated wallet write; no transaction. The Toolkit's "Import SYN" action is a separate disabled/simulated preview. |
| Contract addresses (SYN, USDC, MembershipSaleV3, SourceRegistryV1, Archive1155, routing wallets) | ✅ Studio | — | — | ✅ (for live reads) | **READ‑ONLY PRODUCTION PROOF** — static, inert, with read‑only explorer links. SourceRegistryV1 policy is PAUSED. Nothing wired. |
| DEX / LP links | ✅ Studio | — | ✅ | — (NOT WIRED) | `external-link`, **disabled** ("not wired — source required"), behind a market‑risk warning. **Unverified** until sourced from an official channel. |
| Proof of Fire | ✅ Studio | — | ✅ (aggregate) | ✅ (live burn scan) | `burnedSyn`/`FIRE_LEDGER` simulated. **`PROOF_OF_FIRE_001` + `SYN_BURN_ADDRESS` are READ‑ONLY PRODUCTION PROOF.** No `execute()`. Supply *retired, never minted*; not a price promise. |
| Activity feed | ✅ Studio | — | ✅ | ✅ | Simulated events; live `useLivePurchaseEvents`/`useProtocolEvents` scan is `ADAPTER REQUIRED`. |
| Member index | ✅ Studio | — | ✅ | ✅ | Member #9 etc. simulated; production derives it from a purchase‑event scan (`buildHolderIndex`). |
| Receipts | ✅ Studio | — | ✅ | ✅ | Simulated tx hashes; explorer links are inert/labeled "Simulated link". Live receipts need `ActivityAdapter`. |
| Economy totals | ✅ Studio | — | ✅ (values) | ✅ (live totals) | Values simulated; **70/20/10 routing math is canonical**. Live gross/net routed needs `TransparencyAdapter`. |
| Archive holdings | ✅ Studio | — | ✅ | ✅ | Archive is the live *module* concept; holdings here are simulated. Live `Archive1155` reads are `ADAPTER REQUIRED`; `mint()` NOT wired. |
| Recognition | ✅ Studio | — | ✅ | ✅ | Standing/contribution depth simulated, read‑only. |
| Referral status | ✅ Studio | — | ✅ | — (V1 CANDIDATE) | `referralActive: false`. Example link only ("No public source link is live today"). Default source `ZERO_SOURCE_ID`; no downline/upline. |

**Why the homepage totals are still demo (§6).** They are `MOCK_DATA.protocolStats`
(`mocked: true`) — aggregates over the *whole* protocol (member count, cumulative USDC routed,
SYN burned). The real read‑only wallet layer can only read **single, self‑scoped values** (your
address, your chain, your own SYN balance); it does **not** scan historical event logs. Turning
the homepage band live therefore requires event‑scanning adapters (`ActivityAdapter` +
`TransparencyAdapter` + `BurnProofAdapter`), which are `ADAPTER REQUIRED`. And — per §0 — even
once wired, they would render on the **Studio**, not on the currently deployed
`artifacts/syndicate` site.

**§7 — wallet connect on the deployed build.** On the deployed `artifacts/syndicate` build the
wallet is **simulated** (a `localStorage`/connect‑flow preview, "Connect Wallet" button). The
**real read‑only** wallet read exists only in the Studio's `WalletStatePanel`.

---

## What is genuinely real today (3 live reads + 1 read‑only‑safe action)

**Live reads** (real values from the user's own wallet/chain this session):
1. Connected wallet **address** (`eth_requestAccounts` / `eth_accounts`).
2. Current **chain / network id** (`eth_chainId`) — drives the Avalanche C‑Chain check.
3. The user's **own SYN balance** (`eth_call` `decimals()` + `balanceOf`), labeled `LIVE READ`.

**Real read‑only‑safe action** (not a read, not a transaction):
4. **Import SYN** (`wallet_watchAsset`, decimals read live first) — prompts the wallet to track
   the SYN token; moves no funds, signs nothing. It is the only user‑initiated wallet write.

Everything else is demo or adapter‑required. There is **no** `eth_sendTransaction` / signing /
network‑change / revoke anywhere; `isProductionAuth` is literally `false`.

---

## 8. Best page to demonstrate live wallet read

**`/wallet`** — the `WalletStatePanel` at the top is the real, read‑only layer (connect →
address + Avalanche chain check → live SYN balance → Import SYN). The Home **Reality Layer
strip** is the best at *explaining* the three states; `/wallet` is the best at *showing* the
live one. (Minor honesty note for a future pass: the simulated `AVAX / USDC / SYN Balance`
cards lower on `/wallet` sit under the labeled "Simulate Wallet State" demo region but lack a
per‑card badge — consider a small `SIMULATED` tag so a connected user never confuses the live
panel balance with the mock card.)

---

## 9. Recommended next adapter

**First: `BurnProofAdapter` (read‑only burn‑event scan).** Most founder‑visible trust for the
least risk:
- **Lowest risk** — read‑only by construction (`proofs()` only, **no `execute()`** in the
  seam), no wallet write, no new attack surface.
- **Anchored** — `SYN_BURN_ADDRESS` and `PROOF_OF_FIRE_001` are already `READ‑ONLY PRODUCTION
  PROOF`, so the scan has a verified reference to validate against on day one.
- **High signal** — it flips the Fire aggregate from "simulated" to a real, verifiable
  on‑chain proof — exactly the kind of costly‑signal truth the brand is built on.

**Then: `ActivityAdapter` (purchase‑event scan) → `TransparencyAdapter`.** This is what makes
the **homepage band** (members, USDC routed, net routed) genuinely live — the highest‑visibility
surface — but it is more involved (event pagination + aggregation + freshness), so it should
follow the safe burn read.

> **Bigger lever than any adapter:** decide the deployment question in §0 first. Wiring an
> adapter into an app the founder isn't looking at changes nothing they can see.

---

## 10. Checks run & how the UI was inspected

| Check | Result |
|-------|--------|
| `npm run typecheck` (`tsc -p tsconfig.json --noEmit`) | ✅ Passed (0 errors). |
| `npm run build` (`vite build`) | ✅ Passed — 2881 modules, built to `dist/`. Benign Rollup sourcemap notices for a few Radix `"use client"` files + the usual chunk‑size warning; no errors. |
| UI inspection — running site | Screenshotted `http://localhost:80/` (the running `artifacts/syndicate`): old hero stat band, "Live capital routing", **no Reality Layer strip, no Avalanche badge**. |
| Code inspection — Studio | Read `reality-layer-strip.tsx`, `chain-badge.tsx`, `public-home.tsx`, `wallet.tsx`, `wallet-context.tsx`, `adapters.ts`, and the simulation/seam docs; `rg` confirmed the reality‑layer code exists only under `apps/product-os-studio`. |

---

## Final principle

Show the founder what is real, what is demo, what is missing, and what to wire next — and don't
let a label imply more than the code does. The single most important truth here: **the reality
layer is real in the Studio, but the Studio is not the deployed site.** Fix that first.
