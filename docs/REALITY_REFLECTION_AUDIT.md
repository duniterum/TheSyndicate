# Reality Reflection Audit

> **Current truth (2026-06-08):** Archive1155 is LIVE on Avalanche. ID 1 (First Signal, 0.50 USDC) and ID 3 (Patron Seal, 5.00 USDC) are both LIVE public mints. ID 3 is no longer `CONFIGURED_NOT_ACTIVE`. Any row below that still describes ID 3 as configured-not-active, deferred, or pending activation describes an earlier phase and is preserved for historical reference only — `docs/DEPLOYMENT_STATE_V1.md` and `docs/CONTRACT_INTEGRATION_STATUS.md` are the canonical live trackers.

**Date:** 2026-06-08
**Scope:** Final foundation pass before Protocol Chronicle (ID 9).
**Mandate:** Audit only. No fixes, no refactors, no activations, no deploys.

Compares on-chain truth · canonical registries (`archive-id-registry.ts`,
`contract-registry.ts`, `chain-registry.ts`) · source code · live site
(`thesyndicate.money`, `/nft`, `/archive`, `/activity`, `/registry`,
`/members`, `/my-syndicate`, `/wallet/$address`, `/transparency`,
`/whitepaper`) · docs · explorer surfaces · wallet/ownership surfaces ·
payment flows.

Legend: ✅ PASS · ⚠ WARN · ✗ BLOCKER

---

## A. Audit creation
This file is the audit. No follow-up file required.

---

## B. Archive1155 ID Reconciliation (1–9)

On-chain truth pulled in prior turns via `useArchiveId()` reads against
`ARCHIVE_NFT_CONTRACT_ADDRESS` on Avalanche C-Chain (43114). Registry =
`src/lib/archive-id-registry.ts`. UI = `MintFirstSignal`,
`MintPatronSeal`, `ArchiveGalleryPreview`, `ArchiveContractStatus`,
`/my-syndicate`, `/archive`. Catalog = `archive-config.ts`.

| ID | Name | Chain `active` | Chain `ownerOnly` | Registry `activation` | Registry price | UI price | publicMint shown | Verdict |
|----|------|---------------|-------------------|----------------------|---------------|----------|------------------|---------|
| 1 | The First Signal | true | false | LIVE_PUBLIC_MINT | 0.50 USDC | 0.50 USDC | yes | ✅ |
| 2 | Reserved Seat Record Ref | configured, ownerOnly | true | RESERVED_DISABLED | — | identity-band only, no CTA | no | ✅ |
| 3 | Patron Seal | true | false | LIVE_PUBLIC_MINT | 5.00 USDC | 5.00 USDC | yes | ✅ |
| 4 | Protocol Memory IV | configured, ownerOnly | true | OWNER_ONLY | — | shelf only, no CTA | no | ✅ |
| 5 | Protocol Memory V | configured, ownerOnly | true | OWNER_ONLY | — | shelf only, no CTA | no | ✅ |
| 6 | Protocol Memory VI | configured, ownerOnly | true | OWNER_ONLY | — | shelf only, no CTA | no | ✅ |
| 7 | Protocol Memory VII | configured, ownerOnly | true | OWNER_ONLY | — | shelf only, no CTA | no | ✅ |
| 8 | Protocol Memory VIII | configured, ownerOnly | true | OWNER_ONLY | — | shelf only, no CTA | no | ✅ |
| 9 | Protocol Chronicle | **not configured** | n/a | NOT_CONFIGURED | — | roadmap-only label | no | ✅ |

**No BLOCKERS.** Registry, contract, and UI agree across all 9 ids.
Wallet-limit (5 / 5) and supply caps (null / 10,000) match catalog.

---

## C. Live Site Crawl

Routes reviewed for stale prices, statuses, ownership pills, mint
states, FAQ statements:

