# Sprint 1 — Infinite-Game Surfaces (frontend / config / docs)

> **Scope guard.** This sprint is **additive frontend, config, and docs only.**
> No smart-contract changes, no V1 / Genesis behaviour changes, no deploy, no
> canon renames. Every claim below maps to live code (`src/lib/syndicate-config.ts`,
> `src/lib/eras.ts`, `src/lib/package-catalog.ts`) or is explicitly labeled
> **PROPOSED / FUTURE**. Source-material doc — downstream of code per
> `docs/canon/04_DOC_SYNC_CHECKLIST.md`. Code outranks this doc.

## 1. The journey (what a member sees, in order)

`Join → Seat → Rank → Package → Artifact → Referral → Chronicle → Marketplace →
Signal Chamber`. The cockpit motto: **"I have a seat. Now I know my next move."**
The new `CockpitNextMove` orchestrator answers that motto with **one** primary
recommended step plus a compact grid of onward moves that point at surfaces that
already exist on the page — it summarises, it does not re-implement.

## 2. Seat packages (recognition only)

A "package" is **a featured entry amount**, nothing more. Each featured package
is derived 1:1 from an existing recognition tier in `RANKS_V2` — **no new names,
no new thresholds.** A package shows: entry USDC · SYN received at the live
Genesis access rate (`1 SYN = $0.01 USDC`) · the recognition tier it reaches.

- Recognition only — **no payout, no rate change, no entitlement, no bonus tokens.**
- A custom amount above the `$5` minimum behaves identically; packages are a
  convenience, never a privileged path.
- Source: `src/lib/package-catalog.ts` (`featuredPackages`, `nextSeatPackage`).

## 3. Distribution eras (one live rate today; a proposed schedule ahead)

A **second** coordinate system layered on top of the canonical Chapters (which
are untouched). Chapters are the **story** layer; eras are the **distribution**
layer — the proposed access-rate schedule as the archive fills.

| Era | Name | Members | Seats | Entry | SYN / entry | Status |
|----:|------|---------|------:|------:|------------:|--------|
| I | Genesis | #1 – #333 | 333 | $5 | 500 | **LIVE** |
| II | First Thousand | #334 – #1,000 | 667 | $10 | 500 | PROPOSED |
| III | The Expansion | #1,001 – #3,333 | 2,333 | $10 | 400 | PROPOSED |
| IV | First Ten Thousand | #3,334 – #10,000 | 6,667 | $25 | 400 | PROPOSED |
| V | Open Era I | #10,001 – #25,000 | 15,000 | $25 | 300 | PROPOSED |
| VI | Open Era II | #25,001 – #50,000 | 25,000 | $50 | 300 | PROPOSED |
| VII | Hundred Thousand | #50,001 – #100,000 | 50,000 | $50 | 200 | PROPOSED |
| VIII | Quarter Million | #100,001 – #250,000 | 150,000 | $100 | 200 | PROPOSED |
| IX | First Million | #250,001 – #1,000,000 | 750,000 | $100 | 100 | PROPOSED |

- Capacities sum to **exactly 1,000,000** seats (the "First Million").
- **Only Era I (Genesis) is LIVE.** Eras II+ are a proposed future distribution
  model — **not live**, and contingent on a future sale contract before any of
  them could take effect. Every surface that shows a future era labels it as such.
- Eras I–IV share the Chapter I–IV member-number boundaries exactly; Eras V–IX
  all fall inside Chapter V (Open Era).
- Source: `src/lib/eras.ts`. Reconciliation math:
  `docs/proposals/ERA_ENGINE_V2_RECONCILIATION_SPRINT0.md`.

## 4. Two-price doctrine (sale rate vs. open market)

The **Genesis access rate** (`1 SYN = $0.01 USDC`) is the protocol's own **sale
rate** for taking a seat. Once held, SYN may **also** trade on Trader Joe at a
separate, **market-set** price. The two are **independent**:

- The access rate is **not** a market quote.
- The market price is **not** the access rate.
- Neither is a peg, a floor, a guarantee, or a promise of return.

## 5. Signal Chamber (advisory, future)

A **planned future module** that would surface member signals derived from
on-chain activity. **Advisory only, clearly PENDING:**

- Not live; confers no rights; never influences the sale rate, rank, or any value.
- Would only **describe** what is already on-chain — never predict price, never
  promise a return.

## 6. Doctrine compliance

- No guard-blocked financial vocabulary — nothing that implies a return, payout,
  yield, ownership stake, dividend, revenue share, peg, or price floor.
- No gamification vocabulary in the cockpit (the guard blocks "next rank",
  "rank up", and the usual point/score/streak terms). Tiers are named directly
  instead (e.g. "Reach Steward").
- Rank stays **recognition only**, derived from cumulative USDC.
- LIVE vs PENDING is never mixed; future surfaces are always labeled.
- Enforced by the existing wording guards and doctrine tests — see
  `docs/canon/04_DOC_SYNC_CHECKLIST.md`.
