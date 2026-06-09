// AddToWallet — honest helper to make the minted ERC-1155 visible in a
// user's wallet. ERC-1155 NFTs do NOT auto-appear in MetaMask; the user
// must import {contract address, token id} manually on Avalanche C-Chain.
//
// This component:
//   1. Tries wallet_watchAsset (ERC1155) — supported by Rabby and some
//      MetaMask builds; many wallets reject it silently.
//   2. Always shows copyable contract address + token id as the fallback,
//      because that is the universal path. No fake "added" toast unless
//      the wallet returns success.
import { useState } from "react";
import { ARCHIVE_NFT_CONTRACT_ADDRESS } from "@/lib/syndicate-config";

type Props = { tokenId: number; tokenName?: string };

export function AddToWallet({ tokenId, tokenName = "The First Signal" }: Props) {
  const [copied, setCopied] = useState<"addr" | "id" | null>(null);
  const [watchState, setWatchState] = useState<"idle" | "pending" | "ok" | "unsupported" | "rejected">("idle");

  const copy = async (text: string, which: "addr" | "id") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1600);
    } catch {/* ignore */}
  };

  const tryWatch = async () => {
    const eth = (typeof window !== "undefined" ? (window as any).ethereum : undefined);
    if (!eth?.request) { setWatchState("unsupported"); return; }
    setWatchState("pending");
    try {
      const ok = await eth.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC1155",
          options: {
            address: ARCHIVE_NFT_CONTRACT_ADDRESS,
            tokenId: String(tokenId),
          },
        },
      });
      setWatchState(ok ? "ok" : "rejected");
    } catch (e: any) {
      // -32602 / "not supported" → wallet doesn't implement ERC1155 watch
      const msg = String(e?.message ?? "").toLowerCase();
      if (msg.includes("not supported") || msg.includes("unsupported") || e?.code === -32602) {
        setWatchState("unsupported");
      } else {
        setWatchState("rejected");
      }
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
      <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
        See it in your wallet
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        ERC-1155 NFTs don't appear automatically in MetaMask. On Avalanche
        C-Chain, import the contract + token ID below. Wallets with NFT
        auto-detection (Rainbow, Rabby) may show it within a few minutes.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={() => copy(ARCHIVE_NFT_CONTRACT_ADDRESS, "addr")}
          className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-left hover:border-[var(--gold)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 min-h-11"
        >
          <span className="mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            Contract
          </span>
          <code className="mono text-[11px] text-foreground truncate">
            {ARCHIVE_NFT_CONTRACT_ADDRESS}
          </code>
          <span className="mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
            {copied === "addr" ? "Copied" : "Copy"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => copy(String(tokenId), "id")}
          className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-left hover:border-[var(--gold)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 min-h-11"
        >
          <span className="mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            Token ID
          </span>
          <code className="mono text-[11px] text-foreground">{tokenId}</code>
          <span className="mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
            {copied === "id" ? "Copied" : "Copy"}
          </span>
        </button>

        <button
          type="button"
          onClick={tryWatch}
          disabled={watchState === "pending"}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-2 mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] hover:bg-[var(--gold)]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 disabled:opacity-60 min-h-11"
        >
          {watchState === "pending" ? "Asking wallet…" : `Try “Add ${tokenName}” to wallet`}
        </button>
      </div>

      {watchState === "ok" && (
        <p className="mt-2 mono text-[10px] uppercase tracking-[0.22em] text-emerald-600">
          Wallet confirmed
        </p>
      )}
      {watchState === "rejected" && (
        <p className="mt-2 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Wallet declined — use the copy fields above to import manually.
        </p>
      )}
      {watchState === "unsupported" && (
        <p className="mt-2 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Your wallet doesn't support ERC-1155 watch — use the copy fields above (MetaMask → NFTs → Import NFT).
        </p>
      )}
    </div>
  );
}
