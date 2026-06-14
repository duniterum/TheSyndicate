# Protocol Freeze Review — Sale V2 + CommissionRouter V1

**Type:** READ-ONLY protocol-wide sanity pass · last gate before implementation begins
**Scope:** Verify the finalized Sale V2 + CommissionRouter V1 architecture does not silently
overwrite any existing Syndicate doctrine, page, module, feature, or roadmap item.
**Sources:** SyndicateSaleV2 draft · CommissionRouterV1 draft · Referral Inventory Report ·
Architecture Report · Reviewer Packet · Audit Report · live `src/` surfaces.
**Status:** No code, contract, economics, or doctrine changed. This document is the only output.

**Headline:** Nothing in the 17 reviewed items is OVERWRITTEN. Every item is either PRESERVED
(unchanged or formalized) or a compatible FUTURE layer. One real reconciliation debt exists: the
referral **preview/UI** still shows the *legacy flat 5% / 3% infra / 2% audit* split, which the
finalized tiered router supersedes — frontend is frozen now, so this is queued for the wiring phase.

---

## 1 — Protocol freeze table (17 items)

| # | Item | State today | Overwritten? | Preserved? | Note |
|---|---|---|---|---|---|
| 1 | Referral ladder | **EXISTS** (preview `referral.ts` `REFERRAL_TIERS`) | No | **Yes — formalized** | Router `_tierFor` encodes the SAME ladder (0/30, 5/40, 20/55, 50/70, 100/80) verbatim; flat 5% becomes tier-0/fallback, not deleted |
| 2 | Reputation layer | **FUTURE** (preview `ReputationLeaderboardPreview`, quarantined, money-weighted) | No | **Yes** | Stays off-chain read-model over RAL events; router computes none. Preview must stay gated until durability-first scorer ships |
| 3 | Builder Records | **FUTURE** (doc/preview refs only) | No | **Yes** | Derived off-chain history over RAL events + `ReferredCountIncremented`; no contract in V1 |
| 4 | Attribution layer (RAL) | **PARTIAL** (spec `docs/REVENUE_ATTRIBUTION_LAYER.md`; router emits event in draft; consumers unbuilt) | No | **Yes** | Router is the single canonical emitter; full event shipped in the design; indexer/read-models are future |
| 5 | Chronicle integration | **EXISTS** (system + public `/chronicle` + institutional register + labs pipeline) | No | **Yes** | Sale V2 emits Activity-class events; Chronicle/Recognition sit above, unchanged. Router events are new candidate inputs, additive |
| 6 | Member profiles | **EXISTS** (`/member/$number`, `/wallet/$address`) | No | **Yes** | Pure holder-index projection; Sale V2 keeps the same identity model |
| 7 | Member numbers | **EXISTS** (holder-index; `memberNumberOf`) | No | **Yes (one caveat)** | Single global sequence preserved via `GENESIS_OFFSET` + `V1_MEMBER_ROOT`. Caveat M2: a V1 buyer with no proof double-counts (indexer-reconciled) |
| 8 | Cockpit | **EXISTS** (`/my-syndicate`) | No | **Yes** | Reads holder-index/events; no dependency the router/sale changes |
| 9 | Referral page | **EXISTS** (`/referral` + `MyReferralCard`/`ReferralCapture`/`ReferralAttributionNote`) | No (but **stale**) | **Partial** | Mechanics survive, but the page/`SplitVisualizer` describe the legacy flat split — reconcile to tiered router + retention-deferral wording at wiring (TD1) |
| 10 | Treasury Ledger | **PARTIAL** (preview `TreasuryLedgerPreview`; `/vault` gated, mock data) | No | **Yes** | 70/20/10 routing unchanged; ledger remains a quarantined preview until real reads exist |
| 11 | Era engine | **EXISTS** (preview `eras.ts`, positional) | No | **Yes — formalized** | Sale V2 `_eraParams` is now the on-chain authority; seat boundaries + entry minimums match `eras.ts` exactly |
| 12 | Chapter engine | **EXISTS** (`chapters.ts`, `/chapters`) | No | **Yes** | Story coordinate system; eras (distribution) overlay it; Sale V2 touches neither chapter data nor copy |
| 13 | SeatRecord721 (future) | **FUTURE** (planned; Artifact≠Seat ruling) | No | **Yes** | Sale V2 issues no NFT; member identity stays indexer-derived → a later SeatRecord721 can mint against the same numbering with no migration of Sale V2 |
| 14 | Marketplace (future) | **FUTURE** | No | **Yes** | No dependency exists today; nothing in Sale V2/router forecloses it |
| 15 | Signal Chamber (future) | **PARTIAL** (Signal engine `protocol-signals.ts` + `/labs/signals`; public "Chamber" future) | No | **Yes** | Signals read EVENTS only; money never raises a person tier — router introduces no violation |
| 16 | AI layer (future) | **PARTIAL** (`/ai`, `api.chat`, `ai-gateway`) exists; deeper layer future | No | **Yes** | Read-only narrator over public truth; unaffected by sale/router |
| 17 | B2B attribution (future) | **FUTURE** (reserved) | No | **Yes** | `source` allow-list + `campaign`/`refTag` reserved fields are the forward hook; activation is a config vote, not a migration |

