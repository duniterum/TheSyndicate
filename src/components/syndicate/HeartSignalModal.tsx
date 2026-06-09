// Footer "Heart Signal" — hidden discovery.
// Status: SECRET / PENDING CONTRACT. No fake minting, no fake eligibility.
import { useState } from "react";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pill } from "@/components/syndicate/Primitives";
import { ARCHIVE_DISCLAIMER } from "@/lib/archive-config";
import { fmtAddress } from "@/lib/sale-hooks";

export function HeartSignalTrigger() {
  const [open, setOpen] = useState(false);
  const { address, isConnected } = useAccount();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="The Heart Signal — a hidden archive discovery"
        title="♥"
        className="inline-flex items-center justify-center align-baseline text-[var(--gold)] hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] rounded-sm px-0.5"
      >
        <span aria-hidden="true">♥</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>The Heart Signal</DialogTitle>
            <DialogDescription>
              You found a hidden corner of the Archive. Some artifacts are found, not advertised.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill tone="navy">SECRET</Pill>
            <Pill tone="warning">DISCOVERY ONLY</Pill>
          </div>

          <div className="mt-4 text-sm text-foreground/90 leading-relaxed space-y-3">
            {isConnected ? (
              <>
                <p>
                  Wallet detected:{" "}
                  <span className="mono text-xs">{address ? fmtAddress(address) : "—"}</span>.
                </p>
                <p>
                  The Archive1155 contract is deployed on Avalanche and The First Signal (ID 1)
                  is open for mint. Eligibility for The Heart Signal will be derived from on-chain
                  participation patterns we will not describe in advance. There is no claim,
                  no waitlist, and no allocation today.
                </p>
              </>
            ) : (
              <p>
                Connect a wallet to be remembered as one of the ones who found this early.
                Discovery alone is not eligibility — no claim, no waitlist, and no allocation today.
              </p>
            )}
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Built with love ♥ for the ones who were early.
            </p>
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
            {ARCHIVE_DISCLAIMER}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
