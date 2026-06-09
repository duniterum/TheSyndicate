# Pre-Contract Alignment Audit

Scope: READ-ONLY report. No code written. No contracts proposed in Solidity. No chapter ranges changed. No UI patched. Awaiting founder approval before any of those.

Doctrine locked for this report:
- SYN is the seat. Artifacts are the memory.
- Member number, join order, chapter, rank, wallet history = identity data derived from verified membership.
- `SyndicateArchive1155` = collectible protocol artifacts ONLY.
- Archive1155 ID 2 stays RESERVED / DISABLED in V1, reserved reference for the future ERC-721.
- Future Seat Record = separate contract, working name `SyndicateSeatRecord721`.
- No NFT may imply equity, yield, Vault ownership, LP ownership, dividends, revenue share, or governance.

---

## A. Current deployed contract state

Sourced from `src/lib/syndicate-config.ts`.

| Item | Address / Value |
|---|---|
| SYN token (ERC-20) | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| Membership Sale | `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` |
| Membership Sale deployment block | `87,157,852` |
| Membership Sale creation tx | `0x30e1378a66dc1037d49cb7557a162635f37a90ffde80e973bd9750d39927bdb6` |
| Archive1155 NFT | `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` |
| USDC (mint payment + sale) | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` (native Avalanche USDC) |
| Vault Wallet (70%) | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` (alias: Treasury / Vault Reserve) |
| Liquidity Wallet (20%) | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |
| Operations Wallet (10%) | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |
| Founder Wallet | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| Membership SYN Wallet | `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` (alias: Membership Distribution / "Community") |
| LP pair (Trader Joe v1 SYN/USDC) | `0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389` |
| Network | Avalanche C-Chain (chainId 43114) |

Archive1155 source path and state (`syndicate-config.ts` → `ARCHIVE_CONTRACT_STATE`):
- Solidity source file: **not present in repo** — only ABI (`src/lib/archive-nft-abi.ts`) and config. The contract was deployed externally.
- Verification declared as `sourceVerified: "PENDING"` — needs flip to `"VERIFIED"` after Avascan/Snowtrace confirm.
- Explorer URLs already wired: Avascan, Snowtrace, Routescan, Sourcify.
- `publicDropsActivated: 1`, `deployedAt: "2026-06-06"`, `validation: "IN_PROGRESS"`.

Artifact configuration (Archive1155):

| ID | Label | configured | active | Note (verbatim from config) |
|---|---|---|---|---|
| 1 | The First Signal | `DEPLOYED_CONFIGURED` | **true** | Genesis Chapter Artifact. Public mint OPEN at 0.50 USDC (wallet limit 5). |
| 2 | Reserved Seat Record Reference | `RESERVED_DISABLED` | false | Disabled in Archive1155 V1. Future ERC-721 `SyndicateSeatRecord721`. |
| 3 | Patron Seal | `DEPLOYED_CONFIGURED` | false | Support artifact. Not activated. |

ID 1 mintability on-chain: per config the public mint is OPEN. Live status is also enforced by `MintFirstSignal.tsx` reading the contract; `decideMintCta` in `src/lib/mint-phase.ts` blocks the CTA if `isMintable` returns false on-chain. So the on-chain truth is the authority, not the copy.

Admin/owner address: **not present in repo** — no `OWNER_ADDRESS` or `ADMIN_ADDRESS` constant. Need to confirm from the deployed contract directly before any new contract proposal touches access control.

Membership Sale payment receiver: the on-chain splitter routes 70/20/10 directly to the three wallets above; there is no single "receiver" — verified through `USDC_ROUTING` config.

---

## B. Frontend truth mismatch audit

I scanned every surface that mentions Archive1155 / NFT / ID 1 / mint status. The **vast majority are consistent**: ID 1 = LIVE / MINT OPEN; ID 2 = RESERVED / DISABLED; ID 3 = LIVE / READ-ONLY (configured, not active); IDs 4–8 = ROADMAP.

