---
name: Protocol Knowledge Map (inspection layer)
description: The code-primary layer registry, the Protocol-Knowledge-vs-Register distinction, the public /knowledge-map map, and the rules that keep the map honest.
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

## Public map surface (/knowledge-map)
There are now TWO surfaces over the same registry: internal `/labs/knowledge-map`
(inspection) and PUBLIC `/knowledge-map` (a restrained-canonical, indexable map reached by
cross-links from Registry/Transparency/Chronicle/Institutional-Register — never main nav).
- The public route renders **publicSurfaces only**; it must NEVER read `internalSurfaces`
  (a layer's `/labs/*` homes stay internal). A guard test scans the route source for the
  string `internalSurfaces` and asserts 0.
- It renders **structure, not live values** — no live numbers, reserved layers map to PENDING.
- The 3 buckets are a **derived** view, not a new stored field: `knowledgeKindOf(layer)` =
  `reserved` if status/permanence reserved → `durable-overlay` if permanence
  `append-only-curated` → else `live-projection`. Today: 15 live / 2 durable
  (chronicle + institutional-register) / 1 reserved (seat-record).
- **Recognition (status=partial) lands in live-projection, not reserved** — its derivation IS
  live; only the alias/public tiers are reserved. The sprint spec's example list put it under
  Reserved; code outranks spec prose, so follow the registry. Don't "fix" this.
- `ANTI_FRAGMENTATION_RULES` (the 3 rules as data) is the **single renderable source**;
  surfaces render from it. Doc 09 + the registry header comment are prose copies — code wins,
  and the doc↔data alignment cross-check still pins them.
- Exposing `homeFiles` (repo-relative `src/lib/*` paths) + canon doc paths on a public page is
  intentional ("don't trust, verify"); they carry no secrets/addresses.

## How to apply / gotchas
- **A new public indexable route needs a sitemap entry** (`src/routes/sitemap[.]xml.ts`
  ENTRIES) or it is silently omitted from `/sitemap.xml` — easy to forget; the route renders
  fine without it. `/knowledge-map` is registered at priority 0.5, monthly.
- Add or relabel a layer **in the registry only**; the doc and route project from it.
- The guard catches **dead paths + structural drift** (missing files, unresolved surfaces,
  reserved layers exposed) — it does NOT catch a stale human-asserted status. That is why
  every non-live layer's `statusNote` must **cite an evidencing `.ts` file** (the test
  enforces the citation, not its truth).
- Doc 09 is NOW in the doctrine-guard `CANONICAL_DOCS` scan set (banned-vocab scanned).
  GOTCHA: registering ANY canon doc there has a hidden companion obligation — the
  "authority map lists every canonical doc" test asserts every `CANONICAL_DOCS` entry
  also appears in `docs/DOCUMENTATION_AUTHORITY_MAP.md`. Add the doc to BOTH, and confirm
  it's clean against `DOC_BANNED` first, or doctrine-guard fails.
- The 3 anti-fragmentation rules now have a doc↔registry alignment cross-check (in the
  knowledge-map test): normalizes both, asserts 6 rule fragments survive in each file.
  GOTCHA: the registry "header" is a JS comment, so any text cross-check against it MUST
  strip `//` (and collapse line-wraps) before substring matching, or comment markers split
  multi-line phrases. It's presence-based (not semantic) and scans the whole registry
  file, not just the header — acceptable for a guardrail, not a doctrine proof.
