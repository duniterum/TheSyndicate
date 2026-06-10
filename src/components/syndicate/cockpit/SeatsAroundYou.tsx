// SeatsAroundYou — the "co-witness" band of the /my-syndicate cockpit.
//
// Answers a quiet, social question that Wake does not: who took the seats
// immediately on either side of yours? It renders the nearest earlier member,
// your own seat, and the nearest later member — your co-witnesses to the same
// moment in the order of entry.
//
// This is deliberately NOT a leaderboard: there are no amounts, no rank, no
// USDC, no standing, no comparison. It shows position only — three adjacent
// seats — so the cockpit feels socially alive without turning members against
// each other. Wake Behind You remains the primary emotional surface; this sits
// quietly beneath the seat panel.
//
// Truth doctrine (binding):
//   • Neighbours are real indexed records from useHolderIndex().ordered (sorted
//     by member number). We never fabricate a seat or a wallet.
//   • A visitor sees a preview invitation, never invented neighbours.
//   • The first member shows "no seat before" (truthful), and the latest member
//     shows the next seat as genuinely open (totals.nextMemberNumber).
//   • Order of entry is identity/story only — earlier is earlier, never better.

import type { ReactNode } from "react";
import { StatusPill } from "@/components/syndicate/Primitives";
import { CockpitSection, useCockpitEmbed } from "./cockpit-shell";
import { useCockpitAccount, useCockpitHolderIndex } from "@/lib/dev/cockpit-fixtures";

const fmtInt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

// Short, non-financial wallet identity for a neighbouring seat. Public on-chain
// address only — same data the Members archive already shows.
const shortWallet = (w: string) => `${w.slice(0, 6)}…${w.slice(-4)}`;

// ─── Shell ───────────────────────────────────────────────────────────────
// A quiet bordered surface (NOT the gold-glow seat panel) with the eyebrow and
// one-line framing. Keeps the band visually subordinate to the hero panel.
function Shell({
  status,
  children,
}: {
  status: "LIVE" | "PARTIAL" | "PENDING";
  children: ReactNode;
}) {
  const embedded = useCockpitEmbed();
  return (
    <CockpitSection id="seats-around" className={embedded ? "" : "py-4"}>
      <div
        className={cx(
          "rounded-xl border border-border/50 bg-card/40",
          embedded ? "p-4" : "px-5 sm:px-6 md:px-8 py-5",
        )}
      >
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <StatusPill status={status} />
          <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
            Seats around you
          </h2>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · your co-witnesses · order of entry only
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-4">
          The members whose seats sit on either side of yours — co-witnesses to
          the same moment in the order of entry. A shared place, not a contest
          and not a standing; earlier is simply earlier.
        </p>
        {children}
      </div>
    </CockpitSection>
  );
}

// ─── Seat chip ─────────────────────────────────────────────────────────────
type Slot =
  | { kind: "seat"; seatNumber: number; wallet: `0x${string}`; label: string; you?: boolean }
  | { kind: "open"; seatNumber: number; label: string; note: string }
  | { kind: "none"; label: string; note: string };

function SeatChip({ slot }: { slot: Slot }) {
  const isYou = slot.kind === "seat" && slot.you === true;
  const isGhost = slot.kind !== "seat";

  return (
    <div
      className={cx(
        "rounded-lg border px-4 py-3 flex flex-col gap-1.5 min-w-0",
        isYou
          ? "border-[var(--gold)]/50 bg-[var(--gold)]/[0.06]"
          : isGhost
          ? "border-dashed border-border/60 bg-transparent"
          : "border-border/50 bg-card/30",
      )}
      style={isYou ? { boxShadow: "var(--shadow-glow-gold)" } : undefined}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={cx(
            "font-serif tabular-nums leading-none truncate",
            isYou ? "text-3xl text-gradient-gold" : isGhost ? "text-2xl text-muted-foreground" : "text-2xl text-foreground",
          )}
        >
          {slot.kind === "none" ? "—" : `#${fmtInt(slot.seatNumber)}`}
        </span>
        {isYou && (
          <span className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--gold)] shrink-0">
            You
          </span>
        )}
      </div>

      {slot.kind === "seat" ? (
        <span className="mono text-[11px] text-muted-foreground truncate">
          {shortWallet(slot.wallet)}
        </span>
      ) : (
        <span className="mono text-[11px] italic text-muted-foreground/90 truncate">
          {slot.note}
        </span>
      )}

      <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80 truncate">
        {slot.label}
      </span>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────
export function SeatsAroundYou() {
  const embedded = useCockpitEmbed();
  const { address, isConnected } = useCockpitAccount();
  const idx = useCockpitHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;

  // ── Member: the real seats on either side of theirs ──────────────────────
  if (record) {
    const i = idx.ordered.findIndex(
      (r) => r.wallet.toLowerCase() === record.wallet.toLowerCase(),
    );
    const prev = i > 0 ? idx.ordered[i - 1] : undefined;
    const next =
      i >= 0 && i < idx.ordered.length - 1 ? idx.ordered[i + 1] : undefined;

    const slots: Slot[] = [
      prev
        ? {
            kind: "seat",
            seatNumber: prev.memberNumber,
            wallet: prev.wallet,
            label: "the seat before yours",
          }
        : {
            kind: "none",
            label: "before your seat",
            note: "no seat before — you opened the archive",
          },
      {
        kind: "seat",
        seatNumber: record.memberNumber,
        wallet: record.wallet,
        label: "your seat",
        you: true,
      },
      next
        ? {
            kind: "seat",
            seatNumber: next.memberNumber,
            wallet: next.wallet,
            label: "the seat after yours",
          }
        : {
            kind: "open",
            seatNumber: idx.totals.nextMemberNumber,
            label: "the next seat",
            note: "open — yet to be taken",
          },
    ];

    return (
      <Shell status="LIVE">
        <div
          className={cx(
            "grid gap-2",
            embedded ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3 gap-3",
          )}
        >
          {slots.map((slot, n) => (
            <SeatChip key={n} slot={slot} />
          ))}
        </div>
      </Shell>
    );
  }

  // ── Connected but index still resolving — may yet be a member. Show a quiet
  //    pending shell rather than the visitor preview (mirrors WakeBehindYou). ──
  if (isConnected && idx.isLoading) {
    return (
      <Shell status="PENDING">
        <p
          className="text-sm text-muted-foreground leading-relaxed"
          role="status"
        >
          Reading the seats around yours from Avalanche… they appear once your
          place is indexed.
        </p>
      </Shell>
    );
  }

  // ── Connected, resolved WITH ERROR — the index failed to read. This wallet
  //    may be a member, so never assert "no seat" or a visitor CTA. Show a
  //    quiet PARTIAL state with no fabricated neighbours. ───────────────────
  if (isConnected && idx.isError) {
    return (
      <Shell status="PARTIAL">
        <p
          className="text-sm text-muted-foreground leading-relaxed max-w-2xl"
          role="status"
        >
          Unable to read the seats around yours right now — the live member index
          didn't respond. They'll reappear once it reconnects.
        </p>
      </Shell>
    );
  }

  // ── Connected, resolved, but no seat for this wallet yet ─────────────────
  if (isConnected) {
    return (
      <Shell status="PENDING">
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          No seat for this wallet yet. Once you take your place, the members on
          either side of yours appear here as your co-witnesses.
        </p>
      </Shell>
    );
  }

  // ── Visitor preview — never fabricate neighbours ─────────────────────────
  return (
    <Shell status="PENDING">
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        Connect to see the seats around yours — the members who entered just
        before and just after your place.
      </p>
    </Shell>
  );
}
