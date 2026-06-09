> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# NFT Final Architecture Audit — Pre-SeatRecord721

**Status:** ARCHITECTURE / STORYTELLING ONLY · NO CODE · NO CONTRACT CHANGES · NO ACTIVATION
**Scope lock:** Vocabulary, collection architecture, page hierarchy, navigation, Patron Seal readiness, Protocol Chronicle (ID 9) concept.
**Doctrine anchor:** SYN is the seat. NFTs are the memory. Less is more.

---

## 0. Executive verdict

The site has **three unspoken NFT systems quietly merged into one** under the word "Archive":

- **System A — Public Collectibles** (IDs 1, 3) — mintable, priced in USDC, story-forward.
- **System B — Protocol Memory** (IDs 4–8) — ownerOnly artifacts sealed by protocol events.
- **System C — Identity** (ID 2 → future SeatRecord721) — seat-as-identity, never an Archive1155 mint.

Today they share one page, one menu word ("Archive"), one card grid, and one visual weight. A first-time visitor cannot tell what they can buy, what they must earn, and what is reserved. **This is the single largest comprehension failure on the site.** Everything that follows fixes it without renaming a single on-chain field.

---

## A. NFT Vocabulary Audit

Twelve terms are in active circulation. They collapse into three layers.

### Term inventory (where it lives · current weight · verdict)

| Term | Primary appearance | Current weight | Verdict |
|---|---|---|---|
| **NFT** | `/nft`, `/nfts`, Header hint, OG copy | Public (correct) | **KEEP as public language** |
| **Archive** | Header label, `/archive`, ~25 components prefixed `Archive*`, FAQ, footer | Primary nav | **DEMOTE — move from public to secondary** |
| **Artifact** | `archive-config.ts`, gallery cards, anatomy bands, hero copy | Mixed (public + lore) | **DEMOTE to secondary** (collector word, not nav word) |
| **Collection** | Almost absent (1–2 mentions in `/nfts` SEO) | Missing | **PROMOTE to public** — this is the missing public word |
| **Chapter** | `chapters.ts`, `/chapters`, IdentityZone, EarlyChapters | Public (correct) | **KEEP as public language** |
| **Member** | Universal | Public (correct) | **KEEP** |
| **Seat / Seat Record** | Vision, ID 2 spec, SeatRecordPanel | Lore + future product | **KEEP as identity language** (NOT collectible language) |
| **Protocol Memory** | Vision, a few card subtitles | Lore | **PROMOTE to secondary** — best umbrella for IDs 4–8 |
| **Signal** | "The First Signal", "Heart Signal", "First Routing Signal" | Proper-noun only | **KEEP as proper nouns only** — never a category word |
| **Seal** | "Patron Seal", "Genesis Sealed" | Proper-noun only | **KEEP as proper nouns only** |
| **Relic** | Stray mentions in EarlyChapters / chapter doctrine | Lore | **REMOVE from live UI** (lore docs only) |
| **Chronicle** | ID 9 working name in this doc | Not yet on-chain | **DECIDE in §F** |

### Recommended 3-layer hierarchy

```text
PUBLIC LANGUAGE (first 60 seconds, nav, CTAs, OG, FAQ headlines)
├── NFT
├── Collection
├── Chapter
└── Member

SECONDARY LANGUAGE (card subtitles, section eyebrows, body copy)
├── Artifact            ← what one item in the Collection is called
├── Protocol Memory     ← umbrella for ownerOnly milestone NFTs
└── Seat Record         ← identity NFT (future ERC-721)

DEEP LORE (in-depth pages, anatomy, /archive long-form)
├── Archive             ← the on-chain museum housing it all
├── Signal / Seal       ← proper nouns of individual artifacts
└── (Chronicle, Era, Genesis as proper nouns only)
```

**Rule of three:** any visitor surface (nav, hero, CTA, card title, breadcrumb, OG title) may use **at most two** Public-layer words and zero Lore words. Lore words are earned by scrolling.

### Term-collision risks to retire (live UI only, not docs)

- "Protocol Artifact" + "Artifact" + "NFT Artifact" → standardize on **Artifact** in secondary copy.
- "Archive Universe" / "Archive Gallery" → **NFT Collection** in nav and section titles; "Archive" stays as the lore frame.
- "Relic" in EarlyChapters live copy → drop; keep only inside docs and chapter mythology pages.

---

## B. NFT Collection Architecture Audit

