# Source Real-Condition Founder Ceremony Guide

Status: FOUNDER CEREMONY GUIDE / NO TRANSACTION AUTHORIZED / NO ACTIVATION AUTHORIZED

Last updated: 2026-06-25

This guide explains the real-condition source-attributed test ceremony in
human language.

We are not launching referral. We are preparing the engine for one controlled
internal test.

There is no public member referral link yet. There is no claim UI. There is no
source dashboard. Public `/join` still uses `ZERO_SOURCE_ID`. The hidden labs
route exists only so a fresh allowlisted wallet can test the engine later, after
separate on-chain approvals and readbacks.

## Current State

- Production is published from GitHub commit `82300c9`.
- The production-internal test route is armed, hidden, and locked.
- The allowlisted fresh buyer wallet is
  `0x620febd921E7B8d123c7DFB6731ed58fCfbcC75F`.
- The source exists on-chain and is still `PAUSED`.
- `isActive(sourceId) = false`.
- Current source terms are still the original July 1-15 packet.
- `updateSourceTerms` has not happened.
- `ACTIVE` has not happened.
- The $5 test buy has not happened.

## Machine Packet Authority

This guide explains the ceremony. The exact machine values live in:

- `docs/SOURCE_REAL_CONDITION_TEST_PLAN.md`
- `docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_TERMS_UPDATE_2026_06_25_METADATA.json`

If this guide and the machine packet ever disagree, stop and reconcile before
signing anything.

Key values from the machine packet:

- SourceRegistryV1:
  `0x780013bB358be6be95b401901264FC7c22a595a6`
- Source id:
  `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620`
- Updated start time:
  `1782388800` / `2026-06-25T12:00:00Z`
- Updated end time:
  `1783598400` / `2026-07-09T12:00:00Z`
- Updated metadata hash:
  `0x797dedbf845edc5954012c46a6c42e121f19f142d76fe34c8f59bf8e8c7bd681`

## Human Translation

### Why no normal referral link yet?

A normal referral link would imply that the public referral product exists.
It does not. This ceremony tests the protocol engine first: source terms,
source status, receipt behavior, payout behavior, and readbacks.

### Why does the hidden internal route exist?

The hidden route is a controlled operator console. It lets the fresh buyer
wallet perform one real-condition source-attributed buy after the source is
active, while showing the current step, blockers, approval status, buy status,
and stop condition in one place. It is not listed in navigation, not listed in
the sitemap, and not meant for public users.

### Why use a fresh wallet?

The fresh buyer wallet keeps the test clean. It must not be historical, already
seated, the source wallet, or the payout wallet. That makes the receipt easier
to read and prevents old membership state from confusing the test.

### Why does public `/join` stay `ZERO_SOURCE_ID`?

Public buys must remain direct until the public referral product is separately
designed, approved, and launched. The internal test must not change the normal
public path.

### Why is claim UI not part of this test?

The planned source payout is direct in the purchase transaction. Escrow is only
a fallback if direct payout fails. Claim UI needs separate legal, accounting,
readback, and product approval. It is not part of this ceremony.

## Ceremony Map

### Step 0 - Current state

Who acts:
- Codex and Replit verify.
- Founder does not sign.

What changes:
- Nothing on-chain.

What does not change:
- Source remains `PAUSED`.
- Public `/join` remains `ZERO_SOURCE_ID`.
- Referral remains inactive.

What can go wrong:
- Old memory could be mistaken for current truth.
- A public route could be confused with activation.

Check before continuing:
- Production QA green.
- Source readback says `PAUSED`.
- Terms still show original July 1-15 packet.

Stop condition:
- Stop if readback, production QA, or public boundaries are unclear.

### Step 1 - updateSourceTerms

Plain English:
- This updates the source's test window and metadata.
- It does not activate the source.
- It does not allow commission routing yet.

Who acts:
- Founder signs from the SourceRegistry owner wallet.
- Codex/Replit do not sign.

What changes:
- Source terms change to the before-July test packet.
- Metadata hash changes to the new packet hash.

What does not change:
- Source status remains `PAUSED`.
- `isActive(sourceId)` remains `false`.
- Public referral remains inactive.
- Public `/join` remains `ZERO_SOURCE_ID`.

What can go wrong:
- Wrong source id.
- Wrong timestamp.
- Wrong metadata hash.
- Wrong wallet signs.
- ACTIVE is accidentally bundled into the same ceremony.

