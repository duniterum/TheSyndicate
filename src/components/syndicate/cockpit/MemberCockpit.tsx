// MemberCockpit — the /my-syndicate cockpit OS.
//
// A retention-grade home base that reads like a real crypto cockpit
// (Zapper / Zerion / Phantom register) rather than a marketing scroll. Instead
// of stacking every surface as a full-width "report" band, the cockpit composes
// them into ONE control surface:
//
//   • Identity band   — the hero Seat object: crest · member# · chapter ·
//                       wallet · badges · KPI ribbon · primary action.
//   • Flight deck     — three zones under the hero:
//       LEFT rail   (sticky) — Wake Behind You + Seats Around You (identity).
//       CENTER             — holdings, progression, collection, memory.
//       RIGHT rail  (sticky) — Protocol heartbeat + the unified action dock.
//   • Protocol vitals — the seven live numbers, full-width at the base.
//   • Mobile          — the global MobileJoinBar (mounted once in __root) is the
//                       single fixed mobile action; the cockpit does not add a
//                       second bottom bar (it would collide at the same slot).
//
// The embedded sub-surfaces (Wake / Seats / Progression / Memory / Heartbeat /
// LivePulseStrip) render BARE inside the deck via CockpitEmbedProvider — no
// Section band, no 96px padding — so the page reads as a cockpit, not a stack.
//
// Truth doctrine (unchanged): every value is an on-chain read or derived from
// indexed purchase events, or it is clearly labeled. No fabricated balances,
// no vault USDC movement, no simulated referral data. Language stays within
// the site doctrine: "USDC routed", "SYN received", "recognition", "where you
// fit" — never "raised / yield / ROI / stake / earn".

import { useMemo, useRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useCockpitAccount, useCockpitHolderIndex, useCockpitUserBalances } from "@/lib/dev/cockpit-fixtures";
import {
  GlassCard,
  Pill,
  Section,
  StatusPill,
  AnimatedNumber,
} from "@/components/syndicate/Primitives";
import { ConnectCTA } from "@/components/syndicate/ConnectCTA";
import { MemberShareBlock } from "@/components/syndicate/MemberShareCard";
import { CockpitCollector } from "./CockpitCollector";
import { LivePulseStrip } from "@/components/syndicate/LivePulseStrip";
import { ProtocolHeartbeat } from "./ProtocolHeartbeat";
import { CockpitProgression } from "./CockpitProgression";
import { CockpitNextMove } from "./CockpitNextMove";
import { CockpitBadges } from "./CockpitBadges";
import { CockpitIntroducedBy } from "./CockpitIntroducedBy";
import { WakeBehindYou } from "./WakeBehindYou";
import { SeatsAroundYou } from "./SeatsAroundYou";
import { WalletAvatar } from "./WalletAvatar";
import { CockpitEmbedProvider } from "./cockpit-shell";
import { type HolderRecord } from "@/lib/holder-index";
import { useChainTime } from "@/lib/chain-time";
import { fmtSyn, fmtAddress } from "@/lib/sale-hooks";
import { getChapterByMemberNumber } from "@/lib/chapters";
import {
  LP_POOL,
  explorerUrlForAddress,
  txExplorerUrl,
} from "@/lib/syndicate-config";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { buildReferralShareUrl } from "@/lib/referral-attribution";

