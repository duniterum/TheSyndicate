import { Link } from "@tanstack/react-router";
import { CTAButton, Section, StatusPill, type CanonicalStatus } from "@/components/syndicate/Primitives";

type JourneyKey = "visitor" | "seat" | "receipt" | "home" | "activity" | "memory";

const JOURNEY: Array<{
  key: JourneyKey;
  label: string;
  status: CanonicalStatus;
  title: string;
  body: string;
  handoff: string;
  to: string;
}> = [
  {
    key: "visitor",
    label: "Visitor",
    status: "LIVE",
    title: "Understand the protocol",
    body: "The Syndicate is a transparent on-chain membership system, not a yield product or dashboard.",
    handoff: "Because the system is visible, the next act can be a verified seat.",
    to: "/docs",
  },
  {
    key: "seat",
    label: "Seat",
    status: "LIVE",
    title: "Buy membership. Receive SYN.",
    body: "SYN is the V1 seat signal. A wallet holding SYN is seated in the protocol.",
    handoff: "Because SYN lands in the wallet, the receipt can prove what changed.",
    to: "/join",
  },
  {
    key: "receipt",
    label: "Receipt",
    status: "LIVE",
    title: "Verify what changed",
    body: "The transaction proves SYN received, USDC paid, and the 70 / 20 / 10 route.",
    handoff: "Because the state change is proven, the wallet has a home context.",
    to: "/transparency",
  },
  {
    key: "home",
    label: "Home",
    status: "LIVE",
    title: "Return to My Syndicate",
    body: "Your cockpit becomes the member home: identity, position, proof, artifacts, and next action.",
    handoff: "Because the seat has context, Activity shows what is moving around it.",
    to: "/my-syndicate",
  },
  {
    key: "activity",
    label: "Heartbeat",
    status: "LIVE",
    title: "Watch the protocol move",
    body: "Activity is the raw on-chain pulse: purchases, mints, liquidity, and verified movement.",
    handoff: "Because movement has proof, some events can become protocol memory.",
    to: "/activity",
  },
  {
    key: "memory",
    label: "Memory",
    status: "PARTIAL",
    title: "Let events become history",
    body: "Chronicle, Register, and Archive turn verified movement into durable protocol memory.",
    handoff: "Because memory accumulates, each seat gains historical place.",
    to: "/archive",
  },
];

export function ProtocolJourneySpine({
  current,
  id = "protocol-journey",
  title = "The journey is one system.",
  description = "A visitor becomes a seated wallet. The receipt proves the state change. My Syndicate becomes home. Activity becomes Chronicle, Register, and Archive memory.",
  compact = false,
}: {
  current?: JourneyKey;
  id?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <Section id={id} className={compact ? "py-8 md:py-10" : "py-12 md:py-16"}>
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.58fr] lg:items-stretch">
        <div className="border-y border-border/60 py-6">
          <div className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Product journey
          </div>
          <h2 className="mt-3 max-w-xl font-serif text-3xl md:text-4xl font-normal tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-3 max-w-xl text-sm md:text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <CTAButton href="/join" variant="gold">Take your seat</CTAButton>
            <CTAButton href="/my-syndicate" variant="navy">Open home</CTAButton>
            <CTAButton href="/activity" variant="ghost">See heartbeat</CTAButton>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {JOURNEY.map((step) => {
            const active = current === step.key;
            return (
              <Link
                key={step.key}
                to={step.to as any}
                className={`rounded-[6px] border p-4 transition-colors ${
                  active
                    ? "border-[var(--gold)]/70 bg-[var(--gold)]/[0.08]"
                    : "border-border/60 bg-card/35 hover:border-[var(--gold)]/45"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {step.label}
                  </span>
                  <StatusPill status={step.status} />
                </div>
                <h3 className="mt-4 font-serif text-xl font-normal leading-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
                <p className="mt-3 border-t border-border/40 pt-3 text-xs leading-relaxed text-foreground/75">
                  {step.handoff}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

export function ProtocolMemoryPipeline({
  id = "protocol-memory-pipeline",
  compact = false,
}: {
  id?: string;
  compact?: boolean;
}) {
  const stages: Array<{
    label: string;
    status: CanonicalStatus;
    title: string;
    body: string;
    handoff: string;
    to: string;
  }> = [
    {
      label: "Activity",
      status: "LIVE",
      title: "What happened?",
      body: "Raw verified events appear newest first with transaction proof.",
      handoff: "Passes proof to interpretation.",
      to: "/activity",
    },
    {
      label: "Chronicle",
      status: "PARTIAL",
      title: "Why did it matter?",
      body: "Selected events become narrated protocol memory, not automatic hype.",
      handoff: "Passes meaning to disposition.",
      to: "/chronicle",
    },
    {
      label: "Register",
      status: "LIVE",
      title: "What became institutional truth?",
      body: "Durable entries preserve verified facts with lineage back to chain.",
      handoff: "Passes facts to memory surfaces.",
      to: "/institutional-register",
    },
    {
      label: "Archive",
      status: "LIVE",
      title: "What can be carried?",
      body: "Artifacts are memories of participation. SYN remains the seat.",
      handoff: "Returns memory to the member.",
      to: "/archive",
    },
  ];

  return (
    <Section id={id} className={compact ? "py-8 md:py-10" : "py-12 md:py-16"}>
      <div className="border-l-2 pl-4 md:pl-5" style={{ borderColor: "var(--gold)" }}>
        <div className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          Event to memory
        </div>
        <h2 className="mt-3 max-w-3xl font-serif text-3xl md:text-4xl font-normal tracking-tight text-foreground">
          Activity is the heartbeat. Chronicle, Register, and Archive are how the heartbeat becomes history.
        </h2>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {stages.map((stage, index) => (
          <Link
            key={stage.label}
            to={stage.to as any}
            className="group rounded-[6px] border border-border/60 bg-card/35 p-4 transition-colors hover:border-[var(--gold)]/45"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                {String(index + 1).padStart(2, "0")} / {stage.label}
              </span>
              <StatusPill status={stage.status} />
            </div>
            <h3 className="mt-4 text-sm font-semibold leading-tight text-foreground">
              {stage.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {stage.body}
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-foreground/70">
              {stage.handoff}
            </p>
            <span className="mono mt-4 inline-block text-[10px] uppercase tracking-[0.18em] text-muted-foreground group-hover:text-foreground">
              Open {stage.label} -&gt;
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
