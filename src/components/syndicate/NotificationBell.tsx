// Header notification bell — protocol pulse in the header.
//
// Truth model:
//   • Reads from useUnreadProtocolEvents → useProtocolEvents (same source
//     as /activity). No fake notifications, no marketing, no invented
//     events.
//   • Unread is a localStorage hint only ("syndicate.activity.lastSeenBlock.v1").
//     Never used for ownership / eligibility.
//   • Wallet-specific badge ("you" tag) appears when the connected address
//     matches the event actor — a *display* helper, NOT a permission.
//
// Categories surfaced inside the panel mirror the canonical
// ProtocolEventKind taxonomy. No SYSTEM-noise mixed with protocol facts.

import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useAccount } from "wagmi";
import { useUnreadProtocolEvents } from "@/lib/use-unread-protocol-events";
import { txExplorerUrl } from "@/lib/syndicate-config";
import { isValidTxHash } from "./TxProofDrawer";
import type { ProtocolEvent } from "@/lib/protocol-events";

// Human-readable, visitor-safe category label per event kind.
const CATEGORY: Record<ProtocolEvent["kind"], string> = {
  purchase: "MEMBERS",
  "new-member": "MEMBERS",
  "rank-reached": "MILESTONE",
  "swap-buy": "LIQUIDITY",
  "swap-sell": "LIQUIDITY",
  "lp-add": "LIQUIDITY",
  "lp-remove": "LIQUIDITY",
  "vault-in": "TREASURY",
  "vault-out": "TREASURY",
  "nft-mint-first-signal": "NFT",
  "nft-mint-patron-seal": "NFT",
  "nft-mint-other": "NFT",
};

const CATEGORY_ORDER = ["MEMBERS", "MILESTONE", "NFT", "TREASURY", "LIQUIDITY"] as const;
type CategoryKey = (typeof CATEGORY_ORDER)[number];

export function NotificationBell({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { address } = useAccount();
  const { events, unread, unreadCount, isError, markAllRead } = useUnreadProtocolEvents(25);

  // Per-category unread counts — pure derivation from the same unread set
  // the bell badge uses. LOCAL hint only (never used for permissions).
  const unreadByCategory: Record<CategoryKey, number> = {
    MEMBERS: 0, MILESTONE: 0, NFT: 0, TREASURY: 0, LIQUIDITY: 0,
  };
  for (const e of unread) {
    const c = CATEGORY[e.kind] as CategoryKey | undefined;
    if (c) unreadByCategory[c] += 1;
  }


  // Close on outside click / escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Show newest 8 events, but collapse any run of 3+ adjacent same-kind
  // events into a single grouped row so vault-routing bursts don't drown
  // out genuinely new categories. Pure display — does not change unread
  // counting or the underlying event stream.
  const display = (() => {
    const raw = events.slice(0, 8);
    const out: Array<ProtocolEvent & { grouped?: number }> = [];
    let i = 0;
    while (i < raw.length) {
      let j = i;
      while (j < raw.length && raw[j].kind === raw[i].kind) j++;
      const run = raw.slice(i, j);
      if (run.length >= 3) {
        const head = run[0];
        out.push({ ...head, grouped: run.length });
      } else {
        out.push(...run);
      }
      i = j;
    }
    return out;
  })();
  const youAddr = address?.toLowerCase();

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          unreadCount > 0
            ? `Notifications · ${unreadCount} unread protocol event${unreadCount === 1 ? "" : "s"}`
            : "Notifications · all caught up"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground hover:border-[color:var(--gold)]/60 transition-colors"
      >
        <Bell className="size-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 mono min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-semibold tabular-nums flex items-center justify-center"
            style={{ background: "var(--gold)", color: "oklch(0.20 0.005 60)" }}
            aria-hidden="true"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Protocol notifications"
          className="absolute right-0 top-full mt-2 w-[340px] max-w-[92vw] z-50"
        >
          <div className="surface elevated rounded-lg shadow-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Protocol pulse
                </div>
                <div className="text-sm font-semibold">
                  {unreadCount > 0 ? `${unreadCount} new since you last looked` : "All caught up"}
                </div>
              </div>
              <button
                type="button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                Mark all read
              </button>
            </div>

            {/* Per-category unread counters — LOCAL hint only, derived
                from the same unread set as the bell badge. */}
            <div className="px-4 py-2 border-b border-border flex flex-wrap items-center gap-1.5">
              {CATEGORY_ORDER.map((c) => {
                const n = unreadByCategory[c];
                const active = n > 0;
                return (
                  <span
                    key={c}
                    className={
                      "mono text-[9px] uppercase tracking-[0.18em] rounded border px-1.5 py-0.5 " +
                      (active
                        ? "border-[color:var(--gold)]/60 text-foreground bg-[color:var(--gold)]/10"
                        : "border-border text-muted-foreground/70")
                    }
                    aria-label={`${c} · ${n} new`}
                  >
                    {c} <span className="tabular-nums">{n}</span>
                  </span>
                );
              })}
            </div>

            {isError && (
              <div className="px-4 py-2 border-b border-border bg-amber-500/10 mono text-[10px] uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">
                Activity source delayed · RPC fallback active
              </div>
            )}


            {display.length === 0 ? (
              <div className="px-4 py-6 text-xs text-muted-foreground">
                No indexed events in this window. The bell updates as soon as the next on-chain event fires.
              </div>
            ) : (
              <ul className="max-h-[360px] overflow-y-auto divide-y divide-border/40">
                {display.map((e) => {
                  const cat = CATEGORY[e.kind];
                  const mine = !!youAddr && e.actor?.toLowerCase() === youAddr;
                  const href = isValidTxHash(e.txHash) ? txExplorerUrl(e.txHash) : null;
                  const Row = (
                    <div className="px-4 py-2.5 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                          {cat}
                        </span>
                        {mine && (
                          <span
                            className="mono text-[9px] uppercase tracking-[0.18em] rounded px-1.5 py-0.5"
                            style={{ background: "var(--gold)", color: "oklch(0.20 0.005 60)" }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium truncate">
                        {e.grouped ? `${e.grouped} ${e.title.toLowerCase()} events` : e.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{e.detail}</div>
                    </div>
                  );
                  return (
                    <li key={e.id}>
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                          {Row}
                        </a>
                      ) : (
                        <Link to="/activity" onClick={() => setOpen(false)} className="block">
                          {Row}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <Link
                to="/activity"
                onClick={() => setOpen(false)}
                className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[color:var(--gold)]"
              >
                View all activity →
              </Link>
              <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Verifiable on Avascan
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
