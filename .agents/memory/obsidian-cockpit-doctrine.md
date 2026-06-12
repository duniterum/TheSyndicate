---
name: Obsidian Cockpit theme doctrine
description: Brand/visual rules for The Syndicate shell so future edits stay consistent.
---

Approved identity: **Direction A — Obsidian Cockpit** (premium crypto cockpit + living
protocol + collector archive + on-chain progression). NOT "dark theme applied", NOT
"developer dashboard", NOT "generic crypto template".

Rules:
- **Accent = neon cyan in DARK theme only.** Dark is the default (see `src/lib/theme.tsx`).
  Light theme intentionally keeps gold + warm ivory — this is a deliberate dual-theme
  decision, not a bug. `--gold`/`--accent`/`--verify` all alias to cyan in `.dark`.
- **Serif (Fraunces) ONLY inside `.editorial-serif`** scope (Chronicle/whitepaper). The
  unlayered `.editorial-serif h1/h2/h3/blockquote` rule overrides the `font-serif`
  utility (which `@theme inline` bakes to Space Grotesk). Default display = Space Grotesk.
- **Geometry is crisp.** Global `--radius` is small (0.25rem) so cards/buttons/badges
  read as instruments. BrandMark is a square plate.
- **Brand mark is shared:** `src/components/syndicate/Logo.tsx` (BrandMark/Wordmark/Logo)
  is the single source — reuse it, never hand-roll a new logo block.
- **CTA hierarchy:** primary = solid cyan + black text, mono uppercase; secondary =
  outline; tertiary = muted ghost. Live via `CTAButton` variants gold/navy/ghost.

**ProtocolHero is a deliberate EXCEPTION (premium-hero mandate):** the hero pins an
explicit GOLD base (`GOLD = "#E3A92B"` + GOLD_SOFT/LINE/GRAD/GLOW consts) in BOTH
themes, because `var(--gold)` collapses to cyan in `.dark` and the supplied reference
mockups are gold in light AND dark. So in the hero: **gold = brand/identity accents,
green (`var(--success)`) = live money ONLY, cyan (`var(--verify)`) = the verify action
ONLY, Avalanche red = the chain pill ONLY.** Do NOT "fix" the hero's hardcoded gold
back to `var(--gold)`/cyan — that is intentional, not drift. **Decided by founder:** keep
the rest of the dark theme cyan/cockpit and let the gold hero be the standout centerpiece
— the gold/cyan seam below the hero is accepted, do NOT extend gold site-wide. Every hero
figure traces to a
real hook (useProtocolTruth/Pulse/ChainTip/QuoteSyn); the "Live on-chain reads" microline
is gated on `chainLive` (no invented "operational" claims).

**Join / claim-seat CTA is gold in BOTH themes everywhere (hero AND Header).** The
primary conversion CTA ("Join") is hardcoded with the gold gradient
(`linear-gradient(135deg,#F5C94A,#E3A92B,#9E6412)`, text `#15110A`) in the Header too,
NOT `var(--accent)` (which is cyan in `.dark`). Connect Wallet stays a neutral outline
(secondary) and lives in the Header before Join; theme toggle stays visible. This is the
ONE sanctioned site-wide gold extension beyond the hero — gold tracks seat/identity, and
Join = "claim your seat". Do NOT revert the Header Join to `var(--accent)` thinking the
dark-mode cyan is the bug; it is intentional. The seam rule still holds for everything
else (chrome/links/secondary stay cyan in dark).

**Why:** keeps the whole site reading as ONE product and prevents drift back to soft
"museum" styling or generic crypto templates; and keeps the single most important
conversion action visually identical (gold) across themes so it always reads as the
strongest CTA.

**How to apply:** when touching any shell/brand surface, pull color from tokens (cyan in
dark), keep geometry sharp, use the shared Logo, and never introduce serif outside the
editorial scope.
