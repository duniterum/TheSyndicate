// Preview primitives — every component here is for SIMULATED / PREVIEW data only.
// Renders an orange "SIMULATED" pill and a sticky/inline preview banner.
// CI guard: scripts/check-preview-labels.mjs ensures no LIVE pill appears in /preview/.

import type { ReactNode } from "react";
import { PREVIEW_DISCLAIMER } from "@/lib/preview/referral";

export function SimPill({ kind = "SIMULATED" }: { kind?: "SIMULATED" | "PENDING" }) {
  const styles =
    kind === "SIMULATED"
      ? "border-[color:oklch(0.78_0.14_60/0.55)] text-[color:oklch(0.5_0.18_55)] bg-[color:oklch(0.78_0.14_60/0.10)]"
      : "border-border text-muted-foreground bg-muted/30";
  return (
    <span
      data-preview="true"
      className={`mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${styles}`}
    >
      {kind === "SIMULATED" && <span className="size-1.5 rounded-full bg-[color:oklch(0.66_0.18_55)]" />}
      {kind}
    </span>
  );
}

export function PreviewBanner({
  title = "Simulated preview surface",
  sticky = false,
}: {
  title?: string;
  sticky?: boolean;
}) {
  return (
    <div
      data-preview="true"
      className={`${sticky ? "sticky top-16 z-30" : ""} border border-[color:oklch(0.78_0.14_60/0.45)] bg-[color:oklch(0.78_0.14_60/0.08)] rounded-md px-4 py-3 flex items-start gap-3`}
    >
      <SimPill />
      <div className="text-xs leading-relaxed">
        <div className="font-medium text-foreground">{title}</div>
        <div className="text-muted-foreground mt-0.5">{PREVIEW_DISCLAIMER}</div>
      </div>
    </div>
  );
}

export function PreviewCard({
  title,
  hint,
  kind = "SIMULATED",
  children,
  className = "",
}: {
  title: ReactNode;
  hint?: ReactNode;
  kind?: "SIMULATED" | "PENDING";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-preview="true"
      className={`surface elevated p-5 relative overflow-hidden ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, transparent 0 14px, color-mix(in oklab, oklch(0.78 0.14 60) 6%, transparent) 14px 15px)",
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <SimPill kind={kind} />
      </div>
      {hint && <div className="text-xs text-muted-foreground mb-3">{hint}</div>}
      {children}
    </div>
  );
}

/** Simple horizontal CSS bar chart — no external deps. */
export function BarChart({
  rows,
  unit = "",
  max,
}: {
  rows: Array<{ label: string; value: number; tone?: "gold" | "navy" | "success" | "muted" }>;
  unit?: string;
  max?: number;
}) {
  const m = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="flex flex-col gap-2" data-preview="true">
      {rows.map((r) => {
        const pct = Math.min(100, (r.value / m) * 100);
        const bg =
          r.tone === "navy"
            ? "var(--gradient-navy)"
            : r.tone === "success"
            ? "var(--success)"
            : r.tone === "muted"
            ? "color-mix(in oklab, var(--foreground) 25%, transparent)"
            : "var(--gradient-gold)";
        return (
          <div key={r.label} className="grid grid-cols-[120px,1fr,80px] items-center gap-3 text-xs">
            <span className="mono uppercase tracking-[0.14em] text-muted-foreground">{r.label}</span>
            <div className="h-2 rounded-full bg-border/50 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bg }} />
            </div>
            <span className="mono tabular-nums text-right text-foreground/85">
              {r.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              {unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Line-ish sparkline rendered as SVG. */
export function Sparkline({
  points,
  height = 80,
}: {
  points: Array<{ x: number; y: number }>;
  height?: number;
}) {
  if (points.length === 0) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = 0, maxY = Math.max(...ys);
  const W = 600, H = height, pad = 8;
  const sx = (x: number) => pad + ((x - minX) / Math.max(1, maxX - minX)) * (W - pad * 2);
  const sy = (y: number) => H - pad - ((y - minY) / Math.max(1, maxY - minY)) * (H - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const area = `${d} L${sx(maxX).toFixed(1)},${H - pad} L${sx(minX).toFixed(1)},${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" data-preview="true">
      <path d={area} fill="color-mix(in oklab, var(--gold) 14%, transparent)" />
      <path d={d} fill="none" stroke="var(--gold)" strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={2.5} fill="var(--gold)" />
      ))}
    </svg>
  );
}
