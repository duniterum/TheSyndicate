# Verified Introduction V1 Launch Packet Draft

Status: DRAFT BOUNDARY / NOT APPROVED / NO PUBLIC CONTROLS

This packet turns the internal Verified Introduction review surface into a
launch-decision checklist. It does not approve launch.

It does not authorize transactions, wallet signing, source activation, referral
activation, public source links, aliases, claim UI, source dashboards, public
source-aware buys, registry changes, contract changes, deployment, production
publish, or non-zero default `/join` source attribution.

Machine-readable packet:
`src/lib/verified-introduction-v1-launch-packet.ts`.

Anti-abuse/source eligibility review:
`src/lib/verified-introduction-v1-anti-abuse.ts`.

Buyer disclosure/legal-accounting review:
`src/lib/verified-introduction-v1-disclosure.ts`.

Current-authority/release QA review:
`src/lib/verified-introduction-v1-release-qa.ts`.

Founder launch-decision packet:
`docs/VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET.md` and
`src/lib/verified-introduction-v1-founder-launch-decision.ts`.

Internal review surface:
`/labs/verified-introduction-review?review=VERIFIED_INTRODUCTION_V1`.

## Current Truth

- Verified Introduction V1 is approved as product direction only.
- The buyer skeleton is implemented as non-activating review infrastructure.
- The review surface is noindex, direct-URL only, absent from public navigation,
  and absent from the sitemap.
- A draft anti-abuse/source eligibility model now defines the major fail-closed
  states for founder/operator review.
- A draft buyer disclosure/legal-accounting model now defines required
  before-signature copy, accounting labels, forbidden copy, and stop conditions.
- A draft current-authority/release QA packet now defines latest-chain reads,
  Replit sync/publish gates, live route QA, no-leakage checks, and stop
  conditions.
- A founder launch-decision packet now assembles the review ingredients into
  approve-preparation, revise, defer, or reject options.
- Public `/join` remains `ZERO_SOURCE_ID`.
- `/referral` remains inactive.
- Claim UI, source dashboards, aliases, public source links, and public
  source-aware buys remain absent.

## What This Draft Is For

This draft answers one operational question:

> What must be true before Verified Introduction V1 can become a public,
> user-actionable product candidate?

The answer is not "the engine works." The engine is already proven.

The answer is a separate launch packet with founder approval, source eligibility
rules, buyer disclosure, anti-abuse posture, legal/accounting review,
current-authority readbacks, release QA, and live-site anti-leakage checks.

## Launch Gates

| Gate | Current status | Required before | Stop condition |
| --- | --- | --- | --- |
| Internal buyer review surface | SATISFIED FOR REVIEW | Design review | Stop if the surface appears in public nav, sitemap, or exposes controls. |
| Founder launch approval | PENDING FOUNDER APPROVAL | Public release | Direction approval, proof, Register memory, Chronicle review, or this draft cannot authorize launch. |
| Source eligibility policy | PENDING REVIEW | Implementation | Review `src/lib/verified-introduction-v1-anti-abuse.ts`; stop if source class, manual approval, seated-member rules, self-source blocking, or revocation operations are ambiguous. |
| Buyer disclosure policy | PENDING REVIEW | Implementation | Review `src/lib/verified-introduction-v1-disclosure.ts`; stop if the buyer cannot understand source identity, Acquisition Commission, Net USDC Routed, clear-source behavior, or approval-vs-buy separation before signing. |
| Legal/accounting review | PENDING REVIEW | Public release | Review `src/lib/verified-introduction-v1-disclosure.ts`; stop if copy implies ownership, employment, yield, passive income, ROI, downline, upline, guaranteed income, claim balances, or source dashboards. |
| Current-authority readbacks | PENDING REVIEW | Public release | Review `src/lib/verified-introduction-v1-release-qa.ts`; stop if readback is historical, stale, mismatched, or source state is not approved. |
| Release and live QA | PENDING REVIEW | Public release | Review `src/lib/verified-introduction-v1-release-qa.ts`; stop if `/join`, `/referral`, sitemap, robots, or any public route implies launch before approval. |
| Claim/dashboard/alias exclusions | BLOCKED BY DESIGN | Public release | If any excluded surface becomes necessary, create a separate founder-approved product sprint first. |

## Founder Decision Slots

Before any public controls exist, the founder must explicitly decide:

1. Approve, revise, defer, or reject public Verified Introduction V1 launch.
2. Approve exact source class and source eligibility policy.
3. Approve exact buyer disclosure and clear-source language.
4. Approve legal/accounting review path before public controls.
5. Approve Replit sync/publish and live QA only after the launch packet is
   complete.

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

## Next Safe Work

Review the founder launch-decision packet and choose exactly one path:

1. approve launch-candidate preparation only,
2. approve with revisions,
3. defer public product,
4. or reject the V1 posture.

Do not start SeatRecord721 / ERC721 or NFT / Archive evolution until Verified
Introduction reaches a clear safe implementation or launch-decision boundary.
