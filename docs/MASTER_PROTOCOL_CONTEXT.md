# MASTER PROTOCOL CONTEXT — The Syndicate

**Single source of truth. Every future dev session MUST read this file before changing code.**

Last verified: 2026-06-04 — Avalanche C-Chain (chainId 43114).
All values below are reconciled with `src/lib/syndicate-config.ts`. If this
file and the code disagree, the code wins **only** if the code points at a
verified onchain address. Otherwise update the code to match this file.

---

## 1. Network

| Field         | Value                                              |
| ------------- | -------------------------------------------------- |
| Chain         | Avalanche C-Chain                                  |
| Chain ID      | `43114`                                            |
| RPC           | `https://api.avax.network/ext/bc/C/rpc`            |
| USDC decimals | `6`                                                |
| SYN decimals  | `18`                                               |
| Explorers     | Avascan (primary), Routescan, Snowtrace, Sourcify  |

---

## 2. Live Contracts (deployed, verifiable)

| Component                 | Address                                                                    | Status |
| ------------------------- | -------------------------------------------------------------------------- | ------ |
| SYN Token (ERC20)         | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170`                              | LIVE   |
| USDC (Avalanche native)   | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`                              | LIVE   |
| Membership Sale           | `0x0020Df30C127306f0F5B44E6a6E4368D2855842d`                              | LIVE   |
| LP Pair · Trader Joe v1   | `0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389` (SYN/USDC, AMM/JLP)           | LIVE   |

### Allocation / Routing Wallets

| Wallet                                  | Address                                       | Role                                            |
| --------------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| Vault (Treasury)                        | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` | Receives 70% USDC + holds Vault Reserve SYN     |
| Liquidity                               | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` | Receives 20% USDC + LP-bound SYN                |
| Operations                              | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` | Receives 10% USDC (operations & community)      |
| Membership Distribution & Achievements  | `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` | Holds SYN sold via Membership Sale              |
| Founder                                 | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` | Founder allocation (12-mo cliff, 36-mo vest)    |
| Partnerships                            | `0xf5BEdEEfe48f746d96C1847a5595318579bBcaCf` | Future partner allocations (governance approved)|
| Contributors                            | `0xa55132346C70e63d0c4E0Fb15F35075760dDEF7a` | Builders / designers / operators                |
| Future Ecosystem                        | `0x2530393881820AFe789f1c5D83817B70e46d2963` | Unannounced ecosystem expansion                 |

### Pending Contracts

- Genesis NFT — PENDING
- Programmatic Vault — PENDING
- Governance — PENDING
- AI Layer — PENDING
- Referrals — PENDING

Every UI surface MUST render `PENDING` (with an amber chip) for these — never a placeholder address, never a fake link.

---

## 3. Deployment Reference Points

| Event                              | Reference                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| Membership Sale deployment block   | `87,157,852` (chunked log scans MUST start here)                                                 |
| Membership Sale creation tx        | `0x30e1378a66dc1037d49cb7557a162635f37a90ffde80e973bd9750d39927bdb6`                            |
| LP Pair creation tx                | `0x60f04521171a3f878f8b801c66a9e8c49f4931b9cb949b6c563b7ba47e9cbe05`                            |
| Initial LP seed                    | 200 SYN + 2 USDC @ $0.01 (price-discovery anchor; current reserves are read live from the pair) |

---

## 4. Token Spec (SYN)

- Name / Symbol: `The Syndicate / SYN`
- Total Supply: `1,000,000,000` (fixed, no mint, no future mint)
- Type: ERC20 · Burnable · Permit
- Tax: 0%
- Owner / Admin / Pause / Blacklist / Transfer restrictions: **None**

---

## 5. Routing Rules (Membership Sale — enforced onchain)

Every USDC purchase is split atomically inside the Membership Sale contract:

