import { getTransparencyTimeline, type TransparencyTimelineStatus } from "@/lib/protocol-transparency-timeline";
import { GlassCard, Pill, Section, SectionHeader } from "./Primitives";

const STATUS_TONE: Record<TransparencyTimelineStatus, "success" | "warning" | "muted" | "navy"> = {
  LIVE: "success",
  PARTIAL: "warning",
  PENDING: "muted",
  RESERVED: "navy",
  REQUIRES_CONTRACT: "muted",
};

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export function TransparencyTimeline() {
  const entries = getTransparencyTimeline();

  return (
    <Section id="transparency-timeline">
      <SectionHeader
        eyebrow="Transparency Timeline"
        title="From entry to memory"
        description="A restrained sequence of what is live, what is partial, and what stays reserved until the protocol produces a real event or contract."
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <GlassCard key={entry.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                  {String(entry.order).padStart(2, "0")} - {entry.stage}
                </div>
                <h3 className="mt-2 text-base font-semibold text-foreground">{entry.title}</h3>
              </div>
              <Pill tone={STATUS_TONE[entry.status]}>{entry.status.replace("_", " ")}</Pill>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>
            <p className="mt-3 text-xs leading-relaxed text-foreground/80">{entry.consequence}</p>

            <div className="mt-4 border-t border-border/40 pt-3">
              <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Source
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{entry.source}</div>
            </div>

            {(entry.proofHref || entry.routeHref) && (
              <div className="mt-4 flex flex-wrap gap-3">
                {entry.proofHref && entry.proofLabel && (
                  <a
                    href={entry.proofHref}
                    target={isExternal(entry.proofHref) ? "_blank" : undefined}
                    rel={isExternal(entry.proofHref) ? "noopener noreferrer" : undefined}
                    className="mono text-[10px] uppercase tracking-[0.18em] text-foreground underline-offset-4 hover:text-[var(--gold)] hover:underline"
                  >
                    {entry.proofLabel}
                  </a>
                )}
                {entry.routeHref && entry.routeHref !== entry.proofHref && (
                  <a
                    href={entry.routeHref}
                    className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Context
                  </a>
                )}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
