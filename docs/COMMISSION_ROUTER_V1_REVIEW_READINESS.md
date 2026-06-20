# CommissionRouterV1 Review Readiness

Status: REVIEW READY / NOT DEPLOYED / NOT LIVE

This packet summarizes the actual repository truth for `CommissionRouterV1`.
It is not a deployment approval. It is the checklist for deciding whether a
serious audit and deployment process can begin.

## 1. Contract Purpose

`contracts/src/CommissionRouterV1.sol` is the production-candidate referral
commission router for the Membership Sale V2 path.

It does one thing: when an allow-listed sale contract calls `route`, it receives
only the Operations slice of a membership sale, pays a valid referrer from that
slice, forwards the remaining Operations amount to the source Operations wallet,
and emits the canonical `Attribution` event for future indexers.

It does not sell SYN, mint seats, mint NFTs, assign reputation, assign ranks,
compute retention, touch the Vault slice, or touch the Liquidity slice.

## 2. Exact Payment Source

Referral commission is carved only from the Operations slice.

The Membership Sale computes:

- 70% Vault
- 20% Liquidity
- 10% Operations

Vault and Liquidity are paid before the router call. The router pulls exactly
`opsSlice` from the sale and splits that 10% Operations slice between:

- the referrer, when eligible
- the governance-configured Operations wallet

At the maximum tier, referral is 80% of the Operations slice, which is 8% of
gross sale amount. It is not 80% of gross.

## 3. Who Can Call It

Only an allow-listed source can call `route`.

The owner calls `addSource(caller, sourceId, operationsWallet)`. The caller is
expected to be a sale contract that implements `knownMember(address)`. The
router re-validates referrer eligibility against the calling source.

Unauthorized callers revert with `NotAuthorizedSource`.

## 4. Referral Percent Model

The actual contract implements a tiered, count-only model:

| Tier | Name | Verified referred count | Percent of Operations slice | Approx. gross share |
| --- | --- | ---: | ---: | ---: |
| 0 | Signal | 0+ | 30% | 3.0% |
| 1 | Advocate | 5+ | 40% | 4.0% |
| 2 | Connector | 20+ | 55% | 5.5% |
| 3 | Catalyst | 50+ | 70% | 7.0% |
| 4 | Ambassador | 100+ | 80% | 8.0% |

This is not a flat 5% router. Any product copy that implies a default flat 5%
commission would conflict with repository truth.

`referredCount` increments only when the referral is valid and the purchase is a
first-seat event. Commission can still be paid on later eligible purchases by
the same referred member, but those later purchases do not farm the count axis.

## 5. Vault and Liquidity Isolation

The router cannot reduce Vault or Liquidity routing in the intended sale flow.
The sale pays those slices before the router call. The router only receives and
routes the Operations slice.

The router also checks:

`vaultAmount + liquidityAmount + opsSlice == gross`

If the source payload does not reconstruct gross, `route` reverts with
`SplitMismatch`.

## 6. Failure Modes

Expected failure behavior:

- invalid referrer: referrer receives 0, Operations receives the full Operations slice
- self-referral: ignored
- unknown referrer: ignored
- unauthorized caller: reverts
- malformed split payload: reverts
- referrer transfer failure: commission is escrowed for later claim
- empty claim: reverts
- router unset or router call reverts in Sale V2: sale falls back to sending the
  full Operations slice to Operations and the buy is not blocked

The buyer-facing invariant is important: referral should never brick a
membership purchase.

## 7. Security Assumptions

The current contract assumes:

- the source sale is trustworthy and allow-listed by governance
- the source sale implements `knownMember(address)` truthfully
- the owner key is protected, because owner controls source authorization
- the Operations wallet passed in `addSource` is correct
- Sale V2 has approved the router to pull the Operations slice
- Avalanche native USDC address is correct

OpenZeppelin `SafeERC20`, `Ownable2Step`, and `ReentrancyGuard` are used.

Known static-analysis notes already documented in `contracts/audit/` include a
benign-looking self-call/escrow reentrancy warning, intentional decoupling from
the sale interface, uppercase immutable naming, and timestamp use in Sale V2
timelocks. These still require reviewer sign-off.

## 8. Deployment Parameters

Before any deployment decision, freeze:

- USDC token address
- deployer / initial owner
- intended final owner, ideally hardware wallet or multisig
- sale contract address to allow-list
- `sourceId`, expected to identify Membership Sale V2
- Operations wallet address
- confirmation that Sale V2 Operations wallet and router source Operations wallet match
- post-deploy ownership transfer/acceptance procedure
- frontend registry update plan

Do not deploy with placeholder wallets, provisional source IDs, or unverified
sale/router pairings.

## 9. Events Emitted

Primary indexer event:

- `Attribution`

Supporting events:

- `ReferralEscrowed`
- `ReferralClaimed`
- `ReferredCountIncremented`
- `SourceAdded`
- `SourceRemoved`
- OpenZeppelin ownership transfer events

`Attribution` is the future read-model anchor. It carries source, buyer,
referrer, campaign, refTag, token, gross, tier, splits, payment mode, and
attribution mode.

