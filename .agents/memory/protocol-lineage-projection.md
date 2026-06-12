---
name: Protocol Lineage projection
description: Lineage is a PURE read-only projection of a fact's carried trail, NOT a new pipeline layer — rules for extending/touching it.
---

# Protocol Lineage — visibility projection, not a layer

`src/lib/protocol-lineage.ts` re-expresses the `lineage` trail already carried on a
terminal `ChronologyEntry` as typed `LineagePath`/`LineageNode`. It creates **no new
intelligence** — every pipeline stage already prepends its own id onto the trail; this
leaf only projects that trail 1:1 (one entry in → one path out; `trail.map` → one node
per entry, id verbatim, in order, so it can neither invent nor drop a stage).

**Why:** the journey was already recorded but never re-expressed as one object; each
surface re-parsing the breadcrumb string by hand is the wrong pattern. One pure leaf
does it once.

**How to apply / invariants to keep:**
- **Adjacency:** exactly ONE import, `import type … from "./chronology-registry"`.
  Never import a deriver, an upstream layer, wagmi, or react. Read middle stages from
  the carried trail, never by reaching back into another layer. Enforced by a
  `signal-adjacency.test.ts` describe (exact-specifier allowlist) + it's in
  `PRESTIGE_MODULES` / Rule-E in `signal-money-guardrail.test.ts`.
- **Date honesty:** `timestamp` non-null ONLY on a verified chronology node
  (`entry.blockTimestamp`, the Sprint-15 value). Never compute/estimate a date.
- **Middle stages** are honest id-only `carried-through` nodes — do NOT re-derive
  their live status (that means reaching into another layer).
- **Genesis honesty:** sentinels (`genesis-fact:` / `genesis-seed:` /
  `institutional-entry:…:genesis:` / `predates-scanner`) and `unknown` refs force
  **PARTIAL**, never COMPLETE.
- **Completeness precedence (first match wins):** held → coverage-limited →
  rpc-limited → partial → complete. A still-`pending` timestamp on an ordered entry
  STAYS complete (order is the proof; date is a non-blocking overlay).
- **Not a knowledge-map node:** a projection is not a pipeline layer. Do NOT add a
  knowledge-map node (would force a canon-09 authority-map edit for a surface that
  creates nothing). Instead add `/labs/protocol-lineage` to `internalSurfaces` of the
  nodes it makes visible (chronicle + institutional-register) and cite it in their
  `statusNote`. Knowledge-map tests are structural (surface→route file, statusNote
  cites a `.ts`) so they pass without hardcoded-list edits.
- **Surface:** internal-only `/labs/protocol-lineage` (noindex, robots-blocked); runs
  the same full pipeline as `labs.chronicle-timeline`; renders genesis-rooted PARTIAL/
  HELD paths even before live events load (graceful degradation).
