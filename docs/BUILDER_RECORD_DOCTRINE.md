# Builder Record — Doctrine

**Status:** Doctrine. No UI shipped in V1 beyond the SIMULATED leaderboard preview on `/referral`.

## Two-tier rule

- **Event** = one referral. Never enters Chronicle. Lives in Activity.
- **Record** = the aggregate for an address over time. May, after a time threshold, be eligible for promotion to Artifact / Chronicle via the Mythology Gate.

## Eligibility windows

| Window | What a Builder Record can become |
|---|---|
| 6 months | Visible Builder Record on `/referral` (preview only in V1) |
| 1 year | Eligible for Reputation badge |
| 3 years | Eligible for Artifact mint |
| 5 years | Eligible for Chronicle entry |

These are minimum dwell times. The Mythology Gate (`docs/MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md`) still applies — durability + retention + on-chain sealing rule are all required.

## What a Builder Record contains

Derived (off-chain) from RAL events + holder index. No on-chain Builder Record contract in V1.

- Total attributed sales (USDC)
- Count of referred buyers
- Retention rate of those buyers (still active at +90d / +1y / +3y)
- Age of oldest still-active buyer
- First and last referral block

## Inputs are immutable

The aggregate updates as time passes, but the *history* is permanent because the inputs (RAL events) are immutable. A Builder Record is reproducible from chain state at any block.

## What this doctrine forbids

- Builder Records that rank only by gross (forbidden — see Reputation Formula).
- Manual edits to a Builder Record. The only valid mutation is more on-chain events.
- Promoting a Builder Record to Chronicle without passing the Mythology Gate.

## Cross-references

- `docs/REVENUE_ATTRIBUTION_LAYER.md`
- `docs/REPUTATION_FORMULA_DOCTRINE.md`
- `docs/MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md`
