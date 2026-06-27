import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  Lock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Ban,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { ShareDialog } from "@/components/share-dialog";
import { ExternalLinkWarning } from "@/components/external-link-warning";
import { useApp } from "@/lib/store";
import { getSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";
import {
  type ProtocolAction,
  type RoleState,
  type ActionCategoryDef,
  canAccessAction,
  actionLockReason,
} from "@/lib/actions";

// ActionCard renders ONE registry action with the correct affordance for its
// type, its truth/status labels, and role-aware locking. Pages never re-implement
// this — they pass the registry entry and the card resolves access from the live
// role in the store, so gating can't drift between surfaces.
export function ActionCard({ action, className }: { action: ProtocolAction; className?: string }) {
  const { isConnected, isSeated, isFounder, connect } = useApp();
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);

  const role: RoleState = { isConnected, isSeated, isFounder };
  const accessible = canAccessAction(action, role);
  const lockReason = actionLockReason(action);
  const Icon = action.icon;

  const surface = action.relatedSurfaceId ? getSurface(action.relatedSurfaceId) : undefined;

  const copyValue = async () => {
    if (!action.copyValue) return;
    try {
      await navigator.clipboard.writeText(action.copyValue);
      setCopied(true);
      toast.success("Copied (simulated)", {
        description: "Mocked prototype value — not a live contract. Verify the real address from an official channel.",
      });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const walletPreview = () => {
    toast.info("Simulated token preview", {
      description:
        "SYN · 18 decimals · accounting unit (not a financial right). No wallet call is made — the address is mocked in this prototype.",
    });
  };

  const connectThen = () => {
    connect();
    toast.success("Wallet connected (simulated)");
    if (action.actionType === "internal-route" && action.href) navigate(action.href);
  };

  // ---- Affordance (the action button) ----
  function Affordance() {
    // Locked for this role.
    if (!accessible) {
      if (action.visibility === "connected" && !isConnected) {
        return (
          <Button size="sm" onClick={connectThen} data-testid={`action-connect-${action.id}`}>
            <Lock className="h-4 w-4" /> Connect to use
          </Button>
        );
      }
      if (action.visibility === "seated") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" disabled>
              <Lock className="h-4 w-4" /> {lockReason}
            </Button>
            {!isConnected ? (
              <Button size="sm" variant="ghost" onClick={connectThen}>
                Connect
              </Button>
            ) : (
              <Button asChild size="sm" variant="ghost">
                <Link href="/member/join">Take a seat</Link>
              </Button>
            )}
          </div>
        );
      }
      return (
        <Button size="sm" variant="outline" disabled>
          <ShieldAlert className="h-4 w-4" /> {lockReason}
        </Button>
      );
    }

    // Accessible but intentionally disabled (e.g. not wired / future).
    if (action.disabledReason && action.actionType !== "wallet-action") {
      return (
        <Button size="sm" variant="outline" disabled data-testid={`action-disabled-${action.id}`}>
          <Ban className="h-4 w-4" /> Not available
        </Button>
      );
    }

    switch (action.actionType) {
      case "internal-route":
        return (
          <Button asChild size="sm" data-testid={`action-route-${action.id}`}>
            <Link href={action.href ?? "#"}>
              Open <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        );
      case "external-link":
        return action.externalUrl ? (
          <ExternalLinkWarning
            url={action.externalUrl}
            title={action.title}
            warning={action.externalWarning ?? "This external tool carries market risk. Nothing here is a promised return."}
            trigger={
              <Button size="sm" variant="outline" data-testid={`action-external-${action.id}`}>
                Open external <ExternalLink className="h-4 w-4" />
              </Button>
            }
          />
        ) : (
          <Button size="sm" variant="outline" disabled>
            <Ban className="h-4 w-4" /> Not wired
          </Button>
        );
      case "wallet-action":
        return (
          <Button size="sm" variant="outline" onClick={walletPreview} data-testid={`action-wallet-${action.id}`}>
            Preview (simulated)
          </Button>
        );
      case "copy":
        return (
          <Button size="sm" variant="outline" onClick={copyValue} data-testid={`action-copy-${action.id}`}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
          </Button>
        );
      case "share":
        return action.sharePayload ? (
          <ShareDialog
            payload={action.sharePayload}
            trigger={
              <Button size="sm" variant="outline" data-testid={`action-share-${action.id}`}>
                Share card
              </Button>
            }
          />
        ) : (
          <Button size="sm" variant="outline" disabled>
            Unavailable
          </Button>
        );
      case "modal-preview":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.info(action.title, { description: action.sourceTruth })}
            data-testid={`action-preview-${action.id}`}
          >
            Preview
          </Button>
        );
      case "future":
        return (
          <Button size="sm" variant="outline" disabled data-testid={`action-future-${action.id}`}>
            <Ban className="h-4 w-4" /> Not yet available
          </Button>
        );
      default:
        return null;
    }
  }

  return (
    <Card
      className={cn("flex h-full flex-col border-border/60 bg-card/40", !accessible && "opacity-95", className)}
      data-testid={`action-card-${action.id}`}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md border border-border/60 bg-background/60 text-foreground/80">
              <Icon className="h-4 w-4" />
            </span>
            <h4 className="font-medium leading-tight">{action.title}</h4>
          </div>
          <StatusBadge status={action.displayStatus} />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{action.description}</p>

        {action.safetyLabels && action.safetyLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {action.safetyLabels.map((label) => (
              <Badge key={label} variant="secondary" className="text-[10px] font-normal">
                {label}
              </Badge>
            ))}
          </div>
        )}

        {(action.proofOutput || action.graphOutput) && (
          <div className="space-y-1 rounded-md border border-border/40 bg-background/40 p-2.5 text-xs">
            {action.proofOutput && (
              <p className="text-foreground/80">
                <span className="text-muted-foreground">Proof: </span>
                {action.proofOutput}
              </p>
            )}
            {action.graphOutput && <p className="font-mono text-[10px] text-muted-foreground">{action.graphOutput}</p>}
          </div>
        )}

        {(action.disabledReason || (!accessible && lockReason)) && (
          <p className="text-xs text-amber-400/80">{action.disabledReason ?? lockReason}</p>
        )}

        <p className="mt-auto border-t border-border/40 pt-2.5 text-[11px] leading-relaxed text-muted-foreground">
          {action.sourceTruth}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <Affordance />
          {surface && (
            <Link
              href={surface.publicPath}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              data-testid={`action-proof-link-${action.id}`}
            >
              See the proof
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// A category band: header (icon, label, description) + responsive grid of cards.
// Pages compose these in ACTION_CATEGORIES order to build the toolkit dashboard.
export function ActionCategorySection({
  def,
  actions,
  className,
}: {
  def: ActionCategoryDef;
  actions: ProtocolAction[];
  className?: string;
}) {
  if (actions.length === 0) return null;
  const Icon = def.icon;
  return (
    <section className={cn("space-y-4", className)} data-testid={`action-category-${def.id}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-border/60 bg-card/40 text-foreground/80">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{def.label}</h3>
          <p className="text-sm text-muted-foreground">{def.description}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </div>
    </section>
  );
}
