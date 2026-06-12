---
name: Hero last-activity age is an ESTIMATE, not a timestamp
description: Why the hero "Nd ago" disagrees with the explorer's real tx age — block-delta × flat 2s, not a real block.timestamp
---

The hero's "last activity" / core-freshness age (`formatAgo(pulse.lastBuyAgoSeconds)`)
is a SYNTHETIC estimate, not the transaction's real timestamp.

`useProtocolPulse` computes it as:
`lastBuyAgoSeconds = (headBlock − idx.latest[0].lastPurchaseBlock) × AVA_BLOCK_SECONDS`
where `AVA_BLOCK_SECONDS = 2` (a flat constant, declared in chain-time.ts and re-declared in protocol-pulse.ts).

The per-activity "Tx ↗" proof chip (and the `lastBuyBuyer` Fact's verifyHref in protocol-truth.ts)
links to `txExplorerUrl(pulse.lastBuyTxHash)` → Snowtrace, which shows the block's REAL timestamp.

**Why they disagree:** Avalanche C-Chain does not mint exactly one block / 2s — real cadence is
variable and was faster (~1s/block) over the observed window, so block-delta × 2s roughly DOUBLES the
true elapsed time (a real ~7-day-old buy renders "≈14d ago"). It is NOT a stale cache (a stale head
block would UNDER-count, not over-count), NOT a wrong tx (label + Tx ↗ derive from the same
`idx.latest[0]` record), and NOT a broken `formatAgo` (it faithfully divides seconds by 86,400).
chain-time.ts's own header comment flags this as a known approximation pending a real per-block-timestamp source.

**How to apply:** Any "X ago" sourced from `lastBuyAgoSeconds` (or `useChainTime().secondsSince/blockToUnix`)
is an estimate and will drift from the explorer. The accurate fix is to read the purchase block's actual
`block.timestamp` (e.g. `publicClient.getBlock({ blockNumber: lastPurchaseBlock })` / the chronology-timestamps
I/O hook) and compute `now − block.timestamp`, rather than multiplying a block delta by a flat constant.
