# THE SYNDICATE — FULL PROTOCOL VIEW, CANON & FOUNDER INTENT MAP

*Read-only synthesis. Grounded in `syndicate-config.ts`, the four authority docs, `doctrine-guard.test.ts`, `holder-index.ts`, and the prior audits. Governing principle throughout: **code outranks docs.***

---

## PART 1 — FULL PROTOCOL VIEW (12 buckets)

### 1. Core Doctrine & Constitution
| Field | Value |
|---|---|
| **Definition** | What the protocol *is / is not*; the four-verb law (Money→attribution, Time→reputation, History→memory, Constitution→governance) |
| **Founder intent** | A society, not a token; meaning precedes mechanics |
| **Problem solved** | Stops every chat/audit from re-deriving first principles |
| **Status** | **LIVE** |
| **SoT code** | — (doctrine, not code) |
| **SoT docs** | `VISION.md`, `CONSTITUTION_SUMMARY.md`, `STORY_ENGINE_AND_EMOTIONAL_OPERATING_SYSTEM.md`, `NORTH_STAR_SYSTEM.md` |
| **Pages/components** | Whole-site posture; hero narrative |
| **Contracts** | — |
| **User action** | Read / believe |
| **Economic relevance** | Indirect (sets the ceiling on public complexity — the 30-second model) |
| **Narrative relevance** | Maximal — it is the narrative |
| **Legal/risk** | High — the "is not" column is the liability firewall |
| **Must never become** | A roadmap or a marketing deck |
| **Drift risk** | Old HISTORICAL audits silently driving new decisions |
| **Missing decision** | None |

### 2. Vocabulary, Legal & Risk Language
| Field | Value |
|---|---|
| **Definition** | One approved word per concept; banned financial vocabulary; risk posture |
| **Founder intent** | "One vocabulary = one product"; legal-safe by construction |
| **Problem solved** | Synonym sprawl + securities-language exposure |
| **Status** | **LIVE** |
| **SoT code** | `scripts/live-content-rules.json`; `doctrine-guard.test.ts` (`DOC_BANNED`); `LEGAL_DISCLAIMER` in `syndicate-config.ts` |
| **SoT docs** | `TERMINOLOGY_GLOSSARY.md`, `LEGAL_DISCLOSURE_REFERRAL.md` |
| **Pages/components** | All copy, nav, OG cards, FAQ |
| **Contracts** | — |
| **User action** | Reads copy |
| **Economic relevance** | Defines what can/can't be said about money |
| **Narrative relevance** | Medium (narrative headlines deliberately kept separate from CTAs) |
| **Legal/risk** | **Highest** — banned set is ROI/yield/dividend/investment/equity/redemption |
| **Must never become** | A place that "explains" why a banned word is acceptable |
| **Drift risk** | Glossary **already stale**: still defines Rank as "status tier unlocked by USDC entry size" (only inline-marked superseded) |
| **Missing decision** | Whether to hard-delete the stale Rank/Compounder lines vs keep struck-through |

### 3. Authority, Precedence & Doc-Sync
| Field | Value |
|---|---|
| **Definition** | The map-of-maps: doc classification, precedence law, reading order, sync process |
| **Founder intent** | A single front door so no one re-litigates "which doc wins" |
| **Problem solved** | 140 docs with no precedence |
| **Status** | **LIVE** (but fragmented across 2 maps) |
| **SoT code** | `doctrine-guard.test.ts` (`CANONICAL_DOCS`, `DOC_BANNED`) |
| **SoT docs** | `DOCUMENTATION_AUTHORITY_MAP.md` + `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` |
| **Pages/components** | — |
| **Contracts** | — |
| **User action** | Contributor-facing only |
| **Economic relevance** | — |
| **Narrative relevance** | — |
| **Legal/risk** | Medium (governs what claims docs may make) |
| **Must never become** | Two competing authority maps (it currently is two) |
| **Drift risk** | **Guard is decoupled** — `CANONICAL_DOCS`/`DOC_BANNED` are hardcoded, not parsed from the map; reclassifying a doc has zero enforcement until the arrays are hand-edited |
| **Missing decision** | Merge the two maps into one `00_AUTHORITY_MAP.md`; decide if the guard should parse the map |

### 4. Identity / Seat
| Field | Value |
|---|---|
| **Definition** | "SYN is the seat." Member = on-chain registry entry; five constitutive facts |
| **Founder intent** | The seat is the product; identity is permanent and earned, not bought-up |
| **Problem solved** | Gives membership a durable, verifiable meaning |
| **Status** | **LIVE** (Seat as SYN); **Seat Record ERC-721 = PENDING** |
| **SoT code** | `holder-index.ts`; `contract-registry.ts` (`SeatRecord721` address = null) |
| **SoT docs** | `SCARCITY_STATUS_PERMANENCE_AUDIT.md`, `SEAT_RECORD_ARCHITECTURE_DECISION.md` |
| **Pages/components** | `/members`, `/founders`, `/my-syndicate`, MemberCockpit |
| **Contracts** | SYN ERC-20 (live); SeatRecord721 (future) |
| **User action** | Join (buy SYN) → become a member |
| **Economic relevance** | The seat is acquired via the sale (70/20/10) |
| **Narrative relevance** | Maximal — "every member receives a seat" |
| **Legal/risk** | Medium — seat must read as membership, never share/stake |
| **Must never become** | A tradeable financial position; conflated with Seat Record |
| **Drift risk** | Copy promising a "seat NFT" today (Seat Record is PENDING) |
| **Missing decision** | When/whether SeatRecord721 ships, and migration story |

### 5. Chapter / Era
| Field | Value |
|---|---|
| **Definition** | Five fixed chapters by member-number range |
| **Founder intent** | "Every milestone seals a chapter" — belonging by cohort, not wealth |
| **Problem solved** | Time-stamps membership into shared eras |
| **Status** | **LIVE** |
| **SoT code** | `chapters.ts` |
| **SoT docs** | `DOCUMENTATION_AUTHORITY_MAP.md` (Chapter doctrine) |
| **Pages/components** | `/chapters`, ChapterProgression |
| **Contracts** | — (derived from member number) |
| **User action** | Sees their chapter; watches chapters seal |
| **Economic relevance** | None directly |
| **Narrative relevance** | High |
| **Legal/risk** | Low |
| **Must never become** | A scarcity/FOMO clock or a perk tier |
| **Drift risk** | Re-introducing retired cohorts (First 100/500/1000 — guard-banned); "Era" used generically |
| **Missing decision** | None — strongly settled |

