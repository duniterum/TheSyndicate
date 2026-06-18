// src/components/syndicate/ProtocolHero.tsx
import { useState, useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { formatUnits, parseUnits } from "viem";
import { useProtocolTruth, fmtUsd, fmtCount } from "@/lib/protocol-truth";
import { useChainTip } from "@/lib/chain-time";
import { useQuoteSyn } from "@/lib/sale-hooks";
import { useSynSupply } from "@/lib/treasury-hooks";
import {
  PURCHASE_PRESETS_USDC,
  USDC_ROUTING,
  SALE_MIN_USDC,
  ACCESS_RATE_USDC_PER_SYN,
  ACCESS_RATE_LABEL,
  AVALANCHE_CHAIN_ID,
  USDC_DECIMALS,
  SYN_DECIMALS,
} from "@/lib/syndicate-config";
import {
  StatusPill,
  ProgressBar,
  Section,
  type CanonicalStatus,
} from "./Primitives";
import { AvalancheMark } from "./HeaderWalletChip";
import { HeroActivityRail } from "./HeroActivityRail";
import { track } from "@/lib/analytics";

const HERO_PRESETS = PURCHASE_PRESETS_USDC.slice(0, 5);

const GOLD = "#E3A92B";
const GOLD_2 = "#F2C544";
const GOLD_DARK = "#B87918";
const GOLD_GRAD = "linear-gradient(135deg, #F5C94A 0%, #E3A92B 44%, #9E6412 100%)";
const GOLD_SOFT = "color-mix(in oklab, #E3A92B 13%, transparent)";
const GOLD_LINE = "color-mix(in oklab, #E3A92B 46%, transparent)";
const GOLD_FAINT = "color-mix(in oklab, #E3A92B 8%, transparent)";
const FLAME = "#F97316";
const FLAME_SOFT = "color-mix(in oklab, #F97316 13%, transparent)";
const AVALANCHE_RED = "#E84142";
const GREEN_DEEP = "color-mix(in oklab, var(--success) 78%, #052e1a)";

const LANE_COLOR: Record<string, string> = {
  gold: GOLD,
  navy: "oklch(0.76 0.14 225)",
  amber: "oklch(0.78 0.14 72)",
};

const NODE_POS: Record<string, { wrap: string; line: [number, number] }> = {
  VAULT_WALLET: { wrap: "left-[11%] top-[24%]", line: [86, 112] },
  LIQUIDITY_WALLET: { wrap: "left-[89%] top-[24%]", line: [314, 112] },
  OPERATIONS_WALLET: { wrap: "left-[16%] top-[84%]", line: [108, 276] },
};

const CTA_PRIMARY =
  "mono inline-flex items-center justify-center gap-2 rounded-[4px] px-6 py-4 text-[12px] font-bold uppercase tracking-[0.15em] transition-all duration-200 whitespace-nowrap will-change-transform hover:-translate-y-0.5 hover:brightness-[1.06] active:translate-y-0";

const CTA_SECONDARY =
  "group mono inline-flex items-center justify-center gap-2 rounded-[4px] px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] transition-all duration-200 whitespace-nowrap will-change-transform hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0";

function usePrefersReducedMotion() {
  // Initialize `true` so SSR and the first client render emit NO animation
  // (incl. the SMIL <animate> in the turbulence filter). This keeps hydration
  // stable and guarantees reduced-motion users never receive a flash of motion;
  // normal users gain animation one frame after mount via the effect below.
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function ProtocolHero() {
  const t = useProtocolTruth();
  const tip = useChainTip();
  const supply = useSynSupply();

  const blockNo = tip.data?.number;
  const reducedMotion = usePrefersReducedMotion();
  const chainLive = blockNo !== undefined && !reducedMotion;

  // Burned SYN is a passive proof/memory fact — the live dead-address balance
  // (Proof of Burn), read from the existing on-chain supply hook. Never an
  // action; rendered with the flame palette and a "Proof of Burn" tag.
  const burnedSyn = supply.burned;
  const burnedStatus: CanonicalStatus = burnedSyn !== undefined ? "LIVE" : "PENDING";

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

  const seatLabel =
    t.nextMemberNumber.value !== undefined
      ? `#${fmtCount(t.nextMemberNumber.value)}`
      : "—";

  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-border/60"
      style={{ background: "var(--background)" }}
    >
      <HeroAtmosphere />

      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        {/* Compact cockpit cover — identity · capital engine · live protocol.
            Mobile order: identity + Join → live proof metrics → economy visual;
            xl reconstructs Left | Engine | Right via order utilities. */}
        <div className="grid grid-cols-1 items-start gap-6 py-5 sm:py-6 xl:grid-cols-[1.1fr_1.78fr_1.12fr] xl:gap-8 xl:py-8">
          <HeroLeft />

          <HeroEngine
            className="order-3 xl:order-2"
            seatLabel={seatLabel}
            lanes={lanes}
            chainLive={chainLive}
            routed={t.usdcRaised.value}
            burnedSyn={burnedSyn}
            burnedStatus={burnedStatus}
          />

          <HeroRight
            className="order-2 xl:order-3"
            members={t.members.value}
            membersStatus={t.members.status}
            burnedSyn={burnedSyn}
            burnedStatus={burnedStatus}
            lpTvl={t.lpTvlUsd.value}
            lpStatus={t.lpTvlUsd.status}
          />
        </div>
      </div>
    </section>
  );
}

// Below-cockpit conversion + chapter bridge. Pulled OUT of the immersive cover
// so the homepage cockpit (KPIs · engines · heartbeat) lands in the first
// impression. Owns its own amount state + quote derivation (cheap, deduped
// React-Query reads) so ProtocolHero stays cover-only.
export function HeroEntryStrip() {
  const t = useProtocolTruth();
  const [amount, setAmount] = useState<number>(SALE_MIN_USDC);
  const amountRaw = parseUnits(String(amount), USDC_DECIMALS);
  const quote = useQuoteSyn(amountRaw);
  const liveSyn =
    quote.data !== undefined
      ? Number(formatUnits(quote.data as bigint, SYN_DECIMALS))
      : undefined;
  const synEstimate = liveSyn ?? amount / ACCESS_RATE_USDC_PER_SYN;
  const synStatus: CanonicalStatus = liveSyn !== undefined ? "LIVE" : "DERIVED";
  const chapter = t.chapterProgress.value;

  return (
    <Section id="hero-entry-strip">
      <div className="grid grid-cols-1 gap-6">
        <EntryRail
          amount={amount}
          setAmount={setAmount}
          synEstimate={synEstimate}
          synStatus={synStatus}
        />
        <ChapterStrip chapter={chapter} />
      </div>
    </Section>
  );
}

function HeroLeft({ className = "" }: { className?: string }) {
  return (
    <div className={`relative z-10 max-w-xl lg:pb-10 ${className}`}>
      <h1 className="font-serif text-[clamp(2.6rem,1.8rem+2.6vw,4.25rem)] font-normal leading-[1.0] tracking-[-0.04em] text-foreground">
        Take your seat
        <br />
        in a living{" "}
        <span
          className="inline-block"
          style={{
            color: GOLD,
            textShadow: "0 0 34px color-mix(in oklab, #E3A92B 25%, transparent)",
          }}
        >
          protocol.
        </span>
      </h1>

      <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-foreground/82 md:text-lg">
        Your seat is on-chain. Every USDC route is verifiable. Artifacts carry the memory.
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/join"
          onClick={() => track("claim_seat_click", { surface: "protocol_hero" })}
          className={CTA_PRIMARY}
          style={{
            background: GOLD_GRAD,
            color: "#15110A",
            boxShadow: "0 10px 26px -22px color-mix(in oklab, #E3A92B 48%, transparent)",
          }}
        >
          <CrownIcon />
          Join The Syndicate
        </Link>

        <Link
          to="/transparency"
          onClick={() => track("verify_click", { surface: "protocol_hero" })}
          className={CTA_SECONDARY}
          style={{
            border: "1px solid color-mix(in oklab, var(--verify) 42%, transparent)",
            color: "var(--verify)",
            background: "color-mix(in oklab, var(--verify) 7%, transparent)",
          }}
        >
          <ShieldIcon />
          Verify live flows
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>

      <div className="mt-10 grid max-w-lg grid-cols-2 gap-x-4 gap-y-4 border-t border-border/60 pt-6 sm:grid-cols-4">
        <ProofMini icon={<AvalancheMark size={20} />} title="Live on Avalanche" text="C-Chain" red />
        <ProofMini icon={<ShieldIcon />} title="All routes verified" text="On-chain" />
        <ProofMini icon={<CubeIcon />} title="Artifacts" text="On-chain" />
        <ProofMini icon={<EyeIcon />} title="Transparent" text="Permanent" />
      </div>
    </div>
  );
}

function HeroEngine({
  seatLabel,
  lanes,
  chainLive,
  routed,
  burnedSyn,
  burnedStatus,
  className = "",
}: {
  seatLabel: string;
  lanes: Array<{
    key: string;
    label: string;
    pct: number;
    color: string;
    pos: { wrap: string; line: [number, number] };
    fact: { value: number | undefined; status: CanonicalStatus };
  }>;
  chainLive: boolean;
  routed: number | undefined;
  burnedSyn: number | undefined;
  burnedStatus: CanonicalStatus;
  className?: string;
}) {
  const vaultLane = lanes.find((l) => l.key === "VAULT_WALLET");
  const liquidityLane = lanes.find((l) => l.key === "LIQUIDITY_WALLET");
  const operationsLane = lanes.find((l) => l.key === "OPERATIONS_WALLET");

  return (
    <div className={`relative mx-auto w-full max-w-[460px] py-2 sm:max-w-[500px] lg:self-start xl:max-w-[520px] ${className}`}>
      <div
        aria-hidden
        className="absolute inset-[-8%] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, color-mix(in oklab, ${GREEN_DEEP} 20%, transparent), transparent 56%)`,
        }}
      />

      <div className="relative z-20 mb-4 hidden text-center sm:block">
        <div className="mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
          You are visitor
        </div>
        <div
          className="mono mt-1.5 text-2xl font-bold tracking-[0.02em]"
          style={{ color: GOLD, textShadow: "0 2px 22px color-mix(in oklab, #E3A92B 45%, transparent)" }}
        >
          Seat{" "}
          <span className="inline-block tabular-nums" style={{ minWidth: "3.4ch" }}>
            {seatLabel}
          </span>{" "}
          available
        </div>
      </div>

      <div className="relative hidden aspect-square w-full sm:block">
        <RadialStage lanes={lanes} chainLive={chainLive} />

        <div className="pointer-events-none absolute left-1/2 top-[2%] z-20 w-[26%] -translate-x-1/2">
          <div
            aria-hidden
            className="absolute left-1/2 top-[46%] -z-10 size-[165%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, color-mix(in oklab, #E3A92B 34%, transparent), transparent 64%)",
            }}
          />
          <img
            src="/hero/throne.webp"
            alt=""
            aria-hidden
            width={560}
            height={546}
            draggable={false}
            className="relative h-auto w-full select-none"
            style={{
              filter: "drop-shadow(0 16px 30px color-mix(in oklab, #E3A92B 44%, transparent))",
            }}
          />
        </div>

        {/* Center = the single visual source of USDC routed (founder ruling).
            Shows LIVE USDC FLOW · the headline figure · USDC ROUTED. The number
            reserves a fixed width (minWidth + tabular-nums) so first paint
            ("—") and the loaded value are dimensionally identical. This metric
            is intentionally NOT repeated in the Protocol Overview panel. */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex size-2">
              {chainLive && (
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                  style={{ background: "var(--success)" }}
                />
              )}
              <span
                className="relative inline-flex size-2 rounded-full"
                style={{ background: "var(--success)" }}
              />
            </span>
            <span
              className="mono text-[12px] font-bold uppercase tracking-[0.24em]"
              style={{
                color: "var(--success)",
                textShadow: "0 0 20px color-mix(in oklab, var(--success) 42%, transparent)",
              }}
            >
              Live USDC flow
            </span>
          </div>

          <div
            className="mono mt-2.5 font-bold leading-none tabular-nums"
            style={{
              fontSize: "clamp(1.9rem, 1.3rem + 1.5vw, 2.7rem)",
              color: routed !== undefined ? "var(--success)" : "var(--muted-foreground)",
              textShadow:
                routed !== undefined
                  ? "0 2px 26px color-mix(in oklab, var(--success) 36%, transparent)"
                  : undefined,
            }}
          >
            <span className="inline-block" style={{ minWidth: "9ch" }}>
              {fmtUsd(routed, 2)}
            </span>
          </div>

          <div className="mt-2 mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
            USDC routed
          </div>
        </div>

        {vaultLane && (
          <EngineNode wrap={vaultLane.pos.wrap}>
            <NodeImage src="/hero/icons/vault.webp" />
            <NodeLabel
              title="70% Vault"
              value={fmtUsd(vaultLane.fact.value, 2)}
              color={vaultLane.color}
            />
          </EngineNode>
        )}

        {liquidityLane && (
          <EngineNode wrap={liquidityLane.pos.wrap}>
            <NodeImage src="/hero/icons/liquidity.webp" />
            <NodeLabel
              title="20% Liquidity"
              value={fmtUsd(liquidityLane.fact.value, 2)}
              color={liquidityLane.color}
            />
          </EngineNode>
        )}

        {operationsLane && (
          <EngineNode wrap={operationsLane.pos.wrap}>
            <NodeImage src="/hero/icons/operations.webp" />
            <NodeLabel
              title="10% Operations"
              value={fmtUsd(operationsLane.fact.value, 2)}
              color={operationsLane.color}
            />
          </EngineNode>
        )}

        <EngineNode wrap="left-[84%] top-[84%]">
          <NodeImage src="/hero/icons/membership.webp" />
          <NodeLabel title="Membership Sale" value="Entry" color={GOLD} />
        </EngineNode>
      </div>

      <div className="glass-card elevated p-5 text-center sm:hidden">
        <div className="mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
          You are visitor
        </div>
        <div
          className="mono mt-1.5 text-lg font-bold uppercase tracking-[0.06em]"
          style={{ color: GOLD, textShadow: "0 2px 18px color-mix(in oklab, #E3A92B 42%, transparent)" }}
        >
          Seat{" "}
          <span className="inline-block tabular-nums" style={{ minWidth: "3.4ch" }}>
            {seatLabel}
          </span>{" "}
          available
        </div>
        <div className="mx-auto mt-4 flex items-center justify-center">
          <img
            src="/hero/throne.webp"
            alt=""
            aria-hidden
            width={560}
            height={546}
            draggable={false}
            className="h-auto w-[100px] select-none"
            style={{
              filter: "drop-shadow(0 12px 22px color-mix(in oklab, #E3A92B 42%, transparent))",
            }}
          />
        </div>
        <div className="mt-5 flex items-center justify-center gap-2">
          <span
            className="relative inline-flex size-2 rounded-full"
            style={{ background: "var(--success)" }}
          />
          <span
            className="mono text-[11px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "var(--success)" }}
          >
            Live USDC flow
          </span>
        </div>
        <div
          className="mono mt-2 text-3xl font-bold leading-none tabular-nums"
          style={{
            color: routed !== undefined ? "var(--success)" : "var(--muted-foreground)",
            textShadow:
              routed !== undefined
                ? "0 2px 22px color-mix(in oklab, var(--success) 34%, transparent)"
                : undefined,
          }}
        >
          <span className="inline-block" style={{ minWidth: "9ch" }}>
            {fmtUsd(routed, 2)}
          </span>
        </div>
        <div className="mt-1.5 mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          USDC routed
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {lanes.map((lane) => (
            <div key={lane.key} className="rounded-lg border border-border/50 bg-card/50 px-2 py-3">
              <div className="mono text-sm font-semibold tabular-nums" style={{ color: lane.color }}>
                {lane.pct}%
              </div>
              <div className="mono mt-1 text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                {lane.label.replace(" Wallet", "")}
              </div>
              <div className="mono mt-1 text-[10px] text-foreground/85">
                {fmtUsd(lane.fact.value, 2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BurnMonument burnedSyn={burnedSyn} status={burnedStatus} />
    </div>
  );
}

/**
 * Burn monument — the symbolic opposite of the throne. Sits directly beneath
 * the engine (seat on top, burn at the bottom: beginning and end of supply),
 * integrated into the mountain with NO card / border / panel / CTA / link.
 * A premium, low-cost animated flame (transform + opacity only) that freezes
 * under prefers-reduced-motion. The burned value is the live Proof-of-Burn
 * dead-address balance; never an action.
 */
function BurnMonument({
  burnedSyn,
  status,
}: {
  burnedSyn: number | undefined;
  status: CanonicalStatus;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const known = burnedSyn !== undefined;
  const embers = [
    { x: "38%", kf: "syn-ember-l", delay: "0s", dur: "4.2s", size: 3 },
    { x: "46%", kf: "syn-ember-c", delay: "0.6s", dur: "4.8s", size: 2 },
    { x: "54%", kf: "syn-ember-r", delay: "1.0s", dur: "4.4s", size: 3 },
    { x: "61%", kf: "syn-ember-r", delay: "1.6s", dur: "5.0s", size: 2 },
    { x: "42%", kf: "syn-ember-l", delay: "2.1s", dur: "4.6s", size: 2 },
    { x: "50%", kf: "syn-ember-c", delay: "2.6s", dur: "4.9s", size: 3 },
    { x: "57%", kf: "syn-ember-l", delay: "3.2s", dur: "4.3s", size: 2 },
    { x: "35%", kf: "syn-ember-r", delay: "3.7s", dur: "4.7s", size: 2 },
    { x: "64%", kf: "syn-ember-c", delay: "1.3s", dur: "5.1s", size: 2 },
  ];
  const coals = [
    { cx: 80, r: 2.6, dur: "2.8s", delay: "0s" },
    { cx: 92, r: 3.0, dur: "3.3s", delay: "0.5s" },
    { cx: 100, r: 3.4, dur: "2.6s", delay: "0.2s" },
    { cx: 109, r: 3.0, dur: "3.1s", delay: "0.8s" },
    { cx: 120, r: 2.6, dur: "2.9s", delay: "0.4s" },
  ];
  return (
    <div className="relative z-10 mt-5 flex flex-col items-center text-center select-none sm:mt-7">
      <div className="syn-burn-flame relative flex h-[184px] w-[152px] items-end justify-center sm:h-[200px] sm:w-[166px]" aria-hidden>
        {/* warm radial halo + ground glow — centered by flex; scale/opacity only */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div
            className="h-[155%] w-[155%] rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 50% 60%, color-mix(in oklab, #FDBA74 48%, transparent) 0%, color-mix(in oklab, #F97316 30%, transparent) 30%, color-mix(in oklab, #B45309 15%, transparent) 56%, transparent 74%)",
              animation: reducedMotion ? undefined : "syn-glow-pulse 4.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* living fire: layered flame whose organic edges come from a
            turbulence + displacement filter, over a glowing coal bed */}
        <svg
          viewBox="0 0 200 260"
          className="relative h-full w-auto overflow-visible"
          style={{
            filter: "drop-shadow(0 8px 18px color-mix(in oklab, #7C2D12 50%, transparent))",
          }}
        >
          <defs>
            <linearGradient id="syn-flame-body" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#7C2D12" />
              <stop offset="14%" stopColor="#B45309" />
              <stop offset="40%" stopColor="#EA580C" />
              <stop offset="66%" stopColor="#F97316" />
              <stop offset="86%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FCD34D" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="syn-flame-mid" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="38%" stopColor="#FB923C" />
              <stop offset="72%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>
            <linearGradient id="syn-flame-core" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="55%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <radialGradient id="syn-flame-bed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF7E0" stopOpacity="0.95" />
              <stop offset="42%" stopColor="#FDBA74" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
            </radialGradient>
            <filter id="syn-fire-distort" x="-45%" y="-25%" width="190%" height="150%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.016 0.05"
                numOctaves="2"
                seed="7"
                result="n"
              >
                {!reducedMotion && (
                  <animate
                    attributeName="baseFrequency"
                    dur="7s"
                    values="0.016 0.045;0.022 0.063;0.014 0.052;0.016 0.045"
                    repeatCount="indefinite"
                  />
                )}
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="n"
                scale="9"
                xChannelSelector="R"
                yChannelSelector="G"
                result="d"
              />
              <feGaussianBlur in="d" stdDeviation="0.5" />
            </filter>
            <filter id="syn-fire-bed" x="-60%" y="-80%" width="220%" height="260%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* glowing coal / ember bed beneath the flame */}
          <ellipse
            cx="100"
            cy="234"
            rx="60"
            ry="16"
            fill="url(#syn-flame-bed)"
            filter="url(#syn-fire-bed)"
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
              animation: reducedMotion ? undefined : "syn-bed-pulse 3.4s ease-in-out infinite",
            }}
          />
          <ellipse
            cx="100"
            cy="234"
            rx="30"
            ry="8.5"
            fill="#FFE9B0"
            opacity="0.9"
            filter="url(#syn-fire-bed)"
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
              animation: reducedMotion ? undefined : "syn-bed-pulse 2.7s ease-in-out infinite",
            }}
          />
          {coals.map((c, i) => (
            <ellipse
              key={i}
              cx={c.cx}
              cy={234}
              rx={c.r}
              ry={c.r * 0.7}
              fill={i % 2 === 0 ? "#FFF3D0" : "#FDBA74"}
              style={{
                transformBox: "fill-box",
                transformOrigin: "50% 50%",
                animation: reducedMotion ? undefined : `syn-coal-pulse ${c.dur} ease-in-out ${c.delay} infinite`,
              }}
            />
          ))}

          {/* flame body + mid + white-hot core, distorted as one living mass */}
          <g
            filter="url(#syn-fire-distort)"
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 100%",
              animation: reducedMotion ? undefined : "syn-flame-breathe 4.4s ease-in-out infinite",
            }}
          >
            {/* flanking licking tongues — widen the base into a fuller fire */}
            <path
              d="M86 236 C66 232 58 210 64 186 C68 172 60 164 70 152 C74 166 78 176 82 194 C86 214 92 230 86 236 Z"
              fill="url(#syn-flame-body)"
              opacity="0.9"
            />
            <path
              d="M114 236 C134 232 142 210 136 186 C132 172 140 164 130 152 C126 166 122 176 118 194 C114 214 108 230 114 236 Z"
              fill="url(#syn-flame-body)"
              opacity="0.9"
            />
            <path
              d="M100 236 C66 232 50 200 60 168 C66 150 53 138 64 120 C71 108 61 96 74 88 C79 72 69 64 81 58 C85 44 92 36 100 24 C110 38 117 50 121 64 C130 70 123 80 132 90 C143 98 133 110 140 122 C151 140 137 152 144 170 C153 200 134 232 100 236 Z"
              fill="url(#syn-flame-body)"
            />
            <path
              d="M100 232 C80 228 70 204 78 178 C83 162 74 152 85 136 C90 124 83 114 92 104 C96 90 91 82 97 72 C99 64 100 58 100 52 C102 60 105 70 108 80 C114 92 108 102 113 114 C121 126 114 136 119 152 C126 178 119 206 100 232 Z"
              fill="url(#syn-flame-mid)"
            />
            <path
              d="M100 228 C88 226 80 206 87 184 C91 170 86 162 92 148 C96 136 92 128 96 116 C98 106 100 100 100 94 C102 104 104 114 106 126 C110 140 106 150 109 164 C114 184 110 206 100 228 Z"
              fill="url(#syn-flame-core)"
            />
          </g>
        </svg>

        {/* rising embers (motion only) */}
        {!reducedMotion &&
          embers.map((e, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: e.x,
                bottom: "15%",
                width: `${e.size}px`,
                height: `${e.size}px`,
                background: i % 3 === 0 ? "#FFF7E0" : i % 3 === 1 ? "#FDE68A" : "#FBBF24",
                boxShadow: "0 0 6px color-mix(in oklab, #F97316 70%, transparent)",
                animation: `${e.kf} ${e.dur} ease-out ${e.delay} infinite`,
              }}
            />
          ))}
      </div>

      <div
        className="mono mt-3 text-[11px] uppercase tracking-[0.34em]"
        style={{ color: "color-mix(in oklab, #FBBF24 34%, var(--muted-foreground))" }}
      >
        Burned supply
      </div>
      <div
        className="mt-1.5 text-[clamp(2.1rem,1.3rem+1.9vw,3.1rem)] font-semibold leading-none tabular-nums"
        style={
          known
            ? {
                fontFamily: "var(--font-mono)",
                backgroundImage:
                  "linear-gradient(180deg, #FDE68A 0%, #F2C544 40%, #E3A92B 72%, #F97316 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 0 22px color-mix(in oklab, #F97316 36%, transparent))",
              }
            : { fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }
        }
      >
        {known ? `${fmtCount(burnedSyn)} SYN` : "—"}
      </div>
      <div
        className="mono mt-2 text-[11px] uppercase tracking-[0.32em]"
        style={{
          color: known ? FLAME : "var(--muted-foreground)",
          textShadow: known ? "0 0 16px color-mix(in oklab, #F97316 45%, transparent)" : undefined,
        }}
      >
        {known ? "Proof of Burn" : status}
      </div>
    </div>
  );
}

