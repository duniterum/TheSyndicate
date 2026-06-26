# Verified Introduction V1 Founder Launch-Decision Packet

Status: READY FOR FOUNDER REVIEW / NO LAUNCH AUTHORITY / NO PUBLIC CONTROLS

Machine-readable packet:
`src/lib/verified-introduction-v1-founder-launch-decision.ts`.

This packet assembles the current Verified Introduction V1 materials into one
founder decision surface.

It does not approve launch.

It does not authorize transactions, wallet signing, source activation, referral
activation, public source links, aliases, claim UI, source dashboards, public
source-aware buys, registry changes, contract changes, Replit publish,
production publish, or non-zero default `/join` source attribution.

## Plain-English Summary

The engine is proven.

The product direction is approved.

The public product is not approved.

Verified Introduction V1 is now ready for the founder to decide whether the
team should prepare a launch candidate, revise the posture, defer public product
work, or reject the V1 posture.

The safest recommendation is:

> Approve launch-candidate preparation only if the founder wants the next sprint
> to prepare exact public route posture, copy, source policy, current-authority
> readbacks, and Replit/live QA. This approval would still not activate,
> publish, sign, or expose public controls.

## What Is Already Done Enough

| Ingredient | Status | Authority |
| --- | --- | --- |
| Source Attribution engine proof | Proven internally | `docs/SOURCE_REAL_CONDITION_CEREMONY_READBACK.md` |
| Verified Introduction V1 direction | Approved as direction only | `docs/SOURCE_PUBLIC_PRODUCT_FOUNDER_REVIEW_PACKET.md` |
| Execution bridge | Non-activating bridge complete | `docs/VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.md` |
| Buyer skeleton | Reviewable, non-activating | `src/lib/verified-introduction-v1-buyer-experience.ts` |
| Hidden review surface | Noindex, direct URL only | `src/routes/labs.verified-introduction-review.tsx` |
| Launch packet draft | Draft boundary complete | `docs/VERIFIED_INTRODUCTION_V1_LAUNCH_PACKET_DRAFT.md` |
| Anti-abuse/source eligibility | Draft review model complete | `src/lib/verified-introduction-v1-anti-abuse.ts` |
| Buyer disclosure/accounting | Draft review model complete | `src/lib/verified-introduction-v1-disclosure.ts` |
| Current-authority/release QA | Draft release-QA model complete | `src/lib/verified-introduction-v1-release-qa.ts` |

## Founder Decision Options

### Option A - Approve Launch-Candidate Preparation Only

Founder approval phrase:

> I approve Verified Introduction V1 for launch-candidate preparation only. This
> does not activate referral, create public source links, expose public controls,
> or authorize wallet signing.

Meaning:

- Codex may prepare the exact launch-candidate implementation and release
  packet.
- Current-authority readbacks, legal/accounting review, Replit/live QA, and
  final founder approval remain required.
- Public `/join` remains `ZERO_SOURCE_ID` until a later explicit approval
  changes it.

Next work if chosen:

1. Freeze exact launch-candidate route posture and public copy.
2. Run latest-chain SourceRegistryV1 and MembershipSaleV3 readbacks.
3. Prepare exact GitHub/Replit release packet and live QA script.
4. Return for founder approval before any public controls, wallet signing,
   source activation, or production publish.

### Option B - Approve With Revisions

Founder approval phrase:

> I approve the Verified Introduction V1 direction with revisions. Do not prepare
> public controls until the revisions are incorporated and re-reviewed.

Meaning:

- The V1 direction survives.
- One or more source eligibility, disclosure, route, release, or stop-condition
  rules must change first.
- Codex should patch only the specified revisions and return the updated packet.

### Option C - Defer Public Product

Founder approval phrase:

> I defer Verified Introduction V1 public product work. Keep the proven
> source-attribution engine and internal review materials as institutional
> memory.

Meaning:

- The internal proof remains true.
- The public product does not proceed now.
- Verified Introduction stays at the review boundary until explicitly resumed.

### Option D - Reject V1 Posture

Founder approval phrase:

> I reject the current Verified Introduction V1 posture. Do not use this model as
> the public source/referral product direction.

Meaning:

- The proven engine remains true.
- This V1 product shape should not become the public source/referral product.
- A new founder-approved product decision would be required before public
  source-aware work resumes.

## Required Founder Decisions

| Decision | Current status | Question | Default recommendation |
| --- | --- | --- | --- |
| Launch posture | FOUNDER DECISION REQUIRED | Approve launch-candidate preparation, revise, defer, or reject? | Approve preparation only if the founder wants exact candidate work next. |
| Source eligibility | FOUNDER DECISION REQUIRED | Which source classes, approval rules, buyer eligibility rules, and revocation authority are acceptable? | Keep V1 invite-only and manually approved. |
| Legal/accounting copy | LEGAL/ACCOUNTING REVIEW REQUIRED | Is the buyer disclosure correct for Acquisition Source, Acquisition Commission, Net USDC Routed, clear-source, and direct payout first? | Treat current copy as draft review only until approved. |
| Latest-chain readback | LATEST READBACK REQUIRED | Do SourceRegistryV1, MembershipSaleV3, source status/terms, and public/default `ZERO_SOURCE_ID` read correctly at latest chain state? | Run only after a concrete launch candidate exists. |
| Replit/live QA | REPLIT/LIVE QA REQUIRED | Should Replit pull, validate, publish, and live-QA a runtime-visible candidate? | Ask Replit only when runtime-visible product truth should reach production. |
| Excluded surfaces | BLOCKED BY DESIGN | Should claim UI, dashboards, aliases, open self-serve referral, product-wide attribution, or future-module attribution enter V1? | Keep them excluded. Separate sprint if any become necessary. |

## Still Forbidden

- No transactions.
- No wallet signing.
- No source activation.
- No referral activation.
- No public source link.
- No alias route.
- No claim UI.
- No source dashboard.
- No public source-aware buy path.
- No non-zero default `/join` sourceId.
- No registry switch.
- No contract change.

## Stop Conditions

Stop if:

- the founder decision is ambiguous,
- any draft review item is treated as legal/accounting signoff,
- public `/join` stops using `ZERO_SOURCE_ID` by default,
- `/referral` becomes actionable before founder approval,
- a public route, sitemap, nav item, source link, alias, claim UI, dashboard, or
  source-aware buy path appears before approval,
- latest-chain readback is stale, historical, missing, or mismatched,
- Replit validation or live QA is partial and the founder has not explicitly
  accepted the residual risk.

## Production Posture

Production is currently known to be published from the previous GitHub truth
before this packet unless a later Replit report proves otherwise.

This packet is operational and internal. It does not need immediate Replit
publish unless the founder wants the hidden internal review surface updated live
for review provenance.

If a later launch-candidate implementation becomes runtime-visible, Replit must
pull GitHub, validate, publish only if approved and green, and live-QA `/join`,
`/referral`, `/labs/verified-introduction-review`, sitemap, robots, nav, and
all no-leakage checks.

## Final Rule

This packet gives the founder a decision.

It does not give the product a launch.
