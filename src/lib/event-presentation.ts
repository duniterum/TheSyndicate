// Shared presentation maps for canonical protocol events (display icon + short
// kind tag). Extracted so the full /activity feed (ProtocolEventsFeed) and the
// compact hero rail (HeroActivityRail) project from ONE source — no drift.
import type { ProtocolEventKind } from "@/lib/protocol-events";

export const KIND_ICON: Record<ProtocolEventKind, string> = {
  purchase: "🟢",
  "new-member": "✨",
  "rank-reached": "▲",
  "swap-buy": "↗",
  "swap-sell": "↘",
  "lp-add": "＋",
  "lp-remove": "−",
  "vault-in": "⇢",
  "vault-out": "⇠",
  "nft-mint-first-signal": "◎",
  "nft-mint-patron-seal": "◈",
  "nft-mint-other": "▣",
  "burn-founder": "🔥",
  "burn-community": "🔥",
};

export const KIND_LABEL: Record<ProtocolEventKind, string> = {
  purchase: "Membership",
  "new-member": "Archive",
  "rank-reached": "Rank",
  "swap-buy": "LP Buy",
  "swap-sell": "LP Sell",
  "lp-add": "Liquidity",
  "lp-remove": "Liquidity",
  "vault-in": "Vault",
  "vault-out": "Vault",
  "nft-mint-first-signal": "NFT Mint",
  "nft-mint-patron-seal": "NFT Mint",
  "nft-mint-other": "NFT Mint",
  "burn-founder": "Proof of Burn",
  "burn-community": "Proof of Burn",
};
