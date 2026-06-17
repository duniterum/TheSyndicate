---
name: Homepage cockpit + intelligence-bar curation
description: How the homepage cockpit composes, the ProtocolIntelligenceBar curation contract, and the engines-panel doctrine constraints.
---

# Homepage cockpit (index.tsx) + ProtocolIntelligenceBar curation

## Intelligence bar curation contract
- ProtocolIntelligenceBar takes optional `cells` (curate + order by key) and `mobilePriority` (hide cells at index >= N below `sm`). With NO props the render is BYTE-IDENTICAL to before.
- **Why:** the prop-less bar is the GLOBAL chrome bar rendered by PageShell everywhere; a homepage curation feature must never alter that default output. Treat the prop-less path as a frozen contract.
- The aggregate status pill scopes to the DISPLAYED cells when `cells` is provided (so unresolved hidden global metrics can't make a curated cockpit ticker show PARTIAL/PENDING). Default (no `cells`) still reflects the full global read set. The pill is labeled "PROTOCOL" = protocol-wide trust status, not a per-cell badge.
- Homepage curated cells: members, usdcRouted, protocolWallets, lpTvl, burned, chapter (mobilePriority 4).

## ProtocolEnginesPanel doctrine
- It is the founder's explicitly-enumerated 7-engine list (Membership Sale LIVE, Vault Wallet LIVE, Liquidity LIVE, Burn LIVE, NFT/Artifacts LIVE, Referral PREVIEW, Marketplace FUTURE), NOT a projection of PROTOCOL_STATUS/TRANSPARENCY_ITEMS (no clean 1:1; those have no PREVIEW/FUTURE and no Referral/Marketplace/Burn engine concept).
- **Why:** the Vault entry MUST stay "Vault Wallet" (the live public wallet receiving 70%), never bare "Vault" — canonically the programmatic Vault CONTRACT is `pending` (PROTOCOL_STATUS key "vault" / TRANSPARENCY_ITEMS "Vault Contract"). Bare "Vault · LIVE" would falsely claim the contract is live.
- **How to apply:** when adding/relabeling an engine, cross-check it against PROTOCOL_STATUS/TRANSPARENCY_ITEMS so a LIVE engine never contradicts a pending contract. Status colors are emerald(LIVE)/amber(PREVIEW)/muted(FUTURE) only.

## Cockpit composition (index.tsx)
- Order: curated ticker -> ProtocolHero -> HomeKpiGrid -> ProtocolEnginesPanel -> MilestoneApproachingTile -> LivePulseStrip -> HomeActivityTape -> ActMarker "01 How it works" (WhyJoinSimple, HowToJoinSteps, WhatChangesAfterJoining, IdentityZone, HomeProgressionTeaser, Flywheel, ProtocolStorySoFar) -> ActMarker "02 Verify" (StoryTimeline, HomeTransparencySnapshot) -> CTA Section -> RiskDisclaimer.
- All gated narrative surfaces (ProtocolStorySoFar, StoryTimeline, Flywheel, MilestoneApproachingTile) are KEPT and relocated, never deleted — pinned by gated vitest (protocol-awareness, proof-drawer-and-timeline) + check-homepage-content.mjs phrase parity. Moving one between files can break its source-scan test even when the page is correct.
