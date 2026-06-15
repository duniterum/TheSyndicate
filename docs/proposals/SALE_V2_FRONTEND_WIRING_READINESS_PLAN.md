# The Syndicate — Sale V2 Frontend Wiring Readiness Plan

**Type:** Execution-prep PLANNING ARTIFACT. Read-only. **No frontend code is
edited by this sprint.** This plan inventories every frontend change Sale V2 will
require, classifies each by WHEN it is safe to do, and flags the one truth-debt
item that must be corrected before any V2-referral surface is published.

**Doctrine guardrails that constrain all wiring:**
- **Holder Index stays the identity master** (first-seen `TokensPurchased`). The
  sale's `memberCount` / `memberNumberOf` is corroboration, never identity.
- **Every public claim maps to an on-chain read or is labeled PENDING.** No
  hardcoded LIVE, no placeholder addresses.
- **Referral = tiered** (3–8% of gross via `opsPct` 30–80% of the 10% Operations
  slice). The flat "5% / 3% infra / 2% audit" sub-split is **dead**.

---

## Classification key

- **A — MUST before publishing** any V2-related frontend (truth/safety).
- **B — AFTER deploy** (needs the real addresses / ABIs / proofs to exist).
- **C — FUTURE / optional** (nice-to-have or depends on unbuilt contracts).

---

## A. MUST before publishing any V2 referral surface (truth debt)

| Item | Where | Why |
|------|-------|-----|
| **TD1 — referral copy + diagram migration** | `src/lib/preview/referral.ts` (`SPLIT_LEGEND`, tier data), `SplitVisualizer`, `ReferralPreview`, the `/referral` route | These still describe the legacy **flat 5% / 3% infra / 2% audit** model. Current truth is the tiered ladder carved **only** from the 10% Operations slice. Any published referral page must show the tier table (Signal/Advocate/Connector/Catalyst/Ambassador → 3/4/5.5/7/8% of gross) and must **not** imply infra/audit sub-splits or that Vault/Liquidity are touched. |
| Legal/disclosure alignment | referral disclosure copy | Must match the tiered model and keep the "utility, not yield/ROI" framing. |

> TD1 is **copy + diagram truth**, not payout wiring. It can be migrated
> independently of deploy. Until it is corrected, do **not** publish any V2
> referral page. (Editing these files is explicitly OUT of this docs-only sprint.)

## B. AFTER deploy — wire to real on-chain artifacts

| Item | Where | Notes |
|------|-------|-------|
| Register contracts | `CONTRACT_REGISTRY` (`src/lib/…`) | Add `SyndicateSaleV2` + `CommissionRouterV1` as PENDING (`address: null`) now is allowed; flip to LIVE with real addresses after deploy. |
| ABIs | `src/lib/sale-v2-abi.ts`, `src/lib/commission-router-abi.ts` (new) | Reference from `CONTRACT_REGISTRY.abiSource`. Read-only reads first. |
| Buy flow signature | buy UI / hooks | V2 `buy(usdcIn, referrer, minSynOut, v1Proof[])` adds **slippage floor** (`minSynOut`) and **V1 proof** + **referrer** args vs the V1 buy. Point the UI at V2 only after read tests pass. |
| V1 proof generation | new client util | Generate a connected wallet's Merkle proof from the **published V1 member tree** to pass into `buy()` / `claimV1Membership()`. |
| Member recognition banner | cockpit / buy page | If `knownMember == true` but `memberNumberOf == 0`, surface "recognized V1 member" (identity from Holder Index, not a new seat). |
| Live sale reads | sale surfaces | `nextSeatNumber()`, `currentReserveFloor()`, `sellableSynForNextSeat()`, era + `eraCaps` progress, `MAX_USDC_PER_TX`, per-era `addrCaps`. |
| Attribution / referral reads | referral surface | `tierFor(count)`, `quoteCommission(referrer, opsSlice)`, `referredCount(addr)`; show tier from on-chain count, never hardcoded. |
| Data verification rows | `DATA_VERIFICATION_REGISTRY.md` + `src/lib/data-verification-registry.ts` | Add Sale V2 metric rows (kept in lockstep, doc ↔ runtime). |
| Status labels | sale status / `DEMO_MODE` | Flip V1→V2 only after independent reads confirm LIVE. |

## C. FUTURE / optional

| Item | Depends on |
|------|------------|
| Seat Record surfaces (member-number certificate) | `SyndicateSeatRecord721` (PENDING/unbuilt). Until then keep `PENDING NFT CONTRACT`. **Member numbers, when built, are sourced from the Holder Index — never from raw `memberCount`/`memberNumberOf`.** |
| Reputation / Builder-Record reads off `Attribution` | downstream read-models (future) |
| Buyer-override attribution mode (`attributionMode = 1`) | reserved in the contract; not wired |

---

## Cutover ordering (safe path)

1. **A (TD1)** — correct referral truth (copy + diagram). Independent of deploy.
2. Deploy (router → sale) per the Mainnet-Direct Runbook.
3. **B** — register addresses + ABIs, wire **read-only** surfaces, verify against
   on-chain reads, then enable write paths (buy / claim / referral) last.
4. Flip status labels to LIVE only after independent reads confirm it.
5. **C** — defer; gate behind the contracts/read-models that don't exist yet.

## Readiness verdict

Frontend is **NOT blocked** on this sprint. The only hard pre-publish gate is
**TD1** (referral truth migration), which is a clearly-scoped copy/diagram change
to be done when authorized. Everything else is after-deploy wiring that depends on
artifacts that do not yet exist.
