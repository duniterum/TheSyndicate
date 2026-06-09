> **Historical note:** this document predates Patron Seal activation. ID 3 Patron Seal is now **LIVE on-chain**. The row below that says "Patron Seal public mint · Configured on Archive1155 but not active" reflects a previous state. See `docs/REALITY_REFLECTION_AUDIT.md` and `/protocol-health` for current truth.

# NFT Archive — Verifiability Matrix

Single source of truth for what is live, derived, pending, and future
around the NFT Archive. Every visitor-facing copy line about the Archive
must trace back to a row in this matrix.

Doctrine: **SYN is the seat. NFT Artifacts are the memory.**

These four labels are **permanent protocol-truth states**, not
temporary UX badges. They are defined in code at
`src/lib/archive-truth-states.ts` and they are the same labels the
future NFT Archive smart-contract system and its indexer will plug
into. See `docs/ARCHIVE_ENGINE_SPEC.md` for the engineering contract,
`docs/SMART_CONTRACTS_DEFERRED.md` for what is intentionally not
built yet, and `docs/STEP_BY_STEP_FROM_HERE.md` for the next phase.

| Label                          | Code constant                  | Meaning                                                                                      | Future provider once live                                |
| ------------------------------ | ------------------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `LIVE ON AVALANCHE`            | `LIVE_ON_AVALANCHE`            | Backed by a deployed contract, public wallet address, explorer link, or direct on-chain read | Deployed contract / wallet / RPC read                    |
| `DERIVED FROM ON-CHAIN DATA`   | `DERIVED_FROM_ON_CHAIN_DATA`   | Computed from a live on-chain read or indexed event                                          | Indexer over Avalanche logs                              |
| `PENDING NFT CONTRACT`         | `PENDING_NFT_CONTRACT`         | Requires a separate future NFT contract or companion module that is not deployed             | Future ERC-721 / proof module / companion contract        |
| `ROADMAP`                      | `ROADMAP`                      | Future concept; no deployed contract or enforceable eligibility                              | TBD — only promoted once a provider is named             |

Decision rubric for every Archive surface:

> "What future contract or indexer will eventually provide this data?"
>
> - Current Avalanche data → `LIVE ON AVALANCHE`
> - Calculated from current Avalanche data → `DERIVED FROM ON-CHAIN DATA`
> - A separate future NFT contract / proof module → `PENDING NFT CONTRACT`
> - Unknown / unscoped → `ROADMAP`

---

## A. Live on Avalanche

| Claim                                   | Source                                                                 | Visitor wording                          |
| --------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| SYN token contract                      | `CONTRACTS.SYN_CONTRACT_ADDRESS` (Avascan / Sourcify / Routescan)      | "SYN is live on Avalanche"               |
| Membership Sale contract                | `CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS`                           | "Membership Sale is live on Avalanche"   |
| USDC payment token                      | `CONTRACTS.USDC_CONTRACT_ADDRESS`                                      | "Paid in native USDC"                    |
| 70 / 20 / 10 routing wallets            | `CONTRACTS.VAULT_WALLET / LIQUIDITY_WALLET / OPERATIONS_WALLET`        | "Routing wallets verifiable on Avalanche"|
| SYN allocation wallets (7)              | `ALLOCATION_WALLETS`                                                   | "All allocations on public wallets"      |
| Trader Joe SYN/USDC LP pair             | `LP_POOL.pairAddress` + creation tx                                    | "LP pool live on Trader Joe"             |
| `TokensPurchased` events                | Sale ABI indexed via `useHolderIndex`                                  | "Every purchase recorded on-chain"       |
| Wallet SYN balance                      | ERC20 `balanceOf` via wagmi                                            | "Your SYN balance is read live"          |
| Archive1155 contract                    | `ARCHIVE_NFT_CONTRACT_ADDRESS` (Avascan / Sourcify / Routescan)        | "Archive1155 is deployed on Avalanche"   |
| The First Signal mint state             | `getArtifactCore(1)`, `remainingSupply(1)`, `uri(1)` via wagmi         | "ID 1 is live; supply and renderer are read on-chain" |
| The First Signal transaction links      | Valid tx hash → Routescan / Avascan / SnowTrace                        | "Mint and approval transactions are independently inspectable" |

## B. Derived from on-chain data

| Claim                                   | Source / derivation                                                    | Visitor wording                          |
| --------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| Member number                           | Order of first `TokensPurchased` event per wallet                      | "Derived from on-chain data"             |
| Chapter label / progress                | Member count vs chapter capacities in `protocol-truth`                 | "Derived from on-chain data"             |
| Remaining seats in active chapter       | Capacity minus member count                                            | "Derived from on-chain data"             |
| Member count                            | Distinct buyers in `TokensPurchased`                                   | "Derived from on-chain data"             |
| First/latest purchase tx per wallet     | `useHolderIndex` over indexed events                                   | "Derived from on-chain data"             |

## C. Pending separate contracts / modules

Archive1155 exists on-chain today, and ID 1 is active. Items in this bucket
require a separate future contract, verifier, or companion module and must not
imply live ownership, supply, or eligibility.

| Item                              | Reason                                                                |
| --------------------------------- | --------------------------------------------------------------------- |
| Seat Record NFT                   | Separate future ERC-721 not deployed                                  |
| Patron Seal public mint           | Configured on Archive1155 but not active                              |
| Heart Signal / Secret Artifact    | Discovery-proof verifier not deployed                                 |
| Non-ID-1 artifact ownership / holder count | No active drop → nothing live to index                         |
| Non-ID-1 metadata URIs / supply   | Inactive / locked until activation                                    |
| Non-ID-1 mint price as a charge   | Target launch prices are reference values until activation            |
| Enforceable eligibility           | No on-chain eligibility logic exists yet                              |

Safe visitor wording: *"The First Signal is live. Seat Records and all other
artifact families remain inactive or future-contract only."*

## D. Roadmap (future, no deployed contract)

| Item                                          | Status                                                |
| --------------------------------------------- | ----------------------------------------------------- |
| Dynamic Artifact metadata                     | Future                                                |
| LP-linked Liquidity Marks claim flow          | Future                                                |
| Protocol Milestone auto-claim triggers        | Future                                                |
| Secret discovery surface mechanic             | Future                                                |
| NFT ownership index / per-wallet timeline     | Future (after contract is live)                       |
| Royalties / secondary market policy           | Future                                                |
| Admin / config panel                          | Future                                                |

---

## Banned wording (must never appear in NFT Archive copy)

`mint now`, `claim now`, `available now`, `owned artifact`, `holder count`
of Artifacts, `NFT live`, `unlocked` (when contract is not deployed),
`reward`, `benefit`, `utility` (in the financial sense), `holder rights`,
`investment`, `yield`, `revenue share`, `guaranteed value`,
`Vault entitlement`.

## Canonical disclaimer

> Artifacts are collectible records only. They are not equity, debt,
> Vault ownership, dividend instruments, revenue share, governance rights,
> or promises of profit. Participation may result in total loss.

---

## Visual + metadata implications

What can be displayed today:

- The four verifiability labels, the artifact name + category, target
  launch price as a reference value, and any LIVE / DERIVED on-chain
  fact (member#, chapter-of-joining, etc.).

What becomes verifiable only after contract deployment:

- Mint counts, owner wallets, serial numbers, `ArtifactMinted` events,
  per-wallet Archive inventory, `tokenURI` rendering, and any on-chain
  SVG renderer output.

The visual + metadata contracts that the future renderer must satisfy
are frozen in `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md` and
`docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`.

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
