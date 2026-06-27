// Reality Layer strip — the one place a visitor learns, at a glance, the three distinct
// states this Studio operates in and never mixes:
//
//   1. Demo Persona      — full product vision on SIMULATED member data (member #9, etc.).
//   2. Live Wallet Read  — real, read-only chain reads through the user's own wallet.
//   3. Adapter Required  — real data that still needs a Codex production adapter to be wired.
//
// Elegant and visual, not a warning block. Labels reuse the canonical StatusBadge taxonomy so
// they stay in lockstep with every other surface. No data, no wiring — purely explanatory.

import { Users, Wallet, Cable } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChainBadge } from "@/components/chain-badge";
import type { Status } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

interface Layer {
  index: string;
  icon: typeof Users;
  title: string;
  status: Status;
  body: string;
  accent: string;
  ring: string;
  glow: string;
  showChain?: boolean;
  footnote?: string;
}

const LAYERS: Layer[] = [
  {
    index: "01",
    icon: Users,
    title: "Demo Persona",
    status: "SIMULATED PROTOTYPE",
    body: "Shows the full product vision with simulated member data — member #9, Genesis Signal, routed USDC, receipts, and recognition.",
    accent: "text-orange-400",
    ring: "border-orange-500/25",
    glow: "bg-orange-500/[0.06]",
    footnote: "Demo persona · simulated snapshot · prototype data",
  },
  {
    index: "02",
    icon: Wallet,
    title: "Live Wallet Read",
    status: "LIVE READ",
    body: "Connect your wallet to read address, chain, SYN balance, and import SYN — read-only through your own provider.",
    accent: "text-emerald-400",
    ring: "border-emerald-500/25",
    glow: "bg-emerald-500/[0.06]",
    showChain: true,
    footnote: "No transaction · no network change requested",
  },
  {
    index: "03",
    icon: Cable,
    title: "Adapter Required",
    status: "ADAPTER REQUIRED",
    body: "Receipts, member index, activity totals, and live economy require Codex adapters before they read live.",
    accent: "text-cyan-400",
    ring: "border-cyan-500/25",
    glow: "bg-cyan-500/[0.06]",
    footnote: "Not wired · prototype fallback until bridged",
  },
];

export function RealityLayerStrip({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-3", className)} data-testid="reality-layer-strip">
      {LAYERS.map((layer) => (
        <div
          key={layer.title}
          className={cn(
            "relative flex flex-col gap-3 rounded-2xl border bg-card/30 p-5 backdrop-blur-sm transition-colors",
            layer.ring,
          )}
          data-testid={`reality-layer-${layer.index}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border",
                layer.ring,
                layer.glow,
                layer.accent,
              )}
            >
              <layer.icon className="h-5 w-5" />
            </div>
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/60">{layer.index}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold tracking-tight text-foreground">{layer.title}</h3>
            <StatusBadge status={layer.status} showTooltip={false} />
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">{layer.body}</p>

          {layer.showChain ? <ChainBadge /> : null}

          {layer.footnote ? (
            <p className="mt-auto pt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
              {layer.footnote}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
