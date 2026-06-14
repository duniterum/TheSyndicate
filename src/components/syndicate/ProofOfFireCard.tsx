// Proof of Burn #001 — recognition of the first verified SYN burn.
// A manual Founder Burn: 1,000 SYN permanently sent to the standard dead
// address. Recognition only — no buyback, no automation, no price/scarcity or
// financial claim. Every fact links to its on-chain proof.

import type { ReactNode } from "react";
import {
  PROOF_OF_FIRE_001,
  SYN_BURN_ADDRESS,
  SYN_BURN_ADDRESS_LABEL,
  txExplorerUrl,
  explorerUrlForAddress,
} from "@/lib/syndicate-config";
import { useSynSupply } from "@/lib/treasury-hooks";
import { GlassCard, Section, SectionHeader, StatusPill } from "./Primitives";
import { TxProofPill } from "./TxProofDrawer";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function ProofOfFireCard() {
  const supply = useSynSupply();
  const burnedLabel =
    supply.burned !== undefined ? `${supply.burned.toLocaleString("en-US")} SYN` : "—";

  const fromHref = explorerUrlForAddress(PROOF_OF_FIRE_001.from);
  const deadHref = explorerUrlForAddress(SYN_BURN_ADDRESS);

  return (
    <Section id="proof-of-fire">
      <SectionHeader
        eyebrow="Proof of Burn"
        title={<>{PROOF_OF_FIRE_001.label} — <span className="text-gradient-gold">Founder Burn</span></>}
        description="The first verified SYN burn: 1,000 SYN permanently sent to the standard dead address — a verified supply reduction. Recognition only — no automation, no buyback, no financial claim."
      />
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <StatusPill status="LIVE" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Avalanche C-Chain · verified supply reduction
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Field label="Category">Founder Burn</Field>
          <Field label="Amount">1,000 SYN</Field>
          <Field label="From · Founder wallet">
            {fromHref ? (
              <a href={fromHref} target="_blank" rel="noopener noreferrer" className="mono hover:text-[var(--gold)]">
                {short(PROOF_OF_FIRE_001.from)} ↗
              </a>
            ) : (
              <span className="mono">{short(PROOF_OF_FIRE_001.from)}</span>
            )}
          </Field>
          <Field label={SYN_BURN_ADDRESS_LABEL}>
            {deadHref ? (
              <a href={deadHref} target="_blank" rel="noopener noreferrer" className="mono hover:text-[var(--gold)]">
                {short(SYN_BURN_ADDRESS)} ↗
              </a>
            ) : (
              <span className="mono">{short(SYN_BURN_ADDRESS)}</span>
            )}
          </Field>
          <Field label="Burned at dead address · live">
            <span className="mono">{burnedLabel}</span>
          </Field>
        </dl>

        <div className="mt-5 border-t border-border/40 pt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={txExplorerUrl(PROOF_OF_FIRE_001.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[11px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)]"
          >
            Burn transaction on Snowtrace ↗
          </a>
          <TxProofPill txHash={PROOF_OF_FIRE_001.txHash} ariaLabel="Verify Proof of Burn #001 burn transaction" />
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          SYN sent to the standard dead address cannot return to circulation. The protocol runs no
          automated burn — this was a manual, verifiable transfer.
        </p>

        {supply.burned !== undefined &&
          supply.burned > PROOF_OF_FIRE_001.amountSyn + 0.5 && (
            <div className="mt-4 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusPill status="PENDING" />
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
                  Check required · pending verification
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The live burn-address balance reads{" "}
                <span className="mono text-foreground">
                  {supply.burned.toLocaleString("en-US")} SYN
                </span>
                , above the{" "}
                <span className="mono text-foreground">
                  {PROOF_OF_FIRE_001.amountSyn.toLocaleString("en-US")} SYN
                </span>{" "}
                documented in {PROOF_OF_FIRE_001.label}. The on-chain balance is the source of
                truth — the additional{" "}
                <span className="mono text-foreground">
                  {(supply.burned - PROOF_OF_FIRE_001.amountSyn).toLocaleString("en-US")} SYN
                </span>{" "}
                is pending ledger reconciliation. No further burn event is asserted here until it is
                verified on-chain.
              </p>
            </div>
          )}
      </GlassCard>
    </Section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="text-foreground/90">{children}</dd>
    </div>
  );
}
