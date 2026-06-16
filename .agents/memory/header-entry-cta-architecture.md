---
name: Header / entry-CTA architecture + state-awareness gap
description: How the global header/entry surfaces are wired, which are state-aware, and why member-aware global CTAs are deferred behind a future identity adapter.
---

# Header / entry-CTA architecture

There is exactly ONE header (`Header.tsx`), always mounted via `PageShell.tsx`
(no route renders its own header; no duplicate/alternate header system). The
"entry CTA" surface is spread across several PageShell/root-mounted components:

- **`Header.tsx`** — logo, PRIMARY nav + "More" group, action cluster
  (NotificationBell, `AvalancheNetworkPill`, ThemeToggle, `HeaderWalletChip`,
  gold **Join** link → `/join`). Mobile drawer repeats Join + wallet chip + nav.
  The gold Join CTA is **NOT** member-aware (it shows "Join" to everyone).
- **`HeaderWalletChip.tsx`** — THE Connect/wallet logic (raw wagmi, not
  useWalletGate). Disconnected → "Connect" (<2xl) / "Connect Wallet" (2xl+).
  Connected → network chip + address + dropdown (My wallet page → `/wallet/$address`,
  Join page → `/join`, Switch to Avalanche, Disconnect). The connected dropdown
  has **no** `/my-syndicate` link and shows "Join page" to members too.
- **`MobileJoinBar.tsx`** — global sticky mobile bar (the ONLY fixed bottom bar;
  mounted in `__root.tsx`). Route-aware primary CTA (Mint on /nft, Join elsewhere,
  hidden on /join) + Verify → /transparency. **NOT** member-aware.
- **`IdentityRibbon.tsx`** — the canonical state-aware seat strip (mounted by
  PageShell; homepage hides it). It ALREADY reads identity globally
  (`useWalletSession` + `useHolderIndex`) and is the one fully state-aware entry
  surface: visitor → "Join The Syndicate →"; connected-non-member → "Join The
  Syndicate →"; member → "Member #N …" + **"My Syndicate →"** (→ `/my-syndicate`).

## Canon labels (don't invent new ones)
Connect / My Syndicate / Join The Syndicate / Become a Syndicate Member /
Buy More SYN / Verify. As of the harmonization sweep: "Become a Syndicate Member"
and "Buy More SYN" exist **nowhere** yet — they only appear once CTAs become
member-aware. The dashboard (`/my-syndicate`) canonical label is "My Syndicate".

## Why member-aware global CTAs are DEFERRED (the adapter gap)
**Rule:** do NOT wire member-aware CTAs into the global Header/MobileJoinBar/wallet
dropdown until a global-safe identity adapter exists.
**Why:** the obvious source, `useNextActionContext`, is cockpit-coupled (reads via
DEV cockpit fixture wrappers `useCockpitAccount`/HolderIndex/ArchiveBalances), so
it is not safe to drop into the global header. And making the persistent Join
button member-aware risks **flashing** the wrong CTA during `idx.isLoading` (a real
member's record is briefly undefined) — the sprint forbids flashing wrong CTAs.
**How to apply:** the next sprint should build a global identity/next-action adapter
(reusing the SHARED holder-index query — IdentityRibbon already runs it, so reading
it elsewhere adds NO new chain read), then update Header gold CTA, MobileJoinBar,
and the wallet dropdown together with a neutral loading fallback (no flash). Until
then, only label/consistency fixes are safe in these surfaces.
