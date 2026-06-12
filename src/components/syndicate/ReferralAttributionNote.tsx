import { useAccount } from "wagmi";
import { useHolderIndex } from "@/lib/holder-index";
import {
  getStoredRefNumber,
  REFERRAL_ATTRIBUTION_NOTE,
} from "@/lib/referral-attribution";

/**
 * ReferralAttributionNote — shows "Brought by Member #N" ONLY when a stored
 * `?ref` attribution resolves to a real member in the canonical holder index.
 *
 * Attribution-only by contract: no reward, no commission, no payout language.
 * If nothing is stored, or the referrer number does not resolve to an indexed
 * member, this renders nothing (we never display an unverified attribution).
 */
export function ReferralAttributionNote({ className = "" }: { className?: string }) {
  const idx = useHolderIndex();
  const { address } = useAccount();
  const refNumber = getStoredRefNumber();

  if (refNumber == null) return null;
  // Only display once the index has data AND the referrer resolves to a member.
  if (!idx.hasData) return null;
  const resolved = idx.ordered.some((r) => r.founderNumber === refNumber);
  if (!resolved) return null;
  // Suppress self-referral: never tell a member they were "brought by" themselves.
  const ownNumber = idx.getByWallet(address)?.founderNumber ?? null;
  if (ownNumber != null && ownNumber === refNumber) return null;

  return (
    <div
      className={`rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Attribution
        </span>
        <span className="text-sm font-semibold">
          Brought by{" "}
          <span className="text-gradient-gold">Member #{refNumber}</span>
        </span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
        {REFERRAL_ATTRIBUTION_NOTE}
      </p>
    </div>
  );
}
