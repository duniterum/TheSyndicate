# Archive Engine — Foundation Spec (pre-contract phase)

> SYN is the seat. NFT Artifacts are the memory.
>
> This spec defines the **permanent foundation** that the future NFT
> Archive smart-contract system will plug into. Nothing in this spec
> requires a deployed contract today, but every surface, badge, label,
> and data shape is designed so that contract integration is almost
> plug-and-play.

Companion documents:

- `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md` — what is live, derived, pending, roadmap (per claim).
- `docs/SMART_CONTRACTS_DEFERRED.md` — what we are intentionally NOT building yet, and why.
- `docs/STEP_BY_STEP_FROM_HERE.md` — exact next-phase steps once contracts are authorized.

---

## 1. Four permanent protocol-truth states

The site speaks exactly four public labels. They are permanent — they
will not be renamed when the Archive contract ships. They are defined in
code at `src/lib/archive-truth-states.ts`.

| Label                          | Code constant                | When to use                                                                 |
| ------------------------------ | ---------------------------- | --------------------------------------------------------------------------- |
| `LIVE ON AVALANCHE`            | `LIVE_ON_AVALANCHE`          | Deployed contract, public wallet, explorer link, or live RPC read.          |
| `DERIVED FROM ON-CHAIN DATA`   | `DERIVED_FROM_ON_CHAIN_DATA` | Computed from a live on-chain read or indexed Avalanche event.              |
| `PENDING NFT CONTRACT`         | `PENDING_NFT_CONTRACT`       | Requires the NFT Archive contract. Not deployed; nothing mintable today.    |
| `ROADMAP`                      | `ROADMAP`                    | Future concept. No deployed contract or enforceable eligibility today.      |

The artifact-layer vocabulary (`PENDING_CONTRACT`, `PENDING_ELIGIBILITY`,
`LOCKED`, `SECRET`) is a **presentation refinement of**
`PENDING_NFT_CONTRACT` — it never escapes that bucket until the Archive
contract is deployed. See `truthStateForArtifactStatus()`.

### Decision rubric for every Archive surface

For every badge, label, FAQ answer, timeline row, wallet state, and
artifact card, ask:

> "What future contract or indexer will eventually provide this data?"

| Answer                                | Label today                     |
| ------------------------------------- | ------------------------------- |
| Current Avalanche data                | `LIVE ON AVALANCHE`             |
| Calculated from current Avalanche data | `DERIVED FROM ON-CHAIN DATA`    |
| The future Archive NFT contract       | `PENDING NFT CONTRACT`          |
| Unknown / unscoped                    | `ROADMAP`                       |

If the answer is unknown, the surface MUST be marked `ROADMAP` — never
invented, never quietly upgraded.

---

## 2. Future-binding shape (engineering contract)

Every surface that today renders `PENDING_NFT_CONTRACT` or `ROADMAP`
declares — in code — the shape of the future data that will replace it.
This is the engineering contract that makes smart-contract integration
almost plug-and-play. See `CATEGORY_FUTURE_BINDING` in
`src/lib/archive-truth-states.ts`.

```ts
type FutureBinding = {
  providerKind: "archive-nft-contract" | "indexer" | "membership-sale-contract"
              | "syn-erc20" | "lp-pair" | "routing-wallet"
              | "off-chain-registry" | "tbd";
  eventOrCall: "balanceOf" | "ownerOf" | "tokenOfOwnerByIndex" | "tokenURI"
             | "Transfer" | "Mint" | "TokensPurchased" | "ChapterSealed"
             | "MilestoneReached" | "LPEvent" | "ArtifactMinted"
             | "ArtifactClaimed" | "tbd";
  eligibility: "open-to-all" | "wallet-balance" | "purchase-history"
             | "chapter-of-joining" | "lp-position" | "milestone-trigger"
             | "discovery" | "none";
  dataShape?: Record<string, "address" | "uint256" | "bytes32" | "string" | "bool">;
  note?: string;
};
```

### Per-category future bindings (today)

All bindings below resolve to `PENDING NFT CONTRACT` today. Each row is
the exact shape the future contract / indexer must produce so that the
existing UI keeps rendering without redesign.

