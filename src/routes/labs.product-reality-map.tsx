import { createFileRoute } from "@tanstack/react-router";

import {
  ACTION_ABILITY_MATRIX,
  MEMBER_REALITY_ITEMS,
  PRODUCT_REALITY_BOUNDARIES,
  PRODUCT_REALITY_DECISION_OPTIONS,
  PRODUCT_REALITY_PHASES,
  PRODUCT_REALITY_PRODUCTION_DRIFT_NOTE,
  PRODUCT_REALITY_REVIEW_TOKEN,
  PRODUCT_REALITY_ROUTE_WITH_REVIEW,
  PRODUCT_REALITY_SURFACES,
  VERIFIED_INTRODUCTION_REALITY_ITEMS,
  type ProductRealityMatrixColumn,
  type ProductRealityMatrixRow,
  type ProductRealityStatus,
} from "@/lib/product-reality-map";

export const Route = createFileRoute("/labs/product-reality-map")({
  validateSearch: (search): { review?: string } => {
    const review = (search as Record<string, unknown>).review;
    return typeof review === "string" ? { review } : {};
  },
  head: () => ({
    meta: [
      { title: "MVP Reality Map - The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal MVP product reality walkthrough. Hidden, direct URL only, no wallet controls, no buy controls, no activation controls.",
      },
    ],
  }),
  component: ProductRealityMapRoute,
});

const MATRIX_COLUMNS: readonly {
  key: ProductRealityMatrixColumn;
  label: string;
}[] = [
  { key: "liveNow", label: "live now" },
  { key: "hiddenReviewOnly", label: "hidden review only" },
  { key: "verifiedIntroductionV1Candidate", label: "Verified Introduction V1 candidate" },
  { key: "v2Candidate", label: "V2 candidate" },
  { key: "futureSeatRecordErc721", label: "future SeatRecord/ERC721" },
  { key: "futureArchiveNft", label: "future Archive/NFT" },
  { key: "forbiddenNow", label: "forbidden now" },
];

function ProductRealityMapRoute() {
  const { review } = Route.useSearch();
  const reviewUnlocked = review === PRODUCT_REALITY_REVIEW_TOKEN;

  if (!reviewUnlocked) return <LockedRealityMap />;

  return (
    <main
      className="min-h-screen bg-[#0c1016] px-4 py-6 text-slate-100 sm:px-6 lg:px-8"
      data-internal-review="product-reality-map"
      data-public-join-default-source-id={PRODUCT_REALITY_BOUNDARIES.publicJoinDefaultSourceId}
      data-wallet-controls={String(PRODUCT_REALITY_BOUNDARIES.walletControls)}
      data-buy-controls={String(PRODUCT_REALITY_BOUNDARIES.buyControls)}
      data-activation-controls={String(PRODUCT_REALITY_BOUNDARIES.activationControls)}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <Hero />
        <BoundaryGrid />
        <CurrentReality />
        <MemberReality />
        <VerifiedIntroductionReality />
        <ActionAbilityMatrix />
        <PhaseSplit />
        <FounderDecisionPanel />
        <ProductionDriftNote />
      </div>
    </main>
  );
}

function LockedRealityMap() {
  return (
    <main className="min-h-screen bg-[#0c1016] px-5 py-10 text-slate-100" data-internal-review="locked">
      <section className="mx-auto max-w-3xl rounded-lg border border-amber-500/40 bg-amber-950/20 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
          Internal Reality Map Locked
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          This is a direct-URL founder walkthrough, not a public product page.
        </h1>
        <p className="mt-4 text-sm leading-6 text-amber-50/90">
          Use the review query to inspect the MVP reality map. The surface is noindex, absent from public navigation,
          absent from sitemap, and contains no wallet, buy, claim, or activation controls.
        </p>
      </section>
    </main>
  );
}

function Hero() {
  return (
    <header className="rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.45fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Founder MVP Reality Walkthrough
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            What exists, what is live, what is hidden, and what must wait.
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300 md:text-base md:leading-7">
            This internal surface turns repo truth into a product reality view. It separates live user actions from
            inactive status copy, hidden review models, V1 candidate work, V2 candidates, and later identity or
            Archive/NFT evolution.
          </p>
        </div>
        <div className="rounded-md border border-emerald-700/50 bg-emerald-950/20 p-4 text-sm leading-6 text-emerald-50">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Review URL
          </div>
          <code className="mt-2 block break-all text-xs text-emerald-100">{PRODUCT_REALITY_ROUTE_WITH_REVIEW}</code>
          <div className="mt-3 font-semibold">No launch authority. No public controls.</div>
        </div>
      </div>
    </header>
  );
}

