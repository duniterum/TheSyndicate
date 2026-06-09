// CockpitBadges — the real, earned identity badges shown in the seat header.
//
// Strict whitelist (no fabricated status, no XP, no score, no leaderboard):
//   • Chapter            — belonging, derived from the member number.
//   • Founder            — identity fact for the Genesis cohort (member ≤ #333).
//   • First Signal owned — live balanceOf(wallet, 1) > 0 on Archive1155.
//   • Patron Seal owned  — live balanceOf(wallet, 3) > 0 on Archive1155.
//
// A badge only appears when it is actually true. Rank is intentionally NOT a
// badge here — it stays demoted to the quiet "Recognition" line.

import { Pill } from "@/components/syndicate/Primitives";
import { useArchiveBalances } from "@/lib/archive-balances-hook";
import { getChapterByMemberNumber, isFounder } from "@/lib/chapters";
import type { HolderRecord } from "@/lib/holder-index";

export function CockpitBadges({
  record,
  nextMemberNumber,
}: {
  record?: HolderRecord;
  nextMemberNumber: number;
}) {
  const balances = useArchiveBalances([1, 3]);
  const firstSignal = balances.balances[1]?.balance;
  const patronSeal = balances.balances[3]?.balance;
  const ownsFirstSignal = firstSignal !== undefined && firstSignal > 0n;
  const ownsPatronSeal = patronSeal !== undefined && patronSeal > 0n;

  // Connected but no membership record yet — preview only, no personal claims.
  if (!record) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Pill tone="muted">
          Would join {getChapterByMemberNumber(nextMemberNumber).shortLabel}
        </Pill>
      </div>
    );
  }

  const chapter = getChapterByMemberNumber(record.memberNumber);
  const founder = isFounder(record.memberNumber);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <Pill tone="gold">{chapter.shortLabel}</Pill>
      {founder && <Pill tone="gold">Founder · #1–333</Pill>}
      {ownsFirstSignal && <Pill tone="success">First Signal ✓</Pill>}
      {ownsPatronSeal && <Pill tone="success">Patron Seal ✓</Pill>}
    </div>
  );
}
