---
name: Design refactor constraints (pre-refactor calibration)
description: Why past design passes missed and the safe order to refactor The Syndicate's UI
---

# Pre-refactor calibration — the primitive layer is BYPASSED, not missing

**Root cause past design passes "didn't feel premium" (corrected 2026-06-17):** a partial
primitive layer ALREADY EXISTS and is widely bypassed — it is a *discipline* problem, not an
absence. Canonical primitives live in `src/components/syndicate/Primitives.tsx` (StatusPill,
ProgressBar, AnimatedNumber, GlassCard, Section, SectionHeader, ProofButton, type
CanonicalStatus) plus shadcn `src/components/ui/*` (Button cva, Badge, Card, Table).
`src/styles.css` `@theme` is a solid token foundation (obsidian/ivory; Space Grotesk UI /
Space Mono data / Fraunces editorial; gold→cyan repoint in dark). BUT components route around
it: `RevenueStreams` re-declares its own local `StatusPill`; `ProtocolHero` hardcodes
`GOLD="#E3A92B"`/`FLAME="#F97316"` + local `CTA_PRIMARY`/`CTA_SECONDARY` class consts (which is
exactly why the hero stays gold in dark while the rest repoints to cyan); ~19 components
re-implement the pill with 8 tracking values × 5 micro font-sizes. Restyling pages on top of
that re-creates inconsistency every pass → "report style," not cockpit.

**Ruling on Sprint 0 (refined 2026-06-17):** FINISH + canonicalize the EXISTING primitives and
MIGRATE the bypassers — do NOT build a design system from zero. The 6 to standardize: StatusPill
(exists, enforce), Stat/Metric (extract from ticker `BarCell`), Button/CTA (unify shadcn `Button`
+ hero CTA onto `--gold` token), Panel/Card (consolidate `GlassCard`+`surface`+ad-hoc blocks),
SectionShell+SectionHeader (exist, enforce rhythm), Eyebrow/MonoLabel (new atom). `ProgressBar` +
`AnimatedNumber` are already canonical — keep. Tokens mostly EXIST; the real GAPS to add are a
**spacing scale, a label/tracking type scale, an icon-size scale, and a `--flame` token** (plus
retire hardcoded hex / raw `emerald|amber|sky` → tokens). Core work ≈ 3–5 files (`styles.css`,
`Primitives.tsx`, `ui/button.tsx`); per-component migration (~20–30) is mechanical and folds into
Sprints 1–4. Then homepage cockpit lands in ONE pass.
**Why:** homepage-first or page-by-page restyle = redesign twice (the past failure mode); and
"build a new design system" overstates it — the foundation is bypassed, not absent.

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
color. Full detail: `docs/handoffs/PRE_DESIGN_REFACTOR_CALIBRATION_2026-06-17.md` (board Section K)
and the Sprint-0 spec `docs/handoffs/DESIGN_FOUNDATION_LAYER_2026-06-17.md` (board Section L:
the 6 primitives, token gaps, brand targets, migration list, effort/risk).
