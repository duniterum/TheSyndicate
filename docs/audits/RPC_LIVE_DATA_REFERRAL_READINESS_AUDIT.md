# The Syndicate — RPC, Live-Data & Referral-Readiness Audit

**Type:** Planning / report sprint only. **No implementation.** Nothing in this file
renames variables, changes addresses, edits copy, or redesigns UI.
**Scope:** Factual map of the current system before adding RPC/async/caching/referral layers.
**Method:** Live code inspection (June 15, 2026). Where a fact could not be confirmed from
source it is marked **UNKNOWN** with the file that must be checked.

---

## 1. Current RPC / provider structure

| Question | Finding | Evidence |
| --- | --- | --- |
| Where RPC URLs are defined | Hardcoded string constants | `src/lib/syndicate-config.ts` — `AVALANCHE_RPC_URL` (primary), `AVALANCHE_RPC_URL_FALLBACK` (secondary) |
| Which provider(s) | Two **public** RPCs: `api.avax.network` (primary), `rpc.ankr.com/avalanche` (fallback) | `src/lib/syndicate-config.ts` |
| Fallback logic | Yes — viem `fallback()` transport, primary → ankr, `{ rank: false, retryCount: 1 }` | `src/lib/wagmi.ts` (transports block) |
| Client vs server | **Client-side** (wagmi hooks: `useReadContract`, `useReadContracts`, `useBalance`, `getLogs`). `ssr: true` is set on the wagmi config but **no on-chain reads were found inside TanStack Start loaders** | `src/lib/wagmi.ts` (`ssr: true`), hooks in `src/lib/sale-hooks.ts`, `src/lib/activity-hooks.ts` |
| Hardcoded public RPC? | **Yes** — both URLs are literals in source, not secrets | `src/lib/syndicate-config.ts` |
| Env vars used correctly? | RPC URLs are **not** read from `import.meta.env` / `process.env`. There is no env override and no private/keyed RPC. Connector is `injected({ shimDisconnect: true })` (no WalletConnect projectId needed) | `src/lib/syndicate-config.ts`, `src/lib/wagmi.ts` |
| Extra health probe | A manual `fetch` health check pings both endpoints to drive UI connectivity status | `src/lib/archive-rpc-health.ts` |

**Net:** One chain (Avalanche C-Chain 43114), two **public** endpoints behind a viem
fallback transport, all reads client-side, URLs hardcoded (no env/secret, no paid provider).
Provider injected via `Web3Provider` in `src/components/syndicate/Web3Provider.tsx`
(mounted at `src/routes/__root.tsx`).

---

## 2. Current live data architecture

**Live data routes:** `/` (home), `/join`, `/my-syndicate`, `/members`, `/activity`,
`/wallet/$address`, plus archive/mint surfaces.

**Render strategy:** Static shell paints first; on-chain data loads **async after first
paint** via TanStack Query + wagmi. Surfaces degrade through `PENDING → PARTIAL → LIVE`
rather than blocking render (e.g. `MemberCockpit`, `MemberWallBody`).

**Major hooks (classified):**

| Hook | File | Type |
| --- | --- | --- |
| `useHolderIndex` | `src/lib/holder-index.ts` | **Event-derived** (canonical member index from first-purchase events) |
| `useLivePurchaseEvents` | `src/lib/activity-hooks.ts` | **Event-derived** (`TokensPurchased` V1; `Purchased`+`Routed` V2) |
| `useSaleStats` / `useSaleState` / `useUserSaleLimits` / `useAllocations` | `src/lib/sale-hooks.ts` | **Direct read** (sale state, totals, era, limits) |
| `useUserBalances` | `src/lib/sale-hooks.ts` | **Direct read** (USDC/SYN `balanceOf`) |
| `useLpStats` | `src/lib/sale-hooks.ts` | **Direct read** (Trader Joe pair `getReserves` + token order) |
| `useChainTip` | `src/lib/chain-time.ts` | **Direct read** (shared chain tip) |
| `useArchiveBalances` | `src/lib/archive-balances-hook.ts` | **Direct read** (ERC1155 `balanceOf`) |
| `useUsdcFlows` | `src/lib/onchain-events.ts` | **Event-derived** (USDC `Transfer` filtered by treasury wallets) |
| `useLpSwaps` | `src/lib/onchain-events.ts` | **Event-derived** (LP `Swap` events) |

