> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# The Syndicate — AAA Holistic Founder Audit

Date: 2026-06-05
Author hats simultaneously worn: Founder · Investor · Growth · Behavioral Psychologist · UX · Product · Staff Engineer · QA · Accessibility · SEO · Crypto-Native

This is not a bug list. This is a **product judgment audit** of the rendered
experience, oriented around one question:

> If I knew nothing and landed here, would I want to come back tomorrow?

Source-level cleanliness, route HTTP 200s, and loop-ownership guards are
treated as already passing (P6/P8 closed those). This audit only flags what
the **product still gets wrong** as a living protocol meant to create
curiosity, trust, participation, return visits, and long-term member growth.

---

## 0. Top-level verdict

Current state of the rendered product (1–10):

| Dimension                  | Score | Trend |
|----------------------------|------:|-------|
| Trust / transparency       |   9   | ↑     |
| Information architecture   |   8   | ↑     |
| First-impression clarity   |   7   | ↑     |
| **Action discoverability** | **6** | flat  |
| **Aspiration / anticipation** | **5** | flat |
| **Return-visit hook**      |  5    | flat  |
| Crypto-native expectations |  5    | flat  |
| Long-term scalability of UX (pagination, archive) | 4 | ↓ |
| Storytelling / TV-series momentum | 5 | flat |
| SEO / share metadata       |   8   | ↑     |
| Accessibility              |   7   | flat  |
| Performance (above the fold) | 8   | ↑     |

The architecture phase is essentially done. The remaining bottleneck is
**product judgment**, not engineering. We are losing first-time visitors on
aspiration and crypto-natives on action discoverability — and we have no
strategy for what the Activity / Chapters / Registry pages look like at
10,000 events or after Chapter 4 closes.

---

## 1. Per-route audit

For each route we answer the same five questions. Findings are ranked
CRITICAL / HIGH / MEDIUM / LOW.

### Homepage `/`

- **Why it exists:** convert a first-time visitor into a curious member; give
  a returning visitor a reason to come back.
- **User question it answers:** *"What is this and why now?"*
- **Action it should produce:** Join · Verify · Subscribe-to-momentum.
- **Working well:** Hero is calmer post-P6; chapter-progress loop is canonical;
  utility rail surfaces Verify/Registry/Token/Liquidity.
- **Still wrong:**
  - **HIGH — Weak anticipation framing.** "Waiting for Member #3" is true but
    emotionally flat. Should read more like *"Genesis closes at Member #10.
    8 seats remain. The next member becomes part of the founding chapter."*
    Same truth, far stronger pull.
  - **HIGH — Identity Zone is mid-page.** It is a *return loop*, not a
    first-impression block. For unconnected visitors it is dead weight
    between conversion sections. Move it lower (or render a recognition
    micro-strip near the top **only when wallet connected**).
  - **MEDIUM — "Coming Next" is visually tiny.** One of the strongest
    psychological hooks (open loop) is rendered as a sub-card. Promote to
    a full-width card with countdown-by-event framing.
  - **MEDIUM — No "what changed since you were here" above the fold for
    returning visitors.** `SinceYourLastVisit` exists but lives below
    `HomeNextMilestone`. Returning visitors should see the delta first.
  - **LOW — Final CTA repeats hero copy.** Could close with a story beat
    instead ("Chapter Genesis is still open. Be on the wall.").

### `/join`

- **Why it exists:** convert intent into an on-chain action.
- **Still wrong:**
  - **CRITICAL — Action concentration.** The route is 40 lines. A
    crypto-native lands here and expects: connect → amount → preview routing
    → confirm. Today they get a marketing shell delegating to embedded
    purchase components. Audit needed against `WALLET_UX_FLOWS.md`.
  - **HIGH — No "what happens after I buy" preview.** Should show: your
    member number will be #N, your chapter will be Genesis, you will appear
    in the Registry and on the Wall.
  - **MEDIUM — No social proof strip** (last 3 joins · live count).

### `/activity`

