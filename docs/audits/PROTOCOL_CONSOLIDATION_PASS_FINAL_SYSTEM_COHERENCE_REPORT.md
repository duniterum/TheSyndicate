# THE SYNDICATE — PROTOCOL CONSOLIDATION PASS: FINAL SYSTEM COHERENCE REPORT

*Date: 2026-06-12. **Read-only.** No features, no new layers, no broad re-audit — this is a coherence view, not an expansion. Grounded in the live code registries, the route tree, `docs/canon/*`, the MASTER work map, and the existing Full Protocol View audit. Governing principle throughout: **on-chain truth → code registries → execution gates → canonical docs.** Code outranks docs.*

Written through seven lenses, applied where each matters most:

- **Founder** — does the built system still mean what it was meant to mean?
- **CTO** — single sources of truth, drift surfaces, what is real vs modelled.
- **Product Lead** — does the surface set add up to one product, or many?
- **UX Lead** — can a human discover the right thing in the right order?
- **Governance Designer** — what is reserved, and is the seam honest?
- **Long-term Member** — is identity permanent and memory continuous?
- **First-time Visitor** — is the 10-second contract honoured?

> **Headline.** The Syndicate is **architecturally complete and doctrinally clean.** The full memory pipeline (Event → … → Chronicle → Lineage → Knowledge Map) exists end-to-end as deterministic, on-chain-anchored derivers. The remaining work is **not engineering — it is coherence and gating.** The two real liabilities are (1) **surface sprawl + naming collisions** at the navigation layer, and (2) a **powerful memory engine held almost entirely inside `/labs`**, surfaced publicly through only three controlled bridges. Neither is a defect; both are the next maturity step.

---

## SECTION 1 — WHAT EXISTS (the definitive map)

Status legend: **LIVE** (on-chain-backed, public) · **PARTIAL** (built, partially surfaced) · **HELD** (built, deliberately quarantined in `/labs`) · **PENDING** (modelled, awaiting data/contract) · **FUTURE** (doctrine only, intentionally unbuilt).

### The substrate: the 5-layer adjacency engine
- **Purpose.** The constitution of how a fact becomes memory: `TRUTH → EVENTS → SIGNALS → MEMORY → STORY`, refined through the pipeline **Event → Signal → Memory Candidate → Chronicle Review Candidate → Promotion Decision → Institutional Register → (Public Register) → Chronicle Admission → Chronicle Entry → Chronology → Timestamp → Lineage → Public Chronicle / Activity Lineage / Knowledge Map.**
- **Source of truth.** `docs/canon/05_FOUNDATION_FREEZE.md` (the law) + the per-layer code registries/derivers.
- **Public surfaces.** Only three controlled bridges: the `/chronicle` institutional-backing line, `/institutional-register`, and `/knowledge-map`.
- **Internal surfaces.** The entire `/labs/*` set (signals, memory-candidates, chronicle-candidates, chronicle-promotion, chronicle-admission, chronicle-entries-preview, chronicle-timeline, protocol-lineage, knowledge-map, institutional-register, protocol-memory, protocol-events, protocol-intelligence).
- **Dependencies.** Reads EVENTS only (Adjacency Law: SIGNALS never read MEMORY); money may feed a Financial Trace but never alone raise a tier or confer standing.
- **Status. HELD.** The refinement chain is built and tested; the **feedback/diffusion loop is intentionally not assembled** in production. This is the single most important fact about the system's maturity.

### Membership
- **Purpose.** The product: buy SYN with USDC, receive a permanent on-chain seat.
- **Source of truth.** `syndicate-config.ts` (Membership Sale contract, `$0.01`/SYN, `$5` min, 70/20/10 routing), `sale-hooks.ts`.
- **Public surfaces.** `/` (hero/CTA), `/join`, `/token`, `/tokenomics`.
- **Internal surfaces.** Sale write-path invariants (`SALE_FLOW_INVARIANTS.md`).
- **Dependencies.** On-chain sale + USDC; allocation wallets.
- **Status. LIVE.**

