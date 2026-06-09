> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# The Syndicate — Wave 3B Gate

**Status:** decision-pending. Wave 3A (recency layer) is live. Do not start
Wave 3B until this gate is answered.

This document does three things:

1. A fresh, post-Wave-3A audit of the site as a *living protocol* — across
   nine roles, ranking the top reasons a visitor would still leave without
   joining, returning, sharing, or following progress.
2. The single highest-leverage improvement to ship next, with the reasoning.
3. A ranked comparison of the candidate alternatives (Wallet OG images,
   Shareability expansion, Community surfaces, Founders Hall, Chapter
   archives, Member Wall, Rank distribution, Other).

Reading order: §1 → §3 → §2.

---

## 1. Fresh re-audit (multi-role)

The Syndicate now passes the *information* test. The five pillars score:

| Pillar | Where it stands after Wave 3A | Where it still leaks |
|---|---|---|
| Transparency | Strong — every metric carries LIVE/PARTIAL/PENDING + explorer link. | Verification is *available* but rarely *demonstrated*; visitors do not see anyone using it. |
| Identity | Founder #, rank, chapter, `/wallet/$address` all real. | Members exist as **rows in a table**, not as **faces in a society**. Identity surface is shallow on the homepage. |
| Memory | Milestones now show "reached X ago, block N". | No browsable history page; recently-reached events vanish from view inside 7 days; no per-chapter or per-week archive. |
| Momentum | 24h/7d deltas, "since your last visit", timeline buckets — best pillar today. | All momentum is *internal*. None of it spreads off-site. |
| Shareability | Member card + protocol snapshots downloadable. | A link to `/wallet/0xabc…` or `/` pasted into X is **an empty grey OG card.** This is the single biggest leak in the entire system. |

### Top 10 reasons a visitor still leaves without joining, returning, or sharing

Ranked by combined *frequency × impact*. "Frequency" weighs how many
visitors hit the leak; "impact" weighs how much it costs The Syndicate in
trust, growth, or distribution.

1. **No off-site shareability.** Pasting any Syndicate URL into X, Telegram,
   Discord, or iMessage yields a generic preview. Every share — and every
   member who *would* share — leaks distribution. Wave 3A made the protocol
   feel alive *on the site*; off-site it is invisible. **(Impact: highest.
   Compounds with every future improvement.)**
2. **No "real people" surface.** A first-time visitor sees numbers, ranks,
   and feed rows but never a *grid of members*. The site reads as a protocol
   *to* members, not a protocol *of* members. No member wall, no founders
   hall, no recognizable faces of early participation.
3. **No durable history page.** Milestones and chapters now show recency,
   but there is no `/history` or `/timeline` archive a visitor can browse:
   "what happened in week 1, week 2, week 3 of The Syndicate". Memory pillar
   has a recent-events lens but no archive lens.
4. **No reason to come back tomorrow specifically.** "Since your last visit"
   helps, but the protocol does not tell a visitor *when something
   interesting is likely to happen next* (next milestone progress %, seats
   left in current chapter) on a single hero surface. The home pulse hints,
   but does not promise.
5. **Verification is described, not demonstrated.** The "verify everything"
   surfaces tell the user *how* — but never walk them through verifying a
   single real number end-to-end. A 60-second "verify this raise yourself"
   interactive flow would convert trust → conviction.
6. **No identity preview before connecting a wallet.** The `MemberCard` in
   "preview mode" exists on `/join`, but the homepage never tells the
   visitor "you would be Member #437, in the First-500 chapter". That single
   line, before any commitment, would dramatically increase emotional buy-in.
7. **No social proof of activity outside the dataset.** Real-life signal —
   tweets from members, telegram screenshots, recognizable wallet handles —
   is absent. (Out of scope to invent; in scope to *enable* via better
   shareables.)
8. **First-time visitor sees too many sections before the CTA.** Post-3A,
   the homepage is dense. A visitor who is convinced after the pulse strip
   still has to scroll through 15+ sections to find a buy CTA above the
   fold of any further section.
9. **No personalization for wallet-connected returnees.** A connected wallet
   sees the same homepage as an anonymous one. Their member card, recent
   activity, rank progress, and "next rank in X" deserve a hero slot when
   present.
10. **Mobile pulse + timeline overflow.** On a 374px viewport, the 7-cell
    pulse strip wraps awkwardly and the three-column timeline becomes a
    tall scroll. Most visitors are on mobile; momentum is the weakest there.

### What is *not* on this list (and why)

- "Site is too documentation-heavy" — solved by Wave 3A recency.
- "Numbers aren't real" — solved by Wave 1/2.
- "Hard to understand mechanics" — solved by 30-second flow, journey, why-sections.
- "Doesn't feel transparent" — solved long before Wave 3.

The remaining leaks are almost all **distribution, identity-as-people, and
memory-as-archive** — not transparency.

---

## 2. The single highest-leverage next move

> **Ship wallet & milestone OG images + a "Share this" intent on the
> wallet, milestone, and chapter routes. (Wave 3B = Shareability v1.)**

### Why this and not anything else

Leak #1 above costs The Syndicate every shared link. Every other candidate
in §3 — Member Wall, Founders Hall, Chapter Archives, Rank Distribution —
becomes *much* more valuable once those pages render as a rich social card
when shared. Building community surfaces *before* shareability is building
rooms with no doors to the outside world.

