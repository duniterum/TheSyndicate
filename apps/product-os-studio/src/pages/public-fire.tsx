import { motion } from "framer-motion";
import { getPublicFireLedger, getBurnSummary, getFireFlow, getProofOfFire } from "@/lib/fire-ledger";
import { getActionsByCategory } from "@/lib/actions";
import { ActionCard } from "@/components/action-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PublicProofNote, ConnectForPersonalCta } from "@/components/connect-cta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, AlertTriangle, GitBranch, ArrowRight, ShieldOff, ExternalLink } from "lucide-react";

export default function PublicFire() {
  const summary = getBurnSummary();
  const ledger = getPublicFireLedger();
  const flow = getFireFlow();
  const proof = getProofOfFire();
  const burnActions = getActionsByCategory("burn");

  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl space-y-12" data-testid="page-public-fire">
      {/* Header */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Fire Ledger</h1>
            <StatusBadge status="READ-ONLY" />
          </div>
        </div>
        <PublicProofNote surfaceId="fire" />
        <p className="text-muted-foreground text-lg max-w-2xl">
          Proof of Fire: a costly signal that retires supply. Never minting, never yield, 
          never a promised return. Read-only verification of proposed and recorded burns.
        </p>

        {/* Safety / Doctrine Framing */}
        <div className="p-5 border border-destructive/30 bg-destructive/10 rounded-xl text-sm text-destructive flex gap-3 items-start max-w-3xl">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1 uppercase tracking-wider">Not an investment. No yield.</p>
            <p className="opacity-90 leading-relaxed">
              Burn is a costly signal to mark a milestone or show conviction. It reduces supply, 
              but does not imply a price promise. SYN is acquired through membership routing, 
              never minted. All figures below are prototype simulations.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10 md:col-span-2">
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                Total Supply Retired
                <StatusBadge status={summary.statusLabel} />
              </div>
              <div className="text-4xl sm:text-5xl font-mono font-bold text-primary">
                {summary.totalSyn.toLocaleString()} <span className="text-2xl text-muted-foreground">SYN</span>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            {summary.bySource.map(src => (
              <Card key={src.source} className="bg-white/5 border-white/10">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground">{src.label}</div>
                    <div className="font-mono mt-1">{src.amountSyn.toLocaleString()} SYN</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{src.count} events</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Verified Proof of Fire — READ-ONLY PRODUCTION PROOF */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
      >
        <Card className="bg-white/5 border-emerald-500/20">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-emerald-400" /> Verified Proof of Fire
              <StatusBadge status="READ-ONLY PRODUCTION PROOF" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground max-w-3xl">
              One burn is verified on-chain and copied from the production porting map. It is a static
              reference — a real transaction with a confirmed block on {proof.chain}. Nothing is wired
              here: a live burn-event scan is ADAPTER REQUIRED, and burn execution is never wired. The
              aggregate above is a separate, clearly labeled simulated figure.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </motion.div>

      {/* Burn Actions */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" /> Fire Protocol Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {burnActions.map(action => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      </motion.div>

      {/* How a burn flows */}
      <motion.div
        className="space-y-6 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <GitBranch className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">How a burn becomes proof</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          A burn is a protocol event that moves through the system in clear steps. It starts as an activity, becomes a candidate,
          requires founder review, and is finally recorded as memory and shareable proof.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Activity', 'Candidate', 'Founder Review', 'Chronicle & Share'].map((step, idx) => (
            <div key={step} className="relative">
              <Card className="bg-white/5 border-white/10 h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/20 text-primary font-mono text-[10px]">
                      {idx + 1}
                    </span>
                    {step}
                  </div>
                </CardContent>
              </Card>
              {idx < 3 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Ledger */}
      <motion.div
        className="space-y-6 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <h2 className="text-xl font-bold">The Fire Ledger</h2>
        <div className="space-y-4">
          {ledger.map(entry => (
            <Card key={entry.id} className="bg-white/5 border-white/10 overflow-hidden">
              <div className="border-l-4 border-primary">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{entry.title}</h3>
                        <StatusBadge status={entry.status === 'candidate' ? 'CONCEPT ONLY' : 'SIMULATED PROTOTYPE'} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-wider">
                        <span>{entry.source}</span>
                        <span>&bull;</span>
                        <span>{entry.chapter}</span>
                        <span>&bull;</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-mono font-bold text-primary">{entry.amountSyn.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">SYN Retired</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded border border-white/5">
                    {entry.note}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Proof outputs:</span>
                    {entry.proofOutputs.map(po => (
                      <span key={po} className="px-2 py-1 rounded bg-white/10 border border-white/5">{po}</span>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <ConnectForPersonalCta surfaceId="fire" />
      </motion.div>
    </div>
  );
}
