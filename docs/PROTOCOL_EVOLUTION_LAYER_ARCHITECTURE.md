# Protocol Evolution Layer Architecture

Status: CANONICAL ARCHITECTURE / NO ACTIVATION AUTHORITY

This document defines how The Syndicate should expose disciplined protocol
evolution to visitors, members, builders, partners, and reviewers.

It does not authorize a source record, source activation, referral launch,
claim UI, public source link, contract deployment, contract change, funding
movement, V2b recovery, registry switch, production publish, SwapRail,
SeatRecord721, ProductSaleRouter, Archive1155 V2, or any public activation.

## 1. Purpose

The Syndicate should not behave like a normal protocol that raises money,
disappears, and says "we are working."

The institution should make its evolution visible:

- what is live,
- what is paused,
- what is inactive,
- what is being researched,
- what is being designed,
- what is being built,
- what is being tested,
- what is waiting for readback,
- what is blocked,
- what was changed because of member or builder signal,
- what was rejected and why,
- what became part of protocol memory.

This must not become hype. It is not a marketing roadmap with optimistic dates.
It is an evidence-backed institutional development layer.

The goal is trust, curiosity, return visits, and adaptive intelligence. People
should be able to follow the protocol becoming safer, smarter, and more useful
without confusing planned work for live functionality.

## 2. Repository Truth Reconstructed

The codebase already contains many primitives that can support a Protocol
Evolution layer.

| Existing capability | Current use | Relevance to Protocol Evolution |
| --- | --- | --- |
| `docs/MODULE_INTEGRATION_STANDARD.md` | Classifies future modules before code. | Intake gate for any module shown on the evolution layer. |
| `docs/PROTOCOL_ORGANISM_GRAPH.md` | Maps contracts, routes, read models, memory layers, and non-edges. | Relationship source for module dependency cards. |
| `docs/STRATEGIC_NARRATIVE_AND_EXECUTION_ORDER.md` | Current narrative spine and execution order. | Helps distinguish next work from tempting-but-premature work. |
| `docs/DOCUMENTATION_AUTHORITY_MAP.md` | Classifies canon, operational docs, historical docs, and precedence. | Prevents stale audits from driving evolution status. |
| `docs/OPERATIONAL_MEMORY_LEDGER.md` | Records operational/process lessons. | Supplies operations-related evolution episodes. |
| `docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md` | Records contract lessons and regression guards. | Supplies security and contract-quality evolution episodes. |
| `docs/DEFERRED_WORK_LEDGER.md` | Records intentionally parked work. | Source for DEFERRED and FUTURE module states. |
| `docs/SOURCE_CREATION_CEREMONY_RUNBOOK.md` | PAUSED source ceremony boundary. | Source for source-attribution ceremony state. |
| `src/lib/source-policy-observability.ts` | Current source-policy truth: zero records, referral inactive, claims inactive. | Runtime-style model for source module status. |
| `src/lib/contract-registry.ts` | Contract status, addresses, lifecycle posture. | Contract evidence source for module cards. |
| `src/lib/archive-id-registry.ts` | Archive1155 ID truth and reserved states. | Memory-layer module evidence. |
| `src/lib/protocol-event-registry.ts` | Event vocabulary and protocol event truth. | Activity/Chronicle event evidence. |
| `src/lib/institutional-register-registry.ts` | Register entries. | Durable evidence links for evolution episodes. |
| `src/lib/protocol-transparency-timeline.ts` | Transparency timeline facts. | Public proof timeline source. |
| `src/lib/protocol-horizon.ts` | Truthful anticipation states. | Candidate source for future-facing but non-live states. |
| `/roadmap` | Five-bucket public roadmap: Live, Next, Pending, Future, Never. | Useful but too simple for full evolution memory. |
| `/activity` | Live heartbeat. | Shows raw recent movement, not full design/build/reject decisions. |
| `/chronicle` | Curated institutional story. | Receives material turning points, not every work item. |
| `/registry` | Contract and address truth. | Evidence layer, not project-management layer. |
| `/transparency` | Verification center and Protocol Economy. | Proof and economic state layer. |
| `/my-syndicate` | Member home and return loop. | Future place for "what changed since last visit." |
| `/referral` | Pending source-attribution truth. | Example of inactive-module copy discipline. |
| `StatusPill`, `Pill`, `Panel`, `Section` | Shared UI primitives. | Suitable visual primitives for future status boards. |

Weak patterns to avoid:

- A static roadmap can become stale if it is not backed by evidence links.
- A long docs-only ledger is not a member return loop by itself.
- A deployed contract must not be rendered as an active product.
- A source record must not be rendered as referral activation.
- A labs component must not be promoted unless its truth source and status are
  revalidated.

