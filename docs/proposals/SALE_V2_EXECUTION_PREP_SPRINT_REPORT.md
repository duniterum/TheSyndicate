# The Syndicate — Sale V2 Execution-Prep Sprint Report

**Type:** Final sprint report (Parts 6–7). Read-only sprint. **No deploy, no fund
movement, no Sale V1 change, no frontend/contract code edited, no architecture or
economics reopened.** The only writes this sprint are documentation (Part 1 fixes
+ Parts 2–5 planning artifacts), this report, and agent memory.

> **Amendment — 2026-06-15 parameter-lock (separate, founder-authorized sprint).**
> The execution-prep sprint described above was docs-only. A *later*,
> founder-authorized **parameter-lock** sprint then set both timelock constants to
> **14 days** in `contracts/src/SyndicateSaleV2.sol` (ruling **F4**) and re-ran the
> full Foundry suite (59 tests GREEN). Every reference below to that contract edit
> (§6.1 constants, §6.2 B4, §6.3 verdict) reflects that amendment — **not** the
> original docs-only scope. No other contract/frontend code was touched.

**Date:** 2026-06-15

---

## Part 6 — Readiness check

### 6.1 What is FINAL (no decision needed)

- **Addresses** (USDC, SYN, Vault 70%, Liquidity 20%, Operations 10%) — live,
  pinned in `src/lib/syndicate-config.ts`.
- **Constants** — `GENESIS_END = 333`, `FINAL_SEAT = 1_000_000`,
  `ROUTER_TIMELOCK = 14 days`, `RECOVERY_TIMELOCK = 14 days`, split `70/20/10`.
- **Referral ladder** — `_tierFor`: `0/5/20/50/100 → 30/40/55/70/80%` of the
  Operations slice (3–8% of gross), carved **only** from Operations. Ratified and
  encoded in `CommissionRouterV1.sol`.
- **Identity hierarchy** — Holder Index (first-seen `TokensPurchased`) is the
  member-identity master; `memberCount`/`memberNumberOf` corroborate only.
  Contract behavior matches: V1-proven members get `knownMember` with
  `memberNumberOf == 0` (no seat consumed).
- **Contract suite** — Foundry tests GREEN. The **2026-06-15 parameter-lock**
  sprint set both timelock constants to **14 days** in
  `contracts/src/SyndicateSaleV2.sol` (F4) and **re-ran the full Foundry suite —
  59 tests GREEN** (21 router + 38 sale); fresh Slither saved at
  `contracts/audit/slither-report-14day.txt`.

### 6.2 Open blockers before deploy (owner = founder / handoff)

| ID | Blocker | Recommendation | Type |
|----|---------|----------------|------|
| B1 | `genesisOffset` + `v1MemberRoot` | Compute from a live V1 snapshot after pausing V1 at #333 | Live data at handoff |
| B2 | `reserveThroughSeat` (F2) | `10_000` (≈3.93M SYN reserve; guarantees Eras II–IV) | Founder ruling |
| B3 | Funding model (F3) | Model B (247,916,875 SYN) | Founder ruling |
| B4 | **`RECOVERY_TIMELOCK` / `ROUTER_TIMELOCK` (F4)** | **RESOLVED — founder ruled 14 days (both)** (no launch multisig → EOA key-risk; a longer detect/stop window). Constants changed 7→14; full Foundry suite (59 tests) re-run GREEN. | ✅ Done (2026-06-15 parameter-lock) |
| B5 | `addrCaps[9]` ramp | Transcribe the 9-value ramp from the treasury sim | Transcription |
| B6 | Multisig address(es) | One multisig owns both contracts | Founder |
| B7 | SYN funding ≥ reserve floor | Fund before opening; top-ups never below the live floor | Ops |

### 6.3 Readiness verdict

**Documentation and execution planning are READY.** Every constructor input is
either FINAL or has a clear owner + recommendation. The protocol can move to
deploy as soon as **B1–B7** clear. **B4** (14-day recovery/router timelock) is
now **RESOLVED** — constants set in `contracts/src/SyndicateSaleV2.sol` and the
full Foundry suite (59 tests) re-run GREEN (2026-06-15 parameter-lock); the
remaining items are live-data / founder rulings / ops, not code.
Frontend is **not** a blocker except for **TD1** (referral truth migration),
which is scoped in the Frontend Wiring Readiness Plan.

---

## Part 7 — Sprint deliverables & summary

