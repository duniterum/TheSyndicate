# Contract Integration Status — SyndicateArchive1155

> **Current truth (2026-06-08):** Archive1155 is LIVE on Avalanche. ID 1 (First Signal, 0.50 USDC) and ID 3 (Patron Seal, 5.00 USDC) are both LIVE public mints. ID 3 is no longer `CONFIGURED_NOT_ACTIVE`. Historical rows below describing ID 3 as configured-not-active reflect earlier activation phases — this header overrides them.

**Status:** 🟢 ID 1 LIVE · 🟢 ID 3 LIVE (2026-06-07)
**Contract:** `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` · Avalanche C-Chain
**Companion:** `docs/DEPLOYMENT_STATE_V1.md` · `docs/SOLIDITY_REVIEW_STATE.md`

Single live tracker of the integration state between the deployed
`SyndicateArchive1155` contract and every consuming surface (docs,
frontend, explorer links, dashboards). Update this file as items move,
do not create parallel trackers.

---

## 1. Contract status

| Item                                | Status     | Notes                                                          |
| ----------------------------------- | ---------- | -------------------------------------------------------------- |
| Contract deployed                   | ✅ DONE     | Avalanche mainnet, 2026-06-06                                  |
| Contract address pinned in docs     | ✅ DONE     | `docs/DEPLOYMENT_STATE_V1.md` §1                               |
| Contract verified on Avascan        | ⏳ PENDING  | Confirm source verification + ABI publication                  |
| Contract verified on Snowtrace      | ⏳ PENDING  | Optional but recommended                                       |
| `owner()` matches expected address  | ⏳ PENDING  | Read on-chain and record                                       |
| `treasury()` matches expected       | ⏳ PENDING  | Read on-chain and record                                       |
| `royaltyReceiver()` matches expected| ⏳ PENDING  | Read on-chain and record                                       |
| Royalty % matches decision C1       | ⏳ PENDING  | Spec recommendation 5%                                         |

## 2. Per-artifact state

| ID | Name                       | Configured | Definition frozen | Active | Validation | Notes                                  |
| -- | -------------------------- | ---------- | ----------------- | ------ | ---------- | -------------------------------------- |
| 1  | The First Signal           | ✅ done    | ✅ frozen          | ✅ yes  | ✅ live     | `priceUsdc=500000` (0.50 USDC), `maxSupply=10000`, `walletLimit=5`, `rendererMode=ONCHAIN_SVG`. Public mint open via `mint(1, 1)`. |
| 2  | Reserved Seat Record Ref.  | 🔒 reserved | n/a               | ❌ no   | ⏳ pending  | MUST stay disabled; `uri(2)` must revert; no mint UI |
| 3  | Patron Seal                | ✅ done    | ✅ frozen          | ✅ yes  | ✅ live     | `priceUsdc=5000000` (5.00 USDC), `maxSupply=10000`, `walletLimit=5`, `rendererMode=ONCHAIN_SVG`. Public mint open via `mint(3, 1)`. Freeze tx `0xc997427a4659854591be2f72759e01f92f0f70f8ad0c3ed1c52356b231ddf818`; activation tx after. |
| 4  | Heart Signal               | ⏳ verify   | ❌ no              | ❌ no   | ⏳ pending  | `rendererMode` likely `NONE` at deploy |
| 5  | Genesis Sealed             | ⏳ verify   | ❌ no              | ❌ no   | ⏳ pending  | Milestone-triggered                    |
| 6  | First Liquidity Event      | ⏳ verify   | ❌ no              | ❌ no   | ⏳ pending  | Milestone-triggered                    |
| 7  | First Routing Signal       | ⏳ verify   | ❌ no              | ❌ no   | ⏳ pending  | Milestone-triggered                    |
| 8  | Legacy Era I               | ⏳ verify   | ❌ no              | ❌ no   | ⏳ pending  | Post-seal release                      |

Activation rule: no id flips to ✅ Active until
`docs/DEPLOYMENT_STATE_V1.md` §3 (validation) and §4 (activation) are
both green for that id.

## 3. Metadata validation

| Check                                            | Status     |
| ------------------------------------------------ | ---------- |
| `uri(1)` decodes as valid JSON                   | ⏳ PENDING  |
| `uri(1).image` is `data:image/svg+xml;base64,…`  | ⏳ PENDING  |
| `uri(2)` reverts as expected                     | ⏳ PENDING  |
| `uri(3)` decodes as valid JSON                   | ⏳ PENDING  |
| Banned wording absent from all metadata          | ⏳ PENDING  |
| Required SVG content fields present              | ⏳ PENDING  |