### Holder Index
- **Purpose.** Derive member set, member #, cumulative USDC, neighbours.
- **Source of truth.** `holder-index.ts`, fed by the **one canonical `purchase-events` getLogs scan** (incremental cursor + reorg overlap, persisted complete-scan-only).
- **Public surfaces.** `/members`, `/my-syndicate`, `/wallet/:address`, co-witness bands.
- **Internal surfaces.** `/labs/protocol-events`.
- **Status. LIVE.**

### Ranks
- **Purpose.** Structural recognition derived from cumulative USDC — **confers nothing.**
- **Source of truth.** `RANKS_V2` + `rankForUsdc` (monotonic). Ruling: `RANK_CONSTITUTIONAL_RULING.md`.
- **Public surfaces.** `/ranks`, a secondary line on member pages.
- **Status. LIVE.** Begins at cumulative-USDC; ends at a recognition label. Never identity, never a ladder of people, never a reward/multiplier.

### Chapters
- **Purpose.** Belonging cohorts by member number.
- **Source of truth.** `chapters.ts` (I Genesis Signal #1–333 · II First Thousand #334–1,000 · III Expansion #1,001–3,333 · IV First Ten Thousand #3,334–10,000 · V Open Era #10,001+).
- **Public surfaces.** `/chapters`, `/chapters/:slug`, identity ribbons. **Status. LIVE.**

### Milestones
- **Purpose.** Shareable protocol moments.
- **Source of truth.** milestone derivation + `og-data.server.ts`.
- **Public surfaces.** `/milestone/:id`, OG cards. **Status. PARTIAL** (windowed/first-claim wording gated by completeness).

### Chronicle
- **Purpose.** The curated canon of protocol history.
- **Source of truth.** `chronicle-entries.ts` (3 **locked**, hand-curated, published entries) + the derived (draft-only) entry pipeline that **never auto-publishes**.
- **Public surfaces.** `/chronicle` (locked entries + a restrained institutional-backing line when an active genesis fact overlaps).
- **Internal surfaces.** `/labs/chronicle-*`. **Status. PARTIAL** (locked canon LIVE; derived publication FUTURE/governance-gated).

### Institutional Register
- **Purpose.** Durable store of **promotion decisions** about protocol-institutional facts (≠ a published feed; member-living excluded).
- **Source of truth.** `institutional-register-public.ts` + genesis seed (`institutional-register-genesis.ts`, CONFIG→SEED, dedup by tx).
- **Public surfaces.** `/institutional-register`. **Status. LIVE** (active + draft shown; member-living register modelled-but-empty/BLOCKED).

### Activity
- **Purpose.** The raw, unfiltered on-chain stream (pointer, not canon).
- **Source of truth.** `protocol-events.ts`.
- **Public surfaces.** `/activity` (+ a metadata-only lineage indicator). **Status. LIVE.**

### Treasury
- **Purpose.** Where protocol USDC/assets live and how they route.
- **Source of truth.** `syndicate-config.ts` (`VAULT_ALLOCATION`, allocation wallets; Vault Wallet 70% USDC == Vault Reserve 25% SYN, **same address**), live reads via `useProtocolTruth`/`useProtocolPulse`/`useAllocationBalances`.
- **Public surfaces.** `/vault`, `/transparency`, `/tokenomics`, `/registry`.
- **Status. LIVE** for routing/wallets; `VAULT_ASSETS`/`VAULT_INFLOWS` are **mock, quarantined + labelled** behind preview surfaces (the standing #1 credibility item).

### Revenue Streams
- **Purpose.** Honest per-stream income routing + amount status.
- **Source of truth.** `revenue-streams.ts` (pure config): Membership Sale → 70/20/10 (**only** stream using the split, amount LIVE); Archive mints → contract, withdrawable by `owner()` to `treasury()` (destination LIVE, amount PENDING); LP fees → pair reserves (amount PENDING, never computed).
- **Public surfaces.** `/vault#revenue-streams`, cross-link on `/liquidity`. **Status. LIVE** (destinations) / **PENDING** (cumulative amounts, by doctrine).

### Archive / NFT
- **Purpose.** Collectible protocol-memory artifacts (not financial rights).
- **Source of truth.** `archive-id-registry.ts`, `archive-config.ts`, `archive-nft-hooks.ts`. ID1 First Signal (0.50 USDC) + ID3 Patron Seal (5.00 USDC) LIVE/mintable; ID2 reserved; ID9 Protocol Chronicle NOT_CONFIGURED.
- **Public surfaces.** `/archive`, `/nft`, `/nfts` (alias → `/nft`). **Status. LIVE** (ID1/ID3) / **PENDING** (ID2/ID9).

### Knowledge Map
- **Purpose.** Index of where each kind of protocol knowledge lives.
- **Source of truth.** `protocol-knowledge-map.ts` (zero-import leaf) → doc 09 → `/knowledge-map` (public 3-bucket projection) + `/labs/knowledge-map`. **Status. LIVE.**

### Chronology · Timestamp · Lineage
- **Purpose.** Order facts by verified block (Chronology); thread a verified block-timestamp as metadata (Timestamp); re-express a chronology entry's carried trail (Lineage — a pure 1:1 projection, **not** a new layer).
- **Source of truth.** `chronology-registry.ts`, `chronology-timestamps.ts` (the one wagmi-allowed I/O hook), `protocol-lineage.ts`.
- **Public surfaces.** `/activity` lineage indicator; otherwise `/labs/chronicle-timeline`, `/labs/protocol-lineage`.
- **Status. PARTIAL** — order is LIVE; `chronology.date` is still **null end-to-end** in the public path (block-timestamp lookup not wired through). This is the one genuine plumbing gap.

### Referral
- **Purpose.** Attribution only (`?ref`). **No rewards, ever, without legal sign-off.**
- **Source of truth.** `referral-attribution.ts` + labs preview. **Public surface.** `/referral`. **Status. PARTIAL** (attribution stub; rewards FUTURE/forbidden).

### Recognition (memory-output)
- **Purpose.** A future memory-output layer distinct from rank.
- **Source of truth.** Recognition doctrine; partial concept. **Status. PENDING** (needs member register + ratification). Public scoring is a **hard no-touch**.

### Seat Record (SeatRecord721)
- **Purpose.** A future, separate ERC-721 identity contract.
- **Source of truth.** `contract-registry.ts` (address correctly **null**), `SEAT_RECORD_ARCHITECTURE_DECISION.md`. **Status. FUTURE** (Phase 5). SYN is the seat today; artifacts are the memory.

### DAO path
- **Purpose.** Eventual governance.
- **Source of truth.** `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` (doctrine only). **Status. FUTURE.** "Council" the rank ≠ "Council" the governance body (reserved).

### Supporting public surfaces (not in the prompt's list, but they exist)
`/transparency`, `/registry`, `/protocol-health` (noindex), `/founders`, `/whitepaper`, `/docs`, `/faq`, `/roadmap`, `/risk`, `/token`, `/episodes` (Story scaffold), `/ai` (honest PENDING placeholder — no contract, no claim, no waitlist), `/x/tx/:hash` (tx share/redirect).

---

## SECTION 2 — DUPLICATION CHECK

| # | Duplication | Why it exists | Intentional? | Should it remain? |
|---|---|---|---|---|
| 1 | **"Registry" collision** — `/registry` (contract/wallet index) vs **Institutional Register** (`/institutional-register`, memory store) | Two unrelated systems both adopted the word "register/registry" | **No** — accidental | **Resolve.** Same word, two concepts at the nav layer is the single worst discoverability trap. Rename one (e.g. `/registry` → "Protocol Ledger/Contracts"; keep "Institutional Register" for memory). Already flagged in `terminology-collisions`. |
| 2 | **70/20/10 narrative** repeated on `/transparency`, `/tokenomics`, `/vault`, `/registry` | Each surface independently teaches routing | Partly | **Trim.** Values can't drift (single `VAULT_ALLOCATION` source), but the *story* is told 4×. Keep one canonical explainer (`/transparency`) and have the others reference it. |
| 3 | **Token surfaces** — `/token` (contract/spec) vs `/tokenomics` (supply/allocation/utility) | Identity-of-token vs economics deep-dive | **Yes** | Keep, but cross-link tightly; they currently read as near-siblings. |
| 4 | **NFT surfaces** — `/nft`, `/nfts` (alias), `/archive` | `/nfts` is a deliberate canonical alias for inbound links; `/archive` is the broader protocol-memory surface | **Yes** | Keep `/nfts` alias; clarify `/archive` ≠ `/nft` (memory vs mint) in copy. |
| 5 | **Treasury surfaces** — `/vault`, `/transparency`, `/protocol-health` | Vault = treasury+revenue; transparency = verify narrative; protocol-health = module status | Mostly | Keep, but the boundary between `/vault` and `/transparency` is fuzzy; define "vault = money, transparency = proof". |
| 6 | **Memory/record surfaces** — `/chronicle`, `/activity`, `/institutional-register` | Canon vs raw stream vs institutional decisions | **Yes** (this is the spine/pointer/canon doctrine) | Keep — this separation is doctrinally correct and well-executed. |
| 7 | **Doc surfaces** — `/docs`, `/whitepaper`, `/faq` | `/docs` is a hub that links to `/whitepaper` (vision) and others | **Yes** | Keep (hub pattern is healthy). |
| 8 | **Public vs labs twins** — `/knowledge-map` vs `/labs/knowledge-map`, `/institutional-register` vs `/labs/institutional-register` | Public projection vs internal full view | **Yes** | Keep — projection discipline is correct. |

**Net.** Only **#1 and #2** are real problems. Everything else is intentional and doctrinally sound.

---

## SECTION 3 — SOURCE OF TRUTH CHECK

| Fact | Lives in | Displayed on | Duplicated? | Can it drift? |
|---|---|---|---|---|
| **Member count** | `holder-index.ts` ← canonical `purchase-events` scan | `/members`, `/my-syndicate`, home | One derivation, many readers | **No** — single scan; ~31 consumers share it. |
| **First member** | genesis seed (held-not-invented ordinals) | `/institutional-register`, `/chronicle` backing | Seed + Chronicle | **No** — Chronicle backing reads the *active* seed, not a second copy. |
| **First liquidity** | genesis seed (deployment fact) | `/institutional-register`, `/liquidity` | No | **No.** |
| **First burn (Proof of Fire #001)** | `1,000 SYN → 0x…dEaD`; burned = `balanceOf(dead)` | `/vault`/supply surfaces, genesis seed | Pinned card | **No** — burned is read from the dead address, never `1B − totalSupply`. |
| **Treasury balances** | live reads (`useProtocolTruth`/`useAllocationBalances`) | `/vault`, `/transparency`, `/tokenomics` | Read on several surfaces | **Low** — same hooks; **risk is the mock `VAULT_ASSETS`** (quarantined/labelled, but a drift surface until removed). |
| **NFT issuance** | `archive-id-registry.ts` + on-chain | `/nft`, `/archive` | No | **No.** |
| **Chapter progression** | `chapters.ts` | `/chapters`, ribbons, cockpit | One function | **No.** |
| **Milestones** | derivation + completeness flag | `/milestone/:id`, OG | No | **Low** — gated by windowed-first-claim wording. |
| **Revenue streams** | `revenue-streams.ts` | `/vault`, `/liquidity` | No | **No** — `routedThroughMembershipSplit` cross-checked vs `VAULT_ALLOCATION` in tests. |
| **All headline metrics** | `protocol-metrics-registry.ts` (THE registry) | truth layer + verify drawer + surfaces | Projected, not copied | **No** — all surfaces project from one registry via aliases. |
| **Contracts/addresses** | `chain-registry.ts` / `contract-registry.ts` / `syndicate-config.ts` | `/registry`, everywhere | Imported, never literal | **No** (SeatRecord721 correctly null). |

**CTO verdict.** Source-of-truth discipline is **excellent.** The one standing drift surface is the **mock Vault data** (`VAULT_ASSETS`/`VAULT_INFLOWS`) — already quarantined and labelled, but it should be removed or replaced with a live read to fully close the gap.

---

## SECTION 4 — USER JOURNEY

**A) First-time visitor.** `/` → 10-second contract (what SYN is / is not) → `/transparency` (proof) → `/join`. **Trust path:** home → transparency → registry → Avascan. **Verification path:** any claim → explorer link. **Dead ends:** `/protocol-health` (noindex, internal tone) and the `/labs/*` set are reachable by URL but offer a visitor nothing; `/ai`, `/episodes` are honest PENDING but can feel like empty rooms if linked prominently.

**B) Prospective member.** `/` → `/token` + `/tokenomics` (what am I buying) → `/ranks` + `/chapters` (what do I become) → `/join`. **Friction:** the "what I become" story is spread across `/ranks`, `/chapters`, `/founders`, `/members` — strong material, no single "why join" narrative spine.

**C) Existing member.** `/my-syndicate` (the cockpit: Identity → Place → Ownership → Momentum → Action, with Memory/Proof/Building below) → `/wallet/:address` (their public seat) → `/members` (co-witness). **This journey is the strongest in the product** — one coherent narrative arc.