| Bucket     | %   | Destination wallet                                |
| ---------- | --- | ------------------------------------------------- |
| Vault      | 70% | `0x205DdC8921A4C60106930eE35e1F395c8D13f464`     |
| Liquidity  | 20% | `0xa9b072db8DcDbb470235204B69D37275d74a2e25`     |
| Operations | 10% | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80`     |

Other invariants:

- Access rate: **1 SYN = $0.01 USDC** (fixed; ranks only change multiplier/visibility, never price).
- Minimum purchase: **5 USDC**.
- SYN inventory: drawn from the Membership Distribution wallet
  `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8`.
- Event emitted per purchase: `TokensPurchased(address indexed buyer, uint256 indexed purchaseId, uint256 usdcAmount, uint256 synAmount, uint256 vaultAmount, uint256 liquidityAmount, uint256 operationsAmount)`.

---

## 6. Tokenomics (1,000,000,000 SYN total)

| Bucket                                    | %   | SYN          | Holding wallet                                   |
| ----------------------------------------- | --- | ------------ | ------------------------------------------------ |
| Membership Distribution & Achievements    | 35  | 350,000,000  | `0x975a…ECec8`                                   |
| Vault Reserve                             | 25  | 250,000,000  | `0x205D…f464`                                    |
| Founder (12-mo cliff, 36-mo vest)         | 12  | 120,000,000  | `0x88EC…Dd73`                                    |
| Liquidity                                 | 10  | 100,000,000  | `0xa9b0…2e25`                                    |
| Partnerships                              | 8   | 80,000,000   | `0xf5BE…BcaCf`                                   |
| Contributors                              | 5   | 50,000,000   | `0xa551…EF7a`                                    |
| Future Ecosystem                          | 5   | 50,000,000   | `0x2530…2963`                                    |

Each bucket's actual balance MUST be read live from `balanceOf(SYN, wallet)`
and reconciled. UI shows `CONFIRMED` if `live = target` and `DRIFT` otherwise.

---

## 7. Roadmap (live vs pending)

| Module                       | Status   |
| ---------------------------- | -------- |
| SYN token                    | LIVE     |
| Membership Sale              | LIVE     |
| Trader Joe SYN/USDC LP       | LIVE     |
| Activity indexer             | LIVE (RPC log scan from deployment block) |
| Allocation balance reads     | LIVE     |
| Genesis NFT                  | PENDING  |
| Programmatic Vault contract  | PENDING  |
| Governance                   | PENDING  |
| AI Layer                     | PENDING  |
| Referrals                    | PENDING  |

---

## 8. Data Source Rules (NON-NEGOTIABLE)

Every number rendered in the UI MUST come from one of these sources:

1. **Live onchain reads** via wagmi / viem against Avalanche RPC.
   - SYN: `totalSupply`, `balanceOf`, `decimals`.
   - Membership Sale: `purchaseCount`, `totalUsdcRaised`, `totalSynSold`,
     `totalBuyers`, `availableSyn`, `buyerUsdcTotal`, `buyerSynTotal`.
   - LP Pair: `getReserves`, `totalSupply`, `token0`, `token1`.
2. **Live event logs** — `TokensPurchased` from `SALE_DEPLOYMENT_BLOCK`
   (chunked in 2,000-block windows).
3. **Constants from `src/lib/syndicate-config.ts`** — only for invariants
   defined in this document (addresses, decimals, routing %, total supply,
   access rate, deployment block, allocation targets).
4. **Computed values** — derived purely from (1)–(3). The derivation MUST be
   visible in the UI (e.g. "USDC × 2", "implied from reserves").

Forbidden:

- Hand-typed mock metrics rendered with a `LIVE` chip.
- Static "example deposit" numbers shown as current pool state.
- Dead links, `#` hrefs, placeholder addresses.
- Demo data and live data sharing the same visual treatment (DEMO PREVIEW
  must always carry the amber `DEMO PREVIEW` chip).
- "Coming soon" without a corresponding `PENDING` chip.

If a fetch fails or a value is genuinely unavailable, render `PENDING`
(amber chip) with a one-line explanation of what's missing.

Every displayed number MUST be traceable to its source — either inline
("source: Membership Sale contract reads") or via a `ContractLink` /
explorer button next to it.

---

## 9. Canonical Primitives

- `ContractLink` (`src/components/syndicate/Primitives.tsx`) — short address +
  copy + explorer + per-address extras (DexScreener, Trader Joe, Sourcify,
  Routescan, SnowTrace).
- `extrasForAddress(addr)` — returns the verification chip set for a given
  live address. Update there when adding a new contract.
- `importSynToWallet` + `MetaMaskIcon` (`src/lib/wallet-import.tsx`) —
  EIP-747 wallet add, used in `/token` and the global footer strip.
- `useLpStats`, `useSaleStats`, `useBuyerPurchaseTotals` (`src/lib/sale-hooks.ts`).
- `useLivePurchaseEvents` (`src/lib/activity-hooks.ts`) — chunked log scan
  from `SALE_DEPLOYMENT_BLOCK`.
- `useAllocationBalances` — live SYN balance per allocation wallet with
  CONFIRMED/DRIFT badge.

---

## 10. Audit Targets (Phase: Protocol Data Completion)

Sweep every route and replace any value not sourced per §8:

`/` `/registry` `/liquidity` `/transparency` `/tokenomics` `/token`
`/join` `/activity` `/ranks` `/nfts` `/docs` `/faq` `/vault` `/roadmap`
`/whitepaper`

For each placeholder/mock/static value found:

1. Identify the live source (contract call, event, or constant from §8).
2. Replace the render with the live value, or with `PENDING` if no source
   exists yet.
3. Add a one-line source disclosure next to the value.
4. Remove any dead link, placeholder address, or fake `LIVE` chip.

Known remaining mock surfaces to convert or label DEMO PREVIEW:

- `/vault` dashboard tiles (vault USDC, growth %, members joined, holders,
  NFTs minted, circulating supply, founder vesting status, latest episode) —
  must either read live or render `PENDING`.
- Tokenomics "Distributed through membership" demo number — must read
  `totalSynSold` and the live SYN balance of the Membership Distribution
  wallet.
- Any "Initial liquidity"-style copy in `/whitepaper`, FAQ, etc. — keep as
  historical context only, never as the **current** value.

---

## 11. How to use this file

- First action of every dev session: open `docs/MASTER_PROTOCOL_CONTEXT.md`.
- New addresses or modules: update this file **and** `syndicate-config.ts`
  in the same change.
- Any new metric in the UI: confirm it can be sourced per §8 before
  building.
- If a value cannot be sourced live, ship it as `PENDING` — never as a
  hand-typed number.
