// ─── Protocol Hero ────────────────────────────────────────────────────────
// Full-screen, crypto-native protocol hero. Aesthetic: institutional asset
// manager × on-chain intelligence × Swiss private-bank restraint, anchored by
// a central radial capital-routing engine.
//
// HARD RULES honoured here:
//   • Every number is a REAL read from an existing canonical hook
//     (useProtocolTruth / useProtocolPulse / useChainTip / useQuoteSyn).
//   • No invented values. Missing data renders the canonical "—" and carries
//     its real status pill (LIVE / DERIVED / PARTIAL / PENDING).
//   • No new protocol logic, contracts, Story, Recognition, or governance.
//   • Copy is ownership/identity-first — never financial-return language.
//   • Colour discipline: green is reserved for live money; Avalanche red lives
//     only in the Avalanche pill; everything else is black / ivory / gold.
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

// Distinct lane hues that read in both light + dark themes. Vault stays on the
// themed brand accent (gold in light / cyan in dark); the other two lanes use
// fixed hues so the three routing lanes never collapse into one colour. Never
// green — green is reserved for live money.
const LANE_COLOR: Record<string, string> = {
  gold: "var(--gold)",
  navy: "oklch(0.66 0.13 235)",
  amber: "oklch(0.78 0.13 72)",
};

// Avalanche brand red — used ONLY inside the Avalanche pill.
const AVALANCHE_RED = "#E84142";

// Radial placement for each routing lane around the engine core. `wrap` is the
// overlay position (percent of the square stage); `line` is the SVG endpoint
// the flowing capital dot travels to from the centre (viewBox 0 0 400 400).
const NODE_POS: Record<string, { wrap: string; line: [number, number] }> = {
  VAULT_WALLET: { wrap: "left-[83%] top-[70%]", line: [324, 282] },
  LIQUIDITY_WALLET: { wrap: "left-1/2 top-[92%]", line: [200, 356] },
  OPERATIONS_WALLET: { wrap: "left-[17%] top-[70%]", line: [76, 282] },
};