Banned wording reference:
`docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md` §9.

## 4. Frontend integration

| Item                                                | Status     | Notes                                               |
| --------------------------------------------------- | ---------- | --------------------------------------------------- |
| `ARCHIVE_NFT_CONTRACT_ADDRESS` constant exposed     | ⏳ PENDING  | Add as read-only config; no mint UI                 |
| `/archive` page reads contract (read-only)          | ⏳ PENDING  | After validation green for at least ID 1            |
| `/my-syndicate` reflects ownership (read-only)      | ⏳ PENDING  | After validation; ID 2 stays PENDING                |
| Dashboard / transparency surfaces updated           | ⏳ PENDING  | Mirror DEPLOYED + VALIDATION state only             |
| Avascan explorer link on Archive surfaces           | ⏳ PENDING  | Link to contract address                            |
| Snowtrace explorer link on Archive surfaces        | ⏳ PENDING  | Optional second link                                 |
| Mint UI                                             | ⛔ BLOCKED  | Only after an id is activated and signed off        |
| Admin panel                                         | ⛔ BLOCKED  | Not in scope                                        |
| Simulated previews / mock tokenURI output           | ⛔ BLOCKED  | Forbidden by spec                                   |

## 5. Recommended next integration steps

1. Run the §3 validation checklist in `docs/DEPLOYMENT_STATE_V1.md`
   from a read-only RPC session and paste results into §1–§3 above.
2. Verify the contract source on Avascan (and Snowtrace) and link both
   in this document.
3. Add `ARCHIVE_NFT_CONTRACT_ADDRESS` as a read-only constant; do not
   wire any write paths.
4. Add explorer links to existing Archive surfaces (no copy changes
   beyond the link).
5. Resolve outstanding spec rows (C1 royalty %, C5 license, D2/D3/D6
   addresses + signer threshold, §8.7 initial `rendererMode` for
   IDs 4–7) and record final values here.

## 6. Blockers before frontend integration

- Source verification on Avascan/Snowtrace.
- On-chain confirmation of `owner` / `treasury` / `royaltyReceiver`.
- Decode + validate `uri(1)` and `uri(3)` payloads against
  `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md` §7–§9.
- Confirm `uri(2)` revert behavior and `remainingSupply(2) == 0`.
- Founder sign-off that ID 1 / ID 3 definitions match the catalog
  before any activation discussion.

Until each blocker clears, all consuming surfaces remain
`PENDING_NFT_CONTRACT` / `DEPLOYED — NOT ACTIVATED`.


---

## 7. Frontend integration log — 2026-06-06

- ✅ `ARCHIVE_NFT_CONTRACT_ADDRESS` exposed as read-only constant in
  `src/lib/syndicate-config.ts`.
- ✅ Explorer links exposed via `ARCHIVE_NFT_EXPLORERS` (Avascan,
  SnowTrace, Routescan, Sourcify).
- ✅ `/archive` renders `ArchiveContractStatus` widget (read-only):
  address, network, contract status DEPLOYED, validation IN PROGRESS,
  source verification PENDING, public drops activated 0, per-id rows for
  IDs 1/2/3 with honest labels.
- ✅ Registry: "Archive Contract (SyndicateArchive1155)" row is LIVE with
  Avascan link; "NFT Contract (Seat Record · ERC-721)" row remains PENDING.
- ✅ Transparency Center + Protocol Status surfaces updated.
- ✅ Home Archive teaser reframed to DEPLOYED · VALIDATION PHASE.
- ⏳ Per-id contract reads not wired — widget shows "Read integration pending".
  No mock data, no simulated previews, no mint/approve/admin UI.
- ⛔ No id has been activated. ID 2 remains reserved/disabled.


---

## 8. Frontend read-only on-chain integration — 2026-06-06

Wired live read-only contract calls. No write paths added.

### Files added
- `src/lib/archive-nft-abi.ts` — minimal ABI subset for
  `remainingSupply(uint256)`, `walletRemaining(uint256, address)`,
  `isMintable(uint256, address, uint64)`, `getArtifactCore(uint256)`.
  Includes `RENDERER_MODE_LABEL` and a non-zero `REFERENCE_WALLET` constant
  for display-only unconnected eligibility reads.
