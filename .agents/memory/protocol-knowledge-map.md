---
name: Protocol Knowledge Map (inspection layer)
description: The code-primary layer registry, the Protocol-Knowledge-vs-Register distinction, and the rules that keep the map honest.
---

# Protocol Knowledge Map

The canonical index of every knowledge *home* in The Syndicate. Source of truth is the
**code registry** `src/lib/protocol-knowledge-map.ts` (a zero-import pure-data leaf — it
sits OUTSIDE the Adjacency Law, like the metrics registry). The doc
`docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md` and the surface `/labs/knowledge-map` both
**defer to that file** (code outranks docs). Guarded by
`src/lib/__tests__/protocol-knowledge-map.test.ts`.

## The governing distinction (durable)
- **Protocol Knowledge** = a live **projection** (recomputed every load; may be windowed,
  may carry member identity).
- **Institutional Register Memory** = a durable **overlay** that records an *assertion +
  anchor*, **never a live value**; identity-blind by doctrine.

**The 3 anti-fragmentation rules:** (1) one canonical home per fact — others reference,
never copy; (2) knowledge is a projection, the Register is an overlay (assertion+anchor,
not live value); (3) a fact enters durable memory only by **promotion** (lineage-covered)
or **seed** (discrete config anchor), otherwise it is **held** — never invented, never lost.

**Why:** prevents the recurring failure mode of duplicating/fragmenting a fact's home or
copying a live value into the durable Register. A "first member" can be fully known in the
Holder Index yet correctly *held* at the Register boundary (its promotion lineage lacks
deployment coverage + member-living is identity-excluded). Bridge = anchor the tx in config
and let the genesis seed promote it identity-free. **Promoted, not copied.**

## Layers named here for the first time
- **Asset** (`asset`) — REAL & LIVE: `treasury-hooks.ts` already does live RPC balance reads.
  It was unnamed and entangled with the quarantined `VAULT_ASSETS` mock. Naming it did NOT
  upgrade the mock — `VAULT_ASSETS`/`VAULT_INFLOWS` stay mock & quarantined and are explicitly
  not this layer's truth.
- **Treasury/Vault** (`treasury-vault`) — the *destination*, kept distinct from the *split
  rule* (`economic-routing`, 70/20/10) and the *holdings* (`asset`). Split ≠ destination ≠ holdings.
- **Recognition** (`recognition`) — partial: derivation live, alias/public tiers reserved.
  A memory *output*, distinct from the Rank *attribute* (keeps money≠prestige).
- **Seat-Record** (`seat-record`) — reserved: future SeatRecord721, no contract.
- LP fee accrual is deliberately a reserved NOTE under Liquidity, not its own layer.

## How to apply / gotchas
- Add or relabel a layer **in the registry only**; the doc and route project from it.
- The guard catches **dead paths + structural drift** (missing files, unresolved surfaces,
  reserved layers exposed) — it does NOT catch a stale human-asserted status. That is why
  every non-live layer's `statusNote` must **cite an evidencing `.ts` file** (the test
  enforces the citation, not its truth).
- Adding doc 09 to the doctrine-guard `CANONICAL_DOCS` set is a separate code follow-up
  (same pattern as other canon docs — registering needs banned terms on `**Wrong:**` lines).
- The 3-rule text currently lives in both the registry header and doc 09; the cross-check
  only validates layer ids, so rule-text drift would be silent (code wins, low risk).
