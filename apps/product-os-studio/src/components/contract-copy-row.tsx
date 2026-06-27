import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check, Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type Status } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

// A single contract / protocol layer row. No canonical on-chain address exists in
// this prototype, so we never render or copy a fabricated address. The row shows a
// clear "simulated — no canonical address" state, the copy affordance copies a
// non-address status note only, and the explorer affordance is INERT (no link).
// Renders from MOCK_DATA.contractLayers items.
export interface ContractLayerLike {
  name: string;
  status: string;
  address: string;
  mocked?: boolean;
  purpose?: string;
  risk?: string;
  uiSurface?: string;
}

export function ContractCopyRow({ layer, className }: { layer: ContractLayerLike; className?: string }) {
  const [copied, setCopied] = useState(false);

  const statusNote = `SIMULATED — ${layer.name} has no canonical address in this prototype.`;

  const writeToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fall through to the legacy fallback below
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const copyStatus = async () => {
    const ok = await writeToClipboard(statusNote);
    if (ok) {
      setCopied(true);
      toast.success("Simulated status copied", {
        description: "No real or fabricated address is copied — this is a simulated prototype with no canonical contract.",
      });
      setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border/60 bg-card/40 p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      data-testid={`contract-row-${layer.name}`}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{layer.name}</span>
          <StatusBadge status={layer.status as Status} />
        </div>
        {layer.purpose && <p className="text-sm text-muted-foreground">{layer.purpose}</p>}
        <p className="font-mono text-xs italic text-muted-foreground/70">
          Simulated — no canonical address
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-md border border-border/50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
          title="Explorer links are inert in this simulated prototype"
        >
          <Link2Off className="h-3 w-3" /> Explorer inert
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={copyStatus}
          data-testid={`contract-copy-${layer.name}`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy status
        </Button>
      </div>
    </div>
  );
}
