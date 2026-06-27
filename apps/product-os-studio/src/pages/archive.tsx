import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MOCK_DATA } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShareDialog } from "@/components/share-dialog";
import { CanonicalContractsList } from "@/components/canonical-contracts";
import { Database, Share2 } from "lucide-react";

export default function Archive() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Archive / NFT Memory</h1>
          <p className="text-muted-foreground mt-2">Protocol Memory Layer</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <StatusBadge status="READ-ONLY PRODUCTION PROOF" />
          <StatusBadge status="SIMULATED PROTOTYPE" />
        </div>
      </div>

      <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl text-sm text-blue-200 space-y-1">
        <p className="font-bold mb-1">Memory, Not Claims</p>
        <p>NFTs are memory. NFTs are not seats. NFTs do not create financial rights. Archive is not source-aware today.</p>
        <p className="text-xs text-blue-200/80">
          Backed by <span className="font-mono">Archive1155</span> (ERC-1155) read-only memory in production.
          Anchoring and minting are not wired in the Studio (MINT ADAPTER REQUIRED).
        </p>
      </div>

      <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-sm text-emerald-100/90 space-y-1" data-testid="archive-id-scheme">
        <p className="font-bold mb-1 flex items-center gap-2">
          Archive IDs <StatusBadge status="READ-ONLY PRODUCTION PROOF" showTooltip={false} className="scale-90 origin-left" />
        </p>
        <ul className="space-y-1 text-emerald-100/80">
          <li><span className="font-mono">#1</span> First Signal — public, open.</li>
          <li><span className="font-mono">#2</span> Reserved / disabled — a future <span className="font-mono">SeatRecord721</span> identity record (not deployed).</li>
          <li><span className="font-mono">#3</span> Patron Seal — gated.</li>
        </ul>
        <p className="text-xs text-emerald-100/70">
          Canonical IDs from the production porting map, shown read-only. Nothing is wired (MINT ADAPTER REQUIRED).
        </p>
      </div>

      {/* Canonical Archive contract + holdings posture */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="flex items-center gap-2 flex-wrap text-lg">
            <Database className="w-5 h-5 text-primary" /> Canonical Archive Contract
            <StatusBadge status="READ-ONLY PRODUCTION PROOF" showTooltip={false} className="scale-90 origin-left" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Protocol memory lives in the canonical <span className="font-mono">Archive1155</span> (ERC-1155)
            contract — copied read-only from the production porting map, with a read-only explorer link.
            Reading your own memory holdings (an ERC-1155 <span className="font-mono">balanceOf</span> scan of
            your wallet) is ADAPTER REQUIRED, and anchoring / minting is never wired in the Studio.
          </p>
          <CanonicalContractsList keys={["Archive1155"]} />
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <StatusBadge status="ADAPTER REQUIRED" showTooltip={false} className="scale-90 origin-left" />
            <span>Your live memory-holdings scan needs a Codex production adapter.</span>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mt-8 border-b border-white/10 pb-2">Current Collection (Simulated)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DATA.archiveItems.map((item, i) => (
          <Card key={item.id} className="bg-white/5 border-white/10 overflow-hidden">
            <div className="aspect-square bg-white/5 relative">
              {/* Generated image placeholder */}
              <img 
                src={`/artifact-${i + 1}.png`} 
                alt={item.name} 
                className="w-full h-full object-cover opacity-80 mix-blend-screen"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxYTIwMmMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzRjNTU2ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkFydGlmYWN0PC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              <div className="flex justify-between items-center text-xs font-mono mb-4">
                <span className="text-muted-foreground">{item.type}</span>
                <span>{item.date}</span>
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1">
                        <Button variant="secondary" className="w-full opacity-50 cursor-not-allowed" size="sm" disabled data-testid={`btn-mint-archive-${item.id}`}>Anchor Memory (Closed)</Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border-popover-border text-popover-foreground">
                      <p className="text-xs">Anchoring period has concluded. Read-only artifact.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <ShareDialog
                  payload={{
                    eyebrow: "Archive Memory",
                    title: item.name,
                    summary: item.description,
                    accent: "violet",
                    lines: [
                      { label: "Type", value: item.type },
                      { label: "Date", value: item.date },
                    ],
                    footnote: "memory, not rights",
                    shareText: `I hold "${item.name}" from The Syndicate archive — memory of a moment in a living institution. Memory, not financial rights.`,
                  }}
                  trigger={
                    <Button variant="outline" size="sm" data-testid={`archive-share-${item.id}`}>
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-12 border-b border-white/10 pb-2 text-muted-foreground">Future Evolution (FUTURE)</h2>
      <Card className="bg-white/5 border-white/10 border-dashed">
        <CardContent className="p-6">
          <h3 className="font-bold mb-2">Dynamic Memory</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Future iterations of the archive may support dynamic metadata reflecting ongoing protocol contributions.
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <Button variant="outline" className="opacity-50 cursor-not-allowed" disabled data-testid="btn-evolution-proposal">Evolution Proposal In Review</Button>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-popover border-popover-border text-popover-foreground">
                <p className="text-xs">Module is currently in Founder Review.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