### 6. Rank / Progression
| Field | Value |
|---|---|
| **Definition** | Mutable, on-chain-derived **recognition**; confers nothing; subordinate to seat + cohort |
| **Founder intent** | Acknowledge depth of participation without paying for it |
| **Problem solved** | Reward conviction with *standing*, never with money/rights |
| **Status** | **LIVE** (recognition only) |
| **SoT code** | `syndicate-config.ts` → `RANKS_V2`, `rankForUsdc` (on **cumulative USDC**) |
| **SoT docs** | `RANK_CONSTITUTIONAL_RULING.md` |
| **Pages/components** | `/ranks`, RankHub, public member page (secondary line) |
| **Contracts** | — (derived) |
| **User action** | Buy more → higher recognition only |
| **Economic relevance** | None — no discount, no bonus SYN, no yield |
| **Narrative relevance** | Medium |
| **Legal/risk** | High — must never read as a return on a bigger spend |
| **Must never become** | A tier/leaderboard/multiplier/identity |
| **Drift risk** | Stale glossary line; rank names reusing identity/artifact/gov words (Patron, Council); labs spend-ladder copy |
| **Missing decision** | Whether to rename the **Patron** ($500) and **Council** ($1k/$2.5k) tiers (collision with Patron Seal + future governance) |

### 7. Tokenomics / Supply
| Field | Value |
|---|---|
| **Definition** | SYN fixed 1,000,000,000 supply; 7 allocation buckets; rate 1 SYN = $0.01 |
| **Founder intent** | Honest, fixed, no-admin token; public wallets |
| **Problem solved** | Credibility — no hidden mint, tax, blacklist |
| **Status** | **LIVE** (Burn = FUTURE) |
| **SoT code** | `syndicate-config.ts` → `TOKEN_SPEC`, `TOKENOMICS_ALLOCATION`; `treasury-hooks.ts` (`useCirculatingSupply`) |
| **SoT docs** | `SYNDICATE_PROTOCOL_MODEL.md` |
| **Pages/components** | `/whitepaper`, `/transparency`, `/registry` |
| **Contracts** | SYN ERC-20 `0xC1Cf…0170` |
| **User action** | Verify supply/allocation on-chain |
| **Economic relevance** | Defines the stock side (vs the flow side, bucket 8) |
| **Narrative relevance** | Low/medium |
| **Legal/risk** | Medium |
| **Must never become** | "Vault Reserve (25% SYN)" confused with "Vault Wallet (70% USDC)" — and note **they share one on-chain address `0x205DdC…`** |
| **Drift risk** | Burned supply implied where none exists; allocation %s drifting from code |
| **Missing decision** | Whether circulating-supply estimate becomes a first-class verified metric |

### 8. Economic / Routing & Revenue
| Field | Value |
|---|---|
| **Definition** | The 70/20/10 USDC split + the other (non-split) revenue streams |
| **Founder intent** | Atomic, public, deterministic routing — "verify everything" |
| **Problem solved** | Trust in where money goes |
| **Status** | **LIVE** (sale routing); other streams PARTIAL/PENDING |
| **SoT code** | `USDC_ROUTING`, `vaultFlow()`, `sale-abi.ts`, sale hooks; `protocol-truth.ts` |
| **SoT docs** | `REVENUE_ATTRIBUTION_LAYER.md`, `TREASURY_LEDGER_DOCTRINE.md` |
| **Pages/components** | `/transparency`, RoutingDiagram, hero 30-second model |
| **Contracts** | Membership Sale `0x0020Df…842d`; Vault/Liquidity/Operations wallets |
| **User action** | Buy → watch split execute |
| **Economic relevance** | Core revenue engine |
| **Narrative relevance** | Medium |
| **Legal/risk** | High — must never imply the split is a return to the buyer |
| **Must never become** | A "the protocol pays you" story; 70/20/10 applied to NFT/LP revenue (it is **sale-only**) |
| **Drift risk** | `VAULT_ASSETS`/`VAULT_INFLOWS` mock data; `GENESIS_NFT_PRICE "$1–$10"` (wrong — 0.50 USDC) |
| **Missing decision** | Surface NFT-revenue + LP-fee destinations honestly (currently mocked) |

### 9. Artifact / NFT (incl. Patronage)
| Field | Value |
|---|---|
| **Definition** | Collectible protocol memories, **no financial rights**; Patron Seal lives here |
| **Founder intent** | "Every action becomes history" made tangible |
| **Problem solved** | Optional memory layer that doesn't pollute identity |
| **Status** | **PARTIAL** — First Signal (ID1) + Patron Seal (ID3) LIVE; ID2 reserved/disabled; ID9 NOT_CONFIGURED |
| **SoT code** | `archive-config.ts`, `archive-id-registry.ts`, `ARCHIVE_CONTRACT_STATE` |
| **SoT docs** | `ARCHIVE1155_CANONICAL_ARCHITECTURE.md` |
| **Pages/components** | `/nft`, `/archive`, FirstSignalShowcase |
| **Contracts** | Archive1155 `0xB2AE…D54d` (deployed 2026-06-06) |
| **User action** | Mint First Signal (0.50 USDC) / Patron Seal (5.00 USDC) |
| **Economic relevance** | Mint proceeds → **Archive1155 owner wallet** (NOT the 70/20/10 split) |
| **Narrative relevance** | High |
| **Legal/risk** | High — must carry the "no equity/yield/rights" line |
| **Must never become** | "Relic" in live UI; equity/yield instrument |
| **Drift risk** | A status rail labeling generic "NFT" as PENDING (contradicts live First Signal) |
| **Missing decision** | ID9 Protocol Chronicle artifact's eventual config |

