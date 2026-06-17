// SyndicateEmblem — the canonical "rounded interconnected" brand mark (Sprint 0B).
//
// Six member nodes on a hexagonal ring, each linked by a spoke to the central
// seat node: members around the seat = the Syndicate. Gold = identity (founder
// brand ruling; see docs/brand/BRAND_GUIDELINES.md).
//
// This is PREPARED for adoption, not yet wired into the live Header — nav stays
// on Logo.tsx until Sprint 1. Default tone uses the theme-aware --identity token
// (always gold in both themes, per Sprint 0A). Pass tone="brand" to pin the exact
// asset gold (#E3A92B), or tone="current" to inherit currentColor for one-color use.

type EmblemTone = "identity" | "brand" | "current" | "ivory" | "ink";

const TONE: Record<EmblemTone, string> = {
  identity: "var(--identity)",
  brand: "#E3A92B",
  current: "currentColor",
  ivory: "#F5F1E8",
  ink: "#16181C",
};

export function SyndicateEmblem({
  size = 24,
  tone = "identity",
  title,
  className = "",
}: {
  size?: number;
  tone?: EmblemTone;
  /** When set, the mark is exposed to assistive tech with this label; otherwise it is decorative. */
  title?: string;
  className?: string;
}) {
  const c = TONE[tone];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <g stroke={c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 11 L50.19 21.5 L50.19 42.5 L32 53 L13.81 42.5 L13.81 21.5 Z" />
        <path d="M32 32 L32 11 M32 32 L50.19 21.5 M32 32 L50.19 42.5 M32 32 L32 53 M32 32 L13.81 42.5 M32 32 L13.81 21.5" />
      </g>
      <g fill={c}>
        <circle cx="32" cy="11" r="3.4" />
        <circle cx="50.19" cy="21.5" r="3.4" />
        <circle cx="50.19" cy="42.5" r="3.4" />
        <circle cx="32" cy="53" r="3.4" />
        <circle cx="13.81" cy="42.5" r="3.4" />
        <circle cx="13.81" cy="21.5" r="3.4" />
        <circle cx="32" cy="32" r="5.6" />
      </g>
    </svg>
  );
}
