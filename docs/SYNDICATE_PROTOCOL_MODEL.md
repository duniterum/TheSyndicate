# THE SYNDICATE — PROTOCOL MODEL (CANONICAL)

This document defines the **canonical economic and contract model** for The Syndicate.
Every page, component, FAQ, doc, and marketing surface must conform to this file.
If a UI label disagrees with this document, the UI is wrong.

Source of truth in code: `src/lib/syndicate-config.ts` (`VAULT_ALLOCATION`, `USDC_ROUTING`, `CONTRACTS`) and the deployed `SyndicateMembershipSale` contract at `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` on Avalanche C-Chain.

---

## 1. The SYN token

- Address: `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` (Avalanche C-Chain)
- Fixed supply: **1,000,000,000 SYN** — minted once, no future mint.
- No tax, no blacklist, no transfer restrictions, no admin powers, no pause.
- All "policy" (routing, sale, vesting) lives in **separate contracts**, never inside the SYN ERC20.

## 2. The Membership Sale

- Contract: `SyndicateMembershipSale` — `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` — **LIVE**.
- Payment token: USDC (`0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`).
- Fixed access rate: **1 SYN = $0.01 USDC**. Same rate for everyone. No private allocations, no insider pricing, no bonding curve.
- Minimum entry: 5 USDC.
- SYN is delivered from the **Membership Distribution wallet** (`0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8`, 35% allocation = 350,000,000 SYN).

## 3. THE CANONICAL USDC ROUTING SPLIT — **70 / 20 / 10**

Every USDC paid into the Membership Sale is split atomically, on-chain, by the Sale contract, in the **same transaction** as the SYN delivery. No multisig, no manual transfer, no delay.

| %     | Bucket                | Wallet                                       | Purpose                                                |
|-------|-----------------------|----------------------------------------------|--------------------------------------------------------|
| **70%** | **Vault Wallet**      | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` | Long-term protocol reserve. Backs SYN over time.       |
| **20%** | **Liquidity Wallet**  | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` | Reinforces SYN/USDC LP depth on Trader Joe v1.         |
| **10%** | **Operations Wallet** | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` | Build, infrastructure, contributors.                   |

**This split is the canonical truth. It must appear identically on every page, FAQ entry, tooltip, doc, and component.** Any deviation (e.g. "70% liquidity / 20% vault") is a bug.

## 4. Vault vs Treasury vs Protocol-Controlled Assets — terminology

To prevent drift, these terms have **fixed meaning**:

- **Vault Wallet** — the EOA receiving 70% of every USDC purchase. **LIVE**. Visible on Avascan today.
- **Vault Reserve (SYN allocation)** — 250,000,000 SYN held aside for long-term backing.
- **Programmatic Vault contract** — a future on-chain contract that will own, account for, and report Vault assets with deposit/withdraw policy. **PENDING**. Not deployed.
- **Liquidity Wallet** — the EOA receiving 20% of every USDC purchase. **LIVE**.
- **Operations Wallet** — the EOA receiving 10%. **LIVE**.
- **Protocol-Controlled Assets (PCA)** — the umbrella covering everything the protocol controls: Vault Wallet + Liquidity Wallet + Operations Wallet + token allocation wallets + LP pool reserves.

Rules:
- Do **not** call all PCA "the Vault".
- Do **not** call all PCA "the Treasury".
- The word "Vault" without a qualifier refers to the **Vault Wallet (70%)**.
- The word "Treasury" should be used sparingly and only as a synonym for the Vault Wallet.

## 5. Tokenomics — fixed 1B SYN, seven allocations

| % | SYN | Allocation | Wallet |
|---|---|---|---|
| 35% | 350,000,000 | Membership Distribution & Achievements | `0x975a…ECec8` |
| 25% | 250,000,000 | Vault Reserve | `0x205D…f464` |
| 12% | 120,000,000 | Founder (12-mo cliff, 36-mo vest) | `0x88EC…Dd73` |
| 10% | 100,000,000 | Liquidity | `0xa9b0…2e25` |
| 8%  |  80,000,000 | Partnerships | (governance-approved) |
| 5%  |  50,000,000 | Contributors | `0xa551…EF7a` |
| 5%  |  50,000,000 | Future Ecosystem | `0x2530…2963` |

The 10% "Liquidity" **token allocation** is distinct from the 20% USDC routing to the Liquidity Wallet. The first is SYN reserved for LP seeding; the second is USDC flowing into the same wallet to deepen LP.

## 6. Revenue sources

Only **LIVE** sources count toward protocol revenue metrics. **PLANNED** sources are labeled but never summed.

| Source                  | Status  | Notes                                           |
|-------------------------|---------|-------------------------------------------------|
| Membership Sale (USDC)  | LIVE    | Reads `totalUsdcRaised()` from Sale contract.   |
| LP trading fees         | LIVE    | Trader Joe v1 SYN/USDC pair.                    |
| Genesis NFT mints       | PLANNED | NFT contract not deployed.                      |
| Marketplace fees        | PLANNED | Not deployed.                                   |
| AI module fees          | PLANNED | Not deployed.                                   |
| Partnerships            | PLANNED | Requires governance approval.                   |

## 7. Trust model

- **Verifiable > Impressive.** Small real numbers beat large unverifiable ones.
- **Live > Estimated.** Unverified data shows `PENDING`. Never invent, estimate, fabricate.
- **Three status pills only:** `LIVE` (on-chain truth), `PARTIAL` (live but reading from partial data), `PENDING` (contract/module not yet deployed), `DEMO PREVIEW` (illustrative, opt-in tab).
- Every metric links to an explorer or on-chain source.

## 8. Banned copy

Never use: ROI, dividend, yield product, profit share, investment, returns, guaranteed appreciation, passive income, shareholder, equity, redemption promise, Vault ownership, treasury claim.

Use: membership, participation, access, rank, archive recognition, protocol-controlled assets, transparent routing, public wallet, verifiable, planned module, pending contract.

## 9. Legal disclaimer (single source)

> SYN is an experimental utility membership token. It is not equity, debt, Vault ownership, a dividend instrument, or a promise of profit. Participation may result in total loss. All routing, balances, and contract activity are public and verifiable on Avalanche C-Chain.
