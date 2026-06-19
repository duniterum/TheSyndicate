import { useUserQuestProgress, type Quest } from "@/lib/quest-hooks";
import { GlassCard, Section, SectionHeader, Pill } from "@/components/syndicate/Primitives";

const stateMeta: Record<Quest["state"], { label: string; tone: string; dot: string }> = {
  complete:    { label: "COMPLETE",    tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  in_progress: { label: "IN PROGRESS", tone: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)]",                  dot: "bg-[var(--gold)]" },
  not_started: { label: "NOT STARTED", tone: "border-border/60 bg-background text-muted-foreground",                              dot: "bg-muted-foreground" },
  locked:      { label: "LOCKED",      tone: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",          dot: "bg-amber-500" },
};

/**
 * Real per-wallet activity progress derived from onchain data.
 * Recognition delivery remains PENDING — explicitly labeled on every card.
 */
export function QuestProgress() {
  const { connected, quests } = useUserQuestProgress();

  return (
    <Section id="activity-progress">
      <SectionHeader
        eyebrow="Activity · Live Progress"
        title={<>Build a public <span className="text-gradient-gold">track record</span></>}
        description="Progress is tracked live from onchain data — purchases, holdings, LP positions. Recognition delivery is PENDING — nothing is claimable yet."
      />

      {!connected && (
        <div className="mb-4 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/5 p-3 flex items-center gap-2">
          <Pill tone="gold">Wallet Required</Pill>
          <span className="text-sm text-muted-foreground">Connect a wallet to see your activity progress.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quests.map((q) => {
          const meta = stateMeta[q.state];
          return (
            <article key={q.id} className="surface elevated p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-tight">{q.title}</h3>
                <span className={`mono shrink-0 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] ${meta.tone}`}>
                  <span className={`size-1 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{q.detail}</p>

              {/* Progress bar */}
              <div>
                <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
                  <div
                    className={`h-full ${q.state === "complete" ? "bg-emerald-500" : q.state === "locked" ? "bg-amber-500/40" : "bg-[var(--gold)]"}`}
                    style={{ width: `${q.progress}%` }}
                  />
                </div>
                <div className="mono mt-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {q.progressLabel}
                </div>
              </div>

              <div className="border-t border-border/40 pt-2 flex items-center justify-between gap-2">
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground">Recognition</span>
                <span className="mono inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">
                  <span className="size-1 rounded-full bg-amber-500" />
                  {q.recognitionStatus}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed -mt-1">
                {q.recognition}
              </div>
            </article>
          );
        })}
      </div>

      <GlassCard className="mt-4 p-4 text-xs text-muted-foreground leading-relaxed">
        Activity progress reads live from Avalanche RPC (purchase events, SYN balance, JLP balance).
        Recognition delivery is <span className="mono uppercase tracking-[0.16em]">PENDING</span>.
        No yield, no profit, no return is promised.
      </GlassCard>
    </Section>
  );
}
