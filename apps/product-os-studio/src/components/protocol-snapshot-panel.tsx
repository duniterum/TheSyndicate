// THE SYNDICATE — PRODUCT OS STUDIO · LIVE PROTOCOL SNAPSHOT PANEL
//
// A reusable panel that renders the READ-ONLY protocol snapshot (chain context + live ERC-20
// balances) through the existing StatusBadge vocabulary. Every live number carries a LIVE READ
// badge and a "read this session at <time>" line; gaps are labeled ADAPTER REQUIRED. It only
// ever triggers eth_chainId / eth_blockNumber / eth_call — no writes, no signing, no wallet.

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Radio, RefreshCw, ExternalLink, ShieldCheck } from "lucide-react";
import { useProtocolSnapshot } from "@/lib/protocol-snapshot-hooks";
import type { SnapshotGroup } from "@/lib/protocol-snapshot-types";
import { cn } from "@/lib/utils";

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString();
  } catch {
    return iso;
  }
}

export function ProtocolSnapshotPanel({
  title = "Live Protocol Snapshot",
  description,
  groups,
  showChain = true,
  showAdapterRequired = true,
  className,
}: {
  title?: string;
  description?: string;
  /** Restrict to balance groups. Pass [] for a chain-context-only panel. */
  groups?: SnapshotGroup[];
  showChain?: boolean;
  showAdapterRequired?: boolean;
  className?: string;
}) {
  const { snapshot, loading, refresh } = useProtocolSnapshot({ groups });

  const balances = (snapshot?.balances ?? []).filter((b) => !groups || groups.includes(b.group));
  const state = snapshot?.state;
  const host = snapshot?.rpcHost ?? "";
  // Only claim a LIVE READ once an actual live fact has been read this session.
  const hasLiveFacts = !!snapshot && state !== "error" && (!!snapshot.chain || balances.length > 0);
  const showEmptyBalances = (groups === undefined || groups.length > 0) && !loading && !!state && state !== "error";

  return (
    <Card className={cn("bg-white/5 border-white/10", className)} data-testid="protocol-snapshot-panel">
      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
            <Radio className="w-5 h-5 text-emerald-400" /> {title}
            {hasLiveFacts ? (
              <StatusBadge status="LIVE READ" showTooltip={false} className="scale-90 origin-left" />
            ) : state === "error" ? (
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">read unavailable</span>
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">reading…</span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={refresh}
            disabled={loading}
            data-testid="btn-refresh-snapshot"
          >
            <RefreshCw className={cn("w-3 h-3 mr-1", loading && "animate-spin")} /> {loading ? "Reading…" : "Refresh"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description ??
            "Real, read-only on-chain reads (chainId · block · balanceOf · decimals) from the public Avalanche RPC. No wallet, no writes, no signing — values are read live and never invented."}
        </p>
        <div className="text-[11px] font-mono text-muted-foreground mt-2">
          {loading && !snapshot && "Reading live from chain…"}
          {snapshot && state !== "error" && (
            <>
              Read live from {host}
              {snapshot.asOf ? ` · this session at ${formatTime(snapshot.asOf)}` : ""}
              {state === "partial" ? " · partial (some reads failed)" : ""}
            </>
          )}
          {snapshot && state === "error" && (
            <span className="text-amber-400">
              Live read unavailable right now ({host}). No value invented — try Refresh.
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {showChain && snapshot?.chain && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Fact label="Network" value={snapshot.chain.name} />
            <Fact label="Chain ID" value={`${snapshot.chain.chainId}`} warn={!snapshot.chain.isExpectedChain} />
            <Fact
              label="Block height"
              value={snapshot.chain.blockNumber !== null ? snapshot.chain.blockNumber.toLocaleString() : "—"}
            />
            <Fact label="RPC" value={host} />
          </div>
        )}

        {balances.length > 0 && (
          <div className="space-y-3">
            {balances.map((b) => (
              <div
                key={b.key}
                className="p-3 bg-background/40 rounded-lg border border-white/5 space-y-2"
                data-testid={`snapshot-${b.key}`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-sm font-medium">{b.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-primary">
                      {b.formatted} {b.token}
                    </span>
                    <StatusBadge status="LIVE READ" showTooltip={false} className="scale-90 origin-left" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{b.note}</p>
                <a
                  href={b.holderExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  title="Read-only explorer — reference only, nothing wired"
                >
                  <ExternalLink className="w-3 h-3" /> Holder on explorer
                </a>
              </div>
            ))}
          </div>
        )}

        {balances.length === 0 && showEmptyBalances && (
          <p className="text-xs text-muted-foreground">No live balances available in this view.</p>
        )}

        {loading && !snapshot && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {showAdapterRequired && snapshot && snapshot.adapterRequired.length > 0 && (
          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Not read live (by design)
              </span>
              <StatusBadge status="ADAPTER REQUIRED" showTooltip={false} className="scale-90 origin-left" />
            </div>
            <ul className="space-y-1">
              {snapshot.adapterRequired.map((f) => (
                <li key={f.key} className="text-[11px] text-muted-foreground flex gap-2">
                  <span className="text-muted-foreground/70">•</span>
                  <span>
                    <span className="text-foreground/80">{f.label}:</span> {f.reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-start gap-2 text-[10px] text-muted-foreground/80 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400/70" />
          <span>
            Read-only: this panel only ever sends eth_chainId, eth_blockNumber, and eth_call. It never signs,
            approves, switches networks, or moves funds.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function Fact({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="p-3 bg-background/40 rounded-lg border border-white/5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-sm mt-1 break-all", warn && "text-amber-400")}>{value}</div>
    </div>
  );
}
