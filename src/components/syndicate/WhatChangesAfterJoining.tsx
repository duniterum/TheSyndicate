import { Section, SectionHeader, GlassCard, StatusPill } from "./Primitives";

/**
 * WhatChangesAfterJoining — Phase D conversion section.
 *
 * Sets honest expectations. Three explicit columns:
 *   LIVE today · PLANNED next · PENDING contracts
 *
 * No overpromises. Pending = contract not deployed. Planned = scoped but
 * not built. Live = verifiable right now.
 */
export function WhatChangesAfterJoining() {
  const groups: Array<{
    status: "LIVE" | "PARTIAL" | "PENDING";
    eyebrow: string;
    title: string;
    items: string[];
  }> = [
    {
      status: "LIVE",
      eyebrow: "Live today",
      title: "What changes the moment you buy SYN",
      items: [
        "You hold SYN — a fixed-supply ERC20 on Avalanche.",
        "Your wallet is counted onchain by the Membership Sale contract.",
        "70% of your USDC routes to the Vault wallet, 20% to Liquidity, 10% to Operations — atomically.",
        "Your rank is set by the USDC amount you paid (1 SYN = $0.01).",
        "Your membership rank is visible from your on-chain balance.",
        "Your buy transaction lives forever on Avalanche, with a public receipt.",
        "Your shareable Member Card populates from your wallet address.",
      ],
    },
    {
      status: "PARTIAL",
      eyebrow: "Planned next",
      title: "What we are building on top",
      items: [
        "Indexer-derived member registry and join order (today: counted onchain, no leaderboard).",
        "Richer member profile pages with rank history and wallet-level protocol receipts.",
        "Sealed protocol events — chapter archive of milestones tied to the members who witnessed them.",
        "Per-member shareable identity assets based on verified membership status.",
      ],
    },
    {
      status: "PENDING",
      eyebrow: "Pending contracts",
      title: "What is intentionally not promised yet",
      items: [
        "Programmatic Vault contract — PENDING; future automation would require audit and explicit activation.",
        "Deeper chapter archive records tied to verified member history.",
        "Automated treasury moves (rebalancing, LP top-ups).",
        "Additional protocol service or partnership streams.",
      ],
    },
  ];

  return (
    <Section id="what-changes-after-joining">
      <SectionHeader
        eyebrow="What changes after joining"
        title={
          <>
            Honest expectations, <span className="text-gradient-gold">labeled by status</span>
          </>
        }
        description="No overpromise. Live = verifiable today. Planned = scoped, not built. Pending = contract not deployed. Read all three columns before joining."
      />

      <div className="grid md:grid-cols-3 gap-5">
        {groups.map((g) => (
          <GlassCard key={g.eyebrow}>
            <div className="flex items-center justify-between gap-3">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {g.eyebrow}
              </div>
              <StatusPill status={g.status} />
            </div>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
              {g.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {g.items.map((it) => (
                <li
                  key={it}
                  className="text-sm text-muted-foreground leading-relaxed flex gap-2"
                >
                  <span
                    className={`mt-2 inline-block size-1.5 shrink-0 rounded-full ${
                      g.status === "LIVE"
                        ? "bg-[var(--success)]"
                        : g.status === "PARTIAL"
                        ? "bg-[color:oklch(0.78_0.14_75)]"
                        : "bg-[color:oklch(0.6_0.02_260/0.5)]"
                    }`}
                  />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
