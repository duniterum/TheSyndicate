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
          "Referral and source attribution are reserved future protocol systems. SourceRegistryV1 is deployed with zero source records; no referral commission is accruing and no claim is live.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "The Syndicate - Referral pending" },
      {
        property: "og:description",
        content:
          "Future referral infrastructure is reserved, not live. Source records are inactive: no commission, no claim, no displayed balances.",
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
      "SourceRegistryV1 exists, but no source records are active. Today, local attribution is recognition-only and creates no payout or entitlement.",
  },
  {
    title: "Source records",
    status: "REQUIRES SOURCE RECORD",
    body:
      "No source record has been created. Until source terms are approved, created, read back, and wired into the buy path, no acquisition commission accrues and no claim action can be shown.",
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
      title="Source attribution pending"
      description="Referral is reserved future growth infrastructure, not affiliate marketing. SourceRegistryV1 is deployed, but records, source links, commissions, and claims remain inactive until a separate ceremony approves them."
    >
      <Section id="referral-status">
        <SectionHeader
          eyebrow="Current status"
          title={<>No source records. No commission. <span className="text-gradient-gold">No claim.</span></>}
          description="The live product is membership: buying SYN seats the wallet. Source attribution belongs to a separate contract-gated system and remains pending until source terms are created and verifiable."
        />
        <GlassCard className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status="PENDING" />
            <Pill tone="warning">SOURCE RECORDS INACTIVE</Pill>
            <Pill tone="muted">RESERVED</Pill>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/85">
            The Syndicate can remember who introduced whom, but memory is not
            money. V3 public buys currently use the zero source ID. Until a
            SourceRegistry record is created, wired live, and publicly
            verifiable, there is no referral balance, no earned commission, no
            active source tier, no leaderboard, and no claim button.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["Truth first", "No live claim appears before source state can prove it."],
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
            Today, every public Membership Sale purchase routes on-chain to
            Vault, Liquidity, and Operations with the zero source ID. Referral
            has no public source record and no write path. If source attribution
            ships later, the site must show the source record, the claim source,
            and the exact proof path before any action becomes live.
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
