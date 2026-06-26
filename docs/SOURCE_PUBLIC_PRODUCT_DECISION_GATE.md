# Source Public Product Decision Gate

Status: OPERATIONAL GATE / PROOF EXISTS / PUBLIC PRODUCT NOT APPROVED

This document records the boundary after the first completed Source Attribution
lifecycle.

The internal protocol capability is proven. Public referral is still not live.

## Current Decision

Source Attribution is **not ready for public product activation**.

The completed lifecycle proves:

- one source policy packet,
- one terms update,
- one controlled ACTIVE window,
- one real $5 source-attributed MembershipSaleV3 purchase,
- one direct acquisition payout,
- zero escrow owed,
- final PAUSED closure,
- public/default buys still using `ZERO_SOURCE_ID`.

It does not approve:

- public referral activation,
- public source links or aliases,
- source dashboard,
- claim UI,
- public source-aware buy path,
- product-wide attribution,
- Archive1155 source commission,
- SeatRecord721, SwapRail, ProductSaleRouter, or future commerce attribution.

Machine-readable source: `src/lib/public-product-decision-gate.ts`.

Public product framework: `docs/SOURCE_PUBLIC_PRODUCT_DECISION_FRAMEWORK.md`
and `src/lib/source-public-product-framework.ts`.

Founder review packet: `docs/SOURCE_PUBLIC_PRODUCT_FOUNDER_REVIEW_PACKET.md`.

## Required Gates Before Public Product

| Gate | Current status | Meaning |
| --- | --- | --- |
| Internal proof recorded | SATISFIED | The capability exists as internal proof. |
| Safe closure state | SATISFIED | Source is PAUSED, active source count is zero, and public/default buys remain `ZERO_SOURCE_ID`. |
| Public scope definition | REQUIRED | The V1 framework recommends Verified Introduction as MembershipSaleV3-only, invite-only, and manually approved; founder must approve or revise it. |
| Source link and buyer UX | REQUIRED | Design source preview/quote, buyer disclosure, hard-fail source readback, and clear-source behavior before wallet signature. |
| Anti-abuse and eligibility rules | REQUIRED | Define source eligibility, seated/referrer rules, repeat-purchase posture, privacy, and revocation operations. |
| Legal, accounting, and disclosure posture | REQUIRED | Approve acquisition-first language and tax/accounting posture. |
| Claim and escrow policy | BLOCKED BY DESIGN | No claim UI or claim balances until escrow/readback/legal policy is separately approved. |
| Release and production QA | REQUIRED | GitHub validation, Replit publish decision, live QA, anti-leakage checks, and current-authority readback. |
| Founder public-product approval | FOUNDER APPROVAL REQUIRED | Founder must approve the exact public product surface before user-actionable controls exist. |

## Allowed Next Work

- Chronicle admission review for the completed lifecycle, if the founder wants
  curated public meaning.
- Founder review of `docs/SOURCE_PUBLIC_PRODUCT_FOUNDER_REVIEW_PACKET.md` with
  no implementation or activation authority.
- Anti-abuse, disclosure, accounting, and source-operator policy design.
- Read-only proof and guard hardening that preserves `ZERO_SOURCE_ID`
  public/default buys.

## Forbidden Until Approved

- Do not activate public referral.
- Do not create public source links or aliases.
- Do not add source dashboards.
- Do not add claim UI or claim balances.
- Do not route public/default buys through a non-zero sourceId.
- Do not imply product-wide attribution for Archive1155, SeatRecord721,
  SwapRail, ProductSaleRouter, or future commerce.
- Do not use yield, ROI, passive-income, MLM, downline, or upline framing.

## Relationship To The Knowledge Lifecycle

The knowledge lifecycle is:

`raw event -> current-authority readback -> proof -> Register memory -> Chronicle review -> public product decision`

The Source Attribution lifecycle has reached proof and Register memory.

Chronicle review may decide whether the proof deserves curated institutional
meaning.

The public product decision framework recommends a possible V1 shape, but it
does not approve launch.

Public product requires this separate gate. Proof, Register memory, Chronicle,
and the framework do not launch referral.
