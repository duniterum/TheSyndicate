---
name: Cockpit member/visitor truth-gating
description: Why any /my-syndicate cockpit component that branches "member vs visitor / join CTA" must gate on idx.isLoading, not just on record presence.
---

# Cockpit member/visitor branches must gate on the index loading state

In the /my-syndicate cockpit, a component derives "am I a member?" from
`record = idx.getByWallet(address)`. **During `idx.isLoading`, an existing
member's `record` is briefly `undefined`** — the holder index resolves from the
indexed `TokensPurchased` snapshot asynchronously.

**Rule:** any component that shows a *visitor* / "Join now" / "Would join …" /
"anchor your seat" branch must first check `isConnected && idx.isLoading` and
render a quiet pending shell (or null), NOT the visitor branch. Otherwise a
real member is momentarily told to "Join now" mid-load — a transient false
statement.

**Why:** caught in architect review of the Visible Cockpit Identity Pass —
`WakeBehindYou` asserted the visitor CTA before the read settled, contradicting
its own "show nothing while reading" doctrine comment. Painting *no fabricated
numbers* (count gated on `idx.hasData`) is not enough; the member/visitor
*classification itself* is a truth claim.

**How to apply:** order the branches as (1) `if (record) {…member…}` →
(2) `if (isConnected && idx.isLoading) {…pending…}` → (3) visitor/default.
Note `CockpitBadges` still has this pre-existing window with its "Would join …"
pill — acceptable today (no hard CTA) but fix it the same way if it ever grows
a join action.
