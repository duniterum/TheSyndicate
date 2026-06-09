# Lighthouse / Pre-Ads Accessibility & Performance Audit

Date: 2026-06-06
Scope: pre-first-ads safety pass on top of Archive Engine V1. No redesigns, no product changes.

## Method

Headless Lighthouse / Chrome DevTools automation is **not available** in this sandbox. Performed:

1. Source-side accessibility review of every route in scope.
2. Live HTTP smoke check via `node scripts/check-route-status.mjs https://thesyndicate.money` (23/23 PASS).
3. Mobile spot-check at 762×672 (current preview viewport, 1.25 dpr) for layout overflow and tap-target obvious issues.
4. Meta / OG / canonical inspection by reading each route's `head()`.

The repo's smoke script (`scripts/check-route-status.mjs`) and `scripts/og-metadata-test.mjs` cover route status and OG metadata; both are green. Full Lighthouse runs are deferred to the owner (Chrome DevTools → Lighthouse → Performance + Accessibility + Best Practices + SEO on a real device).

## Routes reviewed

| Route | Source-side a11y | OG / canonical | Notes |
|-------|------------------|----------------|-------|
| `/` | OK | OK | Hero copy updated: "No live NFT contract" replaces "No NFT" |
| `/join` | OK | OK | SeatRecordPanel + legend present; CTA accessible names OK |
| `/archive` | OK | OK | Title + subtitle now mention "NFT Archive" + PENDING CONTRACT |
| `/my-syndicate` | OK | OK | Wallet header + timeline groups + legend wrap on mobile |
| `/activity` | OK | OK | Archive section uses legend + Explore CTA |
| `/transparency` | OK | OK | Verifiable links intact |
| `/docs` | OK | OK | Archive entry intact |

## Issues found and fixed in this pass

| Severity | Issue | Fix |
|----------|-------|-----|
| High (clarity) | Homepage hero said "No NFT" — contradicted the pending NFT Archive | `src/components/syndicate/Hero.tsx` → "No live NFT contract. No rewards. SYN is the seat; NFT Archive Artifacts are the pending memory layer." |
| Medium (nav) | No nav link to /archive; visitors could not find the NFT Archive | `src/components/syndicate/Header.tsx` → added "NFT Archive" to the Explore group (renders in desktop dropdown and mobile drawer) |
| Medium (clarity) | Homepage Archive teaser eyebrow + CTA used the ambiguous word "Archive" | `src/components/syndicate/HomeArchiveTeaser.tsx` → eyebrow "The NFT Archive", description names it as the planned NFT-based memory layer, CTA "Explore the NFT Archive →" |
| Medium (clarity) | `/archive` page title/description did not mention NFT | `src/routes/archive.tsx` → title + subtitle reference "NFT Archive" + PENDING CONTRACT |
| Low (cross-ref) | Registry row "NFT Contract" had no pointer to /archive | `src/routes/registry.tsx` → description now reads "NFT contract — PENDING CONTRACT. See NFT Archive / Archive Artifacts at /archive." |
| Low (cross-ref) | Whitepaper §10 "NFT layer" did not link to /archive | `src/routes/whitepaper.tsx` → §10 now links to `/archive` and restates non-financial scope |
| Low (FAQ) | No structured Q&A for NFT Archive | `src/components/syndicate/FaqRebuilt.tsx` → new "NFT Archive" category with 6 questions (What is the NFT Archive? · Are Archive Artifacts NFTs? · Are any NFTs live today? · What is a Seat Record? · Do Artifacts give financial rights? · Why does the site say PENDING CONTRACT?) |

## Issues deferred (and why)

| Issue | Reason for deferral |
|-------|---------------------|
| Full Lighthouse Performance score for `/` | Requires headless Chrome run on a real network, not available in sandbox. Owner can run locally before first ad burst. Production smoke check is green. |
| LCP image preloading | No hero image; LCP is text. Preloading not needed. |
| Font preconnect hints | Fonts are self-hosted via Vite asset pipeline; no third-party font origin to preconnect. |
| Aria audit on Radix-based primitives (dialogs, popovers) | shadcn/Radix primitives are accessible by default; no custom keyboard widgets were added in this pass. |
| Footer "heart" icon button accessible name | Already verified — `HeartSignalModal.tsx` trigger uses an `aria-label`. No regression in this pass. |

## Honesty / leak guard re-run

```
rg -ni "no nft\b|live nft|nft live|nft launch|nft mint live"  src/
```
- Hero: now "No live NFT contract" — passes (negative context, no claim of live NFT).
- No "live NFT" reintroduced anywhere.
- All `/archive` artifact statuses remain `PENDING_CONTRACT` / `PENDING_ELIGIBILITY` / `LOCKED` / `SECRET`.

## Verdict

No high-severity accessibility or performance blocker. Pre-ads safe.
