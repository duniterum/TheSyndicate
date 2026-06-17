---
name: First Signal (Archive1155 ID 1) supply + multi-mint truth
description: Multi-mint of The First Signal is intentional (walletLimit=5); the "uncapped" label is a doc/cockpit discrepancy — on-chain ID 1 is hard-capped at 10,000.
---

# The First Signal (Archive1155 ID 1) — supply & multi-mint doctrine

A wallet can mint The First Signal **several times by design** — this is NOT a bug.

**On-chain truth (Archive1155 `0xB2AE…D54d`, `getArtifactCore(1)`):**
- `walletLimit = 5` → up to 5 copies **per wallet** (UI surfaces a "Wallet limit reached" phase at 5).
- `maxSupply = 10000` → total edition is **hard-capped at 10,000** (remainingSupply = maxSupply − minted, confirmed).
- `definitionFrozen = true` → price/supply/walletLimit/renderer are **frozen**; the in-repo ABI exposes **no** admin setter. Changing walletLimit (e.g. 5→1) is impossible without a new token ID / redeploy.
- `ownerOnly = false`, `active = true`, `priceUsdc = $0.50`, renderer = ONCHAIN_SVG.

**The discrepancy (now FIXED, 2026-06-17):** `CockpitCollector.tsx` used to hardcode ID 1 `supplyMode: "uncapped"` and render the label **"Uncapped supply"** (+ an "Open edition" chip), and several docs (COCKPIT_WIDGET_INVENTORY, PRODUCT_MEMORY_AND_FUTURE_LOOPS, DEAD_COMPONENT_SALVAGE_REPORT) repeated "First Signal is uncapped". The deployed contract caps it at **10,000** (`archive-preview-catalog.ts` already agreed: `proposedMaxSupply: 10_000`). Resolved by renaming the cockpit `SupplyMode` for ID 1 to **`"fixed-edition"`** (catalogMaxSupply 10_000 labeled fallback) — the no-bar branch now renders "Edition of {live maxSupply ?? catalog} · {remaining} remaining" (still NEVER a scarcity progress bar — that was the no-redesign constraint). The `/nft` hero (`FirstSignalShowcase`) already showed the real cap and now also carries "memory of your membership, not the seat" + record-only copy. Do NOT reintroduce "uncapped"/"open edition" for ID 1.

**Why it matters:** protocol doctrine = "every public claim must map to an on-chain read" + "code outranks docs". On-chain wins → ID 1 is **capped at 10,000**; the "Uncapped supply" claim is inaccurate. Correcting it is a label/copy change only (no contract change).

**How to apply:** when reasoning about First Signal supply, trust the live `getArtifactCore(1).maxSupply` (10,000), not the "uncapped" label. Multi-mint per wallet is the intended collectible-edition design ("SYN is the seat; Artifacts are the memory") — the seat is the singular identity, the artifact is a collectible memory (≤5/wallet, ≤10,000 total). It is NOT the membership seat, NOT SeatRecord721 (ID 2 reserved/disabled → future separate ERC-721), confers no rank/governance/financial rights.
