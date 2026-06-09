import { JOURNEY_STEPS, type JourneyStep } from "@/lib/syndicate-config";
import { Section, SectionHeader } from "@/components/syndicate/Primitives";

const PILL: Record<JourneyStep["status"], { label: string; cls: string; dot: string }> = {
  live:    { label: "LIVE",    cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  next:    { label: "NEXT",    cls: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[color:oklch(0.5_0.13_75)]",   dot: "bg-[var(--gold)]" },
  pending: { label: "PENDING", cls: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",         dot: "bg-amber-500" },
};

export function HomeJourney() {
  return (
    <Section id="home-journey">
      <SectionHeader
        eyebrow="Membership Journey"
        title={<>From <span className="text-gradient-gold">$5 entry</span> to future Vault</>}
        description="Seven public steps. Each one activates as the matching contract goes live."
      />
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {JOURNEY_STEPS.map((s, i) => {
          const p = PILL[s.status];
          return (
            <li key={s.key} className="surface elevated p-4 flex flex-col gap-2 h-full">
              <div className="flex items-center justify-between">
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Step {i + 1}</span>
                <span className={`mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] ${p.cls}`}>
                  <span className={`size-1 rounded-full ${p.dot}`} />
                  {p.label}
                </span>
              </div>
              <div className="text-sm font-semibold">{s.label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.detail}</p>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