function statusTone(status: CanonicalStatus) {
  return status === "LIVE"
    ? "var(--success)"
    : status === "DERIVED"
    ? "var(--verify)"
    : status === "PARTIAL"
    ? GOLD
    : "var(--muted-foreground)";
}

/**
 * One row in the Protocol Overview panel. Every row reserves a FIXED value
 * width (`reserveCh`, in `ch`) and uses `tabular-nums`, so the "—" / PENDING
 * placeholder occupies exactly the same box as the loaded value — first paint
 * and hydrated state are dimensionally identical (no reflow / pop-in). The row
 * structure (label · value · status) is constant regardless of data, so the
 * panel height never changes as values resolve.
 */
function HeroStat({
  label,
  value,
  format,
  status,
  tone,
  note,
  reserveCh,
  suffix,
  knownBadge,
}: {
  label: string;
  value: number | undefined;
  format: (n: number | undefined) => string;
  status: CanonicalStatus;
  tone: string;
  note: string;
  reserveCh: number;
  suffix?: string;
  knownBadge?: { label: string; color: string };
}) {
  const known = value !== undefined;
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mono mt-2 flex items-baseline gap-1.5 leading-none">
        <span
          className="inline-block text-[clamp(1.75rem,1.25rem+1vw,2.15rem)] font-bold tabular-nums"
          style={{
            minWidth: `${reserveCh}ch`,
            color: known ? tone : "var(--muted-foreground)",
            textShadow: known
              ? `0 2px 22px color-mix(in oklab, ${tone} 26%, transparent)`
              : undefined,
          }}
        >
          {format(value)}
        </span>
        {known && suffix && (
          <span className="text-sm font-semibold text-muted-foreground">{suffix}</span>
        )}
      </div>
      {/* Two-line meta stack (status on line 1, note on line 2, both
          nowrap). Fixed at two lines so a longer status word (PENDING /
          DERIVED) can never wrap and reflow the rows below — first paint and
          loaded state keep identical height. */}
      <div className="mono mt-2.5 space-y-1 text-[9px] uppercase tracking-[0.14em]">
        {known && knownBadge ? (
          <div
            className="flex items-center gap-1 whitespace-nowrap"
            style={{ color: knownBadge.color }}
          >
            <span className="size-1 rounded-full" style={{ background: knownBadge.color }} />
            {knownBadge.label}
          </div>
        ) : (
          <div className="flex items-center gap-1 whitespace-nowrap text-muted-foreground">
            <span className="size-1 rounded-full" style={{ background: statusTone(status) }} />
            {status}
          </div>
        )}
        <div className="whitespace-nowrap text-muted-foreground/60">{note}</div>
      </div>
    </div>
  );
}

