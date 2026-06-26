import { createFileRoute } from "@tanstack/react-router";

import {
  HOME_CANDIDATE_BOUNDARIES,
  HOME_CANDIDATE_CHANNELS,
  HOME_CANDIDATE_EPISODES,
  HOME_CANDIDATE_FOUNDER_DECISIONS,
  HOME_CANDIDATE_JOURNEY,
  HOME_CANDIDATE_LOOP,
  HOME_CANDIDATE_MODULES,
  HOME_CANDIDATE_POSITIONING,
  HOME_CANDIDATE_PROOF_POINTS,
  HOME_CANDIDATE_REVIEW_TOKEN,
  HOME_CANDIDATE_ROUTE_WITH_REVIEW,
  HOME_CANDIDATE_TRUST_BOUNDARIES,
  type HomeCandidateStatus,
} from "@/lib/home-candidate";

export const Route = createFileRoute("/labs/home-candidate")({
  validateSearch: (search): { review?: string } => {
    const review = (search as Record<string, unknown>).review;
    return typeof review === "string" ? { review } : {};
  },
  head: () => ({
    meta: [
      { title: "Production Home Candidate - The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal founder production-home candidate. Hidden, direct URL only, read-only, no wallet controls, no buy controls, no activation controls.",
      },
    ],
  }),
  component: HomeCandidateRoute,
});

function HomeCandidateRoute() {
  const { review } = Route.useSearch();
  const reviewUnlocked = review === HOME_CANDIDATE_REVIEW_TOKEN;

  if (!reviewUnlocked) return <LockedHomeCandidate />;

  return (
    <main
      className="min-h-screen bg-background text-foreground"
      data-internal-review="home-candidate"
      data-public-join-default-source-id={HOME_CANDIDATE_BOUNDARIES.publicJoinDefaultSourceId}
      data-wallet-controls={String(HOME_CANDIDATE_BOUNDARIES.walletControls)}
      data-buy-controls={String(HOME_CANDIDATE_BOUNDARIES.buyControls)}
      data-activation-controls={String(HOME_CANDIDATE_BOUNDARIES.activationControls)}
      data-source-controls={String(HOME_CANDIDATE_BOUNDARIES.sourceControls)}
      data-claim-controls={String(HOME_CANDIDATE_BOUNDARIES.claimControls)}
      data-replaces-production-home={String(HOME_CANDIDATE_BOUNDARIES.replacesProductionHome)}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-0 px-4 py-4 sm:px-6 lg:px-8">
        <Hero />
        <ProofStrip />
        <Loop />
        <LiveNow />
        <MemberJourney />
        <Episodes />
        <TrustBoundaries />
        <OfficialChannels />
        <DecisionPanel />
      </div>
    </main>
  );
}

function LockedHomeCandidate() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground" data-internal-review="locked">
      <section className="mx-auto max-w-3xl rounded-lg border border-amber-500/40 bg-amber-500/10 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200">
          Internal Home Candidate Locked
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          This is a direct-URL founder candidate, not the public homepage.
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Use the review query to inspect the production-home direction. The surface is noindex, absent from
          public navigation, absent from sitemap, read-only, and contains no wallet, buy, claim, source, or activation
          controls.
        </p>
      </section>
    </main>
  );
}

