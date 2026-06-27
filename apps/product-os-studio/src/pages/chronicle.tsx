import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookMarked, Scroll, Activity, ShieldCheck, Box, ArrowRight, Share2, Sparkles } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";
import {
  getChronicleCanon,
  getChronicleEligible,
  getActivityOnly,
} from "@/lib/protocol-graph";

const HOW_CANON = [
  { step: "Event", detail: "A verifiable signal occurs and enters Activity.", surface: "/member/activity" },
  { step: "Candidate", detail: "It is classified as historically meaningful — most events are not.", surface: "/member/graph" },
  { step: "Founder Review", detail: "An operator decides whether it belongs in the institutional canon.", surface: "/member/founder-review" },
  { step: "Canon", detail: "Approved history is preserved here, permanently and selectively.", surface: "/member/chronicle" },
];

export default function Chronicle() {
  const canon = getChronicleCanon();
  const eligible = getChronicleEligible();
  const activityOnly = getActivityOnly();

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Chronicle</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            The curated canon of The Syndicate. Not every event — only the moments that became
            institutional history. Selective by design, and never automatic.
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status="READ-ONLY" />
        </div>
      </motion.div>

      {/* Distinction notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-lg shrink-0"><Activity className="w-4 h-4 text-primary" /></div>
              <div>
                <div className="text-sm font-bold">Activity is the heartbeat</div>
                <p className="text-xs text-muted-foreground mt-1">Every verifiable event, unfiltered. Read-only, never curated.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-lg shrink-0"><BookMarked className="w-4 h-4 text-primary" /></div>
              <div>
                <div className="text-sm font-bold">Chronicle is the canon</div>
                <p className="text-xs text-muted-foreground mt-1">A small, deliberate record of what mattered. Founder-approved only.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-lg shrink-0"><Box className="w-4 h-4 text-primary" /></div>
              <div>
                <div className="text-sm font-bold">Archive is the memory</div>
                <p className="text-xs text-muted-foreground mt-1">Canon can be anchored as a permanent object — memory, not financial rights.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* The Canon */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Scroll className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">The Canon</h2>
          <span className="text-sm text-muted-foreground">{canon.length} entries</span>
        </div>

        <div className="relative border-l-2 border-white/10 ml-6 md:ml-8 space-y-12 pb-8">
          {canon.map((entry, index) => (
            <motion.div
              key={entry.id}
              className="relative pl-8 md:pl-12"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="absolute -left-[21px] top-1 w-10 h-10 rounded-full border-4 border-background flex items-center justify-center bg-primary font-mono text-sm font-bold text-background">
                {entry.index}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-primary uppercase tracking-wider">{entry.era}</span>
                  <span className="text-sm text-muted-foreground">• {entry.date}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-bold">{entry.title}</h3>
                  {entry.becameMemory && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-violet-400 border border-violet-500/30 bg-violet-500/10 rounded px-2 py-0.5 font-mono">
                      <Box className="w-3 h-3" /> Anchored to memory
                    </span>
                  )}
                  <StatusBadge status="SIMULATED PROTOTYPE" />
                  <ShareDialog
                    payload={{
                      eyebrow: `Chronicle · Canon #${entry.index}`,
                      title: entry.title,
                      summary: entry.canon,
                      accent: "violet",
                      badge: "CONCEPT ONLY",
                      lines: [
                        { label: "Era", value: entry.era },
                        { label: "Date", value: entry.date },
                      ],
                      shareText: `From The Syndicate's chronicle — ${entry.title}. ${entry.canon} A living institution, recorded in public.`,
                    }}
                    trigger={
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" data-testid={`chronicle-share-${entry.id}`}>
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </Button>
                    }
                  />
                </div>
                <p className="text-muted-foreground max-w-3xl leading-relaxed font-serif text-lg">{entry.canon}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Eligible for canon */}
      <motion.div
        className="space-y-6 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Eligible for Canon</h2>
          <StatusBadge status="IN REVIEW" />
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Historically meaningful and awaiting an operator decision. Eligibility is not entry —
          nothing becomes canon without founder review.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eligible.map((entry) => (
            <Card key={entry.id} className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-primary uppercase tracking-wider">{entry.era} · {entry.date}</span>
                  {entry.becameMemory && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-violet-400 font-mono">
                      <Box className="w-3 h-3" /> Memory
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold">{entry.title}</div>
                <p className="text-sm text-muted-foreground">{entry.canon}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Activity only — never canon */}
      <motion.div
        className="space-y-6 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-white/5 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-muted-foreground">Heartbeat Only — Never Canon</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          These are real and important in Activity, but they are not institutional history.
          Showing them here is the point: the Chronicle stays selective.
        </p>
        <div className="space-y-2">
          {activityOnly.map((entry) => (
            <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-4 bg-white/5 border border-white/10 rounded-lg">
              <div>
                <div className="text-sm font-medium">{entry.title}</div>
                <div className="text-xs text-muted-foreground">{entry.canon}</div>
              </div>
              <Link href="/member/activity" className="text-xs text-primary hover:underline whitespace-nowrap shrink-0">
                See in Activity
              </Link>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How canon is made */}
      <motion.div
        className="pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">How canon is made</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {HOW_CANON.map((s, i) => (
                <div key={s.step} className="relative">
                  <Link href={s.surface} className="block p-4 bg-background/40 border border-white/5 rounded-lg h-full hover:border-primary/40 transition-colors">
                    <div className="text-xs font-mono text-primary uppercase tracking-wider mb-1">{s.step}</div>
                    <p className="text-xs text-muted-foreground">{s.detail}</p>
                  </Link>
                  {i < HOW_CANON.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
