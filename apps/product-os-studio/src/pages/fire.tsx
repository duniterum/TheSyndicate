import { useState } from "react";
import { useApp } from "@/lib/store";
import { getFireLedger, getBurnSummary, getFireFlow, burnSourceLabel, getProofOfFire } from "@/lib/fire-ledger";
import { getActionsByCategory } from "@/lib/actions";
import { ActionCard } from "@/components/action-card";
import { ProtocolSnapshotPanel } from "@/components/protocol-snapshot-panel";
import { BurnProofPanel } from "@/components/burn-proof-panel";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { toast } from "sonner";
import { Flame, AlertTriangle, ArrowRight, FileText, CheckCircle2, ExternalLink } from "lucide-react";

export default function Fire() {
  const { isFounder } = useApp();
  const summary = getBurnSummary();
  const ledger = getFireLedger();
  const flow = getFireFlow();
  const proof = getProofOfFire();
  const actionCards = getActionsByCategory("burn");

  const [formSource, setFormSource] = useState<string>("");
  const [formAmount, setFormAmount] = useState("");
  const [formChapter, setFormChapter] = useState("");
  const [formIntent, setFormIntent] = useState("");

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSource || !formAmount || !formChapter || !formIntent) {
      toast.error("Please fill all fields to simulate a proposal.");
      return;
    }
    
    toast.success("Burn proposed (simulated) — founder review required", {
      description: "A proposed burn is a candidate, not a live action. No real transaction occurred.",
    });
    
    // Reset form
    setFormSource("");
    setFormAmount("");
    setFormChapter("");
    setFormIntent("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto" data-testid="page-member-fire">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            Fire Ledger
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Proof of Fire. A costly signal that retires SYN supply. Not minting, not yield, not a price promise.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <StatusBadge status="ADAPTER REQUIRED" />
          <StatusBadge status="SIMULATED PROTOTYPE" />
        </div>
      </div>

      {/* Disclaimers */}
      <div className="p-5 border border-orange-500/30 bg-orange-500/10 rounded-xl text-sm text-orange-400 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1 uppercase tracking-wider text-orange-500">Not yield. Not minting. Not an investment.</p>
          <p className="opacity-90">
            A burn retires supply as a verifiable signal of conviction. It does not mint new tokens, it does not distribute yield, and it is not a mechanism for price manipulation. All figures shown are simulated prototype data.
          </p>
          <p className="opacity-80 mt-2 text-xs">
            In production, Proof of Fire is a read-only scan of the SYN burn address
            (<span className="font-mono">useSynBurnEvents</span>), numbered{" "}
            <span className="font-mono">PROOF_OF_FIRE_NNN</span>. A live scan is ADAPTER REQUIRED.
            There is no live burn execution in the Studio — proposals are candidates only.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ledger & Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Aggregate Burned Supply</CardTitle>
                <StatusBadge status="SIMULATED PROTOTYPE" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-end gap-3 mb-6">
                <div className="text-5xl font-mono font-bold tracking-tight text-orange-500">
                  {summary.totalSyn.toLocaleString()}
                </div>
                <div className="text-muted-foreground mb-1 font-mono">SYN RETIRED</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {summary.bySource.map(src => (
                  <div key={src.source} className="p-3 bg-background/40 rounded-lg border border-white/5">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{src.label}</div>
                    <div className="text-lg font-mono font-bold mt-1">{src.amountSyn.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{src.count} recorded</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Verified Proof of Fire — READ-ONLY PRODUCTION PROOF */}
          <Card className="bg-white/5 border-emerald-500/20">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-emerald-400" /> Verified Proof of Fire
                </CardTitle>
                <StatusBadge status="READ-ONLY PRODUCTION PROOF" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                One burn is verified on-chain and copied from the production porting map — a static
                reference on {proof.chain}. The aggregate above is a separate, clearly labeled
                simulated figure. A live burn-event scan is ADAPTER REQUIRED; execution is never wired.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-background/40 rounded-lg border border-white/5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Proof</div>
                  <div className="font-mono text-sm mt-1">{proof.proofNumber}</div>
                </div>
                <div className="p-3 bg-background/40 rounded-lg border border-white/5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Supply retired</div>
                  <div className="font-mono text-sm mt-1 text-emerald-400">{proof.amountSyn.toLocaleString()} SYN</div>
                </div>
                <div className="p-3 bg-background/40 rounded-lg border border-white/5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Category</div>
                  <div className="font-mono text-sm mt-1">{proof.category}</div>
                </div>
                <div className="p-3 bg-background/40 rounded-lg border border-white/5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Block</div>
                  <div className="font-mono text-sm mt-1">{proof.block.toLocaleString()}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Transaction hash</span>
                  <a href={proof.txUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted-foreground hover:text-foreground break-all inline-flex items-center gap-1" title="Read-only explorer — reference only, nothing wired">
                    {proof.txHash} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Burn address</span>
                  <a href={proof.burnAddressUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted-foreground hover:text-foreground break-all inline-flex items-center gap-1" title="Read-only explorer — reference only, nothing wired">
                    {proof.burnAddress} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <ProtocolSnapshotPanel
            title="Burn sink — live SYN balance"
            description="SYN currently held at the canonical burn sink (0x…dEaD), read LIVE and read-only from the public Avalanche RPC. This cumulative sink total is DISTINCT from the verified Proof of Fire #001 above (a specific 1,000 SYN founder burn). Burning retires supply — never minted, never a price promise."
            groups={["burn"]}
            showChain={false}
            showAdapterRequired={false}
          />

          <BurnProofPanel />

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Ledger Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {ledger.map(entry => (
                <div key={entry.id} className="p-4 bg-background/40 rounded-lg border border-white/5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{entry.title}</span>
                      <StatusBadge status={entry.status === 'simulated' ? "SIMULATED PROTOTYPE" : entry.status === 'candidate' ? "IN REVIEW" : "FUTURE"} />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {burnSourceLabel(entry.source)} · {entry.chapter} · {entry.date}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xl">{entry.note}</p>
                    {entry.proofOutputs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.proofOutputs.map(po => (
                          <Badge key={po} variant="secondary" className="text-[10px] bg-white/5">{po}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-lg font-bold text-orange-400">{entry.amountSyn.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">SYN</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actionCards.map(action => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>

        {/* Right Column: Proposal & Flow */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.05)]">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">Propose a Burn (Candidate)</CardTitle>
                <StatusBadge status="NOT WIRED" showTooltip={false} className="scale-90 origin-left" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                No live burn execution. A proposal is a simulated candidate for founder review only.
              </p>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handlePropose} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Burn Source</Label>
                  <Select value={formSource} onValueChange={setFormSource}>
                    <SelectTrigger id="source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">Community / Member</SelectItem>
                      <SelectItem value="protocol">Protocol Engine</SelectItem>
                      {isFounder && <SelectItem value="founder">Founder (Operator)</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Retire (SYN)</Label>
                  <Input id="amount" placeholder="e.g. 5000" type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chapter">Chapter Context</Label>
                  <Input id="chapter" placeholder="e.g. Genesis Signal" value={formChapter} onChange={e => setFormChapter(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intent">Signal Intent</Label>
                  <Textarea 
                    id="intent" 
                    placeholder="Why is this supply being retired?" 
                    className="resize-none h-20 text-sm"
                    value={formIntent}
                    onChange={e => setFormIntent(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  Submit Proposal (Simulated)
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  Submitting creates a simulated candidate. No transaction executes.
                </p>
              </form>
            </CardContent>
          </Card>

          {isFounder && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-primary">Operator Control</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Final review required.</div>
                </div>
                <Link href="/member/founder-review">
                  <Button variant="outline" size="sm" className="text-xs">
                    Console <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">The Protocol Flow</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-background border border-white/20 flex items-center justify-center shrink-0">
                      <span className="text-[10px]">1</span>
                    </div>
                    <div className="w-px h-full bg-white/10 my-1" />
                  </div>
                  <div className="pb-4">
                    <div className="font-medium text-sm">Proposal (Candidate)</div>
                    <div className="text-xs text-muted-foreground mt-1">A burn is proposed and awaits founder review.</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-background border border-white/20 flex items-center justify-center shrink-0">
                      <span className="text-[10px]">2</span>
                    </div>
                    <div className="w-px h-full bg-white/10 my-1" />
                  </div>
                  <div className="pb-4">
                    <div className="font-medium text-sm">Review</div>
                    <div className="text-xs text-muted-foreground mt-1">The operator confirms the signal.</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Recorded Proof</div>
                    <div className="text-xs text-muted-foreground mt-1">It becomes an Archive memory and shareable proof.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
