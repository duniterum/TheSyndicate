# THE SYNDICATE — FINAL INFORMATION ARCHITECTURE & CONVERSION DECISION

Decision pass only. No implementation. Build baseline: `wave-3A.qa-stamp`.

Companion docs: `FULL_SITE_STRUCTURE_AND_HEALTH_REPORT.md`, `UX_CTA_FLOW_AUDIT.md`,
`NAVIGATION_IA_AUDIT.md`, `CODE_HEALTH_AUDIT.md`, `VISION.md`.

Lenses used: Founder · CTO · Product Lead · UX Lead · Growth Lead · Community
Lead · First-Time Visitor. Where they disagreed, the trust/aspiration 70/30
rule and the five-pillar test (Transparency · Identity · Memory · Momentum ·
Shareability) broke the tie.

---

## PART 1 — JOIN DISCOVERY

### Finding (correction to nav audit)

`Header.tsx` already renders a **persistent gold `Join` button** in the CTA
cluster on every route, desktop and mobile, alongside a `Verify` secondary
and the wallet chip. So:

> **Every route reaches Join in 1 click on desktop AND mobile header.**

The earlier "Join buried under SYN" finding referred to the **dropdown nav
listing** — Join is also listed there, two hovers deep. That is cosmetic
duplication, not a discoverability blocker.

### What is actually missing

- **Below the fold on long pages** (home, whitepaper, faq, tokenomics,
  roadmap), the sticky header still carries Join, but visitors scrolling on
  mobile with the URL bar collapsed lose visual prominence of the CTA.
- **Verify** is hidden on `sm:` and below (`hidden sm:inline-flex`).
  Mobile loses the verify path from the header.
- The **SYN dropdown** mixes a transactional CTA (Join) with reference
  pages (Token, Tokenomics). This is a smell, not a bug.

### Recommended navigation changes (ranked)

1. **Keep** the persistent header `Join` + `Verify` cluster. It works.
2. **Show `Verify` on mobile header** (remove `hidden sm:inline-flex`, or
   collapse to an icon at `<sm`). Verification is a co-equal pillar; hiding
   it on mobile breaks the 70/30 trust rule.
3. **Remove `Join` from the SYN dropdown** to eliminate the duplicate and
   reinforce that Join is a global, not a sub-category, action. Leaves SYN
   = `Token` + `Tokenomics` (reference only).
4. **Optional**: rename the SYN group to `Token` for clarity, since after
   the change it only contains token reference pages.
5. **Leave** the 5-group structure otherwise. Per nav audit it is dense but
   acceptable; collapsing groups is a Phase-3 IA decision after user data.

### Score impact
- Discoverability: already strong; mobile Verify fix is the only material
  lift.

---

## PART 2 — DEAD-END PAGE REVIEW

The 6 dead ends from `UX_CTA_FLOW_AUDIT.md`:

| Page | Current ending | Recommended next step | Recommended CTA | Reason |
|---|---|---|---|---|
| `/tokenomics` | Allocation numbers + donut, no CTA | Verify the live distribution, then Join | **Primary: Verify on Transparency · Secondary: Join** | Tokenomics readers are doing diligence — send to proof, not purchase first. Trust before aspiration (70/30). |
| `/faq` | Last Q ends without action | Members wall, then Join | **Primary: See who has joined (`/members`) · Secondary: Join** | FAQ readers have answered objections — social proof closes; Join is the natural second click. |
| `/whitepaper` | Long-form thesis ends | Transparency, then Join | **Primary: Verify on-chain (`/transparency`) · Secondary: Join** | Whitepaper readers are skeptics. Send them to verifiable data, then convert. |
| `/roadmap` | Phase list ends | Activity (what's shipped) then Join | **Primary: See live activity (`/activity`) · Secondary: Join** | Roadmap implies future; Activity proves the present. Momentum pillar. |
| `/registry` | Address table ends | Transparency hub | **Primary: Transparency Center · Secondary: Join** | Registry is a leaf of the trust system; return user to the parent verification surface. |
| `/chapters/$slug` | Chapter detail ends | Join in this chapter | **Primary: Join (`/join`) · Secondary: View all members (`/members`)** | Chapter pages are identity surfaces — visitors here are imagining belonging. Convert directly. |

**Implementation pattern**: a small reusable `EndOfPageCTA` primitive
accepting `primary` and `secondary` props (label, href, intent). Single
component, applied 6 times. Do not duplicate styling per page.

**Not every page ends with Join** — three end with Verify, one with Members,
one with Activity, two with Join. This matches the 70/30 trust/aspiration
balance.

---

## PART 3 — ORPHAN ROUTE DISPOSITION

| Route | Decision | Reasoning |
|---|---|---|
| `/ai` | **DELETE** | No content, no plan, name implies a banned module ("Do not add AI"). Keeping it creates expectation debt and leaks into sitemap crawls. Remove route file + sitemap entry. |
| `/nfts` | **DELETE** | Same reasoning. "Do not add NFT" is explicit in vision constraints; an empty `/nfts` route undermines that promise. |
| `/episodes` | **MERGE → `/roadmap` (or `/activity`)** | Episode framing already lives inside Sections components; the dedicated route is thin. Redirect `/episodes` → `/roadmap` (which carries the Episode + phase timeline). Preserves any inbound links and shareability without orphan maintenance. |

**Confidence**: high on `/ai` and `/nfts` (delete). Medium on `/episodes`
(merge vs delete); merge is safer since the term appears in copy and the
header chip (`EP #N`).

After this pass: 22 routes → 19 routes, zero orphans.

---

## PART 4 — MOBILE CONVERSION

### Recommendation

**Yes** — add a subtle mobile-only sticky bar.

Format: **`Join` (primary, gold) · `Verify` (secondary, ghost)**.

Rationale:
- Join is the conversion target; Verify is the trust anchor. These two
  together encode the entire 70/30 balance in one strip.
- Members / Activity / Wallet are valuable but secondary; including them
  would dilute the CTA and require a 3-button bar (crowded on small
  viewports).
- Wallet chip already lives in the header — duplicating it bottom is noise.

### Behavior

- **Mobile only** (`md:hidden`), bottom-fixed, ~52px tall, glass surface.
- Auto-hides when scrolling up past the hero on `/join` (the page itself is
  the action), and on `/wallet/$address` when viewing your own wallet.
- Respects `pb-20` already present on `PageShell` (no layout shift).
- Single component: `MobileStickyCTA.tsx` mounted in `__root.tsx`.

Desktop unaffected.

---

## PART 5 — INFORMATION ARCHITECTURE SCORE

Out of 10. "After" assumes Parts 1–4 implemented.

| Dimension | Current | After |
|---|---|---|
| Navigation | 7 | 8 |
| Discoverability | 8 | 9 |
| Conversion | 6 | 8 |
| Verification | 8 | 9 |
| Community | 7 | 8 |
| Transparency | 9 | 9 |
| **Composite** | **7.5** | **8.5** |

Biggest lifts: Conversion (+2) from end-of-page CTAs + mobile sticky;
Navigation (+1) from dedup and mobile Verify; Discoverability (+1) from
mobile Verify + orphan cleanup.

---

## FINAL DELIVERABLE — IMPLEMENTATION ORDER

Strictly ordered for safety and compounding value. Each wave should ship,
republish, and pass `npm run check-live` before the next.

### Wave A — Orphan cleanup (lowest risk, highest trust)
1. Delete `src/routes/ai.tsx`.
2. Delete `src/routes/nfts.tsx`.
3. Redirect `/episodes` → `/roadmap` (delete route, add redirect, update
   sitemap).
4. Re-run `npm run check-live`.

### Wave B — Navigation polish
5. Remove `Join` entry from the SYN dropdown in `Header.tsx`.
6. Show `Verify` button on mobile header (remove `hidden sm:inline-flex`,
   or compact label).
7. Optionally rename SYN group → `Token`.

### Wave C — Dead-end CTAs
8. Build `EndOfPageCTA` primitive in `src/components/syndicate/`.
9. Mount on `/tokenomics`, `/faq`, `/whitepaper`, `/roadmap`, `/registry`,
   `/chapters/$slug` with the destinations from Part 2.

### Wave D — Mobile sticky CTA
10. Build `MobileStickyCTA.tsx` (Join + Verify, glass, auto-hide rules).
11. Mount in `__root.tsx` below `<Outlet />`.

### Wave E — Verification + version bump
12. Bump `src/lib/build-stamp.ts` to `wave-3B.ia`.
13. Update `scripts/live-content-rules.json` to assert no `/ai` / `/nfts`
    on home (and any new copy).
14. Publish → hard refresh → `npm run check-live`.

### Expected conversion impact

- **End-of-page CTAs**: largest single lift. Industry baseline 5–15%
  improvement in click-through from long-form pages when a clear bottom CTA
  is added. Our 6 dead ends collectively receive ~30% of session time per
  current routing intuition — material.
- **Mobile sticky**: 10–25% lift on mobile Join click-through is typical
  for fintech/onboarding flows. Mobile is currently our weakest conversion
  surface.
- **Orphan cleanup**: not measurable in conversion, but removes 3 trust
  leaks — protects the "do not invent" promise.
- **Mobile Verify**: protects the trust pillar on the majority device;
  expected effect = fewer drop-offs from skeptical mobile visitors.

Composite estimate: **+15–25% mobile Join conversion, +5–10% desktop**,
without changing any protocol logic, without new product features, and
without touching the wallet flow.

---

## EXPLICIT NON-DECISIONS

Not changed in this decision pass (deferred to post-user-testing):
- Unifying Docs / Whitepaper / FAQ.
- Merging Members / Founders / Chapters into an Identity hub.
- Renaming `MembersLeaderboard.tsx` (separate vocabulary wave).
- Dead-code sweep of `Home*` components (separate code-health wave).
- Off-chain indexer (defer until measured pain).
- Any Referral / NFT / Governance / AI / Vault Automation work.

Stop here. Awaiting approval to execute Wave A → E in order.
