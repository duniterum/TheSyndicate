# Archive1155 — Canonical NFT Architecture (V1)

Status: **CANONICAL** · Authority: binding for all Archive1155 NFT work
Last updated: post Patron Seal (ID 3) activation.

This document is the single source of truth for the public Archive1155 NFT
minting and purchase architecture. Every new public Archive NFT (today: ID 1,
ID 3; future: additional IDs) MUST follow this contract or update this doc
first.

## 1. Canonical sources (no duplicates allowed)

| Concern              | Canonical source                                | Notes |
|----------------------|--------------------------------------------------|-------|
| Contract address     | `ARCHIVE_NFT_CONTRACT_ADDRESS` in `src/lib/syndicate-config.ts` | `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` (Avalanche C-Chain, chainId 43114). Only one literal in the codebase. |
| ABI                  | `ARCHIVE_NFT_ABI` in `src/lib/archive-nft-abi.ts` | Verified against Sourcify. Read + minimal public-mint write only. No admin functions exposed. |
| ABI tuple decoder    | `decodeArtifactCore` in `src/lib/archive-nft-abi.ts` | Strict per-field validator for `getArtifactCore`. |
| Explorer URLs        | `archiveTxUrl`, `archiveAddrUrl` in `src/lib/explorer-guard.ts` and `ARCHIVE_NFT_EXPLORERS` in `syndicate-config.ts` | Avascan + Snowtrace + Routescan + Sourcify. Never hand-build explorer URLs in components. |
| USDC address         | `CONTRACTS.USDC_CONTRACT_ADDRESS` in `syndicate-config.ts` | Native Avalanche USDC (not USDC.e). |
| Chain                | `AVALANCHE_CHAIN_ID` in `syndicate-config.ts`     | `43114`. |
| Per-ID display       | `PREVIEW_ARTIFACTS` in `src/lib/archive-preview-catalog.ts` | Names, status, rights, supply, price. |
| Per-ID truth state   | `archive-truth-states.ts` + `archive-preview-catalog.ts` | Global state lives here. |
| Live on-chain reads  | `useArchiveArtifactReads` in `src/lib/archive-nft-hooks.ts` and `useArchiveSafeReads` in `archive-safe-reads.ts` | Includes global `paused()` flag. |
| Decision logic       | `decideMintCta`, `classifyMintError` in `src/lib/mint-phase.ts` | Generic state machine reused across mints. |

Anything in this column MUST be imported, never duplicated. Tests in
`src/lib/__tests__/archive1155-canonical.test.ts` enforce that.

## 2. Supported IDs

| ID | Name                          | Public mint? | Status                  | Price       | Wallet limit | Component |
|----|-------------------------------|--------------|-------------------------|-------------|--------------|-----------|
| 1  | The First Signal              | YES — live   | `ACTIVE_MINT_OPEN`      | 0.50 USDC   | 5            | `MintFirstSignal` |
| 2  | Reserved Seat Record reference | **No** — never in Archive1155 | `RESERVED_DISABLED` | — | — | disabled pointer / reference to the future `SeatRecord721` — **not** an identity source, **not** a member key (member identity = Holder Index) |
| 3  | Patron Seal                   | YES — live   | `ACTIVE_MINT_OPEN`      | 5.00 USDC   | 5            | `MintPatronSeal` (qty fixed at 1) |
| 4  | Heart Signal                  | No — ownerOnly | `ROADMAP` / protocol memory | — | — | gallery card, no CTA |
| 5  | Genesis Sealed                | No — ownerOnly | `ROADMAP`             | — | — | gallery card, no CTA |
| 6  | First Liquidity Event         | No — ownerOnly | `ROADMAP`             | — | — | gallery card, no CTA |
| 7  | First Routing Signal          | No — ownerOnly | `ROADMAP`             | — | — | gallery card, no CTA |
| 8  | Legacy Era I                  | No — ownerOnly | `ROADMAP`             | — | — | gallery card, no CTA |
| 9  | Protocol Chronicle            | No — **not configured on-chain** | `ROADMAP` | — | — | roadmap only |

Rules:
- IDs 2 and 4–9 MUST NOT render a public-mint CTA.
- ID 9 MUST NOT claim to be configured on-chain.
- ID 3 quantity is fixed at 1. No quantity selector until proven by a second live mint.

## 3. Generic mint engine (component pattern)

Both `MintFirstSignal` (ID 1) and `MintPatronSeal` (ID 3) follow the same
contract. Future public Archive1155 NFTs MUST reuse it:

1. Reads come from `useArchiveArtifactReads(id)` (artifact core, remaining
   supply, isMintable, walletRemaining, paused).
2. Render is gated by `liveActive === true && read.isMintableConnected === true`.
   Inactive paths render a disabled fallback — never a live-looking CTA.
3. Phase decision uses `decideMintCta(...)` (mint-phase.ts).
4. Payment flow is fixed:
   `check USDC balance → check allowance → approve(exact) → wait receipt → mint(id, qty) → wait receipt → refetch reads + invalidate queries → success panel with tx hash + explorer link`.
