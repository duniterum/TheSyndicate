// THE SYNDICATE — PRODUCT OS STUDIO · LIVE HELD BALANCE (inline primitive)
//
// A tiny inline element that renders ONE live, read-only on-chain balance inside an existing
// product field (e.g. a routing-wallet card or a contract registry row). It is deliberately NOT a
// panel: it renders no Card, no header, and no chain / RPC / block facts — only the formatted
// value, its token, and a LIVE READ badge. The parent reads the snapshot ONCE (one grouped read
// per section) and passes the matched TokenBalanceFact down; this component just projects it.
//
// States:
//   - balance present  → "<prefix> 115.325 USDC  [LIVE READ]"
//   - loading          → "reading live…"
//   - unavailable      → "live read unavailable" (nothing is simulated — it simply could not read)

import { StatusBadge } from "@/components/ui/status-badge";
import type { TokenBalanceFact } from "@/lib/protocol-snapshot-types";
import { cn } from "@/lib/utils";

interface LiveHeldBalanceProps {
  /** The matched live balance fact, or null/undefined when not (yet) available. */
  balance?: TokenBalanceFact | null;
  /** True while the section's grouped snapshot read is in flight. */
  loading?: boolean;
  /** Small uppercase label before the value, e.g. "Current USDC held". */
  prefix?: string;
  className?: string;
}

export function LiveHeldBalance({ balance, loading, prefix, className }: LiveHeldBalanceProps) {
  if (balance) {
    return (
      <span
        className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-1", className)}
        title={balance.note}
        data-testid={`live-held-${balance.key}`}
      >
        {prefix && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{prefix}</span>
        )}
        <span className="font-mono text-sm font-semibold text-foreground">
          {balance.formatted} {balance.token}
        </span>
        <StatusBadge status="LIVE READ" showTooltip={false} />
      </span>
    );
  }
  if (loading) {
    return (
      <span className={cn("text-[10px] uppercase tracking-wider text-muted-foreground/70", className)}>
        reading live…
      </span>
    );
  }
  return (
    <span
      className={cn("text-[10px] uppercase tracking-wider text-amber-400/80", className)}
      title="The on-chain balance could not be read this session — nothing here is simulated, it simply could not be read."
    >
      live read unavailable
    </span>
  );
}