**Caching / persistence:**
- Global React Query defaults: `staleTime ≈ 60s`, `gcTime ≈ 24h` — `src/lib/query-client.ts`.
- Shared chain tip: `staleTime ≈ 15s`, `refetchInterval ≈ 30s`; one query feeds all
  block-anchored derivation — `src/lib/chain-time.ts`.
- **No `persistQueryClient`.** Persistence is **manual localStorage hydrate/dehydrate**:
  - Purchase events / holder index → `src/lib/purchase-events-cache.ts` (full canonical
    scan, schema `v3`; on load seeds the cache **STALE** so a background refresh runs without flicker).
  - Wallet reads → `src/lib/wallet-reads-cache.ts` (persists public ERC20/ERC1155 facts;
    **excludes `allowance`** — a write-gate value — by design).
- BigInt safety: `query-client.ts` overrides `queryKeyHashFn` with wagmi's `hashFn` so
  bigint args in keys don't throw on `setQueryData`/`getQueryState`.

**Static / config data:** contract addresses, tokenomics, ranks, chapters/eras, metric
definitions are static config (see §3), not RPC.

---

## 3. Current protocol data modules

**Central registries**
- Contract addresses → `src/lib/contract-registry.ts` (`CONTRACT_REGISTRY`; each entry
  labeled LIVE / DEPLOYED / PENDING).
- Metrics → `src/lib/protocol-metrics-registry.ts` (`PROTOCOL_METRICS`: id, label, formula,
  verification/hook path — the canonical metric dictionary).

| # | Domain | File(s) | Status |
| --- | --- | --- | --- |
| 1 | Membership Sale | `src/lib/sale-hooks.ts` (state), `src/lib/activity-hooks.ts` (events) | LIVE |
| 2 | SYN supply / price | `src/lib/protocol-metrics-registry.ts` (+ supply hook); price = **fixed access rate $0.01**, not LP spot | LIVE |
| 3 | Vault / Liquidity / Operations balances | `src/lib/onchain-events.ts` (`useUsdcFlows` by treasury wallet) | LIVE |
| 4 | 70/20/10 routing | `src/lib/revenue-streams.ts` (Membership-Sale stream only; enforced on-chain) | LIVE |
| 5 | Holder Index / member numbers | `src/lib/holder-index.ts` (from de-duped purchase logs) | LIVE |
| 6 | Rank distribution | `RANKS_V2` in `src/lib/syndicate-config.ts`; distribution computed in `holder-index.ts` | LIVE |
| 7 | Activity feed | `src/lib/protocol-events.ts` (purchases + transfers + burns → one stream) | LIVE |
| 8 | Chronicle / Memory / Institutional Register | `src/lib/chronicle-entries.ts` (+ adjacency/register libs) | LIVE (curated) |
| 9 | NFT / Archive1155 | `src/lib/archive-contract-state.ts`, `src/lib/archive-balances-hook.ts`, `src/lib/archive-safe-reads.ts` | LIVE |
| 10 | My Syndicate dashboard | `src/routes/my-syndicate.tsx` (+ `src/components/syndicate/cockpit/*`) | LIVE |
| 11 | Referral preview | `src/lib/future-referral.ts` (reserved model), `src/lib/preview/referral.ts` (simulated), `src/routes/referral.tsx` (preview UI) | **Mock / quarantined — reward status always PENDING** |

---

## 4. Current event indexing

- **Reads historical events:** Yes — `getLogs` in `src/lib/activity-hooks.ts`.
  V1 `TokensPurchased`; V2 `Purchased` + `Routed` (joined by `transactionHash`).
- **Stores derived snapshots:** Yes — normalized purchase snapshots in **localStorage**
  via `src/lib/purchase-events-cache.ts` (full event list + scan cursor `lastScannedBlock`;
  key includes chainId + contract + deployment block to prevent cross-contamination).
- **Recompute every load?** No — hydrates from snapshot, then **incrementally** scans from
  `lastScannedBlock − REORG_OVERLAP` to chain tip.
- **Block ranges:** Chunked walker (`scanChunked`) at **2,000 blocks/chunk** (Avalanche
  `getLogs` limit). Full cold scan starts at `SALE_DEPLOYMENT_BLOCK` (87,157,852).
- **Reorg overlap:** Hardcoded `REORG_OVERLAP = 50n` blocks.
- **Transaction receipts:** **Not used** — all data from event logs (receipts only appear in
  `TxProofDrawer` for user-initiated tx decoding, not indexing).
