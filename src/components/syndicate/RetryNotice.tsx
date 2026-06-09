// Reusable empty/error/retry footer for live data surfaces.
// Honest text + a single action — no hidden errors, no stuck spinners.
import { useState } from "react";

export function RetryNotice({
  message,
  onRetry,
  detail,
}: {
  message: string;
  onRetry: () => void | Promise<void>;
  detail?: string;
}) {
  const [pending, setPending] = useState(false);
  return (
    <div className="px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-[11px] mono uppercase tracking-[0.18em] text-muted-foreground">
      <div className="flex flex-col gap-0.5">
        <span>{message}</span>
        {detail && <span className="normal-case tracking-normal text-[10px] text-muted-foreground/70">{detail}</span>}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          try {
            setPending(true);
            await onRetry();
          } finally {
            setPending(false);
          }
        }}
        className="rounded-md border border-border/60 px-3 py-1.5 hover:border-[var(--gold)]/50 hover:text-foreground disabled:opacity-50"
      >
        {pending ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}

export function RowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border/30">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="px-4 py-3 grid grid-cols-12 gap-3 items-center">
          <div className="col-span-4 h-3 rounded bg-foreground/[0.06] animate-pulse" />
          <div className="col-span-2 h-3 rounded bg-foreground/[0.06] animate-pulse" />
          <div className="col-span-3 h-3 rounded bg-foreground/[0.06] animate-pulse" />
          <div className="col-span-2 h-3 rounded bg-foreground/[0.06] animate-pulse" />
          <div className="col-span-1 h-3 rounded bg-foreground/[0.06] animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

export function TileSkeleton() {
  return (
    <div className="surface elevated p-3 h-full flex flex-col gap-2">
      <div className="h-2.5 w-16 rounded bg-foreground/[0.06] animate-pulse" />
      <div className="h-5 w-24 rounded bg-foreground/[0.06] animate-pulse mt-1" />
      <div className="h-2 w-20 rounded bg-foreground/[0.05] animate-pulse" />
    </div>
  );
}
