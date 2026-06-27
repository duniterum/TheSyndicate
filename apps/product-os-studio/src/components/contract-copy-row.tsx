import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check, Link2Off, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type Status } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

// A single contract / protocol layer row. Renders from MOCK_DATA.contractLayers items.
//
// Two modes, decided by `proof`:
// - READ-ONLY PRODUCTION PROOF (proof === true + a real 0x… address): the canonical address
//   is shown and copyable, with a read-only explorer link. This is a static reference copied
//   from the porting map — copying or following it never wires a contract (a live read/write
//   is ADAPTER REQUIRED).
// - PROTOTYPE / FUTURE (no proof): there is no canonical address, so the row shows a clear
//   "simulated — no canonical address" state, the copy affordance copies a non-address status
//   note only, and the explorer affordance is INERT (no link).
export interface ContractLayerLike {
  name: string;
  status: string;
  address: string;
  explorerUrl?: string;
  proof?: boolean;
  mocked?: boolean;
  purpose?: string;
  risk?: string;
  uiSurface?: string;
}

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ContractCopyRow({ layer, className }: { layer: ContractLayerLike; className?: string }) {
  const [copied, setCopied] = useState(false);

  const isProof = layer.proof === true && ADDRESS_RE.test(layer.address);
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

  const copyProofAddress = async () => {
    const ok = await writeToClipboard(layer.address);
    if (ok) {
      setCopied(true);
      toast.success("Address copied", {
        description: "Read-only production proof — copying the canonical address does not wire any contract.",
      });
      setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error("Could not copy to clipboard");
    }
  };

  const copyStatus = async () => {
    const ok = await writeToClipboard(statusNote);
    if (ok) {
      setCopied(true);
      toast.success("Simulated status copied", {
        description: "No real or fabricated address is copied — this layer is a future concept not in the porting map, so it has no canonical address.",
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
        {isProof ? (
          <p className="font-mono text-xs text-muted-foreground" title={layer.address}>
            <span className="select-all">{shortAddress(layer.address)}</span>
            <span className="ml-2 not-italic uppercase tracking-wider text-[10px] text-emerald-500/80">
              Read-only production proof
            </span>
          </p>
        ) : (
          <p className="font-mono text-xs italic text-muted-foreground/70">
            Simulated — no canonical address
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isProof ? (
          <>
            <a
              href={layer.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border/50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-border"
              title="Opens the read-only explorer in a new tab. Reference only — nothing is wired."
              data-testid={`contract-explorer-${layer.name}`}
            >
              <ExternalLink className="h-3 w-3" /> Read-only explorer
            </a>
            <Button
              size="sm"
              variant="outline"
              onClick={copyProofAddress}
              data-testid={`contract-copy-${layer.name}`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy address
            </Button>
          </>
        ) : (
          <>
            <span
              className="inline-flex items-center gap-1 rounded-md border border-border/50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              title="Explorer links are inert for this simulated layer"
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
          </>
        )}
      </div>
    </div>
  );
}
