import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MOCK_DATA } from "@/lib/mock-data";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Banknote, ArrowLeftRight, History, GitBranch, Milestone, ExternalLink, FileText, Anchor, Activity as ActivityIcon, Share2 } from "lucide-react";
import { ShareDialog, type SharePayload } from "@/components/share-dialog";

const PROOF_ACCENT: Record<string, SharePayload["accent"]> = {
  "On-chain": "blue",
  "ERC-1155": "violet",
  "Internal": "amber",
  "Protocol": "emerald",
};

const TYPE_META: Record<string, { label: string; icon: any; tint: string }> = {
  membership: { label: "Membership", icon: Banknote, tint: "text-green-400 bg-green-500/10 border-green-500/20" },
  routing: { label: "Routing", icon: ArrowLeftRight, tint: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  archive: { label: "Archive", icon: History, tint: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  source: { label: "Source Attribution", icon: GitBranch, tint: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  milestone: { label: "Milestone", icon: Milestone, tint: "text-primary bg-primary/10 border-primary/20" },
};

// Proof-type styling for the inline badge on each feed row. Proof values come from
// MOCK_DATA.activities (On-chain / ERC-1155 / Internal / Protocol). All simulated.
const PROOF_META: Record<string, string> = {
  "On-chain": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "ERC-1155": "text-violet-400 bg-violet-500/10 border-violet-500/20",
  "Internal": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Protocol": "text-primary bg-primary/10 border-primary/20",
};

// Events of type archive/milestone become permanent institutional memory;
// routing/membership/source events are transient activity. Derived from `type` only.
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

export default function ActivityPage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const filteredActivities = MOCK_DATA.activities.filter(
    (act) => filter === "all" || act.type === filter
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Protocol Activity</h1>
          <p className="text-muted-foreground mt-1">
            The protocol heartbeat — every movement is recorded and verifiable. Read-only proof, not a return promise.
          </p>
        </div>
        <StatusBadge status="READ-ONLY" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Events Recorded</div>
            <div className="text-2xl font-bold font-mono">{MOCK_DATA.activities.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">My USDC Routed</div>
            <div className="text-2xl font-bold font-mono">{MOCK_DATA.usdcRouted}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Milestones</div>
            <div className="text-2xl font-bold font-mono">
              {MOCK_DATA.activities.filter((a) => a.type === "milestone").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Chapter</div>
            <div className="text-base font-bold mt-1">{MOCK_DATA.chapter}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
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
      </div>

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
                  className="relative pl-8 cursor-pointer group"
                  onClick={() => setSelectedEvent(act)}
                  data-testid={`activity-${act.id}`}
                >
                  <div
                    className={cn(
                      "absolute left-[-13px] top-1 w-6 h-6 rounded-full border flex items-center justify-center group-hover:scale-110 transition-transform bg-background",
                      meta.tint
                    )}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                  <div
                    className={cn(
                      "p-4 bg-background/50 border rounded-xl hover:border-primary/50 transition-colors",
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
                        data-testid={`activity-proof-${act.id}`}
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
                        data-testid={`activity-memory-${act.id}`}
                        title={
                          memory
                            ? "This event becomes permanent institutional memory."
                            : "Transient protocol activity."
                        }
                      >
                        <MemoryIcon className="w-3 h-3" />
                        {memory ? "Anchored to memory" : "Activity"}
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-wider rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-500 px-2 py-0.5"
                        data-testid={`activity-simulated-${act.id}`}
                        title="Simulated prototype data — not real on-chain truth."
                      >
                        Simulated
                      </span>
                      <span className="ml-auto" onClick={(e) => e.stopPropagation()}>
                        <ShareDialog
                          payload={{
                            eyebrow: meta.label,
                            title: act.title,
                            summary: act.value,
                            accent: PROOF_ACCENT[act.proof] ?? "blue",
                            routing: act.type === "routing",
                            lines: [
                              { label: "Proof", value: act.proof },
                              { label: "Date", value: act.date },
                            ],
                            shareText: `Witnessed on The Syndicate: ${act.title} (${act.value}). A living on-chain institution, recorded in public.`,
                          }}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                              data-testid={`activity-share-${act.id}`}
                            >
                              <Share2 className="w-3 h-3" /> Share
                            </Button>
                          }
                        />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <SheetContent className="bg-card/95 border-l-white/10 backdrop-blur-xl">
          <SheetHeader>
            <SheetTitle>Event Details</SheetTitle>
          </SheetHeader>
          {selectedEvent && (
            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full border px-2 py-0.5",
                    isMemoryEvent(selectedEvent.type)
                      ? "text-violet-400 border-violet-500/20 bg-violet-500/10"
                      : "text-muted-foreground border-white/10 bg-white/5"
                  )}
                  data-testid="detail-memory"
                >
                  {isMemoryEvent(selectedEvent.type) ? (
                    <Anchor className="w-3 h-3" />
                  ) : (
                    <ActivityIcon className="w-3 h-3" />
                  )}
                  {isMemoryEvent(selectedEvent.type) ? "Anchored to memory" : "Activity"}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-500 px-2 py-0.5"
                  data-testid="detail-simulated"
                >
                  Simulated
                </span>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Event</div>
                  <div className="font-bold">{selectedEvent.title}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isMemoryEvent(selectedEvent.type)
                      ? "This event becomes permanent institutional memory."
                      : "Transient protocol activity in the heartbeat feed."}
                  </p>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Value</div>
                  <div className="font-mono">{selectedEvent.value}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Type</div>
                    <div className="capitalize">{TYPE_META[selectedEvent.type]?.label ?? selectedEvent.type}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Proof</div>
                    <div>{selectedEvent.proof}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Time</div>
                  <div>{selectedEvent.date}</div>
                </div>
                {selectedEvent.hash && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Transaction <span className="text-orange-500/80">(simulated)</span>
                    </div>
                    <div className="font-mono text-xs text-primary/80 break-all">{selectedEvent.hash}</div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button className="w-full" variant="outline" disabled={!selectedEvent.hash}>
                  <ExternalLink className="w-4 h-4 mr-2" /> View on Explorer
                </Button>
                <Button className="w-full" variant="outline" disabled={!selectedEvent.hash}>
                  <FileText className="w-4 h-4 mr-2" /> View Receipt
                </Button>
                <p className="text-[10px] text-center text-muted-foreground pt-1">
                  Simulated prototype. Explorer and receipt links are illustrative.
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
