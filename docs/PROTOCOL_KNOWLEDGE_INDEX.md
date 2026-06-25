# Protocol Knowledge Index

Status: OPERATIONAL FRONT DOOR / WHOLE-PROTOCOL NAVIGATION / NO ACTIVATION AUTHORITY

Last updated: 2026-06-25

GitHub anchor at consolidation start: `8b82a2e62d975aa668c39c957855a1c0cbe33fe2`

This is the first file to read when a future contributor, AI agent, operator,
or reviewer needs to understand The Syndicate from inside the repository.

It does not replace canonical files. It routes readers to them.

It does not authorize deployment, transactions, source activation, referral
activation, claim UI, registry switch, source-aware public buys, or production
publish.

## 1. Current Whole-Protocol Authority

| Area | Current truth | Authority |
| --- | --- | --- |
| GitHub implementation truth | Current GitHub main is the canonical implementation source. The anchor entering this index was `8b82a2e62d975aa668c39c957855a1c0cbe33fe2`; later docs-only commits should be read from `git log -1`. | Git history, `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md` |
| Production truth | Production was last published and QA green from `e19927b` for the PAUSED source readback. This index is docs/guard truth and does not itself require publish unless release provenance is desired. | `docs/PROTOCOL_CHECKPOINT_2026_06_25.md`, Replit QA reports |
| Replit truth | Replit is the production deployment surface. GitHub success, Replit success, and production success are separate states. | `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md`, `docs/OPERATIONAL_MEMORY_LEDGER.md` |
| Current buy target | MembershipSaleV3 is the current repository buy target. | `src/lib/syndicate-config.ts`, `src/lib/sale-hooks.ts`, `src/components/syndicate/LivePurchase.tsx` |
| Default public sourceId | Public/default V3 buys pass `ZERO_SOURCE_ID`. No public source selector or public source-aware buy path is live. | `src/lib/source-policy-observability.ts`, `src/lib/sale-hooks.ts`, `src/components/syndicate/LivePurchase.tsx` |
| SourceRegistryV1 | Deployed, owner accepted, and has one internal PAUSED source record. | `src/lib/source-policy-observability.ts`, `src/lib/source-registry-lifecycle.ts`, `docs/PROTOCOL_CHECKPOINT_2026_06_25.md` |
| PAUSED internal source record | `INTERNAL_PROTOCOL_TEST_SOURCE_001` exists as policy state only. It is not public referral activation and cannot route commission while PAUSED. | `docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_DRAFT.md`, `src/lib/source-policy-observability.ts` |
| Referral/source UI | Inactive. `/referral` may explain PAUSED policy truth, but no referral link, source dashboard, claim action, or public source-aware buy path is live. | `src/routes/referral.tsx`, `docs/REFERRAL_SOURCE_ATTRIBUTION_V1_READINESS.md` |
| Claim UI | Absent. Contract escrow mechanics exist, but no claim route/control/balance UI is live. | `docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md`, production coherence tests |
| Archive1155 | Live protocol memory layer. Not a seat, not financial rights, and not source-aware today. | `src/lib/archive-id-registry.ts`, `docs/ARCHIVE1155_CANONICAL_ARCHITECTURE.md` |
| SeatRecord721 | Future identity layer only. No contract, mint path, or live identity claim exists. | `docs/PROTOCOL_ORGANISM_GRAPH.md`, `docs/MODULE_INTEGRATION_STANDARD.md` |
| SwapRail | Future utility/commercial layer only. Not implemented and cannot inherit MembershipSaleV3 source terms. | `docs/MODULE_INTEGRATION_STANDARD.md`, `src/lib/protocol-evolution.ts` |
| Protocol Evolution | Live read-only evolution/status/episode layer. It has no governance, activation, transaction, source-record, or registry authority. | `src/lib/protocol-evolution.ts`, `src/routes/evolution.tsx` |
| Transaction / contract-change truth | No transaction, source activation, referral activation, claim UI, registry switch, or contract change is authorized by this index. | This file; relevant runbooks only after founder approval |

## 2. Protocol Domain Map

