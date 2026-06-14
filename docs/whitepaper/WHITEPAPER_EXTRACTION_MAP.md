# Whitepaper Extraction Map

**Status:** extraction source material — NOT a new canon layer.
**Precedence:** On-chain truth → code registries → execution gates → canonical
docs → this map. **Code outranks docs.** Where this document and the code ever
disagree, the code (and the chain it reads) is correct and this file is wrong.

This map exists so a future whitepaper can be assembled section-by-section
without inventing anything. Each section below states (a) the one-paragraph claim
a reader needs, (b) the **source of truth** to quote from, and (c) the figures
or disclaimers that must travel with it. Refresh every number from the live code
before publishing — do not copy stale values out of this file.

Every public claim must map to an on-chain read or be clearly labeled PENDING.
"Don't trust, verify."

---

## 1. Membership

**Claim.** The Syndicate is an on-chain membership protocol on Avalanche C-Chain
(43114). You join by buying the SYN token with USDC. Each member receives a
permanent, verifiable, numbered seat in the archive. The product is identity and
belonging — not financial return.

**Source of truth.**
- Doctrine: `replit.md` (Overview + Core doctrine), `docs/VISION.md`,
  `docs/SYNDICATE_PROTOCOL_MODEL.md`, `docs/canon/`.
- Live entry copy: `src/components/syndicate/WhyJoinSimple.tsx`,
  `src/components/syndicate/HowToJoinSteps.tsx`.
- Chain identity: holder index / member numbers in `src/lib/holder-index.ts`,
  protocol totals in `src/lib/protocol-pulse.ts`.

**Must travel with it.** Membership is recorded by the network, not by the team:
member number, chapter, and join date are read from the chain.

---

## 2. Packages

**Claim.** A "package" is simply a featured entry amount. Each package maps 1:1
to an existing recognition tier and to the SYN you receive at the live Genesis
access rate. A package is **not** a better rate, a payout, or an entitlement.

**Source of truth.**
- Config (the source): `src/lib/package-catalog.ts` (`SEAT_PACKAGES`,
  `featuredPackages()`, `nextSeatPackage()`), derived 1:1 from `RANKS_V2` in
  `src/lib/syndicate-config.ts`. Never hand-maintain a parallel package table.
- Surfaces: homepage `src/components/syndicate/HomeProgressionTeaser.tsx`;
  `/join` `src/components/syndicate/JoinPackages.tsx` (`SeatPackages`);
  `/my-syndicate` cockpit `CockpitNextMove` "Package" card;
  FAQ `src/components/syndicate/FaqRebuilt.tsx`.

**Must travel with it.** Featured set today: Citizen, Operator, Vanguard,
Steward (names + USDC). Recognition only — no payout, no rate change, no
entitlement.

---

## 3. Chapters vs Eras

**Claim.** Two independent coordinate systems sit over the same members.
**Chapters** are the *story* axis (narrative boundaries that seal at member
counts: 333 / 1,000 / 3,333 / 10,000 / Open Era). **Eras** are the *distribution*
axis (a pricing schedule). They are not the same thing and must not be conflated.

**Source of truth.**
- Chapters: `src/lib/chapters.ts` (`getActiveChapter`), archive boundaries in
  `src/lib/archive-config.ts`.
- Eras: `src/lib/eras.ts` (`ERAS`, `currentEra`, `eraSynPerUsdc`,
  `synForUsdcInEra`, `ERA_SCHEDULE_NOTE`).

