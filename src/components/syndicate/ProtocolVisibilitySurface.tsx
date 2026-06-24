import type { ReactNode } from "react";
import {
  Archive,
  BadgeCheck,
  CircleDot,
  Compass,
  Landmark,
  LineChart,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CTAButton, Panel, Pill, Section, SectionHeader } from "@/components/syndicate/Primitives";
import {
  PROTOCOL_INSTITUTIONAL_SPINE,
  PROTOCOL_VISIBILITY_HARD_BOUNDARIES,
  PROTOCOL_VISIBILITY_NODES,
  PROTOCOL_VISIBILITY_PILLARS,
  PROTOCOL_VISIBILITY_PROOF_BACKBONE,
  PROTOCOL_VISIBILITY_PULSE,
  PROTOCOL_VISIBILITY_RECOGNITION_DOCTRINE,
  PROTOCOL_VISIBILITY_SYSTEM_GROUPS,
  getProtocolVisibilityNodesByGroup,
  type ProtocolVisibilityStatus,
  type ProtocolVisibilitySystemGroup,
} from "@/lib/protocol-visibility";

const STATUS_TONE: Record<ProtocolVisibilityStatus, "success" | "warning" | "muted" | "gold" | "navy" | "danger"> = {
  LIVE: "success",
  PAUSED: "warning",
  INACTIVE: "muted",
  BUILDING: "gold",
  PLANNED: "navy",
  FUTURE: "navy",
  DEFERRED: "danger",
};

const GROUP_ICONS: Record<ProtocolVisibilitySystemGroup, LucideIcon> = {
  ENTRY: Landmark,
  ECONOMY: LineChart,
  PROOF: ShieldCheck,
  MEMORY: Archive,
  GROWTH: Network,
  FUTURE: Sparkles,
  INFRASTRUCTURE: Compass,
};

const GROUP_COPY: Record<ProtocolVisibilitySystemGroup, { label: string; meaning: string }> = {
  ENTRY: { label: "Entry", meaning: "How a person starts and takes action." },
  ECONOMY: { label: "Economy", meaning: "How value routes and receipts explain movement." },
  PROOF: { label: "Proof", meaning: "Where claims can be verified." },
  MEMORY: { label: "Memory", meaning: "How events become institutional history." },
  GROWTH: { label: "Growth", meaning: "Reserved acquisition and contribution systems." },
  FUTURE: { label: "Future", meaning: "Approved horizons that are not live." },
  INFRASTRUCTURE: { label: "Infrastructure", meaning: "Member home, evolution, and operating context." },
};

function VisibilityStatusPill({ status }: { status: ProtocolVisibilityStatus }) {
  return <Pill tone={STATUS_TONE[status]}>{status}</Pill>;
}

