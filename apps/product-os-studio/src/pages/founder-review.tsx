import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  GitCommit, Activity, Server, ShieldCheck, AlertCircle, CheckCircle2, 
  Clock, GitPullRequest, ShieldAlert, ArrowRight, Play, Pause, 
  CheckSquare, FileTerminal, SearchCode, Database, Key, Users, 
  Lock, EyeOff, Shield, Link2, GitBranch, Megaphone, Send, Radio,
  FileText, GitMerge, Share2, Network, ListChecks, FlaskConical, Ban, History, Copy, Flame
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { getFounderQueues, getPendingCandidateCount, getTruthDrift, getTruthDriftSummary } from "@/lib/protocol-graph";
import { MOCK_DATA } from "@/lib/mock-data";
import { BRAND } from "@/lib/brand";
import { ProductionAuthNote } from "@/components/production-auth-note";
import { ActionCard } from "@/components/action-card";
import { getActionsByCategory } from "@/lib/actions";
import { getBurnSummary } from "@/lib/fire-ledger";

const COMMS_DRAFTS = [
  {
    name: "Generate X Post",
    label: "X post",
    icon: Share2,
    text: `X POST (DRAFT — not posted)\n\nThe Syndicate is a living on-chain institution that recognizes capital without reducing identity to capital.\n\nEvery membership routes transparently: 70% Vault / 20% Liquidity / 10% Operations.\n\nA seat is memory, not a financial product.\n\nthesyndicate.money`,
  },
  {
    name: "Generate Telegram Post",
    label: "Telegram post",
    icon: Send,
    text: `TELEGRAM POST (DRAFT — not posted)\n\nChapter update — The Syndicate is forming in public.\n\n- Membership routing holds the canonical 70% / 20% / 10% split\n- Default attribution: ZERO_SOURCE_ID (no public referral link)\n- Archive artifacts are memory, not financial rights\n\nWitness the protocol move: t.me/TheSyndicateMoney`,
  },
  {
    name: "Generate Release Note",
    label: "Release note",
    icon: FileText,
    text: `RELEASE NOTE (DRAFT)\n\nModule: Membership V3 Engine\nStatus: LIVE NOW\n\nWhat became true:\n- Seats issued with verifiable membership receipts\n- Routing reconciles to 70% Vault / 20% Liquidity / 10% Operations\n\nNot live: secondary market, public referral claim UI, dynamic OG generation.\n\nNo financial advice. Figures simulated in prototype.`,
  },
  {
    name: "Generate Episode Announcement",
    label: "Episode announce",
    icon: GitMerge,
    text: `EPISODE ANNOUNCEMENT (DRAFT)\n\nThe series continues. A new episode in The Syndicate's evolution is live.\n\nThe protocol moved — and it was witnessed. Watch a living institution evolve in public, recorded step by step.\n\nNo hype. No scarcity. Just the institution, moving.`,
  },
  {
    name: "Generate Press Update",
    label: "Press update",
    icon: Radio,
    text: `PRESS UPDATE (DRAFT)\n\nThe Syndicate — a membership-based on-chain institution — continues forming in public.\n\nCore facts:\n- Routing: 70% Vault / 20% Liquidity / 10% Operations\n- Seat: membership and place; no financial rights\n- Channels: thesyndicate.money, x.com/TheSyndicateOne, t.me/TheSyndicateMoney\n\nFull brand kit and approved language: /press`,
  },
  {
    name: "Prepare Proof Card",
    label: "Proof-card prep",
    icon: Megaphone,
    text: `PROOF CARD PREP (DRAFT)\n\nUse the Proof & Share Center (/share) to generate a card for:\n- Member seat\n- Membership receipt (with 70% / 20% / 10% routing)\n- Chapter progress\n- Protocol routing totals\n- Archive memory\n- Evolution episode\n\nAll cards are prototype previews from simulated data. No OG image is generated and nothing is posted.`,
  },
];

const PRODUCTION_STATE = {
  commit: "a7f9b2c",
  deployed: "14 mins ago",
  branch: "main",
  env: "production (simulated)",
  health: "All systems nominal",
  blockHeight: "41,209,481",
  syncStatus: "Synced",
};

