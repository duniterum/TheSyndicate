// src/components/syndicate/ProtocolHero.tsx
import { useState, useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { formatUnits, parseUnits } from "viem";
import { useProtocolTruth, fmtUsd, fmtCount } from "@/lib/protocol-truth";
import { useProtocolPulse } from "@/lib/protocol-pulse";
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
  txExplorerUrl,
} from "@/lib/syndicate-config";
import {
  StatusPill,
  ProgressBar,
  AnimatedNumber,
  ProofButton,
  type CanonicalStatus,
} from "./Primitives";
import { AvalancheMark } from "./HeaderWalletChip";
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
  VAULT_WALLET: { wrap: "left-[14%] top-[31%]", line: [104, 132] },
  LIQUIDITY_WALLET: { wrap: "left-[86%] top-[31%]", line: [296, 132] },
  OPERATIONS_WALLET: { wrap: "left-[16%] top-[84%]", line: [108, 276] },
};

const CTA_PRIMARY =
  "mono inline-flex items-center justify-center gap-2 rounded-[4px] px-6 py-4 text-[12px] font-bold uppercase tracking-[0.15em] transition-all duration-200 whitespace-nowrap";

const CTA_SECONDARY =
  "mono inline-flex items-center justify-center gap-2 rounded-[4px] px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] transition-all duration-200 whitespace-nowrap";

const fmtCompactUsd = (n: number | undefined): string =>
  n === undefined
    ? "—"
    : `$${Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(n)}`;

const fmtCompactSyn = (n: number | undefined): string =>
  n === undefined
    ? "—"
    : `${Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(n)} SYN`;

