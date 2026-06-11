// Protocol Moments — compact "I was there" rail.
// Pure derivation from live totals (members + USDC routed). Each moment is either
// REACHED (with the threshold crossed) or NEXT (the one coming up). No fake data,
// no fabricated timestamps — we only label state, never invent it.

import { Link } from "@tanstack/react-router";
import { Section, SectionHeader } from "./Primitives";
import { useProtocolPulse } from "@/lib/protocol-pulse";

type Moment = {
  id: string;
  label: string;
  kind: "members" | "usdc" | "lp" | "vault";
  target: number;
};

// Canonical doctrine (see src/lib/chapters.ts):
//   Chapter I Genesis Signal seals at #333
//   Chapter II First Thousand seals at #1,000
//   Chapter III The Expansion seals at #3,333
//   Chapter IV First Ten Thousand seals at #10,000
// Treasury/routing milestones ($100/$1k/$10k routed) are independent and valid.
const MOMENTS: Moment[] = [
  { id: "first-member",      label: "First Member recorded",                 kind: "members", target: 1 },
  { id: "first-100-usdc",    label: "First $100 routed on-chain",            kind: "usdc",    target: 100 },
  { id: "first-1k-usdc",     label: "First $1,000 routed",                   kind: "usdc",    target: 1_000 },
  { id: "first-lp",          label: "First LP event",                        kind: "lp",      target: 1 },
  { id: "genesis-signal-sealed", label: "Genesis Signal sealed at #333",     kind: "members", target: 333 },
  { id: "first-10k-usdc",    label: "First $10,000 routed",                  kind: "usdc",    target: 10_000 },
  { id: "first-thousand-sealed", label: "First Thousand sealed at #1,000",   kind: "members", target: 1_000 },
  { id: "expansion-sealed",  label: "The Expansion sealed at #3,333",        kind: "members", target: 3_333 },
];

export function ProtocolMoments() {
  const p = useProtocolPulse();
  const members = p.buyers;
  const usdc = p.usdcRaised;
  const lpTvl = p.lpTvlUsd;
  const vault = p.vaultUsdc;

  const isReached = (m: Moment): boolean => {
    if (m.kind === "members") return members !== undefined && members >= m.target;
    if (m.kind === "usdc")    return usdc    !== undefined && usdc    >= m.target;
    if (m.kind === "lp")      return lpTvl   !== undefined && lpTvl   > 0;
    if (m.kind === "vault")   return vault   !== undefined && vault   > 0;
    return false;
  };

  // Find the next-not-reached moment for highlighting.
  const nextId = MOMENTS.find((m) => !isReached(m))?.id;

  return (
    <Section id="protocol-moments">
      <SectionHeader
        eyebrow="Protocol Moments"
        title={<>The moments worth <span className="text-gradient-gold">being there for</span></>}
        description="Public, on-chain moments in the formation of the protocol. Each one is either already reached (visible in the registry) or coming next. Nothing is fabricated."
      />
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {MOMENTS.map((m) => {
          const reached = isReached(m);
          const isNext = !reached && m.id === nextId;
          return (
            <li
              key={m.id}
              className={`surface p-3 flex flex-col gap-1 border ${
                reached
                  ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                  : isNext
                    ? "border-[var(--gold)]/40 bg-[var(--gold)]/[0.04]"
                    : "border-border/40"
              }`}
            >
              <div className="mono text-[9px] uppercase tracking-[0.22em]">
                {reached ? (
                  <span className="text-emerald-700 dark:text-emerald-400">Reached · on-chain</span>
                ) : isNext ? (
                  <span className="text-[var(--gold)]">Next moment</span>
                ) : (
                  <span className="text-muted-foreground">Pending</span>
                )}
              </div>
              <div className="text-sm text-foreground/90 leading-snug">{m.label}</div>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Status derived live from sale, vault, and LP reads ·{" "}
        <Link to="/activity" className="hover:text-[var(--gold)] underline-offset-4 hover:underline">
          See activity →
        </Link>
      </div>
    </Section>
  );
}
