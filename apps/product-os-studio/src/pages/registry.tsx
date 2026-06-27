import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MOCK_DATA } from "@/lib/mock-data";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layers, Fingerprint, Search } from "lucide-react";
import { ContractCopyRow } from "@/components/contract-copy-row";

export default function Registry() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Protocol Registry <StatusBadge status="READ-ONLY" />
          </h1>
          <p className="text-muted-foreground mt-2">Institutional Source-of-Truth for Contract Modules</p>
        </div>
        <Link href="/member/architecture">
          <Button variant="outline" className="w-full md:w-auto">
            <Layers className="w-4 h-4 mr-2" /> View Architecture Diagram
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="bg-blue-500/5 border-blue-500/20 flex-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full shrink-0">
              <Fingerprint className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-blue-400/80 uppercase tracking-wider mb-1 font-semibold">Current Source State</div>
              <div className="text-lg font-bold text-blue-100 flex items-center gap-2">
                PAUSED <StatusBadge status="IN REVIEW" showTooltip={false} className="scale-75 origin-left" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 flex-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-full shrink-0">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Public Default Source</div>
              <div className="text-lg font-mono font-bold">{MOCK_DATA.defaultSourceId}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DATA.contractLayers.map(layer => {
          const isLive = layer.status === "LIVE NOW";
          const isFuture = layer.status === "FUTURE";
          const isReview = layer.status === "IN REVIEW";
          
          return (
            <Card key={layer.name} className={`flex flex-col border transition-all ${
              isLive ? 'bg-white/5 border-white/10 hover:border-primary/50' :
              isFuture ? 'bg-transparent border-white/10 border-dashed opacity-70' :
              'bg-yellow-500/5 border-yellow-500/20'
            }`}>
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex justify-between items-start">
                  <CardTitle className={`text-lg ${isLive ? 'text-primary' : isFuture ? 'text-muted-foreground' : 'text-yellow-500'}`}>
                    {layer.name}
                  </CardTitle>
                  <StatusBadge status={layer.status as any} />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-4">
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Purpose</span>
                    <span className="font-medium">{layer.purpose}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Contract Address</span>
                      {layer.proof ? (
                        <>
                          <StatusBadge status="READ-ONLY PRODUCTION PROOF" showTooltip={false} className="scale-90 origin-left" />
                          <StatusBadge status="ADAPTER REQUIRED" showTooltip={false} className="scale-90 origin-left" />
                        </>
                      ) : (
                        <StatusBadge status="PROTOTYPE PLACEHOLDER" showTooltip={false} className="scale-90 origin-left" />
                      )}
                    </div>
                    {layer.address.startsWith("0x") ? (
                      <>
                        <span className="font-mono text-xs text-muted-foreground break-all">{layer.address}</span>
                        {layer.proof ? (
                          <span className="text-[10px] text-emerald-500/80 uppercase tracking-wider">
                            Read-only production proof — canonical address from the porting map. Nothing is wired (a live read is ADAPTER REQUIRED).
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/70 italic">
                            Placeholder — not a canonical address; a Studio concept, not in the production porting map.
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">Not Deployed</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-lg flex items-center gap-2">
            <Fingerprint className="w-4 h-4" /> Contract Layer Status
            <StatusBadge status="READ-ONLY PRODUCTION PROOF" showTooltip={false} className="scale-90 origin-left" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Module names, purposes, and the PAUSED source posture use production vocabulary and
            module roles. Production-deployed contracts now show their canonical address as
            READ-ONLY PRODUCTION PROOF, copied from the production porting map
            (<span className="font-mono">STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md</span>) — a
            static reference with a read-only explorer link. Nothing here is wired: a live read or
            write is ADAPTER REQUIRED. Roadmap and Studio-only concepts have no canonical address.
          </p>
          {MOCK_DATA.contractLayers.map((layer) => (
            <ContractCopyRow key={layer.name} layer={layer} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}