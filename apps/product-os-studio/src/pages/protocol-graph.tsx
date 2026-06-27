import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ShareDialog } from "@/components/share-dialog";
import { cn } from "@/lib/utils";
import {
  Network,
  Zap,
  Activity,
  GitBranch,
  History,
  Share2,
  Shield,
  Globe,
  GitCommit,
  BookMarked,
  Archive,
  Award,
  Database,
  ArrowRight,
  ChevronRight,
  Flame,
} from "lucide-react";
import {
  PIPELINE,
  CLASSIFICATIONS,
  PROTOCOL_EVENTS,
  getPendingCandidateCount,
  type DataSource,
  type PipelineStage,
  type Classification,
  type FounderDecision,
} from "@/lib/protocol-graph";

// ---- Source / truth posture tag (canonical | simulated | future) -----------
const SOURCE_LABEL: Record<DataSource, string> = {
  canonical: "Canonical",
  simulated: "Simulated",
  future: "Future",
};

const SOURCE_STYLE: Record<DataSource, string> = {
  canonical: "bg-green-500/10 text-green-500 border-green-500/20",
  simulated: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  future: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
};

function SourceTag({ source, className }: { source: DataSource; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap",
        SOURCE_STYLE[source],
        className
      )}
    >
      {SOURCE_LABEL[source]}
    </span>
  );
}

// ---- Per-stage iconography -------------------------------------------------
const STAGE_ICON: Record<PipelineStage, typeof Zap> = {
  "raw-event": Zap,
  activity: Activity,
  candidate: GitBranch,
  memory: History,
  share: Share2,
  "founder-review": Shield,
  "public-update": Globe,
};

const CLASSIFICATION_ICON: Record<Classification, typeof Zap> = {
  recognition: Award,
  evolution: GitCommit,
  chronicle: BookMarked,
  archive: Archive,
  share: Share2,
  fire: Flame,
};

const FOUNDER_LABEL: Record<FounderDecision, string> = {
  "n/a": "No founder gate",
  pending: "In founder review",
  approved: "Founder approved",
  declined: "Declined",
  never: "Heartbeat only",
};

// The five organ distinctions — deliberately NOT the same thing.
const ORGANS: {
  name: string;
  role: string;
  detail: string;
  surface: string;
  icon: typeof Zap;
}[] = [
  {
    name: "Activity",
    role: "Heartbeat",
    detail: "Every verifiable event, read-only and uncurated. The pulse, not the story.",
    surface: "/member/activity",
    icon: Activity,
  },
  {
    name: "Evolution",
    role: "Series",
    detail: "Module progression over time — what crossed a state boundary and became true.",
    surface: "/member/evolution",
    icon: GitCommit,
  },
  {
    name: "Chronicle",
    role: "Canon",
    detail: "Curated institutional history. Selective, founder-gated. Most events never qualify.",
    surface: "/member/chronicle",
    icon: BookMarked,
  },
  {
    name: "Archive",
    role: "Memory",
    detail: "Permanent memory objects (ERC-1155). Memory, never financial rights.",
    surface: "/member/archive",
    icon: History,
  },
  {
    name: "Registry",
    role: "Proof",
    detail: "Contract truth — the raw signals and module states everything else reads from.",
    surface: "/member/registry",
    icon: Database,
  },
];

