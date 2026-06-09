import type { ReactNode } from "react";
import { StatusPill } from "./Primitives";

/**
 * PendingModuleNotice — single consistent pattern for surfacing planned-but-not-live
 * protocol modules (NFT, AI, Governance, Marketplace, Programmatic Vault).
 *
 * Goal: confidence, not fear. Premium, elegant, informative.
 * No alarm banners, no scary warnings, no repetition.
 *
 * Usage:
 *   <PendingModuleNotice
 *     module="Genesis NFTs"
 *     subtitle="Planned protocol module. Not live today."
 *     secondary="Not included in live metrics or protocol totals."
 *   />
 */
export function PendingModuleNotice({
  module,
  subtitle = "Planned protocol module. Not live today.",
  secondary = "Not included in live metrics or protocol totals.",
  children,
}: {
  module: string;
  subtitle?: string;
  secondary?: string;
  children?: ReactNode;
}) {
  return (
    <aside
      aria-label={`${module} status`}
      className="rounded-lg border border-amber-500/25 bg-amber-500/[0.04] p-4 md:p-5 flex flex-col gap-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status="PENDING" />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {module}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground leading-snug">{subtitle}</p>
      {secondary && (
        <p className="text-xs text-muted-foreground leading-relaxed">{secondary}</p>
      )}
      {children}
    </aside>
  );
}
