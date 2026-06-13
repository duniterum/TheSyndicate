---
name: Chronicle Promotion layer (constitution of memory)
description: Doctrine + guard-wiring for the 5th adjacency layer — Chronicle Review Candidate → Chronicle Promotion Decision. Read before extending promotion rules or the pipeline.
---

# Chronicle Promotion — the "constitution of memory"

The 5th layer in the chain: EVENT → SIGNAL → MEMORY CANDIDATE → CHRONICLE REVIEW
CANDIDATE → **CHRONICLE PROMOTION DECISION**. Answers ONE question: "does this
deserve permanent protocol memory, and on which track?" It is a deriver +
pure-data registry; it **publishes nothing** (no ChronicleEntry, no Story,
Recognition, governance, or public UI).

## Durable rulings (not derivable from a quick read)

- **Baseline = recommendation, promotion = human act.** Every decision is a
  deterministic baseline: `reviewer = "deterministic-baseline"`, `timestamp =
  null`. A human override replaces reviewer + stamps a real timestamp. Nothing
  auto-publishes.
- **Decision precedence is fixed (don't reorder):** (1) unsafe copy
  (`copyViolations` non-empty) → `rejected`; (2) `verificationStatus ===
  "coverage-limited"` → `hold-coverage` (never assert a "first"); (3) memory
  rules by register. Copy beats coverage.
- **Member-living is ALWAYS `hold-context`.** Deliberate doctrine, not a stub:
  the member-living register is modelled but **unratified**, and chronicle-entries
  **clause 6** forbids a member/wallet/seat SUBJECT from a protocol-institutional
  entry. The promotable form of a "first/milestone member" is its
  PROTOCOL-CENTRIC counterpart (a chapter/milestone fact via the institutional
  rule), never a member-subject entry.
  **Why:** prevents identity/Recognition leaking into permanent memory.
- **Identity- AND amount-blind.** Verdict reads register × category × source
  event KIND only — never an amount, never who acted. A protocol-wallet
  ("founder")/system act is NEVER auto-approved; it is `hold-context` for human
  framing, framed protocol-centrically ("protocol-wallet funding/burn", e.g.
  Proof of Burn) — never "the founder did X". Buckets are named
  "protocol-wallet funding/burn" specifically because `CHRONICLE_BANNED_TERMS`
  bans "founder"/"founders" in GENERATED copy (source comments may say it).
- **Institutional verdict map:** milestone/genesis/chapter/artifact/lp-add
  (liquidity seeding)/vault-in (treasury acquisition) → `approved`;
  lp-remove/vault-out/operations/founder-action/system-wallet-action/burn →
  `hold-context`; swap-buy/swap-sell (treasury revenue, recurring market flow) →
  `rejected`. The switch `default` is `hold-context`, so no unhandled category
  can ever auto-approve.
- **`promotionPath` "member-memory" is RESERVED for the DAO transition.** The
  track already exists in `promotionPathFor`; if governance ratifies the member
  register later, the change is localised to `memberRule()` (flip member buckets
  off hold-context) WITHOUT touching `institutionalRule()`. Re-derive history,
  never retro-write institutional entries; clause 6 still holds post-ratification.

## Adjacency (the legal edge)

Reads **chronicle-review-candidate-registry** (the leaf, TYPE only) — never the
chronicle-review DERIVER, never Memory/Signal/Event layers. Lineage back to
Memory→Signal→Event→Tx/Block is carried THROUGH each candidate's fields, never
re-derived. MAY import `chronicle-entries` VALUES (banned vocab) + `protocol-language`.

## Guard wiring (edit these in lockstep when adding a downstream layer)

- `signal-adjacency.test.ts`: both promotion files added to `FORBIDDEN_IMPORTS`
  (signals can't import them); new `PROMOTION_MODULES` describe (must import the
  chronicle-review registry; must NOT import protocol-events/protocol-signals/
  signal-registry/memory-candidates/memory-candidate-registry/chronicle-review
  deriver); forward-import guard added on the chronicle-review block.
- `signal-money-guardrail.test.ts`: both files added to `PRESTIGE_MODULES` + a
  new Rule-E magnitude-token describe block.
- `check-ownership-wording.mjs` is NOT in check-release — run it explicitly.
- New `/routes/labs.*` route fails tsc until `routeTree.gen.ts` regenerates
  (restart the "Start application" workflow). Full vitest OOMs → run per-file
  with `--maxWorkers=1` (NOT `--minWorkers`/`--poolOptions`, both rejected by this
  vitest CLI).
