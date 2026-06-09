# THE SYNDICATE — PRODUCT ARCHITECTURE MAP

Systems-level view of the product. For every system: what exists today,
what's live, what's pending, source of truth, exposing pages, governing
docs, risks. Audit only — recommendations not implemented.

---

## 1. Core Protocol

### SYN Token
- **What exists**: ERC-20 on Avalanche C-Chain, fixed 1B supply.
- **Live**: contract deployed, supply readable, balances readable.
- **Pending**: nothing — token is final.
- **Source of truth**: token address in `syndicate-config.ts`.
- **Pages**: `/token`, `/tokenomics`, registry, transparency.
- **Docs**: `TERMINOLOGY_GLOSSARY.md`, `SYNDICATE_PROTOCOL_MODEL.md`.
- **Risk**: people confusing token holdings ↔ vault claim. Mitigated by
  banned vocabulary + RiskDisclaimer.

### Membership Sale
- **Live**: `SyndicateMembershipSale` accepts USDC at fixed 1 SYN = $0.01.
- **Pending**: nothing.
- **Source**: `sale-abi.ts`, `sale-hooks.ts` (`useSaleStats`,
  `useLivePurchaseEvents`).
- **Pages**: `/join` (write), `/transparency`, `/activity`, homepage strips.
- **Risk**: contract is the only mint path users hit — keep it singularly
  obvious.

### 70 / 20 / 10 routing
- **Live**: atomic on every purchase (split inside the Sale contract).
- **Source**: `RoutingFlow`, `UseOfFunds`, `CapitalAllocation`, `TreasuryComposition`.
- **Pages**: `/`, `/transparency`, `/vault`.
- **Risk**: visual fatigue — same idea told 4 times. See content + UX audits.

### Registry
- **Live**: every public address present and labeled.
- **Pages**: `/registry`, footer of `/transparency`.
- **Risk**: long address list on mobile.

### Liquidity
- **Live**: SYN/USDC Trader Joe pair reserves readable.
- **Pending**: PCA-level LP management policy.
- **Pages**: `/liquidity`, `/transparency`, homepage LP card.

### Vault wallet
- **Live**: EOA holds 70% USDC inflow.
- **Pending**: programmatic Vault Contract with explicit deposit/withdraw policy.
- **Pages**: `/vault`, `/transparency`.
- **Risk**: "Vault Wallet" vs "Vault Contract" vs "Vault Reserve (25% SYN)".
  Glossary handles this; UI must keep `VaultDisambiguation` visible.

### Operations wallet
- **Live**: EOA holds 10% USDC inflow.
- **Pages**: `/transparency`, `/registry`.

---

## 2. Identity

### Members
- **What exists**: every wallet that bought SYN appears.
- **Live**: derived from holder index.
- **Pages**: `/members`, `/wallet/$address`.
- **Risk**: must never imply ranking by wealth.

### Founders
- **Live**: first-N members highlighted.
- **Pages**: `/founders`.
- **Docs**: `FOUNDERS_HALL_SPEC.md`.

### Chapters
- **Partial**: windows defined in config; counts live.
- **Pages**: `/chapters`, `/chapters/$slug`.
- **Docs**: `CHAPTER_ARCHIVES_SPEC.md`, `CHAPTER_ARCHIVES_QA.md`.

### Ranks
- **Partial**: distribution live; simulator config-driven.
- **Pages**: `/ranks`.
- **Docs**: `RANK_DISTRIBUTION_SPEC.md`.
- **Risk**: must reflect participation, never payouts (Core memory).

### Wallet pages
- **Live**: per-address holdings + purchase history + chapter/rank derivation.
- **Pages**: `/wallet/$address`.
- **Docs**: `WALLET_UX_FLOWS.md`, `WALLET_SESSION_AUDIT.md`.

---

## 3. Activity / Memory

| Surface | Status | Source |
|---|---|---|
| Activity feed | LIVE | `useLivePurchaseEvents` |
| Protocol timeline | LIVE | events + pulse |
| Milestones | PARTIAL | `MilestoneTracker` config + events |
| Since Your Last Visit | LIVE | `visitor-memory` localStorage diff |
| Recency strip | LIVE | events + pulse |

**Risk**: localStorage memory invisible across devices — acceptable for
phase, but flag for later.

---

## 4. Transparency

| Surface | Status |
|---|---|
| Contract addresses | LIVE |
| Wallet addresses | LIVE |
| Snowtrace deep links | LIVE |
| Proof cards (Routing, Verify) | LIVE |
| Use of funds breakdown | LIVE |
| Verification steps | LIVE |

Docs: `LIVE_DATA_COMPLETION_AUDIT.md`, `LIVE_SITE_DISCREPANCY_AUDIT.md`,
`PROTOCOL_COHESION_AUDIT.md`.

---

## 5. Growth / Shareability

| Surface | Status |
|---|---|
| OG cards (static) | LIVE for `/`, `/transparency` |
| OG cards (dynamic) | LIVE for wallet + milestone |
| ShareActions component | LIVE |
| HomeShareCTA | LIVE |
| Wallet share intents | LIVE (wave-3A) |

Docs: `OG_RENDERING_STRATEGY.md`, `OG_RENDERING_VERIFICATION.md`,
`WAVE_3B_GATE.md`.

**Risk**: share intents currently homepage + wallet only — milestone share
is implicit via deep link. Wave 3B may extend; gated.

---

## 6. Future / Pending modules (DO NOT BUILD)

| Module | Status | Visible? | Notes |
|---|---|---|---|
| NFT recognition | PENDING | `/nfts` exists but hidden | Banned scope until further notice. |
| Referral | PENDING | not exposed | Banned scope. |
| Governance | PENDING | mentioned in roadmap only | Banned scope. |
| AI module | PENDING | `/ai` exists but hidden | Banned scope. |
| Vault Automation (programmatic Vault Contract) | PENDING | labeled on `/vault` | Long-term roadmap item. |

For every pending module the copy must:
- be labeled PENDING with a status pill,
- never claim a date,
- never imply guaranteed delivery,
- link to roadmap or docs for context.

---

## Per-system risk summary

| Risk | Severity | Mitigation today |
|---|---|---|
| Vault wallet ↔ Vault contract confusion | High | `VaultDisambiguation` + glossary |
| "Treasury" sounding like equity | High | Banned vocabulary + RiskDisclaimer |
| Pending modules feeling like vaporware | Med | PENDING pills, roadmap framing |
| Identity surfaces (members/founders/chapters) overlap | Med | Distinct page titles + intros |
| LocalStorage memory non-portable | Low | Acceptable for phase |
| OG image coverage uneven | Low | Wave 3B candidate |