| Category id          | providerKind            | eventOrCall        | eligibility          | Core data shape (excerpt)                                            |
| -------------------- | ----------------------- | ------------------ | -------------------- | -------------------------------------------------------------------- |
| `chapter`            | `archive-nft-contract`  | `ArtifactMinted`   | `chapter-of-joining` | tokenId, chapterId, owner, tokenURI                                  |
| `seat-record`        | `archive-nft-contract`  | `ArtifactClaimed`  | `purchase-history`   | tokenId, memberNumber, chapterId, blockHeight, buyer, purchaseTxHash |
| `founder-mark`       | `archive-nft-contract`  | `ArtifactMinted`   | `purchase-history`   | tokenId, recipient, reason                                           |
| `milestone`          | `archive-nft-contract`  | `MilestoneReached` | `milestone-trigger`  | tokenId, milestoneId, triggerTxHash                                  |
| `liquidity`          | `lp-pair`               | `LPEvent`          | `lp-position`        | tokenId, lpEventTxHash, jlpBalanceAtBlock                            |
| `protocol-milestone` | `archive-nft-contract`  | `MilestoneReached` | `milestone-trigger`  | tokenId, milestoneId, proofTxHash                                    |
| `patron`             | `archive-nft-contract`  | `ArtifactMinted`   | `open-to-all`        | tokenId, supporter, amountUsdc                                       |
| `secret`             | `archive-nft-contract`  | `ArtifactClaimed`  | `discovery`          | tokenId, finder, secretId                                            |
| `legacy`             | `archive-nft-contract`  | `ArtifactMinted`   | `purchase-history`   | tokenId, chapterId, sealedAtBlock                                    |

---

## 3. Surface → state mapping (audit grid)

This grid is the contract between today's UI and tomorrow's contract.
Every surface listed here MUST render exactly the state in column 3
today, and MUST be upgradable in-place without a redesign once the
contract ships.

| Surface                                                | Data point                            | Today                          | After contract ships                    | Future provider                          |
| ------------------------------------------------------ | ------------------------------------- | ------------------------------ | --------------------------------------- | ---------------------------------------- |
| Hero — "SYN is the seat"                               | SYN contract deployed                 | `LIVE ON AVALANCHE`            | `LIVE ON AVALANCHE`                     | SYN ERC20                                |
| Hero — "your seat is verifiable on Avalanche"          | Wallet SYN balance                    | `LIVE ON AVALANCHE`            | `LIVE ON AVALANCHE`                     | `syn-erc20.balanceOf`                    |
| Hero — Membership Sale                                 | Sale contract                         | `LIVE ON AVALANCHE`            | `LIVE ON AVALANCHE`                     | Membership Sale                          |
| /archive status strip — LIVE NOW                       | Sale, SYN, routing, chapter           | `LIVE ON AVALANCHE` / `DERIVED`| same                                    | Multiple                                 |
| /archive status strip — PENDING                        | Seat Record, Chapter, Patron, Heart   | `PENDING NFT CONTRACT`         | `LIVE ON AVALANCHE`                     | `archive-nft-contract`                   |
| /archive — "What is verifiable today" cards            | Live reads                            | `LIVE ON AVALANCHE` / `DERIVED`| same                                    | Multiple                                 |
| /archive — "What is pending" cards                     | Future artifact types                 | `PENDING NFT CONTRACT`         | `LIVE ON AVALANCHE`                     | `archive-nft-contract`                   |
| /archive — Future NFT Artifact Types (9 categories)    | Per-category mint state               | `PENDING NFT CONTRACT` (refined to `LOCKED`/`SECRET`/`PENDING ELIGIBILITY` for presentation) | `LIVE ON AVALANCHE` (per artifact) | See §2 grid |
| /my-syndicate — Membership facts                       | Purchase history                      | `LIVE ON AVALANCHE` / `DERIVED`| same                                    | Membership Sale `TokensPurchased`        |
| /my-syndicate — Seat Record timeline                   | Future NFT ownership                  | `PENDING NFT CONTRACT`         | `LIVE ON AVALANCHE`                     | `archive-nft-contract.ownerOf` + `tokenURI` |
| /my-syndicate — wallet NFT inventory                   | Owned artifacts                       | `PENDING NFT CONTRACT`         | `LIVE ON AVALANCHE`                     | `archive-nft-contract.tokenOfOwnerByIndex` |
| HomeArchiveTeaser                                      | Pending artifact preview              | `PENDING NFT CONTRACT`         | `LIVE ON AVALANCHE` (counts/inventory) | `archive-nft-contract`                   |
| Heart Signal modal                                     | Secret discovery state                | `PENDING NFT CONTRACT` / `SECRET` | `LIVE ON AVALANCHE`                  | `archive-nft-contract.ArtifactClaimed`   |
| FAQ — "Are any NFTs live today?"                       | Contract deployed                     | `PENDING NFT CONTRACT`         | answer flips to "Yes"                   | `archive-nft-contract`                   |
| Registry — NFT Contract row                            | Contract address                      | `PENDING NFT CONTRACT`         | `LIVE ON AVALANCHE`                     | `archive-nft-contract`                   |
| Transparency — NFT routing rules                       | Patron Seal proceeds routing          | `ROADMAP`                      | `LIVE ON AVALANCHE`                     | Routing wallet / sale contract           |
| Activity feed — Mint events                            | `ArtifactMinted` / `Transfer`         | `ROADMAP`                      | `LIVE ON AVALANCHE`                     | Indexer                                  |
| Wallet state — "you own N artifacts"                   | NFT inventory                         | `PENDING NFT CONTRACT`         | `LIVE ON AVALANCHE`                     | `archive-nft-contract.balanceOf` + enumeration |

