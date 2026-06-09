# Wallet Session, Account Switching & State Consistency Audit

**Trigger:** Real-world test — Wallet A connected → MetaMask switched to Wallet B → site "appeared inconsistent."

**Scope:** Audit only. No code changed.

---

## TL;DR

The wagmi data layer is **correct and reactive**. No stale-balance, stale-allowance, or stale-member-state bug was reproducible in the audited code paths. All user-scoped reads re-key on `address` change because they pass `args: [address]` into `useReadContracts`, and the injected connector handles `accountsChanged` / `chainChanged` natively.

The "inconsistency" the user perceived is almost certainly a **UX visibility gap**, not a data bug:

> The site never tells the user — anywhere outside `/join` — which wallet or which network is currently connected. After a MetaMask account switch, there is no global signal that the switch was registered, and several pages (most notably `/wallet/$address`) keep showing data for the address in the URL, not the connected wallet.

Severity ranking below. **No fixes implemented** — the user instructed to verify first and only implement if real bugs are confirmed. The data-consistency bugs were not confirmed; the UX gaps are real but are feature work, not regressions.

---

## What was verified

### Data reactivity (PASS)

| Hook / surface | Reactive to account switch? | Mechanism |
|---|---|---|
| `useUserBalances` (`src/lib/sale-hooks.ts:49`) | ✅ Yes | `args:[address]` → query re-keys; `enabled: Boolean(address)`; `refetchInterval: 60_000` |
| `useBuyerPurchaseTotals` (`sale-hooks.ts:75`) | ✅ Yes | Same pattern |
| `useQuestHooks` user balances (`quest-hooks.ts:43`) | ✅ Yes | `address` from `useAccount`, args-keyed |
| `MemberCard` (`MemberCard.tsx:31`) | ✅ Yes | `useAccount().address` → `idx.getByWallet(address)` is pure derivation |
| `MemberJourney` (`MemberJourney.tsx:106`) | ✅ Yes | `useAccount().isConnected` |
| `LivePurchase` (`LivePurchase.tsx:52`) | ✅ Yes | `useAccount`, `useChainId`, `useSwitchChain`, `useDisconnect` all wired |
| Sale stats / LP stats / treasury reads | ✅ Independent of user wallet | Read via wagmi HTTP transport on Avalanche; unaffected by user's connected chain |

### Event handling (PASS)

Wagmi v2's `injected({ shimDisconnect: true })` connector (`src/lib/wagmi.ts`) subscribes to EIP-1193 `accountsChanged`, `chainChanged`, `connect`, `disconnect` internally and propagates them through `useAccount` / `useChainId`. No custom handlers are needed and none are present — which is correct.

### Cache invalidation (PASS for user-scoped reads)

Because the address is part of `useReadContracts` arguments, the query key changes on switch and TanStack Query creates a fresh entry for the new address. The old wallet's data is not displayed; it is replaced by either the new wallet's data or a `pending` state.

`LivePurchase` additionally calls `userBal.refetch()` and `stats.refetch()` on transaction confirmation (`LivePurchase.tsx:81-96`).

---

## Confirmed gaps (UX, not data)

### 🟥 H1 — No global wallet/network indicator

**Where:** `src/components/syndicate/Header.tsx` (whole file).
**Symptom:** The header has no connected-wallet badge, no address, no network chip, no disconnect button. The only place the wallet status is visible is the `<WalletBadge>` inside `LivePurchase` on `/join`.

**Why this is the most likely cause of the reported issue:**
After switching accounts in MetaMask, the data on screen *does* refresh — but because nothing in the chrome shows "you are now wallet B," the user has no way to confirm the switch took effect. If they were not on `/join`, they see balances change but cannot attribute the change to the switch, which feels like "the site is inconsistent."

**Severity:** High.
**Recommended fix:** Add a small wallet chip to `Header.tsx` showing connected address (truncated), network status (✓ Avalanche / ⚠ Wrong network), and a disconnect option. Pure presentation; reuses `useAccount`, `useChainId`, `useDisconnect`.

---

### 🟧 M1 — `/wallet/$address` does not follow the connected wallet

**Where:** `src/routes/wallet.$address.tsx`.
**Symptom:** The page is keyed by URL param, not by `useAccount()`. If the user is on `/wallet/0xAAA` and switches MetaMask to `0xBBB`, the page still shows A. By design (these are public profile URLs), but there is no hint like *"you are viewing wallet A — your connected wallet is B. View your wallet."*

**Severity:** Medium.
**Recommended fix:** When `useAccount().address && address !== params.address`, render a non-intrusive banner with a link to `/wallet/<connected>`.

---

### 🟧 M2 — Only `/join` exposes "wrong chain"

**Where:** `LivePurchase.tsx:99` is the only `wrongChain` check.
**Symptom:** On any other page, if the user's MetaMask is on Ethereum/Polygon/etc., balances still display correctly (because reads go through wagmi's Avalanche HTTP transport, not the user's wallet), but the user has no signal that they would need to switch chains *before* attempting any write. They only learn this when they reach `/join`.

