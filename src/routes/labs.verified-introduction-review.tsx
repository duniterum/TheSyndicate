import { createFileRoute } from "@tanstack/react-router";

import { VerifiedIntroductionBuyerExperience } from "@/components/syndicate/VerifiedIntroductionBuyerExperience";
import {
  VERIFIED_INTRODUCTION_BUYER_SCENARIOS,
  VERIFIED_INTRODUCTION_BUYER_SKELETON_BOUNDARY,
  type VerifiedIntroductionBuyerScenario,
} from "@/lib/verified-introduction-v1-buyer-experience";
import {
  VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW,
  type VerifiedIntroductionAbuseState,
  type VerifiedIntroductionEligibilityRule,
} from "@/lib/verified-introduction-v1-anti-abuse";
import {
  VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW,
  type VerifiedIntroductionAccountingLabel,
  type VerifiedIntroductionDisclosureItem,
  type VerifiedIntroductionForbiddenCopyRule,
} from "@/lib/verified-introduction-v1-disclosure";
import {
  VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET,
  type VerifiedIntroductionLatestRead,
  type VerifiedIntroductionLiveQaCheck,
  type VerifiedIntroductionReleaseGate,
} from "@/lib/verified-introduction-v1-release-qa";

export const VERIFIED_INTRODUCTION_REVIEW_TOKEN = "VERIFIED_INTRODUCTION_V1";

export const Route = createFileRoute("/labs/verified-introduction-review")({
  validateSearch: (search): { review?: string } => {
    const review = (search as Record<string, unknown>).review;
    return typeof review === "string" ? { review } : {};
  },
  head: () => ({
    meta: [
      { title: "Verified Introduction Review - The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal Verified Introduction V1 review surface. Not public referral, not activation, not a source link.",
      },
    ],
  }),
  component: VerifiedIntroductionReviewRoute,
});

const BOUNDARY_ITEMS = [
  "No wallet signing.",
  "No source activation.",
  "No referral activation.",
  "No public source link.",
  "No alias route.",
  "No claim UI.",
  "No source dashboard.",
  "No public source-aware buy path.",
  "Public /join remains ZERO_SOURCE_ID.",
  "/referral remains inactive.",
] as const;

const LAUNCH_BLOCKERS = [
  "Founder-approved launch packet.",
  "Legal and accounting disclosure review.",
  "Anti-abuse and source-eligibility rules.",
  "Current-authority SourceRegistry and MembershipSaleV3 readbacks.",
  "Approved route, sitemap, robots, and noindex posture.",
  "Replit sync, publish decision, and live QA only if runtime-visible truth should ship.",
] as const;

function VerifiedIntroductionReviewRoute() {
  const { review } = Route.useSearch();
  const reviewUnlocked = review === VERIFIED_INTRODUCTION_REVIEW_TOKEN;

  if (!reviewUnlocked) {
    return <LockedReviewSurface />;
  }

  return (
    <main
      className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100"
      data-internal-review="verified-introduction-v1"
      data-public-source-aware-path={String(VERIFIED_INTRODUCTION_BUYER_SKELETON_BOUNDARY.publicSourceAwareBuyPath)}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <ReviewHeader />
        <BoundaryStrip />
        <VerifiedIntroductionBuyerExperience />
        <DisclosureReview
          accountingLabels={VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW.accountingLabels}
          disclosureItems={VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW.disclosureItems}
          forbiddenCopy={VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW.forbiddenCopy}
        />
        <ScenarioMatrix scenarios={VERIFIED_INTRODUCTION_BUYER_SCENARIOS} />
        <AntiAbuseReview
          rules={VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW.eligibilityRules}
          states={VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW.abuseStates}
        />
        <ReleaseQaReview
          reads={VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET.latestChainReads}
          gates={VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET.releaseGates}
          liveQa={VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET.liveQaChecks}
          stopConditions={VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET.stopConditions}
        />
        <LaunchBoundary />
      </div>
    </main>
  );
}

