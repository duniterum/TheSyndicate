# Reputation Formula — Doctrine

**Status:** Doctrine. The formula on the `/referral` SIMULATED leaderboard is a preview — final formula is constitutional and locked at deployment.

## Constitutional rule (non-negotiable)

> Reputation reflects durability and retention. Never wealth.

A wallet that brought $1M and watched all buyers leave **ranks below** a wallet that brought $50k whose buyers are still here in year 3. Any formula that violates this is rejected.

## Inputs (from Builder Records)

- `retention` — % of referred buyers still active at the measurement window
- `durability` — composite of multi-window retention (90d, 1y, 3y)
- `contributionAgeDays` — age of the referrer's first attributed sale
- `activeReach` — count of referred buyers still active today
- `gross` — total USDC attributed (**tiebreaker only**)

## Preview formula (not final)

```
score = retention   × 0.40
      + durability  × 0.30
      + ageFactor   × 0.20      // capped at ~2 years
      + reachFactor × 0.10      // log-scaled count of active buyers
```

Tiebreaker: `gross` USDC, descending.

## What is forbidden in the final formula

- Any term where `gross` is a primary driver (≥10% weight outside tiebreaker).
- Any term that rewards single bursts without retention.
- Any term editable without a governance vote.

## Mutability

The current value of a score updates as time passes. The *history* of scores is reproducible from RAL events at any block. Changing the formula itself is a constitutional change — Governance only.

## Cross-references

- `docs/BUILDER_RECORD_DOCTRINE.md`
- `docs/REVENUE_ATTRIBUTION_LAYER.md`
