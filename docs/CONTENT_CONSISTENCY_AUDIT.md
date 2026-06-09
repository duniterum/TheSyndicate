# THE SYNDICATE — CONTENT CONSISTENCY AUDIT

Cross-reference pages, docs, FAQ, whitepaper, roadmap, tokenomics, risk copy
against `VISION.md`, `TERMINOLOGY_GLOSSARY.md`, `PRODUCT_DECISION_FRAMEWORK.md`.

Flags only. Do not edit copy from this doc.

---

## Vocabulary checks (per glossary)

| Term | Status | Notes |
|---|---|---|
| The Syndicate | Consistent | "Transparent on-chain asset accumulation protocol" + "onchain society" both used; both vision-approved. |
| SYN | Consistent | always membership token, never "share" / "stake". |
| Membership Sale | Consistent | LIVE label used throughout. |
| Vault Wallet vs Vault Contract | **Mostly consistent** | `VaultDisambiguation` handles it; flag: copy on home `OpportunitySection` says "Vault" without qualifier in 1 sentence — verify. |
| Vault Reserve (25% SYN) | Consistent | Only on tokenomics. |
| 70 / 20 / 10 routing | Consistent | Same numbers everywhere. |
| Member vs Holder | **Drift** | `MembersLeaderboard.tsx` filename still says "leaderboard"; component renamed but file persists. UI copy uses "member" correctly. |
| Founder | Consistent | Used only for early-N members. |
| Chapter | Consistent | Era-based grouping. |
| Rank | Consistent | Never described as "tier" externally. |
| Access Rate | Consistent | "1 SYN = $0.01" everywhere. |
| Compounder Score | **Watch** | Removed from `/ranks` (verified by `check-live`); ensure no stray reference remains in docs (whitepaper / tokenomics need a grep on next publish). |

## Banned vocabulary scan

Forbidden: ROI, dividend, yield, profit share, returns, guaranteed
appreciation, passive income, shareholder, equity, redemption, investment.

- `/`, `/join`, `/transparency`, `/ranks`, `/wallet/$address`: clean.
- `/whitepaper`, `/tokenomics`, `/docs`: marked stale by `check-live` until
  next publish — verify after republish that no legacy phrasing leaks.
- `WhyEarlyMatters`, `WhyJoinNow`: aspirational copy; verify no "returns"
  framing on next read.

## Status pill correctness

- LIVE: used only where verifiable on-chain. ✅
- PARTIAL: used on `/vault` (wallet live, contract pending) and `/ranks`
  (distribution live, simulator config). ✅
- PENDING: used on `/vault` for programmatic Vault Contract, on roadmap
  for future modules. ✅
- DEMO PREVIEW: should not appear anywhere; `check-live` enforces this on
  `/ranks`.

## Risk / legal copy

- `RiskDisclaimer` mounted on `/`, `/join`, `/transparency`. ✅
- Missing on: `/wallet/$address`, `/members`, `/founders`, `/chapters`.
  These are identity surfaces but mention USDC/SYN — flag for review
  (recommend mounting a compact disclaimer in footer, not on each page).
- Footer disclaimer present site-wide. ✅

## Module-status consistency (NFT / Referral / Governance / AI / Vault Automation)

| Module | Banned scope | Page exists? | Copy says | Verdict |
|---|---|---|---|---|
| NFT | yes | `/nfts` hidden | not framed yet | OK if hidden; flag the orphan route. |
| Referral | yes | none | not mentioned anywhere | ✅ clean. |
| Governance | yes | none | mentioned in roadmap as future | OK if labeled PENDING. |
| AI | yes | `/ai` hidden | not framed yet | Flag orphan route. |
| Vault Automation | partial | `/vault` mentions it | labeled PENDING | ✅ clean. |

## Cross-doc cohesion

- `VISION.md` ↔ home copy: aligned post wave-3A.
- `TERMINOLOGY_GLOSSARY.md` ↔ UI: 1 file-name drift
  (`MembersLeaderboard.tsx`), otherwise aligned.
- `PRODUCT_DECISION_FRAMEWORK.md` ↔ recent waves: aligned.
- `WHITEPAPER` ↔ `TOKENOMICS` ↔ `DOCS`: verified consistent on numbers
  (1B supply, 1 SYN = $0.01, 70/20/10). Need post-republish recheck for
  any old "Compounder Score" or "tier" usage.

## Top contradictions / risk phrases (flag)

1. **`MembersLeaderboard.tsx`** filename — naming drift vs glossary.
2. **`/ai` and `/nfts` orphan routes** — exist but unowned; potentially
   contradict "do not build" policy if a curious user finds them.
3. **Aspiration copy in `WhyEarlyMatters` + `WhyJoinNow`** — verify no
   stray "returns" framing on next read pass.
4. **Vault wording** on `OpportunitySection` — confirm "Vault" is always
   qualified (wallet vs reserve vs contract) when used unprefixed.
5. **Roadmap labels** must use PENDING / PLANNED consistently — verify no
   "soon" / "Q3" / dated promises remain.

None of the above are critical defects today, but every one is worth a
focused copy pass before real-user testing.
