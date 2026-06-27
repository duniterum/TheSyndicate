# STUDIO_LIVE_READ_REALITY_LAYER

> **Phase 1 — Live Read + Wallet-Aware Reality Layer.** A small, safe, *real* read-only
> layer added on top of the simulated Studio. It introduces a genuine EIP-1193 wallet
> connection that **only reads** — it never holds production authority and exposes **no
> transaction path**. The simulated role system (`syn-connected` / `syn-seated` /
> `syn-founder`) is untouched and stays a separate, clearly-labeled demo.
>
> **Read with:** `STUDIO_ADAPTER_SEAMS.md`, `STUDIO_KNOWN_SIMULATIONS.md`,
> `STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md` (canonical constants),
> `STUDIO_ACTION_TOOLKIT_MAP.md`.

## Posture in one line

`REAL` · `READ-ONLY` · `NOT PRODUCTION AUTH`. Two layers now coexist and never mix:

| Layer | What it is | Truth |
|-------|------------|-------|
| **Simulated role demo** | `syn-*` `localStorage` flags (Connected / Seated / Founder) | `SIMULATED PROTOTYPE` — role gating only, not security. **Unchanged.** |
| **Wallet reality layer** | A real EIP-1193 connection via the user's own provider | `LIVE READ` of address / network / SYN balance; everything else `READ-ONLY PROOF` or `ADAPTER REQUIRED`. |

The reality layer never grants a role, never seats a member, never unlocks founder mode.

## Hard safety line (never crossed)

- **No write path exists in code.** There is **no** `eth_sendTransaction`, approve, buy,
  mint, burn, claim, source activation, or founder execution anywhere in the wallet layer.
- **No network change and no permission revoke.** The Studio never calls
  `wallet_switchEthereumChain`, `wallet_addEthereumChain`, or `wallet_revokePermissions`.
  Wrong-network is surfaced as **manual guidance** only (switch in your own wallet), and
  "Forget in Studio" clears **only** Studio-local state. The single user-initiated wallet
  write of any kind is `wallet_watchAsset` (Import SYN), which never touches chain or funds.
- `WalletSnapshot.isProductionAuth` is the literal `false`.
- No new dependencies. **Raw EIP-1193 only** (no wagmi / viem). No ABI imports.
- No invented addresses or links — every constant/link derives from `PRODUCTION_PROOF`
  (`src/lib/mock-data.ts`) via `src/lib/production-constants.ts` / `src/lib/external-links.ts`.
- No fake-live metrics: a value is shown as `LIVE READ` **only** when it was actually read
  from the user's provider this session; otherwise it degrades to `ADAPTER REQUIRED` / idle.

## Allowed EIP-1193 surface (read-only / user-initiated only)

| Method | When | Posture |
|--------|------|---------|
| provider detection (`window.ethereum`) | passive | read-only |
| `eth_accounts` / `eth_chainId` | passive read on load | `LIVE READ` |
| `eth_requestAccounts` | only on explicit **Connect** | user-initiated |
| _(network change)_ — **removed** | wrong-network shows **manual guidance** only; the Studio never calls `wallet_switchEthereumChain` / `wallet_addEthereumChain` (the user switches in their own wallet) | guidance only — no wallet call |
| `eth_call` `decimals()` then `balanceOf(address)` (SYN) | only on explicit **Read live / Refresh** | `LIVE READ` |
| `wallet_watchAsset` (Import SYN) | only on explicit **Import SYN**; decimals read **live first** | user-initiated, no tx |
| `accountsChanged` / `chainChanged` listeners | passive | keeps snapshot honest |

**Decimals are never hardcoded for SYN.** They are read live via `decimals()` before
formatting a balance or calling `wallet_watchAsset`. If the live read fails, the dependent
action degrades to `ADAPTER REQUIRED` rather than inventing `18`.

## Wallet states (`src/lib/wallet-adapter.ts` + `src/lib/wallet-context.tsx`)

`unsupported` (no EIP-1193) · `disconnected` (detected, not connected) · `wrongNetwork`
(connected, not Avalanche) · `ready` (connected on Avalanche) · `stale` (account/chain
changed, needs re-read). The SYN balance sub-state is its own machine: `idle → loading →
live | wrongNetwork | adapter-required | error`. Failure and user rejection are always
surfaced honestly; success is never faked.

## Shared UI

