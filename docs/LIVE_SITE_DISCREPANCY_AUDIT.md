# Live Site vs Repo — Discrepancy Audit

**Date:** 2026-06-05
**Scope:** Compare the deployed public site (`https://thesyndicate.money`) with the
current repo source, route by route. Identify stale copy, contradictory
language, and "old vs new" component mismatches. Fix Critical and High
discrepancies in this pass.

---

## TL;DR — Deploy is current. Most "stale live site" perception is a publish/cache gap, not a repo bug.

Direct HTML inspection of `https://thesyndicate.money/` and
`https://thesyndicate.money/ranks` confirms the **production deployment IS
serving the post-Wave-3A code**:

| Surface | Live HTML contains | Verdict |
|---|---|---|
| Homepage hero | "Become a member for $5", "Verify everything", "Wallets have joined", LIVE/PENDING status rows | ✅ matches repo (`src/components/syndicate/Hero.tsx`) |
| Homepage hero — old copy | NO occurrence of "Transparent Onchain Compounding Society" anywhere in homepage HTML | ✅ stale copy is fully gone |
| Hero CTAs | "Join — become a member for $5" + "Verify everything"; Trade SYN / Add Liquidity intentionally absent from hero | ✅ matches repo |
| Live recency strip | Rendered above TrustBar | ✅ matches repo |
| Member counter | "Wallets have joined" line, animated dot | ✅ matches repo |
| /ranks hero | "Where do I fit?" page title, served by `RankHub` | ✅ matches repo (`src/routes/ranks.tsx` → `RankHub`) |
| /ranks — old framing | NO "Ranks, Quests & Leaderboard", NO "DEMO PREVIEW" on the page, NO "Ranked by Compounder Score" headline | ✅ stale Rank Hub is gone |

**The reported "old live site" is almost certainly one of:**
1. A previously-published build that has not been re-published. Frontend
   changes require clicking **Publish → Update** in the dialog. The preview
   sandbox always shows the latest code; the `.lovable.app` published URL
   serves the last published build.
2. Browser/CDN cache showing a stale HTML response (hard-refresh resolves).
3. The reporter is on `https://syndicate-archive.lovable.app` (the previous
   default `.lovable.app` URL) which may be on an older published build than
   the custom domain.

**Recommended remediation:** click **Publish → Update** in the editor to
re-publish the current build to all attached domains. If the
`.lovable.app` archive still shows stale content after re-publish, hard-refresh
and re-check.

---

## Per-route audit

Legend:
- ✅ Matches current direction.
- 🟧 Stale copy or component drift inside an otherwise-correct page (medium).
- 🟥 Contradicts current direction (high/critical).
- 🔵 Intentionally pending / scaffold (allowed, but should remain clearly labeled).

### `/`  (homepage)
- Component: `src/routes/index.tsx` → `Hero`, `LiveRecencyStrip`, `TrustBar`,
  `LivePulseStrip`, `SinceYourLastVisit`, `ProtocolEventsFeed`,
  `ProtocolTimeline`, then member-first layer (`WhyJoinSimple`,
  `HowToJoinSteps`, `WhyTheSyndicateExists`, …), then proof layer.
- Live state: matches repo (verified via HTML grep).
- **Open item — 🟧 LivePulseStrip vs LiveRecencyStrip**: both render
  back-to-back. They serve overlapping purposes (live momentum). Not
  contradictory but redundant; a future merge pass is warranted. **No fix
  this wave** per "no new modules".
- **Open item — 🟧 `WhatChangesAfterJoining` mentions "Compounder Score"**
  in two bullets. Now off-strategy after Rank Hub rebuild. Logged for the
  next copy pass; not user-blocking.

### `/join`
- Component: `src/routes/join.tsx`.
- ✅ Renders `LivePurchase` with the wallet-session-aware reset behavior.
- ✅ No stale demo content.

### `/members`
- ✅ Explicitly named-not-leaderboard ("The Wall is not a leaderboard").
- ✅ No top-spender sort.

