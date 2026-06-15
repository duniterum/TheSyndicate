> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# NFT Archive — Solidity Specification V1

> **Deployment status (2026-06-06):** 🟢 DEPLOYED on Avalanche mainnet at
> `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d`. ID 1
> **The First Signal** is active and public mint is open at 0.50 USDC.
> See
> `docs/DEPLOYMENT_STATE_V1.md` and `docs/CONTRACT_INTEGRATION_STATUS.md`.
> This spec remains the binding source of truth; deployed bytecode must
> match it.


> **Contract name:** `SyndicateArchive1155`
> **Standard:** ERC-1155 (OpenZeppelin) + ERC-2981 (royalties) + ERC-165
> **Chain:** Avalanche C-Chain (mainnet target; Fuji for rehearsal)
> **Payment token:** USDC (6 decimals)
> **Renderer model (V1 default, B1 LOCKED):** `ONCHAIN_SVG` — on-chain
> generated JSON + on-chain generated SVG. `EXTERNAL_URI` is reserved
> as a future fallback for complex art and is **not used by any V1
> token id.** `NONE / LOCKED` is the pre-activation state.
> **License:** MIT (contract); CC-BY-NC-4.0 (metadata + media), to be
> confirmed in legal review.
>
> This document is the **function-by-function specification** for the V1
> Archive contract. It is the single source of truth Kemal + ChatGPT
> implemented against. Deployment/live status now lives in
> `docs/DEPLOYMENT_STATE_V1.md`; this file remains the architecture and
> function-behavior spec.
>
> Companion docs:
> - `docs/NFT_ARCHIVE_SMART_CONTRACT_ARCHITECTURE_V1.md` — architecture rationale
> - `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md` — renderer modes + JSON shape
> - `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md` — visual families + anatomy
> - `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md` — per-id catalog
> - `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md` — per-claim truth state
> - `docs/SMART_CONTRACTS_DEFERRED.md` — what is intentionally NOT in V1
> - `docs/STEP_BY_STEP_FROM_HERE.md` — phase sequencing
> - `src/lib/archive-truth-states.ts` — frontend truth-state bindings
> - `src/lib/archive-indexer.ts` — indexer interface the contract must satisfy

---

## 0. Design invariants (binding)

1. **Single contract.** One immutable ERC-1155 contract holds every
   Artifact token ID. No proxies. No upgradeability. No factory.
2. **Token IDs are stable forever.** Once an id is configured and
   activated, its meaning, category, and renderer mode never change.
3. **Artifact Definition immutability after activation.** Public mint
   activation requires `freezeArtifactDefinition(id)`. A frozen
   definition cannot change. Replaces the old `freezeURI(id)` model —
   what is frozen is the *whole* per-id definition, not just a URI.
4. **On-chain rendering by default.** Every V1 activatable token id
   uses `RendererMode.ONCHAIN_SVG`. `EXTERNAL_URI` is reserved future
   fallback and is gated by §3.10.
5. **Status is positional, never wealth-coded.** No tier, no rank, no
   yield, no dividend, no revenue share, no governance right, no
   "holder benefit" beyond holding a verifiable collectible record.
6. **Treasury is separate.** Archive proceeds route to a dedicated
   Archive treasury — never to the Membership Sale 70/20/10 wallets,
   never co-mingled with the Vault.
7. **Owner power is bounded.** Owner can configure, activate/deactivate
   inactive drops, mint reserved supply (owner-mint categories), edit
   Artifact Definitions before freeze, pause, and withdraw USDC to the
   treasury. Owner cannot mutate frozen definitions, mint beyond
   `maxSupply`, retroactively raise `maxSupply`, switch a frozen id to
   `EXTERNAL_URI`, or move user-held tokens.
8. **Custom errors only.** No `require(..., "string")`. Every revert
   path is a named custom error from §4.
9. **Honest events.** Every state-changing call emits an event the
   indexer can use without inferring intent (§5).
10. **Reentrancy-safe.** Mint paths follow checks-effects-interactions,
    pull USDC via `safeTransferFrom`, and are guarded with
    `ReentrancyGuard`.
11. **No surprise fees.** Buyer pays exactly `price * quantity` in USDC.
12. **No large raw image bytes.** No PNG/JPG byte storage. SVG only,
    composed from templates at call time.
13. **No `https://` metadata dependency in V1 default path.** A token id
    whose `rendererMode == ONCHAIN_SVG` MUST NOT resolve through any
    external host.

---

## 1. Storage layout

Field names are normative — the indexer and UI hooks reference them.

### 1.1 Immutable / constructor-set

| Field          | Type      | Notes                                                  |
| -------------- | --------- | ------------------------------------------------------ |
| `USDC`         | `IERC20`  | Avalanche USDC address (constructor arg). Immutable.   |
| `MAX_TOKEN_ID` | `uint256` | Constant = `255`. Bounds the token-ID space for V1.    |

### 1.2 Owner-settable global state

| Field         | Type      | Default | Notes                                                                                |
| ------------- | --------- | ------- | ------------------------------------------------------------------------------------ |
| `treasury`    | `address` | —       | Receiver of `withdrawUSDC`. Constructor-set; mutable via `setTreasury`.              |
| `paused`      | `bool`    | `false` | From OZ `Pausable`. Blocks `mint` / `mintBatch` only. Owner functions remain usable. |
| `royaltyBps`  | `uint96`  | `0`     | ERC-2981 default royalty (basis points, max `1000` = 10%).                           |
| `royaltyRecv` | `address` | `0x0`   | ERC-2981 default receiver.                                                           |

### 1.3 RendererMode

```
enum RendererMode {
  NONE,          // 0 — configured but not yet renderable; uri(id) reverts
  ONCHAIN_SVG,   // 1 — V1 default; uri(id) returns on-chain JSON+SVG data URI
  EXTERNAL_URI   // 2 — reserved future fallback; uri(id) returns stored ar:// or ipfs:// URI
}
```

