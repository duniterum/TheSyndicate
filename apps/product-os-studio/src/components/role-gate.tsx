import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApp } from "@/lib/store";
import { ProductionAuthNote } from "@/components/production-auth-note";
import type { RouteRequirement } from "@/lib/navigation";
import { ShieldAlert, Lock, ArrowRight, Settings as SettingsIcon, Users } from "lucide-react";

// Clean prototype gate shown when a non-founder reaches a founder / operator
// surface (including by typing the URL directly). It does NOT silently redirect —
// it explains the gate and points to legitimate destinations.
export function FounderGate() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 animate-in fade-in duration-500" data-testid="founder-gate">
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">Founder / Operator mode required</h1>
        </div>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          The Founder Console and operator tools are not available to this session. A connected wallet —
          even a seated member — is not an operator. In production, reaching this surface would require a
          wallet signature and server-side verification, not a setting in your browser.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild data-testid="founder-gate-home">
            <Link href="/member/my-syndicate">
              <Users className="h-4 w-4 mr-2" /> Return to My Syndicate
            </Link>
          </Button>
          <Button variant="outline" asChild data-testid="founder-gate-settings">
            <Link href="/member/settings">
              <SettingsIcon className="h-4 w-4 mr-2" /> Go to Settings
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          This is a prototype. A demo role switch is available in Settings under "Prototype / Demo State"
          for demonstration only — it grants no real permissions.
        </p>
      </div>

      <ProductionAuthNote compact />
    </div>
  );
}

// Shown when a connected-but-not-seated wallet reaches a seated-member surface.
// Previews the locked surface and routes to taking a seat.
export function SeatLockedGate() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 animate-in fade-in duration-500" data-testid="seat-locked-gate">
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Seat required</h1>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          Your wallet is connected, but no seat is anchored to it yet. This is a seated-member surface.
          Take your seat to unlock your member home, capital footprint, contribution depth, and the
          full member app.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild data-testid="seat-gate-join">
            <Link href="/member/join">
              Take your seat <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild data-testid="seat-gate-home">
            <Link href="/member">Back to Member Home</Link>
          </Button>
        </div>
        <div className="mt-5 flex justify-center">
          <StatusBadge status="SIMULATED PROTOTYPE" showTooltip={false} />
        </div>
      </div>
    </div>
  );
}

// Render-time guard. Authority is decided here, not at import — the gated
// component is only rendered once the requirement is satisfied.
export function Protected({
  requirement,
  children,
}: {
  requirement: RouteRequirement;
  children: React.ReactNode;
}) {
  const { isSeated, isFounder } = useApp();
  if (requirement === "founder" && !isFounder) return <FounderGate />;
  if (requirement === "seated" && !isSeated) return <SeatLockedGate />;
  return <>{children}</>;
}