Conclusion: do not invent the whole system from scratch. The first implementation
should connect existing registries, docs, and route primitives into one clear
evolution surface.

## 3. Naming Recommendation

Recommended public name: **Protocol Evolution**.

Why:

- It is broad enough for contracts, product, operations, source attribution,
  Archive, identity, SwapRail, reporting, and future modules.
- It does not collide with Chronicle, which is already reserved for narrated
  institutional history.
- It does not sound like a startup roadmap, campaign board, or internal task
  tracker.
- It matches the founder doctrine: The Syndicate is an evolutive protocol
  organism.

Recommended supporting vocabulary:

| Name | Use |
| --- | --- |
| Protocol Evolution | Public layer and route concept. |
| Evolution Register | Evidence-backed status record inside the layer. |
| Module Episode | One module's idea -> research -> design -> build -> test -> readback -> active/deferred/deprecated path. |
| Member Signal | Non-binding member feedback or observed friction. |
| Builder Feedback | Non-binding builder/operator input. |
| Founder Decision | Explicit operator decision; not governance. |
| Evidence Link | Commit, tx, readback, doc, test, route, or production QA proof. |

Rejected names:

| Name | Reason |
| --- | --- |
| Protocol Chronicle | Collides with Chronicle, which is narrated memory. |
| Build Ledger | Too internal and narrow. |
| Protocol Roadmap | Too common and marketing-shaped. `/roadmap` already exists. |
| Living Protocol | Strong phrase, but softer than the evidence layer needs. |
| Protocol Workbench | Sounds internal/operator-only. |
| The Syndicate Stateboard | Useful internal metaphor, but too dashboard-like for public doctrine. |
| Protocol Pulse | Collides with heartbeat/activity language. |
| Organism State | Accurate but too abstract for visitors. |

## 4. Concept

Protocol Evolution is the public and member-facing layer that shows how the
institution changes over time without overstating unfinished work.

Each module should be able to tell a truthful episode:

```text
idea
-> research
-> design
-> build
-> test
-> readback
-> paused
-> active
-> improved
-> deprecated or archived
```

Not every episode reaches every state. A rejected idea is valuable if the
rejection is evidence-backed and improves protocol discipline.

This layer answers four questions:

1. What exists now?
2. What is being worked on?
3. What is blocked or intentionally deferred?
4. What evidence proves the current state?

## 5. Status Model

Protocol Evolution must use explicit lifecycle states. These states are not
marketing labels.

| Status | Meaning | Public rule |
| --- | --- | --- |
| LIVE | Product or contract path is public-actionable and verified. | Requires route/contract/readback evidence. |
| PAUSED | On-chain or product state exists but is intentionally not active. | Must explain what is paused and what remains unavailable. |
| INACTIVE | Infrastructure or route exists, but user action is not available. | Must not show action CTA. |
| RESEARCH | Learning, audits, or strategic study. | Must not imply commitment to ship. |
| DESIGN | Spec or architecture is being shaped. | Must separate proposal from decision. |
| BUILDING | Implementation is underway but not ready. | Must not imply availability. |
| TESTING | Local, fork, QA, or staging proof is happening. | Must name environment and not imply production. |
| READBACK | Waiting for or reviewing chain/production/current-authority proof. | Must not claim final state until readback passes. |
| BLOCKED | Work cannot proceed until a decision, input, review, or dependency clears. | Must name the blocker plainly. |
| DEFERRED | Intentionally parked with a reason and revisit condition. | Must not be framed as imminent. |
| FUTURE | Directionally possible, not designed or built. | Must not carry action CTA. |
| DEPRECATED | Superseded by a later decision or implementation. | Must preserve why it was replaced. |

Important distinction:

- Contract status is not product status.
- GitHub status is not Replit status.
- Replit status is not production status.
- Production uptime is not product truth.
- Source policy existence is not referral activation.
- Testing is not availability.
- Community signal is not approval.

## 6. Module Taxonomy For Evolution

Initial modules that the layer should track:

| Module | Current broad status | Evolution notes |
| --- | --- | --- |
| Membership Engine | LIVE | V3 direct buy is the current frontend target; source-neutral by default. |
| Source / Referral Attribution | INACTIVE / PAUSED-ready | SourceRegistryV1 exists; zero source records; first internal PAUSED source packet is prepared but not executed. |
| Protocol Economy | LIVE / PARTIAL | Read-only observatory exists; future reporting/export remains deferred. |
| Activity | LIVE | Heartbeat layer; future source policy events can be classified after readback. |
| Register | LIVE | Durable truth surface; should receive evidence-backed evolution milestones. |
| My Syndicate | LIVE | Member home; future evolution return briefing belongs here. |
| Chronicle | PARTIAL | Curated memory for material turning points, not routine task tracking. |
| Archive1155 | LIVE | Protocol memory; not source-aware; future IDs remain gated. |
| SeatRecord721 | FUTURE | Future identity record; not live and not the seat. |
| SwapRail | FUTURE | Requires module intake before provider or contract work. |
| Product Attribution | FUTURE | Requires product payment path and receipt schema. |
| Reporting / Tax Export | DEFERRED | Useful after source-attributed receipts exist; not tax advice. |
| Notifications | FUTURE | Should follow real events, not fake progress pings. |

