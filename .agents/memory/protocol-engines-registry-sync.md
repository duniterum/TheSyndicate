---
name: Protocol Engines registry sync
description: How the homepage Protocol Engines panel stays in sync with the canonical contract-status registry, and why the Vault engine is backed by "sale".
---

The homepage "Protocol Engines" panel authors a founder-curated 7-engine list
with LIVE / PREVIEW / FUTURE labels. The canonical contract status is
`PROTOCOL_STATUS` (`src/lib/syndicate-config.ts`). These can drift, so:

- Each engine carries an optional `backing` = the `key` of a PROTOCOL_STATUS
  item. A LIVE engine MUST be backed by a live registry item.
- `validateEngineStatuses()` (pure, exported from the panel) returns violations:
  `unknown-backing` (key not in registry) or `live-but-backing-pending`.
- Guard test: `src/lib/__tests__/protocol-engines-sync.test.ts` keeps violations
  empty and proves synthetic drift is caught.

**Why the Vault engine backs "sale", not "vault":** The PROTOCOL_STATUS "vault"
key is the *programmatic Vault contract* (pending/not deployed). The engine is
the *Vault Wallet* — live because the 70% USDC routing happens inside the live
Membership Sale contract. So it backs "sale". Re-pointing it at "vault" correctly
trips the guard (live-but-backing-pending). This preserves the prior hand-fix
("Vault Wallet" label, not "Vault Contract").

**How to apply:** Burn (transfer-burn / Proof of Burn), Referral (PREVIEW),
Marketplace (FUTURE) have no contract-status entry in the registries, so they
carry NO backing (allow-list by absence) — don't invent a backing key for them.
Mappings today: sale→sale, liquidity→lp, nft→archive, vault→sale.
Note: `Flywheel.tsx` has a SEPARATE hardcoded engine list not yet covered by
this guard (follow-up task).
