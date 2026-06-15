---
name: LivePurchase approve→buy two-step UX
description: Why the /join purchase is an explicit 2-signature flow, the tri-state allowance trap, and the member-aware recovery banner.
---

# LivePurchase approve → buy is TWO signatures, made explicit

USDC `approve` and the sale `buy()` are two separate wallet signatures. The old
single action button silently relabelled "Approve USDC" → "Buy SYN" after the
approval confirmed, so a buyer signed the approve, saw it confirm, and believed
the purchase was done (real incident: allowance funded, no buy, memberCount stuck).

Cure (frontend only, no contract/economics change): a derived 3-step state
machine + `PurchaseStepper` (Approve USDC / Buy membership / Verified member,
status = upcoming|active|pending|confirmed|failed) + a `BuyStepGuidance` recovery
banner, and the buy button label is now "Complete purchase now".

**Why:** approval-confirmed must never read as purchase-complete. The buy is a
distinct, mandatory second signature; the seat only exists after `buy()` confirms.

## Tri-state allowance trap (non-obvious)
`needsApprove = allowance !== undefined && allowance < usdcRaw` is **false while
allowance is still `undefined` (loading)**. Same for `insufficientUsdc` vs balance.
So a naive if/else chain falls straight through to the buy branch before wallet
reads load — offering a buy that can revert, and contradicting any step tracker.

**How to apply:** gate on a `walletReady = allowance !== undefined && balance !==
undefined` flag. Add a `"Loading wallet state…"` button branch BEFORE `needsApprove`,
and fold `walletReady` into the "sale actionable" predicate that drives the stepper,
so button and tracker agree during load.

## Recovery banner must be member-aware
The banner shows when allowance is on-chain but the buy is the only remaining
action (`buyStatus === "active"`). Copy like "Purchase not completed yet /
Approval alone does not create a seat / your member number appears after Buy" is
correct for a NEW buyer but FALSE for an existing member buying more (they already
hold a seat — and step 3 would say "Verified member").

**How to apply:** pass `isMember = Boolean(useHolderIndex().getByWallet(address))`
into the banner; for members reword to "USDC approved for another purchase" and
drop the seat/member-number bullets. `useHolderIndex()` is the same verified-seat
source the success receipt uses; call it unconditionally at component top (SSR-safe,
wallet UI already gated behind `isConnected && !wrongChain`).

## Don't touch
buy() args (usdcRaw, minSynOut, v1Proof, referrer=null) are unchanged. Repeat-buy
staleness from a persisted old buy hash is handled by the existing "New purchase"
reset (`persisted.clear()`), not by extra machinery.
