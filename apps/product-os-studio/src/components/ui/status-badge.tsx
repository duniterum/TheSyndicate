import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export type Status = 
  | "LIVE NOW"
  | "LIVE READ"
  | "READ-ONLY"
  | "READ-ONLY PRODUCTION PROOF"
  | "PAUSED"
  | "IN REVIEW"
  | "V1 CANDIDATE"
  | "V2 CANDIDATE"
  | "FUTURE"
  | "NOT LIVE"
  | "BLOCKED NOW"
  | "SIMULATED PROTOTYPE"
  | "PROTOTYPE ONLY"
  | "PROTOTYPE PLACEHOLDER"
  | "PROTOTYPE WALLET STATE"
  | "CONCEPT ONLY"
  | "STATIC PREVIEW"
  | "BACKEND REQUIRED"
  | "ADAPTER REQUIRED"
  | "NOT WIRED"
  | "EXTERNAL"
  | "MEMBER-ONLY"
  | "FOUNDER-ONLY"
  | "NOT PRODUCTION AUTH";

const STATUS_TOOLTIPS: Partial<Record<Status, string>> = {
  "FUTURE": "Planned module, not yet built.",
  "IN REVIEW": "Under internal founder/operator review.",
  "V1 CANDIDATE": "Scoped prototype, not live today.",
  "V2 CANDIDATE": "Future evolution, not live today.",
  "BLOCKED NOW": "Temporarily blocked by dependencies.",
  "SIMULATED PROTOTYPE": "UI demonstration only, no contract logic.",
  "PROTOTYPE ONLY": "Prototype interface — no live data or transactions.",
  "CONCEPT ONLY": "Concept preview — not built yet.",
  "STATIC PREVIEW": "Static asset preview — no dynamic generation.",
  "BACKEND REQUIRED": "Needs a backend service to become real.",
  "READ-ONLY PRODUCTION PROOF": "Read-only reference to production-backed proof. No writes.",
  "PAUSED": "Deployed in production but paused — not active today.",
  "PROTOTYPE PLACEHOLDER": "Placeholder value for demonstration — not a canonical production value.",
  "PROTOTYPE WALLET STATE": "Simulated wallet/connection state — not a real wallet.",
  "ADAPTER REQUIRED": "Needs a Codex production adapter before it can be real.",
  "NOT WIRED": "No live interaction is wired in the Studio.",
  "LIVE READ": "Live, read-only value read through the connected wallet's own provider. No writes, no transactions.",
  "NOT LIVE": "Not active today. Shown for completeness — no live data or execution.",
  "EXTERNAL": "Opens a canonical third-party tool in a new tab. Not part of the Studio.",
  "MEMBER-ONLY": "Member surface in the prototype role demo — simulated gating, not production auth.",
  "FOUNDER-ONLY": "Founder / operator surface — simulated gating, not production authentication.",
  "NOT PRODUCTION AUTH": "Frontend role/connection is not production authority or security."
};

export function StatusBadge({ status, className, showTooltip = true }: { status: Status; className?: string; showTooltip?: boolean }) {
  const styles: Record<Status, string> = {
    "LIVE NOW": "bg-green-500/10 text-green-500 border-green-500/20",
    "READ-ONLY": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "READ-ONLY PRODUCTION PROOF": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "PAUSED": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "IN REVIEW": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "V1 CANDIDATE": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "V2 CANDIDATE": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "FUTURE": "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
    "BLOCKED NOW": "bg-red-500/10 text-red-500 border-red-500/20",
    "SIMULATED PROTOTYPE": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "PROTOTYPE ONLY": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "PROTOTYPE PLACEHOLDER": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "PROTOTYPE WALLET STATE": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "CONCEPT ONLY": "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
    "STATIC PREVIEW": "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
    "BACKEND REQUIRED": "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
    "ADAPTER REQUIRED": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "NOT WIRED": "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    "LIVE READ": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "NOT LIVE": "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    "EXTERNAL": "bg-violet-500/10 text-violet-400 border-violet-500/20",
    "MEMBER-ONLY": "bg-sky-500/10 text-sky-400 border-sky-500/20",
    "FOUNDER-ONLY": "bg-red-500/10 text-red-400 border-red-500/20",
    "NOT PRODUCTION AUTH": "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const badge = (
    <Badge variant="outline" className={cn("font-mono text-[10px] tracking-wider uppercase whitespace-nowrap", styles[status], className)}>
      {status}
    </Badge>
  );

  const tooltipText = STATUS_TOOLTIPS[status];

  if (showTooltip && tooltipText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-help" tabIndex={0}>
              {badge}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-popover border-popover-border text-popover-foreground">
            <p className="text-xs">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
