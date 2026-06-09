// Wave 3A — Protocol Timeline
//
// Bucketed compact timeline of the unified protocol event stream, grouped
// into Today / This Week / Recent. Same source as ProtocolEventsFeed; this
// surface emphasizes RECENCY ("when did the protocol do something") over
// chronological detail. Factual, not gamified.

import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useProtocolEvents } from "@/lib/protocol-events";
import { useChainTime, formatRelative, WINDOW_24H, WINDOW_7D } from "@/lib/chain-time";
import { txExplorerUrl } from "@/lib/syndicate-config";
import { Section, SectionHeader, GlassCard, StatusPill } from "./Primitives";

type Bucket = "today" | "week" | "recent";

const BUCKET_LABEL: Record<Bucket, string> = {
  today: "Today",
  week: "This week",
  recent: "Recent",
};

export function ProtocolTimeline({ limit = 40 }: { limit?: number }) {
  const { events, isLoading } = useProtocolEvents({ limit });
  const chainTime = useChainTime();

  const grouped = useMemo(() => {
    const out: Record<Bucket, { event: typeof events[number]; secondsAgo: number | undefined }[]> = {
      today: [],
      week: [],
      recent: [],
    };
    for (const ev of events) {
      const ago = chainTime.secondsSince(ev.blockNumber);
      let bucket: Bucket;
      if (ago === undefined) bucket = "recent";
      else if (ago <= WINDOW_24H) bucket = "today";
      else if (ago <= WINDOW_7D) bucket = "week";
      else bucket = "recent";
      out[bucket].push({ event: ev, secondsAgo: ago });
    }
    return out;
  }, [events, chainTime]);

  return (
    <Section id="protocol-timeline">
      <SectionHeader
        eyebrow="Protocol Timeline"
        title={<>Today · this week · <span className="text-gradient-gold">recent</span></>}
        description="The unified event stream, bucketed by recency. Each row is verifiable on Avascan; ages are approximate (Avalanche ≈ 2s/block)."
      />
      <div className="mb-3 flex items-center gap-2">
        <StatusPill status={isLoading && events.length === 0 ? "PENDING" : "LIVE"} />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {events.length} event{events.length === 1 ? "" : "s"} indexed
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(["today", "week", "recent"] as Bucket[]).map((b) => (
          <GlassCard key={b} className="p-4">
            <div className="flex items-center justify-between">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
                {BUCKET_LABEL[b]}
              </div>
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {grouped[b].length}
              </div>
            </div>
            {grouped[b].length === 0 ? (
              <div className="mt-4 text-xs text-muted-foreground">
                {b === "today"
                  ? "No on-chain activity in the last 24 hours yet."
                  : b === "week"
                  ? "No on-chain activity in the 24h–7d window yet."
                  : "Nothing older than 7 days in the indexed window."}
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {grouped[b].slice(0, 10).map(({ event, secondsAgo }) => (
                  <li key={event.id} className="text-xs">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-foreground/90 truncate">{event.title}</span>
                      <a
                        href={txExplorerUrl(event.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-[var(--gold)] shrink-0"
                        title={`Block ${event.blockNumber.toString()} · click for transaction`}
                      >
                        {formatRelative(secondsAgo)} ↗
                      </a>
                    </div>
                    <div className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80 truncate">
                      {event.detail}
                    </div>
                  </li>
                ))}
                {grouped[b].length > 10 && (
                  <li className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
                    + {grouped[b].length - 10} more —{" "}
                    <Link to="/activity" className="underline underline-offset-4 hover:text-[var(--gold)]">
                      see all
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
