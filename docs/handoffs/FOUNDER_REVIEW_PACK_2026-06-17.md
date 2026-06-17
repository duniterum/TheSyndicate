# Founder Review Pack — Visual Architecture Board

**Type:** Read-only founder review. **No code, no page moves, no new lab, no deletes, no renames.**
**Date:** 2026-06-17
**Source board:** the Visual Architecture Board on the Canvas (sections **A–H**, 195 shapes, all ids `ab-*`).
**Companion brief:** `docs/handoffs/WHOLE_SITE_PRODUCT_DASHBOARD_ARCHITECTURE_2026-06-17.md`.

---

## How to view the sections (item 1)

The full board has been **presented to you on the Canvas** — open the presented card to jump to it. The canvas surface can't be rasterized into image files from this side, so instead of flat screenshots each section is **labeled on the board (A–H headers) and navigable**, and is documented below. To zoom a single section, open the card and scroll to its gold/colored header band. Approximate board coordinates (origin x≈4600):

| Section | Title | Board band (y) |
|---|---|---|
| **A** | Current Site Map | −1600 → 120 |
| **B** | Duplication Map | 180 → 1360 |
| **C** | Future Architecture | 1420 → 2820 |
| **D** | Alice Journey | 2880 → 3630 |
| **E** | Member OS Wireframe | 3690 → 4810 |
| **F** | Referral Preview | 4870 → 5700 |
| **G** | Page Priority | 5760 → 6490 |
| **H** | Brand System *(new this pass)* | 6550 → 8290 |

**Priority legend (used on the board):** 🟩 PRIMARY · 🟦 SECONDARY · ⬜ PROOF · 🟪 FUTURE.

---

## Per-section review (item 2)

For each: **Decision to make · Obvious from the board · Still unclear · Touch first · Do NOT touch yet.**

### A — Current Site Map
- **Decision:** Ratify the route inventory. ~21 routes / ~18 nav destinations exist; 15 are mapped as live thumbnails. Confirm this *is* "the site," and which routes are canonical vs legacy.
- **Obvious:** The machine is large and the *pieces of a cockpit already exist* — they're just separate dashboards. Proof/technical pages outnumber desire pages.
- **Unclear:** Whether near-twins each deserve a standalone page: `/nft` vs `/archive`, `/token` vs `/tokenomics`, `/transparency` vs `/registry`.
- **Touch first:** Nothing structural — just sign off that the inventory is correct.
- **Do NOT touch yet:** No deletes, merges, or redirects. This is a census, not a cleanup.

### B — Duplication Map
- **Decision:** Pick the **single canonical home** for each of the 8 repeated concepts (ticker · 70/20/10 routing · treasury · LP · NFT story · chapters · activity · verify).
- **Obvious:** The same economy truth is sprayed across 5+ routes; the whole machine never appears in one frame; the artifact story is split across `/nft` + `/archive`.
- **Unclear:** Converge by *"lift the headline metric to the homepage, keep the deep page"* (low risk, recommended) **vs** actually merging pages (higher risk). The `/nft`↔`/archive` merge-or-differentiate is the one genuinely open call.
- **Touch first:** Decide canonical owner per concept **on paper**. The homepage cockpit + global ticker is the convergence point.
- **Do NOT touch yet:** Don't merge/delete deep pages; don't rename concepts; leave referral labeling alone.

### C — Future Architecture
- **Decision:** Approve the **5-zone ownership model** (Conversion → Live Economy → Belonging → Proof → Future) with everything funneling into the **Member OS**.
- **Obvious:** It's a *re-composition of existing parts*, not new builds — one visual language, four functional registers.
- **Unclear:** Exact tier of a few routes (chapters, token); and confirmation that the homepage is a **cockpit + funnel hybrid** (recommended) rather than a pure landing page.
- **Touch first:** Ratify the target — it's the spine the whole sprint sequence follows.
- **Do NOT touch yet:** No nav restructuring. This is the blueprint, not the build.

