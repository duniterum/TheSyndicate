export function DemoBanner() {
  return (
    <div className="w-full border-b border-border bg-panel/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="size-1.5 rounded-full pulse-dot" style={{ background: "var(--success)" }} />
          <span className="mono uppercase tracking-[0.2em] text-[10px]" style={{ color: "var(--success)" }}>
            SYN + Membership Sale live on Avalanche
          </span>
          <span className="text-muted-foreground hidden sm:inline">
            Every contract, wallet, and balance is public — verify any number on-chain.
          </span>
        </div>
        <a
          href="/registry"
          className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-[color:var(--accent)] transition-colors"
        >
          Protocol Registry →
        </a>
      </div>
    </div>
  );
}
