---
name: cockpit co-witness band (Seats Around You)
description: /my-syndicate neighbour strip — why neighbour wallets are allowed, and the shared isError gating gap with Wake.
---

`/my-syndicate` has a "Seats around you / co-witnesses" band below the One Seat
panel: nearest earlier member, your seat, nearest later member. Built from
`useHolderIndex().ordered` (member-number order); member numbers are contiguous
first-purchase order, so array neighbours ARE seats N−1 / N+1. The "open" next
seat uses `totals.nextMemberNumber` (= ordered.length + 1) — real, not faked.

**Neighbour wallet display is doctrinally OK (not a leaderboard).**
**Why:** `/members` already renders shortened public wallet addresses and links to
`/wallet/$address`, so showing a neighbour's `0x…` on the cockpit is strictly less
data than the existing archive. It stays a co-witness surface (position + identity
only) as long as it carries NO amounts, NO rank, NO USDC, NO standing/comparison.
**How to apply:** never add value/rank/"ahead-behind" framing to this band, or it
becomes the leaderboard the doctrine forbids.

**Shared member/visitor gating gap (Wake + Seats).**
Both `WakeBehindYou` and `SeatsAroundYou` decide member-vs-visitor from
`record` presence + `idx.isLoading` only — they do NOT check `idx.isError`. On a
RESOLVED-WITH-ERROR read (isError true, isLoading false, record undefined) they
assert non-membership (Join CTA / "no seat for this wallet yet") to a wallet that
may actually be a member.
**Why:** copied gating pattern, deferred as non-blocking polish.
**How to apply:** if you add an `isError` branch, add it to BOTH bands together —
fixing one leaves the inconsistency.
