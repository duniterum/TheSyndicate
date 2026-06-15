# The Syndicate — Sale V2 Mainnet-Direct Deployment Runbook

**Type:** Execution-prep PLANNING ARTIFACT. Read-only. No deploy, no contract
change, no fund movement, no frontend change is performed by this document. It is
the ordered checklist a deployer follows **when authorized** to ship Sale V2
directly to Avalanche C-Chain (43114). Nothing here is executed during this
sprint.

**Scope:** mainnet-direct (no separate testnet rehearsal contract). Safety comes
from the **zero-funds V1-proof checks (P1–P5)** and the **paused-open** sequence,
not from a testnet. For step-level Archive/contract registry + UI wiring hygiene,
this runbook **defers to** `docs/ACTIVATION_RUNBOOK.md` §B/§C (do not duplicate).

**Companion docs:** Final Deploy Parameter Sheet · V1 Proof-Flow Plan · Frontend
Wiring Readiness Plan · `SALE_V2_PROTOCOL_FREEZE_REVIEW.md`.

---

## Phase 0 — Pre-flight gates (all must be GREEN)

- [ ] Foundry suite GREEN on the exact commit being deployed (`forge test`),
      `slither` report reviewed (`contracts/audit/slither-report.txt`).
- [ ] All Parameter-Sheet blockers cleared: F2 `reserveThroughSeat`, F3 funding
      model. **F4 RESOLVED:** founder ruled `RECOVERY_TIMELOCK` = `ROUTER_TIMELOCK`
      = **14 days**; contract changed 7→14 and the full Foundry suite re-ran GREEN.
- [ ] `addrCaps[9]` ramp transcribed and double-checked vs the treasury sim.
- [ ] Multisig address(es) ready for both contracts.
- [ ] Deployer EOA funded with AVAX for gas; hardware-wallet / multisig signer flow rehearsed.
- [ ] Block explorer verification keys ready (Snowtrace / Routescan / Sourcify).

## Phase 1 — Freeze V1 & snapshot

- [ ] **Pause Sale V1** at the Genesis ceiling (target seat #333). Record the block.
- [ ] Export the V1 member set from the **Holder Index** (first-seen
      `TokensPurchased`, dedup buyer). Compute `genesisOffset`.
- [ ] Generate `V1_MEMBER_ROOT` + per-member proofs per `contracts/README.md`.
- [ ] Publish the member list + proofs as an independently-verifiable artifact.

## Phase 2 — Deploy CommissionRouterV1 (first)

- [ ] Deploy `CommissionRouterV1`.
- [ ] **Verify source** on Snowtrace + Routescan + Sourcify.
- [ ] Confirm `tierFor()` returns the ratified ladder (0/5/20/50/100 →
      30/40/55/70/80% of Operations).
- [ ] Transfer ownership to the multisig (`Ownable2Step`: `transferOwnership`
      then multisig `acceptOwnership`).

## Phase 3 — Deploy SyndicateSaleV2 (second)

- [ ] Deploy with the **exact** constructor args from the Parameter Sheet §1
      (re-read the ABI ordering from `contracts/out/` — do not trust this doc's order blindly).
- [ ] **Verify source** on Snowtrace + Routescan + Sourcify.
- [ ] Read-back asserts: `memberCount() == genesisOffset`; `V1_MEMBER_ROOT()`
      matches; `VAULT/LIQUIDITY/OPERATIONS` correct; `MAX_USDC_PER_TX`,
      `RESERVE_THROUGH_SEAT`, `eraCaps`, `addrCaps` all as intended.
- [ ] `router.addSource(saleV2, sourceId, OPERATIONS)` — allow-list the sale.
- [ ] Confirm the sale is **closed/not-yet-open** and **unfunded** at this point.

## Phase 4 — Zero-funds proof of correctness (no inventory yet)

Run **P1–P5** from the V1 Proof-Flow Plan §4:

- [ ] P3 `claimV1Membership(proof)` from a real V1 wallet → `knownMember == true`,
      `memberNumberOf == 0` (no seat consumed).
- [ ] P4 repeat → reverts `AlreadyKnown`.
- [ ] P5 bad proof / non-member → reverts `InvalidProof`.

> If any of P3–P5 fail, **STOP** — the root or leaf-hashing is wrong. Do not fund.

## Phase 5 — Fund inventory & first real seat

- [ ] Transfer SYN to the sale **≥ reserve floor** `_reserveSyn(genesisOffset)`
      (≈3.93M SYN if `reserveThroughSeat = 10_000`). Confirm
      `currentReserveFloor()` / `sellableSynForNextSeat()` read sane.
- [ ] **Open** the sale (un-pause).
- [ ] P7: a new wallet `buy(usdcIn, 0, minSynOut, [])` → seat `genesisOffset + 1`,
      70/20/10 routed (`USDC.balanceOf` deltas on Vault/Liquidity/Operations),
      `Attribution` emitted with `splits` (`uint256[5]` = `[vault, liquidity,
      referrer, operations, protocol]`; referrer = `splits[2]`) correct.
- [ ] P8: a V1 wallet `buy(usdcIn, 0, minSynOut, v1Proof)` recognized in-tx,
      no double-count.
- [ ] Referral path: a buy with a valid `referrer` increments `referredCount` and
      pays the tier commission carved **only** from the Operations slice.

## Phase 6 — Frontend cutover (separate, gated)

- [ ] Update `CONTRACT_REGISTRY` (`address: null` → real) + wire ABIs.
- [ ] Follow `ACTIVATION_RUNBOOK.md` §B steps 4–7 (read-only reads first, write
      paths last) and the **Frontend Wiring Readiness Plan** "MUST-before-publish"
      list (referral copy/diagram truth migration).
- [ ] Flip status/labels only after independent on-chain reads confirm LIVE.

## Emergency controls

- **Pause** halts buys instantly.
- **Recovery-to-Vault** is timelocked (`RECOVERY_TIMELOCK`, 14 days) and
  only sends unsold SYN to the immutable Vault — never to the owner.
- **Router swap** is timelocked (`ROUTER_TIMELOCK`, 14 days).
- Owner has **no** price/split discretion and **no** SYN-to-owner path by design.

## Post-deploy registry hygiene

- Add Sale V2 + CommissionRouterV1 to `CONTRACT_REGISTRY` and
  `DATA_VERIFICATION_REGISTRY.md` with real addresses + verified-source links.
- Keep `SeatRecord721` PENDING (`address: null`) — unrelated and unbuilt.
