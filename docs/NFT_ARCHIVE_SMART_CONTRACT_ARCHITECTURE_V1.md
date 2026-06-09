> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# NFT Archive — Smart Contract Architecture V1

**Status:** 🟢 DEPLOYED ON AVALANCHE MAINNET · 🔍 VALIDATION PHASE · ⛔ NO PUBLIC DROP ACTIVATED (2026-06-06)
**Contract address:** `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d`
**Trackers:** `docs/DEPLOYMENT_STATE_V1.md` · `docs/CONTRACT_INTEGRATION_STATUS.md`
**Network:** Avalanche C-Chain only (Chain ID 43114)
**Doctrine:** SYN is the seat. NFT Artifacts are the memory.
**Audience:** Founder (non-coder) first; future Solidity author second.

This document is the V1 blueprint for the future on-chain memory layer of
The Syndicate. It does not deploy anything, invent any addresses, mark
anything live, or change any existing route, contract, or routing logic
(Membership Sale, SYN, USDC routing, Chapters, Vault, Liquidity,
Registry, Transparency, Activity, Join, Dashboard). It only describes
what V1 should be when it eventually ships.

Companion docs:
- `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md` (truth states)
- `docs/ARCHIVE_ENGINE_SPEC.md` (engine surface contract)
- `docs/SMART_CONTRACTS_DEFERRED.md` (what is *not* in V1)
- `docs/STEP_BY_STEP_FROM_HERE.md` (transition roadmap)
- `src/lib/archive-truth-states.ts`, `src/lib/archive-indexer.ts`

---

## PART A — Recommended V1 contract model

**Recommendation: one contract — `SyndicateArchive1155` — using OpenZeppelin's audited ERC-1155.**

ERC-1155 is purpose-built for many token *types* living under one contract,
each addressed by a numeric `tokenId`. That is exactly the shape of the
Archive: Chapter Artifacts, Seat Records, Patron Seal, Heart Signal,
Genesis Sealed, Liquidity Marks, Protocol Milestones, Legacy. One
deployment, one verified source, one explorer page, one indexer cursor.

Why this is better than the alternatives for V1:

| Alternative                              | Why deferred for V1                                                                                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Separate ERC-721 Seat Record contract *in V1* | Deferred to a later, separate contract (`SyndicateSeatRecord721`). Not built in V1: membership eligibility is not yet enforceable on-chain. ERC-721 IS the correct shape for Seat Records — it just ships later as its own deployment, not inside V1. See Part G + `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`. |
| Many small contracts (one per artifact)  | N×audit cost, N×deploy cost, N×explorer pages, N×failure modes. Same memory layer fragmented across many addresses.                                             |
| Proxy / upgradeable (UUPS, Transparent)  | Powerful but adds a permanent admin power that "can change the rules later". For a memory layer, immutability *is* the feature. V2 lives at a new address.      |
| Third-party mint platform (Zora/Manifold)| Couples the future memory layer to another product's roadmap, fees, and shutdown risk. Violates "works if the website / Lovable disappears."                    |
| Off-chain only                           | No on-chain memory layer at all. Defeats the purpose.                                                                                                           |

Founder-friendly translation:

- **Simpler.** One thing to deploy, one thing to verify, one thing to lose the keys to.
- **Cheaper.** One audit pass, one deployment fee.
- **Fewer things to break.** Each new artifact is a number, not a new contract.
- **Easier to verify.** Snowtrace shows one source file.
- **Easier to index.** One address, one event stream.
- **Scalable.** New token IDs added by owner config — no redeploy.
- **Autonomous.** Avalanche keeps it alive even if every Syndicate surface goes dark.
- **Future-proof.** V2 (e.g. unique-Seat ERC-721) ships at a new address and references V1 by history, not by upgrade.

---

## PART B — What V1 contract should support

V1 supports multiple artifact types under one contract. Each artifact is a
`tokenId` with its own config (active flag, max supply, price, per-wallet
limit, URI, eligibility level).

Initial token-ID plan:

| ID | Name                  | Category            | V1 plan                                                                 |
| -: | --------------------- | ------------------- | ----------------------------------------------------------------------- |
| 1  | The First Signal      | Chapter Artifact    | Public mint, low fixed price, low per-wallet cap. **Active at launch.** |
| 2  | Seat Record (reserved pointer) | Future ERC-721 (`SyndicateSeatRecord721`) | **Reserved + disabled in V1.** `active = false`, `maxSupply = 0` (LOCKED / NOT MINTABLE), `rendererMode = NONE`, `ownerOnly = true`. Mints from a separate future ERC-721 contract — never from Archive1155. See Part G + `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`. |
| 3  | Patron Seal           | Patron Seal         | Public mint, flat single price. **Active at launch.** No tiers, no rank.|
| 4  | Heart Signal          | Secret Artifact     | **Inactive** at launch. Owner-mint to discoverers, or activated when secret-proof is solved. |
| 5  | Genesis Sealed        | Protocol Milestone  | **Owner-mint** to verified Genesis participants after Genesis closes.   |
| 6  | First Liquidity Event | Liquidity Mark      | **Owner-mint** after first LP event is confirmed on-chain.              |
| 7  | First Routing Signal  | Protocol Milestone  | **Owner-mint** after first 70/20/10 routing event is confirmed.         |
| 8  | Legacy Era I          | Legacy Artifact     | **Inactive (LOCKED)**. Configured but unminted until the era is sealed. |

New token IDs are added later via an owner-only `configureDrop(id, ...)`
call. No redeploy. No proxy. The contract is fixed code; the artifact
table is data.

---

## PART C — Contract features (include / defer matrix)

| # | Feature                          | V1?      | Why                                                                                          | Risk if included                                | Complexity | Future path                              |
| -: | ------------------------------- | -------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------- | ---------------------------------------- |
| 1  | ERC1155                         | YES      | Multi-type memory layer in one contract                                                       | None — audited standard                         | Low        | —                                        |
| 2  | ERC1155Supply                   | YES      | Per-id supply tracking enforces max supply and powers `/registry` counts                      | None                                            | Low        | —                                        |
| 3  | On-chain SVG renderer (`ONCHAIN_SVG`) | YES | V1 default per B1. Composes JSON + SVG at `uri(id)` time from the per-id Artifact Definition. | Higher deploy gas, harder to iterate post-freeze | Med        | `EXTERNAL_URI` mode available for future complex art |
| 4  | Ownable (single owner)          | YES      | Smallest safe admin surface for V1. Designed to transfer to multisig later.                  | Key compromise = full admin (mitigated by Safe) | Low        | Transfer ownership to Safe multisig      |
| 5  | AccessControl (roles)           | NO       | Overkill for V1; one owner is auditable.                                                      | Adds surface area                                | Med        | V2 if multiple operators are needed       |
| 6  | Pausable                        | YES      | Single emergency switch. Pauses mint only — transfers still flow.                            | Misuse — disclose                                | Low        | —                                        |
| 7  | ReentrancyGuard                 | YES      | Cheap, applied to paid `mint`                                                                | None                                            | Low        | —                                        |
| 8  | ERC2981 royalties               | YES (simple) | Default 5% to operations wallet, single setter. Never marketed as revenue.               | Marketplace enforcement is voluntary             | Low        | Per-id royalties in V2                   |
| 9  | USDC payment                    | YES      | Site is already USDC-native; prices like $0.50 are legible                                   | USDC contract dependency                         | Low        | —                                        |
| 10 | Treasury recipient              | YES      | One address, settable by owner, non-zero check                                                | Owner can redirect future revenue — disclose    | Low        | Move to multisig                         |
| 11 | Per-token active/inactive       | YES      | Lets us ship the contract with most artifacts inactive (PENDING)                              | None                                            | Low        | —                                        |
| 12 | Per-token max supply            | YES      | Caps minting; required by `/registry`                                                         | None                                            | Low        | —                                        |
| 13 | Per-token price (USDC)          | YES      | Free mint when `price == 0`                                                                   | None                                            | Low        | —                                        |
| 14 | Per-wallet mint limit           | YES      | Soft-fair distribution                                                                        | Sybil bypass — acceptable                        | Low        | Combine with Merkle in V2                |
| 15 | Owner/admin mint                | YES      | Required for Level-2 eligibility (Genesis, LP, helpers)                                       | Owner trust required — disclose                 | Low        | Role-gated in V2                         |
| 16 | Public mint (active artifacts)  | YES      | The whole point of an open archive                                                            | Reentrancy (mitigated by guard + CEI)           | Low        | —                                        |
| 17 | Artifact Definition freeze      | YES      | `updateArtifactDefinition` while unfrozen; `freezeArtifactDefinition(id)` once final          | Owner can rewrite definition until frozen        | Low        | Freeze on activation = default policy    |
| 18 | Withdraw USDC                   | YES      | Owner withdraws to treasury (non-zero)                                                        | Owner can drain — by design                     | Low        | Multisig only                            |
| 19 | Emergency pause                 | YES      | Same as Pausable; mint-only effect                                                            | Misuse                                          | Low        | —                                        |
| 20 | Events for indexers             | YES      | Without events there is no `/activity`, `/my-syndicate`, `/registry`                          | None                                            | Low        | —                                        |

