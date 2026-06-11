# 04 — DOCUMENTATION SYNC CHECKLIST

The process that keeps code, canon, docs, FAQ, whitepaper, site copy, and the
doctrine guard from drifting apart. Run this whenever any concept, value, contract,
or term changes.

> Principle: **truth flows in one direction — from code/contracts outward.** Never
> edit a downstream doc to match a stale upstream one; fix the upstream first.

---

## Required update order

When anything changes, update in this exact order. Do not skip a step; each layer
depends on the one above it being correct.

1. **Code / contract truth** — the registry/config/contract is the only real source
   (`syndicate-config.ts`, `contract-registry.ts`, `archive-id-registry.ts`,
   `chain-registry.ts`, the deployed contracts).
2. **`docs/canon/02_SOURCE_OF_TRUTH_TABLE.md`** — reflect the new truth + status/confidence.
3. **Canon docs** (`docs/canon/00`–`03`) — update intent / authority / glossary as needed.
4. **Glossary** — `docs/canon/03_GLOSSARY.md` **and** the mirrored `docs/TERMINOLOGY_GLOSSARY.md` (keep both in sync).
5. **FAQ** — align answers to the new truth.
6. **Whitepaper** (`/whitepaper`) — align long-form claims.
7. **Site copy** — routes/components in `src/routes` and `src/components`.
8. **Doctrine guard** — `src/lib/__tests__/doctrine-guard.test.ts` (`BANNED` /
   `DOC_BANNED` / `CANONICAL_DOCS`) and `scripts/live-content-rules.json`. **This is
   the step most often skipped** because the guard is hardcoded and decoupled from
   the maps — see the open item below.
9. **Discrepancy audit** — re-run the lint checklist below.

---

## Lint / discrepancy checklist (read-only scan)

| Check | How |
|---|---|
| Stale / mock values | grep mock constants: `VAULT_ASSETS`, `VAULT_INFLOWS`, `GENESIS_NFT_PRICE`, `VAULT_STARTING_VALUE`, `CURRENT_EPISODE`. |
| Banned legacy doctrine | run `doctrine-guard.test.ts`. |
| Retired rank vocabulary | grep `scoreMultiplier`, `Compounder`, `Genesis Circle`, "Founder" as a rank name. |
| Retired cohort labels | grep the superseded cohort labels listed in `docs/DOCUMENTATION_AUTHORITY_MAP.md`. |
| Wrong NFT prices | compare copy vs `ARCHIVE_CONTRACT_STATE` (First Signal 0.50, Patron Seal 5.00). |
| Wrong contract addresses | diff copy vs `contract-registry.ts` / `02_SOURCE_OF_TRUTH_TABLE.md`. |
| Simulated-as-live | grep `status: "PENDING"` constants rendered without a PENDING pill. |
| Live-but-hidden revenue | audit NFT-mint + LP-fee surfacing depth. |
| Financial-risk wording | grep the banned financial vocabulary (`03_GLOSSARY.md`) across all copy. |
| Members-count parity | confirm `protocol-truth.ts` and `data-verification-registry.ts` agree (one definition). |

---

## Collision-ruling enforcement (apply on every copy change)

Before shipping copy, confirm it obeys the `03_GLOSSARY.md` rulings:
- "Patron" is reserved for the support family (Patron **Seal** / Support / Actions / Recognition) — no rank uses it (the $500 rank is **Steward**).
- "Council" is reserved for future governance only — no rank uses it (ranks are **Custodian** $1,000 / **Keystone** $2,500).
- "Vault" sub-terms are precise; the shared Vault Wallet / Vault Reserve address is disclosed.
- "Member" vs "Holder" used per their definitions.
- Public feed is called "Activity," never "Chronicle."
- No "referral/reward/earn" language unless explicitly PENDING.
- Public NFT word is "NFT"; "Relic" never appears in live UI.

---

## Open enforcement item (carried forward)

The doctrine guard's `CANONICAL_DOCS` and `DOC_BANNED` are **hardcoded** and not
parsed from any map — so reclassifying or adding a doc has **no automated effect**
until the test arrays are hand-edited. Two follow-ups (both **code** tasks, out of
scope of this docs consolidation pass):

1. **Register the canon** — add `docs/canon/00`–`04` to `CANONICAL_DOCS` so the
   guard scans them. *Caveat:* the canon glossary intentionally names deep-lore /
   banned terms (e.g. "Relic") when teaching them; before registering, mark those
   as `**Wrong:**` lines (the guard strips them) or the scan will fail.
2. **Couple the guard to the map** — optionally have the guard parse the authority
   map / canon instead of duplicating the lists, removing the decoupling for good.
