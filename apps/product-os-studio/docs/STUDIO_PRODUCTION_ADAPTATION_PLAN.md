# STUDIO_PRODUCTION_ADAPTATION_PLAN

> **What this is:** the record of the *alignment pass* that made Product OS Studio
> **speak production's functional language** without becoming production. The Studio is
> still a `SIMULATED` · `PROTOTYPE ONLY` prototype. Nothing here wires real behavior.
> **Read with:** `STUDIO_ADAPTER_SEAMS.md`, `STUDIO_KNOWN_SIMULATIONS.md`,
> `STUDIO_CODEX_HANDOFF.md`.

## Goal

Adapt **labels, mock-state vocabulary, and adapter-seam placeholders** so a production
engineer reads the Studio and recognizes the real system's vocabulary (wallet states,
read-states, contract roles, sale flow, source policy, burn proofs) — while every surface
stays simulated and clearly labeled. The Studio is a *map* of production, not a copy of it.

## Hard constraints honored

- **Scope:** only `apps/product-os-studio/`. No production file was read, imported, or
  edited. No cross-app import was added.
- **No real behavior:** no wallet writes, no chain reads, no contract calls, no
  referral-source-claim activation, no founder controls that do anything real.
- **Auth must not look real:** `localStorage` flags (`syn-connected`, `syn-seated`,
  `syn-founder`) stay simulated and are labeled **NOT PRODUCTION AUTH**.
- **No redesign:** this pass changed *labels / vocabulary / state taxonomy* and added
  *docs + type-only seams*. No layout, route, component structure, or visual system changed.
- **No fabricated values:** real contract addresses and live constants are **never invented**.
  Now that the porting map is present, the real constants it documents are shown as
  `READ-ONLY PRODUCTION PROOF` (static, inert); a *live read* of them remains `ADAPTER REQUIRED`.

## The porting map (present)

The canonical production-truth source — `docs/STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md`
— **is now present in this Studio export** as a BRIDGE INVENTORY: real contract addresses,
live constants, ABI references, and the production module inventory.

Because it is present:

- **Real deployed constants are shown as `READ-ONLY PRODUCTION PROOF`** — static, inert
  references (SYN/USDC, MembershipSale, SourceRegistryV1 [deployed, policy PAUSED], Archive1155,
  the Vault/Liquidity/Operations wallets, Trader Joe SYN/USDC LP pair, `SYN_BURN_ADDRESS`,
  `PROOF_OF_FIRE_001`) with read-only explorer links. **Nothing is wired.** Concepts the map
  does not cover (e.g. ProductSaleRouter, SwapRail) stay `FUTURE` placeholders, not truth.
- The type-only seams in `src/lib/adapters.ts` still hold **no live values** — a *live read*
  of any constant is `ADAPTER REQUIRED`. The seams carry a clearly-labeled read-only proof
  constants reference (known values, not adapter-backed).
- The seams remain where real adapters attach later — **without** changing the Studio's UI
  contracts. Supplying an adapter swaps a simulated read for a real one behind the same type.

## What changed in this pass

1. **Type-only adapter seams** — `src/lib/adapters.ts`. Production-shaped interfaces
   (Wallet, MembershipSale, MemberIndex, Activity, SourcePolicy, Archive, BurnProof,
   Transparency, ContractRegistry) + shared types (`WalletState`, `ReadState`,
   `ContractRef`, `Receipt`, `RoutingSplit`, …). No implementations, no imports, no I/O.
2. **Posture vocabulary** — `StatusBadge` gained durable production-posture labels:
   `READ-ONLY PRODUCTION PROOF`, `PROTOTYPE PLACEHOLDER`, `PROTOTYPE WALLET STATE`,
   `ADAPTER REQUIRED`, `NOT WIRED`, `NOT PRODUCTION AUTH` (each with style + tooltip).
3. **Screen label/state alignment** — wallet, join, registry, fire, archive now name the
   production machinery they *model* (e.g. `useWalletGate`, `MembershipSaleV3`,
   `ZERO_SOURCE_ID`, `useSynBurnEvents` / `PROOF_OF_FIRE_NNN`, `Archive1155`) and mark the
   seam (`ADAPTER REQUIRED`) — while keeping the simulated disclaimers intact.
4. **Already-aligned surfaces (no code churn):** referral, transparency/economy, the action
   toolkit (`actions.ts`), and member/activity/receipts already used canonical vocabulary
   (`V1 CANDIDATE`, `ZERO_SOURCE_ID`, `MembershipSaleV3`, READ-ONLY 70/20/10, honest
   `sourceTruth` per action). These were verified and documented, not rewritten.

## What deliberately did NOT change

- No real wallet/provider, no `wallet_watchAsset`, no RPC, no live/wired reads. Explorer
  links appear only as static **READ-ONLY PRODUCTION PROOF** (reference, not navigation into a wired read).
- No referral source link, claim UI, or downline/upline of any kind.
- No burn executes. The only real tx hash / explorer URL is the **READ-ONLY PRODUCTION
  PROOF** (`PROOF_OF_FIRE_001`) copied from the map; none are fabricated and a live scan stays ADAPTER REQUIRED.
- No founder control performs a real action.
- No banned affirmative financial language was introduced (see `brand.ts` guardrails).

## Where production attaches later

Each seam in `STUDIO_ADAPTER_SEAMS.md` lists the production module it stands in for and the
posture it would carry once wired. The contract is: **swap simulated data for an adapter
implementation behind the same type**, supply real values from the porting map, and flip the
posture label — the Studio's components keep rendering from the same shapes.
