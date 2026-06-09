> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# Archive1155 — 9-Slot Readiness Audit (pre-SeatRecord721)

Pre-activation, pre-contract audit. No transactions sent. No Solidity
changed. No SeatRecord721 work. This report establishes the on-chain
truth for IDs 1–9 on the deployed `SyndicateArchive1155` contract and
maps it against the founder-proposed 9-slot doctrine.

**Contract:** `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` · Avalanche
C-Chain (43114) · verified on Sourcify (full match).

---

## A. Archive1155 ABI capability report

ABI parsed from Sourcify verified metadata.

### Admin / write functions (gated by `onlyOwner` in source)

| Function | Purpose |
|---|---|
| `configureArtifact(uint256 id, tuple def)` | Create/replace artifact definition (renderer, price, supply, walletLimit, ownerOnly, etc.). Allowed only when not frozen. |
| `updateArtifactDefinition(uint256 id, tuple def)` | Edit any field on an existing artifact until frozen. |
| `freezeArtifactDefinition(uint256 id)` | Lock an artifact's definition permanently. ID 1 is already frozen. |
| `setDropActive(uint256 id, bool)` | Toggle the per-ID public mint flag. **Per-ID, no global drop flag.** |
| `adminMint(address, uint256 id, uint64 qty)` | Mint to a specific wallet; used for ownerOnly / milestone / snapshot drops. |
| `pause()` / `unpause()` | Pauses the whole contract (`paused()` currently `false`). |
| `setTreasury(address)` | Change USDC sweep destination. |
| `setDefaultRoyalty(address, uint96 bps)` | EIP-2981 royalty config. |
| `transferOwnership / acceptOwnership / renounceOwnership` | OZ Ownable2Step. |
| `mint(uint256 id, uint64 qty)` | Public mint — only callable when `active=true && !ownerOnly`. |

### Read functions used for verification

`owner`, `pendingOwner`, `treasury`, `paused`, `MAX_TOKEN_ID`,
`RESERVED_SEAT_RECORD_ID`, `exists`, `totalSupply(id)`, `remainingSupply(id)`,
`uri(id)`, `getArtifactCore(id)`, `getArtifactText(id)`, `isMintable`,
`walletRemaining`, `mintedPerWallet`.

### Capability answers

- **Can IDs 4–9 be configured on the existing contract?** IDs 4–8 are
  **already configured on-chain** (`configured=true`); only ID 9 is not
  configured (reverts on `getArtifactCore`). Any ID up to `MAX_TOKEN_ID=255`
  can be configured by the owner via `configureArtifact`.
- **Can URI / renderer / price / supply / active state be changed per ID?**
  Yes via `updateArtifactDefinition`, except for IDs whose definition is
  frozen. **Only ID 1 is frozen today.** `setDropActive(id, bool)` toggles
  the mint flag independently.
- **Can an ID be created after deployment?** Yes — `configureArtifact`.
- **Can a configured ID be activated later?** Yes — `setDropActive(id, true)`.
- **Can ID 2 stay permanently disabled while others activate?** Yes. ID 2
  is the contract-level constant `RESERVED_SEAT_RECORD_ID = 2`, configured
  as `ownerOnly=true, active=false, maxSupply=0`. Activation is per-ID;
  nothing else is coupled to ID 2.
- **Is there a global drop flag?** No global drop flag. There is
  `paused()` which halts every mint, currently `false`. Per-ID activation
  is via `setDropActive` only.
- **Owner / admin wallet:** `owner()` returns
  `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`. `pendingOwner()` is zero.
- **Treasury wallet:** `0xE4178521946D2C54e2A2C5b154AaE07319BBd56f`.
- **Verifying read calls:** `getArtifactCore(id)` (tuple),
  `getArtifactText(id)` (name/desc/externalUrl), `uri(id)`, `exists(id)`,
  `totalSupply(id)`, `remainingSupply(id)`, `isMintable(id, wallet, qty)`.

---

## B. Current on-chain state per ID

All values queried live against Avalanche C-Chain just now via the
public RPC. `rendererMode`: `0=NONE · 1=ONCHAIN_SVG · 2=EXTERNAL_URI`.

