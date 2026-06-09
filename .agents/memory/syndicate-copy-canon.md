---
name: Syndicate protocol-language canon
description: Canonical user-facing vocabulary for The Syndicate site — CTA labels, status vocab, identity nouns, on-chain spelling. Apply to any future copy edit.
---

# The Syndicate — copy canon

Result of a site-wide text-only language harmonization. These are the agreed user-facing
strings; keep future copy consistent with them (don't reintroduce retired variants).

**Why:** the site had drifted into many synonyms for the same action/concept, making it
read like stitched pages. One vocabulary = one product.

## CTA labels (buttons / links)
- Acquisition (non-member): **"Join The Syndicate"** (or compact **"Join"** in tight/mobile contexts). Retired: "Take your seat", "Take a seat", "Claim your seat", "Become a member", "Join now", "Buy SYN with USDC" (as a nav CTA).
- Member top-up (member-aware surfaces only): **"Buy More SYN"**. Never show "Join…" to a known member, never show "Buy More SYN" to a non-member.
- Mint: object-specific **"Mint The First Signal"** (retired bare "Mint Now").
- Verify: **"Verify on-chain"** (lowercase). Explorer-specific **"Verify on Avascan"** is intentional and kept.

## Narrative copy KEPT (not buttons — do not normalize)
Headlines/taglines like "Take your seat in The Syndicate.", "Mint the opening signal.",
"Connect. Approve. Take your seat." are deliberate narrative voice, distinct from CTAs.

## Status vocab
Three tokens only: **LIVE / PARTIAL / PENDING** (StatusTag tone: LIVE→success, PARTIAL→gold, PENDING→muted). No "Mock", "Coming Soon", "Planned" in live UI.

## Identity nouns are DISTINCT roles, not synonyms (do not merge)
- **Member** = recorded in member registry (joined via Membership Sale).
- **Holder** = owns SYN (may not be a member). The wallet page ships an explicit "Member vs Holder" explainer.
- **Collector** = mints/collects Archive Artifacts.
- **Patron** = Patron Seal artifact.
- **Seat** = the membership ("SYN is the seat"). **Seat Record** = the *future ERC-721* identity NFT (always tagged PENDING / not-deployed). Never conflate "Seat" with "Seat Record".

## Chapter/era names (canonical, consistent site-wide — don't invent variants)
Genesis Signal · First Thousand · The Expansion · First Ten Thousand · Open Era.
("Genesis Chapter Artifact" is the NFT category, distinct from the era "Genesis Signal".)

## PENDING vs LIVE NFT trap
The live NFT is Archive1155 **The First Signal (ID1)** — mints now. The pending NFT primitive
is the **Seat Record (ERC-721)**. A status rail listing generic "NFT" as PENDING contradicts the
live First Signal — label the pending item "Seat Record", not "NFT".

## Rank tier names + framing (see rank-constitutional-ruling.md)
Rank ladder renames: `$100` tier **Vanguard** (was "Founder"), `$10,000` tier **Cornerstone** (was "Genesis Circle"). Rank copy is recognition-only — never "$X to next rank"/"Rank unlocked"/spend-ladder. "Founder #"/founderNumber is identity, not a rank.

## on-chain spelling
Body prose canonical = **"on-chain"** (dominant). "onchain"/"Onchain" prose split (~80 instances)
was left as a flagged follow-up — a blanket `\bonchain` sweep risks hitting URL fragments /
analytics keys / identifiers, so normalize case-by-case, not site-wide-automated.

## Known dead/stale code flagged for deletion (NOT rewritten — fabricated/unrendered)
In Sections.tsx: EpisodeEngine/EPISODES, WhyComeBackTomorrow ("NFT Adoption · Mint not yet opened" — stale), GenesisNFTProgress, WhitepaperPreview ("NFT Layer: Planned" — stale), VERIFY_ENTITIES "NFT Contract". Recommend deletion rather than copy-fixing dead code.
