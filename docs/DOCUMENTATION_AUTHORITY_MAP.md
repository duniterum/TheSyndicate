# Documentation Authority Map

> **Consolidated (2026-06-11):** a navigable canon front door now exists at
> `docs/canon/00_AUTHORITY_MAP.md`. **This file remains binding and
> guard-enforced** as the detailed, per-document classification and the
> superseded-doctrine table. Start at the canon; come here for the full lists.

Status: **binding**. This is the single source of truth for how to read every
markdown file in `docs/`. The protocol has gone through several audit waves;
earlier waves used vocabulary and cohort names that have since been superseded.
Without an authority map, an old audit can quietly drive a new implementation
decision in the wrong direction.

> **Rule:** future implementation, design, and review work may rely **only**
> on CANONICAL and OPERATIONAL docs. HISTORICAL and DEPRECATED docs are kept
> for record. They are not implementation authority.

---

## Authority classes

| Class            | Meaning                                                                                          | May guide future work? |
| ---------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| **CANONICAL**    | Current source of truth. Doctrine, constitution, gates, vision.                                  | **Yes**                |
| **OPERATIONAL**  | Current checklists, runbooks, integration status, contract maps, plans.                          | **Yes**                |
| **HISTORICAL**   | Audit snapshot or report from a previous wave. Kept for record.                                  | No                     |
| **DEPRECATED**   | Superseded and would be dangerous if referenced as-is. Kept only for traceability.               | No                     |

Docs that contain pre-doctrine vocabulary (see "Superseded doctrines" below)
must either be CANONICAL with surgical updates, or carry a `Historical note`
header on line 1.

---

## Doctrine reading order (canonical)

Any future AI or contributor reads doctrine in this exact order before
touching product work:

1. `docs/VISION.md` — what it is / is not
2. `docs/NORTH_STAR_SYSTEM.md` — what we measure (verified members; the six loops)
3. `docs/STORY_ENGINE_AND_EMOTIONAL_OPERATING_SYSTEM.md` — how it means / feels / behaves
4. `docs/INFORMATION_HIERARCHY.md` — how it surfaces
5. `docs/SCARCITY_STATUS_PERMANENCE_AUDIT.md` — identity / the seat (supporting facets: `docs/MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md`)
6. `docs/RANK_CONSTITUTIONAL_RULING.md` — rank doctrine
7. `docs/DOCUMENTATION_AUTHORITY_MAP.md` (this file) — precedence + vocabulary + classification
8. Domain docs as needed — Archive · Chronicle · My Syndicate · loops (`docs/LOOP_OWNERSHIP_DECISION.md`)

---

## CANONICAL

The doctrine layer. Vision, gates, decision frameworks.

### Constitutional layer (highest authority — read first, in order)

1. `docs/VISION.md` — **constitutional.** What the protocol is / is not; pillars; phased roadmap. The apex.
2. `docs/NORTH_STAR_SYSTEM.md` — **constitutional.** Metric doctrine: verified members, the six loops, "live or PENDING". *(Reclassified HISTORICAL → CANONICAL 2026-06-09.)*
3. `docs/STORY_ENGINE_AND_EMOTIONAL_OPERATING_SYSTEM.md` — **constitutional (behavioral).** How the protocol means / feels / behaves over time. *(Registered 2026-06-09.)*
4. `docs/INFORMATION_HIERARCHY.md` — **constitutional.** The 10-second contract; homepage zones; cross-route + navigation rules. *(Reclassified HISTORICAL → CANONICAL 2026-06-09.)*
5. `docs/SCARCITY_STATUS_PERMANENCE_AUDIT.md` — **constitutional (identity apex).** The seat is the product; the five constitutive facts.
6. `docs/RANK_CONSTITUTIONAL_RULING.md` — **constitutional (rank doctrine).** Canonical definition of Rank; supersedes all prior rank meanings. *(Registered 2026-06-09.)*
7. `docs/CONSTITUTION_SUMMARY.md` — index + ratification record of the constitutional layer.

