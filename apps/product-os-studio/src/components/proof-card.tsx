import { Shield } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

type Accent = "blue" | "amber" | "emerald" | "violet" | "sky" | "orange" | "neutral";

const ACCENTS: Record<Accent, { ring: string; glow: string; mark: string; bar: string }> = {
  blue: { ring: "border-blue-500/20", glow: "from-blue-500/12", mark: "text-blue-400 bg-blue-500/10 border-blue-500/20", bar: "bg-blue-500/70" },
  amber: { ring: "border-amber-500/20", glow: "from-amber-500/12", mark: "text-amber-400 bg-amber-500/10 border-amber-500/20", bar: "bg-amber-500/70" },
  emerald: { ring: "border-emerald-500/20", glow: "from-emerald-500/12", mark: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", bar: "bg-emerald-500/70" },
  violet: { ring: "border-violet-500/20", glow: "from-violet-500/12", mark: "text-violet-400 bg-violet-500/10 border-violet-500/20", bar: "bg-violet-500/70" },
  sky: { ring: "border-sky-500/20", glow: "from-sky-500/12", mark: "text-sky-400 bg-sky-500/10 border-sky-500/20", bar: "bg-sky-500/70" },
  orange: { ring: "border-orange-500/20", glow: "from-orange-500/12", mark: "text-orange-400 bg-orange-500/10 border-orange-500/20", bar: "bg-orange-500/70" },
  neutral: { ring: "border-white/10", glow: "from-white/[0.06]", mark: "text-muted-foreground bg-white/5 border-white/10", bar: "bg-white/40" },
};

export type ProofCardData = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  lines?: { label: string; value: string }[];
  accent?: Accent;
  badge?: React.ComponentProps<typeof StatusBadge>["status"];
  /** Show the canonical 70/20/10 routing bar. */
  routing?: boolean;
  /** Small footer caption, e.g. a proof reference. */
  footnote?: string;
  /** Watermark text, defaults to "simulated card". */
  watermark?: string;
};

/**
 * Premium, brand-consistent proof card used for shareable proof previews across
 * the OS (Share Center, share dialog, OG concepts). Visual only — it never
 * implies live data; callers pass labeled prototype values.
 */
export function ProofCard({
  data,
  className,
}: {
  data: ProofCardData;
  className?: string;
}) {
  const accent = ACCENTS[data.accent ?? "blue"];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/80 p-5 shadow-sm",
        accent.ring,
        className,
      )}
      data-testid="proof-card"
    >
      {/* accent glow */}
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent", accent.glow)} />
      <div className="relative space-y-4">
        {/* brand row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg border", accent.mark)}>
              <Shield className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              The Syndicate
            </span>
          </div>
          {data.badge ? (
            <StatusBadge status={data.badge} showTooltip={false} />
          ) : (
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">
              {data.watermark ?? "simulated card"}
            </span>
          )}
        </div>

        {/* title block */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
            {data.eyebrow}
          </div>
          <div className="text-lg font-bold leading-tight">{data.title}</div>
          {data.subtitle && (
            <div className="text-xs text-muted-foreground">{data.subtitle}</div>
          )}
        </div>

        {/* canonical routing bar */}
        {data.routing && (
          <div className="space-y-1.5">
            <div className="flex h-2 w-full overflow-hidden rounded-full border border-white/5 bg-background/50">
              <div className="h-full bg-amber-500/70" style={{ width: "70%" }} />
              <div className="h-full bg-sky-500/70" style={{ width: "20%" }} />
              <div className="h-full bg-emerald-500/70" style={{ width: "10%" }} />
            </div>
            <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
              <span>70 Vault</span>
              <span>20 Liquidity</span>
              <span>10 Operations</span>
            </div>
          </div>
        )}

        {/* data lines */}
        {data.lines && data.lines.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {data.lines.map((l) => (
              <div key={l.label} className="space-y-0.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  {l.label}
                </div>
                <div className="font-mono text-sm">{l.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
          <span className="truncate font-serif text-[11px] italic text-muted-foreground/70">
            recognizes capital without reducing identity to capital
          </span>
          {data.footnote && (
            <span className="shrink-0 font-mono text-[9px] text-muted-foreground/50">
              {data.footnote}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