### D — Alice Journey
- **Decision:** Confirm the canonical arc — **Alive → Join → Seat → Dashboard → Progression → Story → Actions → Share** — and which current drop-offs are acceptable.
- **Obvious:** The arc *exists in code* but is diluted by redundancy and hidden by nav. Biggest friction: Join is overloaded (13 stacked sections) and the cockpit is buried behind the wallet chip.
- **Unclear:** The seat→identity payoff moment — should there be an explicit post-purchase confirmation / first-time onboarding state? (Currently weak.)
- **Touch first:** The two friction points (focus Join; surface the cockpit) — as *sprint scope*, not now.
- **Do NOT touch yet:** Don't alter the arc's doctrine (no ROI hooks, no manufactured FOMO).

### E — Member OS Wireframe (`/my-syndicate`)
- **Decision:** Confirm `/my-syndicate` is **the** post-join home, and approve closing the two gaps (Settings is PENDING; first-time/zero state; a return-hook) **using existing components only**.
- **Obvious:** Near-complete member OS — the strongest page on the site. Only **Settings** is missing; the forward half (BuildingZone + referral) is PENDING/preview, so it reads a little empty.
- **Unclear:** Whether the internal metaphors ("Chronicle," "Operating System") stay (naming = governance, deferred); whether Settings earns a slot in sprint 1.
- **Touch first:** Entry path + zero/onboarding state + return-hook — all composition, no new features.
- **Do NOT touch yet:** Don't rename Chronicle/cockpit; don't ship referral live; don't fabricate BuildingZone data.

### F — Referral Preview
- **Decision:** Confirm referral stays **PREVIEW** (`commissionRouter = 0x0`), and set a **visibility policy**: keep it quiet, or surface it as a clearly-future teaser.
- **Obvious:** Correctly future-labeled. Commission would be paid **only out of the Operations 10% slice** — the Vault 70% and Liquidity 20% are never touched (legally clean).
- **Unclear:** How prominent a not-live feature should be (visibility vs over-promising); the tiered 30–80%-of-the-10%-slice model is still draft.
- **Touch first:** Nothing in code — at most, decide the visibility policy.
- **Do NOT touch yet:** Do **not** ship referral live; do not alter its preview/simulated labeling; no "earn now" language.

