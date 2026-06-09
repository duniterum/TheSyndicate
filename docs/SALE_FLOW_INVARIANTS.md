# Sale Flow Invariants (canonical)

Authority: this document is the canonical source for every NFT mint and
SYN token sale write path. Every new sale, mint, claim, or write
component MUST satisfy every invariant below before merge.

Composes with:
- docs/CANONICAL_REGISTRY.md (chain · explorer · contract · ABI · ID)
- docs/ACTIVATION_RUNBOOK.md (activation steps)
- docs/WALLET_SESSION_AUDIT.md (session/account model)
- src/lib/wallet-freshness.ts (runtime guard)
- src/lib/__tests__/chain-registry-guard.test.ts (regression lock)

## Why this file exists

We hit the same class of bug twice:

1. **First Signal sale** — user signed a tx with a different injected
   account than the one shown in the header, because the writeContract
   call did not pin `account` and the header did not react to
   `accountsChanged`.
2. **Patron Seal sale** — same root cause, same symptom (stale wallet
   chip, tx confirmed on wrong address, link on explorer but app shows
   prior account).

Both were fixed with the same three-part guard. To make the fix
permanent and prevent re-introduction on SeatRecord721 and every
future contract, this file records the invariants and the test that
locks them.

## The six invariants (every write path)

Each invariant has a runtime owner and a test owner. Missing either
fails CI.

### 1. Canonical registry only
- Read chain, explorer, contract, ABI, and Archive1155 IDs **only**
  from `src/lib/chain-registry.ts`, `src/lib/contract-registry.ts`,
  `src/lib/archive-id-registry.ts`.
- Never inline an address, ABI fragment, chain id, or token id in a
  component.
- Locked by: `chain-registry-guard.test.ts` (duplicate-address scan).

### 2. Freshness guard before every write
- Call `assertFreshWallet(addressFromWagmi)` immediately before every
  `writeContractAsync` (approve, mint, buy, claim, transfer, …).
- On mismatch: surface `walletFreshnessMessage()`, abort the write,
  emit `wallet_freshness_mismatch` analytics.
- Locked by: `chain-registry-guard.test.ts` "NFT mint and SYN sale
  writes call assertFreshWallet before writeContractAsync".

### 3. Account pinning
- Every `writeContractAsync({ … })` MUST include
  `account: <addressFromWagmi>` explicitly.
- This forces viem/wagmi to sign with the address the UI is showing,
  even if the injected provider has silently switched.
- Locked by: same guard test (regex search for `account:` in every
  write component).

### 4. Header / app state reacts to `accountsChanged`
- `WalletAccountSynchronizer` is mounted in `__root.tsx`.
- It subscribes to `window.ethereum.accountsChanged`, calls wagmi
  `reconnect()`, and invalidates the query cache so the header chip,
  balances, and gated UI re-render.
- Never remove this component or move it below a route boundary.

### 5. Explorer links go through the registry
- Every tx/address/contract link uses `txUrl`, `txUrls`, `addressUrl`,
  `contractUrl`, `erc1155TokenUrl` from `chain-registry.ts`.
- Never hardcode `avascan.info/tx/...` (bare path 404s) or any other
  explorer URL.
- User preference is honored via `applyPreferenceOrder` in
  `txUrls()` and the app-owned redirect at `/x/tx/$hash`.

### 6. Mint-hash persistence (Archive1155 mint flows)
- Every Archive1155 mint component MUST call
  `useMintHashPersistence(wallet, contract, tokenId)` and feed the
  `effectiveApproveHash` / `effectiveMintHash` (wagmi data ?? persisted)
  into `useWaitForTransactionReceipt`, the progress tracker, the
  explorer link, the success-panel tx code block, and the receipt-driven
  `useEffect`s.
- Reason — proven on ID 1, missing on ID 3: after a page refresh or a
  MetaMask account switch, `useWriteContract().data` resets to `undefined`.
  Without persistence, the explorer link, success panel, and tracker all
  vanish even though the transaction is on-chain. With persistence, the
  receipt query rebinds, the tracker resumes, and `archiveTxUrl()` still
  has a valid hash to format.
- Hash storage is per `(wallet, contract, tokenId)` so flows for
  different IDs never collide.
- Legacy First Signal key (`syndicate.mint.first-signal:…`) is migrated
  transparently to the new key on first read; no founder action needed.

## Per-flow trace

### First Signal mint (`/nft`)
- Component: `src/components/syndicate/MintFirstSignal.tsx`
- Writes: `approveTx.writeContractAsync` (USDC approve) →
  `mintTx.writeContractAsync` (mint).
- Both call `verifyFreshWallet("first_signal_approve" |
  "first_signal_mint")` and pin `account: wallet`.

### Patron Seal mint (`/nft`)
- Component: `src/components/syndicate/MintPatronSeal.tsx`
- Writes: USDC approve → mint.
- Both call `verifyFreshWallet("patron_seal_approve" |
  "patron_seal_mint")` and pin `account: wallet`.

### SYN token sale (`/token-sale`)
- Component: `src/components/syndicate/LivePurchase.tsx`
- Writes: USDC approve → buy.
- Both call `verifyFreshWallet("live_purchase_approve" |
  "live_purchase_buy")` and pin `account: address`.

## Adding a new sale / mint / claim component

Required steps (in this order):

1. Add the contract to `contract-registry.ts`. Add the ID to
   `archive-id-registry.ts` if it is an Archive1155 token. Never inline.
2. Import `{ assertFreshWallet, walletFreshnessMessage }` from
   `@/lib/wallet-freshness`.
3. Define `verifyFreshWallet(surface: string)` helper that wraps
   `assertFreshWallet(addressFromWagmi)`, surfaces the message, and
   returns boolean.
4. Every `writeContractAsync` must be preceded by
   `if (!(await verifyFreshWallet("<surface>"))) return;` and must
   include `account: <addressFromWagmi>`.
5. Render every tx/address link via the chain-registry helpers.
6. Run `bunx vitest run` — the guard test will fail loudly if any
   of the above is missing.

## What we will never do again

- Read an address from a component file or duplicate it across files.
- Call `writeContractAsync` without `account:` set.
- Trust the wagmi `address` to match the injected provider's active
  account without a freshness check at write time.
- Wait for `accountsChanged` to propagate naturally — always force a
  `reconnect()` and `queryClient.invalidateQueries()`.
- Build a new explorer link by string concatenation.

## Decision Lens Verdicts

| Lens | Verdict | Note |
|---|---|---|
| Founder | ✓ | Eliminates a class of "wrong wallet signed" support tickets. |
| Investor | ✓ | Protects revenue: every approve+buy goes to the visible address. |
| Growth | ✓ | Removes a silent failure that erodes trust on first mint. |
| Behavioral | ✓ | User sees a clear message when MetaMask drifts, instead of confusion. |
| UX | ✓ | Header always matches the active account; no ghost state. |
| Product | ✓ | One pattern reused across First Signal, Patron, SYN, future contracts. |
| Staff Eng | ✓ | Single source of truth + regression test = no re-introduction. |
| QA | ✓ | Guard test scans every write site automatically. |
| A11y | ✓ | Freshness warning is plain text, screen-reader friendly. |
| SEO | ✓ | No surface impact. |
