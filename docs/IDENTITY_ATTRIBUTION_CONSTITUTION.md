# Identity and Attribution Constitution

Status: CANONICAL CONSTITUTION / NO DEPLOYMENT AUTHORIZED

This document freezes the identity and attribution model that must govern future
Privy, SeatRecord721, Referral, SourceRegistry, MembershipSaleV3, My Syndicate,
Activity, Register, Chronicle, Archive, and notification work.

It does not deploy, activate, or frontend-wire any system. It prevents future
systems from quietly changing what a seat is, who controls identity history, or
who may claim acquisition attribution.

## 1. Binding Doctrine

The Syndicate separates three layers:

1. Current seat status.
2. Historical identity.
3. Attribution relationship.

These layers are related, but they are not the same thing.

Binding rules:

- SYN is the V1 membership seat.
- A wallet is currently seated when it holds SYN.
- The seat is binary; contribution is variable.
- Holder Index and receipts preserve historical identity.
- Attribution records who introduced or sourced a purchase under explicit terms.
- A source never owns a member.
- SeatRecord721 may later preserve identity continuity, but it does not replace SYN.
- Privy may improve onboarding and account management, but it is not the source
  of membership truth.
- Recovery can add visible identity history; it must not rewrite chain history.

## 2. Identity Model

### Seat Owner

A seat owner is the wallet that currently holds SYN.

Current seat status follows live token balance:

```text
SYN balance > 0 -> wallet is seated
SYN balance = 0 -> wallet is not currently seated
```

This is the V1 membership truth. No UI, document, future identity record, Privy
session, referral status, rank, receipt, or Archive artifact may override it.

### Wallet Owner

A wallet owner is the controller of the wallet or account session.

The protocol cannot directly know the human, company, agency, or institution
behind a wallet unless additional proof exists. Wallet control is proven through
wallet signatures, transaction history, contract reads, and future identity
records or attestations.

Do not equate:

- a wallet address with a legal person,
- a Privy account with a seated wallet,
- a SeatRecord721 with live SYN balance,
- a historical receipt with current control of the seat.

### Historical Identity

Historical identity is the record of how a member entered and what that seat
helped the institution become.

Historical identity may include:

- original entry wallet,
- recipient wallet,
- member number,
- chapter,
- era,
- purchase transaction,
- receipt,
- contribution depth,
- source attribution,
- Activity / Register / Chronicle / Archive links,
- future institutional trust-capital records.

Historical identity does not automatically move when SYN transfers. If Alice
entered first and later transfers SYN to Bob, Bob may become seated, but Alice's
entry history remains Alice's entry history.

## 3. Seat Movement And Migration

SYN is transferable. Therefore current seat status can move.

Identity migration is different. A future identity migration or reassignment
must be explicit, visible, and reconstructable.

Allowed future migration forms:

- self-service linked wallet, when old wallet can sign,
- admin-assisted reassignment, only under a visible policy and event trail,
- record retirement and reissue, if SeatRecord721 design approves it,
- linked-wallet status without changing original historical entry.

Forbidden migration forms:

- silent reassignment,
- frontend-only reassignment,
- treating a SYN transfer as automatic historical identity transfer,
- erasing the original entry wallet,
- pretending recovery is complete when the protocol only has partial proof.

## 4. Recovery Policy

V1 recovery is limited.

SYN has no admin pause, no blacklist, no clawback, and no forced recovery path.
If a wallet is compromised and SYN leaves, the protocol cannot reverse that
token transfer.

Future recovery may preserve identity continuity, but it must be honest about
what it can and cannot do.

Minimum proof for future recovery should include:

- original wallet signature, if possible,
- new wallet signature,
- original receipt or Holder Index proof,
- transaction/block proof,
- source or payout-wallet proof if attribution is affected,
- visible Register entry for admin-assisted recovery,
- challenge/delay window for high-impact cases.

Recovery outputs should be explicit:

- linked wallet,
- reassigned identity record,
- retired record,
- compromised source paused,
- payout wallet updated,
- unresolved recovery request.

No recovery UI may imply guaranteed restoration of tokens, commissions, ranks,
or claims unless the relevant contract can enforce it.

## 5. Privy Boundary

Privy is an onboarding and account-management layer.

Privy may help with:

- Web2-friendly login,
- embedded wallets,
- account sessions,
- linked wallets,
- safer wallet onboarding,
- future notifications,
- member account continuity in My Syndicate.

Privy must not become:

- membership truth,
- seat truth,
- replacement for wallet signatures,
- replacement for SYN balance,
- replacement for Holder Index,
- replacement for contract receipts,
- hidden custodian of attribution rights.

Privy integration must preserve the crypto-native wallet path. A MetaMask,
hardware wallet, WalletConnect, or injected wallet user must remain able to use
the protocol without weaker trust assumptions.

## 6. SeatRecord721 Boundary

SeatRecord721 is future identity-record infrastructure.

It may later record:

- member number,
- original entry wallet,
- current recorded wallet, if reassignment exists,
- entry chapter,
- entry era,
- purchase proof,
- identity status,
- linked-wallet history,
- institutional trust-capital history.

SeatRecord721 must not:

- replace SYN as the live seat,
- create governance rights,
- create revenue rights,
- create yield,
- create claim rights,
- become a speculative NFT product,
- be public-open minted before policy is frozen.

Recommended default: non-transferable identity record with explicit
reassignment/linking policy. Fully transferable SeatRecord721 is rejected for
V1 because it would detach identity from history.

## 7. Attribution Model

Attribution records who introduced or sourced a purchase under visible terms.

Attribution is not ownership of a member.

A source may be credited for:

- a verified introduction,
- an approved campaign,
- a builder source,
- an agency or partner channel,
- an institutional source,
- a business-development source.

