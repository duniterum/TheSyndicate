---
name: Dev Invalid hook call on wallet resync
description: Why the recurring "Invalid hook call" on wallet_account_resync is dev-only noise, not a bug — don't re-investigate.
---

# Dev "Invalid hook call" on wallet resync

The recurring console error `Invalid hook call. Hooks can only be called inside of the body of a function component…` that fires alongside the `wallet_account_resync` / `accounts_changed` analytics event is **DEV-ONLY noise, not a real defect**. It logs as an error but the page still renders.

**Why it is not a real bug (verified):**
- The app code in the `accountsChanged` path is clean — `WalletAccountSynchronizer` and `wallet-freshness` call React hooks only at top level; the event handler (`sync`) only calls `reconnect`, `queryClient.invalidateQueries()`, and `track` (none are hooks).
- Exactly one React is installed and versions match (`react` === `react-dom`); `@types/react`, `@ai-sdk/react`, `zustand/react` are unrelated, no nested duplicate `react`.
- The Lovable `@lovable.dev/vite-tanstack-config` preset already dedupes React/TanStack.
- It is therefore a transient **Vite dev dual-dispatcher** that appears during the wagmi reconnect + full `invalidateQueries` cascade. Production ships a single React and strips this dev-only invariant, so there is **zero production impact**.

**Why:** spent a sprint confirming this; it looks alarming (red error on a common action) but is inert. Recording so it is not re-investigated.

**How to apply:** do not chase this error. Do NOT add `resolve.dedupe` / `optimizeDeps` for react to `vite.config.ts` — the preset comment explicitly warns that re-adding what it already handles breaks the app with duplicate plugins. If it ever appears in a PRODUCTION build (minified `#321`-style), that is a different, real problem — re-open then.

**Adjacent observation (not yet acted on):** the resync calls `queryClient.invalidateQueries()` with no filter, nuking the whole cache + full refetch on every wallet switch. Scoping it is a perf win but touches wallet-switch correctness (the path `wallet-freshness.ts` protects) — treat as production-risk / stop-for-approval.
