// ─── Editorial Hero (Wave 2) ──────────────────────────────────────────────
// Museum-archive direction inspired by Museum Plus (Sick Agency) + Kuldmuna
// Arhiiv (NOPE Creative). Light-mode-first, dark-aware. Instrument Serif
// headline, gold seal accent, 2 CTAs, 4 trust pillars row.

import { Link } from "@tanstack/react-router";
import { SALE_MIN_USDC } from "@/lib/syndicate-config";
import { track } from "@/lib/analytics";

const PILLARS = [
  { label: "Curated", caption: "by founders" },
  { label: "Secured", caption: "on-chain" },
  { label: "Preserved", caption: "in the archive" },
  { label: "Verifiable", caption: "by anyone" },
];

export function EditorialHero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Subtle paper grain — light mode reads as warm off-white */}
      <div aria-hidden className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-20 pb-14 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-start">
          {/* LEFT — editorial headline + brand line + CTAs */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              {/* Gold seal mark */}
              <span
                aria-hidden
                className="relative inline-flex items-center justify-center size-12 rounded-full"
                style={{
                  background: "var(--gradient-gold)",
                  boxShadow: "var(--shadow-glow-gold)",
                }}
              >
                <span className="font-serif text-xl font-semibold text-[#1a1a1a]">S</span>
              </span>
              <span className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                On-Chain Membership Protocol
              </span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.02] text-foreground">
              The Syndicate.
            </h1>

            <p
              className="mt-5 font-serif text-2xl md:text-3xl leading-snug"
              style={{ color: "var(--gold)" }}
            >
              SYN is the seat.{" "}
              <em className="italic font-normal text-foreground/85">
                Artifacts are the memory.
              </em>
            </p>

            <p className="mt-6 max-w-xl text-base md:text-lg text-foreground/80 leading-relaxed">
              A transparent on-chain protocol on Avalanche. Early members take{" "}
              <span className="font-medium text-foreground">permanent seats</span>.
              Every USDC routes publicly to Vault, Liquidity, and Operations.
              The archive deepens with every chapter.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/join"
                onClick={() => track("claim_seat_click", { surface: "editorial_hero" })}
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-medium tracking-wide transition-all duration-200 text-[#1a1a1a] hover:-translate-y-[1px]"
                style={{
                  background: "var(--gradient-gold)",
                  boxShadow: "var(--shadow-glow-gold)",
                }}
              >
                Join The Syndicate — ${SALE_MIN_USDC} USDC →
              </Link>
              <Link
                to="/transparency"
                onClick={() => track("verify_click", { surface: "editorial_hero" })}
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-medium tracking-wide transition-colors border"
                style={{
                  borderColor: "var(--verify)",
                  color: "var(--verify)",
                  background: "transparent",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Verify On-chain
              </Link>
            </div>

            <div className="mt-5 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Live on Avalanche · Same rate for everyone · Every transaction verifiable
            </div>
          </div>

          {/* RIGHT — vertical typography spec (museum plaque feel) */}
          <aside
            className="hidden lg:block w-[280px] border-l pl-8 self-stretch"
            style={{ borderColor: "var(--border)" }}
            aria-hidden
          >
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
              Brand Mark
            </div>
            <div className="font-serif text-2xl leading-tight text-foreground">
              The Syndicate
            </div>
            <div className="mt-1 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              est. on-chain · Avalanche
            </div>

            <div
              className="my-6 h-px"
              style={{ background: "var(--border)" }}
            />

            <div className="space-y-3 mono text-[11px] text-muted-foreground">
              <div className="flex justify-between gap-3">
                <span>Network</span>
                <span className="text-foreground">Avalanche C-Chain</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Rate</span>
                <span className="text-foreground">0.01 USDC / SYN</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Routing</span>
                <span className="text-foreground">70 / 20 / 10</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Status</span>
                <span style={{ color: "var(--success)" }}>● Live</span>
              </div>
            </div>
          </aside>
        </div>

        {/* PILLARS — Curated · Secured · Preserved · Verifiable */}
        <div
          className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-8 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          {PILLARS.map((p) => (
            <div key={p.label} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-1 size-2 rounded-full"
                style={{ background: "var(--gold)" }}
              />
              <div>
                <div className="font-serif text-lg text-foreground leading-none">
                  {p.label}
                </div>
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
                  {p.caption}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Soft gold glow anchor */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-32 size-[520px] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-gold)" }}
      />
    </section>
  );
}