- **Hardcoded fallback/seed purchase data:** **None** — only real on-chain logs are trusted.
  V2 is **dormant** until `SALE_V2_LIVE` is true. (Genesis/seed entries exist only for the
  Institutional Register, not for purchase indexing.)
- **Consumers:** ~31 surfaces depend on the single scan via `useHolderIndex` /
  `useLivePurchaseEvents` — one scan fans out to the whole app.

**RPC-overload risks (event layer):**
- **Cold full scan** (cleared cache / new device): >1M blocks ÷ 2,000 = many serial requests.
- **Per-tab duplication:** each browser tab runs its own background scan (localStorage is
  shared but in-flight scans are not coordinated).
- **V2 dual scan:** `Purchased` + `Routed` are two `getLogs` passes over the same range
  (doubles V2-window load) once V2 is live.
- Mitigations already present: incremental cursor, shared chain-tip query, `staleTime` /
  `refetchInterval`, STALE-seed hydration.

---

## 5. Current referral readiness (report only — do not build)

**Frontend files that already exist:**
- `src/lib/referral-attribution.ts` — first-touch `?ref=` capture (localStorage only).
- `src/lib/future-referral.ts` — reserved attribution **model**; `rewardStatus` forced to `PENDING`.
- `src/lib/preview/referral.ts` — **simulated** tier thresholds (0, 5, 20, 50, 100) + mock leaderboard.
- `src/routes/referral.tsx` + `src/components/preview/ReferralPreview.tsx` — public **preview** page (simulated).
- `src/components/syndicate/ReferralCapture.tsx` — root-level URL-param capture.
- `src/components/syndicate/MyReferralCard.tsx` — dashboard shell, hardcoded PENDING ("nothing tracked or owed").

**Contracts (Foundry harness, `contracts/`):**
- `contracts/src/CommissionRouterV1.sol` — tiered ladder (30–80% **of the 10% Operations
  slice**), count-only axis, push-then-escrow on failed transfer. Labeled **hardened draft,
  UNAUDITED**.
- `contracts/src/SyndicateSaleV2.sol` — sale engine exposing an external `ICommissionRouter`
  hook in `buy()`.

**Deployment status (per `contracts/broadcast/Deploy.s.sol/43114/run-latest.json`):**
- `SyndicateSaleV2` — **deployed** to mainnet with `initialRouter = 0x0000…0000` (router
  **disabled / slot empty**).
- `CommissionRouterV1` — **not deployed** (not in the broadcast).
- **No live on-chain referral hook exists.** Referral data is local-attribution + preview only.

**Data model a future on-chain referral would need (derived from existing source, not a proposal to build):**
- Route input: `(buyer, referrer, gross, vaultAmount, liquidityAmount, opsSlice, firstSeat,
  campaign, refTag)`.
- Attribution event carrying: source, buyer, referrer, campaign, refTag, token, gross, tier,
  splits, paymentMode, attributionMode.
- State: `referredCount[address]`, `referralOwed[address]` (escrow).

**Must NOT change before referral contract design is finalized** (see §G).

---

## 6. Current performance risks

- **Cold full event scan** — the single biggest cost (see §4). First-visit / cache-clear users
  pay a long serial scan.
- **Sequential single reads that should be one multicall:**
  - `src/components/syndicate/MemberWalletDashboard.tsx` — 4 separate `useReadContract`
    (USDC, SYN, First Signal, Patron Seal) → multicall candidate.
  - `src/lib/archive-safe-reads.ts` — ~6 individual reads per artifact (remainingSupply,
    mintable flags, core, uri, walletRemaining) → high latency on multi-artifact pages.
- **Duplicate / overlapping reads:** several `src/lib/sale-hooks.ts` hooks
  (`useSaleState`, `useUserSaleLimits`, `useAllocations`) re-fetch overlapping fields
  (`totalSynSold`, `totalUsdcRaised`) when used on the same page; mint components
  (`MintPatronSeal`, `MintFirstSignal`) refetch archive data the layout already has.
- **Components that surface RPC latency:** `wallet.$address.tsx` ("Scanning Avalanche RPC"),
  `IndexerFreshnessBadge.tsx` (indexer head vs RPC head), `TxProofDrawer.tsx` (explicit
  rate-limit/timeout handling) — all degrade visibly when the public RPC is slow.
