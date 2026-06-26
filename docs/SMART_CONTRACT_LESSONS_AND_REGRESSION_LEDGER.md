# Smart Contract Lessons and Regression Ledger

Last updated: 2026-06-26

Status: canonical first-read for future smart-contract work.

## 1. Purpose

This ledger records smart-contract mistakes, near-misses, resolved issues,
deployment lessons, and regression rules for The Syndicate.

Before any new smart contract work, Codex must read this ledger together with:

- `docs/SMART_CONTRACT_SYSTEM_MAP.md`
- `docs/DOCUMENTATION_AUTHORITY_MAP.md`
- `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md`
- `docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md`
- `docs/IDENTITY_ATTRIBUTION_CONSTITUTION.md`
- current deployed-contract readbacks
- current tests
- deployment scripts
- Holder Index and historical-member continuity files

The goal is simple:

- never repeat old bugs
- never invent values that repository or on-chain truth can prove
- never confuse historical contracts, live contracts, candidate contracts, and
  future contracts
- never begin contract implementation before the lineage, invariants, failure
  modes, tests, and deployment truth are understood

This file is an engineering memory, not a marketing document. It combines an
architecture decision record, bug and incident register, postmortem log,
invariant catalog, regression-test map, deployment runbook memory, and future
contract checklist.

## 2. Entry Template

Use this template for every new smart-contract lesson, incident, near-miss, or
regression:

```text
ID:
Title:
Date discovered:
Contract / system:
Severity:
Status:
Category:
Affected files:
Affected deployed contracts:
Symptom:
Root cause:
Why it mattered:
Fix:
Tests added:
Regression guard:
Deployment implication:
Frontend implication:
Docs updated:
Future "never again" rule:
Source links / commit hashes:
```

Severity guide:

- Critical: could lose funds, break membership identity, or activate the wrong
  contract.
- High: could block purchases, corrupt accounting/read models, or mislead users
  about live contract state.
- Medium: could create operational confusion, stale docs, or incomplete QA.
- Low: documentation or polish issue with limited production risk.

Status guide:

- Resolved: fixed and guarded.
- Partially resolved: fixed in one surface but still needs additional guards.
- Open: unresolved.
- Deferred: intentionally parked with known conditions.

## 3. Must-Record Lessons From V3 Work

### SCRL-001 - Lineage-first before architecture

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | V1, V2a, V2b, V3 sale lineage |
| Severity | High |
| Status | Resolved, but permanently guarded by process |
| Category | Lineage / architecture |
| Affected files | `contracts/src/*`, `contracts/test/*`, `docs/SMART_CONTRACT_SYSTEM_MAP.md`, `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md` |
| Affected deployed contracts | V1 sale, V2a sale, V2b sale, V3 SourceRegistryV1, V3 MembershipSaleV3 |
| Symptom | V3 work began before the full V1/V2a/V2b lineage had been reconstructed from deployed truth. |
| Root cause | Acting as a local implementer instead of a protocol historian. |
| Why it mattered | Sale lineage controls member numbers, historical proofs, active buy targets, recovery, and user trust. |
| Fix | Rebuilt the whole smart-contract system map, source-of-truth table, parameter sheets, and deployment/readback docs before V3 deployment. |
| Tests added | V3 historical root tests, V3 sale tests, production coherence guards. |
| Regression guard | This ledger and the mandatory pre-contract workflow below. |
| Deployment implication | No new contract deployment can proceed from memory or local assumptions. |
| Frontend implication | Active sale target must be read from canonical config and guarded against stale labels. |
| Docs updated | `docs/SMART_CONTRACT_SYSTEM_MAP.md`, `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md`, V3 readiness docs. |
| Future "never again" rule | Before designing any contract, inspect deployed contracts, constructor args, tests, deployment scripts, docs, live on-chain readbacks, Holder Index, and frontend registry. |
| Source links / commit hashes | Current lineage captured through `ca7d6d2` and prior V3 readiness commits. |

### SCRL-002 - V1/V2a/V2b address confusion

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | Membership sale registry / docs |
| Severity | High |
| Status | Resolved |
| Category | Source of truth / naming |
| Affected files | `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md`, `src/lib/syndicate-config.ts`, `src/lib/contract-registry.ts` |
| Affected deployed contracts | V1 sale, V2a sale, V2b sale |
| Symptom | A stale canonical table treated V1 sale as "Membership Sale" while V2b was the actual live buy target. |
| Root cause | Ambiguous label without version and lifecycle status. |
| Why it mattered | The wrong label can route approvals, buys, recovery planning, or owner actions to the wrong contract. |
| Fix | Separate rows and copy for V1 historical, V2a historical, V2b paused historical, and V3 active/direct-buy target. |
| Tests added | Production coherence and chain registry guards. |
| Regression guard | No single ambiguous "Membership Sale" row may be used in docs or registry surfaces. |
| Deployment implication | Every transaction packet must name version, address, role, and lifecycle status. |
| Frontend implication | Approval spender and buy target must match the active sale version. |
| Docs updated | Source-of-truth table and V3 deployment/readback docs. |
| Future "never again" rule | Always name sale version and state: V1 historical, V2a historical, V2b paused historical, V3 active/candidate/future. |
| Source links / commit hashes | Current truth captured in `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md`. |

