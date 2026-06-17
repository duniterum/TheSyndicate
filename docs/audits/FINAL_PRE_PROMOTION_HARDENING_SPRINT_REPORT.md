# Final Pre-Promotion Hardening Sprint — Founder Report

**Protocol:** The Syndicate — Avalanche C-Chain (43114) USDC → SYN membership sale
**Live sale:** Sale **V2b** `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b`
**Scope (strict):** verify truth · confirm buy UX · clean public/legal wording · doctrine harmony · lock docs/memory against drift · validate. **No** contract/ABI changes, **no** redesign, **no** new referral/NFT/Archive/governance/SeatRecord721 work.
**Verdict:** ✅ **PASS — cleared for promotion.** All sale wiring points at the funded, unpaused V2b; older contracts are sealed; public copy carries no investment framing; full validation green.

---

## 1. Executive verdict
The site is wired to one live sale (V2b), which is **funded and open** on mainnet. The two prior contracts (V1, V2a) are **paused/sealed** and used only to preserve member history. Public-facing copy was audited end-to-end; the financial-vocabulary guards already enforced most of the canon, and the remaining genuine misframes were fixed. tsc, both wording guards, the doctrine/protocol-language/eras/my-syndicate test suites, and a live on-chain probe all pass. **No protocol code, ABI, or doctrine was changed.**

## 2. Production truth — sale wiring (code)
`ACTIVE_SALE = SALE_V2 ?? SALE_V1`, and `SALE_V2` resolves to `MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS` (= V2b) while `SALE_V2_LIVE`. Every member-facing write/read targets `ACTIVE_SALE`:
- **quote** (`useQuoteSyn`) → `ACTIVE_SALE` (V2b) on the V2 branch.
- **approve spender** (allowance arg) → `[address, ACTIVE_SALE]`.
- **buy** → `ACTIVE_SALE`.
V2a/V1 appear only inside the *historical stats read* branch — never as a buy/quote/approve target.

## 3. Production truth — live on-chain probe (mainnet 43114)
Read directly from Avalanche during this sprint:

| Read | V2b (live) | V2a | V1 |
|---|---|---|---|
| `paused()` | **false** ✅ | **true** (sealed) | **true** (sealed) |
| `memberCount()` | **5** | — | — |
| `nextSeatNumber()` | **6** | — | — |
| `availableSyn()` | **7,000,000 SYN** | — | — |
| SYN `balanceOf(sale)` | **7,000,000 SYN** (funded ✅) | — | — |
| `totalUsdcRaised()` | **0** (see §5) | — | — |

The buy path is open and inventory-backed; both legacy contracts are provably frozen.

## 4. Production truth — proof artifact
`public/v1-member-proofs.json` is the **merged, V2b-canonical** snapshot: `root 0xa1f2ed10…718c49`, **`count 5`**. The stale **V1-only root** and the **`count = 2` rehearsal placeholder** (which lives, correctly labeled, in `docs/proposals/SALE_V2_V1_SEAL_AND_SNAPSHOT_EXECUTION_PACKAGE.md`) are **not** present in the live artifact and were intentionally left in their historical doc — history is preserved, not overwritten.

## 5. The `totalUsdcRaised() == 0` nuance (important, not a bug)
V2b reports `memberCount = 5` / `nextSeat = 6` but `totalUsdcRaised = 0`. This is **expected**: seats #1–#2 were filled on V1 and #3–#5 on V2a, so V2b's own USDC counter is zero until the first public buy lands on it. The site's headline figures ("Total USDC routed", members) deliberately **sum V1 + V2a + V2b** via the canonical multi-source purchase scan, so the public numbers are correct while the single-contract counter is still 0. This nuance is now recorded in agent memory so it is never "fixed" by mistake.

## 6. Production truth — holder-index union
Master identity is the Holder Index, derived from first-seen purchase events across **all three** sale contracts: `TokensPurchased` (V1) + `Purchased`/`Routed` (V2a + V2b), labeled in code as the "Canonical multi-source purchase scan (V1 + V2a history + V2b active)". No member is dropped by the cutover.

## 7. Buy-flow UX — deep-link prefill
`/join?amount=N` prefills the buy widget and auto-scrolls to it (verified earlier this engagement). Package/preset cards are plain links that prefill on a fresh mount; `validateSearch` clamps magnitude/decimals so `parseUnits` never silently degrades to `0n`.

## 8. Buy-flow UX — custom-amount copy
Custom-amount copy correctly conveys the doctrine: **any amount ≥ the $5 minimum** works; the **first valid purchase creates exactly one permanent seat**; **SYN received follows the live era rate** (confirmed in-wallet at checkout); and **rank reflects cumulative USDC**, not the number typed. Packages are described as shortcuts, never as better-priced tiers.

## 9. Wording cleanup — methodology
The repo already has three layers of enforcement: `scripts/check-ownership-wording.mjs` (banned mental-model wording with a 3-line legal-denial window), `src/lib/protocol-language.ts` (`FORBIDDEN_LANGUAGE`), and `doctrine-guard.test.ts` (money-"raised" patterns). The canonical public label for inflow is **"USDC routed"**. ABI identifiers `totalUsdcRaised()` / `usdcRaised` / `usdcContributed` are **deliberately exempt** (technical field names, never rendered as investment claims). The audit therefore focused on *rendered copy* that the denial-window legitimately let through.

## 10. Wording cleanup — fixes applied (14)
All edits are copy-only; no logic touched.

