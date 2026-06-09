# Smart Contract — Decisions Pending (close before Solidity)

**Status:** OPEN DECISION LIST · NO CODE UNTIL CLOSED
**Doctrine:** SYN is the seat. NFT Artifacts are the memory.

This document is the actionable, single-page list of decisions that must
be closed **before** any Solidity is written for `SyndicateArchive1155`.

Each row has: current recommendation · reason · risk · final answer
needed from. Sign-off is "Founder" unless otherwise noted.

Companion docs:
- `docs/NFT_ARCHIVE_SMART_CONTRACT_ARCHITECTURE_V1.md`
- `docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md`
- `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`
- `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md`
- `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md`

---

## A. Standards and shape

| # | Decision | Recommendation | Reason | Risk if wrong | Sign-off |
| - | -------- | -------------- | ------ | ------------- | -------- |
| A1 | ERC-1155 only for V1? | **Yes** | One contract, multiple ids, audited base. | Locks out unique per-token data; mitigated by ids. | Founder |
| A2 | Future ERC-721 Seat Record? | **✅ CLOSED (2026-06-06) — YES, separate ERC-721 (`SyndicateSeatRecord721`).** Seat Records ship later in a separate contract. Token ID 2 in `SyndicateArchive1155` stays as a reserved + disabled pointer (`active = false`, `maxSupply = 0` = LOCKED). See `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`. | Each member receives a unique record — natural ERC-721 shape. ERC-1155 is correct for edition-style artifacts only. | Confusion if Seat Record looks "claimable" in V1. | Founder |

## B. Renderer / metadata (this is the BIG one)

| # | Decision | Status | Final answer | Reason |
| - | -------- | ------ | ------------ | ------ |
| B1 | Renderer model for V1 | **✅ CLOSED (2026-06-06)** | **MIXED — `ONCHAIN_SVG` is the V1 default. `EXTERNAL_URI` is reserved as future fallback for complex art only. `NONE / LOCKED` is the explicit pre-activation state. No IPFS / Arweave dependency for The First Signal or Patron Seal in V1 unless the on-chain renderer proves impossible during implementation.** | Permanent protocol memory layer must work even if the website is down and without ongoing pinning/Arweave operations. V1 art is simple generated certificates / seals / cards, not heavy uploaded images. |
| B2 | Pixel-style SVG renderer? | ✅ CLOSED | **Yes for Heart Signal and any future pixel artifacts.** Same on-chain renderer engine, pixel template family. | Visual variety, single engine. |
| B3 | External URI fallback enabled in V1? | ✅ CLOSED | **Reserved but not used.** The contract MUST support `RendererMode.EXTERNAL_URI` for future complex art, but no V1 token id ships in that mode. Switching a token id to `EXTERNAL_URI` requires explicit founder approval and is blocked once that id's Artifact Definition is frozen. | Keep optionality open; prevent accidental V1 leakage to off-chain hosts. |
| B4 | Freeze mechanism | ✅ CLOSED | **`freezeArtifactDefinition(id)` is one-way.** Replaces the old `freezeURI(id)`. Once frozen for an id, neither the per-id Artifact Definition (name, category, description, visual family, chapter, palette, icon/template id, supply, walletLimit, priceUsdc, ownerOnly, rendererMode) nor the renderer's output for that id may change. | Constitutional invariant: memory must not mutate. |

## C. Economic parameters

| # | Decision | Recommendation | Reason | Risk if wrong | Sign-off |
| - | -------- | -------------- | ------ | ------------- | -------- |
| C1 | Royalty % (ERC-2981) | **TBD (0% or 2.5–5%)** | Either is defensible. | Higher % can deter secondary. | Founder |
| C2 | Supply cap — The First Signal | **10,000 (proposed)** | Round, memorable, scarce-but-real. | Too tight → FOMO; too loose → meaningless. | Founder |
| C3 | Patron Seal cap | **10,000 (proposed)** | Bounded supply, no tiers, no wealth coding. | Uncapped removes any scarcity signal. | Founder |
| C4 | Per-wallet limit per id | **5 (proposed for IDs 1 and 3)** | Discourages sybil while allowing genuine collectors. | Too tight hurts genuine collectors. | Founder |
| C5 | Metadata + media license | **TBD (CC-BY-NC-4.0 recommended)** | Allows sharing, blocks resale of art. | Wrong license → IP confusion. | Founder + legal |

## D. Custody, treasury, deployment

| # | Decision | Recommendation | Reason | Risk if wrong | Sign-off |
| - | -------- | -------------- | ------ | ------------- | -------- |
| D1 | Safe/multisig timing | **Deploy as EOA, transfer to Safe ≤ 30 days** | Faster launch, safe long-term. | Delay = single-key exposure. | Founder |
| D2 | Treasury wallet address | **NEW dedicated address, distinct from 70/20/10** | Cleaner accounting. | Co-mingling with Vault/Dev/Ops invites confusion. | Founder |
| D3 | USDC address confirmation | **Avalanche C-Chain native USDC** | Standard on Avalanche. | Wrong USDC variant breaks payment. | Founder + Kemal |
| D4 | Mainnet direct deployment? | **No — Fuji rehearsal first** | Cheap; catches the dumb mistakes. | Skipping → live mistakes. | Founder |
| D5 | Fuji optional or skipped? | **Required** | See D4. | Same as D4. | Founder |
| D6 | Owner key management | **Hardware wallet for EOA; Safe co-signers documented** | Standard practice. | Hot key = compromise = total loss. | Founder |

