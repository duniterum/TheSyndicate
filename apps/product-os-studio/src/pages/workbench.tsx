import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Hammer, 
  Send, 
  GitBranch, 
  Activity, 
  ArrowRight,
  Layers,
  FileText,
  Wrench,
  CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ActionCard } from "@/components/action-card";
import { getActionsByCategory } from "@/lib/actions";
import { getEventsForClassification, RECOGNITION_PATH } from "@/lib/protocol-graph";
import { useApp } from "@/lib/store";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Workbench() {
  const { isConnected, isSeated, isFounder } = useApp();
  const builderActions = getActionsByCategory("builder");
  const recognitionEvents = getEventsForClassification("recognition");

  const [type, setType] = useState<string>("");
  const [surface, setSurface] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !surface || !desc) {
      toast.error("Please fill out all fields");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate network delay
    setTimeout(() => {
      toast.success("Contribution submitted (simulated) — pending founder review", {
        description: "Nothing is sent anywhere. This is a frontend prototype."
      });
      setType("");
      setSurface("");
      setDesc("");
      setIsSubmitting(false);
    }, 800);
  };

  // Calm, confident maker's workbench styling: 
  // We use subtle blue/slate tints with dashed borders to imply a blueprint or workspace.
  
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-start justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3 text-primary">
            <Hammer className="w-8 h-8" />
            Contributor Workbench
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Propose contributions across the protocol surfaces and follow them toward recognition. 
            Multi-axis standing backed by proof — explicitly not a wealth ladder, not a return.
          </p>
        </div>
        <div className="shrink-0 flex gap-2 items-center">
          <StatusBadge status="PROTOTYPE ONLY" />
        </div>
      </motion.div>

      {/* Blueprint background for the main workbench area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* Form - Takes 7 columns on large screens */}
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-[#0B1221]/80 border-primary/20 shadow-xl shadow-primary/5 h-full relative overflow-hidden backdrop-blur-sm">
            {/* Subtle drafting grid overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <CardHeader className="border-b border-primary/10 bg-primary/5 pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary font-mono text-sm uppercase tracking-wider">
                  <Wrench className="w-4 h-4" />
                  Draft Proposal
                </CardTitle>
                <StatusBadge status="SIMULATED PROTOTYPE" showTooltip={false} />
              </div>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Contribution Axis</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="bg-background/40 border-primary/20 focus:ring-primary/50 transition-all">
                        <SelectValue placeholder="Select axis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="builder">Builder (Code / Docs)</SelectItem>
                        <SelectItem value="connector">Connector (Growth)</SelectItem>
                        <SelectItem value="verifier">Verifier (Testing / Proof)</SelectItem>
                        <SelectItem value="historian">Historian (Archive)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2.5">
                    <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Target Surface</Label>
                    <Select value={surface} onValueChange={setSurface}>
                      <SelectTrigger className="bg-background/40 border-primary/20 focus:ring-primary/50 transition-all">
                        <SelectValue placeholder="Select surface" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membership">Membership Engine</SelectItem>
                        <SelectItem value="economy">Economy / Transparency</SelectItem>
                        <SelectItem value="registry">Protocol Registry</SelectItem>
                        <SelectItem value="toolkit">Syndicate Toolkit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Contribution Record</Label>
                  <Textarea 
                    placeholder="Briefly describe the contribution for the operator log..." 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="min-h-[120px] resize-none bg-background/40 border-primary/20 focus:ring-primary/50 transition-all font-mono text-sm"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                    Simulated entry
                  </p>
                  <Button type="submit" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]" disabled={isSubmitting || !isSeated}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                        Committing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" /> Submit to Ledger
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Path Visualization - Takes 5 columns */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="bg-transparent border border-primary/20 border-dashed h-full">
            <CardHeader className="border-b border-primary/10 border-dashed pb-4">
              <CardTitle className="flex items-center gap-2 text-primary font-mono text-sm uppercase tracking-wider">
                <GitBranch className="w-4 h-4" />
                Path to Recognition
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <p className="text-xs text-muted-foreground font-mono leading-relaxed bg-primary/5 p-3 rounded border border-primary/10">
                A proposal does not become standing automatically. It flows through the protocol graph as a candidate, requiring proof and operator consensus.
              </p>
              
              <div className="space-y-0 pl-2">
                {RECOGNITION_PATH.map((step, index) => (
                  <div key={step.step} className="relative pl-8 pb-5 last:pb-0">
                    {/* Line */}
                    {index !== RECOGNITION_PATH.length - 1 && (
                      <div className="absolute top-6 bottom-0 left-[11px] w-px bg-primary/20 border-l border-dashed border-primary/30" />
                    )}
                    
                    {/* Node */}
                    <div className="absolute top-1 left-0 w-6 h-6 rounded-full bg-background border border-primary flex items-center justify-center z-10 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    
                    <div className="bg-background/40 border border-primary/10 rounded-lg p-3 group hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-foreground/90">{step.step}</span>
                        <Link href={step.surface} className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recognition Candidates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4 pt-4 border-t border-border/40"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Pending Candidates</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mb-4">
          Contributions from the protocol graph currently classified as recognition candidates awaiting founder review.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recognitionEvents.map((evt, idx) => (
            <Card key={evt.id} className="bg-card/40 border-border/60 hover:border-primary/30 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/60 transition-colors" />
              <CardContent className="p-5 flex flex-col h-full pl-6">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">{evt.title}</h4>
                  <Badge variant="outline" className={`text-[10px] uppercase font-mono bg-background/50 shrink-0 ${evt.founderDecision === 'pending' ? 'text-amber-400 border-amber-400/20' : 'text-green-400 border-green-400/20'}`}>
                    {evt.founderDecision}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2" title={evt.origin}>
                  {evt.origin}
                </p>
                <div className="mt-auto pt-3 border-t border-border/40 flex justify-between items-center">
                  <p className="text-[10px] text-muted-foreground leading-relaxed flex-1">
                    {evt.note}
                  </p>
                  <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                    {evt.stage}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {recognitionEvents.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-muted-foreground bg-white/5 rounded-lg border border-white/5 border-dashed">
              No recognition candidates found in the graph.
            </div>
          )}
        </div>
      </motion.div>

      {/* Builder Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="space-y-4 pt-4 border-t border-border/40"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Builder Toolkit</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Protocol actions available to builders and contributors. This represents the actions that can be taken within the workbench.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {builderActions.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      </motion.div>

    </div>
  );
}
