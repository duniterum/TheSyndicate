# Current Solidity Review State — SyndicateArchive1155 V1

**Status:** 🟢 DEPLOYED ON AVALANCHE MAINNET · 🔍 VALIDATION PHASE (2026-06-06)
**Contract address:** `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d`
**Doctrine:** SYN is the seat. NFT Artifacts are the memory.

> Update 2026-06-06: `SyndicateArchive1155` has been **deployed** to
> Avalanche mainnet. Review has moved from "pre-code" to
> **on-chain validation**. No artifact id is **activated** yet — the
> contract is DEPLOYED, not LIVE for public mint. See
> `docs/DEPLOYMENT_STATE_V1.md` (deployment + validation + activation
> checklists) and `docs/CONTRACT_INTEGRATION_STATUS.md` (per-id and
> per-surface tracker).

This document pins the locked architecture for the
`SyndicateArchive1155` V1 contract. It does not introduce new product
features and does not authorize activation of any drop.

---

## 1. Review ownership

Kemal + ChatGPT are now reviewing the **production-candidate Solidity
contract** for `SyndicateArchive1155` against the frozen specification
in this repo.

- **Lovable MUST NOT generate Solidity** unless explicitly asked.
- **Lovable MUST NOT deploy** anything.
- **Lovable MUST NOT** add product features, UI surfaces, mint flows,
  admin panels, simulated previews, or invented contract addresses
  ahead of deployment.
- The next required step is **compile + tests** against the spec, not
  new product design.

If a future request appears to contradict this, treat it as a possible
context-loss event: re-read this file, `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`,
and `docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md` before acting.

---

## 2. Locked architecture (binding)

### 2.1 Doctrine
- **SYN is the seat. Artifacts are the memory.**
- `SyndicateArchive1155` V1 is **artifacts-only**.
- Seat Records are **NOT** ERC-1155 artifacts in V1. They ship later in
  a separate ERC-721 contract (working name
  `SyndicateSeatRecord721` / `SyndicateSeatRegistry721`). See
  `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`.

### 2.2 Token ID map (frozen for V1)

| ID  | Name                       | Status in V1                            |
| --- | -------------------------- | --------------------------------------- |
| 1   | The First Signal           | Active candidate (public mint)          |
| 2   | Reserved Seat Record Reference | **Reserved + disabled pointer**     |
| 3   | Patron Seal                | Active candidate (public mint)          |
| 4   | Heart Signal               | Configurable, gated by discovery proof  |
| 5   | Genesis Sealed             | Configurable, milestone-triggered       |
| 6   | First Liquidity Event      | Configurable, milestone-triggered       |
| 7   | First Routing Signal       | Configurable, milestone-triggered       |
| 8   | Legacy Era I               | Configurable, post-seal release         |

### 2.3 ID 2 — reserved + disabled (binding)

ID 2 in `SyndicateArchive1155` MUST behave as a pointer to the future
ERC-721 identity layer. In V1:

- No public mint.
- No admin mint.
- No activation.
- No supply assignment.
- No freeze.
- No definition update beyond the initial reserved placeholder.
- `maxSupply = 0` (LOCKED / MINTING DISABLED — never unlimited).

### 2.4 Contract-wide doctrine

- `maxSupply == 0` means **minting disabled**, never unlimited.
- V1 has **no unlimited minting** for any ID.
- `ownerOnly` does **not** mean unlimited.
- ERC-1155 is for collectible protocol artifacts only.
- On-chain SVG + on-chain JSON is the V1 metadata direction
  (`RendererMode.ONCHAIN_SVG` default; `EXTERNAL_URI` reserved as
  future fallback only).
- **No IPFS / Arweave dependency for V1 public artifacts.**
- No burn, no batch mint, no Merkle allowlist, no staking, no revenue
  share, no governance, no Vault claim, no LP ownership, no financial
  rights of any kind.

---

## 3. Test alignment (must pass before mainnet)

The Solidity test suite MUST include, at minimum, the following
invariants. These are derived from the frozen spec
(`docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md`) and the Seat Record decision
(`docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`).

### 3.1 ID 2 — reserved + disabled
1. `mint(2, …)` reverts.
2. `adminMint(_, 2, _)` reverts.
3. Any path that would set `maxSupply` for ID 2 (e.g. `configureArtifact`,
   `updateArtifactDefinition`) reverts or refuses to set it above 0.
4. `freezeArtifactDefinition(2)` reverts (a disabled placeholder is not
   freezable — there is nothing to freeze).
5. `setDropActive(2, true)` reverts.
6. `remainingSupply(2)` returns `0`.
7. `uri(2)` returns the reserved/disabled metadata payload (either a
   data-URI describing the reserved state, or a controlled revert
   `URINotReady(2)` — final shape per the spec).

### 3.2 Contract-wide
8. `maxSupply == 0` disables minting for **all** IDs (`mint`, `adminMint`,
   `remainingSupply` all behave consistently).
9. IDs 1 and 3 can be configured, frozen, activated, and minted end-to-end.
10. The on-chain JSON returned by `uri(id)` for an active, frozen ID
    decodes as valid JSON and embeds a valid `data:image/svg+xml;base64,…`
    image.
11. `ERC1155Supply.totalSupply(id)` equals the contract's internal
    `totalMinted(id)` after every successful `mint` / `adminMint`.
12. USDC payment uses Avalanche **native USDC** (6 decimals) at the
    address pinned in the spec (decision D3).

Any additional tests required by the spec take precedence over this
list; this list is the floor, not the ceiling.

---

## 4. Aligned documents

The following docs were checked and are consistent with the state above
as of 2026-06-06:

- `docs/NFT_ARCHIVE_SMART_CONTRACT_ARCHITECTURE_V1.md`
- `docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md`
- `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md`
- `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`
- `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md`
- `docs/SMART_CONTRACT_DECISIONS_PENDING.md`
- `docs/SMART_CONTRACTS_DEFERRED.md`
- `docs/ARCHIVE_ENGINE_V1.md`
- `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md`
- `docs/STEP_BY_STEP_FROM_HERE.md`
- `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`
- `docs/VISION.md`
- `docs/CONSTITUTION_SUMMARY.md`

No contradictions were found in the public site copy or whitepaper /
FAQ sources that reference Seat Records: they already describe Seat
Records as a future, separate identity layer (`PENDING NFT CONTRACT`)
and do not promise V1 ERC-1155 mint behaviour.

---

## 5. What changes next

1. Kemal + ChatGPT complete review of the production-candidate
   `SyndicateArchive1155.sol`.
2. Compile + run the test suite above (plus spec-required tests).
3. Resolve any remaining rows in
   `docs/SMART_CONTRACT_DECISIONS_PENDING.md` (C1 royalty %, C5
   license, D2/D3/D6 addresses + signer threshold, §8.7 initial
   `rendererMode` for IDs 4–7).
4. Fuji rehearsal → independent audit → mainnet deployment.
5. Only then does Lovable wire `ARCHIVE_NFT_CONTRACT_ADDRESS` and flip
   the relevant surfaces from `PENDING NFT CONTRACT` to
   `LIVE ON AVALANCHE` / `DERIVED FROM ON-CHAIN DATA` per
   `docs/STEP_BY_STEP_FROM_HERE.md` Phase 3.
