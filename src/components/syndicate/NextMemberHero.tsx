// Loop A — canonical "Next Member #" surface.
//
// Extracted from Hero.tsx per docs/LOOP_OWNERSHIP_DECISION.md (Wave P6).
// Reads the next-member fact from the Protocol Truth Layer; no other
// homepage surface may render a standalone next-member counter.

import { useEffect, useState } from "react";
import { useProtocolTruth } from "@/lib/protocol-truth";

export function NextMemberHero() {
  const truth = useProtocolTruth();
  // Gate dynamic content on a client-only mount flag. Reading on-chain
  // values during SSR produces `undefined`, but the wagmi cache may
  // hydrate synchronously on the client, so the first client render can
  // diverge from the SSR HTML. `suppressHydrationWarning` only suppresses
  // text-level diffs — not structural diffs introduced by swapping which
  // <span>s render. Render the SSR-safe fallback on the first paint,
  // then swap to the live values after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const members = mounted ? truth.members.value : undefined;
  const next = mounted ? truth.nextMemberNumber.value : undefined;

  const membersText =
    members !== undefined
      ? `${members.toLocaleString()} verified ${members === 1 ? "Member" : "Members"} on-chain`
      : "Reading the chain…";
  const nextText = next !== undefined ? `Next: Member #${next}` : "Next member pending";

  return (
    <>
      <div
        className="mt-5 flex flex-wrap items-center gap-2 mono text-[11px] md:text-xs uppercase tracking-[0.16em]"
        suppressHydrationWarning
      >
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
        <span className="text-foreground" suppressHydrationWarning>
          {membersText}
        </span>
        <span className="text-border" aria-hidden>
          ·
        </span>
        <span className="text-[var(--gold)]" suppressHydrationWarning>
          {nextText}
        </span>
      </div>
      <p className="mt-1 text-sm md:text-base text-foreground/85" suppressHydrationWarning>
        {next !== undefined ? (
          <>
            You could be{" "}
            <span className="font-semibold text-foreground">Member #{next}</span> —
            permanently recorded on Avalanche.
          </>
        ) : (
          <>Every member is permanently recorded and verifiable on-chain.</>
        )}
      </p>
    </>
  );
}