### 1.4 Per-tokenId Artifact Definition

Stored as `mapping(uint256 => Artifact) public artifacts;`

```
struct Artifact {
  // ---- lifecycle ----
  bool         configured;          // true once configureArtifact has run
  bool         active;              // true => public mint allowed (requires definitionFrozen)
  bool         ownerOnly;           // true => only adminMint can mint this id
  bool         definitionFrozen;    // true => everything below this line is permanent
  RendererMode rendererMode;        // ONCHAIN_SVG (V1 default), EXTERNAL_URI (reserved), NONE
  // ---- supply / pricing ----
  uint64       maxSupply;           // hard cap on totalMinted[id]. 0 = LOCKED / NOT MINTABLE in V1 (no unlimited mints in V1).
  uint64       walletLimit;         // per-wallet cap on mintedPerWallet[id][wallet]. 0 = unlimited per-wallet (still bounded by maxSupply).
  uint64       totalMinted;         // running counter; increments on mint and adminMint
  uint256      priceUsdc;           // price in USDC (6 decimals) per unit, for public mint paths
  // ---- semantic fields rendered into JSON + SVG ----
  string       name;                // e.g. "The First Signal"
  string       category;            // e.g. "Chapter Artifact"
  string       shortDescription;    // <= 256 chars; rendered in JSON description
  string       visualFamily;        // "Certificate" | "Seal" | "Artifact Card" | "Secret" | "Pixel" | "Legacy"
  string       chapterLabel;        // e.g. "I — The Beginning"; empty when not applicable
  string       primaryColor;        // hex, e.g. "#0A0A0A"
  string       accentColor;         // hex, e.g. "#C9A24B"
  uint16       templateId;          // selects the SVG template family within the visual family
  uint16       iconId;              // selects the central glyph within the template
  // ---- reserved future fallback ----
  string       externalUri;         // used only when rendererMode == EXTERNAL_URI; otherwise empty
}
```

### 1.5 Per-wallet accounting

| Field             | Type                                              | Notes                                  |
| ----------------- | ------------------------------------------------- | -------------------------------------- |
| `mintedPerWallet` | `mapping(uint256 => mapping(address => uint64))`  | Incremented in `mint`. `adminMint` does NOT count toward wallet limit. |

### 1.6 Notes / non-storage

- `name()` / `symbol()` exposed as constants
  (`"Syndicate Archive"`, `"SYN-ARC"`) for marketplace UX.
- No allowlist storage in V1. Merkle / signature gating is deferred
  (see `SMART_CONTRACTS_DEFERRED.md` §1).
- No reveal / pre-reveal machinery. Activation requires frozen
  Artifact Definition; the SVG is renderable from that definition.

---

## 2. Initial token IDs (V1)

V1 reserves token IDs `1..8`. **Only IDs 1 and 3 are public-mint
candidates.** All others are owner-mint or `LOCKED` at deployment.

| ID | Name                  | Category            | Visual family   | Renderer mode (deploy) | Public mint? | Target price (USDC) | Proposed `maxSupply` | Proposed `walletLimit` | Activation gate                                                                                |
| -- | --------------------- | ------------------- | --------------- | ---------------------- | ------------ | ------------------- | -------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| 1  | The First Signal      | Chapter Artifact    | Artifact Card   | `ONCHAIN_SVG`          | **Yes — live** | `0.50` (`500_000`)  | `10_000`             | `5`                    | Artifact Definition complete + `freezeArtifactDefinition(1)` called + founder approval + `setDropActive(1, true)` complete. |
| 2  | Seat Record (reserved pointer) | Identity Certificate (future ERC-721) | Certificate | `NONE` (LOCKED) | **No** in V1 | `0` (n/a)           | `0`                  | `1`                    | **Reserved + disabled in V1.** Seat Records will live in a separate future ERC-721 (`SyndicateSeatRecord721`). `maxSupply == 0` means LOCKED / NOT MINTABLE — `mint(2)` and `adminMint(_,2,_)` both revert. ID 2 is only a disabled display **pointer / reference** to the future ERC-721 — never an identity source and never a member key (member identity = the Holder Index). See `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`. |
| 3  | Patron Seal           | Patron Seal         | Seal            | `ONCHAIN_SVG`          | Yes (later)  | `5.00` (`5_000_000`)| `10_000`             | `5`                    | Artifact Definition complete + frozen + founder approval. **Single flat amount. No tiers. No rank. No wealth-coded status.** |
| 4  | Heart Signal          | Secret Artifact     | Pixel (secret)  | `ONCHAIN_SVG` or `NONE`| **No**       | `0`                 | `1_000`              | `1`                    | SECRET. Owner-mint only after discovery proof verifier exists. Stays inactive in V1. May ship as `LOCKED` until discovery flow is active. |
| 5  | Genesis Sealed        | Genesis Founder Mark| Seal (ceremonial)| `ONCHAIN_SVG` or `NONE`| **No**      | `0`                 | `144`                | `1`                    | LOCKED until Genesis closes on-chain. Owner-mint only, distributed to verified Genesis wallets. |
| 6  | First Liquidity Event | Liquidity Mark      | Artifact Card   | `ONCHAIN_SVG` or `NONE`| **No**       | `0`                 | `500`                | `1`                    | LOCKED until LP creation tx is verified. Owner-mint only.                                       |
| 7  | First Routing Signal  | Protocol Milestone  | Artifact Card   | `ONCHAIN_SVG` or `NONE`| **No**       | `0`                 | `500`                | `1`                    | LOCKED until first verified 70/20/10 routing event. Owner-mint only.                            |
| 8  | Legacy Era I          | Legacy Artifact     | Legacy Artifact | `NONE` (LOCKED)        | **No**       | `0`                 | `0` (TBD)            | `1`                    | LOCKED. Released only after Era I is sealed in permanent on-chain history. Owner-mint only.     |

