import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getBurnSummary, getProofOfFire } from "@/lib/fire-ledger";
import { getActionsByCategory } from "@/lib/actions";
import { ActionCard } from "@/components/action-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConnectForPersonalCta } from "@/components/connect-cta";
import { useBurnProof } from "@/lib/burn-proof-hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, GitBranch, ArrowRight, ExternalLink } from "lucide-react";

export default function PublicFire() {
  const summary = getBurnSummary();
  const proof = getProofOfFire();
  const burnActions = getActionsByCategory("burn");
  const { model, scanning, progress, scan } = useBurnProof();

  // Quietly enumerate the on-chain burns once, after the light cumulative read lands.
  const autoScanned = useRef(false);
  useEffect(() => {
    if (autoScanned.current) return;
    if (model && model.completeness === "not-scanned" && model.events.length === 0 && !scanning) {
      autoScanned.current = true;
      scan();
    }
  }, [model, scanning, scan]);

  const hasLiveCumulative = !!model && model.state !== "error" && model.cumulativeFormatted !== null;
  const events = model?.events ?? [];
  const reconciled = !!model?.reconciled;
  const readError = !!model && model.state === "error";

  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-5xl space-y-10" data-testid="page-public-fire">
      {/* Hero — short, premium; doctrine framing lives here, no disclaimer wall */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" /> Fire Ledger
          </h1>
          <StatusBadge status="READ-ONLY" />
          {hasLiveCumulative && <StatusBadge status="LIVE READ" showTooltip={false} />}
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Proof of Fire — a costly signal that retires SYN supply. Read live from the chain and reconciled
          to the last token. Never minting, never yield, never a price promise. Burn execution is never wired.
        </p>
        <p className="text-xs text-muted-foreground/70">Public read-only preview — no wallet needed to view.</p>
      </motion.div>

      {/* Total Supply Retired — live value in the existing field + simulated category preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10 md:col-span-2">
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex flex-wrap items-center gap-2">
                Total Supply Retired
                {hasLiveCumulative && <StatusBadge status="LIVE READ" showTooltip={false} />}
                {reconciled && <ReconciledPill />}
              </div>
              <div className="text-4xl sm:text-5xl font-mono font-bold text-orange-500">
                {hasLiveCumulative ? model!.cumulativeFormatted : readError ? "—" : "…"}{" "}
                <span className="text-2xl text-muted-foreground">SYN</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 max-w-xl leading-relaxed">
                {hasLiveCumulative ? (
                  <>
                    Live <span className="font-mono">balanceOf</span> of the burn sink
                    {model!.headBlock != null ? (
                      <>
                        , pinned at block <span className="font-mono">{model!.headBlock.toLocaleString()}</span>
                      </>
                    ) : null}
                    . A sink only receives — this is every SYN ever burned.
                  </>
                ) : readError ? (
                  <>Live burned total is unavailable right now. Nothing here is simulated — it simply could not be read.</>
                ) : (
                  <>Reading the live burned total from the chain…</>
                )}
              </p>
            </CardContent>
          </Card>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Category preview</span>
              <StatusBadge status="SIMULATED PROTOTYPE" />
            </div>
            {summary.bySource.map((src) => (
              <Card key={src.source} className="bg-white/5 border-white/10">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground">{src.label}</div>
                    <div className="font-mono mt-1 text-muted-foreground/70">{src.amountSyn.toLocaleString()} SYN</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">simulated</div>
                </CardContent>
              </Card>
            ))}
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              Per-category attribution is a prototype preview — the chain proves the total, not the split.
            </p>
          </div>
        </div>
      </motion.div>

      {/* The Fire Ledger — real, enumerated burns; Proof of Fire #001 is the first anchor */}
      <motion.div
        className="space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-3">
          <h2 className="text-xl font-bold">The Fire Ledger</h2>
          {events.length > 0 && <StatusBadge status="LIVE READ" showTooltip={false} />}
          {reconciled && <ReconciledPill />}
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Every SYN burn, enumerated live from the chain (Transfer → burn sink) and reconciled to the total above.
        </p>
        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((e) => (
              <LedgerRow
                key={`${e.transactionHash}-${e.logIndex}`}
                title={`Proof of Fire #${e.proofNumber}`}
                anchor={e.isProofOfFire001}
                meta={`${e.proofLabel} · block ${e.blockNumber.toLocaleString()}`}
                amount={e.formatted}
                href={e.txExplorerUrl}
                hash={e.transactionHash}
              />
            ))
          ) : (
            <>
              <LedgerRow
                title="Proof of Fire #001"
                anchor
                meta={`${proof.proofNumber} · block ${proof.block.toLocaleString()}`}
                amount={proof.amountSyn.toLocaleString()}
                href={proof.txUrl}
                hash={proof.txHash}
              />
              <div className="text-xs text-muted-foreground px-1 py-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/70 animate-pulse" />
                {readError && !scanning
                  ? "Live burn list is unavailable right now — the verified anchor above remains read-only."
                  : scanning && progress && progress.planned > 0
                    ? `Reading verified on-chain burns… (${progress.scanned}/${progress.planned})`
                    : "Reading verified on-chain burns…"}
              </div>
            </>
          )}
          {events.length > 0 && model && model.completeness === "partial" && (
            <p className="text-[11px] text-amber-300/80 px-1">
              Showing {events.length} verified {events.length === 1 ? "burn" : "burns"} read so far — full
              reconciliation is still in progress.
            </p>
          )}
        </div>
      </motion.div>

      {/* Future propagation — not yet wired */}
      <motion.div
        className="space-y-5 pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.14 }}
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-3">
          <GitBranch className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold">How a burn becomes proof</h2>
          <StatusBadge status="ADAPTER REQUIRED" />
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          A burn moves through clear steps: activity, candidate, founder review, then recorded as memory and
          shareable proof. Propagating live burn events into Activity, Chronicle, and Archive is not yet wired —
          it is adapter-required. The live ledger above is already read-only today.
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
        transition={{ duration: 0.5, delay: 0.18 }}
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
        transition={{ duration: 0.5, delay: 0.22 }}
      >
        <ConnectForPersonalCta surfaceId="fire" />
      </motion.div>
    </div>
  );
}

function ReconciledPill() {
  return (
    <span
      className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      title="Enumerated burns sum exactly to the live burned total — every burn is accounted for."
    >
      Reconciled
    </span>
  );
}

function shortHash(h: string): string {
  return h.length > 18 ? `${h.slice(0, 10)}…${h.slice(-8)}` : h;
}

function LedgerRow({
  title,
  anchor,
  meta,
  amount,
  href,
  hash,
}: {
  title: string;
  anchor?: boolean;
  meta: string;
  amount: string;
  href: string;
  hash: string;
}) {
  return (
    <Card className="bg-white/[0.03] border-white/10 overflow-hidden">
      <div className="border-l-2 border-orange-500/40">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{title}</h3>
              {anchor && (
                <span className="text-[10px] uppercase tracking-wider text-emerald-400/90 border border-emerald-500/20 bg-emerald-500/10 rounded px-1.5 py-0.5">
                  Verified anchor
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">{meta}</div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title="Read-only explorer — reference only, nothing wired"
              className="font-mono text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 break-all"
            >
              <span className="uppercase tracking-wider text-[10px] text-muted-foreground/70">tx</span>
              {shortHash(hash)} <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-mono font-bold text-orange-400">{amount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">SYN Retired</div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
