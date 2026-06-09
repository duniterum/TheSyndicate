# THE SYNDICATE — CODE HEALTH AUDIT

Audit only. No refactors performed.

---

## Shared primitives (in good shape)

`src/components/syndicate/Primitives.tsx` provides:
`Section`, `SectionHeader`, `GlassCard`, `Pill`, `MetricCard`, `CTAButton`,
`LiveTimestamp`, `ShortAddress`, `AnimatedNumber`, `ProgressBar`.

Strong reuse across the site. ✅

Other shared:
- `StatusPill` (via `Pill`) — used consistently.
- `EmptyState.tsx` — used.
- `ShareActions.tsx` — used on wallet, milestone, homepage share CTA.
- `HeaderWalletChip.tsx` — used in header (wave-3A).
- `WalletContextNotice.tsx` — used on `/wallet/$address` (wave-3A).
- `BuildStamp.tsx` — used in footer (wave-3A.qa-stamp).
- `LiveRecencyStrip.tsx`, `LivePulseStrip.tsx` — used on home.
- `Breadcrumbs.tsx` — **exists but largely unmounted**. Flag.
- `MetricExplainer` — referenced in audit history; verify presence (lives
  inside Primitives if not exported as own file).

---

## Duplicate / overlapping components

| Family | Files | Concern |
|---|---|---|
| Home composition | `HomeAllocationPreview`, `HomeJoinPreview`, `HomeJourney`, `HomeMetricsStrip`, `HomeNextMilestone`, `HomeRankLadder`, `HomeShareCTA`, `HomeTransparencySnapshot` | 8 "Home*" components — some no longer referenced from `index.tsx` (e.g. `HomeJourney`, `HomeRankLadder`, `HomeMetricsStrip`, `HomeNextMilestone`, `HomeJoinPreview`, `HomeAllocationPreview`). Verify and prune. |
| Capital / allocation | `CapitalAllocation`, `RoutingFlow`, `UseOfFunds`, `TreasuryComposition` | Overlapping mental models; intentional retelling but worth de-duplication later. |
| Rank | `RankHub`, `RankIntelligence`, `RankSimulator` | RankHub composes the other two — OK. |
| Chapter | `EarlyChapters`, `chapters.tsx`, `chapters.$slug.tsx` | OK; clean separation. |
| Founder | `founders.tsx` only | OK. |
| Members | `MembersLeaderboard.tsx` + `members.tsx` | **Naming drift** — file says "leaderboard" but product framing rejects that term. Rename in a focused pass. |

---

## Components that look stale / unused (flag — verify before delete)

Likely unmounted from current `src/routes/index.tsx`:
- `HomeAllocationPreview.tsx`
- `HomeJoinPreview.tsx`
- `HomeJourney.tsx`
- `HomeMetricsStrip.tsx`
- `HomeNextMilestone.tsx`
- `HomeRankLadder.tsx`

Possibly stale elsewhere (verify):
- `SmartContractFlow.tsx` — confirm import sites.
- `MarketDashboard.tsx` — confirm import sites.
- `MiniExplorer.tsx` — confirm import sites.
- `CanonicalSpec.tsx` — confirm.
- `WalletDebugPanel.tsx` — intentionally gated; keep.

**Action**: do not delete blindly. A focused "dead-code sweep" PR with
`rg` verification per file is the right next step (separate task).

---

## Routes importing old components

- `/` (index) currently imports a long list — verify each is still rendered.
- `Sections.tsx` is a kitchen-sink module exporting many sections; some
  (`IdeaSection`, etc.) may no longer be used by the current homepage.

---

## Naming drift

| Concern | Location |
|---|---|
| `MembersLeaderboard.tsx` | Filename says "leaderboard"; product rejects that word externally. |
| `leaderboard-hooks.ts` | Same family — internal name, less critical. |
| Home* component sprawl | 8 files with overlapping purpose; consolidation candidate. |
| `Sections.tsx` as kitchen-sink | Hard to find what's used vs legacy. |

## Styling drift

- All UI uses semantic tokens (`text-foreground`, `bg-background`,
  `text-gradient-gold`, etc.). ✅ No hex/color drift found in spot checks.
- `GlassCard` provides consistent surface treatment.
- Some sections still pass custom Tailwind variants inline — within
  guidelines if they reference tokens.

## Hook quality

- `useHolderIndex` is the load-bearing hook (anti-rewrite contract).
- Hooks are colocated under `src/lib/*-hooks.ts`. Consistent naming. ✅
- `use-live-data.ts` in `src/hooks/` predates the `lib/*-hooks.ts` pattern —
  flag for eventual co-location.

## Server code

- Server functions live under `src/lib/api/` and `src/routes/api/`. Clean.
- `client.server.ts`-style imports not currently leaking into client code
  (spot-checked OG routes).

---

## Top code-health items (ranked)

1. **Dead-code sweep** of `Home*` components and `Sections.tsx` exports.
2. **Rename** `MembersLeaderboard.tsx` (and `leaderboard-hooks.ts`?) for
   vocabulary alignment.
3. **Mount** `Breadcrumbs` on deep links.
4. **Co-locate** `use-live-data.ts` with other hooks under `src/lib/`.
5. **Document** which `Sections.tsx` exports are still alive.

None of these are urgent. They are tech-debt items, not regressions.