The five pillars triangulate on the same answer:

- **Transparency:** an OG image of a wallet or milestone is the most concise
  transparent artifact possible — real founder #, real block, real chapter.
- **Identity:** a member who shares their wallet card is publicly claiming a
  founder number; identity becomes legible to the outside world.
- **Memory:** a milestone OG with "reached at block N, X days ago" travels
  as a permanent historical artifact.
- **Momentum:** the *act of sharing* is itself a recurring momentum signal
  the protocol can later surface.
- **Shareability:** definitional.

It also passes all six new-product-test questions, where every alternative
in §3 passes only three or four.

### Scope of the single move (small, surgical, finishable in one wave)

- `app/routes/api/og/wallet.$address.ts` → server-rendered SVG/PNG with
  founder #, chapter, rank, joined-ago, cumulative USDC, verified badge,
  Syndicate mark. Pure read of `useHolderIndex` data on the server.
- `app/routes/api/og/milestone.$id.ts` → SVG/PNG with milestone label,
  status, reached-at, block link, Syndicate mark.
- `head()` wiring on `/wallet/$address` and milestone deep-links to use
  these OG endpoints (`og:image`, `twitter:image`).
- A single "Share" button in the wallet header (X intent + copy link) and on
  every reached milestone tile.
- Identity sentence at the top of `/wallet/$address` ("Member #47 · Genesis
  chapter · Builder · joined 12 days ago · 3 purchases · Founder badge")
  so the page's H1 region matches the OG.

Acceptance: pasting any wallet URL into X yields a card a stranger would
click on; pasting any milestone deep-link does the same.

### What this is explicitly *not*

- Not a Member Wall (deferred — needs shareability first).
- Not a Founders Hall page (deferred — needs OG card per wallet first).
- Not chapter archives (deferred — same reason).
- Not a Rank Distribution donut (deferred — internal, doesn't leave the site).
- Not a tweet/Telegram bot.
- Not analytics on shares.

---

## 3. Ranked candidate alternatives

Each candidate scored against the six new-product-test questions and the
"five pillars" lens, plus implementation cost (S/M/L).

| # | Candidate | Pillars served | New-product-test (✓/6) | Cost | Verdict |
|---|---|---|---|---|---|
| **1** | **Wallet + Milestone OG images & share intents** (recommended) | Transparency, Identity, Memory, Momentum, Shareability | **6 / 6** | M | **Ship next.** Unlocks the distribution side of every later wave. |
| 2 | Member Wall on homepage (identicon grid → wallet pages) | Identity, Community, Shareability* | 5 / 6 (Shareability only if (1) shipped) | S | Powerful, but its share value depends on (1). Ship right after. |
| 3 | Founders Hall page (`/founders` — first 100 wallets) | Identity, Memory, Community, Shareability* | 5 / 6 | S | Same dependency. Add after (1) + (2). |
| 4 | Chapter archive pages (`/chapter/$slug`) | Memory, Identity, Community | 4 / 6 | M | Strong memory pillar play; share value low without (1). |
| 5 | Rank distribution donut on `/ranks` | Transparency, Identity | 3 / 6 | S | Nice-to-have; entirely internal — doesn't address the top leak. |
| 6 | Wallet "neighbours" strip (#N-1 / #N+1) | Identity, Memory, Community | 4 / 6 | S | Cheap polish for `/wallet/$address`. Bundle with (1). |
| 7 | Personalized "your hero" for connected wallets | Identity, Momentum | 4 / 6 | M | Leak #9 fix. Valuable, but secondary. |
| 8 | "Verify this raise" interactive walkthrough | Transparency | 3 / 6 | M | Leak #5 fix. Important but narrow. |
| 9 | "Next milestone" promise hero block | Momentum, Memory | 3 / 6 | S | Leak #4 fix. Bundle into (1) wave if cheap. |
| 10 | Mobile pulse/timeline refit | Momentum (mobile only) | 2 / 6 | S | Leak #10 fix. Tactical; not a wave. |

### Why not "Community surfaces" first?

Community surfaces (Member Wall, Founders Hall, Chapter Archives) are the
*right next priority* — but each of them creates more shareable URLs.
Shipping them *before* OG cards means every URL they create immediately
joins the pile of links that travel badly. The order that compounds is
**OG/share intents → community surfaces**, not the reverse.

### Why not "Rank Distribution" first?

It is a purely internal surface. It improves the `/ranks` page for someone
already on the site. It does not solve any of the top 5 leak reasons. Ship
it later as part of a `/ranks` polish pass.

---

## 4. Decision template

Approve one:

- [ ] **Recommended:** Wave 3B = Wallet + Milestone OG + share intents
      (Identity sentence + Share button + neighbours strip bundled in).
- [ ] Override: choose another candidate from §3 and state the pillar
      argument that overrides the recommendation.
- [ ] Pause Wave 3B; re-audit in N weeks.

Once approved, the next agent should:

1. Read §2 "Scope" as the build brief.
2. Confirm OG generation strategy fits the Worker runtime (SVG → PNG via
   `@vercel/og` or pure-SVG return; no `canvas`/`sharp`).
3. Stop after shipping §2 scope and re-evaluate community surfaces.

*End of gate document.*
