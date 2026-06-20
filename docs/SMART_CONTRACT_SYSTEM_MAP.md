# Smart Contract System Map

Status: CANONICAL RELATIONSHIP REVIEW / NO DEPLOYMENT AUTHORIZED

Last updated: 2026-06-20

This map explains how The Syndicate's current and future contracts relate to
one another. It is a contract-system view, not a deployment approval.

Binding doctrine:

- SYN is the V1 membership seat.
- Membership purchase delivers SYN.
- Holding SYN means a wallet is seated.
- Archive1155 artifacts are protocol memory, not seats.
- SeatRecord721 is future identity-record infrastructure.
- CommissionRouterV1 is future Operations-slice commission infrastructure.
- Referral is verified introduction and growth attribution, not yield.
- Vault and Liquidity routing must remain untouched by referral.

## 1. Contract System Map

```text
SYN ERC-20
  | fixed-supply V1 seat token
  |
Membership Sale V1 -------------\
  | sealed historical events       \
Membership Sale V2a ---------------> Holder Index / Activity / My Syndicate
  | sealed historical events       /
Membership Sale V2b -------------/
  | active buy target
  | routes USDC 70 / 20 / 10
  | transfers SYN to buyer
  | emits purchase + routing events
  |
  +-- future optional call: CommissionRouterV1
        | pulls only the Operations slice if allow-listed
        | emits attribution / escrow / claim events
        | never touches Vault or Liquidity

Archive1155
  | live protocol-memory contract
  | ID 1 public-open
  | ID 3 active/read-gated
  | ID 2 disabled pointer only
  |
Activity / Chronicle / Register / Archive surfaces

SeatRecord721
  | future identity record only
  | not implemented, not deployed, no address
```

## 2. Status Table

| Contract / system | Status | Address source | Current role |
| --- | --- | --- | --- |
| SYN ERC-20 | LIVE | `src/lib/syndicate-config.ts` / `contract-registry.ts` | Fixed-supply membership seat token. |
| Native USDC | LIVE | `src/lib/syndicate-config.ts` / Circle contract | Payment token for sale and Archive mints. |
| Membership Sale V1 | LIVE / SEALED HISTORICAL | `CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS` | Original sale. Paused/closed, scanned for early seats and proof. |
| Membership Sale V2a | LIVE / SEALED HISTORICAL | `MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS` | Superseded sale. Scanned for seats #3-#5 and continuity. |
| Membership Sale V2b | LIVE / ACTIVE / UNAUDITED EARLY | `MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS` | Current self-service buy target. Router unset. |
| Vault wallet | LIVE | `CONTRACTS.VAULT_WALLET` | Receives 70% USDC from sale. EOA, not a programmatic vault contract. |
| Liquidity wallet | LIVE | `CONTRACTS.LIQUIDITY_WALLET` | Receives 20% USDC from sale. Supports LP operations. |
| Operations wallet | LIVE | `CONTRACTS.OPERATIONS_WALLET` | Receives 10% USDC while router is unset or disabled. |
| Trader Joe SYN/USDC LP pair | LIVE | `LP_POOL.pairAddress` | Secondary market access layer. |
| Archive1155 | LIVE | `CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS` | Protocol-memory ERC-1155. |
| CommissionRouterV1 | CANDIDATE / PENDING | `address: null` in `contract-registry.ts` | Future Operations-slice commission router. Not live. |
| SeatRecord721 | FUTURE / RESERVED | `address: null` in `contract-registry.ts` | Future identity record. Not implemented. |
| Programmatic Vault contract | FUTURE / PENDING | No address | Future accounting/automation. Current Vault is a wallet. |

## 3. Dependency Map

### Current live dependencies

- Frontend buy flow writes to Membership Sale V2b.
- Membership Sale V2b depends on:
  - SYN inventory already funded into the sale contract,
  - native USDC allowance from buyer,
  - Vault / Liquidity / Operations wallet addresses fixed at deploy,
  - V1/V2a recognition root and Holder Index continuity.
- Archive mint flows write to Archive1155 and depend on:
  - native USDC allowance,
  - per-ID Archive1155 contract reads,
  - `archive-id-registry.ts` for safe fallback copy.
