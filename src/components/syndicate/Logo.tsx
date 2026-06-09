// Logo system — the single source of truth for The Syndicate brand mark.
//
// Obsidian Cockpit identity: a sharp black square plate with a cyan border +
// glow and a monospace cyan "S" — the protocol's instrument badge. The wordmark
// is monochrome Space Grotesk (no gold gradient). Used by the Header, Footer,
// PageShell hero, and mobile bar so the brand reads identically everywhere.

import { Link } from "@tanstack/react-router";
import { SYNDICATE_CONFIG } from "@/lib/syndicate-config";

type MarkSize = "sm" | "md" | "lg" | "xl";

const MARK: Record<MarkSize, { box: string; text: string }> = {
  sm: { box: "size-7", text: "text-[11px]" },
  md: { box: "size-8", text: "text-sm" },
  lg: { box: "size-10", text: "text-base" },
  xl: { box: "size-12", text: "text-xl" },
};

/** The square cyan-bordered protocol plate. */
export function BrandMark({
  size = "md",
  className = "",
}: {
  size?: MarkSize;
  className?: string;
}) {
  const s = MARK[size];
  return (
    <span
      aria-hidden
      className={`relative grid place-items-center shrink-0 rounded-[3px] bg-black ${s.box} ${className}`}
      style={{
        border: "1px solid color-mix(in oklab, var(--accent) 75%, transparent)",
        boxShadow:
          "inset 0 0 12px -6px color-mix(in oklab, var(--accent) 80%, transparent), 0 0 16px -4px color-mix(in oklab, var(--accent) 65%, transparent)",
      }}
    >
      <span
        className={`mono font-bold leading-none ${s.text}`}
        style={{ color: "var(--accent)" }}
      >
        S
      </span>
    </span>
  );
}

/** Monochrome wordmark — Space Grotesk, tight tracking. */
export function Wordmark({ className = "" }: { className?: string }) {
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
  className = "",
  onClick,
}: {
  size?: MarkSize;
  withChapter?: boolean;
  showWordmark?: boolean;
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
      <BrandMark size={size} />
      {showWordmark && <Wordmark />}
      {withChapter && (
        <span className="mono ml-1 hidden md:inline rounded-[3px] border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          CH #{SYNDICATE_CONFIG.CURRENT_EPISODE}
        </span>
      )}
    </Link>
  );
}
