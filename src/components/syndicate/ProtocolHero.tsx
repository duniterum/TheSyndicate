// ─── Protocol Hero ────────────────────────────────────────────────────────
// Crypto-native protocol hero. Aesthetic: institutional asset manager ×
// on-chain intelligence × Swiss private-bank restraint, anchored by a large,
// OPEN central radial capital-routing engine — the dominant centerpiece.
//
// Composition (desktop):  headline + CTAs (left) · radial engine (center) ·
// protocol overview (right) · entry-preview rail (full-width bottom).
//
// HARD RULES honoured here:
//   • Every number is a REAL read from an existing canonical hook
//     (useProtocolTruth / useProtocolPulse / useChainTip / useQuoteSyn).
//   • No invented values. Missing data renders the canonical "—" and carries
//     its real status pill (LIVE / DERIVED / PARTIAL / PENDING).
//   • No new protocol logic, contracts, Story, Recognition, or governance.
//   • Copy is ownership/identity-first — never financial-return language.
//   • Colour discipline — this hero uses a GOLD brand base in BOTH themes (the
//     task mandate; the dark theme token --gold otherwise collapses to cyan):
//       gold  → brand / identity accents
//       green → live money ONLY (var(--success), green in both themes)
//       cyan  → the verify action ONLY (var(--verify))
//       red   → the Avalanche pill ONLY
//
// The five-act homepage journey continues BELOW this hero unchanged.

import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { formatUnits, parseUnits } from "viem";
import { useProtocolTruth, fmtUsd, fmtCount } from "@/lib/protocol-truth";
import { useProtocolPulse, formatAgo } from "@/lib/protocol-pulse";
import { useChainTip } from "@/lib/chain-time";
import { useQuoteSyn } from "@/lib/sale-hooks";
import {
  PURCHASE_PRESETS_USDC,
  USDC_ROUTING,
  SALE_MIN_USDC,
  ACCESS_RATE_USDC_PER_SYN,
  ACCESS_RATE_LABEL,
  AVALANCHE_CHAIN_ID,
  USDC_DECIMALS,
  SYN_DECIMALS,
  txExplorerUrl,
} from "@/lib/syndicate-config";
import { StatusPill, ProgressBar, AnimatedNumber, ProofButton, type CanonicalStatus } from "./Primitives";
import { track } from "@/lib/analytics";

// Entry presets surfaced in the hero — exactly the five headline tiers.
const HERO_PRESETS = PURCHASE_PRESETS_USDC.slice(0, 5); // 5 · 10 · 25 · 50 · 75

// ── Hero brand palette ─────────────────────────────────────────────────────
// The mandate calls for a black / ivory / GOLD base in BOTH themes. The dark
// theme remaps the --gold token to cyan, so the hero pins an explicit gold
// that reads on ivory AND on obsidian. Green stays the money colour only.
const GOLD = "#E3A92B";
const GOLD_SOFT = "color-mix(in oklab, #E3A92B 14%, transparent)";
const GOLD_LINE = "color-mix(in oklab, #E3A92B 45%, transparent)";
const GOLD_GRAD = "linear-gradient(135deg, #F2C544, #C5871C)";
const GOLD_GLOW = "0 10px 30px -12px color-mix(in oklab, #E3A92B 60%, transparent)";

// Distinct lane hues that read in both themes. Vault stays on gold; the other
// two lanes use fixed hues so the three routing lanes never collapse into one
// colour. Never green — green is reserved for money.
const LANE_COLOR: Record<string, string> = {
  gold: GOLD,
  navy: "oklch(0.66 0.13 235)",
  amber: "oklch(0.78 0.13 72)",
};

// Avalanche brand red — used ONLY inside the Avalanche pill.
const AVALANCHE_RED = "#E84142";

// Radial placement around the engine core. `wrap` is the overlay position
// (percent of the square stage); `line` is the SVG endpoint a flowing capital
// dot travels to from the centre (viewBox 0 0 400 400). Conceptual nodes have
// no spoke line — they sit on the orbit only.
const NODE_POS: Record<string, { wrap: string; line: [number, number] }> = {
  VAULT_WALLET: { wrap: "left-[68%] top-[88%]", line: [262, 332] },
  LIQUIDITY_WALLET: { wrap: "left-[32%] top-[88%]", line: [138, 332] },
  OPERATIONS_WALLET: { wrap: "left-[12%] top-[60%]", line: [62, 232] },
};

