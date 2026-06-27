// Header wallet chip — the REAL, read-only wallet at a glance. Compact, honest, and fully
// separate from the simulated role demo. No transaction path; every action is read-only or
// environment-only (connect / switch / copy / explorer / forget).

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
  const { snapshot, isDetected, connecting, switching, connect, switchNetwork, forget, forgetting } =
    useStudioWallet();
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

  if (snapshot.state === "wrongNetwork") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("border-amber-500/40 text-amber-400 hover:text-amber-300", className)}
        onClick={() => void switchNetwork()}
        disabled={switching}
        title="Connected, but not on Avalanche C-Chain. Switch to read live."
        data-testid="wallet-chip-wrong-network"
      >
        {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : <TriangleAlert className="h-4 w-4" />}
        Wrong network
      </Button>
    );
  }

  // ready
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1.5 text-xs font-mono text-foreground hover:border-emerald-500/50",
            className,
          )}
          data-testid="wallet-chip-ready"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
          {display}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <span className="block text-xs font-medium">Real wallet · read-only</span>
          <span className="block font-mono text-[11px] text-muted-foreground break-all">
            {maskAddress ? "Address hidden (privacy on)" : address}
          </span>
          <span className="block text-[10px] uppercase tracking-wider text-emerald-500/80">
            Avalanche C-Chain · not production auth
          </span>
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