**D) Researcher / verifier.** `/transparency` → `/registry` → `/activity` (raw stream) → `/institutional-register` (decisions) → `/knowledge-map` (where everything lives) → explorer. **Excellent** for a determined verifier; **overwhelming** for a casual one (too many adjacent surfaces, see Section 2 #1).

**E) Future governance participant.** Today: `/institutional-register` + doctrine docs only. **Correctly a dead end** — there is no governance to participate in yet, and the system says so honestly rather than faking it.

**Dead ends to address:** (1) `/labs/*` and `/protocol-health` should be clearly "operator" surfaces, not visitor-reachable equals; (2) no single "Why join" spine; (3) `/episodes` + `/ai` are honest-but-empty — keep PENDING, don't feature.

---

## SECTION 5 — INFORMATION ARCHITECTURE

- **Homepage.** Honours the 10-second contract; CTA clear. **Missing:** a one-screen "how to verify in 30 seconds" and a single "why become a member" thread. **Right order, slightly under-narrated.**
- **Chronicle.** Correctly the curated canon; the locked-entry + restrained-backing model is doctrinally exemplary. **Right.**
- **Activity.** Correctly the raw pointer, distinct from Chronicle. **Right.**
- **Registry.** Strong content, **wrong/ambiguous name** (collides with Institutional Register). **Rename — highest-leverage IA fix.**
- **Vault.** Treasury + revenue streams; boundary with `/transparency` is fuzzy. **Define the split** (vault = money state; transparency = proof).
- **NFT.** Clear (mint vs memory); alias handled well. **Right.**
- **My Syndicate.** The best-architected surface — a single narrative arc. **Right; use it as the model for the public "why join" spine.**

