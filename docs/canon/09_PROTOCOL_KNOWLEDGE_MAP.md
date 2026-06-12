# 09 — PROTOCOL KNOWLEDGE MAP

Status: **binding index · defers to code.** This doc answers one question: *where does
each kind of knowledge in The Syndicate live, and is it Protocol Knowledge or
Institutional Register Memory?*

> **Source of truth:** the machine-readable map is `src/lib/protocol-knowledge-map.ts`.
> Per the precedence law in `00_AUTHORITY_MAP.md` (code registries outrank canon docs),
> **that file wins** when it and this doc disagree. This doc is the human index; the
> registry is the law. The inspection surface is `/labs/knowledge-map`.

This is a **map, not an audit and not a redesign.** It is additive: it names homes that
already exist, indexes the doctrine that already governs them (canon 00 precedence,
canon 05 adjacency law, canon 06 financial guardrails, the metric registry), and
formally names a few layers that exist in code but were not yet in the mental model.

---

## The two kinds of truth

The single most important distinction — the one that prevents us from duplicating,
fragmenting, or losing knowledge:

| | **Protocol Knowledge** | **Institutional Register Memory** |
|---|---|---|
| Question | "What is true *right now*?" | "What *permanently happened* and is on the record?" |
| Orientation | Current-state, recomputed every load | History, durable, written once |
| Form | A live **projection** | A durable **overlay**: assertion + anchor |
| Coverage | May be windowed/derived; that's fine | Verifiable to a discrete anchor **or** coverage-proven |
| Admission | None — it is a projection | Verification + coverage + lineage + doctrine gates |
| Member identity | May carry it (member #N, rank, wallet) | **Never** — identity-blind by doctrine |

One-line version: **Protocol Knowledge is a live projection; Institutional Register
Memory is a selective, permanent overlay that *references* those projections via an
anchor — it never copies their live values.**

---

## The three anti-fragmentation rules (formalized in the registry header)

1. **One canonical home per fact.** Each fact has exactly one source-of-truth layer.
   Every other layer *references* it; nothing keeps a second copy.
2. **Knowledge is a projection; the Register is an overlay.** The Institutional
   Register records an *assertion + anchor*, never a live value (never the live LP
   balance, current member count, or rank).
3. **Promotion or seed, otherwise held.** A fact enters durable memory only by
   *promotion* (lineage-covered) or by *seed* (a discrete config anchor). Otherwise it
   is **held**, and remains fully available in its Protocol-Knowledge home. Held, never
   invented; nothing is lost.

---

## The canonical homes (layers)

For the full six-field record per layer — purpose · source of truth · permanence ·
coverage model · promotion path · public surfaces — read the registry; the summary
below names every layer and its key properties. Layer ids are shown in `code`.

### Foundation & Identity

- **Truth / Foundation** — `truth`. Home: `src/lib/syndicate-config.ts`,
  `src/lib/protocol-truth.ts`. Permanence: on-chain-permanent · Coverage: config-pinned
  · Identity-free · **live**. The base of the 5-layer model; everything derives from it.
- **Identity / Member (Holder Index)** — `identity-member`. Home:
  `src/lib/holder-index.ts`. Permanence: recomputed-projection · Coverage:
  **deployment-anchored** · member-derived · **live**. Member numbers, first purchase,
  first seat. Ordinals can be *anchored* into the Register via the genesis seed.
- **Rank / Progression** — `rank`. Home: `src/lib/syndicate-config.ts` (`RANKS_V2`),
  `src/lib/holder-index.ts`. Recognition only; confers nothing. Coverage: derived ·
  member-derived · **live**.
- **Chapter / Era** — `chapter`. Home: `src/lib/chapters.ts`,
  `src/lib/protocol-truth.ts`. Deterministic from the member ordinal. Coverage: derived
  · member-derived · **live**.
- **Seat Record / Identity Record** — `seat-record`. Home: `src/lib/syndicate-config.ts`
  (reserved reference). Permanence: reserved · Coverage: none · member-living-reserved ·
  **reserved**. The future ERC-721 SeatRecord721; no contract deployed.

### Artifact

- **Artifact / NFT (Archive1155)** — `artifact-nft`. Home: `src/lib/archive-config.ts`,
  `src/lib/archive-indexer.ts`, `src/lib/syndicate-config.ts`. Permanence:
  on-chain-permanent · Coverage: config-pinned · identity-free · **partial** (ID 1 &
  ID 3 active; ID 2 reserved). Mint events flow to Activity → Chronicle → Register.

### Knowledge Pipeline (Truth → Events → Signals → Memory → Story)

Governed by the **Adjacency Law** in `05_FOUNDATION_FREEZE.md` — a layer may consume
only the one directly above it. This map does not restate those rules; it points at them.

- **Activity / Events** — `activity`. Home: `src/lib/protocol-events.ts`. Raw, complete,
  automatic. Coverage: bounded-window · **live**. → Signals.
- **Signals** — `signals`. Home: `src/lib/protocol-signals.ts`,
  `src/lib/signal-registry.ts`. Type × Tier × Subject; person subjects capped at S2.
  Coverage: bounded-window · **live**. → Memory.
- **Memory** — `memory`. Home: `src/lib/memory-candidates.ts`. Gateway to the
  Activity/Chronicle/Recognition/Ledger/Reports stores. Coverage: bounded-window ·
  **partial**. → Chronicle review.
- **Chronicle** — `chronicle`. Home: `src/lib/chronicle-entries.ts`,
  `src/lib/chronicle-review-candidates.ts`, `src/lib/chronicle-promotion.ts`. Curated,
  gated, append-only; protocol-centric only (member subjects forbidden). **partial**.
  → Institutional Register.
- **Institutional Register** — `institutional-register`. Home:
  `src/lib/institutional-register.ts`, `src/lib/institutional-register-registry.ts`,
  `src/lib/institutional-register-genesis.ts`. Durable, identity-blind overlay of
  protocol-institutional facts. Permanence: append-only-curated · Coverage:
  config-pinned · **live**. Terminal.
- **Recognition** — `recognition`. Home: `src/lib/recognition-candidates.ts`. A memory
  *output* (distinct from the Rank *attribute*). Coverage: derived · **partial**
  (alias/public tiers reserved).

### Economic

- **Economic / Routing** — `economic-routing`. Home: `src/lib/syndicate-config.ts`
  (`USDC_ROUTING`), `src/lib/protocol-truth.ts`. The 70/20/10 split, enforced on-chain
  for the sale. Coverage: config-pinned · identity-free · **partial** (other streams
  pending).
- **Treasury / Vault** — `treasury-vault`. Home: `src/lib/syndicate-config.ts`. The
  destination EOA (Vault Wallet 70% USDC / Vault Reserve 25% SYN — same address today).
  Coverage: none · **partial** (programmatic Vault pending).
- **Asset** — `asset`. Home: `src/lib/treasury-hooks.ts`. **Formally named here for the
  first time.** What the Vault actually *holds* — live multi-asset balances. Coverage:
  none (point-in-time) · **live**. The `VAULT_ASSETS` demo data stays mock & quarantined.
- **Liquidity** — `liquidity`. Home: `src/lib/syndicate-config.ts` (`LP_POOL`),
  `src/lib/sale-hooks.ts`. SYN/USDC pair reserves/price. Coverage: config-pinned ·
  **partial** (LP fee accrual reserved).

### Access & Verification

- **Wallet-linked** — `wallet`. Home: `src/lib/wallet-session.ts`,
  `src/lib/wallet-reads-cache.ts`. Connected-wallet session + a localStorage cache of
  on-chain reads (cache of truth, not truth). Permanence: local-cache · **live**.
- **Metrics / Verification** — `metrics-verification`. Home:
  `src/lib/protocol-metrics-registry.ts`. The canonical metric dictionary — the "don't
  trust, verify" home. Coverage: derived · **partial** (documented ceilings).

---

## Layers newly named this sprint (the answer to "what is hidden in code?")

These existed in code but were not yet formal layers in the mental model:

- **Asset Layer** (`asset`) — **real and live.** `treasury-hooks.ts` already does live
  RPC balance reads (AVAX/USDC/BTC.b/WETH.e) of the Vault wallet. It was unnamed and
  visually entangled with the quarantined `VAULT_ASSETS` mock. Now named; the mock
  stays quarantined and is explicitly *not* this layer's truth.
- **Treasury / Vault Layer** (`treasury-vault`) — the *destination* concept, distinct
  from the *split rule* (Economic/Routing) and the *holdings* (Asset). Naming the three
  separately is the whole point: split ≠ destination ≠ holdings.
- **Recognition Layer** (`recognition`) — **partial.** Derivation logic is live; the
  alias/public recognition tiers are reserved. It is a memory *output*, not the Rank
  *attribute* — keeping them separate prevents the money→prestige collision.
- **Seat-Record / Identity-Record Layer** (`seat-record`) — **reserved.** The future
  SeatRecord721; today the "seat" is the SYN position itself. No contract exists.
- **LP fee accrual** — deliberately **not** its own layer: it is a *reserved note* under
  Liquidity until a live data-link exists.

---

## Where the foundational "firsts" live (the fact map)

| Fact | Canonical home | Verifiable? | Deployment→now coverage? | Register-eligible now? |
|---|---|---|---|---|
| First member / first purchase / first seat | `identity-member` (Holder Index) | yes (tx/block) | yes, **in the Holder Index** | held — see note |
| First NFT / first artifact | `artifact-nft` (Archive1155) | yes (mint events) | needs archive-history scan | held (first-mint ordinal) |
| First milestone | Activity/milestones | derived from a verifiable count | not proven via register feed | held |
| First chapter transition | `chapter` | derived (no discrete tx) | rides member-number coverage | not a natural register entry |
| First liquidity | `liquidity` (`LP_POOL.creationTx`) | yes (creation tx) | config-pinned | **seeded (locked)** |
| First burn (Proof of Fire #001) | `truth` config | yes (tx + block) | config-pinned | **seeded (locked)** |
| Contract births (token / sale / archive) | `truth` config | yes | config-pinned | **seeded** |

**Why "first member" is fully known yet still held by the Register:** (1) the Register
admits facts through its *promotion lineage*, which runs on a bounded, newest-first
event window that does **not** inherit the Holder Index's deployment-anchored coverage;
and (2) member-living facts are identity-blind-excluded by doctrine. So the fact is
fully available in Protocol Knowledge (the Holder Index) but held — not invented — at
the Register boundary. **The bridge:** anchoring the first-purchase tx as a discrete
config constant would let the genesis seed promote it (framed identity-free), turning a
coverage-gated derivation into a `locked` protocol fact — *promoted, not copied.*

---

## Enforcement

The guard `src/lib/__tests__/protocol-knowledge-map.test.ts` keeps the map honest:
every cited home file / canon doc / registry must exist; every surface must resolve to
a real route; every non-live status must cite an evidencing file; a member-living
layer must be reserved and surface-free; the registry leaf must import nothing; and
this doc must name every layer id. The guard catches dead paths and structural drift —
it cannot catch a stale human-asserted status, which is why every `statusNote` cites
its evidence. Adding this doc to the doctrine-guard's scanned `CANONICAL_DOCS` set is a
separate code follow-up, consistent with the note in `00_AUTHORITY_MAP.md`.
