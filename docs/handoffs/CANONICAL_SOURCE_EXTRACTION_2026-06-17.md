# Canonical Source Extraction — Package / Rank / Chapter / Era / Seat / Artifact / Member

**Type:** Read-only evidence extraction. No solutions, no renames, no copy rewrites, no code changes, no UI proposals.
**Date:** 2026-06-17
**Baseline:** `docs/handoffs/MASTER_LEDGER_2026-06-17.md`, `docs/handoffs/IDENTITY_RECONCILIATION_2026-06-17.md`
**On-chain re-verification:** Avalanche C-Chain (43114), **block 88,218,601**, read live for this report (not from memory).

> Method note: every value below is sourced from a file path + line, an exported constant, a doc section, or a fresh on-chain read. Where a number could drift, the chain read is dated to the block above. Component line numbers marked *(surface)* were located by code search and may shift by a few lines as files change.

---

## 1. Executive truth table

| Concept | Actual protocol meaning | Source of truth | Public state | User confusion risk |
|---|---|---|---|---|
| **Seat** | SYN ownership acquired via the Membership Sale ("SYN is the seat"). The *durable, numbered* seat = first-seen position in the Holder Index. | `docs/canon/03_GLOSSARY.md:42-45`; `src/lib/holder-index.ts` | **LIVE** (as SYN balance). SeatRecord NFT = **PENDING**. | **HIGH** — site says a seat "cannot be reassigned, by anyone, ever," but SYN is a standard transferable ERC-20. Two different "seats" (transferable token vs permanent index entry) wear one word. |
| **Member** | A wallet that **purchased** through any Membership Sale (V1/V2a/V2b), de-duplicated by buyer via the Holder Index. Distinct from a "Holder" (anyone holding SYN, incl. via transfer/DEX). | `src/lib/syndicate-config.ts:45-52` (`MEMBER_DEFINITION`); `src/lib/holder-index.ts` | **LIVE / INDEXED** | **MEDIUM** — on-chain `memberCount` per contract (V2b=8, V2a=5) ≠ canonical union count; raw counters are not identity. |
| **Holder Index** | The single identity-of-record: union of all sale contracts' purchase events, sorted by block/logIndex, first-seen order = member number. | `src/lib/holder-index.ts` (`buildHolderIndex`) | **INDEXED** (client cache / localStorage) | **MEDIUM** — invisible to users; raw `memberNumberOf` / `purchaseId` metadata can leak a different number than the index. |
| **Package** | A friendly *presentation* of an existing rank tier — projected **1:1 from `RANKS_V2`**. Confers nothing; pure curation of entry USDC → SYN. | `src/lib/package-catalog.ts` (`SEAT_PACKAGES`) | **LOCAL** (pure-data leaf; rate from `currentEra()`) | **HIGH** — "package" reads like a paid plan / product tier with perks. Not approved public vocabulary. |
| **Rank** | Recognition-only ladder of 12 tiers, **derived from cumulative USDC**. Confers no rights/returns/governance/pricing. | `src/lib/syndicate-config.ts:104-143` (`RANKS_V2`, `rankForUsdc`, `rankForSyn`) | **LIVE** (derived from index) | **HIGH** — basis stated three ways (cumulative USDC vs SYN held vs "USDC routed"); `RankTier` has a populated `benefits[]` field despite "confers nothing." |
| **Chapter** | Historical **story** cohort — a deterministic function of member number. 5 chapters. No rights. | `src/lib/chapters.ts` (`CHAPTERS`) | **LIVE** | **HIGH** — near-isomorphic with Eras (same names/ranges I–IV); "Genesis" and "Open Era" appear in both systems. |
| **Era** | **Distribution** schedule layer — a *proposed future* access-rate ladder of 9 eras over the same member-number axis. Only Era I (Genesis) is LIVE. | `src/lib/eras.ts` (`ERAS`); on-chain `currentEra()` | **Era I LIVE; II–IX FUTURE** (preview) | **HIGH** — "Era" is **not** approved public vocabulary (glossary maps "Formation eras → Chapters") yet appears in live UI (/join, /chapters, /faq). Overlaps Chapters. |
| **Artifact / NFT** | Archive1155 collectibles ("the memory"), **separate from membership** ("the seat"). IDs 1 & 3 publicly mintable. | `src/lib/archive-id-registry.ts`; `src/lib/archive-config.ts`; contract `0xB2AE…D54d` | **LIVE** (ID1, ID3); ID2 **DISABLED**; ID4–8 **OWNER_ONLY**; ID9 **NOT_CONFIGURED** | **HIGH** — /nft + /archive language ("NFT mint open," "collect proof") can make a visitor think *joining gives an NFT*. |
| **SeatRecord721** | The intended permanent on-chain seat proof — a *future* separate ERC-721 that MUST mint from the Holder Index, never from raw `memberNumberOf`. | `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`; `src/lib/contract-registry.ts` | **PENDING** (not built, not deployed) | **MEDIUM** — Archive1155 ID2 is a reserved placeholder that can read as "the seat NFT exists." |
| **Referral / CommissionRouter** | Off-chain/simulated preview only; no router contract deployed. | `src/lib/preview/referral.ts`; `/referral` route | **PREVIEW / SIMULATED** (on-chain `commissionRouter = 0x0`) | **MEDIUM** — "earn" language risks implying live commissions. |
| **Treasury / routing** | 70/20/10 USDC split (Vault / Liquidity / Operations), enforced by the sale contract. | `src/lib/syndicate-config.ts:54-58, 251-255` | **LIVE** (split on-chain); "Treasury Ledger" UI = **SIMULATED** | **MEDIUM** — `totalUsdcRaised` getter (V2b=110) vs site-summed "USDC routed"; "raised" is a banned word. |
| **Custody** | V2b sale **and** Archive1155 owned by a **single EOA** `0xa2E538…26e2F`. No multisig in code. | Fresh chain read; `docs/DEPLOYMENT_STATE_V1.md` | **LIVE (single EOA)** | **MEDIUM** — docs reference an "expected multisig" that is not implemented. |