The contradiction ChatGPT flagged ("some say mint open, some say no mint active") is **mostly a scoping ambiguity, not a true contradiction** — when other surfaces say "no mint active" they are talking about IDs 2/3/4–8, not ID 1. But there are a few places where the scope is not explicit and a careless reader could misread.

### B.1 — Surfaces that correctly say "ID 1 mint OPEN"

| File | What it should remain |
|---|---|
| `src/routes/archive.tsx` lines 13, 55, 59, 63, 68, 74, 79, 169, 171, 222, 414, 508 | **LIVE / MINT OPEN** — keep |
| `src/routes/nft.tsx` lines 42–44, 78, 82, 91, 102 | LIVE / MINT OPEN — keep |
| `src/components/syndicate/HomeArchiveTeaser.tsx` lines 28, 33 | LIVE / MINT OPEN — keep |
| `src/components/syndicate/FaqRebuilt.tsx` lines 56, 58, 61 | LIVE / MINT OPEN — keep |
| `src/components/syndicate/TrustBar.tsx` line 29 | LIVE / MINT OPEN — keep |
| `src/components/syndicate/HeartSignalModal.tsx` line 54 | LIVE / MINT OPEN — keep |
| `src/components/syndicate/ArchiveMuseumHero.tsx`, `ArchiveContractStatus.tsx`, `ChapterOneHero.tsx`, `FirstSignalShowcase.tsx`, `FirstSignalAnatomyBands.tsx`, `Sections.tsx`, `FinalMintCTA.tsx`, `MintFirstSignal.tsx` | LIVE / MINT OPEN — keep |
| `src/routes/registry.tsx` line 76 | LIVE / MINT OPEN with proper scoping of ID 3 not active — keep |

### B.2 — Surfaces that correctly say "configured / not active" for ID 3

| File | What it should remain |
|---|---|
| `src/components/syndicate/ArchiveContractStatus.tsx` line 193 ("ID 3 Patron Seal configured but not active") | LIVE / READ-ONLY — keep |
| `src/components/syndicate/ArchiveOnboardingPanel.tsx` line 15 | LIVE / READ-ONLY — keep |
| `src/routes/my-syndicate.tsx` line 196 | LIVE / READ-ONLY — keep |
| `src/lib/archive-config.ts` lines 154, 223 (Patron Seal config) | LIVE / READ-ONLY — keep |
| `src/components/syndicate/ArchiveFaq.tsx` line 20 | LIVE / READ-ONLY — keep |

### B.3 — Surfaces that correctly say "reserved · not mintable" for ID 2

| File | What it should remain |
|---|---|
| `src/components/syndicate/MyArchivePreview.tsx` line 64–67, 206 | RESERVED / DISABLED — keep |
| `src/components/syndicate/ArchiveGlossary.tsx` lines 9, 18 | RESERVED / DISABLED — keep |
| `src/components/syndicate/ArchiveGalleryPreview.tsx` lines 205, 209, 211–212, 257 | RESERVED / DISABLED — keep |

### B.4 — Surfaces with actual ambiguity / scoping risk

These are the ones to clarify (no patch yet, awaiting approval):

| File:line | Current copy | Risk | Recommended target state |
|---|---|---|---|
| `src/components/syndicate/MyArchivePreview.tsx:76` | `meaningText = "Previewable Artifact, no public mint yet"` is reached when the on-chain read **errors** for *any* id, including ID 1. If RPC fails the user could see "ID 1 — no public mint yet". | Could flash a false "no mint" on ID 1 during a transient RPC error. | If `id === 1`, the error branch should fall back to `"Public mint OPEN — refreshing on-chain status"` instead of `"no public mint yet"`. |
| `src/routes/archive.tsx:334` | `"Explorer link pending"` inside a section talking about minted artifacts. | A new user can read this as "the contract / mint is pending". | Either remove or relabel as `"Per-mint explorer link populated after your tx confirms"`. |
| `src/routes/archive.tsx:391–395` | Section title `"What is pending?"` with body `"the items below are awaiting drop activation"`. | Title alone could be skim-read as "ID 1 pending". | Title scoped to `"What is pending beyond ID 1"` (or equivalent) to remove ambiguity. |
| `src/components/syndicate/ArchiveGalleryPreview.tsx:205` (comment refers to "PREVIEW — not active" labels) | Code is right but the legend visible to the reader does not always say "all of this is about IDs ≥ 2". | Add a one-line ledger row at the top of the gallery: `"ID 1 mint OPEN · IDs 2/3 reserved or inactive · IDs 4+ roadmap"`. |
| `src/lib/archive-truth-states.ts` `PENDING_NFT_CONTRACT` label & hint | Reads `"Requires the NFT Archive contract. Not deployed today"` — but Archive1155 IS deployed. This label was authored before Archive1155 went live and now means "Pending Seat Record contract". | Rename label to `PENDING_SEAT_RECORD_CONTRACT` and rewrite hint to `"Requires the future SyndicateSeatRecord721 contract. Archive1155 is deployed; Seat Records are not."`. |

