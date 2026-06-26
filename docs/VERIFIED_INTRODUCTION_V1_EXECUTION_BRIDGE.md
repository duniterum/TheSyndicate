# Verified Introduction V1 Execution Bridge

Status: APPROVED DIRECTION / NON-ACTIVATING EXECUTION BRIDGE / NO LAUNCH AUTHORITY

Founder priority is now locked:

1. Finish the safe Verified Introduction / Source Attribution public-product path.
2. Then move to SeatRecord721 / ERC721 identity.
3. Then move to NFT / Archive evolution.

This document turns the founder's approved direction into an executable path.
It does not authorize transactions, wallet signing, source activation, referral
activation, public source links, aliases, claim UI, source dashboards, public
source-aware buys, registry changes, contract changes, deployment, production
publish, or product-wide attribution.

Machine-readable bridge: `src/lib/verified-introduction-v1-execution.ts`.

Buyer experience skeleton:
`src/lib/verified-introduction-v1-buyer-experience.ts` and
`src/components/syndicate/VerifiedIntroductionBuyerExperience.tsx`.

Internal review surface:
`src/routes/labs.verified-introduction-review.tsx`
(`/labs/verified-introduction-review?review=VERIFIED_INTRODUCTION_V1`).

Launch packet draft:
`docs/VERIFIED_INTRODUCTION_V1_LAUNCH_PACKET_DRAFT.md` and
`src/lib/verified-introduction-v1-launch-packet.ts`.

Decision framework: `docs/SOURCE_PUBLIC_PRODUCT_DECISION_FRAMEWORK.md`.

Founder review record: `docs/SOURCE_PUBLIC_PRODUCT_FOUNDER_REVIEW_PACKET.md`.

## Diagnosis

The engine is proven. The product direction is approved. The launch is not
approved.

The old blocker was founder review of the V1 posture. That is now done enough:
Verified Introduction V1 is the approved direction, limited to MembershipSaleV3,
invite-only, manually approved, buyer-visible, buyer-clearable back to
`ZERO_SOURCE_ID`, direct-payout-first, escrow fallback only, and without aliases,
claim UI, source dashboard, open self-serve referral, or product-wide
attribution.

The current blocker is not philosophy. The current blocker is safe embodiment:
the buyer/source experience must be designed and testable before any public
source-aware path exists.

## Execution Path

| Phase | Status | Purpose | Output |
| --- | --- | --- | --- |
| 1. Non-activating UX/spec | AUTHORIZED NOW | Define buyer preview, disclosure, clear-source behavior, failure states, route posture, and release gates. | Testable source-aware experience contract with no public controls. |
| 2. Internal implementation skeleton | COMPLETED / NON-ACTIVATING | Build read-only or hard-gated components for preview, clear-source, and failure states. | Components/models that can be tested without public activation. |
| 3. Internal review surface | COMPLETED / NOINDEX / DIRECT URL ONLY | Make the skeleton reviewable for founder/operator inspection. | `/labs/verified-introduction-review` with exact review query; absent from public nav and sitemap; no wallet controls. |
| 4. Source packet / launch packet | DRAFT BOUNDARY / FOUNDER APPROVAL REQUIRED | Freeze exact source, eligible buyer path, disclosure, readbacks, stop conditions, and release posture. | Draft launch-decision boundary exists; founder-approved launch packet still required. |
| 5. Replit / production QA | LATER RUNTIME-VISIBLE | Sync/publish only when runtime-visible truth should reach production. | Route QA, sitemap/robots checks, ZERO_SOURCE_ID default check, no-leakage proof. |
| 6. Founder launch decision | FOUNDER APPROVAL REQUIRED | Decide whether to approve, revise, defer, or reject public release. | Separate approval for user-actionable public controls, if any. |

## What Can Be Implemented Safely Now

- Non-activating buyer preview and clear-source models.
- Read-only or test-only source status components.
- Failure-state components and tests.
- Production-coherence guards that prevent public `/join` source drift.
- Documentation that turns approved direction into implementation steps without
  launch authority.