### SCRL-003 - Wrong contract target during pause

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | V2a / V2b pause workflow |
| Severity | High |
| Status | Resolved |
| Category | Transaction safety |
| Affected files | `docs/V3_NON_LIVE_DEPLOYMENT_READBACK_LOG.md`, `docs/V3_NEXT_BOUNDARY_FUNDING_AND_ACTIVATION_PLAN.md` |
| Affected deployed contracts | V2a sale, V2b sale |
| Symptom | Founder attempted a pause on V2a instead of V2b; the transaction reverted and did not pause V2b. |
| Root cause | Historical sale addresses looked similar in the workflow and the target was not verified tightly enough before the action. |
| Why it mattered | Pausing the wrong contract can create false confidence while the intended live contract remains open. |
| Fix | Correct V2b pause transaction was performed and recorded; readbacks verified `paused() = true`. |
| Tests added | No direct transaction test for founder UI; process guard required. |
| Regression guard | Pre-transaction checklist below. |
| Deployment implication | Before any owner transaction, verify chain ID, target address, contract role, function, signer, expected result, and stop conditions. |
| Frontend implication | Public status must not be inferred from "a pause tx happened"; it must read the intended target. |
| Docs updated | V3 readback/funding docs. |
| Future "never again" rule | Never perform an owner transaction from an address/name alone; verify address-role-function-chain-signer-readback as a set. |
| Source links / commit hashes | Correct V2b pause tx recorded in current V3 readback docs. |

### SCRL-004 - SYN balance used as member identity gate

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | MembershipSaleV3 identity assignment |
| Severity | Critical |
| Status | Resolved |
| Category | Identity / migration |
| Affected files | `contracts/src/MembershipSaleV3.sol`, `contracts/test/MembershipSaleV3.t.sol`, `src/components/syndicate/LivePurchase.tsx`, `src/lib/v3-historical-members.ts` |
| Affected deployed contracts | MembershipSaleV3 candidate/deployed |
| Symptom | V3 briefly used SYN balance as a hard gate for unknown recipients. |
| Root cause | Confused transferable holder status with historical member identity. |
| Why it mattered | A wallet can receive transferred or dusted SYN without being a numbered historical member. Blocking or classifying by raw balance would corrupt membership identity. |
| Fix | Historical member identity uses numbered proof. Unknown wallets may buy and receive a new V3 member number even if they hold transferred/dusted SYN. |
| Tests added | `contracts/test/MembershipSaleV3.t.sol` tests unknown SYN holder buy and quote behavior; frontend `v3-historical-members.test.ts` guards historical roster/root. |
| Regression guard | Member identity migration must use numbered proof, not ERC-20 balance. |
| Deployment implication | Historical proof root and genesis offset must be frozen before deployment. |
| Frontend implication | Historical wallets are blocked from direct V3 buy until proof flow exists; unknown wallets may buy normally. |
| Docs updated | V3 external review package, V3 constitution, QA readiness docs. |
| Future "never again" rule | Raw ERC-20 balance is not historical identity proof. |
| Source links / commit hashes | `1581edf6b78f59055b4f618a4655377285a9cd1d`; frontend guard commit `ca7d6d2`. |

### SCRL-005 - Address-only historical proof insufficient

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | V3 historical-member migration |
| Severity | Critical |
| Status | Resolved |
| Category | Identity / proofs |
| Affected files | `contracts/src/MembershipSaleV3.sol`, `contracts/test/V3HistoricalMemberRoot.t.sol`, `contracts/script/generate-v3-historical-members-root.mjs` |
| Affected deployed contracts | MembershipSaleV3 |
| Symptom | Address-only V1 proofs could not preserve historical member numbers. |
| Root cause | The proof leaf did not bind the identity number to the wallet. |
| Why it mattered | Historical members must preserve original member numbers without duplicate or zero-member assignment. |
| Fix | Numbered historical proof leaf binds wallet plus `memberNumber`. |
| Tests added | `V3HistoricalMemberRoot.t.sol` and `MembershipSaleV3.t.sol` cover numbered proof, duplicate number rejection, zero rejection, wrong-root rejection, and historical claim then buy. |
| Regression guard | Historical identity proof must include identity number, not only address. |
| Deployment implication | Root artifacts and proof input must be frozen from final lineage before deployment. |
| Frontend implication | Direct buy guard must prevent historical wallets from bypassing proof flow. |
| Docs updated | Identity/attribution constitution and V3 review docs. |
| Future "never again" rule | Any identity migration proof must include the identity number, not only the address. |
| Source links / commit hashes | Historical migration commit `664cdd0b185104c0665549c841e1fd492bc6e287`; V3 proof tests. |

