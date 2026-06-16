---
name: V2b snapshot + parameter rehearsal
description: V2b replaces live unaudited V2a — merged-snapshot identity rule, the live V2a $5 Genesis-cap defect, and the Foundry via_ir OOM that blocks fork rehearsal in-container.
---

# V2b snapshot + parameter rehearsal

V2b is the parameter-corrected sale that **replaces the live, unaudited V2a**
(`0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48`). V1 = `0x0020Df30…5842d`.

## Merged-snapshot identity rule (irreversible gate)
**Any V2b snapshot MUST union V1 `TokensPurchased` ∪ V2a `Purchased`**, sort by
`(blockNumber, logIndex)`, dedupe first-seen, number `1..N` — i.e. mirror
`src/lib/activity-hooks.ts` `useLivePurchaseEvents` exactly.
**Why:** reusing V2a's own deploy artifact (offset=2, V1-**only** root from the V1 pause block)
would fail to recognize the 3 V2a members → V2b would **re-issue them seats** = duplicate
identity, the one irreversible mistake.
**How to apply:** the exporter (`contracts/tools/export-members-merged.mjs`) must **fail loud**
before emitting — distinct count == on-chain V2a `memberCount` at the SAME block, every V2a
`firstSeat=true` number == derived first-seen number, every `firstSeat=false` has a strictly
earlier first-seen. Identity comes from `Purchased`; the frontend's extra `Purchased⋈Routed`
join is money-split only, NOT identity (safe to omit in the exporter).

## Live V2a $5 Genesis-cap defect
Live V2a shipped with `addrCaps[0] = $5` (Era I / Genesis per-address cap) — a **defect**: it
blocks every high-conviction Genesis buy (the $10k = 1,000,000 SYN package can't clear a $5 cap).
V2b fixes it to **$25,000** (= `maxUsdcPerTx`, so one address can take a full high-conviction
seat in one tx). The V2b rehearsal params differ from canonical `deploy-params.json` by **exactly
3 fields** (`addrCaps[0]`, `genesisOffset`, `v1MemberRoot`) **+ the `provisional` flag** —
everything else byte-identical.

## Foundry via_ir OOM blocks fork rehearsal in this container
`forge build` (via_ir, required for `buy()`'s stack) **OOM-kills in this container** — no error,
no log, no done-marker, the forge process just vanishes (same cgroup-OOM ceiling as vite build).
So `RehearsalForkV2b.t.sol` is **written and ready but cannot be executed here**; run it in a
higher-memory Foundry env. Gotchas: passing `--evm-version cancun` on the CLI **overrides
foundry.toml `paris` → forces a full rebuild** (invalidates the cache, makes it worse — only add
cancun if a fork actually rejects paris opcodes). `Deploy.s.sol` hardcodes
`vm.readFile("script/deploy-params.json")` and `fs_permissions` only allows that one path, so a
rehearsal params file is **not consumed** unless deliberately copied over it.

## Final-deploy caveat
The rehearsal snapshot is pinned to the **rolling head** (`snapshotBlock` = current). The FINAL
(deploy) snapshot MUST be re-run pinned to the real **V2a pause block** — `genesisOffset` and root
change if any V2a purchase lands before pause. Today's values are a rehearsal, not a deploy artifact.