A source may receive an acquisition commission only when contract terms allow it
and a purchase receipt exists.

Attribution must never become:

- downline ownership,
- passive income,
- yield,
- staking reward,
- hidden manual payout,
- claim over a person,
- claim over all future behavior without explicit scope.

## 8. Who Owns The Member Relationship?

No source owns a member relationship.

The member controls their wallet and purchase action. The protocol records the
source relationship as attribution under terms. The institution may recognize
that a source helped create growth, but that recognition is not ownership.

Correct framing:

```text
source introduced buyer under source terms
```

Forbidden framing:

```text
source owns buyer
source owns member
source owns downline
source owns all future revenue
```

## 9. Attribution Creation

Attribution should be buyer-confirmed or explicitly policy-created.

Public member introduction:

- source must be active,
- source wallet must be seated,
- buyer must not be the source,
- recipient must not be the source,
- buyer must provide or confirm the source,
- source terms must permit the purchase.

Approved source:

- source must exist in SourceRegistry or equivalent,
- source class must be visible,
- rate/scope/window/caps must be visible,
- metadata hash should explain the policy,
- every policy action must emit an event.

## 10. Existing Members And Capture

Existing members must not be captured by a new source retroactively.

If a wallet was already seated before a source link:

- the source cannot claim historical membership,
- the source cannot rewrite the original receipt,
- the source cannot claim previous purchases,
- future contribution may be attributed only if policy explicitly allows it and
  the member confirms or the source terms define that relationship.

Default rule:

```text
Attribution starts at the first valid source-linked purchase.
```

It does not reach backward.

## 11. Attribution Change

Attribution can change only under explicit rules.

Default:

- no silent overwrite while an active attribution window remains valid,
- new source cannot replace a still-valid linked source without policy,
- expired attribution may fall away,
- revoked source cannot receive future attribution,
- historical receipts remain unchanged.

Allowed future changes:

- buyer confirms a new source after old attribution expires,
- founder/operator applies visible policy action for approved sources,
- compromised source is paused/revoked,
- payout wallet is updated without changing historical source identity.

Forbidden:

- frontend-only source replacement,
- hidden admin reassignment,
- claiming an old member because they clicked a new link later,
- changing past receipt source fields.

## 12. Attribution Expiry

Attribution may expire.

Expiry should be controlled by source terms:

- end time,
- attribution window,
- per-buyer cap,
- source gross cap,
- first-purchase-only scope,
- paused/revoked status.

When attribution expires:

- no new commission accrues from that relationship,
- historical attribution remains visible,
- member remains seated if holding SYN,
- source recognition history remains intact,
- future attribution requires a new valid source relationship.

## 13. Attribution Transfer

Attribution should not be transferable by default.

Reason:

- source identity is historical,
- transferability would create a market for member relationships,
- it would resemble downline sale or affiliate inventory,
- it could detach trust capital from the participant who created it.

Allowed distinction:

- payout wallet may be updated by visible policy action,
- source wallet may be updated only through explicit recovery/policy event,
- source identity remains historically linked to the original source record.

## 14. Source Revocation

If a source is revoked:

- no new attribution may be created,
- no future commission accrues,
- historical receipts remain unchanged,
- historical contribution remains readable,
- source recognition may remain but status must show revoked,
- pending escrow should require review before claim if compromise is suspected,
- Activity/Register should record the revocation when material.

Revocation is not deletion. It is institutional memory.

## 15. Source Pause

Pause is a review state.

If a source is paused:

- no new attribution should accrue,
- existing historical receipts remain valid,
- escrow may remain unresolved,
- payout-wallet/source-wallet recovery may occur,
- status can later become active or revoked through visible policy action.

Pause should be used for:

- suspected compromise,
- legal/compliance review,
- abuse review,
- payout-wallet failure,
- partner/source-policy renegotiation.

## 16. Source Payout Wallet

The payout wallet is not the same thing as source identity.

The payout wallet may change through visible policy action. Historical receipts
must still preserve the source ID and source wallet used at purchase time.

If payout fails:

- purchase should not fail solely because source payout is blocked,
- acquisition cost may escrow if the sale contract supports it,
- claim should use the current registry payout wallet,
- recovery must be visible.

## 17. My Syndicate Implications

My Syndicate should eventually distinguish:

- current seat status,
- original entry history,
- contribution depth,
- source attribution created by the member,
- source attribution attached to the member's own purchases,
- pending recovery/linking states,
- future SeatRecord721 identity status,
- notifications from verified events.

It must not blur:

- "you are seated" with "you own this historical identity forever",
- "you introduced someone" with "you own their membership",
- "Privy account connected" with "wallet is seated",
- "SeatRecord721 reserved" with "identity NFT is live".

## 18. Test And Implementation Requirements

Before Referral UI, Claim UI, Privy integration, SeatRecord721 Solidity, V3
frontend writes, or registry activation:

- this document must remain canonical,
- tests must guard that SYN remains the seat,
- tests must guard that SeatRecord721 is future identity only,
- tests must guard that Privy is not membership truth,
- tests must guard that sources do not own members,
- tests must guard that existing members cannot be retroactively captured,
- tests must guard that attribution expiry/revocation does not rewrite history,
- tests must guard that payout-wallet changes are visible policy actions.

## 19. Go / No-Go

Go for future design:

- read-only V3 quote/receipt preview,
- V3 preview routes clearly marked candidate/pending,
- static analysis,
- fork rehearsal,
- deployment package preparation.

No-go until explicit future approval:

- Referral UI,
- Claim UI,
- SeatRecord721 Solidity,
- Privy integration,
- deployment scripts,
- frontend registry switch,
- live V3 buy path,
- any fake-live source balance or eligibility.

This constitution is the boundary between designing the protocol's meaning and
building systems around it.
