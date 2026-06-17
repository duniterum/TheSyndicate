---
name: Carried V1 member buying on V2b emits memberNumber=0
description: How the live V2b sale behaves when a recognized V1 member re-buys — identity heals via holder index, never the contract number.
---

# Carried-member repeat-buy on V2b → memberNumber 0 (PROVEN in production)

A recognized V1 member (knownMember=true) who buys on V2b — **even when passing a valid v1Proof in buy()** — does NOT get a fresh V2b seat:
- `memberNumberOf(addr)` stays **0**.
- `Purchased` events emit **memberNumber=0**, **firstSeat=false**.
- `memberCount` does NOT increment for these buys.
- `usdcContributed` / `usdcByAddressEra` DO accrue normally; Routed split is still exact 70/20/10.

**Why this is correct, not a bug:** Model-2 continuity keeps a carried member's ORIGINAL V1 identity. They must not mint a second seat. Identity is resolved entirely by the off-chain Holder Index (`buildHolderIndex`, first-seen ordering across V1+V2a+V2b), which assigns the canonical founder number and ignores the emitted `memberNumber`. The index also recomputes rank from **cumulative** USDC on every repeat buy (holder-index.ts ~L233), so rank is monotonic regardless of the zero.

**Two distinct on-chain seat-assignment behaviors observed:**
- Fresh wallet (no V1 history) → first buy emits firstSeat=true + a real new memberNumber, memberCount +1.
- Carried V1 wallet → all V2b buys emit memberNumber=0, firstSeat=false, memberCount unchanged (no duplicate seat).

**Subtlety worth remembering:** passing `v1Proof[]` inside `buy()` enforces the anti-duplicate / one-seat gate but does NOT write an on-chain member number — only a separate `claimV1Membership(proof)` call would. The site never needs that call because every surface derives identity from the Holder Index, never raw `memberNumberOf`. Any new surface that naively reads `memberNumberOf` for a carried member would wrongly show 0 / "non-member" — always go through the index.

**Identity-surface audit verdict (whole app):** `memberNumberOf` / `knownMember` have ZERO call sites in `src/` — they exist only as ABI declarations in `sale-abi.ts` (every other hit is `contracts/` Solidity, Foundry tests, or `attached_assets/` notes). Every "Member #N" surface reads `HolderRecord.memberNumber` (which equals the first-seen `founderNumber`), never the contract. Naming-collision trap: `HolderRecord.memberNumber` (SAFE, index-derived) vs contract `memberNumberOf` (UNSAFE, returns 0 for carried) — a future `useReadContract({functionName:"memberNumberOf"})` wired to a "Member #" display would silently reintroduce the bug.

**The ONE place a raw zero reaches the UI:** `activity-hooks.ts` (`joinV2PurchaseEvents`) maps the V2 `Purchased.memberNumber` into `PurchaseEvent.purchaseId`. For carried members that field is 0, so `LiveActivityFeed` and `MiniExplorer` render **"Purchase #0"**. It is a purchase LABEL, not an identity claim (the row identifies the buyer by wallet address, always correct) — never "Member #0"/"non-member". `purchaseId` is semantically conflated: V1 events = real purchase counter; V2 events = seat/member number (0 for carried). Never render `purchaseId` AS a "Member #".

**Other reconciliation gotchas confirmed in the same pass:**
- A member's cumulative SYN (sum of event `synOut`) can exceed their current SYN balance — SYN is transferable, so balance ≠ purchased. The index/member page report event-cumulative, not balance. Not a mismatch.
- NFT holdings (Archive1155 First Signal ID1 / Patron Seal ID3) are fully independent of seat identity and rank — a member can hold several artifacts and it changes neither their member number (first-seen) nor rank (cumulative USDC).
