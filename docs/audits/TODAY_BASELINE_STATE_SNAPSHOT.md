# The Syndicate — TODAY BASELINE: Full Current-State Truth Snapshot

> **Purpose.** Factual baseline of The Syndicate exactly as it exists today. This is a **truth audit**, not a redesign. Nothing here proposes or implements new economics. It is the official base for the next economic brainstorming and smart-contract lock phase.
>
> **Method.** Facts were read from the live codebase, deployed config, validation scripts, and **direct on-chain reads** against Avalanche C-Chain (`api.avax.network`). On-chain values were read at **block 87,985,939**.
>
> **Status legend:** `LIVE` (real-time on-chain read) · `DERIVED` (computed/indexed from on-chain data) · `PARTIAL` (live but incomplete/caveated) · `PENDING` (planned, not deployed/active) · `STATIC` (hard-coded constant) · `UNKNOWN` (must be checked).
>
> Audit date: 2026-06-14. Brutally factual. No flattery. No invented features.

---

## 0. CRITICAL FINDINGS FIRST (read this section)

These are the factual discrepancies/risks the rest of the report substantiates. None are fabricated — each cites a file or on-chain read.

1. **Burn count mismatch (LIVE vs documented).** On-chain `SYN.balanceOf(0x…dEaD)` = **2,000 SYN**. The canonical record `PROOF_OF_FIRE_001` in `src/lib/syndicate-config.ts` documents only **1,000 SYN** (one burn). The UI reads the live dead-balance (so it correctly shows 2,000), but the protocol's written burn ledger documents only half of it. **CHECK:** a second ~1,000 SYN burn is undocumented in canon. Reconcile `PROOF_OF_FIRE_001` with on-chain, or add Proof of Burn #002.
2. **Two different things both called "Liquidity."** SYN token allocation "Liquidity" = **10% of supply** (`TOKENOMICS_ALLOCATION`). USDC routing "Liquidity" = **20% of every purchase** (`USDC_ROUTING` / `VAULT_ALLOCATION`). Same word, two unrelated economics. Collision risk in any new economic copy.
3. **One address, two roles.** `0x205DdC…f464` is simultaneously the SYN "Vault Reserve" (25% token allocation) and the USDC "Vault Wallet" (70% routing destination). Intentional, but it means "Vault" balance reads mix two mental models.
4. **Routing-wallet balance ≠ cumulative routed.** Liquidity wallet currently holds **3 USDC**, not the full 20% of the 25 USDC raised (which would be 5). Reason: ~2 USDC was deployed into the Trader Joe LP. The UI shows live wallet balances (correct), but "20%" expectations won't tie out to the wallet balance once funds move to the pool.
5. **NFT prices are STATIC constants, not on-chain reads.** Mint prices (0.50 / 5.00 USDC) live in `ARCHIVE_CONTRACT_STATE` in config. If the deployed Archive contract's price differs, the UI will be wrong silently. **CHECK** against contract.
6. **Referral and SeatRecord721 are PENDING.** No deployed addresses. `/referral` is an explicit simulation. SeatRecord721 is reserved (Archive ID 2, disabled) but unbuilt.
7. **Archive source not yet verified.** `ARCHIVE_CONTRACT_STATE.sourceVerified = "PENDING"`. SYN token source is verified (Sourcify/Routescan); the Archive 1155 is not.

---

## 1. CURRENT LIVE SITE SNAPSHOT

| Item | Value | Status |
| --- | --- | --- |
| Production URL | `https://thesyndicate.money` | LIVE (referenced in `package.json` check scripts) |
| Preview URL | Replit dev domain (`$REPLIT_DEV_DOMAIN`) — different host | LIVE (dev) |
| Chain | Avalanche C-Chain, `CHAIN_ID 43114` | LIVE |
| Build stamp / version | `BuildStamp` component + `src/lib/build-stamp.ts` + `StaleBuildBanner.tsx` exist (warns on stale deploys) | LIVE mechanism; exact stamp value UNKNOWN at audit (generated at build) |
| Boot / typecheck | App boots; `tsc --noEmit` clean | LIVE / PASS |

