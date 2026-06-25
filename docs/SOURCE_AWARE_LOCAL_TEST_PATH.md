# Source-Aware Internal Test Path

Status: INTERNAL TEST BOUNDARY / NO ACTIVATION AUTHORIZED / NO PUBLIC REFERRAL

Last updated: 2026-06-25

This document records the internal-only source-aware test harness for the first
PAUSED source record.

It does not authorize source activation, referral activation, public referral
links, public source-aware buys, claim UI, source dashboards, wallet signing,
transactions, registry switches, contract changes, deployment, or production
publish.

## Purpose

The protocol needs a way to rehearse a future tiny source-attributed
MembershipSaleV3 purchase without turning source attribution into a public
feature.

The harness exists so the future test can be:

- local or production-internal,
- explicit,
- sourceId-specific,
- status-aware,
- small,
- visible before signing,
- impossible to confuse with public referral.

## Route

Local route:

`/labs/source-attribution-test?sourceTest=INTERNAL_PROTOCOL_TEST_SOURCE_001`

The route is under the existing noindex `/labs` subtree and is not linked from
public navigation.

## Required Gate

In local development, all of the following must be true before the internal
harness can render:

| Gate | Required value |
| --- | --- |
| Build mode | development only |
| Host | `localhost`, `127.0.0.1`, or loopback IPv6 |
| Public env flag | `VITE_ENABLE_SOURCE_TEST_MODE=true` |
| Query | `sourceTest=INTERNAL_PROTOCOL_TEST_SOURCE_001` |
| SourceId | frozen sourceId from `INTERNAL_PROTOCOL_TEST_SOURCE_001` |
| Public/default sourceId | `ZERO_SOURCE_ID` |

In production-internal mode, all of the following must be true before the
internal harness can render:

| Gate | Required value |
| --- | --- |
| Public env flag | `VITE_ENABLE_PRODUCTION_SOURCE_TEST_MODE=true` |
| Buyer allowlist env | `VITE_SOURCE_TEST_ALLOWED_BUYERS=<fresh buyer wallet>` |
| Route | `/labs/source-attribution-test` |
| Query | `sourceTest=INTERNAL_PROTOCOL_TEST_SOURCE_001` |
| Navigation | no public navigation link |
| Sitemap | absent |
| Robots | `noindex,nofollow` |
| Public/default sourceId | `ZERO_SOURCE_ID` |

All of the following must also be true before wallet controls can appear:

| Gate | Required value |
| --- | --- |
| Source status | `ACTIVE` |
| Source terms | live SourceRegistry readback must match the approved test packet |
| Active sale | MembershipSaleV3 |
| Buyer wallet | fresh / not historical / not already seated / allowlisted in production-internal mode |
| Test amount | 5 USDC |
| Quote | live source-aware quote using the frozen non-zero sourceId |

Current truth: the source is `PAUSED`, so the harness renders blockers and no
wallet controls.

## What It Shows

The harness must show, before any future signature:

- INTERNAL SOURCE TEST MODE / NOT PUBLIC REFERRAL,
- sourceId,
- source status,
- source class,
- source wallet,
- payout wallet,
- commission bps,
- gross cap,
- per-buyer cap,
- $5 test amount,
- acquisition commission from quote when available,
- Net USDC Routed from quote when available,
- fresh buyer wallet warning,
- no public source link,
- no claim UI,
- no source dashboard,
- production/default buys remain `ZERO_SOURCE_ID`.

## Production Boundary

In ordinary production builds or non-local hosts, the route must hard-fail. It
must not show wallet controls, source selectors, claim controls, source
dashboards, or public source links.

In exceptional founder-approved production-internal mode, the route may render
only as an unlinked, noindex, exact-query, allowlisted-wallet harness. It must
still hard-fail unless live SourceRegistry readback shows `ACTIVE` and exact
terms match for the approved test packet.

The public `/join` buy path remains unchanged and continues to call
MembershipSaleV3 with `ZERO_SOURCE_ID`.

## Future Test Sequence

Only after a separate founder-approved terms update if needed, ACTIVE ceremony,
fresh readbacks, and Replit publish approval if production-internal mode is used:

1. Run local development with `VITE_ENABLE_SOURCE_TEST_MODE=true`, or publish
   production-internal mode with `VITE_ENABLE_PRODUCTION_SOURCE_TEST_MODE=true`
   and an allowlisted fresh buyer wallet.
2. Open `/labs/source-attribution-test?sourceTest=INTERNAL_PROTOCOL_TEST_SOURCE_001`.
3. Confirm the harness shows `READY_FOR_LOCAL_TEST` or
   `READY_FOR_PRODUCTION_INTERNAL_TEST`.
4. Use the fresh buyer wallet.
5. Run exactly the $5 source-attributed test.
6. Read back the MembershipPurchasedV3 receipt, sourceId, source class,
   commission bps, acquisition commission, Net USDC Routed, payout/escrow state,
   Activity, My Syndicate, and cache-after-reload behavior.

## Stop Conditions

Stop if:

- the route works outside localhost development,
- production-internal mode works without the production test flag,
- production-internal mode works without an allowlisted buyer wallet,
- the env flag is not required in local mode,
- the sourceTest query is not required,
- wallet controls appear while the source is PAUSED,
- wallet controls appear when live SourceRegistry terms do not match the approved packet,
- `/join` stops using `ZERO_SOURCE_ID`,
- public navigation links to the harness,
- the sitemap includes the harness,
- any copy implies public referral, claim UI, source dashboard, passive income,
  yield, ROI, MLM/downline/upline, governance, or financial leaderboard status.
