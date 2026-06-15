# The Syndicate — Sale V2 Final Launch Gate Report

**Type:** Launch-gate checklist (execution mode). **Read-only.** Not an
architecture report, not a doctrine report, not a roadmap. No new work proposed,
no decisions reopened — this enumerates only the gates that remain between the
**post-Wave-1 state (2026-06-15)** and **"first controlled V2 buy on mainnet."**

**Owner legend:** **Founder** = decision / key / funds / on-chain seal & open ·
**Eng** = code / tooling / transcription / wiring (a future authorized session) ·
**Ops** = execution (deploy broadcast, funding transfer).

---

## 1. REQUIRED BEFORE V1 SEAL

| # | Remaining item | Exact file(s) | Owner | Effort | Blocking |
|---|----------------|---------------|-------|--------|----------|
| 1.1 | Decide to seal V1 and accept the current V1 unique-member count as the **permanent Genesis base** (Model 2 allows a sub-333 seal; V2 then continues Genesis from `count+1`) | on-chain action on live Sale V1 `0x0020Df30…` (`paused` exists → pausable) | Founder | Decision | **YES** |
| 1.2 | Stop new V1 onboarding messaging so the frozen set is final | n/a (comms) | Founder | Decision | No |

> Nothing in the codebase blocks the seal. Everything below this section depends
> on a frozen V1 set; nothing above it does.

---

## 2. REQUIRED BEFORE SNAPSHOT

| # | Remaining item | Exact file(s) | Owner | Effort | Blocking |
|---|----------------|---------------|-------|--------|----------|
| 2.1 | V1 paused at a fixed block (output of §1.1) | live Sale V1 contract | Founder | Small | **YES** |
| 2.2 | Record the final V1 cutoff block and pass it to the export tool for a deterministic snapshot | `contracts/tools/RUNBOOK.md`, `contracts/tools/export-members.mjs` (`V1_TO_BLOCK`) | Ops/Eng | Small | **YES** |

> Snapshot **tooling** is already built and dry-run-validated read-only on live V1
> (fail-closed on a wrong root) — no tooling work remains, only the frozen input.

---

## 3. REQUIRED BEFORE DEPLOYMENT

| # | Remaining item | Exact file(s) | Owner | Effort | Blocking |
|---|----------------|---------------|-------|--------|----------|
| 3.1 | Run the snapshot pipeline on the frozen set → real `members.json` + root + proofs; `validate-snapshot` GREEN. Produces **`genesisOffset`** + **`v1MemberRoot`** | `contracts/tools/{export-members,gen-v1-root,validate-snapshot}.mjs` | Eng/Ops | ~1h | **YES** |
| 3.2 | Fill `deploy-params.json`: `genesisOffset` + `v1MemberRoot` (from 3.1); transcribe **vault/liquidity/operations** split addresses, **`addrCaps[1..8]`** ramp, **`eraCaps[1..8]`** Model B (×1e18), **`maxUsdcPerTx`** — then founder sign-off | `contracts/script/deploy-params.json` ← `docs/proposals/SALE_V2_FINAL_DEPLOY_PARAMETER_SHEET.md`, `…PARAMETER_AND_TREASURY_SIMULATION.md`, `src/lib/syndicate-config.ts` | Eng + Founder | ~1–2h | **YES** |
| 3.3 | Forked-mainnet rehearsal: deploy → `verify-deploy` read-back → fund test SYN → `claimV1Membership` + `buy` on the fork (doctrine requires rehearsal before mainnet) | `contracts/script/Deploy.s.sol`, `contracts/tools/verify-deploy.mjs`, `docs/proposals/SALE_V2_MAINNET_DIRECT_DEPLOYMENT_RUNBOOK.md` | Eng | ~half-day | **YES** |
| 3.4 | Provision deployer **EOA key + RPC** (owner = founder/admin EOA per deploy doctrine; multisig deferred, not a blocker) | environment secret (never committed) | Founder | Small | **YES** |
| 3.5 | Optional final re-run of Foundry (71) + Slither on the final params | `contracts/` | Eng | Small | No |

---

## 4. REQUIRED BEFORE FUNDING

