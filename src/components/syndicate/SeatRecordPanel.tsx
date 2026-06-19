// Post-purchase Seat Record panel (pending contract).
// Reads wallet via wagmi; does not block any purchase logic.
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { GlassCard, Pill } from "@/components/syndicate/Primitives";
import { ARCHIVE_DISCLAIMER } from "@/lib/archive-config";
import { ArchiveStatusLegend } from "@/components/syndicate/ArchiveStatusLegend";

export function SeatRecordPanel() {
  const { isConnected } = useAccount();
  return (
    <div id="seat-record">
      <GlassCard className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Pill tone="warning">PENDING SEATRECORD721</Pill>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Target reference price: $0.10 USDC · not chargeable today
          </span>
        </div>
        <div className="mb-3">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            SeatRecord721
          </div>
          <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
            Future optional identity record. Archive1155 is live for memory artifacts; SeatRecord721 is not deployed.
          </p>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {isConnected
            ? "Your wallet is connected. Once the SyndicateSeatRecord721 contract deploys, eligibility for the Seat Record will be derived from your verified Membership Sale purchase — no waitlist, no reservation today."
            : "Connect the wallet you used (or plan to use) for the Membership Sale. Eligibility for the Seat Record will be derived from your verified purchase once the SyndicateSeatRecord721 contract is live."}
        </p>
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground leading-relaxed">
          <li>• Would encode member number, chapter, and block height.</li>
          <li>• One per purchase, optional, never required.</li>
          <li>• Records seat facts only; no financial or control rights.</li>
          <li>• Membership purchase is unaffected and confirmed on-chain today.</li>
        </ul>
        <div className="mt-5 border-t border-border/40 pt-4">
          <ArchiveStatusLegend variant="inline" />
        </div>
        <div className="mt-5 border-t border-border/40 pt-4 flex flex-wrap items-center gap-3">
          <Link
            to="/archive"
            className="mono text-[11px] uppercase tracking-[0.18em] text-[color:oklch(0.5_0.13_75)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            Explore the Archive →
          </Link>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            NFTs are memories, not seats.
          </span>
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
          {ARCHIVE_DISCLAIMER}
        </p>
      </GlassCard>
    </div>
  );
}