### 10. Activity & Chronicle
| Field | Value |
|---|---|
| **Definition** | **Activity** = raw, complete on-chain stream; **Chronicle** = curated, gated constitutional history |
| **Founder intent** | "The Chronicle records the protocol's evolution for anyone to verify" |
| **Problem solved** | Separates raw truth (Activity) from meaningful memory (Chronicle) |
| **Status** | Activity **LIVE**; Chronicle **PARTIAL / conceptual** (curated, not wired to events) |
| **SoT code** | `protocol-events.ts`, `protocol-memory.ts` (Activity); `chronicle-entries.ts` + `validateChronicleEntry` (Chronicle) |
| **SoT docs** | `PROTOCOL_CHRONICLE_*.md`, `STORY_ENGINE_*.md` |
| **Pages/components** | `/activity`, LivePulseStrip, ProtocolHeartbeat |
| **Contracts** | reads sale / LP / archive events |
| **User action** | Watch the protocol live |
| **Economic relevance** | Display layer over financial events |
| **Narrative relevance** | Maximal (Chronicle) |
| **Legal/risk** | Low/medium |
| **Must never become** | "Protocol Chronicle" as a **public** label (banned vocab → public name is "Activity") |
| **Drift risk** | Promoting a raw event to Chronicle without the gate; calling the live feed "Chronicle" |
| **Missing decision** | Whether Chronicle is ever automated, or stays operator-curated |

### 11. Verification / Transparency
| Field | Value |
|---|---|
| **Definition** | The "don't trust, verify" engine — every claim maps to an on-chain read or PENDING |
| **Founder intent** | Verifiable > impressive |
| **Problem solved** | Makes every number falsifiable |
| **Status** | **LIVE** (metric *definition* PARTIAL) |
| **SoT code** | `protocol-truth.ts` (TRUTH/Fact) **and** `data-verification-registry.ts` (METRIC_REGISTRY) |
| **SoT docs** | `DATA_VERIFICATION_REGISTRY.md`, `DATA_SOURCE_MAP.md`, `PROTOCOL_TRUTH_LAYER_REPORT.md` |
| **Pages/components** | `/transparency`, `/registry`, StatusTag |
| **Contracts** | reads all live contracts |
| **User action** | Click through to explorers |
| **Economic relevance** | Validates the economic claims |
| **Narrative relevance** | Medium |
| **Legal/risk** | High — this is the credibility spine |
| **Must never become** | Two registries giving two answers |
| **Drift risk** | **Dual registries disagree on "members"** (TokensPurchased-buyer vs SYN-Transfer-recipient = Member vs Holder) |
| **Missing decision** | **Pick ONE canonical "members" definition** and have the other import it |

### 12. Future Modules — Referral · Reward/Reputation · Burn · Governance
| Field | Value |
|---|---|
| **Definition** | The deferred systems: attribution (RAL/CommissionRouter), reputation (Builder Records), burn, governance |
| **Founder intent** | Reserve namespace without over-building |
| **Problem solved** | Prevents premature contracts/registries |
| **Status** | **PENDING / FUTURE** (all) |
| **SoT code** | none deployed; stubs in `preview/referral.ts`, `quest-hooks.ts` (labs, outside scan) |
| **SoT docs** | `UNIFIED_PROTOCOL_DOCTRINE_MAP.md`, `BUILDER_RECORD_DOCTRINE.md`, `REPUTATION_FORMULA_DOCTRINE.md`, `REVENUE_ATTRIBUTION_LAYER.md` |
| **Pages/components** | none shipped (`/referral` planned) |
| **Contracts** | CommissionRouter, SeatRecord721 — all future |
| **User action** | none yet |
| **Economic relevance** | Future revenue/retention; **must not be implied live** |
| **Narrative relevance** | Medium (burn = "Proof of Fire" potential) |
| **Legal/risk** | **Highest future risk** — referral/reward = jurisdictional |
| **Must never become** | Live-looking before contracts exist |
| **Drift risk** | Labs copy ("Rank unlocked", reward language) leaking into production |
| **Missing decision** | The PENDING-exit condition for each (see Part 10) |

---

## PART 2 — SOURCE OF TRUTH TABLE

