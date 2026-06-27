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

## Auth / session / roles — SIMULATED (NOT PRODUCTION AUTH)

- Wallet "connect" is a `localStorage` boolean (`syn-connected`). No wallet provider, no
  signature, no address ownership is verified.
- `syn-seated` and `syn-founder` are local flags. **Founder/operator mode is not security.**
- Settings → "Prototype / Demo State" flips roles for demonstration; grants no real access.

## Wallet / token / chain — SIMULATED (NOT CHAIN TRUTH)

- All balances (`avaxBalance`, `usdcBalance`, `synBalance`, `synAcquired`, `usdcRouted`) are mock.
- All addresses are mocked placeholders (`0x…SIMULATED`, `Not yet deployed`). **No real
  addresses. No live addresses.**
- All transactions/hashes are fake; `explorerUrl` values are `#` (inert).
- "Import SYN" makes **no** `wallet_watchAsset` call (address is mocked) — labeled preview.
- "SYN address status" copies a status note; **no address is fabricated**.

## Capital routing display — SIMULATED values, canonical math

- `protocolStats` (members, usdcRouted, protocolControlled, burnedSyn, chapter `10/333`) are
  `mocked: true`. Receipts, approvals, economy figures are simulated. The 70/20/10 *math* is real.
- `routingWallets` (Vault/Liquidity/Operations) addresses are simulated.

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

- `burnedSyn: 10000` is simulated. `FIRE_LEDGER` entries are `candidate` / `simulated`.
- **No burn executes.** No hashes, no explorer links (deliberately absent).
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
