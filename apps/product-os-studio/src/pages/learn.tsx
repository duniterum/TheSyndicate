import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MOCK_DATA, ROUTING_SPLIT } from "@/lib/mock-data";
import { Link } from "wouter";
import {
  BookOpen,
  Armchair,
  Coins,
  Split,
  Layers,
  UserPlus,
  Box,
  AlertTriangle,
  FileCode,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const SECTIONS = [
  { id: "paper", label: "Protocol Paper" },
  { id: "concepts", label: "Core Concepts" },
  { id: "routing", label: "Routing" },
  { id: "referral", label: "Referral" },
  { id: "archive", label: "Archive" },
  { id: "faq", label: "FAQ" },
  { id: "risks", label: "Risks" },
  { id: "contracts", label: "Contracts" },
];

const CONCEPTS = [
  {
    icon: Armchair,
    title: "The Seat",
    body: "Membership is a binary seat — held or not held. There are no tiers, no rank ladder, and no pay-to-win title. Your seat is proven on-chain.",
  },
  {
    icon: Coins,
    title: "SYN",
    body: "SYN is the protocol's accounting unit, acquired when you route USDC. It is not a yield instrument, not a governance token, and not a financial right.",
  },
  {
    icon: Split,
    title: "USDC Routing",
    body: `Every membership routes USDC by a fixed, public split: ${ROUTING_SPLIT.vault}% Vault, ${ROUTING_SPLIT.liquidity}% Liquidity, ${ROUTING_SPLIT.operations}% Operations. The same split appears on every surface.`,
  },
  {
    icon: Layers,
    title: "Contribution Depth",
    body: "Capital is one recognition axis, not the whole identity. Work, time, verified introductions, operations, security and history can all count. Recognition is multi-axis.",
  },
];

const FAQS = [
  {
    q: "Is this a yield or investment product?",
    a: "No. The Syndicate has no yield, no passive income, no ROI, no treasury claim, no profit share, and no governance promise. SYN is an accounting unit, not a financial right.",
  },
  {
    q: "What does my USDC do when I join?",
    a: `It routes by the canonical split — ${ROUTING_SPLIT.vault}% to the Vault, ${ROUTING_SPLIT.liquidity}% to Liquidity, ${ROUTING_SPLIT.operations}% to Operations — and is recorded as a verifiable receipt you can read in Activity.`,
  },
  {
    q: "Is there a referral or affiliate program?",
    a: "Not publicly today. Verified Introduction is a V1 candidate — invite-only and manually approved if it activates. There is no public source link, no source dashboard, and no claim UI live. Default source attribution is ZERO_SOURCE_ID. This is not an MLM and has no upline/downline.",
  },
  {
    q: "Are the NFTs in the Archive worth money?",
    a: "Archive artifacts are memory, not seats and not financial rights. They mark protocol milestones and your place in history — nothing more.",
  },
  {
    q: "Is the data on this prototype real?",
    a: "This is a prototype interface. Canonical truths (the routing split, ZERO_SOURCE_ID, module statuses and doctrine) are accurate, but member balances, addresses, transaction hashes and activity are simulated and labeled throughout. No live blockchain writes occur.",
  },
  {
    q: "Can I lose my seat?",
    a: "Seat identity is binary. Your standing across other recognition axes can evolve over time, but the prototype does not simulate seat revocation.",
  },
];

function SectionHeading({
  id,
  icon: Icon,
  title,
  badge,
}: {
  id: string;
  icon: typeof BookOpen;
  title: string;
  badge?: string;
}) {
  return (
    <div id={id} className="flex items-center justify-between scroll-mt-24">
      <h2 className="text-xl font-bold flex items-center gap-2.5">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h2>
      {badge && <StatusBadge status={badge as any} />}
    </div>
  );
}

export default function Learn() {
  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-5xl space-y-14">
      {/* Intro */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5 text-primary" /> Docs · FAQ · Protocol Paper
          </span>
          <StatusBadge status="PROTOTYPE ONLY" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Understand the protocol
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
            A living, transparent on-chain membership institution. Read what is real,
            what is simulated in this prototype, and what is still a future module —
            then take your seat or verify the proof yourself.
          </p>
        </div>
        <p className="font-serif text-lg text-muted-foreground border-l-2 border-primary/40 pl-4">
          "{MOCK_DATA.doctrine}"
        </p>
        {/* Quick nav */}
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
              data-testid={`learn-nav-${s.id}`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Protocol Paper */}
      <section className="space-y-5">
        <SectionHeading id="paper" icon={BookOpen} title="Protocol Paper" badge="CONCEPT ONLY" />
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The full Protocol Paper is being written in public. This is a preview of its
              spine — the principles the institution is built to honor.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Seat identity is binary; contribution depth is variable.",
                "USDC routed is real, verifiable contribution.",
                "Capital is one recognition axis, not the whole identity.",
                "NFTs are memory, not seats or financial rights.",
                "Public/default source attribution is ZERO_SOURCE_ID.",
                "Activity becomes memory; memory becomes history.",
              ].map((line) => (
                <div
                  key={line}
                  className="flex items-start gap-2.5 text-sm bg-background/40 border border-white/5 rounded-lg p-3"
                >
                  <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{line}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              Preview only — the complete paper is not yet published.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Core concepts */}
      <section className="space-y-5">
        <SectionHeading id="concepts" icon={Layers} title="Core Concepts" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONCEPTS.map((c) => (
            <Card key={c.title} className="bg-white/5 border-white/10" data-testid={`concept-${c.title}`}>
              <CardContent className="p-5 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <c.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{c.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Routing */}
      <section className="space-y-5">
        <SectionHeading id="routing" icon={Split} title="USDC Routing" badge="LIVE NOW" />
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 space-y-5">
            <p className="text-sm text-muted-foreground">
              Membership capital follows one canonical split. It never changes between
              surfaces — what you see in the hero is what you see in your receipt.
            </p>
            <div className="space-y-3">
              {[
                { name: "Vault", pct: ROUTING_SPLIT.vault, note: "Protocol-controlled reserve", bar: "bg-amber-500/70", tint: "text-amber-400" },
                { name: "Liquidity", pct: ROUTING_SPLIT.liquidity, note: "Liquidity depth", bar: "bg-sky-500/70", tint: "text-sky-400" },
                { name: "Operations", pct: ROUTING_SPLIT.operations, note: "Operational capacity", bar: "bg-emerald-500/70", tint: "text-emerald-400" },
              ].map((seg) => (
                <div key={seg.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className={`font-medium ${seg.tint}`}>
                      {seg.name} <span className="text-muted-foreground font-normal">· {seg.note}</span>
                    </span>
                    <span className="font-mono">{seg.pct}%</span>
                  </div>
                  <div className="h-2 bg-background/50 rounded-full overflow-hidden border border-white/5">
                    <div className={`h-full ${seg.bar}`} style={{ width: `${seg.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Referral */}
      <section className="space-y-5">
        <SectionHeading id="referral" icon={UserPlus} title="Referral / Verified Introduction" badge="V1 CANDIDATE" />
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background/40 border border-white/5 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current truth</div>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>Not live publicly.</li>
                  <li>No public source link today.</li>
                  <li>No source dashboard or claim UI.</li>
                  <li>Default attribution is <span className="font-mono text-foreground">ZERO_SOURCE_ID</span>.</li>
                </ul>
              </div>
              <div className="bg-background/40 border border-white/5 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">If it activates (V1)</div>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>Invite-only, manually approved.</li>
                  <li>MembershipSaleV3 only, buyer-visible.</li>
                  <li>Buyer-clearable to ZERO_SOURCE_ID.</li>
                  <li>Not an MLM — no upline / downline.</li>
                </ul>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              Any referral link, commission, or analytics shown elsewhere in the prototype is
              SIMULATED and NOT LIVE.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Archive */}
      <section className="space-y-5">
        <SectionHeading id="archive" icon={Box} title="Archive / NFT Memory" badge="LIVE NOW" />
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Archive is the institution's memory. Artifacts are ERC-1155 records that mark
              chapters and milestones — proof you were present as the protocol moved. They are
              memory, not seats, and confer no financial rights.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="space-y-5">
        <SectionHeading id="faq" icon={BookOpen} title="Frequently Asked" />
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-2 sm:p-4">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-white/5">
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline" data-testid={`faq-${i}`}>
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* Risks */}
      <section className="space-y-5">
        <SectionHeading id="risks" icon={AlertTriangle} title="Risks & Disclaimers" />
        <Card className="bg-amber-500/[0.04] border-amber-500/20">
          <CardContent className="p-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {MOCK_DATA.trustBoundaries.map((b) => (
                <div key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-amber-400/70 shrink-0" />
                  {b}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/80 pt-2 border-t border-white/5">
              Nothing here is financial advice. Participation in any on-chain protocol carries
              risk. This prototype does not execute real transactions.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Contracts */}
      <section className="space-y-5">
        <SectionHeading id="contracts" icon={FileCode} title="Smart Contracts & Proof" badge="SIMULATED PROTOTYPE" />
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {MOCK_DATA.contractLayers.map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-4 p-4" data-testid={`contract-${c.name}`}>
                  <div className="min-w-0">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{c.purpose}</div>
                    <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5 truncate">
                      {c.address} · simulated
                    </div>
                  </div>
                  <StatusBadge status={c.status as any} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <p className="text-[11px] text-muted-foreground/70">
          No canonical contract addresses exist in this prototype. Addresses are mocked and
          explorer links are inert.
        </p>
      </section>

      {/* CTA */}
      <Card className="bg-primary/[0.06] border-primary/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="text-lg font-bold">Ready to take your seat?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Join the membership engine or verify the live activity for yourself.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/">
              <Button variant="outline" data-testid="learn-cta-home">Back to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
