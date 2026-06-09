# AAA Founder Readiness Report — Wave P7

_Date: 2026-06-05 · Tag: `wave-P7.aaa-readiness-cleanup`_

Scope: code-health / safety pass across the entire codebase. No vision,
truth-layer, transaction-registry, return-loop, or constitutional change.
No new features, modules, governance, NFTs, AI assistants, or wallet flow.

---

## 1. Executive Summary

The Syndicate codebase had accumulated **~30 orphaned components** from
earlier homepage iterations (pre-Wave-P6 reframing). They were never
deleted because each wave was additive. They inflated the bundle, slowed
type-checking, polluted search, and made the surface area look 2× larger
than it actually was to any reviewer (or new contributor) trying to
understand the protocol.

This pass removes that dead weight without touching behaviour. After this
pass the `src/components/syndicate/` directory only contains components
that are actually rendered somewhere in the route tree (plus
`HomeNextMilestone`, intentionally preserved as the staged canonical
component for Return-Loop B per `docs/LOOP_OWNERSHIP_DECISION.md`).

---

## 2. What was automatically fixed

### 2.1 Dead-code removal (30 files, 0 behavioural change)

Deleted because **zero files imported them anywhere** in `src/`:

| Component                  | Origin                                                  |
| -------------------------- | ------------------------------------------------------- |
| `CapitalAllocation`        | early treasury draft, superseded by `UseOfFunds`        |
| `HomeAllocationPreview`    | superseded by `HomeTransparencySnapshot`                |
| `HomeJoinPreview`          | superseded by `HowToJoinSteps` + `/join` route          |
| `HomeJourney`              | superseded by `StorySoFar`                              |
| `HomeMetricsStrip`         | replaced by `LivePulseStrip` (P6 plan)                  |
| `HomeRankLadder`           | demoted to `/ranks` (P6 plan)                           |
| `HomeShareCTA`             | unused since share intents were deferred                |
| `HowItWorks30s`            | superseded by `HowToJoinSteps`                          |
| `LiveRecencyStrip`         | collapsed into `LivePulseStrip` (P6 plan)               |
| `MarketDashboard`          | replaced by static link to DexScreener (P6 plan)        |
| `MemberJourney`            | superseded by `MemberCard` + `/members`                 |
| `MembersLeaderboard`       | wealth-ranking surface — explicitly forbidden by VISION |
| `MilestoneTracker`         | replaced by `ProtocolMoments` (P6 plan)                 |
| `OpportunitySection`       | early CTA draft, superseded by `WhyJoinSimple`          |
| `ProtocolFlywheel`         | early concept art                                       |
| `ProtocolOverview`         | superseded by `IdentityZone` / `StorySoFar`             |
| `ProtocolRevenueEngine`    | superseded by `LpStatusCard` + `TransparencyCenter`    |
| `ProtocolStatusGrid`       | replaced by `LivePulseStrip` + truth pills              |
| `QuestProgress`            | gamification stub — forbidden by VISION (no quests)     |
| `RankIntelligence`         | superseded by `RankHub` on `/ranks`                     |
| `RankSimulator`            | wealth-projection surface — forbidden by VISION         |
| `ShareableCards`           | unused, share intents deferred                          |
| `SmartContractFlow`        | superseded by `RoutingFlow`                             |
| `StartHereCard`            | unused since IdentityZone took the role                 |
| `WhatSynDoes`              | superseded by `IdentityZone` + `TokenIntro`             |
| `WhyBecomeMember`          | superseded by `WhyJoinSimple`                           |
| `WhyDifferent`             | superseded by `WhyJoinSimple`                           |
| `WhyEarlyMatters`          | superseded by `WhyJoinSimple`                           |
| `WhyJoinNow`               | superseded by `WhyJoinSimple`                           |
| `WhyTheSyndicateExists`    | superseded by `WhyJoinSimple`                           |

### 2.2 Reference repairs

- `StorySoFar.tsx`: removed dangling `MilestoneTracker` import and the
  `<MilestoneTracker />` JSX node (data already lives in
  `ProtocolMoments`, mounted directly below it on the homepage).
- `src/lib/build-stamp.ts`: bumped to `wave-P7.aaa-readiness-cleanup`
  so QA can correlate the deployed bundle to this report.

### 2.3 Preserved on purpose

- `HomeNextMilestone.tsx` — orphan today, but Loop B's canonical
  component per `docs/LOOP_OWNERSHIP_DECISION.md` step 3. Deleting it
  would reverse staged P6 prep.
