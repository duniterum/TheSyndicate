# 02 â€” SOURCE OF TRUTH TABLE

For every major concept: its **contract source**, **code source**, **doc source**,
**status**, and **confidence**. This is the daily lookup table. *Code and contracts
outrank everything here* â€” if a value below disagrees with the live read, the live
read is correct and this table is stale (fix it).

**Status legend:** LIVE (on-chain verifiable) Â· PARTIAL (live but incomplete) Â·
PENDING (not deployed) Â· FUTURE (not built) Â· MOCK (placeholder data â€” not real).

---

## Concepts

| Concept | Code source | Contract source | Doc source | Status | Confidence | Drift risk |
|---|---|---|---|---|---|---|
| SYN token | `syndicate-config.ts` `TOKEN_SPEC` | SYN ERC-20 | `SYNDICATE_PROTOCOL_MODEL.md` | LIVE | High | Low |
| Membership sale V1 | `CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS`, historical scanners | Original Membership Sale | `SALE_FLOW_INVARIANTS.md`, `SYNDICATE_PROTOCOL_MODEL.md` | LIVE / HISTORICAL ONLY | High | Med (must not be treated as current buy target) |
| Membership sale V2a | `MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS`, historical scanners | SyndicateMembershipSale V2a | `SYNDICATE_PROTOCOL_MODEL.md`, `SMART_CONTRACT_SYSTEM_MAP.md` | LIVE / HISTORICAL ONLY | High | Med (kept for seats #3-#5 continuity; never current buy target) |
| Membership sale V2b | `MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS`, sale hooks | SyndicateMembershipSale V2b | `SYNDICATE_PROTOCOL_MODEL.md`, `SMART_CONTRACT_SYSTEM_MAP.md` | LIVE / CURRENT BUY PATH / UNAUDITED EARLY | High | Low (active frontend buy target) |
| V3 SourceRegistry | Docs/readback log only; not wired in `contract-registry.ts` live registry | SourceRegistryV1 `0x780013bB358be6be95b401901264FC7c22a595a6` | `V3_NON_LIVE_DEPLOYMENT_READBACK_LOG.md`, `V3_PROTOCOL_ENGINE_CONSTITUTION.md`, `V3_EXTERNAL_REVIEW_PACKAGE.md` | DEPLOYED / NON-LIVE / OWNER ACCEPTED / NO SOURCE RECORDS | High | High (must not be treated as live source UI) |
| V3 MembershipSale | `/v3-preview` read-only; not wired in frontend registry | MembershipSaleV3 `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` | `V3_NON_LIVE_DEPLOYMENT_READBACK_LOG.md`, `V3_PROTOCOL_ENGINE_CONSTITUTION.md`, `V3_DEPLOYMENT_READINESS_PACKAGE.md` | DEPLOYED / NON-LIVE / OWNER ACCEPTED / ZERO-FUNDED / NOT REGISTRY-WIRED / NOT ACTIVATED | High | High (must not replace V2b before funding/activation/registry switch) |
| 70/20/10 routing | `USDC_ROUTING`, `vaultFlow()` | sale contract | `REVENUE_ATTRIBUTION_LAYER.md` | LIVE | High | Med (applied beyond sale) |
| Total supply | `TOKEN_SPEC.totalSupply` | SYN ERC-20 | glossary | LIVE | High | Low |
| Circulating supply | `treasury-hooks.ts` `useCirculatingSupply` | derived (total âˆ’ reserved) | `TREASURY_LEDGER_DOCTRINE.md` | PARTIAL | Med | Med (estimate) |
| Burned supply | `protocol-metrics-registry.ts` `burnedSupply`, `treasury-hooks.ts` `useSynSupply` | SYN ERC-20 `balanceOf(0xâ€¦dEaD)` | glossary | LIVE | High (Proof of Burn #001 Â· 1,000 SYN) | Med (one verified Founder Burn; no automated burn â€” a burn is a transfer, totalSupply unchanged) |
| Allocation wallets | `ALLOCATION_WALLETS`, `nonCirculating` | 7 wallets | `DATA_SOURCE_MAP.md` | LIVE | High | Low |
| Member number | `holder-index.ts` | derived from sale events | `HOLDER_INDEX_ARCHITECTURE.md` | LIVE | High | Low |
| Current seat status | `holder-index.ts`, SYN balance reads | SYN ERC-20 | `IDENTITY_ATTRIBUTION_CONSTITUTION.md` | LIVE | High | Med (transfers change current seat status) |
| Historical identity | Holder Index, receipts, Activity/Register reads | sale events; future SeatRecord721 pending | `IDENTITY_ATTRIBUTION_CONSTITUTION.md` | PARTIAL | High | Med (future wallet migration policy not built) |
| Chapters | `chapters.ts` | derived | authority map | LIVE | High | Low |
| Ranks | `RANKS_V2`, `rankForUsdc` | derived (cumulative USDC) | `RANK_CONSTITUTIONAL_RULING.md` | LIVE | High (code) / Med (glossary) | Med |
| Artifacts | `archive-id-registry.ts` | Archive1155 | `ARCHIVE1155_CANONICAL_ARCHITECTURE.md` | PARTIAL | High | Med |
| First Signal (ID 1) | `ARCHIVE_CONTRACT_STATE` | Archive1155 ID 1 | archive docs | LIVE (0.50 USDC) | High | Med (price drift vs `GENESIS_NFT_PRICE`) |
| Patron Seal (ID 3) | `ARCHIVE_CONTRACT_STATE` | Archive1155 ID 3 | archive docs | LIVE (5.00 USDC, supply 10k) | High | Med (name collision w/ rank) |
| LP | `LP_POOL`, `onchain-events.ts` | Trader Joe v1 pair | `DATA_SOURCE_MAP.md` | LIVE | High | Med (fee destination unclear) |
| Vault Wallet (70% USDC) | `CONTRACTS.VAULT_WALLET` | Vault Wallet EOA | glossary | LIVE | Med | **High** (shares addr w/ Vault Reserve; overloaded) |
| Vault Reserve (25% SYN) | `syndicate-config.ts` reserve allocation | same EOA as Vault Wallet | glossary | LIVE | Med | **High** (same address) |
| Treasury (movements) | `transaction-tags.ts` | allocation wallets | `TREASURY_LEDGER_DOCTRINE.md` | PARTIAL (manual tagging) | Med | High |
| Operations Wallet (10%) | `CONTRACTS.OPERATIONS_WALLET` | Operations EOA | glossary | LIVE | High | Low |
| Activity | `protocol-events.ts` | reads chain | `STORY_ENGINE_*` | LIVE | High | Low |
| Chronicle | `chronicle-entries.ts`, `validateChronicleEntry` | â€” | `PROTOCOL_CHRONICLE_*` | PARTIAL (curated) | Low | High (vs Activity) |
| Members metric | `MEMBER_DEFINITION` (`syndicate-config.ts`) â€” read by both `protocol-truth.ts` & `data-verification-registry.ts` | sale events | `DATA_VERIFICATION_REGISTRY.md` | PARTIAL (until first buy) | High | Low â€” unified to one shared definition 2026-06-11 |
| Referral / Source attribution | `future-referral.ts`, `preview/referral.ts`, SourceRegistryV1 candidate | SourceRegistryV1 candidate; no live address | `IDENTITY_ATTRIBUTION_CONSTITUTION.md`, `V3_PROTOCOL_ENGINE_CONSTITUTION.md`, `REVENUE_ATTRIBUTION_LAYER.md` | PENDING / CANDIDATE | Med | High (must not imply source owns member or referral is live) |
| Reward / Reputation | `quest-hooks.ts` (labs) | none | `REPUTATION_FORMULA_DOCTRINE.md` | FUTURE | Low | High |
| Burn mechanism (automated) | *(none)* | none | â€” | FUTURE | High (none) | Med (the one-time Founder Burn is real and surfaces as *Burned supply* above; no recurring/automated burn mechanism) |
| SeatRecord721 | `contract-registry.ts` (null) | none | `SEAT_RECORD_ARCHITECTURE_DECISION.md` | PENDING | High | Low (correctly null) |
| Governance | *(none)* | none | `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` | FUTURE | Low | Med |
| Legal language | `LEGAL_DISCLAIMER`, `live-content-rules.json` | â€” | `TERMINOLOGY_GLOSSARY.md` | LIVE | High | Med |
| Banned vocabulary | `doctrine-guard.test.ts` `DOC_BANNED` / `BANNED` | â€” | glossary | LIVE | Med | Med (guard decoupled) |
| Mock treasury data | *(removed)* | â€” | â€” | **REMOVED** | None | Removed 2026-06-12 â€” `VAULT_ASSETS` / `VAULT_INFLOWS` / `VAULT_HISTORY` / `useLiveData` and the off-by-default "Future Vault preview" deleted. `/vault` now shows only real `useTreasuryAssets` reads (TreasuryComposition). Earlier dead fake constants (`GENESIS_NFT_PRICE`, `VAULT_STARTING_VALUE`, `NEXT_MILESTONE_VALUE`) removed 2026-06-11 |

---

## Live contract addresses (Avalanche C-Chain Â· 43114)

> Always import addresses from `src/lib/contract-registry.ts` / `chain-registry.ts`
> in code â€” never hardcode. This table is a human reference only.

| Name | Address |
|---|---|
| SYN token (ERC-20) | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| USDC | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| Membership Sale V1 (historical proof source only) | `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` (deploy block 87,157,852; not the current buy target) |
| Membership Sale V2a (historical proof source only) | `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48` (sealed/superseded; scanned for member continuity) |
| Membership Sale V2b (current live buy target) | `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` (active self-service sale; live-but-unaudited / early) |
| V3 SourceRegistry | `0x780013bB358be6be95b401901264FC7c22a595a6` (deployed non-live; owner accepted; no source records; not frontend-wired) |
| V3 MembershipSale | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` (deployed non-live; owner accepted; zero-funded; not registry-wired; not activated; V2b remains current buy target) |
| Vault Wallet (70%) **= Vault Reserve** | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` |
| Liquidity Wallet (20%) | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |
| Operations Wallet (10%) | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |
| Archive1155 | `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` (deployed 2026-06-06) |
| LP pair (Trader Joe v1, SYN/USDC) | `0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389` |

---

## Source-of-truth discrepancies

1. **"Members" definition â€” RESOLVED (2026-06-11).** Both `protocol-truth.ts` and
   `data-verification-registry.ts` now read one shared constant,
   `MEMBER_DEFINITION` in `syndicate-config.ts`. Canonical ruling (see
   `03_GLOSSARY.md`): **Member = sale buyer** (distinct `TokensPurchased` buyers,
   de-duplicated via the holder index). The verification registry previously
   *described* the number as "SYN Transfer-event recipients / non-zero balance
   holders" â€” that text was wrong (it described a Holder) and has been corrected;
   the runtime value was already the buyer count, so no displayed number changed.
2. **Vault Wallet and Vault Reserve share one address â€” OPEN (disclosure rule).**
   They are *conceptually* distinct (70% USDC operating wallet vs 25% SYN long-term
   reserve) but resolve to `0x205DdCâ€¦464` on-chain. This must be disclosed wherever
   either is shown, never presented as two separate balances.