### SCRL-006 - Era VII cap mismatch

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | V3 era pricing / caps |
| Severity | High |
| Status | Resolved |
| Category | Parameters / lineage |
| Affected files | `docs/V3_DEPLOYMENT_PARAMETER_SHEET.md`, `docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md`, `contracts/test/MembershipSaleV3.t.sol` |
| Affected deployed contracts | V2b lineage, MembershipSaleV3 |
| Symptom | V3 candidate had 12,000,000 SYN for Era VII while deployed V2b lineage had 15,000,000 SYN. |
| Root cause | Test candidate drift from deployed lineage. |
| Why it mattered | Era caps determine pricing, receipts, quote behavior, and continuity with the deployed sale lineage. |
| Fix | Derived final V3 cap schedule from deployed V2b constructor/readback and patched docs/tests. |
| Tests added | MembershipSaleV3 cap schedule tests and production coherence guards. |
| Regression guard | Constructor constants must be compared against deployed lineage before deployment. |
| Deployment implication | Final constructor arguments cannot be taken from founder memory or draft docs. |
| Frontend implication | V3 preview and quote surfaces must reflect on-chain schedule. |
| Docs updated | V3 parameter sheet and constitution. |
| Future "never again" rule | Constructor constants must be re-derived from deployed lineage and readbacks before deployment. |
| Source links / commit hashes | V3 parameter freeze docs. |

### SCRL-007 - V2b recovery cannot instantly fund V3

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | V2b recovery / V3 funding |
| Severity | High |
| Status | Resolved operationally; recovery remains deferred |
| Category | Cutover / inventory |
| Affected files | `docs/V3_NEXT_BOUNDARY_FUNDING_AND_ACTIVATION_PLAN.md`, `docs/V3_NON_LIVE_DEPLOYMENT_READBACK_LOG.md` |
| Affected deployed contracts | V2b sale, MembershipSaleV3 |
| Symptom | Founder initially expected pause V2b, recover SYN, fund V3 immediately. |
| Root cause | Recovery function restrictions had not been treated as a first-class cutover constraint. |
| Why it mattered | `recoverUnsoldSyn()` is Vault-only, full balance only, rescue-protected, and timelocked unless concluded. |
| Fix | V3 was funded from a separate SYN wallet; V2b recovery was deferred and recorded. |
| Tests added | V2b recovery behavior covered in `contracts/test/SyndicateSaleV2.t.sol`; operational docs record live timelock. |
| Regression guard | Cutover plans must inspect exact recovery function, recipient, timelock, and owner restrictions. |
| Deployment implication | Inventory movement must be planned independently from recovery unless recovery is already executable and approved. |
| Frontend implication | Paused V2b can fail public buys until frontend is switched; V3 funding does not equal public activation. |
| Docs updated | V3 funding/activation plan and readback log. |
| Future "never again" rule | Never assume pause implies immediate recoverability. |
| Source links / commit hashes | V2b pause/funding docs; current V2b earliest recovery recorded as 2026-07-05 14:55:24 UTC. |

### SCRL-008 - Funding boundary changed V3 status

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | MembershipSaleV3 lifecycle |
| Severity | High |
| Status | Resolved in docs; production state still requires live QA |
| Category | Lifecycle / activation |
| Affected files | `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md`, `docs/V3_NON_LIVE_DEPLOYMENT_READBACK_LOG.md`, `src/lib/syndicate-config.ts` |
| Affected deployed contracts | MembershipSaleV3 |
| Symptom | Before funding, V3 was zero-funded/non-live. After funding, V3 became directly callable on-chain while still not public-frontend-live. |
| Root cause | Deployment, funding, activation, and frontend publish are distinct boundaries but easy to collapse in language. |
| Why it mattered | Users and operators need to know whether a contract is merely deployed, funded direct-on-chain, public frontend target, or fully source/referral activated. |
| Fix | Docs now distinguish zero-funded non-live, funded direct-on-chain candidate, current frontend buy target, and source/referral inactive. |
| Tests added | Production coherence guards check V3 target and source/referral inactive posture. |
| Regression guard | Docs and guards must state current frontend buy target and whether public buy flow may fail. |
| Deployment implication | Funding a sale contract must trigger status-table updates and pre-publish QA. |
| Frontend implication | A funded unpaused contract can be directly callable even if site is not published to it. |
| Docs updated | Source-of-truth table, V3 readback log, V3 funding/activation plan. |
| Future "never again" rule | Never call a deployed contract "live" without specifying deployment, funding, registry switch, UI publish, source records, and activation. |
| Source links / commit hashes | V3 funding/readback docs through `ca7d6d2`. |

