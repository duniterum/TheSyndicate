---
name: Era/chapter rate automation — contract auto-prices, purchase UI now derives from quote()
description: Per-era pricing (min, SYN/$, era advance) is automatic in the immutable contract; the purchase UI is now wired to live quote() (not the old usdc*100 Genesis mirror). Rules to keep it era-safe.
---

# The CONTRACT auto-prices per era; the purchase UI now follows it via quote()

The Sale V2 contract fully implements the founder's era model and it is IMMUTABLE
(hardcoded in bytecode, not deploy params):
- `_eraParams(era)` is THE single rate table: per-era `(synPerUsdc, minUsdc6, endSeat)`.
  I: 100 SYN/$, $5, ≤333 · II: 50, $10, ≤1k · III: 40, $10, ≤3,333 · IV: 16, $25,
  ≤10k · V: 12, $25, ≤25k · VI: 6, $50, ≤50k · VII: 4, $50, ≤100k · VIII: 2, $100,
  ≤250k · IX: 1, $100, ≤1M. `src/lib/eras.ts` ERAS mirrors this exactly.
- Era advance is automatic: `_syncEra` (mutating, in buy) / `_resolveEraView` (view,
  behind `currentEra()` and `quote()`) roll forward when `memberCount >= endSeat`
  (range filled) OR the era cap can't fit one min entry (cap exhausted). So min
  entry, SYN/$ rate, and era index ALL change on their own.
- One-seat-per-wallet is automatic via `firstSeat = !knownMember`; repeat buys add
  SYN + raise rank, mint NO new seat.

**The only contract-level era defect is the per-wallet cap param** `addrCaps[0]`
sized == the $5 minimum (see sale-v2-live-era-caps.md). min/rate/advance/identity
need no fix and no setter.

## Purchase UI is now era-correct (LIVE-ERA PURCHASE UI CORRECTNESS V1)
The old unsafe `synOut = usdc*100` Genesis mirror and `minSynOut = quote.data ??
synOutRaw` fallback are GONE. Durable rules to preserve:

- **quote() is the ONLY rate truth the purchase flow shows or submits.** In
  `LivePurchase`, `quotedSynRaw = quote.data` drives BOTH the displayed "SYN
  received" and the `minSynOut` floor. `quote.data === undefined` means UNKNOWN
  (loading / RPC miss / sale concluded / revert) → neutral UI + BLOCKED submit;
  never zero, never a Genesis estimate. Submit re-quotes (`await quote.refetch()`)
  and aborts if the fresh result is undefined — never sign a guessed amount. The
  `minSynOut` floor structurally prevents overstatement even if a quote is stale
  (contract reverts rather than underdelivering).
- **`useQuoteSyn` shape gotcha:** `.data` is the SELECTED synOut (V2 `tuple[0]`),
  but the V2 `.refetch()` is WRAPPED to resolve `{...r, data: tuple?tuple[0]:undefined}`
  so callers read fresh selected synOut without decoding the raw tuple. Don't
  "simplify" it back to `v2.refetch` — that returns the raw 6-tuple and breaks the
  buy-handler's `fresh.data` floor. `quoteSynPerUsdc` = `tuple[2]` (integer SYN/$).
  V1 `.refetch()` already yields the bigint directly. Consumers: LivePurchase
  (reads data + refetch) and ProtocolHero (reads data only, never refetch).
- **Rate labels prefer `quote.quoteSynPerUsdc`**, falling back to the verified
  `eraSynPerUsdc(liveEra)` mirror only when the live value is absent (header +
  SaleV2StatusStrip "Rate"). The mirror is safe as a fallback because it is a
  tested 1:1 mirror of the immutable contract table (can't silently diverge).
- **Min/era** come from `eraMinUsdc(stats.currentEra)` / `eraByIndex(stats.currentEra)`,
  keyed to the 1-indexed on-chain `currentEra()` (0 = concluded → neutral, never
  guess). `eraMinUsdc` is a VERIFIED mirror; test pins
  `ON_CHAIN_MIN_USDC=[5,10,10,25,25,50,50,100,100]`.

## Pure-config (no-chain) surfaces gate the absolute Genesis figure
`package-catalog.ts` data is test-locked (`synAtGenesis === rank.usdc*100`) and the
cards/JoinPackages are pure presentational leaves (no chain). So they can't read
`quote()`. Instead they gate on `currentEra().id === "genesis"` (a pure config
read): show the absolute `synAtGenesis` figure ONLY while Genesis is the live era;
on any later era show neutral "SYN amount set by the live Era rate · confirmed at
checkout". **Why:** a future redeploy past Genesis must never display a stale
Genesis SYN figure as if current (hard rule: never promise more than delivered).

## Deliberately LEFT AS-IS (not purchase promises)
- Descriptive/canon pages (`docs.tsx`, `roadmap.tsx`, `whitepaper.tsx`,
  `tokenomics.tsx`) and the `/join` PageShell description/meta still state the
  current Genesis rate ("1 SYN = $0.01"). These describe the LIVE deployment
  accurately (code outranks docs); refresh them as part of a redeploy, not here.
- `ProtocolHero`'s hero calculator uses a DERIVED-labeled Genesis fallback
  estimate. It never submits and is labeled DERIVED (not LIVE), so it is an
  estimate, not a promise. If it ever gains a buy path, wire it to `quote.data`.