| # | Remaining item | Exact file(s) | Owner | Effort | Blocking |
|---|----------------|---------------|-------|--------|----------|
| 4.1 | Mainnet deploy via `Deploy.s.sol --broadcast --verify` (router forced `0x0`) | `contracts/script/Deploy.s.sol` + filled `deploy-params.json` | Ops | Small | **YES** |
| 4.2 | Accept ownership (`Ownable2Step`) to the owner EOA | on-chain tx (runbook) | Founder | Small | **YES** |
| 4.3 | Run `verify-deploy` read-back against the live deploy: root == artifact root, `GENESIS_OFFSET == memberCount`, token/wallet wiring, `commissionRouter == 0x0` | `contracts/tools/verify-deploy.mjs` | Eng | Small | **YES** |

---

## 5. REQUIRED BEFORE FIRST BUY

| # | Remaining item | Exact file(s) | Owner | Effort | Blocking |
|---|----------------|---------------|-------|--------|----------|
| 5.1 | Fund SYN balance **≥ reserve floor** `_reserveSyn(genesisOffset)` (≈3.93M @ offset 333; higher sub-333) **before** opening, or the first buy reverts | on-chain SYN transfer to the sale | Founder/Ops | Small | **YES** |
| 5.2 | Replace the placeholder proof artifact with the real one (`pending:false`, `root` == on-chain `V1_MEMBER_ROOT`) | `public/v1-member-proofs.json` | Eng | Small | **YES** (V1-member path) |
| 5.3 | Flip V2 live: set `MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS` + `SALE_V2_DEPLOYMENT_BLOCK` (activates indexing + `SALE_V2_LIVE`) | `src/lib/syndicate-config.ts` | Eng | Small | **YES** (on-site path) |
| 5.4 | Wire the V2 buy UI to consume `resolveV1ProofForBuy` + `buildV2BuyArgs` (today these are lib-only — **no component calls them yet**) | buy/checkout surface in `src/components/…` ← `docs/proposals/SALE_V2_FRONTEND_WIRING_READINESS_PLAN.md` | Eng | ~half-day | **YES** (on-site buy only; a raw-contract controlled buy does not need it) |
| 5.5 | Open the sale (activate/unpause) | live Sale V2 contract | Founder | Small | **YES** |
| 5.6 | Controlled first buy: (a) `claimV1Membership(proof)` zero-fund proof smoke, then (b) first minimal funded `buy()` | live Sale V2 contract | Founder | Small | **YES** — this is the milestone |

> **Not a first-buy gate (day-2 hardening):** wiring `CommissionRouterV1`
> (`addSource` + the timelocked router set). Day-one carries no referral by
> design — the full 10% Operations slice goes to the Operations wallet.

---

## Direct answers

**A. If we launch ASAP, the exact next action.**
**Founder pauses Sale V1** to freeze the member set (`paused` exists on V1). It is
the *only* action that unblocks the two genuinely-unknown, deploy-blocking values
(`genesisOffset` + `v1MemberRoot`). The param transcription (§3.2 non-root parts)
and the frontend buy-UI wiring (§5.4) can proceed in parallel and are off the
critical path.

**B. Earliest point V1 can be sealed.**
**Today.** Nothing technical blocks it — the snapshot tooling is built and
validated. The seal is purely a founder go/timing decision plus confirming the
current count is acceptable as the permanent Genesis base (Model 2 allows
sub-333).

**C. Artifacts still missing before generating the real `V1_MEMBER_ROOT`.**
Exactly one **input**: a **frozen V1 member set** (V1 paused, cutoff block fixed).
From it, `export-members → gen-v1-root → validate-snapshot` produce the real
`members.json`, Merkle tree, and proofs. **No new tooling is missing** — only the
frozen input and the artifacts the existing validated tools generate from it.

**D. Values still unknown in `deploy-params.json`.**
- **Genuinely unknown (need the snapshot):** `genesisOffset`, `v1MemberRoot`.
- **Known but not yet transcribed / signed-off (placeholders today):**
  `vault` / `liquidity` / `operations` (live in `syndicate-config.ts`:
  `0x205DdC…`, `0xa9b072…`, `0x5cb579…`); `addrCaps[1..8]` (treasury-sim ramp);
  `eraCaps[1..8]` (Model B: 416,875 / 1,166,500 / 3,333,500 / 6,750,000 /
  11,250,000 / 15,000,000 / 60,000,000 / 150,000,000 ×1e18); `maxUsdcPerTx`
  (param sheet J14).
