// /archive — internal/protocol route for the Archive memory experience.
//
// Public-facing visitors land on /nft (preferred SEO route), which renders its
// own NftPage. /archive remains a valid route so existing links, docs, and
// internal references continue to work; it renders ArchivePage, defined locally
// below and NOT exported, so this route file stays code-split (P5).
//
// Doctrine:
//   SYN is the seat. Artifacts are the memory.
//
// Current truth:
//   - SyndicateArchive1155 is DEPLOYED on Avalanche mainnet.
//   - ID 1 "The First Signal" is LIVE — public mint OPEN at 0.50 USDC.
//   - ID 2 is RESERVED · future ERC-721 SeatRecord721 identity layer.
//   - ID 3 "Patron Seal" is CONTRACT_GATED / PUBLIC_MINT_READ_GATED.
//   - IDs 4–8 are sealed / armed — protocol-memory artifacts (no public mint).
//   - ID 9 "Protocol Chronicle" is FAR HORIZON — sealed until Chapter I closes.
import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { PagePurpose } from "@/components/syndicate/PagePurpose";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import {
  GlassCard,
  Pill,
  Section,
  SectionHeader,
} from "@/components/syndicate/Primitives";
import { useProtocolTruth, fmtCount } from "@/lib/protocol-truth";
import {
  ARCHIVE_NFT_EXPLORERS,
  ARCHIVE_NFT_CONTRACT_ADDRESS,
} from "@/lib/syndicate-config";
import { archiveVerifyUrl, isValidExplorerUrl } from "@/lib/explorer-guard";
import {
  ARCHIVE_DISCLAIMER,
  ARTIFACT_STATUS_LABEL,
  ARTIFACT_STATUS_HINT,
  type ArtifactStatus,
} from "@/lib/archive-config";
import { ArchiveStatusLegend } from "@/components/syndicate/ArchiveStatusLegend";
import { ArchiveContractStatus } from "@/components/syndicate/ArchiveContractStatus";
import { MythologyWall } from "@/components/syndicate/MythologyWall";
import { ArchiveFaq } from "@/components/syndicate/ArchiveFaq";
import { ArchiveOnboardingPanel } from "@/components/syndicate/ArchiveOnboardingPanel";
import { ArchiveGlossary } from "@/components/syndicate/ArchiveGlossary";
import { ChapterOneHero } from "@/components/syndicate/ChapterOneHero";
import { ArchiveMuseumHero } from "@/components/syndicate/ArchiveMuseumHero";
import { ArchiveCeremony } from "@/components/syndicate/ArchiveCeremony";
import { LiveProofStrip } from "@/components/syndicate/LiveProofStrip";
import { track } from "@/lib/analytics";
import { ProtocolMemoryPipeline } from "@/components/syndicate/ProtocolJourneySpine";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "Archive Memory - The First Signal open | The Syndicate" },
      {
        name: "description",
        content:
          "The Syndicate Archive preserves protocol memory. The First Signal (ID 1) is open on Avalanche at 0.50 USDC; Patron Seal is read-gated; other Artifacts stay sealed until contract and event truth support them.",
      },
      {
        property: "og:title",
        content: "Archive Memory - The First Signal open | The Syndicate",
      },
      {
        property: "og:description",
        content:
          "Carry protocol memory. The First Signal (ID 1) is open on Avalanche at 0.50 USDC. Patron Seal is read-gated; other Artifacts remain sealed until on-chain truth supports them.",
      },
      { property: "og:url", content: "https://thesyndicate.money/archive" },
      { property: "twitter:card", content: "summary_large_image" },
      {
        property: "twitter:title",
        content: "Archive - The Syndicate | First Signal mint open",
      },
      {
        property: "twitter:description",
        content:
          "Carry protocol memory. The First Signal (ID 1) is open on Avalanche at 0.50 USDC.",
      },
    ],
    links: [
      // Canonical points to the public-facing /nft route per SEO decision.
      { rel: "canonical", href: "https://thesyndicate.money/nft" },
    ],
  }),
  component: ArchivePage,
});

function statusTone(s: ArtifactStatus): "muted" | "warning" | "navy" | "success" {
  switch (s) {
    case "ACTIVE_MINT_OPEN":
      return "success";
    case "CONFIGURED_NOT_ACTIVE":
    case "PENDING_CONTRACT":
    case "PENDING_ELIGIBILITY":
      return "warning";
    case "SECRET":
      return "navy";
    case "LOCKED":
    default:
      return "muted";
  }
}

