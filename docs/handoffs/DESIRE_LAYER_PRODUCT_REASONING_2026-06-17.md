# The Desire Layer — Product-Desire Architecture for the Crypto-Native Visitor

**Type:** Founder-grade product/design reasoning pass. **Not implementation.** No final copy, no renames, no protocol-correctness changes, no profit/ROI/yield/dividend/return/equity language.
**Date:** 2026-06-17
**Baseline:** `docs/handoffs/MASTER_LEDGER_2026-06-17.md`, `docs/handoffs/CANONICAL_SOURCE_EXTRACTION_2026-06-17.md` (chain re-verified block 88,218,601).
**Visitor model:** *Alice* — crypto-native, has seen 100 protocol landing pages, decides in ~8 seconds whether a thing is *alive and worth belonging to* before she reads a word.

> Grounding: this pass is written against the **actual current homepage** (screenshot of `/` + `src/routes/index.tsx` + the live component inventory), not from memory. Where it names a component or route, that surface exists today.

---

## 0. The one-sentence diagnosis

**The site is built like a courtroom exhibit when it needs to read like a living economy.** Every piece a crypto-native wants is already in the codebase — live routing, vault, LP, burn, NFT streams, member index, scarcity, an identity trail — but it is **fragmented across seven routes, gated behind PENDING pills, and sequenced verify-first.** Alice meets the *proof of honesty* before she meets the *thing worth joining*. Desire is an emphasis-and-composition problem here, not a truth problem.

---

## 1. What the current site communicates emotionally

From the actual above-the-fold (`ProtocolHero`):
- **Aesthetic:** strong. Obsidian cockpit, gold throne, radial flow, "Own the economy. Secure the future." This *looks* like a serious crypto protocol. The craft is not the problem.
- **Headline promise:** "SYN is your seat. Every dollar routes. Every action is verified. Artifacts are the memory." — accurate, dense, doctrine-correct.
- **Center diagram:** a **membership-sale routing diagram** — 70% Vault / 20% Liquidity / 10% Operations around "USDC ROUTED," with "MEMBERSHIP SALE · Entry." It answers *"where does my dollar go?"*
- **Right panel ("Protocol Overview"):** Members `PENDING`, Burned Supply `PENDING`, SYN Price `—`, Ref Market `$10M DERIVED`, Ref FDV `$10M DERIVED`, Initial Supply `1B SYN LIVE`, Effective Supply `— PENDING`.

**Net emotional read:** *"This is a careful, transparent, slightly austere protocol that wants me to verify it."* It signals **integrity and restraint**. What it does **not** yet signal is **momentum, abundance, or aliveness**. The dominant on-screen tokens are `PENDING`, `—`, and `DERIVED` — three flavors of "not yet / careful / disclaimer." For a crypto-native, a wall of PENDING reads as *empty or unfinished*, not *early*. The hero shows **where one dollar goes**, not **an economy breathing**.

> Founder's hero questions, answered bluntly:
> - *Strong enough for a crypto-native?* Visually yes; energetically no.
> - *Full economy or only membership-sale volume?* **Only the membership sale.** Vault/LP/Burn/NFT/Referral/Marketplace are not in the hero as one system.
> - *Communicates live money flows?* It implies a flow shape (70/20/10) but shows no **magnitude or velocity** above the fold (numbers are PENDING/—).
> - *Shows the streams as one ecosystem?* No — they are scattered (see §4).
> - *Feels alive?* Not yet. Liveness lives lower (`LivePulseStrip`, `HomeActivityTape`) in Act 03, below the fold.
> - *Makes Alice want to belong?* It earns *trust* before it earns *want*. The seat hook ("YOU ARE VISITOR / Seat — available") is present but quiet.

---

## 2. What a crypto-native visitor wants to see first

Alice's pre-reading checklist, in priority order. Map of "does the current hero deliver it":

| Rank | What Alice needs to feel | Mechanism she scans for | Present in hero today? |
|---|---|---|---|
| 1 | **It's alive** | numbers moving; "last action 12s ago"; recent buys | ❌ (liveness is in Act 03, below fold) |
| 2 | **It's real & on-chain** | chain name, contract, verifiable | ✅ (Avalanche, verify CTA, addresses) |
| 3 | **There's economic surface area** | an aggregate magnitude — total routed, vault size, LP depth, supply | ⚠️ partial (split shape, but magnitudes PENDING) |
| 4 | **I can get in, and it's early** | seat #, chapter filling, "earliest are sealed first" | ⚠️ present but quiet ("Seat — available") |
| 5 | **What exactly do I get** | membership = SYN + indexed identity + future trail; artifacts separate | ⚠️ stated in one dense line |
| 6 | **It's not a scam / not a security** | transparent, no ROI promises | ✅ (strong) |

