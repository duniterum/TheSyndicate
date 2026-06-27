import { useApp } from "@/lib/store";
import { getActionsForRole, getVisibleCategories, type RoleState } from "@/lib/actions";
import { ActionCategorySection, ActionCard } from "@/components/action-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User, Shield, Zap } from "lucide-react";

export default function Toolkit() {
  const { isConnected, isSeated, isFounder } = useApp();
  const role: RoleState = { isConnected, isSeated, isFounder };

  const activeRoleLabel = isFounder ? "Founder / Operator" : isSeated ? "Seated Member" : "Connected (No Seat)";
  const RoleIcon = isFounder ? Shield : isSeated ? ShieldCheck : User;

  const quickActions = getActionsForRole(role).filter(a => a.tier === "primary");
  const visibleCategories = getVisibleCategories(role);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto" data-testid="page-member-toolkit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Action Center & Toolkit</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Your operating command center. Every protocol action in one place — fully role-aware, labeled for truth, and ready to use.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge variant="outline" className="px-3 py-1.5 flex items-center gap-2 border-primary/30 bg-primary/5 text-primary">
            <RoleIcon className="w-4 h-4" />
            <span className="font-medium tracking-wide">{activeRoleLabel}</span>
          </Badge>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-mono whitespace-nowrap">
            Prototype surface · each module labeled below
          </span>
        </div>
      </div>

      {/* Quick Actions (Primary Tier) */}
      {quickActions.length > 0 && (
        <Card className="bg-white/5 border-white/10 overflow-hidden">
          <div className="bg-primary/5 border-b border-white/5 px-6 py-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Available Actions</h2>
          </div>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map(action => (
                <ActionCard key={`quick-${action.id}`} action={action} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-12 pt-4">
        {visibleCategories.map(({ def, actions }) => (
          <ActionCategorySection key={def.id} def={def} actions={actions} />
        ))}
      </div>
    </div>
  );
}
