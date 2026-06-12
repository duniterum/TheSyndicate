import { ReactNode, useEffect, useRef, useState } from "react";

export function GlassCard({
  children,
  className = "",
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: "gold" | "navy";
}) {
  const glowCls = glow === "gold" ? "glow-border-gold" : glow === "navy" ? "glow-border-navy" : "";
  return <div className={`glass-card ${glowCls} p-6 ${className}`}>{children}</div>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-4xl ${align === "center" ? "mx-auto text-center" : ""} mb-14`}>
      {eyebrow && (
        <div
          className={`mono text-[12px] uppercase tracking-[0.26em] mb-6 ${align === "left" ? "border-l-2 pl-3" : ""}`}
          style={{ color: "var(--accent)", borderColor: align === "left" ? "var(--accent)" : undefined }}
        >
          {eyebrow}
        </div>
      )}
      <h2 className="font-serif text-fluid-h2 font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-6 text-lg md:text-xl text-foreground/80 leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
}

/** Animated counter that tweens to its target. Re-animates when value changes. */
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1400,
  format = (n: number) => n.toLocaleString("en-US"),
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          animateTo(value, duration);
        }
      });
    }, { threshold: 0.2 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, duration]);

  useEffect(() => {
    if (!started.current) return;
    if (value === prevValue.current) return;
    animateTo(value, 350); // quick live refresh
    prevValue.current = value;
  }, [value]);

  function animateTo(target: number, dur: number) {
    const from = n;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(from + (target - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return (
    <span ref={ref} className="mono tabular-nums">
      {prefix}
      {format(Math.round(n))}
      {suffix}
    </span>
  );
}

/** Blinking live timestamp with terminal feel. */
export function LiveTimestamp({ date, className = "" }: { date: Date; className?: string }) {
  const [hydrated, setHydrated] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => {
    setHydrated(true);
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const iso = date.toISOString().replace("T", " ").slice(0, 19);
  const showBlink = hydrated && Date.now() - date.getTime() < 6000;

  return (
    <span className={`mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1.5 ${className}`} suppressHydrationWarning>
      <span
        suppressHydrationWarning
        className={`size-1.5 rounded-full ${showBlink ? "bg-[var(--success)] pulse-dot" : "bg-border"}`}
      />
      <span suppressHydrationWarning>{iso} UTC</span>
    </span>
  );
}

/** Small terminal-style status bar. */
export function StatusBar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  trend,
  verifyHref = "#",
  accent = "gold",
  live = true,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: ReactNode;
  verifyHref?: string;
  accent?: "gold" | "navy";
  live?: boolean;
}) {
  return (
    <div className="surface flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="mono text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </div>
        {live && (
          <span className="flex items-center gap-1.5 text-[11px] mono text-[var(--success)]">
            <span className="size-1.5 rounded-full bg-[var(--success)] pulse-dot" />
            LIVE
          </span>
        )}
      </div>
      <div
        className={`amount-xl ${
          accent === "gold" ? "text-gradient-gold" : "text-gradient-navy"
        }`}
      >
        {value}
      </div>
      {hint && <div className="text-sm text-muted-foreground leading-relaxed">{hint}</div>}
      {trend && <div className="mt-1">{trend}</div>}
      <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
        {verifyHref && verifyHref !== "#" ? (
          <a
            href={verifyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--verify)] hover:text-[var(--gold)] transition-colors"
          >
            Verify on-chain ↗
          </a>
        ) : (
          <span className="mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Awaiting indexer
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Amount — the canonical display number for any large value on the site
 * (treasury totals, USDC routed, member count, milestone tally, etc.).
 * Three sizes: lg (cards / inline), xl (section anchors), hero (headline).
 */
export function Amount({
  children,
  size = "xl",
  accent = "gold",
  className = "",
}: {
  children: ReactNode;
  size?: "lg" | "xl" | "hero";
  accent?: "gold" | "navy" | "plain";
  className?: string;
}) {
  const sizeCls =
    size === "hero" ? "amount-hero" : size === "xl" ? "amount-xl" : "amount-lg";
  const accentCls =
    accent === "gold"
      ? "text-gradient-gold"
      : accent === "navy"
      ? "text-gradient-navy"
      : "text-foreground";
  return (
    <span className={`${sizeCls} ${accentCls} ${className}`}>
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  max = 100,
  tone = "gold",
}: {
  value: number;
  max?: number;
  tone?: "gold" | "navy";
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-border/50 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: tone === "gold" ? "var(--gradient-gold)" : "var(--gradient-navy)",
        }}
      />
    </div>
  );
}

export function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "gold" | "navy" | "success" | "warning" | "danger";
}) {
  const cls =
    tone === "gold"
      ? "border-[color:color-mix(in_oklab,var(--accent)_45%,transparent)] text-[color:var(--accent)] bg-[color:color-mix(in_oklab,var(--accent)_10%,transparent)]"
      : tone === "navy"
      ? "border-border/60 text-foreground/80 bg-muted/30"
      : tone === "success"
      ? "border-[var(--success)]/40 text-[color:oklch(0.42_0.16_155)] bg-[var(--success)]/10"
      : tone === "warning"
      ? "border-[color:oklch(0.78_0.14_75/0.5)] text-[color:oklch(0.5_0.13_75)] bg-[color:oklch(0.78_0.14_75/0.08)]"
      : tone === "danger"
      ? "border-[color:oklch(0.6_0.2_25/0.5)] text-[color:oklch(0.5_0.2_25)] bg-[color:oklch(0.6_0.2_25/0.08)]"
      : "border-border/60 text-muted-foreground bg-muted/30";
  return (
    <span
      className={`mono inline-flex items-center gap-1.5 rounded-[3px] border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${cls}`}
    >
      {children}
    </span>
  );
}

/**
 * Canonical status vocabulary — the ONLY allowed values site-wide.
 *   LIVE    · backed by an onchain read or deployed contract
 *   DERIVED · computed deterministically from on-chain reads (e.g. market cap from price × supply)
 *   PARTIAL · live data, partial coverage (e.g. counted onchain, leaderboard pending)
 *   PENDING · contract / module not yet deployed
 *   DEMO    · illustrative preview, behind a clearly labeled demo surface
 */
export type CanonicalStatus = "LIVE" | "DERIVED" | "PARTIAL" | "PENDING" | "DEMO";

const STATUS_TONE: Record<CanonicalStatus, "success" | "warning" | "muted" | "navy"> = {
  LIVE: "success",
  DERIVED: "navy",
  PARTIAL: "warning",
  PENDING: "muted",
  DEMO: "navy",
};

const STATUS_HINT: Record<CanonicalStatus, string> = {
  LIVE: "Backed by an onchain read or deployed contract.",
  DERIVED: "Computed deterministically from on-chain reads.",
  PARTIAL: "Live data, partial coverage today.",
  PENDING: "Contract or module not yet deployed.",
  DEMO: "Illustrative preview, not live data.",
};

export function StatusPill({ status, withDot = true }: { status: CanonicalStatus; withDot?: boolean }) {
  return (
    <span title={STATUS_HINT[status]}>
      <Pill tone={STATUS_TONE[status]}>
        {withDot && status === "LIVE" && (
          <span className="size-1.5 rounded-full bg-[var(--success)] pulse-dot" />
        )}
        {status}
      </Pill>
    </span>
  );
}

export function CTAButton({
  children,
  variant = "gold",
  href = "#join",
  className = "",
}: {
  children: ReactNode;
  variant?: "gold" | "navy" | "ghost";
  href?: string;
  className?: string;
}) {
  const base =
    "mono inline-flex items-center justify-center gap-2 rounded-[3px] px-6 py-3.5 text-[13px] uppercase tracking-[0.14em] transition-all duration-200 whitespace-nowrap";
  const styles =
    variant === "gold"
      ? "font-bold hover:brightness-110"
      : variant === "navy"
      ? "font-semibold text-foreground border border-border hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
      : "font-medium text-muted-foreground hover:text-foreground";
  const style =
    variant === "gold"
      ? { background: "var(--accent)", color: "var(--accent-foreground)", boxShadow: "var(--shadow-glow-gold)" }
      : undefined;
  return (
    <a href={href} className={`${base} ${styles} ${className}`} style={style}>
      {children}
    </a>
  );
}

/**
 * Canonical site rhythm — every section across the site MUST go through this primitive.
 *
 *   width:
 *     "data"      → max-w-7xl  (dashboards, metric grids, archive universe — default)
 *     "editorial" → max-w-6xl  (hero blocks, showcases, narrative spreads)
 *     "narrow"    → max-w-3xl  (long-form copy, docs/whitepaper body)
 *
 *   horizontal padding: px-5 md:px-8   (mobile 20px → desktop 32px) — same everywhere
 *   vertical padding:   py-16 md:py-24 (mobile 64px → desktop 96px) — same everywhere
 *
 * Do not re-roll a custom `mx-auto max-w-* px-* py-*` wrapper in a new section.
 * Use <Section width="editorial"> instead so the whole site shares one rhythm.
 */
export function Section({
  id,
  children,
  className = "",
  width = "data",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  width?: "data" | "editorial" | "narrow";
}) {
  const maxW =
    width === "editorial" ? "max-w-6xl" : width === "narrow" ? "max-w-3xl" : "max-w-7xl";
  return (
    <section
      id={id}
      className={`relative mx-auto w-full ${maxW} px-5 md:px-8 py-16 md:py-24 ${className}`}
    >
      {children}
    </section>
  );
}

export function ShortAddress({ addr }: { addr: string }) {
  return (
    <span className="mono text-[11px]">
      {addr.slice(0, 6)}…{addr.slice(-4)}
    </span>
  );
}

/**
 * Standard crypto-row chrome for any onchain address.
 * Shows short address, copy button, and an explorer link.
 * `extra` slots accept Dexscreener / Trader Joe / Sourcify chips.
 */
export function ContractLink({
  address,
  explorerHref,
  label,
  extras = [],
  className = "",
}: {
  address: string;
  explorerHref?: string | null;
  label?: string;
  extras?: Array<{ label: string; href: string }>;
  className?: string;
}) {
  const isLive = /^0x[a-fA-F0-9]{40}$/.test(address);
  if (!isLive) {
    return (
      <span className={`mono text-xs text-muted-foreground ${className}`}>
        {label ? `${label}: ` : ""}PENDING
      </span>
    );
  }
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {label && (
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
      )}
      {explorerHref ? (
        <a
          href={explorerHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-xs hover:text-[var(--gold)] underline-offset-4 hover:underline"
        >
          {short} ↗
        </a>
      ) : (
        <span className="mono text-xs">{short}</span>
      )}
      <button
        type="button"
        aria-label="Copy address"
        onClick={() => {
          try {
            navigator.clipboard?.writeText(address);
          } catch {}
        }}
        className="mono text-[9px] uppercase tracking-[0.16em] rounded border border-border/60 px-1.5 py-0.5 hover:border-[var(--gold)]/60 text-muted-foreground hover:text-foreground"
      >
        Copy
      </button>
      {extras.map((x) => (
        <a
          key={x.label}
          href={x.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[9px] uppercase tracking-[0.16em] rounded border border-border/60 px-1.5 py-0.5 hover:border-[var(--gold)]/60 text-muted-foreground hover:text-foreground"
        >
          {x.label} ↗
        </a>
      ))}
    </div>
  );
}

/**
 * MetricExplainer — investor-relations style disclosure for any metric.
 *
 * Renders a compact panel answering the four questions every serious metric
 * should answer: What is this? Why does it matter? How is it calculated?
 * Where can I verify it? Use it inline beneath any headline metric, milestone,
 * or section to convert numbers into understanding.
 */
export function MetricExplainer({
  what,
  why,
  how,
  verify,
  className = "",
}: {
  what: ReactNode;
  why: ReactNode;
  how: ReactNode;
  verify?: { label: string; href: string } | ReactNode;
  className?: string;
}) {
  const Row = ({ k, v }: { k: string; v: ReactNode }) => (
    <div className="grid grid-cols-[96px,1fr] gap-4 items-start">
      <div className="mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground pt-0.5">
        {k}
      </div>
      <div className="text-sm text-foreground/85 leading-relaxed">{v}</div>
    </div>
  );
  const verifyNode =
    verify && typeof verify === "object" && "href" in (verify as { href?: string })
      ? (() => {
          const v = verify as { label: string; href: string };
          return (
            <a
              href={v.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[11px] underline-offset-4 hover:underline text-[var(--navy-soft)] hover:text-[var(--gold)]"
            >
              {v.label} ↗
            </a>
          );
        })()
      : (verify as ReactNode);
  return (
    <div
      className={`rounded-md border border-border/50 bg-card/50 p-4 space-y-2.5 ${className}`}
    >
      <Row k="What" v={what} />
      <Row k="Why" v={why} />
      <Row k="How" v={how} />
      {verifyNode && <Row k="Verify" v={verifyNode} />}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 *  UNIFIED ACTION + PROOF SYSTEM (Phase 3 harmonization)
 *  Every CTA / proof / address surface across the site MUST use one of these.
 *  No one-off button classNames, no one-off proof rows, no inline address chips.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Primary CTA — gold, used for the single dominant action on a page (Join, Mint, Take your seat). */
export function PrimaryButton({
  children,
  href = "#join",
  className = "",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <CTAButton variant="gold" href={href} className={className}>
      {children}
    </CTAButton>
  );
}

/** Secondary CTA — bordered, used next to a Primary button (Verify, Open registry, Browse). */
export function SecondaryButton({
  children,
  href = "#",
  className = "",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <CTAButton variant="navy" href={href} className={className}>
      {children}
    </CTAButton>
  );
}

/** Proof action — small cyan-accented chip used for Copy / Open Avascan / View Contract / View Transaction. */
export function ProofButton({
  children,
  href,
  onClick,
  external = true,
  className = "",
  ariaLabel,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const cls = `mono inline-flex items-center gap-1 rounded border border-[color:var(--verify)]/35 bg-[color:var(--verify)]/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-[color:var(--verify)] hover:border-[color:var(--verify)]/70 hover:bg-[color:var(--verify)]/10 transition-colors ${className}`;
  if (href) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={cls}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={cls}>
      {children}
    </button>
  );
}

/**
 * AddressCard — block-level address surface (label + status + short address + copy + explorer + extras).
 * Use this whenever an address gets its own card or row (registry tables, proof panels, contract dossiers).
 * For inline use (next to a number, inside a sentence), keep using <ContractLink />.
 */
export function AddressCard({
  label,
  address,
  explorerHref,
  status = "LIVE",
  extras = [],
  className = "",
}: {
  label: string;
  address: string;
  explorerHref?: string | null;
  status?: CanonicalStatus;
  extras?: Array<{ label: string; href: string }>;
  className?: string;
}) {
  const valid = /^0x[a-fA-F0-9]{40}$/.test(address);
  const short = valid ? `${address.slice(0, 6)}…${address.slice(-4)}` : "PENDING";
  return (
    <div
      className={`rounded-lg border border-border/60 bg-card/60 p-3.5 flex flex-col gap-2 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <StatusPill status={valid ? status : "PENDING"} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {valid && explorerHref ? (
          <a
            href={explorerHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-xs text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            {short}
          </a>
        ) : (
          <span className="mono text-xs text-foreground/80">{short}</span>
        )}
        {valid && (
          <ProofButton
            external={false}
            onClick={() => {
              try {
                navigator.clipboard?.writeText(address);
              } catch {}
            }}
            ariaLabel={`Copy ${label} address`}
          >
            Copy
          </ProofButton>
        )}
        {valid && explorerHref && (
          <ProofButton href={explorerHref} ariaLabel={`Open ${label} on Avascan`}>
            Avascan ↗
          </ProofButton>
        )}
        {valid &&
          extras.map((x) => (
            <ProofButton key={x.label} href={x.href}>
              {x.label} ↗
            </ProofButton>
          ))}
      </div>
    </div>
  );
}

/**
 * ActionPanel — gold-framed CTA block used at the end of any page (Final CTA, post-section conversion).
 * One shape for every page so the "next step" always looks the same.
 */
export function ActionPanel({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  primary: { label: ReactNode; href: string };
  secondary?: { label: ReactNode; href: string };
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[var(--gold)]/30 bg-card/70 p-8 md:p-10 ${className}`}
      style={{ boxShadow: "var(--shadow-glow-gold)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-gold)" }}
      />
      <div className="relative">
        {eyebrow && (
          <div
            className="mono text-[12px] uppercase tracking-[0.26em] mb-5"
            style={{ color: "var(--gold)" }}
          >
            {eyebrow}
          </div>
        )}
        <h3 className="font-serif text-fluid-h2 font-normal tracking-tight text-foreground max-w-3xl">
          {title}
        </h3>
        {description && (
          <p className="mt-5 text-lg md:text-xl text-foreground/80 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <PrimaryButton href={primary.href}>{primary.label}</PrimaryButton>
          {secondary && (
            <SecondaryButton href={secondary.href}>{secondary.label}</SecondaryButton>
          )}
        </div>
      </div>
    </div>
  );
}