**Must travel with it.** Genesis (Era I, seats #1–#333) is the ONE live rate.
Eras II–IX are a **proposed** future distribution model — PENDING, not live, and
contingent on a future sale contract before any of it takes effect.

---

## 4. Ranks

**Claim.** Rank is **recognition only**, derived from cumulative USDC routed. It
is monotonic, confers no rights/returns/discounts, and is subordinate to a
member's seat and cohort. Twelve fixed tiers from $5 to $10,000.

**Source of truth.**
- Config (the source): `RANKS_V2` in `src/lib/syndicate-config.ts`;
  derivation `rankForSyn()`.
- Surfaces: `RankLadder` in `src/components/syndicate/Sections.tsx`
  (incl. "Why no discount?" / "Reading the ladder" clarity copy); `/ranks`.

**Must travel with it.** Tier names are recognition labels on one fixed-rate
ladder, ordered only by USDC threshold — e.g. Architect ($250) comes before
Steward ($500). A name never buys a better rate, a payout, or different
treatment. See §10 for the (future-only) naming-order note.

---

## 5. DEX price vs sale price

**Claim.** There are two independent prices. The **access rate** is the
protocol's own sale rate for taking a seat (1 SYN = $0.01 USDC, fixed). Once you
hold SYN it may also trade on the open market (Trader Joe) at a separate,
market-set price. The access rate is not a market quote, and the two are
independent.

**Source of truth.**
- Access rate: `ACCESS_RATE_USDC_PER_SYN` in `src/lib/syndicate-config.ts`.
- Two-price note: `EraSchedulePreview` in
  `src/components/syndicate/JoinPackages.tsx` (sale-vs-DEX paragraph).
- Reference market-cap/FDV framing uses the FIXED access rate, never LP spot
  (see Protocol Intelligence Bar).

**Must travel with it.** Never imply the access rate is a floor, a peg, or a
market value.

---

## 6. Future utility

**Claim.** Beyond the live membership sale, additional modules are described as
PENDING / proposed. They are labeled as future and must never be presented as
live or as a promise.

**Source of truth.**
- Future modules surfaced as PENDING in `/my-syndicate` cockpit
  (`CockpitNextMove` "Explore all moves") and the route "What's Building" zone.
- Distribution eras II–IX: `src/lib/eras.ts` (status FUTURE/PROPOSED).

**Must travel with it.** Each future item keeps a PENDING status pill and
proposed/advisory language until a contract ships.

---

## 7. Marketplace

**Claim.** A secondary marketplace for seats and artifacts is a **future
module** — not live.

**Source of truth.**
- `CockpitNextMove` "Marketplace" move (status PENDING, "future module").

**Must travel with it.** PENDING; no trading venue exists yet inside the
protocol.

---

## 8. Signal Chamber

**Claim.** Member "signals" are an **advisory, future module**. Signals are a
deterministic Event→Signal layer; they confer no governance and never imply
return. A person/money signal can never on its own raise a tier or confer rights.

**Source of truth.**
- Doctrine: `docs/canon/` foundation (5-layer model; Adjacency Law;
  money/signal guardrail).
- Code: signal registry / deriver in `src/lib/` (signal-registry); quarantined
  money-weighted scores (A/B/C/D).

**Must travel with it.** Advisory only; PENDING; reads EVENTS only.

---

## 9. Legal exclusions

**Claim.** SYN is an experimental utility membership token. It is **not equity,
not a security, and not a promise of profit**. Rank is recognition only and
confers no rights, returns, or discounts. Joining may result in total loss.

**Source of truth.**
- Live disclaimer copy (guard-safe, already on site):
  `src/components/syndicate/WhyJoinSimple.tsx`,
  `src/components/syndicate/RiskDisclaimer.tsx`.
- Doctrine: `replit.md` Core doctrine; `docs/canon/`.

**Must travel with it.** This exact framing must appear wherever SYN is
described to the public.

---

## 10. Future decisions (NOT changed in this pass)

These are recorded so the whitepaper can note them as open questions. **None are
implemented; nothing is renamed or reordered in code.**

- **Rank naming order.** "Architect" ($250) currently sits below "Steward"
  ($500) by USDC threshold. Some readers expect "Architect" to read as more
  senior. Any rename or reorder is a future governance decision — out of scope
  here. Until then, the clarity copy in §4 makes the fixed-threshold ordering
  explicit so the ladder reads intentionally.
- **Eras II–IX.** Remain proposed; activation requires a future sale contract.
- **Marketplace / Signal Chamber / Referral.** Remain PENDING future modules.

---

## Sync & lint checklist (before any whitepaper publish)

1. Re-read every figure from code: access rate, min entry → SYN, chapter
   boundaries, era schedule, rank thresholds, featured packages.
2. Confirm LIVE vs PENDING labels match the code's status for each module.
3. Confirm the §9 legal framing is present and unaltered.
4. Run the wording guards (`scripts/check-ownership-wording.mjs`,
   `check-visitor-vocabulary.mjs`, `check-preview-labels.mjs`) over any new
   site-facing copy that derives from this map.
5. Remember: if this map and the code disagree, the code wins — fix the map.