---

## 4. Legal & truth invariants (never change)

These constraints survive every future phase. They are constitutional.

- Artifacts are collectible records only. **Not** equity, debt, Vault
  ownership, dividend instruments, revenue share, governance rights, or
  promises of profit. Participation may result in total loss.
- Status is **positional**, never wealth-coded.
- `mint`, `claim`, `available`, `owned`, `holder count`, `holder rights`,
  `reward`, `yield`, `dividend`, `revenue share`, `investment`,
  `guaranteed value`, `Vault entitlement` are **banned** until the
  Archive contract is deployed AND a Vault ownership / revenue mechanism
  is independently authorized (which it is not).
- No metric is invented. PENDING means PENDING — never estimated.
- Patron Seal is **flat, single amount** — no tiers, no ranks.

---

## 5. Plug-and-play upgrade checklist (when contracts ship)

When the Archive contract is authorized and deployed, the only code
changes required are:

1. Add the deployed contract address to `src/lib/syndicate-config.ts`
   under a new `ARCHIVE_NFT_CONTRACT_ADDRESS` constant.
2. In `src/lib/archive-truth-states.ts`:
   - Implement the body of `resolveTruthState()` to read the indexer.
   - Replace `providerKind: "tbd"` rows in `CATEGORY_FUTURE_BINDING`
     with the live values (already filled in for the launch set).
3. Add an indexer hook (e.g. `useArchiveInventory(wallet)`) that reads
   `balanceOf` + `tokenOfOwnerByIndex` + `tokenURI`.
4. Per-category surfaces import `useArchiveInventory` and flip their
   `truthState` from `PENDING_NFT_CONTRACT` to `LIVE_ON_AVALANCHE` /
   `DERIVED_FROM_ON_CHAIN_DATA` without changing layout or copy.
5. FAQ answer for "Are any NFTs live today?" flips to "Yes" with the
   deployed contract address.
6. Registry row swaps `PENDING NFT CONTRACT` → live contract address +
   explorer link.

No layout migration, no copy rewrite, no rename of badges.

---

## 6. What is intentionally NOT in scope today

See `docs/SMART_CONTRACTS_DEFERRED.md` for the full list. Headlines:

- No smart contracts deployed.
- No mint UI, no claim UI, no admin panel.
- No Merkle, staking, randomness, royalties, marketplace.
- No revenue share, governance, dividend, NFT utility logic.
- No changes to Membership Sale, USDC 70/20/10 routing, Chapters, Vault,
  Liquidity, Registry, Transparency, Activity sources, or Dashboard
  data logic.
