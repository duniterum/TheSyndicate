import { motion } from "framer-motion";
import { getPublicFireLedger, getBurnSummary, getProofOfFire } from "@/lib/fire-ledger";
import { getActionsByCategory } from "@/lib/actions";
import { ActionCard } from "@/components/action-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConnectForPersonalCta } from "@/components/connect-cta";
import { Card, CardContent } from "@/components/ui/card";
import { BurnProofPanel } from "@/components/burn-proof-panel";
import { Flame, GitBranch, ArrowRight, ExternalLink } from "lucide-react";

export default function PublicFire() {
  const summary = getBurnSummary();
  const ledger = getPublicFireLedger();
  const proof = getProofOfFire();
  const burnActions = getActionsByCategory("burn");

  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-5xl space-y-10" data-testid="page-public-fire">
      {/* Hero — short, premium; the single read-only/safety framing lives here */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" /> Proof of Fire
          </h1>
          <StatusBadge status="READ-ONLY" />
          <StatusBadge status="LIVE READ" showTooltip={false} />
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Every SYN burn, read live from the chain and reconciled to the last token. Burning retires
          supply — never minting, never yield, never a price promise. Burn execution is never wired.
        </p>
        <p className="text-xs text-muted-foreground/70">
          Public read-only preview — no wallet needed to view.
        </p>
      </motion.div>

      {/* PRIMARY LIVE TRUTH — authoritative burned total + chain context + reconciliation + scan +
          enumerated burns, all in one live panel (BurnProofAdapter V1). This is the main Fire metric. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
      >
        <BurnProofPanel />
      </motion.div>

      {/* Verified Proof of Fire #001 — connected anchor: the first of the reconciled burns above */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-white/5 border-emerald-500/20">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400" /> Verified Proof of Fire #001
              </h2>
              <StatusBadge status="READ-ONLY PRODUCTION PROOF" />
            </div>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
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
                <span className="uppercase tracking-wider text-[10px] text-muted-foreground/70 not-italic">tx</span>
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
      </motion.div>

      {/* Simulated Fire Ledger Preview — demoted prototype, smaller than the live figure */}
      <motion.div
        className="space-y-5 pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.14 }}
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-3">
          <Flame className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold text-muted-foreground">Simulated Fire Ledger Preview</h2>
          <StatusBadge status="SIMULATED PROTOTYPE" />
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Prototype ledger math only — a preview of how proposed and recorded burns would read once the
          ledger is wired. These are not live values and do not change the burned total above.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-10">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              Prototype total (simulated)
            </div>
            <div className="text-xl font-mono font-bold text-muted-foreground/70">
              {summary.totalSyn.toLocaleString()} <span className="text-sm text-muted-foreground/60">SYN</span>
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
            <Card key={entry.id} className="bg-white/[0.03] border-white/10 overflow-hidden">
              <div className="border-l-2 border-orange-500/30">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{entry.title}</h3>
                        <StatusBadge status={entry.status === "candidate" ? "CONCEPT ONLY" : "SIMULATED PROTOTYPE"} />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider">
                        <span>{entry.source}</span>
                        <span>&bull;</span>
                        <span>{entry.chapter}</span>
                        <span>&bull;</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-mono font-bold text-muted-foreground/70">
                        {entry.amountSyn.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">SYN (simulated)</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{entry.note}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground/70">Proof outputs:</span>
                    {entry.proofOutputs.map((po) => (
                      <span key={po} className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                        {po}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Future propagation — not yet wired */}
      <motion.div
        className="space-y-5 pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-3">
          <GitBranch className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold">How a burn becomes proof</h2>
          <StatusBadge status="ADAPTER REQUIRED" />
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          A burn moves through clear steps: activity, candidate, founder review, then recorded as memory
          and shareable proof. Propagating live burn events into Activity, Chronicle, and Archive is not
          yet wired — it is adapter-required. The live scan above is already read-only today.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {["Activity", "Candidate", "Founder Review", "Chronicle & Share"].map((step, idx) => (
            <div key={step} className="relative">
              <Card className="bg-white/5 border-white/10 h-full">
                <CardContent className="p-4">
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

      {/* Fire actions */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" /> Fire Protocol Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {burnActions.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.26 }}
      >
        <ConnectForPersonalCta surfaceId="fire" />
      </motion.div>
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
