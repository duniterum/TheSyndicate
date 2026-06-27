import { motion } from "framer-motion";
import { useApp } from "@/lib/store";
import { getVisibleCategories, type RoleState } from "@/lib/actions";
import { ActionCategorySection } from "@/components/action-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PublicProofNote, ConnectForPersonalCta } from "@/components/connect-cta";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Eye, Shield, Key, AlertTriangle, Info } from "lucide-react";

export default function PublicToolkit() {
  const { isConnected, isSeated, isFounder } = useApp();
  const role: RoleState = { isConnected, isSeated, isFounder };
  const categories = getVisibleCategories(role);

  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl space-y-12" data-testid="page-public-toolkit">
      {/* Header */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Syndicate Toolkit</h1>
            <StatusBadge status="READ-ONLY" />
          </div>
        </div>
        <PublicProofNote surfaceId="toolkit" />
        <p className="text-muted-foreground text-lg max-w-2xl">
          Every protocol action in one place — tools, proof surfaces, and roadmap concepts. 
          See what exists and what proof it produces before you ever connect a wallet. 
        </p>

        {/* Prototype posture */}
        <div className="p-4 border border-blue-500/20 bg-blue-500/10 rounded-xl text-sm flex gap-3 items-start max-w-3xl">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-400 mb-1">Simulated Prototype Truth</p>
            <p className="text-muted-foreground">
              All tools here are simulated. External tools (DEX, liquidity) are not wired and carry market risk. 
              Burn (Proof of Fire) is a costly signal, never a price promise or yield. Connecting and routing are simulated.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Visibility Model */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold">Action Visibility & Role Logic</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Eye className="w-4 h-4 text-blue-400" /> Public Proof
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Visible to everyone. Read-only verification of protocol-level actions without connecting.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Key className="w-4 h-4 text-green-400" /> Connected
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Requires wallet. General tools, external previews, and taking a seat.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Shield className="w-4 h-4 text-purple-400" /> Seated
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Member-personal actions, anchoring memory, and proposing contributions.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Shield className="w-4 h-4 text-red-400" /> Founder
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Operator control. Reviewing candidates before they become canon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Toolkit Registry */}
      <motion.div
        className="space-y-12 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {categories.map(({ def, actions }) => (
          <ActionCategorySection key={def.id} def={def} actions={actions} />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <ConnectForPersonalCta surfaceId="toolkit" />
      </motion.div>
    </div>
  );
}
