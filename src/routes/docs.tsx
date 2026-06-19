import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { GlassCard, Pill, Section, SectionHeader } from "@/components/syndicate/Primitives";
import { ProtocolJourneySpine } from "@/components/syndicate/ProtocolJourneySpine";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — Knowledge Hub | The Syndicate" },
      { name: "description", content: "Structured documentation hub for The Syndicate: vision, protocol model, token, sale, routing, vault, liquidity, ranks, verification, risk, and roadmap." },
      { property: "og:title", content: "The Syndicate — Docs" },
      { property: "og:description", content: "A real knowledge hub for members, builders, verifiers, and researchers." },
      { property: "og:url", content: "https://thesyndicate.money/docs" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/docs" }],
  }),
  component: DocsPage,
});

type Audience = "Beginner" | "Member" | "Builder" | "Verifier";
type Status = "LIVE" | "PARTIAL" | "PENDING" | "REFERENCE";

type Card = {
  title: string;
  purpose: string;
  href: string;
  external?: boolean;
  status: Status;
  audience: Audience[];
};

type Group = { eyebrow: string; title: string; description: string; cards: Card[] };

const GROUPS: Group[] = [
  {
    eyebrow: "Start here",
    title: "First steps",
    description: "Read these first — they explain what The Syndicate is and what it is not.",
    cards: [
      { title: "Vision", purpose: "Highest source of truth: mission, principles, what we refuse to build.", href: "/whitepaper", status: "REFERENCE", audience: ["Beginner", "Member", "Builder", "Verifier"] },
      { title: "Why join", purpose: "Mission, membership, and why a long-term builder would care.", href: "/#why-join", status: "LIVE", audience: ["Beginner", "Member"] },
      { title: "How to join", purpose: "Wallet → USDC → SYN → member archive, in six plain steps.", href: "/#how-to-join", status: "LIVE", audience: ["Beginner", "Member"] },
      { title: "Risk notice", purpose: "What you can lose, what is non-custodial, what is not investment.", href: "/faq#risks", status: "LIVE", audience: ["Beginner", "Member"] },
    ],
  },
  {
    eyebrow: "Protocol",
    title: "Core protocol",
    description: "The contracts, wallets, and rules that make The Syndicate work.",
    cards: [
      { title: "SYN token", purpose: "Fixed 1,000,000,000 supply. No admin, no mint, no pause, no tax.", href: "/token", status: "LIVE", audience: ["Member", "Builder", "Verifier"] },
      { title: "Tokenomics", purpose: "Seven allocation wallets, donut visualisation, live balances.", href: "/tokenomics", status: "LIVE", audience: ["Member", "Verifier"] },
      { title: "Membership Sale", purpose: "USDC → SYN at 1 SYN = $0.01. Atomic 70/20/10 split.", href: "/join", status: "LIVE", audience: ["Member"] },
      { title: "USDC routing", purpose: "70% Vault · 20% Liquidity · 10% Operations — enforced onchain.", href: "/vault", status: "LIVE", audience: ["Member", "Verifier"] },
      { title: "Vault", purpose: "Public Vault wallet today. Programmatic Vault contract is PENDING.", href: "/vault", status: "LIVE", audience: ["Member", "Verifier"] },
      { title: "Liquidity", purpose: "Trader Joe v1 SYN/USDC pair. Reserves and price read onchain.", href: "/liquidity", status: "LIVE", audience: ["Member", "Builder"] },
    ],
  },
  {
    eyebrow: "Identity",
    title: "Members & ranks",
    description: "How identity, ranks, and reputation work — and what is not gamified.",
    cards: [
      { title: "Member identity", purpose: "What changes after joining: wallet-readable rank, chapter, and archive identity.", href: "/#what-changes-after-joining", status: "LIVE", audience: ["Member"] },
      { title: "Ranks", purpose: "Identity tiers from wallet-readable SYN balance. No payouts, no yield.", href: "/ranks", status: "LIVE", audience: ["Member"] },
      { title: "Rank distribution", purpose: "Aggregate counts across every rank — the shape of the community, never a leaderboard.", href: "/ranks#distribution", status: "LIVE", audience: ["Member"] },
    ],
  },
  {
    eyebrow: "Verification",
    title: "Audit & transparency",
    description: "Every claim the site makes has an on-chain primitive behind it.",
    cards: [
      { title: "Transparency Center", purpose: "Live / partial / pending at a glance, with direct verification paths.", href: "/transparency", status: "LIVE", audience: ["Verifier", "Member"] },
      { title: "Verification table", purpose: "Interactive Claim → Source → Explorer → Status for every metric.", href: "/transparency#verify-everything", status: "LIVE", audience: ["Verifier"] },
      { title: "Registry", purpose: "Every contract, wallet, and explorer link in one place.", href: "/registry", status: "LIVE", audience: ["Verifier", "Builder"] },
      { title: "Activity", purpose: "Live TokensPurchased events streamed from the Membership Sale.", href: "/activity", status: "LIVE", audience: ["Verifier", "Member"] },
    ],
  },
  {
    eyebrow: "Reference",
    title: "Roadmap & FAQ",
    description: "Where the protocol is going, and answers to the questions visitors ask most.",
    cards: [
      { title: "Roadmap", purpose: "Live · Next · Pending · Future · Never — no fake dates.", href: "/roadmap", status: "LIVE", audience: ["Beginner", "Member", "Builder", "Verifier"] },
      { title: "FAQ", purpose: "Basics, SYN, joining, routing, vault, liquidity, ranks, verification, risks.", href: "/faq", status: "LIVE", audience: ["Beginner", "Member"] },
      { title: "Whitepaper", purpose: "Long-form protocol reference. Mission, mechanics, modules.", href: "/whitepaper", status: "REFERENCE", audience: ["Builder", "Verifier"] },
    ],
  },
  {
    eyebrow: "Archive",
    title: "Archive memory layer",
    description: "SYN is the seat. Artifacts are the memory of what happens around that seat. Optional, collectible, no financial rights. Archive1155 deployed on Avalanche · The First Signal (ID 1) public mint OPEN at 0.50 USDC · Patron Seal (ID 3) CONTRACT_GATED / PUBLIC_MINT_READ_GATED · other Artifacts sealed or reserved.",
    cards: [
      { title: "First Signal", purpose: "Public Archive artifact mint, contract status, and future collector view.", href: "/nft", status: "LIVE", audience: ["Beginner", "Member", "Verifier"] },
      { title: "My Syndicate", purpose: "Live member cockpit for your seat, chapter, member number, purchase routing, memory, proof, and pending future modules.", href: "/my-syndicate", status: "LIVE", audience: ["Member"] },
    ],
  },
];