The current hero is **excellent at #2 and #6** (the defensive virtues) and **weak at #1, #3, #4** (the desire virtues). Crypto-native desire is built on **#1 → #3 → #4** *first*; trust (#2/#6) is the close, not the open.

**The reframe:** the hero's job is to make Alice feel *"this economy is forming live and I can still get in early,"* and only then hand her the verify rail. Today it does the reverse.

---

## 3. What live metrics should be hero-level

Principle: **lead with the smallest set of LIVE, on-chain, magnitude-or-velocity numbers that prove the economy is alive — not with disclaimers.** Candidates that are *genuinely readable on-chain today* (so they can be LIVE, not PENDING, in production):

**Tier-1 (aliveness — show the heartbeat):**
- **Total USDC routed** across all sale contracts (V1∪V2a∪V2b) — the single best "economy has volume" signal. (Today the hero shows the *shape* 70/20/10 but not the *amount*.)
- **Members** (Holder-Index count, union of all sale contracts) — "N people already took a seat."
- **Last protocol action + freshness** ("a seat was taken Ns/Ms ago") — the literal pulse. This already exists as data (`LivePulseStrip`, hero last-activity estimate) but sits below the fold.

**Tier-2 (surface area — show the machine has size):**
- **Vault balance** (70% destination, on-chain readable) — the "it accumulates as members join" proof the founder explicitly wants Alice to grasp.
- **LP depth** (Trader Joe SYN/USDC pair is live) — "there's a real market."
- **Burned supply** — this is a **concrete on-chain fact (10,000 SYN at the dead address today)**, yet the hero renders it `PENDING`. That is under-claiming a true number.
- **Supply / circulation** (1B fixed; circulating = supply − burned − unsold) — the "supply changes through chapters/eras" story.

**Tier-3 (belonging — show the door):**
- **Current chapter + seats remaining in it**, and **next seat #** — scarcity and progression without any profit claim.

> Caveat from the extraction (keep honest): **LP fee amounts are not readable on-chain** → those stay PENDING by design. **Ref Market/FDV** are framed off the fixed $0.01 access rate (legal framing) and labeled DERIVED — fine, but they should not be the *loudest* numbers in the panel; magnitude/velocity should outrank valuation.

---

## 4. What protocol-economy streams should be grouped together

**The canonical decomposition already exists** in `src/lib/revenue-streams.ts` / `RevenueStreams.tsx` (currently rendered **only on `/vault`**). It correctly separates: **Membership Sale (70/20/10)**, **NFT mints (separate stream)**, **LP fees (separate stream)**. The product move is to **lift this into one homepage "protocol engines" view** and extend it to the full set, each carrying its own honest state:

| Engine | What it is | On-chain readability | State |
|---|---|---|---|
| **Membership** | USDC → SYN at fixed rate → 70/20/10 routing | volume + split readable | **LIVE** |
| **Treasury / Vault** | 70% accumulation; grows as members join | balance readable | **LIVE** |
| **Liquidity / LP** | 20% routing + live Trader Joe market | depth readable; fee amount not | **LIVE (depth) / PENDING (fees)** |
| **Artifacts / NFT** | Archive1155 mints (First Signal, Patron Seal) — *separate from membership* | supplies readable (11 / 0 / 6) | **LIVE** |
| **Burn** | manual verifiable burns; supply reduction | dead-address balance readable (10,000 SYN) | **LIVE** |
| **Referral** | smart-contract commissions when CommissionRouter ships | router = `0x0` today | **FUTURE** |
| **Marketplace** | future secondary/utility surface | not built | **FUTURE** |

**The desire payload of grouping:** seeing six engines in one frame — five glowing LIVE, two clearly labeled FUTURE — is what makes Alice think *"this is a whole economy, not a token sale."* Today she can only assemble that picture by visiting `/vault`, `/liquidity`, `/tokenomics`, `/transparency`, `/archive`, `/nft`, and `/referral` separately. **The components are built; they are just not composed.**

Critical doctrine guard to preserve while grouping: **only the Membership Sale uses 70/20/10.** NFT mint proceeds accrue to the Archive owner/treasury; LP fees accrue to the LP position. The grouping must show distinct destinations, never imply one pooled "treasury" Alice has a claim on.