Activation rules (binding for every public-mint id):

1. `artifacts[id].rendererMode == ONCHAIN_SVG` (V1 default).
   `EXTERNAL_URI` is forbidden for V1 public drops unless explicitly
   re-approved per §3.10.
2. All semantic fields in §1.4 are set and self-consistent (visual
   family ∈ allowed set; colors are valid hex; templateId/iconId
   resolve to a registered template).
3. `freezeArtifactDefinition(id)` has been called →
   `artifacts[id].definitionFrozen == true`.
4. `artifacts[id].priceUsdc` matches the published price in
   `src/lib/archive-config.ts`.
5. Founder approves activation off-chain (signed change-control record).
6. Owner calls `setDropActive(id, true)`.
7. The frontend flips `resolveTruthState()` for that surface from
   `PENDING_NFT_CONTRACT` to `LIVE_ON_AVALANCHE`. No copy changes.

---

## 3. Functions

### 3.1 `constructor(address usdc_, address treasury_, address royaltyRecv_, uint96 royaltyBps_)`

- **Purpose:** deploy with immutable USDC, initial treasury, default royalty.
- **Access:** anyone (deployer becomes `owner`).
- **Preconditions:** all three addresses non-zero; `royaltyBps_ <= 1000`.
- **Effects:** sets `USDC`, `treasury`, `royaltyRecv`, `royaltyBps`;
  initialises OZ `Ownable`, `Pausable`, `ERC1155("")`, `ERC2981`.
- **Events:** `TreasuryUpdated(0x0, treasury_)`,
  `RoyaltyUpdated(royaltyRecv_, royaltyBps_)`.
- **Reverts:** `ZeroAddress`, `InvalidRoyalty`.
- **Security:** no artifacts configured at deploy. Contract starts inert.

### 3.2 `configureArtifact(uint256 id, Artifact calldata def)`

- **Purpose:** create the per-id Artifact Definition (one-time per id;
  subsequent edits go through narrow setters).
- **Access:** `onlyOwner`.
- **Preconditions:**
  - `id != 0 && id <= MAX_TOKEN_ID`.
  - `artifacts[id].configured == false`.
  - `def.totalMinted == 0`, `def.active == false`,
    `def.definitionFrozen == false`.
  - `def.rendererMode != EXTERNAL_URI` unless explicitly approved
    (V1 default rejects `EXTERNAL_URI` here — see §3.10).
  - If `def.rendererMode == ONCHAIN_SVG`: `bytes(def.name).length > 0`,
    `bytes(def.category).length > 0`, `bytes(def.visualFamily).length > 0`,
    valid hex `primaryColor` + `accentColor`, `templateId` and `iconId`
    resolve to registered templates, AND `def.maxSupply > 0` (V1 rule:
    no unlimited supply; any ID with `ONCHAIN_SVG` is intended to mint
    eventually and must declare a finite cap).
  - If `def.rendererMode == NONE`: semantic fields may be partially set
    and `def.maxSupply == 0` is allowed (the ID is LOCKED / NOT
    MINTABLE — e.g. ID 2 Seat Record reserved pointer, ID 8 Legacy
    Era I pre-seal); activation is blocked until renderer is upgraded
    (or to `EXTERNAL_URI` after explicit approval) AND `maxSupply` is
    raised above `0`.
  - For any drop intended to be public (`ownerOnly == false`):
    `def.maxSupply > 0` is REQUIRED. The contract rejects public-mint
    intent with `maxSupply == 0`.
- **Effects:** writes `artifacts[id] = def`.
- **Events:** `ArtifactConfigured(id, def.rendererMode, def.priceUsdc, def.maxSupply, def.walletLimit, def.ownerOnly)`.
- **Reverts:** `ArtifactAlreadyConfigured`, `InvalidQuantity`,
  `ExternalUriNotAllowedInV1`, `InvalidArtifactDefinition`.

> **Narrow post-configure setters** (each `onlyOwner`, each emits a
> dedicated event, each reverts `ArtifactDoesNotExist` if not
> configured, and each reverts `DefinitionAlreadyFrozen` if the id has
> been frozen):
>
> - `updateArtifactDefinition(uint256 id, Artifact calldata def)` —
>   bulk update of any mutable field on the Artifact Definition (name,
>   category, description, visual family, chapter, palette, icon /
>   template id). May NOT change `totalMinted`, `configured`, `active`,
>   or `definitionFrozen`. Emits
>   `ArtifactDefinitionUpdated(id, rendererMode)`.
> - `setWalletLimit(uint256 id, uint64 newLimit)` — emits
>   `WalletLimitUpdated(id, oldLimit, newLimit)`. Cannot be called when
>   the drop is `active` AND has any minted supply
>   (`LimitImmutableAfterActivation`).
> - `setPrice(uint256 id, uint256 newPriceUsdc)` — emits
>   `PriceUpdated(id, oldPrice, newPrice)`. Same activation-lock rule.
> - `setOwnerOnly(uint256 id, bool ownerOnly)` — emits
>   `OwnerOnlyUpdated(id, ownerOnly)`. Same activation-lock rule.
>
> `maxSupply` is **not** settable post-configure. Fixed at
> `configureArtifact` time; it cannot be raised.

### 3.3 `setDropActive(uint256 id, bool active)`

- **Access:** `onlyOwner`.
- **Preconditions to set `active == true`:**
  - `artifacts[id].configured`.
  - `artifacts[id].definitionFrozen`.
  - `artifacts[id].rendererMode == ONCHAIN_SVG`
    OR (`rendererMode == EXTERNAL_URI` AND `bytes(externalUri).length > 0`
    AND that id was explicitly approved for `EXTERNAL_URI` via §3.10).
  - `artifacts[id].ownerOnly == false`.
