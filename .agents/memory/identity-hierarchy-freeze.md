---
name: Identity hierarchy freeze
description: Ratified master identity source + the irreversible SeatRecord721 mint-source rule; how every future identity layer keys identity without migrations.
---

# Identity hierarchy freeze (ratified)

Frozen hierarchy: **Wallet Address → Holder Index → Member Number → SeatRecord721**.

## Master source
- **Master identity source = the Holder Index (Protocol Identity Layer)** — member number is DERIVED from `TokensPurchased` by FIRST-SEEN ordering across ALL sale contracts (V1 + V2 + future). This is not new: `docs/HOLDER_INDEX_ARCHITECTURE.md` + `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md` already rule "Member = sale buyer; member number derived from sale events via holder-index.ts."
- On-chain `SyndicateSaleV2.memberNumberOf` / `memberCount` / `firstSeat` are RAW MATERIAL / convenience fields, **never identity**. The Holder Index de-dups the M2 double-count (first-seen wins).

## Permanence map (the load-bearing insight)
- Only **on-chain events** and **minted NFTs** are permanent. Events are permanent AND ground-truth (safe). Everything derived (member number, holder index, /member/N, reputation, builder records) is **rebuildable from chain alone** → mistakes there are recomputations, not migrations.
- A **minted NFT (SeatRecord721)** is the ONLY layer that freezes a *derived* value into an irreversible token. That is the single place an identity mistake becomes permanent.

## SeatRecord721 freeze rule (THE irreversible gate)
- **Rule:** SeatRecord721 MUST derive its member number from the **Holder Index (Protocol Identity Layer)**, recorded on-chain at mint via a Merkle/sig proof of `(wallet → member number)` OR an authorized minter that supplies the reconciled number. It MUST NEVER read raw `memberNumberOf`/`firstSeat`/`memberCount`.
- **Why:** a contract can't run the indexer, so "pure on-chain identity" would force it onto raw sale numbering, which carries the M2 double-count. Minting from raw sale state freezes that divergence into permanent, non-migratable seat tokens (corrupt chronology, duelling seats, inflated governance). Model = **C anchored to B** (derive off-chain, record on-chain via proof/trusted mint).

## M2 — one person = one seat (operational, NOT a contract change)
- Identity = **first-seen wallet address**. The immutable sale contract can't enforce one-seat (holds only a Merkle root), so enforce operationally:
  1. Buy-UI ALWAYS injects `v1Proof` for any connected wallet in the V1 set → on-chain double-seat effectively never happens on the normal path.
  2. Even if a raw no-proof call slips through, the Holder Index keeps the original number (first-seen) → public identity stays correct; only on-chain `memberNumberOf` diverges (harmless because nothing reads it as identity).
  3. Future SeatRecord721 mints from the index, not sale state.

## Indexer mandate (future-work, required at V2 deploy)
- The indexer currently scans the LIVE V1 sale only. Post-V2 it MUST scan **V1 + V2 in union**, preserving first-seen ordering across the boundary (genesisOffset = V1 final count keeps on-chain V2 numbering aligned with the continued index ordering).

## Future-layer keying (all reconcile to the master source)
- address-keyed: Referral (`referredCount`/Attribution), Reputation, Builder Records, Governance weight, AI Layer (read-only).
- member-number-keyed (via index): Chronicle (per-member entries e.g. Member #1), SeatRecord721.
- artifact-keyed: Signal Chamber (Archive1155 possession). CAVEAT: artifacts are transferable — decide artifact-vs-member keying before it confers standing.
- holder/wallet-keyed (NOT member): Marketplace / royalties (holder ≠ member, intentional).
- Open future-additive (NOT a rewrite): identity = wallet, not person; linked-wallet / account-abstraction is a layer ON TOP of the wallet anchor, safe to defer.

## Verdict
- **SAFE TO FREEZE.** No migration-forcing conflict found; identity is single-source-consistent. Remaining before execution are decisions/spec, not redesigns (ratify the master-source rule + SeatRecord721 mint-source + Signal-Chamber keying; build SeatRecord721/Governance/etc. as consumers).
