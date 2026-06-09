---
name: Archive1155 artifact mint-open truth gating
description: Rules for how cockpit/collector UI may represent Archive1155 artifact mint state without lying about on-chain reality.
---

Any cockpit/collector UI that surfaces Archive1155 artifact mint state must never
assert a live/"mint-open" condition the contract does not explicitly confirm.

The rule: a card may show "ACTIVE · MINT OPEN" (and render a Collect CTA, and the
"wallet limit reached/not eligible" note) **only** when `artifact.active === true`
**and** `paused === false`. Both must be explicitly read.

**Why:** an on-chain `getArtifactCore` read can succeed (`active===true`) while the
global `paused()` read fails or is still loading. Treating `paused===undefined` as
"not paused" would let the UI invite a mint that is actually paused — a false
mint-open. Architect review flagged this twice during Wave C3.

**How to apply:** derive a status ladder in this order — `pending` → `paused===true`
(PAUSED ON-CHAIN) → `paused===undefined && pausedError` (PAUSE UNREADABLE, honest
degraded state) → `active===true && paused===false` (the only ACTIVE state) →
`active===false` (CONFIGURED · NOT ACTIVE) → artifact read error (READ ERROR) →
else READ PENDING. `active===true` with `paused` still loading (no error) must fall
through to READ PENDING, never ACTIVE. Thread `pausedError` from
`useArchiveArtifactReads` into the per-card component — `paused` alone is not enough.

Adjacent truth rules carried by the same surface: First Signal is uncapped → never
render a supply/scarcity bar; capped artifacts (Patron Seal) show a progress bar
only when live minted is derivable (totalMinted or live maxSupply−remaining),
labeling a catalog fallback denominator; Seat Record is a PENDING future ERC-721
(non-mintable, not Archive1155); prices come from live `priceUsdc÷1e6` else canonical
config `targetPriceUsdc` (labeled live|catalog), never hardcoded literals.
