# Protocol Checkpoint - 2026-06-25

Status: OPERATIONAL CHECKPOINT / CURRENT AUTHORITY SNAPSHOT / NO ACTIVATION AUTHORITY

This checkpoint preserves the current whole-protocol state after the V3 direct-buy cutover, first internal PAUSED source readback, source/read-model hardening, Replit production sync, and operational memory updates.

It is not a deployment packet, source activation packet, referral launch packet, claim UI approval, registry switch, contract change, or production publish instruction.

## Why This Exists

The last 24 hours moved The Syndicate across several boundaries at once:

- V3 is the public direct-buy target.
- SourceRegistryV1 has one internal PAUSED source policy fact.
- Referral/source attribution remains inactive.
- The read model now distinguishes source policy existence from source activation.
- Replit production has been synced to the PAUSED source readback.
- Operational memory now records how to interpret live-QA text matches and Replit local divergences.

Without one checkpoint, future work can easily mix old "zero source records" memory, current PAUSED source truth, and future referral activation plans. This file is the current continuity map.

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
| SourceRegistryV1 | Deployed, owner accepted, one internal PAUSED source record |
| Referral/source UI | Inactive |
| Claim UI | Absent |
| Public source-aware buy path | Absent |
| Contract changes in this checkpoint | None |
| Transactions in this checkpoint | None |

Current GitHub main after the commit that adds this file supersedes the baseline above for docs/guard memory only. Production does not need a publish for this checkpoint unless the founder wants deployment provenance alignment.

## On-Chain Anchors

