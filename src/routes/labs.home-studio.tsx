import { createFileRoute } from "@tanstack/react-router";

import {
  EVOLUTION_VISIBILITY_STANDARD,
  FOUNDER_HOME_DECISIONS,
  HOME_BASELINE_FINDINGS,
  HOME_DIRECTIONS,
  HOME_STUDIO_BOUNDARIES,
  HOME_STUDIO_REVIEW_TOKEN,
  HOME_STUDIO_ROUTE_WITH_REVIEW,
  PUBLIC_DRIFT_AUDIT,
  type HomeStudioStatus,
} from "@/lib/home-studio";

export const Route = createFileRoute("/labs/home-studio")({
  validateSearch: (search): { review?: string } => {
    const review = (search as Record<string, unknown>).review;
    return typeof review === "string" ? { review } : {};
  },
  head: () => ({
    meta: [
      { title: "Home Studio - The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal founder Home Studio for public reality alignment. Hidden, direct URL only, read-only, no wallet controls, no buy controls, no activation controls.",
      },
    ],
  }),
  component: HomeStudioRoute,
});

function HomeStudioRoute() {
  const { review } = Route.useSearch();
  const reviewUnlocked = review === HOME_STUDIO_REVIEW_TOKEN;

  if (!reviewUnlocked) return <LockedHomeStudio />;

  return (
    <main
      className="min-h-screen bg-[#0c1016] px-4 py-6 text-slate-100 sm:px-6 lg:px-8"
      data-internal-review="home-studio"
      data-public-join-default-source-id={HOME_STUDIO_BOUNDARIES.publicJoinDefaultSourceId}
      data-wallet-controls={String(HOME_STUDIO_BOUNDARIES.walletControls)}
      data-buy-controls={String(HOME_STUDIO_BOUNDARIES.buyControls)}
      data-activation-controls={String(HOME_STUDIO_BOUNDARIES.activationControls)}
      data-replaces-production-home={String(HOME_STUDIO_BOUNDARIES.replacesProductionHome)}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <Hero />
        <BoundaryGrid />
        <Baseline />
        <Directions />
        <SharedTruth />
        <VisibilityStandard />
        <PublicDriftAudit />
        <DecisionPanel />
      </div>
    </main>
  );
}

function LockedHomeStudio() {
  return (
    <main className="min-h-screen bg-[#0c1016] px-5 py-10 text-slate-100" data-internal-review="locked">
      <section className="mx-auto max-w-3xl rounded-lg border border-amber-500/40 bg-amber-950/20 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
          Internal Home Studio Locked
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          This is a direct-URL founder studio, not a public homepage.
        </h1>
        <p className="mt-4 text-sm leading-6 text-amber-50/90">
          Use the review query to inspect public reality alignment. The surface is noindex, absent from public
          navigation, absent from sitemap, read-only, and contains no wallet, buy, claim, source, or activation
          controls.
        </p>
      </section>
    </main>
  );
}

function Hero() {
  return (
    <header className="rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.42fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Founder Home Studio
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Public reality alignment before any homepage replacement.
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300 md:text-base md:leading-7">
            This hidden studio compares the current production homepage against the living institution doctrine,
            shows safe homepage directions, defines the visibility standard, and reports public-truth drift. It does
            not change production home, launch referral, expose source links, or activate any future module.
          </p>
        </div>
        <div className="rounded-md border border-emerald-700/50 bg-emerald-950/20 p-4 text-sm leading-6 text-emerald-50">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Review URL
          </div>
          <code className="mt-2 block break-all text-xs text-emerald-100">{HOME_STUDIO_ROUTE_WITH_REVIEW}</code>
          <div className="mt-3 font-semibold">Founder review only. No public release authority.</div>
        </div>
      </div>
    </header>
  );
}

