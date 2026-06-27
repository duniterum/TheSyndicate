import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip, Legend } from "recharts";
import { MOCK_DATA, ROUTING_SPLIT, routeUsdc } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { Link } from "wouter";
import {
  Copy,
  AlertTriangle,
  FileText,
  Database,
  Building2,
  User,
  Globe,
  ShieldOff,
  Clock,
  ArrowRight,
  Flame,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ActionCard } from "@/components/action-card";
import { getActionsByCategory } from "@/lib/actions";
import { getBurnSummary } from "@/lib/fire-ledger";
import { CanonicalContractsList } from "@/components/canonical-contracts";
import { PostureLegend } from "@/components/posture-legend";

const SPLIT_COLORS: Record<string, string> = {
  Vault: "hsl(var(--primary))",
  Liquidity: "hsl(217 91% 60%)",
  Operations: "hsl(271 81% 66%)",
};

export default function Transparency() {
  const { toast } = useToast();
  const { maskAddress, hideBalance } = useApp();

  const protocol = MOCK_DATA.economy.protocol;
  const memberRouting = routeUsdc(MOCK_DATA.usdcRouted);

  const donutData = [
    { name: "Vault", value: ROUTING_SPLIT.vault, color: SPLIT_COLORS.Vault },
    { name: "Liquidity", value: ROUTING_SPLIT.liquidity, color: SPLIT_COLORS.Liquidity },
    { name: "Operations", value: ROUTING_SPLIT.operations, color: SPLIT_COLORS.Operations },
  ];

  const protocolSplit = [
    { name: "Vault", pct: ROUTING_SPLIT.vault, amount: protocol.vault, note: "Protocol-controlled reserve for long-term viability and strategic expansion. Not a community-governed treasury, not a yield pool." },
    { name: "Liquidity", pct: ROUTING_SPLIT.liquidity, amount: protocol.liquidity, note: "Market depth provisioning. Verifiable on chain via AMM pools." },
    { name: "Operations", pct: ROUTING_SPLIT.operations, amount: protocol.operations, note: "Operational capacity — execution, infrastructure, and active development." },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Address copied", description: text });
  };

  const fmtNum = (n: number, suffix: string) =>
    hideBalance ? `\u2022\u2022\u2022\u2022\u2022 ${suffix}` : `${n.toLocaleString()} ${suffix}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Economy & Transparency</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            A read-only view of how USDC moves through The Syndicate — across the protocol, your seat, and the
            wider ecosystem. Proof for verification, never a claim of entitlement.
          </p>
        </div>
        <StatusBadge status="READ-ONLY" />
      </div>

      {/* Doctrine */}
      <div className="p-5 border border-white/10 bg-white/5 rounded-xl text-center">
        <p className="font-serif text-lg tracking-wide text-muted-foreground">
          "The Syndicate recognizes capital without reducing identity to capital."
        </p>
      </div>

      {/* No entitlement notice */}
      <div className="p-5 border border-destructive/30 bg-destructive/10 rounded-xl text-sm text-destructive flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1 uppercase tracking-wider">No entitlement. No yield. No treasury claim.</p>
          <p className="opacity-90">
            This is a transparent view of capital routing. It does not imply ownership, passive income, governance promise,
            or any future claim. Capital routing is final. All values are prototype data.
          </p>
        </div>
      </div>

      <Tabs defaultValue="protocol" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-9">
          <TabsTrigger value="protocol" className="gap-2"><Building2 className="w-4 h-4" /> Protocol</TabsTrigger>
          <TabsTrigger value="member" className="gap-2"><User className="w-4 h-4" /> Member</TabsTrigger>
          <TabsTrigger value="ecosystem" className="gap-2"><Globe className="w-4 h-4" /> Ecosystem</TabsTrigger>
        </TabsList>

        {/* ============ PROTOCOL ECONOMY ============ */}
        <TabsContent value="protocol" className="space-y-6 mt-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Protocol Economy</h2>
            <StatusBadge status="LIVE NOW" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 md:col-span-1 flex flex-col justify-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Total USDC Routed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono tracking-tight text-primary">{protocol.totalUsdcRouted}</div>
                <p className="text-xs text-muted-foreground mt-2 border-t border-white/5 pt-2">
                  Total verifiable protocol intake. Simulated prototype figure.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 md:col-span-2">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle>Global Routing Allocation — 70% / 20% / 10%</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Acquisition-first: Net USDC Routed = gross − acquisition, then split 70% / 20% / 10%
                  (Vault / Liquidity / Operations). Acquisition applies only with approved source
                  attribution; the default ZERO_SOURCE_ID buy has zero acquisition.
                </p>
              </CardHeader>
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="h-[250px] w-full md:w-1/2 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RTooltip
                        formatter={(value: number, name: string) => [`${value}%`, name]}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                        itemStyle={{ color: "hsl(var(--foreground))", fontFamily: "var(--font-mono)" }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 p-6 bg-background/30 flex flex-col justify-center space-y-4">
                  {protocolSplit.map((seg) => (
                    <div key={seg.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold" style={{ color: SPLIT_COLORS[seg.name] }}>{seg.name} ({seg.pct}%)</span>
                        <span className="font-mono">{seg.amount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{seg.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Routing wallet references */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" /> Routing Wallet References
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Capital is routed to three endpoints. The addresses below are READ-ONLY PRODUCTION
                PROOF — canonical wallets copied from the porting map, shown as static references
                with read-only explorer links. Nothing is wired; a live balance read is ADAPTER REQUIRED.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MOCK_DATA.routingWallets.map((w) => (
                  <div key={w.name} className="p-4 bg-background/40 rounded-lg border border-white/5 space-y-3" data-testid={`wallet-${w.name}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm" style={{ color: SPLIT_COLORS[w.name] }}>{w.name}</span>
                      <Badge variant="outline" className="font-mono text-[10px] tracking-wider border-white/10 bg-white/5">{w.pct}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{w.purpose}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono bg-background p-2 rounded border border-white/5">
                      <span className="truncate mr-2">{maskAddress ? "0x\u2022\u2022\u2022\u2026" : w.address}</span>
                      <button onClick={() => handleCopy(w.address)} className="hover:text-primary transition-colors shrink-0" title="Copy address (read-only production proof — copying does not wire any contract)">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                        Read-only proof
                      </Badge>
                      {w.explorerUrl && (
                        <a href={w.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground inline-flex items-center gap-1" title="Read-only explorer — reference only, nothing wired">
                          <ExternalLink className="w-3 h-3" /> Explorer
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Protocol-controlled assets concept */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle>Protocol-Controlled Assets</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Vault holds protocol-controlled capital designated for long-term viability, strategic expansion, and
                institutional underwriting. It is not a community treasury governed by token voting, nor a pool for passive
                distribution. Liquidity provides market depth; Operations funds execution capacity. Members receive
                verifiable proof of routing — transparency for verification, not a governance or ownership claim.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ MEMBER ECONOMY ============ */}
        <TabsContent value="member" className="space-y-6 mt-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Member Economy</h2>
            <StatusBadge status="LIVE NOW" />
          </div>
          <p className="text-sm text-muted-foreground">Your seat's capital footprint and routing history.</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">My USDC Routed</div>
                <div className="text-2xl font-bold font-mono mt-1 text-primary">{fmtNum(MOCK_DATA.usdcRouted, "")}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">My SYN Acquired</div>
                <div className="text-2xl font-bold font-mono mt-1">{fmtNum(MOCK_DATA.synAcquired, "")}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Contribution Depth</div>
                <div className="text-base font-bold mt-2">{MOCK_DATA.contributionDepth}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Capital Footprint</div>
                <div className="text-2xl font-bold font-mono mt-1">{fmtNum(MOCK_DATA.usdcRouted, "USDC")}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My routing history */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" /> My Routing History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Your {MOCK_DATA.usdcRouted} USDC, split by the canonical 70% / 20% / 10% routing.
                </p>
                {[
                  { name: "Vault", pct: ROUTING_SPLIT.vault, value: memberRouting.vault },
                  { name: "Liquidity", pct: ROUTING_SPLIT.liquidity, value: memberRouting.liquidity },
                  { name: "Operations", pct: ROUTING_SPLIT.operations, value: memberRouting.operations },
                ].map((seg) => (
                  <div key={seg.name} className="space-y-1" data-testid={`member-routing-${seg.name}`}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium" style={{ color: SPLIT_COLORS[seg.name] }}>{seg.name} ({seg.pct}%)</span>
                      <span className="font-mono">{hideBalance ? "\u2022\u2022\u2022\u2022" : `${seg.value} USDC`}</span>
                    </div>
                    <div className="h-1.5 bg-background/50 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full transition-all duration-1000" style={{ width: `${seg.pct}%`, backgroundColor: SPLIT_COLORS[seg.name] }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* My receipts */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> My Receipts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {MOCK_DATA.receipts.sampleReceipts.map((rcpt) => (
                  <div key={rcpt.id} className="p-3 bg-background/40 rounded-lg border border-white/5 space-y-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="font-mono text-sm text-primary">{rcpt.amount}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{rcpt.timestamp}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{rcpt.routing}</div>
                    <div className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                      {rcpt.hash}
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">· simulated</span>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground">Simulated prototype. Explorer links are illustrative.</p>
              </CardContent>
            </Card>
          </div>

          {/* Since I joined */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-primary" /> Since I Joined
                </CardTitle>
                <Link href="/member/activity" className="text-xs text-primary hover:underline">View All</Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {MOCK_DATA.activities.map((act) => (
                <div key={act.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{act.title}</div>
                    <div className="text-xs text-muted-foreground font-mono">{act.date} · {act.category}</div>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{act.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ ECOSYSTEM ECONOMY ============ */}
        <TabsContent value="ecosystem" className="space-y-6 mt-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Ecosystem Economy</h2>
            <StatusBadge status="READ-ONLY" />
          </div>
          <p className="text-sm text-muted-foreground">
            The wider set of engines that route or will route capital through The Syndicate. Live surfaces and future
            modules are labeled clearly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_DATA.economy.ecosystem.map((e) => (
              <Card key={e.name} className="bg-white/5 border-white/10" data-testid={`ecosystem-${e.name}`}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <span className="font-medium">{e.name}</span>
                  <StatusBadge status={e.status as any} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market & liquidity tools — safely framed, not wired */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Market &amp; Liquidity Tools</h3>
              <StatusBadge status="FUTURE" showTooltip={false} />
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Swap and liquidity engines are external concepts, not wired in this prototype. They carry market risk,
              slippage, and impermanent loss. Nothing here is a promised return, and any contract address must be
              verified from an official channel.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...getActionsByCategory("dex"), ...getActionsByCategory("liquidity")].map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>

          {/* Proof of Fire link */}
          <Card className="bg-orange-500/[0.05] border-orange-500/20">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">Proof of Fire</h3>
                    <StatusBadge status="SIMULATED PROTOTYPE" showTooltip={false} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                    A burn retires SYN supply as a costly signal — never minted, never a price promise.
                    {" "}{getBurnSummary().totalSyn.toLocaleString()} SYN considered retired across the prototype (simulated). See how it is recorded as proof.
                  </p>
                </div>
              </div>
              <Link href="/member/fire">
                <Button variant="secondary" className="group shrink-0">
                  <Flame className="w-4 h-4 mr-2" /> View the Fire Ledger
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-transparent border border-white/10 border-dashed">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold">Architecture & Contract Layers</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                  Future engines like ProductSaleRouter and SwapRail are planned, not built. Review the full contract
                  architecture and activation gates.
                </p>
              </div>
              <Link href="/member/architecture">
                <Button variant="secondary" className="group">
                  View Architecture
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Market & token contracts + posture legend */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <Database className="w-5 h-5 text-primary" /> Market &amp; Token Contracts
            <StatusBadge status="READ-ONLY PRODUCTION PROOF" showTooltip={false} className="scale-90 origin-left" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            The canonical token and market contracts behind the economy — the SYN accounting unit and
            USDC, the Trader Joe SYN/USDC pair, and the Proof-of-Fire burn sink. Each is READ-ONLY
            PRODUCTION PROOF: a copyable canonical address with a read-only explorer link. Nothing is
            wired — a live read or write is ADAPTER REQUIRED. The full set lives in the Registry.
          </p>
          <CanonicalContractsList keys={["SYN", "USDC", "TraderJoeLpPair", "SynBurnAddress"]} />
          <div className="pt-2 border-t border-white/5">
            <h4 className="text-sm font-semibold mb-3">Data posture legend</h4>
            <PostureLegend
              postures={["LIVE_READ", "READ_ONLY_PROOF", "ADAPTER_REQUIRED", "EXTERNAL", "NOT_LIVE"]}
              compact
            />
          </div>
        </CardContent>
      </Card>

      {/* Trust boundaries */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="flex items-center gap-2">
            <ShieldOff className="w-5 h-5 text-primary" /> Trust Boundaries
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            What The Syndicate explicitly does not promise. These boundaries are part of the institution's honesty.
          </p>
          <div className="flex flex-wrap gap-2">
            {MOCK_DATA.trustBoundaries.map((b) => (
              <Badge
                key={b}
                variant="outline"
                className="text-xs font-medium border-white/10 bg-background/40 text-muted-foreground py-1.5 px-3"
              >
                {b}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