- `src/lib/archive-nft-hooks.ts` — `useArchiveArtifactReads(ids)` runs a
  single multicall (4 calls per id) with `allowFailure: true`. Returns
  per-id `{ remainingSupply, isMintableReference, isMintableConnected,
  artifact, errors }` plus `dataUpdatedAt` (last successful read epoch).
  Refetch interval 60s, staleTime 30s.

### Routes affected
- `/archive` only. `ArchiveContractStatus` widget now consumes live
  reads. Compact explorer cards section added below the widget
  (Avascan / SnowTrace / Routescan / Sourcify).

### Reads wired
For IDs 1, 2, 3:
- `remainingSupply(id)` → uint64
- `isMintable(id, REFERENCE_WALLET, 1)` → bool (display-only reference read)
- `isMintable(id, connectedWallet, 1)` → bool (only when wallet connected;
  otherwise UI shows "Connect wallet to check")
- `getArtifactCore(id)` → tuple (`configured`, `active`, `ownerOnly`,
  `definitionFrozen`, `rendererMode`, `maxSupply`, `walletLimit`,
  `priceUsdc`, `minted`)

### Expected current read state
- ID 1 (The First Signal): configured; `active=false`;
  `isMintable=false` until founder sign-off + `setDropActive(1, true)`.
- ID 2 (Reserved Seat Record Reference): `remainingSupply(2)==0`,
  `isMintable=false`, labeled "RESERVED · DISABLED" / "FUTURE ERC-721" /
  "NOT MINTABLE IN ARCHIVE1155 V1".
- ID 3 (Patron Seal): LIVE; `active=true`, `definitionFrozen=true`;
  `isMintable=true` for eligible wallets. Public mint via `mint(3, 1)`.

### Error handling
- Each call independently labeled. Failed call → cell shows
  "Read error" (rose-toned) with tooltip; never replaced with `0`.
- Aggregate status pill: `READ · OK` / `READ · PARTIAL` / `READ · ERROR`
  / `READ · PENDING`. Last successful read time shown as relative.
- Contract address + deployment metadata + explorer links stay visible
  even if every read fails.

### Source verification
- Still PENDING. To flip the `Source verification` cell to `VERIFIED`,
  confirm on Sourcify or SnowTrace and update
  `ARCHIVE_CONTRACT_STATE.sourceVerified` in
  `src/lib/syndicate-config.ts`.

### Hard constraints maintained
- No mint, approve, activate, admin, or quantity UI.
- No price purchase CTA. `priceUsdc` shown as raw uint reference only.
- No banned vocabulary (LIVE MINT / CLAIM / AVAILABLE / BUY NFT / DROP
  OPEN / ELIGIBLE TO MINT) anywhere in the widget or explorer cards.

---

## 9. Archive Experience Preview (visual layer)

A read-only "Archive Experience Preview" surface has been added so the
deployed contract can be evaluated visually before any drop activation.
It is **not** live minting.

- `/archive` → `<ArchiveGalleryPreview />` (8 IDs: 1–8) + `<FutureCollectorView />`
- `/my-syndicate` → `<MyArchivePreview />` (per-wallet `balanceOf` reads)
- New files:
  - `src/lib/archive-preview-catalog.ts` — static reference catalog (target prices, proposed supply, wallet limits, visual family, renderer mode). Reference values only, labeled as such.
  - `src/lib/archive-balances-hook.ts` — `useArchiveBalances(ids)` wraps `balanceOf(wallet, id)` with `allowFailure: true`.
  - `src/components/syndicate/ArtifactPreviewArtwork.tsx` — synthetic SVG previews stamped `PREVIEW · NOT CONTRACT-RENDERED`.
  - `src/components/syndicate/ArchiveGalleryPreview.tsx` — gallery + disabled-mint preview (IDs 1, 3) + detail modal.
  - `src/components/syndicate/FutureCollectorView.tsx` — filter chrome; no marketplace.
  - `src/components/syndicate/MyArchivePreview.tsx` — read-only per-wallet panel.

Guarantees:
- No write paths added. The "Mint disabled — validation phase" button is
  an inert `<button disabled aria-disabled>` with no `onClick` and no
  contract handler.