---

## PART D — What V1 explicitly does NOT include

Each item below is **rejected for V1** and the reason is permanent until V2 explicitly revisits it.

| Excluded                                | Why deferred                                                                                                                                                |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upgradeable proxy (UUPS / Transparent)  | A memory layer must be immutable. Upgradability turns "the record" into "the latest version of the record."                                                  |
| DAO governance                          | No quorum, no voter set, no need. V1 is a memory contract, not a treasury.                                                                                  |
| Staking                                 | Artifacts are records, not yield-bearing.                                                                                                                   |
| Revenue share / dividends / rewards     | Securities risk + violates banned-copy rules (ROI, dividend, yield, profit share).                                                                          |
| Random loot boxes / on-chain randomness | Memory is deterministic. Randomness adds VRF dependency and gambling framing.                                                                                |
| Complex Merkle allowlists               | Off-chain tooling burden the founder cannot maintain alone. V2 once tooling exists.                                                                          |
| Signature minting (EIP-712)             | Adds a signer key the founder must protect forever. Deferred until needed.                                                                                  |
| Marketplace logic (listings, auctions)  | OpenSea / Joepegs handle this. Not the protocol's job.                                                                                                       |
| Dynamic metadata requiring live server  | Site outage must not break the artifact. V1 default is on-chain SVG (B1 LOCKED); `EXTERNAL_URI` is reserved future fallback only.                          |
| Soulbound restrictions (V1-wide)        | Implementing nontransferability cleanly across ERC-1155 hooks adds complexity. Identity-only tokens come in V2 ERC-721.                                      |
| ERC-721 unique Seat Records             | Requires solved eligibility *and* permanent unique numbering. V2 problem.                                                                                   |
| Admin dashboard                         | Owner uses Snowtrace + a Safe UI. Building a custom admin UI in V1 violates "not dependent on the website."                                                  |
| Lending / borrowing / yield mechanics   | Out of scope. Securities risk.                                                                                                                              |

---

## PART E — Payment architecture

**Decision: USDC, on Avalanche C-Chain.**

Prices like `$0.50` and `$5.00` are legible, the rest of the site is
already USDC-native, and AVAX-denominated artifact pricing would drift
with AVAX/USD volatility and confuse buyers.

### Flow

1. Buyer chooses artifact ID + quantity.
2. Buyer signs an ERC-20 `approve(SyndicateArchive1155, amount)` on USDC if their allowance is insufficient.
3. Buyer calls `mint(id, quantity)`.
4. Contract computes `cost = price[id] * quantity`.
5. If `cost > 0`: `USDC.transferFrom(buyer, treasury, cost)` — checks-effects-interactions: state updated *before* the external call where possible, with `ReentrancyGuard` protecting the function.
6. `_mint(buyer, id, quantity, "")`.
7. `emit ArtifactMinted(id, buyer, quantity, cost, treasury)`.

### Edge cases

- **Missing allowance** → USDC `transferFrom` reverts; whole `mint` reverts; no token issued; no event emitted.
- **Insufficient USDC balance** → same revert path.
- **`price[id] == 0`** → free mint supported; `transferFrom` is skipped; everything else (active, max supply, per-wallet limit, pause, reentrancy) still enforced.
- **Pause active** → `mint` reverts with a clear error; admin mint may or may not bypass (V1 recommendation: admin mint also blocked when paused, except a separate `emergencyMint` is **not** added — keeps surface small).
- **Treasury = zero** → `setTreasury` reverts; `withdraw` reverts; deployment constructor requires non-zero treasury.

