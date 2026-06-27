import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Shield, Lock, FileText, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SeatRecord() {
  const unresolvedDecisions = [
    { title: "Issuance Model", options: ["Automatic Issue", "Manual Claim"], icon: FileText },
    { title: "Transferability", options: ["Soulbound (SBT)", "Transferable (NFT)"], icon: Lock },
    { title: "Privacy", options: ["Public Profile", "Private Zero-Knowledge"], icon: EyeOff },
    { title: "Recovery", options: ["Social Recovery", "Wallet-bound only"], icon: Key }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SeatRecord / Identity</h1>
          <p className="text-muted-foreground mt-2">Future Identity Prototype</p>
        </div>
        <StatusBadge status="FUTURE" />
      </div>

      <div className="p-4 border border-white/10 bg-white/5 rounded-xl text-sm">
        <p className="font-medium mb-1">Product Thinking Only</p>
        <p className="text-muted-foreground">This surface explores unresolved product decisions for the SeatRecord721 layer. No contract logic is implemented.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {unresolvedDecisions.map((decision, i) => (
          <Card key={i} className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <decision.icon className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{decision.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 text-center text-sm font-medium">
                  {decision.options[0]}
                </div>
                <div className="p-3 rounded-lg border border-white/5 bg-background text-center text-sm text-muted-foreground hover:bg-white/5 transition-colors cursor-pointer">
                  {decision.options[1]}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Proposed Data Payload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
            <div className="p-3 bg-background rounded-lg border border-white/5">
              <div className="text-muted-foreground mb-1">Member Number</div>
              <div className="font-mono">#???</div>
            </div>
            <div className="p-3 bg-background rounded-lg border border-white/5">
              <div className="text-muted-foreground mb-1">Chapter</div>
              <div className="font-mono text-xs">Included</div>
            </div>
            <div className="p-3 bg-background rounded-lg border border-white/5">
              <div className="text-muted-foreground mb-1">Contribution Depth</div>
              <div className="font-mono text-xs">Included</div>
            </div>
            <div className="p-3 bg-background rounded-lg border border-white/5">
              <div className="text-muted-foreground mb-1">Recognition Axes</div>
              <div className="font-mono text-xs">Dynamic</div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block w-full sm:w-auto">
                    <Button variant="default" className="w-full sm:w-auto opacity-50 cursor-not-allowed" disabled data-testid="btn-claim-mint">
                      Claim / Issue SeatRecord721
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-popover border-popover-border text-popover-foreground">
                  <p className="text-xs">Contract not deployed. SeatRecord721 is a future candidate module.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
