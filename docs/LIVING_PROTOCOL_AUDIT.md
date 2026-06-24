> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# The Syndicate — Living Protocol & Momentum Audit

Status: post-Wave-2. Wave 1 (`useHolderIndex`) and Wave 2 (connective tissue +
`/wallet/$address` + derived events) are live. Architecture is no longer the
bottleneck — *felt momentum* is.

This audit is intentionally critical. It does not propose new tokenomics,
new contracts, or new revenue. It only proposes ways to make the existing
protocol feel alive, visible, and worth following.

---

## Scoreboard

| Dimension       | Score | One-line verdict |
|-----------------|-------|------------------|
| Momentum        | 58 / 100 | Data exists; *change* is mostly invisible. No deltas, no "X new since…", no since-you-last-visited.
| Social proof    | 62 / 100 | Counts and ranks are there; *trajectory*, recency emphasis, and named-member moments are weak.
| Community       | 48 / 100 | Identity primitives exist (founder #, chapter, rank); belonging rituals, recognition surfaces, and shared history are thin.
| Growth loops    | 45 / 100 | The loop exists end-to-end (buy → number → wallet page → share) but the share step is unfinished — no OG, no per-event card, no copy hook.
| Shareability    | 40 / 100 | Member card and wallet page are pretty in-app, but they are not designed *to leave the site*. No OG images. No share-intent buttons on wallet/milestone routes.

**Composite "Living Protocol Index" ≈ 51 / 100.** The protocol is alive; the
*feeling* of life is half-built.

---

## PART 1 — Momentum Audit

### Ripple test, by scenario

#### "5 purchases happened today"

Currently visible:
- Activity feed: yes, top 5 rows update.
- Pulse strip on home: members count ticks up; "last buy" timestamp resets.
- Members leaderboard / Rank ladder: new rows appear.
- Milestones: progress bar nudges.

Currently invisible:
- No "+5 today" badge anywhere.
- No "Today" / "This week" tab on the activity feed.
- No "Members this week" tile.
- No streak indicator ("X days in a row with a new member").
- No silhouette/grid that shows *just* the new joiners since yesterday.

#### "50 purchases this week"

Currently visible:
- Cumulative members number jumps.
- Leaderboard shifts.

Currently invisible:
- No weekly digest tile.
- No sparkline anywhere.
- No "fastest week so far" highlight.
- No chapter progress callout ("First 100 was 40% full Monday, 90% full today").
- Returning visitor has no "X new since you last visited" line.

#### "Vault doubled"

Currently visible:
- Vault USDC cell in pulse strip changes.
- Treasury composition reflects new balance.

Currently invisible:
- No delta shown next to the cell.
- No "Vault USDC: $X → $Y (+100%)" event in the protocol feed.
- No milestone auto-celebration when a round Vault threshold is crossed.
- No screenshot-ready "Vault doubled this week" card.

#### "Milestone crossed"

Currently visible:
- The milestone tile flips from PARTIAL → LIVE.

Currently invisible:
- No moment-in-the-feed entry ("Milestone *100 members* reached at block N").
- No standalone celebration card.
- No timeline of *when* each milestone was reached.
- No share button on a freshly-crossed milestone.
- No "you were here for this milestone" badge on member wallets.

### Places where progress is currently invisible (complete list)

1. Home pulse strip — no 24h / 7d delta on any cell.
2. Home metrics — no week-over-week trend.
3. Activity feed — no time-window filter, no "today" header.
4. Milestone tracker — no `reachedAt` timestamp, no celebration event.
5. Ranks page — no "promotions this week" section.
6. Rank ladder — no count of *new entrants* per tier.
7. Early chapters — no fill-rate sparkline.
8. Members leaderboard — no "rising this week" arrow.
9. Tokenomics — sale inventory drain isn't graphed over time.
10. Vault page — no balance history, no "last inflow" badge.
11. Liquidity page — no LP TVL trend.
12. Transparency — no period selector.
13. Wallet page — no "joined N days ago" relative line.
14. Wallet page — no rank-promotion timeline.
15. Wallet page — no neighbours ("Members #436 and #438").
16. Protocol events feed — no daily/weekly grouping headers.
17. Roadmap — phases aren't tied to live progress.
18. FAQ — answers don't refresh with live numbers ("How many members? X").
19. Footer — no "last block scanned" / "last buy" stamp.
20. Returning-visitor surface — none. No "Welcome back, 7 things happened."
21. Tab title — doesn't show member count or last activity.
22. Favicon / OG — static; no "live" pulse anywhere off-page.
23. Empty states — frame absence as PENDING, never as "0 today, last buy was N days ago."
24. Demo banner — doesn't mention recency.
25. No global ticker. No second-by-second "alive" cue.

---

## PART 2 — Social Proof Audit

### What exists
- Total members (live).
- Total USDC raised (live).
- Founder numbers (immutable, derived from event order).
- Chapter labels (Genesis / First 100 / First 500 / First 1,000 / Open).
- Rank tiers (Citizen → Genesis Circle, derived from cumulative USDC).
- Compounder Score leaderboard.
- Per-wallet identity at `/wallet/$address`.
- Latest protocol events (purchases, swaps, LP, vault flows, new-member, rank-reached).
- Milestone status (LIVE / PARTIAL / PENDING) with verification links.

### What is missing or weak

Top 20 opportunities, ranked by impact / effort:

| #  | Opportunity | Why it matters | Effort |
|----|-------------|----------------|--------|
| 1  | "Latest member" hero strip with avatar/identicon + founder # + time-ago | The single most-shareable social proof; near zero work | S |
| 2  | "Members this week" tile on home | Trajectory > totals | S |
| 3  | Rank-promotion ribbon ("3 members promoted in last 24h") | Movement as proof of activity | S |
| 4  | Chapter fill bar ("First 100: 47 / 100 filled") | Scarcity + progress in one glyph | S |
| 5  | "You'd be #N" preview chip, even when not connected | Personalizes the count for every visitor | S |
| 6  | Public member wall (grid of last N members → wallet pages) | Faces of the protocol; clickable | M |
| 7  | Milestone timestamps + "reached at block N" line | Turns milestones from goals into history | S |
| 8  | Rank distribution donut on Ranks page | Token-Terminal-style proof of breadth | M |
| 9  | "Median ticket size" + "Largest ticket so far" | Honest dimensionality without ROI talk | S |
| 10 | Wallet-page "neighbours" (#N-1, #N+1 links) | Browseability of the archive | S |
| 11 | "Streak" indicator (days with ≥1 new member) | Soft proof of liveness | M |
| 12 | Per-event share intents on activity rows | Each event becomes a tweet | M |
| 13 | "Joined since you last visited" banner (localStorage) | Returning-visitor recency | M |
| 14 | OG image per wallet page | Off-site social proof | M |
| 15 | OG image per milestone | Off-site celebration | M |
| 16 | OG image per protocol snapshot (daily) | Off-site recency proof | L |
| 17 | "Top contributor this week" (no ROI framing) | Recognition without leaderboards-by-money | M |
| 18 | "Members per chapter sealed" subtotal | Makes chapters feel finite and meaningful | S |
| 19 | Anonymized first-time-visitor tile ("Most recent join was N minutes ago from a new wallet") | Concrete liveness | S |
| 20 | Tab title rotation: `The Syndicate · 47 members · last buy 12m ago` | Free attention real estate | S |

---

## PART 3 — Wallet Page Audit

What feels valuable:
- Founder number front-and-centre.
- Chapter label gives the wallet a place in history.
- Rank + next-rank gap = motivation without ROI framing.
- Routed-on-chain breakdown (70/20/10) is unique social proof: *your money split publicly*.
- Tx history with explorer links satisfies the DeFi-user trust check.

What feels empty:
- No avatar / identicon / ENS / chip art.
- No "joined N days ago".
- No timeline (first purchase → promotions → milestones the wallet participated in).
- No relation to neighbours (#N-1, #N+1).
- No share button.
- No OG image when the URL is pasted into X/Telegram.

What feels repetitive:
- Three stat cards repeat the same cumulative USDC story (Stat tile, routing tile, eligibility flag).
- Eligibility flags read like a checklist of *future* things, not *current* things.

What should become shareable:
- The header (Member #N · Chapter · Rank · Founder badge if applicable).
- The routed-on-chain card (uniquely proof-of-skin-in-the-game).
- The "neighbours" strip once it exists.

What should remain private:
- Live SYN balance is fine to keep visible (it's on-chain anyway), but it should never become a *ranking* signal — that would re-introduce wealth-based status, which Core rules forbid.
- No notional valuations. No P&L. Ever.

What should be highlighted first:
- One-line identity sentence: "Member #47 · Genesis chapter · Builder · joined 12 days ago".

If a member shares a wallet page today, would another visitor understand why it matters?
- Partially. They'd see numbers. They wouldn't see *story* ("this was the 47th wallet to ever join this protocol"). The OG image + the identity sentence are what convert curiosity into a click.

---

## PART 4 — Protocol Pulse Audit

For each pulse strip cell:

| Cell           | Understanding | Trust | Curiosity | Action | Verdict |
|----------------|:-:|:-:|:-:|:-:|---|
| Members        | ✓ | ✓ | ✓ | ✓ | Keep. Add 24h delta. |
| USDC Raised    | ✓ | ✓ | ✓ | ✓ | Keep. Add 7d delta. |
| Vault          | ✓ | ✓ | ✓ | ✓ | Keep. Add inflow-of-last-7d. |
| Liquidity TVL  | ✓ | ✓ | ◐ | ✓ | Keep. Add price-impact hint. |
| SYN sold       | ✓ | ✓ | ◐ | ◐ | Keep, deprioritize visually. |
| Sale inventory | ✓ | ✓ | ◐ | ◐ | Keep, but reframe as "% of sale tranche remaining" — easier to grasp. |
| Last buy       | ✓ | ✓ | ✓ | ✓ | Keep. This is the single best liveness cue. Promote it. |
| Next member #  | ✓ | ✓ | ✓ | ✓ | Keep. Pair with "you'd be #N" preview. |

Nothing should be removed. Two pulse cells (sale inventory, SYN sold) can be
visually de-emphasized in favour of recency cells (last buy, next member,
members-this-week).

---

## PART 5 — Community Audit

| Dimension     | Status | Notes |
|---------------|--------|-------|
| Belonging     | weak   | Identity exists; rituals don't. No "welcome to chapter X" surface. |
| Identity      | strong | Founder # + chapter + rank is rare and good. |
| Status        | medium | Rank tiers are clear, but no surface celebrates *promotions*. |
| Recognition   | weak   | Leaderboard recognizes score. Nothing recognizes early-formation contribution, longevity, or repeat participation. |
| Archive value | medium | Wallet pages are an archive; no per-chapter archive page yet. |
| History       | weak   | No "what happened in Genesis chapter" view. |
| Progress      | medium | Milestones + ranks show progress for the protocol; very little shows progress *for the member*. |

What feels transactional:
- Buy flow, leaderboard, sale inventory.
- Everything framed around "tickets" and "USDC committed".

What feels communal:
- Founder numbering and the wallet identity sentence.
- The chapter idea — finite, sealed, archival.

The gap: communal surfaces are *one* sentence among many transactional ones.
A single "Chapter & Cohort" page would shift the balance more than any other
single addition.

---

## PART 6 — Shareability Audit

Tested by mentally pasting each URL into X and Telegram:

| Surface          | Pretty in-app | OG image | Identity sentence | Share intent | Stranger would click? |
|------------------|:-:|:-:|:-:|:-:|:-:|
| Member card      | ✓ | ✗ | partial | ✗ | maybe |
| Milestone        | ✓ | ✗ | ✗ | ✗ | unlikely |
| Wallet page      | ✓ | ✗ | partial | ✗ | maybe |
| Protocol snapshot| ✗ | ✗ | ✗ | ✗ | no |
| Vault card       | partial | ✗ | ✗ | ✗ | no |
| Liquidity card   | partial | ✗ | ✗ | ✗ | no |

What's missing in one bullet: **OG images and per-surface share intents**.
Until those ship, every share is a naked URL that previews as a generic site
card and dies in the timeline.

---

## PART 7 — Growth Loop Audit

### Loops that already exist but are partly invisible

1. **Identity loop** — Purchase → founder # → chapter → rank → wallet page → (missing: OG image, share button) → social post → new visitor → Join.
   *Break point:* the share step.

2. **Recency loop** — New purchase → activity feed → (missing: per-event share intent) → social post → new visitor.
   *Break point:* there's no per-event "share this" affordance.

3. **Milestone loop** — Milestone crossed → tile flips → (missing: feed entry, celebration card, share button, OG) → community awareness.
   *Break point:* nothing between flip and awareness.

4. **Chapter scarcity loop** — Members fill a chapter → (missing: chapter sealed event, archive page, "you were here" badge) → urgency for next visitor.
   *Break point:* the seal moment is invisible.

5. **Promotion loop** — Member crosses rank → (`rank-reached` event ships in Wave 2) → (missing: dedicated share card, badge update on wallet page) → recognition.
   *Break point:* the event exists but has no surface beyond the feed row.

6. **Returning-visitor loop** — Returning visitor → (missing: "X things happened since you last visited") → re-engagement.
   *Break point:* nothing remembers them.

7. **Curiosity loop** — Member shares wallet → stranger lands on `/wallet/$address` → (missing: "neighbours" + chapter context) → stranger wanders into archive → Join.
   *Break point:* the wallet page is a leaf, not a hub.

### Ranking by leverage

1. Identity loop (highest — closest to working, smallest gap to close).
2. Milestone loop (one event, one card, one share intent away).
3. Promotion loop (event already exists, just needs surface).
4. Returning-visitor loop (one banner + localStorage).
5. Recency loop (one share intent per row).
6. Chapter scarcity loop (one event + one archive page).
7. Curiosity loop (one "neighbours" strip + one chapter context line).

---

## PART 8 — Wave 3 Prioritization

| Candidate                  | Impact | Complexity | Trust | Growth | Community | Score |
|----------------------------|:-:|:-:|:-:|:-:|:-:|:-:|
| 24h deltas on pulse cells  | 5 | 2 | 5 | 4 | 3 | **19** |
| 7d deltas on pulse cells   | 5 | 3 | 5 | 4 | 3 | **20** |
| Wallet OG image            | 5 | 4 | 4 | 5 | 4 | **22** |
| Milestone share/OG cards   | 4 | 3 | 4 | 5 | 4 | **20** |
| Promotion event share card | 3 | 3 | 4 | 4 | 5 | **19** |
| Per-event share intents    | 4 | 2 | 4 | 5 | 3 | **18** |
| "Since you last visited"   | 4 | 2 | 4 | 4 | 4 | **18** |
| Members-this-week tile     | 4 | 1 | 4 | 4 | 3 | **16** |
| Chapter archive page       | 4 | 3 | 4 | 3 | 5 | **19** |
| Wallet "neighbours" strip  | 3 | 1 | 3 | 4 | 4 | **15** |
| Activity time-window tabs  | 3 | 2 | 3 | 3 | 3 | **14** |
| Tab-title rotation         | 2 | 1 | 2 | 3 | 2 | **10** |

---

## Top 25 Momentum Opportunities

1. 24h/7d delta badges on every pulse cell.
2. "Last buy" — promote to hero strip on home.
3. "Members this week" tile on home.
4. "Since you last visited: N new members, X new USDC" banner.
5. Per-event share intent in activity feed.
6. Milestone reached-at timestamp + feed event.
7. Auto-celebration card when a round threshold (10/50/100 members, $10k/$50k Vault) is crossed.
8. Rank-promotion ribbon on home.
9. Sparkline under every pulse cell.
10. Activity feed grouped by day with "Today / Yesterday / This week" headers.
11. Chapter fill bar with "X / N filled" copy.
12. "You'd be #N" preview chip on home and on every page footer.
13. Wallet page: "joined N days ago" + "X days as a member" line.
14. Wallet page: rank-promotion timeline.
15. Wallet page: neighbour links (#N-1, #N+1).
16. Footer "last scanned block · last buy · members" stamp.
17. Tab-title rotation for live cues.
18. Anonymous "newest member N minutes ago" tile.
19. "Largest ticket so far" + "Median ticket" tiles.
20. Rank distribution donut on Ranks page.
21. Vault inflow-of-last-7d badge.
22. LP TVL 7d delta chip.
23. Sale inventory reframed as "% tranche remaining".
24. Empty states reframed from "PENDING" to "0 today · last activity N days ago".
25. Global liveness dot (pulsing green when ≤60s since last on-chain read).

## Top 25 Growth Opportunities

1. OG image per wallet page (server route).
2. OG image per milestone.
3. OG image per chapter.
4. OG image per protocol snapshot (daily).
5. Twitter intent button on member card.
6. Twitter intent button on milestone card.
7. Twitter intent button per activity-feed row.
8. "Share my wallet" CTA on `/wallet/$address` for the connected wallet.
9. Per-chapter archive page (`/chapter/genesis`, `/chapter/first-100`, …).
10. "Member wall" — last N members as identicons on home.
11. Returning-visitor banner with shareable copy.
12. "Founders Hall" — fixed page listing the first 100 wallets.
13. Rank-promotion notifications (in-app) for the connected wallet.
14. Per-rank cohort pages (Architects, Founders, Patrons…).
15. Per-tx permalink page with rich OG (`/tx/{hash}`).
16. Sitemap entries for every wallet page (capped, for SEO).
17. JSON-LD `Person`/`Organization` on `/wallet/$address`.
18. RSS/JSON feed for protocol events.
19. Embed widgets (one-line `<iframe>` for member count, vault, last buy).
20. Telegram-friendly preview cards (square OG variants).
21. Open Graph audio/video for milestone celebrations (later).
22. UTM tagging on every share intent (attribution without referrals).
23. Per-chapter share copy ("I'm member #47 of the Genesis chapter…").
24. "Invite a member" plain-text template (no referral mechanics — just copy).
25. Public changelog (`/changelog`) with shareable items.

## Top 10 Social Proof Improvements

1. Latest-member identicon strip on home.
2. Rank-promotion ribbon on home.
3. Chapter fill bars on home and on Ranks.
4. Founders Hall page.
5. Rank distribution donut.
6. Member wall (clickable grid → wallet pages).
7. "Members this week" tile.
8. Tx-history density visualization on Activity.
9. Tab-title rotation.
10. Wallet "neighbours" strip.

## What should NOT be built

- Notional P&L, "value of your SYN", or any price-anchored member stat. Violates Core rules.
- Wealth-based leaderboards beyond what the Compounder Score already does (it already de-emphasizes whales via `√usdc`).
- Referral mechanics with tracking codes — they would shift the protocol from formation to acquisition incentives and contaminate the archive.
- Notifications that require email or push subscription — out of scope; do this later through legacy deployment platform Cloud only if explicitly requested.
- Gamified "streaks" with reward implications (XP, multipliers, claimable points). A pure observability streak ("days with ≥1 new member") is fine; anything redeemable is not.
- Wallet PII enrichment (names, socials) — only what's on-chain.
- Per-wallet OG images that include live USDC numbers in the *image text* without a "live as of block N" footer — would feel dishonest the moment it's stale.

---

## Recommended Wave 3 Roadmap

Three sub-waves. None requires new contracts, new tokenomics, or new revenue.

### Wave 3a — Deltas & Recency (1 batch)
Goal: every pulse cell shows movement, not just state.

- Add windowing to `useHolderIndex` + `useProtocolPulse`: 24h, 7d.
- Render delta chip (▲ +N · 24h) on every pulse cell where the window is meaningful.
- Add "members this week" tile on home.
- Add "since you last visited" banner with localStorage cursor.
- Add reached-at timestamp + protocol-event entry for each milestone crossing.
- Promote "last buy" cell visually on home.

Acceptance: a returning visitor immediately sees "X things changed since N hours ago" on the home pulse and on the activity feed.

### Wave 3b — Wallet & Milestone Shareability (1 batch)
Goal: every shareable surface previews well off-site.

- Server route `app/routes/api/og/wallet.$address.ts` → SVG/PNG OG.
- Server route `app/routes/api/og/milestone.$id.ts` → SVG/PNG OG.
- Wire `head()` `og:image` / `twitter:image` on `/wallet/$address` and on milestone deep-links.
- Add a single "Share" button to the wallet page header (Twitter intent + copy link).
- Add "Share" buttons to each milestone tile.
- Identity sentence on wallet page header ("Member #47 · Genesis chapter · Builder · joined 12 days ago · 3 purchases · Founder badge").

Acceptance: pasting `/wallet/0xabc…` into X yields a card that a stranger would click.

### Wave 3c — Community Surfaces (1 batch)
Goal: the protocol starts feeling like a society, not a dashboard.

- Member wall on home (last N member identicons → wallet pages).
- Wallet "neighbours" strip (#N-1 / #N+1 quick-jumps).
- Founders Hall page (`/founders`) listing the first 100 wallets.
- Per-chapter archive pages (`/chapter/$slug`) with seal status and timeline.
- Rank distribution donut on `/ranks`.
- Tab-title rotation when the page is open in a background tab.

Acceptance: a first-time visitor lands, sees real people in a chapter, and can browse the archive without ever opening Avascan.

---

## Closing note

The protocol is already alive on-chain. Wave 3 is about making that life
*visible, recurring, and contagious* — without ever inventing a number,
implying yield, or selling appreciation. Every item in this audit passes the
Core triple test: improves protocol legibility, improves member experience,
is worth sharing.

---

## POST-WAVE-3A STATUS UPDATE (June 5, 2026)

Wave 3a shipped. The recency layer is live. Updated scoreboard (everything
else held constant):

| Dimension       | Pre-3A | Post-3A | Change driver |
|-----------------|--------|---------|---------------|
| Momentum        | 58     | 76      | 24h/7d delta badges, milestone "reached X ago", chapter "+N in 24h", `ProtocolTimeline` buckets. |
| Social proof    | 62     | 68      | Chapter momentum + protocol timeline make activity feel *recent* and *named*. |
| Community       | 48     | 52      | Marginal — chapter momentum hints at belonging but no real surfaces yet. |
| Growth loops    | 45     | 52      | `SinceYourLastVisit` closes the return-visit loop client-side. Outbound share loop still unfinished. |
| Shareability    | 40     | 42      | Unchanged in essence — still no OG images, still no per-event share intents. Deferred to 3B intentionally. |

**Composite Living Protocol Index ≈ 51 → 62.** The protocol now *feels*
alive on first visit and on return visit. The remaining gap is mostly
off-site (no rich previews when a link leaves the app) and community
(no surfaces that make members visible *as people*, not as rows).

See `docs/WAVE_3B_GATE.md` for the gating decision before Wave 3B.