5. All explorer links go through `archiveTxUrl`/`archiveAddrUrl`.
6. Errors classified via `classifyMintError(...)`. Human-readable label first,
   raw message only as secondary detail.
7. Hard refusal: write submit re-checks `eligibilityOk && !wrongChain &&
   !needsApprove && !insufficientUsdc && !paused` immediately before
   `writeContractAsync`. No "force" override anywhere.

`MintFirstSignal` is the original implementation and stays as-is to preserve
the live ID 1 mint path. `MintPatronSeal` is the cleaner reference for any
new ID. Both are guarded by regression tests.

## 4. Global vs wallet-specific state

These MUST be visually distinct:

- **Global** (per artifact, every visitor): `active`, `paused`, `definitionFrozen`,
  `rendererMode`, `maxSupply`, `walletLimit`, `priceUsdc`, `minted`, `remainingSupply`.
- **Wallet-specific** (per connected wallet): connected/not, chain match,
  USDC balance, USDC allowance, owned balance, `walletRemaining`,
  `isMintable(id, wallet, 1)`.

The global status pill ("LIVE · MINT OPEN", "PAUSED", "SOLD OUT") must NOT
flip because of a wallet-specific condition (wrong chain, insufficient USDC,
wallet limit reached). Those render as CTA states, not as artifact status.

## 5. Payment flow steps & error framework

See `mint-phase.ts` for the canonical state machine and error classification.
Each step must surface: what is happening, why it is needed, next step,
recovery action.

Covered error cases: wrong network, wallet rejected approve/mint, approve
failure, mint reverted, insufficient USDC, wallet limit reached, sold out,
paused, not active, RPC unavailable, read failed, explorer unavailable.

## 6. Success / ownership surface

After a confirmed mint, the success panel renders: artifact name, ID, tx
hash, explorer link, qty, and a manual "Refresh minted status" button.
On-chain reads are auto-refetched in parallel. Ownership is reflected on
`/nft`, `/my-syndicate`, and `/wallet/:address`. No marketplace links are
invented.

## 7. Source attribution / future NFT architecture boundary

Current Archive1155 mints are not source-aware. Archive1155 does not accept a
`sourceId`, does not read SourceRegistryV1, and does not emit acquisition-cost
or source-term receipt fields.

Do not patch Archive1155 casually just to add source attribution. Future NFT
source-attribution work must pass `docs/MODULE_INTEGRATION_STANDARD.md` first
and should be designed as a separate architecture sprint.

Possible future paths include:

1. A source-aware Archive wrapper/router.
2. Archive1155 V2 with source-aware minting.
3. A ProductSaleRouter for approved product commerce.
4. A separate approved NFT sale design.

Any future design must answer: identity versus memory, ERC-721 versus ERC-1155,
sale contract versus token contract, receipt schema, Activity / My Syndicate /
Register / Chronicle / Archive read-model behavior, SourceRegistryV1/V2 fit,
legal/product copy, SEO/conversion posture, and the rule that artifacts never
imply financial rights.

## 8. Rights disclaimer (binding for every public artifact)

Artifacts are collectible records only. NOT equity, NOT debt, NOT Vault
ownership, NOT dividends, NOT revenue share, NOT governance, NOT promises
of profit. See `ARCHIVE_DISCLAIMER` in `archive-config.ts`.

Banned vocabulary in any mint UI: ROI, dividend, yield product, profit
share, revenue share, guaranteed appreciation, passive income.

## 9. Activation checklist (any new public ID)

Before activating a new public ID on-chain:

1. Confirm `definitionFrozen=true` (otherwise `setDropActive` reverts with
   `DefinitionNotFrozen`).
2. Confirm price, maxSupply, walletLimit, rendererMode match this doc.
3. Add the ID to `PREVIEW_ARTIFACTS` with correct `status`.
4. Add a mint component reusing the pattern in §3, hardcoding `ID` and `QTY`.
5. Render-gate the component on live `active === true && isMintableConnected === true`.
6. Add regression tests mirroring the ID 3 guards.
7. Only THEN run `setDropActive(id, true)` from owner.

## Decision Lens Verdicts

| Lens | Verdict | Notes |
|------|---------|-------|
| Founder       | ✓ | Single source of truth for the protocol's collectible layer. |
| Investor      | ✓ | Permanent collectible record; no financial promise. |
| Growth        | ✓ | Future IDs ship faster with the reusable pattern. |
| Behavioral    | ✓ | Clear global vs wallet-specific separation. |
| UX            | ✓ | Consistent flow across IDs 1 and 3. |
| Product       | ✓ | Composes with Core Asset and Infinite Narrative gates. |
| Staff Eng     | ✓ | No ABI/address drift; tests enforce. |
| QA            | ✓ | Regression suite covers price, ID, qty, copy. |
| A11y          | ✓ | All CTAs use disabled + aria-disabled correctly. |
| SEO           | ✓ | Route metadata stays per-page; no impact. |
