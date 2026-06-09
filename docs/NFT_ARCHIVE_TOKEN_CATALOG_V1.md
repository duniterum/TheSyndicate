> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# NFT Archive — Token Catalog V1

**Status:** FROZEN CATALOG · ARCHIVE1155 DEPLOYED · ID 1 PUBLIC MINT LIVE
**Doctrine:** SYN is the seat. NFT Artifacts are the memory.
**Renderer doctrine (B1 LOCKED):** V1 default is `ONCHAIN_SVG`.
`EXTERNAL_URI` is reserved future fallback only. `NONE / LOCKED` is the
explicit pre-activation state.

Companion docs:
- `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md`
- `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`
- `docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md`
- `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md`
- `docs/SMART_CONTRACT_DECISIONS_PENDING.md`

---

## 1. Catalog at a glance

| Id | Artifact                | Category               | Visual family    | Renderer mode (deploy)   | V1 status               | Mint model             |
| -- | ----------------------- | ---------------------- | ---------------- | ------------------------ | ----------------------- | ---------------------- |
| 1  | The First Signal        | Chapter Artifact       | Artifact Card    | `ONCHAIN_SVG`            | **Public mint live**    | Open, USDC, capped     |
| 2  | Seat Record (reserved pointer) | Identity Certificate (future ERC-721) | Certificate | `NONE` (LOCKED)          | **Reserved + disabled in V1** | Future separate ERC-721 |
| 3  | Patron Seal             | Patron Seal            | Seal             | `ONCHAIN_SVG`            | Public mint (planned)   | Open, USDC, flat       |
| 4  | Heart Signal            | Secret Artifact        | Pixel (secret)   | `ONCHAIN_SVG` or `NONE`  | Discovery-only          | Owner-mint or proof    |
| 5  | Genesis Sealed          | Genesis Founder Mark   | Seal (ceremonial)| `ONCHAIN_SVG` or `NONE`  | Owner-mint at milestone | Admin-mint to wallets  |
| 6  | First Liquidity Event   | Liquidity Mark         | Artifact Card    | `ONCHAIN_SVG` or `NONE`  | Owner-mint at trigger   | Admin-mint to LPs      |
| 7  | First Routing Signal    | Protocol Milestone     | Artifact Card    | `ONCHAIN_SVG` or `NONE`  | Owner-mint at trigger   | Admin-mint             |
| 8  | Legacy Era I            | Legacy Artifact        | Legacy Artifact  | `NONE` (LOCKED)          | Post-chapter-seal only  | Admin-mint             |

All ids live under one ERC-1155 contract. Per-id Artifact Definition
(name, category, description, visual family, chapter, palette, icon /
template id, supply, walletLimit, priceUsdc, active, ownerOnly,
rendererMode, definitionFrozen) is set via `configureArtifact(id, def)`
— see `NFT_ARCHIVE_SOLIDITY_SPEC_V1.md`.

---

## 2. Per-id detail

### Id 1 — The First Signal

- **Category:** Chapter Artifact (Chapter I — The Beginning)
- **Visual family:** Artifact Card (on-chain SVG; central Signal Tower glyph)
- **Renderer mode:** `ONCHAIN_SVG`
- **V1 status:** LIVE ON AVALANCHE · public mint open
- **Live price:** `$0.50` USDC (`500_000` raw)
- **Live `maxSupply`:** `10_000`
- **Live `walletLimit`:** `5`
- **Expected data source:** `ArtifactMinted` events
- **Notes:** Contract is deployed at
  `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` on Avalanche C-Chain.
  The only public write path is `mint(1, 1)` after native Avalanche USDC
  approval to the Archive1155 contract.

### Id 2 — Seat Record (reserved pointer, NOT minted in V1)

- **Category:** Identity Certificate / Membership record — a future
  **separate ERC-721 contract** (working name
  `SyndicateSeatRecord721` / `SyndicateSeatRegistry721`).
- **Visual family:** Certificate (rendered by the future ERC-721, not
  by `SyndicateArchive1155`).
- **Renderer mode (in Archive1155):** `NONE` (LOCKED). `uri(2)` reverts.
- **V1 status:** **Reserved + disabled.** Token ID 2 exists in the
  Archive1155 catalog purely as a stable pointer to the future
  ERC-721. It is never publicly mintable and never admin-mintable
  while `maxSupply == 0`.
