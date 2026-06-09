# Route Stale System Repair Report

Date: 2026-06-05
Wave: P8 · route-stale-system-repair
Scope: Public-route content leaks after the homepage parity repair pass.

---

## 0. Homepage routing — correction confirmed

The previous pass corrected the homepage routing copy. Verified live on
`https://thesyndicate.money/`:

- Hero/allocation copy now reads **70% Vault · 20% Liquidity · 10% Operations**.
- No "70% to liquidity / 20% to the treasury" remnants.

Homepage routing is no longer the regression surface. This report does not
re-debug it.

---

## 1. /join — stale & constitution-breaking content removed

### What was actually rendered on the live site (verified via fetch)

A full rendered scan of `https://thesyndicate.money/join` showed two real
constitution-breaking leaks. The other terms in the user prompt (Compounder
Score, score multiplier, governance access, proposal priority, private
strategy room, Genesis NFT metadata, LP badges, leaderboard, wave-3A footer
stamp) were **not** rendered on /join — they survived only inside
`/labs/` (quarantined) or in unrelated routes such as `/whitepaper`, where
the language is already correctly framed as "pending / not promised".

Confirmed live leaks on /join, and their fixes:

| Leak (rendered) | Source | Fix |
|---|---|---|
| Demo banner: "NFTs, LP pool, governance and AI layer are pending — clearly labeled across the site." | `src/components/syndicate/DemoBanner.tsx` | Rewritten to: "Every contract, wallet, and balance is public — verify any number on-chain." |
| Payment Strategy flow step #06 = "Episode / activity recorded" | `src/components/syndicate/Sections.tsx` (FLOW const) | Replaced with a constitution-safe 6-step on-chain flow: pays USDC → SYN distributed → 70/20/10 routed → member number assigned → rank updates from SYN → wallet recorded on public archive. No Episode language, no NFT, no governance, no private room, no proposal priority. |

The /join route's actual component composition was also audited and is
already constitution-safe: it renders only `MemberCard`, `LivePurchase`,
`AccessRate`, `MembershipCalculator`, `RankLadder`, `PaymentStrategy`.
None of those components emit "Compounder Score", "score multiplier",
"governance access", "proposal priority", "private strategy room", "Genesis
NFT metadata", or a wave-3A footer stamp. The stale demo banner and the
single FLOW string were the only leaks reaching the rendered DOM.

### Constitution-safe membership content shipped on /join

- Member number (live from holder index)
- Chapter (derived live)
- Rank recognition (SYN-balance derived, not wealth-leaderboard)
- On-chain receipt (purchase tx visible in Live Sale Stats + per-wallet page)
- Public wallet page (`/wallet/$address`)
- **70% Vault / 20% Liquidity / 10% Operations** routing — visible in
  LivePurchase split *and* in the Calculator output
- No KYC, no email, no governance promise, no NFT promise, no private room

---

## 2. /liquidity — stale promises removed, action rail added

### Confirmed live leaks and fixes

| Leak (rendered) | Source | Fix |
|---|---|---|
| LP Risk Notice missing "governance rights" in the no-entitlement clause | `src/components/syndicate/LpStatus.tsx` (`ProvideLiquidityCTA`) | Updated to the canonical wording: "No rewards, yield, NFT eligibility, governance rights, or entitlement are live or promised." |
| LP Incentives "No promises" card missing "governance rights" | same file, `LpIncentives` | Same wording fix applied. |
| No crypto-native top-of-page action rail | `src/routes/liquidity.tsx` | New `LiquidityActionRail` component shipped at the top of /liquidity, above WhyLpMatters. Five actions: **Trade SYN · Add Liquidity · Become an LP · View Pool · Verify Pair**. Visually distinct, above the fold. Includes a single-line disclaimer reaffirming no rewards/yield/NFT/governance entitlement. |
| Trade / Add Liquidity links existed only deep in the page | `LpStatusCard` (still there) and `ProvideLiquidityCTA` (still there) | Kept in place as secondary surfaces; the new action rail satisfies the above-fold requirement. |

The user prompt also flagged "LP badges", "leaderboard", and "Genesis NFT
eligibility" as live on /liquidity. Rendered scan confirms none of those
appear on the live route. The only NFT mention is the *denial* clause —
"No NFT eligibility, governance rights, or entitlement are live or
promised" — which is exactly the constitution-safe framing and is the
correct copy to keep.

### Membership vs LP separation

The new action rail explicitly excludes the Membership Sale path. Its
sub-copy reads: *"LP-side actions only — Membership (USDC → SYN) is a
separate flow."* This prevents the well-documented crypto-native confusion
between "join" (USDC → SYN via Membership Sale) and "trade / LP" (DEX-side
actions on the live AMM pair).

---

## 3. Cross-route stale-term scan

Searched the rendered live site and the source tree (excluding `/labs/`
quarantine) for every term in the user prompt across:

`/  /join  /liquidity  /activity  /chapters  /transparency  /tokenomics
/token  /vault  /ranks  /members  /founders  /roadmap  /docs  /faq
/whitepaper  /registry`