### 1.1 Active routes (`src/routes/`)

**Public (in nav/sitemap):**
`/` · `/activity` · `/vault` · `/nft` · `/nfts` (alias) · `/archive` · `/transparency` · `/members` · `/token` · `/tokenomics` · `/liquidity` · `/registry` · `/founders` · `/chapters` · `/chapters/$slug` · `/chronicle` · `/join` · `/roadmap` · `/ranks` · `/referral` · `/docs` · `/faq` · `/risk` · `/whitepaper` · `/my-syndicate` · `/institutional-register` · `/knowledge-map` · `/wallet/$address` · `/milestone/$id` · `/episodes` · `/protocol-health` · `/sitemap.xml` · `/x/tx/$hash`

**Hidden / internal (DEV-gated, `noindex`):**
`/labs` and all `/labs/*` workbenches (component-index, signals, chronicle-*, memory-candidates, invariants, knowledge-map, protocol-events/intelligence/lineage/memory, design-archive/museum) · `/ai` (experimental analyst)

**Pending / simulated:** `/referral` exists publicly but is an explicit **SIMULATED** preview (no contract).

**Legacy:** `/verify` is replaced by `/transparency`. (Header/nav point to `/transparency`.)

### 1.2 Navigation / header / footer

- **Header** (`src/components/syndicate/Header.tsx`): sticky, backdrop-blur gold brand lockup. Desktop = 6 primary links (Activity, Vault, NFT/Archive, Verify→Transparency, Members, Token (SYN)) + a "More" dropdown. Action cluster: notification bell, Avalanche network pill, theme toggle, wallet chip, gold **Join** CTA.
- **Footer** (`src/components/syndicate/Sections.tsx`): wordmark, link columns (Protocol / Resources / Legal), `BuildStamp`.

### 1.3 Mobile behavior / sticky CTAs

- Header collapses to a full-screen hamburger drawer with all links + full-width Join CTA.
- **`MobileJoinBar.tsx`**: ONE global fixed bottom CTA on mobile, route-aware label (Join / Mint / Verify). (Doctrine: never add a second fixed bottom bar.)

### 1.4 Homepage section order (`src/routes/index.tsx`)

1. `ProtocolHero` (living state radial)
2. `ProtocolStorySoFar` (Act 1 — what this is)
3. `WhyJoinSimple` + `IdentityZone` (Act 2 — why join)
4. `MilestoneApproachingTile` + `LivePulseStrip` + `HomeActivityTape` (Act 3 — why now)
5. `HowToJoinSteps` + `WhatChangesAfterJoining` + `Flywheel` (Act 4 — what happens next)
6. `StoryTimeline` + `HomeTransparencySnapshot` (Act 5 — how to verify)
7. Final CTA ("Take your seat")
8. `RiskDisclaimer`

### 1.5 `/my-syndicate` structure (Member Cockpit)

Single narrative arc: `MemberCockpit` (Identity → Place → Ownership → Momentum → Action) → Memory zone (`CockpitMemory`, `ActivityStrip`, `ChronicleBlock`) → Proof zone (`CockpitProof`, cross-links to Chronicle/Transparency) → Building zone (collapsed **PENDING** future modules: governance, marketplace, etc.).

### 1.6 `/nft` and `/archive` structure

- **`/nft`** (`NftPage.tsx`): artifact-first — `FirstSignalShowcase` (hero/mint) → MythologyWall → AnatomyBands → HowArchiveWorksFlow → PatronSealReadiness → RecentCollectorsRail → LiveProofStrip → ArchiveContractStatus → FinalMintCTA.
- **`/archive`**: protocol-record layout — Museum hero → Live proof strip → Chapter I hero → Mythology wall → Chapter panel → FAQ → Explorer index → "Verifiable today" list → Sealed items.

### 1.7 Specific path status