function HeroRight({
  members,
  membersStatus,
  burnedSyn,
  burnedStatus,
  lpTvl,
  lpStatus,
  className = "",
}: {
  members: number | undefined;
  membersStatus: CanonicalStatus;
  burnedSyn: number | undefined;
  burnedStatus: CanonicalStatus;
  lpTvl: number | undefined;
  lpStatus: CanonicalStatus;
  className?: string;
}) {
  return (
    <div className={`relative z-10 grid gap-3 lg:pb-10 ${className}`}>
      <div className="surface p-6 sm:p-7">
        <div className="mono mb-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Protocol overview
        </div>

        {/* Hero-support metrics — clean panel beside the radial. USDC routed is
            intentionally NOT here: it lives once, in the radial center, as the
            single visual source. Order: Members → Burned SYN → LP TVL. */}
        <div className="flex flex-col">
          <HeroStat
            label="Members"
            value={members}
            format={fmtCount}
            status={membersStatus}
            tone={GOLD}
            note="On-chain seats"
            reserveCh={6}
          />

          <div className="mt-5 border-t border-border/50 pt-5">
            <HeroStat
              label="Burned SYN"
              value={burnedSyn}
              format={fmtCount}
              suffix="SYN"
              status={burnedStatus}
              tone={FLAME}
              note="Permanently removed"
              reserveCh={6}
              knownBadge={{ label: "Proof of Burn", color: FLAME }}
            />
          </div>

          <div className="mt-5 border-t border-border/50 pt-5">
            <HeroStat
              label="LP TVL"
              value={lpTvl}
              format={(n) => fmtUsd(n, 2)}
              status={lpStatus}
              tone="var(--foreground)"
              note="SYN / USDC pool"
              reserveCh={9}
            />
          </div>
        </div>
      </div>

      <HeroActivityRail />
    </div>
  );
}

