---
name: Chronicle Review Candidate layer
description: Doctrine + invariants for the Memory Candidate → Chronicle Candidate (review-ready) layer; what it reads, how eligibility works, why copy is regenerated.
---

# Chronicle Review Candidate layer (Memory → Chronicle, review-ready only)

The leaf `chronicle-review-candidate-registry.ts` + deriver `chronicle-review-candidates.ts`
answer ONE question: "which Memory Candidates are eligible to become permanent
Chronicle entries LATER?" It is review-ready ONLY — no auto-publish, no Story, no
Recognition, no contract, no public UI. Inspection lives at `/labs/chronicle-candidates` (noindex).

## Rules (durable)
- **Adjacency extends one more hop.** Chronicle-review reads MEMORY CANDIDATES only —
  never protocol-events / protocol-signals / signal-registry(value). Lineage
  (memory→signal→event→tx/block) is carried THROUGH the MemoryCandidate, never re-read.
  The only legal cross-import besides memory-candidate-registry is `chronicle-entries`
  (the Chronicle's own downstream vocabulary) and `protocol-language` (the guard).
- **Eligibility is tier-driven and identity-neutral.** S0 never; S1 only a Chronicle
  safe-set of categories; S2+ always. There is NO actor-identity branch — a
  founder/system act qualifies via tier/category, never via who acted. Carry `tier`
  onto MemoryCandidate (Sprint-3 additive) so this layer never reaches back to the Signal.
- **Money never alone elevates** (canon §4.5 Rule E). Both modules are in
  signal-money-guardrail's PRESTIGE_MODULES + magnitude-token block; no amount field exists.
- **Review-first.** Derivers only ever EMIT `needs-review` / `hold-coverage` /
  `hold-context`; `approved` / `rejected` are human-only values. recommendedAction is
  strictly `promote-on-review` | `hold` (hold iff a hold-* status). reviewStatus
  precedence: hold-coverage > hold-context > needs-review.
- **Copy is regenerated person-free.** Never reuse a MemoryCandidate's title/summary —
  those may name a "founder". Generate OWN Chronicle-voice copy from STRUCTURE only,
  then validate every string vs findForbiddenLanguage + CHRONICLE_BANNED_TERMS +
  CHRONICLE_FORBIDDEN_SUBJECT_PATTERNS → copyViolations.

## Gotchas
- `"returns"` is banned but `"return"` / `"returned"` are safe — significanceReason may say "returned".
- Guard enforcement is DECOUPLED (like the doctrine guard): adding a new module to the
  adjacency/money guards requires manually editing FORBIDDEN_IMPORTS / PRESTIGE_MODULES
  arrays — reclassifying nothing auto-enforces.
- The S1 safe-set is broader than the spec's literal "first/new/continuity" wording.
  **Why:** defense-in-depth. In the LIVE pipeline it's equivalent — the upstream memory
  deriver only emits S1 institutional candidates through the first-funding+coverage gate.
  A hand-authored non-first S1 treasury MemoryCandidate would be accepted; only matters
  if hand-authored MemoryCandidates ever become an input path.
- A `pending`-verification candidate gets needs-review/promote-on-review (NOT a hold) by
  design — significanceReason flags "awaits verification" so a curator still sees it.
