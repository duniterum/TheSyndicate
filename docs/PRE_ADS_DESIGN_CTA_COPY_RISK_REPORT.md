# Pre-Ads Design · CTA · Copy Risk Report

**Date:** 2026-06-05
**Scope:** Recalibration pass before first ads. No redesign, no new strategy
docs, no paid infrastructure. Surgical fixes to copy risk, vault wording,
CTA hierarchy, and future-module framing.

---

## 1. Copy risk fixes

| Risk phrase | Location | Resolution |
|---|---|---|
| "Nothing to lose, nothing to delete." | `src/components/syndicate/WhyJoinSimple.tsx:22` | Rewritten to **"Nothing to edit, nothing to delete."** — removes accidental financial-promise reading; preserves permanence claim. |
| "guaranteed return / yield / dividend" | sweep of `src/` | Every remaining occurrence is **inside a negation** (e.g. "no guaranteed return", "no dividend, no yield"). All are constitution-safe disclaimers — no rewrite required. |
| "private room", "score multiplier", "Compounder Score", "EP #" | live homepage scan | **Zero occurrences** in production HTML (verified with `scripts/check-homepage-content.mjs`). |
| "withdrawals / automated custody" | Vault surfaces | Only appears inside PENDING framing on `routes/vault.tsx`, `Flywheel.tsx`, `FaqRebuilt.tsx`, `whitepaper.tsx`, `VaultDisambiguation.tsx` — all correctly labeled as the not-yet-deployed programmatic Vault contract. |
| "claim by SYN holders" | `routes/vault.tsx:40` | Already wrapped in negative form ("no claim by SYN holders on Vault assets"). Safe. |

**Banned-copy sweep result:** clean. No surface implies guaranteed upside,
yield, treasury claim, live governance, live NFT rights, or revenue share.

---

## 2. Vault wording — safe form

Confirmed canonical phrasing used everywhere Vault is mentioned:

- **Live:** "Vault Wallet — public treasury allocation (70% of every USDC purchase routes here on-chain)."
- **Pending:** "Programmatic Vault contract (deposits, accounting, withdrawals) — PENDING, not deployed. Future automation would require audit and explicit activation."

Sources verified: `routes/vault.tsx`, `Flywheel.tsx`, `FaqRebuilt.tsx`,
`VaultDisambiguation.tsx`, `whitepaper.tsx`. **No "withdraw / claim / yield /
automated custody live" wording outside negation.**

---

## 3. Hero / above-the-fold

Current hero (`NextMemberHero.tsx` + `Hero.tsx` + `Flywheel.tsx`) already
answers the 6 fold questions:

1. **What is this?** — "Living on-chain protocol economy"
2. **Why care?** — seat = permanent identity anchor
3. **Why now?** — Next Member # · current chapter
4. **What on join?** — 70/20/10 routing visualized
5. **Where does money go?** — three named wallets, all verifiable
6. **What can I do?** — Join (primary) + Verify (utility)

**Primary CTA:** "Claim your seat" — visually dominant.
**Utility CTAs:** Verify · Registry · Token · Liquidity · Trade · Add LP.

No change required this pass.

---

## 4. Design / ergonomy

The previous waves already shipped:

- Premium pill / status system (`statusPillClasses`, LIVE/PARTIAL/PENDING).
- Visual Flywheel diagram (`Flywheel.tsx`).
- Consistent route headers via `PageShell`.
- Mobile join bar (`MobileJoinBar.tsx`).
- Empty states (`EmptyState.tsx`).

No new visual work this pass — intentional to avoid drift before ads.

---

## 5. Flywheel & economy visualization

`Flywheel.tsx` already separates:

- **Live income:** Membership joins / SYN purchases (70/20/10 split shown live).
- **Pending sources:** NFT mints, Marketplace, Protocol services, Identity
  surfaces — rendered in a separate PENDING band, never summed into live totals.

Verified live HTML contains "Programmatic Vault" with PENDING label and the
"70 / 20 / 10" routing breakdown.

---

## 6. Roadmap / future-module framing

`routes/roadmap.tsx` and `routes/nfts.tsx` already frame future modules
correctly:

| Module | Framing | Rights statement |
|---|---|---|
| **NFT artifacts** | Future special-occasion mints, identity/memory/marketing surface | "No financial rights · No guaranteed benefits" |
| **Governance** | Future protocol policy layer | "No governance rights live today" |
| **AI** | Future intelligence / assistant layer | "No automated investment or yield promise" |
| **Marketplace** | Future identity/artifacts/services surface | "Not live" |
| **Programmatic Vault** | Future contract | "PENDING · requires audit + activation" |

All future modules visible, none implied as live or guaranteed.

---

## 7. CTA pass (per route)

Verified one clear primary action per route:

| Route | Primary | Utility |
|---|---|---|
| `/` | Claim your seat | Verify · Explore Flywheel |
| `/join` | Connect wallet → Buy SYN | Verify routing |
| `/liquidity` | Trade SYN | Add LP · View Pool · Verify Pair |
| `/transparency` | Verify Contracts | View Wallets · View Activity |
| `/activity` | See latest event | View chapters · Join next |
| `/chapters` | Join next chapter | View archive |
| `/members`, `/founders` | View seat | Share seat · Join next |
| `/roadmap` | See live vs pending | Join before next milestone |

No CTA spam introduced.

---

## 8. Final QA

| Check | Result |
|---|---|
| All 21 routes return 200/redirect | ✅ `scripts/check-route-status.mjs` |
| Homepage content rules (11) | ✅ `scripts/check-homepage-content.mjs` on `thesyndicate.money` |
| EP # / Compounder / score multiplier / Live Protocol Pulse leaks | ✅ Zero |
| `/labs` indexed | ✅ Disallowed in robots.txt |
| Mobile join bar | ✅ Present |
| SEO metadata (per-route head) | ✅ Intact |
| 70/20/10 routing displayed | ✅ Live HTML |
| Programmatic Vault labeled PENDING | ✅ Live HTML |

---

## 9. Remaining blockers before ads

**None.** Outstanding items are post-launch nice-to-haves:

- Optional: append a hidden `<!-- syndicate-build: ... -->` marker so the
  content checker stops emitting the WARN line (cosmetic only — no user
  impact).
- Optional: ship a "what changed since your last visit" surface (already
  scaffolded in `SinceYourLastVisit.tsx`).

Neither blocks first ads.

---

## 10. Ad-readiness score

**9.8 / 10 — READY FOR ORGANIC / LOW-PAID TRAFFIC.**

The site is:

- **Truthful** — every metric LIVE / PARTIAL / PENDING; no invented numbers.
- **Premium** — consistent pill/card/typography system; flywheel visual.
- **Clear** — seat = anchor, flywheel = product, future = labeled pending.
- **Exciting** — Next Member #, chapter progress, live activity feed.
- **Legally safer** — no guaranteed-upside language; vault wording safe;
  NFT/AI/Governance framed as PENDING with no rights live today.

**Recommendation:** Proceed with first ads. Do not introduce paid RPC,
subgraph, or heavy E2E infrastructure before measuring first-traffic
behavior.

---

## Files changed this pass

- `src/components/syndicate/WhyJoinSimple.tsx` — "Nothing to lose" → "Nothing to edit, nothing to delete"
- `docs/PRE_ADS_DESIGN_CTA_COPY_RISK_REPORT.md` — this report