- **Effects:** `artifacts[id].active = active`.
- **Events:** `DropActiveChanged(id, active)`.
- **Reverts:** `ArtifactDoesNotExist`, `DefinitionNotFrozen`,
  `RendererNotReady`, `OwnerOnlyCannotBePublic`.

### 3.4 `mint(uint256 id, uint64 quantity)`

- **Purpose:** public mint path. Buyer pays `quantity * priceUsdc` USDC.
- **Access:** any EOA (no allowlist in V1).
- **Preconditions:**
  - `!paused`.
  - `artifacts[id].configured && active && !ownerOnly`.
  - `quantity > 0`.
  - `artifacts[id].maxSupply > 0` (V1 rule: `maxSupply == 0` means
    LOCKED / NOT MINTABLE; `configureArtifact` already rejects public
    drops with `maxSupply == 0`, but `mint` also defends in depth).
  - `totalMinted + quantity <= maxSupply`.
  - `mintedPerWallet[id][msg.sender] + quantity <= walletLimit`
    (if `walletLimit > 0`).
- **Effects:** increments `totalMinted` and `mintedPerWallet`; pulls
  `quantity * priceUsdc` USDC via `safeTransferFrom`; calls
  `_mint(msg.sender, id, quantity, "")`.
- **Events:** `ArtifactMinted(buyer, id, quantity, pricePaidUsdc, totalMintedAfter)`.
- **Reverts:** `ArtifactDoesNotExist`, `DropInactive`, `OwnerOnlyDrop`,
  `InvalidQuantity`, `ExceedsMaxSupply`, `ExceedsWalletLimit`,
  `PaymentFailed`, `EnforcedPause`.
- **Security:** `nonReentrant`; CEI ordering; no native AVAX accepted.

### 3.5 `mintBatch(...)` — **deferred (not in V1)**

Recommendation: defer to V2.

### 3.6 `adminMint(address to, uint256 id, uint64 quantity)`

- **Access:** `onlyOwner`.
- **Preconditions:** `configured`; `to != 0`; `quantity > 0`;
  `artifacts[id].maxSupply > 0` (V1 rule — `maxSupply == 0` means
  LOCKED / NOT MINTABLE for both public and owner-only ids; admin
  distribution to a closed set still requires a finite cap);
  `totalMinted + quantity <= maxSupply`.
  Does NOT require `definitionFrozen` (admin distribution can occur
  while definition is still mutable — see §7).
- **Effects:** increments `totalMinted`; calls `_mint`. Does NOT
  increment `mintedPerWallet`.
- **Events:** `ArtifactMinted(to, id, quantity, 0, totalMintedAfter)`.
- **Reverts:** `ArtifactDoesNotExist`, `ZeroAddress`, `InvalidQuantity`,
  `ExceedsMaxSupply`.

### 3.7 `freezeArtifactDefinition(uint256 id)`

- **Purpose:** make the per-id Artifact Definition (and therefore the
  rendered output for that id) permanent.
- **Access:** `onlyOwner`.
- **Preconditions:**
  - `configured`; `!definitionFrozen`.
  - `rendererMode != NONE`.
  - If `rendererMode == ONCHAIN_SVG`: all semantic fields valid (§3.2).
  - If `rendererMode == EXTERNAL_URI`: `bytes(externalUri).length > 0`
    AND the id was approved via §3.10.
- **Effects:** `artifacts[id].definitionFrozen = true`.
- **Events:** `ArtifactDefinitionFrozen(id, rendererMode)` AND OZ
  `PermanentURI(uri(id), id)` (marketplace-recognised signal that
  metadata is now immutable).
- **Reverts:** `ArtifactDoesNotExist`, `DefinitionAlreadyFrozen`,
  `RendererNotReady`.
- **Security:** one-way. Required before `setDropActive(id, true)`.

### 3.8 `setTreasury(address newTreasury)`

- **Access:** `onlyOwner`. Non-zero check.
- **Events:** `TreasuryUpdated(oldTreasury, newTreasury)`.

### 3.9 `withdrawUSDC(uint256 amount)`

- **Access:** `onlyOwner`. `amount == 0` withdraws full balance.
- **Effects:** transfers USDC to `treasury` via `safeTransfer`.
- **Events:** `USDCWithdrawn(treasury, amountTransferred)`.
- **Reverts:** `InvalidTreasury`, `InsufficientBalance`, `PaymentFailed`.

### 3.10 `setRendererMode(uint256 id, RendererMode mode, string calldata externalUri_)`

- **Purpose:** change the renderer mode for an unfrozen id. **The only
  path by which an id can adopt `EXTERNAL_URI`.**
- **Access:** `onlyOwner`.
- **Preconditions:**
  - `configured`; `!definitionFrozen`.
  - If `mode == ONCHAIN_SVG`: `externalUri_` is empty; semantic fields
    in §1.4 must be valid before the next `setDropActive(true)`.
  - If `mode == EXTERNAL_URI`: `bytes(externalUri_).length > 0`;
    `externalUri_` MUST start with `ar://` or `ipfs://` (no `https://`,
    no `data:`); the id MUST be on the off-chain
    `EXTERNAL_URI` approval list (recorded in
    `docs/SMART_CONTRACT_DECISIONS_PENDING.md`). The contract enforces
    the prefix check; the approval list is enforced socially +
    documented in §0 invariant 4. **No V1 token id is on this list.**
  - If `mode == NONE`: `externalUri_` is empty.
- **Effects:** updates `rendererMode` and `externalUri` accordingly.
- **Events:** `RendererModeUpdated(id, oldMode, newMode)`.
- **Reverts:** `ArtifactDoesNotExist`, `DefinitionAlreadyFrozen`,
  `InvalidExternalUri`, `ExternalUriNotAllowedInV1`.
