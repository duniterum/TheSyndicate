// ─── Live Proof Strip ─────────────────────────────────────────────────────
// Tactyc-style metric strip: six investor-grade cards reading from the
// canonical Protocol Truth layer. Light-mode-first, dark-aware.
// Wave 2 of the recalibration (Museum + Tactyc + Kuldmuna anchors).

import { useProtocolTruth, statusPillClasses, type TruthStatus } from "@/lib/protocol-truth";
import { metricLabel } from "@/lib/protocol-metrics-registry";

type Card = {
  label: string;
  value: string;
  unit?: string;
  caption?: string;
  status: TruthStatus;
  href?: string | null;
};

function fmtUsd(n: number | undefined): string {
  if (n === undefined) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n).toLocaleString()}`;
  return `$${n.toFixed(2)}`;
}

function fmtInt(n: number | undefined): string {
  if (n === undefined) return "—";
  return Math.round(n).toLocaleString();
}

function fmtAgo(s: number | undefined): string {
  if (s === undefined) return "—";
  if (s < 60) return `${Math.round(s)}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export function LiveProofStrip() {
  const t = useProtocolTruth();

  const cards: Card[] = [
    {
      label: "Members",
      value: fmtInt(t.members.value),
      status: t.members.status,
      href: t.members.verifyHref,
    },
    {
      label: "USDC Routed",
      value: fmtUsd(t.usdcRaised.value),
      status: t.usdcRaised.status,
      href: t.usdcRaised.verifyHref,
    },
    {
      label: "Vault USDC",
      value: fmtUsd(t.vaultUsdc.value),
      status: t.vaultUsdc.status,
      href: t.vaultUsdc.verifyHref,
    },
    {
      label: metricLabel("synSold", true) ?? "SYN Sold",
      value: fmtInt(t.synSold.value),
      status: t.synSold.status,
      href: t.synSold.verifyHref,
    },
    {
      label: "Next Member #",
      value: t.nextMemberNumber.value !== undefined ? `#${t.nextMemberNumber.value}` : "—",
      status: t.nextMemberNumber.status,
      href: t.nextMemberNumber.verifyHref,
    },
    {
      label: "Last Buy",
      value: fmtAgo(t.lastBuyAgoSeconds.value),
      status: t.lastBuyAgoSeconds.status,
      href: t.lastBuyAgoSeconds.verifyHref,
    },
  ];

  return (
    <section
      aria-label="Live protocol proof"
      className="relative border-y"
      style={{
        borderColor: "var(--border)",
        background: "var(--card)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-5 md:py-6">
        <div className="flex items-center justify-between mb-3">
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Live protocol proof
          </span>
          <a
            href="/transparency"
            className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Verify all →
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          {cards.map((c) => (
            <ProofCard key={c.label} card={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProofCard({ card }: { card: Card }) {
  const pill = statusPillClasses(card.status);
  const inner = (
    <div
      className="group rounded-lg border p-3 md:p-4 transition-colors h-full"
      style={{
        borderColor: "var(--border)",
        background: "var(--background)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          {card.label}
        </span>
        <span
          className={`mono inline-flex items-center gap-1 rounded-full border px-1.5 py-[1px] text-[8px] uppercase tracking-[0.18em] ${pill.border}`}
        >
          <span className={`size-1 rounded-full ${pill.dot}`} />
          {card.status}
        </span>
      </div>
      <div className="mt-2 font-serif text-2xl md:text-[28px] leading-none tracking-tight text-foreground">
        {card.value}
      </div>
    </div>
  );

  if (card.href) {
    return (
      <a
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 rounded-lg"
        aria-label={`${card.label} — verify on explorer`}
      >
        {inner}
      </a>
    );
  }
  return inner;
}
