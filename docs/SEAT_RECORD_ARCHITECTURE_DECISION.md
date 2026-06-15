# Final Seat Record Architecture Decision

**Status:** ✅ LOCKED (2026-06-06) · binding across all Archive docs
**Doctrine:** SYN is the seat. Artifacts are the memory.

---

## 1. Decision

Seat Records **MUST NOT** be active ERC-1155 artifacts in
`SyndicateArchive1155` V1.

The final architecture is:

- **`SyndicateArchive1155` V1** = collectible **protocol artifacts only**
  (Chapter Artifacts, Patron Seal, Heart Signal, Genesis Sealed, First
  Liquidity Event, First Routing Signal, Legacy Era I).
- **Seat Records** = future, **separate ERC-721 contract**, likely named
  `SyndicateSeatRecord721` or `SyndicateSeatRegistry721`, deployed at a
  new address once eligibility is enforceable on-chain.
- **Token ID 2 in `SyndicateArchive1155`** remains **reserved and
  disabled** in V1 as a stable pointer / reference to the future
  `SeatRecord721`. It is never publicly mintable; it is never
  admin-mintable; it never resolves a `uri(id)`.

## 2. Reason

A Seat Record is an **identity record**, not an edition-style
collectible. Each member receives a *unique* record:

- Member #1
- Member #2
- Member #100
- Member #10,000
- …

That is naturally an ERC-721 shape — one unique token per seat, with
its own provenance and history. ERC-1155 is the correct shape for the
edition-style artifacts above. Mixing identity into the same edition
contract is the wrong abstraction and creates unenforceable eligibility
checks in V1.

## 3. V1 enforcement (binding for `SyndicateArchive1155`)

For token ID 2 inside `SyndicateArchive1155`:

| Field              | Value                                  |
| ------------------ | -------------------------------------- |
| `configured`       | `true` (reserved in catalog)           |
| `active`           | `false` (never public mintable in V1)  |
| `ownerOnly`        | `true`                                 |
| `rendererMode`     | `NONE` (LOCKED — `uri(2)` reverts)     |
| `maxSupply`        | `0` → LOCKED / NOT MINTABLE            |
| `walletLimit`      | `1` (placeholder; irrelevant while locked) |
| `priceUsdc`        | `0` (n/a)                              |
| `definitionFrozen` | `false` (a disabled placeholder is not frozen) |

Required contract behaviour:

- `mint(2, …)` MUST revert (`DropInactive` or `OwnerOnlyDrop`).
- `adminMint(_, 2, _)` MUST revert (`ExceedsMaxSupply` because
  `maxSupply == 0`).
- `uri(2)` MUST revert `URINotReady(2)`.
- `setDropActive(2, true)` MUST revert
  (`OwnerOnlyCannotBePublic` or `RendererNotReady` or
  `DefinitionNotFrozen` — any of the three is sufficient).

## 4. Contract-wide rule (no unlimited minting in V1)

`maxSupply == 0` **means LOCKED / NOT MINTABLE** for V1. It does **NOT**
mean unlimited. The Solidity spec enforces:

- `_checkSupply` (or equivalent) reverts when `maxSupply == 0`.
- `mint` reverts when `maxSupply == 0`.
- `adminMint` reverts when `maxSupply == 0`.
- `remainingSupply(id)` returns `0` when `maxSupply == 0`.
- `configureArtifact` rejects any *public* drop with `maxSupply == 0`.
- Owner-only drops also require `maxSupply > 0` before any mint can
  succeed (admin distribution to a closed set of wallets still has a
  cap).
- No V1 artifact is unlimited. Every ID that ever mints in V1 has
  `maxSupply > 0`.

## 5. What the future `SyndicateSeatRecord721` will likely store

Designed separately, audited separately, deployed separately. Likely
fields (non-binding sketch — final shape decided when that contract is
specified):

- member number (unique, monotonic) — **BINDING: sourced from the Holder
  Index (first-seen `TokensPurchased` ordering, de-duplicated by buyer),
  the master identity record. It MUST NOT be minted from the raw Sale V2
  `memberCount` / `memberNumberOf` counters, which are a sale-side
  convenience sequence, not the canonical identity.**
- original purchasing wallet
- first purchase tx hash
- first purchase block height
- chapter joined
- timestamp
- linked-wallet policy (if added) — strict rules, on-chain enforced

**Identity source (binding).** When `SyndicateSeatRecord721` is built, each
seat's member number is assigned from the **Holder Index** — the same
first-seen `TokensPurchased` ordering the website already treats as the
single source of member identity (see `docs/HOLDER_INDEX_ARCHITECTURE.md`
and `.agents/memory/identity-hierarchy-freeze.md`). Sale V2's on-chain
`memberCount` / `memberNumberOf` may *corroborate* a seat but is never the
identity of record; the two must reconcile **to** the Holder Index, not the
reverse.

No Seat Record minting happens until this contract is designed,
specified, tested, audited, and deployed separately from
`SyndicateArchive1155`. Until then, every Syndicate surface continues
to display Seat-Record-related state as `PENDING NFT CONTRACT`.

## 6. Allowed wording (everywhere in the project)

- "Seat Records are reserved for a future ERC-721 identity contract."
- "Archive1155 V1 records collectible protocol artifacts."
- "ID 2 is reserved and disabled in V1."
- "SYN is the seat. Artifacts are the memory."

## 7. Forbidden wording (anywhere in the project)

- Seat Record is active in Archive1155 V1.
- Seat Record can be publicly minted in V1.
- `maxSupply == 0` means unlimited.
- ERC-1155 Seat Record is the final architecture.
- Front-end eligibility alone is enough for Seat Records.
- Seat Record member numbers are minted from the raw Sale V2 `memberCount`
  / `memberNumberOf` (the Holder Index is the identity of record).
- Token ID 2 in `SyndicateArchive1155` is an identity source or a member
  key (it is only a disabled pointer / reference to the future ERC-721).

## 8. Cross-references

Updated to match this decision:

- `docs/NFT_ARCHIVE_SMART_CONTRACT_ARCHITECTURE_V1.md` (Part B, Part G)
- `docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md` (§1.4, §2, §3.4, §3.6, §3.17, §8, §10)
- `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md` (§1, §2 ID 2, §4)
- `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`
- `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md`
- `docs/SMART_CONTRACT_DECISIONS_PENDING.md` (A2, E2 → CLOSED)
- `docs/SMART_CONTRACTS_DEFERRED.md`
- `docs/ARCHIVE_ENGINE_V1.md`
- `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md`
- `docs/STEP_BY_STEP_FROM_HERE.md`
- `docs/VISION.md`
- `docs/CONSTITUTION_SUMMARY.md`