| ID | configured | active | ownerOnly | frozen | renderer | maxSupply | walletLimit | priceUsdc | minted | on-chain `name` |
|---:|:---:|:---:|:---:|:---:|:---:|---:|---:|---:|---:|---|
| 1 | ✅ | ✅ | ❌ | ✅ | ONCHAIN_SVG | 10,000 | 5 | 0.500000 | 3 | The First Signal |
| 2 | ✅ | ❌ | ✅ | ❌ | NONE | 0 | 1 | 0 | 0 | Reserved: Seat Record |
| 3 | ✅ | ❌ | ❌ | ❌ | ONCHAIN_SVG | 10,000 | 5 | **5.000000** | 0 | Patron Seal |
| 4 | ✅ | ❌ | ✅ | ❌ | NONE | 1,000 | 1 | 0 | 0 | Heart Signal |
| 5 | ✅ | ❌ | ✅ | ❌ | NONE | 144 | 1 | 0 | 0 | Genesis Sealed |
| 6 | ✅ | ❌ | ✅ | ❌ | NONE | 500 | 1 | 0 | 0 | First Liquidity Event |
| 7 | ✅ | ❌ | ✅ | ❌ | NONE | 500 | 1 | 0 | 0 | First Routing Signal |
| 8 | ✅ | ❌ | ✅ | ❌ | NONE | 0 | 1 | 0 | 0 | Legacy Era I |
| 9 | ❌ not configured — `getArtifactCore(9)` reverts (selector `0xe1a91e39`) | | | | | | | | | — |

`uri(id)` is empty/unset for every ID except 1 (which returns a real
`data:application/json;base64,…` payload).

### Frontend ↔ contract mismatches detected

1. **ID 3 Patron Seal price.** `src/lib/archive-config.ts` lists
   `targetPriceUsdc: 9`. `src/lib/archive-preview-catalog.ts` lists `5.0`.
   **On-chain reality:** `5.000000 USDC`. Catalog matches on-chain; the
   `archive-config.ts` target is stale. Not changed in this pass (out of
   scope — read-only audit) but flagged.
2. **ID 3 status label `PENDING_CONTRACT` in `archive-config.ts`.** The
   Patron Seal is already configured on the deployed Archive1155 — it
   only needs `setDropActive(3, true)` to go public. The
   `CONFIGURED_NOT_ACTIVE` status used in the catalog is the correct one.
3. **Gallery had 8 cards.** ID 9 was absent from `PREVIEW_ARTIFACTS`.
   Fixed in this pass (see §E).
4. **"Chapter I · The Beginning"** label on `/nft` and in the preview
   catalog. Frontend-only string; replaced with the canonical
   "Chapter I — Genesis Signal".

---

## C. Are the ID 4–8 names frontend-only or on-chain-bound?

**On-chain-bound.** `getArtifactText(id)` returns these names directly
from contract storage:

| ID | On-chain `name` | On-chain `description` | On-chain `externalUrl` |
|---:|---|---|---|
| 4 | Heart Signal | Secret Artifact | Secret Pixel |
| 5 | Genesis Sealed | Genesis Founder Mark | Ceremonial Seal |
| 6 | First Liquidity Event | Liquidity Mark | Protocol Event |
| 7 | First Routing Signal | Protocol Milestone | Protocol Event |
| 8 | Legacy Era I | Legacy Artifact | Archive Record |