### On-chain truth (per `ARCHIVE_9_SLOT_READINESS_AUDIT.md`)

| ID | Name (on-chain) | System | Mint model | V1 state |
|---|---|---|---|---|
| 1 | The First Signal | **A — Public collectible** | Open USDC, capped | LIVE · 0.50 USDC |
| 2 | (reserved pointer) | **C — Identity** | None (future ERC-721) | RESERVED / DISABLED |
| 3 | Patron Seal | **A — Public collectible** | Open USDC, flat | CONFIGURED · 5 USDC · NOT ACTIVE |
| 4 | Heart Signal | **B — Protocol memory** | Discovery / admin | ownerOnly |
| 5 | Genesis Sealed | **B — Protocol memory** | Admin-mint at milestone | ownerOnly |
| 6 | First Liquidity Event | **B — Protocol memory** | Admin-mint to LPs | ownerOnly |
| 7 | First Routing Signal | **B — Protocol memory** | Admin-mint at routing tx | ownerOnly |
| 8 | Legacy Era I | **B — Protocol memory** | Admin-mint post-seal | ownerOnly + LOCKED |
| 9 | — | **B (proposed)** | TBD | Not configured |

### Verdict

You were right: three systems are accidentally merged.

- **Today's `/nft` treats all 8 cards as peers.** This is the bug.
- Mixing a **public mint** (ID 1) with an **identity pointer** (ID 2) and **ownerOnly memory** (4–8) in one undifferentiated grid implies a visitor could mint them. That is false and damages trust the moment they try.

### Recommended architecture (no on-chain change)

One contract, **two presented collections, one identity slot**:

```text
THE SYNDICATE NFT COLLECTION (one Archive1155 contract on Avalanche)
│
├── COLLECTIBLES — public, mintable, story-forward
│   ├── #1  The First Signal      (Chapter I · OPEN)
│   └── #3  Patron Seal           (Support · READY, not active)
│
├── PROTOCOL MEMORY — earned / sealed by on-chain events, ownerOnly
│   ├── #4  Heart Signal          (discovery)
│   ├── #5  Genesis Sealed        (genesis-seal milestone)
│   ├── #6  First Liquidity Event (first LP)
│   ├── #7  First Routing Signal  (first 70/20/10 routing tx)
│   ├── #8  Legacy Era I          (era closure)
│   └── #9  (Protocol Chronicle — see §F)
│
└── IDENTITY (separate contract, future)
    └── #2 slot → SeatRecord721    (RESERVED — never minted from Archive1155)
```

This is purely a **presentation grouping**. No on-chain metadata changes. The contract still has IDs 1–8 (and ID 9 when configured). The site simply stops pretending they belong on one shelf.

---

## C. NFT Page Hierarchy Audit (`/nft`)

### First-time visitor diagnosis

What they understand in the first 5 seconds: "There is an NFT called The First Signal." ✅
What is confusing within 15 seconds:
- 9 equally-weighted cards imply 9 things to buy.
- Status pills (LIVE / LOCKED / RESERVED / ROADMAP) compete with the hero for attention.
- ID 2's "Reserved Seat Record" reads like a missing product, not a deliberate identity decision.
- "Archive" appears as both the page chrome (museum) and the section title (gallery) — two meanings, one word.

### Visual weight verdict

**No — the 9 cards must NOT be visual peers.** Current layout flattens a single mintable product into a catalog. Recommended weighting:

```text
HERO (≈55% of above-the-fold)        → ID 1 The First Signal — mint + anatomy
SECONDARY (≈20%)                      → ID 3 Patron Seal — "Next public artifact"
EXPLAINER (≈15%)                      → How the Archive works (kept)
PROTOCOL MEMORY ROW (≈10%)            → IDs 4–8 as a single horizontal "earned" shelf
IDENTITY CALLOUT (slim band)          → ID 2 → SeatRecord721 explainer (not a card)
FUTURE SLOT (footer of grid)          → ID 9 (Chronicle) — single dimmed placeholder
```

Implementation hint for the future code pass (not now): split `ArchiveGalleryPreview` into `CollectiblesShowcase` + `ProtocolMemoryShelf` + `IdentityBand`. Cards in the memory shelf should be visually quieter (no price, no mint CTA, a single "Sealed when…" line).

### Page narrative spine (recommendation)

