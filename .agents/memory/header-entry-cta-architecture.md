---
name: Global identity adapter for header/mobile-bar/wallet-dropdown
description: Why global chrome has its own identity adapter separate from the cockpit, and the doctrine rules that govern its state-aware CTAs.
---

# Global identity adapter (global chrome only)

There is ONE Header (mounted via PageShell). `IdentityRibbon` also reads holder-index
and was historically the only fully state-aware entry strip; as of Sprint D the
header's gold Join CTA, MobileJoinBar, and the wallet dropdown are state-aware too
(the earlier "member-aware global CTAs DEFERRED" note is RESOLVED).

Global chrome — the header, the mobile action bar, and the wallet dropdown — derives
its "connected? member?" state from ONE small adapter (`useGlobalIdentity` /
pure `resolveGlobalIdentity`), NOT from the cockpit's next-action context.

**Why:** `useCockpitAccount` / next-action-context are cockpit-scoped and not
global-safe; reusing them in the header couples global chrome to a page surface.
The adapter reuses only `useWalletSession` + the **shared** `useHolderIndex` query
(one cached getLogs scan site-wide) so subscribing adds **zero new chain read**.

## Doctrine rules baked into the state machine (do not regress)

- **Connect ≠ membership.** A wallet is a Member ONLY via a Sale buy recorded in
  the Holder Index. Connecting/opening a page is never joining.
- **Never flash the wrong CTA during load.** A `mounted` gate makes server + first
  client render emit the neutral "Join The Syndicate" (no hydration mismatch); the
  state only ever upgrades neutral→correct.
- **Holder-index ERROR must fold into the neutral/unresolved path** — never infer
  non-member from an index failure. An RPC/scan error would otherwise make a real
  member look like a non-member and show "Become a Syndicate Member". So `idxError`
  keeps `isLoadingIdentity` true and both membership flags false.
  **How to apply:** any consumer of holder-index truth for a membership claim must
  gate on `!idxLoading && !idxError`, not just `!idxLoading`.
- **Connect ≠ membership applies to DESCRIPTIVE COPY too, not just CTAs.** The wallet
  dropdown subtitles ("Your member dashboard", "Member identity & history") are
  member-claims; they must be gated on `isMember`, with neutral copy for
  non-member/loading/error. `/my-syndicate` itself stays reachable by ANY connected
  wallet (it renders its own visitor-vs-member state) — that's a destination, not a claim.

## Label matrix
disconnected/loading/error → "Join The Syndicate" (compact "Join" in the width-tight
header pill is intentional — it co-exists with the Connect button at 1280; the full
label renders in the drawer + MobileJoinBar) · connected non-member → "Become a
Syndicate Member" · member → "Buy More SYN". MobileJoinBar only overrides the CTA on
routes whose primary IS `/join`; the `/nft` Mint action stays open to everyone.