### `/founders`
- ✅ "No perks. No promises. No 'VIP'. No leaderboard." stated up top.

### `/chapters`, `/chapters/$slug`
- ✅ Chronological, no wealth sort.

### `/ranks`
- ✅ Serves `RankHub` ("Where do I fit?"). No quests, no leaderboard, no
  reward language, no NFT promise.
- 🟧 The legacy `MembersLeaderboard` component still exists in the repo
  (`src/components/syndicate/MembersLeaderboard.tsx`) but **is not imported
  by any route** (verified). Safe to delete in a future cleanup pass.
- 🟧 The legacy `QuestProgress` component still exists but **is not mounted
  on any route**. Safe to delete later.

### `/activity`
- ✅ Unified protocol events feed. No stale "Compounder Score" framing.

### `/transparency`
- ✅ Live wallet balances + routing visibility.

### `/token`
- 🟧 `TokenIntro.tsx` mentions Compounder Score in the utility list. Logged
  for next copy pass.

### `/tokenomics`
- **🟥 → ✅ FIXED THIS PASS:** the "Initial Holders" section's description
  said "A member leaderboard will activate after the Membership Sale
  contract deploys." This contradicted the current no-wealth-leaderboard
  policy. Rewritten to: *"The Syndicate does not publish a wealth
  leaderboard of members — see Ranks for the recognition model."*
  (`src/components/syndicate/Sections.tsx:556`)
- 🔵 The `<Leaderboard />` component on this page is a misnomer — it
  actually shows the seven public initial-allocation wallets, which IS
  on-policy (genesis distribution disclosure). The section id and
  function name are legacy; renaming is cosmetic only and skipped.

### `/liquidity`
- 🟧 `LpStatus.tsx` mentions "future LP leaderboard / governance boost /
  Genesis NFT eligibility" as PLANNED recognition. Clearly labelled
  PLANNED, not promised. Acceptable per current "labels-not-promises"
  rule. No fix needed.

### `/vault`
- 🔵 Intentionally labels itself "DEMO PREVIEW — Vault contract is not
  deployed yet." Allowed and on-policy (PENDING module clearly labeled).

### `/registry`
- ✅ Shows NFT contract as `pending` with no address. On-policy.

