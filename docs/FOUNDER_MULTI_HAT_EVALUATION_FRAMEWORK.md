# Founder Multi-Hat Evaluation Framework

**Status:** Constitutional. Permanent. Supersedes "engineering-correct = done".
**Owner:** Every contributor. **Trigger:** Every proposal, audit, redesign, roadmap item, CTA, page, feature, pill, progress bar, status row, feed item, card, or copy change.

---

## 0. Why this exists

The Syndicate has spent waves P → P8 fixing trust, copy, architecture, route
consistency, and transparency. The site is now **more correct** but not yet
**more compelling**. The remaining debt is no longer technical — it is
**emotional**.

Recurring symptom: components that are technically correct but emotionally
inert. Tiny `NEXT` pills with no consequence. A roadmap that reads like a
builder backlog. A chapters page that feels finite. An identity zone that
looks like an account dashboard. An activity feed that reads like a database
viewer. A liquidity page that lists metrics without meaning.

Engineering correctness is the **floor**, not the ceiling.

---

## 1. The thirteen hats (all worn simultaneously)

For every surface — page, section, card, button, pill, progress bar, status
row, CTA, feed item, chapter card, roadmap card, hero element — evaluate
through all of these in one pass:

1. **Founder** — does this represent the protocol the way I'd defend it on stage?
2. **Investor** — does this raise or lower long-term confidence?
3. **Growth Lead** — does this create a reason to visit, return, or share?
4. **Behavioral Psychologist** — what feeling does this trigger? early? late? included? excluded? curious? bored?
5. **UX Lead** — is the next action obvious, and does it match the user's actual question?
6. **Product Lead** — does this advance the product story, or just exist?
7. **Story Designer** — where does this fit in the arc? what chapter are we in? what comes next?
8. **Community Architect** — does this make people want to belong, contribute, or recognize each other?
9. **Brand Strategist** — does this reinforce "professional onchain society" or drift toward corporate / dashboard / meme?
10. **Staff Engineer** — is the data live, the contract clean, the failure mode honest?
11. **QA Lead** — what breaks at 10 members? 1,000? 100,000?
12. **Accessibility Lead** — does it work without color, without a mouse, with a screen reader?
13. **SEO Lead** — does the structure help search engines understand the protocol?

This **extends** (does not replace) the 10 Decision Lenses in
`docs/AAA_DECISION_LENSES.md`. Hats 1–9 are the emotional/strategic layer; 10–13
map directly to the existing Staff Eng / QA / A11y / SEO lenses plus the
Founder, Investor, Growth, Behavioral, UX, Product lenses already in the
constitutional grid.

---

## 2. The Five-Value Test (mandatory)

Before writing or shipping any component, declare all five values **out loud**
in the proposal / PR / audit report:

| Value | Question |
|---|---|
| **Engineering Value** | What does this make technically possible / correct? |
| **User Value** | What can the user now *do* that they couldn't before? |
| **Emotional Value** | What does the user *feel* when they see this? |
| **Story Value** | What chapter of the protocol's narrative does this advance? |
| **Retention Value** | What reason to come back tomorrow does this create? |

**Rule:** If only Engineering Value is non-trivial, **stop and redesign**.
Engineering-only changes are allowed only for refactors, performance, security,
or accessibility — and must be labeled as such.

---

## 3. The seven emotional questions every surface must answer

For every visible surface, answer the question it triggers in a first-time
visitor's head:

1. Why should I care?
2. Why should I join?
3. Why should I come back tomorrow?
4. Why should I tell someone else?
5. Why should I feel early?
6. Why should I feel progress?
7. Why should I feel identity / anticipation?

A surface that answers **zero** of these is decoration. A surface that answers
**one** is functional. A surface that answers **three or more** is alive.
Aim for alive.

---

## 4. Pattern translations (engineer → founder lens)

These are the recurring failure modes observed across the live site, with the
correct reframing. Use them as worked examples, not as a closed list.

### 4.1 Status pills (`NEXT`, `SOON`, `LIVE`)
- **Wrong:** a colored label communicating only "this exists".
- **Right:** consequence-first label. *Next for whom? What changes when it ships? What behavior unlocks?*
- **Test:** if removing the pill would lose zero information, the pill is decoration.

### 4.2 Roadmap cards
- **Wrong:** "Activity Indexer · Docs Hub · Tokenomics Upgrade · Shareable Cards" (builder backlog).
- **Right:** *What changes for a member when this ships? What new behavior, story milestone, return reason, share reason, or identity signal is unlocked?*
- **Test:** could a non-engineer read the card and want the date?

### 4.3 Chapter system
- **Wrong:** "Genesis · First 100 · First 500 · First 1000" — feels finite.
- **Right:** the system must read as **infinite**. After Chapter 4 there is Chapter 5; after Chapter 20 there is Chapter 100. Make the continuation visible, even if the later chapters are sealed/PENDING.
- **Test:** does a visitor wonder "what comes after?" — and is the answer visible without scrolling away?

