# V3 Protocol Engine Constitution

Status: CANONICAL V3 SPECIFICATION / NO DEPLOYMENT AUTHORIZED

This document freezes the V3 design direction before Solidity implementation.
It does not deploy, activate, or register any V3 contract. V2b remains the live
buy target until a future V3 deployment is reviewed, verified, funded, and
intentionally activated.

## 1. Binding Doctrine

The Syndicate is a verifiable on-chain membership institution.

Canonical model:

- Seat Identity
- Contribution Depth
- Economic Scale
- Institutional Trust Capital
- Transparent Routing
- Historical Memory
- Institutional Growth

Binding rules:

- SYN remains the V1 membership seat.
- The seat is binary; contribution is variable.
- Member count is not economic scale.
- Archive1155 artifacts are protocol memory, not seats.
- SeatRecord721 is a future identity record, not the live seat.
- Referral/acquisition is one growth layer, not the business model.
- Recognition and money terms are separate.
- Ranks and recognition must not become wealth leaderboards.
- Protocol and company are distinct but narratively connected.

## 2. Repository Truth Reconciliation

Current repository truth:

- `SyndicateSaleV2.sol` already implements deterministic era pricing.
- Older docs/config still contain fixed-price language such as `1 SYN = $0.01`
  and "same rate for everyone".
- `CommissionRouterV1.sol` implements an Operations-slice router only.
- `src/lib/preview/referral.ts` defines Signal, Advocate, Connector, Catalyst,
  and Ambassador as preview/referral labels, with money-weighted fields
  quarantined from Signals, Chronicle, and Recognition.
- `docs/REVENUE_ATTRIBUTION_LAYER.md` reserves source namespaces including
  `SPONSORSHIP`, `AFFILIATE`, `BD_NETWORK`, `WHITELABEL`, and
  `TREASURY_DEAL`.

V3 resolution:

- Deterministic era pricing is approved for V3.
- Chapter is historical identity and belonging.
- Era is pricing.
- The old fixed "same rate for everyone" doctrine is retired for V3.
- There is no admin price switch, oracle, bonding curve, or market-linked price.
- Every V3 receipt records era and price rate.

## 3. Deterministic Era Pricing

V3 uses the current Sale V2 stepped schedule as the baseline unless the founder
changes this document before Solidity is written.

| Era | Seat range | SYN per 1 USDC | Implied SYN price | Minimum USDC |
| --- | --- | ---: | ---: | ---: |
| I | #1 - #333 | 100 | 0.01 USDC | 5 |
| II | #334 - #1,000 | 50 | 0.02 USDC | 10 |
| III | #1,001 - #3,333 | 40 | 0.025 USDC | 10 |
| IV | #3,334 - #10,000 | 16 | 0.0625 USDC | 25 |
| V | #10,001 - #25,000 | 12 | 0.083333 USDC | 25 |
| VI | #25,001 - #50,000 | 6 | 0.166667 USDC | 50 |
| VII | #50,001 - #100,000 | 4 | 0.25 USDC | 50 |
| VIII | #100,001 - #250,000 | 2 | 0.50 USDC | 100 |
| IX | #250,001 - #1,000,000 | 1 | 1.00 USDC | 100 |

Chapter doctrine remains separate:

- Earlier chapter means earlier historical position.
- Earlier chapter does not grant financial rights.
- Era pricing is not a promise of appreciation, yield, profit, or resale value.
- No copy may imply that buying earlier creates investment upside.

## 4. Acquisition-First Routing

V3 routes gross USDC through acquisition-first math:

```text
grossUsdc - acquisitionCost = protocolContribution
protocolContribution * 70% = vaultAmount
protocolContribution * 20% = liquidityAmount
protocolContribution * 10% = operationsAmount
```

Then V3 transfers SYN to the recipient and emits one rich receipt event.

If no valid source/referrer exists:

```text
acquisitionCost = 0
protocolContribution = grossUsdc
```

Acquisition cost is not hidden. It must be shown in the receipt and emitted in
the purchase event.

## 5. Source Classes

V3 recognizes these source classes.

| Source class | Assignment | Purpose | Default money policy |
| --- | --- | --- | --- |
| `MEMBER_INTRODUCTION` | Autonomous public source | Seated member introduces a buyer | Progression schedule, capped |
| `BUILDER_SOURCE` | Founder/operator assigned | Builder/operator growth channel | Custom source terms |
| `AFFILIATE` | Founder/operator assigned | Approved public marketing channel | Custom source terms |
| `BD_NETWORK` | Founder/operator assigned | Business-development channel | Custom source terms |
| `WHITELABEL` | Founder/operator assigned | Embedded/institutional source | Custom source terms |
| `SPONSORSHIP` | Founder/operator assigned | Campaign or sponsorship source | Custom source terms |
| `TREASURY_DEAL` | Founder/operator assigned | Strategic institution-level source | Custom source terms |

