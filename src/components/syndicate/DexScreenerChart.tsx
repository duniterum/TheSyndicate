import { useEffect, useRef, useState } from "react";
import { LP_POOL } from "@/lib/syndicate-config";
import { GlassCard, Section, SectionHeader, StatusPill } from "./Primitives";

const DEXSCREENER_PAIR_URL = `https://dexscreener.com/avalanche/${LP_POOL.pairAddress}`;
const DEXSCREENER_EMBED_URL = `https://dexscreener.com/avalanche/${LP_POOL.pairAddress}?embed=1&theme=dark&info=0&trades=0`;

/**
 * DEXScreener iframe — lazy-mounted only when scrolled into view to keep
 * initial paint fast and avoid a third-party render on every navigation.
 */
export function DexScreenerChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <Section id="chart">
      <SectionHeader
        eyebrow="Price Chart"
        title={<>Live <span className="text-gradient-gold">SYN/USDC</span> chart on DEXScreener</>}
        description="Rendered by DEXScreener directly from the Trader Joe AMM pair. Loads when scrolled into view so the rest of the page paints instantly."
      />
      <GlassCard className="p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <StatusPill status="LIVE" />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground truncate">
              {LP_POOL.pair} · {LP_POOL.dex}
            </span>
          </div>
          <a
            href={DEXSCREENER_PAIR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)] shrink-0"
          >
            Open on DEXScreener ↗
          </a>
        </div>
        <div ref={ref} className="relative w-full bg-muted/20" style={{ paddingTop: "62%" }}>
          {visible ? (
            <iframe
              src={DEXSCREENER_EMBED_URL}
              title="DEXScreener SYN/USDC chart"
              loading="lazy"
              className="absolute inset-0 w-full h-full border-0"
              allow="clipboard-write"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Chart loads on scroll…
            </div>
          )}
        </div>
        <p className="px-4 py-3 text-[11px] text-muted-foreground border-t border-border/40">
          Volume, 24h candles, holder count, and txn count are{" "}
          <span className="mono uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">
            Indexer · PENDING
          </span>{" "}
          until DEXScreener completes indexing.
        </p>
      </GlassCard>
    </Section>
  );
}
