# THE SYNDICATE — FULL SITE STRUCTURE & HEALTH REPORT

Master roll-up of the audit suite. Audit only — nothing implemented.

Companion docs:
- `FULL_SITE_MAP.md`
- `ROUTE_ARCHITECTURE_AUDIT.md`
- `PRODUCT_ARCHITECTURE_MAP.md`
- `DATA_SOURCE_MAP.md`
- `CONTENT_CONSISTENCY_AUDIT.md`
- `UX_CTA_FLOW_AUDIT.md`
- `STATUS_EMPTY_PENDING_AUDIT.md`
- `NAVIGATION_IA_AUDIT.md`
- `CODE_HEALTH_AUDIT.md`

Build baseline: `wave-3A.qa-stamp`. All audits reflect this build.

---

## 1. Sitemap summary

22 reachable routes:
- 18 in primary nav (5 groups).
- 3 hidden but URL-reachable (`/ai`, `/nfts`, `/episodes`).
- 1 sitemap + 3 API/OG utility routes.

High-trust LIVE pages: `/`, `/join`, `/transparency`, `/wallet/$address`,
`/activity`, `/members`, `/ranks`, `/liquidity`, `/token`.

Static / docs surfaces: `/docs`, `/whitepaper`, `/tokenomics`, `/faq`,
`/roadmap`.

## 2. Product architecture summary

Six systems: Core Protocol, Identity, Activity/Memory, Transparency,
Growth/Shareability, Future/Pending.

Every Core Protocol component is LIVE. Identity & Activity are LIVE.
Transparency is LIVE. Growth is PARTIAL (OG images on 4 routes, not 22).
Future modules are correctly invisible or PENDING-labeled.

## 3. Route architecture summary

Strong reuse of `PageShell` + `Primitives`. Home is custom by necessity.
22 routes share 5 nav groups. 3 orphan routes need disposition.

## 4. Data architecture summary

12 data sources, all client-side wagmi reads or static config. No off-chain
indexer today. Main scaling cliff is `useHolderIndex` event scan at high
holder counts — documented, deferred.

## 5. Content consistency summary

Vocabulary aligned to glossary except `MembersLeaderboard.tsx` filename
drift. No banned vocabulary detected on shipped routes. Re-grep
`/tokenomics`, `/whitepaper`, `/docs` after next republish.

## 6. UX / CTA summary

`/join`, `/`, `/transparency`, `/wallet/$address` have strong CTAs.
6 pages are dead ends: `/tokenomics`, `/faq`, `/whitepaper`, `/roadmap`,
`/registry`, `/chapters/$slug`. No mobile sticky Join CTA.

## 7. Navigation summary

5-group header, borderline on density. Join buried under SYN. Docs vs
Whitepaper vs Tokenomics ambiguity. Breadcrumbs primitive unused on
deep links.

## 8. Status / empty / pending summary

All PENDING labels honest. Orphan routes (`/ai`, `/nfts`) carry no copy.
Tokenomics donut could expose live distributed wedge. Vault Reserve could
say "no releases scheduled" explicitly.

## 9. Code health summary

8 `Home*` components likely include unmounted survivors. `Sections.tsx`
kitchen-sink. Naming drift on `MembersLeaderboard.tsx`. No dangerous
duplication; tech debt only.

---

## TOP 25 FIXES (ranked)

