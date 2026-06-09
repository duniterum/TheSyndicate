// Compact, reusable Archive status legend.
// One source of truth for what PENDING CONTRACT / PENDING ELIGIBILITY / LOCKED / SECRET mean.
// Used on /archive, /my-syndicate, /activity, and inside SeatRecordPanel.
//
// Variants:
//   - "card"   → wrapped in a GlassCard with a header (use on standalone sections)
//   - "inline" → bare grid, no card chrome (use inside existing GlassCards)
import { Pill } from "@/components/syndicate/Primitives";
import type { ArtifactStatus } from "@/lib/archive-config";
import { ARTIFACT_STATUS_LABEL, ARTIFACT_STATUS_HINT } from "@/lib/archive-config";

const ORDER: ArtifactStatus[] = [
  "PENDING_CONTRACT",
  "PENDING_ELIGIBILITY",
  "LOCKED",
  "SECRET",
];

function tone(s: ArtifactStatus): "muted" | "warning" | "navy" {
  switch (s) {
    case "PENDING_CONTRACT":
    case "PENDING_ELIGIBILITY":
      return "warning";
    case "SECRET":
      return "navy";
    case "LOCKED":
    default:
      return "muted";
  }
}

export function ArchiveStatusLegend({
  variant = "inline",
  className = "",
}: {
  variant?: "card" | "inline";
  className?: string;
}) {
  const grid = (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {ORDER.map((s) => (
        <li
          key={s}
          className="flex items-start gap-2 border border-border/40 rounded-md px-3 py-2"
        >
          <span className="shrink-0 mt-0.5">
            <Pill tone={tone(s)}>{ARTIFACT_STATUS_LABEL[s]}</Pill>
          </span>
          <span className="text-[11px] text-muted-foreground leading-snug">
            {ARTIFACT_STATUS_HINT[s]}
          </span>
        </li>
      ))}
    </ul>
  );

  if (variant === "inline") {
    return (
      <div className={className}>
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Status legend
        </div>
        {grid}
      </div>
    );
  }

  return (
    <div
      className={`glass-card p-4 md:p-5 ${className}`}
      aria-label="Archive status legend"
    >
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)] mb-3">
        Status legend
      </div>
      {grid}
    </div>
  );
}

/** Tiny inline CTA used on /my-syndicate and /activity. */
export function ExploreArchiveCTA({
  label = "Explore the Archive",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  // Render as a styled anchor — Link is preferred elsewhere, but this avoids
  // import cycles and keeps the component framework-agnostic.
  return (
    <a
      href="/archive"
      className={`inline-flex items-center gap-2 mono text-[11px] uppercase tracking-[0.18em] text-[color:oklch(0.5_0.13_75)] hover:text-[var(--gold)] underline-offset-4 hover:underline ${className}`}
    >
      {label} →
    </a>
  );
}