### SCRL-009 - Approval is not purchase

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | Frontend USDC approval and purchase flow |
| Severity | High |
| Status | Resolved in current V3 flow and internal source operator console; still requires live QA |
| Category | UX / transaction lifecycle |
| Affected files | `src/components/syndicate/LivePurchase.tsx`, `src/lib/tx-lifecycle.ts`, `src/lib/tx-errors.ts`, `src/lib/__tests__/tx-lifecycle.test.ts`, `src/lib/__tests__/payment-flow.test.ts` |
| Affected deployed contracts | V2b sale, MembershipSaleV3 |
| Symptom | Old frontend sale flow got stuck or confused around USDC approval confirmation and buy transaction confirmation. |
| Root cause | Allowance approval and purchase execution were not presented as separate trust events clearly enough. |
| Why it mattered | Approval only authorizes the spender; it does not create a seat, deliver SYN, route USDC, or create a purchase receipt. |
| Fix | V3 flow separates approval and buy copy, uses active sale spender, and requires buy transaction receipt/event/readback for purchase success. |
| Tests added | Transaction lifecycle, transaction error, payment-flow, source-operator ceremony, and production coherence tests. |
| Regression guard | Approval receipt only proves allowance; purchase success requires buy tx receipt and `MembershipPurchasedV3`/fallback readback. |
| Deployment implication | Manual QA must test approval-only, rejected approval, buy success, buy rejection, and receipt rendering. |
| Frontend implication | UI must never call approval "joined", "seated", or "purchased". |
| Docs updated | Live purchase trust copy, wallet transaction architecture, source real-condition test plan, founder ceremony guide, and release guards. |
| Future "never again" rule | Approval is not purchase. |
| Source links / commit hashes | Current V3 frontend flow through `ca7d6d2`; source-operator approval-only incident `0x2e2bbe37db1ad1094c2e2b45a3d86b608fcd3e64de83688053fb5a8438e95773`. |

### SCRL-010 - Spender address must match sale target

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | USDC allowance / frontend active sale target |
| Severity | Critical |
| Status | Resolved in code; requires live QA after publish |
| Category | Frontend write safety |
| Affected files | `src/lib/sale-hooks.ts`, `src/components/syndicate/LivePurchase.tsx`, `src/lib/syndicate-config.ts` |
| Affected deployed contracts | V1, V2a, V2b, MembershipSaleV3 |
| Symptom | USDC approval can be sent to an old sale/spender if V1/V2/V2b/V3 target confusion exists. |
| Root cause | Active sale target and approval spender must be tied together, not separately inferred. |
| Why it mattered | Wrong spender approval can block buys, mislead users, or grant allowance to the wrong contract. |
| Fix | Active sale address resolves centrally and approval uses the same sale constant as buy path. |
| Tests added | Payment flow and production coherence tests. |
| Regression guard | Approval spender must be exactly the active sale contract for the chosen buy mode. |
| Deployment implication | Before publish, verify active sale, allowance spender, buy target, and explorer links. |
| Frontend implication | UI must show the contract that will spend USDC and keep it consistent with buy target. |
| Docs updated | V3 cutover/readback docs. |
| Future "never again" rule | Never duplicate sale target and approval spender logic. |
| Source links / commit hashes | V3 frontend wiring commits including `7d17333` and guard commit `ca7d6d2`. |

### SCRL-011 - Remix compiler settings must be locked

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | Remix deployment / bytecode compilation |
| Severity | High |
| Status | Resolved |
| Category | Deployment tooling |
| Affected files | `contracts/remix/*.json`, `docs/V3_REMIX_VIA_IR_DEPLOYMENT_CONFIG.md`, `contracts/foundry.toml` |
| Affected deployed contracts | SourceRegistryV1, MembershipSaleV3 |
| Symptom | Manual Remix settings can produce wrong bytecode if compiler settings drift. |
| Root cause | Remix UI settings are easy to mis-click or forget. |
| Why it mattered | Bytecode must match intended `solc 0.8.24`, optimizer 200, `viaIR = true`, EVM Paris posture. |
| Fix | Added Standard JSON compiler config files and Remix usage doc. |
| Tests added | Contract compile/test pass under repository config; no separate bytecode equality test. |
| Regression guard | Before Remix deployment, use committed compiler config or manually verify exact settings. |
| Deployment implication | Stop if Remix settings or metadata differ. |
| Frontend implication | None directly, but wrong bytecode undermines registry/readback trust. |
| Docs updated | `docs/V3_REMIX_VIA_IR_DEPLOYMENT_CONFIG.md`. |
| Future "never again" rule | Before Remix deployment, use committed compiler config and readback compiled/deployed contract. |
| Source links / commit hashes | Remix config commit history. |

