# THE SYNDICATE — WAVE P EXECUTION REPORT (Verification + Parity)

Source of truth: `docs/VISION.md`, `docs/CONSTITUTION_SUMMARY.md`,
`docs/INFORMATION_HIERARCHY.md`, `docs/SITE_REDESIGN_EXECUTION_REPORT.md`,
`docs/LIVE_SITE_PARITY_AND_TRUTH_CLEANUP_REPORT.md`.

This pass executes the four approved proposals from the post-cleanup
review:

1. Redeploy + re-run check-live  →  user action (Publish → Update).
2. Cache-busting + deployment parity safeguards.
3. Verify every route against the constitution.
4. Heartbeat verification drawers, gated on a Data Verification Registry.

No new features, no new strategy, no new audits.

---

## 1. Data Verification Registry (gate before drawers)

- **`docs/DATA_VERIFICATION_REGISTRY.md`** — narrative table of every
  metric exposed in the hero and heartbeat: key, hook, source, status,
  refresh cadence.
- **`src/lib/data-verification-registry.ts`** — typed runtime mirror.
  `METRIC_REGISTRY` is the single source of truth at runtime. Every
  metric is `LIVE`; none are `PARTIAL`/`PENDING` today.

Rule: a heartbeat cell with no registry entry must not ship.
`MetricVerificationDrawer` logs a console warning if a missing key is
passed.

## 2. Heartbeat verification drawers

- **`src/components/syndicate/MetricVerificationDrawer.tsx`** — shared
  shadcn `Dialog` that renders: status pill, current value, hook name,
  on-chain source, refresh cadence, empty-state semantics, and direct
  explorer links from the registry.
- **`src/components/syndicate/LivePulseStrip.tsx`** — every CellTile is
  now a `<button>` that opens the drawer for its registry key. Hint
  copy under the strip changed to "click to verify". External links
  still reach the explorer — they now live inside the drawer so the
  click is non-destructive.

The drawer reinforces the core promise (verify everything) at the
point a visitor's eye is already on the number.

## 3. Route verification & constitutional cleanup

Surgical removals from mounted components (no structural changes):

| File | Change |
|---|---|
| `src/components/syndicate/Sections.tsx` (JoinSection, RankLadder, MembershipCalculator, Ranks, VaultDashboard, VaultGrowthChart) | Dropped "Est. Compounder Score", "×score multiplier" badges (3 places), "Private strategy room access", "Proposal priority", "Higher Compounder Score multiplier", "Higher governance weight" rank-ladder benefits. Replaced with neutral recognition benefits (badge, archive placement, member number, manual onboarding). Removed VaultDashboard fake metrics "Compounder Activity", "Latest Episode", "Next Vote", "Genesis NFTs Minted", "Top Tier Reached". VaultGrowthChart "DEMO PREVIEW" pill → "PENDING" label aligned to constitution. |
| `src/components/syndicate/FaqRebuilt.tsx` | Rewrote 5 FAQ entries that referenced Compounder Score, score multipliers, "LP badges/leaderboard/governance boost/Genesis NFT eligibility" promises, and "Why are some sections labeled DEMO PREVIEW". |
| `src/components/syndicate/WhyLpMatters.tsx` | "LPs are recognized" card with planned LP badges/leaderboard/NFT eligibility → "Early LPs shape the pool" — no yield, no entitlement. |
| `src/components/syndicate/CanonicalSpec.tsx` | "Higher contributions unlock rank and Compounder Score" → "rank and archive recognition". |
| `src/routes/roadmap.tsx` | FUTURE: "Public Compounder Score history" → "Public on-chain identity, badges, and contribution archive history". |
| `src/routes/whitepaper.tsx` | Removed "Future LP recognition (badges, leaderboard, governance boost, Genesis NFT eligibility) is PENDING" → honest LP risk paragraph. |

Files intentionally **not** edited:

- `src/components/syndicate/Sections.tsx` orphan exports (`IdeaSection`, `CompounderScore`, `Leaderboard`, `FAQ`, `GenesisNFT`, `EpisodeEngine` content, `WhitepaperPreview`) — not mounted on any reviewed public route; flagged for a future dead-code removal pass.
- `src/lib/leaderboard-hooks.ts`, `src/components/syndicate/MembersLeaderboard.tsx` — same, not mounted.
- `/episodes`, `/nfts`, `/ai` route placeholders — PENDING-safe.

## 4. Deployment parity safeguards

- **`src/lib/build-stamp.ts`** — bumped to `wave-P.verification-drawers` / `2026-06-05T12:00:00Z`. This is the canonical "what build is live" fingerprint surfaced in the footer (`data-build-tag` attribute).
- **`scripts/check-live-content.mjs`** — now reads the current source `tag` from `build-stamp.ts` and compares against the deployed build stamp pulled from `/`. Mismatch fails the script with a clear "source=… · deployed=…" line and a Publish → Update prompt. This closes the silent "source ≠ live" gap that motivated this entire pass.
- **`scripts/live-content-rules.json`** — extended:
  - `/`: must include "click to verify"; mustNot "Compounder Score".
  - `/join`: mustNot "Compounder Score", "score multiplier", "Private strategy room", "proposal priority".
  - `/transparency`, `/tokenomics`, `/docs`: mustNot "Compounder Score".
  - new entries for `/faq`, `/liquidity`, `/vault`, `/roadmap`, `/whitepaper` with constitution-aligned mustNot lists.

## 5. What still requires the user

- **Publish → Update** is the only remaining step for parity. Source is now correct on every route reviewed; the deployment freshness gap closes when the new bundle ships.
- After Publish, run `npm run check-live` — the parity gate will pass only if `wave-P.verification-drawers` is the live tag.

## 6. Remaining risks

- Orphan exports in `Sections.tsx` (≈8 unmounted exports still containing legacy copy) — safe today, fragile tomorrow if a route re-imports them. Removal is a separate cleanup wave.
- `HomeMetricsStrip.tsx` still defines a `DEMO PREVIEW` pill label internally but is not mounted on the homepage after the redesign — left in source for now; flagged for removal alongside the other orphans.
- Heartbeat drawers display zero `PARTIAL`/`PENDING` rows because every current metric is LIVE; future additions must respect the registry contract before render.

## 7. 10-second rule

Unchanged. The 6-zone homepage from `SITE_REDESIGN_EXECUTION_REPORT.md`
is intact. The drawer makes the heartbeat **more** trustworthy without
adding any new sections above the fold.

---

## Files touched (this pass)

Created:
- `docs/DATA_VERIFICATION_REGISTRY.md`
- `docs/WAVE_P_EXECUTION_REPORT.md`
- `src/lib/data-verification-registry.ts`
- `src/components/syndicate/MetricVerificationDrawer.tsx`

Edited:
- `src/components/syndicate/LivePulseStrip.tsx`
- `src/components/syndicate/Sections.tsx`
- `src/components/syndicate/FaqRebuilt.tsx`
- `src/components/syndicate/WhyLpMatters.tsx`
- `src/components/syndicate/CanonicalSpec.tsx`
- `src/routes/roadmap.tsx`
- `src/routes/whitepaper.tsx`
- `src/lib/build-stamp.ts`
- `scripts/check-live-content.mjs`
- `scripts/live-content-rules.json`
