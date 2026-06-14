---
name: Self-service claim ↔ sale inventory truth
description: Why "every tier is self-service / available online" copy must be bounded by live sale inventory, and the buy-UI guard that enforces it.
---

# Self-service claim must be bounded by live sale inventory

When public copy asserts that **every** rank/package is self-service / "available
online via wallet checkout", that is a verifiable truth claim, not marketing. It
is only true up to the sale contract's **remaining on-chain SYN inventory**
(`availableSyn`, read as `ln` on the Membership Sale).

**Why:** The fixed access rate is 1 SYN = $0.01 USDC, so the top tier
**Cornerstone ($10,000) requires 1,000,000 SYN** in a single buy. The sale was
funded with ~1,000,000 SYN and inventory only drops as members buy, so a one-shot
Cornerstone purchase already exceeds `availableSyn` (≈997,500 at snapshot) and
would **revert on-chain**. Claiming "all tiers buyable online" unconditionally is
therefore false the moment inventory < the quoted amount.

**How to apply:**
- The buy UI (`LivePurchase`) must block any amount whose quoted SYN exceeds
  `availableSyn` — there is an `exceedsInventory` state ("Amount exceeds sale
  inventory") between `belowMin` and `insufficientUsdc`. Don't remove it; it makes
  the self-service claim self-maintaining (no per-tier hardcoding that goes stale
  as inventory changes or is refunded).
- The zero-inventory case ("Waiting for SYN Inventory") is separate; keep both.
- Blanket doctrine copy (package-catalog comment, whitepaper extraction map,
  TODAY_BASELINE) must say self-service **"up to the sale's live/remaining SYN
  inventory"**, never an absolute "any amount" / "no tier is gated" without it.
- Do NOT special-case the Cornerstone tagline ("Available online via wallet
  checkout" is fine) — re-introducing a per-tier distinction is the exact "manual
  onboarding" framing that was removed. The dynamic buy guard is the truthful fix.
- Rank is cumulative USDC, so a member can still *reach* Cornerstone rank over
  many buys; only the single-shot package buy is inventory-bounded. Keep that
  distinction straight when writing copy.