- **Why it exists:** continuous proof the protocol is alive.
- **Still wrong:**
  - **CRITICAL — No scalability story past ~1k events.** `ProtocolEventsFeed`
    got load-more, but `ActivityFeedTabs` and `ProtocolTimeline` will both
    degrade. Need: per-tab pagination, server-window cap, date filter,
    "jump to chapter" anchor.
  - **HIGH — Three feed-like surfaces stacked (Events / Timeline / Tabs).**
    Visitor confusion: which is canonical? Pick one primary, demote the
    others under tabs or `<details>`.
  - **MEDIUM — No empty-state aspiration.** Quiet hours render as
    "no events" — should show "Next expected event: a new Member joining
    Genesis."
  - **LOW — No RSS / share link** for momentum followers.

### `/chapters`

- **Why it exists:** make the chapter system legible and aspirational.
- **Still wrong:**
  - **CRITICAL — No archive strategy.** After Genesis / First 100 / First 500 /
    First 1000 close, what does the page look like at chapter #11? Today the
    grid is hard-coded to four chapters. Needs: "Closed chapters" archive
    section + "Active chapter" hero + "Future chapters" preview.
  - **HIGH — Closed chapters do not feel like history.** They should feel
    like museum exhibits, with a story snippet, a closing event, a member
    avatar wall thumbnail.
  - **MEDIUM — No per-chapter share OG image** wired to `/api/public/og/...`.

### `/registry`

- **Why it exists:** prove every USDC is traceable.
- **Still wrong:**
  - **HIGH — Pagination strategy.** Same as Activity: works fine today,
    collapses at scale.
  - **MEDIUM — No "verify a single line" deep link.** Sharing a registry
    row should produce a shareable URL.

### `/members` and `/founders`

- **Why exist:** social proof + identity.
- **Still wrong:**
  - **HIGH — Two routes with overlapping purpose.** Visitor cannot guess
    the difference from the nav. Either merge or sharpen the distinction
    (Founders = first 100, Members = full wall) and cross-link aggressively.
  - **MEDIUM — No filter / sort.** At 1,000+ members this becomes
    unbrowsable.
  - **MEDIUM — Member cards do not link to wallet OG.** We already ship
    `/api/public/og/wallet.$address` — wire the share button per card.

### `/ranks`

- **Why exists:** make participation legible and aspirational.
- **Still wrong:**
  - **HIGH — Static specification, no "where am I" hook.** A connected
    wallet should see *its* current rank prominently. For unconnected
    visitors, show "what unlocks at each rank" with concrete examples.
  - **MEDIUM — No progression visualization.** A simple ladder beats a
    table for emotional impact.

### `/token`, `/tokenomics`

- **Still wrong:**
  - **MEDIUM — Two routes, overlapping purpose.** `/token` is 25 lines;
    `/tokenomics` is 147. Either consolidate or sharpen: `/token` = the
    asset (price, supply, trade), `/tokenomics` = the model.
  - **HIGH — No "Trade SYN" or DEX action surfaced on `/token`.** This
    is the #1 crypto-native expectation when landing on a token page.

### `/liquidity`

- **Still wrong:**
  - **CRITICAL — Missing crypto-native actions.** Has `LpStatusCard`,
    `DexScreenerChart`, `ProvideLiquidityCTA` — but `Trade SYN` / `Add
    Liquidity` / `Become an LP` are not the top-of-page actions. A
    crypto-native expects three big buttons above the fold.
  - **HIGH — `WhyLpMatters` is good but should run *after* the action
    rail**, not before.

### `/vault`

- **Still wrong:**
  - **HIGH — Empty until vault is live.** Page exists but visitor leaves
    with no expectation of when it activates. Needs: countdown-by-event,
    "vault opens when X happens," and a subscribe-to-notification hook
    (email or wallet pin).

### `/transparency`

- **Working well:** post-P6 cleanup is strong.
- **Still wrong:**
  - **MEDIUM — No "verified by you" interaction.** A user clicking "verify"
    on a metric should land on the exact contract call, not a generic
    explorer link.

### `/roadmap`

- **Still wrong:**
  - **HIGH — Roadmap is calendar-shaped, not event-shaped.** For an
    on-chain protocol, milestones should be *event-triggered*
    ("at Member #500, X activates"), not date-triggered. This also
    eliminates roadmap rot.