## 10. Frontend Read-Only Integration Plan

Read-only frontend integration can come before any live referral action UI, but
only after a verified deployment address exists.

Safe read-only surfaces:

- contract registry: `COMMISSION_ROUTER_V1` moves from `PENDING` to `LIVE`
- referral route status: deployed but write-gated
- source config check: sale allow-listed or not
- tier preview using `tierFor`
- per-wallet count using `referredCount`
- escrow owed using `referralOwed`
- explorer links for verified contract/source

Read-only UI must still say no claim or referral action is available until the
product intentionally enables it.

## 11. Frontend Write / Claim Integration Later

Write paths require a later product/security pass.

Future write surfaces may include:

- referral link or referrer selection during Join
- optional referrer confirmation before buy
- claim flow for escrowed referral commission
- referral history from indexed `Attribution` events

Do not add fake balances, fake claims, fake commissions, or simulated earnings
to production UI.

## 12. Legal and Product Copy Constraints

Referral copy must be attribution-first and protocol-native.

Allowed framing:

- verified introductions
- growth attribution
- Operations-slice commission when live
- read-only pending state
- no referral commission until router is deployed and wired live

Avoid:

- yield language
- ROI language
- affiliate-marketing hype
- guaranteed rewards
- claims before escrow is read live
- flat 5% claims unless the contract is changed to actually implement that

## 13. Foundry Test Coverage

Existing test coverage is strong for:

- source allow-listing
- split mismatch
- no referrer
- self-referral
- unknown referrer
- tier ladder boundaries
- first-seat-only count increments
- push/escrow/claim
- empty/double claims
- `pushReferral` only-self guard
- RAL reconstruction
- fuzz conservation
- Sale V2 router integration/fallback/timelock behavior

Recommended coverage additions before deployment:

- explicit ABI parity test for `CommissionRouteInput` between Sale V2 and router
- stronger invariant that router-held USDC equals total `referralOwed`
- owner/source lifecycle edge cases after remove/re-add
- sale integration test for each tier, not only Signal/early tier
- fork rehearsal against Avalanche USDC behavior if practical
- static-analysis sign-off for each Slither note

## 14. Audit Checklist

Reviewer should verify:

- no Vault/Liquidity dilution path exists
- only Operations slice is pulled
- source allow-list cannot be bypassed
- referrer eligibility depends on the calling sale
- `referredCount` cannot be farmed by repeat buys
- every external token movement uses SafeERC20
- escrow accounting cannot be drained or stranded unexpectedly
- router failure cannot block buy flow
- Sale V2 approval lifecycle correctly moves to the active router
- owner authority cannot redirect Vault/Liquidity
- events carry enough data for Activity, Chronicle, Register, and future RAL indexing
- deployment runbook prevents wrong source/wallet/snapshot configuration

## 15. Reasons Not To Deploy Yet

The contract is not ready for deployment until:

- independent line-by-line review is complete
- static-analysis notes are signed off
- deployment parameters are frozen
- source/wallet equality checks are rehearsed
- owner model is explicitly accepted
- legal/product referral copy is approved
- frontend remains read-only until a deliberate activation step
- a rollback/disable plan is written and tested

Conclusion: CommissionRouterV1 is ready for serious review. It is not ready for
mainnet deployment or live frontend wiring yet.

## 16. Model Evaluation

The tier ladder is acceptable for review because it is count-only, bounded by
the Operations slice, and does not depend on SYN balance, wealth, yield, or
governance rights. The maximum tier routes 8% of gross to a referrer, which is
material but still constitutionally bounded because Vault and Liquidity are paid
in full before the router receives anything.

The risk is not arithmetic. The risk is product framing. Public copy must avoid
affiliate hype and must not present tiers as passive income, ROI, rank ownership,
or guaranteed payout. The safest public framing is:

- verified introduction
- growth attribution
- Operations-slice commission only if live
- future lineage / Builder Record input

If legal or founder review decides 8% of gross feels too aggressive, the better
next step is to alter the tier table before audit, not to patch copy around it.

## 17. Owner Model Options

Options before deployment:

- Founder/admin EOA: simplest, but highest key-risk.
- Hardware wallet EOA: still single signer, materially safer custody.
- Multisig: strongest operational control, but slower and requires signer setup.

Recommendation before any live router: use at least a hardware wallet. A multisig
is preferable before public referral activation.

## 18. Static Analysis Follow-Up

Before audit/deployment, each saved Slither note should be dispositioned:

- self-call escrow reentrancy note
- timestamp use in Sale V2 timelocks
- missing-inheritance/interface decoupling
- uppercase immutable naming
- OpenZeppelin pragma / low-level-call notes

Do not deploy with undocumented static-analysis warnings.

## 19. Fork Rehearsal Requirement

Run a fork rehearsal against Avalanche C-Chain with native USDC behavior before
deployment. The rehearsal should include:

- no-referrer buy
- tier-0 referred buy
- invalid/self-referrer buy
- router fallback
- source config reads
- escrow simulation if practical
- explorer/source verification checks
