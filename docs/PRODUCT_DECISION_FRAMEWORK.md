# THE SYNDICATE — PRODUCT DECISION FRAMEWORK

This is the filter every new feature must pass through **before** any code
is written. It supersedes the Wave-3A "six pillar" product test for
go/no-go decisions and works alongside the Stop Building Test in
`MVP_ECOSYSTEM_ROADMAP.md`.

If a proposed module cannot answer most of the questions below with a
strong YES, it is **deferred** or **rejected** — never built "just because
it sounds useful."

---

## The 12 Questions

For every feature, answer YES / NO honestly. No "kind of."

1. **Transparency** — Does it improve transparency?
2. **Identity** — Does it strengthen member identity?
3. **Memory** — Does it preserve or reveal protocol history?
4. **Momentum** — Does it reveal real activity or real progress?
5. **Shareability** — Does it create something worth sharing?
6. **Verification** — Can it be verified onchain or via a clearly
   disclosed source?
7. **Simplicity** — Would a first-time visitor understand it within
   5 seconds?
8. **Legal Safety** — Does it avoid implying returns, rewards, dividends,
   treasury claims, or financial entitlement?
9. **Complexity** — Does it avoid unnecessary dependencies, new
   infrastructure, or technical debt?
10. **MVP Reality** — Would we still build this if we only had 25 real
    members?
11. **User Feedback** — Is this solving a real observed need, or just
    something that sounds cool?
12. **Modularity** — Can it be built as an isolated module without
    breaking the current architecture?

---

## Decision Matrix

| YES count | Strong-NO present | Decision |
|---|---|---|
| 10–12 | none of #7, #8, #9, #10 | **BUILD** |
| 7–9   | none of #7, #8, #9 | **DEFER** — revisit after more usage |
| ≤6    | any | **REJECT** |
| any   | NO on #8 (Legal Safety) | **REJECT — automatic** |
| any   | NO on #7 (Simplicity) | **REJECT until simplified** |

### REJECT if the feature mainly adds:
- complexity
- fake urgency
- fake rewards
- status competition
- wealth signaling
- unverifiable claims
- dependency risk
- legal ambiguity

### DEFER if:
- the value only appears at meaningful community scale
- the previous related surface has not been validated by real use
- it requires infrastructure we don't yet need (indexer, subgraph,
  caching layer, off-chain service)
- it can be honestly represented as `PENDING` instead of built now

---

## How to use it

1. Write the proposal in one paragraph.
2. Score the 12 questions in a table.
3. Apply the decision matrix.
4. Record the decision in the relevant spec doc or roadmap entry.

Decisions are written down so future contributors can see **why** a
feature was deferred or rejected — preventing the same idea from being
rebuilt-and-rejected on every cycle.

---

## Worked example — Wealth Leaderboard (REJECT)

| # | Question | Answer |
|---|---|---|
| 1 | Transparency | YES |
| 2 | Identity | NO — flattens identity into a single number |
| 3 | Memory | NO |
| 4 | Momentum | NO — encourages whale-watching, not protocol activity |
| 5 | Shareability | YES (but for wrong reasons) |
| 6 | Verification | YES |
| 7 | Simplicity | YES |
| 8 | Legal Safety | NO — implies wealth ranking matters in a financial protocol |
| 9 | Complexity | YES |
| 10 | MVP Reality | NO |
| 11 | User Feedback | NO |
| 12 | Modularity | YES |

NO on #8 → automatic REJECT. Recorded so it is never re-proposed.
