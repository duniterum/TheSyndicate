# Deployment State V1 — SyndicateArchive1155

> **Current truth (2026-06-08):** Archive1155 is LIVE on Avalanche. ID 1 (First Signal, 0.50 USDC) and ID 3 (Patron Seal, 5.00 USDC) are both LIVE public mints. ID 3 is no longer `CONFIGURED_NOT_ACTIVE`. The §1 table rows describing "VALIDATION PHASE" / "NO PUBLIC DROP ACTIVATED YET" reflect the initial deployment snapshot and are preserved for historical reference — this header and the Patron Seal activation log immediately below it are the current source of truth.

**Status:** 🟢 DEPLOYED · 🟢 ID 1 LIVE · 🟢 ID 3 LIVE (2026-06-07)
**Doctrine:** SYN is the seat. NFT Artifacts are the memory.

**Patron Seal (ID 3) activation log:**
- `freezeArtifactDefinition(3)` tx `0xc997427a4659854591be2f72759e01f92f0f70f8ad0c3ed1c52356b231ddf818`
- `setDropActive(3, true)` executed by owner `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`
- Live reads (2026-06-07): `active=true`, `definitionFrozen=true`, `priceUsdc=5_000_000`,
  `walletLimit=5`, `maxSupply=10_000`, `rendererMode=ONCHAIN_SVG`, `paused=false`.
- **First verified public Patron Seal mint** (2026-06-08): tx `0x47c9f7fcf51f163bf4f495dee857c08a466087bff2119d64d1fedaa6cebd99f6` · block `87,447,442` · minter `0x244531C571966f90f4849e03a507543d90f9C721` · `TransferSingle id=3 qty=1 from=0x0`. Post-mint reads: `totalSupply(3)=5`, `remainingSupply(3)=9,995`, `balanceOf(wallet,3)=3`, `walletRemaining(3,wallet)=2`. IDs 1/2/4–9 unchanged.

This document records the first real on-chain deployment of the NFT
Archive contract and pins the validation/activation/integration state
that all other docs and surfaces must align with.

---

## 1. Current Deployment State

| Field                | Value                                                              |
| -------------------- | ------------------------------------------------------------------ |
| Contract             | `SyndicateArchive1155`                                             |
| Chain                | Avalanche C-Chain (mainnet)                                        |
| Contract address     | `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d`                       |
| Deployment date      | 2026-06-06                                                         |
| Status               | **DEPLOYED**                                                       |
| Activation status    | **VALIDATION PHASE** (no `setDropActive(_, true)` calls yet)       |
| Production status    | **NO PUBLIC DROP ACTIVATED YET** — no artifact is mintable today   |
| Spec version         | `docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md` (frozen)                    |
| Review state         | `docs/SOLIDITY_REVIEW_STATE.md`                                    |
| Seat Record decision | `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md` (locked)               |

State vocabulary used across docs:

- **Planned** — described in the vision/spec, not yet designed in detail.
- **Designed** — frozen design in this repo, no contract logic exists.
- **Implemented** — Solidity exists and is reviewed but not on mainnet.
- **Deployed** — bytecode is on Avalanche mainnet at a known address.
- **Activated** — `setDropActive(id, true)` has been called for a given id.

The contract is **DEPLOYED**. No artifact id is **ACTIVATED**.

---

## 2. Deployment assumptions (must hold)

These were the binding assumptions at deploy time. Any deviation is a
contradiction and must be resolved before activation.

1. ERC-1155 only. No ERC-721 Seat Record logic inside this contract.
2. Token ID 2 is reserved + disabled (`active = false`, `maxSupply = 0`,
   `rendererMode = NONE`, `uri(2)` reverts).
3. `maxSupply == 0` means LOCKED / NOT MINTABLE for every id.
4. No unlimited minting for any id in V1.
5. On-chain JSON + on-chain SVG is the V1 metadata default. No IPFS /
   Arweave dependency for V1 public artifacts.
6. USDC payment uses Avalanche **native USDC** (6 decimals).
7. No burn, no batch mint, no Merkle, no staking, no revenue share, no
   governance, no Vault claim, no LP ownership, no financial rights.
8. `owner`, `treasury`, and `royaltyReceiver` are set to the addresses
   approved by the founder (recorded out-of-band in the deployment
   record).

---

## 3. Validation checklist (must pass before any activation)

Run these read-only checks against `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d`
on Avalanche mainnet. Record results in
`docs/CONTRACT_INTEGRATION_STATUS.md`.

