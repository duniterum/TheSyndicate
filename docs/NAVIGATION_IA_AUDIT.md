# THE SYNDICATE — NAVIGATION & INFORMATION ARCHITECTURE AUDIT

Audit only. Recommendations not implemented.

---

## Current header nav (from `Header.tsx`)

5 groups, 16 items total:

- **Explore**: Home, Roadmap, Activity
- **Protocol**: Transparency, Vault, Liquidity, Registry
- **Learn**: Docs, Whitepaper, FAQ
- **SYN**: Token, Tokenomics, Join
- **Community**: Members, Founders, Chapters, Ranks

Plus: wallet chip (right side).

## Mobile drawer
Same groups, stacked. Wallet chip persistent in header.

## Footer sitemap
Mirrors header groups; build stamp pinned bottom.

## Breadcrumbs
Component exists (`Breadcrumbs.tsx`), not mounted on most routes.

---

## Findings

### Group balance
- 5 groups is on the upper limit for usable horizontal nav. Borderline OK
  on desktop, dense on mobile.
- **Join sits inside SYN group** — should be more prominent. The primary
  conversion target is hidden two layers down.
  → Flag: consider promoting Join to its own top-level item OR a persistent
  button next to the wallet chip.

### Naming / clarity
- **Docs vs Whitepaper vs Tokenomics**: three knowledge surfaces. A first-time
  visitor cannot predict the difference. Recommend unifying under Docs as
  sub-pages (deferred).
- **Vault**: ambiguous without context (wallet vs reserve vs contract).
  Group label helps but consider renaming to "Treasury" externally — only if
  it does not collide with banned vocabulary. **Verdict: keep "Vault"; rely
  on disambiguation.**
- **Activity** vs **Transparency** vs **Registry**: all proof-flavored.
  Acceptable distinction (events / verification / addresses) but a new user
  may not differentiate.

### Discoverability tests
- "Can a first-time visitor find Join?" — Yes, but only because Hero CTA is
  loud. Through nav alone: 2 clicks (SYN → Join). **Friction.**
- "Can a verifier find Transparency?" — Yes, top-level in Protocol group.
- "Can a member find wallet/rank?" — Wallet via header chip; rank via
  Community → Ranks. ✅
- "Can a founder find Founders?" — Community → Founders. ✅
- "Docs vs Whitepaper vs Tokenomics?" — **No**, unclear distinction.

### Order / hierarchy
- Explore → Protocol → SYN → Community → Learn order is reasonable.
- "Explore" as a group label is weak (covers Home + Roadmap + Activity).
  Acceptable.

### Hidden / orphan items
- `/ai`, `/nfts`, `/episodes` — not in nav, reachable by URL. See route
  audit.

### Breadcrumbs
- Missing on deep links (`/wallet/$address`, `/chapters/$slug`,
  `/milestone/$id`). Flag — primitive exists; mount in a later pass.

### Footer
- Footer mirrors header. Good for SEO + sitemap. No issues.

### Internal linking density
- Strong on `/transparency` (cross-links to registry, liquidity).
- Weak on `/tokenomics`, `/whitepaper`, `/roadmap`, `/registry`, `/faq`
  (dead-end pages — see UX audit).

---

## Recommendations (do not implement now)

| # | Rec | Reason |
|---|---|---|
| 1 | Promote Join to a persistent top-level CTA next to wallet chip | Conversion |
| 2 | Add bottom-of-page Join + Verify CTA to dead-end pages | Stops drop-off |
| 3 | Unify Docs / Whitepaper / FAQ under one Learn surface long-term | Clarity |
| 4 | Mount Breadcrumbs on deep-link routes | Orientation |
| 5 | Hide or delete `/ai`, `/nfts`, `/episodes` until they are real | Trust |
| 6 | Add a sticky mobile Join CTA | Mobile conversion |
| 7 | Consider merging Community surfaces (members/founders/chapters) into one Identity hub long-term | IA simplification |

None of these are blockers for real-user testing — they are the highest-leverage
non-feature improvements available.