- **Security:** the on-chain prefix check prevents accidental
  `https://` metadata. The "not on the V1 approval list" guard is
  procedural — the test suite asserts no V1 id is configured with
  `EXTERNAL_URI`.

### 3.11 `setDefaultRoyalty(address receiver, uint96 bps)`

- **Access:** `onlyOwner`. `bps <= 1000`. Emits `RoyaltyUpdated`.

### 3.12 `pause()` / 3.13 `unpause()`

- **Access:** `onlyOwner`. Pauses public `mint` only.

### 3.14 `uri(uint256 id) returns (string memory)` — override

- **Purpose:** ERC-1155 metadata resolver.
- **Access:** view, anyone.
- **Effects:**
  - If `rendererMode == ONCHAIN_SVG`: contract composes a JSON object
    with `name`, `description`, `image` (on-chain SVG data URI),
    `external_url = https://thesyndicate.money/archive`, and
    `attributes[]` from the Artifact Definition. Returns
    `data:application/json;base64,<base64-encoded JSON>`.
  - If `rendererMode == EXTERNAL_URI`: returns `externalUri` verbatim.
  - If `rendererMode == NONE`: reverts `URINotReady(id)`.
- **Reverts:** `ArtifactDoesNotExist`, `URINotReady`.

### 3.15 SVG / JSON renderer helpers (view, internal-or-public)

- `renderSVG(uint256 id) returns (string memory)` — composes the SVG
  string for `ONCHAIN_SVG` ids. Visible to off-chain tooling; not
  callable for `EXTERNAL_URI` ids.
- `renderJSON(uint256 id) returns (string memory)` — composes the
  unencoded JSON for `ONCHAIN_SVG` ids (handy for tests and indexer
  parity checks).

Both reverts: `ArtifactDoesNotExist`, `RendererNotReady`,
`UnsupportedRendererForCall`.

### 3.16 `supportsInterface(bytes4 interfaceId)` — override

- ERC-165, ERC-1155, ERC-1155MetadataURI, ERC-2981.

### 3.17 Helper getters

| Function                                                    | Returns                                                       | Consumer                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------- |
| `getArtifact(uint256 id)`                                   | full `Artifact` struct                                        | `getCategory`, `getArtifact`                 |
| `remainingSupply(uint256 id)`                               | `maxSupply - totalMinted` (returns `0` when `maxSupply == 0`, i.e. LOCKED) | `/archive` capacity readout                  |
| `walletRemaining(uint256 id, address wallet)`               | `walletLimit - mintedPerWallet[id][wallet]`                   | `/my-syndicate` claim panel                  |
| `isMintable(uint256 id, address wallet, uint64 quantity)`   | `bool`                                                        | `checkEligibility` (UI gate)                 |
| `ownedIdsOf(address wallet, uint256[] calldata ids)`        | `uint64[]` balances (one per id)                              | `listOwnedArtifacts` (avoids N RPC calls)    |

---

## 4. Custom errors

```
error ZeroAddress();
error Unauthorized();                  // reserved; OZ Ownable raises its own
error ArtifactDoesNotExist(uint256 id);
error ArtifactAlreadyConfigured(uint256 id);
error InvalidArtifactDefinition(uint256 id);
error DropInactive(uint256 id);
error OwnerOnlyDrop(uint256 id);
error OwnerOnlyCannotBePublic(uint256 id);
error InvalidQuantity();
error ExceedsMaxSupply(uint256 id, uint64 requested, uint64 remaining);
error ExceedsWalletLimit(uint256 id, uint64 requested, uint64 remaining);
error URINotReady(uint256 id);
error RendererNotReady(uint256 id);
error UnsupportedRendererForCall(uint256 id);
error DefinitionNotFrozen(uint256 id);
error DefinitionAlreadyFrozen(uint256 id);
error InvalidExternalUri();
error ExternalUriNotAllowedInV1(uint256 id);
error InvalidTreasury();
error InsufficientBalance(uint256 requested, uint256 available);
error PaymentFailed();
error InvalidRoyalty(uint96 bps);
error LimitImmutableAfterActivation(uint256 id);
```

---

## 5. Events and indexer mapping

Every event below is consumed by `src/lib/archive-indexer.ts`. The
indexer must compile against these signatures verbatim.

### 5.1 `ArtifactConfigured(uint256 indexed id, RendererMode rendererMode, uint256 priceUsdc, uint64 maxSupply, uint64 walletLimit, bool ownerOnly)`

- **Indexed:** `id`.
- **Frontend uses:** `/archive` (configured + renderer mode pill);
  `/registry` (lists configured IDs); `/transparency` (records every
  configuration change with tx link).

### 5.2 `ArtifactDefinitionUpdated(uint256 indexed id, RendererMode rendererMode)`

- **Indexed:** `id`.
- **Frontend uses:** `/archive` refreshes cached definition;
  `/transparency` records the pre-freeze edit.

### 5.3 `ArtifactDefinitionFrozen(uint256 indexed id, RendererMode rendererMode)`

- **Indexed:** `id`.
- **Frontend uses:** `/archive` renders "Metadata permanent" badge;
  `/registry` flips the definition row to PERMANENT;
  `/transparency` records the freeze tx as the immutability anchor.

### 5.4 `RendererModeUpdated(uint256 indexed id, RendererMode oldMode, RendererMode newMode)`

- **Indexed:** `id`.
- **Frontend uses:** `/archive` renderer pill swap; `/transparency`
  records the renderer change (V1 expects every id stays in
  `ONCHAIN_SVG` or `NONE`; an unexpected switch to `EXTERNAL_URI`
  raises an indexer warning).

### 5.5 `DropActiveChanged(uint256 indexed id, bool active)`

