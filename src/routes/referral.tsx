import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import {
  CTAButton,
  GlassCard,
  Pill,
  Section,
  SectionHeader,
  StatusPill,
} from "@/components/syndicate/Primitives";

export const Route = createFileRoute("/referral")({
  head: () => ({
    meta: [
      { title: "Referral - Pending Protocol Infrastructure | The Syndicate" },
      {
        name: "description",
        content:
          "Referral and reputation are reserved future protocol systems. No CommissionRouter is deployed, no referral commission is accruing, and no rewards are claimable.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "The Syndicate - Referral pending" },
      {
        property: "og:description",
        content:
          "Future referral infrastructure is reserved, not live. No router, no commission, no claim, no displayed balances.",
      },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/referral" }],
  }),
  component: ReferralPage,
});

const RESERVED_SYSTEMS = [
  {
    title: "Referral attribution",
    status: "PENDING",
    body:
      "A future system may associate an introducing member with a new participant. Today, local attribution is recognition-only and creates no payout or entitlement.",
  },
  {
    title: "CommissionRouter",
    status: "REQUIRES CONTRACT",
    body:
      "No router contract is deployed. Until a contract exists, no referral commission accrues, no balances exist, and no claim action can be shown.",
  },
  {
    title: "Reputation records",
    status: "RESERVED",
    body:
      "Durable participation may become an institutional memory layer later. It is not a top-earners board and no scoring formula is live today.",
  },
] as const;

function ReferralPage() {
  return (
    <PageShell
      eyebrow="Referral"
      title="Pending protocol infrastructure"
      description="Referral is reserved future growth infrastructure, not affiliate marketing. Nothing is live until a contract, rules, and verification path exist."
    >
      <Section id="referral-status">
        <SectionHeader
          eyebrow="Current status"
          title={<>No router. No commission. <span className="text-gradient-gold">No claim.</span></>}
          description="The live product is membership: buying SYN seats the wallet. Referral belongs to a future contract-gated system and must remain pending until it is verifiable."
        />
        <GlassCard className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status="PENDING" />
            <Pill tone="warning">REQUIRES CONTRACT</Pill>
            <Pill tone="muted">RESERVED</Pill>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/85">
            The Syndicate can remember who introduced whom, but memory is not
            money. Until CommissionRouter exists and is publicly verifiable,
            there is no referral balance, no earned commission, no tier, no
            leaderboard, and no claim button.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["Truth first", "No live claim appears before a deployed contract can prove it."],
              ["No hidden balances", "The interface will not imply money owed from browser state or off-chain memory."],
              ["Growth without hype", "Attribution may matter later, but membership remains the live product today."],
            ].map(([label, body]) => (
              <div key={label} className="rounded-[6px] border border-border/55 bg-background/45 p-3">
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                  {label}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </Section>

      <Section id="reserved-systems">
        <SectionHeader
          eyebrow="Reserved systems"
          title="What can exist later"
          description="Future systems stay visible only as PENDING / RESERVED / REQUIRES CONTRACT."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {RESERVED_SYSTEMS.map((system) => (
            <article key={system.title} className="rounded-md border border-border/60 bg-card/70 p-4">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {system.status}
              </div>
              <h3 className="mt-2 text-base font-semibold">{system.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{system.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="routing-boundary">
        <SectionHeader
          eyebrow="Routing boundary"
          title="Vault and Liquidity are never referral funding"
          description="The deployed Membership Sale routes USDC 70 / 20 / 10. Any future referral design may only come from the Operations slice and must not alter Vault or Liquidity routing."
        />
        <div className="surface elevated p-5 text-sm text-muted-foreground leading-relaxed">
          <p>
            Today, every Membership Sale purchase routes on-chain to Vault,
            Liquidity, and Operations. Referral has no contract and no write path.
            If it ships later, the site must show the deployed contract, the claim
            source, and the exact proof path before any action becomes live.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <CTAButton variant="gold" href="/transparency">Verify routing</CTAButton>
            <CTAButton variant="ghost" href="/my-syndicate">Open My Syndicate</CTAButton>
          </div>
        </div>
      </Section>

      <RouteFinalCTA preset="verify" />
    </PageShell>
  );
}