| Phrase | Source occurrences (non-labs) | Status |
|---|---|---|
| Compounder Score | `Sections.tsx` (exported `CompounderScore` component — **not imported by any route**) | Quarantined-in-place. Not rendered. Follow-up: move to `/labs/` registry on next pass. |
| score multiplier | `Sections.tsx` (computed but not displayed in MembershipCalculator) | Not rendered. |
| governance access | none | Clean. |
| governance weight | none | Clean. |
| Genesis NFT eligibility | only in *denial* clauses on /liquidity (correct framing) | Clean. |
| Genesis NFT metadata | none | Clean. |
| proposal priority | none | Clean. |
| private strategy room | none | Clean. |
| Episode / activity recorded | `Sections.tsx` FLOW (**fixed this pass**) | Clean. |
| LP badges | none in rendered routes | Clean. |
| leaderboard (wealth) | only in *denial* phrasing on `members.tsx`, `chapters.$slug.tsx`, `ranks.tsx`, `founders.tsx` ("not a leaderboard") | Constitution-safe denial language — kept. |
| DEMO PREVIEW | none (banner rewritten this pass) | Clean. |
| quests / achievements | only in `/labs/` quarantine | Quarantined. |
| community rewards | none | Clean. |
| 70% to liquidity / 20% to the treasury | none | Clean. |
| wave-3A.qa-stamp | none (current tag = `wave-P8.route-stale-system-repair`) | Clean. |
| transparent onchain society | none | Clean. |

The `whitepaper.tsx` route still has a "09 — Governance — pending" section
and an "11 — AI Layer — pending" section. Both are explicitly labeled
PENDING with the canonical status pill, framed as not-yet-deployed
modules, not promises. That matches the constitution's "label PENDING
clearly" requirement. Left untouched.

`/episodes`, `/ai`, `/nfts` remain in the route tree as stubs scheduled
for `noindex` in the recalibrated P9 step 9. Out of scope for this pass.

---

## 4. Files changed

- `src/components/syndicate/DemoBanner.tsx` — rewritten subtitle
- `src/components/syndicate/Sections.tsx` — `FLOW` list reframed
- `src/components/syndicate/LpStatus.tsx` — risk-notice wording (×2)
- `src/components/syndicate/LiquidityActionRail.tsx` — **new**
- `src/routes/liquidity.tsx` — wire `LiquidityActionRail` at top
- `src/lib/build-stamp.ts` — bumped to `wave-P8.route-stale-system-repair`

---

## 5. Remaining risks

1. **`CompounderScore` and `MembersLeaderboard`** still live in
   `src/components/syndicate/Sections.tsx` and `src/labs/components/`
   respectively. Neither is imported by an active route, but the symbols
   exist. Per the Archive Safety Net rule: do not delete — demote next
   pass via `src/labs/registry.ts` classification (DEPRECATED) and remove
   from `Sections.tsx` only after explicit user approval.
2. **`/whitepaper` governance / AI sections** stay labeled PENDING. If
   the constitution later forbids any mention of unbuilt modules (even
   PENDING), these need a separate copy pass.
3. **Demo banner copy** is now constitution-safe but generic; a future
   pass should make it event-triggered (e.g. "Member #N just joined · 8
   founding seats remain") per P9 step 1's anticipation framing.

---

## Decision Lens Verdicts

```text
Lens                     Verdict   Notes
Founder                  ✓         Removes the last "Episode / activity recorded" remnant and the governance-promising demo banner from every public route.
Investor                 ✓         LP disclaimer now explicitly disclaims governance rights alongside yield/NFT/entitlement.
Growth                   ✓         /liquidity gets a five-action above-fold rail matching crypto-native expectations; trade and LP paths are now one click from the route landing.
Behavioral Psychology    ✓         Membership vs LP confusion eliminated by an explicit "LP-side actions only" sub-copy on the new rail.
UX                       ✓         No layout regressions; rail sits in the existing Section primitive and inherits all spacing tokens.
Product                  ✓         Five actions cover the four crypto-native intents (trade, deposit, learn, verify) plus the in-page anchor for the deeper "Become an LP" explanation.
Staff Engineer           ✓         New component reuses LP_POOL config and the existing Section primitive — no new dependencies, no new types, no runtime cost.
QA                       ⚠         Live-content-rules.json was not updated this pass; should add a rule banning "Episode / activity recorded" and "governance and AI layer are pending" to catch regressions. Follow-up.
Accessibility            ✓         Action rail uses semantic <a>, descriptive labels + hint text, and inherits color-contrast tokens. External links carry rel="noopener noreferrer".
SEO                      ✓         No new pages introduced; existing canonical/meta intact; rail copy adds keyword-relevant text ("Trade SYN", "Add Liquidity", "Verify Pair").
```

Gate result: **0 ✗ + 1 ⚠ → APPROVED.** The single ⚠ is a follow-up: extend
`scripts/live-content-rules.json` with the two phrases removed this pass
so the next CI guard run blocks any regression.