| Concept | Code source | Contract source | Frontend source | Doc source | Status | Confidence | Drift risk |
|---|---|---|---|---|---|---|---|
| SYN token | `syndicate-config.ts` `TOKEN_SPEC` | `0xC1Cf…0170` | `/registry`, `/whitepaper` | `SYNDICATE_PROTOCOL_MODEL.md` | LIVE | **High** | low |
| Membership sale | `sale-abi.ts`, sale hooks | `0x0020Df…842d` | `/`, `/transparency` | `SALE_FLOW_INVARIANTS.md` | LIVE | **High** | low |
| 70/20/10 routing | `USDC_ROUTING`, `vaultFlow()` | sale contract | RoutingDiagram | `REVENUE_ATTRIBUTION_LAYER.md` | LIVE | **High** | med (applied beyond sale) |
| Total supply | `TOKEN_SPEC.totalSupply` | SYN ERC-20 | tokenomics | glossary | LIVE | **High** | low |
| Circulating supply | `treasury-hooks.ts` `useCirculatingSupply` | derived (total−reserved) | `/transparency` | `TREASURY_LEDGER_DOCTRINE.md` | PARTIAL | **Med** | med (estimate) |
| Burned supply | *(none)* | *(none)* | *(none)* | — | FUTURE | **High** (=0) | **high** (implying burns) |
| Non-circulating wallets | `ALLOCATION_WALLETS`, `nonCirculating` | 7 wallets | `/registry` | `DATA_SOURCE_MAP.md` | LIVE | **High** | low |
| Member number | `holder-index.ts` | derived from events | `/members`, cockpit | `HOLDER_INDEX_ARCHITECTURE.md` | LIVE | **High** | low |
| Chapters | `chapters.ts` | derived | `/chapters` | authority map | LIVE | **High** | low |
| Ranks | `RANKS_V2`, `rankForUsdc` | derived (cumulative USDC) | `/ranks` | `RANK_CONSTITUTIONAL_RULING.md` | LIVE | **High** (code)/Med (glossary) | med |
| Artifacts | `archive-id-registry.ts` | `0xB2AE…D54d` | `/nft`, `/archive` | `ARCHIVE1155_CANONICAL_ARCHITECTURE.md` | PARTIAL | **High** | med |
| First Signal | `ARCHIVE_CONTRACT_STATE` ID1 | Archive1155 ID1 | FirstSignalShowcase | archive docs | LIVE (0.50 USDC) | **High** | med (price drift vs `GENESIS_NFT_PRICE`) |
| Patron Seal | `ARCHIVE_CONTRACT_STATE` ID3 | Archive1155 ID3 | `/archive` | archive docs | LIVE (5.00 USDC, supply 10k) | **High** | med (name collision w/ rank) |
| LP | `LP_POOL`, `onchain-events.ts` | pair `0xe124…9389` | `/transparency` | `DATA_SOURCE_MAP.md` | LIVE | **High** | med (fees destination unclear) |
| Vault | `CONTRACTS.VAULT_WALLET` | `0x205DdC…` | `/transparency`, `/registry` | glossary | LIVE | **Med** | **high** (== Vault Reserve addr; overloaded) |
| Treasury | `transaction-tags.ts` | allocation wallets | `/transparency` | `TREASURY_LEDGER_DOCTRINE.md` | PARTIAL (manual) | **Med** | high |
| Operations | `CONTRACTS.OPERATIONS_WALLET` | `0x5cb5…BE80` | `/transparency` | glossary | LIVE | **High** | low |
| Activity | `protocol-events.ts` | reads chain | `/activity` | `STORY_ENGINE_*` | LIVE | **High** | low |
| Chronicle | `chronicle-entries.ts` | — | (curated) | `PROTOCOL_CHRONICLE_*` | PARTIAL | **Low** | high (vs Activity) |
| Referral | `preview/referral.ts` (stub) | none | none (planned) | `REVENUE_ATTRIBUTION_LAYER.md` | PENDING | **Low** | high |
| Burn | *(none)* | none | none | — | FUTURE | **High** (none) | high |
| SeatRecord721 | `contract-registry.ts` (null) | none | — | `SEAT_RECORD_ARCHITECTURE_DECISION.md` | PENDING | **High** | low (correctly null) |
| Governance | *(none)* | none | none | `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §2.8 | FUTURE | **Low** | med |
| Legal language | `LEGAL_DISCLAIMER`, `live-content-rules.json` | — | all copy | `TERMINOLOGY_GLOSSARY.md` | LIVE | **High** | med |
| Banned words | `doctrine-guard.test.ts` `DOC_BANNED`/`BANNED` | — | all copy | glossary | LIVE | **Med** | med (guard decoupled) |
| Docs authority map | `doctrine-guard.test.ts` `CANONICAL_DOCS` | — | — | `DOCUMENTATION_AUTHORITY_MAP.md` | LIVE | **Med** | high (decoupled) |

---

## PART 3 — FOUNDER INTENT MAP

**Seat** — *Purpose:* the membership itself (SYN is the seat). *User psychology:* "I belong, permanently." *Economic:* acquired via the sale. *Narrative:* the founding promise. *Legal boundary:* membership, never a security/share. *Future evolution:* optional SeatRecord721 identity NFT. *Don't confuse with:* Seat Record (the future NFT), Holder (owns SYN, may not be a member).

**Member number** — *Purpose:* permanent ordinal identity. *Psychology:* "I was here at #N." *Economic:* none. *Narrative:* the spine of chapters. *Legal:* none. *Future:* immortalized in Seat Record. *Don't confuse with:* rank (mutable) or founder cohort flag.

**Chapter** — *Purpose:* cohort era by member-number range. *Psychology:* shared belonging. *Economic:* none. *Narrative:* "milestones seal a chapter." *Legal:* none. *Future:* chapter artifacts. *Don't confuse with:* "Era" (generic), retired cohorts.

**Rank** — *Purpose:* structural recognition of participation depth. *Psychology:* being seen, not rewarded. *Economic:* **none — recognition only.** *Narrative:* secondary. *Legal:* must never imply a return on bigger spend. *Future:* may derive from reputation. *Don't confuse with:* tier, leaderboard, identity, Patron Seal.

**Artifact** — *Purpose:* optional collectible memory. *Psychology:* "I hold a piece of the story." *Economic:* mint fee → Archive owner. *Narrative:* high. *Legal:* **no financial rights.** *Future:* event-sealed artifacts via Mythology Gate. *Don't confuse with:* equity, "Relic" (live), Seat Record.

**Patron / Mécène** — *Purpose:* a supporter who funds and is remembered (Patron Seal). *Psychology:* legacy/generosity over participation grind. *Economic:* 5.00 USDC mint → Archive owner. *Narrative:* patronage/permanence. *Legal:* no rights, no payout. *Future:* patron-only recognition surfaces. *Don't confuse with:* the **Patron rank ($500)** — same word, different concept.

**Chronicle** — *Purpose:* curated constitutional history. *Psychology:* "this mattered." *Economic:* none. *Narrative:* maximal. *Legal:* low. *Future:* possible automation. *Don't confuse with:* Activity (raw); "Protocol Chronicle" is banned public vocab.

**Activity** — *Purpose:* raw complete on-chain stream. *Psychology:* "it's alive and real." *Economic:* display over financial events. *Narrative:* medium. *Legal:* low. *Future:* richer filters. *Don't confuse with:* Chronicle (curated).

**Vault** — *Purpose:* protocol-controlled assets (70% USDC wallet + 25% SYN reserve). *Psychology:* "backing exists." *Economic:* the accumulation engine. *Narrative:* medium. *Legal:* **never "ownership" or "claim."** *Future:* Programmatic Vault Contract (PENDING). *Don't confuse with:* Treasury Ledger (movement record), Vault Reserve vs Vault Wallet (**one address today**).

**LP** — *Purpose:* liquidity depth (Trader Joe v1 SYN/USDC). *Psychology:* "I can exit/enter." *Economic:* 20% of sale reinforces it; fees accrue to the position. *Narrative:* low. *Legal:* no LP ownership conferred to members. *Future:* deeper liquidity. *Don't confuse with:* the Vault.

**Referral** — *Purpose:* attribution of who caused a sale. *Psychology:* "bringing people matters." *Economic:* future commission from the Operations slice. *Narrative:* low. *Legal:* **jurisdictional — highest future risk.** *Future:* CommissionRouter. *Don't confuse with:* Reward (the payout).

**Burn / Proof of Fire** — *Purpose:* verifiable supply reduction (future). *Psychology:* commitment/sacrifice. *Economic:* supply effect only, no payout. *Narrative:* high ("Proof of Fire / Ash Seal"). *Legal:* never frame as price-pumping. *Future:* founder/community/vote burns + burn artifact. *Don't confuse with:* LP "Burn" (liquidity removal), generic tokenomics events.

**Governance** — *Purpose:* the rules for changing the rules. *Psychology:* "I have a voice eventually." *Economic:* none in V1. *Narrative:* constitutional. *Legal:* must say "founder-managed until DAO." *Future:* token/council voting. *Don't confuse with:* the **Council rank**.

**SeatRecord721** — *Purpose:* future permanent identity NFT. *Psychology:* "my seat, tokenized." *Economic:* none implied. *Narrative:* identity permanence. *Legal:* not a security. *Future:* separate ERC-721. *Don't confuse with:* Archive1155 ID2 (reserved/disabled), the seat (SYN, live now).

**Protocol Intelligence** — *Purpose:* derived insight/data surfaces over the chain. *Psychology:* "the protocol understands itself." *Economic:* potential future B2B. *Narrative:* medium. *Legal:* don't sell data implying rights. *Future:* analytics/AI layer. *Don't confuse with:* Activity (raw feed) or marketing analytics.

---

## PART 4 — ECONOMIC REALITY (income streams)

| Stream | Bucket | Price / split | SoT | Where shown | Real revenue? | Routes to | Clarity (1–5) | Copy must avoid |
|---|---|---|---|---|---|---|---|---|
| SYN sale | **A. Live + contract-backed** | min $5; 70/20/10 | `USDC_ROUTING`, sale contract | `/`, `/transparency` | **Yes** | Vault 70 / Liquidity 20 / Operations 10 | 5 | "returns to buyer" |
| NFT sale (First Signal 0.50, Patron Seal 5.00) | **B. Live but poorly surfaced** | per-mint USDC | `ARCHIVE_CONTRACT_STATE` | `/nft`, `/archive` | **Yes** | **Archive1155 owner wallet** (NOT 70/20/10) | 2 | implying NFT revenue feeds the Vault split |
| LP fees | **B. Live but hidden** | Trader Joe v1 fee | `LP_POOL`, `onchain-events.ts` | `/transparency` (thin) | **Yes (small)** | the LP position | 2 | implying fees are "yield" to members |
| Referral preview | **C. Simulated / frontend-only** | tier table (preview) | `preview/referral.ts` (labs) | not in prod | **No** | n/a | 1 | presenting preview tiers as earnable now |
| Future referral contract | **E. Future / not built** | TBD (slice of Operations) | `REVENUE_ATTRIBUTION_LAYER.md` | none | No | Operations → referrer (future) | n/a | "earn rewards" anywhere live |
| Future burn events | **E. Future** | n/a | — | none | No | supply reduction only | n/a | "burn pumps price" |
| Future artifacts | **E. Future** | TBD | `archive-id-registry.ts` (ID9 unconfigured) | none | No | Archive owner | n/a | claiming ID9 configured |
| Future SeatRecord721 | **E. Future** | TBD | `contract-registry.ts` (null) | none | No | n/a | n/a | "seat NFT available now" |
| Future protocol intelligence / data | **E. Future** | TBD | — | none | No | n/a | n/a | selling "insights" implying rights |
| `VAULT_ASSETS` / `VAULT_INFLOWS` | **D. Coded but inactive (MOCK)** | fake ($182k etc.) | `syndicate-config.ts` (status PENDING) | wherever rendered | **No — fabricated** | n/a | **showing these as live treasury data** |

**Headline economic truth:** only **two** streams are real revenue today — the **SYN sale** (the only one that 70/20/10 applies to) and **NFT mints** (which route to the Archive owner, *not* the split). LP fees are real but tiny and accrue to the position. Everything else is mock, preview, or future.

---

## PART 5 — REVENUE-PER-MEMBER REALITY

**The blunt answer: today there is no economic reason to spend more than $5. Spending more buys *recognition*, never *rights or returns*. That is by constitutional design — and the site does not yet say it plainly enough.**

| Question | Answer (from code) |
|---|---|
| $5 entry | Citizen rank, 500 SYN, full membership + permanent record |
| $10 / $25 / $50 / $100 / $500 / $1,000+ | Scout / Operator / Builder→Vanguard / Architect→Patron / Council Candidate+ — **higher recognition only** |
| Cumulative vs one-time | **Cumulative.** Rank = `rankForUsdc(cumulativeUsdc)` in `holder-index.ts` |
| Does $160 once == $160 split? | **Yes — identical.** Rank is on cumulative USDC, order/timing irrelevant |
| Rank basis | **Cumulative USDC spent via the sale** (purchase history), *not* SYN balance, *not* wallet balance |
| Does buying more create any real benefit? | **No.** No bonus SYN, no discount, no yield, no governance weight, no payout — recognition only |
| Does the site explain this clearly? | **Partially.** Rank doctrine is enforced in code, but the glossary still carries the stale "status tier unlocked by USDC entry size" line, and no single surface states "more spend = recognition, never return" |

> **Critical separation (must stay loud):** *Recognition* (rank, badges, archive placement) is real and earned. *Financial rights* (returns, yield, dividends, ownership) **do not exist**. The honest "why spend more" answer is conviction and legacy — not ROI.
>
> **Note on labs divergence:** production rank is cumulative-USDC-based; `src/labs/**` + `quest-hooks.ts` compute rank from **current SYN balance** (`rankForSyn`). If labs is ever promoted, this becomes a real contradiction (balance can fall if SYN is sold; cumulative USDC cannot).

---

## PART 6 — PERSONAS

| Persona | Needs to see | Right action | Must NOT be promised | Best current page | Missing |
|---|---|---|---|---|---|
| **Player-member** | Their seat, member #, chapter, rank path, artifacts | Join at $5, mint First Signal | Rewards/earnings for ranking up | `/my-syndicate`, `/ranks` | A plain "recognition ≠ return" statement on the rank path |
| **Patron / Mécène** | A way to give meaningfully + be remembered | Mint Patron Seal; reach Patron/Architect recognition | Perks, payout, influence | `/archive` (Patron Seal) | A dedicated patron/legacy surface; disambiguation from the Patron *rank* |
| **Investor-observer** | Supply, allocation, contracts, Vault, LP, risk | Verify on-chain; read disclaimer | Yield, dividends, equity, Vault ownership | `/transparency`, `/registry`, `/whitepaper` | Real (non-mock) Vault/inflow data; honest NFT/LP revenue destinations |
| **Skeptic / verifier** | Every claim → tx/explorer link; what's PENDING | Click through, find nothing hidden | "Trust us" | `/transparency`, `/registry` | Single canonical "members" number; remove mock data that fails verification |

---

## PART 7 — TERMINOLOGY COLLISION MAP

| Collision | Correct term | Banned / discouraged | Where it drifts today | How future docs should phrase it |
|---|---|---|---|---|
| Seat vs Seat Record | **Seat** = SYN membership (live); **Seat Record** = future ERC-721 | "seat NFT" (now) | any "claim your seat NFT" copy | "Your seat is your SYN today; SeatRecord721 is a future, separate identity NFT (PENDING)" |
| Member vs Holder vs Collector vs Patron | Distinct roles | using interchangeably | metrics that count buyers as "members" vs SYN-recipients | Define all four once; keep the "Member vs Holder" explainer |
| Era vs Chapter | **Chapter** (5); "Open Era" = name of Chapter V | "Era" generic | prose | Always "Chapter"; "Open Era" only as Chapter V's proper name |
| Rank vs tier | **Rank** (recognition) | **"tier"** (glossary-banned) | stale glossary Rank line | "Rank — structural recognition, confers nothing" |
| Patron rank vs Patron Seal | Rank "Patron" ($500) ≠ Patron Seal artifact | merging them | `RANKS_V2` "Patron" + Archive ID3 share the word | Rename the rank (e.g. avoid "Patron"), or always qualify "Patron rank" vs "Patron Seal" |
| Council rank vs Governance council | Rank "Council/Council Candidate" ≠ future governance body | implying the rank grants governance | `RANKS_V2` "Council" + future Governance | Rename rank or state explicitly "rank confers no governance" |
| Artifact vs NFT vs Archive vs Relic | **NFT** (public) · **Artifact** (secondary) · **Archive/Relic** (deep lore) | "Relic" in live UI | status rails | "NFT/Collection" publicly; "Artifact" secondary; "Relic" never in live UI |
| Activity vs Chronicle | **Activity** (raw/public) · **Chronicle** (curated/deep-lore) | "Protocol Chronicle" public | calling the feed "Chronicle" | "Activity" for the live feed; Chronicle stays curated/internal |
| Referral vs Reward | **Referral** (attribution) · **Reward** (payout) | implying either is live | labs preview | "Referral attribution (PENDING); rewards not live" |
| Burn vs tokenomics event | **Burn** (supply reduction, future) | calling LP "Burn" a token burn | `onchain-events.ts` LP Burn | "LP Burn = liquidity removal; token burn is a future, separate event" |
| Vault wallet vs Vault Reserve vs Treasury Ledger vs PCA | **Vault Wallet** (70% USDC) · **Vault Reserve** (25% SYN) · **Treasury Ledger** (movements) · **PCA** (umbrella) | "Vault" for all | **they share one address `0x205DdC…`** | Name each precisely; disclose the shared address explicitly |
| Contribution vs investment | **Contribution / participation** | **"investment"** (banned) | any returns-implying copy | "Membership / contribution / participation" only |
| Genesis Signal vs Genesis artifact vs Genesis chapter | **Genesis Signal** = Chapter I; **Genesis Chapter Artifact** = NFT category; **"Genesis Sealed"** = Archive ID5 name | mixing | First Signal note says "Genesis Chapter Artifact" | Keep chapter / artifact-category / on-chain-name distinct |

---

## PART 8 — CHRONICLE / STORY ENGINE READINESS

| Event type | Data avail? | On-chain? | Derived? | Simulated? | Visible now? | Chronicle-worthy? | In weekly/monthly? | User CTA |
|---|---|---|---|---|---|---|---|---|
| New member | Yes | Yes (sale event) | — | No | Yes (`/activity`) | Only milestones (#333 etc.) | Yes (count) | "Join" |
| Rank upgrade | Yes | Derived (cumulative USDC) | Yes | No | Partial | Rarely (recognition, not event) | Maybe (aggregate) | "View rank" |
| Chapter progress | Yes | Derived | Yes | No | Yes | No (progress) | Yes | — |
| Chapter sealed | Yes | Derived at threshold | Yes | No | Yes | **Yes** (constitutional) | Yes | "See chapter" |
| NFT minted | Yes | Yes (Archive1155) | — | No | Partial | Milestone mints yes | Yes | "Mint / view" |
| Treasury inflow | Yes | Yes (USDC flows) | — | Partly mock | Partial | Thresholds yes | Yes | "Verify" |
| LP event | Yes | Yes (Mint/Burn/Swap) | — | No | Partial | First LP event yes | Yes | "View pool" |
| Supply event | Yes | Derived | Yes | No | Partial | Major changes | Maybe | — |
| Future burn | No | No | — | No | No | **Yes (when built)** | Yes | — |
| Future referral milestone | No | No | — | Preview only | No | Yes (when built) | Maybe | — |
| Future governance event | No | No | — | No | No | **Yes (always)** | Yes | — |

**Automated outputs readiness:** Weekly/Monthly Chronicle = **feasible now** from `protocol-events.ts` (data exists, on-chain, anchored). Blog / X thread / newsletter / share card = **template-ready** but require the curation gate (`validateChronicleEntry`) so raw events aren't auto-promoted. Recommendation: build **Weekly Chronicle (aggregate, protocol-centric)** first; it's the highest-leverage, lowest-risk automated output. *Assessment only — do not implement.*

---

## PART 9 — BURN READINESS

| Item | State |
|---|---|
| Burn address readiness | **None.** No burn-address constant; SYN spec `futureMint:false`, no burn function |
| Burned supply calculation | Not implemented; effectively **0** |
| Founder burn event | Possible later (send allocation → dead address); not built |
| Community burn event | Conceptual ("Future Ecosystem … may be partially burned by vote") |
| Automated burn | Not advisable in V1 (no mechanism, legal sensitivity) |
| Chronicle entry for burns | Schema-ready (event-driven); not wired |
| Burn artifact (Proof of Fire / Ash Seal) | Concept only; would be a new Archive1155 ID via Mythology Gate |
| Legal-safe wording | "Verifiable supply reduction. Not a price mechanism, not a buyback, no payout." |
| How to show "Burned: 0" today | As a **static verified fact** (0, with the dead-address link once one exists), labeled clearly — **never** a live counter that implies an active burn program |

> **Trap to avoid:** the LP `Burn` event in `onchain-events.ts` is **liquidity removal**, not a token burn. Never surface it as "SYN burned." *Do not implement burn logic.*

---

## PART 10 — FUTURE MODULE READINESS

| Module | Status | Arch readiness | Existing stubs | Required contracts | Legal risk | User value | Revenue potential | Drift risk | Recommended timing | Stay PENDING until… |
|---|---|---|---|---|---|---|---|---|---|---|
| Referral / CommissionRouter | PENDING | High (schema designed) | `preview/referral.ts` | CommissionRouter + sale wrapper | **High** (jurisdictional) | High | Med | High | Phase 4 | legal disclosure + escrow payout pattern signed off |
| Reward / Reputation | FUTURE | Med (doctrine only) | `quest-hooks.ts` (labs) | none (derived view) | Med | Med | Low (indirect) | High | Phase 4+ | RAL events exist to derive from |
| Burn | FUTURE | Low | none | none | Med | Med (narrative) | None (no payout) | High | Phase 4+ | a real reason + legal-safe framing |
| SeatRecord721 | PENDING | High (decision doc exists) | `contract-registry.ts` null | SeatRecord721 ERC-721 | Low/Med | High (identity) | Low | Low | Phase 5 | seat demand + migration story |
| Governance | FUTURE | Low | none | voting/council | **High** | Med | None | Med | Phase 5+ | member base + legal structure |
| AI layer (Protocol Intelligence) | FUTURE | Low | none | none | Med | Med | Med (B2B) | Med | post-Phase 5 | data surfaces stable + clear non-rights framing |
| Marketplace | FUTURE | Low | none | marketplace + royalties | Med | Med | Med | Med | post-Phase 5 | artifact volume justifies it |
| B2B protocol intelligence | FUTURE | Low | none | none | Med | Med | **High** | Med | post-Phase 5 | RAL `source` namespace live |

---

## PART 11 — DOCUMENTATION SYSTEM (`docs/canon/`)

| File | Purpose | Should contain | Should NOT contain | Absorbs / points to | New / moved / alias |
|---|---|---|---|---|---|
| `00_AUTHORITY_MAP.md` | The one front door | 12 buckets, precedence law, reading order, doc classes, four-verb model | Restated economic values | Absorbs `DOCUMENTATION_AUTHORITY_MAP.md` + `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` | **Moved (merge)** |
| `01_DOCTRINE.md` | Constitutional index | Vision, "is/is not", North Star, four verbs | Implementation detail | Points to `VISION.md`, `CONSTITUTION_SUMMARY.md` | **New (index)** |
| `02_GLOSSARY.md` | Vocabulary truth | Approved terms, **collisions table**, simplicity rule | Stale Rank/Compounder lines | Absorbs `TERMINOLOGY_GLOSSARY.md` (de-staled) | **Moved** |
| `03_LEGAL_AND_RISK.md` | Liability firewall | Banned words, disclaimer, risk posture | Marketing spin | Points to `LEGAL_DISCLOSURE_REFERRAL.md`, `LEGAL_DISCLAIMER` | **New** |
| `04_IDENTITY_SEAT.md` | Seat/member doctrine | Seat=SYN, member #, 5 facts, Seat Record=PENDING | Rank content | Points to `holder-index.ts`, `SCARCITY_*` | **New (pointer)** |
| `05_CHAPTERS.md` | Chapter doctrine | 5 chapters + ranges | Cohort variants | Points to `chapters.ts` | **New (pointer)** |
| `06_RANKS.md` | Rank doctrine | Recognition-only, cumulative-USDC basis, 12 tiers | Spend-ladder copy | Absorbs `RANK_CONSTITUTIONAL_RULING.md` | **Moved** |
| `07_TOKENOMICS.md` | Supply truth | Allocation, supply, rate; Vault Reserve≠Vault Wallet (note shared addr) | Mock balances | Points to `TOKENOMICS_ALLOCATION` | **New (pointer)** |
| `08_ECONOMIC_MODEL.md` | Money flow | 70/20/10 (sale-only), per-stream routing, 30-sec model | NFT/LP revenue as "yield" | Points to `USDC_ROUTING`, `REVENUE_ATTRIBUTION_LAYER.md` | **New** |
| `09_ARTIFACTS.md` | Artifact doctrine | Archive IDs, prices, no-rights | "Relic" public | Points to `archive-id-registry.ts` | **New (pointer)** |
| `10_NARRATIVE.md` | Story engine | Activity (raw) vs Chronicle (curated), gate | Promoting raw events | Points to `protocol-events.ts`, `chronicle-entries.ts` | **New** |
| `11_VERIFICATION.md` | Trust engine | The **one** canonical metric truth | A second members definition | Points to `protocol-truth.ts` (chosen winner) | **New** |
| `12_FUTURE_MODULES.md` | Deferred systems | Referral/reward/burn/gov/SeatRecord721 + PENDING-exit conditions | "Live" framing | Points to the 5 doctrine files | **New** |
| `SOURCE_OF_TRUTH_TABLE.md` | Daily lookup | Part 2 table | Prose | — | **New** |
| `FOUNDER_INTENT_MAP.md` | The "why" | Part 3 | Mechanics | — | **New** |
| `DOC_SYNC_CHECKLIST.md` | The process | Part 12 order + guard-array reminder | — | — | **New** |

**Design rule:** every `04–12` file is a **thin pointer to code** (code outranks docs), so values can't drift inside docs. The ~140 existing docs stay put — already classified HISTORICAL/DEPRECATED.

---

## PART 12 — DOC / SITE / FAQ / WHITEPAPER SYNC PROCESS

**Required update order when any concept changes:**
1. **Code / contract truth** (the registry/config — the only real source)
2. **`SOURCE_OF_TRUTH_TABLE.md`** (reflect the new truth)
3. **Canon docs** (`04–12`)
4. **Glossary** (`02`)
5. **FAQ**
6. **Whitepaper**
7. **Site copy** (routes/components)
8. **Doctrine guard / banned words** (`doctrine-guard.test.ts` `CANONICAL_DOCS`/`DOC_BANNED` + `live-content-rules.json`) — **the decoupled step that's most often skipped**
9. **Discrepancy audit** (re-run the checklist below)

**Checklist Replit can run later (read-only scan):**

| Check | How |
|---|---|
| Stale values | grep mock constants (`VAULT_ASSETS`, `VAULT_INFLOWS`, `GENESIS_NFT_PRICE`, `VAULT_STARTING_VALUE`, `CURRENT_EPISODE`) |
| Typos | spell pass over canon + routes |
| Banned terms | run `doctrine-guard.test.ts` + `check-live` |
| Old rank names | grep `Founder`/`Genesis Circle`/`Compounder`/`scoreMultiplier` |
| Old chapter thresholds | grep `First 100/500/1000`, `Genesis 10` |
| Wrong NFT prices | compare copy vs `ARCHIVE_CONTRACT_STATE` (0.50 / 5.00) |
| Wrong contract addresses | diff against `CONTRACTS` / `contract-registry.ts` |
| Simulated-as-live | grep `status: "PENDING"` constants rendered without a PENDING pill |
| Live-but-hidden | audit NFT-revenue + LP-fee surfacing depth |
| Legal-risk wording | grep banned financial vocabulary in all copy |

---

## PART 13 — FINAL PRIORITY ROADMAP (minimal change, no implementation)

| Phase | Goal | Files/components affected later | Risk | Why now / why later |
|---|---|---|---|---|
| **0 — Consolidate canon** | One authority front door + de-stale glossary | `docs/canon/*`, guard arrays | Low | Stops drift cheaply; **do first** |
| **1 — Surface existing truth** | Resolve dual-registry "members"; remove/curtain mock Vault data; show real NFT/LP destinations | `protocol-truth.ts`, `data-verification-registry.ts`, `VAULT_ASSETS/INFLOWS`, `/transparency` | Med | Credibility; verifier persona currently hits mock data |
| **2 — Revenue-per-member clarity** | One honest "recognition ≠ return; more spend = more recognition" surface | `/ranks`, `06_RANKS.md` | Low | Directly answers "why spend >$5" without inventing benefits |
| **3 — Chronicle / story engine** | Weekly Chronicle (aggregate, gated) | `protocol-events.ts`, `chronicle-entries.ts` | Med | Data already exists; highest narrative leverage |
| **4 — Prepare referral/burn/future** | Lock schemas + PENDING-exit conditions; keep labs quarantined | doctrine files, `preview/referral.ts` | Med | Reserve namespace; don't build yet |
| **5 — New contracts** | Only then SeatRecord721 / CommissionRouter | new contracts | High | Highest cost/risk; everything above de-risks it |

---

## PART 14 — STEWARD'S PERSPECTIVE (5-year maintainer view)

**What we're underestimating:** documentation entropy. 140 docs with a decoupled guard is the real liability — not features. The canon already exists; keeping it *coherent* is the unsolved problem.

**What we're overcomplicating:** the future stack (RAL, Reputation, Builder Records, Governance, AI, marketplace). The four-verb map already warned: the next failure mode is **over-design**, not under-design.

**What we keep reinventing:** the authority map itself. We have `DOCUMENTATION_AUTHORITY_MAP.md` *and* `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` *and* `CANONICAL_REGISTRY.md` — three overlapping "maps." Each new audit (including this one) re-derives them. Merge once.

**Future ideas that recur but probably shouldn't be built:** standalone CampaignRegistry / AcceptedTokenRegistry / TierOracle (already rejected), a Builder-Score *leaderboard*, automated burns, an AI layer before the data surfaces are stable.

**Future ideas that recur and should eventually be built:** Weekly Chronicle automation, SeatRecord721, and a legally-sound referral attribution layer — in that order.

**Current assumptions that are wrong:** that "Vault Wallet" and "Vault Reserve" are separate (same address); that mock Vault data reads as placeholder (it renders as numbers); that the guard enforces the authority map (it doesn't).

**Strongest but underexposed concepts:** the **seat-as-product** identity model and the **verification spine** — both are genuinely differentiated and both are buried under economic surfaces.

**Looks important but low leverage:** Rank tiers beyond ~Vanguard, the Vault "balance sheet" visuals (mock), and most "future module" UI.

**What breaks first, by scale:**
- **100 members:** nothing technical — *narrative clarity* breaks (why spend >$5).
- **1,000:** the **dual "members" definition** produces two public numbers; manual Chronicle/treasury tagging can't keep up.
- **10,000:** full-history on-chain scans (holder-index/event merges) get slow without durable indexing/pagination.
- **100,000:** client-side indexing is untenable — needs a backend indexer; Chronicle must be automated or abandoned.

**One thing to ADD in 12 months:** a single **canonical metric/verification service** (one "members" number, one supply truth, no mock) — it underpins every persona and every future module.

**One thing to REMOVE permanently:** the mock Vault balance-sheet data (`VAULT_ASSETS`/`VAULT_INFLOWS`) — it's the highest-credibility-risk artifact in the codebase.

**Under-attended doctrine:** the **Rank Constitutional Ruling** vs the still-stale glossary line — the contradiction lives in the most-referenced vocabulary file.

- **Biggest future drift risk:** the **decoupled doctrine guard** (map and enforcement diverge silently).
- **Biggest future technical debt:** **client-side on-chain indexing** with no backend indexer.
- **Biggest future legal risk:** the **referral/reward** layer (jurisdictional) and any copy that lets recognition read as return.
- **Biggest future user confusion:** **"why spend more than $5"** + the Vault/Treasury/Reserve naming overload.
- **Biggest hidden opportunity:** the event data for an **automated Weekly Chronicle** already exists — narrative-as-a-product, nearly free.

**If it succeeds,** the decision remembered as most important will be **"no financial rights, verifiable by design"** — the constitutional restraint that kept it legal and credible.
**If it fails,** the most likely reason is **drift** — docs/site/FAQ/whitepaper diverging from code until trust erodes (or a legal misstep from reward language).

**Brutally honest founder-grade close:**
- **Protect:** the seat-as-product identity, the verification spine, and the "no rights" constitution.
- **Simplify:** collapse the three authority maps into one; delete mock data; one metric truth.
- **Postpone:** referral, reputation, burn, governance, AI, marketplace — all of it, behind explicit PENDING-exit conditions.
- **Never build:** anything implying yield/ROI/dividends/governance-by-spend, or a wealth leaderboard.
- **Focus next:** Phase 0 → 1 → 2 — consolidate canon, surface real truth, and answer "why spend more than $5" honestly. *Do not optimize for activity.*

---

*Read-only audit. The only project files touched were this report and the agent's own working-memory notes — no protocol code, config, or canon docs were modified.*
