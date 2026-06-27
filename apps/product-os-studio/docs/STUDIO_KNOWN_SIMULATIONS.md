# STUDIO_KNOWN_SIMULATIONS

> The definitive list of what is **simulated / future / not live** in Product OS Studio.
> If you change any of these toward "real", you are leaving prototype scope — see
> `STUDIO_CODEX_HANDOFF.md`. **Do not remove a label to make a surface look done.**

## Canonical (accurate) — keep these true

- **Routing split** `70% Vault / 20% Liquidity / 10% Operations` (`ROUTING_SPLIT`, `routeUsdc`).
- **Default source** `ZERO_SOURCE_ID`.
- **Doctrine** — "The Syndicate recognizes capital without reducing identity to capital."
- **Status vocabulary** — `LIVE NOW`, `READ-ONLY`, `IN REVIEW`, `V1 CANDIDATE`, `FUTURE`,
  `SIMULATED PROTOTYPE` (and copy labels `CONCEPT ONLY`, `BACKEND REQUIRED`, `PROTOTYPE ONLY`).
- **Production-posture vocabulary** (added by the adaptation pass — see
  `STUDIO_PRODUCTION_ADAPTATION_PLAN.md`): `READ-ONLY PRODUCTION PROOF`,
  `PROTOTYPE PLACEHOLDER`, `PROTOTYPE WALLET STATE`, `ADAPTER REQUIRED`, `NOT WIRED`,
  `NOT PRODUCTION AUTH`. These name *how a surface relates to production* without making it
  real. **`ADAPTER REQUIRED` never implies the Studio reads a value** — the porting map now
  names the canonical constant, but the Studio still performs no live read; it marks an unwired seam.

## Auth / session / roles — SIMULATED (NOT PRODUCTION AUTH)

- Wallet "connect" is a `localStorage` boolean (`syn-connected`). No wallet provider, no
  signature, no address ownership is verified.
- `syn-seated` and `syn-founder` are local flags. **Founder/operator mode is not security.**
- Settings → "Prototype / Demo State" flips roles for demonstration; grants no real access.

## Wallet / token / chain — SIMULATED (NOT CHAIN TRUTH)

- All balances (`avaxBalance`, `usdcBalance`, `synBalance`, `synAcquired`, `usdcRouted`) are mock.
- **Real deployed constants now appear as `READ-ONLY PRODUCTION PROOF`** (static, inert): the
  SYN/USDC tokens, MembershipSale (V3 active / V1 sealed), SourceRegistryV1 (deployed, policy
  PAUSED), Archive1155, the Vault/Liquidity/Operations routing wallets, and `SYN_BURN_ADDRESS`.
  They are copied from the porting map and shown with **read-only explorer links**. Nothing is
  wired — a live read of any of them is `ADAPTER REQUIRED`. Concepts **not** in the porting map
  (e.g. ProductSaleRouter, SwapRail) stay `FUTURE` placeholders, not production truth.
- Prototype transactions/hashes are simulated and their `explorerUrl` values are `#` (inert).
  The **one** real transaction is `PROOF_OF_FIRE_001` (see Burn section), shown read-only.
- "Import SYN" makes **no** `wallet_watchAsset` call — labeled preview.
- "SYN address status" copies a status note; the SYN address is read-only production proof.

## Capital routing display — SIMULATED values, canonical math

- `protocolStats` (members, usdcRouted, protocolControlled, burnedSyn, chapter `10/333`) are
  `mocked: true`. Receipts, approvals, economy figures are simulated. The 70/20/10 *math* is real.
- `routingWallets` (Vault/Liquidity/Operations) addresses are **`READ-ONLY PRODUCTION PROOF`**
  (canonical wallets from the porting map, shown static with read-only explorer links — nothing wired).

## DEX / liquidity / market — NOT WIRED (BACKEND REQUIRED)

- "Swap on a DEX", "View market chart", "Provide liquidity" are `external-link`, **disabled**
  ("not wired — source required"), behind a market-risk warning. No pool / router / data source.
- **DEX / LP links are not verified** and must be sourced from an official channel before use.

## Referral / Verified Introduction / source — NOT LIVE (V1 CANDIDATE)

