# THE SYNDICATE — MASTER LEDGER (Handoff)

**Generated:** 2026-06-17 · **Verification basis:** live Avalanche C-Chain reads @ block **88,217,235**, deployed production site `https://thesyndicate.money`, current repo, docs, completed audits.
**Truth order used:** on-chain reads → code/config → docs. Memory was **not** trusted as a source; every economic/contract claim below was re-read from chain.
**Mode:** READ-ONLY status ledger. No protocol code, config, or canon was modified to produce this document.

> **One-line verdict:** The protocol slice (V2b sale / buy flow / proofs / routing / NFT truth / wording / identity layer) is **DONE and chain-verified**. MVP is **promotion-ready**. The remaining work is *product/onboarding/decisions*, not protocol correctness. Highest non-functional risk is **custody** (one EOA owns the live sale and the Archive).

---

## Chain snapshot (the numbers everything else is checked against)

| Read | On-chain value | Verdict |
| --- | --- | --- |
| V2b `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` · `paused` | `false` | **LIVE sale** |
| V2b · `owner` | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` | single EOA |
| V2b · `memberCount` | `8` | next seat = #9 (matches hero) |
| V2b · `totalUsdcRaised` | `$110` | V2b's own slice (site sums all 3 contracts) |
| V2b · `currentEra` | `1` | Genesis / Era I |
| V2b · `commissionRouter` | `0x0000…0000` | **referral not wired on-chain** |
| V2b · `V1_MEMBER_ROOT` | `0xa1f2ed…718c49` | == repo artifact, count 5 → **proof canonical** |
| V2b SYN balance (funding) | `6,989,000 SYN` | ≥ 6.597M floor → **funded** |
| V2a `0x0b883Ff0…2b48` · `paused` | `true` | sealed / history-only (memberCount 5 = #3–#5) |
| V1 `0x0020Df30…842d` · `paused` | `true` | sealed (raised $25) |
| SYN `0xC1Cf19…0170` · `totalSupply` | `1,000,000,000` | fixed 1B |
| SYN burned @ `0x…dEaD` | **`10,000 SYN`** | Proof of Burn (site shows 10,000 — correct) |
| Membership Distribution wallet SYN | `337,997,500 SYN` | reserve for future-era funding |
| Archive1155 `0xB2AE1e…D54d` · `owner` | `0xa2E538…26e2F` | **same EOA as the sale** |
| Archive1155 supply id 1 / 2 / 3 | `11 / 0 / 6` | id 2 (Seat Record) = **LOCKED** ✓ |

> **Reconciliation flag:** older notes/memory say Proof of Burn = 1,000 SYN. **Chain says 10,000 SYN** and the live site already displays 10,000. Treat 10,000 as truth; scrub the stale 1,000 anywhere it survives in docs.

---

## 1. DONE (complete + verified)

| Item | Why it is finished | Verified by |
| --- | --- | --- |
| **V2b deployment** | `paused=false`, era logic live, owner set | chain |
| **V2b funding** | holds 6.989M SYN (> 6.597M floor); dist wallet still holds 337.99M for top-ups | chain |
| **V1 + V2a sealing** | both `paused=true`; scanner unions them as history only | chain |
| **Proof system** | on-chain `V1_MEMBER_ROOT` byte-identical to `public/v1-member-proofs.json` (5 members); buy gate Merkle-verifies every proof | chain + `src/lib/v1-proof.ts` |
| **Referral cleanly absent on-chain** | `commissionRouter=0x0` → buy() never routes/bricks on a missing router | chain |
| **Holder index (master identity)** | union of V1∪V2a∪V2b first-seen; raw sale numbering never used as identity | `src/lib/holder-index.ts` |
| **Carried / fresh / repeat buy paths** | v1-proof buy gate: recognized member fail-closed, fresh buyer carve-out, repeat handled | `LivePurchase.tsx`, `v1-proof.ts` |
| **USDC routing 70/20/10** | single source of truth, membership-sale only | `src/lib/syndicate-config.ts` (`USDC_ROUTING`, `VAULT_ALLOCATION`) |
| **NFT truth corrections** | Archive1155 id1 multi-mint intentional (supply 11, hard cap 10k), id2 Seat Record LOCKED (supply 0), id3 supply 6; no "open edition" lie | chain + `ARCHIVE_CONTRACT_STATE` |
| **Burn truth** | 10,000 SYN at dead address, surfaced as Proof of Burn | chain + live site |
| **Wording cleanup** | doctrine/banlist guards; rank = recognition only; no ROI language | guard tests |
| **Custody transparency** | `/transparency` live: treasury composition, routing flow, live LP read | `src/routes/transparency.tsx` |
| **Purchase #0 fix** | both render sites use `purchaseLabel`; "Purchase #0" unreachable; confirmed in deployed bundle | prod bundle |
| **Onboarding spine** | homepage 5-act journey, single primary Join CTA | `src/routes/index.tsx` |
| **FAQ** | `/faq` searchable, category-filtered | `FaqRebuilt.tsx` |
| **Member cockpit** | `/my-syndicate` flight-deck: identity → place → holdings → next move | `cockpit/MemberCockpit.tsx` |
| **Chapters** | `/chapters` + `/chapters/$slug`, member-number boundaries (I = #1–#333) | `src/lib/chapters.ts` |
| **Ranks (recognition)** | `RANKS_V2`, derived from cumulative USDC, recognition-only | `syndicate-config.ts` |
| **Packages** | project 1:1 from ranks; `/join?amount=` deep-link | `package-catalog.ts`, `join.tsx` |
| **Story/record layer (public)** | `/chronicle`, `/institutional-register`, `/knowledge-map` live and reading from code registries | route files |

---

## 2. PARTLY DONE (architecture + implementation exist; reconciliation / decision / polish remains)

| Item | What's live | What remains |
| --- | --- | --- |
| **Referral system** | off-chain `?ref` attribution capture is live | commission tiers + leaderboard are a **SIMULATED preview** (`/referral`, noindex); `CommissionRouter` contract not built; on-chain `commissionRouter=0x0` |
| **Transparency treasury ledger** | composition, routing, live LP read are live | "Treasury Ledger" block is a **simulated preview** until router/attribution is on-chain |
| **Era system** | Era I (Genesis) live; `currentEra=1` | Eras II–IX are **PROPOSED preview only**; no on-chain era stepping beyond Genesis |
| **SeatRecord721** | panel shell with `PENDING SEAT RECORD CONTRACT` pill on `/join` + `/nft`; id 2 reserved+locked on-chain | contract design / audit / deploy; decision LOCKED to a *separate future ERC-721* (must mint from index, never raw numbering) |
| **Receipts** | shared `SuccessReceipt` wired into buy + mint flows | migrate remaining older success panels to the shared shell |
| **Share flows** | `ShareActions` + `MemberShareCard` live (PNG / X / Telegram / copy) | extend to future artifact cards; tighten post-buy → share handoff |
| **Protocol Lineage** | `/labs/protocol-lineage` works | labs-quarantined; no public nav/route (decide if it graduates) |

---

## 3. NOT DONE (genuinely not built)

| Item | Evidence |
| --- | --- |
| **SeatRecord721 contract** | only a locked architecture decision; on-chain id 2 = reserved/disabled pointer (supply 0) |
| **CommissionRouter (on-chain referral commission)** | `commissionRouter=0x0`; only proposals/doctrine docs exist |
| **Governance / DAO** | no `/governance` route; listed as Pending on the registry |
| **Marketplace / secondary sales** | no routes or components; referenced only as a future system |
| **On-chain Eras II–IX stepping** | `currentEra=1`; later eras are config-only previews |
| **Live treasury ledger data** | currently a simulated preview component |

---

## 4. DEFERRED (intentionally postponed — reason)

| Item | Reason | Revisit when |
| --- | --- | --- |
| Chronicle Phase 2 (entry pipeline + per-entry OG) | Phase 1 must teach before Phase 2 is designed | first real on-chain milestone fires post-launch |
| Playwright / screenshot tests | high-cost; unit + doctrine guards cover regressions now | after next narrative wave |
| Deep-linkable proof-drawer URLs | layer complete for v1; polish | post-v1 chronicle pass |
| Indexer retry/backoff UX, notification routing | acceptable for v1 | after traffic exposes lag |
| Owner-only `adminMint` UI | not user-facing yet | when owner ops need a UI |
| Story Timeline → /labs demotion | not contradicting Chronicle today | after Chronicle Phase 2 |
| ID 9 Protocol Chronicle artifact definition | never claim configured | when Chapter II story locks |

(Source: `docs/DEFERRED_WORK_LEDGER.md` — tactical deferrals.)

---

## 5. FOUNDER DECISIONS REQUIRED (code is waiting on product direction)

1. **Custody model** — single EOA `0xa2E538…` currently owns **both** V2b (live sale) and Archive1155. Decision: migrate to Safe/multisig now vs. EOA→Safe within 30 days (per `SMART_CONTRACT_DECISIONS_PENDING.md` D1/D6). *This is the highest-leverage decision.*
2. **Referral model** — go/no-go on tiered commission; if go, approve `CommissionRouter` minimal-safe architecture (sale already routes the Ops slice; fallback must never brick buy). If no-go, lock the `/referral` preview as clearly-labeled "future."
3. **SeatRecord721 behavior + timing** — confirmed *separate ERC-721, mints from the holder index (proof-gated), never from raw sale numbering.* Open: when to build, trigger model, one-seat enforcement on-chain vs operational.
4. **Era public model** — how Eras II–IX (distribution) are presented publicly alongside Chapters (story); currently preview-only.
5. **Rank ladder naming/ordering** — the Architect ($250) vs Steward ($500) ordering is deliberately deferred as a governance-level rename, not a copy tweak (`WHITEPAPER_EXTRACTION_MAP.md`).
6. **NFT economic params still open** — royalty % (C1) and media license (C5) in `SMART_CONTRACT_DECISIONS_PENDING.md`.

---

## 6. NEXT 5 SPRINTS (small, logical, high-leverage — no rewrites, no broad audits)

**Sprint 1 — Funnel readiness for paid traffic.** Instrument homepage utility rail + Join funnel (analytics events); run a real-wallet end-to-end **mobile** buy smoke on V2b (connect → approve → buy → seat → receipt). No new architecture.

**Sprint 2 — Truth-label sweep (HIGH).** Execute the deferred Dashboard `LIVE / INDEXED / LOCAL` label sweep; reconcile the burn figure to **10,000 SYN** everywhere; confirm "Genesis / Era I" copy matches `currentEra=1`.

**Sprint 3 — Receipt → share loop.** Migrate remaining success panels to `SuccessReceipt`; make post-buy receipt → share-card path seamless (this is the organic loop you're about to pay to fill).

**Sprint 4 — Referral go/no-go.** Founder decision (see §5.2). If go: scope `CommissionRouter` minimal-safe. If defer: make the `/referral` preview's "simulated/future" framing airtight so it can't read as live.

**Sprint 5 — Custody hardening.** Migrate V2b + Archive1155 owner from EOA → Safe/multisig; document signers (per D1/D6). Protects live funds before traffic scales.

---

## 7. PROMOTION READINESS

- **Is the MVP promotion-ready?** **Yes.** The core loop is live and chain-verified: connect → buy SYN on V2b (`paused=false`, funded) → seat recognized via union holder index → cockpit / receipt / share. Legacy contracts sealed; proof root canonical; no open *protocol* blocker.
- **What I'd personally fix before spending on traffic:** (1) real-wallet **mobile** buy smoke; (2) analytics instrumentation so you can actually read the funnel; (3) the HIGH-severity truth-label sweep; (4) custody EOA→Safe given live funds.
- **What I'd intentionally leave for post-MVP:** referral commission (on-chain), SeatRecord721, governance, marketplace, Eras II–IX on-chain stepping, Chronicle Phase 2.

---

## 8. BIGGEST REMAINING RISKS

1. **Custody (highest).** One EOA owns the live sale *and* the Archive — single-key compromise = total loss. Mitigation: Safe/multisig (Sprint 5).
2. **RPC reliability under traffic.** First-load truth depends on a client-side chain scan over public RPCs (`api.avax.network` returns 429 / no-CORS; ankr is the working CORS fallback). Ad traffic could expose rate-limits. Mitigation: a keyed, origin-locked RPC as primary.
3. **Truth drift.** Stale figures survive in memory/old docs (e.g. burn 1,000 vs on-chain 10,000). Always re-read chain; finish the label sweep. Drift directly contradicts the "don't trust, verify" doctrine.
4. **Simulated surfaces.** Referral commission + treasury ledger are previews; if their "future/simulated" framing ever reads as live, it undercuts the protocol's core promise.
5. **Identity permanence gap.** The permanent on-chain identity artifact (SeatRecord721) isn't minted yet — identity is index-derived. Fine for MVP, but minting-from-index (never raw numbering) is the one irreversible gate when it ships.

---

*End of master ledger. This document is the handoff into the next chat. Re-read chain before trusting any number here.*
