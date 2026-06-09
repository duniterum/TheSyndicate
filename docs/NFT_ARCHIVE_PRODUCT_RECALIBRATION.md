# NFT / Archive Product Recalibration — Thinking Pass

**Status:** Thinking pass only. No code, no contracts, no ABI, no ID activation, no SeatRecord721, no Protocol Chronicle configuration.
**Authority on conflict:** docs/VISION.md → Core Asset gate → Mythology gate → Infinite Narrative gate.
**Doctrine:** **SYN is the seat. NFTs are the memory.**

This document is the design/IA brief that must be accepted before any visual or structural rework of `/nft` and `/archive` is implemented, and before ID 9 (Protocol Chronicle) is configured on-chain.

---

## A. Audience Lens Diagnosis

The current `/nft` experience speaks to one audience at a time, in the wrong order. Here is what each audience walks away with today, by the questions they actually arrive with.

### A.1 First-time visitor

| Question | Today's answer | Gap |
|---|---|---|
| What is this? | "The First Signal — opening NFT" | OK, but the universe (collection, categories, idea) is invisible above the fold. |
| Why should I care? | Implicit — "Chapter I, opening record" | Emotional hook is weak. The hero leads with mechanics (price, supply) before meaning. |
| What can I mint now? | Mint CTA present | OK. But Patron Seal (ID 3) lives mid-page, not visible alongside First Signal as a co-equal LIVE option. |
| Is this live or fake? | "LIVE" pill + contract link | OK at the artifact level, but the rest of the gallery looks placeholder-like enough to cast doubt over the whole page. |
| Where do I click? | One CTA, lower on the showcase | Lower-funnel works; upper-funnel doesn't tell you a category map exists. |
| Why are these NFTs different from random JPEGs? | Anatomy bands + "on-chain SVG" | Explanation arrives, but only for First Signal. No "this is a *protocol memory engine*" framing. |

**Net:** the visitor sees a token launch page, not a collection universe.

### A.2 Investor / verifier

| Question | Today's answer | Gap |
|---|---|---|
| Can I verify the token? | Yes — `/registry`, `/token`, explorer links | OK. |
| Can I verify the sale? | Yes — `MembershipSale` reads | OK. |
| Can I verify NFT mints? | Partial — `LiveProofStrip` + `ArchiveContractStatus` | OK for First Signal; weaker for ID 3; absent for IDs 4–9. |
| Can I verify treasury routing? | `/transparency`, `/vault` | OK, but not cross-linked from `/nft`. |
| Can I see what is live/pending/frozen/ownerOnly/roadmap? | Mixed — gallery shows IDs but state hierarchy is flat | Needs a single legend + one shared status grammar. |
| Are numbers sourced or invented? | Sourced via registry + hooks | OK. The new `/protocol-health` makes this explicit. |
| **Hidden gap** | — | There is no single "Verification layer" panel on `/nft`. The investor has to leave the page to verify the whole collection at once. |

### A.3 Member

| Question | Today's answer | Gap |
|---|---|---|
| What do I own? | `/my-syndicate` | Off-page. No "you" surface on `/nft`. |
| What chapter are we in? | Implicit "Chapter I" copy | No chapter indicator; no progress; no episode framing. |
| What changed since my last visit? | None | Not surfaced — Infinite Narrative gate violation. |
| What comes next? | Roadmap items, scattered | No "coming next" / "previously on" structure. |
| What episode are we in? | None | Series framing absent. |

### A.4 Founder / operator

| Question | Today's answer | Gap |
|---|---|---|
| What is active/frozen/configured/ownerOnly/pending? | `/protocol-health`, registry, deferred ledger | OK — operator surface exists, but operator language **leaks into the visitor surface** (e.g. "OWNER_ONLY", "RESERVED_DISABLED", "NOT_CONFIGURED" rendered next to dream-state artifacts). |

**Top finding:** the **founder/operator vocabulary is bleeding into visitor-facing cards** for IDs 2 and 4–9. This is the single most important copy issue.

### A.5 Future DAO / protocol memory