function LockedReviewSurface() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100" data-internal-review="locked">
      <section className="mx-auto max-w-3xl rounded-lg border border-amber-500/40 bg-amber-950/20 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
          Internal Review Locked
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Verified Introduction V1 is not public referral.</h1>
        <p className="mt-4 text-sm leading-6 text-amber-50/90">
          This route is a noindex internal review surface. It is not linked from public navigation, not listed in the
          sitemap, and not usable as a buy path. Use the founder-approved review token to inspect the non-activating
          buyer skeleton.
        </p>
        <div className="mt-5 rounded-md border border-slate-700 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
          <strong className="text-white">What remains true:</strong> public /join uses ZERO_SOURCE_ID, /referral
          remains inactive, no source link exists here, and no wallet action can be triggered from this surface.
        </div>
      </section>
    </main>
  );
}

function ReviewHeader() {
  return (
    <header className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
        Internal Review / Not Public Referral
      </p>
      <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_0.55fr] lg:items-end">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Verified Introduction V1 Review</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            A founder/operator surface for reviewing the non-activating buyer experience before any public launch
            packet exists. It shows what the buyer would understand, what blocks the flow, and how clearing an
            introduction returns to ZERO_SOURCE_ID.
          </p>
        </div>
        <div className="rounded-md border border-emerald-700/40 bg-emerald-950/20 p-4 text-sm leading-6 text-emerald-50">
          <div className="text-xs uppercase tracking-[0.18em] text-emerald-300">Review posture</div>
          <div className="mt-2 font-semibold">Read-only scenario review</div>
          <div>No writes. No wallet controls. No public route authority.</div>
        </div>
      </div>
    </header>
  );
}