const MODULES = [
  { 
    name: "Membership V3 Engine", 
    status: "LIVE NOW" as const, 
    visibility: "Public", 
    readiness: "100%",
    gates: [
      { name: "Contract Audit", status: "met" },
      { name: "Frontend E2E", status: "met" }
    ]
  },
  { 
    name: "Activity & Transparency", 
    status: "LIVE NOW" as const, 
    visibility: "Public", 
    readiness: "100%",
    gates: [
      { name: "Indexer Sync", status: "met" },
      { name: "Event Subscriptions", status: "met" }
    ]
  },
  { 
    name: "Source Attribution", 
    status: "IN REVIEW" as const, 
    visibility: "Hidden", 
    readiness: "80%",
    gates: [
      { name: "Contract Audit", status: "unmet" },
      { name: "Compliance Review", status: "unmet" },
      { name: "Frontend E2E", status: "met" }
    ]
  },
  { 
    name: "SeatRecord721", 
    status: "FUTURE" as const, 
    visibility: "Not Deployed", 
    readiness: "10%",
    gates: [
      { name: "Tokenomics Approval", status: "unmet" },
      { name: "Migration Path", status: "unmet" }
    ]
  },
];

const DECISIONS = [
  { id: "DEC-001", title: "Approve Source Registry V1", type: "Contract Deployment", priority: "High" },
  { id: "DEC-002", title: "Review Verified Introduction Candidate Parameters", type: "Parameter Update", priority: "Medium" },
  { id: "DEC-003", title: "Review SeatRecord Metadata Schema", type: "Design Approval", priority: "Low" }
];

const SPRINT_BACKLOG = [
  { id: "SPR-1", module: "Source Attribution", task: "Implement Source Dashboard UI", priority: "P0", status: "Ready for Dev" },
  { id: "SPR-2", module: "Source Attribution", task: "Wire Claim Escrow Function", priority: "P1", status: "Blocked on Contract" },
  { id: "SPR-3", module: "SeatRecord721", task: "Draft SVG Generation Logic", priority: "P2", status: "Backlog" },
];

const LEAKAGE_CHECKLIST = [
  { id: "chk1", label: "UI Hidden: No public routes to /referral or /seat-record", status: "pass" },
  { id: "chk2", label: "Endpoints Guarded: API rejects non-admin requests to new modules", status: "pass" },
  { id: "chk3", label: "Contract Readiness: SourceRegistryV1 fully audited", status: "fail" },
  { id: "chk4", label: "Comms Pending: Marketing materials not yet published", status: "pass" },
];

const REVIEW_LINKS = [
  { label: "Source Referral Flow", url: "/member/referral?preview=true", type: "UI Preview" },
  { label: "SeatRecord Claim", url: "/member/seat-record?preview=true", type: "UI Preview" },
  { label: "SourceRegistryV1 Proxy", url: "Simulated — no canonical address", type: "Contract" },
];

const ADMIN_ARCHITECTURE = [
  { step: "1", title: "Wallet Allowlist", desc: "Hardcoded list of founder/admin addresses." },
  { step: "2", title: "Signed Message", desc: "Admin signs a nonce to prove key ownership." },
  { step: "3", title: "Server Verification", desc: "Backend recovers address, issues secure JWT." },
  { step: "4", title: "Role Permissions", desc: "JWT encodes specific capabilities (e.g. CanDeploy, CanPause)." },
  { step: "5", title: "Audit Logging", desc: "Every admin action logged immutably." },
];

// Panels Data
const LABS_INVENTORY = [
  ...MOCK_DATA.liveBoard.filter(m => m.status !== "LIVE NOW" && m.status !== "READ-ONLY"),
  ...MOCK_DATA.contractLayers.filter(m => m.status !== "LIVE NOW" && m.status !== "READ-ONLY" && m.name !== "SourceRegistryV1" && m.name !== "MembershipSaleV3"),
  ...MOCK_DATA.economy.ecosystem.filter(m => m.status !== "LIVE NOW" && m.status !== "READ-ONLY")
].reduce((acc, current) => {
  const x = acc.find(item => item.name === current.name);
  if (!x) {
    return acc.concat([current]);
  } else {
    return acc;
  }
}, [] as {name: string, status: any}[]);

