---
name: V2b snapshot tooling RPC topology
description: which Avalanche RPC the contracts/tools snapshot pipeline needs and why the pinned historical read fails on public nodes
---

# V2b snapshot tooling — RPC requirements

`contracts/tools/export-members-merged.mjs` does two RPC workloads in ONE viem client:
1. heavy `getLogs` over the full V1 range (~930k blocks, ~500 chunks) + V2a range, and
2. a **pinned historical** `memberCount` read (`eth_call` at `SNAPSHOT_BLOCK`, the pause block) — the fail-closed cross-check. This needs an RPC that serves historical STATE, not just logs.

**Public RPC reality (observed 2026-06):**
- `rpc.ankr.com/avalanche` — now returns `-32000 Unauthorized: needs API key`. Dead for anon use.
- `avalanche-c-chain-rpc.publicnode.com` — serves `getLogs` fine + fast, but is **pruned**: historical `eth_call` at a non-recent block → `-32000 missing trie node ... state is not available`.
- `api.avax.network/ext/bc/C/rpc` — serves BOTH historical `eth_call` and `getLogs`, but rate-limits (429) under the heavy ~500-chunk scan.

**The working combo:** `RPC_URLS="https://avalanche-c-chain-rpc.publicnode.com,https://api.avax.network/ext/bc/C/rpc"`.
viem `fallback()` **does** pass publicnode's `-32000` (pruned/missing-trie-node) through to the next transport (verified), so getLogs runs fast on publicnode and the pinned historical read falls through to api.avax.network. Putting api.avax.network *first* invites 429s across the long V1 scan.

**Why:** the head dry-run / pause-block snapshot fails on the very last step (the pinned `memberCount` read) if the only RPCs are pruned/keyed, even though the scan itself succeeds.

**Do NOT** weaken the guard by editing the read to `"latest"` just because pause freezes `memberCount` — keep the block-pinned read; just feed it a historical-state RPC.

**Fork rehearsal** (`RehearsalForkV2b`, `forge test`) and the `EXPECT_*` deploy dry-run need an **archive** RPC (`AVAX_RPC=...`) + `--evm-version cancun` on the CLI, and forge OOMs in-container — run them in a forge-capable env, not here.
