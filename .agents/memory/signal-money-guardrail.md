---
name: Money / Signal guardrail
description: How money-derived data may surface in The Syndicate and the hard line that stops it becoming prestige; the quarantine + its forward-looking enforcement gap.
---

# Money may describe participation, never decide who matters

Canonical doc: `docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md` (binding, sibling to 05).

**The rule.** Money-derived data MAY feed Rank (recognition), the Financial
Trace (a member's verifiable economic-participation history), Member Journey,
Reports/Ledger/Activity. Money MUST NOT, by itself: raise a Signal tier above
S2, create an S3+ signal, create a Chronicle candidate, confer governance, or
imply ROI/yield/dividend/reward. ("Size never raises tier" — 05 §3–4.)

**Why:** the §D contradiction recurs — VISION says rank/standing ≠ wealth, yet
money is the easiest thing to rank by. Without a hard quarantine a future Signal
Engine would silently consume spend as prestige and re-introduce the leaderboard
the protocol explicitly rejects.

**Quarantine (A/B/C/D classification).** Money-weighted scores live behind a
`QUARANTINE: money-weighted score` code marker:
- `archiveWeight` / `computeScore` in `leaderboard-hooks.ts` (= `sqrt(usdc) × (1 + log2(1+purchases))`).
- `builderScore` / `commissionPct` / `commissionUsdc` / `grossCommissionUsdc` in `preview/referral.ts`.
Classes: A = display only · B = Financial-Trace-eligible · C = forbidden for
prestige (recognition/chronicle/signal) · D = simulated/preview only.

**Enforcement (code):** `src/lib/__tests__/signal-money-guardrail.test.ts`
asserts the prestige-deriving modules `recognition-candidates.ts` and
`chronicle-candidates.ts` contain none of the money-score tokens and never import
`leaderboard-hooks` / `preview/referral`, and that both quarantine markers stay.

**How to apply / KNOWN GAP:** the guard only scans the two prestige modules that
exist today and only checks direct file content (indirect re-export laundering is
not caught). **When the Signal Engine module lands, it MUST be added to
`PRESTIGE_MODULES` in that test** or the guard's stated purpose is unenforced.
Member Journey / Financial Trace views are PENDING (bucket 12) — build only after
the Signal Engine, presenting the Trace as memory, never as return/reward.
