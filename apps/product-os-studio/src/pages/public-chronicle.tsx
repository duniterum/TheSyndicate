import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { BookMarked, Scroll, Activity, Box, Share2 } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";
import { PublicProofNote, ConnectForPersonalCta } from "@/components/connect-cta";
import {
  getChronicleCanon,
  getActivityOnly,
} from "@/lib/protocol-graph";

export default function PublicChronicle() {
  const canon = getChronicleCanon();
  const activityOnly = getActivityOnly();

  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl space-y-8" data-testid="page-public-chronicle">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Chronicle</h1>
        <StatusBadge status="READ-ONLY" />
      </div>
      
      <PublicProofNote surfaceId="chronicle" />
      
      <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
        The curated canon of The Syndicate. Not every event — only the moments that became
        institutional history. Selective by design, requiring an internal operator review process.
      </p>

      {/* Distinction notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-lg shrink-0"><BookMarked className="w-4 h-4 text-primary" /></div>
              <div>
                <div className="text-sm font-bold">Chronicle is the canon</div>
                <p className="text-xs text-muted-foreground mt-1">A small, deliberate record of what mattered. Requires internal review.</p>
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
      <div className="space-y-8 pt-4">
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
            </div>
          ))}
        </div>
      </motion.div>
      
      <ConnectForPersonalCta surfaceId="chronicle" />
    </div>
  );
}