- **Mint model:** None in V1. Future Seat Records mint from a
  separate ERC-721 contract once membership eligibility (member
  number, original wallet, first purchase tx, first purchase block,
  chapter joined, timestamp, optional linked-wallet rules) is
  enforceable on-chain.
- **V1 contract behaviour for ID 2:** `active = false`,
  `ownerOnly = true`, `rendererMode = NONE`, `maxSupply = 0`,
  `walletLimit = 1`, `priceUsdc = 0`, `definitionFrozen = false`.
  `mint(2)` reverts. `adminMint(_, 2, _)` reverts
  (`ExceedsMaxSupply` because `maxSupply == 0`).
  `setDropActive(2, true)` reverts.
- **Notes:** **Do not pretend Seat Record is live.** No claim flows.
  See `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md` for the binding
  decision. **`maxSupply == 0` means LOCKED / NOT MINTABLE in V1 —
  it never means unlimited.**

### Id 3 — Patron Seal

- **Category:** Support Seal
- **Visual family:** Seal (on-chain SVG wax-seal)
- **Renderer mode:** `ONCHAIN_SVG`
- **V1 status:** CONFIGURED · NOT ACTIVE on Archive1155
- **Target price:** `$5.00` USDC (`5_000_000` raw)
- **Proposed `maxSupply`:** `10_000`
- **Proposed `walletLimit`:** `5`
- **Notes:** Single flat amount per Core Asset gate. **No
  Bronze/Silver/Gold tiers. No rank. No wealth-coded status.**

### Id 4 — Heart Signal

- **Category:** Secret Artifact (hidden discovery)
- **Visual family:** Pixel (secret, neon palette)
- **Renderer mode:** `ONCHAIN_SVG` (when template ready) or `NONE` at deploy
- **V1 status:** PENDING NFT CONTRACT · discovery flow gated
- **Mint model:** Discovery proof or admin-mint to verified discoverers
- **Notes:** Never advertised. Never countdown-promoted. Discovery is the event.

### Id 5 — Genesis Sealed

- **Category:** Protocol Milestone (ceremonial)
- **Visual family:** Seal (ceremonial, laureled column glyph)
- **Renderer mode:** `ONCHAIN_SVG` (when template ready) or `NONE` at deploy
- **V1 status:** ROADMAP (named trigger)
- **Mint model:** Admin-mint to qualifying wallets at the genesis-seal milestone

### Id 6 — First Liquidity Event

- **Category:** Liquidity Mark (witness)
- **Visual family:** Artifact Card
- **Renderer mode:** `ONCHAIN_SVG` (when template ready) or `NONE` at deploy
- **V1 status:** ROADMAP
- **Mint model:** Admin-mint to JLP holders snapshotted at trigger block

### Id 7 — First Routing Signal

- **Category:** Protocol Milestone (named trigger)
- **Visual family:** Artifact Card
- **Renderer mode:** `ONCHAIN_SVG` (when template ready) or `NONE` at deploy
- **V1 status:** ROADMAP
- **Mint model:** Admin-mint at first USDC 70/20/10 routing tx

### Id 8 — Legacy Era I

- **Category:** Legacy Artifact (era closure / time capsule)
- **Visual family:** Legacy Artifact (archival ornament)
- **Renderer mode:** `NONE` (LOCKED)
- **V1 status:** ROADMAP (post-chapter-seal only)
- **Mint model:** Admin-mint after the chapter has sealed on-chain

---

## 3. Canonical metadata examples (decoded preview — `uri(id)` returns the base64 form)

These show what the on-chain renderer composes for each id once active.
For LOCKED ids, `uri(id)` reverts `URINotReady(id)` until the renderer
mode is upgraded to `ONCHAIN_SVG` and the Artifact Definition is frozen.

> **No `ar://`. No `ipfs://`. No `https://` `image` field.** The
> `image` is a `data:image/svg+xml;base64,…` data URI for every V1 id.

### ID 1 — The First Signal