| Path | Status |
| --- | --- |
| `/registry` | LIVE — canonical contract/wallet registry |
| `/transparency` | LIVE — Transparency Center (replaces `/verify`) |
| `/token` | LIVE — SYN spec/contract |
| `/liquidity` | LIVE — SYN/USDC Trader Joe pool status |
| `/ranks` | LIVE — recognition hub |
| `/referral` | PENDING — public page, explicitly simulated |

---

## 2. CURRENT PRODUCT MODEL

- **What it sells:** Membership in The Syndicate. You buy SYN with USDC through the Membership Sale contract and receive a permanent, verifiable on-chain "seat." The product is **identity/belonging**, explicitly **not** financial return.
- **How users buy:** `/join` → connect wallet → approve USDC → `buy(usdcAmount)` on the Sale contract. Atomic: USDC in, SYN out at a fixed rate, split 70/20/10 on-chain. `LIVE`.
- **Minimum purchase:** **5 USDC** (`SALE_MIN_USDC`). Presets: 5/10/25/50/75/100/250/500/1000. `STATIC`.
- **Rate:** **1 SYN = $0.01 USDC**, fixed (`ACCESS_RATE_USDC_PER_SYN`). Bigger amounts unlock visible **rank**, never bonus tokens or cheaper SYN. `STATIC`.
- **What users receive:** SYN tokens + on-chain membership record (counted from `TokensPurchased`), a public wallet page, rank recognition, chapter placement. Optional: Archive NFTs (separate purchase).
- **Member definition (canonical):** a wallet that has **purchased through the Membership Sale** (`TokensPurchased`, de-duplicated by buyer). **Member ≠ Holder** (holder = anyone holding SYN, incl. via DEX/transfer). Source: `MEMBER_DEFINITION` in `syndicate-config.ts`. `DERIVED`.
- **Live vs preview:** Sale, USDC routing, SYN token, Archive mints (ID 1 & 3), ranks, chapters, activity = **LIVE/DERIVED**. Referral, SeatRecord721, vault asset valuations, governance, marketplace = **PENDING**.
- **How the pieces connect:** USDC → Sale → SYN to buyer + 70/20/10 routing. Cumulative USDC → rank (recognition only). Member number → chapter. Archive NFTs are an independent 1155 collection. Cockpit (`/my-syndicate`) composes all reads for a connected member.

---

## 3. CURRENT ECONOMIC MODEL (with LIVE on-chain values @ block 87,985,939)