function MaybeLink({
  href,
  children,
  className = "",
}: {
  href: string | null;
  children: ReactNode;
  className?: string;
}) {
  if (!href) {
    return <div className={className}>{children}</div>;
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function ProtocolVisibilitySurface() {
  const placeNodes = PROTOCOL_VISIBILITY_NODES.filter((node) => node.pillarIds.includes("place"));

  return (
    <Section id="protocol-visibility" className="py-12 md:py-16">
      <SectionHeader
        eyebrow="Living institution"
        title={<>One institution. <span className="text-gradient-gold">Five views.</span> One truth.</>}
        description="The Syndicate is not a set of disconnected pages. It is a living membership institution: participation, structure, pulse, proof, and place."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.48fr)]">
        <Panel
          variant="surface"
          glow="identity"
          padding="md"
          header={{
            eyebrow: "Canonical visibility language",
            title: "The whole organism in one scan",
            aside: <Pill tone="success">LIVE TRUTH</Pill>,
          }}
        >
          <p className="text-base leading-relaxed text-foreground/82">
            Spine shows how participation works. Map shows where systems belong. Pulse shows why the
            institution feels alive. Proof shows why it can be trusted. Place shows where the human belongs.
          </p>
          <div className="mt-5 grid gap-2">
            {PROTOCOL_VISIBILITY_PILLARS.map((pillar, index) => (
              <div key={pillar.id} className="rounded-[6px] border border-border/55 bg-background/35 p-3">
                <div className="flex items-start gap-3">
                  <span className="mono mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/45 text-[10px] text-[var(--gold)]">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{pillar.label}</div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{pillar.publicLabel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          variant="glass"
          padding="md"
          header={{
            eyebrow: "Institutional Spine",
            title: "Join -> Prove -> Remember -> Return -> Evolve",
            aside: <Pill tone="gold">SPINE</Pill>,
          }}
        >
          <div className="grid gap-3 md:grid-cols-5">
            {PROTOCOL_INSTITUTIONAL_SPINE.map((step) => (
              <a
                key={step.id}
                href={step.route}
                className="group rounded-[6px] border border-border/60 bg-card/45 p-3 transition-colors hover:border-[var(--gold)]/55"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="mono flex size-7 items-center justify-center rounded-full border border-[var(--gold)]/45 text-[11px] text-[var(--gold)]">
                    {step.label}
                  </span>
                  <VisibilityStatusPill status={step.status} />
                </div>
                <div className="mt-4 font-serif text-xl font-normal text-foreground">{step.verb}</div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.meaning}</p>
              </a>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        {PROTOCOL_VISIBILITY_PULSE.map((item) => (
          <a
            key={item.id}
            href={item.route}
            className="rounded-[6px] border border-border/60 bg-card/45 p-4 transition-colors hover:border-[var(--gold)]/55"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</span>
              <VisibilityStatusPill status={item.status} />
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-foreground">{item.summary}</p>
            <p className="mt-2 text-xs leading-relaxed text-foreground/70">{item.proof}</p>
          </a>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.75fr)]">
        <Panel
          variant="surface"
          padding="md"
          header={{
            eyebrow: "Institution Map",
            title: "Entry / Economy / Proof / Memory / Growth / Future / Infrastructure",
            aside: <Pill tone="navy">MAP</Pill>,
          }}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {PROTOCOL_VISIBILITY_SYSTEM_GROUPS.map((group) => {
              const Icon = GROUP_ICONS[group];
              const nodes = getProtocolVisibilityNodesByGroup(group);
              return (
                <div key={group} className="rounded-[6px] border border-border/55 bg-background/35 p-3">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 size-5 shrink-0 text-[var(--gold)]" aria-hidden="true" />
                    <div>
                      <div className="font-serif text-lg font-semibold text-foreground">{GROUP_COPY[group].label}</div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{GROUP_COPY[group].meaning}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {nodes.map((node) => (
                      <MaybeLink
                        key={node.id}
                        href={node.route}
                        className={`block rounded-[5px] border px-3 py-2 transition-colors ${
                          node.status === "LIVE"
                            ? "border-border/55 bg-card/45 hover:border-[var(--gold)]/45"
                            : "border-border/35 bg-muted/15 text-foreground/75"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground">{node.label}</span>
                          <VisibilityStatusPill status={node.status} />
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{node.role}</p>
                      </MaybeLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="grid gap-4">
          <Panel
            variant="glass"
            padding="md"
            header={{
              eyebrow: "Place / Belonging",
              title: "Where the human fits",
              aside: <Users className="size-5 text-[var(--gold)]" aria-hidden="true" />,
            }}
          >
            <p className="text-sm leading-relaxed text-foreground/82">
              The seat is live today. Future recognition is reserved for verified contribution,
              builder work, source attribution, era participation, and institutional trust capital.
            </p>
            <div className="mt-4 grid gap-2">
              {placeNodes.slice(0, 5).map((node) => (
                <MaybeLink
                  key={`place-${node.id}`}
                  href={node.route}
                  className="rounded-[6px] border border-border/55 bg-background/35 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-foreground">{node.label}</span>
                    <VisibilityStatusPill status={node.status} />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{node.userMeaning}</p>
                </MaybeLink>
              ))}
            </div>
          </Panel>

          <Panel
            variant="flat"
            padding="md"
            header={{
              eyebrow: "Proof Backbone",
              title: "Everything important points to proof",
              aside: <BadgeCheck className="size-5 text-[var(--verify)]" aria-hidden="true" />,
            }}
          >
            <div className="grid gap-2">
              {PROTOCOL_VISIBILITY_PROOF_BACKBONE.map((item) => (
                <a
                  key={item.label}
                  href={item.route}
                  className="flex items-center justify-between gap-3 rounded-[5px] border border-border/45 bg-background/35 px-3 py-2 hover:border-[var(--gold)]/45"
                >
                  <span className="inline-flex items-center gap-2 text-sm text-foreground">
                    <CircleDot className="size-3 text-[var(--verify)]" aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Open</span>
                </a>
              ))}
            </div>
          </Panel>

          <Panel
            variant="flat"
            padding="md"
            header={{
              eyebrow: "Hard Boundaries",
              title: "Reserved does not mean live",
              aside: <Pill tone="danger">NO FAKE LIVE</Pill>,
            }}
          >
            <div className="grid gap-2">
              {PROTOCOL_VISIBILITY_HARD_BOUNDARIES.map((boundary) => (
                <div key={boundary} className="flex items-start gap-2 text-sm leading-relaxed text-foreground/78">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:oklch(0.6_0.2_25)]" />
                  <span>{boundary}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-[6px] border border-[var(--gold)]/25 bg-[color:color-mix(in_oklab,var(--accent)_6%,transparent)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">Future recognition reserve</div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">
            {PROTOCOL_VISIBILITY_RECOGNITION_DOCTRINE}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <CTAButton href="/join" variant="gold">Join The Syndicate</CTAButton>
          <CTAButton href="/evolution" variant="navy">Follow the pulse</CTAButton>
        </div>
      </div>
    </Section>
  );
}
