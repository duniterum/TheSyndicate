# V3 Acquisition Engine Test Plan

Status: V3 QA CHECKLIST / DEPLOYED DIRECT-BUY INFRA / SOURCE RECORDS INACTIVE

This test plan converts `docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md` into
implementation gates. `SourceRegistryV1` and `MembershipSaleV3` are deployed;
MembershipSaleV3 is funded and selected as the frontend direct-buy target with
`ZERO_SOURCE_ID`. Source records, source-aware links, referral/source UI, and
claim UI remain inactive.

Current QA companion:

- `docs/V3_SMART_CONTRACT_QA_READINESS.md`

## 1. Pricing And Chapter Tests

- exact V3 era price schedule matches the constitution table,
- `quote` returns the correct SYN output for each era,
- minimum USDC is enforced for each era,
- chapter mapping remains historical identity and does not control price unless
  explicitly derived from seat range,
- era is recorded in receipts,
- chapter is recorded in receipts,
- no old fixed-price doctrine appears in V3 docs/tests as current V3 truth,
- no admin price switch exists,
- no oracle or market-linked price path exists.

## 2. Acquisition-First Conservation Tests

- no-source purchase: `acquisitionCost == 0`,
- no-source purchase: `protocolContribution == grossUsdc`,
- source purchase: `grossUsdc - acquisitionCost == protocolContribution`,
- `vaultAmount + liquidityAmount + operationsAmount == protocolContribution`,
- `acquisitionCost + vaultAmount + liquidityAmount + operationsAmount == grossUsdc`,
- Vault receives 70% of protocol contribution,
- Liquidity receives 20% of protocol contribution,
- Operations receives 10% of protocol contribution,
- rounding dust is deterministic and assigned by an explicit rule,
- acquisition cost cannot exceed the source cap,
- acquisition cost cannot exceed the V3 absolute cap of 30%.

## 3. Public Referral Tests

- seated member can become a public source,
- unseated referrer is rejected or ignored with zero acquisition cost,
- self-referral is blocked,
- first purchase through public referrer links attribution,
- repeat purchase inside attribution window pays commission,
- repeat purchase after attribution window pays zero commission,
- per-buyer cap stops public commission,
- source gross cap stops public commission,
- public referrer must remain seated at payout time,
- if public referrer loses seat, future commission is blocked,
- paused public source receives no new attribution,
- revoked public source receives no new attribution,
- public automatic rate cannot exceed 12% without review,
- `Reviewed Source Terms` requires review before 15% money terms activate.

## 4. Public Progression Tests

- Initiator threshold activates at first verified seated member introduced,
- Advocate threshold activates at 5 seated members introduced,
- Connector threshold activates at 20 seated members introduced,
- Catalyst threshold activates at 75 seated members introduced,
- Steward threshold activates at 250 seated members introduced,
- Reviewed Source Terms threshold is detected at 1,000 seated members introduced,
- recognition progression emits event or read-model input,
- recognition progression does not itself grant governance, yield, or equity,
- recognition name does not automatically overwrite source terms unless the
  constitution explicitly allows it.

## 5. Founder / Operator Source Policy Tests

- owner/founder can create approved source terms,
- source class is recorded,
- commission bps is recorded,
- scope is recorded,
- attribution window is recorded,
- gross cap is recorded,
- per-buyer cap is recorded,
- payout wallet is recorded,
- metadata hash is recorded,
- source status starts ACTIVE only when explicitly set,
- source update emits `SourceTermsUpdated`,
- source pause emits `SourceStatusChanged`,
- source revoke emits `SourceStatusChanged`,
- payout wallet update emits `SourcePayoutWalletUpdated`,
- non-owner cannot create/change/pause/revoke approved sources,
- setting commission above 30% reverts,
- setting invalid payout wallet reverts,
- changing source terms does not rewrite historical receipts.

## 6. Source Class Tests