- Activity depends on:
  - V1 `TokensPurchased`,
  - V2a/V2b `Purchased` + `Routed`,
  - Archive1155 mint/transfer events,
  - LP / wallet / burn reads where available.

### Candidate/future dependencies

- CommissionRouterV1 may only be allow-listed by Sale V2b after deployment,
  source configuration, owner finalization, external review, and frontend
  read-only verification.
- SeatRecord721 must depend on the Holder Index, not replace it.
- Future Archive IDs must depend on live Archive1155 config or future contract
  truth, not static eligibility claims.

## 4. Money-Flow Map

### Current membership buy

```text
Buyer signs exact USDC approval
Buyer signs buy
Sale V2b pulls USDC
Sale V2b sends:
  70% -> Vault wallet
  20% -> Liquidity wallet
  10% -> Operations wallet
Sale V2b transfers SYN to buyer
Receipt records the state change
```

### Future membership buy after CommissionRouter activation

```text
Buyer signs exact USDC approval
Buyer signs buy with optional referrer
Sale V2b pulls USDC
Sale V2b sends:
  70% -> Vault wallet
  20% -> Liquidity wallet
  Operations slice -> CommissionRouterV1

CommissionRouterV1:
  validates allow-listed source
  validates referrer through Sale V2b known-member read
  pays or escrows Operations-slice commission
  forwards remainder to Operations wallet

If router call fails:
  Sale V2b catches the failure
  full Operations slice goes to Operations wallet
  buy continues
```

CommissionRouterV1 must not receive or affect Vault or Liquidity funds.

### Archive mint

```text
Buyer signs exact USDC approval
Buyer signs Archive1155 mint(id, qty)
Archive1155 applies per-ID contract truth
Artifact is minted as protocol memory
```

Archive artifacts do not create seats and do not move membership routing.

## 5. Event / Read-Model Map

| Event source | Events / reads | Consumers |
| --- | --- | --- |
| Sale V1 | `TokensPurchased` | Activity, Holder Index, My Syndicate, Registry proof, historical totals. |
| Sale V2a | `Purchased`, `Routed` | Activity, Holder Index, My Syndicate, Registry proof, historical totals. |
| Sale V2b | `Purchased`, `Routed`, router status reads | Join, receipt, Activity, My Syndicate, Transparency, Registry, Holder Index. |
| CommissionRouterV1 future | `Attribution`, `ReferralEscrowed`, `ReferralClaimed`, `SourceAdded`, `SourceRemoved` | Future Activity, Register, Chronicle candidates, Referral read-only, Member OS. Not scanned live today. |
| Archive1155 | ERC-1155 transfer/mint reads, per-ID config reads | Archive, NFT route, My Archive Preview, Activity, Chronicle candidates, Register memory. |
| SYN ERC-20 | balances, transfers, burns | My Syndicate, members/holders, token, activity, supply line. |
| LP pair | reserves, swaps, LP supply | Token, Liquidity, Activity, Transparency. |
| Vault/Liquidity/Operations wallets | USDC balances and tagged transactions | Transparency, Use of Funds, Activity, protocol health. |
| SeatRecord721 future | future issue/reassign/retire events | Future identity read model, My Syndicate, Register, Chronicle. No live consumer today. |

## 6. Frontend Surface Dependency Map

| Surface | Contract dependencies |
| --- | --- |
| `/` | Registry/config, sale status, SYN, Archive1155, LP, transparency wallets. |
| `/join` | Sale V2b write path, USDC allowance, SYN quote, receipt model, no referral write path. |
| `/my-syndicate` | Holder Index, SYN balance, sale event history, Archive1155 balances, future-system status. |
| `/activity` | V1/V2a/V2b sale events, Archive1155 mints, LP/wallet/burn events. |
| `/archive` and `/nft` | Archive1155 contract reads/writes, Archive ID registry. |
| `/registry` | Contract registry, contract dossiers, Archive1155 status, pending future contracts. |
| `/transparency` | Wallet balances, 70/20/10 doctrine, sale status, LP status, Archive status. |
| `/referral` | `future-referral.ts`, CommissionRouter pending status, no router address, no claim/write UI. |
| Docs / FAQ / Whitepaper / Knowledge Map | Doctrine and status references; must align with registry truth. |