---

## 5. What should be LIVE vs PREVIEW vs FUTURE

A clean three-state model the next sprint can enforce so PENDING stops meaning four different things:

**LIVE (chain-readable today → must read LIVE in production, not PENDING):**
- Members / Holder Index · SYN total supply (1B) · USDC routing 70/20/10 · Vault / Liquidity / Operations balances · Burn total (10,000 SYN) · NFT supplies (ID1=11, ID3=6) · LP pool existence + depth · active sale (V2b, Era I) · current chapter / next seat.

**PREVIEW / SIMULATED (built as UX, explicitly not real data):**
- Treasury Ledger UI (`/transparency`) · Referral attribution / builder scores (`/referral`, `commissionRouter=0x0`) · any money-derived referral figure (quarantined).

**FUTURE / ROADMAP (not built / not deployed — honest "coming," never implied live):**
- Live referral commissions (CommissionRouter) · Marketplace · Eras II–IX (only Era I live) · SeatRecord721 (the permanent seat NFT) · owner-only artifacts ID4–8 · Protocol Chronicle ID9 · LP **fee amounts** (unreadable → PENDING within the LIVE LP engine).

**The key correction:** much of today's `PENDING` is a **dev-environment RPC artifact** (the dev preview can't read Avalanche RPC, so live values blank to PENDING). That has trained the *design* to treat PENDING as the default resting state. In production those are LIVE. **A forming economy shown as PENDING reads as empty; shown as LIVE-with-small-numbers it reads as early.** "Early and real" is desirable; "pending and blank" is not.

---

## 6. Where the current design is too defensive

1. **PENDING-as-default.** The hero panel's resting state is a stack of `PENDING` / `—`. Even true, readable facts (Members, Burned Supply) render PENDING. Defensiveness has been generalized into a visual default.
2. **Disclaimer-stacking.** `DERIVED` on Ref Market + Ref FDV, plus the global risk posture, plus "not a promise" act framing — the visitor meets three hedges before one magnitude.
3. **Verify-first sequencing.** Act 01's marker is *"a living protocol — not a promise. Here is its state."* The *negation* ("not a promise") leads. The protocol apologizes before it seduces.
4. **The economy is hidden on the homepage.** `index.tsx` sets `hideIntelligenceBar` — the global economy ticker (`ProtocolIntelligenceBar`) is **explicitly suppressed** on the one page Alice lands on. The full economy view (`RevenueStreams`) is quarantined to `/vault`.
5. **Hero scope shrunk to one stream.** Showing only membership routing (not vault size, LP depth, burns, NFT mints) is an over-correction — it avoids any aggregate that *might* look like a treasury value, at the cost of looking small.

---

## 7. Where the current design is not exciting enough

1. **No heartbeat above the fold.** Liveness (`LivePulseStrip`, `HomeActivityTape`, "Ns ago") is real but lives in Act 03, below the fold. The first frame is static.
2. **No magnitude.** Nothing in the first frame tells Alice *how much* has flowed, *how many* joined, or *how fast*. Shape without size.
3. **Scarcity is whispered.** "Seat — available" and "earliest members are sealed in first" are present but typographically quiet; the seat-# / chapter-filling tension isn't dramatized.
4. **The six-engine "whole machine" wow-moment never happens.** Alice never sees Membership + Vault + LP + Burn + NFT + (future) Referral/Marketplace glowing together. That single composition is the biggest untapped desire lever and it's *already 80% built*.
5. **Identity/story is framed as archive, not as a live trail Alice starts now.** "Artifacts are the memory" is doctrinally right but lands as *museum*, not *your story begins on join*.

---

## 8. Where legal safety is blocking desire unnecessarily

These are places where caution is taxing desire **without** protecting anything — fixable with **emphasis/composition, not new claims**:

- **Hiding magnitude ≠ legal safety.** Showing *total USDC routed*, *vault balance*, *LP depth*, *burn total* as **factual on-chain reads with a verify link** is description, not a promise. Suppressing them doesn't reduce legal risk; it just makes a real economy look empty.
- **Defaulting live facts to PENDING under-claims the truth.** The doctrine is "every claim maps to an on-chain read or is labeled PENDING." Burned supply *has* an on-chain read (10,000 SYN). Rendering it PENDING isn't extra-safe — it's *less* truthful and kills a credibility signal.
- **Leading with negation.** "Not a promise" framing can move from the *opening* to the *close* (the verify rail) without weakening any disclaimer.
- **Suppressing the intelligence bar on the homepage.** A transparent live ticker of on-chain facts is the *most* legally clean thing the site has; hiding it on the landing page forfeits desire for no safety gain.
- **Treating "economy size" as if it implies "claimable value."** It doesn't, as long as the framing stays "protocol-controlled assets, transparently routed" (existing doctrine) and never "your share / your return."