- **Fragile public-RPC dependency:** every LIVE metric ultimately depends on the two public
  endpoints; in dev the primary (`api.avax.network`) is **CORS-blocked + rate-limited**, so
  local previews show PENDING/— (this is a known environment limitation, **not** a code bug).

---

## 7. Current doctrine / variable risks

**The codebase's own enforced ban list** (`FORBIDDEN_LANGUAGE` in
`src/lib/protocol-language.ts`, word-boundary, case-insensitive):
`investment, roi, yield, dividend(s), passive income, guaranteed return(s), fundraising,
raised, verified identity, kyc`.

| Audit-prompt term | Status in code | Detail |
| --- | --- | --- |
| `raised` | **Banned & clean in rendered copy** | Only appears as a **code identifier** (`totalUsdcRaised` field; `const raised` in the quarantined `src/labs/components/ProtocolRevenueEngine.tsx`, whose rendered label is "USDC routed"), in `docs/proposals/*` (non-canon), and in the ban-list/comments. No rendered violation. |
| `governance weight` | Clean | Only in `docs/DOCUMENTATION_AUTHORITY_MAP.md` / `TERMINOLOGY_GLOSSARY.md` as guarded vocab. |
| `member directory` | Clean | No real usage. |
| `Genesis NFT 1,000` / 1,000-supply Genesis NFT | Clean | No real usage. Current canon = "Genesis Signal", cap **333**. |
| `10-member genesis threshold` | Clean | No real usage. |
| `contribution` | **DRIFT — needs founder ruling** | **Not** in `FORBIDDEN_LANGUAGE`, so the guard allows it, but it is used in rendered copy in several places while being locally discouraged elsewhere. See below. |

**`contribution` drift (the one real flag):** the word is rendered in, e.g.,
`src/components/syndicate/Sections.tsx` ("Vault Contribution" label),
`src/components/syndicate/RankHub.tsx` ("the rank your contribution reflects"),
`src/lib/syndicate-config.ts` ("custom member contributions"),
`src/routes/roadmap.tsx` ("contribution archive"; "Larger contributions never…"),
`src/lib/protocol-event-registry.ts` + `src/lib/future-referral.ts` ("a verified growth
contribution"), and labs. Meanwhile `src/routes/my-syndicate.tsx` carries a comment
banning "contribution" locally. **It is not guard-enforced anywhere.** The audit prompt
treats it as forbidden; the code treats it as allowed. This is a doctrine inconsistency, not
a code defect — **a founder ruling is required** before it can be called a violation (do not
auto-edit copy on the strength of this audit).

**Canon confirmed preserved (in code/copy):**
- "SYN is the seat. Artifacts are the memory." — `docs/VISION.md`, `src/routes/archive.tsx`, et al.
- $5 USDC membership minimum — `src/lib/execution-gates.ts`, `src/lib/archive-config.ts`.
- Chapter thresholds 333 / 1,000 / 3,333 / 10,000 — `src/lib/chapters.ts`, `src/lib/eras.ts`.
- 70% Vault / 20% Liquidity / 10% Operations — `src/lib/contract-registry.ts`,
  `src/lib/protocol-metrics-registry.ts`, `src/lib/syndicate-config.ts`.
- Archive1155 = collectible artifacts only — `docs/SOLIDITY_REVIEW_STATE.md`, `src/routes/archive.tsx`.
- SeatRecord721 = future / separate / not live — `docs/VISION.md`, `src/routes/archive.tsx`
  (reserved/disabled pointer).

---

## 8. Recommended architecture (proposal only — not implemented)

Goal: fast static shell → delayed async live data → cached snapshot → resilient RPC →
referral-ready, all **without** changing doctrine, addresses, or copy.

1. **Fast static shell (already largely true).** Keep the first paint RPC-free; never let a
   wagmi read block render. Continue the `PENDING → PARTIAL → LIVE` degradation pattern.
2. **RPC primary/fallback layer (harden the existing one).** Keep viem `fallback()`, but make
   the endpoint list **env-overridable** (optional secret for a keyed/paid RPC) with the
   current public URLs as built-in defaults. No behavior change when the env var is absent.
3. **Multicall batching.** Collapse the per-call clusters in
   `MemberWalletDashboard.tsx` and `archive-safe-reads.ts` into `useReadContracts`
   (Avalanche supports Multicall3). Biggest latency win with least risk.
4. **Cached protocol snapshot.** Optionally publish a small server/build-time JSON snapshot
   (members count, totals, last scanned block) so cold visitors render real-ish numbers
   instantly, then the client incremental scan reconciles to LIVE. Must be clearly labeled
   freshness, never presented as more authoritative than chain.
5. **Event-derived state (keep single-scan doctrine).** Preserve the one canonical scan →
   `useHolderIndex` fan-out. Consider a cross-tab lock (e.g. BroadcastChannel / storage lock)
   so multiple tabs don't each cold-scan.
6. **Graceful degraded mode.** Standardize on the existing status pills so every surface has a
   defined PENDING/PARTIAL state when both RPCs fail (already mostly in place).
7. **Future on-chain referral module.** Leave the reserved model + disabled router slot as-is;
   wire it only after the CommissionRouter contract is audited and deployed, then flip the
   sale's `initialRouter`. Frontend stays PENDING until then.

---

## A. Existing architecture map
Static TanStack Start shell → client-side wagmi/viem reads on Avalanche 43114 (two public
RPCs behind a viem fallback) → React Query cache (60s/24h) + manual localStorage snapshots
(purchase events + wallet reads) → one canonical incremental event scan fanned out via
`useHolderIndex` to ~31 surfaces. Static config registries (`contract-registry.ts`,
`protocol-metrics-registry.ts`, `syndicate-config.ts`) define addresses, metrics, ranks,
chapters/eras. Referral is local-attribution + simulated preview only; SaleV2 is deployed
with the commission router **disabled**.

## B. Current risks
Cold full event scans + per-tab duplication; un-batched read clusters (multicall candidates);
overlapping sale reads; total dependence on two public RPCs (CORS/rate-limited in dev); one
doctrine drift (`contribution` used but unguarded).

## C. What is already done
Fallback transport; shared chain-tip; incremental cursor + reorg overlap; STALE-seed
hydration; localStorage persistence (allowance excluded); BigInt-safe query keys;
single-scan fan-out; status-pill degradation; reserved-but-disabled referral model & router.

## D. What is missing
Env-overridable / keyed RPC; multicall batching; cold-start snapshot for first paint;
cross-tab scan coordination; audited+deployed CommissionRouter; a founder ruling on
`contribution`.

## E. Recommended implementation order
1) Multicall batching (low risk, high win) → 2) env-overridable RPC endpoints (keep public
defaults) → 3) cross-tab scan lock → 4) cold-start snapshot (labeled freshness) → 5) referral
only after contract audit + deploy. (Items 1–4 are presentation/perf; item 5 is gated on
contract work.)