`MEMBER_INTRODUCTION` is public and autonomous. The other classes require
explicit source-policy action and must emit events.

## 6. Public Autonomous Referral Progression

Public referral must be meaningful enough to drive growth, but not shaped like
MLM, downline income, yield, or passive income.

Public referral requirements:

- referrer must be a seated wallet,
- buyer must explicitly confirm the referrer/source,
- self-referral is blocked,
- source must be active,
- source must remain healthy,
- commission applies only inside its window and caps,
- no downline exists,
- no commission exists without a purchase receipt.

Recommended autonomous progression:

| Recognition | Transparent condition | Public commission |
| --- | --- | ---: |
| Signal | first verified seated member introduced | 5% |
| Advocate | 5 seated members introduced and source health clean | 6% |
| Connector | 20 seated members introduced and source health clean | 8% |
| Catalyst | 75 seated members introduced and source health clean | 10% |
| Ambassador | 250 seated members introduced, source health clean, review flag clear | 12% |
| Chapter Source | 1,000 seated members introduced, clean history, founder review required | 15% |

The first five names come from existing repository vocabulary. `Chapter Source`
is added for scale: it marks a source that materially helps form chapters, not
a rank, not a governance role, and not a financial identity.

Public progression uses protocol-visible data first:

- seated members introduced,
- total gross attributed,
- net protocol contribution generated,
- source status,
- abuse/health flags,
- attribution window/cap state.

Retention/quality may become an input later only when it is objectively
measurable. Until then it is a read-model signal, not a payout gate.

## 7. Public Attribution Scope

Public member introductions are not first-purchase-only by default.

Recommended public scope:

- applies to repeat purchases from the referred buyer,
- expires after 12 months by default,
- stops once the per-buyer gross cap is reached,
- requires the referrer to remain seated at payout time,
- stops when the source is paused or revoked.

Recommended defaults:

- attribution window: 12 months,
- per-buyer gross cap: 10,000 USDC,
- public source gross cap may be set by tier or protocol policy,
- public maximum automatic rate: 12%,
- public rate above 12% requires founder/operator review.

`Chapter Source` at 15% must require review even though the progression
threshold is automatic. This keeps large public sources from silently becoming
institutional representatives.

## 8. Founder / Operator Source Policy Actions

Founder/operator actions are exceptions, not the default operating mode. They
exist for real-world relationships such as a YouTuber, agency, partner,
institution, business-development channel, campaign, or payout-wallet recovery.

Every action must emit an event and be visible to Activity/Register readers.

Founder/operator may set or modify:

- source class,
- commission bps,
- scope,
- attribution window,
- gross cap,
- per-buyer cap,
- payout wallet,
- metadata hash,
- status: ACTIVE / PAUSED / REVOKED.

No hidden manual payouts. No off-chain source changes that affect money.

Approved source policy:

- approved source terms may go up to 30%,
- 30% is an absolute V3 cap,
- rates above 15% require explicit approved-source class and metadata,
- lifetime/custom scopes require explicit source policy,
- all custom terms must be visible in receipt reconstruction.

## 9. SourceRegistryV1 Requirements

V3 should use a minimal `SourceRegistryV1` or equivalent source-term module. The
protocol cannot infer "builder", "partner", "institution", or "compromised" from
wallets alone.

Minimal source record:

```text
sourceId
sourceWallet
sourceClass
commissionBps
status
scope
startTime
endTime
grossCap
perBuyerCap
appliesToRepeatPurchases
payoutWallet
metadataHash
createdBy
updatedAt
```

Required statuses:

- ACTIVE
- PAUSED
- REVOKED

Required scopes:

- FIRST_PURCHASE
- WINDOWED
- CAPPED
- LIFETIME
- CUSTOM

Required events:

- `SourceCreated`
- `SourceTermsUpdated`
- `SourceStatusChanged`
- `SourcePayoutWalletUpdated`
- `SourceCapReached`
- `SourceAttributionLinked`
- `SourceAttributionExpired`

The registry stores money terms and policy state. Rich prose and legal context
belong in docs or metadata referenced by hash.

## 10. MembershipSaleV3 Requirements

`MembershipSaleV3` should be the first Solidity contract written after this
spec is approved.

Minimum requirements:

- deterministic era pricing,
- quote function,
- buy function,
- acquisition-first routing,
- source validation,
- repeat-purchase attribution,
- conservation math,
- max acquisition cap enforcement,
- pause,
- Holder Index compatibility,
- V1/V2/V2b migration posture,
- rich receipt event.

