import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip, Legend } from "recharts";
import { MOCK_DATA, ROUTING_SPLIT, routeUsdc } from "@/lib/mock-data";
import { PublicProofNote, ConnectForPersonalCta } from "@/components/connect-cta";
import { CanonicalContractsList } from "@/components/canonical-contracts";
import { PostureLegend } from "@/components/posture-legend";
import { useProtocolSnapshot } from "@/lib/protocol-snapshot-hooks";
import { LiveHeldBalance } from "@/components/live-held-balance";
import { Database, Building2, Globe, ShieldOff, ExternalLink } from "lucide-react";

const SPLIT_COLORS: Record<string, string> = {
  Vault: "hsl(var(--primary))",
  Liquidity: "hsl(217 91% 60%)",
  Operations: "hsl(271 81% 66%)",
};

// Maps each routing wallet name to its live, read-only USDC balance fact (protocol snapshot).
const ROUTING_BALANCE_KEY: Record<string, string> = {
  Vault: "vault-usdc",
  Liquidity: "liquidity-usdc",
  Operations: "operations-usdc",
};

export default function PublicEconomy() {
  const protocol = MOCK_DATA.economy.protocol;
  const ps = MOCK_DATA.protocolStats;

  // One grouped, read-only snapshot read for the routing wallets; injected inline into the
  // existing wallet-reference cards below (no separate technical panel).
  const { snapshot, loading } = useProtocolSnapshot({ groups: ["routing"] });
  const heldFor = (name: string) =>
    snapshot?.balances.find((b) => b.key === ROUTING_BALANCE_KEY[name]);

  const exampleAmount = 1000;
  const exampleRouting = routeUsdc(exampleAmount);

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

  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl space-y-8" data-testid="page-public-economy">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Economy / Transparency <StatusBadge status="READ-ONLY" />
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            A public view of how capital routes through the protocol and the current state of the ecosystem.
            Proof for verification, never a claim of entitlement.
          </p>
        </div>
      </div>

      <PublicProofNote surfaceId="economy" />

      {/* Doctrine */}
      <div className="p-5 border border-white/10 bg-white/5 rounded-xl text-center">
        <p className="font-serif text-lg tracking-wide text-muted-foreground">
          "{MOCK_DATA.doctrine}"
        </p>
      </div>

      {/* No entitlement — compact neutral truth note (not an alert wall) */}
      <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
        No entitlement, no yield, no treasury claim. This is a transparent view of how capital routes —
        not ownership, passive income, a governance promise, or any future claim. Capital routing is final.
      </p>

      <div className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Protocol Economy
            </h2>
            <StatusBadge status="SIMULATED PROTOTYPE" />
          </div>
          <p className="text-xs text-muted-foreground">
            Displayed totals are prototype figures, not live values.
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Total USDC Routed</div>
              <div className="text-2xl font-bold font-mono mt-1 text-primary">{protocol.totalUsdcRouted}</div>
              <div className="text-[10px] text-muted-foreground mt-2 uppercase">Simulated Prototype</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Members Seated</div>
              <div className="text-2xl font-bold font-mono mt-1">{ps.members}</div>
              <div className="text-[10px] text-muted-foreground mt-2 uppercase">Simulated Prototype</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Chapter Phase</div>
              <div className="text-base font-bold mt-2">{ps.chapter}</div>
              <div className="text-[10px] text-muted-foreground mt-2 uppercase">{ps.chapterIndex} / {ps.chapterTotal}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Protocol Controlled</div>
              <div className="text-2xl font-bold font-mono mt-1">{ps.protocolControlled.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground mt-2 uppercase">Simulated Prototype</div>
            </CardContent>
          </Card>
        </div>

        {/* Routing Allocation */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle>Global Routing Allocation — 70% / 20% / 10%</CardTitle>
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

        {/* Illustrative Example */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              Example Routing — 1,000 USDC <Badge variant="outline" className="text-[10px] ml-2 font-mono">ILLUSTRATIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs text-muted-foreground mb-4">
              This demonstrates how an illustrative 1,000 USDC is routed across the protocol endpoints based on the canonical rules.
            </p>
            {[
              { name: "Vault", pct: ROUTING_SPLIT.vault, value: exampleRouting.vault },
              { name: "Liquidity", pct: ROUTING_SPLIT.liquidity, value: exampleRouting.liquidity },
              { name: "Operations", pct: ROUTING_SPLIT.operations, value: exampleRouting.operations },
            ].map((seg) => (
              <div key={seg.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium" style={{ color: SPLIT_COLORS[seg.name] }}>{seg.name} ({seg.pct}%)</span>
                  <span className="font-mono">{seg.value} USDC</span>
                </div>
                <div className="h-1.5 bg-background/50 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full" style={{ width: `${seg.pct}%`, backgroundColor: SPLIT_COLORS[seg.name] }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

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
              PROOF — canonical wallets from the porting map with read-only explorer links. Each shows
              the USDC it currently holds, read live from the chain: a current on-chain balance, not the
              simulated total routed, and never a claim, yield, or entitlement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_DATA.routingWallets.map((w) => (
                <div key={w.name} className="p-4 bg-background/40 rounded-lg border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm" style={{ color: SPLIT_COLORS[w.name] }}>{w.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px] tracking-wider border-white/10 bg-white/5">{w.pct}%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{w.purpose}</p>
                  <LiveHeldBalance
                    balance={heldFor(w.name)}
                    loading={loading}
                    prefix="Current USDC held"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono bg-background p-2 rounded border border-white/5">
                    <span className="truncate mr-2 text-muted-foreground/60">{w.address}</span>
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
      </div>

      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Ecosystem Map
          </h2>
          <StatusBadge status="READ-ONLY" />
        </div>
        <p className="text-sm text-muted-foreground">
          The wider set of engines that route or will route capital through The Syndicate.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_DATA.economy.ecosystem.map((e) => (
            <Card key={e.name} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <span className="font-medium">{e.name}</span>
                <StatusBadge status={e.status as any} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
              postures={["READ_ONLY_PROOF", "ADAPTER_REQUIRED", "EXTERNAL", "NOT_LIVE"]}
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

      <ConnectForPersonalCta surfaceId="economy" />
    </div>
  );
}
