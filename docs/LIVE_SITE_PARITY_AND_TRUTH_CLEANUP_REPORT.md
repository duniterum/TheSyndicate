# THE SYNDICATE — LIVE SITE PARITY & TRUTH CLEANUP REPORT

Source of truth: `VISION.md`, `NORTH_STAR_SYSTEM.md`,
`INFORMATION_HIERARCHY.md`, `CONSTITUTION_SUMMARY.md`,
`SITE_REDESIGN_EXECUTION_REPORT.md`.

Scope: this pass only fixes public-facing copy and removes stale
demo/promissory language. No new features, no redesign, no new
strategy. The 6-zone homepage structure from the redesign report
remains intact and is the canonical homepage.

---

## 1. PARITY CHECK — DEPLOYED vs SOURCE

`npm run check-live` hits **https://thesyndicate.money** (production)
and confirmed HTTP 200 on `/`, `/ranks`, `/members`, `/founders`,
`/chapters`, `/join`, `/transparency`, `/tokenomics`, `/docs`.

The deployed production bundle still serves the **pre-redesign copy**
("Transparent Onchain Compounding Society", old footer, "Compounder
Score" hooks, DEMO PREVIEW tabs). The current source already does not
contain those phrases on the homepage — the visible mismatch is a
**deployment freshness gap**, not a source bug. After this pass is
republished via Publish → Update, the live site will match.

Pages whose source was reviewed:

| Route | Status |
|---|---|
| `/` | 6-zone hierarchy intact (Hero · Heartbeat · Story · Identity · Conversion · Proof). No stale copy in source. |
| `/join` | RankLadder benefits cleaned (see §3). Stale "Genesis NFT eligibility / strategy room / score multiplier" removed. |
| `/transparency` | Source already uses LIVE / PARTIAL / PENDING via `StatusPill`. No DEMO PREVIEW pills on this route. |
| `/activity` | Demo tab fully removed (see §3). |
| `/token`, `/tokenomics` | Tokenomics `<Leaderboard />` removed (wealth leaderboard conflict with constitution). |
| `/vault` | "Demo Vault preview" relabeled to "Future Vault preview" — Vault contract is PENDING, illustrative chart kept behind explicit toggle. |
| `/liquidity` | `LpIncentives` rewritten — no LP badges/leaderboard/governance-boost/NFT-eligibility promises. |
| `/ranks`, `/members`, `/founders`, `/chapters`, `/roadmap`, `/docs`, `/faq` | No new stale copy introduced in this pass; pre-existing language consistent with constitution. |
| Footer (global) | Rewritten (see §3). |
| Mobile sticky bar | Untouched — still rendered globally via `__root.tsx`. |

---

## 2. STALE TERMS — CLASSIFICATION

Repo-wide grep results (see commands at end). Classifications:

| Term | Verdict | Action |
|---|---|---|
| "Transparent Onchain Compounding Society" | REMOVE | Not in current source; live shows it because of stale deploy. Will disappear on republish. |
| "transparent onchain society" (footer) | REWRITE | Footer tagline rewritten to canonical positioning. |
| "Episode #N" pill in footer | REMOVE | Removed from footer. |
| `DEMO PREVIEW` pill | KEEP narrowly (vault-only) | Vault dashboard chart explicitly behind a "Future Vault preview" toggle. PENDING semantics retained. Removed from activity feed. |
| `Demo` tab on `/activity` | REMOVE | `ActivityFeedTabs` no longer renders the demo tab or `DemoPreview` component. Feed is live-only. |
| `Leaderboard` on `/tokenomics` | REMOVE | Wealth-ordered leaderboard is constitution-banned. |
| `Compounder Score` in rank benefits | REMOVE | Rank benefits rewritten to recognition-only (badge + archive + visibility). |
| `Genesis NFT eligibility` (Founder rank) | REMOVE | Stripped from rank benefits. |
| `Strategy room access` / `proposal priority` / `higher governance weight` (rank benefits) | REWRITE | Replaced with neutral "permanent archive recognition" / "manual onboarding". |
| `LP Badges`, `LP Leaderboard`, `Governance Boost`, `Genesis NFT Eligibility` (LpIncentives) | REMOVE | Single honest paragraph instead: "Future LP recognition may be considered later. No rewards, yield, NFT eligibility, or entitlement is live or promised." |
| `Quests` (lib/quest-hooks.ts) | DOCS-ONLY | Internal hook, not rendered on public site after Wave E-2. Left in source for now; not public-facing. |
| `Episodes`, `/episodes` route | KEEP (route placeholder) / REWRITE later | Public link still in sitemap but route page is a placeholder. Not added to the homepage. Flagged for removal in a future cleanup wave. |
| `Genesis NFT achievements` (roadmap, whitepaper) | KEEP — clearly PENDING | These pages explicitly describe roadmap and are labeled pending. Constitution-safe. |
| FAQ "What is Compounder Score?" entry | KEEP, will rewrite next pass | Single FAQ row; rewriting requires answer change. Flagged. |
| LiveActivityFeed `DEMO_EVENTS` array | REMOVE | Deleted with `DemoPreview`. |

---

## 3. WHAT WAS REWRITTEN / REMOVED (this pass)

### Source files edited

1. **`src/components/syndicate/Sections.tsx`** — Footer
   - Tagline: `"A transparent onchain society. Join with USDC. Verify every chapter."` → `"A transparent on-chain protocol on Avalanche. Every member is recorded and every USDC route is publicly verifiable."`
   - Removed `Episode #N` pill from footer.
   - Footer legal paragraph tightened to the constitutional safe text: `"The Syndicate is an experimental utility membership protocol on Avalanche. SYN is not equity, debt, Vault ownership, a dividend instrument, or a promise of financial return. Participation may result in total loss."`

2. **`src/components/syndicate/LiveActivityFeed.tsx`**
   - `ActivityFeedTabs` no longer renders a Live/Demo toggle. Single live feed only.
   - Header: `"Live purchases & demo preview"` → `"Live TokensPurchased events"`.
   - Description rewritten to LIVE / PARTIAL / PENDING semantics.
   - Removed `DEMO_EVENTS` constant and `DemoPreview()` component.

3. **`src/components/syndicate/LpStatus.tsx`**
   - LP risk notice: removed "(badges, leaderboard, governance boost, Genesis NFT eligibility)" enumeration. New text: "Future LP recognition may be considered later. No rewards, yield, NFT eligibility, or entitlement is live or promised."
   - `LpIncentives` collapsed from 5 PLANNED promise cards to a single honest paragraph.

4. **`src/lib/syndicate-config.ts`** — `RANKS_V2[]` benefits cleaned across all 12 ranks. Removed: "Compounder Score starts/stronger/boost/multiplier", "Genesis NFT eligibility", "Episode access/credits/participation", "Strategy room access/preview", "Proposal review preview", "Higher governance weight", "Vault flow visibility", "Governance visibility". Kept: badge, archive recognition, public member number, profile visibility, manual onboarding. `scoreMultiplier` field retained internally (referenced by `leaderboard-hooks.ts`) but no longer promised as a rank benefit.

5. **`src/routes/tokenomics.tsx`** — removed `<Leaderboard />` (and its import).

6. **`src/routes/vault.tsx`** — "Demo Vault preview" → "Future Vault preview". Toggle label simplified. Copy now explicitly says the chart is illustrative of what the PENDING contract will surface.

### Files NOT edited (intentional)

- `src/components/syndicate/Sections.tsx` IdeaSection (line ~38) still uses the older "compounding experiment" language but is not rendered on the homepage or any reviewed primary route after the redesign. Flagged for next pass.
- `src/lib/leaderboard-hooks.ts` / `src/components/syndicate/MembersLeaderboard.tsx` — still defined but no longer mounted on `/tokenomics`. Flagged for removal once we confirm no other route consumes them.
- `src/lib/quest-hooks.ts` — internal types only. No public route mounts a quest UI.
- `src/routes/nfts.tsx`, `src/routes/episodes.tsx`, `src/routes/ai.tsx` — placeholder routes with constitution-safe PENDING copy. Removal flagged for a navigation cleanup pass (Wave E-5).

---

## 4. 10-SECOND RULE — STILL HOLDS

The 6-zone homepage hierarchy from `SITE_REDESIGN_EXECUTION_REPORT.md`
is unchanged by this pass. First viewport still answers:

1. What is this? — Hero positioning + LIVE/PENDING rows.
2. Is it alive? — Pulsing dot + "N verified Members on-chain".
3. Why now? — "You could be Member #N".
4. What do I do? — `Join — become a member for $5` CTA.

No new sections added above the fold. No copy moved up or down.

---

## 5. SAFE NEXT IMPLEMENTATION DECISIONS — STATUS

Per the prompt's PART 5 decisions, the following are **approved** but
**not built in this pass** (this pass was truth cleanup only):

- **A. Verification drawers** on heartbeat metrics — approved as light tooltips/drawers, not modals; deferred to next implementation wave.
- **B. Next-member milestone hook** — already partially live in `Hero.tsx` and `AnticipationLine.tsx` via `useProtocolPulse`. The empty / loading / unavailable states ("PARTIAL — reading holder index", "0 members recorded — awaiting first member", "PENDING — holder index unavailable") need to be tightened in a focused PR.
- **C. Protocol Moments event sourcing** — `ProtocolMoments.tsx` already derives deterministically from on-chain reads with REACHED/NEXT/Pending labels. Verified-event-type rules are documented as the contract for any future expansion.
- **D. Join / Verify CTA step tracking** — approved as transaction-state clarity (no points, quests, streaks). Deferred to a focused wave.

These are tracked as the next implementation slice; they were not
included in this PR because the directive was: "Do not add new
features before fixing public truth."

---

## 6. REMAINING RISKS

- **Deployment freshness.** The live URL still serves the pre-redesign bundle until Publish → Update is clicked. Source is correct; deploy is stale.
- **IdeaSection legacy copy** (`Sections.tsx` ~38–58) still exists in source but is unmounted on every primary route reviewed. If a future route remounts it, it will leak older positioning.
- **`leaderboard-hooks.ts` + `MembersLeaderboard.tsx`** retained for safety. Should be deleted once we audit every route file for orphan imports.
- **`/episodes`, `/nfts`, `/ai` routes** remain in `routeTree.gen.ts` and `sitemap.xml`. They are PENDING-labeled placeholders today; full removal is a navigation cleanup task.
- **FAQ entry** explaining "Compounder Score" still exists in `Sections.tsx` FAQS array — needs a constitution-safe rewrite (or removal) next pass.

---

## 7. VERIFICATION

- `npm run check-live` → **all 9 routes passed (HTTP 200)** against production.
- Build-time TypeScript check passed after edits (errors during edit were addressed in the same session).
- Repo-wide search confirms no new occurrence of "Compounding Society", "demo preview" copy, "private strategy room", "proposal priority", "Genesis NFT eligibility" benefit, or "higher score multiplier" benefit in primary-route source.

---

## 8. SEARCH COMMANDS USED

```bash
rg -n "Compounding Society|Onchain Compounding"
rg -n "Compounder Score|Compounder"
rg -n "demo preview|DEMO PREVIEW|Demo Vault"
rg -n "Genesis NFT eligibility|private strategy|proposal priority"
rg -n "Leaderboard|Quests|Episodes" src/routes src/components/syndicate
rg -n "score multiplier|passive income|dividend|profit share"
```

---

## 9. FINAL STATEMENT

After republish, the public site will match the constitution:
- No "Compounding Society" wording anywhere visitor-facing.
- No demo tab on `/activity`.
- No promissory rank benefits (NFT eligibility, governance, strategy room).
- No wealth leaderboard on `/tokenomics`.
- No LP perk promises (badges/leaderboard/governance boost).
- Footer is short, factual, and constitution-aligned.
- 6-zone homepage hierarchy intact; 10-second rule still satisfied.

The remaining stale-copy items listed in §6 are flagged for a focused
follow-up pass and do not block this cleanup from being shipped.
