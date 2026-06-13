# Sprint 10 — Protocol Knowledge Map

**Type:** Additive, read-only formalization. **Not** an audit, **not** a redesign.
**Outcome:** A code-primary inspection layer + a doctrine doc that defers to it.

---

## Goal

Formalize the conceptual layer map into two durable artifacts:

1. A **doctrine document** that defines every canonical knowledge *home*.
2. An **inspection layer** (code registry + internal surface) that is the machine-readable
   source of truth.

For each home, record six facts — **purpose · source of truth · permanence · coverage
model · promotion path · public surfaces** — plus implementation status and identity
posture. And answer the standing question: *which layers already exist in code but were
not yet formally named?*

---

## The governing distinction (now formalized)

- **Protocol Knowledge** — a live **projection**, recomputed every load. May be windowed
  or derived. May carry member identity.
- **Institutional Register Memory** — a durable **overlay** that records an *assertion +
  anchor*, never a live value. Identity-blind by doctrine.

### The three anti-fragmentation rules

1. **One canonical home per fact** — every other layer references it; nothing keeps a copy.
2. **Knowledge is a projection; the Register is an overlay** — the Register records an
   assertion + anchor, never a live value.
3. **Promotion or seed, otherwise held** — a fact enters durable memory only by lineage
   promotion or a discrete config-anchor seed; otherwise it is held, never invented.

---

## What shipped

| Artifact | Path | Role |
|---|---|---|
| Registry leaf (source of truth) | `src/lib/protocol-knowledge-map.ts` | 18 layers, 5 clusters; zero imports (outside the Adjacency Law) |
| Guard test | `src/lib/__tests__/protocol-knowledge-map.test.ts` | 15 tests keeping the map honest |
| Doctrine doc | `docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md` | Human index; defers to the registry |
| Canon front-door row | `docs/canon/00_AUTHORITY_MAP.md` | One row added to the file-set table |
| Inspection surface | `src/routes/labs.knowledge-map.tsx` | Read-only render; `/labs/knowledge-map` (noindex) |
| Labs index link | `src/routes/labs.index.tsx` | One nav link added |

The doc and route both defer to the registry per the precedence law (code outranks docs).

---

## The 18 canonical homes

**Foundation & Identity:** `truth`, `identity-member` (Holder Index, deployment-anchored),
`rank` (recognition only), `chapter`, `seat-record` (reserved).
**Artifact:** `artifact-nft` (Archive1155, partial).
**Knowledge Pipeline:** `activity`, `signals`, `memory`, `chronicle`,
`institutional-register`, `recognition` (partial).
**Economic:** `economic-routing` (70/20/10), `treasury-vault`, `asset`, `liquidity`.
**Access & Verification:** `wallet` (local cache), `metrics-verification`.

### Layers newly named (the "hidden in code" answer)

- **Asset** (`asset`) — **real and live**: `treasury-hooks.ts` already does live RPC
  balance reads; it was unnamed and entangled with the quarantined `VAULT_ASSETS` mock.
  Now named; the mock stays quarantined and is explicitly *not* this layer's truth.
- **Treasury / Vault** (`treasury-vault`) — the *destination*, distinct from the *split
  rule* (Economic/Routing) and the *holdings* (Asset). Split ≠ destination ≠ holdings.
- **Recognition** (`recognition`) — **partial**: derivation live, alias/public tiers
  reserved. A memory *output*, distinct from the Rank *attribute*.
- **Seat-Record / Identity-Record** (`seat-record`) — **reserved**: future SeatRecord721;
  no contract.
- **LP fee accrual** — deliberately a *reserved note* under Liquidity, not its own layer.

---

## The "firsts" fact map

| Fact | Canonical home | Verifiable? | Coverage | Register-eligible now? |
|---|---|---|---|---|
| First member / purchase / seat | `identity-member` | yes | deployment-anchored (in Holder Index) | held |
| First NFT / artifact | `artifact-nft` | yes | needs archive-history scan | held |
| First milestone | Activity/milestones | derived | not proven via register feed | held |
| First chapter transition | `chapter` | derived (no discrete tx) | rides member-number coverage | not a register entry |
| First liquidity | `liquidity` | yes (creation tx) | config-pinned | seeded (locked) |
| First burn (Proof of Burn #001) | `truth` config | yes | config-pinned | seeded (locked) |
| Contract births | `truth` config | yes | config-pinned | seeded |

"First member" is fully known in the Holder Index yet held by the Register because the
Register's promotion lineage runs on a bounded window (no deployment-coverage proof) and
member-living facts are identity-excluded. The bridge: anchor the first-purchase tx as a
config constant → the genesis seed can promote it identity-free. *Promoted, not copied.*

---

## QA (all green)

- `bunx tsc --noEmit` — clean.
- `protocol-knowledge-map.test.ts` — 15/15.
- `doctrine-guard.test.ts` — 144/144.
- `node scripts/check-ownership-wording.mjs` — OK (352 files).
- SSR `GET /labs/knowledge-map` — 200, renders.
- Architect (`evaluate_task`, with git diff) — **PASS**, no severe issues; scope contract
  verified (only the registry/test/doc/route added; canon 00 +1 row, labs.index +1 link,
  routeTree.gen.ts codegen). The Asset-mock-not-upgraded risk did not occur.

---

## Follow-ups (low priority, deferred by design)

1. Add `docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md` to the doctrine-guard `CANONICAL_DOCS`
   set so the new canon doc gets vocabulary scanning (a code follow-up, consistent with
   the standing note in canon 00).
2. Optionally extend the doc/code cross-check to assert the 3-rule text matches the
   registry header, closing the only duplication seam.
3. When ready to make an ordinal a Register fact: pin its discrete tx anchor in config and
   promote via the genesis seed (do not copy the live derivation).
