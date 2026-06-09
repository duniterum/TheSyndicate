> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# NFT Archive — Visual System V1

**Status:** FROZEN VISUAL DOCTRINE · NO CODE · NO DEPLOYMENT
**Doctrine:** SYN is the seat. NFT Artifacts are the memory.
**Audience:** Lovable, ChatGPT, Kemal, future AIs, future Solidity author, future designers.

This document freezes the visual philosophy of the NFT Archive **before**
Solidity is written. It is paired with:

- `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`
- `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md`
- `docs/NFT_ARCHIVE_DESIGN_REFERENCES.md`
- `docs/SMART_CONTRACT_DECISIONS_PENDING.md`
- `docs/NFT_ARCHIVE_SMART_CONTRACT_ARCHITECTURE_V1.md`
- `docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md`
- `docs/ARCHIVE_ENGINE_V1.md`

---

## 1. Core doctrine

> **SYN is the seat. NFT Artifacts are the memory.**

The seat is the scarce asset. Artifacts are non-scarce memory records
around the seat: certificates of membership, ceremonial seals, chapter
artifacts, milestone records, liquidity records, secret discoveries, and
era/legacy time capsules.

The Archive is **a verifiable protocol memory layer, not a PFP
collection, not a trait-rarity lottery, not a speculation product.**

---

## 2. Visual families (six)

The Archive supports six visual families. One engine, multiple looks.

| Family             | Purpose                                  | Render style                        | Example artifacts                          |
| ------------------ | ---------------------------------------- | ----------------------------------- | ------------------------------------------ |
| Certificate        | Identity / membership record             | On-chain SVG, ornate gold frame     | Seat Record (future)                       |
| Seal               | Support, legacy, ceremonial mark         | On-chain SVG wax-seal motif         | Patron Seal, Genesis Sealed                |
| Artifact Card      | Named chapter / protocol event           | On-chain SVG, central icon scene    | The First Signal, First Routing Signal     |
| Secret Artifact    | Hidden discovery                         | Pixel-style SVG, neon palette       | Heart Signal                               |
| Pixel Collectible  | On-chain pixel engine output             | Pixel-style SVG                     | optional cohort/event pixel artifacts      |
| Legacy Artifact    | Era closure / time capsule               | On-chain SVG, archival ornament     | Legacy Era I                               |

**Mixed by design.** Not every artifact uses the same look. Certificates
and seals MUST stay clean and premium (black + gold). Secret artifacts and
pixel collectibles MAY use neon/pixel palettes. Do not force one style.

---

## 3. Artifact → visual family mapping (V1 catalog)

| Artifact                | Visual family                       |
| ----------------------- | ----------------------------------- |
| Seat Record             | Certificate (future identity record)|
| Patron Seal             | Seal                                |
| The First Signal        | Artifact Card                       |
| Heart Signal            | Secret Artifact (pixel)             |
| Genesis Sealed          | Seal (ceremonial)                   |
| First Liquidity Event   | Artifact Card / Pixel (event)       |
| First Routing Signal    | Artifact Card (milestone)           |
| Legacy Era I            | Legacy Artifact                     |

See `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md` for token IDs, status, mint
model, and data sources.

---

## 4. Artifact anatomy (the seven fields)

Every artifact card — regardless of family — must surface the same seven
anatomical fields. This is the contract the on-chain renderer and the
metadata schema both fulfill. See
`docs/design/nft-archive-artifact-anatomy-reference.png`.

| # | Field             | Source       | Notes                                                  |
| - | ----------------- | ------------ | ------------------------------------------------------ |
| 1 | Artifact name     | static (id)  | e.g. "The First Signal"                                |
| 2 | Chapter info      | dynamic      | e.g. "Chapter I · The Beginning"                       |
| 3 | Unique icon       | template     | per-id SVG glyph (Signal Tower, Wax Seal, Heart, etc.) |
| 4 | Category badge    | static (id)  | "Chapter Artifact", "Patron Seal", "Secret", etc.      |
| 5 | Serial number     | dynamic      | auto-increment, zero-padded `#000142`                  |
| 6 | Protocol info     | static       | "The Syndicate · Avalanche C-Chain"                    |
| 7 | Ownership wallet  | dynamic      | short form `0x3A7F…9C2B`                               |

### Dynamic fields (computed at mint or per token)

`serial`, `tokenId`, `mintDate`, `wallet`, `chapter`, `category`,
`eventType`, `protocolSource`, `chain`.

### Static fields (constant across the contract)

`The Syndicate`, `Avalanche C-Chain`, `collectible record only`,
`no financial rights`, protocol mark/seal, category name.

---

## 5. Mixed art direction — what is allowed and what is forbidden

**Renderer doctrine (B1 LOCKED):** V1 default is `ONCHAIN_SVG`.
`EXTERNAL_URI` is a reserved future fallback for complex art only and
is not used by any V1 token id. `NONE / LOCKED` is the explicit
pre-activation state.

**Allowed.**

- On-chain generated SVG certificates / seals / cards (default for V1).
- On-chain pixel-style SVG for secret + pixel artifacts.
- Future external rich media via `EXTERNAL_URI` **only** if a justified
  case appears and is approved per
  `docs/SMART_CONTRACT_DECISIONS_PENDING.md`. Not in V1.

**Forbidden.**