Every module card must include:

- current status,
- what exists now,
- what is not live,
- latest milestone,
- next milestone,
- blocker or dependency,
- evidence links,
- safety boundary,
- community signal state if any,
- founder decision state if any.

## 7. Evidence Model

Every evolution claim needs at least one evidence type.

| Evidence type | Examples | Can support LIVE? |
| --- | --- | --- |
| On-chain transaction | Deployment tx, SourceCreated tx, purchase tx, mint tx. | Yes, if readback matches. |
| On-chain readback | owner(), sourceConfig(), paused(), sourceExists(), contract bytecode. | Yes, if current. |
| Code commit | GitHub commit hash. | Supports repository truth, not production by itself. |
| Test result | Foundry, fork rehearsal, focused frontend tests, check-release. | Supports readiness, not live production by itself. |
| Route proof | Public route exists and renders the correct state. | Supports route status, not chain truth by itself. |
| Production QA | Replit publish + live route checks. | Supports production state. |
| Canonical doc | Constitution, module standard, authority map, runbook. | Supports doctrine and policy. |
| Operational doc | Readback log, packet, handoff, runbook. | Supports process state. |
| Rejection note | Founder/operator decision, audit finding, risk reason. | Supports DEFERRED, BLOCKED, DEPRECATED, or REJECTED outcomes. |

Evidence quality rules:

- A previous readback is lineage, not current authority.
- Current chain readback beats remembered authority.
- A GitHub commit does not prove Replit production is current.
- A route returning HTTP 200 does not prove doctrine correctness.
- A source packet does not prove source existence.
- A source record does not prove source activation.

## 8. Community Intelligence Loop

The Syndicate can learn from members, builders, and partners without pretending
to be a governance protocol.

Recommended loop:

```text
Member Signal / Builder Feedback / Partner Request
-> triage
-> founder/operator decision
-> accepted for research OR rejected with reason
-> design
-> implementation
-> tests/readback
-> public route/update
-> Chronicle/Register/Archive only if materially meaningful
```

Allowed language:

- member signal,
- builder feedback,
- partner request,
- under review,
- accepted for research,
- accepted for design,
- rejected with reason,
- blocked,
- shipped,
- paused,
- deprecated.

Forbidden language unless true:

- community controls the protocol,
- members voted this into effect,
- guaranteed delivery,
- approved by the community,
- referral is live,
- claims are available,
- source link active,
- contract deployed therefore product active.

V1 should not include public feedback submission. The first version should be
curated and evidence-backed. Feedback intake can be designed later once privacy,
moderation, abuse, signal quality, and founder-decision posture are clear.

## 9. UX / UI Architecture

Recommended eventual public surface: `/evolution`.

Recommended hierarchy:

1. Hero: "Protocol Evolution" with a plain sentence: what is live, what is
   paused, what is being designed, and what evidence proves it.
2. Status board: modules grouped by LIVE, PAUSED/INACTIVE, RESEARCH/DESIGN,
   BUILDING/TESTING/READBACK, BLOCKED/DEFERRED/FUTURE, DEPRECATED.
3. Module cards: concise cards with status, latest milestone, next milestone,
   blocker, evidence, safety boundary.
4. Module detail drawer/page: deeper episode timeline for each module.
5. "Changed since last visit": member-facing return loop, eventually in
   My Syndicate.
6. Signal chain: member signal -> founder decision -> implementation ->
   readback -> shipped/deferred/rejected.
7. Evidence rail: commit, tx, readback, doc, test, route, production QA.

Recommended integration with existing routes:

| Existing route | Relationship to Protocol Evolution |
| --- | --- |
| `/roadmap` | Can remain the simple high-level map; later can link into `/evolution`. |
| `/activity` | Raw heartbeat; supplies recent event evidence. |
| `/chronicle` | Curated story; receives material evolution episodes only. |
| `/registry` | Durable proof; supplies contract/source/readback evidence. |
| `/transparency` | Verification and economy proof; not a project board. |
| `/my-syndicate` | Member return layer; later "what changed since last visit." |
| `/referral` | Pending source module example; must not turn source record into activation. |
| `/archive` and `/nft` | Memory and artifact status; not source attribution. |

Visual direction:

- Use existing `StatusPill`, `Pill`, `Panel`, `Section`, and proof-link
  primitives.