## E. Mint policy

| # | Decision | Recommendation | Reason | Risk if wrong | Sign-off |
| - | -------- | -------------- | ------ | ------------- | -------- |
| E1 | `adminMint` acceptable for early milestones? | **Yes for ids 5–8** | Triggers are operational, not auctioned. | If used for ids 1, 3 → conflict with public mint. | Founder |
| E2 | Seat Record excluded from V1 active minting? | **✅ CLOSED — YES, LOCKED & RESERVED POINTER.** ID 2 in Archive1155: `active = false`, `ownerOnly = true`, `rendererMode = NONE`, `maxSupply = 0` (LOCKED / NOT MINTABLE), `walletLimit = 1`. All mint paths revert. Seat Records ship later in a separate ERC-721 (`SyndicateSeatRecord721`). | Eligibility not enforceable in V1; identity records are an ERC-721 problem. | If enabled prematurely → unverifiable claims. | Founder |
| E3 | Heart Signal mint path | **Admin-mint to verified discoverers OR proof-gated; LOCKED until then** | Discovery is the event. | If openly mintable → no longer secret. | Founder |

---

## 1. Final-answer summary (snapshot)

- **A1:** ERC-1155 only for V1. **(recommend)**
- **A2:** ✅ **CLOSED — separate future ERC-721 (`SyndicateSeatRecord721`). ID 2 in Archive1155 = reserved + disabled pointer.**
- **B1:** ✅ **MIXED — ONCHAIN_SVG default, EXTERNAL_URI reserved, NONE/LOCKED pre-activation. No IPFS/Arweave default for V1.**
- **B2:** ✅ Yes, on-chain pixel SVG template family.
- **B3:** ✅ Reserved but unused in V1.
- **B4:** ✅ `freezeArtifactDefinition(id)`, one-way.
- **C1:** ___ (open)
- **C2:** 10,000 (proposed)
- **C3:** 10,000 (proposed)
- **C4:** 5 (proposed for IDs 1 and 3)
- **C5:** ___ (open, legal)
- **D1:** EOA → Safe within 30 days (recommend)
- **D2:** Dedicated Archive treasury Safe (recommend)
- **D3:** Native USDC on Avalanche C-Chain (recommend)
- **D4:** Fuji first (recommend)
- **D5:** Required (recommend)
- **D6:** Hardware wallet + Safe (recommend)
- **E1:** Yes for IDs 5–8 (recommend)
- **E2:** ✅ **CLOSED — Seat Record LOCKED in Archive1155 V1 (reserved + disabled pointer, `maxSupply = 0`). All mint paths revert. Future separate ERC-721.**
- **E3:** Admin-mint or proof-gated; LOCKED until then (recommend)

### Contract-wide V1 rule (binding, derived from A2 + E2)

`maxSupply == 0` means **LOCKED / NOT MINTABLE** for V1. It does **NOT**
mean unlimited. There is no unlimited minting in V1. Every public drop
has `maxSupply > 0`; every owner-only drop that ever mints in V1 also
has `maxSupply > 0`. `configureArtifact` rejects any public drop with
`maxSupply == 0`. `mint` and `adminMint` both revert
(`ExceedsMaxSupply`) when `maxSupply == 0`.

When the remaining `C1`, `C5` (and confirmation of the proposed values
in C2–C4, D-row, E-row) are closed, this document is the input to the
Solidity author. The renderer-architecture rows (B1–B4) are now
**LOCKED** and may not be reopened without rebooting the Archive spec.

---

## 2. Instructions for future AI sessions

- B1 is closed: **on-chain SVG is the V1 default**. Do not propose
  Arweave/IPFS as the V1 default for The First Signal or Patron Seal.
- Do not silently switch a token id to `EXTERNAL_URI`. That mode is
  reserved future fallback and requires explicit founder approval.
- Do not invent caps, royalties, or addresses.
- Do not enable Seat Record minting under any condition in V1.
- Do not write Solidity until the remaining open rows are closed.

---

## Current Solidity Review State (2026-06-06)

Kemal + ChatGPT are reviewing the production-candidate Solidity
contract. **Lovable MUST NOT generate Solidity** unless explicitly
asked. Next step is compile + tests, not new product design. See
`docs/SOLIDITY_REVIEW_STATE.md` for the full locked state, ID-2 rules,
and required test invariants.

## Deployment Update (2026-06-06)

`SyndicateArchive1155` is **DEPLOYED** on Avalanche mainnet at
`0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d`. Open decisions below
(C1 royalty %, C5 license, D2/D3/D6 addresses + signer threshold,
§8.7 initial `rendererMode` for IDs 4–7) must now be reconciled
against on-chain values during the validation phase. Record results in
`docs/CONTRACT_INTEGRATION_STATUS.md` §1. No id may be activated until
its decisions are closed and validated on-chain.
