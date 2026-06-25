import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import {
  GlassCard,
  Pill,
  Section,
  SectionHeader,
} from "@/components/syndicate/Primitives";
import {
  V3_ERA_PREVIEW,
  V3_PREVIEW_STATUS,
  V3_PUBLIC_SOURCE_PROGRESSION,
  V3_SOURCE_CLASSES,
  formatBps,
  formatSyn,
  formatUsdc,
  previewV3Quote,
} from "@/lib/v3-preview";

export const Route = createFileRoute("/v3-preview")({
  head: () => ({
    meta: [
      { title: "V3 Source Preview - Candidate / Pending / Not Live | The Syndicate" },
      {
        name: "description",
        content:
          "Read-only preview for V3 source attribution, acquisition-first routing examples, receipt schema, and introduction progression. Source terms are candidate, pending, not live.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "The Syndicate - V3 Preview" },
      {
        property: "og:description",
        content:
          "Candidate V3 source/acquisition preview. No writes, no source activation, no referral activation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/v3-preview" }],
  }),
  component: V3PreviewPage,
});

const EXAMPLE_ERA = V3_ERA_PREVIEW[2];
const EXAMPLE_SOURCE = V3_PUBLIC_SOURCE_PROGRESSION[2];
const EXAMPLE_QUOTE = previewV3Quote({
  grossUsdc: 1_000,
  era: EXAMPLE_ERA,
  source: EXAMPLE_SOURCE,
});

function StatusRail() {
  return (
    <div className="flex flex-wrap gap-2">
      {V3_PREVIEW_STATUS.map((status) => (
        <Pill key={status} tone={status === "CANDIDATE" ? "gold" : "muted"}>
          {status}
        </Pill>
      ))}
    </div>
  );
}

function ValueCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[6px] border border-border/60 bg-background/45 p-5">
      <div className="mono text-xs uppercase tracking-[0.14em] text-foreground/65">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-foreground md:text-3xl">{value}</div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/72">{note}</p>
    </div>
  );
}

