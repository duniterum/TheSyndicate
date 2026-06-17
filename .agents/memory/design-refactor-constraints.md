---
name: Design refactor constraints (pre-refactor calibration)
description: Why past design passes missed and the safe order to refactor The Syndicate's UI
---

# Pre-refactor calibration — the real blocker is the missing primitive layer

**Root cause past design passes "didn't feel premium":** there is NO shared visual
primitive/token layer under ~140 `src/components/syndicate` components. `src/styles.css`
has a good Tailwind v4 `@theme` foundation (obsidian/ivory themes; Space Grotesk UI /
Space Mono data / Fraunces editorial), but components override it locally with hardcoded
hex (`#E3A92B`, `#F97316`), inline gradient `style={{}}`, and arbitrary classes
(`tracking-[0.28em]`, `size-[420px]`). Restyling pages on top of that re-creates
inconsistency every pass → "report style," not cockpit.

**Ruling on Sprint 0:** brand assets **AND** a *minimal* token-bound primitive kit FIRST —
NOT the homepage cockpit. Extract only ~6 primitives the cockpit needs (Stat/Metric,
StatusPill/Badge, Button/CTA, Card/Module shell, SectionShell, MonoNumber) FROM components
that already look right (ProtocolIntelligenceBar, ProtocolHero CTA); don't invent values,
don't build a full design system. Then homepage cockpit lands in ONE pass.
**Why:** homepage-first or page-by-page restyle = redesign twice (the past failure mode).

**Sprint order:** 0 Brand+Primitives → 1 Homepage cockpit (compose existing good modules) →
2 Member OS promotion → 3 Join simplification (reskin shell only) → 4 Nav/IA + cleanup.

**Reusable as-is:** ProtocolIntelligenceBar (pure module), MemberCockpit *layout*,
ProtocolHero (visual anchor; extract its local styles), LivePulseStrip, HomeActivityTape,
IdentityZone. **Too report-like (redesign later):** /join tables (RankLadder,
EraSchedulePreview, AccessRate, SeatRecordPanel), CockpitProof (→ proof-badge + verify
modal), RiskDisclaimer (→ compact modal), homepage prose (WhyJoinSimple,
WhatChangesAfterJoining).

**Safe to touch first:** brand assets, primitive kit, homepage (compose), /my-syndicate.
**Dangerous first:** /join (buy logic + legal + tables), /transparency · /registry ·
/tokenomics, any write path (LivePurchase), gated-test surfaces.

**Design-data caveat:** in DEV the cockpit shows PENDING/blanks (dev RPC artifact, NOT a
design failure) — design against production truth or fixtures. See dev-rpc-cors-cold-scan.

**How to apply:** before any UI refactor, confirm brand sign-off + accept the invisible
primitive step + decide dev-RPC-vs-fixtures; never restyle on fragmented components, never
touch buy/quote/proof logic, never delete gated components or introduce new hex/inline
color. Full detail: `docs/handoffs/PRE_DESIGN_REFACTOR_CALIBRATION_2026-06-17.md` and board
Section K.