Check before continuing:
- Function is `updateSourceTerms`.
- Contract is `SourceRegistryV1`.
- Address is `0x780013bB358be6be95b401901264FC7c22a595a6`.
- Source id matches the packet.
- Start time is `1782388800`.
- End time is `1783598400`.
- Metadata hash is
  `0x797dedbf845edc5954012c46a6c42e121f19f142d76fe34c8f59bf8e8c7bd681`.

Exact stop condition:
- Stop if the wallet UI shows any function other than `updateSourceTerms`, any
  unknown contract, any different source id, any different timestamp, or any
  different metadata hash.

Founder approval phrase:

```text
I approve only the SourceRegistryV1 updateSourceTerms transaction for sourceId
0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620 using
the exact before-July terms in docs/SOURCE_REAL_CONDITION_TEST_PLAN.md. I do
not approve ACTIVE, a buy, re-pause, referral activation, claim UI, registry
switch, or contract changes in this action.
```

### Step 2 - readback after updateSourceTerms

Who acts:
- Codex or Replit reads.
- Founder does not sign.

What changes:
- Nothing. This is read-only verification.

What must be checked:
- Transaction succeeded.
- `SourceTermsUpdated` event exists.
- `sourceConfig(sourceId).status = PAUSED`.
- `isActive(sourceId) = false`.
- Start time is `1782388800`.
- End time is `1783598400`.
- Metadata hash is
  `0x797dedbf845edc5954012c46a6c42e121f19f142d76fe34c8f59bf8e8c7bd681`.
- Owner remains `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73`.
- Public `/join` remains `ZERO_SOURCE_ID`.
- `/referral` remains inactive.

Exact stop condition:
- Stop if the source is not still `PAUSED`, if `isActive(sourceId)` is not
  `false`, or if any term differs from the packet.

### Step 3 - set ACTIVE

Plain English:
- This turns the source on for the controlled test.
- This is the first moment the source can affect a purchase.
- This is not public referral launch.

Who acts:
- Founder signs from the SourceRegistry owner wallet.

What changes:
- Source status changes from `PAUSED` to `ACTIVE`.

What does not change:
- Public `/join` still uses `ZERO_SOURCE_ID`.
- No public referral link appears.
- No claim UI appears.
- Only the hidden, gated, allowlisted route can attempt the source test.

What can go wrong:
- ACTIVE is signed before the terms readback is green.
- Wrong source id is activated.
- Public pages are accidentally treated as referral-live.

Check before continuing:
- Step 2 readback is green.
- Function is `setSourceStatus`.
- Status argument is `1` / `ACTIVE`.
- Source id matches the packet.

Exact stop condition:
- Stop if Step 2 was skipped, if terms mismatch, if source id differs, or if
  the transaction is anything other than `setSourceStatus(sourceId, ACTIVE)`.

Founder approval phrase:

```text
I approve only setSourceStatus ACTIVE for sourceId
0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620 after
the updateSourceTerms readback is green. I do not approve public referral,
claim UI, source dashboard, registry switch, contract changes, or any public
source-aware buy path.
```

### Step 4 - readback after ACTIVE

Who acts:
- Codex or Replit reads.
- Founder does not sign.

What must be checked:
- Transaction succeeded.
- `SourceStatusChanged(sourceId, 2, 1)` exists.
- `sourceConfig(sourceId).status = ACTIVE`.
- `isActive(sourceId) = true`.
- Terms still match the before-July packet.
- Public `/join` remains `ZERO_SOURCE_ID`.
- `/referral` remains inactive.
- Labs route is still hidden and gated.

Exact stop condition:
- Stop if source is not ACTIVE, if terms drifted, if public `/join` changed,
  or if any public referral/claim/source UI appeared.

### Step 5 - one $5 source-attributed buy

Plain English:
- This is the real-condition engine test.
- One fresh buyer wallet buys exactly 5 USDC through the hidden internal
  operator console.
- This proves the source-attributed receipt path under real conditions.

Who acts:
- Fresh buyer wallet signs approve/buy only after founder approval.
- Founder/Codex/Replit do not use private keys.

What changes:
- The fresh buyer may receive a new V3 seat.
- A V3 source-attributed receipt is created.
- The source payout wallet should receive acquisition commission, unless
  direct payout fails and escrow fallback records owed funds.

What does not change:
- Public referral remains inactive.
- Public `/join` remains `ZERO_SOURCE_ID`.
- No claim UI appears.
- No source dashboard appears.

What can go wrong:
- Wrong buyer wallet.
- Wallet is historical or already seated.
- Wrong source id.
- Wrong amount.
- Stale quote.
- Insufficient AVAX or USDC.
- Payout fails and escrow fallback must be read carefully.