const DEPRECATED_CONCEPTS = [
  { term: "Commission / Affiliate", reason: "Affirmative commission implies a financial reward structure or MLM/downline. We use 'Verified Introduction' and frame it as routing." },
  { term: "Yield / Passive Income", reason: "Creates expectation of return. The protocol routes capital, it does not guarantee yield." },
  { term: "Governance Promise", reason: "The protocol is operated by the founders. No DAO token voting." },
  { term: "Treasury Claim", reason: "Vault funds are protocol-controlled. No member has a claim on the treasury." },
  { term: "MLM / Downline", reason: "Multi-level marketing implies profit share across deep trees. Referrals are flat and simply attribute source." }
];

const AUDIT_LOG = [
  { id: "log-1", time: "10 mins ago", action: "Approved Module", details: "Membership V3 Engine marked LIVE NOW", admin: "0xDDF3...02BD0" },
  { id: "log-2", time: "1 hour ago", action: "Updated Configuration", details: "SourceRegistryV1 paused", admin: "0xDDF3...02BD0" },
  { id: "log-3", time: "2 days ago", action: "Resolved Alert", details: "Routing drift acknowledged", admin: "0xADMIN...1234" },
  { id: "log-4", time: "1 week ago", action: "Deployed Contract", details: "Archive1155 (Tx: 0x9b8...21a)", admin: "0xDDF3...02BD0" },
];

const PRE_RELEASE_CHECKLIST = [
  { id: "chk_type", label: "Typecheck clean" },
  { id: "chk_lang", label: "Language audit (no banned financial terms)" },
  { id: "chk_rout", label: "Routing canonical 70% / 20% / 10%" },
  { id: "chk_lab", label: "All future/simulated modules labeled" },
  { id: "chk_ui", label: "No live-looking inactive surfaces" }
];