function BoundaryStrip() {
  return (
    <section className="rounded-lg border border-red-900/60 bg-red-950/20 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Hard Boundaries</h2>
      <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-5">
        {BOUNDARY_ITEMS.map((item) => (
          <div key={item} className="rounded-md border border-red-900/50 bg-black/20 p-3 text-sm text-red-50">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function ScenarioMatrix({ scenarios }: { scenarios: readonly VerifiedIntroductionBuyerScenario[] }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Scenario Matrix</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Every buyer state fails closed before launch.</h2>
        </div>
        <div className="text-sm text-slate-400">
          {scenarios.length} states - approval is separate from purchase - clear source returns to ZERO_SOURCE_ID
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="border-b border-slate-800 py-3 pr-4">State</th>
              <th className="border-b border-slate-800 py-3 pr-4">Preview</th>
              <th className="border-b border-slate-800 py-3 pr-4">SourceId posture</th>
              <th className="border-b border-slate-800 py-3 pr-4">Buyer message</th>
              <th className="border-b border-slate-800 py-3 pr-4">Stop condition</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario) => (
              <tr key={scenario.id} className="border-b border-slate-900/80 align-top">
                <td className="py-3 pr-4">
                  <div className="font-semibold text-slate-100">{scenario.title}</div>
                  <code className="mt-1 block text-xs text-slate-500">{scenario.id}</code>
                </td>
                <td className="py-3 pr-4">
                  <StatusPill value={scenario.previewStatus} />
                  <div className="mt-2 text-xs text-slate-400">Signature allowed now: no</div>
                </td>
                <td className="py-3 pr-4">
                  <code className="text-xs text-slate-300">{scenario.sourceIdForPurchase}</code>
                  <div className="mt-2 text-xs text-slate-400">
                    {scenario.usesZeroSourceFallback ? "Falls back to ZERO_SOURCE_ID" : "Requires future launch packet"}
                  </div>
                </td>
                <td className="py-3 pr-4 text-slate-300">{scenario.buyerMessage}</td>
                <td className="py-3 pr-4 text-slate-300">{scenario.stopCondition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DisclosureReview({
  accountingLabels,
  disclosureItems,
  forbiddenCopy,
}: {
  accountingLabels: readonly VerifiedIntroductionAccountingLabel[];
  disclosureItems: readonly VerifiedIntroductionDisclosureItem[];
  forbiddenCopy: readonly VerifiedIntroductionForbiddenCopyRule[];
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Buyer Disclosure / Accounting Review
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">The buyer must understand attribution before signing.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            This draft copy model standardizes the labels and stop conditions for a future Verified Introduction
            purchase without approving public controls.
          </p>
        </div>
        <div className="rounded-md border border-cyan-600/50 bg-cyan-950/30 px-3 py-2 text-sm font-semibold text-cyan-100">
          Draft review - not legal or launch approval
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {accountingLabels.map((label) => (
          <div key={label.id} className="rounded-md border border-slate-800 bg-black/20 p-4">
            <h3 className="text-sm font-semibold text-white">{label.label}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{label.definition}</p>
            <p className="mt-3 text-xs leading-5 text-cyan-100">
              <strong>Must not mean:</strong> {label.mustNotMean}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="border-b border-slate-800 py-3 pr-4">Disclosure</th>
              <th className="border-b border-slate-800 py-3 pr-4">Buyer must understand</th>
              <th className="border-b border-slate-800 py-3 pr-4">Required copy</th>
              <th className="border-b border-slate-800 py-3 pr-4">Stop condition</th>
            </tr>
          </thead>
          <tbody>
            {disclosureItems.map((item) => (
              <tr key={item.id} className="border-b border-slate-900/80 align-top">
                <td className="py-3 pr-4">
                  <div className="font-semibold text-slate-100">{item.label}</div>
                  <StatusPill value={item.status} />
                </td>
                <td className="py-3 pr-4 text-slate-300">{item.buyerMustUnderstand}</td>
                <td className="py-3 pr-4 text-slate-300">{item.requiredCopy}</td>
                <td className="py-3 pr-4 text-slate-300">{item.stopCondition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {forbiddenCopy.map((rule) => (
          <div key={rule.id} className="rounded-md border border-red-900/60 bg-red-950/20 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-red-200">Forbidden copy</div>
            <p className="mt-2 text-sm text-red-50">{rule.forbiddenPattern}</p>
            <p className="mt-3 text-xs leading-5 text-slate-300">{rule.reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AntiAbuseReview({
  rules,
  states,
}: {
  rules: readonly VerifiedIntroductionEligibilityRule[];
  states: readonly VerifiedIntroductionAbuseState[];
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
            Source Eligibility / Anti-Abuse Review
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">The launch blocker is source quality.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            This draft model defines who can be a source, who can be a buyer, when the flow must fail closed, and
            what conduct keeps Verified Introduction from becoming referral marketing.
          </p>
        </div>
        <div className="rounded-md border border-amber-600/50 bg-amber-950/30 px-3 py-2 text-sm font-semibold text-amber-100">
          Draft review - not launch approval
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {rules.map((rule) => (
          <div key={rule.id} className="rounded-md border border-slate-800 bg-black/20 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <h3 className="text-sm font-semibold text-white">{rule.label}</h3>
              <StatusPill value={rule.status} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{rule.requirement}</p>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              <strong className="text-slate-200">Evidence:</strong> {rule.evidenceNeeded}
            </p>
            <p className="mt-2 text-xs leading-5 text-amber-100">
              <strong>Fail closed:</strong> {rule.failClosedBehavior}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="border-b border-slate-800 py-3 pr-4">Abuse state</th>
              <th className="border-b border-slate-800 py-3 pr-4">Trigger</th>
              <th className="border-b border-slate-800 py-3 pr-4">Control</th>
              <th className="border-b border-slate-800 py-3 pr-4">Operator action</th>
              <th className="border-b border-slate-800 py-3 pr-4">Buyer outcome</th>
            </tr>
          </thead>
          <tbody>
            {states.map((state) => (
              <tr key={state.id} className="border-b border-slate-900/80 align-top">
                <td className="py-3 pr-4">
                  <div className="font-semibold text-slate-100">{state.risk}</div>
                  <code className="mt-1 block text-xs text-slate-500">{state.id}</code>
                </td>
                <td className="py-3 pr-4 text-slate-300">{state.trigger}</td>
                <td className="py-3 pr-4 text-slate-300">{state.control}</td>
                <td className="py-3 pr-4 text-slate-300">{state.operatorAction}</td>
                <td className="py-3 pr-4 text-slate-300">{state.buyerOutcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReleaseQaReview({
  reads,
  gates,
  liveQa,
  stopConditions,
}: {
  reads: readonly VerifiedIntroductionLatestRead[];
  gates: readonly VerifiedIntroductionReleaseGate[];
  liveQa: readonly VerifiedIntroductionLiveQaCheck[];
  stopConditions: readonly string[];
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Current-Authority / Release QA
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Launch review must read current truth.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            This packet defines the latest-chain reads, Replit gates, live QA checks, and stop conditions for a future
            Verified Introduction launch candidate. It is not approval to publish public controls.
          </p>
        </div>
        <div className="rounded-md border border-violet-600/50 bg-violet-950/30 px-3 py-2 text-sm font-semibold text-violet-100">
          Draft QA packet - latest block only
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="border-b border-slate-800 py-3 pr-4">Read</th>
              <th className="border-b border-slate-800 py-3 pr-4">Target</th>
              <th className="border-b border-slate-800 py-3 pr-4">Expected</th>
              <th className="border-b border-slate-800 py-3 pr-4">Stop condition</th>
            </tr>
          </thead>
          <tbody>
            {reads.map((read) => (
              <tr key={read.id} className="border-b border-slate-900/80 align-top">
                <td className="py-3 pr-4">
                  <div className="font-semibold text-slate-100">{read.label}</div>
                  <div className="mt-1 text-xs text-violet-200">{read.read}</div>
                </td>
                <td className="py-3 pr-4">
                  <code className="break-all text-xs text-slate-300">{read.contractOrSurface}</code>
                </td>
                <td className="py-3 pr-4 text-slate-300">{read.expected}</td>
                <td className="py-3 pr-4 text-slate-300">{read.stopCondition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {gates.map((gate) => (
          <div key={gate.id} className="rounded-md border border-slate-800 bg-black/20 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <h3 className="text-sm font-semibold text-white">{gate.label}</h3>
              <StatusPill value={gate.status} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{gate.requirement}</p>
            <p className="mt-3 text-xs leading-5 text-violet-100">
              <strong>Stop:</strong> {gate.stopCondition}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-md border border-slate-800 bg-black/20 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Live QA checks</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {liveQa.map((check) => (
              <div key={check.id} className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
                <div className="font-semibold text-slate-100">{check.routeOrSurface}</div>
                <p className="mt-2 text-xs leading-5 text-slate-300">{check.mustConfirm}</p>
                <p className="mt-2 text-xs leading-5 text-violet-100">
                  <strong>Must not expose:</strong> {check.mustNotExpose}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-red-900/60 bg-red-950/20 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Stop conditions</h3>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-red-50">
            {stopConditions.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function LaunchBoundary() {
  return (
    <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">What This Surface Proves</p>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
          <li>The buyer can see attribution terms before any future signature.</li>
          <li>The buyer can understand that membership, price, and rights do not change.</li>
          <li>Approval is not a buy, and buy submission stops for readback.</li>
          <li>Clearing the introduction returns the purchase path to ZERO_SOURCE_ID.</li>
        </ul>
      </div>
      <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Still Blocks Launch</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {LAUNCH_BLOCKERS.map((item) => (
            <div key={item} className="rounded-md border border-amber-800/50 bg-black/20 p-3 text-sm text-amber-50">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatusPill({ value }: { value: string }) {
  const active = value === "PREVIEW_ALLOWED" || value === "SATISFIED_FOR_REVIEW";
  const pending =
    value === "APPROVAL_NEEDED" ||
    value === "APPROVAL_COMPLETE_BUY_PENDING" ||
    value.startsWith("PENDING_");
  const stop = value === "BUY_SUBMITTED_STOP";
  const tone = active
    ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-100"
    : pending
      ? "border-blue-500/50 bg-blue-950/40 text-blue-100"
      : stop
        ? "border-red-500/50 bg-red-950/40 text-red-100"
        : "border-amber-500/50 bg-amber-950/40 text-amber-100";

  return <span className={`rounded border px-2 py-1 text-xs font-semibold ${tone}`}>{value}</span>;
}
