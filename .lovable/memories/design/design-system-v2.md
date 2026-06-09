---
name: Design system v2 — light default + dark, gold/cyan semantics
description: Wave 1 recalibration tokens, fonts, theme toggle wiring, locked Dribbble refs
type: design
---
Light is the DEFAULT theme. Dark available immediately via ThemeToggle in header (desktop) + mobile drawer + sticky MobileJoinBar. Preference persisted to localStorage key `syndicate.theme`; no `prefers-color-scheme` follow on first visit. Anti-flash boot script `THEME_BOOT_SCRIPT` injected in `<head>` by RootShell before hydration.

**Locked Dribbble references (Wave 1 anchors):**
- Museum Plus (Sick Agency) — /nft Archive: warm ivory, framed artifacts, serif headlines, generous spacing. "SYN is the seat. Artifacts are the memory."
- Tactyc (Vektora) — live proof/dashboard: investor-grade metric cards, mono numerals, status pills, readable data hierarchy.
- Kuldmuna Arhiiv (NOPE Creative) — dark mode + protocol seal: cinematic black/gold archive mood, gold coin/seal feeling, logo/favicon direction.

**Color semantics (binding):**
- Gold (`--gold` #C99A2E light / #EAB929 dark) = membership, rank, identity, premium CTA, protocol seal.
- Verify cyan (`--verify` #0E9AA7 light / #10ADBA dark) = verification, live data, on-chain proof, source links.
- Success green (`--success`) = success only.
- Warning amber (`--warning`) = warning only.
- Destructive red (`--destructive`) = errors only.
- Never mix roles. Never use gold for verification, never cyan for CTAs.

**Light palette (canonical):** bg #F7F3EA · card #FFFFFF · panel #EFE8D8 · text #111 / #57534E / #78716C · border #DED6C8.
**Dark palette (canonical):** bg #050505 · panel #0D0D0F · card #151518 · border #26262B · text #F7F4EA / #B8B8B8 / #777.

**Typography (locked):**
- `--font-serif` Instrument Serif → H1/H2 story, archive titles, quotes, hero headline, big emotional moments. Never long paragraphs.
- `--font-sans` Work Sans → body, UI, buttons, nav, cards, dashboard labels.
- `--font-mono` JetBrains Mono → addresses, hashes, IDs, member#, block#, gas/fee values.
- Fonts loaded via `<link>` in `__root.tsx` (NEVER `@import` URL in styles.css — Lightning CSS breaks).

**Component primitives planned (Wave 1 partial / future waves):** StatusPill, AddressCard, ProofButton, MetricCard, CTAGroup, RouteFlow, ArtifactCard, ThemeToggle (done), MemberNumberPreview, LiveEventRow, RankProgressCard. Migrate existing components to semantic tokens incrementally — never hardcode `oklch(...)` in components, only reference tokens.
