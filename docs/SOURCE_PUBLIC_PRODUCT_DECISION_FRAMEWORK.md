# Source Public Product Decision Framework

Status: DECISION FRAMEWORK / V1 RECOMMENDATION / PUBLIC PRODUCT NOT APPROVED

This document answers whether a public source/referral product should exist and
what its first approved shape should be if the founder later approves it.

It does not authorize activation, source links, aliases, dashboards, claim UI,
public source-aware buys, registry changes, contract changes, transactions,
deployment, or production publish.

Machine-readable source: `src/lib/source-public-product-framework.ts`.

Founder review packet:
`docs/SOURCE_PUBLIC_PRODUCT_FOUNDER_REVIEW_PACKET.md`.

## Executive Decision

The engine is proven. The public product should still wait.

If The Syndicate later creates a first user-actionable source product, the
recommended V1 is:

**Verified Introduction V1**

- invite-only,
- manually approved,
- MembershipSaleV3-only,
- buyer-visible before wallet signature,
- buyer-clearable back to `ZERO_SOURCE_ID`,
- direct-payout-first with escrow fallback,
- no claim UI,
- no source dashboard,
- no aliases,
- no open self-serve member referral,
- no product-wide attribution.

The public product should not lead with the word "referral." Internally, the
protocol term remains **Source Attribution**. For accounting, the correct
language is **Acquisition Source**. For a buyer, the cleanest phrase is
**Verified Introduction**.

## Answers To The Fifteen Product Questions

| Question | Decision |
| --- | --- |
| 1. What should it be called? | Buyer-facing: **Verified Introduction**. Protocol-facing: **Source Attribution**. Accounting-facing: **Acquisition Source**. Do not lead with **Referral** as the public product name. |
| 2. Membership-only or product-wide? | V1 is **MembershipSaleV3-only**. It must explicitly exclude Archive1155, SeatRecord721, SwapRail, ProductSaleRouter, premium products, marketplace, and future commerce. |
| 3. Who can become a source? | Only founder/operator-approved sources with a source packet, source record, approved terms, and current readback. |
| 4. Must a source be seated? | Only if the source class is `MEMBER_INTRODUCTION`. Other source classes may be non-seated only if explicitly approved in the packet. |
| 5. Manual approval? | Yes. V1 is not self-serve. |
| 6. Aliases in V1? | No. Aliases/codes create impersonation, collision, support, and policy risk. |
| 7. Buyer sees and clears source? | Yes. The buyer must see source identity/status/terms before signing and must be able to clear the source back to `ZERO_SOURCE_ID`. |
| 8. Direct payout or escrow? | Direct payout first. Escrow is only fallback if direct payout fails. |
| 9. Claim UI in V1? | No. Claim UI is excluded from V1. |
| 10. Source dashboard in V1? | No. Source dashboards are excluded from V1. |
| 11. Buyer disclosure? | Buyer must see that the purchase is linked to an approved source, the acquisition commission, Net USDC Routed, and that clearing the source returns to `ZERO_SOURCE_ID`. |
| 12. Anti-abuse rules? | Manual approval, source/buyer self-source block, historical/already-seated wallet guards, cap/window checks, no hidden source hijacking, and prohibited promotion rules. |
| 13. Mandatory readbacks? | Latest-chain SourceRegistryV1 state, sourceConfig/isActive/status, MembershipSaleV3 wiring, public `ZERO_SOURCE_ID`, receipt fields, payout, escrow, and route QA. |
| 14. Production QA? | GitHub validation, Replit sync/publish decision, live route QA, sitemap/robots checks, anti-leakage checks, source-aware path gating, and no fake-live wording. |
| 15. Impossible in V1? | Claim UI, source dashboards, aliases, open self-serve referral, product-wide attribution, public source creation, non-zero default `/join`, leaderboards, yield, ROI, passive-income, MLM, downline, or upline framing. |

## Recommended V1 Shape

### 1. Product Posture

V1 should not be a broad referral program. It should be an approved-source
introduction path for MembershipSaleV3 only.

This keeps the first public shape close to what the protocol has already
proven:

`approved source -> ACTIVE source terms -> source-aware MembershipSaleV3 purchase -> receipt -> payout/readback -> safe state`

### 2. Source Eligibility

Every V1 source requires:

- founder/operator approval,
- source packet,
- source class,
- wallet and payout wallet,
- source terms,
- metadata hash,
- prohibited-promotion acknowledgement,
- current-authority readback,
- explicit activation ceremony.

`MEMBER_INTRODUCTION` requires the source/referrer wallet to remain seated.
`BUILDER_SOURCE`, `AFFILIATE`, `BD_NETWORK`, `WHITELABEL`, `SPONSORSHIP`, and
`TREASURY_DEAL` require their own source packet and approval posture.

### 3. Buyer UX Requirements

Before wallet signature, the buyer must see:

- source label,
- source status,
- source class,
- source wallet or approved display identity,
- payout wallet posture,
- commission bps,
- gross USDC,
- acquisition commission,
- Net USDC Routed,
- whether the source can be cleared.

The buyer must be able to clear the source and continue through the standard
`ZERO_SOURCE_ID` path.

### 4. Buyer Disclosure Template

> This purchase is linked to an approved source. If you continue, the displayed
> acquisition commission will be paid to the approved source payout wallet and
> the remaining USDC will route through the protocol split. This does not change
> your seat, price, rights, or membership. You may clear this source and continue
> through the standard ZERO_SOURCE_ID path before signing.

### 5. Payout Policy

V1 uses direct payout first.

Escrow remains a fallback if direct payout fails. Escrow readback may be shown
only as operational proof. Claim UI and claim balances remain excluded until a
separate claim product is approved.

### 6. Anti-Abuse Controls

V1 requires:

- source/buyer self-source rejection,
- historical/already-seated wallet guard,
- active source status hard gate,
- source terms/caps/window hard gate,
- buyer clear-source control,
- no hidden cookies/session source hijacking,
- prohibited promotion rules,
- no agency/employment/official-representative implication,
- no yield/ROI/passive-income/MLM/downline/upline language,
- revocation and re-pause operations.

### 7. Production QA Before Any Launch

Before any public source-aware path is released:

- `npm run check-release` passes,
- focused source/public-product framework tests pass,
- current-authority SourceRegistryV1 readback is latest-chain,
- MembershipSaleV3 wiring is verified,
- `/join` default remains `ZERO_SOURCE_ID`,
- `/referral` does not imply public launch,
- no claim UI appears,
- no source dashboard appears,
- no source directory appears,
- no product-wide source attribution appears,
- sitemap/robots/nav are intentionally reviewed,
- Replit publish decision is explicit,
- post-publish live QA checks every affected route.

## Current No-Go Conditions

Do not proceed to user-actionable implementation until:

- founder approves this V1 posture or edits it through
  `docs/SOURCE_PUBLIC_PRODUCT_FOUNDER_REVIEW_PACKET.md`,
- public scope is frozen,
- buyer UX is designed and reviewed,
- anti-abuse rules are accepted,
- legal/accounting/disclosure posture is accepted,
- claim/escrow policy is explicitly excluded or approved,
- release/production QA is ready.

Until then, public/default MembershipSaleV3 buys remain `ZERO_SOURCE_ID`, and
the completed internal Source Attribution lifecycle remains proof, not product.