export default function FounderReview() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: "", text: "" });

  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const handleSimulatedAction = (actionName: string, requiresDialog = false, dialogText = "") => {
    toast({
      title: "Simulated Action",
      description: `${actionName} executed. This is a prototype only; no real transactions occurred.`,
      variant: "default",
    });

    if (requiresDialog) {
      setDialogContent({ title: actionName, text: dialogText });
      setDialogOpen(true);
    }
  };

  const founderQueues = getFounderQueues();
  const pendingCandidates = getPendingCandidateCount();
  const operatorActions = getActionsByCategory("operator");
  const burnSummary = getBurnSummary();

  const driftAlerts = getTruthDrift();
  const driftSummary = getTruthDriftSummary();

  const handleChecklistToggle = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const checklistClearedCount = PRE_RELEASE_CHECKLIST.filter(c => checklist[c.id]).length;

  const handoffContent = `
PRODUCT OS HANDOFF BRIEF
-----------------------------------------
Date: ${new Date().toISOString().split('T')[0]}
Environment: Simulated Prototype

DRIFT SUMMARY
Aligned: ${driftSummary.aligned} | Review Needed: ${driftSummary.review} | Conflicts: ${driftSummary.conflict}

LIVE MODULES
${MODULES.filter(m => m.status === "LIVE NOW").map(m => `- ${m.name}`).join('\n')}

NOT LIVE / CANDIDATES
${MODULES.filter(m => m.status !== "LIVE NOW").map(m => `- ${m.name} (${m.status})`).join('\n')}

Pending Founder Decisions: ${DECISIONS.length}
Pending Protocol Candidates: ${pendingCandidates}

ROUTING RULE: ${BRAND.facts.routing}
`.trim();

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The handoff brief has been copied to your clipboard.",
      variant: "default"
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Founder Console</h1>
          <p className="text-muted-foreground mt-1">System state, release management, and command center.</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status="IN REVIEW" />
          <StatusBadge status="SIMULATED PROTOTYPE" />
        </div>
      </div>

      {/* Production authorization architecture (future) */}
      <ProductionAuthNote />

      {/* Operator Surfaces - NEW PANELS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10">
              <Network className={`w-5 h-5 ${driftSummary.conflict > 0 ? "text-red-400" : driftSummary.review > 0 ? "text-orange-400" : "text-green-400"}`} />
              <div className="text-xs text-center">
                <div className="font-semibold">Truth Drift</div>
                <div className="text-muted-foreground">{driftSummary.total} Alerts</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-background border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                Truth Drift Alerts
              </DialogTitle>
              <DialogDescription>
                Cross-references the Product OS to ensure the institution is describing itself consistently. 
                PROTOTYPE ONLY.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] mt-4 pr-4">
              <div className="space-y-4">
                {driftAlerts.map(alert => (
                  <div key={alert.id} className={
                    `p-4 rounded-lg border ${alert.severity === 'conflict' ? 'border-red-500/20 bg-red-500/5' : alert.severity === 'review' ? 'border-orange-500/20 bg-orange-500/5' : 'border-green-500/20 bg-green-500/5'}`
                  }>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-sm">{alert.concept}</div>
                      <Badge variant="outline" className={
                        alert.severity === 'conflict' ? 'text-red-400 border-red-500/30' : alert.severity === 'review' ? 'text-orange-400 border-orange-500/30' : 'text-green-400 border-green-500/30'
                      }>{alert.severity}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">{alert.summary}</div>
                    <div className="space-y-2">
                      {alert.sources.map((s, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-background/50 p-2 rounded">
                          <span className="font-medium">{s.source}</span>
                          <span className="text-muted-foreground">{s.label}: <span className="text-foreground">{s.value}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10">
              <ListChecks className="w-5 h-5 text-primary" />
              <div className="text-xs text-center">
                <div className="font-semibold">Release Gate</div>
                <div className="text-muted-foreground">{checklistClearedCount}/{PRE_RELEASE_CHECKLIST.length} Cleared</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-background border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                Release Gate
              </DialogTitle>
              <DialogDescription>
                A prototype pre-release checklist. Not a real CI gate. Simulated preview only.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-4">
              {PRE_RELEASE_CHECKLIST.map(chk => (
                <div key={chk.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                  <Checkbox 
                    id={chk.id} 
                    checked={checklist[chk.id] || false}
                    onCheckedChange={() => handleChecklistToggle(chk.id)}
                    className="mt-0.5"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor={chk.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                      {chk.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <div className="text-sm font-medium">
                Gate: {checklistClearedCount} of {PRE_RELEASE_CHECKLIST.length} cleared
              </div>
              <Button onClick={() => handleSimulatedAction("Clear Release Gate")}>Simulate Release</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10">
              <FlaskConical className="w-5 h-5 text-purple-400" />
              <div className="text-xs text-center">
                <div className="font-semibold">Labs Inventory</div>
                <div className="text-muted-foreground">{LABS_INVENTORY.length} Items</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-background border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-400" />
                Labs Inventory
              </DialogTitle>
              <DialogDescription>
                Experimental and candidate concepts currently in flight. Simulated prototype data.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[50vh] mt-4 pr-4">
              <div className="space-y-3">
                {LABS_INVENTORY.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-white/10 bg-white/5">
                    <span className="text-sm font-medium">{item.name}</span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10">
              <Ban className="w-5 h-5 text-neutral-400" />
              <div className="text-xs text-center">
                <div className="font-semibold">Deprecated</div>
                <div className="text-muted-foreground">Concepts</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-background border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-neutral-400" />
                Deprecated Concepts
              </DialogTitle>
              <DialogDescription>
                Things this institution refuses to be. Institutional memory of rejected ideas.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[50vh] mt-4 pr-4">
              <div className="space-y-4">
                {DEPRECATED_CONCEPTS.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg border border-white/10 bg-white/5">
                    <div className="font-semibold text-sm mb-2">{item.term}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.reason}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10">
              <History className="w-5 h-5 text-blue-400" />
              <div className="text-xs text-center">
                <div className="font-semibold">Audit Log</div>
                <div className="text-muted-foreground">PROTOTYPE</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-background border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                Audit Log <Badge variant="outline" className="ml-2 bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px]">SIMULATED PROTOTYPE</Badge>
              </DialogTitle>
              <DialogDescription>
                A simulated trail of founder decisions and events. Not real data.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[50vh] mt-4 pr-4">
              <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {AUDIT_LOG.map((log, i) => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                      <div className="w-2 h-2 rounded-full bg-blue-500/50"></div>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-white/5 bg-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-sm">{log.action}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{log.time}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{log.details}</div>
                      <div className="text-[10px] text-muted-foreground font-mono opacity-50">Admin: {log.admin}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10">
              <FileTerminal className="w-5 h-5 text-muted-foreground" />
              <div className="text-xs text-center">
                <div className="font-semibold">Handoff</div>
                <div className="text-muted-foreground">Generator</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-background border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileTerminal className="w-5 h-5 text-muted-foreground" />
                Handoff Generator
              </DialogTitle>
              <DialogDescription>
                Generates a copy-pasteable handoff brief summarizing the current Product OS state.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Textarea 
                readOnly 
                value={handoffContent} 
                className="min-h-[300px] font-mono text-xs bg-white/5 border-white/10 focus-visible:ring-0 leading-relaxed"
              />
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => copyToClipboard(handoffContent)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center">
            <GitBranch className="w-4 h-4 mr-2" />
            Protocol Graph — Candidate Queues
          </CardTitle>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
            {pendingCandidates} Pending
          </Badge>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground mb-4 max-w-3xl">
            The control room for what becomes canon, recognition, or public memory. Each candidate flows
            from the protocol graph and waits for an operator decision — nothing is automatic. Approvals
            are simulated previews only; no real transactions occur.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {founderQueues.map((q) => (
              <div key={q.key} className="border border-white/10 rounded-lg p-4 bg-background/40 space-y-3">
                <div className="flex items-center justify-between">
                  <Link href={q.surface} className="text-sm font-medium hover:text-primary transition-colors">
                    {q.title}
                  </Link>
                  <Badge variant="outline" className="text-[10px]">{q.items.length}</Badge>
                </div>
                {q.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No candidates in this queue.</p>
                ) : (
                  q.items.map((item) => (
                    <div key={item.id} className="text-xs border-t border-white/5 pt-3 first:border-0 first:pt-0 space-y-2">
                      <div className="font-medium text-sm">{item.title}</div>
                      <p className="text-muted-foreground">{item.note}</p>
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={item.founderDecision === "approved" ? "LIVE NOW" : "IN REVIEW"} showTooltip={false} />
                        {item.founderDecision === "pending" ? (
                          <div className="space-x-1 shrink-0">
                            <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300 hover:bg-green-500/10" onClick={() => handleSimulatedAction(`Approve "${item.title}" into ${q.title}`)}>
                              Approve
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleSimulatedAction(`Decline "${item.title}" for ${q.title}`)}>
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-green-400 uppercase tracking-wider shrink-0">Approved</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operator Toolkit — founder-only actions + Proof of Fire summary */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Operator Toolkit
          </CardTitle>
          <StatusBadge status="SIMULATED PROTOTYPE" showTooltip={false} />
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-200">
                <Flame className="w-4 h-4 text-orange-400" /> Proof of Fire — Operator Review
              </div>
              <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400 bg-orange-500/10">
                {burnSummary.pendingCandidates} pending
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4 max-w-2xl">
              Burns are costly signals: supply retired, never minted, never a price promise. Founder review is required
              before any burn could be real. Totals are simulated for the prototype.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="rounded border border-white/10 bg-background/40 p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total (sim)</div>
                <div className="font-mono font-bold">{burnSummary.totalSyn.toLocaleString()} SYN</div>
              </div>
              {burnSummary.bySource.map((s) => (
                <div key={s.source} className="rounded border border-white/10 bg-background/40 p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  <div className="font-mono font-bold">{s.amountSyn.toLocaleString()} SYN</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/member/fire">
                  <Flame className="w-4 h-4 mr-2" /> Open the Fire Ledger
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {operatorActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overviews & Decisions */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-sm font-bold flex items-center justify-between gap-2">
                  <span className="flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-primary" />
                    Ops Snapshot
                  </span>
                  <StatusBadge status="SIMULATED PROTOTYPE" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center"><Server className="w-3 h-3 mr-1" /> Environment</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{PRODUCTION_STATE.env}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center"><GitCommit className="w-3 h-3 mr-1" /> Current Commit</span>
                  <span className="font-mono">{PRODUCTION_STATE.commit}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center"><GitBranch className="w-3 h-3 mr-1" /> Branch</span>
                  <span className="font-mono">{PRODUCTION_STATE.branch}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center"><Database className="w-3 h-3 mr-1" /> Block Height</span>
                  <span className="font-mono">{PRODUCTION_STATE.blockHeight}</span>
                </div>
                <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded flex items-center text-xs text-green-400">
                  <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                  {PRODUCTION_STATE.health} ({PRODUCTION_STATE.syncStatus})
                </div>
                <p className="text-[10px] text-muted-foreground">Simulated values for prototype demonstration. No live deployment is connected.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 border-l-4 border-l-orange-500">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-sm font-bold flex items-center text-orange-400">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Alerts Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-200">SourceRegistry Audit Pending</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Cannot deploy V1 candidate until formal review completes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm mt-3 pt-3 border-t border-white/5">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-200">Rate Limit Optimization</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Indexer lagging by ~2 blocks during peak load.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center">
                <GitPullRequest className="w-4 h-4 mr-2" />
                Open Founder Decisions
              </CardTitle>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                {DECISIONS.length} Pending
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Decision</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DECISIONS.map((dec) => (
                    <TableRow key={dec.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-mono text-xs text-muted-foreground">{dec.id}</TableCell>
                      <TableCell className="text-sm font-medium">{dec.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{dec.type}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 text-green-400 hover:text-green-300 hover:bg-green-500/10" onClick={() => handleSimulatedAction(`Approve ${dec.id}`)}>
                                Approve
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Simulated: Approve immediately</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10" onClick={() => handleSimulatedAction(`Approve with revisions ${dec.id}`)}>
                                Revise
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Simulated: Approve with revisions</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10" onClick={() => handleSimulatedAction(`Defer ${dec.id}`)}>
                                Defer
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Simulated: Push to next sprint</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleSimulatedAction(`Reject ${dec.id}`)}>
                                Reject
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Simulated: Reject entirely</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center">
                <SearchCode className="w-4 h-4 mr-2" />
                Module Status Overview & Release Gates
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-xs">Module</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Visibility</TableHead>
                    <TableHead className="text-xs text-right">Release Gates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULES.map((mod) => (
                    <TableRow key={mod.name} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-sm font-medium">
                        {mod.name}
                        <div className="text-[10px] text-muted-foreground mt-1">Readiness: {mod.readiness}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={mod.status} showTooltip={false} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {mod.visibility === "Hidden" ? <EyeOff className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                          {mod.visibility}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        <div className="flex flex-col items-end gap-1">
                          {mod.gates.map((gate, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="text-muted-foreground">{gate.name}</span>
                              {gate.status === "met" ? (
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-red-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center">
                <CheckSquare className="w-4 h-4 mr-2" />
                Next Suggested Sprint
              </CardTitle>
              <CardDescription>Prioritized backlog for the upcoming development cycle.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {SPRINT_BACKLOG.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-background border border-white/5 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] py-0">{item.priority}</Badge>
                      <span className="text-xs text-muted-foreground">{item.module}</span>
                    </div>
                    <p className="text-sm font-medium">{item.task}</p>
                  </div>
                  <div className="text-xs px-2 py-1 bg-white/5 rounded text-muted-foreground whitespace-nowrap">
                    {item.status}
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="pt-2 pb-4 px-6 border-t border-white/5">
              <div className="flex gap-2 w-full justify-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleSimulatedAction("Prepare Codex Prompt", true, "PROMPT:\n\nPlease implement the Source Dashboard UI as specified in SPR-1. Use standard shadcn components. Ensure dark-first styling and robust empty states. Avoid any references to MLM or yield. Focus on verifiable source attribution.")}>
                        <FileTerminal className="w-4 h-4 mr-2" />
                        Prepare Codex Prompt
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Simulated: Generates AI prompt artifact</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" onClick={() => handleSimulatedAction("Prepare Replit Handoff", true, "HANDOFF:\n\nTask: Wire Claim Escrow Function (SPR-2)\nFiles to touch: src/pages/referral.tsx, src/hooks/use-contracts.ts\nContext: Escrow fallback logic is needed. Follow existing patterns. Do not deploy.")}>
                        Prepare Replit Handoff
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Simulated: Generates Replit task spec</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardFooter>
          </Card>

        </div>

        {/* Right Column: Checklists, Architecture, Links */}
        <div className="space-y-6">
          
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-green-400" />
                No-Leakage Pre-flight
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {LEAKAGE_CHECKLIST.map((item) => (
                <div key={item.id} className="flex items-start gap-2 text-sm">
                  {item.status === "pass" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <span className={item.status === "pass" ? "text-muted-foreground" : "text-foreground font-medium"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="pt-2 pb-4 px-6 border-t border-white/5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" className="w-full" size="sm" onClick={() => handleSimulatedAction("Generate Release Checklist", true, "RELEASE CHECKLIST:\n\n[ ] Verify No-Leakage Pre-flight passes\n[ ] Ensure all open P0 decisions are resolved\n[ ] Run final V2 Candidate simulated tests\n[ ] Publish marketing comms\n[ ] Toggle visibility flags to PUBLIC")}>
                      Generate Release Checklist
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Simulated: Generates copyable checklist</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center">
                <Link2 className="w-4 h-4 mr-2" />
                Hidden Review Links
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {REVIEW_LINKS.map((link, i) => (
                <div key={i} className="flex flex-col gap-1 p-2 bg-background border border-white/5 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{link.label}</span>
                    <Badge variant="outline" className="text-[10px]">{link.type}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono truncate">{link.url}</span>
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Source Referral Status</span>
                  <Badge variant="outline" className="border-orange-500/30 text-orange-400 bg-orange-500/10">PAUSED</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Default Source ID</span>
                  <span className="font-mono text-xs">ZERO_SOURCE_ID</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Contract Status</span>
                  <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">READY (Simulated)</Badge>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleSimulatedAction("Pause Module")}>
                        <Pause className="w-4 h-4 mr-1" /> Pause
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Simulated: Pause active module</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleSimulatedAction("Resume Module")}>
                        <Play className="w-4 h-4 mr-1" /> Resume
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Simulated: Resume paused module</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center">
                <Megaphone className="w-4 h-4 mr-2 text-primary" />
                Communications / Public Update
              </CardTitle>
              <CardDescription className="text-xs text-orange-300">
                Prototype only. Generates copyable drafts — nothing is posted.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMS_DRAFTS.map((c) => (
                <Button
                  key={c.name}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => handleSimulatedAction(c.name, true, c.text)}
                  data-testid={`comms-${c.name}`}
                >
                  <c.icon className="w-3.5 h-3.5 mr-1.5 shrink-0" /> {c.label}
                </Button>
              ))}
            </CardContent>
            <CardFooter className="pt-2 pb-4 px-6 border-t border-white/5">
              <p className="text-[11px] text-muted-foreground/80">
                Drafts honor approved language and the 70% / 20% / 10% routing. Review before any real use on
                the official channels.
              </p>
            </CardFooter>
          </Card>

          <Card className="bg-white/5 border-white/10 border-dashed">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Admin Architecture Concept
              </CardTitle>
              <CardDescription className="text-xs text-orange-300">
                Visual prototype only. No real security implemented.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10"></div>
                {ADMIN_ARCHITECTURE.map((step) => (
                  <div key={step.step} className="flex gap-4 relative z-10 mb-4 last:mb-0">
                    <div className="w-8 h-8 rounded-full bg-background border border-white/20 flex items-center justify-center text-xs font-mono shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-background border-white/10">
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>Generated artifact for review. Copy this to your external tools.</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Textarea 
              readOnly 
              value={dialogContent.text} 
              className="min-h-[200px] font-mono text-sm bg-white/5 border-white/10 focus-visible:ring-0"
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
