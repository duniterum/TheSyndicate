import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import {
  GlassCard,
  Pill,
  Section,
  SectionHeader,
} from "@/components/syndicate/Primitives";
import { useProtocolEvents } from "@/lib/protocol-events";
import { interpretProtocolEvent } from "@/lib/protocol-event-intelligence";
import { getTransparencyTimeline } from "@/lib/protocol-transparency-timeline";
import { INSTITUTIONAL_EVENT_CLASSES } from "@/lib/institutional-register-registry";

function statusTone(
  status: "LIVE" | "DERIVED" | "READ_GATED" | "LOCKED",
): ComponentProps<typeof Pill>["tone"] {
  switch (status) {
    case "LIVE":
      return "success";
    case "DERIVED":
      return "navy";
    case "READ_GATED":
      return "warning";
    case "LOCKED":
    default:
      return "muted";
  }
}

const MEMORY_PATH = [
  {
    step: "01",
    label: "Event",
    body: "A real action happens on Avalanche: a mint, a seat purchase, a chapter threshold, or another protocol movement.",
  },
  {
    step: "02",
    label: "Signal",
    body: "Activity records the movement first, then Event Intelligence explains why it matters.",
  },
  {
    step: "03",
    label: "Disposition",
    body: "Chronicle and the Institutional Register decide whether the moment becomes permanent protocol memory.",
  },
  {
    step: "04",
    label: "Artifact",
    body: "The Archive carries the memory as a collectible record, never as a seat or financial claim.",
  },
];

export function ArchiveCeremony() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 120 });
  const archiveEvents = events.filter((event) => event.category === "archive");
  const latestArchiveEvent = archiveEvents[0];
  const latestMeaning = latestArchiveEvent
    ? interpretProtocolEvent(latestArchiveEvent)
    : null;
  const registerArtifactClass = INSTITUTIONAL_EVENT_CLASSES.find(
    (entry) => entry.class === "artifact",
  );
  const timeline = getTransparencyTimeline().filter((entry) =>
    ["Chronicle", "Chapter Milestone"].includes(entry.stage),
  );
  const status: "LIVE" | "DERIVED" | "READ_GATED" | "LOCKED" =
    isLoading || isError ? "DERIVED" : archiveEvents.length > 0 ? "LIVE" : "DERIVED";

  return (
    <Section id="archive-ceremony">
      <SectionHeader
        eyebrow="Archive Ceremony"
        title={<>From minted object to <span className="text-gradient-gold">protocol memory</span></>}
        description="Activity proves the event. Chronicle explains why it mattered. Register decides what became institutional truth. The Archive carries the memory only after that chain has evidence."
      />

      <GlassCard className="p-4 md:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[0.92fr_1.08fr] gap-4">
          <div className="rounded-xl border border-[var(--gold)]/25 bg-card/45 p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                  Museum label
                </p>
                <h3 className="font-serif text-3xl md:text-4xl leading-tight m-0">
                  The First Signal
                </h3>
              </div>
              <Pill tone="success">OPEN</Pill>
            </div>

            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              The First Signal matters because it marks the opening chapter of
              the Archive. It is not the seat. SYN is the seat. This artifact is
              a memory of the protocol becoming visible.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MuseumFact
                label="Remembered event"
                value="Chapter I opening"
                note="public Archive signal"
              />
              <MuseumFact
                label="Witness role"
                value="collector"
                note="record holder, not status tier"
              />
              <MuseumFact
                label="Evidence"
                value="Archive1155"
                note="Avalanche contract"
              />
              <MuseumFact
                label="Return path"
                value="My Syndicate"
                note="seat, proof, memory"
              />
            </div>

            <div className="mt-4 rounded-lg border border-border/50 bg-background/35 p-3">
              <p className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                Curatorial note
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed">
                An artifact becomes memorable when it has an event, a witness
                position, a verification route, and a future place in the
                protocol's record.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/my-syndicate"
                className="inline-flex items-center justify-center rounded-md border border-border/60 px-4 py-2 mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:border-[var(--gold)]/60"
              >
                Return to my memory
              </Link>
              <Link
                to="/activity"
                className="inline-flex items-center justify-center rounded-md border border-border/60 px-4 py-2 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/60"
              >
                Inspect activity
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {MEMORY_PATH.map((item) => (
                <div
                  key={item.step}
                  className="rounded-lg border border-border/50 bg-background/35 p-3 min-h-[178px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
                      {item.step}
                    </span>
                    <span className="size-1.5 rounded-full bg-[var(--gold)]" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <CeremonyCard
                label="Live archive pulse"
                status={status}
                title={`${archiveEvents.length.toLocaleString("en-US")} archive event${archiveEvents.length === 1 ? "" : "s"}`}
                body={
                  latestMeaning
                    ? latestMeaning.meaning
                    : "Archive movement appears here only after indexed on-chain events exist."
                }
                to="/activity"
              />
              <CeremonyCard
                label="Register posture"
                status={registerArtifactClass ? "DERIVED" : "LOCKED"}
                title={registerArtifactClass?.class ?? "artifact"}
                body={
                  registerArtifactClass
                    ? `${registerArtifactClass.availability}. ${registerArtifactClass.description}`
                    : "No artifact class found in the institutional registry."
                }
                to="/institutional-register"
              />
              <CeremonyCard
                label="Chronicle path"
                status={timeline.length > 0 ? "DERIVED" : "LOCKED"}
                title={`${timeline.length} preservation stage${timeline.length === 1 ? "" : "s"}`}
                body="Not every mint becomes a chronicle entry. The protocol preserves moments only when the event earns that disposition."
                to="/chronicle"
              />
            </div>

            <div className="rounded-lg border border-border/50 bg-card/35 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                  What makes it worth returning to
                </span>
                <Pill tone="navy">memory, not hype</Pill>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <ReturnReason
                  title="Context changes"
                  body="A held artifact gains meaning as chapters form, Activity moves, Chronicle narrates, and Register records accumulate around it."
                />
                <ReturnReason
                  title="Proof stays inspectable"
                  body="The contract, transaction, and wallet reads remain available without relying on screenshots or claims."
                />
                <ReturnReason
                  title="Future stays labeled"
                  body="Reserved artifacts remain sealed, read-gated, hidden, or locked until the contract or event makes them real."
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-background/35 p-3 flex flex-wrap items-center gap-2">
              <Pill tone="gold">artifact memory</Pill>
              <Pill tone="muted">no rarity promise</Pill>
              <Pill tone="muted">no financial claim</Pill>
              <Pill tone="muted">no fake eligibility</Pill>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Ceremony comes from evidence, interpretation, and preservation.
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}

function MuseumFact({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-background/35 p-3 min-w-0">
      <p className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
        {label}
      </p>
      <p className="mono text-sm font-semibold text-foreground truncate">
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug mt-1 truncate">
        {note}
      </p>
    </div>
  );
}

function CeremonyCard({
  label,
  status,
  title,
  body,
  to,
}: {
  label: string;
  status: "LIVE" | "DERIVED" | "READ_GATED" | "LOCKED";
  title: string;
  body: string;
  to: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/35 p-3 min-h-[184px] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <Pill tone={statusTone(status)}>{status}</Pill>
      </div>
      <p className="text-sm font-medium text-foreground leading-snug m-0">
        {title}
      </p>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
        {body}
      </p>
      <Link
        to={to}
        className="mt-3 mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
      >
        inspect -&gt;
      </Link>
    </div>
  );
}

function ReturnReason({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-card/30 p-3">
      <p className="text-sm font-medium text-foreground leading-snug">{title}</p>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
        {body}
      </p>
    </div>
  );
}
