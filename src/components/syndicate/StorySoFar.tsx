// Story So Far — Zone 3.
// Compact wrapper that surfaces existing components in story order:
// past (milestones + early chapters) → present (events teaser) → future (coming next).
// No new data, just placement.

import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { GlassCard, Section, SectionHeader, StatusPill } from "./Primitives";
import { useProtocolTruth } from "@/lib/protocol-truth";

export function StorySoFar() {
  const truth = useProtocolTruth();
  const cp = truth.chapterProgress.value;
  const members = truth.members.value;
  const next = truth.nextMemberNumber.value;
  return (
    <Section id="story-so-far">
      <SectionHeader
        eyebrow="The Story So Far"
        title={<>The protocol is <span className="text-gradient-gold">forming in public</span></>}
        description="A short read of the live story: what is open now, where the archive stands, and what changes with the next member. Deep feeds live on their own routes."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StoryCard label="Live now" title="Membership Sale is open" status="LIVE">
          SYN, the Membership Sale, routing wallets, and the SYN/USDC pool are live on Avalanche.
        </StoryCard>
        <StoryCard label="Archive" title={members !== undefined ? `${members} member${members === 1 ? "" : "s"} recorded` : "Reading members"} status={truth.members.status}>
          Member numbers and chapters are derived from on-chain purchase history, not editorial selection.
        </StoryCard>
        <StoryCard label="Coming next" title={next !== undefined ? `Member #${next}` : "Next member pending"} status={truth.nextMemberNumber.status}>
          {cp
            ? `${cp.remaining} seat${cp.remaining === 1 ? "" : "s"} remain before ${cp.label} closes.`
            : "The next purchase becomes the next public archive entry."}
        </StoryCard>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 mono text-[10px] uppercase tracking-[0.18em]">
        <Link
          to="/chronicle"
          className="text-[var(--gold)] hover:text-foreground underline-offset-4 hover:underline"
        >
          Read the Chronicle →
        </Link>
        <Link
          to="/activity"
          className="text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
        >
          Full activity →
        </Link>
        <Link
          to="/chapters"
          className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Chapter archive →
        </Link>
      </div>
    </Section>
  );
}

function StoryCard({
  label,
  title,
  status,
  children,
}: {
  label: string;
  title: string;
  status: "LIVE" | "PARTIAL" | "PENDING";
  children: ReactNode;
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </div>
        <StatusPill status={status} />
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{children}</p>
    </GlassCard>
  );
}
