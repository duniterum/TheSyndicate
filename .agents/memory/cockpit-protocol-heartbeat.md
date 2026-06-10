---
name: Protocol heartbeat band (/my-syndicate)
description: How the "protocol is alive" heartbeat band stays truthful — data source, recency-gated verb/pulse, and its relationship to LivePulseStrip.
---

ProtocolHeartbeat is the NARRATIVE "protocol is alive right now" band on
/my-syndicate. It is a deliberate complement to LivePulseStrip (the 7-metric
analytical grid), NOT a replacement and NOT a second grid — keep both; they sit
adjacent (heartbeat headline above, pulse grid below). Don't merge them or
duplicate the grid's cells.

**Data source:** `useHolderIndex().latest[0]` — the most-recently-active record
is the wallet behind the single most recent purchase event (latest sorts by
lastPurchaseBlock DESC). Uses that record's memberNumber / lastPurchaseUsdc /
lastPurchaseBlock / lastPurchaseTx. Age = `useChainTime().secondsSince(block)`,
displayed via `formatAgo`. Proof = plain `txExplorerUrl(tx)` link. NO new RPC
query — it shares the holder-index cache.

**Recency truth rule (binding — re-derived from an architect review):** the
LIVE/PARTIAL/PENDING pill encodes DATA FRESHNESS (real event + resolved age + no
error = LIVE), consistent with site convention (LivePulseStrip hardcodes LIVE).
But the *verb and the pulse animation must encode actual event AGE, not the pill*.
"just purchased" + the pulsing dot only render when the event is genuinely recent
(`agoSeconds < RECENT_SECONDS`, currently 1h); otherwise it reads "Member #N's
latest purchase" with no pulse.
**Why:** a 3-week-old event under a LIVE pill + "just purchased" + a pulsing dot
fabricates recency — the exact "fake live now / fake movement" the band was built
to avoid. The timestamp alone contradicting the verb is not enough.
**How to apply:** never let "just"/present-tense/pulse fire on age you haven't
checked; if there's no event, say so ("No protocol events indexed yet"), never
imply live. Keep it one calm line — no ticker/auto-scroll/casino motion.
