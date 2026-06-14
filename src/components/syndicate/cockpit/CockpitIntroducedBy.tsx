// CockpitIntroducedBy — recognition-only "Introduced by Member #N".
//
// When a visitor arrives via a member's share link (?ref=<memberNumber>,
// captured first-touch in referral-attribution.ts), the cockpit acknowledges
// who introduced them. This is ATTRIBUTION ONLY — recognition, never a reward:
// no commission, payout, or rate change is implied or possible (off-chain,
// browser-local). The attribution is surfaced ONLY once the captured ref
// resolves to a real member in the canonical holder index.

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCockpitHolderIndex } from "@/lib/dev/cockpit-fixtures";
import { getStoredRefNumber } from "@/lib/referral-attribution";
import { fmtAddress } from "@/lib/sale-hooks";

export function CockpitIntroducedBy() {
  const idx = useCockpitHolderIndex();
  const [refNum, setRefNum] = useState<number | null>(null);

  // localStorage is client-only — read after mount to avoid SSR hydration drift.
  useEffect(() => {
    setRefNum(getStoredRefNumber());
  }, []);

  if (refNum == null) return null;
  const referrer = idx.ordered.find((r) => r.founderNumber === refNum);
  if (!referrer) return null; // surface only once it resolves to a real member

  return (
    <div className="px-5 sm:px-6 md:px-8 pb-5">
      <div className="rounded-lg border border-border/50 bg-card/40 px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Introduced by
        </span>
        <Link
          to="/wallet/$address"
          params={{ address: referrer.wallet }}
          className="mono text-sm text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
        >
          Member #{referrer.founderNumber}
        </Link>
        <span className="mono text-[10px] text-muted-foreground">
          {fmtAddress(referrer.wallet)}
        </span>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:ml-auto">
          Attribution only · recognition
        </span>
      </div>
    </div>
  );
}
