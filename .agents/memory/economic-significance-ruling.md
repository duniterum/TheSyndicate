---
name: Economic significance ruling (subject decides standing)
description: Founder ruling separating economic significance from historic memory; what's durable beyond the canon text — the reconciliation insight, the lockstep-edit set, and the money-safe Signal Engine constraint.
---

# Economic significance — subject decides standing

Full doctrine lives in canon (`05` §4.5 Rules A–E, `06` §2). This file holds only the durable, non-doc-derivable lessons.

**The reconciliation insight (why this wasn't a loosening).** `05` §3.2's tier ladder *already* lists "major LP/Vault threshold" at S3 and "major liquidity milestone" at S4, while §4.3 said "money never raises a tier." Those only cohere via the **subject** distinction: a protocol-subject *threshold crossing* is a structural fact (earns tier by the crossing, not by size); person-subject money alone caps ≤S2. The ruling made that explicit — it did not weaken scarcity.

**Lockstep-edit set (all must move together or canon self-contradicts).** When the "money never raises a tier" slogan changes, FIVE places must stay in sync:
1. `05` §4.3 clause 3 (the primary statement)
2. `05` §4.5 (the full Rules A–E ruling block)
3. `06` §2 ("Person-subject money MUST NOT, by itself" + the intro parenthetical at the top of §2)
4. `05` §1 SIGNALS-layer table "Responsibilities" row (an easy-to-miss echo)
5. `07` FS-1 guardrails + `08` "How to apply"
**Why:** the architect's first review of the ruling caught two *unscoped echoes* (06 §2 intro + 05 §1 table) still stating the absolute slogan after the primary edits — a literal reader would hit the contradiction before the qualification. Grep the slogan across all of `docs/canon/` before declaring a money-scope change done.

**Money-safe Signal Engine constraint (Rule E).** `signal-registry.ts` / `StructuralFacts` must NEVER carry a money field (`amountUsd`, `usdcAmount`, `synAmount`, `walletBalance`, `archiveWeight`, `builderScore`, `commissionUsd`, `commissionPct`). Protocol thresholds enter as **pre-declared** structural facts only (`08`: no retroactive milestone invention; no buyer attribution on protocol-subject crossings). Magnitude marker is surfacing-only and lives OUTSIDE the signal leaf.

**Process note.** Recorded canon-only, no Signal Engine code, per the founder's propose→rule→record flow. Investment-performance phrases ("held through drawdown", "bought the dip", etc.) are quoted in `05` §4.5 Rule D only to ban them; they are NOT in doctrine-guard DOC_BANNED, and `docs/canon/` is not in the guard's scanned CANONICAL_DOCS set, so quoting them is safe.