| Route | Findings |
|-------|----------|
| `/` | ✅ |
| `/nft` | ✅ 0.50 USDC consistent; Patron Seal panel reads 5.00 USDC |
| `/archive` | ✅ ID 1 OPEN @ 0.50; identity band for ID 2; shelf IDs 4–8; ID 9 roadmap |
| `/activity` | ✅ live indexer feed + new `IndexerFreshnessBadge` (3 honest signals) |
| `/registry` | ✅ Archive entry now mentions ID 1 AND ID 3 LIVE; explorer via canonical helpers |
| `/members` | ✅ |
| `/wallet/$address` | ✅ live `balanceOf` per id, no fabricated ownership |
| `/my-syndicate` | ✅ ID 1 + ID 3 listed as "Active · mint open" with correct prices |
| `/transparency` | ⚠ blurb mentions only "The First Signal (ID 1) public mint is OPEN" — ID 3 Patron Seal absent. Truthful but **incomplete** now that ID 3 is also live. Non-blocking. |
| `/whitepaper` | ⚠ same omission as `/transparency` (ID 3 not mentioned). |
| `/verify` | n/a (route doesn't exist — verification is folded into `/transparency` + `/registry`) |

No stale "coming soon" / "configured" / "not active yet" surfaces
remain for ID 3. The single "Not active yet" string in
`MintPatronSeal.tsx` is conditional on `art.active === false`, which
the chain reports as `true` → string is unreachable. ✅

---

## D. Explorer Verification

| Surface | Helper used | Resolves | Verdict |
|---------|-------------|----------|---------|
| `txUrl()` → Snowtrace `/tx/<hash>` | canonical | yes | ✅ |
| `txUrls()` fan-out → Snowtrace + Avascan `/blockchain/c/tx/` + Routescan | canonical | yes | ✅ |
| `addressUrl()` → Avascan `/blockchain/c/address/` | canonical | yes | ✅ |
| `tokenUrl()` → Snowtrace `/token/` | canonical | yes | ✅ |
| `contractUrl()` / `erc1155TokenUrl()` | canonical | yes | ✅ |
| MetaMask default origin | bare `https://snowtrace.io` (path `/`) | yes (avoids dead avascan `/tx/`) | ✅ |
| Wallet "View on explorer" fallback | `MetaMaskExplorerFix` opt-in only | yes | ✅ |
| `/activity` "Open in explorer" | hardcoded `https://avascan.info/blockchain/all/address/<vault>/transactions` | yes | ⚠ valid path but bypasses canonical helper |
| `routes/__root.tsx` sameAs JSON-LD | hardcoded Avascan token + Snowtrace token | yes | ⚠ canonical-helper bypass (cosmetic) |
| `routes/risk.tsx`, `routes/whitepaper.tsx` proof buttons | hardcoded `https://avascan.info/blockchain/c/...` | yes | ⚠ canonical-helper bypass |
| `components/syndicate/Sections.tsx` Genesis events | hardcoded Avascan `/blockchain/c/...` URLs | yes | ⚠ canonical-helper bypass |
| `components/syndicate/ContractDossiers.tsx` USDC link | hardcoded `snowtrace.io/token/<usdc>` | yes | ⚠ canonical-helper bypass |

No bare `avascan.info/tx/<hash>` URLs anywhere in `src/` outside test
fixtures and explanatory comments. No 404-producing explorer links.
The ⚠ entries are policy drift only (hand-built but well-formed) —
test `scripts/check-explorer-urls.mjs` + `explorer-urls.test.ts`
already pass.

---

## E. Wallet / Ownership Audit

Reference wallet: `0x244531C571966f90f4849e03a507543d90f9C721`
(known ID 1 minter + ID 3 minter after the recent mint).

| Surface | Source | Verdict |
|---------|--------|---------|
| `balanceOf(addr, 1)` / `balanceOf(addr, 3)` | live RPC via `useArchiveBalances` | ✅ |
| `/my-syndicate` ownership cards | `useArchiveBalances` + indexer | ✅ |
| `/wallet/$address` page | live RPC | ✅ |
| NFT page ("you own N") | live RPC inside `MintFirstSignal` / `MintPatronSeal` | ✅ |
| Registry ownership | none claimed (registry is contract-level, not wallet-level) | ✅ |
| Activity feed ownership | indexer events; new freshness badge shows LIVE / PENDING / FAIL honestly | ✅ |
| `wallet-freshness.ts` guard | blocks tx when injected account ≠ Wagmi address | ✅ (tests pass) |

No fabricated ownership. No stale ownership. LIVE / INDEXED / LOCAL
pills accurate.

---

## F. Payment Flow Audit

Three live flows: SYN Sale (`LivePurchase.tsx`), ID 1
(`MintFirstSignal.tsx`), ID 3 (`MintPatronSeal.tsx`).

| Primitive | SYN Sale | ID 1 | ID 3 |
|-----------|----------|------|------|
| `assessPayment()` / `payment-flow.ts` | ✅ | ✅ | ✅ |
| `wallet-freshness` pre-tx guard | ✅ | ✅ | ✅ |
| `tx-lifecycle` states | ✅ | ✅ | ✅ |
| `tx-errors` decoded | ✅ | ✅ | ✅ |
| `useMintHashPersistence` (refresh-safe success) | ✅ | ✅ | ✅ |
| Canonical explorer helpers in success panel | ✅ | ✅ | ✅ |
| Account-pinned writes (chain id + address) | ✅ | ✅ | ✅ |
| Registry-only ABI / address | ✅ | ✅ | ✅ |

All three flows now share one architecture. No divergence found.

---

## G. Documentation Drift

| Doc | Stale claim | Severity |
|-----|-------------|----------|
| `docs/ARCHIVE_9_SLOT_READINESS_AUDIT.md` (L222, L262, L273) | calls `archive-config.ts` "9 USDC stale" — but `archive-config.ts` line 220 now reads `targetPriceUsdc: 5`. The audit's *own* claim is now stale. | ⚠ |
| `docs/NFT_ARCHIVE_EXPLAINED.md` (L45) | "Seals · Support & Legacy (Patron Seal) — DEFERRED — pending legal + spec freeze" → contradicts ID 3 LIVE. | ⚠ |
| `docs/NFT_FINAL_ARCHITECTURE_AUDIT.md` (L106) | "#3 Patron Seal (Support · READY, not active)" → contradicts ID 3 LIVE. | ⚠ |
| `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md` (L70) | "Patron Seal public mint · Configured on Archive1155 but not active" → contradicts ID 3 LIVE. | ⚠ |
| `docs/DOCUMENTATION_AUTHORITY_MAP.md` (L217) | correctly flags the legacy "Patron Seal at 9 USDC" claim — keep as-is. | ✅ |
| `docs/ARCHIVE1155_CANONICAL_ARCHITECTURE.md` | ID 9 still flagged as not configured — correct. | ✅ |
| `docs/SALE_FLOW_INVARIANTS.md` | matches code. | ✅ |
| `docs/DEPLOYMENT_STATE_V1.md` | ID 3 mint hash entry present. | ✅ |

No fixes applied per directive.

---

## H. Future NFT Readiness (ID 10, 11, 12…)

What a new id automatically inherits when `configureArtifact(N, def)`
+ `setDropActive(N, true)` are called on-chain:

| Subsystem | Auto-inherited? | Notes |
|-----------|-----------------|-------|
| `useArchiveId(id)` chain reads | ✅ | parameterized by id |
| `useArchiveBalances` ownership | ✅ | scans all configured ids |
| Explorer helpers | ✅ | id-agnostic |
| Error model (`tx-errors`) | ✅ | shared |
| `useMintHashPersistence(wallet, ARCHIVE, id)` | ✅ | id key supported |
| `payment-flow` assessment | ✅ | id-agnostic |
| Activity feed | ✅ | indexer reads all ids |
| Freshness badge | ✅ | global |

What still requires **manual work** per new id:

| Item | Why | Severity |
|------|-----|----------|
| Add entry in `src/lib/archive-id-registry.ts` | UI gate of record — blocks public CTA until added | ⚠ required by design |
| Add catalog entry in `src/lib/archive-config.ts` | gallery card, name, description, target price | ⚠ required by design |
| Build a dedicated `Mint<Name>.tsx` component | each id has its own copy, visual, anatomy bands | ⚠ template exists (`MintPatronSeal` is the canonical reference) |
| Mount the new mint component on `/nft` (or wherever) | route composition | ⚠ |
| Renderer SVG / metadata (if on-chain rendered) | art per id | ⚠ |
| OG image template for the new id | shareability | ⚠ |

**Verdict:** the *infrastructure* is id-generic; the *presentation* is
not. This is intentional (each id is a distinct artifact with its own
story) — but it means "add ID 10" is a ~1-day UI task, not a config
change. Worth noting in the Protocol Chronicle plan.

---

## I. Execution Control Cross-Check

`src/lib/execution-gates.ts` + `scripts/check-execution-gates.mjs` +
`scripts/check-release.mjs` catch:

| Failure class | Caught? | Gate |
|---------------|---------|------|
| Wrong address | ✅ | `contract-registry-guard` + `archive1155-canonical` tests |
| Wrong ABI | ✅ | `check-archive-abi.mjs` |
| Wrong explorer (bare avascan `/tx/`) | ✅ | `no-bare-avascan-tx` gate + `explorer-urls.test.ts` |
| Wrong activation order (id without registry entry) | ✅ | `archive1155-canonical.test.ts` (ID 9 stays NOT_CONFIGURED) |
| Stale NFT status copy | ⚠ partial | `check-live-content.mjs` checks select strings; doesn't crawl every "coming soon"/"not active" claim in docs |
| Fake ownership | ✅ | no hardcoded balances anywhere; covered by tests |
| Stale pricing | ⚠ partial | `live-content-rules.json` enforces SYN price; no rule enforces ID-1 (0.50) or ID-3 (5.00) prices against catalog |
| Stale doctrine in docs | ✗ no gate | docs are not scanned by execution gates |

**Gaps (report only — do not implement):**
1. No price-parity gate between `archive-id-registry.ts` ↔
   `archive-config.ts` ↔ rendered route text.
2. No doc-staleness gate (would catch ID 3 still being called
   "DEFERRED" in `NFT_ARCHIVE_EXPLAINED.md`).
3. No "every LIVE_PUBLIC_MINT id is mentioned on /transparency and
   /whitepaper" gate.

---

## J. Final Report

**Files created:** `docs/REALITY_REFLECTION_AUDIT.md` (this file).

**Audit scope:** Sections A–I above.

**PASS items:**
- All 9 Archive1155 ids reconciled (chain ↔ registry ↔ UI).
- All three live payment flows share one canonical architecture
  (`payment-flow` + `wallet-freshness` + `tx-lifecycle` + `tx-errors`
  + `useMintHashPersistence` + canonical explorer helpers).
- No fabricated, stale, or invented ownership anywhere.
- No bare `avascan.info/tx/<hash>` URLs in product code.
- Indexer freshness now honestly surfaced (RPC head + indexer tip +
  probe).
- Mint persistence parity across SYN Sale / ID 1 / ID 3.

**WARN items:**
- `/transparency` + `/whitepaper` blurbs mention only ID 1; ID 3
  Patron Seal absent (truthful but incomplete).
- ~6 hand-built explorer URLs in `routes/__root.tsx`, `routes/risk.tsx`,
  `routes/whitepaper.tsx`, `routes/activity.tsx`,
  `components/syndicate/Sections.tsx`,
  `components/syndicate/ContractDossiers.tsx`. All resolve; all
  bypass canonical helpers.
- 3 doc files contain stale "Patron Seal not active / DEFERRED"
  language (see Section G).
- `ARCHIVE_9_SLOT_READINESS_AUDIT.md` itself contains a now-stale
  claim about `archive-config.ts` Patron Seal price.

**BLOCKERS:** none.

**Documentation drift findings:** see Section G — 4 doc surfaces
need ID 3 status updated. None block Protocol Chronicle.

**Explorer findings:** see Section D — 6 hand-built URLs to migrate
to canonical helpers. None broken.

**Ownership findings:** see Section E — clean.

**Future NFT readiness findings:** see Section H — infra is id-
generic; presentation is per-id by design. Plan ID 10+ as ~1-day UI
work each.

**Execution Control gaps:** see Section I — 3 missing gates (price
parity, doc-staleness, public-mint-mention parity). All cosmetic.

**Must fix before Protocol Chronicle:**
- *Nothing.* Foundation is verified.

**Safely deferred:**
- Migrate the 6 hand-built explorer URLs to canonical helpers.
- Update 4 stale doc surfaces (Patron Seal status, 9-slot audit).
- Add ID 3 to `/transparency` + `/whitepaper` blurbs.
- Optional: add price-parity + doc-staleness execution gates.

**Conclusion:** Protocol Chronicle (ID 9) can be designed on verified
reality. No assumptions remaining.

---

## Repeatable version

This file is a one-time snapshot. The repeatable, module-by-module health view lives at:

- Registry: `src/lib/protocol-health-registry.ts`
- Script: `scripts/check-protocol-health.mjs` (run before publish / activation / deployment / new public mint / major architecture work)
- Tests: `src/lib/__tests__/protocol-health.test.ts`

When the user asks "check the system", run the script and read this snapshot for context.