| Question | Today's answer | Gap |
|---|---|---|
| Which moments become permanent artifacts? | No declared rule | Needs an explicit "what qualifies as a Memory" doctrine on-page. |
| Why does an artifact exist? | Per-ID copy varies | No consistent "this artifact exists because X sealed on-chain at Y" template. |
| What should NOT become an NFT? | Not stated | Visible refusal is part of the trust model — should be stated. |
| How does Protocol Chronicle fit? | Unstated; ID 9 is `NOT_CONFIGURED` | See §H. |

---

## B. Current `/nft` and `/archive` Problems

Concrete failure modes, sorted from worst to mildest.

1. **Placeholder cards undermine the live ones.** IDs 2 and 4–8 are rendered with thin pixel placeholders + technical labels (`#004 · PIXEL SECRET`, `PREVIEW · NOT CONTRACT-RENDERED`, `Hidden`). This is honest about contract state but destroys the desire signal for the LIVE artifacts above them.
2. **Founder vocabulary on visitor surface.** "RESERVED_DISABLED", "OWNER_ONLY", "NOT_CONFIGURED" appear adjacent to consumer cards. These are operator states, not visitor copy.
3. **No universe board.** There is no one panel that says "the collection is a memory engine; here are the *categories* of memory." Image 3 is the missing structural artifact.
4. **Co-equal LIVE artifacts aren't co-equal.** First Signal (ID 1) dominates the hero. Patron Seal (ID 3) is mid-page in a "readiness" panel. Today, both are LIVE public mints — they should be presented as a *paired* opening.
5. **Same-looking artifacts.** Pixel placeholders for IDs 4, 5, 7, 8 are visually indistinct. Investors and members read "filler", which contaminates trust in IDs 1 and 3.
6. **No verification layer block on `/nft`.** Investor must navigate to `/registry` / `/transparency` / `/protocol-health` to verify the *whole* collection. Verification is fragmented across pages.
7. **No "you" surface.** A member who already minted Patron Seal sees no acknowledgement on `/nft` — no balance, no chapter, no "next episode".
8. **No "what changed since last visit"** — Infinite Narrative gate failure.
9. **No FAR layer.** The page shows PAST (Genesis Seal), PRESENT (current mints), partial NEXT (gallery placeholders), but no visible-as-sealed FAR (Protocol Chronicle, decade view). Infinite Narrative gate failure.
10. **Cliffhanger is absent.** No named, on-chain-anchored "coming next" event.
11. **`/archive` and `/nft` overlap and diverge.** `/nft` is the marketing surface; `/archive` is the museum. They share visuals but not a clear division of labor — visitors don't know which to visit.
12. **Heavy technical text appears too early.** Anatomy bands and "How The Archive Works" arrive before the visitor knows *why they should want* an artifact.
13. **Status pills mix two grammars.** LIVE / PARTIAL / PENDING is the protocol grammar; OWNER_ONLY / NOT_CONFIGURED / RESERVED_DISABLED is the contract grammar. They sit next to each other without explanation.
14. **No category iconography.** Image 3's icon vocabulary (certificate · seal · artifact · secret · legacy) is absent — every card looks the same, so the "different categories" idea never lands.
15. **No "site presentation vs on-chain image" labeling discipline.** Today we are honest ("NOT CONTRACT-RENDERED") but ugly; the cure is not to lie, it is to label cleanly.

---

## C. Design Principle (governing rules for the redesign)

Every surface on `/nft` must do **three jobs simultaneously**, layered top → bottom:

1. **Visitor conversion (top 1.5 screens).** Emotional. What this is, why it matters, what is LIVE *right now*. Two co-equal mint cards (First Signal + Patron Seal). One sentence per artifact. No contract jargon. No operator state.
2. **Universe explanation (next 1–2 screens).** The Image-3 structural board, adapted: one engine, multiple categories, verifiable forever. This is where Seat Record (future) / Patron Seal (live) / Chapter Artifact (live) / Secret Artifact / Legacy appear as a *family*, not a fake catalog.
3. **Investor verification (next 1 screen).** A single block — contract, IDs, supplies, prices, registry/explorer/treasury links — for the whole collection. Honest LIVE / PARTIAL / PENDING grammar only.
4. **Member series (below).** "Previously on" (Genesis Seal + recent mints) → "Currently airing" (live mints + freshness) → "Coming next" (real on-chain-anchored upcoming sealing event) → "Far horizon" (Protocol Chronicle, sealed-as-future).
5. **Founder/operator state (bottom, collapsed).** Available for transparency; never primary visitor copy. Lives in a "Operator state" disclosure that links to `/protocol-health`.