### SCRL-012 - Deployment is not activation

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | V3 deployment lifecycle |
| Severity | High |
| Status | Resolved in docs; must remain guarded |
| Category | Lifecycle / communication |
| Affected files | V3 readiness docs, source-of-truth table, frontend registry/config |
| Affected deployed contracts | SourceRegistryV1, MembershipSaleV3 |
| Symptom | A deployed contract can be mistaken for "live". |
| Root cause | Deployment, verification, funding, ownership transfer, registry switch, UI publish, source records, and activation are different steps. |
| Why it mattered | Mislabeling live state can cause users to interact with a contract outside the intended product boundary. |
| Fix | V3 documents now separate deployment/readback, ownership, funding, frontend buy target, source records, and referral activation. |
| Tests added | Production coherence tests guard inactive source/referral language and V3 target posture. |
| Regression guard | Every doc and UI state must name the lifecycle stage. |
| Deployment implication | No deployment packet may imply activation unless each activation gate is complete. |
| Frontend implication | No public UI can imply source/referral activation without source records and policy approval. |
| Docs updated | V3 deployment/readback/funding/source-of-truth docs. |
| Future "never again" rule | Separate deployment, verification, funding, registry switch, UI publish, source records, and activation. |
| Source links / commit hashes | V3 deployment/readback docs. |

### SCRL-013 - Source records are not referral activation

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | SourceRegistryV1 / referral |
| Severity | High |
| Status | Resolved as boundary; public referral activation remains deferred |
| Category | Referral / acquisition |
| Affected files | `contracts/src/SourceRegistryV1.sol`, `contracts/src/MembershipSaleV3.sol`, `src/routes/referral.tsx`, V3 docs |
| Affected deployed contracts | SourceRegistryV1, MembershipSaleV3 |
| Symptom | SourceRegistry exists and one internal source-attributed buy has been proven, but source/referral policy and UI are not automatically public-live. |
| Root cause | A registry deployment can be confused with a complete acquisition product. |
| Why it mattered | Referral/source systems require legal copy, source terms, source records, receipts, UI, and claim posture before public use. |
| Fix | One internal source record was created, terms-updated, activated for a controlled $5 MembershipSaleV3 test buy, and re-paused. Referral/source UI remains inactive. |
| Tests added | Production coherence guards, SourceRegistry tests, MembershipSaleV3 source tests. |
| Regression guard | Source record, activation, test buy, public referral, and claim UI are separate gates. |
| Deployment implication | Source records require a separate founder-approved ceremony and readback. |
| Frontend implication | No public referral/source/claim UI before source state, receipt evidence, public copy, and product approval are all current and explicit. |
| Docs updated | Source-of-truth and V3 activation docs. |
| Future "never again" rule | Source records, ACTIVE status, source-attributed receipts, and public referral are distinct lifecycle states. |
| Source links / commit hashes | SourceCreated `0xf72d3c0ad6445f407382508985fc01c8d458186a410701ae40308a9d5f7a5280`; source-attributed buy `0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46`; re-pause `0x67f6498cd734b27032f0a10fe55bad57079f5b9cf38b38a85a1f95895aece71f`. |

### SCRL-014 - Public frontend truth must be explicit

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06 |
| Contract / system | V2b paused / V3 funded frontend cutover |
| Severity | High |
| Status | Partially resolved; live publish/QA still required |
| Category | Frontend / release |
| Affected files | `src/lib/syndicate-config.ts`, `src/lib/sale-hooks.ts`, `src/components/syndicate/LivePurchase.tsx`, source-of-truth docs |
| Affected deployed contracts | V2b, MembershipSaleV3 |
| Symptom | Frontend may point to paused V2b while V3 is funded direct-on-chain if Replit has not pulled/published current GitHub. |
| Root cause | GitHub truth, Replit source, and public site deployment can diverge during pauses or manual cutovers. |
| Why it mattered | Public buy flow can fail if the site still targets paused V2b; conversely V3 may be callable before public QA. |
| Fix | Repository frontend now points active sale target to V3 and direct buys use zero source. Replit/live publish still requires verification. |
| Tests added | Production coherence tests, payment-flow tests, V3 historical guard tests. |
| Regression guard | Docs/guards must state current frontend buy target and whether public buy flow may fail. |
| Deployment implication | After any sale target change: pull/sync, run release gate, publish, then live QA. |
| Frontend implication | Join, receipt, Activity, My Syndicate, Holder Index, and purchase cache must all handle V3 events. |
| Docs updated | Source-of-truth docs and V3 readback logs. |
| Future "never again" rule | Never assume GitHub main equals production until Replit sync/publish and live route QA are complete. |
| Source links / commit hashes | V3 frontend wiring `7d17333`; historical guard `ca7d6d2`. |

