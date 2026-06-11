---
name: Canonical protocol layer architecture
description: Definitive layer taxonomy + the classification rulings that stop layer-mixing (Treasury⊂Economic, Rank vs Recognition, Artifact≠Seat, Chronicle⊂Memory, founder-action default).
---

# Canonical layer model (the anti-mixing map)

**Top-level layers:** TRUTH (substrate) · IDENTITY · ECONOMIC (Treasury sublayer) · ARTIFACT · EVENTS/ACTIVITY · SIGNALS · MEMORY (Chronicle + Recognition sublayers) · STORY · ANTICIPATION · DIFFUSION (Growth/Referral sublayer) · INTELLIGENCE (cross-cutting, read-only derived) · FUTURE (Governance/Marketplace/Ecosystem/SeatRecord721).

## Binding classification rulings (keep consistent)
- **Treasury is a SUBLAYER of Economic, never its own top layer.** Split enforced on-chain in the Membership Sale contract: **Vault = 70%, Liquidity = 20%, Operations = 10%** of every USDC purchase; the **Membership Distribution Wallet** holds the SYN inventory delivered to buyers. Protocol value-holding wallets = vault/liquidity/operations/distribution (`known-addresses` `isProtocolWallet`).
- **Two distinct "recognition" concepts — never merge:** (1) **RANK = an IDENTITY attribute** (cumulative USDC, recognition-only); (2) the **RECOGNITION SYSTEM** (early/continuity/witness) = a **MEMORY OUTPUT** sublayer. Money may raise Rank-recognition but confers nothing economic back.
- **ARTIFACT is its own layer, distinct from Identity and Memory.** Seat = Identity (derived, abstract, always exists, NOT an NFT). Archive1155 / First Signal / Patron Seal = held Artifacts (optional, not required for membership). SeatRecord721 (PENDING, address null) is the FUTURE point where Identity becomes an ownable Artifact — until it ships, **NFT ≠ Seat**.
- **Chronicle is a CURATED SUBSET of Memory, not its own layer.** Spine: Activity records everything → Signals detect what matters → Memory preserves → Chronicle = the meaningful canon subset → Story explains. One-way; Chronicle never invents. "Chronicle" is BANNED public vocab → public = "Activity"/"Story".
- **Founder/system wallet action default = ACTIVITY only, NOT Story.** Promotion to Signal/Chronicle/Story needs a Signal rule over event properties — not the mere fact the founder acted. Rare historic exceptions: token/contract deployment, initial liquidity, founder burn (Proof of Fire). Routine vault/operations/LP movements stay Activity-only. (`founder-actions.ts` categories: founder-burn / funded-operations / funded-vault / funded-liquidity / allocation-movement; classified ONLY when sender = founder wallet; ops/liquidity inflows reserved, not scanned yet.)
- **Anticipation is a SIBLING of Story (forward), fed by Truth + locked config, NOT Signals** (see engine-completion-vs-pipeline rulings).
- **Wallet ≠ one concept.** Roles: identity (user wallet) · payment-source (user wallet, transiently) · custody/treasury (vault/liquidity/operations/distribution) · founder-actor (founder wallet, public/vested) · artifact-holder (any wallet holding Archive1155). Same address can hold multiple roles, but a user wallet is NEVER treasury.

## Touch boundaries (which layer you are editing)
- **Share cards / OG** → DIFFUSION only; they CONSUME Identity/Economic/Truth read-only — don't modify the source layers.
- **Vault** → ECONOMIC › Treasury (`treasury-hooks`, contract-registry wallet entries, `syndicate-config` addresses); don't touch Activity/Story.
- **MemberCard** → Identity public surface (its data) + Diffusion (its share/export).
- **Chronicle** → MEMORY › Chronicle (`chronicle-entries`/`chronicle-candidates`) + Story surfaces; must derive from Activity/Signal — never hardcode new "facts."
- **NFTs** → ARTIFACT (`archive-*` modules, `archive-id-registry`, MythologyWall, NftPage) + Truth registries; don't touch Seat/Identity (NFT ≠ Seat).

**Why:** the recurring failure mode is concept-mixing (money↔identity, NFT↔seat, activity↔chronicle, founder-action↔story). This map is the precedence guard so future work edits ONE layer and consumes the others read-only.
