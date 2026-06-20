# SeatRecord721 Architecture Decision and Specification Freeze

Status: SPECIFICATION FROZEN / NOT IMPLEMENTED / NOT DEPLOYED / NOT LIVE

Last updated: 2026-06-20

Binding doctrine:

- SYN is the V1 membership seat.
- Holding SYN means the wallet is seated.
- Archive1155 artifacts are protocol memory, not seats.
- SeatRecord721 is reserved for a future identity record.
- No SeatRecord721 balance, claim, mint, eligibility, or address exists today.

## 1. Decision

SeatRecord721 must be a separate future ERC-721 identity contract. It must not
be implemented inside SyndicateArchive1155 and must not compete with SYN as the
membership seat.

The final architecture is:

- SYN = the live V1 seat.
- Holder Index = the current identity source of record.
- SyndicateArchive1155 = protocol memory artifacts.
- Archive1155 ID 2 = disabled pointer to future SeatRecord721 only.
- SeatRecord721 = future identity record derived from existing membership truth.

No product surface may describe SeatRecord721 as live until a contract is
implemented, tested, audited, deployed, verified, registered, and read back on
Avalanche C-Chain.

## 2. What SeatRecord721 Is

SeatRecord721 is future identity infrastructure. Its job is to preserve a
member's protocol identity in a durable, contract-backed record.

It should answer:

- which member number the seat is associated with,
- which wallet first took that seat,
- which chapter the seat entered,
- which transaction and block anchor the identity,
- what record proves the identity lineage,
- whether the record is current, reassigned, burned, or retired.

SeatRecord721 should make identity more durable. It must not become a speculative
NFT product.

## 3. What SeatRecord721 Is Not

SeatRecord721 is not:

- the V1 seat,
- a replacement for SYN,
- a reward,
- a claim,
- a governance right,
- a yield product,
- a social profile,
- an Archive1155 memory artifact,
- a public-open mint,
- a requirement for membership,
- proof that a wallet is seated unless it reconciles to live SYN and Holder
  Index truth.

## 4. Source Of Truth

The Holder Index remains the identity source of record until SeatRecord721 is
implemented and reconciled.

SeatRecord721 must derive from:

1. live SYN seat truth,
2. first-seen Holder Index ordering,
3. verified Membership Sale purchase history,
4. canonical chapter assignment rules.

Sale V2 counters may corroborate identity, but they must not replace the Holder
Index as the identity source of record.

## 5. Transferability Freeze

Recommended V1 policy: non-transferable identity record.

Reason:

- the seat can move by SYN transfer,
- the identity record should preserve member history,
- open transferability would let identity detach from the member history it
  claims to preserve,
- a marketable identity NFT would confuse The Syndicate with an NFT project.

Before implementation, the contract spec must choose one of these explicit
models:

| Model | Status | Notes |
| --- | --- | --- |
| Soulbound / non-transferable | RECOMMENDED | Best aligned with identity continuity and no-speculation doctrine. |
| Constrained transfer | REQUIRES DESIGN | Could support wallet recovery but needs strict policy and events. |
| Fully transferable | REJECTED FOR V1 | Creates market, identity drift, and doctrine confusion. |

Wallet-change support should be handled as a future reassignment or linked-wallet
process, not as ordinary NFT transfer.

## 6. Mint Authority And Eligibility

No public mint is approved today.

Before any mint path exists, the implementation must freeze:

- who can issue records,
- whether minting is self-serve, admin-issued, or both,
- the exact eligibility proof,
- how duplicate wallet, duplicate member number, and wallet-change cases fail,
- whether secondary SYN holders can receive a record immediately or require a
  later identity reconciliation policy.

Open founder decision:

Secondary-market SYN holders are seated by SYN balance. Whether and how they
receive canonical member numbers in SeatRecord721 must be decided before
implementation. Until then, no UI may imply SeatRecord721 eligibility for any
wallet.

## 7. Metadata Freeze

SeatRecord721 metadata must avoid hype, rarity, financial value, and personal
data.

Required metadata direction:

- member number,
- original purchasing wallet,
- current recorded wallet if reassignment exists,
- first purchase transaction hash,
- first purchase block number,
- joined chapter,
- issue transaction hash,
- record status,
- immutable or permanence-backed metadata storage.

Forbidden metadata direction:

- rarity language,
- reward level,
- financial upside,
- governance weight,
- private personal details,
- mutable marketing traits that change the meaning of the record.

## 8. Required Events

The future contract should emit events rich enough for Activity, Chronicle,
Institutional Register, Archive, and My Syndicate read models.

Minimum event requirements:

- record issued,
- record retired or burned,
- record reassigned or linked, if wallet-change policy exists,
- metadata frozen or updated, if metadata mutability exists,
- authority changes.

Events must include enough information to reconstruct identity history without
trusting frontend state.

## 9. Archive1155 ID 2 Rule

Token ID 2 in SyndicateArchive1155 remains reserved and disabled in V1.

Binding behavior:

- ID 2 is never public mintable in Archive1155 V1.
- ID 2 is never admin-mintable in Archive1155 V1.
- ID 2 is not an identity source.
- ID 2 is only a disabled pointer to future SeatRecord721.
- `maxSupply == 0` means locked / not mintable, not unlimited.

## 10. Frontend Activation Sequence

Current state:

- registry: PENDING,
- address: null,
- public route state: RESERVED / FUTURE,
- action state: no action,
- claim state: no claim,
- mint state: no mint.

Future sequence:

1. Write Solidity spec and Foundry tests.
2. Review Holder Index reconciliation and secondary-holder policy.
3. Complete audit/static analysis.
4. Deploy only after founder approval.
5. Verify contract source.
6. Register the real address in the contract registry.
7. Add read-only status first.
8. Add wallet readback and explorer proof.
9. Add mint or reassignment UI only after read-only state is proven.

## 11. Tests Required Before Implementation

The future contract must have tests for:

- only eligible member identities can receive a record,
- a member number cannot be duplicated,
- a wallet cannot mint multiple records unless policy explicitly permits it,
- transfer behavior follows the frozen model,
- metadata cannot misrepresent membership truth,
- Holder Index reconciliation is deterministic,
- burn/reassignment/linking behavior emits durable events,
- owner/admin powers are bounded and documented,
- no Archive1155 ID 2 behavior is treated as identity issuance.

## 12. Allowed Wording

- "SeatRecord721 is reserved for a future identity record."
- "SYN is the V1 membership seat."
- "Archive1155 artifacts are memories, not seats."
- "Archive1155 ID 2 is a disabled pointer only."
- "No SeatRecord721 claim, mint, balance, eligibility, or address exists today."

## 13. Forbidden Wording

- "SeatRecord721 is live."
- "Mint your SeatRecord721."
- "Claim your Seat Record."
- "SeatRecord721 is your membership seat."
- "The Seat Record NFT proves your seat."
- "SeatRecord721 eligibility is open."
- "Archive1155 Seat Record artifact."
- "`maxSupply == 0` means unlimited."
- "SeatRecord721 gives rewards, yield, governance, or status."

## 14. Go / No-Go Before Implementation

Implementation remains blocked until:

- founder approves transferability policy,
- founder approves secondary-holder identity policy,
- Holder Index reconciliation spec is complete,
- metadata permanence plan is complete,
- Solidity spec is reviewed,
- Foundry test plan is accepted,
- no public product surface implies live eligibility.

Until those gates are green, SeatRecord721 stays a future identity record only.
