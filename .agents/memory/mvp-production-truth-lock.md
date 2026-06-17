---
name: MVP pre-promotion production-truth lock
description: V2b-is-the-live-sale topology, the V2b.totalUsdcRaised=0 gotcha, the merged proof artifact, the canonical money label, and the post-MVP backlog. Read before touching sale wiring, sale stats, or the proof artifact.
---

# MVP pre-promotion production-truth lock

Verified on Avalanche mainnet (43114) during the final pre-promotion hardening pass.

## Sale topology (durable)
- **V2b `0x507E9c…B88b` is the ONLY live sale** — `ACTIVE_SALE` resolves to it; quote / approve-spender / buy all target it. On-chain: `paused=false`, funded (SYN balance == `availableSyn`), seat counter continues from the merged member count.
- **V2a `0x0b883…2b48` and V1 `0x0020…842d` are SEALED** — both read `paused=true` on-chain. They survive ONLY as historical scan sources for member continuity; there is no active buy path on either. Do not resurrect them as a buy/quote/approve target.

## Gotcha: V2b `totalUsdcRaised()` reads 0 even with members
**Why:** the existing seats (#1–#2 on V1, #3–#5 on V2a) were filled on the OLDER contracts. V2b was deployed already knowing the member count (Model-2 continuation), so it reports `memberCount` ≥ 5 / `nextSeatNumber` ≥ 6, but its OWN `totalUsdcRaised`/`totalSynSold` stay 0 until the first public buy lands on V2b.
**How to apply:** a fresh `V2b.totalUsdcRaised()==0` is NOT broken/unfunded — don't "fix" it. The site's aggregate "Total USDC routed" / member stats deliberately SUM V1 + V2a + V2b (see the canonical multi-source purchase scan in `activity-hooks.ts`), so the public number is correct while the single V2b counter is still 0.

## Proof artifact (durable)
- `public/v1-member-proofs.json` = the MERGED V2b-canonical snapshot: `root 0xa1f2ed10…718c49`, `count 5`.
- The old **V1-only root** (`0xae75ae20…74ff`) and the **`count = 2` rehearsal placeholder** (in `docs/proposals/SALE_V2_V1_SEAL_AND_SNAPSHOT_EXECUTION_PACKAGE.md`) are SUPERSEDED dry-run artifacts. Never restore them as live values.

## Money wording (durable)
- Canonical public label for USDC inflow = **"USDC routed"** (also allowed: purchases · sale volume · receipts · routing proof · protocol/treasury movements). Never public: raised · contributed · contribution · proceeds · invest(or) · payout · dividend · yield · return · equity · profit · revenue share.
- `totalUsdcRaised()` / `usdcRaised` / `usdcContributed` are **ABI/internal identifiers** — deliberately exempt from the wording guards (doctrine-guard money-"raised" patterns require a space before "raised"; ownership-wording allows them). Never rename ABI fields to satisfy wording; fix only rendered copy.

## Post-MVP backlog (NOT this sprint)
Deferred by founder scope: deeper **package / rank / chapter** redesign + reconciliation; **referral** (CommissionRouter) go-live; **SeatRecord721** mint-from-index. These are future — keep current copy non-misleading but do not build them as part of MVP hardening.
