> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# THE SYNDICATE — AAA FINISHING PHASE ROADMAP

Living tracker for the finishing-phase master prompt. Read alongside
`VISION.md`, `SYNDICATE_PROTOCOL_MODEL.md`, `TERMINOLOGY_GLOSSARY.md`,
and `FULL_SITE_AAA_AUDIT.md`.

Status legend: ✅ shipped · 🟡 partial · ⬜ pending

---

## PHASE A — Experience QA & polish
- 🟡 Per-page audit (desktop / tablet / mobile)
- ✅ Consistent loading / empty / error states across pages (EmptyState primitive)
- ✅ No horizontal overflow on core routes
- ✅ **DEMO/PENDING surfaces polished** — Vault, AI, NFTs each carry a `MetricExplainer` (What · Why · How · Verify) above the PENDING surface.

## PHASE B — Information architecture
- ✅ **Header restructured** into grouped nav (Explore · Protocol · SYN · Members · Learn) with mobile drawer.
- ✅ **Primary CTA = Join · Secondary = Verify** (replaces ambiguous "View SYN")
- ✅ **Footer = true sitemap** with six groups (Protocol / SYN / Members / Learn / Verify / Legal)
- ✅ **Favicon + brand mark** (`/favicon.svg`) wired in `__root.tsx`
- ✅ **Breadcrumbs on every non-home route** — `Breadcrumbs.tsx` auto-mounted in `PageShell`. Emits BreadcrumbList JSON-LD.
- ✅ **"Start Here" landing card** — `StartHereCard.tsx` on homepage, first visit only, localStorage-dismissed. Three stops: Verify · Read · Join.

## PHASE C — Visitor → Member conversion
- ✅ WhyTheSyndicateExists / WhyBecomeMember / WhyEarlyMatters live
- ✅ **WhyJoinNow** — dedicated truth-only "why now" section (visibility, early formation, same access, public engine)
- ✅ **WhatChangesAfterJoining** — three explicit columns: LIVE / PLANNED / PENDING
- ✅ "What I can verify" — VerifyEverything component
- ✅ "What I can share" — ShareableCards (MemberCard + ProtocolSnapshots) now live on the homepage

## PHASE D — Shareability
- ✅ Member Card + Protocol Snapshot exports (ShareableCards)
- ✅ **Full ShareActions bar on every card**: Download PNG · Share to X · Share to Telegram · Copy text · Copy link
- ✅ **Per-card social copy templates** (revenue / assets / liquidity / members / milestone / member identity) — truth-preserving, no profit language
- ✅ **Public milestone tracker** — `MilestoneTracker.tsx` now investor-grade. Every milestone discloses Definition · Trigger · Verification source · Status · Why it matters. Status flips LIVE/PARTIAL/PENDING from on-chain reads.

## PHASE E — Member identity
- ✅ Member Journey 7-step flow with live verification state
- 🟡 Compounder Score framed as reputation (continue copy audit)
- ✅ **Early chapters surface** — `EarlyChapters.tsx`. Genesis · First 100 · First 500 · First 1,000 with live PARTIAL/LIVE status derived from buyer count.

## PHASE F — Content consistency
- ✅ Terminology glossary as single source of truth
- ✅ 70/20/10 routing harmonized site-wide
- ✅ **Canonical `StatusPill` primitive** exported from `Primitives.tsx` — only LIVE / PARTIAL / PENDING / DEMO allowed
- 🟡 Continue legal-language sweep across FAQ / Risk / Docs

## PHASE G — Design system
- ✅ **Canonical `StatusPill` migration** — Replaced ad-hoc `Pill tone="success">LIVE` / muted "PENDING" / "DEMO PREVIEW" / "COMING SOON" / "SALE LIVE" / "LIVE PAIR" / "AWAITING INDEXER" / raw `<span>LIVE</span>` instances across: `ranks`, `activity`, `nfts`, `ai`, `DexScreenerChart`, `MembersLeaderboard`, `LiveActivityFeed`, `MiniExplorer`, `ContractDossiers`, `TokenIntro`. Decorative/labeled Pills (eyebrows, "USDC IN · SYN OUT", "Identity only", "Disclaimer", etc.) intentionally remain as `Pill`.
- ✅ **Unified empty / pending / error state primitive** — `EmptyState.tsx` (`default` + `compact` variants). Migrated `MembersLeaderboard`, `LiveActivityFeed`, `MiniExplorer` (loading + error + empty), `TransparencyReport` (sales history + USDC flows).
- ✅ **MetricExplainer primitive** — `Primitives.tsx`. IR-style "What · Why · How · Verify" disclosure.
- ✅ **Share-state primitive** — `ShareActions.tsx`. Promoted out of `ShareableCards.tsx`. Single source of truth for Download PNG · Share to X · Share to Telegram · Copy text · Copy link.



---

## Final product feel — checklist
A visitor on the polished site should leave thinking:
"This is real. I understand it. I can verify it. I know why I would join.
I know what changes after I join. I know what I can share. I know where to go next."

The Syndicate must feel like **one coherent transparent onchain society**,
not a token sale site, not a dashboard, not a marketing funnel.

---

## PHASE H — Living Protocol waves (post-AAA)

After the AAA finishing phase closed, the bottleneck shifted from
documentation/transparency to *felt momentum*. The Living Protocol waves
extend the roadmap.

- ✅ **Wave 1 — `useHolderIndex`** — canonical member intelligence layer.
  Member = `TokensPurchased`. Holder = anyone else with SYN. Founder number,
  cumulative footprint, derived rank/chapter/eligibility. (`src/lib/holder-index.ts`)
- ✅ **Wave 2 — Connective tissue + `/wallet/$address`** — per-wallet
  identity surface; leaderboard / events / activity rows now link to it;
  derived rank-promotion events; milestone counts bound to the index.
- ✅ **Wave 3A — Recency layer** — `useChainTime` block→time helper;
  24h / 7d deltas on the pulse strip with tooltips disclosing window,
  calculation, and as-of block; `SinceYourLastVisit` localStorage banner;
  milestone "Reached at block N · X ago"; chapter progress %, seats
  remaining, and "+N in 24h"; bucketed `ProtocolTimeline`
  (Today / Week / Recent) on `/` and `/activity`.
- ⬜ **Wave 3B — Gate** — see `docs/WAVE_3B_GATE.md` for the post-3A
  recalibration, top-10 leave reasons, and the ranked single-best next move.
