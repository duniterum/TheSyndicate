# Whole-Site Product-Desire + Dashboard Architecture Pass

**Type:** Founder-grade whole-site product/design reasoning. **Not implementation.** No copy, no renames, no protocol-correctness changes, no profit/ROI/yield/dividend/return/equity language.
**Date:** 2026-06-17
**Baseline:** `MASTER_LEDGER_2026-06-17.md`, `CANONICAL_SOURCE_EXTRACTION_2026-06-17.md`, `DESIRE_LAYER_PRODUCT_REASONING_2026-06-17.md` (chain re-verified block 88,218,601).
**Visitor model:** *Alice* — crypto-native; decides in seconds whether this is a *live economy worth belonging to*.

> Grounding: written against the actual current routes (route files + rendered components + the global chrome `PageShell` / `Header` / `ProtocolIntelligenceBar`), not from memory.

---

## 0. Headline diagnosis (the whole-site version of the hero finding)

The hero finding generalizes. Across the site:

1. **The pieces of a live crypto cockpit already exist and are mostly already dashboards.** `/vault`, `/liquidity`, `/registry`, `/activity`, `/ranks` already read as dashboards; `/tokenomics` and `/transparency` are hybrids; `/my-syndicate` is already a near-complete member OS; the **global economy ticker already exists and already renders on every page except the homepage.**
2. **The problem is composition, not absence.** The same economy truth (routing, vault, LP, supply, burn) is **sprayed across five+ routes**; the artifact story is **split across two near-duplicate routes** (`/nft` + `/archive`); the site exposes **~21 routes / ~18 nav destinations**, so the *whole machine never appears in one frame.* Alice assembles the economy herself by route-hopping.
3. **Sequencing is proof-first.** Nearly every route opens with verify/disclaimer framing ("Verify on-chain," "not a promise," "Is this an investment? No"). Integrity is over-served; aliveness and belonging are under-served and live below the fold.

**So: it does NOT yet feel like one live protocol cockpit. It feels like a (well-built, honest) set of dashboards and proof pages that the visitor must stitch together.** The fix is unification + sequencing + un-hiding what's already built — not new claims and not, mostly, new components.

---

## 1. Global product narrative

**The intended arc:** Alive → Join → Seat → Dashboard → Progression → Story → Actions → Share.

**What actually happens today:**

| Stage | Intended surface | Reality | Verdict |
|---|---|---|---|
| **Alive** | homepage hero + ticker | ticker **hidden** on homepage; hero shows only membership-sale routing; liveness (`LivePulseStrip`) is below the fold | ⚠️ weak |
| **Join** | `/join` | strong buy widget, but **13 stacked sections** (calculator, era preview, rank ladder, payment strategy…) bury the actual purchase | ⚠️ overloaded |
| **Seat** | confirmation → identity | the seat→identity payoff is real but lives inside `/my-syndicate`, only after connect | ⚠️ hidden |
| **Dashboard** | `/my-syndicate` | near-complete member OS — but reachable only via the wallet chip, only after connecting | ⚠️ buried |
| **Progression** | `/ranks` + `/chapters` | both live + dashboard-like, but in the "More" dropdown; and Rank/Chapter/Era overlap confuses | ⚠️ hidden + confusing |
| **Story** | `/activity` + cockpit memory | `/activity` is a genuine heartbeat feed; story duplicated on homepage + activity | ✅ but redundant |
| **Actions** | cockpit next-move, mint, LP, share | all present in cockpit; referral correctly future | ✅ |
| **Share** | share card | present (`MemberShareBlock`) | ✅ |

**Where Alice gets lost:** between the **proof/technical cluster** (`/transparency`, `/registry`, `/tokenomics`, `/docs`, `/whitepaper`, `/faq`) and the **artifact cluster** (`/nft` + `/archive` overlap). These outnumber and out-rank the *desire* surfaces in nav. The arc is **possible** but not **guided** — the site never says "you are here; next is this."

**Net:** the narrative exists in the code (the homepage even comments itself as "ONE journey in five acts"), but it is **diluted by redundancy and hidden by nav**, so it doesn't feel like one continuous protocol economy.

---