There is **no other place** in the codebase that says "no public mint active" or "validation phase" globally. The earlier contradiction described in the brief is bounded to the four surfaces above.

### B.5 — State vocabulary recommendation (no implementation yet)

Today we run two vocabularies (`ArtifactStatus` in `archive-config.ts` and `TruthState` in `archive-truth-states.ts`). Recommendation: keep both, but extend the protocol-truth vocab to:

- `LIVE_ON_AVALANCHE` — unchanged
- `DERIVED_FROM_ON_CHAIN_DATA` — unchanged
- `PENDING_SEAT_RECORD_CONTRACT` — rename of current `PENDING_NFT_CONTRACT`
- `RESERVED_DISABLED_V1` — new, for Archive1155 ID 2 specifically
- `ROADMAP` — unchanged

This makes the difference between "no contract exists" and "contract exists but slot disabled in V1" loud.

---

## C. Chapter doctrine replacement (proposed, NOT implemented)

Old doctrine (5 chapters, very small Genesis):
```
Genesis     #1     – #10
First 100   #11    – #100
First 500   #101   – #500
First 1,000 #501   – #1,000
Open Era    #1,001+
```

New doctrine (your proposal — recorded for approval, not coded):
```
I   Genesis Signal      #1      – #333
II  First Thousand      #334    – #1,000
III The Expansion       #1,001  – #3,333
IV  First Ten Thousand  #3,334  – #10,000
V   Open Era            #10,001 +
```

Rules carried forward (locked):
- Chapters are historical coordinates only.
- Earlier ≠ better. No rewards, no governance, no financial rights.
- Chapter id is a pure function of member number.
- Same boundaries everywhere: homepage, `/chapters`, `/archive`, `/nft`, `/members`, `/my-syndicate`, `/registry`, `/docs`, `/roadmap`, future SeatRecord721 metadata.

