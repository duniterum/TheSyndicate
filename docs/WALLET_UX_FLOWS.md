# Wallet UX Flows — QA Reference

**Audience:** real-user testers, QA, future contributors.
**Scope:** observable wallet-session behavior across the app. This is the
canonical reference for the testing round.

The data layer is verified (see `docs/WALLET_SESSION_AUDIT.md`). This document
defines the **expected user-facing behavior** in plain language plus a manual
QA checklist.

---

## Surfaces involved

| Surface | File | Role |
|---|---|---|
| Header wallet chip | `src/components/syndicate/HeaderWalletChip.tsx` | Global connection/network indicator + menu |
| Wallet context notice | `src/components/syndicate/WalletContextNotice.tsx` | Banner on `/wallet/$address` |
| Join purchase widget | `src/components/syndicate/LivePurchase.tsx` | Connect / approve / buy |
| Wallet debug readout | `src/components/syndicate/WalletDebugPanel.tsx` | Dev-only, hidden from real users |

---

## Flow A — Normal connect

1. Visitor lands on `/` disconnected.
2. Header chip shows **"Connect"** (desktop) or full-width "Connect Wallet" in mobile drawer.
3. Click → MetaMask (or injected) prompts.
4. On approval: header chip shows status pill (`Avalanche` or `Wrong net`) + truncated address.
5. Navigate to `/join` → `LivePurchase` reads the correct USDC balance for the connected address.

**Expected:** Same address visible in header and in Join. Balances match the connected wallet.

---

## Flow B — Account switch (mid-session)

1. Connected as Wallet A; viewing any page.
2. User opens MetaMask and selects Wallet B.
3. Header chip address updates to B within one render tick.
4. Any visible user-scoped data (member card, balances, allowances) re-fetches for B.
5. On `/join`, if a purchase was mid-flow (e.g. `Approving…`), the in-flight phase resets to `idle`, the approve/buy tx hashes clear, and the balance refetches. Input amount (`usdcInput`) is preserved.

**Expected:** No stale balances. No "Confirm in Wallet…" stuck on a tx that no longer belongs to the active account.

---

## Flow C — Public wallet page

1. User connected as B navigates to `/wallet/0xA…` (a different member).
2. `WalletContextNotice` renders a calm amber banner:
   *"You are viewing 0xA… — a public wallet page. Connected as 0xB…"*
3. Banner offers **"View my wallet"** (links to `/wallet/<B>`) and **"Disconnect"**.
4. **No auto-redirect.** The public archive remains intact.
5. If connected wallet matches the URL, banner switches to a green "This is your wallet" confirmation.
6. If disconnected, banner reads "Public wallet page — connect to view your own member status."

**Expected:** Mismatch is explained, never forced. Public URLs stay shareable.

---

## Flow D — Wrong network

1. User connected on Ethereum (or any non-Avalanche chain).
2. Header chip shows **amber "Wrong net"** pill.
3. Chip dropdown surfaces a primary **"Switch to Avalanche"** action.
4. Read-only data across the site still displays correctly (reads go through the configured Avalanche RPC).
5. On `/join`, the purchase CTA is blocked and displays the wrong-network state. Approve/Buy buttons cannot fire.

**Expected:** Read = available everywhere; write = blocked with a single recoverable CTA.

---

## Flow E — Disconnect

1. From any page, open header chip → **Disconnect**.
2. Header chip returns to the **"Connect"** affordance.
3. `useAccount().address` clears. All user-scoped queries disable.
4. `/join` returns to the disconnected state.
5. Public pages (`/wallet/*`, `/members`, `/founders`, etc.) remain fully usable.
6. Wallet context notice on `/wallet/$address` switches to the disconnected variant.

**Expected:** Disconnect never breaks navigation or hides public content.

---

## Manual QA checklist

Run through these before real-user testing. Mark each with ✅ / ❌ / N/A.

### Setup

- [ ] Two MetaMask accounts available (A and B). Optionally one with USDC on Avalanche.
- [ ] Tested in: desktop Chrome, desktop Safari, mobile Safari (or Chrome Android).
- [ ] At least one run in development mode (debug readout visible).

### Flow A — Normal connect

- [ ] Disconnected: header shows "Connect".
- [ ] Click Connect → MetaMask opens.
- [ ] After approval: header shows status pill + address.
- [ ] `/join` balance matches the connected wallet on Snowtrace.

### Flow B — Account switch

- [ ] Header address updates after MetaMask switch (no manual refresh).
- [ ] `/join` USDC balance updates to the new account.
- [ ] If mid-approve, button returns to idle (no stuck "Confirm in Wallet…").
- [ ] Member card / wallet preview updates for new address.

### Flow C — Public wallet page

- [ ] `/wallet/<other>` while connected: amber banner appears with both addresses.
- [ ] "View my wallet" link goes to `/wallet/<connected>`.
- [ ] `/wallet/<connected>` while connected: green "This is your wallet" banner.
- [ ] `/wallet/<any>` while disconnected: muted "Public wallet page" banner.
- [ ] No forced redirect in any case.

### Flow D — Wrong network

- [ ] Switch MetaMask to Ethereum: header chip turns amber, label "Wrong net".
- [ ] Chip dropdown shows "Switch to Avalanche" at the top.
- [ ] Clicking it triggers MetaMask network switch.
- [ ] `/join` blocks purchase; non-Join pages still render data.

### Flow E — Disconnect

- [ ] Header chip dropdown → Disconnect → chip returns to "Connect".
- [ ] `/join` returns to the disconnected state.
- [ ] `/wallet/<X>` still loads and displays the public archive.
- [ ] Navigating around the site after disconnect: no errors, no blank pages.

### Accessibility (header chip)

- [ ] Tab focuses the chip; visible focus ring.
- [ ] Enter / Space opens the dropdown.
- [ ] Tab cycles through dropdown items with visible focus.
- [ ] Escape closes the dropdown and returns focus to the trigger.
- [ ] Click outside closes the dropdown.
- [ ] Mobile drawer: wallet section reachable, all actions tappable (≥44px).

### Cross-cutting

- [ ] No console errors on connect, switch, or disconnect.
- [ ] No layout shift when the chip mounts.
- [ ] Browser back/forward after disconnect still works.

---

## Known limitations (acceptable for MVP testing)

- **One-frame hydration flicker.** On returning users, `isConnected` is `false`
  for one tick before wagmi rehydrates the session. Cosmetic only; data is
  correct. Cookie/SSR initialState is intentionally deferred (see
  `WALLET_SESSION_AUDIT.md` L1) to avoid introducing session-state risk.
- **No E2E framework.** Playwright/Cypress not installed. Adding one purely for
  wallet flows is out of scope; this checklist is the QA contract. If E2E is
  later added, port these flows directly.

---

## Reporting a wallet bug

When filing during testing, include:

1. Browser + wallet (e.g. "Chrome 124 + MetaMask 11.x").
2. Which flow above failed (A–E) or "new flow".
3. Steps observed vs. expected.
4. Screenshot of header chip + debug readout (dev mode) if reproducible.

The debug readout (bottom-right corner in dev only) captures the most useful
state in one frame: address, chainId, isConnected, wrong-network, viewing
address, USDC balance, allowance, Join phase.
