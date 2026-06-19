import { Link } from "@tanstack/react-router";
import {
  LP_POOL,
  ACCESS_RATE_LABEL,
  SALE_MIN_USDC,
} from "@/lib/syndicate-config";
import { NextMemberHero } from "./NextMemberHero";
import { track } from "@/lib/analytics";

const TRADE_URL = LP_POOL.traderJoeUrl;
const ADD_LIQ_URL = LP_POOL.addLiquidityUrl;



export function Hero() {


  return (
    <section

      id="top"
      className="relative overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div aria-hidden className="absolute inset-0 grid-bg" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-10 md:pt-16 pb-12 md:pb-16">
        {/* Live / Pending status rows */}
        <div className="hidden md:flex flex-col gap-2 mb-6 max-w-3xl">
          <StatusRow label="LIVE" tone="live" items={["SYN Token", "Membership Sale", "LP Pool", "USDC Routing"]} />
          <StatusRow label="PENDING" tone="pending" items={["Seat Record", "Governance", "Vault Contract", "AI Layer"]} />
        </div>
        <div className="md:hidden mb-5">
          <span className="mono inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            4 live · 4 pending — tap Verify to inspect
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.95] text-foreground">
          The <span className="text-gradient-gold">Syndicate</span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-foreground/90 leading-snug">
          A transparent on-chain protocol on Avalanche. Early members take{" "}
          <span className="font-semibold text-foreground">permanent seats</span>; every USDC routes publicly to
          <span className="font-semibold text-foreground"> Vault, Liquidity, and Operations</span>; the archive deepens with every chapter.
          Chapter I — Genesis Signal seals at <span className="font-semibold text-foreground">Member #333</span>.
        </p>

        <p className="mt-3 max-w-2xl text-xs md:text-sm text-muted-foreground leading-relaxed">
          No financial promise. No governance token. No rewards.
          SYN is the seat; Archive Artifacts are the live memory layer — The First Signal mints now on Avalanche, while the future SeatRecord721 identity record stays clearly marked PENDING.
          A seat is your identity in the story. The flywheel — routing, vault, liquidity, activity, chapters — is the product.
        </p>

        {/* Loop A canonical surface — extracted to NextMemberHero per P6. */}
        <NextMemberHero />


        {/* Primary action — one dominant CTA. Verify moved to utility rail
            per docs/FIRST_TIME_VISITOR_ACTION_AUDIT.md to preserve a single
            visual priority while keeping crypto-native actions discoverable. */}
        <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap items-stretch gap-2">
          <PrimaryCTA tone="gold" to="/join" onClick={() => track("claim_seat_click", { surface: "hero" })}>
            Join — become a member for ${SALE_MIN_USDC}
          </PrimaryCTA>
        </div>

        {/* Utility rail — the four crypto-native actions a first-time visitor
            scans for: Verify · Registry · Token · Liquidity. Visually quiet
            so they do not compete with Join, but always one click away. */}
        <nav aria-label="Protocol utility actions" className="mt-4 flex flex-wrap items-center gap-2 mono text-[10px] uppercase tracking-[0.18em]">
          <span className="text-muted-foreground/80 mr-1">Inspect</span>
          <Link to="/transparency" onClick={() => track("verify_click", { surface: "hero_rail" })} className="rounded border border-border/60 bg-background/35 px-2.5 py-1.5 hover:border-[var(--gold)]/60 hover:text-foreground text-muted-foreground">Verify</Link>
          <Link to="/registry" onClick={() => track("registry_click", { surface: "hero_rail" })} className="rounded border border-border/60 bg-background/35 px-2.5 py-1.5 hover:border-[var(--gold)]/60 hover:text-foreground text-muted-foreground">Registry</Link>
          <Link to="/token" className="rounded border border-border/60 bg-background/35 px-2.5 py-1.5 hover:border-[var(--gold)]/60 hover:text-foreground text-muted-foreground">Token</Link>
          <Link to="/liquidity" onClick={() => track("liquidity_click", { surface: "hero_rail" })} className="rounded border border-border/60 bg-background/35 px-2.5 py-1.5 hover:border-[var(--gold)]/60 hover:text-foreground text-muted-foreground">Liquidity</Link>
          <span className="text-border" aria-hidden>·</span>
          <a href={TRADE_URL} onClick={() => track("trade_syn_click", { surface: "hero_rail" })} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Trade on DEX ↗</a>
          <a href={ADD_LIQ_URL} onClick={() => track("add_liquidity_click", { surface: "hero_rail" })} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Add Liquidity ↗</a>
          <span className="text-border" aria-hidden>·</span>
          <Link to="/whitepaper" className="text-muted-foreground hover:text-foreground">Whitepaper →</Link>
        </nav>


        <div className="mt-4 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Fixed access rate · {ACCESS_RATE_LABEL} · Same rate for everyone
        </div>

      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 size-[700px] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-gold)" }}
      />
    </section>
  );
}

function StatusRow({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "live" | "pending";
  items: string[];
}) {
  const live = tone === "live";
  return (
    <div className="flex items-center flex-wrap gap-2">
      <span
        className={`mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] ${
          live
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        }`}
      >
        <span className={`size-1.5 rounded-full ${live ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
        {label}
      </span>
      {items.map((i) => (
        <span
          key={i}
          className={`mono text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded border ${
            live
              ? "border-emerald-500/30 text-foreground"
              : "border-amber-500/25 text-muted-foreground"
          }`}
        >
          {live ? "✓" : "○"} {i}
        </span>
      ))}
    </div>
  );
}

function PrimaryCTA({
  children,
  to,
  href,
  external,
  tone,
  onClick,
}: {
  children: React.ReactNode;
  to?: string;
  href?: string;
  external?: boolean;
  tone: "gold" | "navy" | "ghost";
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 whitespace-nowrap";
  const styles =
    tone === "gold"
      ? "text-[oklch(0.22_0.025_260)] hover:translate-y-[-1px]"
      : tone === "navy"
        ? "text-[var(--primary-foreground)] hover:translate-y-[-1px]"
        : "text-foreground border border-border/60 bg-card/60 hover:bg-card hover:border-[var(--gold)]/60";
  const style =
    tone === "gold"
      ? { background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow-gold)" }
      : tone === "navy"
        ? { background: "var(--gradient-navy)", boxShadow: "var(--shadow-glow-navy)" }
        : undefined;

  if (to) {
    return (
      <Link to={to as any} onClick={onClick} className={`${base} ${styles}`} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${base} ${styles}`}
      style={style}
    >
      {children}
    </a>
  );
}
