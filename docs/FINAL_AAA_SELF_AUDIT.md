# THE SYNDICATE — Final AAA 360° Self-Audit

> Honest, role-based audit of the live product as of this sprint. No defence
> of prior work, no "AAA" claim that isn't backed by evidence. This document
> is the source of truth for what still stands between the current build and
> a genuinely world-class release.

---

## Executive Summary

**Headline grade: A− (87 / 100).**

The Syndicate has crossed from "collection of pages" into "coherent product".
Vision, protocol model, transparency, terminology, and the core design-system
primitives (`StatusPill`, `EmptyState`, `MetricExplainer`, `ShareActions`,
`Breadcrumbs`, `StartHereCard`) are in place and used consistently on the
high-traffic surfaces. A first-time visitor on desktop can now answer "what
is this, why does it exist, what can I verify, where do I click next" in
under 30 seconds.

It is **not yet AAA**. The remaining gap is not features — it is **polish
density**: a long tail of pages (vault, liquidity, tokenomics, ranks,
roadmap, docs, faq, whitepaper) that each individually feel A/A− but
collectively still betray that they were built in different sprints. The
two biggest single risks are (1) mobile experience on data-dense pages and
(2) PENDING / DEMO surfaces that still feel "empty" rather than
"investor-grade not-yet-live".

**What is genuinely AAA now**
- Vision + protocol model + terminology discipline
- Homepage member-first ordering, Start Here, breadcrumbs
- Transparency page, Registry, Activity, Members Leaderboard empty states
- Status vocabulary (LIVE / PARTIAL / PENDING / DEMO) and `StatusPill`
- Share primitive (`ShareActions`) and member/protocol/milestone cards
- Legal-safe core copy on homepage, join, why-join

**What is still A / A− / B+**
- Vault, Liquidity, Tokenomics, Ranks, Roadmap pages (A−)
- FAQ, Docs, Whitepaper (A− — structure good, density uneven)
- Mobile experience on data tables and share cards (B+)
- PENDING surfaces on AI, NFTs, Vault automation (A− — pills migrated,
  surrounding narrative still thin)
- SEO/OG image story per route (B+ — text meta good, social previews weak)

---

## Part 1 — Page-by-Page Audit

Grades use A < A+ < AAA. Only AAA = ready, no caveats.

### Homepage (`/`) — **A+**
- Works: Hero, Start Here, why-join, what-changes, milestone, early
  chapters, transparency snapshot, share cards. Clear narrative spine.
- Weak: Density on mobile — 14+ sections is heavy. No "scroll progress"
  affordance. Primary CTA repeats too many times with slightly different
  copy ("Become a Member" / "Join the Syndicate" / "Mint SYN").
- Fix: One canonical CTA label. Add a sticky right-rail TOC on desktop
  only. Compress to 9 sections on mobile via accordion collapse for
  history/early chapters.

### `/token` — **A**
- Works: Live status, contract dossier, DexScreener embed.
- Weak: Token utility list reads like a feature dump, not an IR brief.
  No `MetricExplainer` on circulating / FDV / liquidity depth.
- Fix: Add Explainer beneath each headline metric. Add "Why hold SYN" in
  membership language (not "investment").

### `/tokenomics` — **A**
- Works: Donut chart, allocation table.
- Weak: No vesting timeline visualisation. No comparison to peers. Long
  scroll on mobile (donut + table stacked is heavy). Numbers are stated
  but rarely justified.
- Fix: Inline `MetricExplainer` per allocation slice with "Why this
  number". Add a one-line "Compared to typical protocol launches: …".

### `/join` — **A+**
- Works: Connect → approve → buy flow is legible. Rank preview good.
- Weak: No progress indicator across the 3 steps. Error states on
  wallet rejection are generic. No "what happens after I click buy"
  pre-empt.
- Fix: 3-step stepper. Inline `EmptyState` per error case. Add a "After
  this transaction you will: receive SYN, become rank X, appear on the
  leaderboard in ≤2 blocks" reassurance block.