| # | Severity | Fix | Source audit |
|---|---|---|---|
| 1 | Critical | Add bottom-of-page Join + Verify CTA to 6 dead-end pages | UX |
| 2 | Critical | Promote Join in nav (top-level or sticky next to wallet chip) | NAV |
| 3 | Critical | Add mobile sticky Join CTA | UX |
| 4 | Critical | Resolve `/ai`, `/nfts`, `/episodes` (delete or convert to "Pending modules") | ROUTE |
| 5 | High | Rename `MembersLeaderboard.tsx` to remove "leaderboard" | CODE / CONTENT |
| 6 | High | Mount `Breadcrumbs` on `/wallet/$address`, `/chapters/$slug`, `/milestone/$id` | NAV |
| 7 | High | Dead-code sweep of `Home*` components and `Sections.tsx` exports | CODE |
| 8 | High | Tokenomics donut — render live "distributed" wedge from `useSaleStats` | DATA / STATUS |
| 9 | High | Re-grep `/whitepaper`, `/tokenomics`, `/docs` for banned vocabulary after republish | CONTENT |
| 10 | High | Add OG images to `/join`, `/ranks`, `/members`, `/founders`, `/chapters` | ROUTE |
| 11 | Medium | Explicit "no releases scheduled" line on Vault Reserve | STATUS |
| 12 | Medium | Friendlier copy on empty rank slots ("Forming" not bare 0) | STATUS |
| 13 | Medium | Add risk disclaimer link in footer to identity surfaces | CONTENT |
| 14 | Medium | Document which `Sections.tsx` exports are live vs legacy | CODE |
| 15 | Medium | Co-locate `use-live-data.ts` under `src/lib/` | CODE |
| 16 | Medium | Verify `Vault` is always qualified (wallet/reserve/contract) in `OpportunitySection` | CONTENT |
| 17 | Medium | Add internal links from `/registry` back to Transparency + Join | UX |
| 18 | Medium | Add internal links from `/faq` to relevant deep pages | UX |
| 19 | Medium | Indexer plan trigger: ≥10k holders or ≥30s holder-index load | DATA |
| 20 | Low | Consider future unification of `/docs` + `/whitepaper` + `/faq` | NAV |
| 21 | Low | Consider future Identity hub merging members/founders/chapters | NAV |
| 22 | Low | Edge-cache headers verified on `/api/public/og/*` | DATA |
| 23 | Low | Visitor memory documented as per-device limitation | DATA |
| 24 | Low | Roadmap pills audit — no dates / no "soon" wording | CONTENT |
| 25 | Low | DexScreener graceful-degrade message if widget blocked | DATA |

---

## TOP 10 CRITICAL FIXES BEFORE USER TESTING

1. Resolve `/ai`, `/nfts`, `/episodes` orphans (#4).
2. Mobile sticky Join CTA (#3).
3. End-of-page CTA on dead-end pages (#1).
4. Promote Join in nav (#2).
5. Rename `MembersLeaderboard.tsx` (#5).
6. Tokenomics donut live wedge (#8).
7. Add OG images to high-share routes (#10).
8. Mount Breadcrumbs on deep links (#6).
9. Friendlier zero-rank copy (#12).
10. Re-grep banned vocabulary after republish (#9).

## TOP 10 THINGS TO LEAVE ALONE

1. `useHolderIndex` shape — anti-rewrite contract.
2. 70 / 20 / 10 routing copy and component (`RoutingFlow`).
3. Status pill semantics (LIVE / PARTIAL / PENDING).
4. `/transparency` page composition.
5. `/wallet/$address` post-wave-3A behavior.
6. Header wallet chip (`HeaderWalletChip`) + `WalletContextNotice`.
7. `/join` purchase flow.
8. Build stamp + `check-live` workflow.
9. Glossary + banned vocabulary.
10. Vision document — every change must check VISION first.

## WHAT SHOULD NOT BE BUILT YET

- Referral.
- NFT recognition.
- Governance.
- AI module.
- Vault Automation contract.
- Off-chain indexer (defer until measured pain).
- Heavy testing frameworks (Playwright).
- CDN invalidation framework.
- Multi-device visitor memory sync.

## RECOMMENDED NEXT IMPLEMENTATION ORDER

1. **Conversion polish wave** (Critical #1–4 from "before user testing").
2. **Vocabulary + dead-code sweep wave** (#5, #7, #9, #14).
3. **Identity & deep-link polish** (#6, #10, #12).
4. **Data polish** (#8, #11, #16).
5. **Long-term IA reflection** (#20, #21) — only after user-testing data.

Stop here. The site is now mapped end-to-end. Future waves should reference
these documents instead of re-discovering structure.