// ─── local formatters ──────────────────────────────────────────────────
const fmtInt = (n: number | undefined) =>
  n === undefined ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtUsd = (n: number | undefined, d = 2) =>
  n === undefined ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: d })}`;

// Deterministic UTC date formatting — avoids SSR/client locale & timezone
// hydration mismatches (toLocaleDateString varies by runtime locale/TZ).
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function formatJoinedDate(unix: number | undefined): string {
  if (unix === undefined) return "—";
  const d = new Date(unix * 1000);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function copy(text: string) {
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    /* best-effort */
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Entry — the cockpit OS frame + the three-zone flight deck.
// ─────────────────────────────────────────────────────────────────────────
export function MemberCockpit() {
  const { address, isConnected } = useCockpitAccount();
  const idx = useCockpitHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;
  const headerRef = useRef<HTMLDivElement | null>(null);
  const isMember = Boolean(record);

  return (
    <Section id="my-seat" width="data" className="pt-5 md:pt-7 pb-8 md:pb-10">
      <CockpitEmbedProvider>
        {/* ONE control surface, read top-to-bottom as a narrative arc:
            Identity → Place → Ownership → Momentum → Action. The deeper
            Memory and Proof chapters continue just below, in the route. */}
        <div
          className="relative rounded-2xl border border-[var(--gold)]/25 bg-[var(--panel)]"
          style={{ boxShadow: "var(--shadow-glow-gold)" }}
        >
          {/* control-surface texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 grid-bg opacity-40" />
          </div>

          {/* ── 1 · IDENTITY — who you are here ─────────────────────────── */}
          <div className="relative">
            <CockpitHeader
              ref={headerRef}
              address={address}
              isConnected={isConnected}
              record={record}
              loading={idx.isLoading}
            />
            <CockpitIntroducedBy />
          </div>

          {/* ── 2 · PLACE — where you stand in the order ────────────────── */}
          <ArcBand
            eyebrow="Where you stand"
            hint="the seats on either side of yours · your place in the order"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
              <WakeBehindYou />
              <SeatsAroundYou />
            </div>
          </ArcBand>

          {/* ── 3 · OWNERSHIP — what you hold ───────────────────────────── */}
          <ArcBand
            id="my-assets"
            eyebrow="What you hold"
            hint="positions · artifacts · live vs pending"
          >
            <div className="space-y-6">
              <CockpitPortfolio
                isConnected={isConnected}
                record={record}
                loading={idx.isLoading}
              />
              <div id="my-artifacts">
                <CockpitCollector record={record} />
              </div>
            </div>
          </ArcBand>

          {/* ── 4 · MOMENTUM — one movement system ──────────────────────── */}
          <ArcBand
            id="momentum"
            eyebrow="Momentum"
            hint="your progression · what's sealing next · the protocol's live vitals"
          >
            <div className="space-y-6">
              <CockpitNextMove />
              <CockpitProgression />
              <CockpitSealingNext />
              <ProtocolHeartbeat />
              <LivePulseStrip />
            </div>
          </ArcBand>

          {/* ── 5 · ACTION — one dock, no CTA chaos ─────────────────────── */}
          <ArcBand eyebrow="Action dock" hint="every action in one place">
            <CockpitActionRail
              isConnected={isConnected}
              address={address}
              isMember={isMember}
            />
          </ArcBand>
        </div>
      </CockpitEmbedProvider>
    </Section>
  );
}

// ─── ArcBand — one chapter of the cockpit narrative ────────────────────
// A bordered band inside the single control surface. Each band carries a
// chapter eyebrow so the cockpit reads as Identity → Place → Ownership →
// Momentum → Action rather than a stack of disconnected report cards.
function ArcBand({
  id,
  eyebrow,
  hint,
  children,
}: {
  id?: string;
  eyebrow: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative border-t border-border/50 p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="size-1.5 rounded-full bg-[var(--gold)]" aria-hidden />
        <h2 className="mono text-[11px] uppercase tracking-[0.24em] text-[var(--gold)] m-0 font-normal">
          {eyebrow}
        </h2>
        {hint && (
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · {hint}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CockpitHeader — the hero Seat object: crest · member# · chapter · wallet ·
// badges · KPI ribbon · primary action.
// ─────────────────────────────────────────────────────────────────────────
function CockpitHeader({
  ref,
  address,
  isConnected,
  record,
  loading,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  address?: `0x${string}`;
  isConnected: boolean;
  record?: HolderRecord;
  loading: boolean;
}) {
  const chainTime = useChainTime();
  const idx = useCockpitHolderIndex();

  const status: "LIVE" | "PARTIAL" | "PENDING" = !isConnected
    ? "PENDING"
    : loading
      ? "PARTIAL"
      : record
        ? "LIVE"
        : "PENDING";

  const chapter = record ? getChapterByMemberNumber(record.memberNumber) : undefined;
  const joinedUnix = record ? chainTime.blockToUnix(record.firstPurchaseBlock) : undefined;
  const walletUrl = address ? explorerUrlForAddress(address) : null;

  const shareText = record && chapter
    ? `I hold Member #${record.memberNumber} of The Syndicate — ${chapter.shortLabel} · ${record.currentRank?.name ?? "Member"} · ${fmtInt(Math.round(record.cumulativeSyn))} SYN received. Verified on-chain.`
    : "";

  return (
    <>
      <div
        ref={ref}
        className="relative overflow-hidden p-5 sm:p-6 md:p-8"
      >
        {/* decorative cockpit glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -right-24 size-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
        />

        <div className="relative flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <StatusPill status={status} />
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Member Cockpit
            </span>
          </div>
          {isConnected && (
            <Pill tone={record ? "success" : "muted"}>
              {record ? "Member" : "Not yet a member"}
            </Pill>
          )}
        </div>

        {/* DISCONNECTED — dormant shell */}
        {!isConnected ? (
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <WalletAvatar address={null} size={72} />
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-foreground">
                Your seat awaits
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
                Connect your wallet to load your member number, rank, SYN position,
                and owned artifacts — every value a live on-chain read.
              </p>
              <div className="mt-4 max-w-md">
                <ConnectCTA
                  message="Connect wallet to activate your cockpit."
                  hint="seat · assets · artifacts"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col gap-6">
            {/* Identity line — crest + member# + wallet + badges, primary action */}
            <div className="flex flex-col md:flex-row md:items-start gap-5 md:gap-6">
              <div className="flex items-start gap-4 md:gap-5 min-w-0">
                <div
                  className="shrink-0 rounded-2xl p-[2px]"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  <div className="rounded-[14px] overflow-hidden bg-background">
                    <WalletAvatar address={address} size={84} />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {record ? "Member" : "Preview"}
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-0.5">
                    <span className="font-serif text-5xl md:text-6xl leading-[0.9] text-gradient-gold tabular-nums">
                      #{record ? record.memberNumber.toLocaleString("en-US") : idx.totals.nextMemberNumber.toLocaleString("en-US")}
                    </span>
                    {chapter && <Pill tone="gold">{chapter.shortLabel}</Pill>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {walletUrl ? (
                      <a
                        href={walletUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono text-sm text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
                      >
                        {fmtAddress(address)} ↗
                      </a>
                    ) : (
                      <span className="mono text-sm text-foreground">{fmtAddress(address)}</span>
                    )}
                    <button
                      type="button"
                      aria-label="Copy wallet address"
                      onClick={() => address && copy(address)}
                      className="mono text-[9px] uppercase tracking-[0.16em] rounded border border-border/60 px-1.5 py-0.5 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/60"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="mt-2.5">
                    <CockpitBadges record={record} nextMemberNumber={idx.totals.nextMemberNumber} />
                  </div>
                </div>
              </div>

              {/* Recognition / status — identity context only. The single
                  action dock lives at the foot of the cockpit (no CTA chaos). */}
              <div className="md:ml-auto md:w-60 shrink-0">
                {record ? (
                  <div className="rounded-lg border border-border/50 bg-card/40 px-3.5 py-3">
                    <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Recognition
                    </span>
                    <div className="mono text-sm text-foreground mt-1">
                      {record.currentRank?.name ?? "Citizen"}
                    </div>
                    <p className="mono text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      Derived from USDC routed. Recognition only — no payout, no rate change, no entitlement.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border/50 bg-card/40 px-3.5 py-3">
                    <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Status
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      No Membership Sale purchases recorded for this wallet yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* KPI ribbon — hairline-separated identity facts */}
            <dl
              className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden border border-border/50"
              style={{ background: "var(--border)" }}
            >
              <HeroStat
                label="SYN received"
                value={record ? <AnimatedNumber value={Math.round(record.cumulativeSyn)} /> : "—"}
              />
              <HeroStat
                label="USDC routed"
                value={record ? fmtUsd(record.cumulativeUsdc) : "—"}
              />
              <HeroStat
                label="Purchases"
                value={record ? fmtInt(record.purchaseCount) : "—"}
              />
              <HeroStat
                label="Joined"
                value={record ? `≈ ${formatJoinedDate(joinedUnix)}` : "—"}
                sub={record ? `block ${record.firstPurchaseBlock.toString()}` : undefined}
              />
            </dl>

            {/* Proof anchor — proof sits beside the values it backs. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Every figure above is a live on-chain read or labeled pending
              </span>
              <a
                href="#proof"
                className="mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--verify)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
              >
                Verify &amp; contracts ↓
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Member-only share — a purpose-built premium member card rendered
          off-screen and exported to PNG. The card is the shareable artifact;
          the live cockpit above stays the control surface. The share link
          carries recognition-only attribution back to this member. */}
      {record && (
        <div className="px-5 sm:px-6 md:px-8 pb-5">
          <MemberShareBlock
            variant="offscreen"
            filename={`syndicate-member-${record.memberNumber}.png`}
            memberNumber={record.memberNumber}
            chapterLabel={chapter?.shortLabel ?? "Member"}
            rankName={record.currentRank?.name ?? "Member"}
            wallet={record.wallet}
            synReceived={record.cumulativeSyn}
            cardUrl={`https://thesyndicate.money/wallet/${record.wallet}`}
            shareUrl={buildReferralShareUrl(
              `https://thesyndicate.money/wallet/${record.wallet}`,
              record.memberNumber,
            )}
            shareText={shareText}
            hint="Share your seat"
          />
        </div>
      )}
    </>
  );
}

function HeroStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div className="bg-[var(--card)] px-3.5 py-3 min-w-0">
      <dt className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 mono text-base md:text-lg font-semibold text-foreground tabular-nums truncate">
        {value}
      </dd>
      {sub && (
        <dd className="mono text-[10px] text-muted-foreground tracking-normal truncate">
          {sub}
        </dd>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CockpitActionRail — ONE unified action dock (kills CTA chaos). Vertical so it
// reads as a control panel in the right rail.
// ─────────────────────────────────────────────────────────────────────────
function CockpitActionRail({
  isConnected,
  address,
  isMember,
}: {
  isConnected: boolean;
  address?: `0x${string}`;
  isMember: boolean;
}) {
  const walletUrl = address ? explorerUrlForAddress(address) : null;

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
          Action dock
        </span>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          one place · no chaos
        </span>
      </div>

      <div className="space-y-2">
        {/* PRIMARY — the single dominant action */}
        <Link
          to="/join"
          className="group block rounded-md border border-[var(--gold)]/70 bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 px-3.5 py-3 text-left transition-colors"
        >
          <div className="flex items-center justify-between gap-2 mono text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground">
            <span>{isMember ? "Buy More SYN" : "Join The Syndicate"}</span>
            <span className="text-muted-foreground group-hover:text-[var(--gold)]">→</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground leading-snug">
            Membership Sale · USDC → SYN
          </div>
        </Link>

        <RailLink
          label="Trade SYN"
          hint="Swap on Trader Joe"
          href={LP_POOL.traderJoeUrl}
        />
        <RailLink
          label="Add Liquidity"
          hint="Deposit SYN + USDC"
          href={LP_POOL.addLiquidityUrl}
        />
        {isConnected && walletUrl ? (
          <RailLink label="Verify Wallet" hint="Your wallet on Avascan" href={walletUrl} />
        ) : (
          <RailInternal to="/transparency" label="Proof & Routing" hint="Transparency ledger" />
        )}
      </div>
    </div>
  );
}

function RailLink({ label, hint, href }: { label: string; hint: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-md border border-border/70 hover:border-[var(--gold)]/60 px-3.5 py-3 text-left transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mono text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground">
        <span>{label}</span>
        <span className="text-muted-foreground group-hover:text-[var(--gold)]">↗</span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{hint}</div>
    </a>
  );
}

function RailInternal({ to, label, hint }: { to: string; label: string; hint: string }) {
  return (
    <Link
      to={to}
      className="group block rounded-md border border-border/70 hover:border-[var(--gold)]/60 px-3.5 py-3 text-left transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mono text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground">
        <span>{label}</span>
        <span className="text-muted-foreground group-hover:text-[var(--gold)]">→</span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{hint}</div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CockpitPortfolio — wallet / position view.
// ─────────────────────────────────────────────────────────────────────────
function CockpitPortfolio({
  isConnected,
  record,
  loading,
}: {
  isConnected: boolean;
  record?: HolderRecord;
  loading: boolean;
}) {
  const balances = useCockpitUserBalances();

  const status: "LIVE" | "PARTIAL" | "PENDING" = !isConnected
    ? "PENDING"
    : loading
      ? "PARTIAL"
      : record
        ? "LIVE"
        : "PENDING";

  const firstTxUrl = record ? txExplorerUrl(record.firstPurchaseTx) : undefined;

  // Per-tile live state is HONEST: a tile only claims "Live" when its datum is
  // actually readable. Record-derived tiles are live only when a membership
  // record exists; the wallet-balance tile is live whenever connected.
  const tiles = useMemo(() => {
    return [
      {
        label: "SYN received",
        value: record ? fmtInt(Math.round(record.cumulativeSyn)) : "—",
        sub: "via Membership Sale · cumulative",
        verify: record && firstTxUrl ? { label: "First receipt ↗", href: firstTxUrl } : undefined,
        live: Boolean(record),
      },
      {
        label: "SYN in wallet",
        value: isConnected ? fmtSyn(balances.synBalance) : "—",
        sub: "current holdings · live balanceOf",
        live: isConnected,
      },
      {
        label: "USDC routed",
        value: record ? fmtUsd(record.cumulativeUsdc) : "—",
        sub: "70 / 20 / 10 · contract-enforced",
        live: Boolean(record),
      },
      {
        label: "Purchases",
        value: record ? fmtInt(record.purchaseCount) : "—",
        sub: "sealed on-chain events",
        live: Boolean(record),
      },
      {
        label: "Recognition",
        value: record?.currentRank?.name ?? "—",
        sub: "derived from USDC routed · no payout",
        live: Boolean(record),
      },
      {
        label: "Largest single",
        value: record ? fmtUsd(record.largestSinglePurchaseUsdc) : "—",
        sub: "biggest single purchase",
        live: Boolean(record),
      },
    ];
  }, [record, balances.synBalance, isConnected, firstTxUrl]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusPill status={status} />
        <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
          Portfolio
        </h2>
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          · positional only · no price, no PnL
        </span>
      </div>

      <GlassCard className="p-4 sm:p-5">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {tiles.map((t) => (
            <div key={t.label} className="surface elevated p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t.label}
                </span>
                {t.live ? (
                  <span className="mono inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.16em] text-[var(--success)]">
                    <span className="size-1 rounded-full bg-[var(--success)] pulse-dot" />
                    Live
                  </span>
                ) : (
                  <span className="mono inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                    <span className="size-1 rounded-full bg-muted-foreground/60" />
                    Pending
                  </span>
                )}
              </div>
              <div className="mono text-xl md:text-2xl font-semibold text-foreground tabular-nums truncate">
                {t.value}
              </div>
              <div className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {t.sub}
              </div>
              {t.verify && (
                <a
                  href={t.verify.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--verify)] hover:text-[var(--gold)] mt-0.5"
                >
                  {t.verify.label}
                </a>
              )}
            </div>
          ))}
        </div>

        {!isConnected && (
          <div className="mt-4">
            <ConnectCTA
              message="Connect wallet to load your position."
              hint="SYN · USDC routed · receipts"
            />
          </div>
        )}
        {isConnected && !record && (
          <p className="mt-4 text-sm text-muted-foreground">
            No Membership Sale purchases recorded for this wallet yet.{" "}
            <Link to="/join" className="text-foreground underline-offset-4 hover:underline">
              See the Membership Sale →
            </Link>
          </p>
        )}
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CockpitSealingNext — the next real on-chain thresholds (chapter + artifact
// seals). It lives inside the Momentum chapter so progression, what's-sealing-
// next, the heartbeat, and the live pulse read as ONE movement system. Real
// cohort seals only — no timers, no countdowns, no urgency.
// ─────────────────────────────────────────────────────────────────────────
type SealingRow = {
  scope: "SOON" | "NEXT" | "FAR";
  label: string;
  remaining: string;
  source: string;
};

function CockpitSealingNext() {
  const pulse = useProtocolPulse();
  const buyers = pulse.buyers;

  // Real chapter thresholds — canonical (333 / 1,000 / 3,333 / 10,000 / Open Era).
  const CHAPTER_TARGETS: Array<{ id: string; label: string; target: number }> = [
    { id: "ch-333", label: "Chapter I — Genesis Signal sealed (#333)", target: 333 },
    { id: "ch-1000", label: "Chapter II — First Thousand sealed (#1,000)", target: 1_000 },
    { id: "ch-3333", label: "Chapter III — The Expansion sealed (#3,333)", target: 3_333 },
    { id: "ch-10000", label: "Chapter IV — First Ten Thousand sealed (#10,000)", target: 10_000 },
  ];

  const rows: SealingRow[] = [];
  if (buyers !== undefined) {
    // Nearest unreached chapter is NEXT; the one after is FAR; the artifact
    // tied to the closest seal is SOON.
    const upcoming = CHAPTER_TARGETS.filter((c) => buyers < c.target);
    if (upcoming[0]) {
      rows.push({
        scope: "SOON",
        label: `Genesis Sealed Artifact unlocks at #${upcoming[0].target.toLocaleString("en-US")}`,
        remaining: `${(upcoming[0].target - buyers).toLocaleString("en-US")} members to go`,
        source: "Membership Sale · indexed",
      });
      rows.push({
        scope: "NEXT",
        label: upcoming[0].label,
        remaining: `${(upcoming[0].target - buyers).toLocaleString("en-US")} members to go`,
        source: "Membership Sale · indexed",
      });
    }
    if (upcoming[1]) {
      rows.push({
        scope: "FAR",
        label: upcoming[1].label,
        remaining: `${(upcoming[1].target - buyers).toLocaleString("en-US")} members to go`,
        source: "Membership Sale · indexed",
      });
    }
  }

  const status: "LIVE" | "PARTIAL" | "PENDING" = pulse.isLoading
    ? "PARTIAL"
    : rows.length
      ? "LIVE"
      : "PENDING";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusPill status={status} />
        <h3 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
          What's sealing next
        </h3>
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          · real on-chain thresholds · no countdowns
        </span>
      </div>
      <GlassCard className="p-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Awaiting the next on-chain threshold to come into range.
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {rows.map((r) => (
              <li
                key={`${r.scope}-${r.label}`}
                className="flex flex-wrap items-center gap-2 py-2.5"
              >
                <Pill tone={r.scope === "SOON" ? "gold" : r.scope === "NEXT" ? "navy" : "muted"}>
                  {r.scope}
                </Pill>
                <span className="text-sm text-foreground flex-1 min-w-0">{r.label}</span>
                <span className="mono text-[11px] text-foreground tabular-nums">
                  {r.remaining}
                </span>
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {r.source}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 pt-3 border-t border-border/40">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Thresholds are real cohort seals — they fire when the on-chain member
            count crosses the boundary. No timers. No urgency.
          </span>
        </div>
      </GlassCard>
    </div>
  );
}
