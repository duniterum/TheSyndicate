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

**Shared member/visitor gating order (Wake + Seats) — keep in lockstep.**
Both `WakeBehindYou` and `SeatsAroundYou` gate in this exact order:
`record` (member) → `isConnected && isLoading` (pending) → `isConnected && isError`
(quiet PARTIAL: "Unable to read your seat/the seats right now…", no count, no
neighbours, no "no seat", no Join CTA) → connected-non-member / visitor preview.
**Why:** on a RESOLVED-WITH-ERROR read (isError true, isLoading false, record
undefined) a real member would otherwise be shown visitor/"no seat" language. The
record branch is first so a cached member always wins; isError sits before any
non-membership assertion.
**How to apply:** never reorder these branches, and if you change one band's
gating, change BOTH — they are intentionally identical. SeatsAroundYou's Shell
takes `status: LIVE|PARTIAL|PENDING` (canonical StatusPill), not a boolean.