## 7. Contradictions / Risks Found

Resolved in this review:

- `contracts/README.md` still described Sale V2 and CommissionRouterV1 together
  as "not deployed". That was true for the old review stage but conflicts with
  the current active V2b sale. It now separates active V2b from pending router.
- `/registry` contract dossiers listed the original Membership Sale as if it
  were the active sale contract. It now lists V2b as active and V1/V2a as sealed
  historical sources.
- The future SeatRecord721 event namespace described a "seat-record token",
  which could blur SYN-as-seat doctrine. It should remain identity-record
  language only.

Open risks:

- V2b is live but unaudited/early; public copy must keep that trust posture.
- Historical audit docs still contain pre-cutover V2a/V2b planning language.
  They are acceptable as historical records, but should not be used as current
  operator instructions without cross-checking this map and the contract
  registry.
- Labs/legacy components still have justified references to the V1 sale address.
  They must not become public primary proof surfaces for the active buy target.
- CommissionRouter activation introduces indexing, legal, owner-key, and copy
  risk even though its money blast radius is Operations-only.
- SeatRecord721 can easily confuse identity with the membership seat unless it
  stays non-transferability-first and Holder-Index-derived.

## 8. Recommended Expansion Sequence

1. **Keep current product live-truth aligned.**
   - Registry, docs, and Activity must keep active V2b vs sealed V1/V2a clear.

2. **Resolve CommissionRouterV1 external blockers.**
   - Fresh Slither.
   - Second static-analysis tool.
   - Fork rehearsal with Avalanche RPC.
   - Owner/final-owner decision.
   - External line-by-line review.
   - Legal/product signoff.

3. **Deploy CommissionRouterV1 only after blockers clear.**
   - Preferred signing path: Remix + MetaMask.
   - No addSource or Sale V2 wiring until deployment readback is clean.

4. **Referral frontend Stage 1: read-only activation.**
   - Add verified router address to registry.
   - Read `sourceConfig`, `tierFor`, `referredCount`, `referralOwed`.
   - No claim UI and no referral-at-buy UI yet.

5. **Referral frontend Stage 2: referral-at-buy.**
   - Only after legal/product approval and read-only state proves stable.
   - Make Operations-slice commission clear.
   - Preserve wallet-signing ceremony.

6. **Referral frontend Stage 3: claim UI.**
   - Only after escrow reads, failure states, and legal copy are reviewed.

7. **SeatRecord721 specification-to-tests.**
   - Do not implement until transferability, secondary-holder policy, metadata
     permanence, and Holder Index reconciliation are frozen.

8. **SeatRecord721 implementation and read-only activation.**
   - Deploy only after tests/audit/review.
   - Add read-only identity record proof before any mint/reassignment action.

9. **Archive future IDs / chapter memory mechanics.**
   - Use Archive1155 live reads and explicit owner-only/reserved states.
   - Do not imply public eligibility without contract truth.

10. **Member OS integration.**
   - Ingest new verified read models after contracts are deployed and indexed.
   - Keep pending surfaces pending until readback proves state.

## 9. Drift Guardrails Needed

- Guard that `/registry` names V2b as active and V1/V2a as historical.
- Guard that `contracts/README.md` no longer says Sale V2 is not deployed.
- Guard that CommissionRouter remains pending/null until a verified address is
  intentionally added.
- Guard that SeatRecord721 copy uses identity-record language and never says it
  is the V1 seat.
- Guard that referral wording stays Operations-slice commission, not rewards,
  yield, passive income, or flat 5%.

## 10. Current Conclusion

The whole system supports safe smart-contract expansion if the sequence stays
disciplined:

- Sale V2b is the active membership path.
- V1 and V2a are historical proof sources.
- Archive1155 is live protocol memory.
- CommissionRouterV1 can fit safely only as an Operations-slice extension after
  external blockers clear.
- SeatRecord721 should wait until identity policy is fully frozen.

No deployment is authorized by this document.