| Domain | Current status | Canonical files | Runtime / operational files | Tests / guards | Pending | Danger if confused |
| --- | --- | --- | --- | --- | --- | --- |
| V3 MembershipSaleV3 / Join | LIVE direct buy target. Public buys use `ZERO_SOURCE_ID`. | `docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md`, `docs/V3_DEPLOYMENT_PARAMETER_SHEET.md`, `contracts/src/MembershipSaleV3.sol` | `src/lib/syndicate-config.ts`, `src/lib/sale-hooks.ts`, `src/components/syndicate/LivePurchase.tsx`, `src/routes/join.tsx` | `contracts/test/MembershipSaleV3.t.sol`, `src/lib/__tests__/production-coherence.test.ts` | Continue readback discipline and direct-buy QA. | Accidentally routing public buys through a non-zero sourceId. |
| SourceRegistryV1 | DEPLOYED with one internal PAUSED source record. | `contracts/src/SourceRegistryV1.sol`, `docs/SOURCE_CREATION_CEREMONY_RUNBOOK.md`, `docs/SOURCE_ACTIVATION_READINESS_PACKET.md`, `docs/SOURCE_AWARE_LOCAL_TEST_PATH.md` | `src/lib/source-policy-observability.ts`, `src/lib/source-registry-lifecycle.ts`, `src/lib/source-activation-readiness.ts`, `src/lib/source-aware-test-mode.ts`, `src/routes/referral.tsx`, `src/routes/registry.tsx` | `contracts/test/SourceRegistryV1.t.sol`, source lifecycle tests, activation-readiness tests, source-aware test-mode tests, production coherence guards | Current-authority preflight before any future status transaction. | Treating source record existence as referral activation. |
| Referral / Source Attribution | INACTIVE public product; future capability under staged guardrails. | `docs/REFERRAL_SOURCE_ATTRIBUTION_V1_READINESS.md`, `docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md`, source packet docs | `src/routes/referral.tsx`, `src/lib/source-attributed-receipts.ts`, `src/lib/future-referral.ts` | source receipt tests, source lifecycle tests, production coherence guards | Localhost-only source-aware test path, then separate ACTIVE ceremony if approved. | Claim UI, public links, source dashboard, or MLM-style language before approval. |
| Activity | LIVE heartbeat/read-model surface. | `docs/PROTOCOL_ORGANISM_GRAPH.md`, `docs/MODULE_INTEGRATION_STANDARD.md` | `src/routes/activity.tsx`, `src/lib/protocol-events.ts`, `src/lib/protocol-event-registry.ts`, purchase caches | event/cache tests, production coherence guards | Future source lifecycle and source-attributed purchase display after readback. | Letting routine events become fake Chronicle/history claims. |
| Register / Registry | LIVE proof and contract/source-policy surface. | `docs/PROTOCOL_ORGANISM_GRAPH.md`, `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md` | `src/routes/registry.tsx`, `src/lib/contract-registry.ts`, `src/lib/institutional-register.ts` | production coherence guards | Keep source and V3 readbacks aligned after any ceremony. | Showing old V2/V1 sale truth as active current sale. |
| Chronicle | PARTIAL curated memory. | `docs/PROTOCOL_ORGANISM_GRAPH.md`, Chronicle docs | `src/routes/chronicle.tsx`, `src/lib/chronicle-entries.ts` | content and production guards | Admit only material milestones. | Turning every task, receipt, or routine source change into history. |
| My Syndicate | LIVE member home/place layer. | `docs/MODULE_INTEGRATION_STANDARD.md`, product translation docs | `src/routes/my-syndicate.tsx`, member/read-model hooks | member/read-model tests, production coherence guards | Future source receipt and return-loop context after real source events. | Showing claim balances, source ownership, or inactive modules as live. |
| Transparency / Protocol Economy | LIVE proof/economic observability layer. | `docs/PROTOCOL_ECONOMY_DESIGN.md`, `docs/V3_DEPLOYMENT_READINESS_PACKAGE.md` | `src/routes/transparency.tsx`, protocol economy libs | production coherence guards, live-state truth scripts | Better founder/protocol capital explanation over time. | Implying yield, ROI, guarantees, or participant claim on treasury. |
| Archive1155 / NFT memory | LIVE memory artifact layer; not source-aware. | `docs/ARCHIVE1155_CANONICAL_ARCHITECTURE.md`, `docs/NFT_ARCHIVE_SMART_CONTRACT_ARCHITECTURE_V1.md` | `src/lib/archive-id-registry.ts`, `src/routes/archive.tsx`, `src/routes/nft.tsx` | archive ABI/readback/production guards | Keep current mints read-gated and proof-backed. | Claiming NFTs are seats, source-aware, or financial rights. |
| SeatRecord721 | FUTURE identity layer. | `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`, `docs/MODULE_INTEGRATION_STANDARD.md` | Reserved archive/status copy only | production coherence guards | Separate identity design/audit if ever revived. | Starting Privy/SeatRecord identity as if approved. |
| SwapRail / ProductSaleRouter / commerce | FUTURE modules. | `docs/MODULE_INTEGRATION_STANDARD.md`, `docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md` | Visibility/evolution copy only | fake-live and production coherence guards | Future module review only after need is real. | Product-wide attribution claims without a source-aware sale path. |
| Protocol Evolution | LIVE read-only evolution/status/episode layer. | `docs/PROTOCOL_EVOLUTION_LAYER_ARCHITECTURE.md` | `src/lib/protocol-evolution.ts`, `src/lib/protocol-visibility.ts`, `src/routes/evolution.tsx` | evolution/visibility/production guards | Keep proof board and episode layer current after meaningful events. | Roadmap theatre, governance implication, or fake activation. |
| Production / Replit workflow | OPERATIONAL discipline. | `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md`, `docs/RELEASE_HANDOFF.md` | Replit workspace, production QA scripts, GitHub main | `npm run check-release`, route/status scripts | Sync only when runtime/product truth should reach production. | Treating GitHub green as production green. |
| Operational memory | OPERATIONAL memory ledger. | `docs/OPERATIONAL_MEMORY_LEDGER.md` | Release handoff and authority-map links | production coherence guard | Add incidents when repeated environment mistakes occur. | Repeating local-only, patch-handoff, or Replit divergence mistakes. |
| Smart-contract lessons | SECURITY memory ledger. | `docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md` | Foundry tests, contract docs | Foundry tests, production coherence guard | Keep lessons updated after every contract/security issue. | Relearning previously closed contract risks. |
| Documentation authority / canon | AUTHORITY router. | `docs/DOCUMENTATION_AUTHORITY_MAP.md`, `docs/CANONICAL_REGISTRY.md`, `docs/canon/*` | This index, checkpoint docs, docs tree | production coherence guard | Keep operational/historical/superseded lines clear. | Old docs overriding current authority. |

