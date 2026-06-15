# The Syndicate — Sale V2 V1-Membership Proof-Flow Plan

**Type:** Execution-prep PLANNING ARTIFACT. Read-only. No deploy, no contract
change, no fund movement, no frontend change. This plan describes the exact,
real (non-fictional) mechanism by which a Sale V1 member is recognized in
Sale V2, how to generate the data, and how to prove it works on mainnet with
**zero SYN at risk** before any inventory is funded.

**Source of truth:** `contracts/src/SyndicateSaleV2.sol`
(`claimV1Membership`, `buy`, `_verifyV1`), `contracts/README.md` (root
generation), `.agents/memory/identity-hierarchy-freeze.md` (identity doctrine).

---

## 1. Why a proof flow exists

Sale V2 continues a **single global seat sequence** from Sale V1. At handoff:

- `memberCount` is seeded to `GENESIS_OFFSET` (the final V1 unique-member count).
- `V1_MEMBER_ROOT` is the Merkle root of the frozen V1 member address set.

A V1 member proving membership becomes `knownMember = true` **without consuming
a new V2 seat number** (`memberNumberOf` is set **only for V2-new seats**). This
is what preserves seat continuity and keeps the **Holder Index** — not the sale
counter — as the identity of record (see the ratified identity hierarchy).

Concretely (production code):

```
memberCount               = genesisOffset           // constructor
knownMember[addr]         = V1-proven OR V2-bought
memberNumberOf[addr]      = set ONLY for a V2-new first seat
// first V2 newcomer when offset=333 → seat #334 (Era II)
```

---

## 2. The two on-chain entry points

### a. `claimV1Membership(bytes32[] proof)` — recognition, no purchase
- Reverts `AlreadyKnown` if already recognized; reverts `InvalidProof` on a bad proof.
- Sets `knownMember[msg.sender] = true`. **Moves no funds. Needs no SYN funding.**
- Idempotent and safe — the ideal pre-funding mainnet smoke test.

### b. `buy(uint256 usdcIn, address referrer, uint256 minSynOut, bytes32[] v1Proof)`
- If `v1Proof.length > 0 && !knownMember && _verifyV1(v1Proof)` → marks the buyer
  `knownMember` in the same tx (so a V1 member's first V2 buy is recognized).
- `minSynOut` is the buyer's slippage floor. `referrer` is re-validated by the
  router. A first seat increments `memberCount` and assigns `memberNumberOf`.

### c. Verification primitive — `_verifyV1`
```solidity
// OZ MerkleProof.verify, STANDARD double-hashed leaf
leaf = keccak256(bytes.concat(keccak256(abi.encode(who))));
return MerkleProof.verify(proof, V1_MEMBER_ROOT, leaf);
```
> Use the exact leaf-hashing in `contracts/README.md` when generating the tree —
> a mismatch (single vs double hash, `encode` vs `encodePacked`) silently makes
> every proof invalid.

---

## 3. Snapshot → root generation (the data)

1. **Pause Sale V1** at the Genesis ceiling (target seat #333). Record the final
   block.
2. **Derive the V1 member set from the Holder Index** — the canonical
   first-seen `TokensPurchased(buyer, …)` ordering, de-duplicated by buyer (NOT a
   raw SYN `Transfer` scan). This is the same source the website already treats
   as member identity.
3. `genesisOffset = count(distinct V1 buyers)`. Sanity: must be `≥ 333` and
   `< 1_000_000`.
4. Build the Merkle tree over the member addresses using the **exact** leaf
   scheme in `contracts/README.md`; capture the **root** and, for each member, a
   reproducible **proof**.
5. Publish the member list + per-address proofs as a static, verifiable artifact
   (so any member can independently reconstruct the root → "don't trust, verify").

```
 Sale V1 (paused #333)
        │  scan TokensPurchased (Holder Index, first-seen, dedup buyer)
        ▼
 ordered member set  ──►  count = genesisOffset
        │
        ├──► Merkle tree (double-hashed leaves)  ──►  V1_MEMBER_ROOT  ──► constructor
        └──► per-member proofs  ──► published artifact ──► frontend / claim
```

---

## 4. Mainnet proof-of-correctness sequence (zero funds first)

| Step | Action | Funds at risk | Pass criteria |
|------|--------|---------------|---------------|
| P1 | Deploy router + Sale V2 with the real `genesisOffset` + `v1MemberRoot` | none | `memberCount() == genesisOffset`; `V1_MEMBER_ROOT()` matches the published root |
| P2 | Pick a **known V1 wallet**; generate its proof from the published tree | none | proof reconstructs the root locally |
| P3 | Call `claimV1Membership(proof)` from that wallet | **none** | tx succeeds; `knownMember(wallet) == true`; `memberNumberOf(wallet) == 0` (no new seat consumed) |
| P4 | Call `claimV1Membership(proof)` again | none | reverts `AlreadyKnown` (idempotency proven) |
| P5 | Call `claimV1Membership(badProof)` from a non-member | none | reverts `InvalidProof` (negative path proven) |
| P6 | Fund SYN **≥ reserve floor** (`_reserveSyn(genesisOffset)`; ≈3.93M SYN if `reserveThroughSeat = 10_000`) | inventory | `currentReserveFloor()` / `sellableSynForNextSeat()` read sane |
| P7 | A **new** wallet runs `buy(usdcIn, 0, minSynOut, [])` (no proof, first V2 seat) | small USDC + SYN | seat = `genesisOffset + 1`; `memberNumberOf` set; 70/20/10 routed; `Attribution` emitted |
| P8 | A **V1** wallet runs `buy(usdcIn, 0, minSynOut, v1Proof)` | small | recognized via proof in-tx; behaves per the seat rules without double-counting |

> P1–P5 validate the entire V1-proof path with **no SYN inventory and no buyer
> USDC at risk**. Only P6+ require funding. This is the safe, real, on-chain
> proof the founder asked for before scaling funding.

---

## 5. Files / tests that already cover this

- `contracts/test/SyndicateSaleV2.t.sol` — Merkle proof valid/invalid,
  `claimV1Membership` idempotency, seat continuity from `genesisOffset`,
  reserve-floor reverts. (Suite GREEN. NOTE: the later **2026-06-15 F4
  parameter-lock** changed the timelock constants in
  `contracts/src/SyndicateSaleV2.sol` and re-ran the full Foundry suite — 71 tests
  GREEN; this plan's V1-proof coverage is unaffected.)
- `contracts/README.md` — the canonical `V1_MEMBER_ROOT` generation procedure.

## 6. Blockers

1. Live V1 snapshot (pause + Holder-Index export) → `genesisOffset`, member set,
   root, per-member proofs.
2. Published, independently-verifiable proof artifact.
3. Frontend proof generation for connected wallets (see the Frontend Wiring
   Readiness Plan — an after-deploy item, not required for P1–P5 via a script).
