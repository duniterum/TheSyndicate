---
name: V1-proof buy gate — fresh-buyer carve-out
description: Why the live V2 buy must gate ONLY recognized members on the proof artifact, never fresh buyers.
---

# V1-proof buy gate must not over-block fresh buyers

The V2 buy needs a Merkle `v1Proof[]` so a returning member's seat is CONTINUED
(not duplicated). The proof comes from a client-fetched canonical artifact
(`public/v1-member-proofs.json`, `root === V1_MEMBER_ROOT`).

**The bug:** the buy was gated on `SALE_V2_LIVE && !v1Proof.ready` for EVERY
buyer. That over-blocks a fresh buyer (who provably needs `proof: []` and no
artifact) and was a dead end (no retry; `useV1Proof` had `retry:1` +
`staleTime:Infinity`). Approve succeeded, Buy stayed disabled
("Membership data unavailable"), no buy tx ever submitted.

**The rule (frozen):** `RECOGNIZED_MEMBERS` is the COMPLETE set the on-chain
`V1_MEMBER_ROOT` commits to. So:
- A wallet NOT in that set can NEVER be a returning member → `[]` is always
  correct AND safe → it must NEVER be gated on artifact availability.
- ONLY a recognized member needs the artifact, and stays strictly fail-closed
  (blocked) until a canonical artifact is in hand.

**Why:** duplicate-seat risk only exists for the recognized set; gating everyone
on a client fetch turns a transient miss into a permanent buy block.

**How to apply:** gate buy on `isRecognizedMember(address) && !ready`
(`memberProofPending`), not on `!ready` alone; resolve the buy with an
address-aware `resolveForBuySafe` (fresh → `[]` without artifact; recognized →
strict `resolveV1ProofForBuy`); make the recognized-member-blocked state
RECOVERABLE (expose `refetch`, show a retry, not a dead end). Never reintroduce a
global `SALE_V2_LIVE && !v1Proof.ready` buy gate. Fix requires REPUBLISH to go
live (custom domain thesyndicate.money is the live deploy).
