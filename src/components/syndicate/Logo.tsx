// Logo system — the single source of truth for The Syndicate brand mark.
//
// Identity badge: the approved gold Interlock mark on an obsidian plate —
// the SAME artwork as the browser-tab favicon (/favicon.svg), so the Header,
// Footer, PageShell hero, and mobile bar read the same identity as the
// tab / app / social surfaces. The wordmark is monochrome Space Grotesk with a
// gold PROTOCOL sub-line. Gold = identity (color-role doctrine).

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

/** The Interlock identity badge — gold mark on an obsidian plate, the same artwork
 *  as the browser-tab favicon. `tone` is retained for API compatibility; the brand
 *  mark is always gold (Gold = identity, per the color-role doctrine). */
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
  void tone;
  return (
    <span
      aria-hidden
      className={`relative block shrink-0 rounded-[22%] ${s.box} ${className}`}
      style={{
        boxShadow: `0 0 16px -5px color-mix(in oklab, ${BRAND_GOLD} 55%, transparent)`,
      }}
    >
      <img
        src="/favicon.svg"
        alt=""
        className="block size-full rounded-[22%]"
        draggable={false}
      />
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
  markClassName = "",
  wordmarkClassName = "",
  onClick,
}: {
  size?: MarkSize;
  withChapter?: boolean;
  showWordmark?: boolean;
  tone?: MarkTone;
  withProtocolLabel?: boolean;
  className?: string;
  /** Extra classes for the mark (e.g. a responsive size bump in the header). */
  markClassName?: string;
  /** Extra classes for the "The Syndicate" wordmark line (e.g. text size). */
  wordmarkClassName?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to="/"
      aria-label="The Syndicate — home"
      className={`group inline-flex items-center gap-3 shrink-0 ${className}`}
      onClick={onClick}
    >
      <BrandMark size={size} tone={tone} className={markClassName} />
      {showWordmark && <Wordmark withLabel={withProtocolLabel} className={wordmarkClassName} />}
      {withChapter && (
        <span className="mono ml-1 hidden 2xl:inline rounded-[3px] border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          CH #{SYNDICATE_CONFIG.CURRENT_EPISODE}
        </span>
      )}
    </Link>
  );
}
