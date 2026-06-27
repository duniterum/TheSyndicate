// Wallet reality panel — the full, honest view of the REAL read-only wallet layer. Used on the
// Wallet page, Settings, Join, and My Syndicate. It is explicitly SEPARATE from the simulated
// role demo (Connected / Seated / Founder), never claims production authority, and exposes no
// transaction path — only connect / manual wrong-network guidance / live read / import /
// Studio-local forget (no network change, no permission revoke).

import {
  Wallet,
  Loader2,
  Copy,
  ExternalLink,
  LogOut,
  TriangleAlert,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, type Status } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/lib/store";
import { useStudioWallet } from "@/lib/wallet-context";
import { shortenAddress } from "@/lib/wallet-adapter";
import { explorerAddress } from "@/lib/external-links";
import { AVALANCHE, SYN_TOKEN } from "@/lib/production-constants";
import { ImportSynButton } from "./import-syn-button";
import { PostureLegend } from "@/components/posture-legend";
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

function SynBalanceRow() {
  const { snapshot, synBalance, synBalanceLoading, refreshSynBalance } = useStudioWallet();
  const { hideBalance } = useApp();

  const ready = snapshot.state === "ready";

  // Only claim "LIVE READ" once a value was actually read this session — otherwise stay honest.
  const balanceStatus: Status =
    synBalance.state === "live"
      ? "LIVE READ"
      : synBalance.state === "adapter-required"
        ? "ADAPTER REQUIRED"
        : "NOT LIVE";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">SYN balance</span>
          <StatusBadge status={balanceStatus} />
        </div>
        {ready && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refreshSynBalance()}
            disabled={synBalanceLoading}
            data-testid="syn-balance-refresh"
          >
            {synBalanceLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {synBalance.state === "idle" ? "Read live" : "Refresh"}
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border/60 bg-card/40 p-3 font-mono text-sm" data-testid="syn-balance-value">
        {!ready && <span className="text-muted-foreground">Connect on Avalanche to read your live balance.</span>}
        {ready && synBalance.state === "idle" && (
          <span className="text-muted-foreground">Not read yet — press “Read live”.</span>
        )}
        {ready && synBalance.state === "loading" && (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading from your provider…
          </span>
        )}
        {ready && synBalance.state === "live" && synBalance.data && (
          <span className="text-foreground">
            {hideBalance ? "••••••" : `${synBalance.data.formatted} ${synBalance.data.symbol}`}
            <span className="ml-2 text-[10px] uppercase tracking-wider text-emerald-500/80">live · {synBalance.asOf}</span>
          </span>
        )}
        {ready && synBalance.state === "wrongNetwork" && (
          <span className="text-amber-400">Switch to Avalanche C-Chain to read SYN.</span>
        )}
        {ready && synBalance.state === "adapter-required" && (
          <span className="text-muted-foreground">{synBalance.error ?? "Could not read SYN decimals on-chain."}</span>
        )}
        {ready && synBalance.state === "error" && (
          <span className="text-red-400">{synBalance.error ?? "Failed to read SYN balance."}</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Read-only via <code className="font-mono">eth_call balanceOf</code> on your own provider — no writes, no
        transactions. SYN is the accounting unit, never a financial right or price promise.
      </p>
    </div>
  );
}

export function WalletStatePanel({ className }: { className?: string }) {
  const {
    snapshot,
    isDetected,
    connecting,
    forgetting,
    error,
    clearError,
    connect,
    forget,
  } = useStudioWallet();
  const { maskAddress } = useApp();
  const { toast } = useToast();

  const address = snapshot.address ?? "";

  const onCopy = async () => {
    const ok = await copyText(address);
    toast(
      ok
        ? { title: "Address copied", description: "Read-only — copying your address wires nothing." }
        : { title: "Could not copy", description: "Clipboard was unavailable.", variant: "destructive" },
    );
  };

  return (
    <Card className={cn("border-border/60", className)} data-testid="wallet-state-panel">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" /> Wallet reality layer
            </CardTitle>
            <CardDescription>
              Your real wallet, read-only. Separate from the simulated role demo — and never production authority.
            </CardDescription>
          </div>
          <StatusBadge status="NOT PRODUCTION AUTH" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div
            className="flex items-start justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300"
            data-testid="wallet-error"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
            </span>
            <button onClick={clearError} className="text-xs underline text-red-300/80 hover:text-red-200">
              Dismiss
            </button>
          </div>
        )}

        {(!isDetected || snapshot.state === "unsupported") && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 text-foreground">
              <TriangleAlert className="h-4 w-4 text-amber-400" /> No wallet detected
            </p>
            <p>
              Install an EIP-1193 wallet (e.g. a browser extension) to use the read-only reality layer. The Studio
              never asks for funds and has no transaction path.
            </p>
          </div>
        )}

        {snapshot.state === "disconnected" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              A wallet is detected but not connected. Connecting uses <code className="font-mono">eth_requestAccounts</code>{" "}
              and only reads your address — it moves nothing.
            </p>
            <Button onClick={() => void connect()} disabled={connecting} data-testid="wallet-connect">
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              Connect wallet
            </Button>
          </div>
        )}

        {(snapshot.state === "wrongNetwork" || snapshot.state === "ready") && (
          <div className="space-y-4">
            {/* Address */}
            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Address</span>
              <div className="flex flex-wrap items-center gap-2">
                <code className="font-mono text-sm break-all" title={address}>
                  {maskAddress ? "0x••••••••••••••••" : address}
                </code>
                <Button variant="outline" size="sm" onClick={() => void onCopy()} data-testid="wallet-copy">
                  <Copy className="h-4 w-4" /> Copy
                </Button>
                <a
                  href={explorerAddress(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border/50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-border"
                  data-testid="wallet-explorer"
                >
                  <ExternalLink className="h-3 w-3" /> Snowtrace
                </a>
              </div>
              {!maskAddress && <p className="font-mono text-[11px] text-muted-foreground">{shortenAddress(address)}</p>}
            </div>

            {/* Network */}
            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Network</span>
              {snapshot.state === "ready" ? (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> {AVALANCHE.name} ({AVALANCHE.chainId})
                  </p>
                  <ChainBadge />
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3" data-testid="wallet-wrong-network">
                  <p className="flex flex-wrap items-center gap-2 text-sm text-amber-300">
                    <TriangleAlert className="h-4 w-4 shrink-0" /> Wrong network detected
                    {snapshot.chainId ? (
                      <span className="font-mono text-xs text-amber-400/80">on chain {snapshot.chainId}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The Syndicate runs on {AVALANCHE.name} (chain ID {AVALANCHE.chainId};{" "}
                    {AVALANCHE.nativeCurrency.symbol} is used for gas). Switch to {AVALANCHE.name}{" "}
                    <span className="text-foreground">manually in your wallet</span>. This Studio preview does not request
                    network changes.
                  </p>
                  <ChainBadge />
                </div>
              )}
            </div>

            <Separator />

            {/* Live SYN balance */}
            <SynBalanceRow />

            <Separator />

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <ImportSynButton />
              <a
                href={SYN_TOKEN.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-border/50 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border"
                data-testid="syn-token-explorer"
              >
                <ExternalLink className="h-3.5 w-3.5" /> SYN on Snowtrace
              </a>
              <Button variant="ghost" size="sm" onClick={() => void forget()} disabled={forgetting} className="text-red-400 hover:text-red-300" data-testid="wallet-forget">
                {forgetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Forget in Studio
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              “Forget in Studio” clears this prototype’s local wallet state. It does not revoke permissions in your
              wallet, and it is not a production session — your wallet still controls its own connection.
            </p>
          </div>
        )}

        <Separator />
        <PostureLegend
          compact
          postures={["LIVE_READ", "READ_ONLY_PROOF"]}
          className="pt-1"
        />
      </CardContent>
    </Card>
  );
}
