import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { LivePurchase } from "@/components/syndicate/LivePurchase";
import { JoinStepsPlaque } from "@/components/syndicate/JoinStepsPlaque";
import { MembershipCalculator, AccessRate, PaymentStrategy, RankLadder } from "@/components/syndicate/Sections";
import { MemberCard } from "@/components/syndicate/MemberCard";
import { SeatRecordPanel } from "@/components/syndicate/SeatRecordPanel";
import { Section, SectionHeader, StatusPill } from "@/components/syndicate/Primitives";
import { RoutingFlow } from "@/components/syndicate/RoutingFlow";
import { ReferralAttributionNote } from "@/components/syndicate/ReferralAttributionNote";
import { SeatPackages, EraSchedulePreview } from "@/components/syndicate/JoinPackages";
import { ProtocolJourneySpine } from "@/components/syndicate/ProtocolJourneySpine";
import { AnticipationLine } from "@/components/syndicate/AnticipationLine";

export const Route = createFileRoute("/join")({
  // Package / preset cards deep-link here with a prefilled amount, e.g. a $25
  // card → /join?amount=25. The amount is auto-selected in the purchase widget
  // and the page scrolls straight to it. Validated to a positive number; any
  // junk or absent value simply falls through to the normal /join experience.
  validateSearch: (search): { amount?: number } => {
    const raw = (search as Record<string, unknown>).amount;
    const n =
      typeof raw === "string" || typeof raw === "number" ? Number(raw) : NaN;
    if (!Number.isFinite(n) || n <= 0) return {};
    // Clamp to a sane checkout range and snap to USDC (6-decimal) precision so the
    // prefill can never stringify to exponent notation (which would make the
    // widget's parseUnits fall back to 0n). The purchase widget still enforces the
    // live minimum, the era per-address cap and remaining inventory on top of this.
    const amount = Math.round(Math.min(n, 1_000_000) * 1e6) / 1e6;
    return amount > 0 ? { amount } : {};
  },
  head: () => ({
    meta: [
      { title: "Take Your Seat — Live Membership Sale | The Syndicate" },
      { name: "description", content: "Take a V1 membership seat by buying SYN with USDC on Avalanche. V3 uses deterministic era pricing; Era I currently returns 100 SYN per 1 USDC. Every purchase routes 70/20/10 to Vault, Liquidity, Operations." },
      { property: "og:title", content: "Take your seat in The Syndicate" },
      { property: "og:description", content: "Connect wallet, approve USDC, receive SYN, and verify the receipt on-chain." },
      { property: "og:url", content: "https://thesyndicate.money/join" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/join" }],
  }),
  component: JoinPage,
});

function JoinPage() {
  const { amount } = Route.useSearch();
  return (
    <PageShell
      eyebrow="Membership Ceremony"
      title="Take your seat. Receive SYN."
      description="This is the live Membership Sale on Avalanche. Buying membership delivers SYN to the wallet, routes USDC 70 / 20 / 10, and creates a receipt the protocol can remember."
    >
      <AnticipationLine />
      <ProtocolJourneySpine
        current="seat"
        compact
        id="membership-ceremony"
        title="This is where a visitor becomes seated."
        description="Membership is the state change: the wallet receives SYN, the route is enforced on-chain, and the receipt becomes the bridge into My Syndicate. The seat is binary; contribution depth is variable."
      />
      <JoinStepsPlaque />
      <ReferralAttributionNote className="mt-2" />
      <TransactionOutcomeBand />
      <Section id="member-card">
        <SectionHeader
          eyebrow="Member identity"
          title={<>Your <span className="text-gradient-gold">member card</span></>}
          description="Member number and chapter are derived live from the canonical holder index. If you have not joined yet, you'll see the seat you'd take."
        />
        <MemberCard />
      </Section>
      {/* Action lifted directly under member identity — buy first, explain the
          split right after (identity → action → proof). The purchase section
          itself carries id="buy" and self-scrolls when a deep-linked amount is
          present (e.g. /join?amount=25 from a package card). */}
      <div>
        <LivePurchase initialAmount={amount} />
      </div>
      <SeatPackages />
      <RoutingFlow />
      <SeatRecordPanel />
      <AccessRate />
      <EraSchedulePreview />
      <MembershipCalculator />
      <RankLadder />
      <PaymentStrategy />
    <RouteFinalCTA preset="mint" />
    </PageShell>
  );
}

function TransactionOutcomeBand() {
  const outcomes = [
    {
      label: "Seat",
      title: "Wallet becomes seated",
      body: "Membership purchase delivers SYN. Holding SYN is the V1 seat signal; buying more changes depth, not seat count.",
    },
    {
      label: "Depth",
      title: "Contribution is variable",
      body: "A 5 USDC entrant and a 10,000 USDC entrant both have one seat. The difference is SYN acquired, verified USDC routed, capital footprint, and contribution depth.",
    },
    {
      label: "Route",
      title: "USDC routes immediately",
      body: "The contract enforces 70% Vault, 20% Liquidity, and 10% Operations.",
    },
    {
      label: "Proof",
      title: "Receipt is verifiable",
      body: "The success state links to the transaction and summarizes what changed.",
    },
    {
      label: "Memory",
      title: "Activity enters history",
      body: "Your purchase can surface in Activity, My Syndicate, Chronicle, and Register views as indexed truth.",
    },
  ];

  return (
    <Section id="transaction-outcome" className="py-10 md:py-12">
      <div className="rounded-[6px] border border-border/70 bg-card/35 p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                What buying does
              </span>
              <StatusPill status="LIVE" />
            </div>
            <h2 className="mt-3 font-serif text-2xl md:text-3xl font-normal tracking-tight text-foreground">
              A purchase is an on-chain state change, not a checkout screen.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-right">
            Before you connect, the page shows the exact consequences to expect. No balance, receipt, or success state appears until the wallet and chain provide it.
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {outcomes.map((item) => (
            <div key={item.label} className="border-l border-border/70 pl-4">
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                {item.label}
              </div>
              <h3 className="mt-2 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