### G — Page Priority
- **Decision:** Ratify the **four buckets** and the **Tier 0–4 hierarchy** (what's PRIMARY vs PROOF vs FUTURE).
- **Obvious:** Proof pages (`/transparency`, `/token`) are over-promoted in nav; belonging/economy pages (`/ranks`, `/chapters`, `/liquidity`) are buried in a 12-item "More."
- **Unclear:** Exact tier for `/chapters`, `/members`, `/archive`; whether to flatten "More" now or after the homepage lands.
- **Touch first:** This bucket map is the **nav sprint's input** — ratify it.
- **Do NOT touch yet:** Don't reorder production nav; no redirects.

### H — Brand System *(added this pass)*
- **Decision:** **Approve the preferred rounded interconnected "S" mark as the canonical brand direction** and the application set (favicon · app icon · token logo · press kit · exchange listing preview · dashboard identity · social avatar).
- **Obvious:** A complete, coherent system already exists across the attached sheets — Gold `#D4AF37` on ink `#0B0B0D`, Raleway type, tagline *"Membership. Signal. Legacy.,"* light + dark, all icon sizes (512→32px).
- **Unclear:** Final mark variant (you've chosen the **rounded interconnected** mark over the angular-S in sheets 2–3 — confirm); token-coin treatment (gold vs white variant); whether nav leads with the wordmark lockup or the mark alone.
- **Touch first (once approved):** Non-app assets first — favicon, app icon, social avatar, press-kit export — **zero protocol risk**. Token logo + exchange-listing tile next.
- **Do NOT touch yet:** Don't wire it into the app (no `@assets` import / `public/` swap) until approved; don't change the in-app obsidian-cockpit theme. Brand ≠ protocol code.

---

## First safe implementation sprint (item 3)

Ranked by **safety × leverage**. Recommendation: a tiny **Sprint 0** that carries zero protocol risk, then the highest-leverage product sprint.

| Rank | Candidate | Risk | Leverage | Verdict |
|---|---|---|---|---|
| **0 ★** | **Brand / press kit** | **None** (assets only, no protocol code) | High (external credibility, exchange/social readiness) | **Start here.** Pure assets; parallelizable; reversible. |
| **1 ★** | **Homepage cockpit** (un-hide ticker + lift existing economy engines) | Medium (most-seen page; composition of existing parts) | Highest desire-per-effort | **First product sprint.** Unblocks nav + duplication decisions. |
| 2 | **Member OS promotion** (entry path + zero state + return-hook) | Low (contained, existing components) | High | Strong fast-follow to Sprint 1. |
| 3 | **Join simplification** (focused checkout) | Medium-high (conversion + legal-sensitive copy) | High | Needs care; do after cockpit. |
| 4 | **Nav hierarchy** (promote ranks/chapters/liquidity; demote proof) | Medium | Medium | Depends on homepage decisions — sequence after. |
| 5 | **Referral preview visibility** | Low | Low | A policy decision, not a build. Defer. |

**Recommended order:** **Sprint 0 — Brand/press kit** (safe, immediate, no protocol code) → **Sprint 1 — Homepage cockpit** → **Sprint 2 — Member OS promotion**. Everything in Sprints 0–2 is *composition + assets*, not new protocol claims.

---

## Brand-system recommendation (item 4)

**Adopt the preferred rounded interconnected Syndicate mark** (4th reference image — the gold/black double-loop "S") as the **single canonical brand direction**. It already ships as a complete system; the work is *applying* it, not designing it.

**Canonical tokens (from the reference sheets):**
- **Mark:** rounded interconnected "S" (chain-link) — primary; mark-only for small sizes.
- **Palette:** Gold `#D4AF37` · Ink `#0B0B0D` · `#232326` · `#6B6B73` · `#F5F5F7`.
- **Type:** Raleway (Bold / Medium / Regular).
- **Tagline:** *Membership. Signal. Legacy.*
- **Rules:** clear space = height of the "S"; never alter proportions or colors; always ship light + dark.

**Application set (recommendation only — none implemented):**

| Target | Direction | Status |
|---|---|---|
| **Favicon** | Mark-only, 16–48px, gold on ink | PENDING |
| **App icon** | 512px rounded square, gold on ink | PENDING |
| **Token logo (SYN)** | Circular coin; gold + white variants; sizes 512→32 | PENDING |
| **Press kit** | Logo pack AI/EPS/SVG/PNG, light + dark, usage rules | PENDING |
| **Exchange listing preview** | CoinGecko / CMC / Avascan / DexScreener coin tile | PENDING |
| **Dashboard identity** | Header lockup + member avatar in `/my-syndicate` | PENDING |
| **Social avatar** | Circular mark on ink background | PENDING |

These now live on the board as **Section H** for visual sign-off. Approving Section H is exactly Sprint 0.

---

## Guardrails carried forward (do NOT touch — items 5–9)

- No code, no page moves, no new lab, no deletes, no renames during this review.
- No ROI / yield / dividend / return / equity / profit / "earn now" language.
- Members do **not** own the vault (protocol-controlled, transparently routed, never claimable).
- Rank / chapter / era confer **no rights** — recognition + coordinates only.
- Referral stays **preview** (commissions only when CommissionRouter ships).
- NFT ≠ membership (SYN is the seat; artifacts are separate optional mints).
- Eras II–IX must **not feel live** (only Era I; FUTURE labeling unmissable next to any rate).
- Holder Index = identity truth · SYN = the seat · artifacts = memory · 70/20/10 = membership-sale routing only.
- Every public number maps to an on-chain read or is labeled PENDING/FUTURE.

---

## Founder decision checklist (what to approve to unlock the first sprint)

1. **A/B inventory + duplication owners** ratified? (which page owns each concept)
2. **C target architecture** (5 zones → Member OS) approved?
3. **D arc** confirmed as canonical?
4. **E** — `/my-syndicate` confirmed as the post-join home; gaps approved for composition?
5. **F** — referral visibility policy set (keep quiet / future teaser)?
6. **G** — tier hierarchy ratified for the nav sprint?
7. **H** — **preferred rounded mark approved** as canonical brand direction?
8. **Sprint pick:** approve **Sprint 0 (brand/press kit)** + **Sprint 1 (homepage cockpit)** to begin.

*End of founder review pack. Read-only by design — approve above, then the first sprint can begin.*