> **Important:** Renaming any of IDs 4–8 in the UI to match the
> founder-proposed names ("Genesis Signal Relic", "First Thousand
> Relic", "Expansion Relic", "First Ten Thousand Relic", "Open Era
> Relic") would introduce a **frontend/contract truth mismatch** —
> the gallery would say one thing, `getArtifactText(id)` would say
> another, and every block explorer / marketplace would override us
> with the on-chain name. Per the founder rule "If any of these names
> are already on-chain metadata/config, do not rename blindly", **no
> UI rename was performed for IDs 4–8.** Founder decision required.

### Founder decision needed before any rename

There are exactly two safe paths to harmonize IDs 4–8 to the new
9-slot chapter-relic doctrine:

- **Path 1 — Keep current on-chain names, reframe doctrine.** Accept
  that IDs 4, 5, 6, 7, 8 = Heart Signal, Genesis Sealed, First
  Liquidity Event, First Routing Signal, Legacy Era I. Map the
  Chapter II–V relics to **future IDs 10–14** (or 9–13 once ID 9 is
  configured). Zero on-chain risk. No transactions needed.
- **Path 2 — Rename on-chain via `updateArtifactDefinition`.** None of
  IDs 4–8 are frozen, so the owner can rewrite their text fields. This
  is a real on-chain transaction from
  `0xa2E5…6e2F`, requires 5 calls (one per ID), and permanently writes
  new metadata to contract storage. Marketplaces and explorers will
  pick up the new names automatically (`uri(id)` is currently empty,
  so changing renderer mode + supply at the same time is feasible).
  **Not executed in this pass.**

A third option — leave the on-chain names alone but show the
"intended" name in the UI with a small "on-chain name: X" disclosure —
is **explicitly rejected** because it violates the trust doctrine
("Verifiable > Impressive; Live > Estimated").

---

## D. Files changed in this pass

Minimal harmonization only — strictly UI-side, no contract / ABI /
address / mint price / wallet limit / payment routing changes.

| File | Change |
|---|---|
| `src/lib/archive-preview-catalog.ts` | (1) `chapterLabel: "Chapter I — The Beginning"` → `"Chapter I — Genesis Signal"`. (2) Added a 9th entry (ID 9 · "Protocol Chronicle (roadmap)") marked truthfully as not configured on-chain. |
| `src/components/syndicate/ArchiveGalleryPreview.tsx` | "Chapter I · The Beginning" → "Chapter I · Genesis Signal" in the ID 1 detail panel. |
| `docs/ARCHIVE_9_SLOT_READINESS_AUDIT.md` | New — this report. |

ID 9 card shows:
- Status pill: `ROADMAP · NOT ACTIVE`
- "Remaining (live)" cell: `Read error` (truthful — the contract reverts)
- Description: "Concept preview only. ID 9 is not configured on the
  deployed Archive1155 contract — `getArtifactCore(9)` reverts."

### `/nft` page harmonization status

- ✅ All 9 IDs now render in the gallery.
- ✅ ID 1 — clearly LIVE / MINT OPEN, mint flow intact, contract-rendered SVG.
- ✅ ID 2 — clearly RESERVED · DISABLED, no mint CTA.
- ✅ ID 3 — clearly CONFIGURED · NOT ACTIVE, inert "Not active yet" button.
- ⚠️ IDs 4–8 — on-chain configured (ownerOnly, inactive); shown as
  ROADMAP · NOT ACTIVE with on-chain names (see §C — rename blocked
  pending founder decision).
- ✅ ID 9 — shown as roadmap slot, explicitly labeled "not configured
  on-chain".
- ✅ No disabled item has a mint CTA.
- ✅ No item implies yield / dividend / revenue share / Vault ownership /
  LP ownership / governance / equity (catalog `rights` object enforces
  `financial: "none"`, `vaultClaim: "none"`, etc., across every card).
- ✅ "Preview · not contract-rendered" only appears where renderer
  mode is `NONE` on-chain.

### Build / typecheck / tests

- `bunx tsc --noEmit` → ✅ clean
- `bunx vitest run` → ✅ 22 / 22 passing (5 archive-truth + 17 mint-phase)

---

## E. Confirmations (founder-requested)

- ✅ All 9 IDs visible in UI.
- ✅ ID 1 remains mint OPEN (active=true, frozen, mintable, 3 minted).
- ✅ ID 2 remains reserved/disabled (active=false, ownerOnly, maxSupply=0).
- ✅ ID 3 remains inactive — **no `setDropActive(3, true)` was sent.**
- ✅ IDs 4–9 remain inactive (4–8 on-chain ownerOnly inactive; 9 not configured).
- ✅ No SeatRecord721 work.
- ✅ No Archive1155 Solidity changes, no ABI changes, no addresses
  fabricated, no transactions sent, no deployments.

---

## F. Activation plan (NOT executed)

Owner wallet `0xa2E5…6e2F` is the sole signer for every step below.
Network: Avalanche C-Chain (43114). Each tx ~30–80k gas (writes to a
single `mapping` slot per call), well under 1 USD at typical gas.

### F.1 — Activatable today on existing contract (no new code)

| ID | Recommended action | Pre-tx requirements | Tx |
|---:|---|---|---|
| 3 — Patron Seal | Go public | Confirm price 5.00 USDC is final (catalog and on-chain agree; `archive-config.ts` 9 USDC is stale and should be corrected first in a separate UI pass). Confirm renderer SVG renders. Optional `freezeArtifactDefinition(3)` after. | `setDropActive(3, true)` |
| 4–8 | Either rename via `updateArtifactDefinition` (Path 2 in §C) **or** activate as ownerOnly admin-mints when their real triggers fire (Path 1). Either way: do NOT call `setDropActive(true)` for ownerOnly artifacts — they mint via `adminMint` only. | Founder decision on §C. Real trigger event (member #333 sealed, first LP event, first routing tx, era closure). | per-ID: `adminMint(wallet, id, 1)` at trigger |
| 9 — Protocol Chronicle | Configure on-chain when its purpose, supply, and renderer are finalized. | Final name / description / externalUrl / renderer / supply / walletLimit / price / ownerOnly decided. | `configureArtifact(9, def)` — does NOT activate; follow with `setDropActive(9, true)` only if public. |

### F.2 — Should stay disabled

- ID 2 — permanent. `RESERVED_SEAT_RECORD_ID` is enforced at the
  contract level; do not attempt to update or activate.
- IDs 4–8 — should remain ownerOnly. Public `setDropActive` would
  open them as 0-USDC public mints because `priceUsdc=0` on each.

### F.3 — Required signer, gas, verification, rollback

- **Signer:** `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` (current `owner()`).
- **Gas:** Avalanche C-Chain, ~25 nAVAX base; budget < $0.05 per tx.
- **Verification after each tx:** re-read `getArtifactCore(id)` and
  `isMintable(id, refWallet, 1)` from the same RPC; compare against
  expected diff; visually verify the `/nft` card pill flips.
- **Rollback:** every state-changing call has an inverse —
  `setDropActive(id, false)`, `updateArtifactDefinition` with the
  previous tuple, `pause()` for whole-contract emergency stop.
- **Stop conditions:** any mismatch between simulated tuple and
  read-back tuple; any unexpected `paused()`; any `owner()` change;
  any USDC treasury address drift.

### F.4 — What is explicitly NOT part of activation

- SeatRecord721 — separate future ERC-721 contract, design pass not
  yet started.
- Any rename of IDs 4–8 without founder approval (§C, Path 1 vs Path 2).
- Any `freezeArtifactDefinition` call — irreversible; only freeze after
  metadata is locked and visually confirmed for the relevant ID.

---

## G. Blockers before on-chain activation

1. **Founder decision on §C** — Path 1 (accept current on-chain names,
   defer chapter relics to IDs 10–14) vs Path 2 (rewrite IDs 4–8 text
   on-chain). Blocks any rename work.
2. **Patron Seal price reconciliation** — `archive-config.ts` says 9
   USDC; contract and preview catalog say 5 USDC. Founder must confirm
   which is canonical before activating ID 3.
3. **Renderer for ID 3** — `rendererMode=ONCHAIN_SVG` is set on-chain
   but `uri(3)` is currently empty. Visual confirmation needed before
   `setDropActive(3, true)` so the card does not render blank.
4. **Owner wallet operational readiness** — confirm
   `0xa2E5…6e2F` is hot/cold-signing-ready and that the founder
   controls it (the audit can only verify it is the contract owner;
   it cannot verify custody).
5. **ID 9 doctrine finalization** — name, renderer, supply, ownerOnly
   flag, target price all still TBD per the 9-slot doctrine.

---

## Decision Lens Verdicts

| Lens | Verdict | Note |
|---|:---:|---|
| Founder | ✅ | No premature on-chain action; doctrine clarified before deploy. |
| Investor | ✅ | All claims now match on-chain truth; no fabricated state. |
| Growth | ⚠ | ID 3 activation deferred — minor narrative slowdown. |
| Behavioral | ✅ | "Roadmap · not active" framing prevents false urgency. |
| UX | ✅ | 9 cards now present; truthful pills; no dead CTAs. |
| Product | ✅ | Reveals real config gap between catalog and contract (Patron Seal price). |
| Staff Eng | ✅ | All capability questions answered against verified ABI + live RPC reads. |
| QA | ✅ | tsc clean, 22/22 tests green, on-chain state queried twice for confirmation. |
| A11y | ✅ | New ID 9 card uses existing accessible card primitives. |
| SEO | ✅ | No metadata or canonical changes. |

Stop here. Awaiting founder decision on §C and §G before any
Archive1155 transaction or SeatRecord721 design pass.
