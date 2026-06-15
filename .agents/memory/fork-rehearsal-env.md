---
name: Sale V2 forked-mainnet rehearsal env + provisional deploy guard
description: How to actually run a Sale V2 forked-mainnet deploy rehearsal in the Replit sandbox (Avalanche fork quirks, anvil orchestration) and the fail-closed guard that stops a provisional snapshot reaching mainnet.
---

# Forked-mainnet rehearsal env (Sale V2) + provisional deploy guard

## Running the fork rehearsal in the Replit sandbox (each cost multiple attempts)
- **Use an ARCHIVE RPC**: `https://avalanche.drpc.org`. Public load-balanced
  endpoints (`api.avax.network`, `publicnode`) are non-archive → forking fails with
  "missing trie node" / `NotActivated`. Pin the fork block (e.g. `88085000`) for
  determinism.
- **Execute with `--evm-version cancun`** (CLI flag for the fork run ONLY — do NOT
  edit `foundry.toml`; production build + the unit suite stay `paris`). Live Avalanche
  USDC/SYN bytecode uses `PUSH0`; executing it under a `paris` spec reverts
  `NotActivated`. `paris` is a strict subset, so it runs fine under `cancun`.
- **NEVER `pkill -f anvil`** from a bash command — `pkill -f` matches the *running
  shell's own argv* (which contains the string "anvil"), so it SIGTERMs itself →
  exit code 143 with NO output. Kill anvil by the captured `$!` PID instead.
- **Backgrounded anvil is reaped across separate bash tool calls.** Orchestrate the
  whole thing in ONE command: start anvil (`--silent &`, capture PID) → poll
  readiness with `cast block-number` → `forge script Deploy --broadcast` →
  `node verify-deploy.mjs` → `kill $PID`. (`nohup/setsid &` then polling in a later
  call does not survive.)
- `RehearsalFork.t.sol` is self-contained (hardcodes the deploy-params values) and
  **skips cleanly when `AVAX_RPC` is unset**, so the default `forge test` (paris, no
  network) stays green and the fork test only runs on demand.

**Why:** these are sandbox + Avalanche-fork constraints, not code bugs. Trying to
"fix" them in wagmi/foundry config wastes time.

## Provisional-snapshot fail-closed deploy guard
`deploy-params.json` carries a machine flag `"provisional": true`. `Deploy.s.sol`
reads it (`vm.parseJsonBool`) and, BEFORE `vm.startBroadcast()`,
`require(!provisional || vm.envOr("ALLOW_PROVISIONAL_DEPLOY", false))`. So a stray
mainnet `forge script ... --broadcast` reverts (forge simulates first → never
broadcasts) with a regenerate-the-snapshot message.

**Why:** the rehearsal needs *some* `genesisOffset`/`v1MemberRoot`, so a PROVISIONAL
pre-pause snapshot is written into `deploy-params.json`. Without the guard a
fat-finger broadcast would make stale/phantom V1 membership authoritative on-chain
(irreversible). The rehearsal opts in via `ALLOW_PROVISIONAL_DEPLOY=1`.

**How to apply:** after the real V1 pause, regenerate the canonical snapshot from the
pause block, overwrite `genesisOffset`/`v1MemberRoot`, and set `"provisional": false`
— the ONLY way to deploy without the env opt-in. Never set `provisional:false` while
the values are still pre-pause.

## Canonical-pass gotchas (observed during the real V1 seal pass)
- **`verify-deploy.mjs` is cwd-relative.** It `readFileSync("../script/deploy-params.json")`,
  so it MUST run from `contracts/tools/` (`cd tools && SALE_V2=… RPC_URL=… node verify-deploy.mjs`).
  Running it from `contracts/` throws `ENOENT ../script/deploy-params.json` — invocation
  bug, not a deploy failure.
- **`export-members.mjs` over the full V1 range:** point `RPC_URL` at the drpc archive and
  widen `LOG_CHUNK=10000` (the default 2048 = ~454 sequential getLogs over the ~930k-block
  V1 lifetime). Watch stderr for `! getLogs … failed` — any chunk failure silently drops
  logs (sets exitCode=1 but continues); a clean run prints `unique V1 members = N`.
- **Determinism check:** the canonical pause-block snapshot reproduced the earlier
  pre-pause dry-run root EXACTLY (same 2 buyers, no purchases between the dry-run and the
  pause). Identical root is the expected, healthy outcome — not a copy/stale artifact.
- **Once `provisional:false`,** `Deploy.s.sol` broadcasts through the guard with NO
  `ALLOW_PROVISIONAL_DEPLOY` env — that is the proof the gate flipped correctly.