## 2. Homepage role

**Recommendation: hybrid — a public protocol cockpit that funnels into Join.** Not a pure landing page (wastes the live data moat), not a pure dashboard (Alice still needs the seat/why-join hook).

**What the homepage should be, in one line:** *the single frame where the whole live economy + the open seat appear together,* with everything else one click deeper.

**Coverage check — does the homepage currently surface each cockpit element?**

| Element | On homepage today? | Notes |
|---|---|---|
| Ticker | ❌ | `hideIntelligenceBar` suppresses it (the one page it's hidden) |
| Live metrics (magnitude) | ⚠️ | hero shows routing *shape*; magnitudes render PENDING/— above fold |
| Protocol engines (vault/LP/burn/NFT as one) | ❌ | only membership routing in hero; engines live on other routes |
| Seat availability | ⚠️ | "Seat — available" present but quiet |
| Member count | ⚠️ | in hero overview panel, but PENDING-styled |
| Vault | ⚠️ | routing share only, not balance magnitude |
| LP | ❌ | not on homepage |
| Burn | ⚠️ | "Burned Supply" present but rendered PENDING |
| NFT mints | ❌ | not on homepage |
| Recent activity | ✅ (below fold) | `LivePulseStrip`, `HomeActivityTape` in Act 03 |
| Join CTA | ✅ | strong, present |

**Verdict:** the homepage is currently a *funnel-with-a-hero*, missing the *cockpit* half. The single highest-leverage move is to let the homepage show the whole economy (un-hide the ticker, lift the engines) **above or near the fold**, then funnel to Join — without inventing any data, because the data already exists on `/vault`, `/liquidity`, `/activity`.

---

## 3. Global ticker / intelligence bar

**Finding: the ticker the brief asks for already exists** (`ProtocolIntelligenceBar`, rendered by `PageShell` on every page). It already carries: reference price (fixed $0.01 access rate), reference market cap, FDV, total + circulating supply, **burned supply with a Proof-of-Burn badge** (links to `/activity`), protocol-wallets total, **vault / liquidity / operations balances**, **LP TVL**, SYN sold, **USDC routed**, **members**, **current chapter progress** (taken/capacity/remaining). It computes an honest aggregate status pill: **LIVE / PARTIAL / PENDING**.

**Against the brief's wishlist:**

| Wanted cell | In ticker today? |
|---|---|
| Members | ✅ |
| Total USDC routed | ✅ |
| Vault balance | ✅ |
| LP depth | ✅ (LP TVL) |
| Burned SYN | ✅ (+ badge) |
| SYN price / access rate | ✅ (reference price) |
| Current chapter | ✅ |
| **Next seat #** | ⚠️ implicit (chapter taken/remaining), not an explicit "Seat #N" |
| **Last action** | ❌ (lives in `LivePulseStrip`, not the ticker) |
| **Active sale status** | ❌ (not a ticker cell) |
| **NFT mint status** | ❌ (lives on `/nft`) |

**Product logic (decision, no implementation):**
- **Show globally on all public pages** — it's the most legally-clean, most desire-positive surface the site has.
- **Un-hide on the homepage.** The current rationale ("the hero already renders the overview, the ticker would duplicate") is the wrong trade: the ticker is the *aliveness* signal and the hero's overview is currently PENDING-styled. Either integrate the ticker into the hero or stop suppressing it. (This is a composition decision, not a new build.)
- **Suppress (or slim) during the active buy step on `/join`.** Checkout should be focused; a scrolling ticker competes with the transaction. Keep it on the `/join` *landing* state, drop it once the purchase widget is the focus.
- **Inside `/my-syndicate`**, the ticker is the *protocol* layer above the *personal* cockpit — keep it, it frames "the economy you're now part of."
- **Consider adding the 3 missing live signals** (last action, active-sale status, NFT-mint status) **only if** they don't push the bar past one scannable row; "next seat #" is the highest-value addition and is already derivable.

---

## 4. Public dashboard architecture (per page)

> For each: current role · ideal role · key live metrics · primary CTA · secondary CTA · what Alice should feel · current confusion. (CTAs/metrics are observed, not proposed.)

### Homepage `/`
- **Current:** funnel + austere hero (membership routing only; ticker hidden).
- **Ideal:** **public protocol cockpit** → funnel to Join.
- **Key live metrics:** members · total USDC routed · vault balance · LP depth · burned SYN · next seat / chapter fill · last action.
- **Primary CTA:** Join. **Secondary:** Verify / See activity.
- **Feel:** "This economy is alive and I can still get in early."
- **Confusion:** PENDING-styled magnitudes read as empty; the whole economy isn't in one frame.

### `/transparency`
- **Current:** prose/proof center ("Verify on-chain"); Treasury Ledger = SIMULATED/PREVIEW.
- **Ideal:** **proof dashboard** — the skeptic's terminal, data-grid-first with prose secondary.
- **Key live metrics:** contract statuses (LIVE/PENDING) · treasury composition · routing · LP · asset USD where oracle exists (else PENDING).
- **Primary CTA:** Verify (registry/explorers). **Secondary:** Open Archive treasury.
- **Feel:** "Every claim has a link; nothing is hidden."
- **Confusion:** simulated vs real ledger rows sit close together; artifact disclaimer stack mid-flow.

### `/vault`
- **Current:** already a dashboard (live 70/20/10 balances, 60s refresh) wrapped in disambiguation prose.
- **Ideal:** **treasury / vault dashboard** — balances and routing first; "it's a wallet, not a yield-vault" disambiguation as a persistent caption, not a gate.
- **Key live metrics:** vault balance · 70/20/10 destinations · revenue streams (3) · treasury composition.
- **Primary CTA:** Verify. **Secondary:** Open wallet on explorer.
- **Feel:** "The treasury grows transparently as members join — and I can watch it."
- **Confusion:** "Vault" = wallet today, Vault *contract* = PENDING; must never imply member claim.

### `/liquidity`
- **Current:** already a market dashboard (live depth/price/TVL, 60s; DexScreener chart); fees PENDING.
- **Ideal:** **market / liquidity dashboard** — keep as-is, promote the live chart/depth above the "why LP matters" prose.
- **Key live metrics:** LP depth/reserves · SYN price (AMM) · TVL · (fees PENDING).
- **Primary CTA:** Add liquidity on Trader Joe ↗. **Secondary:** Trade ↗ / DexScreener ↗.
- **Feel:** "There's a real market here."
- **Confusion:** Classic AMM vs DLMM; LP risk notice heavy.

### `/tokenomics`
- **Current:** hybrid (donut + allocation table LIVE/CONFIRMED/DRIFT, sale stats, routing) → utility/governance prose.
- **Ideal:** **supply / economy dashboard** — supply truth + allocations + routing as the spine.
- **Key live metrics:** 1B fixed supply · circulating · 7 allocations (+ drift status) · sale stats · routing.
- **Primary CTA:** Verify. **Secondary:** Registry.
- **Feel:** "Supply is fixed and every allocation is accounted for."
- **Confusion:** "DRIFT" pill needs a plain-language meaning; overlaps `/transparency` routing.

### `/activity`
- **Current:** already a live event feed ("The protocol heartbeat") + sale stats + milestones + Proof-of-Burn card.
- **Ideal:** **live event feed** — keep; make it the canonical heartbeat the homepage/cockpit borrow from.
- **Key live metrics:** latest event + freshness · totalUsdcRaised · totalSynSold · totalBuyers · milestones.
- **Primary CTA:** Registry. **Secondary:** Join.
- **Feel:** "Something just happened; this is live."
- **Confusion:** Activity (raw) vs Chronicle (curated) distinction; counters read 0 pre-first-member.

### `/registry`
- **Current:** already a pure data-grid dashboard (contracts, dossiers, wallets, routing, explorers, custody).
- **Ideal:** **contract / source-of-truth dashboard** — keep; this is the reference spine.
- **Key live metrics:** contract statuses (LIVE/PENDING) · expected vs actual SYN · routing · LP creation tx.
- **Primary CTA:** Verify. **Secondary:** Explorer indexes.
- **Feel:** "Every address is here; I can verify anything."
- **Confusion:** V1 (history) vs V2 (active) sale; custody = single EOA (docs mention multisig).

### `/ranks`
- **Current:** already a progression dashboard (your rank, ladder, distribution, members-by-rank, latest changes).
- **Ideal:** **progression dashboard** — keep; surface it in primary nav (it's belonging fuel).
- **Key live metrics:** your current/next rank · member distribution · recent promotions.
- **Primary CTA:** editorial → Join. **Secondary:** verify.
- **Feel:** "I can see where I fit and where I could climb — as recognition."
- **Confusion:** ladder items read like perks; "recognition not entitlement" repeated defensively; basis (cumulative USDC) under-explained.

### `/chapters`
- **Current:** story/progression page (overview stats, 5-chapter grid, disclosure).
- **Ideal:** **story + progression dashboard** — keep; resolve the Era/Chapter overlap so it's the single "formation timeline."
- **Key live metrics:** members so far · active chapter · chapter progress (derived).
- **Primary CTA:** Open chapter →. **Secondary:** Join.
- **Feel:** "The protocol is forming in chapters and I can join the current one."
- **Confusion:** Era vs Chapter (same names/ranges); "Open Era" appears in both; "earlier is not better" anti-FOMO can read as discouragement.

### `/nft`
- **Current:** artifact mint showcase (First Signal + Patron Seal, live supplies, collectors rail, proof strip).
- **Ideal:** **NFT collection / mint dashboard** — keep; **de-duplicate against `/archive`** (they share `ChapterOneHero`, `MythologyWall`, `LiveProofStrip`).
- **Key live metrics:** mint supplies / remaining · mint status + price · recent collectors · proof strip.
- **Primary CTA:** Mint The First Signal. **Secondary:** Verify on-chain.
- **Feel:** "I can collect proof I was early — separate from my seat."
- **Confusion:** **Join vs Mint** (artifact ≠ membership) — the single biggest cross-page confusion.

---

## 5. Member dashboard / cockpit (`/my-syndicate`)

**Should it be the main addictive dashboard after joining? Yes — and it already nearly is.** Headline "Your seat. Your assets. Your chronicle." with four zones: `MemberCockpit` → `MemoryZone` → `ProofZone` → `BuildingZone`.

**Element-by-element (present / missing / confusing / weak):**

| Element | Status | Note |
|---|---|---|
| Wallet identity | ✅ present | |
| Seat number | ✅ present | from Holder Index |
| SYN balance | ✅ present | "SYN received" |
| Rank | ✅ present | "Recognition" |
| Chapter | ✅ present | |
| Receipts | ✅ present | "routing receipt" |
| Owned artifacts | ✅ present | `CockpitCollector` |
| Referral status | ✅ present | correctly **PENDING/preview** |
| Next best action | ✅ present | `CockpitNextMove` |
| Since-you-were-away | ✅ present | `SinceLastVisitStory` |
| Recent protocol actions | ✅ present | `LivePulseStrip` |
| My actions | ✅ present | `ActivityStrip` |
| Share card | ✅ present | `MemberShareBlock` |
| Buy more | ✅ present | `CockpitActionRail` → `/join` |
| Mint artifact | ✅ present | via action rail |
| **Settings** | ❌ **missing** | no preferences/notification surface |

**Diagnosis:**
- **Present:** essentially the entire member-OS feature set. This is the strongest page on the site and should be treated as the product's home for members.
- **Missing:** Settings (minor); a clear **first-time onboarding state** (what a brand-new member sees the moment after joining) is weak; the **entry path** is weak — reachable only via the wallet chip, not surfaced as "your dashboard."
- **Confusing:** "Chronicle" (crypto-natives expect History/Receipts/Transactions); the "Operating System" metaphor is internal framing.
- **Weak:** the **addiction loop** (a reason to return) is implied via `SinceLastVisitStory` but not dramatized; `BuildingZone` is mostly PENDING ("not active today"), so the forward-looking half of the cockpit reads empty.

**Verdict:** the cockpit doesn't need new features so much as **promotion (make it the obvious post-join home), a real onboarding/empty-zero state, and a return-hook** — all within existing components.

---

## 6. Progression system

**The intended loop:** buy membership → receive SYN → cumulative purchase → stronger recognition → member number → chapter → actions → story trail → artifacts (memory) → (future) referral action loop.

| Link | Where it lives | Strength |
|---|---|---|
| buy → SYN | `/join` (live buy + access rate) | ✅ strong |
| cumulative USDC → rank | `/ranks` (RankHub, live) | ⚠️ strong data, but basis stated 3 ways; reads defensive |
| member # → chapter | `/chapters` + cockpit | ⚠️ strong, but Era/Chapter overlap muddies it |
| actions → story trail | `/activity` + cockpit memory | ✅ strong (heartbeat + since-last-visit) |
| artifacts → memory | `/nft` + `/archive` | ⚠️ strong, but artifact-vs-seat confusion + two routes |
| future referral loop | `/referral` (preview) | ✅ correctly future-labeled |

**Where it's strong:** the *data* for every progression link is live and on-chain. The activity heartbeat and the cockpit's since-you-were-away are genuine game-loop ingredients.

**Where it's broken:**
- **No single visible "ladder of belonging."** Rank, chapter, and era are three overlapping progression systems on three hidden pages; Alice can't see one clean "here's how you rise (as recognition)" spine.
- **The loop reads as disclaimers, not a game.** Every progression surface leads with denial ("recognition not entitlement," "earlier is not better," "no leaderboards"). The *anti-speculation* framing is correct doctrine but is currently louder than the *progression* itself — so it feels like compliance copy, not a protocol game.
- **The forward half is empty.** `BuildingZone` and referral are PENDING/preview, so "what's next for me" looks unbuilt rather than *coming*.

**The reframe (no new claims):** progression desire comes from *visibility of where you are and where you could go*, expressed as **recognition + place in the story**, never reward. The pieces exist; they need to be **unified into one legible progression spine** and **sequenced so the game shows before the disclaimer.**

---

## 7. Page hierarchy / navigation

**Current nav reality:** 6 primary (Activity, Vault, Artifacts/`/nft`, Verify/`/transparency`, Members, Token) + a **12-item "More" dropdown** (Archive, Roadmap, Referral·Preview, Tokenomics, Liquidity, Registry, Founders, Chapters, Ranks, Docs, Whitepaper, FAQ) + Join CTA + wallet chip → `/my-syndicate`. **~21 routes, ~18 nav destinations.** Progression pages (Ranks, Chapters) and economy pages (Liquidity, Tokenomics, Registry) are buried in "More."

**Recommended information hierarchy (structure only — no implementation):**

- **Tier 0 — Conversion (always visible):** `/join` (CTA), `/my-syndicate` (wallet chip / "your dashboard").
- **Tier 1 — Primary (the live economy + belonging):** Home (cockpit) · `/activity` (heartbeat) · `/vault` (treasury) · `/liquidity` (market) · `/ranks` (progression) · `/nft` (artifacts).
- **Tier 2 — Secondary (depth, one click in):** `/chapters` (story) · `/tokenomics` (supply) · `/members` · `/archive` (museum — *merge or clearly differentiate from `/nft`*).
- **Tier 3 — Proof / reference (skeptic tools):** `/transparency` · `/registry` · `/token` · `/docs` · `/whitepaper` · `/faq`.
- **Tier 4 — Future / preview (clearly labeled):** `/referral` (preview) · `/roadmap` · `/founders`.

**Too prominent today:** `/transparency` and `/token` sit in primary nav while progression/market pages hide in "More." Proof should be *reachable*, not *primary*.
**Hidden but important:** `/ranks`, `/chapters`, `/liquidity` (these are belonging + economy — they belong in Tier 1/2, not buried).
**Redundant:** `/nft` vs `/archive` overlap; consider one canonical artifact surface with the other as a sub-view.

---

## 8. LIVE / PREVIEW / FUTURE state system (correctness audit)

Applying the three-state model to the founder's specific items:

| Item | Current label | Correct? | Note |
|---|---|---|---|
| **Referral** | PREVIEW / SIMULATED, sticky banner, "no contract deployed" | ✅ correct | `commissionRouter = 0x0` on V2b confirms; keep "earn …when live" framing only |
| **Treasury Ledger** | SIMULATED / PREVIEW on `/transparency` | ✅ correct | keep visibly separated from live rows |
| **LP fees** | PENDING (no on-chain amount) | ✅ correct | genuinely unreadable; correct to not fabricate |
| **Marketplace** | future / not surfaced | ✅ correct | keep roadmap-only |
| **SeatRecord721** | PENDING (Archive ID2 = "IDENTITY / future ERC-721") | ✅ correct | watch: ID2 placeholder can imply the seat-NFT already exists |
| **Eras II–IX** | FUTURE (only Era I live; `EraSchedulePreview`) | ⚠️ mostly | on `/join` the preview sits next to the live buy widget — FUTURE labeling must stay unmissable so rates don't read as live |
| **NFT IDs** | LIVE (ID1, ID3) / DISABLED (ID2) / OWNER_ONLY (ID4–8) / NOT_CONFIGURED (ID9) | ✅ correct | live supplies 11 / 0 / 6 confirmed on-chain |
| **Burn** | shown as metric; ticker comment says "1,000 SYN" but value reads live `balanceOf(dead)` | ⚠️ **under-claim** | on-chain dead balance = **10,000 SYN**; the *displayed* value is live-correct, but `PROOF_OF_FIRE_001` documents only 1,000 → 9,000 undocumented (extraction contradiction #1). Hero panel also renders burn PENDING in places |
| **Vault** | LIVE balance; Vault *contract* PENDING | ✅ correct | keep "wallet not yield-vault, not member-claimable" |
| **Member count** | LIVE (Holder Index union) | ⚠️ | per-contract `memberCount` (V2b=8, V2a=5) ≠ canonical union; never surface a raw counter as identity |
| **Holder Index** | identity-of-record | ✅ correct | keep as the one identity truth |

**Systemic state issue:** the biggest *incorrect* pattern is **LIVE facts defaulting to PENDING/—** (most visible on the homepage hero, partly a dev-RPC artifact). In production those are LIVE. The model should be: **PENDING = genuinely unreadable (LP fees) or genuinely unbuilt (referral/marketplace/SeatRecord721); everything chain-readable renders LIVE.** Today PENDING is over-used as a default resting state, which under-claims the truth and makes a forming economy look empty.

---

## 9. Crypto-native visual direction (archetype per route)

Assigning each route one dominant archetype (no UI designed — direction only):

| Route | Archetype | Rationale |
|---|---|---|
| `/` (home) | **Protocol cockpit** (ticker + engines + seat) | the one frame that must show the whole live economy |
| `/join` | **Checkout / conversion** (focused) | strip to: buy widget + what-you-get + scarcity; move the 13-section depth below or into tabs |
| `/my-syndicate` | **Member OS** | the post-join home; identity + assets + actions + return-hook |
| `/ranks` | **Game progression** (recognition) | ladder/standing as recognition, never reward |
| `/chapters` | **Story progression / timeline** | formation narrative; single timeline (resolve Era overlap) |
| `/nft` | **NFT collection / mint** | collectible showcase; distinct from membership |
| `/archive` | **Museum** (or merge into `/nft`) | memory/history view; de-dup with `/nft` |
| `/vault` | **Treasury terminal** | live balances + routing |
| `/liquidity` | **Trading / market dashboard** | depth, price, chart, TVL |
| `/tokenomics` | **Supply / economy dashboard** | donut + allocations + supply discipline |
| `/transparency` | **Proof terminal** | data-grid-first proof, prose secondary |
| `/registry` | **Source-of-truth dashboard** | contract/address index |
| `/activity` | **Live event feed** | heartbeat |
| `/faq` | **Reference / support** | structured answers (not a dashboard) |
| `/referral` | **Future preview** (clearly simulated) | shape-only model |

**Overall:** a **balanced combination anchored by the protocol-cockpit archetype** — the homepage and `/my-syndicate` are cockpits; the economy pages are terminals/dashboards; the belonging pages are game/story progression; the proof pages are reference. One visual language (the existing obsidian-cockpit theme), four functional registers.

---

## 10. Minimum whole-site implementation direction (next sprint)

*(Direction only — no code, no copy, no renames.)*

**Touch first (highest desire-per-effort, mostly composition of existing parts):**
1. **Homepage** — un-hide / integrate the **already-built ticker**; lift the **already-built economy engines** (`RevenueStreams`, vault/LP/burn summaries) into a near-fold cockpit; pull liveness up. Re-sequence Alive → Legible → Belong → Verify.
2. **`/my-syndicate`** — make it the **obvious post-join home** (entry path + first-time/zero state + a return-hook); it already has the features.
3. **`/join`** — **reduce to a focused checkout** (buy + what-you-get + scarcity); demote the calculator/era-preview/rank-ladder/payment-strategy into secondary/expandable depth.
4. **Nav/IA** — promote **Ranks, Chapters, Liquidity** into primary/secondary; demote **transparency/token** out of primary into the proof tier; flatten the 12-item "More."

**Leave alone (already doing their job):**
- `/activity` (heartbeat), `/registry` (source-of-truth grid), `/liquidity` (market dashboard), `/vault` (treasury dashboard) — keep; only lift their key live metric into the global cockpit.
- `/referral` state hygiene (correctly preview) — do not touch its labeling.
- `/faq`, `/docs`, `/whitepaper` — reference tier, leave.

**Components to reuse (don't rebuild):**
- `ProtocolIntelligenceBar` (the ticker), `RevenueStreams` (the 3-stream economy), `LpStatusCard`, `VaultPolicyCore`/`TreasuryComposition`, `LivePulseStrip`/`ActivityHeartbeat`, `RankHub`, the cockpit zones.

**Components that should become global / first-class:**
- The **ticker** (un-hidden, everywhere public).
- A **unified "protocol engines" panel** (lift `RevenueStreams` from `/vault` to the homepage as the canonical six-engine view: Membership · Vault · LP · Burn · NFT · future Referral/Marketplace).
- The **activity heartbeat** as the shared live-event source the homepage and cockpit borrow from.

**Dashboards to unify:**
- The **economy truth** currently sprayed across `/vault` + `/liquidity` + `/tokenomics` + `/transparency` + `/registry` — keep the deep pages, but converge their headline metrics into **one homepage cockpit + one ticker** so Alice sees the machine before she route-hops.
- The **artifact story** split across `/nft` + `/archive` — one canonical surface.

**Metrics that must become first-class (LIVE, above the fold somewhere):**
- members · total USDC routed · vault balance · LP depth · burned SYN · next seat / chapter fill · last action.

**Legal guardrails that must remain untouched (carry forward verbatim):**
- No ROI / yield / dividend / return / equity / profit / "earn now" language anywhere.
- Members do **not** own the vault (protocol-controlled, transparently routed; never claimable).
- Rank / chapter / era confer **no rights** (recognition + coordinates only).
- Referral is **not live** (preview; commissions only "when CommissionRouter ships").
- NFT ≠ membership (SYN is the seat; artifacts are separate, optional mints).
- Eras II–IX must **not feel live** (only Era I; FUTURE labeling unmissable next to any rate).
- Holder Index stays the **identity truth**; SYN stays **the seat**; artifacts stay **the memory**; **70/20/10 is membership-sale routing only.**
- Every public number maps to an on-chain read or is labeled PENDING/FUTURE.

---

## Target feeling — restated as a whole-site acceptance test

> Alice lands and, before reading, sees a live ticker and an economy with several engines (cockpit), an open seat that's still early (belonging), and a heartbeat that just moved (alive). She clicks Join — a focused checkout, not a wall. After buying, she lands in her own cockpit (member OS) showing her seat, SYN, recognition, chapter, story trail, and what's next — with a reason to come back. Around it, the deep dashboards (vault, market, supply, registry) and the proof tools are one click away when she wants to verify. She knows what's LIVE, what's PREVIEW, and what's FUTURE. No yield, no return, no claim was promised. She thinks: *"I entered a live crypto protocol cockpit. I can see the economy and my place in it. I want a seat — and I'll be back."*

---

*End of whole-site product-desire + dashboard architecture pass. No implementation, no copy, no renames — by design. This is the sprint brief; the components to deliver it mostly already exist.*
