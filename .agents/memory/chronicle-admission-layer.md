---
name: Chronicle Admission layer
description: The Institutional Register Entry → Chronicle Admission Candidate edge — inspection-only eligibility, its precedence ladder, and its adjacency/import rules.
---

# Chronicle Admission layer (the pipeline's last edge)

A minimal, inspection-only bridge: `INSTITUTIONAL REGISTER ENTRY → CHRONICLE
ADMISSION CANDIDATE`. It decides which durable institutional entries are
ELIGIBLE to LATER become Chronicle entries. It is a CANDIDATE layer, never a
publisher: it publishes nothing, rewrites no Chronicle entry, builds no
Story/Recognition/Member-Register/Governance/AI, changes no upstream deriver,
touches no contract. Promotion of an `admitted` candidate INTO the Chronicle is
always a separate human / governance act.

**Files:** `chronicle-admission-registry.ts` (leaf: types, buckets,
`resolveAdmission`, copy validators, maintainer notes) + `chronicle-admission.ts`
(pure deriver). Surface: hidden `/labs/chronicle-admission`.

## Precedence ladder (resolveAdmission) — COPY > COVERAGE > RULES
- **P0** member-living excluded entirely (never a candidate): `register !==
  INSTITUTIONAL_REGISTER` OR `registerForCategory(proposedChronicleCategoryFor(
  category)) === "member-living"` (catches membership/continuity).
- **P1** any copy violation → `rejected` (outranks an admit bucket).
- **P2** incomplete lineage (`isLineageComplete`) → `held`.
- **P3** source `entryStatus`: rejected→rejected, held→held, draft→review.
- **P4** active but `coverage-limited` → `held` (no historic admission).
- Then `requiresInstitutionalSignificance` (founder/system-wallet) → `review`;
  then `ADMISSION_ADMIT_BUCKETS` keyed on `createdFrom` → admitted; UNKNOWN
  bucket → `review` (NEVER auto-admit).

**Why:** admission must read STRUCTURE (register / category / rule bucket /
verification / lineage), never amount or identity — money may never by itself
admit a fact (canon §4.5 Rule E). Admit buckets = liquidity seeding, treasury
acquisition, artifact issuance, protocol milestone, chapter completion, and
`genesis-seed`.

## Adjacency import rule
**How to apply:** the two lib modules read INSTITUTIONAL REGISTER ENTRIES only.
They must NEVER import the institutional-register DERIVER, the genesis SEED leaf,
or any further-upstream layer (promotion/review/memory/signals/events). They MAY
import: register-registry leaf (+`findHistoricClaims`), register-public leaf
(+`isLineageComplete`/`findPublicVocabularyViolations`), `protocol-language`, and
`chronicle-entries` (classification vocabulary only — `registerForCategory` /
`requiresInstitutionalSignificance`, never its candidate pipeline). The genesis
seed is merged with the derived register at the ROUTE
(`mergeInstitutionalEntries(genesis, derived)`), which is outside the guard.

## Lockstep wiring (edit together or the guard rots)
- `signal-adjacency.test.ts`: `ADMISSION_MODULES` describe forbidding the
  upstream/deriver/genesis imports, requiring the registry leaf.
- `signal-money-guardrail.test.ts`: both modules added to `PRESTIGE_MODULES` +
  a Rule-E magnitude-token describe.
- `protocol-knowledge-map.ts`: surface `/labs/chronicle-admission` added to the
  EXISTING chronicle + institutional-register node `internalSurfaces` (+ the
  registry to the institutional-register node's `registries`). A NEW node id is
  avoided on purpose: `protocol-knowledge-map.test.ts` requires the canon doc to
  name every layer id, so a new node would force a doc edit.
- `labs.index.tsx` nav link.

## Genesis-seed e2e fixture (stable numbers)
`mergeInstitutionalEntries(deriveGenesisRegisterEntries(), [])` → 9 entries → 1
member-living (`earliest-member`, membership) excluded at P0 → 8 candidates: 6
admitted (the active verified/locked protocol-birth facts via the genesis-seed
bucket) + 2 held (`earliest-artifact`/`earliest-milestone`, coverage-limited).
All copy clean. Genesis lineage uses honest sentinels so `isLineageComplete`
holds.

**Spec deviation (disclosed):** the candidate carries lineage as an array plus
`sourceInstitutionalEntryId` / `sourcePromotionDecisionId` / `sourceTxHash`,
rather than spec §1's individually-named `sourceChronicleReviewCandidateId` /
`sourceMemoryCandidateId` / `sourceSignalId` / `sourceEventId` / `sourceBlock`.
Functionally equivalent (upstream genesis values are sentinels); `sourceBlock`
is not carried.
