// Compact "Latest activity" rail for the hero right column. Projects the SAME
// canonical event stream as the full /activity feed (useProtocolEvents) into a
// few premium, verifiable rows — newest first. No fabricated copy: every title
// and detail comes straight from the canonical event registry, and each row
// links to the on-chain transaction.
import { Link } from "@tanstack/react-router";
import { useProtocolEvents, type ProtocolEvent } from "@/lib/protocol-events";
import { txExplorerUrl } from "@/lib/syndicate-config";
import { isValidTxHash } from "@/lib/tx-proof";
import { StatusPill, type CanonicalStatus } from "./Primitives";
import { KIND_ICON, KIND_LABEL } from "@/lib/event-presentation";

const ROWS = 4;

export function HeroActivityRail({ className = "" }: { className?: string }) {
  const { events, isLoading, sources } = useProtocolEvents({ limit: 8 });
  const rows = events.slice(0, ROWS);
  const hasRows = rows.length > 0;
  // Honest status: never claim LIVE while any source is erroring (rows may be
  // serving from a stale persisted cache). Degrade to PARTIAL instead.
  const anySourceError = sources.some((s) => s.isError);
  const status: CanonicalStatus = hasRows
    ? anySourceError
      ? "PARTIAL"
      : "LIVE"
    : isLoading
    ? "PARTIAL"
    : "PENDING";

  return (
    <div className={`surface p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Latest activity
          </span>
          <StatusPill status={status} />
        </div>
        <Link
          to="/activity"
          className="mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-[var(--verify)]"
        >
          View all →
        </Link>
      </div>

      {hasRows ? (
        <ul className="-mb-1 min-h-[15rem] divide-y divide-border/40">
          {rows.map((e) => (
            <HeroEventRow key={e.id} e={e} />
          ))}
        </ul>
      ) : (
        <div className="flex min-h-[15rem] flex-col items-center justify-center text-center">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {isLoading ? "Reading recent blocks" : "Awaiting first event"}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground/80">
            {isLoading
              ? "Pulling purchases, treasury flows, and burns from Avalanche."
              : "New on-chain movements appear here the moment they fire."}
          </p>
        </div>
      )}
    </div>
  );
}

function HeroEventRow({ e }: { e: ProtocolEvent }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="shrink-0 text-[15px] leading-none">{KIND_ICON[e.kind]}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="mono shrink-0 rounded-full border border-border/60 bg-background/40 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
            {KIND_LABEL[e.kind]}
          </span>
          <span className="truncate text-[12.5px] font-medium text-foreground">{e.title}</span>
        </div>
        <div className="mono mt-0.5 truncate text-[11px] text-muted-foreground">{e.detail}</div>
      </div>
      {isValidTxHash(e.txHash) ? (
        <a
          href={txExplorerUrl(e.txHash)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Verify this event on-chain"
          className="mono shrink-0 rounded-[3px] border px-2 py-1 text-[9px] uppercase tracking-[0.14em] transition-colors hover:brightness-110"
          style={{
            color: "var(--verify)",
            borderColor: "color-mix(in oklab, var(--verify) 38%, transparent)",
            background: "color-mix(in oklab, var(--verify) 7%, transparent)",
          }}
        >
          Tx ↗
        </a>
      ) : (
        <span className="mono shrink-0 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          no tx
        </span>
      )}
    </li>
  );
}