const fmtCoreUsd = (n: number): string =>
  n >= 100_000
    ? Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(n)
    : Math.round(n).toLocaleString("en-US");

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
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
  const pulse = useProtocolPulse();
  const tip = useChainTip();
  const supply = useSynSupply();

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
  const blockNo = tip.data?.number;
  const reducedMotion = usePrefersReducedMotion();
  const chainLive = blockNo !== undefined && !reducedMotion;

  // Burned SYN is a passive proof/memory fact — the live dead-address balance
  // (Proof of Fire), read from the existing on-chain supply hook. Never an
  // action; rendered with the flame palette and a "Proof of Fire" tag.
  const burnedSyn = supply.burned;
  const burnedStatus: CanonicalStatus = burnedSyn !== undefined ? "LIVE" : "PENDING";

  const totalSupply = t.totalSupplySyn.value;
  const effectiveSupply =
    totalSupply !== undefined && burnedSyn !== undefined
      ? Math.max(0, totalSupply - burnedSyn)
      : undefined;

  const refFdv =
    effectiveSupply !== undefined
      ? effectiveSupply * ACCESS_RATE_USDC_PER_SYN
      : totalSupply !== undefined
      ? totalSupply * ACCESS_RATE_USDC_PER_SYN
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
  const seatLabel =
    t.nextMemberNumber.value !== undefined
      ? `#${fmtCount(t.nextMemberNumber.value)}`
      : "—";

  const latestLabel = pulse.lastBuyTxHash ? "Latest purchase verified" : "Awaiting purchase";
  const latestAmount =
    pulse.lastBuyUsdc !== undefined ? fmtUsd(pulse.lastBuyUsdc, 2) : "—";

  return (
    <section
      id="top"
      className="relative min-h-[calc(100svh-64px)] overflow-hidden border-b border-border/60"
      style={{ background: "var(--background)" }}
    >
      <HeroAtmosphere />

      <div className="relative mx-auto max-w-[1480px] px-5 md:px-8">
        <div className="grid min-h-[calc(100svh-64px)] grid-cols-1 items-start gap-6 py-6 xl:grid-cols-[1.1fr_1.78fr_1.12fr] xl:gap-8">
          <HeroLeft className="xl:col-start-1 xl:row-start-1" />

          <HeroEngine
            className="xl:col-start-2 xl:row-start-1"
            amount={amount}
            routedValue={routedValue}
            routedStatus={t.usdcRaised.status}
            synEstimate={synEstimate}
            synStatus={synStatus}
            seatLabel={seatLabel}
            chapterLabel={chapter?.label}
            lanes={lanes}
            chainLive={chainLive}
            burnedSyn={burnedSyn}
            burnedStatus={burnedStatus}
          />

          <EntryRail
            className="xl:col-start-1 xl:col-span-3 xl:row-start-3"
            amount={amount}
            setAmount={setAmount}
            synEstimate={synEstimate}
            synStatus={synStatus}
          />

          <HeroRight
            className="xl:col-start-3 xl:row-start-1"
            members={t.members.value}
            membersStatus={t.members.status}
            nextSeat={seatLabel}
            synPrice={t.synPriceUsd.value}
            synPriceStatus={t.synPriceUsd.status}
            routedValue={t.usdcRaised.value}
            routedStatus={t.usdcRaised.status}
            totalSupply={totalSupply}
            totalSupplyStatus={t.totalSupplySyn.status}
            effectiveSupply={effectiveSupply}
            burnedSyn={burnedSyn}
            burnedStatus={burnedStatus}
            refFdv={refFdv}
            vault={t.vaultUsdc.value}
            vaultStatus={t.vaultUsdc.status}
            liquidity={t.liquidityUsdc.value}
            liquidityStatus={t.liquidityUsdc.status}
            operations={t.operationsUsdc.value}
            operationsStatus={t.operationsUsdc.status}
            latestLabel={latestLabel}
            latestAmount={latestAmount}
            latestTx={pulse.lastBuyTxHash}
          />

          <ChapterStrip
            className="xl:col-start-1 xl:col-span-3 xl:row-start-2"
            chapter={chapter}
          />
        </div>

        <BottomFacts
          members={t.members.value}
          membersStatus={t.members.status}
          routed={t.usdcRaised.value}
          routedStatus={t.usdcRaised.status}
          vault={t.vaultUsdc.value}
          vaultStatus={t.vaultUsdc.status}
          liquidity={t.liquidityUsdc.value}
          liquidityStatus={t.liquidityUsdc.status}
          operations={t.operationsUsdc.value}
          operationsStatus={t.operationsUsdc.status}
          synPrice={t.synPriceUsd.value}
          synPriceStatus={t.synPriceUsd.status}
          totalSupply={totalSupply}
          totalSupplyStatus={t.totalSupplySyn.status}
          burnedSyn={burnedSyn}
          burnedStatus={burnedStatus}
          chapterLabel={chapter?.label}
        />
      </div>
    </section>
  );
}

