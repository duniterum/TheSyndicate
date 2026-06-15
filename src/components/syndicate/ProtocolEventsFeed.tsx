// Unified chronological "Latest Protocol Events" feed.
// Purchases · LP swaps · LP add/remove · Vault USDC flows · new-member events.
// Newest first. Every row links to the tx. Designed for /activity and for
// a compact homepage preview.

import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { isAddress } from "viem";
import { useProtocolEvents, type ProtocolEvent } from "@/lib/protocol-events";
import { txExplorerUrl, explorerUrlForAddress } from "@/lib/syndicate-config";
import { applyActivityFilter, type ActivityFilterKey } from "@/lib/activity-filters";
import { GlassCard, Section, SectionHeader, StatusPill } from "./Primitives";
import { TxProofPill, isValidTxHash } from "./TxProofDrawer";
import { EmptyState } from "./EmptyState";
import {
  ACTIVE_INSTITUTIONAL_TX_INDEX,
  INSTITUTIONAL_REGISTER_ROUTE,
  institutionalLinkForTx,
} from "@/lib/activity-institutional-link";
import { KIND_ICON, KIND_LABEL } from "@/lib/event-presentation";

export function ProtocolEventsFeed({
  limit = 25,
  compact = false,
  withSection = true,
  filter = "all",
  showInstitutionalLink = false,
}: {
  limit?: number;
  compact?: boolean;
  withSection?: boolean;
  filter?: ActivityFilterKey;
  /** Opt-in: mark rows whose tx is in the ACTIVE Institutional Register (/activity only). */
  showInstitutionalLink?: boolean;
}) {
  const { events: allEvents, isLoading, refetch } = useProtocolEvents({ limit });
  const events = useMemo(() => applyActivityFilter(allEvents, filter), [allEvents, filter]);
  const pageSize = compact ? Math.min(limit, 5) : 12;
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const visibleEvents = compact ? events.slice(0, pageSize) : events.slice(0, visibleCount);
  const canLoadMore = !compact && visibleCount < events.length;

  const body = (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2">
          <StatusPill status="LIVE" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Avalanche · purchases · LP · vault flows
          </span>
        </div>
        <button
          onClick={() => refetch()}
          className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)]"
        >
          Refresh ↻
        </button>
      </div>

      {isLoading && events.length === 0 ? (
        <EmptyState
          variant="compact"
          status="PARTIAL"
          title="Reading recent blocks"
          description="Pulling purchases, swaps, liquidity, and treasury movements directly from Avalanche."
        />
      ) : events.length === 0 ? (
        <EmptyState
          variant="compact"
          status="PARTIAL"
          title="No indexed events in this window"
          description="No purchases, swaps, liquidity changes, or treasury flows in the recent block window. The feed updates as soon as the next on-chain event fires — auto-refreshes every 60 seconds."
        />
      ) : (
        <>
          <ul className="divide-y divide-border/40">
            {visibleEvents.map((e) => (
              <EventRow
                key={e.id}
                e={e}
                compact={compact}
                showInstitutionalLink={showInstitutionalLink}
              />
            ))}
          </ul>
          {!compact && (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/40 pt-4">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Showing {visibleEvents.length} of {events.length}
              </span>
              {canLoadMore && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => Math.min(events.length, n + pageSize))}
                  className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </>
      )}
    </GlassCard>
  );

  if (!withSection) return body;

  return (
    <Section id="protocol-events">
      <SectionHeader
        eyebrow="Latest Protocol Events"
        title={<>Every <span className="text-gradient-gold">on-chain movement</span>, newest first</>}
        description="Membership purchases, new-member archive entries, LP swaps, liquidity changes, and Vault USDC flows — merged into one chronological feed. Click any row to verify on Avascan."
      />
      {body}
    </Section>
  );
}

function EventRow({
  e,
  compact,
  showInstitutionalLink,
}: {
  e: ProtocolEvent;
  compact: boolean;
  showInstitutionalLink: boolean;
}) {
  const actorHref = e.actor ? explorerUrlForAddress(e.actor) : null;
  const institutional = showInstitutionalLink
    ? institutionalLinkForTx(ACTIVE_INSTITUTIONAL_TX_INDEX, e.txHash)
    : null;
  const toneCls =
    e.badge === "live"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : e.badge === "warn"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : "border-border/60 bg-background/40 text-muted-foreground";
  return (
    <li className="py-3 grid grid-cols-12 gap-3 items-center text-sm">
      <div className="col-span-12 md:col-span-2 flex items-center gap-2 min-w-0">
        <span className="mono text-base shrink-0">{KIND_ICON[e.kind]}</span>
        <span className={`mono shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] ${toneCls}`}>
          {KIND_LABEL[e.kind]}
        </span>
      </div>
      <div className={`col-span-12 ${compact ? "md:col-span-7" : "md:col-span-6"} min-w-0`}>
        <div className="font-medium truncate">{e.title}</div>
        <div className="text-xs text-muted-foreground truncate">{e.detail}</div>
        {institutional ? (
          <Link
            to={INSTITUTIONAL_REGISTER_ROUTE}
            title={`This transaction is recorded in the Protocol Institutional Register: ${institutional.title}`}
            className="mono mt-1 inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground hover:text-[var(--gold)] hover:border-[var(--gold)]/50"
          >
            ◆ Institutional record →
          </Link>
        ) : null}
      </div>
      <div className="col-span-6 md:col-span-2 mono text-[10px] text-muted-foreground truncate flex items-center gap-2">
        {e.actor && isAddress(e.actor) ? (
          <Link
            to="/wallet/$address"
            params={{ address: e.actor }}
            className="hover:text-[var(--gold)] underline-offset-2 hover:underline"
          >
            {e.actor.slice(0, 6)}…{e.actor.slice(-4)}
          </Link>
        ) : null}
        {actorHref ? (
          <a href={actorHref} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)]" title="View on Avascan">
            ↗
          </a>
        ) : null}
      </div>
      <div className="col-span-6 md:col-span-2 md:text-right flex md:justify-end items-center gap-1.5 flex-wrap">
        {isValidTxHash(e.txHash) ? (
          <a
            href={txExplorerUrl(e.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)]"
            title="Open transaction on Avascan"
          >
            {e.txHash.slice(0, 8)}…{e.txHash.slice(-6)}
          </a>
        ) : (
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            no tx
          </span>
        )}
        <TxProofPill txHash={e.txHash} ariaLabel={`Verify event ${e.id} transaction`} />
      </div>
    </li>
  );
}