### SCRL-015 - Current readback is execution authority

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06-24 |
| Contract / system | All owner/source/deployment/funding/recovery ceremonies |
| Severity | Critical |
| Status | Resolved as process guard; must be repeated before every transaction |
| Category | Ceremony safety / execution authority |
| Affected files | Source creation runbook, source packets, deployment/readback docs, operational memory ledger |
| Affected deployed contracts | SourceRegistryV1, MembershipSaleV3, V2b, Archive1155, future owner-controlled contracts |
| Symptom | A correct historical packet or previous readback can become stale before the founder signs a transaction. |
| Root cause | Historical memory, lineage docs, and earlier readbacks were sometimes treated like current execution authority. |
| Why it mattered | Owner, pending owner, source existence, paused state, signer, registry target, frontend route, and production state can change between packet freeze and execution. Acting on stale truth can create a wrong source record, target the wrong contract, publish stale UI, or activate a path unintentionally. |
| Fix | Every transaction runbook must start with a Current Authority Check that reads current chain, bytecode, owner, pending owner, signer, target address, source existence/status, activation state, and frontend/production boundary before signing. |
| Tests added | Production coherence guard requires the current-authority rule in operational memory, the smart-contract ledger, and the source creation runbook. |
| Regression guard | No transaction packet may rely on remembered values alone. Readbacks must be current and named as such. |
| Deployment implication | Deployment, ownership transfer, pause/unpause, funding, recovery, registry switch, source creation, source update, payout-wallet recovery, source activation, and frontend activation all require fresh readback immediately before action. |
| Frontend implication | Frontend truth must be checked separately from GitHub truth; a source record or contract state change does not create public UI activation. |
| Docs updated | Operational memory ledger, this ledger, source creation runbook, source packet docs, authority/release handoff docs. |
| Future "never again" rule | Lineage explains how we arrived here. Current readbacks prove where we are now. Execution must use current truth, not remembered truth, historical truth alone, or stale documentation alone. |
| Source links / commit hashes | Added before the first internal PAUSED source-record ceremony. |

### SCRL-016 - Source attribution lifecycle is proven but state-scoped

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06-26 |
| Contract / system | SourceRegistryV1 / MembershipSaleV3 |
| Severity | High |
| Status | Resolved for first internal ceremony; public referral remains deferred |
| Category | Source attribution / receipt accounting / lifecycle |
| Affected files | `contracts/src/SourceRegistryV1.sol`, `contracts/src/MembershipSaleV3.sol`, `src/lib/source-policy-observability.ts`, `src/lib/source-real-condition-test.ts`, source ceremony docs |
| Affected deployed contracts | SourceRegistryV1, MembershipSaleV3 |
| Symptom | Before the real-condition test, source attribution was proven by tests/fork rehearsals but not by a completed mainnet source-attributed MembershipSaleV3 purchase. |
| Root cause | A source system has multiple independently true states: source record exists, terms updated, source ACTIVE, buy uses non-zero sourceId, payout succeeds or escrows, and source is safely re-paused. |
| Why it mattered | Without an end-to-end proof, future public referral work would still rest on assumptions about wallet UX, receipt fields, cap accounting, and payout behavior. Without final re-pause, the same proof could create accidental ongoing activation. |
| Fix | Founder executed `updateSourceTerms`, controlled ACTIVE, one $5 source-attributed V3 buy, and re-pause. Final readback confirms source status PAUSED, `isActive(sourceId) = false`, `sourceGrossAttributed = 5000000`, `buyerGrossAttributedToSource = 5000000`, `sourceEscrowOwed = 0`, and member #10 receipt fields match expected acquisition and routing math. |
| Tests added | Runtime guards now record the completion in `src/lib/source-real-condition-test.ts`, source policy observability tests, source-attributed receipt proof/reconciliation tests, and production coherence docs/tests. |
| Regression guard | Public/default buys must remain `ZERO_SOURCE_ID`; any future ACTIVE period needs fresh founder approval, current-authority readback, exact sourceId, exact terms, and a final closure readback. |
| Deployment implication | No new contract is needed for the first controlled MembershipSaleV3 source-attributed path. Future product attribution still needs separate contract/read-model design. |
| Frontend implication | The operator console pattern is proven useful; public referral UX is still unbuilt and must not inherit the internal source test route as a public model. Proven receipts should become readback-confirmed proof surfaces before they become public acquisition product surfaces. |
| Docs updated | `docs/SOURCE_REAL_CONDITION_CEREMONY_READBACK.md`, `docs/PROTOCOL_CHECKPOINT_2026_06_25.md`, `docs/PROTOCOL_KNOWLEDGE_INDEX.md`, `docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md`, `docs/REFERRAL_SOURCE_ATTRIBUTION_V1_READINESS.md`, ledgers. |
| Future "never again" rule | A source-attributed receipt proves a capability, not public activation. Activation is state-scoped, time-scoped, path-scoped, and must close with re-pause or another approved final state. |
| Source links / commit hashes | Terms update `0x898b4f142ca388543701da8e483f764d1daef4c3256d28b449aac5cf08e2784d`; ACTIVE `0x7565d0fbe6389a7fc39da4ec0f9e69d2a82a99d42d3192e616d18fc35efc4df1`; buy `0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46`; re-pause `0x67f6498cd734b27032f0a10fe55bad57079f5b9cf38b38a85a1f95895aece71f`. |

