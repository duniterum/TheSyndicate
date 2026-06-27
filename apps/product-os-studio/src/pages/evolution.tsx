import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Database, Activity, Target, Zap, Hexagon, Circle, CheckCircle2, MonitorSmartphone, Archive, Share2 } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";

const EPISODES = [
  {
    id: "ep1",
    era: "Genesis",
    date: "January 2024",
    title: "Membership V3 Engine",
    description: "Deployment of the core Membership V3 engine. SYN acquisition accounting begins.",
    status: "LIVE NOW" as const,
    becameTrue: "Membership layer activated. Seat-based membership accounting enabled.",
    proof: {
      type: "Contract",
      label: "MembershipSaleV3 (simulated address)",
      url: "#"
    },
    icon: Database
  },
  {
    id: "ep2",
    era: "Transparency",
    date: "February 2024",
    title: "Activity & Transparency",
    description: "The protocol learns to speak. Real-time feeds of capital routing and member entry become visible.",
    status: "LIVE NOW" as const,
    becameTrue: "All system actions indexable and publicly verifiable.",
    proof: {
      type: "Indexer",
      label: "Activity Subgraph",
      url: "/member/transparency"
    },
    icon: Activity
  },
  {
    id: "ep3",
    era: "Interface",
    date: "Current Cycle",
    title: "Home / Member App Prototype",
    description: "The dashboard of the institution. A unified surface for members to monitor the protocol.",
    status: "SIMULATED PROTOTYPE" as const,
    becameTrue: "A single place for members to act on the protocol.",
    proof: {
      type: "Application",
      label: "Member Home",
      url: "/member"
    },
    icon: MonitorSmartphone
  },
  {
    id: "ep4",
    era: "Attribution",
    date: "Current Cycle",
    title: "Source Attribution",
    description: "Recognizing how capital flows into the protocol. Testing internal tracking before public rollout.",
    status: "IN REVIEW" as const,
    becameTrue: "Internal capability to attribute entries to their originating source.",
    proof: {
      type: "Prototype",
      label: "SourceRegistryV1",
      url: "#"
    },
    icon: Target
  },
  {
    id: "ep5",
    era: "Acquisition",
    date: "Next Candidate",
    title: "Verified Introduction",
    description: "Source-aware membership acquisition. Rewarding members for aligned introductions.",
    status: "V1 CANDIDATE" as const,
    becameTrue: "Publicly verifiable introduction paths with transparent source attribution.",
    proof: {
      type: "Preview",
      label: "Referral UI",
      url: "/member/referral"
    },
    icon: Zap
  },
  {
    id: "ep6",
    era: "Identity",
    date: "Future Cycle",
    title: "SeatRecord Serialization",
    description: "Migrating the binary state of membership into a portable ERC721 SeatRecord.",
    status: "FUTURE" as const,
    becameTrue: "Identity detached from the internal registry, becoming an independent standard.",
    proof: {
      type: "Draft",
      label: "EIP-721 Spec",
      url: "#"
    },
    icon: Hexagon
  },
  {
    id: "ep7",
    era: "Memory",
    date: "Future Cycle",
    title: "Archive / NFT Evolution",
    description: "Anchoring historical artifacts that serve as proof of early alignment.",
    status: "FUTURE" as const,
    becameTrue: "Immutable memory structures for protocol contributors.",
    proof: {
      type: "Draft",
      label: "EIP-1155 Spec",
      url: "#"
    },
    icon: Archive
  }
];

const MODULES = {
  live: ["MembershipSaleV3", "SYN Token", "Activity Feed", "Archive1155"],
  review: ["SourceRegistryV1", "Vault Router", "Protocol Metrics"],
  future: ["SeatRecord721", "Verified Introduction UI", "ProductSaleRouter", "SwapRail"],
  blocked: ["Fiat Onramp Integration", "Cross-chain Settlement"]
};