- No fabricated on-chain values. `remainingSupply`, `isMintable`,
  `getArtifact`, and `balanceOf` all surface as "Read pending" / "Read
  error" when the call fails.
- ID 2 is rendered as **RESERVED / DISABLED · FUTURE ERC-721** and is
  explicitly described as not mintable in Archive1155 V1.
- No marketplace claim, no floor price, no volume, no listings.

---

## §9 — Public-facing UX clarity pass (NFT-forward naming)

- Public canonical route is now `/nft` ("The Syndicate NFTs — Collectible Protocol Artifacts").
- `/archive` and `/nfts` continue to render the same `ArchivePage` component for existing links; both canonicalize to `/nft`.
- Header navigation label changed from "NFT Archive" → "NFTs" pointing to `/nft`.
- Homepage NFT Archive teaser now links to `/nft`.
- Sitemap: `/nft` priority 0.8; `/archive` and `/nfts` retained at lower priority.
- Page hierarchy reordered to lead with emotional hook + Join CTA, followed by a 3-step "How it works" section, then gallery, my-archive teaser, future collector view, contract status, explorers, and legal.
- No write paths added. No drop activation. ID 2 still labeled RESERVED · disabled · future ERC-721.
- Stale "NFT contract pending" / "Genesis NFTs eligibility scaffold" copy removed.


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

1. **"Verify on Avalanche Explorer" link added** to `ArchiveContractStatus` widget. Primary Avascan link now reads "Verify on Avalanche Explorer ↗" with visible focus states.
2. **Compact token ID status list added** to `/my-syndicate` (`MyArchivePreview`). IDs 1, 2, 3 show honest status + meaning text; live `useArchiveArtifactReads` enhances display when available.
3. **FAQ accordion accessibility improved** (`ArchiveFaq`). Native `<details>` replaced with controlled `<button>` accordion: `aria-expanded`, `aria-controls`, answer `id`, visible `focus-visible` ring, full keyboard navigation.

No write paths added. No drop activation. No contract changes.

---

## 7. The First Signal — V1 mint flow (LIVE)

The first real public write path in the Archive UI. Scope is hard-bounded to ID 1.

| Item | Value |
|------|-------|
| Artifact | `id=1` — The First Signal |
| Contract | `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` (SyndicateArchive1155) |
| Function | `mint(uint256 id, uint64 quantity)` |
| Quantity (V1) | Fixed at `1` — no quantity selector |
| Price | `priceUsdc = 500000` raw = **0.50 USDC** per unit |
| Max supply | `10,000` |
| Wallet limit | `5` |
| Renderer | `ONCHAIN_SVG` (mode = 1) |
| Definition | `definitionFrozen = true` |
| Active | `active = true` |
| Payment token | **Native Avalanche USDC** `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` (NOT USDC.e) |
| Spender (approve) | Archive1155 contract itself |
| Surface | `src/components/syndicate/MintFirstSignal.tsx` (gallery card + detail modal, ID 1 only) |

### Eligibility gate (all must be true to surface the live mint button)

1. `getArtifactCore(1).active === true`
2. `getArtifactCore(1).definitionFrozen === true`
3. `getArtifactCore(1).rendererMode === 1` (ONCHAIN_SVG)
4. `remainingSupply(1) > 0`
5. No on-chain read errors for the above
6. `isMintable(1, connectedWallet, 1) === true` before submission

Failure of any → button stays disabled and shows honest status text. Never fabricate.

### Per-wallet gates (block submission)

- Wrong chain → "Switch to Avalanche"
- `isMintable(1, wallet, 1) === false` → "Wallet limit reached"
- USDC balance < required → "Insufficient USDC"
- USDC allowance < required → "Approve 0.50 USDC" (ERC20 `approve(spender=Archive, amount=500000)`)

### Out of scope (constitutional)

- ❌ No mint for ID 2 (reserved future ERC-721)
- ❌ No mint for ID 3 (configured but NOT active — button reads "Not active yet")
- ❌ No mint for any other ID
- ❌ No admin / activation UI
- ❌ No marketplace, listing, trading, floor, or volume UI
- ❌ No USDC.e (native Avalanche USDC only)
- ❌ No fabricated values; reads gate the entire flow

### 7.1 Copy/state consistency (2026-06-06)

Across `/nft`, `/archive`, and `/nfts` (shared `ArchivePage`) plus
`/my-syndicate` and `/registry`, ID 1 must read consistently as:

