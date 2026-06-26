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

Internal review surface:
`/labs/verified-introduction-review?review=VERIFIED_INTRODUCTION_V1`.

## Current Truth

- Verified Introduction V1 is approved as product direction only.
- The buyer skeleton is implemented as non-activating review infrastructure.
- The review surface is noindex, direct-URL only, absent from public navigation,
  and absent from the sitemap.
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
| Source eligibility policy | PENDING REVIEW | Implementation | Stop if source class, manual approval, seated-member rules, self-source blocking, or revocation operations are ambiguous. |
| Buyer disclosure policy | PENDING REVIEW | Implementation | Stop if the buyer cannot understand and clear attribution before signing. |
| Legal/accounting review | PENDING REVIEW | Public release | Stop if copy implies ownership, employment, yield, passive income, ROI, downline, upline, or guaranteed income. |
| Current-authority readbacks | PENDING REVIEW | Public release | Stop if readback is historical, stale, mismatched, or source state is not approved. |
| Release and live QA | PENDING REVIEW | Public release | Stop if `/join`, `/referral`, sitemap, robots, or any public route implies launch before approval. |
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

Review the internal buyer surface and this launch packet draft together.

After review, choose exactly one next slice:

1. anti-abuse and source eligibility hardening,
2. buyer disclosure and legal/accounting copy review,
3. current-authority readback and release QA packet,
4. or defer public-product work and keep Verified Introduction at the review
   boundary.

Do not start SeatRecord721 / ERC721 or NFT / Archive evolution until Verified
Introduction reaches a clear safe implementation or launch-decision boundary.