- Keep the dark premium crypto cockpit tone.
- Avoid playful gamification, "quest" language, and fake urgency.
- Make values and status clear enough for non-technical visitors.
- Keep detail expandable so the page does not become a wall of internal work.

## 10. Anti-Drift Rules

These rules are binding for the Protocol Evolution layer:

1. Never show ACTIVE or LIVE unless the product state is actually live.
2. Never show source/referral live because SourceRegistryV1 exists.
3. Never show source/referral live because a PAUSED source record exists.
4. Never show contract deployment as product activation.
5. Never show planned work as guaranteed.
6. Never show member signal as founder approval.
7. Never show testing as production availability.
8. Never show local/localhost success as production success.
9. Never collapse GitHub, Replit, and production into one state.
10. Every claim needs evidence: commit, tx, readback, doc, test, route, or
    production QA.
11. Every blocked item needs a blocker, not vague "coming soon" copy.
12. Every rejected item should preserve the reason if it prevents future drift.
13. Do not create public source links from this layer.
14. Do not add claim UI from this layer.
15. Do not imply governance rights or public voting control.
16. Do not imply Archive/NFT source attribution.
17. Do not imply SwapRail, ProductSaleRouter, or SeatRecord721 are live.

## 11. V1 / V2 / V3 Roadmap

### V1 - Architecture and manually curated status board

Recommended first implementation sprint after this document:

- add `src/lib/protocol-evolution.ts` as a typed, manually curated registry;
- add focused tests for status/evidence invariants;
- create a read-only `/evolution` route or upgrade `/roadmap` only if route
  hierarchy is approved;
- seed it from current authoritative docs and registries;
- include no feedback form, no source links, no transactions, no activation CTA;
- keep production copy explicit: candidate, paused, inactive, future, deferred.

V1 success criteria:

- source/referral still inactive;
- no source-aware public buy path;
- no claim UI;
- no fake governance;
- every module card has a status and evidence link;
- `npm run check-release` passes.

### V2 - Module episode detail and member return loop

After V1 stabilizes:

- module detail drawers/pages;
- episode timeline per module;
- "what changed since last visit" in My Syndicate;
- accepted/rejected/blocked decision records;
- source policy readback episode after any PAUSED source ceremony.

### V3 - Community signal intake

Only after moderation, privacy, and founder-decision posture are designed:

- member signal submission;
- builder feedback submission;
- partner request intake;
- visible triage states;
- accepted/rejected/deferred history;
- no voting or governance implication unless future governance actually exists.

## 12. Recommended First Sprint

Do not build the full UI yet.

The best next sprint is:

```text
Protocol Evolution V1 Registry + Read-Only Route
```

Scope:

- typed `protocol-evolution.ts` registry;
- module status records for the current core modules;
- evidence model and status invariants in tests;
- read-only `/evolution` route using existing primitives;
- link from `/roadmap` only after route QA;
- no feedback form;
- no activation action;
- no source-aware public path;
- no claim UI.

Why this comes before feedback intake:

- The institution must first show its own state cleanly.
- Feedback without a disciplined state model becomes noise.
- A curated evidence-backed surface protects trust better than a premature
  community-input tool.

## 13. Relationship To The PAUSED Source Ceremony

This architecture does not block the PAUSED source ceremony.

If the PAUSED source ceremony happens first, the post-readback update should
record:

- source record exists,
- status is PAUSED,
- sourceConfig matches packet,
- isActive(sourceId) is false,
- no referral activation,
- no source-aware public buy path,
- no claim UI,
- public/default buys remain `ZERO_SOURCE_ID`.

If Protocol Evolution V1 exists by then, it should show the source-attribution
module as PAUSED/READBACK, not LIVE.

## 14. What Not To Build Yet

Do not build yet:

- public feedback submission,
- public voting,
- source/referral activation,
- public source links,
- claim UI,
- source dashboard,
- source-aware buy path,
- SwapRail implementation,
- SeatRecord721 implementation,
- ProductSaleRouter,
- Archive1155 V2,
- NFT sale wrapper,
- automated roadmap promises,
- anything that makes planned work look guaranteed.

## 15. Founder Recommendation

Protocol Evolution is the right concept, but it should ship in layers.

The institution should first prove it can show its own state with discipline.
Then it can invite member and builder signal into that state machine.

Recommended sequence:

1. Keep this architecture doc as canon.
2. Proceed with the separately approved PAUSED source ceremony only if current
   authority readbacks pass.
3. After PAUSED readback, update source observability and Register/Activity
   truth.
4. Build Protocol Evolution V1 as a read-only status/evidence surface.
5. Add community signal intake only after privacy, moderation, triage, and
   founder-decision language are designed.

The Syndicate should expose disciplined evolution, not perform confidence
theater.