Safe implementation means there is still no public source link, no alias route,
no claim UI, no source dashboard, no public source-aware buy path, and no
non-zero default sourceId on `/join`.

## What Must Be Designed Before Any Source-Aware Public Path Exists

- Source label and source status display.
- Source class display and approved-source explanation.
- Source wallet or approved display identity.
- Payout wallet posture.
- Commission bps, gross USDC, acquisition commission, and Net USDC Routed.
- Clear-source control that returns the buyer to `ZERO_SOURCE_ID`.
- Approval-vs-buy separation.
- Failure states for PAUSED, REVOKED, expired window, cap exceeded,
  ineligible buyer, self-source, wrong chain, and stale readback.
- Post-purchase receipt/readback copy.
- Route, sitemap, robots, and noindex posture.
- Legal/accounting/disclosure language review.

## What Stays Docs-Only Until Further Approval

- Legal/accounting acquisition-commission copy.
- Prohibited promotion acknowledgments.
- Source onboarding policy for real external sources.
- Claim/escrow user-facing policy.
- Public launch packet.

## What Requires Fresh Readback

Before any future wallet action carrying a non-zero sourceId:

- SourceRegistryV1 latest block, owner, sourceExists, sourceConfig, status,
  isActive, terms, wallets, caps, repeat setting, and metadata hash.
- MembershipSaleV3 bytecode, SourceRegistryV1 wiring, paused/unpaused status,
  and public/default `ZERO_SOURCE_ID` behavior.
- After any approved test: receipt, payout, escrow, and final source status.

Historical readbacks explain lineage. Current-authority ceremony validation
must read latest chain state.

## What Requires Replit Publish Later

Replit publish is required only when runtime-visible product truth should reach
production.

Docs/model/test-only bridge work can wait. A future runtime-visible Verified
Introduction surface requires a Replit handoff with:

- starting commit and git status,
- validation result,
- publish decision,
- live QA for `/join`, `/referral`, `/registry`, source-aware route posture if
  any, sitemap, robots, and noindex,
- proof that public/default buys still use `ZERO_SOURCE_ID`,
- proof that no claim UI, source dashboard, alias route, or public source link
  leaked.

## Launch Blockers

Verified Introduction V1 cannot launch until all of these are true:

- Founder launch approval packet exists.
- Public route/link posture is approved.
- Buyer preview and clear-source UX are reviewed.
- Legal/accounting disclosure is approved.
- Anti-abuse rules are accepted.
- Current-authority readbacks are green.
- Replit sync/publish and live QA plan are approved.
- Public `/join` default remains `ZERO_SOURCE_ID`.

## Done Enough

The following are done enough for this phase:

- first internal Source Attribution lifecycle proof,
- durable Register memory,
- knowledge architecture boundary,
- public-product decision gate,
- Verified Introduction V1 direction,
- founder review package,
- non-activating execution bridge,
- non-activating buyer preview, clear-source, and failure-state skeleton,
- noindex internal review surface.
- launch packet draft boundary.

Do not keep re-litigating those before building the next safe slice.

## Next Exact Sprint

Review the non-activating Verified Introduction buyer skeleton at the internal
review surface and the launch packet draft together, then decide the next safe
slice: anti-abuse/source-eligibility hardening, disclosure/legal/accounting
review, current-authority readback/release QA packet, or a separately approved
runtime integration plan.

The next sprint must not add navigation, sitemap entries, aliases, claim UI,
source dashboard, public source links, or a public source-aware buy path unless
a separate founder-approved launch packet authorizes it. Public `/join` must
remain `ZERO_SOURCE_ID`.

## Priority Order

Verified Introduction remains first. SeatRecord721 / ERC721 identity comes
after Verified Introduction reaches a safe implementation or launch-decision
boundary. NFT / Archive evolution comes after ERC721 unless a specific
Verified Introduction dependency proves otherwise.

Do not start ERC721 or NFT work to avoid the harder Verified Introduction
execution path.
