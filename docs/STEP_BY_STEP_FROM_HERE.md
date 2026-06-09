# Step-by-Step From Here — Pre-Contract → Smart-Contract Phase

> SYN is the seat. NFT Artifacts are the memory.
>
> The site, the four-label vocabulary, the per-surface future bindings,
> and the legal posture are all already in place. This document is the
> exact sequence the next phase (smart-contract architecture) will
> follow. Each step is gated.

Companion documents:

- `docs/ARCHIVE_ENGINE_SPEC.md`
- `docs/SMART_CONTRACTS_DEFERRED.md`
- `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md`

---

## Phase 0 — Foundation (DONE today)

- [x] Four permanent truth states live in `src/lib/archive-truth-states.ts`
      (`LIVE_ON_AVALANCHE`, `DERIVED_FROM_ON_CHAIN_DATA`,
      `PENDING_NFT_CONTRACT`, `ROADMAP`).
- [x] Per-category `FutureBinding` declared for all 9 artifact types
      (`CATEGORY_FUTURE_BINDING`).
- [x] `resolveTruthState()` resolver stub (today resolves to
      `PENDING_NFT_CONTRACT` for all artifact statuses).
- [x] Public surfaces use the canonical labels:
  - `/archive` — status strip + What is verifiable today / What is pending + Future NFT Artifact Types.
  - `/my-syndicate` — live membership facts vs pending NFT timeline.
  - HomeArchiveTeaser, SeatRecordPanel, FAQ "NFT Archive" category, Registry, Whitepaper.
- [x] Archive disclaimer rendered on every Archive surface.
- [x] Production smoke 23/23, leak guard clean, honesty guard clean.

---

## Phase 1 — Contract specification freeze

Goal: produce an unambiguous spec for the Archive NFT contract.

1. Decide token standard per category (ERC-721 for unique records;
   ERC-1155 only if a category truly needs multi-supply).
2. Freeze per-category event schema. Source of truth:
   `CATEGORY_FUTURE_BINDING` data shapes in
   `src/lib/archive-truth-states.ts`.
3. Freeze eligibility rules per category (already enumerated:
   `purchase-history`, `chapter-of-joining`, `lp-position`,
   `milestone-trigger`, `open-to-all`, `discovery`).
4. Freeze proceeds-routing policy for paid artifacts (Patron Seal, Seat
   Record). Must align with USDC 70/20/10 routing or be explicitly
   carved out and disclosed.
5. Freeze metadata URI policy (immutable IPFS for sealed artifacts;
   versioned only where dynamic state is constitutive).
6. Legal review pass.
7. Constitutional review pass (Five Pillars + Decision Lenses + Core
   Asset gate + Mythology gate).

Exit gate: signed spec, no open ambiguities.

---

## Phase 2 — Contract implementation + audit

1. Implement Archive NFT contract on Avalanche C-Chain.
2. Implement per-category claim / mint windows behind the eligibility
   rules above.
3. Implement event log surface: `ArtifactMinted`, `ArtifactClaimed`,
   `MilestoneReached`, `LPEvent` (where applicable), plus the standard
   `Transfer`.
4. Fuji testnet deployment.
5. End-to-end claim flows exercised on testnet.
6. Independent audit.
7. Audit report published.

Exit gate: clean audit, all critical/high findings closed.

---

## Phase 3 — Indexer + UI integration (plug-and-play)

The whole point of Phase 0 is that this phase is small. The code
changes required:

1. `src/lib/syndicate-config.ts` — add `ARCHIVE_NFT_CONTRACT_ADDRESS`.
2. `src/lib/archive-truth-states.ts`:
   - Implement `resolveTruthState()` body to read indexer state.
   - Replace any remaining `providerKind: "tbd"` rows in
     `CATEGORY_FUTURE_BINDING` with the live providers.
3. New hook `src/lib/archive-inventory.ts` (`useArchiveInventory(wallet)`):
   reads `balanceOf` + `tokenOfOwnerByIndex` + `tokenURI` from the
   deployed contract.
4. Surfaces that today render `PENDING NFT CONTRACT` flip in place to
   `LIVE ON AVALANCHE` / `DERIVED FROM ON-CHAIN DATA` — same layout,
   same copy frames, same badges.
5. FAQ answer for "Are any NFTs live today?" flips to "Yes" + contract
   address.
6. Registry NFT Contract row swaps to live address + explorer link.
7. Sitemap stays as-is (no new public routes required at this step).

Exit gate: production smoke 100%, leak guard clean, honesty guard
clean, no copy regression.

---

## Phase 4 — Claim UX

1. Per-category claim flow on `/archive` and `/my-syndicate` (Seat
   Record post-purchase claim first; Patron Seal next; Heart Signal
   only via discovery; Chapter / Milestone / Liquidity tied to their
   triggers).
2. Per-wallet inventory module on `/my-syndicate`.
3. Activity feed surfaces `ArtifactMinted` and `ArtifactClaimed` events.
4. OG cards for owned artifacts.

Exit gate: real-user test plan complete (see
`docs/REAL_USER_TEST_PLAN.md` once updated).

---

## Phase 5 — Post-launch hardening

1. Secondary-market policy publication (if any).
2. Royalties policy.
3. Long-tail artifact categories (Legacy Artifacts post-seal).
4. Discovery proof verifier hardening for Secret Artifacts.

