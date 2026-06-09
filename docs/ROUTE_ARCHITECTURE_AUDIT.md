# THE SYNDICATE — ROUTE ARCHITECTURE AUDIT

Companion to `FULL_SITE_MAP.md`. This document inspects *how* each route is built,
not what it shows. Audit only — do not refactor.

## Conventions found in the codebase

- All routes use TanStack Start `createFileRoute`.
- Layout shell = `src/routes/__root.tsx` (Header + Footer wrappers come from page).
- Most content pages wrap children in `PageShell` (eyebrow + title + description).
- Home (`index.tsx`) opts out of `PageShell` to compose its own hero.
- Shared primitives: `Section`, `SectionHeader`, `GlassCard`, `Pill`, `MetricCard`,
  `CTAButton`, `LiveTimestamp`, `ShortAddress`, `AnimatedNumber`, `ProgressBar`.

## Route-by-route review

| Route | File | Layout | Unique components | Shared data hooks | OG | Breadcrumbs | In Header nav | In Footer |
|---|---|---|---|---|---|---|---|---|
| `/` | `index.tsx` | none (custom) | Hero, TrustBar, WhyJoinSimple, HowToJoinSteps, MemberJourney, EarlyChapters | sale, holder, pulse, recency, events | ✅ | n/a | ✅ Explore › Home | ✅ |
| `/join` | `join.tsx` | PageShell | LivePurchase, MembershipCalculator, RankLadder, PaymentStrategy, MemberCard | sale, holder, wallet | ⚠️ | no | ✅ SYN › Join | ✅ |
| `/members` | `members.tsx` | PageShell | MembersLeaderboard (renamed in spirit) | holder | ⚠️ | no | ✅ Community | ✅ |
| `/founders` | `founders.tsx` | PageShell | Founders hall components | holder | ⚠️ | no | ✅ Community | ✅ |
| `/chapters` | `chapters.tsx` | PageShell | Chapter cards | holder + config | ⚠️ | no | ✅ Community | ✅ |
| `/chapters/$slug` | `chapters.$slug.tsx` | PageShell | Chapter detail | holder + config | ⚠️ | partial | indirect | indirect |
| `/ranks` | `ranks.tsx` | PageShell | RankHub | holder | ⚠️ | no | ✅ Community | ✅ |
| `/activity` | `activity.tsx` | PageShell | LiveActivityFeed, ProtocolTimeline | events, pulse | ⚠️ | no | ✅ Explore | ✅ |
| `/transparency` | `transparency.tsx` | PageShell | TransparencyCenter, VerifyEverything | sale + treasury | ✅ | no | ✅ Protocol | ✅ |
| `/registry` | `registry.tsx` | PageShell | ContractDossiers | config | ⚠️ | no | ✅ Protocol | ✅ |
| `/token` | `token.tsx` | PageShell | TokenIntro, SynLiveStatus | sale | ⚠️ | no | ✅ SYN | ✅ |
| `/tokenomics` | `tokenomics.tsx` | PageShell | TokenomicsDonut | config | ⚠️ | no | ✅ SYN | ✅ |
| `/liquidity` | `liquidity.tsx` | PageShell | LpStatus, WhyLpMatters, LiquidityTrustContext, DexScreenerChart | LP hooks | ⚠️ | no | ✅ Protocol | ✅ |
| `/vault` | `vault.tsx` | PageShell | VaultDisambiguation, VaultPolicyCore, TreasuryComposition | treasury | ⚠️ | no | ✅ Protocol | ✅ |
| `/docs` | `docs.tsx` | PageShell | doc index | static | ⚠️ | no | ✅ Learn | ✅ |
| `/faq` | `faq.tsx` | PageShell | FaqRebuilt | static | ⚠️ | no | ✅ Learn | ✅ |
| `/whitepaper` | `whitepaper.tsx` | PageShell | long-form sections | static | ⚠️ | no | ✅ Learn | ✅ |
| `/roadmap` | `roadmap.tsx` | PageShell | roadmap phases | static | ⚠️ | no | ✅ Explore | ✅ |
| `/wallet/$address` | `wallet.$address.tsx` | PageShell | wallet detail + WalletContextNotice | holder + balance | ✅ dynamic | no | indirect | no |
| `/milestone/$id` | `milestone.$id.tsx` | PageShell | milestone detail | events | ✅ dynamic | no | indirect | no |
| `/ai` | `ai.tsx` | PageShell | coming-soon | none | ⚠️ | no | ❌ hidden | ❌ |
| `/nfts` | `nfts.tsx` | PageShell | coming-soon | none | ⚠️ | no | ❌ hidden | ❌ |
| `/episodes` | `episodes.tsx` | PageShell | episodes index | static | ⚠️ | no | ❌ hidden | ❌ |

## Findings (flag — do not fix yet)

### Duplicate concepts
- **`MembersLeaderboard.tsx`** still exists as a filename even though product
  framing rejects "leaderboard". The component itself was reframed but the
  filename is now misleading naming drift.
- **Treasury composition** is rendered on `/transparency` AND `/vault`. Same
  component, different framing — verify intentional (it is, but flag).
- **RoutingFlow** appears on `/` and `/transparency`. Intentional, but
  homepage version should reuse the same component (it does — good).
- **Capital / allocation** logic split across `CapitalAllocation`,
  `HomeAllocationPreview`, `UseOfFunds`, `RoutingFlow`. Four components,
  overlapping mental models.

### Stale / unused routes
- `/ai`, `/nfts`, `/episodes` are not in nav. Either hide via redirect,
  promote to "coming soon" within roadmap, or delete. Today they are
  silent landmines (URLs work but feel half-built if guessed).

### Routes that should be merged (recommendation only)
- `/docs` + `/whitepaper` + `/faq`: three knowledge surfaces. Consider
  unifying under `/docs` with sub-pages once content stabilizes.
- `/founders` + `/members` + `/chapters`: three identity surfaces. They
  serve different stories (first / all / era) but the visitor must learn
  three names. Worth a future IA pass — see NAV audit.

### Routes needing stronger CTAs
- `/activity`, `/registry`, `/tokenomics`, `/whitepaper`, `/roadmap` —
  end with nothing actionable. See UX audit.

### Hidden routes that should be cleaned up
- `/ai`, `/nfts` — banned in scope until further notice. Should either be
  deleted as routes or replaced with a single neutral
  "Pending modules" page that links from `/roadmap`.

### Routes that should NOT change
- `/`, `/join`, `/transparency`, `/wallet/$address`, `/ranks` — high-conversion
  or trust-critical. Treat as frozen until real-user testing.

## SEO / OG state
- ✅ full meta + image: `/`, `/transparency`, `/wallet/$address`, `/milestone/$id`
- ⚠️ text meta only (no og:image): every other public page
- ❌ none currently inherit root only — every public page has at least its
  own title + description.

## Breadcrumbs
- `Breadcrumbs.tsx` exists as a primitive but is not mounted on most pages.
  Recommend adding to `/wallet/$address`, `/chapters/$slug`, `/milestone/$id`
  (deep links) — defer to a later UX wave.