function BoundaryGrid() {
  const items = [
    ["Hidden", PRODUCT_REALITY_BOUNDARIES.hidden],
    ["Noindex", PRODUCT_REALITY_BOUNDARIES.noindex],
    ["Nofollow", PRODUCT_REALITY_BOUNDARIES.nofollow],
    ["Direct URL only", PRODUCT_REALITY_BOUNDARIES.directUrlOnly],
    ["Absent from public nav", PRODUCT_REALITY_BOUNDARIES.absentFromPublicNavigation],
    ["Absent from sitemap", PRODUCT_REALITY_BOUNDARIES.absentFromSitemap],
    ["Wallet controls", PRODUCT_REALITY_BOUNDARIES.walletControls],
    ["Buy controls", PRODUCT_REALITY_BOUNDARIES.buyControls],
    ["Activation controls", PRODUCT_REALITY_BOUNDARIES.activationControls],
    ["Referral active", PRODUCT_REALITY_BOUNDARIES.referralActive],
  ] as const;

  return (
    <section className="rounded-lg border border-red-900/60 bg-red-950/20 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Hard Boundaries</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-md border border-red-900/50 bg-black/20 p-3">
            <div className="text-xs uppercase tracking-[0.14em] text-red-200/80">{label}</div>
            <div className="mt-1 text-sm font-semibold text-red-50">{formatBoundary(value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CurrentReality() {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <SectionTitle
        label="1. Current MVP Reality"
        title="Every major page/module, with its real user ability."
        description="The point is to see the product as a founder, visitor, member, or operator would see it today."
      />
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="border-b border-slate-800 py-3 pr-4">Surface</th>
              <th className="border-b border-slate-800 py-3 pr-4">Status</th>
              <th className="border-b border-slate-800 py-3 pr-4">Audience</th>
              <th className="border-b border-slate-800 py-3 pr-4">User sees</th>
              <th className="border-b border-slate-800 py-3 pr-4">User can do</th>
              <th className="border-b border-slate-800 py-3 pr-4">Status-only / hidden / future</th>
              <th className="border-b border-slate-800 py-3 pr-4">Confusion risk</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCT_REALITY_SURFACES.map((surface) => (
              <tr key={surface.id} className="border-b border-slate-900/80 align-top">
                <td className="py-3 pr-4">
                  <div className="font-semibold text-slate-100">{surface.label}</div>
                  <code className="mt-1 block text-xs text-slate-500">{surface.route}</code>
                </td>
                <td className="py-3 pr-4">
                  <StatusPill status={surface.status} />
                </td>
                <td className="py-3 pr-4 text-slate-300">{surface.audience}</td>
                <td className="py-3 pr-4 text-slate-300">{surface.userSees}</td>
                <td className="py-3 pr-4 text-slate-300">{surface.userCanDo}</td>
                <td className="py-3 pr-4 text-slate-300">
                  <p>{surface.statusOnly}</p>
                  <p className="mt-2 text-slate-400">{surface.hiddenInternal}</p>
                  <p className="mt-2 text-slate-400">{surface.future}</p>
                </td>
                <td className="py-3 pr-4 text-amber-100">{surface.confusionRisk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MemberReality() {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <SectionTitle
        label="2. Member Reality"
        title="What a member can and cannot do today."
        description="A member has a live seat/proof/memory cockpit. Source/referral and SeatRecord721 stay visibly non-live."
      />
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {MEMBER_REALITY_ITEMS.map((item) => (
          <RealityCard key={item.id} label={item.label} status={item.status} body={item.reality} />
        ))}
      </div>
    </section>
  );
}

function VerifiedIntroductionReality() {
  return (
    <section className="rounded-lg border border-emerald-800/60 bg-emerald-950/20 p-5">
      <SectionTitle
        label="3. Verified Introduction V1 Reality"
        title="Direction-approved, launch-unapproved."
        description="The current blocker is the founder decision. Reviewability is not activation."
      />
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {VERIFIED_INTRODUCTION_REALITY_ITEMS.map((item) => (
          <RealityCard key={item.id} label={item.label} status={item.status} body={item.reality} />
        ))}
      </div>
    </section>
  );
}

function ActionAbilityMatrix() {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <SectionTitle
        label="4. Action Ability Matrix"
        title="What a user can actually do, and where each action belongs."
        description="A check means the action belongs in that column. FORBIDDEN NOW means do not build or expose it in the current product."
      />
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="border-b border-slate-800 py-3 pr-4">Action</th>
              {MATRIX_COLUMNS.map((column) => (
                <th key={column.key} className="border-b border-slate-800 py-3 pr-4">
                  {column.label}
                </th>
              ))}
              <th className="border-b border-slate-800 py-3 pr-4">Note</th>
            </tr>
          </thead>
          <tbody>
            {ACTION_ABILITY_MATRIX.map((row) => (
              <MatrixRow key={row.action} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MatrixRow({ row }: { row: ProductRealityMatrixRow }) {
  return (
    <tr className="border-b border-slate-900/80 align-top">
      <td className="py-3 pr-4 font-semibold text-slate-100">{row.action}</td>
      {MATRIX_COLUMNS.map((column) => (
        <td key={column.key} className="py-3 pr-4">
          {row[column.key] ? (
            <span className="inline-flex size-6 items-center justify-center rounded border border-emerald-500/50 bg-emerald-950/40 text-xs font-semibold text-emerald-100">
              ok
            </span>
          ) : (
            <span className="inline-flex size-6 items-center justify-center rounded border border-slate-800 bg-black/20 text-xs text-slate-600">
              -
            </span>
          )}
        </td>
      ))}
      <td className="py-3 pr-4 text-slate-300">{row.note}</td>
    </tr>
  );
}

function PhaseSplit() {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <SectionTitle
        label="5. V1 / V2 / Later Split"
        title="The boundary before SeatRecord721 and Archive/NFT evolution."
        description="Do not implement later modules in this slice. Keep each layer in its own lane."
      />
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {PRODUCT_REALITY_PHASES.map((phase) => (
          <article key={phase.id} className="rounded-md border border-slate-800 bg-black/20 p-4">
            <h3 className="text-base font-semibold text-white">{phase.label}</h3>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
              {phase.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function FounderDecisionPanel() {
  return (
    <section className="rounded-lg border border-emerald-800/60 bg-emerald-950/20 p-5">
      <SectionTitle
        label="6. Founder Decision Panel"
        title="The next choice is preparation, revision, deferral, or rejection."
        description="Option A is preparation only. It is not launch, activation, wallet signing, public controls, or publish."
      />
      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {PRODUCT_REALITY_DECISION_OPTIONS.map((option) => (
          <article key={option.id} className="rounded-md border border-emerald-800/60 bg-black/20 p-4">
            <h3 className="text-sm font-semibold text-white">{option.label}</h3>
            <p className="mt-3 text-sm leading-6 text-emerald-50/90">{option.meaning}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductionDriftNote() {
  return (
    <section className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-5">
      <SectionTitle
        label="7. Production Drift Note"
        title="GitHub truth and Replit production may not be the same."
        description={PRODUCT_REALITY_PRODUCTION_DRIFT_NOTE.note}
      />
      <div className="mt-4 rounded-md border border-amber-800/50 bg-black/20 p-4 text-sm leading-6 text-amber-50">
        Status: {PRODUCT_REALITY_PRODUCTION_DRIFT_NOTE.status}. No publish, sync, transaction, or activation was
        requested by this surface.
      </div>
    </section>
  );
}

function SectionTitle({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

function RealityCard({
  label,
  status,
  body,
}: {
  label: string;
  status: ProductRealityStatus;
  body: string;
}) {
  return (
    <article className="rounded-md border border-slate-800 bg-black/20 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-sm font-semibold text-white">{label}</h3>
        <StatusPill status={status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
    </article>
  );
}

function StatusPill({ status }: { status: ProductRealityStatus }) {
  const tone =
    status === "LIVE"
      ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-100"
      : status === "HIDDEN_REVIEW"
        ? "border-blue-500/50 bg-blue-950/40 text-blue-100"
        : status === "INACTIVE"
          ? "border-amber-500/50 bg-amber-950/40 text-amber-100"
          : status === "FUTURE"
            ? "border-violet-500/50 bg-violet-950/40 text-violet-100"
            : "border-red-500/50 bg-red-950/40 text-red-100";

  return <span className={`rounded border px-2 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

function formatBoundary(value: boolean | string) {
  if (typeof value === "string") return value;
  return value ? "yes" : "no";
}
