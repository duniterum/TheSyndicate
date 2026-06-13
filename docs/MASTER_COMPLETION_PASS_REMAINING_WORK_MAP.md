# THE SYNDICATE — MASTER COMPLETION PASS: REMAINING WORK MAP + BATCH PLAN

*Read-only synthesis grounded in `docs/audits/FULL_PROTOCOL_VIEW_CANON_FOUNDER_INTENT_MAP.md`, `docs/canon/*`, the live code registries, the labs pipeline routes, and the agent memory notes. No system-wide re-audit was run — this uses the machinery already built. Governing principle throughout: **code outranks docs.***

Date: 2026-06-12

---

## OUTPUT 1 — REMAINING WORK MAP

Status legend: **DONE** · **PARTIAL** · **TODO** (buildable now) · **BLOCKED** (waiting on a real dependency) · **FUTURE** (deferred by doctrine).

| Area | Status | Current source of truth | What exists | What is missing | Dependency | Recommended action | Priority | Batch |
|---|---|---|---|---|---|---|---|---|
| **A1** Public Chronicle (locked) | DONE | `chronicle-entries.ts`, `routes/chronicle.tsx` | 3 locked, hand-curated, published entries; six-part gate; oldest→newest render | — | — | Keep immutable | — | — |
| **A2** Controlled Public Chronicle Integration | **TODO** | `chronicle-entry.ts`, `chronicle-entry-registry.ts` | Full derived pipeline lands drafts (never published); terminal `InstitutionalChronicleEntry` | The public *bridge*: surface derived institutional records on `/chronicle` without duplicating locked entries | A1 + dedup map | **Build now (Batch 1a)** | **P0** | 1 |
| **A3** Chronicle publishing gate | FUTURE | `resolvePublication` (never emits `published`) | Draft→published seam modelled as data; human/governance decision baseline | The actual human/governance publish action | A2 safe first | Keep reserved; do not auto-publish | P3 | 7 |
| **A4** Dedup vs locked entries | **TODO** | `mergeInstitutionalEntries` (tx-hash keyed) | Tx-hash dedup for register seed↔derived | Locked entries carry no tx hash → no key linking locked↔derived | A2 | Curated overlap map (Batch 1a) | **P0** | 1 |
| **A5** Timeline / date integration | PARTIAL | `chronology-registry.ts`, `chronology-timestamps.ts` | Order by verified block; verified-timestamp overlay (pure) | `chronology.date` still null end-to-end (no block-timestamp lookup wired into the public path) | block-timestamp I/O | Surface block/seq only now; date later | P2 | 4 |
| **A6** Story bridge | FUTURE | `docs/STORY_ENGINE_*` | Concept + doctrine | Any Story/episode data structure | A2 safe + real time axis | Do NOT build before A2 | P3 | 4 |
| **A7** Chapter / episode presentation | PARTIAL | `chapters.ts`, `routes/chapters*.tsx`, `routes/episodes.tsx` | Chapter logic + pages; episodes scaffold | "TV-series" anticipation framing | A5/A6 | Defer to Story batch | P3 | 4 |
| **A8** Founder/steward/protocol action visibility | PARTIAL | genesis seed (`institutional-register-genesis.ts`) | Proof of Burn #001, deployments as protocol facts; founder-action defaults to Activity | Consistent public surfacing as institutional record | A2 | Lands via A2 + Batch 3 | P1 | 1/3 |
| **B1** `/activity` raw stream | DONE | `protocol-events.ts`, `routes/activity.tsx` | Complete raw on-chain stream, verification links | — | — | Keep distinct from Chronicle | — | — |
| **B2** Activity → memory lineage indicators | **TODO** | `protocol-lineage.ts` | Pure lineage projection (labs) | A safe, metadata-only "part of institutional memory" indicator on activity rows | B1 + A2 | **Defer to Batch 1b** (riskier) | P1 | 1 |
| **C1** Public Institutional Register | DONE | `institutional-register-public.ts`, `routes/institutional-register.tsx` | active+draft public view; genesis seed merged; status discipline | — | — | Reuse as A2's lineage target | — | — |
| **C2** Public Knowledge Map | DONE | `protocol-knowledge-map.ts`, `routes/knowledge-map.tsx`, canon 09 | Code-registry-driven public 3-bucket projection | — | — | Harmonize Chronicle surface refs only if needed | P2 | 1 |
| **C3** Knowledge graph viz / cross-link density | PARTIAL | `protocol-knowledge-map.ts` | Tabular/structural public view | Richer graph viz; complete cross-links | — | Low-leverage; defer | P3 | 8 |
| **C4** Docs / guard alignment | **DONE** (doc-list); rank-regex deferred | `doctrine-guard.test.ts` | Guard's `CANONICAL_DOCS` now COUPLED to the Authority Map's CANONICAL class (constitutional docs + `docs/canon/` set scanned); vocabulary-defining canon 01/03/04 explicitly EXEMPT + drift-pinned | — | Rank-row `DOC_BANNED` regexes deferred (false-positive risk on legit "Founder"/cohort usage) | P3 | 8 |
| **D1** Archive1155 / First Signal / Patron Seal | PARTIAL | `archive-config.ts`, `archive-id-registry.ts` | ID1 + ID3 LIVE & mintable; `/archive`, `/nft`, `/nfts` | ID2 reserved; ID9 (Chronicle artifact) NOT_CONFIGURED | — | Keep as-is | P2 | 2 |
| **D2** Artifact → institutional memory / Chronicle eligibility | **TODO** | `archive-id-registry.ts`, admission layer | Artifacts exist; locked artifact entries exist | Wiring artifact facts into the institutional memory pipeline | A2 done first | Build after Batch 1 | P1 | 2 |
| **D3** Artifact vs SeatRecord721 distinction | DONE | doctrine + `contract-registry.ts` (null) | Clear separation in canon | — | — | Keep | — | — |
| **E1** Holder Index / Member# / Seat / Rank / Chapter / cockpit | DONE | `holder-index.ts`, `chapters.ts`, `routes/my-syndicate.tsx` | Full identity layer + cockpit narrative arc | — | — | Keep | — | — |
| **E2** Member-living register | BLOCKED | `chronicle-entries.ts` (`member-living` modelled, empty) | Register modelled, intentionally carries no entries | Member-side rules ratification | DAO/ratification | Keep reserved | P3 | 7 |
| **F1** SYN / Sale / 70-20-10 / wallets | DONE | `syndicate-config.ts`, sale hooks | Live routing, public wallets | — | — | Keep | — | — |
| **F2** Vault mock data | PARTIAL | `VAULT_ASSETS`/`VAULT_INFLOWS` (quarantined `/vault` preview) | Mock, gated + labeled | Real treasury-asset surfacing | real data feed | **Remove mock / surface real** (audit's #1 credibility risk) | P1 | 3 |
| **F3** Treasury / steward action visibility | PARTIAL | `transaction-tags.ts`, genesis seed | Manual tagging; Proof of Burn | Honest NFT-revenue + LP-fee destinations; steward actions as institutional record | A2 | Build in Batch 3 | P1 | 3 |
| **G1** Share cards / wallet pages / OG / milestones | DONE | `og-data.server.ts`, `routes/wallet.$address.tsx`, `routes/milestone.$id.tsx` | Full diffusion surfaces | — | — | Keep | — | — |
| **G2** Referral attribution (`?ref`) | PARTIAL | `referral-attribution.ts`, `preview/referral.ts` (labs) | Attribution stub, preview tiers (labs only) | Production attribution-only surface | legal sign-off | Attribution-only later; **no rewards** | P3 | 6 |
| **G3** Referral rewards / commission | FUTURE | `REVENUE_ATTRIBUTION_LAYER.md` | Doctrine only | CommissionRouter contract | legal + contract | Do NOT build | P4 | 6 |
| **H1** Rank recognition | DONE | `RANKS_V2`, `rankForUsdc` | Recognition-only, cumulative-USDC | — | — | Keep | — | — |
| **H2** Recognition layer (memory-output) | FUTURE | recognition doctrine | Partial recognition concept | Member register + ratification | E2/I | Prepare doctrine only | P3 | 5 |
| **I1** SeatRecord721 | PENDING | `contract-registry.ts` (null) | Decision doc; address correctly null | The ERC-721 contract | seat demand + migration | Phase 5 | P4 | 7 |
| **I2** Governance / DAO | FUTURE | `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` | Doctrine only | Voting/council | member base + legal | Do NOT build | P4 | 7 |
| **J1** Route discoverability / footer / breadcrumbs | DONE | `PageShell`, footer sitemap | Grouped nav, breadcrumbs, sitemap | — | — | Keep | — | — |
| **J2** Cross-link consistency | PARTIAL | route footers | Most routes linked | A few older routes under-linked | — | Tidy during batches | P3 | 8 |
| **J3** Dead / duplicated components | PARTIAL — **cleanup DEFERRED** | `labs.index.tsx` quarantine | Quarantined in labs | Final cleanup | — | **Deferred (Batch 8):** automated dead-code detection is UNRELIABLE here (flagged provably-live components — RevenueStreams/Primitives/RouteFinalCTA/LpStatus/Web3Provider — as unused). Subtractive change, no correctness benefit, build OOMs anyway so bundle size is moot. Do NOT delete on unverified data | P3 | 8 |
| **K1** Vitest / doctrine / ownership guards | DONE | `doctrine-guard.test.ts`, `scripts/check-ownership-wording.mjs` | Extensive coverage | — | — | Keep extending per batch | — | — |
| **K2** Production build OOM | BLOCKED | `vite.config.ts` | Known cgroup OOM in transform | A working prod build path | environment | Validate via tsc+vitest+dev; don't fight | P2 | 8 |
| **K3** Dev wallet-resync invalid-hook noise | DONE (won't-fix) | — | DEV-only Vite dual-dispatcher noise | — | — | Do not re-investigate | — | — |

---

## OUTPUT 2 — LEFT-BEHIND / UNFINISHED LIST

Buildable-now (dependency-valid):
1. **Controlled Public Chronicle Integration** (A2) — the public bridge from the derived pipeline to `/chronicle`. ← **next**
2. **Dedup against locked Chronicle entries** (A4) — curated overlap map. ← part of #1
3. **Activity lineage indicators** (B2) — metadata-only "part of institutional memory" on activity rows. ← Batch 1b (deferred, riskier)
4. **Artifact / NFT → institutional memory eligibility** (D2) — Batch 2.
5. **Treasury / asset narrative visibility + remove mock Vault data + protocol-steward action visibility** (F2/F3) — Batch 3.

Deferred by doctrine / blocked (do NOT build now):
6. **Chronicle publishing gate** (A3) — human/governance act; reserved.
7. **Story Layer / episode / chapter presentation** (A6/A7) — after A2 is safe + a real timestamp axis exists.
8. **Recognition Layer (memory-output)** (H2) — needs member register + ratification.
9. **Member-living register** (E2) — reserved until ratification.
10. **Referral rewards / commission** (G3) — jurisdictional; no contract.
11. **SeatRecord721** (I1) — Phase 5.
12. **Governance / DAO** (I2) — Phase 5+.
13. **AI / reports / marketplace** — post-Phase 5.

Hardening / infra:
14. **Build OOM** (K2) — environment ceiling (tracking-only; validate via tsc+vitest+dev).
15. **Doctrine-guard ↔ authority-map coupling** (C4) — **DONE** (doc-list coupled; rank-regex deferred).
16. **Design/page harmonization + dead-component cleanup** (J2/J3) — dead-component cleanup **DEFERRED** (unreliable detection; subtractive, no correctness gain).
17. **/activity institutional indicator — derived-active coverage** (B2 follow-up) — the indicator's tx index is genesis-seed-only (static, SSR-safe). Surfacing a future human-finalised DERIVED active register entry's tx on /activity requires feeding the MERGED runtime register entries into the feed, not a static-index edit. Deferred and currently inert by design (no finalisation action exists yet, so the genesis-only index already matches the register's active set).

---

## OUTPUT 3 — BATCHED EXECUTION PLAN

**Batch 1 — Controlled Public Chronicle Integration + dedup (+ Activity lineage, split out)**
- *Goal:* first public bridge from the institutional memory engine to `/chronicle`, non-duplicative.
- *Why now:* the entire derivation pipeline is complete and lands drafts; the only missing piece is the controlled public surface. Highest narrative leverage, lowest new-architecture cost.
- *Files:* `routes/chronicle.tsx`, new pure leaf `chronicle-public-integration.ts`, tests; `protocol-knowledge-map.ts` surface refs if needed.
- *Dependencies:* A1, the derived pipeline, the genesis seed.
- *No-touch:* locked `CHRONICLE_ENTRIES`, upstream derivation rules, no Story, no publishing, no new contracts, `/activity` (sub-batch 1b only).
- *Tests:* locked entries unmutated; no duplication; draft never shown as final; held/rejected absent; chronology factual-only; lineage linked; copy clean; no Story/Recognition/Governance behavior.
- *User-visible result:* `/chronicle` shows each locked entry with a restrained, verifiable "institutional record" backing + lineage link; no duplicated facts.
- *Risk:* duplication / draft-as-final / doctrine drift — mitigated by curated overlap map + status gate + tests.
- *Split?* **Yes** — 1a (integration + dedup, safe now) and 1b (activity lineage indicators, deferred).
- **STATUS: 1a DONE (architect-PASSED, OUTPUT 5). 1b DONE (architect-PASSED).** 1b adds a metadata-only "◆ Institutional record →" chip to `/activity` rows whose tx is an **active** genesis-seed register entry (pure leaf `src/lib/activity-institutional-link.ts`, opt-in on the main feed only, links to `/institutional-register`). No duplicate feed, no Story, no amount/rank/identity. Derived-active coverage deferred (item 17).

**Batch 2 — Artifact / NFT → institutional memory eligibility**
- *Goal:* let artifact facts (First Signal, Patron Seal) flow into the institutional memory pipeline as eligible facts. *Why now:* depends only on Batch 1 being safe. *No-touch:* contracts, locked entries. *Risk:* artifact↔chapter terminology collision.
- **STATUS: DONE — verified, no code change required (test + doc hardening only).** Artifact facts already flow into institutional memory through two doctrine-correct paths: (1) a **Patron Seal** mint → S2 ARTIFACT signal → artifact-category protocol-institutional memory candidate → review → promotion (approved) → a **draft** institutional-register entry (never `active` — no human-finalisation action exists); (2) the **first issuance** of a milestone artifact (ID1/ID3) → an S3 MILESTONE twin (coverage-gated) → milestone-category institutional candidate. Routine, non-first artifact mints are **deliberately excluded** (anti-saturation, canon §4.5 S1) — `IMPORTANT_S1_CATEGORIES = {membership, continuity}` and no `nft-mint-*` kind is an institutional-first-funding kind; widening either would be a doctrine violation (Batch 2 wall). The Patron(rank)↔Patron Seal(artifact) collision is already resolved in `docs/canon/03_GLOSSARY.md` (rank renamed Steward; "Patron" reserved for the support family). Pinned end-to-end by `src/lib/__tests__/artifact-institutional-eligibility.test.ts` (positive paths, the three exclusions, and the no-silent-widen guard).

**Batch 3 — Economic / Treasury truth + protocol-steward action visibility**
- *Goal:* remove mock Vault data (audit's #1 credibility risk), surface real NFT-revenue + LP-fee destinations honestly, surface steward actions as institutional record. *Why now:* credibility; verifier persona currently hits mock data. *No-touch:* no yield/ROI language; 70/20/10 is sale-only.
- **STATUS: 3a DONE (mock Vault data removed/quarantined). 3b DONE.** 3b adds a canonical pure-config **revenue-streams registry** (`src/lib/revenue-streams.ts`) enumerating the THREE income streams with their distinct on-chain destinations + honest amount status: (1) Membership Sale → 70/20/10 Vault/Liquidity/Operations (LIVE, the only stream using the split); (2) Archive mints → proceeds accrue to the Archive contract, withdrawable by `owner()` to `treasury()` — destination read LIVE via new `useArchiveOwnership` (allowFailure → PENDING if unreadable), cumulative figure PENDING (no single on-chain read); (3) LP fees → compound into the Trader Joe pair reserves, protocol JLP held by the Liquidity Wallet — amount PENDING (Uniswap-V2-style pair has no per-position accrued-fee read; never computed). Surfaced via `RevenueStreams.tsx` on `/vault#revenue-streams` + a one-line cross-link on `/liquidity`. **Steward actions already LIVE** as institutional record on `/institutional-register` (no new work). Walls respected: zero contract changes, read-only hooks, no yield/ROI, never a computed LP-fee figure, `treasury` var never labeled "The Vault". Pinned by `src/lib/__tests__/revenue-streams.test.ts` (3-stream integrity, split↔VAULT_ALLOCATION, PENDING amounts, forbidden-language scan, live proof links).

**Batch 4 — Story / Chapter / Episode presentation**
- *Goal:* TV-series anticipation framing over the Chronicle. *Dependency:* Batch 1 safe + real block-timestamp axis (A5). *No-touch:* no AI narrative, no speculative chapter meaning.

**Batch 5 — Recognition preparation (doctrine only)**
- *Goal:* prepare recognition surfaces/doctrine without public scoring. *Dependency:* member register/ratification. *No-touch:* no public recognition scoring.

**Batch 6 — Referral / Growth (attribution-only)**
- *Goal:* attribution-only `?ref` surface. *No-touch:* no rewards, no commission contract.

**Batch 7 — Member Register / SeatRecord721 / DAO future layer**
- *Goal:* the reserved identity/governance layer. *Dependency:* demand + legal. *No-touch:* everything until explicitly requested.

**Batch 8 — Build / QA / cleanup hardening**
- *Goal:* couple doctrine guard to authority map, dead-component cleanup, cross-link tidy, OOM mitigation tracking.
- **STATUS: PART A DONE; PART B DEFERRED (unsafe); PART C tracking-only.**
  - **PART A — doctrine guard ↔ authority map coupling (C4): DONE.** The guard's `CANONICAL_DOCS` scanned set is now coupled to the Authority Map's CANONICAL classification — the constitutional docs (`NORTH_STAR_SYSTEM`, `INFORMATION_HIERARCHY`, `PROTOCOL_EXECUTION_CONTROL_SYSTEM`) and the full `docs/canon/` set (00,02,05,06,07,08 scanned; 09 already scanned) are wired in, closing the "authoritative-by-convention, not machine-enforced" gap the canon itself flagged as a code follow-up. Vocabulary-defining canon docs (01_FOUNDER_INTENT_MAP, 03_GLOSSARY, 04_DOC_SYNC_CHECKLIST) are an **explicit exemption** — they define the banned terms (you can't ban a glossary from naming the words it governs), mirroring the established `protocol-language.ts` self-exemption pattern; a new drift test pins them as CANONICAL-listed so the exemption can never silently drop a doc. The deliberate decoupling property is preserved (arrays stay hardcoded, NOT a brittle markdown parse — a docs-only pass still stays green). Authority map + canon front-door notes synced. **Deferred within A:** mechanizing the rank-row `DOC_BANNED` regexes ("Founder"/"Genesis Circle" as rank) — they false-positive against legitimate cohort/chapter usage. Validated: doctrine-guard suite 225/225, tsc 0, wording guard OK.
  - **PART B — dead-component cleanup (J2/J3): DEFERRED (unsafe).** Automated detection proved unreliable (flagged provably-live components as unused). Deleting on that data would break the app; it is subtractive with no correctness benefit, and the prod build OOMs regardless so bundle size is moot. Quarantine in `labs.index.tsx` already isolates experimental components. Cross-link tidy (J2) is handled incrementally per batch (each new surface ships with footer links).
  - **PART C — build OOM (K2): tracking-only.** `vite build` SIGKILLs in transform (cgroup OOM) — an environment ceiling, not a code defect. No actionable fix; the standing mitigation is to validate via `tsc --noEmit` + per-file `vitest` + the dev-server SSR render, which is exactly how every batch in this pass was validated.

---

## OUTPUT 4 — NEXT BATCH EXECUTION DECISION

1. **Next batch:** Batch 1, **sub-batch 1a — Controlled Public Chronicle Integration + dedup**. (Sub-batch 1b, Activity lineage indicators, is deferred — it touches `/activity` and carries "don't turn activity into story / no duplicate feed" risk, so it ships separately.)
2. **Why this batch:** it is the only dependency-valid, doctrine-permitted, user-visible piece whose entire upstream is already built (the pipeline lands drafts but they have never reached the public Chronicle). It also closes the explicit duplication risk recorded in `chronicle-entry-registry.ts`'s maintainer notes.
3. **What it completes:** the public end of the institutional memory engine — the locked Chronicle gains verifiable institutional backing + lineage, with zero duplication, no Story, and no auto-publish.
4. **What must not be touched:** locked `CHRONICLE_ENTRIES`; upstream derivation rules; `/activity`; no Story/Recognition/Governance/DAO/AI; no publishing; no new contracts; no yield/ROI/founder-glorification language.
5. **Return report format:** the Sprint-17 15-point return format, appended below as OUTPUT 5.

---

## OUTPUT 5 — EXECUTION REPORT (Batch 1a — Controlled Public Chronicle Integration + dedup)

**1. What was built.** A controlled public bridge from the institutional-memory engine to `/chronicle`. Each of the three LOCKED Chronicle entries now carries an optional, restrained **"Institutional record"** backing line whenever an *explicit, curated* overlap map links it to an **active** genesis-seed Institutional Register entry. The backing adds a one-line note, an optional **Verified source transaction** explorer link (tx-locked facts only), and a **View in the Institutional Register** lineage link. No entries are duplicated; no register feed is re-listed on `/chronicle`.

**2. Data source (key ruling).** Backing is sourced from `deriveGenesisRegisterEntries()` — the **active/verified** genesis-seed register entries — NOT from the draft `InstitutionalChronicleEntry` pipeline terminal. Rationale: the locked entries overlap the genesis SEED facts (which are `entryStatus: "active"`, verification `locked`/`verified`); backing canon with drafts *awaiting a human publish act* would invert the publication seam. The seed is pure config (SSR-safe, zero runtime chain reads).

**3. Dedup model.** An explicit curated map `CHRONICLE_INSTITUTIONAL_BACKING` (`chapter-i-opened → membership-sale-deployment`; `first-/second-artifact-mintable → archive-contract-deployment`) declares the overlaps. Overlapping facts are surfaced *only* as a backing line on the locked entry, never as a second entry; non-overlapping register facts are deliberately NOT re-listed (they live on `/institutional-register`), so `/chronicle` never becomes a second feed (doctrine §7).

**4. Files changed.**
- `src/lib/chronicle-public-integration.ts` — NEW pure leaf: curated overlap map, sober copy constants, `buildPublicChronicleView()` (active-only gate, deterministic, mutates no input). Type-only entry imports + canonical `txExplorerUrl`/`isTxHash` from on-chain-truth config.
- `src/lib/__tests__/chronicle-public-integration.test.ts` — NEW test file (29 assertions across map integrity, shape/determinism, backing correctness, active-only gate, sober copy).
- `src/routes/chronicle.tsx` — renders one restrained backing block per backed entry; keeps `CHRONICLE_ENTRIES` mapping + `a.order - b.order` sort + footer `/activity` & `/my-syndicate` links; no feed/pagination primitives added.
- `src/lib/protocol-knowledge-map.ts` — institutional-register layer `publicSurfaces += "/chronicle"` (code registry is source; no canon-doc edit required).

**5. What was intentionally NOT touched (no-touch honored).** Locked `CHRONICLE_ENTRIES`; all upstream derivers (event/signal/memory/review/promotion/admission/entry); `/activity`; canon docs; contracts. No Story, Recognition, Member-Register, Governance/DAO, AI, publishing/auto-publish, yield/ROI, founder glorification, duplicate Activity feed, or rewriting of locked entries.

**6. Sub-batch split.** Batch 1 was split: **1a (this) = public integration + dedup** shipped; **1b = Activity lineage indicators** deferred (touches `/activity`, carries "don't turn activity into story / no duplicate feed" risk — ships separately).

**7. QA results.**
- `chronicle-public-integration.test.ts` + `chronicle-doctrine.test.ts`: **29 passed** (locked-registry guard untouched and green — evidence the locked entries were not altered).
- `protocol-knowledge-map.test.ts` + `knowledge-map-graph.test.ts`: **42 passed**.
- `tsc --noEmit`: clean (no errors in touched files or project-wide).
- `check-ownership-wording`: OK (366 files). `check-visitor-vocabulary`: PASS. `check-explorer-canonical`: only 4 pre-existing WARNs in untouched files (`MetaMaskExplorerFix.tsx`, `ShareableCards.tsx`); the new leaf uses the canonical `txExplorerUrl` helper (zero literal hosts).
- SSR HTML of `/chronicle`: 3 backing blocks rendered (membership-sale with a `…/tx/0x30e1378a…` source link; both artifact entries with contract-verified backing, no tx link), all sober copy present. Visual check OK.

**8. Doctrine guarantees verified.** Active-only publication gate (held coverage-limited seeds unreachable); backing degrades silently when a fact is missing/non-active (never implies); deterministic SSR/client output; pure projection (no chain reads, no mutation); copy passes the §5 sober-language guard and the Chronicle banlist.

**9. Risks / residual.** (a) The curated map is the single human-curation point — pinned by tests so it can never dangle or reference a non-active fact. (b) `vite build` still OOMs in this environment (K2) — validated via tsc + vitest + dev-server SSR, not a prod build. (c) Lineage link points to `/institutional-register` (the route renders no per-entry DOM anchors yet); deep-linking to a specific register entry is a future nicety, not required.

**10. Next handoff.** Batch 1b — **Activity lineage indicators**: add a metadata-only "part of institutional memory" indicator to `/activity` rows via the pure `protocol-lineage.ts` projection, WITHOUT turning `/activity` into a story surface or duplicating the feed. Then Batch 2 (Artifact → institutional memory eligibility) and Batch 3 (remove mock Vault data + real treasury/steward visibility — the audit's #1 credibility risk).

---

## OUTPUT 6 — FINAL EXECUTION REPORT (Master Completion Pass — all batches)

**1. Scope executed.** Every dependency-valid, additive, doctrine-safe batch was
executed back-to-back, stopping only at real doctrine/contract/governance walls.
Shipped in order: **1a** (public Chronicle integration + dedup), **3a** (remove
mock Vault data), **1b** (Activity lineage indicators), **2** (Artifact →
institutional-memory eligibility — verified, no code change needed), **3b**
(revenue-streams registry + honest NFT/LP destination surfacing), **8 Part A**
(doctrine-guard ↔ authority-map coupling). Batches 4–7 (Story, Recognition,
Member-living, Referral rewards, SeatRecord721, DAO) remain behind doctrine/
contract/governance walls and were correctly NOT built.

**2. Batch 3b — economic truth (what shipped).** A pure-config canonical registry
`src/lib/revenue-streams.ts` enumerates the three income streams with distinct
on-chain destinations and an honest per-stream amount status: (1) **Membership
Sale** → 70/20/10 Vault/Liquidity/Operations (LIVE; the only stream using the
split, `MEMBERSHIP_SPLIT` cross-checked against `VAULT_ALLOCATION`); (2) **Archive
mints** → proceeds accrue to the Archive contract, withdrawable by `owner()` to
`treasury()` (destination read LIVE via new `useArchiveOwnership`, allowFailure →
PENDING; cumulative figure PENDING — no single on-chain read exists); (3) **LP
fees** → compound into the Trader Joe pair reserves, JLP held by the Liquidity
Wallet (amount PENDING — a UniV2-style pair exposes no per-position accrued-fee
read; never computed). Surfaced via `RevenueStreams.tsx` on `/vault#revenue-streams`
+ a one-line cross-link on `/liquidity`. Steward actions were already LIVE on
`/institutional-register` (no new work). Files: `archive-nft-abi.ts` (+owner/
treasury fragments), `archive-nft-hooks.ts` (+`useArchiveOwnership`),
`revenue-streams.ts` (NEW), `RevenueStreams.tsx` (NEW), `vault.tsx` + `liquidity.tsx`
(wiring), `revenue-streams.test.ts` (NEW, 8 assertions).

**3. Batch 8 Part A — doctrine-guard coupling (what shipped).** The guard's
hardcoded `CANONICAL_DOCS` set was widened to match the Authority Map's CANONICAL
class — the constitutional docs (`NORTH_STAR_SYSTEM`, `INFORMATION_HIERARCHY`,
`PROTOCOL_EXECUTION_CONTROL_SYSTEM`) and the `docs/canon/` set (00,02,05,06,07,08;
09 already present), each verified clean of `DOC_BANNED` before wiring. A new
`VOCABULARY_DEFINING_DOCS` set (canon 01/03/04) is an explicit, drift-pinned
exemption — they *define* the banned vocabulary so cannot be scanned for it
(mirrors `protocol-language.ts` self-exemption). The deliberate "arrays stay
hardcoded, docs-only pass stays green" property was preserved (no brittle
markdown parser). Synced: `DOCUMENTATION_AUTHORITY_MAP.md` (canon set listed +
notes), `canon/00_AUTHORITY_MAP.md` (coupling note). Files: `doctrine-guard.test.ts`,
`docs/DOCUMENTATION_AUTHORITY_MAP.md`, `docs/canon/00_AUTHORITY_MAP.md`.

**4. Batch 8 Part B/C — defer rationale.** **Part B (dead-component cleanup):
DEFERRED.** Automated dead-code detection was unreliable (flagged provably-live
components — RevenueStreams, Primitives, RouteFinalCTA, LpStatus, Web3Provider —
as unused). Deleting on that data would break the app; the change is subtractive
with no correctness benefit, and the prod build OOMs regardless (bundle size
moot). **Part C (build OOM): tracking-only** — `vite build` SIGKILLs in transform
(cgroup OOM), an environment ceiling, not a code defect; validated via
tsc+vitest+dev as standing mitigation.

**5. What was intentionally NOT touched (no-touch honored across the pass).** New
contracts; SeatRecord721; DAO/governance; member-living register; public
Recognition scoring; referral rewards/commission; AI; marketplace; locked
Chronicle entries; fake Story; founder glorification; any yield/ROI/dividend
language. No contract changes — all new on-chain access is read-only. The 70/20/10
split was kept strictly Membership-Sale-only; no computed LP-fee figure was ever
fabricated; the `treasury()` destination is never relabeled "The Vault".

**6. QA results (final, project-wide).**
- `tsc --noEmit`: **clean (exit 0)**.
- `doctrine-guard.test.ts`: **225 passed** (includes the ~72 new banned-vocab
  assertions across newly-scanned canon/constitutional docs + the new
  vocabulary-defining-exemption drift test).
- `revenue-streams.test.ts`: **8 passed**.
- `check-ownership-wording`: **OK (369 files)**. `check-preview-labels`: **OK (6 files)**.

**7. Validation method (OOM-aware).** Because `vite build` OOMs in this
environment, every batch was validated via `tsc --noEmit` + per-file `vitest`
(`--maxWorkers=1` to avoid the suite-wide OOM) + dev-server SSR render / app
preview. This is the documented, repeatable mitigation, not a workaround.

**8. Doctrine guarantees verified.** Every new economic claim maps to an on-chain
read or is explicitly labeled PENDING (revenue-streams `amountStatus`); the
canon is now machine-enforced for banned vocabulary (with the principled
glossary exemption); recognition/rank language unchanged (recognition-only);
no publishing, no Story, no duplicate feeds introduced.

**9. Risks / residual (carried forward).** (a) Build OOM (K2) — environment
ceiling, unchanged. (b) Dead-component cleanup (J3) — deferred until detection
can be trusted; quarantine in `labs.index.tsx` already isolates experiments.
(c) Rank-row `DOC_BANNED` regexes — deferred (false-positive risk on legitimate
"Founder"/cohort usage). (d) Cumulative NFT-revenue + LP-fee *amounts* remain
PENDING by doctrine (no single on-chain read); only destinations are surfaced.

**10. Next handoff.** The remaining map is doctrine/governance-gated, not
engineering-gated: Batch 4 (Story/episode presentation) needs a real
block-timestamp axis + a human-approved narrative policy; Batch 5 (Recognition)
and Batch 7 (Member-living / SeatRecord721 / DAO) need a member register +
ratification + (for SeatRecord721) a deployed contract; Batch 6 rewards need
jurisdictional sign-off + a CommissionRouter contract. None should be built
until explicitly requested with those prerequisites met.

---
