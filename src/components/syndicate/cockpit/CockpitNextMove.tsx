// CockpitNextMove — the cockpit orchestrator.
//
// The single answer to "I have a seat. Now what?" It sits at the TOP of the
// Momentum band and SUMMARIZES the journey: one primary recommended step plus
// a compact grid of onward moves that LINK to surfaces already on the page
// (artifacts, recognition, chronicle) or to the join flow. It does NOT
// re-implement Progression, Sealing-Next, or the Action Dock — it points at
// them.
//
// Doctrine / language:
//   • Recognition only — naming a tier is not a reward, payout, or rate change.
//     We name the actual tier (e.g. "Reach Steward"); we never use the
//     gamification phrase "next rank", nor XP / score / points / streak.
//   • Member-state gating: while the holder index loads we show a neutral
//     "reading your seat" primary, never a Join CTA flashed at a real member.
//   • Future modules (marketplace, signal chamber) are clearly PENDING.

import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  useCockpitAccount,
  useCockpitHolderIndex,
} from "@/lib/dev/cockpit-fixtures";
import { StatusPill, type CanonicalStatus } from "@/components/syndicate/Primitives";
import { rankForUsdc } from "@/lib/syndicate-config";
import { nextSeatPackage } from "@/lib/package-catalog";
import { currentEra, nextEra } from "@/lib/eras";

const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: n % 1 === 0 ? 0 : 2 })}`;

type Move = {
  label: string;
  detail: string;
  status: CanonicalStatus;
  to?: "/join" | "/ranks";
  href?: string;
};

export function CockpitNextMove() {
  const { address, isConnected } = useCockpitAccount();
  const idx = useCockpitHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;
  const loading = idx.isLoading;

  const cumulativeUsdc = record?.cumulativeUsdc ?? 0;
  const { next } = rankForUsdc(cumulativeUsdc);
  const onwardPackage = nextSeatPackage(cumulativeUsdc);
  const delta = next ? Math.max(0, next.usdc - cumulativeUsdc) : 0;

  const era = currentEra();
  const upcomingEra = nextEra(era);

  // ── Primary recommended step ───────────────────────────────────────────
  let primary: { label: string; detail: string };
  if (isConnected && loading) {
    primary = {
      label: "Reading your seat…",
      detail: "Loading your on-chain position.",
    };
  } else if (!record) {
    primary = {
      label: "Take your seat",
      detail: "Buy SYN with USDC and claim your permanent member number.",
    };
  } else if (next) {
    primary = {
      label: `Reach ${next.name}`,
      detail: `${fmtUsd(delta)} more in routed USDC reaches ${next.name} recognition — recognition only, no payout or rate change.`,
    };
  } else {
    primary = {
      label: "Buy More SYN",
      detail: "You hold the deepest recognition tier. Add to your position any time.",
    };
  }

  // ── Onward moves — compact pointers to existing surfaces ────────────────
  const moves: Move[] = [
    {
      label: "Recognition",
      detail: next
        ? `Reach ${next.name} · +${fmtUsd(delta)} routed`
        : "Deepest recognition tier held",
      status: "LIVE",
      to: "/ranks",
    },
    {
      label: "Package",
      detail: onwardPackage
        ? `Next package · ${onwardPackage.rank.name} at ${fmtUsd(onwardPackage.usdc)}`
        : "Deepest seat package held",
      status: "LIVE",
      to: "/join",
    },
    {
      label: "Artifacts",
      detail: "Collect a Syndicate archive artifact",
      status: "LIVE",
      href: "#my-artifacts",
    },
    {
      label: "Chronicle",
      detail: record
        ? "Your block-anchored on-chain record"
        : "Your record begins at your first purchase",
      status: record ? "LIVE" : "PENDING",
      href: "#memory",
    },
    {
      label: "Referral",
      detail: "Share your seat — attribution preview",
      status: "PENDING",
      href: "#parked",
    },
    {
      label: "Distribution era",
      detail: upcomingEra
        ? `${era.name} · live rate · proposed next: ${upcomingEra.name}`
        : `${era.name} · live rate`,
      status: "LIVE",
      to: "/join",
    },
    {
      label: "Marketplace",
      detail: "Seat & artifact secondary — future module",
      status: "PENDING",
      href: "#parked",
    },
    {
      label: "Signal Chamber",
      detail: "Member signals — advisory only, future module",
      status: "PENDING",
      href: "#parked",
    },
  ];

  // CTA label must never read "Join The Syndicate" for a connected member whose
  // record is still loading (record is briefly undefined during idx.isLoading).
  const ctaLabel =
    isConnected && loading
      ? "Reading seat…"
      : record
        ? "Buy More SYN"
        : "Join The Syndicate";

  return (
    <div className="rounded-xl border border-[var(--gold)]/30 bg-card/50 overflow-hidden">
      {/* Primary recommended step */}
      <div className="relative p-4 md:p-5 border-b border-border/50">
        <div className="mb-2 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--gold)]" aria-hidden />
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Your next move
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="min-w-0 flex-1">
            <div className="font-serif text-2xl md:text-3xl text-foreground leading-tight">
              {primary.label}
            </div>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-xl">
              {primary.detail}
            </p>
          </div>
          <Link
            to="/join"
            className="group shrink-0 mono inline-flex items-center justify-center gap-2 rounded-[3px] px-5 py-3 text-[12px] uppercase tracking-[0.14em] font-bold"
            style={{
              background: "var(--gradient-gold)",
              color: "var(--accent-foreground)",
            }}
          >
            <span>{ctaLabel}</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>

      {/* Onward moves */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border/60">
        {moves.map((m) => (
          <MoveCard key={m.label} move={m} />
        ))}
      </div>
    </div>
  );
}

function MoveCard({ move }: { move: Move }) {
  const inner: ReactNode = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {move.label}
        </span>
        <StatusPill status={move.status} withDot={false} />
      </div>
      <p className="mt-1.5 text-xs text-foreground/85 leading-snug">{move.detail}</p>
      <span className="mt-2 inline-flex items-center gap-1 mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] group-hover:text-[var(--gold)]">
        Open <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </>
  );

  const cls =
    "group block bg-[var(--card)] p-3.5 text-left hover:bg-[var(--gold)]/5 transition-colors";

  if (move.to) {
    return (
      <Link to={move.to} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={move.href} className={cls}>
      {inner}
    </a>
  );
}
