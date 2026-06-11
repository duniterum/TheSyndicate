import { Link } from "@tanstack/react-router";
import { HOME_RANK_LADDER } from "@/lib/syndicate-config";
import { useHolderIndex } from "@/lib/holder-index";
import { Section, SectionHeader, StatusPill } from "@/components/syndicate/Primitives";

const fmt = (n: number) => n.toLocaleString("en-US");

export function HomeRankLadder() {
  const idx = useHolderIndex();

  return (
    <Section id="home-ranks">
      <SectionHeader
        eyebrow="Ranks"
        title={<>Public <span className="text-gradient-gold">rank ladder</span></>}
        description="Twelve public tiers, from Citizen at $5 to Cornerstone at $10,000. Rank is derived from cumulative USDC contributed — no tier gives cheaper SYN, only visibility and status."
      />
      <div className="mb-3 flex items-center gap-2">
        <StatusPill status={idx.hasData ? "LIVE" : "PENDING"} />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {idx.hasData
            ? `${idx.totals.members} member${idx.totals.members === 1 ? "" : "s"} across ranks`
            : "Awaiting first member"}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {HOME_RANK_LADDER.map((r) => {
          const accent =
            r.group === "keystone"
              ? "border-[var(--gold)]/50 bg-[var(--gold)]/5"
              : r.group === "deep"
              ? "border-[var(--navy)]/30 bg-[var(--navy)]/5"
              : "border-border/60";
          const count = idx.totals.rankDistribution[r.name] ?? 0;
          return (
            <Link
              key={r.name}
              to="/ranks"
              className={`surface elevated p-3 flex flex-col gap-1 hover:border-[var(--gold)]/40 transition-colors ${accent}`}
            >
              <div className="flex items-center justify-between">
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  ${fmt(r.usdc)}
                </div>
                {idx.hasData && count > 0 ? (
                  <span className="mono text-[10px] font-semibold text-[var(--gold)]">
                    {count}
                  </span>
                ) : null}
              </div>
              <div className="text-sm font-semibold leading-tight">{r.name}</div>
              <div className="mono text-[10px] text-muted-foreground">{fmt(r.syn)} SYN</div>
            </Link>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Keystone tiers ($2,500+) include manual review. See full benefits on the <Link to="/ranks" className="underline underline-offset-2 hover:text-foreground">Ranks page</Link>.
      </p>
    </Section>
  );
}
