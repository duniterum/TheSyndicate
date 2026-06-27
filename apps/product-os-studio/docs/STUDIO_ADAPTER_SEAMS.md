# STUDIO_ADAPTER_SEAMS

> **Source of truth:** `src/lib/adapters.ts` (TYPE-ONLY). These are the production-shaped
> seams the Studio expects a future **Codex adapter layer** to satisfy. They contain **no
> implementations, import no production code, and perform no RPC / chain reads / wallet
> writes.** Everything in the Studio today is `SIMULATED`. **Read with:**
> `STUDIO_PRODUCTION_ADAPTATION_PLAN.md`, `STUDIO_KNOWN_SIMULATIONS.md`.

## Why type-only

A seam documents *the shape production must provide* so the Studio's components can render
from the same contract whether the data is simulated (today) or real (later). Swapping
simulated data for a real adapter behind the same interface is the entire porting strategy —
**no UI rewrite**. The porting map is now present and supplies canonical constants: the Studio
shows the real deployed values as `READ-ONLY PRODUCTION PROOF` (static, inert) in the UI, while
the adapter seams stay type-only with **no live values** — a live read is `ADAPTER REQUIRED`.

## Shared posture types

- `AdapterStatus` — `SIMULATED | ADAPTER_REQUIRED | READ_ONLY_PROOF | NOT_WIRED`.
- `ReadState` — `idle | loading | live | partial | stale | error | read-only-proof |
  adapter-required`; carried by `ReadResult<T>` (with `data?`, `asOf?`, `error?`).
- `ContractRefStatus` — `READ-ONLY PRODUCTION PROOF | PROTOTYPE PLACEHOLDER |
  ADAPTER REQUIRED | NOT WIRED` (mirrors the `StatusBadge` labels shown in the UI).

## The seams

| Seam (interface) | Stands in for (production) | Studio posture | Address/value |
|------------------|----------------------------|----------------|---------------|
| `WalletAdapter` | `wagmiConfig`, `Web3Provider`, `useWalletGate` / `WalletGate` | `PROTOTYPE WALLET STATE` · `NOT PRODUCTION AUTH` | n/a (no real account) |
| `ContractRegistryAdapter` | canonical address constants | `READ-ONLY PRODUCTION PROOF` (constants) · live read `ADAPTER REQUIRED` | **READ-ONLY PRODUCTION PROOF** (from `PRODUCTION_PROOF`) |
| `MembershipSaleAdapter` | `MembershipSaleV3`, `LivePurchase`, `useSaleStats`, `useQuoteSyn` | `ADAPTER REQUIRED` (no wallet write) | **ADAPTER REQUIRED** |
| `MemberIndexAdapter` | purchase-event scan, `buildHolderIndex` | `READ-ONLY` (simulated) | derived |
| `ActivityAdapter` (+ `PurchaseEvent`) | `useLivePurchaseEvents`, `useProtocolEvents` | `READ-ONLY` (simulated) | derived |
| `SourcePolicyAdapter` | `SourceRegistryV1`, `ZERO_SOURCE_ID` | `V1 CANDIDATE` (PAUSED, no public link/claim) | n/a |
| `ArchiveAdapter` | `Archive1155` (ERC-1155) reads | `READ-ONLY PRODUCTION PROOF` (reads) · mint `NOT WIRED` | **ADAPTER REQUIRED** (mint) |
| `BurnProofAdapter` | `SYN_BURN_ADDRESS`, `useSynBurnEvents`, `assignProofOfFireNumbers`, `PROOF_OF_FIRE_NNN` | `READ-ONLY PRODUCTION PROOF` (`PROOF_OF_FIRE_001` + burn address) · live scan `ADAPTER REQUIRED` · **no execute** | **READ-ONLY PRODUCTION PROOF** (`burnAddress`) |
| `TransparencyAdapter` | canonical routing + transparency surfaces | `READ-ONLY` · canonical 70/20/10 | n/a |

## Seam notes (the non-obvious rules)

- **Wallet is never authority.** `WalletSnapshot.isProductionAuth` is the literal `false`.
  `connectWallet()` / `switchToAvalanche()` / `reconnect()` / `disconnect()` are declared but **not wired** in the Studio.
- **Sale never writes.** `MembershipSaleAdapter.approveUsdc` / `buy` return `Promise<never>`
  by design — the seam exists so the *flow steps* (`PurchaseFlowStep`) and quote/stats shapes
  are production-shaped, not so the Studio can transact. Default source is `ZERO_SOURCE_ID`.
- **Burn has no `execute()`.** `BurnProofAdapter` exposes **read-only** `proofs()` only.
  Burn execution is intentionally **outside** the Studio seam. `priceImpact` is typed `null`
  (a burn retires supply; it is never minted, never a price promise, never yield).
- **Source policy is paused.** `SourcePolicy.publicLinkActive` and `claimUiActive` are the
  literal `false`; default stays `ZERO_SOURCE_ID`. No downline/upline concept exists.
- **Archive is memory only.** `ArchiveItem.memoryOnly` is the literal `true`; `mint()` is
  not wired. Reads model `Archive1155`; minting is `ADAPTER REQUIRED`.
- **Routing math is canonical.** `RoutingSplit` is `70 / 20 / 10` (Vault / Liquidity /
  Operations) — the only non-simulated numbers in the seams.

## Attaching production (later)

1. Use the canonical constants from `STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md`
   (now **present** — real deployed values shown as `READ-ONLY PRODUCTION PROOF`; still never invent values).
2. Implement each adapter behind its existing interface (real RPC / wagmi / contracts).
3. Flip the posture label (`READ-ONLY PRODUCTION PROOF` / `ADAPTER REQUIRED` →
   `LIVE NOW`) once a seam is genuinely wired (a constant becomes a live read).
4. The Studio's components keep rendering from the same shapes — **no redesign required.**
