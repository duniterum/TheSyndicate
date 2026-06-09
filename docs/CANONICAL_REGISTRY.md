# Canonical Registry — Chain · Explorer · Contract · Archive1155 IDs

This is the entry point. **Do not infer chain, explorer, address, or ABI
data.** Import from the canonical registry.

| Layer            | Source of truth                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Chain truth      | `src/lib/chain-registry.ts` → `CHAIN_REGISTRY`                   |
| Explorer truth   | `src/lib/chain-registry.ts` → `EXPLORER_REGISTRY` + helpers      |
| Contract truth   | `src/lib/contract-registry.ts` → `CONTRACT_REGISTRY`             |
| Archive1155 IDs  | `src/lib/archive-id-registry.ts` → `ARCHIVE_ID_REGISTRY`         |
| ABI truth        | `src/lib/archive-nft-abi.ts`, `src/lib/sale-abi.ts`              |
| Wallet defaults  | `src/lib/wagmi.ts` (uses chain-registry origin)                  |

## Explorer rules (Avalanche C-Chain)

- **Wallet-facing default**: Snowtrace at bare origin (`https://snowtrace.io`).
  MetaMask and viem strip paths and append `/tx/<hash>`, so the default URL
  must have `pathname === "/"`. Any path on the default config produces dead
  links like `https://avascan.info/tx/<hash>` → 404.
- **In-app tx link**: `txUrl(hash)` → Snowtrace.
- **Fan-out tx links**: `txUrls(hash)` → Snowtrace + Avascan + Routescan.
- **Avascan tx path**: `/blockchain/c/tx/{hash}`. The bare `/tx/{hash}` form
  is **broken** and must never be generated.
- **Address page**: `addressUrl(addr)` → Avascan C-Chain `/blockchain/c/address/`.
- **Token page**: `tokenUrl(addr)` → Snowtrace `/token/`.
- **ERC-1155 page**: `erc1155TokenUrl(contract, id)` — links to contract
  with `?a=<id>` (no first-class per-id route exists on Avalanche).

## Contract registry rules

- Every address the app references must appear in `CONTRACT_REGISTRY`.
- `status: "LIVE"` requires a real 0x-address.
- `status: "PENDING"` requires `address: null`. **No placeholder strings.
  No inferred addresses. No `0x0…`.**
- `SeatRecord721` stays `PENDING` until a real deployment tx hash exists.

## Archive1155 ID registry rules

- Every artifact id (1–9, and any future id) must have an entry in
  `ARCHIVE_ID_REGISTRY` **before** UI may call it configured or active.
- `publicMintAllowed: false` blocks public mint CTAs even if the contract
  reports `active=true` (defence-in-depth against owner-only id leaks).
- `activation: "NOT_CONFIGURED"` (e.g. ID 9) must never claim on-chain state.

## MetaMask / Avascan caveat

If a wallet's "View on block explorer" button opens a 404 on Avascan, the
wallet has the bare Avascan origin stored. The correct Avalanche C-Chain
path is `/blockchain/c/tx/<hash>`. The app's own links use the canonical
helpers above and are never affected. `MetaMaskExplorerFix.tsx` offers a
one-tap helper that proposes Snowtrace via `wallet_addEthereumChain` only
when the user clicks it — never automatically.

## Guard tests

- `src/lib/__tests__/chain-registry-guard.test.ts`
- `src/lib/__tests__/explorer-urls.test.ts`
- `src/lib/__tests__/archive1155-canonical.test.ts`

These enforce: no duplicated address literals, no hand-built explorer URLs,
no bare Avascan `/tx/`, ID 2 never publicly mintable, ID 9 never claimed
configured, SeatRecord721 address stays null.
