---
name: Global navigation IA doctrine
description: Durable decisions about what the global nav (Header/Footer) exposes and why — the artifact/museum split, restrained story-layer discovery, and the footer grid lockstep.
---

# Global navigation / information-architecture doctrine

## /nft (Artifacts) vs /archive (museum) are DISTINCT pages
- `/nft` (+ `/nfts` alias) render `NftPage` = the **mint / ownership** product surface
  (The First Signal, Patron Seal). `/archive` renders a **different** component
  `ArchivePage` = the **museum / protocol-memory** view (mythology wall, how-it-works,
  sealed artifacts). Both `<link rel=canonical>` point to `/nft` for SEO consolidation,
  but they are NOT the same experience.
- The header PRIMARY item for the mint surface is labeled **"Artifacts" → /nft**.
  **Why:** the prior label "NFT / Archive" → /nft was a collision — it named "Archive"
  but routed to the mint page, while the real museum (`/archive`) was a separate More
  item also called "Archive". "Artifacts" matches the route's own canonical vocabulary
  and stops reducing the surface to generic "NFT".
- The More item **"Archive" → /archive** is the museum (hint disambiguates it as such).
- **Pitfall:** the `sitemap[.]xml.ts` comment once wrongly said "/archive renders the
  same experience as /nft" — code is authoritative; they differ. Keep that comment honest.

## Story / protocol-memory layer = restrained discovery (deliberate)
- `/chronicle`, `/institutional-register`, `/knowledge-map` are intentionally **NOT** in
  the header PRIMARY or More menu. Their global-nav home is a **Footer "Record" column**.
  They are also reachable via in-page cross-links (registry/transparency/activity/StorySoFar).
- **Why:** these surfaces are early/partial (Chronicle "Open"/locked entries; register
  active+draft; knowledge-map LIVE/PARTIAL/DEMO/PENDING). Promoting them to primary nav
  would overpromise. Footer presence fixes the discoverability gap without inflating status.
- **How to apply:** do not promote them to primary/More in a future pass unless their
  truth/status clearly supports it (a founder-level call), and never imply they are
  finished/published beyond what each page already asserts.

## Footer grid is column-count locked
- The footer grid is `lg:grid-cols-N` where N = 1 brand column + (number of `COLS`
  entries). Currently `lg:grid-cols-8` = brand + 7 content columns (Protocol, SYN,
  Members, Learn, Verify, Record, Legal). **Adding/removing a footer column requires
  updating the `lg:grid-cols-*` count in lockstep** or the last column wraps awkwardly.