function ChapterStrip({
  chapter,
  className = "",
}: {
  chapter:
    | { label: string; progressPct: number; taken: number; capacity: number; remaining: number }
    | undefined;
  className?: string;
}) {
  return (
    <div
      className={`relative z-10 rounded-xl border p-5 md:p-6 ${className}`}
      style={{
        borderColor: GOLD_LINE,
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--card) 72%, transparent), color-mix(in oklab, var(--background) 72%, transparent))",
        boxShadow: "0 22px 70px -52px color-mix(in oklab, #E3A92B 60%, transparent)",
      }}
    >
      <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[3fr_5fr_2fr] md:gap-8">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Current chapter
          </div>
          {chapter ? (
            <>
              <div className="mt-1.5 font-serif text-[1.95rem] leading-none text-foreground">
                {chapter.label}
              </div>
              <div className="mono mt-2 text-[11px] uppercase tracking-[0.16em]" style={{ color: GOLD }}>
                In progress
              </div>
            </>
          ) : (
            <div className="mt-2 mono text-sm text-muted-foreground">Chapter syncing</div>
          )}
        </div>

        {chapter ? (
          <div>
            <div className="mono mb-2 flex items-baseline justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Seats filled</span>
              <span className="tabular-nums" style={{ color: GOLD }}>
                {chapter.progressPct}%
              </span>
            </div>
            <div
              className="rounded-full p-[2px]"
              style={{ background: "color-mix(in oklab, #E3A92B 14%, transparent)" }}
            >
              <ProgressBar value={chapter.progressPct} max={100} tone="gold" size="lg" />
            </div>
            <div className="mt-3.5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <span className="mono text-3xl font-bold tabular-nums text-foreground">
                {fmtCount(chapter.taken)}
                <span className="ml-1.5 text-base font-normal text-muted-foreground">
                  / {fmtCount(chapter.capacity)} seats
                </span>
              </span>
              <span className="mono text-base font-semibold tabular-nums" style={{ color: GOLD }}>
                {fmtCount(chapter.remaining)} remaining
              </span>
            </div>
          </div>
        ) : (
          <div />
        )}

        <Link
          to="/chapters"
          className="mono inline-flex items-center justify-center rounded-[4px] border px-5 py-3.5 text-[11px] uppercase tracking-[0.16em] transition-all hover:brightness-110 md:justify-self-end"
          style={{
            borderColor: GOLD_LINE,
            color: GOLD,
            background: "color-mix(in oklab, #E3A92B 8%, transparent)",
          }}
        >
          View chapter →
        </Link>
      </div>
    </div>
  );
}

