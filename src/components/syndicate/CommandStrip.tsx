// CommandStrip — sticky DexScreener/Dune-style command bar for /my-syndicate.
//
// Surfaces the 5 Core-Asset facts the moment a wallet is connected:
//   member# · chapter-of-joining · founders-flag · block anchor · cohort size
// and exposes a dense jump-nav across the 8 frozen v2 sections so the page
// reads as a command center, not a marketing scroll.
//
// Constitutional notes
// ────────────────────
// - Surfaces ≥2 of the 5 seat facts (member# + chapter-of-joining + block anchor) → Core Asset gate.
// - Positional only — no price, no PnL, no portfolio value → Vision / banned-copy.
// - Disconnected state is a shell with a single primary CTA → Inactive-widget doctrine.
// - All values are LIVE on-chain reads via useHolderIndex / useProtocolPulse; no fabrication.

import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useHolderIndex } from "@/lib/holder-index";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { fmtAddress } from "@/lib/sale-hooks";
import { explorerUrlForAddress } from "@/lib/syndicate-config";

const ANCHORS: Array<{ id: string; label: string }> = [
  { id: "my-seat", label: "Seat" },
  { id: "my-assets", label: "Assets" },
  { id: "activity", label: "Activity" },
  { id: "sealing-next", label: "Sealing Next" },
  { id: "my-chronicle", label: "Chronicle" },
  { id: "my-growth", label: "Growth" },
  { id: "my-horizon", label: "Horizon" },
  { id: "protocol-context", label: "Context" },
];

function chapterForOrdinal(o: number | undefined): string {
  if (o === undefined) return "—";
  if (o <= 333) return "I · Genesis Signal";
  if (o <= 1_000) return "II · First Thousand";
  if (o <= 3_333) return "III · Expansion";
  if (o <= 10_000) return "IV · First Ten Thousand";
  return "V · Open Era";
}

export function CommandStrip() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const pulse = useProtocolPulse();
  const record = address ? idx.getByWallet(address) : undefined;

  const memberOrdinal = record?.memberNumber;
  const cohort = pulse.buyers;
  const chapterLabel = chapterForOrdinal(memberOrdinal);
  const firstBlock = record?.firstPurchaseBlock;

  return (
    <div
      className="sticky top-0 z-30 -mx-5 md:-mx-8 mb-4 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      role="region"
      aria-label="My Syndicate command strip"
    >
      {/* Row 1 — live facts */}
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-2 flex flex-wrap items-center gap-x-5 gap-y-1.5">
        {/* live tick */}
        <span className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span
            className={`size-1.5 rounded-full ${isConnected ? "bg-[var(--success)] pulse-dot" : "bg-muted-foreground/40"}`}
          />
          {isConnected ? "LIVE" : "IDLE"}
        </span>

        {/* wallet */}
        <Fact label="Wallet">
          {isConnected && address ? (
            <a
              href={explorerUrlForAddress(address) ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[12px] text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline tabular-nums"
            >
              {fmtAddress(address)} ↗
            </a>
          ) : (
            <span className="mono text-[12px] text-muted-foreground">—</span>
          )}
        </Fact>

        {/* member ordinal */}
        <Fact label="Seat #">
          <span className="mono text-[12px] text-foreground tabular-nums">
            {memberOrdinal !== undefined ? `#${memberOrdinal.toLocaleString("en-US")}` : "—"}
          </span>
        </Fact>

        {/* chapter of joining */}
        <Fact label="Chapter">
          <span className="mono text-[12px] text-foreground tabular-nums">{chapterLabel}</span>
        </Fact>

        {/* block anchor */}
        <Fact label="Block">
          <span className="mono text-[12px] text-foreground tabular-nums">
            {firstBlock !== undefined ? firstBlock.toString() : "—"}
          </span>
        </Fact>

        {/* cohort size */}
        <Fact label="Cohort">
          <span className="mono text-[12px] text-foreground tabular-nums">
            {cohort !== undefined ? cohort.toLocaleString("en-US") : "—"}
          </span>
        </Fact>

        {!isConnected && (
          <Link
            to="/join"
            className="mono ml-auto inline-flex items-center gap-1.5 rounded-md border border-[var(--gold)]/60 bg-[var(--gold)]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground hover:bg-[var(--gold)]/20"
          >
            Connect wallet →
          </Link>
        )}
      </div>

      {/* Row 2 — jump-nav */}
      <nav
        aria-label="Section jump navigation"
        className="mx-auto max-w-7xl px-5 md:px-8 pb-2 flex flex-wrap items-center gap-x-3 gap-y-1 overflow-x-auto"
      >
        {ANCHORS.map((a) => (
          <a
            key={a.id}
            href={`#${a.id}`}
            className="mono whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            {a.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/80">
        {label}
      </span>
      {children}
    </span>
  );
}
