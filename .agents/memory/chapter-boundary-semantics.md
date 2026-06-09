---
name: Chapter boundary semantics (seals vs opens)
description: The off-by-one trap when phrasing chapter/member-number thresholds in UI copy.
---

A Syndicate chapter **seals at `endN`** but the **next chapter opens at `next.startN`** (= `endN + 1`).

**Why:** Genesis Signal is #1–#333 (`endN = 333`); First Thousand opens at **#334**, not #333. Any "next chapter opens at #…" copy that uses the current chapter's `endN` is off by one and misstates the next real member-number milestone. Same trap at every transition: #333/#1,000/#3,333/#10,000 seal, next opens at #334/#1,001/#3,334/#10,001.

**How to apply:** For "opens at" / "next milestone" copy use `next.startN` (fallback `endN + 1`). For "seals at" / "fills at" copy use the current chapter's `endN`. `getRemainingSeats(memberCount)` returns seats until the active chapter *seals* (= `endN - memberCount`) — correct to pair with a "seats until next opens" sentence because hitting 0 means the next seat is `startN`. Open Era is uncapped (`endN === null`): no next, no bar, no threshold.
