import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Wallet,
  Network,
  ArrowRight,
  ShieldCheck,
  Hash,
  Receipt,
  UserPlus,
  Circle,
  Lock,
} from "lucide-react";
import { MOCK_DATA, ROUTING_SPLIT, routeUsdc } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { WalletStatePanel } from "@/components/wallet/wallet-state-panel";

type FlowState =
  | "input"
  | "approve"
  | "approving"
  | "buy"
  | "pending"
  | "success"
  | "failed"
  | "wrong-chain";

const MIN_ENTRY = 150;
const SYN_PER_USDC = 100;

const STEPPER: { key: FlowState; label: string }[] = [
  { key: "input", label: "Amount" },
  { key: "approve", label: "Approve" },
  { key: "buy", label: "Buy" },
  { key: "success", label: "Receipt" },
];

function stepperIndex(state: FlowState): number {
  switch (state) {
    case "input":
    case "wrong-chain":
      return 0;
    case "approve":
    case "approving":
      return 1;
    case "buy":
    case "failed":
    case "pending":
      return 2;
    case "success":
      return 3;
  }
}

export default function Join() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("150");
  const [step, setStep] = useState<FlowState>("input");

  const numericAmount = Number(amount) || 0;
  const belowMinimum = numericAmount < MIN_ENTRY;
  const synReceived = numericAmount * SYN_PER_USDC;
  const routing = routeUsdc(numericAmount);
  const activeStepIndex = stepperIndex(step);

  const handleApprove = () => {
    if (belowMinimum) return;
    setStep("approving");
    toast({
      title: "Approval requested (simulated)",
      description: "No real wallet signature is requested in this prototype.",
    });
    setTimeout(() => {
      setStep("buy");
      toast({ title: "USDC approved (simulated)", description: "Allowance set for the buy step." });
    }, 1500);
  };

  const handleBuy = () => {
    setStep("pending");
    toast({
      title: "Buying membership (simulated)",
      description: "Routing USDC through protocol receipts.",
    });
    setTimeout(() => {
      setStep("success");
      toast({
        title: "Seat acquired (simulated)",
        description: "Receipt generated. No real transaction occurred.",
      });
    }, 2000);
  };

  const resetFlow = () => {
    setStep("input");
    toast({ title: "Flow reset", description: "Returned to amount entry." });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acquire Seat</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Route USDC natively to take a seat. Capital footprint, not a purchasable rank.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={step} onValueChange={(v: FlowState) => setStep(v)}>
            <SelectTrigger
              className="w-[170px] h-8 text-xs bg-white/5 border-white/10"
              data-testid="select-simulate-state"
            >
              <SelectValue placeholder="Simulate State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="input">State: Input</SelectItem>
              <SelectItem value="approve">State: Approve</SelectItem>
              <SelectItem value="approving">State: Approving</SelectItem>
              <SelectItem value="buy">State: Buy</SelectItem>
              <SelectItem value="pending">State: Pending</SelectItem>
              <SelectItem value="success">State: Success</SelectItem>
              <SelectItem value="failed">Error: Failed Tx</SelectItem>
              <SelectItem value="wrong-chain">Error: Wrong Chain</SelectItem>
            </SelectContent>
          </Select>
          <StatusBadge status="ADAPTER REQUIRED" />
          <StatusBadge status="SIMULATED PROTOTYPE" />
        </div>
      </div>

      {/* Doctrine note */}
      <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl text-sm text-foreground/90 space-y-2">
        <p>
          Seat identity is binary. Contribution depth is variable. Capital footprint reflects
          verified USDC routed through protocol receipts.
        </p>
        <p className="text-xs text-muted-foreground">
          Purchase-flow preview only. In production, approve + buy route USDC natively through{" "}
          <span className="font-mono">MembershipSaleV3</span> with the default{" "}
          <span className="font-mono">ZERO_SOURCE_ID</span>. Here every step is simulated — no wallet
          write and no contract call (ADAPTER REQUIRED).
        </p>
      </div>

      {/* Real wallet reality layer — SEPARATE from the simulated purchase flow below */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Real wallet (read-only)
        </h2>
        <p className="text-xs text-muted-foreground max-w-2xl">
          Your real wallet, read-only — connect, check the network, and read your live SYN balance through
          your own provider. This is entirely separate from the simulated purchase flow below, which writes
          nothing and routes no capital.
        </p>
        <WalletStatePanel />
      </div>

      {/* Connection + Network status (simulated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5"
          data-testid="status-wallet"
        >
          <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-green-500" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium">Wallet connected (simulated)</div>
            <div className="text-xs text-muted-foreground font-mono truncate">
              {MOCK_DATA.wallet}
            </div>
          </div>
        </div>
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            step === "wrong-chain"
              ? "border-red-500/30 bg-red-500/10"
              : "border-white/10 bg-white/5"
          }`}
          data-testid="status-network"
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              step === "wrong-chain"
                ? "bg-red-500/10 border-red-500/20"
                : "bg-green-500/10 border-green-500/20"
            }`}
          >
            <Network
              className={`w-4 h-4 ${step === "wrong-chain" ? "text-red-500" : "text-green-500"}`}
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium">
              {step === "wrong-chain" ? "Wrong network" : "Network check passed"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {step === "wrong-chain"
                ? "Switch to continue"
                : MOCK_DATA.network}
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between px-1" data-testid="flow-stepper">
        {STEPPER.map((s, i) => {
          const done = i < activeStepIndex;
          const current = i === activeStepIndex;
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-mono ${
                    done
                      ? "bg-primary/20 border-primary/40 text-primary"
                      : current
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/5 border-white/10 text-muted-foreground"
                  }`}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider ${
                    current ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPPER.length - 1 && (
                <div
                  className={`h-px flex-1 mx-2 mb-5 ${
                    done ? "bg-primary/40" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error banners */}
      {step === "wrong-chain" && (
        <div
          className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl text-sm text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          data-testid="banner-wrong-chain"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>Wrong network connected. Switch to {MOCK_DATA.network} to continue.</span>
          </div>
          <Button
            variant="outline"
            className="border-red-500/30 hover:bg-red-500/20 text-red-100"
            onClick={() => {
              setStep("input");
              toast({ title: "Network switched (simulated)", description: MOCK_DATA.network });
            }}
            data-testid="btn-switch-network"
          >
            Switch Network (Simulated)
          </Button>
        </div>
      )}

      {step === "failed" && (
        <div
          className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl text-sm text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          data-testid="banner-failed"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>Transaction failed (simulated). The network may be congested. Retry the buy step.</span>
          </div>
          <Button
            variant="outline"
            className="border-red-500/30 hover:bg-red-500/20 text-red-100"
            onClick={() => setStep("buy")}
            data-testid="btn-retry-tx"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: purchase flow */}
        <Card className="bg-white/5 border-white/10 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Membership Purchase</span>
              <span className="text-xs font-mono text-muted-foreground">
                {MOCK_DATA.buyTarget}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">USDC to route</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono text-lg bg-background/50 border-white/10"
                disabled={step !== "input" && step !== "wrong-chain"}
                data-testid="input-usdc-amount"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Minimum entry: {MIN_ENTRY} USDC
                </span>
                {belowMinimum && (
                  <span className="text-red-400" data-testid="text-below-minimum">
                    Below minimum entry
                  </span>
                )}
              </div>
            </div>

            {/* Previews */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                <div className="text-muted-foreground mb-1 text-xs">SYN preview</div>
                <div className="font-mono font-bold text-lg text-primary">
                  {synReceived.toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                <div className="text-muted-foreground mb-1 text-xs">Capital footprint</div>
                <div className="font-mono font-bold text-lg">
                  {(step === "success"
                    ? MOCK_DATA.usdcRouted + numericAmount
                    : numericAmount
                  ).toLocaleString()}{" "}
                  <span className="text-xs text-muted-foreground">USDC</span>
                </div>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                <div className="text-muted-foreground mb-1 text-xs">Contribution depth</div>
                <div className="font-mono text-sm">
                  {MOCK_DATA.contributionDepth} + Time
                </div>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                <div className="text-muted-foreground mb-1 text-xs flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Source
                </div>
                <div className="font-mono text-sm text-primary truncate">ZERO_SOURCE_ID</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  No public referral source applied
                </div>
              </div>
            </div>

            {/* Routing preview */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">Routing preview</div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {ROUTING_SPLIT.vault}/{ROUTING_SPLIT.liquidity}/{ROUTING_SPLIT.operations}
                </span>
              </div>
              {/* Routing bar */}
              <div className="flex h-2 rounded-full overflow-hidden bg-background/50">
                <div className="bg-primary" style={{ width: `${ROUTING_SPLIT.vault}%` }} />
                <div className="bg-primary/60" style={{ width: `${ROUTING_SPLIT.liquidity}%` }} />
                <div className="bg-primary/30" style={{ width: `${ROUTING_SPLIT.operations}%` }} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-primary text-primary" />
                    Vault ({ROUTING_SPLIT.vault}%)
                  </span>
                  <span className="font-mono text-foreground" data-testid="route-vault">
                    {routing.vault} USDC
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-primary/60 text-primary/60" />
                    Liquidity ({ROUTING_SPLIT.liquidity}%)
                  </span>
                  <span className="font-mono text-foreground" data-testid="route-liquidity">
                    {routing.liquidity} USDC
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-primary/30 text-primary/30" />
                    Operations ({ROUTING_SPLIT.operations}%)
                  </span>
                  <span className="font-mono text-foreground" data-testid="route-operations">
                    {routing.operations} USDC
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Introduction — future */}
            <div className="p-4 rounded-lg border border-white/10 bg-background/40 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                  Verified Introduction
                </span>
                <StatusBadge status="V1 CANDIDATE" />
              </div>
              <p className="text-xs text-muted-foreground">
                Optional source attribution is not live. A future preview would attach a verified
                introducer here — for now the default ZERO_SOURCE_ID applies and no referral logic
                runs.
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="opacity-60"
                data-testid="btn-verified-intro"
              >
                <Lock className="w-3 h-3 mr-2" />
                Not available yet
              </Button>
            </div>

            {/* Actions */}
            <div className="pt-2">
              {(step === "input" || step === "wrong-chain") && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setStep("approve")}
                  disabled={step === "wrong-chain" || belowMinimum}
                  data-testid="btn-proceed"
                >
                  Continue to approval
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {step === "approve" && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleApprove}
                  data-testid="btn-approve"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Approve USDC (simulated)
                </Button>
              )}
              {step === "approving" && (
                <Button className="w-full" size="lg" disabled data-testid="btn-approving">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving in wallet...
                </Button>
              )}
              {(step === "buy" || step === "failed") && (
                <Button className="w-full" size="lg" onClick={handleBuy} data-testid="btn-buy">
                  <Receipt className="w-4 h-4 mr-2" />
                  Buy membership (simulated)
                </Button>
              )}
              {step === "pending" && (
                <Button className="w-full" size="lg" disabled data-testid="btn-pending">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transaction pending...
                </Button>
              )}
              {step === "success" && (
                <div className="space-y-3" data-testid="status-success">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg flex items-center justify-center gap-2 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    Seat acquired. Receipt generated (simulated).
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/member/my-syndicate" className="flex-1">
                      <Button className="w-full" data-testid="btn-open-my-syndicate">
                        Open My Syndicate
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={resetFlow}
                      data-testid="btn-reset-flow"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Route again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: receipt + card preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            className={`bg-white/5 border-white/10 transition-all ${
              step === "success" ? "opacity-100 ring-2 ring-primary/50" : "opacity-70"
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
                <span>Receipt preview</span>
                {step === "success" ? (
                  <span className="text-xs text-primary font-medium">Generated</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Pending</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tx hash</span>
                <span>
                  {step === "success" ? MOCK_DATA.receipts.lastPurchase.txHash : "Pending..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">USDC routed</span>
                <span>{numericAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SYN acquired</span>
                <span className="text-primary">{synReceived.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vault</span>
                <span>{routing.vault}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Liquidity</span>
                <span>{routing.liquidity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operations</span>
                <span>{routing.operations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span>ZERO_SOURCE_ID</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timestamp</span>
                <span>{step === "success" ? "Just now" : "Pending..."}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Seat preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                <div className="font-mono text-xs text-muted-foreground mb-4">SEAT</div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold font-mono tracking-tight">
                      {MOCK_DATA.memberNumber}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{MOCK_DATA.chapter}</div>
                  </div>
                  <StatusBadge
                    status="SIMULATED PROTOTYPE"
                    className="bg-background/80 backdrop-blur"
                    showTooltip={false}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Seat identity is binary — paying more never buys a higher rank. Contribution depth
                accrues separately across many axes over time.
              </p>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl border border-white/10 bg-background/40 text-xs text-muted-foreground space-y-1">
            <p className="text-foreground font-medium">What this is</p>
            <p>
              A simulated membership flow. No real contracts, transactions, or wallet writes occur.
              No yield, governance, or treasury claim is offered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
