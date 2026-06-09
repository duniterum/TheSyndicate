// MemberCockpit — Phase 1 of the /my-syndicate "Member Cockpit" rebuild.
//
// A retention-grade home base that reads like a real crypto cockpit
// (Zapper / Zerion / Phantom register) rather than a marketing scroll:
//
//   • CockpitHeader   — premium profile header (avatar · member# · rank ·
//                       chapter · SYN · joined date · next milestone)
//   • CockpitActionRail — ONE unified action surface (removes CTA chaos):
//                       one primary BUY + ordered secondaries
//   • CockpitPortfolio — wallet / position view (SYN received, SYN held live,
//                       USDC routed, purchases, rank progress)
//   • Owned Artifacts  — real on-chain Archive1155 balances (MyArchivePreview)
//
// Truth doctrine (unchanged): every value is an on-chain read or derived from
// indexed purchase events, or it is clearly labeled. No fabricated balances,
// no vault USDC movement, no simulated referral data. Language stays within
// the site doctrine: "USDC routed", "SYN received", "recognition", "where you
// fit" — never "raised / yield / ROI / stake / earn".

import { useMemo, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import {
  GlassCard,
  Pill,
  Section,
  StatusPill,
  ProgressBar,
  AnimatedNumber,
} from "@/components/syndicate/Primitives";
import { ConnectCTA } from "@/components/syndicate/ConnectCTA";
import { ShareActions } from "@/components/syndicate/ShareActions";
import { MyArchivePreview } from "@/components/syndicate/MyArchivePreview";
import { LivePulseStrip } from "@/components/syndicate/LivePulseStrip";
import { WalletAvatar } from "./WalletAvatar";
import { useHolderIndex, type HolderRecord } from "@/lib/holder-index";
import { useChainTime } from "@/lib/chain-time";
import { useUserBalances, fmtSyn, fmtAddress } from "@/lib/sale-hooks";
import { getChapterByMemberNumber } from "@/lib/chapters";
import {
  LP_POOL,
  explorerUrlForAddress,
  txExplorerUrl,
} from "@/lib/syndicate-config";

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

// Progress within the current rank band toward the next rank (0..1).
function rankProgress(record: HolderRecord): number {
  const cur = record.currentRank;
  const next = record.nextRank;
  if (!cur || !next) return cur && !next ? 1 : 0;
  const span = next.usdc - cur.usdc;
  if (span <= 0) return 0;
  return Math.max(0, Math.min(1, (record.cumulativeUsdc - cur.usdc) / span));
}

// ─────────────────────────────────────────────────────────────────────────
// Entry — composes the four Phase 1 surfaces.
// ─────────────────────────────────────────────────────────────────────────
export function MemberCockpit() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;
  const headerRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Section id="my-seat" className="pt-6 md:pt-8 pb-4">
        <CockpitHeader
          ref={headerRef}
          address={address}
          isConnected={isConnected}
          record={record}
          loading={idx.isLoading}
        />
        <CockpitActionRail isConnected={isConnected} address={address} isMember={Boolean(record)} />
      </Section>

      {/* Protocol-live snapshot — what the protocol is doing right now, read
          live from Avalanche. Sits between identity and holdings so the page
          reads: your seat → the protocol's pulse → what you hold. */}
      <LivePulseStrip />

      <Section id="my-assets" className="py-4">
        <CockpitPortfolio
          isConnected={isConnected}
          record={record}
          loading={idx.isLoading}
        />
      </Section>

      <Section id="my-artifacts" className="py-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusPill status={isConnected ? "LIVE" : "PENDING"} />
          <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
            Owned Artifacts
          </h2>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · Archive1155 · live balanceOf
          </span>
        </div>
        <MyArchivePreview />
      </Section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CockpitHeader — premium profile header.
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
  const idx = useHolderIndex();

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

  const progress = record ? rankProgress(record) : 0;

  const shareText = record && chapter
    ? `I hold Member #${record.memberNumber} of The Syndicate — ${chapter.shortLabel} · ${record.currentRank?.name ?? "Member"} · ${fmtInt(Math.round(record.cumulativeSyn))} SYN received. Verified on-chain.`
    : "";

  return (
    <>
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-[var(--gold)]/30 bg-card/70 p-5 sm:p-6 md:p-8"
      style={{ boxShadow: "var(--shadow-glow-gold)" }}
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
        <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-8 items-start">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <WalletAvatar address={address} size={84} />
            <div className="min-w-0">
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {record ? "Member" : "Preview"}
              </div>
              <div className="font-serif text-4xl md:text-5xl leading-none text-gradient-gold">
                #{record ? record.memberNumber.toLocaleString("en-US") : idx.totals.nextMemberNumber.toLocaleString("en-US")}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {chapter ? (
                  <Pill tone="gold">{chapter.shortLabel}</Pill>
                ) : (
                  <Pill tone="muted">Would join {getChapterByMemberNumber(idx.totals.nextMemberNumber).shortLabel}</Pill>
                )}
                {record?.currentRank && <Pill tone="navy">{record.currentRank.name}</Pill>}
                {record?.eligibility.foundersBadge && <Pill tone="gold">Genesis Signal</Pill>}
              </div>
            </div>
          </div>

          {/* Wallet + joined */}
          <div className="min-w-0 lg:px-2">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="min-w-0">
                <dt className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Wallet</dt>
                <dd className="mt-1 flex items-center gap-2">
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
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Joined</dt>
                <dd
                  className="mt-1 mono text-sm text-foreground"
                  title="Estimated from first purchase block at ~2s/block on Avalanche."
                >
                  {record ? (
                    <>
                      ≈ {formatJoinedDate(joinedUnix)}
                      <span className="block mono text-[10px] text-muted-foreground tracking-normal">
                        block {record.firstPurchaseBlock.toString()}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">SYN received</dt>
                <dd className="mt-1 mono text-lg font-semibold text-foreground tabular-nums">
                  {record ? <AnimatedNumber value={Math.round(record.cumulativeSyn)} /> : "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">USDC routed</dt>
                <dd className="mt-1 mono text-lg font-semibold text-foreground tabular-nums">
                  {record ? fmtUsd(record.cumulativeUsdc) : "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Next milestone + primary action */}
          <div className="lg:w-64 lg:border-l lg:border-border/40 lg:pl-6">
            {record && record.nextRank && record.usdcToNextRank !== null ? (
              <div className="mb-4">
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Next milestone
                  </span>
                  <span className="mono text-[11px] text-foreground">{record.nextRank.name}</span>
                </div>
                <ProgressBar value={progress * 100} max={100} tone="gold" />
                <div className="mono text-[10px] text-muted-foreground mt-1.5">
                  {fmtUsd(record.usdcToNextRank)} routed to {record.nextRank.name}
                </div>
              </div>
            ) : record ? (
              <div className="mb-4">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Recognition
                </span>
                <div className="mono text-sm text-foreground mt-1">Top tier reached</div>
              </div>
            ) : (
              <div className="mb-4">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Status
                </span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  No Membership Sale purchases recorded for this wallet yet.
                </p>
              </div>
            )}

            <Link
              to="/join"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-[oklch(0.22_0.025_260)] transition-transform hover:-translate-y-px"
              style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow-gold)" }}
            >
              {record ? "Buy More SYN →" : "Join The Syndicate →"}
            </Link>
          </div>
        </div>
      )}

    </div>

    {/* Member-only share — rendered OUTSIDE the captured card so the export
        contains only the member card, not the share controls themselves. */}
    {record && (
      <div className="mt-3 px-1">
        <ShareActions
          filename={`syndicate-member-${record.memberNumber}.png`}
          shareText={shareText}
          shareUrl="https://thesyndicate.money/my-syndicate"
          nodeRef={ref}
          hint="Share your seat"
        />
      </div>
    )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CockpitActionRail — ONE unified action surface (kills CTA chaos).
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
    <div className="mt-4 surface elevated p-3 md:p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">
          Actions
        </span>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          one place · no chaos
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {/* PRIMARY — the single dominant action */}
        <Link
          to="/join"
          className="group rounded-md border border-[var(--gold)]/70 bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 px-3 py-3 text-left transition-colors"
        >
          <div className="mono text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground">
            {isMember ? "Buy More SYN" : "Join The Syndicate"}
            <span className="ml-1 text-muted-foreground group-hover:text-[var(--gold)]">→</span>
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
      className="group rounded-md border border-border/70 hover:border-[var(--gold)]/60 px-3 py-3 text-left transition-colors"
    >
      <div className="mono text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground">
        {label}
        <span className="ml-1 text-muted-foreground group-hover:text-[var(--gold)]">↗</span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{hint}</div>
    </a>
  );
}

function RailInternal({ to, label, hint }: { to: string; label: string; hint: string }) {
  return (
    <Link
      to={to}
      className="group rounded-md border border-border/70 hover:border-[var(--gold)]/60 px-3 py-3 text-left transition-colors"
    >
      <div className="mono text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground">
        {label}
        <span className="ml-1 text-muted-foreground group-hover:text-[var(--gold)]">→</span>
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
  const balances = useUserBalances();

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
        sub: record?.nextRank && record.usdcToNextRank !== null
          ? `${fmtUsd(record.usdcToNextRank)} to ${record.nextRank.name}`
          : record?.currentRank
            ? "top tier reached"
            : "derived from USDC routed",
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
