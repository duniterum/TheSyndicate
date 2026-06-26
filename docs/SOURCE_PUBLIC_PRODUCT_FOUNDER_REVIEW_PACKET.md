# Verified Introduction V1 Founder Review Packet

Status: FOUNDER REVIEW PACKET / DIRECTION APPROVED / NO LAUNCH AUTHORITY

This packet records the founder decision that Verified Introduction V1 is
approved as direction only. It remains a review record, not launch authority.

It does not authorize transactions, source activation, referral activation,
public source links, aliases, source dashboards, claim UI, public source-aware
buys, registry changes, contract changes, deployment, or production publish.

Decision framework: `docs/SOURCE_PUBLIC_PRODUCT_DECISION_FRAMEWORK.md`

Machine-readable recommendation: `src/lib/source-public-product-framework.ts`

Execution bridge: `docs/VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.md`

## Founder Decision Recorded

Decision: **Option A - Approve As Direction**.

Verified Introduction V1 is approved as the product direction:
MembershipSaleV3-only, invite-only, manually approved, buyer-visible before
signing, buyer-clearable back to `ZERO_SOURCE_ID`, direct-payout-first, escrow
fallback only, no aliases, no claim UI, no source dashboard, no open self-serve
member referral, and no product-wide attribution.

This decision authorizes planning and non-activating implementation work only.
It does not authorize public source links, aliases, claim UI, source dashboards,
public source-aware buys, source activation, transactions, deployment, or
production publish.

## Recommendation Summary

Recommendation: **approve Verified Introduction V1 as direction only**.

Do not launch it yet.

The safest first public posture is not a broad referral program. It is an
approved-source introduction path for MembershipSaleV3 only:

- buyer-facing name: **Verified Introduction**,
- internal protocol name: **Source Attribution**,
- accounting name: **Acquisition Source**,
- invite-only,
- manually approved,
- buyer-visible before wallet signature,
- buyer-clearable back to `ZERO_SOURCE_ID`,
- direct payout first,
- escrow fallback only,
- no aliases,
- no claim UI,
- no source dashboard,
- no open self-serve member referral,
- no product-wide attribution.

This decision would approve the product direction. It would not approve public
source links, public controls, or any activation.

## What V1 Is

Verified Introduction V1 is a controlled way for an approved source to be shown
to an eligible buyer before a MembershipSaleV3 purchase.

If the buyer continues, the purchase can carry the approved sourceId and the
receipt can show the acquisition commission, Net USDC Routed, payout, and
escrow state.

If the buyer clears the source, the purchase returns to the ordinary
`ZERO_SOURCE_ID` path.

## What V1 Is Not

Verified Introduction V1 is not:

- public referral launch,
- a public source directory,
- open member self-enrollment,
- alias/code registration,
- a source dashboard,
- claim UI,
- a financial leaderboard,
- product-wide attribution,
- Archive1155 attribution,
- SwapRail attribution,
- SeatRecord721 attribution,
- ProductSaleRouter wiring,
- governance, ownership, employment, agency, or official-representative status.

## Why This Is Safer Than Public Referral

Public referral language can make users assume that anyone can generate a link,
that commissions are broadly available, or that the program is live for every
product. That is not current truth.

Verified Introduction is narrower and more truthful:

- it describes what happened to the buyer, not a public earning program,
- it keeps the protocol term Source Attribution for receipts and readbacks,
- it keeps accounting language separate as Acquisition Source,
- it allows manual eligibility review before any source is exposed,
- it makes the buyer see and clear the source before signing,
- it keeps public/default `/join` on `ZERO_SOURCE_ID`.

## Founder Review Answers

| Question | Founder-review recommendation |
| --- | --- |
| 1. Is "Verified Introduction" the right buyer-facing name? | Yes. It is calmer and more exact than referral. It describes a verified source relationship without implying a public program. |
| 2. Is MembershipSaleV3-only correct for V1? | Yes. Only MembershipSaleV3 is source-aware today and has proven source-attributed receipt fields. |
| 3. Is invite-only/manual approval correct? | Yes. The internal test proved the engine, not open onboarding. Manual approval protects source quality and legal/accounting posture. |
| 4. Should aliases stay excluded from V1? | Yes. Aliases add impersonation, collision, support, and policy risk before the core buyer experience is proven publicly. |
| 5. Should claim UI stay excluded from V1? | Yes. Direct payout succeeded in the proven lifecycle and escrow was zero. Claim UI is a separate product and disclosure problem. |
| 6. Should source dashboards stay excluded from V1? | Yes. Dashboards can turn proof into money-game psychology before reporting, tax, and anti-abuse rules are ready. |
| 7. Is direct payout first the right posture? | Yes. It matches the contract's cleanest successful path and reduces operational debt. |
| 8. Is escrow fallback acceptable without claim UI? | Yes only if escrow is treated as operational fallback and readback evidence, not a user-facing claim product. If escrow becomes non-zero in production, stop and review before public display. |
| 9. Is buyer-clearable attribution mandatory? | Yes. A buyer must never be trapped into source attribution by hidden state. |
| 10. Is no open self-serve member referral the right V1 boundary? | Yes. Self-serve member referral needs eligibility, abuse handling, support, and disclosure systems that V1 does not yet have. |
| 11. What anti-abuse rules are non-negotiable? | Manual source approval, latest-chain ACTIVE readback, source/buyer self-source block, historical/already-seated wallet guard, cap/window checks, visible source confirmation, clear-source control, no hidden cookies/session hijacking, prohibited-promotion rules, and revocation/re-pause operations. |
| 12. What legal/accounting wording needs review? | Acquisition commission, approved source, payout wallet, escrow fallback, tax/accounting treatment, no agency/employment/official-representative status, no ownership, no return promise, no official endorsement unless separately approved. |
| 13. What UX must exist before wallet signature? | Source label, source status, source class, source wallet or approved display identity, payout posture, commission bps, gross amount, acquisition commission, Net USDC Routed, clear-source control, and the exact buyer disclosure. |
| 14. What must be avoided? | Anything that feels like link farming, hidden attribution, pressure to recruit, public earnings competition, official-representative status, or source rewards disconnected from a verified MembershipSaleV3 purchase. |
| 15. What founder decisions are needed next? | Decide the public name, scope, eligible source classes, manual approval policy, no-alias rule, no-claim rule, no-dashboard rule, buyer disclosure, anti-abuse minimums, legal/accounting review path, and whether to approve, revise, reject, or defer the V1 direction. |