### 7.1 Part 1 — DOC contradictions fixed (docs-only)

1. **`members` data source corrected** — `docs/DATA_VERIFICATION_REGISTRY.md`:
   `members` row now reads "`TokensPurchased` first-seen, dedup buyer (Holder
   Index); SYN `Transfer` events are **not** a membership signal" (was "SYN
   `Transfer` event scan"). The runtime mirror
   `src/lib/data-verification-registry.ts` was already correct (derives from
   `MEMBER_DEFINITION`) → **no code change needed**.
2. **Seat-Record identity source made binding** —
   `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md` §5 now states the future member
   number is sourced from the **Holder Index** and **MUST NOT** be minted from
   raw Sale V2 `memberCount`/`memberNumberOf`; §7 forbidden-wording extended to
   match.
3. **Archive ID 2 clarified as pointer-only** —
   `docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md` (table row + prose) and
   `docs/ARCHIVE1155_CANONICAL_ARCHITECTURE.md` (row): ID 2 is a disabled
   pointer/reference to the future ERC-721, **not** an identity source, **not** a
   member key (member identity = Holder Index).
4. **5 historical flat-5% referral docs stamped SUPERSEDED** (referral model
   only), each pointing to the current tiered-router truth:
   `SALE_V2_REFERRAL_{FOUNDER_RECONCILIATION_DECISION_REPORT, LAUNCH_EXECUTION_PLAN,
   DOCTRINE_RECOVERY_AUDIT, PROTOCOL_MEMORY_RECOVERY, ARCHITECTURE_REVIEW}.md`.

### 7.2 Parts 2–5 — planning artifacts created

| Part | File |
|------|------|
| 2 | `docs/proposals/SALE_V2_FINAL_DEPLOY_PARAMETER_SHEET.md` |
| 3 | `docs/proposals/SALE_V2_V1_PROOF_FLOW_PLAN.md` |
| 4 | `docs/proposals/SALE_V2_MAINNET_DIRECT_DEPLOYMENT_RUNBOOK.md` |
| 5 | `docs/proposals/SALE_V2_FRONTEND_WIRING_READINESS_PLAN.md` |

### 7.3 Key facts pinned from production source (not docs)

- **Constructor (exact order):** `usdc, syn, vault, liquidity, operations,
  genesisOffset, v1MemberRoot, addrCaps[9], maxUsdcPerTx, reserveThroughSeat,
  eraCaps[9], initialRouter`.
- **Ownership:** `SyndicateSaleV2` and `CommissionRouterV1` are **both**
  `Ownable2Step` (2-step transfer). Both → multisig.
- **V1 proof path:** `claimV1Membership(proof)` (no funds) + `buy(…, v1Proof[])`;
  `_verifyV1` = OZ `MerkleProof.verify`, standard double-hashed leaf.
- **Zero-funds proof:** P1–P5 validate the entire V1-proof flow with no SYN funded
  and no buyer USDC at risk; funding (≥ reserve floor) only needed from P6.

### 7.4 Scope confirmation (what the *original docs-only* sprint did NOT do)

> Scoped to the original execution-prep sprint. The later **2026-06-15
> parameter-lock** (see the amendment at the top) is the sole exception: it edited
> `contracts/src/SyndicateSaleV2.sol` (F4 timelocks → 14 days) and re-ran Foundry.

- Did not deploy, did not move funds, did not touch Sale V1.
- Did not edit frontend code. *(The original sprint also edited no `.sol` and
  re-ran no Foundry; the 2026-06-15 parameter-lock later did both — for F4 only.)*
- Did not reopen architecture, economics, the 70/20/10 split, or referral doctrine
  (the only doctrine-adjacent edits were SUPERSEDED stamps + identity-source
  clarifications that align docs to already-ratified decisions).

### 7.5 Recommended next actions (post-handoff, when authorized)

1. Founder rules B2/B3 (**B4 timelock is RESOLVED** — 14 days set in
   `contracts/src/SyndicateSaleV2.sol`, full Foundry suite re-run GREEN).
2. Pause V1 → snapshot → compute B1 (`genesisOffset`, `v1MemberRoot`) + publish proofs.
3. Transcribe B5 (`addrCaps`), prepare B6 (multisig).
4. Execute the Mainnet-Direct Runbook (router → sale → P1–P5 zero-funds proof →
   fund → open).
5. Migrate TD1 (referral truth) before any V2 referral surface is published.
