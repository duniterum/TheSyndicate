> **Historical note:** this document predates the activation of the Archive1155 contract and the Patron Seal (ID 3). Archive1155 is **LIVE**, ID 1 (First Signal) is **LIVE**, and ID 3 (Patron Seal) is **LIVE on-chain**. The "Patron Seal mint · Deferred" row below reflects a previous state and is retained as a historical record only. See `docs/REALITY_REFLECTION_AUDIT.md` and `/protocol-health` for current truth.

# Smart Contracts — Deferred (and why)

> SYN is the seat. NFT Artifacts are the memory.
>
> The NFT Archive contract system is **intentionally deferred**. This
> document lists exactly what is NOT being built today and what gates
> each deferred component will need to pass before it ships.

Companion documents:

- `docs/ARCHIVE_ENGINE_SPEC.md` — the foundation that future contracts plug into.
- `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md` — claim-by-claim truth state.
- `docs/STEP_BY_STEP_FROM_HERE.md` — exact next-phase steps once contracts are authorized.

---

## 1. What is deferred

| Component                              | Status   | Why deferred                                                                                       |
| -------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| Archive NFT contract (ERC-721 / 1155)  | Deferred | No deployment, no audit, no production lock for contract code yet.                                 |
| Seat Record ERC-721 contract (`SyndicateSeatRecord721`) | Deferred — separate contract | Final architecture LOCKED 2026-06-06: Seat Records ship later in a **separate ERC-721** at a new address, not as an ERC-1155 in Archive1155. ID 2 in Archive1155 is a reserved + disabled pointer only. See `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`. |
| Chapter Artifact mint window           | Deferred | Depends on Archive contract + `ChapterSealed` trigger.                                             |
| Patron Seal mint                       | Deferred | Depends on Archive contract + USDC routing wiring.                                                 |
| Heart Signal / Secret discovery proofs | Deferred | Depends on Archive contract + discovery proof verifier.                                            |
| Protocol Milestone auto-claim          | Deferred | Depends on Archive contract + on-chain milestone event source.                                     |
| Liquidity Mark eligibility prover      | Deferred | Depends on JLP balance snapshot at trigger block + Archive contract.                               |
| Legacy Artifact post-seal release      | Deferred | Depends on chapter sealing being on-chain and finalised.                                           |
| Archive indexer (`balanceOf`, enum)    | Deferred | Cannot exist without a deployed contract.                                                          |
| Per-wallet NFT inventory UI            | Deferred | Pending indexer + contract.                                                                        |
| Mint UI / claim UI                     | Deferred | Pending contract + audit + legal review.                                                           |
| Admin / config panel                   | Deferred | Pending contract.                                                                                  |
| Royalties / secondary-market policy    | Deferred | Pending contract + legal review.                                                                   |
| Merkle allowlist / signature gating    | Deferred | Pending contract.                                                                                  |
| Randomness / VRF                       | Out of scope until needed | No artifact requires it today.                                                          |
| Staking / yield / dividend / revenue share | Out of scope | Constitutional ban. Status is positional, never wealth-coded.                                |
| Governance token / voting              | Out of scope | The Syndicate has no governance token.                                                          |
| Marketplace                            | Out of scope | We do not operate a marketplace.                                                                |

---

## 2. Why deferring is safe

The site renders **exactly four public labels** today
(`LIVE ON AVALANCHE`, `DERIVED FROM ON-CHAIN DATA`, `PENDING NFT CONTRACT`,
`ROADMAP`) and every surface declares — in code — the future contract /
event / eligibility / data shape it will eventually plug into.

This means:

- No copy needs to be rewritten when contracts ship.
- No layout needs migration.
- No badge needs renaming.
- No metric was invented that must later be retracted.

See `src/lib/archive-truth-states.ts` (`CATEGORY_FUTURE_BINDING`) for the
per-category data shapes and `docs/ARCHIVE_ENGINE_SPEC.md` §3 for the
surface → state grid.

---

## 3. Gates that must pass before each contract ships

Before a contract leaves this deferred list it MUST:

1. **Legal review** — confirm Artifact remains a collectible record, not
   a security, utility token, revenue-share instrument, or governance
   right under the user's target jurisdictions.
2. **Constitutional review** — pass the Five Pillars (Transparency ·
   Identity · Memory · Momentum · Shareability), the Triple Test (does
   it increase transparency, strengthen identity, improve memory?), the
   Decision Lenses (10/10), the Core Asset gate (status is positional,
   never wealth-coded), and the Mythology gate (names are earned, never
   authored).
3. **Spec freeze** — full per-event schema, eligibility rule, routing
   rule (if proceeds are collected), and metadata URI policy frozen.
4. **External audit** — independent contract audit completed and report
   published.
5. **Test deployment** — Fuji testnet deployment with end-to-end claim
   flows exercised.
6. **Indexer parity** — indexer + UI hooks match production data with
   zero invented fields.
7. **Production lock report** — full QA / smoke / leak guard / honesty
   guard signed off.

No contract ships without all seven.

---

## 4. Banned wording (constitutional, pre- and post-contract)

These remain banned even after the Archive contract is deployed, unless
a specifically authorized mechanism creates them and a legal review
clears the wording:

`investment`, `yield`, `dividend`, `revenue share`, `profit`,
`guaranteed value`, `Vault entitlement`, `holder rights`, `reward`,
`utility` (financial sense), `airdrop` (as promise), `passive income`,
`appreciation` (as promise).

---

## 5. What we are NOT promising

We are **not** promising:

- That the Archive contract will ever be deployed.
- A launch date.
- A specific mint price (target launch prices in `archive-config.ts` are
  reference values only, never charged today and not binding).
- That any specific wallet will be eligible for any specific artifact.
- That every category currently listed will ship — categories may be
  dropped or merged before deployment.
- Any secondary-market value.

All of the above are deliberate and constitutive of the truth posture.

---

## Update (2026-06-06)

- **Seat Record architecture — ✅ LOCKED.** Seat Records ship later in
  a **separate ERC-721** (`SyndicateSeatRecord721`), NOT as an
  ERC-1155 inside `SyndicateArchive1155`. Token ID 2 in Archive1155
  is permanently a reserved + disabled pointer
  (`maxSupply = 0` = LOCKED / NOT MINTABLE). See
  `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`.
- **No unlimited minting in V1.** `maxSupply == 0` means
  LOCKED / NOT MINTABLE — it never means unlimited.
- **Complex eligibility (LP-snapshot, discovery proof verifier)** —
  still deferred.
- **On-chain metadata / SVG renderer** — moved from "out of scope" to
  **under active consideration before V1 code**. See
  `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md` and
  `docs/SMART_CONTRACT_DECISIONS_PENDING.md` decision B1.
- **Visual system + metadata philosophy + token catalog** — now FROZEN
  in `docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md`,
  `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`,
  `docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md`.