- [ ] `owner()` returns the expected multisig / founder address.
- [ ] `treasury()` returns the expected treasury address.
- [ ] `royaltyReceiver()` returns the expected royalty address.
- [ ] `getArtifactCore(1)` returns The First Signal config matching the
      catalog (`docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md`).
- [ ] `getArtifactCore(2)` shows reserved/disabled state
      (`active = false`, `ownerOnly = true`, `maxSupply = 0`,
      `rendererMode = NONE`).
- [ ] `getArtifactCore(3)` returns Patron Seal config matching the
      catalog.
- [ ] `remainingSupply(2) == 0`.
- [ ] `uri(2)` reverts with `URINotReady(2)` (or returns the spec's
      reserved/disabled payload — whichever the final spec chose).
- [ ] `isMintable(1, <any wallet>, 1) == false` while ID 1 is inactive.
- [ ] `mint(2, …)` reverts.
- [ ] `adminMint(_, 2, _)` reverts.
- [ ] `setDropActive(2, true)` reverts.
- [ ] `ERC1155Supply.totalSupply(id)` is `0` for every id.

Expected outcomes:

- ID 2 remains disabled.
- `remainingSupply(2) == 0`.
- ID 2 metadata shows reserved/disabled state.
- The First Signal remains **inactive** until manually activated.
- No artifact becomes live accidentally.

---

## 4. Activation checklist (per artifact id, gated)

For each id that will go live (starting with ID 1 The First Signal):

- [ ] Artifact Definition matches the catalog exactly.
- [ ] `freezeArtifactDefinition(id)` called and confirmed.
- [ ] `uri(id)` returns a decodable JSON with an on-chain SVG image.
- [ ] Price (USDC, 6 decimals), `walletLimit`, `maxSupply` confirmed.
- [ ] `treasury()` and `royaltyReceiver()` re-verified.
- [ ] Frontend `/archive` integration ready (read-only first).
- [ ] Risk Notice and ARCHIVE_DISCLAIMER unchanged.
- [ ] Founder sign-off in writing.
- [ ] `setDropActive(id, true)` executed from `owner()`.
- [ ] Post-activation: `isMintable(id, _, 1) == true` and a 1-unit
      reference mint completes successfully.

ID 2 is **never** activated in V1.

---

## 5. Future integration checklist (frontend / docs)

- [ ] Pin `ARCHIVE_NFT_CONTRACT_ADDRESS = 0xB2AE…D54d` in
      `src/lib/syndicate-config.ts` (or the equivalent config module)
      behind a read-only constant.
- [ ] Add Avascan / Snowtrace explorer links wherever the Archive is
      referenced.
- [ ] Flip applicable surfaces from `PENDING_NFT_CONTRACT` toward
      `LIVE_ON_AVALANCHE` / `DERIVED_FROM_ON_CHAIN_DATA` **only after**
      the validation checklist passes and the first id is activated.
- [ ] Keep ID 2 surfaces as `PENDING_NFT_CONTRACT` (future ERC-721).
- [ ] No mint UI, no admin panel, no simulated previews until §3 and
      §4 are green for the relevant id.

---

## 6. What this document does NOT authorize

- No new product features.
- No Archive redesign.
- No new Solidity.
- No public copy changes unless a current line contradicts §1–§2.
- No activation of any id ahead of §4 sign-off.


---

## 7. Frontend integration log

- 2026-06-06 — Read-only constant pinned: `ARCHIVE_NFT_CONTRACT_ADDRESS`
  exported from `src/lib/syndicate-config.ts` (also on `CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS`).
- 2026-06-06 — Explorer links added: `ARCHIVE_NFT_EXPLORERS`
  (Avascan, SnowTrace, Routescan, Sourcify).
- 2026-06-06 — `/archive` page now renders the read-only
  `ArchiveContractStatus` widget (address, network, deployment status,
  validation status, source verification, public drops activated, per-id
  rows for IDs 1/2/3). No mint/approve/admin UI.
- 2026-06-06 — Registry row updated: "Archive Contract (SyndicateArchive1155)"
  is now LIVE with the deployed address + Avascan link. The separate
  "NFT Contract (Seat Record · ERC-721)" row stays PENDING.
- 2026-06-06 — Transparency Center + Protocol Status updated with the
  Archive contract entry (status: partial / live, deployed · validation phase).