---

## A — Future modules fully compatible with the finalized design (no change needed)

Reputation, Builder Records, RAL consumers, Chronicle/Recognition, SeatRecord721, Marketplace,
Signal Chamber, AI layer, B2B attribution. All sit **above** the sale/router, read its **events**,
and require nothing the design doesn't already emit. The router's full `Attribution` event is the
single feed that keeps every one of them un-starved.

## B — Modules that require migration later

- **Referral page + split visualizers (TD1)** — copy/diagram migration from flat 5%/3%/2% to the
  tiered router model (referrer 3–8% of gross, Operations remainder; no infra/audit sub-split) +
  the ratified retention-deferral wording. Frontend only; sequenced after contract review/deploy.
- **V1 recognition flow (TD4)** — frontend must always submit the V1 Merkle proof; needs the real
  `V1_MEMBER_ROOT` + a proof service before wiring (mitigates the M2 double-count).

## C — Modules that require NO migration

Era engine, Chapter engine, Member profiles, Member numbers, Cockpit, Chronicle, Treasury routing
(70/20/10), Signal engine, AI layer. They either already match the finalized design or read it via
events/holder-index. The referral **ladder values** themselves need no migration — they are
identical on-chain and in `referral.ts`.

## D — Hidden technical debt

| ID | Debt | Where | Severity | When it bites |
|---|---|---|---|---|
| TD1 | Referral UI describes legacy flat 5% / 3% infra / 2% audit split — contradicts tiered router | `referral.ts` SPLIT_LEGEND, `/referral`, `SplitVisualizer`, `ReferralPreview` | Medium | Frontend wiring |
| TD2 | `ReputationLeaderboardPreview` is money-weighted (`grossCommissionUsdc`) — must stay quarantined until durability-first scorer exists | `src/components/preview/` | Medium | If un-gated prematurely → implies money→reputation |
| TD3 | RAL off-chain consumers (Reputation/Builder/Chronicle-from-router) are unbuilt; event is designed but no indexer/read-model | off-chain layer | Low | When "future layers" are promised as live |
| TD4 | V1 proof-submission flow + real `V1_MEMBER_ROOT` not implemented (M2 double-count) | frontend + deploy config | Medium | Frontend wiring / first V1 re-buy |
| TD5 | Two Operations destinations: `router.operationsWallet` vs sale `OPERATIONS` not forced equal | deploy config (M1) | Medium | Deploy / first referred buy |
| TD6 | Solidity stubs (lightweight IERC20, custom mutex, single-hash Merkle) await OZ swap | both drafts (audit L1/L2/L3) | Medium | Pre-deploy |
| TD7 | `RECOVERY_TIMELOCK` = 7 days in draft vs 14-day recommendation from the treasury sim | `SyndicateSaleV2` const | Low | Param finalization |
| TD8 | `eras.ts` remains positional-preview; on-chain `_eraParams` is the new authority — keep both labeled, don't let preview imply live rates | `eras.ts` + copy | Low | Ongoing canon hygiene |