### Doctrine & frameworks

- `docs/AAA_DECISION_LENSES.md`
- `docs/FOUNDER_MULTI_HAT_EVALUATION_FRAMEWORK.md`
- `docs/INFINITE_NARRATIVE_AUDIT.md`
- `docs/MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md` — identity (cultural facet; subordinate to the SCARCITY identity apex).
- `docs/ARCHITECTURE_PROPOSAL_AAA.md`
- `docs/TERMINOLOGY_GLOSSARY.md`
- `docs/PRE_CONTRACT_ALIGNMENT_AUDIT.md`
- `docs/PROTOCOL_EXECUTION_CONTROL_SYSTEM.md` — severity + decision-outcome framework, release gates, activation gates, invariants
- `docs/DOCUMENTATION_AUTHORITY_MAP.md` (this file)

### Supporting doctrine (canonical, subordinate to the constitutional layer)

- `docs/EMOTIONAL_ARCHITECTURE_AUDIT.md` — behavioral-loop research catalog; subordinate to the North Star six-loop registry. *(Registered 2026-06-09.)*
- `docs/PRODUCT_MEMORY_AND_FUTURE_LOOPS.md` — product-memory record protecting salvageable concepts and entity distinctions. *(Registered 2026-06-09.)*
- `docs/SYNDICATE_PROTOCOL_MODEL.md` — canonical economic model: SYN seat doctrine, contribution depth, economic scale, 70/20/10 routing, and institutional trust capital. *(Reclassified HISTORICAL -> CANONICAL 2026-06-20.)*
- `docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md` — canonical V3 pre-Solidity specification: deterministic era pricing, acquisition-first routing, public/approved source policy, source registry requirements, receipt schema, and V3 boundaries. *(Registered 2026-06-20.)*
- `docs/IDENTITY_ATTRIBUTION_CONSTITUTION.md` — canonical boundary for current seat status, historical identity, recovery, Privy, SeatRecord721, and source attribution. *(Registered 2026-06-20.)*
- `docs/MODULE_INTEGRATION_STANDARD.md` — canonical anti-fragmentation standard for future modules: taxonomy, manifest fields, payment/source/receipt/read-model gates, SwapRail posture, Archive attribution options, and no page-by-page patching. *(Registered 2026-06-22.)*
- `docs/PROTOCOL_ORGANISM_GRAPH.md` — canonical module relationship map: current live/proven graph, source attribution lifecycle, Archive/NFT non-edges, future module intake, read-model propagation, and anti-fragmentation operating questions. *(Registered 2026-06-22.)*
- `docs/PROTOCOL_EVOLUTION_LAYER_ARCHITECTURE.md` — canonical architecture for the public Protocol Evolution layer: evidence-backed module status, community-signal loop, anti-drift rules, and V1/V2/V3 implementation sequence. It has no activation, source-record, claim-UI, transaction, deployment, or publish authority. *(Registered 2026-06-24.)*
- `docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md` — knowledge-map index: where each kind of protocol knowledge lives (Protocol Knowledge vs Institutional Register Memory). Defers to the code registry `src/lib/protocol-knowledge-map.ts`. *(Registered 2026-06-12.)*

### Consolidated canon set (`docs/canon/`)

The `docs/canon/` front-door set consolidates the authority map, doctrine maps,
glossary, and source-of-truth findings into one navigable layer. Entry point
`docs/canon/00_AUTHORITY_MAP.md` and knowledge-map index
`docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md` are listed above. All are CANONICAL.

