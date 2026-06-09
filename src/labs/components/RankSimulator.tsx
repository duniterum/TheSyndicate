import { useMemo, useState } from "react";
import { RANKS_V2, ACCESS_RATE_USDC_PER_SYN, rankForUsdc, vaultFlow } from "@/lib/syndicate-config";



export function RankSimulator() {
  const [open, setOpen] = useState(false);
  const [usdc, setUsdc] = useState(50);

  const calc = useMemo(() => {
    const syn = usdc / ACCESS_RATE_USDC_PER_SYN;
    const { current, next } = rankForUsdc(usdc);
    const f = vaultFlow(usdc);
    const gapUsdc = next ? Math.max(0, next.usdc - usdc) : 0;
    const gapSyn = gapUsdc / ACCESS_RATE_USDC_PER_SYN;
    const pctToNext = next && current
      ? Math.min(100, Math.max(0, ((usdc - current.usdc) / (next.usdc - current.usdc)) * 100))
      : 100;
    const archiveNo = 428 + Math.floor((usdc / 5) % 7);
    const score = Math.round(40 + Math.log10(Math.max(usdc, 1)) * 60);
    return { syn, current, next, vault: f.vault, lp: f.lp, ops: f.ops, gapUsdc, gapSyn, pctToNext, archiveNo, score };
  }, [usdc]);

  const fmt = (n: number) => (n < 100 ? `$${n.toFixed(2).replace(/\.00$/, "")}` : `$${Math.round(n).toLocaleString("en-US")}`);
  const fmtSyn = (n: number) => `${Math.round(n).toLocaleString("en-US")} SYN`;


  return (
    <>
      {/* Floating launch button (desktop + mobile) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 hidden md:inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg"
        style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow-gold)" }}
      >
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-[oklch(0.22_0.025_260)]">
          {open ? "Close" : "Simulate Rank"}
        </span>
      </button>

      {/* Mobile bottom bar trigger */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur p-3 flex gap-2">
        <button
          onClick={() => setOpen(true)}
          className="flex-1 rounded-md px-3 py-2.5 text-sm font-medium"
          style={{ background: "var(--gradient-gold)" }}
        >
          Reserve Founder Rank
        </button>
        <a
          href="#vault"
          className="rounded-md border border-border px-3 py-2.5 text-sm"
        >
          Vault
        </a>
      </div>

      {/* Panel */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
          />
          <aside
            className="fixed z-50 bg-[var(--card)] shadow-2xl border border-border/60
                       inset-x-3 bottom-20 rounded-xl
                       md:inset-auto md:bottom-20 md:right-5 md:w-[380px] md:rounded-xl"
          >
            <div className="p-5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">
                    Join / Rank Simulator
                  </div>
                  <div className="text-base font-semibold mt-0.5">Reserve your Founder Rank</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground mono uppercase tracking-[0.18em]"
                >
                  Close ✕
                </button>
              </div>

              <label className="block mt-2">
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                  USDC amount
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 mono text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={usdc}
                    onChange={(e) => setUsdc(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full rounded-md border border-border bg-background pl-7 pr-3 py-2.5 mono text-lg font-semibold focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </label>

              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {[5, 10, 25, 50, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() => setUsdc(v)}
                    className="mono text-[10px] uppercase tracking-[0.15em] rounded-md border border-border/70 py-1.5 hover:border-[var(--gold)]/60"
                  >
                    ${v}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-md border border-border/60 bg-panel/40 p-3 space-y-2">
                <Row label="SYN received" value={fmtSyn(calc.syn)} accent="gold" />
                <Row label="Rank unlocked" value={calc.current?.name ?? "Below Citizen"} accent="navy" />
                <Row
                  label="Next rank gap"
                  value={calc.next ? `${fmt(calc.gapUsdc)} → ${calc.next.name}` : "Top tier"}
                />
              </div>


              {calc.next && (
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-border/50 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${calc.pctToNext}%`, background: "var(--gradient-gold)" }} />
                  </div>
                  <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
                    {calc.pctToNext.toFixed(1)}% to {calc.next.name}
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-md border border-dashed border-border/70 p-3">
                <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Vault flow on {fmt(usdc)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Split label="70% Vault" value={fmt(calc.vault)} tone="gold" />
                  <Split label="20% Liquidity" value={fmt(calc.lp)} tone="navy" />
                  <Split label="10% Ops" value={fmt(calc.ops)} />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniStat label="Founder Archive" value={`#${calc.archiveNo}`} />
                <MiniStat label="Archive Weight" value={`${calc.score}`} />
              </div>

              <button
                className="mt-4 w-full rounded-md px-3 py-3 text-sm font-medium"
                style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow-gold)" }}
              >
                Reserve Founder Rank
              </button>
              <a
                href="#vault"
                onClick={() => setOpen(false)}
                className="mt-2 block text-center rounded-md border border-border px-3 py-2.5 text-sm"
              >
                View Vault Flow
              </a>
              <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
                Prototype simulator · Payment contract pending. Utility access, not equity, dividends, or guaranteed return.
              </p>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: "gold" | "navy" }) {
  const cls = accent === "gold" ? "text-gradient-gold" : accent === "navy" ? "text-foreground" : "";
  return (
    <div className="flex items-center justify-between">
      <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className={`mono text-sm font-semibold ${cls}`}>{value}</span>
    </div>
  );
}

function Split({ label, value, tone }: { label: string; value: string; tone?: "gold" | "navy" }) {
  const cls = tone === "gold" ? "text-gradient-gold" : tone === "navy" ? "text-foreground" : "";
  return (
    <div>
      <div className={`mono text-sm font-semibold ${cls}`}>{value}</div>
      <div className="mono text-[9px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 p-2.5">
      <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mono text-base font-semibold mt-0.5">{value}</div>
    </div>
  );
}
