// Reusable inline proof affordance.
//
// One chip, three proof modes — every Story So Far / Activity Heartbeat /
// Milestone Approaching surface uses the SAME chip so the verification UX
// is identical site-wide:
//
//   • tx       → opens the canonical TxProofDrawer (action, from, to,
//                block, timestamp, value, Avascan link)
//   • block    → opens an inline drawer with the block number + Avascan
//                link, no RPC fetch required
//   • document → opens an inline drawer announcing the destination, then
//                lets the user open it in a new tab (explorers/PDFs/etc.
//                routinely block iframes, so we never silently fail)
//
// All three modes render in-page (Radix Dialog) — never a bare anchor —
// so the user gets a consistent "proof drawer" experience and we can
// later swap in richer inline previews per kind without touching call
// sites.

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProofButton, StatusPill } from "./Primitives";
import { isValidTxHash, TxProofDrawer } from "./TxProofDrawer";

export type ProofKind = "tx" | "block" | "document";

export type ProofChipProps = {
  kind: ProofKind;
  /** For tx: the 0x… hash. For block: the block number (decimal). For document: the destination URL. */
  value: string;
  /** Canonical explorer / source URL to open externally. Optional for tx. */
  href?: string | null;
  label?: string;
  /** Short human description shown in the drawer. */
  description?: string;
  className?: string;
  ariaLabel?: string;
};

export function ProofChip({
  kind,
  value,
  href,
  label = "Verify",
  description,
  className = "",
  ariaLabel,
}: ProofChipProps) {
  const [open, setOpen] = useState(false);

  // Tx mode — reuse the canonical TxProofDrawer (full action decode + RPC).
  if (kind === "tx") {
    const valid = isValidTxHash(value);
    if (!valid) {
      return (
        <span
          role="status"
          aria-label="No transaction hash recorded for this event"
          title="No transaction hash recorded for this event."
          className={`mono inline-flex items-center gap-1 rounded border border-border/50 bg-background/40 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground ${className}`}
        >
          Tx not found
        </span>
      );
    }
    return (
      <>
        <ProofButton
          external={false}
          onClick={() => setOpen(true)}
          ariaLabel={ariaLabel ?? `${label} transaction ${value} — opens proof dialog`}
          className={`!px-1.5 !py-0.5 !text-[9px] ${className}`}
        >
          {label} ↗
        </ProofButton>
        {open && (
          <TxProofDrawer
            txHash={value as `0x${string}`}
            open={open}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    );
  }

  // block + document modes — small inline drawer with the deep link.
  const title = kind === "block" ? "Block proof" : "Source document";
  const heading =
    kind === "block"
      ? `Block ${value}`
      : description ?? "Open canonical source";
  const desc =
    description ??
    (kind === "block"
      ? "Block height recorded on Avalanche C-Chain. Open Avascan for the canonical record."
      : "Opens the canonical document or explorer page in a new tab.");

  return (
    <>
      <ProofButton
        external={false}
        onClick={() => setOpen(true)}
        ariaLabel={ariaLabel ?? `${label} — opens proof dialog`}
        className={`!px-1.5 !py-0.5 !text-[9px] ${className}`}
      >
        {label} ↗
      </ProofButton>
      {open && (
        <Dialog open={open} onOpenChange={(o) => (!o ? setOpen(false) : undefined)}>
          <DialogContent className="max-w-md" aria-labelledby="proof-chip-title">
            <DialogHeader>
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 inline-flex items-center gap-2">
                <StatusPill status="LIVE" />
                <span>{title}</span>
              </div>
              <DialogTitle id="proof-chip-title" className="text-xl font-serif">
                {heading}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {desc}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-3 break-all mono text-xs text-muted-foreground">
              {href ?? value}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {href && (
                <ProofButton href={href} ariaLabel="Open canonical source in a new tab">
                  Open canonical source ↗
                </ProofButton>
              )}
              <ProofButton
                external={false}
                onClick={() => {
                  try {
                    navigator.clipboard?.writeText(href ?? value);
                  } catch {}
                }}
                ariaLabel="Copy proof reference"
              >
                Copy
              </ProofButton>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