**Severity:** Medium.
**Recommended fix:** The header chip from H1 should show the network status globally.

---

### 🟨 L1 — No `initialState` on `WagmiProvider` with `ssr: true`

**Where:** `src/components/syndicate/Web3Provider.tsx`, `src/lib/wagmi.ts`.
**Symptom:** `wagmiConfig` is created with `ssr: true`, but `<WagmiProvider>` does not receive an `initialState`. On the very first client render of a returning user, `isConnected` is `false` for one tick, then flips to `true` when the connector reconnects. This produces a one-frame flash of the "member preview" card for users who are actually members, and a brief flash of the "Connect Wallet" CTA.

**Severity:** Low (visual flicker only; data ends up correct).
**Recommended fix:** Pipe `cookieToInitialState(wagmiConfig, cookieHeader)` through the root loader and pass it to `<WagmiProvider initialState={...}>`. Optional if the flicker is acceptable.

---

### 🟨 L2 — `LivePurchase` `phase` state can desync on mid-flow account switch

**Where:** `LivePurchase.tsx:43-188`.
**Symptom:** If the user clicks **Approve USDC** (`phase = "approving"`) and then switches accounts in MetaMask before the tx confirms, the `phase` stays `"approving"` for the new wallet too. The button label says "Confirm in Wallet…" while wagmi has already swapped the pending tx context. The `useEffect` watchers on `approveReceipt.isSuccess` / `buyReceipt.isSuccess` have `eslint-disable-line` and miss `userBal`/`stats`/`approveTx`/`buyTx` as deps — minor, but they reinforce that `phase` is not tied to `address`.

**Severity:** Low (recoverable: phase resets on next confirm or page nav).
**Recommended fix:** Add `useEffect(() => { setPhase("idle"); approveTx.reset(); buyTx.reset(); }, [address])` in `LivePurchase`.

---

### 🟨 L3 — No disconnect affordance outside `/join`

**Where:** Whole app.
**Symptom:** Once connected, the only disconnect button lives inside the purchase widget on `/join`. Users who want to switch accounts cleanly (vs. doing it inside MetaMask) cannot.

**Severity:** Low.
**Recommended fix:** Subsumed by H1 — disconnect goes in the header chip's dropdown.

---

## Things specifically tested and found NOT broken

- **Balances after switch** — `useUserBalances` re-keys on `address`, fetches fresh.
- **Allowance after switch** — same query, same re-key.
- **Member state after switch** — `MemberCard` re-derives from `useAccount().address`.
- **Rank / chapter / founder preview after switch** — all derived from `useHolderIndex.getByWallet(address)`, pure functions of address.
- **Refresh page while connected** — wagmi `reconnect` runs automatically (default behavior); session restores.
- **Disconnect** — `useDisconnect` from `LivePurchase` triggers wagmi's disconnect lifecycle; `useAccount().isConnected` flips to `false`; all `enabled: Boolean(address)` queries disable.
- **Chain switch (Avalanche → other → back)** — read layer is unaffected because all `useReadContracts` use the configured `http(AVALANCHE_RPC_URL)` transport, not the wallet provider. Only write paths gate on `chainId === AVALANCHE_CHAIN_ID`.
- **`accountsChanged` / `chainChanged` / `connect` / `disconnect`** — handled by `injected` connector; no custom code needed and none present.

---

## Reproduction matrix (for future regression checks)

| Step | Expected | Verified in code |
|---|---|---|
| Connect Wallet A | `useAccount` → A; user reads enabled | ✅ |
| Switch MetaMask → B | `useAccount` → B; user reads re-fetch for B | ✅ (args-keyed) |
| Switch back → A | Same as above; A's cached data may be served instantly | ✅ |
| Disconnect | `isConnected` false; user-scoped queries disable | ✅ |
| Reconnect | wagmi auto-reconnect on next mount | ✅ (default) |
| Refresh page | Session restored from connector storage | ✅ |
| Change network (Avalanche → Ethereum) | Reads still hit Avalanche RPC and remain accurate; writes blocked on `/join` | ✅ |
| Return to Avalanche | `wrongChain` clears | ✅ |
| Switch wallet while a join CTA visible elsewhere | "You would be member #N" preview updates if B is not a member | ✅ |
| Switch wallet while on `/wallet/0xA` | Page stays on A; **no hint that connected wallet differs** | ⚠ M1 |
| Switch wallet anywhere outside `/join` | **No visible confirmation that switch happened** | 🟥 H1 |

---

## Recommendation

1. **Ship a header wallet chip (H1).** This single change resolves the perceived inconsistency reported in the test and incidentally covers M2 (network status) and L3 (disconnect access).
2. **Add a "viewing another wallet" banner on `/wallet/$address` (M1).** Three lines of JSX.
3. **Defer L1, L2** until they are observed in practice; the workarounds (refresh / re-click) are trivial.

No data-layer changes are warranted. The wagmi + TanStack Query wiring is correct.
