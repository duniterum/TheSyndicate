---
name: Era/chapter rate automation — contract auto vs frontend static
description: Where per-era pricing (min, SYN/$, era advance) is automatic vs hardcoded, and the unsafe minSynOut fallback that only works in Genesis.
---

# The CONTRACT auto-prices per era; the FRONTEND display is pinned to Genesis

The Sale V2 contract fully implements the founder's era model already, and it is
IMMUTABLE (hardcoded in bytecode, not deploy params):
- `_eraParams(era)` is THE single rate table: per-era `(synPerUsdc, minUsdc6, endSeat)`.
  I: 100 SYN/$, $5, ≤333 · II: 50, $10, ≤1k · III: 40, $10, ≤3,333 · IV: 16, $25,
  ≤10k · V: 12, $25, ≤25k · VI: 6, $50, ≤50k · VII: 4, $50, ≤100k · VIII: 2, $100,
  ≤250k · IX: 1, $100, ≤1M. `src/lib/eras.ts` ERAS mirrors this exactly.
- Era advance is automatic: `_syncEra` (mutating, in buy) / `_resolveEraView`
  (view, behind `currentEra()` and `quote()`) roll forward when
  `memberCount >= endSeat` (range filled) OR the era cap can't fit one min entry
  (cap exhausted). So min entry, SYN/$ rate, and era index ALL change on their own.
- One-seat-per-wallet is automatic via `firstSeat = !knownMember`; repeat buys add
  SYN + raise rank, mint NO new seat. No param controls this.

**So the ONLY contract-level era defect is the per-wallet cap param** `addrCaps[0]`
sized == the $5 minimum (see sale-v2-live-era-caps.md). min/rate/advance/identity
need no fix and no setter.

## The frontend does NOT reprice when the era advances (display lag, not a chain bug)
- `useSaleStats` reads chain `currentEra`, and `useQuoteSyn` (V2) calls `quote()`
  → both ARE live. But the displayed "SYN received" in `LivePurchase.tsx` is
  `synOut = usdc * 100` (hardcoded Genesis 100 SYN/$); `quote.data` is used ONLY
  as the `minSynOut` slippage floor, never shown.
- `eras.ts currentEra()` is STATIC — returns whichever era has `status:"LIVE"`
  (Genesis), never reads chain. So `package-catalog.ts SEAT_PACKAGES` (a
  module-level const) and `JoinPackages`/`SeatPackageCard` compute SYN once at the
  Genesis rate. `RANKS_V2.syn` is hardcoded at $0.01. Min-entry UI = hardcoded
  `SALE_MIN_USDC = 5`; no per-era `minUsdc6` is ever read.
- Net: when Era II opens, the chain delivers fewer SYN (e.g. $25 → 1,250 not
  2,500) but every UI surface still SHOWS Genesis numbers until the frontend is
  wired to `stats.currentEra` / `quote()`.

**Why:** founder intent is "UI must auto-update when the era changes." Today only
the chain does; the UI is intentionally Genesis-only ("proposed future" labels on
Eras II–IX), which is fine while Era I is the only live era but breaks honesty the
moment an era advances.

## GOTCHA: `minSynOut = quote.data ?? synOutRaw` is only safe in Genesis
`synOutRaw` is computed at 100 SYN/$. In Genesis it equals the quote, so the
fallback is harmless. In ANY later era, if the `quote()` read is missing, the
fallback OVER-states minSynOut (e.g. 2,500 vs real 1,250) and the buy REVERTS on
slippage. **How to apply:** before Era II can ever open, drive the displayed SYN
AND `minSynOut` from `quote.data` (live), and read per-era `minUsdc6` for the
min-entry gate/labels — don't ship the `usdc*100` mirror past Genesis.