- `components/wallet/wallet-chip.tsx` — compact header chip (connect / network / short address).
- `components/wallet/wallet-state-panel.tsx` — the full reality panel (`NOT PRODUCTION AUTH`
  badge, address copy + Snowtrace, network + **manual wrong-network guidance**, live SYN
  balance, Import SYN, local-only forget).
- `components/wallet/import-syn-button.tsx` — `wallet_watchAsset` (decimals live-read first);
  on wrong network it is disabled with manual guidance (no switch is requested).
- `components/chain-badge.tsx` — a clean Avalanche C-Chain badge (`43114` / `AVAX` gas; a
  generic peak glyph, not a trademark asset) shown on the wallet chip, wallet panel, and
  reality-layer strip.
- `components/reality-layer-strip.tsx` — the **Demo Persona / Live Wallet Read / Adapter
  Required** strip (explanatory; reuses `StatusBadge` labels), shown near the home hero.
- `components/canonical-contracts.tsx` — renders `CANONICAL_CONTRACTS` through the existing
  `ContractCopyRow` as `READ-ONLY PRODUCTION PROOF` (copyable address + read-only explorer).
- `components/posture-legend.tsx` — the data-posture taxonomy rendered through `StatusBadge`.

## Surfaces wired (no redesign, nothing deleted)

- **Home:** the `RealityLayerStrip` near the hero (Demo Persona / Live Wallet Read / Adapter
  Required). The hero capital-routing panel is labeled **Capital routing preview**
  (`SIMULATED PROTOTYPE`) — never "live" over simulated values.
- **Header / chrome:** `WalletChip` on the member desktop top bar, member mobile identity
  strip, and the public header (desktop + mobile menu). Wrong-network is an informational
  chip with manual guidance — never a switch action.
- **Wallet page + Settings:** full `WalletStatePanel` (the real read-only layer, explicitly
  separate from the simulated role demo).
- **Registry / public-registry:** `CanonicalContractsList` (full / compact) + `PostureLegend`.
- **Economy (transparency) / public-economy:** canonical market & token contracts
  (SYN, USDC, Trader Joe SYN/USDC LP, SYN burn sink) + `PostureLegend`, alongside the
  existing read-only routing-wallet proof.
- **Fire / public-fire:** `PROOF_OF_FIRE_001` shown `READ-ONLY PRODUCTION PROOF` (tx + burn
  address, read-only explorer links); a live burn-event scan is `ADAPTER REQUIRED`; the
  aggregate stays a separate, labeled simulated figure; **no burn executes**.
- **Archive / public-archive:** canonical `Archive1155` contract row (`READ-ONLY PRODUCTION
  PROOF`); a personal memory-holdings scan (ERC-1155 `balanceOf`) is `ADAPTER REQUIRED`;
  anchoring / minting stays unwired.
- **Join / My Syndicate:** the real `WalletStatePanel`, clearly labeled separate from the
  simulated purchase flow / simulated seat & balances above it.

## Canonical external links (`src/lib/external-links.ts`)

Only links derivable from `PRODUCTION_PROOF`: Snowtrace address / tx, the DexScreener pair
(deterministic from the LP pair address), and the Trader Joe (LFJ) trade page (`EXTERNAL`).
Any unknown destination is `NOT WIRED`. External links open behind the existing
external-link warning.

## What is LIVE vs PROOF vs ADAPTER-REQUIRED

- **LIVE READ (real this session):** connected address, current chain, and SYN balance
  (read via `eth_call balanceOf` on the user's provider).
- **READ-ONLY PRODUCTION PROOF (static, inert):** every canonical contract/address +
  `PROOF_OF_FIRE_001`, shown with read-only explorer links.
- **ADAPTER REQUIRED (designed, not wired):** any live *event* scan (burn events, member
  index, activity feed, archive holdings) and all write paths (sale approve/buy, burn
  execute, mint, claim, source activation) — these need a future Codex production adapter.

## What stays simulated

The entire role system, all mock balances/receipts/activity/recognition, the burn
aggregate, chronicle, member identity, and the simulated toolkit actions in
`ACTION_REGISTRY` (including the *simulated* "Import SYN" toolkit action, which is distinct
from the reality layer's real `wallet_watchAsset` Import SYN button).

## Next Codex step

Implement the `ADAPTER REQUIRED` event scans behind the existing type-only seams in
`src/lib/adapters.ts` (real RPC / contract reads), keeping the wallet layer read-only.
Wiring any write path (sale, burn, mint, claim, source) remains a separate,
founder-approved effort and is intentionally out of scope here.
