# Protocol Checkpoint - 2026-06-25

Status: OPERATIONAL CHECKPOINT / CURRENT AUTHORITY SNAPSHOT / INTERNAL SOURCE TEST VALIDATED / NO PUBLIC ACTIVATION AUTHORITY

This checkpoint preserves the current whole-protocol state after the V3 direct-buy cutover, first internal source readback, source/read-model hardening, Replit production sync, operational memory updates, and the first completed end-to-end internal Source Attribution real-condition ceremony.

It is not a deployment packet, source activation packet, referral launch packet, claim UI approval, registry switch, contract change, or production publish instruction.

## Why This Exists

The last 24 hours moved The Syndicate across several boundaries at once:

- V3 is the public direct-buy target.
- SourceRegistryV1 has one internal source policy fact that completed a controlled source-attributed buy and was returned to PAUSED.
- Referral/source attribution remains inactive.
- The read model now distinguishes source policy existence from source activation.
- Replit production has been synced through the source-operator console and the ceremony close-out is now repository truth.
- Operational memory now records how to interpret live-QA text matches and Replit local divergences.

Without one checkpoint, future work can easily mix old "zero source records" memory, the first PAUSED source truth, the completed internal source-attributed receipt, and future public referral plans. This file is the current continuity map.

## Current Authority

| Layer | Current truth |
| --- | --- |
| GitHub baseline before this checkpoint | `46e10a2b4d601f886d1409ff29b9d7ab999cfe38` - `Record Replit live QA interpretation lessons` |
| Production runtime | Published and QA green from `e19927b` - `Record PAUSED internal source readback` |
| Replit push-back | None required after the `e19927b` production sync |
| Replit local divergence | Local `vite.config.ts` watch-ignore fix is a Replit dev-workspace divergence, not canonical GitHub product truth |
| Current active sale path | MembershipSaleV3 direct buy |
| Default public sourceId | `ZERO_SOURCE_ID` / `0x0000000000000000000000000000000000000000000000000000000000000000` |
| V2b | Paused historical sale and recovery boundary; not current public buy target |
| SourceRegistryV1 | Deployed, owner accepted, one internal source record; final status PAUSED after a completed controlled source-attributed buy |
| Referral/source UI | Inactive |
| Claim UI | Absent |
| Public source-aware buy path | Absent |
| Contract changes in this checkpoint | None |
| Ceremony transactions now recorded | `updateSourceTerms`, controlled ACTIVE, one $5 source-attributed buy, and re-pause |

Current GitHub main after the commit that adds this file supersedes the baseline above for docs/guard memory only. Production does not need a publish for this checkpoint unless the founder wants deployment provenance alignment.

## On-Chain Anchors

