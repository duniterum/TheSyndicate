// THE SYNDICATE — PRODUCT OS STUDIO · PROOF OF FIRE PANEL (REAL, READ-ONLY)
//
// Renders the READ-ONLY Proof of Fire read model (see burn-proof-adapter.ts). The AUTHORITATIVE
// cumulative burned total is the LIVE balanceOf of the burn sink (a sink only receives, so its
// balance is every SYN ever burned) and loads on mount. The individual burns are enumerated only on
// an explicit Scan (bounded, chunked eth_getLogs) and are PROVEN complete by reconciliation — their
// values must sum exactly to the live balance. Honest states: complete / partial / anomaly / error.
// Nothing here writes, signs, approves, switches networks, or moves funds.

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Flame,
  RefreshCw,
  ScanLine,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useBurnProof } from "@/lib/burn-proof-hooks";
import { cn } from "@/lib/utils";

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString();
  } catch {
    return iso;
  }
}

/** Display-only thousands grouping for a non-negative decimal string from formatUnits. */
function group(formatted: string | null): string {
  if (!formatted) return "—";
  const [int, frac] = formatted.split(".");
  const g = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${g}.${frac}` : g;
}

export function BurnProofPanel({ className }: { className?: string }) {
  const { model, loading, scanning, progress, scan, refresh } = useBurnProof();

  const state = model?.state;
  const host = model?.rpcHost ?? "";
  const hasLiveCumulative = !!model && state !== "error" && model.cumulativeFormatted !== null;
  const scanned = !!model && model.completeness !== "not-scanned";
  const pct =
    progress && progress.planned > 0
      ? Math.min(100, Math.round((progress.scanned / progress.planned) * 100))
      : 0;

  const headerActionLabel = scanning
    ? "Scanning…"
    : scanned
      ? "Refresh"
      : "Scan";

  return (
    <Card
      className={cn(
        "border-orange-500/20 bg-orange-500/[0.04] ring-1 ring-orange-500/10",
        className,
      )}
      data-testid="burn-proof-panel"
    >
      <CardHeader className="border-b border-orange-500/10 pb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
            <Flame className="w-5 h-5 text-orange-400" /> Proof of Fire — on-chain burns
            {hasLiveCumulative ? (
              <StatusBadge status="LIVE READ" showTooltip={false} className="scale-90 origin-left" />
            ) : state === "error" ? (
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                read unavailable
              </span>
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                reading…
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={scanned ? refresh : scan}
            disabled={loading}
            data-testid="btn-scan-burns"
          >
            {scanning ? (
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            ) : scanned ? (
              <RefreshCw className="w-3 h-3 mr-1" />
            ) : (
              <ScanLine className="w-3 h-3 mr-1" />
            )}
            {headerActionLabel}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Every SYN burn is an ERC-20 transfer to the canonical burn sink (0x…dEaD). The cumulative
          total is the live <span className="font-mono">balanceOf</span> of that sink — authoritative,
          because a sink only receives. Individual burns are enumerated read-only and proven complete
          by reconciling their sum against that live balance. No wallet, no writes, never minted.
        </p>
        <div className="text-[11px] font-mono text-muted-foreground mt-2">
          {loading && !model && "Reading live from chain…"}
          {model && state !== "error" && (
            <>
              Read live from {host}
              {model.asOf ? ` · this session at ${formatTime(model.asOf)}` : ""}
            </>
          )}
          {model && state === "error" && (
            <span className="text-amber-400">
              Live read unavailable right now ({host}). No value invented — try again.
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Authoritative cumulative burned */}
        <div className="p-4 bg-background/40 rounded-lg border border-white/5 space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Cumulative SYN burned · authoritative
            </span>
            {hasLiveCumulative && (
              <StatusBadge status="LIVE READ" showTooltip={false} className="scale-90 origin-left" />
            )}
          </div>
          <div className="font-mono text-2xl text-orange-300">
            {group(model?.cumulativeFormatted ?? null)}{" "}
            <span className="text-base text-muted-foreground">SYN</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Live <span className="font-mono">balanceOf</span> of the burn sink
            {model?.headBlock != null ? `, pinned at block ${model.headBlock.toLocaleString()}` : ""}. A
            sink only receives — this is every SYN ever burned. It is DISTINCT from the simulated
            ledger figures and from the static Proof of Fire #001 shown elsewhere on this page.
          </p>
          {model && (
            <a
              href={model.burnAddressExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              title="Read-only explorer — reference only, nothing wired"
            >
              <ExternalLink className="w-3 h-3" /> Burn sink on explorer
            </a>
          )}
        </div>

        {/* Chain context */}
        {model && state !== "error" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Fact label="Network" value={model.chainName} />
            <Fact
              label="Chain ID"
              value={model.chainId !== null ? `${model.chainId}` : "—"}
              warn={model.chainId !== null && !model.isExpectedChain}
            />
            <Fact
              label="Block height"
              value={model.headBlock !== null ? model.headBlock.toLocaleString() : "—"}
            />
            <Fact label="RPC" value={host} />
          </div>
        )}

        {/* Reconciliation status */}
        {model && state !== "error" && (
          <div className="rounded-lg border border-white/5 bg-background/30 p-4 space-y-3">
            {!scanned && !scanning && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ScanLine className="w-4 h-4 shrink-0 mt-0.5 text-orange-400/80" />
                  <span>
                    Enumerate the individual on-chain burns and verify they reconcile to the
                    authoritative total above. This is a bounded, read-only event scan
                    (<span className="font-mono">eth_getLogs</span>) and may take a few seconds.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                  onClick={scan}
                  disabled={loading}
                  data-testid="btn-scan-burns-cta"
                >
                  <ScanLine className="w-3.5 h-3.5 mr-1.5" /> Scan on-chain burns
                </Button>
              </div>
            )}

            {scanning && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                  <span>
                    Scanning burn events…{" "}
                    {progress ? `chunk ${progress.scanned} / ${progress.planned}` : ""}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-orange-500/60 transition-all duration-200"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}

            {scanned && !scanning && model.completeness === "complete" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm font-medium text-emerald-300">Reconciled — list complete</span>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  >
                    RECONCILED
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {model.events.length} on-chain burn{model.events.length === 1 ? "" : "s"} enumerated;
                  their values sum to{" "}
                  <span className="font-mono text-foreground/80">{group(model.eventsSumFormatted)} SYN</span>,
                  exactly matching the live burn-sink balance. Any unseen burn would raise the balance
                  above this sum, so the list is provably complete
                  {model.coverage?.earlyExitReconciled
                    ? " (verified through the last burn — no later burn is possible without changing the balance)"
                    : ""}
                  .
                </p>
              </div>
            )}

            {scanned && !scanning && model.completeness === "partial" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-sm font-medium text-amber-300">Partial — not fully reconciled</span>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] tracking-wider uppercase bg-amber-500/10 text-amber-400 border-amber-500/20"
                  >
                    PARTIAL
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Enumerated <span className="font-mono text-foreground/80">{group(model.eventsSumFormatted)}</span>{" "}
                  of <span className="font-mono text-foreground/80">{group(model.cumulativeFormatted)}</span> SYN
                  across {model.events.length} burn{model.events.length === 1 ? "" : "s"}. Some burns fall
                  outside the scanned range or a read failed
                  {model.coverage
                    ? ` (${model.coverage.chunksScanned}/${model.coverage.chunksPlanned} chunks, ${model.coverage.chunksFailed} failed${model.coverage.capHit ? ", scan cap reached" : ""})`
                    : ""}
                  . The authoritative cumulative balance above still stands — try Refresh.
                </p>
              </div>
            )}

            {scanned && !scanning && model.completeness === "anomaly" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-sm font-medium text-red-300">Anomaly — needs review</span>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] tracking-wider uppercase bg-red-500/10 text-red-400 border-red-500/20"
                  >
                    ANOMALY
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Enumerated sum (<span className="font-mono">{group(model.eventsSumFormatted)}</span> SYN)
                  exceeds the live burn-sink balance (
                  <span className="font-mono">{group(model.cumulativeFormatted)}</span> SYN). Completeness
                  is not claimed; the authoritative balance above is the source of truth.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Enumerated events */}
        {model && model.events.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Enumerated burns (oldest first)
            </div>
            {model.events.map((e) => (
              <div
                key={`${e.transactionHash}-${e.logIndex}`}
                className="p-3 bg-background/40 rounded-lg border border-white/5 space-y-1.5"
                data-testid={`burn-event-${e.proofNumber}`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{e.proofLabel}</span>
                    {e.isProofOfFire001 && (
                      <Badge
                        variant="outline"
                        className="font-mono text-[9px] tracking-wider uppercase bg-blue-500/10 text-blue-400 border-blue-500/20"
                      >
                        matches Proof of Fire #001
                      </Badge>
                    )}
                  </div>
                  <span className="font-mono text-sm text-orange-300">{group(e.formatted)} SYN</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
                  <span className="uppercase tracking-wider">block {e.blockNumber.toLocaleString()}</span>
                  <a
                    href={e.txExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="uppercase tracking-wider hover:text-foreground inline-flex items-center gap-1"
                    title="Read-only explorer — reference only, nothing wired"
                  >
                    <ExternalLink className="w-3 h-3" /> Tx
                  </a>
                  <a
                    href={e.fromExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono lowercase hover:text-foreground inline-flex items-center gap-1 break-all"
                    title="Burner wallet — read-only explorer"
                  >
                    from {e.from.slice(0, 10)}…{e.from.slice(-6)}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state — no invented numbers */}
        {state === "error" && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm font-medium text-amber-300">Live read unavailable</span>
              <StatusBadge status="ADAPTER REQUIRED" showTooltip={false} className="scale-90 origin-left" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The public RPC did not return the chain context or the authoritative burn-sink balance, so
              no Proof of Fire is shown. Nothing is invented or cached as truth.
            </p>
            {model && model.errors.length > 0 && (
              <ul className="space-y-1">
                {model.errors.slice(0, 4).map((err, i) => (
                  <li key={i} className="text-[10px] font-mono text-muted-foreground/80 break-all">
                    • {err}
                  </li>
                ))}
              </ul>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={refresh}
              disabled={loading}
              data-testid="btn-burn-retry"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", loading && "animate-spin")} /> Try again
            </Button>
          </div>
        )}

        {/* Read-only assurance */}
        <div className="flex items-start gap-2 text-[10px] text-muted-foreground/80 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-400/70" />
          <span>
            Read-only: this panel only ever sends eth_chainId, eth_blockNumber, eth_call, and
            eth_getLogs. It never signs, approves, switches networks, mints, burns, or moves funds —
            burns shown here already happened on-chain.
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
