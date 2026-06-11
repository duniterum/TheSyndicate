// Supply & burn truth — one compact line a crypto-native reads in seconds.
// Total (fixed) · Circulating · Burned (SYN at the standard dead address).
// Every segment is LIVE, read from the SYN contract, and opens the same
// MetricVerificationDrawer used by the heartbeat. No invented numbers.

import { useState } from "react";
import { StatusPill } from "./Primitives";
import { MetricVerificationDrawer } from "./MetricVerificationDrawer";
import { useSynSupply, useCirculatingSupply } from "@/lib/treasury-hooks";
import { metricLabel } from "@/lib/protocol-metrics-registry";

/** Canonical compact label for a supply segment — resolves legacy verify keys. */
const segLabel = (k: string) => metricLabel(k, true) ?? k;

const fmtSyn = (n?: number) =>
  n === undefined ? "—" : `${Math.round(n).toLocaleString("en-US")} SYN`;

type Seg = { metricKey: string; label: string; value: string; hint: string };

export function SupplyTruthLine({ className = "" }: { className?: string }) {
  const supply = useSynSupply();
  const circ = useCirculatingSupply();
  const [openKey, setOpenKey] = useState<string | null>(null);

  const segs: Seg[] = [
    {
      metricKey: "synSupply",
      label: segLabel("synSupply"),
      value: fmtSyn(supply.totalSupply),
      hint: "Fixed · no mint function",
    },
    {
      metricKey: "circulating",
      label: segLabel("circulating"),
      value: fmtSyn(circ.circulating),
      hint: "In public hands",
    },
    {
      metricKey: "synBurned",
      label: segLabel("synBurned"),
      value: fmtSyn(supply.burned),
      hint: "Held at the standard dead address",
    },
  ];

  const openSeg = segs.find((s) => s.metricKey === openKey);

  return (
    <div className={`surface elevated p-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground inline-flex items-center gap-2">
          Supply <StatusPill status="LIVE" />
        </span>
        <div className="flex flex-wrap items-center gap-y-2">
          {segs.map((s, i) => (
            <span key={s.metricKey} className="inline-flex items-center">
              {i > 0 && (
                <span aria-hidden className="mx-2 text-muted-foreground/40">
                  ·
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpenKey(s.metricKey)}
                aria-label={`Open verification for ${s.label} supply`}
                className="group inline-flex items-baseline gap-1.5 text-left transition-colors hover:text-foreground"
              >
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {s.label}
                </span>
                <span className="mono text-sm font-semibold">{s.value}</span>
                <span
                  aria-hidden
                  className="text-xs text-muted-foreground/40 group-hover:text-[var(--verify)] transition-colors"
                >
                  ⊕
                </span>
              </button>
            </span>
          ))}
        </div>
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground leading-snug">
        Fixed 1,000,000,000 SYN · no mint function · burned SYN is permanently sent to the standard dead address (no automation). Click any number to verify on-chain.
      </p>

      <MetricVerificationDrawer
        metricKey={openKey}
        onClose={() => setOpenKey(null)}
        currentValue={openSeg?.value}
        currentHint={openSeg?.hint}
      />
    </div>
  );
}