- `referralActive: false`, `sourceDashboardLive: false`. Default source stays `ZERO_SOURCE_ID`.
- SourceRegistryV1 is `IN REVIEW`. No source link is **active**; no downline/upline of any kind.
- The referral page (`src/pages/referral.tsx`) renders a **simulated *example* introduction
  link** (`https://syndicate.money/join?source=0xABCD...1234`) that copies to the clipboard,
  explicitly labeled "Example only. No public source link is live today." plus
  `V1 CANDIDATE` + `SIMULATED PROTOTYPE` badges. It also shows a simulated buy flow (no funds
  move), a candidate 5% source share (preview, not payable), a disabled "Claim Escrowed
  Payouts" button, and a "Clear Source (Use ZERO_SOURCE_ID)" affordance. Nothing is live.

## Claim / SeatRecord / identity — FUTURE

- `claimUiActive: false`, `seatRecordLive: false`. SeatRecord721 is `FUTURE` (not deployed);
  the "Claim SeatRecord" action is disabled.

## Burn / Proof of Fire — SIMULATED (CONCEPT ONLY)

- `burnedSyn: 10000` (aggregate) is simulated; `FIRE_LEDGER` entries are `candidate` / `simulated`.
- **One verified burn is `READ-ONLY PRODUCTION PROOF`:** `PROOF_OF_FIRE_001` — 1,000 SYN,
  Founder Burn, with a real transaction and confirmed block, plus `SYN_BURN_ADDRESS` — copied
  from the porting map and shown with read-only explorer links, **separate** from the simulated
  aggregate (`getProofOfFire()`, not `FIRE_LEDGER`). A live burn-event scan is `ADAPTER REQUIRED`.
- **No burn executes.** Prototype entries carry no fake hashes/explorer links.
- Always labeled: supply **retired, never minted**; never yield; **not a price promise**.

## Memory / chronicle / recognition / activity — SIMULATED, READ-ONLY

- Activity, Archive items, Chronicle canon, Recognition standing, notifications, protocol
  events are simulated prototype data. Anchoring/curation are simulated (Archive is the live
  *module*, but anchoring here is simulated).

## Share / OG / press — PROTOTYPE ONLY (no backend generation)

- Sharing opens public intents with prototype text; **generates no image**, posts nothing.
- OG/social previews are `STATIC PREVIEW` / `CONCEPT ONLY`. Dynamic OG generation is
  `BACKEND REQUIRED`.

## Founder Console — SIMULATED

- Candidate review, Proof-of-Fire review, and Truth-Drift are simulated decision/coherence
  surfaces. Approving/declining changes nothing real and executes nothing.

## Brand language guardrails (`brand.ts`)

- **Banned in affirmative framing:** yield, ROI, passive income, governance promise,
  treasury claim, profit share, financial rights, MLM, downline/upline, guaranteed return,
  investment. (These words may still appear inside negation disclaimers, e.g. "No yield".)
- SYN is "an accounting unit, not a financial right"; NFTs are "memory, not financial rights".

## Adapter seams — TYPE-ONLY (`src/lib/adapters.ts`)

- The Studio carries **type-only** production-shaped seams (Wallet, MembershipSale,
  MemberIndex, Activity, SourcePolicy, Archive, BurnProof, Transparency, ContractRegistry).
  **No implementations, no production imports, no RPC / chain reads / wallet writes.** They
  document where real machinery plugs in later. Full detail: `STUDIO_ADAPTER_SEAMS.md`.
- Hard rules baked into the seam types: wallet `isProductionAuth` is literally `false`; sale
  `approveUsdc` / `buy` return `Promise<never>` (no wallet write); burn exposes read-only
  `proofs()` with **no `execute()`**; source policy `publicLinkActive` / `claimUiActive` are
  literally `false`; archive `memoryOnly` is literally `true`; `RoutingSplit` is canonical
  `70 / 20 / 10`.

## Porting map — PRESENT (real constants are READ-ONLY PRODUCTION PROOF)

- `docs/STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md` (the canonical home for real
  addresses / live constants) is **now present in this export** (a BRIDGE INVENTORY). Because
  it is present, the Studio shows the real deployed constants it documents as
  **`READ-ONLY PRODUCTION PROOF`** — static, inert references with read-only explorer links,
  **never wired**. Constants the map does **not** cover (e.g. ProductSaleRouter, SwapRail) stay
  `FUTURE` placeholders, not production truth. A *live read* of any constant is still
  `ADAPTER REQUIRED`. See `STUDIO_PRODUCTION_ADAPTATION_PLAN.md`.