### `/docs`
- **🟥 → ✅ FIXED THIS PASS:** docs index linked to `/ranks#compounder`,
  which no longer exists in the rebuilt Rank Hub. Replaced with a card
  pointing to `/ranks#distribution` ("Rank distribution — aggregate
  counts across every rank, never a leaderboard").
  (`src/routes/docs.tsx:65`)

### `/faq`
- 🟧 `FaqRebuilt.tsx` still has Q&A entries about "Compounder Score" and
  "DEMO PREVIEW". The DEMO PREVIEW Q is still accurate (Vault page uses
  it). The Compounder Score Q is now off-strategy. Logged for next copy
  pass; not user-blocking.

### `/whitepaper`
- 🔵 Mentions Compounder Score / Genesis NFT in *future* tense. Whitepaper
  is allowed to describe planned modules — this matches the
  "labels-not-promises" rule. No fix.

### `/roadmap`
- 🔵 Lists Compounder Score / Genesis NFT as future deliverables, which
  is the roadmap's job. On-policy.

### `/wallet/$address`
- ✅ Wallet context notice + persistent header chip after the Wallet
  Session UX wave.
- 🟧 One stale phrase: *"...or the Ranks leaderboard"* in the
  invalid-address help text. Logged for next copy pass.

### `/milestone/$id`
- ✅ OG-shareable, no stale framing.

### `/nfts`
- 🔵 Entire page is a scaffold ("eligibility scaffold — when the Genesis
  NFT contract deploys…"). Clearly labelled as pending. On-policy.

---

## Live-data PENDING audit (high signal)

For each prominent metric, verified that PENDING is only shown where it
is truly underivable:

| Metric | Source | Status shown | Verdict |
|---|---|---|---|
| Members count | `useProtocolPulse` → on-chain `purchaseCount` | LIVE | ✅ |
| Total USDC raised | `totalUsdcRaised` from sale contract | LIVE | ✅ |
| SYN sold | derived from USDC × rate | LIVE | ✅ |
| Next member # | `purchaseCount + 1` | LIVE | ✅ |
| Last buy | most recent `TokensPurchased` event | LIVE / "—" when zero | ✅ |
| Vault routed | 70% of USDC raised, wallet balance | LIVE (wallet balance read) | ✅ |
| Liquidity routed | 20% of raised | LIVE / DERIVED | ✅ |
| Ops routed | 10% of raised | LIVE / DERIVED | ✅ |
| LP TVL | Trader Joe pair reserves | LIVE | ✅ |
| SYN price | implied from pair reserves | LIVE (low-conf when reserves thin) | ✅ |
| Market cap / FDV | price × supply | DERIVED | ✅ |
| Holders count | on-chain Transfer scan via holder index | LIVE | ✅ |
| Protocol revenue (paid streams) | none yet | INTENTIONALLY PENDING / 0 | ✅ |

No fake PENDING was found on derivable metrics.

---

## Cross-doc consistency check

Spot-checked `docs/VISION.md`, `docs/PRODUCT_DECISION_FRAMEWORK.md`,
`docs/TERMINOLOGY_GLOSSARY.md`, `/faq`, `/whitepaper`, `/docs`,
`/tokenomics` for contradictions on:

- **SYN utility**: consistent (membership + identity + future governance
  weight, never yield).
- **70/20/10 routing**: consistent everywhere.
- **Vault wallet vs Vault contract**: consistently distinguished
  (wallet = LIVE balance, contract = PENDING).
- **LP status**: small, seeded, public — consistent.
- **NFT / Governance / AI / Referral / Vault automation**: all labelled
  PENDING or future across pages. No accidental promise.
- **Rank meaning**: recognition, not entitlement — consistent.

No cross-doc contradictions surfaced.

---

## Fixes applied this pass

1. `src/components/syndicate/Sections.tsx` — Initial Holders description
   no longer promises a future member leaderboard. (🟥 → ✅)
2. `src/routes/docs.tsx` — replaced dead `/ranks#compounder` link with a
   live `/ranks#distribution` card. (🟥 → ✅)

## Remaining (deferred, all 🟧 medium — copy-only)

These do not user-block. Bundle into the next copy/cleanup pass:

1. `WhatChangesAfterJoining.tsx`, `TokenIntro.tsx`, `WhyJoinNow.tsx`,
   `CanonicalSpec.tsx`, `RankSimulator.tsx`, `ShareableCards.tsx`,
   `FaqRebuilt.tsx` — strip remaining "Compounder Score" references or
   rephrase to "rank + holding history".
2. Delete unused legacy components: `MembersLeaderboard.tsx`,
   `QuestProgress.tsx` (verify zero imports first).
3. `wallet.$address.tsx` — replace "...or the Ranks leaderboard" with
   "...or the Members page".
4. Decide whether `LivePulseStrip` and `LiveRecencyStrip` should merge.

## Deployment / cache action required

The repo and the custom-domain HTML already match. If
`syndicate-archive.lovable.app` or any other published surface still
shows old hero / old Rank Hub copy:

1. Open the editor, click **Publish → Update** to re-push the current
   build to all attached domains.
2. Hard-refresh the surface in question.
3. Re-check using `curl -s <url> | grep -i "become a member for"`.

No code change can move stale HTML off a previously-published deployment
without a re-publish.

---

## Deployment QA — `npm run check-live`

Use this workflow after any AI build pass before declaring a release "live".

### Quick start

```bash
# Verify the production site
npm run check-live

# Verify a preview or other domain
node scripts/check-live-content.mjs https://your-preview-url.lovable.app

# Verbose output (shows rule notes even on PASS)
VERBOSE=1 npm run check-live
```

### What it does

`check-live` fetches a fixed set of public routes and asserts:
- **Required strings** are present (current copy / branding)
- **Forbidden strings** are absent (stale copy / old components)

It prints `PASS`/`FAIL` per route and exits with code `1` on any failure.

### Where the rules live

Rules are in **`scripts/live-content-rules.json`** — a plain JSON array:

```json
{
  "path": "/ranks",
  "must": ["Where do I fit", "distribution"],
  "mustNot": ["DEMO PREVIEW", "Ranked by Compounder Score"],
  "notes": "Rank Hub must show new framing."
}
```

| Field | Purpose |
|---|---|
| `path` | Route to fetch (appended to base URL) |
| `must` | Strings that **must** appear in the HTML |
| `mustNot` | Strings that **must not** appear (case-insensitive) |
| `notes` | Optional context shown when `VERBOSE=1` or on failure |

**Update this file when copy changes** (e.g. a new hero headline or a stale phrase is removed). Do not edit the script logic.

### When to bump `src/lib/build-stamp.ts`

Bump the stamp **only** on meaningful build passes that change user-facing copy, components, or data logic:

1. Update `src/lib/build-stamp.ts`:
   - `iso` → current UTC timestamp
   - `human` → human-readable date
   - `tag` → short wave label (e.g. `wave-3B.qa-stamp`)
2. Build / publish as normal.
3. Run `npm run check-live`.
4. Confirm the footer stamp and the script output match.

Skip bumping for pure documentation, internal-only, or script-only changes.

### Full workflow checklist

#### 1. Re-publish
- [ ] In the editor, click **Publish → Update**.
  Frontend changes only appear on the published domain after this step —
  the preview URL always shows the latest code; the published URL serves
  the last published build.

#### 2. Clear local cache on the surface you are checking
- [ ] Hard refresh (`Ctrl/Cmd + Shift + R`) on the page.
- [ ] If still stale, open the same URL in a fresh **incognito** window.
- [ ] On mobile, close every tab of the site, then re-open in a fresh
      browser session (or use a different browser).

#### 3. Confirm the build stamp
- [ ] Scroll to the footer. The build stamp reads
      `Build YYYY-MM-DD · <tag> · production` on the apex domain and
      `… · preview` on `*.lovable.app`.
- [ ] The `<tag>` value should match what the most recent AI pass
      shipped (see `src/lib/build-stamp.ts`). If it does not match,
      the surface is on an older build — repeat step 1.

#### 4. Run the content check script
- [ ] `npm run check-live`
- [ ] All routes must report `PASS`. Failures print the missing /
      stale strings inline.
- [ ] Re-run against the preview origin too if it diverges:
      `node scripts/check-live-content.mjs <preview-url>`.

#### 5. Manual spot check (60 seconds)
- [ ] `/` — hero says "Become a member for $5", no "Compounding Society".
- [ ] `/ranks` — page reads "Where do I fit?", no "Quests", no
      "DEMO PREVIEW", no "Ranked by Compounder Score".
- [ ] `/members`, `/founders`, `/chapters` — no wealth-ranking framing.
- [ ] `/join` — Membership Sale renders, wallet chip behaves on connect.

#### 6. If a surface stays stale after re-publish
- [ ] Wait 60–120 seconds and refresh; CDNs occasionally lag a published
      build.
- [ ] Open the published URL from a different network (mobile data) to
      rule out an ISP cache.
- [ ] If still stale after both, re-publish a second time. The platform
      treats a second publish as a fresh deploy and will overwrite any
      lingering edge cache.
- [ ] Do **not** introduce custom cache-busting query strings, service
      workers, or CDN-invalidation code unless this issue repeats across
      multiple unrelated publishes.

### What this pass intentionally does NOT do
- No automated preview-vs-live screenshot diff.
- No Playwright / Cypress e2e suite.
- No CDN-invalidation framework.
- No deployment pipeline rewrite.

Those are only justified if the lightweight script + checklist fail to
catch a real regression in production.