- ACTIVE · MINT OPEN
- Public mint open
- 0.50 USDC + Avalanche gas
- Wallet limit 5
- Collectible record only · no financial rights

Banned for ID 1: "CONFIGURED · NOT ACTIVE", "PREVIEW — not active yet",
"Not mintable yet", "Public artifact minting is not active yet",
"No public Archive mint is active yet". ID 1 status pill is driven by
the static catalog (`status: "ACTIVE_MINT_OPEN"`) and `syndicate-config`
(`active: true`, `publicDropsActivated: 1`) — not by live-read success.
Live reads only refine the numeric data cells (remainingSupply,
isMintable, totalMinted), which honestly report "Read pending" or
"Read error" on failure. ID 2 remains RESERVED · DISABLED. ID 3 remains
CONFIGURED · NOT ACTIVE with no write handler.

## §8 — /nft visitor mint readiness pass (2026-06-06)

Final sweep for first-visitor live mint readiness:

- Removed remaining stale phrases from `MyArchivePreview` (VALIDATION
  PHASE pill, "No artifact drop is active yet", "Because no public drop
  is activated yet" footnote), from `archive.tsx` ("No drop is active
  yet" My Archive teaser), and from `docs.tsx` route metadata.
- `MyArchivePreview` per-artifact status now special-cases
  `ACTIVE_MINT_OPEN` so ID 1 renders "Active · Mint OPEN" instead of
  falling back to "Configured · Not active" while live reads resolve.
- Added an "Are all Artifacts live?" FAQ answer making the ID 1 / ID 2 /
  ID 3 / IDs 4–8 split explicit.
- Added /nft /archive /nfts /my-syndicate rules to
  `scripts/live-content-rules.json` so future regressions of
  "No public Archive mint is active yet", "No drop is active yet",
  "Public drops activated 0", or "Validation Phase" on these routes
  fail the live-content check.

ID 1 visual presentation: artwork is the live on-chain SVG via `uri(1)`
(decoded by `ArchiveOnchainImage`) with an honest "loading" / "unable to
load — retry" fallback. Mint flow stays scoped to ID 1 only; ID 2 and
ID 3 have no mint CTA.

## §9 — Rendered-route QA + visual anchors (2026-06-06)

Two layered guardrails now protect the "ID 1 is live" invariant against
copy regressions:

1. **Live-content rules** (`scripts/live-content-rules.json`) — extended
   forbidden list for `/nft`, `/archive`, `/nfts`, `/my-syndicate` to
   include: "Archive contract is not deployed", "No public Archive mint
   is active yet", "No drop is active yet", "Public drops activated 0",
   "Nothing is mintable today", "ID 1 configured not active",
   "The First Signal configured not active", "PENDING CONTRACT for The
   First Signal", "Validation Phase", and forbidden non-ID-1 mint CTAs
   (`Mint Patron Seal`, `Mint ID 2`, `Mint ID 3`) plus marketplace
   surfaces (`floor price`, `trading volume`). Run with
   `npm run check-live`.

2. **NFT Archive QA + visual anchors**
   (`scripts/check-nft-archive-qa.mjs`) — rendered-route assertion that:
   - stale forbidden phrases are ABSENT,
   - `ACTIVE · MINT OPEN`, `0.50 USDC`, `wallet limit` are PRESENT
     on `/nft` and `/archive`,
   - the ID 1 card region carries its visual anchors
     (`The First Signal`, `What you are minting`, `contract-rendered`,
     `Active · Mint OPEN`),
   - exactly one `Mint The First Signal` CTA exists per route (no
     accidental ID 2 / ID 3 mint CTAs are introduced),
   - no marketplace / trading / floor / volume surface appears.

   Run with `npm run check-nft-qa`.

The visual-anchor layer is a lightweight structural snapshot (it asserts
named blocks ship in the HTML, not pixel diffs) and intentionally avoids
brittle assertions on live numeric reads — those reads can be `Read
pending` / `Read error` and that must not fail QA.

### Live-truth + static fallback contract (re-affirmed)

- Dynamic on-chain state for ID 1 (`active`, `definitionFrozen`,
  `rendererMode`, `priceUsdc`, `maxSupply`, `walletLimit`,
  `remainingSupply`, `totalMinted`, `isMintable(wallet,1,1)`,
  `balanceOf(wallet,1)`, USDC `allowance`) comes from live reads in
  `useArchiveArtifactReads` + `MintFirstSignal`.
- Static catalog (`src/lib/archive-config.ts`,
  `src/lib/archive-preview-catalog.ts`, `src/lib/syndicate-config.ts`)
  remains the source of truth for: names, descriptions, categories,
  visual families, status copy fallback, and intended catalog layout.
- If live reads succeed, ID 1 numeric cells and mint gating come from
  on-chain. If they fail, numeric cells render `Read pending` /
  `Read error` and the top-level status stays `ACTIVE · MINT OPEN` (the
  known deployment truth) until a successful read proves otherwise.
- Mint CTA only enables when ALL of: wallet connected, Avalanche
  C-Chain, `active=true`, `definitionFrozen=true`,
  `rendererMode=ONCHAIN_SVG`, `remainingSupply>0`,
  `isMintable(connected,1,1)=true`, USDC balance ≥ price, USDC
  allowance ≥ price (else the Approve step shows). All other failure
  states surface as explicit disabled labels: "Connect wallet",
  "Switch to Avalanche", "Verifying on-chain state…", "Insufficient
  USDC", "Approve 0.50 USDC", "Wallet limit reached", "Read error — try
  again".

---

## §9 — First Signal Mint Production State (final)

Status: **READY FOR FOUNDER SITE MINT**.

Live truth on Avalanche C-Chain:
- Archive1155 deployed at `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d`.
- ID 1 The First Signal: **definitionFrozen = true**, **active = true**,
  rendererMode = ONCHAIN_SVG, price = **0.50 USDC**, walletLimit = **5**,
  maxSupply = 10,000.
- ID 2: reserved / disabled / future ERC-721 (SyndicateSeatRecord721).
- ID 3 (Patron Seal): **definitionFrozen = true**, **active = true**, rendererMode = ONCHAIN_SVG, price = **5.00 USDC**, walletLimit = **5**, maxSupply = 10,000. Public mint OPEN.
- Other IDs: roadmap / not active.

Surface invariants (regression-guarded by `scripts/check-nft-archive-qa.mjs`):
- `/nft`, `/archive`, `/nfts`, `/my-syndicate` all render:
  "The First Signal", "ACTIVE · MINT OPEN", "0.50 USDC", "wallet limit 5",
  "What you are minting", "contract-rendered".
- Exactly one `Mint The First Signal` CTA exists per page.
- Zero mint CTAs exist for ID 2 or ID 3.
- All forbidden stale phrases (Validation Phase, contract not deployed,
  No public drop active, Nothing is mintable today, Public artifact
  minting is not active yet) are absent.
- Marketplace/floor/volume/trading copy is absent.

Live truth vs. static fallback policy:
- Dynamic state (active, frozen, priceUsdc, walletLimit, maxSupply,
  remainingSupply, USDC balance/allowance, balanceOf) is read live from
  the Archive1155 + native Avalanche USDC contracts via wagmi.
- Static catalog (`archive-config.ts`, `syndicate-config.ts`,
  `archive-preview-catalog.ts`) is preserved as the safe fallback layer
  for names, descriptions, categories, and visual families.
- On read failure we show "Verifying on-chain state…" / "Read error —
  try again" on the specific cells. We never fabricate values and never
  flip ID 1 back to "not active" because of an RPC failure.

Mint flow (hardened in `MintFirstSignal.tsx`):
1. Connect wallet → 2. Switch to Avalanche → 3. Check native Avalanche
USDC balance + allowance → 4. Approve 0.50 USDC (spender = Archive1155)
→ 5. Mint ID 1, quantity = 1 → 6. Refetch artifact + balance + show tx
link → 7. `/my-syndicate` reflects owned ID 1.

Quantity is fixed at 1 for V1. No admin UI, no activation UI, no
marketplace/trading paths, no Seat Record mint, no ID 3 mint.

Regression CI:
- `npm run check-nft-qa` (rendered HTML assertions against the published
  site) — **PASSING** on `https://thesyndicate.money`.
- `scripts/live-content-rules.json` enforces the same forbidden/required
  copy set globally.

Next operational step: founder performs the real site mint of ID 1 from
their own wallet and confirms `/my-syndicate` displays the owned ID 1
balance and explorer link.

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

## Root-cause audit — Archive1155 read mismatch (2026-06-06)

Finding: the frontend ABI was stale. The deployed, Sourcify-verified
`SyndicateArchive1155` ABI exposes `getArtifactCore(uint256)` and
`getArtifactText(uint256)`, not `getArtifact(uint256)` / public
`artifacts(uint256)` as the earlier spec-shaped frontend ABI expected.

Direct Avalanche RPC verification against
`0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d`:
- `remainingSupply(1)` succeeds → `10000`.
- `isMintable(1, 0x0000000000000000000000000000000000000001, 1)` succeeds → `true`.
- stale `getArtifact(1)` reverts.
- stale `artifacts(1)` reverts.
- `getArtifactCore(1)` succeeds → `configured=true`, `active=true`,
  `ownerOnly=false`, `definitionFrozen=true`, `rendererMode=1`,
  `maxSupply=10000`, `walletLimit=5`, `priceUsdc=500000`, `minted=0`.

Why Remix succeeded while the site failed: Remix was calling the deployed
getter (`getArtifactCore`) with the deployed ABI. The site was still calling
the pre-deploy/spec getter (`getArtifact`) inside the multicall, so only that
row failed while independent rows (`remainingSupply`, `isMintable`) succeeded.
The error source was ABI/function mismatch, not contract state, RPC reachability,
or Solidity mint logic.

Repair applied:
- `ARCHIVE_NFT_ABI` now matches the verified deployed getter shape:
  `getArtifactCore(uint256) returns (bool,bool,bool,bool,uint8,uint64,uint64,uint256,uint256)`.
- `useArchiveArtifactReads` now calls `getArtifactCore`, not `getArtifact`.
- The tuple is normalized by index into `{ configured, active, ownerOnly,
  definitionFrozen, rendererMode, maxSupply, walletLimit, priceUsdc,
  totalMinted }` because viem returns an array, not a named object.
- `remainingSupply` and `walletRemaining` ABI outputs were corrected to
  `uint256` to match the verified ABI.
- Display-only reference wallet changed from zero address to non-zero
  `0x0000000000000000000000000000000000000001`; mint gating remains based on
  `getArtifactCore(1)`, `remainingSupply(1)`, and connected-wallet
  `isMintable(1, wallet, 1)`.

Expected UI result after republish: `rendererMode`, `walletLimit`,
`maxSupply`, and `totalMinted` decode from `getArtifactCore(1)` and no longer
show `Read error` when the same RPC endpoint can read `remainingSupply`.

---

## Founder live-test audit — approval + explorer repair (2026-06-06)

Root cause of broken approval UX: the write state collapsed wallet-signature,
submitted, confirmation, and post-confirmation allowance refresh into generic
approval copy. After MetaMask confirmed, the UI could continue to show
`Approval required` until the allowance read refreshed, so the founder had no
clear proof that approval succeeded or that the page was waiting on a live
allowance refetch.

Repair applied:
- Approval copy now separates: `Approve 0.50 USDC` → `Waiting for MetaMask
  signature…` → `Approval submitted…` / `Waiting for confirmation…` →
  `Approval confirmed` → `Now mint The First Signal`.
- Approval explanation is explicit: approval lets Archive1155 spend exactly
  `0.50 USDC` for this mint.
- After approval confirmation, wallet reads are refetched and global query
  cache is invalidated. Mint stays blocked if the latest allowance is still
  below `500000`, with an explicit `approval confirmed but allowance still
  low` message instead of silently looping.
- Mint remains hard-bounded to `Archive1155.mint(1, 1)`.

Root cause of broken explorer link: transaction links reused the generic
Avascan C-Chain URL helper. Address pages were valid, but tx links need a
more reliable chain-specific transaction route. Primary tx links now use
Routescan (`https://routescan.io/tx/<hash>`) and are only rendered when the
hash validates as `0x` + 64 hex characters. Invalid/missing hashes render
`Explorer link unavailable` instead of a dead link.

ABI audit result: `npm run check-archive-abi` passes against Sourcify for
`getArtifactCore(uint256)`, `remainingSupply(uint256)`,
`isMintable(uint256,address,uint64)`, `balanceOf(address,uint256)`,
`uri(uint256)`, `mint(uint256,uint64)`, and `walletRemaining(uint256,address)`.
USDC ABI remains the minimal ERC20 subset: `balanceOf`, `allowance`,
`approve`.