export default function Evolution() {
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
          <h1 className="text-4xl font-bold tracking-tight mb-2">Evolution</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            The Syndicate is an unfolding series. Watch the protocol mature as new capabilities transition from concept to immutable reality.
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status="READ-ONLY" />
        </div>
      </motion.div>

      {/* Narrative Timeline (Episodes) */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Hexagon className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">The Series</h2>
        </div>

        <div className="relative border-l-2 border-white/10 ml-6 md:ml-8 space-y-12 pb-8">
          {EPISODES.map((ep, index) => {
            const isLive = ep.status === "LIVE NOW";
            return (
              <motion.div 
                key={ep.id}
                className="relative pl-8 md:pl-12"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Timeline node */}
                <div className={`absolute -left-[21px] top-1 w-10 h-10 rounded-full border-4 border-background flex items-center justify-center ${isLive ? 'bg-primary' : 'bg-muted'}`}>
                  {isLive ? <CheckCircle2 className="w-5 h-5 text-background" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-primary uppercase tracking-wider">{ep.era}</span>
                        <span className="text-sm text-muted-foreground">• {ep.date}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold">{ep.title}</h3>
                        <StatusBadge status={ep.status} />
                        <ShareDialog
                          payload={{
                            eyebrow: `Evolution · ${ep.era}`,
                            title: ep.title,
                            summary: ep.becameTrue,
                            accent: isLive ? "emerald" : "blue",
                            badge: ep.status,
                            lines: [
                              { label: "Era", value: ep.era },
                              { label: "Status", value: ep.status },
                            ],
                            shareText: `An episode in The Syndicate's evolution: ${ep.title}. ${ep.becameTrue}. Watch a living protocol move in public.`,
                          }}
                          trigger={
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" data-testid={`evolution-share-${ep.id}`}>
                              <Share2 className="w-3.5 h-3.5" /> Share
                            </Button>
                          }
                        />
                      </div>
                      <p className="text-muted-foreground">{ep.description}</p>
                    </div>

                    <Card className="bg-white/5 border-white/10 shadow-none">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">What Became True</div>
                          <div className="text-sm font-medium">{ep.becameTrue}</div>
                        </div>
                        {ep.proof && (
                          <div className="shrink-0 text-left sm:text-right">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Proof: {ep.proof.type}</div>
                            {ep.proof.url !== "#" ? (
                              <Link href={ep.proof.url} className="inline-flex items-center text-sm text-primary hover:underline font-mono">
                                {ep.proof.label} <ExternalLink className="w-3 h-3 ml-1" />
                              </Link>
                            ) : (
                              <span className="inline-flex items-center text-sm text-muted-foreground font-mono">
                                {ep.proof.label}
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Module Matrix */}
      <motion.div 
        className="space-y-8 pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Module Timeline</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* LIVE NOW */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm flex items-center justify-between">
                Production
                <StatusBadge status="LIVE NOW" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {MODULES.live.map(m => (
                <div key={m} className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {m}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* IN REVIEW */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm flex items-center justify-between">
                Testing
                <StatusBadge status="IN REVIEW" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {MODULES.review.map(m => (
                <div key={m} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  {m}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* FUTURE */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm flex items-center justify-between">
                Roadmap
                <StatusBadge status="FUTURE" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {MODULES.future.map(m => (
                <div key={m} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                  {m}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* BLOCKED */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm flex items-center justify-between">
                Impeded
                <StatusBadge status="BLOCKED NOW" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {MODULES.blocked.map(m => (
                <div key={m} className="flex items-center gap-2 text-sm font-medium text-muted-foreground line-through opacity-70">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {m}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Candidate Focus */}
      <motion.div
        className="pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Zap className="w-64 h-64 text-primary" />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl space-y-4">
                <div className="flex gap-2">
                  <StatusBadge status="V1 CANDIDATE" />
                  <StatusBadge status="SIMULATED PROTOTYPE" />
                </div>
                <h3 className="text-2xl font-bold text-primary">Next Candidate: Verified Introduction</h3>
                <p className="text-muted-foreground">
                  A source-aware membership acquisition protocol. When live, it will allow approved members to route new entrants into the system with full on-chain attribution. You can preview the simulated UI prototype now.
                </p>
              </div>
              <div className="shrink-0">
                <Link href="/member/referral">
                  <Button size="lg" className="shadow-xl">
                    Open the Prototype
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}