**Hard rule:** founder/operator vocabulary (`OWNER_ONLY`, `NOT_CONFIGURED`, `RESERVED_DISABLED`) is **forbidden on visitor cards**. It is allowed only inside the collapsed "Operator state" panel and on `/protocol-health`.

---

## D. Proposed NFT / Archive Information Architecture

Two pages with clear, non-overlapping jobs.

### D.1 `/nft` — the *Collection* page (visitor + investor + member, in that order)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. UNIVERSE HERO                                                │
│    "The Syndicate Archive — on-chain memory of a living         │
│     protocol."                                                  │
│    Doctrine line: SYN is the seat. NFTs are the memory.         │
│    Sub-line: 1 contract · multiple categories · verifiable      │
│              forever on Avalanche.                              │
│    State strip: Chapter I · 2 artifacts LIVE · Genesis sealed.  │
│    Two co-equal LIVE mint chips: First Signal · Patron Seal.    │
├─────────────────────────────────────────────────────────────────┤
│ 2. LIVE MINTS (paired, co-equal)                                │
│    ┌──────────────────────┐  ┌──────────────────────┐           │
│    │ The First Signal     │  │ Patron Seal          │           │
│    │ Chapter Artifact     │  │ Supporter Badge      │           │
│    │ on-chain SVG (big)   │  │ on-chain SVG (big)   │           │
│    │ Price · Supply ·     │  │ Price · Supply ·     │           │
│    │ Minted · Wallet cap  │  │ Minted · Wallet cap  │           │
│    │ [Mint] [Verify]      │  │ [Mint] [Verify]      │           │
│    └──────────────────────┘  └──────────────────────┘           │
├─────────────────────────────────────────────────────────────────┤
│ 3. ARTIFACT UNIVERSE BOARD  (Image-3 adaptation)                │
│    "Same engine. Different categories of memory."               │
│    5 category lanes, each with: icon · name · what it proves ·  │
│    current state (LIVE / PARTIAL / PENDING) · how it is sealed. │
│       · Identity / Seat Record   (future ERC-721)               │
│       · Chapter Artifact         (First Signal — LIVE)          │
│       · Supporter Seal           (Patron Seal — LIVE)           │
│       · Protocol Memory          (events, milestones — PENDING) │
│       · Secret Artifact          (hidden discoveries — PENDING) │
│       · Legacy / Chronicle       (Protocol Chronicle — PENDING) │
├─────────────────────────────────────────────────────────────────┤
│ 4. HOW THE ENGINE WORKS                                         │
│    1 contract (Archive1155) · on-chain SVG/metadata ·           │
│    deterministic per-token data (serial · wallet · timestamp).  │
│    Site presentation vs on-chain image clearly labeled.         │
├─────────────────────────────────────────────────────────────────┤
│ 5. VERIFICATION LAYER (single block)                            │
│    Contract address · all IDs · current state grammar           │
│    (LIVE / PARTIAL / PENDING) · price · minted · supply ·       │
│    explorer · registry · treasury routing · activity feed.      │
├─────────────────────────────────────────────────────────────────┤
│ 6. MEMBER OWNERSHIP STRIP   (only when wallet connected)        │
│    You hold: [First Signal #0042] [Patron Seal #0017]           │
│    Chapter I · joined block 50,123,456                          │
│    Coming next: [named on-chain sealing event]                  │
├─────────────────────────────────────────────────────────────────┤
│ 7. SERIES VIEW                                                  │
│    Previously on The Syndicate (Genesis · last 3 mints)         │
│    Currently airing (live mints + indexer freshness)            │
│    Coming next (real on-chain-anchored threshold)               │
│    Far horizon (Protocol Chronicle, sealed-as-future)           │
├─────────────────────────────────────────────────────────────────┤
│ 8. OPERATOR STATE (collapsed, link to /protocol-health)         │
│    OWNER_ONLY / NOT_CONFIGURED / RESERVED_DISABLED here only.   │
├─────────────────────────────────────────────────────────────────┤
│ 9. FINAL CTA                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### D.2 `/archive` — the *Museum* page (member + future DAO)

`/archive` becomes the long-form, browseable museum. It is allowed to be heavier, slower, more text. It is **not** an alternate marketing page.

Sections:

1. **Museum hero** — "The Archive. Every memory the protocol chose to seal."
2. **Chapter index** — Chapter I (open), Chapter II (sealed when threshold met), …
3. **Artifact catalogue** — every LIVE artifact + every sealed Memory, browseable by category, chapter, serial.
4. **Sealing rules** — the on-page rulebook for what becomes an artifact and what does not (refusal list).
5. **Provenance tools** — search by token ID, by wallet, by chapter, by sealing block.
6. **Operator state** (collapsed) — same as `/nft`.

The two pages share components (cards, status grammar, verification block) but never duplicate the *job*. `/nft` is for desire + verification + action. `/archive` is for memory + provenance + history.

---

## E. Visual System Recommendation

The on-chain SVG is the canonical artifact and stays simple. The **site-side frame** around it must do the premium-collectible work — without lying that the frame is the token.

### E.1 Card families (3, not more)

| Family | Used for | Frame language |
|---|---|---|
| **Live Artifact** | First Signal, Patron Seal, any future LIVE ID | Premium frame: deep navy/charcoal field, gold ornamental frame, large on-chain SVG centered, chapter badge top-left, category badge top-right, serial + chain footer, QR/explorer corner. |
| **Memory Slot** | PENDING IDs that are real future categories (Memory, Secret, Legacy) | Same frame **silhouette**, but treated as a *sealed envelope*: muted gold on midnight, no fake preview art, single line ("Sealed when [on-chain condition]"), category badge, no serial, no QR. *Visible-as-sealed*, never empty. |
| **Identity Slot** | Seat Record (future ERC-721) | Distinct frame (wax-seal motif), labelled "Identity layer — separate contract", never confused with Archive1155 artifacts. |

**Forbidden:** the current pixel-heart placeholder treatment for non-LIVE IDs. It reads as a half-finished JPEG and contaminates the LIVE artifacts.

### E.2 Category icon vocabulary (5)

Adapted from Image 3, normalized:

- **Identity** — wax seal / chair glyph (Seat Record)
- **Chapter Artifact** — beacon / signal glyph (First Signal lineage)
- **Supporter Seal** — laurel-wax glyph (Patron Seal lineage)
- **Protocol Memory** — column / milestone glyph (sealed events)
- **Secret Artifact** — eye / hidden mark glyph (rare discoveries)
- **Legacy / Chronicle** — hourglass glyph (Protocol Chronicle, decade view)

Same stroke weight, same gold-on-dark palette, same 24px badge — used **everywhere** (board, cards, verification block, series view).

### E.3 Color system (locked to design system v2)

- Gold = CTA, seal, ornament, "you own this"
- Cyan `--verify` = verification, live read, freshness
- Green `--success` = LIVE state
- Amber `--gold` (warning tone) = PARTIAL state
- Muted = PENDING / sealed-as-future
- Red `--destructive` = BLOCKER (operator state only)

No new tokens. Never hardcode oklch in components.

### E.4 Typography

- **Instrument Serif** — artifact names, chapter titles, hero H1/H2 (collector dignity)
- **Work Sans** — body, UI, captions
- **JetBrains Mono** — addresses, token IDs, serials, hashes, sealing blocks

Never substitute mono for narrative text. Never substitute serif for UI.

### E.5 Badge system (one shape, five jobs)

A single pill primitive with five orthogonal slots:

| Slot | Examples |
|---|---|
| Category | "Chapter Artifact", "Supporter Seal", "Secret Artifact" |
| Chapter | "Chapter I", "Genesis", "Chapter II — sealing" |
| State | LIVE / PARTIAL / PENDING |
| Rights | "No financial rights · collectible record only" |
| On-chain | "On-chain SVG" / "Site presentation" (mandatory disambiguation) |

### E.6 Honesty labels (non-negotiable)

Every site-side rendering carries one of:

- `On-chain SVG` — when we render the actual contract `tokenURI` image
- `Site presentation` — when we render a richer frame around the on-chain image
- `Concept preview` — when we render a category that has no LIVE token yet
- `Roadmap visual` — when we render a sealed-as-future slot

We **never** claim a richer site frame is the on-chain image. We **never** hide the on-chain truth — but the truth is shown deliberately ("View the on-chain SVG"), not accidentally ("PREVIEW · NOT CONTRACT-RENDERED" sprawled across an ugly placeholder).

### E.7 Verification proof affordance (per card)

Every Live Artifact card carries:

- explorer link (canonical via `txUrl`/`addressUrl`)
- registry link (`/registry#archive-1155`)
- live read: `minted` / `supply` / `price` (sourced from the same hooks used today)
- "Verify on-chain" disclosure that expands to show: contract address, token ID, last `TokensPurchased` block, indexer freshness

### E.8 Site-side richer art (the long-term direction)

Image 3 / Image 4 show what is *possible* with a generative engine. Today the on-chain SVG is simple; that is fine. The site can render richer frames around the simple SVG so the page feels premium — *clearly labeled* as `Site presentation`. The richer art is **never** the source of truth.

---

## F. Copy Model by Audience

Five voices. One vocabulary glossary. Strict assignment per surface.

### F.1 Visitor voice (universe hero + paired live mints)

- Short. Emotional. No jargon in the first 2 sentences.
- Example: *"The Syndicate writes its memory on-chain. Two artifacts are open right now — the opening signal and the supporter seal. Each one is a permanent record. Pay once. Verified forever."*
- Banned in this voice: ROI, return, yield, configured, ownerOnly, not_configured, reserved, pending (use *coming* or *sealed when*).

### F.2 Investor voice (verification layer)

- Short. Source-linked. Proof-first. No hype.
- Example: *"ID 1 — First Signal. Price 0.50 USDC. Minted 1,243 / 10,000. Wallet limit 5. Read live from Archive1155 at 0xB2AE…7D54d (Avalanche C-Chain). Explorer · Registry · Treasury routing."*
- Banned: marketing language, growth metaphors, "premium", "exclusive".

### F.3 Member voice (you-surface + series view)

- Personal. Progression-based. Chapter/episode language.
- Example: *"You sealed Patron Seal #0017 in Chapter I, 14 days ago. The next chapter opens when the 5,000th First Signal is minted — 3,757 to go."*
- Banned: "investment", "your bag", any wealth framing.

### F.4 Founder/operator voice (operator state panel + `/protocol-health`)

- Technical. State-based. Activation-aware. Lower priority.
- Example: *"ID 2 — reserved · disabled · pending architecture decision (Seat Record). ID 9 — not configured on-chain."*
- Allowed terms: configured, ownerOnly, reserved, not_configured, frozen, deferred. **Confined to the operator panel and `/protocol-health`.**

### F.5 Refusal voice (rulebook on `/archive`)

- Doctrine. Explicit refusals.
- Example: *"We will not mint: artificial milestones, fake scarcity, wealth-coded tiers, social-engagement rewards. A memory exists only when a real on-chain event seals it."*

### F.6 The mistake to stop repeating

Founder copy is currently rendered to visitors ("NOT CONTRACT-RENDERED", "OWNER_ONLY"). **This is the single highest-leverage copy fix.** Every visitor-facing card must be rewritten in visitor voice; operator state moves down.

---

## G. TV-Series / Addiction Model

The collection becomes a *series* without inventing fake urgency. Every element below maps to a real on-chain fact.

| Series element | On-chain anchor | Visible on |
|---|---|---|
| **Previously on** | Genesis Seal #000001 + last 3 sealed mints from the indexer | `/nft` series view, `/archive` home |
| **Currently airing** | LIVE artifact mint counts + indexer freshness (already built) | `/nft` paired mints, `/archive` chapter index |
| **Coming next** | A *real* threshold — e.g. "Chapter II seals when the 5,000th First Signal is minted" — pulled from the same live reads. Never a countdown timer, never a date. | `/nft` series view |
| **Far horizon** | Protocol Chronicle (ID 9) — sealed-as-future slot, visible-as-sealed (per Infinite Narrative gate FAR layer) | `/nft` series view, `/archive` chronicle slot |
| **Chapter progression** | Chapter # derived from on-chain milestone events; no manufactured chapters | All artifact cards (chapter badge), member ownership strip |
| **What changed since last visit** | Compare last-visit timestamp (localStorage) to indexer events since then; render diff ("3 First Signals sealed · 1 Patron Seal sealed · indexer fresh as of block X") | `/nft` hero state strip |
| **Hidden artifact tease** | Only if Secret Artifact category has a real on-chain reveal condition. Otherwise, present category as "sealed when discovered" with no fake teaser. | Universe board, series view |

### Honesty rules for the series model

- **No countdown timers.** Thresholds are stated as "X to go" only when X is a real on-chain quantity.
- **No fake season finales.** Chapter sealing is on-chain or it does not exist.
- **No artificial cliffhangers.** "Coming next" must name a real sealing condition.
- **No fake "Previously on".** The shelf renders real recent mints, with explorer links.
- **No achievement gamification.** Progression is the chapter you joined in, not points.

---

## H. Protocol Chronicle (ID 9) — Role Recommendation

**Recommendation: Annual Protocol Chronicle — Season Finale + DAO Memory Capsule.**

One artifact category, two functions inseparable in the same object. Not a per-event Memory (that role belongs to Protocol Memory / ID 4–8 once activated). Not a per-milestone seal (that belongs to Genesis-style protocol milestones). Not a founder chronicle (founders don't get a private artifact).

### Why this fits

| Pillar | How Protocol Chronicle reinforces it |
|---|---|
| **Transparency** | One artifact per year that snapshots verifiable on-chain state — chapter sealings, treasury, holders, sale flows — at the moment of sealing. |
| **Identity** | Co-witness accretion: every Chronicle records the wallets that participated in the year. Seat Record (positional) and Chronicle (chronological) compose. |
| **Memory** | Becomes the canonical "what happened" pointer for the year — referenced by `/archive` and by future DAO governance. |
| **Momentum** | Provides the natural FAR layer for the Infinite Narrative gate. Every visitor can see *next year's* Chronicle slot, sealed-as-future. |
| **Verifiability** | Sealing rule is on-chain and explicit: when the year's last block is observed, Chronicle is minted and embeds the verified state in its on-chain metadata. |
| **Future DAO** | When the DAO forms, Protocol Chronicle is its first historical record class — no off-chain spreadsheet needed. |
| **TV-series feeling** | One finale per season. Real cadence. No fake cliffhangers. |

### What Protocol Chronicle is NOT

- Not a per-event log (use Protocol Memory IDs 4–8 for that).
- Not a founder-signed artifact (no honorary additions per Mythology gate).
- Not wealth-coded (no rank, no tier, no payout).
- Not pre-named (named at sealing per Mythology gate — e.g. "Chapter II Chronicle", named when Chapter II seals).
- Not a roadmap promise to anyone (it is a memory of what *did* happen).

### Sealing rule (draft, to refine before configure)

`Chronicle(N)` is minted when **all** of:
1. Chapter N has formally sealed on-chain (a real, declared sealing event).
2. At least one full calendar year has passed since the previous Chronicle (or since Genesis, for Chronicle I).
3. The minting is performed by the protocol contract, not by an operator click.

Mythology + Core Asset compliance (declared per gate requirement):
- **Mythology axes touched:** Era · Witness (2 of 4)
- **Naming layer used:** Named sealed event (1 of 4; named at sealing only, never before)
- **Sealing rule (on-chain):** see above
- **Prohibition re-stated:** no honorary additions; no pre-naming; no per-wallet variants; no rank
- **Cross-decade test sentence:** *"In Chapter VIII, Chronicle VII is the seal that closed the previous year — minted when the chapter sealed, named only after."* (Still parses in 2036.)

---

## I. What to Implement Now vs Later

### NOW — high-impact, low-risk, no contracts touched

These ship before ID 9 configuration and before any visual contract change.

1. **Move founder/operator vocabulary off visitor cards.** Replace "OWNER_ONLY", "NOT_CONFIGURED", "RESERVED_DISABLED" with category-tone copy ("Coming as Protocol Memory", "Sealed when discovered", "Identity layer — future"). Operator language survives only in the collapsed "Operator state" panel and on `/protocol-health`.
2. **Promote Patron Seal to co-equal with First Signal in the hero.** Paired live-mints layout.
3. **Adopt the Memory Slot frame** for non-LIVE IDs (silhouette + sealed line + category badge). Delete the pixel-heart placeholder treatment.
4. **Build the Artifact Universe Board** (Image-3 adaptation, 5 categories, real state per category, honest labels).
5. **Add the single Verification Layer block** on `/nft`.
6. **Add the Series View** (Previously / Currently / Coming next / Far horizon) — using the live reads we already have.
7. **Add the You-surface** (only when a wallet is connected; reuses existing `useArchiveBalances`).
8. **Lock the honesty-label vocabulary** (`On-chain SVG` / `Site presentation` / `Concept preview` / `Roadmap visual`) and apply it everywhere.
9. **Split `/nft` and `/archive` jobs explicitly.** Add a one-line "what this page is" header on each.
10. **Add a chapter badge** to every artifact card (real on-chain-derived chapter).

### NEXT — Protocol Chronicle (ID 9) design + spec

1. Lock the sealing rule (§H draft).
2. Lock the on-chain metadata shape (what the Chronicle embeds — chapter, year, witness set, verified state pointers).
3. Lock the Mythology + Core Asset + Infinite Narrative declarations.
4. Design the Chronicle card visual (Legacy frame family).
5. Design the *sealed-as-future* slot for upcoming Chronicles.
6. Decide the wallet-cap / supply / price model (likely free / 1-per-witness or similar, **not** a paid mint).
7. **Then** configure(9) on-chain.
8. Build `/nft` integration + `/archive` chronicle index.

### LATER — deep visual upgrade

1. Generative SVG engine v2 (per-token traits, deterministic on-chain).
2. Ownership proof cards (signed share images).
3. Animation passes (subtle, never decorative-only).
4. Marketplace polish + secondary-market read surfaces.
5. Per-chapter mint UI variants.
6. Public Memory submission queue (with on-chain sealing rules).
7. SeatRecord721 — strictly after Protocol Chronicle is live and after architecture decision document is signed off.

---

## J. What Must NOT Change

- The Archive1155 contract.
- The ABI.
- The current LIVE IDs (1 and 3) — pricing, wallet caps, supply, sale flow.
- The Sale Flow Invariants (constitutional, see `mem://constraints/sale-flow-invariants`).
- The on-chain SVG is the source of truth — site presentation is *additional*, never *substitute*.
- `/protocol-health` and the CI gate.
- The honesty rule: never claim a richer site frame is the on-chain image.
- The doctrine: SYN is the seat. NFTs are the memory.

---

## Constitutional Gate Declarations

### Infinite Narrative gate (per docs/INFINITE_NARRATIVE_AUDIT.md §7–§8)

- **PAST:** Genesis Seal #000001 (sealed on-chain, real)
- **PRESENT:** First Signal (ID 1) + Patron Seal (ID 3) — live mints, indexer-fresh
- **NEXT:** named on-chain-anchored threshold — *"Chapter II opens when the 5,000th First Signal is minted"* (real on-chain quantity, not a date)
- **FAR:** Protocol Chronicle (ID 9) — sealed-as-future slot, visible-as-sealed, never absent
- **Tenses:** past perfect ("Genesis sealed at block 50,123,456") · present continuous ("First Signal is minting") · future conditional ("Chronicle I will seal when Chapter I closes")
- **Eternal threads (≥3 of 5):** Membership ✓ · Chapter ✓ · Treasury ✓ · Identity ✓ · Verification ✓ (5/5)
- **Cliffhanger (on-chain-backed):** the 5,000th First Signal threshold; named, not invented
- **"What changed since last visit":** state strip + diff on the hero

### Core Asset gate (per docs/SCARCITY_STATUS_PERMANENCE_AUDIT.md §9)

- **Seat facts surfaced (≥2 of 5):** chapter-of-joining ✓ · block-height anchor ✓ · co-witness set ✓ (3/5 on the member ownership strip; member# and founders-flag added on the You-surface)
- **Status reinforcement (≥1 of 3):** co-witness accretion ✓ (Chronicle) · cohort belonging ✓ (chapter badge) (2/3)
- **Anticipation anchor:** real on-chain sealing event (Chapter II threshold; Chronicle I sealing rule)
- **Status type:** positional, never wealth

### Mythology gate (per docs/MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md)

- **Axes touched:** Era ✓ (Chapter) · Witness ✓ (Co-witness) · Origin ✓ (chapter-of-joining) — 3 of 4
- **Naming layer:** Named sealed events (Chronicles, Chapter seals) — exactly 1 of 4
- **Sealing rule (on-chain):** see §H
- **Prohibition re-stated:** no pre-naming · no honorary additions · no wealth-coded pride · no per-wallet variants
- **Cross-decade test sentence:** *"In 2036, Chronicle X sealed at the close of Chapter X, witnessed by the cohort that held First Signal #000001 through #009999."*

### Founder Multi-Hat Five-Value Test

| Value | This recalibration delivers |
|---|---|
| Engineering | Honest grammar, fewer placeholders, single verification block, no contract risk |
| User | Visitor-voice copy first; mint actions promoted; mystery preserved |
| Emotional | Mystery (Secret), legacy (Chronicle), belonging (Chapter), ownership (You-surface) |
| Story | Series structure (Previously / Currently / Coming next / Far) on real on-chain facts |
| Retention | "What changed since last visit" + Coming next + Far horizon all give a reason to return |

**7 emotional questions answered (≥3 required):** care ✓ · join ✓ · return ✓ · share ✓ · early ✓ · progress ✓ · identity-or-anticipation ✓ (7/7)

### New Product Test

| Test | Result |
|---|---|
| Increases transparency? | ✓ (verification layer, honesty labels) |
| Strengthens identity? | ✓ (chapter badge, You-surface, Chronicle witness) |
| Improves protocol memory? | ✓ (Universe board, Chronicle role, /archive split) |
| Reveals momentum? | ✓ (Series view, freshness, threshold cliffhanger) |
| Increases shareability? | ✓ (cleaner cards, on-chain-anchored claims, premium frames) |
| Helps community formation? | ✓ (Chapter cohort, co-witness accretion) |

6/6.

---

## Decision Lens Verdicts

| # | Lens | Verdict | Note |
|---|---|---|---|
| 1 | Founder | ✓ | Aligns NFT layer with VISION doctrine and Five Pillars; defers contract risk. |
| 2 | Investor | ✓ | Single verification block + honest LIVE/PARTIAL/PENDING grammar; no invented numbers. |
| 3 | Growth | ✓ | Paired live mints + Universe Board materially improve top-of-funnel desire without paid acquisition. |
| 4 | Behavioral | ✓ | Series structure + "what changed" + chapter cohort = compounding return behavior. |
| 5 | UX | ✓ | One status grammar at a time; founder vocabulary segregated. |
| 6 | Product | ✓ | Two pages, two jobs (`/nft` = desire+verify+act; `/archive` = museum). No overlap, no duplication. |
| 7 | Staff Eng | ✓ | Zero contract/ABI change; reuses existing hooks; new pieces are presentational. |
| 8 | QA | ✓ | Honesty labels are testable; status grammar is enumerable; no fake states to verify. |
| 9 | A11y | ✓ | Card families share one primitive; badges have textual labels; mono only for IDs/hashes. |
| 10 | SEO | ✓ | `/nft` (indexable, intent-rich) and `/archive` (indexable, long-tail) split cleanly. `/protocol-health` stays `noindex`. |

**Result:** 10 ✓ / 0 ⚠ / 0 ✗ — passes the binding gate to *plan and design* the recalibration. Implementation begins only after this brief is accepted and after Protocol Chronicle §H is signed off.
