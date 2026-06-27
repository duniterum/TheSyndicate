// Avalanche C-Chain badge. The Studio runs against Avalanche C-Chain; this badge makes that
// context visible wherever it aids comprehension (wallet chip, wallet panel, join preview,
// registry, economy). No official Avalanche logo asset ships in this prototype, so we use a
// clean text chain badge with a generic peak glyph (NOT a trademark asset) and the Avalanche
// red accent — never a hotlinked image.

import { cn } from "@/lib/utils";
import { AVALANCHE } from "@/lib/production-constants";

const AVAX_RED = "#E84142";

function PeakGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 3 22 21H2L12 3Zm0 5.6L7.2 18h2.9l1.9-3.3L13.9 18h2.9L12 8.6Z" />
    </svg>
  );
}

export function ChainBadge({
  variant = "full",
  className,
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const label =
    variant === "full"
      ? `${AVALANCHE.name} · ${AVALANCHE.chainId} · ${AVALANCHE.nativeCurrency.symbol} gas`
      : AVALANCHE.name;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider",
        className,
      )}
      style={{ color: AVAX_RED, borderColor: `${AVAX_RED}55`, backgroundColor: `${AVAX_RED}14` }}
      title={`${AVALANCHE.name} · chain ID ${AVALANCHE.chainId} · ${AVALANCHE.nativeCurrency.symbol} for gas`}
      data-testid="chain-badge"
    >
      <PeakGlyph className="h-3 w-3" />
      <span>{label}</span>
    </span>
  );
}
