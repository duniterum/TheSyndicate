# Product OS V1 Hidden Preview

## Route URL

`/labs/product-os-v1?review=SYNDICATE_PRODUCT_OS_V1`

## Purpose

This is a hidden founder-review route that previews the future member app direction inside the production app without activating any product feature.

It is not a homepage replacement, not public navigation, not a source/referral launch, not claim UI, not production auth, and not a wallet-write surface.

## What It Previews

- The Syndicate as a living on-chain membership institution.
- Public proof cards for Activity, Economy / Transparency, Registry Proof, Evolution, Chronicle, Archive, Recognition, and Fire / Proof of Burn.
- The routing model as `70% / 20% / 10%`.
- Recognition signals across capital, builder, connector, operator, verifier, historian, steward, infrastructure, security, and time / loyalty.
- Fire / Proof of Burn as a future proof ritual.
- Toolkit action architecture as disabled preview groups.
- Member app concepts such as My Syndicate, member sigil, receipts, contribution depth, share proof, and settings/privacy.
- Founder/operator concepts such as Truth Drift, Release Gates, Candidate Queues, Handoff Generator, and Audit Log.

## What Is Read-Only

Everything on the route is read-only. The route renders local preview data and text only.

No wallet state is required. No route action signs, sends, writes, claims, burns, activates source attribution, or opens a real external trade/liquidity link.

## What Is Simulated Or Preview Data

The page labels preview-only surfaces with:

- `READ-ONLY PREVIEW`
- `PREVIEW DATA`
- `NOT LIVE METRIC`
- `FUTURE ACTION`
- `NO LIVE BURN EXECUTION`
- `NO PRICE PROMISE`
- `NOT PRODUCTION AUTH`

The page does not invent burn totals, transaction hashes, live USDC routed totals, live SYN acquired totals, live explorer links, or live DEX/LP links.

## What Is Not Activated

- No referral/source activation.
- No claim UI activation.
- No live wallet writes.
- No real burn action.
- No fake DEX or LP links.
- No fake explorer links.
- No real founder controls.
- No production auth.
- No homepage replacement.
- No production routes beyond the hidden lab route are activated.

## Files Added Or Changed

- `src/lib/product-os-v1-preview.ts`
- `src/routes/labs.product-os-v1.tsx`
- `src/lib/__tests__/product-os-v1-hidden-preview.test.ts`
- `src/components/syndicate/MobileJoinBar.tsx`
- `docs/PRODUCT_OS_V1_HIDDEN_PREVIEW.md`

The production route does not import from `apps/product-os-studio/`.

## How To Validate

Run:

```bash
npm run typecheck
npm run check-release
```

Manual route checks:

- `/labs/product-os-v1` should show the locked founder-review message.
- `/labs/product-os-v1?review=SYNDICATE_PRODUCT_OS_V1` should show the read-only preview.
- The route must stay absent from public navigation, footer links, and sitemap.
- The route must keep `noindex, nofollow` metadata.

## Next Recommended Slice

After founder review, choose one narrow read-only production slice from the preview, such as public Activity preview or Registry proof summary. Keep it noindex or explicitly founder-approved before any public launch.