---

## 2. Source map

| Concept | File path | Export / function / component / doc section | Route(s) |
|---|---|---|---|
| Seat (doctrine) | `docs/canon/03_GLOSSARY.md` | "SYN is the seat" (§ definition, ~L42–45) | — |
| Seat (identity) | `src/lib/holder-index.ts` | `buildHolderIndex`, first-seen ordering | /members, /member/$number |
| Seat (UI) | `src/components/syndicate/ProtocolHero.tsx` *(surface)* | "SYN is your seat" / "Seat #N available" | / |
| Member (definition) | `src/lib/syndicate-config.ts` | `MEMBER_DEFINITION` (L45–52) | global truth/verify surfaces |
| Member (display) | `src/components/syndicate/MemberCard.tsx`; `src/routes/member.$number.tsx`; `src/routes/members.tsx` | MemberCard, member profile, Member Wall | /my-syndicate, /member/$number, /members |
| Holder Index | `src/lib/holder-index.ts` | `buildHolderIndex`; unions V1/V2a/V2b | /members, /member/$number, /ranks, /join |
| Package | `src/lib/package-catalog.ts` | `SEAT_PACKAGES`, `featuredPackages`, `nextSeatPackage`, `FEATURED_NAMES`, `TAGLINES`, `FOR_WHOM` | /join |
| Package (UI) | `src/components/syndicate/JoinPackages.tsx` *(surface)* | Package cards; "Era I (Genesis)" label | /join |
| Rank | `src/lib/syndicate-config.ts` | `RANKS_V2` (L113–126), `RankTier` (L104–111), `rankForUsdc` (L128), `rankForSyn` (L141) | /ranks, /join, /my-syndicate |
| Rank (UI) | `src/components/syndicate/RankHub.tsx` *(surface)*; `RankLadder` | "Ranks describe where you fit, not what you've won." | /ranks |
| Chapter | `src/lib/chapters.ts` | `CHAPTERS`, `ChapterId`, `getChapterByMemberNumber`, `getActiveChapter`, `CHAPTER_LABEL` | /chapters, /archive, /nft, /members, /my-syndicate, /registry |
| Era | `src/lib/eras.ts` | `ERAS` (L69–200), `EraId`, `currentEra`, `eraByIndex`, `eraMinUsdc`, `ERA_SCHEDULE_NOTE` | /join, /chapters, /faq |
| Era (on-chain) | `src/lib/sale-abi.ts` | `currentEra()` → `uint16` (L75) | — |
| Artifact registry | `src/lib/archive-id-registry.ts` | `ARCHIVE_ID_REGISTRY` (IDs 1–9), `isPublicMintEligible`, `publicMintIds` | /nft, /archive |
| Artifact config / state | `src/lib/syndicate-config.ts` | `ARCHIVE_CONTRACT_STATE` (L193–225), `ARCHIVE_NFT_CONTRACT_ADDRESS` | /nft, /archive, /registry |
| Artifact (UI) | `src/routes/nft.tsx`, `src/routes/archive.tsx` | "The First Signal," "Collect proof you were early" | /nft, /archive |
| SeatRecord721 | `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`; `src/lib/contract-registry.ts` | Doctrine §; registry `status:"PENDING", address:null` | /join, /archive, /my-syndicate (PENDING) |
| Referral | `src/lib/preview/referral.ts`; `src/components/preview/ReferralPreview.tsx` | simulated preview; quarantined money fields | /referral, /transparency |
| Treasury routing | `src/lib/syndicate-config.ts` | `VAULT_ALLOCATION` (L54–58), `USDC_ROUTING` (L251–255), `vaultFlow` (L145) | /transparency, / |
| Custody | `docs/DEPLOYMENT_STATE_V1.md`; on-chain `owner()` | `owner()` (sale + Archive); validation checklist | /transparency, /registry |
| Vocabulary | `docs/canon/03_GLOSSARY.md`; `docs/TERMINOLOGY_GLOSSARY.md` | approved/banned sets | — |
| Vocabulary guard | `src/lib/__tests__/doctrine-guard.test.ts`; `src/lib/protocol-language.ts` | banned-word enforcement | — |

---

## 3. Exact current values

### 3.1 Token & access rate
- **SYN**: `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170`, total supply **1,000,000,000** (chain-confirmed), 18 decimals, no tax/admin/mint/blacklist/transfer-restriction (`TOKEN_SPEC` L67–79).
- **USDC**: `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`.
- **Access rate**: `ACCESS_RATE_USDC_PER_SYN = 0.01` → **1 SYN = $0.01 USDC** (`ACCESS_RATE_LABEL`, L63–64).