**What's missing:** a "Start here / Verify here / Join here" triad on the homepage; a sitemap/IA that visibly separates **public** from **operator (`/labs`, `/protocol-health`)** surfaces.
**What's misplaced:** `/protocol-health` (operator tool, public URL) and the rich `/labs` pipeline (production-quality work, visitor-reachable).
**What should move:** consolidate the four 70/20/10 explainers behind one; fold the "what you become" surfaces into a clearer membership spine.

---

## SECTION 6 — FUTURE GATED WORK (intentionally deferred)

- **Governance-gated:** Chronicle publishing action (draft→published seam exists, never auto-publishes); Recognition layer ratification; member-living register entries.
- **DAO-gated:** Governance/voting/council body; any member-memory→chronicle ratification path.
- **Contract-gated:** SeatRecord721 (address null until deployed); referral CommissionRouter; Archive ID2/ID9 on-chain configuration.
- **Data-gated:** `chronology.date` (needs block-timestamp lookup wired to the public path); cumulative NFT-revenue + LP-fee **amounts** (no single on-chain read exists — PENDING by doctrine); real treasury-asset surfacing (replace mock `VAULT_ASSETS`).
- **UX-gated:** Story/episode presentation (needs a real time axis + approved narrative policy); knowledge-graph visualization; cross-link tidy.
- **Doctrine no-touch (do not build):** public Recognition scoring, referral rewards, AI systems, marketplace, fake Story, founder glorification, any yield/ROI/dividend language.

