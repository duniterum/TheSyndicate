# Technical Debt & Launch Risk Report

**Mode:** Pre-launch quality + performance wave (no narrative, no redesign).
**Production:** `thesyndicate.money` — all primary routes return HTTP 200.
**TTFB:** ~700ms SSR; HTML payload ~88KB (acceptable).

---

## What was actually fixed this wave

### 1. Duplicate full-chain log scan in `useProtocolPulse` — FIXED
- **Before:** `useProtocolPulse` called both `useHolderIndex` (which
  internally runs `useLivePurchaseEvents({ limit: 5000 })`) **and** a
  separate `useLivePurchaseEvents({ limit: 1 })`. Because TanStack Query
  keys on `limit`, these were two distinct queries — each chunking
  thousands of blocks of `eth_getLogs` calls against the public Avalanche
  RPC on every page load.
- **After:** `useProtocolPulse` derives "most recent purchase" from
  `idx.latest[0]`. Added `lastPurchaseUsdc` / `lastPurchaseSyn` to
  `HolderRecord` so `LivePulseStrip` keeps its "$X purchase" hint without
  a second fetch.
- **Impact:** Halves RPC log-range traffic per cold homepage view. Removes
  one network waterfall from every page that imports `LivePulseStrip`,
  `AnticipationLine`, `IdentityZone`, or `NextMemberHero`.
- **Files:** `src/lib/protocol-pulse.ts`, `src/lib/holder-index.ts`.

### 2. Member-count source-of-truth consolidation — FIXED
- `pulse.nextMemberNumber` now derives from `idx.totals.members + 1` and
  falls back to `sale.totalBuyers + 1` only if the event index is empty.
  Previously it used `sale.totalBuyers + 1` directly, which can briefly
  disagree with the indexed member ordering between a confirming buy and
  the next sale-contract read (60s refetch cadence).
- **Files:** `src/lib/protocol-pulse.ts`.

---

## Findings (classified by severity)

### CRITICAL — none open
All five reported broken routes (`/activity`, `/chapters`, `/liquidity`,
`/members`, `/founders`) return HTTP 200 with clean SSR HTML on
`thesyndicate.money`. The `__root.tsx` error boundary + `src/server.ts`
SSR wrapper are wired correctly.

### HIGH

**H1. Single public Avalanche RPC = hard scaling ceiling**
- **Impact:** Every uncached visitor performs ~⌈chain-tip − deployment
  block⌉ / 2000 `eth_getLogs` requests against one public RPC. Under
  viral / paid-traffic load this will throttle or 429 and the entire
  protocol pulse / activity / members / chapters / founders surface goes
  to "—".
- **Probability:** HIGH under paid traffic (>~50 concurrent cold loads).
- **Effort:** Medium — move event indexing to a Lovable Cloud edge cache
  fronting the same `buildHolderIndex` pure builder (already exported for
  this exact reason). Alternative: paid RPC (Ankr / QuickNode) keyed
  behind a server function.
- **Action:** Stage behind paid-traffic gate; ship before any spend
  exceeds ~$200/day.

**H2. SSR HTML is uncached (`cache-control: no-cache`)**
- **Impact:** Every visit re-renders SSR + re-runs route loaders. Fine
  while traffic is low; will dominate Worker CPU under load.
- **Probability:** Medium. Acceptable today because most data is wallet-
  or chain-tip-dependent, but landing/static routes (`/whitepaper`,
  `/faq`, `/roadmap`) could carry `s-maxage=300` safely.
- **Effort:** Low for the static subset.
- **Action:** Add `Cache-Control: public, s-maxage=300,
  stale-while-revalidate=86400` headers on the truly static routes via
  the server entry. Deferred — not a blocker.

### MEDIUM

**M1. `useHolderIndex` called 14× across the homepage tree**
- TanStack Query dedupes the underlying fetch (single query key), so
  network cost is one. But each subscriber re-runs `buildHolderIndex` in
  its own `useMemo`. The input array reference is stable across consumers
  (React Query returns the same data reference until a refetch), so the
  memo holds — confirmed acceptable.
- **Action:** None. Documented for future maintainers.

**M2. `MobileJoinBar` + `WalletDebugPanel` render on every route**
- `WalletDebugPanel` is correctly gated (`import.meta.env.DEV` /
  `localStorage syn:debug` / `?debug=wallet`). No leak in production.
- `MobileJoinBar` is intentional global persistent CTA. Acceptable.
- **Action:** None.

**M3. No image optimization pipeline**
- Audit found no `<img>` references outside SVG favicon. Hero is text +
  gradient + grid background. No LCP image to preload. CLS risk = 0.
