import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, QrCode, ShieldAlert, AlertTriangle, ArrowRightLeft, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const [buyerStep, setBuyerStep] = useState<"input" | "receipt">("input");
  const [buyAmount, setBuyAmount] = useState("1000");

  const handleCopy = () => {
    navigator.clipboard.writeText("https://syndicate.money/join?source=0xABCD...1234");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateBuy = () => {
    setBuyerStep("receipt");
    setTimeout(() => setBuyerStep("input"), 5000); // Reset after 5s
  };

  const commissionRate = 0.05; // 5%
  const commission = Number(buyAmount) * commissionRate;
  const netRouted = Number(buyAmount) - commission;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Verified Introduction</h1>
          <p className="text-muted-foreground mt-1">Source-aware membership acquisition protocol</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status="V1 CANDIDATE" />
          <StatusBadge status="SIMULATED PROTOTYPE" />
        </div>
      </div>

      <div className="p-4 border border-orange-500/20 bg-orange-500/5 rounded-xl text-sm text-orange-200">
        <p className="font-bold mb-1 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Not Live Today</p>
        <p>No public source link today, no source dashboard today, no claim UI today, no public source-aware buy path today. NFTs are memory, not financial rights. No yield. No MLM/downline/upline.</p>
        <p className="text-xs text-orange-200/70 mt-2 border-t border-orange-500/10 pt-2">
          In production, <span className="font-mono">SourceRegistryV1</span> is deployed but policy-PAUSED. The only registered entry,
          {" "}<span className="font-mono">INTERNAL_PROTOCOL_TEST_SOURCE_001</span>, is an internal test source returned to PAUSED.
          The default buy path uses <span className="font-mono">ZERO_SOURCE_ID</span> — no attribution, no acquisition. The example below is illustrative only.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="introducer">
            <TabsList className="w-full bg-white/5 border border-white/10 mb-6">
              <TabsTrigger value="introducer" className="flex-1" data-testid="tab-introducer">Approved Introducer View</TabsTrigger>
              <TabsTrigger value="buyer" className="flex-1" data-testid="tab-buyer">Buyer View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="introducer" className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Source Identity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Source Address</span>
                      <span className="font-mono text-primary">0xABCD...1234</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Approved Class</span>
                      <span className="font-mono">V1 Partner</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px] opacity-50">ACTIVE</Badge>
                        <Badge variant="outline" className="border-yellow-500/30 text-yellow-300 bg-yellow-500/10 text-[10px]">PAUSED</Badge>
                        <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 text-[10px] opacity-50">REVOKED</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between gap-2">
                      Candidate Parameters
                      <StatusBadge status="V1 CANDIDATE" showTooltip={false} />
                    </CardTitle>
                    <CardDescription>Proposed for founder review. Not live, not payable.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Acquisition Rate (candidate)</span>
                      <span className="font-mono text-foreground">5.0% USDC</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Direct Payout</span>
                      <span className="text-muted-foreground text-xs flex items-center">Candidate design · not live</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Escrow Fallback</span>
                      <span className="text-muted-foreground text-xs flex items-center">Candidate design · standby</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/70 border-t border-white/5 pt-3">
                      These parameters are a proposal under founder review. No payout is live, no claim UI exists, and no public source link is active.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between gap-2">
                    Generated Introduction Link
                    <StatusBadge status="SIMULATED PROTOTYPE" showTooltip={false} />
                  </CardTitle>
                  <CardDescription>Example only. No public source link is live today.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-shrink-0 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center w-24 h-24">
                      <QrCode className="w-12 h-12 text-muted-foreground opacity-50" />
                    </div>
                    <div className="flex-grow w-full space-y-4">
                      <div className="flex gap-2">
                        <div className="flex-1 p-3 bg-background border border-white/10 rounded font-mono text-sm truncate flex items-center">
                          https://syndicate.money/join?source=0xABCD...1234
                        </div>
                        <Button variant="secondary" onClick={handleCopy} data-testid="btn-copy-link" className="w-28 transition-all h-auto">
                          {copied ? (
                            <span className="flex items-center text-green-500"><Check className="w-4 h-4 mr-1" /> Copied</span>
                          ) : (
                            <span className="flex items-center"><Copy className="w-4 h-4 mr-1" /> Copy</span>
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-block flex-1">
                                <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" disabled data-testid="btn-claim-payout">
                                  Claim Escrowed Payouts
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-popover border-popover-border text-popover-foreground">
                              <p className="text-xs">Claim UI is not live today.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center"><Users className="w-4 h-4 mr-2" /> Referred Buyers (Simulated)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-white/10 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-xs">Buyer Wallet</TableHead>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs text-right">Volume (USDC)</TableHead>
                          <TableHead className="text-xs text-right">Candidate Share (sim)</TableHead>
                          <TableHead className="text-xs text-center">Ref</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-mono text-xs">0x71C...976F</TableCell>
                          <TableCell className="text-xs text-muted-foreground">Today</TableCell>
                          <TableCell className="text-xs text-right font-mono">1,000</TableCell>
                          <TableCell className="text-xs text-right font-mono text-muted-foreground">~50</TableCell>
                          <TableCell className="text-center">
                            <span className="text-[10px] text-muted-foreground/60">sim</span>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-mono text-xs">0x3A2...145A</TableCell>
                          <TableCell className="text-xs text-muted-foreground">Yesterday</TableCell>
                          <TableCell className="text-xs text-right font-mono">500</TableCell>
                          <TableCell className="text-xs text-right font-mono text-muted-foreground">~25</TableCell>
                          <TableCell className="text-center">
                            <span className="text-[10px] text-muted-foreground/60">sim</span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 opacity-60 relative overflow-hidden">
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-background/90 px-4 py-2 rounded-full border border-white/10 text-sm font-medium cursor-help shadow-xl">
                          Source Dashboard Not Live
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover border-popover-border text-popover-foreground">
                        <p className="text-xs">Advanced source conversion analytics are planned for V2.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Conversion Analytics</CardTitle>
                </CardHeader>
                <CardContent className="h-40 flex items-end gap-2 px-6 pb-6">
                  {[40, 25, 60, 30, 80, 45, 90].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${h}%` }}></div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 border-l-4 border-l-orange-500">
                <CardContent className="p-4 flex gap-4">
                  <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-orange-200 mb-1">Compliance & Disclosure Panel</p>
                    <p className="text-muted-foreground">Your source link must not be promoted as a financial offering, yield opportunity, or MLM. Do not promise downline commissions. Protocol mechanics are transparent; misrepresentation will result in immediate source revocation.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buyer" className="space-y-6 animate-in fade-in">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Purchase via Introduction</CardTitle>
                  <CardDescription>Simulated buy flow capturing source attribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-background/50 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-muted-foreground mb-1 text-sm">Selected Source Identity (preview)</div>
                      <div className="font-mono text-primary font-bold">0xABCD...1234</div>
                    </div>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10" data-testid="btn-clear-source">
                      Clear Source (Use ZERO_SOURCE_ID)
                    </Button>
                  </div>

                  {buyerStep === "input" ? (
                    <div className="space-y-6 animate-in fade-in">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">USDC to Route</label>
                        <Input 
                          type="number" 
                          value={buyAmount} 
                          onChange={(e) => setBuyAmount(e.target.value)}
                          className="font-mono bg-background border-white/10 max-w-xs"
                          data-testid="input-simulate-buy"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm border-t border-white/5 pt-6">
                        <div className="p-3 bg-white/5 rounded border border-white/5">
                          <div className="text-muted-foreground mb-1">Gross USDC</div>
                          <div className="font-mono">{buyAmount}</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded border border-white/5 flex flex-col justify-center items-center">
                          <ArrowRightLeft className="w-4 h-4 text-muted-foreground mb-1" />
                          <div className="text-xs text-muted-foreground">Split via SaleV3</div>
                        </div>
                        <div className="space-y-2">
                          <div className="p-2 bg-white/5 rounded border border-white/10 text-muted-foreground">
                            <div className="text-[10px] uppercase tracking-wider mb-0.5">Candidate Source Share (preview)</div>
                            <div className="font-mono text-sm">{commission.toFixed(2)} USDC</div>
                          </div>
                          <div className="p-2 bg-primary/10 rounded border border-primary/20 text-primary">
                            <div className="text-[10px] uppercase tracking-wider mb-0.5">Net Routed to Protocol</div>
                            <div className="font-mono text-sm">{netRouted.toFixed(2)} USDC</div>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full" size="lg" onClick={handleSimulateBuy} data-testid="btn-simulate-buy">
                        Simulate Purchase
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in slide-in-from-bottom-2">
                      <div className="p-6 border border-white/10 bg-white/5 rounded-xl text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/15 text-primary mb-2">
                          <Check className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Simulated Purchase Recorded</h3>
                        <p className="text-xs text-muted-foreground">Prototype preview. No funds moved. Not payable.</p>
                        
                        <div className="bg-background rounded-lg border border-white/10 p-4 text-left max-w-sm mx-auto space-y-2 font-mono text-xs">
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-muted-foreground">Source Applied</span>
                            <span className="text-primary">0xABCD...1234</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 py-2">
                            <span className="text-muted-foreground">Gross Amount</span>
                            <span>{buyAmount} USDC</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 py-2">
                            <span className="text-muted-foreground">Candidate Source Share</span>
                            <span className="text-muted-foreground">{commission.toFixed(2)} USDC</span>
                          </div>
                          <div className="flex justify-between pt-2">
                            <span className="text-muted-foreground">Net Vault Routed</span>
                            <span>{netRouted.toFixed(2)} USDC</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold text-purple-400 flex justify-between items-center">
                V1 Candidate Scope
                <StatusBadge status="V1 CANDIDATE" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Invite-only, manually approved</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> MembershipSaleV3 integration only</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Buyer-visible source identity</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Buyer-clearable (return to ZERO_SOURCE_ID)</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Direct-payout-first architecture</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Escrow fallback for failed transfers</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold text-blue-400 flex justify-between items-center">
                V2 Candidate Scope
                <StatusBadge status="V2 CANDIDATE" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2"><span className="w-4 h-4 rounded-full border border-white/20 shrink-0 mt-0.5"></span> Source Dashboard & Analytics</li>
                <li className="flex items-start gap-2"><span className="w-4 h-4 rounded-full border border-white/20 shrink-0 mt-0.5"></span> Address Aliases (ENS/Custom)</li>
                <li className="flex items-start gap-2"><span className="w-4 h-4 rounded-full border border-white/20 shrink-0 mt-0.5"></span> Custom Campaign Pages</li>
                <li className="flex items-start gap-2"><span className="w-4 h-4 rounded-full border border-white/20 shrink-0 mt-0.5"></span> Claim UI (if escrow approved)</li>
                <li className="flex items-start gap-2"><span className="w-4 h-4 rounded-full border border-white/20 shrink-0 mt-0.5"></span> B2B/Partner Campaign Tooling</li>
                <li className="flex items-start gap-2"><span className="w-4 h-4 rounded-full border border-white/20 shrink-0 mt-0.5"></span> On-chain Source Reputation</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
