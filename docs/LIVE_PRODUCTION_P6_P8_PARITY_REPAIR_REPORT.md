# Live Production P6 / P8 Parity Repair Report

Date: 2026-06-05  
Repair tag: `wave-P8.production-parity-repair`

## Root cause

The production custom domain was serving the P8 bundle, but P8 still contained several stale rendered strings and one hydration-sensitive live-data surface:

1. **Homepage copy mismatch:** `Hero.tsx` still said `70% to liquidity, 20% to the treasury, 10% to operations` even though the canonical routing is `70% Vault · 20% Liquidity · 10% Operations`.
2. **Stale report/content terminology:** several rendered pages still included old wording such as `Verify Everything` and the roadmap still rendered `AI analyst` language.
3. **Homepage ownership drift:** `StorySoFar` embedded `ProtocolEventsFeed` and `EarlyChapters`, causing homepage content to violate the P6/P8 intended composition even though `index.tsx` itself did not import those old surfaces directly.
4. **Hydration mismatch risk:** `NextMemberHero` rendered `Reading the chain…` on SSR and live member counts on the client, producing a React hydration mismatch. This could appear as runtime instability even when HTTP fetches returned 200.

No evidence of route-tree mismatch, cached bundle corruption, or wrong build target was found in the fetch scan. The custom domain returned build tag `wave-P8.first-visitor-action` on all checked routes before this repair.

## Stale components/content found

Found in rendered production before repair:

- `/` contained `70% to liquidity`
- `/` contained `20% to the treasury`
- `/`, `/transparency`, `/tokenomics`, `/ranks`, `/docs` contained `Verify Everything`
- `/roadmap` contained `AI analyst`

Source-level root causes repaired:

- `src/components/syndicate/Hero.tsx`
- `src/components/syndicate/StorySoFar.tsx`
- `src/components/syndicate/NextMemberHero.tsx`
- `src/components/syndicate/HomeNextMilestone.tsx`
- `src/components/syndicate/ProtocolEventsFeed.tsx`
- `src/components/syndicate/WhatChangesAfterJoining.tsx`
- `src/components/syndicate/WhyJoinSimple.tsx`
- `src/components/syndicate/HowToJoinSteps.tsx`
- `src/components/syndicate/RiskDisclaimer.tsx`
- `src/components/syndicate/RankHub.tsx`
- `src/routes/index.tsx`
- `src/routes/docs.tsx`
- `src/routes/transparency.tsx`
- `src/routes/roadmap.tsx`
- `src/lib/build-stamp.ts`

## Routes that failed

The user reported Internal Error on:

- `/activity`
- `/chapters`
- `/join`
- `/liquidity`

Fetch-level production scan during this pass returned HTTP 200 for all four. The visible runtime signal in the session was a React hydration mismatch in `NextMemberHero`, so the repair targeted the unstable live-data render path rather than route-tree changes.

## Exact fixes

1. **Canonical routing copy fixed**
   - Homepage hero now says: `70% to the Vault, 20% to Liquidity, 10% to Operations`.
   - Final CTA now says: `70% Vault, 20% Liquidity, 10% Operations`.

2. **Hero action rail completed without CTA spam**
   - Primary remains dominant: `Join`.
   - Utility rail now contains: `Verify`, `Registry`, `Token`, `Liquidity`, `Trade on DEX`, `Add Liquidity`.
   - DEX / liquidity actions are compact external utility links, not primary buttons.

3. **Homepage P6/P8 composition repaired**
   - `StorySoFar` no longer embeds homepage `ProtocolEventsFeed` or `EarlyChapters`.
   - It now renders three compact story cards: live now, archive, coming next, with links to `/activity` and `/chapters` for deep views.

4. **Hydration mismatch reduced**
   - `NextMemberHero` now keeps a stable row shape and marks live count text with `suppressHydrationWarning`.

5. **Activity feed UX improved without new modules**
   - `ProtocolEventsFeed` now uses visible-count pagination / load-more on long non-compact feeds.

