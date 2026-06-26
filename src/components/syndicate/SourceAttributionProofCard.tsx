import { Link } from "@tanstack/react-router";
import { FileCheck2, PauseCircle, ReceiptText, ShieldCheck } from "lucide-react";

import { getCompletedInternalSourceAttributionProof } from "@/lib/source-attributed-receipts";
import { REAL_CONDITION_SOURCE_TEST_COMPLETION } from "@/lib/source-real-condition-test";
import {
  SOURCE_REGISTRY_V1_CONTRACT_ADDRESS,
  explorerUrlForAddress,
  txExplorerUrl,
} from "@/lib/syndicate-config";

import { GlassCard, Pill, ProofButton, StatusPill } from "./Primitives";

const fmtUsd = (value?: number) =>
  `$${(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 3 })}`;

const shortHex = (value: string) => `${value.slice(0, 8)}...${value.slice(-6)}`;

function ProofMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-background/50 p-3">
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 mono text-sm font-semibold text-foreground">{value}</div>
      {hint && <div className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function SourceAttributionProofCard({ compact = false }: { compact?: boolean }) {
  const proof = getCompletedInternalSourceAttributionProof();
  const completion = REAL_CONDITION_SOURCE_TEST_COMPLETION;
  const sourceRegistryAddress = SOURCE_REGISTRY_V1_CONTRACT_ADDRESS ?? completion.sourceRegistry;

  return (
    <GlassCard className="p-5 border-[var(--gold)]/25 bg-[var(--gold)]/[0.035]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status="LIVE" />
            <Pill tone="warning">SOURCE PAUSED</Pill>
            <Pill tone="muted">PUBLIC ZERO_SOURCE_ID</Pill>
          </div>
          <h3 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-foreground">
            Completed internal source-attribution proof
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            One controlled MembershipSaleV3 purchase used the internal sourceId, paid the
            5% acquisition commission, routed the net USDC through the protocol split, and
            then returned the source to PAUSED. This proves the source-attributed receipt
            path, not public referral activation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ProofButton href={txExplorerUrl(proof.txHash)}>Buy tx</ProofButton>
          <ProofButton href={txExplorerUrl(completion.transactions.rePaused.hash)}>
            Re-pause tx
          </ProofButton>
          <ProofButton href={explorerUrlForAddress(sourceRegistryAddress) ?? undefined}>
            SourceRegistry
          </ProofButton>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
        <ProofMetric label="Gross test" value={fmtUsd(proof.grossUsdc)} hint="single controlled buy" />
        <ProofMetric
          label="Acquisition"
          value={fmtUsd(proof.acquisitionCommission)}
          hint={`${proof.commissionRateLabel} source payout`}
        />
        <ProofMetric label="Net routed" value={fmtUsd(proof.netUsdcRouted)} hint="Vault / Liquidity / Ops" />
        <ProofMetric label="Escrow owed" value={fmtUsd(proof.sourceEscrowOwed)} hint="direct payout succeeded" />
        <ProofMetric label="Member" value={`#${proof.memberNumber.toString()}`} hint="source-attributed seat" />
        <ProofMetric label="Source class" value={proof.sourceClassLabel} hint={proof.attributionScopeLabel} />
        <ProofMetric label="SourceId" value={shortHex(proof.sourceId)} hint="internal protocol test source" />
        <ProofMetric
          label="Readback"
          value={`Block ${proof.latestAuthorityReadbackBlock ?? "unknown"}`}
          hint={proof.sourceStatusProof}
        />
      </div>

      {!compact && (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.06] p-3">
            <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
              <FileCheck2 className="h-4 w-4" aria-hidden="true" />
              Proven
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              The receipt, acquisition commission, routing split, and final PAUSED readback are
              recorded as current protocol truth.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.06] p-3">
            <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
              <PauseCircle className="h-4 w-4" aria-hidden="true" />
              Stopped
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Final source status is PAUSED and isActive is false. Future activation needs a
              separate founder-approved ceremony.
            </p>
          </div>
          <div className="rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] p-3">
            <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-200">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Boundaries
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Public referral remains inactive. No claim UI, source dashboard, public source
              link, or public source-aware buy path exists.
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          <span>
            Capability validated; product activation still deferred.
          </span>
        </div>
        <Link
          to="/referral"
          className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Read source boundary
        </Link>
      </div>
    </GlassCard>
  );
}