> The line to hold: **magnitude + velocity + transparency = allowed and desirable. Entitlement + forecast + return = forbidden.** Most current defensiveness is sitting on the wrong side of that line, suppressing the allowed half.

---

## 9. What must remain legally safe (non-negotiable — carry forward unchanged)

- SYN is an **experimental utility membership token** — *not* equity, debt, a dividend instrument, yield, or a promise of profit. Participation may incur total loss.
- **No** ROI / yield / dividend / return / profit-share / passive-income / appreciation / equity / redemption / "earn" language anywhere.
- **Rank / chapter / era = recognition & coordinates only.** No rights, returns, governance, discounts, or pricing power. (The `RankTier.benefits[]` naming flagged in the extraction stays a watch-item, not a desire lever.)
- **Vault = protocol-controlled assets, transparently routed.** Never member-claimable, never "treasury claim," never "your share."
- **Every public number maps to an on-chain read or is labeled PENDING / FUTURE.** Magnitude is allowed; forecasts are not.
- **Referral is FUTURE.** It may be described as "smart-contract commissions when CommissionRouter ships," always clearly not-live today (`0x0`). No "earn now."
- **Artifacts are separate from membership.** Joining delivers SYN + indexed identity; an NFT is a distinct, optional mint. (Also resolves the join→NFT confusion from the extraction.)
- **"Routed," not "raised."** Self-service, same rate for everyone, no per-tier perks.
- SeatRecord721 / Marketplace / Eras II–IX remain **labeled future** until on-chain.

---

## 10. Minimum product/design direction for the next implementation sprint

*(Direction only — no copy, no code, no renames.)*

**A. Re-sequence the emotional arc: Alive → Legible → Belong → Verify.**
Today it is effectively Verify → Belong → Alive. Move the heartbeat and the economy up; keep verification one click away as the *close*, not the open. The existing 5-act scaffold can stay; the *first frame's emphasis* is what changes.

**B. Upgrade the hero from "where my dollar goes" to "a living economy + my seat in it."** Three jobs in the first frame:
   1. **Heartbeat** — one liveness signal (recent action + freshness) pulled up from `LivePulseStrip`.
   2. **Magnitude** — a tiny set of LIVE aggregates (total routed · members · vault) instead of a PENDING stack.
   3. **The door** — seat-#/chapter-fill scarcity, dramatized, with the primary Join CTA.

**C. Compose the "protocol engines" view on the homepage.** Lift the *already-built* `RevenueStreams` (3 streams) into a six-engine economy panel (Membership · Vault · LP · Burn · NFT · future Referral/Marketplace), each with a LIVE/PENDING/FUTURE state. This is the single highest-leverage, lowest-build-cost desire move — the parts exist on `/vault`, `/liquidity`, `/tokenomics`.

**D. Stop hiding the economy.** Reconsider `hideIntelligenceBar` on `/`. A transparent live ticker of on-chain facts is pure upside for a crypto-native and pure legal-clean.

**E. Make LIVE read LIVE.** Establish the three-state model (§5) so PENDING is reserved for genuinely-unreadable (LP fees) or genuinely-future (referral) — not for dev-RPC blanks. Production should render the real small-but-real numbers; "early and real" beats "pending and blank."

**F. Reframe identity as a trail that *starts on join*, not an archive to admire.** Keep "artifacts are the memory" doctrine; shift the *felt* message from museum to *"your story begins the moment you take a seat."*

**G. Hold every guard in §9.** The entire move is emphasis, composition, and honest LIVE-labeling — zero new claims, zero profit language.

---

## The target feeling — restated as an acceptance test

> Alice lands on `thesyndicate.money`. Within ~8 seconds, **before reading any paragraph**, she sees: a number that just moved (alive), an economy with real size and several engines (legible), an open seat that's still early (belong), and a verify button she trusts but doesn't need yet (proof). She thinks: *"This is a transparent crypto economy forming live — and I can still get in early. I want a seat."* No yield was promised. No return was implied. The desire came from **liveness, surface area, and early belonging** — all of which the protocol already has on-chain and mostly already has in code.

---

*End of product-desire architecture. No implementation, no copy, no renames — by design. This is the brief the next sprint builds against.*
