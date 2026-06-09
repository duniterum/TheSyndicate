> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# P9 — Product Judgment Recalibration

Date: 2026-06-05
Status: **Judgment pass only. No code changes. P9 implementation gated until this document is approved.**
Wears: Founder · Investor · Growth · Behavioral Psychology · UX · Product · Crypto-Native · Staff Engineer · QA · Accessibility · SEO

---

## 0. Why this document exists

The `AAA_HOLISTIC_FOUNDER_AUDIT` correctly identified the remaining weak
surfaces. The danger is jumping straight into another big implementation
wave before we have answered the **product-judgment** questions that
should govern the implementation.

The audit's CRITICAL findings (liquidity actions, pagination/archive
strategy, event-driven roadmap, anticipation reframing) are approved as
**problems**. Their **solutions** are not yet approved — especially the
Identity Zone move, which is almost certainly a *conditional rendering*
problem, not a *relocation* problem.

The site is now strong on trust, transparency, and architecture.
It is weak on **desire, momentum, aspiration, shareability**. Those are
not engineering gains. They are narrative, identity, anticipation, and
psychology gains. P9 must be designed accordingly.

This document answers the ten product-judgment questions that must come
**before** any implementation in P9.

---

## 1. Approved problems (from the audit)

These are not re-debated. They become the P9 implementation scope, but
only after their *framing* below is also accepted.

| # | Problem                                          | Framing P9 must respect                                                                 |
|---|--------------------------------------------------|------------------------------------------------------------------------------------------|
| 1 | `/liquidity` missing top-of-page actions         | Crypto-native expectation: 3 actions above the fold (Trade · Add LP · Become an LP).    |
| 2 | Pagination / archive strategy missing            | Solve once, generically — `/activity`, `/chapters`, `/registry`, `/members`.            |
| 3 | Chapters lack archive-as-history feel             | Closed chapters are museum exhibits, not greyed cards.                                  |
| 4 | Roadmap is calendar-shaped                        | Event-triggered milestones (Member #100, #500, #1000, Vault activation).                |
| 5 | Anticipation framing flat                         | Truthful reframing of every "next" surface around closing seats, not waiting.           |

---

## 2. Explicitly **not** approved yet

| Audit recommendation                  | Reason held                                                                                |
|---------------------------------------|--------------------------------------------------------------------------------------------|
| "Move Identity Zone below conversion" | Solution is conditional rendering by wallet state, not relocation. See §4.                 |
| "Single state-of-protocol snapshot card" | Risk of building another dashboard tile. Reconsider once §3 narrative is decided.        |
| "Merge or sharpen /token vs /tokenomics" | Naming decision belongs to the narrative, not a refactor. See §6.                        |
| "Stubs ship-or-noindex"                | Defaults to **noindex** in P9; ship decisions deferred until each module has a real beat. |

---

## 3. The ten product-judgment answers

These answers govern the P9 implementation. They are the brief.

### 3.1 What is the protocol's strongest emotional hook?

**"You can be in the archive forever."**

Not price. Not yield. Not access. The unique, defensible, on-chain
truth is that every member's number, wallet, chapter, and first actions
are permanently recorded — and the *earliest* records are
structurally rarer than every record that comes after. The protocol
turns a wallet into a line in a verifiable history book.

### 3.2 What makes someone come back tomorrow?

Three loops, ranked by strength:

1. **Open loop — "what happens next."** A visible, event-triggered
   next beat: next member, next chapter close, next LP milestone, next
   contract event. Always answers *what is the protocol waiting for*.
2. **Delta loop — "what changed since I was here."** Already partially
   built (`SinceYourLastVisit`). Must surface above chapter progress
   for returning visitors.
3. **Identity loop — "my line in the archive moved."** A new event on
   the connected wallet's history (rank progression, chapter close,
   archive position shift).

Loop 1 is the universal hook. Loops 2 and 3 are conditional.

### 3.3 What creates the "I was there" feeling?

Five elements, all required, none invented:

- A permanent, low number (Member #N).
- A chapter label that *closes* (Genesis ≤ 10, First 100, First 500, First 1000).
- A first-action record (first purchase, first LP, first rank).
- A wallet OG card the member can share without losing the framing.
- A visible, public wall on which the member appears.

Today: 1, 2, 5 exist. 3 is partial. 4 exists as an endpoint but is not
wired to per-member share intents.

### 3.4 What makes Genesis special?

Three structural facts, no embellishment:

- It is the **only** chapter capped at 10.
- It is the **only** chapter where the protocol launched.
- It is the **only** chapter where every member is structurally a
  founder by membership-set definition.

Every Genesis surface should make those three facts unmissable —
without invoking returns, payouts, or rewards.

### 3.5 What makes Chapter 100 (or any later chapter) special?

Each chapter must inherit an *intrinsic* story beat, not just a number:

- A closing event (the last seat) that becomes a permanent moment.
- A summary card (members, date span, treasury delta during the chapter).
- A "first of this chapter" record (first member, first LP, first rank).
- A shareable OG card scoped to the chapter.

Without these, Chapter 11+ collapses into a count, and Genesis
loses contrast.

### 3.6 What creates shareability without referrals?

Identity-based shareables, not link-based incentives:

- **Wallet OG** — your number, chapter, rank, archive position.
- **Chapter OG** — the chapter you belong to, with its members visible.
- **Milestone OG** — "Member #100 just joined" with verifiable timestamp.
- **State-of-the-protocol OG** — a daily/weekly cohort snapshot.

Endpoints exist (`/api/public/og/wallet.$address`,
`/api/public/og/milestone.$id`). What's missing is the *share intent
surface* that turns those endpoints into a one-tap copy/X/Farcaster action.

### 3.7 What creates anticipation without fake scarcity?

The only honest anticipation lever is **structural finiteness that is
already true on-chain**:

- Genesis is capped at 10 by the membership-set model.
- Chapters close by membership count, not by date.
- Every new member is permanently recorded; the order cannot be
  retroactively earned.

The wrong moves: countdowns to invented deadlines, "only 24h left"
banners, manufactured urgency.

The right copy pattern:

> **Genesis closes at Member #10. 8 founding seats remain.**
> **The next wallet becomes Member #3 and is permanently recorded in the Genesis chapter.**

Same truth as "waiting for Member #3", 10× stronger pull. This pattern
must be applied everywhere a "next" surface exists — homepage hero,
homepage final CTA, `/join`, `/chapters`, `/vault`, `/roadmap`.

### 3.8 How should disconnected and connected visitors differ?

This is the question the audit got *almost* right.

**Disconnected visitor** (homepage is for them by default):
- Lead with anticipation (Genesis closing) and what joining unlocks
  (the archive line, the chapter, the public wall).
- Identity Zone is rendered in its **could-be** state — "You could be
  Member #N" — and stays mid-page; it is *not* hidden, because it is
  the bridge from "what this is" to "what you become".
- Show last 3 joins as social proof, not as a leaderboard.

**Connected visitor** (homepage adapts):
- Promote a thin **recognition strip** to the top, above the hero
  metrics: `You are Member #N · Chapter X · Rank Y`.
- Identity Zone in its **are-in** state replaces the could-be card,
  in place — no relocation needed.
- Returning + connected: `SinceYourLastVisit` delta rises above
  chapter progress; "Coming Next" stays as the open loop.

The implementation is therefore **state-aware rendering of the same
section in place**, not a layout reshuffle.

### 3.9 How should the archive evolve after 10,000 members?

Archive is a product, not a database. Three structural rules:

- **No infinite scroll on identity surfaces.** Members and Founders
  pages become *cohort-paged*: Genesis (10) · First 100 · First 500 ·
  First 1000 · later cohorts of 1000, each addressable by URL.
- **Chapter pages are the canonical browse.** `/chapters` shows
  closed chapters as exhibits, active chapter as live, and future
  chapters as anticipation cards.
- **Activity becomes time-windowed by default.** The default view is
  "last 24h"; deeper history is opened by chapter anchor, not by
  scrolling.

This is the only architecture that does not collapse at 10k+ members.

### 3.10 What is the final homepage narrative?

Reading top-to-bottom, a first-time visitor should experience:

1. **Anticipation** — Genesis is closing; the next seat is now.
2. **Proof it is real** — live members, live chapter progress, live
   contract events.
3. **Identity** — could-be (or are-in) Member card; this is who you
   become.
4. **Mechanics** — how joining works, what is on-chain, what isn't.
5. **Trust** — verifiable metrics with status pills and explorer links.
6. **Open loop** — Coming Next, event-triggered.
7. **Close** — a single CTA that restates the anticipation truth.

A returning + connected visitor experiences: recognition strip on top,
delta above chapter progress, everything else unchanged.

---

## 4. Implications for the P9 implementation plan

The audit's seven-step plan is rewritten as follows. **Order matters.**

1. **Anticipation copy pass** (zero structural change). Hero, final
   CTA, `/join` intro, `/vault` waiting state, `/chapters` active card,
   `/roadmap` headers — all reframed using §3.7 pattern.
2. **State-aware Identity Zone** (no relocation). Render the
   could-be card for disconnected, are-in card for connected, in
   place. Add a thin top recognition strip *only* when connected.
3. **Returning-visitor delta promotion.** Move `SinceYourLastVisit`
   above `HomeNextMilestone` when the delta is non-empty.
4. **`/liquidity` top-of-page action rail.** Three actions
   (Trade · Add LP · Become an LP), then `WhyLpMatters`, then chart.
5. **Event-driven roadmap.** Replace calendar headers with
   member-count and chapter-close triggers.
6. **Chapter archive shape.** Closed (exhibit) / Active (live) /
   Future (anticipation). No code-generated count yet; ship the shape
   for 4 chapters and ensure adding a 5th is a data, not layout, edit.
7. **Pagination/archive primitive.** One shared component used by
   `/activity`, `/chapters`, `/registry`, `/members`. Default windows;
   chapter anchors; no infinite scroll on identity surfaces.
8. **Share intent surfaces.** Wire homepage final CTA + per-chapter +
   per-member share buttons to the OG endpoints already deployed.
9. **Stubs noindex.** `/ai`, `/nfts`, `/episodes` get `noindex` + a
   single anticipation line; they stay in nav only if the line is
   honest. Otherwise drop from nav.

Steps 1–3 are pure presentation and unblock 80% of the desire /
anticipation gap. Steps 4–6 unblock the crypto-native + scalability
gap. Steps 7–9 unblock shareability and SEO hygiene.

Identity Zone **relocation** does not appear in this plan and will not
be implemented.

---

## 5. What we are explicitly not building (still)

- Referral attribution, rewards, leaderboards by wealth.
- Countdowns to dates the protocol has not committed to on-chain.
- "Coming Soon" hero banners with no event behind them.
- Any analytics expansion before steps 1–3 ship and we can read real
  behavior.
- Any "state of the protocol" mega-card before step 8 ships and we see
  whether share intents already satisfy the demand.

---

## 6. Open questions deferred to post-P9 review

- `/token` vs `/tokenomics` — keep as `asset` vs `model` or merge?
  Decide after step 1 settles the narrative voice.
- `/founders` vs `/members` — keep two routes if `/founders` becomes
  the *Genesis + First 100 exhibit* and `/members` becomes the wall.
  Otherwise merge.
- Single permalinkable state-of-the-protocol snapshot — only build if
  share-intent telemetry (post step 8) shows demand.

---

## 7. Gate

P9 implementation begins **only after** this document is acknowledged.
When implementation starts, each step ships with its own decision-lens
grid as required by `docs/CONSTITUTION_SUMMARY.md`.

---

## Decision Lens Verdicts

Verdicts apply to **this recalibration plan** (the brief governing P9), not to the audit it supersedes.

```text
Lens                     Verdict   Notes
Founder                  ✓         Centers the protocol on "you can be in the archive forever"; Genesis framing is intrinsic, not invented.
Investor                 ✓         Anticipation reframed using on-chain finite facts only; no returns, payouts, or yield language introduced.
Growth                   ✓         Three return loops named and ranked; share intents wired to existing OG endpoints in step 8 (no referrals).
Behavioral Psychology    ✓         Replaces "waiting for #3" with closing-seat truth; open loop, delta loop, identity loop made explicit.
UX                       ✓         Resolves Identity Zone via state-aware in-place rendering instead of relocation; preserves member-first flow.
Product                  ✓         Step order unblocks desire/anticipation (1–3) before scalability (4–7) and shareability (8–9).
Staff Engineer           ⚠         Pagination/archive primitive (step 7) needs an interface spec before code — follow-up: write the primitive contract before step 7 starts.
QA                       ⚠         No code changes here, but state-aware Identity Zone (step 2) will need rules added to live-content scan — follow-up: extend scripts/live-content-rules.json when step 2 lands.
Accessibility            ✓         Anticipation copy + recognition strip both add semantic text; aria-live for live counters carried into step 2.
SEO                      ✓         Stubs default to noindex (step 9); event-driven roadmap improves crawlable semantic structure; no thin-page regressions introduced.
```

Gate result: **0 ✗ + 2 ⚠ → APPROVED to govern P9.** The two ⚠ are documentation follow-ups attached to their respective steps, not blockers on this plan.