1. **Hero — The First Signal** (mint here, no scroll required)
2. **Anatomy** (on-chain SVG callouts — already strong)
3. **The Collection** (Collectibles row of 2 · Memory shelf of 5 · Identity band)
4. **How the Archive Works** (lore opens here — first use of "Archive" as long-form)
5. **Genesis Record** (#000001 already lives in showcase)
6. **Live proof + Contract** (verifiability)
7. **Final CTA**

---

## D. Navigation Audit — NFT vs Archive

### Visitor model

A normal crypto-literate visitor recognizes "NFT" instantly. "Archive" is a category they have to be taught. Teaching a category word in primary nav is a tax. We are paying it on every page load.

Header today: `Join · Activity · Vault · Archive · Verify` — with "Archive" pointing at `/nft`. The label-route mismatch (label says one thing, URL says another) is itself a small trust issue and an SEO miss.

### Recommendation — **Option A (modified)**

```text
Primary nav:  Join · Activity · Vault · NFT · Verify
                                        └── /nft (label and URL agree)

Inside /nft:
  • Hero = The First Signal (public language)
  • Section eyebrow = "The Collection"
  • Lore section heading = "Inside the Archive" (first appearance of the word)

Inside /archive (kept):
  • Becomes the long-form museum + indexer health + roadmap page
  • Linked from /nft footer as "Read the Archive in depth →"
  • Not in primary nav
```

**Why not Option B ("NFT Collection" as label):** two words in a nav slot, weaker tap target on mobile, and "Collection" alone fails as a destination word out of context.
**Why not Option C (keep Archive):** it forces every visitor to learn a Syndicate-specific frame before they can find the mint.

**Side benefit:** `/archive` keeps its SEO authority, internal links, and lore depth. We just stop making it the front door.

---

## E. Patron Seal (ID 3) Readiness

| Dimension | State | Verdict |
|---|---|---|
| On-chain config | Exists · 5.00 USDC · maxSupply 10k (per audit) · walletLimit 5 · not active | ✅ |
| Renderer | Spec says `ONCHAIN_SVG`; **no Patron Seal SVG template shipped** in `archive-nft-*` | ❌ blocker |
| Metadata | Template defined in `NFT_ARCHIVE_TOKEN_CATALOG_V1.md`; needs the same on-chain composer ID 1 uses | ❌ blocker (depends on renderer) |
| Supply logic | 10k flat · no tiers · no rank — matches Core Asset gate | ✅ |
| Pricing | 5 USDC flat, single amount, no Bronze/Silver/Gold | ✅ |
| Story fit | "Support without claim" — clean, complementary to Signal, doesn't compete with seat | ✅ |
| Correct second NFT? | **Yes — confirmed.** Genesis Sealed (#5) reads as exclusive and would split the public path. Patron Seal is the right open-to-all #2. | ✅ |
| Doctrine check | No yield, no rank, no tier, no governance, no access | ✅ |
| UI readiness | No mint flow, no anatomy, no hero treatment built | ❌ blocker |
| Copy readiness | Description exists; no FAQ entry, no "what it is / is not" panel | ⚠ |

**Verdict: NOT READY TO ACTIVATE.** Blocked by: on-chain SVG template + mint flow UI + anatomy treatment. Story and economics are green. Recommended next pass after this doctrine is approved.

---

## F. ID 9 — Protocol Chronicle concept

Four candidate shapes, ranked:

1. **Annual Chronicle (recommended) — recurring ownerOnly series, one mint per chapter year.**
   - **What:** A single Artifact minted to every wallet that participated in protocol-sealing events that year (member milestone reached, LP event, routing event, era seal). One Chronicle per year, content composed on-chain from that year's sealed events.
   - **Why strongest:** Composes with all five pillars — transparency (provable participation), identity (it remembers *you*), memory (year as unit), momentum (annual cadence visitors can anticipate), shareability ("I have Chronicle 2026"). Reuses existing sealing rails. Passes Mythology gate: name earned, not authored; sealing rule = end-of-year on-chain snapshot.
   - **System fit:** B — Protocol Memory.

2. **Single permanent "First Era Chronicle"** — beautiful but one-shot; no compounding.
3. **Public collectible Chronicle** — breaks the Collectibles/Memory split we just created.
4. **Quarterly Chronicle** — too frequent, dilutes scarcity of being "in the record".

**Recommended doctrine for ID 9:**
- Category: Protocol Memory (System B).
- Visual family: Legacy Artifact.
- Mint model: ownerOnly, admin-mint at year-seal block to a deterministic set computed from on-chain events.
- Public language: "Protocol Chronicle".
- Sealing rule: end of chapter year + presence in ≥1 sealed event that year.
- Status until first seal: visible as **a single dimmed slot** at the end of the Memory shelf — "Chronicle · sealing at first year-end".

**Constitutional gate compliance:** ✅ Infinite Narrative (FAR-as-sealed), ✅ Core Asset (reinforces co-witness accretion), ✅ Mythology (name earned via sealing rule).

---

## G. Contradictions on the live site

### On-chain truth ↔ storytelling

- Story implies "9 NFTs in the collection". Truth: ID 2 is **not** an Archive1155 NFT and IDs 4–8 are **not** publicly mintable.
- "Archive" used as both museum (lore) and collection (catalog) — single word, two meanings.
- IDs 4–8 already have on-chain names that the site sometimes paraphrases — paraphrasing breaks verifiability. Live UI must use the exact `getArtifactText` strings or quote them explicitly.

### On-chain truth ↔ UI

- `ArchiveGalleryPreview` renders ownerOnly items beside the public mint with similar weight and similar pricing affordances.
- ID 2 currently appears as a card with "Reserved" status — reads as "coming soon product", not "different contract entirely". Should be a **band**, not a **card**.
- Patron Seal (#3) shows as configured but the page provides no mint affordance, anatomy, or copy — visitor sees a configured product they cannot reach.
- Status pill vocabulary (LIVE / LOCKED / RESERVED / ROADMAP / PENDING) is rich but inconsistent in placement.

---

## H. Recommended final NFT doctrine (before any SeatRecord721 work)

1. **One NFT contract. Two presented collections. One separate identity NFT.**
   - Collectibles: IDs 1, 3.
   - Protocol Memory: IDs 4–9.
   - Identity (separate ERC-721): the seat — ID 2 in Archive1155 stays a reserved disabled pointer forever.

2. **Public vocabulary is 4 words: NFT · Collection · Chapter · Member.** Everything else is earned by scrolling.

3. **Primary nav says NFT, points to `/nft`.** `/archive` becomes the long-form museum, linked from inside `/nft`. Header label and URL agree.

4. **`/nft` is one product page, not a catalog.** Hero = The First Signal mint. Secondary = Patron Seal. Memory shelf = IDs 4–9 visually quieter, no price/CTA, "sealed when…" lines. Identity band = ID 2 → SeatRecord721 explainer.

5. **Patron Seal activation is blocked on three artifacts** (SVG template, mint flow, anatomy). Story/economics green. Activate it as the second public mint after those three ship — not before.

6. **ID 9 = Protocol Chronicle, annual ownerOnly series.** Sealed at year-end from on-chain events. Visible as a single dimmed end-of-shelf slot until first sealing.

7. **No on-chain rename. Ever.** The on-chain `getArtifactText` strings for IDs 4–8 are the source of truth. Site UI quotes them; site UI does not rewrite them.

8. **No new vocabulary introduced.** "Relic" and "Chronicle" stay out of public language. Lore words live only in long-form sections.

9. **SeatRecord721 design begins only after doctrine 1–8 are approved and reflected in copy/architecture (no code yet required for approval).**

---

## Decision Lens Verdicts

| # | Lens | Verdict | Note |
|---|---|---|---|
| 1 | Founder | ✓ | Restores "less is more"; protects seat-as-product DNA. |
| 2 | Investor | ✓ | Removes appearance of a 9-product roadmap; clarifies what is actually for sale. |
| 3 | Growth | ✓ | `/nft` as front door + label-URL agreement is an SEO and CTR win. |
| 4 | Behavioral | ✓ | Reduces choice paralysis on `/nft`; Memory shelf creates anticipation without urgency. |
| 5 | UX | ✓ | Three layers (public/secondary/lore) collapse 12 terms to 4 frontline words. |
| 6 | Product | ✓ | Splits Collectibles vs Memory vs Identity cleanly without on-chain change. |
| 7 | Staff Eng | ✓ | Zero contract risk: presentation grouping only. Patron Seal blockers explicit. |
| 8 | QA | ✓ | On-chain names preserved verbatim; status pill semantics clarified. |
| 9 | A11y | ✓ | Fewer competing CTAs; clearer landmark hierarchy on `/nft`. |
| 10 | SEO | ✓ | `/nft` becomes canonical nav target; `/archive` keeps lore authority without front-door tax. |

**Result: 10 ✓ / 0 ⚠ / 0 ✗ — APPROVED for founder review. No code, no contract, no activation performed.**