function ArtifactStatusPill({ status }: { status: ArtifactStatus }) {
  return (
    <span title={ARTIFACT_STATUS_HINT[status]}>
      <Pill tone={statusTone(status)}>{ARTIFACT_STATUS_LABEL[status]}</Pill>
    </span>
  );
}

// Verifiable-today buckets (live on-chain reads / derived facts).
const VERIFIABLE_TODAY: Array<{ title: string; body: string }> = [
  {
    title: "Seat purchase",
    body: "Every Membership purchase happens on Avalanche through the Membership Sale contract.",
  },
  {
    title: "SYN balance",
    body: "Your wallet's SYN balance is a live on-chain read.",
  },
  {
    title: "Chapter / member state",
    body: "Chapter status is derived from member progression and protocol data.",
  },
  {
    title: "Routing / wallets",
    body: "USDC routing and protocol wallets are shown through public on-chain addresses.",
  },
  {
    title: "Liquidity",
    body: "The Trader Joe SYN/USDC pool and its creation tx are linked to live on-chain sources.",
  },
  {
    title: "Archive contract",
    body: "SyndicateArchive1155 is deployed on Avalanche and read-only on-chain reads (supply, mint-state, balance) are live.",
  },
];

const PENDING_ITEMS: Array<{ title: string; status: ArtifactStatus }> = [
  { title: "SeatRecord721 (future ERC-721 identity · separate contract)", status: "PENDING_CONTRACT" },
  { title: "Heart Signal", status: "SECRET" },
  { title: "Protocol Milestone Artifacts", status: "LOCKED" },
];

// Mythology vocabulary cards for §11 — replaces legacy ARCHIVE_CATEGORIES /
// CATEGORY_GROUPS grid which carried operator status pills (CONFIGURED_NOT_ACTIVE,
// PENDING_*) onto a visitor surface. Per docs/NFT_DESIRE_ARCHITECTURE_PASS.md
// every public slot is one of: OPEN · IDENTITY · HIDDEN · ARMED · FAR HORIZON.
type MythologyState = "OPEN" | "READ GATED" | "IDENTITY" | "HIDDEN" | "ARMED" | "FAR HORIZON";

const MYTHOLOGY_FUTURE_GROUPS: Array<{
  key: string;
  title: string;
  items: Array<{ name: string; state: MythologyState; blurb: string }>;
}> = [
  {
    key: "identity",
    title: "Your identity",
    items: [
      { name: "SeatRecord721 (ID 2 reserved)", state: "IDENTITY", blurb: "Future identity record for a verified seat. SYN is the seat; this contract is not deployed and is not part of Archive1155." },
      { name: "Chapter mark",           state: "ARMED",       blurb: "A sealed record of the chapter you joined in. Written when chapters close." },
      { name: "Founders mark",          state: "ARMED",       blurb: "A sealed record carried only by the first members of Chapter I." },
    ],
  },
  {
    key: "witnessed",
    title: "What you witnessed",
    items: [
      { name: "Protocol milestones",    state: "ARMED",       blurb: "Sealed when a named on-chain milestone fires. Witnessed by members present at the moment." },
      { name: "Liquidity moments",      state: "ARMED",       blurb: "Sealed when a tracked liquidity event lands on Avalanche." },
      { name: "Chapter milestones",     state: "ARMED",       blurb: "Sealed when a chapter closes. Carried by members who were in that chapter." },
    ],
  },
  {
    key: "support",
    title: "What you support or discover",
    items: [
      { name: "Patron Seal (ID 3)",     state: "READ GATED",  blurb: "A flat support artifact. Mintability is contract/read gated and shown only when live Archive1155 reads confirm it." },
      { name: "Heart Signal (ID 4)",    state: "HIDDEN",      blurb: "A hidden discovery artifact. Conditions are not public; it opens only when discovered." },
      { name: "Protocol Chronicle (ID 9)", state: "FAR HORIZON", blurb: "The closing record of Chapter I. Written only when the chapter ends — sealed until then." },
    ],
  },
];

function mythToneClass(s: MythologyState): { tone: "success" | "navy" | "muted" | "warning"; label: string } {
  switch (s) {
    case "OPEN":        return { tone: "success", label: "OPEN" };
    case "READ GATED":  return { tone: "warning", label: "READ GATED" };
    case "IDENTITY":    return { tone: "navy",    label: "IDENTITY" };
    case "HIDDEN":      return { tone: "muted",   label: "HIDDEN" };
    case "ARMED":       return { tone: "warning", label: "ARMED" };
    case "FAR HORIZON": return { tone: "muted",   label: "FAR HORIZON" };
  }
}