- 2026-06-06 — `HomeArchiveTeaser` reframed from PENDING-only to
  "DEPLOYED · VALIDATION PHASE · no drop activated yet".
- Per-id on-chain reads (`remainingSupply`, `isMintable`, `active`) are NOT
  wired yet. Widget displays honest "Read integration pending" copy and
  never mock data.


---

## Update 2026-06-06 · Read-only frontend integration

Live read-only contract calls wired into the Archive Contract Status
widget on `/archive`. See `docs/CONTRACT_INTEGRATION_STATUS.md` §8 for
the full integration log. No mint, approve, activate, or admin paths
were added. Reads cover `remainingSupply`, `isMintable` (reference +
connected wallet), and `getArtifact` for IDs 1/2/3. Failed reads are
labeled "Read error" — never substituted with zeros or placeholders.
Compact explorer cards (Avascan / SnowTrace / Routescan / Sourcify)
added below the status widget on `/archive`.

---

## Frontend — Archive Experience Preview

Status: **PREVIEW · READ-ONLY · MINT DISABLED · NO PUBLIC DROP ACTIVATED**.

The preview layer added on /archive and /my-syndicate is a visual product
preview only. It composes:

- Live on-chain reads: `remainingSupply(id)`, `isMintable(id, wallet, 1)`,
  `getArtifactCore(id)`, `balanceOf(wallet, id)`. All via `allowFailure: true`.
- Static reference catalog from `src/lib/archive-preview-catalog.ts` for
  target price, proposed `maxSupply`, proposed `walletLimit`, visual
  family, renderer mode, mint model.

Drop activation status remains: **NONE**. No `setDropActive` call is
exposed in the UI. The disabled mint preview card for IDs 1 and 3 has no
write handler. ID 2 is presented as reserved and disabled, pointing at the
future `SyndicateSeatRecord721` ERC-721 contract.

---

## Wave 7 — public UX clarity pass

- Public NFT route exposed at `/nft`; `/archive` and `/nfts` are aliases that canonicalize to `/nft`.
- Navigation wording in header switched from "NFT Archive" to "NFTs" → `/nft`.
- Reordered Archive page: Hero → How it works → Gallery → My Archive teaser → Future Collector View → Contract Status → Explorers → Verifiable → Pending → Legal.
- No smart-contract or write-path changes. No drop activation.

---

## Shared-page / SEO-head contract

`/nft`, `/archive`, and `/nfts` render the same `ArchivePage` component. The **only**
per-route variance is `head()` (title, description, canonical, og:url, og:type). SEO
head changes must never introduce route-based conditionals (`useMatch`, `useLocation`,
pathname checks, or `Route.use`) inside the shared component or its children. All
alias routes must remain pixel-identical in body rendering so that visitors see the
same UI regardless of which URL they land on.


---
## First-Time-Visitor Clarity Pass · /nft + /my-syndicate