- **Indexed:** `id`.
- **Frontend uses:** `/archive` flips `truthState` from
  `PENDING_NFT_CONTRACT` to `LIVE_ON_AVALANCHE` when `active == true`;
  `/my-syndicate` enables the Claim panel; `/activity` posts an
  "Artifact activated" entry.

### 5.6 `ArtifactMinted(address indexed buyer, uint256 indexed id, uint64 quantity, uint256 pricePaidUsdc, uint64 totalMintedAfter)`

- **Indexed:** `buyer`, `id`.
- **Frontend uses:** `/archive` increments per-category mint counter;
  `/my-syndicate` adds artifact to wallet inventory and timeline;
  `/activity` posts each mint (redacted per leak-guard);
  `/registry` updates rolling total; `/transparency` reconciles
  `pricePaidUsdc` against the USDC balance.

### 5.7 `TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury)`

- **Frontend uses:** `/transparency` Treasury row updates.

### 5.8 `USDCWithdrawn(address indexed treasury, uint256 amount)`

- **Frontend uses:** `/transparency` ledger entry; `/registry` sums to
  lifetime Archive proceeds (separately labelled from 70/20/10).

### 5.9 `RoyaltyUpdated(address indexed receiver, uint96 bps)`

- **Frontend uses:** `/registry` royalty row.

### 5.10 `Paused(address account)` / `Unpaused(address account)` (from OZ)

- **Frontend uses:** `/archive` global "Public mint paused" banner;
  `/transparency` records the operation.

### 5.11 Optional supplementary events (recommended)

```
event WalletLimitUpdated(uint256 indexed id, uint64 oldLimit, uint64 newLimit);
event PriceUpdated(uint256 indexed id, uint256 oldPrice, uint256 newPrice);
event OwnerOnlyUpdated(uint256 indexed id, bool ownerOnly);
```

### 5.12 Standard ERC-1155 events (inherited)

`TransferSingle`, `TransferBatch`, `ApprovalForAll`, `URI`,
`PermanentURI` (emitted by `freezeArtifactDefinition`).

---

## 6. Metadata output schema (rendered by the contract)

For `rendererMode == ONCHAIN_SVG`, `uri(id)` returns a base64-encoded
JSON conforming to the shape below. See
`NFT_ARCHIVE_METADATA_PHILOSOPHY.md` §7 and
`NFT_ARCHIVE_TOKEN_CATALOG_V1.md` §3 for canonical examples.

Required fields in the rendered JSON:

- `name` — `<Artifact.name> #<zero-padded serial when applicable>`
- `description` — `<Artifact.shortDescription>` + boilerplate
  ("Confers no financial rights.").
- `image` — `data:image/svg+xml;base64,<rendered SVG>`
- `external_url` — `https://thesyndicate.money/archive`
- `attributes[]` — Category, Token ID, Chain (`Avalanche C-Chain`),
  Renderer (`ONCHAIN_SVG`), Status, Rights, Financial rights (`None`),
  Visual family, Chapter/Event (when applicable), Serial (when capped).

The rendered SVG MUST include, as readable text: `The Syndicate`,
artifact name, category, token ID, `Avalanche C-Chain`,
`collectible record only`, `no financial rights`.

Forbidden:

- `https://` `image` URLs (any V1 id).
- `data:` URLs in `image` for `rendererMode == EXTERNAL_URI` ids (the
  external JSON itself decides its own image, but V1 does not enable
  `EXTERNAL_URI`).
- Banned wording per `NFT_ARCHIVE_METADATA_PHILOSOPHY.md` §9.

---

## 7. Artifact Definition freeze policy

1. **Pre-freeze:** owner may call `updateArtifactDefinition`,
   `setRendererMode`, `setWalletLimit`, `setPrice`, `setOwnerOnly` any
   number of times. This is the editing window.
2. **Before activation of a public drop:** owner MUST call
   `freezeArtifactDefinition(id)`. `setDropActive(id, true)` reverts
   with `DefinitionNotFrozen` otherwise.
3. **After freeze:** every mutator above reverts with
   `DefinitionAlreadyFrozen`. No exceptions, no migrations, no admin
   override. The rendered output for that id is permanent.