### `/docs`, `/whitepaper`, `/faq`

- **Still wrong:**
  - **MEDIUM — Three documentation surfaces with unclear hierarchy.**
    `docs` = how, `whitepaper` = why, `faq` = what — currently overlap.
    Pick canonical entry point and cross-link.
  - **LOW — Whitepaper at 347 lines: no TOC sidebar / no "share section"
    deep links.**

### `/ai`, `/nfts`, `/episodes`

- **Still wrong:**
  - **HIGH — All three are < 50-line stubs.** Either ship a clear
    "coming next at event X" page (with the same anticipation pattern as
    the homepage), or noindex + remove from public nav. Currently they
    leak weak surfaces into Google.

---

## 2. Hat-by-hat audits

### FOUNDER audit
- The site **explains** the protocol. It does not yet **embody** the
  movement. The five pillars (Transparency · Identity · Memory · Momentum
  · Shareability) are present but Momentum and Shareability are the
  weakest in render.
- The biggest founder risk now is that the product reads as a
  *transparency dashboard* rather than an *onchain society*.

### INVESTOR audit
- All the right numbers are present and verifiable. Missing: a single
  "state of the protocol" snapshot a crypto fund could screenshot
  (members · USDC routed · LP depth · next chapter · contracts) in one
  card with a permalink and shareable OG image.

### GROWTH audit
- Loops B and C exist; Loop A is canonical. Loop D (share) is the
  weakest. There is **no share intent surface on the homepage** even
  though OG endpoints are deployed.
- No referral attribution (intentional per constitution — keep, but
  surface "share your chapter" as a non-rewarded social action).

### CRYPTO-NATIVE audit
- "Connect wallet" prominence is right.
- "Trade SYN" is buried in a utility rail and absent on `/token`.
- "Add liquidity" is below the fold on `/liquidity`.
- No explorer-style "your last interaction" recall.
- No chain badge ("Avalanche C-Chain · 43114") near every CTA.

### TV-SERIES audit
- Past (chapters) and Present (live feed) are well represented.
- **Future (open loop) is structurally underweight.** Every page should
  end with a "what happens next" beat tied to a verifiable on-chain
  trigger.

### FIRST-TIME VISITOR audit (10-second test)
- Visitor learns: name, mission line, live state, chapter progress,
  primary action. ✓
- Visitor does NOT learn: *why now*, *what they specifically miss if they
  wait*, *what their identity will look like after joining*. ✗

### RETURNING VISITOR audit
- `SinceYourLastVisit` is gated correctly.
- Returning visitor should see the delta **above** chapter progress, not
  below. Currently it is buried under Loop B.

### QA audit
- Hydration mismatch was patched in P8 but `suppressHydrationWarning` is
  a sticking-plaster. Long-term: render a stable placeholder server-side
  and swap on mount.
- 25 routes; only 17 covered by the live-content scan rules file. Gaps:
  `/ai`, `/nfts`, `/episodes`, `/wallet/$address`, `/milestone/$id`,
  `/chapters/$slug`, `/labs`.

### PERFORMANCE audit
- Above-the-fold weight is good post-P6.
- `ProtocolEventsFeed`, `ActivityFeedTabs`, `ProtocolTimeline` all
  un-virtualized — fine today, painful at 5k+ events.
- No route-level code splitting beyond TanStack defaults; large routes
  (`founders`, `members`, `chapters.$slug`, `wallet.$address`) should be
  audited for shared chunks.

### SEO audit
- Per-route head() is consistent; canonical/OG covered.
- `/ai`, `/nfts`, `/episodes` are thin pages that should be noindex until
  shipped — currently they hurt site quality signals.
- Sitemap exists; verify it excludes `/labs` (already robots-disallowed).

### ACCESSIBILITY audit
- Color/contrast strong; status pills carry text.
- `<details>` disclosures in `HomeNextMilestone` lack a focus-visible
  ring contrast check.
- Live regions for the "Next member #N" updates are not wired with
  `aria-live="polite"` — screen readers miss the heartbeat.

---

## 3. Ranked findings

### CRITICAL (do next, before any new feature)
1. Pagination / archive strategy for `/activity`, `/chapters`,
   `/registry`, `/members`. Define it now; don't wait until it breaks.
