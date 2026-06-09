// Wave 3A — Recency primitives.
//
// DeltaBadge: small green/neutral chip rendered under a pulse cell value,
// showing a windowed change (e.g. "+3 / 24h"). Always carries a tooltip
// disclosing window, calculation, and as-of block. Never shows fabricated
// data — caller must pass available=false when the window has no coverage.

import { CONTRACTS } from "@/lib/syndicate-config";

type DeltaBadgeProps = {
  value: number | undefined;
  /** "members", "USDC", "SYN" — used in tooltip text. */
  unit: string;
  /** Human label, e.g. "24h" or "7d". */
  windowLabel: string;
  /** Window length in seconds (for the tooltip math line). */
  windowSeconds: number;
  /** Source description for the tooltip, e.g. "TokensPurchased events". */
  source?: string;
  asOfBlock?: bigint;
  /** Format function for the numeric value (defaults to integer w/ +). */
  format?: (n: number) => string;
  available?: boolean;
};

const defaultFmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export function DeltaBadge({
  value,
  unit,
  windowLabel,
  windowSeconds,
  source = "TokensPurchased events",
  asOfBlock,
  format = defaultFmt,
  available = true,
}: DeltaBadgeProps) {
  if (!available || value === undefined) {
    return (
      <span
        className="mono inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60"
        title="Recency window not yet covered by the on-chain index."
      >
        {windowLabel} —
      </span>
    );
  }
  const positive = value > 0;
  const zero = value === 0;
  const cls = zero
    ? "text-muted-foreground/70"
    : positive
    ? "text-[var(--positive,_#16a34a)]"
    : "text-muted-foreground";
  const tooltip = [
    `Change in ${unit} over the last ${windowLabel}.`,
    `Window: ${formatWindow(windowSeconds)}`,
    `Calculated from: ${source}`,
    asOfBlock !== undefined ? `As-of block: ${asOfBlock.toString()}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <span
      className={`mono inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] ${cls}`}
      title={tooltip}
    >
      {windowLabel} {format(value)}
    </span>
  );
}

function formatWindow(s: number) {
  if (s <= 86_400) return `${Math.round(s / 3600)}h rolling`;
  if (s <= 604_800) return `${Math.round(s / 86_400)}d rolling`;
  return `${Math.round(s / 86_400)}d rolling`;
}

export const _DELTA_SOURCES = {
  saleEvents: `TokensPurchased on ${CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS.slice(0, 10)}…`,
};
