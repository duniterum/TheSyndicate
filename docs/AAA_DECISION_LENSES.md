# The Syndicate — AAA Decision Lenses

Status: **binding** for every future decision (implementation, redesign,
feature, refactor, audit, recommendation, copy change, removal).

No decision is considered complete until it has been evaluated against
**all ten lenses simultaneously**. A solution that satisfies only one
lens is incomplete. Optimization for one lens at the expense of the
others is discouraged. The best solution is the one that remains strong
across all lenses at once.

This document supersedes any prior single-axis test ("triple test",
"five pillars test", "10-second test"). Those tests remain useful as
inputs, but the lens grid is the gate.

---

## The ten lenses

### 1. Founder Lens
Strengthens vision · clarity · trust · momentum · long-term growth.
**Gate question:** *Would I personally approve this if it represented
the protocol publicly?*

### 2. Investor Lens
Increases credibility · transparency · confidence · understanding.
**Gate question:** *Would a serious investor trust the protocol more
after seeing this?*

### 3. Growth Lens
Improves discovery · sharing · participation · retention.
**Gate question:** *Would this help the protocol grow organically?*

### 4. Behavioral Psychology Lens
Improves curiosity · anticipation · identity · progression · habit
formation.
**Gate question:** *Does it make a visitor want to come back tomorrow?*

### 5. UX Lens
Obvious · intuitive · discoverable · frictionless.
**Gate question:** *Can a first-time visitor understand it immediately?*

### 6. Product Lens
Solves a real user problem · page purpose is clear · creates a logical
next step.
**Gate question:** *What is the next action this enables, and is it
obvious?*

### 7. Staff Engineer Lens
Scalable · maintainable · testable · future-proof.
**Gate question:** *Will this still work at 10×, 100×, 1000× scale?*

### 8. QA Lens
Can it fail · can it break · can stale data appear · can contradictory
states exist.
**Gate question:** *What are the empty / loading / error / stale /
conflicting states, and are they all handled?*

### 9. Accessibility Lens
Keyboard · screen reader · contrast · responsive layouts.
**Gate question:** *Can everyone use it?*

### 10. SEO Lens
Semantic structure · crawlability · relevance · discoverability.
**Gate question:** *Would search engines better understand the protocol
because of this?*

---

## Required evaluation format

Every non-trivial decision must produce a lens grid. Compact form:

```text
Lens              Verdict   Notes
Founder           ✓         …
Investor          ✓         …
Growth            ✓         …
Behavioral        ⚠         needs follow-up on …
UX                ✓         …
Product           ✓         …
Staff Engineer    ✓         …
QA                ⚠         empty-state pending
Accessibility     ✓         …
SEO               ✓         …
```

Verdicts: `✓ pass` · `⚠ partial — list the gap` · `✗ fail — do not ship`.

A single `✗` blocks the decision. Two or more `⚠` blocks the decision
unless the gaps are explicitly accepted with a follow-up task.

---

## When the rule applies

- New features and pages
- Component additions, removals, demotions, archival, deletion
- Copy changes that affect framing, anticipation, or trust
- Data-source changes
- Route additions and removals
- SEO / metadata changes
- Performance and refactor work
- Audit reports and recommendations

When in doubt: apply the grid.

---

## Conflict resolution

When lenses conflict (e.g. Growth wants share buttons everywhere; UX
says they add noise), the resolution order is:

1. **Vision / Constitution** — see `docs/VISION.md`. Vision wins.
2. **Trust and Transparency** — never traded for growth or aspiration.
3. **Member-first** — see `mem://features/member-first`.
4. **The remaining lenses** — balance, do not stack-rank.

If a proposal cannot be made strong across all lenses, the correct
move is usually to **redesign the proposal**, not to override a lens.
