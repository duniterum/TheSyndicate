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
import {
  CURRENT_SOURCE_POLICY_SNAPSHOT,
  SOURCE_POLICY_LIFECYCLE_MODEL,
} from "@/lib/source-policy-observability";

export const Route = createFileRoute("/referral")({
  head: () => ({
    meta: [
      { title: "Source Attribution - Pending Protocol Infrastructure | The Syndicate" },
      {
        name: "description",
        content:
          "Referral and source attribution are reserved future protocol systems. SourceRegistryV1 is deployed with zero source records; no referral commission is accruing and no claim is live.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "The Syndicate - Source attribution pending" },
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
  const sourcePolicy = CURRENT_SOURCE_POLICY_SNAPSHOT;

  return (
    <PageShell
      eyebrow="Source attribution"
      title="Source attribution pending"
      description={sourcePolicy.currentSummary}
    >
      <Section id="referral-status">
        <SectionHeader
          eyebrow="Current status"
          title={<>No source records. No commission. <span className="text-gradient-gold">No claim.</span></>}
          description="The live product is membership: buying SYN seats the wallet. MembershipSaleV3 can support source-attributed membership receipts later, but only after source terms are approved, created, read back, and activated."
        />
        <GlassCard className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status="PENDING" />
            <Pill tone="warning">SOURCE RECORDS INACTIVE</Pill>
            <Pill tone="muted">RESERVED</Pill>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/85">
            The Syndicate can remember who introduced whom, but memory is not
            money. V3 public buys currently use ZERO_SOURCE_ID. Until a
            SourceRegistry record is created, activated, wired live, and
            publicly verifiable, no commission is accruing, no active source
            tier is live, no source balance is displayed, and no claim button
            appears.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["Truth first", "No live claim appears before source state can prove it."],
              ["No hidden balances", "The interface will not imply money owed from browser state or off-chain memory."],
              ["Source without hype", "Attribution may matter later, but membership remains the live product today."],
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

      <Section id="source-policy-observability">
        <SectionHeader
          eyebrow="Source policy observability"
          title="The source registry is visible before any source is usable"
          description="This read-only snapshot separates deployed infrastructure from active source policy. It is the truth layer future source records must pass through."
        />
        <GlassCard className="p-5">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["Registry", sourcePolicy.registryExists ? "DEPLOYED" : "PENDING"],
              ["Records", sourcePolicy.recordCount.toString()],
              ["Active", sourcePolicy.activeCount.toString()],
              ["Paused / revoked", `${sourcePolicy.pausedCount} / ${sourcePolicy.revokedCount}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[6px] border border-border/55 bg-background/45 p-3">
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
                <div className="mt-2 text-lg font-semibold">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {sourcePolicy.currentLimits.map((limit) => (
              <div key={limit} className="rounded-[6px] border border-border/50 bg-card/50 px-3 py-2 text-sm text-muted-foreground">
                {limit}
              </div>
            ))}
          </div>
        </GlassCard>
      </Section>

      <Section id="reserved-systems">
        <SectionHeader
          eyebrow="Reserved systems"
          title="What can exist later"
          description="Future systems stay visible only as PENDING / RESERVED / REQUIRES SOURCE RECORD / PENDING DESIGN."
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

      <Section id="membership-source-boundary">
        <SectionHeader
          eyebrow="Membership source boundary"
          title="Source attribution changes the receipt, not the seat"
          description="MembershipSaleV3 can calculate acquisition cost first, then split Net USDC Routed 70 / 20 / 10. Public/default buys still use ZERO_SOURCE_ID."
        />
        <div className="surface elevated p-5 text-sm text-muted-foreground leading-relaxed">
          <p>
            Today, every public MembershipSaleV3 purchase uses ZERO_SOURCE_ID:
            gross USDC becomes Net USDC Routed, then the receipt splits that
            amount to Vault, Liquidity, and Operations. If a future source record
            is approved and activated, a non-zero sourceId may attribute a
            MembershipSaleV3 purchase: gross USDC minus acquisition commission
            equals Net USDC Routed, then Net USDC Routed splits 70 / 20 / 10.
            CommissionRouterV1 is not the active V3 source engine.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <CTAButton variant="gold" href="/transparency">Verify routing</CTAButton>
            <CTAButton variant="ghost" href="/my-syndicate">Open My Syndicate</CTAButton>
          </div>
        </div>
      </Section>

      <Section id="source-lifecycle">
        <SectionHeader
          eyebrow="Lifecycle"
          title="A source record must move through visible states"
          description="Creating a source record is not the same as activating it. Status changes must remain observable before they can affect a purchase."
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {SOURCE_POLICY_LIFECYCLE_MODEL.map((state) => (
            <article key={state.status} className="rounded-md border border-border/60 bg-card/70 p-4">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
                {state.status}
              </div>
              <h3 className="mt-2 text-base font-semibold">{state.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{state.meaning}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="future-module-boundary">
        <SectionHeader
          eyebrow="Module boundary"
          title="Future products need their own source-aware design"
          description="Archive1155, future ERC-721 identity/artifact systems, SwapRail, and premium products are not source-attributed today."
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            [
              "Archive and NFT mints",
              "Archive1155 is not source-aware. A future NFT source path would need a source-aware Archive wrapper/router, Archive1155 V2, ProductSaleRouter, or separate approved NFT sale design.",
            ],
            [
              "SeatRecord / ERC-721",
              "SeatRecord721 is not live and does not replace SYN as the seat. Future ERC-721 work must separate identity, memory, and recognition from financial rights.",
            ],
            [
              "Other products",
              "SwapRail and future product commerce do not inherit source attribution automatically. Every new module must pass the Module Integration Standard before it can use source terms.",
            ],
          ].map(([label, body]) => (
            <article key={label} className="rounded-md border border-border/60 bg-card/70 p-4">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
                PENDING DESIGN
              </div>
              <h3 className="mt-2 text-base font-semibold">{label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <RouteFinalCTA preset="verify" />
    </PageShell>
  );
}
