// Flywheel — the full Syndicate protocol economy, not just the seat.
//
// Visual layout:
//   1. Hero loop graphic (SVG ring + 6 nodes) — scannable in <5 seconds.
//   2. Six engine cards — each answers What / Why / Live / Pending / Verify.
//   3. Protocol Economy split — current LIVE flows vs PENDING future modules.
//
// Every "live" number comes from useProtocolPulse() (on-chain reads). No mock
// data. Empty / loading states show "—". PENDING items are clearly labeled
// and never summed into live totals.

import { Link } from "@tanstack/react-router";
import {
  Fingerprint,
  Split,
  Vault,
  Droplets,
  Activity,
  BookOpen,
  ArrowRight,
  RotateCw,
} from "lucide-react";
import { GlassCard, Section, SectionHeader, StatusPill, ProofButton, type CanonicalStatus } from "./Primitives";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { explorerUrlForAddress, CONTRACTS } from "@/lib/syndicate-config";

const fmtUsd = (n: number | undefined) =>
  n === undefined ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtN = (n: number | undefined) =>
  n === undefined ? "—" : n.toLocaleString("en-US");

type Engine = {
  n: string;
  label: string;
  Icon: typeof Fingerprint;
  what: string;
  why: string;
  liveNow: (p: ReturnType<typeof useProtocolPulse>) => { value: string; status: CanonicalStatus };
  pending: string;
  to: string;
  verifyHref?: string;
  verifyLabel?: string;
};

const ENGINES: Engine[] = [
  {
    n: "01",
    label: "Seat / Identity",
    Icon: Fingerprint,
    what: "Permanent member number, chapter-of-joining, and archive position recorded on Avalanche.",
    why: "Identity is the anchor — the only scarce thing in the protocol. Every other engine accrues meaning to your seat.",
    liveNow: (p) => ({
      value: p.buyers !== undefined ? `${fmtN(p.buyers)} seats sealed` : "—",
      status: "LIVE",
    }),
    pending: "Founders Hall ranks · cohort identity surfaces",
    to: "/registry",
    verifyLabel: "Open the archive →",
  },
  {
    n: "02",
    label: "Money Routing",
    Icon: Split,
    what: "Every USDC purchase splits 70 / 20 / 10 across three public wallets, on-chain, in the same transaction.",
    why: "Trust is mechanical, not promised. The contract enforces the split — no one can re-route it.",
    liveNow: (p) => ({
      value: p.usdcRaised !== undefined ? `${fmtUsd(p.usdcRaised)} routed` : "—",
      status: "LIVE",
    }),
    pending: "—",
    to: "/transparency",
    verifyLabel: "Verify the routing →",
  },
  {
    n: "03",
    label: "Vault / Treasury",
    Icon: Vault,
    what: "70% of every purchase lands in the Vault wallet — a public on-chain treasury allocation.",
    why: "Long-term protocol substrate. Today: wallet-based tracking. Tomorrow: a programmatic Vault contract — only after audit + explicit activation.",
    liveNow: (p) => ({
      value: p.vaultUsdc !== undefined ? `${fmtUsd(p.vaultUsdc)} in Vault wallet` : "—",
      status: "PARTIAL",
    }),
    pending: "Programmatic Vault contract — PENDING, not deployed. Future automation would require audit and explicit activation.",
    to: "/vault",
    verifyHref: explorerUrlForAddress(CONTRACTS.VAULT_WALLET) ?? undefined,
    verifyLabel: "Open the Vault →",
  },
  {
    n: "04",
    label: "Liquidity / Market",
    Icon: Droplets,
    what: "20% deepens the SYN / USDC pool on Trader Joe. Tradable, verifiable, public.",
    why: "Without LP, SYN is only buyable through the sale. The pool makes the protocol durable and price-discoverable.",
    liveNow: (p) => ({
      value: p.lpTvlUsd !== undefined ? `${fmtUsd(p.lpTvlUsd)} pool TVL` : "—",
      status: "LIVE",
    }),
    pending: "Concentrated-liquidity / DLMM strategy — not deployed",
    to: "/liquidity",
    verifyLabel: "See LP depth →",
  },
  {
    n: "05",
    label: "Activity / Proof",
    Icon: Activity,
    what: "Purchases, LP events, Vault flows, and milestones — streamed live from Avalanche RPC.",
    why: "Every join becomes a public moment. The feed is the protocol's heartbeat: proof the flywheel is moving.",
    liveNow: (p) => ({
      value: p.purchaseCount !== undefined ? `${fmtN(p.purchaseCount)} events on-chain` : "—",
      status: "LIVE",
    }),
    pending: "Indexed search · per-wallet history pages (PARTIAL)",
    to: "/activity",
    verifyLabel: "Read activity →",
  },
  {
    n: "06",
    label: "Chapters / Momentum",
    Icon: BookOpen,
    what: "Genesis Signal · First Thousand · The Expansion · First Ten Thousand. Chapters close on real on-chain thresholds.",
    why: "Each chapter close is a permanent sealing event — the archive deepens, late visitors can read the history.",
    liveNow: (p) => ({
      value: p.nextMemberNumber !== undefined ? `Next seat: Member #${p.nextMemberNumber}` : "—",
      status: "LIVE",
    }),
    pending: "Auto-sealed chapter pages for chapters past Genesis",
    to: "/chapters",
    verifyLabel: "Browse chapters →",
  },
];