## 4. Required Pre-Contract Workflow

Before coding or patching any future smart contract:

1. Build the lineage map.
2. Build or update the source-of-truth table.
3. Read previous deployed contracts.
4. Read constructor args and deployment scripts.
5. Read tests.
6. Read docs.
7. Read live on-chain state if RPC is available.
8. Build the invariant table.
9. Build the threat model.
10. Build the failure-mode table.
11. Build the test plan.
12. Only then propose contract changes.

No contract implementation may begin until this workflow is complete and the
founder approves the resulting scope.

Minimum lineage questions:

- Which deployed contracts are historical?
- Which deployed contracts are active?
- Which deployed contracts are funded but not public?
- Which contracts are candidates only?
- Which contracts are future/reserved?
- Which frontend route or write path depends on each contract?
- Which events feed Activity, Holder Index, My Syndicate, Chronicle, Register,
  and Archive?
- Which docs are canonical and which are historical?

## 5. Required Pre-Transaction Workflow

Before any transaction:

1. Rebuild current authority from live readbacks, not memory.
2. Confirm chain ID.
3. Confirm current signer.
4. Confirm target address and bytecode.
5. Confirm contract role.
6. Confirm current `owner()` and `pendingOwner()` for owner-controlled calls.
7. Confirm function name.
8. Confirm function args.
9. Confirm value = 0 unless intentional.
10. Confirm current activation/paused/source/registry/frontend state relevant
    to the action.
11. Confirm expected readback.
12. Confirm stop conditions.
13. Confirm transaction is authorized by founder.
14. After transaction, record tx hash and readback.

This applies to:

- deployment
- ownership transfer
- ownership acceptance
- pause/unpause
- funding
- source creation
- source update
- payout wallet update
- source pause/revoke
- recovery
- registry switch
- frontend activation

If any of the above cannot be confirmed, stop.

## 6. Future Referral / Source Contract Warning

Before building referral/source contracts, Codex must decide whether the problem
belongs in:

- SourceRegistryV1
- MembershipSaleV3 source terms
- frontend attribution
- read-model/indexer
- legal/product policy
- separate contract
- no contract at all

Do not build a new contract merely because the idea sounds like a feature.

Required referral/source checks:

- no source owns a member
- no MLM/downline framing
- no passive income/yield framing
- no hidden payouts
- no fake claim UI
- no source record without policy metadata
- no public referral activation before source terms are approved
- no frontend source UI before SourceRegistry state exists
- no commission without purchase receipt
- no claim surface before escrow state, source status, and legal copy are ready
- no source creation without an event/readback record

Referral is acquisition attribution. It is not the business model, not a seat,
not a rank, not yield, and not institutional identity.

## 7. Test / Guard Map

This map must be updated whenever a lesson gains, loses, or changes coverage.

