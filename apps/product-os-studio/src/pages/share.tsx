import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProofCard, type ProofCardData } from "@/components/proof-card";
import { ShareDialog, type SharePayload } from "@/components/share-dialog";
import { BRAND } from "@/lib/brand";
import { MOCK_DATA } from "@/lib/mock-data";
import { getBurnSummary } from "@/lib/fire-ledger";
import { Link } from "wouter";
import { Share2, ArrowRight, Megaphone } from "lucide-react";

type ProofItem = {
  card: ProofCardData;
  source: string;
  live: string;
  linksTo: string;
  disclosure: string;
  share: SharePayload;
};

const ps = MOCK_DATA.protocolStats;

const ITEMS: ProofItem[] = [
  {
    card: {
      eyebrow: "Membership Proof",
      title: `Member ${MOCK_DATA.memberNumber}`,
      subtitle: `Seat held · ${MOCK_DATA.chapter}`,
      accent: "blue",
      lines: [
        { label: "Seat", value: "Held" },
        { label: "Chapter", value: MOCK_DATA.chapter },
        { label: "Contribution", value: MOCK_DATA.contributionDepth },
        { label: "Wallet", value: MOCK_DATA.wallet },
      ],
      footnote: "no financial rights",
    },
    source: "Member profile (My Syndicate)",
    live: "Simulated member data",
    linksTo: "/member/my-syndicate",
    disclosure: "Proof of membership and place — not a wealth flex, not a leaderboard.",
    share: {
      eyebrow: "Membership Proof",
      title: `Member ${MOCK_DATA.memberNumber}`,
      summary: `Seat held · ${MOCK_DATA.chapter}`,
      accent: "blue",
      lines: [
        { label: "Seat", value: "Held" },
        { label: "Chapter", value: MOCK_DATA.chapter },
      ],
      shareText: `I hold a seat in The Syndicate — Member ${MOCK_DATA.memberNumber}, ${MOCK_DATA.chapter}. A living on-chain institution that recognizes capital without reducing identity to capital.`,
    },
  },
  {
    card: {
      eyebrow: "Receipt Proof",
      title: "150 USDC routed",
      subtitle: "Verifiable membership receipt",
      accent: "amber",
      routing: true,
      lines: [
        { label: "SYN acquired", value: "15,000" },
        { label: "Source", value: MOCK_DATA.defaultSourceId },
        { label: "Proof", value: MOCK_DATA.receipts.lastPurchase.txHash },
        { label: "Recorded", value: "On-chain (sim)" },
      ],
      footnote: "no yield · no return",
    },
    source: "receipts.lastPurchase",
    live: "Simulated receipt + hash",
    linksTo: "/member/activity",
    disclosure: "A receipt shows routing, not return. No yield, ROI, or investment framing.",
    share: {
      eyebrow: "Receipt Proof",
      title: "150 USDC routed",
      summary: "Verifiable membership receipt",
      accent: "amber",
      routing: true,
      lines: [
        { label: "SYN acquired", value: "15,000" },
        { label: "Source", value: MOCK_DATA.defaultSourceId },
      ],
      shareText: `My Syndicate membership receipt: 150 USDC routed transparently — 70% Vault / 20% Liquidity / 10% Operations. Verifiable membership, not a financial product.`,
    },
  },
  {
    card: {
      eyebrow: "Chapter Progress",
      title: `${ps.chapter} · ${ps.chapterIndex}/${ps.chapterTotal}`,
      subtitle: `${ps.members} members seated`,
      accent: "sky",
      lines: [
        { label: "Members", value: `${ps.members}` },
        { label: "Next seat", value: `#${ps.seatAvailable}` },
        { label: "Chapter", value: `${ps.chapterIndex}/${ps.chapterTotal}` },
        { label: "Phase", value: "Forming" },
      ],
      footnote: "cohort, not scarcity",
    },
    source: "protocolStats",
    live: "Simulated protocol snapshot",
    linksTo: "/member/registry",
    disclosure: "Chapter is memory and cohort, not fake urgency or scarcity pressure.",
    share: {
      eyebrow: "Chapter Progress",
      title: `${ps.chapter} · ${ps.chapterIndex}/${ps.chapterTotal}`,
      summary: `${ps.members} members seated`,
      accent: "sky",
      lines: [
        { label: "Members", value: `${ps.members}` },
        { label: "Chapter", value: `${ps.chapterIndex}/${ps.chapterTotal}` },
      ],
      shareText: `The Syndicate is advancing — ${ps.chapter}, chapter ${ps.chapterIndex} of ${ps.chapterTotal}, ${ps.members} members seated. A living institution forming in public.`,
    },
  },
  {
    card: {
      eyebrow: "Protocol Routing",
      title: "8,450 USDC routed",
      subtitle: "Protocol-level, canonical split",
      accent: "emerald",
      routing: true,
      lines: [
        { label: "Vault", value: "5,915" },
        { label: "Liquidity", value: "1,690" },
        { label: "Operations", value: "845" },
        { label: "Controlled", value: "7,605" },
      ],
      footnote: "70% / 20% / 10%",
    },
    source: "economy.protocol",
    live: "Simulated totals · canonical math",
    linksTo: "/member/transparency",
    disclosure: "Routing totals reconcile to the canonical 70% / 20% / 10% split on every surface.",
    share: {
      eyebrow: "Protocol Routing",
      title: "8,450 USDC routed",
      summary: "Protocol-level, canonical split",
      accent: "emerald",
      routing: true,
      lines: [
        { label: "Vault", value: "5,915" },
        { label: "Operations", value: "845" },
      ],
      shareText: `The Syndicate has routed 8,450 USDC transparently — 70% Vault / 20% Liquidity / 10% Operations. Public, verifiable capital routing.`,
    },
  },
  {
    card: {
      eyebrow: "Archive Memory",
      title: "Genesis Signal Artifact",
      subtitle: "ERC-1155 memory · not financial rights",
      accent: "violet",
      lines: [
        { label: "Type", value: "ERC-1155" },
        { label: "Chapter", value: "Genesis Signal" },
        { label: "Marks", value: "Early alignment" },
        { label: "Status", value: "Anchored" },
      ],
      footnote: "memory, not rights",
    },
    source: "archiveItems",
    live: "Simulated artifact",
    linksTo: "/member/archive",
    disclosure: "Archive NFTs are memory of milestones — not seats and not financial rights.",
    share: {
      eyebrow: "Archive Memory",
      title: "Genesis Signal Artifact",
      summary: "ERC-1155 memory of early protocol alignment",
      accent: "violet",
      lines: [
        { label: "Type", value: "ERC-1155" },
        { label: "Chapter", value: "Genesis Signal" },
      ],
      shareText: `I hold a Genesis Signal memory artifact from The Syndicate — proof I was present as the protocol moved. Memory, not financial rights.`,
    },
  },
  {
    card: {
      eyebrow: "Evolution Episode",
      title: "V3 Engine Activated",
      subtitle: "A protocol lifecycle event",
      accent: "blue",
      lines: [
        { label: "Event", value: "Module live" },
        { label: "Module", value: "Membership V3" },
        { label: "Status", value: "LIVE NOW" },
        { label: "Proof", value: "Protocol" },
      ],
      footnote: "the series continues",
    },
    source: "protocolEpisodes / activities",
    live: "Simulated milestone",
    linksTo: "/member/evolution",
    disclosure: "Evolution is the public series — the protocol moving, witnessed over time.",
    share: {
      eyebrow: "Evolution Episode",
      title: "V3 Engine Activated",
      summary: "A protocol lifecycle event",
      accent: "blue",
      lines: [
        { label: "Module", value: "Membership V3" },
        { label: "Status", value: "LIVE NOW" },
      ],
      shareText: `The Syndicate just moved — the Membership V3 Engine is live. Watch a living protocol evolve in public.`,
    },
  },
  {
    card: {
      eyebrow: "Verified Introduction",
      title: "Source status",
      subtitle: "V1 candidate · not live",
      accent: "neutral",
      badge: "V1 CANDIDATE",
      lines: [
        { label: "Public link", value: "None" },
        { label: "Default", value: MOCK_DATA.defaultSourceId },
        { label: "Claim UI", value: "Not live" },
        { label: "Model", value: "Invite-only" },
      ],
      footnote: "not an MLM",
    },
    source: "Referral doctrine",
    live: "Not live (V1 candidate)",
    linksTo: "/learn#referral",
    disclosure: "No public source link, no upline/downline. Default attribution is ZERO_SOURCE_ID.",
    share: {
      eyebrow: "Verified Introduction",
      title: "Source status",
      summary: "V1 candidate · not live",
      accent: "neutral",
      lines: [
        { label: "Default", value: MOCK_DATA.defaultSourceId },
        { label: "Model", value: "Invite-only" },
      ],
      shareText: `The Syndicate's Verified Introduction is a V1 candidate — invite-only, no public referral link, no MLM. Default attribution is ZERO_SOURCE_ID.`,
    },
  },
  {
    card: {
      eyebrow: "Proof of Fire",
      title: "Fire Ledger",
      subtitle: "Costly signal · not a price promise",
      accent: "orange",
      badge: "SIMULATED PROTOTYPE",
      lines: [
        { label: "Considered retired", value: `${getBurnSummary().totalSyn.toLocaleString()} SYN` },
        { label: "Founder", value: "5,000" },
        { label: "Community", value: "2,500" },
        { label: "Status", value: "Simulated" },
      ],
      footnote: "no yield · no minting",
    },
    source: "fire-ledger (getBurnSummary)",
    live: "Simulated burn figures",
    linksTo: "/fire",
    disclosure: "A burn retires supply as a costly signal. Nothing is minted, no yield or return is implied, and all figures are simulated.",
    share: {
      eyebrow: "Proof of Fire",
      title: "Fire Ledger",
      summary: "Costly signal · not a price promise",
      accent: "orange",
      lines: [
        { label: "Considered retired", value: `${getBurnSummary().totalSyn.toLocaleString()} SYN` },
        { label: "Status", value: "Simulated" },
      ],
      shareText: `The Syndicate's Proof of Fire: retiring SYN as a costly signal, witnessed not hyped. No yield, no minting, no price promise. Figures simulated in the prototype.`,
    },
  },
  {
    card: {
      eyebrow: "Syndicate Toolkit",
      title: "Protocol Actions",
      subtitle: "Role-aware action index",
      accent: "sky",
      lines: [
        { label: "Proof surfaces", value: "Public" },
        { label: "Token tools", value: "Connected" },
        { label: "Member actions", value: "Seated" },
        { label: "Promises", value: "None" },
      ],
      footnote: "tools, not promises",
    },
    source: "actions registry (ACTION_REGISTRY)",
    live: "Simulated action catalog",
    linksTo: "/toolkit",
    disclosure: "The toolkit indexes what the institution can do, gated by role. It is a map of actions and proofs, never a financial promise.",
    share: {
      eyebrow: "Syndicate Toolkit",
      title: "Protocol Actions",
      summary: "Role-aware action index",
      accent: "sky",
      lines: [
        { label: "Proof surfaces", value: "Public" },
        { label: "Member actions", value: "Seated" },
      ],
      shareText: `The Syndicate Toolkit — a role-aware index of protocol actions and proof surfaces. Tools and proofs, never financial promises.`,
    },
  },
];

