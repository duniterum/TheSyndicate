import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProtocolHero } from "@/components/protocol-hero";
import { MOCK_DATA, ROUTING_SPLIT } from "@/lib/mock-data";
import { PROOF_SURFACES } from "@/lib/surfaces";
import {
  Shield,
  Database,
  Archive as ArchiveIcon,
  Activity,
  GitCommit,
  ArrowRight,
  ArrowUpRight,
  Receipt,
  Layers,
  Hash,
  CheckCircle2,
  Circle,
  Share2,
  Megaphone,
  Flame,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { getBurnSummary } from "@/lib/fire-ledger";

const LOOP_ICONS: Record<string, typeof Shield> = {
  Join: Shield,
  Prove: Database,
  Remember: ArchiveIcon,
  Return: Activity,
  Evolve: GitCommit,
};

const LOOP_DESC: Record<string, string> = {
  Join: "Take your seat natively on-chain.",
  Prove: "Verify every USDC movement.",
  Remember: "Collect temporal proof artifacts.",
  Return: "Watch the living activity feed.",
  Evolve: "Witness new protocol chapters.",
};

const JOURNEY = [
  { step: "Visitor", desc: "Read the transparent economy. No wallet required.", active: false },
  { step: "Buyer", desc: "Route USDC natively through public receipts.", active: false },
  { step: "Member", desc: "Hold a seat and accrue contribution depth.", active: true },
  { step: "Return", desc: "Come back as the institution evolves.", active: true },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function PublicHome() {
  return (
    <div className="pt-28 pb-24 flex flex-col gap-28 md:gap-36 overflow-hidden">
      {/* 1. Hero */}
      <ProtocolHero />

      {/* 2. The Loop */}
      <motion.section
        id="loop"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="container mx-auto px-4 max-w-6xl"
      >
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono tracking-[0.2em] text-muted-foreground uppercase mb-3">
            The Loop
          </h2>
          <p className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Join, prove, remember, return, evolve.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-0 md:items-stretch relative">
          {MOCK_DATA.loop.map((label, i) => {
            const Icon = LOOP_ICONS[label] ?? Circle;
            return (
              <motion.div key={label} variants={fadeInUp} className="flex items-center">
                <div
                  className="flex-1 p-5 rounded-2xl border border-white/5 bg-card/40 backdrop-blur-md flex flex-col items-center text-center gap-3 hover:bg-card/60 transition-colors h-full"
                  data-testid={`loop-step-${i}`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground mb-1">
                      0{i + 1}
                    </div>
                    <h3 className="font-bold text-foreground mb-1">{label}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {LOOP_DESC[label]}
                    </p>
                  </div>
                </div>
                {i < MOCK_DATA.loop.length - 1 && (
                  <ArrowRight className="hidden md:block w-5 h-5 text-muted-foreground/40 shrink-0 mx-1" />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 3. Live Now Board */}
      <motion.section
        id="status"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="container mx-auto px-4 max-w-6xl"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Live now</h2>
            <p className="text-muted-foreground">
              What is live, read-only, in review, and still ahead — every module labeled plainly.
            </p>
          </div>
          <Link href="/registry">
            <Button variant="ghost" className="text-muted-foreground" data-testid="board-registry-link">
              View public registry proof
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_DATA.liveBoard.map((item, i) => (
            <motion.div
              key={item.name}
              variants={fadeInUp}
              className="p-5 border border-white/5 bg-card/30 backdrop-blur-sm rounded-2xl flex items-center justify-between gap-4 hover:border-white/10 transition-colors"
              data-testid={`board-item-${i}`}
            >
              <span className="font-medium text-foreground text-sm">{item.name}</span>
              <StatusBadge status={item.status as never} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 4. Proof Strip */}
      <motion.section
        id="transparency"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="border-y border-white/5 bg-black/30 py-14 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-xs font-mono tracking-[0.2em] text-muted-foreground uppercase text-center mb-10">
            Proof you can verify
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {[
              { icon: Layers, label: "Buy target", value: MOCK_DATA.buyTarget },
              { icon: Hash, label: "Default source", value: "ZERO_SOURCE_ID" },
              {
                icon: Database,
                label: "Routing split",
                value: `${ROUTING_SPLIT.vault}/${ROUTING_SPLIT.liquidity}/${ROUTING_SPLIT.operations}`,
              },
              { icon: Receipt, label: "Receipts", value: "Public" },
              { icon: Shield, label: "Contract registry", value: "Immutable" },
              { icon: Activity, label: "Activity proof", value: "On-chain" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-background/60 p-5 flex flex-col gap-2 text-center items-center"
                data-testid={`proof-stat-${i}`}
              >
                <stat.icon className="w-5 h-5 text-primary mb-1" />
                <div className="text-base font-bold tracking-tight text-foreground font-mono break-all">
                  {stat.value}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Every USDC is routed {ROUTING_SPLIT.vault}% Vault / {ROUTING_SPLIT.liquidity}% Liquidity
            / {ROUTING_SPLIT.operations}% Operations. Proof of destination, never a promise of return.
          </p>
        </div>
      </motion.section>

      {/* 5. Member Journey */}
      <motion.section
        id="journey"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="container mx-auto px-4 max-w-5xl"
      >
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3 text-foreground">The journey</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From reading the proof to returning as a member. Identity is binary — you hold a seat or
            you do not.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-0 relative">
          <div className="hidden md:block absolute top-9 left-0 w-full h-px bg-white/5 -z-10" />
          {JOURNEY.map((stage, i) => (
            <motion.div
              key={stage.step}
              variants={fadeInUp}
              className="flex flex-col items-center text-center bg-background px-4 md:w-1/4"
              data-testid={`journey-stage-${i}`}
            >
              <div
                className={`w-5 h-5 rounded-full mb-5 border-2 flex items-center justify-center ${
                  stage.active
                    ? "bg-primary border-primary shadow-[0_0_12px_rgba(var(--primary),0.5)]"
                    : "bg-background border-white/20"
                }`}
              >
                {stage.active && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
              </div>
              <h4
                className={`font-bold mb-2 ${
                  stage.active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {stage.step}
              </h4>
              <p className="text-xs text-muted-foreground max-w-[160px]">{stage.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 6. Living Timeline */}
      <motion.section
        id="evolution"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="container mx-auto px-4 max-w-4xl"
      >
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3 text-foreground">
            A living institution
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            What became true, what is in review, and what is still ahead — a series that keeps
            unfolding. No countdowns, no manufactured scarcity.
          </p>
        </div>
        <div className="space-y-6 border-l border-white/10 ml-3 md:ml-6 pl-6 md:pl-10 relative">
          {MOCK_DATA.protocolEpisodes.map((ep, i) => (
            <motion.div key={ep.id} variants={fadeInUp} className="relative" data-testid={`episode-${i}`}>
              <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1.5">
                <span className="text-xs font-mono text-muted-foreground">
                  Episode {i + 1} · {ep.date}
                </span>
                <h3 className="text-lg font-bold text-foreground">{ep.name}</h3>
                <StatusBadge status={ep.status as never} />
              </div>
              <p className="text-muted-foreground text-sm">{ep.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/evolution">
            <Button variant="outline" className="bg-background/50 backdrop-blur" data-testid="timeline-evolution-link">
              View the evolution series
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </motion.section>

      {/* 6.5 Toolkit & Proof of Fire */}
      <motion.section
        id="toolkit-fire"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="container mx-auto px-4 max-w-5xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-8 border border-white/10 bg-card/30 rounded-3xl backdrop-blur-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Syndicate Toolkit</span>
              <StatusBadge status="PROTOTYPE ONLY" showTooltip={false} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Every protocol action, in one place</h2>
            <p className="text-muted-foreground text-sm leading-relaxed flex-1">
              A role-aware index of what the institution can do — proof surfaces, token tools, and member actions.
              Concepts are visible to everyone; personal actions unlock when you connect. Nothing here is a financial promise.
            </p>
            <div className="mt-5">
              <Button asChild variant="outline">
                <Link href="/toolkit" data-testid="home-to-toolkit">
                  <Wrench className="w-4 h-4" /> Open the Toolkit
                </Link>
              </Button>
            </div>
          </div>

          <div className="p-8 border border-orange-500/20 bg-orange-500/[0.05] rounded-3xl backdrop-blur-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Proof of Fire</span>
              <StatusBadge status="SIMULATED PROTOTYPE" showTooltip={false} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">A burn is a costly signal, not a price promise</h2>
            <p className="text-muted-foreground text-sm leading-relaxed flex-1">
              The Fire Ledger shows how retiring SYN supply would be remembered as proof — witnessed, never hyped.
              No yield, no return, no minting. Figures are simulated for the prototype.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button asChild variant="outline">
                <Link href="/fire" data-testid="home-to-fire">
                  <Flame className="w-4 h-4" /> View the Fire Ledger
                </Link>
              </Button>
              <span className="text-xs text-muted-foreground">
                {getBurnSummary().totalSyn.toLocaleString()} SYN considered retired (simulated)
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 7. Proof Travels */}
      <motion.section
        id="proof-travels"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="container mx-auto px-4 max-w-5xl"
      >
        <div className="p-8 md:p-12 border border-primary/20 bg-primary/[0.05] rounded-3xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Proof travels</span>
                <StatusBadge status="PROTOTYPE ONLY" showTooltip={false} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                Proof you can share anywhere
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A seat, a receipt, a chapter, an evolution event — each can travel outside the app as
                a clean proof card. Share, witness, invite, return. No hype, no scarcity, no financial
                promises.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                {["Share", "Witness", "Invite", "Return"].map((s, i) => (
                  <span key={s} className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-background/50 border border-white/10 font-medium">{s}</span>
                    {i < 3 && <ArrowRight className="w-3 h-3 text-muted-foreground/50" />}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Button asChild>
                <Link href="/share" data-testid="home-to-share">
                  <Share2 className="w-4 h-4" /> Proof &amp; Share Center
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/press" data-testid="home-to-press">
                  <Megaphone className="w-4 h-4" /> Press &amp; Brand Kit
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="trust"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="container mx-auto px-4 max-w-5xl"
      >
        <div className="p-8 md:p-12 border border-white/10 bg-card/30 rounded-3xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                Trust boundaries
              </h2>
              <p className="text-muted-foreground text-sm">
                The limits we hold ourselves to, stated plainly.
              </p>
            </div>
            <StatusBadge status="SIMULATED PROTOTYPE" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MOCK_DATA.trustBoundaries.map((boundary, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/50 border border-white/5"
                data-testid={`boundary-${i}`}
              >
                <Circle className="w-2 h-2 fill-primary text-primary shrink-0" />
                <span className="text-sm text-foreground">{boundary}</span>
              </div>
            ))}
          </div>
          <p className="text-base md:text-lg text-foreground/80 italic font-serif mt-8 text-center">
            {MOCK_DATA.doctrine}
          </p>
        </div>
      </motion.section>
    </div>
  );
}