**Contribution / proceeds framing (9):**
- `Sections.tsx` — "Vault Contribution" → **"Vault Routing"**; FAQ "total loss of contributed value" → **"…of the amount you spend"**.
- `CanonicalSpec.tsx` — "Larger contributions reflect a higher rank" → **"Larger cumulative purchases…"**.
- `RankHub.tsx` — "the rank your contribution reflects" → **"…your cumulative USDC reflects"**.
- `RevenueStreams.tsx` — "NFT and LP proceeds" → **"NFT and LP income"**.
- `roadmap.tsx` — "contribution archive" → **"participation archive"**; "Larger contributions never receive a better SYN price" → **"Larger purchases…"**.
- `risk.tsx` — "Only contribute what you are willing to lose" → **"Only spend…"**.
- `FaqRebuilt.tsx` — "total loss of contributed value" → **"…of the amount you spend"**.

**Capital / compounding framing (5) — surfaced by architect review:**
- `whitepaper.tsx` — "compounding experiment" → **"membership experiment"**; "compound discipline, capital, reputation, and opportunity" → **"build discipline, reputation, and belonging"**.
- `Sections.tsx` — hero "A real-life compounding experiment." → **"A real-life membership experiment."**; mission question "compound … discipline, capital, reputation, and opportunity" → **"build … discipline, reputation, and belonging"**; manifesto "long-term compounding, not short-term hype" → **"long-term membership…"**.
- `ProtocolHero.tsx` — "Live capital flow" (×2) → **"Live USDC flow"**; "Capital routes automatically" → **"Your USDC routes automatically"**.
- `wallet.$address.tsx` — "route capital to the Vault" → **"route USDC to the Vault"**.

## 11. Wording cleanup — what was deliberately NOT changed (and why)
- **Denial / disclaimer sentences** ("SYN is **not** equity / dividend / yield / a payout / an investment…") — these are the *intended* legal framing and were left intact.
- **"Contributors" token-allocation bucket** (5% / 50M SYN) and "contributor payments" (Operations) — legitimate builder/allocation language, not member-return framing.
- **ABI field names** (`totalUsdcRaised`, `usdcContributed`, `usdcRaised`) — technical, never renamed to satisfy copy rules.
- **Code comments** describing UI as "investor-relations style" — non-rendered, classified low-risk; left to avoid churn.

## 12. Guard hardening — narrow drift locks added
To prevent regression of the §10 capital frames, `check-ownership-wording.mjs` gained **narrow** patterns: `compounding experiment`, `capital flow`, `route[sd]? capital`, `capital rout(es|ing)`, and `compound… capital` (same-sentence). A blanket ban on bare "contribution/proceeds/share/capital" was **rejected** — it would false-positive on the extensive correct denial copy and the legitimate Contributors allocation. The guard scans 392 files and passes. **Coverage caveat:** `whitepaper.tsx` and `transparency.tsx` are intentionally on the guard's exclude list (they are denial-/disclaimer-heavy and would false-positive), so these new patterns do **not** auto-guard the whitepaper — its §10 fix is correct as shipped and is held by review plus the doctrine/protocol-language suites, not by this regex.

## 13. Doctrine harmony
No doctrine was broadened or invented. The work reinforces existing canon: rank = recognition derived from cumulative USDC (no rights/returns), money never implies ROI, the Vault is not owned by members, V2a/V1 are sealed, and referral/SeatRecord721/NFT remain future. SYN remains framed as an experimental utility membership token.

## 14. Docs & memory lock
Durable, agent-facing facts were written to memory (`mvp-production-truth-lock.md` + index): V2b-is-the-only-live-sale topology, the `totalUsdcRaised = 0` nuance, the merged proof root/count, the canonical "USDC routed" label, the ABI-name exemption, and the post-MVP backlog. The over-long index line was trimmed to the compact format. Code comments in `syndicate-config.ts` and the V2b cutover audit docs already lock the seal/active topology; no historical doc was overwritten.

## 15. Validation results
- `npx tsc --noEmit` → **exit 0**.
- `check-ownership-wording.mjs` → **OK (392 files)** with the new patterns.
- `check-visitor-vocabulary.mjs` → **PASS**.
- vitest (post-edit re-run): `doctrine-guard.test.ts` + `protocol-language.test.ts` → **2 files, 231 tests passed**; `eras-and-packages.test.ts` + `my-syndicate-doctrine.test.ts` → **2 files, 37 tests passed**.
- Live on-chain probe (§3) → **PASS**.
- Homepage render check → renders correctly; shows "USDC ROUTED", "LIVE USDC FLOW", "Seat #6 available", "Members 5".

## 16. Residual notes, risks & post-MVP backlog
**Known/benign:**
- Dev preview console shows "Invalid hook call" on `wallet_account_resync` — documented DEV-only Vite dual-dispatcher noise, app code clean, zero prod impact.
- Dev RPC can show PENDING/— from CORS/rate-limit on the public endpoint; production uses the seeded + incremental cache and is unaffected.
- `vite build` OOMs in-container (environment ceiling); validate via tsc + vitest + dev server, not the production build.

**Promotion recommendation:** ✅ Ready. Suggested final manual smoke before/just-after go-live: one connected-wallet buy on V2b end-to-end (approve → buy → seat/rank reflects) — this is the one path the harness can't auto-exercise without a funded wallet.

**Explicitly deferred (post-MVP, not this sprint):** deeper package / rank / chapter redesign + reconciliation; referral (CommissionRouter) go-live; SeatRecord721 mint-from-index.

---
*Read-only verification + copy/guard/memory hardening. No protocol code, ABI, or canon doctrine was modified.*
