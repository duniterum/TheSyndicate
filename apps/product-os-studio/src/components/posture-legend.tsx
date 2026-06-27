// Posture legend — renders the data-posture taxonomy THROUGH StatusBadge so every
// surface explains, in one place, what "LIVE READ / READ-ONLY PRODUCTION PROOF /
// ADAPTER REQUIRED / ..." mean. Visual only; no data, no wiring.

import { StatusBadge } from "@/components/ui/status-badge";
import {
  POSTURE_GROUPS,
  POSTURE_META,
  posturesInGroup,
  type DataPosture,
} from "@/lib/data-posture";
import { cn } from "@/lib/utils";

interface PostureLegendProps {
  /** Restrict the legend to a subset of postures (in taxonomy order). */
  postures?: DataPosture[];
  /** Single-line dense rows instead of grouped sections. */
  compact?: boolean;
  className?: string;
}

export function PostureLegend({ postures, compact = false, className }: PostureLegendProps) {
  const allow = postures ? new Set(postures) : null;

  if (compact) {
    const rows = (Object.values(POSTURE_META)).filter((m) => !allow || allow.has(m.posture));
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {rows.map((m) => (
          <div key={m.posture} className="flex items-start gap-3">
            <StatusBadge status={m.status} showTooltip={false} className="mt-0.5 shrink-0" />
            <span className="text-xs text-muted-foreground leading-relaxed">{m.short}</span>
          </div>
        ))}
      </div>
    );
  }

  const groups = POSTURE_GROUPS.map((g) => ({
    group: g,
    items: posturesInGroup(g.id).filter((m) => !allow || allow.has(m.posture)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2", className)}>
      {groups.map(({ group, items }) => (
        <div key={group.id} className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">{group.label}</h4>
            <p className="text-xs text-muted-foreground">{group.description}</p>
          </div>
          <ul className="space-y-2">
            {items.map((m) => (
              <li key={m.posture} className="flex items-start gap-3">
                <StatusBadge status={m.status} showTooltip={false} className="mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">{m.short}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