## F. Files that would likely be touched later (NOT now)
`src/lib/wagmi.ts`, `src/lib/syndicate-config.ts` (RPC endpoint list / env),
`src/lib/sale-hooks.ts`, `src/components/syndicate/MemberWalletDashboard.tsx`,
`src/lib/archive-safe-reads.ts` (multicall), `src/lib/activity-hooks.ts`,
`src/lib/purchase-events-cache.ts` (scan coordination/snapshot), `src/lib/query-client.ts`.

## G. Files that MUST NOT be touched before referral contract design is finalized
`contracts/src/SyndicateSaleV2.sol`, `contracts/src/CommissionRouterV1.sol`,
`src/lib/referral-attribution.ts` (the `?ref=` capture contract),
`src/lib/preview/referral.ts` (canonical tier thresholds the contract was built to match),
`src/lib/future-referral.ts` (reserved model). Also do not change contract **addresses** in
`src/lib/contract-registry.ts` or the 70/20/10 split definitions.

## H. Questions before implementation
1. **`contribution` ruling:** keep as-is, add to `FORBIDDEN_LANGUAGE` (and rewrite the rendered
   usages), or formally allow it? (Currently unguarded but used.)
2. **RPC provider:** add a keyed/paid RPC via secret + env override, or stay public-only?
3. **Cold-start snapshot:** acceptable to serve a small build/server snapshot (clearly labeled
   freshness) for instant first paint, or must every number be live-only?
4. **Cross-tab scanning:** is multi-tab duplicate scanning a real concern for your usage?
5. **CommissionRouter:** is audit + mainnet deploy in scope soon, or does referral stay
   preview-only for now?
6. **Multicall:** confirm Multicall3 batching is acceptable (no doctrine impact — read-only
   optimization).

---
*End of report. No code, copy, addresses, or UI were modified.*
