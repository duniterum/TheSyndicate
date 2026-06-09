import { ReactNode } from "react";

export type StepStatus = "pending" | "active" | "loading" | "complete" | "error";

type Step = {
  id: number;
  label: string;
  status: StepStatus;
  href?: string | null;
  hrefLabel?: string;
  txLinks?: Array<{ label: string; href: string }>;
  meta?: string;
};

function StepDot({ status, number }: { status: StepStatus; number: number }) {
  const isComplete = status === "complete";
  const isActive = status === "active" || status === "loading";
  const isError = status === "error";

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`flex items-center justify-center size-7 rounded-full border text-[10px] font-semibold transition-all duration-300 ${
          isError
            ? "border-red-500/60 bg-red-500/10 text-red-500"
            : isComplete
            ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
            : isActive
            ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
            : "border-border bg-background/50 text-muted-foreground"
        }`}
      >
        {isComplete ? (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 8.5L7 11.5L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : isError ? (
          <span className="mono">!</span>
        ) : (
          <span className="mono">{number}</span>
        )}
      </div>
      {isActive && (
        <span className="absolute -inset-1 rounded-full border border-[var(--gold)]/30 animate-ping opacity-40" aria-hidden="true" />
      )}
    </div>
  );
}

export function MintProgressTracker({
  approveSubmitted,
  approveConfirmed,
  mintSubmitted,
  mintConfirmed,
  approveError = false,
  mintError = false,
  approveTxUrl,
  mintTxUrl,
  approveTxUrls = [],
  mintTxUrls = [],
  approveFeeAvax,
  mintFeeAvax,
  compact = false,
}: {
  approveSubmitted: boolean;
  approveConfirmed: boolean;
  mintSubmitted: boolean;
  mintConfirmed: boolean;
  approveError?: boolean;
  mintError?: boolean;
  approveTxUrl?: string | null;
  mintTxUrl?: string | null;
  approveTxUrls?: Array<{ label: string; href: string }>;
  mintTxUrls?: Array<{ label: string; href: string }>;
  /** Actual AVAX fee once the approval confirms (e.g. "0.00045 AVAX"). */
  approveFeeAvax?: string;
  /** Actual AVAX fee once the mint confirms. */
  mintFeeAvax?: string;
  compact?: boolean;
}) {
  const steps: Step[] = [
    {
      id: 1,
      label: compact ? "Approve" : "Approve USDC",
      status: approveError
        ? "error"
        : mintConfirmed || mintSubmitted || approveConfirmed
        ? "complete"
        : approveSubmitted
        ? "active"
        : "pending",
      href: approveTxUrl ?? undefined,
      hrefLabel: "View approval ↗",
      txLinks: approveTxUrls,
    },
    {
      id: 2,
      label: compact ? "Confirmed" : "Approval confirmed",
      status: approveError
        ? "error"
        : mintConfirmed || mintSubmitted || approveConfirmed
        ? "complete"
        : approveSubmitted
        ? "loading"
        : "pending",
      href: approveTxUrl ?? undefined,
      hrefLabel: "View receipt ↗",
      txLinks: approveTxUrls,
      meta: approveConfirmed && approveFeeAvax ? `fee ${approveFeeAvax}` : undefined,
    },
    {
      id: 3,
      label: compact ? "Mint" : "Mint submitted",
      status: mintError
        ? "error"
        : mintConfirmed
        ? "complete"
        : mintSubmitted
        ? "active"
        : "pending",
      href: mintTxUrl ?? undefined,
      hrefLabel: "View mint ↗",
      txLinks: mintTxUrls,
    },
    {
      id: 4,
      label: compact ? "Confirmed" : "Mint confirmed",
      status: mintError
        ? "error"
        : mintConfirmed
        ? "complete"
        : mintSubmitted
        ? "loading"
        : "pending",
      href: mintTxUrl ?? undefined,
      hrefLabel: "View receipt ↗",
      txLinks: mintTxUrls,
      meta: mintConfirmed && mintFeeAvax ? `fee ${mintFeeAvax}` : undefined,
    },
  ];

  const anyStarted = approveSubmitted || approveConfirmed || mintSubmitted || mintConfirmed;
  if (compact && !anyStarted && !approveError && !mintError) {
    return (
      <div className="flex items-center gap-2 text-[10px] mono text-muted-foreground/70">
        <span className="size-1.5 rounded-full bg-muted-foreground/30" />
        <span className="uppercase tracking-[0.18em]">Awaiting your signature</span>
      </div>
    );
  }

  const progressPct = mintConfirmed
    ? "100%"
    : mintSubmitted
    ? "75%"
    : approveConfirmed
    ? "50%"
    : approveSubmitted
    ? "25%"
    : "0%";

  return (
    <nav aria-label="Mint progress" className={compact ? "" : "py-2"}>
      <ol className="flex items-start justify-between gap-1 relative">
        <li aria-hidden="true" className="absolute top-[13px] left-[12%] right-[12%] h-[1px] -z-10">
          <div className="w-full h-full bg-border/50 relative">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: progressPct,
                background: approveError || mintError
                  ? "linear-gradient(90deg, var(--gradient-gold), oklch(0.62 0.18 25))"
                  : "var(--gradient-gold)",
              }}
            />
          </div>
        </li>

        {steps.map((step) => (
          <li key={step.id} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <StepDot status={step.status} number={step.id} />
            <span
              className={`mono text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-center leading-tight transition-colors duration-300 ${
                step.status === "error"
                  ? "text-red-500"
                  : step.status === "complete"
                  ? "text-[var(--success)]"
                  : step.status === "active" || step.status === "loading"
                  ? "text-[var(--gold)]"
                  : "text-muted-foreground/60"
              }`}
            >
              {step.label}
            </span>
            {step.meta && (
              <span className="mono text-[8px] sm:text-[9px] uppercase tracking-[0.1em] text-muted-foreground/80 text-center leading-tight">
                {step.meta}
              </span>
            )}
            {(step.status === "active" || step.status === "loading" || step.status === "complete") && (
              step.txLinks && step.txLinks.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                  {step.txLinks.map((link) => (
                    <a
                      key={`${step.id}-${link.label}`}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-muted-foreground hover:text-[var(--gold)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)]/60 rounded-sm"
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              ) : step.href ? (
                <a
                  href={step.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-muted-foreground hover:text-[var(--gold)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)]/60 rounded-sm"
                >
                  {step.hrefLabel ?? "View ↗"}
                </a>
              ) : null
            )}
            {step.status === "loading" && <span className="sr-only">In progress</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Keep a no-op export so older imports don't break if any.
export const _MintProgressTrackerStepIconUnused: ReactNode = null;
