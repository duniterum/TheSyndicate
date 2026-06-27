import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_DATA } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ExternalLink,
  AlertCircle,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  Wallet as WalletIcon,
  RefreshCw,
  Inbox,
  Wrench,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ActionCard } from "@/components/action-card";
import { getActionsByCategory } from "@/lib/actions";
import { WalletStatePanel } from "@/components/wallet/wallet-state-panel";

type ConnState = "connected" | "pending" | "failed" | "success";

const CONN_META: Record<
  ConnState,
  { label: string; dot: string; text: string; ring: string }
> = {
  connected: { label: "Connected", dot: "bg-green-500", text: "text-green-500", ring: "border-green-500/20 bg-green-500/5" },
  pending: { label: "Connecting", dot: "bg-blue-500 animate-pulse", text: "text-blue-500", ring: "border-blue-500/20 bg-blue-500/5" },
  failed: { label: "Connection Failed", dot: "bg-red-500", text: "text-red-500", ring: "border-red-500/20 bg-red-500/5" },
  success: { label: "Connected", dot: "bg-green-500", text: "text-green-500", ring: "border-green-500/20 bg-green-500/5" },
};

export default function WalletPage() {
  const { toast } = useToast();
  const [showWrongChain, setShowWrongChain] = useState(false);
  const [connState, setConnState] = useState<ConnState>("connected");
  const [loading, setLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const meta = CONN_META[connState];
  const isLive = connState === "connected" || connState === "success";

  const simulateAction = (action: string) => {
    toast({
      title: "Simulated Action",
      description: action,
    });
  };

  const simulateExplorer = (hash: string) => {
    toast({
      title: "Simulated Explorer Link",
      description: `${hash} is a prototype hash. No canonical transaction exists, so no block explorer is available.`,
    });
  };

  const handleConnect = () => {
    setConnState("pending");
    window.setTimeout(() => {
      setConnState("success");
      window.setTimeout(() => setConnState((s) => (s === "success" ? "connected" : s)), 2500);
    }, 1200);
  };

  const handleRefresh = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1400);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${meta.dot}`}></span>
            <span className={`font-medium ${meta.text}`}>{meta.label}</span>
            <span>•</span>
            <span className="font-mono">{MOCK_DATA.wallet}</span>
            <span>•</span>
            <span>{MOCK_DATA.network}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <StatusBadge status="PROTOTYPE WALLET STATE" />
          <StatusBadge status="NOT PRODUCTION AUTH" />
          <StatusBadge status="SIMULATED PROTOTYPE" />
        </div>
      </div>

      <WalletStatePanel />

      <div className="space-y-4 bg-background/50 border border-white/5 p-4 rounded-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Simulate Wallet State
          </div>
          <StatusBadge status="ADAPTER REQUIRED" className="scale-90 origin-left" />
        </div>
        <p className="text-xs text-muted-foreground">
          Production exposes wallet states via{" "}
          <span className="font-mono">useWalletGate</span>:{" "}
          <span className="font-mono">
            unsupported · disconnected · wrongNetwork · ready
          </span>{" "}
          (plus <span className="font-mono">reconnect</span> and a{" "}
          <span className="font-mono">stale</span> read-freshness flag). The Studio simulates a
          representative subset below. Connecting and switching networks
          are a connect-flow preview only — no wallet is contacted and no transaction is signed
          (NO WALLET WRITE).
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {(["connected", "pending", "failed", "success"] as ConnState[]).map((s) => (
            <Button
              key={s}
              variant={connState === s ? "default" : "outline"}
              size="sm"
              className="capitalize"
              onClick={() => setConnState(s)}
              data-testid={`btn-wallet-state-${s}`}
            >
              {s}
            </Button>
          ))}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Switch checked={showWrongChain} onCheckedChange={setShowWrongChain} id="wrong-chain-toggle" data-testid="toggle-wrong-chain" />
            <label htmlFor="wrong-chain-toggle" className="text-sm cursor-pointer text-muted-foreground">Wrong Chain Warning</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={loading} onCheckedChange={setLoading} id="loading-toggle" data-testid="toggle-loading" />
            <label htmlFor="loading-toggle" className="text-sm cursor-pointer text-muted-foreground">Loading State</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={showEmpty} onCheckedChange={setShowEmpty} id="empty-toggle" data-testid="toggle-empty" />
            <label htmlFor="empty-toggle" className="text-sm cursor-pointer text-muted-foreground">Empty State</label>
          </div>
        </div>
      </div>

      {showWrongChain && (
        <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl text-sm text-red-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>Wrong network connected. Please switch to Avalanche C-Chain to interact with the protocol.</span>
          </div>
          <Button variant="outline" className="border-red-500/30 hover:bg-red-500/20 text-red-100 shrink-0" onClick={() => simulateAction("Switched network to Avalanche C-Chain")} data-testid="btn-wallet-switch-network">
            Switch Network (Simulated)
          </Button>
        </div>
      )}

      {connState === "success" && (
        <div className="p-4 border border-green-500/30 bg-green-500/10 rounded-xl text-sm text-green-200 flex items-center gap-2" data-testid="banner-wallet-success">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <span>Wallet connected successfully. Session is simulated — no real wallet is linked. This is a connect-flow preview, not production authentication.</span>
        </div>
      )}

      {connState === "pending" && (
        <Card className="bg-white/5 border-white/10" data-testid="card-wallet-pending">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <div>
              <div className="text-lg font-semibold">Connecting wallet…</div>
              <p className="text-sm text-muted-foreground mt-1">Awaiting a simulated signature. This may take a moment.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {connState === "failed" && (
        <Card className="bg-red-500/5 border-red-500/20" data-testid="card-wallet-failed">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-4">
            <XCircle className="w-10 h-10 text-red-500" />
            <div>
              <div className="text-lg font-semibold text-red-200">Wallet connection failed</div>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">The simulated connection request was rejected or timed out. No real wallet was contacted.</p>
            </div>
            <Button variant="outline" className="border-red-500/30 hover:bg-red-500/20 text-red-100" onClick={handleConnect} data-testid="btn-wallet-retry">
              <WalletIcon className="w-4 h-4 mr-2" /> Retry Connection (Simulated)
            </Button>
          </CardContent>
        </Card>
      )}

      {isLive && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              [0, 1, 2].map((i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-7 w-20" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground font-medium">AVAX Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{MOCK_DATA.avaxBalance}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground font-medium">USDC Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{MOCK_DATA.usdcBalance.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground font-medium">SYN Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono text-primary">{MOCK_DATA.synBalance.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-base flex items-center justify-between gap-2">
                <span className="flex items-center">
                  <WalletIcon className="w-4 h-4 mr-2 text-primary" /> Token Tools
                </span>
                <StatusBadge status="SIMULATED PROTOTYPE" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Import or copy the SYN accounting unit. The SYN address is a READ-ONLY PRODUCTION PROOF
                constant, but previews are simulated and no wallet call is made. SYN is an accounting unit,
                not a financial right.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {getActionsByCategory("wallet")
                  .filter((a) => a.href !== "/member/wallet")
                  .map((action) => (
                    <ActionCard key={action.id} action={action} />
                  ))}
              </div>
              <Button asChild variant="outline" size="sm" data-testid="wallet-to-toolkit">
                <Link href="/member/toolkit">
                  <Wrench className="w-4 h-4" /> Open the full Toolkit
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Transactions
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={handleRefresh} data-testid="btn-refresh-transactions">
                    <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-white/5">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    ))}
                  </div>
                ) : showEmpty ? (
                  <div className="flex flex-col items-center justify-center text-center gap-3 py-12" data-testid="empty-transactions">
                    <Inbox className="w-10 h-10 text-muted-foreground/50" />
                    <div className="text-sm font-medium">No transactions yet</div>
                    <p className="text-xs text-muted-foreground max-w-xs">When you interact with the protocol, simulated receipts will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {MOCK_DATA.transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-white/5">
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{tx.type}</div>
                          <button
                            type="button"
                            onClick={() => simulateExplorer(tx.hash)}
                            className="text-xs text-muted-foreground font-mono hover:text-primary flex items-center gap-1 mt-1 transition-colors"
                            title="Simulated — no canonical explorer link"
                            data-testid={`link-explorer-${tx.id}`}
                          >
                            {tx.hash} <ExternalLink className="w-3 h-3" />
                          </button>
                          <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground/70 mt-1">Simulated link</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono text-muted-foreground mb-1">{tx.time}</div>
                          {tx.status === "confirmed" && <span className="text-[10px] uppercase font-mono tracking-wider text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Confirmed</span>}
                          {tx.status === "pending" && <span className="text-[10px] uppercase font-mono tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1 justify-end"><Loader2 className="w-3 h-3 animate-spin" /> Pending</span>}
                          {tx.status === "failed" && <span className="text-[10px] uppercase font-mono tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Failed</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Token Approvals
                    <StatusBadge status="SIMULATED PROTOTYPE" showTooltip={false} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[0, 1].map((i) => (
                        <div key={i} className="p-3 bg-background/50 rounded-lg border border-white/5 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {MOCK_DATA.approvals.map((approval, i) => (
                        <div key={i} className="flex flex-col gap-2 p-3 bg-background/50 rounded-lg border border-white/5">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-sm flex items-center gap-2">
                                {approval.token}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${approval.status === "approved" ? "bg-green-500/10 text-green-500" : "bg-neutral-500/10 text-neutral-500"}`}>
                                  {approval.status}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground font-mono mt-1">Contract: {approval.contract}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-mono mb-2">Allowance: {approval.amount}</div>
                              {approval.status === "approved" ? (
                                <Button variant="outline" size="sm" className="h-6 text-xs text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => simulateAction(`Revoked allowance for ${approval.contract}`)} data-testid={`btn-revoke-${approval.contract}`}>Revoke</Button>
                              ) : (
                                <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => simulateAction(`Approved allowance for ${approval.contract}`)} data-testid={`btn-approve-${approval.contract}`}>Approve</Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-primary" />
                    Security Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• Only approve contracts you trust.</p>
                  <p>• The Syndicate protocol contracts are open source and verified.</p>
                  <p>• Revoke allowances for deprecated or unused contracts to maintain wallet hygiene.</p>
                  <p>• Never share your seed phrase or private keys.</p>
                  <p>• Explorer links on this surface are simulated — no canonical addresses or hashes exist in the prototype.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