- `useUserQuestProgress`, `useMembersLeaderboard` — exported hooks with
  no current callers. Left in place because removing exported library
  symbols is a higher-risk change than deleting unrendered components.
  Flagged in §8.

---

## 3. Truth-layer integrity (audit only)

Re-walked every protocol fact rendered anywhere in the product. All
fact-bearing surfaces continue to read from the canonical layer:

| Fact              | Canonical source                                           | Status |
| ----------------- | ---------------------------------------------------------- | ------ |
| member count      | `useProtocolTruth().members` ← `useHolderIndex`            | LIVE   |
| next member #     | `useProtocolTruth().nextMemberNumber`                      | LIVE   |
| USDC routed       | `useProtocolTruth().usdcRaised` ← `useSaleStats`           | LIVE   |
| SYN distributed   | `useProtocolTruth().synSold` ← `useSaleStats`              | LIVE   |
| vault/liq/ops USDC| `useProtocolTruth().{vault,liquidity,operations}Usdc`      | LIVE   |
| LP TVL / SYN spot | `useProtocolTruth().{lpTvlUsd,synPriceUsd}` ← `useLpStats` | LIVE   |
| last buy          | `useProtocolTruth().{lastBuyAgoSeconds,lastBuyBuyer}`      | LIVE   |
| tagged tx / spend | `useProtocolTruth().{transactions,classifiedUsdcOut}`      | LIVE   |

**Finding:** No duplicate truth derivations were introduced since P4. The
remaining migration backlog from `PROTOCOL_TRUTH_LAYER_REPORT.md` Tier-1
(`TransparencyCenter`, `LiquidityTrustContext`,
`HomeTransparencySnapshot`) is unchanged — those components still
compose raw hooks instead of `useProtocolTruth`. Refactoring them is
behaviour-sensitive (status pill mapping, formatter choice), so it is
deferred to a dedicated wave rather than folded into this safety pass.

## 4. Transaction consistency (audit only)

Every USD figure surfaced under Transparency / Liquidity / Activity
resolves to `TAGGED_TRANSACTIONS` in `src/lib/transaction-tags.ts`. Only
classified tag today is `LP_SEED` (2 USDC, Trader Joe pair creation tx).
No silent absorbtion of spend was found; untagged residual continues to
surface via `splitSpend()` as the canonical "PENDING — awaiting
classification" pill.

## 5. Session & state review

- Wallet session: governed by `Web3Provider` (`wagmi`) — single mount in
  `__root.tsx`. No duplicate provider trees.
- Visitor memory: single module `src/lib/visitor-memory.ts`, only read
  by `SinceYourLastVisit` (via `IdentityZone`).
- React Query: single client created per request inside `getRouter()`
  per `tanstack-query-integration` rules. `defaultPreloadStaleTime: 0`
  is set correctly.

No hydration mismatch sources, double providers, or stale-cache patterns
were introduced.

## 6. Performance

Direct bundle impact of this pass: 30 component modules removed from
both the route-tree dependency graph and the type-check graph. No new
work is introduced.

No `<img>` was added or removed; no font, polling interval, or query key
was touched.

## 7. Security

No new external-link, RPC, or env-var surface was introduced. All
existing `target="_blank"` explorer links already carry
`rel="noopener noreferrer"`. No client-side admin gating exists (correct
per project memory).

## 8. Remaining risks / recommended future work

| Risk | Severity | Recommendation |
| ---- | -------- | -------------- |
| `TransparencyCenter`, `LiquidityTrustContext`, `HomeTransparencySnapshot` still re-derive truth from raw hooks | Medium | Migrate to `useProtocolTruth` (P4 backlog Tier-1) |
| `useUserQuestProgress` / `useMembersLeaderboard` exported but unused | Low | Delete in a typed-API cleanup wave; verify no external import path first |
| P6 implementation (Loop A/B/C wiring + 9 component demotions) still pending | High (UX) | Execute P6 as a focused wave |
| `Web3Provider`/`WalletDebugPanel` always mounted in `__root.tsx` | Low | Tree-shake `WalletDebugPanel` behind a `import.meta.env.DEV` gate |
| 38 documents under `docs/` — some superseded | Low | Quarterly doc-prune pass; keep VISION + truth + return-loop docs canonical |

## 9. Risk ranking summary

- **Critical:** none introduced by this pass.
- **High:** P6 implementation gap (pre-existing).
- **Medium:** truth-layer Tier-1 migration backlog (pre-existing).
- **Low:** dev-only panel always shipped; unused hooks; doc clutter.

---

_End of report. No constitutional document was altered. No new framework
or registry was created. Build stamp bumped to
`wave-P7.aaa-readiness-cleanup`._
