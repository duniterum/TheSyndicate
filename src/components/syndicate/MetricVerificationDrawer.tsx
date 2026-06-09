// Verification drawer for a single heartbeat metric.
//
// Opens when a user clicks a Live Pulse cell. The drawer answers the core
// Syndicate promise — "verify everything" — with: description, hook, source,
// refresh cadence, status pill, and direct explorer links.
//
// Wave addendum:
//   • Every drawer exposes a copyable Proof ID (the hook string, which is
//     the canonical reference used in audits and the Data Verification
//     Registry).
//   • Every drawer exposes a Share Link that deep-links back to this
//     metric (?verify=<metricKey>) so the same proof can be sent to anyone.
//
// Data comes from src/lib/data-verification-registry.ts. Do NOT invent
// sources inline — every metric must be registered there first.

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusPill } from "./Primitives";
import {
  getMetricVerification,
  type MetricVerification,
} from "@/lib/data-verification-registry";

type Props = {
  metricKey: string | null;
  onClose: () => void;
  /** Current displayed value, for context inside the drawer. */
  currentValue?: string;
  /** Optional hint shown under the value. */
  currentHint?: string;
};

export function MetricVerificationDrawer({
  metricKey,
  onClose,
  currentValue,
  currentHint,
}: Props) {
  const open = Boolean(metricKey);
  const entry: MetricVerification | undefined = metricKey
    ? getMetricVerification(metricKey)
    : undefined;

  useEffect(() => {
    if (metricKey && !entry) {
      // eslint-disable-next-line no-console
      console.warn(
        `[MetricVerificationDrawer] No registry entry for "${metricKey}". Add it to src/lib/data-verification-registry.ts.`,
      );
    }
  }, [metricKey, entry]);

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="max-w-lg">
        {entry ? (
          <>
            <DialogHeader>
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 inline-flex items-center gap-2">
                <StatusPill status={entry.status} />
                <span>{entry.label}</span>
              </div>
              <DialogTitle className="text-xl">Verify · {entry.label}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {entry.description}
              </DialogDescription>
            </DialogHeader>

            {currentValue && (
              <div className="surface elevated p-3 mt-1">
                <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  Currently rendered
                </div>
                <div className="mono text-2xl font-semibold mt-1">{currentValue}</div>
                {currentHint && (
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {currentHint}
                  </div>
                )}
              </div>
            )}

            <dl className="space-y-3 text-sm">
              <Row label="Hook" value={<code className="mono text-xs">{entry.hook}</code>} />
              <Row label="Source" value={entry.source} />
              <Row label="Refresh" value={entry.refresh} />
              {entry.emptyState && (
                <Row label="Empty / loading state" value={entry.emptyState} />
              )}
            </dl>

            <ShareActions metricKey={metricKey!} proofId={entry.hook} />

            {entry.links.length > 0 && (
              <div>
                <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Verify on-chain
                </div>
                <ul className="flex flex-wrap gap-2">
                  {entry.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono text-[11px] uppercase tracking-[0.16em] rounded-full border border-border/60 px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50 inline-flex items-center gap-1"
                      >
                        {l.label} <span aria-hidden>↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground border-l-2 border-border/60 pl-3 mt-2">
              Every number in The Syndicate has a source. If anything ever looks wrong,
              compare what you see here with the linked on-chain source.
            </p>
          </>
        ) : (
          <DialogHeader>
            <DialogTitle>Verification unavailable</DialogTitle>
            <DialogDescription>
              This metric has not been registered in the data verification registry yet.
            </DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ShareActions({ metricKey, proofId }: { metricKey: string; proofId: string }) {
  const [copied, setCopied] = useState<"id" | "link" | null>(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(metricKey)}`
      : `/?verify=${encodeURIComponent(metricKey)}`;

  const copy = async (kind: "id" | "link", text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // fail silent — UI shows no confirmation
    }
  };

  return (
    <div className="surface elevated p-3 space-y-2">
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        Share this proof
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => copy("id", proofId)}
          className="mono text-[11px] uppercase tracking-[0.16em] rounded-md border border-border/60 px-2.5 py-1.5 hover:border-[var(--gold)]/50 hover:text-foreground"
          aria-label="Copy proof ID"
          title={proofId}
        >
          {copied === "id" ? "✓ Copied" : "Copy proof ID"}
        </button>
        <button
          type="button"
          onClick={() => copy("link", shareUrl)}
          className="mono text-[11px] uppercase tracking-[0.16em] rounded-md border border-border/60 px-2.5 py-1.5 hover:border-[var(--gold)]/50 hover:text-foreground"
          aria-label="Copy share link"
          title={shareUrl}
        >
          {copied === "link" ? "✓ Copied" : "Copy share link"}
        </button>
      </div>
      <div className="text-[10px] text-muted-foreground break-all mono">{shareUrl}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3">
      <dt className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground pt-0.5">
        {label}
      </dt>
      <dd className="text-foreground/85 leading-snug">{value}</dd>
    </div>
  );
}