None of TD1–TD8 is a blocker to *starting* implementation; TD4–TD6 block mainnet deploy / frontend
wiring and are already tracked in the Audit Report and Reviewer Packet.

## E — What should be frozen NOW (before implementation starts)

1. **Economics** — tier ladder, OD-1 (pay every eligible buy / count first-seat only), retention
   deferral, 70/20/10, Operations-only referral. (Already ratified — do not reopen.)
2. **Event shape** — the RAL `Attribution` signature and `CommissionRouteInput` struct (byte-identical
   in both drafts). Any field change here ripples to every future read-model.
3. **Identity model** — single global member sequence, indexer-authoritative, `GENESIS_OFFSET` +
   `V1_MEMBER_ROOT` mechanism.
4. **Trust boundary** — only governance-allow-listed sources call `route`; router swaps timelocked,
   disable instant; owner has no price/split/discretionary-drain power.
5. **Layer separation** — money never raises a person's Signal tier / never confers governance;
   reputation/builder/retention stay off-chain. Keep money-weighted previews quarantined.

## F — Are we ready to move from architecture into implementation?

**Yes.** The architecture is complete and internally consistent, the audit returned PASS WITH FIXES
(no Critical/High), and this freeze pass confirms **zero overwrites** across all 17 items. Everything
outstanding is implementation-phase work (production-hardening the two contracts, then deploy config,
then frontend reconciliation) — not unresolved architecture.

---

## Required outputs

### 1 · Protocol compatibility matrix

| Bucket | Items |
|---|---|
| **Fully compatible — no change** | Era engine, Chapter engine, Member profiles, Member numbers, Cockpit, Chronicle, Treasury routing, Signal engine/Chamber, AI layer, Referral ladder values, SeatRecord721, Marketplace |
| **Compatible — needs later migration (frontend/off-chain only)** | Referral page + split visualizers (TD1), V1 proof flow (TD4), Reputation/Builder/RAL-consumer read-models (TD2/TD3) |
| **Overwritten** | **None** |

### 2 · Technical debt matrix

See section D (TD1–TD8). Buckets: **Frontend reconciliation** = TD1, TD2, TD4, TD8; **Deploy config**
= TD5; **Pre-deploy contract hardening** = TD6, TD7; **Off-chain build-out** = TD3.

### 3 · Remaining founder decisions

| # | Decision | Sale-V2-blocking? |
|---|---|---|
| F1 | Timing of the off-chain Reputation / Builder-Record / retention layer (gates when high tiers carry weight) | No |
| F2 | `RESERVE_THROUGH_SEAT` target — 10,000 (Era II–IV) default vs 1,000,000 (full) | Deploy-time |
| F3 | Funding model — sim recommends Model B (~248M SYN / ~71% of pool) | Deploy-time |
| F4 | `RECOVERY_TIMELOCK` 7 vs 14 days; ROUTER_TIMELOCK confirm | Deploy-time |
| F5 | B2B source allow-list activation (which sources, when) — reserved V3 config vote | No (future) |
| F6 | Architect ($250) vs Steward ($500) rank-order rename (deliberately deferred — governance) | No |

### 4 · Remaining deployment decisions

- Multisig owner address (both contracts) + Ownable2Step accept.
- Final `genesisOffset` + `V1_MEMBER_ROOT` from real V1 data.
- Final `eraCaps` (J13), `addrCaps` (J3), `maxUsdcPerTx` (J14), `reserveThroughSeat` (J16).
- `router.operationsWallet == OPERATIONS` (M1) verified via `sourceConfig()`.
- OZ library swap + double-hashed Merkle leaf (audit L1–L3).
- Forked-mainnet full rehearsal (compensates for skipping Fuji).

### 5 · Final recommendation

**MOVE TO IMPLEMENTATION.**

Begin the line-by-line Solidity review and production-hardening of `SyndicateSaleV2` +
`CommissionRouterV1`. Hold all frontend changes (referral-page reconciliation TD1, V1 proof flow
TD4, retention-deferral wording) until after contract review and deploy, and keep the money-weighted
reputation preview quarantined until the durability-first off-chain layer is built. Freeze the five
items in section E now. No architectural questions remain open.