const LOOP_STEPS = [
  "Visitor",
  "Joins",
  "Route 70 / 20 / 10",
  "Vault + LP grow",
  "Activity creates moments",
  "Chapters close",
  "Archive gains meaning",
];

function FlywheelGraphic({ pulse }: { pulse: ReturnType<typeof useProtocolPulse> }) {
  // 6 evenly spaced nodes around a circle. Pure SVG, no JS animation engine.
  const R = 130;
  const cx = 180;
  const cy = 180;
  const nodes = ENGINES.map((e, i) => {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return {
      e,
      x: cx + Math.cos(angle) * R,
      y: cy + Math.sin(angle) * R,
    };
  });

  return (
    <div className="relative w-full max-w-[360px] mx-auto md:mx-0 aspect-square">
      <svg viewBox="0 0 360 360" className="w-full h-full" role="img" aria-label="Protocol flywheel">
        <defs>
          <linearGradient id="fw-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.14 75)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="oklch(0.55 0.16 260)" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="fw-center" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.78 0.14 75 / 0.18)" />
            <stop offset="100%" stopColor="oklch(0.78 0.14 75 / 0)" />
          </radialGradient>
        </defs>

        {/* Outer rotating ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="url(#fw-ring)" strokeWidth="2.5"
          strokeDasharray="6 8" className="fw-spin" style={{ transformOrigin: `${cx}px ${cy}px` }} />
        {/* Inner solid faint ring */}
        <circle cx={cx} cy={cy} r={R - 18} fill="none" stroke="oklch(0.22 0.025 260 / 0.08)" strokeWidth="1" />
        {/* Center glow */}
        <circle cx={cx} cy={cy} r={62} fill="url(#fw-center)" />

        {/* Connector arrows between nodes */}
        {nodes.map((n, i) => {
          const next = nodes[(i + 1) % nodes.length];
          return (
            <line
              key={`l-${i}`}
              x1={n.x}
              y1={n.y}
              x2={next.x}
              y2={next.y}
              stroke="oklch(0.22 0.025 260 / 0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* Engine nodes */}
        {nodes.map(({ e, x, y }, i) => (
          <g key={e.n}>
            <circle cx={x} cy={y} r="20" fill="oklch(1 0 0)" stroke="oklch(0.78 0.14 75 / 0.7)" strokeWidth="1.5" />
            <text x={x} y={y - 26} textAnchor="middle" className="fill-[oklch(0.5_0.13_75)]"
              style={{ fontSize: 9, fontFamily: "ui-monospace, monospace", letterSpacing: "0.12em" }}>
              {e.n}
            </text>
            <text x={x} y={y + 4} textAnchor="middle" className="fill-foreground"
              style={{ fontSize: 9, fontFamily: "ui-monospace, monospace" }}>
              {String(i + 1)}
            </text>
          </g>
        ))}

        {/* Center label */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-foreground"
          style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", letterSpacing: "0.18em" }}>
          THE LOOP
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-[oklch(0.5_0.13_75)]"
          style={{ fontSize: 13, fontWeight: 600 }}>
          {pulse.nextMemberNumber !== undefined ? `Seat #${pulse.nextMemberNumber} next` : "Seat next"}
        </text>
        <text x={cx} y={cy + 26} textAnchor="middle" className="fill-muted-foreground"
          style={{ fontSize: 9, fontFamily: "ui-monospace, monospace" }}>
          {pulse.usdcRaised !== undefined ? `${fmtUsd(pulse.usdcRaised)} routed` : "—"}
        </text>
      </svg>

      <style>{`
        @keyframes fw-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .fw-spin { animation: fw-spin 60s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .fw-spin { animation: none; } }
      `}</style>
    </div>
  );
}

export function Flywheel() {
  const pulse = useProtocolPulse();

  return (
    <Section id="flywheel">
      <SectionHeader
        eyebrow="The Flywheel"
        title={<>The seat is the anchor. The <span className="text-gradient-gold">flywheel is the product</span>.</>}
        description="Six connected engines. Every join routes USDC on-chain, deepens the Vault wallet and the SYN/USDC pool, creates verifiable activity, closes chapters, and makes the archive more meaningful for everyone who comes next."
      />

      {/* Hero: graphic + loop steps */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,360px)_1fr] gap-6 mb-8 items-center">
        <FlywheelGraphic pulse={pulse} />
        <div className="surface elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <StatusPill status="LIVE" />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              on-chain · Avalanche C-Chain
            </span>
          </div>
          <ol className="space-y-2">
            {LOOP_STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm">
                <span className="mono text-[10px] text-[var(--gold)] tabular-nums pt-1 w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-foreground/90">{step}</span>
                {i < LOOP_STEPS.length - 1 && (
                  <ArrowRight aria-hidden className="ml-auto size-3.5 text-border shrink-0 mt-1" />
                )}
              </li>
            ))}
            <li className="flex items-center gap-3 pt-2 border-t border-border/40 mt-2">
              <RotateCw aria-hidden className="size-3.5 text-[var(--gold)]" />
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
                more visitors join — the loop compounds
              </span>
            </li>
          </ol>
        </div>
      </div>

      {/* Six engines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ENGINES.map((e) => {
          const live = e.liveNow(pulse);
          const Icon = e.Icon;
          return (
            <GlassCard key={e.n} className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/8 text-[color:oklch(0.5_0.13_75)]">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">{e.n}</div>
                    <div className="text-sm font-semibold tracking-tight">{e.label}</div>
                  </div>
                </div>
                <StatusPill status={live.status} />
              </div>

              <div className="mt-4 space-y-2.5 text-xs text-muted-foreground leading-relaxed flex-1">
                <p><span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground/70">What · </span>{e.what}</p>
                <p><span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground/70">Why · </span>{e.why}</p>
              </div>

              <div className="mt-4 rounded-md border border-border/50 p-3 space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Live now</span>
                  <span className="mono text-xs text-foreground tabular-nums">{live.value}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Pending</span>
                  <span className="mono text-[10px] text-muted-foreground text-right max-w-[60%]">{e.pending}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <Link
                  to={e.to as any}
                  className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
                >
                  {e.verifyLabel ?? "Open →"}
                </Link>
                {e.verifyHref && (
                  <ProofButton href={e.verifyHref}>Avascan ↗</ProofButton>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Protocol Economy: current live flows vs future pending modules */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <StatusPill status="LIVE" />
            <h3 className="text-sm font-semibold">Protocol Economy — live today</h3>
          </div>
          <ul className="text-xs space-y-2 text-foreground/85">
            <li className="flex justify-between gap-3 border-b border-border/40 pb-2">
              <span>Membership Sale · SYN purchases</span>
              <span className="mono tabular-nums">{pulse.usdcRaised !== undefined ? fmtUsd(pulse.usdcRaised) : "—"}</span>
            </li>
            <li className="flex justify-between gap-3 border-b border-border/40 pb-2">
              <span>Vault wallet · 70% of inflows</span>
              <span className="mono tabular-nums">{pulse.vaultUsdc !== undefined ? fmtUsd(pulse.vaultUsdc) : "—"}</span>
            </li>
            <li className="flex justify-between gap-3 border-b border-border/40 pb-2">
              <span>Liquidity wallet · 20% of inflows</span>
              <span className="mono tabular-nums">{pulse.liquidityUsdc !== undefined ? fmtUsd(pulse.liquidityUsdc) : "—"}</span>
            </li>
            <li className="flex justify-between gap-3 border-b border-border/40 pb-2">
              <span>Operations wallet · 10% of inflows</span>
              <span className="mono tabular-nums">{pulse.operationsUsdc !== undefined ? fmtUsd(pulse.operationsUsdc) : "—"}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>SYN / USDC pool TVL · Trader Joe</span>
              <span className="mono tabular-nums">{pulse.lpTvlUsd !== undefined ? fmtUsd(pulse.lpTvlUsd) : "—"}</span>
            </li>
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground border-l-2 border-emerald-500/40 pl-3">
            Only LIVE sources are summed here. Every row links to its on-chain source on Avascan or Trader Joe.
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <StatusPill status="PENDING" />
            <h3 className="text-sm font-semibold">Future modules — pending, not in totals</h3>
          </div>
          <ul className="text-xs space-y-2 text-foreground/85">
            <li className="flex justify-between gap-3 border-b border-border/40 pb-2">
              <span>Programmatic Vault contract</span>
              <span className="mono text-muted-foreground">PENDING</span>
            </li>
            <li className="flex justify-between gap-3 border-b border-border/40 pb-2">
              <span>LP / trading protocol surfaces</span>
              <span className="mono text-muted-foreground">PENDING</span>
            </li>
            <li className="flex justify-between gap-3 border-b border-border/40 pb-2">
              <span>Marketplace · identity surfaces</span>
              <span className="mono text-muted-foreground">PENDING</span>
            </li>
            <li className="flex justify-between gap-3 border-b border-border/40 pb-2">
              <span>Founders Hall ranks · cohort identity</span>
              <span className="mono text-muted-foreground">PENDING</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Additional protocol services</span>
              <span className="mono text-muted-foreground">PENDING</span>
            </li>
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground border-l-2 border-amber-500/40 pl-3">
            These are direction, not promises. None are deployed, none are summed into live totals, and none imply yield, returns, or smart-contract custody.
          </p>
        </GlassCard>
      </div>

      <p className="mt-6 text-xs text-muted-foreground leading-relaxed max-w-3xl">
        Nothing here is a return promise. The flywheel describes how a transparent on-chain
        protocol becomes more meaningful as more members join, more USDC routes publicly,
        and more chapters close. Every live number links to its on-chain source; every
        future module is clearly labeled PENDING.
      </p>
    </Section>
  );
}