const STATUS_TONE: Record<Status, "success" | "muted" | "gold"> = {
  LIVE: "success",
  PARTIAL: "muted",
  PENDING: "muted",
  REFERENCE: "gold",
};

function DocsPage() {
  return (
    <PageShell
      eyebrow="Docs"
      title="Protocol operating manual"
      description="Structured documentation for members, builders, verifiers, and researchers. Every card carries a status and an audience tag — so you know where to start."
    >
      <ProtocolJourneySpine
        current="visitor"
        compact
        id="operating-manual-journey"
        title="Read the protocol in the same order a member experiences it."
        description="Docs are not a separate knowledge pile. They explain the journey: understand the system, take a seat, verify the receipt, return home, watch activity, and preserve memory."
      />
      {GROUPS.map((g) => (
        <Section key={g.title} id={`docs-${g.eyebrow.toLowerCase().replace(/\s+/g, "-")}`}>
          <SectionHeader eyebrow={g.eyebrow} title={g.title} description={g.description} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {g.cards.map((c) => (
              <GlassCard key={c.title} className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold leading-snug">{c.title}</h3>
                  <Pill tone={STATUS_TONE[c.status]}>{c.status}</Pill>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.purpose}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-auto">
                  {c.audience.map((a) => (
                    <span
                      key={a}
                      className="mono text-[9px] uppercase tracking-[0.16em] rounded-full border border-border/60 px-2 py-0.5 text-muted-foreground"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                {c.href.startsWith("/") && !c.external ? (
                  <Link
                    to={c.href.split("#")[0] as never}
                    hash={c.href.includes("#") ? c.href.split("#")[1] : undefined}
                    className="mono text-[11px] uppercase tracking-[0.18em] text-[color:oklch(0.5_0.13_75)] underline-offset-4 hover:underline"
                  >
                    Open ↗
                  </Link>
                ) : (
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-[11px] uppercase tracking-[0.18em] text-[color:oklch(0.5_0.13_75)] underline-offset-4 hover:underline"
                  >
                    Open ↗
                  </a>
                )}
              </GlassCard>
            ))}
          </div>
        </Section>
      ))}
    <RouteFinalCTA preset="editorial" />
    </PageShell>
  );
}
