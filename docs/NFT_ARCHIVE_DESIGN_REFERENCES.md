# NFT Archive — Design References

**Status:** REFERENCE ONLY · NOT FINAL ART · NOT DEPLOYED
**Doctrine:** SYN is the seat. NFT Artifacts are the memory.

This document preserves the intent behind three generated reference
images provided by the founder (Kemal). They are **visual direction
references**, not legal claims, not product promises, and not deployed
NFT assets.

Stored at:

- `docs/design/nft-archive-ecosystem-reference.png` — full ecosystem overview
- `docs/design/nft-archive-artifact-anatomy-reference.png` — single-card anatomy + mixed examples
- `docs/design/nft-archive-onchain-engine-reference.png` — on-chain SVG engine + metadata JSON

---

## 1. Why these images exist

Before Solidity is written, the project needs a shared visual vocabulary
that legacy deployment platform, ChatGPT, future AIs, future developers, and future
designers can all align on. Text alone has repeatedly drifted into
either "PFP collection" framing or "boring certificate" framing —
neither correct.

The images establish:

- The Archive is **one engine, multiple artifact families**.
- Certificates, seals, and artifact cards stay clean and premium.
- Secret artifacts and pixel collectibles may use neon / pixel palettes.
- Every artifact carries the same seven anatomical fields.
- The system is **on-chain generated**, not 10k uploaded images.
- "SYN is the seat. NFT Artifacts are the memory."

---

## 2. What to learn from the artifact-anatomy reference

`docs/design/nft-archive-artifact-anatomy-reference.png`

- Left panel: a single Chapter Artifact card with seven numbered
  callouts — artifact name, chapter info, unique icon, category badge,
  serial number, protocol info, ownership wallet. **This is the
  anatomy contract** for every artifact, regardless of visual family.
- Right panel: mixed examples — Patron Seal (SVG seal), Genesis Sealed
  (SVG ceremonial seal), Heart Signal (pixel secret), Liquidity Event
  (pixel mark). Same anatomy, different visual families.

What to copy:

- The seven-field anatomy.
- The clean black + gold base for certificates / seals / cards.
- The neon palette + pixel framing for secret / pixel artifacts.
- Footer block: protocol mark + chain + "collectible record only".

What **not** to copy blindly:

- The exact glyph drawings (final art is TBD).
- The specific frame ornament (final art is TBD).
- The wallet addresses, serials, and dates (placeholder only).

---

## 3. What to learn from the on-chain engine reference

`docs/design/nft-archive-onchain-engine-reference.png`

- Left: the on-chain SVG engine — fields 1–7 map to slots in a template
  composed at `tokenURI()` time. The SVG is generated on-chain from
  the stored data; only data is persisted, not the rendered image.
- Middle: a sample metadata JSON in the canonical shape (see
  `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md` §7).
- Right: the four-step "how it works" (templates + rules → mint composes
  image with dynamic data → metadata returned on-chain → marketplaces
  render it like any standard NFT).

What to copy:

- The data-URI-image approach (no external hosting).
- The attribute set: Category, Chapter, Serial, Chain, Protocol.
- The "templates + rules stored, image generated" mental model.

What **not** to copy blindly:

- The exact JSON keys are reference; final keys are pinned in
  `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`.

---

## 4. What to learn from the ecosystem reference

`docs/design/nft-archive-ecosystem-reference.png`

- Top: four artifact families shown side-by-side — Seat Record
  (soulbound, future), Patron Seal (supporter badge), The First Signal
  (chapter artifact), Heart Signal (secret artifact).
- Right column: the six visual families enumerated and the four-step
  "how it works" (1 contract → template engine → unique output →
  verifiable forever).
- Bottom: principles — no 10k images uploaded, you pay once for
  deployment gas, users pay mint gas + USDC price, forever verifiable
  on Avalanche, mixed art styles powered by one engine. Closing line:
  **"SYN is the seat. NFT Artifacts are the memory."**

What to copy:

- Use this composition as the inspiration for future `/archive` and
  whitepaper visual explanation blocks.
- Reuse the six-families framing in FAQ + docs.

What **not** to copy blindly:

- The "Same Engine — Different Categories" panel is direction, not a
  final UI block.
- Reference launch prices and counts in any future render of this
  image must come from `src/lib/archive-config.ts` truth states.

---

## 5. How these references should influence work

| Surface                       | Influence                                                              |
| ----------------------------- | ---------------------------------------------------------------------- |
| Future `/archive` page blocks | Visual explanation block in the style of the ecosystem reference       |
| Whitepaper Archive section    | Use anatomy diagram + on-chain engine diagram                          |
| FAQ                           | "What is an Archive artifact?" answer can mirror the six-families grid |
| Docs                          | Embed these images directly as reference figures                       |
| Future smart-contract metadata| Match the canonical JSON shape in the engine reference                 |
| Future NFT art                | Match the visual-family palette + the seven-field anatomy              |

---

## 6. Constraints (constitutional)

- These images are **references**, not deployed NFT art.
- Do not embed them on production marketing surfaces (`/`, `/join`,
  `/membership`, `/tokenomics`) without explicit founder approval.
- Do not imply any artifact in the references is mintable today.
- Do not use the wallet addresses, serials, prices, or dates shown in
  the references as real values.
- If reused in docs/FAQ/whitepaper, the surrounding copy must keep the
  four verifiability labels (LIVE / DERIVED / PENDING NFT CONTRACT /
  ROADMAP) and the "collectible record only" disclaimer.