### 3.2 Tokenomics allocation (`TOKENOMICS_ALLOCATION`, L83–91)
| Slice | % | SYN |
|---|---|---|
| Membership Distribution | 35 | 350,000,000 |
| Vault Reserve | 25 | 250,000,000 |
| Founder | 12 | 120,000,000 |
| Liquidity | 10 | 100,000,000 |
| Partnerships | 8 | 80,000,000 |
| Contributors | 5 | 50,000,000 |
| Future Ecosystem | 5 | 50,000,000 |

### 3.3 Ranks — `RANKS_V2` (12 tiers, exact)
| # | Name | Entry USDC | SYN | Group | `benefits[]` (verbatim, first item) |
|---|---|---|---|---|---|
| 1 | Citizen | $5 | 500 | Open Entry | "Citizen badge", "Public on-chain member entry", "Permanent archive record" |
| 2 | Scout | $10 | 1,000 | Open Entry | "Scout badge", "Permanent archive record", "Public wallet page" |
| 3 | Operator | $25 | 2,500 | Open Entry | "Operator badge", "Public wallet page", "Activity visibility" |
| 4 | Builder | $50 | 5,000 | Active Members | "Builder badge", "Higher profile visibility", … |
| 5 | Strategist | $75 | 7,500 | Active Members | "Strategist badge", "Higher profile visibility", "Visible member profile" |
| 6 | Vanguard | $100 | 10,000 | Active Members | "Vanguard badge", "Stronger archive recognition", "Public member number" |
| 7 | Architect | $250 | 25,000 | Deep Supporters | "Architect badge", "Higher visibility", … |
| 8 | Steward | $500 | 50,000 | Deep Supporters | "Steward badge", "Recognition placement", … |
| 9 | Custodian | $1,000 | 100,000 | Deep Supporters | "Custodian badge", "Public recognition", … |
| 10 | Keystone | $2,500 | 250,000 | High-Conviction | "Keystone badge", …, "Self-service wallet checkout" |
| 11 | Inner Circle | $5,000 | 500,000 | High-Conviction | "Inner Circle badge", …, "Self-service wallet checkout" |
| 12 | Cornerstone | $10,000 | 1,000,000 | High-Conviction | "Cornerstone badge", "Deepest archive recognition", "Self-service wallet checkout" |

- **Rank basis (code):** `rankForUsdc(usdc)` is canonical; `rankForSyn(syn) = rankForUsdc(syn * 0.01)`.
- **Doctrine statement (verbatim, `package-catalog.ts:13`):** "Rank is recognition only — derived from cumulative USDC."

### 3.4 Packages — `SEAT_PACKAGES`
- Projected **1:1 from `RANKS_V2`** (12 packages, one per rank). `usdc` = rank threshold; `synAtGenesis = synForUsdcInEra(rank.usdc, currentEra())`.
- **Featured 6** (`FEATURED_NAMES`): Citizen, Operator, Vanguard, Steward, Keystone, Cornerstone.
- **Recommended ("Start here"):** Citizen. **Headline high-conviction:** Cornerstone.
- Taglines/forWhom are recognition-only strings (no financial framing) — e.g. Citizen: "Take your seat. Permanent on-chain entry."

### 3.5 Chapters — `CHAPTERS` (5, exact)
| # | id | Label | Range | start–end | Capacity |
|---|---|---|---|---|---|
| I | genesis-signal | Chapter I — Genesis Signal | #1 – #333 | 1–333 | 333 |
| II | first-thousand | Chapter II — First Thousand | #334 – #1,000 | 334–1,000 | 667 |
| III | the-expansion | Chapter III — The Expansion | #1,001 – #3,333 | 1,001–3,333 | 2,333 |
| IV | first-ten-thousand | Chapter IV — First Ten Thousand | #3,334 – #10,000 | 3,334–10,000 | 6,667 |
| V | open-era | Chapter V — Open Era | #10,001 + | 10,001–∞ | unbounded |

### 3.6 Eras — `ERAS` (9, exact)
| # | id | Name | start–end member | entry USDC | SYN/entry | Status | Chapter link |
|---|---|---|---|---|---|---|---|
| I | genesis | Genesis | 1–333 | $5 | 500 | **LIVE** | genesis-signal |
| II | first-thousand | First Thousand | 334–1,000 | $10 | 500 | FUTURE | first-thousand |
| III | the-expansion | The Expansion | 1,001–3,333 | $10 | 400 | FUTURE | the-expansion |
| IV | first-ten-thousand | First Ten Thousand | 3,334–10,000 | $25 | 400 | FUTURE | first-ten-thousand |
| V | open-era-i | Open Era I | 10,001–25,000 | $25 | 300 | FUTURE | open-era |
| VI | open-era-ii | Open Era II | 25,001–50,000 | $50 | 300 | FUTURE | open-era |
| VII | hundred-thousand | Hundred Thousand | 50,001–100,000 | $50 | 200 | FUTURE | open-era |
| VIII | quarter-million | Quarter Million | 100,001–250,000 | $100 | 200 | FUTURE | open-era |
| IX | first-million | First Million | 250,001–1,000,000 | $100 | 100 | FUTURE | open-era |

- **On-chain `currentEra()` (V2b) = 1** (Genesis). `ERA_SCHEDULE_NOTE` labels II–IX as a proposed future model requiring a future sale contract.