## 3. Reading Paths By Task

Before smart-contract work:

1. `docs/PROTOCOL_KNOWLEDGE_INDEX.md`
2. `docs/DOCUMENTATION_AUTHORITY_MAP.md`
3. `docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md`
4. `contracts/README.md`
5. Relevant contracts and Foundry tests

Before V3 membership buy-flow work:

1. `src/lib/syndicate-config.ts`
2. `src/lib/sale-hooks.ts`
3. `src/components/syndicate/LivePurchase.tsx`
4. `docs/PROTOCOL_CHECKPOINT_2026_06_25.md`
5. Production coherence guards

Before referral or source attribution work:

1. `docs/PROTOCOL_CHECKPOINT_2026_06_25.md`
2. `docs/REFERRAL_SOURCE_ATTRIBUTION_V1_READINESS.md`
3. `docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md`
4. `docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_DRAFT.md`
5. `src/lib/source-policy-observability.ts`
6. `src/lib/source-registry-lifecycle.ts`
7. `src/lib/source-attributed-receipts.ts`
8. `src/lib/source-activation-readiness.ts`
9. `docs/SOURCE_ACTIVATION_READINESS_PACKET.md`
10. `src/lib/source-aware-test-mode.ts`
11. `docs/SOURCE_AWARE_LOCAL_TEST_PATH.md`

Before any source ceremony or source status transaction:

1. `docs/SOURCE_CREATION_CEREMONY_RUNBOOK.md`
2. `docs/SOURCE_ACTIVATION_READINESS_PACKET.md`
3. `docs/PROTOCOL_CHECKPOINT_2026_06_25.md`
4. Current owner/readback checks on Avalanche
5. Current source status and terms
6. Founder approval for the exact transaction

Before Replit, production, or publish work:

1. Production Synchronization Doctrine: `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md`
2. `docs/OPERATIONAL_MEMORY_LEDGER.md`
3. `docs/RELEASE_HANDOFF.md`
4. GitHub main status
5. Replit current commit/status
6. Route-specific production QA plan

Before Archive/NFT work:

1. `docs/ARCHIVE1155_CANONICAL_ARCHITECTURE.md`
2. `src/lib/archive-id-registry.ts`
3. `docs/MODULE_INTEGRATION_STANDARD.md`
4. `docs/PROTOCOL_ORGANISM_GRAPH.md`

Before future SeatRecord721, SwapRail, ProductSaleRouter, or commerce work:

1. `docs/MODULE_INTEGRATION_STANDARD.md`
2. `docs/PROTOCOL_ORGANISM_GRAPH.md`
3. `docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md`
4. `docs/DEFERRED_WORK_LEDGER.md`

Before copy, SEO, or public-truth changes:

1. `docs/DOCUMENTATION_AUTHORITY_MAP.md`
2. `docs/PROTOCOL_CHECKPOINT_2026_06_25.md`
3. Current route code
4. Production coherence guards
5. No-fake-live vocabulary rules

## 4. File Authority Rationalization

Use this file as the whole-protocol entry point, not as the final source of
truth for every detail.

