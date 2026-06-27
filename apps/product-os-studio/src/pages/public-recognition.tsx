import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConnectForPersonalCta, PublicProofNote } from "@/components/connect-cta";
import {
  Award,
  Layers,
  Users,
  GitBranch,
  ShieldX,
  ArrowRight,
} from "lucide-react";
import {
  RECOGNITION_AXES,
  getPublicRecognitionBoard,
  RECOGNITION_PATH,
} from "@/lib/protocol-graph";
import { MOCK_DATA } from "@/lib/mock-data";

const STANDING_STYLES: Record<string, string> = {
  Foundational: "bg-primary/10 text-primary border-primary/20",
  Established: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Emerging: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
};

const NOT_THIS = [
  "Not a wealth leaderboard",
  "No yield",
  "No rewards",
  "No rank to buy",
  "Signals, never balances",
];

export default function PublicRecognitionPage() {
  const board = getPublicRecognitionBoard();
  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl space-y-8" data-testid="page-public-recognition">
      {/* Header */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Recognition</h1>
            <StatusBadge status="READ-ONLY" />
          </div>
        </div>
        <PublicProofNote surfaceId="recognition" />
        <p className="text-muted-foreground text-lg max-w-2xl">
          Standing in The Syndicate is multi-axis. Recognition records proof-backed
          contribution across many dimensions — it is not a ranking of who holds the most.
        </p>
      </motion.div>

      {/* What recognition is NOT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-primary/20 p-2 rounded-lg">
                <ShieldX className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                What this is not
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {NOT_THIS.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-md border border-white/10 bg-background/40 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  data-testid={`not-this-${item}`}
                >
                  {item}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recognition Axes Framework (no levels) */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">The Axes Framework</h2>
        </div>

        <p className="text-sm text-muted-foreground max-w-3xl">
          Eleven dimensions of standing. These axes recognize proof-backed participation across the
          protocol, ensuring identity is never reduced to a single financial metric.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RECOGNITION_AXES.map((axis, index) => (
            <motion.div
              key={axis.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
            >
              <Card className="bg-white/5 border-white/10 h-full">
                <CardContent className="p-5 space-y-3" data-testid={`axis-${axis.name}`}>
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="font-semibold">{axis.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{axis.note}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contributor Standing (Anonymized Board) */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Contributor Board</h2>
        </div>

        <p className="text-sm text-muted-foreground max-w-3xl">
          Anonymized seats and their primary axis. The number shown is a count of
          proof-backed signals — never a balance, never an amount of capital. Seats are not
          ordered by wealth; this is a record of participation, not a scoreboard.
        </p>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{MOCK_DATA.protocolStats.chapter} · Anonymized seats</CardTitle>
              <StatusBadge status="SIMULATED PROTOTYPE" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 divide-y divide-white/5">
            {board.map((c, index) => (
              <motion.div
                key={c.seat}
                className="flex flex-wrap items-center gap-3 py-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                data-testid={`contributor-${c.seat}`}
              >
                <span className="font-mono text-sm font-semibold w-20 shrink-0">{c.seat}</span>
                <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                  <Award className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{c.primaryAxis}</span>
                </div>
                <span
                  className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${
                    STANDING_STYLES[c.standing] ?? STANDING_STYLES.Emerging
                  }`}
                >
                  {c.standing}
                </span>
                <div className="text-right w-24 shrink-0">
                  <span className="font-mono text-sm">{c.signals}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                    signals
                  </span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recognition Path */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <GitBranch className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">How a signal forms</h2>
        </div>

        <p className="text-sm text-muted-foreground max-w-3xl">
          Recognition is earned through the protocol graph, not assigned. A proof-backed event
          is classified, reviewed by an operator, and only then becomes a member signal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {RECOGNITION_PATH.map((step, index) => (
            <motion.div
              key={step.step}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card className="bg-white/5 border-white/10 h-full">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20 text-primary font-mono text-xs">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-foreground">{step.step}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.detail}</p>
                </CardContent>
              </Card>
              {index < RECOGNITION_PATH.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Doctrine close */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-3">
            <p className="font-serif text-xl italic text-foreground/90 max-w-2xl mx-auto">
              {MOCK_DATA.doctrine}
            </p>
            <p className="text-sm text-muted-foreground">
              Recognition is how the protocol remembers contribution — across axes, by proof,
              never as a price.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Connect CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <ConnectForPersonalCta surfaceId="recognition" />
      </motion.div>
    </div>
  );
}
