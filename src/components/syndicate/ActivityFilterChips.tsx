// Filter chips for /activity. Pure presentational — state is owned by the
// parent route. Uses the canonical filter list from src/lib/activity-filters.

import { ACTIVITY_FILTER_GROUPS, type ActivityFilterKey } from "@/lib/activity-filters";

export function ActivityFilterChips({
  value,
  onChange,
  counts,
  className = "",
}: {
  value: ActivityFilterKey;
  onChange: (next: ActivityFilterKey) => void;
  counts?: Partial<Record<ActivityFilterKey, number>>;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} role="tablist" aria-label="Activity filters">
      {ACTIVITY_FILTER_GROUPS.map((g) => {
        const active = g.key === value;
        const count = counts?.[g.key];
        return (
          <button
            key={g.key}
            type="button"
            role="tab"
            aria-selected={active}
            title={g.description}
            onClick={() => onChange(g.key)}
            className={`mono inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition-colors ${
              active
                ? "border-[var(--gold)]/60 bg-[var(--gold)]/10 text-foreground"
                : "border-border/60 text-muted-foreground hover:border-[var(--gold)]/40 hover:text-foreground"
            }`}
          >
            <span>{g.label}</span>
            {typeof count === "number" && (
              <span className={`tabular-nums text-[10px] rounded-sm px-1 ${active ? "text-[var(--gold)]" : "text-muted-foreground/80"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
