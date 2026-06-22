import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { GlassCard, Pill, Section, SectionHeader } from "@/components/syndicate/Primitives";
import { CONTRACTS, explorerUrlFor, explorerUrlForAddress, SYN_EXPLORERS, LP_POOL } from "@/lib/syndicate-config";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — Live · Next · Pending · Future | The Syndicate" },
      { name: "description", content: "What is live now, what is next, what is pending, what is future, and what is never planned. No fake dates. Every live item links to a verifiable on-chain source." },
      { property: "og:title", content: "The Syndicate — Roadmap" },
      { property: "og:description", content: "Five honest buckets: Live · Next · Pending · Future · Never. Every item ships with status, dependency, and a verify link when live." },
      { property: "og:url", content: "https://thesyndicate.money/roadmap" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/roadmap" }],
  }),
  component: RoadmapPage,
});

type Status = "LIVE" | "NEXT" | "PENDING" | "FUTURE" | "NEVER";

type Item = {
  title: string;
  what: string;
  why: string;
  dep?: string;
  verifyLabel?: string;
  verifyHref?: string | null;
};

type Tone = "success" | "gold" | "muted" | "navy";

type Bucket = {
  key: Status;
  title: string;
  blurb: string;
  tone: Tone;
  items: Item[];
};

const lpHref = explorerUrlForAddress(LP_POOL.pairAddress);
const saleHref = explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS");
const vaultHref = explorerUrlForAddress(CONTRACTS.VAULT_WALLET);
const lpWalletHref = explorerUrlForAddress(CONTRACTS.LIQUIDITY_WALLET);
const opsHref = explorerUrlForAddress(CONTRACTS.OPERATIONS_WALLET);

const BUCKETS: Bucket[] = [
  {
    key: "LIVE",
    title: "Live now",
    blurb: "Deployed, verifiable on-chain today.",
    tone: "success",
    items: [
      { title: "SYN ERC20 token", what: "Fixed 1,000,000,000 supply. No admin, no mint, no pause, no tax.", why: "Foundation of every other primitive.", verifyLabel: "Avascan", verifyHref: SYN_EXPLORERS.avascan },
      { title: "Source verification", what: "Source code matches deployed bytecode.", why: "Anyone can audit what is running.", verifyLabel: "Sourcify", verifyHref: SYN_EXPLORERS.sourcify },
      { title: "MembershipSaleV3", what: "Accepts USDC, delivers SYN using deterministic era pricing, and splits 70/20/10 in the same transaction.", why: "Single on-chain entry point for membership; Era I currently returns 100 SYN per 1 USDC.", verifyLabel: "Sale contract", verifyHref: saleHref },
      { title: "USDC routing 70 / 20 / 10", what: "70% Vault Wallet · 20% Liquidity Wallet · 10% Operations Wallet, atomic.", why: "Removes discretion; the split is enforced by code.", verifyLabel: "Vault wallet", verifyHref: vaultHref },
      { title: "Liquidity wallet", what: "Receives 20% of every USDC purchase for protocol-owned liquidity reinforcement.", why: "Liquidity grows with participation, not promises.", verifyLabel: "Liquidity wallet", verifyHref: lpWalletHref },
      { title: "Operations wallet", what: "Receives 10% for build, ops, and community.", why: "Funds the work, publicly.", verifyLabel: "Operations wallet", verifyHref: opsHref },
      { title: "Trader Joe SYN/USDC LP", what: "Classic AMM pair on Avalanche C-Chain. Reserves and implied price readable onchain.", why: "Public exit and price discovery from day one.", verifyLabel: "LP pair", verifyHref: lpHref },
      { title: "Public allocation registry", what: "Seven labeled allocation wallets with live balance reads.", why: "Every SYN can be traced to a known address.", verifyLabel: "Registry", verifyHref: "/registry" },
      { title: "Transparency Center", what: "Claim → Source → Explorer → Status for every metric.", why: "Anyone can audit any claim end-to-end.", verifyLabel: "Transparency", verifyHref: "/transparency" },
    ],
  },
  {
    key: "NEXT",
    title: "Next — what members will feel soon",
    blurb: "Already in motion. Each item changes what a member can see, verify, or share.",
    tone: "gold",
    items: [
      { title: "Every join becomes a visible event", what: "A live feed where each new member appears with seat number, chapter, and on-chain proof.", why: "The protocol stops feeling like a dashboard and starts reading like a story you can witness in real time.", dep: "Sale contract (LIVE)" },
      { title: "Your seat becomes shareable", what: "PNG share cards for member identity, milestones, treasury and liquidity snapshots.", why: "A member can post a single image that proves their position, chapter, and witnessed events — without the site needing to back it up.", dep: "html-to-image (installed)" },
      { title: "Allocation becomes visually obvious", what: "Allocation and USDC routing visuals with live balances next to each wallet.", why: "A non-technical visitor understands where every dollar goes within seconds.", dep: "Live allocation reads (LIVE)" },
      { title: "A clear path through the protocol", what: "Structured knowledge hub — Start Here, Protocol, Token, Vault, Verification, Risk.", why: "Newcomers, members, and researchers all find what they came for without dead ends.", dep: "VISION + Protocol Model docs" },
    ],
  },
  {
    key: "PENDING",
    title: "Pending — what becomes verifiable next",
    blurb: "Designed, not yet deployed. Every UI surface shows PENDING until the contract is live and verifiable on-chain.",
    tone: "muted",
    items: [
      { title: "A programmable, audited Vault", what: "On-chain accounting, deposit/withdrawal logic, policy enforcement.", why: "Today the Vault is a public wallet — verifiable but not yet programmable. Members will be able to audit Vault behavior at the contract level, not just the balance.", dep: "Audit + deployment" },
      { title: "Identity that travels with your wallet", what: "On-chain identity records for early members, witnessed events, and chapter membership.", why: "Your seat becomes a permanent, portable proof of being early — recognized anywhere your wallet appears.", dep: "Identity contract" },
      { title: "A real voice over protocol policy", what: "On-chain voting on protocol parameters — never over member assets.", why: "Members shape how the protocol evolves without ever giving up custody.", dep: "Governance contract" },
      { title: "Faster, searchable history", what: "Indexed event history with search and analytics.", why: "Every past join, route, and sealing event is queryable in seconds — the archive becomes navigable, not just verifiable.", dep: "Subgraph or custom indexer" },
    ],
  },
  {
    key: "FUTURE",
    title: "Far horizon — what the protocol becomes",
    blurb: "On the long-term map. No fake dates. Visible-as-sealed so the story stays infinite.",
    tone: "gold",
    items: [
      { title: "Named chapters of protocol history", what: "Chapters of the protocol named at the moment of sealing, anchored to real on-chain events.", why: "The history members witnessed becomes a permanent, named part of the archive — recognizable years later.", dep: "Indexer + identity layer" },
      { title: "Protocol intelligence for members", what: "Read-only treasury, liquidity, and activity summaries built on verified on-chain data.", why: "Members get clearer signal about protocol health without anyone taking custody or making promises.", dep: "Stable data pipeline" },
      { title: "Reach without fragmenting trust", what: "SYN representation on additional chains, only if members vote it serves them.", why: "Wider access without splitting the protocol's verifiability across silos.", dep: "Governance approval" },
      { title: "Identity compounds over time", what: "Public on-chain badges, witnessed-event records, and participation archive.", why: "The longer you've been a member and the more events you've witnessed, the more your seat reflects it — earned, never granted.", dep: "Identity contract + indexer" },
    ],
  },
  {
    key: "NEVER",
    title: "Not planned / never",
    blurb: "What The Syndicate will not become — by design.",
    tone: "navy",
    items: [
      { title: "Yield product or dividend program", what: "SYN is not equity, not debt, not a yield-bearing instrument.", why: "Protects members and matches every contract on-chain." },
      { title: "Custodial vault", what: "Members never deposit assets into a Syndicate-controlled custody contract.", why: "Non-custodial is a hard line." },
      { title: "Hidden admin keys / upgradeable token", what: "SYN has no owner, no mint, no pause, no blacklist.", why: "The token's guarantees are immutable." },
      { title: "Pay-to-rank bonus tokens", what: "Larger purchases never receive bonus tokens or private terms.", why: "Rank is recognition only; it never changes the current era quote." },
    ],
  },
];

