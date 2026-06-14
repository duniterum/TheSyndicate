---
name: /member/$number vs /wallet/$address route roles
description: Division of labour between the human member-profile route and the wallet verification route, plus the share-URL preference rule.
---

# /member/$number (human surface) vs /wallet/$address (verification surface)

Two public per-entity routes, intentionally split — **do not blur them**:

- **`/member/$number`** — the *human* surface, addressed by founder number
  (`/member/27`). Recognition only: Member #N → chapter → rank → verified-on-Avalanche
  → short wallet + explorer link → share card → recognition-only stat band →
  seats-around neighbours. "The page you send to a person." It is a **pure read-only
  projection of `useHolderIndex()`** — no new data layer, no connected-wallet reads.
- **`/wallet/$address`** — the *verification* surface. Full purchase trail, 70/20/10
  routing totals, eligibility flags, live balance. Also handles Member/Holder/Unknown
  states. "The page you send to a skeptic."

**Why:** founder doctrine (canon `07` FS-3) — a human identity URL must not lead with a
raw `0x` address, but verification ("don't trust, verify") must always be one tap away.

**How to apply:**
- Member resolution: `idx.ordered.find(r => r.founderNumber === n)`. Founder numbers are
  contiguous 1..N (`founderNumber === memberNumber`), so `n <= totals.members` ⟹ a record
  exists; the only no-record branches are beyond-wall (`n > totals.members`) and empty-wall
  (`totals.members === 0`). Gate strictly: record → loading(`isLoading`) → error(`isError`)
  → not-yet, in that order.
- **Share-URL preference rule:** share cards on `/member`, `/wallet/$address`, and
  `/my-syndicate` (MemberCockpit) all prefer the `/member/N` URL for `cardUrl` + `shareUrl`
  base; `buildReferralShareUrl(memberUrl, founderNumber)` still appends `?ref=N`. Address
  search on `/members` keeps going to `/wallet/$address`; number search goes to `/member/N`.
- **SSR safety:** `/member/$number` reads only `useHolderIndex` (purchase-event scan), never
  `useAccount`/connected balances — so it does NOT inherit the wallet-gated hydration/BigInt
  crash class. Keep it that way; don't add connected-wallet reads to this route.
- **Sitemap:** both are dynamic per-entity routes — never enumerate in `sitemap[.]xml.ts`
  (unbounded; crawlers reach members via the `/members` wall). A static `/member` entry
  would 404.

**Future direction (NOT built):** richer enrichment (embedded activity/artifacts/Chronicle,
per-member OG image), Genesis Seat Certificate (FS-4), Protocol Search (FS-5), Protocol
Timeline (FS-6) — all recorded as approved-direction in canon `07`, none implemented.
