---
name: Revenue routes differently per income stream
description: The 70/20/10 split applies ONLY to the Membership Sale. NFT mint proceeds and LP fees route elsewhere. Don't assume one split covers all revenue.
---

# Each income stream routes differently — the 70/20/10 split is sale-only

When reasoning about Syndicate economics / revenue, do NOT assume the canonical
70/20/10 (Vault / Liquidity / Operations) split applies to every income stream.
It is enforced on-chain ONLY inside the Membership Sale contract.

- **Membership SYN sale** ($0.01/SYN, $5 min): 70/20/10 split enforced on-chain
  → Vault / Liquidity / Operations wallets.
- **NFT mints** (Archive1155 — First Signal 0.50 USDC, Patron Seal 5.00 USDC):
  proceeds accrue to the Archive1155 contract and are withdrawn by the owner
  wallet. They do **not** pass through the 70/20/10 split. Destination of NFT
  revenue is not the same as sale revenue — state it as such, don't conflate.
- **LP trading fees**: compound into the Trader Joe pair reserves; the protocol's
  LP position (JLP) is held by the Liquidity wallet (real, on-chain). A
  Uniswap-V2-style pair exposes NO per-position accrued-fee read, so the fee
  AMOUNT is PENDING by doctrine and must NEVER be computed/estimated. The
  DESTINATION is now surfaced (not the amount).

**Canonical registry:** `src/lib/revenue-streams.ts` is THE pure-config
enumeration of the 3 streams (membership-sale / nft-mints / lp-fees) with their
destinations + a per-stream `amountStatus` (live | pending) and a
`routedThroughMembershipSplit` flag (true ONLY for membership-sale). Surfaced by
`RevenueStreams.tsx` on `/vault#revenue-streams` + a cross-link on `/liquidity`.
NFT destination is read live via `useArchiveOwnership()` (owner()/treasury() in
`archive-nft-hooks.ts`, allowFailure → PENDING; `treasury()` is the actual
withdraw destination, NOT "The Vault"). Pinned by `revenue-streams.test.ts`.

**Also note (mock/legacy traps):** `VAULT_ASSETS` and `VAULT_INFLOWS` in
`syndicate-config.ts` are simulated placeholder numbers (status PENDING), and
`SYNDICATE_CONFIG.GENESIS_NFT_PRICE` ("$1 – $10") is stale vs the real
0.50 / 5.00 USDC mint prices. Real treasury values come from the live hooks
(useProtocolTruth / useProtocolPulse), not these constants.

**Why:** economic audits recur; conflating revenue routing or citing the mock
constants as real produces wrong conclusions about where money goes.