```json
{
  "name": "The First Signal #000001",
  "description": "Chapter I Artifact. Collectible record of the opening of The Syndicate. Confers no financial rights.",
  "image": "data:image/svg+xml;base64,PD94b…",
  "external_url": "https://thesyndicate.money/archive",
  "attributes": [
    { "trait_type": "Category",         "value": "Chapter Artifact" },
    { "trait_type": "Token ID",         "value": 1 },
    { "trait_type": "Chain",            "value": "Avalanche C-Chain" },
    { "trait_type": "Renderer",         "value": "ONCHAIN_SVG" },
    { "trait_type": "Status",           "value": "Active" },
    { "trait_type": "Rights",           "value": "Collectible record only" },
    { "trait_type": "Financial rights", "value": "None" },
    { "trait_type": "Visual family",    "value": "Artifact Card" },
    { "trait_type": "Chapter",          "value": "I — The Beginning" },
    { "trait_type": "Serial",           "value": "000001" }
  ]
}
```

### ID 2 — Seat Record (LOCKED in V1)

```json
{
  "_note": "uri(2) reverts URINotReady. Reserved for a future ERC-721 Seat Record contract.",
  "intended_when_live": {
    "name": "Seat Record #00001",
    "description": "Identity record of a Syndicate seat. Soulbound. Confers no financial rights.",
    "image": "data:image/svg+xml;base64,<future on-chain certificate SVG>",
    "external_url": "https://thesyndicate.money/archive",
    "attributes": [
      { "trait_type": "Category",         "value": "Identity Certificate" },
      { "trait_type": "Token ID",         "value": 2 },
      { "trait_type": "Chain",            "value": "Avalanche C-Chain" },
      { "trait_type": "Renderer",         "value": "ONCHAIN_SVG" },
      { "trait_type": "Status",           "value": "Locked (pending eligibility)" },
      { "trait_type": "Rights",           "value": "Identity record only" },
      { "trait_type": "Financial rights", "value": "None" },
      { "trait_type": "Visual family",    "value": "Certificate" }
    ]
  }
}
```

### ID 3 — Patron Seal

```json
{
  "name": "Patron Seal #000001",
  "description": "Support Seal. A flat record of patronage for The Syndicate. Confers no financial rights, no tier, no rank.",
  "image": "data:image/svg+xml;base64,PD94b…",
  "external_url": "https://thesyndicate.money/archive",
  "attributes": [
    { "trait_type": "Category",         "value": "Patron Seal" },
    { "trait_type": "Token ID",         "value": 3 },
    { "trait_type": "Chain",            "value": "Avalanche C-Chain" },
    { "trait_type": "Renderer",         "value": "ONCHAIN_SVG" },
    { "trait_type": "Status",           "value": "Active" },
    { "trait_type": "Rights",           "value": "Collectible record only" },
    { "trait_type": "Financial rights", "value": "None" },
    { "trait_type": "Visual family",    "value": "Seal" },
    { "trait_type": "Serial",           "value": "000001" }
  ]
}
```

### ID 4 — Heart Signal

```json
{
  "name": "Heart Signal #0001",
  "description": "Secret Artifact. Record of a hidden discovery. Confers no financial rights.",
  "image": "data:image/svg+xml;base64,PD94b…",
  "external_url": "https://thesyndicate.money/archive",
  "attributes": [
    { "trait_type": "Category",         "value": "Secret Artifact" },
    { "trait_type": "Token ID",         "value": 4 },
    { "trait_type": "Chain",            "value": "Avalanche C-Chain" },
    { "trait_type": "Renderer",         "value": "ONCHAIN_SVG" },
    { "trait_type": "Status",           "value": "Discovery" },
    { "trait_type": "Rights",           "value": "Collectible record only" },
    { "trait_type": "Financial rights", "value": "None" },
    { "trait_type": "Visual family",    "value": "Pixel (secret)" },
    { "trait_type": "Event",            "value": "Hidden discovery" },
    { "trait_type": "Serial",           "value": "0001" }
  ]
}
```

### ID 5 — Genesis Sealed

```json
{
  "name": "Genesis Sealed #001",
  "description": "Genesis Founder Mark. Record of a verified Genesis participant. Confers no financial rights.",
  "image": "data:image/svg+xml;base64,PD94b…",
  "external_url": "https://thesyndicate.money/archive",
  "attributes": [
    { "trait_type": "Category",         "value": "Genesis Founder Mark" },
    { "trait_type": "Token ID",         "value": 5 },
    { "trait_type": "Chain",            "value": "Avalanche C-Chain" },
    { "trait_type": "Renderer",         "value": "ONCHAIN_SVG" },
    { "trait_type": "Status",           "value": "Sealed" },
    { "trait_type": "Rights",           "value": "Collectible record only" },
    { "trait_type": "Financial rights", "value": "None" },
    { "trait_type": "Visual family",    "value": "Seal (ceremonial)" },
    { "trait_type": "Event",            "value": "Genesis seal" },
    { "trait_type": "Serial",           "value": "001" }
  ]
}
```