### Treasury

- Single address, settable by owner, non-zero check, event on change.
- **V1 destination: Operations / Development wallet.** Artifact revenue is *separate* from Membership Sale 70/20/10 routing. The Archive is a memory layer, not a Membership Sale revenue stream.
- A future decision can re-route part of artifact revenue to the protocol routing wallet *only* if explicitly chosen later, disclosed, and re-audited.

---

## PART F — Eligibility architecture (three levels)

V1 enforces only what it can enforce **on-chain**. Anything weaker than that stays inactive or owner-mint-only.

| Level | Name                          | Enforcement                                       | V1 use                                            |
| ----- | ----------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| 1     | Public mint                   | Just `active == true`, supply/limit/pause checks. | The First Signal, Patron Seal.                    |
| 2     | Owner/admin mint              | `onlyOwner` mints to a verified wallet.           | Genesis Sealed, First Liquidity, First Routing, early Heart Signal recipients. |
| 3     | Automated eligibility (V2)    | Merkle root / signature / indexer proof / on-chain read of Membership Sale or LP. | Seat Records, automated LP marks, automated milestones, secret-proof Heart Signal. |

V1 deliberately stops at Level 2. Level 3 is a V2 problem because it
requires either off-chain tooling the founder cannot run alone (Merkle
publishing) or cross-contract reads that are simpler after V1 ships and
stabilises.

---

## PART G — Seat Record decision (✅ LOCKED 2026-06-06)

**Final architecture (see `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`):**

- **`SyndicateArchive1155` V1 = collectible protocol artifacts only.**
  Seat Records are NOT active ERC-1155 artifacts in V1.
- **Seat Records ship later as a separate ERC-721** — working name
  `SyndicateSeatRecord721` / `SyndicateSeatRegistry721`, deployed at a
  new address once membership eligibility is enforceable on-chain.
  Each member receives a unique record (Member #1, #2, #100, #10,000
  …) — that is a natural ERC-721 shape, not an edition-style 1155.
- **Token ID 2 in `SyndicateArchive1155`** remains as a stable
  reserved + disabled **pointer** to the future ERC-721:
  `active = false`, `ownerOnly = true`, `rendererMode = NONE`,
  `maxSupply = 0` (LOCKED / NOT MINTABLE), `walletLimit = 1`,
  `priceUsdc = 0`. `mint(2)` reverts, `adminMint(_, 2, _)` reverts,
  `uri(2)` reverts, `setDropActive(2, true)` reverts.

V1 UI keeps showing `PENDING NFT CONTRACT` for the Seat Record until
the future ERC-721 ships.

---

## PART H — Metadata architecture (B1 LOCKED — on-chain SVG default)

**Decision B1 is CLOSED (2026-06-06):** V1 uses **on-chain generated
JSON + on-chain generated SVG** as the default renderer. External URI
hosting (Arweave / IPFS) is **reserved as a future fallback for complex
art only** and is NOT used by any V1 token id.

| Option                           | V1 verdict                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------- |
| Centralised website URLs         | **NO** — site outage = broken artifact; explicitly forbidden in V1.              |
| IPFS with reliable pinning       | **Reserved future fallback only.** Not used by any V1 id.                        |
| Arweave                          | **Reserved future fallback only.** Not used by any V1 id.                        |
| Fully on-chain SVG (`ONCHAIN_SVG`) | **DEFAULT for V1.** Truly forever, no external dep, no pinning ops.            |
| Hybrid                           | Available via per-id `RendererMode`, but every V1 id ships `ONCHAIN_SVG` or `NONE`. |

### Renderer modes (per token id)

| Mode             | V1 usage                                                                              |
| ---------------- | ------------------------------------------------------------------------------------- |
| `ONCHAIN_SVG`    | V1 default for every activatable id. JSON + SVG composed at `uri(id)` time.           |
| `EXTERNAL_URI`   | Reserved. Not used by any V1 id. Requires explicit founder approval to enable later.  |
| `NONE` / `LOCKED`| Pre-activation state. `uri(id)` reverts. Used for ids 2, 4–8 at deploy.               |