Each item is reserved **honestly** — the seam is modelled as data, the public copy says PENDING/FUTURE, and nothing claims to exist that doesn't. This is the system's strongest governance property.

---

## SECTION 7 — FINAL PROTOCOL SCORECARD

| Dimension | Score | Note |
|---|---|---|
| **Transparency** | 9 / 10 | Every public economic claim maps to a read or is labelled PENDING. Only deduction: mock Vault data still present (quarantined). |
| **Verifiability** | 9 / 10 | Explorer links everywhere; canonical address registries; no literal hosts. |
| **Memory** | 8 / 10 | Full pipeline built + tested, but **HELD in `/labs`**; public memory is three controlled bridges. |
| **Identity** | 9 / 10 | Seat + member# + chapter + rank, all on-chain-derived; cockpit arc is excellent. |
| **Continuity** | 8 / 10 | Chapters/Chronicle/Register give durable continuity; `chronology.date` gap and Story-gating cap the timeline feel. |
| **Discoverability** | 6 / 10 | Surface sprawl (30+ public routes) + the Registry/Register naming collision. |
| **UX coherence** | 6 / 10 | Per-surface quality is high; the *set* doesn't yet read as one guided product. |
| **Governance readiness** | 4 / 10 | Seams modelled honestly, but no live governance; correctly reserved. |
| **DAO readiness** | 2 / 10 | Doctrine only — by design. |