| Class | Use | Examples |
| --- | --- | --- |
| Canonical | Defines doctrine, architecture, status vocabulary, and design boundaries. | `docs/DOCUMENTATION_AUTHORITY_MAP.md`, `docs/CANONICAL_REGISTRY.md`, `docs/PROTOCOL_ORGANISM_GRAPH.md`, `docs/MODULE_INTEGRATION_STANDARD.md` |
| Operational | Defines current state, runbooks, release workflow, and active readback memory. | `docs/PROTOCOL_CHECKPOINT_2026_06_25.md`, `docs/OPERATIONAL_MEMORY_LEDGER.md`, `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md`, source ceremony docs |
| Runtime | Code that the site or tests execute. | `src/lib/syndicate-config.ts`, `src/lib/source-policy-observability.ts`, routes, hooks, caches |
| Contract | Solidity and Foundry truth for deployed or candidate contracts. | `contracts/src/*`, `contracts/test/*`, `contracts/README.md` |
| Historical | Useful background, but cannot override current readbacks or authority files. | older audits, strategic reports, previous roadmaps |
| Superseded | Retained for memory but dangerous if treated as current truth. | zero-source-record era docs, old V2 buy-target assumptions, old fixed-rate copy |

`docs/DOCUMENTATION_AUTHORITY_MAP.md` remains the classifier. This index is the
reader's front door.

## 5. Superseded / Dangerous Old Truths

Do not revive these without explicit current evidence:

- "There are zero source records."
- "A source record means referral is live."
- "A PAUSED source can route commission."
- "The public buy path can pass a non-zero sourceId by default."
- "Claim UI exists because the contract has escrow mechanics."
- "Archive1155, SeatRecord721, SwapRail, or ProductSaleRouter are source-aware today."
- "V2b is the active public buy target."
- "V1/V2 fixed-rate language is current buy-flow truth."
- "Protocol Evolution creates governance, activation, or roadmap promises."
- "GitHub green means production green."
- "Replit local `vite.config.ts` watch-ignore divergence is canonical GitHub product truth."
- "Loose grep findings such as text saying 'no claim UI' prove a claim control exists."
- "`check-commission-router-freeze` BLOCKED output is a release failure before activation."

## 6. Current Execution Roadmap

Referral remains the current priority area, but it sits inside the whole
protocol. The next work must preserve the organism, not narrow the repo into
referral-only thinking.

| Order | Sprint | Purpose | Depends on | Must not do |
| --- | --- | --- | --- | --- |
| 1 | Source Activation Readiness Packet | Completed as a non-transactional readiness model and packet. | Fresh readbacks are still required before any future status action. | Do not activate. |
| 2 | Localhost-Only Source-Aware Test Path | Completed as a gated `/labs/source-attribution-test` boundary and read model. | Source remains PAUSED; ACTIVE ceremony still requires fresh approval. | Do not expose source links or source selector in production. |
| 3 | Controlled ACTIVE Ceremony And $5 Test | If founder approves, activate the source for a tiny internal test and read back the receipt. | Founder transaction approval, current readbacks, local path ready, source ACTIVE. | Do not bundle public referral or claim UI. |
| 4 | Post-Test Truth Update | Record source receipt, payout/escrow, Activity, My Syndicate, Registry, and cache truth. | Real tx/readback. | Do not imply public referral is live. |
| 5 | Public Source/Referral Product Decision | Decide whether to build public referrer UX, source links, aliases, and dashboards. | Legal/product signoff, test evidence, anti-abuse design. | Do not use the internal test source as public UX template. |
| 6 | Whole-Protocol Continuous Excellence | Keep surfaces, docs, tests, status labels, and proof paths clean while referral matures. | Current GitHub truth. | Do not start unrelated future modules as fake-live placeholders. |

## 7. Guard / Test Hooks

The following guards must keep the index aligned with runtime truth:

- `src/lib/__tests__/production-coherence.test.ts` - broad no-fake-live and authority guard.
- `src/lib/__tests__/source-policy-observability.test.ts` - source snapshot, gates, and ZERO_SOURCE_ID behavior.
- `src/lib/__tests__/source-registry-lifecycle.test.ts` - SourceCreated/status lifecycle projection.
- `src/lib/__tests__/source-activation-readiness.test.ts` - PAUSED to ACTIVE readiness gates.
- `src/lib/__tests__/source-aware-test-mode.test.ts` - localhost-only source-aware test gate.
- `src/lib/__tests__/source-attributed-receipts.test.ts` - future source-attributed receipt projection.
- `src/lib/__tests__/purchase-events-cache.test.ts` - purchase source preservation across cache restore.
- `src/lib/__tests__/chain-registry-guard.test.ts` - canonical chain/RPC guardrails.
- Archive/visibility/evolution tests - future modules cannot become fake-live by copy drift.
- `npm run check-release` - release gate for typecheck, tests, build, and production coherence.

Text checks must distinguish copy that says "no claim UI" or "no source link"
from actionable controls such as buttons, links, forms, wallet actions, source
selectors, or buy paths.

## Final Rule

Current authority beats remembered authority.

If chat memory, old docs, production memory, or local workspace state conflicts
with this index, start from the authority files named here, then re-read current
runtime code and chain/readback truth before acting.
