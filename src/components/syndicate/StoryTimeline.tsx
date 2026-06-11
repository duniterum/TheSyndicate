// Canonical Story Timeline.
//
// One ordered timeline of the protocol's episodes, derived strictly from
// canonical truth:
//
//   • Episode order = PROTOCOL_MILESTONES order (the canonical doctrine,
//     not the recency of on-chain events).
//   • Status per episode = evaluateMilestones() against live pulse +
//     mint flags.
//   • Each row shows EXACTLY ONE verification link, scoped to the
//     contract whose state confirms the episode:
//       – members/usdc → Membership Sale (or the sealing purchase tx
//         when we can find it in the unified event stream).
//       – first-mint  → the actual mint tx if indexed, else the
//         Archive1155 contract.
//
// No invented dates, no fabricated chapters — every label is canonical
// or empty. When the indexer is catching up, the freshness badge in the
// header signals the verified block height.

import { useMemo } from "react";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { useProtocolEvents } from "@/lib/protocol-events";
import { useProtocolTruth } from "@/lib/protocol-truth";
import {
  PROTOCOL_MILESTONES,
  evaluateMilestones,
  milestonePresentation,
  type MilestoneStatus,
} from "@/lib/activity-milestones";
import { txExplorerUrl, ARCHIVE_NFT_EXPLORERS } from "@/lib/syndicate-config";
import { GlassCard, Section, SectionHeader, Pill } from "./Primitives";
import { VerifiedUpToBadge } from "./VerifiedUpToBadge";
import { ProofChip } from "./ProofChip";

type Row = {
  status: MilestoneStatus;
  proofKind: "tx" | "document";
  proofValue: string;
  proofHref: string;
  proofLabel: string;
};

export function StoryTimeline() {
  const truth = useProtocolTruth();
  const pulse = useProtocolPulse();
  const { events } = useProtocolEvents({ limit: 200 });

  const mintFlags = useMemo(
    () => ({
      firstSignal: events.some((e) => e.kind === "nft-mint-first-signal"),
      patronSeal: events.some((e) => e.kind === "nft-mint-patron-seal"),
    }),
    [events],
  );

  const firstSignalTx = useMemo(
    () => events.filter((e) => e.kind === "nft-mint-first-signal").slice(-1)[0]?.txHash,
    [events],
  );
  const patronSealTx = useMemo(
    () => events.filter((e) => e.kind === "nft-mint-patron-seal").slice(-1)[0]?.txHash,
    [events],
  );

  const statuses = evaluateMilestones({
    buyers: pulse.buyers,
    usdcRaised: pulse.usdcRaised,
    firstSignalMinted: mintFlags.firstSignal,
    patronSealMinted: mintFlags.patronSeal,
  });

  // Map each canonical milestone to a single verification anchor.
  const rows: Row[] = statuses.map((s) => {
    const m = s.milestone;
    if (m.kind === "first-mint") {
      const tx = m.id === "first-signal-mint" ? firstSignalTx : patronSealTx;
      if (tx) {
        return {
          status: s,
          proofKind: "tx",
          proofValue: tx,
          proofHref: txExplorerUrl(tx) ?? ARCHIVE_NFT_EXPLORERS.avascan,
          proofLabel: "Verify mint",
        };
      }
      return {
        status: s,
        proofKind: "document",
        proofValue: ARCHIVE_NFT_EXPLORERS.avascan,
        proofHref: ARCHIVE_NFT_EXPLORERS.avascan,
        proofLabel: "Archive contract",
      };
    }
    // members + usdc → Membership Sale contract is the canonical witness.
    const href = truth.members.verifyHref ?? truth.usdcRaised.verifyHref ?? "";
    return {
      status: s,
      proofKind: "document",
      proofValue: href,
      proofHref: href,
      proofLabel: "Verify on contract",
    };
  });

  return (
    <Section id="story-timeline">
      <SectionHeader
        eyebrow="The Story So Far · Timeline"
        title={<>Episodes the protocol has <span className="text-gradient-gold">sealed on-chain</span></>}
        description="One ordered list of every canonical milestone. Order is doctrine, not recency. Each row has a single verification link — the exact on-chain proof for that episode."
      />
      <div className="mb-4">
        <VerifiedUpToBadge />
      </div>
      <GlassCard className="p-0 overflow-hidden">
        <ol className="divide-y divide-border/40">
          {rows.map(({ status: s, proofKind, proofValue, proofHref, proofLabel }, i) => {
            const m = s.milestone;
            const pres = milestonePresentation(s);
            return (
              <li
                key={m.id}
                className="grid grid-cols-[36px,1fr,auto] gap-3 items-center px-4 py-3 md:px-5 md:py-4"
              >
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm md:text-base font-medium text-foreground truncate">
                      {s.reached ? "✓ " : ""}{m.label}
                    </span>
                    <Pill
                      tone={
                        pres.state === "SEALED"
                          ? "success"
                          : pres.state === "IN_PROGRESS"
                            ? "warning"
                            : pres.state === "AWAITING_FIRST_MINT"
                              ? "navy"
                              : "muted"
                      }
                    >
                      {pres.label}
                    </Pill>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground truncate">
                    {m.description}
                    {!s.reached && pres.showProgress && s.remaining !== undefined && (
                      <> · {s.remaining.toLocaleString("en-US")} to seal</>
                    )}
                  </div>
                </div>
                <div className="justify-self-end">
                  <ProofChip
                    kind={proofKind}
                    value={proofValue}
                    href={proofHref}
                    label={proofLabel}
                    description={`Proof for: ${m.label}.`}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </GlassCard>
    </Section>
  );
}
