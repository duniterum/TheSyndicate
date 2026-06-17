# Sale V2 — Final State Summary (pre-deployment)

> **⚠️ SUPERSEDED — HISTORICAL. This document describes V2a (the pre-deployment plan), not the live protocol.**
> It is a frozen 2026-06-15 snapshot of the V2**a** deploy plan (genesisOffset = 2,
> next seat #3, `V1_MEMBER_ROOT 0xae75…74ff`, count 2). The protocol has since cut
> over to **V2b** (`0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b`, deploy block
> 88,193,183), now the ACTIVE buy target with the MERGED V1∪V2a root
> `0xa1f2…718c49` (count 5). V2a (`0x0b883…2b48`) is PAUSED/SEALED and retained
> only as a historical scan source. **The live `src/lib/syndicate-config.ts` is the
> canonical source of truth — not this doc.**

> Human-readable snapshot of where things stand before the first mainnet signature.
> All on-chain values were read live on **2026-06-15**. Read-only; nothing executed.
> Companion files: `SALE_V2_MAINNET_EXECUTION_PACKAGE.md` (full) and
> `SALE_V2_DEPLOYMENT_QUICK_COMMANDS.md` (copy/paste).

## Where we are

- **V1 is paused and drained.** `V1.paused() == true`, `V1.availableSyn() == 0`,
  and `SYN.balanceOf(V1) == 0`. No further V1 sales can occur. V1 =
  `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` (paused at block 88,087,947).
- **Canonical snapshot is accepted and locked.** The V1 member set was exported at
  the pause block: **2 unique buyers** in first-seen order →
  `0x244531C571966f90f4849e03a507543d90f9C721` and
  `0x3488857b003104e2B08A1D198f8a23BFF28B0045`.
- **genesisOffset = 2.** V2 starts at `memberCount == 2`; the next seat minted is **#3**.
- **V1_MEMBER_ROOT = `0xae75ae2077570c7bd09d95cc142e283cfa73fc9e263c2debf1ba3403457474ff`.**
  Re-derived and re-validated; matches the merkle artifact's `root`.
- **deploy-params.json is canonical and unchanged.** `provisional: false`, git-clean
  (no uncommitted edits since the rehearsal), all wallets/caps as ratified.
- **Rehearsal passed** on a forked mainnet (28/28 read-back checks).
- **Compiler is fixed:** solc 0.8.24, optimizer 200 runs, via_ir, evm_version **paris**
  (production default — the cancun setting was fork-test-only).

## Funding requirement

- **Reserve floor (required before the first buy):** `currentReserveFloor()` =
  **4,099,000 SYN**. The contract deploys holding **0 SYN** and every `buy()` fails
  closed until it holds at least the floor — so deploying first, funding later, is safe.
- **Recommended funding: 5,000,000 SYN** (floor + ~901,500 SYN working buffer). This
  is the founder-approved amount; the bare floor would also work for Genesis at $5/seat.

## Funding source

- **Recovered SYN wallet (founder-controlled):**
  `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` — currently holds **349,997,500 SYN**
  (live read). This **supersedes the earlier 997,500 figure** (the wallet was topped
  up well beyond the V1 sweep), so it alone covers the 5,000,000 SYN funding and is
  the recommended source.
- **Alternative:** the Vault Reserve `0x205DdC8921A4C60106930eE35e1F395c8D13f464`
  holds **250,000,000 SYN**.

## What is NOT a launch blocker (founder-confirmed)

- No external professional audit required for this experimental mainnet MVP.
- EOA owner is acceptable (multisig/Ledger hardening is future, not a blocker).
- No promise / no yield / no ROI / no equity wording — membership only.

## Remaining actions (founder signs every mainnet tx)

1. ~~**Deploy V2** (tx #1)~~ — **DONE** 2026-06-15. SaleV2 = `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48`, block 88095827, deploy tx `0x5f8929…e743f7`.
2. ~~**Verify deploy**~~ — **DONE**. `verify-deploy.mjs` 28/28 + explicit reads all match; source verified (Sourcify `perfect`, Routescan).
3. **Fund 5,000,000 SYN** (tx #2) — from the recovered wallet → deployed Sale V2.
4. **First controlled buy** (tx #3) — fresh non-V1 wallet, $5 USDC → mints member **#3**.
5. **Verify member #3** — `memberCount == 3`, `memberNumberOf(buyer) == 3`, 70/20/10 split, `Purchased` + `Routed` events.
6. **Frontend switch** (separate, not yet) — set `MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS` + `SALE_V2_DEPLOYMENT_BLOCK`, publish the real `public/v1-member-proofs.json` (root `0xae75…74ff`, `pending:false`), then smoke-test and publish.

## Snapshot / proof artifacts (locations)

- `contracts/script/deploy-params.json` — canonical params (tracked).
- `contracts/tools/v1-merkle.json` — root + per-member proofs (gitignored; regenerate via RUNBOOK).
- `contracts/tools/members.json` — 2 V1 buyers, first-seen order (gitignored).
- `contracts/tools/members.snapshot.json` — provenance: V1 addr, blocks 87,157,852 → 88,087,947, scannedAt 2026-06-15 (gitignored).
- `public/v1-member-proofs.json` — published frontend proof artifact (tracked; currently placeholder, publish at the frontend-switch step).
- Regeneration runbook: `contracts/tools/RUNBOOK.md`.

## Bottom line

Everything off-chain is staged and verified. **No blockers.** The protocol is ready
for the deploy → verify → fund → buy sequence on the founder's signal.
