import { createFileRoute } from "@tanstack/react-router";

import {
  PRODUCT_OS_V1_BOUNDARY_LABELS,
  PRODUCT_OS_V1_FIRE_FLOW,
  PRODUCT_OS_V1_INACTIVE_BOUNDARIES,
  PRODUCT_OS_V1_MEMBER_PREVIEW,
  PRODUCT_OS_V1_OPERATOR_PREVIEW,
  PRODUCT_OS_V1_PROOF_CARDS,
  PRODUCT_OS_V1_RECOGNITION_AXES,
  PRODUCT_OS_V1_REVIEW_TOKEN,
  PRODUCT_OS_V1_TOOLKIT_GROUPS,
} from "@/lib/product-os-v1-preview";

export const Route = createFileRoute("/labs/product-os-v1")({
  validateSearch: (search): { review?: string } => {
    const review = (search as Record<string, unknown>).review;
    return typeof review === "string" ? { review } : {};
  },
  head: () => ({
    meta: [
      { title: "Product OS V1 Preview - The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Hidden read-only founder review preview for The Syndicate member app direction. Not public launch, not activation.",
      },
    ],
  }),
  component: ProductOsV1Route,
});

function ProductOsV1Route() {
  const { review } = Route.useSearch();
  const unlocked = review === PRODUCT_OS_V1_REVIEW_TOKEN;

  if (!unlocked) return <LockedProductOsPreview />;

  return (
    <main
      className="min-h-screen overflow-hidden bg-slate-950 text-slate-100"
      data-product-os-v1-preview="read-only"
      data-wallet-writes="none"
      data-source-activation="none"
      data-claim-ui="none"
      data-founder-execution="none"
    >
      <ProductOsHero />
      <BoundaryBand />
      <ProofPreview />
      <EconomyPreview />
      <RecognitionPreview />
      <FirePreview />
      <ToolkitPreview />
      <MemberAppPreview />
      <FounderOperatorPreview />
      <BridgePlanFooter />
    </main>
  );
}

function LockedProductOsPreview() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100" data-product-os-v1-preview="locked">
      <section className="mx-auto max-w-3xl rounded-lg border border-cyan-400/35 bg-cyan-950/20 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Founder Review Locked</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          This read-only preview is not public.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          This noindex route requires the founder review token. It is not in navigation, not in the sitemap, and
          exposes no wallet action, source activation, claim UI, or founder control.
        </p>
      </section>
    </main>
  );
}

