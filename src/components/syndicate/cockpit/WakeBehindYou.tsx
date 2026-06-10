// WakeBehindYou — the "emotional gravity" band of the /my-syndicate cockpit.
//
// Answers a single felt question right under the seat: how much of the story
// has formed BEHIND you since you entered. For a member this is a real, pure
// derivation — total indexed members minus your own member number. For a
// visitor it is the inverse: an invitation to anchor a place before more of
// the story moves past.
//
// Composition: this renders as an INTEGRATED band (a thin gold rule + the
// content) so it reads as a zone of the one composed seat panel, never as a
// separate bordered report card. The owning panel provides the frame.
//
// Truth doctrine (binding):
//   • Members count is the live indexed unique-wallet total (idx.totals.members)
//     and your member number is your indexed first-purchase order. The wake is
//     a pure subtraction — never fabricated, never inflated.
//   • Earlier is earlier, not better. The copy stays identity/story only — no
//     reward, yield, priority, or financial language.
//   • While the index is still reading we show nothing rather than a fake 0.

import type { ReactNode } from "react";
import { useAccount } from "wagmi";
import { Link } from "@tanstack/react-router";
import { useHolderIndex } from "@/lib/holder-index";

const fmtInt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

// Integrated band shell — a thin gold rule + the eyebrow. No card chrome; the
// composed seat panel owns the border and background.
function WakeBand({ children }: { children: ReactNode }) {
  return (
    <div className="relative pl-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-0.5 rounded-full"
        style={{ background: "var(--gradient-gold)" }}
      />
      <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] mb-2">
        The wake behind you
      </div>
      {children}
    </div>
  );
}

export function WakeBehindYou() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;
  const members = idx.totals.members;

  // ── Member: the real wake behind their seat ──────────────────────────────
  if (record) {
    const behind = Math.max(0, members - record.memberNumber);
    const hasWake = behind > 0;

    return (
      <WakeBand>
        {hasWake ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-serif text-4xl md:text-5xl leading-none text-gradient-gold tabular-nums">
              {fmtInt(behind)}
            </span>
            <span className="text-lg md:text-xl text-foreground">
              {behind === 1 ? "member entered after you." : "members entered after you."}
            </span>
          </div>
        ) : (
          <div className="text-lg md:text-xl text-foreground">
            No one has entered after you yet — you hold the latest seat. The next
            member falls in behind you.
          </div>
        )}
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Your seat was taken before theirs. That order is permanent — a
          historical coordinate, identity and story only. It is not a reward, a
          rate, or a priority; earlier is simply earlier.
        </p>
      </WakeBand>
    );
  }

  // Truth-gating: a connected wallet whose index has not resolved yet may
  // already be a member (record is briefly undefined mid-read). Never assert
  // the visitor "Join now" CTA to them — show a quiet pending shell until the
  // read settles into member or visitor.
  if (isConnected && idx.isLoading) {
    return (
      <WakeBand>
        <p className="text-sm text-muted-foreground leading-relaxed" role="status">
          Reading your place from Avalanche… your wake appears once your
          purchase history is indexed.
        </p>
      </WakeBand>
    );
  }

  // ── Connected, resolved WITH ERROR — the index failed to read. This wallet
  //    may well be a member, so we must NOT assert the visitor "Join" CTA on a
  //    failed read. Show a quiet partial state and no fabricated count. ──────
  if (isConnected && idx.isError) {
    return (
      <WakeBand>
        <p className="text-sm text-muted-foreground leading-relaxed" role="status">
          Unable to read your seat right now — the live index didn't respond.
          Your wake will reappear once it reconnects.
        </p>
      </WakeBand>
    );
  }

  // ── Visitor / not-yet-a-member: invitation to anchor a place ─────────────
  const showCount = idx.hasData && members > 0;

  return (
    <WakeBand>
      <div className="text-lg md:text-2xl font-serif text-foreground leading-snug max-w-2xl">
        Join now to anchor your place before the story moves further.
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {showCount && (
          <span className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {fmtInt(members)} members have already entered
          </span>
        )}
        <Link
          to="/join"
          className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-[oklch(0.22_0.025_260)] transition-transform hover:-translate-y-px"
          style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow-gold)" }}
        >
          {isConnected ? "Anchor your seat →" : "Join The Syndicate →"}
        </Link>
      </div>
    </WakeBand>
  );
}