| Contract / fact | Value |
| --- | --- |
| SourceRegistryV1 | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| MembershipSaleV3 | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` |
| V2b sale | `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` |
| SYN | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| USDC | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| SourceRegistry readback block | `88705814` |
| SourceCreated tx | `0xf72d3c0ad6445f407382508985fc01c8d458186a410701ae40308a9d5f7a5280` |

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
| startTime | `1782907200` |
| endTime | `1784116800` |
| grossCap | `25000000` USDC units |
| perBuyerCap | `5000000` USDC units |
| appliesToRepeatPurchases | `false` |
| metadataHash | `0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d` |

This record is source policy state only. It does not create a referral program, public source link, source dashboard, claim UI, public source-aware buy path, member referral model, agency relationship, employment relationship, member ownership, passive income, MLM/downline structure, or product-wide attribution.

## What Became True Recently

| Area | Current result |
| --- | --- |
| V3 direct buy | Current repository buy target points to MembershipSaleV3. Public/default buys use `ZERO_SOURCE_ID`. |
| Historical-member guard | Historical wallets are protected from direct V3 member-number reassignment. |
| Source policy observability | One internal PAUSED source record is represented in `src/lib/source-policy-observability.ts`. |
| Source lifecycle model | `SourceCreated`, `SourceStatusChanged`, `SourceTermsUpdated`, and payout-wallet update facts have read-only modeling. |
| Source-attributed receipts | Fixture/read-model coverage exists for future non-zero-source V3 purchase receipts. |
| Activity/My Syndicate readiness | Future source-attributed receipts can be understood without activating public source paths. |
| Registry/referral truth | Public surfaces can say a PAUSED source policy fact exists while still saying referral is inactive. |
| Production truth | Replit production was synced to `e19927b` and QA confirmed the PAUSED readback state. |
| Operational memory | OML-015 records that loose text grep can confuse boundary copy with live controls, that Replit's dev watch-ignore fix is local divergence, and that `check-commission-router-freeze` BLOCKED is expected pre-activation posture. |

## Superseded Truths

Do not reintroduce these as current truth:

- "Source records are zero."
- "The first internal source packet is only a future recommendation."
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
  -> one internal PAUSED source record
  -> visible policy fact
  -> not referral activation

Future source-attributed MembershipSaleV3 buy
  -> requires source status ACTIVE
  -> requires source terms still valid
  -> requires explicit non-zero sourceId path
  -> requires buyer disclosure / clear-source UX
  -> requires local/test path before public path
  -> emits receipt facts for acquisition cost and Net USDC Routed

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
| `/activity` | Live heartbeat and future receipt/event context; no source-attributed live receipt until one exists. |
| `/my-syndicate` | Member cockpit and future source receipt context; no claim/balance dashboard. |
| `/transparency` | Protocol Economy and readback truth; source policy is not commission/revenue. |
| `/chronicle` | Institutional memory; source milestones only if admitted as meaningful history. |
| `/archive` / `/nft` | Archive1155 memory surface; not source-aware. |
| `/evolution` | Protocol evolution and boundary proof; no governance, activation, source, or claim authority. |

## Pending Work

| Work | Why it exists | Blocks |
| --- | --- | --- |
| Current-authority preflight before any next source transaction | Prevents acting from stale source, owner, status, or production memory | Any source status or terms transaction |
| Source activation readiness packet | Created as `docs/SOURCE_ACTIVATION_READINESS_PACKET.md`; separates PAUSED policy fact from ACTIVE source behavior | ACTIVE ceremony remains blocked until readbacks, local test path, disclosure, and founder approval |
| Timestamp/window review | Current window is July 1-15, 2026 UTC; if activation testing happens too late, a visible terms update may be required before activation | Source-attributed test buy |
| Internal source-aware test path | Created as `/labs/source-attribution-test` with localhost or explicit production-internal flags, exact query, sourceId, allowlisted buyer in production-internal mode, live SourceRegistry terms, and PAUSED-status gates | $5 internal source-attributed buy test remains blocked until ACTIVE ceremony and fresh readbacks |
| Buyer disclosure / clear-source UX | Internal harness previews sourceId, status, class, wallets, commission bps, caps, and quote fields before future controls can appear | Public source-aware UX still requires separate legal/product approval |
| ACTIVE source ceremony | Separate founder transaction; not bundled with UI or claim activation | Source-attributed buy test |
| $5 internal source-attributed buy readback | Proves receipt, payout, escrow, attribution, cache, Activity, My Syndicate, and Registry truth | Public source/referral planning |
| Claim/escrow policy | Required before any claim surface or balance display | Claim UI |
| Legal/product copy signoff | Required before source commission is shown publicly | Public referral/source activation |
| Product-wide attribution design | Required before Archive, SwapRail, SeatRecord721, ProductSaleRouter, or partner commerce claims | Future modules |

## Recommended Execution Roadmap

### Sprint 1 - Source Activation Readiness Packet

Goal: prepare, without transaction, the exact conditions under which the existing PAUSED source could be activated for a controlled internal test.

Outcome:

- current readback checklist,
- owner/signer/network checks,
- timestamp/window decision,
- failure cases,
- exact `setSourceStatus(..., ACTIVE)` or `updateSourceTerms` preconditions,
- no public UI changes.

Current implementation note: this sprint is represented by
`docs/SOURCE_ACTIVATION_READINESS_PACKET.md`,
`docs/SOURCE_ACTIVE_CEREMONY_PREFLIGHT.md`, and
`src/lib/source-activation-readiness.ts`. It does not authorize activation.
The preflight document is command-ready, but live `AVAX_RPC` readbacks were not
performed in the Codex shell because no RPC endpoint was set.

### Sprint 2 - Internal Source-Aware Test Path

Goal: build or enable an environment-gated test path that can intentionally pass the frozen sourceId in local development, or in a separately approved production-internal mode with explicit flags and an allowlisted fresh buyer.

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

Goal: if founder separately approves, activate the source only for the controlled test window, perform a tiny source-attributed buy, and read back every receipt/routing/payout fact.

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
- Any public source-aware buy path before a controlled internal test proves the path.

## Final Recommendation

Do not activate referral yet.

Do not create another source record yet.

Do not build claim UI yet.

The internal source-aware test path boundary now exists as an internal,
noindex `/labs` route guarded by localhost, an explicit environment flag, the
frozen internal source label, and the source's current `PAUSED` status. That
work increases institutional integrity because it makes the next possible
source-attributed purchase understandable before it becomes usable.

The protocol should move from:

```text
PAUSED source policy fact
```

to:

```text
activation preflight -> source terms/window review -> controlled ACTIVE test -> receipt/readback truth
```

Only after that should public referral/source UX be reconsidered.