---

## Non-goals across all phases

These never become goals without an independent constitutional review:

- Yield, dividends, revenue share, staking, governance, marketplace
  operation, NFT financial utility, wealth-coded ranks, manufactured
  scarcity, fake eligibility, fake counts.

---

## Single-line invariant

> Every Archive surface, today and tomorrow, must resolve to exactly one
> of the four permanent truth states defined in
> `src/lib/archive-truth-states.ts`. If a surface cannot, it does not ship.

---

## Sequence update (2026-06-06)

**Current step (DONE):** Freeze visual system + metadata philosophy +
token catalog + design references.

Files frozen:
- `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md`
- `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`
- `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md`
- `docs/NFT_ARCHIVE_DESIGN_REFERENCES.md`
- `docs/design/nft-archive-artifact-anatomy-reference.png`
- `docs/design/nft-archive-onchain-engine-reference.png`
- `docs/design/nft-archive-ecosystem-reference.png`

**Next step:** Resolve `docs/SMART_CONTRACT_DECISIONS_PENDING.md` with
Kemal + ChatGPT (20 open rows; B1 on-chain renderer is the highest
impact).

**Then:** Revise `NFT_ARCHIVE_SMART_CONTRACT_ARCHITECTURE_V1.md` and
`NFT_ARCHIVE_SOLIDITY_SPEC_V1.md` to match the closed decisions, then
write Solidity, then Fuji rehearsal, then audit, then mainnet.

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

---

## Current Solidity Review State (2026-06-06)

Kemal + ChatGPT are reviewing the production-candidate Solidity contract
for `SyndicateArchive1155`. **Lovable MUST NOT generate Solidity** unless
explicitly asked. The next required step is **compile + tests** against
the frozen spec, not new product design. Full state, ID-2 rules, and
required test invariants are pinned in
`docs/SOLIDITY_REVIEW_STATE.md`.


## Deployment Update (2026-06-06)

`SyndicateArchive1155` is now **DEPLOYED** on Avalanche mainnet at
`0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d`. The project is now in
the **contract validation phase**: no artifact id is activated, no
mint UI is wired, ID 2 remains reserved/disabled, and all consuming
surfaces remain `PENDING_NFT_CONTRACT` until validation passes. See
`docs/DEPLOYMENT_STATE_V1.md` (deployment + validation + activation
checklists) and `docs/CONTRACT_INTEGRATION_STATUS.md` (per-id and
per-surface tracker). No new features, no Archive redesign, no new
Solidity.

---

## First Signal Mint — Production Verdict

**READY FOR FOUNDER SITE MINT.** Archive1155 deployed, ID 1 frozen +
active, public mint open at 0.50 USDC native Avalanche USDC, wallet
limit 5. ID 2 reserved/disabled, ID 3 configured/not active, all other
IDs roadmap. Only ID 1 has mint UI. `npm run check-nft-qa` passes
against the published site. Live on-chain reads are the source of truth
for dynamic state; static config remains as the safe fallback for names,
descriptions, and visual families. See
`docs/CONTRACT_INTEGRATION_STATUS.md §9` for the full state matrix.

---

## Founder Mint Readiness (final pass)

- Zero-address `isMintable(id, 0x0, 1)` preflight removed from the eligibility gate. Some Avalanche RPC nodes revert on the zero-address path even when the drop is live; we now rely on `getArtifactCore(1)` + `remainingSupply(1)` for the live-state gate, and use `isMintable(1, connectedWallet, 1)` only as the connected-wallet check.
- ID 1 modal hierarchy locked: image (premium gold-framed container) left · conversion column right. Above-the-fold order: ACTIVE · MINT OPEN pill → Chapter I → name → Price / Supply / Minted / Remaining / Wallet limit → primary CTA. Technical metadata is collapsed in a `<details>` block beneath the action.
- Wallet-state labels expanded: not-connected, wrong-network ("Switch to Avalanche C-Chain"), verifying ("Checking wallet eligibility…"), insufficient USDC ("Add native Avalanche USDC to this wallet"), needs-approve, approval pending ("Waiting for USDC approval confirmation…"), mint pending ("Mint transaction pending…"), mint confirmed, wallet-limit reached.
- Read-error path shows a recovery panel with Retry + "View contract ↗" rather than a dead disabled button. ID 1 no longer flips to inactive when reads transiently fail.
- ID 2 (RESERVED_DISABLED) and ID 3 (CONFIGURED_NOT_ACTIVE) remain with no mint path. No marketplace / floor / volume / trading copy anywhere.
- `scripts/check-nft-archive-qa.mjs` PASS on /nft, /archive, /nfts, /my-syndicate against the live custom domain.

**Verdict:** READY FOR FOUNDER SITE MINT. Next action: founder mints one ID 1 from the live site and confirms `/my-syndicate` reflects the owned balance.

---

## Frontend read correction (2026-06-06)

Root cause of the partial `/nft` read errors: frontend ABI drift. The deployed
contract getter is `getArtifactCore(uint256)`, not the stale spec-era
`getArtifact(uint256)` the UI was calling. The hook now reads
`getArtifactCore`, decodes the tuple by index, and maps deployed `minted` to UI
`totalMinted`. No contract change was required.