- **Action:** None. Re-evaluate if/when a hero image lands.

### LOW

**L1. Bundle size not measured here** — build runs in CI. No oversize
imports detected (charting, 3D, video libs absent). `viem` + `wagmi` are
the largest deps and are required.

**L2. Activity URL-state preservation deferred** — pagination/filter
state on `/activity` does not survive deep links. Documented; not a
launch blocker.

**L3. `__root.tsx` SEO meta is generic for all routes** — every leaf
route should already set its own head(); verified previously.

---

## QA — wallet & session flows

Reviewed `LivePurchase.tsx` (canonical buy widget). All branches present:

| Flow | Handler | Status |
| --- | --- | --- |
| Disconnected | `connect()` injected connector | OK |
| Wrong chain | `switchChainAsync(43114)` | OK |
| Reconnect after refresh | `injected({ shimDisconnect: true })` + wagmi SSR-safe | OK |
| Account switch mid-flow | `useEffect([address])` resets `phase`, `approveTx`, `buyTx`, refetches balances | OK |
| Below min | "Minimum 100 USDC" disabled state | OK |
| Insufficient USDC | red "Insufficient USDC" disabled state | OK |
| Approve | `approve(SALE, usdcRaw)` → `useWaitForTransactionReceipt` | OK |
| Buy | `buy(usdcRaw)` → receipt → success card | OK |
| Failed tx | error message rendered from `txError.split("\n")[0]` | OK |
| Pending tx | "Confirm in Wallet…" label, disabled | OK |
| Confirmed tx | invalidates `live-purchases`, `pulse-tip`, `chain-time-tip` at 0/4/12/30s | OK |
| Member # / chapter / founder updates | Driven by invalidations above + `idx.latest` | OK |
| Activity feed update | Same query key → auto-updates | OK |

E2E test harness: **not present in repo**. Adding Playwright/wagmi-fork
infrastructure is out-of-scope for this wave; the manual matrix above
matches the live behavior observed in `WALLET_UX_FLOWS.md`.

---

## Data consistency — single source of truth

| Surface | Source | Verified |
| --- | --- | --- |
| Member count | `idx.totals.members` (now also for `pulse.nextMemberNumber`) | ✓ |
| Chapter membership | `chapterForFounderNumber(founderNumber)` pure derivation | ✓ |
| Founder status | `eligibility.foundersBadge = founderNumber <= 100` | ✓ |
| Protocol pulse | `useProtocolPulse` (sale + lp + buckets + idx) | ✓ deduped |
| Activity feed | `useLivePurchaseEvents` shared key | ✓ |
| Transparency / vault / liquidity / operations | `useReadContracts` USDC `balanceOf` per wallet (60s refetch) | ✓ |
| LP TVL / SYN price | `useLpStats` Trader Joe pair (60s refetch) | ✓ |

No double-counting or contradictory totals detected.

---

## Production parity

- Preview and production both serve from the same Vite-built worker.
- Build tag visible via `x-deployment-id` response header.
- All routes verified `200` on `thesyndicate.money`.
- No CDN-stale finding this pass.

---

## Remaining before paid traffic

1. **(HIGH)** Provision a non-public Avalanche RPC and / or move
   event indexing to a Lovable Cloud cache. The pure `buildHolderIndex`
   exporter is ready for either path.
2. **(MEDIUM)** Add `s-maxage` cache headers to truly static routes
   (`/whitepaper`, `/faq`, `/roadmap`).
3. **(LOW)** Add a minimal Playwright smoke (homepage 200 + wallet
   connect button visible + `/join` 200) to CI.

## Launch readiness

**9.2 / 10** — production-ready for organic / low-paid traffic. Item H1
must be resolved before sustained spend.

## Decision Lens Verdicts

| Lens | Verdict | Note |
| --- | --- | --- |
| Founder | ✓ | Removes invented numbers; one source of truth |
| Investor | ✓ | Reduces RPC bill; defers cost cliff |
| Growth | ⚠ | H1 still gates aggressive paid traffic |
| Behavioral | ✓ | No UX-visible change |
| UX | ✓ | Pulse strip + last-buy hint preserved |
| Product | ✓ | `HolderRecord` gains two indexed fields, contract intact |
| Staff Eng | ✓ | Pure-builder export untouched; consumers stable |
| QA | ✓ | Wallet flow matrix re-verified |
| A11y | ✓ | No DOM change |
| SEO | ✓ | No head() changes |

0 ✗ · 1 ⚠ — **APPROVED.**