2. `/join` action density vs. marketing density — measure clicks-to-buy,
   then prune.
3. `/liquidity` missing top-of-page Trade / Add LP / Become LP actions.
4. Anticipation reframing across hero + final CTA: shift from "waiting"
   to "remaining seats in the founding chapter".

### HIGH
5. Move Identity Zone below conversion; show recognition micro-strip
   only when wallet connected.
6. Promote "Coming Next" / open-loop surface visually.
7. Stubs (`/ai`, `/nfts`, `/episodes`) — ship anticipation page or
   noindex + remove from nav.
8. Merge or sharpen `/token` vs `/tokenomics`, and `/members` vs
   `/founders`.
9. Roadmap → event-triggered instead of date-triggered.
10. Wire share intents + per-chapter / per-member OG cards to existing
    `/api/public/og/...` endpoints.

### MEDIUM
11. Return-visit delta strip above chapter progress.
12. Member cards link to wallet OG share URL.
13. Empty-state aspiration on `/activity` quiet hours.
14. Single "state of the protocol" snapshot card with permalink.
15. Doc surfaces — choose canonical entry point.
16. Replace `suppressHydrationWarning` with stable SSR placeholders.

### LOW
17. RSS for `/activity`.
18. Whitepaper TOC + deep-section links.
19. `aria-live` on live counters.
20. Audit final CTA copy for redundancy with hero.

---

## 4. What we should explicitly NOT do next

- Do not add referrals, NFTs, AI assistants, governance, or new modules.
- Do not add more analytics before fixing action discoverability.
- Do not delete the stub routes until we decide ship-or-noindex per route.
- Do not rebuild loop ownership; it works.

---

## 5. Recommended next wave

**Wave P9 — Product Judgment Pass.** Implementation, not architecture.
Order:

1. Anticipation reframing on homepage hero + final CTA (copy only).
2. Identity Zone repositioned + conditional rendering.
3. `/liquidity` top-of-page actions.
4. `/join` clicks-to-buy audit and pruning.
5. Pagination/archive plan for the four scalable-render routes.
6. Stub routes: ship-or-noindex decision.
7. Share intents on homepage + per-chapter OG wiring.

Stop after step 7. Re-audit. The bottleneck after that is real
distribution, not the product.

---

## Decision Lens Verdicts

Required per constitution (`docs/CONSTITUTION_SUMMARY.md` → DECISION LENSES). Verdicts apply to the **rendered product as audited**, not to this document.

```text
Lens                     Verdict   Notes
Founder                  ⚠         Vision present; movement-feel still under-rendered (anticipation + identity placement).
Investor                 ✓         Numbers verifiable; missing one-card "state of the protocol" snapshot — follow-up M14.
Growth                   ⚠         Loops A/B/C live; Loop D (share intents) not yet wired despite OG endpoints — follow-up H10.
Behavioral Psychology    ✗         Anticipation framing flat ("waiting for #3" vs "8 seats remain"); Coming Next visually weak. BLOCKING — C4.
UX                       ⚠         Identity Zone mid-page for unconnected visitors; doc surfaces (/docs /whitepaper /faq) overlap — H5, M15.
Product                  ✗         /liquidity missing top-of-page Trade / Add LP / Become LP actions; stub routes leak weak purpose. BLOCKING — C3, H7.
Staff Engineer           ✗         No pagination/archive strategy for /activity /chapters /registry /members at scale. BLOCKING — C1.
QA                       ⚠         Hydration patched via suppressHydrationWarning (sticking-plaster); 8 routes outside live-content scan coverage — M16.
Accessibility            ⚠         Live counters lack aria-live; <details> focus-ring contrast unverified — L19.
SEO                      ⚠         /ai /nfts /episodes thin pages hurt quality signals until shipped or noindexed — H7.
```

Gate result: **3 ✗ + 5 ⚠ → BLOCKED.** Audit stands as a findings report; no shipping decisions inherit a pass from it. The Wave P9 plan in §5 is the path to clearing the ✗ verdicts (C1, C3, C4) first, then the ⚠ verdicts.