| Contract / fact | Value |
| --- | --- |
| SourceRegistryV1 | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| MembershipSaleV3 | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` |
| V2b sale | `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` |
| SYN | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| USDC | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| SourceRegistry latest readback block | `88808111` |
| SourceCreated tx | `0xf72d3c0ad6445f407382508985fc01c8d458186a410701ae40308a9d5f7a5280` |
| SourceTermsUpdated tx | `0x898b4f142ca388543701da8e483f764d1daef4c3256d28b449aac5cf08e2784d` |
| Controlled ACTIVE tx | `0x7565d0fbe6389a7fc39da4ec0f9e69d2a82a99d42d3192e616d18fc35efc4df1` |
| Source-attributed buy tx | `0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46` |
| Re-pause tx | `0x67f6498cd734b27032f0a10fe55bad57079f5b9cf38b38a85a1f95895aece71f` |

## Current Source Policy Fact

| Field | Value |
| --- | --- |
| Label | `INTERNAL_PROTOCOL_TEST_SOURCE_001` |
| sourceId | `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620` |
| status | `PAUSED` |
| sourceClass | `BUILDER_SOURCE` |
| sourceWallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| payoutWallet | `0x244531C571966f90f4849e03a507543d90f9C721` |
| commissionBps | `500` |
| scope | `WINDOWED` |
| startTime | `1782388800` |
| endTime | `1783598400` |
| grossCap | `25000000` USDC units |
| perBuyerCap | `5000000` USDC units |
| appliesToRepeatPurchases | `false` |
| metadataHash | `0x797dedbf845edc5954012c46a6c42e121f19f142d76fe34c8f59bf8e8c7bd681` |
| Final current status | `PAUSED` |
| Latest `isActive(sourceId)` | `false` |
| Validated source-attributed buy | `0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46` |
| Validated member number | `10` |
| Source escrow owed | `0` |

This record is source policy state plus one completed internal proof receipt. It does not create a referral program, public source link, source dashboard, claim UI, public source-aware buy path, member referral model, agency relationship, employment relationship, member ownership, passive income, MLM/downline structure, or product-wide attribution.

## What Became True Recently

| Area | Current result |
| --- | --- |
| V3 direct buy | Current repository buy target points to MembershipSaleV3. Public/default buys use `ZERO_SOURCE_ID`. |
| Historical-member guard | Historical wallets are protected from direct V3 member-number reassignment. |
| Source policy observability | One internal PAUSED source record is represented in `src/lib/source-policy-observability.ts`. |
| Source lifecycle model | `SourceCreated`, `SourceStatusChanged`, `SourceTermsUpdated`, and payout-wallet update facts have read-only modeling. |
| Source-attributed receipts | One real-condition internal V3 source-attributed purchase receipt exists and is read back; public receipt surfacing remains a product decision. |
| Activity/My Syndicate readiness | The first real source-attributed receipt can be understood without activating public source paths. |
| Registry/referral truth | Public surfaces can say a PAUSED source policy fact exists while still saying referral is inactive. |
| Production truth | Replit production was synced to `e19927b` and QA confirmed the PAUSED readback state. |
| Operational memory | OML-015 records that loose text grep can confuse boundary copy with live controls, that Replit's dev watch-ignore fix is local divergence, and that `check-commission-router-freeze` BLOCKED is expected pre-activation posture. |
| Operator memory | OML-017 and OML-018 record that ceremony consoles must be explicit and approval is not a buy; OML-019 records the completed source test closure discipline. |

## Superseded Truths

Do not reintroduce these as current truth:

- "Source records are zero."
- "The first internal source packet is only a future recommendation."
- "The source-attributed receipt test is still hypothetical."
- "A source record means referral is live."
- "A PAUSED source can be used by public buys."
- "A claim UI exists because escrow functions exist."
- "A text phrase such as 'no claim UI' proves a claim control exists."
- "`check-commission-router-freeze` BLOCKED is a release failure by itself."
- "Replit's local `vite.config.ts` watch-ignore fix is canonical product truth."
- "CommissionRouterV1 is the active V3 source engine."
- "Archive1155, SwapRail, SeatRecord721, or ProductSaleRouter are source-aware today."

## Hard Boundaries

The current system still forbids:

- source activation,
- public referral activation,
- claim UI,
- public source links,
- source dashboard,
- public source-aware buy path,
- registry switch,
- V2b recovery without separate ceremony,
- contract deployment or contract modification,
- wallet signing by Codex,
- source record creation without separate founder-approved ceremony,
- product-wide attribution claims,
- MLM/downline/upline framing,
- yield, passive-income, ROI, or guaranteed-return framing,
- financial leaderboard framing.

## Canonical File Map

| Topic | Current authority |
| --- | --- |
| Contract/readback addresses | `src/lib/syndicate-config.ts`, `src/lib/contract-registry.ts`, `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md` |
| Source policy runtime snapshot | `src/lib/source-policy-observability.ts` |
| Completed source-attribution ceremony readback | `docs/SOURCE_REAL_CONDITION_CEREMONY_READBACK.md` |
| Source lifecycle read model | `src/lib/source-registry-lifecycle.ts` |
| Future source-attributed receipt projection | `src/lib/source-attributed-receipts.ts` |
| Public inactive referral surface | `src/routes/referral.tsx` |
| Registry/source proof surface | `src/routes/registry.tsx` |
| V3 direct-buy path | `src/routes/join.tsx`, `src/components/syndicate/LivePurchase.tsx`, `src/lib/sale-hooks.ts` |
| Source packet | `docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_DRAFT.md` |
| Founder input/frozen source values | `docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_FOUNDER_INPUTS.md` |
| Source ceremony/runback boundary | `docs/SOURCE_CREATION_CEREMONY_RUNBOOK.md` |
| Source/referral readiness | `docs/REFERRAL_SOURCE_ATTRIBUTION_V1_READINESS.md` |
| Source capability boundaries | `docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md` |
| Strategic source research | `docs/REFERRAL_SOURCE_ATTRIBUTION_STRATEGIC_RESEARCH.md` |
| SaaS/referral platform audit | `docs/REFERRAL_INFRASTRUCTURE_PLATFORM_AUDIT.md` |
| Production/GitHub/Replit sync | `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md` |
| Operational memory | `docs/OPERATIONAL_MEMORY_LEDGER.md` |
| Smart contract regression memory | `docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md` |
| Documentation authority | `docs/DOCUMENTATION_AUTHORITY_MAP.md` |
| This whole-protocol checkpoint | `docs/PROTOCOL_CHECKPOINT_2026_06_25.md` |

## Dependency Map

```text
MembershipSaleV3 direct buy
  -> public/default sourceId = ZERO_SOURCE_ID
  -> no source payout
  -> normal V3 receipt/routing only

