import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConnectForPersonalCta, PublicProofNote } from "@/components/connect-cta";
import { MOCK_DATA } from "@/lib/mock-data";
import { getPublicHeartbeat } from "@/lib/protocol-graph";
import { cn } from "@/lib/utils";
import {
  Banknote,
  ArrowLeftRight,
  History,
  GitBranch,
  Milestone,
  Anchor,
  Activity as ActivityIcon,
} from "lucide-react";

const TYPE_META: Record<string, { label: string; icon: any; tint: string }> = {
  membership: { label: "Membership", icon: Banknote, tint: "text-green-400 bg-green-500/10 border-green-500/20" },
  routing: { label: "Routing", icon: ArrowLeftRight, tint: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  archive: { label: "Archive", icon: History, tint: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  source: { label: "Source Attribution", icon: GitBranch, tint: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  milestone: { label: "Milestone", icon: Milestone, tint: "text-primary bg-primary/10 border-primary/20" },
};

const PROOF_META: Record<string, string> = {
  "On-chain": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "ERC-1155": "text-violet-400 bg-violet-500/10 border-violet-500/20",
  "Internal": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Protocol": "text-primary bg-primary/10 border-primary/20",
};

function isMemoryEvent(type: string) {
  return type === "archive" || type === "milestone";
}

const FILTERS = [
  { value: "all", label: "All Events" },
  { value: "membership", label: "Membership" },
  { value: "routing", label: "Routing" },
  { value: "archive", label: "Archive" },
  { value: "source", label: "Source" },
  { value: "milestone", label: "Milestones" },
];

export default function PublicActivityPage() {
  const [filter, setFilter] = useState("all");

  const heartbeat = getPublicHeartbeat();
  const filteredActivities = heartbeat.filter(
    (act) => filter === "all" || act.type === filter
  );

  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl space-y-8" data-testid="page-public-activity">
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Activity</h1>
            <StatusBadge status="READ-ONLY" />
          </div>
        </div>
        <PublicProofNote surfaceId="activity" />
        <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
          The protocol heartbeat — every movement is recorded and verifiable. Read-only proof, not a return promise.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Events Recorded</div>
            <div className="text-2xl font-bold font-mono">{heartbeat.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Protocol USDC Routed</div>
            <div className="text-2xl font-bold font-mono">
              <span className="text-orange-500/80 mr-2 text-sm uppercase tracking-wider">Simulated</span>
              {MOCK_DATA.protocolStats.usdcRouted.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Milestones</div>
            <div className="text-2xl font-bold font-mono">
              {heartbeat.filter((a) => a.type === "milestone").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Chapter</div>
            <div className="text-base font-bold mt-1 truncate">{MOCK_DATA.chapter}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            data-testid={`filter-${f.value}`}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              filter === f.value
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-white/5 text-muted-foreground border-white/10 hover:text-foreground hover:border-white/20"
            )}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>Live Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-white/10 ml-3 space-y-6">
              {filteredActivities.map((act) => {
                const meta = TYPE_META[act.type] ?? TYPE_META.routing;
                const Icon = meta.icon;
                const isMilestone = act.type === "milestone";
                const memory = isMemoryEvent(act.type);
                const proofTint = PROOF_META[act.proof] ?? "text-muted-foreground border-white/10 bg-white/5";
                const MemoryIcon = memory ? Anchor : ActivityIcon;
                return (
                  <div
                    key={act.id}
                    className="relative pl-8 group"
                    data-testid={`activity-${act.id}`}
                  >
                    <div
                      className={cn(
                        "absolute left-[-13px] top-1 w-6 h-6 rounded-full border flex items-center justify-center bg-background",
                        meta.tint
                      )}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <div
                      className={cn(
                        "p-4 bg-background/50 border rounded-xl",
                        isMilestone ? "border-primary/30" : "border-white/5"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2 gap-3">
                        <div className="font-medium">{act.title}</div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{act.date}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground">{act.value}</span>
                        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", meta.tint)}>
                          {meta.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] uppercase tracking-wider", proofTint)}
                        >
                          {act.proof}
                        </Badge>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full border px-2 py-0.5",
                            memory
                              ? "text-violet-400 border-violet-500/20 bg-violet-500/10"
                              : "text-muted-foreground border-white/10 bg-white/5"
                          )}
                        >
                          <MemoryIcon className="w-3 h-3" />
                          {memory ? "Anchored to memory" : "Activity"}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-500 px-2 py-0.5">
                          Simulated
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ConnectForPersonalCta surfaceId="activity" />
      </motion.div>
    </div>
  );
}
