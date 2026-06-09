// ─────────────────────────────────────────────────────────────────────────
// MemberCockpitCandidate — the /my-syndicate cockpit.
//
// Doctrine: docs/PROTOCOL_IN_PUBLIC_DOCTRINE.md
//   • One primary object: MY SEAT. Everything else orbits the seat.
//   • Story model: My Seat → My Chapter → My Memory → My Future.
//   • Identity is consolidated — Member #, Chapter, Rank, SYN, USDC,
//     Purchases, Artifacts, First action all live in the seat panel.
//   • Protocol state is secondary context, not a competing dashboard.
//   • No documentation paragraphs. State over explanation.
// ─────────────────────────────────────────────────────────────────────────

import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useHolderIndex } from "@/lib/holder-index";
import { getChapterById } from "@/lib/chapters";
import { useProtocolTruth } from "@/lib/protocol-truth";
import { useProtocolEvents } from "@/lib/protocol-events";
import { explorerUrlForAddress, txExplorerUrl } from "@/lib/syndicate-config";
import { fmtAddress } from "@/lib/sale-hooks";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GlassCard,
  Pill,
  ProgressBar,
  Section,
  StatusPill,
} from "@/components/syndicate/Primitives";
import { isValidTxHash } from "@/components/syndicate/TxProofDrawer";
import { WhatChangedForYou } from "@/components/syndicate/WhatChangedForYou";
import { YourNextAction } from "@/components/syndicate/YourNextAction";
import { MyPurchaseRouting } from "@/components/syndicate/MyPurchaseRouting";
import { MyArchivePreview } from "@/components/syndicate/MyArchivePreview";
import { MyReferralCard, MyReputationConceptCard } from "@/components/syndicate/MyReferralCard";

// ── helpers ──────────────────────────────────────────────────────────────
function AccessibleProgress({
  value,
  max,
  label,
  tone = "gold",
}: {
  value: number;
  max: number;
  label: string;
  tone?: "gold" | "navy";
}) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <ProgressBar value={value} max={max} tone={tone} />
    </div>
  );
}

const fmtInt = (n: number | undefined) =>
  n === undefined ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtUsd = (n: number | undefined, d = 0) =>
  n === undefined
    ? "—"
    : `$${n.toLocaleString("en-US", { maximumFractionDigits: d })}`;

function chapterShortLabel(id: string | undefined) {
  if (!id) return "—";
  try {
    const c = getChapterById(id as Parameters<typeof getChapterById>[0]);
    return c.label.replace(/^Chapter\s+/, "");
  } catch {
    return "—";
  }
}