function HeroLeft({ className = "" }: { className?: string }) {
  return (
    <div className={`relative z-10 max-w-xl lg:pb-10 ${className}`}>
      <h1 className="font-serif text-[clamp(3.2rem,2.15rem+3.2vw,5.75rem)] font-normal leading-[0.98] tracking-[-0.045em] text-foreground">
        Own the
        <br />
        economy.
        <br />
        Secure the{" "}
        <span
          className="inline-block"
          style={{
            color: GOLD,
            textShadow: "0 0 34px color-mix(in oklab, #E3A92B 25%, transparent)",
          }}
        >
          future.
        </span>
      </h1>

      <p className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-foreground/82 md:text-lg">
        SYN is your seat.
        <br />
        Every dollar routes. Every action is verified.
        <br />
        Artifacts are the memory.
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
          Join the protocol
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
          <span aria-hidden>→</span>
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
  amount,
  routedValue,
  routedStatus,
  synEstimate,
  synStatus,
  seatLabel,
  chapterLabel,
  lanes,
  chainLive,
  burnedSyn,
  burnedStatus,
  className = "",
}: {
  amount: number;
  routedValue: number | undefined;
  routedStatus: CanonicalStatus;
  synEstimate: number;
  synStatus: CanonicalStatus;
  seatLabel: string;
  chapterLabel: string | undefined;
  lanes: Array<{
    key: string;
    label: string;
    pct: number;
    color: string;
    pos: { wrap: string; line: [number, number] };
    fact: { value: number | undefined; status: CanonicalStatus };
  }>;
  chainLive: boolean;
  burnedSyn: number | undefined;
  burnedStatus: CanonicalStatus;
  className?: string;
}) {
  const vaultLane = lanes.find((l) => l.key === "VAULT_WALLET");
  const liquidityLane = lanes.find((l) => l.key === "LIQUIDITY_WALLET");
  const operationsLane = lanes.find((l) => l.key === "OPERATIONS_WALLET");

  return (
    <div className={`relative mx-auto w-full max-w-[640px] py-2 lg:self-start ${className}`}>
      <div
        aria-hidden
        className="absolute inset-[-8%] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, color-mix(in oklab, ${GREEN_DEEP} 20%, transparent), transparent 56%)`,
        }}
      />

      <div className="relative z-20 mb-4 hidden text-center sm:block">
        <div className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          You are visitor
        </div>
        <div className="mono mt-1 text-base font-semibold tracking-[0.04em]" style={{ color: GOLD }}>
          Seat {seatLabel} available
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

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start px-8 pt-[30%] text-center">
          <div className="mono text-[11px] uppercase tracking-[0.28em]" style={{ color: "var(--success)" }}>
            Live capital flow
          </div>

          <div
            className="mt-2 mono tabular-nums font-semibold leading-none text-[clamp(3.6rem,1.1rem+4.6vw,6.5rem)]"
            style={{
              color: "var(--success)",
              textShadow: "0 0 40px color-mix(in oklab, var(--success) 34%, transparent)",
            }}
          >
            {routedValue !== undefined ? (
              <AnimatedNumber value={routedValue} prefix="$" format={fmtCoreUsd} />
            ) : (
              "—"
            )}
          </div>

          <div className="mt-3 mono text-[13px] uppercase tracking-[0.28em] text-foreground">
            USDC routed
          </div>

          <div className="mt-4 inline-flex items-center rounded-[4px] border border-border/60 bg-background/45 px-4 py-2 backdrop-blur-md">
            <span className="mono text-[12px] uppercase tracking-[0.12em]" style={{ color: GOLD }}>
              ${amount}
            </span>
            <span className="mx-2 text-muted-foreground">→</span>
            <span className="mono text-[12px] uppercase tracking-[0.12em] text-foreground/82">
              SYN
            </span>
            <span className="mx-2 text-muted-foreground">→</span>
            <span className="mono text-[12px] uppercase tracking-[0.12em] text-foreground/82">
              70 / 20 / 10
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <StatusPill status={routedStatus} />
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {synStatus === "LIVE" ? "Live route preview" : "Derived route preview"}
            </span>
          </div>
        </div>

        {vaultLane && (
          <EngineNode wrap={vaultLane.pos.wrap}>
            <NodeIcon icon={<VaultIcon />} color={vaultLane.color} />
            <NodeLabel
              title="70% Vault"
              value={fmtUsd(vaultLane.fact.value, 2)}
              color={vaultLane.color}
            />
          </EngineNode>
        )}

        {liquidityLane && (
          <EngineNode wrap={liquidityLane.pos.wrap}>
            <NodeIcon icon={<DropIcon />} color={liquidityLane.color} />
            <NodeLabel
              title="20% Liquidity"
              value={fmtUsd(liquidityLane.fact.value, 2)}
              color={liquidityLane.color}
            />
          </EngineNode>
        )}

        {operationsLane && (
          <EngineNode wrap={operationsLane.pos.wrap}>
            <NodeIcon icon={<GearIcon />} color={operationsLane.color} />
            <NodeLabel
              title="10% Operations"
              value={fmtUsd(operationsLane.fact.value, 2)}
              color={operationsLane.color}
            />
          </EngineNode>
        )}

        <EngineNode wrap="left-[10%] top-[56%]">
          <NodeIcon icon={<BookIcon />} color={GOLD} />
          <NodeLabel title="Chronicle" value={chapterLabel ?? "Memory"} color={GOLD} />
        </EngineNode>

        <EngineNode wrap="left-[84%] top-[84%]">
          <NodeIcon icon={<MembersIcon />} color={GOLD} />
          <NodeLabel title="Membership Sale" value="" color={GOLD} />
        </EngineNode>
      </div>

      <div className="glass-card elevated p-5 text-center sm:hidden">
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Seat {seatLabel} available
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
        <div className="mt-5 mono text-[11px] uppercase tracking-[0.25em]" style={{ color: "var(--success)" }}>
          Live capital flow
        </div>
        <div
          className="mt-2 mono text-[clamp(4rem,19vw,6rem)] font-semibold leading-none tabular-nums"
          style={{ color: "var(--success)" }}
        >
          {routedValue !== undefined ? (
            <AnimatedNumber value={routedValue} prefix="$" format={fmtCoreUsd} />
          ) : (
            "—"
          )}
        </div>
        <div className="mt-1 mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
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
 * under prefers-reduced-motion. The burned value is the live Proof-of-Fire
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
    { x: "41%", kf: "syn-ember-l", delay: "0s", dur: "3.6s", size: 3 },
    { x: "52%", kf: "syn-ember-r", delay: "0.5s", dur: "4.2s", size: 2 },
    { x: "46%", kf: "syn-ember-c", delay: "1.1s", dur: "3.8s", size: 2 },
    { x: "57%", kf: "syn-ember-r", delay: "1.7s", dur: "4.4s", size: 3 },
    { x: "44%", kf: "syn-ember-l", delay: "2.3s", dur: "3.9s", size: 2 },
    { x: "50%", kf: "syn-ember-c", delay: "2.8s", dur: "4.1s", size: 3 },
    { x: "54%", kf: "syn-ember-l", delay: "3.3s", dur: "3.7s", size: 2 },
    { x: "48%", kf: "syn-ember-r", delay: "0.9s", dur: "4.0s", size: 2 },
  ];
  return (
    <div className="relative z-10 mt-7 flex flex-col items-center text-center select-none sm:mt-9">
      <div className="syn-burn-flame relative flex h-[136px] w-[112px] items-end justify-center" aria-hidden>
        {/* soft radial glow — centered by flex; animates scale/opacity only */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div
            className="size-[150%] rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, #F97316 34%, transparent) 0%, color-mix(in oklab, #B45309 16%, transparent) 42%, transparent 70%)",
              animation: reducedMotion ? undefined : "syn-glow-pulse 4s ease-in-out infinite",
            }}
          />
        </div>

        {/* layered flame: outer amber → inner gold → white-hot core */}
        <svg
          viewBox="0 0 64 96"
          className="relative h-[136px] w-auto overflow-visible"
          style={{
            filter: "drop-shadow(0 6px 14px color-mix(in oklab, #7C2D12 55%, transparent))",
          }}
        >
          <defs>
            <linearGradient id="syn-flame-outer-g" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#7C2D12" />
              <stop offset="10%" stopColor="#B45309" />
              <stop offset="42%" stopColor="#F97316" />
              <stop offset="76%" stopColor="#E3A92B" />
              <stop offset="100%" stopColor="#F2C544" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="syn-flame-inner-g" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="48%" stopColor="#F2C544" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>
            <linearGradient id="syn-flame-core-g" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#FFFDF5" />
            </linearGradient>
          </defs>
          <g
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 100%",
              animation: reducedMotion ? undefined : "syn-flame-a 3.6s ease-in-out infinite",
            }}
          >
            <path
              d="M32 4 C40 22 50 30 44 48 C42 56 46 60 44 66 C56 60 58 84 40 92 C46 84 36 82 36 92 C36 82 28 82 28 92 C28 82 18 84 24 92 C8 84 10 60 22 66 C20 60 22 56 20 48 C16 30 24 22 32 4 Z"
              fill="url(#syn-flame-outer-g)"
            />
          </g>
          <g
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 100%",
              animation: reducedMotion ? undefined : "syn-flame-b 3.0s ease-in-out infinite",
            }}
          >
            <path
              d="M32 26 C38 40 44 46 40 58 C39 64 41 66 40 72 C48 68 49 84 36 90 C40 84 33 83 33 90 C33 83 26 84 28 90 C16 84 17 68 25 72 C24 66 25 64 24 58 C21 46 26 40 32 26 Z"
              fill="url(#syn-flame-inner-g)"
            />
          </g>
          <g
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 100%",
              animation: reducedMotion ? undefined : "syn-flame-c 2.2s ease-in-out infinite",
            }}
          >
            <path
              d="M32 50 C36 60 39 64 37 72 C42 70 43 82 34 88 C37 82 32 82 32 88 C32 82 27 82 30 88 C21 82 22 70 27 72 C25 64 28 60 32 50 Z"
              fill="url(#syn-flame-core-g)"
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
                bottom: "24%",
                width: `${e.size}px`,
                height: `${e.size}px`,
                background: i % 2 === 0 ? "#FDE68A" : "#F2C544",
                boxShadow: "0 0 4px color-mix(in oklab, #F97316 60%, transparent)",
                animation: `${e.kf} ${e.dur} ease-out ${e.delay} infinite`,
              }}
            />
          ))}
      </div>

      <div className="mono mt-2 text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
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
        className="mono mt-2 text-[11px] uppercase tracking-[0.3em]"
        style={{ color: known ? FLAME : "var(--muted-foreground)" }}
      >
        {known ? "Proof of Fire" : status}
      </div>
    </div>
  );
}