Cross-decade test sentence: *"Member #4,802 will always be a First-Ten-Thousand member, regardless of how large or small the protocol gets."* — passes the Mythology gate (collapses to an on-chain fact, can't be renamed retroactively).

---

## D. Code map — every file that hard-codes the OLD chapter ranges

Canonical source today: **none**. The old ranges are duplicated across at least these files (every one needs the new boundaries once approved):

| File | Lines | What it does |
|---|---|---|
| `src/routes/members.tsx` | 62–66, 72–74, 215, 231, 277, 287 | `CHAPTERS` array + `CHAPTER_LABEL` map + Genesis ribbon "#1 – #10 · …" — **highest-impact**, this is the public members wall |
| `src/routes/founders.tsx` | 106, 120, 145, 152, 195, 276 | Genesis row "#1 – #10" + First 100 stat + chapter label fallback |
| `src/routes/wallet.$address.tsx` | 80–83 | `CHAPTER_LABEL` map for permanent wallet identity record |
| `src/components/syndicate/MemberCard.tsx` | 23–26, 40–42 | `CHAPTER_LABEL` + nextNumber → label ladder for the share card |
| `src/components/syndicate/IdentityZone.tsx` | 119–121 | Connected-wallet chapter label switch |
| `src/components/syndicate/EarlyChapters.tsx` | 24+ | Local `CHAPTERS` array |
| `src/components/syndicate/Flywheel.tsx` | 121 | Inline string "Genesis · First 100 · First 500 · First 1000" |
| `src/lib/syndicate-config.ts` | likely `MEMBERSHIP_POOL` block (line 122) — to confirm | May or may not encode ranges |

Other files that reference chapters by NAME but not RANGE (lower risk, still need a rename pass once approved): `archive.tsx`, `nft.tsx`, `chapters.tsx`, `chapters.$slug.tsx`, `ChapterOneHero.tsx`.

### Canonical-source recommendation (after approval)

Create `src/lib/chapters.ts`:

```ts
export type ChapterId = "genesis-signal" | "first-thousand" | "the-expansion" | "first-ten-thousand" | "open-era";
export const CHAPTERS: ReadonlyArray<{ id: ChapterId; index: number; label: string; range: [number, number | null]; }>
export function getChapterByMemberNumber(n: number): Chapter
export function getActiveChapter(memberCount: number): Chapter
export function getRemainingSeats(memberCount: number): number  // seats left in current chapter
export function getChapterProgress(memberCount: number): { filled: number; target: number | null; pct: number }
```

Every file in section D imports from this single source. No `CHAPTER_LABEL` map anywhere else. Same boundaries become metadata input for `SyndicateSeatRecord721`.

---

## E. Next contract architecture — `SyndicateSeatRecord721` (proposal, no Solidity yet)

Purpose: one ERC-721 identity record per verified Membership Sale member. Soulbound by default. Does not replace SYN or Archive1155. No financial rights.

### E.1 — Architecture recommendation

- Contract name: `SyndicateSeatRecord721`.
- Standard: ERC-721 with `tokenId == memberNumber` (1-indexed, matches the deterministic member ladder).
- Transferability: **soulbound by default** — override `_update` (OZ v5) to revert on any non-mint, non-burn transfer. Burn allowed only by admin (`emergencyBurn`) for KYC-revoke scenarios; never as a user-callable function in V1.
- Mint authority: **authorized minter** (`AccessControl` MINTER_ROLE) called by an off-chain indexer that watches Membership Sale `TokensPurchased` events. We can flip to user-claim later by granting MINTER_ROLE to the public claim contract; the data model doesn't change.
- One wallet → one seat. If the same wallet buys multiple times in Membership Sale, only the **first** purchase mints a Seat Record (lowest `memberNumber` wins). Subsequent purchases accumulate cumulative USDC but don't mint a second Seat. This matches the "seat = position" doctrine.
- DEX-only buyers (SYN purchased on Trader Joe without going through Membership Sale): **excluded** from V1 Seat Records. The Seat is conferred by primary membership, not by holding the token. They can still join Membership Sale later to earn a Seat.
- Duplicate-claim prevention: enforced by `tokenId == memberNumber` uniqueness + a `mapping(address => bool) hasSeat` guard. Indexer is idempotent.
- Avalanche C-Chain (chainId 43114).

### E.2 — On-chain storage per token (minimum, gas-conscious)

| Field | Type | Why on-chain |
|---|---|---|
| `memberNumber` | `uint32` (== tokenId) | Identity primary key |
| `chapterId` | `uint8` | Derivable from memberNumber but stored for permanence in case ranges are ever extended |
| `originalWallet` | `address` (== owner at mint, immutable) | Wallet rotation doesn't erase the original join |
| `joinBlock` | `uint64` | Replayable timestamp |
| `joinTxHash` | `bytes32` | Cryptographic anchor to the Membership Sale purchase — this is the **co-witness** primitive from the Core Asset gate |
| `foundersFlag` | `bool` (1 bit, packable) | True iff `memberNumber <= 333` (Genesis Signal); cheaper than re-deriving each read |

Total per-record: ~96 bytes packable. No name, no image, no description on-chain.

### E.3 — Metadata in `tokenURI` (off-chain, frozen on IPFS)

- `name`: `"Seat Record · Member #N"`
- `description`: chapter sentence + "Permanent identity record. Not equity. Not yield. Not revenue share."
- `image`: rendered Seat Record SVG (style consistent with The First Signal — same gold/cyan token palette)
- `attributes`: `memberNumber`, `chapter`, `chapterIndex`, `joinBlock`, `joinTxHash`, `foundersFlag`, `originalWallet`
- Hash pinned via `tokenURI(tokenId) → ipfs://...` deterministic per token.

### E.4 — Compatibility with Membership Sale today

Open question: does Membership Sale emit a `TokensPurchased(address buyer, uint256 amount, uint256 memberIndex)` event today? If yes, indexer-driven minting is plug-and-play. If `memberIndex` is **not** in the event, we need either (a) an indexer that counts events to assign sequential numbers, or (b) a Membership Sale v2 amendment that emits memberIndex. The current `useHolderIndex` / `protocol-pulse.ts` code already derives memberNumber off-chain — confirm which path it uses before final architecture.

---

## F. Founder decisions required before any code

These need a yes/no from you before I write a single line of Solidity or change a chapter label:

1. **Chapter ranges**: approve the 333 / 1,000 / 3,333 / 10,000 / 10,001+ ladder exactly as drafted in §C? Yes / No / Modify.
2. **`tokenId == memberNumber`** for SeatRecord721? Or use a separate `seatId` with `memberNumber` as a stored field? (Recommendation: tokenId == memberNumber — simpler, sortable, and matches mythology.)
3. **Soulbound default**: lock all transfers in V1 (recommendation)? Or allow admin-controlled transfer for KYC/rotation cases? Or open transfers (not recommended)?
4. **One wallet → one Seat**, or **one wallet → many Seats**? Recommendation: one Seat per wallet, lowest memberNumber wins, additional purchases accumulate USDC but no second Seat.
5. **DEX-only SYN holders**: confirm they're excluded from V1 Seat Records and must join Membership Sale to earn a Seat?
6. **Mint authority**: authorized indexer-driven minting (recommendation, deployable today) vs. user-claim flow (requires gas decision and signature scheme)?
7. **Vocabulary rename**: approve renaming `PENDING_NFT_CONTRACT` → `PENDING_SEAT_RECORD_CONTRACT` and adding `RESERVED_DISABLED_V1`?
8. **B.4 copy clarifications**: approve the four target-state edits in §B.4 (these are the only copy patches the audit recommends)?
9. **Canonical chapters file**: approve creating `src/lib/chapters.ts` as single source and migrating every file in §D to import from it (no behaviour change beyond the new ranges)?
10. **Admin/owner of Archive1155**: please share the deployed admin/owner address so SeatRecord721 access control can reuse the same multisig/EOA pattern.
11. **Audit before deploy**: confirm SeatRecord721 will not deploy to mainnet until a third-party audit + an explicit activation event (matching the Vault automation rule)?

---

## Decision Lens Verdicts

| Lens | Verdict | Note |
|---|---|---|
| Founder | ✓ | Locks doctrine before contracts. Cheapest possible truth audit before irreversible commitments. |
| Investor | ✓ | Removes the live-site copy ambiguity that breaks trust. No new financial claims introduced. |
| Growth | ✓ | New chapter ladder (333 / 1000 / 3333) lengthens the founding mythology window without inventing scarcity. |
| Behavioral | ✓ | Founders-flag at #333 (instead of #10) keeps the early-formation aspiration alive for the realistic first cohort. |
| UX | ⚠ | Section B.4 must ship before any new contract — otherwise the user-visible truth drifts further. |
| Product | ✓ | One canonical `chapters.ts` + one canonical truth-state vocabulary = far fewer future contradictions. |
| Staff Eng | ✓ | Indexer-driven mint is the most boring, most auditable architecture. Soulbound by default avoids the secondary-market trap. |
| QA | ✓ | Every claim in §A is backed by a file:line; every §D entry is testable. |
| A11y | ✓ | No accessibility regression — read-only report. |
| SEO | ✓ | Truth alignment improves the per-page meta credibility; no new routes proposed. |

No ✗. One ⚠ (UX). Below blocking threshold. Audit cleared.