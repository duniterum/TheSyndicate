---
name: Whitepaper extraction map
description: Where the whitepaper source-of-truth index lives and the deliberately-deferred rank naming-order decision.
---

# Whitepaper extraction map + deferred rank-order

`docs/whitepaper/WHITEPAPER_EXTRACTION_MAP.md` is the section-by-section index a
future whitepaper assembles from. It maps nine sections (Membership, Packages,
Chapters vs Eras, Ranks, DEX vs sale price, Future utility, Marketplace, Signal
Chamber, Legal exclusions) to their source-of-truth code/canon files.

**Rule:** it is extraction *source material*, NOT a new canon layer. Code/on-chain
truth outranks it. Refresh every figure from code before publishing; if the map
and code disagree, the code wins. Do NOT cite `.agents/memory/*` as a public
extraction source — point to `docs/canon/` or code.

**Deferred decision — rank naming order.** "Architect" ($250) sits *below*
"Steward" ($500) by USDC threshold, which some read as inverted seniority. This
is **deliberately left as-is** — any rename/reorder is a future governance
decision, not an oversight.
**Why:** renaming canon tiers is heavy and contested; instead the `RankLadder`
("Reading the ladder" copy) makes the fixed-threshold ordering explicit so the
ladder reads intentionally without a rename.
**How to apply:** if asked to "fix" the Architect/Steward order, treat it as a
canon-rename governance task, not a copy tweak; don't silently reorder RANKS_V2.
