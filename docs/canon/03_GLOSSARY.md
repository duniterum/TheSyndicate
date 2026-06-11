# 03 — GLOSSARY & TERMINOLOGY COLLISION RULINGS

The canonical vocabulary: one approved word per concept, plus the binding rulings
for every known name-collision. This consolidates `docs/TERMINOLOGY_GLOSSARY.md`
(which remains guard-enforced) and adds the collision decisions.

> Rule: if a term is not here, do not invent one — extend this file (and the
> legacy glossary it mirrors) first.

---

## Approved vocabulary

### Public (use in UI, nav, copy, OG, marketing)
**NFT · Collection · Chapter · Member · Join · Activity · Transparency · Rank · Docs · Founders**

### Secondary (doctrinal / supporting)
**Protocol Memory · Artifact**

### Deep lore (long-form docs only — never live UI)
**Archive · Chronicle · Signal · Seal · Relic**

### Banned financial vocabulary (never, anywhere user-facing)
ROI · dividend · yield · profit share · returns · guaranteed appreciation ·
passive income · shareholder · equity · redemption · Vault ownership ·
treasury claim · investment.

Approved replacements: membership · participation · access · rank · archive
recognition · protocol-controlled assets · transparent routing · public wallet ·
verifiable · planned module · pending contract.

### Status pills
**LIVE** (on-chain verifiable) · **PARTIAL** (live but incomplete) ·
**PENDING** (contract not deployed) · **DEMO PREVIEW** (illustrative, behind a labeled tab).

---

## Core terms

| Term | Definition |
|---|---|
| **SYN** | The membership token. ERC-20 on Avalanche C-Chain (43114). Fixed 1,000,000,000 supply. **SYN is the seat.** |
| **Member** | An address that joined by purchasing through the Membership Sale — has a seat and a member number. |
| **Holder** | Any address holding SYN, including via transfer/DEX. A holder is *not* necessarily a member. |
| **Seat** | The membership itself (= holding SYN acquired by joining). Live today. |
| **Seat Record** | The future, separate `SeatRecord721` identity NFT. PENDING — not minted today. |
| **Membership Sale** | The deployed sale contract: accepts USDC, delivers SYN at 1 SYN = $0.01, performs the 70/20/10 split atomically. |
| **USDC Routing** | The atomic 70/20/10 split on every purchase. Applies to the **sale only** — not to NFT mints or LP fees. |
| **Vault Wallet** | The wallet receiving **70%** of every USDC purchase. |
| **Vault Reserve** | The **25% SYN** allocation reserved for long-term backing. *Shares an on-chain address with the Vault Wallet (`0x205DdC…464`) — disclose this.* |
| **Liquidity Wallet** | Receives **20%** of every USDC purchase. |
| **Operations Wallet** | Receives **10%** of every USDC purchase. |
| **Protocol-Controlled Assets (PCA)** | Umbrella: Vault Wallet + Liquidity Wallet + Operations Wallet + allocation wallets + LP reserves. |
| **Rank** | Structural, on-chain-derived **recognition** (from cumulative USDC). Mutable, secondary, confers nothing. |
| **Chapter** | A cohort era by member-number range (five canonical chapters). |
| **Artifact / NFT** | A collectible protocol memory (Archive1155). No financial rights. |
| **Activity** | The raw, complete, public on-chain event stream (`/activity`). |
| **Chronicle** | Curated, gated constitutional history. Deep-lore term — not a public label. |

---

## Terminology collision rulings (binding)

Each ruling resolves a same-word/two-meaning collision. Where the safe resolution
is **disambiguation** (qualify the word) rather than **rename**, that is because a
rename of a live rank/tier is an economics/taxonomy change — out of scope here and
listed as an open founder decision in the summary.

| # | Collision | Ruling |
|---|---|---|
| 1 | **Patron Rank vs Patron Seal** | Distinct concepts. **Patron rank** = the $500 recognition tier (confers nothing). **Patron Seal** = Archive1155 ID 3 artifact (5.00 USDC). Always qualify — never write bare "Patron" where ambiguous. *(Open decision: rename the rank to remove the collision entirely.)* |
| 2 | **Council Rank vs Governance Council** | The **Council rank** (and Council Candidate rank) is recognition only and **confers no governance**. A future governance body, if ever created, takes a distinct name (e.g. "Governance Council"). Copy must never imply the rank grants a vote. *(Open decision: rename the rank and/or formally reserve the governance name.)* |
| 3 | **Vault vs Treasury** | "**Vault**" is the public umbrella for protocol-controlled assets. Use precise sub-terms: **Vault Wallet** (70% USDC), **Vault Reserve** (25% SYN), **Treasury Ledger** (the movement record), **PCA** (full umbrella). Avoid generic "Treasury" in public copy; prefer "Vault." Disclose the Vault Wallet / Vault Reserve **shared address**. |
| 4 | **Member vs Holder** | **Member** = joined via the Membership Sale (has a seat + member number). **Holder** = holds SYN by any means. All "members" metrics use the sale-buyer definition; "holders" is a separate, broader count. This is the canonical resolution of the dual-registry drift. |
| 5 | **Activity vs Chronicle** | **Activity** = the raw, complete, **public** on-chain feed (the public label). **Chronicle** = curated, gated history (deep-lore; "Protocol Chronicle" is banned as public vocabulary). Public surfaces say "Activity"; Chronicle stays curatorial/internal. |
| 6 | **Referral vs Reward** | **Referral** = attribution of who caused a join. **Reward** = a payout/commission. Both are FUTURE/PENDING and must always carry that status. Never conflate attribution with payout; no "earn/reward" language in live copy. |
| 7 | **Artifact vs NFT (vs Archive vs Relic)** | Same on-chain ERC-1155 items, layered vocabulary: **NFT** (public), **Artifact** (secondary/doctrinal), **Archive** (the system/collection), **Relic** (deep-lore only — banned in live UI). Choose "NFT" publicly, "Artifact" in doctrine. |

---

## Banned external phrasings (require teaching or imply false mechanics)

Protocol Chronicle · Formation Archive · Participation Map · Genesis Cohort
Registry · Community Evolution Layer · Wealth leaderboard · Top buyers / Biggest
spenders / Top holders · Whales · "Tier" (use *rank*) · "Stakeholder" (use *member*).

---

## The Syndicate is / is not

| Is | Is not |
|---|---|
| Transparent on-chain membership protocol | Memecoin |
| Atomic, public USDC routing | Pump-and-dump |
| Public wallets and contracts | Yield farm / dividend project |
| Long-term accumulation | Get-rich-quick scheme |
| Verifiable economic engine | Shareholder / equity structure |

*This file mirrors and extends `docs/TERMINOLOGY_GLOSSARY.md`. When you change one,
change both (see `04_DOC_SYNC_CHECKLIST.md`).*