SourceRegistryV1
  -> one internal source record now PAUSED after a completed test
  -> visible policy fact and proof receipt
  -> not referral activation

Completed internal source-attributed MembershipSaleV3 buy
  -> source was ACTIVE only during the test
  -> explicit non-zero sourceId path was hidden and allowlisted
  -> emitted receipt facts for acquisition cost and Net USDC Routed
  -> source is now PAUSED again

Claim / escrow UI
  -> requires escrow facts, status-gating, legal/product copy, and UX approval
  -> not live today

Archive1155 / SeatRecord721 / SwapRail / ProductSaleRouter
  -> not source-aware today
  -> require separate design and contract/read-model work before any source attribution claim
```

## Route Truth

| Route / surface | Current role |
| --- | --- |
| `/` | Institutional visibility surface and current protocol summary. |
| `/join` | V3 direct buy. Public/default buys remain `ZERO_SOURCE_ID`; no source selector or source link. |
| `/referral` | Inactive source/referral explanation and PAUSED source policy readback; no claim UI or live referral. |
| `/registry` | Contract and source-policy proof surface, including SourceRegistryV1 and MembershipSaleV3. |
| `/activity` | Live heartbeat and receipt/event context; the internal source-attributed receipt may be represented only with clear non-public status. |
| `/my-syndicate` | Member cockpit and source receipt context; no claim/balance dashboard. |
| `/transparency` | Protocol Economy and readback truth; source policy is not commission/revenue. |
| `/chronicle` | Institutional memory; source milestones only if admitted as meaningful history. |
| `/archive` / `/nft` | Archive1155 memory surface; not source-aware. |
| `/evolution` | Protocol evolution and boundary proof; no governance, activation, source, or claim authority. |

## Pending Work

| Work | Why it exists | Blocks |
| --- | --- | --- |
| Current-authority preflight before any next source transaction | Prevents acting from stale source, owner, status, or production memory | Any source status or terms transaction |
| Source activation readiness packet | Created as `docs/SOURCE_ACTIVATION_READINESS_PACKET.md`; now a future-ceremony reference after the completed internal test | Any future ACTIVE ceremony requires fresh readback and founder approval |
| Timestamp/window review | Current terms use the before-July test window; any future test must re-check timing or update terms with a new approved packet | Any future source-attributed test |
| Internal source-aware test path | Created as `/labs/source-attribution-test` with localhost or explicit production-internal flags, exact query, sourceId, allowlisted buyer in production-internal mode, live SourceRegistry terms, and clear approval-vs-buy states; used successfully for one controlled buy | Public source-aware UX still requires separate legal/product approval |
| Buyer disclosure / clear-source UX | Internal harness previews sourceId, status, class, wallets, commission bps, caps, amount, approval status, buy status, and stop conditions | Public source-aware UX still requires separate legal/product approval |
| ACTIVE source ceremony | Completed once for the controlled internal test and closed by re-pause | Any future ACTIVE ceremony requires fresh current-authority readback and founder approval |
| $5 internal source-attributed buy readback | Proved receipt, payout, escrow, attribution, cap accounting, Activity/My Syndicate read-model compatibility, and Registry truth | Public source/referral planning |
| Claim/escrow policy | Required before any claim surface or balance display | Claim UI |
| Legal/product copy signoff | Required before source commission is shown publicly | Public referral/source activation |
| Product-wide attribution design | Required before Archive, SwapRail, SeatRecord721, ProductSaleRouter, or partner commerce claims | Future modules |

## Recommended Execution Roadmap

### Sprint 1 - Post-Ceremony Product Truth

Goal: make the completed source-attributed receipt visible to the read models
without implying public referral activation.

Outcome:

- Activity/My Syndicate receipt truth reflects the internal source proof,
- Registry/Referral language distinguishes PAUSED source proof from public referral,
- public/default buys remain `ZERO_SOURCE_ID`,
- no source links, claim UI, source dashboards, or public source-aware buy path.

Current implementation note: this checkpoint records the final readback in
`docs/SOURCE_REAL_CONDITION_CEREMONY_READBACK.md`; the product read models now
need the same disciplined translation.

### Sprint 2 - Internal Source-Aware Test Path Maintenance

Goal: keep the environment-gated test path available for future approved tests
without turning it into public referral UX.

Outcome:

- loud internal source test mode,
- no public production exposure,
- no public source link,
- no source selector in default public buy,
- fresh-buyer-wallet checklist,
- $5 test amount boundary,
- readback checklist.

Current implementation note: this sprint is represented by
`docs/SOURCE_AWARE_LOCAL_TEST_PATH.md`,
`src/lib/source-aware-test-mode.ts`, and the noindex internal route
`/labs/source-attribution-test?sourceTest=INTERNAL_PROTOCOL_TEST_SOURCE_001`.
It remains non-executable while the source status is PAUSED and it does not
authorize activation.

### Sprint 3 - Controlled ACTIVE Ceremony And $5 Test

Goal: completed. The source was activated only for the controlled test window, one $5 source-attributed buy succeeded, and every receipt/routing/payout fact was read back.

Outcome:

- transaction hash,
- source status readback,
- MembershipPurchasedV3 receipt,
- source fields,
- acquisition commission,
- Net USDC Routed,
- Vault/Liquidity/Operations routing,
- payout wallet delta or escrow fact,
- Activity/My Syndicate/cache behavior after reload.

### Sprint 4 - Post-Test Truth Update

Goal: record the test as institutional memory without turning it into public referral.

Outcome:

- source observability update,
- first runtime proof surface on Activity and Transparency,
- My Syndicate wallet-specific source receipt read model remains guarded,
- Registry/Activity/My Syndicate copy aligned to receipt facts,
- Chronicle candidate only if meaningful,
- no claim UI unless separately approved,
- public/default buys still `ZERO_SOURCE_ID` unless a separate public activation decision is made.

### Sprint 5 - Public Source/Referral Product Decision

Goal: decide if and how the protocol should expose public referral/source mechanics.

Outcome:

- source link/alias design,
- public disclosure copy,
- source lifecycle display,
- abuse/fraud handling,
- clear-source UX,
- no MLM/downline/passive-income framing,
- legal/product approval,
- Replit production sync plan.

## What To Skip For Now

- Public referral link generation.
- Claim UI.
- Source dashboard.
- Product-wide attribution.
- CommissionRouterV1 deployment or wiring.
- Archive1155 source attribution.
- SeatRecord721.
- SwapRail.
- ProductSaleRouter.
- Financial leaderboards.
- Any public source-aware buy path beyond the internal test before a public-source product decision.

## Final Recommendation

Do not activate referral yet.

Do not create another source record yet.

Do not build claim UI yet.

The internal source-aware test path proved the first controlled $5
source-attributed MembershipSaleV3 purchase and the source was re-paused. That
work increases institutional integrity because it turned the source engine from
a design assumption into a readback-backed protocol capability without
launching public referral.

The protocol should move from:

```text
PAUSED source policy fact
```

to:

```text
validated internal source-attribution ceremony -> post-test read-model hardening -> public referral decision
```

Only after that should public referral/source UX be reconsidered.
