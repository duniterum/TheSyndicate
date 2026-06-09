# Activation Runbook — Archive1155 IDs and Future Contracts

Reusable checklist for activating a new Archive1155 artifact id or a new
Syndicate smart contract. Do not skip steps. Do not perform any step UI-side
until the on-chain step has been verified by an independent read.

## A. Archive1155 — public-mint activation checklist

For each id (e.g. ID 4 / ID 5 / future ids):

1. **Verify `configured(id) === true`** (read-only `viem` call).
2. **Verify `ownerOnly(id) === false`** — else the id is owner-mint only.
3. **Verify `rendererMode(id) === ONCHAIN_SVG`** (or the deliberate mode).
4. **Verify `maxSupply(id) > 0`** — never activate with a zero cap.
5. **Verify `price(id)` matches design** (USDC, 6 decimals).
6. **Verify `walletLimit(id)` matches design**.
7. **Verify `uri(id)` resolves** and renders the intended metadata.
8. **Verify rights metadata** contains no financial-rights language.
9. **Freeze the definition**: `freezeArtifactDefinition(id)`. **IRREVERSIBLE.**
10. **Verify `definitionFrozen(id) === true`**.
11. **Add the id to `ARCHIVE_ID_REGISTRY`** in source — registry-first.
12. **Activate**: `setDropActive(id, true)`.
13. **Verify `active(id) === true`** via a fresh RPC read.
14. **Verify `isMintable(id, wallet, 1) === true`** for an eligible wallet.
15. **Verify the UI flips to LIVE** (no manual override, no static label).
16. **Verify wallet freshness before test mint**: the header address, MetaMask
    selected account, USDC balance/allowance reads, and `isMintable(id,wallet,1)`
    must all refer to the same wallet. If MetaMask was switched mid-flow,
    reconnect/resync first — never sign while the UI shows an old address.
17. **Mint one test artifact** with a known wallet.
18. **Verify** total supply +1, wallet balance +1, tx on Snowtrace + Avascan
    `/blockchain/c/tx/`.

### Emergency rollback

- `setDropActive(id, false)` — disables the mint instantly.
- `freezeArtifactDefinition(id)` is **irreversible**. Do not call it before
  step 8 is signed off.

## B. New smart contract — activation checklist

For each new contract (e.g. SeatRecord721, future Vault contract):

1. **Add a PENDING entry** to `CONTRACT_REGISTRY` with `address: null`.
   Never push a placeholder address.
2. **Deploy** to Avalanche C-Chain via the agreed deployment path.
3. **Verify** source on Sourcify + Snowtrace + Routescan.
4. **Update the registry entry** with the real address and flip `status`
   to `LIVE`.
5. **Wire ABI** into `src/lib/<contract>-abi.ts` and reference it from
   `CONTRACT_REGISTRY.abiSource`.
6. **Read tests** against the deployed contract before any write path is
   wired into the UI.
7. **UI integration** — read-only first, write paths last.

## C. Explorer / wallet guardrails

- Wallet config explorer default must remain Snowtrace bare origin (see
  `docs/CANONICAL_REGISTRY.md`).
- All in-app links go through `txUrl`, `addressUrl`, `tokenUrl`,
  `contractUrl`, `erc1155TokenUrl`. Never concatenate.
- If a user reports a 404 from MetaMask's "View on block explorer", point
  them at `MetaMaskExplorerFix.tsx` on `/nft`. Never call
  `wallet_addEthereumChain` automatically.
- Every write UI must call `assertFreshWallet(...)` immediately before
  `writeContractAsync(...)` and pass the expected `account`. This prevents the
  stale-wallet failure where the header shows wallet A but MetaMask signs from
  wallet B after an account switch.
- `WalletAccountSynchronizer` must stay mounted at the app root so
  `accountsChanged` invalidates reads and reconnects Wagmi before the next
  approval/mint/buy attempt.

## D. Prohibited during activation

- Sending transactions outside the documented checklist.
- Changing the ABI or contract while activation is in progress.
- Re-deploying a "fixed" version under a new address without updating the
  registry first.
- Inferring addresses from prior contracts or naming conventions.
- Marking a UI state LIVE before the on-chain read confirms it.
