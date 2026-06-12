// ─── Protocol Hero ────────────────────────────────────────────────────────
// Full-screen, crypto-native protocol hero. Aesthetic: institutional asset
// manager × on-chain intelligence × Swiss private-bank restraint.
//
// HARD RULES honoured here:
//   • Every number is a REAL read from an existing canonical hook
//     (useProtocolTruth / useProtocolPulse / useChainTip / useQuoteSyn).
//   • No invented values. Missing data renders the canonical "—" and carries
//     its real status pill (LIVE / DERIVED / PARTIAL / PENDING).
//   • No new protocol logic, contracts, Story, Recognition, or governance.
//   • Copy is ownership/identity-first — never financial-return language.
//
// The five-act homepage journey continues BELOW this hero unchanged.

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { formatUnits, parseUnits } from "viem";
import { useProtocolTruth, fmtUsd, fmtCount, type TruthStatus } from "@/lib/protocol-truth";
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
// fixed hues so the three routing lanes never collapse into one colour.
const LANE_COLOR: Record<string, string> = {
  gold: "var(--gold)",
  navy: "oklch(0.66 0.13 235)",
  amber: "oklch(0.78 0.13 72)",
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
    fact:
      r.key === "VAULT_WALLET"
        ? t.vaultUsdc
        : r.key === "LIQUIDITY_WALLET"
        ? t.liquidityUsdc
        : t.operationsUsdc,
  }));

  function openWallet() {
    if (typeof document === "undefined") return;
    document.dispatchEvent(new CustomEvent("syndicate:open-wallet"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    track("wallet_connect_click", { surface: "protocol_hero" });
  }

  return (
    <section
      id="top"
      className="relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Ambient field — paper grain + two soft anchors. Pure decoration. */}
      <div aria-hidden className="absolute inset-0 grid-bg opacity-[0.18]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 size-[520px] rounded-full opacity-[0.10] blur-3xl"
        style={{ background: "var(--gradient-gold)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-40 size-[560px] rounded-full opacity-[0.12] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--success), transparent 70%)" }}
      />

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

          {/* Live Avalanche status */}
          <div className="flex items-center gap-2">
            <span
              className={`size-1.5 rounded-full ${chainLive ? "bg-[var(--success)] pulse-dot" : "bg-amber-500"}`}
            />
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-foreground/80">
              Avalanche C-Chain · {AVALANCHE_CHAIN_ID}
            </span>
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
              {chainLive ? `block #${blockNo!.toString()}` : "syncing…"}
            </span>
          </div>

          {/* SYN market context — access rate + reference FDV (both DERIVED from constants) + LP TVL (live) */}
          <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <Ctx label="Access" value={ACCESS_RATE_LABEL.replace(" USDC", "")} status="DERIVED" />
            <Ctx label="Ref. FDV" value={refFdv !== undefined ? fmtUsd(refFdv, 0) : "—"} status="DERIVED" />
            <Ctx label="LP TVL" value={fmtUsd(t.lpTvlUsd.value, 0)} status={t.lpTvlUsd.status} />
          </div>
        </div>

        {/* ── MAIN — headline + capital-flow engine ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 pt-10 md:pt-16 pb-12">
          {/* LEFT — ownership headline, seat, CTAs, entry preview */}
          <div className="max-w-2xl">
            <div className="mono text-[11px] uppercase tracking-[0.26em] text-[var(--accent)] border-l-2 pl-3 mb-6" style={{ borderColor: "var(--accent)" }}>
              The Syndicate · Live on Avalanche
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4.1rem] font-normal tracking-tight leading-[1.04] text-foreground">
              A permanent seat,
              <br />
              <span style={{ color: "var(--gold)" }}>sealed on-chain.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base md:text-lg text-foreground/80 leading-relaxed">
              SYN is your seat — a numbered, verifiable place in the archive that cannot be
              reassigned by anyone, ever. Every USDC routes publicly: 70% Vault, 20% Liquidity,
              10% Operations. The product is identity and belonging.
            </p>

            {/* Next seat — the ownership hook */}
            <div className="mt-7 flex items-center gap-4 rounded-lg border border-border/60 bg-card/50 px-4 py-3 w-fit">
              <div className="flex flex-col">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Your seat would be
                </span>
                <span className="amount-xl mono tabular-nums leading-none mt-0.5" style={{ color: "var(--gold)" }}>
                  {t.nextMemberNumber.value !== undefined ? `#${fmtCount(t.nextMemberNumber.value)}` : "—"}
                </span>
              </div>
              <span className="self-stretch w-px bg-border/60" />
              <div className="flex flex-col">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Members sealed
                </span>
                <span className="amount-xl mono tabular-nums leading-none mt-0.5 text-foreground">
                  {fmtCount(t.members.value)}
                </span>
              </div>
            </div>

            {/* CTAs — Join / Connect / Verify */}
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
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
            <div className="mt-8 surface p-5">
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
                    <span className="text-foreground/85">{fmtUsd((amount * r.pct) / 100, 2)}</span> {r.label.replace(" Wallet", "")}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — the capital-flow engine */}
          <div className="surface elevated p-6 md:p-7 self-start">
            <div className="flex items-center justify-between">
              <span className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                USDC Routed
              </span>
              <StatusPill status={t.usdcRaised.status} />
            </div>

            <div className="mt-2 amount-hero mono tabular-nums leading-none" style={{ color: "var(--success)" }}>
              {t.usdcRaised.value !== undefined ? (
                <AnimatedNumber
                  value={t.usdcRaised.value}
                  prefix="$"
                  format={(n) => n.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                />
              ) : (
                "—"
              )}
            </div>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Cumulative · {fmtCount(t.purchaseCount.value)} purchases
              </span>
              {t.usdcRaised.verifyHref && (
                <ProofButton href={t.usdcRaised.verifyHref} ariaLabel="Verify USDC routed on-chain">
                  Verify ↗
                </ProofButton>
              )}
            </div>

            {/* Flow node → 3 lanes */}
            <div className="mt-6 flex items-center gap-2">
              <span className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                Every USDC routes on-chain
              </span>
              <span className="flex-1 h-px bg-border/60" />
              <span className="mono text-[9px] uppercase tracking-[0.2em] text-[var(--accent)]">70 / 20 / 10</span>
            </div>

            <div className="mt-4 space-y-3">
              {lanes.map((lane) => {
                const color = LANE_COLOR[lane.tone] ?? "var(--gold)";
                return (
                  <div key={lane.key} className="rounded-lg border border-border/50 bg-card/40 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span aria-hidden className="size-2 rounded-full shrink-0 pulse-dot" style={{ background: color }} />
                        <span className="mono text-[12px] uppercase tracking-[0.14em] text-foreground truncate">
                          {lane.label}
                        </span>
                      </div>
                      <span className="mono text-base font-semibold tabular-nums shrink-0" style={{ color }}>
                        {lane.pct}%
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${lane.pct}%`, background: color }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        Held now
                      </span>
                      <span className="mono text-[11px] tabular-nums text-foreground/85">
                        {fmtUsd(lane.fact.value, 2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── BOTTOM RAIL — chapter · activity · memory ──────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-14 md:pb-20">
          {/* Chapter progress */}
          <div className="surface p-5">
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
          <div className="surface p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Latest activity
              </span>
              <StatusPill status={pulse.lastBuyTxHash ? "LIVE" : "PENDING"} />
            </div>
            {pulse.lastBuyBuyer ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="amount-lg mono tabular-nums text-foreground">
                    {fmtUsd(pulse.lastBuyUsdc, 2)}
                  </span>
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
          <div className="surface p-5">
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
    </section>
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
