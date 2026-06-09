# Site-wide harmonization plan

Goal: every page feels like the same protocol. Same shell, same rhythm, same cards, same CTAs, same proof, same status, same theme.

Approach: **5 small phases, each independently shippable.** Each phase ends with a visual check in both themes. No big-bang rewrites. No functionality touched.

---

## Audit summary (what already exists vs what's missing)

| Layer | Current | Verdict |
|---|---|---|
| Header | `Header.tsx` used everywhere via `PageShell` | ✅ unified |
| Footer | `Sections.tsx::Footer` used everywhere via `PageShell` | ✅ unified |
| Page shell | `PageShell` used by 24 of 29 routes | ⚠️ 5 routes bypass it (`index`, `nfts`, `labs`, `episodes`, `__root`) |
| Section rhythm | `Section` primitive enforces `max-w-7xl px-5 md:px-8 py-20 md:py-24` | ✅ exists, but new sections (Hero, Showcase, FinalMintCTA) bypass it with ad-hoc paddings |
| Cards | `GlassCard`, `MetricCard`, `Pill` exist | ⚠️ no `AddressCard` / `ProofCard` / `ActionPanel` primitives — duplicated inline |
| Buttons | No `PrimaryButton` / `SecondaryButton` / `ProofButton` primitives — all inline classNames | ❌ inconsistent |
| Status pills | `Pill` exists with `success / warning / navy / muted` tones | ⚠️ needs LIVE/PARTIAL/PENDING/LOCKED/RESERVED/FUTURE/VERIFIED/ERROR vocabulary |
| Theme | Light default + dark toggle, semantic tokens in `styles.css` | ✅ wired |
| Typography | Instrument Serif (`font-serif`) / Work Sans (default) / JetBrains Mono (`.mono`) | ✅ wired |
| Mobile sticky bar | `MobileJoinBar` exists | ⚠️ doesn't change CTA per route (e.g. /nft should show Mint) |

So this is a **harmonization pass**, not a rebuild.

---

## Phase 1 — Shell coverage (small, safe)

- Migrate `src/routes/index.tsx` to `PageShell hideHeader` (it already manages its own EditorialHero) so DemoBanner + Header + Footer come from one place.
- Update `src/routes/nfts.tsx` to alias the new `NftPage` (not `ArchivePage`) so plural URL gets the artifact-first redesign too.
- Confirm `episodes` is a redirect (already is — no change), `labs` is internal noindex (no change).

Result: every public route renders through one shell with the same DemoBanner + Header + Footer.

## Phase 2 — Section/rhythm primitive

- Audit new sections built recently (`FirstSignalShowcase`, `HowArchiveWorksFlow`, `FinalMintCTA`, `Hero`, `EditorialHero`) — they use ad-hoc `max-w-6xl`, `py-16 md:py-20`, `py-20 md:py-24`. Pick **one canonical** (`max-w-6xl` for editorial/hero, `max-w-7xl` for dashboard/data — same vertical rhythm `py-16 md:py-24`) and document the rule at the top of `Primitives.tsx`.
- Add an optional `width?: "editorial" | "data" | "narrow"` prop to `Section` so any new section uses the primitive instead of re-rolling its own container.

Result: identical horizontal/vertical rhythm site-wide.

## Phase 3 — Card + Button + Proof primitives

Add to `Primitives.tsx`:

- `PrimaryButton` — gold bg, mono uppercase, min-h-11, `shadow-glow-gold`, used for: Join, Mint, Take your seat.
- `SecondaryButton` — bordered, hover gold border, min-h-11, used for: Verify, Browse, Explore.
- `ProofButton` — cyan accent, small, used for: Copy, Open Avascan, View Contract.
- `AddressCard` — label + short address + copy + explorer link + status pill, in one consistent block. Replaces ~6 inline duplicates across `/nft`, `/archive`, `ArchiveContractStatus`, `TrustBar`, `ChapterOneHero`.
- `ActionPanel` — gold-framed CTA block (used by FinalMintCTA, hero CTAs) so they share one shape.
- `StatusPill` — wraps existing `Pill` with the locked vocabulary (LIVE/PARTIAL/PENDING/LOCKED/RESERVED/FUTURE/VERIFIED/ERROR) and locked tones.

Then **find-replace** inline button/address/status classNames across routes to use the primitives. ~10–15 files touched, mechanical, no logic change.

Result: one CTA system, one proof system, one status system.

## Phase 4 — Page-template alignment

Tag each route with one of 4 templates and reorder sections to match the template's canonical order. This is mostly section reordering + removing duplicates, not new code:

- **Landing** (`/`)
- **Product/Action** (`/nft`, `/nfts`, `/join`, `/buy` if any)
- **Proof/Data** (`/activity`, `/vault`, `/liquidity`, `/token`, `/transparency`)
- **Editorial/Story** (`/docs`, `/whitepaper`, `/chapters`, `/chapters/$slug`, `/archive`)

Each ends with a "Final CTA" block using the shared `ActionPanel`.

## Phase 5 — Mobile + theme QA

- Screenshot every page at 390×844 light AND dark, fix anything that breaks.
- Per-route sticky `MobileActionBar` (Join | Verify by default; Mint | Verify on /nft, /nfts; Buy SYN | Verify on /token).
- Footer audit: confirm one-liner, main nav, proof links, disclaimer, light/dark parity.

---

## Out of scope (explicitly)

- No contract/integration changes.
- No mint-flow changes (tracker, persisted hashes, gas, explorer links all preserved).
- No new copy invention — only consolidation of existing wording into the standard verbs (Join / Mint / Verify / Copy).
- No homepage redesign — only shell migration + template tagging.

## Recommendation

Ship Phase 1 + Phase 2 first (1 turn, ~6 files, very safe). That unifies the shell and the rhythm. Then approve Phase 3 (primitives + sweep) — this is the biggest single ROI for "feels like one product". Then 4 and 5.

Reply with **"Go Phase 1+2"**, **"Go all 5"**, or trim/reorder.
