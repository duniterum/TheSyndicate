// /activity Milestones section — completed + upcoming canonical
// protocol milestones derived from useProtocolPulse + recent mint
// events. No invented thresholds. No countdowns. Real on-chain inputs
// only — when data is unknown the milestone is omitted.

import { useMemo } from "react";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { useProtocolEvents } from "@/lib/protocol-events";
import {
  evaluateMilestones,
  splitReached,
  type MilestoneStatus,
} from "@/lib/activity-milestones";
import { GlassCard, Section, SectionHeader, StatusPill } from "./Primitives";

const fmtN = (n: number | undefined) =>
  n === undefined ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export function ActivityMilestones() {
  const pulse = useProtocolPulse();
  const { events } = useProtocolEvents({ limit: 200 });

  const mintFlags = useMemo(() => {
    return {
      firstSignal: events.some((e) => e.kind === "nft-mint-first-signal"),
      patronSeal: events.some((e) => e.kind === "nft-mint-patron-seal"),
    };
  }, [events]);

  const statuses = useMemo(
    () =>
      evaluateMilestones({
        buyers: pulse.buyers,
        usdcRaised: pulse.usdcRaised,
        firstSignalMinted: mintFlags.firstSignal,
        patronSealMinted: mintFlags.patronSeal,
      }),
    [pulse.buyers, pulse.usdcRaised, mintFlags.firstSignal, mintFlags.patronSeal],
  );

  const { completed, upcoming } = useMemo(() => splitReached(statuses), [statuses]);
  // Cap upcoming to the 5 closest, drop ones we cannot evaluate.
  const upcomingShown = upcoming.filter((s) => s.current !== undefined).slice(0, 5);

  return (
    <Section id="milestones">
      <SectionHeader
        eyebrow="Milestones"
        title={
          <>
            What the protocol has <span className="text-gradient-gold">already sealed</span> — and what comes next
          </>
        }
        description="Each milestone is a canonical on-chain threshold. Completed milestones cite the live state that confirms them; upcoming milestones show distance, not deadlines."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <StatusPill status="LIVE" />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Completed · {completed.length}
            </span>
          </div>
          {completed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No milestones sealed yet — the registry will reflect the first one as soon as it lands on-chain.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {completed.map((s) => (
                <MilestoneRow key={s.milestone.id} s={s} state="done" />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <StatusPill status="PARTIAL" />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Upcoming · closest first
            </span>
          </div>
          {upcomingShown.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Awaiting live pulse data — upcoming milestones will appear once the on-chain totals load.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {upcomingShown.map((s) => (
                <MilestoneRow key={s.milestone.id} s={s} state="next" />
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </Section>
  );
}

function MilestoneRow({ s, state }: { s: MilestoneStatus; state: "done" | "next" }) {
  const pct = Math.round(s.progress * 100);
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground truncate">
            {state === "done" ? "✓ " : ""}{s.milestone.label}
          </div>
          <div className="text-[11px] text-muted-foreground leading-snug truncate">
            {s.milestone.description}
          </div>
        </div>
        <div className="text-right shrink-0">
          {state === "done" ? (
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold)]">
              Sealed
            </span>
          ) : (
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
              {fmtN(s.current)} / {fmtN(s.milestone.target)}
            </span>
          )}
        </div>
      </div>
      {state === "next" && (
        <div className="h-1 rounded-full bg-border/40 overflow-hidden" aria-hidden="true">
          <div
            className="h-full"
            style={{ width: `${pct}%`, background: "var(--gold)" }}
          />
        </div>
      )}
    </li>
  );
}