### 3.7 Artifacts — `ARCHIVE_ID_REGISTRY` + live supply
Contract **`0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d`** · `ARCHIVE_CONTRACT_STATE`: deployment **DEPLOYED**, validation **IN_PROGRESS**, sourceVerified **PENDING**, publicDropsActivated **2**, deployedAt 2026-06-06.

| ID | Name | Activation | Price | Wallet limit | Max supply | Frozen | **Live supply (block 88,218,601)** |
|---|---|---|---|---|---|---|---|
| 1 | The First Signal | LIVE_PUBLIC_MINT | 0.5 USDC | 5 | 10,000 | yes | **11** |
| 2 | Reserved Seat Record Reference | RESERVED_DISABLED | — | — | — | yes | **0** |
| 3 | Patron Seal | LIVE_PUBLIC_MINT | 5 USDC | 5 | 10,000 | yes | **6** |
| 4–8 | Protocol Memory Artifact IV–VIII | OWNER_ONLY | — | — | — | yes | — |
| 9 | Protocol Chronicle | NOT_CONFIGURED | — | — | — | no | — (not configured on-chain) |

### 3.8 Sale contracts (fresh chain read, block 88,218,601)
| Contract | Address | paused | currentEra | memberCount | Notes |
|---|---|---|---|---|---|
| V1 (sealed) | `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` | **true** | n/a (reverts) | — | Era getters revert on V1 |
| V2a (sealed/historical) | `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48` | **true** | — | **5** | Scan-only for member continuity (seats #3–#5) |
| **V2b (ACTIVE)** | `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` | **false** | **1** | **8** | Buy/quote/approve target |

V2b extra reads: `commissionRouter = 0x0000…0000` (UNSET) · `V1_MEMBER_ROOT = 0xa1f2ed106c6d87372d99256765fcbad8c150441913d7bf0ea51908665f718c49` · `totalUsdcRaised = 110` (USDC, V2b-only) · `owner = 0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`.

### 3.9 Wallets / routing
- **USDC split** — `VAULT_ALLOCATION { vaultAssets:0.7, liquidityReinforcement:0.2, operationsCommunity:0.1 }`; `USDC_ROUTING` labels: Vault Wallet **70%**, Liquidity Wallet **20%**, Operations Wallet **10%**.
- Vault Wallet (70%): `0x205DdC8921A4C60106930eE35e1F395c8D13f464`
- Liquidity Wallet (20%): `0xa9b072db8DcDbb470235204B69D37275d74a2e25`
- Operations Wallet (10%): `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80`
- Membership Distribution: `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` — **337,997,500 SYN** held (chain)
- Founder: `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73`
- LP pair (Trader Joe v1, SYN/USDC): `0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389`
- V2b SYN funding balance: **6,989,000 SYN** (chain)
- **Owner EOA (V2b sale + Archive1155): `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`** — single EOA, no multisig.

### 3.10 Burn
- `PROOF_OF_FIRE_001`: amountSyn **1,000**, from Founder wallet → `0x…dEaD`, tx `0x2db110…12d47`, block 87,703,847. Label "Proof of Burn #001."
- Burn address: `0x000000000000000000000000000000000000dEaD`, label "Proof of Burn / Burn Address."
- **On-chain dead-address balance (block 88,218,601): 10,000 SYN.** → see Contradiction #1.

### 3.11 Vocabulary (verbatim sets)
- **Approved primary public set** (`docs/canon/03_GLOSSARY.md:15`): NFT · Collection · Chapter · Member · Join · Activity · Transparency · Rank · Docs · Founders.
- **Approved secondary/doctrinal:** Protocol Memory · Artifact.
- **Seat:** approved ("the membership itself = holding SYN"). **Member / Chapter / Rank:** approved. **Artifact:** approved (doctrine; "NFT" publicly).
- **Not approved public words:** **Era** (glossary maps "Formation eras → Chapters"), **Package** (used in code, not in glossary).
- **Banned (financial):** ROI, dividend, yield, profit share, returns, guaranteed appreciation, passive income, shareholder, equity, redemption, Vault ownership, treasury claim, investment.
- **Banned (framing):** Protocol Chronicle, Formation Archive, Participation Map, Wealth leaderboard, Top buyers, Biggest spenders, Whales, Tier (use rank), Stakeholder (use member), "USDC raised" (use "routed").

---

## 4. Contradictions / stale sources

> Only real conflicts found in files / code / docs / contracts / production are listed.

1. **Burn record gap (config vs chain) — `truth doctrine` violation.** `PROOF_OF_FIRE_001` documents **1,000 SYN** burned (one event). On-chain dead-address balance is **10,000 SYN** (block 88,218,601). The site's burn metric reads the live balance (so the displayed total is correct), but **9,000 SYN of burns have no corresponding proof record** in config. Per "every public claim must map to an on-chain read," the proof ledger is under-documented relative to chain. **Severity: MEDIUM-HIGH** (doctrine integrity).

2. **Rank basis stated three different ways.**
   - `package-catalog.ts:13`: rank "derived from **cumulative USDC**."
   - Code: `rankForUsdc(usdc)` (canonical) **and** `rankForSyn(syn) = rankForUsdc(syn*0.01)` — i.e. some paths compute rank from **current SYN balance**, which diverges from cumulative purchased USDC after any transfer or burn.
   - RankHub framing "where you fit" + cockpit "USDC routed" phrasings (surface copy).
   These inputs (cumulative purchased USDC vs current SYN held) are **not equivalent**. **Severity: HIGH.**

3. **`RankTier.benefits[]` populated despite "rank confers nothing."** The type literally has a `benefits: string[]` field (L110) and every tier lists 3 items (e.g. "Self-service wallet checkout," "Public member number," "Activity visibility"). Even though these are recognition/visibility (not financial), the **field name "benefits"** and content read as perks/entitlements, contradicting the recognition-only doctrine. **Severity: MEDIUM-HIGH.**

4. **Chapter ↔ Era near-isomorphism (two coordinate systems, one axis).** Both key off member number. Eras I–IV share Chapter I–IV boundaries **exactly** (1–333 / 334–1,000 / 1,001–3,333 / 3,334–10,000); Eras V–IX all live inside Chapter V "Open Era." Same names recur: **"Genesis"** is Era I *and* Chapter I ("Genesis Signal"); **"Open Era"** is Chapter V's name *and* Era ids `open-era-i`/`open-era-ii`. Only Era I is live; the rest are FUTURE preview. **Severity: HIGH.**

5. **"Era" surfaced publicly though not approved vocabulary.** Glossary maps "Formation eras → **Chapters**" for public use, yet live UI shows "Open Era" (`/chapters`), "Era I (Genesis)" (`JoinPackages`), and Era references in `/faq`. **Severity: HIGH** (doctrine + user clarity).

6. **Seat permanence claim vs transferable ERC-20.** Homepage *(surface, `index.tsx`)*: "A seat is a permanent, numbered place in the archive. It cannot be reassigned — by anyone, ever." But the seat **is SYN**, a standard transferable ERC-20 (`TOKEN_SPEC.transferRestrictions:false`). The *Holder-Index first-seen entry* is permanent; the *token* is not. The copy conflates the two. **Severity: HIGH** (factual/trust).

7. **Member count divergence (per-contract counter vs canonical union).** On-chain `memberCount`: V2b=8, V2a=5; canonical identity is the Holder-Index **union** of V1∪V2a∪V2b first-seen. Raw `memberNumberOf`/`purchaseId` are metadata "authoritative ONLY when firstSeat" and must reconcile **to** the index, not the reverse. **Severity: MEDIUM** (handled in code, but raw numbers are exposed).

8. **"USDC raised" getter vs "USDC routed" label.** The contract exposes `totalUsdcRaised` (V2b=110), but "raised" is a banned public word and the site sums three contracts under "USDC routed." A single-contract getter (110) read directly would understate and use banned framing. **Severity: MEDIUM.**

9. **Deep-lore words live in UI though glossary bans them as public framing.** "Signal" (Chapter "Genesis Signal," artifact "The First Signal"), "Archive," and "Chronicle" (artifact ID9 "Protocol Chronicle", `StoryTimeline`) appear in production, while `docs/canon/03_GLOSSARY.md:23-26` lists "Protocol Chronicle" and deep-lore terms as banned public framing. **Severity: MEDIUM.**

10. **Artifact ↔ membership language collision (join → NFT expectation).** `/nft` "The First Signal — Chapter I NFT mint open" + `/archive` "Collect proof you were early" + `/join` rendering a visual "Member Card" can make a visitor believe **joining yields an NFT**. Doctrine: "SYN is the seat. Artifacts are the memory" — joining delivers a SYN balance, **not** an NFT; artifacts are separate paid mints. **Severity: HIGH.**

11. **"Patron" term collision.** Artifact ID3 is "**Patron Seal**," but there is no longer a "Patron" rank (the $500 tier is now "Steward"). The word survives only on the artifact. **Severity: LOW.**

12. **Custody: docs reference a multisig that does not exist in code.** `docs/DEPLOYMENT_STATE_V1.md` includes "owner() returns the expected multisig / founder address" as a checklist item; on-chain owner is a **single EOA** `0xa2E538…26e2F` for both sale and Archive. The doc is forward-looking, not current. **Severity: MEDIUM.**

---

## 5. First-touch user confusion map

**Seat**
- *User likely thinks:* "My seat is an NFT / a numbered object I own and that's locked to me forever."
- *Protocol actually means:* Seat = SYN ownership (transferable ERC-20); the permanent, numbered identity is the Holder-Index first-seen entry, not the token.
- *Why it happens:* "cannot be reassigned, by anyone, ever" copy + a visual member card + "Seat #N" labels imply a non-transferable token object.
- *Where:* `/` (hero + "WHY JOIN" section), `/join` (member card), `/member/$number`.

**Member**
- *User likely thinks:* "If I hold SYN (even from a DEX/transfer), I'm a member."
- *Protocol actually means:* Member = bought through the sale (Holder-Index buyer). A transfer recipient is a *Holder*, not a *Member*.
- *Why it happens:* "Member" and "Holder" look synonymous; the distinction lives in `MEMBER_DEFINITION`, not on the surface.
- *Where:* `/`, `/members`, `/my-syndicate`.

**Holder Index**
- *User likely thinks:* "My member number is whatever the contract says (`memberNumberOf`)."
- *Protocol actually means:* Identity = first-seen order across all sale contracts; raw counters are metadata that must reconcile to the index.
- *Why it happens:* Carried V1→V2b members keep `memberNumberOf=0` on V2b; the index heals identity invisibly. A raw counter could show a different number than the index.
- *Where:* anywhere `purchaseId`/`memberNumber` metadata is shown vs the index-derived number.

**Package**
- *User likely thinks:* "These are paid plans / product tiers — higher package = more features."
- *Protocol actually means:* A package is just a presentation of a rank threshold (entry USDC → SYN); it confers nothing and is projected 1:1 from `RANKS_V2`.
- *Why it happens:* "Package" + featured/recommended cards mimic SaaS pricing tables; "Package" isn't approved public vocabulary.
- *Where:* `/join` (Seat Packages strip).

**Rank**
- *User likely thinks:* "Higher rank = perks / governance / better pricing, and it's based on how much SYN I hold."
- *Protocol actually means:* Recognition only, from cumulative USDC; confers no rights/returns/pricing.
- *Why it happens:* `benefits[]` field, three different basis phrasings, and ladder visuals imply entitlement and an unclear input (SYN held vs cumulative USDC).
- *Where:* `/ranks`, `/join`, `/my-syndicate`.

**Chapter**
- *User likely thinks:* "Chapter = my tier / how much I paid / the era I bought in."
- *Protocol actually means:* Historical story cohort = deterministic function of member number. No rights.
- *Why it happens:* Chapters share names and ranges with Eras and sit next to Rank/Package on the same pages.
- *Where:* `/chapters`, `/archive`, `/nft`, `/my-syndicate`.

**Era**
- *User likely thinks:* "Eras are the live phases — the price changes by era now."
- *Protocol actually means:* Only Era I is live at the fixed Genesis rate; Eras II–IX are a *proposed future* schedule requiring a future contract. "Era" isn't approved public vocabulary.
- *Why it happens:* The era schedule renders with concrete rates next to live buy UI; the FUTURE label can be missed; Era duplicates Chapter naming.
- *Where:* `/join`, `/chapters`, `/faq`.

**Artifact / NFT**
- *User likely thinks:* "Joining gives me the NFT — the NFT *is* my membership."
- *Protocol actually means:* Membership = SYN (the seat). Artifacts (First Signal, Patron Seal) are separate, optional paid mints ("the memory").
- *Why it happens:* "/nft mint open," "Collect proof you were early," and a member-card visual blur seat vs artifact.
- *Where:* `/nft`, `/archive`, `/` (artifact teaser), `/join`.

**SeatRecord721**
- *User likely thinks:* "There's already a seat NFT (Archive ID2)."
- *Protocol actually means:* ID2 is a reserved, disabled placeholder; the real seat record is a future ERC-721 that must mint from the Holder Index. PENDING.
- *Where:* `/archive`, `/join`, `/my-syndicate` (PENDING markers).

**Referral**
- *User likely thinks:* "I can earn commissions now."
- *Protocol actually means:* Simulated preview; no router deployed (`commissionRouter=0x0`).
- *Where:* `/referral`, `/transparency`.

**Treasury / Custody**
- *User likely thinks:* "A treasury/multisig holds funds."
- *Protocol actually means:* 70/20/10 split to named wallets (live on-chain); the "Treasury Ledger" UI is simulated; both contracts are owned by one EOA.
- *Where:* `/transparency`, `/registry`.

---

## 6. No-solution diagnosis

**Where understanding breaks (in order of severity):**

1. **Identity triad collision — Seat / Member / Artifact (HIGHEST).** The single word "seat" carries two incompatible meanings (transferable SYN token vs permanent index entry), the "cannot be reassigned, ever" claim is literally false for an ERC-20, and artifact/NFT language ("mint open," "collect proof," member-card visual) makes joining look like it yields an NFT. A first-time visitor cannot reliably answer "what do I actually get when I join, and can it move?" This is the break most likely to mislead on the core value proposition and the one with factual/trust exposure.

2. **Chapter vs Era duplication + unapproved "Era" vocabulary (HIGH).** Two coordinate systems over the same member-number axis, sharing names ("Genesis," "Open Era") and ranges (I–IV identical), with only Era I live and the rest FUTURE. "Era" is not approved public vocabulary yet appears on live routes. Users cannot tell which system is real or which one governs price.

3. **Rank semantics (HIGH).** Three stated bases (cumulative USDC vs SYN held vs "USDC routed") that are not numerically equivalent, plus a `benefits[]` field that contradicts "confers nothing." Users cannot tell what drives rank or whether it grants anything.

4. **Package framing (HIGH-adjacent).** "Package" mimics paid plans and isn't approved vocabulary, reinforcing the "tiers with perks" misread that Rank already creates.

5. **Truth-ledger gaps (MEDIUM-HIGH).** Burn proof records 1,000 SYN while chain shows 10,000; custody docs reference a multisig that is a single EOA in reality. These violate "every claim maps to on-chain truth," even though the live metrics themselves read correctly.

**Highest-severity break:** the **Seat / Member / Artifact identity collision** (#1) — it sits above the fold on `/`, `/join`, and `/nft`, touches the protocol's central promise ("you get a permanent seat"), and contains the one *factually incorrect* public claim (a transferable token described as un-reassignable "by anyone, ever").

**Concepts that must be reconciled before traffic (no solutions proposed — list only):**
- **Seat** — single agreed meaning (token vs index entry) and an accurate transferability statement.
- **Artifact vs Membership** — what a visitor receives on join vs what is a separate mint.
- **Chapter vs Era** — which system is public, and how "Genesis"/"Open Era" are disambiguated.
- **Rank basis** — one canonical input, and the status of the `benefits` field under "confers nothing."
- **Era live-status** — unmistakable FUTURE labeling for Eras II–IX wherever rates render.
- **Burn ledger & custody docs** — proof records and custody language matched to on-chain reality.

---

### Appendix — A–N item evidence (9-field answers)

> Each item answers: (1) canonical definition · (2) source path(s) · (3) exact exports/components/doc sections · (4) public wording · (5) on-chain state · (6) production route(s) · (7) LIVE/INDEXED/LOCAL/PREVIEW/PENDING/DISABLED · (8) conflicting/stale · (9) severity.

**A. Seat** — (1) SYN ownership via the sale; permanent identity = Holder-Index first-seen entry. (2) `docs/canon/03_GLOSSARY.md:42-45`, `src/lib/holder-index.ts`, `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md:4`. (3) "SYN is the seat"; `buildHolderIndex`. (4) "SYN is your seat"; "A seat … cannot be reassigned — by anyone, ever." (5) SYN ERC-20, transferable, transferRestrictions:false. (6) `/`, `/join`, `/member/$number`, `/activity`. (7) **LIVE** (token) / **PENDING** (SeatRecord721). (8) permanence claim vs transferable ERC-20; seat≠NFT. (9) **HIGH**.

**B. Member** — (1) sale buyer, de-duplicated by buyer via index; not a mere holder. (2) `src/lib/syndicate-config.ts:45-52`, `src/lib/holder-index.ts`, `docs/canon/03_GLOSSARY.md:43,74`. (3) `MEMBER_DEFINITION`, `MemberCard`, `member.$number.tsx`, `members.tsx`. (4) "Distinct wallets that have purchased … A member is not the same as a token holder." (5) per-contract `memberCount`: V2b=8, V2a=5; canonical = union. (6) `/`, `/members`, `/my-syndicate`, `/member/$number`. (7) **LIVE/INDEXED**. (8) Member vs Holder synonymy risk; carried-member `memberNumberOf=0` on V2b. (9) **MEDIUM**.

**C. Holder Index** — (1) union of V1∪V2a∪V2b purchase events, first-seen order = identity. (2) `src/lib/holder-index.ts`. (3) `buildHolderIndex`; sorts by block/logIndex. (4) (internal — not surfaced). (5) reads `TokensPurchased`(V1)/`Purchased`(V2) across the three addresses. (6) `/members`, `/member/$number`, `/ranks`, `/join`. (7) **INDEXED** (client cache/localStorage). (8) raw `memberNumberOf`/`purchaseId` are metadata only; "identity is always the Holder Index, never this field." (9) **MEDIUM**.

**D. Package** — (1) presentation of a rank threshold; confers nothing. (2) `src/lib/package-catalog.ts`, `src/components/syndicate/JoinPackages.tsx`. (3) `SEAT_PACKAGES`, `featuredPackages`, `nextSeatPackage`, `FEATURED_NAMES` (Citizen/Operator/Vanguard/Steward/Keystone/Cornerstone), `RECOMMENDED_NAME=Citizen`, `HIGH_CONVICTION_NAME=Cornerstone`. (4) "Recognition only — no payout." (5) — (pure data; rate from `currentEra()`). (6) `/join` (used via `/join?amount=N`). (7) **LOCAL**. (8) "Package" not approved vocabulary; reads like a paid plan. (9) **HIGH**.

**E. Rank** — (1) recognition ladder of 12 tiers from cumulative USDC; confers nothing. (2) `src/lib/syndicate-config.ts:104-143`, `RankHub`/`RankLadder`. (3) `RANKS_V2`, `RankTier` (incl. `benefits[]`), `rankForUsdc`, `rankForSyn`. (4) "Ranks describe where you fit, not what you've won." (5) derived from index/balance; no on-chain rank. (6) `/ranks`, `/join`, `/my-syndicate`. (7) **LIVE** (derived). (8) basis stated 3 ways; `benefits[]` vs "confers nothing." (9) **HIGH**.

**F. Chapter** — (1) historical story cohort = function of member number. (2) `src/lib/chapters.ts`. (3) `CHAPTERS` (5), `getChapterByMemberNumber`, `getActiveChapter`, `CHAPTER_LABEL`. (4) chapter labels incl. "Genesis Signal," "Open Era." (5) derived from member count. (6) `/chapters`, `/archive`, `/nft`, `/my-syndicate`, `/registry`. (7) **LIVE**. (8) overlaps Era; "Genesis"/"Open Era" duplication. (9) **HIGH**.

**G. Era** — (1) proposed distribution schedule of 9 eras; only Era I live. (2) `src/lib/eras.ts`, `src/lib/sale-abi.ts:75`. (3) `ERAS`, `currentEra`, `eraByIndex`, `eraMinUsdc`, `ERA_SCHEDULE_NOTE`. (4) "Open Era," "Era I (Genesis)," "a proposed future era — not yet live." (5) **on-chain `currentEra()=1`**. (6) `/join`, `/chapters`, `/faq`. (7) **Era I LIVE; II–IX FUTURE (preview)**. (8) "Era" not approved vocabulary; Chapter overlap. (9) **HIGH**.

**H. Artifact / NFT / Archive** — (1) Archive1155 collectibles, separate from membership. (2) `src/lib/archive-id-registry.ts`, `src/lib/archive-config.ts`, `src/lib/syndicate-config.ts:193-225`, contract `0xB2AE…D54d`. (3) `ARCHIVE_ID_REGISTRY`, `ARCHIVE_CONTRACT_STATE`, `isPublicMintEligible`. (4) "The First Signal — Chapter I NFT mint open"; "Collect proof you were early." (5) supplies id1=11, id2=0, id3=6 (block 88,218,601); ID1 0.5 USDC/limit 5/cap 10k; ID3 5 USDC/limit 5/cap 10k. (6) `/nft`, `/archive`, `/`. (7) **LIVE** (ID1, ID3); **DISABLED** (ID2); **OWNER_ONLY** (ID4–8); **NOT_CONFIGURED** (ID9). (8) First Signal/Patron Seal are NOT membership; join→NFT expectation gap. (9) **HIGH**.

**I. SeatRecord721** — (1) future separate ERC-721 seat proof. (2) `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`, `src/lib/contract-registry.ts`. (3) doctrine §; registry `status:"PENDING", address:null`. (4) shown as PENDING. (5) not deployed (no address). (6) `/archive`, `/join`, `/my-syndicate`. (7) **PENDING**. (8) must mint from Holder Index, "MUST NOT be minted from raw … memberNumberOf"; Archive ID2 placeholder can imply it exists. (9) **MEDIUM**.

**J. Referral / CommissionRouter** — (1) off-chain/simulated preview. (2) `src/lib/preview/referral.ts`, `src/components/preview/ReferralPreview.tsx`, `src/lib/protocol-actions.ts:188`. (3) quarantined money fields; "Simulated preview · Not live data." (4) "Build the protocol. Earn recognition." (5) **`commissionRouter=0x0`** on V2b (chain). (6) `/referral`, `/transparency`. (7) **PREVIEW/SIMULATED**. (8) "earn" wording risk; keep clearly future. (9) **MEDIUM**.

**K. Treasury / routing / ledger** — (1) 70/20/10 USDC split, enforced on-chain. (2) `src/lib/syndicate-config.ts:54-58, 251-255`. (3) `VAULT_ALLOCATION`, `USDC_ROUTING`, `vaultFlow`. (4) "USDC routed"; "Membership Sale Volume." (5) Vault 70% `0x205DdC…464`, Liquidity 20% `0xa9b072…e25`, Operations 10% `0x5cb579…E80`; V2b `totalUsdcRaised=110`. (6) `/transparency`, `/`. (7) **LIVE** (split); **SIMULATED** (Treasury Ledger UI). (8) "raised" banned vs getter name; single-contract total vs site-summed. (9) **MEDIUM**.

**L. Custody** — (1) single EOA owns sale + Archive. (2) on-chain `owner()`; `docs/DEPLOYMENT_STATE_V1.md`. (3) validation/activation checklists. (4) "What is live onchain, what is pending, and where to verify each piece." (5) **V2b owner & Archive owner = `0xa2E538…26e2F`** (chain). (6) `/transparency`, `/registry`. (7) **LIVE (single EOA)**. (8) docs mention "expected multisig"; none implemented. (9) **MEDIUM**.

**M. Vocabulary** — (1) approved/banned public-word doctrine. (2) `docs/canon/03_GLOSSARY.md`, `docs/TERMINOLOGY_GLOSSARY.md`; guard `src/lib/__tests__/doctrine-guard.test.ts`, `src/lib/protocol-language.ts`. (3) approved set + banned lists (see §3.11). (4) — (5) — (6) global. (7) **LIVE** (doctrine + partial guard enforcement). (8) "Era"/"Package" unapproved but live; deep-lore "Signal"/"Archive"/"Chronicle" in UI. (9) **HIGH** (Era), MEDIUM (deep-lore).

**N. First-touch routes** — visible concepts above the fold (route file · first headline):
- `/` (`index.tsx` · "Own the economy. Secure the future.") — **Seat, Member, Artifact, Chapter**
- `/join` (`join.tsx` · "Connect. Approve. Take your seat.") — **Seat, Package, Rank, Member**
- `/my-syndicate` (`my-syndicate.tsx` · "Your identity, place, and proof…") — **Member, Seat, Rank, Chapter**
- `/nft` (`nft.tsx` · "The First Signal — Chapter I NFT") — **Artifact, Chapter, Member**
- `/chapters` (`chapters.tsx` · "The history of protocol formation.") — **Chapter, Member, Era**
- `/ranks` (`ranks.tsx` · "Ranks describe where you fit, not what you've won.") — **Rank, Member, Chapter**
- `/registry` (`registry.tsx` · "Every contract. Every address. Click to verify.") — **Seat, Member**
- `/transparency` (`transparency.tsx` · "What is live, what is partial, what is pending") — **Member** (+ Treasury/Custody)
- `/faq` (`faq.tsx` · "Frequently asked questions") — **Rank, Member, Seat, Era**
- `/referral` (`referral.tsx` · "Build the protocol. Earn recognition.") — **Rank, Member** (preview)

*(/ranks and /registry exist as real route files.)*

---

*End of extraction. No solutions, renames, or copy changes proposed — by design. Decide from this evidence.*