// ── 1 · MY SEAT — the single dominant primary panel ──────────────────────
function MySeatPrimary() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;
  const { events } = useProtocolEvents({ limit: 30 });

  const seatStatus = isConnected ? (idx.isLoading ? "PENDING" : record ? "LIVE" : "PENDING") : "PENDING";

  const ownedArtifacts = address
    ? events.filter(
        (e) =>
          (e.kind === "nft-mint-first-signal" ||
            e.kind === "nft-mint-patron-seal" ||
            e.kind === "nft-mint-other") &&
          (e.detail || "").toLowerCase().includes(address.toLowerCase()),
      ).length
    : 0;

  return (
    <Section id="my-seat" className="pt-4 pb-3 md:pt-5 md:pb-4">
      <GlassCard className="p-4 sm:p-5 md:p-6 border-[var(--gold)]/30">
        {/* Header line */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-border/40">
          <StatusPill status={seatStatus} />
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
            My Seat
          </span>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · permanent · sealed on-chain
          </span>
          {isConnected && address && (
            <a
              href={explorerUrlForAddress(address) ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View your wallet ${address} on explorer`}
              className="ml-auto mono text-[11px] text-foreground/70 hover:text-[var(--gold)] underline-offset-4 hover:underline inline-flex items-center"
            >
              {fmtAddress(address)} ↗
            </a>
          )}
        </div>

        {!isConnected ? (
          <EmptySeatPrompt
            text="Connect a wallet to see your seat — member number, chapter, rank, receipts, and artifacts."
            cta="See the Membership Sale →"
          />
        ) : idx.isLoading ? (
          <SeatSkeleton />
        ) : !record ? (
          <EmptySeatPrompt
            text={
              <>
                Wallet connected — but no Membership Sale purchases recorded yet.
                If you join now, your seat would be{" "}
                <span className="mono font-semibold text-foreground">
                  #{fmtInt(idx.totals.nextMemberNumber)}
                </span>
                .
              </>
            }
            cta="Join the Membership Sale →"
          />
        ) : (
          <>
            {/* Dominant identity row */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 md:gap-6 items-center">
              <div className="flex items-baseline gap-4 md:gap-5">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Member
                  </div>
                  <div className="font-serif text-5xl md:text-6xl leading-none text-[var(--gold)] tabular-nums">
                    #{fmtInt(record.founderNumber)}
                  </div>
                </div>
                <div className="h-12 w-px bg-border/60" aria-hidden="true" />
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Chapter
                  </div>
                  <div className="font-serif text-2xl md:text-3xl leading-tight text-foreground">
                    {chapterShortLabel(record.chapter)}
                  </div>
                </div>
              </div>

              {/* Rank inline */}
              <RankInline
                rank={record.currentRank}
                nextRank={record.nextRank}
                cumulativeUsdc={record.cumulativeUsdc}
                usdcToNext={record.usdcToNextRank}
              />
            </div>

            {/* Seat stats — orbiting facts */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <Tile
                label="SYN received"
                value={fmtInt(Math.round(record.cumulativeSyn))}
                hint="cumulative"
                href={null}
              />
              <Tile
                label="USDC routed"
                value={fmtUsd(record.cumulativeUsdc, 2)}
                hint="70/20/10"
                href={null}
              />
              <Tile
                label="Purchases"
                value={fmtInt(record.purchaseCount)}
                hint={record.purchaseCount === 1 ? "sealed event" : "sealed events"}
                href={null}
              />
              <Tile
                label="Artifacts"
                value={fmtInt(ownedArtifacts)}
                hint="indexed mints"
                href={null}
              />
              <Tile
                label="First purchase"
                value={isValidTxHash(record.firstPurchaseTx) ? "tx ↗" : "pending"}
                hint="entry into chronicle"
                href={isValidTxHash(record.firstPurchaseTx) ? txExplorerUrl(record.firstPurchaseTx) : null}
              />
              <Tile
                label="Last action"
                value={isValidTxHash(record.lastPurchaseTx) ? "tx ↗" : "pending"}
                hint="most recent purchase"
                href={isValidTxHash(record.lastPurchaseTx) ? txExplorerUrl(record.lastPurchaseTx) : null}
              />
            </div>

            {/* Change + Next — attached to the seat, not a separate dashboard row */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-3 pt-4 border-t border-border/40">
              <WhatChangedForYou />
              <YourNextAction />
            </div>
          </>
        )}
      </GlassCard>
    </Section>
  );
}

function EmptySeatPrompt({ text, cta }: { text: React.ReactNode; cta: string }) {
  return (
    <div className="rounded-md border border-dashed border-border/60 p-5 bg-muted/20">
      <p className="text-sm text-foreground/85 leading-relaxed">{text}</p>
      <div className="mt-3">
        <Link
          to="/join"
          className="mono text-[12px] uppercase tracking-[0.2em] text-[color:oklch(0.5_0.13_75)] hover:text-[var(--gold)] underline-offset-4 hover:underline min-h-[44px] inline-flex items-center"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

function SeatSkeleton() {
  return (
    <div className="space-y-4" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-5">
        <Skeleton className="h-14 w-28" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-12 w-48" />
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

function RankInline({
  rank,
  nextRank,
  cumulativeUsdc,
  usdcToNext,
}: {
  rank: { name: string; group: string; usdc: number; badge: string } | null;
  nextRank: { name: string; usdc: number } | null;
  cumulativeUsdc: number;
  usdcToNext: number | null;
}) {
  if (!rank) {
    return (
      <div className="rounded-md border border-dashed border-border/60 p-3 text-sm text-foreground/75">
        No rank yet — first purchase seals one on-chain.
      </div>
    );
  }
  const progressValue = nextRank ? Math.max(0, cumulativeUsdc - rank.usdc) : 1;
  const progressMax = nextRank ? Math.max(1, nextRank.usdc - rank.usdc) : 1;
  return (
    <div
      className="rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/[0.04] p-3 md:p-4"
      role="group"
      aria-label={`Rank: ${rank.name}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="size-11 rounded-full border border-[var(--gold)]/60 bg-[var(--gold)]/10 flex items-center justify-center mono text-[12px] uppercase tracking-[0.16em] text-[var(--gold)] shrink-0"
          aria-hidden="true"
        >
          {rank.name.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Rank · {rank.group}
          </div>
          <div className="font-serif text-lg leading-tight text-foreground truncate">
            {rank.name}
          </div>
        </div>
        <Link
          to="/ranks"
          aria-label="View all ranks"
          className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline shrink-0"
        >
          All ranks →
        </Link>
      </div>
      {nextRank && usdcToNext !== null && (
        <div className="mt-3">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 flex items-center justify-between gap-2">
            <span className="truncate">→ {nextRank.name}</span>
            <span className="tabular-nums shrink-0">{fmtUsd(usdcToNext, 2)} to go</span>
          </div>
          <AccessibleProgress
            value={progressValue}
            max={progressMax}
            label={`Progress to ${nextRank.name}`}
          />
        </div>
      )}
    </div>
  );
}

// ── 2 · MY CHAPTER — context that orbits the seat ────────────────────────
function MyChapterContext() {
  const truth = useProtocolTruth();
  const cp = truth.chapterProgress.value;
  const loading = truth.isLoading;
  const worldStatus =
    loading ? "PENDING"
    : truth.members.status === "LIVE" && truth.usdcRaised.status === "LIVE" ? "LIVE"
    : "PARTIAL";

  return (
    <Section id="my-chapter" className="py-3 md:py-4">
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <StatusPill status={worldStatus} />
        <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
          My Chapter
        </h2>
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          · where the protocol is right now
        </span>
        <Link
          to="/transparency"
          className="ml-auto mono text-[11px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
        >
          Transparency →
        </Link>
      </div>
      <GlassCard className="p-4 md:p-5">
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : cp ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
              <div className="font-serif text-xl md:text-2xl text-foreground">
                Chapter {cp.label}
              </div>
              <div className="mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
                <span className="text-foreground">{fmtInt(cp.taken)}</span>
                /{fmtInt(cp.capacity)} seats ·{" "}
                <span className="text-[var(--gold)]">{fmtInt(cp.remaining)} until close</span>
              </div>
            </div>
            <AccessibleProgress
              value={cp.taken}
              max={cp.capacity}
              label={`Chapter ${cp.label} progress`}
            />
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              <Tile label="Members" value={fmtInt(truth.members.value)} hint="indexed" href={truth.members.verifyHref} />
              <Tile label="Sale volume" value={fmtUsd(truth.usdcRaised.value)} hint="USDC routed" href={truth.usdcRaised.verifyHref} />
              <Tile label="Vault" value={fmtUsd(truth.vaultUsdc.value)} hint="70% slice" href={truth.vaultUsdc.verifyHref} />
              <Tile
                label="Next member"
                value={truth.nextMemberNumber.value !== undefined ? `#${fmtInt(truth.nextMemberNumber.value)}` : "—"}
                hint="if you join now"
                href={null}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Protocol forming in public.</p>
        )}
      </GlassCard>
    </Section>
  );
}

// ── 3 · MY MEMORY — receipts + artifacts + recent on-chain activity ──────
function ProtocolWatchCompact() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 5 });
  const KIND_LABEL: Record<string, string> = {
    "purchase": "Purchase", "swap-buy": "LP Buy", "swap-sell": "LP Sell",
    "lp-add": "LP Add", "lp-remove": "LP Remove", "vault-in": "Vault In",
    "vault-out": "Vault Out", "new-member": "New Member", "rank-reached": "Rank",
    "nft-mint-first-signal": "Mint", "nft-mint-patron-seal": "Mint", "nft-mint-other": "Mint",
  };
  const slice = events.slice(0, 5);
  const status = isLoading ? "PENDING" : isError ? "PARTIAL" : slice.length ? "LIVE" : "PENDING";
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <StatusPill status={status} />
        <h3 className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground m-0 font-normal">
          Recent activity
        </h3>
        <Link to="/activity" className="ml-auto mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline">
          Open ledger →
        </Link>
      </div>
      <GlassCard className="p-2 md:p-3">
        {isLoading ? (
          <div className="space-y-2 p-1" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : slice.length === 0 ? (
          <p className="text-sm text-muted-foreground p-2">Awaiting the next event.</p>
        ) : (
          <ol className="divide-y divide-border/40">
            {slice.map((e) => {
              const validTx = isValidTxHash(e.txHash);
              return (
                <li key={e.id} className="flex items-center gap-2 py-1.5 px-1 min-w-0">
                  <span className="mono text-[10px] uppercase tracking-[0.16em] px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground shrink-0">
                    {KIND_LABEL[e.kind] ?? "Event"}
                  </span>
                  <span className="text-xs text-foreground truncate flex-1 min-w-0">{e.title}</span>
                  {validTx ? (
                    <a
                      href={txExplorerUrl(e.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Verify on explorer (block ${e.blockNumber.toString()})`}
                      className="mono text-[10px] text-muted-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline shrink-0"
                    >
                      verify ↗
                    </a>
                  ) : (
                    <span className="mono text-[10px] text-muted-foreground/60 shrink-0">pending</span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </GlassCard>
    </div>
  );
}

function MyMemoryRow() {
  return (
    <Section id="my-memory" className="py-3 md:py-4">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
          My Memory
        </h2>
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          · receipts, artifacts, recent events
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <MyPurchaseRouting />
        <div id="cockpit-artifacts">
          <MyArchivePreview />
        </div>
      </div>
      <div className="mt-3">
        <ProtocolWatchCompact />
      </div>
    </Section>
  );
}

// ── 4 · MY FUTURE — referral, reputation, pending modules ────────────────
function MyFutureRow() {
  const modules = [
    { name: "Governance", note: "Member decisions" },
    { name: "Reputation", note: "Builder Records" },
    { name: "Marketplace", note: "Artifact secondary" },
    { name: "B2B", note: "Routed integrations" },
    { name: "AI tools", note: "Member surfaces" },
  ];
  return (
    <Section id="my-future" className="py-3 md:py-4">
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <StatusPill status="PENDING" />
        <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
          My Future
        </h2>
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          · what is coming for this seat
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <MyReferralCard />
        <MyReputationConceptCard />
      </div>
      <GlassCard className="p-3">
        <ul className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {modules.map((m) => (
            <li key={m.name} className="surface elevated p-2.5 flex flex-col gap-0.5">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{m.name}</span>
              <span className="text-xs text-foreground/80">{m.note}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </Section>
  );
}

// ── Tile ─────────────────────────────────────────────────────────────────
function Tile({
  label,
  value,
  hint,
  href,
  emphasize = false,
}: {
  label: string;
  value: string;
  hint?: string;
  href: string | null;
  emphasize?: boolean;
}) {
  const ariaLabel = `${label}: ${value}${hint ? ` (${hint})` : ""}`;
  const inner = (
    <div
      className={`rounded-md border px-3 py-2 h-full min-h-[60px] transition-colors ${
        emphasize
          ? "border-[var(--gold)]/40 bg-[var(--gold)]/[0.04]"
          : "border-border/50 bg-background/40 hover:border-border"
      }`}
    >
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground truncate">
        {label}
      </div>
      <div className="mono text-sm md:text-base font-semibold text-foreground mt-0.5 tabular-nums truncate">
        {value}
      </div>
      {hint && (
        <div className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/80 mt-0.5 truncate">
          {hint}
        </div>
      )}
    </div>
  );
  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      aria-label={`${ariaLabel} — verify on explorer`}
      className="block rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gold)]/60"
    >
      {inner}
    </a>
  ) : (
    <div role="group" aria-label={ariaLabel}>
      {inner}
    </div>
  );
}

// ── Dashboard tab nav — story sections only ─────────────────────────────
function DashboardNav() {
  const tabs = [
    { href: "#my-seat", label: "Seat" },
    { href: "#my-chapter", label: "Chapter" },
    { href: "#my-memory", label: "Memory" },
    { href: "#my-future", label: "Future" },
  ];
  return (
    <nav
      aria-label="Member cockpit sections"
      className="sticky top-0 z-20 -mx-4 sm:mx-0 backdrop-blur bg-background/85 border-b border-border/50"
    >
      <ul className="flex gap-1 overflow-x-auto px-4 sm:px-2 py-2 no-scrollbar">
        {tabs.map((t) => (
          <li key={t.href} className="shrink-0">
            <a
              href={t.href}
              className="mono text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded border border-transparent text-muted-foreground hover:text-[var(--gold)] hover:border-[var(--gold)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gold)]/60"
            >
              {t.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ── Divider — kept as named export, renders nothing ──────────────────────
export function CockpitLegacyDivider() {
  return null;
}

// Kept for backwards-compat (Pill import path).
void Pill;

// ── Main cockpit shell — story-ordered, seat-centric ────────────────────
export function MemberCockpitCandidate() {
  return (
    <>
      <DashboardNav />
      <MySeatPrimary />
      <MyChapterContext />
      <MyMemoryRow />
      <MyFutureRow />
    </>
  );
}