export default function Share() {
  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl space-y-12">
      {/* Intro */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <Share2 className="w-3.5 h-3.5 text-primary" /> Proof &amp; Share Center
          </span>
          <StatusBadge status="PROTOTYPE ONLY" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Proof, made shareable
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
            The institution should be witnessed, not just used. These are the proof cards that
            let a seat, a receipt, a chapter, or an evolution event travel outside the app —
            without hype, scarcity pressure, or financial promises.
          </p>
        </div>
        {/* Share loop */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {BRAND.shareLoop.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-medium">
                {step}
              </span>
              {i < BRAND.shareLoop.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Proof card gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ITEMS.map((item) => (
          <div key={item.card.eyebrow} className="space-y-3" data-testid={`share-item-${item.card.eyebrow}`}>
            <ProofCard data={item.card} />
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5">
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground/70">Data source</span>
                  <span className="font-mono text-muted-foreground text-right truncate">{item.source}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground/70">Live / simulated</span>
                  <span className="text-muted-foreground text-right">{item.live}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed border-t border-white/5 pt-2">
                {item.disclosure}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <ShareDialog
                  payload={item.share}
                  trigger={
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`share-open-${item.card.eyebrow}`}>
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </Button>
                  }
                />
                <Button variant="ghost" size="sm" asChild>
                  <Link href={item.linksTo} data-testid={`share-link-${item.card.eyebrow}`}>
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Press bridge */}
      <Card className="bg-primary/[0.06] border-primary/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="text-lg font-bold">Press &amp; brand assets</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Logos, descriptions, palette, official channels, and approved language for media
                and partners — everything needed to represent The Syndicate consistently.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/press" data-testid="share-to-press">
              Open Press Kit <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground/70 text-center">
        All cards are prototype previews built from simulated data. No image is generated, no post
        is published, and no explorer link is live.
      </p>
    </div>
  );
}