| Lesson | Existing test / guard | Status | Missing or suggested future test |
| --- | --- | --- | --- |
| SCRL-001 lineage-first | `docs/SMART_CONTRACT_SYSTEM_MAP.md`, production coherence guards | Process guarded | Add release check requiring this ledger to be referenced by future contract readiness docs. |
| SCRL-002 address confusion | `src/lib/__tests__/production-coherence.test.ts`, `src/lib/__tests__/chain-registry-guard.test.ts` | Guarded | Add a focused active-sale-version test if contract labels change again. |
| SCRL-003 wrong pause target | Docs/process only | Missing automated guard | Add a transaction-packet checklist template test or script that rejects ambiguous target labels. |
| SCRL-004 SYN balance identity gate | `contracts/test/MembershipSaleV3.t.sol`, `src/lib/__tests__/v3-historical-members.test.ts` | Guarded | Keep a direct test that an unknown wallet with SYN dust can buy. |
| SCRL-005 address-only proof insufficient | `contracts/test/V3HistoricalMemberRoot.t.sol`, `contracts/test/MembershipSaleV3.t.sol` | Guarded | Add frontend proof-flow tests when historical proof UI exists. |
| SCRL-006 Era VII cap mismatch | `contracts/test/MembershipSaleV3.t.sol`, V3 preview tests, production coherence | Guarded | Add deployment-parameter script that compares docs constants to constructor arrays before future deployments. |
| SCRL-007 V2b recovery cannot instantly fund V3 | `contracts/test/SyndicateSaleV2.t.sol`, V3 recovery docs | Partially guarded | Add operational recovery rehearsal/readback script before any future recovery ceremony. |
| SCRL-008 funding changed V3 status | Production coherence guards and source-of-truth docs | Guarded in docs/tests | Add live-site smoke checklist after Replit publish. |
| SCRL-009 approval is not purchase | `tx-lifecycle.test.ts`, `tx-errors.test.ts`, `payment-flow.test.ts`, `source-test-operator-ceremony.test.ts`, production coherence | Guarded | Live wallet QA remains required after publish. |
| SCRL-010 spender matches target | `payment-flow.test.ts`, `tx-write-canonical.test.ts`, production coherence | Guarded | Add route-level E2E assertion after Playwright/browser flow is available. |
| SCRL-011 Remix settings locked | Remix Standard JSON files, `docs/V3_REMIX_VIA_IR_DEPLOYMENT_CONFIG.md` | Guarded by docs/config | Add bytecode metadata comparison if future deployment is repeated. |
| SCRL-012 deployment is not activation | Production coherence and source-of-truth docs | Guarded | Add source/referral activation tests before any source UI. |
| SCRL-013 source records are not referral activation | `SourceRegistryV1.t.sol`, `MembershipSaleV3.t.sol`, production coherence | Guarded | Add frontend read-only source-state tests before source activation. |
| SCRL-014 public frontend truth explicit | `sale-hooks`, `LivePurchase`, production coherence, V3 historical guard tests, `purchase-events-cache.test.ts` | Guarded for cache source preservation | Live Replit publish and wallet QA remain required before public confidence. |
| SCRL-015 current readback is execution authority | `docs/OPERATIONAL_MEMORY_LEDGER.md`, `docs/SOURCE_CREATION_CEREMONY_RUNBOOK.md`, production coherence | Guarded by docs/tests | Add a reusable pre-transaction readback script for repeated owner ceremonies. |
| SCRL-016 source attribution lifecycle is proven but state-scoped | `src/lib/source-real-condition-test.ts`, `src/lib/source-attributed-receipts.ts`, `src/lib/__tests__/source-real-condition-test.test.ts`, `src/lib/__tests__/source-policy-observability.test.ts`, `src/lib/__tests__/source-attributed-receipts.test.ts`, `docs/SOURCE_REAL_CONDITION_CEREMONY_READBACK.md` | Guarded for the first internal ceremony and readback-confirmed proof projection | Add public-referral E2E tests only if a future public source path is approved. |

Resolved cache gap:

- `src/lib/purchase-events-cache.ts` now preserves `"v1"`, `"v2"`, and `"v3"`
  purchase sources during cache restore and rejects unknown future labels instead
  of silently relabeling them as V1. `src/lib/__tests__/purchase-events-cache.test.ts`
  guards V3 purchase source and V3 receipt-field round trips before public V3
  traffic.

## 8. Future Smart-Contract Checklist

Before any future contract sprint, answer these in writing:

1. What exact problem is being solved?
2. Why can it not be solved by existing contracts, frontend, read model, docs,
   or policy?
3. Which existing contract state does it depend on?
4. Which historical contracts must remain preserved?
5. Which events will downstream systems consume?
6. Which user-facing claims become true only after deployment?
7. Which user-facing claims must remain pending?
8. What can go wrong if the contract is deployed but unfunded?
9. What can go wrong if the contract is funded but not frontend-wired?
10. What can go wrong if frontend is wired but source/readback state is stale?
11. What founder action can pause, revoke, recover, or disable it?
12. What must be external-reviewed before deployment?
13. What must be live-QA'd after publish?

If the answers are unclear, stop.

## 9. Validation Policy

After updating this ledger:

- run `npm run check-release`
- commit only the ledger and any intentional docs/tests
- do not commit `.output`, `contracts/out`, `contracts/cache`, `node_modules`,
  generated build artifacts, or unrelated files

The intended commit message for the initial ledger is:

```text
Create smart contract lessons and regression ledger
```