function HeroRight({
  members,
  membersStatus,
  nextSeat,
  synPrice,
  synPriceStatus,
  routedValue,
  routedStatus,
  totalSupply,
  totalSupplyStatus,
  effectiveSupply,
  burnedSyn,
  burnedStatus,
  refFdv,
  vault,
  vaultStatus,
  liquidity,
  liquidityStatus,
  operations,
  operationsStatus,
  latestLabel,
  latestAmount,
  latestTx,
  className = "",
}: {
  members: number | undefined;
  membersStatus: CanonicalStatus;
  nextSeat: string;
  synPrice: number | undefined;
  synPriceStatus: CanonicalStatus;
  routedValue: number | undefined;
  routedStatus: CanonicalStatus;
  totalSupply: number | undefined;
  totalSupplyStatus: CanonicalStatus;
  effectiveSupply: number | undefined;
  burnedSyn: number | undefined;
  burnedStatus: CanonicalStatus;
  refFdv: number | undefined;
  vault: number | undefined;
  vaultStatus: CanonicalStatus;
  liquidity: number | undefined;
  liquidityStatus: CanonicalStatus;
  operations: number | undefined;
  operationsStatus: CanonicalStatus;
  latestLabel: string;
  latestAmount: string;
  latestTx: string | undefined;
  className?: string;
}) {
  return (
    <div className={`relative z-10 grid gap-3 lg:pb-10 ${className}`}>
      <div className="surface p-5">
        <div className="mono mb-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Protocol overview
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 xl:grid-cols-3">
          <Stat label="Members" value={fmtCount(members)} status={membersStatus} />
          <Stat label="Next seat" value={nextSeat} status={membersStatus} gold />
          <Stat label="SYN price" value={fmtUsd(synPrice, 4)} status={synPriceStatus} />

          <Stat label="USDC routed" value={fmtUsd(routedValue, 2)} status={routedStatus} money />
          <Stat label="Ref. market" value={fmtCompactUsd(refFdv)} status="DERIVED" />
          <Stat label="Ref. FDV" value={fmtCompactUsd(refFdv)} status="DERIVED" />

          <Stat label="Initial supply" value={fmtCompactSyn(totalSupply)} status={totalSupplyStatus} />
          <Stat
            label="Effective supply"
            value={fmtCompactSyn(effectiveSupply)}
            status={effectiveSupply !== undefined ? "DERIVED" : "PENDING"}
          />
          <BurnStat value={burnedSyn} status={burnedStatus} />

          <Stat label="Vault holdings" value={fmtUsd(vault, 2)} status={vaultStatus} money />
          <Stat label="Liquidity TVL" value={fmtUsd(liquidity, 2)} status={liquidityStatus} money />
          <Stat label="Operations" value={fmtUsd(operations, 2)} status={operationsStatus} money />
        </div>
      </div>

      <div className="surface p-5">
        <div className="mono mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>Latest activity</span>
          <Link
            to="/activity"
            className="text-foreground/55 transition-colors hover:text-[var(--verify)]"
          >
            View all →
          </Link>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mono text-[13px] text-foreground">{latestLabel}</div>
            <div className="mt-1.5 mono text-base font-semibold tabular-nums" style={{ color: "var(--success)" }}>
              {latestAmount}
            </div>
          </div>
          {latestTx ? (
            <ProofButton href={txExplorerUrl(latestTx)} ariaLabel="Verify latest purchase on-chain">
              Tx ↗
            </ProofButton>
          ) : (
            <StatusPill status="PENDING" />
          )}
        </div>
      </div>
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
            <ProgressBar value={chapter.progressPct} max={100} tone="gold" size="lg" />
            <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <span className="mono text-3xl font-semibold tabular-nums text-foreground">
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
            Preview your entry. Capital routes automatically. Your seat is permanent.
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

function BottomFacts({
  members,
  membersStatus,
  routed,
  routedStatus,
  vault,
  vaultStatus,
  liquidity,
  liquidityStatus,
  operations,
  operationsStatus,
  synPrice,
  synPriceStatus,
  totalSupply,
  totalSupplyStatus,
  burnedSyn,
  burnedStatus,
  chapterLabel,
}: {
  members: number | undefined;
  membersStatus: CanonicalStatus;
  routed: number | undefined;
  routedStatus: CanonicalStatus;
  vault: number | undefined;
  vaultStatus: CanonicalStatus;
  liquidity: number | undefined;
  liquidityStatus: CanonicalStatus;
  operations: number | undefined;
  operationsStatus: CanonicalStatus;
  synPrice: number | undefined;
  synPriceStatus: CanonicalStatus;
  totalSupply: number | undefined;
  totalSupplyStatus: CanonicalStatus;
  burnedSyn: number | undefined;
  burnedStatus: CanonicalStatus;
  chapterLabel: string | undefined;
}) {
  return (
    <div className="relative z-10 mb-8 mt-2 grid grid-cols-2 gap-0 overflow-hidden rounded-xl border border-border/70 bg-card/42 backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-8">
      <Fact icon={<PersonIcon />} label="Members" value={fmtCount(members)} status={membersStatus} />
      <Fact icon={<DollarIcon />} label="USDC routed" value={fmtUsd(routed, 2)} status={routedStatus} money />
      <Fact icon={<VaultIcon />} label="Vault" value={fmtUsd(vault, 2)} status={vaultStatus} money />
      <Fact icon={<DropIcon />} label="Liquidity TVL" value={fmtUsd(liquidity, 2)} status={liquidityStatus} money />
      <Fact icon={<GearIcon />} label="Operations" value={fmtUsd(operations, 2)} status={operationsStatus} money />
      <Fact icon={<DollarIcon />} label="SYN price" value={fmtUsd(synPrice, 4)} status={synPriceStatus} />
      <Fact icon={<SupplyIcon />} label="Initial supply" value={fmtCompactSyn(totalSupply)} status={totalSupplyStatus} />
      <Fact
        icon={<FlameIcon />}
        label="Burned"
        value={burnedSyn !== undefined ? `${fmtCount(burnedSyn)} SYN` : "—"}
        status={burnedStatus}
        flame
      />
      <div className="col-span-2 border-t border-border/60 p-4 sm:col-span-3 lg:col-span-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            SYN is the seat. Artifacts are the memory.
          </div>
          <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <BookIcon />
            {chapterLabel ?? "Chapter syncing"}
          </div>
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

function NodeIcon({ icon, color }: { icon: ReactNode; color: string }) {
  return (
    <div
      className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full border backdrop-blur-md"
      style={{
        color,
        borderColor: `color-mix(in oklab, ${color} 52%, transparent)`,
        background: "color-mix(in oklab, var(--card) 55%, transparent)",
        boxShadow: `0 0 34px -18px ${color}`,
      }}
    >
      {icon}
    </div>
  );
}

function NodeLabel({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <>
      <div className="mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
        {title}
      </div>
      {value && (
        <div className="mono mt-1 text-sm tabular-nums" style={{ color }}>
          {value}
        </div>
      )}
    </>
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

function Stat({
  label,
  value,
  status,
  money,
  gold,
}: {
  label: string;
  value: string;
  status: CanonicalStatus;
  money?: boolean;
  gold?: boolean;
}) {
  const tone =
    status === "LIVE"
      ? "var(--success)"
      : status === "DERIVED"
      ? "var(--verify)"
      : status === "PARTIAL"
      ? GOLD
      : "var(--muted-foreground)";

  return (
    <div className="border-l border-border/50 pl-3">
      <div className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div
        className="mono mt-1.5 text-xl font-semibold tabular-nums leading-none"
        style={money && status === "LIVE" ? { color: "var(--success)" } : gold ? { color: GOLD } : undefined}
      >
        {value}
      </div>
      <div className="mono mt-1.5 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="size-1 rounded-full" style={{ background: tone }} />
        {status}
      </div>
    </div>
  );
}

function BurnStat({ value, status }: { value: number | undefined; status: CanonicalStatus }) {
  const known = value !== undefined;
  return (
    <div className="border-l border-border/50 pl-3">
      <div className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        Burned
      </div>
      <div className="mono mt-2 flex items-center gap-1.5 text-xl font-semibold tabular-nums leading-none">
        {known && <FlameIcon />}
        <span>{known ? `${fmtCount(value)} SYN` : "—"}</span>
      </div>
      <div className="mt-2">
        {known ? (
          <span className="mono inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em]" style={{ color: FLAME }}>
            <span className="size-1 rounded-full" style={{ background: FLAME }} />
            Proof of Fire
          </span>
        ) : (
          <StatusPill status={status} />
        )}
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
  status,
  money,
  flame,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  status: CanonicalStatus;
  money?: boolean;
  flame?: boolean;
}) {
  return (
    <div className="border-b border-r border-border/50 p-4">
      <div className="flex items-center gap-3">
        <span style={{ color: flame ? FLAME : money ? "var(--success)" : "var(--foreground)" }}>
          {icon}
        </span>
        <div>
          <div className="mono text-xl font-semibold tabular-nums text-foreground">{value}</div>
          <div className="mono mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </div>
        </div>
      </div>
      <div className="mt-3">
        {flame && status !== "PENDING" ? (
          <span
            className="mono inline-flex items-center gap-1 rounded-[3px] border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em]"
            style={{ color: FLAME, borderColor: `color-mix(in oklab, ${FLAME} 42%, transparent)`, background: FLAME_SOFT }}
          >
            <span className="size-1 rounded-full" style={{ background: FLAME }} />
            Proof of Fire
          </span>
        ) : (
          <StatusPill status={status} />
        )}
      </div>
    </div>
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

function FlameIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13.5 2.5c.6 4.2-3.8 5.7-3.8 9 0 1.3.7 2.3 1.8 2.9-.2-2.2 1.8-3.3 2.2-5.4 2.7 2.1 4.3 4.6 4.3 7.1 0 3.3-2.7 5.9-6 5.9s-6-2.6-6-5.9c0-4.6 4.1-6.1 4.1-10.8 1.6.7 2.6 1.8 3.4 3.2.6-1.7.7-3.5 0-6Z"
        fill={FLAME}
      />
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

function BookIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />
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

function MembersIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 22a8 8 0 0 1 16 0" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function SupplyIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2 3 7l9 5 9-5-9-5Z" />
      <path d="M3 12l9 5 9-5M3 17l9 5 9-5" />
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