function EntryRail({
  amount,
  setAmount,
  synEstimate,
  synStatus,
  className = "",
}: {
  amount: number;
  setAmount: (amount: number) => void;
  synEstimate: number;
  synStatus: CanonicalStatus;
  className?: string;
}) {
  return (
    <div className={`relative z-10 rounded-xl border p-5 backdrop-blur-xl md:p-6 ${className}`}
      style={{
        borderColor: GOLD_LINE,
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--card) 76%, transparent), color-mix(in oklab, var(--background) 76%, transparent))",
        boxShadow: "0 25px 80px -45px color-mix(in oklab, #E3A92B 65%, transparent)",
      }}
    >
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.05fr_2.2fr_1fr_2.4fr]">
        <div>
          <div className="mono text-xl uppercase tracking-[0.08em] text-foreground">
            Join the protocol
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Preview your entry. Your USDC routes automatically. Your seat is permanent.
          </p>
        </div>

        <div>
          <div className="mono mb-3 text-[10px] uppercase tracking-[0.18em]" style={{ color: GOLD }}>
            Entry preview ({synStatus === "LIVE" ? "live rate" : "access rate"})
          </div>
          <div className="flex flex-wrap gap-2.5">
            {HERO_PRESETS.map((v) => {
              const active = amount === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  aria-pressed={active}
                  className="mono min-w-[78px] rounded-[6px] border px-5 py-3.5 text-lg tracking-[0.02em] transition-all"
                  style={
                    active
                      ? {
                          color: "#15110A",
                          borderColor: GOLD,
                          background: GOLD_GRAD,
                          boxShadow: "0 12px 28px -16px color-mix(in oklab, #E3A92B 80%, transparent)",
                        }
                      : {
                          color: "var(--foreground)",
                          borderColor: "color-mix(in oklab, var(--border) 66%, transparent)",
                          background: "color-mix(in oklab, var(--card) 42%, transparent)",
                        }
                  }
                >
                  ${v}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:border-l lg:border-border/60 lg:pl-8">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            You receive
          </div>
          <div className="mono mt-2 text-4xl font-semibold tabular-nums text-foreground">
            {fmtCount(Math.round(synEstimate))} SYN
          </div>
          <div className="mt-2">
            <StatusPill status={synStatus} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 lg:border-l lg:border-border/60 lg:pl-8">
          {USDC_ROUTING.map((r) => {
            const color = LANE_COLOR[r.tone] ?? GOLD;
            return (
              <div key={r.key}>
                <div className="flex items-center gap-2">
                  {r.key === "VAULT_WALLET" ? (
                    <VaultIcon color={color} />
                  ) : r.key === "LIQUIDITY_WALLET" ? (
                    <DropIcon color={color} />
                  ) : (
                    <GearIcon color={color} />
                  )}
                  <div className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {r.pct}% {r.label.replace(" Wallet", "")}
                  </div>
                </div>
                <div className="mono mt-2 text-2xl tabular-nums text-foreground">
                  {fmtUsd((amount * r.pct) / 100, 2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RadialStage({
  lanes,
  chainLive,
}: {
  lanes: { key: string; color: string; pos: { line: [number, number] } }[];
  chainLive: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const orbitPath = "M200,35 a165,165 0 1,0 0,330 a165,165 0 1,0 0,-330";

  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <radialGradient id="heroHub" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`color-mix(in oklab, ${GREEN_DEEP} 22%, transparent)`} />
          <stop offset="52%" stopColor="color-mix(in oklab, #E3A92B 7%, transparent)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <circle cx="200" cy="200" r="190" fill="none" strokeWidth="1" style={{ stroke: GOLD_LINE }} />
      <circle cx="200" cy="200" r="166" fill="none" strokeWidth="1" strokeDasharray="3 10" style={{ stroke: GOLD_LINE }}>
        {!reducedMotion && (
          <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="90s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="200" cy="200" r="132" fill="none" strokeWidth="1" style={{ stroke: "color-mix(in oklab, #E3A92B 28%, transparent)" }} />
      <circle cx="200" cy="200" r="114" fill="url(#heroHub)" />
      <circle cx="200" cy="200" r="114" fill="none" strokeWidth="1.4" style={{ stroke: `color-mix(in oklab, ${GREEN_DEEP} 58%, transparent)` }} />

      {chainLive &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} r={i % 2 ? 2.2 : 3} style={{ fill: i % 2 ? GOLD_2 : GOLD }}>
            <animateMotion dur="24s" begin={`${i * 4}s`} repeatCount="indefinite" path={orbitPath} rotate="auto" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" dur="24s" begin={`${i * 4}s`} repeatCount="indefinite" />
          </circle>
        ))}

      {lanes.map((lane, i) => {
        const [x, y] = lane.pos.line;
        const path = `M200,200 L${x},${y}`;
        return (
          <g key={lane.key}>
            <line
              x1="200"
              y1="200"
              x2={x}
              y2={y}
              strokeWidth="1"
              style={{ stroke: "color-mix(in oklab, var(--border) 85%, transparent)" }}
            />
            {chainLive && (
              <circle r="3.5" style={{ fill: lane.color }}>
                <animateMotion dur="3.1s" begin={`${i * 0.8}s`} repeatCount="indefinite" path={path} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.82;1" dur="3.1s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function EngineNode({ wrap, children }: { wrap: string; children: ReactNode }) {
  return (
    <div className={`absolute ${wrap} z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center`}>
      {children}
    </div>
  );
}

function NodeImage({ src }: { src: string }) {
  return (
    <div className="relative mx-auto mb-2 flex size-16 items-center justify-center sm:size-[68px]">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full blur-md"
        style={{
          background:
            "radial-gradient(circle at 50% 46%, color-mix(in oklab, #E3A92B 38%, transparent), transparent 70%)",
        }}
      />
      <img
        src={src}
        alt=""
        aria-hidden
        width={68}
        height={68}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-full w-full select-none object-contain"
        style={{ filter: "drop-shadow(0 6px 13px color-mix(in oklab, #5c3d0a 58%, transparent))" }}
      />
    </div>
  );
}

function NodeLabel({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{ textShadow: "0 1px 12px color-mix(in oklab, var(--background) 82%, transparent)" }}>
      <div className="mono text-[13px] font-semibold uppercase tracking-[0.08em] text-foreground sm:text-[15px]">
        {title}
      </div>
      {value && (
        <div className="mono mt-1 text-[18px] font-bold tabular-nums sm:text-[20px]" style={{ color }}>
          {value}
        </div>
      )}
    </div>
  );
}

function HeroAtmosphere() {
  return (
    <>
      {/* Photographic Swiss-alps backdrop — the Cervin / Matterhorn at golden
          dawn. Shown in BOTH themes: dark reads it as a moody golden-dawn scene,
          light as a warm washed horizon. Theme-adaptive scrims below keep the
          headline and radial engine readable in either mode. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.5] dark:opacity-[0.6]"
        style={{ backgroundImage: "url(/hero/cervin.webp)" }}
      />
      {/* Readability scrim — darkens top/bottom and the left text column while
          letting the golden horizon glow through behind the radial engine. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--background) 70%, transparent) 0%, color-mix(in oklab, var(--background) 22%, transparent) 44%, color-mix(in oklab, var(--background) 88%, transparent) 100%), linear-gradient(90deg, color-mix(in oklab, var(--background) 84%, transparent) 0%, color-mix(in oklab, var(--background) 30%, transparent) 46%, transparent 70%, color-mix(in oklab, var(--background) 24%, transparent) 100%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-bg opacity-[0.06]" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(72% 62% at 52% 38%, color-mix(in oklab, #E3A92B 14%, transparent), transparent 64%), radial-gradient(60% 52% at 6% 55%, color-mix(in oklab, #E3A92B 12%, transparent), transparent 62%)",
        }}
      />
    </>
  );
}

/* Icons */

function CrownIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 18h14l1-10-5.2 3.8L12 5 9.2 11.8 4 8l1 10Zm0 2h14v2H5v-2Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 16V8l-9-5-9 5v8l9 5 9-5Z" />
      <path d="m3.3 7.7 8.7 5 8.7-5M12 22V12" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function VaultIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
    </svg>
  );
}

function DropIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2s7 8 7 13a7 7 0 0 1-14 0C5 10 12 2 12 2Z" />
    </svg>
  );
}

function GearIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 0 1 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function JoinIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

function ProofMini({
  icon,
  title,
  text,
  red,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  red?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex size-8 items-center justify-center rounded-full"
        style={{
          color: red ? AVALANCHE_RED : "var(--foreground)",
          background: red
            ? `color-mix(in oklab, ${AVALANCHE_RED} 12%, transparent)`
            : "color-mix(in oklab, var(--card) 36%, transparent)",
        }}
      >
        {icon}
      </span>
      <div>
        <div className="mono text-[9px] uppercase tracking-[0.12em] text-foreground">
          {title}
        </div>
        <div className="mono mt-0.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          {text}
        </div>
      </div>
    </div>
  );
}
