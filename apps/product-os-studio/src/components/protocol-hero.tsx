import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import {
  Crown,
  Shield,
  Flame,
  Users,
  Coins,
  Landmark,
  Droplets,
  Cog,
  Activity as ActivityIcon,
  ArrowRight,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { MOCK_DATA, ROUTING_SPLIT, routeUsdc } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

const stats = MOCK_DATA.protocolStats;
const routed = routeUsdc(stats.usdcRouted);

function usd(n: number) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const STRIP = [
  { icon: Users, label: "Members", value: String(stats.members) },
  { icon: Coins, label: "USDC routed", value: usd(stats.usdcRouted) },
  { icon: Shield, label: "Protocol-controlled", value: usd(stats.protocolControlled) },
  { icon: Flame, label: "Burned SYN", value: stats.burnedSyn.toLocaleString() },
  {
    icon: Sparkles,
    label: "Chapter",
    value: `${stats.chapter} · ${stats.chapterIndex}/${stats.chapterTotal}`,
  },
];

const DESTINATIONS = [
  {
    key: "vault",
    label: "Vault",
    note: "Protocol-controlled reserve",
    pct: ROUTING_SPLIT.vault,
    amount: routed.vault,
    icon: Landmark,
    accent: "text-amber-400",
    ring: "border-amber-400/30",
    glow: "bg-amber-400/[0.06]",
    bar: "bg-amber-400",
  },
  {
    key: "liquidity",
    label: "Liquidity",
    note: "Market liquidity depth",
    pct: ROUTING_SPLIT.liquidity,
    amount: routed.liquidity,
    icon: Droplets,
    accent: "text-sky-400",
    ring: "border-sky-400/30",
    glow: "bg-sky-400/[0.06]",
    bar: "bg-sky-400",
  },
  {
    key: "operations",
    label: "Operations",
    note: "Operational capacity",
    pct: ROUTING_SPLIT.operations,
    amount: routed.operations,
    icon: Cog,
    accent: "text-emerald-400",
    ring: "border-emerald-400/30",
    glow: "bg-emerald-400/[0.06]",
    bar: "bg-emerald-400",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProtocolHero() {
  const sysReduced = useReducedMotion();
  const { reducedMotion } = useApp();
  const noMotion = Boolean(sysReduced) || reducedMotion;

  const reveal = (delay = 0) =>
    noMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: EASE, delay },
        };

  const recentActivity = MOCK_DATA.activities.slice(0, 3);

  return (
    <section id="home" className="relative" data-testid="protocol-hero">
      {/* Atmospheric glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-[480px] w-[820px] max-w-[120vw] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Announcement + simulation honesty */}
        <motion.div
          {...reveal(0)}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono backdrop-blur-sm"
            data-testid="hero-badge"
          >
            <span
              className={`w-2 h-2 rounded-full bg-green-500 ${noMotion ? "" : "animate-pulse"} shadow-[0_0_8px_rgba(34,197,94,0.6)]`}
            />
            <span className="text-muted-foreground">
              THE INSTITUTION IS{" "}
              <span className="text-foreground font-semibold">ALIVE</span>
            </span>
          </span>
          <StatusBadge status="SIMULATED PROTOTYPE" />
        </motion.div>

        {/* Protocol stat strip */}
        <motion.div
          {...reveal(0.05)}
          className="mb-12 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md overflow-hidden"
          data-testid="hero-stat-strip"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y lg:divide-y-0 divide-white/5">
            {STRIP.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-1 p-4"
                data-testid={`hero-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <s.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    {s.label}
                  </span>
                </div>
                <span className="text-base md:text-lg font-bold tracking-tight text-foreground font-mono break-words">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-white/5 bg-background/40 text-[10px] font-mono uppercase tracking-wider text-muted-foreground text-center">
            Prototype snapshot · simulated values · routing math is canonical 70% / 20% / 10%
          </div>
        </motion.div>

        {/* Main two-column */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left: message */}
          <div className="text-center lg:text-left">
            <motion.h1
              {...reveal(0.1)}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-[1.05] text-foreground mb-6"
              data-testid="hero-title"
            >
              Take your seat in a{" "}
              <span className="text-primary">living protocol.</span>
            </motion.h1>

            <motion.p
              {...reveal(0.16)}
              className="text-lg text-muted-foreground mb-5 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              data-testid="hero-subtitle"
            >
              A transparent on-chain membership institution, forming in public. Every
              USDC route is verifiable, membership is proof-based, and the institution
              keeps evolving in public.
            </motion.p>

            <motion.p
              {...reveal(0.2)}
              className="text-sm text-foreground/75 italic font-serif mb-8 max-w-xl mx-auto lg:mx-0"
              data-testid="hero-doctrine"
            >
              {MOCK_DATA.doctrine}
            </motion.p>

            <motion.div
              {...reveal(0.26)}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-3 justify-center lg:justify-start"
            >
              <Link href="/member">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-7 h-13 py-3.5 bg-primary text-primary-foreground shadow-[0_0_28px_hsl(var(--primary)/0.35)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.55)] transition-shadow"
                  data-testid="hero-cta-main"
                >
                  Take Your Seat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/activity">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-13 py-3.5 border-white/10 hover:bg-white/5 bg-background/50 backdrop-blur-sm"
                  data-testid="hero-cta-proof"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  See Public Activity
                </Button>
              </Link>
            </motion.div>

            <motion.div
              {...reveal(0.32)}
              className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 justify-center lg:justify-start text-xs text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                You are a visitor
              </span>
              <span className="inline-flex items-center gap-1.5 text-foreground/80">
                <Crown className="w-3.5 h-3.5 text-primary" />
                Seat #{stats.seatAvailable} available
              </span>
              <span>Connect your wallet to open the member app.</span>
            </motion.div>
          </div>

          {/* Right: capital routing visualization */}
          <motion.div
            {...reveal(0.18)}
            className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-md p-6 md:p-8"
            data-testid="hero-routing-viz"
          >
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full bg-green-500 ${noMotion ? "" : "animate-pulse"}`}
                />
                <h2 className="text-sm font-semibold text-foreground">
                  Live capital routing
                </h2>
              </div>
              <StatusBadge status="SIMULATED PROTOTYPE" />
            </div>

            <div className="flex flex-col items-center">
              {/* Input */}
              <div className="px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-center">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Membership Sale · USDC in
                </div>
                <div className="text-sm font-bold font-mono text-foreground">
                  {usd(stats.usdcRouted)}
                </div>
              </div>

              {/* Connector into seat */}
              <Connector noMotion={noMotion} />

              {/* Seat emblem */}
              <div className="relative flex items-center justify-center my-1">
                {!noMotion && (
                  <>
                    <motion.span
                      className="absolute rounded-full border border-primary/30"
                      style={{ width: 80, height: 80 }}
                      animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.span
                      className="absolute rounded-full border border-primary/30"
                      style={{ width: 80, height: 80 }}
                      animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
                      transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 1.3,
                      }}
                    />
                  </>
                )}
                <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/40 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                The Seat
              </div>

              {/* Connector out */}
              <Connector noMotion={noMotion} />

              {/* Bus + destinations */}
              <div className="w-full">
                <div className="h-px w-[78%] mx-auto bg-white/10" />
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-3">
                  {DESTINATIONS.map((d, i) => (
                    <div
                      key={d.key}
                      className={`relative rounded-2xl border ${d.ring} ${d.glow} p-3 flex flex-col items-center text-center gap-1`}
                      data-testid={`routing-dest-${d.key}`}
                    >
                      {/* up connector */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-3 w-px bg-white/15 overflow-hidden">
                        {!noMotion && (
                          <motion.span
                            className={`absolute left-0 top-0 w-px h-1.5 ${d.bar}`}
                            animate={{ y: [-6, 12], opacity: [0, 1, 0] }}
                            transition={{
                              duration: 1.6,
                              repeat: Infinity,
                              ease: "easeIn",
                              delay: i * 0.25,
                            }}
                          />
                        )}
                      </div>
                      <div
                        className={`w-9 h-9 rounded-full bg-background/60 border ${d.ring} flex items-center justify-center ${d.accent}`}
                      >
                        <d.icon className="w-4 h-4" />
                      </div>
                      <div className={`text-lg font-bold leading-none ${d.accent}`}>
                        {d.pct}%
                      </div>
                      <div className="text-xs font-mono text-foreground">
                        {usd(d.amount)}
                      </div>
                      <div className="text-[10px] text-muted-foreground leading-tight">
                        {d.label}
                      </div>
                      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden mt-1">
                        <div
                          className={`h-full ${d.bar} rounded-full`}
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proof of burn */}
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <span className="font-bold text-foreground">
                    {stats.burnedSyn.toLocaleString()} SYN
                  </span>{" "}
                  burned · proof of burn · permanently removed
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity heartbeat */}
        <motion.div
          {...reveal(0.38)}
          className="mt-12 rounded-2xl border border-white/10 bg-card/30 backdrop-blur-sm p-4 md:p-5"
          data-testid="hero-activity-heartbeat"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-wider text-foreground">
                Latest activity
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-green-500 ${noMotion ? "" : "animate-pulse"}`}
                />
                live · simulated
              </span>
            </div>
            <Link href="/activity">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-8"
                data-testid="hero-activity-viewall"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-2.5">
            {recentActivity.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-background/50 border border-white/5"
                data-testid={`hero-activity-${a.id}`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">
                    {a.title}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {a.date} · {a.proof}
                  </div>
                </div>
                <span className="text-xs font-mono text-foreground shrink-0">
                  {a.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Connector({ noMotion }: { noMotion: boolean }) {
  return (
    <div className="relative h-7 w-px bg-gradient-to-b from-primary/50 to-primary/10 my-1 overflow-hidden">
      {!noMotion && (
        <motion.span
          className="absolute left-0 top-0 w-px h-2 bg-primary"
          animate={{ y: [-8, 28], opacity: [0, 1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn" }}
        />
      )}
    </div>
  );
}
