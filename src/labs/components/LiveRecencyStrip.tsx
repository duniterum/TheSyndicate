// Live Recency Strip — Wave Positioning.
//
// A calm, minimal heartbeat that sits directly below the hero. Three honest
// facts, each derived from on-chain reads via useProtocolPulse:
//
//   1. Members recorded         (live buyer count from sale contract)
//   2. Last join                 ("Member #N · ~Xm ago")
//   3. Current chapter forming   (derived from nextMemberNumber)
//
// No ticker. No animation. No hype. No scarcity. Truth, quietly.
//
// Rule (VISION.md MOMENTUM PRINCIPLE):
//   We show what happened, never what sells. Truth creates trust.

import { Link } from "@tanstack/react-router";
import { useProtocolPulse, formatAgo } from "@/lib/protocol-pulse";

type Chapter = {
  name: string;
  range: string;
  filled: boolean;
};

function chapterForNext(n: number | undefined): Chapter {
  if (n === undefined)    return { name: "Genesis Signal",     range: "#1 – #333",         filled: false };
  if (n <= 333)           return { name: "Genesis Signal",     range: "#1 – #333",         filled: false };
  if (n <= 1_000)         return { name: "First Thousand",     range: "#334 – #1,000",     filled: false };
  if (n <= 3_333)         return { name: "The Expansion",      range: "#1,001 – #3,333",   filled: false };
  if (n <= 10_000)        return { name: "First Ten Thousand", range: "#3,334 – #10,000",  filled: false };
  return { name: "Open Era", range: "#10,001 +", filled: false };
}

export function LiveRecencyStrip() {
  const p = useProtocolPulse();
  const members = p.buyers;
  const next = p.nextMemberNumber;
  const lastN = next !== undefined && next > 1 ? next - 1 : undefined;
  const ago = formatAgo(p.lastBuyAgoSeconds);
  const chapter = chapterForNext(next);

  return (
    <section
      aria-label="Protocol heartbeat"
      className="border-y border-border/40 bg-background/60 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-3 md:py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-6">
          {/* Heartbeat indicator + canonical line */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"
              aria-hidden
            />
            <p className="mono text-[11px] md:text-xs uppercase tracking-[0.16em] text-foreground/85 truncate">
              {members !== undefined ? (
                <>
                  <Link
                    to="/members"
                    className="text-foreground hover:text-[var(--gold)] transition-colors"
                  >
                    {members.toLocaleString()} {members === 1 ? "Member" : "Members"} recorded
                  </Link>
                  <span className="text-muted-foreground"> · permanently onchain</span>
                </>
              ) : (
                <span className="text-muted-foreground">Reading the chain…</span>
              )}
            </p>
          </div>

          {/* Recency facts */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mono text-[10.5px] md:text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <Fact
              label="Last join"
              value={
                lastN !== undefined && p.lastBuyAgoSeconds !== undefined
                  ? `Member #${lastN} · ${ago}`
                  : lastN !== undefined
                    ? `Member #${lastN}`
                    : "Awaiting first join"
              }
              to="/activity"
            />
            <span aria-hidden className="hidden md:inline text-border">·</span>
            <Fact
              label="Chapter"
              value={`${chapter.name} forming · ${chapter.range}`}
              to="/chapters"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value, to }: { label: string; value: string; to: string }) {
  return (
    <Link
      to={to as any}
      className="group inline-flex items-baseline gap-1.5 hover:text-foreground transition-colors"
    >
      <span className="text-foreground/45 group-hover:text-foreground/70">{label}:</span>
      <span className="text-foreground/85 group-hover:text-foreground">{value}</span>
    </Link>
  );
}