V3 should not begin by deploying a standalone commission router. The existing
`CommissionRouterV1` is Operations-slice-only and is strategically superseded
if acquisition-first V3 proceeds.

## 11. Attribution Rules

V3 must freeze these rules before Solidity:

- no source/referrer: acquisition cost is zero,
- self-referral is blocked,
- public referrer must be seated,
- public referrer must remain seated at payout time,
- unseated referrer is rejected or ignored with zero acquisition cost,
- paused/revoked source cannot receive new attribution,
- approved source scope controls first purchase, repeat purchases, window, cap,
  and lifetime/custom behavior,
- repeat purchases count only while source terms remain valid,
- per-buyer cap stops commission for that buyer,
- gross cap stops commission for that source,
- purchase must never revert only because a non-critical notification/read-model
  would fail,
- money movement must be atomic and reconstructable from the receipt.

## 12. Wallet Compromise Policy

V3 does not promise full wallet recovery.

Minimum protection:

- public referrer must remain seated,
- source can be paused or revoked,
- approved payout wallet can be updated by visible policy action,
- payout-wallet update must emit an event,
- compromised source status should downgrade to PAUSED until reviewed,
- existing historical attribution remains visible,
- future SeatRecord721 / wallet migration policy handles durable identity
  continuity later.

SYN remains the live seat truth. Holder Index remains the historical identity
truth. SeatRecord721 must not be used as a shortcut before its policy is frozen.

## 13. Receipt / Event Schema

Human receipt must reconstruct every purchase:

- gross USDC,
- acquisition cost,
- protocol contribution,
- Vault amount,
- Liquidity amount,
- Operations amount,
- SYN delivered,
- era,
- chapter,
- buyer,
- recipient,
- sourceId,
- source class,
- referrer/source wallet,
- commission rate,
- attribution scope,
- window/cap status,
- first seat yes/no,
- transaction proof,
- receipt version.

Recommended technical event:

```solidity
event MembershipPurchasedV3(
    bytes32 indexed receiptId,
    address indexed buyer,
    address indexed recipient,
    uint256 grossUsdc,
    uint256 acquisitionCost,
    uint256 protocolContribution,
    uint256 vaultAmount,
    uint256 liquidityAmount,
    uint256 operationsAmount,
    uint256 synOut,
    uint64 synPerUsdc,
    uint16 era,
    uint16 chapter,
    bytes32 sourceId,
    uint8 sourceClass,
    address referrer,
    uint16 commissionBps,
    uint8 attributionScope,
    uint256 attributionWindowEndsAt,
    uint256 sourceGrossRemaining,
    uint256 buyerGrossRemaining,
    bool firstSeat,
    uint8 receiptVersion
);
```

The exact Solidity type layout may be optimized before implementation, but the
information content is frozen.

## 14. Notification And Read-Model Requirements

V3 events must be rich enough for My Syndicate to later notify:

- someone joined through your introduction,
- commission routed,
- commission escrowed or claimable if a future claim path exists,
- attribution window progress,
- cap reached,
- recognition progression,
- source terms changed,
- source paused or revoked,
- payout wallet updated,
- chapter milestone reached,
- Register / Chronicle / Archive candidate formed.

Notifications are read-models. They must not create money, rights, balances, or
claims without contract truth.

## 15. CommissionRouterV1 Fate

`CommissionRouterV1` is preserved as a reviewed candidate and test reference,
but it should not be the V3 acquisition engine if acquisition-first routing is
approved.

Why:

- it receives only the Operations slice,
- it cannot calculate gross -> acquisition cost -> protocol contribution,
- its count-based money tiers are not the final V3 source policy,
- its claim path should not be exposed as live V3 product state.

Public product surfaces must keep CommissionRouterV1 pending unless it is
separately deployed and activated for a non-V3 purpose.

## 16. What V3 Must Never Become

- no MLM,
- no downline,
- no passive income,
- no yield,
- no hidden manual payouts,
- no fake-live referral balances,
- no fake claim UI,
- no rank as wealth leaderboard,
- no referral as the product,
- no Archive as NFT speculation,
- no SeatRecord721 replacing SYN as the seat.

## 17. Next Solidity Files After Approval

After founder approval, the next coding sprint should create:

- `contracts/src/SourceRegistryV1.sol`
- `contracts/src/MembershipSaleV3.sol`
- `contracts/test/SourceRegistryV1.t.sol`
- `contracts/test/MembershipSaleV3.t.sol`

No Solidity should be written before this spec and the V3 test plan are
accepted.
