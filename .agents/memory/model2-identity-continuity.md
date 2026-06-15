---
name: Model 2 identity & chapter continuity verdict
description: Why Model 2 (V2 sells remaining Genesis seats #3–#333) preserves identity/chapters/milestones with NO further contract change, and the two non-contract gates + one audit anti-pattern that future continuity audits must apply.
---

# Model 2 continuity — VERDICT: YES, no further contract change

**Model 2 def:** Sale V2 may sell the REMAINING Genesis seats (member #3–#333), not
only V1. V1 may seal at #1–#2; V2 continues Genesis at Era I pricing and Era II opens
at #334 (range-bounded — see genesis-offset-333-floor.md).

**Why it's safe with zero contract change:** every identity/chapter/milestone/Chronicle/
SeatRecord/referral surface is a PURE function of member NUMBER (or wallet address),
derived from the Holder Index first-seen ordering, with NO V1-vs-V2 branch:
- Holder Index assigns member# by first-seen purchase order across ALL sale contracts;
  founderNumber==memberNumber; raw on-chain memberNumberOf is corroboration only.
- chapters = pure member-number ranges; isFounder = `1..333`; milestones key on buyers count.
- SeatRecord721 is DOCTRINALLY bound to mint from the Holder Index, never raw sale
  counters (doctrine only — no deployed enforcement yet).
- referral/reputation/builder are address-keyed (router emits address attribution).
- Chronicle/chronology/institutional-register/archive order by member# + verified blocks.

## The TWO non-contract live-correctness GATES (must do before V2 publish)
**Both are frontend/indexer WIRING, NOT contract changes — the mechanisms already exist.**
1. **Normalized multi-source indexing.** TRAP: V1 emits `TokensPurchased`; **V2 emits a
   DIFFERENTLY-NAMED event `Purchased(buyer, memberNumber, era, …, bool firstSeat)`**,
   where memberNumber is authoritative ONLY when `firstSeat==true`. The current scanner
   reads a single V1 address + `TokensPurchased` only. "Just add the V2 address" is WRONG —
   you must scan V1 `TokensPurchased` + V2 `Purchased(firstSeat=true)`, normalize to one
   shape, and sort globally by (block, logIndex). Miss this → V2 Genesis seats become a
   MISSING RANGE in the index.
2. **V1-proof write path.** Sale V2 only avoids issuing a returning V1 buyer a NEW seat
   when the buy() call passes that buyer's V1 Merkle `v1Proof` (recognition runs first,
   sets knownMember, so firstSeat=false). If the FE buy UI omits proofs, a returning V1
   member double-seats → identity discontinuity. The contract has the mechanism; the FE
   must supply the proof.

## Implementation traps when these gates are built (silent-failure landmines)
- **Identity-derivation split:** the unified stream feeds TWO things — a contribution/spend
  view (V1 `TokensPurchased` + ALL V2 `Purchased`) and an identity view (seat-issuing =
  V1 first-seen + V2 `Purchased(firstSeat=true)`; V2 `firstSeat=false` adds spend/SYN but
  NEVER a new member#). Never derive identity from raw V2 `memberNumberOf`.
- **Routed join key:** to recover V2 vault/liquidity/operations/referral splits, join
  `Purchased`↔`Routed` by **txHash (+ log order / source contract), NOT by memberNumber** —
  repeat/recognized-V1 buys carry memberNumber 0 or non-unique.
- **Referral arg type:** existing capture stores `?ref=<memberNumber>` in localStorage, but
  V2 `buy()` needs a referrer **ADDRESS** — resolve member#→wallet via the Holder Index;
  reject unresolved / self / zero.
- **Proof must fail CLOSED:** if a connected wallet is in the V1 proof artifact and not yet
  knownMember, the FE must pass `v1Proof` (or force `claimV1Membership` first) or BLOCK the
  buy — never silently buy proof-less (that's the double-seat).
- **"pending:false" is NOT enough — gate on root MATCH.** Structural readiness (pending:false
  + non-empty root) does NOT protect the irreversible gate. The real attack vector is an
  OMISSION: a regenerated snapshot that silently drops a V1 member while still pending:false →
  that member resolves to a fresh buyer ([] proof) → on-chain firstSeat=true → DUPLICATE seat.
  The contract CANNOT catch this (empty proof is valid for a genuine new buyer). The only
  off-chain defense is comparing `artifact.root` to the sealed on-chain `V1_MEMBER_ROOT()`
  (a cryptographic commitment to the EXACT member set — drop one and the root changes).
  Bake `V1_MEMBER_ROOT` as a FE constant (confirmed == contract at wiring) and make the buy
  gate `isArtifactCanonical` = ready && root===constant && count===proofs.length; the buy hook's
  `ready` must use canonical, not structural. **Why:** an honest publish mistake, not just a
  pending flag, is what creates the duplicate-seat. **How to apply:** any future re-publish of
  v1-member-proofs.json must keep root === the on-chain root, or the buy correctly blocks.
- **Cache migration:** `purchase-events-cache` must bump its schema/version and key on
  chainId + BOTH sale addresses + both deployment blocks; prefer per-source cursors over one
  global cursor, or an old V1-only snapshot silently hides V2 events.
- **Seal V1 AT the snapshot block (correctness, not optional):** `V1_MEMBER_ROOT` is an
  IMMUTABLE constructor arg frozen from the snapshot. Any V1 sale that lands AFTER the
  snapshot creates a V1 member absent from the root → unrecognizable in V2 → orphaned
  identity or double-seat. So V1 must be `pause()`d (it exposes `paused()` → OZ Pausable;
  permanent seal = pause + optionally sweep unsold SYN) at/before the snapshot block, and no
  in-flight V1 buy may land between snapshot and pause. Sealing ≠ deleting: keep V1 on-chain,
  Holder Index keeps reading its history forever; sealing only stops NEW first-seen entries.

## Audit ANTI-PATTERN (apply to every future Model 2 continuity pass)
Pure member-number boundaries — "#1–#333", "Chapter I seals at #333", "Founders #1–#333" —
remain TRUE under Model 2 and are NOT a wording risk. Do NOT propose editing them. Only
**V1-ATTRIBUTION** wording is at risk ("Genesis is V1-only", "first 333 sold on V1",
"derived from the Membership Sale [v1]", indexer-scope docs that say "v1", and
future-binding note strings that say the indexer derives member# "from TokensPurchased"
specifically). Note: the FROZEN draft (.draft.sol) and the architecture doc's
explicitly-SUPERSEDED/historical section keep "V1-only" ON PURPOSE — leave them.

**Verdict:** YES — Model 2 preserves identity/chronology/chapters/milestones/Holder Index/
SeatRecord721/referral/reputation/builder with no further contract change; ready for
external-audit prep contingent on the two wiring gates above.