6. **Progress bar professionalized**
   - `HomeNextMilestone` progress bar now has stronger visual weight, ring, gradient fill, and separated count / percent labels.

7. **Forbidden stale phrases removed from rendered source paths**
   - Removed `AI analyst` from roadmap rendered copy.
   - Replaced user-facing `Verify Everything` labels with `Verification` / `Verify on-chain` where needed.
   - Removed governance-contract language from the homepage `WhatChangesAfterJoining` pending column.

8. **Build stamp bumped**
   - Source build stamp now: `wave-P8.production-parity-repair`.

## Proof homepage matches P6/P8 source composition

Current homepage source order is:

1. `Hero`
2. `HomeNextMilestone`
3. `SinceYourLastVisit`
4. `StorySoFar`
5. `ProtocolMoments`
6. `IdentityZone`
7. `WhyJoinSimple`
8. `HowToJoinSteps`
9. `WhatChangesAfterJoining`
10. `HomeTransparencySnapshot`
11. `LpStatusCard`
12. Final CTA
13. `RiskDisclaimer`
14. `Footer`

Guard result after repair:

```text
✓ Loop ownership intact (Loops A/B/C/D · no labs leakage · no duplicate homepage counters).
```

## Proof routing is canonical everywhere checked in source

Source scan after repair:

```text
rg -n -i "70% to liquidity|20% to the treasury|compounder score|AI analyst|governance weight|DEMO PREVIEW|private strategy room|Genesis NFT eligibility|proposal priority|score multiplier|community rewards" src/routes src/components/syndicate/Hero.tsx src/components/syndicate/WhyJoinSimple.tsx src/components/syndicate/WhatChangesAfterJoining.tsx src/components/syndicate/StorySoFar.tsx src/components/syndicate/RankHub.tsx src/components/syndicate/RiskDisclaimer.tsx src/components/syndicate/HowToJoinSteps.tsx

No matches.
```

Note: archived/labs files and old unmounted components may still contain historic phrases by design under the Archive Safety Net. They are not production homepage owners.

## Production scan output before publish/update

The live custom domain scan at the start of this repair returned:

```json
[
  { "route": "/", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": ["70% to liquidity", "20% to the treasury", "Verify Everything"] },
  { "route": "/join", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": [] },
  { "route": "/activity", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": [] },
  { "route": "/chapters", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": [] },
  { "route": "/liquidity", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": [] },
  { "route": "/transparency", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": ["Verify Everything"] },
  { "route": "/tokenomics", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": ["Verify Everything"] },
  { "route": "/token", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": [] },
  { "route": "/vault", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": [] },
  { "route": "/ranks", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": ["Verify Everything"] },
  { "route": "/members", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": [] },
  { "route": "/founders", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": [] },
  { "route": "/roadmap", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": ["AI analyst"] },
  { "route": "/docs", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": ["Verify Everything"] },
  { "route": "/faq", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": [] },
  { "route": "/whitepaper", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": [] },
  { "route": "/registry", "status": 200, "ok": true, "internalError": false, "buildStamp": "wave-P8.first-visitor-action", "hits": [] }
]
```

## Proof all required routes returned HTTP 200 in the production fetch scan

All required routes returned HTTP 200 during the scan:

- `/`
- `/join`
- `/activity`
- `/chapters`
- `/liquidity`
- `/transparency`
- `/tokenomics`
- `/token`
- `/vault`
- `/ranks`
- `/members`
- `/founders`
- `/roadmap`
- `/docs`
- `/faq`
- `/whitepaper`
- `/registry`

## Publish/update status

Source is repaired and stamped as `wave-P8.production-parity-repair`.

The custom domain scan shown above was taken **before** this frontend repair was published. Because these are frontend/rendered changes, the production custom domain must be updated through legacy deployment platform Publish → Update. After publish, rerun the same production scan and require:

- build stamp: `wave-P8.production-parity-repair`
- all listed routes HTTP 200
- no `Internal Error`
- no hits for the requested forbidden terms

Final production-clean claim is intentionally withheld until the published custom domain returns the new build stamp and clean scan.