const TONE_PILL: Record<Tone, Tone> = {
  success: "success",
  gold: "gold",
  muted: "muted",
  navy: "navy",
};

function RoadmapPage() {
  return (
    <PageShell
      eyebrow="Roadmap"
      title="Live · Next · Pending · Future · Never"
      description="Honest five-bucket roadmap. Each item lists what it is, why it matters, what it depends on, and where to verify it when live. No fake dates."
    >
      {BUCKETS.map((b) => (
        <Section key={b.key} id={`roadmap-${b.key.toLowerCase()}`}>
          <SectionHeader
            eyebrow={b.key}
            title={b.title}
            description={b.blurb}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {b.items.map((it) => (
              <GlassCard key={it.title} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-semibold leading-snug">{it.title}</h3>
                  <Pill tone={TONE_PILL[b.tone]}>{b.key}</Pill>
                </div>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">What</dt>
                    <dd className="text-foreground/85">{it.what}</dd>
                  </div>
                  <div>
                    <dt className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Why it matters</dt>
                    <dd className="text-foreground/85">{it.why}</dd>
                  </div>
                  {it.dep && (
                    <div>
                      <dt className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Dependency</dt>
                      <dd className="text-muted-foreground">{it.dep}</dd>
                    </div>
                  )}
                  {it.verifyHref && (
                    <div className="pt-1">
                      <a
                        href={it.verifyHref}
                        target={it.verifyHref.startsWith("http") ? "_blank" : undefined}
                        rel={it.verifyHref.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="mono text-[11px] uppercase tracking-[0.16em] text-[color:oklch(0.5_0.13_75)] underline-offset-4 hover:underline"
                      >
                        Verify · {it.verifyLabel ?? "source"} ↗
                      </a>
                    </div>
                  )}
                </dl>
              </GlassCard>
            ))}
          </div>
        </Section>
      ))}
    <RouteFinalCTA preset="editorial" />
    </PageShell>
  );
}