- **Already correct:** `usdc`, `syn`, `addrCaps[0]=5_000_000`,
  `reserveThroughSeat=10_000`, `eraCaps[0]=0`, `initialRouter` (forced `0x0`).

**E. Can the deploy scripts be executed with placeholder values?**
**No.** The script *compiles and reads the JSON*, but a run with the current
template **reverts** — `eraCaps[1..8]=0` fails the constructor's `BadEraCaps`
check for sellable Eras II–IX (and the `0x0` split addresses / zero root would be
unsafe regardless). It must never be broadcast from placeholders.

**F. Can a complete forked-mainnet rehearsal be run today?**
**Yes — using a *current-state test snapshot*, not the final root.** Fork mainnet,
take a bounded snapshot of today's V1 (`export-members` with `V1_TO_BLOCK=head`)
for a *test* root, transcribe the §3.2 caps, deploy on the fork, fund test SYN,
and exercise `claimV1Membership` + `buy`. The only thing it cannot use is the
**final frozen root** (which doesn't exist until the seal). Prerequisite: caps
transcribed (else `BadEraCaps`) + a fork deployer key. This rehearsal is
recommended and unblocks confidence ahead of the seal.

**G. Current critical path.**
`Seal V1` → `Snapshot (root + genesisOffset)` → `Fill deploy-params` →
`Forked-mainnet rehearsal` → `Mainnet deploy + accept ownership + verify-deploy` →
`Fund SYN ≥ reserve floor` → `Publish real proof artifact + flip SALE_V2_LIVE +
wire buy UI` → `Open sale` → `Controlled first buy`. Everything else
(param transcription, UI wiring, optional Slither re-run) parallelizes off this
chain before the seal.

**H. Single biggest blocker now.**
The **frozen V1 snapshot** — i.e., the founder's decision to **seal V1**. It is
the sole producer of the only two genuinely-unknown deploy-blocking values
(`genesisOffset` + `v1MemberRoot`). It is a decision/ops blocker, not an
engineering one — no code stands in the way.

**I. Launch readiness.**

| Area | Readiness | Why |
|------|-----------|-----|
| Contracts | **~95%** | Sale V2 + Router V1 final; Foundry 71 GREEN; Slither (14-day) done; only a final pre-deploy review remains |
| Frontend | **~70%** | WS1 indexing wired + dormant; WS2 proof **lib** done + tested; V2 buy-UI **not yet consumed** by any component; `SALE_V2_LIVE` flip pending |
| Identity | **~95%** | Holder Index master, frozen, cross-source tested; remaining = bind the real root at deploy |
| Referral | **~90%** | Router V1 final + ratified, 21 tests; remaining = post-deploy `addSource` + timelocked wiring (day-2) |
| Snapshot | **~85%** | Tooling 100% built + validated; the real artifact awaits the frozen input |
| Deployment | **~60%** | Scripts compile + verifier ready; `deploy-params` still template; no rehearsal executed; deployer key pending |
| Operations | **~50%** | Seal, key, funding, open, ownership acceptance, publish — all pending founder/ops execution |
| **Overall** | **~78%** | **Code-complete, execution-pending.** The remaining ~22% is almost entirely founder/ops actions on the critical path, not new engineering |

**J. Final verdict — execution phases remaining before "first controlled V2 buy."**
**Five**, mapping 1:1 to the gate sections above, assuming no new issues:
1. **Seal V1** (freeze the member set).
2. **Snapshot** → real `genesisOffset` + `v1MemberRoot` + proof artifact.
3. **Deploy** (fill params → forked rehearsal → mainnet deploy → verify).
4. **Fund** (SYN ≥ reserve floor) + accept ownership.
5. **First buy** (flip live + publish artifact + wire/open → `claimV1Membership`
   smoke → first controlled funded `buy()`).

Param transcription and buy-UI wiring are **parallel pre-work** that can start
immediately and do not add a phase. **No new code blockers exist** — Wave 1 left
only off-chain artifacts and dormant wiring that a live V2 switches on.
