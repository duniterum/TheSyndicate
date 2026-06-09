import { type ReactNode } from "react";
import { StatusPill, type CanonicalStatus } from "./Primitives";

/**
 * Unified empty / loading / pending state primitive.
 *
 * Use anywhere a section has no data yet (awaiting first buy, indexer not
 * deployed, contract pending). Replaces ad-hoc "Scanning…" boxes site-wide
 * so PENDING surfaces look intentional, not broken.
 *
 * Variants:
 *   - default — full card (use inside Section bodies)
 *   - compact — inline panel for tables / list bodies
 */
export function EmptyState({
  status = "PENDING",
  title,
  description,
  action,
  className = "",
  variant = "default",
}: {
  status?: CanonicalStatus;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  variant?: "default" | "compact";
}) {
  if (variant === "compact") {
    return (
      <div
        className={`flex flex-col items-center text-center gap-2 py-8 px-4 ${className}`}
      >
        <StatusPill status={status} />
        <div className="mono text-[11px] uppercase tracking-[0.18em] text-foreground">
          {title}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            {description}
          </p>
        )}
        {action && <div className="mt-1">{action}</div>}
      </div>
    );
  }
  return (
    <div
      className={`surface p-6 md:p-8 flex flex-col items-start gap-3 ${className}`}
    >
      <StatusPill status={status} />
      <h3 className="text-base md:text-lg font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
