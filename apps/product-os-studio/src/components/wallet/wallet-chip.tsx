// Header wallet chip — the REAL, read-only wallet at a glance. Compact, honest, and fully
// separate from the simulated role demo. No transaction path and no network changes; every
// action is read-only or environment-only (connect / copy / explorer / forget). Wrong-network
// is surfaced as MANUAL guidance — the Studio never requests a wallet network switch.

import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/lib/store";
import { useStudioWallet } from "@/lib/wallet-context";
import { shortenAddress } from "@/lib/wallet-adapter";
import { explorerAddress } from "@/lib/external-links";
import { AVALANCHE } from "@/lib/production-constants";
import { ChainBadge } from "@/components/chain-badge";
import { cn } from "@/lib/utils";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function WalletChip({ className }: { className?: string }) {
  const { snapshot, isDetected, connecting, connect, forget, forgetting } = useStudioWallet();
  const { maskAddress } = useApp();
  const { toast } = useToast();

  if (!isDetected || snapshot.state === "unsupported") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-border/50 px-2.5 py-1.5 text-xs text-muted-foreground",
                className,
              )}
              data-testid="wallet-chip-unsupported"
            >
              <Wallet className="h-3.5 w-3.5" /> No wallet
            </span>
          </TooltipTrigger>
          <TooltipContent>No EIP-1193 wallet detected in this browser.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (snapshot.state === "disconnected") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={className}
        onClick={() => void connect()}
        disabled={connecting}
        data-testid="wallet-chip-connect"
      >
        {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        Connect wallet
      </Button>
    );
  }

  const address = snapshot.address ?? "";
  const display = maskAddress ? "0x•••••••" : shortenAddress(address);

  const onCopy = async () => {
    const ok = await copyText(address);
    toast(
      ok
        ? { title: "Address copied", description: "Your wallet address was copied. Read-only — nothing was wired." }
        : { title: "Could not copy", description: "Clipboard was unavailable.", variant: "destructive" },
    );
  };

  const wrongNetwork = snapshot.state === "wrongNetwork";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-mono text-foreground",
            wrongNetwork
              ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
              : "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50",
            className,
          )}
          data-testid={wrongNetwork ? "wallet-chip-wrong-network" : "wallet-chip-ready"}
        >
          {wrongNetwork ? (
            <TriangleAlert className="h-3.5 w-3.5 text-amber-400" aria-hidden />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
          )}
          {display}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="space-y-1.5">
          <span className="block text-xs font-medium">Real wallet · read-only</span>
          <span className="block font-mono text-[11px] text-muted-foreground break-all">
            {maskAddress ? "Address hidden (privacy on)" : address}
          </span>
          <ChainBadge className="mt-1" />
          {wrongNetwork ? (
            <span className="block text-[11px] font-normal leading-relaxed text-amber-400/90">
              Connected, but not on {AVALANCHE.name}
              {snapshot.chainId ? ` (on chain ${snapshot.chainId})` : ""}. Switch to {AVALANCHE.name}{" "}
              <span className="text-foreground">manually in your wallet</span> to read live. This Studio does not request
              network changes.
            </span>
          ) : (
            <span className="block text-[10px] uppercase tracking-wider text-emerald-500/80">Not production auth</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void onCopy()} data-testid="wallet-chip-copy">
          <Copy className="h-4 w-4" /> Copy address
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={explorerAddress(address)} target="_blank" rel="noopener noreferrer" data-testid="wallet-chip-explorer">
            <ExternalLink className="h-4 w-4" /> View on Snowtrace
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void forget()}
          disabled={forgetting}
          className="text-red-400 focus:text-red-400"
          data-testid="wallet-chip-forget"
        >
          {forgetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Forget in Studio
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
