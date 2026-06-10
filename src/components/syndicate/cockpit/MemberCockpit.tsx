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
import { useCockpitAccount, useCockpitHolderIndex, useCockpitUserBalances } from "@/lib/dev/cockpit-fixtures";
import {
  GlassCard,
  Pill,
  Section,
  StatusPill,
  AnimatedNumber,
} from "@/components/syndicate/Primitives";
import { ConnectCTA } from "@/components/syndicate/ConnectCTA";
import { ShareActions } from "@/components/syndicate/ShareActions";
import { CockpitCollector } from "./CockpitCollector";
import { LivePulseStrip } from "@/components/syndicate/LivePulseStrip";
import { CockpitMemory } from "./CockpitMemory";
import { ProtocolHeartbeat } from "./ProtocolHeartbeat";
import { CockpitProgression } from "./CockpitProgression";
import { CockpitBadges } from "./CockpitBadges";
import { WakeBehindYou } from "./WakeBehindYou";
import { SeatsAroundYou } from "./SeatsAroundYou";
import { WalletAvatar } from "./WalletAvatar";
import { type HolderRecord } from "@/lib/holder-index";
import { useChainTime } from "@/lib/chain-time";
import { fmtSyn, fmtAddress } from "@/lib/sale-hooks";
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

// ─────────────────────────────────────────────────────────────────────────
// Entry — composes the four Phase 1 surfaces.
// ─────────────────────────────────────────────────────────────────────────
export function MemberCockpit() {
  const { address, isConnected } = useCockpitAccount();
  const idx = useCockpitHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;
  const headerRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Section id="my-seat" className="pt-6 md:pt-8 pb-4">
        {/* ONE composed seat panel. Identity, the wake behind you, and the
            action rail read as a single dominant object — "MY SEAT, everything
            orbits it" — instead of separately bordered report cards stacked on
            top of each other. Chapter / progression storytelling lives exactly
            once, directly below, in <CockpitProgression/> — the panel no longer
            repeats it. */}
        <div
          className="relative overflow-hidden rounded-2xl border border-[var(--gold)]/30 bg-card/70"
          style={{ boxShadow: "var(--shadow-glow-gold)" }}
        >
          <CockpitHeader
            ref={headerRef}
            address={address}
            isConnected={isConnected}
            record={record}
            loading={idx.isLoading}
          />
        {/* Wake Behind You — the emotional gravity line. Sits directly under
            the seat identity so "who you are" is immediately followed by "how
            much of the story formed behind you". Real wake = indexed members −
            your member number; visitors get the inverse invitation. */}
          <div className="border-t border-border/40 px-5 sm:px-6 md:px-8 py-5">
            <WakeBehindYou />
          </div>

          {/* Actions — one unified rail at the base of the panel. */}
          <div className="border-t border-border/40 px-5 sm:px-6 md:px-8 py-5">
            <CockpitActionRail isConnected={isConnected} address={address} isMember={Boolean(record)} />
          </div>
        </div>
      </Section>

      {/* Co-witnesses — the quiet social layer. Directly below the seat panel so
          the page reads "who you are → who sits beside you → where you fit in
          the story". Shows the real members on either side of your seat (order
          of entry only — no amounts, no rank, no standing). Wake stays the
          primary surface; this never becomes a leaderboard. */}
      <SeatsAroundYou />

      {/* Wave C4 — progression / story loop. Sits right under the seat so the
          page reads "who you are → where you fit in the story → what changed
          while you were away". Answers current chapter, progress to the next
          chapter threshold (= next real member-number milestone), and why early
          member numbers matter — story/identity only, never financial. */}
      <CockpitProgression />

      {/* Wave C2 — retention loop. Answers "what changed while I was away?"
          immediately under the seat: protocol deltas since your last visit
          (first-visit safe), your wallet memory timeline, and wallet-scoped
          milestones. Real/cached deltas only — never fabricated. */}
      <CockpitMemory />

      {/* Protocol heartbeat — the single most recent on-chain event narrated as
          one calm line ("the protocol is alive right now"), with proof + an
          explicit LIVE/PARTIAL/PENDING truth state. Sits directly above the
          analytical pulse grid: heartbeat headline → the seven numbers behind
          it. Never invents motion or claims "live now" without a real event. */}
      <ProtocolHeartbeat />

      {/* Protocol-live snapshot — what the protocol is doing right now, read
          live from Avalanche. Sits between identity and holdings so the page
          reads: your seat → since you were away → the protocol's pulse → what you hold. */}
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
            Holdings, Artifacts &amp; Collecting
          </h2>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · what you own · what to collect next · live vs pending
          </span>
        </div>
        <CockpitCollector record={record} />
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
      style={{ background: "var(--card)" }}
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
              <CockpitBadges record={record} nextMemberNumber={idx.totals.nextMemberNumber} />
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
            {record ? (
              <div className="mb-4">
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
      <div className="px-5 sm:px-6 md:px-8 pb-5">
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
    <div>
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
