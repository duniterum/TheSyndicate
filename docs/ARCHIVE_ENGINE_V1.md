> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# Archive Engine — V1

> SYN is the seat. Artifacts are the memory of what happens around that seat.

## Scope of this slice

V1 ships the **public `/archive` route only**, no contracts, no fake state,
no homepage/footer/dashboard/join/activity edits. Everything is visible
under PENDING CONTRACT / LOCKED / PENDING ELIGIBILITY / SECRET. Target
launch prices are reference values only — nothing is charged.

Files:

- `src/lib/archive-config.ts` — single source of truth for categories +
  named artifacts + statuses + disclaimer.
- `src/routes/archive.tsx` — `/archive` page (hero, status notice,
  Current Chapter panel using `useProtocolTruth().chapterProgress`, nine
  category grid, named artifact grid, footer).
- `src/routes/sitemap[.]xml.ts` — `/archive` added to the public sitemap.

Out of scope for this slice:

- Homepage "Protocol Artifacts" teaser
- Footer heart secret modal
- `/join` post-purchase Seat Record panel
- Dashboard "My Syndicate" / "My Archive" module
- Activity feed artifact event types
- `/docs` `/faq` `/whitepaper` `/registry` `/transparency` artifact entries

These will be sequenced after `/archive` is stable on production.

## Constitutional gate verdicts

### Mythology & Cohort Identity gate
(See `docs/MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md`.)

| Term                  | Verdict | Note |
|---|---|---|
| Chapter Artifacts     | KEEP    | Layer = Chapters. Sealing rule = chapter sealing event. Prohibition: not transferable status. |
| Seat Records          | KEEP    | Layer = Cohorts of origin (Membership Sale purchase event). Sealing rule = purchase tx confirmation. Prohibition: no rank. |
| Genesis Founder Marks | KEEP    | Axis = Origin. Sealing rule = on-chain Genesis participation. Prohibition: no honorary additions. |
| Milestone Relics      | KEEP    | Layer = Named sealed events. Sealing rule = named trigger fires on-chain. |
| Liquidity Marks       | KEEP    | Axis = Witness. Sealing rule = LP event at trigger block. |
| Protocol Milestones   | RENAMED from "Vault Relics" — original name implied Vault ownership which every disclaimer denies. |
| Patron Seals          | REFRAMED — wealth tiers ($5/$19/$49/$99 + "Inner Patron Mark") dropped per Core Asset gate. Single flat support amount. Identity axis = none (does not confer cohort, rank, or witness status). |
| Secret Relics         | KEEP    | Layer = Named sealed events (discovery is the event). Prohibition: never advertised. |
| Legacy Artifacts      | KEEP    | Layer = Named sealed events (chapter/era sealing). Released only against permanent on-chain history. |

### Core Asset gate
- The scarce asset remains the SEAT. Artifacts are non-scarce memory
  records around the seat. None of the five constitutive facts
  (member# · chapter · founders · block-height · co-witness set) are
  altered or competed with by an artifact.
- Status remains positional, never wealth-coded. Patron Seal carries
  zero status; it is a support gesture.

### Trust model
- Every artifact carries an explicit pending/locked/secret status.
- No fabricated mint counts. No fake addresses. No "minted 123"
  placeholders anywhere.
- "Target launch price" copy is explicit so no visitor can read a
  reference value as a live price.

## Status vocabulary (artifact layer)

Distinct from `CanonicalStatus` (LIVE/PARTIAL/PENDING/DEMO) on purpose —
the canonical vocabulary describes a metric's trust state, not an
artifact's mint state.

| Status               | Meaning |
|---|---|
| PENDING CONTRACT     | Archive contract not deployed. |
| PENDING ELIGIBILITY  | Companion module not yet live. |
| LOCKED               | Will unlock at a named on-chain trigger. |
| SECRET               | Hidden discovery. Not advertised. |

## Open follow-ups (post-Slice-1)

1. Homepage "Protocol Artifacts" teaser block after Protocol Moments.
2. Footer heart symbol + Heart Signal modal.
3. `/join` post-purchase panel reading the canonical `chapterProgress`
   fact and the buyer's tx hash.
4. Dashboard "My Syndicate" route reading wallet + member status from
   `useHolderIndex`.
5. Activity feed artifact event placeholders.
6. Docs / FAQ / Whitepaper / Registry / Transparency entries.
7. Full pre-ads QA pass + new production lock report.

---

## Companion docs (Smart Contract phase preparation)

- `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md` — frozen visual doctrine.
- `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md` — metadata philosophy + open renderer decision.
- `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md` — frozen V1 token-id catalog.
- `docs/NFT_ARCHIVE_DESIGN_REFERENCES.md` — visual direction references (in `docs/design/`).
- `docs/SMART_CONTRACT_DECISIONS_PENDING.md` — open decisions to close before Solidity.
- `docs/NFT_ARCHIVE_SMART_CONTRACT_ARCHITECTURE_V1.md` — architecture (provisional pending renderer decision).
- `docs/NFT_ARCHIVE_SOLIDITY_SPEC_V1.md` — function-by-function spec (provisional pending renderer decision).

---

## Final Seat Record Architecture Decision (✅ LOCKED 2026-06-06)

Seat Records are **NOT** active ERC-1155 artifacts in `SyndicateArchive1155` V1.
They will ship later in a **separate ERC-721 contract**
(working name `SyndicateSeatRecord721` / `SyndicateSeatRegistry721`)
once membership eligibility is enforceable on-chain.

Token ID 2 in `SyndicateArchive1155` is a **reserved + disabled pointer**:
`active = false`, `ownerOnly = true`, `rendererMode = NONE`,
`maxSupply = 0` (LOCKED / NOT MINTABLE), `walletLimit = 1`,
`priceUsdc = 0`. All mint paths revert; `uri(2)` reverts.

Contract-wide V1 rule: **`maxSupply == 0` means LOCKED / NOT MINTABLE**.
It does **NOT** mean unlimited. No V1 artifact is unlimited.

Allowed wording: *"Seat Records are reserved for a future ERC-721
identity contract."* / *"Archive1155 V1 records collectible protocol
artifacts."* / *"ID 2 is reserved and disabled in V1."* /
*"SYN is the seat. Artifacts are the memory."*

Canonical decision doc: `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`.