## Risks

| Risk | Why it matters | Required control |
| --- | --- | --- |
| Referral-language drift | "Referral" can make the product feel broadly live before it is. | Use Verified Introduction for buyers; keep Source Attribution for protocol proof. |
| Hidden source attribution | Buyers may distrust attribution if they cannot see it. | Source preview and clear-source control before signing. |
| Alias impersonation | Human-readable codes can collide or impersonate people/brands. | Exclude aliases from V1. |
| Dashboard psychology | Dashboards can turn a proof system into a public money game. | Exclude dashboards from V1. |
| Escrow confusion | Contract escrow exists, but claim UX is not approved. | Direct payout first; escrow readback only; no claim UI. |
| Product-wide overreach | Future products are not source-aware by default. | MembershipSaleV3-only until each product has its own receipt/readback design. |
| Source abuse | Bad actors can misrepresent status or pressure buyers. | Manual approval, source packet acknowledgments, revocation, and prohibited-promotion rules. |
| Stale source state | A paused/revoked/expired source must never route a purchase. | Latest-chain readback and hard-fail gates before buy. |

## Required Founder Decisions

The founder should decide these before any design or implementation sprint:

1. **Name:** approve "Verified Introduction" as buyer-facing language, or provide a replacement.
2. **Scope:** approve MembershipSaleV3-only V1, or defer public product work.
3. **Access model:** approve invite-only/manual source approval for V1.
4. **Eligible source classes:** decide which source classes can appear in V1. Recommended: start only with founder-approved sources; require seated status for `MEMBER_INTRODUCTION`.
5. **Alias posture:** approve no aliases/codes in V1.
6. **Claim posture:** approve no claim UI and no claim balances in V1.
7. **Dashboard posture:** approve no source dashboard in V1.
8. **Payout posture:** approve direct payout first, escrow fallback as operational readback only.
9. **Buyer control:** approve source preview and clear-source as mandatory.
10. **Disclosure:** approve the buyer disclosure direction or request legal/accounting revision.
11. **Anti-abuse:** approve the non-negotiable controls before any public UX design.
12. **Release posture:** require a separate launch packet, Replit sync decision, and live QA before any user-actionable public surface.

## Decision Options

### Option A - Approve As Direction

Current outcome: **selected**.

Meaning:

- Verified Introduction V1 becomes the approved product direction.
- No source links, aliases, dashboard, claim UI, or public source-aware buy path
  are built yet.

Next step:

- Use `docs/VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.md` to build the
  non-activating buyer preview, clear-source, and failure-state skeleton.

### Option B - Approve With Changes

Meaning:

- The founder accepts the need for a constrained V1 but changes one or more
  posture decisions.

Next step:

- Update the framework and tests first.
- Then create the non-activating UX/design specification.

### Option C - Defer

Meaning:

- The engine remains proven, but public product direction waits.

Next step:

- Continue continuous excellence, receipt/readback hardening, Chronicle review,
  or source-operator tooling without public controls.

### Option D - Reject

Meaning:

- Verified Introduction V1 is not the correct public posture.

Next step:

- Keep Source Attribution internal/protocol-only.
- Re-open product strategy later from the proof-to-product gate.

## What Remains Forbidden In Every Option

- No transaction.
- No wallet signing.
- No source activation.
- No referral activation.
- No public source link.
- No alias route.
- No claim UI.
- No source dashboard.
- No public source-aware buy path.
- No registry switch.
- No contract change.
- No ProductSaleRouter wiring.
- No Archive1155, SeatRecord721, or SwapRail source attribution.
- No fake-live language.
- No yield, ROI, passive-income, multi-level, downline, upline, or financial
  leaderboard framing.

## Recommended Founder Approval Sentence

If the founder agrees with the recommendation:

> I approve Verified Introduction V1 as product direction only: MembershipSaleV3-only, invite-only, manually approved, buyer-visible, buyer-clearable back to ZERO_SOURCE_ID, direct-payout-first with escrow fallback, no aliases, no claim UI, no source dashboard, no open self-serve member referral, and no product-wide attribution. This approval does not authorize source activation, public source links, claim UI, dashboards, public source-aware buys, transactions, deployment, or production publish.

## Next Work After Approval

Now that the direction is approved, the next safe sprint is not activation.

The next safe sprint is the **non-activating Verified Introduction buyer
preview, clear-source, and failure-state skeleton**:

- buyer preview states,
- clear-source interaction,
- exact disclosure placement,
- source status hard-fail states,
- anti-abuse failure states,
- route/sitemap/robots posture,
- production QA plan,
- no public launch authority.

This may be implemented only as non-activating infrastructure. Public launch
still requires a separate launch packet and founder approval.
