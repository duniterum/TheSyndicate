# The Syndicate — Sale V2 + CommissionRouter V1 (Production Solidity)

Isolated [Foundry](https://book.getfoundry.sh/) project holding the **production-candidate**
Solidity for the Sale V2 membership engine and its referral CommissionRouter, hardened from the
frozen architecture drafts.

> **STATUS: UNAUDITED — NOT DEPLOYED.** These contracts must NOT be deployed (mainnet **or**
> testnet) or wired into the frontend until: external line-by-line review → independent audit →
> local/forked-mainnet rehearsal (no Fuji/testnet) → founder/admin EOA owner accepts `Ownable2Step`
> ownership + timelock sign-off (Ledger/multisig recommended as future hardening). See the deployment checklist
> in `docs/proposals/SALE_V2_COMMISSION_ROUTER_V1_REVIEWER_PACKET.md` §7.

## What's here

| Path | Role |
|---|---|
| `src/SyndicateSaleV2.sol` | Production membership sale engine (era table, caps, reserve, 70/20/10, Merkle V1 recognition, timelocked router wiring). |
| `src/CommissionRouterV1.sol` | Production referral router (Operations-slice-only, tier ladder, push/escrow, RAL `Attribution` event). |
| `test/SyndicateSaleV2.t.sol` | 50 tests (incl. fuzz) — constructor validation, buy path, era engine, caps, reserve, Merkle, router glue, pause/recovery, reentrancy. |
| `test/CommissionRouterV1.t.sol` | 21 tests (incl. fuzz) — tier ladder/boundaries, split conservation, H4 guard, source allow-list, push/escrow/claim, full RAL reconstruction. |
| `test/mocks/` | `MockERC20` (configurable decimals), `BlocklistERC20` (USDC-blocklist sim), `MockSource` (allow-listed sale), `RevertingRouter` / `ReentrantRouter` (router fallback + reentrancy). |
| `audit/slither-report.txt` | Saved Slither output (see "Static analysis" below). |
| `tools/gen-v1-root.mjs` | Reproducible `V1_MEMBER_ROOT` (+ per-member proof) generator. |

The **frozen design drafts** remain byte-identical at `docs/proposals/drafts/*.draft.sol` and are NOT
edited by this project. These `src/` files are NEW; they differ from the drafts by the
named, frozen-scope hardening (audited OpenZeppelin primitives, double-hashed Merkle leaf, and the
H4 split-integrity guard) **and by the founder-ratified F4 parameter lock — both
`RECOVERY_TIMELOCK` and `ROUTER_TIMELOCK` are `14 days` here vs the drafts' `7 days`** (a governance
delay only). No economics, referral, era, reserve, or doctrine change.

## Toolchain

- **solc** `0.8.24` (pinned), **evm** `paris` (conservative for Avalanche C-Chain; revisit at deploy).
- **optimizer** on, `runs = 200`, **`via_ir = true`** — `buy()` exceeds the legacy stack limit; the
  IR pipeline resolves it and emits better-optimized bytecode.
- **OpenZeppelin Contracts v5.1.0**, vendored under `lib/openzeppelin-contracts/` (pinned, offline).
- **forge-std** vendored under `lib/forge-std/`.

Config: `foundry.toml`. Fuzz runs default to 512.

## Build & test

```bash
# one-time per shell (Foundry lives outside the default PATH here)
export PATH="/home/runner/workspace/.config/.foundry/bin:$PATH"
export FOUNDRY_DIR=/home/runner/workspace/.config/.foundry

cd contracts
forge build                 # compile
forge test                  # run all 71 tests
forge test --gas-report     # tests + gas table
forge test --match-contract SyndicateSaleV2Test -vvv   # focused, verbose
```

Expected: **71 passed; 0 failed** (21 router + 50 sale).

## Static analysis (Slither)

```bash
pip install slither-analyzer solc-select
solc-select install 0.8.24 && solc-select use 0.8.24
export PATH="/home/runner/workspace/.config/.foundry/bin:$PATH"
cd contracts
slither .                   # full output saved to audit/slither-report.txt
```

Result: **no high/medium severity findings in `src/`.** The latest **post-F4** run (both timelocks
= `14 days`, 2026-06-15 parameter-lock) is saved at `audit/slither-report-14day.txt` — the
authoritative current artifact; `audit/slither-report.txt` is the prior pre-F4 run. All results are informational and either
live in vendored OpenZeppelin (the `^0.8.20` pragma notice, `Address` low-level calls in `SafeERC20`,
unindexed `Pausable` events) or are by-design notes on our code:
- `buy()` cyclomatic complexity — intentional (dual-bound era engine + caps + reserve in one CEI path).
- UPPERCASE immutable names (`USDC`, `VAULT`, …) — deliberate constant-style naming.
- "missing-inheritance" (`CommissionRouterV1` vs `ICommissionRouter`) — intentional: the router is
  decoupled from the sale to avoid a circular import; the `CommissionRouteInput` struct is duplicated
  **byte-for-byte** in both files (verify ABI parity at integration) rather than shared via import.

## Generating `V1_MEMBER_ROOT`

The sale recognizes V1 members via an OpenZeppelin `MerkleProof.verify` over a **double-hashed leaf**:

```
leaf = keccak256(bytes.concat(keccak256(abi.encode(memberAddress))))
```

This is exactly the leaf-hashing used by [`@openzeppelin/merkle-tree`](https://github.com/OpenZeppelin/merkle-tree)
`StandardMerkleTree` with leaf encoding `["address"]`, so the canonical, reproducible generator is:

```bash
# isolated from the main app — install only in this tools dir (or use npx)
cd contracts/tools
npm init -y >/dev/null 2>&1
npm i @openzeppelin/merkle-tree
node gen-v1-root.mjs members.json   # members.json = ["0xabc…", "0xdef…"]
#   -> prints V1_MEMBER_ROOT, writes v1-merkle.json { root, count, proofs, tree }
```

`members.json` is a JSON array of addresses (or a `members.txt` with one address per line).
Addresses are de-duplicated case-insensitively (a duplicate leaf would corrupt proofs). The emitted
`proofs[address]` array is what each member passes to `claimV1Membership(proof)` / `buy(..., v1Proof)`.

The leaf formula is also asserted on-chain by the test suite (`_leaf()` in
`test/SyndicateSaleV2.t.sol`), so the generator and the contract are provably in lockstep.

## Scope guardrails (unchanged in this sprint)

Economics, referral doctrine, era/reserve tables, the 70/20/10 split, and all canon are **frozen**.
SYN funding is a SEPARATE post-review transaction (the constructor does not pull SYN). Owner is the
deployer at construction; the **founder/admin EOA** accepts ownership via the `Ownable2Step` two-step
flow post-deploy (Ledger/multisig recommended as future hardening — an EOA owner is higher-risk; see
the reviewer packet §7a deploy blockers / §7b EOA risk note).
