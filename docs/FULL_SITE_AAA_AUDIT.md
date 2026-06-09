# FULL_SITE_AAA_AUDIT — Site-wide quality & harmonization sprint

Date: 2026-06-04
Sprint type: quality, harmonization, stale-copy removal, page polish.
No new smart contracts, NFTs, governance, AI, or programmatic Vault built.

---

## Pages audited

Homepage · Token · Tokenomics · Join · Registry · Liquidity · Transparency · Vault · Ranks · Activity · Roadmap · Whitepaper · Docs · FAQ · Risk Notice · Footer / Header.

## What is strong (kept as-is)

- **Homepage** — member-first section order (Why exists → Why become member → Why early → Member Journey → How it works) is working. Trust + Aspiration 70/30 balance feels right.
- **Registry** — comprehensive, every wallet/contract labeled, explorer chips consistent.
- **Join** — live purchase flow, calculator, rank ladder, routing preview are solid; wallet states (connect / approve / buy) work.
- **Transparency** — Verify Everything (Claim → Source → Explorer → Status) is the institutional centerpiece and survived the audit unchanged.
- **Tokenomics** — donut chart, allocation table, runtime guards, CSV export, reconciliation panel all in place.

## What was weak / fixed in this sprint

### Critical routing bug (data integrity)

**`src/components/syndicate/UseOfFunds.tsx`** — the bucket table labeled the 70% row as **"Protocol-Owned Liquidity"** and pointed it at `LIQUIDITY_WALLET`, with Vault demoted to 20%. This contradicted the canonical **70% Vault · 20% Liquidity · 10% Operations** routing used everywhere else.

Fixed: swapped variable assignments and re-labeled rows to **Vault Wallet (70%) · Liquidity Wallet (20%) · Operations Wallet (10%)** with the correct contract addresses. Now matches the Sale contract, Registry, Transparency, Vault, Tokenomics, and FAQ everywhere on the site.

### Stale launch copy removed

| File | Old text | New text |
| --- | --- | --- |
| `src/components/syndicate/SynLiveStatus.tsx` | "The Membership Sale contract is the next milestone." | "The Membership Sale is live — routing, wallets, LP, and core contracts are verifiable today." |
| `src/components/syndicate/VaultPolicyCore.tsx` | "Live USDC routing activates only after `SyndicateMembershipSale.sol` deploys." | "USDC routing is live through the deployed Membership Sale contract. The programmatic Vault contract remains PENDING; today the Vault is a public wallet." |
| `src/components/syndicate/Sections.tsx` (FAQ) | "Every flow is intended to be publicly verifiable onchain." | "Every flow is publicly verifiable onchain today via the Membership Sale contract and the three allocation wallets." |

Earlier sprint already covered most stale wording (see `docs/SITE_HARMONIZATION_AUDIT.md`); these three were the remaining offenders identified in the new audit.

### Roadmap upgrade

Old roadmap: 3 buckets (Live · Pending · Future), bullet-list only, no context.

New roadmap: **5 buckets** — LIVE NOW · NEXT · PENDING CONTRACTS · FUTURE MODULES · NOT PLANNED / NEVER. Each item is a card with:
- status pill
- **What** it is
- **Why** it matters
- **Dependency** (when relevant)
- **Verify** link (when live, with an explorer URL)

Items now cover SYN, sale, routing, allocation wallets, LP, registry, transparency, tokenomics chart, activity indexer, member cards, programmatic Vault, NFT, governance, indexer, episode engine, AI, cross-chain, ranks delivery — plus an explicit NEVER list (no yield product, no custodial vault, no admin keys, no pay-to-rank bonus tokens).

### Docs upgrade

Old `/docs`: 3 components (Docs, Constitution, DayOneArchive) — thin and undirected.

New `/docs`: structured knowledge hub with **5 grouped sections** (Start here · Protocol · Identity · Verification · Reference) and 20+ cards. Each card carries:
- title + one-sentence purpose
- status pill (LIVE / PENDING / REFERENCE)
- audience tags (Beginner / Member / Builder / Verifier)
- "Open ↗" deep-link to the relevant route or anchor

This turns Docs from a stub into the actual navigation hub for researchers and members.

### Activity duplication fixed

`/activity` was rendering both `MiniExplorer` and `ActivityFeedTabs`, with each independently showing "Scanning Avalanche RPC…" — looked broken and duplicated.

Fixed: removed `MiniExplorer` from `/activity`. Kept one clean feed (`ActivityFeedTabs`) with manual Refresh and `ZeroActivityState`. Added a copy line explaining aggregate counters stay at 0 until the first buy, and an explorer fallback link. SectionHeader added to delineate the per-event feed from the aggregate stats panel.

## Routing audit result

Searched the whole repo for stale routing terms. After the `UseOfFunds` fix, **every** routing surface (Hero, Vault, Vault Policy Core, Tokenomics Donut, Use-of-Funds, Routing Flow, Transparency Report, Smart Contract Flow, Registry, Whitepaper, FAQ, Join, Tokenomics, syndicate-config metadata) now reads **70% Vault · 20% Liquidity · 10% Operations**. No "Protocol-Owned Liquidity 70 / Treasury 20" residue remains.

## Code-reuse audit

No new one-off components introduced this sprint. New Roadmap and Docs reuse the existing design-system primitives: `PageShell`, `Section`, `SectionHeader`, `GlassCard`, `Pill`. Status colors and explorer link styles match the rest of the site.

## What was intentionally left unchanged

- **Token page** — still uses `SynLiveStatus` + `CanonicalSpec`. After the copy fix, the page is present-tense and accurate; deeper visual restructure deferred to keep this sprint focused on quality + harmonization.
- **Liquidity page DEXScreener fallback** — the existing `DexScreenerChart` already has a fallback path; not touched in this sprint.
- **FAQ section grouping** — copy fix applied to the one stale entry; full restructure into Basics / SYN / Joining / etc. groups deferred.
- **Vault page deep restructure** — stale copy fixed via `VaultPolicyCore`; richer "Vault today vs Vault planned" composition deferred.
- **Whitepaper** — already consistent with routing and live/pending status; no edits needed.
- **Ranks copy** — already uses "rank/identity/participation" language; no "reward" → "recognition" rename required.
- **Live event indexer** — the empty state and refresh affordances already exist (`ZeroActivityState`, Refresh button). Only the page-level duplication was fixed.

## Remaining open follow-ups (next sprints)

1. **FAQ regrouping** — split the long flat list into Basics / SYN / Joining / Routing / Vault / Liquidity / Ranks / Verification / Risks / Pending.
2. **Vault page deep restructure** — add a "Vault today vs Vault planned" comparison and a richer live Vault wallet card.
3. **Liquidity page** — strengthen the DEXScreener fallback card visual and add the "Open chart on DEXScreener" explicit CTA where missing.
4. **Token page visual hierarchy** — move "SYN role: membership / rank / participation / access" above the technical spec table.
5. **Shareable card polish** — keep functionality; tighten typography and add per-card brand footer line.
6. **Mobile QA pass** — run the responsive table audit on Tokenomics, Use of Funds, and Registry.

## Acceptance criteria — status

- No stale launch copy on Token, Vault, or in the FAQ: ✅
- 70 / 20 / 10 routing consistent everywhere: ✅
- Roadmap upgraded with 5 buckets, status, why, dependency, verify links: ✅
- Docs upgraded into a structured knowledge hub with status + audience: ✅
- Activity duplication removed and empty state explained: ✅
- No functionality lost (sale flow, wallet connect, contract reads, explorer links, copy buttons, registry, LP reads, status systems): ✅