### ID 6 — First Liquidity Event

```json
{
  "name": "First Liquidity Event #001",
  "description": "Liquidity Mark. Witness record of the first verified Syndicate LP event. Confers no financial rights.",
  "image": "data:image/svg+xml;base64,PD94b…",
  "external_url": "https://thesyndicate.money/archive",
  "attributes": [
    { "trait_type": "Category",         "value": "Liquidity Mark" },
    { "trait_type": "Token ID",         "value": 6 },
    { "trait_type": "Chain",            "value": "Avalanche C-Chain" },
    { "trait_type": "Renderer",         "value": "ONCHAIN_SVG" },
    { "trait_type": "Status",           "value": "Sealed" },
    { "trait_type": "Rights",           "value": "Collectible record only" },
    { "trait_type": "Financial rights", "value": "None" },
    { "trait_type": "Visual family",    "value": "Artifact Card" },
    { "trait_type": "Event",            "value": "First LP creation" },
    { "trait_type": "Serial",           "value": "001" }
  ]
}
```

### ID 7 — First Routing Signal

```json
{
  "name": "First Routing Signal #001",
  "description": "Protocol Milestone. Record of the first verified 70/20/10 routing event. Confers no financial rights.",
  "image": "data:image/svg+xml;base64,PD94b…",
  "external_url": "https://thesyndicate.money/archive",
  "attributes": [
    { "trait_type": "Category",         "value": "Protocol Milestone" },
    { "trait_type": "Token ID",         "value": 7 },
    { "trait_type": "Chain",            "value": "Avalanche C-Chain" },
    { "trait_type": "Renderer",         "value": "ONCHAIN_SVG" },
    { "trait_type": "Status",           "value": "Sealed" },
    { "trait_type": "Rights",           "value": "Collectible record only" },
    { "trait_type": "Financial rights", "value": "None" },
    { "trait_type": "Visual family",    "value": "Artifact Card" },
    { "trait_type": "Event",            "value": "First routing" },
    { "trait_type": "Serial",           "value": "001" }
  ]
}
```

### ID 8 — Legacy Era I (LOCKED in V1)

```json
{
  "_note": "uri(8) reverts URINotReady. Released only after Era I is sealed on-chain.",
  "intended_when_live": {
    "name": "Legacy Era I #001",
    "description": "Legacy Artifact. Closure record of Era I of The Syndicate. Confers no financial rights.",
    "image": "data:image/svg+xml;base64,<future on-chain legacy SVG>",
    "external_url": "https://thesyndicate.money/archive",
    "attributes": [
      { "trait_type": "Category",         "value": "Legacy Artifact" },
      { "trait_type": "Token ID",         "value": 8 },
      { "trait_type": "Chain",            "value": "Avalanche C-Chain" },
      { "trait_type": "Renderer",         "value": "ONCHAIN_SVG" },
      { "trait_type": "Status",           "value": "Era sealed" },
      { "trait_type": "Rights",           "value": "Collectible record only" },
      { "trait_type": "Financial rights", "value": "None" },
      { "trait_type": "Visual family",    "value": "Legacy Artifact" },
      { "trait_type": "Era",              "value": "I" }
    ]
  }
}
```

---

## 4. Constitutional reminders

- **Seat Records are NOT active ERC-1155 artifacts in V1.** They are
  reserved for a future separate ERC-721 contract
  (`SyndicateSeatRecord721`). ID 2 in Archive1155 stays as a
  reserved + disabled pointer only. See
  `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`.
- **`maxSupply == 0` means LOCKED / NOT MINTABLE in V1.** There is no
  unlimited minting. Every V1 id that ever mints has `maxSupply > 0`.
- No artifact, ever, implies Vault ownership, yield, dividend, revenue
  share, or governance rights.
- No wealth-coded tier ladders within any single artifact.
- No `ar://`, `ipfs://`, or `https://` `image` field in V1 default
  path. Every V1 `image` is `data:image/svg+xml;base64,…`.
- Caps, prices, royalty, and license are tracked in
  `docs/SMART_CONTRACT_DECISIONS_PENDING.md` and remain OPEN until the
  founder closes them.
