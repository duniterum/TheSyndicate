// SeatPackageCard — the shared premium "path" card used by the homepage
// Featured Paths section and the /join Seat Packages grid. Pure presentation:
// it renders ONE SeatPackage (projected 1:1 from RANKS_V2) with strong
// hierarchy — recognition meaning, who it is for, SYN at the live Genesis
// rate, and a single CTA. Recognition only; no payout, rate change, or rights.

import type { SeatPackage } from "@/lib/package-catalog";
import { CTAButton } from "./Primitives";

const fmtUsd = (n: number) => `$${n.toLocaleString("en-US")}`;
const fmtInt = (n: number) => n.toLocaleString("en-US");

export function SeatPackageCard({
  pkg,
  ctaLabel,
  ctaHref,
}: {
  pkg: SeatPackage;
  ctaLabel: string;
  ctaHref: string;
}) {
  const { rank, usdc, synAtGenesis, tagline, forWhom, recommended, highConviction } =
    pkg;

  const badge = recommended ? "Start here" : highConviction ? "High-conviction" : null;

  return (
    <div
      className={`relative flex h-full flex-col gap-3 rounded-xl border p-5 transition-colors ${
        recommended
          ? "border-[var(--gold)]/70 bg-[color:color-mix(in_oklab,var(--accent)_8%,transparent)] ring-1 ring-[var(--gold)]/40"
          : "border-border/60 bg-panel/40 hover:border-[var(--gold)]/40"
      }`}
    >
      {badge && (
        <span
          className="absolute -top-2.5 left-5 rounded-full px-2.5 py-0.5 mono text-[9px] uppercase tracking-[0.18em]"
          style={
            recommended
              ? { background: "var(--accent)", color: "var(--accent-foreground)" }
              : {
                  border: "1px solid color-mix(in oklab, var(--accent) 45%, transparent)",
                  color: "var(--accent)",
                  background: "var(--background)",
                }
          }
        >
          {badge}
        </span>
      )}

      {/* name + group */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-serif text-xl text-foreground">{rank.name}</span>
        <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground text-right">
          {rank.group}
        </span>
      </div>

      {/* price */}
      <div className="font-serif text-3xl leading-none text-gradient-gold tabular-nums">
        {fmtUsd(usdc)}
      </div>
      <div className="mono text-xs text-foreground/80 tabular-nums">
        {fmtInt(synAtGenesis)} SYN{" "}
        <span className="text-muted-foreground">at Genesis rate</span>
      </div>

      {/* recognition meaning */}
      <p className="text-sm leading-relaxed text-muted-foreground">{tagline}</p>

      {/* who it's for */}
      <div className="mt-auto border-t border-border/40 pt-3">
        <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/80">
          For
        </div>
        <p className="mt-1 text-xs leading-snug text-foreground/75">{forWhom}</p>
      </div>

      {/* CTA */}
      <CTAButton variant={recommended ? "gold" : "navy"} href={ctaHref} className="w-full">
        {ctaLabel} →
      </CTAButton>
    </div>
  );
}
