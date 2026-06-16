// SuccessReceipt — the canonical post-action receipt shell.
//
// One shared shape for "the transaction confirmed" across every action
// (purchase, mint, and future claims). It shows the proof (tx hash + explorer
// link), what happened, the amount/token when known, and an optional next
// step. It is a presentational shell: it computes nothing on-chain and asserts
// no financial outcome — only what the receipt is handed.
//
// The existing purchase / mint surfaces keep their current success panels for
// now; this is the shared component new actions adopt and the existing ones can
// migrate to later.

import { ReactNode } from "react";

export interface SuccessReceiptProps {
  /** The confirmed transaction hash. */
  txHash: `0x${string}`;
  /** A ready-to-open explorer URL for the transaction. */
  explorerUrl: string;
  /** What happened, e.g. "Membership purchase" or "Minted The First Signal". */
  actionType: string;
  /** Optional amount string, e.g. "5.00". */
  amount?: string;
  /** Optional token symbol that pairs with `amount`, e.g. "USDC" or "SYN". */
  token?: string;
  /** Optional next recommended step. */
  nextActionLabel?: string;
  /** Route or external URL for the next step. */
  nextActionHref?: string;
  /** Optional extra detail rendered under the summary. */
  children?: ReactNode;
  className?: string;
}

const SHORT = (h: string) => (h.length > 14 ? `${h.slice(0, 8)}…${h.slice(-6)}` : h);

export function SuccessReceipt({
  txHash,
  explorerUrl,
  actionType,
  amount,
  token,
  nextActionLabel,
  nextActionHref,
  children,
  className,
}: SuccessReceiptProps) {
  const isExternalNext = !!nextActionHref && /^https?:\/\//.test(nextActionHref);
  return (
    <div
      role="status"
      className={`rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/[0.06] p-4 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-[var(--gold)]" />
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Confirmed on-chain
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-foreground">{actionType}</p>

      {amount && (
        <p className="mono mt-0.5 text-[12px] text-foreground">
          {amount}
          {token ? ` ${token}` : ""}
        </p>
      )}

      {children && <div className="mt-2">{children}</div>}

      <dl className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1">
        <dt className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          Transaction
        </dt>
        <dd className="mono text-[11px] text-foreground truncate">{SHORT(txHash)}</dd>
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mono inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/40 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-foreground hover:border-[var(--gold)]/60"
        >
          View on explorer →
        </a>
        {nextActionLabel && nextActionHref && (
          <a
            href={nextActionHref}
            {...(isExternalNext
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="mono inline-flex items-center gap-1.5 rounded-md border border-[var(--gold)]/60 bg-[var(--gold)]/10 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-foreground hover:bg-[var(--gold)]/20"
          >
            {nextActionLabel} →
          </a>
        )}
      </div>
    </div>
  );
}