- `docs/canon/01_FOUNDER_INTENT_MAP.md` — why each concept exists and what it must never become. *(Vocabulary-defining: exempt from the banned-vocab scan — see Enforcement.)*
- `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md` — per-concept contract / code / doc source + status.
- `docs/canon/03_GLOSSARY.md` — the one approved word per concept + collision rulings. *(Vocabulary-defining: exempt from the banned-vocab scan — see Enforcement.)*
- `docs/canon/04_DOC_SYNC_CHECKLIST.md` — what to update, in what order, after a change. *(Vocabulary-defining: exempt from the banned-vocab scan — see Enforcement.)*
- `docs/canon/05_FOUNDATION_FREEZE.md` — the five-layer architecture constitution + Adjacency Law.
- `docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md` — how money may surface; the money≠prestige guardrail.
- `docs/canon/07_FOUNDER_PRINCIPLE.md` — approved-but-unbuilt strategic direction.
- `docs/canon/08_PROTOCOL_OPERATING_PRINCIPLE.md` — derive, don't invent.

*(Canon set wired into the doctrine guard's `CANONICAL_DOCS` scan 2026-06-12, Batch 8.)*

### Precedence rule (when docs disagree)

1. **On-chain truth** (live read from Avalanche C-Chain 43114)
2. **Canonical registries** (`contract-registry.ts`, `archive-id-registry.ts`, `chain-registry.ts`, `execution-gates.ts`)
3. **Execution gates** (`scripts/check-execution-gates.mjs`, `PROTOCOL_EXECUTION_CONTROL_SYSTEM.md`)
4. **Current canonical docs** (this CANONICAL list)
5. **Operational docs** (OPERATIONAL list below)
6. **Historical docs** (HISTORICAL list — record only, never authority)

Execution authority rule: current readback beats remembered authority. A
canonical document or previous readback can explain lineage, but transactions,
deployments, funding, recovery, registry changes, source creation, activation,
Replit publish, and production claims require a fresh current-authority check
against live chain/repository/frontend/production state immediately before
action.

## OPERATIONAL

Active runbooks, registries, integration maps, deployment state, contract
specs that match the deployed reality. Safe to reference for current work.

> **Do not infer chain, explorer, address, or ABI data.** Import from the
> canonical registry (`src/lib/chain-registry.ts`,
> `src/lib/contract-registry.ts`, `src/lib/archive-id-registry.ts`).
> Operational entry points: `docs/PROTOCOL_KNOWLEDGE_INDEX.md` for
> whole-protocol navigation and `docs/CANONICAL_REGISTRY.md` for canonical
> registry references. Activation checklist: `docs/ACTIVATION_RUNBOOK.md`. Operational mistakes, sync
> boundaries, sandbox limits, and Replit/GitHub workflow lessons belong in
> `docs/OPERATIONAL_MEMORY_LEDGER.md`. Production synchronization, Replit
> pull/publish decisions, live route QA, Replit push-back rules, and
> GitHub/Replit/production state separation belong in
> `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md`. Current-authority readback
> rules also belong there.

- `docs/CANONICAL_REGISTRY.md`
- `docs/PROTOCOL_KNOWLEDGE_INDEX.md` - whole-protocol knowledge front door
  that routes current work across V3, SourceRegistryV1, referral/source
  attribution, Activity, Registry, Chronicle, My Syndicate, Transparency,
  Archive1155, future modules, operational memory, production sync, and guard
  files. It has no deployment, publish, transaction, source-record, activation,
  registry-switch, referral, or claim-UI authority.
- `docs/OPERATIONAL_MEMORY_LEDGER.md` - operational first-read for synchronization, release, deployment, current-authority readback, Git, Replit, sandbox, credential, and handoff work. It has no deployment authority.
- `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md` - operational doctrine for GitHub/Replit/production synchronization, change classification, Replit pull/publish decisions, route QA, wallet/write-path QA, push-back rules, Codex after-Replit protocol, and final reporting. It has no deployment, publish, transaction, registry, source-record, activation, or claim-UI authority.
- `docs/PROTOCOL_CHECKPOINT_2026_06_25.md` - whole-protocol continuity checkpoint after the first internal source readback, source-operator console, first completed internal source-attribution real-condition ceremony, and Replit live sync. It has no deployment, publish, transaction, source-record, activation, registry-switch, referral, or claim-UI authority.
- `docs/SOURCE_ACTIVATION_READINESS_PACKET.md` - non-transactional readiness packet for the existing internal PAUSED source record before any possible future ACTIVE status ceremony. It has no deployment, publish, transaction, source-record, source-activation, referral, registry-switch, public-source-link, source-aware-buy-path, or claim-UI authority.
- `docs/SOURCE_ACTIVE_CEREMONY_PREFLIGHT.md` - current-authority preflight packet and readback command list for a possible future ACTIVE source status ceremony. It has no deployment, publish, transaction, source-activation, referral, registry-switch, public-source-link, source-aware-buy-path, or claim-UI authority.
- `docs/SOURCE_AWARE_LOCAL_TEST_PATH.md` - internal source-aware test boundary for the internal PAUSED source record, including localhost and explicit production-internal modes. It has no deployment, publish, production-route, transaction, source-record, source-activation, referral, registry-switch, public-source-link, public source-aware-buy-path, or claim-UI authority.
- `docs/SOURCE_REAL_CONDITION_CEREMONY_READBACK.md` - final current-authority readback for the first completed internal source-attribution real-condition ceremony. It records the terms update, controlled ACTIVE status, one $5 source-attributed buy, re-pause, receipt fields, payout/escrow state, and public-inactive boundaries. It has no deployment, publish, transaction, source-terms-update, source-activation, buy, re-pause, referral, registry-switch, public-source-link, public source-aware-buy-path, or claim-UI authority.
- `docs/SOURCE_REAL_CONDITION_TEST_PLAN.md` - executed founder prep plan for the before-July real-condition source-attributed $5 test, including source-term update values, internal route gates, and readback sequence. The final readback doc supersedes it for ceremony result truth. It has no deployment, publish, transaction, source-terms-update, source-activation, referral, registry-switch, public-source-link, public source-aware-buy-path, or claim-UI authority.
- `docs/SOURCE_REAL_CONDITION_FOUNDER_CEREMONY_GUIDE.md` - founder-facing human ceremony guide for the exceptional real-condition source test. It explains step order, approval phrases, operator roles, and stop conditions. The final readback doc supersedes it for ceremony result truth. It has no deployment, publish, transaction, source-terms-update, source-activation, buy, re-pause, referral, registry-switch, public-source-link, public source-aware-buy-path, or claim-UI authority.
- `docs/ACTIVATION_RUNBOOK.md`
- `docs/HOLDER_INDEX_ARCHITECTURE.md`
- `docs/DEPLOYMENT_STATE_V1.md`
- `docs/CONTRACT_INTEGRATION_STATUS.md`
- `docs/ARCHIVE1155_CANONICAL_ARCHITECTURE.md`
- `docs/WALLET_TRANSACTION_ARCHITECTURE.md` — canonical wallet/session, tx lifecycle, payment flow, explorer, error classifier, future-NFT checklist
- `docs/SALE_FLOW_INVARIANTS.md` — six write-path invariants (registry · freshness · pinning · sync · explorer · mint-hash persistence)
- `docs/DEFERRED_WORK_LEDGER.md` — single place for intentionally deferred items (severity · why · revisit · prerequisite)
- `docs/DATA_SOURCE_MAP.md`
- `docs/DATA_VERIFICATION_REGISTRY.md`
- `docs/TRANSACTION_TAG_REGISTRY.md`
- `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`
- `docs/SMART_CONTRACTS_DEFERRED.md`
- `docs/SMART_CONTRACT_DECISIONS_PENDING.md`
- `docs/SOLIDITY_REVIEW_STATE.md`
- `docs/ACCESSIBILITY_CHECKLIST.md`
- `docs/ANALYTICS_READINESS_PLAN.md`
- `docs/MONITORING_READINESS_PLAN.md`
- `docs/PRODUCTION_LOCK_CHECKLIST.md`
- `docs/REAL_USER_TEST_PLAN.md`
- `docs/MVP_TESTING_SCRIPT.md`
- `docs/OG_RENDERING_STRATEGY.md`
- `docs/OG_RENDERING_VERIFICATION.md`
- `docs/SEARCH_SUBMISSION_NOTES.md`
- `docs/FULL_SITE_MAP.md`
- `docs/REFERRAL_SOURCE_ATTRIBUTION_STRATEGIC_RESEARCH.md` - strategic referral/source-attribution research and architecture reference. It has no activation, deployment, source-record, claim-UI, or transaction authority.
- `docs/REFERRAL_INFRASTRUCTURE_PLATFORM_AUDIT.md` - referral infrastructure platform research and source-attribution blueprint. It has no activation, deployment, source-record, claim-UI, public-source-link, or transaction authority.
- `docs/STRATEGIC_NARRATIVE_AND_EXECUTION_ORDER.md` — operational synthesis of story, audience narratives, deferred-work triage, and execution order after the 2026-06-22 full-site/protocol baseline audit. Current source/referral state in this older synthesis is superseded by `docs/PROTOCOL_CHECKPOINT_2026_06_25.md`. It does not override canonical doctrine or authorize transactions/activation.
- `docs/NFT_ARCHIVE_DESIGN_REFERENCES.md`
- `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md`
- `docs/V3_ACQUISITION_ENGINE_TEST_PLAN.md`
- `docs/V3_DEPLOYMENT_READINESS_PACKAGE.md` — hardware-wallet-first V3 operational deployment-preparation package. No deployment or activation authority.

> Docs that were previously treated as operational but still carry
> pre-doctrine vocabulary (NFT_ARCHIVE V1 specs, ARCHIVE_9_SLOT_READINESS_AUDIT,
> FINISHING_PHASE_ROADMAP, LIVING_PROTOCOL_AUDIT, WAVE_3B_GATE) have been
> moved to HISTORICAL with a header warning. The code remains the truth for
> any value those docs used to track.



## HISTORICAL

Audit snapshots, completion reports, and recalibration records from previous
waves. Useful for understanding how we arrived here; **must not** be used as
implementation authority. Any of these that contain pre-doctrine vocabulary
carry a `Historical note` header.

- `docs/AAA_FOUNDER_READINESS_REPORT.md`
- `docs/AAA_HOLISTIC_FOUNDER_AUDIT.md`
- `docs/CODE_HEALTH_AUDIT.md`
- `docs/CONTENT_CONSISTENCY_AUDIT.md`
- `docs/FINAL_AAA_SELF_AUDIT.md`
- `docs/FINAL_CACHE_PARITY_SAFETY_REPORT.md`
- `docs/FINAL_EXECUTION_SPRINT_REPORT.md`
- `docs/FINAL_INFORMATION_ARCHITECTURE_DECISION.md`
- `docs/FINAL_LAUNCH_FIX_REPORT.md`
- `docs/FINAL_PRE_ADS_LOCK_REPORT.md`
- `docs/FINAL_PRE_ADS_QA_AND_MEASUREMENT_REPORT.md`
- `docs/FINAL_PRE_LAUNCH_VERIFICATION_REPORT.md`
- `docs/FINAL_PROFESSIONAL_POLISH_REPORT.md`
- `docs/FINAL_PROJECT_HEALTH_AND_REPAIR_REPORT.md`
- `docs/FINAL_USER_FACING_COMPLETION_REPORT.md`
- `docs/FIRST_TIME_VISITOR_ACTION_AUDIT.md`
- `docs/FULL_FLYWHEEL_RESTORATION_REPORT.md`
- `docs/FULL_SITE_AAA_AUDIT.md`
- `docs/FULL_SITE_STRUCTURE_AND_HEALTH_REPORT.md`
- `docs/IMPLEMENTATION_EXECUTION_PLAN.md`
- `docs/INFORMATION_HIERARCHY_MASTER_PLAN.md`
- `docs/LIGHTHOUSE_PRE_ADS_AUDIT.md`
- `docs/LIVE_DATA_COMPLETION_AUDIT.md`
- `docs/LIVE_PRODUCTION_P6_P8_PARITY_REPAIR_REPORT.md`
- `docs/LIVE_SITE_DISCREPANCY_AUDIT.md`
- `docs/LIVE_SITE_PARITY_AND_TRUTH_CLEANUP_REPORT.md`
- `docs/LOOP_OWNERSHIP_DECISION.md`
- `docs/LOW_COST_FINAL_HARDENING_REPORT.md`
- `docs/MASTER_PROTOCOL_CONTEXT.md`
- `docs/MULTI_HAT_SITE_SCORECARD.md`
- `docs/MVP_BEHAVIOR_METRICS.md`
- `docs/MVP_CONFUSION_SIGNALS.md`
- `docs/MVP_READINESS_AUDIT.md`
- `docs/MVP_READINESS_AND_CONVERSION_AUDIT.md`
- `docs/NAVIGATION_IA_AUDIT.md`
- `docs/NFT_FINAL_ARCHITECTURE_AUDIT.md`
- `docs/P6_EXECUTION_AND_READINESS_REPORT.md`
- `docs/P6_IMPLEMENTATION_AND_ARCHIVE_REPORT.md`
- `docs/P9_PRODUCT_JUDGMENT_RECALIBRATION.md`
- `docs/PRE_ADS_DESIGN_CTA_COPY_RISK_REPORT.md`
- `docs/PRE_LAUNCH_HARDENING_REPORT.md`
- `docs/PREVIEW_RENDERED_TRUTH_FAILURE_REPORT.md`
- `docs/PRODUCT_ARCHITECTURE_MAP.md`
- `docs/PRODUCT_DECISION_FRAMEWORK.md`
- `docs/PRODUCTION_PARITY_AND_VISUAL_FLYWHEEL_REPORT.md`
- `docs/PRODUCTION_PARITY_FAILURE_REPORT.md`
- `docs/PROTOCOL_COHESION_AUDIT.md`
- `docs/PROTOCOL_TRUTH_LAYER_REPORT.md`
- `docs/PUBLISH_CONFIRMATION_REPORT.md`
- `docs/RANK_DISTRIBUTION_SPEC.md`
- `docs/RETURN_LOOP_ARCHITECTURE.md`
- `docs/ROUTE_ARCHITECTURE_AUDIT.md`
- `docs/ROUTE_STALE_SYSTEM_REPAIR_REPORT.md`
- `docs/SCALABILITY_AND_ARCHITECTURE_AUDIT.md`
- `docs/SITE_HARMONIZATION_AUDIT.md`
- `docs/SITE_REDESIGN_EXECUTION_REPORT.md`
- `docs/STATUS_EMPTY_PENDING_AUDIT.md`
- `docs/STEP_BY_STEP_FROM_HERE.md`
- `docs/STORY_ENGINE_AUDIT.md`
- `docs/TECHNICAL_DEBT_AND_LAUNCH_RISK_REPORT.md`
- `docs/TRANSPARENCY_ROUTE_TRUTH_REPAIR_REPORT.md`
- `docs/UX_CTA_FLOW_AUDIT.md`
- `docs/VISUAL_FLYWHEEL_AND_PROTOCOL_ECONOMY_REPORT.md`
- `docs/WALLET_SESSION_AUDIT.md`
- `docs/WALLET_UX_FLOWS.md`
- `docs/WAVE_P_EXECUTION_REPORT.md`
- `docs/WAVE_3B_GATE.md`
- `docs/ARCHIVE_ENGINE_SPEC.md`
- `docs/ARCHIVE_ENGINE_V1.md`
- `docs/ARCHIVE_ENGINE_V1_INTEGRATION_REPORT.md`
- `docs/ARCHIVE_9_SLOT_READINESS_AUDIT.md`
- `docs/CHAPTER_ARCHIVES_QA.md`
- `docs/FINISHING_PHASE_ROADMAP.md`
- `docs/LIVING_PROTOCOL_AUDIT.md`
- `docs/NFT_ARCHIVE_EXPLAINED.md`
- `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`
- `docs/NFT_ARCHIVE_SMART_CONTRACT_ARCHITECTURE_V1.md`
- `docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md`
- `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md`
- `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md`
- `docs/TRANSPARENCY_ROUTE_TRUTH_REPAIR_REPORT.md`


## DEPRECATED

Superseded by current doctrine. Names and cohorts in these docs no longer
match the chapter system. Carry a `Historical note` header.

- `docs/CHAPTER_ARCHIVES_SPEC.md` — uses First 100 / First 500 / First 1000 cohort system, replaced by the five canonical chapters.
- `docs/MEMBER_WALL_SPEC.md` — same.
- `docs/FOUNDERS_HALL_SPEC.md` — built around "first 100 founders" cohort, not the canonical Chapter I Genesis Signal (#1–#333).
- `docs/MVP_ECOSYSTEM_ROADMAP.md` — uses pre-doctrine cohort permalinks.

---

## Superseded doctrines (never re-introduce in CANONICAL or OPERATIONAL docs)

| Banned / obsolete                                                                                       | Replaced by                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Genesis 10", "first 10", "First 100", "First 500", "First 1000", "Genesis #1–#10"                      | The five canonical chapters (Chapter I Genesis Signal #1–#333 · II First Thousand #334–#1,000 · III The Expansion #1,001–#3,333 · IV First Ten Thousand #3,334–#10,000 · V Open Era).  |
| "Chapter I — The Beginning"                                                                             | "Chapter I — Genesis Signal".                                                                                                                                                          |
| Archive as primary public navigation                                                                    | NFT is the public route. Archive is deep-lore vocabulary only.                                                                                                                         |
| "Relic" as primary public NFT language                                                                  | "NFT" / "Collection" / "Artifact" (Artifact is secondary, Relic is deep lore only — never live UI).                                                                                    |
| Patron Seal at 9 USDC                                                                                   | Patron Seal at **5.00 USDC** (catalog + on-chain agree).                                                                                                                               |
| Seat Record inside Archive1155 as an active mint                                                        | SeatRecord721 — separate, future contract. Archive1155 ID 2 stays reserved/disabled.                                                                                                   |
| Any language implying NFT equity, yield, dividends, revenue share, Vault ownership, LP ownership, or governance rights | NFTs are collectible protocol memories with **no financial rights**.                                                                                                         |
| Rank as a USDC entry-size **public status** tier ("status tier unlocked by USDC entry size") | Rank is **structural, on-chain-derived recognition** — mutable, secondary, conferring nothing. USDC may be a private input, never the public meaning. See `docs/RANK_CONSTITUTIONAL_RULING.md`. |
| `scoreMultiplier`-based rank · "Compounder Score" multiplier tied to rank | Rank confers **nothing** — no multiplier, discount, yield, or governance weight. Recognition is standing, never reward. |
| "Founder" as a **rank name** (e.g. a $100 tier) | "Founder" is a frozen **cohort identity fact** (founders-cohort flag), never a purchase tier. Rank names must not reuse identity vocabulary. |
| "Genesis Circle" as a **rank name** (e.g. a $10,000 tier) | "Genesis" belongs to **Chapter I — Genesis Signal**. Rank names must not reuse chapter vocabulary. |
| Rank as **primary identity** | Identity = the permanent seat + five constitutive facts. Rank is the mutable layer; it is **not** one of them. |
| Rank as a **leaderboard** / positional ladder of people | Rank is relative standing, never a scarce finite ladder of people. Cohort > rank, always. |

> **Note (2026-06-09):** the six rank rows above are registered here as binding
> doctrine. Wiring them into the automated `doctrine-guard.test.ts` `DOC_BANNED`
> scan (and adding the newly-constitutional docs to its `CANONICAL_DOCS` list)
> is a **code** follow-up, intentionally out of scope of this docs-only pass.
>
> **Update (2026-06-12, Batch 8):** the *doc-list* half is now done — the
> constitutional docs (`NORTH_STAR_SYSTEM`, `INFORMATION_HIERARCHY`,
> `PROTOCOL_EXECUTION_CONTROL_SYSTEM`) and the `docs/canon/` set are wired into
> the guard's `CANONICAL_DOCS` scan (vocabulary-defining canon docs 01/03/04 are
> an explicit exemption — see Enforcement). The *rank-row regex* half remains
> deferred: phrases like "Founder" / "Genesis Circle" as a rank collide with
> legitimate cohort/chapter usage and would false-positive across clean docs, so
> they are not yet mechanized — a known, low-priority hardening item.

---

## Current canonical doctrines

### Vocabulary

- **Public:** NFT · Collection · Chapter · Member
- **Secondary:** Protocol Memory · Artifact
- **Deep lore (docs and long-form only):** Archive · Chronicle · Signal · Seal

### Chapter doctrine

- Chapter I — **Genesis Signal** — Member #1 – #333
- Chapter II — **First Thousand** — Member #334 – #1,000
- Chapter III — **The Expansion** — Member #1,001 – #3,333
- Chapter IV — **First Ten Thousand** — Member #3,334 – #10,000
- Chapter V — **Open Era** — Member #10,001 +

Source of truth in code: `src/lib/chapters.ts`.

### NFT doctrine

- NFTs are collectible protocol memories.
- Not every milestone becomes an NFT.
- IDs 4–8 keep their on-chain names.
- ID 9 is **Protocol Chronicle**, not configured on-chain yet.
- No NFT implies financial rights.

### Seat doctrine

- SYN is the seat.
- Artifacts are the memory.
- **SeatRecord721** is a future, separate identity contract.
- **Archive1155 ID 2** remains reserved/disabled.

### Rank doctrine

- Rank is **structural, on-chain-derived recognition** — mutable, secondary, conferring nothing.
- Rank is **not** identity, **not** wealth-coded, **not** a reward/multiplier, **not** a leaderboard.
- Rank is permanently subordinate to the **seat** (identity) and **cohort/chapter** (belonging): cohort > rank, always.
- Home: `/ranks` and public member pages (a secondary line, below member # / chapter / founders flag). Never the hero. Never the member's own private cockpit.
- Canonical ruling: `docs/RANK_CONSTITUTIONAL_RULING.md` (supersedes all prior rank meanings).

---

## Enforcement

A docs guard test (`src/lib/__tests__/doctrine-guard.test.ts`) scans every
CANONICAL doc for the banned vocabulary above and fails the suite if any
appears. As of 2026-06-12 (Batch 8) the guard's `CANONICAL_DOCS` set is coupled
to this CANONICAL classification: the constitutional docs and the `docs/canon/`
set are scanned, not just a hand-picked subset.

**Vocabulary-defining exemption.** Docs that *define* the banned vocabulary
cannot be scanned for it without self-failing. This file's "Superseded
doctrines" table, and the canon vocabulary docs
(`docs/canon/01_FOUNDER_INTENT_MAP.md`, `docs/canon/03_GLOSSARY.md`,
`docs/canon/04_DOC_SYNC_CHECKLIST.md`), are therefore CANONICAL authority but
EXEMPT from the banned-vocab scan. The guard still asserts they remain
CANONICAL-listed here, so the exemption can never become a silent omission.

Historical and Deprecated docs may contain the old terms **only** when their
first non-empty line begins with `Historical note:`.