Added (presentation-only, no contract/write changes):
- `/nft` FAQ section (6 plain-language Q&As; mint, marketplace, rights, ID 2).
- `/nft` "What you can do today" onboarding panel (today / not active yet + CTAs to /join and #gallery-preview).
- `/nft` glossary near contract status (DEPLOYED, VALIDATION, NO PUBLIC DROP ACTIVE, READ-ONLY).
- Gallery cards now show a "Why it matters" line and an explicit "Mint status · PREVIEW / NOT ACTIVE / RESERVED" line. Disabled mint preview remains attached only to IDs 1 and 3 with no write handler.
- `/my-syndicate` MyArchivePreview disconnected empty state now offers Join / Explore NFTs / Verify contract CTAs.
- `/my-syndicate` MyArchivePreview connected empty-state notice clarifies "Your Archive is not populated yet. Public Artifact drops are not active."
- `/my-syndicate` personal-timeline Archive group reworded from "PENDING NFT CONTRACT" to "DEPLOYED · NO PUBLIC DROP ACTIVE" with per-row honest notes (Reserved · future ERC-721 / Drop not active / Read-only · 0 expected).
- `/my-syndicate` Archive-eligibility section description refreshed to reflect deployed contract + drops-not-active reality.

State unchanged: Archive1155 deployed at 0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d on Avalanche · validation phase · no public drop activated · no mint/approve/admin UI · ID 2 reserved/disabled.

---
## Trust + Accessibility Polish · 2026-06-06

- ArchiveContractStatus explorer links: primary link renamed to "Verify on Avalanche Explorer ↗" with visible focus rings.
- MyArchivePreview compact status list for IDs 1–3: "Configured · Not active" / "Reserved · Disabled · Future ERC-721" with honest read-pending / read-error states.
- Archive FAQ converted to accessible controlled accordion (`aria-expanded`, `aria-controls`, `id`, `focus-visible`).

---

## First Signal — public mint activated (2026-06-06)

ID 1 ("The First Signal") has moved from validation to controlled activation:

- `definitionFrozen = true`
- `active = true`
- `rendererMode = ONCHAIN_SVG`
- `maxSupply = 10,000`
- `walletLimit = 5`
- `priceUsdc = 500000` (0.50 USDC)

A public mint flow is now live on `/nft` and `/archive`, scoped strictly to
ID 1. Payment uses native Avalanche USDC
`0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` (NOT USDC.e). The Archive
contract is the approve spender. Mint call is `mint(1, 1)` — quantity is
fixed at 1 in V1.

ID 2 remains RESERVED · DISABLED · FUTURE ERC-721.
ID 3 (Patron Seal) is LIVE — public mint OPEN at 5.00 USDC, walletLimit 5,
maxSupply 10,000, definitionFrozen=true, active=true. Mint call is
`mint(3, 1)` (quantity fixed at 1 in V1).

No other write paths exist. No admin UI, no activation UI, no marketplace.

See `docs/CONTRACT_INTEGRATION_STATUS.md §7` for the full flow contract.

## Copy/state consistency (2026-06-06)

`/nft`, `/archive`, `/nfts` (shared `ArchivePage`), `/my-syndicate`, and
`/registry` all surface ID 1 as ACTIVE · MINT OPEN, 0.50 USDC + Avalanche
gas, wallet limit 5. Stale validation-phase copy ("No public drop active",
"Public artifact minting is not active yet", "Drop not active" for ID 1)
has been removed. ID 1's status pill is driven by the static catalog and
`ARCHIVE_CONTRACT_STATE.artifacts[0].active = true` (with
`publicDropsActivated = 1`) — independent of live-read success. ID 2
remains RESERVED · DISABLED. ID 3 is LIVE · MINT OPEN at 5.00 USDC.

## QA guardrails (2026-06-06)

Two scripts now gate regressions on the ID 1 live-mint surfaces:

- `npm run check-live` — extended `live-content-rules.json` rules for
  `/nft`, `/archive`, `/nfts`, `/my-syndicate` block stale phrases such
  as "Archive contract is not deployed", "No public Archive mint is
  active yet", "No drop is active yet", "Public drops activated 0",
  "Nothing is mintable today", "Validation Phase", "PENDING CONTRACT
  for The First Signal", as well as any non-(ID 1/ID 3) mint CTA
  (`Mint ID 2`, etc.) and any marketplace/trading/floor/volume surface.
- `npm run check-nft-qa` (`scripts/check-nft-archive-qa.mjs`) —
  rendered-route + visual-anchor regression for the four ID 1 routes.
  Asserts `ACTIVE · MINT OPEN`, `0.50 USDC`, `wallet limit`,
  `What you are minting`, `contract-rendered`, exactly one
  `Mint The First Signal` CTA per route, and no
  marketplace/trading surface.

Live-read fallback policy (unchanged): if on-chain reads fail, numeric
cells render `Read pending` / `Read error`, the page-level status pill
remains `ACTIVE · MINT OPEN` (known deployment truth), and the mint CTA
stays disabled with `Verifying on-chain state…` / `Read error — try
again`. We never fabricate live values and never flip ID 1 back to
"not active" on read failure.

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

## Archive1155 frontend read root cause (2026-06-06)

The partial read failure was a frontend ABI mismatch. Verified deployed ABI
has `getArtifactCore(uint256)` + `getArtifactText(uint256)`; the site was still
calling stale `getArtifact(uint256)`, which reverts on the deployed contract.
`remainingSupply(1)` and `isMintable(1, nonZeroReference, 1)` worked because
those ABI entries matched.

Fix: frontend ABI now uses `getArtifactCore(uint256)` with deployed output
order `configured, active, ownerOnly, definitionFrozen, rendererMode,
maxSupply, walletLimit, priceUsdc, minted`, normalizes the returned tuple by
index, and maps `minted` to UI `totalMinted`. `remainingSupply` /
`walletRemaining` output types were corrected to `uint256`. See
`docs/CONTRACT_INTEGRATION_STATUS.md` root-cause audit for the full evidence.
