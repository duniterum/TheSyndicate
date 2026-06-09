// HomeMetricsStrip — reads exclusively from the Protocol Truth Layer.
// No raw hook calls, no formatUnits, no per-component status classification.
// Every tile derives label + value + status + verify link from TRUTH.

import { Link } from "@tanstack/react-router";
import { useProtocolTruth, statusPillClasses, fmtUsd, fmtCount, fmtSyn, type Fact } from "@/lib/protocol-truth";
import { Section, SectionHeader } from "@/components/syndicate/Primitives";

type Tile = {
  fact: Fact<number>;
  display: string;
  hint: string;
};

export function HomeMetricsStrip() {
  const T = useProtocolTruth();
  const tiles: Tile[] = [
    { fact: T.usdcRaised,    display: fmtUsd(T.usdcRaised.value),                  hint: "Cumulative USDC into the sale contract." },
    { fact: T.synSold,       display: fmtSyn(T.synSold.value),                     hint: "SYN distributed at the fixed 1 SYN = $0.01 rate." },
    { fact: T.members,       display: fmtCount(T.members.value),                   hint: "Unique wallets that have purchased SYN." },
    { fact: T.purchaseCount, display: fmtCount(T.purchaseCount.value),             hint: "On-chain TokensPurchased events." },
  ];
  return (
    <Section id="home-metrics">
      <SectionHeader
        eyebrow="Protocol Metrics"
        title={<>What has happened <span className="text-gradient-gold">so far</span></>}
        description="Every number reads from the Protocol Truth Layer — one canonical source, one classification, one verify link."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => <MetricTile key={t.fact.key} t={t} />)}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Verify every metric on the <Link to="/registry" className="underline underline-offset-2 hover:text-foreground">Protocol Registry</Link>.
      </p>
    </Section>
  );
}

function MetricTile({ t }: { t: Tile }) {
  const pill = statusPillClasses(t.fact.status);
  return (
    <div className="surface elevated p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t.fact.label}</div>
        <span className={`mono shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] ${pill.border}`}>
          <span className={`size-1 rounded-full ${pill.dot}`} />
          {t.fact.status}
        </span>
      </div>
      <div className="mono text-xl md:text-2xl font-semibold leading-none text-foreground">{t.display}</div>
      <div className="text-[11px] text-muted-foreground leading-snug">{t.hint}</div>
      {t.fact.verifyHref && (
        <a href={t.fact.verifyHref} target="_blank" rel="noopener noreferrer" className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground underline underline-offset-2">
          verify ↗
        </a>
      )}
    </div>
  );
}