### 3.1 SYN token
- Address `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` · decimals 18 · `LIVE`.
- `totalSupply` = **1,000,000,000 SYN** (fixed) · `LIVE`.
- Burned (`balanceOf(0x…dEaD)`) = **2,000 SYN** · `LIVE`. *(See Critical Finding #1 — canon documents only 1,000.)*
- No mint, no tax, no blacklist, no admin, no pause, no transfer restrictions (`TOKEN_SPEC`). `STATIC` claim — consistent with a minimal ERC20; verify on Sourcify.

### 3.2 Membership Sale
- Address `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` · `LIVE`.
- `paused` = **false** (sale open) · `LIVE`.
- `totalUsdcRaised` = **25 USDC** · `LIVE`.
- `totalSynSold` = **2,500 SYN** · `LIVE`.
- `totalBuyers` (= members) = **2** · `LIVE`.
- `purchaseCount` = **5** · `LIVE` (5 purchases across 2 wallets).
- `availableSyn` (inventory in contract) = **997,500 SYN** · `LIVE`.
- Deployment block `87,157,852` (`SALE_DEPLOYMENT_BLOCK`).

### 3.3 USDC routing — 70 / 20 / 10
| Tranche | % | Wallet | Live USDC balance | Purpose |
| --- | --- | --- | --- | --- |
| Vault | 70% | `0x205DdC…f464` | **17.5** | Long-term reserve |
| Liquidity | 20% | `0xa9b072…2e25` | **3** (2 deployed to LP) | Reinforce SYN/USDC pool depth |
| Operations | 10% | `0x5cb579…BE80` | **2.5** | Builders / operators / ecosystem |

Split enforced on-chain by the Sale contract (`vaultWallet`/`liquidityWallet`/`operationsWallet` read functions exist in the ABI). `LIVE`. Source of split labels: `USDC_ROUTING` / `VAULT_ALLOCATION`.

### 3.4 SYN token allocation (separate from USDC routing — do not conflate)
`TOKENOMICS_ALLOCATION`: Membership Distribution 35% (350M) · Vault Reserve 25% (250M) · Founder 12% (120M, 12-mo cliff + 36-mo vest) · Liquidity 10% (100M) · Partnerships 8% (80M) · Contributors 5% (50M) · Future Ecosystem 5% (50M). `STATIC`. 7 public allocation wallets in `ALLOCATION_WALLETS`.

### 3.5 Ranks (recognition only, derived from cumulative USDC)
12 tiers, `STATIC` thresholds, `DERIVED` assignment: Citizen $5 · Scout $10 · Operator $25 · Builder $50 · Strategist $75 · Vanguard $100 · Architect $250 · Steward $500 · Custodian $1,000 · Keystone $2,500* · Inner Circle $5,000* · Cornerstone $10,000* (*manual onboarding). Rank confers **no rights/returns/discounts** (doctrine-enforced).

### 3.6 Chapters (derived from member number)
I — Genesis Signal #1–333 · II — First Thousand #334–1,000 · III — The Expansion #1,001–3,333 · IV — First Ten Thousand #3,334–10,000 · V — Open Era #10,001+. `STATIC` ranges, `DERIVED` placement (`src/lib/chapters.ts`).

### 3.7 Liquidity / LP
- Trader Joe v1 SYN/USDC pair `0xe12491…9389` · `LIVE`.
- Live reserves: ~**8.07 USDC** / ~**575.7 SYN** → implied price ≈ **$0.0140 / SYN** · `LIVE/DERIVED`.
- Seeded initial: 200 SYN / 2 USDC @ $0.01 (`LP_POOL`).

### 3.8 NFT / Archive
- `SyndicateArchive1155` `0xB2AE1e…D54d`, deployed 2026-06-06 · `LIVE` (read-only integration).
- ID 1 "The First Signal" — mint **OPEN** at **0.50 USDC** (wallet limit 5).
- ID 3 "Patron Seal" — mint **OPEN** at **5.00 USDC** (wallet limit 5, supply 10,000).
- ID 2 "Reserved Seat Record Reference" — **RESERVED/DISABLED** (future SeatRecord721).
- Prices are `STATIC` config (`ARCHIVE_CONTRACT_STATE`) — see Critical Finding #5.

### 3.9 Referral
- **PENDING / absent on-chain.** `/referral` is a labeled simulation. No CommissionRouter address.

---

## 4. CURRENT SMART CONTRACT SNAPSHOT

> **Repo note:** there are **no `.sol` source files** in this repository — only ABIs (`src/lib/sale-abi.ts`, `src/lib/archive-nft-abi.ts`) and Markdown specs (`docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md`, deployment-state docs). On-chain bytecode is the truth; source verification is per-explorer.

| Contract | Address | Chain | Live status | Admin/powers | Pausable | OZ vs custom | Risk / unfinished |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **SYN ERC20** | `0xC1Cf…0170` | 43114 | LIVE | None claimed (no mint/admin) | No | Minimal ERC20 (source verified Sourcify/Routescan) | Low. Verify "no admin" against verified source. |
| **Membership Sale** | `0x0020…842d` | 43114 | LIVE | Owner sets/holds wallets; `paused` togglable | **Yes** (`paused()` read exists) | Custom (atomic split logic) | Owner powers (pause, wallet config) UNKNOWN in detail — **no source file in repo**; verify owner & pause authority on-chain. |
| **SyndicateArchive1155** | `0xB2AE…D54d` | 43114 | LIVE (read-only) | Owner (Ownable), mint config | **Yes** (Pausable per spec) | OpenZeppelin (ERC1155 + Ownable + Pausable + ReentrancyGuard, per spec) | `sourceVerified = PENDING`. Validation IN_PROGRESS. No write paths wired in app. |
| **Referral / CommissionRouter** | — | — | PENDING | — | — | — | Not designed/deployed. |
| **SeatRecord721** | — | — | PENDING | — | — | — | Reserved as Archive ID 2 (disabled); future standalone ERC-721. |
| **Vault / router / treasury** | — | — | No separate contract | Routing lives inside Sale; wallets are EOAs/multisig (UNKNOWN type) | — | — | Wallet custody model (EOA vs multisig) UNKNOWN — **CHECK** for Vault/Liquidity/Operations. |

**Must verify on-chain (not in repo):** Sale owner address & exact admin powers; whether routing wallets are EOAs or multisigs; Archive mint price functions vs config; SYN "no admin" claim against verified source.

---

## 5. CURRENT DATA / INDEXING / LIVE READS

Three-layer architecture: **registry** (`src/lib/protocol-metrics-registry.ts`, canonical metric defs) → **truth/binding** (`src/lib/protocol-truth.ts`, `useProtocolTruth`) → **verification** (`src/lib/data-verification-registry.ts`, the "Verify Onchain" drawers).

| Metric | Class | Source | File |
| --- | --- | --- | --- |
| Members count | DERIVED/INDEXED | `TokensPurchased` scan, dedup by buyer (also `totalBuyers` read = 2) | `holder-index.ts` / `sale-hooks.ts` |
| USDC routed | LIVE | `totalUsdcRaised()` | `sale-hooks.ts` |
| SYN sold | LIVE | `totalSynSold()` | `sale-hooks.ts` |
| SYN price | DERIVED | LP reserves (Trader Joe) | `sale-hooks.ts` |
| SYN supply | LIVE | `totalSupply()` | `treasury-hooks.ts` |
| Burned SYN | LIVE | `balanceOf(0x…dEaD)` | `treasury-hooks.ts` |
| Vault/Liq/Ops balances | LIVE | `balanceOf` (USDC) | `treasury-hooks.ts` |
| Liquidity TVL | DERIVED | `usdcReserve × 2` | `sale-hooks.ts` |
| Ranks | DERIVED | cumulative USDC vs `RANKS_V2` | `syndicate-config.ts` |
| Chapters | DERIVED | members vs `CHAPTERS` | `chapters.ts` |
| NFT prices | **STATIC** | `ARCHIVE_CONTRACT_STATE` | `syndicate-config.ts` |
| Referral stats | **PENDING/PLACEHOLDER** | none | `routes/referral.tsx` |
| Vault non-USDC asset USD value (BTC.b/WETH.e) | **PENDING** | no price oracle wired | `treasury-hooks.ts` |
| Cumulative NFT revenue | **PENDING** | no single read; event aggregation not done | — |

- **Staleness:** wagmi `useReadContracts`, `refetchInterval` ~60s, `staleTime` ~30s; `useProtocolPulse` aggregates for a consistent homepage heartbeat. Purchase-event scan is incremental and persisted to localStorage (seeded stale so "LIVE" pills stay honest).
- **Risk of stale values:** primarily the **STATIC** NFT prices and the **documented burn record** (Critical Finding #1) — these don't auto-track the chain.
- **Verification tooling:** `data-verification-registry.ts` exposes a verify path per metric; vitest doctrine tests pin registry shape.

---

## 6. CURRENT LEGAL / WORDING GUARDRAILS

- **Banlist** (defined in `scripts/check-ownership-wording.mjs`, `src/lib/protocol-language.ts`, `scripts/live-content-rules.json`): `investment`, `ROI`, `yield`, `dividend`, `passive income`, `capital/money raised`, `revenue share`, `investor`, `governance participation`, `KYC`, plus retired terms (`Genesis Circle`, `Compounder Score`, old rank names). Words allowed **only** when preceded by a denial ("not an investment").
- **Approved replacements:** raised→**routed / purchases / sale volume**; investment→**membership / identity / belonging**; dividend→**referral commission (from Operations)**; yield→**USDC routed / treasury movements**.
- **Enforcement:** `check-ownership-wording` (PASS, 371 files), `check-visitor-vocabulary` (PASS), `check-live-content` (fetches deployed site), `check-execution-gates` (PASS), `check-homepage-content`, `check-nft-archive-qa`, `check-preview-labels`, `check-loop-ownership`, plus vitest doctrine guards (`doctrine-guard.test.ts`, `chronicle-doctrine.test.ts`, `signal-money-guardrail.test.ts`, `execution-gates.test.ts`).
- **Sharia / no-riba:** no explicit "Sharia/Halal" wording, but the no-riba principle is **implicitly respected** — all flows framed as "routing"/"purchases," with yield/passive-income/dividend framing aggressively removed. *(If explicit halal positioning is wanted, it is currently absent — decision needed.)*
- **Residual risk areas to watch:** any new economic copy around referral commissions ("commission from Operations" is the only safe frame), rank language drifting toward reward/leaderboard, and the Liquidity/Vault terminology collisions (Critical Findings #2–#3).

---

## 7. CURRENT UX / CLASS AAA MVP QUALITY (honest grades, 1–10)

| Dimension | Grade | Note |
| --- | --- | --- |
| Clarity | 7 | Strong narrative arc; weakened by deep route sprawl and dual "Liquidity"/"Vault" meanings. |
| Trust | 9 | "Don't trust, verify" is real — live reads + verify drawers + public wallets. |
| Conversion | 6 | Clear Join path, but 5-USDC entry value proposition competes with heavy lore. |
| Economic explanation | 6 | 70/20/10 is clear; token-allocation vs routing distinction is not surfaced to a first-timer. |
| Storytelling | 9 | Chronicle/chapters/cockpit are unusually mature for an MVP. |
| Member identity | 8 | Ranks, seats, chapters, cockpit deliver belonging well. |
| Mobile usability | 7 | Global MobileJoinBar + drawer solid; dense pages still heavy on small screens. |
| Investor confidence | 5 | Deliberately downplayed (legal). Reads as a community protocol, not an investment — by design. |
| Technical transparency | 9 | Registry/contract/explorer links + source verification widget. |
| First-time visitor understanding | 6 | "What do I get for $5?" answerable but buried under lore depth. |

- **Already strong (lock):** truth/verify architecture, wording guardrails, ranks/chapters doctrine, cockpit arc, USDC routing transparency.
- **Confusing:** Liquidity (10% SYN vs 20% USDC), Vault (one address two roles), burn record vs live burn, # of `/labs` surfaces.
- **Missing:** referral, SeatRecord721, higher tiers economics, vault asset valuation, NFT revenue ledger.
- **Overbuilt for MVP:** breadth of `/labs/*` workbenches and multiple chronicle/memory candidate layers (internal value, but high surface area to maintain).
- **Do NOT touch yet:** contracts (until owner/admin powers re-verified), the wording banlists, the metric registry shape, the cockpit narrative arc (test-pinned).

---

## 8. CURRENT TECHNICAL HEALTH (run at audit time)

| Check | Result |
| --- | --- |
| TypeScript (`tsc --noEmit`) | **PASS** |
| `check-execution-gates` | **PASS** (0 findings) |
| `check-ownership-wording` | **PASS** (371 files) |
| `check-visitor-vocabulary` | **PASS** |
| App boot (`Start application`) | **Running** |
| On-chain reads (SYN/Sale/LP/wallets) | **All resolved** @ block 87,985,939 |

- **Not run here (network/heavy):** `check-live-content` & `check-homepage-content` (fetch the **deployed** site `thesyndicate.money` — a red there means "republish," not a local regression); full `vitest` suite (OOMs if run whole — must run per-batch). `check-release` bundles these.
- **Known environment ceiling:** `vite build` can OOM in this container during transform (validate via tsc + vitest batches + dev server, not the production build).
- **Stale routes / dead components:** none broken found; `/verify` is legacy→`/transparency`. High count of `/labs/*` internal routes is intentional quarantine (noindex), not dead code.

---

## 9. ECONOMIC & SMART-CONTRACT FEASIBILITY BASELINE (no implementation)

**Easy with battle-tested OpenZeppelin-style contracts (low risk):**
- Higher membership tiers — already pure config (`RANKS_V2`); no new contract needed unless tiers gate on-chain behavior.
- Artifact sales — extend existing Archive1155 (already OZ ERC1155 + Pausable + ReentrancyGuard).
- SeatRecord721 — standard OZ ERC-721 (soulbound optional). Reserved slot already exists conceptually.
- Treasury dashboard — pure read/indexing; no contract.

**Requires custom logic (medium risk, audit before lock):**
- Referral commissions / CommissionRouter — custom split + attribution; must source commissions from the **Operations** tranche only (legal frame) and avoid any yield/dividend semantics.
- Rank-based referral boosts — custom; high legal sensitivity (must stay "recognition," never reward/return).
- Vault routing automation beyond the current 70/20/10 — custom; changes the Sale contract.

**High-risk / delay:**
- Marketplace (secondary trading) — custody/royalty/legal surface; defer.
- Any automated buyback/burn — explicitly off-doctrine (burns are manual, recognition-only). Keep off-chain/manual.
- Premium tools tied to payment — only if framed as utility, not return.

**Keep off-chain / indexed for now:** member count, NFT revenue ledger, vault asset USD valuations (need oracle), protocol revenue ledger.

**Safe to add to a Class AAA MVP without overcomplicating:** higher tiers (config), one more artifact drop (existing contract), treasury/revenue dashboard (read-only), and a clearly-labeled referral **design** (not contract) — provided wording guardrails and the Operations-sourced commission frame hold.

---

## 10. FINAL BASELINE — "TODAY"

- **What it is:** an on-chain Avalanche membership protocol selling identity/belonging via SYN, with a mature transparency/verify and storytelling layer. Not an investment product (by design and by code-enforced wording).
- **What is actually LIVE:** SYN token (1B fixed, 2,000 burned), Membership Sale (open, 25 USDC raised, 2,500 SYN sold, 2 buyers, 5 purchases), 70/20/10 USDC routing (17.5 / 3 / 2.5 in wallets), Trader Joe SYN/USDC LP (~$0.014/SYN), Archive 1155 mints ID 1 ($0.50) & ID 3 ($5.00), ranks, chapters, activity, cockpit, transparency/registry.
- **What it sells:** SYN membership (min 5 USDC, 1 SYN = $0.01) + optional Archive artifacts.
- **How money flows:** USDC → Sale → SYN to buyer + 70% Vault / 20% Liquidity / 10% Operations, enforced on-chain. NFT mint proceeds accrue to the Archive owner; LP fees to the LP position.
- **What the user owns/receives:** SYN + permanent on-chain membership record, public wallet page, rank recognition, chapter placement; optionally Archive NFTs.
- **What is PENDING:** referral/CommissionRouter, SeatRecord721, vault asset valuations, NFT revenue ledger, governance, marketplace, higher-tier on-chain behavior.
- **Safe to build next:** higher tiers (config), an additional artifact drop (existing contract), a read-only treasury/revenue dashboard, and a labeled referral **design**.
- **Must be decided before touching contracts again:**
  1. Reconcile the burn ledger (2,000 on-chain vs 1,000 documented) — add Proof of Burn #002 or correct canon.
  2. Confirm Sale owner address, pause authority, and routing-wallet custody (EOA vs multisig).
  3. Verify Archive 1155 source (flip `sourceVerified`) and confirm mint prices on-chain vs config.
  4. Resolve the "Liquidity" (10% SYN vs 20% USDC) and "Vault" (one address, two roles) terminology before new economic copy ships.
  5. Lock the referral commission **frame** (Operations-sourced, recognition-only) before any contract design.

---

*Read-only audit. No protocol code, config, or canon docs were modified. Re-read live values before any decision — on-chain state changes.*
