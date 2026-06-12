// Logo system — the single source of truth for The Syndicate brand mark.
//
// Obsidian Cockpit identity: a sharp black square plate with a cyan border +
// glow and a monospace cyan "S" — the protocol's instrument badge. The wordmark
// is monochrome Space Grotesk (no gold gradient). Used by the Header, Footer,
// PageShell hero, and mobile bar so the brand reads identically everywhere.

import { Link } from "@tanstack/react-router";
import { SYNDICATE_CONFIG } from "@/lib/syndicate-config";

type MarkSize = "sm" | "md" | "lg" | "xl";
type MarkTone = "accent" | "gold";

// Header brand-gold (matches the hero / Join CTA). var(--gold) collapses to cyan
// in dark, so the gold tone is pinned explicitly — see obsidian-cockpit doctrine.
const BRAND_GOLD = "#E3A92B";

const MARK: Record<MarkSize, { box: string; text: string }> = {
  sm: { box: "size-7", text: "text-[11px]" },
  md: { box: "size-8", text: "text-sm" },
  lg: { box: "size-10", text: "text-base" },
  xl: { box: "size-12", text: "text-xl" },
};

/** The square protocol plate. Tone "accent" = cyan token (default); "gold" = brand gold. */
export function BrandMark({
  size = "md",
  tone = "accent",
  className = "",
}: {
  size?: MarkSize;
  tone?: MarkTone;
  className?: string;
}) {
  const s = MARK[size];
  const color = tone === "gold" ? BRAND_GOLD : "var(--accent)";
  return (
    <span
      aria-hidden
      className={`relative grid place-items-center shrink-0 rounded-[3px] bg-black ${s.box} ${className}`}
      style={{
        border: `1px solid color-mix(in oklab, ${color} 75%, transparent)`,
        boxShadow: `inset 0 0 12px -6px color-mix(in oklab, ${color} 80%, transparent), 0 0 16px -4px color-mix(in oklab, ${color} 65%, transparent)`,
      }}
    >
      <span
        className={`mono font-bold leading-none ${s.text}`}
        style={{ color }}
      >
        S
      </span>
    </span>
  );
}

/** Monochrome wordmark — Space Grotesk, tight tracking. `withLabel` adds the PROTOCOL sub-line. */
export function Wordmark({ className = "", withLabel = false }: { className?: string; withLabel?: boolean }) {
  if (withLabel) {
    return (
      <span className="inline-flex flex-col justify-center leading-none">
        <span className={`font-semibold tracking-tight leading-none text-foreground ${className}`}>
          The&nbsp;Syndicate
        </span>
        <span
          className="mono mt-1 text-[8px] uppercase tracking-[0.34em] leading-none"
          style={{ color: BRAND_GOLD }}
        >
          Protocol
        </span>
      </span>
    );
  }
  return (
    <span className={`font-semibold tracking-tight leading-none text-foreground ${className}`}>
      The&nbsp;Syndicate
    </span>
  );
}

/** Full lockup (mark + wordmark + optional chapter chip) wrapped as a home link. */
export function Logo({
  size = "md",
  withChapter = false,
  showWordmark = true,
  tone = "accent",
  withProtocolLabel = false,
  className = "",
  onClick,
}: {
  size?: MarkSize;
  withChapter?: boolean;
  showWordmark?: boolean;
  tone?: MarkTone;
  withProtocolLabel?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to="/"
      aria-label="The Syndicate — home"
      className={`group inline-flex items-center gap-2.5 shrink-0 ${className}`}
      onClick={onClick}
    >
      <BrandMark size={size} tone={tone} />
      {showWordmark && <Wordmark withLabel={withProtocolLabel} />}
      {withChapter && (
        <span className="mono ml-1 hidden md:inline rounded-[3px] border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          CH #{SYNDICATE_CONFIG.CURRENT_EPISODE}
        </span>
      )}
    </Link>
  );
}
