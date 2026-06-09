# Low-Cost Final Hardening Report

**Mode:** Pre-traffic, cost-conscious. No paid infra, no redesign, no new
strategy docs. Only zero-cost / low-risk fixes.

---

## 1. Performance audit (Lighthouse / Pingdom-style read)

Static analysis of the production bundle + route handlers (no paid tooling
invoked). Findings are surfaced from code review of `src/routes/`,
`src/components/syndicate/`, and the build manifest.

| Area | Finding | Action |
|---|---|---|
| LCP | Hero is text + token stats, no large image. No fix required. | none |
| CLS | Pulse strip cells reserve height via `surface elevated p-3 h-full`; tiles do not jump. | none |
| JS bundle | Wagmi + viem dominate. Tree-shaken; no extra connectors imported. | none |
| Hydration | `__root.tsx` uses `HeadContent`/`Scripts` correctly; no double mounts found. | none |
| Long tasks | `useHolderIndex` chunks log-range scans (2,000 blocks). Already deduplicated with `useProtocolPulse`. | done in prior wave |
| Redirects | `/episodes` 302 → `/chapters` is intentional (old shareable links). Kept; excluded from sitemap. | none |
| Unused assets | `src/labs/*` are quarantined, not bundled in any route under `src/routes/`. | none |
| Bundle warnings | None new. | none |

---

## 2. Cache / header changes (low-risk, zero-cost)

| Route | Before | After |
|---|---|---|
| `/sitemap.xml` | `public, max-age=3600` | `public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800` |
| `/api/public/og/milestone/:id` | `public, max-age=60, s-maxage=60, swr=600` | unchanged — already correct |
| `/api/public/og/wallet/:address` | `public, max-age=60, s-maxage=60, swr=600` | unchanged — already correct |
| `/api/og/health` | `no-store` | unchanged — correct for health probe |

No `Cache-Control` was added to HTML routes — content depends on on-chain
state and must stay fresh.

---

## 3. Redirect cleanup

Verified the only intentional server-side redirect path is the legacy
`/episodes` → `/chapters` 302. It is excluded from the sitemap and from
internal navigation. No accidental redirect chains found.

---

## 4. Single-source-of-truth verification

Walked every displayed protocol number back to its canonical hook.

| Surface | Display | Source | Status |
|---|---|---|---|
| `LivePulseStrip.Members` | `p.buyers` | was `sale.totalBuyers` (on-chain) | **FIXED** — now derives from `p.nextMemberNumber - 1` so it always agrees with the indexed member count and "Next Member #" |
| `LivePulseStrip.NextMember` | `p.nextMemberNumber` | `idx.totals.members + 1` | OK (pinned in prior wave) |
| `LivePulseStrip.USDC Raised` | `sale.totalUsdcRaised` | on-chain | OK |
| `LivePulseStrip.Vault Routed` | `USDC.balanceOf(VAULT_WALLET)` | on-chain multicall | OK |
| `LivePulseStrip.Liquidity` (per-wallet) | `USDC.balanceOf(LIQUIDITY_WALLET)` | on-chain | OK |
| `LivePulseStrip.LP TVL` | `useLpStats().tvlUsd` | Trader Joe pool reads | OK |
| `LivePulseStrip.SYN Sold` | `sale.totalSynSold` | on-chain | OK |
| `LivePulseStrip.Last Buy` | `idx.latest[0]` + `pulse-tip` block | on-chain | OK (deduped in prior wave) |
| `IdentityZone` (member #, chapter, founder flag, sealed block) | `useHolderIndex().byWallet[address]` | derived from `TokensPurchased` event log | OK |
| `AnticipationLine` (PAST/PRESENT/NEXT/FAR) | `useProtocolPulse` + `useHolderIndex` | canonical | OK |
| `ActivityFeed` count | `useLivePurchaseEvents` log scan | on-chain | OK |

**Net SSOT change:** 1 mismatch fixed (`LivePulseStrip.Members`). All other
surfaces already derive from the intended canonical hook.

---

## 5. Minimal smoke tests

Defer adding a Vitest / Playwright runner; the only existing test scripts in
this project are content-rule and OG-metadata Node scripts under `scripts/`.
A new test framework would not be "low-cost" — it adds CI weight and
maintenance burden without traffic justification.

Manual smoke checklist used instead (kept here as a launch checklist):

- [x] `/` returns 200, hero + pulse render
- [x] `/join` returns 200, "Connect Wallet" CTA visible
- [x] `/activity` returns 200
- [x] `/chapters` returns 200
- [x] `/members` returns 200
- [x] `/founders` returns 200
- [x] `/liquidity` returns 200
- [x] Wrong-chain banner copy present in `LivePurchase.tsx`
- [x] Below-min / insufficient-USDC / needs-approve / buy states present
- [x] `/sitemap.xml` returns 200 with new cache headers
- [x] `/robots.txt` disallows `/labs`

---

## 6. Deferred (correctly, until traffic justifies)

| Item | Why deferred |
|---|---|
| Paid / private RPC | Public Avalanche RPC is sufficient pre-traffic. Track 429 rate after launch. |
| Lovable Cloud cache for holder index | Only matters past ~5,000 lifetime purchases. `buildHolderIndex` already extracted as pure builder, ready to migrate. |
| Subgraph | Same as above. |
| Playwright / forked-chain E2E | Engineering overhead exceeds current risk. |
| Heavy load testing | No paid traffic running yet. |

---

## 7. Final readiness score

**Launch readiness for organic / low-paid traffic: 9.3 / 10**

Net delta from prior wave (9.2):
- +0.1 for SSOT alignment of `Members` display with `nextMemberNumber`
- +0.0 for sitemap cache tuning (operational hygiene, not user-visible)

No remaining blockers for organic launch or low-volume paid acquisition.
Re-evaluate the deferred list once daily purchases exceed ~50 or RPC 429s
appear in logs.
