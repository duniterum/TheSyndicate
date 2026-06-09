# THE SYNDICATE — TERMINOLOGY GLOSSARY

Single source of truth for every word used in the UI, docs, FAQ, and marketing.
If a term is not in this glossary, do not invent a new one — extend this file first.

---

## Routing & wallets

| Term | Definition |
|---|---|
| **Membership Sale** | The deployed `SyndicateMembershipSale` contract that accepts USDC and delivers SYN at a fixed rate of 1 SYN = $0.01. LIVE on Avalanche. |
| **USDC Routing** | The atomic 70/20/10 split performed by the Membership Sale contract on every purchase. |
| **Vault Wallet** | The EOA that receives **70%** of every USDC purchase. LIVE. |
| **Liquidity Wallet** | The EOA that receives **20%** of every USDC purchase. LIVE. |
| **Operations Wallet** | The EOA that receives **10%** of every USDC purchase. LIVE. |
| **Programmatic Vault Contract** | A future on-chain contract that will own Vault assets with explicit deposit/withdraw policy. PENDING. |
| **Membership Distribution Wallet** | The wallet holding the 350,000,000 SYN that the Sale contract distributes. |
| **Protocol-Controlled Assets (PCA)** | Umbrella term: Vault Wallet + Liquidity Wallet + Operations Wallet + token allocation wallets + LP reserves. |

## Token

| Term | Definition |
|---|---|
| **SYN** | The Syndicate membership token. ERC20 on Avalanche C-Chain. Fixed 1,000,000,000 supply. |
| **Vault Reserve** | The 25% SYN allocation (250,000,000 SYN) reserved for long-term backing. Distinct from "Vault Wallet". |
| **Access Rate** | 1 SYN = $0.01 USDC. Fixed, identical for everyone. |
| **Rank** | Status tier unlocked by USDC entry size. Never grants bonus tokens or cheaper SYN. |
| **Compounder Score** | Visibility/governance-weight multiplier tied to rank. |

## Status pills

| Pill | Meaning |
|---|---|
| **LIVE** | Backed by an on-chain read or a deployed contract that anyone can verify. |
| **PARTIAL** | Live data, but only part of the picture is on-chain today. |
| **PENDING** | Contract or module not yet deployed. Nothing to verify yet. |
| **DEMO PREVIEW** | Illustrative only. Must live behind a clearly labeled demo tab/section. |

## What The Syndicate is / is not

| Is | Is not |
|---|---|
| Transparent on-chain membership protocol | Memecoin |
| Atomic, public USDC routing | Pump-and-dump |
| Public wallets and contracts | Yield farm / dividend project |
| Long-term accumulation | Get-rich-quick scheme |
| Verifiable economic engine | Shareholder / equity structure |

## Banned vocabulary

Do not use: **ROI, dividend, yield, profit share, returns, guaranteed appreciation, passive income, shareholder, equity, redemption, Vault ownership, treasury claim, investment**.

Approved replacements: **membership, participation, access, rank, archive recognition, protocol-controlled assets, transparent routing, public wallet, verifiable, planned module, pending contract**.

---

## User-facing vocabulary (Simplicity Rule)

External UI must use these words. Internal concepts may be richer, but
they are translated into this vocabulary before they reach the user.

| Internal idea | User-facing term |
|---|---|
| Identity | **Members** |
| Protocol history | **Founders** |
| Formation eras | **Chapters** |
| Participation structure | **Ranks** |
| Protocol memory | **Activity** |
| Verification layer | **Transparency** |
| Documentation surface | **Docs** |
| Membership purchase | **Join** |

### Banned / avoid externally

These terms are forbidden in UI copy, headings, nav, metadata, OG cards,
and marketing — they require explanation, sound corporate or
academic, or imply financial mechanics that do not exist:

- Formation Archive
- Participation Map
- Genesis Cohort Registry
- Community Evolution Layer
- Historical Participation Surface
- Protocol Chronicle
- Wealth leaderboard
- Top buyers / Biggest spenders / Top holders
- Whales
- Tier (use "rank")
- Stakeholder (use "member")

Reason: users understand simple words instantly. Every word that needs
teaching is friction.