export default function ProtocolGraph() {
  const pendingCount = getPendingCandidateCount();

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
          <h1 className="text-4xl font-bold tracking-tight mb-2">Protocol Graph</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            How one signal travels end to end. A single protocol event can move from a raw signal all
            the way to public, shareable memory — this map shows every step, where it surfaces, and what
            is canonical, simulated, or still to come.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <StatusBadge status="READ-ONLY" />
          <ShareDialog
            payload={{
              eyebrow: "The Syndicate · Protocol Graph",
              title: "How a signal moves through the protocol",
              summary:
                "How one protocol signal becomes recognition, evolution, canon, memory, and public truth.",
              accent: "violet",
              badge: "READ-ONLY",
              lines: [
                { label: "Backbone", value: "Raw Event → Public Update" },
                { label: "Branches", value: `${CLASSIFICATIONS.length} classifications` },
              ],
              shareText:
                "One protocol signal flows from a raw event, through founder review, into recognition, canon, and memory. See how every part of The Syndicate connects.",
            }}
            trigger={
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" data-testid="graph-share">
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>
            }
          />
        </div>
      </motion.div>

      {/* Truth posture legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground"
      >
        <span className="font-medium text-foreground">Truth posture:</span>
        <span className="flex items-center gap-2"><SourceTag source="canonical" /> accurate to the repo</span>
        <span className="flex items-center gap-2"><SourceTag source="simulated" /> prototype instance</span>
        <span className="flex items-center gap-2"><SourceTag source="future" /> scoped, not live</span>
      </motion.div>

      {/* The Backbone */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Network className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">The Backbone</h2>
        </div>

        <div className="relative border-l-2 border-white/10 ml-6 md:ml-8 space-y-8 pb-2">
          {PIPELINE.map((node, index) => {
            const Icon = STAGE_ICON[node.stage];
            const isCandidate = node.stage === "candidate";
            return (
              <motion.div
                key={node.stage}
                className="relative pl-8 md:pl-12"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                {/* Backbone node */}
                <div className="absolute -left-[21px] top-1 w-10 h-10 rounded-full border-4 border-background bg-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>

                <Link href={node.surface}>
                  <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors cursor-pointer group" data-testid={`graph-stage-${node.stage}`}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                          Step {index + 1}
                        </span>
                        <h3 className="text-xl font-bold">{node.title}</h3>
                        <SourceTag source={node.source} />
                      </div>
                      <p className="text-muted-foreground text-sm">{node.subtitle}</p>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <span className="text-xs text-muted-foreground">
                          Organ: <span className="text-foreground font-medium">{node.organ}</span>
                        </span>
                        <span className="inline-flex items-center text-sm text-primary font-mono group-hover:underline">
                          {node.surface}
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </span>
                      </div>
                      {isCandidate && (
                        <div className="text-xs text-muted-foreground border-t border-white/10 pt-3">
                          This is where the signal branches.{" "}
                          <span className="text-foreground font-medium">{pendingCount}</span> candidate
                          {pendingCount === 1 ? "" : "s"} currently awaiting a founder decision.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Branch Classifications */}
      <motion.div
        className="space-y-8 pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <GitBranch className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Branch Classifications</h2>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl -mt-4">
          Not everything reaches every later stage. At Candidate Review a signal is classified —
          and most events stay heartbeat only.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLASSIFICATIONS.map((c, index) => {
            const Icon = CLASSIFICATION_ICON[c.key];
            return (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link href={c.surface}>
                  <Card className="h-full bg-white/5 border-white/10 hover:border-primary/50 transition-colors cursor-pointer group" data-testid={`graph-branch-${c.key}`}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <SourceTag source={c.source} />
                      </div>
                      <h3 className="text-lg font-bold">{c.title}</h3>
                      <p className="text-muted-foreground text-sm">{c.rule}</p>
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-muted-foreground">
                          Organ: <span className="text-foreground font-medium">{c.organ}</span>
                        </span>
                        <span className="inline-flex items-center text-primary font-mono group-hover:underline">
                          {c.surface}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Signals in Motion */}
      <motion.div
        className="space-y-8 pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Signals in Motion</h2>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl -mt-4">
          Simulated events currently travelling the graph. Each ties back to the Activity heartbeat
          and shows how far it has reached and whether it cleared the founder gate.
        </p>

        <div className="space-y-3">
          {PROTOCOL_EVENTS.map((evt, index) => {
            const StageIcon = STAGE_ICON[evt.stage];
            const stageNode = PIPELINE.find((p) => p.stage === evt.stage);
            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors" data-testid={`graph-event-${evt.id}`}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold">{evt.title}</h3>
                          <SourceTag source={evt.source} />
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{evt.origin}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                        <StageIcon className="w-3.5 h-3.5 text-primary" />
                        Reached: <span className="text-foreground font-medium">{stageNode?.title ?? evt.stage}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{evt.note}</p>

                    <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                      {evt.classifications.length > 0 ? (
                        evt.classifications.map((key) => {
                          const def = CLASSIFICATIONS.find((c) => c.key === key);
                          const Icon = CLASSIFICATION_ICON[key];
                          return (
                            <Link key={key} href={def?.surface ?? "#"}>
                              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer">
                                <Icon className="w-3 h-3" />
                                {def?.organ ?? key}
                              </span>
                            </Link>
                          );
                        })
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No branches — pure heartbeat.
                        </span>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="w-3 h-3 text-primary" />
                        {FOUNDER_LABEL[evt.founderDecision]}
                      </span>
                      {typeof evt.activityRef === "number" && (
                        <Link href="/member/activity">
                          <span className="inline-flex items-center text-xs text-primary font-mono hover:underline cursor-pointer">
                            Activity #{evt.activityRef}
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Organ Distinctions */}
      <motion.div
        className="space-y-8 pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Network className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Organ Distinctions</h2>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl -mt-4">
          These parts are deliberately not the same thing. Confusing them collapses the model.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ORGANS.map((organ, index) => {
            const Icon = organ.icon;
            return (
              <motion.div
                key={organ.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link href={organ.surface}>
                  <Card className="h-full bg-white/5 border-white/10 hover:border-primary/50 transition-colors cursor-pointer group" data-testid={`graph-organ-${organ.name.toLowerCase()}`}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold leading-tight">{organ.name}</h3>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                            {organ.role}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">{organ.detail}</p>
                      <div className="flex items-center justify-end pt-1">
                        <span className="inline-flex items-center text-xs text-primary font-mono group-hover:underline">
                          {organ.surface}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
