import { useState } from "react";
import { useApp } from "@/lib/store";
import { getFireLedger, getBurnSummary, burnSourceLabel, getProofOfFire } from "@/lib/fire-ledger";
import { getActionsByCategory } from "@/lib/actions";
import { ActionCard } from "@/components/action-card";
import { BurnProofPanel } from "@/components/burn-proof-panel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { toast } from "sonner";
import { Flame, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";

export default function Fire() {
  const { isFounder } = useApp();
  const summary = getBurnSummary();
  const ledger = getFireLedger();
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

    setFormSource("");
    setFormAmount("");
    setFormChapter("");
    setFormIntent("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto" data-testid="page-member-fire">
      {/* Hero — short, premium; single read-only/safety framing */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            Proof of Fire
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Every SYN burn, read live from the chain and reconciled to the last token — not minting, not
            yield, not a price promise. Burn execution is never wired; proposals here are simulated
            candidates for founder review.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <StatusBadge status="LIVE READ" showTooltip={false} />
          <StatusBadge status="NOT WIRED" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: live proof primary, then connected anchor, then demoted prototype */}
        <div className="lg:col-span-2 space-y-6">
          {/* PRIMARY LIVE TRUTH — cumulative burned + chain + reconciliation + scan + events */}
          <BurnProofPanel />

          {/* Verified Proof of Fire #001 — connected anchor */}
          <Card className="bg-white/5 border-emerald-500/20">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Flame className="w-5 h-5 text-emerald-400" /> Verified Proof of Fire #001
                </h2>
                <StatusBadge status="READ-ONLY PRODUCTION PROOF" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The first of the burns reconciled above — one founder burn verified on-chain (block{" "}
                {proof.block.toLocaleString()} on {proof.chain}), copied from the production porting map.
                The live scan lists it as <span className="font-mono">{proof.proofNumber}</span>; it is a
                static read-only reference, and burn execution is never wired.
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                <Fact label="Proof" value={proof.proofNumber} />
                <Fact label="Supply retired" value={`${proof.amountSyn.toLocaleString()} SYN`} accent />
                <Fact label="Category" value={proof.category} />
                <Fact label="Block" value={proof.block.toLocaleString()} />
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={proof.txUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground break-all inline-flex items-center gap-1.5"
                  title="Read-only explorer — reference only, nothing wired"
                >
                  <span className="uppercase tracking-wider text-[10px] text-muted-foreground/70">tx</span>
                  {proof.txHash} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                <a
                  href={proof.burnAddressUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground break-all inline-flex items-center gap-1.5"
                  title="Read-only explorer — reference only, nothing wired"
                >
                  <span className="uppercase tracking-wider text-[10px] text-muted-foreground/70">sink</span>
                  {proof.burnAddress} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Simulated Fire Ledger Preview — demoted, smaller than the live figure */}
          <div className="pt-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
              <Flame className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-bold text-muted-foreground">Simulated Fire Ledger Preview</h2>
              <StatusBadge status="SIMULATED PROTOTYPE" />
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Prototype ledger math only — not a live total. The canonical burned figure is the LIVE READ
              total above; these figures preview how proposed and recorded burns would read once wired.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-10">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  Prototype total (simulated)
                </div>
                <div className="text-xl font-mono font-bold text-muted-foreground/70">
                  {summary.totalSyn.toLocaleString()}{" "}
                  <span className="text-sm text-muted-foreground/60">SYN</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {summary.bySource.map((src) => (
                  <div key={src.source}>
                    <div className="text-[11px] text-muted-foreground">{src.label}</div>
                    <div className="font-mono text-sm text-muted-foreground/70">
                      {src.amountSyn.toLocaleString()} SYN · {src.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {ledger.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-white/[0.03] rounded-lg border border-white/10 flex flex-col sm:flex-row gap-4 justify-between sm:items-start"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{entry.title}</span>
                      <StatusBadge
                        status={
                          entry.status === "simulated"
                            ? "SIMULATED PROTOTYPE"
                            : entry.status === "candidate"
                              ? "IN REVIEW"
                              : "FUTURE"
                        }
                      />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {burnSourceLabel(entry.source)} · {entry.chapter} · {entry.date}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">{entry.note}</p>
                    {entry.proofOutputs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.proofOutputs.map((po) => (
                          <Badge key={po} variant="secondary" className="text-[10px] bg-white/5">
                            {po}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-base font-bold text-muted-foreground/70">
                      {entry.amountSyn.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">SYN (simulated)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actionCards.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>

        {/* Right column: simulated proposal + future flow */}
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
                  <Input id="amount" placeholder="e.g. 5000" type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chapter">Chapter Context</Label>
                  <Input id="chapter" placeholder="e.g. Genesis Signal" value={formChapter} onChange={(e) => setFormChapter(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intent">Signal Intent</Label>
                  <Textarea
                    id="intent"
                    placeholder="Why is this supply being retired?"
                    className="resize-none h-20 text-sm"
                    value={formIntent}
                    onChange={(e) => setFormIntent(e.target.value)}
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">The Protocol Flow</CardTitle>
                <StatusBadge status="ADAPTER REQUIRED" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Propagating live burns into Activity, Chronicle, and Archive is not yet wired.
              </p>
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

function Fact({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-sm mt-1 ${accent ? "text-emerald-400" : ""}`}>{value}</div>
    </div>
  );
}
