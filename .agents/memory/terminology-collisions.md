---
name: Canon terminology collisions to watch
description: Same word used for two distinct canonical concepts. These are real cross-file collisions, not style nits — guard against conflating them in copy/docs/whitepaper.
---

# Terminology collisions in the canon (same word, two concepts)

These are live name clashes between distinct canonical concepts. Each is a
cross-file finding (not visible from a single file), and each is a recurring
drift trap for copy, FAQ, whitepaper, and audits.

- **"Patron"** — collides:
  - a **Rank** named "Patron" at the $500 tier (`RANKS_V2` in
    `syndicate-config.ts`), AND
  - the **Patron Seal** artifact / "Patron" identity role (Archive ID 3,
    `archive-config.ts`; copy-canon defines Patron = Patron Seal holder).
  Rank "Patron" confers nothing; Patron Seal is a 5.00 USDC collectible. Don't
  let copy imply the rank grants the seal or vice-versa.
- **"Council"** — a Rank tier ("Council Candidate" $1,000, "Council" $2,500) AND
  the future **Governance** "council" concept. Rank ≠ governance body.
- **"Vault"** — overloaded across FOUR things: **Vault Wallet** (EOA, receives
  70% USDC), **Vault Reserve** (25% SYN allocation), **"The Vault"** (treasury
  brand name), **Treasury Ledger** (movement record / `transaction-tags.ts`).
  Glossary keeps Vault Wallet ≠ Vault Reserve explicitly; PCA is the umbrella.
- **"Genesis"** — the **Chapter I "Genesis Signal"** era vs the **"Genesis
  Chapter Artifact"** (NFT category) vs the on-chain artifact name **"Genesis
  Sealed"** (Archive ID 5). Distinct; the guard preserves the artifact names.
- **"Chronicle"** — internal system + Archive **ID 9 "Protocol Chronicle"**
  (NOT_CONFIGURED) exist, but **"Protocol Chronicle" is BANNED external
  vocabulary** (glossary). Public surface for the live feed is **"Activity"**;
  Chronicle is curated/deep-lore. Activity (raw) ≠ Chronicle (curated/gated).

- **"contribution"** — UNRESOLVED DRIFT, not a collision but a guard gap: the word
  is NOT in `FORBIDDEN_LANGUAGE` (`protocol-language.ts` bans raised/yield/roi/etc.,
  NOT contribution), yet it IS rendered in copy across several surfaces (e.g. "Vault
  Contribution" label in `Sections.tsx`, "the rank your contribution reflects" in
  `RankHub.tsx`, "custom member contributions" in `syndicate-config.ts` tokenomics,
  roadmap, referral notes) while `my-syndicate.tsx` carries a comment locally banning
  it. External audit prompts treat "contribution" as forbidden; the code allows it.
  **Do NOT auto-edit copy to remove it on an audit's say-so — it needs a founder
  ruling first** (keep / add to FORBIDDEN_LANGUAGE / formally allow).

**Why:** these recur in every audit and copy pass; conflating them reintroduces
retired doctrine or implies perks/rights that don't exist.

**How to apply:** when writing rank, artifact, treasury, or narrative copy,
disambiguate explicitly. Rank names reusing identity/artifact/governance words
(Patron, Council, Founder, Genesis) are a known smell — the Rank Constitutional
Ruling already retired Founder/Genesis Circle as rank names for this reason.
