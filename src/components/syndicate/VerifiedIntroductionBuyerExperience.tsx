import {
  getVerifiedIntroductionBuyerScenario,
  VERIFIED_INTRODUCTION_BUYER_SKELETON_BOUNDARY,
  type VerifiedIntroductionBuyerScenarioId,
} from "../../lib/verified-introduction-v1-buyer-experience";

type VerifiedIntroductionBuyerExperienceProps = {
  scenarioId?: VerifiedIntroductionBuyerScenarioId;
  className?: string;
};

const statusTone: Record<string, string> = {
  ZERO_SOURCE_DEFAULT: "border-slate-600/70 bg-slate-950/70 text-slate-200",
  BLOCKED: "border-amber-500/50 bg-amber-950/20 text-amber-100",
  PREVIEW_ALLOWED: "border-emerald-500/50 bg-emerald-950/20 text-emerald-100",
  APPROVAL_NEEDED: "border-blue-500/50 bg-blue-950/20 text-blue-100",
  APPROVAL_COMPLETE_BUY_PENDING: "border-blue-500/50 bg-blue-950/20 text-blue-100",
  BUY_SUBMITTED_STOP: "border-red-500/50 bg-red-950/20 text-red-100",
};

export function VerifiedIntroductionBuyerExperience({
  scenarioId = "ACTIVE_TERMS_MATCH",
  className = "",
}: VerifiedIntroductionBuyerExperienceProps) {
  const scenario = getVerifiedIntroductionBuyerScenario(scenarioId);
  const preview = scenario.preview;
  const tone = statusTone[scenario.previewStatus] ?? statusTone.BLOCKED;

  return (
    <section
      aria-labelledby="verified-introduction-title"
      className={`rounded-lg border border-slate-700/80 bg-slate-950/80 p-5 text-slate-100 shadow-xl shadow-black/20 ${className}`}
      data-source-aware-public-path={String(VERIFIED_INTRODUCTION_BUYER_SKELETON_BOUNDARY.publicSourceAwareBuyPath)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Buyer Experience Skeleton
            </p>
            <h2 id="verified-introduction-title" className="mt-2 text-2xl font-semibold text-white">
              {preview.labels.buyerFacing}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              A non-activating preview for a future invite-only introduction path. It shows the buyer what would be
              attributed, what would remain unchanged, and when the safest answer is to return to ZERO_SOURCE_ID.
            </p>
          </div>
          <div className={`rounded-md border px-3 py-2 text-sm font-semibold ${tone}`}>
            {scenario.title}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Fact label="Buyer-facing label" value={preview.labels.buyerFacing} />
          <Fact label="Internal protocol label" value={preview.labels.protocol} />
          <Fact label="Accounting label" value={preview.labels.accounting} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-md border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Source Preview</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Fact label="Source label" value={preview.source.label} />
              <Fact label="Approved identity" value={preview.source.approvedIdentity} />
              <Fact label="Source class" value={preview.source.sourceClass} />
              <Fact label="Source status" value={preview.source.status} />
              <Fact label="Commission" value={`${preview.quote.commissionBps} bps`} />
              <Fact label="Gross amount" value={preview.quote.grossUsdc} />
              <Fact label="Acquisition commission" value={preview.quote.acquisitionCommissionUsdc} />
              <Fact label="Net USDC Routed" value={preview.quote.netUsdcRouted} />
            </div>
            <div className="mt-4 rounded-md border border-slate-800 bg-black/20 p-3 text-sm leading-6 text-slate-300">
              <strong className="text-slate-100">Payout posture:</strong> {preview.source.payoutPosture}
            </div>
          </div>

          <div className="rounded-md border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Operator Boundary</h3>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <p>{scenario.buyerMessage}</p>
              <p>
                <strong className="text-slate-100">Next action:</strong> {scenario.nextAction}
              </p>
              <p>
                <strong className="text-slate-100">Stop condition:</strong> {scenario.stopCondition}
              </p>
              <p>
                <strong className="text-slate-100">Required readback:</strong> {scenario.requiredReadback}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <BoundaryCard label="SourceId used if cleared" value={preview.clearSource.resultSourceId} />
          <BoundaryCard label="Signature allowed now" value={scenario.signatureAllowedNow ? "Yes" : "No"} />
          <BoundaryCard label="Public source-aware path" value="Not live" />
        </div>

        <div className="rounded-md border border-emerald-700/40 bg-emerald-950/20 p-4 text-sm leading-6 text-emerald-50">
          <h3 className="font-semibold text-emerald-100">Buyer disclosure</h3>
          <p className="mt-2">{preview.disclosure.membershipUnchanged}</p>
          <p className="mt-2">{preview.disclosure.zeroSourceDefault}</p>
          <p className="mt-2">{preview.disclosure.nonLaunchBoundary}</p>
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-slate-800 bg-black/20 p-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100">{value}</div>
    </div>
  );
}

function BoundaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/50 p-4">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 break-words text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}