Check before continuing:
- Fresh buyer wallet is
  `0x620febd921E7B8d123c7DFB6731ed58fCfbcC75F`, unless founder explicitly
  updates the allowlist.
- Source is ACTIVE.
- Route shows exact source id.
- Route shows exact 5 USDC amount.
- Quote is fresh.
- Approval spender is MembershipSaleV3.
- Buy target is MembershipSaleV3.

Exact stop condition:
- Stop if the route shows any source id other than
  `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620`,
  any amount other than 5 USDC, any buyer wallet other than the allowlisted
  fresh wallet, any stale quote, or any public referral/claim language.

Founder approval phrase:

```text
I approve one controlled $5 source-attributed MembershipSaleV3 buy from the
allowlisted fresh buyer wallet only, using sourceId
0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620 through
the hidden internal test route. I do not approve any public referral launch,
claim UI, source dashboard, public source link, or additional buys.
```

### Step 6 - receipt, payout, and read-model readback

Who acts:
- Codex or Replit reads.
- Founder does not sign.

What must be checked:
- Buy transaction succeeded.
- `MembershipPurchasedV3` event exists.
- `sourceId` equals the test source id.
- `sourceClass = 1`.
- `commissionBps = 500`.
- `grossUsdc = 5000000`.
- `acquisitionCost = 250000`.
- `protocolContribution = 4750000`.
- Vault/Liquidity/Operations routing uses the net protocol contribution.
- Payout wallet USDC increased by acquisition commission, or escrow fallback
  is recorded.
- Activity/My Syndicate/cache preserve V3 and source facts after reload.

Exact stop condition:
- Stop if receipt fields do not match, payout/escrow is unclear, member state
  is unclear, or read models label the test as public referral.

### Step 7 - re-pause

Plain English:
- This turns the source back off after the test.
- It is the final safety action.

Who acts:
- Founder signs from the SourceRegistry owner wallet.

What changes:
- Source status changes from `ACTIVE` back to `PAUSED`.

What does not change:
- The historical test receipt remains readable.
- Public referral remains inactive.
- Public `/join` remains `ZERO_SOURCE_ID`.

What can go wrong:
- Re-pause is skipped.
- Wrong source id.
- Wrong status value.

Check before continuing:
- Function is `setSourceStatus`.
- Status argument is `2` / `PAUSED`.
- Source id matches the packet.

Exact stop condition:
- Stop if the wallet UI does not show `setSourceStatus(sourceId, PAUSED)`.

Founder approval phrase:

```text
I approve only setSourceStatus PAUSED for sourceId
0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620 to close
the internal test. I do not approve public referral, claim UI, source dashboard,
additional buys, registry switch, or contract changes.
```

### Step 8 - final readback

Who acts:
- Codex or Replit reads.
- Founder does not sign.

What must be checked:
- Re-pause transaction succeeded.
- `SourceStatusChanged(sourceId, 1, 2)` exists.
- `sourceConfig(sourceId).status = PAUSED`.
- `isActive(sourceId) = false`.
- Test receipt remains readable.
- Public `/join` remains `ZERO_SOURCE_ID`.
- `/referral` remains inactive.
- No claim UI.
- No source dashboard.
- No public source link.

Exact stop condition:
- Stop if source remains ACTIVE, public path changed, claim UI appeared, or
  readback cannot prove the final state.

### Step 9 - decide next product sprint

Who acts:
- Founder decides.
- Codex can recommend.
- Replit only syncs/publishes if a later production batch is approved.

Possible next decisions:
- Record the test readback in docs and guards.
- Improve Activity/My Syndicate receipt display if needed.
- Decide whether a public referral product sprint should begin.
- Keep referral inactive and continue internal proof work.

Stop condition:
- Do not start public referral UX until the test receipt, payout, read model,
  disclosure, legal/accounting posture, and anti-abuse design are reviewed.

## Operator Roles

- Codex prepares, verifies, writes docs, and interprets readbacks.
- Replit syncs, publishes, and performs production/readback checks when asked.
- Founder signs only after explicit approval for one step at a time.
- Fresh buyer wallet performs only the approved $5 buy, after ACTIVE and
  readback.

No AI agent signs. No AI agent broadcasts. No AI agent asks for seed phrases,
private keys, Ledger recovery words, signer exports, or secrets.

## Final Safety Boundary

This ceremony is not public referral launch.

Even after the $5 test, the following remain true unless separately approved:

- no public referral activation,
- no public member referral link,
- no source dashboard,
- no claim UI,
- no public source-aware buy path,
- no registry switch,
- no contract change,
- public/default `/join` buys use `ZERO_SOURCE_ID`.

The purpose is to make the protocol understandable before making it active.
