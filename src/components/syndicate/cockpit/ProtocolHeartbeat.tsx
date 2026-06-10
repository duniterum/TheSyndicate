// ProtocolHeartbeat — the "protocol is alive right now" band of /my-syndicate.
//
// LivePulseStrip already answers "what are the numbers?" as a 7-metric grid.
// This band answers a different, more human question in ONE line: what is the
// last real thing that happened on-chain? It narrates the single most recent
// purchase event as a calm heartbeat — proof the protocol is moving, not a
// scrolling ticker and not invented motion.
//
// Truth doctrine (binding):
//   • The event is the most-recently-active indexed record (idx.latest[0] —
//     the wallet behind the highest lastPurchaseBlock). Member number, amount,
//     block and tx are all real on-chain reads. Nothing is fabricated.
//   • If no event is indexed we say so plainly — we NEVER claim "live now".
//   • Truth state is explicit: LIVE (real event + resolved age), PARTIAL (index
//     errored, or the event is known but its age/tip is unresolved), PENDING
//     (still reading, or resolved with zero events).
//   • Language stays within doctrine: "USDC routed", "purchase" — never
//     "raised / yield / ROI / earn / stake", and no fake social proof.

import type { ReactNode } from "react";
import { Section, StatusPill } from "@/components/syndicate/Primitives";
import { useHolderIndex } from "@/lib/holder-index";
import { useChainTime } from "@/lib/chain-time";
import { formatAgo } from "@/lib/protocol-pulse";
import { txExplorerUrl } from "@/lib/syndicate-config";

const fmtInt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const shortTx = (h: string) => `${h.slice(0, 8)}…${h.slice(-6)}`;
const isTxHash = (h: unknown): h is string =>
  typeof h === "string" && /^0x[0-9a-fA-F]{6,}/.test(h);

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

type Status = "LIVE" | "PARTIAL" | "PENDING";

// Quiet bordered surface (NOT the gold-glow seat panel) — subordinate to the
// hero, sibling in register to the co-witness band.
function Shell({ status, children }: { status: Status; children: ReactNode }) {
  return (
    <Section id="protocol-heartbeat" className="py-4">
      <div className="rounded-xl border border-border/50 bg-card/40 px-5 sm:px-6 md:px-8 py-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusPill status={status} />
          <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
            Protocol heartbeat
          </h2>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · the last real thing that happened on-chain
          </span>
        </div>
        {children}
      </div>
    </Section>
  );
}

export function ProtocolHeartbeat() {
  const idx = useHolderIndex();
  const ct = useChainTime();
  const last = idx.latest[0];

  // ── Still reading, nothing cached yet ────────────────────────────────────
  if (idx.isLoading && !idx.hasData) {
    return (
      <Shell status="PENDING">
        <p className="text-sm text-muted-foreground leading-relaxed" role="status">
          Reading the protocol's pulse from Avalanche… the latest event appears
          once purchase history is indexed.
        </p>
      </Shell>
    );
  }

  // ── Index errored with no usable data — never fabricate a heartbeat ───────
  if (idx.isError && !last) {
    return (
      <Shell status="PARTIAL">
        <p className="text-sm text-muted-foreground leading-relaxed" role="status">
          Unable to read the protocol's pulse right now — the live index didn't
          respond. It will reappear once it reconnects.
        </p>
      </Shell>
    );
  }

  // ── Resolved, but zero events indexed — say so plainly, no "live now" ─────
  if (!last) {
    return (
      <Shell status="PENDING">
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          No protocol events indexed yet — the first heartbeat will appear here
          the moment a purchase is recorded on-chain.
        </p>
      </Shell>
    );
  }

  // ── A real most-recent event ─────────────────────────────────────────────
  const agoSeconds = ct.secondsSince(last.lastPurchaseBlock);
  const ageKnown = agoSeconds !== undefined;
  // "Right now" is only honest for a genuinely recent event. Within the last
  // hour reads as a live heartbeat ("just purchased" + a pulsing dot); anything
  // older is framed plainly as "the latest purchase" so we never fabricate
  // recency for a stale event — the timestamp always tells the literal truth.
  const RECENT_SECONDS = 60 * 60;
  const isRecent = ageKnown && agoSeconds < RECENT_SECONDS;
  // Age unresolved (chain tip not yet read) or a background refetch errored →
  // we can still show the event truthfully, but coverage is partial.
  const status: Status = idx.isError || !ageKnown ? "PARTIAL" : "LIVE";
  const showAmount = last.lastPurchaseUsdc > 0;
  const tx = last.lastPurchaseTx;

  return (
    <Shell status={status}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          aria-hidden
          className={cx(
            "inline-block w-2.5 h-2.5 rounded-full bg-[var(--gold)] self-center",
            status === "LIVE" && isRecent && "animate-pulse",
          )}
          style={{ boxShadow: "var(--shadow-glow-gold)" }}
        />
        <span className="font-serif text-xl md:text-2xl leading-snug text-foreground">
          Member #{fmtInt(last.memberNumber)}
          {isRecent ? " just purchased" : "'s latest purchase"}
          {showAmount ? (
            <>
              {" "}— <span className="text-gradient-gold">{fmtUsd(last.lastPurchaseUsdc)} USDC</span>{" "}
              routed
            </>
          ) : null}
        </span>
        <span className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {formatAgo(agoSeconds)}
        </span>
      </div>

      <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
        Every purchase routes USDC into the Vault, liquidity, and operations —
        this is the protocol moving on-chain, not a feed. One heartbeat at a
        time, the story keeps forming.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {isTxHash(tx) && (
          <a
            href={txExplorerUrl(tx)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.18em] text-[var(--verify)]/90 hover:text-[var(--verify)]"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-[var(--verify)]" />
            Verify this tx · {shortTx(tx)} ↗
          </a>
        )}
        {idx.asOfBlock !== undefined && (
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            as of block {idx.asOfBlock.toString()}
          </span>
        )}
      </div>
    </Shell>
  );
}
