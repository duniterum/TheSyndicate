import { CheckCircle2, Clock3, PauseCircle, ShieldCheck } from "lucide-react";

import {
  FIRST_SOURCE_ATTRIBUTION_LIFECYCLE,
  type ProtocolLifecycleStageStatus,
} from "@/lib/protocol-lifecycle";
import { txExplorerUrl } from "@/lib/syndicate-config";

import { Panel, Pill, ProofButton } from "./Primitives";

const STAGE_TONE: Record<ProtocolLifecycleStageStatus, "success" | "warning" | "navy"> = {
  COMPLETE: "success",
  SAFE_STATE: "warning",
  FUTURE_DECISION: "navy",
};

const STAGE_LABEL: Record<ProtocolLifecycleStageStatus, string> = {
  COMPLETE: "Complete",
  SAFE_STATE: "Safe state",
  FUTURE_DECISION: "Future decision",
};

function StageIcon({ status }: { status: ProtocolLifecycleStageStatus }) {
  const className = "h-4 w-4 shrink-0";
  if (status === "SAFE_STATE") return <PauseCircle className={className} aria-hidden="true" />;
  if (status === "FUTURE_DECISION") return <Clock3 className={className} aria-hidden="true" />;
  return <CheckCircle2 className={className} aria-hidden="true" />;
}

function LifecycleMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[6px] border border-border/55 bg-background/40 p-3">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
      <p className="mt-1 text-xs leading-relaxed text-foreground/68">{note}</p>
    </div>
  );
}

export function ProtocolLifecycleProofPanel() {
  const lifecycle = FIRST_SOURCE_ATTRIBUTION_LIFECYCLE;

  return (
    <Panel
      variant="surface"
      glow="verify"
      padding="md"
      header={{
        eyebrow: "Institutional lifecycle proof",
        title: lifecycle.title,
        aside: <Pill tone="success">Proven internal</Pill>,
      }}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <p className="text-lg leading-relaxed text-foreground/88">{lifecycle.summary}</p>
          <p className="mt-4 text-sm leading-relaxed text-foreground/72">
            {lifecycle.institutionalMeaning}
          </p>
          <div className="mt-5 rounded-[6px] border border-amber-500/25 bg-amber-500/[0.06] p-4">
            <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Current safe state
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/78">{lifecycle.currentSafeState}</p>
          </div>
        </div>

        <div className="grid gap-2">
          {lifecycle.metrics.map((metric) => (
            <LifecycleMetric key={metric.label} {...metric} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {lifecycle.stages.map((stage, index) => (
          <div
            key={stage.label}
            className="grid gap-3 rounded-[6px] border border-border/55 bg-background/35 p-3 md:grid-cols-[44px_minmax(0,1fr)_auto] md:items-start"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/70">
              <span className="mono text-xs text-muted-foreground">{index + 1}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <StageIcon status={stage.status} />
                  {stage.label}
                </span>
                <Pill tone={STAGE_TONE[stage.status]}>{STAGE_LABEL[stage.status]}</Pill>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/72">{stage.proof}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Actor: {stage.actor}</p>
            </div>
            {stage.txHash ? (
              <div className="flex flex-wrap gap-2 md:justify-end">
                <ProofButton href={txExplorerUrl(stage.txHash)}>Tx</ProofButton>
                {stage.block && <Pill tone="muted">Block {stage.block}</Pill>}
              </div>
            ) : (
              <Pill tone="muted">No wallet action here</Pill>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[6px] border border-border/55 bg-background/35 p-4">
          <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
            Boundaries still active
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/75">
            {lifecycle.boundaryFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[6px] border border-border/55 bg-background/35 p-4">
          <div className="mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Questions unlocked
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/75">
            {lifecycle.nextQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}
