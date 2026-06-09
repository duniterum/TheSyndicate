import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { GlassCard, Pill } from "@/components/syndicate/Primitives";

const KEY = "syn_start_here_dismissed_v1";

/**
 * StartHereCard — first-visit orientation card shown above the fold on the
 * homepage. Mirrors the IR "Start Here" pattern: tells a new visitor exactly
 * where to go next (verify, learn, join). Dismissed forever once closed.
 */
export function StartHereCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      // ignore — private mode, etc.
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  };

  const stops: { label: string; to: string; desc: string }[] = [
    { label: "Verify everything", to: "/transparency", desc: "Live contracts, wallets, flows" },
    { label: "Read the protocol", to: "/whitepaper", desc: "How USDC enters and routes" },
    { label: "Join The Syndicate", to: "/join", desc: "Mint SYN, hold rank, participate" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 pt-4">
      <GlassCard className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Pill tone="gold">Start here</Pill>
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              First visit · 30 seconds
            </span>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss start here card"
            className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            Dismiss ✕
          </button>
        </div>

        <p className="mt-3 text-sm md:text-base text-foreground/85 leading-relaxed max-w-3xl">
          The Syndicate is a transparent on-chain protocol — not a token sale,
          not a yield product. Three stops cover everything you need:
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {stops.map((s, i) => (
            <Link
              key={s.to}
              to={s.to as any}
              className="surface elevated p-4 hover:border-[var(--gold)]/40 transition-colors group"
            >
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Step {i + 1}
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground group-hover:text-[var(--gold)]">
                {s.label} →
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
            </Link>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}
