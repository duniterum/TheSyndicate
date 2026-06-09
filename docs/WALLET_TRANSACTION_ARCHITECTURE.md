# Wallet / Transaction / Payment — Canonical Architecture

Authority: this document is the canonical source for every wallet read,
write, payment, transaction, persistence, and explorer interaction on
the Syndicate site. Every new NFT, mint, sale, claim, or dashboard
surface MUST satisfy the rules below before merge.

Composes with:
- docs/CANONICAL_REGISTRY.md (chain · explorer · contract · ABI · ID)
- docs/SALE_FLOW_INVARIANTS.md (the six write-path invariants)
- docs/ARCHIVE1155_CANONICAL_ARCHITECTURE.md (Archive1155-specific contract)
- docs/WALLET_SESSION_AUDIT.md (session model background)

## Why this document exists

We hit and fixed the same class of bug three times:

1. First Signal — wrong wallet signed; missing freshness + account pinning.
2. Patron Seal — same root cause; same fix.
3. Patron Seal — explorer link + success panel vanished on refresh;
   missing mint-hash persistence.

Each fix is now an invariant. This document collects the invariants into
one canonical wallet + transaction + payment architecture so future NFTs
(SeatRecord721, Archive1155 IDs 4–9, claims, airdrops) inherit the
solution by construction — not by accidental copy-paste.

## A. Canonical wallet / session layer

**Source of truth:** `src/lib/wallet-session.ts` → `useWalletSession()`.

Every page that needs wallet context — header, NFT pages, sale, registry,
My Syndicate, activity, member profile — MUST consume `useWalletSession()`
instead of calling `useAccount` / `useChainId` / `useDisconnect` directly.

`WalletSession` shape:
- `address`        — lowercased `0x…` or `null`
- `short`          — `0x1234…abcd` or `null`
- `chainId`        — currently selected chain id
- `expectedChainId` — Avalanche C-Chain (43114), from `CHAIN_REGISTRY.id`
- `wrongNetwork`   — `true` when connected but not on Avalanche
- `state`          — `disconnected | connecting | reconnecting | wrong-network | connected`
- `switchToExpectedChain()` — single network-switch action
- `disconnect()`

Composition rules:
- Address normalization is done once, in `wallet-session.ts`.
- `WalletAccountSynchronizer` (mounted in `__root.tsx`) keeps wagmi in
  sync with `accountsChanged`. Never duplicate this listener.
- Per-write freshness (`assertFreshWallet`) STILL runs immediately before
  every `writeContractAsync`. The session layer is for reads/UI; freshness
  is the runtime safety guard.

## B. Canonical transaction lifecycle

**Source of truth:** `src/lib/tx-lifecycle.ts`.

Every write surface must speak the same phase vocabulary:

```
idle
preparing
needs-wallet
wrong-network
needs-approval
approval-pending
approval-confirmed
ready
tx-pending
tx-confirmed
failed
rejected
```

Components compose `deriveLifecycle({...})` from their wagmi booleans
instead of inventing per-flow state machines. This makes analytics,
labels, and progress trackers consistent across SYN sale, First Signal,
Patron Seal, and every future contract.

## C. Canonical payment flow (USDC)

**Source of truth:** `src/lib/payment-flow.ts`.

Every USDC purchase follows this shape:
1. Read balance (live).
2. Read allowance for the spender contract (live).
3. `assessPayment({ balance, allowance, required })` → `PaymentReadiness`.
4. If `needsApproval`, call `approve(spender, exactApprovalAmount(required))`.
5. Wait for approval receipt (`useWaitForTransactionReceipt`).
6. Submit the action (`buy` / `mint` / `claim`).
7. Wait for action receipt.
8. Refetch balance / allowance / on-chain ownership.

Rules:
- **Exact-allowance approval.** Never `MaxUint256`. `exactApprovalAmount(required)`
  enforces this.
- **Receipt-driven success.** Never declare success on submit alone —
  always wait for receipt + `status === "success"`.
- **Persisted hashes.** Approve + action hashes MUST flow through
  `useMintHashPersistence(wallet, contract, tokenId)` (or the
  `tx-history` recorder for non-Archive1155 actions). After a refresh
  or wallet switch the success panel + explorer link MUST still render.

## D. Canonical explorer / data layer

**Source of truth:** `src/lib/chain-registry.ts` (helpers exported as
`txUrl`, `txUrls`, `addressUrl`, `tokenUrl`, `contractUrl`,
`erc1155TokenUrl`, `safeExplorerFallback`).

Rules:
- No component or hook may concatenate explorer URLs by hand.
- `txUrls()` honors the user's saved explorer preference.
- App-owned redirect at `/x/tx/$hash` resolves to the user's preferred
  explorer, insulating links from individual explorer outages.
- Explorer unavailable is a **non-blocking** state: the success panel
  still renders, the hash is still shown, the user can copy it.
- MetaMask + bare Avascan caveat documented in
  `docs/CANONICAL_REGISTRY.md`. The app's links are never affected
  because they go through these helpers.

## E. Dashboard / ownership architecture

For any connected wallet, the following surfaces MUST show consistent
data, sourced from the same hooks:

| Field                | Source                                          | Truth class |
|----------------------|-------------------------------------------------|-------------|
| SYN balance          | wagmi `useReadContract` (SYN_TOKEN)             | LIVE        |
| Member status        | sale + ID-1/ID-3 holdings via `holder-index`    | LIVE        |
| Member number        | `holder-index` (mint order)                     | LIVE        |
| Chapter              | `chapters.ts` mapping over member number        | DERIVED     |
| Rank                 | `protocol-truth.ts`                             | DERIVED     |
| NFT ID 1 ownership   | `archive-balances-hook`                         | LIVE        |
| NFT ID 3 ownership   | `archive-balances-hook`                         | LIVE        |
| Recent transactions  | `tx-history.ts` (per-wallet, local)             | LOCAL       |
| Explorer links       | `chain-registry.ts` helpers only                | CANONICAL   |
| Last refresh time    | React Query `dataUpdatedAt`                     | LIVE        |

Every metric carries a LIVE / INDEXED / LOCAL label. Local persistence
is for **transaction memory only** — it MUST NEVER imply ownership or
member status without an on-chain confirmation.

## F. Local persistence rules

Allowed in `localStorage`:
- Recent tx hashes (per wallet) — `tx-history.ts`
- Last successful approve + mint hashes per `(wallet, contract, tokenId)` — `mint-persistence.ts`
- UI dismissal flags (banners, callouts)
- User explorer preference — `explorer-preference.ts`
- Last connected wallet reference (wagmi default)

Forbidden in `localStorage`:
- Fake ownership / minted status
- Fake member number / chapter / rank
- Fake balances
- Anything that would let a user appear to be a member without an
  on-chain holding

## G. Error framework

**Source of truth:** `src/lib/tx-errors.ts` → `classifyTxError(err)`.

Every wallet/payment/tx error must pass through `classifyTxError` before
display. The classifier maps raw errors to one of:

`user-rejected-approval · user-rejected-tx · insufficient-usdc ·
insufficient-gas · wrong-network · allowance-too-low · contract-paused ·
sold-out · wallet-limit-reached · not-active · not-eligible · rpc-error ·
explorer-unavailable · tx-stalled · tx-reverted · unknown`

Every kind has a stable `{ title, message, retryable }` shape. Never
render raw wallet stack traces as primary copy.

## H. Future NFT readiness checklist

Before any new public mint or sale ships, it MUST satisfy:

- [ ] Contract address comes from `contract-registry.ts` (status: LIVE).
- [ ] Archive1155 ID listed in `archive-id-registry.ts` (if applicable).
- [ ] ABI imported from `archive-nft-abi.ts` / `sale-abi.ts`.
- [ ] Wallet/session read via `useWalletSession()`.
- [ ] Freshness guard (`assertFreshWallet`) before every `writeContractAsync`.
- [ ] `account: <addressFromWagmi>` pinned on every write.
- [ ] Payment flow uses `assessPayment` + `exactApprovalAmount`.
- [ ] Mint-hash persistence (`useMintHashPersistence(wallet, contract, tokenId)`).
- [ ] Explorer links via `chain-registry.ts` helpers only.
- [ ] Errors mapped via `classifyTxError`.
- [ ] Success panel survives refresh + wallet switch.
- [ ] Ownership refresh after receipt confirmation.
- [ ] Regression tests pass (`chain-registry-guard`, `archive1155-canonical`,
      `tx-history`, `wallet-switch-e2e`, `tx-errors`, `tx-lifecycle`,
      `payment-flow`, `wallet-session`).

## I. Tests / guards

Locked by CI:
- `chain-registry-guard.test.ts` — no duplicated addresses, every write
  site calls `assertFreshWallet`, no hand-built explorer URLs.
- `archive1155-canonical.test.ts` — no inlined token ids, ID 9 not claimed
  configured, ID 2 never publicly mintable.
- `explorer-urls.test.ts` — bare Avascan `/tx/` is never generated.
- `wallet-switch-e2e.test.ts` — `accountsChanged` triggers resync; stale
  wallet writes are blocked.
- `tx-history.test.ts` — per-wallet persistence + de-dupe.
- `tx-errors.test.ts` — classifier covers known error kinds.
- `tx-lifecycle.test.ts` — phase derivation is total and deterministic.
- `payment-flow.test.ts` — readiness math is correct for all cases.
- `wallet-session.test.ts` — address normalization + shortening.

## J. What we will never do again

- Read wallet state from raw wagmi hooks scattered across components.
- Submit a write without freshness check + `account:` pin.
- Concatenate explorer URLs in components.
- Trust ephemeral wagmi `useWriteContract().data` to survive refresh.
- Render raw wallet errors as primary UI copy.
- Store derived ownership or member status in `localStorage`.
- Approve `MaxUint256` for USDC purchases.

## Decision Lens Verdicts

| Lens | Verdict | Note |
|---|---|---|
| Founder | ✓ | One pattern reused across every present + future NFT and sale. |
| Investor | ✓ | Removes the class of bugs that lose revenue or trust. |
| Growth | ✓ | Success panels + explorer links survive refresh — no silent failures. |
| Behavioral | ✓ | Classifier turns cryptic errors into actionable copy. |
| UX | ✓ | Lifecycle vocabulary is consistent across surfaces. |
| Product | ✓ | New NFTs ship by composing primitives, not re-implementing flows. |
| Staff Eng | ✓ | Single source of truth per concern + regression tests = no drift. |
| QA | ✓ | Guard tests scan every write site automatically. |
| A11y | ✓ | Plain-language error and lifecycle labels are screen-reader friendly. |
| SEO | ✓ | No surface impact. |