- `MEMBER_INTRODUCTION` works autonomously for seated wallets,
- `BUILDER_SOURCE` requires approved source terms,
- `AFFILIATE` requires approved source terms,
- `BD_NETWORK` requires approved source terms,
- `WHITELABEL` requires approved source terms,
- `SPONSORSHIP` requires approved source terms,
- `TREASURY_DEAL` requires approved source terms,
- unsupported source class reverts,
- paused/revoked source class state cannot receive new attribution.

## 7. Wallet Compromise Tests

- source can be paused by policy action,
- source can be revoked by policy action,
- approved payout wallet can be updated by policy action,
- payout wallet update emits event,
- compromised source pause path prevents future commission,
- historical attribution remains readable after pause/revoke,
- public referrer losing seat blocks future commission but does not erase
  history,
- no test implies full wallet recovery is live.

## 7A. Payout Escrow And Smart-Wallet Tests

- direct payout succeeds for a normal EOA payout wallet,
- direct payout succeeds for a passive smart-contract payout wallet,
- blocked payout wallet does not revert the buy,
- blocked payout wallet records `sourceEscrowOwed`,
- Sale V3 USDC balance equals total acquisition escrow owed,
- escrow claim uses the current registry payout wallet,
- escrow claim reverts when nothing is owed,
- failed escrow claim does not affect future purchases,
- no source payout failure can block Vault/Liquidity/Operations/SYN routing.

## 8. Receipt Event Tests

- receipt contains gross USDC,
- receipt contains acquisition cost,
- receipt contains protocol contribution,
- receipt contains Vault amount,
- receipt contains Liquidity amount,
- receipt contains Operations amount,
- receipt contains SYN delivered,
- receipt contains era,
- receipt contains chapter,
- receipt contains buyer,
- receipt contains recipient,
- receipt contains sourceId,
- receipt contains source class,
- receipt contains referrer/source wallet,
- receipt contains commission rate,
- receipt contains attribution scope,
- receipt contains window/cap state,
- receipt contains first-seat yes/no,
- receipt contains receipt version,
- emitted fields reconstruct all money movement,
- emitted fields reconstruct source attribution,
- emitted fields can feed Activity, Register, Chronicle candidates, Archive
  candidates, My Syndicate, and notifications,
- blocked payout wallet emits escrow companion event,
- escrow claim emits claim companion event,
- receipt accounting remains reconstructable when acquisition payout is
  escrowed rather than pushed.

## 9. Migration And Compatibility Tests

- V1 remains historical scan source,
- V2a remains historical scan source,
- V2b remains paused historical proof/recovery boundary,
- V3 does not double-count known members,
- Holder Index can distinguish first-seat purchase from repeat contribution,
- existing SYN holders remain seated,
- SeatRecord721 remains future and is not required for V3 purchase,
- Archive1155 remains memory and is not touched by V3 sale logic,
- CommissionRouterV1 remains pending/superseded unless separately activated.

## 9A. External Review Gates

- fresh Slither is green or dispositioned,
- second static-analysis tool is green or dispositioned,
- V3 fork rehearsal runs against Avalanche RPC,
- deployment parameters are frozen,
- owner/final-owner model is decided,
- legal/product signoff is complete,
- external reviewer/auditor signs off,
- frontend registry remains pending until deployment readback passes.

## 10. Doctrine And Product Guard Tests

- no member-ownership or network-inventory language,
- no passive-return/yield/ROI language,
- no fake referral balances,
- no fake claim UI,
- no old fixed-price V3 doctrine drift,
- no CommissionRouterV1 live drift,
- no rank-as-wealth-leaderboard drift,
- no referral-as-business-model drift,
- no SeatRecord721 replacing SYN as seat,
- no Archive-as-NFT-speculation drift,
- no hidden manual payout path.

## 11. Frontend Integration Tests Later

After Solidity exists:

- Join can quote V3 without a source,
- Join can quote V3 with a valid source,
- Join displays acquisition cost before signature,
- receipt card displays all V3 fields,
- Activity reads V3 receipt event,
- Registry distinguishes V3 from V1/V2a/V2b,
- Referral/source UI remains pending until source records are created, read
  back, and legally approved,
- My Syndicate can show notifications only from verified events/read-models.