### `/vault` — **A−**
- Works: Disambiguation, policy core, treasury composition.
- Weak: Vault automation is PENDING but the page reads like it's broken
  rather than "coming". No "What the Vault holds today" snapshot above
  the fold.
- Fix: Lead with a LIVE snapshot card (USDC balance, last move, link to
  explorer). Push automation/policy below. Use `MetricExplainer` for
  every treasury figure.

### `/liquidity` — **A−**
- Works: Trader Joe LP status, LP tokens locked context.
- Weak: First-time visitor doesn't know why liquidity matters here.
  Numbers without narrative. No "How to verify LP lock" walkthrough.
- Fix: Lead with "Why protocol-owned liquidity matters" (one short
  paragraph), then metrics with explainers, then verification steps.

### `/transparency` — **A+**
- Works: Live contracts, wallets, flow diagram, status discipline.
- Weak: Long page on mobile; no quick filter ("show me only LIVE
  contracts"). Some cards lack a `MetricExplainer`.
- Fix: Sticky filter chips (All / LIVE / PENDING). Explainer parity.

### `/registry` — **A**
- Works: Canonical list of every protocol address.
- Weak: No search. No copy-all-as-CSV. No "last verified" timestamp per
  row.
- Fix: Add search input, CSV export, per-row verification timestamp.

### `/activity` — **A**
- Works: Live feed, empty state now informative.
- Weak: No filters (purchases vs treasury moves vs LP). No pagination —
  infinite scroll without anchor is hard to share a specific event.
- Fix: Filter chips + per-event permalink anchor (`#tx-0x…`).

### `/ranks` — **A**
- Works: Rank ladder, simulator, criteria.
- Weak: Heavy on numbers, light on "what a rank actually unlocks
  socially". Compounder Score copy still leans reputational-financial in
  one place.
- Fix: One sentence per rank: "What you do · What you get · What you
  signal". Re-scan Compounder Score copy for any yield-adjacent wording.

### `/roadmap` — **A**
- Works: Phased view, milestone tracker.
- Weak: No dates (intentional, good), but also no "what triggers the
  next phase" — feels static.
- Fix: For each phase, show Trigger · Verification · Status — already a
  pattern from `MilestoneTracker`, just reuse it.

### `/docs` — **A−**
- Works: Index of all reference material.
- Weak: Reads like a file list, not a learning path. No "Start here →
  Then read → Advanced" ordering. No reading time per doc.
- Fix: Curated reading path on top, full index below.

### `/faq` — **A**
- Works: Rebuilt FAQ structure, categorised.
- Weak: A few answers still drift toward marketing rather than fact.
  No search. No "still have a question → contact" tail.
- Fix: Search bar, copy sweep for legal safety, contact CTA at bottom.

### `/whitepaper` — **A−**
- Works: Long-form vision.
- Weak: No TOC, no anchor links, no per-section reading time, no
  "download as PDF". On mobile the page is a wall of text.
- Fix: Sticky TOC desktop, collapsible sections mobile, PDF export.

### `/ai`, `/nfts`, `/episodes` — **B+**
- Works: Clearly labelled PENDING with `StatusPill` + `MetricExplainer`.
- Weak: Still feels like a placeholder rather than a confident
  "here's what's coming and why". No "subscribe to be notified" hook.
- Fix: Each page needs a single hero paragraph in protocol-society
  language plus a "Notify me" email capture (or "Follow on X").

### Header / Mobile drawer — **A**
- Works: Grouped, accessible, mobile drawer works.
- Weak: Dropdown labels aren't consistent in casing. Mobile drawer
  doesn't close on route change in some flows. No keyboard escape
  handler tested.
- Fix: Casing pass, `onNavigate → close()`, ESC handler + focus trap.

### Footer — **A**
- Works: Sitemap, social, legal.
- Weak: No "last commit / last data refresh" timestamp — would massively
  reinforce live-product feel. No language switcher even as a "coming
  soon" pill (international audience signal).
- Fix: Add "Live · {timestamp}" line in footer.

### Share cards — **A+**
- Works: All cards use `ShareActions`. Truth-preserving copy.
- Weak: PNG export on small screens can clip. No OG image generation
  per card for social-share URLs.
- Fix: Force a fixed render width on export. Generate per-card OG
  endpoints later (post-launch).

### Start Here card — **A+**
- Works: Dismissible, three stops, first-visit only.
- Weak: Doesn't reappear in a "Help / Re-show tour" affordance for users
  who dismissed and want it back.
- Fix: Footer link "Show start here again" that clears the localStorage
  key.

---

## Part 2 — First-Time Visitor: Top 10 Friction Points

1. The homepage CTA copy varies between sections — pick one label.
2. No single "what is this in 1 sentence" floating banner above the
   hero on first scroll.
3. Mobile homepage is too long; users bounce before reaching milestones.
4. "What changes after joining" lives below the fold — should be a
   visible promise earlier.
5. Vault and Liquidity pages don't open with a LIVE snapshot — visitor
   has to scroll to find proof.
6. No "How to verify everything in 60 seconds" mini-guide linked from
   the hero.
7. PENDING modules (AI, NFTs, automation) feel broken instead of
   confidently future-tense.
8. Connect-wallet step on `/join` has no pre-explanation of what will
   happen on-chain.
9. No FAQ search; new users with a specific worry can't self-serve.
10. No way to follow project updates without joining (no email, no
    explicit "Follow on X" CTA in the footer hierarchy).

---

## Part 3 — Visitor → Member Conversion Audit

Path: Homepage → Why Join → What SYN Does → Join → Connect → Approve →
Buy → Verify → Rank → Share.

**Gaps found**
- Between "Why Join" and "Join": no recap of the 3 things they just
  read; user re-reads. Add a "You read this · Now do this" handoff.
- Approve USDC: no explainer of what an ERC-20 approval is for a
  first-time DeFi user. One-line tooltip needed.
- Buy SYN: no expected-output preview ("You will receive ~X SYN at
  current price · slippage ≤ Y%").
- Verify Transaction: tx hash shown, but no one-click "Open on
  Avascan" pre-rendered.
- See Rank: rank is shown, but the "what this rank means socially" is a
  link away — should be inline.
- Share Member Card: works, but no nudge ("Members who share within
  24h are 3× more likely to bring a friend") — and that nudge can't be
  fabricated, so just a soft "Share to invite a friend" line.

**Overpromise risk**: none currently in the buy flow. Good.

---

## Part 4 — Information Architecture Audit

- Header: clean, but `/episodes` and `/ai` sit alongside live pages
  with no PENDING marker in nav. Add a tiny dot or `· soon` chip.
- Footer sitemap: complete. Missing a "Status" link (could point to
  `/transparency`).
- Breadcrumbs: shipped, JSON-LD shipped. Good.
- CTA hierarchy site-wide: 2 competing primary buttons on some pages
  ("Become a Member" and "Read the Protocol" both gold). Demote one to
  navy/ghost.
- Deep links: most routes addressable; activity events lack permalinks.
- User-type matrix:
  - **New visitor**: served. ✅
  - **Member**: missing a `/me` or "My membership" view. ⚠ (out of
    scope for polish sprint, note for post-launch.)
  - **Verifier**: served. ✅
  - **Researcher**: docs path could be curated. ⚠
  - **DeFi user**: served via /token, /liquidity. ✅

---

## Part 5 — Design System Audit

**Consistent now**: `StatusPill`, `EmptyState`, `MetricExplainer`,
`ShareActions`, `ContractLink`, `Breadcrumbs`, `PageShell`,
`SectionHeader`.

**Still drifting**:
- Card padding: some surfaces use `p-5`, others `p-6`, others
  `p-4 md:p-6`. Codify a `Card` density scale (compact / default /
  hero).
- `Pill` (decorative) vs `StatusPill` (canonical) — visually similar;
  a colour-blind user can't always tell. Tighten visual difference
  (StatusPill should have the dot always; Pill never).
- Section vertical rhythm: `py-20 md:py-24` is standard, but several
  components override with their own padding causing uneven gaps when
  stacked.
- Icon usage: emoji + lucide + custom svg coexist. Pick one (lucide)
  and migrate emoji out of headings.
- Mobile tables: a few tables still scroll horizontally without a
  shadow/affordance hint.

---

## Part 6 — Status / Empty / Loading / Error Audit

- Status pills: canonical everywhere data-bearing. ✅
- Empty states: `EmptyState` used on leaderboard, activity, explorer,
  transparency. Other PENDING surfaces (AI, NFTs, vault automation)
  use `MetricExplainer` but not `EmptyState` — both are needed for a
  full "what / why / verify / next" answer.
- Loading: most data uses skeletons; some pages show a layout shift
  when data lands. Reserve min-height on metric cards.
- Errors: most RPC failures fall back silently. Add a single canonical
  `ErrorState` primitive ("We couldn't reach the chain. Retry · Verify
  manually on Avascan").

---

## Part 7 — Mobile / Tablet Audit

Confirmed or suspected issues:
- Homepage length on mobile (too long, no nav).
- DexScreener iframe overflow at <380px.
- Some tables overflow without visual hint.
- Share-card PNG export at narrow widths clips the right edge.
- Footer columns stack but the four-column grid leaves orphan items
  on tablet (768–1024px).
- Mobile drawer doesn't always close on link tap.
- Some pills wrap to a second line and break vertical rhythm.
- Hero CTA pair stacks but loses gold/navy hierarchy on small screens.
- `MilestoneTracker` long rows wrap awkwardly on 360px.

**Verdict**: mobile is functional, not designed. This is the single
biggest gap before AAA.

---

## Part 8 — Shareability / Growth Audit

Cards in place: Member · Protocol Snapshot · Vault · Liquidity ·
Milestone · Revenue · Early Chapter.

**Top 10 improvements**
1. One canonical share-text format across all cards (currently varies).
2. Per-card OG endpoint so when the share URL is pasted, the social
   preview matches the card (post-launch).
3. UTM tags on share links to measure conversion source.
4. Add a "Share to Farcaster" option alongside X / Telegram.
5. Add a "What this proves" subtitle on each card.
6. Lock card render to a fixed pixel width on export to prevent mobile
   clipping.
7. Card timestamps should be UTC + relative ("2h ago · 2026-06-05
   14:22 UTC").
8. Add a low-key "Made by The Syndicate · thesyndicate.money" footer
   line on every exported PNG.
9. Add a "Copy as embed" option (iframe snippet) for the protocol
   snapshot.
10. Provide a `/share` index page that lists every shareable card with
    its current values.

---

## Part 9 — Community / Identity Audit

The site **does** create belonging via Why Become Member, Why Early
Matters, Early Chapters, Member Card. It **does not yet** fully express
"onchain society" beyond text.

Gaps:
- No member directory (intentional for privacy; say so explicitly).
- Ranks framed mostly numerically; one sentence per rank on
  participation/contribution/longevity (not wealth) is missing.
- No "early chapters" visualisation of who joined when (could be
  rank-only, no PII).
- No shared rituals (weekly snapshot, monthly milestone) on the page.
- Compounder Score still has one paragraph that reads close to
  "reputation = financial" — needs a sweep.

---

## Part 10 — Investor / IR Audit

Per-metric IR readiness:
- USDC in Vault: LIVE, needs explainer. ⚠
- LP TVL: LIVE, has explainer. ✅
- Protocol revenue: only LIVE sources counted (good). ✅
- SYN circulating / FDV: LIVE, missing explainer. ⚠
- Members / leaderboard: PARTIAL, EmptyState present. ✅
- Roadmap milestones: explainer present. ✅
- Future modules (AI, NFTs, automation): PENDING + explainer. ✅
- Risk notice: present, could be more prominent in footer. ⚠

**Verdict**: 80% IR-grade. The remaining 20% is one pass to attach a
`MetricExplainer` to every headline number and to add limitations
("This counts only purchases indexed since block N").

---

## Part 11 — Legal-Safe Copy Audit

Spot-checked surfaces. **No banned terms** (ROI, dividend, yield,
profit-share, guaranteed appreciation, passive income) found on
homepage, join, token, vault, liquidity.

Residual risks to sweep:
- `/ranks` — one paragraph references "rewards" in a way that could be
  read as financial. Replace with "recognition" / "participation".
- `/faq` — a few answers use "value" near "your SYN"; clarify
  "membership value", not "monetary value".
- Share card copy — verify every template avoids implied returns.
- Whitepaper — long-form; deserves a dedicated legal pass before any
  press push.

Preferred replacements already documented in
`docs/TERMINOLOGY_GLOSSARY.md` — enforce via copy-review checklist.

---

## Part 12 — Technical / CTO Audit

Should centralise:
- Share-text templates (currently inline per card).
- Explorer URL builder (some places hand-format Avascan URLs).
- Status → tone → label mapping (canonical in `Primitives.tsx`, good;
  verify no string literals leaked).
- Route-label map (currently in `Breadcrumbs.tsx`; should be the
  single source for nav + breadcrumbs + page titles).
- SEO defaults (sitewide og:* in `__root.tsx`, per-route in route
  `head()` — verify every route has its own title + description).

Should refactor:
- `Sections.tsx` at 2184 lines is a god-file. Split per section.
- `TokenomicsDonut.tsx` at 936 lines — extract chart + table.
- `ShareableCards.tsx` at 578 lines — one file per card.

Risks future drift:
- Decorative `Pill` is too close to `StatusPill` visually.
- Multiple "primary" CTAs per page.
- Hard-coded copy strings (banned-term regression risk) — add a tiny
  lint script that greps for forbidden words in `src/`.

---

## Part 13 — Brand / Icon / SEO Audit

- Favicon: present (`public/favicon.svg`). Test at 16×16 — gold-on-white
  may lose detail. Provide a `favicon-32.png` fallback.
- OG image: **missing per-route**. Sitewide default also missing.
  This is the single biggest brand gap — pasting a Syndicate link in
  X/Telegram shows a generic preview.
- Twitter card meta: verify `summary_large_image` on all routes.
- Title tags: each route has one; check none exceed 60 chars.
- Canonical URLs: present per leaf, not on root. ✅
- JSON-LD: Organization on root (verify), BreadcrumbList on deep
  routes (shipped), FAQPage on `/faq` (verify).
- Recognisability when shared: weak until OG images ship.

---

## Part 14 — Performance / Perceived Quality

- First load: acceptable; hero renders fast.
- DexScreener iframe is heavy — lazy-load below the fold.
- Tokenomics donut is large — code-split that route.
- Skeletons present on most data cards; a few cards pop in causing
  layout shift.
- Share-card PNG export blocks the main thread for ~300ms on mobile —
  acceptable but add a "Rendering…" state (already in `ShareActions`).
- No duplicated fetches observed in spot-check; verify via React Query
  devtools before launch.

---

## Part 15 — Final AAA Scorecard

| Dimension | Current | AAA target | Gap | Highest-impact fix |
|---|---:|---:|---:|---|
| Vision | 96 | 96 | 0 | — |
| Clarity | 90 | 95 | 5 | One canonical CTA label sitewide |
| Trust | 92 | 96 | 4 | Footer "Live · {ts}" + per-metric explainers |
| Conversion | 84 | 92 | 8 | Join flow stepper + pre-explainers |
| Navigation | 90 | 94 | 4 | PENDING markers in header |
| Mobile UX | 78 | 92 | 14 | Mobile audit pass + fixed-width share export |
| Desktop UX | 92 | 95 | 3 | Sticky TOC on long pages |
| Design consistency | 88 | 95 | 7 | Card density scale, icon system, pill visual split |
| Shareability | 85 | 94 | 9 | Per-route OG images, UTM tags |
| Community identity | 84 | 92 | 8 | Rank "what you do/get/signal" one-liners |
| Investor readiness | 86 | 94 | 8 | Explainer parity on every metric |
| Documentation | 82 | 92 | 10 | Curated reading path on /docs |
| FAQ | 86 | 93 | 7 | Search + legal sweep |
| Token page | 84 | 92 | 8 | Explainer per metric, utility in member language |
| Tokenomics | 82 | 92 | 10 | Per-slice explainer, vesting timeline |
| Join page | 88 | 95 | 7 | Stepper + error states |
| Vault page | 82 | 92 | 10 | Lead with LIVE snapshot |
| Liquidity page | 82 | 92 | 10 | "Why POL matters" lede |
| Transparency | 92 | 96 | 4 | Filter chips |
| Activity | 86 | 93 | 7 | Filters + per-event permalink |
| Ranks | 84 | 92 | 8 | Social meaning per rank |
| Roadmap | 84 | 92 | 8 | Trigger·Verification·Status per phase |
| Legal safety | 90 | 96 | 6 | Sweep /ranks /faq /whitepaper |
| Overall polish | 86 | 95 | 9 | Mobile pass + OG images |
| **OVERALL** | **87** | **94** | **7** | **Mobile + OG + Explainer parity** |

---

## Top 20 Remaining Issues (ranked)

1. Mobile experience on data-dense pages is functional, not designed.
2. No per-route OG/social-preview images.
3. PENDING surfaces (AI, NFTs, vault automation) read as broken.
4. CTA label drift across the homepage.
5. Vault and Liquidity don't lead with a LIVE snapshot.
6. Tokenomics lacks per-allocation explainers and vesting timeline.
7. `/join` flow has no stepper and weak error states.
8. No FAQ search.
9. Compounder Score copy needs one more legal sweep.
10. No member `/me` view (post-launch acceptable).
11. Docs page reads as a file list, not a learning path.
12. Whitepaper has no TOC / PDF export on mobile.
13. Activity feed lacks filters and per-event permalinks.
14. Registry lacks search and CSV export.
15. Mobile drawer doesn't always close on link tap.
16. Card padding scale isn't codified (compact/default/hero).
17. Icon system mixes lucide + emoji + svg.
18. Footer has no live-status timestamp.
19. `Sections.tsx`, `TokenomicsDonut.tsx`, `ShareableCards.tsx` are
    god-files needing split.
20. No banned-word lint to prevent future legal drift.

---

## Top 10 Highest-Impact Fixes (do these before claiming AAA)

1. **Mobile audit pass** on every route, with a checklist (overflow,
   tap targets, table affordances, share export width).
2. **Per-route OG images** — even templated ones — so every share looks
   like The Syndicate.
3. **Explainer parity**: every headline metric site-wide gets a
   `MetricExplainer`.
4. **Vault + Liquidity reorder**: LIVE snapshot first, narrative second.
5. **Canonical CTA label** + single primary CTA per page.
6. **Join flow stepper** with pre-explainers and explicit error states.
7. **PENDING narrative upgrade**: each PENDING page gets a one-paragraph
   confident future-tense lede + notify CTA.
8. **Banned-word lint script** wired into CI to prevent regressions.
9. **Compounder Score / Ranks copy sweep** for any reputation-as-
   financial wording.
10. **Footer "Live · {timestamp}"** + "Show Start Here again" link.

---

## What Should Wait Until After Launch / Community Feedback

- Member `/me` view and personalised dashboards
- Per-card OG endpoints (programmatic social previews)
- Farcaster share button
- Embeddable widgets (`Copy as embed`)
- i18n / language switcher
- Email capture & newsletter
- Member directory (privacy review needed first)
- Governance, AI layer, NFT mint, vault automation (explicitly OUT of
  this sprint)

## What Should NOT Be Built Yet

- New protocol mechanics
- New tokenomics
- New smart contracts
- New on-chain modules
- New revenue streams
- Premium plans / tiers
- Referral system

The protocol is in the polish window. Adding features now destroys the
"finished product" feeling we're trying to earn.

---

## Final Honest Grade

**A− · 87 / 100.**

The Syndicate is closer to AAA than it has ever been. It is no longer
a collection of pages — it is a coherent, transparent, member-first
product with a defensible design system and honest data discipline.

It is not yet AAA. The remaining gap is real but tractable: a focused
**Mobile + OG + Explainer + PENDING-narrative** pass would move the
overall score from 87 to ~94 in one sprint, with no new features and
no new protocol surface.

When that pass ships, this document should be updated and the grade
re-issued. Not before.