### Rendered metadata shape (decoded preview — actual `uri(id)` returns the base64 form)

```json
{
  "name": "The First Signal #000001",
  "description": "Chapter Artifact. Collectible record of an early Syndicate chapter. Confers no financial, governance, treasury, or Vault rights.",
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

### Process (revised for on-chain renderer)

1. Author the per-id Artifact Definition (name, category, short
   description, visual family, chapter, palette, icon/template id,
   supply, walletLimit, price).
2. Call `configureArtifact(id, def)` with `rendererMode = ONCHAIN_SVG`.
3. Iterate via `updateArtifactDefinition` until the SVG output is
   correct (verified by decoding `uri(id)` off-chain).
4. Call `freezeArtifactDefinition(id)`. After this, the rendered output
   for that id is permanent.
5. `setDropActive(id, true)` only after freeze + founder approval.

No off-chain uploads. No pinning to maintain. No website fallback. The
artifact remains meaningful and renderable even if Syndicate surfaces
go dark — Avalanche serves the SVG.

---

## PART I — Royalties (ERC-2981)

**Recommendation: include, simple, 5%, recipient = operations wallet, single setter.**

- Single `_setDefaultRoyalty(receiver, 500 /* = 5.00% */)` at deploy.
- One setter (`setDefaultRoyalty`) for future adjustment, owner-only, with an event.
- Per-id royalties deferred to V2.

### Risks / honesty

- Marketplace enforcement is **voluntary**. Some marketplaces ignore ERC-2981.
- Royalties are **never** marketed as revenue, returns, or yield.
- This is an industry-standard signal, not a Syndicate revenue line.

---

## PART J — Transferability

**Recommendation: V1 ERC-1155 artifacts are transferable by default. Identity-only restrictions are a V2 ERC-721 problem.**

- Chapter Artifacts, Patron Seal, Protocol Milestones, Liquidity Marks, Legacy Artifacts, Heart Signal → transferable.
- Seat Record → **not minted from `SyndicateArchive1155` V1 under any
  path** (public or admin). ID 2 is a reserved + disabled pointer to a
  future separate ERC-721 (`SyndicateSeatRecord721`). The future
  ERC-721 can be cleanly nontransferable (soulbound) on its own
  terms.

---

## PART K — Supply design (initial token IDs)

Targets only — final values approved per-drop before activation.

| ID | Name                  | Active at launch? | Max supply         | Price target (USDC) | Per-wallet limit | Mint mode      | Reason                                          |
| -: | --------------------- | ----------------- | ------------------ | ------------------- | ---------------- | -------------- | ----------------------------------------------- |
| 1  | The First Signal      | YES               | Capped (e.g. 1000) | $0.50               | 5                | Public         | Affordable early chapter record                 |
| 2  | Seat Record (reserved pointer) | NO (Reserved + disabled in V1) | `0` = LOCKED / NOT MINTABLE | n/a in V1 | n/a | None in V1 — future separate ERC-721 (`SyndicateSeatRecord721`) |
| 3  | Patron Seal           | YES               | Open               | **$5.00** (single tier) | 10               | Public         | Flat support, no tiers, no rank                 |
| 4  | Heart Signal          | NO at launch      | Capped (e.g. 100)  | Free                | 1                | Owner-only initially | Secret discovery proof not solved in V1         |
| 5  | Genesis Sealed        | NO (Owner-only)   | Capped to verified set | Free            | 1                | Owner mint     | Issued after Genesis closes, to verified wallets|
| 6  | First Liquidity Event | NO (Owner-only)   | 1 (or small set)   | Free                | 1                | Owner mint     | Issued after first on-chain LP event            |
| 7  | First Routing Signal  | NO (Owner-only)   | 1 (or small set)   | Free                | 1                | Owner mint     | Issued after first 70/20/10 routing event       |
| 8  | Legacy Era I          | NO (Locked)       | Capped TBD         | Free                | 1                | Owner mint     | Sealed only after the era ends                   |

Patron Seal: **single price**, choose $5 over $9 for V1 — simpler story,
better with the "no wealth-coded tiers" doctrine.

---

## PART L — Events and indexer design (renderer-aware)

V1 emits a small, stable event set. Every UI surface in the Syndicate
that today shows `PENDING NFT CONTRACT` reads these events tomorrow.
See `NFT_ARCHIVE_SOLIDITY_SPEC_V1.md` §5 for canonical signatures.

| Event                              | When                                                          | Indexer consumer                                                       |
| ---------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `ArtifactConfigured`               | Owner creates a per-id Artifact Definition                    | `/registry`, `/archive` (config pill), `/transparency`                 |
| `ArtifactDefinitionUpdated`        | Owner edits a pre-freeze Artifact Definition                  | `/archive` metadata refresh, `/transparency`                           |
| `ArtifactDefinitionFrozen`         | Owner calls `freezeArtifactDefinition(id)`                    | `/archive` "Metadata permanent" badge, `/registry` PERMANENT, `/transparency` immutability anchor |
| `RendererModeUpdated`              | Owner changes `rendererMode` (V1: stays `ONCHAIN_SVG`/`NONE`) | `/archive` renderer pill, `/transparency` (warns on unexpected `EXTERNAL_URI`) |
| `DropActiveChanged`                | Owner toggles a token-id's active flag                        | `/archive` truth-state flip, `/my-syndicate` claim panel, `/activity`  |
| `ArtifactMinted`                   | Any successful mint                                           | `/activity`, `/my-syndicate`, `/registry`, `/transparency`             |
| `TreasuryUpdated`                  | Treasury address changed                                      | `/transparency`                                                        |
| `USDCWithdrawn`                    | Owner withdraws contract USDC balance                         | `/transparency`, `/registry` lifetime proceeds (separate from 70/20/10)|
| `RoyaltyUpdated`                   | Default royalty changed                                       | `/transparency`, `/registry`                                           |
| `WalletLimitUpdated` / `PriceUpdated` / `OwnerOnlyUpdated` | Narrow setter calls                  | `/transparency` audit trail                                            |
| `Paused()` / `Unpaused()`          | Owner pauses or unpauses mint                                 | `/archive` global banner, `/transparency`                              |

The Archive Indexer (`src/lib/archive-indexer.ts`) flips from
`MockArchiveIndexer` to a live implementation by reading these events
through a subgraph or direct logs query. Call sites do not change.

---

## PART M — Security checklist (mandatory before mainnet)

Unit + invariant tests must cover, at minimum:

- Cannot mint an inactive token ID.
- Cannot mint past `maxSupply[id]`.
- Cannot mint past `perWalletLimit[id]` (tracked via `_mintedByWallet[id][wallet]`).
- Cannot mint when `price[id] > 0` without sufficient USDC allowance.
- Cannot mint if USDC `transferFrom` reverts.
- Pause blocks `mint` and `mintBatch`.
- Only owner can `configureArtifact`, `updateArtifactDefinition`, `setRendererMode`, `setDropActive`, `freezeArtifactDefinition`, `setTreasury`, `setDefaultRoyalty`, `withdrawUSDC`, `adminMint`.
- `setURI` reverts if the URI is frozen.
- `setTreasury(0)` reverts.
- `withdrawUSDC(to=0)` reverts.
- `uri(id)` returns per-id URI when set; falls back to default URI otherwise.
- `royaltyInfo(id, salePrice)` returns receiver + 5% by default.
- Free mint (`price == 0`) succeeds and skips USDC transfer.
- Public mint emits `ArtifactMinted` with correct args.
- Admin mint emits `ArtifactMinted` with correct args.
- `supportsInterface` returns true for ERC-165, ERC-1155, ERC-1155MetadataURI, ERC-2981.

Mandatory invariants:

- **No reentrancy on paid mint.** `nonReentrant` modifier + checks-effects-interactions ordering (update supply + wallet counter *before* calling USDC).
- **No hidden owner-rug.** Owner cannot mint past `maxSupply`. Owner cannot change `maxSupply` downward below current supply, and cannot raise it past a hard ceiling per id.
- **No forced transfer.** No admin function that moves user tokens.
- **No backdoor balance edits.** Only `_mint` / `_burn` / `safeTransferFrom` paths can change balances. (V1 does NOT expose a `burn` to users; can be added in V1.1 if requested.)
- **No surprise mint after `maxSupply` is frozen.** Once a drop is configured + activated, `maxSupply` is the cap.

External pass: at least one independent review (a Solidity peer, an audit
firm, or an experienced founder advisor) before mainnet. Fuji testnet
deployment + dry-run mints on the staging frontend before mainnet.

---

## PART N — Admin / key management

Plain-English rules for the founder.

### What the owner *can* do
- Configure a drop (set max supply, price, per-wallet limit, URI).
- Activate or deactivate a drop.
- Update or freeze a URI (cannot change a frozen URI).
- Admin-mint to a wallet (subject to supply / limit / pause).
- Change the treasury address (with event).
- Change the default royalty bps (with event).
- Withdraw the contract's USDC balance to the treasury.
- Pause / unpause minting.

### What the owner *cannot* do
- Mint past `maxSupply`.
- Edit a frozen URI.
- Move tokens held by users.
- Edit balances directly.
- Set treasury or withdraw to the zero address.
- Change immutable constructor args (USDC address, name, symbol-like fields, hard supply ceilings if defined).

### Key-handling recommendation
- **Deploy from a hardware wallet** (Ledger / Trezor). No browser-extension hot wallet should ever hold ownership.
- **Within ~30 days of deployment, transfer ownership to a Safe (Gnosis Safe) multisig on Avalanche C-Chain.** 2-of-3 is the minimum sensible signer set: founder hardware wallet + a trusted second signer + a cold recovery key stored separately.
- Document the multisig signers and recovery procedure in `docs/` (without exposing keys).
- Pause + URI-freeze powers should remain accessible from the multisig at all times.
- Never share a private key, seed phrase, or signed transaction outside the multisig flow.

This is the difference between "the founder owns the protocol" and "one
laptop compromise ends the protocol."

---

## PART O — Deployment path (no deploy now)

Future path, in order, with explicit founder gates:

1. **Architecture approved** (this document).
2. **Solidity code written** against this spec, in a separate repo (or `contracts/` folder), with NatSpec comments and no surprises.
3. **Unit tests** (Foundry or Hardhat) green; ≥95% line coverage on `SyndicateArchive1155`.
4. **Invariant / fuzz tests** for supply caps, per-wallet caps, reentrancy, pause, frozen URI, treasury non-zero.
5. **Fuji testnet deployment** (Avalanche C-Chain testnet). Verified source on the testnet explorer.
6. **Frontend test against testnet** — staging site reads testnet contract, indexer wiring exercised, all UI states verified end-to-end.
7. **Renderer output test** — for every activatable id, decode `uri(id)`, validate JSON + SVG, confirm required literals; rehearse `freezeArtifactDefinition` flow.
8. **Source verification** on Snowtrace for both testnet and (later) mainnet.
9. **Mainnet deployment** from hardware wallet. Constructor sets USDC, treasury, default royalty.
10. **Registry / Transparency update** — contract address, deployment tx, source link added to `/registry` and `/transparency`, with `LIVE ON AVALANCHE` only for the contract itself, not yet for any artifact.
11. **PENDING NFT CONTRACT → LIVE ON AVALANCHE** flips on Archive surfaces *for the contract*; individual artifacts remain `Active=false` until each one is explicitly activated.
12. **Minting enabled** only after final founder approval, per artifact, one drop at a time.

No step skips. No artifact activates before its URI is set and (preferred) frozen.

---

## PART P — Final recommendation

**One-paragraph V1.** Deploy one immutable, audited contract on Avalanche C-Chain: `SyndicateArchive1155` (OpenZeppelin ERC-1155 + ERC1155Supply + per-id Artifact Definition + on-chain SVG renderer + Ownable + Pausable + ReentrancyGuard + ERC-2981 with a 5% default royalty), accepting USDC payments routed to a dedicated Archive treasury that is separate from Membership Sale 70/20/10. Configure eight initial token IDs but launch only the two we can safely enforce as public mints (The First Signal, Patron Seal, both `ONCHAIN_SVG`); keep Seat Record, Heart Signal, Genesis Sealed, First Liquidity, First Routing, and Legacy Era I inactive or owner-mint-only until their eligibility is real. Render metadata fully on-chain (no IPFS/Arweave in V1), freeze each Artifact Definition before activation, and transfer ownership to a Safe multisig within 30 days.

**Build first**
1. `SyndicateArchive1155` contract per this spec.
2. Foundry test suite + fuzz/invariants.
3. Fuji deployment + end-to-end staging exercise.
4. Metadata pinning pipeline.
5. Mainnet deployment + Snowtrace verification.
6. Activate The First Signal first. Patron Seal second.

**Defer (V2+)**
- ERC-721 `SyndicateSeatRecord` with on-chain-enforceable membership eligibility.
- Merkle / signature gating for automated milestones and LP marks.
- Per-id royalties.
- Optional `burn`.
- Any governance, staking, revenue-share, or yield mechanic — permanently out of scope unless legal posture changes.

**Biggest risks**
1. Owner-key compromise before multisig transfer → mitigated by hardware-wallet deploy + ≤30-day Safe migration.
2. Metadata being mutable when it should be permanent → mitigated by mandatory `freezeArtifactDefinition(id)` on activation.
3. Activating an artifact whose eligibility we cannot enforce on-chain → mitigated by "inactive until enforceable" rule (Parts F + G).
4. Marketing royalties or artifact revenue as "yield" or "returns" → mitigated by banned-copy rules; royalties documented as voluntary marketplace signal only.
5. Coupling to a third party (Zora / Manifold / mint platform) → mitigated by deploying our own contract, period.

**Easiest safe path**
Smallest possible immutable contract → strongest possible test suite → Fuji rehearsal → one cautious mainnet deployment → activate exactly one artifact (The First Signal) → observe one full week → activate Patron Seal → continue per-artifact.

**Exact next step after this architecture doc**
Approve this architecture (or request specific revisions). Once approved,
the next deliverable is `docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md` — a
function-by-function specification (signatures, modifiers, events,
storage layout, error names, gas-conscious notes) that a Solidity author
can implement directly without inventing anything. Still no code in that
step. Code comes one step after.

---

## Decision Lens Verdicts

| # | Lens          | Verdict | Notes                                                                                                                                                  |
| - | ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 | Founder       | ✓       | Founder-readable, simple to own, designed for multisig handover, no perpetual developer dependency.                                                    |
| 2 | Investor      | ✓       | No security-like claims; ERC-2981 framed as a signal, not a revenue line; treasury separated from Membership Sale routing.                             |
| 3 | Growth        | ✓       | Two activatable drops at launch (First Signal, Patron Seal) provide a real on-chain action without overpromising.                                       |
| 4 | Behavioral    | ✓       | Inactive states are honest, not artificial scarcity; activation is event-driven and disclosed.                                                          |
| 5 | UX            | ✓       | UI vocabulary (`PENDING NFT CONTRACT` / `LIVE ON AVALANCHE`) maps 1:1 to contract events; no new states invented.                                       |
| 6 | Product       | ✓       | One contract, schema-stable token IDs, evolvable via `configureDrop` without redeploy. Composes with `archive-truth-states.ts` + `archive-indexer.ts`.  |
| 7 | Staff Eng     | ✓       | OZ-only dependencies, CEI + ReentrancyGuard, immutable design, freezable URIs, fuzz + invariants required before mainnet.                              |
| 8 | QA            | ✓       | Explicit pre-mainnet checklist (Part M); Fuji rehearsal required; per-drop activation gates.                                                            |
| 9 | A11y          | ✓       | Architecture-only doc; downstream UI continues to use existing semantic patterns. No regressions introduced.                                            |
| 10| SEO           | ✓       | Internal doc; no public surface changes. `/archive` remains the canonical indexable surface; activation later strengthens (does not weaken) page truth. |

**Overall:** 10 ✓ / 0 ⚠ / 0 ✗ — proposal passes the constitutional gate as an *architecture approval*. No code, no deployment, no UI changes authorised by this document.

---

## Architecture revision note (2026-06-06)

Decision **B1 is CLOSED**: V1 uses on-chain generated JSON + SVG by
default; `EXTERNAL_URI` is reserved as future fallback only. Part H and
Part L above have been revised accordingly. The Solidity spec
(`NFT_ARCHIVE_SOLIDITY_SPEC_V1.md`) replaces the prior `freezeURI(id)`
model with `freezeArtifactDefinition(id)` over the full per-id
Artifact Definition struct. See also:

- `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md`
- `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`
- `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md`
- `docs/SMART_CONTRACT_DECISIONS_PENDING.md`
