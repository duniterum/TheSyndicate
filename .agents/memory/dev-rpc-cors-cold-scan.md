---
name: Dev preview shows no on-chain data (RPC CORS + cold-scan rate-limit)
description: Why the dev preview renders PENDING/— for all on-chain values, why it is NOT a code bug, and why it does not necessarily affect production.
---

# Dev preview blank on-chain data

In a fresh dev preview / Playwright context the whole site can render with
status **PENDING** and every on-chain metric as **"—"** (no member wall tiles,
member-number search can't resolve, /wallet/$address shows no member card). The
browser console floods with:

> Access to fetch at 'https://api.avax.network/ext/bc/C/rpc' ... blocked by CORS
> policy: No 'Access-Control-Allow-Origin' header is present.

## Root cause (verified, not a guess)
- **Primary RPC** `https://api.avax.network/ext/bc/C/rpc` returns `HTTP 429`
  (shared-IP rate limit) **and sends no `Access-Control-Allow-Origin` header** →
  unusable from ANY browser origin.
- **Fallback RPC** `https://rpc.ankr.com/avalanche` returns `200` with
  `access-control-allow-origin: *` → browser-safe. wagmi is configured with a
  viem `fallback([http(avax), http(ankr)])` transport (`src/lib/wagmi.ts`).
- The blank state happens on a **cold cache**: a fresh context with no
  `localStorage` tries a full holder-index scan from `SALE_DEPLOYMENT_BLOCK`
  (~800k+ blocks, chunked getLogs = hundreds of calls). Every call hits the
  primary first (CORS/429, retried 3×) before rotating to ankr, and the free
  ankr tier then rate-limits under that storm → the scan stalls → PENDING.

## Why production is different / not necessarily broken
- ankr CORS works, and prod has the **bundled seed + persisted incremental
  cache** (localStorage) + a warm chain, so it does NOT cold-scan 800k blocks on
  every load. Real members exist and a warm preview earlier showed live values
  (e.g. "MEMBER #3", "5,000 SYN burned").

## How to apply
- Do NOT treat this as a regression or "fix" it by editing wagmi/RPC config —
  it is environmental and pre-existing.
- It DOES block visual verification in dev of anything that needs live
  on-chain data (member wall, member search, populated member card). Verify
  those on the deployed site (warm data) or with a connected wallet instead.
- Real reliability follow-up worth flagging to the user (out of scope for a
  frontend sprint): the primary RPC is effectively browser-dead, so prod leans
  entirely on a free ankr tier. A dedicated/keyed RPC would harden it.

## External/Firecrawl screenshots of the LIVE site also cold-scan
- Each `screenshot type=external_url` of the deployed site is a fresh browser
  session with NO persisted localStorage, so it ALWAYS cold-scans. Full
  per-member pages (`/members` wall) frequently capture mid-scan: `PARTIAL`,
  `MEMBERS 0`, `NEXT FOUNDER #1`, `SCANNING AVALANCHE RPC` — even when the data
  is 100% correct on-chain. This is a capture-timing artifact, NOT a surface bug.
- To verify live member surfaces, trust the **homepage PROTOCOL OVERVIEW** panel
  (totals-only read: MEMBERS / NEXT SEAT / wallet $ resolve fast and show LIVE)
  and **/member/N**, NOT a single `/members` capture. The wall uses the same
  holder-index source and resolves identically once its (slower) full scan ends.
- "LATEST ACTIVITY: Awaiting purchase / PENDING" on a cold homepage capture is
  the event-detail join (Purchased⋈Routed) still resolving after the totals —
  not a missing event. Re-capture warm or trust the resolved totals.