**Strengths:** doctrinal integrity, source-of-truth discipline, the member cockpit, the honest PENDING/FUTURE gating, the built-but-held memory engine.
**Weaknesses:** navigation sprawl, the Registry/Register collision, mock Vault data, the null chronology date, no single "why join" / "verify in 30s" spine.
**Highest-leverage improvements:** (1) rename `/registry`; (2) remove/replace mock Vault data; (3) add a homepage Start/Verify/Join triad; (4) visibly separate operator surfaces from public ones.

**Seven-lens readout:** Founder — *intent intact.* CTO — *truth discipline excellent, one mock to kill.* Product — *one product wearing 30 hats.* UX — *great rooms, weak hallways.* Governance — *honestly reserved.* Long-term member — *identity permanent, memory real.* First-time visitor — *trustworthy, slightly overwhelming.*

---

## SECTION 8 — EXECUTIVE SUMMARY (if I became steward tomorrow)

The 10 most important remaining actions, **ordered by impact, not ease:**

1. **Resolve the Registry ↔ Institutional Register naming collision.** One word, two systems — the worst discoverability trap. Highest impact, low effort.
2. **Remove or replace the mock Vault data (`VAULT_ASSETS`/`VAULT_INFLOWS`).** The only standing dent in an otherwise spotless transparency record.
3. **Add a homepage "Start here / Verify here / Join here" triad.** Convert high per-page quality into a guided journey.
4. **Visibly separate operator surfaces (`/labs/*`, `/protocol-health`) from public ones.** Stop visitors landing in the engine room.
5. **Decide the public posture of the memory engine.** It is production-grade but held in `/labs`; choose what graduates to public (read-only) vs stays internal — the biggest latent value in the system.
6. **Consolidate the 70/20/10 narrative to one canonical explainer.** Four tellings → one source, the rest reference it.
7. **Wire `chronology.date` through the public path** (block-timestamp lookup). Unlocks an honest verified timeline without inventing order.
8. **Author the single "Why become a member" spine**, modelled on the `/my-syndicate` arc (Identity → Place → Ownership → Momentum).
9. **Define the Chronicle publishing action** as an explicit human/governance step (still no auto-publish) so the draft→published seam stops being purely theoretical.
10. **Write the governance-readiness pre-brief** (what a DAO would and would not control) so the reserved seam has a public shape before demand arrives.

> **Closing.** The Syndicate has become what it set out to be: a verifiable, permanent, doctrine-clean membership protocol where every claim points at the chain and nothing pretends to exist before it does. It is not missing systems — it has, if anything, **built ahead of what it currently exposes.** Maturity from here is **consolidation, naming, and graduation**, not construction. Tighten the hallways, kill the last mock, and decide how much of the memory engine the world is allowed to see.

---

*End of report. Read-only — no protocol code, config, or canon was modified in its production.*