function BoundaryGrid() {
  const items = [
    ["Hidden", HOME_STUDIO_BOUNDARIES.hidden],
    ["Noindex", HOME_STUDIO_BOUNDARIES.noindex],
    ["Nofollow", HOME_STUDIO_BOUNDARIES.nofollow],
    ["Direct URL only", HOME_STUDIO_BOUNDARIES.directUrlOnly],
    ["Absent from public nav", HOME_STUDIO_BOUNDARIES.absentFromPublicNavigation],
    ["Absent from sitemap", HOME_STUDIO_BOUNDARIES.absentFromSitemap],
    ["Read-only", HOME_STUDIO_BOUNDARIES.readOnly],
    ["Wallet controls", HOME_STUDIO_BOUNDARIES.walletControls],
    ["Buy controls", HOME_STUDIO_BOUNDARIES.buyControls],
    ["Activation controls", HOME_STUDIO_BOUNDARIES.activationControls],
    ["Replaces production home", HOME_STUDIO_BOUNDARIES.replacesProductionHome],
    ["Referral active", HOME_STUDIO_BOUNDARIES.referralActive],
    ["Public source links", HOME_STUDIO_BOUNDARIES.publicSourceLinksActive],
    ["Source dashboard", HOME_STUDIO_BOUNDARIES.sourceDashboardActive],
    ["Claim UI", HOME_STUDIO_BOUNDARIES.claimUiActive],
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

function Baseline() {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <SectionTitle
        label="1. Current Home Baseline"
        title="The production home is safe, real, and proof-forward."
        description="The question is whether the living institution should become the organising story, not whether to add new mechanics."
      />
      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        {HOME_BASELINE_FINDINGS.map((finding) => (
          <article key={finding.id} className="rounded-md border border-slate-800 bg-black/20 p-4">
            <div className="flex flex-col gap-2">
              <StatusPill status={finding.status} />
              <h3 className="text-sm font-semibold text-white">{finding.label}</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{finding.currentTruth}</p>
            <p className="mt-3 text-xs leading-5 text-amber-100">{finding.founderRead}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Directions() {
  return (
    <section className="rounded-lg border border-emerald-800/60 bg-emerald-950/20 p-5">
      <SectionTitle
        label="2. Home Direction Candidates"
        title="Four safe ways to tell the same current truth."
        description="These are candidate directions for founder choice. None replaces production / without explicit approval."
      />
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {HOME_DIRECTIONS.map((direction) => (
          <article key={direction.id} className="rounded-md border border-emerald-800/60 bg-black/20 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{direction.label}</h3>
                <p className="mt-2 text-sm leading-6 text-emerald-50/90">{direction.promise}</p>
              </div>
              <StatusPill status={direction.status} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              <strong className="text-slate-100">Best for:</strong> {direction.bestFor}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ListBlock title="Preserves" items={direction.preserves} />
              <ListBlock title="Risks" items={direction.risks} tone="warning" />
              <ListBlock title="First viewport" items={direction.firstViewport} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SharedTruth() {
  const rows = [
    ["Live membership path", "/join is the only public membership buy surface."],
    ["Default source", HOME_STUDIO_BOUNDARIES.publicJoinDefaultSourceId],
    ["Source/referral", "/referral remains inactive and status-only."],
    ["Archive", "Archive1155 records memory where configured; it is not the seat."],
    ["Seat identity", "SeatRecord721 remains future and separate from SYN."],
    ["Homepage authority", "This route does not replace production /."],
  ] as const;

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <SectionTitle
        label="3. Shared Truth Model"
        title="Every direction must preserve the same facts."
        description="The home can change story order later, but these facts cannot soften."
      />
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-md border border-slate-800 bg-black/20 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
            <p className="mt-2 break-words text-sm leading-6 text-slate-200">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function VisibilityStandard() {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <SectionTitle
        label="4. Evolution Visibility Standard"
        title="A permanent vocabulary for live, inactive, candidate, and future systems."
        description="Use this before any public homepage replacement so future modules never appear fake-live."
      />
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="border-b border-slate-800 py-3 pr-4">Status</th>
              <th className="border-b border-slate-800 py-3 pr-4">Meaning</th>
              <th className="border-b border-slate-800 py-3 pr-4">May show</th>
              <th className="border-b border-slate-800 py-3 pr-4">Must not show</th>
            </tr>
          </thead>
          <tbody>
            {EVOLUTION_VISIBILITY_STANDARD.map((item) => (
              <tr key={item.status} className="border-b border-slate-900/80 align-top">
                <td className="py-3 pr-4">
                  <StatusPill status={item.status} />
                </td>
                <td className="py-3 pr-4 text-slate-300">{item.meaning}</td>
                <td className="py-3 pr-4 text-slate-300">{item.mayShow}</td>
                <td className="py-3 pr-4 text-amber-100">{item.mustNotShow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PublicDriftAudit() {
  return (
    <section className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-5">
      <SectionTitle
        label="5. Public Reality Drift Audit"
        title="Reported findings only; no public copy changed in this slice."
        description="Static repo review plus live homepage inspection found no blocking contradiction. The main opportunity is story ordering."
      />
      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        {PUBLIC_DRIFT_AUDIT.map((finding) => (
          <article key={finding.id} className="rounded-md border border-amber-800/50 bg-black/20 p-4">
            <div className="flex flex-col gap-2">
              <StatusPill status={finding.status} />
              <h3 className="text-sm font-semibold text-white">{finding.surface}</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-amber-50/90">{finding.finding}</p>
            <p className="mt-3 text-xs leading-5 text-slate-300">{finding.action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function DecisionPanel() {
  return (
    <section className="rounded-lg border border-blue-800/60 bg-blue-950/20 p-5">
      <SectionTitle
        label="6. Founder Decision Panel"
        title="The founder can choose direction; Codex cannot replace / from this slice."
        description="This route gives a decision surface. It does not grant launch, publish, activation, or homepage replacement authority."
      />
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {FOUNDER_HOME_DECISIONS.map((decision) => (
          <article key={decision.id} className="rounded-md border border-blue-800/60 bg-black/20 p-4">
            <h3 className="text-sm font-semibold text-white">{decision.label}</h3>
            <p className="mt-3 text-sm leading-6 text-blue-50/90">{decision.decision}</p>
            <p className="mt-3 text-xs leading-5 text-slate-300">
              <strong className="text-slate-100">Safe next step:</strong> {decision.safeNextStep}
            </p>
          </article>
        ))}
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

function ListBlock({
  title,
  items,
  tone = "default",
}: {
  title: string;
  items: readonly string[];
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
      <div className={`text-xs font-semibold uppercase tracking-[0.14em] ${tone === "warning" ? "text-amber-200" : "text-slate-400"}`}>
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function StatusPill({ status }: { status: HomeStudioStatus }) {
  const tone =
    status === "LIVE"
      ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-100"
      : status === "READ_ONLY"
        ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-100"
        : status === "HIDDEN_REVIEW"
          ? "border-blue-500/50 bg-blue-950/40 text-blue-100"
          : status === "CANDIDATE"
            ? "border-violet-500/50 bg-violet-950/40 text-violet-100"
            : status === "FUTURE"
              ? "border-slate-500/50 bg-slate-950/60 text-slate-100"
              : status === "INACTIVE"
                ? "border-amber-500/50 bg-amber-950/40 text-amber-100"
                : "border-red-500/50 bg-red-950/40 text-red-100";

  return <span className={`rounded border px-2 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

function formatBoundary(value: boolean | string) {
  if (typeof value === "string") return value;
  return value ? "yes" : "no";
}