### 4.4 Activity feed
- **Wrong:** "every on-chain movement, newest first" — a chronological database viewer.
- **Right:** surface **significance**. New member? Milestone crossed? Chapter advancing? Liquidity deepening? Vault flow? The feed should answer *did something important happen today?* before answering *what was log index 47?*
- **Test:** a visitor returning after 24h should see *what changed*, not *what happened*.

### 4.5 Identity zone ("Your place in the archive")
- **Wrong:** member dashboard with fields (Member · Chapter · Rank).
- **Right:** **proof of being early**. Proof of participation. Proof of history. Identity is a feeling, not a row of fields.
- **Test:** does the connected state make a member want to screenshot it?

### 4.6 Liquidity page
- **Wrong:** pool metrics in isolation.
- **Right:** explain the *role* LP plays in the protocol narrative. Why does the pool exist? Why does deeper LP matter for everyone? What does becoming an LP mean inside the story?
- **Test:** a non-DeFi visitor should leave the page understanding *why they would care about liquidity at all*.

### 4.7 Hero
- **Wrong:** explains transparency.
- **Right:** sells **desire**. Transparency is the *proof*, not the *pitch*.
- **Test:** does the hero make a visitor want to read the next section?

### 4.8 "Coming Next" / anticipation sections
- **Wrong:** a short informational note.
- **Right:** one of the **strongest** sections on the site. Anticipation is the engine of return visits. Make the next milestone tangible, named, dated-or-event-triggered, and consequential.
- **Test:** does a visitor leave with a reason to bookmark?

### 4.9 Progress bars (membership, milestones)
- **Wrong:** generic UI component showing X / Y.
- **Right:** Netflix-episode / Kickstarter / Steam-wishlist progress. The bar is doing emotional work, not just numeric work.
- **Test:** does the bar create urgency *without* manufactured scarcity?

### 4.10 CTAs
- **Wrong:** "Buy SYN · Verify Everything" (functional).
- **Right:** aspirational + verifiable. The verb should be loaded with meaning (Claim · Enter · Take your seat) and immediately backed by a verifiable proof link.
- **Test:** does the CTA read like an invitation, not a button label?

---

## 5. How to use this framework

### 5.1 Before proposing
Write a one-paragraph proposal that includes:
- the surface being changed,
- the Five-Value Test filled in,
- which of the seven emotional questions the change answers,
- which hats give a `✓` and which give `⚠` / `✗`.

### 5.2 During audits
Every audit report under `docs/` must already end with the `## Decision Lens
Verdicts` 10-row grid (constitutional, see `docs/CONSTITUTION_SUMMARY.md`).
Audits that touch user-facing surfaces must **additionally** include a
`## Five-Value Test` block for each major surface reviewed.

### 5.3 During implementation
If the engineer notices a component drifting into "only engineering value",
pause the implementation and re-route through the framework. The framework
beats the spec when they conflict.

### 5.4 During review
Reviewer asks one question: *which of the five values does this raise, and
which of the seven emotional questions does it answer?* If the author cannot
name them, the change is not ready.

---

## 6. What this framework is **not**

- Not a license to write flowery copy. Aspirational ≠ vague. Every emotional
  claim must be backed by a verifiable on-chain proof.
- Not a license to invent scarcity, urgency, countdowns, or hype.
  Anticipation is built from **real** finite events (chapter close, vault
  activation, member number), never from manufactured timers.
- Not a replacement for the 10 Decision Lenses, the Five Pillars, the Vision
  document, or the Phased Roadmap — it **composes** with them.
- Not retroactive. Existing components are not deleted because they fail the
  framework; they are queued for redesign under the Phased Roadmap.

---

## Decision Lens Verdicts

| Lens | Verdict | Note |
|---|---|---|
| Founder | ✓ | Codifies the founder's repeated correction: emotion > correctness alone. |
| Investor | ✓ | Raises the floor on every future surface; reduces risk of "correct but cold" pages. |
| Growth | ✓ | Forces every change to declare a return/share reason. |
| Behavioral | ✓ | Seven emotional questions are the framework's spine. |
| UX | ✓ | Pattern translations target the exact failure modes seen on the live site. |
| Product | ✓ | Five-Value Test makes Story + Retention values first-class. |
| Staff Eng | ✓ | Composes with — does not replace — engineering correctness. |
| QA | ⚠ | Subjective dimensions (emotional / story value) need example-based calibration over time. Mitigation: §4 pattern translations grow as new cases appear. |
| A11y | ✓ | Hat #12 keeps a11y in the always-on set, not an afterthought. |
| SEO | ✓ | Hat #13 keeps structure/semantics in scope on every surface. |

**Gate result:** 0 ✗ + 1 ⚠ → **APPROVED, constitutional**.
The single ⚠ is a known calibration risk addressed by §4 growing over time, not a blocker.
