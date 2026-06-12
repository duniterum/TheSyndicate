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
NOT `var(--accent)` (which is cyan in `.dark`). This is a sanctioned site-wide gold
extension beyond the hero — gold tracks seat/identity, and Join = "claim your seat". Do
NOT revert the Header Join to `var(--accent)` thinking the dark-mode cyan is the bug; it
is intentional. The seam rule still holds for everything else (chrome/links/secondary
stay cyan in dark).

**Header lockup (header+hero alignment pass — supersedes the earlier "folded" pass).**
Logo uses `tone="gold" withProtocolLabel` (gold "S" plate + "The Syndicate"/"PROTOCOL"
sub-line) — a sanctioned gold extension. `Logo.tsx` defaults stay cyan (`tone="accent"`),
so Footer/PageShell/Sections are UNAFFECTED — gold is opt-in per call site only.
Right cluster order (LOAD-BEARING) = **Bell · AvalancheNetworkPill · ThemeToggle (visible
icon) · Connect Wallet (separate outline button) · Join (gold)**. This REVERSES the prior
pass: the Avalanche pill is now a STANDALONE, non-interactive network indicator
(`AvalancheNetworkPill`, exported from HeaderWalletChip) = red AvalancheMark `#E84142` +
"Avalanche" word + liveness dot; it is NOT the connect affordance. Connect is again a
SEPARATE outline button (label compacts "Connect Wallet"→"Connect" below 2xl). The desktop
theme toggle is BACK in the cluster as a visible `variant="icon"` (md+), removed from the
More dropdown. Do NOT re-fold connect into the pill or re-hide the toggle — that was the
old reference and is intentionally undone.
Dot color = `var(--success)` green (live, shown even for visitors) / amber `#F59E0B` = wrong
network or connecting; on wrong chain the pill label switches to "Wrong network" (amber
text) — keep that visible truth signal. Verify is NOT a right-cluster button — it lives in
PRIMARY nav (`verify_click` analytics via a per-link onClick guarded on `to === "/transparency"`).

**Header is width-bound — treat 1280 as the ceiling.** At 1280 the row is essentially FULL
(~13px slack: logo + inline nav (~573px, mono text that does NOT shrink) + cluster). So the
full inline `<nav>` is `xl:flex` ONLY; below xl (1024–1279) it collapses to the hamburger
drawer (the drawer already holds every PRIMARY + group item — nothing is lost). The chapter
chip ("CH #001") and the pill's "C-Chain" sublabel are gated `hidden 2xl:inline` to reclaim
width; the tightened nav padding (`px-2`) + cluster `gap-1.5` are load-bearing for the 1280
fit. The CONNECTED wallet chip is also width-budgeted: it shows a compact identity (dot +
`…{last4}`, no caret) below 2xl and the full `fmtAddress` + chevron only at 2xl+, mirroring
the disconnected "Connect"→"Connect Wallet" compaction — the full `0x1234…5678` (~127px) is
~50px wider than "Connect" and would overflow the ~13px-slack row at 1280 if shown verbatim.
**Adding any nav item OR cluster element requires removing one (or raising a breakpoint)
— do not assume there is free space at 1280.** The heavy `ProtocolIntelligenceBar` is hidden
on the HOMEPAGE only (PageShell `hideIntelligenceBar` prop set by `routes/index.tsx`) because
the hero carries its own "PROTOCOL OVERVIEW"; it still renders on every other page.

**Header cluster gold hovers/focus pinned to explicit `#E3A92B`, NOT `var(--gold)`.** The
Connect button, the ThemeToggle icon variant, and the connected-state wallet chip trigger use
`hover:*-[#E3A92B]` / `focus-visible:ring-[#E3A92B]` because `var(--gold)` collapses to CYAN
in `.dark` (same reason the hero/Join pin gold). Dropdown-internal and mobile-drawer
`var(--gold)` (wallet menu links, ThemeToggle `pill` variant) are revealed-on-interaction and
left as-is — only the always-visible cluster controls must pin the explicit hex.

**Why:** keeps the whole site reading as ONE product and prevents drift back to soft
"museum" styling or generic crypto templates; and keeps the single most important
conversion action visually identical (gold) across themes so it always reads as the
strongest CTA.

**How to apply:** when touching any shell/brand surface, pull color from tokens (cyan in
dark), keep geometry sharp, use the shared Logo, and never introduce serif outside the
editorial scope.