const CTA_BASE =
  "mono inline-flex items-center justify-center gap-2 rounded-[3px] px-6 py-3.5 text-[13px] uppercase tracking-[0.14em] transition-all duration-200 whitespace-nowrap";

// Compact formatters for the tight overview cells (1B SYN · $10M).
const fmtCompactUsd = (n: number | undefined): string =>
  n === undefined ? "—" : `$${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`;
const fmtCompactSyn = (n: number | undefined): string =>
  n === undefined ? "—" : `${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)} SYN`;
// Core engine figure: rounded dollars (no cents) until it grows large, then
// compact — keeps the routed amount inside the hub ring at every width.
const fmtCoreUsd = (n: number): string =>
  n >= 100_000
    ? Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)
    : Math.round(n).toLocaleString("en-US");

export function ProtocolHero() {
  const t = useProtocolTruth();
  const pulse = useProtocolPulse();
  const tip = useChainTip();

  // Live on-chain SYN quote for the selected entry amount; deterministic
  // estimate (at the published access rate) is the labelled fallback.
  const [amount, setAmount] = useState<number>(SALE_MIN_USDC);
  const amountRaw = parseUnits(String(amount), USDC_DECIMALS);
  const quote = useQuoteSyn(amountRaw);
  const liveSyn =
    quote.data !== undefined ? Number(formatUnits(quote.data as bigint, SYN_DECIMALS)) : undefined;
  const synEstimate = liveSyn ?? amount / ACCESS_RATE_USDC_PER_SYN;
  const synStatus: CanonicalStatus = liveSyn !== undefined ? "LIVE" : "DERIVED";

  const chapter = t.chapterProgress.value;
  const blockNo = tip.data?.number;
  const chainLive = blockNo !== undefined;

  // Reference FDV is framed at the published access rate ($0.01 / SYN), never
  // LP spot — a deliberate, conservative framing. Hence DERIVED, not LIVE.
  const refFdv =
    t.totalSupplySyn.value !== undefined
      ? t.totalSupplySyn.value * ACCESS_RATE_USDC_PER_SYN
      : undefined;

  const lanes = USDC_ROUTING.map((r) => ({
    ...r,
    color: LANE_COLOR[r.tone] ?? GOLD,
    pos: NODE_POS[r.key] ?? NODE_POS.VAULT_WALLET,
    fact:
      r.key === "VAULT_WALLET"
        ? t.vaultUsdc
        : r.key === "LIQUIDITY_WALLET"
        ? t.liquidityUsdc
        : t.operationsUsdc,
  }));

  const routedValue = t.usdcRaised.value;
  const routedFresh = Boolean(pulse.lastBuyTxHash);
  const seatLabel = t.nextMemberNumber.value !== undefined ? `#${fmtCount(t.nextMemberNumber.value)}` : "—";

  function openWallet() {
    if (typeof document === "undefined") return;
    document.dispatchEvent(new CustomEvent("syndicate:open-wallet"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    track("wallet_connect_click", { surface: "protocol_hero" });
  }

  return (
    <section id="top" className="relative overflow-hidden" style={{ background: "var(--background)" }}>
      {/* ── Ambient field — layered vault atmosphere. Pure decoration. ───── */}
      <div aria-hidden className="absolute inset-0 grid-bg opacity-[0.14]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 75% at 50% 14%, color-mix(in oklab, #E3A92B 13%, transparent), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[36%] size-[720px] -translate-x-1/2 rounded-full opacity-[0.12] blur-3xl"
        style={{ background: GOLD_GRAD }}
      />
      {/* Swiss mountain / vault silhouette — twin layered ridgelines. */}
      <MountainAtmosphere />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* ── STATUS RIBBON ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border/60 py-4 md:py-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="relative inline-flex items-center justify-center size-9 rounded-full shrink-0"
              style={{ background: GOLD_GRAD, boxShadow: GOLD_GLOW }}
            >
              <span className="font-serif text-base font-semibold text-[#1a1a1a]">S</span>
            </span>
            <span className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              On-Chain Membership Protocol
            </span>
          </div>

          {/* Avalanche pill — the only place Avalanche red appears. */}
          <div
            className="flex items-center gap-2 rounded-full border px-3 py-1"
            style={{
              borderColor: `color-mix(in oklab, ${AVALANCHE_RED} 38%, transparent)`,
              background: `color-mix(in oklab, ${AVALANCHE_RED} 9%, transparent)`,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden style={{ fill: AVALANCHE_RED }}>
              <path d="M12 2 2 21h20L12 2Zm0 6.2 3.1 5.8h-2.2l-1.7-3.2-2.4 4.6h7.9l1.1 2.1H6.2L12 8.2Z" />
            </svg>
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-foreground/85">
              Avalanche C-Chain · {AVALANCHE_CHAIN_ID}
            </span>
            <span
              className={`size-1.5 rounded-full ${chainLive ? "pulse-dot" : ""}`}
              style={{ background: chainLive ? AVALANCHE_RED : "var(--muted-foreground)" }}
            />
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground tabular-nums">
              {chainLive ? `#${blockNo!.toString()}` : "syncing…"}
            </span>
          </div>

          {/* SYN market context — access rate + reference FDV (DERIVED) + LP TVL */}
          <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <Ctx label="Access" value={ACCESS_RATE_LABEL.replace(" USDC", "")} status="DERIVED" />
            <Ctx label="Ref. FDV" value={refFdv !== undefined ? fmtCompactUsd(refFdv) : "—"} status="DERIVED" />
            <Ctx label="LP TVL" value={fmtUsd(t.lpTvlUsd.value, 0)} status={t.lpTvlUsd.status} />
          </div>
        </div>

        {/* ── MAIN — headline (left) · engine (center) · overview (right) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.3fr_0.96fr] items-start gap-x-8 xl:gap-x-10 gap-y-12 pt-9 md:pt-12 pb-10">
          {/* ░░ LEFT — eyebrow · headline · subhead · CTAs ░░ */}
          <div className="lg:pt-6 max-w-xl">
            <div className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] mb-6" style={{ color: GOLD }}>
              <span className="size-1.5 rounded-full pulse-dot" style={{ background: GOLD }} />
              Live protocol
            </div>

            <h1 className="font-serif font-normal tracking-tight leading-[1.05] text-foreground text-[clamp(2.4rem,1.4rem+2.6vw,3.6rem)]">
              Own the seat.
              <br />
              <span style={{ color: GOLD }}>Fund the protocol.</span>
            </h1>

            <p className="mt-6 max-w-md text-base md:text-[1.05rem] text-foreground/80 leading-relaxed">
              SYN is your seat — a numbered, verifiable place in the archive that cannot be
              reassigned by anyone, ever. Every USDC routes publicly: 70% Vault, 20%
              Liquidity, 10% Operations.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
              <Link
                to="/join"
                onClick={() => track("claim_seat_click", { surface: "protocol_hero" })}
                className={`${CTA_BASE} font-bold hover:brightness-110`}
                style={{ background: GOLD_GRAD, color: "#1a1a1a", boxShadow: GOLD_GLOW }}
              >
                Join The Syndicate — ${SALE_MIN_USDC} →
              </Link>
              <Link
                to="/transparency"
                onClick={() => track("verify_click", { surface: "protocol_hero" })}
                className={`${CTA_BASE} font-medium`}
                style={{ borderWidth: 1, borderColor: "var(--verify)", color: "var(--verify)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Verify live flows
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <button
                type="button"
                onClick={openWallet}
                className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors"
              >
                or connect wallet →
              </button>
              <span className="mono inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: chainLive ? GOLD : "var(--muted-foreground)" }}
                  aria-hidden
                />
                {chainLive ? "Live on-chain reads" : "Connecting to chain…"}
              </span>
            </div>
          </div>

          {/* ░░ CENTER — the radial capital-flow engine ░░ */}
          <div className="w-full">
            <div className="relative mx-auto w-full max-w-[520px]">
              {/* vault glow behind the engine */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-70"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--success) 16%, transparent), transparent 60%)",
                }}
              />

              {/* ── Desktop / tablet: open radial orbital stage ─────────── */}
              <div className="relative hidden aspect-square w-full sm:block">
                <RadialStage lanes={lanes} chainLive={chainLive} />

                {/* Core — dominant green routed amount */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                  <div className="mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                    Live capital flow
                  </div>
                  <div
                    className="mt-1.5 mono tabular-nums font-semibold leading-none text-[clamp(2.4rem,1.2rem+3vw,3.4rem)]"
                    style={{ color: "var(--success)" }}
                  >
                    {routedValue !== undefined ? (
                      <AnimatedNumber value={routedValue} prefix="$" format={fmtCoreUsd} />
                    ) : (
                      "—"
                    )}
                  </div>
                  <div className="mt-2 mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                    USDC Routed
                  </div>
                  <div className="mt-3 mono text-[10px] uppercase tracking-[0.14em] text-foreground/70">
                    ${amount} → {fmtCount(Math.round(synEstimate))} SYN → 70 / 20 / 10
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <StatusPill status={t.usdcRaised.status} />
                    {routedFresh && (
                      <span className="mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                        {formatAgo(pulse.lastBuyAgoSeconds)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Seat anticipation node — top (visitor / next seat) */}
                <EngineNode wrap="left-1/2 top-[5%]" align="center">
                  <NodeIcon name="person" />
                  <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                    You are visitor
                  </span>
                  <span className="mono text-sm font-semibold tabular-nums" style={{ color: GOLD }}>
                    Seat {seatLabel}
                  </span>
                </EngineNode>

                {/* Joins — conceptual node (upper right) */}
                <EngineNode wrap="left-[82%] top-[24%]" align="center">
                  <NodeIcon name="join" />
                  <span className="mono text-[9px] uppercase tracking-[0.14em] text-foreground/85">Joins</span>
                  <span className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">With USDC</span>
                </EngineNode>

                {/* Membership sale — conceptual node (right) */}
                <EngineNode wrap="left-[88%] top-[60%]" align="center">
                  <NodeIcon name="sale" />
                  <span className="mono text-[9px] uppercase tracking-[0.14em] text-foreground/85">Membership</span>
                  <span className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">SYN received</span>
                </EngineNode>

                {/* Chronicle — conceptual node (upper left) */}
                <EngineNode wrap="left-[18%] top-[24%]" align="center">
                  <NodeIcon name="chronicle" />
                  <span className="mono text-[9px] uppercase tracking-[0.14em] text-foreground/85">Chronicle</span>
                  <span className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    {chapter ? chapter.label : "Archive"}
                  </span>
                </EngineNode>

                {/* Routing lane nodes — the three live capital lanes */}
                {lanes.map((lane) => (
                  <EngineNode key={lane.key} wrap={lane.pos.wrap} align="center">
                    <div className="flex items-center gap-1.5">
                      <span aria-hidden className="size-1.5 rounded-full" style={{ background: lane.color }} />
                      <span className="mono text-[9px] uppercase tracking-[0.12em] text-foreground/85">
                        {lane.label.replace(" Wallet", "")}
                      </span>
                      <span className="mono text-[10px] font-semibold tabular-nums" style={{ color: lane.color }}>
                        {lane.pct}%
                      </span>
                    </div>
                    <span className="mono text-[11px] tabular-nums text-foreground/90">
                      {fmtUsd(lane.fact.value, 2)}
                    </span>
                  </EngineNode>
                ))}
              </div>

              {/* ── Mobile: compact capital-flow panel ─────────────────── */}
              <div className="glass-card elevated p-5 text-center sm:hidden">
                <div className="flex items-center justify-between text-left">
                  <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Live capital flow
                  </span>
                  <StatusPill status={t.usdcRaised.status} />
                </div>
                <div
                  className="mt-3 mono tabular-nums font-semibold leading-none text-[clamp(2.75rem,1.5rem+9vw,3.75rem)]"
                  style={{ color: "var(--success)" }}
                >
                  {routedValue !== undefined ? (
                    <AnimatedNumber value={routedValue} prefix="$" format={fmtCoreUsd} />
                  ) : (
                    "—"
                  )}
                </div>
                <div className="mt-1.5 mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                  USDC Routed
                </div>
                <div className="mt-2 mono text-[10px] uppercase tracking-[0.14em] text-foreground/70">
                  ${amount} → {fmtCount(Math.round(synEstimate))} SYN → 70 / 20 / 10
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {lanes.map((lane) => (
                    <div key={lane.key} className="rounded-lg border border-border/50 bg-card/40 px-2 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <span aria-hidden className="size-1.5 rounded-full" style={{ background: lane.color }} />
                        <span className="mono text-[12px] font-semibold tabular-nums" style={{ color: lane.color }}>
                          {lane.pct}%
                        </span>
                      </div>
                      <div className="mt-1 mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                        {lane.label.replace(" Wallet", "")}
                      </div>
                      <div className="mt-0.5 mono text-[10px] tabular-nums text-foreground/85">
                        {fmtUsd(lane.fact.value, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ░░ RIGHT — protocol overview · latest activity · chapter ░░ */}
          <div className="w-full lg:pt-6">
            <div className="surface p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Protocol overview
                </span>
                <StatusPill status={t.members.status} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Stat label="Members" value={fmtCount(t.members.value)} status={t.members.status} />
                <Stat label="USDC routed" value={fmtCompactUsd(t.usdcRaised.value)} status={t.usdcRaised.status} money />
                <Stat label="SYN sold" value={fmtCount(t.synSold.value)} status={t.synSold.status} />
                <Stat label="SYN price" value={fmtUsd(t.synPriceUsd.value, 4)} status={t.synPriceUsd.status} />
                <Stat label="Ref. FDV" value={fmtCompactUsd(refFdv)} status="DERIVED" />
                <Stat label="Total supply" value={fmtCompactSyn(t.totalSupplySyn.value)} status={t.totalSupplySyn.status} />
              </div>
            </div>

            {/* Latest activity */}
            <div className="surface p-5 mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Latest activity
                </span>
                <StatusPill status={pulse.lastBuyTxHash ? "LIVE" : "PENDING"} />
              </div>
              {pulse.lastBuyBuyer ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="amount-lg mono tabular-nums text-foreground">{fmtUsd(pulse.lastBuyUsdc, 2)}</span>
                      <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">seat taken</span>
                    </div>
                    <div className="mt-1 mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {formatAgo(pulse.lastBuyAgoSeconds)}
                    </div>
                  </div>
                  {pulse.lastBuyTxHash && (
                    <ProofButton href={txExplorerUrl(pulse.lastBuyTxHash)} ariaLabel="Verify latest purchase on-chain">
                      Tx ↗
                    </ProofButton>
                  )}
                </div>
              ) : (
                <div className="mono text-sm text-muted-foreground">Awaiting the first purchase</div>
              )}
            </div>

            {/* Current chapter */}
            <div className="surface p-5 mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Current chapter
                </span>
                <StatusPill status={t.chapterProgress.status} />
              </div>
              {chapter ? (
                <>
                  <div className="font-serif text-lg text-foreground leading-none">{chapter.label}</div>
                  <div className="mt-3">
                    <ProgressBar value={chapter.progressPct} max={100} tone="gold" />
                  </div>
                  <div className="mt-2 mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {fmtCount(chapter.taken)} of {fmtCount(chapter.capacity)} · {fmtCount(chapter.remaining)} until it seals
                  </div>
                </>
              ) : (
                <div className="amount-lg mono text-foreground/40">—</div>
              )}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                <Link
                  to="/archive"
                  className="mono text-[10px] uppercase tracking-[0.18em] underline-offset-4 hover:underline text-[var(--verify)]"
                >
                  Open the archive →
                </Link>
                <Link
                  to="/activity"
                  className="mono text-[10px] uppercase tracking-[0.18em] underline-offset-4 hover:underline text-[var(--verify)]"
                >
                  Live activity →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM RAIL — entry preview (the conversion surface) ───────── */}
        <div className="surface overflow-hidden mb-14 md:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-y-5 lg:gap-x-8 p-5">
            {/* presets */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Entry preview · based on {synStatus === "LIVE" ? "live rate" : "access rate"}
                </span>
                <span className="lg:hidden">
                  <StatusPill status={synStatus} />
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {HERO_PRESETS.map((v) => {
                  const active = v === amount;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(v)}
                      className="mono text-[12px] tracking-[0.05em] rounded-[3px] px-3.5 py-2 border transition-colors hover:text-foreground"
                      style={
                        active
                          ? { borderColor: GOLD, color: GOLD, background: GOLD_SOFT }
                          : { borderColor: "color-mix(in oklab, var(--border) 60%, transparent)", color: "var(--muted-foreground)" }
                      }
                      aria-pressed={active}
                    >
                      ${v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* you receive */}
            <div className="lg:text-center lg:border-x border-border/60 lg:px-8">
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                ${amount} buys ≈
              </div>
              <div className="mt-1 flex items-baseline gap-2 lg:justify-center">
                <span className="amount-hero mono tabular-nums" style={{ color: GOLD }}>
                  {fmtCount(Math.round(synEstimate))}
                </span>
                <span className="mono text-sm text-foreground/70">SYN</span>
              </div>
              <div className="mt-1 mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {synStatus === "LIVE" ? "Live on-chain quote" : `Estimated at ${ACCESS_RATE_LABEL}`}
              </div>
            </div>

            {/* routing breakdown */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {USDC_ROUTING.map((r) => (
                <div key={r.key} className="flex flex-col">
                  <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {r.pct}% {r.label.replace(" Wallet", "")}
                  </span>
                  <span className="mono text-sm tabular-nums text-foreground/90">
                    {fmtUsd((amount * r.pct) / 100, 2)}
                  </span>
                </div>
              ))}
              <div className="hidden lg:flex flex-col">
                <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Verifiable</span>
                <span className="mono inline-flex items-center gap-1 text-sm" style={{ color: "var(--verify)" }}>
                  On-chain ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The radial SVG stage: a faint outer ring, a slowly-rotating dashed orbit
 *  carrying glowing capital dots around the engine, an inner green hub ring,
 *  and three subtle spokes with capital dots flowing from the core out to the
 *  live routing lanes. Decoration only — every figure lives in HTML overlay
 *  nodes. */
function RadialStage({
  lanes,
  chainLive,
}: {
  lanes: { key: string; color: string; pos: { wrap: string; line: [number, number] } }[];
  chainLive: boolean;
}) {
  // Full-circle orbit path (r = 150, centre 200,200) for the travelling dots.
  const orbitPath = "M200,50 a150,150 0 1,0 0,300 a150,150 0 1,0 0,-300";
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
      {/* outer ring */}
      <circle cx="200" cy="200" r="196" fill="none" strokeWidth="1" style={{ stroke: "color-mix(in oklab, var(--border) 70%, transparent)" }} />
      {/* mid ring */}
      <circle cx="200" cy="200" r="174" fill="none" strokeWidth="1" style={{ stroke: "color-mix(in oklab, var(--border) 45%, transparent)" }} />

      {/* slow rotating dashed orbit (the path the nodes sit on) */}
      <circle cx="200" cy="200" r="150" fill="none" strokeWidth="1" strokeDasharray="2 10" style={{ stroke: GOLD_LINE }}>
        <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="80s" repeatCount="indefinite" />
      </circle>

      {/* glowing capital dots travelling around the orbit */}
      {chainLive &&
        [0, 1, 2, 3].map((i) => (
          <circle key={`orbit-${i}`} r="2.6" style={{ fill: GOLD }}>
            <animateMotion dur="20s" begin={`${i * 5}s`} repeatCount="indefinite" path={orbitPath} rotate="auto" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="20s" begin={`${i * 5}s`} repeatCount="indefinite" />
          </circle>
        ))}

      {/* inner hub ring framing the green core */}
      <circle cx="200" cy="200" r="92" fill="color-mix(in oklab, var(--success) 5%, transparent)" />
      <circle cx="200" cy="200" r="92" fill="none" strokeWidth="1.5" style={{ stroke: "color-mix(in oklab, var(--success) 45%, transparent)" }} />

      {/* spokes + flowing capital dots, one per live routing lane */}
      {lanes.map((lane, i) => {
        const [x, y] = lane.pos.line;
        const path = `M200,200 L${x},${y}`;
        return (
          <g key={lane.key}>
            <line x1="200" y1="200" x2={x} y2={y} strokeWidth="1" style={{ stroke: "color-mix(in oklab, var(--border) 80%, transparent)" }} />
            {chainLive && (
              <circle r="3.4" style={{ fill: lane.color }}>
                <animateMotion dur="2.8s" begin={`${i * 0.9}s`} repeatCount="indefinite" path={path} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="2.8s" begin={`${i * 0.9}s`} repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Absolutely-positioned label node around the engine core. */
function EngineNode({
  wrap,
  align,
  children,
}: {
  wrap: string;
  align: "start" | "center" | "end";
  children: ReactNode;
}) {
  const items = align === "start" ? "items-start" : align === "end" ? "items-end" : "items-center";
  return (
    <div className={`absolute ${wrap} -translate-x-1/2 -translate-y-1/2 flex flex-col ${items} gap-0.5 whitespace-nowrap`}>
      {children}
    </div>
  );
}

/** Small circular line-icon used by the conceptual engine nodes. */
function NodeIcon({ name }: { name: "person" | "join" | "sale" | "chronicle" }) {
  const paths: Record<string, ReactNode> = {
    person: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
      </>
    ),
    join: <path d="M7 17 17 7M9 7h8v8" />,
    sale: (
      <>
        <path d="M12 3v18" />
        <path d="M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3" />
      </>
    ),
    chronicle: (
      <>
        <path d="M5 4.5h9a2 2 0 0 1 2 2V20a2 2 0 0 0-2-2H5z" />
        <path d="M19 6.5V20a2 2 0 0 0-2-2h-3" />
      </>
    ),
  };
  return (
    <span
      className="mb-1 inline-flex items-center justify-center size-8 rounded-full border"
      style={{
        borderColor: GOLD_LINE,
        background: "color-mix(in oklab, var(--card) 70%, transparent)",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {paths[name]}
      </svg>
    </span>
  );
}

/** Twin layered mountain ridgelines — Swiss private-bank / vault atmosphere. */
function MountainAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%] overflow-hidden">
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <path
          d="M0,320 L0,232 L160,176 L320,224 L480,128 L640,200 L800,96 L960,184 L1120,120 L1280,196 L1440,144 L1440,320 Z"
          style={{ fill: "color-mix(in oklab, var(--foreground) 4%, transparent)" }}
        />
        <path
          d="M0,320 L0,276 L180,236 L360,272 L540,200 L720,256 L900,184 L1080,248 L1260,208 L1440,256 L1440,320 Z"
          style={{ fill: "color-mix(in oklab, var(--foreground) 6%, transparent)" }}
        />
      </svg>
    </div>
  );
}

/** Compact metric cell for the protocol-overview card. Green is reserved for
 *  live money (the `money` flag); everything else stays ivory/foreground. */
function Stat({
  label,
  value,
  status,
  money = false,
}: {
  label: string;
  value: string;
  status: CanonicalStatus;
  money?: boolean;
}) {
  const dot =
    status === "LIVE"
      ? "var(--success)"
      : status === "DERIVED" || status === "PARTIAL"
      ? "var(--verify)"
      : "var(--muted-foreground)";
  return (
    <div className="flex flex-col gap-1">
      <span className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span
        className="mono tabular-nums leading-none text-[1.35rem] font-semibold"
        style={money && status === "LIVE" ? { color: "var(--success)" } : undefined}
      >
        {value}
      </span>
      <span className="mono inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="size-1 rounded-full" style={{ background: dot }} aria-hidden />
        {status}
      </span>
    </div>
  );
}

/** Compact market-context cell for the status ribbon. */
function Ctx({ label, value, status }: { label: string; value: string; status: CanonicalStatus }) {
  const tone =
    status === "LIVE"
      ? "var(--success)"
      : status === "DERIVED"
      ? "var(--verify)"
      : "var(--muted-foreground)";
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-1 rounded-full" style={{ background: tone }} aria-hidden />
      <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground/85 tabular-nums">{value}</span>
    </span>
  );
}