4. **Owner-only drops** (IDs 2, 4, 5, 6, 7, 8) MAY keep the definition
   mutable until final shape is ready; freeze is required only before
   that id transitions to a public mint (out of V1 scope for all of
   them, so freeze is at the owner's discretion in V1).
5. **No dishonest mutation:** even while mutable, the owner commits to
   only updating an id's definition to reflect the same artifact's
   improved presentation. Repurposing a token id to a different
   artifact is forbidden by invariants in §0.

---

## 8. Final Solidity implementation checklist

This is the checklist Kemal + ChatGPT use to start implementation.

### 8.1 Exact imports (OpenZeppelin v5.x)

- `@openzeppelin/contracts/token/ERC1155/ERC1155.sol`
- `@openzeppelin/contracts/token/common/ERC2981.sol`
- `@openzeppelin/contracts/access/Ownable.sol`
- `@openzeppelin/contracts/utils/Pausable.sol`
- `@openzeppelin/contracts/utils/ReentrancyGuard.sol`
- `@openzeppelin/contracts/token/ERC20/IERC20.sol`
- `@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol`
- `@openzeppelin/contracts/utils/Base64.sol`
- `@openzeppelin/contracts/utils/Strings.sol`

No other third-party libraries in V1.

### 8.2 Exact functions (V1)

`constructor`, `configureArtifact`, `updateArtifactDefinition`,
`setRendererMode`, `setWalletLimit`, `setPrice`, `setOwnerOnly`,
`setDropActive`, `mint`, `adminMint`, `freezeArtifactDefinition`,
`setTreasury`, `withdrawUSDC`, `setDefaultRoyalty`, `pause`, `unpause`,
`uri` (override), `renderSVG`, `renderJSON`,
`supportsInterface` (override), `getArtifact`, `remainingSupply`,
`walletRemaining`, `isMintable`, `ownedIdsOf`.

Not in V1: `mintBatch`, `rescueERC20`, allowlist functions, per-role
access (only `Ownable` + future Safe owner), governance.

### 8.3 Exact events

`ArtifactConfigured`, `ArtifactDefinitionUpdated`,
`ArtifactDefinitionFrozen`, `RendererModeUpdated`,
`DropActiveChanged`, `ArtifactMinted`, `TreasuryUpdated`,
`USDCWithdrawn`, `RoyaltyUpdated`, `WalletLimitUpdated`,
`PriceUpdated`, `OwnerOnlyUpdated`. Inherited: `TransferSingle`,
`TransferBatch`, `ApprovalForAll`, `URI`, `PermanentURI`, `Paused`,
`Unpaused`.

### 8.4 Exact token IDs

IDs 1..8 per §2. No others in V1.

### 8.5 Exact initial parameters (proposed — confirm before deploy)

| Param         | Value                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| `USDC`        | Avalanche C-Chain USDC (native), filled at deploy.                     |
| `treasury`    | Dedicated Archive treasury Safe (TBD, separate from Membership Sale).  |
| `royaltyRecv` | Same Safe as `treasury`.                                               |
| `royaltyBps`  | `500` (5%) — confirm with legal/marketplace review.                    |
| ID 1 cfg      | `rendererMode=ONCHAIN_SVG`, `priceUsdc=500_000`, `maxSupply=10_000`, `walletLimit=5`, `ownerOnly=false`, visualFamily=`Artifact Card`, chapter=`I — The Beginning`. |
| ID 2 cfg      | `rendererMode=NONE`, `priceUsdc=0`, `maxSupply=0`, `walletLimit=1`, `ownerOnly=true` (LOCKED / future ERC-721 likely). |
| ID 3 cfg      | `rendererMode=ONCHAIN_SVG`, `priceUsdc=5_000_000`, `maxSupply=10_000`, `walletLimit=5`, `ownerOnly=false`, visualFamily=`Seal`. |
| ID 4 cfg      | `rendererMode=ONCHAIN_SVG` or `NONE`, `priceUsdc=0`, `maxSupply=1_000`, `walletLimit=1`, `ownerOnly=true`. |
| ID 5 cfg      | `rendererMode=ONCHAIN_SVG` or `NONE`, `priceUsdc=0`, `maxSupply=144`, `walletLimit=1`, `ownerOnly=true`. |
| ID 6 cfg      | `rendererMode=ONCHAIN_SVG` or `NONE`, `priceUsdc=0`, `maxSupply=500`, `walletLimit=1`, `ownerOnly=true`. |
| ID 7 cfg      | `rendererMode=ONCHAIN_SVG` or `NONE`, `priceUsdc=0`, `maxSupply=500`, `walletLimit=1`, `ownerOnly=true`. |
| ID 8 cfg      | `rendererMode=NONE` (LOCKED), `priceUsdc=0`, `maxSupply=0` (TBD), `walletLimit=1`, `ownerOnly=true`. |

### 8.6 Exact tests required (Foundry recommended)

**Unit (renderer-aware):**

- `uri(id)` for an `ONCHAIN_SVG` id returns a string starting with
  `data:application/json;base64,` and decodes to valid JSON.
- Decoded JSON includes `name`, `description`, `image`, `external_url`,
  `attributes[]` with `Category`, `Token ID`, `Chain` (=
  `Avalanche C-Chain`), `Renderer` (= `ONCHAIN_SVG`), `Status`,
  `Rights`, `Financial rights` (= `None`), `Visual family`.
- JSON `image` field starts with `data:image/svg+xml;base64,` and
  decodes to a valid SVG.
- Decoded SVG contains the literal strings: `The Syndicate`, the
  artifact name, the category, the token id, `Avalanche C-Chain`,
  `collectible record only`, `no financial rights`.
- `uri(id)` for a `NONE` id reverts `URINotReady`.
- `uri(id)` for an unconfigured id reverts `ArtifactDoesNotExist`.
- `setDropActive(id, true)` reverts `DefinitionNotFrozen` if
  `!definitionFrozen`.
- `setDropActive(id, true)` reverts `RendererNotReady` if
  `rendererMode == NONE`.
- `freezeArtifactDefinition` is one-way; subsequent mutators revert
  `DefinitionAlreadyFrozen`.
- `configureArtifact` rejects `rendererMode == EXTERNAL_URI` (the
  initial config path always rejects external URI; the only path in is
  `setRendererMode`).
- `setRendererMode(id, EXTERNAL_URI, "")` reverts `InvalidExternalUri`.
- `setRendererMode(id, EXTERNAL_URI, "https://…")` reverts
  `InvalidExternalUri`.
- A property test asserts that for every V1 token id (1..8) configured
  by the deployment script, `rendererMode != EXTERNAL_URI`. This
  enforces "external URI fallback cannot be used accidentally for V1
  public drops."
- `mint` reverts on each precondition: paused, inactive, owner-only,
  zero quantity, supply exceeded, wallet limit exceeded, USDC pull
  failure.
- `mint` happy path: balances, counters, event payload, USDC moved.
- `adminMint` does not advance `mintedPerWallet`; respects `maxSupply`.
- `setTreasury` rejects zero; `withdrawUSDC` moves the right amount.
- `setDefaultRoyalty` rejects `bps > 1000` and zero receiver.
- `pause` blocks `mint`; does not block `adminMint` or admin ops.
- `supportsInterface` returns true for the required ids.

**Storage / size:**

- The contract bytecode does not embed any raw PNG/JPG bytes. (Search
  the compiled artifact for the PNG / JPEG magic numbers; assert
  absent.)
- The contract source contains no `https://` literal used in any
  rendered metadata path. (Lint check; the only `https://` literal
  permitted is the `external_url` constant pointing to
  `thesyndicate.money/archive`.)

**Fuzz:**

- Random `(quantity, walletLimit, maxSupply)` triples never let
  `totalMinted` exceed `maxSupply` or `mintedPerWallet` exceed
  `walletLimit`.
- Random sequences of `configure → update → freeze → activate → mint`
  preserve invariants.

**Invariant / property:**

- `sum_of_wallet_balances(id) == totalMinted(id)` for any id.
- `definitionFrozen[id] == true` implies every mutable definition
  field returned by `getArtifact(id)` is byte-identical to its value
  at the freeze block.
- For every V1 deployed id (1..8), `rendererMode ∈ { ONCHAIN_SVG, NONE }`.
- For every V1 deployed id, if any successful mint exists then
  `maxSupply > 0`. Equivalently: `maxSupply == 0` ⇒ `totalMinted == 0`
  forever for that id (the LOCKED guarantee). This MUST hold for
  ID 2 (Seat Record reserved pointer) and any id whose
  `rendererMode == NONE`.

**Integration (Fuji rehearsal):**

- Full configure → update → freeze → activate → mint flow with real
  Fuji USDC mock.
- Treasury withdraw to a separate test Safe.
- Ownership transfer to a Safe multisig and a follow-up admin op
  signed by the multisig.
- Off-chain consumer (`src/lib/archive-indexer.ts` test harness) reads
  `uri(id)`, decodes JSON + SVG, and asserts the SVG contains the
  required literals.

### 8.7 Exact decisions still open (must close before code is written)

1. **ID 1 `maxSupply` = 10_000?** Or peg to chapter-of-joining seat
   count at chapter seal? **Recommend 10,000.**
2. **ID 3 (Patron Seal) cap.** **Recommend `maxSupply = 10_000`,
   `walletLimit = 5`.**
3. **Royalty bps and receiver.** Confirm 5% and the Safe address.
4. **License for metadata + media.** Confirm CC-BY-NC-4.0 or alternative.
5. **Safe multisig signer set + threshold** for owner transfer
   (target ≤ 30 days post-deploy). Confirm signers.
6. **Per-tokenId final Artifact Definition authoring + freeze schedule.**
   Confirm that no public drop is activated before its definition is
   frozen.
7. **Initial `rendererMode` for IDs 4–7 at deploy** — `ONCHAIN_SVG` (with
   the id still owner-only and inactive) versus `NONE` (`LOCKED`).
   Recommend `NONE` at deploy and upgrade to `ONCHAIN_SVG` per id when
   its template is ready.

When every item above is closed, the next step is unambiguous:

> Kemal + ChatGPT write `SyndicateArchive1155.sol` directly from this
> spec, then run the test suite in §8.6 on Fuji before requesting an
> external audit (per `docs/SMART_CONTRACTS_DEFERRED.md` §3).

---

## 9. Renderer-architecture lock note (2026-06-06)

Decision **B1** in `docs/SMART_CONTRACT_DECISIONS_PENDING.md` is
**CLOSED**: V1 uses `ONCHAIN_SVG` as the default renderer.
`EXTERNAL_URI` is reserved as a future fallback for complex art only
and is not used by any V1 token id. This spec replaces the prior
URI-freeze model (`freezeURI(id)`) with the
Artifact-Definition-freeze model (`freezeArtifactDefinition(id)`).

Companion docs:
- `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md`
- `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`
- `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md`
- `docs/NFT_ARCHIVE_DESIGN_REFERENCES.md`

---

## 10. Final Seat Record Architecture Decision (2026-06-06)

**LOCKED.** Canonical doc: `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`.

Seat Records are **NOT** active ERC-1155 artifacts in V1. The Archive
contract holds collectible **protocol artifacts** only. Seat Records
will be implemented later in a **separate ERC-721 contract** (working
name `SyndicateSeatRecord721` / `SyndicateSeatRegistry721`) once
membership eligibility is enforceable on-chain.

Token ID 2 inside `SyndicateArchive1155` stays reserved and disabled
as a stable pointer / reference to the future ERC-721 — it is **only** a
pointer. ID 2 is **not** an identity source and **not** a member key;
member identity is the Holder Index (first-seen `TokensPurchased`
ordering), and seat numbers will be assigned there, never from ID 2:

- `rendererMode = NONE` · `active = false` · `ownerOnly = true`
  · `maxSupply = 0` · `walletLimit = 1` · `priceUsdc = 0`
  · `definitionFrozen = false` (a disabled placeholder is not frozen).
- `mint(2, …)` reverts. `adminMint(_, 2, _)` reverts (`maxSupply == 0`).
- `uri(2)` reverts `URINotReady(2)`.
- `setDropActive(2, true)` reverts.

**Contract-wide rule (binding):** `maxSupply == 0` means **LOCKED /
NOT MINTABLE** for V1. It does **NOT** mean unlimited. There is no
unlimited minting in V1. Every public drop has `maxSupply > 0`; every
owner-only drop that ever mints in V1 also has `maxSupply > 0`. The
test suite in §8.6 includes a property test asserting this for every
configured V1 id.

Future `SyndicateSeatRecord721` will likely store: member number,
original purchasing wallet, first purchase tx hash, first purchase
block height, chapter joined, timestamp, and (if added) on-chain
linked-wallet rules. No Seat Record minting happens until that
contract is specified, tested, audited, and deployed separately.

Allowed wording: *"Seat Records are reserved for a future ERC-721
identity contract."* / *"Archive1155 V1 records collectible protocol
artifacts."* / *"ID 2 is reserved and disabled in V1."* /
*"SYN is the seat. Artifacts are the memory."*