function V3PreviewPage() {
  return (
    <PageShell
      eyebrow="V3 Preview"
      title="Candidate source and acquisition preview"
      description="A read-only workbench for future V3 source attribution: acquisition-first routing examples, receipt reconstruction, source terms, and introduction progression. The V3 buy path is separate; source records and referral remain pending."
    >
      <Section id="status" width="editorial" className="pt-10 md:pt-12">
        <GlassCard className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mono text-xs uppercase tracking-[0.16em] text-foreground/65">
                Safety boundary
              </div>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
                No writes. No source activation. No referral activation.
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground/82">
                This page previews source attribution only. The live buy path now
                uses MembershipSaleV3 with a zero source ID. No source record is
                created here, no source account is shown, and no action can create
                a commission.
              </p>
            </div>
            <StatusRail />
          </div>
        </GlassCard>
      </Section>

      <Section id="quote">
        <SectionHeader
          eyebrow="Read-only quote"
          title="Example V3 quote"
          description="This is illustrative arithmetic from the frozen V3 constitution. It is not a wallet quote and does not call a live contract."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ValueCard
            label="Gross paid"
            value={formatUsdc(EXAMPLE_QUOTE.grossUsdc)}
            note="The full USDC amount the buyer chooses to spend."
          />
          <ValueCard
            label="Era rate"
            value={`${EXAMPLE_ERA.synPerUsdc} SYN / USDC`}
            note={`${EXAMPLE_ERA.name}, ${EXAMPLE_ERA.seatRange}. Candidate V3 era pricing.`}
          />
          <ValueCard
            label="SYN delivered"
            value={formatSyn(EXAMPLE_QUOTE.synDelivered)}
            note="Sale V3 candidate logic prices SYN from the gross purchase amount."
          />
          <ValueCard
            label="Commission rate"
            value={formatBps(EXAMPLE_QUOTE.commissionBps)}
            note={`${EXAMPLE_SOURCE.label} example. Source terms remain pending.`}
          />
        </div>
      </Section>

      <Section id="acquisition-routing">
        <SectionHeader
          eyebrow="Acquisition-first routing"
          title="Gross payment becomes a transparent receipt"
          description="If a valid source exists, acquisition commission is calculated first. Net USDC Routed then splits 70 / 20 / 10."
        />
        <div className="grid gap-4 lg:grid-cols-[1fr,1.2fr]">
          <GlassCard className="p-5">
            <StatusRail />
            <div className="mt-5 space-y-3 text-sm">
              {[
                ["Gross USDC", EXAMPLE_QUOTE.grossUsdc],
                ["Acquisition commission", EXAMPLE_QUOTE.acquisitionCost],
                ["Net USDC Routed", EXAMPLE_QUOTE.protocolContribution],
                ["Vault 70%", EXAMPLE_QUOTE.vaultAmount],
                ["Liquidity 20%", EXAMPLE_QUOTE.liquidityAmount],
                ["Operations 10%", EXAMPLE_QUOTE.operationsAmount],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between gap-4 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="mono text-sm font-semibold tabular-nums">
                    {formatUsdc(Number(value))}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Formula
            </div>
            <pre className="mt-4 overflow-x-auto rounded-[6px] border border-border/60 bg-background/60 p-4 text-sm leading-relaxed text-foreground/85">
{`USDC Paid - Acquisition Commission = Net USDC Routed
Net USDC Routed * 70% = Vault
Net USDC Routed * 20% = Liquidity
Net USDC Routed * 10% = Operations`}
            </pre>
            <p className="mt-4 text-base leading-relaxed text-foreground/75">
              In plain language: USDC Paid minus Acquisition Commission equals
              Net USDC Routed. The routed amount then splits to Vault, Liquidity,
              and Operations in a way the receipt can reconstruct.
            </p>
          </GlassCard>
        </div>
      </Section>

      <Section id="language-boundary">
        <SectionHeader
          eyebrow="Language boundary"
          title="Recognition, terms, and receipts are separate"
          description="V3 must keep human contribution, money rules, and event truth distinct so introduction does not become ownership."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[
            ["Introduction Progression", "Recognition path for verified introductions. It is not a commission promise."],
            ["Source Terms", "The future contract rules: rate, caps, window, status, and payout wallet."],
            ["Acquisition Attribution", "The receipt truth that records which source, if any, applied to a purchase."],
            ["Acquisition Commission", "USDC paid to a valid source only when source terms and contract truth allow it."],
            ["Net USDC Routed", "The amount routed after acquisition commission, split 70% Vault / 20% Liquidity / 10% Operations."],
          ].map(([title, copy]) => (
            <GlassCard key={title} className="p-4">
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75">{copy}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section id="receipt">
        <SectionHeader
          eyebrow="Receipt example"
          title="What a V3 receipt must be able to prove"
          description="The receipt object is the trust surface. It should reconstruct the purchase without asking the user to trust the interface."
        />
        <GlassCard className="p-5">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["receiptVersion", "3"],
              ["buyer", "wallet signing the purchase"],
              ["recipient", "wallet receiving SYN"],
              ["grossUsdc", formatUsdc(EXAMPLE_QUOTE.grossUsdc)],
              ["acquisitionCommission", formatUsdc(EXAMPLE_QUOTE.acquisitionCost)],
              ["netUsdcRouted", formatUsdc(EXAMPLE_QUOTE.protocolContribution)],
              ["vaultAmount", formatUsdc(EXAMPLE_QUOTE.vaultAmount)],
              ["liquidityAmount", formatUsdc(EXAMPLE_QUOTE.liquidityAmount)],
              ["operationsAmount", formatUsdc(EXAMPLE_QUOTE.operationsAmount)],
              ["synDelivered", formatSyn(EXAMPLE_QUOTE.synDelivered)],
              ["era", `${EXAMPLE_ERA.era} - ${EXAMPLE_ERA.name}`],
              ["chapter", EXAMPLE_ERA.chapter],
              ["sourceId", "candidate source hash"],
              ["sourceClass", "MEMBER_INTRODUCTION"],
              ["commissionRate", formatBps(EXAMPLE_QUOTE.commissionBps)],
              ["firstSeat", "true / false"],
              ["txProof", "future explorer transaction"],
              ["status", "CANDIDATE / PENDING / NOT LIVE"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[6px] border border-border/55 bg-background/40 p-3">
                <div className="mono text-xs uppercase tracking-[0.12em] text-foreground/62">
                  {label}
                </div>
                <div className="mt-2 text-base text-foreground/90">{value}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </Section>

      <Section id="source-attribution">
        <SectionHeader
          eyebrow="Source attribution"
          title="Introductions are terms, not ownership"
          description="V3 source attribution can explain who introduced a purchase, under what terms, and why commission applied. It must never imply a source owns a member."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {V3_SOURCE_CLASSES.map((source) => (
            <article key={source.sourceClass} className="rounded-md border border-border/60 bg-card/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {source.assignment}
                </span>
                <Pill tone="muted">PENDING</Pill>
              </div>
              <h3 className="mt-3 text-base font-semibold">{source.sourceClass}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{source.purpose}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{source.defaultPolicy}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="chapter-pricing">
        <SectionHeader
          eyebrow="Chapter pricing visualization"
          title="Chapter is history. Era is pricing."
          description="V3 keeps chapter belonging separate from deterministic era pricing. Earlier position is not a financial right or yield promise."
        />
        <div className="overflow-x-auto rounded-md border border-border/60 bg-card/60">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border/60 text-muted-foreground">
              <tr>
                {["Era", "Seat range", "SYN / USDC", "SYN price", "Minimum", "Chapter", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 mono text-[10px] uppercase tracking-[0.16em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {V3_ERA_PREVIEW.map((era) => (
                <tr key={era.era} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-semibold">Era {era.era} - {era.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{era.seatRange}</td>
                  <td className="px-4 py-3 mono">{era.synPerUsdc}</td>
                  <td className="px-4 py-3 mono">{formatUsdc(era.impliedSynPrice)}</td>
                  <td className="px-4 py-3 mono">{formatUsdc(era.minimumUsdc)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{era.chapter}</td>
                  <td className="px-4 py-3"><Pill tone="muted">NOT LIVE</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="source-progression">
        <SectionHeader
          eyebrow="Introduction progression visualization"
          title="Recognition can progress; money terms stay bounded"
          description="Public introduction progression is candidate policy. It is designed for transparent acquisition, not member ownership, official representation, or hidden balances."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {V3_PUBLIC_SOURCE_PROGRESSION.map((row) => (
            <GlassCard key={row.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mono text-xs uppercase tracking-[0.14em] text-foreground/65">
                    {row.status}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold">{row.label}</h3>
                  <p className="mt-1 text-sm text-foreground/65">{row.category}</p>
                </div>
                <Pill tone={row.reviewRequired ? "warning" : "gold"}>
                  {formatBps(row.commissionBps)}
                </Pill>
              </div>
              <p className="mt-4 text-base leading-relaxed text-foreground/82">{row.condition}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/65">
                {row.reviewRequired
                  ? "Requires founder/operator review before source terms can apply."
                  : "Automatic only if the future contract, source health, caps, and attribution window allow it."}
              </p>
            </GlassCard>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