// ───────────────────────────────────────────────────────────────────────
// Page component — local to this route (not exported) so this route file
// stays code-split. /nft and /nfts render their own NftPage, not ArchivePage.
// ───────────────────────────────────────────────────────────────────────
function ArchivePage({ heroOverride }: { heroOverride?: ReactNode } = {}) {
  const truth = useProtocolTruth();
  const chapter = truth.chapterProgress.value;
  const memberCount = truth.members.value;

  return (
    <PageShell
      eyebrow="Archive / Avalanche / First public mint OPEN"
      title="Carry the protocol's memory."
      description="The First Signal (ID 1) is open at 0.50 USDC. Patron Seal (ID 3) is contract/read gated and only appears mintable from live Archive1155 reads. Other Artifacts are protocol-memory surfaces sealed by event - they record chapters, milestones, and support moments only when the protocol creates the required proof."
      hideHeader
    >
      {heroOverride ? (
        heroOverride
      ) : (
        <>
          {/* ─── 0. Editorial museum hero (Wave 3 recalibration) ──────── */}
          <ArchiveMuseumHero />

          {/* ─── 0.5 Live proof strip ─────────────────────────────────── */}
          <LiveProofStrip />

          {/* ─── 1. Chapter I hero — collector-experience direction ───── */}
          <ChapterOneHero />
        </>
      )}

      <PagePurpose
        statement="The Archive receives verified memory from Activity, Chronicle, and Register, then lets artifacts carry that memory. SYN remains the seat; artifacts are records of what the protocol lived through."
        distinctions={[
          { label: "Activity", to: "/activity" },
          { label: "Institutional Register", to: "/institutional-register" },
        ]}
      />

      <ArchiveCeremony />

      {/* ─── 2. How it works (3 steps) ──────────────────────────────── */}
      <Section id="how-it-works">
        <SectionHeader
          eyebrow="How it works"
          title={<>From seat to <span className="text-gradient-gold">memory</span></>}
          description="A simple three-step arc. Step 1 is live today. Steps 2 and 3 unfold as the protocol writes its own story."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              n: "01",
              title: "Join",
              body:
                "Buy SYN with USDC and take your seat in The Syndicate. Your seat is verifiable on Avalanche today.",
              cta: { to: "/join", label: "Join The Syndicate →" } as const,
              tone: "LIVE" as const,
            },
            {
              n: "02",
              title: "Watch the story unfold",
              body:
                "Chapters seal, milestones land, liquidity grows, support moments happen, and reserved Artifacts remain read-gated until their event truth exists.",
              tone: "UNFOLDING" as const,
            },
            {
              n: "03",
              title: "Carry the memory",
              body:
                "The First Signal is an open public Artifact mint on Avalanche at 0.50 USDC. Other Artifacts are protocol-memory surfaces sealed by event and activate only when the protocol creates the required proof.",
              tone: "LIVE" as const,
            },
          ].map((s) => (
            <article key={s.n} className="surface elevated p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                  Step {s.n}
                </span>
                <Pill
                  tone={
                    s.tone === "LIVE"
                      ? "success"
                      : s.tone === "UNFOLDING"
                      ? "navy"
                      : "warning"
                  }
                >
                  {s.tone}
                </Pill>
              </div>
              <h3 className="text-base font-semibold leading-tight">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {s.body}
              </p>
              {"cta" in s && s.cta && (
                <Link
                  to={s.cta.to}
                  className="mono text-[11px] uppercase tracking-[0.18em] text-[color:oklch(0.5_0.13_75)] hover:text-[var(--gold)] mt-auto"
                >
                  {s.cta.label}
                </Link>
              )}
            </article>
          ))}
        </div>
      </Section>

      {/* ─── 2.5 What you can do today (onboarding) ────────────────── */}
      <ProtocolMemoryPipeline compact />
      <ArchiveOnboardingPanel />

      {/* ─── 3. Mythology Wall (9 slots · public surface) ───────────── */}
      <MythologyWall />

      {/* ─── 4. My Archive teaser link ──────────────────────────────── */}
      <Section id="my-archive-teaser">
        <GlassCard className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
                My Archive
              </div>
              <h3 className="mt-1 text-base font-semibold text-foreground">
                Preview your future Archive identity
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-2xl">
                Connect your wallet on the My Syndicate page to see a
                per-wallet preview of your Archive. Balances are real
                on-chain reads from the deployed contract. Owned Artifacts
                appear after minting The First Signal (ID 1).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/my-syndicate"
                className="inline-flex items-center justify-center rounded-md border border-border/60 px-4 py-2 text-xs font-medium text-foreground hover:border-[var(--gold)]/60"
              >
                Open My Syndicate
              </Link>
              <Link
                to="/join"
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-xs font-medium text-[oklch(0.22_0.025_260)]"
                style={{
                  background: "var(--gradient-gold)",
                  boxShadow: "var(--shadow-glow-gold)",
                }}
              >
                Join to begin your record
              </Link>
            </div>
          </div>
        </GlassCard>
      </Section>

      {/* ─── 4.5 Current Chapter Panel — lifted: ownership/momentum sits right
           after the My-Archive preview, before the deeper proof surfaces */}
      <Section id="current-chapter">
        <SectionHeader
          eyebrow="Current Chapter · DERIVED FROM ON-CHAIN DATA"
          title={<>The <span className="text-gradient-gold">active</span> chapter</>}
          description="Chapter state is derived from indexed Membership Sale purchases. The Chapter Artifact for Genesis — The First Signal — is configured in the Archive contract and its public mint is OPEN at 0.50 USDC on Avalanche."
        />
        <GlassCard className="p-5 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Stat label="Chapter" value={chapter?.label ?? "—"} />
            <Stat
              label="Member range"
              value={chapter ? rangeLabel(chapter.id, chapter.capacity) : "—"}
            />
            <Stat label="Members so far" value={fmtCount(memberCount)} />
            <Stat
              label="Remaining seats"
              value={chapter ? fmtCount(chapter.remaining) : "—"}
            />
            <Stat
              label="Status"
              value={chapter && chapter.remaining > 0 ? "OPEN" : chapter ? "SEALED" : "—"}
            />
          </div>

          <div className="mt-6 border-t border-border/40 pt-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Pill tone="success">ACTIVE · MINT OPEN</Pill>
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Active Chapter Artifact
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground">The First Signal</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              The Genesis Chapter Artifact — configured in the deployed
              Archive contract.{" "}
              <span className="text-foreground">Price: 0.50 USDC (+ Avalanche gas) · wallet limit 5.</span>{" "}
              Open during Chapter I (Genesis Signal · Members #1 – #333).
            </p>
          </div>
        </GlassCard>
      </Section>

      {/* ─── 5. (Future Collector View removed — replaced by Mythology Wall above.) */}

      {/* ─── 6.5 Plain-language FAQ ──────────────────────────────────── */}
      <ArchiveFaq />

      {/* ─── 7. Compact explorer cards (guarded) ────────────────────── */}
      <Section id="explorers">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Verify on block explorers · read-only
        </div>
        {(() => {
          const entries = [
            { name: "Avascan",   href: ARCHIVE_NFT_EXPLORERS.avascan,   hint: "Avalanche-native explorer" },
            { name: "SnowTrace", href: ARCHIVE_NFT_EXPLORERS.snowtrace, hint: "Etherscan-style explorer" },
            { name: "Routescan", href: ARCHIVE_NFT_EXPLORERS.routescan, hint: "Multi-chain explorer" },
            { name: "Sourcify",  href: ARCHIVE_NFT_EXPLORERS.sourcify,  hint: "Source-verification registry" },
          ].filter((e) => isValidExplorerUrl(e.href));
          if (entries.length === 0) {
            return (
              <div className="surface elevated p-3 flex flex-col gap-1">
                <span className="mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                  Per-mint explorer link appears after your transaction confirms
                </span>
                <code className="mono text-[10px] text-muted-foreground break-all">
                  {ARCHIVE_NFT_CONTRACT_ADDRESS}
                </code>
              </div>
            );
          }
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {entries.map((e) => (
                <a
                  key={e.name}
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="surface elevated p-3 flex flex-col gap-1 hover:border-[var(--gold)]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{e.name}</span>
                    <span className="mono text-[10px] text-muted-foreground">↗</span>
                  </div>
                  <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {e.hint}
                  </span>
                  <code className="mono text-[10px] text-muted-foreground truncate">
                    {ARCHIVE_NFT_CONTRACT_ADDRESS}
                  </code>
                </a>
              ))}
            </div>
          );
        })()}
      </Section>


      {/* ─── 8. What is verifiable today? ───────────────────────────── */}
      <Section id="verifiable">
        <SectionHeader
          eyebrow="LIVE ON AVALANCHE"
          title={<>What is <span className="text-gradient-gold">verifiable today?</span></>}
          description="These facts are read or derived directly from Avalanche today — independent of any artifact drop activation."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {VERIFIABLE_TODAY.map((v) => (
            <article key={v.title} className="surface elevated p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-tight">{v.title}</h3>
                <Pill tone="success">LIVE</Pill>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{v.body}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* ─── 9. What is sealed beyond the two open mints? ───────────── */}
      <Section id="pending">
        <SectionHeader
          eyebrow="SEALED · AWAITING EVENT"
          title={<>What is <span className="text-gradient-gold">sealed beyond the two open mints?</span></>}
          description="The First Signal (ID 1) is an open public mint on the deployed Archive1155 contract. Patron Seal (ID 3) is contract/read gated and only appears mintable from live Archive1155 reads. The items below are sealed protocol-memory surfaces — they unseal when their on-chain event fires or live in a separate future contract (e.g. SyndicateSeatRecord721)."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PENDING_ITEMS.map((p) => (
            <article key={p.title} className="surface elevated p-4 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold leading-tight">{p.title}</h3>
              <ArtifactStatusPill status={p.status} />
            </article>
          ))}
        </div>
        <div className="mt-5">
          <ArchiveStatusLegend variant="inline" />
        </div>
      </Section>

      {/* ─── 11. Future Artifact Types — mythology vocabulary only ──── */}
      <Section id="future-types">
        <SectionHeader
          eyebrow="Future Artifact Types"
          title={<>How the Archive will <span className="text-gradient-gold">remember</span></>}
          description="The categories of moments the Archive is designed to record. The First Signal is OPEN today; Patron Seal is READ GATED; the rest are IDENTITY, HIDDEN, ARMED or FAR HORIZON — they unseal only when their on-chain event arrives."
        />
        <div className="flex flex-col gap-6">
          {MYTHOLOGY_FUTURE_GROUPS.map((g) => (
            <div key={g.key}>
              <h3 className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)] mb-2">
                {g.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {g.items.map((c) => {
                  const t = mythToneClass(c.state);
                  return (
                    <article
                      key={c.name}
                      className="surface elevated p-4 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold leading-tight">{c.name}</h4>
                        <Pill tone={t.tone}>{t.label}</Pill>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {c.blurb}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground text-center">
          OPEN = public mint open today · IDENTITY / HIDDEN / ARMED / FAR HORIZON = sealed by protocol event
        </p>
      </Section>


      {/* ─── 11.5 Contract status — moved DOWN: read-only verification sits low,
           near the legal/registry detail (technical detail lower) */}
      <Section id="contract-status">
        <ArchiveContractStatus />
        <ArchiveGlossary />
      </Section>

      {/* ─── 12. Legal / disclaimer footer ──────────────────────────── */}
      <Section id="legal">
        <GlassCard className="p-6 text-xs text-muted-foreground leading-relaxed">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-foreground mb-2">
            Disclaimer
          </div>
          <p>{ARCHIVE_DISCLAIMER}</p>
          <p className="mt-3">
            Artifacts confer no financial rights, no revenue share, no Vault
            ownership, no LP ownership, no governance rights and no profit
            promise. Participation may result in loss. The First Signal
            (ID 1) is open; Patron Seal (ID 3) is contract/read gated; other Artifacts are protocol-memory surfaces sealed by event. See the{" "}
            <Link to="/registry" className="underline-offset-4 hover:underline text-foreground">
              Protocol Registry
            </Link>{" "}
            for current contract status, the{" "}
            <Link to="/roadmap" className="underline-offset-4 hover:underline text-foreground">
              Roadmap
            </Link>{" "}
            for ordering, and the{" "}
            <Link to="/faq" className="underline-offset-4 hover:underline text-foreground">
              FAQ
            </Link>{" "}
            for honest answers.
          </p>
        </GlassCard>
      </Section>
    <RouteFinalCTA preset="editorial" />
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}

function rangeLabel(chapterId: string, capacity: number): string {
  switch (chapterId) {
    case "genesis-signal":     return "#1 – #333";
    case "first-thousand":     return "#334 – #1,000";
    case "the-expansion":      return "#1,001 – #3,333";
    case "first-ten-thousand": return "#3,334 – #10,000";
    case "open-era":           return "#10,001 +";
    default:                   return `≤ #${capacity.toLocaleString("en-US")}`;
  }
}