function Hero() {
  return (
    <header className="relative overflow-hidden rounded-lg border border-border bg-card">
      <div className="absolute inset-0 opacity-45">
        <div className="h-full w-full bg-[linear-gradient(120deg,rgba(245,201,74,0.18),transparent_34%,rgba(55,189,248,0.12)_68%,transparent)]" />
      </div>
      <div className="relative grid min-h-[72vh] gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-10">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono rounded border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                Hidden Founder Review
              </span>
              <span className="mono rounded border border-border bg-background/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Production / not replaced
              </span>
            </div>
            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--gold)]">
              {HOME_CANDIDATE_POSITIONING.direction}
            </p>
            <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
              A transparent on-chain institution forming in public.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              {HOME_CANDIDATE_POSITIONING.oneLine} Take a seat, verify the route, return to the record, and follow
              the institution as proof becomes memory.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["What is it?", "A membership protocol with public receipts and visible state."],
              ["What now?", "Membership is live through /join."],
              ["What changes?", "The wallet receives SYN and enters the member return loop."],
              ["What stays blocked?", "Source products, claims, aliases, and future identity controls."],
            ].map(([label, body]) => (
              <div key={label} className="rounded-md border border-border bg-background/70 p-4">
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
                <p className="mt-2 text-sm leading-6">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-col justify-end gap-4">
          <div className="rounded-lg border border-[rgba(245,201,74,0.4)] bg-[rgba(245,201,74,0.08)] p-5">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
              Preview actions only
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <PreviewAction label={HOME_CANDIDATE_POSITIONING.primaryPreviewAction} tone="gold" />
              {HOME_CANDIDATE_POSITIONING.secondaryPreviewActions.map((action) => (
                <PreviewAction key={action} label={action} />
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              These are visual labels for founder review. This hidden route does not navigate, connect wallets,
              buy, claim, activate sources, or replace production /.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background/70 p-5">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Review URL</div>
            <code className="mt-2 block break-all text-xs text-foreground">{HOME_CANDIDATE_ROUTE_WITH_REVIEW}</code>
          </div>
        </aside>
      </div>
    </header>
  );
}

function ProofStrip() {
  return (
    <section className="border-x border-b border-border bg-background/70 p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-5">
        {HOME_CANDIDATE_PROOF_POINTS.map((point) => (
          <article key={point.id} className="rounded-md border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{point.label}</div>
              <StatusPill status={point.status} />
            </div>
            <p className="mt-3 break-words text-sm leading-6">{point.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Loop() {
  return (
    <section className="mt-5 rounded-lg border border-border bg-card p-5 sm:p-7">
      <SectionTitle
        label="The Loop"
        title="Join, prove, remember, return, evolve."
        description="This is the return loop: a member does not come back for noise; they come back because real state changed."
      />
      <div className="mt-6 grid gap-3 lg:grid-cols-5">
        {HOME_CANDIDATE_LOOP.map((step, index) => (
          <article key={step.id} className="relative rounded-md border border-border bg-background/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="mono text-xs tracking-[0.26em] text-[color:var(--gold)]">0{index + 1}</span>
              <StatusPill status={step.status} />
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight">{step.verb}</h3>
            <p className="mt-1 text-sm font-medium text-foreground/85">{step.label}</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LiveNow() {
  return (
    <section className="mt-5 rounded-lg border border-border bg-card p-5 sm:p-7">
      <SectionTitle
        label="What Is Live Now"
        title="One institution, clear status labels."
        description="Future modules may be named only when the page also says what cannot be done today."
      />
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {HOME_CANDIDATE_MODULES.map((module) => (
          <article key={module.id} className="rounded-md border border-border bg-background/70 p-4">
            <div className="flex min-h-8 items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-5">{module.label}</h3>
              <StatusPill status={module.status} />
            </div>
            <div className="mono mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {module.route}
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground/85">{module.promise}</p>
            <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
              {module.boundary}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MemberJourney() {
  return (
    <section className="mt-5 rounded-lg border border-border bg-card p-5 sm:p-7">
      <SectionTitle
        label="Member Journey"
        title="A visitor can understand the path without learning the whole system."
        description="The homepage candidate keeps conversion structure simple while making proof and return behavior obvious."
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {HOME_CANDIDATE_JOURNEY.map((step) => (
          <article key={step.id} className="rounded-md border border-border bg-background/70 p-4">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
              {step.label}
            </div>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.visitorState}</h3>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
              {step.receives.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 rounded border border-border bg-card px-3 py-2 text-xs font-medium text-foreground/80">
              {step.nextSurface}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Episodes() {
  return (
    <section className="mt-5 rounded-lg border border-border bg-card p-5 sm:p-7">
      <SectionTitle
        label="Living Timeline"
        title="The institution moves only when proof moves."
        description="This can feel like a premium series because each episode is status-bound and auditable."
      />
      <div className="mt-6 grid gap-3 lg:grid-cols-7">
        {HOME_CANDIDATE_EPISODES.map((episode, index) => (
          <article key={episode.id} className="rounded-md border border-border bg-background/70 p-4">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Episode {index + 1}
            </div>
            <h3 className="mt-3 min-h-12 text-sm font-semibold leading-5">{episode.label}</h3>
            <div className="mt-3">
              <StatusPill status={episode.status} />
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">{episode.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrustBoundaries() {
  return (
    <section className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-5 sm:p-7">
      <SectionTitle
        label="Boundaries / Trust"
        title="Confidence comes from refusing to blur what is not live."
        description="The candidate should feel ambitious because it is controlled, not because it overpromises."
      />
      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_CANDIDATE_TRUST_BOUNDARIES.map((boundary) => (
          <div key={boundary} className="rounded-md border border-amber-500/25 bg-background/70 p-3 text-sm leading-6">
            {boundary}
          </div>
        ))}
      </div>
    </section>
  );
}

function OfficialChannels() {
  return (
    <section className="mt-5 rounded-lg border border-border bg-card p-5 sm:p-7">
      <SectionTitle
        label="Official Channels"
        title="Public channels without adding GitHub as a social footer."
        description="These are plain review labels for the candidate. No public repository promotion is added by this slice."
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {HOME_CANDIDATE_CHANNELS.map((channel) => (
          <div key={channel.label} className="rounded-md border border-border bg-background/70 p-4">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{channel.label}</div>
            <p className="mt-3 break-all text-sm font-medium">{channel.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DecisionPanel() {
  return (
    <section className="mt-5 rounded-lg border border-sky-500/30 bg-sky-500/10 p-5 sm:p-7">
      <SectionTitle
        label="Founder Decision"
        title="Approve, revise, or reject before production / changes."
        description="This hidden candidate gives the founder something visual to judge. It does not grant launch, publish, activation, or homepage replacement authority."
      />
      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {HOME_CANDIDATE_FOUNDER_DECISIONS.map((decision) => (
          <article key={decision.id} className="rounded-md border border-sky-500/25 bg-background/70 p-4">
            <h3 className="text-base font-semibold">{decision.label}</h3>
            <p className="mt-3 text-sm leading-6 text-foreground/85">{decision.meaning}</p>
            <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
              {decision.nextStep}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PreviewAction({ label, tone = "default" }: { label: string; tone?: "default" | "gold" }) {
  const classes =
    tone === "gold"
      ? "border-[rgba(245,201,74,0.45)] bg-[rgba(245,201,74,0.18)] text-foreground"
      : "border-border bg-background/70 text-foreground";

  return (
    <span
      className={`mono inline-flex min-h-11 items-center justify-center rounded px-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] ${classes}`}
      aria-label={`Preview action: ${label}`}
    >
      {label}
    </span>
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
      <p className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <h2 className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function StatusPill({ status }: { status: HomeCandidateStatus }) {
  const tone =
    status === "LIVE"
      ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : status === "READ_ONLY"
        ? "border-cyan-500/45 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
        : status === "LIVE_MEMORY"
          ? "border-[rgba(245,201,74,0.45)] bg-[rgba(245,201,74,0.12)] text-amber-700 dark:text-amber-200"
          : status === "IN_REVIEW" || status === "HIDDEN_REVIEW"
            ? "border-blue-500/45 bg-blue-500/10 text-blue-700 dark:text-blue-300"
            : status === "INACTIVE"
              ? "border-amber-500/45 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : status === "FUTURE"
                ? "border-violet-500/45 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                : "border-red-500/45 bg-red-500/10 text-red-700 dark:text-red-300";

  return (
    <span className={`shrink-0 rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${tone}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
