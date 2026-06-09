export function DemoBanner() {
  return (
    <div className="w-full border-b border-border/60 bg-panel/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="mono uppercase tracking-[0.18em] text-[10px] text-emerald-700">
            SYN + Membership Sale live on Avalanche
          </span>
          <span className="text-muted-foreground hidden sm:inline">
            Every contract, wallet, and balance is public — verify any number on-chain.
          </span>
        </div>
        <a
          href="/registry"
          className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          Protocol Registry →
        </a>
      </div>
    </div>
  );
}
