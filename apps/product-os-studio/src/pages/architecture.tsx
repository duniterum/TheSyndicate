import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MOCK_DATA } from "@/lib/mock-data";
import { AlertCircle } from "lucide-react";

export default function Architecture() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Smart Contract Architecture</h1>
          <p className="text-muted-foreground mt-2">Protocol Layers & Data Flow</p>
        </div>
        <StatusBadge status="READ-ONLY" />
      </div>

      <div className="p-4 border border-white/10 bg-white/5 rounded-xl text-sm flex items-start gap-3 text-muted-foreground">
        <AlertCircle className="w-5 h-5 text-primary shrink-0" />
        <p className="font-medium">
          This panel illustrates the conceptual architecture of The Syndicate. No actual deployments, state modifications, or blockchain writes are performed from this surface.
        </p>
      </div>

      <div className="relative mt-12">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 hidden xl:block" />
        
        <div className="space-y-16">
          {MOCK_DATA.contractLayers.map((layer, index) => {
            const isFuture = layer.status === "FUTURE";
            
            return (
              <div key={layer.name} className={`flex flex-col xl:flex-row gap-8 items-center ${index % 2 === 0 ? 'xl:flex-row-reverse' : ''} ${isFuture ? 'opacity-70' : ''}`}>
                <div className="flex-1 w-full">
                  <Card className={`relative ${isFuture ? 'bg-transparent border-dashed border-white/20' : 'bg-white/5 border-white/10 shadow-xl'}`}>
                    <div className={`hidden xl:block absolute top-1/2 -mt-px w-8 h-px ${isFuture ? 'bg-white/20 border-dashed' : 'bg-white/20'} ${index % 2 === 0 ? '-left-8' : '-right-8'}`} />
                    
                    <CardHeader className={`pb-4 border-b ${isFuture ? 'border-dashed border-white/10' : 'border-white/5'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className={`text-xl font-mono tracking-tight ${isFuture ? 'text-muted-foreground' : 'text-primary'}`}>
                            {layer.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{layer.purpose}</p>
                        </div>
                        <StatusBadge status={layer.status as any} />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">User Action</div>
                          <div className="font-medium">{layer.action}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Event/Receipt</div>
                          <div className="font-mono text-xs bg-background/50 p-1 rounded inline-block">{layer.event}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Read Model</div>
                          <div className="font-medium">{layer.readModel}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">UI Surface</div>
                          <div className="font-mono text-xs">{layer.uiSurface}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Risk Level</div>
                          <div className="font-medium flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${layer.risk === 'Low' ? 'bg-green-500' : layer.risk === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                            {layer.risk}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Activation Gate</div>
                          <div className="font-medium">{layer.activationGate}</div>
                        </div>
                        <div className="space-y-1 col-span-2 md:col-span-3">
                          <div className="flex items-center gap-2">
                            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Contract Address</div>
                            {layer.mocked && <StatusBadge status="SIMULATED PROTOTYPE" showTooltip={false} className="scale-90 origin-left" />}
                          </div>
                          {layer.address.startsWith("0x") ? (
                            <div className="font-mono text-xs text-muted-foreground break-all">
                              {layer.address}
                              <span className="block text-[10px] text-muted-foreground/70 italic mt-0.5">Simulated — no canonical address</span>
                            </div>
                          ) : (
                            <div className="font-mono text-xs text-muted-foreground">Not Deployed</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className={`hidden xl:flex w-16 h-16 rounded-full border-4 border-background items-center justify-center z-10 font-bold text-sm tracking-wider ${isFuture ? 'bg-transparent border-dashed text-muted-foreground' : 'bg-primary/20 text-primary'}`}>
                  L{index + 1}
                </div>
                
                <div className="flex-1 w-full" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}