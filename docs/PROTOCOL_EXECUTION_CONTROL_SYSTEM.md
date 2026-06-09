# Protocol Execution Control System

Status: **CANONICAL · binding**

A lightweight orchestration layer over the existing canonical primitives
(contract-registry, archive-id-registry, chain-registry, wallet-session,
tx-lifecycle, payment-flow, tx-errors, mint-persistence, activation runbook,
sale-flow invariants, wallet-transaction-architecture). Its job is to
**classify every finding** into a severity and a decision outcome so we
never repeat the known-bad failure modes.

This file does **not** introduce new architecture. It binds the existing
primitives into one shippable decision contract.

---

## 1. Severity levels

### BLOCKER

Stops activation, deployment, minting, or release.

- Wrong contract address (mismatch vs `CONTRACT_REGISTRY`)
- Wrong ABI for a deployed contract
- Wrong chain (anything other than Avalanche C-Chain id 43114)
- Missing owner / payout wallet for a live flow
- Transaction revert in the canonical write path
- Activation precondition failed (see `ACTIVATION_RUNBOOK.md`)
- `definitionFrozen === false` when activation requires freeze
- Public mint `active` state contradicts the UI
- Broken write-flow payment path (balance/allowance assessment missing)
- Lost tx hash in a write flow (mint-hash persistence not wired)
- False ownership display
- Fake LIVE / on-chain state for unconfigured ids (e.g. ID 9)
- Financial-rights language anywhere in mint / write surfaces
- Dead in-app success explorer link
- Fake SeatRecord721 address or ABI

### HIGH

Must be fixed before the next release wave. Does not block a read-only
audit, but must not ship.

- Stale UI copy contradicts on-chain state
- Inconsistent wallet-specific CTA
- Raw wallet error exposed to user (must flow through `classifyTxError`)
- Non-canonical explorer helper in a write path
- Missing source label (LIVE / INDEXED / LOCAL / PENDING) on dashboard data
- Read surface bypasses `archive-safe-reads`

### MEDIUM

Scheduled improvement.

- Non-write explorer links not consolidated
- Display-only raw wallet hook
- Optional analytics
- Optional ownership proof card
- Share-card polish
- Doc cross-linking

### LOW

Cosmetic. Never blocks activation.

---

## 2. Decision outcomes

Every finding must resolve into **exactly one** of:

| Outcome                    | When to use                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `EXECUTE_NOW`              | Safe code/doc/test change. No tx, no deploy, no doctrine change. Fixes real mismatch or prevents a known bug. |
| `DEFER`                    | Polish · non-blocking refactor · nice-to-have analytics · extra docs · low-risk display consistency. Log in `DEFERRED_WORK_LEDGER.md`. |
| `ASK_FOUNDER`              | Doctrine · economics · price/supply/wallet-limit · contract architecture · irreversible action · activation/freeze/deploy/signature required. |
| `REQUIRES_ONCHAIN_ACTION`  | `freezeArtifactDefinition` · `setDropActive` · `configureArtifact` · `updateArtifactDefinition` · deploy · owner transfer · `adminMint`. |
| `DO_NOT_DO`                | Guesses an address/ABI/explorer · creates fake LIVE state · duplicates canonical truth · hides missing on-chain data · invents NFT utility/financial rights. |

---

## 3. Current release gates

| Gate                          | Severity if violated | Source of truth                                |
| ----------------------------- | -------------------- | ---------------------------------------------- |
| `contract-registry-complete`  | BLOCKER              | `src/lib/contract-registry.ts`                 |
| `seat-record-721-pending`     | BLOCKER              | `src/lib/contract-registry.ts`                 |
| `archive-id-1-live`           | BLOCKER              | `src/lib/archive-id-registry.ts`               |
| `archive-id-2-reserved`       | BLOCKER              | `src/lib/archive-id-registry.ts`               |
| `archive-id-3-live`           | BLOCKER              | `src/lib/archive-id-registry.ts`               |
| `archive-ids-4-8-not-public`  | BLOCKER              | `src/lib/archive-id-registry.ts`               |
| `archive-id-9-not-configured` | BLOCKER              | `src/lib/archive-id-registry.ts`               |
| `mint-hash-persistence`       | BLOCKER              | `src/lib/__tests__/tx-write-canonical.test.ts` |
| `canonical-explorer-helpers`  | BLOCKER              | `src/lib/chain-registry.ts`                    |
| `no-bare-avascan-tx`          | BLOCKER              | `src/lib/__tests__/explorer-urls.test.ts`      |
| `no-financial-rights-copy`    | BLOCKER              | doctrine                                       |
| `patron-seal-price-5-usdc`    | BLOCKER              | `src/lib/archive-id-registry.ts`               |
| `freeze-before-activate`      | BLOCKER              | `docs/ACTIVATION_RUNBOOK.md`                   |

## 4. Activation gates

Any activation candidate MUST declare:

- `requiresFreeze: boolean` — if true, `definitionFrozen(id)` MUST be `true` before `setDropActive(id, true)`.
- `requiresOwnerSignature: boolean`
- `requiresFounderApproval: boolean`
- `invariants: string[]` — refers to the six write-path invariants in
  `SALE_FLOW_INVARIANTS.md`.

## 5. Invariant names (referenced by gates and tests)

1. `registry-only` — addresses & ABIs come from canonical registries.
2. `freshness-check` — `assertFreshWallet` before every write.
3. `account-pinning` — write uses the wagmi address (not a stale UI prop).
4. `accounts-changed-sync` — UI reacts to `accountsChanged`.
5. `registry-explorer-links` — only `chain-registry.ts` helpers build URLs.
6. `mint-hash-persistence` — `useMintHashPersistence` survives refresh.

## 6. Known blocker categories

| Category                  | Past incident                                       |
| ------------------------- | --------------------------------------------------- |
| `wrong-contract-address`  | n/a (registry-first prevents)                       |
| `wrong-abi`               | `getArtifact` vs `getArtifactCore/Text` mismatch    |
| `dead-explorer-link`      | Bare `avascan.info/tx/`                             |
| `stale-wallet-state`      | First Signal & Patron Seal account-switch bug       |
| `lost-tx-hash-on-refresh` | First Signal then Patron Seal — fixed by persistence|
| `fake-live-state`         | ID 9 leaking "configured" copy                      |
| `wallet-state-as-global`  | Header showing different wallet than write surface  |
| `financial-rights-copy`   | Pre-doctrine "dividend / yield" language            |

## 7. Outcome routing examples

| Finding                                                       | Severity | Outcome                  |
| ------------------------------------------------------------- | -------- | ------------------------ |
| Mint surface forgets `useMintHashPersistence`                 | BLOCKER  | `EXECUTE_NOW`            |
| Raw error string shown to user                                | HIGH     | `EXECUTE_NOW`            |
| Patron Seal price change to 7 USDC                            | n/a      | `ASK_FOUNDER`            |
| Activate ID 4                                                 | n/a      | `REQUIRES_ONCHAIN_ACTION`|
| Invent address for SeatRecord721                              | BLOCKER  | `DO_NOT_DO`              |
| Cleaner ID 1 visual refactor                                  | MEDIUM   | `DEFER`                  |
| Dashboard LIVE/INDEXED/LOCAL label sweep                      | MEDIUM   | `DEFER`                  |

## 8. Runner

The CI-ready runner lives at `scripts/check-execution-gates.mjs`. It exits
non-zero **only** on BLOCKER findings. HIGH/MEDIUM are reported but do not
fail the process — they belong in `DEFERRED_WORK_LEDGER.md` or the next
sprint.
