---
name: Institutional Register doctrine
description: The durable protocol-memory store layer (PROMOTION → REGISTER) — its chain position, gating, status semantics, and the substring banned-term test gotcha.
---

# Institutional Register (durable protocol-memory store)

The pipeline tail is now:
`… → CHRONICLE PROMOTION DECISION → INSTITUTIONAL REGISTER ENTRY` (the last frozen edge).

The Institutional Register is the **durable protocol-memory store**, NOT public
publishing. It is an **additive, inspection-only** layer: no auto-publish, no
Story, no Recognition, no DAO/member register, no contracts, no Chronicle
mutation. Files: `src/lib/institutional-register-registry.ts` (pure leaf) +
`src/lib/institutional-register.ts` (deriver) + labs route
`/labs/institutional-register`.

## Rules (frozen)
- **Adjacency:** the register reads CHRONICLE PROMOTION DECISIONS only. It imports
  the promotion **registry leaf** (`chronicle-promotion-registry`) + `protocol-language`
  + its own leaf — never the promotion **deriver** (`chronicle-promotion`), nor the
  chronicle-review / memory / signal / event layers. Lineage is carried THROUGH the
  decision, never re-derived. Enforced by the REGISTER_MODULES block in
  `signal-adjacency.test.ts` (both directions + a forward-guard on the promotion block).
- **Register gating:** ONLY `register==="protocol-institutional"` creates an entry.
  Member-living decisions are **excluded entirely** (never written) — the member
  register is reserved for DAO ratification (chronicle-entries clause 6).
- **Status mapping:** `approved`→`draft`; `active` ONLY iff human-finalised
  (reviewer≠BASELINE_REVIEWER && timestamp≠null) AND coverage-ok; `hold-context`/
  `hold-coverage`→`held`; `rejected`→`rejected`. **Durable ≠ published** — there is
  deliberately no "published" status; promotion to `active` is a human/governance act.
  `createdAt` is set ONLY for an `active` entry.
- **Verification:** `hold-coverage`→`coverage-limited` (which must assert no historic
  "first/genesis…" wording, gated by `findHistoricClaims`); else `verified`. `locked`
  is reserved for explicitly-locked facts; the baseline deriver never emits it.
- **Money/identity blind:** copy is generated from a static `COPY_BY_BUCKET` table
  keyed by `ruleBucket` only — never an amount, never the actor. Protocol-centric
  framing; a steward/system-wallet act is never heroised as a person's achievement.
  `copyViolations` is a **recorder** (validateRationaleVocabulary + findForbiddenLanguage
  + findHistoricClaims), not a gate — upstream promotion already rejects unsafe copy.

## Gotcha — doctrine copy tests match banned terms by SUBSTRING, not word boundary
`assertCleanRationale`/`assertCleanCopy` in these layers loop `CHRONICLE_BANNED_TERMS`
with `.toLowerCase().toContain(term)` — **substring**, stricter than the deriver's own
guard (`findForbiddenLanguage` uses `\b` word boundaries). So a clean-by-word-boundary
word can still FAIL the test if a banned term is a substring: `"heroised"` contains
`"roi"`, `"appreciation"` contains nothing but watch for it. **When writing any
protocol-memory copy string, avoid banned substrings, not just standalone banned
words.** This cost a test iteration in Sprint 6 (fixed by rewording "heroised" →
"personal achievement").

**Why:** the substring check is intentional belt-and-suspenders; don't "fix" it by
loosening the test — fix the copy.
