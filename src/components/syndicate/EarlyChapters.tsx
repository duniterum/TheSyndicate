import { Section, SectionHeader, GlassCard, StatusPill, type CanonicalStatus } from "./Primitives";
import { useHolderIndex } from "@/lib/holder-index";
import { useChainTime, WINDOW_24H } from "@/lib/chain-time";
import { CHAPTERS as CANONICAL_CHAPTERS, type Chapter as CanonicalChapter } from "@/lib/chapters";

/**
 * EarlyChapters — visible early-formation chapters / badges.
 *
 * Phase E (member identity). Honest framing: chapters are participation
 * markers tied to onchain join order — they unlock visibility and archive
 * recognition, never bonus tokens, payouts, or yield.
 *
 * Wave 3A momentum: each chapter shows seats remaining, progress %, and
 * recent joins (24h) — never estimated dates, never speculative countdowns.
 *
 * Source of chapter ranges/labels: src/lib/chapters.ts (canonical doctrine).
 * The Open Era (#10,001+) is intentionally omitted from this early-chapters
 * surface; it is shown on /chapters and in the protocol roadmap instead.
 */
const EARLY: ReadonlyArray<CanonicalChapter> = CANONICAL_CHAPTERS.filter(
  (c) => c.id !== "open-era",
);

const CHAPTER_DESCRIPTION: Record<string, string> = {
  "genesis-signal":
    "The founding cohort. Permanent archive recognition, deepest chapter ID.",
  "first-thousand":
    "The first public formation milestone — the protocol reaches one thousand members.",
  "the-expansion":
    "The protocol moves from early formation to a visible community.",
  "first-ten-thousand":
    "Closes the founding archive. Chapter assignments freeze when this fills.",
};

export function EarlyChapters() {
  const idx = useHolderIndex();
  const chainTime = useChainTime();
  const buyers = idx.isLoading && !idx.hasData ? undefined : idx.totals.members;

  // Joins in last 24h per chapter — derived from the ordered member list.
  const joins24hByChapter = (() => {
    const out: Record<string, number> = {};
    if (chainTime.tipUnix === undefined) return out;
    const cutoff = chainTime.tipUnix - WINDOW_24H;
    for (const m of idx.ordered) {
      const t = chainTime.blockToUnix(m.firstPurchaseBlock);
      if (t === undefined || t < cutoff) continue;
      out[m.chapter] = (out[m.chapter] ?? 0) + 1;
    }
    return out;
  })();

  function chapterDetail(c: CanonicalChapter): {
    status: CanonicalStatus;
    meta: string;
    seatsLeft: number | undefined;
    progressPct: number | undefined;
    recent: number | undefined;
  } {
    const recent = joins24hByChapter[c.id];
    const chapterSize = c.capacity ?? 0;
    const endN = c.endN ?? Number.POSITIVE_INFINITY;
    if (buyers === undefined) {
      return { status: "PENDING", meta: "Awaiting first buyer onchain", seatsLeft: undefined, progressPct: undefined, recent };
    }
    if (buyers >= endN) {
      return { status: "LIVE", meta: "Chapter sealed", seatsLeft: 0, progressPct: 100, recent };
    }
    if (buyers >= c.startN) {
      const taken = buyers - (c.startN - 1);
      const left = chapterSize - taken;
      return {
        status: "PARTIAL",
        meta: `${taken.toLocaleString("en-US")} / ${chapterSize.toLocaleString("en-US")} taken · ${left.toLocaleString("en-US")} seat${left === 1 ? "" : "s"} left`,
        seatsLeft: left,
        progressPct: Math.round((taken / chapterSize) * 100),
        recent,
      };
    }
    return {
      status: "PARTIAL",
      meta: `Opens at member #${c.startN.toLocaleString("en-US")}`,
      seatsLeft: chapterSize,
      progressPct: 0,
      recent,
    };
  }

  return (
    <Section id="early-chapters">
      <SectionHeader
        eyebrow="Early chapters"
        title={
          <>
            The first four <span className="text-gradient-gold">chapters</span>
          </>
        }
        description="Chapters reflect onchain join order, nothing else. They unlock archive visibility and shareable identity assets — never bonus tokens, payouts, or yield. Status and seats update live; no projected dates, no estimated growth."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EARLY.map((c) => {
          const d = chapterDetail(c);
          return (
            <GlassCard key={c.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Members {c.range}
                </div>
                <StatusPill status={d.status} />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-foreground tracking-tight">
                {c.shortLabel}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {CHAPTER_DESCRIPTION[c.id] ?? c.blurb}
              </p>

              {d.progressPct !== undefined && (
                <div className="mt-3">
                  <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
                    <div
                      className="h-full bg-[var(--gold)]/80"
                      style={{ width: `${Math.max(2, d.progressPct)}%` }}
                    />
                  </div>
                  <div className="mt-1 mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                    {d.progressPct}% filled
                  </div>
                </div>
              )}

              <div className="mt-3 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {d.meta}
              </div>

              {d.recent !== undefined && d.recent > 0 && (
                <div
                  className="mt-1 mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]"
                  title="Joins in the last 24 hours, calculated from TokensPurchased events with first-seen-per-wallet."
                >
                  +{d.recent} in last 24h
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      <p className="mt-6 max-w-3xl text-xs text-muted-foreground leading-relaxed">
        Chapter assignment is derived from onchain join order via the Membership
        Sale contract. Recency figures are calculated from on-chain purchase
        events; no dates are projected and no growth is estimated.
      </p>
    </Section>
  );
}
