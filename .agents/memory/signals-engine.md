---
name: Signals Engine (Event → Signal)
description: Design rules + doctrine for the minimal deterministic Signals layer (signal-registry.ts + protocol-signals.ts); read before touching Signals.
---

# Signals Engine

The minimal, pure, deterministic Event → Signal layer. `signal-registry.ts` is the
vocabulary leaf; `protocol-signals.ts` (`deriveSignals`) is the only deriver. Output-only —
nothing is written back into the pipeline.

## Core shape
- **Signal = Type × Tier × Subject.**
  - `SignalType` (7, EVENT-DOMAIN): MEMBERSHIP / ECONOMIC / MILESTONE / BURN / CHAPTER / CONTINUITY / ARTIFACT.
  - `SignalTier`: S0 noise → S5 constitutional.
  - `SignalSubject`: protocol / member / wallet / treasury / artifact / milestone / chapter. `member`+`wallet` are PERSON subjects.
- Base classification per event kind lives in `SIGNAL_RULE_FOR_KIND` (exhaustive over the 14 `ProtocolEventKind`). Person-subject rows are capped at S2 in the table itself.

## Two hard rules (both enforced in code + tests)
1. **Adjacency Law** (canon 05 §2.1): Signals read EVENTS only. The signal modules must never import Memory/Recognition (chronicle-entries/-candidates, recognition-candidates, protocol-memory, protocol-ledger, leaderboard-hooks, referral previews). `signal-adjacency.test.ts` scans imports.
2. **Money guardrail** (canon 05 §4.5): a person subject can NEVER exceed S2. Protocol significance is emitted as SEPARATE milestone/protocol-subject signals, so a person's row never moves. The deriver MAY read a raw `amountUsd` ONLY to detect a PRE-DECLARED threshold crossing (Rule A); the magnitude never enters tier logic. Proof: `signal-engine.test.ts` scales amounts ×10⁶ and asserts person tiers are identical.
   - **Why the guardrail test split matters:** `signal-registry.ts` + `protocol-signals.ts` are now in `PRESTIGE_MODULES` (checks MONEY_SCORE_TOKENS — `amountUsd` is NOT one of those, so the deriver reading it is fine). The Rule-E magnitude-token check (`amountUsd`/`usdcAmount`/`walletBalance`/…) runs against `signal-registry.ts` ONLY — the deriver legitimately reads `amountUsd`, the vocabulary leaf must not name any magnitude field.

## Deriver semantics (don't regress)
- Sorts events ascending by block/logIndex; returns oldest→newest; unique ids `sig-${eventId}-${tag}`.
- CONTINUITY = repeat purchase by same `from` (count n≥2, never a sum).
- MILESTONE = member ordinal (`MEMBER_MILESTONE_BY_TARGET`) / cumulative-USDC crossing (crossed-set, prev<target≤cumulative, once) / first artifact issuance.
- BURN historic = `proofOfFireIndex === 1` → S4 protocol. The index is set upstream ONLY when the burn scan is gapless, so its presence is its own reliability gate.
- **Coverage gating:** all "first ever" / ordinal / cumulative-threshold milestones are gated on `windowCoversDeployment` (mirrors chronicle-candidates). Off ⇒ window-relative; never assert a protocol-wide first. The CONTINUITY *reason wording* is also coverage-gated — without coverage it says "purchased again within the loaded window", never an absolute "Nth purchase" (the count is window-relative). See `windowed-first-claims.md`.

## Event-layer dependency (additive only)
`deriveSignals` consumes two OPTIONAL structured fields on `CanonicalProtocolEvent`: `memberOrdinal` (from the new-member normalizer's member counter) and `proofOfFireIndex` (from the burn normalizer's `proofOfFireNumber`). Both are money-safe counts populated from already-existing structured values — never title-parsed. Keep these additive.

## Open caveats (Sprint 3 preconditions — NOT yet done)
- **`windowCoversDeployment` is caller-asserted.** The `/labs/signals` toggle lets a human flip it on over a recent (e.g. 48-event) window where ordinals/cumulative totals are window-relative — fine for a dev workbench only. Before ANY non-labs consumer (Memory auto-curation, Chronicle) reads signals, derive the flag from REAL scan coverage (e.g. the incremental purchase cache), do not let a caller assert it.

## Canon §3.2 terminology collision (flag a future canon addendum)
Canon §3.2 also freezes a SEPARATE seven-name list — Timing/Conviction/Support/Growth/Participation/Structural/Historic — as RECOGNITION MEANING FACETS (downstream Recognition axis). Those are NOT the 7 EVENT-DOMAIN `SignalType`s above. Two different AXES; do not merge. "Signals is not Recognition." Recommend a canon addendum recording the split (only documented in the signal-registry.ts header so far).