- IPFS / Arweave / `https://` as the default V1 metadata path.
- Random rarity gambling (no hidden RNG traits implying value).
- PFP-style "10k uploaded images" approach.
- Wealth-coded tiers (Bronze/Silver/Gold supporter ladders, etc.).
- Mutable visual meaning after Artifact Definition is frozen.
- Decoration without verifiable on-chain meaning.
- Off-chain-only renderers as the source of truth.

---

## 6. Visual identity rules

- **Palette:** black + gold for certificates / seals / artifact cards.
  Neon (magenta, electric blue) reserved for secret/pixel artifacts.
- **Typography:** uppercase serif/display for artifact name + category;
  monospace numerics for serial, wallet, dates.
- **Frames:** ornamental gold border for certificate/seal/artifact;
  pixel-frame for secret/pixel.
- **Footer block:** always shows protocol mark + "AVALANCHE C-CHAIN" +
  "COLLECTIBLE RECORD ONLY" disclaimer.
- **No PFP cropping.** No avatar grids. No tier badges.

---

## 7. Design reference images

The following images are **visual direction references** stored in
`docs/design/`. They are not final art and must not be used as deployed
NFT assets.

| Image | Path | Use |
| --- | --- | --- |
| Artifact anatomy (single card + mixed examples) | `docs/design/nft-archive-artifact-anatomy-reference.png` | Reference for the seven-field anatomy and the certificate/seal/secret/pixel split |
| On-chain SVG engine + metadata example | `docs/design/nft-archive-onchain-engine-reference.png` | Reference for the renderer / metadata JSON shape |
| Full ecosystem overview (families + how it works) | `docs/design/nft-archive-ecosystem-reference.png` | Reference for docs/FAQ/whitepaper and future `/archive` explanation blocks |

See `docs/NFT_ARCHIVE_DESIGN_REFERENCES.md` for the full directive on
how to use (and not over-use) these images.

---

## 8. What this document does NOT do

- Does not declare any additional artifact mintable beyond the live ID 1
  state recorded in `docs/DEPLOYMENT_STATE_V1.md`.
- Does not invent contract addresses, prices, or counts.
- Does not change `/archive`, `/my-syndicate`, FAQ, whitepaper copy.
- Does not authorize Solidity. See
  `docs/SMART_CONTRACT_DECISIONS_PENDING.md`.

---

## 9. Instructions for future AI sessions

- Do not treat the NFT Archive as a PFP collection.
- Do not invent live NFT claims, mint counts, or contract addresses.
- Do not activate Seat Record before eligibility is enforceable.
- Do not use wealth-coded status or tier ladders.
- Do not imply Vault ownership or financial rights.
- Do not change Artifact Definition meaning after freeze.
- Do not propose `ar://` / `ipfs://` / `https://` as the V1 default
  `image` path — B1 is closed: V1 default is `ONCHAIN_SVG`.
- Do not skip the four verifiability labels (LIVE / DERIVED / PENDING NFT CONTRACT / ROADMAP).
- Do not add new Solidity scope or activate additional artifacts without the
  deployment/state gates in `docs/DEPLOYMENT_STATE_V1.md`.

---

## Final Seat Record Architecture Decision (✅ LOCKED 2026-06-06)

Seat Records are **NOT** active ERC-1155 artifacts in `SyndicateArchive1155` V1.
They will ship later in a **separate ERC-721 contract**
(working name `SyndicateSeatRecord721` / `SyndicateSeatRegistry721`)
once membership eligibility is enforceable on-chain.

Token ID 2 in `SyndicateArchive1155` is a **reserved + disabled pointer**:
`active = false`, `ownerOnly = true`, `rendererMode = NONE`,
`maxSupply = 0` (LOCKED / NOT MINTABLE), `walletLimit = 1`,
`priceUsdc = 0`. All mint paths revert; `uri(2)` reverts.

Contract-wide V1 rule: **`maxSupply == 0` means LOCKED / NOT MINTABLE**.
It does **NOT** mean unlimited. No V1 artifact is unlimited.

Allowed wording: *"Seat Records are reserved for a future ERC-721
identity contract."* / *"Archive1155 V1 records collectible protocol
artifacts."* / *"ID 2 is reserved and disabled in V1."* /
*"SYN is the seat. Artifacts are the memory."*

Canonical decision doc: `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`.

---

## Preview artwork (Archive Experience Preview)

`src/components/syndicate/ArtifactPreviewArtwork.tsx` renders small SVG
previews per visual family (Artifact Card, Seal, Pixel-Secret, Certificate,
Legacy) using each catalog entry's `primaryColor` / `accentColor`. These
previews are intentionally simple and are always stamped
**"PREVIEW · NOT CONTRACT-RENDERED"** in the bottom-left of the artwork.

They are inspired by the stored reference images
(`nft-archive-artifact-anatomy-reference.png`,
`nft-archive-onchain-engine-reference.png`,
`nft-archive-ecosystem-reference.png`) but must never be presented as the
final on-chain renderer output. Final SVGs come from the deployed
`uri(id)` once the contract's renderer is wired and a drop is activated.

---

## First Signal Mint — Production Verdict

**READY FOR FOUNDER SITE MINT.** Archive1155 deployed, ID 1 frozen +
active, public mint open at 0.50 USDC native Avalanche USDC, wallet
limit 5. ID 2 reserved/disabled, ID 3 configured/not active, all other
IDs roadmap. Only ID 1 has mint UI. `npm run check-nft-qa` passes
against the published site. Live on-chain reads are the source of truth
for dynamic state; static config remains as the safe fallback for names,
descriptions, and visual families. See
`docs/CONTRACT_INTEGRATION_STATUS.md §9` for the full state matrix.