function ProductOsHero() {
  const themes = [
    "take your seat",
    "public proof",
    "transparent routing",
    "member identity",
    "proof of burn",
    "recognition",
    "toolkit",
  ];

  return (
    <section className="relative border-b border-slate-800/80 px-5 py-10 md:py-16">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_90%_10%,rgba(245,201,74,0.12),transparent_34%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div>
          <p className="mono text-[11px] uppercase tracking-[0.24em] text-cyan-200">
            Hidden founder review / read-only preview
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
            The Syndicate as a living on-chain membership institution.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            A production-safe preview of the member app direction: proof close to story, transparent routing, public
            activity, member identity, Fire / Proof of Burn, recognition signals, and a restrained action toolkit.
          </p>
        </div>
        <div className="rounded-lg border border-slate-700/70 bg-slate-900/75 p-5 shadow-2xl shadow-cyan-950/30">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Member app preview</p>
              <p className="mt-1 text-lg font-semibold text-white">Seat, proof, memory</p>
            </div>
            <PreviewBadge>READ-ONLY</PreviewBadge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {themes.map((theme) => (
              <div key={theme} className="rounded-md border border-slate-800 bg-black/25 p-3 text-sm text-slate-200">
                {theme}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BoundaryBand() {
  return (
    <section className="border-b border-slate-800 bg-slate-900/45 px-5 py-5">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
        {PRODUCT_OS_V1_BOUNDARY_LABELS.map((label) => (
          <PreviewBadge key={label}>{label}</PreviewBadge>
        ))}
      </div>
    </section>
  );
}

function ProofPreview() {
  return (
    <PreviewSection
      eyebrow="Public proof preview"
      title="A public proof layer before any member action."
      description="Each surface is shown as a read-only preview. No wallet state is required and no live metric is invented."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PRODUCT_OS_V1_PROOF_CARDS.map((card) => (
          <PreviewCard key={card.title} eyebrow={card.eyebrow} title={card.title}>
            <p>{card.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <PreviewBadge>PREVIEW DATA</PreviewBadge>
              <PreviewBadge>READ-ONLY</PreviewBadge>
            </div>
          </PreviewCard>
        ))}
      </div>
    </PreviewSection>
  );
}

function EconomyPreview() {
  return (
    <PreviewSection
      eyebrow="Economy / Routing preview"
      title="Transparent routing stays legible before live totals appear."
      description="The routing doctrine is shown as structure, not as an invented metric."
    >
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-cyan-400/30 bg-cyan-950/20 p-6">
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-cyan-200">Routing model</p>
          <div className="mt-4 text-5xl font-semibold text-white md:text-6xl">70% / 20% / 10%</div>
          <p className="mt-4 text-sm leading-6 text-cyan-50/85">
            Vault, liquidity, and operations framing for review. This page does not show live USDC routed or SYN
            acquired totals.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <PreviewBadge>PREVIEW DATA</PreviewBadge>
            <PreviewBadge>NOT LIVE METRIC</PreviewBadge>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["70%", "Vault", "Long-term protocol custody framing."],
            ["20%", "Liquidity", "Market access concept, no DEX or LP links."],
            ["10%", "Operations", "Operating capacity framing."],
          ].map(([pct, label, body]) => (
            <PreviewCard key={label} eyebrow={pct} title={label}>
              <p>{body}</p>
            </PreviewCard>
          ))}
        </div>
      </div>
    </PreviewSection>
  );
}

function RecognitionPreview() {
  return (
    <PreviewSection
      eyebrow="Recognition preview"
      title="The Syndicate recognizes capital without reducing identity to capital."
      description="Recognition is shown as a set of contribution signals. It is not a wealth leaderboard, not rewards, not governance, and no financial rights."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_OS_V1_RECOGNITION_AXES.map((axis) => (
            <div key={axis} className="rounded-md border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-sm font-semibold text-white">{axis}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Conceptual recognition axis. READ-ONLY PREVIEW.</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-amber-400/30 bg-amber-950/20 p-6">
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-amber-200">Guardrails</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-50/90">
            <li>Not a wealth leaderboard.</li>
            <li>Not rewards.</li>
            <li>Not governance.</li>
            <li>No financial rights.</li>
            <li>Capital matters, but it is one recognition axis.</li>
          </ul>
        </div>
      </div>
    </PreviewSection>
  );
}

function FirePreview() {
  return (
    <PreviewSection
      eyebrow="Fire / Proof of Burn preview"
      title="A proof ritual, not a live burn control."
      description="This route shows the future shape of Proof of Burn without burn totals, transaction hashes, explorer links, or execution controls."
    >
      <div className="rounded-lg border border-orange-400/30 bg-orange-950/20 p-5">
        <div className="grid gap-3 md:grid-cols-7">
          {PRODUCT_OS_V1_FIRE_FLOW.map((step, index) => (
            <div key={step} className="rounded-md border border-orange-300/20 bg-black/25 p-3">
              <p className="mono text-[10px] uppercase tracking-[0.18em] text-orange-200">
                Step {index + 1}
              </p>
              <p className="mt-2 text-sm leading-5 text-orange-50">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <PreviewBadge>READ-ONLY PREVIEW</PreviewBadge>
          <PreviewBadge>FUTURE ACTION</PreviewBadge>
          <PreviewBadge>NO LIVE BURN EXECUTION</PreviewBadge>
          <PreviewBadge>NO PRICE PROMISE</PreviewBadge>
        </div>
      </div>
    </PreviewSection>
  );
}

function ToolkitPreview() {
  return (
    <PreviewSection
      eyebrow="Toolkit preview"
      title="The action architecture is visible; the actions are not active."
      description="The toolkit appears as disabled preview architecture. There are no wallet writes, fake DEX links, fake explorer links, source activation, or claim controls."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {PRODUCT_OS_V1_TOOLKIT_GROUPS.map((group) => (
          <div key={group} className="rounded-md border border-slate-800 bg-slate-900/70 p-4">
            <p className="font-semibold text-white">{group}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Disabled preview group. No action executes.</p>
            <div className="mt-4">
              <PreviewBadge>PREVIEW ONLY</PreviewBadge>
            </div>
          </div>
        ))}
      </div>
    </PreviewSection>
  );
}

function MemberAppPreview() {
  return (
    <PreviewSection
      eyebrow="Member app preview"
      title="A compact member surface without wallet requirements."
      description="The page previews member identity, receipts, contribution depth, sharing, and privacy shape without changing member routes."
    >
      <div className="rounded-lg border border-slate-700 bg-slate-900/75 p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCT_OS_V1_MEMBER_PREVIEW.map((item) => (
            <div key={item} className="rounded-md border border-slate-800 bg-black/25 p-4 text-sm text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </div>
    </PreviewSection>
  );
}

function FounderOperatorPreview() {
  return (
    <PreviewSection
      eyebrow="Founder / Operator preview"
      title="Founder tools are shown as concepts, not controls."
      description="This is a prototype-only review of review queues, release gates, handoff records, and audit posture."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_0.55fr]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_OS_V1_OPERATOR_PREVIEW.map((item) => (
            <div key={item} className="rounded-md border border-violet-400/25 bg-violet-950/20 p-4 text-sm text-violet-50">
              {item}
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-red-400/30 bg-red-950/20 p-6">
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-red-200">Execution boundary</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-red-50/90">
            <li>PROTOTYPE ONLY.</li>
            <li>NO REAL EXECUTION.</li>
            <li>NOT PRODUCTION AUTH.</li>
          </ul>
        </div>
      </div>
    </PreviewSection>
  );
}

function BridgePlanFooter() {
  return (
    <section className="border-t border-slate-800 bg-slate-950 px-5 py-10">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="mono text-[11px] uppercase tracking-[0.24em] text-cyan-200">Bridge plan</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Slice by slice, after founder approval.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            The Studio stays isolated under <code>apps/product-os-studio/</code>. This route is a hidden read-only
            preview inside the real app. Future production integration must be approved and implemented one surface at
            a time.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRODUCT_OS_V1_INACTIVE_BOUNDARIES.map((item) => (
            <div key={item} className="rounded-md border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviewSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 py-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 max-w-3xl">
          <p className="mono text-[11px] uppercase tracking-[0.24em] text-cyan-200">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300 md:text-base">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function PreviewCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/70 p-5 text-sm leading-6 text-slate-300">
      <p className="mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function PreviewBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono inline-flex rounded border border-cyan-300/30 bg-cyan-950/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
      {children}
    </span>
  );
}
