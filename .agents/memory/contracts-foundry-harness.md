---
name: contracts/ Foundry harness
description: How the isolated Solidity (Foundry) project for Sale V2 + CommissionRouter V1 is set up, its env quirks, and the hardening-scope boundary.
---

# contracts/ Foundry harness (Sale V2 + CommissionRouter V1)

An **isolated** Foundry project lives at `contracts/`, separate from the TanStack TS app. It holds the
**production-candidate** Solidity hardened from the frozen architecture drafts. The drafts stay
byte-identical at `docs/proposals/drafts/*.draft.sol` (embedded byte-for-byte in
`docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` §L/§R) — the production `contracts/src/`
files are NEW, never edits of the drafts.

## Environment quirks (not derivable from code)
- Foundry is installed under `/home/runner/workspace/.config/.foundry`, NOT the default `~/.foundry`.
  Per shell: `export PATH="/home/runner/workspace/.config/.foundry/bin:$PATH"` and
  `export FOUNDRY_DIR=/home/runner/workspace/.config/.foundry`. **Writing `.bashrc` is denied** here,
  so this must be re-exported each shell (or prefixed per command).
- Slither: `pip install slither-analyzer solc-select`; `solc-select install 0.8.24 && solc-select use 0.8.24`
  (binary at `/home/runner/workspace/.pythonlibs/bin`). Run `slither .` from `contracts/`.
- **`via_ir = true` is REQUIRED** in foundry.toml — `buy()` overflows the legacy stack
  ("stack too deep") without the IR pipeline. evm pinned to `paris` (conservative for Avalanche
  C-Chain), optimizer runs=200, solc 0.8.24, OZ v5.1.0 + forge-std vendored under `lib/`.
- The production `vite build` of the TS app OOMs (separate, documented quirk) — but `forge build`/
  `forge test` in `contracts/` are unaffected and fast (<1s).

## Hardening scope (frozen — the ONLY permitted diffs vs the drafts)
1. Placeholder primitives → audited OZ v5.1.0 (`SafeERC20`+`forceApprove`, `Ownable2Step`,
   `ReentrancyGuard`, sale also `Pausable`+`MerkleProof`).
2. Merkle V1 recognition via OZ `MerkleProof.verify` over a **double-hashed leaf**
   `keccak256(bytes.concat(keccak256(abi.encode(addr))))` — this is EXACTLY
   `@openzeppelin/merkle-tree` `StandardMerkleTree` leaf encoding `["address"]`, so the off-chain
   root/proof generator (`contracts/tools/gen-v1-root.mjs`) MUST use StandardMerkleTree to match
   on-chain verify. The leaf formula is asserted in both the tool and the test suite to stay locked.
3. Router input-integrity guard: `vaultAmount + liquidityAmount + opsSlice == gross` → revert
   `SplitMismatch` (audit finding L5).
NOTHING else changes — economics, referral ladder, era/reserve tables, 70/20/10, doctrine all frozen.

## Known deferred items (DOCUMENT, do not "fix" in the hardening sprint)
- **M1**: router's source-config `operationsWallet` MUST equal the sale's `OPERATIONS` — a
  deploy-config check (tested correct in `test_router_integrationReferralPaid`), not a code bug.
- **M2**: a V1 buyer who omits the proof on `buy()` is issued a fresh seat (double-count) — known
  draft behavior, asserted as-is (`test_buy_v1WithoutProof_getsSeat_M2`).
- `RECOVERY_TIMELOCK`/`ROUTER_TIMELOCK` are now **14 days** in code (founder F4 ruling, 2026-06-15;
  were 7 days). Timelock tests use the dynamic public getters, so the value change needed no test edits.

**Why:** these are governance/deploy-config decisions, not contract correctness — fixing them in
code would exceed the frozen scope or hardcode a governance choice.

## State (as of this sprint)
59 tests pass (21 router + 38 sale, fuzz 512); `forge test --gas-report` clean; Slither: no
high/medium in `src/` (all 30 results informational/OZ-vendored). Architect `evaluate_task` returned
PASS, no severe/blocking issues. UNAUDITED / NOT DEPLOYED — external line-by-line review + independent
audit + forked-mainnet rehearsal + multisig/timelock sign-off still required before any deploy.