const CTA_BASE =
  "mono inline-flex items-center justify-center gap-2 rounded-[3px] px-6 py-3.5 text-[13px] uppercase tracking-[0.14em] transition-all duration-200 whitespace-nowrap";

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
    color: LANE_COLOR[r.tone] ?? "var(--gold)",
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

  function openWallet() {
    if (typeof document === "undefined") return;
    document.dispatchEvent(new CustomEvent("syndicate:open-wallet"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    track("wallet_connect_click", { surface: "protocol_hero" });
  }

  return (
    <section id="top" className="relative overflow-hidden" style={{ background: "var(--background)" }}>
      {/* ── Ambient field — layered vault atmosphere. Pure decoration. ───── */}
      <div aria-hidden className="absolute inset-0 grid-bg opacity-[0.16]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 78% 18%, color-mix(in oklab, var(--gold) 14%, transparent), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 -left-40 size-[560px] rounded-full opacity-[0.10] blur-3xl"
        style={{ background: "var(--gradient-gold)" }}
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
              style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow-gold)" }}
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
            <Ctx label="Ref. FDV" value={refFdv !== undefined ? fmtUsd(refFdv, 0) : "—"} status="DERIVED" />
            <Ctx label="LP TVL" value={fmtUsd(t.lpTvlUsd.value, 0)} status={t.lpTvlUsd.status} />
          </div>
        </div>

        {/* ── MAIN — headline (left) + radial engine (right) ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] lg:grid-rows-[auto_auto] items-center gap-x-12 gap-y-9 pt-8 md:pt-11 pb-12">
          {/* BLOCK 1 — eyebrow, headline, subhead, seat anticipation */}
          <div className="lg:col-start-1 lg:row-start-1 max-w-2xl">
            <div
              className="mono text-[11px] uppercase tracking-[0.26em] text-[var(--accent)] border-l-2 pl-3 mb-6"
              style={{ borderColor: "var(--accent)" }}
            >
              The Syndicate · Live on Avalanche
            </div>

            <h1 className="font-serif font-normal tracking-tight leading-[1.04] text-foreground text-[clamp(2.25rem,1.4rem+2.4vw,3.5rem)]">
              A permanent seat,
              <br />
              <span style={{ color: "var(--gold)" }}>sealed on-chain.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base md:text-lg text-foreground/80 leading-relaxed">
              SYN is your seat — a numbered, verifiable place in the archive that cannot be
              reassigned by anyone, ever. Every USDC routes publicly: 70% Vault, 20% Liquidity,
              10% Operations. The product is identity and belonging.
            </p>

            {/* Seat anticipation — the ownership hook */}
            <div className="mt-7 inline-flex items-center gap-5 rounded-xl border border-border/60 bg-card/50 px-5 py-3.5">
              <div className="flex flex-col">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Your seat would be
                </span>
                <span className="amount-xl mono tabular-nums leading-none mt-1" style={{ color: "var(--gold)" }}>
                  {t.nextMemberNumber.value !== undefined ? `#${fmtCount(t.nextMemberNumber.value)}` : "—"}
                </span>
              </div>
              <span className="self-stretch w-px bg-border/60" />
              <div className="flex flex-col">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Members sealed
                </span>
                <span className="amount-xl mono tabular-nums leading-none mt-1 text-foreground">
                  {fmtCount(t.members.value)}
                </span>
              </div>
            </div>
          </div>

          {/* BLOCK 2 — the radial capital-flow engine (spans both left rows) */}
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center w-full">
            <div className="relative mx-auto w-full max-w-[480px]">
              {/* vault glow behind the engine */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-60"
                style={{
                  background:
                    "radial-gradient(circle at 50% 46%, color-mix(in oklab, var(--success) 22%, transparent), transparent 62%)",
                }}
              />
              <div className="relative glass-card elevated p-5 md:p-6">
                {/* header */}
                <div className="flex items-center justify-between">
                  <span className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Live Capital Flow
                  </span>
                  <StatusPill status={t.usdcRaised.status} />
                </div>

                {/* ── Desktop / tablet: radial orbital stage ─────────────── */}
                <div className="relative mt-3 hidden aspect-square w-full sm:block">
                  <RadialStage lanes={lanes} />

                  {/* Core — dominant green routed amount */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <div
                      className="mono tabular-nums font-semibold leading-none text-[clamp(2.5rem,1.4rem+3vw,3.5rem)]"
                      style={{ color: "var(--success)" }}
                    >
                      {routedValue !== undefined ? (
                        <AnimatedNumber
                          value={routedValue}
                          prefix="$"
                          format={(n) => n.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        />
                      ) : (
                        "—"
                      )}
                    </div>
                    <div className="mt-2 mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                      USDC Routed
                    </div>
                    <div className="mt-3 mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]">
                      ${amount} → {fmtCount(Math.round(synEstimate))} SYN → 70 / 20 / 10
                    </div>
                  </div>

                  {/* Seat anticipation node — top */}
                  <EngineNode wrap="left-1/2 top-[7%]" align="center">
                    <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                      Seat next
                    </span>
                    <span className="mono text-sm font-semibold tabular-nums" style={{ color: "var(--gold)" }}>
                      {t.nextMemberNumber.value !== undefined ? `#${fmtCount(t.nextMemberNumber.value)}` : "—"}
                    </span>
                  </EngineNode>

                  {/* Routing lane nodes — orbiting the core */}
                  {lanes.map((lane) => (
                    <EngineNode
                      key={lane.key}
                      wrap={lane.pos.wrap}
                      align={lane.key === "OPERATIONS_WALLET" ? "end" : lane.key === "VAULT_WALLET" ? "start" : "center"}
                    >
                      <div className="flex items-center gap-1.5">
                        <span aria-hidden className="size-1.5 rounded-full" style={{ background: lane.color }} />
                        <span className="mono text-[9px] uppercase tracking-[0.14em] text-foreground/85">
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
                <div className="mt-3 text-center sm:hidden">
                  <div
                    className="mono tabular-nums font-semibold leading-none text-[clamp(2.75rem,1.5rem+9vw,3.75rem)]"
                    style={{ color: "var(--success)" }}
                  >
                    {routedValue !== undefined ? (
                      <AnimatedNumber
                        value={routedValue}
                        prefix="$"
                        format={(n) => n.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      />
                    ) : (
                      "—"
                    )}
                  </div>
                  <div className="mt-1.5 mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                    USDC Routed
                  </div>
                  <div className="mt-2 mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]">
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

                {/* footer — provenance + proof, never noisy */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-3 flex-wrap">
                  <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Cumulative · {fmtCount(t.purchaseCount.value)} purchases
                    {routedFresh && ` · ${formatAgo(pulse.lastBuyAgoSeconds)}`}
                  </span>
                  {t.usdcRaised.verifyHref && (
                    <ProofButton href={t.usdcRaised.verifyHref} ariaLabel="Verify USDC routed on-chain">
                      Verify ↗
                    </ProofButton>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 3 — CTAs + entry preview (under the headline on desktop) */}
          <div className="lg:col-start-1 lg:row-start-2 max-w-2xl">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link
                to="/join"
                onClick={() => track("claim_seat_click", { surface: "protocol_hero" })}
                className={`${CTA_BASE} font-bold hover:brightness-110`}
                style={{ background: "var(--accent)", color: "var(--accent-foreground)", boxShadow: "var(--shadow-glow-gold)" }}
              >
                Join The Syndicate — ${SALE_MIN_USDC} →
              </Link>
              <button
                type="button"
                onClick={openWallet}
                className={`${CTA_BASE} font-semibold text-foreground border border-border hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]`}
              >
                Connect wallet
              </button>
              <Link
                to="/transparency"
                onClick={() => track("verify_click", { surface: "protocol_hero" })}
                className={`${CTA_BASE} font-medium`}
                style={{ borderWidth: 1, borderColor: "var(--verify)", color: "var(--verify)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Verify on-chain
              </Link>
            </div>

            {/* Entry preview — $5/$10/$25/$50/$75 → estimated SYN + 70/20/10 */}
            <div className="mt-7 surface p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Preview your entry
                </span>
                <StatusPill status={synStatus} />
              </div>
              <div className="flex flex-wrap gap-2">
                {HERO_PRESETS.map((v) => {
                  const active = v === amount;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(v)}
                      className={`mono text-[12px] tracking-[0.05em] rounded-[3px] px-3.5 py-2 border transition-colors ${
                        active
                          ? "border-[color:var(--accent)] text-[color:var(--accent)] bg-[color:color-mix(in_oklab,var(--accent)_12%,transparent)]"
                          : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                      aria-pressed={active}
                    >
                      ${v}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  ${amount} buys ≈
                </span>
                <span className="amount-lg mono tabular-nums" style={{ color: "var(--gold)" }}>
                  {fmtCount(Math.round(synEstimate))}
                </span>
                <span className="mono text-sm text-foreground/70">SYN</span>
              </div>
              <div className="mt-1 mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {synStatus === "LIVE" ? "Live on-chain quote" : `Estimated at ${ACCESS_RATE_LABEL}`}
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-x-4 gap-y-1">
                {USDC_ROUTING.map((r) => (
                  <span key={r.key} className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <span className="text-foreground/85">{fmtUsd((amount * r.pct) / 100, 2)}</span>{" "}
                    {r.label.replace(" Wallet", "")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM RAIL — chapter · activity · memory (one console) ─────── */}
        <div className="surface overflow-hidden mb-14 md:mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/60">
            {/* Chapter progress */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Current chapter
                </span>
                <StatusPill status={t.chapterProgress.status} />
              </div>
              {chapter ? (
                <>
                  <div className="font-serif text-xl text-foreground leading-none">{chapter.label}</div>
                  <div className="mt-3">
                    <ProgressBar value={chapter.progressPct} max={100} tone="gold" />
                  </div>
                  <div className="mt-2 mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {fmtCount(chapter.taken)} of {fmtCount(chapter.capacity)} · {fmtCount(chapter.remaining)} seats until it seals
                  </div>
                </>
              ) : (
                <div className="amount-lg mono text-foreground/40">—</div>
              )}
            </div>

            {/* Latest activity */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Latest activity
                </span>
                <StatusPill status={pulse.lastBuyTxHash ? "LIVE" : "PENDING"} />
              </div>
              {pulse.lastBuyBuyer ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="amount-lg mono tabular-nums text-foreground">{fmtUsd(pulse.lastBuyUsdc, 2)}</span>
                    <span className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      seat taken
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {formatAgo(pulse.lastBuyAgoSeconds)}
                    </span>
                    {pulse.lastBuyTxHash && (
                      <ProofButton href={txExplorerUrl(pulse.lastBuyTxHash)} ariaLabel="Verify latest purchase on-chain">
                        Tx ↗
                      </ProofButton>
                    )}
                  </div>
                </>
              ) : (
                <div className="mono text-sm text-muted-foreground">Awaiting the first purchase</div>
              )}
            </div>

            {/* Memory state — archive + activity record */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Protocol memory
                </span>
                <StatusPill status={t.members.status} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="amount-lg mono tabular-nums text-foreground">{fmtCount(t.members.value)}</span>
                <span className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  seats in the archive
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                <Link
                  to="/archive"
                  className="mono text-[10px] uppercase tracking-[0.18em] underline-offset-4 hover:underline text-[var(--verify)] hover:text-[var(--gold)]"
                >
                  Open the archive →
                </Link>
                <Link
                  to="/activity"
                  className="mono text-[10px] uppercase tracking-[0.18em] underline-offset-4 hover:underline text-[var(--verify)] hover:text-[var(--gold)]"
                >
                  See live activity →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The radial SVG stage: concentric rings, a slow orbit, connector spokes and
 *  capital dots that flow from the core out to each routing lane. Decoration
 *  only — every figure lives in the HTML overlay nodes. */
function RadialStage({
  lanes,
}: {
  lanes: { key: string; color: string; pos: { wrap: string; line: [number, number] } }[];
}) {
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
      {/* outer ring */}
      <circle cx="200" cy="200" r="196" fill="none" strokeWidth="1" style={{ stroke: "color-mix(in oklab, var(--border) 80%, transparent)" }} />
      {/* slow rotating dashed orbit */}
      <circle cx="200" cy="200" r="152" fill="none" strokeWidth="1" strokeDasharray="2 11" style={{ stroke: "color-mix(in oklab, var(--accent) 40%, transparent)" }}>
        <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="64s" repeatCount="indefinite" />
      </circle>
      {/* inner hub ring framing the green core */}
      <circle cx="200" cy="200" r="78" fill="none" strokeWidth="1.5" style={{ stroke: "color-mix(in oklab, var(--success) 45%, transparent)" }} />
      <circle cx="200" cy="200" r="78" fill="color-mix(in oklab, var(--success) 6%, transparent)" />

      {/* spokes + flowing capital dots, one per lane */}
      {lanes.map((lane, i) => {
        const [x, y] = lane.pos.line;
        const path = `M200,200 L${x},${y}`;
        return (
          <g key={lane.key}>
            <line x1="200" y1="200" x2={x} y2={y} strokeWidth="1" style={{ stroke: "color-mix(in oklab, var(--border) 90%, transparent)" }} />
            <circle r="3.2" style={{ fill: lane.color }}>
              <animateMotion dur="2.8s" begin={`${i * 0.9}s`} repeatCount="indefinite" path={path} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="2.8s" begin={`${i * 0.9}s`} repeatCount="indefinite" />
            </circle>
            {/* lane terminal node */}
            <circle cx={x} cy={y} r="4" style={{ fill: lane.color }} />
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

/** Compact market-context cell for the status ribbon. */
function Ctx({ label, value, status }: { label: string; value: string; status: CanonicalStatus }) {
  const tone =
    status === "LIVE"
      ? "var(--success)"
      : status === "DERIVED"
      ? "var(--accent)"
      : "var(--muted-foreground)";
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-1 rounded-full" style={{ background: tone }} aria-hidden />
      <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground/85 tabular-nums">{value}</span>
    </span>
  );
}
